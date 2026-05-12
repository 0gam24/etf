/**
 * 📣 /api/push/subscribe — Web Push 구독 등록 endpoint.
 *
 *   POST { endpoint, keys: { p256dh, auth }, categories: string[] }
 *   → KV 'push:sub:{hash}' 에 저장 (개인 ID 없음 · endpoint URL 만)
 *
 *   ⚠️ 보안: VAPID 키는 env 에만 보관. 구독자 식별은 endpoint URL hash (브라우저 차원 익명).
 */
import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

interface KVNamespace {
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
}

interface PushSubscriptionPayload {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  categories?: string[];     // ['dividend', 'signal', 'volatility']
  unsubscribe?: boolean;     // true 면 삭제
}

async function hashEndpoint(endpoint: string): Promise<string> {
  // 표준 SHA-256 → 8자 prefix (16자 hex)
  const enc = new TextEncoder().encode(endpoint);
  const hashBuf = await crypto.subtle.digest('SHA-256', enc);
  const hash = Array.from(new Uint8Array(hashBuf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return hash.slice(0, 16);
}

function getKv(): KVNamespace | null {
  try {
    const ctx = getCloudflareContext();
    const env = ctx?.env as { KIS_TOKEN_CACHE?: KVNamespace } | undefined;
    return env?.KIS_TOKEN_CACHE || null; // 재사용 (단일 namespace)
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as PushSubscriptionPayload;
    if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
      return NextResponse.json({ ok: false, error: 'invalid subscription' }, { status: 400 });
    }

    const kv = getKv();
    if (!kv) {
      return NextResponse.json({ ok: false, error: 'KV not available' }, { status: 503 });
    }

    const key = `push:sub:${await hashEndpoint(body.endpoint)}`;

    if (body.unsubscribe) {
      await kv.delete(key);
      return NextResponse.json({ ok: true, action: 'unsubscribed' });
    }

    const record = {
      endpoint: body.endpoint,
      keys: body.keys,
      categories: Array.isArray(body.categories) ? body.categories : ['dividend', 'signal', 'volatility'],
      createdAt: Date.now(),
    };

    // 90일 만료 — 비활성 구독 자동 정리
    await kv.put(key, JSON.stringify(record), { expirationTtl: 90 * 86400 });

    return NextResponse.json({ ok: true, action: 'subscribed', categories: record.categories });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
