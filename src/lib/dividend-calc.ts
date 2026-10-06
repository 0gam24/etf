/**
 * ETF 분배금 계산: 순수 함수 모음 (/tools/dividend-calculator).
 *
 *   서버(page.tsx 예시표)와 브라우저(DividendCalculator) 양쪽에서 쓰므로 fs·path·Date 의존 금지.
 *   숫자 포맷도 Intl 대신 직접 구현한다. 서버 렌더와 브라우저 렌더의 결과가 달라지는
 *   하이드레이션 불일치를 피하려는 것이다.
 *
 *   세율 근거
 *     - 배당소득 원천징수 소득세 14%: 소득세법 제129조 제1항 제2호
 *     - 개인지방소득세 특별징수 = 원천징수 소득세의 10% (1.4%): 지방세법 제103조의13
 *     - 이자·배당소득 합계 연 2,000만원 이하 분리과세: 소득세법 제14조 제3항 제6호
 *   계산은 "일반계좌에서 분배금 전액에 15.4%가 원천징수된다"는 단순 가정이다.
 *   국내 상장 ETF는 운용사가 공시하는 주당 과세표준으로 세금을 떼는 경우가 있어 실제 세액은 다를 수 있다.
 */

/** 배당소득 원천징수 소득세율 */
export const INCOME_TAX_RATE = 0.14;
/** 개인지방소득세(소득세의 10%) */
export const LOCAL_INCOME_TAX_RATE = 0.014;
/** 일반계좌 분배금 원천징수 합계 세율 15.4% (= 14% + 1.4%, 부동소수 오차를 피하려고 리터럴로 둔다) */
export const WITHHOLDING_RATE = 0.154;
/** 금융소득(이자+배당) 종합과세 기준 금액 (연) */
export const FINANCIAL_INCOME_THRESHOLD = 20_000_000;

export type PayoutFrequency = 'monthly' | 'quarterly' | 'semi-annual' | 'annual';

export const PAYOUTS_PER_YEAR: Record<PayoutFrequency, number> = {
  monthly: 12,
  quarterly: 4,
  'semi-annual': 2,
  annual: 1,
};

export const PAYOUT_LABEL: Record<number, string> = {
  12: '월 분배 (연 12회)',
  4: '분기 분배 (연 4회)',
  2: '반기 분배 (연 2회)',
  1: '연 1회 분배',
};

/** 유한한 양수만 통과, 나머지(음수·NaN·Infinity)는 0 */
export function toPositive(n: unknown): number {
  const v = typeof n === 'number' ? n : Number(n);
  return Number.isFinite(v) && v > 0 ? v : 0;
}

/** 부동소수 오차(예: 2.9999999996)를 정수 경계에서 흡수할 때 쓰는 허용치 */
const EPS = 1e-9;

/** 투자금으로 살 수 있는 수량 (1주 미만 버림) */
export function sharesFromAmount(amount: number, price: number): number {
  const a = toPositive(amount);
  const p = toPositive(price);
  if (!a || !p) return 0;
  return Math.floor(a / p + EPS);
}

/**
 * 연 분배율(%)로 1회 주당 분배금을 어림한다 (원 단위 반올림).
 *   예시값을 만들 때만 쓴다. 실제 주당 분배금은 운용사 분배 공시 금액이 기준이다.
 */
export function estimatePerShareFromYield(price: number, yieldPct: number, payoutsPerYear: number): number {
  const p = toPositive(price);
  const y = toPositive(yieldPct);
  const n = toPositive(payoutsPerYear);
  if (!p || !y || !n) return 0;
  return Math.round((p * y) / 100 / n);
}

export interface DividendCalcInput {
  /** 'amount' = 투자금으로 수량 환산, 'shares' = 보유 수량 직접 입력 */
  mode: 'amount' | 'shares';
  /** 투자금 (원), mode 'amount'일 때 */
  amount?: number;
  /** 보유 수량 (주), mode 'shares'일 때 */
  shares?: number;
  /** 1주 가격 (원) */
  price: number;
  /** 1회 1주당 분배금 (원) */
  perShare: number;
  /** 연 분배 횟수 (12·4·2·1) */
  payoutsPerYear: number;
  /** 원천징수 세율 (기본 15.4%) */
  taxRate?: number;
}

export interface DividendCalcResult {
  /** 계산에 쓴 수량 */
  shares: number;
  /** 수량 × 1주 가격 */
  invested: number;
  /** 투자금 모드에서 1주 미만이라 남는 금액 (수량 모드는 0) */
  leftover: number;
  /** 1회 세전 분배금 */
  perPayoutGross: number;
  /** 1회 원천징수 세액 (원 단위 반올림) */
  perPayoutTax: number;
  /** 1회 세후 분배금 */
  perPayoutNet: number;
  /** 연간 세전 분배금 */
  annualGross: number;
  /** 연간 원천징수 세액 = 1회 세액 × 연 횟수 */
  annualTax: number;
  /** 연간 세후 분배금 */
  annualNet: number;
  /** 월평균 세전 (연간 ÷ 12, 원 단위 반올림) */
  monthlyGrossAvg: number;
  /** 월평균 세후 (연간 ÷ 12, 원 단위 반올림) */
  monthlyNetAvg: number;
  /** 가격 대비 연 분배율 % = 1주당 분배금 × 연 횟수 ÷ 1주 가격 × 100 */
  yieldOnPricePct: number;
  /** 이 분배금만으로 연 2,000만원(금융소득 종합과세 기준)을 넘는가 */
  overThreshold: boolean;
}

/**
 * 분배금 계산.
 *   원천징수는 분배금이 들어올 때마다 따로 떼므로 세액을 1회 단위로 반올림한 뒤 연 횟수를 곱한다.
 */
export function calcDividend(input: DividendCalcInput): DividendCalcResult {
  const price = toPositive(input.price);
  const perShare = toPositive(input.perShare);
  const payouts = Math.round(toPositive(input.payoutsPerYear));
  const taxRate = input.taxRate === undefined ? WITHHOLDING_RATE : Math.min(1, toPositive(input.taxRate));

  let shares: number;
  let leftover = 0;
  if (input.mode === 'amount') {
    const amount = toPositive(input.amount);
    shares = sharesFromAmount(amount, price);
    leftover = price ? Math.max(0, Math.round(amount - shares * price)) : 0;
  } else {
    shares = Math.floor(toPositive(input.shares) + EPS);
  }

  const invested = Math.round(shares * price);
  const perPayoutGross = Math.round(shares * perShare);
  const perPayoutTax = Math.round(perPayoutGross * taxRate);
  const perPayoutNet = perPayoutGross - perPayoutTax;
  const annualGross = perPayoutGross * payouts;
  const annualTax = perPayoutTax * payouts;
  const annualNet = perPayoutNet * payouts;
  const yieldOnPricePct = price ? (perShare * payouts / price) * 100 : 0;

  return {
    shares,
    invested,
    leftover,
    perPayoutGross,
    perPayoutTax,
    perPayoutNet,
    annualGross,
    annualTax,
    annualNet,
    monthlyGrossAvg: Math.round(annualGross / 12),
    monthlyNetAvg: Math.round(annualNet / 12),
    yieldOnPricePct,
    overThreshold: annualGross > FINANCIAL_INCOME_THRESHOLD,
  };
}

export interface TargetCalcInput {
  /** 목표 월평균 분배금 (원) */
  targetMonthly: number;
  /** 'net' = 세후 기준, 'gross' = 세전 기준 */
  basis: 'net' | 'gross';
  price: number;
  perShare: number;
  payoutsPerYear: number;
  taxRate?: number;
}

export interface TargetCalcResult {
  /** 목표를 채우는 최소 수량 (올림) */
  requiredShares: number;
  /** 최소 수량 × 1주 가격 */
  requiredAmount: number;
  /** 그 수량으로 계산한 분배금 */
  result: DividendCalcResult;
}

/**
 * 목표 월평균 분배금 역산.
 *   필요 수량 = 올림(목표 월 × 12 ÷ (1주당 분배금 × 연 횟수 × (1 − 세율)))  … 세후 기준
 *   1회 단위 세액 반올림 때문에 1~2원 모자랄 수 있어, 계산 결과가 목표에 못 미치면 1주씩 더한다.
 *   가격·분배금·횟수 중 하나라도 0이면 계산할 수 없으므로 null.
 */
export function calcRequiredForTarget(input: TargetCalcInput): TargetCalcResult | null {
  const target = toPositive(input.targetMonthly);
  const price = toPositive(input.price);
  const perShare = toPositive(input.perShare);
  const payouts = Math.round(toPositive(input.payoutsPerYear));
  const taxRate = input.taxRate === undefined ? WITHHOLDING_RATE : Math.min(1, toPositive(input.taxRate));
  if (!target || !price || !perShare || !payouts) return null;
  const keep = input.basis === 'net' ? 1 - taxRate : 1;
  if (keep <= 0) return null;

  const annualTarget = target * 12;
  let shares = Math.ceil(annualTarget / (perShare * payouts * keep) - EPS);
  const run = (s: number) => calcDividend({
    mode: 'shares', shares: s, price, perShare, payoutsPerYear: payouts, taxRate,
  });
  let result = run(shares);
  const reached = (r: DividendCalcResult) =>
    (input.basis === 'net' ? r.annualNet : r.annualGross) >= annualTarget;
  for (let i = 0; i < 5 && !reached(result); i++) {
    shares += 1;
    result = run(shares);
  }
  return { requiredShares: shares, requiredAmount: result.invested, result };
}

/** 1234567 → '1,234,567' (Intl 미사용, 정수로 반올림) */
export function formatWon(n: number): string {
  if (!Number.isFinite(n)) return '0';
  const sign = n < 0 ? '-' : '';
  const s = String(Math.round(Math.abs(n)));
  return sign + s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** 236410000 → '2억 3,641만원', 9993465 → '999만 3,465원'. 1만원 미만은 '8,500원' */
export function formatKrwShort(n: number): string {
  const v = Math.round(toPositive(n));
  if (!v) return '0원';
  const eok = Math.floor(v / 100_000_000);
  const man = Math.floor((v % 100_000_000) / 10_000);
  const won = v % 10_000;
  const parts: string[] = [];
  if (eok) parts.push(`${formatWon(eok)}억`);
  if (man) parts.push(`${formatWon(man)}만`);
  if (won) parts.push(formatWon(won));
  return `${parts.join(' ')}원`;
}

/** 천 단위 쉼표 + 소수 자릿수 고정 (예: 10844.337 → '10,844.34') */
export function formatNumber(n: number, digits = 0): string {
  if (!Number.isFinite(n)) return '0';
  const [int, frac] = Math.abs(n).toFixed(digits).split('.');
  const sign = n < 0 ? '-' : '';
  return sign + int.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (frac ? `.${frac}` : '');
}

/** 소수 자릿수 고정 퍼센트 (예: 5.3794 → '5.38') */
export function formatPct(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return '0';
  return n.toFixed(digits);
}
