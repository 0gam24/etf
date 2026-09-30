import Link from 'next/link';
import type { Metadata } from 'next';
import { Radio, ArrowRight } from 'lucide-react';
import { getPostsByCategory } from '@/lib/posts';
import { getLatestEtfData, getKrxEtfMeta } from '@/lib/data';
import {
  computeMarketAvgVolume,
  computeRiskLabels,
  findEtfByCode,
  type RawEtf,
} from '@/lib/surge';
import SurgeRiskLabels from '@/components/SurgeRiskLabels';
import NextChapterCta from '@/components/NextChapterCta';
import Breadcrumbs from '@/components/Breadcrumbs';
import FaqSection from '@/components/FaqSection';
import { CATEGORY_FAQ, CATEGORY_FAQ_TITLE } from '@/lib/category-faq';
import { pickLatestTradeDayBreaking, tradeDateOf } from '@/lib/breaking';
import RecommendBox from '@/components/RecommendBox';
import FreshnessPill from '@/components/FreshnessPill';
import { archivedSinceLabel } from '@/components/PulseTodayHero';
import { buildPageMetadata } from '@/lib/site-meta';

export const metadata: Metadata = buildPageMetadata({
  title: '오늘의 ETF 속보·거래량 TOP',
  description:
    '거래일마다 거래량 상위 3개 ETF가 왜 움직였는지 당일 뉴스와 함께 정리한 속보 기록입니다. 어떤 소식이 수급을 밀었는지, 구성종목과 섹터는 어떻게 연결되는지, 매수 전에 확인할 점은 무엇인지 날짜별로 다시 볼 수 있습니다.',
  url: '/breaking',
  keywords: ['ETF 속보', '거래량 TOP ETF', '오늘 ETF 뉴스', 'ETF 급등 속보', '당일 ETF 분석'],
});

const TODAYS_LIMIT = 3;

export default function BreakingLandingPage() {
  const posts = getPostsByCategory('breaking');
  const etfData = getLatestEtfData();
  const etfList: RawEtf[] = (etfData?.etfList || []) as RawEtf[];
  const marketAvgVolume = computeMarketAvgVolume(etfList);

  // 오늘자(최신 영업일) 속보 — 거래일 기준 그룹핑 + rank 오름차순.
  // UTC date 정렬은 자정 직후 발행 시 어제·오늘 글이 섞이므로 사용 금지.
  const todayPosts = pickLatestTradeDayBreaking(posts, TODAYS_LIMIT);
  const todaySlugs = new Set(todayPosts.map(p => p.meta.slug));
  const archive = posts.filter(p => !todaySlugs.has(p.meta.slug));

  // 헤로 표시용 거래일(YYYYMMDD) → 한국 표기로 변환
  const headTradeDate = todayPosts[0] ? tradeDateOf(todayPosts[0]) : '';
  const todayDate = headTradeDate
    ? new Date(`${headTradeDate.slice(0, 4)}-${headTradeDate.slice(4, 6)}-${headTradeDate.slice(6, 8)}T00:00:00+09:00`)
        .toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short', timeZone: 'Asia/Seoul' })
    : '오늘';
  // 마지막 속보가 오래됐으면 지난 기록임을 알린다 (새 속보가 올라오면 자동으로 사라짐)
  const archivedSince = archivedSinceLabel(todayPosts[0]?.meta.date);

  return (
    <div className="breaking-landing animate-fade-in">
      <Breadcrumbs
        items={[
          { name: '홈', href: '/' },
          { name: 'ETF 속보', href: '/breaking' },
        ]}
      />
      <section className="breaking-hero">
        <div className="breaking-hero-bg" aria-hidden />
        <div className="breaking-hero-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className="breaking-hero-badge">
              <Radio size={13} strokeWidth={3} aria-hidden /> {archivedSince ? 'ETF 속보 · 지난 기록' : 'ETF 속보'}
            </span>
            <FreshnessPill isoDate={todayPosts[0]?.meta.date} />
          </div>
          <h1 className="breaking-hero-title">
            오늘의 ETF 속보, <span className="breaking-hero-accent">거래량 TOP 3 ETF가 왜 움직였나</span>
          </h1>
          <p className="breaking-hero-sub">
            거래일마다 가장 많이 거래된 ETF 3종의 등락 원인과 관련 뉴스, 구성종목을 한 편에 정리한 ETF 속보입니다.
            어떤 소식이 수급을 움직였는지 날짜별로 다시 볼 수 있습니다.
          </p>
          <div className="breaking-hero-meta">
            {todayDate} 기준 · 총 {posts.length}편 누적
          </div>
          {archivedSince && (
            <p className="etf-dict-status-banner" role="note">
              ETF 속보는 {archivedSince}까지 발행된 지난 기록입니다.
              새 글은 매일 아침 <Link href="/guide">ETF 가이드</Link>에 올라옵니다.
            </p>
          )}
        </div>
      </section>

      <RecommendBox position="top" category="general" />

      <div className="breaking-landing-body">
        {/* 오늘의 속보 3카드 */}
        {todayPosts.length > 0 ? (
          <section className="breaking-today">
            <div className="pulse-section-head">
              <h2 className="pulse-section-title">
                {archivedSince ? `${todayDate} 속보` : '오늘의 속보'} · 거래량 TOP {todayPosts.length}
              </h2>
              <p className="pulse-section-hint">어떤 뉴스가 어떤 종목을 어떻게 움직였는지 한 편에</p>
            </div>

            <div className="breaking-today-grid">
              {todayPosts.map((p, i) => {
                const ticker = (p.meta.tickers || [])[0];
                const etf = ticker ? findEtfByCode(etfList, ticker) : null;
                // 시세에 없는 종목도 KRX 매핑으로 정식명 노출
                const krxName = ticker ? getKrxEtfMeta(ticker)?.name : null;
                const etfName = etf?.name || krxName;
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
                      {ticker && (
                        <span className="breaking-card-ticker" title={etfName || undefined}>
                          {etfName ? (
                            <>
                              <strong className="breaking-card-ticker-name">{etfName}</strong>
                              <span className="breaking-card-ticker-code">· {ticker}</span>
                            </>
                          ) : (
                            ticker
                          )}
                        </span>
                      )}
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
              아직 표시할 속보가 없습니다. 새 글은 매일 아침 <Link href="/guide">ETF 가이드</Link>에 올라옵니다.
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

        <FaqSection title={CATEGORY_FAQ_TITLE.breaking} items={CATEGORY_FAQ.breaking} />

        <NextChapterCta
          label="다음 챕터"
          copy="시장의 무게중심이 어디로 옮겨 갔는지 관전포인트로 보기"
          href="/pulse"
        />

        <RecommendBox position="bottom" category="general" />
      </div>
    </div>
  );
}
