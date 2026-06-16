#!/usr/bin/env node
/**
 * fetch-naver-keywords — 네이버 검색광고 API(키워드 도구)로 월간 검색량 수집.
 *
 *   목적: 한국 검색의 60%인 네이버에서 실제 "월간 검색수"와 "경쟁정도"를 받아
 *         포스팅 주제·제목을 데이터로 선정. (GSC와 상호 보완)
 *
 *   실행: npm run keywords:naver -- "ETF" "월배당 ETF" "금 ETF"
 *         (씨앗 키워드 여러 개. 안 적으면 기본 ETF 씨앗으로 조회)
 *
 *   필요한 것(한 번만 세팅 — docs/KEYWORD-RESEARCH-SETUP.md 참고):
 *     네이버 검색광고(searchad.naver.com) → 도구 → API 관리에서 발급.
 *     환경변수(.env.local):
 *       NAVER_AD_API_KEY=발급된 액세스라이선스
 *       NAVER_AD_SECRET=비밀키
 *       NAVER_AD_CUSTOMER_ID=고객 ID(숫자)
 *
 *   출력: data/keywords/naver_{YYYYMMDD}.json + 콘솔에 검색량 표.
 *
 *   ⚠️ 비밀키는 .env.local 에만(gitignore). 코드/commit 노출 금지.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

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

const API_KEY = process.env.NAVER_AD_API_KEY;
const SECRET = process.env.NAVER_AD_SECRET;
const CUSTOMER = process.env.NAVER_AD_CUSTOMER_ID;

function die(msg) {
  console.error('\n❌ ' + msg + '\n   → 설정 방법: docs/KEYWORD-RESEARCH-SETUP.md\n');
  process.exit(1);
}
if (!API_KEY || !SECRET || !CUSTOMER) {
  die('NAVER_AD_API_KEY / NAVER_AD_SECRET / NAVER_AD_CUSTOMER_ID 중 일부가 .env.local 에 없습니다.');
}

const BASE = 'https://api.searchad.naver.com';

function signature(ts, method, uri) {
  return crypto.createHmac('sha256', SECRET).update(`${ts}.${method}.${uri}`).digest('base64');
}

// "< 10" 같은 문자열·숫자 모두 정수로
function toNum(v) {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    if (v.includes('<')) return 5; // "< 10" → 5로 근사
    const n = parseInt(v.replace(/[^0-9]/g, ''), 10);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

async function main() {
  // 씨앗 키워드: 인자로 받거나 기본값. 네이버 hintKeywords는 공백 제거 권장.
  let seeds = process.argv.slice(2).filter(Boolean);
  if (!seeds.length) seeds = ['ETF', '월배당 ETF', '미국 ETF', '금 ETF', '채권 ETF'];
  const hint = seeds.map(s => s.replace(/\s+/g, '')).slice(0, 5).join(','); // 최대 5개 권장

  const uri = '/keywordstool';
  const ts = Date.now().toString();
  const qs = new URLSearchParams({ hintKeywords: hint, showDetail: '1' });

  console.log(`📡 네이버 키워드 검색량 — 씨앗: ${seeds.join(', ')}`);
  const res = await fetch(`${BASE}${uri}?${qs}`, {
    method: 'GET',
    headers: {
      'X-Timestamp': ts,
      'X-API-KEY': API_KEY,
      'X-Customer': String(CUSTOMER),
      'X-Signature': signature(ts, 'GET', uri),
    },
  });
  if (!res.ok) {
    die(`네이버 API 실패(${res.status}). 키/시크릿/고객ID·서명 확인. ${(await res.text()).slice(0, 200)}`);
  }
  const data = await res.json();
  const list = (data.keywordList || []).map(k => {
    const pc = toNum(k.monthlyPcQcCnt);
    const mo = toNum(k.monthlyMobileQcCnt);
    return {
      keyword: k.relKeyword,
      pc, mobile: mo, total: pc + mo,
      comp: k.compIdx || '-',          // 낮음/중간/높음 (경쟁정도)
      avgClicks: toNum(k.monthlyAvePcClkCnt) + toNum(k.monthlyAveMobileClkCnt),
    };
  }).sort((a, b) => b.total - a.total);

  const outDir = path.join(ROOT, 'data', 'keywords');
  fs.mkdirSync(outDir, { recursive: true });
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const outFile = path.join(outDir, `naver_${stamp}.json`);
  fs.writeFileSync(outFile, JSON.stringify({ seeds, count: list.length, list }, null, 2));

  const fmt = (k) => `  ${String(k.total).padStart(8)}회/월 (PC ${k.pc} / 모바일 ${k.mobile})  경쟁 ${String(k.comp).padStart(2)}  ${k.keyword}`;
  console.log(`\n✅ 연관 키워드 ${list.length}건 (월간 검색수 합계 내림차순) — 상위 40\n`);
  console.log(list.slice(0, 40).map(fmt).join('\n') || '  (없음)');
  console.log(`\n💡 팁: 검색량 높고 "경쟁 낮음"인 키워드가 신규 사이트에 빠른 트래픽 후보.`);
  console.log(`💾 저장: ${path.relative(ROOT, outFile)}\n`);
}

main().catch(e => die(e.message));
