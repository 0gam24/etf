/**
 * Meta Threads Publishing API v1 클라이언트
 *   2단계 발행: (1) 미디어 컨테이너 생성 → (2) 퍼블리시
 *
 *   환경변수:
 *     THREADS_USER_ID       — Threads 사용자 ID (숫자)
 *     THREADS_ACCESS_TOKEN  — 사용자 액세스 토큰 (60일 유효, 장기 토큰 교환 필요)
 *
 *   한도: 250 posts/24h. 500자 제한.
 */

const BASE = 'https://graph.threads.net/v1.0';

async function createContainer({ userId, token, text, imageUrl }) {
  const params = new URLSearchParams();
  params.set('media_type', imageUrl ? 'IMAGE' : 'TEXT');
  params.set('text', text.slice(0, 500));
  if (imageUrl) params.set('image_url', imageUrl);
  params.set('access_token', token);

  const res = await fetch(`${BASE}/${userId}/threads?${params.toString()}`, { method: 'POST' });
  if (!res.ok) throw new Error(`container ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json.id;
}

async function publishContainer({ userId, token, containerId }) {
  const params = new URLSearchParams();
  params.set('creation_id', containerId);
  params.set('access_token', token);

  const res = await fetch(`${BASE}/${userId}/threads_publish?${params.toString()}`, { method: 'POST' });
  if (!res.ok) throw new Error(`publish ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json.id;
}

/**
 * @returns { ok, postId?, reason? }
 */
async function postThread({ text, imageUrl }) {
  const userId = process.env.THREADS_USER_ID;
  const token = process.env.THREADS_ACCESS_TOKEN;
  if (!userId || !token) return { ok: false, reason: 'no-credentials' };
  if (!text) return { ok: false, reason: 'no-text' };

  try {
    const containerId = await createContainer({ userId, token, text, imageUrl });
    // Meta 문서: 컨테이너 생성 후 30초 정도 대기 권장
    await new Promise(r => setTimeout(r, 3000));
    const postId = await publishContainer({ userId, token, containerId });
    return { ok: true, postId };
  } catch (err) {
    return { ok: false, reason: err.message };
  }
}

module.exports = { postThread };
