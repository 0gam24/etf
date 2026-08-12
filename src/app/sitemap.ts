import { MetadataRoute } from 'next';
import fs from 'node:fs';
import path from 'node:path';
import {
  getAllPosts,
  TOP_LEVEL_CATEGORIES,
  getCategoryLastModified,
  getSiteLastModified,
} from '@/lib/posts';
import { GUIDES, getGuidePublishedAt } from '@/lib/guides';
import { getProductsRegistry } from '@/lib/products';
import { getLatestEtfData, getKrxEtfMeta } from '@/lib/data';
import { COMPARE_PAIRS } from '@/lib/etf-compare-pairs';
import { ALL_PERSONAS } from '@/lib/personas-config';

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

  // 정책 페이지 3종 — AdSense·공정위 형식 요건 (모든 페이지 footer에 일관 노출)
  const policyLastModified = new Date('2026-05-22');
  ['privacy', 'disclaimer', 'contact'].forEach(slug => {
    routes.push({
      url: `${baseUrl}/${slug}`,
      lastModified: policyLastModified,
      changeFrequency: 'yearly',
      priority: 0.4,
    });
  });

  // 뉴스레터 구독 페이지 (재방문 채널)
  routes.push({
    url: `${baseUrl}/newsletter`,
    lastModified: getSiteLastModified() || fallback,
    changeFrequency: 'monthly',
    priority: 0.6,
  });

  // 구독 · 피드 허브 (RSS·AI/검색 엔진 파일 안내)
  routes.push({
    url: `${baseUrl}/feeds`,
    lastModified: getSiteLastModified() || fallback,
    changeFrequency: 'monthly',
    priority: 0.6,
  });

  /**
   * 가이드 갱신일.
   *
   *   lastReviewed를 그대로 쓰지 않는다. 격주 점검 크론이 내용을 확인하지 않고
   *   208편에 같은 날짜를 일괄로 써넣은 값이라, 4월에 쓰고 그대로인 글까지
   *   "8월 1일에 갱신됨"이라고 신고하게 된다. 검색엔진은 이런 갱신일을 신뢰하지
   *   않게 되고, 그러면 진짜로 바뀐 페이지의 재수집도 함께 늦어진다.
   *   (SEO.md §5 "lastmod는 콘텐츠 실제 갱신일에서 derive")
   *   크론은 중단시켰고, 발행일이 남아 있으면 그쪽을 쓴다. (2026-08-12)
   */
  const guideLastModified = (slug: string, lastReviewed: string) =>
    new Date(getGuidePublishedAt(slug) || lastReviewed);

  // 가이드 인덱스 — 가장 최근에 발행된 가이드 기준
  const guideMostRecent = GUIDES
    .map(g => guideLastModified(g.slug, g.lastReviewed).getTime())
    .reduce((a, b) => Math.max(a, b), 0);
  routes.push({
    url: `${baseUrl}/guide`,
    lastModified: guideMostRecent > 0 ? new Date(guideMostRecent) : fallback,
    changeFrequency: 'weekly',
    priority: 0.85,
  });

  // 가이드 전체 최신 발행순 아카이브 — 새 가이드 발행일에 갱신
  routes.push({
    url: `${baseUrl}/guide/latest`,
    lastModified: guideMostRecent > 0 ? new Date(guideMostRecent) : fallback,
    changeFrequency: 'daily',
    priority: 0.7,
  });

  // 가이드 5종
  GUIDES.forEach(g => {
    routes.push({
      url: `${baseUrl}/guide/${g.slug}`,
      lastModified: guideLastModified(g.slug, g.lastReviewed),
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
  // 두 코드가 모두 KRX에 존재하는 페어만 제출한다.
  //   KRX 코드가 바뀌거나 상장폐지되면 비교 페이지가 404로 렌더되는데, 기존에는 sitemap이
  //   무조건 전 페어를 제출해 "제출된 URL을 찾을 수 없음(404)" 오류를 만들었다.
  //   (2026-08-12 감사에서 10쌍 중 2쌍이 이 상태였음)
  COMPARE_PAIRS.filter(p => getKrxEtfMeta(p.codeA) && getKrxEtfMeta(p.codeB)).forEach(p => {
    routes.push({
      url: `${baseUrl}/compare/${p.slug}`,
      lastModified: etfLastModified,
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  });

  // ── 페르소나 entry pages (Phase 4) — 7종 ────────────────────────────
  // PERSONAS 가 personas-config.ts 에서 single source of truth → 추가 시 자동 sitemap 반영.
  ALL_PERSONAS.forEach(p => {
    routes.push({
      url: `${baseUrl}/for/${p.slug}`,
      lastModified: getSiteLastModified() || fallback,
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  });

  // ── /weekly 주간 리포트 인덱스 (2026-08-11 신설) ────────────────────
  // 개별 글(/weekly/{slug})은 위 포스트 루프에서 이미 등록된다. 인덱스만 추가.
  routes.push({
    url: `${baseUrl}/weekly`,
    lastModified: getCategoryLastModified('weekly') || fallback,
    changeFrequency: 'weekly',
    priority: 0.8,
  });

  // ── /today 종합 리포트 (Phase 4) ──────────────────────────────────
  // /today (latest) + /today/{YYYY-MM-DD} 영구 보관 일별 리포트들
  routes.push({
    url: `${baseUrl}/today`,
    lastModified: getSiteLastModified() || fallback,
    changeFrequency: 'daily',
    priority: 0.9,
  });
  try {
    const todayDir = path.join(process.cwd(), 'data', 'today');
    if (fs.existsSync(todayDir)) {
      const dailyFiles = fs.readdirSync(todayDir)
        .filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
        .sort()
        .reverse(); // 최신 우선
      // 최근 90일만 sitemap 등록 (오래된 건 검색 가치 낮음)
      dailyFiles.slice(0, 90).forEach(f => {
        const date = f.replace('.json', '');
        routes.push({
          url: `${baseUrl}/today/${date}`,
          lastModified: new Date(date),
          changeFrequency: 'never', // 일별 리포트는 발행 후 불변
          priority: 0.6,
        });
      });
    }
  } catch { /* silent — today dir 없으면 skip */ }

  // ── /strategy/* (Phase 3) ──────────────────────────────────────────
  const strategies = [
    { slug: 'kospi200-breakout', priority: 0.85, changeFrequency: 'daily' as const },
    { slug: 'track-record', priority: 0.75, changeFrequency: 'daily' as const },
  ];
  strategies.forEach(s => {
    routes.push({
      url: `${baseUrl}/strategy/${s.slug}`,
      lastModified: getSiteLastModified() || fallback,
      changeFrequency: s.changeFrequency,
      priority: s.priority,
    });
  });

  // ── /tools/* (Phase 2~3 — 자매 사이트 호스팅 전 자체 도구) ────────
  // 자매 redirect (Phase 4D) 완료 후 본 sitemap 에서 제거 필요.
  const tools = [
    { slug: 'portfolio', priority: 0.7 },
    { slug: 'tax-compare', priority: 0.7 },
  ];
  tools.forEach(t => {
    routes.push({
      url: `${baseUrl}/tools/${t.slug}`,
      lastModified: getSiteLastModified() || fallback,
      changeFrequency: 'monthly',
      priority: t.priority,
    });
  });

  return routes;
}
