import type { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';
import PortfolioSim from './PortfolioSim';

export const metadata: Metadata = {
  title: 'ETF 포트폴리오 실시간 시뮬레이션 — Daily ETF Pulse',
  description: 'ETF 코드와 보유수량 입력 시 실시간 한투 시세로 손익·등락률·시장 평균 대비 성과를 자동 계산. 본인 보유 자산을 한 페이지에 관리.',
  alternates: { canonical: '/tools/portfolio' },
};

export default function PortfolioPage() {
  return (
    <article style={{ maxWidth: '60rem', margin: '0 auto', padding: 'var(--space-8) var(--space-6)' }}>
      <Breadcrumbs items={[
        { name: '홈', href: '/' },
        { name: '도구', href: '/tools/portfolio' },
        { name: '포트폴리오 시뮬레이션', href: '/tools/portfolio' },
      ]} />

      <header style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--accent-gold)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          TOOL · PORTFOLIO
        </div>
        <h1 style={{ fontSize: 'var(--fs-h1)', marginBottom: 'var(--space-3)' }}>
          ETF 포트폴리오 실시간 시뮬레이션
        </h1>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          ETF 코드와 보유수량을 입력하면 한투 OpenAPI 실시간 시세로 손익을 자동 계산합니다.
          입력값은 브라우저(localStorage) 에만 저장 — 서버에 전송 안 됨.
        </p>
      </header>

      <PortfolioSim />

      <section style={{ marginTop: 'var(--space-8)', padding: 'var(--space-5)', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius)' }}>
        <h3 style={{ fontSize: 'var(--fs-h3)', marginBottom: 'var(--space-2)', color: 'var(--red-400)' }}>⚠️ 안내</h3>
        <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9rem', paddingLeft: '1.25rem' }}>
          <li>본 도구는 정보 제공 목적이며 매매 권유가 아닙니다.</li>
          <li>실제 매매 시 수수료·슬리피지·세금을 고려해야 합니다.</li>
          <li>입력 데이터는 브라우저에만 저장됩니다. 다른 기기·계정에는 동기화 안 됨.</li>
        </ul>
      </section>
    </article>
  );
}
