/**
 * 📡 /api/etf/intraday — 한투 OpenAPI 분봉 시세.
 *
 *   요청: GET /api/etf/intraday?code=069500
 *   응답: { bars: KisMinuteBar[], marketStatus, source, ts }
 *
 *   캐시: 장중 60s · 마감 후 30min · 휴장 24h.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { fetchKisMinuteBars, getMarketStatus, isKisAvailable, type KisEnv } from '@/lib/kis';

function getKisEnv(): KisEnv | undefined {
  try {
    const ctx = getCloudflareContext();
    return ctx?.env as KisEnv | undefined;
  } catch {
    return undefined;
  }
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const code = (sp.get('code') || '').toUpperCase().trim();
  if (!/^[0-9A-Z]{6}$/.test(code)) {
    return NextResponse.json({ bars: [], error: 'invalid code' }, { status: 400 });
  }

  const marketStatus = getMarketStatus();
  const env = getKisEnv();

  if (!isKisAvailable()) {
    return NextResponse.json({
      bars: [],
      marketStatus,
      source: 'mock',
      fallbackReason: 'KIS_APP_KEY 미설정',
      ts: Date.now(),
    });
  }

  const bars = await fetchKisMinuteBars(code, env);
  const cacheSec = marketStatus === 'open' ? 60 : marketStatus === 'closed' ? 30 * 60 : 24 * 60 * 60;

  return NextResponse.json(
    { bars, marketStatus, source: bars.length > 0 ? 'kis' : 'fallback', ts: Date.now() },
    { headers: { 'Cache-Control': `public, s-maxage=${cacheSec}, stale-while-revalidate=${cacheSec * 2}` } },
  );
}
