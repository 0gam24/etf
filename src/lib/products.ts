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

/**
 * 시청자 니즈(질문)별 분류 — /resources 페이지의 viewer-first 그룹핑.
 *   카테고리(income·retirement 등)와 별도 — 한 책이 여러 니즈에 매칭 가능.
 */
export type ProductNeed =
  | 'monthly-cashflow'        // 월 OO만원 통장에 꽂히려면 얼마가 필요한가?
  | 'retirement-30y'          // 은퇴 후 30년, 자산이 안 떨어지게 굴리려면?
  | 'etf-basics'              // ETF가 뭔지부터 차근차근 알고 싶다
  | 'covered-call-structure'  // 커버드콜이 진짜 안전한가? 옵션 매도 구조가 궁금
  | 'tool-cashflow'           // 분배금·종목·자산을 한 권에 정리하고 싶다 (도구)
  | 'investor-psychology';    // 투자에서 후회를 줄이려면 마음가짐이 어떻게?

export const NEED_QUESTION: Record<ProductNeed, string> = {
  'monthly-cashflow':        '"월 OO만원 통장에 꽂히려면 얼마가 필요한가?"',
  'retirement-30y':          '"은퇴 후 30년, 자산이 안 떨어지게 굴리려면?"',
  'etf-basics':              '"ETF가 뭔지부터 차근차근 알고 싶다"',
  'covered-call-structure':  '"커버드콜이 진짜 안전한가? 옵션 매도 구조가 궁금"',
  'tool-cashflow':           '"분배금·종목·자산을 한 권에 정리하고 싶다"',
  'investor-psychology':     '"투자에서 후회를 줄이려면 마음가짐이 어떻게?"',
};

/** 니즈별 부제 — 섹션 헤더 보조 설명 */
export const NEED_CAPTION: Record<ProductNeed, string> = {
  'monthly-cashflow':        '월배당 분배 사이클·실전 시뮬레이션을 다룬 자료',
  'retirement-30y':          '계좌 활용·자산배분·인출 시뮬레이션 실전 가이드',
  'etf-basics':              'ETF가 뭔지·왜 사야 하는지·운용보수까지 처음부터',
  'covered-call-structure':  '옵션 매도 구조와 분배의 실제 동작',
  'tool-cashflow':           '본인 가계부·종목 노트로 옮기기 좋은 워크북·다이어리',
  'investor-psychology':     '단기 흔들림에 무너지지 않는 마음가짐',
};

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
  /**
   * 시청자 가치 관점 한 문장 — /resources 카드의 가격 자리에 노출.
   *   책 광고 카피가 아니라 "이 책이 시청자 니즈를 어떻게 푸는가".
   */
  hook?: string;
  /** 어떤 시청자 니즈(질문)에 매칭되는지 (다중) */
  needs?: ProductNeed[];
}

export interface ProductsRegistry {
  /** 마지막 점검일 (YYYY-MM-DD) */
  reviewedAt: string;
  /** 등록 상품 목록 */
  products: ProductEntry[];
}

const REGISTRY_FILE = path.join(process.cwd(), 'data', 'affiliates', 'products.json');

export function getProductsRegistry(): ProductsRegistry {
  return loadRegistry();
}

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

/** /resources 카테고리 필터 (legacy — 카테고리 그룹) */
export function getProductsGroupedByCategory(): Array<{ category: ProductCategory; products: ProductEntry[] }> {
  const all = getAllProducts();
  const cats: ProductCategory[] = ['income', 'retirement', 'covered-call', 'defense-etf', 'ai-semi-etf', 'general'];
  return cats.map(category => ({
    category,
    products: all.filter(p => p.categories.includes(category)),
  })).filter(g => g.products.length > 0);
}

/**
 * /resources 페이지 viewer-first — 시청자 니즈(질문)별 그룹.
 *
 *   중복 제거 정책: 각 책의 needs[0] = primary need로 정의.
 *   책은 primary need 섹션에만 노출. 다른 secondary 매칭은 무시.
 *   결과: 한 책이 여러 섹션에 중복 노출 X, 각 책은 단 한 섹션.
 *
 *   limitPerSection: 섹션당 카드 갯수 상한 (기본 5)
 */
export function getProductsGroupedByNeed(limitPerSection = 5): Array<{ need: ProductNeed; products: ProductEntry[] }> {
  const all = getAllProducts();
  const needs: ProductNeed[] = [
    'monthly-cashflow',
    'retirement-30y',
    'etf-basics',
    'covered-call-structure',
    'tool-cashflow',
    'investor-psychology',
  ];
  return needs
    .map(need => {
      // primary need = needs[0]만 매칭 → 자동 중복 제거
      const matched = all.filter(p => p.needs && p.needs[0] === need);
      return { need, products: matched.slice(0, limitPerSection) };
    })
    .filter(g => g.products.length > 0);
}

/** 단일 니즈로 필터 (필요 시) */
export function getProductsByNeed(need: ProductNeed, limit?: number): ProductEntry[] {
  const list = getAllProducts().filter(p => p.needs?.includes(need));
  return typeof limit === 'number' ? list.slice(0, limit) : list;
}

export const CATEGORY_LABEL: Record<ProductCategory, string> = {
  'income':       '월배당·커버드콜',
  'covered-call': '커버드콜 전략',
  'retirement':   '은퇴 자산 설계',
  'defense-etf':  '방산 섹터',
  'ai-semi-etf':  'AI·반도체',
  'general':      'ETF 입문',
};
