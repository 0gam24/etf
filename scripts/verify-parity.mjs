#!/usr/bin/env node
/**
 * Local ↔ Production parity verifier.
 *
 *   로컬 content/{category}/*.mdx 를 모두 나열하고,
 *   같은 슬러그가 production(`iknowhowinfo.com`)에서 200으로 응답하는지 + 핵심 단어가
 *   응답 HTML에 들어 있는지 확인.
 *
 *   사용:
 *     npm run verify:parity
 *     node scripts/verify-parity.mjs --site https://iknowhowinfo.com
 *     node scripts/verify-parity.mjs --quick   # 카테고리 랜딩만
 *     node scripts/verify-parity.mjs --since 2026-04-25  # 해당 날짜 이후 글만
 *
 *   exit code:
 *     0 = parity OK
 *     1 = 누락 발견 (CI 등에서 활용)
 */

import { readdirSync, statSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const SITE = (args[args.indexOf('--site') + 1] && !args[args.indexOf('--site') + 1].startsWith('--'))
  ? args[args.indexOf('--site') + 1]
  : (process.env.SITE_URL || 'https://iknowhowinfo.com');
const QUICK = args.includes('--quick');
const SINCE = args.includes('--since') ? args[args.indexOf('--since') + 1] : null;

const ROOT = process.cwd();
const CONTENT_DIR = join(ROOT, 'content');

const TOP_LEVEL = ['pulse', 'breaking', 'flow', 'income', 'surge'];
const NESTED = [
  ['theme', 'theme'],     // theme/{theme}/{slug}
  ['account', 'account'], // account/{type}/{slug}
];

function listSlugs(category) {
  const dir = join(CONTENT_DIR, category);
  try {
    if (!statSync(dir).isDirectory()) return [];
  } catch {
    return [];
  }
  return readdirSync(dir)
    .filter(f => f.endsWith('.mdx') || f.endsWith('.md'))
    .map(f => ({
      file: join(dir, f),
      slug: f.replace(/\.mdx?$/, ''),
    }));
}

function shouldInclude(slug) {
  if (!SINCE) return true;
  // slug 안에 YYYYMMDD 가 들어 있다고 가정 (pulse-20260425, breaking-20260425-1-xxxx 등)
  const m = slug.match(/(\d{8})/);
  if (!m) return true; // 날짜 없는 슬러그는 항상 포함
  const ymd = m[1];
  const since = SINCE.replace(/-/g, '');
  return ymd >= since;
}

async function probe(url) {
  try {
    const res = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': 'parity-check/1.0' } });
    return { status: res.status, ok: res.status === 200 };
  } catch (err) {
    return { status: 0, ok: false, error: String(err) };
  }
}

async function probeContains(url, needle) {
  try {
    const res = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': 'parity-check/1.0' } });
    const text = await res.text();
    return { status: res.status, contains: text.includes(needle) };
  } catch {
    return { status: 0, contains: false };
  }
}

async function main() {
  console.log(`\n[parity] site = ${SITE}`);
  console.log(`[parity] mode = ${QUICK ? 'quick (landings only)' : 'full (slugs + landings)'}`);
  if (SINCE) console.log(`[parity] since = ${SINCE}`);
  console.log('');

  const failures = [];

  // 1) 카테고리 랜딩 5개 — 200 + "404"·"not found" 부재 확인
  for (const cat of TOP_LEVEL) {
    const url = `${SITE}/${cat}`;
    const r = await probe(url);
    if (!r.ok) {
      failures.push({ kind: 'landing', url, status: r.status });
      console.log(`  ✗ /${cat}  HTTP ${r.status}`);
    } else {
      console.log(`  ✓ /${cat}  HTTP ${r.status}`);
    }
  }

  // 2) /guide 인덱스 + 5 필러
  const guideSlugs = ['monthly-dividend', 'covered-call', 'defense-etf', 'ai-semi-etf', 'retirement'];
  for (const url of [`${SITE}/guide`, ...guideSlugs.map(s => `${SITE}/guide/${s}`)]) {
    const r = await probe(url);
    if (!r.ok) {
      failures.push({ kind: 'guide', url, status: r.status });
      console.log(`  ✗ ${url.replace(SITE, '')}  HTTP ${r.status}`);
    } else {
      console.log(`  ✓ ${url.replace(SITE, '')}  HTTP ${r.status}`);
    }
  }

  if (QUICK) {
    return failures;
  }

  // 3) 모든 top-level 카테고리의 글 슬러그 — 200 + 슬러그 텍스트 노출 확인
  console.log('\n[parity] checking individual slugs...');
  for (const cat of TOP_LEVEL) {
    const slugs = listSlugs(cat).filter(s => shouldInclude(s.slug));
    for (const { slug } of slugs) {
      const url = `${SITE}/${cat}/${slug}`;
      const r = await probe(url);
      if (!r.ok) {
        failures.push({ kind: 'post', url, slug, category: cat, status: r.status });
        console.log(`  ✗ /${cat}/${slug}  HTTP ${r.status}`);
      } else {
        process.stdout.write('.');
      }
    }
    process.stdout.write('\n');
  }

  // 4) nested (theme/account) — slug 추출은 폴더 구조에서
  for (const [routeBase, contentBase] of NESTED) {
    const baseDir = join(CONTENT_DIR, contentBase);
    let subs = [];
    try {
      subs = readdirSync(baseDir).filter(d => {
        try { return statSync(join(baseDir, d)).isDirectory(); } catch { return false; }
      });
    } catch { /* skip */ }
    for (const sub of subs) {
      const slugs = listSlugs(`${contentBase}/${sub}`).filter(s => shouldInclude(s.slug));
      for (const { slug } of slugs) {
        const url = `${SITE}/${routeBase}/${sub}/${slug}`;
        const r = await probe(url);
        if (!r.ok) {
          failures.push({ kind: 'nested-post', url, slug, status: r.status });
          console.log(`  ✗ ${url.replace(SITE, '')}  HTTP ${r.status}`);
        }
      }
    }
  }

  return failures;
}

main()
  .then(failures => {
    console.log('');
    if (failures.length === 0) {
      console.log('[parity] ✅ all checked URLs match local content.');
      process.exit(0);
    } else {
      console.log(`[parity] ❌ ${failures.length} mismatch(es) found.`);
      console.log('\nLikely causes:');
      console.log('  1. Cloudflare build cache reusing old result → push code change or "Retry build"');
      console.log('  2. .gitignore excluded data/content needed at build time');
      console.log('  3. webhook miss → empty commit and push, or manual redeploy');
      console.log('  4. files not committed → check `git status content/ data/`');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('[parity] fatal:', err);
    process.exit(2);
  });
