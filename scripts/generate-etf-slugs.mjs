#!/usr/bin/env node
/**
 * KRX 1095종 ETF 이름 → SEO 슬러그 사전 생성.
 *
 *   결과: data/etf-slug-map.json
 *     {
 *       generatedAt: ISO,
 *       count: N,
 *       byCode:  { "0080G0": "kodex-defense-top10", ... },  // 코드 → 슬러그
 *       bySlug:  { "kodex-defense-top10": { code, name }, ... },  // 슬러그 → 메타
 *     }
 *
 *   슬러그 정책 (SEO 최적):
 *     1. agents/2_seo_architect.js의 KOREAN_SLUG_MAP 재사용 (한글 토큰 → 영문)
 *     2. 운용사명(KODEX/TIGER/SOL 등) prefix 자연 포함 → 거의 unique
 *     3. 충돌 발생 시 코드 suffix 추가 (예: kodex-200-069500)
 *     4. 한 번 결정된 슬러그는 영구 불변 (이름 변경되어도 슬러그 유지)
 *
 *   재실행 시 기존 byCode 매핑은 보존하고, 신규 ETF만 슬러그 신규 생성.
 *
 *   실행: node scripts/generate-etf-slugs.mjs
 *         node scripts/generate-etf-slugs.mjs --rebuild  (기존 매핑 무시, 전체 재생성)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const KRX_FILE = path.join(ROOT, 'data', 'krx-etf-codes.json');
const OUT_FILE = path.join(ROOT, 'data', 'etf-slug-map.json');

const REBUILD = process.argv.includes('--rebuild');

// agents/2_seo_architect.js의 slugify 재사용 (CommonJS 동적 require)
const { createRequire } = await import('module');
const require = createRequire(import.meta.url);
const { slugify } = require(path.join(ROOT, 'agents', '2_seo_architect.js'));

function loadKrx() {
  if (!fs.existsSync(KRX_FILE)) {
    console.error('❌ data/krx-etf-codes.json 없음 — 먼저 npm run fetch:etf-codes 실행');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(KRX_FILE, 'utf-8'));
}

function loadExisting() {
  if (REBUILD || !fs.existsSync(OUT_FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(OUT_FILE, 'utf-8'));
  } catch {
    return null;
  }
}

// 운용사 키워드만 있는 슬러그는 SEO 가치 0 → 코드 suffix 강제
const ISSUER_ONLY = new Set([
  'kodex', 'tiger', 'sol', 'ace', 'plus', 'rise', 'hanaro', 'kosef',
  'hk', 'kiwoom', 'time', '1q', 'koact', 'bnk', 'won', 'power', 'mighty',
]);

function generateSlug(name, code) {
  let s = slugify(name);
  // slugify가 빈 결과 → 코드 fallback
  if (!s || s.length < 2) return code.toLowerCase();
  // 운용사명만 남은 슬러그 (예: 'kodex', 'tiger') → 코드 강제 부착
  if (ISSUER_ONLY.has(s) || s.length < 4) {
    return `${s}-${code.toLowerCase()}`;
  }
  return s;
}

function ensureUnique(slug, code, taken) {
  // 충돌 없음 → 그대로
  if (!taken.has(slug)) return slug;
  // 같은 코드가 동일 슬러그 가지고 있으면 OK (멱등)
  if (taken.get(slug) === code) return slug;
  // 충돌 → 코드 suffix
  const candidate = `${slug}-${code.toLowerCase()}`;
  return candidate;
}

function main() {
  const krx = loadKrx();
  const existing = loadExisting();

  const byCode = {};
  const bySlug = {};
  const taken = new Map(); // slug → code (충돌 추적)

  // 1) 기존 매핑 보존 (불변 정책)
  if (existing) {
    for (const [code, slug] of Object.entries(existing.byCode || {})) {
      // 기존 매핑이 현재 KRX에도 있는 종목만 보존
      if (krx.byShortcode[code]) {
        byCode[code] = slug;
        bySlug[slug] = { code, name: krx.byShortcode[code].name };
        taken.set(slug, code);
      }
    }
    console.log(`📚 기존 매핑 ${Object.keys(byCode).length}건 보존`);
  }

  // 2) 신규 종목만 슬러그 생성
  let newCount = 0;
  let collisionCount = 0;
  for (const e of krx.list) {
    if (byCode[e.shortcode]) continue; // 이미 매핑됨

    const baseSlug = generateSlug(e.name, e.shortcode);
    const finalSlug = ensureUnique(baseSlug, e.shortcode, taken);
    if (finalSlug !== baseSlug) collisionCount++;

    byCode[e.shortcode] = finalSlug;
    bySlug[finalSlug] = { code: e.shortcode, name: e.name };
    taken.set(finalSlug, e.shortcode);
    newCount++;
  }
  console.log(`✨ 신규 매핑 ${newCount}건 (충돌 ${collisionCount}건 → 코드 suffix)`);

  // 3) Audit — 의심스러운 슬러그 (너무 짧거나 코드만 있는)
  const suspicious = Object.entries(byCode).filter(([code, slug]) => {
    return slug === code.toLowerCase() || slug.length < 4;
  });
  if (suspicious.length > 0) {
    console.log(`\n⚠️  의심 슬러그 ${suspicious.length}건 (KOREAN_SLUG_MAP 보강 권장):`);
    suspicious.slice(0, 10).forEach(([code, slug]) => {
      console.log(`   ${code} → ${slug}  (${krx.byShortcode[code].name})`);
    });
    if (suspicious.length > 10) console.log(`   ...외 ${suspicious.length - 10}건`);
  }

  // 4) 저장
  const out = {
    generatedAt: new Date().toISOString(),
    sourceBaseDate: krx.baseDate || '',
    count: Object.keys(byCode).length,
    byCode,
    bySlug,
  };

  fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2), 'utf-8');
  console.log(`\n💾 저장: ${OUT_FILE}`);
  console.log(`   총 ${out.count}종 매핑 (KRX ${krx.list.length}종 중)`);
}

main();
