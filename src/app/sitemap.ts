import { MetadataRoute } from 'next';
import {
  getAllPosts,
  TOP_LEVEL_CATEGORIES,
  getCategoryLastModified,
  getSiteLastModified,
} from '@/lib/posts';
import { GUIDES } from '@/lib/guides';
import { getProductsRegistry } from '@/lib/products';
import { getLatestEtfData } from '@/lib/data';
import { COMPARE_PAIRS } from '@/lib/etf-compare-pairs';

/**
 * Daily ETF Pulse — 메인 sitemap.xml (홈·카테고리·글·가이드·저자 ~200 URL)
 *
 *   ⚠️ /etf/{slug} 1095종은 별도 분리 → /sitemap-etf.xml (크롤링 효율 + Naver 안정성)
 *   sitemap-index.xml에서 둘을 함께 노출.
 *
 *   Google 가이드 (developers.google.com/search/docs/crawling-indexing/sitemaps):
 *     - lastmod는 "페이지가 마지막으로 의미 있게 변경된 시점"이어야 한다
 *     - 부정확한 lastmod는 Google이 신뢰하지 않고 무시한다
 *     - priority/changefreq는 Google이 무시 (단, Naver Yeti는 처리 — 한국 시장 타겟이라 유지)
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

  // About — 편집팀 소개 (E-E-A-T 핵심 페이지)
  routes.push({
    url: `${baseUrl}/about`,
    lastModified: getSiteLastModified() || fallback,
    changeFrequency: 'monthly',
    priority: 0.7,
  });

  // 뉴스레터 구독 페이지 (재방문 채널)
  routes.push({
    url: `${baseUrl}/newsletter`,
    lastModified: getSiteLastModified() || fallback,
    changeFrequency: 'monthly',
    priority: 0.6,
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

  // 저자 페이지 (/author/{id}) — 데이터 저널 톤으로 정리, robots noindex 처리됨. sitemap에서 제외.

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

  // 종목 사전 인덱스 페이지 (/etf) — 1095 ETF는 별도 sitemap-etf.xml에서 처리
  const etfData = getLatestEtfData();
  function ymdToDate(ymd?: string): Date | null {
    if (!ymd || ymd.length !== 8) return null;
    const iso = `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}T00:00:00+09:00`;
    const d = new Date(iso);
    return isNaN(d.getTime()) ? null : d;
  }
  const etfLastModified = ymdToDate(etfData?.baseDate) || fallback;
  routes.push({
    url: `${baseUrl}/etf`,
    lastModified: etfLastModified,
    changeFrequency: 'daily',
    priority: 0.85,
  });

  // /compare 인덱스 + 각 비교 페어
  routes.push({
    url: `${baseUrl}/compare`,
    lastModified: etfLastModified,
    changeFrequency: 'weekly',
    priority: 0.75,
  });
  COMPARE_PAIRS.forEach(p => {
    routes.push({
      url: `${baseUrl}/compare/${p.slug}`,
      lastModified: etfLastModified,
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  });

  return routes;
}
