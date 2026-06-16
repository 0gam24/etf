#!/usr/bin/env node
/**
 * gsc-auth — 구글 서치콘솔 OAuth 인증(일회용). 서비스 계정 대신 "내 구글 계정"으로 로그인.
 *
 *   왜: 서비스 계정 이메일이 GSC 사용자 추가에서 인식 안 될 때, 이미 GSC 주인인
 *       내 계정으로 직접 인증하면 "이메일 추가" 단계가 아예 필요 없음.
 *
 *   실행: npm run keywords:gsc-auth
 *     1) 콘솔에 뜨는 URL을 브라우저에서 열기
 *     2) GSC 소유 구글 계정으로 로그인 → 허용
 *     3) 자동으로 refresh token을 받아 .env.local 에 저장
 *
 *   필요한 것(1회): 구글 클라우드에서 "OAuth 클라이언트 ID"(애플리케이션 유형: 데스크톱 앱) 발급.
 *     → docs/KEYWORD-RESEARCH-SETUP.md 참고. .env.local 에:
 *         GSC_OAUTH_CLIENT_ID=...
 *         GSC_OAUTH_CLIENT_SECRET=...
 */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';

const ROOT = process.cwd();
const ENV_PATH = path.join(ROOT, '.env.local');
const PORT = 4321;
const REDIRECT = `http://localhost:${PORT}`;
const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';

function loadEnvLocal() {
  if (!fs.existsSync(ENV_PATH)) return;
  for (const line of fs.readFileSync(ENV_PATH, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) {
      let v = m[2].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      else v = v.replace(/\s+#.*$/, '').trim(); // 줄 끝 인라인 주석(# ...) 무시
      process.env[m[1]] = v;
    }
  }
}
loadEnvLocal();

const CLIENT_ID = process.env.GSC_OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.GSC_OAUTH_CLIENT_SECRET;

function die(msg) {
  console.error('\n❌ ' + msg + '\n   → 설정 방법: docs/KEYWORD-RESEARCH-SETUP.md\n');
  process.exit(1);
}
if (!CLIENT_ID || !CLIENT_SECRET) {
  die('GSC_OAUTH_CLIENT_ID / GSC_OAUTH_CLIENT_SECRET 가 .env.local 에 없습니다.\n   구글 클라우드 → 사용자 인증 정보 → OAuth 클라이언트 ID(데스크톱 앱)에서 발급하세요.');
}

const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
  client_id: CLIENT_ID,
  redirect_uri: REDIRECT,
  response_type: 'code',
  scope: SCOPE,
  access_type: 'offline',
  prompt: 'consent',
});

function upsertEnv(key, value) {
  let txt = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, 'utf8') : '';
  const line = `${key}=${value}`;
  if (new RegExp(`^${key}=`, 'm').test(txt)) {
    txt = txt.replace(new RegExp(`^${key}=.*$`, 'm'), line);
  } else {
    txt = txt.replace(/\s*$/, '') + `\n${line}\n`;
  }
  fs.writeFileSync(ENV_PATH, txt);
}

async function exchange(code) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code, client_id: CLIENT_ID, client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT, grant_type: 'authorization_code',
    }),
  });
  if (!res.ok) throw new Error(`토큰 교환 실패(${res.status}): ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

console.log('\n🔐 구글 서치콘솔 OAuth 인증');
console.log('\n1) 아래 URL을 브라우저에 붙여넣어 열고, GSC 소유 계정으로 로그인 → 허용:\n');
console.log('   ' + authUrl + '\n');
console.log(`2) 허용하면 이 창이 자동으로 인증을 마칩니다(로컬 ${REDIRECT} 대기 중)…\n`);

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT);
  const code = url.searchParams.get('code');
  const err = url.searchParams.get('error');
  if (err) {
    res.end('인증 거부됨: ' + err + ' — 터미널로 돌아가세요.');
    die('사용자가 인증을 거부했습니다.');
  }
  if (!code) { res.end('대기 중…'); return; }
  try {
    const tok = await exchange(code);
    if (!tok.refresh_token) {
      res.end('refresh token이 없습니다. 터미널 안내를 확인하세요.');
      die('refresh_token 미발급 — 이미 동의한 적이 있으면, 구글 계정 보안→권한에서 앱 접근을 제거한 뒤 다시 시도하세요(prompt=consent 적용됨).');
    }
    upsertEnv('GSC_REFRESH_TOKEN', tok.refresh_token);
    res.end('✅ 인증 완료! 이 창을 닫고 터미널로 돌아가세요.');
    console.log('✅ refresh token 발급 → .env.local 에 GSC_REFRESH_TOKEN 저장 완료.');
    console.log('   이제 `npm run keywords:gsc` 로 데이터를 수집할 수 있습니다.\n');
    server.close();
    process.exit(0);
  } catch (e) {
    res.end('오류: ' + e.message);
    die(e.message);
  }
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') die(`포트 ${PORT}가 사용 중입니다. 다른 프로그램을 끄고 다시 실행하세요.`);
  die(e.message);
});
server.listen(PORT);
