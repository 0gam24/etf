import { getAllFeedItems, renderJsonFeed, DEFAULT_CHANNEL } from '@/lib/feed';

/** Daily ETF Pulse — JSON Feed 1.1 (RSS와 동일 콘텐츠, JSON Feed 리더·AI용). */
export async function GET() {
  const jsonFeed = renderJsonFeed(getAllFeedItems(), {
    ...DEFAULT_CHANNEL,
    selfPath: '/feed.json',
  });

  return new Response(jsonFeed, {
    headers: {
      'Content-Type': 'application/feed+json; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
