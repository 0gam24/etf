import { ExternalLink, BookOpen, Star, Truck, Notebook } from 'lucide-react';
import type { ProductEntry } from '@/lib/products';

interface Props {
  product: ProductEntry;
  /**
   * full = 그리드 카드 (기본, 가격·별점·로켓 표시)
   * mini = 텍스트 인라인 옆 작은 카드 (단락별 affiliateInline용)
   * resource = /resources 페이지용 viewer-first 카드 (가격 X, 가격 자리에 hook, 통일 그리드)
   */
  variant?: 'full' | 'mini' | 'resource';
}

/**
 * 쿠팡 파트너스 상품(책·학습 도구) 카드.
 *
 *   - 카드 전체 클릭 가능 (a 태그)
 *   - rel="sponsored nofollow noopener noreferrer" + target="_blank"
 *   - [광고] 라벨 (공정위 요구)
 *   - 호버 시 미세 라이즈
 *   - deeplink 없으면 dev placeholder (production 자동 숨김)
 *   - 별점·리뷰·로켓배송·할인율 자동 노출 (있을 때만)
 */
export default function ProductCard({ product, variant = 'full' }: Props) {
  const hasLink = !!product.deeplink;
  const isBook = product.tone === 'book';
  const Icon = isBook ? BookOpen : Notebook;
  const discountPct = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const cover = product.image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={product.image}
      alt={`${product.title}${product.source ? ` — ${product.source}` : ''} 표지`}
      loading="lazy"
    />
  ) : (
    <div className="product-card-cover-placeholder">
      <Icon size={variant === 'mini' ? 22 : 28} strokeWidth={1.6} aria-hidden />
    </div>
  );

  const meta = (
    <div className="product-card-meta">
      {product.source && <span className="product-card-source">{product.source}{product.year ? ` · ${product.year}` : ''}</span>}
    </div>
  );

  const stats = (product.ratingAverage || product.isRocket || discountPct > 0) ? (
    <div className="product-card-stats">
      {typeof product.ratingAverage === 'number' && (
        <span className="product-card-rating">
          <Star size={11} strokeWidth={2.4} fill="currentColor" aria-hidden />
          {product.ratingAverage.toFixed(1)}
          {typeof product.ratingCount === 'number' && product.ratingCount > 0 && (
            <span className="product-card-rating-count"> · 리뷰 {product.ratingCount.toLocaleString()}</span>
          )}
        </span>
      )}
      {product.isRocket && (
        <span className="product-card-rocket">
          <Truck size={11} strokeWidth={2.4} aria-hidden /> 로켓배송
        </span>
      )}
      {discountPct > 0 && (
        <span className="product-card-discount">{discountPct}% ↓</span>
      )}
    </div>
  ) : null;

  const cta = hasLink ? (
    <span className="product-card-cta">
      자세히 보기 <ExternalLink size={11} strokeWidth={2.5} aria-hidden />
    </span>
  ) : (
    <span className="product-card-cta product-card-cta-pending">[준비 중]</span>
  );

  if (variant === 'mini') {
    const inner = (
      <>
        <div className="product-mini-cover">{cover}</div>
        <div className="product-mini-body">
          {product.source && (
            <div className="product-mini-meta">
              <span className="product-mini-source">{product.source}</span>
            </div>
          )}
          <div className="product-mini-title">{product.title}</div>
          {(product.subtitle || product.blurb) && (
            <div className="product-mini-sub">{product.subtitle || product.blurb}</div>
          )}
          {cta}
        </div>
      </>
    );
    return hasLink ? (
      <a
        href={product.deeplink}
        target="_blank"
        rel="nofollow sponsored noopener noreferrer"
        className="product-mini"
        aria-label={`${product.title} — 자세히 보기 (새 탭)`}
      >
        {inner}
      </a>
    ) : (
      <div className="product-mini product-mini-pending">{inner}</div>
    );
  }

  // resource 카드 — /resources 페이지 전용 (viewer-first)
  if (variant === 'resource') {
    const innerResource = (
      <>
        <div className="product-card-resource-cover" aria-hidden>{cover}</div>
        <div className="product-card-resource-body">
          <div className="product-card-resource-tag">
            {product.tone === 'book' ? '도서' : '학습 도구'}
            {product.source && <span className="product-card-resource-source"> · {product.source}</span>}
          </div>
          <h3 className="product-card-resource-title">{product.title}</h3>
          <p className="product-card-resource-hook">
            {product.hook || product.blurb || product.subtitle || ''}
          </p>
          {(product.ratingAverage || product.isRocket) && (
            <div className="product-card-resource-stats">
              {typeof product.ratingAverage === 'number' && product.ratingAverage > 0 && (
                <span className="product-card-rating">
                  <Star size={11} strokeWidth={2.4} fill="currentColor" aria-hidden />
                  {product.ratingAverage.toFixed(1)}
                  {typeof product.ratingCount === 'number' && product.ratingCount > 0 && (
                    <span className="product-card-rating-count"> · 리뷰 {product.ratingCount.toLocaleString()}</span>
                  )}
                </span>
              )}
              {product.isRocket && (
                <span className="product-card-rocket">
                  <Truck size={11} strokeWidth={2.4} aria-hidden /> 로켓배송
                </span>
              )}
            </div>
          )}
          {cta}
        </div>
      </>
    );
    return hasLink ? (
      <a
        href={product.deeplink}
        target="_blank"
        rel="nofollow sponsored noopener noreferrer"
        className="product-card-resource"
        aria-label={`${product.title} — 자세히 보기 (새 탭)`}
      >
        {innerResource}
      </a>
    ) : (
      <div className="product-card-resource product-card-resource-pending">{innerResource}</div>
    );
  }

  // full 카드
  const innerFull = (
    <>
      <div className="product-card-cover" aria-hidden>{cover}</div>
      <div className="product-card-body">
        {meta}
        <h3 className="product-card-title">{product.title}</h3>
        {product.subtitle && <div className="product-card-subtitle">{product.subtitle}</div>}
        {product.blurb && <p className="product-card-blurb">{product.blurb}</p>}
        {product.price > 0 && (
          <div className="product-card-price">
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="product-card-price-original">{product.originalPrice.toLocaleString()}원</span>
            )}
            <span className="product-card-price-now">{product.price.toLocaleString()}원</span>
          </div>
        )}
        {stats}
        {cta}
      </div>
    </>
  );

  return hasLink ? (
    <a
      href={product.deeplink}
      target="_blank"
      rel="nofollow sponsored noopener noreferrer"
      className="product-card"
      aria-label={`${product.title} — 자세히 보기 (새 탭)`}
    >
      {innerFull}
    </a>
  ) : (
    <div className="product-card product-card-pending">{innerFull}</div>
  );
}
