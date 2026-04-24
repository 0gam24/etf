/**
 * Google Indexing API v3 — 서비스 계정 JWT 인증
 *   의존성 없이 Node crypto만으로 JWT 서명 → access token 교환 → indexing 호출
 *
 *   환경변수:
 *     GOOGLE_INDEXING_KEY      — 서비스 계정 JSON 전체 문자열
 *     GOOGLE_INDEXING_KEY_FILE — 또는 JSON 파일 경로
 */

const fs = require('fs');
const crypto = require('crypto');

function loadServiceAccount() {
  const raw = process.env.GOOGLE_INDEXING_KEY;
  if (raw) {
    try { return JSON.parse(raw); } catch { /* fall-through */ }
  }
  const file = process.env.GOOGLE_INDEXING_KEY_FILE;
  if (file && fs.existsSync(file)) {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  }
  return null;
}

function base64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function getAccessToken(sa) {
  const iat = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token',
    iat,
    exp: iat + 3600,
  };

  const headerB64 = base64url(JSON.stringify(header));
  const claimB64 = base64url(JSON.stringify(claim));
  const unsigned = `${headerB64}.${claimB64}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsigned);
  const signature = signer.sign(sa.private_key);
  const jwt = `${unsigned}.${base64url(signature)}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }).toString(),
  });
  if (!res.ok) throw new Error(`Token 교환 실패 ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json.access_token;
}

async function publishUrlUpdate(url, accessToken) {
  const res = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url, type: 'URL_UPDATED' }),
  });
  if (!res.ok) {
    const text = await res.text();
    return { url, ok: false, status: res.status, error: text.slice(0, 400) };
  }
  return { url, ok: true };
}

/**
 * 여러 URL을 Google에 인덱싱 요청
 * @param {string[]} urls — 절대 URL 배열
 * @returns { results: {url, ok, status?, error?}[], usedRealApi: boolean, reason?: string }
 */
async function submitIndexing(urls) {
  if (!urls || urls.length === 0) return { results: [], usedRealApi: false, reason: 'no-urls' };
  const sa = loadServiceAccount();
  if (!sa) return { results: urls.map(u => ({ url: u, ok: false, status: 'no-credentials' })), usedRealApi: false, reason: 'no-credentials' };

  try {
    const token = await getAccessToken(sa);
    const results = [];
    for (const url of urls) {
      results.push(await publishUrlUpdate(url, token));
    }
    return { results, usedRealApi: true };
  } catch (err) {
    return { results: urls.map(u => ({ url: u, ok: false, error: err.message })), usedRealApi: false, reason: err.message };
  }
}

module.exports = { submitIndexing };
