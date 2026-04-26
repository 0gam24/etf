import { BookOpen } from 'lucide-react';
import { getProductsFor, type ProductCategory } from '@/lib/products';
import ProductCard from './ProductCard';
import AffiliateNotice from './AffiliateNotice';

interface Props {
  category: ProductCategory;
  /** 카드 갯수 상한 (기본 3) */
  limit?: number;
  /** 섹션 헤더 (없으면 카테고리 기본 헤더) */
  heading?: string;
  /** 부제 */
  caption?: string;
}

const DEFAULT_HEADINGS: Record<ProductCategory, { heading: string; caption: string }> = {
  'income':       { heading: '월배당·커버드콜을 더 깊이 공부하려면', caption: '본 사이트가 매일 보여주는 데이터와 함께 읽기 좋은 자료.' },
  'covered-call': { heading: '커버드콜 전략 심화 학습',                caption: '옵션 매도 구조를 더 자세히 다룬 책.' },
  'retirement':   { heading: '은퇴 자산 설계 — 함께 보면 좋은 자료',  caption: 'IRP·ISA·연금저축 활용을 한 권에 정리한 추천 도서·도구.' },
  'defense-etf':  { heading: '방산 섹터 깊이 있게 읽기',              caption: '방위산업 구조와 한국 기업 분석 도서.' },
  'ai-semi-etf':  { heading: 'AI·반도체 산업 이해를 위한 책',         caption: 'HBM·AI 인프라 사이클을 다룬 서적.' },
  'general':      { heading: 'ETF 투자 입문 자료',                   caption: '기초부터 다지고 싶다면 함께 읽기 좋은 도서·도구.' },
};

/**
 * 카테고리별 상품 추천 그리드 (책 + 학습 도구).
 *
 *   공정위 + 쿠팡 약관 준수:
 *     - 카드 그룹 직상단 AffiliateNotice (variant="inline")
 *     - 카드별 [광고] 라벨 (ProductCard 내부)
 */
export default function ProductRecommendBlock({ category, limit = 3, heading, caption }: Props) {
  const products = getProductsFor(category, limit);
  if (products.length === 0) return null;

  const meta = DEFAULT_HEADINGS[category];
  const finalHeading = heading || meta.heading;
  const finalCaption = caption || meta.caption;

  return (
    <section className="product-rec-block" aria-label="제휴 상품 추천">
      <div className="product-rec-head">
        <div className="product-rec-eyebrow">
          <BookOpen size={13} strokeWidth={2.4} aria-hidden /> 함께 읽기
        </div>
        <h3 className="product-rec-title">{finalHeading}</h3>
        {finalCaption && <p className="product-rec-caption">{finalCaption}</p>}
      </div>

      <AffiliateNotice variant="inline" />

      <ul className="product-rec-list">
        {products.map(p => (
          <li key={p.id}>
            <ProductCard product={p} variant="full" />
          </li>
        ))}
      </ul>
    </section>
  );
}
