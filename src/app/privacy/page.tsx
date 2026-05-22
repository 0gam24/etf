import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import { buildBreadcrumbSchema, jsonLd } from '@/lib/schema';

const LAST_UPDATED = '2026-05-22';

export const metadata: Metadata = {
  title: '개인정보처리방침 — Daily ETF Pulse',
  description:
    'Daily ETF Pulse(iknowhowinfo.com)의 개인정보 수집·이용·보유 정책, 쿠키 사용(Google AdSense·DoubleClick 포함), 제3자 광고 게재, 이용자 권리 및 행사 방법을 안내합니다.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  const breadcrumb = buildBreadcrumbSchema([
    { name: '홈', href: '/' },
    { name: '개인정보처리방침', href: '/privacy' },
  ]);

  return (
    <article className="about-page animate-fade-in">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumb) }} />

      <Breadcrumbs items={[{ name: '홈', href: '/' }, { name: '개인정보처리방침', href: '/privacy' }]} />

      <header className="about-hero">
        <div className="about-eyebrow">PRIVACY POLICY</div>
        <h1 className="about-title">개인정보처리방침</h1>
        <p className="about-tagline">
          Daily ETF Pulse(iknowhowinfo.com, 이하 &quot;사이트&quot;)는 이용자의 개인정보를 중요하게 생각하며,
          관련 법령(개인정보 보호법, 정보통신망법)과 Google AdSense 정책을 준수합니다.
        </p>
        <p className="about-desc" style={{ marginTop: '0.5rem', fontSize: 'var(--fs-sm)', color: 'var(--text-dim)' }}>
          최종 개정일: {LAST_UPDATED}
        </p>
      </header>

      <section className="about-section">
        <h2 className="about-h2">1. 수집하는 정보</h2>
        <p className="about-desc">사이트는 다음 정보를 자동으로 수집합니다.</p>
        <ul className="about-list">
          <li><strong>접속 로그</strong> — IP 주소, 브라우저 종류·버전, 운영체제, 접속 시각, 방문한 페이지 URL, 리퍼러(referrer)</li>
          <li><strong>쿠키(Cookie)</strong> — 세션 유지·환경 설정·통계 분석·광고 게재 목적 (자세한 내용은 아래 4항 참조)</li>
          <li><strong>이용자가 직접 제공한 정보</strong> — 문의 이메일 발송 시 회신 주소·문의 내용</li>
        </ul>
        <p className="about-desc" style={{ marginTop: '1rem' }}>
          사이트는 회원가입·로그인 기능을 운영하지 않으며, 별도 데이터베이스에 개인 식별 정보를 저장하지 않습니다.
        </p>
      </section>

      <section className="about-section">
        <h2 className="about-h2">2. 정보 이용 목적</h2>
        <ul className="about-list">
          <li>웹사이트 운영 및 기술적 안정성 유지 (장애 분석·보안 모니터링)</li>
          <li>방문 통계 분석 및 콘텐츠 개선 (Google Analytics)</li>
          <li>맞춤형 광고 게재 (Google AdSense)</li>
          <li>이용자 문의에 대한 응대</li>
        </ul>
      </section>

      <section className="about-section">
        <h2 className="about-h2">3. 보유 및 파기</h2>
        <ul className="about-list">
          <li>접속 로그: 통신비밀보호법에 따라 최대 3개월 보유 후 자동 파기</li>
          <li>쿠키: 이용자가 브라우저에서 직접 삭제 가능 (보유 기간은 쿠키 종류별로 상이)</li>
          <li>문의 이메일: 응대 완료 후 1년 보관 후 파기</li>
        </ul>
      </section>

      <section className="about-section">
        <h2 className="about-h2">4. 쿠키 사용 및 Google AdSense</h2>
        <p className="about-desc">
          사이트는 이용자에게 더 나은 서비스를 제공하기 위해 쿠키를 사용합니다.
          특히 <strong>Google AdSense</strong>를 통한 제3자 광고 게재에 다음 쿠키가 사용됩니다.
        </p>
        <ul className="about-list">
          <li>
            <strong>Google AdSense·DoubleClick(DART) 쿠키</strong> — Google 및 그 파트너사가 이용자의
            방문 이력을 기반으로 관심사에 맞춘 광고를 게재하는 데 사용됩니다.
          </li>
          <li>
            <strong>Google Analytics 쿠키</strong> — 방문자 수·페이지 체류 시간·기기 종류 등 통계 분석에
            사용됩니다. 개인 식별 정보는 수집하지 않습니다.
          </li>
        </ul>
        <p className="about-desc" style={{ marginTop: '1rem' }}>
          이용자는 다음 방법으로 광고 쿠키를 제어할 수 있습니다.
        </p>
        <ul className="about-list">
          <li>
            Google 광고 설정에서 맞춤형 광고 비활성화:{' '}
            <a
              href="https://adssettings.google.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--accent-gold)', textDecoration: 'underline' }}
            >
              adssettings.google.com
            </a>
          </li>
          <li>
            네트워크 광고 이니셔티브(NAI) 옵트아웃:{' '}
            <a
              href="https://www.networkadvertising.org/choices"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--accent-gold)', textDecoration: 'underline' }}
            >
              networkadvertising.org/choices
            </a>
          </li>
          <li>브라우저 설정에서 쿠키 차단 또는 삭제 (브라우저별 안내 페이지 참조)</li>
        </ul>
      </section>

      <section className="about-section">
        <h2 className="about-h2">5. 제3자 제공 및 위탁</h2>
        <p className="about-desc">
          사이트는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 다만 다음 서비스에 의해
          쿠키·접속 정보가 자동 수집·처리될 수 있습니다.
        </p>
        <ul className="about-list">
          <li><strong>Google AdSense, Google Analytics</strong> — Google LLC (미국)</li>
          <li><strong>Cloudflare Pages</strong> — 호스팅·CDN, Cloudflare Inc. (미국)</li>
          <li><strong>쿠팡 파트너스</strong> — 일부 페이지의 제휴 링크 클릭 시 쿠팡 측 추적 쿠키 발생 가능</li>
        </ul>
      </section>

      <section className="about-section">
        <h2 className="about-h2">6. 이용자의 권리</h2>
        <ul className="about-list">
          <li>본인의 개인정보 열람·정정·삭제·처리 정지를 요청할 수 있습니다.</li>
          <li>요청은 아래 연락처로 이메일을 보내주시면 7일 이내 답변드립니다.</li>
          <li>개인정보 침해 신고는 한국인터넷진흥원(KISA) 개인정보침해신고센터(privacy.kisa.or.kr, 국번 없이 118)로 가능합니다.</li>
        </ul>
      </section>

      <section className="about-section">
        <h2 className="about-h2">7. 책임자 및 연락처</h2>
        <ul className="about-list">
          <li><strong>개인정보 보호 책임자</strong>: Daily ETF Pulse 편집팀</li>
          <li>
            <strong>이메일</strong>:{' '}
            <a
              href="mailto:smartdatashop@gmail.com"
              style={{ color: 'var(--accent-gold)', textDecoration: 'underline' }}
            >
              smartdatashop@gmail.com
            </a>
          </li>
          <li>자세한 문의 절차는 <Link href="/contact" style={{ color: 'var(--accent-gold)', textDecoration: 'underline' }}>연락처 페이지</Link> 참조</li>
        </ul>
      </section>

      <section className="about-section">
        <h2 className="about-h2">8. 정책 변경</h2>
        <p className="about-desc">
          본 방침은 법령·서비스 변경에 따라 개정될 수 있으며, 변경 시 사이트 공지 또는 본 페이지 갱신을
          통해 안내합니다. 변경 사항은 본 페이지 상단의 &quot;최종 개정일&quot;로 확인할 수 있습니다.
        </p>
      </section>

      <section className="about-section">
        <p className="about-desc" style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-dim)' }}>
          관련 페이지: <Link href="/about" style={{ color: 'var(--accent-gold)', textDecoration: 'underline' }}>편집팀 소개</Link>{' · '}
          <Link href="/disclaimer" style={{ color: 'var(--accent-gold)', textDecoration: 'underline' }}>면책조항</Link>{' · '}
          <Link href="/contact" style={{ color: 'var(--accent-gold)', textDecoration: 'underline' }}>연락처</Link>
        </p>
      </section>
    </article>
  );
}
