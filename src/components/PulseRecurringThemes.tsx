import Link from 'next/link';
import type { ThemeCount } from '@/lib/pulse';

interface Props {
  themes: ThemeCount[];
  windowDays: number;
}

export default function PulseRecurringThemes({ themes, windowDays }: Props) {
  if (themes.length === 0) {
    return (
      <section className="pulse-themes">
        <div className="pulse-section-head">
          <h2 className="pulse-section-title">이번 주 반복 등장 종목</h2>
          <p className="pulse-section-hint">지난 {windowDays}일간 pulse에 가장 자주 등장한 티커</p>
        </div>
        <p className="pulse-section-empty">데이터가 누적되면 이 영역에 랭킹이 나타납니다.</p>
      </section>
    );
  }

  const max = themes[0].count;

  return (
    <section className="pulse-themes">
      <div className="pulse-section-head">
        <h2 className="pulse-section-title">이번 주 반복 등장 종목</h2>
        <p className="pulse-section-hint">지난 {windowDays}일간 pulse에 가장 자주 등장한 티커 · 관성 흐름 파악</p>
      </div>
      <ol className="pulse-themes-list">
        {themes.map((t, i) => {
          const widthPct = (t.count / max) * 100;
          const href = t.latestPost ? `/${t.latestPost.meta.category}/${t.latestPost.meta.slug}` : undefined;
          return (
            <li key={t.ticker} className="pulse-themes-row">
              <span className="pulse-themes-rank">{i + 1}</span>
              <span className="pulse-themes-ticker">
                {t.name ? (
                  <>
                    <strong className="pulse-themes-name">{t.name}</strong>
                    <span className="pulse-themes-code"> · {t.ticker}</span>
                  </>
                ) : (
                  t.ticker
                )}
              </span>
              <span className="pulse-themes-bar-wrap" aria-hidden>
                <span className="pulse-themes-bar" style={{ width: `${widthPct}%` }} />
              </span>
              <span className="pulse-themes-count">
                {t.count}일 연속
              </span>
              {href ? (
                <Link href={href} className="pulse-themes-link">최근 글 →</Link>
              ) : (
                <span className="pulse-themes-link pulse-themes-link-off">—</span>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
