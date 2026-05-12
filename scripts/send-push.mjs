#!/usr/bin/env node
/**
 * send-push — Cloudflare KV 구독자에게 Web Push 일괄 발송 (Node + web-push lib).
 *
 *   호출 시점: daily-pulse cron 의 마지막 step. 또는 수동 trigger.
 *   payload 결정: data/signals/breakout-latest.json + 분배락일 D-1 + 변동성 폭증 자동 감지.
 *
 *   필요 env:
 *     - VAPID_PRIVATE_KEY (base64url private d)
 *     - NEXT_PUBLIC_VAPID_PUBLIC_KEY (base64url public)
 *     - VAPID_SUBJECT (mailto:...)
 *     - CLOUDFLARE_API_TOKEN (KV list/read 권한)
 *     - CLOUDFLARE_ACCOUNT_ID
 *     - CLOUDFLARE_KV_NAMESPACE_ID (kis-token-cache 와 동일)
 *
 *   미설정 시 silent skip — cron 영향 X.
 *
 *   의존성: web-push npm 패키지 (devDependency, cron runner 환경에만 설치).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const VAPID_PUB = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIV = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:noreply@iknowhowinfo.com';
const CF_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CF_ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID;
const CF_KV_ID = process.env.CLOUDFLARE_KV_NAMESPACE_ID;

function configured() {
  return VAPID_PUB && VAPID_PRIV && CF_TOKEN && CF_ACCOUNT && CF_KV_ID;
}

async function listSubscriptionKeys() {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/storage/kv/namespaces/${CF_KV_ID}/keys?prefix=push:sub:&limit=1000`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${CF_TOKEN}` },
  });
  if (!res.ok) throw new Error(`CF KV list 실패: ${res.status}`);
  const json = await res.json();
  return (json.result || []).map(k => k.name);
}

async function getSubscriptionValue(key) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/storage/kv/namespaces/${CF_KV_ID}/values/${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${CF_TOKEN}` },
  });
  if (!res.ok) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function deleteSubscription(key) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/storage/kv/namespaces/${CF_KV_ID}/values/${encodeURIComponent(key)}`;
  await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${CF_TOKEN}` },
  });
}

// payload 자동 결정 — 시그널·분배락·변동성 조건 감지
function buildPayloads() {
  const out = [];

  // 1. 시그널 — data/signals/breakout-latest.json 의 LONG/SHORT_READY
  try {
    const file = path.join(ROOT, 'data', 'signals', 'breakout-latest.json');
    if (fs.existsSync(file)) {
      const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
      const ready = (data.signals || []).filter(s => ['LONG_READY', 'SHORT_READY', 'BOTH_READY'].includes(s.status));
      if (ready.length > 0) {
        const top = ready[0];
        out.push({
          category: 'signal',
          title: '📊 시그널 도달',
          body: `${top.name || top.code}: ${top.summary || top.status}`,
          url: `/strategy/kospi200-breakout`,
          tag: `signal-${data.baseDate}`,
        });
      }
    }
  } catch { /* silent */ }

  // 2. 분배락 D-1 — data/income/dividend-registry.json
  try {
    const file = path.join(ROOT, 'data', 'income', 'dividend-registry.json');
    if (fs.existsSync(file)) {
      const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
      const today = new Date();
      const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const d1 = (data.etfs || []).filter(e => {
        if (!e.nextExDividendDate) return false;
        const dt = new Date(e.nextExDividendDate);
        const days = Math.floor((dt - t0) / 86400000);
        return days === 1;
      });
      if (d1.length > 0) {
        out.push({
          category: 'dividend',
          title: '📅 내일 분배락',
          body: `${d1[0].name} 외 ${d1.length - 1}건 — 오늘 매수 시 분배 수령`,
          url: '/income',
          tag: `dividend-d1-${t0.toISOString().slice(0, 10)}`,
        });
      }
    }
  } catch { /* silent */ }

  // 3. 변동성 폭증 — data/today/latest.json 의 topGainers/topLosers 중 5% 초과
  try {
    const file = path.join(ROOT, 'data', 'today', 'latest.json');
    if (fs.existsSync(file)) {
      const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
      const all = [...(data.market?.topGainers || []), ...(data.market?.topLosers || [])];
      const surge = all.find(e => Math.abs(e.changeRate || 0) >= 5);
      if (surge) {
        out.push({
          category: 'volatility',
          title: '🔥 변동성 폭증',
          body: `${surge.name}: ${surge.changeRate > 0 ? '+' : ''}${surge.changeRate.toFixed(2)}%`,
          url: `/etf/${(surge.code || '').toLowerCase()}`,
          tag: `vol-${data.date}-${surge.code}`,
        });
      }
    }
  } catch { /* silent */ }

  return out;
}

async function main() {
  if (!configured()) {
    console.log('[send-push] VAPID/CF 환경변수 미설정 — skip');
    return;
  }

  const payloads = buildPayloads();
  if (payloads.length === 0) {
    console.log('[send-push] 발송할 payload 없음 (시그널·분배·변동성 미감지)');
    return;
  }

  // web-push lib 동적 import — cron runner 만 설치
  let webpush;
  try {
    webpush = (await import('web-push')).default;
  } catch {
    console.log('[send-push] web-push lib 미설치 — npm i web-push 필요 — skip');
    return;
  }
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUB, VAPID_PRIV);

  const keys = await listSubscriptionKeys();
  console.log(`[send-push] 구독자 ${keys.length} 명 / payload ${payloads.length} 종`);

  let totalSent = 0, totalFailed = 0, totalSkipped = 0;
  for (const payload of payloads) {
    for (const key of keys) {
      const sub = await getSubscriptionValue(key);
      if (!sub || !sub.categories?.includes(payload.category)) {
        totalSkipped++;
        continue;
      }
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          JSON.stringify(payload),
          { TTL: 86400 },
        );
        totalSent++;
      } catch (err) {
        totalFailed++;
        // 410 Gone / 404 → 구독 만료, KV 삭제
        if (err.statusCode === 410 || err.statusCode === 404) {
          await deleteSubscription(key);
          console.log(`   [cleanup] 만료 구독 삭제: ${key}`);
        }
      }
    }
  }

  console.log(`[send-push] sent ${totalSent} · failed ${totalFailed} · skipped ${totalSkipped}`);
}

main().catch(err => {
  console.error('[send-push] 예외:', err);
  process.exit(0); // cron 영향 회피
});
