import { getAllPosts } from '@/lib/posts';
import { GUIDES } from '@/lib/guides';

/**
 * Daily ETF Pulse — Image sitemap.
 *
 *   Google 가이드 (developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps):
 *     - <image:image> 태그로 페이지의 핵심 이미지 정보 제공
 *     - Google Image Search 노출 가능성 ↑
 *     - 페이지당 최대 1,000개 이미지
 *
 *   우리 사이트:
 *     - 모든 글의 OG 이미지 (/api/og?...) — SVG, 동적 생성
 *     - 가이드 페이지: 카테고리별 OG
 *     - 카테고리 랜딩: 사이트 기본 OG
 *
 *   Next.js MetadataRoute.Sitemap의 image 필드는 형식 제한적이라
 *   직접 XML route handler로 생성.
 */

const SITE = process.env.SITE_URL || 'https://iknowhowinfo.com';

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

function ogImageUrl(params: Record<string, string>): string {
  const qs = new URLSearchParams(params);
  return `${SITE}/api/og?${qs.toString()}`;
}

export async function GET() {
  const allPosts = getAllPosts();
  const entries: string[] = [];

  // 홈 + 카테고리 랜딩 + 가이드 인덱스 + /resources
  entries.push(`
  <url>
    <loc>${SITE}</loc>
    <image:image>
      <image:loc>${ogImageUrl({ title: 'Daily ETF Pulse — 오늘 뜨는 ETF의 진짜 이유', category: 'pulse' })}</image:loc>
      <image:title>${escapeXml('Daily ETF Pulse — 오늘 뜨는 ETF의 진짜 이유')}</image:title>
    </image:image>
  </url>`);

  ['pulse', 'breaking', 'surge', 'flow', 'income'].forEach(cat => {
    entries.push(`
  <url>
    <loc>${SITE}/${cat}</loc>
    <image:image>
      <image:loc>${ogImageUrl({ title: cat.toUpperCase(), category: cat })}</image:loc>
    </image:image>
  </url>`);
  });

  // 정적 신뢰·자료실 페이지 — Google Image Search 노출 가능성 + OG 카드 양호 유지.
  //   (about·newsletter·resources·compare·etf 인덱스 모두 OG 이미지 동적 생성됨)
  const STATIC_PAGES: Array<{ path: string; title: string; category?: string }> = [
    { path: '/about',      title: 'Daily ETF Pulse 편집팀 — 발행 원칙·데이터 출처',  category: 'pulse' },
    { path: '/newsletter', title: 'Daily ETF Pulse 뉴스레터 — 매일 아침 9시 갱신',  category: 'pulse' },
    { path: '/resources',  title: 'ETF 학습 자료실 — 도서·도구 큐레이션',           category: 'income' },
    { path: '/compare',    title: 'ETF 1:1 비교 허브 — 운용사·섹터·환헤지',         category: 'flow' },
    { path: '/etf',        title: 'KRX 1095종 ETF 종목 사전',                      category: 'surge' },
    { path: '/guide',      title: 'ETF 투자 가이드 8종 — 월배당·커버드콜·방산·AI', category: 'pulse' },
  ];
  STATIC_PAGES.forEach(p => {
    entries.push(`
  <url>
    <loc>${SITE}${p.path}</loc>
    <image:image>
      <image:loc>${ogImageUrl({ title: p.title.slice(0, 60), category: p.category || 'pulse' })}</image:loc>
      <image:title>${escapeXml(p.title)}</image:title>
    </image:image>
  </url>`);
  });

  // /author/{id} 페이지는 데이터 저널 톤으로 정리되어 robots noindex 처리됨. sitemap-images 에서도 제외.

  GUIDES.forEach(g => {
    entries.push(`
  <url>
    <loc>${SITE}/guide/${g.slug}</loc>
    <image:image>
      <image:loc>${ogImageUrl({ title: g.title.slice(0, 60), category: 'pulse' })}</image:loc>
      <image:title>${escapeXml(g.title)}</image:title>
      <image:caption>${escapeXml(g.tagline)}</image:caption>
    </image:image>
  </url>`);
  });

  // 글 상세 — 각 글의 OG 이미지
  allPosts.forEach(post => {
    const url = `${SITE}/${post.meta.category}/${encodeURI(post.meta.slug)}`;
    const ogParams: Record<string, string> = {
      title: post.meta.title.slice(0, 60),
      category: post.meta.category.split('/')[0],
      date: new Date(post.meta.date).toLocaleDateString('ko-KR'),
    };
    if (post.meta.tickers?.length) {
      ogParams.tickers = post.meta.tickers.slice(0, 3).join(',');
    }
    entries.push(`
  <url>
    <loc>${url}</loc>
    <image:image>
      <image:loc>${ogImageUrl(ogParams)}</image:loc>
      <image:title>${escapeXml(post.meta.title)}</image:title>
      ${post.meta.description ? `<image:caption>${escapeXml(post.meta.description)}</image:caption>` : ''}
    </image:image>
  </url>`);
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${entries.join('')}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
