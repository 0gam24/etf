import type { SectorAggregate } from '@/lib/flow';
import { formatTradeAmount } from '@/lib/flow';

interface Props {
  sectors: SectorAggregate[];
}

export default function FlowSectorLeaders({ sectors }: Props) {
  if (sectors.length === 0) return null;

  return (
    <section className="flow-leaders">
      <div className="pulse-section-head">
        <h2 className="pulse-section-title">섹터별 대장 ETF</h2>
        <p className="pulse-section-hint">각 섹터에서 거래량이 가장 큰 종목 — 자금이 가장 먼저 들고 빠지는 길목</p>
      </div>

      <div className="flow-leaders-wrap">
        <table className="flow-leaders-table">
          <thead>
            <tr>
              <th className="col-sector">섹터</th>
              <th className="col-leader">대장 ETF</th>
              <th className="col-num">현재가</th>
              <th className="col-num">등락률</th>
              <th className="col-num">거래대금</th>
            </tr>
          </thead>
          <tbody>
            {sectors.map(s => (
              <tr key={s.sector}>
                <td className="col-sector">
                  <div className="flow-leaders-sector">{s.sector}</div>
                  <div className="flow-leaders-sector-meta">
                    {s.etfCount}종 · 평균 {s.avgChange >= 0 ? '+' : ''}{s.avgChange.toFixed(2)}%
                  </div>
                </td>
                <td className="col-leader">
                  <div className="flow-leaders-name">{s.leader.name}</div>
                  <div className="flow-leaders-code">{s.leader.code}</div>
                </td>
                <td className="col-num">{s.leader.price.toLocaleString()}원</td>
                <td className={`col-num ${s.leader.changeRate >= 0 ? 'is-up' : 'is-down'}`}>
                  {s.leader.changeRate >= 0 ? '+' : ''}{s.leader.changeRate.toFixed(2)}%
                </td>
                <td className="col-num">{formatTradeAmount(s.leader.tradeAmount || 0)}원</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
