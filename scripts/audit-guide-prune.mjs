#!/usr/bin/env node
/**
 * audit-guide-prune: 가이드 전체를 keep / improve / merge / noindex 후보로 분류한 "목록"을 만든다.
 *
 *   이 스크립트는 판단 재료만 만든다. 301·noindex·본문 수정은 하지 않는다(적용은 사람이 목록을 보고 결정).
 *
 *   실행: node scripts/audit-guide-prune.mjs
 *   출력: data/audit/guide-prune-{YYYYMMDD(KST)}.json + 콘솔 요약
 *
 * ── 입력 ────────────────────────────────────────────────────────────────
 *   1. src/lib/guides.ts        GUIDES(본문) · GUIDE_PUBLISHED_AT(원발행일)
 *   2. data/keywords/gsc_YYYYMMDD.json
 *        page 차원(행에 page 필드)이 있는 파일만 쓴다. 쿼리 차원만 있는 파일은
 *        쿼리 → URL 매핑이 불가능해 제외하고, 제외 목록을 결과에 기록한다.
 *        page 차원 파일이 여럿이면 최신 파일부터 고르고, 이미 고른 기간과 겹치는 파일은
 *        뺀다(28일 창이 겹쳐 같은 노출이 두 번 더해지는 것을 막음).
 *   3. data/keywords/gsc_inspect_*.json (가장 최신 1개, scripts/gsc-url-inspect.mjs 출력)
 *        검사하지 않은 가이드는 색인 상태 'unknown'.
 *
 * ── 지표 ────────────────────────────────────────────────────────────────
 *   본문 텍스트 = sections[].paragraphs + faq[].question + faq[].answer
 *     (answer·keyPoints·비교표·동적 데이터 블록은 제외. 동적 데이터 블록 유무는 hasDataBlock 으로 따로 기록)
 *   bodyChars      공백을 뺀 글자 수
 *   bodyTokens     어절(공백 분리) 수
 *   numericDensity 숫자를 하나라도 포함한 어절 수 / 전체 어절 수
 *   maxJaccard     어절 3-gram 집합의 Jaccard 유사도 중 다른 가이드와의 최대값, jaccardPartner 는 그 상대
 *                  (어절 앞뒤 문장부호 제거, 소문자, NFC 정규화)
 *   impressions / clicks  위 2번 파일들의 /guide/{slug} page 행 합
 *
 * ── 분류 기준 (위에서부터 먼저 걸리는 것 하나) ────────────────────────────
 *   얇음(thin) 정의(전체 가이드 분포 기준, 실행 시 계산한 값을 결과 thresholds 에 기록):
 *     bodyChars < P25(bodyChars)
 *     또는 (numericDensity < P25(numericDensity) 이고 bodyChars < P50(bodyChars))
 *
 *   1) merge → {대상 slug}
 *        maxJaccard > 0.3 이고, 상대보다 노출이 적은 쪽(노출 같으면 클릭 적은 쪽,
 *        그것도 같으면 늦게 발행된 쪽, 같은 날이면 slug 사전순 뒤쪽).
 *        대상이 다시 merge 이면 사슬을 따라 최종 대상까지 올라간다.
 *   2) keep (traffic)   노출 > 0 또는 클릭 > 0
 *   3) noindex 후보     URL 검사 결과 미색인(verdict !== 'PASS') + 얇음 + 노출 0
 *                      단, 발행 후 14일 미만이거나 동적 데이터 블록이 있으면 제외(판단 보류 → improve)
 *   4) improve          얇음 (색인됨, 색인 미확인, 또는 3)에서 보류된 경우). indexState 로 구분
 *   5) keep (unique)    나머지 = 다른 가이드와 겹침 0.3 이하 + 얇지 않음
 *                      이 중 URL 검사에서 미색인으로 나온 것은 flags 에 'not-indexed' 를 달아 둔다
 *
 *   읽기 전용. 어떤 소스·설정도 바꾸지 않는다.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const ORIGIN_HOST = 'iknowhowinfo.com';

const MERGE_JACCARD = 0.3;
const NEW_GRACE_DAYS = 14;
const THIN_CHARS_PCTL = 0.25;
const THIN_DENSITY_PCTL = 0.25;
const THIN_DENSITY_CHARS_PCTL = 0.5;

function die(msg) {
  console.error('\n[중단] ' + msg + '\n');
  process.exit(1);
}

function kstYmd(d = new Date()) {
  return new Date(d.getTime() + 9 * 3600000).toISOString().slice(0, 10);
}

function daysBetween(a, b) {
  return Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 86400000);
}

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

const quantile = (arr, p) => {
  const s = [...arr].sort((a, b) => a - b);
  if (!s.length) return 0;
  const pos = (s.length - 1) * p;
  const lo = Math.floor(pos), hi = Math.ceil(pos);
  return s[lo] + (s[hi] - s[lo]) * (pos - lo);
};

const bodyText = (g) => [
  ...(g.sections || []).flatMap(s => s.paragraphs || []),
  ...(g.faq || []).flatMap(f => [f.question, f.answer]),
].join(' ').normalize('NFC');

const words = (t) => t.toLowerCase().split(/\s+/)
  .map(w => w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}%]+$/gu, ''))
  .filter(Boolean);

function shingles(ws) {
  const s = new Set();
  for (let i = 0; i + 2 < ws.length; i++) s.add(`${ws[i]} ${ws[i + 1]} ${ws[i + 2]}`);
  return s;
}

/** 역색인으로 모든 쌍의 교집합 크기를 센다(쌍 전수 비교보다 빠름). */
function pairwiseJaccard(sets) {
  const n = sets.length;
  const inv = new Map();
  sets.forEach((s, i) => { for (const x of s) { let a = inv.get(x); if (!a) inv.set(x, a = []); a.push(i); } });
  const inter = new Map();
  for (const a of inv.values()) {
    if (a.length < 2) continue;
    for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) {
      const k = a[i] * n + a[j];
      inter.set(k, (inter.get(k) || 0) + 1);
    }
  }
  const best = sets.map(() => ({ j: 0, partner: -1 }));
  const pairs = [];
  for (const [k, c] of inter) {
    const i = Math.floor(k / n), j = k % n;
    const union = sets[i].size + sets[j].size - c;
    const J = union ? c / union : 0;
    if (J > best[i].j) best[i] = { j: J, partner: j };
    if (J > best[j].j) best[j] = { j: J, partner: i };
    if (J >= 0.15) pairs.push({ i, j, J });
  }
  pairs.sort((a, b) => b.J - a.J);
  return { best, pairs };
}

/** gsc_YYYYMMDD.json 중 page 차원이 있는 파일만, 기간이 겹치지 않게 최신부터 고른다. */
function loadGscPageRows() {
  const dir = path.join(ROOT, 'data', 'keywords');
  const files = fs.readdirSync(dir).filter(f => /^gsc_\d{8}\.json$/.test(f)).sort().reverse();
  const used = [];
  const excluded = [];
  const rows = [];
  let earliestStart = null;
  for (const f of files) {
    let d;
    try { d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); }
    catch { excluded.push({ file: f, reason: 'JSON 파싱 실패' }); continue; }
    const all = d.all || [];
    const withPage = all.filter(r => r.page).length;
    if (!withPage) { excluded.push({ file: f, range: d.range, reason: 'page 차원 없음(쿼리만 있어 URL 매핑 불가)' }); continue; }
    const start = d.range?.start, end = d.range?.end;
    if (earliestStart && end && end >= earliestStart) {
      excluded.push({ file: f, range: d.range, reason: '이미 고른 파일과 기간 겹침(중복 합산 방지)' });
      continue;
    }
    used.push({ file: f, range: d.range, rows: all.length, rowsWithPage: withPage });
    if (start && (!earliestStart || start < earliestStart)) earliestStart = start;
    for (const r of all) if (r.page) rows.push(r);
  }
  return { rows, used, excluded };
}

function guideSlugFromUrl(u) {
  try {
    const url = new URL(String(u).normalize('NFC'));
    if (!url.host.endsWith(ORIGIN_HOST)) return null;
    const m = decodeURIComponent(url.pathname).replace(/\/+$/, '').match(/^\/guide\/([^/]+)$/);
    return m ? m[1].toLowerCase() : null;
  } catch { return null; }
}

function loadLatestInspect() {
  const dir = path.join(ROOT, 'data', 'keywords');
  const files = fs.readdirSync(dir).filter(f => /^gsc_inspect_\d{8}\.json$/.test(f)).sort();
  if (!files.length) return { file: null, bySlug: new Map(), partial: null };
  const file = files[files.length - 1];
  const d = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
  const bySlug = new Map();
  for (const r of d.results || []) {
    const slug = guideSlugFromUrl(r.url);
    if (slug) bySlug.set(slug, r);
  }
  return { file, bySlug, partial: !!d.partial };
}

async function main() {
  const today = kstYmd();
  const mod = await loadGuides();
  const G = mod.GUIDES;
  const pub = mod.GUIDE_PUBLISHED_AT || {};

  // ── 텍스트 지표 ──
  const base = G.map(g => {
    const t = bodyText(g);
    const raw = t.split(/\s+/).filter(Boolean);
    const numTok = raw.filter(w => /[0-9]/.test(w)).length;
    return {
      slug: g.slug,
      title: g.title,
      publishedAt: pub[g.slug] || null,
      ageDays: pub[g.slug] ? daysBetween(pub[g.slug], today) : null,
      bodyChars: t.replace(/\s+/g, '').length,
      bodyTokens: raw.length,
      numericDensity: raw.length ? +(numTok / raw.length).toFixed(4) : 0,
      hasDataBlock: (g.sections || []).some(s => !!s.dataBlock),
    };
  });
  const sets = G.map(g => shingles(words(bodyText(g))));
  const { best, pairs } = pairwiseJaccard(sets);
  base.forEach((b, i) => {
    b.maxJaccard = +best[i].j.toFixed(4);
    b.jaccardPartner = best[i].partner >= 0 ? G[best[i].partner].slug : null;
  });

  const thresholds = {
    thinChars: Math.round(quantile(base.map(b => b.bodyChars), THIN_CHARS_PCTL)),
    thinDensity: +quantile(base.map(b => b.numericDensity), THIN_DENSITY_PCTL).toFixed(4),
    thinDensityChars: Math.round(quantile(base.map(b => b.bodyChars), THIN_DENSITY_CHARS_PCTL)),
    mergeJaccard: MERGE_JACCARD,
    newGraceDays: NEW_GRACE_DAYS,
  };
  const isThin = (b) => b.bodyChars < thresholds.thinChars
    || (b.numericDensity < thresholds.thinDensity && b.bodyChars < thresholds.thinDensityChars);

  // ── GSC 노출·클릭 ──
  const gsc = loadGscPageRows();
  const traffic = new Map();
  for (const r of gsc.rows) {
    const slug = guideSlugFromUrl(r.page);
    if (!slug) continue;
    const t = traffic.get(slug) || { impressions: 0, clicks: 0, queries: 0 };
    t.impressions += r.impressions || 0;
    t.clicks += r.clicks || 0;
    t.queries += 1;
    traffic.set(slug, t);
  }

  // ── 색인 상태 ──
  const insp = loadLatestInspect();

  const bySlug = new Map();
  for (const b of base) {
    const t = traffic.get(b.slug) || { impressions: 0, clicks: 0, queries: 0 };
    b.impressions = t.impressions;
    b.clicks = t.clicks;
    b.gscQueries = t.queries;
    const r = insp.bySlug.get(b.slug);
    if (!r) b.index = { state: 'unknown' };
    else if (r.error) b.index = { state: 'error', error: r.error };
    else b.index = {
      state: r.verdict === 'PASS' ? 'indexed' : 'not-indexed',
      verdict: r.verdict, coverageState: r.coverageState, lastCrawlTime: r.lastCrawlTime,
      googleCanonical: r.googleCanonical, userCanonical: r.userCanonical,
    };
    b.thin = isThin(b);
    bySlug.set(b.slug, b);
  }

  // ── 1) merge 판정 ──
  const loses = (a, p) => {
    if (a.impressions !== p.impressions) return a.impressions < p.impressions;
    if (a.clicks !== p.clicks) return a.clicks < p.clicks;
    const ap = a.publishedAt || '0000', pp = p.publishedAt || '0000';
    if (ap !== pp) return ap > pp;
    return a.slug > p.slug;
  };
  for (const b of base) {
    if (b.maxJaccard > MERGE_JACCARD && b.jaccardPartner) {
      const p = bySlug.get(b.jaccardPartner);
      if (p && loses(b, p)) b._mergeTo = p.slug;
    }
  }
  for (const b of base) {
    if (!b._mergeTo) continue;
    const chain = [b.slug];
    let cur = b._mergeTo;
    while (bySlug.get(cur)?._mergeTo && !chain.includes(cur)) { chain.push(cur); cur = bySlug.get(cur)._mergeTo; }
    b.mergeTarget = cur;
    if (chain.length > 1) b.mergeChain = [...chain, cur];
  }

  // ── 2~5) 나머지 분류 ──
  for (const b of base) {
    const reasons = [];
    const flags = [];
    if (b.index.state === 'not-indexed') flags.push('not-indexed');
    // 'Discovered - currently not indexed' 처럼 lastCrawlTime 이 없으면 구글이 아직 본문을 본 적이 없다.
    // 이 경우 미색인은 품질 판정이 아니라 크롤 우선순위 문제일 수 있고, noindex 를 달아도 크롤 전엔 읽히지 않는다.
    if (b.index.state === 'not-indexed' && !b.index.lastCrawlTime) flags.push('never-crawled');
    if (b.index.state === 'unknown') flags.push('index-unknown');
    if (b.hasDataBlock) flags.push('has-data-block');
    if (b.ageDays !== null && b.ageDays < NEW_GRACE_DAYS) flags.push('new');

    if (b.mergeTarget) {
      b.class = 'merge';
      reasons.push(`본문 3-gram Jaccard ${b.maxJaccard} > ${MERGE_JACCARD} (상대 ${b.jaccardPartner}), 노출 ${b.impressions} ≤ 상대`);
    } else if (b.impressions > 0 || b.clicks > 0) {
      b.class = 'keep';
      reasons.push(`검색 노출 ${b.impressions} · 클릭 ${b.clicks}`);
    } else if (b.index.state === 'not-indexed' && b.thin
      && !(b.ageDays !== null && b.ageDays < NEW_GRACE_DAYS) && !b.hasDataBlock) {
      b.class = 'noindex-candidate';
      reasons.push(`미색인(${b.index.coverageState}) + 얇음 + 노출 0`);
      if (!b.index.lastCrawlTime) reasons.push('주의: 구글이 아직 크롤하지 않음(품질 판정 전). noindex 보다 본문 보강 후 재크롤 요청이 먼저일 수 있음');
    } else if (b.thin) {
      b.class = 'improve';
      if (b.index.state === 'indexed') reasons.push('색인됐지만 얇음');
      else if (b.index.state === 'not-indexed') reasons.push(`미색인이지만 ${b.hasDataBlock ? '동적 데이터 블록 있음' : `발행 ${b.ageDays}일째(${NEW_GRACE_DAYS}일 미만)`}이라 noindex 판단 보류, 얇음`);
      else reasons.push('얇음, 색인 상태 미확인(URL 검사 대상 밖)');
    } else {
      b.class = 'keep';
      reasons.push(`고유(최대 겹침 ${b.maxJaccard}) + 얇지 않음`);
    }
    if (b.thin) {
      const why = [];
      if (b.bodyChars < thresholds.thinChars) why.push(`본문 ${b.bodyChars} < P25 ${thresholds.thinChars}`);
      if (b.numericDensity < thresholds.thinDensity && b.bodyChars < thresholds.thinDensityChars) why.push(`수치 밀도 ${b.numericDensity} < P25 ${thresholds.thinDensity} 이고 본문 < P50 ${thresholds.thinDensityChars}`);
      reasons.push('얇음 근거: ' + why.join(' / '));
    }
    b.reasons = reasons;
    b.flags = flags;
    delete b._mergeTo;
  }

  // ── 요약 ──
  const count = (pred) => base.filter(pred).length;
  const classes = ['keep', 'improve', 'merge', 'noindex-candidate'];
  const byClass = Object.fromEntries(classes.map(c => [c, count(b => b.class === c)]));
  const byClassIndex = Object.fromEntries(classes.map(c => [c, {
    indexed: count(b => b.class === c && b.index.state === 'indexed'),
    notIndexed: count(b => b.class === c && b.index.state === 'not-indexed'),
    unknown: count(b => b.class === c && b.index.state === 'unknown'),
  }]));
  const inspectedGuides = base.filter(b => b.index.state === 'indexed' || b.index.state === 'not-indexed');
  const summary = {
    guides: base.length,
    byClass,
    byClassIndex,
    keepReasons: {
      traffic: count(b => b.class === 'keep' && (b.impressions > 0 || b.clicks > 0)),
      unique: count(b => b.class === 'keep' && !(b.impressions > 0 || b.clicks > 0)),
      uniqueButNotIndexed: count(b => b.class === 'keep' && !(b.impressions > 0 || b.clicks > 0) && b.index.state === 'not-indexed'),
    },
    thin: count(b => b.thin),
    withImpressions: count(b => b.impressions > 0),
    withClicks: count(b => b.clicks > 0),
    totalImpressions: base.reduce((s, b) => s + b.impressions, 0),
    totalClicks: base.reduce((s, b) => s + b.clicks, 0),
    inspectedGuides: inspectedGuides.length,
    inspectedIndexed: inspectedGuides.filter(b => b.index.state === 'indexed').length,
    inspectedNeverCrawled: count(b => b.flags.includes('never-crawled')),
    maxJaccardOverall: Math.max(...base.map(b => b.maxJaccard)),
    pairsOverMerge: pairs.filter(p => p.J > MERGE_JACCARD).length,
    pairsOver020: pairs.filter(p => p.J > 0.2).length,
    pairsOver015: pairs.filter(p => p.J >= 0.15).length,
    mergeList: base.filter(b => b.class === 'merge').map(b => ({ slug: b.slug, to: b.mergeTarget, jaccard: b.maxJaccard })),
    noindexList: base.filter(b => b.class === 'noindex-candidate').map(b => ({ slug: b.slug, publishedAt: b.publishedAt, coverageState: b.index.coverageState, neverCrawled: !b.index.lastCrawlTime, bodyChars: b.bodyChars, numericDensity: b.numericDensity })),
    improveList: base.filter(b => b.class === 'improve').map(b => ({ slug: b.slug, index: b.index.state, bodyChars: b.bodyChars, numericDensity: b.numericDensity })),
    topSimilarPairs: pairs.slice(0, 20).map(p => ({ a: G[p.i].slug, b: G[p.j].slug, jaccard: +p.J.toFixed(4) })),
  };

  const out = {
    generatedAt: new Date().toISOString(),
    asOf: today,
    applied: false,
    note: '목록만. 301·noindex·본문 수정은 적용하지 않았다.',
    criteria: {
      bodyText: 'sections[].paragraphs + faq(question, answer). answer·keyPoints·비교표·동적 데이터 블록 제외',
      thin: `bodyChars < P25(${thresholds.thinChars}) 또는 (numericDensity < P25(${thresholds.thinDensity}) 이고 bodyChars < P50(${thresholds.thinDensityChars}))`,
      order: [
        `merge→대상: maxJaccard > ${MERGE_JACCARD} 이고 상대보다 노출 적은 쪽(동률이면 클릭 → 늦은 발행 → slug 순). 대상이 merge 면 사슬 끝까지`,
        'keep(traffic): 노출 > 0 또는 클릭 > 0',
        `noindex-candidate: URL 검사 미색인 + 얇음 + 노출 0 (발행 ${NEW_GRACE_DAYS}일 미만·동적 데이터 블록 있으면 제외)`,
        'improve: 얇음 (색인됨 / 색인 미확인 / noindex 보류)',
        'keep(unique): 나머지 (겹침 0.3 이하 + 얇지 않음). 미색인이면 flags 에 not-indexed',
      ],
      indexed: "URL 검사 verdict === 'PASS'",
      caveat: "flags 의 never-crawled = 'Discovered - currently not indexed' 등 lastCrawlTime 없음. 구글이 본문을 본 적이 없으므로 미색인이 품질 판정은 아니다.",
    },
    thresholds,
    inputs: {
      guidesFile: 'src/lib/guides.ts',
      gscFilesUsed: gsc.used,
      gscFilesExcluded: gsc.excluded,
      gscNote: 'page 차원이 있는 파일만 URL 기준으로 합산. 쿼리 차원만 있는 파일은 어느 가이드의 노출인지 알 수 없어 제외했다.',
      inspectFile: insp.file ? `data/keywords/${insp.file}` : null,
      inspectPartial: insp.partial,
      inspectCoverage: `${inspectedGuides.length}/${base.length} 가이드 (나머지는 index.state = unknown)`,
    },
    summary,
    guides: base.sort((a, b) => classes.indexOf(a.class) - classes.indexOf(b.class)
      || (a.publishedAt || '').localeCompare(b.publishedAt || '') || a.slug.localeCompare(b.slug)),
  };

  const outDir = path.join(ROOT, 'data', 'audit');
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `guide-prune-${today.replace(/-/g, '')}.json`);
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2));

  console.log(`가이드 ${summary.guides}편 · 기준일 ${today}`);
  console.log(`  분류: keep ${byClass.keep} (노출 ${summary.keepReasons.traffic} / 고유 ${summary.keepReasons.unique}, 그중 미색인 ${summary.keepReasons.uniqueButNotIndexed}) · improve ${byClass.improve} · merge ${byClass.merge} · noindex 후보 ${byClass['noindex-candidate']}`);
  console.log(`  얇음 ${summary.thin}편 (기준: 본문 < ${thresholds.thinChars} 또는 수치 밀도 < ${thresholds.thinDensity} & 본문 < ${thresholds.thinDensityChars})`);
  console.log(`  GSC(page 기준): 노출 있는 가이드 ${summary.withImpressions}편 · 클릭 있는 가이드 ${summary.withClicks}편 · 합 ${summary.totalImpressions}노출/${summary.totalClicks}클릭`);
  console.log(`  GSC 파일 사용 ${gsc.used.map(u => u.file).join(', ') || '(없음)'} · 제외 ${gsc.excluded.length}개`);
  console.log(`  URL 검사 반영 ${inspectedGuides.length}편 (색인 ${summary.inspectedIndexed} · 미크롤 ${summary.inspectedNeverCrawled}) · ${insp.file || '검사 파일 없음'}`);
  console.log(`  최대 Jaccard ${summary.maxJaccardOverall} · 0.3 초과 쌍 ${summary.pairsOverMerge} · 0.2 초과 쌍 ${summary.pairsOver020}`);
  if (summary.noindexList.length) console.log('  noindex 후보:', summary.noindexList.map(x => x.slug).join(', '));
  if (summary.mergeList.length) console.log('  merge:', summary.mergeList.map(x => `${x.slug}→${x.to}`).join(', '));
  console.log(`\n저장: ${path.relative(ROOT, outFile)}`);
}

main().catch(e => die(e.stack || e.message));
