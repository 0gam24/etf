import { getPostsByCategory } from '@/lib/posts';

/**
 * Daily ETF Pulse — News sitemap (Google News).
 *
 *   ⚠️ 활성화 조건:
 *     1. Google News Publisher Center에 사이트 등록 완료
 *        (보통 6개월+ 정기 발행 + 편집 정책 + 기자 정보 페이지 필요)
 *     2. 등록 후 GSC에서 News sitemap으로 별도 제출
 *     3. 등록 전에는 Google이 이 sitemap을 News로 처리하지 않음
 *
 *   Google 가이드 (developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap):
 *     - 최근 2일 이내 발행된 글만 포함 (그 이상은 자동 제외)
 *     - <news:news> 태그 + <news:publication> + <news:title>
 *     - publication_name + language 필수
 *
 *   /breaking 카테고리 후보:
 *     - 일 3편 정기 발행
 *     - 시의성 강함
 *     - 출처 명시 (KRX·한국은행·Naver 뉴스)
 *
 *   현재는 코드 구조만 준비. Publisher 등록 시점에 robots.txt와 sitemap-index에 추가.
 */

const SITE = process.env.SITE_URL || 'https://iknowhowinfo.com';
const PUBLICATION_NAME = 'Daily ETF Pulse';
const LANGUAGE = 'ko';

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

export async function GET() {
  const TWO_DAYS_MS = 2 * 86400 * 1000;
  const cutoff = Date.now() - TWO_DAYS_MS;

  // /breaking 카테고리 — 최근 2일 이내 글만
  const recentBreaking = getPostsByCategory('breaking').filter(
    p => new Date(p.meta.date).getTime() >= cutoff,
  );

  const entries = recentBreaking.map(post => {
    const url = `${SITE}/${post.meta.category}/${encodeURI(post.meta.slug)}`;
    const pubDate = new Date(post.meta.date).toISOString();
    const keywords = (post.meta.keywords || []).slice(0, 5).join(', ');

    return `
  <url>
    <loc>${url}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(PUBLICATION_NAME)}</news:name>
        <news:language>${LANGUAGE}</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${escapeXml(post.meta.title)}</news:title>
      ${keywords ? `<news:keywords>${escapeXml(keywords)}</news:keywords>` : ''}
    </news:news>
  </url>`;
  }).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">${entries}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=600, s-maxage=600',
    },
  });
}
