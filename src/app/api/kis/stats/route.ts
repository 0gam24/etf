/**
 * 📊 /api/kis/stats — 한투 OpenAPI 호출량 통계 (운영자 대시보드용).
 *
 *   요청: GET /api/kis/stats?days=7
 *   응답: { days: DailyStats[], summary: { ... }, kvEnabled: bool, ts }
 *
 *   ⚠️ robots noindex 처리됨 (page level) — endpoint 자체는 공개지만 통계만 노출.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { fetchKisDailyStats, isKvTokenCacheAvailable, type KisEnv } from '@/lib/kis';

function getKisEnv(): KisEnv | undefined {
  try {
    const ctx = getCloudflareContext();
    return ctx?.env as KisEnv | undefined;
  } catch {
    return undefined;
  }
}

export async function GET(req: NextRequest) {
  const env = getKisEnv();
  const sp = req.nextUrl.searchParams;
  const daysRaw = parseInt(sp.get('days') || '7', 10);
  const days = Math.min(Math.max(daysRaw, 1), 30);

  const dailyStats = await fetchKisDailyStats(env, days);

  // 요약
  const summary = dailyStats.reduce(
    (acc, d) => {
      acc.total += d.total;
      acc.success += d.success;
      acc.fallback += d.fallback;
      acc.mock += d.mock;
      return acc;
    },
    { total: 0, success: 0, fallback: 0, mock: 0 },
  );

  return NextResponse.json(
    {
      days: dailyStats,
      summary,
      successRate: summary.total > 0 ? (summary.success / summary.total) : 0,
      kvEnabled: isKvTokenCacheAvailable(env),
      ts: Date.now(),
    },
    {
      headers: { 'Cache-Control': 'public, s-maxage=60' },
    },
  );
}
