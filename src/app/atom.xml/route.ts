import { getAllFeedItems, renderAtom, DEFAULT_CHANNEL } from '@/lib/feed';

/** Daily ETF Pulse — Atom 1.0 피드 (RSS와 동일 콘텐츠, Atom 리더용). */
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
