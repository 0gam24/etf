import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import { PUBLISHER } from '@/lib/authors';
import { getAllEtfSlugs } from '@/lib/data';
import { jsonLd } from '@/lib/schema';
import { buildPageMetadata, SITE_NAME, SITE_URL } from '@/lib/site-meta';

// title에 브랜드명을 넣지 않는다 — layout의 template이 '| Daily ETF Pulse'를 자동으로 붙인다.
// 2026-10-14: 예전 일별 시황 체계(거래량 z-score·AI 분석 에이전트 7명) 설명을 걷어 내고 지금 운영하는 내용으로 다시 썼다.
//   같은 날 오후: 발행 주체 이름을 리서치팀으로 바꾸고, 일일 시황 글 중단 안내 문장을 뺐다(운영자 지시).
export const metadata: Metadata = buildPageMetadata({
  title: '리서치팀 소개',
  description:
    'Daily ETF Pulse가 어떤 자료로 ETF 종목 사전·같은 지수 비교·세금 가이드를 만드는지, 데이터 산출과 검증 원칙, 출처 표기, 정정 정책, 발행 책임을 한 페이지에 정리했습니다. 오류를 알리는 방법도 함께 안내합니다.',
  url: '/about',
  keywords: ['Daily ETF Pulse 소개', 'ETF 정보 출처', '데이터 검증 원칙', '정정 정책', '발행 원칙'],
});

export default function AboutPage() {
  // 종목 수는 data/etf-slug-map.json(슬러그 매핑 SSoT)에서 파생 — 숫자 하드코딩 금지.
  const etfCount = getAllEtfSlugs().length;
  const etfUniverse = etfCount > 0
    ? `KRX 상장 ETF ${etfCount.toLocaleString('ko-KR')}종`
    : 'KRX 상장 ETF 전 종목';

  // 사이트 운영 Organization schema — layout.tsx ORG_SCHEMA 와 같은 entity(@id 공유)
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: ['데일리 ETF 펄스', 'iknowhowinfo.com'],
    url: SITE_URL,
    description: PUBLISHER.description,
    publishingPrinciples: `${SITE_URL}/about`,
    correctionsPolicy: `${SITE_URL}/about#corrections`,
    actionableFeedbackPolicy: `${SITE_URL}/contact`,
    inLanguage: 'ko-KR',
  };

  return (
    <article className="about-page animate-fade-in">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(orgSchema) }} />

      <Breadcrumbs items={[{ name: '홈', href: '/' }, { name: '리서치팀 소개', href: '/about' }]} />

      <header className="about-hero">
        <div className="about-eyebrow">ABOUT</div>
        <h1 className="about-title">Daily ETF Pulse 리서치팀 소개</h1>
        <p className="about-tagline">
          Daily ETF Pulse는 한국거래소(KRX)에 상장된 ETF를 상품별로 정리한 종목 사전, 같은 지수를 따르는 ETF 사이의 비교,
          그리고 ETF를 어느 계좌에서 사고팔 때 세금이 어떻게 달라지는지를 1차 출처로 풀어 쓰는 가이드를 운영합니다.
          세법·한도가 바뀌거나 운용사 공시가 새로 나오면 해당 가이드와 비교 페이지를 다시 확인해 반영합니다.
          모든 수치에는 기준일과 출처를 붙이고, 틀린 내용은 확인하는 대로 고칩니다.
        </p>
      </header>

      <section className="about-section">
        <h2 className="about-h2">발행 원칙</h2>
        <ul className="about-list">
          <li><strong>1차 출처 우선</strong>: 수치와 제도 설명은 한국거래소, 금융감독원 전자공시(DART), 금융투자협회 공시, 운용사 투자설명서, 국세청·법령 같은 관할 기관 자료를 근거로 하고, 근거 문서의 주소를 글에 남깁니다.</li>
          <li><strong>출처 대조</strong>: 수치와 조항은 글에 적은 1차 출처 문서를 근거로 하고, 확인하지 못한 값은 싣지 않습니다.</li>
          <li><strong>발행·정정 책임</strong>: 발행과 정정의 책임은 Daily ETF Pulse 리서치팀에 있습니다.</li>
          <li><strong>투자 권유 아님</strong>: 모든 콘텐츠는 정보 제공 목적이며 매수·매도 권유가 아닙니다. 투자 결정과 손익의 책임은 투자자 본인에게 있습니다.</li>
        </ul>
      </section>

      <section className="about-section" id="editorial-method" aria-labelledby="about-method-heading">
        <h2 id="about-method-heading" className="about-h2">데이터 산출과 검증 원칙</h2>
        <p className="about-desc">
          페이지 종류마다 쓰는 자료와 확인 방법이 다릅니다. 공통으로, 계산에 쓴 입력값과 기준일을 화면에 함께 적어 독자가 같은 계산을 다시 해 볼 수 있게 합니다.
        </p>
        <ul className="about-list" style={{ marginTop: '0.75rem' }}>
          <li><strong>종목 사전 ({etfUniverse})</strong>: 종목코드·표준코드는 한국거래소 상장 목록, 종가·NAV·괴리율은 공공데이터포털의 금융위원회 증권상품시세정보를 쓰며 시세 기준일을 표시합니다. 실시간 시세가 아닙니다. 투자 대상·총보수·분배 기준일 같은 상품 개요는 운용사 상품 페이지와 투자설명서로 확인한 종목에만 싣습니다.</li>
          <li><strong>계좌별 세금 표와 계산기</strong>: 일반 계좌, 중개형 ISA, 연금저축·IRP의 과세 방식은 소득세법·조세특례제한법과 국세청 안내를 기준으로 합니다. 상품별 과세 구분은 상품 이름과 투자 대상으로 나눈 일반 규칙이라, 최종 확인은 운용사 상품 페이지의 과세 항목으로 하도록 안내합니다.</li>
          <li><strong>같은 지수 ETF 비교</strong>: 두 상품이 같은 기초지수를 따르는지 운용사 문서로 확인한 쌍만 비교합니다.</li>
          <li><strong>가이드</strong>: 관할 기관의 안내와 법령 조문, 운용사 공시를 근거로 쓰고, 근거 문서를 글 아래 참고 자료에 남깁니다. 본문을 실제로 고친 날은 수정일로 따로 표시합니다.</li>
        </ul>
      </section>

      <section className="about-section">
        <h2 className="about-h2">다루는 주제를 고르는 기준</h2>
        <p className="about-desc">
          검색창에 실제로 반복해서 입력되는 질문 가운데, 상품 공시나 기관 안내를 찾아 읽어야만 답할 수 있는 것을 고릅니다.
          상품명으로 묻는 질문(투자 대상, 총보수, 분배 일정)은 종목 사전이, 비슷한 상품 사이의 선택은 비교 페이지가,
          계좌·세금처럼 판단과 계산이 필요한 질문은 가이드와 계산기가 받습니다. 특정 상품을 알리려고 주제를 고르지 않습니다.
        </p>
      </section>

      <section className="about-section">
        <h2 className="about-h2">발행·정정 책임</h2>
        <div className="about-publisher-card">
          <h3 className="about-publisher-name">{PUBLISHER.name}</h3>
          <p className="about-publisher-desc">{PUBLISHER.description}</p>
          <p className="about-publisher-disclosure">
            발행·정정 책임은 Daily ETF Pulse 리서치팀에 있습니다. 투자 참고 자료이며, 모든 투자 결정의 책임은 투자자 본인에게 있습니다.
          </p>
        </div>
      </section>

      <section className="about-section" id="corrections">
        <h2 className="about-h2">오류 제보와 정정</h2>
        <p className="about-desc">
          수치나 제도 설명이 틀렸거나 기준일이 지난 내용을 발견하시면 <Link href="/contact">연락처</Link>로 알려 주세요.
          1차 출처로 다시 확인한 뒤 본문을 고치고, 고친 날을 수정일로 표시합니다.
        </p>
      </section>
    </article>
  );
}
