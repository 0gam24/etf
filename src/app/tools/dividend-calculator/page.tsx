import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import FaqSection from '@/components/FaqSection';
import DividendCalculator, { type DividendCalcEtf } from '@/components/DividendCalculator';
import { buildPageMetadata } from '@/lib/site-meta';
import { buildHowToSchema, jsonLd, type FaqItem } from '@/lib/schema';
import { getIncomeRegistry } from '@/lib/income-server';
import {
  formatEtfPriceAsOf,
  getCodeToSlugMap,
  getEtfPriceRecord,
  getLatestEtfData,
  getLatestEtfSnapshotAge,
  ymdToIsoDate,
  type EtfSnapshot,
} from '@/lib/data';
import {
  calcDividend,
  estimatePerShareFromYield,
  formatNumber,
  formatPct,
  formatWon,
  PAYOUTS_PER_YEAR,
  PAYOUT_LABEL,
  type DividendCalcResult,
} from '@/lib/dividend-calc';

/**
 * /tools/dividend-calculator: ETF 분배금 계산기
 *
 *   노리는 검색: "ETF 분배금 계산기", "배당금 계산기", "월배당 ETF 계산기", "ETF 분배금 계산".
 *   경쟁 계산기와 다른 점은 사이트가 가진 실제 데이터(최근 종가 스냅샷, 분배 정보 레지스트리)로
 *   종목을 고르면 가격이 바로 들어가고, 예시표·계산식 예시도 그 데이터로 채운다는 것이다.
 *
 *   주소는 sitemap 등록과 함께 고정이다(제목 'ETF 분배금 계산기'). 바꾸지 않는다.
 *   세율 근거: 소득세법 제129조(14%), 지방세법 제103조의13(소득세의 10%), 소득세법 제14조 제3항 제6호(2천만원),
 *   소득세법 제55조(기본세율 6~45%). 2026-10-06 조문 확인.
 */

const PAGE_URL = '/tools/dividend-calculator';
const PAGE_TITLE = 'ETF 분배금 계산기';
const EXAMPLE_AMOUNT = 10_000_000;

/** 계산기 목록에 넣을 이름 패턴: 분배가 상품의 목적인 ETF */
const DIVIDEND_NAME_RE = /배당|커버드콜|인컴|리츠|월지급|분배/;
/** TR(분배금 재투자형)은 분배금을 지급하지 않으므로 뺀다 */
const NO_PAYOUT_RE = /TR$/;

export const metadata: Metadata = buildPageMetadata({
  title: 'ETF 분배금 계산기: 월배당 세후 분배금과 필요 투자금',
  description:
    '보유 수량이나 투자금과 1주당 분배금을 넣으면 ETF 분배금을 세전·세후(일반계좌 15.4%), 연간·월평균으로 계산합니다. 최근 종가로 수량을 환산하고, 목표 월 분배금에 필요한 투자금도 거꾸로 구하며 계산식을 모두 공개합니다.',
  url: PAGE_URL,
  keywords: [
    'ETF 분배금 계산기',
    '배당금 계산기',
    '월배당 ETF 계산기',
    'ETF 분배금 계산',
    '분배금 세후 계산',
    '월 배당금 필요 투자금',
  ],
});

function lawUrl(law: string, article: string): string {
  return `https://www.law.go.kr/${encodeURI(`법령/${law}/${article}`)}`;
}

interface ExampleRow {
  etf: DividendCalcEtf;
  payouts: number;
  perShare: number;
  perShareRaw: number;
  marketCap: number;
  result: DividendCalcResult;
}

/**
 * 분배 레지스트리(data/income/dividend-registry.json)의 연 분배율로 예시표·예시 분배금을 채울지.
 *   2026-10-06 끔: 레지스트리 분배율은 2026-04-22 수기 정리값이고 운용사 분배 공시로 다시 확인하지
 *   않았다(예: 한 종목은 보도상 월 2% 안팎인데 연 13.6%로 적혀 있다). 확인 안 된 수치를 쓰지 않는다는
 *   YMYL 규칙에 따라, 분배 이력을 공시로 확보하기 전까지는 종가만 채우고 1주당 분배금은 사용자가 넣는다.
 */
const USE_REGISTRY_YIELD_EXAMPLES = false;

/** 빌드 시점에 계산기·예시표에 쓸 데이터를 모은다. 데이터가 없어도 계산기는 직접 입력으로 동작한다. */
function loadCalculatorData() {
  const slugMap = getCodeToSlugMap();
  const registry = getIncomeRegistry();
  const registryAsOf = USE_REGISTRY_YIELD_EXAMPLES ? ymdToIsoDate(registry?.asOf) || '' : '';

  const examples: ExampleRow[] = [];
  const exampleCodes = new Set<string>();
  for (const e of USE_REGISTRY_YIELD_EXAMPLES ? registry?.etfs || [] : []) {
    const code = (e.code || '').toUpperCase();
    const rec = code ? getEtfPriceRecord(code) : null;
    const payouts = PAYOUTS_PER_YEAR[e.frequency];
    if (!rec || !payouts || !(e.yield > 0)) continue;
    const price = rec.etf.price;
    const etf: DividendCalcEtf = {
      code,
      name: rec.etf.name || e.name,
      price,
      priceDate: ymdToIsoDate(rec.baseDate) || '',
      ...(slugMap[code] ? { slug: slugMap[code] } : {}),
      example: { yieldPct: e.yield, payoutsPerYear: payouts },
    };
    const perShare = estimatePerShareFromYield(price, e.yield, payouts);
    examples.push({
      etf,
      payouts,
      perShare,
      perShareRaw: (price * e.yield) / 100 / payouts,
      marketCap: rec.etf.marketCap || 0,
      result: calcDividend({ mode: 'amount', amount: EXAMPLE_AMOUNT, price, perShare, payoutsPerYear: payouts }),
    });
    exampleCodes.add(code);
  }
  examples.sort((a, b) => a.etf.name.localeCompare(b.etf.name, 'ko'));

  const snapshot = getLatestEtfData() as EtfSnapshot | null;
  const snapshotDate = ymdToIsoDate(snapshot?.baseDate) || '';
  const others: DividendCalcEtf[] = (snapshot?.etfList || [])
    .filter(r => r && typeof r.code === 'string' && Number.isFinite(r.price) && r.price > 0)
    .filter(r => DIVIDEND_NAME_RE.test(r.name || '') && !NO_PAYOUT_RE.test(r.name || ''))
    .filter(r => !exampleCodes.has(r.code.toUpperCase()))
    .map(r => {
      const code = r.code.toUpperCase();
      return {
        code,
        name: r.name,
        price: r.price,
        priceDate: ymdToIsoDate(r.date) || snapshotDate,
        ...(slugMap[code] ? { slug: slugMap[code] } : {}),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'ko'));

  // 계산식 풀이 예시: 예시표 종목 중 시가총액이 가장 큰 종목 (고르는 규칙을 화면에도 밝힌다)
  const worked = [...examples].sort((a, b) => b.marketCap - a.marketCap)[0] || null;

  const age = getLatestEtfSnapshotAge();
  return {
    etfs: [...examples.map(x => x.etf), ...others],
    examples,
    worked,
    registryAsOf,
    priceAsOfLabel: age ? formatEtfPriceAsOf(age) : '',
  };
}

const HOW_TO_STEPS = [
  { name: 'ETF 고르기', text: '목록에서 ETF를 고르면 최근 종가가 1주 가격에 들어갑니다. 목록에 없는 종목이거나 매수가로 계산하려면 직접 입력을 두고 1주 가격을 넣습니다.' },
  { name: '1주당 분배금 넣기', text: '운용사 홈페이지의 분배금 공시에서 최근 1회 1주당 분배금을 확인해 넣습니다. 과거 분배금은 앞으로의 분배를 보장하지 않으니 최근 몇 회분을 함께 보는 편이 좋습니다.' },
  { name: '연 분배 횟수 고르기', text: '월 분배는 12회, 분기 분배는 4회, 반기 분배는 2회를 고릅니다.' },
  { name: '투자금이나 보유 수량 넣기', text: '분배금 계산 탭에서 투자금 또는 보유 수량을 넣으면 1회·연간·월평균 분배금이 세전과 세후로 나옵니다.' },
  { name: '목표 월 분배금 역산', text: '목표 월 분배금 역산 탭에서 한 달에 받고 싶은 금액을 넣으면 필요한 수량과 투자금이 나옵니다.' },
];

const FAQ: FaqItem[] = [
  {
    question: 'ETF 분배금은 어떻게 계산하나요?',
    answer: '보유 수량에 1회 1주당 분배금을 곱하면 한 번에 받는 세전 분배금이 나옵니다. 여기에 1년 분배 횟수를 곱하면 연간 분배금이고, 일반 증권계좌라면 15.4%를 뗀 금액이 들어옵니다. 1,000주를 갖고 있고 1주당 50원씩 매달 나온다면 1회 50,000원, 세후 42,300원이고 1년이면 세후 507,600원입니다.',
  },
  {
    question: '분배율(%)만 알 때 1주당 분배금은 어떻게 구하나요?',
    answer: '1주 가격 × 연 분배율 ÷ 연 분배 횟수로 어림합니다. 가격 10,000원, 연 분배율 6%, 월 분배라면 10,000 × 6% ÷ 12 = 50원입니다. 분배율은 어느 가격과 어느 기간을 기준으로 냈는지에 따라 숫자가 달라지므로, 운용사가 공시한 실제 1주당 분배금을 넣는 쪽이 정확합니다.',
  },
  {
    question: '월 100만원을 분배금으로 받으려면 얼마가 필요한가요?',
    answer: '1주 10,000원에 1주당 매달 50원이 나오는 ETF(가격 대비 연 6%)로 일반계좌에서 세후 월 100만원을 받으려면 23,641주, 약 2억 3,641만원이 필요합니다. 이때 세전 연 분배금은 약 1,418만원이어서, 예금 이자 등 다른 이자·배당이 약 582만원을 넘으면 금융소득 종합과세 기준인 연 2,000만원을 넘습니다. 분배율이 낮거나 분배금이 줄면 필요한 금액은 더 커집니다.',
  },
  {
    question: '분배금에서 세금은 얼마나 떼나요?',
    answer: '일반 증권계좌는 소득세 14%와 지방소득세 1.4%를 합친 15.4%를 원천징수한 뒤 입금합니다. 국내 상장 ETF는 운용사가 공시하는 1주당 과세표준으로 세금을 떼는 경우가 있어, 해외 지수를 따르는 ETF는 세금 기준 금액이 분배금보다 작아 세금이 적게 나오기도 합니다. ISA와 연금저축·IRP는 분배금을 받을 때 15.4%를 떼지 않고 계좌별 규칙에 따라 나중에 과세합니다.',
  },
  {
    question: '분배금을 받으려면 언제까지 사야 하나요?',
    answer: '분배금 지급 기준일에 계좌에 들고 있어야 받습니다. 국내 상장 ETF는 산 날로부터 2영업일 뒤에 결제되므로 기준일보다 2영업일 앞선 날까지 사야 합니다. 월 분배 ETF는 매월 마지막 영업일을 기준일로 쓰는 상품이 많지만 15일 등 다른 날을 쓰는 상품도 있어 운용사 공지를 확인해야 합니다.',
  },
  {
    question: '분배율이 높은 ETF일수록 유리한가요?',
    answer: '분배율만으로는 판단하기 어렵습니다. 분배금은 펀드 자산에서 빠져나가는 돈이라 분배락일에 가격이 대체로 그만큼 내려가고, 커버드콜 ETF처럼 분배율이 높은 상품은 기초자산이 오를 때 상승분 일부를 포기하는 구조입니다. 분배금과 가격 변화를 합친 총수익, 그리고 분배금이 얼마나 꾸준했는지를 함께 봐야 합니다.',
  },
];

const RELATED_GUIDES = [
  { slug: 'etf-dividend', label: 'ETF 분배금과 분배락일 기본' },
  { slug: 'etf-distribution-date', label: '분배금을 받으려면 언제 사야 하나' },
  { slug: 'etf-distribution-tax-base-zero', label: '해외 지수 ETF 분배금 세금이 0원인 이유 (과세표준)' },
  { slug: 'isa-dividend-tax-benefit', label: 'ISA 배당소득 비과세 한도' },
  { slug: 'financial-income-tax', label: '금융소득 2,000만원을 넘으면 달라지는 세금' },
  { slug: 'covered-call-nav-erosion', label: '커버드콜 ETF 가격이 내려가는 이유' },
  { slug: 'dividend-reinvestment', label: '분배금 재투자와 복리' },
  { slug: 'monthly-dividend', label: '월배당 ETF 기본 가이드' },
];

const RELATED_COMPARE = [
  { slug: 'tiger-us-dividend-monthly-vs-kodex-us-dividend-djones', label: 'TIGER·KODEX 미국배당다우존스: 분배 기준일 차이' },
  { slug: 'sol-us-dividend-djones-vs-tiger-us-dividend-djones', label: 'SOL·TIGER 미국배당다우존스 비교' },
  { slug: 'kodex-us-dividend-djones-vs-ace-us-dividend-djones', label: 'KODEX·ACE 미국배당다우존스 비교' },
];

export default function DividendCalculatorPage() {
  const { etfs, examples, worked, registryAsOf, priceAsOfLabel } = loadCalculatorData();

  const howToSchema = buildHowToSchema({
    name: `${PAGE_TITLE} 사용법`,
    description: '투자금이나 보유 수량, 1주당 분배금, 연 분배 횟수로 ETF 분배금을 세전·세후로 계산하고 목표 월 분배금에 필요한 투자금을 구하는 방법',
    url: PAGE_URL,
    steps: HOW_TO_STEPS,
  });

  return (
    <article style={{ maxWidth: '60rem', margin: '0 auto', padding: 'var(--space-8) var(--space-6)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(howToSchema) }} />
      <Breadcrumbs items={[
        { name: '홈', href: '/' },
        { name: '도구', href: '/tools/portfolio' },
        { name: PAGE_TITLE, href: PAGE_URL },
      ]} />

      <header style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--accent-gold)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          TOOL · DIVIDEND
        </div>
        <h1 style={{ fontSize: 'var(--fs-h1)', marginBottom: 'var(--space-3)' }}>
          {PAGE_TITLE}
        </h1>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          보유 수량이나 투자금, 1주당 분배금을 넣으면 1회·연간·월평균 분배금을 세전과 세후로 나눠 보여 드립니다.
          한 달에 받고 싶은 금액을 넣으면 필요한 수량과 투자금을 거꾸로 구합니다.
          {etfs.length > 0 && ` 배당·커버드콜·리츠 ETF ${formatWon(etfs.length)}종은 목록에서 고르면 최근 종가가 바로 들어갑니다.`}
        </p>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', lineHeight: 1.7, marginTop: 'var(--space-2)' }}>
          {priceAsOfLabel && `종가: KRX 공공데이터 ${priceAsOfLabel}. `}
          {registryAsOf && `분배 예시값: 사이트 분배 정보 ${registryAsOf} 정리분. `}
          입력한 숫자는 이 브라우저 안에서 계산에만 쓰고 저장하거나 보내지 않습니다.
        </p>
      </header>

      <section aria-labelledby="calc-heading" style={{ marginBottom: 'var(--space-8)' }}>
        <h2 id="calc-heading" style={h2Style}>분배금 계산하기</h2>
        <DividendCalculator etfs={etfs} exampleAsOf={registryAsOf} />
      </section>

      {examples.length > 0 && (
        <section style={sectionStyle}>
          <h2 style={h2Style}>1,000만원을 넣었을 때 계산 예시</h2>
          <p style={pStyle}>
            사이트 분배 정보에 연 분배율 추정치가 있는 {examples.length}종을 같은 1,000만원으로 계산했습니다.
            1주당 분배금은 종가 × 연 분배율 추정치 ÷ 연 분배 횟수로 만든 예시값이라 실제 지급액과 다릅니다.
            종목을 고르는 순위가 아니라 계산기가 어떻게 움직이는지 보여 드리는 표이며, 이름순으로 나열했습니다.
          </p>
          <div style={{ overflowX: 'auto', marginTop: 'var(--space-3)' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>종목</th>
                  <th style={thNumStyle}>종가 (기준일)</th>
                  <th style={thStyle}>분배 주기</th>
                  <th style={thNumStyle}>연 분배율 추정</th>
                  <th style={thNumStyle}>1주당 예시 분배금</th>
                  <th style={thNumStyle}>살 수 있는 수량</th>
                  <th style={thNumStyle}>세후 월평균</th>
                </tr>
              </thead>
              <tbody>
                {examples.map(x => (
                  <tr key={x.etf.code}>
                    <td style={tdStyle}>
                      {x.etf.slug ? (
                        <Link href={`/etf/${x.etf.slug}`} prefetch={false} style={linkStyle}>{x.etf.name}</Link>
                      ) : x.etf.name}
                      <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-dim)' }}>{x.etf.code}</span>
                    </td>
                    <td style={tdNumStyle}>
                      {formatWon(x.etf.price)}원
                      <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-dim)' }}>{x.etf.priceDate}</span>
                    </td>
                    <td style={tdStyle}>{PAYOUT_LABEL[x.payouts] || `연 ${x.payouts}회`}</td>
                    <td style={tdNumStyle}>{formatPct(x.etf.example?.yieldPct ?? 0, 1)}%</td>
                    <td style={tdNumStyle}>{formatWon(x.perShare)}원</td>
                    <td style={tdNumStyle}>{formatWon(x.result.shares)}주</td>
                    <td style={tdNumStyle}>{formatWon(x.result.monthlyNetAvg)}원</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ ...pStyle, fontSize: '0.88rem', marginTop: 'var(--space-3)' }}>
            연 분배율 추정치는 {registryAsOf || '정리 시점'} 기준으로 최근 12개월 분배 실적을 바탕으로 정리한 값입니다. 그 뒤 분배금이 바뀌었다면 실제와 다르고,
            과거 분배 실적이 앞으로의 분배를 보장하지도 않습니다. 세후 월평균은 일반계좌 15.4% 원천징수만 반영했습니다.
            종목명을 누르면 종목 사전에서 구성종목·괴리율·분배 정보를 볼 수 있습니다.
          </p>
        </section>
      )}

      <section style={sectionStyle}>
        <h2 style={h2Style}>분배금 계산기 사용법</h2>
        <ol style={olStyle}>
          {HOW_TO_STEPS.map(s => (
            <li key={s.name} style={{ marginBottom: '0.4rem' }}>
              <strong style={{ color: 'var(--text-primary)' }}>{s.name}</strong>: {s.text}
            </li>
          ))}
        </ol>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>분배금 계산식 공개</h2>
        <ul style={olStyle}>
          <li>매수 수량 = 투자금 ÷ 1주 가격 (1주 미만은 버립니다)</li>
          <li>1회 세전 분배금 = 수량 × 1회 1주당 분배금</li>
          <li>1회 원천징수 = 1회 세전 분배금 × 15.4% (소득세 14% + 지방소득세 1.4%, 원 단위 반올림)</li>
          <li>연간 분배금 = 1회 금액 × 연 분배 횟수, 월평균 = 연간 ÷ 12</li>
          <li>필요 수량(세후 목표) = 목표 월 분배금 × 12 ÷ (1주당 분배금 × 연 분배 횟수 × 84.6%), 1주 미만은 올립니다</li>
          <li>필요 투자금 = 필요 수량 × 1주 가격</li>
          {worked && <li>예시 분배금 = 종가 × 연 분배율 추정치 ÷ 연 분배 횟수 (원 단위 반올림)</li>}
        </ul>
        {worked && (
          <p style={{ ...pStyle, marginTop: 'var(--space-3)' }}>
            예시표에서 시가총액이 가장 큰 {worked.etf.name}({worked.etf.code})로 풀어 보면, {worked.etf.priceDate} 종가 {formatWon(worked.etf.price)}원에
            연 분배율 추정치 {formatPct(worked.etf.example?.yieldPct ?? 0, 1)}%를 적용한 1주당 예시 분배금은
            {' '}{formatWon(worked.etf.price)} × {formatPct(worked.etf.example?.yieldPct ?? 0, 1)}% ÷ {worked.payouts} = {formatNumber(worked.perShareRaw, 2)}, 반올림해 {formatWon(worked.perShare)}원입니다.
            1,000만원이면 {formatWon(worked.result.shares)}주를 사고 {formatWon(worked.result.leftover)}원이 남습니다.
            1회 세전 {formatWon(worked.result.perPayoutGross)}원에서 {formatWon(worked.result.perPayoutTax)}원을 떼면 세후 {formatWon(worked.result.perPayoutNet)}원,
            연 {worked.payouts}회면 세후 {formatWon(worked.result.annualNet)}원이고 월평균은 {formatWon(worked.result.monthlyNetAvg)}원입니다.
          </p>
        )}
        <p style={{ ...pStyle, fontSize: '0.88rem', marginTop: 'var(--space-2)' }}>
          실제 원천징수는 소득세와 지방소득세를 따로 계산하고 끝전을 처리하므로 이 계산과 몇 원 차이가 날 수 있습니다.
          매매 수수료, 환율 변화, 분배금 재투자 효과는 넣지 않았습니다.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>계좌마다 분배금 세금이 다릅니다</h2>
        <p style={pStyle}>
          계산기의 세후 금액은 일반 증권계좌에서 분배금 전액에 15.4%가 원천징수된다고 가정한 값입니다. 계좌와 소득 규모에 따라 실제 세금은 이렇게 달라집니다.
        </p>
        <ul style={olStyle}>
          <li>
            <strong style={strongStyle}>일반계좌</strong>: 분배금이 들어올 때 소득세 14%와 지방소득세 1.4%를 떼고 입금됩니다.
            국내 상장 ETF는 분배금 전액이 아니라 운용사가 공시하는 1주당 과세표준으로 세금을 떼는 경우가 있어 실제 세액이 계산보다 적을 수 있습니다.
            {' '}<Link href="/guide/etf-distribution-tax-base-zero" prefetch={false} style={linkStyle}>과세표준으로 세금이 정해지는 방식</Link>
          </li>
          <li>
            <strong style={strongStyle}>ISA</strong>: 분배금을 받을 때 15.4%를 떼지 않습니다. 계좌 안의 이익과 손실을 합쳐 일정 한도까지는 비과세하고, 넘는 부분은 일반계좌보다 낮은 세율로 분리과세합니다.
            {' '}<Link href="/guide/isa-dividend-tax-benefit" prefetch={false} style={linkStyle}>ISA 배당소득 비과세 한도</Link>
          </li>
          <li>
            <strong style={strongStyle}>연금저축·IRP</strong>: 분배금에 바로 세금을 떼지 않아 계좌 안에서 다시 굴릴 수 있고, 나중에 연금으로 꺼낼 때 연금소득세를 냅니다.
            {' '}<Link href="/guide/pension-withdrawal-tax" prefetch={false} style={linkStyle}>연금 수령 때 내는 세금</Link>
          </li>
          <li>
            <strong style={strongStyle}>연 2,000만원이 넘을 때</strong>: 한 사람의 이자·배당소득이 한 해 2,000만원을 넘으면 넘는 부분은 근로·사업소득 등과 합쳐
            기본세율(6~45%)로 다시 계산될 수 있고, 다음 해 5월 종합소득세 신고 대상이 됩니다. 건강보험 피부양자 자격에도 영향을 줄 수 있습니다.
            {' '}<Link href="/guide/financial-income-tax" prefetch={false} style={linkStyle}>금융소득 종합과세</Link>
            {' · '}<Link href="/guide/financial-income-health-insurance" prefetch={false} style={linkStyle}>건강보험 피부양자와 금융소득</Link>
          </li>
        </ul>
        <p style={{ ...pStyle, fontSize: '0.85rem', marginTop: 'var(--space-3)' }}>
          근거 법령(국가법령정보센터):{' '}
          <a href={lawUrl('소득세법', '제129조')} target="_blank" rel="noopener noreferrer" style={linkStyle}>소득세법 제129조 원천징수세율</a>
          {' · '}
          <a href={lawUrl('지방세법', '제103조의13')} target="_blank" rel="noopener noreferrer" style={linkStyle}>지방세법 제103조의13 특별징수</a>
          {' · '}
          <a href={lawUrl('소득세법', '제14조')} target="_blank" rel="noopener noreferrer" style={linkStyle}>소득세법 제14조 분리과세 기준</a>
          {' · '}
          <a href={lawUrl('소득세법', '제55조')} target="_blank" rel="noopener noreferrer" style={linkStyle}>소득세법 제55조 기본세율</a>
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>분배금 숫자를 볼 때 알아둘 점</h2>
        <ul style={olStyle}>
          <li>
            과거 분배 실적은 앞으로의 분배를 보장하지 않습니다. 분배금은 기초자산의 배당·이자, 옵션 프리미엄 같은 운용 성과와 운용사의 분배 정책에 따라 회차마다 달라지고, 줄거나 멈출 수도 있습니다.
          </li>
          <li>
            분배금은 펀드 자산에서 나가므로 분배락일에는 대체로 그만큼 가격이 내려갑니다. 분배금만이 아니라 가격 변화까지 합친 총수익으로 보셔야 합니다.
          </li>
          <li>
            커버드콜 ETF는 기초자산이 오를 때 상승분 일부를 포기하는 대신 옵션 프리미엄을 분배합니다. 분배율이 높아도 기초자산이 내리면 순자산가치가 줄어들 수 있습니다.
            {' '}<Link href="/guide/covered-call-nav-erosion" prefetch={false} style={linkStyle}>커버드콜 ETF 가격이 내려가는 이유</Link>
          </li>
          <li>
            분배금을 받으려면 지급 기준일에 보유하고 있어야 하고, 국내 상장 ETF는 산 날로부터 2영업일 뒤 결제되므로 기준일 2영업일 전까지 사야 합니다.
            {' '}<Link href="/guide/etf-distribution-date" prefetch={false} style={linkStyle}>분배 기준일과 분배락일</Link>
          </li>
        </ul>
      </section>

      <FaqSection title="ETF 분배금 계산 자주 묻는 질문" items={FAQ} />

      <section style={sectionStyle}>
        <h2 style={h2Style}>함께 보면 좋은 페이지</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
          <div>
            <h3 style={h3Style}>ETF 데이터</h3>
            <ul style={linkListStyle}>
              <li><Link href="/etf" prefetch={false} style={linkStyle}>ETF 종목 사전: 구성종목·괴리율·분배 정보</Link></li>
              <li><Link href="/income" prefetch={false} style={linkStyle}>월배당·커버드콜 ETF 분배 캘린더</Link></li>
              <li><Link href="/tools/tax-compare" prefetch={false} style={linkStyle}>계좌별 세후 수익률 비교 도구</Link></li>
            </ul>
          </div>
          <div>
            <h3 style={h3Style}>같은 지수 ETF 비교</h3>
            <ul style={linkListStyle}>
              {RELATED_COMPARE.map(c => (
                <li key={c.slug}><Link href={`/compare/${c.slug}`} prefetch={false} style={linkStyle}>{c.label}</Link></li>
              ))}
              <li><Link href="/compare" prefetch={false} style={linkStyle}>같은 지수 ETF 비교 전체 보기</Link></li>
            </ul>
          </div>
          <div>
            <h3 style={h3Style}>분배금·세금 가이드</h3>
            <ul style={linkListStyle}>
              {RELATED_GUIDES.map(g => (
                <li key={g.slug}><Link href={`/guide/${g.slug}`} prefetch={false} style={linkStyle}>{g.label}</Link></li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section style={{ marginTop: 'var(--space-6)', padding: 'var(--space-5)', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius)' }}>
        <h2 style={{ fontSize: 'var(--fs-h3)', marginBottom: 'var(--space-2)', color: 'var(--red-400)' }}>계산 결과를 볼 때 참고할 점</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7 }}>
          이 계산기는 정보 제공용이며 특정 ETF의 매수나 매도를 권하지 않습니다. 결과는 입력한 분배금이 앞으로도 같다는 가정에서 나온 숫자이고,
          실제 분배금과 세금은 운용 성과, 분배 정책, 계좌 종류, 다른 소득에 따라 달라집니다. 투자 판단과 그 결과에 대한 책임은 투자자 본인에게 있습니다.
        </p>
      </section>
    </article>
  );
}

const sectionStyle: React.CSSProperties = {
  marginTop: 'var(--space-6)',
  padding: 'var(--space-5)',
  background: 'var(--bg-card)',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius)',
};

const h2Style: React.CSSProperties = {
  fontSize: 'var(--fs-h3)',
  marginBottom: 'var(--space-3)',
};

const h3Style: React.CSSProperties = {
  fontSize: '1rem',
  marginBottom: 'var(--space-2)',
  color: 'var(--text-primary)',
};

const pStyle: React.CSSProperties = {
  color: 'var(--text-secondary)',
  lineHeight: 1.75,
  margin: 0,
};

const olStyle: React.CSSProperties = {
  color: 'var(--text-secondary)',
  lineHeight: 1.8,
  paddingLeft: '1.25rem',
  margin: 0,
};

const strongStyle: React.CSSProperties = {
  color: 'var(--text-primary)',
};

const linkStyle: React.CSSProperties = {
  color: 'var(--accent-gold)',
  textDecoration: 'underline',
  textUnderlineOffset: '3px',
};

const linkListStyle: React.CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
  display: 'grid',
  gap: '0.5rem',
  lineHeight: 1.5,
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '0.88rem',
  minWidth: '640px',
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '0.55rem 0.6rem',
  borderBottom: '1px solid var(--border-color)',
  color: 'var(--text-dim)',
  fontWeight: 600,
  whiteSpace: 'nowrap',
};

const thNumStyle: React.CSSProperties = { ...thStyle, textAlign: 'right' };

const tdStyle: React.CSSProperties = {
  padding: '0.55rem 0.6rem',
  borderBottom: '1px solid var(--border-color)',
  color: 'var(--text-primary)',
  verticalAlign: 'top',
};

const tdNumStyle: React.CSSProperties = {
  ...tdStyle,
  textAlign: 'right',
  fontVariantNumeric: 'tabular-nums',
  whiteSpace: 'nowrap',
};
