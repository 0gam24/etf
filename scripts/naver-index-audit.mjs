#!/usr/bin/env node
/**
 * naver-index-audit: 우리 페이지가 네이버 웹문서 색인에 들어 있는지 페이지별로 확인한다.
 *
 * 2026-10-07 측정에서 빈틈 검색어 128건 중 우리 글이 웹문서 30위 안에 든 것은 3건뿐이었다.
 * 글이 색인에 없는 것인지, 색인은 됐는데 순위가 낮은 것인지에 따라 할 일이 다르다
 * (없으면 수집 요청·IndexNow, 있으면 본문 보강). 그 구분을 이 스크립트가 한다.
 *
 * 방법: 공식 웹문서 검색 API 에 "site:iknowhowinfo.com {페이지 제목}" 을 넣어 그 주소가 결과에 나오는지 본다.
 * 대상: 가이드 전체, 비교 페이지 전체, 시가총액 상위 /etf 100쪽(--etf=N 으로 조절).
 * 출력: data/keywords/naver-index-YYYYMMDD.json
 *
 * 사용: node scripts/naver-index-audit.mjs [--etf=100] [--only=guide|compare|etf]
 */
import fs from 'node:fs';
import path from 'node:path';
import { createJiti } from 'jiti';

const ROOT = process.cwd();
const SITE = 'iknowhowinfo.com';
const DELAY_MS = 130;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function loadEnvLocal() {
  const p = path.join(ROOT, '.env.local');
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
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
if (!ID || !SECRET) {
  console.error('NAVER_CLIENT_ID / NAVER_CLIENT_SECRET 가 .env.local 에 없습니다.');
  process.exit(1);
}

let calls = 0;
async function webkr(query) {
  const url = `https://openapi.naver.com/v1/search/webkr.json?query=${encodeURIComponent(query)}&display=30&start=1`;
  for (let attempt = 0; attempt < 4; attempt++) {
    calls++;
    let res;
    try {
      res = await fetch(url, { headers: { 'X-Naver-Client-Id': ID, 'X-Naver-Client-Secret': SECRET } });
    } catch {
      await sleep(1500 * (attempt + 1));
      continue;
    }
    if (res.status === 429) {
      await sleep(1500 * (attempt + 1));
      continue;
    }
    if (!res.ok) throw new Error(`webkr HTTP ${res.status}`);
    await sleep(DELAY_MS);
    return res.json();
  }
  throw new Error('webkr 재시도 초과');
}

const normPath = (u) => {
  try {
    const x = new URL(u);
    return decodeURIComponent(x.pathname).replace(/\/+$/, '').toLowerCase() || '/';
  } catch {
    return '';
  }
};

async function main() {
  const args = process.argv.slice(2);
  const etfN = Number(args.find((a) => a.startsWith('--etf='))?.slice(6) ?? 100);
  const only = args.find((a) => a.startsWith('--only='))?.slice(7);

  const jiti = createJiti(`${ROOT}/`, { alias: { '@': `${ROOT}/src` } });
  const { GUIDES, GUIDE_PUBLISHED_AT } = await jiti.import('./src/lib/guides.ts');
  const { COMPARE_PAIRS } = await jiti.import('./src/lib/etf-compare-pairs.ts');
  const krx = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/krx-etf-codes.json'), 'utf8'));
  const slugMap = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/etf-slug-map.json'), 'utf8'));
  const snapFile = fs
    .readdirSync(path.join(ROOT, 'data/raw'))
    .filter((f) => /^etf_prices_\d{8}\.json$/.test(f))
    .sort()
    .at(-1);
  const snap = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/raw', snapFile), 'utf8'));

  const targets = [];
  if (!only || only === 'guide') {
    for (const g of GUIDES) {
      targets.push({
        type: 'guide',
        path: `/guide/${g.slug}`,
        title: g.title,
        publishedAt: GUIDE_PUBLISHED_AT[g.slug] || null,
      });
    }
  }
  if (!only || only === 'compare') {
    const nameOf = (c) => krx.byShortcode?.[c]?.name || c;
    for (const p of COMPARE_PAIRS) {
      targets.push({ type: 'compare', path: `/compare/${p.slug}`, title: `${nameOf(p.codeA)} vs ${nameOf(p.codeB)}` });
    }
  }
  if (!only || only === 'etf') {
    const rows = (snap.data?.etfList || []).slice().sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));
    for (const r of rows.slice(0, etfN)) {
      const slug = slugMap.byCode?.[r.code];
      if (slug) targets.push({ type: 'etf', path: `/etf/${slug}`, title: r.name, code: r.code });
    }
  }

  console.error(`대상 ${targets.length}쪽 확인 시작`);
  for (const [i, t] of targets.entries()) {
    // 제목 앞부분만(긴 제목은 검색어가 길어져 결과가 비는 일이 있다)
    const head = t.title.split(/[—,:|]/)[0].trim().slice(0, 40);
    try {
      const j = await webkr(`site:${SITE} ${head}`);
      const items = j.items || [];
      const want = t.path.toLowerCase();
      const pos = items.findIndex((it) => normPath(it.link) === want);
      t.indexed = pos >= 0;
      if (pos >= 0) t.indexedTitle = String(items[pos].title || '').replace(/<[^>]+>/g, '');
      t.siteHits = j.total ?? null;
    } catch (e) {
      t.error = String(e.message || e);
    }
    if ((i + 1) % 50 === 0) console.error(`  ${i + 1}/${targets.length}`);
  }

  const sum = (type) => {
    const xs = targets.filter((t) => t.type === type && !t.error);
    return { checked: xs.length, indexed: xs.filter((t) => t.indexed).length };
  };
  const byMonth = {};
  for (const t of targets.filter((t) => t.type === 'guide' && t.publishedAt && !t.error)) {
    const m = t.publishedAt.slice(0, 7);
    byMonth[m] ??= { checked: 0, indexed: 0 };
    byMonth[m].checked++;
    if (t.indexed) byMonth[m].indexed++;
  }
  const out = {
    measuredAt: new Date().toISOString(),
    method: `네이버 웹문서 검색 API "site:${SITE} {제목 앞부분}" 상위 30 안에 그 주소가 있으면 색인으로 본다`,
    summary: { guide: sum('guide'), compare: sum('compare'), etf: sum('etf'), guideByMonth: byMonth },
    calls,
    targets,
  };
  const day = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10).replace(/-/g, '');
  const file = path.join(ROOT, 'data/keywords', `naver-index-${day}.json`);
  fs.writeFileSync(file, `${JSON.stringify(out, null, 2)}\n`);
  console.error(`저장 ${path.relative(ROOT, file)} · API 호출 ${calls}회`);
  console.log(JSON.stringify(out.summary, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
