import type { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';
import NewsletterSignup from '@/components/NewsletterSignup';
import { buildBreadcrumbSchema, jsonLd } from '@/lib/schema';

export const metadata: Metadata = {
  title: '뉴스레터 — 일일 ETF 요약 받기 | Daily ETF Pulse',
  description:
    '매일 아침 9시 발행되는 거래량 TOP 3·섹터 자금 흐름·월배당 분배 캘린더를 한 통의 이메일로. 출근 전 5분 ETF 브리핑.',
  alternates: { canonical: '/newsletter' },
};

export default function NewsletterPage() {
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: '홈', href: '/' },
    { name: '뉴스레터', href: '/newsletter' },
  ]);

  return (
    <article className="newsletter-page animate-fade-in">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />

      <Breadcrumbs items={[{ name: '홈', href: '/' }, { name: '뉴스레터', href: '/newsletter' }]} />

      <header className="newsletter-page-hero">
        <div className="newsletter-page-eyebrow">📧 NEWSLETTER</div>
        <h1 className="newsletter-page-title">출근 전 5분, 오늘의 ETF</h1>
        <p className="newsletter-page-tagline">
          거래량·자금 흐름·월배당 — 매일 아침 한 통의 이메일로 시장의 핵심을 정리해 드립니다.
        </p>
      </header>

      <NewsletterSignup variant="full" />

      <section className="newsletter-page-section">
        <h2 className="newsletter-page-h2">뉴스레터에 무엇이 담기나</h2>
        <ul className="newsletter-page-list">
          <li><strong>오늘의 거래량 TOP 3</strong> — 어떤 ETF가 시장을 움직였나, 한 줄 사유.</li>
          <li><strong>섹터 자금 흐름</strong> — 어디로 돈이 몰리고 빠지나.</li>
          <li><strong>월배당 분배 캘린더</strong> — 이번 주 분배락일·분배금 일정.</li>
          <li><strong>관심 종목 알림</strong> — 본인이 등록한 ETF의 뉴스·시세 변동 (Phase 2).</li>
          <li><strong>주간 인사이트</strong> — 일요일 발행되는 주간 종합 리포트.</li>
        </ul>
      </section>

      <section className="newsletter-page-section">
        <h2 className="newsletter-page-h2">현재 받아볼 수 있는 채널</h2>
        <ul className="newsletter-page-list">
          <li>
            <strong>RSS 피드 (즉시 활성)</strong> — Feedly·Inoreader 등 RSS 리더에 등록하면 모든 새 글을 자동 수신.{' '}
            <a href="/rss.xml" target="_blank" rel="noopener noreferrer">/rss.xml 구독 →</a>
          </li>
          <li>
            <strong>Threads (활성)</strong> — Threads에서 매일 발행 알림 (현재 토큰 설정 후 활성화).
          </li>
          <li>
            <strong>이메일 다이제스트 (Phase 2 준비 중)</strong> — 위 폼에 등록 시 발송 시작 시점에 안내.
          </li>
        </ul>
      </section>

      <section className="newsletter-page-section">
        <h2 className="newsletter-page-h2">개인정보 처리</h2>
        <p className="newsletter-page-desc">
          이메일은 발송 시스템 정식 가동 전까지 본인 브라우저(localStorage)에만 저장됩니다.
          정식 발송 시작 시점에 GDPR·개인정보보호법에 따라 명시적 재동의를 받습니다.
          마케팅·제3자 제공 목적으로 사용하지 않습니다.
        </p>
      </section>
    </article>
  );
}
