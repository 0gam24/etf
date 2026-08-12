import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getLatestEtfData,
  getEtfHoldings,
  findEtfByAnyCode,
  getAllEtfSlugs,
  resolveEtfTickerOrSlug,
  getKrxEtfMeta,
  extractIssuerLabel,
  classifyEtfSector,
  getEtfsBySector,
  getEtfsByIssuer,
  getIssuerOfficialUrl,
  shouldIndexEtf,
} from '@/lib/data';
import { getInvestmentPoints } from '@/lib/etf-investment-points';
import { getIncomeRegistry } from '@/lib/income-server';
import { getAllPosts } from '@/lib/posts';
import { getGuidesForSector } from '@/lib/guides';
import Breadcrumbs from '@/components/Breadcrumbs';
import HoldingsPanel from '@/components/HoldingsPanel';
import RecommendBox from '@/components/RecommendBox';
import AnswerBox from '@/components/AnswerBox';
import MainBackrefBox, { getBackrefUrlForCategory } from '@/components/MainBackrefBox';
import LiveEtfStats from '@/components/LiveEtfStats';
import {
  buildFinancialProductSchema,
  buildDatasetSchema,
  jsonLd,
} from '@/lib/schema';
import type { RawEtf } from '@/lib/surge';
import { buildOg, buildTwitter } from '@/lib/site-meta';

/**
 * 종목 사전 페이지 — /etf/[ticker]
 *
 *   롱테일 SEO 흡수: "{ETF명} 분배금/구성종목/주가/배당일/시세" 검색 의도.
 *   editorial 글(/stock/[ticker])과 별개 — 이건 데이터 사전.
 *
 *   소스:
 *     - data/raw/etf_prices_*.json (시세)
 *     - data/holdings/{code}.json (구성종목)
 *     - data/income/dividend-registry.json (분배 정보)
 *     - content/ (관련 분석 글)
 *
 *   스키마: FinancialProduct + Dataset + BreadcrumbList
 */

interface PageProps {
  params: Promise<{ ticker: string }>;
}

const FREQ_LABEL: Record<string, string> = {
  monthly: '월',
  quarterly: '분기',
  'semi-annual': '반기',
  annual: '연',
};

export async function generateStaticParams() {
  // SEO 친화 슬러그(이름 기반) 1095종 prerender.
  //   - 코드 기반 URL(/etf/0080g0)은 next.config.ts redirects로 슬러그 URL로 301 이동.
  return getAllEtfSlugs().map(slug => ({ ticker: slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { ticker } = await params;
  const resolved = resolveEtfTickerOrSlug(ticker);
  const code = resolved.shortcode;
  const etfData = getLatestEtfData();
  const list = (etfData?.etfList || []) as RawEtf[];
  const etf = code ? findEtfByAnyCode(list, code) : null;
  const krxMeta = code ? getKrxEtfMeta(code) : null;

  // KRX 매핑조차 없으면 진짜 404
  if (!etf && !krxMeta) return { title: '종목 정보를 찾을 수 없습니다' };

  const canonicalPath = `/etf/${resolved.canonicalSlug}`;
  const name = etf?.name || krxMeta?.name || ticker;
  const displayCode = etf?.code || krxMeta?.shortcode || code || ticker;
  const sector = etf?.sector;

  // 1A. Title — CTR 수술 (2026-07-19, GSC 실측 기반):
  //   실제 유입 쿼리 문구를 반영 — "{ETF명} etf 구성종목"(6~10위 다수),
  //   "{ETF명} {코드} 분배금 지급 주기", "{ETF명} etf 현재 가격".
  //
  //   2026-08-11 길이 수술: 이전 꼬리("구성종목 TOP10·분배금 지급주기·현재가" 36자)에
  //   layout template(" | Daily ETF Pulse" 18자)이 더해져 고정 54자를 잡아먹었다.
  //   prerender HTML 실측 결과 1147종 중 782종(68.2%)이 60자 초과, 시세 있는 97종은 100% 초과
  //   (평균 71자)라 구글이 뒷부분을 잘라 정작 CTR용으로 넣은 "현재가"가 노출되지 않았다.
  //   → 꼬리를 짧게 줄이고 title.absolute로 template 중복 부착을 끊는다.
  //     핵심 키워드(구성종목·분배금·ETF명·코드)는 앞쪽에 그대로 유지.
  const rawTitle = etf
    ? `${name}(${displayCode}) ETF 구성종목·분배금·현재가`
    : `${name}(${displayCode}) ETF 구성종목·분배금 정리`;
  // 아주 긴 ETF명(최대 30자)은 이름만으로도 한계를 넘으므로 꼬리를 한 번 더 축약
  const title = rawTitle.length > 60
    ? `${name}(${displayCode}) ETF 구성종목·분배금`
    : rawTitle;

  // 1D. Meta — 첫 100자에 키워드 압축 (Naver snippet + Google CTR 최적화)
  //   "종목코드"·"krx" 문구를 앞에 배치 — "krx: {코드}"·"{ETF명} 종목코드" 쿼리
  //   (GSC 노출 1·4위)가 스니펫에서 정답을 즉시 확인하도록.
  //   2026-08-11 수술 3건 (prerender HTML 실측 기반):
  //     ① 긴 줄표(—) 제거 — 시청자 가시 텍스트 금지 규칙(CLAUDE.md "AI 티 제거"). 1147종 전부 위반이었다.
  //     ② 선두 이모지 제거 — 구글이 스니펫에서 이모지를 자주 제거해 첫 글자가 낭비됐다.
  //     ③ 길이 보강 — 평균 75자로 목표(120~155자)에 한참 못 미쳐 스니펫 공간을 버리고 있었다.
  //        구성종목을 3개로 늘려 롱테일("라인메탈 ETF" 류) 매칭 면적도 함께 확대.
  const holdingsForMeta = code ? getEtfHoldings(code)?.holdings || [] : [];
  const sectorClause = sector ? ` ${sector} 섹터` : '';
  // 구성종목 데이터가 없는 종목(1147종 중 다수)은 넣을 재료가 적어 설명이 107자에서 멈춘다.
  // 운용사를 문장에 넣어 "{운용사} ETF" 검색도 함께 받고 목표 길이를 채운다.
  const issuerForMeta = extractIssuerLabel(name);
  const issuerClause = issuerForMeta ? ` 운용사는 ${issuerForMeta}입니다.` : '';

  // 구성종목 이름 길이가 종목마다 크게 달라(해외 ETF는 영문 사명이 길다) 고정 개수로는
  // 120~155자 목표를 못 맞춘다. 목표 상한에 들어가는 만큼만 이름을 채운다.
  //   구성종목 이름은 롱테일 검색("라인메탈 ETF" 류)을 직접 물어오므로 꼬리 문구보다 우선한다.
  //   구성종목이 있으면 짧은 꼬리를, 없으면 긴 꼬리를 써서 어느 쪽이든 120~155자에 안착시킨다.
  const DESC_MAX = 155;
  const head = etf
    ? `${name} 종목코드 ${displayCode}(KRX)${sectorClause}. 현재가 ${etf.price.toLocaleString()}원, 전일대비 ${etf.changeRate >= 0 ? '+' : ''}${etf.changeRate.toFixed(2)}%.`
    : `${name} 종목코드 ${displayCode}(KRX)${sectorClause}에 상장된 ETF입니다.`;
  const shortTail = etf
    ? ' 분배금 지급주기·분배락일·투자 포인트를 정리했습니다.'
    : ' 운용사·섹터·구성종목 비중과 관련 분석을 정리했습니다.';
  const longTail = etf
    ? ' 분배금 지급주기와 분배락일, 운용사·섹터 정보, 관련 분석까지 한 페이지에 정리했습니다. KRX 공공데이터 기준 매일 갱신.'
    : ' 운용사와 섹터, 구성종목 비중, 분배금 지급주기, 같은 테마의 다른 ETF와 관련 분석 글까지 정리한 ETF 종목 사전입니다.';
  // 구성종목이 없어 짧아지는 경우에만 덧붙이는 보강 문구
  const padTail = etf
    ? ' 매수 전 확인할 기본 정보를 한자리에 모았습니다.'
    : ' 매수 전 확인할 기본 정보를 한자리에 모아 매일 점검합니다.';

  // 구성종목을 최대 4개까지 넣되, 짧은 꼬리 기준으로 155자를 넘지 않는 범위에서 최대한 채운다.
  let holdingsClause = '';
  for (let n = 4; n >= 1; n--) {
    const names = holdingsForMeta.slice(0, n).map(h => h.name).join('·');
    if (!names) continue;
    const candidate = ` 주요 구성종목은 ${names} 등 TOP 10입니다.`;
    if (head.length + candidate.length + shortTail.length <= DESC_MAX) { holdingsClause = candidate; break; }
  }
  // 꼬리는 남는 자리에 맞춰 긴 버전을 우선 시도 (짧으면 스니펫 공간을 버리게 된다)
  const tail = head.length + holdingsClause.length + longTail.length <= DESC_MAX ? longTail : shortTail;
  let description = head + holdingsClause + tail;
  // 아직 목표(120자)에 못 미치면 운용사 문구 → 보강 문구 순으로 채운다.
  for (const pad of [issuerClause, padTail]) {
    if (description.length >= 120 || !pad) continue;
    if (description.length + pad.length <= DESC_MAX) description += pad;
  }

  const ogImage = `/api/og?title=${encodeURIComponent(name)}&category=stock&tickers=${displayCode}`;

  // thin content 가드 (SSoT: shouldIndexEtf) — 시세·구성종목·관련 분석글이 모두 없는
  //   메타 전용 minimal 종목은 noindex. 관련 분석글이 붙은 인기 테마 종목은 고유 콘텐츠가
  //   있으므로 색인 유지(13에이전트 심의 옵션 B). scaled-content/doorway 신호 차단.
  const relatedPostCount = code
    ? getAllPosts().filter(p =>
        (p.meta.tickers || []).some(t => t.toUpperCase() === code.toUpperCase()),
      ).length
    : 0;
  const indexable = shouldIndexEtf({
    hasPrice: !!etf,
    hasHoldings: holdingsForMeta.length > 0,
    relatedPostCount,
  });
  const robots = indexable ? undefined : { index: false, follow: true };

  return {
    // absolute — layout template(' | Daily ETF Pulse')이 덧붙는 것을 끊는다.
    //   브랜드 18자를 되찾아 ETF명·구성종목 키워드가 잘리지 않게 한다.
    title: { absolute: title },
    description,
    // 2026-08-12 키워드 정리:
    //   ① 9개 → 7개. SEO.md 규칙(3~7개)을 넘어 104쪽이 위반 상태였다.
    //      "{이름} 시세"는 "{이름} 주가"와 사실상 같은 의도라 중복 제거.
    //   ② 섹터 폴백이 '기타'였다. 검색어로 아무 가치가 없고 한국어에서 악기 '기타'와도
    //      겹쳐 오히려 잘못된 매칭을 부른다(26쪽). 섹터가 없거나 '기타'면 아예 뺀다.
    keywords: [
      name,
      `${name} 주가`,
      `${name} 분배금 지급 주기`,
      `${name} 구성종목`,
      `${name} 종목코드`,
      `${displayCode} ETF`,
      //   섹터가 없으면 공통 폴백을 넣지 않고 그냥 6개로 둔다(3~7 규칙 내).
      //   폴백을 쓰면 34쪽이 같은 키워드를 공유해 또 다른 중복이 된다.
      ...(sector && sector !== '기타' ? [`${sector} ETF`] : []),
    ],
    ...(robots ? { robots } : {}),
    alternates: { canonical: canonicalPath },
    // buildOg 경유 — siteName·locale이 빠지지 않게 한다.
    openGraph: buildOg({ title, description, url: canonicalPath, image: ogImage }),
    twitter: buildTwitter({ title, description, url: canonicalPath, image: ogImage }),
  };
}

export default async function EtfDictionaryPage({ params }: PageProps) {
  const { ticker } = await params;
  const resolved = resolveEtfTickerOrSlug(ticker);
  const code = resolved.shortcode;
  const etfData = getLatestEtfData();
  const list = (etfData?.etfList || []) as RawEtf[];
  const etf = code ? findEtfByAnyCode(list, code) : null;
  const krxMeta = code ? getKrxEtfMeta(code) : null;

  // KRX 매핑조차 없으면 404 (오타·폐지·신규 등)
  if (!etf && !krxMeta) notFound();

  const canonicalSlug = resolved.canonicalSlug;
  const hasPriceData = etf !== null;

  // 표시용 통합 객체 — 시세 있으면 etf, 없으면 KRX 메타로 대체
  const displayName = etf?.name || krxMeta?.name || ticker;
  const displayCode = etf?.code || krxMeta?.shortcode || ticker;
  // 시세에 sector 있으면 우선, 없으면 이름 기반 분류
  const displaySector = etf?.sector || classifyEtfSector(displayName) || undefined;
  const issuerLabel = extractIssuerLabel(displayName);

  const holdings = getEtfHoldings(displayCode);
  const incomeRegistry = getIncomeRegistry();
  const incomeEntry = incomeRegistry?.etfs.find(e => e.code === displayCode) || null;

  // 관련 분석 글 (티커 기준)
  const allPosts = getAllPosts();
  const relatedPosts = allPosts
    .filter(p => (p.meta.tickers || []).some(t => t.toUpperCase() === displayCode.toUpperCase()))
    .slice(0, 6);

  const isUp = etf ? etf.change > 0 : false;
  const isDown = etf ? etf.change < 0 : false;
  const baseDate = etfData?.baseDate || '';
  const formattedBaseDate = baseDate
    ? `${baseDate.slice(0, 4)}-${baseDate.slice(4, 6)}-${baseDate.slice(6, 8)}`
    : new Date().toISOString().slice(0, 10);

  // ── Schemas ──
  // AEO 정답블록 — 시세 데이터 있는 종목만(doorway 방지: minimal 종목은 자동 생략).
  const answerData = (hasPriceData && etf) ? (() => {
    const dir = etf.changeRate > 0 ? '상승' : etf.changeRate < 0 ? '하락' : '보합';
    const summary = `${displayName}은 ${formattedBaseDate} 기준 ${Math.abs(etf.changeRate).toFixed(2)}% ${dir}했습니다.`;
    const ks = [
      { label: '현재가', value: `${etf.price.toLocaleString()}원`, sub: `${etf.changeRate >= 0 ? '+' : ''}${etf.changeRate.toFixed(2)}%` },
      { label: '거래량', value: `${etf.volume.toLocaleString()}주` },
    ];
    if (typeof etf.marketCap === 'number' && etf.marketCap > 0) {
      ks.push({ label: '시가총액', value: `${Math.round(etf.marketCap / 1e8).toLocaleString()}억원` });
    } else if (holdings && holdings.holdings[0]) {
      const top = holdings.holdings[0];
      ks.push({ label: '대표 구성', value: `${top.name}${typeof top.weight === 'number' ? ` ${top.weight.toFixed(1)}%` : ''}` });
    }
    return { summary, keyStats: ks };
  })() : null;

  // BreadcrumbList JSON-LD는 아래 <Breadcrumbs> 컴포넌트가 자체 발행 — 여기서 중복 발행 금지
  const financialProductSchema = buildFinancialProductSchema({
    name: displayName,
    code: displayCode,
    description: hasPriceData
      ? `${displayName} ETF — 한국거래소(KRX) 상장. 섹터: ${displaySector || '-'}, 현재가 ${etf!.price.toLocaleString()}원, 거래량 ${etf!.volume.toLocaleString()}주.`
      : `${displayName} ETF — 한국거래소(KRX) 상장 종목. 단축코드 ${displayCode}.`,
    url: `/etf/${canonicalSlug}`,
    category: 'ETF',
    ...(hasPriceData ? { price: etf!.price, priceDate: formattedBaseDate } : {}),
  });

  const datasetSchema = buildDatasetSchema({
    name: `${displayName} (${displayCode}) — ETF 종목 정보`,
    description: hasPriceData
      ? `${displayName} ETF의 일별 종가·등락률·거래량·거래대금 + 구성종목 TOP 10 + 분배 정보. 한국거래소(KRX) 공공데이터 기준.`
      : `${displayName} ETF의 단축코드·운용사·종목 메타 정보. 한국거래소(KRX) 공공데이터 기준.`,
    url: `/etf/${canonicalSlug}`,
    dateModified: formattedBaseDate,
    publisher: '한국거래소(KRX) 공공데이터 포털',
    keywords: [displayName, displayCode, 'ETF', '시세', '구성종목', '분배금', displaySector || ''],
  });

  // H2 섹션 번호 — 실제로 렌더되는 섹션에만 순번을 매긴다.
  //   기존에는 1~8을 하드코딩해, 구성종목(2)·분배(3)처럼 데이터가 없어 빠지는 섹션이 있으면
  //   화면에 "1, 4, 5, 6, 8"처럼 번호가 건너뛰어 미완성 문서처럼 보였다.
  //   실측 결과 1,160종 전부(100%)가 번호 불연속 상태였다. (2026-08-11 온페이지 감사)
  //   JSX는 소스 순서대로 평가되므로, 렌더되는 h2에서만 호출하면 항상 1,2,3…이 된다.
  let sectionNo = 0;
  const no = () => ++sectionNo;

  return (
    <article className="etf-dict animate-fade-in">
      {/* JSON-LD (BreadcrumbList는 <Breadcrumbs>가 발행) */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(financialProductSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(datasetSchema) }} />

      <Breadcrumbs items={[
        { name: '홈', href: '/' },
        { name: '종목 사전', href: '/etf' },
        { name: displayName, href: `/etf/${canonicalSlug}` },
      ]} />

      <header className="etf-dict-hero">
        <div className="etf-dict-eyebrow">
          <span className="etf-dict-code">{displayCode}</span>
          {displaySector && <span className="etf-dict-sector">{displaySector}</span>}
          {hasPriceData ? (
            <span className="etf-dict-fresh-pill" title={`기준일 ${formattedBaseDate}`}>
              📅 {formattedBaseDate} 갱신
            </span>
          ) : (
            <span className="etf-dict-status-pill">KRX 상장 종목</span>
          )}
        </div>
        {/* 1B. H1 — 코드 병기 + "분석 리포트" 키워드 */}
        <h1 className="etf-dict-title">
          {displayName} <span className="etf-dict-title-code">(Ticker: {displayCode})</span> 분석 리포트
        </h1>
        <p className="etf-dict-tagline">
          {hasPriceData
            ? `${displayName} ETF — 오늘 시세, 구성종목, 분배금, 투자 포인트 한 페이지 정리. 매일 09:00 갱신.`
            : `${displayName} ETF — ${issuerLabel ? `${issuerLabel.split(' ')[0]} 운용 · ` : ''}단축코드 ${displayCode}. 한국거래소(KRX) 상장 종목 정보.`}
        </p>

        {/* Authority 외부 권위 링크 — Google E-E-A-T (Trustworthiness) 신호 */}
        <div className="etf-dict-authority" aria-label="공식 자료 출처">
          <span className="etf-dict-authority-label">공식 자료:</span>
          <a
            href={`https://kind.krx.co.kr/common/disclsviewer.do?method=search&searchCodeType=&forward=corpsearch&searchCorpName=${encodeURIComponent(displayName)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="etf-dict-authority-link"
            title="KRX 한국거래소 종목 정보"
          >KRX 종목정보 ↗</a>
          <a
            href={`https://dart.fss.or.kr/dsab007/main.do?textCrpNm=${encodeURIComponent(displayName)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="etf-dict-authority-link"
            title="금융감독원 전자공시"
          >DART 공시 ↗</a>
          {issuerLabel && (() => {
            const officialUrl = getIssuerOfficialUrl(displayName);
            if (!officialUrl) return null;
            return (
              <a
                href={officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="etf-dict-authority-link"
                title={`${issuerLabel.split(' ')[0]} 공식 안내`}
              >{issuerLabel.split(' ')[0]} 공식 ↗</a>
            );
          })()}
          <a
            href="https://www.fss.or.kr/edu/main/main.do"
            target="_blank"
            rel="noopener noreferrer"
            className="etf-dict-authority-link"
            title="금융감독원 금융 교육"
          >금감원 투자자교육 ↗</a>
        </div>
      </header>

      {/* AEO 정답블록 — AI Overview·스니펫 인용용 (시세 종목만) */}
      {answerData && (
        <AnswerBox summary={answerData.summary} keyStats={answerData.keyStats} asOf={`${formattedBaseDate} KRX`} source="KRX 공공데이터" />
      )}

      {/* 시세 요약 — 시세 데이터가 있을 때만 */}
      {hasPriceData && etf && (
        <section className="etf-dict-section">
          {/* 1C. H2 번호 + "시세 및 수익률" 키워드 (KRX 종가 기준) */}
          <h2 className="etf-dict-h2">{no()}. 시세 및 수익률 ({formattedBaseDate} 종가 기준)</h2>
          <div className="etf-dict-stats">
            <div className="etf-dict-stat">
              <div className="etf-dict-stat-label">현재가</div>
              <div className="etf-dict-stat-value">{etf.price.toLocaleString()}<small>원</small></div>
            </div>
            <div className="etf-dict-stat">
              <div className="etf-dict-stat-label">전일대비</div>
              <div className={`etf-dict-stat-value ${isUp ? 'is-up' : isDown ? 'is-down' : ''}`}>
                {isUp ? '▲' : isDown ? '▼' : '–'} {Math.abs(etf.change).toLocaleString()}원 ({isUp ? '+' : ''}{etf.changeRate.toFixed(2)}%)
              </div>
            </div>
            <div className="etf-dict-stat">
              <div className="etf-dict-stat-label">거래량</div>
              <div className="etf-dict-stat-value">{etf.volume.toLocaleString()}<small>주</small></div>
            </div>
            <div className="etf-dict-stat">
              <div className="etf-dict-stat-label">거래대금</div>
              <div className="etf-dict-stat-value">{Math.round((etf.tradeAmount || 0) / 1e8).toLocaleString()}<small>억원</small></div>
            </div>
            <div className="etf-dict-stat">
              <div className="etf-dict-stat-label">시가/고가/저가</div>
              <div className="etf-dict-stat-value-small">
                {etf.openPrice?.toLocaleString() || '-'} / {etf.highPrice?.toLocaleString() || '-'} / {etf.lowPrice?.toLocaleString() || '-'}원
              </div>
            </div>
            {typeof etf.marketCap === 'number' && etf.marketCap > 0 && (
              <div className="etf-dict-stat">
                <div className="etf-dict-stat-label">시가총액</div>
                <div className="etf-dict-stat-value">{Math.round(etf.marketCap / 1e8).toLocaleString()}<small>억원</small></div>
              </div>
            )}
          </div>
          <p className="etf-dict-source">
            출처: 한국거래소(KRX) 공공데이터 포털 · 기준일 {formattedBaseDate}
          </p>
          {etf && (
            <LiveEtfStats
              initial={{
                code: etf.code,
                price: etf.price,
                change: etf.change,
                changeRate: etf.changeRate,
                volume: etf.volume,
              }}
            />
          )}
        </section>
      )}

      {/* 시세 미수집 안내 — minimal 모드: 종목 메타 확장 */}
      {!hasPriceData && (
        <section className="etf-dict-section">
          <h2 className="etf-dict-h2">{no()}. {displayName} 종목 정보</h2>
          <div className="etf-dict-stats">
            <div className="etf-dict-stat">
              <div className="etf-dict-stat-label">단축코드</div>
              <div className="etf-dict-stat-value">{displayCode}</div>
            </div>
            {issuerLabel && (
              <div className="etf-dict-stat">
                <div className="etf-dict-stat-label">운용사</div>
                <div className="etf-dict-stat-value-small">{issuerLabel}</div>
              </div>
            )}
            {displaySector && (
              <div className="etf-dict-stat">
                <div className="etf-dict-stat-label">섹터 분류</div>
                <div className="etf-dict-stat-value-small">{displaySector}</div>
              </div>
            )}
            <div className="etf-dict-stat">
              <div className="etf-dict-stat-label">상장 시장</div>
              <div className="etf-dict-stat-value-small">한국거래소(KRX) ETF</div>
            </div>
          </div>
          <div className="etf-dict-status-banner" role="note">
            <strong>{displayName}</strong>은(는) 한국거래소(KRX)에 상장된 ETF입니다.
            {issuerLabel ? ` ${issuerLabel.split(' ')[0]}이(가) 운용하며,` : ''}
            {displaySector ? ` ${displaySector} 관련 종목으로 분류됩니다.` : ' 아래에서 같은 섹터·운용사의 ETF와 투자 포인트를 함께 확인할 수 있습니다.'}
            {' '}시세·구성종목 데이터는 거래량 상위 종목을 우선 제공하며, 공식 시세는 KRX·운용사 공시에서 확인하실 수 있습니다(아래 공식 자료 링크).
          </div>
        </section>
      )}

      {/* 추천 자료는 첫 정보 섹션 이후에 노출 — 빈 페이지 인상 회피 */}
      <RecommendBox position="top" />

      {/* 구성종목 */}
      {holdings && holdings.holdings.length > 0 && (
        <section className="etf-dict-section">
          <h2 className="etf-dict-h2">{no()}. 주요 구성 종목 (Top {Math.min(10, holdings.holdings.length)})</h2>
          <HoldingsPanel
            code={displayCode}
            variant="detail"
            label={`${displayCode} 구성종목 (기준일 ${holdings.asOf})`}
            asOfOverride={holdings.asOf}
          />
          <p className="etf-dict-note">
            구성종목 비중은 운용사 공시 기준이며 수시로 변동될 수 있습니다.
          </p>
        </section>
      )}

      {/* 분배 정보 (income ETF인 경우) */}
      {incomeEntry && (
        <section className="etf-dict-section">
          <h2 className="etf-dict-h2">{no()}. 분배금·분배락일 정보</h2>
          <div className="etf-dict-stats">
            <div className="etf-dict-stat">
              <div className="etf-dict-stat-label">연 분배율</div>
              <div className="etf-dict-stat-value">{incomeEntry.yield.toFixed(2)}<small>%</small></div>
            </div>
            <div className="etf-dict-stat">
              <div className="etf-dict-stat-label">지급 주기</div>
              <div className="etf-dict-stat-value">{FREQ_LABEL[incomeEntry.frequency] || incomeEntry.frequency} 지급</div>
            </div>
            <div className="etf-dict-stat">
              <div className="etf-dict-stat-label">지급 월</div>
              <div className="etf-dict-stat-value-small">
                {incomeEntry.payMonths.map(m => `${m}월`).join(', ')}
              </div>
            </div>
            {incomeEntry.nextExDividendDate && (
              <div className="etf-dict-stat">
                <div className="etf-dict-stat-label">다음 분배락일</div>
                <div className="etf-dict-stat-value-small">{incomeEntry.nextExDividendDate}</div>
              </div>
            )}
            <div className="etf-dict-stat">
              <div className="etf-dict-stat-label">안정성 등급</div>
              <div className="etf-dict-stat-value">{incomeEntry.stabilityGrade}</div>
            </div>
          </div>
          <p className="etf-dict-note">
            기초자산: {incomeEntry.underlying} · 운용사: {incomeEntry.issuer}
            {incomeEntry.note ? ` · ${incomeEntry.note}` : ''}
            {!incomeEntry.nextExDividendDate && (
              <> · 다음 분배락일은 운용사 공시 갱신 시 표시됩니다.</>
            )}
          </p>
        </section>
      )}

      {/* 4. 투자 포인트 — Phase 2C 섹터별 정형 템플릿 */}
      {(() => {
        const points = getInvestmentPoints(displaySector);
        return (
          <section className="etf-dict-section etf-dict-points">
            <h2 className="etf-dict-h2">{no()}. {displaySector ? `${displaySector} 투자 포인트` : '투자 포인트'}</h2>
            <p className="etf-dict-points-summary">{points.summary}</p>
            <div className="etf-dict-points-grid">
              {points.points.map((p, i) => (
                <div key={i} className="etf-dict-point-card">
                  <div className="etf-dict-point-heading">{p.heading}</div>
                  <p className="etf-dict-point-body">{p.body}</p>
                </div>
              ))}
            </div>
            <p className="etf-dict-note">
              ※ 본 코멘트는 섹터 일반 정보이며 특정 종목 매수·매도 권유가 아닙니다. 투자 결정의 책임은 본인에게 있습니다.
            </p>
          </section>
        );
      })()}

      {/* 5. 같은 섹터 다른 ETF — Phase 2A */}
      {displaySector && displaySector !== '기타' && (() => {
        const sectorEtfs = getEtfsBySector(displaySector, displayCode, 6, list);
        if (sectorEtfs.length === 0) return null;
        return (
          <section className="etf-dict-section">
            <h2 className="etf-dict-h2">{no()}. {displaySector} 다른 ETF</h2>
            <ul className="etf-dict-related-grid">
              {sectorEtfs.map(r => (
                <li key={r.shortcode}>
                  <Link href={`/etf/${r.slug}`} prefetch={false} className="etf-dict-related-card">
                    <div className="etf-dict-related-card-head">
                      <span className="etf-dict-related-card-code">{r.shortcode}</span>
                      {r.issuer && <span className="etf-dict-related-card-issuer">{r.issuer}</span>}
                    </div>
                    <div className="etf-dict-related-card-name">{r.name}</div>
                    {r.hasPrice && typeof r.changeRate === 'number' && (
                      <div className={`etf-dict-related-card-change ${r.changeRate > 0 ? 'is-up' : r.changeRate < 0 ? 'is-down' : ''}`}>
                        {r.changeRate >= 0 ? '+' : ''}{r.changeRate.toFixed(2)}%
                      </div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })()}

      {/* 6. 같은 운용사 다른 ETF — Phase 2B */}
      {issuerLabel && (() => {
        const issuerCode = issuerLabel.split(' ')[0];
        const issuerEtfs = getEtfsByIssuer(issuerCode, displayCode, 6, list);
        if (issuerEtfs.length === 0) return null;
        return (
          <section className="etf-dict-section">
            <h2 className="etf-dict-h2">{no()}. {issuerCode} 다른 ETF</h2>
            <ul className="etf-dict-related-grid">
              {issuerEtfs.map(r => (
                <li key={r.shortcode}>
                  <Link href={`/etf/${r.slug}`} prefetch={false} className="etf-dict-related-card">
                    <div className="etf-dict-related-card-head">
                      <span className="etf-dict-related-card-code">{r.shortcode}</span>
                    </div>
                    <div className="etf-dict-related-card-name">{r.name}</div>
                    {r.hasPrice && typeof r.changeRate === 'number' && (
                      <div className={`etf-dict-related-card-change ${r.changeRate > 0 ? 'is-up' : r.changeRate < 0 ? 'is-down' : ''}`}>
                        {r.changeRate >= 0 ? '+' : ''}{r.changeRate.toFixed(2)}%
                      </div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })()}

      {/* 7. 관련 분석 글 */}
      {relatedPosts.length > 0 && (
        <section className="etf-dict-section">
          <h2 className="etf-dict-h2">{no()}. {displayName} 관련 분석 ({relatedPosts.length}편)</h2>
          <ul className="etf-dict-related">
            {relatedPosts.map(p => (
              <li key={p.meta.slug}>
                <Link href={`/${p.meta.category}/${p.meta.slug}`} prefetch={false}>
                  <span className="etf-dict-related-cat">{p.categoryName}</span>
                  <span className="etf-dict-related-title">{p.meta.title}</span>
                  <span className="etf-dict-related-date">
                    {new Date(p.meta.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 8. 관련 ETF 가이드 — 종목사전 → 가이드 클러스터 연결(섹터 매칭 + 기초 가이드) */}
      {(() => {
        const sectorGuides = getGuidesForSector(displaySector, 4);
        if (!sectorGuides.length) return null;
        return (
          <section className="etf-dict-section">
            <h2 className="etf-dict-h2">{no()}. {displayName} 관련 ETF 가이드</h2>
            <ul className="etf-dict-related">
              {sectorGuides.map(g => (
                <li key={g.slug}>
                  <Link href={`/guide/${g.slug}`} prefetch={false}>
                    <span className="etf-dict-related-cat">가이드</span>
                    <span className="etf-dict-related-title">{g.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })()}

      {/* Phase 3B — 운용사 공식 외부 링크 (E-E-A-T 외부 권위 link out) */}
      {(() => {
        const officialUrl = getIssuerOfficialUrl(displayName);
        if (!officialUrl || !issuerLabel) return null;
        const issuerCode = issuerLabel.split(' ')[0];
        return (
          <p className="etf-dict-official-link">
            ※ 더 자세한 운용 정보는 <a href={officialUrl} target="_blank" rel="noopener noreferrer">{issuerCode} 공식 안내 →</a>를 참고하세요.
          </p>
        );
      })()}

      <MainBackrefBox
        variant="inline"
        mainCategoryUrl={getBackrefUrlForCategory('etf')}
        pulseTitle={`${displayName} 시세·정책·산업 배경은 메인 데이터 저널에서 검증·해설됩니다.`}
      />

      <RecommendBox position="bottom" category="general" />

      <p className="etf-dict-disclaimer">
        본 페이지의 시세·구성종목·분배 정보는 KRX·운용사 공식 데이터를 기반으로 매일 09:00에 갱신됩니다.
        투자 포인트 코멘트는 일반 정보 제공 목적이며 특정 종목 매수·매도 권유가 아닙니다.
        모든 투자 결정과 그에 따른 손익의 책임은 본인에게 있습니다.
      </p>
    </article>
  );
}
