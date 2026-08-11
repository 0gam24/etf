import Link from 'next/link';
import type { Metadata } from 'next';
import { CalendarRange, ArrowRight } from 'lucide-react';
import { getPostsByCategory, CATEGORY_NAMES } from '@/lib/posts';
import Breadcrumbs from '@/components/Breadcrumbs';
import RecommendBox from '@/components/RecommendBox';
import { buildBreadcrumbSchema, buildItemListSchema, jsonLd } from '@/lib/schema';
import { buildPageMetadata } from '@/lib/site-meta';

/**
 * /weekly — 주간 펄스 리포트 인덱스
 *
 *   홈 카테고리 선반(home-feed.ts SHELF_CONFIG)이 /weekly로 연결하는데 인덱스 라우트가
 *   없어 404였다. 개별 글(/weekly/[slug])만 존재했고, 그 글들로 들어가는 진입점이 없어
 *   고아 페이지 상태이기도 했다. (2026-08-11 SEO 감사)
 */

export const metadata: Metadata = buildPageMetadata({
  title: '주간 ETF 펄스 리포트',
  description:
    '한 주 동안 거래량과 자금이 어디로 움직였는지 주 단위로 정리한 ETF 리포트입니다. 섹터별 자금 흐름과 반복해서 등장한 종목을 주차별로 모아, 하루 단위로는 잘 안 보이는 흐름을 확인할 수 있습니다.',
  url: '/weekly',
  keywords: ['주간 ETF 리포트', 'ETF 주간 자금 흐름', 'ETF 주차별 정리', '주간 시장 리포트'],
});

/** '2026-W22' → '2026년 22주차' */
function formatWeekLabel(slug: string): string {
  const m = slug.match(/^(\d{4})-W(\d{1,2})$/);
  return m ? `${m[1]}년 ${Number(m[2])}주차` : slug;
}

export default function WeeklyIndexPage() {
  const posts = getPostsByCategory('weekly');

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: '홈', href: '/' },
    { name: CATEGORY_NAMES.weekly, href: '/weekly' },
  ]);
  const itemListSchema = buildItemListSchema(
    posts.map(p => ({ url: `/weekly/${p.meta.slug}`, name: p.meta.title })),
    `주간 ETF 펄스 리포트 ${posts.length}편`,
  );

  return (
    <div className="pulse-landing animate-fade-in">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(itemListSchema) }} />

      <Breadcrumbs
        items={[
          { name: '홈', href: '/' },
          { name: CATEGORY_NAMES.weekly, href: '/weekly' },
        ]}
      />

      <header className="guide-index-hero">
        <span className="guide-index-eyebrow">
          <CalendarRange size={14} strokeWidth={2.6} aria-hidden /> WEEKLY · 주간 리포트
        </span>
        <h1 className="guide-index-title">
          주간 ETF 펄스 리포트, <span className="accent">한 주를 한 번에</span>
        </h1>
        <p className="guide-index-sub">
          하루 단위로는 잘 보이지 않는 흐름이 있습니다. 한 주 동안 거래량과 자금이 어느 섹터로
          움직였는지, 어떤 종목이 반복해서 올라왔는지 주차별로 정리했습니다.
        </p>
      </header>

      <RecommendBox position="top" category="general" />

      <div className="pulse-landing-body">
        <section className="pulse-archive">
          <div className="pulse-section-head">
            <h2 className="pulse-section-title">발행된 주간 리포트</h2>
            <p className="pulse-section-hint">총 {posts.length}편</p>
          </div>

          {posts.length === 0 ? (
            <p className="pulse-section-empty">아직 발행된 주간 리포트가 없습니다.</p>
          ) : (
            <ul className="pulse-archive-list">
              {posts.map(p => (
                <li key={p.meta.slug}>
                  <Link href={`/weekly/${p.meta.slug}`} prefetch={false} className="pulse-archive-row">
                    <span className="pulse-archive-date">{formatWeekLabel(p.meta.slug)}</span>
                    <span className="pulse-archive-title">{p.meta.title}</span>
                    <span className="pulse-archive-meta">{p.readingTime}분</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <nav className="guide-article-other" aria-label="다른 리포트">
          <h2>매일 발행되는 리포트</h2>
          <ul>
            <li>
              <Link href="/pulse" prefetch={false}>
                <span className="guide-article-other-title">오늘의 관전포인트</span>
                <ArrowRight size={14} strokeWidth={2.5} />
              </Link>
            </li>
            <li>
              <Link href="/flow" prefetch={false}>
                <span className="guide-article-other-title">ETF 섹터 자금 흐름</span>
                <ArrowRight size={14} strokeWidth={2.5} />
              </Link>
            </li>
            <li>
              <Link href="/today" prefetch={false}>
                <span className="guide-article-other-title">오늘의 ETF 종합 리포트</span>
                <ArrowRight size={14} strokeWidth={2.5} />
              </Link>
            </li>
          </ul>
        </nav>

        <RecommendBox position="bottom" category="general" />
      </div>
    </div>
  );
}
