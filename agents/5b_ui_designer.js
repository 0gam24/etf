/**
 * 5b. UiDesigner — Daily ETF Pulse UX 검증 에이전트
 *   FrontendPlanner가 기획한 광고 배치가 4050 독자의 몰입도를 해치지 않는지 검증.
 *   반려 시 Orchestrator가 FrontendPlanner 단계로 롤백해 최대 3회 재기획.
 *
 *   검증 기준:
 *     1. 광고 밀도 — 본문 길이 대비 광고 개수
 *     2. 헤더 인접성 — 첫 H2 바로 아래 광고가 짧은 글에 들어가면 반려
 */

const logger = require('../pipeline/logger');

const AGENT_NAME = 'UiDesigner';

function reviewDesignUX(article, plan) {
  const issues = [];
  const adCount = plan.placements.length;
  const textLength = article.wordCount;

  // 1. 밀도: 2000자 미만 글에 광고 3개 초과 → 반려
  if (textLength < 2000 && adCount > 2) {
    issues.push('본문 길이 대비 광고가 과도합니다. 우선순위 낮은 본문 중간 광고(medium)를 1개 제거하세요.');
  }

  // 2. 헤더 인접성: 글이 1000자 미만인데 첫 H2 바로 아래 광고 → 반려
  const hasFirstH2Ad = plan.placements.some(p => p.position === 'after-first-h2');
  if (hasFirstH2Ad && textLength < 1000) {
    issues.push('짧은 글에서 첫 헤딩 바로 아래 광고는 독자 몰입을 해칩니다. 하단으로 이동시키세요.');
  }

  return issues;
}

async function run({ today, previousResults }) {
  logger.log(AGENT_NAME, '🎨 UI·UX 검증 시작');

  const plannedArticles = previousResults?.FrontendPlanner?.plannedArticles || [];
  if (plannedArticles.length === 0) return { summary: '검증할 기획안 없음', approvedLayouts: [] };

  const approvedLayouts = [];
  const rejectedLayouts = [];

  for (const item of plannedArticles) {
    const { article, plan } = item;
    const issues = reviewDesignUX(article, plan);

    if (issues.length > 0) {
      logger.error(AGENT_NAME, `⛔ 반려: "${article.keyword}"`);
      issues.forEach(i => logger.error(AGENT_NAME, `  └ ${i}`));
      rejectedLayouts.push({ keyword: article.keyword, reason: issues.join(' | ') });
    } else {
      logger.success(AGENT_NAME, `✅ "${article.keyword}" 승인`);
      approvedLayouts.push(item);
    }
  }

  return {
    summary: `${approvedLayouts.length}개 승인, ${rejectedLayouts.length}개 반려`,
    approvedLayouts,
    rejectedLayouts,
  };
}

module.exports = { run };
