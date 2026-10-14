/**
 * 계좌별 세후 계산 (순수 함수, 2026-10-14).
 *   EtfTaxSimulator(화면 계산기)와 /tools/tax-compare 의 계산 예시가 같은 식을 쓰게 한 곳에 둔다.
 *   세율·한도는 src/lib/account-tax-rules.ts (2026-10-14 law.go.kr 현행 조문 대조).
 *
 * 단순화(화면에도 그대로 밝힌다)
 *   - 분배금은 재투자하지 않고 받는다: 분배금 합계 = 투자금 × 연 분배율 × 기간
 *   - 가격 차익은 연 복리: 투자금 × ((1 + 연 변동률)^기간 − 1)
 *   - 금융소득 종합과세·건강보험료·연금저축 세액공제는 넣지 않는다
 *   - 매매차익 과세: 'taxable' 만 과세. 국내주식형은 비과세, 국내 주식 액티브·커버드콜·TR 은 과세표준에서 빠져 0 으로 근사
 */
import type { GainTaxMode } from './etf-tax';
import { TAX_RULES } from './account-tax-rules';

export type PensionAge = 'u70' | '70s' | '80p';

export interface TaxSimInput {
  principal: number;
  yieldPct: number;
  growthPct: number;
  years: number;
  gainTax: GainTaxMode;
  isaLowIncome?: boolean;
  pensionAge?: PensionAge;
}

export interface TaxSimResult {
  dist: number;
  gain: number;
  gross: number;
  gainTaxable: boolean;
  generalTax: number;
  isaLimit: number;
  isaTax: number;
  pensionRate: number;
  pensionTax: number;
}

export function simulateAccountTax(i: TaxSimInput): TaxSimResult {
  const R = TAX_RULES;
  const dist = i.principal * (i.yieldPct / 100) * i.years;
  const gain = i.principal * (Math.pow(1 + i.growthPct / 100, i.years) - 1);
  const gainTaxable = i.gainTax === 'taxable';
  // 일반 계좌: 분배금 15.4%, 매매차익은 과세 구분에 따라 (손실은 분배금과 통산 안 됨)
  const generalTax = dist * R.dividendTaxRate + (gainTaxable ? Math.max(0, gain) * R.dividendTaxRate : 0);
  // 중개형 ISA: 과세 대상 소득끼리 손익 통산 뒤 비과세 한도 초과분만 9.9%
  const isaLimit = i.isaLowIncome ? R.isa.taxFreeLowIncome : R.isa.taxFreeGeneral;
  const isaBase = Math.max(0, dist + (gainTaxable ? gain : 0));
  const isaTax = Math.max(0, isaBase - isaLimit) * R.isa.excessRate;
  // 연금저축·IRP: 운용 중 과세이연, 연금으로 받을 때 운용수익 전체에 연금소득세
  const age = i.pensionAge || 'u70';
  const pensionRate = age === 'u70' ? R.pension.rateUnder70 : age === '70s' ? R.pension.rate70to79 : R.pension.rate80plus;
  const pensionTax = Math.max(0, dist + gain) * pensionRate;
  return { dist, gain, gross: dist + gain, gainTaxable, generalTax, isaLimit, isaTax, pensionRate, pensionTax };
}
