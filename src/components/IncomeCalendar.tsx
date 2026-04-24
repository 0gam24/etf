import type { MonthCell, IncomeEtf } from '@/lib/income';

interface Props {
  cells: MonthCell[];
  etfs: IncomeEtf[];
}

const MONTH_LABELS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

export default function IncomeCalendar({ cells, etfs }: Props) {
  const maxCount = Math.max(1, ...cells.map(c => c.count));
  const nameByCode = new Map(etfs.map(e => [e.code, e.name]));
  const now = new Date();
  const thisMonth = now.getMonth() + 1;

  return (
    <section className="income-calendar">
      <div className="pulse-section-head">
        <h2 className="pulse-section-title">연간 분배 캘린더</h2>
        <p className="pulse-section-hint">어느 달에 얼마나 분배금이 들어오는지 한눈에 · 현재 월 하이라이트</p>
      </div>
      <div className="income-cal-grid">
        {cells.map(c => {
          const intensity = c.count / maxCount;
          const isCurrent = c.month === thisMonth;
          return (
            <div
              key={c.month}
              className={`income-cal-cell ${isCurrent ? 'income-cal-current' : ''}`}
              style={{ '--fill': intensity } as React.CSSProperties}
            >
              <div className="income-cal-month">
                <span>{MONTH_LABELS[c.month - 1]}</span>
                {isCurrent && <span className="income-cal-now">이번 달</span>}
              </div>
              <div className="income-cal-count">{c.count}<small>종 분배</small></div>
              <div className="income-cal-samples" title={c.tickers.map(t => nameByCode.get(t) || t).join(', ')}>
                {c.samples.map(s => (
                  <span key={s} className="income-cal-sample">{s}</span>
                ))}
                {c.count > c.samples.length && (
                  <span className="income-cal-more">+{c.count - c.samples.length}</span>
                )}
              </div>
              <div className="income-cal-bar" aria-hidden>
                <span style={{ width: `${intensity * 100}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
