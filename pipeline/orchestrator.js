/**
 * Daily ETF Pulse — 오케스트레이터
 *   13개 에이전트 순차 실행 + 자율 피드백 루프 (UiDesigner, YmylGuard)
 *   일요일에는 WeeklyBuilder가 추가 실행되어 주간 리포트·종목 마스터 페이지 생성
 *
 *   실행: node pipeline/orchestrator.js
 */

require('./env'); // .env.local 자동 로드 (Node 직접 실행 시 필수)

const fs = require('fs');
const path = require('path');
const state = require('./state_manager');
const logger = require('./logger');
const { runSecurityCheck, printReport } = require('./security_guard');

/**
 * 직전 발행 시 사용한 거래일(baseDate) 기록 파일.
 *   같은 거래일이면 새 글 못 만들 거라 pipeline 중단 — workflow run 시간·token 절약.
 */
const LAST_BASE_DATE_FILE = path.join(__dirname, '..', 'data', '.last-pulse-base-date');

function readLastBaseDate() {
  try {
    if (!fs.existsSync(LAST_BASE_DATE_FILE)) return null;
    return fs.readFileSync(LAST_BASE_DATE_FILE, 'utf-8').trim();
  } catch { return null; }
}

function writeLastBaseDate(baseDate) {
  try {
    fs.writeFileSync(LAST_BASE_DATE_FILE, baseDate, 'utf-8');
  } catch (err) {
    logger.warn('Orchestrator', `last-base-date 저장 실패: ${err.message}`);
  }
}

const DataMiner       = require('../agents/1_data_miner');
const SeoArchitect    = require('../agents/2_seo_architect');
const NewsCollector   = require('../agents/1b_news_collector');
const LogicSpecialist = require('../agents/3_logic_specialist');
const HumanTouch      = require('../agents/3b_human_touch');
const InternalLinker  = require('../agents/4b_internal_linker');
const Visualizer      = require('../agents/4_visualizer');
const FrontendPlanner = require('../agents/5_frontend_planner');
const UiDesigner      = require('../agents/5b_ui_designer');
const CpaDealMaker    = require('../agents/6_cpa_deal_maker');
const YmylGuard       = require('../agents/7_ymyl_guard');
const SchemaInjector  = require('../agents/9_schema_injector');
const HarnessDeployer = require('../agents/8_harness_deployer');
const IndexPusher     = require('../agents/11_index_pusher');
const ThreadsBot      = require('../agents/12_threads_bot');
const WeeklyBuilder   = require('../agents/13_weekly_builder');

const AGENT_PIPELINE = [
  { name: 'DataMiner',       agent: DataMiner,       description: '공공데이터·ECOS·MARKET PULSE 이미지(OCR) 수집' },
  { name: 'SeoArchitect',    agent: SeoArchitect,    description: 'pulse/surge/flow/income 4종 전략 수립' },
  { name: 'NewsCollector',   agent: NewsCollector,   description: '구글 뉴스 RSS + Gemini 3줄 요약' },
  { name: 'LogicSpecialist', agent: LogicSpecialist, description: '템플릿 분기 본문 작성 (Gemini)' },
  { name: 'HumanTouch',      agent: HumanTouch,      description: '7인 페르소나 리라이팅 (사람 느낌)' },
  { name: 'InternalLinker',  agent: InternalLinker,  description: '내부 링크 자동 삽입 (카테고리·티커·섹터)' },
  { name: 'Visualizer',      agent: Visualizer,      description: 'SEO 테이블·차트 데이터 생성' },
  { name: 'FrontendPlanner', agent: FrontendPlanner, description: '광고 배치 기획' },
  { name: 'UiDesigner',      agent: UiDesigner,      description: '4050 독자 몰입도 UX 검증' },
  { name: 'CpaDealMaker',    agent: CpaDealMaker,    description: '금융 제휴 상품 매칭' },
  { name: 'YmylGuard',       agent: YmylGuard,       description: 'YMYL 검증·면책조항' },
  { name: 'SchemaInjector',  agent: SchemaInjector,  description: 'Article/FAQPage/Breadcrumb JSON-LD' },
  { name: 'HarnessDeployer', agent: HarnessDeployer, description: 'MDX 발행' },
  { name: 'IndexPusher',     agent: IndexPusher,     description: 'Bing IndexNow + 네이버 색인 요청' },
  { name: 'ThreadsBot',      agent: ThreadsBot,      description: 'Threads 자동 포스팅 (하루 2회)' },
  { name: 'WeeklyBuilder',   agent: WeeklyBuilder,   description: '일요일: 주간 리포트 + 종목 마스터 생성' },
];

async function runPipeline() {
  logger.banner('⚡ Daily ETF Pulse 파이프라인 시작');

  logger.log('Orchestrator', '🔒 보안 검사 실행...');
  const securityResult = runSecurityCheck();
  printReport(securityResult);
  if (!securityResult.passed) {
    logger.error('Orchestrator', '⛔ 보안 검사 실패!');
    process.exit(1);
  }

  state.ensureDirectories();

  const today = state.getToday();
  const results = {};
  let failedAgent = null;

  let rejectionFeedback = null;
  const MAX_RETRIES = 3;
  let currentRetry = 0;

  // 루프 롤백 타겟 인덱스를 이름으로 찾기
  const indexOf = (name) => AGENT_PIPELINE.findIndex(a => a.name === name);

  for (let i = 0; i < AGENT_PIPELINE.length; i++) {
    const { name, agent, description } = AGENT_PIPELINE[i];
    logger.log('Orchestrator', `──── ${name}: ${description} ────`);
    state.logPipelineStep(name, 'started');

    try {
      const agentArgs = { today, previousResults: results };

      if (name === 'LogicSpecialist' && rejectionFeedback?.type === 'ymyl') {
        agentArgs.rejectionFeedback = rejectionFeedback.reason;
      }
      if (name === 'FrontendPlanner' && rejectionFeedback?.type === 'design') {
        agentArgs.designFeedback = rejectionFeedback.data[0];
      }

      const result = await agent.run(agentArgs);
      results[name] = result;
      state.logPipelineStep(name, 'completed', { outputSummary: result?.summary || 'OK' });
      logger.success(name, `${description} 완료!`);

      // DataMiner 직후: 거래일이 직전 발행과 동일하면 pipeline 조기 종료
      if (name === 'DataMiner') {
        const currentBaseDate = result?.etfData?.baseDate || '';
        const lastBaseDate = readLastBaseDate();
        if (currentBaseDate && lastBaseDate && currentBaseDate === lastBaseDate) {
          logger.warn('Orchestrator', `⏸  거래일(${currentBaseDate}) 직전 발행과 동일 — KRX 휴장·갱신 지연으로 추정. 새 글 생성 skip.`);
          logger.warn('Orchestrator', '   (다음 거래일 데이터가 들어오면 자동 진행. 강제 발행 필요시 data/.last-pulse-base-date 삭제)');
          return results; // 즉시 종료 — 후속 에이전트 모두 skip
        }
      }

      // HarnessDeployer 직후: 실제 발행됐으면 baseDate 갱신
      if (name === 'HarnessDeployer' && (result?.published || []).length > 0) {
        const currentBaseDate = results.DataMiner?.etfData?.baseDate;
        if (currentBaseDate) {
          writeLastBaseDate(currentBaseDate);
          logger.success('Orchestrator', `📌 last-base-date 갱신 → ${currentBaseDate}`);
        }
      }

      // UiDesigner 반려 → FrontendPlanner 재기획
      if (name === 'UiDesigner' && result.rejectedLayouts?.length > 0) {
        if (currentRetry < MAX_RETRIES) {
          currentRetry++;
          rejectionFeedback = { type: 'design', data: result.rejectedLayouts };
          logger.warn('Orchestrator', `🚨 UI 반려 — FrontendPlanner로 롤백 (${currentRetry}/${MAX_RETRIES})`);
          i = indexOf('FrontendPlanner') - 1;
          continue;
        } else {
          logger.warn('Orchestrator', '⚠️ 디자인 재시도 한도 도달, 강제 승인');
        }
      }

      // YmylGuard 반려 → LogicSpecialist 재작성 (이후 HumanTouch·InternalLinker 재실행 포함)
      if (name === 'YmylGuard' && result.rejectedArticles?.length > 0) {
        if (currentRetry < MAX_RETRIES) {
          currentRetry++;
          rejectionFeedback = {
            type: 'ymyl',
            reason: result.rejectedArticles.map(a => `[${a.keyword}] ${a.reason}`).join(' | '),
          };
          logger.warn('Orchestrator', `🚨 YMYL 반려 (${currentRetry}/${MAX_RETRIES}) — LogicSpecialist 롤백`);
          i = indexOf('LogicSpecialist') - 1;
          continue;
        } else {
          logger.error('Orchestrator', '⛔ YMYL 재시도 한도 초과, 파이프라인 중단');
          failedAgent = name;
          break;
        }
      }
    } catch (err) {
      logger.error(name, `실패: ${err.message}`);
      state.logPipelineStep(name, 'failed', { error: err.message });
      failedAgent = name;
      break;
    }
  }

  if (failedAgent) logger.banner(`⚠️ 파이프라인 종료 (실패: ${failedAgent})`);
  else logger.banner('🎉 Daily ETF Pulse 발행 완료!');

  return results;
}

if (require.main === module) {
  runPipeline().catch(err => {
    logger.error('Orchestrator', `치명적 오류: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { runPipeline };
