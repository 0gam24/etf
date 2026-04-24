import Link from 'next/link';
import type { ThemeGroup } from '@/lib/surge';

interface Props {
  groups: ThemeGroup[];
}

function formatVolume(v: number): string {
  if (v >= 100000000) return (v / 100000000).toFixed(1) + '억';
  if (v >= 10000) return (v / 10000).toFixed(0) + '만';
  return v.toLocaleString();
}

export default function SurgeThemeTracker({ groups }: Props) {
  if (groups.length === 0) {
    return (
      <section className="surge-themes">
        <h2 className="pulse-section-title">테마 트래커</h2>
        <p className="pulse-section-empty">오늘 의미 있는 상승 종목이 집계되지 않았습니다.</p>
      </section>
    );
  }

  return (
    <section className="surge-themes">
      <div className="pulse-section-head">
        <h2 className="pulse-section-title">테마 트래커</h2>
        <p className="pulse-section-hint">오늘 상승한 ETF를 섹터로 묶어 본 자금 쏠림 · 분석 글이 있는 테마는 바로 연결됩니다</p>
      </div>

      <div className="surge-theme-grid">
        {groups.map(g => (
          <div key={g.sector} className="surge-theme-card">
            <div className="surge-theme-head">
              <div>
                <div className="surge-theme-name">{g.sector}</div>
                <div className="surge-theme-meta">
                  {g.count}종 상승 · 거래량 {formatVolume(g.totalVolume)}주
                </div>
              </div>
              <div className={`surge-theme-avg ${g.avgChange >= 0 ? 'is-up' : 'is-down'}`}>
                {g.avgChange >= 0 ? '+' : ''}{g.avgChange.toFixed(2)}%
              </div>
            </div>

            <ul className="surge-theme-etfs">
              {g.topEtfs.map(e => (
                <li key={e.code} className="surge-theme-etf">
                  <span className="surge-theme-etf-name">{e.name}</span>
                  <span className={`surge-theme-etf-change ${e.changeRate >= 0 ? 'is-up' : 'is-down'}`}>
                    {e.changeRate >= 0 ? '+' : ''}{e.changeRate.toFixed(2)}%
                  </span>
                </li>
              ))}
            </ul>

            {g.posts.length > 0 ? (
              <div className="surge-theme-posts">
                {g.posts.slice(0, 2).map(p => (
                  <Link
                    key={p.meta.slug}
                    href={`/${p.meta.category}/${p.meta.slug}`}
                    className="surge-theme-post"
                  >
                    <span className="surge-theme-post-marker">분석</span>
                    <span className="surge-theme-post-title">{p.meta.title}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="surge-theme-no-post">아직 이 테마의 분석 글이 없습니다</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
