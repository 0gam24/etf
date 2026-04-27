/**
 * Schema.org JSON-LD 빌더.
 *   - Article / NewsArticle / Person / Breadcrumb / FAQPage / FinancialProduct
 *   - 모든 빌더는 dependency-free, 서버·클라이언트 양쪽에서 호출 가능.
 *   - URL은 절대경로 권장 (Google 권장사항).
 */

const SITE = process.env.SITE_URL || 'https://iknowhowinfo.com';
const SITE_NAME = 'Daily ETF Pulse';
const ORG_LOGO = `${SITE}/og-logo.png`;

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
      item: abs(it.href),
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
}

export function buildArticleSchema(input: ArticleSchemaInput) {
  const type = input.type || 'Article';
  const author = input.author.authorId
    ? {
        '@type': 'Person',
        name: input.author.name,
        ...(input.author.title ? { jobTitle: input.author.title } : {}),
        url: abs(`/author/${input.author.authorId}`),
      }
    : { '@type': 'Person', name: input.author.name };

  return {
    '@context': 'https://schema.org',
    '@type': type,
    headline: input.headline.slice(0, 110), // Google 권장 110자
    description: input.description,
    image: (input.images || [`${SITE}/api/og`]).map(abs),
    datePublished: input.datePublished,
    dateModified: input.dateModified || input.datePublished,
    author,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: ORG_LOGO },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': abs(input.url) },
    ...(input.keywords?.length ? { keywords: input.keywords.join(', ') } : {}),
    ...(input.section ? { articleSection: input.section } : {}),
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
    publisher: {
      '@type': 'Organization',
      name: input.publisher || SITE_NAME,
      ...(input.publisher ? {} : { url: SITE }),
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

/** JSON-LD를 안전하게 escape하여 HTML에 직접 inject 가능한 string으로 변환 */
export function jsonLd(obj: object): string {
  // </script> 인젝션 방지
  return JSON.stringify(obj).replace(/</g, '\\u003c');
}
