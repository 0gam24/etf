import Link from 'next/link';
import type { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';
import { AUTHOR_LIST, PUBLISHER, AI_DISCLOSURE } from '@/lib/authors';
import { buildBreadcrumbSchema, jsonLd } from '@/lib/schema';

export const metadata: Metadata = {
  title: '편집팀 소개 — Daily ETF Pulse',
  description:
    'Daily ETF Pulse의 발행·검수 책임자, 7개 AI 분석 에이전트의 데이터 출처·분석 모델·E-E-A-T 정책을 한 페이지에 정리합니다.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  const breadcrumb = buildBreadcrumbSchema([
    { name: '홈', href: '/' },
    { name: '편집팀 소개', href: '/about' },
  ]);

  // 사이트 운영 Organization schema (E-E-A-T 강화)
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name: 'Daily ETF Pulse',
    url: 'https://iknowhowinfo.com',
    description: PUBLISHER.description,
    publishingPrinciples: 'https://iknowhowinfo.com/about',
    diversityPolicy: 'https://iknowhowinfo.com/about',
    correctionsPolicy: 'https://iknowhowinfo.com/about',
    actionableFeedbackPolicy: 'https://iknowhowinfo.com/about',
    inLanguage: 'ko-KR',
  };

  return (
    <article className="animate-fade-in" style={{ maxWidth: '52rem', margin: '0 auto', padding: 'var(--space-8) var(--space-5)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(orgSchema) }} />

      <Breadcrumbs items={[{ name: '홈', href: '/' }, { name: '편집팀 소개', href: '/about' }]} />

      <header style={{ marginTop: 'var(--space-6)', marginBottom: 'var(--space-10)' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.75rem' }}>
          ABOUT
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '1rem' }}>
          Daily ETF Pulse 편집팀 소개
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          Daily ETF Pulse는 KRX 공공데이터를 기반으로 한 ETF 분석 사이트입니다. 7개의 AI 분석 에이전트가 각자의 전문 영역에서 매일 새 분석을 발행하며, 편집팀이 검수·책임 발행합니다.
        </p>
      </header>

      <section style={{ marginBottom: 'var(--space-12)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 'var(--space-5)' }}>발행 원칙</h2>
        <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.9 }}>
          <li><strong>데이터 우선</strong> — 모든 분석은 KRX 일별 시세, 운용사 공시, 한국은행 ECOS 등 공식 데이터 출처를 명시합니다.</li>
          <li><strong>AI 작성 투명 공개</strong> — 7개 분석 에이전트는 모두 AI 모델이며, 글마다 작성 모델·데이터 출처를 노출합니다.</li>
          <li><strong>발행 책임</strong> — 검수·정정·발행 책임은 Daily ETF Pulse 편집팀에 있습니다. 오류 제보는 환영합니다.</li>
          <li><strong>투자 권유 아님</strong> — 모든 콘텐츠는 정보 제공 목적이며, 투자 권유가 아닙니다. 결정과 손익의 책임은 투자자 본인에게 있습니다.</li>
        </ul>
      </section>

      <section style={{ marginBottom: 'var(--space-12)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 'var(--space-5)' }}>AI 분석 에이전트는 어떻게 작동하나</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.8, marginBottom: 'var(--space-5)' }}>
          각 에이전트는 자신의 전문 영역에 해당하는 공식 데이터셋(KRX 시세·운용사 공시·한국은행 ECOS·국세청 세법)을 입력으로 받아, 정해진 분석 방법론(분배 안정성 스코어·거래량 z-score·매크로 회귀 등)으로 매일의 분석 결과를 산출합니다. 편집팀은 산출물을 검수한 뒤 발행하며, 출처와 방법론을 글마다 함께 노출합니다.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
          {AUTHOR_LIST.map(a => (
            <Link
              key={a.id}
              href={`/author/${a.id}`}
              style={{
                display: 'block',
                padding: 'var(--space-5)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '0.625rem',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'border-color var(--t-base)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.625rem' }}>
                <span aria-hidden style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '2rem', height: '2rem',
                  background: 'rgba(212,175,55,0.15)', color: '#D4AF37',
                  borderRadius: '50%', fontSize: '0.85rem', fontWeight: 800,
                }}>
                  {a.callsign || a.name.charAt(0)}
                </span>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{a.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{a.title}</div>
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                {a.modelDescription.length > 140 ? a.modelDescription.slice(0, 140) + '…' : a.modelDescription}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 'var(--space-10)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 'var(--space-5)' }}>발행·검수 책임</h2>
        <div style={{
          padding: 'var(--space-6)',
          background: 'rgba(212,175,55,0.05)',
          border: '1px solid rgba(212,175,55,0.2)',
          borderRadius: '0.75rem',
        }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.625rem', color: 'var(--accent-gold)' }}>{PUBLISHER.name}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, margin: 0 }}>
            {PUBLISHER.description}
          </p>
          <p style={{ marginTop: 'var(--space-4)', fontSize: '0.85rem', color: 'var(--text-dim)', lineHeight: 1.7 }}>
            {AI_DISCLOSURE}
          </p>
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 'var(--space-5)' }}>오류 제보·문의</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7 }}>
          분석 오류·데이터 정정 요청은 환영합니다. 사이트 운영팀에 문의해 주시면 빠르게 검토 후 정정 사항을 글에 반영합니다.
        </p>
      </section>
    </article>
  );
}
