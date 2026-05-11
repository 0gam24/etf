/**
 * 📡 /api/etf/realtime — 한투 OpenAPI 실시간 시세 + data.go.kr 폴백.
 *
 *   요청: GET /api/etf/realtime?codes=069500,114800,122630
 *   응답: { quotes: KisQuote[], marketStatus, source, fallback?, ts }
 *
 *   분기:
 *     - KIS_APP_KEY 등록 + market open  → 한투 분단위 실시간 시세
 *     - KIS_APP_KEY 등록 + market closed → 한투 마지막 체결가 (= 종가)
 *     - KIS 미설정 또는 호출 실패        → data.go.kr 일별 마감 데이터 폴백
 *
 *   캐시: edge cache 정책
 *     - market open    : 30s
 *     - market closed  : 30min
 *     - holiday        : 24h
 *
 *   ⚠️ 호출자(클라이언트 컴포넌트)는 fallback 여부를 UI 에 표기해 사용자에게
 *      "장중 실시간 / 종가 / 마지막 거래일" 정직 표기 가능.
 */
import { NextRequest, NextResponse } from 'next/server';
import {
  fetchKisQuotes,
  getMarketStatus,
  isKisAvailable,
  getKisMode,
  type KisQuote,
  type MarketStatus,
} from '@/lib/kis';

interface RealtimeResponse {
  quotes: Array<KisQuote | null>;
  marketStatus: MarketStatus;
  source: 'kis' | 'fallback' | 'mock';
  kisMode: ReturnType<typeof getKisMode>;
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

  if (codes.length === 0) {
    const empty: RealtimeResponse = {
      quotes: [],
      marketStatus,
      source: 'mock',
      kisMode: getKisMode(),
      fallbackReason: 'no codes provided',
      ts,
    };
    return NextResponse.json(empty, { status: 400 });
  }

  // KIS 가용 시 한투 직접 호출. 실패 시 quotes 배열에 null 포함됨.
  if (isKisAvailable()) {
    try {
      const quotes = await fetchKisQuotes(codes);
      const okCount = quotes.filter(q => q !== null).length;
      const body: RealtimeResponse = {
        quotes,
        marketStatus,
        source: okCount === 0 ? 'fallback' : 'kis',
        kisMode: getKisMode(),
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
        fallbackReason: `kis exception: ${msg.slice(0, 80)}`,
        ts,
      };
      return NextResponse.json(body, { status: 200 });
    }
  }

  // Mock 모드 — KIS 키 없으면 빈 응답 + fallback 신호.
  // 클라이언트는 별도 /api/etf (data.go.kr) 호출로 폴백 처리.
  const mock: RealtimeResponse = {
    quotes: codes.map(() => null),
    marketStatus,
    source: 'mock',
    kisMode: 'mock',
    fallbackReason: 'KIS_APP_KEY 미설정 — /api/etf 일별 데이터 사용 권장',
    ts,
  };
  return NextResponse.json(mock, {
    headers: { 'Cache-Control': 'public, s-maxage=60' },
  });
}
