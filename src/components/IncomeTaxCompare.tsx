import type { IncomeEtf } from '@/lib/income';
import { ACCOUNT_LABELS, afterTaxYield, taxRateFor } from '@/lib/income';

interface Props {
  etfs: IncomeEtf[];
  /** 투자원금 기준 (기본 1억) */
  basePrincipal?: number;
}

export default function IncomeTaxCompare({ etfs, basePrincipal = 100000000 }: Props) {
  // 대표 3종만 비교 (S급 or 거래 활발한 것)
  const samples = etfs.slice(0, 3);

  return (
    <section className="income-tax">
      <div className="pulse-section-head">
        <h2 className="pulse-section-title">계좌별 세후 수익 비교</h2>
        <p className="pulse-section-hint">
          {basePrincipal.toLocaleString()}원 투자 · 연 분배금 기준 — 같은 ETF라도 계좌만 바꿔도 세후가 달라집니다
        </p>
      </div>
      <div className="income-tax-grid">
        {samples.map(e => {
          const annual = (basePrincipal * e.yield) / 100;
          const rows = (['general', 'isa', 'pension'] as const).map(acc => {
            const rate = taxRateFor(acc);
            const afterTaxAnn = annual * (1 - rate);
            return {
              acc,
              label: ACCOUNT_LABELS[acc].label,
              hint: ACCOUNT_LABELS[acc].hint,
              annual: Math.floor(afterTaxAnn),
              monthly: Math.floor(afterTaxAnn / 12),
              yieldPct: afterTaxYield(e.yield, acc),
            };
          });
          const best = rows.slice().sort((a, b) => b.annual - a.annual)[0];

          return (
            <div key={e.code} className="income-tax-card">
              <div className="income-tax-card-head">
                <div className="income-tax-card-name">{e.name}</div>
                <div className="income-tax-card-code">{e.code} · 세전 {e.yield.toFixed(1)}%</div>
              </div>
              <table className="income-tax-table">
                <tbody>
                  {rows.map(r => (
                    <tr key={r.acc} className={r.acc === best.acc ? 'is-best' : ''}>
                      <td className="income-tax-acc">
                        <div>{r.label}</div>
                        <div className="income-tax-acc-hint">{r.hint}</div>
                      </td>
                      <td className="income-tax-aftertax">
                        <div className="income-tax-monthly">월 {r.monthly.toLocaleString()}원</div>
                        <div className="income-tax-annual">연 {r.annual.toLocaleString()}원 · {r.yieldPct.toFixed(1)}%</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="income-tax-delta">
                일반 대비 <strong>{(best.annual - rows[0].annual).toLocaleString()}원</strong> 추가 확보
                ({best.label})
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
