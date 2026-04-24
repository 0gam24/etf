import { getAllPosts } from '@/lib/posts';

/** Daily ETF Pulse — 동적 RSS 2.0 피드 (네이버 웹마스터도구·다음 검색등록용) */
export async function GET() {
  const baseUrl = process.env.SITE_URL || 'https://iknowhowinfo.com';
  const allPosts = getAllPosts();

  const itemsXml = allPosts
    .map((post) => {
      const url = `${baseUrl}/${post.meta.category}/${encodeURI(post.meta.slug)}`;
      
      // XML 이스케이프 (특수문자 처리)
      const escapeXml = (unsafe: string) => {
        return unsafe.replace(/[<>&'"]/g, (c) => {
          switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
          }
        });
      };

      return `
    <item>
      <title>${escapeXml(post.meta.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(post.meta.date).toUTCString()}</pubDate>
      <description>${escapeXml(post.meta.description)}</description>
      <category>${escapeXml(post.categoryName)}</category>
    </item>`;
    })
    .join('');

  const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Daily ETF Pulse</title>
    <link>${baseUrl}</link>
    <description>오늘 뜨는 ETF의 진짜 이유 — 급등 테마·자금 흐름·월배당 전략을 매일 오전 9시 전에.</description>
    <language>ko-KR</language>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>`;

  return new Response(rssFeed, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      // CDN이나 브라우저 캐시를 사용하되 24시간마다 백그라운드에서 갱신(stale-while-revalidate)
      'Cache-Control': 's-maxage=86400, stale-while-revalidate',
    },
  });
}
