/**
 * .env.local → process.env 로더 (의존성 없음)
 *   Next.js dev/build는 자동 로드하지만, `node pipeline/*.js` 직접 실행 시에는 필요.
 *   orchestrator.js · scheduler.js 최상단에서 require('./env')로 호출.
 */

const fs = require('fs');
const path = require('path');

function loadEnvFile(filename) {
  const envPath = path.join(__dirname, '..', filename);
  if (!fs.existsSync(envPath)) return 0;

  const content = fs.readFileSync(envPath, 'utf-8');
  let count = 0;
  for (const raw of content.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2];
    // trailing inline comment 제거 (단, 따옴표 안은 보존)
    if (!val.startsWith('"') && !val.startsWith("'")) {
      const hash = val.indexOf(' #');
      if (hash >= 0) val = val.slice(0, hash);
    }
    val = val.trim();
    // 따옴표 제거
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    // 이미 설정된 환경변수는 덮어쓰지 않음 (CLI · CI 우선)
    if (process.env[key] === undefined) {
      process.env[key] = val;
      count += 1;
    }
  }
  return count;
}

// 우선순위: .env.local > .env
const loaded = loadEnvFile('.env.local') + loadEnvFile('.env');
if (loaded > 0 && process.env.DEBUG_ENV === '1') {
  console.log(`[env] ${loaded}개 환경변수 로드됨`);
}

module.exports = { loadEnvFile };
