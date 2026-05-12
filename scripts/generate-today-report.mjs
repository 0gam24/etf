#!/usr/bin/env node
/**
 * generate-today-report — 매일 영업일 종합 리포트 자동 발행.
 *
 *   출력: data/today/{YYYY-MM-DD}.json + data/today/latest.json
 *   페이지: /today (최신) + /today/{YYYY-MM-DD} (영구 보관)
 *
 *   내용:
 *     - 오늘 KRX baseDate
 *     - 거래량 TOP 5 + 상승·하락 TOP 5
 *     - 시그널 도달 ETF (data/signals/breakout-latest.json)
 *     - 어제 시그널 결과 (data/signals/outcomes-{date}.json)
 *     - 분배락일 D-3 이내 ETF (data/income/dividend-registry.json)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const RAW_DIR = path.join(ROOT, 'data', 'raw');
const SIGNAL_DIR = path.join(ROOT, 'data', 'signals');
const INCOME_FILE = path.join(ROOT, 'data', 'income', 'dividend-registry.json');
const TODAY_DIR = path.join(ROOT, 'data', 'today');

function todayYmd() {
  const kst = new Date(Date.now() + 9 * 3600 * 1000);
  return `${kst.getUTCFullYear()}-${String(kst.getUTCMonth() + 1).padStart(2, '0')}-${String(kst.getUTCDate()).padStart(2, '0')}`;
}

function loadJson(file) {
  if (!fs.existsSync(file)) return null;
  try { return JSON.parse(fs.readFileSync(file, 'utf-8')); } catch { return null; }
}

function getLatestPrices() {
  if (!fs.existsSync(RAW_DIR)) return null;
  const files = fs.readdirSync(RAW_DIR)
    .filter(f => /^etf_prices_\d{8}\.json$/.test(f))
    .sort()
    .reverse();
  if (!files[0]) return null;
  const raw = loadJson(path.join(RAW_DIR, files[0]));
  return raw?.data || raw;
}

function findOutcomeFile() {
  if (!fs.existsSync(SIGNAL_DIR)) return null;
  const files = fs.readdirSync(SIGNAL_DIR)
    .filter(f => /^outcomes-\d{8}\.json$/.test(f))
    .sort()
    .reverse();
  return files[0] ? path.join(SIGNAL_DIR, files[0]) : null;
}

function main() {
  if (!fs.existsSync(TODAY_DIR)) fs.mkdirSync(TODAY_DIR, { recursive: true });

  const prices = getLatestPrices();
  const etfList = prices?.etfList || [];
  const baseDate = prices?.baseDate || '';

  // TOP 5 계산
  const byVolume = [...etfList].sort((a, b) => (b.volume || 0) - (a.volume || 0)).slice(0, 5);
  const byChange = [...etfList].sort((a, b) => (b.changeRate || 0) - (a.changeRate || 0));
  const topGainers = byChange.slice(0, 5);
  const topLosers = byChange.slice(-5).reverse();

  // 시그널
  const signalFile = path.join(SIGNAL_DIR, 'breakout-latest.json');
  const signals = loadJson(signalFile);

  // 어제 결과
  const outcomeFile = findOutcomeFile();
  const outcomes = outcomeFile ? loadJson(outcomeFile) : null;

  // 분배락일 D-3
  const registry = loadJson(INCOME_FILE);
  const today = new Date();
  const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const imminentDividends = (registry?.etfs || [])
    .map(e => {
      if (!e.nextExDividendDate) return null;
      const dt = new Date(e.nextExDividendDate);
      if (isNaN(dt.getTime())) return null;
      const daysLeft = Math.floor((dt.getTime() - t0.getTime()) / 86400000);
      if (daysLeft < 0 || daysLeft > 3) return null;
      return { code: e.code, name: e.name, daysLeft, date: e.nextExDividendDate, yield: e.yield, stabilityGrade: e.stabilityGrade };
    })
    .filter(x => x !== null)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const report = {
    date: todayYmd(),
    generatedAt: new Date().toISOString(),
    baseDate,
    market: {
      byVolume: byVolume.map(e => ({ code: e.code, name: e.name, price: e.price, changeRate: e.changeRate, volume: e.volume })),
      topGainers: topGainers.map(e => ({ code: e.code, name: e.name, price: e.price, changeRate: e.changeRate })),
      topLosers: topLosers.map(e => ({ code: e.code, name: e.name, price: e.price, changeRate: e.changeRate })),
    },
    signals: signals?.signals?.filter(s => ['LONG_READY', 'SHORT_READY', 'BOTH_READY'].includes(s.status)) || [],
    outcomes: outcomes?.outcomes || [],
    imminentDividends,
  };

  const dayFile = path.join(TODAY_DIR, `${report.date}.json`);
  const latestFile = path.join(TODAY_DIR, 'latest.json');
  fs.writeFileSync(dayFile, JSON.stringify(report, null, 2), 'utf-8');
  fs.writeFileSync(latestFile, JSON.stringify(report, null, 2), 'utf-8');

  console.log(`[today-report] ${report.date} → 발행 완료`);
  console.log(`   거래량 TOP ${byVolume.length} · 상승 ${topGainers.length} · 하락 ${topLosers.length}`);
  console.log(`   시그널 ready: ${report.signals.length} · 어제 outcomes: ${report.outcomes.length}`);
  console.log(`   분배락 D-3 임박: ${imminentDividends.length}`);
}

main();
