import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import type { RawEtf } from '@/lib/surge';
import { computeRiskLabels, findEtfByCode } from '@/lib/surge';
import { findPostByTickerInCategories, findStockPostByTicker } from '@/lib/posts';
import SurgeRiskLabels from './SurgeRiskLabels';

/** 티커 → 우선순위 기반 베스트 목적지 (surge 포스트 → stock 가이드 → income 포스트 → /surge) */
function bestDestinationForTicker(ticker: string): { href: string; title: string } {
  // 1순위: 같은 티커를 다룬 surge 포스트
  const surge = findPostByTickerInCategories(ticker, ['surge']);
  if (surge) return { href: `/${surge.meta.category}/${surge.meta.slug}`, title: surge.meta.title };

  // 2순위: 종목 완벽 가이드 (stock)
  const stock = findStockPostByTicker(ticker);
  if (stock) return { href: `/stock/${stock.meta.slug}`, title: stock.meta.title };

  // 3순위: income 포스트 (커버드콜·월배당)
  const income = findPostByTickerInCategories(ticker, ['income']);
  if (income) return { href: `/${income.meta.category}/${income.meta.slug}`, title: income.meta.title };

  // 최종 fallback: surge 랜딩
  return { href: '/surge', title: '급등 테마 분석' };
}

interface Props {
  tickers: string[];
  etfs: RawEtf[];
  marketAvgVolume: number;
}

/**
 * 포스트 프론트매터의 tickers를 받아 오늘 시세 + 위험 라벨을 함께 노출.
 *   "글 작성 시점"과 "지금 이 순간" 사이의 시세 변화를 독자가 빠르게 교차 검증할 수 있게 합니다.
 */
export default function PostRelatedEtfs({ tickers, etfs, marketAvgVolume }: Props) {
  const rows = tickers
    .map(t => findEtfByCode(etfs, t))
    .filter((e): e is RawEtf => !!e);

  if (rows.length === 0) return null;

  return (
    <section className="post-related-etfs">
      <div className="post-related-head">
        <span className="post-related-eyebrow">오늘 시세 · 위험 신호</span>
        <span className="post-related-hint">글 작성 시점과 지금을 비교해 보세요</span>
      </div>

      <ul className="post-related-list">
        {rows.map(e => {
          const labels = computeRiskLabels(e, marketAvgVolume);
          const dest = bestDestinationForTicker(e.code);
          return (
            <li key={e.code} className="post-related-row">
              <div className="post-related-main">
                <div className="post-related-name">{e.name}</div>
                <div className="post-related-code">
                  {e.code} · {e.sector || '섹터 미분류'}
                </div>
              </div>
              <div className="post-related-metrics">
                <div className="post-related-price">{e.price.toLocaleString()}원</div>
                <div className={`post-related-change ${e.changeRate >= 0 ? 'is-up' : 'is-down'}`}>
                  {e.changeRate >= 0 ? '+' : ''}{e.changeRate.toFixed(2)}%
                </div>
              </div>
              <div className="post-related-labels">
                <SurgeRiskLabels labels={labels} size="sm" />
              </div>
              <Link
                href={dest.href}
                className="post-related-link"
                prefetch={false}
                title={dest.title}
                aria-label={`${e.name}: ${dest.title}`}
              >
                <ExternalLink size={14} strokeWidth={2.4} aria-hidden />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
