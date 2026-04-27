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

// ─────────────────────────────────────────────────────────────────────
// SEO 검증 (SEO.md 11번 항목 — push 전 자동 차단·경고)
// ─────────────────────────────────────────────────────────────────────
const SLUG_RE = /^[a-z0-9-]{1,80}$/;
// SEO.md 규칙 10 (2026-04-26 갱신): AI 작성은 공개 의무. 모델명·기술 디테일·작업량 자랑은 여전히 금지.
const FORBIDDEN_OPS_META = [
  '자동 발행', '자동 작성', '자동 생성', '크롤링', '스크래핑',
  '파이프라인', '워크플로우', 'Gemini', 'GPT', 'LLM', 'Claude',
  '샘플 데이터', 'placeholder', 'fallback', 'mock',
];

/**
 * 글 메타·본문에 SEO.md 규칙 위반이 있는지 검증.
 *   { blockers: string[], warnings: string[] } 반환.
 *   blockers가 1개라도 있으면 호출자가 deploy 차단해야 함.
 */
function validateSeo(article) {
  const blockers = [];
  const warnings = [];

  // 1. slug — 영문 ASCII만 (KOREAN_SLUG_MAP 누락 시 차단)
  if (!article.slug || !SLUG_RE.test(article.slug)) {
    blockers.push(`slug 규칙 위반 ("${article.slug}") — 영문 소문자·숫자·하이픈만, 80자 이내. KOREAN_SLUG_MAP 매핑 누락 의심.`);
  }

  // 2. title 길이 (60자 권장)
  const title = String(article.title || '');
  if (title.length === 0) {
    blockers.push('title 비어 있음.');
  } else if (title.length > 60) {
    warnings.push(`title ${title.length}자 — 60자 이내 권장 (검색 결과 잘릴 수 있음).`);
  }

  // 3. description / keyword 검사 (description은 frontmatter에 keyword + 접미사로 자동 생성)
  const desc = String(article.description || article.keyword || '');
  if (desc.length > 0 && (desc.length < 50 || desc.length > 160)) {
    warnings.push(`description ${desc.length}자 — 120~155자 권장.`);
  }

  // 4. tickers — 종목 분석 글이면 비어 있으면 안됨
  const tickers = article.tickers || [];
  const isStockAnalysis = ['surge', 'flow', 'income', 'breaking'].includes(article.category);
  if (isStockAnalysis && tickers.length === 0) {
    warnings.push(`${article.category} 글인데 tickers 비어 있음 — Article 스키마/관련 글 매칭 실패 위험.`);
  }

  // 5. 본문 운영자 메타 단어 노출 검사
  const content = String(article.content || '');
  for (const word of FORBIDDEN_OPS_META) {
    if (content.includes(word)) {
      warnings.push(`본문에 운영자 메타 단어 "${word.trim()}" 출현 — 시청자 가치 표현으로 변환 필요.`);
    }
  }

  // 6. H1 1개 검사 (마크다운 # heading)
  const h1Count = (content.match(/^#\s/gm) || []).length;
  if (h1Count > 1) {
    warnings.push(`본문 H1 ${h1Count}개 — 페이지당 1개만 권장.`);
  }

  return { blockers, warnings };
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
  const blocked = [];
  for (const article of verifiedArticles) {
    // SEO.md 11번 — push 전 자동 검증
    const { blockers, warnings } = validateSeo(article);
    if (warnings.length > 0) {
      warnings.forEach(w => logger.warn(AGENT_NAME, `  ⚠️ SEO [${article.slug}] ${w}`));
    }
    if (blockers.length > 0) {
      blockers.forEach(b => logger.warn(AGENT_NAME, `  ⛔ SEO [${article.slug}] ${b}`));
      blocked.push({ slug: article.slug, blockers });
      continue; // 차단 항목 — 발행 skip
    }

    const chartData = chartSets.find(c => c.articleSlug === article.slug)?.charts;
    const layout = approvedLayouts.find(a => a.articleSlug === article.slug || a.article?.slug === article.slug);
    const affiliateMatch = affiliateMatches.find(a => a.articleSlug === article.slug);

    const filePath = saveAsMdx(article, chartData, layout, affiliateMatch, today);
    published.push({ slug: article.slug, category: article.category, filePath });
  }

  if (blocked.length > 0) {
    logger.warn(AGENT_NAME, `⛔ SEO 검증 차단 ${blocked.length}건 — 발행 제외`);
  }

  await requestGoogleIndexing(published.map(p => `/${p.category}/${p.slug}`));
  logger.success(AGENT_NAME, `🎉 ${published.length}개 발행`);

  // 배포 후 검증 — Cloudflare 배포 완료(약 5분) 후 200 응답 확인.
  // pipeline 종료를 막지 않도록 백그라운드 fire-and-forget.
  if (published.length > 0 && process.env.SITE_URL) {
    schedulePostDeployVerification(published).catch(err =>
      logger.warn(AGENT_NAME, `post-deploy verification 실패: ${err.message}`),
    );
  }

  return { summary: `${published.length}개 글 발행`, published, blocked };
}

/**
 * 배포 후 검증 — Cloudflare 배포 완료 대기 후 200 응답 확인.
 *   실패 시 logger 알림만 (자동 재배포 X — Cloudflare 빌드는 push로만 트리거).
 *   GitHub Actions에서 실행 시 timeout 내 완료되도록 5분 한 번만 시도.
 */
async function schedulePostDeployVerification(published) {
  const WAIT_MS = 5 * 60 * 1000; // 5분 대기 후 검증
  const siteUrl = process.env.SITE_URL.replace(/\/+$/, '');
  logger.log(AGENT_NAME, `⏱️  ${WAIT_MS / 1000}초 후 배포 검증 시작...`);
  await new Promise(r => setTimeout(r, WAIT_MS));

  let okCount = 0;
  const failures = [];
  for (const p of published) {
    const url = `${siteUrl}/${p.category}/${p.slug}`;
    try {
      const res = await fetch(url, {
        redirect: 'follow',
        headers: { 'User-Agent': 'pulse-deploy-verify/1.0' },
      });
      if (res.status === 200) {
        okCount++;
        logger.success(AGENT_NAME, `  ✅ verify ${url} → 200`);
      } else {
        failures.push({ url, status: res.status });
        logger.warn(AGENT_NAME, `  ⚠️ verify ${url} → HTTP ${res.status}`);
      }
    } catch (err) {
      failures.push({ url, error: err.message });
      logger.warn(AGENT_NAME, `  ⚠️ verify ${url} → ${err.message}`);
    }
  }

  if (failures.length > 0) {
    logger.warn(AGENT_NAME, `⚠️ 배포 검증 실패 ${failures.length}/${published.length} — Cloudflare 빌드 캐시 확인 필요`);
  } else {
    logger.success(AGENT_NAME, `🎯 배포 검증 100% 통과 (${okCount}/${published.length})`);
  }
}

module.exports = { run, validateSeo, schedulePostDeployVerification };
