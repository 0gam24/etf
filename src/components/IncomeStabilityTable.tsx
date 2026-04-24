import type { IncomeEtf } from '@/lib/income';
import { GRADE_META, afterTaxYield } from '@/lib/income';

interface Props {
  etfs: IncomeEtf[];
}

export default function IncomeStabilityTable({ etfs }: Props) {
  // S → A → B → C, 동일 등급 내 yield 높은 순
  const gradeOrder: Record<string, number> = { S: 0, A: 1, B: 2, C: 3 };
  const sorted = [...etfs].sort((a, b) => {
    const g = gradeOrder[a.stabilityGrade] - gradeOrder[b.stabilityGrade];
    return g !== 0 ? g : b.yield - a.yield;
  });

  return (
    <section className="income-stability">
      <div className="pulse-section-head">
        <h2 className="pulse-section-title">분배 안정성 등급</h2>
        <p className="pulse-section-hint">
          과거 12개월 분배 변동성 기반 등급(S/A/B/C) · 세후 수익률은 ISA 기준 근사치
        </p>
      </div>
      <div className="income-stability-wrap">
        <table className="income-stability-table">
          <thead>
            <tr>
              <th className="col-rank">#</th>
              <th className="col-name">ETF · 기초자산</th>
              <th className="col-grade">등급</th>
              <th className="col-yield">세전 분배율</th>
              <th className="col-aftertax">ISA 세후</th>
              <th className="col-freq">주기</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((e, i) => {
              const meta = GRADE_META[e.stabilityGrade];
              return (
                <tr key={e.code}>
                  <td className="col-rank">{i + 1}</td>
                  <td className="col-name">
                    <div className="income-stab-name">{e.name}</div>
                    <div className="income-stab-underlying">{e.underlying}</div>
                    <div className="income-stab-code">{e.code} · {e.issuer}</div>
                  </td>
                  <td className="col-grade">
                    <span className={`income-grade-pill ${meta.cls}`} title={meta.desc}>{meta.label}</span>
                  </td>
                  <td className="col-yield">{e.yield.toFixed(1)}%</td>
                  <td className="col-aftertax income-aftertax">{afterTaxYield(e.yield, 'isa').toFixed(1)}%</td>
                  <td className="col-freq">
                    {e.frequency === 'monthly' ? '매월' : e.frequency === 'quarterly' ? '분기' : e.frequency}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
