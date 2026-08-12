/**
 * IndexPusher — 발행 즉시 실효성 있는 색인 요청
 *   1) Bing IndexNow — 무료, 검증 파일만 도메인 루트에 두면 끝. 네이버·Yandex도 지원
 *   2) 네이버 웹마스터도구 — 사이트맵 재제출 핑 (수동 등록 필수, API 키 필요)
 *
 *   Google Indexing API는 Job Posting·Live Stream 전용이라 일반 블로그에 쓸모 없음 → 사용 안 함.
 *
 *   환경변수:
 *     INDEXNOW_KEY            — Bing IndexNow 키 (32자 hex 추천). public/{key}.txt 파일도 같이 생성 필요
 *     SITE_URL                — 사이트 절대 URL
 *     NAVER_WEBMASTER_SECRET  — 네이버 웹마스터 사이트 소유 인증 코드 (선택)
 */

const fs = require('fs');
const path = require('path');

async function submitIndexNow(urls, key) {
  if (!urls || urls.length === 0) return { ok: false, reason: 'no-urls' };

  const siteUrl = process.env.SITE_URL;
  if (!siteUrl) return { ok: false, reason: 'no-site-url' };
  if (!key) return { ok: false, reason: 'no-key' };

  const host = new URL(siteUrl).hostname;
  const body = {
    host,
    key,
    keyLocation: `${siteUrl.replace(/\/+$/, '')}/${key}.txt`,
    urlList: urls,
  };

  // 2026-08-12: 기존에는 api.indexnow.org 한 곳에만 POST하고 "네이버에도 전파된다"고
  //   가정만 하고 있었다. 네이버는 자체 엔드포인트를 따로 운영하며 실측상 200으로 응답한다.
  //   네이버가 성장축(30일 노출 6.8만, 전월 대비 +357%)인데 정작 직접 통보 경로만
  //   비어 있었으므로 두 곳에 모두 제출한다. 한쪽이 실패해도 다른 쪽은 유지한다.
  const keyLocation = body.keyLocation;
  const naverBase = 'https://searchadvisor.naver.com/indexnow';

  const submitGeneric = async () => {
    const res = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body),
    });
    // 200 OK, 202 Accepted 모두 성공. 422는 key 파일 없음 등
    return { ok: res.status >= 200 && res.status < 300, status: res.status };
  };

  // 네이버 엔드포인트는 URL 1건씩 GET 방식. 과다 요청을 피해 순차 제출하고 간격을 둔다.
  const submitNaver = async () => {
    let ok = 0, fail = 0;
    for (const u of urls) {
      try {
        const q = `${naverBase}?url=${encodeURIComponent(u)}&key=${encodeURIComponent(key)}&keyLocation=${encodeURIComponent(keyLocation)}`;
        const r = await fetch(q, { method: 'GET' });
        if (r.status >= 200 && r.status < 300) ok++; else fail++;
      } catch { fail++; }
      await new Promise(r => setTimeout(r, 150));
    }
    return { ok: fail === 0, submitted: ok, failed: fail };
  };

  try {
    const generic = await submitGeneric();
    const naver = await submitNaver();
    return {
      ok: generic.ok || naver.ok,
      status: generic.status,
      naver,
    };
  } catch (err) {
    return { ok: false, reason: err.message };
  }
}

async function pingNaverSitemap(siteUrl) {
  // 네이버 웹마스터도구 API는 OAuth 등록 + 수동 수집 요청만 정식 지원.
  // 다행히 네이버는 2022년부터 IndexNow 가맹사 — submitIndexNow()가 자동 통보.
  //
  // 추가 신호로 sitemap.xml의 GET 요청을 직접 트리거 (CDN cache 갱신 + Naver Yeti 인지)
  if (!siteUrl) return { ok: false };
  const sitemaps = [
    `${siteUrl.replace(/\/+$/, '')}/sitemap-index.xml`,
    `${siteUrl.replace(/\/+$/, '')}/sitemap.xml`,
    `${siteUrl.replace(/\/+$/, '')}/sitemap-etf.xml`,
  ];
  const pings = await Promise.allSettled(
    sitemaps.map(url =>
      fetch(url, { method: 'GET', headers: { 'User-Agent': 'Daily-ETF-Pulse-Sitemap-Refresher/1.0' } })
        .then(r => ({ url, status: r.status }))
        .catch(err => ({ url, error: err.message }))
    ),
  );
  const results = pings.map(p => p.status === 'fulfilled' ? p.value : { error: 'rejected' });
  const successCount = results.filter(r => 'status' in r && r.status === 200).length;
  return {
    ok: successCount === sitemaps.length,
    note: 'IndexNow가 Naver Yeti에도 전파됨. sitemap GET ping은 CDN 캐시 갱신 효과.',
    sitemapsRefreshed: successCount,
    sitemapsTotal: sitemaps.length,
    results,
  };
}

/**
 * public/{INDEXNOW_KEY}.txt 파일이 있는지 확인 (자동 생성 옵션)
 */
function ensureKeyFile(key, publicDir) {
  if (!key) return false;
  const filePath = path.join(publicDir, `${key}.txt`);
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, key, 'utf-8');
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * 배포가 끝나 URL이 실제로 열릴 때까지 기다린다.
 *
 *   색인 통보를 배포보다 먼저 보내면 검색엔진 봇이 곧바로 찾아왔을 때 404를 받는다.
 *   특히 네이버 Yeti는 IndexNow 통보 직후에 오는 편이라 손실이 크다.
 *   한 번 404로 버려진 주소는 큐에서 빠지고, 다음 정기 수집까지 기다려야 한다.
 *
 *   기다려도 안 열리는 주소는 통보하지 않고 dead로 돌려준다. 통보 안 한 것보다
 *   틀린 주소를 통보하는 쪽이 나쁘다. (2026-08-12)
 *
 * @returns {{ live: string[], dead: string[], waitedMs: number }}
 */
async function waitForLive(urls, opts = {}) {
  const timeoutMs = opts.timeoutMs ?? 12 * 60 * 1000;
  const intervalMs = opts.intervalMs ?? 20 * 1000;
  const log = opts.log || (() => {});
  const started = Date.now();
  let pending = [...urls];
  const live = [];

  while (pending.length && Date.now() - started < timeoutMs) {
    const still = [];
    for (const u of pending) {
      try {
        const res = await fetch(u, { method: 'GET', redirect: 'follow' });
        if (res.ok) live.push(u);
        else still.push(u);
      } catch {
        still.push(u);
      }
    }
    pending = still;
    if (!pending.length) break;
    log(`  배포 대기 ${live.length}/${urls.length} 확인 · ${Math.round((Date.now() - started) / 1000)}초 경과`);
    await new Promise(r => setTimeout(r, intervalMs));
  }

  return { live, dead: pending, waitedMs: Date.now() - started };
}

/**
 * 여러 URL 경로를 받아 색인 요청
 *
 * @param {string[]} paths — /pulse/... 같은 상대 경로
 * @param {object} opts — publicDir, waitForDeploy(기본 true), log
 * @returns {{ indexNow: object, naver: object, usedRealApi: boolean }}
 */
async function submitAll(paths, opts = {}) {
  const siteUrl = process.env.SITE_URL;
  const key = process.env.INDEXNOW_KEY;
  if (!siteUrl) {
    return { usedRealApi: false, reason: 'no-site-url', indexNow: null, naver: null };
  }

  // public/ 에 키 파일 자동 생성 (CF Pages 빌드에 포함되도록)
  if (key && opts.publicDir) ensureKeyFile(key, opts.publicDir);

  let urls = paths.map(p => `${siteUrl.replace(/\/+$/, '')}${p}`);
  let dead = [];

  // 배포 완료를 확인한 뒤에만 통보한다
  if (opts.waitForDeploy !== false) {
    const r = await waitForLive(urls, { log: opts.log, timeoutMs: opts.deployTimeoutMs });
    urls = r.live;
    dead = r.dead;
    if (dead.length && opts.log) {
      opts.log(`  ⚠️ 아직 열리지 않아 통보에서 제외: ${dead.length}건`);
      dead.forEach(u => opts.log(`     ${u}`));
    }
  }

  if (!urls.length) {
    return { usedRealApi: false, reason: 'not-deployed', indexNow: null, naver: null, urls: [], dead };
  }

  const indexNow = await submitIndexNow(urls, key);
  const naver = await pingNaverSitemap(siteUrl);

  return {
    usedRealApi: indexNow.ok,
    indexNow,
    naver,
    urls,
    dead,
  };
}

module.exports = { submitAll, submitIndexNow, ensureKeyFile, pingNaverSitemap, waitForLive };
