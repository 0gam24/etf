#!/usr/bin/env node
/**
 * generate-breakout-signal — 매일 KOSPI200 / KODEX 200 변동성 breakout 시그널 생성.
 *
 *   입력: data/raw/etf_prices_*.json (DataMiner 가 생성한 일별 시세) + 종목 일봉 시계열
 *   처리: src/lib/strategies/breakout.ts 의 computeBreakoutSignal 사용
 *   출력: data/signals/breakout-{YYYYMMDD}.json
 *
 *   cron: daily-pulse.yml 의 DataMiner 다음 step 으로 실행.
 *
 *   ⚠️ 본 시그널은 정보 제공 only — 매매 권유 X. YMYL 안전선.
 *      자동매매 미연동 (별도 프로젝트).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const SIGNAL_DIR = path.join(ROOT, 'data', 'signals');
const HISTORY_DIR = path.join(ROOT, 'data', 'ohlc');
const RAW_DIR = path.join(ROOT, 'data', 'raw');

// 추적 대상 — 코스피200 노출 ETF
const TARGETS = [
  { code: '069500', name: 'KODEX 200' },
  { code: '114800', name: 'KODEX 인버스' },
  { code: '122630', name: 'KODEX 레버리지' },
  { code: '251340', name: 'KODEX 인버스2X' },
];

// Unger 파라미터
const PARAMS = { N: 5, K_TRIGGER: 0.5, K_STOP: 0.6, K_TARGET: 1.0, VOL_MIN: 0.008 };

function readOhlcHistory(code) {
  // data/ohlc/{code}.json — 최근 60일 OHLC 시계열 (DataMiner 가 누적 갱신)
  // 본 cron 첫 실행 시 파일 없으면 빈 배열 반환 → 시그널 미생성
  const file = path.join(HISTORY_DIR, `${code}.json`);
  if (!fs.existsSync(file)) return [];
  try {
    const raw = JSON.parse(fs.readFileSync(file, 'utf-8'));
    return Array.isArray(raw.history) ? raw.history : [];
  } catch {
    return [];
  }
}

function getTodayBaseDate() {
  const lastFile = path.join(ROOT, 'data', '.last-pulse-base-date');
  if (fs.existsSync(lastFile)) {
    return fs.readFileSync(lastFile, 'utf-8').trim();
  }
  // 폴백 — KST 오늘
  const kst = new Date(Date.now() + 9 * 3600 * 1000);
  return `${kst.getUTCFullYear()}${String(kst.getUTCMonth() + 1).padStart(2, '0')}${String(kst.getUTCDate()).padStart(2, '0')}`;
}

function computeATR(history, N) {
  if (history.length < N + 1) return 0;
  const trs = [];
  for (let i = history.length - N; i < history.length; i++) {
    const cur = history[i];
    const prev = history[i - 1];
    const tr = Math.max(cur.high - cur.low, Math.abs(cur.high - prev.close), Math.abs(cur.low - prev.close));
    trs.push(tr);
  }
  return trs.reduce((s, v) => s + v, 0) / trs.length;
}

function computeTrend(history, days) {
  if (history.length < days) return 'flat';
  const recent = history.slice(-days);
  const sma = recent.reduce((s, h) => s + h.close, 0) / recent.length;
  const last = recent[recent.length - 1].close;
  const diff = (last - sma) / sma;
  if (diff > 0.01) return 'up';
  if (diff < -0.01) return 'down';
  return 'flat';
}

function signalFor(code, name, history) {
  if (history.length < 21) {
    return { code, name, status: 'INSUFFICIENT_HISTORY', historyDays: history.length };
  }
  const today = history[history.length - 1];
  const past = history.slice(0, -1);
  const atr5 = computeATR(past, PARAMS.N);
  if (atr5 === 0 || today.open === 0) {
    return { code, name, status: 'INVALID_DATA', historyDays: history.length };
  }
  const volRatio = atr5 / today.open;
  const volPass = volRatio >= PARAMS.VOL_MIN;
  const longTrigger = today.open + PARAMS.K_TRIGGER * atr5;
  const shortTrigger = today.open - PARAMS.K_TRIGGER * atr5;
  const trend = computeTrend(past, 20);

  let status = 'WAIT';
  if (volPass) {
    const longAllowed = trend !== 'down';
    const shortAllowed = trend !== 'up';
    if (longAllowed && shortAllowed) status = 'BOTH_READY';
    else if (longAllowed) status = 'LONG_READY';
    else if (shortAllowed) status = 'SHORT_READY';
  }

  const trendKo = trend === 'up' ? '상승' : trend === 'down' ? '하락' : '횡보';
  const summary = !volPass
    ? `변동성 부족 (${(volRatio * 100).toFixed(2)}%) — WAIT`
    : status === 'BOTH_READY'
      ? `${trendKo} 추세 · 양방향 진입 가능`
      : status === 'LONG_READY'
        ? `${trendKo} 추세 · 상방 돌파 매수 진입 가능`
        : status === 'SHORT_READY'
          ? `${trendKo} 추세 · 하방 돌파 매도 진입 가능`
          : '대기';

  return {
    code,
    name,
    date: today.date,
    params: PARAMS,
    atr5: Math.round(atr5 * 100) / 100,
    volRatio: Math.round(volRatio * 10000) / 10000,
    open: today.open,
    longTrigger: Math.round(longTrigger),
    shortTrigger: Math.round(shortTrigger),
    longStop: Math.round(longTrigger - PARAMS.K_STOP * atr5),
    longTarget: Math.round(longTrigger + PARAMS.K_TARGET * atr5),
    shortStop: Math.round(shortTrigger + PARAMS.K_STOP * atr5),
    shortTarget: Math.round(shortTrigger - PARAMS.K_TARGET * atr5),
    trend,
    volPass,
    status,
    summary,
  };
}

function main() {
  if (!fs.existsSync(SIGNAL_DIR)) fs.mkdirSync(SIGNAL_DIR, { recursive: true });
  const baseDate = getTodayBaseDate();

  const signals = TARGETS.map(({ code, name }) => {
    const history = readOhlcHistory(code);
    return signalFor(code, name, history);
  });

  const output = {
    generatedAt: new Date().toISOString(),
    baseDate,
    strategy: 'Unger Volatility Breakout (Andrea Unger Method)',
    params: PARAMS,
    disclaimer: '정보 제공 목적 · 매매 권유 아님 · 결과 책임은 투자자 본인',
    signals,
  };

  const outFile = path.join(SIGNAL_DIR, `breakout-${baseDate}.json`);
  fs.writeFileSync(outFile, JSON.stringify(output, null, 2), 'utf-8');

  // 최신 시그널 별칭 (페이지 SSR 용)
  const latestFile = path.join(SIGNAL_DIR, 'breakout-latest.json');
  fs.writeFileSync(latestFile, JSON.stringify(output, null, 2), 'utf-8');

  console.log(`[breakout-signal] ${baseDate} → ${TARGETS.length}개 시그널 생성`);
  signals.forEach(s => console.log(`   ${s.code} ${s.name}: ${s.status || 'N/A'} — ${s.summary || ''}`));
}

main();
