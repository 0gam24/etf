import Link from 'next/link';
import type { SectorAggregate } from '@/lib/flow';
import { formatTradeAmount } from '@/lib/flow';

interface Props {
  sectors: SectorAggregate[];
}

export default function FlowSectorGrid({ sectors }: Props) {
  if (sectors.length === 0) {
    return (
      <section className="flow-grid-section">
        <h2 className="pulse-section-title">섹터 자금 흐름</h2>
        <p className="pulse-section-empty">섹터 집계 데이터가 없습니다.</p>
      </section>
    );
  }

  return (
    <section className="flow-grid-section">
      <div className="pulse-section-head">
        <h2 className="pulse-section-title">섹터 자금 흐름 한눈에</h2>
        <p className="pulse-section-hint">
          색상 강도 = 자금 쏠림 (거래량 × 변동성) · 평균 등락률 색조 (적/청)
        </p>
      </div>

      <div className="flow-sector-grid">
        {sectors.map(s => {
          const isUp = s.avgChange >= 0;
          const heat = s.heatScore; // 0~1
          return (
            <div
              key={s.sector}
              className={`flow-sector-card ${isUp ? 'is-up' : 'is-down'}`}
              style={{ '--heat': heat } as React.CSSProperties}
            >
              <div className="flow-sector-head">
                <h3 className="flow-sector-name">{s.sector}</h3>
                <span className="flow-sector-count">{s.etfCount}종</span>
              </div>

              <div className={`flow-sector-change ${isUp ? 'is-up' : 'is-down'}`}>
                {isUp ? '+' : ''}{s.avgChange.toFixed(2)}<small>%</small>
              </div>

              <div className="flow-sector-amounts">
                <div className="flow-sector-amount">
                  <span>거래대금</span>
                  <strong>{formatTradeAmount(s.totalTradeAmount)}원</strong>
                </div>
              </div>

              <div className="flow-sector-leader-box">
                <div className="flow-sector-leader-label">대장 ETF</div>
                <div className="flow-sector-leader-name">{s.leader.name}</div>
                <div className="flow-sector-leader-data">
                  <span>{s.leader.code}</span>
                  <span className={`flow-sector-leader-chg ${s.leader.changeRate >= 0 ? 'is-up' : 'is-down'}`}>
                    {s.leader.changeRate >= 0 ? '+' : ''}{s.leader.changeRate.toFixed(2)}%
                  </span>
                </div>
              </div>

              {s.posts.length > 0 ? (
                <Link
                  href={`/${s.posts[0].meta.category}/${s.posts[0].meta.slug}`}
                  className="flow-sector-post-link"
                >
                  <span className="flow-sector-post-marker">분석</span>
                  <span className="flow-sector-post-title">{s.posts[0].meta.title}</span>
                </Link>
              ) : (
                <div className="flow-sector-no-post">분석 글 미발행</div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
