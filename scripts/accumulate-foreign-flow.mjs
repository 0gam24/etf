#!/usr/bin/env node
/**
 * accumulate-foreign-flow — 추적 종목 외국인·기관 매매동향 누적.
 *
 *   입력: 한투 OpenAPI inquire-investor (FHKST01010900)
 *   출력: data/foreign-flow/{code}.json — 최근 60일 외국인·기관·개인 순매수
 *   사용: 5일/20일 누적 cross-over 감지 → /strategy/foreign-flow 페이지
 *
 *   ⚠️ 일부 endpoint 권한 별도. 권한 없으면 빈 응답 → 누적 0, silent skip.
 *   매일 cron 평일 16:30 KST 실행.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const FLOW_DIR = path.join(ROOT, 'data', 'foreign-flow');
const HISTORY_DAYS = 60;

const TARGETS = ['069500', '0080G0', '0080Y0', '0005D0', '449450', '122630'];

const KIS_BASE = process.env.KIS_MODE === 'sandbox'
  ? 'https://openapivts.koreainvestment.com:29443'
  : 'https://openapi.koreainvestment.com:9443';

async function getToken() {
  if (!process.env.KIS_APP_KEY || !process.env.KIS_APP_SECRET) return null;
  try {
    const res = await fetch(`${KIS_BASE}/oauth2/tokenP`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        appkey: process.env.KIS_APP_KEY,
        appsecret: process.env.KIS_APP_SECRET,
      }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.access_token;
  } catch { return null; }
}

async function fetchFlow(code, token) {
  try {
    const url = new URL(`${KIS_BASE}/uapi/domestic-stock/v1/quotations/inquire-investor`);
    url.searchParams.set('FID_COND_MRKT_DIV_CODE', 'J');
    url.searchParams.set('FID_INPUT_ISCD', code);
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`,
        appkey: process.env.KIS_APP_KEY,
        appsecret: process.env.KIS_APP_SECRET,
        tr_id: 'FHKST01010900',
      },
    });
    if (!res.ok) return [];
    const json = await res.json();
    if (json.rt_cd !== '0' || !Array.isArray(json.output)) return [];
    return json.output.slice(0, 30).map(o => ({
      date: o.stck_bsop_date ? `${o.stck_bsop_date.slice(0, 4)}-${o.stck_bsop_date.slice(4, 6)}-${o.stck_bsop_date.slice(6, 8)}` : '',
      foreignNet: Number(o.frgn_ntby_qty) || 0,
      institutionNet: Number(o.orgn_ntby_qty) || 0,
      individualNet: Number(o.prsn_ntby_qty) || 0,
    })).filter(t => t.date);
  } catch { return []; }
}

function loadHistory(code) {
  const file = path.join(FLOW_DIR, `${code}.json`);
  if (!fs.existsSync(file)) return { code, history: [] };
  try { return JSON.parse(fs.readFileSync(file, 'utf-8')); } catch { return { code, history: [] }; }
}

function saveHistory(code, history) {
  if (!fs.existsSync(FLOW_DIR)) fs.mkdirSync(FLOW_DIR, { recursive: true });
  const trimmed = history.slice(-HISTORY_DAYS);
  fs.writeFileSync(path.join(FLOW_DIR, `${code}.json`), JSON.stringify({ code, updatedAt: new Date().toISOString(), history: trimmed }, null, 2));
}

async function main() {
  const token = await getToken();
  if (!token) {
    console.log('[foreign-flow] KIS 토큰 발급 실패 — skip');
    return;
  }
  let total = 0;
  for (const code of TARGETS) {
    const flows = await fetchFlow(code, token);
    if (flows.length === 0) continue;
    const hist = loadHistory(code);
    const seenDates = new Set(hist.history.map(h => h.date));
    for (const f of flows) {
      if (!seenDates.has(f.date)) hist.history.push(f);
    }
    hist.history.sort((a, b) => a.date.localeCompare(b.date));
    saveHistory(code, hist.history);
    total += flows.length;
    await new Promise(r => setTimeout(r, 250));
  }
  console.log(`[foreign-flow] ${TARGETS.length}종목 × 최대 30일 → ${total}건 갱신 (60일 보관)`);
}

main();
