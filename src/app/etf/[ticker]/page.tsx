import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getLatestEtfData,
  getAllEtfSlugs,
  resolveEtfTickerOrSlug,
  getKrxEtfMeta,
  getKrxRegistryBaseDate,
  extractIssuerLabel,
  classifyEtfSector,
  getEtfsBySector,
  getEtfsByIssuer,
  getIssuerOfficialUrl,
  getEtfPageFacts,
  formatEtfPriceAsOf,
  codeToSlug,
} from '@/lib/data';
import { listEtfProfiles } from '@/lib/etf-profiles';
import { getInvestmentPoints } from '@/lib/etf-investment-points';
import { getEtfSiblings } from '@/lib/etf-siblings';
import EtfSiblingLinks from '@/components/EtfSiblingLinks';
import { getAllPosts } from '@/lib/posts';
import { getGuidesForSector } from '@/lib/guides';
import Breadcrumbs from '@/components/Breadcrumbs';
import HoldingsPanel from '@/components/HoldingsPanel';
import RecommendBox from '@/components/RecommendBox';
import AnswerBox from '@/components/AnswerBox';
import LiveEtfStats from '@/components/LiveEtfStats';
import {
  buildFinancialProductSchema,
  buildDatasetSchema,
  buildFaqSchema,
  jsonLd,
} from '@/lib/schema';
import EtfProfileSection from '@/components/EtfProfileSection';
import AdBanner from '@/components/AdBanner';
import { AD_SLOTS } from '@/lib/ads';
import type { RawEtf } from '@/lib/surge';
import { buildOg, buildTwitter, ogImageUrl } from '@/lib/site-meta';

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

/** meta description용 지급 주기 문구 ("분배금은 {x} 지급됩니다") */
const FREQ_DESC: Record<string, string> = {
  monthly: '매월',
  quarterly: '분기마다',
  'semi-annual': '반기마다',
  annual: '1년에 한 번',
};

/** 부호 붙은 퍼센트 (+1.23% / -0.45% / 0.00%) */
function signedPct(v: number): string {
  return `${v > 0 ? '+' : ''}${v.toFixed(2)}%`;
}

/** NAV 표기: 소수점이 있으면 둘째 자리까지 */
function formatNav(v: number): string {
  return v.toLocaleString('ko-KR', { maximumFractionDigits: 2 });
}

export async function generateStaticParams() {
  // SEO 친화 슬러그(이름 기반) 전 종목 prerender (종목 수는 data/etf-slug-map.json 기준).
  //   - 코드 기반 URL(/etf/0080g0)은 next.config.ts redirects로 슬러그 URL로 301 이동.
  return getAllEtfSlugs().map(slug => ({ ticker: slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { ticker } = await params;
  const resolved = resolveEtfTickerOrSlug(ticker);
  const code = resolved.shortcode;
  // 시세·괴리율·구성종목·분배·색인 판정을 sitemap-etf.xml과 같은 함수에서 받는다 (SSoT).
  const facts = code ? getEtfPageFacts(code) : null;
  const etf = facts?.price?.etf ?? null;
  const krxMeta = code ? getKrxEtfMeta(code) : null;

  // KRX 매핑조차 없으면 진짜 404
  if (!etf && !krxMeta) return { title: '종목 정보를 찾을 수 없습니다' };

  const canonicalPath = `/etf/${resolved.canonicalSlug}`;
  const name = etf?.name || krxMeta?.name || ticker;
  const displayCode = etf?.code || krxMeta?.shortcode || code || ticker;
  // 수집기의 '기타'는 분류 실패를 뜻하므로 메타에서도 섹터 없음으로 취급한다.
  const sector = etf?.sector && etf.sector !== '기타' ? etf.sector : undefined;

  // 제목·설명이 "실제로 이 페이지에 있는 것"만 약속하도록, 데이터 보유 여부를 먼저 확정한다.
  const holdingsForMeta = facts?.holdings?.holdings || [];
  const income = facts?.income ?? null;
  const navGap = facts?.navGap ?? null;
  const age = facts?.age ?? null;
  // 시세 기준일이 ETF_STALE_DAYS를 넘기면 "현재가"라고 부르지 않는다(지킬 수 없는 약속).
  const isFresh = !!age && !age.isStale;
  const priceWord = isFresh ? '현재가' : '종가';

  // 1A. Title — CTR 수술 (2026-07-19, GSC 실측 기반):
  //   실제 유입 쿼리 문구를 반영 — "{ETF명} etf 구성종목"(6~10위 다수),
  //   "{ETF명} {코드} 분배금 지급 주기", "{ETF명} etf 현재 가격".
  //
  //   2026-08-11 길이 수술: 이전 꼬리("구성종목 TOP10·분배금 지급주기·현재가" 36자)에
  //   layout template(" | Daily ETF Pulse" 18자)이 더해져 고정 54자를 잡아먹었다.
  //   prerender HTML 실측 결과 1147종 중 782종(68.2%)이 60자 초과, 시세 있는 97종은 100% 초과
  //   (평균 71자)라 구글이 뒷부분을 잘라 정작 CTR용으로 넣은 "현재가"가 노출되지 않았다.
  //   → 꼬리를 짧게 줄이고 title.absolute로 template 중복 부착을 끊는다.
  //
  //   2026-08-12 정직성 수술: 제목이 조건 없이 "구성종목·분배금"을 약속했는데
  //   prerender 실측상 구성종목 섹션이 실제로 렌더되는 페이지는 14쪽, 분배금은 10쪽뿐이었다.
  //   나머지 1,146쪽은 제목이 없는 것을 약속하는 상태라 클릭 후 이탈을 부르고,
  //   대량 페이지에서 반복되면 doorway 신호로 읽힐 수 있다.
  //   → 실제 보유한 데이터로만 제목을 만든다.
  //
  //   2026-09-30 재정비: 과거 구글 노출의 92~94%가 "상품명·코드 + 구성종목·분배금·종목코드" 쿼리였다.
  //   앞부분은 항상 "{ETF명}({코드}) ETF", 뒤에는 페이지에 실제로 있는 속성만 붙인다.
  //     구성종목(데이터 있을 때) · 분배금(분배 정보 있을 때) · 현재가(시세 있을 때, 오래된 시세면 "종가")
  //     · 종목코드(항상) · 괴리율(NAV로 계산 가능할 때)
  //   60자를 넘으면 검색 수요가 적은 속성부터 뺀다: 괴리율 → 현재가 → 종목코드 → 분배금 → 구성종목.
  const hasHoldingsData = holdingsForMeta.length > 0;
  const hasIncomeData = !!income;
  const issuerForMeta = extractIssuerLabel(name);
  const TITLE_MAX = 60;
  const titleHead = `${name}(${displayCode}) ETF`;
  // dropOrder가 작을수록 먼저 뺀다
  const titleAttrs: Array<{ label: string; dropOrder: number }> = [];
  if (hasHoldingsData) titleAttrs.push({ label: '구성종목', dropOrder: 5 });
  if (hasIncomeData) titleAttrs.push({ label: '분배금', dropOrder: 4 });
  if (etf) titleAttrs.push({ label: priceWord, dropOrder: 2 });
  titleAttrs.push({ label: '종목코드', dropOrder: 3 });
  if (navGap) titleAttrs.push({ label: '괴리율', dropOrder: 1 });
  // 시세가 없는 종목(색인 제외)은 운용사 카드가 있으면 운용사를 붙인다
  if (!etf && issuerForMeta) titleAttrs.push({ label: '운용사', dropOrder: 0 });
  const composeTitle = (attrs: typeof titleAttrs) =>
    attrs.length ? `${titleHead} ${attrs.map(a => a.label).join('·')}` : titleHead;
  let keptAttrs = [...titleAttrs];
  while (keptAttrs.length > 0 && composeTitle(keptAttrs).length > TITLE_MAX) {
    const drop = keptAttrs.reduce((a, b) => (b.dropOrder < a.dropOrder ? b : a));
    keptAttrs = keptAttrs.filter(a => a !== drop);
  }
  const title = composeTitle(keptAttrs);

  // 1D. Meta: 첫 100자에 기준일과(있으면) 분배 주기를 넣는다.
  //   "종목코드" 문구를 앞에 배치: "krx: {코드}"·"{ETF명} 종목코드" 쿼리(GSC 노출 상위)가
  //   스니펫에서 정답을 바로 확인하도록.
  //   2026-08-11 수술(긴 줄표·선두 이모지 제거, 120~155자 확보)은 유지.
  //   2026-09-30: "매일 갱신" 약속 제거(시세가 멈춘 날에도 그렇게 적혀 있었다), 시세 문장은 기준일 표기,
  //   구성종목 "TOP 10" 문구 제거(실제 보유 데이터는 대표 종목 일부뿐), 괴리율·분배 주기 추가.
  const DESC_MAX = 155;
  const asOfIso = age?.isoDate || '';
  let head: string;
  if (etf && asOfIso) {
    const priceSentence = isFresh
      ? ` ${asOfIso} 종가 ${etf.price.toLocaleString()}원(전일대비 ${signedPct(etf.changeRate)}).`
      : ` 최근 시세 기준일 ${asOfIso}, 종가 ${etf.price.toLocaleString()}원.`;
    const freqSentence = income
      ? ` 분배금은 ${FREQ_DESC[income.frequency] || `${FREQ_LABEL[income.frequency] || income.frequency} 단위로`} 지급됩니다.`
      : '';
    head = `${name} 종목코드 ${displayCode}.${priceSentence}${freqSentence}`;
  } else {
    head = `${name} 종목코드 ${displayCode}(KRX)${sector ? ` ${sector} 섹터` : ''}에 상장된 ETF입니다.`;
  }

  let description = head;
  const addToDesc = (s: string): boolean => {
    if (!s || description.length + s.length > DESC_MAX) return false;
    description += s;
    return true;
  };
  // 가격 외 고유 수치를 먼저: 괴리율 → 구성종목(롱테일 "라인메탈 ETF" 류 매칭) → 섹터 → 운용사 → 꼬리
  // 괴리율이 시세와 다른 날짜의 NAV·종가 쌍이면 그 날짜를 밝힌다
  if (navGap) {
    const navDateNote = navGap.isoDate && navGap.isoDate !== asOfIso ? `(${navGap.isoDate} 기준)` : '';
    addToDesc(` NAV 대비 괴리율 ${signedPct(navGap.gapPct)}${navDateNote}.`);
  }
  for (let n = 4; n >= 1; n--) {
    const names = holdingsForMeta.slice(0, n).map(h => h.name).join('·');
    if (!names) continue;
    if (addToDesc(` 주요 구성종목은 ${names} 등입니다.`)) break;
  }
  if (etf && sector) addToDesc(` ${sector} 섹터로 분류됩니다.`);
  if (issuerForMeta) addToDesc(` 운용사는 ${issuerForMeta}입니다.`);
  // 꼬리: 실제로 페이지에 있는 섹션만 말한다
  const longTail = hasIncomeData
    ? ' 분배율과 지급 월, 같은 운용사의 다른 ETF를 함께 정리했습니다.'
    : etf
      ? ' 거래량과 시가총액, 같은 운용사의 다른 ETF를 함께 정리했습니다.'
      : ' 같은 운용사의 다른 ETF와 투자 포인트를 함께 정리했습니다.';
  const shortTail = ' 투자 포인트를 함께 정리했습니다.';
  if (!addToDesc(longTail)) addToDesc(shortTail);
  if (description.length < 120) addToDesc(' 매수 전 확인할 기본 정보를 한자리에 모았습니다.');
  // 상품 개요(src/lib/etf-profiles.ts)가 있는 종목은 그 설명을 쓴다. 1차 출처로 확인한 문장이고,
  //   상품명 검색이 묻는 "무엇에 투자하는 상품인가"에 바로 답한다. (2026-10-08 네이버 빈틈 보강)
  const profile = facts?.profile ?? null;
  if (profile?.metaDescription && profile.metaDescription.length >= 120 && profile.metaDescription.length <= DESC_MAX) {
    description = profile.metaDescription;
  }

  const ogImage = ogImageUrl({ category: 'stock' });

  // 색인 판정 (SSoT: getEtfPageFacts → shouldIndexEtf, sitemap-etf.xml과 동일).
  //   슬러그 매핑 + 가장 최근 스냅샷(나이 무관)의 시세 + 가격 외 고유 수치(괴리율·구성종목·분배) 1개 이상.
  const robots = facts?.indexable ? undefined : { index: false, follow: true };

  return {
    // absolute — layout template(' | Daily ETF Pulse')이 덧붙는 것을 끊는다.
    //   브랜드 18자를 되찾아 ETF명·구성종목 키워드가 잘리지 않게 한다.
    title: { absolute: title },
    description,
    // 2026-08-12 키워드 정리: 3~7개, '기타' 섹터 폴백 금지.
    // 2026-09-30: 페이지에 없는 데이터(구성종목·분배금)는 키워드로도 약속하지 않는다.
    keywords: [
      name,
      ...(profile?.keywords || []),
      `${name} 주가`,
      `${name} 종목코드`,
      `${displayCode} ETF`,
      ...(hasHoldingsData ? [`${name} 구성종목`] : []),
      ...(hasIncomeData ? [`${name} 분배금`] : []),
      ...(navGap ? [`${name} 괴리율`] : []),
      ...(sector && sector !== '기타' ? [`${sector} ETF`] : []),
    ].slice(0, 7),
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
  // 같은 섹터·운용사 카드용 시세 목록 (가장 최신 스냅샷)
  const etfData = getLatestEtfData();
  const list = (etfData?.etfList || []) as RawEtf[];
  // 이 종목의 시세·괴리율·구성종목·분배 (generateMetadata·sitemap-etf.xml과 같은 판정)
  const facts = code ? getEtfPageFacts(code) : null;
  const etf = facts?.price?.etf ?? null;
  const krxMeta = code ? getKrxEtfMeta(code) : null;

  // KRX 매핑조차 없으면 404 (오타·폐지·신규 등)
  if (!etf && !krxMeta) notFound();

  const canonicalSlug = resolved.canonicalSlug;
  const hasPriceData = etf !== null;

  // 표시용 통합 객체 — 시세 있으면 etf, 없으면 KRX 메타로 대체
  const displayName = etf?.name || krxMeta?.name || ticker;
  const displayCode = etf?.code || krxMeta?.shortcode || ticker;
  // 시세에 sector 있으면 우선, 없으면 이름 기반 분류
  const rawSector = etf?.sector || classifyEtfSector(displayName) || undefined;
  // 수집기는 분류가 안 되면 '기타'를 넣는다. 화면·키워드에서는 섹터가 없는 것과 같게 다룬다.
  //   1,160종 전량 수집 이후 523종이 '기타'로 들어와 "기타 투자 포인트" 같은 어색한 제목이
  //   생겼다. 섹터 pill·키워드에도 아무 값어치가 없다. (2026-08-12)
  const displaySector = rawSector && rawSector !== '기타' ? rawSector : undefined;
  const issuerLabel = extractIssuerLabel(displayName);

  const holdings = facts?.holdings ?? null;
  const incomeEntry = facts?.income ?? null;
  // 1차 출처로 확인한 상품 개요 (있는 종목만, src/lib/etf-profiles.ts)
  const profile = facts?.profile ?? null;
  const navGap = facts?.navGap ?? null;
  // 괴리율이 시세 기준일과 다른 날의 NAV·종가 쌍인지 (그 날 NAV 자료가 빠진 경우)
  const navDateDiffers = !!navGap && !!navGap.isoDate && navGap.isoDate !== (facts?.age?.isoDate || '');

  // 같은 지수 이름을 쓰는 다른 운용사 상품 · 괄호 표기만 다른 상품 · 1:1 비교 페이지 (2026-10-06)
  //   "상품명·코드 + 속성" 검색으로 들어온 사람이 같은 지수의 다른 상품과 바로 견줄 수 있게 하고,
  //   같은 지수 상품끼리 서로 링크해 /etf·/compare 페이지의 크롤 경로를 만든다. 셋 다 없으면 null.
  const siblings = getEtfSiblings(displayCode);

  // 관련 분석 글 (티커 기준)
  const allPosts = getAllPosts();
  const relatedPosts = allPosts
    .filter(p => (p.meta.tickers || []).some(t => t.toUpperCase() === displayCode.toUpperCase()))
    .slice(0, 6);

  const isUp = etf ? etf.change > 0 : false;
  const isDown = etf ? etf.change < 0 : false;
  // 시세 기준일 표기: 7일 이내 "{날짜} 종가 기준", 넘기면 "최근 시세 기준일 {날짜}" (오래됐음을 숨기지 않는다)
  const age = facts?.age ?? null;
  const isFresh = !!age && !age.isStale;
  const asOfIso = age?.isoDate || '';
  const priceAsOfLabel = age ? formatEtfPriceAsOf(age) : '';
  const priceWord = isFresh ? '현재가' : '종가';
  // 실제 데이터 날짜만 쓴다 (이전에는 시세가 없으면 빌드 시각을 넣었다)
  const dataDate = facts?.lastModified || getKrxRegistryBaseDate() || undefined;
  // 구성종목·분배 정보를 직접 확인할 공식 출처 (운용사 사이트가 없으면 KRX 종목정보)
  const issuerOfficialUrl = getIssuerOfficialUrl(displayName);
  const krxInfoUrl = `https://kind.krx.co.kr/common/disclsviewer.do?method=search&searchCodeType=&forward=corpsearch&searchCorpName=${encodeURIComponent(displayName)}`;
  const disclosureUrl = issuerOfficialUrl || krxInfoUrl;
  const disclosureLabel = issuerOfficialUrl && issuerLabel ? `${issuerLabel.split(' ')[0]} 공식 사이트` : 'KRX 종목정보';
  // HoldingsPanel(detail)은 최대 5개를 그린다. 제목의 개수도 실제 렌더 개수와 맞춘다.
  const HOLDINGS_SHOWN_MAX = 5;
  const holdingsShown = holdings ? Math.min(HOLDINGS_SHOWN_MAX, holdings.holdings.length) : 0;

  // ── Schemas ──
  // AEO 정답블록 — 시세 데이터 있는 종목만(doorway 방지: minimal 종목은 자동 생략).
  const answerData = (hasPriceData && etf && asOfIso) ? (() => {
    const dir = etf.changeRate > 0 ? '상승' : '하락';
    const absRate = Math.abs(etf.changeRate).toFixed(2);
    const priceText = `${etf.price.toLocaleString()}원`;
    const move = etf.changeRate === 0 ? '전일과 같았습니다' : `전일보다 ${absRate}% ${dir}했습니다`;
    const summary = isFresh
      ? `${displayName}의 ${asOfIso} 종가는 ${priceText}으로 ${move}.`
      : `${displayName}의 최근 시세 기준일(${asOfIso}) 종가는 ${priceText}이며, 그날 ${move}.`;
    const ks: Array<{ label: string; value: string; sub?: string }> = [
      { label: priceWord, value: priceText, sub: signedPct(etf.changeRate) },
      { label: '거래량', value: `${etf.volume.toLocaleString()}주` },
    ];
    if (navGap) {
      ks.push({
        label: navDateDiffers ? `괴리율(${navGap.isoDate})` : '괴리율',
        value: signedPct(navGap.gapPct),
        sub: `NAV ${formatNav(navGap.nav)}원`,
      });
    }
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
      ? `${displayName}, 한국거래소(KRX) 상장 ETF. 섹터: ${displaySector || '-'}, ${asOfIso} 종가 ${etf!.price.toLocaleString()}원, 거래량 ${etf!.volume.toLocaleString()}주.`
      : `${displayName}, 한국거래소(KRX) 상장 ETF. 단축코드 ${displayCode}.`,
    url: `/etf/${canonicalSlug}`,
    category: 'ETF',
    ...(hasPriceData && asOfIso ? { price: etf!.price, priceDate: asOfIso } : {}),
  });

  // Dataset 설명도 실제로 들어 있는 데이터만 나열한다 (구성종목 TOP 10·분배 정보를 일괄 약속하지 않는다)
  const datasetParts = [
    hasPriceData ? '일별 종가·등락률·거래량·거래대금' : '단축코드·운용사 등 종목 기본 정보',
    navGap ? 'NAV·괴리율' : '',
    holdings ? `대표 구성종목 ${holdingsShown}개` : '',
    incomeEntry ? '분배 정보' : '',
  ].filter(Boolean);
  const datasetSchema = buildDatasetSchema({
    name: `${displayName} (${displayCode}) ETF 종목 정보`,
    description: `${displayName} ETF의 ${datasetParts.join(', ')}. 시세는 한국거래소(KRX) 공공데이터 기준${asOfIso ? `(${asOfIso})` : ''}.`,
    url: `/etf/${canonicalSlug}`,
    // dataDate가 없으면 이 스키마는 렌더하지 않는다 (아래 JSX 참고)
    dateModified: dataDate || '',
    publisher: '한국거래소(KRX) 공공데이터 포털',
    keywords: [
      displayName, displayCode, 'ETF',
      ...(hasPriceData ? ['시세'] : []),
      ...(navGap ? ['괴리율'] : []),
      ...(holdings ? ['구성종목'] : []),
      ...(incomeEntry ? ['분배금'] : []),
      ...(displaySector ? [displaySector] : []),
    ],
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
      {dataDate && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(datasetSchema) }} />
      )}

      <Breadcrumbs items={[
        { name: '홈', href: '/' },
        { name: '종목 사전', href: '/etf' },
        { name: displayName, href: `/etf/${canonicalSlug}` },
      ]} />

      <header className="etf-dict-hero">
        <div className="etf-dict-eyebrow">
          <span className="etf-dict-code">{displayCode}</span>
          {displaySector && <span className="etf-dict-sector">{displaySector}</span>}
          {hasPriceData && asOfIso ? (
            isFresh ? (
              <span className="etf-dict-fresh-pill" title={`시세 기준일 ${asOfIso}`}>
                📅 {asOfIso} 종가 기준
              </span>
            ) : (
              <span className="etf-dict-status-pill" title={`시세 기준일 ${asOfIso}`}>
                최근 시세 기준일 {asOfIso}
              </span>
            )
          ) : (
            <span className="etf-dict-status-pill">KRX 상장 종목</span>
          )}
        </div>
        {/* 1B. H1 — 코드 병기 + "분석 리포트" 키워드 */}
        <h1 className="etf-dict-title">
          {displayName} <span className="etf-dict-title-code">(Ticker: {displayCode})</span> 분석 리포트
        </h1>
        <p className="etf-dict-tagline">
          {hasPriceData && asOfIso
            ? isFresh
              ? `${displayName}의 ${asOfIso} 종가 기준 시세와 ${[
                  navGap ? '괴리율' : '',
                  holdings ? '대표 구성종목' : '',
                  incomeEntry ? '분배 정보' : '',
                  '투자 포인트',
                ].filter(Boolean).join(', ')}를 정리했습니다.`
              : `${displayName}의 최근 시세 기준일은 ${asOfIso}입니다. 그 이후 가격은 반영되지 않았으니 최신 시세는 아래 KRX 종목정보에서 확인하세요.`
            : `${displayName} ETF. ${issuerLabel ? `${issuerLabel.split(' ')[0]} 운용 · ` : ''}단축코드 ${displayCode}. 한국거래소(KRX) 상장 종목 정보.`}
        </p>

        {/* Authority 외부 권위 링크 — Google E-E-A-T (Trustworthiness) 신호 */}
        <div className="etf-dict-authority" aria-label="공식 자료 출처">
          <span className="etf-dict-authority-label">공식 자료:</span>
          <a
            href={krxInfoUrl}
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
        <AnswerBox summary={answerData.summary} keyStats={answerData.keyStats} asOf={`${asOfIso} KRX`} source="KRX 공공데이터" />
      )}

      {/* 상품 개요 — 1차 출처로 확인한 설명이 있는 종목만. 상품명 검색이 먼저 묻는 것이라 시세 표보다 위에 둔다 */}
      {profile && (
        <>
          <EtfProfileSection
            profile={profile}
            name={displayName}
            // 비교표 첫 칸의 "(코드)"를 그 종목 페이지로 잇고, 개요를 쓴 다른 종목도 함께 잇는다 (2026-10-10, 크롤 경로)
            rowLinks={(profile.comparison?.rows || []).map(r => {
              const c = r[0].match(/\(([0-9A-Z]{6})\)/)?.[1];
              return c && c !== profile.code && getKrxEtfMeta(c) ? `/etf/${codeToSlug(c)}` : null;
            })}
            others={listEtfProfiles()
              .filter(p => p.code !== profile.code)
              .map(p => ({ href: `/etf/${codeToSlug(p.code)}`, label: getKrxEtfMeta(p.code)?.name || '' }))
              .filter(o => o.label)}
          />
          {profile.faq && profile.faq.length > 0 && (
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(buildFaqSchema(profile.faq)) }} />
          )}
        </>
      )}

      {/* 시세 요약 — 시세 데이터가 있을 때만 */}
      {hasPriceData && etf && (
        <section className="etf-dict-section">
          {/* 1C. H2 번호 + "시세 및 수익률" 키워드 (KRX 종가 기준 · 오래된 시세면 기준일을 그대로 밝힌다) */}
          <h2 className="etf-dict-h2">{no()}. 시세 및 수익률 ({priceAsOfLabel})</h2>
          <div className="etf-dict-stats">
            <div className="etf-dict-stat">
              <div className="etf-dict-stat-label">{priceWord}</div>
              <div className="etf-dict-stat-value">{etf.price.toLocaleString()}<small>원</small></div>
            </div>
            <div className="etf-dict-stat">
              <div className="etf-dict-stat-label">전일대비</div>
              <div className={`etf-dict-stat-value ${isUp ? 'is-up' : isDown ? 'is-down' : ''}`}>
                {isUp ? '▲ ' : isDown ? '▼ ' : ''}{Math.abs(etf.change).toLocaleString()}원 ({signedPct(etf.changeRate)})
              </div>
            </div>
            {/* NAV·괴리율: NAV가 있고 |괴리율| ≤ 10%일 때만. 없거나 이상치면 카드 자체를 그리지 않는다. */}
            {navGap && (
              <>
                <div className="etf-dict-stat">
                  <div className="etf-dict-stat-label">NAV(순자산가치){navDateDiffers ? ` · ${navGap.isoDate}` : ''}</div>
                  <div className="etf-dict-stat-value">{formatNav(navGap.nav)}<small>원</small></div>
                </div>
                <div className="etf-dict-stat">
                  <div className="etf-dict-stat-label">괴리율{navDateDiffers ? ` · ${navGap.isoDate}` : ''}</div>
                  <div className="etf-dict-stat-value">{signedPct(navGap.gapPct)}</div>
                </div>
              </>
            )}
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
            출처: 한국거래소(KRX) 공공데이터 포털 · 시세 기준일 {asOfIso}
          </p>
          {navGap && (
            <p className="etf-dict-note">
              괴리율은 같은 날 종가와 NAV를 비교한 값입니다: (종가 - NAV) ÷ NAV × 100.
              플러스면 시장가격이 순자산가치보다 비싸게, 마이너스면 싸게 거래됐다는 뜻입니다.
              {navDateDiffers
                ? ` ${asOfIso} 자료에는 NAV가 없어, NAV가 있는 가장 최근 날짜(${navGap.isoDate})의 종가와 NAV로 계산했습니다.`
                : ''}
            </p>
          )}
          {!isFresh && (
            <p className="etf-dict-note">
              시세 기준일({asOfIso}) 이후의 가격은 이 페이지에 반영되지 않았습니다. 최신 시세는 위 KRX 종목정보 링크에서 확인하세요.
            </p>
          )}
          {!holdings && (
            <p className="etf-dict-note">
              구성종목은 운용사 공시에서 확인하세요:{' '}
              <a href={disclosureUrl} target="_blank" rel="noopener noreferrer">{disclosureLabel} ↗</a>
            </p>
          )}
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
            {' '}이 종목은 최근 시세 자료에 포함되어 있지 않습니다. 공식 시세와 구성종목은 위 공식 자료 링크의 KRX·운용사 공시에서 확인하실 수 있습니다.
          </div>
        </section>
      )}

      {/* 본문 수동 광고 1곳 (2026-10-08, 예전 제휴 회전 상자 자리). 첫 정보 섹션(시세 또는 종목 정보)의
          안내 문단 뒤, 다음 섹션 제목 앞이라 버튼·카드에 붙지 않는다. 슬롯 env 가 비면 그리지 않는다. */}
      {AD_SLOTS.inArticle && (
        <AdBanner key={`${canonicalSlug}-in`} slot={AD_SLOTS.inArticle} className="ad-slot--etf ad-slot--inArticle" />
      )}

      {/* 구성종목: 보유한 대표 종목만 표시하고, 전체 구성은 운용사 공시로 안내한다.
          (보유 데이터는 종목별 대표 몇 개뿐이라 "TOP 10"·"전체 구성"을 약속하지 않는다) */}
      {holdings && holdingsShown > 0 ? (
        <section className="etf-dict-section">
          <h2 className="etf-dict-h2">{no()}. 주요 구성 종목 (Top {holdingsShown})</h2>
          <HoldingsPanel
            code={displayCode}
            variant="detail"
            limit={HOLDINGS_SHOWN_MAX}
            label={`${displayCode} 대표 구성종목 (기준일 ${holdings.asOf})`}
            asOfOverride={holdings.asOf}
          />
          <p className="etf-dict-note">
            대표 종목 {holdingsShown}개와 {holdings.asOf} 기준 비중만 보여 드립니다. 비중은 수시로 바뀌니 전체 구성종목과 최신 비중은{' '}
            <a href={disclosureUrl} target="_blank" rel="noopener noreferrer">{disclosureLabel} ↗</a>의 공시에서 확인하세요.
          </p>
        </section>
      ) : null}

      {/* 분배 정보 (income ETF인 경우) */}
      {incomeEntry && (
        <section className="etf-dict-section">
          <h2 className="etf-dict-h2">{no()}. 분배금·분배락일 정보</h2>
          <div className="etf-dict-stats">
            <div className="etf-dict-stat">
              <div className="etf-dict-stat-label">연 분배율(추정)</div>
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
          </p>
          <p className="etf-dict-note">
            {facts?.incomeAsOf ? `분배 정보 기준일 ${facts.incomeAsOf}. ` : ''}
            연 분배율은 최근 12개월 분배 실적으로 추정한 값이라 실제 분배금과 다를 수 있습니다.
            {!incomeEntry.nextExDividendDate ? ' 다음 분배락일과 확정 분배금은' : ' 확정 분배금은'}{' '}
            <a href={disclosureUrl} target="_blank" rel="noopener noreferrer">{disclosureLabel} ↗</a>의 공시에서 확인하세요.
          </p>
        </section>
      )}

      {/* 같은 지수 이름의 다른 ETF: 같은 섹터·같은 운용사 블록보다 검색 의도가 가까워 투자 포인트보다 먼저 둔다 */}
      {siblings && (
        <EtfSiblingLinks info={siblings} sectionNo={no()} currentName={displayName} />
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

      {/* 2026-09-30: 자매 사이트 백링크 상자(MainBackrefBox) 제거. 종목 정보와 무관한 외부 유도였다. */}

      <RecommendBox position="bottom" category="general" />

      <p className="etf-dict-disclaimer">
        {hasPriceData && asOfIso
          ? `시세는 한국거래소(KRX) 공공데이터의 일별 종가 기준이며, 이 페이지의 시세 기준일은 ${asOfIso}입니다.`
          : '이 페이지는 한국거래소(KRX) 상장 종목 목록을 기준으로 정리했습니다.'}
        {holdings || incomeEntry
          ? ' 구성종목과 분배 정보는 운용사 공시를 참고해 정리한 것으로 기준일이 시세와 다를 수 있으니, 최신 내용은 운용사 공시에서 확인하세요.'
          : ''}
        {' '}투자 포인트 코멘트는 일반 정보 제공 목적이며 특정 종목 매수·매도 권유가 아닙니다.
        모든 투자 결정과 그에 따른 손익의 책임은 본인에게 있습니다.
      </p>
    </article>
  );
}
