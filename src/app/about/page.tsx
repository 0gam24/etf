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
    <article className="about-page animate-fade-in">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(orgSchema) }} />

      <Breadcrumbs items={[{ name: '홈', href: '/' }, { name: '편집팀 소개', href: '/about' }]} />

      <header className="about-hero">
        <div className="about-eyebrow">ABOUT</div>
        <h1 className="about-title">Daily ETF Pulse 편집팀 소개</h1>
        <p className="about-tagline">
          Daily ETF Pulse는 KRX 공공데이터를 기반으로 한 ETF 분석 사이트입니다. 7개의 AI 분석 에이전트가 각자의 전문 영역에서 매일 새 분석을 발행하며, 편집팀이 검수·책임 발행합니다.
        </p>
      </header>

      <section className="about-section">
        <h2 className="about-h2">발행 원칙</h2>
        <ul className="about-list">
          <li><strong>데이터 우선</strong> — 모든 분석은 KRX 일별 시세, 운용사 공시, 한국은행 ECOS 등 공식 데이터 출처를 명시합니다.</li>
          <li><strong>AI 작성 투명 공개</strong> — 7개 분석 에이전트는 모두 AI 모델이며, 글마다 작성 모델·데이터 출처를 노출합니다.</li>
          <li><strong>발행 책임</strong> — 검수·정정·발행 책임은 Daily ETF Pulse 편집팀에 있습니다. 오류 제보는 환영합니다.</li>
          <li><strong>투자 권유 아님</strong> — 모든 콘텐츠는 정보 제공 목적이며, 투자 권유가 아닙니다. 결정과 손익의 책임은 투자자 본인에게 있습니다.</li>
        </ul>
      </section>

      <section className="about-section">
        <h2 className="about-h2">AI 분석 에이전트는 어떻게 작동하나</h2>
        <p className="about-desc">
          각 에이전트는 자신의 전문 영역에 해당하는 공식 데이터셋(KRX 시세·운용사 공시·한국은행 ECOS·국세청 세법)을 입력으로 받아, 정해진 분석 방법론(분배 안정성 스코어·거래량 z-score·매크로 회귀 등)으로 매일의 분석 결과를 산출합니다. 편집팀은 산출물을 검수한 뒤 발행하며, 출처와 방법론을 글마다 함께 노출합니다.
        </p>

        <div className="about-agent-grid">
          {AUTHOR_LIST.map(a => (
            <Link key={a.id} href={`/author/${a.id}`} className="about-agent-card">
              <div className="about-agent-head">
                <span className="about-agent-callsign" aria-hidden>{a.callsign || a.name.charAt(0)}</span>
                <div className="about-agent-meta">
                  <div className="about-agent-name">{a.name}</div>
                  <div className="about-agent-title">{a.title}</div>
                </div>
              </div>
              <p className="about-agent-desc">
                {a.modelDescription.length > 140 ? a.modelDescription.slice(0, 140) + '…' : a.modelDescription}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="about-section">
        <h2 className="about-h2">발행·검수 책임</h2>
        <div className="about-publisher-card">
          <h3 className="about-publisher-name">{PUBLISHER.name}</h3>
          <p className="about-publisher-desc">{PUBLISHER.description}</p>
          <p className="about-publisher-disclosure">{AI_DISCLOSURE}</p>
        </div>
      </section>

      <section className="about-section">
        <h2 className="about-h2">오류 제보·문의</h2>
        <p className="about-desc">
          분석 오류·데이터 정정 요청은 환영합니다. 사이트 운영팀에 문의해 주시면 빠르게 검토 후 정정 사항을 글에 반영합니다.
        </p>
      </section>
    </article>
  );
}
