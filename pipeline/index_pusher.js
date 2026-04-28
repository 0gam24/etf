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

  try {
    const res = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body),
    });
    // 200 OK, 202 Accepted 모두 성공. 422는 key 파일 없음 등
    return { ok: res.status >= 200 && res.status < 300, status: res.status };
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
 * 여러 URL 경로를 받아 색인 요청
 *
 * @param {string[]} paths — /pulse/... 같은 상대 경로
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

  const urls = paths.map(p => `${siteUrl.replace(/\/+$/, '')}${p}`);
  const indexNow = await submitIndexNow(urls, key);
  const naver = await pingNaverSitemap(siteUrl);

  return {
    usedRealApi: indexNow.ok,
    indexNow,
    naver,
    urls,
  };
}

module.exports = { submitAll, submitIndexNow, ensureKeyFile };
