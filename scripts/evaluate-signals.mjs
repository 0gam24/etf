#!/usr/bin/env node
/**
 * evaluate-signals — 어제 발행한 breakout 시그널을 오늘 OHLC 로 검증.
 *
 *   매일 cron 이 시그널 생성 다음 step 으로 실행.
 *   어제 data/signals/breakout-{YYYYMMDD}.json 의 시그널 → 오늘 OHLC 와 비교 →
 *   trigger 도달 여부·승패·손익 계산 → data/signals/outcomes-{YYYYMMDD}.json 저장.
 *
 *   누적 트랙 레코드: data/signals/track-record.json (모든 outcome aggregate)
 *
 *   ⚠️ Paper trading — 실 매매 안 함. transparent 백테스트 결과 공개용.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const SIGNAL_DIR = path.join(ROOT, 'data', 'signals');
const OHLC_DIR = path.join(ROOT, 'data', 'ohlc');
const TRACK_FILE = path.join(SIGNAL_DIR, 'track-record.json');

function todayYmd() {
  const kst = new Date(Date.now() + 9 * 3600 * 1000);
  return `${kst.getUTCFullYear()}${String(kst.getUTCMonth() + 1).padStart(2, '0')}${String(kst.getUTCDate()).padStart(2, '0')}`;
}

function loadJson(file) {
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch {
    return null;
  }
}

function findPriorSignalFile() {
  if (!fs.existsSync(SIGNAL_DIR)) return null;
  const files = fs.readdirSync(SIGNAL_DIR)
    .filter(f => /^breakout-\d{8}\.json$/.test(f))
    .sort()
    .reverse();
  // 첫 번째 = 오늘 (방금 생성), 두 번째 = 어제 (평가 대상)
  if (files.length < 2) return null;
  return path.join(SIGNAL_DIR, files[1]);
}

function evalSignal(signal, nextOhlc) {
  if (!signal || !nextOhlc) return null;
  if (!['LONG_READY', 'SHORT_READY', 'BOTH_READY'].includes(signal.status)) {
    return { code: signal.code, date: signal.date, status: signal.status, triggered: false, summary: '진입 신호 없음 (대기)' };
  }

  const longAllowed = signal.status === 'LONG_READY' || signal.status === 'BOTH_READY';
  const shortAllowed = signal.status === 'SHORT_READY' || signal.status === 'BOTH_READY';

  let longResult = null;
  if (longAllowed && nextOhlc.high >= signal.longTrigger) {
    if (nextOhlc.high >= signal.longTarget) longResult = { entry: signal.longTrigger, exit: signal.longTarget, pnl: signal.longTarget - signal.longTrigger, result: 'win' };
    else if (nextOhlc.low <= signal.longStop) longResult = { entry: signal.longTrigger, exit: signal.longStop, pnl: signal.longStop - signal.longTrigger, result: 'loss' };
    else longResult = { entry: signal.longTrigger, exit: nextOhlc.close, pnl: nextOhlc.close - signal.longTrigger, result: 'eod' };
  }
  let shortResult = null;
  if (shortAllowed && nextOhlc.low <= signal.shortTrigger) {
    if (nextOhlc.low <= signal.shortTarget) shortResult = { entry: signal.shortTrigger, exit: signal.shortTarget, pnl: signal.shortTrigger - signal.shortTarget, result: 'win' };
    else if (nextOhlc.high >= signal.shortStop) shortResult = { entry: signal.shortTrigger, exit: signal.shortStop, pnl: signal.shortTrigger - signal.shortStop, result: 'loss' };
    else shortResult = { entry: signal.shortTrigger, exit: nextOhlc.close, pnl: signal.shortTrigger - nextOhlc.close, result: 'eod' };
  }

  const triggered = !!(longResult || shortResult);
  return {
    code: signal.code,
    date: signal.date,
    status: signal.status,
    triggered,
    nextOhlc,
    long: longResult,
    short: shortResult,
    summary: !triggered ? '트리거 미도달' : `${longResult ? `Long ${longResult.result}` : ''}${longResult && shortResult ? ' · ' : ''}${shortResult ? `Short ${shortResult.result}` : ''}`,
  };
}

function appendTrackRecord(outcomes) {
  let record = { entries: [], updatedAt: '' };
  if (fs.existsSync(TRACK_FILE)) {
    try {
      record = JSON.parse(fs.readFileSync(TRACK_FILE, 'utf-8'));
      if (!Array.isArray(record.entries)) record.entries = [];
    } catch { /* fresh */ }
  }
  // 중복 방지 (같은 code+date 키)
  const seen = new Set(record.entries.map(e => `${e.code}:${e.date}`));
  for (const o of outcomes) {
    if (!o.triggered) continue;
    const key = `${o.code}:${o.date}`;
    if (seen.has(key)) continue;
    record.entries.push(o);
    seen.add(key);
  }
  record.updatedAt = new Date().toISOString();
  // 최근 365개만 유지
  record.entries = record.entries.slice(-365);
  fs.writeFileSync(TRACK_FILE, JSON.stringify(record, null, 2), 'utf-8');
}

function main() {
  const priorFile = findPriorSignalFile();
  if (!priorFile) {
    console.log('[evaluate-signals] 평가할 이전 시그널 없음 — skip');
    return;
  }
  const prior = loadJson(priorFile);
  if (!prior || !Array.isArray(prior.signals)) {
    console.log('[evaluate-signals] 이전 시그널 파일 invalid — skip');
    return;
  }

  const outcomes = [];
  for (const sig of prior.signals) {
    if (!sig.code) continue;
    const ohlcFile = path.join(OHLC_DIR, `${sig.code}.json`);
    if (!fs.existsSync(ohlcFile)) continue;
    const ohlc = loadJson(ohlcFile);
    const history = ohlc?.history || [];
    if (history.length === 0) continue;
    const today = history[history.length - 1];
    if (!today.high || !today.low) continue;
    const outcome = evalSignal(sig, today);
    if (outcome) outcomes.push(outcome);
  }

  if (outcomes.length === 0) {
    console.log('[evaluate-signals] 평가 가능 시그널 없음');
    return;
  }

  const outFile = path.join(SIGNAL_DIR, `outcomes-${todayYmd()}.json`);
  fs.writeFileSync(outFile, JSON.stringify({ generatedAt: new Date().toISOString(), outcomes }, null, 2), 'utf-8');

  appendTrackRecord(outcomes);

  console.log(`[evaluate-signals] ${outcomes.length}건 평가 → ${outFile}`);
  outcomes.forEach(o => console.log(`   ${o.code} ${o.date}: ${o.summary}`));
}

main();
