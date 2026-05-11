import { getLatestPulse, getPostsByCategory, findPostByTickerInCategories } from '@/lib/posts';
import { getLatestEtfData, getLatestEcoData } from '@/lib/data';
import { getIncomeRegistry } from '@/lib/income-server';
import { extractFirstHeadline, pickLatestTradeDayBreaking } from '@/lib/breaking';
import { buildHookCopy } from '@/lib/hook';
import { computeTickerDiff } from '@/lib/pulse';
import type { RawEtf } from '@/lib/surge';
import EtfMarketPulse from '@/components/EtfMarketPulse';
import HoldingsPanel from '@/components/HoldingsPanel';
import TrustBar from '@/components/TrustBar';
import HomeHookV1 from '@/components/HomeHookV1';
import HomeHeroV3 from '@/components/HomeHeroV3';
import HomeBreakingStrip from '@/components/HomeBreakingStrip';
import HomeSnapshot from '@/components/HomeSnapshot';
import HomeScenarioRouter from '@/components/HomeScenarioRouter';
import HomeDefenseTop3 from '@/components/HomeDefenseTop3';
import HomeReturnTrigger from '@/components/HomeReturnTrigger';
import DataFooter from '@/components/DataFooter';
import RecommendBox from '@/components/RecommendBox';

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

  // 거래량 1위
  const sortedByVolume = (etfData?.etfList || []).slice().sort(
    (a: { volume?: number }, b: { volume?: number }) => (b.volume || 0) - (a.volume || 0),
  );
  const topEtf = etfData?.byVolume?.[0] || sortedByVolume[0];

  // 홈 속보 — 오늘의 도화선(topEtf 관련) + 3카드 스트립
  // 거래일(pulseDate/slug) 기준 그룹핑 → rank 오름차순. UTC date 함정 회피.
  const breakingPosts = pickLatestTradeDayBreaking(getPostsByCategory('breaking'), 3);
  const topEtfBreakingPost = topEtf
    ? findPostByTickerInCategories(topEtf.code, ['breaking'])
    : null;
  const catalystNews = extractFirstHeadline(topEtfBreakingPost);
  const catalystHref = topEtfBreakingPost
    ? `/${topEtfBreakingPost.meta.category}/${topEtfBreakingPost.meta.slug}`
    : undefined;

  // 상승/하락 1위
  const sortedByChange = (etfData?.etfList || []).slice().sort(
    (a: { changeRate?: number }, b: { changeRate?: number }) => (b.changeRate || 0) - (a.changeRate || 0),
  );
  const topGainer = sortedByChange[0];
  const topLoser = sortedByChange[sortedByChange.length - 1];

  // 시장 평균 등락률
  const totalCount = (etfData?.etfList || []).length;
  const marketAvg = totalCount > 0
    ? (etfData!.etfList as { changeRate?: number }[]).reduce((s, e) => s + (e.changeRate || 0), 0) / totalCount
    : 0;

  // Chapter 1: Hook 1문장 (templates 기반, 결정적)
  const hook = buildHookCopy(topEtf, etfData?.baseDate);

  // Chapter 8: 어제 대비 변화
  const tickerDiff = computeTickerDiff(latestPulse, yesterdayPulse);
  const todayPulseHref = latestPulse
    ? `/${latestPulse.meta.category}/${latestPulse.meta.slug}`
    : undefined;

  return (
    <>
      {/* Chapter 0 — TRUST: 신뢰 띠 */}
      <TrustBar etfCount={totalCount || 100} />

      {/* Chapter 1 — HOOK: 오늘의 단 한 문장 */}
      <HomeHookV1 hook={hook} />

      {/* Chapter 2 — DATA: 메인 히어로 + 5초 스냅샷 */}
      <HomeHeroV3
        latestPulse={latestPulse}
        topEtf={topEtf}
        catalystNews={catalystNews}
        catalystHref={catalystHref}
        baseDate={etfData?.baseDate}
      />

      <RecommendBox position="top" />

      {/* Chapter 3 — BREAKING: 오늘의 ETF 속보 (홀딩스 펼침) */}
      <HomeBreakingStrip posts={breakingPosts} etfs={(etfData?.etfList || []) as RawEtf[]} />

      <HomeSnapshot
        topVolume={topEtf}
        topGainer={topGainer}
        topLoser={topLoser}
        marketAvg={marketAvg}
        totalCount={totalCount}
      />

      {/* Market Snapshot — 거시 지표 + 거래량 1위 holdings */}
      <section className="dashboard-section" style={{ marginTop: '0', position: 'relative', zIndex: 10 }}>
        <div className="section-title-group">
          <h2 className="section-title">Market Snapshot</h2>
          <p className="section-subtitle">오늘의 거시 지표와 거래량 1위 ETF 심층 분석</p>
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

          {topEtf && (
            <div className="dashboard-card animate-slide-up reveal" style={{ gridColumn: 'span 2' }}>
              <h3 className="dashboard-card-title">오늘 거래량 1위 · {topEtf.name}</h3>
              <div className="top-etf-grid">
                <div className="dashboard-table-wrap">
                  <table className="dashboard-table">
                    <tbody>
                      <tr><td className="font-medium">현재가</td><td>{topEtf.price.toLocaleString()}원</td></tr>
                      <tr><td className="font-medium">전일대비</td><td className={topEtf.change > 0 ? 'text-red' : (topEtf.change < 0 ? 'text-blue' : '')}>{topEtf.change > 0 ? '▲' : (topEtf.change < 0 ? '▼' : '-')} {Math.abs(topEtf.change).toLocaleString()}</td></tr>
                      <tr><td className="font-medium">거래량</td><td>{topEtf.volume.toLocaleString()}주</td></tr>
                    </tbody>
                  </table>
                </div>

                <HoldingsPanel
                  code={topEtf.code}
                  variant="home"
                  asOfOverride={etfData?.baseDate}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Chapter 4 — WHY NOW: 4 시나리오 라우터 */}
      <HomeScenarioRouter
        latestPulse={latestPulse}
        latestSurge={latestSurge}
        latestFlow={latestFlow}
        topIncomeEtf={topIncomeEtf}
      />

      {/* Chapter 5 — RISK: 안정성 S 등급 방어 라인업 */}
      {defenseEtfs.length > 0 && <HomeDefenseTop3 defenseEtfs={defenseEtfs} />}

      {/* Chapter 7 — LIVE: 라이브 시장 위젯 */}
      <EtfMarketPulse />

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
