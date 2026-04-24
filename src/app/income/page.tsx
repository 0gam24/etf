import Link from 'next/link';
import type { Metadata } from 'next';
import { getPostsByCategory } from '@/lib/posts';
import { buildMonthlyMatrix } from '@/lib/income';
import { getIncomeRegistry } from '@/lib/income-server';
import IncomeHero from '@/components/IncomeHero';
import IncomeCalendar from '@/components/IncomeCalendar';
import IncomeStabilityTable from '@/components/IncomeStabilityTable';
import IncomeTaxCompare from '@/components/IncomeTaxCompare';
import IncomeGoalCalculator from '@/components/IncomeGoalCalculator';

export const metadata: Metadata = {
  title: '월배당·커버드콜 — Daily ETF Pulse',
  description:
    '커버드콜·월배당 ETF 분배 캘린더 · 계좌별 세후 수익률 비교 · 월 목표 현금흐름 역산. 4050·은퇴자를 위한 현금흐름 설계 도구.',
};

export default function IncomeLandingPage() {
  const registry = getIncomeRegistry();
  const posts = getPostsByCategory('income');

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

  const latestPost = posts[0];

  return (
    <div className="income-landing animate-fade-in">
      <IncomeHero etfCount={etfs.length} topYield={topYield} monthlyCount={monthlyCount} asOf={asOf} />

      <div className="income-landing-body">
        <IncomeGoalCalculator etfs={etfs} />

        <IncomeCalendar cells={cells} etfs={etfs} />

        <IncomeStabilityTable etfs={etfs} />

        <IncomeTaxCompare etfs={topStable} basePrincipal={100000000} />

        {/* 저자 후기 카드 */}
        {latestPost && latestPost.meta.authorId && (
          <section className="pulse-author-card">
            <div className="pulse-author-head">
              <span className="pulse-author-avatar">{latestPost.meta.author.charAt(0)}</span>
              <div>
                <div className="pulse-author-name">{latestPost.meta.author}</div>
                <div className="pulse-author-role">월배당 포트폴리오 10년 실전 후기</div>
              </div>
              <Link href={`/author/${latestPost.meta.authorId}`} className="pulse-author-link">
                프로필 보기 →
              </Link>
            </div>
            <p className="pulse-author-quote">
              &ldquo;{latestPost.meta.description}&rdquo;
            </p>
          </section>
        )}

        {/* 최근 income 발행 */}
        <section className="pulse-archive">
          <div className="pulse-section-head">
            <h2 className="pulse-section-title">월배당·커버드콜 최근 리포트</h2>
            <p className="pulse-section-hint">총 {posts.length}편</p>
          </div>
          {posts.length === 0 ? (
            <p className="pulse-section-empty">아직 발행된 글이 없습니다.</p>
          ) : (
            <ul className="pulse-archive-list">
              {posts.slice(0, 8).map(p => (
                <li key={p.meta.slug}>
                  <Link href={`/${p.meta.category}/${p.meta.slug}`} className="pulse-archive-row">
                    <span className="pulse-archive-date">
                      {new Date(p.meta.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="pulse-archive-title">{p.meta.title}</span>
                    <span className="pulse-archive-meta">{p.readingTime}분</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="income-disclaimer">{registry.disclaimer}</p>
      </div>
    </div>
  );
}
