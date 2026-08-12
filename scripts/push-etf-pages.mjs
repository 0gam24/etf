/**
 * /etf/{slug} 색인 통보 — 일괄 제출
 *
 *   배경: 2026-08-12 시세 수집 상한을 100→1500으로 고치면서 색인 가능한 종목 페이지가
 *   105쪽에서 1,160쪽으로 늘었다. 그런데 기존 색인 통보 경로(agents/11_index_pusher.js)는
 *   "당일 발행한 글"만 대상으로 잡아, 새로 열린 1,055쪽은 아무에게도 통보되지 않았다.
 *   sitemap 크롤만 기다리면 수 주가 걸린다.
 *
 *   IndexNow는 1회 10,000 URL까지 허용하므로 단발 제출로 끝난다.
 *
 *   실행: npm run push:etf
 *         npm run push:etf -- --dry     (대상만 확인)
 *         npm run push:etf -- --limit=50
 */
import fs from 'node:fs';
import path from 'node:path';
import pkg from '../pipeline/index_pusher.js';
const { submitIndexNow, pingNaverSitemap } = pkg;

const ROOT = process.cwd();

// .env.local 로드 (SITE_URL·INDEXNOW_KEY)
for (const f of ['.env.local', '.env']) {
  const p = path.join(ROOT, f);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, 'utf-8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
}

const args = Object.fromEntries(
  process.argv.slice(2).filter(a => a.startsWith('--')).map(a => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? 'true'];
  }),
);
const DRY = args.dry === 'true';
const LIMIT = Number(args.limit) || 0;

const SITE = (process.env.SITE_URL || 'https://iknowhowinfo.com').replace(/\/+$/, '');

// 색인 가능한 종목만 — sitemap-etf.xml과 같은 기준(shouldIndexEtf)을 쓰는 게 원칙이지만
// 그 함수는 TS 모듈이라 여기서는 이미 생성된 sitemap-etf.xml을 신뢰해 읽는다.
// 사이트맵이 곧 "우리가 색인을 원한다고 선언한 목록"이므로 통보 대상과 일치해야 한다.
const res = await fetch(`${SITE}/sitemap-etf.xml`);
if (!res.ok) {
  console.error(`❌ sitemap-etf.xml 응답 ${res.status} — 배포 반영을 먼저 확인하세요.`);
  process.exit(1);
}
const xml = await res.text();
let urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
if (LIMIT > 0) urls = urls.slice(0, LIMIT);

console.log(`── /etf 색인 통보 ──`);
console.log(`  sitemap-etf.xml 기준 대상: ${urls.length}건`);
console.log(`  예시: ${urls.slice(0, 3).map(u => u.replace(SITE, '')).join(', ')}`);

if (DRY) {
  console.log('\n(--dry) 요청 미발송.');
  process.exit(0);
}

const key = process.env.INDEXNOW_KEY || '';
if (!key) {
  console.log('\n○ INDEXNOW_KEY 미설정 — 통보 skip (sitemap ping만 수행)');
} else {
  const r = await submitIndexNow(urls, key);
  if (r.ok) {
    console.log(`\n✔ IndexNow 제출 완료 (status ${r.status})`);
    if (r.naver) console.log(`  네이버 전용 엔드포인트: 성공 ${r.naver.submitted} / 실패 ${r.naver.failed}`);
  } else {
    console.log(`\n✖ IndexNow 실패: ${r.reason || r.status}`);
  }
}

const ping = await pingNaverSitemap(SITE);
console.log(`  sitemap ping: ${ping.sitemapsRefreshed}/${ping.sitemapsTotal} 갱신`);
console.log('완료.');
