import Link from 'next/link';
import { BookOpen, ArrowRight, Notebook } from 'lucide-react';
import {
  getProductsFor,
  getAllProducts,
  getMixedProductsForTicker,
  type ProductCategory,
  type ProductEntry,
} from '@/lib/products';

interface Props {
  /**
   * top    = hero 직후 (3번째 박스 위치) — 자동 좌측 ticker 회전 + 골드 강조
   * bottom = 페이지 가장 하단 — 정적 그리드 (현재 톤 유지)
   */
  position: 'top' | 'bottom';
  /** 페이지 카테고리에 매칭 (bottom용). top은 mixed로 자동 선택. 없으면 전체 상위. */
  category?: ProductCategory;
  /** 카드 갯수 — top은 기본 8 (ticker 회전 자연), bottom은 기본 4 */
  limit?: number;
}

/**
 * 사이트 전체 페이지에 노출되는 추천 자료 박스.
 *
 *   - position: top = hero 직후, bottom = 푸터 직전
 *   - category prop으로 페이지 의도와 매칭 (income·retirement 등)
 *   - production에서 deeplink 없는 상품 자동 숨김
 *   - 박스 하단 면책 한 줄 — 모든 affiliate 노출 페이지에 자동 적용
 *
 *   디자인은 푸터 미니 섹션과 동일 톤 (사용자 요청 디자인).
 *   /resources 페이지에는 자기 참조 회피로 사용 안 함.
 */
export default function RecommendBox({ position, category, limit }: Props) {
  const isTicker = position === 'top';
  const finalLimit = limit ?? (isTicker ? 8 : 4);

  // top(ticker): 여러 니즈에서 mix → 회전 시 카테고리 다양성 노출
  // bottom(static): 페이지 카테고리 매칭 우선
  const products: ProductEntry[] = isTicker
    ? getMixedProductsForTicker(finalLimit)
    : (category ? getProductsFor(category, finalLimit) : getAllProducts().slice(0, finalLimit));

  if (products.length === 0) return null;

  // 카드 렌더 함수 — 정적/티커 공용
  const renderCard = (p: ProductEntry, dupIndex = 0) => {
    const Icon = p.tone === 'tool' ? Notebook : BookOpen;
    const inner = (
      <>
        <div className="recommend-box-card-meta">
          <span className="recommend-box-card-tag">{p.tone === 'book' ? '도서' : '학습 도구'}</span>
          <Icon size={11} strokeWidth={2} aria-hidden />
        </div>
        <div className="recommend-box-card-title">{p.title}</div>
        {p.subtitle && <div className="recommend-box-card-sub">{p.subtitle}</div>}
      </>
    );
    if (!p.deeplink) {
      return (
        <li key={`${p.id}-${dupIndex}`} aria-hidden={dupIndex > 0 ? true : undefined}>
          <div className="recommend-box-card recommend-box-card-pending">{inner}</div>
        </li>
      );
    }
    return (
      <li key={`${p.id}-${dupIndex}`} aria-hidden={dupIndex > 0 ? true : undefined}>
        <a
          href={p.deeplink}
          target="_blank"
          rel="nofollow sponsored noopener noreferrer"
          className="recommend-box-card"
          aria-label={`${p.title} — 자세히 보기 (새 탭)`}
          tabIndex={dupIndex > 0 ? -1 : undefined}
        >
          {inner}
        </a>
      </li>
    );
  };

  return (
    <section
      className={`recommend-box recommend-box-${position}${isTicker ? ' recommend-box-ticker' : ''}`}
      aria-label="추천 자료"
    >
      <div className="recommend-box-head">
        <h3 className="recommend-box-title">
          <BookOpen size={14} strokeWidth={2.4} aria-hidden /> 추천 자료
        </h3>
        <Link href="/resources" prefetch={false} className="recommend-box-more">
          전체 자료실 <ArrowRight size={12} strokeWidth={2.4} aria-hidden />
        </Link>
      </div>

      {isTicker ? (
        // ticker 모드 — 카드 2번 복제로 seamless loop, 두 번째 set은 aria-hidden
        <div className="recommend-box-ticker-window" role="region" aria-label="추천 자료 회전 목록">
          <ul className="recommend-box-list recommend-box-ticker-track">
            {products.map(p => renderCard(p, 0))}
            {products.map(p => renderCard(p, 1))}
          </ul>
        </div>
      ) : (
        <ul className="recommend-box-list">
          {products.map(p => renderCard(p, 0))}
        </ul>
      )}

      <p className="recommend-box-disclaimer">
        이 영역은 쿠팡 파트너스 활동의 일환으로, 클릭 후 24시간 내 발생한 구매에 대해 일정 수수료를 받습니다.
      </p>
    </section>
  );
}
