import { FEED_CATEGORIES, getCategoryFeedItems, renderRss, SITE_NAME } from '@/lib/feed';

/** 카테고리별 RSS 2.0 — /rss/{category}.xml (예: /rss/pulse.xml).
 *   메인 일별 카테고리(pulse·surge·flow·income·breaking)만 노출.
 */
export const dynamic = 'force-static';

export function generateStaticParams() {
  return FEED_CATEGORIES.map(c => ({ slug: `${c.slug}.xml` }));
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const categorySlug = slug.replace(/\.xml$/, '');
  const category = FEED_CATEGORIES.find(c => c.slug === categorySlug);

  if (!category) {
    return new Response('Not found', { status: 404 });
  }

  const rssFeed = renderRss(getCategoryFeedItems(category.slug), {
    title: `${SITE_NAME} — ${category.name}`,
    description: `${SITE_NAME}의 ${category.name} 카테고리 새 글을 모은 RSS 피드입니다.`,
    selfPath: `/rss/${category.slug}.xml`,
  });

  return new Response(rssFeed, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
