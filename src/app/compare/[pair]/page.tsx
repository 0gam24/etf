import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import {
  getKrxEtfMeta,
  codeToSlug,
  classifyEtfSector,
  extractIssuerLabel,
  getEtfPageFacts,
  type EtfPageFacts,
} from '@/lib/data';
import { COMPARE_PAIRS, getComparePairBySlug, type ComparePair } from '@/lib/etf-compare-pairs';
import Breadcrumbs from '@/components/Breadcrumbs';
import RecommendBox from '@/components/RecommendBox';
import AnswerBox from '@/components/AnswerBox';
import FaqSection from '@/components/FaqSection';
import { SITE_NAME, SITE_LOCALE, ogImageUrl } from '@/lib/site-meta';

/**
 * /compare/{pair}: 1:1 ETF 비교 페이지
 *
 *   사용자 검색 의도: "KODEX 200 vs TIGER 200", "SOL 미국배당다우존스 TIGER 미국배당다우존스 차이"
 *
 *   2026-10-06 정직화:
 *   - 제목이 "시세·구성종목·보수"를 조건 없이 약속했는데, 총보수는 페이지 어디에도 없고
 *     구성종목은 두 상품 모두 데이터가 있는 쌍이 드물었다. 제목은 두 상품 모두 실제 값이 있는 속성만 붙인다.
 *   - description이 context 전문을 이어 붙여 200자를 넘겼다(검색 결과에서 잘림).
 *     120~155자 안에서 문장 단위로만 더한다.
 *   - 시세 비교가 "오늘" 기준이라고 적혀 있었지만 실제로는 가장 최근 스냅샷 기준이다. 기준일을 밝히고,
 *     같은 날 종가·NAV·괴리율·거래대금·시가총액을 한 표로 놓는다(종목 사전과 같은 getEtfPageFacts 사용).
 *   - 확인하지 않은 총보수 범위 수치를 뺐다.
 */

interface PageProps {
  params: Promise<{ pair: string }>;
}

const TITLE_MAX = 60;
const DESC_MIN = 120;
const DESC_MAX = 155;
/** layout template(' | Daily ETF Pulse') 길이 */
const TEMPLATE_SUFFIX_LEN = 18;

function signedPct(v: number): string {
  return `${v > 0 ? '+' : ''}${v.toFixed(2)}%`;
}

function formatNav(v: number): string {
  return v.toLocaleString('ko-KR', { maximumFractionDigits: 2 });
}

/** 원 → 억원. 1억 미만은 "1억원 미만" (반올림 0원 표기 방지) */
function formatEok(v: number | undefined | null): string {
  if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) return '-';
  if (v < 1e8) return '1억원 미만';
  return `${Math.round(v / 1e8).toLocaleString('ko-KR')}억원`;
}

/** context의 첫 문장. "U.S." 같은 약어의 마침표에서는 끊지 않는다. */
function firstSentence(text: string): string {
  const parts = (text || '').trim().split(/(?<=(?:[가-힣)%]|[A-Za-z]{2})\.)\s+/);
  return (parts[0] || '').trim();
}

/** 비교 페이지가 실제로 보여 주는 데이터 (generateMetadata·본문 공용) */
function loadPairData(p: ComparePair) {
  const metaA = getKrxEtfMeta(p.codeA);
  const metaB = getKrxEtfMeta(p.codeB);
  if (!metaA || !metaB) return null;
  const factsA = getEtfPageFacts(metaA.shortcode);
  const factsB = getEtfPageFacts(metaB.shortcode);
  const etfA = factsA.price?.etf ?? null;
  const etfB = factsB.price?.etf ?? null;
  const isoA = factsA.age?.isoDate || '';
  const isoB = factsB.age?.isoDate || '';
  const bothPrice = !!etfA && !!etfB;
  /** 두 상품 시세 기준일이 같으면 그 날짜 */
  const commonIso = bothPrice && isoA && isoA === isoB ? isoA : '';
  const capA = etfA && typeof etfA.marketCap === 'number' && etfA.marketCap > 0 ? etfA.marketCap : null;
  const capB = etfB && typeof etfB.marketCap === 'number' && etfB.marketCap > 0 ? etfB.marketCap : null;
  return {
    metaA, metaB, factsA, factsB, etfA, etfB, isoA, isoB, bothPrice, commonIso, capA, capB,
    bothNavGap: !!factsA.navGap && !!factsB.navGap,
    bothCap: capA !== null && capB !== null,
    bothHoldings: !!factsA.holdings && !!factsB.holdings,
    anyStale: !!factsA.age?.isStale || !!factsB.age?.isStale,
  };
}

export async function generateStaticParams() {
  // KRX 코드가 해석되지 않는 페어는 404로 렌더되므로 prerender 대상에서 제외한다.
  return COMPARE_PAIRS
    .filter(p => getKrxEtfMeta(p.codeA) && getKrxEtfMeta(p.codeB))
    .map(p => ({ pair: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { pair } = await params;
  const p = getComparePairBySlug(pair);
  if (!p) return { title: '비교 페이지를 찾을 수 없습니다' };
  const d = loadPairData(p);
  if (!d) return { title: '비교 페이지를 찾을 수 없습니다' };
  const { metaA, metaB, etfA, etfB, factsA, factsB, commonIso, capA, capB } = d;

  // 제목: 두 상품 모두 실제 값이 있는 속성만. 60자를 넘으면 뒤(검색 수요가 적은 쪽)부터 뺀다.
  const attrs: string[] = [];
  if (d.bothHoldings) attrs.push('구성종목');
  if (d.bothCap) attrs.push('시가총액');
  if (d.bothNavGap) attrs.push('괴리율');
  if (d.bothPrice) attrs.push('종가');
  const head = `${metaA.name} vs ${metaB.name} 비교`;
  const compose = (a: string[]) => (a.length ? `${head}: ${a.join('·')}` : head);
  let kept = [...attrs];
  while (kept.length > 0 && compose(kept).length > TITLE_MAX) kept = kept.slice(0, -1);
  const title = compose(kept);

  // description: 120~155자. 문장 단위로만 더해 중간에서 잘리지 않게 한다.
  let description = `${metaA.name}(${metaA.shortcode}) vs ${metaB.name}(${metaB.shortcode}).`;
  const add = (s: string): boolean => {
    if (!s || description.length + s.length > DESC_MAX) return false;
    description += s;
    return true;
  };
  const ctx = firstSentence(p.context);
  if (ctx) add(` ${ctx}`);
  const dateLabel = commonIso || '최근';
  if (d.bothPrice && etfA && etfB) {
    add(` ${dateLabel} 종가 ${etfA.price.toLocaleString('ko-KR')}원 대 ${etfB.price.toLocaleString('ko-KR')}원.`);
  }
  if (d.bothCap) add(` 시가총액 ${formatEok(capA)} 대 ${formatEok(capB)}.`);
  if (d.bothNavGap && factsA.navGap && factsB.navGap) {
    add(` 괴리율 ${signedPct(factsA.navGap.gapPct)} 대 ${signedPct(factsB.navGap.gapPct)}.`);
  }
  const fillers = d.bothPrice
    ? [' 같은 날 NAV·거래대금까지 한 표에 나란히 놓았습니다.', ' 고를 때 확인할 기준도 함께 정리했습니다.', ' 기준일을 함께 표기했습니다.']
    : [' 두 상품의 종목 정보와 고를 때 확인할 기준을 정리했습니다.', ' 고를 때 확인할 기준을 정리했습니다.'];
  for (const f of fillers) {
    if (description.length >= DESC_MIN) break;
    add(f);
  }

  const canonicalPath = `/compare/${p.slug}`;
  const ogImage = ogImageUrl({
    title: `${metaA.name} vs ${metaB.name}`,
    category: 'compare',
    tickers: `${metaA.shortcode},${metaB.shortcode}`,
  });

  return {
    // 두 정식명이 모두 들어가 길다. template을 붙이면 60자를 넘는 경우 absolute로 브랜드 꼬리를 끊는다.
    title: title.length + TEMPLATE_SUFFIX_LEN > TITLE_MAX ? { absolute: title } : title,
    description,
    // 같은 문구가 두 번 들어가지 않게 중복 제거 (searchIntent가 "A B 차이"와 같은 쌍이 있다)
    keywords: [...new Set([
      `${metaA.name} vs ${metaB.name}`,
      `${metaA.name} ${metaB.name} 차이`,
      `${metaA.name} ${metaB.name} 비교`,
      `${metaA.shortcode} ${metaB.shortcode}`,
      p.searchIntent,
      ...(d.bothNavGap ? [`${metaA.name} 괴리율`, `${metaB.name} 괴리율`] : []),
    ])].slice(0, 8),
    alternates: { canonical: canonicalPath },
    openGraph: {
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      title,
      description,
      type: 'website',
      url: canonicalPath,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [ogImage] },
  };
}

interface TableRow {
  label: string;
  a: ReactNode;
  b: ReactNode;
}

export default async function ComparePairPage({ params }: PageProps) {
  const { pair } = await params;
  const p = getComparePairBySlug(pair);
  if (!p) notFound();
  const d = loadPairData(p);
  if (!d) notFound();
  const { metaA, metaB, factsA, factsB, etfA, etfB, isoA, isoB, commonIso, capA, capB } = d;

  const sectorOf = (facts: EtfPageFacts, name: string) => {
    const s = facts.price?.etf.sector || classifyEtfSector(name) || '';
    return s && s !== '기타' ? s : '';
  };
  const sectorA = sectorOf(factsA, metaA.name);
  const sectorB = sectorOf(factsB, metaB.name);
  const issuerA = extractIssuerLabel(metaA.name);
  const issuerB = extractIssuerLabel(metaB.name);
  const holdingsA = factsA.holdings;
  const holdingsB = factsB.holdings;
  const slugA = codeToSlug(metaA.shortcode);
  const slugB = codeToSlug(metaB.shortcode);

  const anyPrice = !!etfA || !!etfB;
  const dateLabel = commonIso ? `${commonIso} 종가 기준` : '최근 종가 기준';
  const hasHedgeName = /\((?:[^)]*\s)?H\)/.test(`${metaA.name} ${metaB.name}`);
  const navDateDiffers =
    (!!factsA.navGap?.isoDate && factsA.navGap.isoDate !== isoA) ||
    (!!factsB.navGap?.isoDate && factsB.navGap.isoDate !== isoB);

  // H2 순번: 렌더되는 섹션에만 매긴다 (구성종목 섹션이 빠질 때 번호가 건너뛰지 않게)
  let sectionNo = 0;
  const no = () => ++sectionNo;

  // AEO 정답블록: 기준일을 밝힌 사실 서술만 (YMYL). 조사 오류가 없게 이름 뒤에 조사를 붙이지 않는다.
  const answerSummary = d.bothPrice && etfA && etfB
    ? `${commonIso || '최근'} 종가: ${metaA.name} ${etfA.price.toLocaleString('ko-KR')}원(${signedPct(etfA.changeRate)}), ${metaB.name} ${etfB.price.toLocaleString('ko-KR')}원(${signedPct(etfB.changeRate)}).${d.bothCap ? ` 시가총액은 ${formatEok(capA)} 대 ${formatEok(capB)}입니다.` : ''}`
    : '';
  const statFor = (name: string, facts: EtfPageFacts, cap: number | null) => {
    const e = facts.price?.etf;
    const subParts = [
      e ? signedPct(e.changeRate) : '',
      facts.navGap ? `괴리율 ${signedPct(facts.navGap.gapPct)}` : '',
      cap ? `시총 ${formatEok(cap)}` : '',
    ].filter(Boolean);
    return { label: name, value: e ? `${e.price.toLocaleString('ko-KR')}원` : '-', sub: subParts.join(' · ') };
  };
  const answerKeyStats = d.bothPrice
    ? [statFor(metaA.name, factsA, capA), statFor(metaB.name, factsB, capB)]
    : [];

  // 시세 비교표: 같은 스냅샷의 종가·NAV·괴리율·거래량·거래대금·시가총액
  const navCell = (facts: EtfPageFacts, iso: string, kind: 'nav' | 'gap'): ReactNode => {
    const g = facts.navGap;
    if (!g) return '-';
    const v = kind === 'nav' ? `${formatNav(g.nav)}원` : signedPct(g.gapPct);
    return g.isoDate && g.isoDate !== iso
      ? <>{v}<small className="compare-table-date">{g.isoDate}</small></>
      : v;
  };
  const changeCell = (facts: EtfPageFacts): ReactNode => {
    const e = facts.price?.etf;
    if (!e) return '-';
    const cls = e.change > 0 ? 'is-up' : e.change < 0 ? 'is-down' : undefined;
    return <span className={cls}>{signedPct(e.changeRate)}</span>;
  };
  const tableRows: TableRow[] = anyPrice
    ? [
        { label: '종가', a: etfA ? `${etfA.price.toLocaleString('ko-KR')}원` : '-', b: etfB ? `${etfB.price.toLocaleString('ko-KR')}원` : '-' },
        { label: '전일대비', a: changeCell(factsA), b: changeCell(factsB) },
        { label: 'NAV(순자산가치)', a: navCell(factsA, isoA, 'nav'), b: navCell(factsB, isoB, 'nav') },
        { label: '괴리율', a: navCell(factsA, isoA, 'gap'), b: navCell(factsB, isoB, 'gap') },
        { label: '거래량', a: etfA ? `${etfA.volume.toLocaleString('ko-KR')}주` : '-', b: etfB ? `${etfB.volume.toLocaleString('ko-KR')}주` : '-' },
        { label: '거래대금', a: formatEok(etfA?.tradeAmount), b: formatEok(etfB?.tradeAmount) },
        { label: '시가총액', a: formatEok(capA), b: formatEok(capB) },
        ...(!commonIso ? [{ label: '시세 기준일', a: isoA || '-', b: isoB || '-' }] : []),
        { label: '운용사', a: issuerA || '-', b: issuerB || '-' },
        ...(sectorA || sectorB ? [{ label: '섹터 분류', a: sectorA || '-', b: sectorB || '-' }] : []),
      ]
    : [];

  // /etf 상세로 가는 카드: 그 페이지에 실제로 있는 정보만 적는다
  const etfPageParts = (facts: EtfPageFacts) => [
    facts.price ? '시세' : '종목 정보',
    facts.navGap ? '괴리율' : '',
    facts.holdings ? '구성종목' : '',
    facts.income ? '분배' : '',
  ].filter(Boolean).join('·');

  // FAQ: "A vs B" 검색 의도 직답. FaqSection이 FAQPage JSON-LD를 함께 발행한다.
  const compareFaqs: Array<{ question: string; answer: string }> = [
    {
      question: `${metaA.name} vs ${metaB.name}, 무엇이 다른가요?`,
      answer: `${p.context} 기초지수·총보수·분배 기준일은 각 운용사 상품 페이지와 투자설명서에서 함께 확인하세요.`,
    },
  ];
  if (d.bothPrice && etfA && etfB && typeof etfA.tradeAmount === 'number' && typeof etfB.tradeAmount === 'number' && etfA.tradeAmount !== etfB.tradeAmount) {
    const more = etfA.tradeAmount > etfB.tradeAmount ? metaA.name : metaB.name;
    compareFaqs.push({
      question: `${metaA.name}, ${metaB.name} 가운데 거래가 더 활발한 쪽은?`,
      answer: `${commonIso || '최근'} 종가 기준 거래대금은 ${metaA.name} ${formatEok(etfA.tradeAmount)}, ${metaB.name} ${formatEok(etfB.tradeAmount)}입니다. ${more} 쪽이 더 많았습니다. 거래대금이 크면 매수·매도 호가 간격이 좁은 편이라 원하는 가격에 사고팔기 쉽습니다. 하루치 값이라 날마다 달라질 수 있습니다.`,
    });
  }
  if (d.bothNavGap && factsA.navGap && factsB.navGap) {
    const gA = factsA.navGap;
    const gB = factsB.navGap;
    const sameDay = gA.isoDate === gB.isoDate;
    compareFaqs.push({
      question: `${metaA.name}, ${metaB.name}의 괴리율은 얼마였나요?`,
      answer: sameDay
        ? `${gA.isoDate} 기준 괴리율은 ${metaA.name} ${signedPct(gA.gapPct)}, ${metaB.name} ${signedPct(gB.gapPct)}입니다. 괴리율은 (종가 - NAV) ÷ NAV × 100으로 구하며, 0에 가까울수록 순자산가치에 가까운 가격에 거래됐다는 뜻입니다.`
        : `괴리율은 ${metaA.name} ${signedPct(gA.gapPct)}(${gA.isoDate}), ${metaB.name} ${signedPct(gB.gapPct)}(${gB.isoDate})입니다. 기준일이 달라 직접 견주기보다 각 상품의 흐름을 보는 데 쓰세요.`,
    });
  }
  compareFaqs.push({
    question: `${metaA.name}, ${metaB.name} 가운데 어느 쪽을 골라야 하나요?`,
    answer: `두 상품이 같은 지수를 따른다면 장기 성과 차이는 주로 총보수·기타비용과 추적오차에서 생깁니다. 그다음으로 거래대금(사고팔기 쉬운 정도)과 분배 기준일을 봅니다.${hasHedgeName ? ' 이름에 (H)가 붙은 쪽은 환헤지형이라 환율 변동이 수익률에 덜 반영됩니다.' : ''} 이 페이지는 정보 제공용이며 투자 판단과 책임은 본인에게 있습니다.`,
  });

  return (
    <article className="compare-page animate-fade-in">
      <Breadcrumbs items={[
        { name: '홈', href: '/' },
        { name: '비교', href: '/compare' },
        { name: `${metaA.name} vs ${metaB.name}`, href: `/compare/${p.slug}` },
      ]} />

      <header className="compare-hero">
        <div className="compare-eyebrow">⚖️ ETF 1:1 비교</div>
        <h1 className="compare-title">
          {metaA.name} <span className="compare-vs">vs</span> {metaB.name}
        </h1>
        <p className="compare-tagline">{p.context}</p>
      </header>

      {/* AEO 정답블록: 두 상품 모두 시세가 있을 때만 */}
      {answerSummary && (
        <AnswerBox
          summary={answerSummary}
          keyStats={answerKeyStats}
          asOf={commonIso ? `${commonIso} KRX` : undefined}
          source="KRX 공공데이터"
        />
      )}

      {/* 시세 비교표 */}
      <section className="compare-section">
        <h2 className="compare-h2">{no()}. {dateLabel} 시세 비교</h2>
        {tableRows.length > 0 ? (
          <>
            <div className="compare-table-wrap">
              <table className="compare-table">
                <caption className="compare-table-caption">
                  {metaA.name} · {metaB.name} 시세 비교 ({dateLabel})
                </caption>
                <thead>
                  <tr>
                    <th scope="col">항목</th>
                    <th scope="col">
                      <Link href={`/etf/${slugA}`}>{metaA.name}</Link>
                      <small className="compare-table-code">{metaA.shortcode}</small>
                    </th>
                    <th scope="col">
                      <Link href={`/etf/${slugB}`}>{metaB.name}</Link>
                      <small className="compare-table-code">{metaB.shortcode}</small>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map(r => (
                    <tr key={r.label}>
                      <th scope="row">{r.label}</th>
                      <td>{r.a}</td>
                      <td>{r.b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="compare-note">
              출처: 한국거래소(KRX) 공공데이터{commonIso ? ` · 시세 기준일 ${commonIso}` : ' · 두 상품의 시세 기준일이 달라 기준일 행을 함께 적었습니다'}.
              {' '}괴리율 = (종가 - NAV) ÷ NAV × 100, 같은 날 종가와 NAV로 계산했습니다.
              {navDateDiffers ? ' 날짜가 붙은 NAV·괴리율은 시세 기준일에 NAV 자료가 없어 그 날짜의 종가·NAV로 계산한 값입니다.' : ''}
              {d.anyStale ? ' 시세 기준일 이후의 가격은 반영되지 않았습니다.' : ''}
            </p>
          </>
        ) : (
          <p className="compare-note">
            두 상품 모두 최근 시세 자료에 들어 있지 않습니다. 최신 시세는 각 상품의 종목 정보 페이지와 한국거래소(KRX) 종목정보에서 확인하세요.
          </p>
        )}
      </section>

      {/* 구성종목 비교 (한쪽이라도 있을 때) */}
      {(holdingsA || holdingsB) ? (
        <section className="compare-section">
          <h2 className="compare-h2">{no()}. 구성종목 TOP 5 비교</h2>
          <div className="compare-grid">
            <div className="compare-col">
              <h3 className="compare-col-title-sm">{metaA.name}</h3>
              {holdingsA ? (
                <>
                  <ol className="compare-holdings">
                    {holdingsA.holdings.slice(0, 5).map((h, i) => (
                      <li key={i}>
                        <span className="compare-holding-rank">{i + 1}</span>
                        <span className="compare-holding-name">{h.name}</span>
                        <span className="compare-holding-weight">{h.weight}%</span>
                      </li>
                    ))}
                  </ol>
                  {holdingsA.asOf && <p className="compare-note">기준일 {holdingsA.asOf}</p>}
                </>
              ) : <p className="compare-note">구성종목은 운용사 공시에서 확인하세요.</p>}
            </div>
            <div className="compare-col">
              <h3 className="compare-col-title-sm">{metaB.name}</h3>
              {holdingsB ? (
                <>
                  <ol className="compare-holdings">
                    {holdingsB.holdings.slice(0, 5).map((h, i) => (
                      <li key={i}>
                        <span className="compare-holding-rank">{i + 1}</span>
                        <span className="compare-holding-name">{h.name}</span>
                        <span className="compare-holding-weight">{h.weight}%</span>
                      </li>
                    ))}
                  </ol>
                  {holdingsB.asOf && <p className="compare-note">기준일 {holdingsB.asOf}</p>}
                </>
              ) : <p className="compare-note">구성종목은 운용사 공시에서 확인하세요.</p>}
            </div>
          </div>
        </section>
      ) : null}

      <RecommendBox position="top" />

      {/* 고를 때 확인할 기준: 확인하지 않은 수치는 쓰지 않는다 */}
      <section className="compare-section">
        <h2 className="compare-h2">{no()}. 둘 중 하나를 고를 때 확인할 것</h2>
        <ul className="compare-criteria">
          <li><strong>기초지수</strong>: 두 상품이 같은 지수를 따르는지는 투자설명서의 기초지수 항목에서 확인합니다. 지수가 같다면 장기 성과 차이는 주로 비용과 추적오차에서 생깁니다.</li>
          <li><strong>총보수·기타비용</strong>: 총보수에 기타비용과 매매·중개수수료를 더한 실제 부담 비용은 운용사 상품 페이지와 금융투자협회 전자공시에서 확인하세요.</li>
          <li><strong>거래대금</strong>: 거래대금이 큰 쪽이 매수·매도 호가 간격이 좁은 편이라 원하는 가격에 사고팔기 쉽습니다. 위 표의 값은 하루치라 며칠을 함께 보는 편이 정확합니다.</li>
          <li><strong>괴리율</strong>: 0에 가까울수록 순자산가치에 가까운 가격에 거래됐다는 뜻입니다. 괴리율이 크게 벌어진 날 사면 순자산가치보다 비싸게 살 수 있습니다.</li>
          {hasHedgeName && (
            <li><strong>환헤지</strong>: 이름에 (H)가 붙은 상품은 환헤지형이라 원화 기준 수익률에 환율 변동이 덜 반영됩니다. 환헤지 비용이 들 수 있습니다.</li>
          )}
        </ul>
        <p className="compare-note">
          ※ 표의 수치는 {commonIso ? `${commonIso} ` : ''}한국거래소(KRX) 공공데이터 기준입니다. 매수 전 운용사 상품 페이지에서 최신 내용을 확인하세요.
        </p>
      </section>

      {/* 종목 사전 진입 */}
      <section className="compare-section">
        <h2 className="compare-h2">{no()}. 종목별 상세 페이지</h2>
        <div className="compare-cta-grid">
          <Link href={`/etf/${slugA}`} className="compare-cta-card">
            <strong>{metaA.name}</strong>
            <span>{metaA.shortcode} · {etfPageParts(factsA)} 자세히 →</span>
          </Link>
          <Link href={`/etf/${slugB}`} className="compare-cta-card">
            <strong>{metaB.name}</strong>
            <span>{metaB.shortcode} · {etfPageParts(factsB)} 자세히 →</span>
          </Link>
        </div>
      </section>

      {/* AEO FAQ: "A vs B" 질문형 롱테일 + FAQPage JSON-LD */}
      <FaqSection title="자주 묻는 질문" items={compareFaqs} />

      <RecommendBox position="bottom" />

      <p className="compare-disclaimer">
        본 비교는 한국거래소(KRX) 공공데이터와 운용사 공시를 바탕으로 정리한 정보이며 투자 권유가 아닙니다. 매수·매도 결정의 책임은 투자자 본인에게 있습니다.
      </p>
    </article>
  );
}
