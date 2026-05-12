#!/usr/bin/env node
/**
 * accumulate-ohlc — 매일 cron 이 KRX 일별 시세에서 추적 대상 종목 OHLC 누적.
 *
 *   입력: data/raw/etf_prices_*.json (DataMiner 결과)
 *   출력: data/ohlc/{code}.json — 최근 60일 OHLC 시계열 (FIFO 잘림)
 *   사용: scripts/generate-breakout-signal.mjs 가 이 데이터로 시그널 계산
 *
 *   ⚠️ 첫 cron 실행 시 1일치만 추가. 시그널은 ~21일 후 (20일 SMA + 5일 ATR) 부터 가능.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const RAW_DIR = path.join(ROOT, 'data', 'raw');
const OHLC_DIR = path.join(ROOT, 'data', 'ohlc');
const HISTORY_DAYS = 60;

// 추적 대상 — Unger breakout 시그널용 + 향후 추가 종목
const TRACKED_CODES = ['069500', '114800', '122630', '251340', '0080G0', '0080Y0', '0005D0', '0072R0', '449450'];

function getLatestPriceFile() {
  if (!fs.existsSync(RAW_DIR)) return null;
  const files = fs.readdirSync(RAW_DIR)
    .filter(f => /^etf_prices_\d{8}\.json$/.test(f))
    .sort()
    .reverse();
  return files[0] ? path.join(RAW_DIR, files[0]) : null;
}

function loadHistory(code) {
  const file = path.join(OHLC_DIR, `${code}.json`);
  if (!fs.existsSync(file)) return { code, history: [] };
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch {
    return { code, history: [] };
  }
}

function saveHistory(code, history) {
  if (!fs.existsSync(OHLC_DIR)) fs.mkdirSync(OHLC_DIR, { recursive: true });
  const trimmed = history.slice(-HISTORY_DAYS);
  fs.writeFileSync(path.join(OHLC_DIR, `${code}.json`), JSON.stringify({ code, updatedAt: new Date().toISOString(), history: trimmed }, null, 2), 'utf-8');
}

function main() {
  const priceFile = getLatestPriceFile();
  if (!priceFile) {
    console.log('[accumulate-ohlc] data/raw/etf_prices_*.json 없음 — skip');
    return;
  }
  const raw = JSON.parse(fs.readFileSync(priceFile, 'utf-8'));
  const data = raw.data || raw;
  const etfList = data.etfList || [];
  const baseDate = data.baseDate || data.fetchedAt?.slice(0, 10).replace(/-/g, '');
  if (!baseDate) {
    console.log('[accumulate-ohlc] baseDate 없음 — skip');
    return;
  }

  let added = 0;
  for (const code of TRACKED_CODES) {
    const etf = etfList.find(e => (e.code || '').toUpperCase() === code.toUpperCase());
    if (!etf || !etf.price || !etf.highPrice || !etf.lowPrice || !etf.openPrice) continue;

    const hist = loadHistory(code);
    // 중복 baseDate 방지
    if (hist.history.find(h => h.date === baseDate)) continue;

    hist.history.push({
      date: baseDate,
      open: etf.openPrice,
      high: etf.highPrice,
      low: etf.lowPrice,
      close: etf.price,
      volume: etf.volume || 0,
    });
    saveHistory(code, hist.history);
    added++;
  }

  console.log(`[accumulate-ohlc] ${baseDate} → ${added}/${TRACKED_CODES.length} 종목 OHLC 추가 (${HISTORY_DAYS}일 보관)`);
}

main();
