import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import { buildBreadcrumbSchema, jsonLd } from '@/lib/schema';

const CONTACT_EMAIL = 'smartdatashop@gmail.com';

export const metadata: Metadata = {
  title: '연락처 — Daily ETF Pulse',
  description:
    'Daily ETF Pulse 편집팀 연락처. 데이터 오류 제보·일반 문의·제휴·광고 문의를 이메일로 보내주시면 영업일 기준 1~3일 내 답변드립니다.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  const breadcrumb = buildBreadcrumbSchema([
    { name: '홈', href: '/' },
    { name: '연락처', href: '/contact' },
  ]);

  // ContactPoint schema for E-E-A-T
  const contactSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Daily ETF Pulse 연락처',
    url: 'https://iknowhowinfo.com/contact',
    inLanguage: 'ko-KR',
    mainEntity: {
      '@type': 'Organization',
      name: 'Daily ETF Pulse',
      url: 'https://iknowhowinfo.com',
      email: CONTACT_EMAIL,
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'editorial',
        email: CONTACT_EMAIL,
        availableLanguage: ['Korean', 'English'],
      },
    },
  };

  return (
    <article className="about-page animate-fade-in">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(contactSchema) }} />

      <Breadcrumbs items={[{ name: '홈', href: '/' }, { name: '연락처', href: '/contact' }]} />

      <header className="about-hero">
        <div className="about-eyebrow">CONTACT</div>
        <h1 className="about-title">연락처</h1>
        <p className="about-tagline">
          Daily ETF Pulse 편집팀에 직접 연락하실 수 있습니다. 오류 제보·일반 문의·제휴 제안 모두 환영합니다.
        </p>
      </header>

      <section className="about-section">
        <h2 className="about-h2">이메일</h2>
        <p className="about-desc" style={{ fontSize: 'var(--fs-lg)' }}>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            style={{ color: 'var(--accent-gold)', textDecoration: 'underline', fontWeight: 600 }}
          >
            {CONTACT_EMAIL}
          </a>
        </p>
        <p className="about-desc" style={{ marginTop: '0.5rem', fontSize: 'var(--fs-sm)', color: 'var(--text-dim)' }}>
          영업일 기준 1~3일 내 답변드립니다. 제목에 문의 카테고리를 명시해주시면 더 빠르게 답변할 수 있습니다.
        </p>
      </section>

      <section className="about-section">
        <h2 className="about-h2">문의 가능 영역</h2>
        <ul className="about-list">
          <li>
            <strong>데이터 오류 제보</strong> — ETF 시세, 구성 종목, 분배금 정보, 차트 등의 부정확한
            데이터를 발견하셨다면 페이지 URL과 함께 알려주세요. 검증 후 빠르게 정정합니다.
          </li>
          <li>
            <strong>콘텐츠 정정 요청</strong> — 글 본문의 사실관계 오류·오탈자·인용 누락은 신속히 반영합니다.
          </li>
          <li>
            <strong>제휴·광고 문의</strong> — ETF·금융 서비스 운용사, 핀테크, 자산관리 전문가와의 협업
            제안을 받습니다. 제휴 가능 범위는 사이트의 공정성 원칙(편집권 분리)에 어긋나지 않는 범위에
            한합니다.
          </li>
          <li>
            <strong>저작권·인용 문의</strong> — 본 사이트 콘텐츠 인용·재배포 관련 문의.
          </li>
          <li>
            <strong>일반 의견</strong> — 사이트 개선 제안·기능 요청·콘텐츠 주제 추천.
          </li>
        </ul>
      </section>

      <section className="about-section">
        <h2 className="about-h2">투자 자문은 제공하지 않습니다</h2>
        <p className="about-desc">
          Daily ETF Pulse는 정보 제공 사이트로, 개별 투자 자문·종목 추천·매수/매도 권유는 제공하지 않습니다.
          개인 포트폴리오·매매 시점·종목 선택 관련 문의는 자격을 갖춘 투자 자문 전문가에게 문의하시기 바랍니다.
          자세한 내용은 <Link href="/disclaimer" style={{ color: 'var(--accent-gold)', textDecoration: 'underline' }}>면책조항</Link>을 참고해주세요.
        </p>
      </section>

      <section className="about-section">
        <h2 className="about-h2">발행 책임</h2>
        <ul className="about-list">
          <li><strong>발행자</strong>: Daily ETF Pulse 편집팀</li>
          <li><strong>사이트</strong>: https://iknowhowinfo.com</li>
          <li><strong>대표 연락처</strong>: {CONTACT_EMAIL}</li>
        </ul>
      </section>

      <section className="about-section">
        <p className="about-desc" style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-dim)' }}>
          관련 페이지: <Link href="/about" style={{ color: 'var(--accent-gold)', textDecoration: 'underline' }}>편집팀 소개</Link>{' · '}
          <Link href="/privacy" style={{ color: 'var(--accent-gold)', textDecoration: 'underline' }}>개인정보처리방침</Link>{' · '}
          <Link href="/disclaimer" style={{ color: 'var(--accent-gold)', textDecoration: 'underline' }}>면책조항</Link>
        </p>
      </section>
    </article>
  );
}
