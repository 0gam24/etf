#!/usr/bin/env node
/**
 * gsc-url-inspect: 서치콘솔 URL 검사(URL Inspection API)로 "구글이 실제로 색인했는가"를 실측한다.
 *
 *   목적: 사이트맵에 올렸다고 색인된 것이 아니다. 가이드·종목 사전이 실제로
 *         'Submitted and indexed' 인지, 'Crawled - currently not indexed'(품질 보류)인지,
 *         아예 'URL is unknown to Google' 인지 그룹별로 나눠 본다. 정리(prune) 판단의 입력.
 *
 *   실행: node scripts/gsc-url-inspect.mjs            검사 실행 + 저장
 *         node scripts/gsc-url-inspect.mjs --dry      대상 URL 목록만 출력(API 호출 없음)
 *         node scripts/gsc-url-inspect.mjs --limit=2  앞에서 N건만 검사(응답 형태 확인용)
 *         node scripts/gsc-url-inspect.mjs --resummarize  저장된 최신 결과로 요약만 다시 계산(API 호출 없음)
 *   소요: 실측 요청당 약 7초 → 115건에 약 14분.
 *
 *   인증: scripts/fetch-gsc-keywords.mjs 와 같은 흐름.
 *         .env.local 의 GSC_OAUTH_CLIENT_ID / GSC_OAUTH_CLIENT_SECRET / GSC_REFRESH_TOKEN (권장)
 *         또는 서비스 계정 JSON(GSC_SA_JSON, 기본 gsc-service-account.json).
 *         값은 절대 출력하지 않는다.
 *
 *   API: POST https://searchconsole.googleapis.com/v1/urlInspection/index:inspect
 *        body { inspectionUrl, siteUrl: 'sc-domain:iknowhowinfo.com', languageCode: 'en-US' }
 *        응답의 inspectionResult.indexStatusResult 에서 필드를 뽑아 저장한다.
 *        쿼터: 속성당 하루 2,000건 · 분당 600건. 요청 사이 300ms 쉰다.
 *
 *   검사 대상(결정적 선택, 무작위 없음):
 *     guide-recent  GUIDE_PUBLISHED_AT 이 RECENT_FROM~RECENT_TO 인 가이드 전부
 *     guide-sample  그 이전 가이드 중 발행일 순 균등 간격 20편
 *     etf-gsc       과거 GSC 쿼리(모든 gsc_YYYYMMDD.json)에 이름·코드가 등장한 종목 상위 30
 *                   + gsc_20260928 처럼 page 차원이 있는 파일의 /etf/ 주소
 *     etf-even      나머지 종목 중 코드 순 균등 간격 30
 *     hub           홈 · /guide · /etf · /about
 *
 *   출력: data/keywords/gsc_inspect_{YYYYMMDD(KST)}.json
 *
 *   읽기 전용. 사이트·서치콘솔 설정을 바꾸지 않는다(검사 요청만).
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const ORIGIN = 'https://iknowhowinfo.com';
const SITE_URL = 'sc-domain:iknowhowinfo.com';
const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const SA_PATH = path.join(ROOT, process.env.GSC_SA_JSON || 'gsc-service-account.json');

const RECENT_FROM = '2026-08-31';
const RECENT_TO = '2026-09-30';
const GUIDE_SAMPLE_N = 20;
const ETF_GSC_N = 30;
const ETF_EVEN_N = 30;
const SLEEP_MS = 300;
const FETCH_TIMEOUT_MS = 30000;

const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const LIMIT = (() => {
  const a = args.find(x => x.startsWith('--limit='));
  return a ? Math.max(1, parseInt(a.split('=')[1], 10) || 1) : Infinity;
})();

// ── .env.local 로더 (fetch-gsc-keywords.mjs 와 동일 규칙) ──
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

function die(msg) {
  console.error('\n[중단] ' + msg + '\n');
  process.exit(1);
}

const b64url = (input) => Buffer.from(input).toString('base64url');

async function tokenFromOAuth() {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GSC_OAUTH_CLIENT_ID,
      client_secret: process.env.GSC_OAUTH_CLIENT_SECRET,
      refresh_token: process.env.GSC_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });
  // 응답 본문에는 토큰이 없지만(실패 시 error 코드만) 혹시 몰라 error 필드만 남긴다.
  if (!res.ok) {
    let code = '';
    try { code = (await res.json()).error || ''; } catch { /* ignore */ }
    die(`OAuth 토큰 갱신 실패(${res.status} ${code}). npm run keywords:gsc-auth 로 재인증하세요.`);
  }
  return (await res.json()).access_token;
}

async function tokenFromServiceAccount() {
  let sa;
  try { sa = JSON.parse(fs.readFileSync(SA_PATH, 'utf8')); }
  catch { die('서비스 계정 JSON 파싱 실패.'); }
  if (!sa.client_email || !sa.private_key) die('서비스 계정 JSON에 client_email/private_key가 없습니다.');
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64url(JSON.stringify({
    iss: sa.client_email, scope: SCOPE, aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600,
  }));
  const signingInput = `${header}.${claim}`;
  const signature = crypto.createSign('RSA-SHA256').update(signingInput).sign(sa.private_key).toString('base64url');
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${signingInput}.${signature}` }),
  });
  if (!res.ok) die(`서비스 계정 토큰 발급 실패(${res.status}).`);
  return (await res.json()).access_token;
}

async function getAccessToken() {
  if (process.env.GSC_REFRESH_TOKEN && process.env.GSC_OAUTH_CLIENT_ID && process.env.GSC_OAUTH_CLIENT_SECRET) {
    return tokenFromOAuth();
  }
  if (fs.existsSync(SA_PATH)) return tokenFromServiceAccount();
  die('인증 정보 없음. .env.local 의 GSC_OAUTH_* / GSC_REFRESH_TOKEN 또는 서비스 계정 JSON 이 필요합니다.');
}

// ── 공통 유틸 ──
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function kstYmd(d = new Date()) {
  const k = new Date(d.getTime() + 9 * 3600000);
  return k.toISOString().slice(0, 10);
}

/** 정렬된 배열에서 k개를 균등 간격으로 고른다(양 끝 포함, 결정적). */
function evenPick(arr, k) {
  if (k <= 0 || !arr.length) return [];
  if (arr.length <= k) return arr.slice();
  if (k === 1) return [arr[0]];
  const out = [];
  const seen = new Set();
  for (let i = 0; i < k; i++) {
    const idx = Math.round(i * (arr.length - 1) / (k - 1));
    if (!seen.has(idx)) { seen.add(idx); out.push(arr[idx]); }
  }
  return out;
}

/** src/lib/guides.ts 로드. Node 24 타입 제거 import, 실패 시 esbuild 변환 후 data URL import. */
async function loadGuides() {
  const file = path.join(ROOT, 'src', 'lib', 'guides.ts');
  try {
    return await import(pathToFileURL(file).href);
  } catch (e1) {
    try {
      const esbuild = await import('esbuild');
      const code = esbuild.transformSync(fs.readFileSync(file, 'utf8'), { loader: 'ts', format: 'esm' }).code;
      return await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));
    } catch (e2) {
      die(`guides.ts 로드 실패: ${e1.message} / ${e2.message}`);
    }
  }
}

/** gsc_YYYYMMDD.json 만(gsc_inspect_* 제외). */
function listGscKeywordFiles() {
  const dir = path.join(ROOT, 'data', 'keywords');
  return fs.readdirSync(dir).filter(f => /^gsc_\d{8}\.json$/.test(f)).sort();
}

const normName = (s) => String(s || '').normalize('NFC').toLowerCase().replace(/[\s·_\-()]+/g, '');

/**
 * 과거 GSC 쿼리에 등장한 종목을 찾는다.
 *   - 같은 쿼리가 여러 파일(기간이 겹침)에 반복되므로 쿼리별로 노출 최대값만 쓴다.
 *   - 쿼리 안에 종목 정식명(공백 제거·소문자)이 들어 있으면 매칭. 한 쿼리에 여러 이름이 걸리면 가장 긴 이름만.
 *   - 6자리 단축코드(숫자 또는 0080G0 같은 영숫자)가 쿼리에 있으면 코드로도 매칭.
 *   - page 차원이 있는 파일은 /etf/{slug} 주소를 직접 집계.
 *   - '코덱스'·'타이거' 같은 한글 브랜드 표기는 매칭하지 않는다(한계, 결과에 기록).
 */
function etfsFromGsc(slugMap) {
  const bySlug = slugMap.bySlug || {};
  const byCode = slugMap.byCode || {};
  const names = Object.entries(bySlug)
    .map(([slug, v]) => ({ slug, code: String(v.code || '').toLowerCase(), n: normName(v.name) }))
    .filter(x => x.n.length >= 5);

  const queryImp = new Map();     // query → max impressions
  const pageImp = new Map();      // etf slug → impressions (page 차원 파일)
  const files = listGscKeywordFiles();
  for (const f of files) {
    let d;
    try { d = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'keywords', f), 'utf8')); } catch { continue; }
    for (const r of d.all || []) {
      const q = String(r.query || '').normalize('NFC');
      queryImp.set(q, Math.max(queryImp.get(q) || 0, r.impressions || 0));
      if (r.page) {
        const m = String(r.page).normalize('NFC').match(/^https?:\/\/[^/]+\/etf\/([^/?#]+)/);
        if (m) {
          const slug = decodeURIComponent(m[1]).toLowerCase();
          pageImp.set(slug, (pageImp.get(slug) || 0) + (r.impressions || 0));
        }
      }
    }
  }

  const score = new Map(); // slug → { imp, queries:Set, pageImp }
  const bump = (slug, imp, q) => {
    const s = score.get(slug) || { imp: 0, queries: new Set(), pageImp: 0 };
    s.imp += imp; if (q) s.queries.add(q);
    score.set(slug, s);
  };
  for (const [q, imp] of queryImp) {
    const nq = normName(q);
    let best = [];
    let bestLen = 0;
    for (const x of names) {
      if (nq.includes(x.n)) {
        if (x.n.length > bestLen) { best = [x]; bestLen = x.n.length; }
        else if (x.n.length === bestLen) best.push(x);
      }
    }
    for (const x of best) bump(x.slug, imp, q);
    for (const tok of q.toLowerCase().match(/\b[0-9][0-9a-z]{5}\b/g) || []) {
      const slug = byCode[tok.toUpperCase()] || byCode[tok];
      if (slug && !best.some(b => b.slug === slug)) bump(slug, imp, q);
    }
  }
  for (const [slug, imp] of pageImp) {
    if (!bySlug[slug]) continue;
    const s = score.get(slug) || { imp: 0, queries: new Set(), pageImp: 0 };
    s.pageImp += imp;
    score.set(slug, s);
  }
  const ranked = [...score.entries()]
    .map(([slug, s]) => ({
      slug, name: bySlug[slug]?.name || '', queryImpressions: s.imp, pageImpressions: s.pageImp, queries: s.queries.size,
      sampleQueries: [...s.queries].sort((a, b) => (queryImp.get(b) || 0) - (queryImp.get(a) || 0)).slice(0, 3),
    }))
    .sort((a, b) => (b.queryImpressions + b.pageImpressions) - (a.queryImpressions + a.pageImpressions)
      || b.queries - a.queries || a.slug.localeCompare(b.slug));
  return { ranked, files };
}

async function buildTargets() {
  const guides = await loadGuides();
  const pub = guides.GUIDE_PUBLISHED_AT || {};
  const all = guides.GUIDES.map(g => ({ slug: g.slug, pub: pub[g.slug] || '' }));

  const recent = all.filter(g => g.pub >= RECENT_FROM && g.pub <= RECENT_TO)
    .sort((a, b) => a.pub.localeCompare(b.pub) || a.slug.localeCompare(b.slug));
  const older = all.filter(g => g.pub && g.pub < RECENT_FROM)
    .sort((a, b) => a.pub.localeCompare(b.pub) || a.slug.localeCompare(b.slug));
  const sample = evenPick(older, GUIDE_SAMPLE_N);

  const slugMap = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'etf-slug-map.json'), 'utf8'));
  const { ranked, files } = etfsFromGsc(slugMap);
  const gscPick = ranked.slice(0, ETF_GSC_N);
  const picked = new Set(gscPick.map(x => x.slug));
  const restSlugs = Object.keys(slugMap.byCode || {}).sort()
    .map(code => slugMap.byCode[code])
    .filter((s, i, a) => s && a.indexOf(s) === i && !picked.has(s));
  const evenN = ETF_EVEN_N + Math.max(0, ETF_GSC_N - gscPick.length); // GSC 매칭이 모자라면 균등 간격으로 채운다
  const evenPickSlugs = evenPick(restSlugs, evenN);

  const targets = [];
  for (const g of recent) targets.push({ group: 'guide-recent', url: `${ORIGIN}/guide/${g.slug}`, slug: g.slug, publishedAt: g.pub });
  for (const g of sample) targets.push({ group: 'guide-sample', url: `${ORIGIN}/guide/${g.slug}`, slug: g.slug, publishedAt: g.pub });
  for (const e of gscPick) targets.push({ group: 'etf-gsc', url: `${ORIGIN}/etf/${e.slug}`, slug: e.slug, name: e.name, gsc: { queryImpressions: e.queryImpressions, pageImpressions: e.pageImpressions, queries: e.queries, sampleQueries: e.sampleQueries } });
  for (const s of evenPickSlugs) targets.push({ group: 'etf-even', url: `${ORIGIN}/etf/${s}`, slug: s });
  for (const p of ['/', '/guide', '/etf', '/about']) targets.push({ group: 'hub', url: p === '/' ? `${ORIGIN}/` : `${ORIGIN}${p}`, slug: p });

  return {
    targets,
    meta: {
      guidesTotal: all.length,
      recentRange: [RECENT_FROM, RECENT_TO],
      recentCount: recent.length,
      olderCount: older.length,
      sampleRule: `발행일 오름차순(동일일은 slug 순) 정렬 후 round(i*(n-1)/(k-1)) 인덱스, k=${GUIDE_SAMPLE_N}`,
      etfGscFiles: files,
      etfGscMatched: ranked.length,
      etfGscRule: '쿼리별 노출 최대값(파일 간 기간 겹침 제거) 합 + page 차원 파일의 /etf/ 노출. 정식명(공백 제거) 최장 일치 또는 6자리 코드 일치. 한글 브랜드 표기(코덱스 등)는 미매칭.',
      etfEvenRule: `GSC 선택분을 뺀 나머지 종목을 코드 오름차순 정렬 후 균등 간격 ${evenN}개`,
    },
  };
}

// ── URL 검사 ──
const FIELDS = ['verdict', 'coverageState', 'indexingState', 'robotsTxtState', 'pageFetchState', 'lastCrawlTime', 'googleCanonical', 'userCanonical', 'crawledAs'];

async function inspectOne(url, tokenRef) {
  const call = () => fetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
    method: 'POST',
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS), // 응답 없이 멈추는 요청이 전체를 붙잡지 않게
    headers: { Authorization: `Bearer ${tokenRef.value}`, 'Content-Type': 'application/json' },
    // coverageState 는 languageCode 로 번역돼 내려온다(ko-KR 이면 "발견됨 - 현재 색인이 생성되지 않음").
    // 분류·집계 기준 문자열이 흔들리지 않게 영어 원문('Submitted and indexed' 등)으로 받는다.
    body: JSON.stringify({ inspectionUrl: url, siteUrl: SITE_URL, languageCode: 'en-US' }),
  });
  let res = await call();
  if (res.status === 401) { tokenRef.value = await getAccessToken(); res = await call(); }
  if (res.status === 429 || res.status >= 500) { await sleep(5000); res = await call(); }
  if (!res.ok) {
    let msg = '';
    try { const j = await res.json(); msg = j.error?.status ? `${j.error.status}: ${String(j.error.message || '').slice(0, 160)}` : ''; } catch { /* ignore */ }
    return { error: `HTTP ${res.status}${msg ? ' ' + msg : ''}` };
  }
  const j = await res.json();
  const r = j.inspectionResult?.indexStatusResult;
  if (!r) return { error: 'indexStatusResult 없음', responseKeys: Object.keys(j.inspectionResult || j) };
  const out = {};
  for (const k of FIELDS) out[k] = r[k] ?? null;
  out._keys = Object.keys(r); // 응답 형태 확인용(필드명 추측 금지)
  return out;
}

function summarize(results) {
  const groups = {};
  for (const r of results) {
    const g = groups[r.group] || (groups[r.group] = { total: 0, inspected: 0, errors: 0, indexed: 0, neverCrawled: 0, coverageState: {}, verdict: {} });
    g.total++;
    if (r.error) { g.errors++; continue; }
    g.inspected++;
    // lastCrawlTime 이 없으면 구글이 주소만 알고 아직 한 번도 가져가지 않은 상태(품질 판정 전)
    if (!r.lastCrawlTime) g.neverCrawled++;
    const cs = r.coverageState || '(없음)';
    g.coverageState[cs] = (g.coverageState[cs] || 0) + 1;
    const v = r.verdict || '(없음)';
    g.verdict[v] = (g.verdict[v] || 0) + 1;
    if (r.verdict === 'PASS') g.indexed++;
  }
  const rate = (arr) => {
    const ok = arr.filter(r => !r.error);
    const idx = ok.filter(r => r.verdict === 'PASS').length;
    return { indexed: idx, inspected: ok.length, rate: ok.length ? +(idx / ok.length).toFixed(3) : null };
  };
  const guideRecent = results.filter(r => r.group === 'guide-recent');
  const etf = results.filter(r => r.group.startsWith('etf-'));
  // canonical 불일치: 구글이 고른 canonical 이 페이지가 선언한 canonical(없으면 검사 URL)과 다른 경우
  const canonNorm = (u) => String(u || '').replace(/\/+$/, '');
  const mismatches = results.filter(r => !r.error && r.googleCanonical
    && canonNorm(r.googleCanonical) !== canonNorm(r.userCanonical || r.url))
    .map(r => ({ url: r.url, googleCanonical: r.googleCanonical, userCanonical: r.userCanonical }));
  // noindex 로 제외된 주소의 마지막 크롤 시점. 오래됐다면 그 뒤에 noindex 를 풀었어도 구글은 아직 모른다.
  const noindexRows = results.filter(r => !r.error && /noindex/i.test(r.coverageState || ''));
  const crawlTimes = noindexRows.map(r => r.lastCrawlTime).filter(Boolean).sort();
  return {
    groups,
    noindexExcluded: {
      count: noindexRows.length,
      lastCrawlMin: crawlTimes[0] || null,
      lastCrawlMax: crawlTimes[crawlTimes.length - 1] || null,
    },
    guideRecentIndexRate: rate(guideRecent),
    guideSampleIndexRate: rate(results.filter(r => r.group === 'guide-sample')),
    etfIndexRate: rate(etf),
    etfGscIndexRate: rate(results.filter(r => r.group === 'etf-gsc')),
    etfEvenIndexRate: rate(results.filter(r => r.group === 'etf-even')),
    canonicalMismatchCount: mismatches.length,
    canonicalMismatches: mismatches,
    indexedDefinition: "verdict === 'PASS' (coverageState 'Submitted and indexed' 또는 'Indexed, not submitted in sitemap')",
  };
}

/** --resummarize: API 를 다시 부르지 않고 저장된 결과로 요약만 다시 계산한다. */
function resummarize() {
  const dir = path.join(ROOT, 'data', 'keywords');
  const files = fs.readdirSync(dir).filter(f => /^gsc_inspect_\d{8}\.json$/.test(f)).sort();
  if (!files.length) die('gsc_inspect_*.json 이 없습니다.');
  const file = path.join(dir, files[files.length - 1]);
  const d = JSON.parse(fs.readFileSync(file, 'utf8'));
  d.summary = summarize(d.results || []);
  d.resummarizedAt = new Date().toISOString();
  fs.writeFileSync(file, JSON.stringify(d, null, 2));
  printSummary(d.summary);
  console.log(`\n요약만 다시 계산: ${path.relative(ROOT, file)}`);
}

function printSummary(summary) {
  console.log('\n── 요약 ──');
  for (const [g, s] of Object.entries(summary.groups)) {
    console.log(`  ${g}: ${s.indexed}/${s.inspected} 색인 (실패 ${s.errors} · 미크롤 ${s.neverCrawled})`, s.coverageState);
  }
  const pr = (x) => `${x.indexed}/${x.inspected} (${x.rate === null ? '-' : (x.rate * 100).toFixed(1) + '%'})`;
  console.log(`  최근 가이드 색인 비율: ${pr(summary.guideRecentIndexRate)}`);
  console.log(`  /etf 색인 비율: ${pr(summary.etfIndexRate)}`);
  const n = summary.noindexExcluded;
  console.log(`  noindex 제외: ${n.count}건 (마지막 크롤 ${n.lastCrawlMin || '-'} ~ ${n.lastCrawlMax || '-'})`);
  console.log(`  googleCanonical 불일치: ${summary.canonicalMismatchCount}건`);
}

async function main() {
  if (args.includes('--resummarize')) return resummarize();
  const { targets, meta } = await buildTargets();
  const counts = targets.reduce((o, t) => (o[t.group] = (o[t.group] || 0) + 1, o), {});
  console.log(`검사 대상 ${targets.length}건`, counts);
  if (DRY) {
    for (const t of targets) {
      const extra = t.publishedAt ? ` (${t.publishedAt})`
        : t.gsc ? ` ${t.name} · 노출 ${t.gsc.queryImpressions}+${t.gsc.pageImpressions} · ${t.gsc.sampleQueries.join(' | ')}` : '';
      console.log(`  [${t.group}] ${t.url}${extra}`);
    }
    console.log('\n(--dry: API 호출 없음)');
    return;
  }

  const tokenRef = { value: await getAccessToken() };
  const run = targets.slice(0, Number.isFinite(LIMIT) ? LIMIT : targets.length);
  const results = [];
  for (let i = 0; i < run.length; i++) {
    const t = run[i];
    let r;
    const t0 = Date.now();
    try { r = await inspectOne(t.url, tokenRef); }
    catch (e) { r = { error: `요청 예외: ${String(e.name === 'TimeoutError' ? `${FETCH_TIMEOUT_MS / 1000}초 응답 없음` : (e.message || e)).slice(0, 160)}` }; }
    const row = { ...t, ...r };
    results.push(row);
    const tag = r.error ? `실패 ${r.error}` : `${r.verdict} · ${r.coverageState}`;
    console.log(`  ${String(i + 1).padStart(3)}/${run.length} [${t.group}] ${t.url} → ${tag} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
    if (i < run.length - 1) await sleep(SLEEP_MS);
  }

  // 응답 필드명 확인: 실제로 내려온 키 합집합을 기록하고 행에서는 뺀다
  const responseKeys = [...new Set(results.flatMap(r => r._keys || []))].sort();
  for (const r of results) delete r._keys;

  const summary = summarize(results);
  const outDir = path.join(ROOT, 'data', 'keywords');
  fs.mkdirSync(outDir, { recursive: true });
  const stamp = kstYmd().replace(/-/g, '');
  const outFile = path.join(outDir, `gsc_inspect_${stamp}.json`);
  const partial = run.length < targets.length;
  fs.writeFileSync(outFile, JSON.stringify({
    generatedAt: new Date().toISOString(),
    site: SITE_URL,
    partial,
    totalTargets: targets.length,
    inspectedCount: results.length,
    counts,
    selection: meta,
    responseKeys,
    summary,
    results,
  }, null, 2));

  printSummary(summary);
  console.log(`\n저장: ${path.relative(ROOT, outFile)}${partial ? ' (부분 실행 --limit)' : ''}`);
}

main().catch(e => die(e.message));
