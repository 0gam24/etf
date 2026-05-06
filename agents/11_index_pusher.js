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
  let alert = null;
  if (result.usedRealApi && indexNowFailed) {
    logger.warn(AGENT_NAME, `⚠️ IndexNow HTTP ${result.indexNow.status} — 30초 후 재시도`);
    await new Promise(r => setTimeout(r, 30 * 1000));
    result = await submitAll(paths, { publicDir });
    if (result.indexNow && result.indexNow.status >= 200 && result.indexNow.status < 300) {
      logger.success(AGENT_NAME, `✅ 재시도 성공 — IndexNow HTTP ${result.indexNow.status}`);
    } else {
      // 재시도 후에도 실패 — 색인 누락 risk. 운영자가 즉시 알아챌 수 있도록 ALERT 표면화.
      logger.error(AGENT_NAME, `⛔ IndexNow 재시도 후에도 실패 (HTTP ${result.indexNow?.status}) — 색인 누락 가능성`);
      logger.error(AGENT_NAME, '   복구 절차:');
      logger.error(AGENT_NAME, `     1) public/${process.env.INDEXNOW_KEY || '{INDEXNOW_KEY}'}.txt 파일 GET 200 확인`);
      logger.error(AGENT_NAME, '     2) Bing Webmaster Tools — IndexNow 활성 상태 확인');
      logger.error(AGENT_NAME, '     3) Cloudflare Pages 빌드 후 키 파일 라우팅 정상 확인');
      logger.error(AGENT_NAME, '     4) Search Console + Naver 웹마스터에서 수동 색인 요청');
      alert = {
        severity: 'high',
        reason: `IndexNow HTTP ${result.indexNow?.status || 'unknown'} 재시도 후에도 실패`,
        affectedUrls: paths.length,
        actionRequired: 'Bing Webmaster + Search Console + Naver 수동 색인 권장',
      };
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

  // alert 가 있으면 summary 에 표면화 — orchestrator state log + workflow Summary tab 에서 즉시 보임.
  const alertSuffix = alert ? ` ⛔ ALERT: ${alert.reason}` : '';
  return {
    summary: `${paths.length}개 URL 색인 요청 완료 (IndexNow HTTP ${result.indexNow.status})${alertSuffix}`,
    results: result,
    submittedCount: paths.length,
    submittedPaths: paths,
    alert,
  };
}

module.exports = { run };
