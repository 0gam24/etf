import type { SectorSeries } from '@/lib/flow';
import { formatTradeAmount } from '@/lib/flow';

interface Props {
  series: SectorSeries[];
  daysAvailable: number;
}

/**
 * 섹터별 주간 추세 (최대 5일치). 데이터 포인트가 1개면 "누적 중" 안내.
 * 시각화: 인라인 SVG 스파크라인 (라이브러리 의존 없이).
 */
export default function FlowWeeklyTrend({ series, daysAvailable }: Props) {
  if (series.length === 0) {
    return null;
  }

  const isSingleDay = daysAvailable <= 1;
  const subtitle = isSingleDay
    ? '파이프라인이 매일 적재하면 이 영역이 주간 추세로 확장됩니다 (현재 1일치 기준)'
    : `최근 ${daysAvailable}거래일 섹터 추세 · 평균 등락률 + 주간 거래대금`;

  return (
    <section className="flow-trend">
      <div className="pulse-section-head">
        <h2 className="pulse-section-title">주간 섹터 추세</h2>
        <p className="pulse-section-hint">{subtitle}</p>
      </div>

      <ul className="flow-trend-list">
        {series.slice(0, 8).map(s => {
          const values = s.points.map(p => p.avgChange);
          return (
            <li key={s.sector} className={`flow-trend-row flow-trend-${s.trend}`}>
              <div className="flow-trend-name">{s.sector}</div>
              <div className="flow-trend-spark">
                <Sparkline values={values} trend={s.trend} />
              </div>
              <div className="flow-trend-stats">
                <div className={`flow-trend-avg ${s.weeklyAvgChange >= 0 ? 'is-up' : 'is-down'}`}>
                  {s.weeklyAvgChange >= 0 ? '+' : ''}{s.weeklyAvgChange.toFixed(2)}%
                </div>
                <div className="flow-trend-sub">
                  주간 {formatTradeAmount(s.weeklyTotalTradeAmount)}원
                </div>
              </div>
              <TrendBadge trend={s.trend} />
            </li>
          );
        })}
      </ul>
      {isSingleDay && (
        <p className="flow-trend-note">
          → 다음 거래일부터 5영업일 추세가 자동 누적됩니다.
        </p>
      )}
    </section>
  );
}

function Sparkline({ values, trend }: { values: number[]; trend: 'up' | 'down' | 'flat' }) {
  if (!values.length) return null;
  const w = 120, h = 28, pad = 2;
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 0);
  const range = max - min || 1;
  const step = values.length > 1 ? (w - pad * 2) / (values.length - 1) : 0;

  const points = values.map((v, i) => {
    const x = pad + i * step;
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const stroke = trend === 'up' ? '#f87171' : trend === 'down' ? '#60a5fa' : '#94a3b8';
  const baselineY = h - pad - ((0 - min) / range) * (h - pad * 2);

  return (
    <svg className="flow-trend-svg" width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
      <line x1={pad} y1={baselineY} x2={w - pad} y2={baselineY} stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="2 3" />
      {values.length > 1 ? (
        <polyline
          points={points}
          fill="none"
          stroke={stroke}
          strokeWidth="1.75"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ) : (
        <circle cx={pad} cy={baselineY} r={2.5} fill={stroke} />
      )}
    </svg>
  );
}

function TrendBadge({ trend }: { trend: 'up' | 'down' | 'flat' }) {
  const map = {
    up:   { label: '상승 추세', cls: 'flow-trend-badge-up' },
    down: { label: '하락 추세', cls: 'flow-trend-badge-down' },
    flat: { label: '보합',       cls: 'flow-trend-badge-flat' },
  };
  const m = map[trend];
  return <span className={`flow-trend-badge ${m.cls}`}>{m.label}</span>;
}
