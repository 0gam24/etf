#!/usr/bin/env node
/**
 * Lighthouse SEO audit — production 핵심 페이지 일괄 점검.
 *
 *   대상 (10개): 홈·5 카테고리·가이드·자료실·about·/etf 인덱스·종목 1개
 *   각 페이지 SEO 점수(0~100) + 위반 audits 리스트 출력.
 *
 *   요구: npx lighthouse (chrome-launcher + lighthouse 패키지). headless Chrome 필요.
 *   설치: npm i -D lighthouse chrome-launcher
 *
 *   실행: node scripts/audit-seo.mjs [base-url]
 *   기본 base = SITE_URL (.env.local) 또는 https://iknowhowinfo.com
 *
 *   결과는 콘솔 + scripts/.audit-seo-report.json 저장.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// .env.local 단순 파서
function loadEnv() {
  const envPath = path.join(ROOT, '.env.local');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf-8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m && !process.env[m[1]]) {
      let v = m[2].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      process.env[m[1]] = v;
    }
  }
}
loadEnv();

const BASE = process.argv[2] || process.env.SITE_URL || 'https://iknowhowinfo.com';
const BASE_CLEAN = BASE.replace(/\/+$/, '');

const PAGES = [
  { name: '홈',                path: '/' },
  { name: '/pulse',            path: '/pulse' },
  { name: '/breaking',         path: '/breaking' },
  { name: '/surge',            path: '/surge' },
  { name: '/flow',             path: '/flow' },
  { name: '/income',           path: '/income' },
  { name: '/etf 인덱스',        path: '/etf' },
  { name: '/etf/0080g0',       path: '/etf/0080g0' }, // KODEX 방산TOP10 (시세 풀)
  { name: '/guide',            path: '/guide' },
  { name: '/guide/monthly-dividend', path: '/guide/monthly-dividend' },
  { name: '/about',            path: '/about' },
  { name: '/author/pb_kim',    path: '/author/pb_kim' },
  { name: '/resources',        path: '/resources' },
];

async function runLighthouseFor(url) {
  // 동적 import — 의존성이 없으면 친절한 에러
  let lighthouse, chromeLauncher;
  try {
    lighthouse = (await import('lighthouse')).default;
    chromeLauncher = await import('chrome-launcher');
  } catch (err) {
    console.error('❌ lighthouse / chrome-launcher 미설치. 설치: npm i -D lighthouse chrome-launcher');
    console.error('   상세:', err.message);
    process.exit(1);
  }

  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless=new', '--no-sandbox'] });
  try {
    const res = await lighthouse(url, {
      port: chrome.port,
      output: 'json',
      onlyCategories: ['seo'],
      logLevel: 'error',
    });
    return res.lhr;
  } finally {
    await chrome.kill();
  }
}

function summarize(lhr) {
  const seoCategory = lhr.categories?.seo;
  const score = seoCategory ? Math.round(seoCategory.score * 100) : 0;
  const auditRefs = seoCategory?.auditRefs || [];
  const failures = [];
  for (const ref of auditRefs) {
    const a = lhr.audits[ref.id];
    if (!a || a.score === null || a.score === 1) continue; // null = informative only, 1 = pass
    failures.push({
      id: ref.id,
      title: a.title,
      score: a.score,
      desc: a.description?.slice(0, 200),
    });
  }
  return { score, failures };
}

async function main() {
  console.log(`🔍 Lighthouse SEO audit · base: ${BASE_CLEAN}\n`);
  const report = { base: BASE_CLEAN, ranAt: new Date().toISOString(), pages: [] };

  for (const p of PAGES) {
    const url = `${BASE_CLEAN}${p.path}`;
    process.stdout.write(`  ${p.name.padEnd(28)} `);
    try {
      const lhr = await runLighthouseFor(url);
      const { score, failures } = summarize(lhr);
      const verdict = score >= 95 ? '✅' : score >= 85 ? '⚠️' : '❌';
      console.log(`${verdict} ${score}/100 ${failures.length ? `(위반 ${failures.length})` : ''}`);
      for (const f of failures) console.log(`      ↳ ${f.id}: ${f.title}`);
      report.pages.push({ name: p.name, url, score, failures });
    } catch (err) {
      console.log(`❌ 실패 — ${err.message}`);
      report.pages.push({ name: p.name, url, error: err.message });
    }
  }

  const outPath = path.join(__dirname, '.audit-seo-report.json');
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(`\n💾 상세 리포트: ${outPath}`);

  // 95점 미만 페이지 카운트
  const subPar = report.pages.filter(p => typeof p.score === 'number' && p.score < 95);
  if (subPar.length === 0) {
    console.log('\n🎉 모든 페이지 SEO 95+ 통과');
  } else {
    console.log(`\n⚠️  ${subPar.length}개 페이지 95점 미만:`);
    subPar.forEach(p => console.log(`   - ${p.name}: ${p.score}/100`));
    process.exit(2);
  }
}

main().catch(err => {
  console.error('❌ audit 실패:', err);
  process.exit(1);
});
