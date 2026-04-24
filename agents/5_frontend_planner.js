/**
 * 5. FrontendPlanner — Daily ETF Pulse 광고 배치 기획
 *   글 구조(H2/길이)를 분석해 최적의 광고 삽입 위치를 결정.
 *   UiDesigner가 반려한 피드백(designFeedback)이 있으면 재기획.
 *
 *   배치 규칙:
 *     1. 첫 H2 직후 → in-article (CTR 최고)
 *     2. 본문 50% 지점 → in-content (글 40줄 이상일 때만)
 *     3. FAQ 직전 → CTA + 제휴 배너
 *     4. 글 하단 → matched-content
 */

const state = require('../pipeline/state_manager');
const logger = require('../pipeline/logger');

const AGENT_NAME = 'FrontendPlanner';

/** 글 구조를 분석해 광고 삽입 위치를 결정하고, UiDesigner 피드백이 있으면 수정 */
function planAdPlacement(article, designFeedback = null) {
  const lines = article.content.split('\n');
  const totalLines = lines.length;
  let placements = [];

  // H2 섹션 위치 찾기
  const h2Positions = [];
  lines.forEach((line, index) => {
    if (line.startsWith('## ')) {
      h2Positions.push({ index, title: line.replace('## ', '') });
    }
  });

  // 규칙 1: 첫 H2 아래 (인-아티클 광고)
  if (h2Positions.length > 0) {
    placements.push({
      type: 'in-article',
      position: 'after-first-h2',
      lineIndex: h2Positions[0].index + 1,
      adFormat: 'display',           // 디스플레이 광고
      size: 'responsive',            // 반응형
      priority: 'high',
    });
  }

  // 규칙 2: 본문 중간
  if (totalLines > 40) {
    placements.push({
      type: 'in-content',
      position: 'mid-content',
      lineIndex: Math.floor(totalLines * 0.5),
      adFormat: 'in-feed',
      size: 'responsive',
      priority: 'medium',
    });
  }

  // 규칙 3: FAQ 직전 → CTA + 제휴 배너
  const faqIndex = h2Positions.find(h => h.title.includes('FAQ') || h.title.includes('질문'));
  if (faqIndex) {
    placements.push({
      type: 'cta-banner',
      position: 'before-faq',
      lineIndex: faqIndex.index - 1,
      adFormat: 'affiliate-card',
      priority: 'high',
    });
  }

  // 규칙 4: 글 하단 (관련 글 + 광고)
  placements.push({
    type: 'bottom-banner',
    position: 'end-of-article',
    lineIndex: totalLines,
    adFormat: 'matched-content',     // 관련 콘텐츠형 광고
    size: 'responsive',
    priority: 'medium',
  });

  // 디자이너 피드백 반영 (의논 및 조율 로직)
  if (designFeedback) {
    logger.warn(AGENT_NAME, `🗣️ 디자이너 피드백 수신: "${designFeedback}"`);
    
    if (designFeedback.includes('제거하세요')) {
      logger.log(AGENT_NAME, '🛠️ 기획 수정: 본문 중간 광고(우선순위 medium)를 제거합니다.');
      placements = placements.filter(p => p.priority !== 'medium');
    }
    
    if (designFeedback.includes('하단으로 이동시키세요')) {
      logger.log(AGENT_NAME, '🛠️ 기획 수정: 첫 번째 H2 아래 광고를 글 하단으로 이동시킵니다.');
      const targetAd = placements.find(p => p.position === 'after-first-h2');
      if (targetAd) {
        targetAd.position = 'bottom-content';
        targetAd.lineIndex = totalLines - 1;
      }
    }
  }

  return {
    totalLines,
    placements,
  };
}

async function run({ today, previousResults, designFeedback }) {
  logger.log(AGENT_NAME, '📐 광고 배치 기획 시작');
  
  // LogicSpecialist를 통과했거나, YmylGuard를 최종 통과한 데이터를 가져옴
  const articles = previousResults?.LogicSpecialist?.articles || [];

  if (articles.length === 0) {
    logger.warn(AGENT_NAME, '배치할 글이 없습니다.');
    return { summary: '광고 배치 건너뜀', adPlans: [] };
  }

  const plannedArticles = []; // 각 글에 대해 광고 기획
  for (const article of articles) {
    let currentFeedback = null;
    
    // 이 글에 대한 디자이너 반려 사유가 있는지 확인
    if (designFeedback && designFeedback.keyword === article.keyword) {
      currentFeedback = designFeedback.reason;
    }

    const plan = planAdPlacement(article, currentFeedback);
    
    plannedArticles.push({
      article,
      plan,
      articleSlug: article.slug,
      category: article.category,
      totalPlacements: plan.placements.length,
    });

    logger.log(AGENT_NAME, `  📍 "${article.keyword}" → 광고 ${plan.placements.length}개 배치 기획`);
  }

  state.saveData(AGENT_NAME, 'processed', `ad_plans_${today}.json`, plannedArticles);

  logger.success(AGENT_NAME, `총 ${plannedArticles.length}개 포스팅에 대한 광고 기획 및 디자이너 피드백 반영 완료`);
  
  return {
    summary: `${plannedArticles.length}개 포스팅 광고 기획 완료`,
    plannedArticles,
  };
}

module.exports = { run };
