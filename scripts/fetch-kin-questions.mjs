/**
 * 네이버 지식iN 질문 수집 — 주제 선정용 수요 코퍼스
 *
 *   왜 필요한가:
 *     CLAUDE.md "주제 선정 규칙"상 글 주제는 지식iN 실제 질문 수요에서만 뽑는다.
 *     그런데 기존 코퍼스(kin-20260718.json)는 103건에 그쳐 금방 소진됐고,
 *     2026-07-27 이후 16일간 발행이 멈추는 원인 중 하나가 됐다.
 *
 *   103건에 그친 진짜 이유:
 *     API 차단이 아니라 씨앗 설계였다. 범용어 소수 + 1페이지만 받아왔다.
 *     이 스크립트는 도메인 문구를 씨앗으로 쓰고 start를 넘겨 여러 페이지를 받는다.
 *     실측: 씨앗 6개 x 2페이지로 중복 제거 후 337건(기존에 없던 신규 331건).
 *
 *   인증: 네이버 검색 API(NAVER_CLIENT_ID / NAVER_CLIENT_SECRET).
 *     ※ 광고 API 키(NAVER_AD_API_KEY)와 다른 것이다. 이 둘을 혼동해
 *       "수집 불가"로 오판한 적이 있어 적어둔다.
 *
 *   실행: npm run keywords:kin
 *         npm run keywords:kin -- --seeds=20 --pages=3
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'data', 'keywords', 'kin');

function readEnv(key) {
  for (const f of ['.env.local', '.env']) {
    const p = path.join(ROOT, f);
    if (!fs.existsSync(p)) continue;
    const m = fs.readFileSync(p, 'utf-8').match(new RegExp('^' + key + '=(.*)$', 'm'));
    if (m && m[1].trim()) return m[1].trim().replace(/^["']|["']$/g, '');
  }
  return process.env[key] || '';
}

/**
 * 씨앗 문구 — 4개 분야(ETF·주식·코인·금융)에 한정한 도메인 표현.
 *   범용어("주식", "투자")를 쓰면 분야 밖 질문이 대량으로 섞인다.
 */
const SEEDS = [
  'ETF 세금', 'ETF 분배금', 'ETF 괴리율', 'ETF 상장폐지', 'ETF 총보수',
  '월배당 ETF', '커버드콜 ETF', '레버리지 ETF', '인버스 ETF', '채권 ETF',
  'S&P500 ETF', '나스닥100 ETF', '금 ETF', '리츠 ETF', '배당주 ETF',
  '연금저축 ETF', 'IRP ETF', 'ISA 계좌', 'ISA 만기', '퇴직연금 디폴트옵션',
  '연금저축 인출', '퇴직연금 수령', '연금소득세',
  '해외주식 양도소득세', '배당소득세', '금융소득 종합과세', '건강보험료 배당',
  '증권사 계좌', '주식 배당금', '배당락일',
  '비트코인 세금', '코인 선물', '가상자산 신고',
  '증여세 주식', '상속세 주식', '해외 ETF 직구',
];

const args = Object.fromEntries(
  process.argv.slice(2).filter(a => a.startsWith('--')).map(a => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? 'true'];
  }),
);
const SEED_LIMIT = Number(args.seeds) || SEEDS.length;
const PAGES = Number(args.pages) || 3;   // start = 1, 101, 201
const DRY = args.dry === 'true';

const id = readEnv('NAVER_CLIENT_ID');
const secret = readEnv('NAVER_CLIENT_SECRET');
if (!id || !secret) {
  console.error('❌ NAVER_CLIENT_ID / NAVER_CLIENT_SECRET 가 .env.local 에 없습니다.');
  console.error('   ※ NAVER_AD_API_KEY(광고 API)와는 다른 키입니다.');
  process.exit(1);
}

const stripTags = s => String(s || '').replace(/<[^>]*>/g, '').replace(/&quot;/g, '"')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').trim();

/** 4개 분야 밖 질문 제외 — 이혼·경매·복지 등이 대량으로 섞여 들어온다 */
const DOMAIN_RE = /ETF|etf|주식|증권|코인|비트코인|가상자산|배당|분배금|연금|IRP|ISA|퇴직|세금|양도소득|증여|상속|펀드|채권|투자|계좌|수익률|나스닥|S&P|코스피|코스닥|리츠|금융소득|건강보험료/;
const EXCLUDE_RE = /이혼|위자료|양육비|경매|임차권|전세사기|월드컵|운세|만화|게임 아이템|중고차|성형|다이어트/;

async function search(query, start) {
  const url = `https://openapi.naver.com/v1/search/kin.json?query=${encodeURIComponent(query)}&display=100&start=${start}&sort=sim`;
  const r = await fetch(url, {
    headers: { 'X-Naver-Client-Id': id, 'X-Naver-Client-Secret': secret },
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

const collected = new Map();   // docId -> item
let calls = 0, errors = 0, filtered = 0;

for (const seed of SEEDS.slice(0, SEED_LIMIT)) {
  for (let p = 0; p < PAGES; p++) {
    const start = p * 100 + 1;
    if (start > 1000) break;               // 네이버 검색 API start 상한
    try {
      const j = await search(seed, start);
      calls++;
      for (const it of (j.items || [])) {
        const m = (it.link || '').match(/docId=(\d+)/);
        if (!m) continue;
        const docId = m[1];
        if (collected.has(docId)) continue;
        const title = stripTags(it.title);
        const preview = stripTags(it.description);
        const blob = `${title} ${preview}`;
        if (!DOMAIN_RE.test(blob) || EXCLUDE_RE.test(blob)) { filtered++; continue; }
        collected.set(docId, {
          docId,
          title,
          preview: preview.slice(0, 300),
          url: it.link,
          seed,
        });
      }
      await new Promise(r => setTimeout(r, 120));   // 예의상 간격
    } catch (e) {
      errors++;
      console.warn(`  ⚠️ [${seed} start=${start}] ${e.message}`);
    }
  }
}

// 기존 코퍼스 전체와 대조해 신규만 표시 (발행에 이미 쓴 것 파악용)
const existingIds = new Set();
if (fs.existsSync(OUT_DIR)) {
  for (const f of fs.readdirSync(OUT_DIR).filter(x => x.endsWith('.json'))) {
    try {
      const j = JSON.parse(fs.readFileSync(path.join(OUT_DIR, f), 'utf-8'));
      for (const q of (Array.isArray(j) ? j : j.questions || [])) existingIds.add(String(q.docId));
    } catch { /* skip */ }
  }
}
const items = [...collected.values()];
const fresh = items.filter(q => !existingIds.has(q.docId));

console.log(`\n── 지식iN 수집 결과 ──`);
console.log(`  씨앗 ${Math.min(SEED_LIMIT, SEEDS.length)}개 x ${PAGES}페이지 · API 호출 ${calls}회 (실패 ${errors})`);
console.log(`  도메인 밖으로 걸러낸 질문: ${filtered}건`);
console.log(`  수집(중복 제거): ${items.length}건`);
console.log(`  기존 코퍼스에 없는 신규: ${fresh.length}건`);

if (DRY) {
  console.log('\n(--dry) 저장하지 않았습니다. 상위 10건:');
  items.slice(0, 10).forEach(q => console.log(`   [${q.seed}] ${q.title.slice(0, 60)}`));
  process.exit(0);
}

const d = new Date();
const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
fs.mkdirSync(OUT_DIR, { recursive: true });
const outFile = path.join(OUT_DIR, `kin-${ymd}.json`);
fs.writeFileSync(outFile, JSON.stringify(items, null, 2), 'utf-8');
console.log(`\n💾 저장: ${path.relative(ROOT, outFile)}`);
