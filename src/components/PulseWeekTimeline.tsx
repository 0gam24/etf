import Link from 'next/link';
import type { DayCell } from '@/lib/pulse';
import { extractPulseBullets } from '@/lib/pulse';

interface Props {
  cells: DayCell[];
  todayIso: string;
}

export default function PulseWeekTimeline({ cells, todayIso }: Props) {
  return (
    <section className="pulse-week">
      <div className="pulse-section-head">
        <h2 className="pulse-section-title">이번 주 타임라인</h2>
        <p className="pulse-section-hint">월~금 5영업일, 하루치를 한 장씩</p>
      </div>
      <div className="pulse-week-grid">
        {cells.map(c => {
          const isToday = c.date === todayIso;
          const label = (c.post ? extractPulseBullets(c.post, 1)[0] : '') || (c.post?.meta.description ?? '');
          const day = new Date(c.date).getDate();
          const cls = `pulse-week-card ${c.post ? 'pulse-week-has' : 'pulse-week-empty'} ${isToday ? 'pulse-week-today' : ''}`;
          const inner = (
            <>
              <div className="pulse-week-top">
                <span className="pulse-week-wd">{c.weekday}</span>
                <span className="pulse-week-day">{day}</span>
              </div>
              {c.post ? (
                <>
                  <div className="pulse-week-tickers">
                    {(c.post.meta.tickers || []).slice(0, 2).map(t => (
                      <span key={t} className="pulse-week-ticker">{t}</span>
                    ))}
                  </div>
                  <p className="pulse-week-line">{label}</p>
                </>
              ) : (
                <p className="pulse-week-line pulse-week-line-empty">{isToday ? '곧 발행' : '발행 예정'}</p>
              )}
            </>
          );
          return c.post ? (
            <Link key={c.date} href={`/${c.post.meta.category}/${c.post.meta.slug}`} className={cls}>
              {inner}
            </Link>
          ) : (
            <div key={c.date} className={cls}>{inner}</div>
          );
        })}
      </div>
    </section>
  );
}
