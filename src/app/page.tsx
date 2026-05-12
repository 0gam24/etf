import { getLatestPulse, getPostsByCategory, findPostByTickerInCategories } from '@/lib/posts';
import { getLatestEtfData, getLatestEcoData, getEtfHoldings } from '@/lib/data';
import { getIncomeRegistry } from '@/lib/income-server';
import { extractFirstHeadline, pickLatestTradeDayBreaking } from '@/lib/breaking';
import { buildMarketHookCopy } from '@/lib/hook';
import { computeTickerDiff } from '@/lib/pulse';
import type { RawEtf } from '@/lib/surge';
import EtfMarketPulse from '@/components/EtfMarketPulse';
import HoldingsPanel from '@/components/HoldingsPanel';
import LiveQuoteTable from '@/components/LiveQuoteTable';
import TrustBar from '@/components/TrustBar';
import VolumeSurgeAlert from '@/components/VolumeSurgeAlert';
import TrendingNow from '@/components/TrendingNow';
import PersonaSelector from '@/components/PersonaSelector';
import MarketPulseCondensed from '@/components/MarketPulseCondensed';
import HomeHookV1 from '@/components/HomeHookV1';
import HomeHeroV3 from '@/components/HomeHeroV3';
import HomeBreakingStrip from '@/components/HomeBreakingStrip';
import HomeSnapshot from '@/components/HomeSnapshot';
import HomeScenarioRouter from '@/components/HomeScenarioRouter';
import HomeDefenseTop3 from '@/components/HomeDefenseTop3';
import HomeReturnTrigger from '@/components/HomeReturnTrigger';
import DataFooter from '@/components/DataFooter';
import RecommendBox from '@/components/RecommendBox';

// 메인 페이지 ISR — 5분마다 SSR 재생성, 그 사이 stale-while-revalidate.
// 자정 / 장중 데이터 갱신이 ~5분 내 메인 반영. Cloudflare 1년 캐시 문제 해소.
export const revalidate = 300;

export default async function HomePage() {
  const latestPulse = getLatestPulse();
  const latestSurge = getPostsByCategory('surge')[0] ?? null;
  const latestFlow = getPostsByCategory('flow')[0] ?? null;
  const pulses = getPostsByCategory('pulse');
  const yesterdayPulse = pulses[1] ?? null;
  const etfData = getLatestEtfData();
  const ecoData = getLatestEcoData();
  const incomeRegistry = getIncomeRegistry();

  // 안정성 S 등급 ETF (없으면 A 등급까지 폴백)
  const defenseEtfs = (() => {
    if (!incomeRegistry?.etfs?.length) return [];
    const sGrade = incomeRegistry.etfs.filter(e => e.stabilityGrade === 'S');
    if (sGrade.length >= 3) return sGrade.sort((a, b) => b.yield - a.yield).slice(0, 3);
    const aGrade = incomeRegistry.etfs.filter(e => e.stabilityGrade === 'A');
    return [...sGrade, ...aGrade].sort((a, b) => {
      const order: Record<string, number> = { S: 0, A: 1, B: 2, C: 3 };
      return order[a.stabilityGrade] - order[b.stabilityGrade] || b.yield - a.yield;
    }).slice(0, 3);
  })();

  // INCOME 미니 계산기용 — 가장 안정적인 1순위
  const topIncomeEtf = defenseEtfs.length
    ? { name: defenseEtfs[0].name, yield: defenseEtfs[0].yield }
    : null;

  // 거래량 1위 (Condensed·Snapshot 보조 표시용 + breaking 폴백)
  const sortedByVolume = (etfData?.etfList || []).slice().sort(
    (a: { volume?: number }, b: { volume?: number }) => (b.volume || 0) - (a.volume || 0),
  );
  const topEtf = etfData?.byVolume?.[0] || sortedByVolume[0];

  // 상승/하락 1위 — 새 HERO 의 분석 대상 (라이브 방향성 종목)
  const sortedByChange = (etfData?.etfList || []).slice().sort(
    (a: { changeRate?: number }, b: { changeRate?: number }) => (b.changeRate || 0) - (a.changeRate || 0),
  );
  const topGainer = sortedByChange[0];
  const topLoser = sortedByChange[sortedByChange.length - 1];

  // ── 상승 1위 ETF 중심 연동 ──────────────────────────────────────
  // HERO 좌측 분석 글 = 상승 1위 종목 관련 글 (pulse / surge / breaking 모든 카테고리 검색)
  // 없으면 거래량 1위 폴백, 그것도 없으면 latestPulse
  const allBreakingPosts = getPostsByCategory('breaking');
  const topGainerAnyPost = topGainer
    ? findPostByTickerInCategories(topGainer.code, ['surge', 'pulse', 'breaking', 'flow'])
    : null;
  const topGainerBreakingPost = topGainer
    ? findPostByTickerInCategories(topGainer.code, ['breaking'])
    : null;
  const topEtfBreakingPost = topEtf
    ? findPostByTickerInCategories(topEtf.code, ['breaking'])
    : null;

  // HERO 분석 글 = 상승 1위 관련 글 (모든 카테고리) → 거래량 1위 글 폴백 → latestPulse
  const heroAnalysisPost = topGainerAnyPost || (topEtf ? findPostByTickerInCategories(topEtf.code, ['pulse', 'surge', 'flow']) : null) || latestPulse;

  // 도화선 = 상승 1위 관련 breaking → 거래량 1위 breaking 폴백
  const heroBreakingPost = topGainerBreakingPost || topEtfBreakingPost;
  const catalystNews = extractFirstHeadline(heroBreakingPost);
  const catalystHref = heroBreakingPost
    ? `/${heroBreakingPost.meta.category}/${heroBreakingPost.meta.slug}`
    : undefined;

  // 속보 strip: 상승 1위 관련 글 1순위, 나머지는 최근 거래일 기준
  const latestTradeDayBreakings = pickLatestTradeDayBreaking(allBreakingPosts, 3);
  const breakingPosts = (() => {
    if (!topGainerBreakingPost) return latestTradeDayBreakings;
    const dedup = latestTradeDayBreakings.filter(p => p.meta.slug !== topGainerBreakingPost.meta.slug);
    return [topGainerBreakingPost, ...dedup].slice(0, 3);
  })();

  // top10 baseline + 각 ETF 별 holdings + catalyst 사전 (HERO 우측 카드 live swap 용)
  const baselineTop10 = (etfData?.byVolume || []).slice(0, 10) as Array<{
    code: string; name: string; price: number; change?: number; changeRate?: number; volume: number;
  }>;
  const heroDict: Record<string, { holdings: Array<{ ticker?: string; name: string; weight: number }>; catalyst: { title: string; source: string; href?: string } | null }> = {};
  for (const b of baselineTop10) {
    const h = getEtfHoldings(b.code);
    const top3 = (h?.holdings || []).slice(0, 3).map(x => ({ ticker: x.ticker, name: x.name, weight: x.weight }));
    const post = findPostByTickerInCategories(b.code, ['breaking']);
    const news = extractFirstHeadline(post);
    heroDict[b.code] = {
      holdings: top3,
      catalyst: news
        ? { title: news.title, source: news.source, href: post ? `/${post.meta.category}/${post.meta.slug}` : undefined }
        : null,
    };
  }

  // 시장 평균 등락률
  const totalCount = (etfData?.etfList || []).length;
  const marketAvg = totalCount > 0
    ? (etfData!.etfList as { changeRate?: number }[]).reduce((s, e) => s + (e.changeRate || 0), 0) / totalCount
    : 0;

  // 가장 큰 카테고리 (Hook 시장 전체 + Condensed 보조)
  const topCategory = Object.entries(etfData?.categories || {})
    .map(([key, c]) => ({ name: (c as { name?: string }).name || key, avgChange: (c as { avgChange?: number }).avgChange || 0 }))
    .reduce<{ name: string; avgChange: number } | null>(
      (best, c) => (!best || Math.abs(c.avgChange) > Math.abs(best.avgChange)) ? c : best, null,
    );

  // Chapter 1: Hook — '라이브 시장 전체' 한 문장 (LIVE 위젯 직후 위치)
  const hook = buildMarketHookCopy({ marketAvg, topCategory, totalCount }, etfData?.baseDate);

  // Chapter 8: 어제 대비 변화
  const tickerDiff = computeTickerDiff(latestPulse, yesterdayPulse);
  const todayPulseHref = latestPulse
    ? `/${latestPulse.meta.category}/${latestPulse.meta.slug}`
    : undefined;

  return (
    <>
      {/* Chapter 0 — TRUST: 신뢰 띠 */}
      <TrustBar etfCount={totalCount || 100} />

      {/* Volume Surge — 장중 거래량 급증 ETF 발견 시 동적 노출 */}
      <VolumeSurgeAlert baselineList={(etfData?.byVolume || []).slice(0, 10) as { code: string; name: string; volume: number; changeRate: number; price: number }[]} />

      {/* MarketPulseCondensed — 메인 최상단 5초 스냅샷.
          SSR initial 데이터 (KRX 마감) 항상 표시 + 한투 silent overlay (장중 30s).
          "왜?" CTA → HomeHeroV3 분석 funnel, "내 상황은?" → PersonaSelector. */}
      <MarketPulseCondensed
        initialTopVolume={topEtf ? { code: topEtf.code, name: topEtf.name, price: topEtf.price, changeRate: topEtf.changeRate || 0, volume: topEtf.volume } : null}
        initialTopGainer={topGainer ? { code: topGainer.code, name: topGainer.name, price: topGainer.price, changeRate: topGainer.changeRate || 0 } : null}
        initialMarketAvg={marketAvg}
        initialCategories={Object.entries(etfData?.categories || {}).map(([key, c]) => ({ name: (c as { name?: string }).name || key, avgChange: (c as { avgChange?: number }).avgChange || 0 }))}
        initialBaseline={(etfData?.byVolume || []).slice(0, 10).map((e: { code: string; name: string; price: number; changeRate?: number; volume: number }) => ({
          code: e.code, name: e.name, price: e.price, changeRate: e.changeRate || 0, volume: e.volume,
        }))}
        fullWidgetAnchor="#market-pulse-full"
      />

      {/* Chapter 1 — HOOK: 라이브 시장 전체 한 문장 (30s polling 재생성) */}
      <HomeHookV1
        hook={hook}
        baseline={(etfData?.byVolume || []).slice(0, 10).map((e: { code: string; name: string; price: number; changeRate?: number; volume: number }) => ({
          code: e.code, name: e.name, changeRate: e.changeRate || 0, volume: e.volume,
        }))}
        initialCategories={Object.entries(etfData?.categories || {}).map(([key, c]) => ({ name: (c as { name?: string }).name || key, avgChange: (c as { avgChange?: number }).avgChange || 0 }))}
        totalCount={totalCount}
      />

      {/* Chapter 7 — LIVE: 라이브 시장 전체 위젯 (시청자에게 '지금 살아있다' 신호 먼저) */}
      <div id="market-pulse-full" style={{ scrollMarginTop: '5rem' }}>
        <EtfMarketPulse />
      </div>

      {/* Chapter 2 — DATA HERO: 라이브 상승 1위 ETF + '왜 오르고 있나' 분석 funnel
          (Condensed "왜?" CTA anchor — 거래량 1위가 아니라 방향성 종목으로 전환) */}
      <div id="daily-pulse-hero" style={{ scrollMarginTop: '5rem' }}>
        <HomeHeroV3
          latestPulse={heroAnalysisPost}
          topEtf={topGainer || topEtf}
          baseDate={etfData?.baseDate}
          baseline={baselineTop10.map(b => ({
            code: b.code, name: b.name, price: b.price, change: b.change ?? 0, changeRate: b.changeRate ?? 0, volume: b.volume,
          }))}
          heroDict={heroDict}
        />
      </div>

      <RecommendBox position="top" />

      {/* Chapter 3 — BREAKING: 상승 1위 ETF 관련 속보 우선 (+ 최근 거래일 폴백) */}
      <HomeBreakingStrip posts={breakingPosts} etfs={(etfData?.etfList || []) as RawEtf[]} />

      <HomeSnapshot
        topVolume={topEtf}
        topGainer={topGainer}
        topLoser={topLoser}
        marketAvg={marketAvg}
        totalCount={totalCount}
        baseDate={etfData?.baseDate}
        baseline={(etfData?.byVolume || []).slice(0, 10).map((e: { code: string; name: string; price: number; changeRate?: number; volume: number; sector?: string }) => ({
          code: e.code, name: e.name, price: e.price, changeRate: e.changeRate || 0, volume: e.volume, sector: e.sector,
        }))}
      />

      {/* Market Snapshot — 거시 지표 + 거래량 1위 holdings */}
      <section className="dashboard-section" style={{ marginTop: '0', position: 'relative', zIndex: 10 }}>
        <div className="section-title-group">
          <h2 className="section-title">Market Snapshot</h2>
          <p className="section-subtitle">오늘의 거시 지표와 {topGainer ? '상승 1위' : '거래량 1위'} ETF 심층 분석</p>
        </div>
        <div className="dashboard-grid">
          {ecoData && (
            <div className="dashboard-card animate-slide-up reveal">
              <h3 className="dashboard-card-title">주요 경제 지표</h3>
              <div className="eco-stats">
                <div className="eco-stat-item">
                  <span className="eco-stat-label">한국은행 기준금리</span>
                  <span className="eco-stat-value">{ecoData.indicators.baseRate}%</span>
                </div>
                <div className="eco-stat-item">
                  <span className="eco-stat-label">원/달러 환율</span>
                  <span className="eco-stat-value">{ecoData.indicators.exchangeRate.toLocaleString()}원</span>
                </div>
                <div className="eco-stat-item">
                  <span className="eco-stat-label">소비자물가(전년비)</span>
                  <span className="eco-stat-value">{ecoData.indicators.cpi}%</span>
                </div>
              </div>
            </div>
          )}

          {(topGainer || topEtf) && (() => {
            const featured = topGainer || topEtf;
            const isGainer = !!topGainer;
            return (
              <div className="dashboard-card animate-slide-up reveal" style={{ gridColumn: 'span 2' }}>
                <h3 className="dashboard-card-title">
                  {isGainer ? '오늘 상승 1위' : '오늘 거래량 1위'} · {featured.name}
                </h3>
                <div className="top-etf-grid">
                  <LiveQuoteTable
                    initial={{
                      code: featured.code,
                      name: featured.name,
                      price: featured.price,
                      change: featured.change,
                      changeRate: featured.changeRate,
                      volume: featured.volume,
                    }}
                    baseDate={etfData?.baseDate}
                  />

                  <HoldingsPanel
                    code={featured.code}
                    variant="home"
                    asOfOverride={etfData?.baseDate}
                  />
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* Chapter 4 — WHY NOW: 4 시나리오 라우터 */}
      <HomeScenarioRouter
        latestPulse={latestPulse}
        latestSurge={latestSurge}
        latestFlow={latestFlow}
        topIncomeEtf={topIncomeEtf}
      />

      {/* Trending Now — 장중 30초 polling 으로 상위 등락률 ETF TOP3 */}
      {(etfData?.byVolume || []).length > 0 && (
        <TrendingNow baseline={(etfData?.byVolume || []).slice(0, 10) as { code: string; name: string; volume: number; changeRate: number; price: number }[]} />
      )}

      {/* 페르소나 선택 — 7 상황별 entry page 라우팅 (Condensed "내 상황은?" anchor) */}
      <div id="persona-selector" style={{ scrollMarginTop: '5rem' }}>
        <PersonaSelector />
      </div>

      {/* Chapter 5 — RISK: 안정성 S 등급 방어 라인업 (페르소나 다음, 재방문 트리거 직전 위치 — 위험 관리 niche 충족) */}
      {defenseEtfs.length > 0 && <HomeDefenseTop3 defenseEtfs={defenseEtfs} />}

      {/* Chapter 8 — TOMORROW: 어제 대비 변화 (재방문 트리거) */}
      <HomeReturnTrigger
        diff={tickerDiff}
        hasYesterday={!!yesterdayPulse}
        todayPulseHref={todayPulseHref}
      />

      <RecommendBox position="bottom" />

      {/* Chapter 9 — TRUST: 데이터 출처/면책 */}
      <DataFooter
        etfFetchedAt={etfData?.fetchedAt}
        ecoFetchedAt={ecoData?.fetchedAt}
        etfCount={totalCount}
      />
    </>
  );
}
