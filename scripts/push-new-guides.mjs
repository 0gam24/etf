#!/usr/bin/env node
/**
 * push-new-guides — 가이드 발행분 즉시 색인 요청 (에이전트 17: guide_index_pusher)
 *
 *   배경: IndexNow·Google Indexing 자동 푸시는 데일리 파이프라인(npm run pulse)의
 *   MDX 발행 경로에만 연결되어 있었다. 가이드는 루틴이 src/lib/guides.ts에 직접
 *   추가하는 방식이라, 매일 5편씩 나오는 주력 콘텐츠가 색인 요청 없이 sitemap
 *   크롤만 기다리는 구조적 공백이 있었다. 이 스크립트가 그 공백을 메운다.
 *
 *   동작:
 *     1) src/lib/guides.ts의 GUIDE_PUBLISHED_AT에서 발행일별 slug 추출
 *     2) 대상 날짜 선택 (기본: 가장 최근 발행일 / --date=YYYY-MM-DD / --days=N)
 *     3) IndexNow(Bing·Naver Yeti·Yandex) + Google Indexing API 푸시
 *        + sitemap GET ping (CDN 캐시 갱신)
 *
 *   사용:
 *     npm run push:guides              # 가장 최근 발행일 묶음
 *     npm run push:guides -- --days=3  # 최근 3일치
 *     npm run push:guides -- --date=2026-07-19
 *     npm run push:guides -- --dry     # 대상만 출력, 요청 안 보냄
 *
 *   키(INDEXNOW_KEY / GOOGLE_INDEXING_KEY) 미설정 시 해당 채널만 graceful skip.
 *   가이드 발행 루틴 마지막 단계에서 호출하는 것을 표준 절차로 한다.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

// .env.local 로드 (CLI 직접 실행 대응) + 기존 색인 모듈 재사용
require(path.join(ROOT, 'pipeline', 'env.js'));
const { submitAll } = require(path.join(ROOT, 'pipeline', 'index_pusher.js'));
const { submitIndexing } = require(path.join(ROOT, 'pipeline', 'google_indexing.js'));

// ── 1. GUIDE_PUBLISHED_AT 파싱 ──────────────────────────────────────
function parsePublishedMap() {
  const src = fs.readFileSync(path.join(ROOT, 'src', 'lib', 'guides.ts'), 'utf-8');
  const blockMatch = src.match(/export const GUIDE_PUBLISHED_AT[^{]*\{([\s\S]*?)\n\};/);
  if (!blockMatch) {
    console.error('✖ GUIDE_PUBLISHED_AT 블록을 찾지 못했습니다 (guides.ts 구조 변경?)');
    process.exit(1);
  }
  const map = {};
  const entryRe = /'([a-z0-9-]+)'\s*:\s*'(\d{4}-\d{2}-\d{2})'/g;
  let m;
  while ((m = entryRe.exec(blockMatch[1])) !== null) {
    map[m[1]] = m[2];
  }
  return map;
}

// ── 2. 대상 날짜 선택 ────────────────────────────────────────────────
function pickTargets(map, argv) {
  const dates = [...new Set(Object.values(map))].sort().reverse();
  if (!dates.length) return { targetDates: [], slugs: [] };

  const dateArg = argv.find(a => a.startsWith('--date='))?.slice(7);
  const daysArg = argv.find(a => a.startsWith('--days='))?.slice(7);

  let targetDates;
  if (dateArg) {
    targetDates = [dateArg];
  } else if (daysArg) {
    targetDates = dates.slice(0, Math.max(1, parseInt(daysArg, 10) || 1));
  } else {
    targetDates = [dates[0]]; // 기본: 가장 최근 발행일
  }

  const set = new Set(targetDates);
  const slugs = Object.entries(map)
    .filter(([, d]) => set.has(d))
    .map(([slug]) => slug);
  return { targetDates, slugs };
}

// ── 3. 실행 ──────────────────────────────────────────────────────────
async function main() {
  const argv = process.argv.slice(2);
  const map = parsePublishedMap();
  const { targetDates, slugs } = pickTargets(map, argv);

  if (!slugs.length) {
    console.log('푸시할 가이드가 없습니다 (대상 날짜:', targetDates.join(', ') || '없음', ')');
    return;
  }

  const siteUrl = (process.env.SITE_URL || 'https://iknowhowinfo.com').replace(/\/+$/, '');
  // 새 가이드 + 이들이 노출되는 허브 페이지 (홈·가이드 인덱스·최신순 아카이브)
  const paths = [
    ...slugs.map(s => `/guide/${s}`),
    '/guide/latest',
    '/guide',
    '/',
  ];

  console.log(`── 가이드 색인 푸시 — 대상 ${targetDates.join(', ')} · 가이드 ${slugs.length}편 + 허브 3 ──`);
  for (const p of paths) console.log('  ·', p);

  if (argv.includes('--dry')) {
    console.log('(--dry) 요청 미발송. 대상 확인만 수행했습니다.');
    return;
  }

  // 배포 완료 확인 → IndexNow (Bing·Naver·Yandex) + sitemap ping
  //   먼저 통보하면 봇이 404를 받고 주소를 큐에서 버린다. 열린 것만 알린다.
  console.log('  배포 확인 중...');
  const inRes = await submitAll(paths, {
    publicDir: path.join(ROOT, 'public'),
    log: msg => console.log(msg),
  });
  if (inRes.reason === 'not-deployed') {
    console.log('✗ 대기 시간 안에 열린 주소가 없습니다. 배포 완료 후 다시 실행하세요.');
    process.exitCode = 1;
    return;
  }
  if (inRes.indexNow?.ok) {
    console.log(`✔ IndexNow 통보 완료 (status ${inRes.indexNow.status}) · Bing·Naver Yeti·Yandex · ${inRes.urls.length}건`);
  } else {
    console.log(`○ IndexNow skip/실패:`, inRes.indexNow?.reason || inRes.indexNow?.status || inRes.reason);
  }
  if (inRes.naver) {
    console.log(`  CDN 캐시 갱신: ${inRes.naver.sitemapsRefreshed ?? 0}/${inRes.naver.sitemapsTotal ?? 0}`);
  }

  // Google Indexing API — 열린 주소만
  const gUrls = inRes.urls;
  const gRes = await submitIndexing(gUrls);
  if (gRes.usedRealApi) {
    const ok = gRes.results.filter(r => r.ok).length;
    console.log(`✔ Google Indexing ${ok}/${gRes.results.length} 성공`);
    for (const r of gRes.results.filter(r => !r.ok)) {
      console.log(`  ✖ ${r.url}: ${r.status || ''} ${String(r.error || '').slice(0, 120)}`);
    }
  } else {
    console.log('○ Google Indexing skip:', gRes.reason);
  }

  console.log('완료.');
}

main().catch(err => {
  console.error('✖ push-new-guides 실패:', err.message);
  process.exit(1);
});
