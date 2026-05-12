/**
 * 🚨 /api/breaking/trigger — 장중 시그널·변동성 폭증 시 즉시 속보 발행 트리거.
 *
 *   호출 방식 (3가지):
 *     1. 사용자 메인페이지 → 거래량 급증·변동성 폭증 알림 박스가 자동 호출 (장중)
 *     2. 외부 cron 또는 webhook
 *     3. 운영자 수동 trigger (개발·테스트)
 *
 *   본 endpoint 는 **trigger 만 기록** (data/breaking-queue/{date}.json).
 *   실제 글 발행은 GitHub Actions workflow_dispatch 가 작업.
 *
 *   Throttle: 1시간 1건 (KV 락) — 발행 폭증 방지.
 *
 *   ⚠️ 매매 권유 X · YMYL 안전: 단순 데이터 정보 제공.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

interface KVNamespace {
  get(key: string, options?: { type?: 'json' | 'text' }): Promise<unknown>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

interface TriggerPayload {
  type: 'volume_surge' | 'volatility_spike' | 'signal_ready';
  code: string;
  name?: string;
  ratio?: number;
  changeRate?: number;
  signalStatus?: string;
  triggeredAt: number;
}

function getKv(): KVNamespace | null {
  try {
    const ctx = getCloudflareContext();
    const env = ctx?.env as { KIS_TOKEN_CACHE?: KVNamespace } | undefined;
    return env?.KIS_TOKEN_CACHE || null;
  } catch {
    return null;
  }
}

const THROTTLE_KEY = 'breaking:throttle';
const THROTTLE_TTL = 60 * 60; // 1시간 (초)
const MAX_DAILY = 3;          // 일일 최대 3건
const DAILY_COUNTER_PREFIX = 'breaking:daily:'; // breaking:daily:YYYY-MM-DD

function todayKstYmd(): string {
  const kst = new Date(Date.now() + 9 * 3600 * 1000);
  return `${kst.getUTCFullYear()}-${String(kst.getUTCMonth() + 1).padStart(2, '0')}-${String(kst.getUTCDate()).padStart(2, '0')}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Partial<TriggerPayload>;
    if (!body.type || !body.code) {
      return NextResponse.json({ ok: false, error: 'invalid payload' }, { status: 400 });
    }

    const kv = getKv();
    if (!kv) {
      return NextResponse.json({ ok: false, error: 'KV unavailable' }, { status: 503 });
    }

    // Throttle 검사
    const throttle = await kv.get(THROTTLE_KEY);
    if (throttle) {
      return NextResponse.json({ ok: false, throttled: true, message: '1시간 내 이미 trigger 발생 — skip' });
    }

    // 일일 한도
    const dailyKey = `${DAILY_COUNTER_PREFIX}${todayKstYmd()}`;
    const dailyCount = Number((await kv.get(dailyKey)) || 0);
    if (dailyCount >= MAX_DAILY) {
      return NextResponse.json({ ok: false, dailyLimit: true, message: `오늘 ${MAX_DAILY}건 발행 완료 — 더 이상 X` });
    }

    // Queue 에 기록 — GitHub Actions cron 이 향후 read 해서 글 발행
    const payload: TriggerPayload = {
      type: body.type as TriggerPayload['type'],
      code: body.code,
      name: body.name,
      ratio: body.ratio,
      changeRate: body.changeRate,
      signalStatus: body.signalStatus,
      triggeredAt: Date.now(),
    };
    const queueKey = `breaking:queue:${Date.now()}:${body.code}`;
    await kv.put(queueKey, JSON.stringify(payload), { expirationTtl: 7 * 86400 }); // 7일 후 만료

    // Throttle lock + 일일 카운터 증가
    await kv.put(THROTTLE_KEY, '1', { expirationTtl: THROTTLE_TTL });
    await kv.put(dailyKey, String(dailyCount + 1), { expirationTtl: 2 * 86400 });

    return NextResponse.json({
      ok: true,
      queued: queueKey,
      dailyCount: dailyCount + 1,
      message: 'breaking 발행 큐에 등록됨. GitHub Actions cron 이 처리.',
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'POST { type, code, name?, ratio?, changeRate? }' });
}
