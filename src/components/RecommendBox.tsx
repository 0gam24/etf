import Link from 'next/link';
import { BookOpen, ArrowRight, Notebook } from 'lucide-react';
import { getProductsFor, getAllProducts, type ProductCategory, type ProductEntry } from '@/lib/products';

interface Props {
  /** top = hero 직후 (3번째 박스 위치), bottom = 페이지 가장 하단 */
  position: 'top' | 'bottom';
  /** 페이지 카테고리에 매칭. 없으면 mixed (전체 큐레이션에서 상위 4개) */
  category?: ProductCategory;
  /** 카드 갯수 (기본 4) */
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
export default function RecommendBox({ position, category, limit = 4 }: Props) {
  const products: ProductEntry[] = category
    ? getProductsFor(category, limit)
    : getAllProducts().slice(0, limit);

  if (products.length === 0) return null;

  return (
    <section className={`recommend-box recommend-box-${position}`} aria-label="추천 자료">
      <div className="recommend-box-head">
        <h3 className="recommend-box-title">
          <BookOpen size={14} strokeWidth={2.4} aria-hidden /> 추천 자료
        </h3>
        <Link href="/resources" prefetch={false} className="recommend-box-more">
          전체 자료실 <ArrowRight size={12} strokeWidth={2.4} aria-hidden />
        </Link>
      </div>

      <ul className="recommend-box-list">
        {products.map(p => {
          const Icon = p.tone === 'tool' ? Notebook : BookOpen;
          if (!p.deeplink) {
            return (
              <li key={p.id}>
                <div className="recommend-box-card recommend-box-card-pending">
                  <div className="recommend-box-card-meta">
                    <span className="recommend-box-card-tag">{p.tone === 'book' ? '도서' : '학습 도구'}</span>
                    <Icon size={11} strokeWidth={2} aria-hidden />
                  </div>
                  <div className="recommend-box-card-title">{p.title}</div>
                  {p.subtitle && <div className="recommend-box-card-sub">{p.subtitle}</div>}
                </div>
              </li>
            );
          }
          return (
            <li key={p.id}>
              <a
                href={p.deeplink}
                target="_blank"
                rel="nofollow sponsored noopener noreferrer"
                className="recommend-box-card"
                aria-label={`${p.title} — 자세히 보기 (새 탭)`}
              >
                <div className="recommend-box-card-meta">
                  <span className="recommend-box-card-tag">{p.tone === 'book' ? '도서' : '학습 도구'}</span>
                  <Icon size={11} strokeWidth={2} aria-hidden />
                </div>
                <div className="recommend-box-card-title">{p.title}</div>
                {p.subtitle && <div className="recommend-box-card-sub">{p.subtitle}</div>}
              </a>
            </li>
          );
        })}
      </ul>

      <p className="recommend-box-disclaimer">
        이 영역은 쿠팡 파트너스 활동의 일환으로, 클릭 후 24시간 내 발생한 구매에 대해 일정 수수료를 받습니다.
      </p>
    </section>
  );
}
