#!/usr/bin/env node
/**
 * scout-breaking-queue.mjs — Cloudflare KV 의 breaking:queue:* entries 를 read + log.
 *
 *   호출: GitHub Actions daily-pulse cron 의 신규 step (pipeline 직전).
 *   목적: 장중에 VolumeSurgeAlert / TrendingNow 가 누른 trigger 들을 운영자가 점검.
 *   향후: 실제 Gemini 호출 → content/breaking/*.mdx 발행 (후속 step).
 *
 *   환경 변수 (모두 미설정 silent skip):
 *     - CLOUDFLARE_API_TOKEN
 *     - CLOUDFLARE_ACCOUNT_ID
 *     - CLOUDFLARE_KV_NAMESPACE_ID  (KIS_TOKEN_CACHE namespace 와 동일 — prefix 로 분리 운영)
 *
 *   동작:
 *     1. namespace 의 prefix=breaking:queue: 모든 key 나열
 *     2. 각 value 를 JSON 으로 fetch
 *     3. console.log 출력 + GITHUB_STEP_SUMMARY append
 *     4. 24h 이상 지난 entry 는 delete (자연 TTL 7d 보다 빨리 정리)
 *
 *   ⚠️ 본 스크립트는 글 발행 X — log only.
 */

import { writeFileSync } from 'node:fs';

const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || '';
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '';
const KV_NAMESPACE_ID = process.env.CLOUDFLARE_KV_NAMESPACE_ID || '';
const SUMMARY_FILE = process.env.GITHUB_STEP_SUMMARY || '';

const PREFIX = 'breaking:queue:';
const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24h

function appendSummary(text) {
  if (!SUMMARY_FILE) return;
  try { writeFileSync(SUMMARY_FILE, text, { flag: 'a' }); } catch { /* silent */ }
}

async function main() {
  if (!API_TOKEN || !ACCOUNT_ID || !KV_NAMESPACE_ID) {
    console.log('[scout] CF 환경 변수 미설정 — skip');
    appendSummary('### Breaking Queue\n- 환경 변수 미설정 (skip)\n');
    return;
  }

  const base = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${KV_NAMESPACE_ID}`;
  const headers = { Authorization: `Bearer ${API_TOKEN}`, 'Content-Type': 'application/json' };

  // 1. List keys
  const listRes = await fetch(`${base}/keys?prefix=${encodeURIComponent(PREFIX)}&limit=1000`, { headers });
  if (!listRes.ok) {
    console.error('[scout] list 실패', listRes.status);
    appendSummary(`### Breaking Queue\n- KV list 실패 HTTP ${listRes.status}\n`);
    return;
  }
  const listJson = await listRes.json();
  const keys = (listJson.result || []).map(k => k.name);
  console.log(`[scout] queue keys: ${keys.length}`);

  if (keys.length === 0) {
    appendSummary('### Breaking Queue\n- 비어있음 (장중 trigger 0건)\n');
    return;
  }

  const items = [];
  let staleCount = 0;

  for (const key of keys) {
    const valRes = await fetch(`${base}/values/${encodeURIComponent(key)}`, { headers });
    if (!valRes.ok) continue;
    const text = await valRes.text();
    let payload;
    try { payload = JSON.parse(text); } catch { continue; }
    if (!payload || !payload.triggeredAt) continue;

    const ageMs = Date.now() - payload.triggeredAt;
    if (ageMs > STALE_THRESHOLD_MS) {
      // 24h 지난 entry 정리
      await fetch(`${base}/values/${encodeURIComponent(key)}`, { method: 'DELETE', headers });
      staleCount++;
      continue;
    }
    items.push({ key, payload, ageMs });
  }

  console.log(`[scout] active: ${items.length}, cleaned: ${staleCount}`);

  let summary = '### Breaking Queue\n';
  summary += `- 총 ${items.length}건 (24h 지난 ${staleCount}건 정리)\n`;
  if (items.length > 0) {
    summary += '\n| triggeredAt (KST) | type | code | name | ratio/changeRate |\n';
    summary += '|---|---|---|---|---|\n';
    for (const it of items) {
      const ts = new Date(it.payload.triggeredAt + 9 * 3600 * 1000).toISOString().replace('T', ' ').slice(0, 19);
      const detail = it.payload.type === 'volatility_spike'
        ? `±${(it.payload.changeRate ?? 0).toFixed(2)}%`
        : `${(it.payload.ratio ?? 0).toFixed(1)}×`;
      summary += `| ${ts} | ${it.payload.type} | ${it.payload.code} | ${it.payload.name || '-'} | ${detail} |\n`;
    }
  }
  summary += '\n_⚠️ 본 step 은 log only — 실제 글 발행은 후속 cron step 에서 진행._\n';
  appendSummary(summary);
}

main().catch(err => {
  console.error('[scout] 예외', err);
  appendSummary(`### Breaking Queue\n- 예외 발생: ${err.message}\n`);
});
