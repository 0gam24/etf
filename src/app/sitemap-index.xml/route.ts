import { getSiteLastModified } from '@/lib/posts';

/**
 * Daily ETF Pulse — Sitemap index.
 *
 *   Google 가이드 (developers.google.com/search/docs/crawling-indexing/sitemaps/large-sitemaps):
 *     - 여러 sitemap을 묶는 진입점
 *     - 50,000 URL 또는 50MB 초과 시 필수, 그 미만은 선택
 *
 *   우리는 콘텐츠 + 이미지 sitemap 분리 운영 — index로 묶어 GSC·Naver에 한 번에 제출.
 *
 *   robots.txt가 이 index를 가리키도록 설정 (또는 main sitemap을 가리켜도 OK).
 */

const SITE = process.env.SITE_URL || 'https://iknowhowinfo.com';

export async function GET() {
  const lastmod = (getSiteLastModified() || new Date()).toISOString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE}/sitemap.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE}/sitemap-images.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
</sitemapindex>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
