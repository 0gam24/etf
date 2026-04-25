import { MetadataRoute } from 'next';
import { getAllPosts, TOP_LEVEL_CATEGORIES } from '@/lib/posts';
import { AUTHOR_LIST } from '@/lib/authors';
import { GUIDES } from '@/lib/guides';

/**
 * Daily ETF Pulse — 동적 sitemap.xml
 *   홈 · 4개 전용 카테고리 랜딩(/pulse·/surge·/flow·/income) · 7인 저자 허브 · 모든 포스트.
 *   최신 글일수록 priority 상향 (0.7 → 0.9).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.SITE_URL || 'https://iknowhowinfo.com';
  const allPosts = getAllPosts();
  const now = new Date();

  const routes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
  ];

  // 전용 카테고리 랜딩 (우선순위 0.9 — 매일 자동 갱신되는 데이터 대시보드)
  TOP_LEVEL_CATEGORIES.forEach(cat => {
    routes.push({
      url: `${baseUrl}/${cat}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    });
  });

  // 가이드 인덱스 + 5 필러 페이지 (백링크 허브)
  routes.push({
    url: `${baseUrl}/guide`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.85,
  });
  GUIDES.forEach(g => {
    routes.push({
      url: `${baseUrl}/guide/${g.slug}`,
      lastModified: new Date(g.lastReviewed),
      changeFrequency: 'weekly',
      priority: 0.85,
    });
  });

  // 저자 허브
  AUTHOR_LIST.forEach(a => {
    routes.push({
      url: `${baseUrl}/author/${a.id}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    });
  });

  // 포스트 상세 — 최근 글일수록 priority 상향
  const sevenDaysAgo = now.getTime() - 7 * 86400000;
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

  return routes;
}
