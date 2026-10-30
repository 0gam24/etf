/**
 * Schema.org JSON-LD 빌더.
 *   - Article / NewsArticle / Person / Breadcrumb / FAQPage / FinancialProduct
 *   - 모든 빌더는 dependency-free, 서버·클라이언트 양쪽에서 호출 가능.
 *   - URL은 절대경로 권장 (Google 권장사항).
 */

const SITE = process.env.SITE_URL || 'https://iknowhowinfo.com';
const SITE_NAME = 'Daily ETF Pulse';

/**
 * 로고는 정사각형이어야 한다. 구글 Organization 가이드: "이미지는 최소 112x112픽셀"
 *   (docs/G-구글-공식가이드/05-structured-data-구조화데이터/organization.md). 예전 og-logo.png 는 600x60 가로형이라
 *   기준에 못 미쳤다. 2026-10-30 앱 아이콘(180x180)을 고정 주소로 복사해 쓴다.
 */
const ORG_LOGO = `${SITE}/logo-square.png`;
const ORG_LOGO_SIZE = 180;
/** 화면 바이라인의 저자(리서치팀). 발행처(#organization)와 이름이 달라 같은 @id 를 쓰면 한 엔티티에 이름이 둘이 된다 */
const RESEARCH_TEAM_ID = `${SITE}/#research-team`;
const RESEARCH_TEAM_NAME = 'Daily ETF Pulse 리서치팀';

// parentOrganization(스마트데이터샵) 선언은 2026-09-30 제거. 자매 사이트끼리 모든 페이지에서
//   서로를 가리키는 네트워크 신호를 줄이기 위해 layout Organization 스키마·푸터 백링크와 함께 뺐다.
//   (형제 사이트 smartdatashop 이 이 패턴을 AdSense 거절 원인으로 기록: 05 smartdatashop.kr/CLAUDE.md)

function abs(path: string): string {
  if (!path) return SITE;
  if (path.startsWith('http')) return path;
  return path.startsWith('/') ? `${SITE}${path}` : `${SITE}/${path}`;
}

export interface BreadcrumbItem { name: string; href: string }

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      // 첫 단계가 홈이면 "홈" 대신 사이트 이름. 네이버 BreadcrumbList 가이드: "\"top\", \"홈\" 등 일반적인 단어가 아닌"
      //   설명 텍스트 (docs/H-네이버-공식가이드/08-구조화된 데이터 마크업). 화면의 "홈" 표기는 그대로 둔다 (2026-10-30)
      name: idx === 0 && it.href === '/' ? SITE_NAME : it.name,
      // 마지막 항목(현재 페이지)은 item 생략 — Google 가이드 허용 규칙,
      // 현재 URL이 canonical과 중복 명시되는 것을 피함 (D3 문서 규칙)
      ...(idx < items.length - 1 ? { item: abs(it.href) } : {}),
    })),
  };
}

export interface ArticleAuthor {
  name: string;
  /** /author/{id} 경로 (있으면 sameAs/url로 노출) */
  authorId?: string;
  /** 직함·소속 (있으면 jobTitle) */
  title?: string;
}

export interface ArticleSchemaInput {
  type?: 'Article' | 'NewsArticle' | 'AnalysisNewsArticle';
  headline: string;
  description: string;
  /** 절대 또는 상대경로 모두 허용 */
  url: string;
  datePublished: string;
  dateModified?: string;
  /** 1개 이상 권장 (1200x630 권장). 절대/상대 모두 허용. */
  images?: string[];
  author: ArticleAuthor;
  /** ETF 티커 등 키워드 */
  keywords?: string[];
  /** 카테고리(섹션) 라벨 — 예: '오늘의 관전포인트' */
  section?: string;
  /**
   * 외부 근거 자료 — schema.org/citation (E-E-A-T·생성형 검색 인용 신호).
   *   URL만 주는 것보다 기관명을 함께 주는 편이 낫다. 검색엔진·답변엔진이
   *   "이 글의 근거가 국세청"이라는 것을 URL 파싱 없이 바로 읽는다.
   */
  citations?: Array<{ name: string; url: string }>;
  /**
   * 음성·요약 인용 대상 지정 (schema.org/speakable).
   *   true로 주면 H1과 정답블록(.answer-box)을 speakable로 표시한다.
   *   ⚠️ 정답블록이 실제로 렌더되는 글에서만 true를 줄 것. 마크업과 화면이 어긋나면
   *      구조화 데이터 위반이 된다. (AnswerBox는 answer 값이 있을 때만 렌더된다)
   */
  speakable?: boolean;
}

export function buildArticleSchema(input: ArticleSchemaInput) {
  const type = input.type || 'Article';
  // authorId가 없으면 개인이 아니라 발행 조직이 저자다.
  //   기존에는 "Daily ETF Pulse 편집팀"이라는 팀 이름을 Person 타입으로, 게다가 url·@id 없이
  //   발행했다(가이드 238편 전부). 아무 데도 가리키지 않는 엔티티라 신뢰 신호로 작동하지 못했다.
  //   조직 저자는 사이트 전역 Organization(@id)과 연결해 해석 가능하게 만든다. (2026-08-12)
  const author = input.author.authorId
    ? {
        '@type': 'Person',
        name: input.author.name,
        ...(input.author.title ? { jobTitle: input.author.title } : {}),
        url: abs(`/author/${input.author.authorId}`),
      }
    : {
        // 2026-10-30: 저자(리서치팀)와 발행처(사이트)를 다른 @id 로 나눴다. 같은 @id 에 이름이 둘이면
        //   구글이 한 엔티티로 합치며 이름이 흔들린다(article.md 저자 권장사항, site-names.md 일관된 이름).
        '@type': 'Organization',
        '@id': input.author.name === RESEARCH_TEAM_NAME ? RESEARCH_TEAM_ID : `${SITE}/#organization`,
        name: input.author.name,
        url: abs('/about'),
        ...(input.author.name === RESEARCH_TEAM_NAME ? { parentOrganization: { '@id': `${SITE}/#organization` } } : {}),
      };

  return {
    '@context': 'https://schema.org',
    '@type': type,
    headline: input.headline.slice(0, 110), // Google 권장 110자
    description: input.description,
    // 기본 이미지도 PNG로 (스키마 image는 SVG를 권장하지 않는다)
    image: (input.images || [`${SITE}/og/default.png`]).map(abs),
    datePublished: input.datePublished,
    dateModified: input.dateModified || input.datePublished,
    author,
    publisher: {
      // 뉴스 매체가 아니라 정보 사이트라 가장 맞는 유형은 Organization (organization.md "가장 구체적인 하위유형", 2026-10-30)
      '@type': 'Organization',
      '@id': `${SITE}/#organization`,   // RootLayout Organization과 동일 entity 상호참조
      name: SITE_NAME,
      url: SITE,
      logo: {
        '@type': 'ImageObject',
        url: ORG_LOGO,
        width: ORG_LOGO_SIZE,
        height: ORG_LOGO_SIZE,
      },
      publishingPrinciples: `${SITE}/about`,
      correctionsPolicy: `${SITE}/about#corrections`,
    },
    // isBasedOn(자매 사이트 backref)은 뺐다. 가이드 본문은 그 사이트에서 파생된 글이
    // 아닌데도 238편 전부가 "원본은 smartdatashop"이라고 선언하고 있었다. 같은 노드에
    // "출처는 국세청"과 함께 실려 인용 신호가 흐려진다. (2026-08-12)
    mainEntityOfPage: { '@type': 'WebPage', '@id': abs(input.url) },
    ...(input.keywords?.length ? { keywords: input.keywords.join(', ') } : {}),
    ...(input.section ? { articleSection: input.section } : {}),
    ...(input.citations?.length
      ? { citation: input.citations.map(c => ({ '@type': 'WebPage', name: c.name, url: c.url })) }
      : {}),
    // speakable — 음성 어시스턴트·생성형 검색이 "이 페이지의 답"으로 읽어갈 구간 지정.
    //   AnswerBox(.answer-box)가 렌더될 때만 붙인다. 화면에 없는 것을 가리키면 안 된다.
    ...(input.speakable
      ? {
          speakable: {
            '@type': 'SpeakableSpecification',
            cssSelector: ['h1', '.answer-box'],
          },
        }
      : {}),
    inLanguage: 'ko-KR',
  };
}

export interface PersonSchemaInput {
  name: string;
  jobTitle: string;
  description: string;
  knowsAbout?: string[];
  url: string;
  /** /author/{id}/avatar.jpg 등 (없으면 생략) */
  image?: string;
}

export function buildPersonSchema(input: PersonSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: input.name,
    jobTitle: input.jobTitle,
    description: input.description,
    url: abs(input.url),
    ...(input.image ? { image: abs(input.image) } : {}),
    ...(input.knowsAbout?.length ? { knowsAbout: input.knowsAbout } : {}),
    worksFor: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE,
    },
  };
}

export interface FaqItem { question: string; answer: string }

export function buildFaqSchema(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(i => ({
      '@type': 'Question',
      name: i.question,
      acceptedAnswer: { '@type': 'Answer', text: i.answer },
    })),
  };
}

export interface FinancialProductInput {
  /** ETF 정식명 */
  name: string;
  /** ETF 코드 (예: 449450) */
  code: string;
  /** 운용사 */
  provider?: string;
  description: string;
  url: string;
  category?: string; // ETF / 인덱스펀드 등
}

// 2026-10-30: offers(가격·InStock·priceValidUntil)를 뺐다. 이 사이트는 ETF를 팔지 않는데 판매가처럼 표시됐고,
//   priceValidUntil 이 지난 날짜였다. 구글 merchant-listing.md "쇼핑객이 제품을 구매할 수 있는 페이지에서만",
//   sd-policies.md "소유권, 제휴, 기본 목적을 왜곡하지 않습니다". 시세를 기계가 읽는 형태로 1,171쪽에 다시 내보내는
//   것도 줄인다(시세 원천 이용 조건 문제).
export function buildFinancialProductSchema(input: FinancialProductInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    name: input.name,
    identifier: input.code,
    tickerSymbol: input.code, // Google 금융 상품 인식 강화 (리치 스니펫)
    description: input.description,
    url: abs(input.url),
    category: input.category || 'ETF',
    ...(input.provider ? { provider: { '@type': 'Organization', name: input.provider } } : {}),
  };
}

// ── Dataset 스키마 (종목 사전 페이지용 — 가격·구성종목 데이터셋 마크업) ──

export interface DatasetSchemaInput {
  name: string;
  description: string;
  url: string;
  /** 데이터 갱신일 ISO */
  dateModified: string;
  /** 원본 데이터 (다시 게시한 공공데이터의 원본 페이지) */
  basedOn?: { name: string; url: string };
  /** 데이터 키워드 */
  keywords?: string[];
  /** 라이선스 (선택) */
  license?: string;
}

// 2026-10-30: 이 페이지를 만든 곳은 이 사이트이고, 시세는 공공데이터포털의 금융위원회 증권상품시세정보를 받아 다시
//   게시한 것이다. 예전에는 publisher 를 "한국거래소(KRX) 공공데이터 포털"로 적어 원천과 발행처가 뒤섞였다.
//   구글 dataset.md: 재게시한 데이터는 원본을 밝힌다(isBasedOn·sameAs). isAccessibleForFree 는 원천 이용 조건이
//   정리되기 전까지 단정하지 않는다.
export function buildDatasetSchema(input: DatasetSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: input.name,
    description: input.description,
    url: abs(input.url),
    dateModified: input.dateModified,
    inLanguage: 'ko-KR',
    ...(input.keywords?.length ? { keywords: input.keywords.join(', ') } : {}),
    ...(input.license ? { license: input.license } : {}),
    ...(input.basedOn
      ? { isBasedOn: { '@type': 'Dataset', name: input.basedOn.name, url: input.basedOn.url } }
      : {}),
    publisher: { '@type': 'Organization', '@id': `${SITE}/#organization`, name: SITE_NAME, url: SITE },
    creator: { '@type': 'Organization', '@id': `${SITE}/#organization`, name: SITE_NAME, url: SITE },
  };
}

// ── HowTo 스키마 (가이드의 단계별 콘텐츠용) ──

export interface HowToStepInput {
  /** 단계 이름 (예: "1. ISA 계좌 개설") */
  name: string;
  /** 단계 본문 */
  text: string;
  /** 외부 자료/관련 페이지 (선택) */
  url?: string;
}

export interface HowToSchemaInput {
  name: string;
  description: string;
  url: string;
  steps: HowToStepInput[];
  /** 총 소요 시간 ISO 8601 duration (예: PT30M) */
  totalTime?: string;
}

export function buildHowToSchema(input: HowToSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: input.name,
    description: input.description,
    inLanguage: 'ko-KR',
    ...(input.totalTime ? { totalTime: input.totalTime } : {}),
    step: input.steps.map((s, idx) => ({
      '@type': 'HowToStep',
      position: idx + 1,
      name: s.name,
      text: s.text,
      ...(s.url ? { url: abs(s.url) } : {}),
    })),
    mainEntityOfPage: { '@type': 'WebPage', '@id': abs(input.url) },
  };
}

// ── ItemList 스키마 (인덱스 페이지의 목록 구조 표시) ──
//   /etf 인덱스 · /guide 인덱스 같은 list 페이지에 부착.
//   캐러셀 리치 결과 대상은 아니다. 구글 carousel.md: Course·Movie·Recipe·Restaurant 와 함께 쓸 때만 나온다 (2026-10-30 정정).

export interface CarouselItemInput {
  url: string;
  name: string;
  /** 이미지 URL (선택) — 절대/상대 모두 허용 */
  image?: string;
}

export function buildItemListSchema(items: CarouselItemInput[], listName?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    ...(listName ? { name: listName } : {}),
    itemListElement: items.map((it, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      url: abs(it.url),
      name: it.name,
      ...(it.image ? { image: abs(it.image) } : {}),
    })),
  };
}

/** JSON-LD를 안전하게 escape하여 HTML에 직접 inject 가능한 string으로 변환 */
export function jsonLd(obj: object): string {
  // </script> 인젝션 방지
  return JSON.stringify(obj).replace(/</g, '\\u003c');
}

// ── SoftwareApplication 스키마 (계산기 도구 페이지, 2026-10-14) ──
//   네이버 소프트웨어 마크업은 name·applicationCategory 가 필수라 충족한다. 구글은 평점(aggregateRating)이나
//   리뷰가 있어야 리치 결과 대상인데, 평점을 지어낼 수 없으므로 구글 리치 결과는 기대하지 않고 네이버용으로 둔다 (2026-10-30).
export function buildSoftwareAppSchema(input: { name: string; url: string; description: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: input.name,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    url: abs(input.url),
    inLanguage: 'ko-KR',
    description: input.description,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
    publisher: { '@type': 'Organization', '@id': `${SITE}/#organization`, name: SITE_NAME },
  };
}
