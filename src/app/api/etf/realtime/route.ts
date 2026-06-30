/**
 * 📡 /api/etf/realtime — 한투 OpenAPI 실시간 시세 + data.go.kr 일별 종가 폴백.
 *
 *   요청: GET /api/etf/realtime?codes=069500,114800,122630
 *   응답: { quotes, marketStatus, source, tokenCache, fallback?, ts }
 *
 *   분기:
 *     - KIS 등록 + market open  → 한투 분단위 실시간 시세
 *     - KIS 등록 + market closed → 한투 마지막 체결가 (= 종가)
 *     - KIS 미설정 또는 호출 실패/0건 → 일별 종가 폴백(quotes 채워서 반환)
 *
 *   ▶ 일별 종가 폴백 (2026-07: KIS 중단 상태에서도 quotes 가 null 이 되지 않게):
 *     - 1순위: 같은 오리진의 /api/etf (data.go.kr 최신 종가, allETFs 100종)
 *     - 2순위: 커밋된 etf_prices_*.json 스냅샷 (런타임 fs)
 *     - 둘 다 실패 → null (이전과 동일)
 *     - 이로써 포트폴리오 계산기·발행 vs 현재 박스 등 SSR 초기값이 없는 소비처가
 *       KIS 부재에도 종가 기준으로 동작. source 는 'fallback' 으로 정직 표기(LIVE 배지 X).
 *
 *   캐시: edge cache 정책
 *     - market open    : 30s (KIS) / 5min (일별 폴백 — 장중에도 종가는 불변)
 *     - market closed  : 30min
 *     - holiday        : 24h
 *
 *   토큰 1일 1회 발급 원칙:
 *     - Cloudflare KV (KIS_TOKEN_CACHE) 로 모든 isolate 가 access_token 공유.
 *     - KV binding 없으면 모듈 캐시 폴백 (트래픽 작을 때 안전).
 *     - 응답의 tokenCache: 'kv' | 'module' 로 운영자가 인지 가능.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import {
  fetchKisQuotes,
  getMarketStatus,
  isKisAvailable,
  getKisMode,
  isKvTokenCacheAvailable,
  type KisQuote,
  type MarketStatus,
  type KisEnv,
} from '@/lib/kis';
import { getLatestEtfData } from '@/lib/data';

interface RealtimeResponse {
  quotes: Array<KisQuote | null>;
  marketStatus: MarketStatus;
  source: 'kis' | 'fallback' | 'mock';
  kisMode: ReturnType<typeof getKisMode>;
  tokenCache: 'kv' | 'module';
  fallbackReason?: string;
  ts: number;
}

const MAX_CODES = 15;       // 한 번 요청에 최대 종목 수 (분당 한도 보호)

function cacheSecondsFor(status: MarketStatus): number {
  switch (status) {
    case 'open': return 30;
    case 'closed': return 30 * 60;
    case 'pre_open': return 5 * 60;
    case 'holiday': return 24 * 60 * 60;
  }
}

// 일별 종가 폴백은 장중에도 값이 안 바뀌므로 open/pre_open 도 최소 5분 캐시 (자기 서브요청 절감).
function fallbackCacheSeconds(status: MarketStatus): number {
  return status === 'open' || status === 'pre_open' ? 5 * 60 : cacheSecondsFor(status);
}

function getKisEnv(): KisEnv | undefined {
  // OpenNext Cloudflare 의 getCloudflareContext 로 Worker env 접근.
  // 로컬 dev (next dev) 에서는 env 없음 → undefined 반환 (모듈 캐시 폴백).
  try {
    const ctx = getCloudflareContext();
    return ctx?.env as KisEnv | undefined;
  } catch {
    return undefined;
  }
}

// ── 일별 종가 폴백 ───────────────────────────────────────────────
interface DailyItem {
  code: string;
  name?: string;
  price?: number;
  change?: number;
  changeRate?: number;
  volume?: number;
  tradeAmount?: number;
  highPrice?: number;
  lowPrice?: number;
  openPrice?: number;
}

/**
 * 일별 종가 소스 로드 → shortcode(대문자) 키 맵.
 *   1순위 /api/etf (최신) · 2순위 커밋 스냅샷(fs) · 둘 다 실패 시 빈 맵.
 */
async function loadDailyMap(origin: string): Promise<{ map: Map<string, DailyItem>; via: string; baseDate: string }> {
  // 1순위 — 같은 오리진 /api/etf (data.go.kr 최신 종가)
  if (origin && /^https?:\/\//.test(origin)) {
    try {
      const res = await fetch(`${origin}/api/etf`);
      if (res.ok) {
        const data = await res.json();
        const list: DailyItem[] = Array.isArray(data?.allETFs) ? data.allETFs : [];
        if (list.length > 0) {
          const map = new Map<string, DailyItem>();
          for (const e of list) if (e?.code) map.set(String(e.code).toUpperCase(), e);
          if (map.size > 0) return { map, via: 'api-etf', baseDate: String(data?.baseDate || '') };
        }
      }
    } catch { /* 2순위로 폴백 */ }
  }
  // 2순위 — 커밋된 etf_prices_*.json 스냅샷 (런타임 fs)
  try {
    const snap = getLatestEtfData() as { etfList?: DailyItem[]; baseDate?: string } | null;
    const list = snap?.etfList || [];
    if (list.length > 0) {
      const map = new Map<string, DailyItem>();
      for (const e of list) if (e?.code) map.set(String(e.code).toUpperCase(), e);
      if (map.size > 0) return { map, via: 'snapshot', baseDate: String(snap?.baseDate || '') };
    }
  } catch { /* 빈 맵 반환 */ }
  return { map: new Map(), via: 'none', baseDate: '' };
}

/** 요청 코드 순서대로 일별 종가 → KisQuote 배열 (미보유 코드는 null). */
function dailyQuotesFor(codes: string[], map: Map<string, DailyItem>, ts: number): { quotes: Array<KisQuote | null>; okCount: number } {
  let okCount = 0;
  const quotes = codes.map<KisQuote | null>(code => {
    const e = map.get(code);
    const price = Number(e?.price) || 0;
    if (!e || price <= 0) return null;
    okCount++;
    return {
      code,
      name: e.name,
      price,
      change: Number(e.change) || 0,
      changeRate: Number(e.changeRate) || 0,
      volume: Number(e.volume) || 0,
      tradeAmount: e.tradeAmount != null ? Number(e.tradeAmount) : undefined,
      high: e.highPrice != null ? Number(e.highPrice) : undefined,
      low: e.lowPrice != null ? Number(e.lowPrice) : undefined,
      open: e.openPrice != null ? Number(e.openPrice) : undefined,
      timestamp: ts,
      source: 'mock',
    };
  });
  return { quotes, okCount };
}

function dailyHeaders(status: MarketStatus): HeadersInit {
  const sec = fallbackCacheSeconds(status);
  return { 'Cache-Control': `public, s-maxage=${sec}, stale-while-revalidate=${sec * 2}` };
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const codesRaw = sp.get('codes') || '';
  const codes = codesRaw
    .split(',')
    .map(c => c.trim().toUpperCase())
    .filter(c => /^[0-9A-Z]{6}$/.test(c))
    .slice(0, MAX_CODES);

  const marketStatus = getMarketStatus();
  const ts = Date.now();
  const env = getKisEnv();
  const origin = req.nextUrl.origin;
  const tokenCache: 'kv' | 'module' = isKvTokenCacheAvailable(env) ? 'kv' : 'module';

  if (codes.length === 0) {
    const empty: RealtimeResponse = {
      quotes: [],
      marketStatus,
      source: 'mock',
      kisMode: getKisMode(),
      tokenCache,
      fallbackReason: 'no codes provided',
      ts,
    };
    return NextResponse.json(empty, { status: 400 });
  }

  if (isKisAvailable()) {
    try {
      const quotes = await fetchKisQuotes(codes, env);
      const okCount = quotes.filter(q => q !== null).length;

      // KIS 응답 0건 → 일별 종가로 채움
      if (okCount === 0) {
        const { map, via, baseDate } = await loadDailyMap(origin);
        const daily = dailyQuotesFor(codes, map, ts);
        const body: RealtimeResponse = {
          quotes: daily.okCount > 0 ? daily.quotes : quotes,
          marketStatus,
          source: 'fallback',
          kisMode: getKisMode(),
          tokenCache,
          fallbackReason: daily.okCount > 0
            ? `KIS 0건 → 일별 종가(${via}${baseDate ? ` ${baseDate}` : ''})`
            : 'kis 0건 · 일별 종가 미보유',
          ts,
        };
        return NextResponse.json(body, { headers: dailyHeaders(marketStatus) });
      }

      const body: RealtimeResponse = {
        quotes,
        marketStatus,
        source: 'kis',
        kisMode: getKisMode(),
        tokenCache,
        ts,
      };
      const cacheSec = cacheSecondsFor(marketStatus);
      return NextResponse.json(body, {
        headers: {
          'Cache-Control': `public, s-maxage=${cacheSec}, stale-while-revalidate=${cacheSec * 2}`,
        },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // KIS 예외 → 일별 종가 폴백
      const { map, via, baseDate } = await loadDailyMap(origin);
      const daily = dailyQuotesFor(codes, map, ts);
      const body: RealtimeResponse = {
        quotes: daily.okCount > 0 ? daily.quotes : codes.map(() => null),
        marketStatus,
        source: 'fallback',
        kisMode: getKisMode(),
        tokenCache,
        fallbackReason: daily.okCount > 0
          ? `kis 예외 → 일별 종가(${via}${baseDate ? ` ${baseDate}` : ''})`
          : `kis exception: ${msg.slice(0, 80)}`,
        ts,
      };
      return NextResponse.json(body, { status: 200, headers: dailyHeaders(marketStatus) });
    }
  }

  // KIS 미설정(mock) — 일별 종가 폴백
  const { map, via, baseDate } = await loadDailyMap(origin);
  const daily = dailyQuotesFor(codes, map, ts);
  const body: RealtimeResponse = {
    quotes: daily.quotes,
    marketStatus,
    source: daily.okCount > 0 ? 'fallback' : 'mock',
    kisMode: getKisMode(),
    tokenCache,
    fallbackReason: daily.okCount > 0
      ? `KIS 미설정 — 일별 종가(${via}${baseDate ? ` ${baseDate}` : ''})`
      : `KIS 미설정 · 일별 종가 ${via === 'none' ? '소스 없음' : '미보유 코드'}`,
    ts,
  };
  return NextResponse.json(body, { headers: dailyHeaders(marketStatus) });
}
