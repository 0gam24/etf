import { getAllFeedItems, renderAtom, DEFAULT_CHANNEL } from '@/lib/feed';

/** Daily ETF Pulse — Atom 1.0 피드 (RSS와 동일 콘텐츠, Atom 리더용). */
// 빌드 시점 prerender — content/* 파일시스템 접근이 빌드에서만 가능(런타임 Worker엔 없음).
export const dynamic = 'force-static';

export async function GET() {
  const atomFeed = renderAtom(getAllFeedItems(), {
    ...DEFAULT_CHANNEL,
    selfPath: '/atom.xml',
  });

  return new Response(atomFeed, {
    headers: {
      'Content-Type': 'application/atom+xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
