import Link from 'next/link';
import type { Metadata } from 'next';
import { getGuideCategory, getGuidesInCategory, categoryHref, guideDate } from '@/lib/guide-categories';
import { buildMonthlyMatrix } from '@/lib/income';
import { getIncomeRegistry } from '@/lib/income-server';
import IncomeHero from '@/components/IncomeHero';
import IncomeCalendar from '@/components/IncomeCalendar';
import ExDividendAlert from '@/components/ExDividendAlert';
import IncomeStabilityTable from '@/components/IncomeStabilityTable';
import IncomeTaxCompare from '@/components/IncomeTaxCompare';
import IncomeGoalCalculator from '@/components/IncomeGoalCalculator';
import NextChapterCta from '@/components/NextChapterCta';
import Breadcrumbs from '@/components/Breadcrumbs';
import FaqSection from '@/components/FaqSection';
import { CATEGORY_FAQ, CATEGORY_FAQ_TITLE } from '@/lib/category-faq';
import { buildPageMetadata } from '@/lib/site-meta';

export const metadata: Metadata = buildPageMetadata({
  title: '월배당 ETF·커버드콜 ETF 분배 캘린더',
  description:
    '월배당·커버드콜 ETF의 연간 분배 캘린더와 분배 안정성 등급을 정리했습니다. 계좌별 세후 수익률을 비교하고, 월 목표 금액에서 필요한 투자금을 거꾸로 계산해 볼 수 있습니다.',
  url: '/income',
  keywords: ['월배당 ETF', '커버드콜 ETF', 'ETF 분배금 캘린더', '월배당 ETF 추천', '분배락일', 'ETF 분배 안정성'],
});

export default function IncomeLandingPage() {
  const registry = getIncomeRegistry();
  // 2026-10-14: 06-13 에 멈춘 일별 월배당 글(noindex) 대신, 지금도 고치는 배당·분배금 가이드를 건다.
  const dividendHub = getGuideCategory('dividend');
  const guides = dividendHub ? getGuidesInCategory(dividendHub).slice(0, 8) : [];

  if (!registry) {
    return (
      <div className="income-landing animate-fade-in">
        <div style={{ padding: '4rem 1.5rem', textAlign: 'center', color: 'var(--text-dim)' }}>
          월배당 ETF 레지스트리를 불러오지 못했습니다.
        </div>
      </div>
    );
  }

  const { etfs, asOf } = registry;
  const topYield = Math.max(...etfs.map(e => e.yield));
  const monthlyCount = etfs.filter(e => e.frequency === 'monthly').length;
  const cells = buildMonthlyMatrix(etfs);

  // 세후 비교에 쓸 상위 3종은 안정성 등급 높은 순
  const gradeOrder: Record<string, number> = { S: 0, A: 1, B: 2, C: 3 };
  const topStable = [...etfs].sort(
    (a, b) => gradeOrder[a.stabilityGrade] - gradeOrder[b.stabilityGrade] || b.yield - a.yield,
  );

  return (
    <div className="income-landing animate-fade-in">
      <Breadcrumbs
        items={[
          { name: '홈', href: '/' },
          { name: '월배당·커버드콜', href: '/income' },
        ]}
      />
      <IncomeHero etfCount={etfs.length} topYield={topYield} monthlyCount={monthlyCount} asOf={asOf} />

      {/* 분배락일 D-5 이내 임박 ETF 알림 (자동 분기) */}
      <ExDividendAlert etfs={etfs} windowDays={5} />


      <div className="income-landing-body">
        <IncomeGoalCalculator etfs={etfs} />

        <IncomeCalendar cells={cells} etfs={etfs} />

        <IncomeStabilityTable etfs={etfs} />

        <IncomeTaxCompare etfs={topStable} basePrincipal={100000000} />

        {/* 저자 후기 카드 */}
        {/* 저자 카드(AI 에이전트 페르소나·"10년 실전 후기" 같은 경력 표기)는 2026-10-14 뺐다. 발행 책임은 리서치팀 */}

        {/* 배당·분배금 가이드 (2026-10-14: 예전 일별 리포트 목록을 주제 허브의 최신 가이드로 바꿨다) */}
        {dividendHub && guides.length > 0 && (
          <section className="pulse-archive">
            <div className="pulse-section-head">
              <h2 className="pulse-section-title">월배당·분배금 가이드</h2>
              <p className="pulse-section-hint">
                <Link href={categoryHref(dividendHub)} prefetch={false}>전체 보기</Link>
              </p>
            </div>
            <ul className="pulse-archive-list">
              {guides.map(g => (
                <li key={g.slug}>
                  <Link href={`/guide/${g.slug}`} className="pulse-archive-row" prefetch={false}>
                    <span className="pulse-archive-date">{guideDate(g)}</span>{' '}
                    <span className="pulse-archive-title">{g.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="income-disclaimer">{registry.disclaimer}</p>

        <FaqSection title={CATEGORY_FAQ_TITLE.income} items={CATEGORY_FAQ.income} />

        <NextChapterCta
          label="다음으로"
          copy="보유 수량으로 받을 분배금을 직접 계산해 보기"
          href="/tools/dividend-calculator"
        />

      </div>
    </div>
  );
}
