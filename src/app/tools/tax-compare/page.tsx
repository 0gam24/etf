import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import EtfTaxSimulator from '@/components/EtfTaxSimulator';
import FaqSection from '@/components/FaqSection';
import AdBanner from '@/components/AdBanner';
import { AD_SLOTS } from '@/lib/ads';
import { buildPageMetadata } from '@/lib/site-meta';
import { jsonLd, buildSoftwareAppSchema } from '@/lib/schema';
import { TAX_RULES, TAX_SOURCES, formatWon } from '@/lib/account-tax-rules';
import { simulateAccountTax } from '@/lib/tax-sim';
import { GUIDE_CATEGORIES, categoryHref } from '@/lib/guide-categories';

// 2026-10-14 개편: 계산기만 있던 페이지에 계산 방식·계좌별 세율표·계산 예시·FAQ 를 서버 렌더 본문으로 더했다.
//   예전 요약에 있던 "ISA 5년 의무"(현행 3년), "테마 ETF 15.4%"(국내 주식 테마는 매매차익 비과세) 같은 오류도 함께 고쳤다.
//   세율·한도는 src/lib/account-tax-rules.ts (2026-10-14 law.go.kr 현행 조문 대조), 계산식은 src/lib/tax-sim.ts.
export const metadata: Metadata = buildPageMetadata({
  title: '계좌별 세후 수익률 계산기: ISA·연금저축·IRP·일반 (2026년 세율)',
  description:
    '같은 ETF를 일반 계좌·중개형 ISA·연금저축·IRP 중 어디서 굴릴 때 세금이 가장 적은지 계산합니다. 분배금 15.4%, ISA 200만원 비과세와 9.9%, 연금소득세 3.3~5.5%를 반영한 계산식과 예시를 함께 봅니다.',
  url: '/tools/tax-compare',
  keywords: ['계좌별 세후 수익률 계산기', 'ISA 연금저축 비교', 'ETF 세금 계산기', 'ISA 비과세 계산', '연금소득세 계산'],
});

const pct = (r: number) => `${(r * 100).toFixed(1).replace(/\.0$/, '')}%`;

const EXAMPLES = [
  {
    title: '국내주식형 ETF 1,000만원, 연 분배율 2%, 3년',
    input: { principal: 10_000_000, yieldPct: 2, growthPct: 0, years: 3, gainTax: 'exempt' as const },
    note: '일반 계좌에서도 매매차익이 비과세라 ISA가 아끼는 세금은 분배금 몫입니다.',
  },
  {
    title: '미국 지수 ETF 1,000만원, 분배율 1.5%·연 7% 상승 가정, 5년',
    input: { principal: 10_000_000, yieldPct: 1.5, growthPct: 7, years: 5, gainTax: 'taxable' as const },
    note: '매매차익도 배당소득으로 과세되는 상품이라 ISA·연금계좌와의 세금 차이가 커집니다.',
  },
  {
    title: '고분배 커버드콜 ETF 3,000만원, 연 분배율 8%, 3년',
    input: { principal: 30_000_000, yieldPct: 8, growthPct: 0, years: 3, gainTax: 'base-excludes-domestic' as const },
    note: '분배금이 커서 ISA 비과세 한도 200만원을 넘고, 넘는 부분에 9.9%가 붙습니다.',
  },
];

const FAQ = [
  {
    question: 'ISA와 연금저축 중 어디에 먼저 넣는 게 좋나요?',
    answer: `돈을 쓸 시점에 따라 갈립니다. 중개형 ISA는 의무 가입 ${TAX_RULES.isa.minYears}년이 지나면 해지해 쓸 수 있고 순이익 ${formatWon(TAX_RULES.isa.taxFreeGeneral)}(서민형 ${formatWon(TAX_RULES.isa.taxFreeLowIncome)})까지 비과세, 넘는 부분은 ${pct(TAX_RULES.isa.excessRate)}입니다. 연금저축은 납입액이 세액공제 대상(연 600만원, IRP와 합쳐 900만원)이지만 55세 이후 연금으로 받아야 ${pct(TAX_RULES.pension.rate80plus)}~${pct(TAX_RULES.pension.rateUnder70)}의 낮은 세율이 적용되고, 중간에 연금 외로 꺼내면 ${pct(TAX_RULES.pension.otherWithdrawalRate)}가 붙습니다. ISA 만기 자금을 60일 안에 연금계좌로 옮기면 옮긴 금액의 10%(최대 300만원)를 세액공제 대상에 더할 수 있습니다.`,
  },
  {
    question: '국내주식형 ETF도 ISA에 담는 의미가 있나요?',
    answer: `일반 계좌에서도 국내주식형 ETF의 매매차익은 비과세라 ISA가 아끼는 세금은 주로 분배금입니다(일반 계좌 ${pct(TAX_RULES.dividendTaxRate)}, ISA는 한도까지 0원). 매매차익까지 배당소득으로 과세되는 해외 주식·채권형 ETF는 ISA의 손익 통산과 비과세 한도 효과가 더 큽니다. ISA 안에서 국내주식형 ETF를 팔아 생긴 손실은 다른 상품의 이익과 통산되지 않습니다.`,
  },
  {
    question: '연금계좌 안에서 ETF를 팔면 바로 세금이 나오나요?',
    answer: `아닙니다. 연금저축·IRP 안에서 사고팔 때는 세금을 떼지 않고, 꺼낼 때 연금소득세(연금으로 받을 때 ${pct(TAX_RULES.pension.rate80plus)}~${pct(TAX_RULES.pension.rateUnder70)}) 또는 기타소득세 ${pct(TAX_RULES.pension.otherWithdrawalRate)}(연금 외 수령)가 붙습니다. 일반 계좌에서 비과세인 국내주식형 ETF의 매매차익도 연금계좌에서는 운용수익으로 잡혀 꺼낼 때 과세된다는 점이 다릅니다.`,
  },
  {
    question: '금융소득 종합과세는 언제 신경 써야 하나요?',
    answer: `한 해 이자와 배당(ETF 분배금, 해외·기타 ETF의 매매차익 포함)이 ${formatWon(TAX_RULES.financialIncomeThreshold)}을 넘으면 넘는 부분이 근로·사업소득과 합쳐 누진세율로 과세됩니다. 중개형 ISA의 비과세·분리과세 소득과 연금계좌 안에서 생긴 소득은 이 합산에 들어가지 않습니다. 연금은 받을 때 따로 과세되고, 사적연금을 연 ${formatWon(TAX_RULES.pension.separateTaxThreshold)} 넘게 받으면 종합과세와 ${pct(TAX_RULES.pension.otherWithdrawalRate)} 분리과세 가운데 고를 수 있습니다.`,
  },
  {
    question: '레버리지·인버스 ETF는 어느 계좌에서 살 수 있나요?',
    answer: '일반 계좌에서는 살 수 있고(증권사가 요구하는 사전 교육·기본예탁금 조건이 있습니다), 연금저축과 IRP·DC 퇴직연금에서는 살 수 없습니다. 퇴직연금은 퇴직연금감독규정, 연금저축은 금융위원회 방침에 따른 제한입니다. 중개형 ISA는 법령상 금지 조항이 없어 담을 수 있다고 안내하는 운용사가 있지만, 증권사마다 조건이 다를 수 있으니 거래하는 곳에서 확인하는 편이 안전합니다.',
  },
];

export default function TaxComparePage() {
  const R = TAX_RULES;
  const examples = EXAMPLES.map(e => ({ ...e, r: simulateAccountTax(e.input) }));
  const appSchema = buildSoftwareAppSchema({
    name: '계좌별 세후 수익률 계산기',
    url: '/tools/tax-compare',
    description: '같은 ETF를 일반 계좌·중개형 ISA·연금저축·IRP에서 굴릴 때 세금과 세후 수익을 비교하는 계산기',
  });
  const relatedHubs = GUIDE_CATEGORIES.filter(c => ['isa', 'pension', 'tax', 'overseas'].includes(c.key));

  return (
    <article style={{ maxWidth: '60rem', margin: '0 auto', padding: 'var(--space-8) var(--space-6)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(appSchema) }} />
      <Breadcrumbs items={[
        { name: '홈', href: '/' },
        { name: '도구', href: '/tools/portfolio' },
        { name: '계좌별 세후 비교', href: '/tools/tax-compare' },
      ]} />

      <header style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--accent-gold)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          TOOL · TAX COMPARE
        </div>
        <h1 style={{ fontSize: 'var(--fs-h1)', marginBottom: 'var(--space-3)' }}>
          계좌별 세후 수익률 계산기 (ISA·연금저축·IRP·일반 계좌)
        </h1>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          같은 ETF를 같은 금액만큼 담아도 어느 계좌에서 굴리느냐에 따라 세금이 달라집니다. 투자금, 연 분배율, 가격 변동, 보유 기간을 넣으면
          일반 계좌·중개형 ISA·연금저축·IRP의 세금과 세후 수익을 나란히 보여 줍니다. 세율과 한도는 {R.asOf} 기준 법령으로 확인한 값입니다.
        </p>
      </header>

      <EtfTaxSimulator name="ETF" gainTax="exempt" pensionAllowed defaultYieldPct={3} yieldFromRecord={false} kindSelectable />

      <section style={{ marginTop: 'var(--space-8)' }}>
        <h2 style={{ fontSize: 'var(--fs-h2)', marginBottom: 'var(--space-3)' }}>계산 방식</h2>
        <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          <li>받는 분배금 = 투자금 × 연 분배율 × 보유 기간 (분배금은 재투자하지 않고 받는다고 가정)</li>
          <li>팔 때 가격 차익 = 투자금 × ((1 + 연 가격 변동률)<sup>보유 기간</sup> − 1)</li>
          <li>일반 계좌 세금 = 분배금 × {pct(R.dividendTaxRate)} + (해외·채권·원자재 등이면) 가격 차익 × {pct(R.dividendTaxRate)}</li>
          <li>중개형 ISA 세금 = (과세 대상 순이익 − 비과세 한도 {formatWon(R.isa.taxFreeGeneral)}, 서민형 {formatWon(R.isa.taxFreeLowIncome)}) × {pct(R.isa.excessRate)}</li>
          <li>연금저축·IRP 세금 = 운용수익(분배금 + 가격 차익) × 연금소득세 {pct(R.pension.rateUnder70)}(70세 미만)·{pct(R.pension.rate70to79)}(70~79세)·{pct(R.pension.rate80plus)}(80세 이상)</li>
        </ul>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.88rem', lineHeight: 1.7 }}>
          금융소득 종합과세, 건강보험료, 연금저축·IRP 세액공제, 증권사 수수료는 넣지 않은 단순 계산입니다. 실제 세액은 거래하는 증권사가 계산합니다.
        </p>
      </section>

      {/* 광고는 계산기 입력·버튼 바로 아래를 피해 계산 방식 문단 뒤에 둔다(오클릭 방지, src/lib/ads.ts 배치 규칙). */}
      {AD_SLOTS.bottom && <AdBanner key="tax-compare-bottom" slot={AD_SLOTS.bottom} className="ad-slot--tool ad-slot--bottom" />}

      <section style={{ marginTop: 'var(--space-8)' }}>
        <h2 style={{ fontSize: 'var(--fs-h2)', marginBottom: 'var(--space-3)' }}>계좌별 ETF 세금 비교표</h2>
        <div className="etf-sibling-table-wrap">
          <table className="etf-sibling-table etf-tax-table">
            <caption className="etf-sibling-caption">계좌별 ETF 세금 ({R.asOf} 법령 기준, 세율은 지방소득세 포함)</caption>
            <thead>
              <tr>
                <th scope="col">계좌</th>
                <th scope="col">국내주식형 ETF 매매차익</th>
                <th scope="col">해외·채권·원자재 ETF 매매차익</th>
                <th scope="col">분배금</th>
                <th scope="col">한도·비고</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">일반 계좌</th>
                <td>비과세</td>
                <td>배당소득 {pct(R.dividendTaxRate)} (보유기간 과세)</td>
                <td>배당소득 {pct(R.dividendTaxRate)} 원천징수</td>
                <td>금융소득 연 {formatWon(R.financialIncomeThreshold)} 초과분 종합과세</td>
              </tr>
              <tr>
                <th scope="row">중개형 ISA</th>
                <td>과세 대상 아님 (손실도 통산 안 함)</td>
                <td>계좌 안에서 손익 통산</td>
                <td>계좌 안에서 손익 통산</td>
                <td>순이익 {formatWon(R.isa.taxFreeGeneral)}(서민형 {formatWon(R.isa.taxFreeLowIncome)})까지 비과세, 초과분 {pct(R.isa.excessRate)}, 의무 가입 {R.isa.minYears}년</td>
              </tr>
              <tr>
                <th scope="row">연금저축</th>
                <td>과세이연</td>
                <td>과세이연</td>
                <td>과세이연</td>
                <td>연금 수령 때 {pct(R.pension.rate80plus)}~{pct(R.pension.rateUnder70)}, 연금 외 수령 {pct(R.pension.otherWithdrawalRate)}, 레버리지·인버스 매수 불가</td>
              </tr>
              <tr>
                <th scope="row">IRP·DC 퇴직연금</th>
                <td>과세이연</td>
                <td>과세이연</td>
                <td>과세이연</td>
                <td>연금저축과 같은 방식, 위험자산 {pct(R.retirementRiskAssetLimit)} 한도, 레버리지·인버스 매수 불가</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', lineHeight: 1.7, marginTop: '0.75rem' }}>
          국내 주식 액티브·커버드콜·TR(배당 재투자) 상품은 보유기간 과세 대상이지만 펀드가 국내 상장 주식에서 낸 차익은 과세표준에서 빠져
          실제 세금은 주로 배당·옵션 수익에서 생깁니다. 상품별 구분은 운용사 상품 페이지의 과세 항목에서 확인하세요.
        </p>
      </section>

      <section style={{ marginTop: 'var(--space-8)' }}>
        <h2 style={{ fontSize: 'var(--fs-h2)', marginBottom: 'var(--space-3)' }}>계산 예시 3가지</h2>
        <div className="etf-sibling-table-wrap">
          <table className="etf-sibling-table etf-tax-table">
            <caption className="etf-sibling-caption">계좌별 세금 계산 예시 (연금은 70세 미만 수령, ISA는 일반형 기준)</caption>
            <thead>
              <tr>
                <th scope="col">예시</th>
                <th scope="col">세전 수익</th>
                <th scope="col">일반 계좌 세금</th>
                <th scope="col">중개형 ISA 세금</th>
                <th scope="col">연금저축·IRP 세금</th>
              </tr>
            </thead>
            <tbody>
              {examples.map(e => (
                <tr key={e.title}>
                  <th scope="row">{e.title}</th>
                  <td>{formatWon(e.r.gross)}</td>
                  <td>{formatWon(e.r.generalTax)}</td>
                  <td>{formatWon(e.r.isaTax)}</td>
                  <td>{formatWon(e.r.pensionTax)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginTop: '0.75rem' }}>
          {examples.map(e => (
            <li key={e.title}><strong>{e.title}</strong>: {e.note}</li>
          ))}
        </ul>
      </section>

      <FaqSection title="계좌별 ETF 세금 자주 묻는 질문" items={FAQ} />

      <section style={{ marginTop: 'var(--space-8)' }}>
        <h2 style={{ fontSize: 'var(--fs-h3)', marginBottom: 'var(--space-3)' }}>함께 보면 좋은 가이드</h2>
        <ul className="home-link-list">
          {relatedHubs.map(c => (
            <li key={c.key}><Link href={categoryHref(c)} prefetch={false}>{c.label} 가이드</Link></li>
          ))}
          <li><Link href="/tools/dividend-calculator" prefetch={false}>ETF 분배금 계산기</Link></li>
        </ul>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.82rem', lineHeight: 1.7, marginTop: 'var(--space-4)' }}>
          근거 법령:{' '}
          {TAX_SOURCES.map((s, i) => (
            <span key={s.url}>
              {i > 0 ? ' · ' : ''}
              <a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a>
            </span>
          ))}
        </p>
      </section>
    </article>
  );
}
