/**
 * Schema.org JSON-LD 빌더.
 *   - Article / NewsArticle / Person / Breadcrumb / FAQPage / FinancialProduct
 *   - 모든 빌더는 dependency-free, 서버·클라이언트 양쪽에서 호출 가능.
 *   - URL은 절대경로 권장 (Google 권장사항).
 */

const SITE = process.env.SITE_URL || 'https://iknowhowinfo.com';
const SITE_NAME = 'Daily ETF Pulse';

/**
 * Dataset의 외부 publisher 이름 → 공식 URL.
 *   시세 원천은 공공데이터포털(data.go.kr) ETF 시세 API다(src/app/api/etf/route.ts).
 *   여기에 없는 이름은 자사 URL로 폴백한다.
 */
const PUBLISHER_URLS: Record<string, string> = {
  '한국거래소(KRX) 공공데이터 포털': 'https://www.data.go.kr',
};
const ORG_LOGO = `${SITE}/og-logo.png`;

// smartdatashop network 자매 backref — 메인 사이트(1차 출처 데이터 저널) parentOrganization.
//   schema.org/Organization spec: 자매가 메인의 sub-organization이라는 신뢰 신호 + 검색엔진 entity 연결.
const PARENT_ORG = {
  '@type': 'Organization',
  name: '스마트데이터샵',
  url: 'https://smartdatashop.kr',
};

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
      name: it.name,
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
        '@type': 'Organization',
        '@id': `${SITE}/#organization`,
        name: input.author.name,
        url: abs('/about'),
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
      '@type': 'NewsMediaOrganization', // Google E-E-A-T 신뢰 신호
      '@id': `${SITE}/#organization`,   // RootLayout Organization과 동일 entity 상호참조
      name: SITE_NAME,
      url: SITE,
      logo: {
        '@type': 'ImageObject',
        url: ORG_LOGO,
        width: 600,  // Google 권장 — 최소 폭 명시
        height: 60,
      },
      publishingPrinciples: `${SITE}/about`,
      correctionsPolicy: `${SITE}/about`,
      parentOrganization: PARENT_ORG, // smartdatashop network 자매 신호
    },
    // isBasedOn(자매 사이트 backref)은 뺐다. 가이드 본문은 그 사이트에서 파생된 글이
    // 아닌데도 238편 전부가 "원본은 smartdatashop"이라고 선언하고 있었다. 같은 노드에
    // "출처는 국세청"과 함께 실려 인용 신호가 흐려진다. 자매 관계는 아래
    // publisher.parentOrganization이 이미 정확히 표현한다. (2026-08-12)
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
  /** 현재가 (마감 데이터). 있으면 offers 필드 추가 — Google 금융 리치 스니펫 */
  price?: number;
  /** 가격 기준일 (YYYY-MM-DD) */
  priceDate?: string;
}

export function buildFinancialProductSchema(input: FinancialProductInput) {
  const offers = (input.price && input.price > 0) ? {
    offers: {
      '@type': 'Offer',
      price: input.price,
      priceCurrency: 'KRW',
      ...(input.priceDate ? { priceValidUntil: input.priceDate } : {}),
      availability: 'https://schema.org/InStock',
    },
  } : {};

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
    ...offers,
  };
}

// ── Dataset 스키마 (종목 사전 페이지용 — 가격·구성종목 데이터셋 마크업) ──

export interface DatasetSchemaInput {
  name: string;
  description: string;
  url: string;
  /** 데이터 갱신일 ISO */
  dateModified: string;
  /** 출처 (예: "한국거래소(KRX) 공공데이터 포털") */
  publisher?: string;
  /** 데이터 키워드 */
  keywords?: string[];
  /** 라이선스 (선택) */
  license?: string;
}

export function buildDatasetSchema(input: DatasetSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: input.name,
    description: input.description,
    url: abs(input.url),
    dateModified: input.dateModified,
    inLanguage: 'ko-KR',
    isAccessibleForFree: true,
    ...(input.keywords?.length ? { keywords: input.keywords.join(', ') } : {}),
    ...(input.license ? { license: input.license } : {}),
    // 외부 출처를 publisher로 넘길 때도 url을 붙여 entity가 해석되게 한다.
    //   기존에는 custom publisher일 때 url을 빼서, /etf 1,160쪽의 publisher Organization이
    //   name만 있는 상태였다(2026-08-11 스키마 감사). 출처를 실제로 확인 가능하게 만드는
    //   신호라 E-E-A-T에도 유리하다.
    publisher: {
      '@type': 'Organization',
      name: input.publisher || SITE_NAME,
      url: input.publisher ? (PUBLISHER_URLS[input.publisher] || SITE) : SITE,
    },
    creator: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE,
    },
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

// ── ItemList / Carousel 스키마 (인덱스 페이지 — Google Carousel rich result) ──
//   /etf 인덱스 (TOP 거래량) · /guide 인덱스 (8 가이드) 같은 list 페이지에 부착.
//   Google Search Carousel 자격 (모바일 SERP에서 가로 스크롤 카드 노출).

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
