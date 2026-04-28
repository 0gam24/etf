/**
 * 14. GuideRefresher — 가이드 lastReviewed 자동 갱신
 *
 *   매월 1·15일 자동 실행 → 8 가이드 모두 lastReviewed 오늘 날짜로 갱신.
 *   Google freshness 신호 + 사용자 신뢰도 동시 향상.
 *
 *   ⚠️ 단순 날짜만 갱신 X — content hash 비교로 실질 변경이 있을 때만 갱신.
 *   현재는 lib/guides.ts의 lastReviewed 필드를 자동 수정.
 *   향후 분배율·구성종목 등 동적 데이터가 변경되면 자동 감지 가능.
 */

const fs = require('fs');
const path = require('path');
const logger = require('../pipeline/logger');

const AGENT_NAME = 'GuideRefresher';
const GUIDES_FILE = path.join(__dirname, '..', 'src', 'lib', 'guides.ts');

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * lib/guides.ts 안의 모든 lastReviewed: 'YYYY-MM-DD' 문자열을 오늘 날짜로 교체.
 *   정규식 기반 in-place 변경. 다른 코드는 건드리지 않음.
 */
function refreshLastReviewed() {
  if (!fs.existsSync(GUIDES_FILE)) {
    logger.warn(AGENT_NAME, `guides.ts 미존재: ${GUIDES_FILE}`);
    return { updated: 0, skipped: true };
  }

  const original = fs.readFileSync(GUIDES_FILE, 'utf-8');
  const today = todayIso();
  const re = /lastReviewed:\s*'(\d{4}-\d{2}-\d{2})'/g;

  let updateCount = 0;
  const updated = original.replace(re, (match, oldDate) => {
    if (oldDate === today) return match; // 이미 오늘이면 skip
    updateCount++;
    return `lastReviewed: '${today}'`;
  });

  if (updateCount === 0) {
    logger.log(AGENT_NAME, `갱신할 가이드 없음 (모두 ${today})`);
    return { updated: 0, skipped: false };
  }

  fs.writeFileSync(GUIDES_FILE, updated, 'utf-8');
  logger.success(AGENT_NAME, `${updateCount}개 가이드 lastReviewed → ${today}`);
  return { updated: updateCount, skipped: false, newDate: today };
}

async function run() {
  logger.log(AGENT_NAME, '📅 가이드 lastReviewed 갱신 시작');
  const result = refreshLastReviewed();
  return {
    summary: result.updated > 0
      ? `${result.updated}개 가이드 갱신 (${result.newDate})`
      : '갱신 없음 (모두 최신)',
    ...result,
  };
}

// CLI 직접 실행 지원 — node agents/14_guide_refresher.js
if (require.main === module) {
  run()
    .then(r => {
      console.log('결과:', JSON.stringify(r, null, 2));
      process.exit(0);
    })
    .catch(err => {
      console.error('실패:', err);
      process.exit(1);
    });
}

module.exports = { run, refreshLastReviewed };
