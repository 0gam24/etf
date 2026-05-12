import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ALL_PERSONAS } from '@/lib/personas-config';

/**
 * PersonaSelector — 메인페이지 7 페르소나 entry 카드.
 *
 *   "당신은 어떤 상황인가요?" — 본인 상황 가까운 카드 클릭 시
 *   /for/{persona} 페이지로 이동 (자체 콘텐츠 + 자매 도구 link 통합).
 *
 *   비로그인 · 개인화 X. 단순 라우팅.
 */
export default function PersonaSelector() {
  return (
    <section style={{ margin: 'var(--space-12) auto', padding: '0 var(--space-6)', maxWidth: '80rem' }}>
      <header style={{ marginBottom: 'var(--space-6)', textAlign: 'center' }}>
        <div style={{ fontSize: '0.75rem', letterSpacing: '0.12em', color: 'var(--accent-gold)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          FOR YOU
        </div>
        <h2 style={{ fontSize: 'var(--fs-h2)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
          당신의 상황에 맞는 ETF 자료
        </h2>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem', lineHeight: 1.6 }}>
          7가지 상황 중 본인과 가장 가까운 한 칸을 고르세요. 자체 분석 · 시그널 + 자매 사이트 계산기 통합 안내.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-3)' }}>
        {ALL_PERSONAS.map(p => (
          <Link
            key={p.slug}
            href={`/for/${p.slug}`}
            prefetch={false}
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: 'var(--space-4)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius)',
              textDecoration: 'none',
              color: 'var(--text-primary)',
              transition: 'all var(--t-base)',
              minHeight: '8rem',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
              {p.hero.eyebrow}
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 'auto', lineHeight: 1.4 }}>
              "{p.scenario}"
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: 'var(--space-3)', fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 700 }}>
              {p.displayName} 자료 보기 <ArrowRight size={12} strokeWidth={2.5} aria-hidden />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
