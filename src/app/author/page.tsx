import Link from 'next/link';
import type { Metadata } from 'next';
import { AUTHOR_LIST, PUBLISHER } from '@/lib/authors';
import Breadcrumbs from '@/components/Breadcrumbs';

/**
 * /author — 분석 모델(저자) 인덱스.
 *   개별 /author/[id] 만 있고 베어 /author 가 404 이던 것 해소(네비게이션·E-E-A-T 동선).
 *   인물 페르소나는 검색 노출하지 않으므로 noindex(follow) — 개별 페이지 정책과 일관.
 */
export const metadata: Metadata = {
  title: '분석 모델 — Daily ETF Pulse',
  description:
    'Daily ETF Pulse의 데이터 기반 AI 분석 모델 소개. KRX 공공데이터·한국은행 ECOS·DART 공시를 입력으로 분석하며, 발행·검수 책임은 편집팀에 있습니다.',
  alternates: { canonical: '/author' },
  robots: { index: false, follow: true },
};

export default function AuthorIndexPage() {
  return (
    <article className="author-index animate-fade-in">
      <Breadcrumbs
        items={[
          { name: '홈', href: '/' },
          { name: '분석 모델', href: '/author' },
        ]}
      />

      <header className="author-index-hero" style={{ margin: 'var(--space-6) 0 var(--space-8)' }}>
        <h1 style={{ fontSize: 'var(--fs-h1)', marginBottom: 'var(--space-3)' }}>분석 모델</h1>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '60ch' }}>
          Daily ETF Pulse의 분석은 데이터 기반 AI 분석 모델이 작성합니다. 각 모델은 한국거래소(KRX)
          공공데이터·한국은행 ECOS·금융감독원 전자공시(DART)·운용사 공시를 입력으로 분석하며, 실존 인물이
          아닙니다. 발행·검수 책임은{' '}
          <Link href="/about" style={{ color: 'var(--accent-gold)' }}>{PUBLISHER.name} 편집팀</Link>에 있습니다.
        </p>
      </header>

      <ul
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 'var(--space-4)',
          listStyle: 'none',
          padding: 0,
        }}
      >
        {AUTHOR_LIST.map(a => (
          <li key={a.id}>
            <Link
              href={`/author/${a.id}`}
              style={{
                display: 'block',
                padding: 'var(--space-5)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderLeft: `4px solid ${a.accent}`,
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                color: 'inherit',
                height: '100%',
              }}
            >
              <div style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
                {a.name}
              </div>
              <div style={{ fontSize: 'var(--fs-sm)', color: a.accent, fontWeight: 600, marginBottom: '0.5rem' }}>
                {a.title}
              </div>
              <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-dim)', lineHeight: 1.5, margin: 0 }}>
                {a.modelDescription.slice(0, 90)}…
              </p>
              {a.expertise?.length > 0 && (
                <div style={{ marginTop: 'var(--space-3)', display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                  {a.expertise.slice(0, 3).map(e => (
                    <span key={e} style={{ fontSize: '0.72rem', color: 'var(--text-dim)', background: 'var(--bg-subtle, rgba(255,255,255,0.04))', padding: '0.15rem 0.5rem', borderRadius: '0.3rem' }}>
                      {e}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          </li>
        ))}
      </ul>

      <p style={{ marginTop: 'var(--space-8)', fontSize: 'var(--fs-sm)', color: 'var(--text-dim)' }}>
        분석 원칙·데이터 출처·검수 절차는{' '}
        <Link href="/about" style={{ color: 'var(--accent-gold)' }}>About 페이지</Link>에서 확인하실 수 있습니다.
      </p>
    </article>
  );
}
