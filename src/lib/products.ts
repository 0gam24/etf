/**
 * 쿠팡 파트너스 상품(책 + 학습 도구) 큐레이션 — 통합 로더.
 *
 *   데이터: data/affiliates/products.json (cron이 갱신)
 *   책 80% + 학습 도구 20% (다이어리·가계부·워크북). 그 외 상품 미사용.
 *
 *   ⚠️ deeplink가 비어 있는 항목은 production에서 자동 숨김.
 *      dev에서는 placeholder 노출 (큐레이션 확인용).
 */

import fs from 'fs';
import path from 'path';

export type ProductCategory =
  | 'income'        // 월배당·커버드콜
  | 'covered-call'
  | 'retirement'    // IRP·ISA·연금저축
  | 'defense-etf'
  | 'ai-semi-etf'
  | 'general';      // ETF 입문·일반

export type ProductTone = 'book' | 'tool';

export interface ProductEntry {
  /** 내부 식별자 (slug-like 또는 productId) */
  id: string;
  /** 표시 제목 */
  title: string;
  /** 부제 — 도서: 저자, 도구: 사용 용도 */
  subtitle: string;
  /** 출판사 / 제조사 / 브랜드 */
  source: string;
  /** 출간/제조 연도 */
  year?: number;
  /** 가격(원). 0 = 표시 안 함 */
  price: number;
  /** 정가(할인 표시용). 없으면 표시 안 함 */
  originalPrice?: number;
  /** 한 줄 추천 사유 (시청자 가치 관점) */
  blurb: string;
  /** 쿠팡 단축 deeplink (https://link.coupang.com/a/...). 비어 있으면 production에서 숨김 */
  deeplink: string;
  /** 표지/이미지 URL — 쿠팡 productImage(API 핫링크 OK) 또는 자체 호스팅 */
  image: string;
  /** 어떤 가이드/카테고리에서 노출할지 (다중) */
  categories: ProductCategory[];
  /** 'book' = 도서, 'tool' = 학습 도구 */
  tone: ProductTone;
  /** 별점(0~5) */
  ratingAverage?: number;
  /** 리뷰 수 */
  ratingCount?: number;
  /** 로켓배송 여부 — CTA 강화 */
  isRocket?: boolean;
  /** 마지막 큐레이션 갱신 시각 (ISO) */
  pickedAt?: string;
  /** 자동 fetch 시 어떤 키워드에서 나왔는지 */
  pickedFromKeyword?: string;
}

export interface ProductsRegistry {
  /** 마지막 점검일 (YYYY-MM-DD) */
  reviewedAt: string;
  /** 등록 상품 목록 */
  products: ProductEntry[];
}

const REGISTRY_FILE = path.join(process.cwd(), 'data', 'affiliates', 'products.json');

function loadRegistry(): ProductsRegistry {
  if (!fs.existsSync(REGISTRY_FILE)) return { reviewedAt: '', products: [] };
  try {
    const raw = fs.readFileSync(REGISTRY_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as ProductsRegistry;
    return parsed;
  } catch {
    return { reviewedAt: '', products: [] };
  }
}

function isProd(): boolean {
  return process.env.NODE_ENV === 'production';
}

function visible(p: ProductEntry): boolean {
  return !isProd() || (Boolean(p.deeplink) && p.deeplink.length > 0);
}

/** 카테고리에 매칭되는 상품 N개 */
export function getProductsFor(category: ProductCategory, limit = 3): ProductEntry[] {
  return loadRegistry()
    .products.filter(p => p.categories.includes(category))
    .filter(visible)
    .slice(0, limit);
}

/** 카테고리 + tone 필터 (예: 책만, 도구만) */
export function getProductsByTone(category: ProductCategory, tone: ProductTone, limit = 3): ProductEntry[] {
  return loadRegistry()
    .products.filter(p => p.categories.includes(category) && p.tone === tone)
    .filter(visible)
    .slice(0, limit);
}

/** ID로 단일 상품 조회 (단락별 affiliateInline에서 사용) */
export function getProductById(id: string): ProductEntry | null {
  return loadRegistry().products.find(p => p.id === id && visible(p)) || null;
}

/** /resources 페이지 — 전체 큐레이션 */
export function getAllProducts(): ProductEntry[] {
  return loadRegistry().products.filter(visible);
}

/** /resources 카테고리 필터 */
export function getProductsGroupedByCategory(): Array<{ category: ProductCategory; products: ProductEntry[] }> {
  const all = getAllProducts();
  const cats: ProductCategory[] = ['income', 'retirement', 'covered-call', 'defense-etf', 'ai-semi-etf', 'general'];
  return cats.map(category => ({
    category,
    products: all.filter(p => p.categories.includes(category)),
  })).filter(g => g.products.length > 0);
}

export const CATEGORY_LABEL: Record<ProductCategory, string> = {
  'income':       '월배당·커버드콜',
  'covered-call': '커버드콜 전략',
  'retirement':   '은퇴 자산 설계',
  'defense-etf':  '방산 섹터',
  'ai-semi-etf':  'AI·반도체',
  'general':      'ETF 입문',
};
