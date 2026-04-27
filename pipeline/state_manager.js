/**
 * State Manager — Daily ETF Pulse 파이프라인 공용 I/O
 *   10개 에이전트(DataMiner·SeoArchitect·NewsCollector·LogicSpecialist·Visualizer·
 *   FrontendPlanner·UiDesigner·CpaDealMaker·YmylGuard·HarnessDeployer)가
 *   중간 결과물을 data/raw·processed·keywords JSON으로 주고받는 경로 헬퍼.
 *
 *   또한 ensureDirectories()로 pulse/surge/flow/income + theme/[4] + account/[3]
 *   콘텐츠 디렉토리를 자동 생성한다.
 */

const fs = require('fs');
const path = require('path');

// 데이터 저장 폴더 경로들
const PATHS = {
  dataDir: path.join(__dirname, '..', 'data'),
  rawDir: path.join(__dirname, '..', 'data', 'raw'),
  processedDir: path.join(__dirname, '..', 'data', 'processed'),
  keywordsDir: path.join(__dirname, '..', 'data', 'keywords'),
  contentDir: path.join(__dirname, '..', 'content'),
  logsDir: path.join(__dirname, '..', 'logs'),
};

/**
 * 필요한 폴더가 없으면 자동으로 만들어주는 함수
 */
function ensureDirectories() {
  const allDirs = [
    ...Object.values(PATHS),
    path.join(PATHS.contentDir, 'pulse'),
    path.join(PATHS.contentDir, 'surge'),
    path.join(PATHS.contentDir, 'flow'),
    path.join(PATHS.contentDir, 'income'),
    path.join(PATHS.contentDir, 'theme', 'ai'),
    path.join(PATHS.contentDir, 'theme', 'semi'),
    path.join(PATHS.contentDir, 'theme', 'shipbuilding'),
    path.join(PATHS.contentDir, 'theme', 'defense'),
    path.join(PATHS.contentDir, 'account', 'irp'),
    path.join(PATHS.contentDir, 'account', 'isa'),
    path.join(PATHS.contentDir, 'account', 'pension'),
    path.join(PATHS.rawDir, 'pulse_images'),
    path.join(PATHS.rawDir, 'news'),
  ];

  for (const dir of allDirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 폴더 생성: ${dir}`);
    }
  }
}

/**
 * 에이전트가 작업 결과를 JSON 파일로 저장하는 함수
 * 
 * @param {string} agentName - 에이전트 이름 (예: 'data_miner')
 * @param {string} dataType  - 데이터 종류 (예: 'raw', 'processed', 'keywords')
 * @param {string} fileName  - 파일 이름 (예: 'etf_prices_20240101.json')
 * @param {object} data      - 저장할 데이터 (자바스크립트 객체)
 */
function saveData(agentName, dataType, fileName, data) {
  const dirMap = {
    raw: PATHS.rawDir,
    processed: PATHS.processedDir,
    keywords: PATHS.keywordsDir,
    content: PATHS.contentDir,
  };

  const targetDir = dirMap[dataType] || PATHS.processedDir;
  const filePath = path.join(targetDir, fileName);

  // 데이터에 메타 정보를 자동으로 추가
  const wrappedData = {
    _meta: {
      createdBy: agentName,
      createdAt: new Date().toISOString(),
      fileName: fileName,
    },
    data: data,
  };

  // fs.writeFileSync 실패는 로그만 — pipeline 전체 중단 회피 (disk full · perm 등 비치명 케이스)
  try {
    fs.writeFileSync(filePath, JSON.stringify(wrappedData, null, 2), 'utf-8');
    console.log(`💾 [${agentName}] 저장 완료: ${filePath}`);
    return filePath;
  } catch (err) {
    console.warn(`⚠️ [${agentName}] 저장 실패 (${filePath}): ${err.message} — pipeline 계속 진행`);
    return null;
  }
}

/**
 * 저장된 JSON 파일을 읽어오는 함수
 * 
 * @param {string} dataType - 데이터 종류 (예: 'raw', 'processed')
 * @param {string} fileName - 파일 이름
 * @returns {object} 읽어온 데이터
 */
function loadData(dataType, fileName) {
  const dirMap = {
    raw: PATHS.rawDir,
    processed: PATHS.processedDir,
    keywords: PATHS.keywordsDir,
    content: PATHS.contentDir,
  };

  const targetDir = dirMap[dataType] || PATHS.processedDir;
  const filePath = path.join(targetDir, fileName);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ 파일을 찾을 수 없습니다: ${filePath}`);
    return null;
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  const parsed = JSON.parse(raw);
  console.log(`📖 데이터 로드 완료: ${filePath}`);
  return parsed.data || parsed;
}

/**
 * 오늘 날짜를 YYYYMMDD 형식으로 반환 (파일명에 사용)
 */
function getToday() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

/**
 * 파이프라인 실행 상태를 기록하는 함수
 * 각 에이전트가 언제 시작하고 끝났는지 추적합니다.
 */
function logPipelineStep(agentName, status, details = {}) {
  const logFile = path.join(PATHS.logsDir, `pipeline_${getToday()}.json`);

  let logs = [];
  if (fs.existsSync(logFile)) {
    logs = JSON.parse(fs.readFileSync(logFile, 'utf-8'));
  }

  logs.push({
    agent: agentName,
    status: status,  // 'started', 'completed', 'failed'
    timestamp: new Date().toISOString(),
    ...details,
  });

  fs.writeFileSync(logFile, JSON.stringify(logs, null, 2), 'utf-8');
}

module.exports = {
  PATHS,
  ensureDirectories,
  saveData,
  loadData,
  getToday,
  logPipelineStep,
};
