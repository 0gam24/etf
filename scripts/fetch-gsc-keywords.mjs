#!/usr/bin/env node
/**
 * fetch-gsc-keywords — 구글 서치콘솔(GSC) 키워드 자동 수집.
 *
 *   목적: "이미 노출되는데 순위가 애매한(striking distance)" 키워드를 찾아
 *         다음 포스팅 주제를 데이터로 선정. (추측 대신 실측)
 *
 *   실행: npm run keywords:gsc
 *
 *   필요한 것(한 번만 세팅 — docs/KEYWORD-RESEARCH-SETUP.md 참고):
 *     - 구글 클라우드 서비스 계정 JSON 파일 (프로젝트 루트에 gsc-service-account.json)
 *       → .gitignore 로 자동 차단됨(*-service-account.json). 절대 commit 금지.
 *     - 그 서비스 계정 이메일을 GSC 속성에 "사용자 추가"
 *     - 환경변수(.env.local):
 *         GSC_SITE_URL=sc-domain:iknowhowinfo.com   (도메인 속성이면 sc-domain: 접두)
 *         GSC_SA_JSON=gsc-service-account.json        (파일 경로, 기본값 동일)
 *
 *   출력: data/keywords/gsc_{YYYYMMDD}.json + 콘솔에 상위 표.
 *
 *   ⚠️ 시세 데이터 아님. 검색 노출/클릭/순위 데이터(읽기 전용 권한).
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();

// ── 작은 .env.local 로더 (dotenv 의존 없이) ──
function loadEnvLocal() {
  const p = path.join(ROOT, '.env.local');
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
loadEnvLocal();

const SITE_URL = process.env.GSC_SITE_URL || 'sc-domain:iknowhowinfo.com';
const SA_PATH = path.join(ROOT, process.env.GSC_SA_JSON || 'gsc-service-account.json');

function die(msg) {
  console.error('\n❌ ' + msg + '\n   → 설정 방법: docs/KEYWORD-RESEARCH-SETUP.md\n');
  process.exit(1);
}

if (!fs.existsSync(SA_PATH)) {
  die(`서비스 계정 JSON 없음: ${SA_PATH}\n   구글 클라우드에서 받은 키 파일을 이 경로에 두세요(파일명 gsc-service-account.json 권장).`);
}

let sa;
try {
  sa = JSON.parse(fs.readFileSync(SA_PATH, 'utf8'));
} catch {
  die('서비스 계정 JSON 파싱 실패 — 올바른 키 파일인지 확인하세요.');
}
if (!sa.client_email || !sa.private_key) die('JSON에 client_email/private_key가 없습니다.');

const b64url = (input) => Buffer.from(input).toString('base64url');

async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64url(JSON.stringify({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }));
  const signingInput = `${header}.${claim}`;
  const signature = crypto.createSign('RSA-SHA256').update(signingInput).sign(sa.private_key).toString('base64url');
  const jwt = `${signingInput}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
  });
  if (!res.ok) die(`토큰 발급 실패(${res.status}). 서비스 계정/시간 설정 확인. ${(await res.text()).slice(0, 200)}`);
  return (await res.json()).access_token;
}

function ymd(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

async function main() {
  console.log(`📡 GSC 키워드 수집 — ${SITE_URL}`);
  const token = await getAccessToken();

  const end = new Date(Date.now() - 2 * 86400000);   // GSC는 1~2일 지연 → 2일 전까지
  const start = new Date(Date.now() - 30 * 86400000); // 최근 28일
  const body = {
    startDate: ymd(start),
    endDate: ymd(end),
    dimensions: ['query'],
    rowLimit: 1000,
    dataState: 'all',
  };

  const res = await fetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`,
    { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) },
  );
  if (!res.ok) die(`쿼리 실패(${res.status}). GSC_SITE_URL 형식(sc-domain: 또는 https://...)·사용자 권한 확인. ${(await res.text()).slice(0, 200)}`);

  const rows = (await res.json()).rows || [];
  if (!rows.length) {
    console.log('⚠️ 데이터 0건 — 사이트가 아직 검색 노출이 적거나, 권한/속성 형식을 확인하세요.');
  }

  const all = rows.map(r => ({
    query: r.keys[0],
    clicks: r.clicks || 0,
    impressions: r.impressions || 0,
    ctr: +((r.ctr || 0) * 100).toFixed(2),
    position: +(r.position || 0).toFixed(1),
  }));

  // striking distance: 노출 충분 + 순위 5~20위(거의 1~2페이지) → 조금만 보강하면 상위 진입
  const striking = all
    .filter(r => r.impressions >= 10 && r.position >= 5 && r.position <= 20)
    .sort((a, b) => b.impressions - a.impressions);

  // 노출 많은데 클릭 적음(제목·메타·콘텐츠 보강 기회)
  const lowCtr = all
    .filter(r => r.impressions >= 30 && r.ctr < 3)
    .sort((a, b) => b.impressions - a.impressions);

  const outDir = path.join(ROOT, 'data', 'keywords');
  fs.mkdirSync(outDir, { recursive: true });
  const stamp = ymd(end).replace(/-/g, '');
  const outFile = path.join(outDir, `gsc_${stamp}.json`);
  fs.writeFileSync(outFile, JSON.stringify({
    site: SITE_URL, range: { start: body.startDate, end: body.endDate },
    total: all.length, striking, lowCtr, all,
  }, null, 2));

  const fmt = (r) => `  ${String(r.impressions).padStart(6)}노출 ${String(r.clicks).padStart(4)}클릭 ${String(r.position).padStart(5)}위  ${r.query}`;
  console.log(`\n✅ 쿼리 ${all.length}건 · 기간 ${body.startDate}~${body.endDate}`);
  console.log(`\n🎯 STRIKING DISTANCE (순위 5~20위 = 글 보강하면 빨리 오를 후보) — 상위 30\n`);
  console.log(striking.slice(0, 30).map(fmt).join('\n') || '  (없음)');
  console.log(`\n👀 노출 많은데 클릭 적음(제목·메타 개선 기회) — 상위 15\n`);
  console.log(lowCtr.slice(0, 15).map(fmt).join('\n') || '  (없음)');
  console.log(`\n💾 저장: ${path.relative(ROOT, outFile)}\n`);
}

main().catch(e => die(e.message));
