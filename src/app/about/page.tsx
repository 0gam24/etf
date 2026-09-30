import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import { AUTHOR_LIST, PUBLISHER, AI_DISCLOSURE } from '@/lib/authors';
import { getAllEtfSlugs } from '@/lib/data';
import { getSiteLastModified } from '@/lib/posts';
import { jsonLd } from '@/lib/schema';
import { buildPageMetadata, SITE_NAME, SITE_URL } from '@/lib/site-meta';

// title에 브랜드명을 넣지 않는다 — layout의 template이 '| Daily ETF Pulse'를 자동으로 붙인다.
export const metadata: Metadata = buildPageMetadata({
  title: '편집팀 소개',
  description:
    'Daily ETF Pulse의 발행·검수 책임, 분석을 맡는 AI 분석 에이전트, 데이터 출처(KRX·한국은행 ECOS·DART), 콘텐츠 선정 기준과 정정 정책을 한 페이지에 정리합니다. 모든 글은 편집팀이 검수해 발행합니다.',
  url: '/about',
  keywords: ['Daily ETF Pulse 소개', 'AI 분석 에이전트', 'ETF 정보 출처', '데이터 출처 공개', '발행 원칙'],
});

/** 일일 시황 글이 이 기간(일) 넘게 새로 나오지 않으면 '지난 기록' 안내를 붙인다. */
const DAILY_ARCHIVE_AFTER_DAYS = 30;

/**
 * 일일 시황 글(pulse·surge·flow·income·breaking 등)의 발행 상태.
 *   날짜를 문구에 박지 않고 content/ 의 마지막 글 날짜에서 파생한다.
 *   빌드 시점 기준으로 계산 (/about 은 정적 페이지, 매 배포마다 다시 구워짐).
 */
function getDailyPostStatus(): { archived: boolean; lastLabel: string | null } {
  const last = getSiteLastModified();
  if (!last || isNaN(last.getTime())) return { archived: false, lastLabel: null };
  const ageDays = (Date.now() - last.getTime()) / 86_400_000;
  const lastLabel = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(last);
  return { archived: ageDays > DAILY_ARCHIVE_AFTER_DAYS, lastLabel };
}

export default function AboutPage() {
  // 종목 수는 data/etf-slug-map.json(슬러그 매핑 SSoT)에서 파생 — 숫자 하드코딩 금지.
  const etfCount = getAllEtfSlugs().length;
  const etfUniverse = etfCount > 0
    ? `KRX 상장 ETF ${etfCount.toLocaleString('ko-KR')}종`
    : 'KRX 상장 ETF 전 종목';
  const daily = getDailyPostStatus();

  // 사이트 운영 Organization schema (E-E-A-T 강화)
  //   layout.tsx ORG_SCHEMA 와 같은 entity — @id 를 공유하고 이름·url·parentOrganization 을 맞춘다.
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    description: PUBLISHER.description,
    publishingPrinciples: `${SITE_URL}/about`,
    diversityPolicy: `${SITE_URL}/about`,
    correctionsPolicy: `${SITE_URL}/about`,
    actionableFeedbackPolicy: `${SITE_URL}/about`,
    inLanguage: 'ko-KR',
    parentOrganization: {
      '@type': 'Organization',
      name: '스마트데이터샵',
      url: 'https://smartdatashop.kr',
    },
  };

  return (
    <article className="about-page animate-fade-in">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(orgSchema) }} />

      <Breadcrumbs items={[{ name: '홈', href: '/' }, { name: '편집팀 소개', href: '/about' }]} />

      <header className="about-hero">
        <div className="about-eyebrow">ABOUT</div>
        <h1 className="about-title">Daily ETF Pulse 편집팀 소개</h1>
        <p className="about-tagline">
          Daily ETF Pulse는 ETF·세금·연금 계좌에 관한 궁금증을 공식 데이터와 1차 출처로 풀어 쓰는 데이터 저널입니다. 매일 아침 투자자들이 실제로 묻는 질문을 골라 새 가이드로 정리하고, 한국거래소(KRX) 상장 ETF를 같은 구조로 모은 종목 사전을 운영합니다. 모든 글에 출처와 기준일을 밝히며, 발행·검수 책임은 편집팀에 있습니다.
        </p>
      </header>

      <section className="about-section">
        <h2 className="about-h2">발행 원칙</h2>
        <ul className="about-list">
          <li><strong>데이터 우선</strong>: 모든 분석은 KRX 일별 시세, 운용사 공시, 한국은행 ECOS, 국세청·금융감독원 안내 등 공식 출처를 명시합니다.</li>
          <li><strong>AI 작성 투명 공개</strong>: 본문은 데이터 기반 AI 분석 에이전트가 작성하며, 글마다 데이터 출처와 갱신 시점을 함께 표시합니다.</li>
          <li><strong>발행 책임</strong>: 검수·정정·발행 책임은 Daily ETF Pulse 편집팀에 있습니다. 오류 제보는 환영합니다.</li>
          <li><strong>투자 권유 아님</strong>: 모든 콘텐츠는 정보 제공 목적이며, 투자 권유가 아닙니다. 결정과 손익의 책임은 투자자 본인에게 있습니다.</li>
        </ul>
      </section>

      {/* Why 투명화 — Google "유용한 콘텐츠" 가이드 권장: 사용자 의도 vs SEO 의도 구분 */}
      <section className="about-section">
        <h2 className="about-h2">왜 이 ETF·이 주제를 다루나, 콘텐츠 선택 기준</h2>
        <p className="about-desc">
          주제는 검색 순위를 노리고 고르지 않습니다. <strong>투자자들이 실제로 반복해서 묻는 질문과 시장 데이터</strong>에서 출발하며, 자료 종류별 기준은 다음과 같습니다.
        </p>
        <ul className="about-list">
          <li><strong>가이드 (guide)</strong>: 네이버 지식iN 등에서 반복되는 ETF·주식·코인·세금·연금 질문을 골라 매일 아침 새로 씁니다. 국세청·금융감독원·국민연금공단·KRX·운용사 공시처럼 주제를 관할하는 기관 자료로 확인한 내용만 싣습니다.</li>
          <li><strong>종목 사전 (/etf)</strong>: {etfUniverse}. 어떤 종목을 찾아도 같은 구조로 정보를 정리하며, 시세는 실시간이 아닌 KRX 일별 종가 기준입니다.</li>
          <li><strong>오늘의 관전포인트 (pulse)</strong>: KRX 일별 거래량 TOP 3 + 섹터 자금 흐름 1위. 시장이 실제로 움직인 종목·섹터를 대상으로 합니다.</li>
          <li><strong>급등 분석 (surge)</strong>: 거래량 z-score 80+ 또는 등락률 상위 1종. 단기 변동성이 큰 종목의 원인 검증.</li>
          <li><strong>속보 (breaking)</strong>: 거래량 TOP 3 ETF + 관련 뉴스. 사용자가 &quot;왜 움직였나&quot; 즉시 알고 싶을 만한 종목.</li>
          <li><strong>자금 흐름 (flow)</strong>: 섹터별 거래대금 누적 1위 + 외국인 순매매. 주간 추세를 추적하는 사용자가 필요로 하는 자료.</li>
          <li><strong>월배당·커버드콜 (income)</strong>: 분배율 + 안정성 등급 + 계좌별 세후 시뮬레이션. 4050·은퇴자 캐시플로 설계 의도.</li>
        </ul>
        <p className="about-desc" style={{ marginTop: '1rem' }}>
          ※ 특정 상품을 알리려고 주제를 고르지 않으며, 모든 글은 편집팀이 검수한 뒤 발행합니다.
          {daily.archived && daily.lastLabel && (
            <> 일일 시황 글(오늘의 관전포인트·급등·속보·자금 흐름·월배당)은 {daily.lastLabel} 이후 새로 발행하지 않으며, 지난 글은 기준일과 함께 그대로 열람할 수 있습니다.</>
          )}
        </p>
      </section>

      <section className="about-section">
        <h2 className="about-h2">분석 방법론</h2>
        <p className="about-desc">
          공식 데이터셋(KRX 일별 시세·운용사 공시·한국은행 ECOS·국세청 세법)을 입력으로, 정량 지표(거래량 z-score·섹터 자금 흐름 누적·분배 변동성·계좌별 세후 시뮬레이션 등)를 계산해 분석 결과를 산출합니다. 편집팀이 산출물을 검수한 뒤 발행하며, 출처와 갱신 시점을 글마다 함께 노출합니다.
        </p>
        <ul className="about-list" style={{ marginTop: '0.75rem' }}>
          <li><strong>거래량·등락률 시계열</strong>: KRX 일별 시세에서 5/20/60일 이동평균 대비 이탈률 계산.</li>
          <li><strong>분배 안정성</strong>: 12개월 분배 변동성 + 기초자산 변동성 가중 결합.</li>
          <li><strong>계좌별 세후 수익률</strong>: IRP·ISA·연금저축·일반계좌 한도·세제 매트릭스 적용 시뮬레이션.</li>
          <li><strong>거시 지표 결합</strong>: 한국은행 ECOS 기준금리·환율·CPI 변화를 섹터 자금 흐름과 함께 해석.</li>
          <li><strong>세금·계좌 제도</strong>: 법령과 국세청·금융감독원·국민연금공단 안내를 기준일과 함께 인용.</li>
        </ul>
      </section>

      {/* SEO.md §10 — AI 분석 에이전트 투명 공개. 단일 소스: agents/personas.js → src/lib/authors.ts */}
      <section className="about-section" aria-labelledby="about-agents-heading">
        <h2 id="about-agents-heading" className="about-h2">분석을 맡는 AI 에이전트</h2>
        <p className="about-desc">
          이 사이트의 글은 실존 인물이 아닌 데이터 기반 AI 분석 에이전트가 작성하고, 편집팀이 검수해 발행합니다. 시황 분석 글은 아래 에이전트가 다루는 데이터와 분석 영역에 따라 나눠 맡으며, 에이전트마다 입력 데이터와 분석 방법을 상세 페이지에 공개합니다.
        </p>
        <ul className="about-list">
          {AUTHOR_LIST.map(a => (
            <li key={a.id}>
              <strong><Link href={`/author/${a.id}`}>{a.name}</Link></strong> · {a.title}: {a.modelDescription}
            </li>
          ))}
        </ul>
        <p className="about-desc" style={{ marginTop: '1rem', marginBottom: 0 }}>
          {AI_DISCLOSURE}
        </p>
      </section>

      <section className="about-section">
        <h2 className="about-h2">발행·검수 책임</h2>
        <div className="about-publisher-card">
          <h3 className="about-publisher-name">{PUBLISHER.name}</h3>
          <p className="about-publisher-desc">{PUBLISHER.description}</p>
          <p className="about-publisher-disclosure">
            발행·검수·정정 책임은 Daily ETF Pulse 편집팀에 있습니다. 투자 참고 자료이며, 모든 투자 결정의 책임은 투자자 본인에게 있습니다.
          </p>
        </div>
      </section>

      <section className="about-section">
        <h2 className="about-h2">오류 제보·문의</h2>
        <p className="about-desc">
          분석 오류·데이터 정정 요청은 환영합니다. <Link href="/contact">연락처</Link> 페이지의 이메일로 알려 주시면 검토 후 정정 사항을 글에 반영합니다.
        </p>
      </section>
    </article>
  );
}
