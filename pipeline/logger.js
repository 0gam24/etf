/**
 * Logger — Daily ETF Pulse 파이프라인 터미널 출력 (색상·타임스탬프)
 */

// 13개 에이전트 + Orchestrator + Scheduler 고유 색상
const AGENT_COLORS = {
  DataMiner:       '\x1b[36m',   // 청록
  SeoArchitect:    '\x1b[33m',   // 노랑
  NewsCollector:   '\x1b[95m',   // 밝은 보라
  LogicSpecialist: '\x1b[35m',   // 보라
  HumanTouch:      '\x1b[38;5;213m',  // 핑크
  InternalLinker:  '\x1b[38;5;117m',  // 하늘
  Visualizer:      '\x1b[32m',   // 초록
  FrontendPlanner: '\x1b[34m',   // 파랑
  UiDesigner:      '\x1b[94m',   // 밝은 파랑
  CpaDealMaker:    '\x1b[31m',   // 빨강
  YmylGuard:       '\x1b[91m',   // 밝은 빨강
  SchemaInjector:  '\x1b[38;5;178m',  // 골드
  HarnessDeployer: '\x1b[96m',   // 밝은 청록
  IndexPusher:     '\x1b[38;5;208m',  // 주황
  ThreadsBot:      '\x1b[38;5;141m',  // 라벤더
  WeeklyBuilder:   '\x1b[38;5;220m',  // 밝은 금
  Orchestrator:    '\x1b[97m',   // 흰색
  Scheduler:       '\x1b[90m',   // 회색
};

const RESET = '\x1b[0m';  // 색상 초기화

/**
 * 에이전트 이름과 함께 로그 메시지를 출력
 */
function log(agentName, message) {
  const color = AGENT_COLORS[agentName] || '\x1b[37m';
  const time = new Date().toLocaleTimeString('ko-KR');
  console.log(`${color}[${time}] [${agentName}] ${message}${RESET}`);
}

function success(agentName, message) {
  log(agentName, `✅ ${message}`);
}

function error(agentName, message) {
  const time = new Date().toLocaleTimeString('ko-KR');
  console.error(`\x1b[31m[${time}] [${agentName}] ❌ ${message}${RESET}`);
}

function warn(agentName, message) {
  const time = new Date().toLocaleTimeString('ko-KR');
  console.warn(`\x1b[33m[${time}] [${agentName}] ⚠️ ${message}${RESET}`);
}

/**
 * 파이프라인 시작/종료 시 보여주는 큰 배너
 */
function banner(text) {
  console.log('\n' + '='.repeat(60));
  console.log(`  🚀 ${text}`);
  console.log('='.repeat(60) + '\n');
}

module.exports = { log, success, error, warn, banner };
