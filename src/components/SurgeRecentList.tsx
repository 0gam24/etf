import Link from 'next/link';
import type { Post } from '@/lib/posts';
import type { RawEtf } from '@/lib/surge';
import { computeRiskLabels, findEtfByCode } from '@/lib/surge';
import SurgeRiskLabels from './SurgeRiskLabels';

interface Props {
  posts: Post[];
  etfs: RawEtf[];
  marketAvgVolume: number;
}

export default function SurgeRecentList({ posts, etfs, marketAvgVolume }: Props) {
  if (posts.length === 0) {
    return (
      <section className="surge-recent">
        <h2 className="pulse-section-title">최근 급등 분석</h2>
        <p className="pulse-section-empty">아직 발행된 분석 글이 없습니다.</p>
      </section>
    );
  }

  return (
    <section className="surge-recent">
      <div className="pulse-section-head">
        <h2 className="pulse-section-title">최근 급등 분석</h2>
        <p className="pulse-section-hint">각 분석 옆에 오늘 시세 기반 위험 신호가 함께 표시됩니다</p>
      </div>

      <ul className="surge-recent-list">
        {posts.map(p => {
          const ticker = (p.meta.tickers || [])[0];
          const etf = ticker ? findEtfByCode(etfs, ticker) : null;
          const labels = etf ? computeRiskLabels(etf, marketAvgVolume) : [];
          const date = new Date(p.meta.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });

          return (
            <li key={p.meta.slug} className="surge-recent-row">
              <Link href={`/${p.meta.category}/${p.meta.slug}`} className="surge-recent-link">
                <div className="surge-recent-head">
                  <span className="surge-recent-date">{date}</span>
                  {ticker && <span className="surge-recent-ticker">{ticker}</span>}
                  {etf?.sector && <span className="surge-recent-sector">{etf.sector}</span>}
                </div>
                <div className="surge-recent-title">{p.meta.title}</div>
                {etf && (
                  <div className="surge-recent-data">
                    <span className={`surge-recent-change ${etf.changeRate >= 0 ? 'is-up' : 'is-down'}`}>
                      {etf.changeRate >= 0 ? '+' : ''}{etf.changeRate.toFixed(2)}%
                    </span>
                    <span className="surge-recent-volume">
                      거래량 {etf.volume.toLocaleString()}주
                    </span>
                  </div>
                )}
                <SurgeRiskLabels labels={labels} size="sm" />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
