/**
 * 📡 /api/etf/realtime — 한투 OpenAPI 실시간 시세 + data.go.kr 폴백.
 *
 *   요청: GET /api/etf/realtime?codes=069500,114800,122630
 *   응답: { quotes, marketStatus, source, tokenCache, fallback?, ts }
 *
 *   분기:
 *     - KIS 등록 + market open  → 한투 분단위 실시간 시세
 *     - KIS 등록 + market closed → 한투 마지막 체결가 (= 종가)
 *     - KIS 미설정 또는 호출 실패 → data.go.kr 폴백 신호
 *
 *   캐시: edge cache 정책
 *     - market open    : 30s
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
      const body: RealtimeResponse = {
        quotes,
        marketStatus,
        source: okCount === 0 ? 'fallback' : 'kis',
        kisMode: getKisMode(),
        tokenCache,
        ts,
        ...(okCount === 0 ? { fallbackReason: 'kis 0건 응답' } : {}),
      };
      const cacheSec = cacheSecondsFor(marketStatus);
      return NextResponse.json(body, {
        headers: {
          'Cache-Control': `public, s-maxage=${cacheSec}, stale-while-revalidate=${cacheSec * 2}`,
        },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const body: RealtimeResponse = {
        quotes: codes.map(() => null),
        marketStatus,
        source: 'fallback',
        kisMode: getKisMode(),
        tokenCache,
        fallbackReason: `kis exception: ${msg.slice(0, 80)}`,
        ts,
      };
      return NextResponse.json(body, { status: 200 });
    }
  }

  // Mock 모드
  const mock: RealtimeResponse = {
    quotes: codes.map(() => null),
    marketStatus,
    source: 'mock',
    kisMode: 'mock',
    tokenCache,
    fallbackReason: 'KIS_APP_KEY 미설정 — /api/etf 일별 데이터 사용 권장',
    ts,
  };
  return NextResponse.json(mock, {
    headers: { 'Cache-Control': 'public, s-maxage=60' },
  });
}
