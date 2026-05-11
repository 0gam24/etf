#!/usr/bin/env node
/**
 * sync-env — .env.example 의 키 중 .env.local 에 없는 것만 안전하게 append.
 *
 *   ⚠️ 기존 .env.local 의 값은 절대 건드리지 않음. 새 키만 빈 값으로 끝에 추가.
 *   ⚠️ 키 값 자체는 stdout 에 노출하지 않음 (key 이름만 보고).
 *
 *   사용:
 *     node scripts/sync-env.mjs           # 누락 키만 확인 (dry-run, 파일 변경 X)
 *     node scripts/sync-env.mjs --apply   # 누락 키를 .env.local 끝에 빈 값으로 append
 *
 *   .env.local 이 없으면 .env.example 을 그대로 복사 후 안내.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const EXAMPLE = path.join(ROOT, '.env.example');
const LOCAL = path.join(ROOT, '.env.local');

const APPLY = process.argv.includes('--apply');

function extractKeys(content) {
  const keys = new Set();
  for (const raw of content.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=/);
    if (m) keys.add(m[1]);
  }
  return keys;
}

function commentBlockBeforeKey(content, key) {
  // .env.example 에서 해당 키 직전의 주석 블록을 함께 가져옴 (사용자 안내용).
  const lines = content.split(/\r?\n/);
  const idx = lines.findIndex(l => new RegExp(`^${key}\\s*=`).test(l.trim()));
  if (idx === -1) return null;
  const block = [];
  for (let i = idx - 1; i >= 0; i--) {
    const t = lines[i].trim();
    if (t === '' || t.startsWith('#')) {
      block.unshift(lines[i]);
    } else {
      break;
    }
  }
  block.push(lines[idx]);
  return block.join('\n');
}

function main() {
  if (!fs.existsSync(EXAMPLE)) {
    console.error('❌ .env.example 없음 — 작업 중단');
    process.exit(1);
  }

  const exampleContent = fs.readFileSync(EXAMPLE, 'utf-8');
  const exampleKeys = extractKeys(exampleContent);

  if (!fs.existsSync(LOCAL)) {
    console.log('ℹ️  .env.local 없음 — .env.example 그대로 복사');
    if (APPLY) {
      fs.copyFileSync(EXAMPLE, LOCAL);
      console.log(`✅ 생성: ${LOCAL}`);
      console.log('   다음 단계: .env.local 을 열어 각 키 값을 채워주세요 (SETUP.md 참고).');
    } else {
      console.log('   (dry-run) --apply 추가하면 실제 복사. SETUP.md §1 참고.');
    }
    return;
  }

  const localContent = fs.readFileSync(LOCAL, 'utf-8');
  const localKeys = extractKeys(localContent);

  const missing = [...exampleKeys].filter(k => !localKeys.has(k));

  if (missing.length === 0) {
    console.log('✅ .env.local 에 .env.example 의 모든 키가 이미 있음 — 동기화 완료');
    console.log(`   (.env.example: ${exampleKeys.size}개 / .env.local: ${localKeys.size}개)`);
    return;
  }

  console.log(`🔍 .env.local 에 누락된 키 ${missing.length}개 발견:`);
  missing.forEach(k => console.log(`   - ${k}`));
  console.log('');

  if (!APPLY) {
    console.log('ℹ️  dry-run 모드 — 변경 없음.');
    console.log('   적용하려면: node scripts/sync-env.mjs --apply');
    console.log('   적용 후 .env.local 을 열어 새로 추가된 키에 값을 채워주세요.');
    return;
  }

  // --apply: 각 키의 주석 블록과 함께 append
  const appendLines = [];
  appendLines.push('');
  appendLines.push('# ─────────────────────────────────────────────');
  appendLines.push(`# sync-env 자동 추가 (${new Date().toISOString()})`);
  appendLines.push('# 아래 키들의 값을 채워주세요. 발급 가이드: SETUP.md');
  appendLines.push('# ─────────────────────────────────────────────');
  for (const key of missing) {
    const block = commentBlockBeforeKey(exampleContent, key);
    if (block) {
      appendLines.push('');
      appendLines.push(block);
    } else {
      appendLines.push(`${key}=`);
    }
  }

  // 기존 .env.local 끝에 줄바꿈이 있는지 확인 후 안전하게 append
  const needsNewline = !localContent.endsWith('\n');
  const finalAppend = (needsNewline ? '\n' : '') + appendLines.join('\n') + '\n';

  fs.appendFileSync(LOCAL, finalAppend, 'utf-8');
  console.log(`✅ ${missing.length}개 키를 .env.local 끝에 빈 값으로 append 완료`);
  console.log(`   파일: ${LOCAL}`);
  console.log('   다음 단계:');
  console.log('   1. .env.local 을 텍스트 에디터로 열기');
  console.log('   2. 파일 끝 "sync-env 자동 추가" 섹션의 새 키들에 값 채우기');
  console.log('   3. (선택) GitHub Actions Secrets + Cloudflare 환경변수에도 동일 등록 (SETUP.md §2~§3)');
}

main();
