/**
 * 구글이 아직 색인하지 않은 가이드로 가는 링크를 늘리는 목록 (2026-10-14 운영자 지시).
 *
 *   서치콘솔 URL 검사(구글 공식 도구)에서 "Discovered - currently not indexed"(주소는 알지만 아직 가져가지 않음),
 *   "URL is unknown to Google"(아직 모름), "Crawled - currently not indexed"(가져갔지만 색인 보류)로 나온 가이드다.
 *   가이드 목록(/guide)·최신순 목록에는 이미 링크가 있으므로, 구글이 자주 다녀가는 페이지(홈·다른 가이드·비교 페이지)의
 *   본문 가까운 자리에서 같은 주제 글로 한 번 더 이어 수집 우선순위를 올린다.
 *
 *   목록은 다시 잴 때 바꾼다. 색인된 글은 빠지고, 새로 미색인으로 잡힌 글이 들어온다.
 *   링크 문구와 위치는 독자에게도 쓸모 있어야 한다: 같은 주제 글만 고르고, 한 자리에 2~3개만 둔다.
 */
import { GUIDES, type GuideDef } from './guides';
import { GUIDE_CATEGORIES, getCategoryForSection, guideDate, type GuideCategory } from './guide-categories';

/** 서치콘솔 URL 검사로 잰 날 */
export const UNINDEXED_MEASURED_AT = '2026-10-14';

/** 아직 색인되지 않은 가이드 slug (80편, URL is unknown to Google 14 · Discovered - currently not indexed 65 · Crawled - currently not indexed 1) */
export const UNINDEXED_GUIDE_SLUGS: readonly string[] = [
  'adjusted-stock-price-chart',
  'basic-pension-with-private-pension',
  'bitcoin-dominance-altcoin',
  'bitcoin-krw-buy-withdrawal',
  'cd-rate-etf-interest-accrual',
  'cd-rate-etf-vs-parking',
  'child-gifted-stock-sale-tax',
  'company-irp-vs-individual-irp',
  'corporate-retained-earnings-tax',
  'crypto-exchange-fee-structure',
  'crypto-leverage-long-term-risk',
  'crypto-liquidation-explained',
  'dca-order-type',
  'default-option-change-effect',
  'dividend-record-date-reform',
  'domestic-dividend-income-tax',
  'domestic-sp500-etf-comparison',
  'etf-discount-rate-buy-signal',
  'etf-distribution-payment-date-lookup',
  'etf-distribution-tax-base-zero',
  'etf-fee-discount-relation',
  'etf-return-rate-difference',
  'etf-trading-cost',
  'financial-income-dependent-eligibility',
  'foreign-stock-fee-fx-spread',
  'game-etf',
  'gift-before-death-inheritance-tax-merge',
  'inheritance-tax-payment-in-kind',
  'inverse-etf-crash-safety',
  'investing-fomo-meaning',
  'investing-with-borrowed-money',
  'irp-severance-pay-tax-deferral',
  'isa-broker-vs-trust-type',
  'isa-contract-period-long-term',
  'isa-dividend-tax-benefit',
  'isa-domestic-equity-etf-benefit',
  'isa-pension-actual-withdrawal-amount',
  'isa-pension-same-etf-overlap',
  'isa-restricted-products',
  'isa-sp500-nasdaq100-together',
  'isa-termination-after-3-years',
  'isa-to-pension-tax-credit',
  'korea-bitcoin-etf-status-tax',
  'kospi200-vs-kosdaq150',
  'luxury-etf',
  'market-circuit-breaker-vi',
  'nasdaq100-etf-individual-stock-exposure',
  'nasdaq100-etf-korea-us-gap',
  'national-pension-income-tax',
  'national-pension-lump-sum',
  'overseas-crypto-futures-tax',
  'overseas-etf-dividend-currency',
  'overseas-etf-geopolitical-discount-spike',
  'overseas-stock-tax-split-payment',
  'overseas-stock-under-250-no-filing',
  'overseas-stock-year-end-sell-amount',
  'pension-irp-combined-tax-credit',
  'pension-monthly-contribution-amount',
  'reit-etf-types-tax',
  'reit-inverse-etf-real-estate-drop',
  'related-party-stock-trade-gift-tax',
  'retiree-dividend-etf-monthly-income',
  'saving-vs-investing-inflation',
  'severance-pay-irp-immediate-withdrawal',
  'sgov-dollar-parking-etf',
  'single-stock-inverse-etf-2x-only',
  'single-stock-leverage-etf',
  'sp500-nasdaq-overlap',
  'stock-leading-room-scam',
  'stock-market-volatility-causes',
  'stock-order-rejected-reasons',
  'stock-order-types-guide',
  'us-etf-delisting-vs-domestic',
  'us-etf-drip-korea',
  'us-etf-nav-discount-check',
  'us-etf-tax-saving-checklist',
  'us-stock-capital-gains-tax-filing',
  'us-stock-ex-dividend-date-check',
  'us-stock-krw-integrated-margin',
  'us-treasury-3x-leverage-etf',
];

const UNINDEXED = new Set(UNINDEXED_GUIDE_SLUGS);

export function isUnindexedGuide(slug: string): boolean {
  return UNINDEXED.has(slug);
}

/** 문자열을 0 이상의 정수로 (같은 입력이면 늘 같은 값). 링크가 몇 편에만 몰리지 않게 시작 위치를 돌리는 데 쓴다. */
function seedOf(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * 같은 주제 허브의 미색인 가이드 n편.
 *   seed(보통 지금 페이지 주소)로 시작 위치를 돌려, 같은 주제의 미색인 가이드가 고르게 링크를 받게 한다.
 */
export function pickUnindexedGuides(opts: {
  categories: (GuideCategory | null | undefined)[];
  exclude?: Iterable<string>;
  n: number;
  seed: string;
}): GuideDef[] {
  const sections = new Set(opts.categories.flatMap(c => (c ? c.sections : [])));
  const exclude = new Set(opts.exclude || []);
  const pool = GUIDES
    .filter(g => UNINDEXED.has(g.slug) && sections.has(g.section) && !exclude.has(g.slug))
    .sort((a, b) => a.slug.localeCompare(b.slug));
  if (pool.length <= opts.n) return pool;
  const start = seedOf(opts.seed) % pool.length;
  return [...pool.slice(start), ...pool.slice(0, start)].slice(0, opts.n);
}

/** 미색인 가이드 전체를 주제 허브별로 (홈·가이드 목록의 "주제별로 더 읽어 볼 가이드" 묶음용). 허브 순서, 허브 안은 최근 순. */
export function unindexedGuidesByCategory(): { category: GuideCategory; guides: GuideDef[] }[] {
  const groups = new Map<string, GuideDef[]>();
  for (const g of GUIDES) {
    if (!UNINDEXED.has(g.slug)) continue;
    const c = getCategoryForSection(g.section);
    if (!c) continue;
    const list = groups.get(c.key) || [];
    list.push(g);
    groups.set(c.key, list);
  }
  return GUIDE_CATEGORIES
    .filter(c => groups.has(c.key))
    .map(c => ({ category: c, guides: groups.get(c.key)!.sort((a, b) => guideDate(b).localeCompare(guideDate(a))) }));
}
