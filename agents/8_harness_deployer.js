/**
 * 8️⃣ HarnessDeployer (PulseDeployer)
 *   - 검증 완료 글을 category 폴더의 MDX 파일로 저장
 *   - 프론트매터에 tickers, templateType, pulseDate 등 Pulse 전용 메타 포함
 *   - Google Indexing API 훅 (Phase 5에서 실구현)
 */

const fs = require('fs');
const path = require('path');
const state = require('../pipeline/state_manager');
const logger = require('../pipeline/logger');
const { submitIndexing } = require('../pipeline/google_indexing');

const AGENT_NAME = 'HarnessDeployer';

const CATEGORY_KEYWORDS = {
  pulse: ['ETF 관전포인트', '오늘의 ETF', 'ETF 브리핑'],
  surge: ['급등 ETF', '거래량 급등', 'ETF 급등 이유'],
  flow: ['자금 흐름', '섹터 로테이션', '기관 수급'],
  income: ['월배당 ETF', '커버드콜', 'IRP ETF', 'ISA 필수 종목'],
  breaking: ['ETF 속보', '거래량 TOP', 'ETF 뉴스', '당일 ETF 분석'],
};

function yamlEscape(s) {
  return String(s).replace(/"/g, '\\"');
}

function saveAsMdx(article, chartData, adPlan, affiliateMatch, today) {
  const extraKeywords = CATEGORY_KEYWORDS[article.category] || [];
  const keywordsYaml = [article.keyword, ...extraKeywords]
    .map(k => `  - "${yamlEscape(k)}"`)
    .join('\n');

  const tickersYaml = (article.tickers || [])
    .map(t => `  - "${yamlEscape(t)}"`)
    .join('\n');

  const authorLine = article.author
    ? `author: "${yamlEscape(article.author)}"`
    : `author: "Daily ETF Pulse"`;
  const authorIdLine = article.authorId ? `authorId: "${yamlEscape(article.authorId)}"` : '';
  const schemasLine = article.schemas
    ? `schemas: ${JSON.stringify(article.schemas).replace(/\n/g, ' ')}`
    : '';

  const frontmatter = `---
title: "${yamlEscape(article.title)}"
slug: "${yamlEscape(article.slug)}"
category: "${article.category}"
templateType: "${article.templateType || article.category}"
date: "${new Date().toISOString()}"
pulseDate: "${today}"
description: "${yamlEscape(article.keyword)} — Daily ETF Pulse 자동 분석 리포트"
keywords:
${keywordsYaml}
tickers:
${tickersYaml || '  []'}
${authorLine}
${authorIdLine}
charts: ${chartData ? JSON.stringify(chartData.map(c => c.type)) : '[]'}
affiliates: ${affiliateMatch ? JSON.stringify(affiliateMatch.products.map(p => p.id)) : '[]'}
adPlacements: ${adPlan?.plan?.placements?.length || adPlan?.totalPlacements || 0}
${schemasLine}
---
`;

  const mdxContent = frontmatter + '\n' + article.content;

  const categoryDir = path.join(state.PATHS.contentDir, article.category);
  if (!fs.existsSync(categoryDir)) fs.mkdirSync(categoryDir, { recursive: true });

  const filePath = path.join(categoryDir, `${article.slug}.mdx`);
  fs.writeFileSync(filePath, mdxContent, 'utf-8');
  logger.log(AGENT_NAME, `  📄 ${article.category}/${article.slug}.mdx`);
  return filePath;
}

async function requestGoogleIndexing(paths) {
  const siteUrl = process.env.SITE_URL;
  if (!siteUrl) {
    logger.warn(AGENT_NAME, 'SITE_URL 미설정 → Indexing 건너뜀');
    return;
  }
  const urls = paths.map(p => `${siteUrl.replace(/\/+$/, '')}${p}`);
  const { results, usedRealApi, reason } = await submitIndexing(urls);

  if (!usedRealApi) {
    logger.warn(AGENT_NAME, `⚠️ Indexing 미적용 (${reason || 'unknown'}) — 서비스 계정 키를 .env.local의 GOOGLE_INDEXING_KEY 또는 GOOGLE_INDEXING_KEY_FILE에 설정하세요.`);
    urls.forEach(u => logger.log(AGENT_NAME, `  🔍 (예약) ${u}`));
    return;
  }

  const ok = results.filter(r => r.ok).length;
  results.forEach(r => {
    if (r.ok) logger.success(AGENT_NAME, `  ✅ Indexing 성공: ${r.url}`);
    else logger.warn(AGENT_NAME, `  ⚠️ Indexing 실패 ${r.status || ''}: ${r.url} — ${r.error || ''}`);
  });
  logger.success(AGENT_NAME, `🔍 Google Indexing: ${ok}/${results.length} 성공`);
}

async function run({ today, previousResults }) {
  logger.log(AGENT_NAME, '🚀 배포 시작');

  // UiDesigner 통과 최종 레이아웃이 있으면 그걸 우선, 없으면 FrontendPlanner 결과
  const approvedLayouts = previousResults?.UiDesigner?.approvedLayouts
    || previousResults?.FrontendPlanner?.plannedArticles
    || [];

  const verifiedArticles = previousResults?.YmylGuard?.verifiedArticles || [];
  const chartSets = previousResults?.Visualizer?.chartSets || [];
  const affiliateMatches = previousResults?.CpaDealMaker?.affiliateMatches || [];

  if (verifiedArticles.length === 0) {
    logger.warn(AGENT_NAME, '발행할 글 없음');
    return { summary: '발행 건너뜀', published: [] };
  }

  const published = [];
  for (const article of verifiedArticles) {
    const chartData = chartSets.find(c => c.articleSlug === article.slug)?.charts;
    const layout = approvedLayouts.find(a => a.articleSlug === article.slug || a.article?.slug === article.slug);
    const affiliateMatch = affiliateMatches.find(a => a.articleSlug === article.slug);

    const filePath = saveAsMdx(article, chartData, layout, affiliateMatch, today);
    published.push({ slug: article.slug, category: article.category, filePath });
  }

  await requestGoogleIndexing(published.map(p => `/${p.category}/${p.slug}`));
  logger.success(AGENT_NAME, `🎉 ${published.length}개 발행`);

  return { summary: `${published.length}개 글 발행`, published };
}

module.exports = { run };
