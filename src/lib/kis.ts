/**
 * 한국투자증권 OpenAPI 클라이언트 — 장중 분단위 시세 조회.
 *
 *   목적: data.go.kr (일별 마감 데이터 only) 의 stale 한계를 해소.
 *   사용처: /api/etf/realtime route handler (메인페이지 시세 위젯·종목 사전 hero).
 *
 *   키 없으면 자동 mock 모드 — 빌드 깨지지 않게 + 개발 환경 그대로 작동.
 *   키 있으면 실제 한투 API 호출 + access_token 자동 발급/갱신.
 *
 *   ⚠️ 보안: KIS_APP_KEY · KIS_APP_SECRET 절대 코드/로그/commit 노출 X.
 *           모든 호출은 서버사이드 (Route Handler) 에서만. 클라이언트 fetch X.
 *
 *   ⚠️ Rate limit: 한투 시세 endpoint 분당 ~20호출. edge 캐시로 흡수.
 *
 *   계좌 안전: 시세 조회만 사용. 매매 권한은 별도 신청 필요 (본 코드 미포함).
 */

// ── 환경 ─────────────────────────────────────────────────────────────────
const KIS_BASE = 'https://openapi.koreainvestment.com:9443';
const KIS_BASE_SANDBOX = 'https://openapivts.koreainvestment.com:29443'; // 모의투자

function getMode(): 'production' | 'sandbox' | 'mock' {
  const m = process.env.KIS_MODE;
  if (m === 'sandbox') return 'sandbox';
  if (m === 'mock') return 'mock';
  if (!process.env.KIS_APP_KEY || !process.env.KIS_APP_SECRET) return 'mock';
  return 'production';
}

function getBaseUrl(): string {
  return getMode() === 'sandbox' ? KIS_BASE_SANDBOX : KIS_BASE;
}

// ── 토큰 캐시 (24h 만료, 만료 30분 전 자동 갱신) ──────────────────────────
// Cloudflare Workers 환경에서는 모듈 globals 가 isolate 단위 캐시.
// 더 안정적인 캐시는 Cloudflare KV/Cache API 사용 (Phase 2 보강).
interface TokenCache {
  token: string;
  expiresAt: number; // epoch ms
}
let tokenCache: TokenCache | null = null;

async function getAccessToken(): Promise<string | null> {
  if (getMode() === 'mock') return null;

  // 만료 30분 전부터 재발급
  if (tokenCache && tokenCache.expiresAt - Date.now() > 30 * 60 * 1000) {
    return tokenCache.token;
  }

  try {
    const res = await fetch(`${getBaseUrl()}/oauth2/tokenP`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        appkey: process.env.KIS_APP_KEY,
        appsecret: process.env.KIS_APP_SECRET,
      }),
    });
    if (!res.ok) {
      console.warn(`[kis] token 발급 실패 ${res.status} — mock fallback`);
      return null;
    }
    const json = await res.json() as { access_token: string; expires_in: number };
    tokenCache = {
      token: json.access_token,
      expiresAt: Date.now() + (json.expires_in || 86400) * 1000,
    };
    return json.access_token;
  } catch (err) {
    console.warn(`[kis] token 발급 예외 — mock fallback`, err);
    return null;
  }
}

// ── 시장 상태 판단 (KST 기준) ────────────────────────────────────────────
export type MarketStatus = 'pre_open' | 'open' | 'closed' | 'holiday';

export function getMarketStatus(now: Date = new Date()): MarketStatus {
  // KST 변환
  const kst = new Date(now.getTime() + 9 * 3600 * 1000);
  const day = kst.getUTCDay(); // 0=일, 6=토
  if (day === 0 || day === 6) return 'holiday';
  const minutes = kst.getUTCHours() * 60 + kst.getUTCMinutes();
  // 정규장: 09:00 ~ 15:30 KST
  if (minutes < 9 * 60) return 'pre_open';
  if (minutes < 15 * 60 + 30) return 'open';
  return 'closed';
  // 공휴일은 별도 캘린더 필요 — 추후 KRX 영업일 API 통합
}

// ── ETF 현재가 조회 ──────────────────────────────────────────────────────
export interface KisQuote {
  code: string;             // 단축코드 (예: '069500')
  name?: string;
  price: number;            // 현재가
  change: number;           // 전일대비
  changeRate: number;       // 등락률 %
  volume: number;           // 거래량
  tradeAmount?: number;     // 거래대금
  high?: number;
  low?: number;
  open?: number;
  prevClose?: number;
  timestamp: number;        // epoch ms (응답 시각)
  source: 'kis' | 'mock';
}

/**
 * 종목 1개 현재가 조회.
 *   - 성공: KisQuote
 *   - 실패/mock: null 반환 (호출자가 data.go.kr 폴백 처리)
 */
export async function fetchKisQuote(code: string): Promise<KisQuote | null> {
  if (getMode() === 'mock') return null;

  const token = await getAccessToken();
  if (!token) return null;

  try {
    const url = new URL(`${getBaseUrl()}/uapi/domestic-stock/v1/quotations/inquire-price`);
    url.searchParams.set('FID_COND_MRKT_DIV_CODE', 'J');
    url.searchParams.set('FID_INPUT_ISCD', code);

    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`,
        appkey: process.env.KIS_APP_KEY!,
        appsecret: process.env.KIS_APP_SECRET!,
        tr_id: 'FHKST01010100', // 주식현재가 시세
      },
    });

    if (!res.ok) {
      console.warn(`[kis] ${code} quote 실패 ${res.status}`);
      return null;
    }

    const json = await res.json() as { output?: Record<string, string>; rt_cd?: string; msg1?: string };
    if (json.rt_cd !== '0' || !json.output) {
      console.warn(`[kis] ${code} response error: ${json.msg1}`);
      return null;
    }

    const o = json.output;
    return {
      code,
      name: o.hts_kor_isnm,
      price: Number(o.stck_prpr) || 0,
      change: Number(o.prdy_vrss) || 0,
      changeRate: Number(o.prdy_ctrt) || 0,
      volume: Number(o.acml_vol) || 0,
      tradeAmount: Number(o.acml_tr_pbmn) || 0,
      high: Number(o.stck_hgpr) || 0,
      low: Number(o.stck_lwpr) || 0,
      open: Number(o.stck_oprc) || 0,
      prevClose: Number(o.stck_sdpr) || 0,
      timestamp: Date.now(),
      source: 'kis',
    };
  } catch (err) {
    console.warn(`[kis] ${code} 호출 예외`, err);
    return null;
  }
}

// ── 다수 종목 동시 조회 (rate limit 친화 throttle) ───────────────────────
/**
 * 종목 N개를 200ms 간격으로 직렬 조회 (분당 한도 회피).
 *   - 메인페이지 거래량 TOP10 = 10종목 × 200ms = 2초
 *   - 실패한 종목은 null 로 표시 (호출자가 폴백)
 */
export async function fetchKisQuotes(codes: string[]): Promise<Array<KisQuote | null>> {
  const out: Array<KisQuote | null> = [];
  for (let i = 0; i < codes.length; i++) {
    out.push(await fetchKisQuote(codes[i]));
    if (i < codes.length - 1) {
      await new Promise(r => setTimeout(r, 200));
    }
  }
  return out;
}

// ── 헬퍼: KIS 가용 여부 확인 (Route Handler 분기용) ──────────────────────
export function isKisAvailable(): boolean {
  return getMode() !== 'mock';
}

export function getKisMode(): ReturnType<typeof getMode> {
  return getMode();
}
