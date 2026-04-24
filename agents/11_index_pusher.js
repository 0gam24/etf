/**
 * 11. IndexPusher — 발행된 포스트 URL을 Bing IndexNow + 네이버로 즉시 색인 요청
 */

const path = require('path');
const logger = require('../pipeline/logger');
const { submitAll } = require('../pipeline/index_pusher');

const AGENT_NAME = 'IndexPusher';

async function run({ today, previousResults }) {
  logger.log(AGENT_NAME, '🔍 색인 요청 (IndexNow · 네이버)');

  const published = previousResults?.HarnessDeployer?.published || [];
  if (published.length === 0) return { summary: '색인 건너뜀', results: [] };

  const publicDir = path.join(__dirname, '..', 'public');
  const paths = published.map(p => `/${p.category}/${encodeURIComponent(p.slug)}`);

  const result = await submitAll(paths, { publicDir });

  if (!result.usedRealApi) {
    logger.warn(AGENT_NAME, `⚠️ 색인 미적용 (${result.reason || result.indexNow?.reason || '설정 없음'}) — SITE_URL·INDEXNOW_KEY 설정 시 실제 호출`);
    return { summary: `${paths.length}개 URL 예약 (키 미설정)`, results: result };
  }

  logger.success(AGENT_NAME, `✅ IndexNow ${result.indexNow.status} — ${paths.length}개 URL 제출`);
  return { summary: `${paths.length}개 URL 색인 요청 완료 (IndexNow HTTP ${result.indexNow.status})`, results: result };
}

module.exports = { run };
