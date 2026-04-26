import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getProductById } from '@/lib/products';
import ProductCard from './ProductCard';

interface Props {
  /** 인용 도입부 — 단락 흐름과 매칭되는 한 줄 (예: "분배 일정을 가계부에 옮기려면") */
  leadIn: string;
  /** 추천 상품 ID (data/affiliates/products.json) */
  productId: string;
  /** 'mini-card' = 작은 카드, 'text-link' = 한 줄 텍스트 링크 (가장 가벼움) */
  style?: 'mini-card' | 'text-link';
}

/**
 * 가이드 본문 H2 단락 끝의 자연 인용.
 *
 *   원칙:
 *     - 헤딩 카드 그룹과 다르게, 본문 흐름의 일부로 보이도록 디자인
 *     - "광고 슬롯"이 아니라 "단락이 풀어낸 니즈에 대한 정확한 후속 자료"
 *     - 그래서 [광고] 라벨은 카드/링크 자체에만 (별도 박스 X)
 *
 *   주의: AffiliateNotice는 페이지 상단(또는 가이드 첫 단락 위)에 한 번만 표시.
 *   AffiliateInline 자체는 카드/링크 형태에 [광고] 라벨이 있어 추가 면책 불필요.
 */
export default function AffiliateInline({ leadIn, productId, style = 'mini-card' }: Props) {
  const product = getProductById(productId);
  if (!product) return null;

  if (style === 'text-link') {
    if (!product.deeplink) return null;
    return (
      <p className="affiliate-inline-text">
        {leadIn}{' '}
        <Link
          href={product.deeplink}
          target="_blank"
          rel="nofollow sponsored noopener noreferrer"
          className="affiliate-inline-link"
          prefetch={false}
        >
          《{product.title}》
          <ArrowRight size={11} strokeWidth={2.4} aria-hidden />
        </Link>
      </p>
    );
  }

  // mini-card
  return (
    <div className="affiliate-inline-mini">
      <p className="affiliate-inline-leadin">{leadIn}</p>
      <ProductCard product={product} variant="mini" />
    </div>
  );
}
