import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import { buildBreadcrumbSchema, jsonLd } from '@/lib/schema';

const LAST_UPDATED = '2026-05-22';

export const metadata: Metadata = {
  title: '면책조항 — Daily ETF Pulse',
  description:
    'Daily ETF Pulse는 정보 제공 목적의 사이트이며, 투자 권유·자문이 아닙니다. 데이터 출처, 분석 한계, 광고·제휴 링크 고지, 손익 책임 범위를 명확히 안내합니다.',
  alternates: { canonical: '/disclaimer' },
};

export default function DisclaimerPage() {
  const breadcrumb = buildBreadcrumbSchema([
    { name: '홈', href: '/' },
    { name: '면책조항', href: '/disclaimer' },
  ]);

  return (
    <article className="about-page animate-fade-in">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumb) }} />

      <Breadcrumbs items={[{ name: '홈', href: '/' }, { name: '면책조항', href: '/disclaimer' }]} />

      <header className="about-hero">
        <div className="about-eyebrow">DISCLAIMER</div>
        <h1 className="about-title">면책조항</h1>
        <p className="about-tagline">
          Daily ETF Pulse(이하 &quot;사이트&quot;)에 게시된 모든 콘텐츠는 정보 제공을 목적으로 합니다.
          투자 결정 전 반드시 본 면책조항을 읽고 동의해주시기 바랍니다.
        </p>
        <p className="about-desc" style={{ marginTop: '0.5rem', fontSize: 'var(--fs-sm)', color: 'var(--text-dim)' }}>
          최종 개정일: {LAST_UPDATED}
        </p>
      </header>

      <section className="about-section">
        <h2 className="about-h2">1. 투자 권유 아님</h2>
        <p className="about-desc">
          사이트의 모든 콘텐츠(ETF 분석, 시세 정보, 자금 흐름 리포트, 분배금 시뮬레이션, 가이드, 종목 사전 등)는
          공개 데이터를 기반으로 작성된 <strong>정보 제공 자료</strong>입니다.
        </p>
        <ul className="about-list">
          <li>특정 종목·ETF·금융 상품의 매수·매도·보유를 권유하지 <strong>않습니다</strong>.</li>
          <li>개인 포트폴리오 자문·세무 자문·법률 자문을 제공하지 <strong>않습니다</strong>.</li>
          <li>본 사이트는 자본시장법상 투자자문업자·투자일임업자가 <strong>아닙니다</strong>.</li>
        </ul>
        <p className="about-desc" style={{ marginTop: '1rem' }}>
          투자 결정 시에는 본인의 재무 상황·투자 목적·위험 감내 수준을 고려하시고, 필요한 경우 자격을 갖춘
          금융투자업 등록 전문가의 자문을 받으시기 바랍니다.
        </p>
      </section>

      <section className="about-section">
        <h2 className="about-h2">2. 데이터 정확성</h2>
        <p className="about-desc">
          사이트는 다음 공식 데이터 출처를 기반으로 콘텐츠를 작성합니다.
        </p>
        <ul className="about-list">
          <li>한국거래소(KRX) 공공데이터 포털 — ETF 시세, 구성 종목, 거래량</li>
          <li>한국은행 ECOS — 기준금리, 환율, 경제 지표</li>
          <li>금융감독원 DART — 운용사 공시</li>
          <li>각 자산운용사 공식 공시 — 분배금, 운용 보수</li>
        </ul>
        <p className="about-desc" style={{ marginTop: '1rem' }}>
          데이터 정확성·완전성을 위해 최선을 다하지만, 다음과 같은 사유로 일시적 오차가 발생할 수 있습니다.
        </p>
        <ul className="about-list">
          <li>외부 데이터 API의 갱신 지연 또는 일시적 오류</li>
          <li>장 마감 후 데이터 수집 시점과 사용자 열람 시점의 시차</li>
          <li>자동 분석 과정의 표현 오류</li>
        </ul>
        <p className="about-desc" style={{ marginTop: '1rem' }}>
          데이터 오류를 발견하시면{' '}
          <Link href="/contact" style={{ color: 'var(--accent-gold)', textDecoration: 'underline' }}>
            연락처 페이지
          </Link>
          를 통해 알려주세요. 검증 후 신속히 정정합니다.
        </p>
      </section>

      <section className="about-section">
        <h2 className="about-h2">3. 분석의 한계</h2>
        <ul className="about-list">
          <li>
            <strong>과거 데이터 기반</strong> — 모든 시세·수익률·차트는 과거 데이터이며, 미래 수익을 보장하지 않습니다.
          </li>
          <li>
            <strong>시뮬레이션 가정</strong> — 월배당 시뮬레이션·연환산 수익률 등은 일정 가정(분배율 유지·세율
            등)에 기반하며, 실제 결과와 차이가 있을 수 있습니다.
          </li>
          <li>
            <strong>시장 변동성</strong> — ETF·주식 시장은 거시 환경·정책·기업 실적 등 다양한 요인으로 급변할 수
            있습니다.
          </li>
          <li>
            <strong>자동 분석</strong> — 본문은 데이터 기반 자동 분석으로 작성되며, 모든 글 하단에 작성 방식이
            투명하게 공개됩니다.
          </li>
        </ul>
      </section>

      <section className="about-section">
        <h2 className="about-h2">4. 손익 책임</h2>
        <p className="about-desc">
          사이트 콘텐츠를 참고한 투자 결정으로 발생한 <strong>손익·기회비용·세금 등 모든 결과의 책임은
          전적으로 투자자 본인에게 있습니다.</strong> Daily ETF Pulse 편집팀·운영자는 이용자의 투자 결과에 대해
          어떠한 법적·재정적 책임도 지지 않습니다.
        </p>
      </section>

      <section className="about-section">
        <h2 className="about-h2">5. 광고·제휴 링크 고지</h2>
        <p className="about-desc">
          사이트는 운영비 충당을 위해 다음 형태의 광고·제휴 수익을 받고 있습니다.
        </p>
        <ul className="about-list">
          <li>
            <strong>Google AdSense</strong> — 페이지 내 디스플레이 광고. 광고 내용·게재 위치는 Google이
            이용자 관심사에 맞게 자동 선정합니다.
          </li>
          <li>
            <strong>쿠팡 파트너스</strong> — 일부 자료 페이지(/resources, /guide 등)의 책·도구 추천 링크.
            이용자가 링크를 통해 구매 시 사이트에 일정 수수료가 발생합니다. 해당 페이지에는 별도 고지
            문구가 노출됩니다.
          </li>
          <li>
            <strong>금융 제휴</strong> — 일부 콘텐츠에 운용사·증권사 제휴 카드가 포함될 수 있으며, 이 경우
            카드 상단에 제휴 사실이 표시됩니다.
          </li>
        </ul>
        <p className="about-desc" style={{ marginTop: '1rem' }}>
          광고·제휴 수익은 콘텐츠의 객관성·편집권에 영향을 주지 않으며, 분석 대상 ETF 선정은 거래량·뉴스·검색
          의도에 따라 자동 결정됩니다.
        </p>
      </section>

      <section className="about-section">
        <h2 className="about-h2">6. 저작권·인용</h2>
        <ul className="about-list">
          <li>사이트의 모든 콘텐츠(글·차트·표·이미지)는 별도 표시 없는 한 Daily ETF Pulse에 저작권이 있습니다.</li>
          <li>비상업적 목적의 단문 인용 시 출처(URL)를 명시해주세요.</li>
          <li>상업적 재배포·전문 복제는 사전 허락이 필요합니다 (<Link href="/contact" style={{ color: 'var(--accent-gold)', textDecoration: 'underline' }}>연락처</Link>).</li>
          <li>KRX·한국은행·DART 등 공공데이터는 각 기관의 이용약관에 따릅니다.</li>
        </ul>
      </section>

      <section className="about-section">
        <h2 className="about-h2">7. 외부 링크</h2>
        <p className="about-desc">
          사이트는 운용사 홈페이지·뉴스 기사·공공기관 자료 등 외부 사이트 링크를 제공할 수 있습니다.
          외부 사이트의 콘텐츠·정확성·서비스 이용에 대한 책임은 해당 사이트에 있으며, Daily ETF Pulse는
          외부 사이트 내용에 대해 보증하지 않습니다.
        </p>
      </section>

      <section className="about-section">
        <p className="about-desc" style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-dim)' }}>
          관련 페이지: <Link href="/about" style={{ color: 'var(--accent-gold)', textDecoration: 'underline' }}>편집팀 소개</Link>{' · '}
          <Link href="/privacy" style={{ color: 'var(--accent-gold)', textDecoration: 'underline' }}>개인정보처리방침</Link>{' · '}
          <Link href="/contact" style={{ color: 'var(--accent-gold)', textDecoration: 'underline' }}>연락처</Link>
        </p>
      </section>
    </article>
  );
}
