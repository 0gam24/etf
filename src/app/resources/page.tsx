import type { Metadata } from 'next';
import { BookOpen, Notebook } from 'lucide-react';
import { getProductsGroupedByCategory, CATEGORY_LABEL } from '@/lib/products';
import Breadcrumbs from '@/components/Breadcrumbs';
import ProductCard from '@/components/ProductCard';
import AffiliateNotice from '@/components/AffiliateNotice';

export const metadata: Metadata = {
  title: '추천 자료실 — ETF 도서·학습 도구',
  description:
    '월배당·커버드콜·은퇴 자산·테마 ETF 가이드와 함께 보면 좋은 도서·학습 도구 큐레이션. 본 사이트의 데이터와 짝지어 두면 좋은 책과 도구.',
  alternates: { canonical: '/resources' },
  openGraph: {
    title: '추천 자료실 — ETF 도서·학습 도구',
    description: '월배당·커버드콜·은퇴 자산 가이드와 짝지어 두면 좋은 도서·도구 큐레이션.',
    type: 'website',
    url: '/resources',
  },
  twitter: {
    card: 'summary_large_image',
    title: '추천 자료실',
    description: 'ETF 가이드와 함께 보면 좋은 도서·도구.',
  },
};

export default function ResourcesPage() {
  const groups = getProductsGroupedByCategory();

  return (
    <div className="resources-page animate-fade-in">
      <Breadcrumbs items={[{ name: '홈', href: '/' }, { name: '추천 자료실', href: '/resources' }]} />

      <header className="resources-hero">
        <div className="resources-eyebrow">
          <BookOpen size={14} strokeWidth={2.6} aria-hidden /> RESOURCES · 함께 읽기 좋은 자료
        </div>
        <h1 className="resources-title">
          가이드와 짝지어 두면 좋은 <span className="accent">도서·학습 도구</span>
        </h1>
        <p className="resources-sub">
          본 사이트가 매일 보여주는 데이터를 더 깊이 이해하거나, 본인 가계부·노트로 옮기고 싶을 때 함께 보면 좋은 자료들입니다.
          쿠팡 파트너스 링크로 클릭 후 24시간 안에 발생한 구매에 대해 일정 수수료를 받습니다.
        </p>
      </header>

      <AffiliateNotice variant="top" />

      {groups.length === 0 ? (
        <div className="resources-empty">
          <Notebook size={28} strokeWidth={1.6} aria-hidden />
          <p>큐레이션 자료가 곧 채워집니다.</p>
        </div>
      ) : (
        <div className="resources-groups">
          {groups.map(g => (
            <section key={g.category} className="resources-group">
              <h2 className="resources-group-title">{CATEGORY_LABEL[g.category]}</h2>
              <ul className="resources-group-list">
                {g.products.map(p => (
                  <li key={p.id}>
                    <ProductCard product={p} variant="full" />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <p className="resources-disclaimer">
        본 페이지의 모든 추천은 본 사이트가 직접 큐레이션한 것이며, 출판사·브랜드의 의뢰로 작성된 것이 아닙니다.
        구매 결정과 그에 따른 손익의 책임은 본인에게 있습니다.
      </p>
    </div>
  );
}
