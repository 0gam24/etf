/**
 * ============================================
 *  🔒 Security Guard (보안 검증기)
 * ============================================
 * 역할: API 키가 안전하게 관리되고 있는지 자동으로 체크
 * 
 * 쉽게 말하면?
 * → 파이프라인이 실행되기 전에 "혹시 키가 노출될 위험이 없나?"를
 *   자동으로 검사해주는 경비원입니다.
 * 
 * 체크 항목:
 *   1. .env.local 파일이 존재하는지
 *   2. 코드 파일에 API 키가 하드코딩되어 있지 않은지
 *   3. .gitignore가 제대로 설정되어 있는지
 *   4. GitHub에 올라가면 안 되는 파일이 없는지
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');

/**
 * 보안 검사 실행
 * 문제가 있으면 경고 메시지를 반환합니다.
 * 
 * @returns {{ passed: boolean, warnings: string[], errors: string[] }}
 */
function runSecurityCheck() {
  const warnings = [];
  const errors = [];

  // ─── 검사 1: .env.local 존재 여부 ───
  const envPath = path.join(PROJECT_ROOT, '.env.local');
  if (!fs.existsSync(envPath)) {
    warnings.push(
      '⚠️ .env.local 파일이 없습니다.\n' +
      '   → .env.example 파일을 복사하여 .env.local로 이름을 바꾸고\n' +
      '   → 실제 API 키를 입력하세요.\n' +
      '   → 명령어: copy .env.example .env.local'
    );
  }

  // ─── 검사 2: .gitignore에 보안 규칙이 있는지 ───
  const gitignorePath = path.join(PROJECT_ROOT, '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gitignore = fs.readFileSync(gitignorePath, 'utf-8');

    const requiredPatterns = ['.env', '.env.local'];
    for (const pattern of requiredPatterns) {
      if (!gitignore.includes(pattern)) {
        errors.push(
          `🚨 .gitignore에 "${pattern}" 패턴이 없습니다!\n` +
          '   → API 키가 GitHub에 올라갈 수 있습니다.\n' +
          `   → .gitignore에 "${pattern}"을 추가하세요.`
        );
      }
    }
  } else {
    errors.push(
      '🚨 .gitignore 파일이 없습니다!\n' +
      '   → 모든 파일이 GitHub에 올라갈 수 있습니다.'
    );
  }

  // ─── 검사 3: 코드 파일에 API 키가 하드코딩되어 있지 않은지 ───
  // 실제 API 키 패턴 (Gemini 키는 "AIza"로 시작)
  const suspiciousPatterns = [
    { pattern: /AIza[A-Za-z0-9_-]{35}/g, name: 'Google API Key' },
    { pattern: /sk-[A-Za-z0-9]{48}/g, name: 'OpenAI API Key' },
    { pattern: /ghp_[A-Za-z0-9]{36}/g, name: 'GitHub Token' },
  ];

  const codeDirs = ['agents', 'pipeline', 'src'];

  for (const dir of codeDirs) {
    const dirPath = path.join(PROJECT_ROOT, dir);
    if (!fs.existsSync(dirPath)) continue;

    scanDirectory(dirPath, (filePath, content) => {
      for (const { pattern, name } of suspiciousPatterns) {
        const matches = content.match(pattern);
        if (matches) {
          const relativePath = path.relative(PROJECT_ROOT, filePath);
          errors.push(
            `🚨 코드에 ${name}가 하드코딩되어 있습니다!\n` +
            `   → 파일: ${relativePath}\n` +
            `   → 발견된 키: ${matches[0].substring(0, 10)}...(이하 생략)\n` +
            `   → 즉시 삭제하고, .env.local에서 불러오도록 변경하세요!\n` +
            `   → 이미 GitHub에 올렸다면, 키를 폐기하고 새로 발급하세요!`
          );
        }
      }
    });
  }

  // ─── 검사 4: .env.local이 .git에 추적되고 있지 않은지 ───
  // (git이 초기화된 경우에만)
  const gitDir = path.join(PROJECT_ROOT, '.git');
  if (fs.existsSync(gitDir) && fs.existsSync(envPath)) {
    try {
      const { execSync } = require('child_process');
      const tracked = execSync('git ls-files .env.local', {
        cwd: PROJECT_ROOT,
        encoding: 'utf-8',
      }).trim();

      if (tracked) {
        errors.push(
          '🚨🚨🚨 .env.local이 Git에 추적되고 있습니다!!!\n' +
          '   → 즉시 다음 명령어를 실행하세요:\n' +
          '   → git rm --cached .env.local\n' +
          '   → git commit -m "보안: .env.local 추적 해제"\n' +
          '   → 그리고 모든 API 키를 폐기하고 새로 발급하세요!'
        );
      }
    } catch {
      // git 명령어 실패 시 무시 (git이 없을 수 있음)
    }
  }

  const passed = errors.length === 0;
  return { passed, warnings, errors };
}

/**
 * 폴더 내 모든 .js, .ts 파일을 재귀적으로 읽어서 콜백 실행
 */
function scanDirectory(dirPath, callback) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory() && entry.name !== 'node_modules') {
      scanDirectory(fullPath, callback);
    } else if (entry.isFile() && /\.(js|ts|tsx|jsx)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      callback(fullPath, content);
    }
  }
}

/**
 * 보안 검사 결과를 보기 좋게 출력
 */
function printReport(result) {
  console.log('\n' + '='.repeat(50));
  console.log('  🔒 보안 검사 결과');
  console.log('='.repeat(50));

  if (result.errors.length > 0) {
    console.log('\n🚨 [치명적 문제] — 반드시 해결해야 합니다!\n');
    result.errors.forEach((e, i) => console.log(`  ${i + 1}. ${e}\n`));
  }

  if (result.warnings.length > 0) {
    console.log('\n⚠️ [경고] — 확인이 필요합니다\n');
    result.warnings.forEach((w, i) => console.log(`  ${i + 1}. ${w}\n`));
  }

  if (result.passed && result.warnings.length === 0) {
    console.log('\n  ✅ 모든 보안 검사를 통과했습니다!\n');
  } else if (result.passed) {
    console.log('\n  ⚠️ 경고가 있지만 실행은 가능합니다.\n');
  } else {
    console.log('\n  ❌ 보안 문제가 있습니다. 해결 후 다시 실행하세요.\n');
  }

  console.log('='.repeat(50) + '\n');
}

// 이 파일을 직접 실행하면 보안 검사 수행
if (require.main === module) {
  const result = runSecurityCheck();
  printReport(result);
  process.exit(result.passed ? 0 : 1);
}

module.exports = { runSecurityCheck, printReport };
