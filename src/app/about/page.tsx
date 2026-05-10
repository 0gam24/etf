import type { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';
import { PUBLISHER } from '@/lib/authors';
import { buildBreadcrumbSchema, jsonLd } from '@/lib/schema';

export const metadata: Metadata = {
  title: '편집팀 소개 — Daily ETF Pulse',
  description:
    'Daily ETF Pulse의 발행·검수 책임, 데이터 출처(KRX·한국은행 ECOS·DART), 분석 방법론, 정정 정책을 한 페이지에 정리합니다.',
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
          Daily ETF Pulse는 한국거래소(KRX) 공공데이터를 기반으로 ETF 시세·자금 흐름·분배 정보를 매일 자동 정리·발행하는 데이터 저널입니다. 모든 분석은 출처와 갱신 시점을 함께 노출하며, 발행·검수 책임은 편집팀에 있습니다.
        </p>
      </header>

      <section className="about-section">
        <h2 className="about-h2">발행 원칙</h2>
        <ul className="about-list">
          <li><strong>데이터 우선</strong> — 모든 분석은 KRX 일별 시세, 운용사 공시, 한국은행 ECOS 등 공식 데이터 출처를 명시합니다.</li>
          <li><strong>자동 분석 투명 공개</strong> — 본문은 데이터 입력 기반 자동 분석으로 작성되며, 글마다 데이터 출처와 갱신 시점을 노출합니다.</li>
          <li><strong>발행 책임</strong> — 검수·정정·발행 책임은 Daily ETF Pulse 편집팀에 있습니다. 오류 제보는 환영합니다.</li>
          <li><strong>투자 권유 아님</strong> — 모든 콘텐츠는 정보 제공 목적이며, 투자 권유가 아닙니다. 결정과 손익의 책임은 투자자 본인에게 있습니다.</li>
        </ul>
      </section>

      {/* Why 투명화 — Google "유용한 콘텐츠" 가이드 권장: 사용자 의도 vs SEO 의도 구분 */}
      <section className="about-section">
        <h2 className="about-h2">왜 이 ETF·이 주제를 다루나 — 콘텐츠 선택 기준</h2>
        <p className="about-desc">
          매일 다루는 ETF·주제는 다음 기준으로 자동 선정됩니다. 검색 순위 조작이 아니라, <strong>실제 시장에서 가장 활발하거나 사용자 결정에 영향이 큰 자료</strong>를 우선합니다.
        </p>
        <ul className="about-list">
          <li><strong>오늘의 관전포인트 (pulse)</strong> — KRX 일별 거래량 TOP 3 + 섹터 자금 흐름 1위. 시장이 실제로 움직인 종목·섹터를 대상으로 합니다.</li>
          <li><strong>급등 분석 (surge)</strong> — 거래량 z-score 80+ 또는 등락률 상위 1종. 단기 변동성이 큰 종목의 원인 검증.</li>
          <li><strong>속보 (breaking)</strong> — 거래량 TOP 3 ETF + 관련 뉴스. 사용자가 "왜 움직였나" 즉시 알고 싶을 만한 종목.</li>
          <li><strong>자금 흐름 (flow)</strong> — 섹터별 거래대금 누적 1위 + 외국인 순매매. 주간 추세를 추적하는 사용자가 필요로 하는 자료.</li>
          <li><strong>월배당·커버드콜 (income)</strong> — 분배율 + 안정성 등급 + 계좌별 세후 시뮬레이션. 4050·은퇴자 캐시플로 설계 의도.</li>
          <li><strong>가이드 (guide)</strong> — 검색 빈도 높은 5개 주제 (월배당·커버드콜·방산·AI/반도체·은퇴) 분기별 갱신.</li>
          <li><strong>종목 사전 (/etf)</strong> — KRX 1095종 전체. 사용자가 검색한 모든 종목에 동일 구조의 정보 제공.</li>
        </ul>
        <p className="about-desc" style={{ marginTop: '1rem' }}>
          ※ 이 기준은 <strong>거래량·뉴스·검색 의도</strong>가 트리거이며, 운영자가 임의로 "광고가 잘 붙는 종목"을 선정하지 않습니다. 분석 산출물은 편집팀이 검수한 후 발행됩니다.
        </p>
      </section>

      <section className="about-section">
        <h2 className="about-h2">분석 방법론</h2>
        <p className="about-desc">
          공식 데이터셋(KRX 일별 시세·운용사 공시·한국은행 ECOS·국세청 세법)을 입력으로, 정량 지표(거래량 z-score·섹터 자금 흐름 누적·분배 변동성·계좌별 세후 시뮬레이션 등)를 계산해 매일의 분석 결과를 산출합니다. 편집팀이 산출물을 검수한 뒤 발행하며, 출처와 갱신 시점을 글마다 함께 노출합니다.
        </p>
        <ul className="about-list" style={{ marginTop: '0.75rem' }}>
          <li><strong>거래량·등락률 시계열</strong> — KRX 일별 시세에서 5/20/60일 이동평균 대비 이탈률 계산.</li>
          <li><strong>분배 안정성</strong> — 12개월 분배 변동성 + 기초자산 변동성 가중 결합.</li>
          <li><strong>계좌별 세후 수익률</strong> — IRP·ISA·연금저축·일반계좌 한도·세제 매트릭스 적용 시뮬레이션.</li>
          <li><strong>거시 지표 결합</strong> — 한국은행 ECOS 기준금리·환율·CPI 변화를 섹터 자금 흐름과 함께 해석.</li>
        </ul>
      </section>

      <section className="about-section">
        <h2 className="about-h2">발행·검수 책임</h2>
        <div className="about-publisher-card">
          <h3 className="about-publisher-name">{PUBLISHER.name}</h3>
          <p className="about-publisher-desc">{PUBLISHER.description}</p>
          <p className="about-publisher-disclosure">
            본 사이트의 분석은 공공데이터를 입력으로 자동 생성됩니다. 발행·검수·정정 책임은 Daily ETF Pulse 편집팀에 있습니다. 투자 참고 자료이며, 모든 투자 결정의 책임은 투자자 본인에게 있습니다.
          </p>
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
