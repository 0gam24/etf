import { getAllFeedItems, renderRss, DEFAULT_CHANNEL } from '@/lib/feed';

/** Daily ETF Pulse — 동적 RSS 2.0 피드 (네이버 웹마스터도구·다음 검색등록용)
 *   포함: 모든 분석 글(pulse·surge·flow·income·breaking) + /today 일별 리포트.
 *   Atom·JSON·카테고리별 RSS는 /atom.xml · /feed.json · /rss/{category}.xml.
 */
// 빌드 시점 prerender — content/* 파일시스템 접근이 빌드에서만 가능(런타임 Worker엔 없음).
export const dynamic = 'force-static';

export async function GET() {
  const rssFeed = renderRss(getAllFeedItems(), {
    ...DEFAULT_CHANNEL,
    selfPath: '/rss.xml',
  });

  return new Response(rssFeed, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
