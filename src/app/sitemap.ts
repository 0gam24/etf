import { MetadataRoute } from 'next';
import {
  getAllPosts,
  TOP_LEVEL_CATEGORIES,
  getCategoryLastModified,
  getSiteLastModified,
  getAuthorLastModified,
} from '@/lib/posts';
import { AUTHOR_LIST } from '@/lib/authors';
import { GUIDES } from '@/lib/guides';
import { getProductsRegistry } from '@/lib/products';
import { getLatestEtfData, getKnownShortcodes } from '@/lib/data';

/**
 * Daily ETF Pulse — 동적 sitemap.xml
 *
 *   Google 가이드 (developers.google.com/search/docs/crawling-indexing/sitemaps):
 *     - lastmod는 "페이지가 마지막으로 의미 있게 변경된 시점"이어야 한다
 *     - 부정확한 lastmod는 Google이 신뢰하지 않고 무시한다
 *     - priority/changefreq는 Google이 무시 (단, Naver Yeti는 처리 — 한국 시장 타겟이라 유지)
 *
 *   따라서 카테고리·홈·저자·자료실의 lastmod를 sitemap 재생성 시각이 아닌
 *   실제 콘텐츠 갱신일에서 derive.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.SITE_URL || 'https://iknowhowinfo.com';
  const allPosts = getAllPosts();
  const fallback = new Date(); // 콘텐츠 0개일 때만 사용

  const routes: MetadataRoute.Sitemap = [];

  // 홈 — 사이트 전체 최신 글 발행일
  routes.push({
    url: baseUrl,
    lastModified: getSiteLastModified() || fallback,
    changeFrequency: 'daily',
    priority: 1.0,
  });

  // 전용 카테고리 랜딩 — 그 카테고리의 최신 글 날짜
  TOP_LEVEL_CATEGORIES.forEach(cat => {
    routes.push({
      url: `${baseUrl}/${cat}`,
      lastModified: getCategoryLastModified(cat) || fallback,
      changeFrequency: 'daily',
      priority: 0.9,
    });
  });

  // 추천 자료실 — products.json reviewedAt
  const productsReviewedAt = getProductsRegistry().reviewedAt;
  routes.push({
    url: `${baseUrl}/resources`,
    lastModified: productsReviewedAt ? new Date(productsReviewedAt) : fallback,
    changeFrequency: 'weekly',
    priority: 0.7,
  });

  // 가이드 인덱스 — 가이드 5종 중 가장 최근 lastReviewed
  const guideMostRecent = GUIDES
    .map(g => new Date(g.lastReviewed).getTime())
    .reduce((a, b) => Math.max(a, b), 0);
  routes.push({
    url: `${baseUrl}/guide`,
    lastModified: guideMostRecent > 0 ? new Date(guideMostRecent) : fallback,
    changeFrequency: 'weekly',
    priority: 0.85,
  });

  // 가이드 5종
  GUIDES.forEach(g => {
    routes.push({
      url: `${baseUrl}/guide/${g.slug}`,
      lastModified: new Date(g.lastReviewed),
      changeFrequency: 'weekly',
      priority: 0.85,
    });
  });

  // 저자 허브 — 그 저자의 최신 글 날짜 (없으면 fallback)
  AUTHOR_LIST.forEach(a => {
    routes.push({
      url: `${baseUrl}/author/${a.id}`,
      lastModified: getAuthorLastModified(a.id) || fallback,
      changeFrequency: 'weekly',
      priority: 0.6,
    });
  });

  // 포스트 상세 — 글 자체 발행일 (이미 정확)
  const sevenDaysAgo = Date.now() - 7 * 86400000;
  allPosts.forEach(post => {
    const pubTs = new Date(post.meta.date).getTime();
    const priority = pubTs >= sevenDaysAgo ? 0.9 : 0.7;
    routes.push({
      url: `${baseUrl}/${post.meta.category}/${encodeURI(post.meta.slug)}`,
      lastModified: new Date(post.meta.date),
      changeFrequency: 'weekly',
      priority,
    });
  });

  // 종목 사전 — /etf/[ticker] (KRX 등록 ETF 전체)
  const etfData = getLatestEtfData();
  // baseDate는 "YYYYMMDD" 문자열이라 Date에 직접 못 넘김 → ISO로 정규화
  function ymdToDate(ymd?: string): Date | null {
    if (!ymd || ymd.length !== 8) return null;
    const iso = `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}T00:00:00+09:00`;
    const d = new Date(iso);
    return isNaN(d.getTime()) ? null : d;
  }
  const etfLastModified = ymdToDate(etfData?.baseDate) || fallback;

  // KRX 공식 등록 모든 ETF (krx-etf-codes.json) — 시세 없는 종목도 minimal 페이지로 노출
  getKnownShortcodes().forEach(code => {
    routes.push({
      url: `${baseUrl}/etf/${code.toLowerCase()}`,
      lastModified: etfLastModified,
      changeFrequency: 'daily',
      priority: 0.8,
    });
  });

  return routes;
}
