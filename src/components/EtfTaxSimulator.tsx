'use client';

import { useMemo, useState } from 'react';
import type { GainTaxMode } from '@/lib/etf-tax';
import { TAX_RULES, formatWon } from '@/lib/account-tax-rules';

interface Props {
  name: string;
  /** 일반 계좌 매매차익 과세 방식 (src/lib/etf-tax.ts) */
  gainTax: GainTaxMode;
  /** 연금저축·IRP 에서 살 수 있는가 (레버리지·인버스는 불가) */
  pensionAllowed: boolean;
  /** 기본 연 분배율(%) — 분배 기록이 있으면 그 값, 없으면 가정값 */
  defaultYieldPct: number;
  /** 기본 분배율이 실제 기록에서 온 값인가 */
  yieldFromRecord: boolean;
  /** 가이드처럼 특정 종목이 없는 곳에서는 과세 구분을 독자가 고른다 */
  kindSelectable?: boolean;
}

type PensionAge = 'u70' | '70s' | '80p';

const PENSION_AGE_LABEL: Record<PensionAge, string> = { u70: '70세 미만', '70s': '70~79세', '80p': '80세 이상' };

/**
 * 계좌별 세후 계산기 (2026-10-14).
 *
 *   투자금·분배율·가격 변동·보유 기간을 넣으면 같은 ETF를 일반 계좌, 중개형 ISA, 연금저축·IRP 에서 굴렸을 때
 *   세금과 세후 금액을 나란히 보여 준다. 계산식은 화면 아래에 그대로 적는다(독자가 다시 계산할 수 있게).
 *   단순화: 분배금은 재투자하지 않고 받는다, 가격 변동은 연 복리, 금융소득 종합과세·건강보험료·세액공제는 넣지 않는다.
 */
export default function EtfTaxSimulator({ name, gainTax: initialGainTax, pensionAllowed, defaultYieldPct, yieldFromRecord, kindSelectable = false }: Props) {
  const R = TAX_RULES;
  const [gainTax, setGainTax] = useState<GainTaxMode>(initialGainTax);
  const [principalMan, setPrincipalMan] = useState(1000); // 만원
  const [yieldPct, setYieldPct] = useState(Math.round(defaultYieldPct * 10) / 10);
  const [growthPct, setGrowthPct] = useState(0);
  const [years, setYears] = useState<number>(R.isa.minYears);
  const [isaLowIncome, setIsaLowIncome] = useState(false);
  const [pensionAge, setPensionAge] = useState<PensionAge>('u70');

  const r = useMemo(() => {
    const P = principalMan * 10_000;
    const dist = P * (yieldPct / 100) * years; // 받는 분배금 합계 (세전)
    const gain = P * (Math.pow(1 + growthPct / 100, years) - 1); // 팔 때 가격 차익 (세전)
    // 해외·채권·원자재처럼 차익이 과세표준에 그대로 잡히는 경우만 매매차익을 과세로 계산한다.
    //   국내주식형은 비과세, 국내 주식 액티브·커버드콜·TR·국내 지수 선물은 과세표준에서 차익이 빠져 0 으로 근사한다.
    const gainTaxable = gainTax === 'taxable';

    // 일반 계좌: 분배금 15.4%, 매매차익은 과세 구분에 따라 (손실은 분배금과 통산 안 됨)
    const generalTax = dist * R.dividendTaxRate + (gainTaxable ? Math.max(0, gain) * R.dividendTaxRate : 0);

    // 중개형 ISA: 계좌 순이익(과세 대상 소득끼리 손익 통산) 중 비과세 한도 초과분만 9.9%
    const isaLimit = isaLowIncome ? R.isa.taxFreeLowIncome : R.isa.taxFreeGeneral;
    const isaBase = Math.max(0, dist + (gainTaxable ? gain : 0));
    const isaTax = Math.max(0, isaBase - isaLimit) * R.isa.excessRate;

    // 연금저축·IRP: 운용 중 과세이연, 연금으로 받을 때 운용수익 전체에 연금소득세
    const pensionRate = pensionAge === 'u70' ? R.pension.rateUnder70 : pensionAge === '70s' ? R.pension.rate70to79 : R.pension.rate80plus;
    const pensionTax = Math.max(0, dist + gain) * pensionRate;

    const gross = dist + gain;
    return { P, dist, gain, gross, generalTax, isaTax, isaLimit, pensionTax, pensionRate, gainTaxable };
  }, [principalMan, yieldPct, growthPct, years, isaLowIncome, pensionAge, gainTax, R]);

  const rows = [
    { account: '일반 계좌', tax: r.generalTax, available: true },
    { account: `중개형 ISA (${isaLowIncome ? '서민형' : '일반형'})`, tax: r.isaTax, available: true },
    { account: `연금저축·IRP (연금 수령 ${PENSION_AGE_LABEL[pensionAge]})`, tax: r.pensionTax, available: pensionAllowed },
  ];

  return (
    <div className="etf-tax-sim" aria-label={`${name} 계좌별 세후 계산기`}>
      <div className="etf-tax-sim-inputs">
        {kindSelectable && (
          <label className="etf-tax-sim-field">
            <span>ETF 과세 구분</span>
            <select value={gainTax} onChange={e => setGainTax(e.target.value as GainTaxMode)}>
              <option value="exempt">국내주식형 (일반 계좌 매매차익 비과세)</option>
              <option value="base-excludes-domestic">국내 주식 액티브·커버드콜·TR (차익 대부분 과세표준 밖)</option>
              <option value="taxable">해외 주식·채권·원자재 등 (매매차익도 과세)</option>
            </select>
          </label>
        )}
        <label className="etf-tax-sim-field">
          <span>투자금 <strong>{formatWon(r.P)}</strong></span>
          <input type="range" min={100} max={10000} step={100} value={principalMan} onChange={e => setPrincipalMan(Number(e.target.value))} />
        </label>
        <label className="etf-tax-sim-field">
          <span>연 분배율 <strong>{yieldPct.toFixed(1)}%</strong>{yieldFromRecord ? ' (최근 분배 기록 기준)' : ' (가정)'}</span>
          <input type="range" min={0} max={15} step={0.1} value={yieldPct} onChange={e => setYieldPct(Number(e.target.value))} />
        </label>
        <label className="etf-tax-sim-field">
          <span>연 가격 변동 <strong>{growthPct > 0 ? '+' : ''}{growthPct.toFixed(1)}%</strong> (가정)</span>
          <input type="range" min={-10} max={15} step={0.5} value={growthPct} onChange={e => setGrowthPct(Number(e.target.value))} />
        </label>
        <label className="etf-tax-sim-field">
          <span>보유 기간 <strong>{years}년</strong></span>
          <input type="range" min={1} max={20} step={1} value={years} onChange={e => setYears(Number(e.target.value))} />
        </label>
        <div className="etf-tax-sim-toggles">
          <label>
            <input type="checkbox" checked={isaLowIncome} onChange={e => setIsaLowIncome(e.target.checked)} /> ISA 서민형·농어민형
          </label>
          <label>
            연금 수령 나이{' '}
            <select value={pensionAge} onChange={e => setPensionAge(e.target.value as PensionAge)}>
              <option value="u70">70세 미만</option>
              <option value="70s">70~79세</option>
              <option value="80p">80세 이상</option>
            </select>
          </label>
        </div>
      </div>

      <div className="etf-tax-sim-result" role="status" aria-live="polite">
        <p className="etf-tax-sim-summary">
          {years}년 동안 받는 분배금 {formatWon(r.dist)}, 팔 때 가격 차익 {formatWon(r.gain)}, 세전 수익 합계 {formatWon(r.gross)}.
        </p>
        <table className="etf-tax-sim-table">
          <thead>
            <tr>
              <th scope="col">계좌</th>
              <th scope="col">세금</th>
              <th scope="col">세후 수익</th>
              <th scope="col">일반 계좌 대비</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.account}>
                <th scope="row">{row.account}</th>
                {row.available ? (
                  <>
                    <td>{formatWon(row.tax)}</td>
                    <td>{formatWon(r.gross - row.tax)}</td>
                    <td>
                      {row.account === '일반 계좌'
                        ? '기준'
                        : `세금 ${formatWon(Math.abs(r.generalTax - row.tax))} ${row.tax <= r.generalTax ? '적음' : '많음'}`}
                    </td>
                  </>
                ) : (
                  <td colSpan={3}>파생형 ETF라 연금계좌에서 살 수 없음</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="etf-tax-sim-formula">
          계산식: 분배금 = 투자금 × 연 분배율 × 기간, 가격 차익 = 투자금 × ((1 + 연 변동률)^기간 − 1).
          일반 계좌 세금 = 분배금 × {(R.dividendTaxRate * 100).toFixed(1)}%{r.gainTaxable ? ` + 가격 차익 × ${(R.dividendTaxRate * 100).toFixed(1)}%` : ' (이 상품의 매매차익은 과세 대상에서 빠지는 것으로 계산)'}.
          ISA 세금 = (과세 대상 순이익 − {formatWon(r.isaLimit)}) × {(R.isa.excessRate * 100).toFixed(1)}%.
          연금 세금 = 운용수익 × {(r.pensionRate * 100).toFixed(1)}%.
        </p>
        <p className="etf-tax-sim-note">
          분배금은 재투자하지 않고, 금융소득 종합과세(연 {formatWon(R.financialIncomeThreshold)} 초과)·건강보험료·연금저축 세액공제는 넣지 않은 단순 계산입니다.
          ISA 비과세 한도는 계좌 전체 합산이라 다른 상품의 수익과 나눠 씁니다. 연금은 연간 수령액이 {formatWon(R.pension.separateTaxThreshold)} 이하라고 가정했습니다.
          {gainTax === 'base-excludes-domestic' && ' 펀드가 국내 상장 주식·국내 지수 파생상품에서 낸 차익은 과세표준에서 빠지므로, 일반 계좌와 ISA 에서 가격 차익은 과세되지 않는 것으로 단순화했습니다.'}
          {gainTax === 'exempt' && ' 국내주식형 ETF의 매매차익은 일반 계좌와 ISA 에서 과세되지 않지만, 연금계좌에서는 운용수익이라 연금 수령 때 과세됩니다.'}
        </p>
      </div>
    </div>
  );
}
