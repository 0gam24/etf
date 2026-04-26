import Link from 'next/link';
import { ArrowRight, Waves } from 'lucide-react';
import type { SectorAggregate } from '@/lib/flow';
import type { Post } from '@/lib/posts';
import { formatTradeAmount } from '@/lib/flow';

interface Props {
  hottest: SectorAggregate | null;
  coldest: SectorAggregate | null;
  totalEtfs: number;
  baseDate?: string;
  latestPost: Post | null;
}

function formatBaseDate(s?: string): string {
  if (!s || s.length !== 8) return s || '';
  return `${s.slice(0,4)}.${s.slice(4,6)}.${s.slice(6,8)}`;
}

export default function FlowHero({ hottest, coldest, totalEtfs, baseDate, latestPost }: Props) {
  const tagline = (hottest && coldest)
    ? `${hottest.sector}로 자금이 몰리고, ${coldest.sector}에서 빠지고 있습니다.`
    : '오늘 섹터 자금 흐름이 집계되는 중입니다.';

  return (
    <section className="flow-hero">
      <div className="flow-hero-bg" aria-hidden />
      <div className="flow-hero-inner">
        <span className="flow-hero-badge">
          <Waves size={13} strokeWidth={3} aria-hidden /> FLOW · 섹터 자금 흐름
        </span>
        <h1 className="flow-hero-title">
          오늘의 ETF 섹터 자금 흐름 — <span className="flow-hero-accent">어디로</span> 돈이 몰리고 빠지나
        </h1>
        <p className="flow-hero-tagline">{tagline}</p>

        <div className="flow-hero-stats">
          <div className="flow-hero-stat">
            <div className="flow-hero-stat-label">분석 ETF</div>
            <div className="flow-hero-stat-value">{totalEtfs}종</div>
          </div>
          {hottest && (
            <div className="flow-hero-stat">
              <div className="flow-hero-stat-label">오늘 최대 유입 섹터</div>
              <div className="flow-hero-stat-value">{hottest.sector}</div>
              <div className="flow-hero-stat-sub">
                평균 +{hottest.avgChange.toFixed(2)}% · 거래대금 {formatTradeAmount(hottest.totalTradeAmount)}원
              </div>
            </div>
          )}
          {coldest && (
            <div className="flow-hero-stat">
              <div className="flow-hero-stat-label">오늘 최대 유출 섹터</div>
              <div className="flow-hero-stat-value">{coldest.sector}</div>
              <div className="flow-hero-stat-sub">
                평균 {coldest.avgChange.toFixed(2)}% · 거래대금 {formatTradeAmount(coldest.totalTradeAmount)}원
              </div>
            </div>
          )}
        </div>

        <div className="flow-hero-asof">기준일 {formatBaseDate(baseDate)} · KRX 공공데이터</div>

        {latestPost && (
          <Link href={`/${latestPost.meta.category}/${latestPost.meta.slug}`} className="flow-hero-cta">
            이번 주 자금 흐름 리포트 <ArrowRight size={16} strokeWidth={2.5} />
          </Link>
        )}
      </div>
    </section>
  );
}
