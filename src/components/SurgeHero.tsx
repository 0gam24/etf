import Link from 'next/link';
import { ArrowRight, TrendingUp } from 'lucide-react';
import type { Post } from '@/lib/posts';
import type { RawEtf } from '@/lib/surge';
import { computeRiskLabels, extractSurgeCatalyst } from '@/lib/surge';
import HoldingsPanel from './HoldingsPanel';
import SurgeRiskLabels from './SurgeRiskLabels';

interface Props {
  post: Post | null;
  etf: RawEtf | null;
  marketAvgVolume: number;
  /** KRX 데이터 기준일 (YYYYMMDD) — HoldingsPanel 표시 일자 동기화용 */
  baseDate?: string;
}

export default function SurgeHero({ post, etf, marketAvgVolume, baseDate }: Props) {
  if (!post && !etf) {
    return (
      <section className="surge-hero surge-hero-empty">
        <p>오늘의 급등 분석이 아직 발행되지 않았습니다.</p>
      </section>
    );
  }

  const labels = etf ? computeRiskLabels(etf, marketAvgVolume) : [];
  const isUp = (etf?.change ?? 0) > 0;
  const isDown = (etf?.change ?? 0) < 0;
  const catalyst = post ? extractSurgeCatalyst(post) : null;

  return (
    <section className="surge-hero">
      <div className="surge-hero-bg" aria-hidden />
      <div className="surge-hero-inner">
        <div className="surge-hero-left">
          <span className="surge-hero-badge">
            <TrendingUp size={13} strokeWidth={3} aria-hidden /> TODAY&apos;S SURGE
          </span>

          {etf && (
            <>
              <div className="surge-hero-etf-label">{etf.sector || '섹터 미분류'} · {etf.code}</div>
              <h1 className="surge-hero-name">{etf.name}</h1>

              <div className="surge-hero-price-row">
                <div className={`surge-hero-change ${isUp ? 'is-up' : isDown ? 'is-down' : ''}`}>
                  {isUp ? '+' : ''}{etf.changeRate.toFixed(2)}<small>%</small>
                </div>
                <div className="surge-hero-price">
                  {etf.price.toLocaleString()}<small>원</small>
                </div>
              </div>

              <div className="surge-hero-volume">
                거래량 <strong>{etf.volume.toLocaleString()}</strong>주
                <span className="surge-hero-vol-sub">
                  · 시장 평균 {marketAvgVolume > 0 ? `${(etf.volume / marketAvgVolume).toFixed(1)}배` : '—'}
                </span>
              </div>

              <SurgeRiskLabels labels={labels} size="md" />
            </>
          )}

          {catalyst && (
            <div className="surge-hero-catalyst">
              <div className="surge-hero-catalyst-label">오늘의 도화선</div>
              <p className="surge-hero-catalyst-text">&ldquo;{catalyst}&rdquo;</p>
            </div>
          )}

          {post && (
            <Link href={`/${post.meta.category}/${post.meta.slug}`} className="surge-hero-cta">
              왜 오르는지 전체 분석 <ArrowRight size={16} strokeWidth={2.5} />
            </Link>
          )}
        </div>

        {etf && (
          <aside className="surge-hero-right">
            <HoldingsPanel code={etf.code} variant="home" label="이 ETF에 담긴 기업" asOfOverride={baseDate} />
          </aside>
        )}
      </div>
    </section>
  );
}
