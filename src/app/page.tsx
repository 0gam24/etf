import type { Metadata } from 'next';
import { getLatestEtfData } from '@/lib/data';
import { getLatestBundle, getUnifiedFeed, getCategoryShelves, formatDateKeyKo } from '@/lib/home-feed';
import { buildItemListSchema, jsonLd } from '@/lib/schema';
import EtfMarketPulse from '@/components/EtfMarketPulse';
import TrustBar from '@/components/TrustBar';
import PersonaSelector from '@/components/PersonaSelector';
import MarketPulseCondensed from '@/components/MarketPulseCondensed';
import HomeTodayBundle from '@/components/HomeTodayBundle';
import HomeLatestFeed from '@/components/HomeLatestFeed';
import HomeCategoryShelves from '@/components/HomeCategoryShelves';
import DataFooter from '@/components/DataFooter';
import RecommendBox from '@/components/RecommendBox';

// 메인 페이지 ISR — 5분마다 SSR 재생성, 그 사이 stale-while-revalidate.
// 자정 / 장중 데이터 갱신이 ~5분 내 메인 반영. Cloudflare 1년 캐시 문제 해소.
export const revalidate = 300;

/**
 * 홈 전용 메타데이터 — layout 기본값에 의존하지 않는다.
 *   블로그형 리뉴얼: "매일 발행"을 title·description에 명시해
 *   검색결과에서 살아있는 발행 매체임을 신호.
 */
export const metadata: Metadata = {
  title: { absolute: 'Daily ETF Pulse — 매일 발행하는 ETF 분석·투자 가이드' },
  description:
    'ETF 투자 가이드와 시장 분석을 매일 발행합니다. 월배당·커버드콜·ISA·연금저축 절세 전략, 급등 테마와 자금 흐름, KRX 전체 ETF 종목 사전까지 한곳에서 확인하세요.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Daily ETF Pulse — 매일 발행하는 ETF 분석·투자 가이드',
    description:
      'ETF 투자 가이드와 시장 분석을 매일 발행. 월배당·커버드콜·절세 전략부터 급등 테마·자금 흐름까지.',
    type: 'website',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Daily ETF Pulse — 매일 발행하는 ETF 분석·투자 가이드',
    description: 'ETF 투자 가이드와 시장 분석을 매일 발행합니다.',
  },
};

export default async function HomePage() {
  const etfData = getLatestEtfData();

  // ── 블로그형 홈의 단일 데이터 소스: 통합 발행 피드 ──
  const bundle = getLatestBundle();
  const latestFeed = getUnifiedFeed(40); // 히어로 날짜 제외 후 12편 표시 여유분
  const shelves = getCategoryShelves(3);

  // 시장 요약 띠(MarketPulseCondensed)용 최소 데이터
  const sortedByChange = (etfData?.etfList || []).slice().sort(
    (a: { changeRate?: number }, b: { changeRate?: number }) => (b.changeRate || 0) - (a.changeRate || 0),
  );
  const topGainer = sortedByChange[0];
  const topEtf = etfData?.byVolume?.[0];
  const totalCount = (etfData?.etfList || []).length;
  const marketAvg = totalCount > 0
    ? (etfData!.etfList as { changeRate?: number }[]).reduce((s, e) => s + (e.changeRate || 0), 0) / totalCount
    : 0;

  // ── CollectionPage + ItemList JSON-LD — 홈을 "발행 허브"로 명시 ──
  const feedForSchema = getUnifiedFeed(30);
  const itemListSchema = buildItemListSchema(
    feedForSchema.map(i => ({ url: i.href, name: i.title })),
    bundle
      ? `Daily ETF Pulse — ${formatDateKeyKo(bundle.dateKey)} 발행 포함 최신 글 ${feedForSchema.length}편`
      : 'Daily ETF Pulse 최신 글',
  );
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Daily ETF Pulse — 매일 발행하는 ETF 분석·투자 가이드',
    description: 'ETF 투자 가이드와 시장 분석을 매일 발행하는 홈 피드.',
    url: process.env.SITE_URL || 'https://iknowhowinfo.com',
    inLanguage: 'ko-KR',
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(collectionSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(itemListSchema) }} />

      {/* TRUST: 신뢰 띠 */}
      <TrustBar etfCount={totalCount || 100} />

      {/* 시장 요약 한 줄 — SSR initial(KRX 마감) + 장중 silent overlay.
          "왜?" CTA → 오늘 발행 묶음(#daily-pulse-hero), "내 상황은?" → PersonaSelector. */}
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

      {/* 페이지 H1 — 홈의 검색 신호 (시각적으로는 작게, 의미상 최상위) */}
      <div className="home-bundle" style={{ paddingBottom: 0 }}>
        <h1 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-dim)', margin: 0 }}>
          매일 발행하는 ETF 분석과 투자 가이드 — Daily ETF Pulse
        </h1>
      </div>

      {/* HERO — 오늘 발행 묶음 전체 (블로그형 홈의 핵심) */}
      {bundle && (
        <div id="daily-pulse-hero" style={{ scrollMarginTop: '5rem' }}>
          <HomeTodayBundle bundle={bundle} />
        </div>
      )}

      {/* 최신 글 통합 피드 — 전 카테고리 최신순 12편 (히어로 날짜 중복 제거) */}
      <HomeLatestFeed items={latestFeed} excludeDateKey={bundle?.dateKey} />

      <RecommendBox position="top" />

      {/* 카테고리별 선반 — 헤더 메뉴 순서, 카테고리당 3편 */}
      <HomeCategoryShelves shelves={shelves} />

      {/* LIVE: 라이브 시장 위젯 (유일한 풀 위젯 — Condensed anchor 대상) */}
      <div id="market-pulse-full" style={{ scrollMarginTop: '5rem' }}>
        <EtfMarketPulse />
      </div>

      {/* 페르소나 선택 — 7 상황별 entry page 라우팅 (Condensed "내 상황은?" anchor) */}
      <div id="persona-selector" style={{ scrollMarginTop: '5rem' }}>
        <PersonaSelector />
      </div>

      <RecommendBox position="bottom" />

      {/* TRUST: 데이터 출처/면책 */}
      <DataFooter
        etfFetchedAt={etfData?.fetchedAt}
        etfCount={totalCount}
      />
    </>
  );
}
