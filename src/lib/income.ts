/**
 * /income 카테고리 — 순수 타입/계산 헬퍼.
 *   브라우저(Client Component)에서도 import 가능하도록 fs/path 사용 금지.
 *   파일 로더는 lib/income-server.ts 참조.
 */

export type StabilityGrade = 'S' | 'A' | 'B' | 'C';
export type Frequency = 'monthly' | 'quarterly' | 'semi-annual' | 'annual';
export type AccountType = 'general' | 'isa' | 'pension';

export interface IncomeEtf {
  code: string;
  name: string;
  issuer: string;
  /** 연간 분배율 (%) */
  yield: number;
  frequency: Frequency;
  /** 지급 월 1~12 */
  payMonths: number[];
  /** 다음 분배락일 ISO (YYYY-MM-DD) — 운용사 공시 fetch 후 채워짐, optional */
  nextExDividendDate?: string;
  /** 최근 분배락일 ISO (YYYY-MM-DD) — 추적용, optional */
  recentExDividendDates?: string[];
  stabilityGrade: StabilityGrade;
  underlying: string;
  note?: string;
}

export interface IncomeRegistry {
  asOf: string;
  disclaimer: string;
  etfs: IncomeEtf[];
}

/**
 * 계좌 유형별 세후 연 수익률(%).
 *  - general: 배당소득세 15.4% (이자배당소득 과세)
 *  - isa: 손익통산 후 200만원까지 비과세 → 0% 근사
 *  - pension: 연금수령 저율과세 5.5% 근사
 */
export function taxRateFor(account: AccountType): number {
  switch (account) {
    case 'general': return 0.154;
    case 'isa':     return 0.0;
    case 'pension': return 0.055;
  }
}

export function afterTaxYield(yieldPct: number, account: AccountType): number {
  return +(yieldPct * (1 - taxRateFor(account))).toFixed(2);
}

/**
 * 월 목표 현금흐름(원) 달성에 필요한 원금(원).
 */
export function requiredPrincipal(targetMonthly: number, yieldPct: number, account: AccountType): number {
  const annualAfterTax = yieldPct / 100 * (1 - taxRateFor(account));
  if (annualAfterTax <= 0) return 0;
  const monthly = annualAfterTax / 12;
  return Math.ceil(targetMonthly / monthly);
}

export interface MonthCell {
  month: number; // 1~12
  count: number;
  samples: string[];
  tickers: string[];
}
export function buildMonthlyMatrix(etfs: IncomeEtf[]): MonthCell[] {
  const cells: MonthCell[] = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1, count: 0, samples: [], tickers: [],
  }));
  for (const e of etfs) {
    for (const m of e.payMonths) {
      if (m >= 1 && m <= 12) {
        const cell = cells[m - 1];
        cell.count += 1;
        cell.tickers.push(e.code);
        if (cell.samples.length < 3) cell.samples.push(e.code);
      }
    }
  }
  return cells;
}

export const GRADE_META: Record<StabilityGrade, { label: string; desc: string; cls: string }> = {
  S: { label: 'S', desc: '매우 안정적 · 과거 12개월 변동성 최저', cls: 'grade-s' },
  A: { label: 'A', desc: '안정적 · 소폭 변동',                    cls: 'grade-a' },
  B: { label: 'B', desc: '보통 · 기초자산 변동에 따라 분배 편차',   cls: 'grade-b' },
  C: { label: 'C', desc: '변동 큼 · 단기 포지션에만 권장',          cls: 'grade-c' },
};

export const ACCOUNT_LABELS: Record<AccountType, { label: string; hint: string }> = {
  general: { label: '일반 계좌',   hint: '배당소득세 15.4%' },
  isa:     { label: 'ISA',         hint: '200만원까지 비과세 (손익통산)' },
  pension: { label: '연금·IRP',    hint: '과세이연 · 인출시 저율(5.5~16.5%)' },
};
