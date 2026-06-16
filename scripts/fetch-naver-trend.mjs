#!/usr/bin/env node
/**
 * fetch-naver-trend — 네이버 데이터랩 "검색어 트렌드"로 키워드 인기도 비교.
 *
 *   기존 오픈 API 키(NAVER_CLIENT_ID/SECRET, 뉴스수집에 쓰던 것 그대로) 사용.
 *   → 절대 검색량이 아니라 "상대 인기도(0~100)"와 추세(상승/하락)를 비교해 주제 선정.
 *
 *   실행: npm run keywords:naver-trend -- "월배당 ETF" "금 ETF" "인도 ETF"
 *         (최대 5개 키워드 비교. 안 적으면 기본 ETF 후보)
 *
 *   사전 1회: developers.naver.com → 내 애플리케이션 → "사용 API"에
 *             **데이터랩(검색어 트렌드)** 추가(체크). (뉴스검색만 등록돼 있으면 401 납니다)
 *
 *   절대 월간 검색량이 필요하면 네이버 "검색광고 API"(npm run keywords:naver)를 쓰세요(별도 키).
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
function loadEnvLocal() {
  const p = path.join(ROOT, '.env.local');
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) {
      let v = m[2].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      else v = v.replace(/\s+#.*$/, '').trim();
      process.env[m[1]] = v;
    }
  }
}
loadEnvLocal();

const ID = process.env.NAVER_CLIENT_ID;
const SECRET = process.env.NAVER_CLIENT_SECRET;

function die(msg) {
  console.error('\n❌ ' + msg + '\n   → 설정 방법: docs/KEYWORD-RESEARCH-SETUP.md\n');
  process.exit(1);
}
if (!ID || !SECRET) die('NAVER_CLIENT_ID / NAVER_CLIENT_SECRET 가 .env.local 에 없습니다.');

function ymd(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

async function main() {
  let seeds = process.argv.slice(2).filter(Boolean);
  if (!seeds.length) seeds = ['월배당 ETF', '미국 ETF', '금 ETF', '인도 ETF', 'TDF'];
  seeds = seeds.slice(0, 5); // 데이터랩 그룹 최대 5

  const end = new Date(Date.now() - 86400000);
  const start = new Date(end.getTime() - 365 * 86400000); // 최근 12개월
  const body = {
    startDate: ymd(start),
    endDate: ymd(end),
    timeUnit: 'month',
    keywordGroups: seeds.map(s => ({ groupName: s, keywords: [s] })),
  };

  console.log(`📡 네이버 데이터랩 트렌드 — ${seeds.join(', ')}`);
  const res = await fetch('https://openapi.naver.com/v1/datalab/search', {
    method: 'POST',
    headers: { 'X-Naver-Client-Id': ID, 'X-Naver-Client-Secret': SECRET, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (res.status === 401) {
    die('데이터랩 API 인증 실패(401). developers.naver.com → 내 애플리케이션 → "사용 API"에 "데이터랩(검색어 트렌드)"를 추가(체크)하세요. (뉴스검색만 등록된 상태면 발생)');
  }
  if (!res.ok) die(`데이터랩 호출 실패(${res.status}): ${(await res.text()).slice(0, 200)}`);

  const json = await res.json();
  const rows = (json.results || []).map(r => {
    const d = r.data || [];
    const last = d.length ? d[d.length - 1].ratio : 0;     // 최근 달 상대 인기도
    const first = d.length ? d[0].ratio : 0;
    const trend = last - first;                            // +면 상승 추세
    return { keyword: r.title, latest: +last.toFixed(1), trend: +trend.toFixed(1) };
  }).sort((a, b) => b.latest - a.latest);

  const outDir = path.join(ROOT, 'data', 'keywords');
  fs.mkdirSync(outDir, { recursive: true });
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const outFile = path.join(outDir, `naver_trend_${stamp}.json`);
  fs.writeFileSync(outFile, JSON.stringify({ range: { start: body.startDate, end: body.endDate }, results: json.results, ranked: rows }, null, 2));

  console.log(`\n✅ 상대 인기도(최근 달, 0~100) 내림차순 — 그룹 간 비교\n`);
  for (const r of rows) {
    const arrow = r.trend > 3 ? '↑ 상승' : r.trend < -3 ? '↓ 하락' : '→ 보합';
    console.log(`  ${String(r.latest).padStart(5)}  ${arrow.padEnd(6)}  ${r.keyword}`);
  }
  console.log(`\n💡 숫자는 절대 검색량이 아니라 "비교군 내 상대값"입니다. 절대량은 검색광고 API(keywords:naver) 사용.`);
  console.log(`💾 저장: ${path.relative(ROOT, outFile)}\n`);
}

main().catch(e => die(e.message));
