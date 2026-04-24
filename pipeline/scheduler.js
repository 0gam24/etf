/**
 * Daily ETF Pulse — 간단 스케줄러 (Node 내장, 의존성 없음)
 *
 *   매일 KST 08:30 에 orchestrator 실행.
 *   한 번만 실행하고 싶으면: node pipeline/orchestrator.js
 *   상시 대기가 필요하면:   node pipeline/scheduler.js
 *
 *   Windows Task Scheduler 연동이 더 안정적.
 *   예시 (관리자 PowerShell):
 *     schtasks /Create /SC DAILY /ST 08:30 /TN "DailyETFPulse" ^
 *       /TR "node C:\path\to\etf-platform\pipeline\orchestrator.js"
 *
 *   환경변수:
 *     PULSE_SCHEDULE_HOUR=8      (KST 기준, 기본 8)
 *     PULSE_SCHEDULE_MINUTE=30   (기본 30)
 */

require('./env'); // .env.local 자동 로드

const { runPipeline } = require('./orchestrator');
const logger = require('./logger');

const HOUR_KST = parseInt(process.env.PULSE_SCHEDULE_HOUR || '8', 10);
const MIN_KST = parseInt(process.env.PULSE_SCHEDULE_MINUTE || '30', 10);

// KST = UTC+9
function nextRunMs() {
  const now = new Date();
  const nowKst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const targetKst = new Date(Date.UTC(
    nowKst.getUTCFullYear(),
    nowKst.getUTCMonth(),
    nowKst.getUTCDate(),
    HOUR_KST,
    MIN_KST,
    0,
  ));
  if (targetKst.getTime() <= nowKst.getTime()) {
    targetKst.setUTCDate(targetKst.getUTCDate() + 1);
  }
  return targetKst.getTime() - nowKst.getTime();
}

function scheduleNext() {
  const ms = nextRunMs();
  const hours = Math.floor(ms / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  logger.log('Scheduler', `⏰ 다음 실행까지 ${hours}시간 ${mins}분 (KST ${HOUR_KST}:${String(MIN_KST).padStart(2, '0')})`);
  setTimeout(async () => {
    try {
      logger.banner('⏰ 스케줄러 트리거 — Daily ETF Pulse 파이프라인');
      await runPipeline();
    } catch (err) {
      logger.error('Scheduler', `파이프라인 오류: ${err.message}`);
    } finally {
      scheduleNext();
    }
  }, ms);
}

if (require.main === module) {
  logger.banner('⚡ Daily ETF Pulse Scheduler 시작');
  scheduleNext();
}
