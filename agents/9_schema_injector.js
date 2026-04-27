/**
 * 9. SchemaInjector — Article / FAQPage / BreadcrumbList JSON-LD 자동 생성
 *
 *   YmylGuard 통과 이후 실행. 각 포스트의 프론트매터에 schema 필드를 추가해
 *   HarnessDeployer가 MDX 저장 시 함께 기록한다.
 *   프론트엔드(포스트 페이지)는 schema 필드를 <script type="application/ld+json">으로 렌더.
 *
 *   CTR 2배 효과(구글 리치 스니펫) + E-E-A-T 저자 신호.
 */

const state = require('../pipeline/state_manager');
const logger = require('../pipeline/logger');
const { PERSONAS } = require('./personas');

const AGENT_NAME = 'SchemaInjector';

function extractFaqs(content) {
  // **Q1: 질문** 다음 줄~다음 Q 전까지 답변
  const faqs = [];
  const regex = /\*\*Q\d+:\s*([^*]+?)\*\*\s*\n\s*([\s\S]*?)(?=\n\*\*Q\d+:|$)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const question = match[1].trim();
    const answer = match[2].trim().split(/\n\n/)[0].slice(0, 500);
    if (question && answer) faqs.push({ question, answer });
  }
  return faqs;
}

function buildArticleSchema(article, baseUrl) {
  const url = `${baseUrl}/${article.category}/${encodeURIComponent(article.slug)}`;
  const persona = PERSONAS[article.authorId] || null;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.keyword,
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    url,
    mainEntityOfPage: url,
    articleSection: article.category,
    keywords: (article.tickers || []).join(', '),
    author: persona ? {
      '@type': 'Person',
      name: persona.name,
      jobTitle: persona.title,
      description: persona.modelDescription || persona.title,
      url: `${baseUrl}/author/${persona.id}`,
      // AI 에이전트임을 schema에서 투명 공개 (E-E-A-T 정책)
      additionalType: 'https://schema.org/SoftwareApplication',
      applicationCategory: 'AnalyticsApplication',
    } : {
      '@type': 'Organization',
      name: 'Daily ETF Pulse',
      url: baseUrl,
    },
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: 'Daily ETF Pulse',
      url: baseUrl,
      logo: { '@type': 'ImageObject', url: `${baseUrl}/og-logo.png` },
      // 발행 책임 명시 — Google E-E-A-T 신뢰 신호
      publishingPrinciples: `${baseUrl}/about`,
      correctionsPolicy: `${baseUrl}/about`,
    },
  };
}

function buildFaqSchema(faqs) {
  if (!faqs || faqs.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

function buildBreadcrumbSchema(article, baseUrl) {
  const categoryNames = {
    pulse: '오늘의 관전포인트',
    surge: '급등 테마 분석',
    flow: '자금 흐름 리포트',
    income: '월배당·커버드콜',
  };
  const catName = categoryNames[article.category] || article.category;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: catName, item: `${baseUrl}/${article.category}` },
      { '@type': 'ListItem', position: 3, name: article.title, item: `${baseUrl}/${article.category}/${encodeURIComponent(article.slug)}` },
    ],
  };
}

async function run({ today, previousResults }) {
  logger.log(AGENT_NAME, '📐 JSON-LD 스키마 생성');

  const verified = previousResults?.YmylGuard?.verifiedArticles || [];
  if (verified.length === 0) return { summary: '스키마 생성 건너뜀', articles: [] };

  const baseUrl = process.env.SITE_URL || 'https://iknowhowinfo.com';
  const enriched = [];

  for (const article of verified) {
    const faqs = extractFaqs(article.content);
    const schemas = [
      buildArticleSchema(article, baseUrl),
      buildBreadcrumbSchema(article, baseUrl),
    ];
    const faqSchema = buildFaqSchema(faqs);
    if (faqSchema) schemas.push(faqSchema);

    const next = { ...article, schemas, faqCount: faqs.length };
    enriched.push(next);
    logger.log(AGENT_NAME, `  📐 [${article.category}] Article+Breadcrumb${faqSchema ? '+FAQPage(' + faqs.length + ')' : ''}`);
  }

  previousResults.YmylGuard.verifiedArticles = enriched;
  logger.success(AGENT_NAME, `${enriched.length}개 글에 JSON-LD 주입`);

  return {
    summary: `${enriched.length}개 글 Schema.org 구조화 데이터`,
    articles: enriched,
  };
}

module.exports = { run };
