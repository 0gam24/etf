#!/usr/bin/env node
/**
 * Schema.org JSON-LD 자동 검증.
 *
 *   대상 페이지의 prerender HTML에서 <script type="application/ld+json">을 추출,
 *   Schema.org 필수 속성 + Google Rich Result 자격 휴리스틱 점검.
 *
 *   외부 검증 (search.google.com/test/rich-results)은 GUI라 자동화 불가 — 본 스크립트는
 *   "최소 필수 속성·형식 오류·escape" 등 공통 함정만 빠르게 검출.
 *
 *   실행: node scripts/validate-schema.mjs [base-url]
 *   기본 base = SITE_URL 또는 https://iknowhowinfo.com
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

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

const BASE = (process.argv[2] || process.env.SITE_URL || 'https://iknowhowinfo.com').replace(/\/+$/, '');

// 페이지별 기대 schema @type
const SAMPLE_PAGES = [
  { path: '/',                        expect: ['BreadcrumbList', 'Organization', 'NewsMediaOrganization'] },
  { path: '/etf/kodex-defense-top10', expect: ['BreadcrumbList', 'FinancialProduct', 'Dataset'] },
  { path: '/etf/kodex-200',           expect: ['BreadcrumbList', 'FinancialProduct', 'Dataset'] },
  { path: '/etf',                     expect: ['BreadcrumbList'] },
  { path: '/about',                   expect: ['BreadcrumbList', 'NewsMediaOrganization'] },
  { path: '/author/pb_kim',           expect: ['Person'] },
  { path: '/guide/monthly-dividend',  expect: ['Article', 'HowTo'] },
  { path: '/guide/retirement',        expect: ['Article', 'HowTo'] },
];

function extractJsonLd(html) {
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const blocks = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    try {
      const obj = JSON.parse(m[1]);
      blocks.push(Array.isArray(obj) ? obj : [obj]);
    } catch (err) {
      blocks.push({ _parseError: err.message, _raw: m[1].slice(0, 100) });
    }
  }
  return blocks.flat();
}

function audit(schema) {
  const issues = [];
  const type = schema['@type'];

  // 공통 — @context 필수
  if (!schema['@context']) issues.push('@context 누락');

  // 타입별 필수 속성 (Google rich result 자격 기준)
  if (type === 'FinancialProduct') {
    if (!schema.name) issues.push('FinancialProduct.name 누락');
    if (!schema.url) issues.push('FinancialProduct.url 누락');
    if (!schema.tickerSymbol && !schema.identifier) issues.push('FinancialProduct.tickerSymbol/identifier 누락');
    if (!schema.description) issues.push('FinancialProduct.description 누락');
  }
  if (type === 'Article' || type === 'NewsArticle') {
    if (!schema.headline) issues.push(`${type}.headline 누락`);
    if (!schema.author) issues.push(`${type}.author 누락`);
    if (!schema.datePublished) issues.push(`${type}.datePublished 누락`);
    if (schema.headline && schema.headline.length > 110) issues.push(`${type}.headline 110자 초과 (Google 권장)`);
    if (!schema.publisher) issues.push(`${type}.publisher 누락`);
  }
  if (type === 'BreadcrumbList') {
    if (!Array.isArray(schema.itemListElement) || schema.itemListElement.length === 0) {
      issues.push('BreadcrumbList.itemListElement 비어 있음');
    }
  }
  if (type === 'Dataset') {
    if (!schema.name) issues.push('Dataset.name 누락');
    if (!schema.description) issues.push('Dataset.description 누락');
    if (!schema.dateModified) issues.push('Dataset.dateModified 누락');
  }
  if (type === 'HowTo') {
    if (!Array.isArray(schema.step) || schema.step.length === 0) {
      issues.push('HowTo.step 비어 있음');
    }
  }
  if (type === 'Person') {
    if (!schema.name) issues.push('Person.name 누락');
  }
  if (type === 'Organization' || type === 'NewsMediaOrganization') {
    if (!schema.name) issues.push(`${type}.name 누락`);
    if (!schema.url) issues.push(`${type}.url 누락`);
  }

  return issues;
}

async function main() {
  console.log(`🔍 Schema.org 검증 · base: ${BASE}\n`);
  const report = [];
  let totalIssues = 0;

  for (const { path: p, expect } of SAMPLE_PAGES) {
    const url = `${BASE}${p}`;
    process.stdout.write(`  ${p.padEnd(35)} `);
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'schema-validator/1.0' } });
      if (!res.ok) {
        console.log(`❌ HTTP ${res.status}`);
        report.push({ path: p, error: `HTTP ${res.status}` });
        totalIssues++;
        continue;
      }
      const html = await res.text();
      const schemas = extractJsonLd(html);
      const types = schemas.map(s => s['@type']).filter(Boolean);
      const missing = expect.filter(e => !types.includes(e));
      const allIssues = [];
      for (const s of schemas) {
        if (s._parseError) {
          allIssues.push(`JSON parse: ${s._parseError}`);
          continue;
        }
        const a = audit(s);
        if (a.length) allIssues.push(`[${s['@type']}] ${a.join(', ')}`);
      }
      missing.forEach(m => allIssues.push(`기대 @type "${m}" 누락`));

      if (allIssues.length === 0) {
        console.log(`✅ schemas: [${types.join(', ')}]`);
      } else {
        console.log(`⚠️  ${allIssues.length}건`);
        allIssues.forEach(i => console.log(`     ↳ ${i}`));
        totalIssues += allIssues.length;
      }
      report.push({ path: p, types, issues: allIssues });
    } catch (err) {
      console.log(`❌ ${err.message}`);
      report.push({ path: p, error: err.message });
      totalIssues++;
    }
  }

  const out = path.join(__dirname, '.validate-schema-report.json');
  fs.writeFileSync(out, JSON.stringify({ ranAt: new Date().toISOString(), base: BASE, report }, null, 2));
  console.log(`\n💾 리포트: ${out}`);
  console.log(`총 이슈: ${totalIssues}건`);
  process.exit(totalIssues === 0 ? 0 : 2);
}

main().catch(err => { console.error('실패:', err); process.exit(1); });
