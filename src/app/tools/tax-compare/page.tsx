import type { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';
import TaxCompareClient from './TaxCompareClient';

export const metadata: Metadata = {
  title: '계좌별 세후 수익률 비교 — IRP·ISA·연금저축·일반계좌',
  description: '동일 ETF 종목·금액 기준 IRP·ISA·연금저축·일반계좌의 세후 수익률을 시뮬레이션. 5·10·20년 누적 비교.',
  alternates: { canonical: '/tools/tax-compare' },
};

export default function TaxComparePage() {
  return (
    <article style={{ maxWidth: '60rem', margin: '0 auto', padding: 'var(--space-8) var(--space-6)' }}>
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
          계좌별 세후 수익률 비교
        </h1>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          동일 ETF·동일 금액·동일 기간에서 계좌 유형에 따라 세후 누적 수익이 어떻게 다른지 시뮬레이션.
          분배금에 대한 배당소득세 (15.4%) 와 매매차익 비과세를 단순화한 모델 (※ 일부 ETF 는 다름).
        </p>
      </header>

      <TaxCompareClient />

      <section style={{ marginTop: 'var(--space-6)', padding: 'var(--space-5)', background: 'var(--bg-card)', borderRadius: 'var(--radius)' }}>
        <h3 style={{ fontSize: 'var(--fs-h3)', marginBottom: 'var(--space-3)' }}>계좌 유형 요약</h3>
        <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          <li><strong>IRP</strong>: 분배금 + 매매차익 과세 이연. 인출 시 연금소득세 3.3~5.5% (55세 이후 10년 이상 분할). 한도 1,800만원/년</li>
          <li><strong>ISA</strong>: 비과세 한도 200만원 (서민형 400만원). 초과분은 9.9% 분리과세. 5년 의무 유지</li>
          <li><strong>연금저축</strong>: 세액공제 16.5% (총급여 5,500만↑ 13.2%). 한도 600만원/년. 인출 시 연금소득세</li>
          <li><strong>일반계좌</strong>: 분배금 배당소득세 15.4%, 매매차익 비과세 (국내 ETF). 단 해외·테마 ETF 는 15.4%</li>
        </ul>
      </section>

      <section style={{ marginTop: 'var(--space-5)', padding: 'var(--space-5)', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius)' }}>
        <h3 style={{ fontSize: 'var(--fs-h3)', marginBottom: 'var(--space-2)', color: 'var(--red-400)' }}>⚠️ 참고</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>
          본 시뮬레이션은 단순화 모델입니다. 실제 세금은 종목 유형 (국내·해외·테마)·인출 시점·기타 소득 결합에 따라 다릅니다. 정확한 세무 상담은 세무사·국세청 안내 참조.
        </p>
      </section>
    </article>
  );
}
