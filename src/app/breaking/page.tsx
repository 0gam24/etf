import Link from 'next/link';
import type { Metadata } from 'next';
import { Radio, ArrowRight } from 'lucide-react';
import { getPostsByCategory } from '@/lib/posts';
import { getLatestEtfData } from '@/lib/data';
import {
  computeMarketAvgVolume,
  computeRiskLabels,
  findEtfByCode,
  type RawEtf,
} from '@/lib/surge';
import SurgeRiskLabels from '@/components/SurgeRiskLabels';

export const metadata: Metadata = {
  title: 'ETF 속보 — Daily ETF Pulse',
  description:
    '거래량 TOP 3 ETF의 당일 뉴스 기반 심층 속보. 오늘 어떤 뉴스가 수급을 움직였는지, 구성종목·섹터 연결·4050 투자자 행동까지.',
};

const TODAYS_LIMIT = 3;

export default function BreakingLandingPage() {
  const posts = getPostsByCategory('breaking');
  const etfData = getLatestEtfData();
  const etfList: RawEtf[] = (etfData?.etfList || []) as RawEtf[];
  const marketAvgVolume = computeMarketAvgVolume(etfList);

  // 오늘자(최신 영업일) 속보 3건 + 그 뒤 아카이브
  const todayPosts = posts.slice(0, TODAYS_LIMIT);
  const archive = posts.slice(TODAYS_LIMIT);

  const todayDate = todayPosts[0]
    ? new Date(todayPosts[0].meta.date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })
    : '오늘';

  return (
    <div className="breaking-landing animate-fade-in">
      <section className="breaking-hero">
        <div className="breaking-hero-bg" aria-hidden />
        <div className="breaking-hero-inner">
          <span className="breaking-hero-badge">
            <Radio size={13} strokeWidth={3} aria-hidden /> ETF 속보 · 매일 오전 9시
          </span>
          <h1 className="breaking-hero-title">
            오늘 시장을 움직인 <span className="breaking-hero-accent">3편의 심층 속보</span>
          </h1>
          <p className="breaking-hero-sub">
            거래량 TOP 3 ETF에 대해 매일 **뉴스를 크롤링해 교차 분석**합니다. 시세·구성종목·뉴스·투자자 관점을
            한 편에 묶어 3,000자 이상으로 발행 — 개장 전 5분에 오늘의 핵심을 끝낼 수 있도록.
          </p>
          <div className="breaking-hero-meta">
            {todayDate} 기준 · 총 {posts.length}편 누적
          </div>
        </div>
      </section>

      <div className="breaking-landing-body">
        {/* 오늘의 속보 3카드 */}
        {todayPosts.length > 0 ? (
          <section className="breaking-today">
            <div className="pulse-section-head">
              <h2 className="pulse-section-title">오늘의 속보 · 거래량 TOP {todayPosts.length}</h2>
              <p className="pulse-section-hint">뉴스 + 시세 + 구성종목을 한 편에 — 3,000자+ 심층 분석</p>
            </div>

            <div className="breaking-today-grid">
              {todayPosts.map((p, i) => {
                const ticker = (p.meta.tickers || [])[0];
                const etf = ticker ? findEtfByCode(etfList, ticker) : null;
                const labels = etf ? computeRiskLabels(etf, marketAvgVolume) : [];
                const isUp = (etf?.changeRate ?? 0) >= 0;

                return (
                  <Link
                    key={p.meta.slug}
                    href={`/${p.meta.category}/${p.meta.slug}`}
                    className="breaking-card"
                    data-rank={i + 1}
                  >
                    <div className="breaking-card-head">
                      <span className="breaking-card-rank">#{i + 1}</span>
                      {ticker && <span className="breaking-card-ticker">{ticker}</span>}
                      {etf?.sector && <span className="breaking-card-sector">{etf.sector}</span>}
                    </div>
                    <h3 className="breaking-card-title">{p.meta.title}</h3>
                    <p className="breaking-card-desc">{p.meta.description}</p>

                    {etf && (
                      <div className="breaking-card-data">
                        <div className="breaking-card-price">{etf.price.toLocaleString()}원</div>
                        <div className={`breaking-card-change ${isUp ? 'is-up' : 'is-down'}`}>
                          {isUp ? '+' : ''}{etf.changeRate.toFixed(2)}%
                        </div>
                        <div className="breaking-card-volume">
                          거래량 {(etf.volume / 10000).toFixed(0)}만주
                        </div>
                      </div>
                    )}

                    <SurgeRiskLabels labels={labels} size="sm" />

                    <div className="breaking-card-cta">
                      속보 전문 보기 <ArrowRight size={14} strokeWidth={2.5} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : (
          <section className="breaking-today">
            <p className="pulse-section-empty">
              아직 오늘의 속보가 발행되지 않았습니다. 매일 오전 9시 전 자동 발행됩니다.
            </p>
          </section>
        )}

        {/* 아카이브 */}
        {archive.length > 0 && (
          <section className="breaking-archive">
            <div className="pulse-section-head">
              <h2 className="pulse-section-title">지난 속보 아카이브</h2>
              <p className="pulse-section-hint">총 {archive.length}편</p>
            </div>
            <ul className="pulse-archive-list">
              {archive.slice(0, 12).map(p => (
                <li key={p.meta.slug}>
                  <Link href={`/${p.meta.category}/${p.meta.slug}`} className="pulse-archive-row">
                    <span className="pulse-archive-date">
                      {new Date(p.meta.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="pulse-archive-title">{p.meta.title}</span>
                    <span className="pulse-archive-meta">{p.readingTime}분</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
