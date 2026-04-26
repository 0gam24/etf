import type { Metadata } from 'next';
import { BookOpen, Notebook } from 'lucide-react';
import { getProductsGroupedByNeed, NEED_QUESTION, NEED_CAPTION } from '@/lib/products';
import Breadcrumbs from '@/components/Breadcrumbs';
import ProductCard from '@/components/ProductCard';
import AffiliateNotice from '@/components/AffiliateNotice';

export const metadata: Metadata = {
  title: '추천 자료실 — ETF 도서·학습 도구',
  description:
    '시청자의 고민(월 OO만원 받기·은퇴 30년 자산·ETF 입문·커버드콜 구조·가계부·투자 심리)에 가장 가까운 책 한 권을 골라보세요. 본 사이트의 데이터와 짝지어 두면 좋은 큐레이션.',
  alternates: { canonical: '/resources' },
  openGraph: {
    title: '추천 자료실 — ETF 도서·학습 도구',
    description: '당신의 고민에 가장 가까운 책 한 권 골라보세요.',
    type: 'website',
    url: '/resources',
  },
  twitter: {
    card: 'summary_large_image',
    title: '추천 자료실',
    description: '당신의 고민에 가장 가까운 책 한 권.',
  },
};

export default function ResourcesPage() {
  const groups = getProductsGroupedByNeed();

  return (
    <div className="resources-page animate-fade-in">
      <Breadcrumbs items={[{ name: '홈', href: '/' }, { name: '추천 자료실', href: '/resources' }]} />

      <header className="resources-hero">
        <div className="resources-eyebrow">
          <BookOpen size={14} strokeWidth={2.6} aria-hidden /> RESOURCES · 함께 읽기 좋은 자료
        </div>
        <h1 className="resources-title">
          당신의 고민에 가장 가까운 <span className="accent">한 권</span>을 골라보세요
        </h1>
        <p className="resources-sub">
          본 사이트의 데이터와 짝지어 두면 좋은 도서·학습 도구. 시청자가 자주 가진 고민 6가지로 묶었습니다.
        </p>
      </header>

      <AffiliateNotice variant="top" />

      {groups.length === 0 ? (
        <div className="resources-empty">
          <Notebook size={28} strokeWidth={1.6} aria-hidden />
          <p>큐레이션 자료가 곧 채워집니다.</p>
        </div>
      ) : (
        <div className="resources-niches">
          {groups.map(g => (
            <section key={g.need} className="resources-niche">
              <div className="resources-niche-head">
                <h2 className="resources-niche-question">{NEED_QUESTION[g.need]}</h2>
                <p className="resources-niche-caption">{NEED_CAPTION[g.need]}</p>
              </div>
              <ul className="resources-niche-list">
                {g.products.map(p => (
                  <li key={p.id}>
                    <ProductCard product={p} variant="resource" />
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
