/**
 * 한국투자증권 OpenAPI 클라이언트 — 장중 분단위 시세 조회.
 *
 *   목적: data.go.kr (일별 마감 데이터 only) 의 stale 한계를 해소.
 *   사용처: /api/etf/realtime route handler (메인페이지 시세 위젯·종목 사전 hero).
 *
 *   ⚠️ 보안: KIS_APP_KEY · KIS_APP_SECRET 절대 코드/로그/commit 노출 X.
 *           모든 호출은 서버사이드 (Route Handler) 에서만. 클라이언트 fetch X.
 *
 *   ⚠️ Rate limit: 한투 시세 endpoint 분당 ~20호출. edge 캐시로 흡수.
 *
 *   ⚠️ 토큰 1일 1회 발급 원칙 (한투 알림):
 *     - access_token 은 발급 후 24h 유효.
 *     - 24h 안에 잦은 재발급 시 이용 제한.
 *     - 해결: Cloudflare KV namespace (KIS_TOKEN_CACHE) 로 모든 Worker isolate 가 토큰 공유.
 *     - KV binding 없으면 모듈 캐시로 폴백 (트래픽 작을 때 안전).
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

// ── 토큰 캐시 ─────────────────────────────────────────────────────────────
// 1순위: Cloudflare KV (모든 isolate 공유, 24h 안에 토큰 1회만 발급)
// 2순위: 모듈 globals (isolate 단위 폴백, 트래픽 작을 때만 안전)
//
// KV 사용을 위해서는:
//   - wrangler.jsonc 의 kv_namespaces 에 binding "KIS_TOKEN_CACHE" 등록
//   - Route Handler 에서 env.KIS_TOKEN_CACHE 를 fetchKisQuotes/Quote 에 전달

interface TokenCache {
  token: string;
  expiresAt: number; // epoch ms
}

let moduleTokenCache: TokenCache | null = null; // fallback

const KV_KEY = 'kis:access_token:v1';

// Cloudflare KV 타입 (최소 인터페이스 — runtime 제공 객체)
interface KVNamespace {
  get(key: string, options?: { type?: 'json' | 'text' }): Promise<unknown>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

export interface KisEnv {
  KIS_TOKEN_CACHE?: KVNamespace;
}

async function readTokenFromKV(env: KisEnv | undefined): Promise<TokenCache | null> {
  if (!env?.KIS_TOKEN_CACHE) return null;
  try {
    const raw = await env.KIS_TOKEN_CACHE.get(KV_KEY, { type: 'json' });
    if (!raw || typeof raw !== 'object') return null;
    const c = raw as TokenCache;
    if (!c.token || typeof c.expiresAt !== 'number') return null;
    return c;
  } catch {
    return null;
  }
}

async function writeTokenToKV(env: KisEnv | undefined, cache: TokenCache): Promise<void> {
  if (!env?.KIS_TOKEN_CACHE) return;
  try {
    // expirationTtl 은 초 단위. 만료 시점까지의 잔여 초.
    const ttl = Math.max(60, Math.floor((cache.expiresAt - Date.now()) / 1000));
    await env.KIS_TOKEN_CACHE.put(KV_KEY, JSON.stringify(cache), { expirationTtl: ttl });
  } catch {
    // KV write 실패해도 모듈 캐시는 그대로 — 동작 계속
  }
}

async function getAccessToken(env?: KisEnv): Promise<string | null> {
  if (getMode() === 'mock') return null;

  const SAFETY_MS = 30 * 60 * 1000; // 만료 30분 전부터 재발급

  // 1. KV 조회 우선
  const kvCache = await readTokenFromKV(env);
  if (kvCache && kvCache.expiresAt - Date.now() > SAFETY_MS) {
    moduleTokenCache = kvCache; // 모듈 캐시 동기화 (다음 호출 KV read 절약)
    return kvCache.token;
  }

  // 2. 모듈 캐시
  if (moduleTokenCache && moduleTokenCache.expiresAt - Date.now() > SAFETY_MS) {
    // KV 사용 가능한데 모듈에만 있으면 KV 에도 저장 (다른 isolate 공유)
    await writeTokenToKV(env, moduleTokenCache);
    return moduleTokenCache.token;
  }

  // 3. 신규 발급
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
    const fresh: TokenCache = {
      token: json.access_token,
      expiresAt: Date.now() + (json.expires_in || 86400) * 1000,
    };
    moduleTokenCache = fresh;
    await writeTokenToKV(env, fresh);
    return fresh.token;
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
 *
 * @param env Cloudflare 바인딩 (KV 토큰 캐시용). 없으면 모듈 캐시만 사용.
 */
export async function fetchKisQuote(code: string, env?: KisEnv): Promise<KisQuote | null> {
  if (getMode() === 'mock') return null;

  const token = await getAccessToken(env);
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
 *   - 동일 access_token 재사용 (KV 또는 모듈 캐시)
 */
export async function fetchKisQuotes(codes: string[], env?: KisEnv): Promise<Array<KisQuote | null>> {
  const out: Array<KisQuote | null> = [];
  for (let i = 0; i < codes.length; i++) {
    out.push(await fetchKisQuote(codes[i], env));
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

/**
 * Cloudflare KV binding 가용 여부.
 *   - true: KV 로 토큰 공유 → 1일 1회 발급 보장
 *   - false: 모듈 캐시만 → isolate 마다 발급 가능 (트래픽 작을 때만 안전)
 */
export function isKvTokenCacheAvailable(env: KisEnv | undefined): boolean {
  return !!env?.KIS_TOKEN_CACHE;
}
