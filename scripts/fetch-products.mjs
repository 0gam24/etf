#!/usr/bin/env node
/**
 * Coupang Open API → data/affiliates/products.json 갱신 스크립트.
 *
 *   - 카테고리별 키워드 검색 (책 + 학습 도구 분리)
 *   - 응답 필터링 (curation-config.json: 별점·리뷰·가격·whitelist/blacklist)
 *   - 결과를 ProductEntry 형식으로 정규화 → products.json 저장
 *   - 변경 없으면 파일 미수정 (cron이 빈 commit 안 만들도록)
 *
 *   사용:
 *     npm run fetch:products             # 정상 호출
 *     npm run fetch:products -- --dry    # API 호출 없이 책 카테고리·키워드 검증만
 *     npm run fetch:products -- --merge  # 기존 수동 큐레이션을 보존하면서 자동 결과만 추가
 *
 *   환경변수:
 *     COUPANG_PARTNERS_ACCESS_KEY · COUPANG_PARTNERS_SECRET_KEY
 *     누락 시 dry-run으로 자동 폴백.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { createHmac } from 'node:crypto';

const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const MERGE = args.includes('--merge');
// 기본: rate cap 도달 시 부분 저장 후 즉시 종료 (1시간 대기 X)
// --wait 명시하면 한도까지 기다려서 모든 키워드 fetch
const WAIT_ON_CAP = args.includes('--wait');

const ROOT = process.cwd();
const CONFIG_FILE = join(ROOT, 'data', 'affiliates', 'curation-config.json');
const OUTPUT_FILE = join(ROOT, 'data', 'affiliates', 'products.json');

const HOST = 'https://api-gateway.coupang.com';
const API_ROOT = '/v2/providers/affiliate_open_api/apis/openapi/v1';

// ── HMAC 서명 (lib/coupang.ts와 동일 로직, ESM 환경) ──
function buildSignedDate(now = new Date()) {
  const yy = String(now.getUTCFullYear()).slice(2);
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(now.getUTCDate()).padStart(2, '0');
  const hh = String(now.getUTCHours()).padStart(2, '0');
  const mi = String(now.getUTCMinutes()).padStart(2, '0');
  const ss = String(now.getUTCSeconds()).padStart(2, '0');
  return `${yy}${mm}${dd}T${hh}${mi}${ss}Z`;
}

function buildAuthHeader(method, pathWithQuery, accessKey, secretKey) {
  const signedDate = buildSignedDate();
  const [pathOnly, query = ''] = pathWithQuery.split('?');
  const message = `${signedDate}${method}${pathOnly}${query}`;
  const signature = createHmac('sha256', secretKey).update(message).digest('hex');
  return `CEA algorithm=HmacSHA256, access-key=${accessKey}, signed-date=${signedDate}, signature=${signature}`;
}

// ── Rate limiter ──
const callTimes = [];
const HOUR_MS = 3600 * 1000;
const HOURLY_CAP = 8;

class RateCapError extends Error {
  constructor(secondsToWait) {
    super(`rate cap hit (${HOURLY_CAP}/h). Wait ${secondsToWait}s.`);
    this.name = 'RateCapError';
    this.secondsToWait = secondsToWait;
  }
}

async function throttle() {
  const now = Date.now();
  while (callTimes.length && now - callTimes[0] > HOUR_MS) callTimes.shift();
  if (callTimes.length >= HOURLY_CAP) {
    const wait = HOUR_MS - (now - callTimes[0]) + 1000;
    if (!WAIT_ON_CAP) {
      throw new RateCapError(Math.round(wait / 1000));
    }
    console.warn(`[fetch] rate cap hit. sleeping ${Math.round(wait / 1000)}s (--wait mode)`);
    await new Promise(r => setTimeout(r, wait));
    return throttle();
  }
  callTimes.push(now);
}

async function searchProducts(keyword, limit, accessKey, secretKey) {
  await throttle();
  const params = new URLSearchParams({ keyword, limit: String(limit) });
  const path = `/products/search?${params}`;
  const url = `${HOST}${API_ROOT}${path}`;
  const auth = buildAuthHeader('GET', `${API_ROOT}${path}`, accessKey, secretKey);
  const res = await fetch(url, {
    headers: { Authorization: auth, 'Content-Type': 'application/json;charset=UTF-8' },
  });
  if (!res.ok) {
    console.warn(`[fetch] search "${keyword}" → HTTP ${res.status}`);
    return [];
  }
  const json = await res.json();
  if (json.rCode !== '0') {
    console.warn(`[fetch] search "${keyword}" rCode=${json.rCode} ${json.rMessage}`);
    return [];
  }
  return json.data?.productData || [];
}

// ── Filter ──
function passesFilter(p, filters, blacklist) {
  if (filters.minPrice && p.productPrice < filters.minPrice) return false;
  if (filters.maxPrice && p.productPrice > filters.maxPrice) return false;
  if (filters.requireImage && !p.productImage) return false;
  if (typeof p.ratingAverage === 'number' && filters.minRatingAverage && p.ratingAverage < filters.minRatingAverage) return false;
  if (typeof p.ratingCount === 'number' && filters.minRatingCount && p.ratingCount < filters.minRatingCount) return false;
  // 제목 화이트리스트 — 도서/재테크 도구 키워드가 제목에 있어야 통과 (food/cosmetic/eSIM 노이즈 방지)
  const wl = filters.titleKeywordWhitelist;
  if (Array.isArray(wl) && wl.length > 0) {
    const title = p.productName || '';
    const hit = wl.some(kw => title.includes(kw));
    if (!hit) return false;
  }
  // blacklist
  for (const bl of blacklist || []) {
    if (bl.match && p.productName?.includes(bl.match)) return false;
    if (bl.productId && String(p.productId) === String(bl.productId)) return false;
  }
  return true;
}

// ── Normalize CoupangProduct → ProductEntry ──
// needs[] 는 카테고리 config의 needs / toolNeeds 에서 읽어와 자동 할당.
// /resources 페이지의 viewer-first 그룹핑이 즉시 작동.
function normalize(p, category, tone, keyword, needs) {
  const id = `cpg-${p.productId}`;
  return {
    id,
    title: p.productName,
    subtitle: '', // search API는 저자 정보 없음 — 수동으로 채워야 정확
    source: '',  // 마찬가지
    price: p.productPrice || 0,
    blurb: '', // 수동으로 채워야 큐레이션 가치 살아남
    deeplink: p.productUrl, // 이미 단축 deeplink
    image: p.productImage,
    categories: [category],
    tone,
    ratingAverage: p.ratingAverage,
    ratingCount: p.ratingCount,
    isRocket: Boolean(p.isRocket),
    pickedAt: new Date().toISOString(),
    pickedFromKeyword: keyword,
    needs: Array.isArray(needs) && needs.length ? needs : undefined,
  };
}

// ── Main ──
async function main() {
  const config = JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'));
  const { accessKey, secretKey } = {
    accessKey: process.env.COUPANG_PARTNERS_ACCESS_KEY,
    secretKey: process.env.COUPANG_PARTNERS_SECRET_KEY,
  };

  const dryRun = DRY || !accessKey || !secretKey;

  if (dryRun) {
    console.log('[fetch] dry-run mode (API 호출 X). config 검증만.');
    let total = 0;
    for (const cat of config.categories) {
      const all = [...(cat.keywords || []), ...(cat.toolKeywords || [])];
      console.log(`  ${cat.id} (${cat.tone}): ${all.length} keywords → ${all.join(' | ')}`);
      total += all.length;
    }
    console.log(`[fetch] total ${total} keywords across ${config.categories.length} categories`);
    if (!accessKey || !secretKey) {
      console.warn('[fetch] ⚠️  COUPANG_PARTNERS_ACCESS_KEY/SECRET_KEY 미설정 — 실제 fetch 안 됨.');
    }
    return;
  }

  console.log('[fetch] live mode — Coupang API 호출 시작');
  const collected = [];
  const seen = new Set(); // 중복 제거
  let rateCapped = false;
  let secondsToWait = 0;

  outer:
  for (const cat of config.categories) {
    const bookKeywords = cat.keywords || [];
    const toolKeywords = cat.tone !== 'book' ? (cat.toolKeywords || []) : [];

    for (const keyword of bookKeywords) {
      const tone = 'book';
      try {
        const products = await searchProducts(keyword, config.fetchLimitPerKeyword || 10, accessKey, secretKey);
        for (const p of products) {
          if (seen.has(p.productId)) continue;
          if (!passesFilter(p, config.filters, config.blacklist)) continue;
          seen.add(p.productId);
          collected.push(normalize(p, cat.id, tone, keyword, cat.needs));
        }
        console.log(`  ✓ ${cat.id}/${tone} "${keyword}" → ${products.length} fetched`);
      } catch (err) {
        if (err instanceof RateCapError) {
          rateCapped = true;
          secondsToWait = err.secondsToWait;
          console.warn(`  ⏸  ${cat.id}/${tone} "${keyword}" — ${err.message}`);
          break outer;
        }
        console.warn(`  ✗ ${cat.id}/${tone} "${keyword}" failed:`, err.message);
      }
    }

    for (const keyword of toolKeywords) {
      const tone = 'tool';
      try {
        const products = await searchProducts(keyword, config.fetchLimitPerKeyword || 10, accessKey, secretKey);
        for (const p of products) {
          if (seen.has(p.productId)) continue;
          if (!passesFilter(p, config.filters, config.blacklist)) continue;
          seen.add(p.productId);
          collected.push(normalize(p, cat.id, tone, keyword, cat.toolNeeds));
        }
        console.log(`  ✓ ${cat.id}/${tone} "${keyword}" → ${products.length} fetched`);
      } catch (err) {
        if (err instanceof RateCapError) {
          rateCapped = true;
          secondsToWait = err.secondsToWait;
          console.warn(`  ⏸  ${cat.id}/${tone} "${keyword}" — ${err.message}`);
          break outer;
        }
        console.warn(`  ✗ ${cat.id}/${tone} "${keyword}" failed:`, err.message);
      }
    }
  }

  if (rateCapped) {
    console.log(`[fetch] rate cap reached. saving partial results (${collected.length} products) and exiting.`);
    console.log(`[fetch] re-run after ~${Math.round(secondsToWait / 60)} minutes (or use --wait to wait now).`);
    console.log(`[fetch] tip: --merge mode preserves existing products.json so multiple runs accumulate.`);
  }

  // 카테고리당 limit cap
  const perCategoryLimit = config.limitPerCategory || 5;
  const byCategory = new Map();
  for (const p of collected) {
    for (const cat of p.categories) {
      const arr = byCategory.get(cat) || [];
      if (arr.length < perCategoryLimit) arr.push(p);
      byCategory.set(cat, arr);
    }
  }
  const finalProducts = Array.from(new Map(
    Array.from(byCategory.values()).flat().map(p => [p.id, p]),
  ).values());

  // MERGE 모드: 기존 products.json의 수동 큐레이션 + blurb·subtitle 보존
  let merged = finalProducts;
  if (MERGE && existsSync(OUTPUT_FILE)) {
    try {
      const existing = JSON.parse(readFileSync(OUTPUT_FILE, 'utf-8'));
      const oldById = new Map((existing.products || []).map(p => [p.id, p]));
      merged = finalProducts.map(p => {
        const old = oldById.get(p.id);
        if (!old) return p;
        // 수동 채운 필드 보존 — viewer-first 큐레이션 데이터 (hook + needs 포함)
        return {
          ...p,
          subtitle: old.subtitle || p.subtitle,
          source: old.source || p.source,
          year: old.year ?? p.year,
          blurb: old.blurb || p.blurb,
          originalPrice: old.originalPrice ?? p.originalPrice,
          hook: old.hook || p.hook,
          needs: old.needs || p.needs,
        };
      });
      // 기존에만 있는 수동 항목(자동 fetch에 안 잡힌 것)은 보존
      for (const old of existing.products || []) {
        if (!merged.find(m => m.id === old.id) && !old.id.startsWith('cpg-')) {
          merged.push(old);
        }
      }
    } catch { /* fall through */ }
  }

  const output = {
    reviewedAt: new Date().toISOString().slice(0, 10),
    products: merged,
  };

  // 변경 감지 (file 동일 시 skip)
  if (existsSync(OUTPUT_FILE)) {
    const before = readFileSync(OUTPUT_FILE, 'utf-8');
    const next = JSON.stringify(output, null, 2) + '\n';
    if (before.trim() === next.trim()) {
      console.log('[fetch] no changes — file unchanged.');
      return;
    }
  }

  if (!existsSync(dirname(OUTPUT_FILE))) mkdirSync(dirname(OUTPUT_FILE), { recursive: true });
  writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2) + '\n', 'utf-8');
  console.log(`[fetch] wrote ${merged.length} products → ${OUTPUT_FILE}`);
}

main().catch(err => {
  console.error('[fetch] fatal:', err);
  process.exit(1);
});
