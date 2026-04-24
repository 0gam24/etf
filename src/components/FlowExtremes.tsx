import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { SectorAggregate } from '@/lib/flow';
import { formatTradeAmount, formatVolume } from '@/lib/flow';

interface Props {
  hottest: SectorAggregate | null;
  coldest: SectorAggregate | null;
}

export default function FlowExtremes({ hottest, coldest }: Props) {
  if (!hottest && !coldest) return null;

  return (
    <section className="flow-extremes">
      <div className="pulse-section-head">
        <h2 className="pulse-section-title">오늘 가장 뜨거운 / 차가운 섹터</h2>
        <p className="pulse-section-hint">평균 등락률과 거래대금이 가장 극단인 섹터 — 진입·이탈의 신호</p>
      </div>

      <div className="flow-extremes-grid">
        {hottest && (
          <div className="flow-extreme-card flow-extreme-hot">
            <div className="flow-extreme-icon"><ArrowUpRight size={18} strokeWidth={2.4} aria-hidden /></div>
            <div className="flow-extreme-meta">HOTTEST · 자금 유입</div>
            <div className="flow-extreme-sector">{hottest.sector}</div>
            <div className="flow-extreme-big is-up">+{hottest.avgChange.toFixed(2)}%</div>
            <ul className="flow-extreme-stats">
              <li><span>분석 종목</span><strong>{hottest.etfCount}종</strong></li>
              <li><span>거래대금</span><strong>{formatTradeAmount(hottest.totalTradeAmount)}원</strong></li>
              <li><span>거래량</span><strong>{formatVolume(hottest.totalVolume)}주</strong></li>
            </ul>
            <div className="flow-extreme-leader">
              <span className="flow-extreme-leader-label">대장 ETF</span>
              <span className="flow-extreme-leader-name">{hottest.leader.name}</span>
              <span className={`flow-extreme-leader-change ${hottest.leader.changeRate >= 0 ? 'is-up' : 'is-down'}`}>
                {hottest.leader.changeRate >= 0 ? '+' : ''}{hottest.leader.changeRate.toFixed(2)}%
              </span>
            </div>
          </div>
        )}

        {coldest && (
          <div className="flow-extreme-card flow-extreme-cold">
            <div className="flow-extreme-icon"><ArrowDownRight size={18} strokeWidth={2.4} aria-hidden /></div>
            <div className="flow-extreme-meta">COLDEST · 자금 유출</div>
            <div className="flow-extreme-sector">{coldest.sector}</div>
            <div className="flow-extreme-big is-down">{coldest.avgChange.toFixed(2)}%</div>
            <ul className="flow-extreme-stats">
              <li><span>분석 종목</span><strong>{coldest.etfCount}종</strong></li>
              <li><span>거래대금</span><strong>{formatTradeAmount(coldest.totalTradeAmount)}원</strong></li>
              <li><span>거래량</span><strong>{formatVolume(coldest.totalVolume)}주</strong></li>
            </ul>
            <div className="flow-extreme-leader">
              <span className="flow-extreme-leader-label">대장 ETF</span>
              <span className="flow-extreme-leader-name">{coldest.leader.name}</span>
              <span className={`flow-extreme-leader-change ${coldest.leader.changeRate >= 0 ? 'is-up' : 'is-down'}`}>
                {coldest.leader.changeRate >= 0 ? '+' : ''}{coldest.leader.changeRate.toFixed(2)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
