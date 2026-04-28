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

  // 1차 시도
  let result = await submitAll(paths, { publicDir });

  // 1차 실패 시 30초 대기 후 1회 자동 재시도 (일시적 네트워크/rate-limit 보호)
  const indexNowFailed = result.indexNow && result.indexNow.status >= 400 && result.indexNow.status !== 0;
  if (result.usedRealApi && indexNowFailed) {
    logger.warn(AGENT_NAME, `⚠️ IndexNow HTTP ${result.indexNow.status} — 30초 후 재시도`);
    await new Promise(r => setTimeout(r, 30 * 1000));
    result = await submitAll(paths, { publicDir });
    if (result.indexNow && result.indexNow.status >= 200 && result.indexNow.status < 300) {
      logger.success(AGENT_NAME, `✅ 재시도 성공 — IndexNow HTTP ${result.indexNow.status}`);
    } else {
      logger.warn(AGENT_NAME, `⚠️ 재시도 후에도 실패 (HTTP ${result.indexNow?.status}). Search Console에서 수동 확인 권장`);
    }
  }

  if (!result.usedRealApi) {
    logger.warn(AGENT_NAME, `⚠️ 색인 미적용 (${result.reason || result.indexNow?.reason || '설정 없음'}) — SITE_URL·INDEXNOW_KEY 설정 시 실제 호출`);
    return { summary: `${paths.length}개 URL 예약 (키 미설정)`, results: result };
  }

  logger.success(AGENT_NAME, `✅ IndexNow ${result.indexNow.status} — ${paths.length}개 URL 제출 (Bing + Naver Yeti + Yandex 동시 통보)`);
  if (result.naver?.sitemapsRefreshed != null) {
    logger.log(AGENT_NAME, `  📡 sitemap GET ping ${result.naver.sitemapsRefreshed}/${result.naver.sitemapsTotal} 갱신 (CDN 캐시·Naver Yeti 인지 강화)`);
  }
  return {
    summary: `${paths.length}개 URL 색인 요청 완료 (IndexNow HTTP ${result.indexNow.status})`,
    results: result,
    submittedCount: paths.length,
    submittedPaths: paths,
  };
}

module.exports = { run };
