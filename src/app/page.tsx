import type { Metadata } from 'next';
import Link from 'next/link';
import { getLatestEtfData, getKrxEtfMeta } from '@/lib/data';
import { COMPARE_PAIRS } from '@/lib/etf-compare-pairs';
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
import { buildOg, buildTwitter } from '@/lib/site-meta';

// ⚠️ `export const revalidate`를 두지 않는다. (2026-08-12)
//
//   open-next.config.ts는 staticAssetsIncrementalCache를 쓴다. 런타임에 캐시를 쓸 수 없는
//   읽기 전용 백엔드라, ISR 재검증이 새 항목을 저장하지 못하고 영원히 끝나지 않는다.
//   프로덕션 실측에서 홈만 `s-maxage=2` + `x-nextjs-cache: STALE`이었고
//   /guide·/etf/*는 `s-maxage=31536000` + HIT였다. 즉 홈만 매 요청 재검증에 걸려
//   sitemap priority 1.0인 최상위 크롤 진입점의 TTFB가 가장 느렸다.
//
//   콘텐츠는 매 push마다 재빌드되므로 ISR 없이도 갱신에 문제가 없다.
//   장중 실시간 수치는 클라이언트 컴포넌트가 따로 가져온다.

/**
 * 홈 전용 메타데이터 — layout 기본값에 의존하지 않는다.
 *   2026-10-06: "매일 발행"은 운영 v2.0(새 주소 주 2개 이하) 이후 지킬 수 없는 약속이라 사실 기준으로 한 번 바꾼다.
 *   네이버는 메인 설명을 자주 바꾸는 것을 불리하게 보므로 이후에는 자주 바꾸지 않는다.
 */
const HOME_TITLE = 'Daily ETF Pulse, ETF 종목 사전·비교·투자 가이드';
const HOME_DESC =
  'KRX에 상장된 ETF 1,100여 종을 종목코드로 찾는 종목 사전, 같은 지수를 따르는 ETF의 운용사별 비교, 월배당·커버드콜·ISA·연금저축 절세 가이드를 관할 기관 문서와 기준일을 밝혀 한곳에 정리했습니다.';

export const metadata: Metadata = {
  // absolute — layout의 template('%s | Daily ETF Pulse')을 무시하고 이 제목 그대로 사용
  title: { absolute: HOME_TITLE },
  description: HOME_DESC,
  alternates: { canonical: '/' },
  // buildOg 경유 — 직접 openGraph를 쓰면 layout의 og(이미지·siteName·locale)가 통째로
  // 교체돼 홈의 og:image가 사라진다 (2026-08-11 감사에서 실제 누락 확인).
  openGraph: buildOg({ title: HOME_TITLE, description: HOME_DESC, url: '/' }),
  twitter: buildTwitter({ title: HOME_TITLE, description: HOME_DESC, url: '/' }),
};

export default async function HomePage() {
  const etfData = getLatestEtfData();
  // 홈 비교 링크: 두 코드가 모두 KRX 목록에 있는 페어만 (sitemap 과 같은 조건)
  const krxNameOf = (code: string) => getKrxEtfMeta(code)?.name;
  const comparePairs = COMPARE_PAIRS
    .filter(p => krxNameOf(p.codeA) && krxNameOf(p.codeB))
    .map(p => ({ slug: p.slug, label: `${krxNameOf(p.codeA)} vs ${krxNameOf(p.codeB)} 차이` }));

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
      ? `Daily ETF Pulse, ${formatDateKeyKo(bundle.dateKey)} 발행 포함 최신 글 ${feedForSchema.length}편`
      : 'Daily ETF Pulse 최신 글',
  );
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: HOME_TITLE,
    description: HOME_DESC,
    url: process.env.SITE_URL || 'https://iknowhowinfo.com',
    inLanguage: 'ko-KR',
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(collectionSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(itemListSchema) }} />

      {/* TRUST: 신뢰 띠 */}
      <TrustBar etfCount={totalCount || 100} />

      {/* 2026-10-08: 시장 요약 띠(MarketPulseCondensed)와 라이브 시세 위젯(EtfMarketPulse)을 뺐다.
          시세가 10-01 에 멈춘 상태로 홈 첫 화면을 차지했고(이용 조건 결정 전), 종목 링크가 코드 주소(308)를 거쳤다.
          홈은 검색으로 들어온 사람이 다음에 갈 곳(같은 지수 비교·도구·주제별 가이드)으로 바로 보낸다. */}
      {void [MarketPulseCondensed, EtfMarketPulse, topGainer, topEtf, marketAvg]}

      {/* 페이지 H1 — 홈의 검색 신호 (시각적으로는 작게, 의미상 최상위) */}
      <div className="home-bundle" style={{ paddingBottom: 0 }}>
        <h1 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-dim)', margin: 0 }}>
          ETF 종목 사전·비교·투자 가이드 · Daily ETF Pulse
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

      {/* 같은 지수 ETF 비교와 계산 도구 — 홈에서 바로 닿게 (2026-10-08). 비교 페이지는 그동안 홈에서 4클릭이었다. */}
      <section className="home-bundle" aria-labelledby="home-compare-title">
        <h2 id="home-compare-title" className="home-bundle-title">같은 지수 ETF 비교와 계산 도구</h2>
        <ul className="home-link-list">
          {comparePairs.map(p => (
            <li key={p.slug}>
              <Link href={`/compare/${p.slug}`} prefetch={false}>{p.label}</Link>
            </li>
          ))}
          <li><Link href="/compare" prefetch={false}>같은 지수 ETF 비교 전체 보기</Link></li>
          <li><Link href="/tools/dividend-calculator" prefetch={false}>ETF 분배금 계산기</Link></li>
          <li><Link href="/tools/tax-compare" prefetch={false}>계좌별 세후 수익률 비교 (ISA·연금저축·IRP)</Link></li>
        </ul>
      </section>

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
