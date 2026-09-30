#!/usr/bin/env node
/**
 * ETF 일별 종가 스냅샷 저장 (data/raw/etf_prices_YYYYMMDD.json).
 *
 *   배경 (2026-09-30):
 *     /etf 종목 사전·홈·/flow 등은 빌드 시점에 data/raw/etf_prices_*.json 중 파일명이
 *     가장 큰 것(src/lib/data.ts getLatestJsonFile)을 읽어 prerender 한다. 이 파일은
 *     원래 로컬 데일리 수집 단계(agents/1_data_miner.js)만 만들었는데, 그 경로가 멈춘 뒤
 *     2026-08-12 파일(baseDate 20260810)에서 전 페이지 시세가 고정돼 있었다.
 *     반면 운영 중인 사이트의 /api/etf 는 서버 쪽 키로 data.go.kr 최신 종가를 이미
 *     돌려주므로, 그 응답을 기존 스냅샷 스키마 그대로 저장하면 키 없는 환경(클라우드
 *     루틴 컨테이너, .env.local 없음)에서도 스냅샷을 갱신할 수 있다.
 *
 *   스키마: agents/1_data_miner.js 의 parseETFResponse + enrichETFData 결과와 동일.
 *     { _meta: { createdBy, createdAt, fileName },
 *       data: { source, isRealData, fetchedAt, baseDate, etfCount, etfList,
 *               byVolume(거래량 상위 10), byGain(등락률 상위 5), byLoss(등락률 하위 5),
 *               sectorFlow(섹터별 count·평균 등락률·거래대금, 평균 등락률 내림차순) } }
 *     etfList 원소: code, name, price, change, changeRate, volume, tradeAmount, marketCap,
 *                   nav, highPrice, lowPrice, openPrice, date, sector
 *     nav 는 응답에 값이 있을 때만 싣는다. 응답에 없으면 키를 비워 둔다
 *     (직전 스냅샷의 옛 nav 나 종가로 채우지 않는다).
 *
 *   안전장치 (파일을 쓰지 않고 이유 출력 후 exit 0):
 *     - isRealData 가 true 가 아님
 *     - 종목 수 1,000 미만
 *     - baseDate 가 직전 스냅샷(로더가 고르는 최신 파일)의 baseDate 이하
 *     - 이미 오늘보다 뒤 날짜 파일명이 있어 새 파일이 최신으로 선택되지 않는 경우
 *   네트워크·응답 형식 오류는 파일을 쓰지 않고 exit 1.
 *
 *   실행:
 *     npm run snapshot:etf            # 저장
 *     npm run snapshot:etf -- --dry   # 저장하지 않고 요약만
 *   환경변수: SITE_URL (기본 https://iknowhowinfo.com). 키 불필요.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), '..');
const RAW_DIR = path.join(ROOT, 'data', 'raw');
const FILE_RE = /^etf_prices_(\d{8})\.json$/;

const DRY = process.argv.includes('--dry');
const SITE_URL = (process.env.SITE_URL || 'https://iknowhowinfo.com').replace(/\/+$/, '');
const MIN_ETF_COUNT = 1000;
const FETCH_TIMEOUT_MS = 60_000;
const FETCH_ATTEMPTS = 3;

// ───── 섹터 분류 규칙: agents/1_data_miner.js SECTOR_RULES 와 동일 ─────
//   (그 파일은 classifySector 를 export 하지 않고, require 하면 OCR 모듈 등까지 불러오므로 규칙을 옮겨 쓴다.
//    기존 스냅샷의 sector 값과 같게 나와야 하므로 src/lib/data.ts 의 확장 규칙이 아니라 이 규칙을 쓴다.)
const SECTOR_RULES = [
  { sector: '방산', patterns: [/방산/, /방위/, /KODEX\s*방산/i] },
  { sector: '조선', patterns: [/조선/, /SOL\s*조선/i] },
  { sector: 'AI·데이터', patterns: [/AI/i, /데이터센터/, /팔란티어/i, /PLTR/i] },
  { sector: '반도체', patterns: [/반도체/, /SK하이닉스/, /삼성전자/, /SOXX/i, /SMH/i] },
  { sector: '커버드콜·월배당', patterns: [/커버드콜/, /OTM/i, /월배당/, /SCHD/i, /배당다우존스/] },
  { sector: '해외주식', patterns: [/S&P500/i, /나스닥/i, /미국/, /SPY/i, /QQQ/i] },
  { sector: '채권', patterns: [/채권/, /국채/, /회사채/, /TLT/i] },
  { sector: '원자재·금', patterns: [/금/, /원유/, /은/, /GLD/i] },
  { sector: '2차전지', patterns: [/2차전지/, /배터리/, /LG에너지/, /LIT/i] },
  { sector: '국내주식', patterns: [/KODEX\s*200/, /TIGER\s*200/, /코스피/, /KOSPI/i] },
];

function classifySector(name) {
  for (const rule of SECTOR_RULES) {
    if (rule.patterns.some(p => p.test(name))) return rule.sector;
  }
  return '기타';
}

// ───── 유틸 ─────
function todayKst() {
  const d = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${y}${m}${dd}`;
}

function skip(reason) {
  console.log(`⏭️  스냅샷 저장 건너뜀: ${reason}`);
  process.exit(0);
}

function fail(reason) {
  console.error(`❌ 스냅샷 실패: ${reason}`);
  process.exit(1);
}

/** 로더(getLatestJsonFile)와 같은 규칙: etf_prices_*.json 을 이름순 정렬, 마지막이 최신. */
function findLatestSnapshot() {
  if (!fs.existsSync(RAW_DIR)) return null;
  const files = fs.readdirSync(RAW_DIR)
    .filter(f => f.startsWith('etf_prices_') && f.endsWith('.json'))
    .sort();
  if (files.length === 0) return null;
  const fileName = files[files.length - 1];
  let baseDate = '';
  try {
    const parsed = JSON.parse(fs.readFileSync(path.join(RAW_DIR, fileName), 'utf-8'));
    baseDate = String(parsed?.data?.baseDate || '');
  } catch {
    baseDate = '';
  }
  return { fileName, baseDate };
}

async function fetchApi() {
  const url = `${SITE_URL}/api/etf`;
  let lastErr = null;
  for (let attempt = 1; attempt <= FETCH_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { accept: 'application/json', 'cache-control': 'no-cache' },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      lastErr = err;
      console.warn(`   ⚠️ ${url} 요청 실패 (시도 ${attempt}/${FETCH_ATTEMPTS}): ${err.message}`);
      if (attempt < FETCH_ATTEMPTS) await new Promise(r => setTimeout(r, 3000 * attempt));
    }
  }
  throw lastErr || new Error('알 수 없는 오류');
}

// agents/1_data_miner.js parseETFResponse 와 같은 필드 순서·숫자 변환.
function toSnapshotItem(e, baseDate) {
  const item = {
    code: String(e.code || ''),
    name: String(e.name || ''),
    price: Number(e.price) || 0,
    change: Number(e.change) || 0,
    changeRate: Number(e.changeRate) || 0,
    volume: Number(e.volume) || 0,
    tradeAmount: Number(e.tradeAmount) || 0,
    marketCap: Number(e.marketCap) || 0,
  };
  const nav = Number(e.nav);
  if (e.nav !== undefined && e.nav !== null && Number.isFinite(nav) && nav > 0) item.nav = nav;
  item.highPrice = Number(e.highPrice) || 0;
  item.lowPrice = Number(e.lowPrice) || 0;
  item.openPrice = Number(e.openPrice) || 0;
  item.date = String(e.date || baseDate);
  item.sector = classifySector(item.name);
  return item;
}

// agents/1_data_miner.js enrichETFData 와 같은 규칙.
function enrich(etfList) {
  const byVolume = [...etfList].sort((a, b) => b.volume - a.volume).slice(0, 10);
  const byGain = [...etfList].sort((a, b) => b.changeRate - a.changeRate).slice(0, 5);
  const byLoss = [...etfList].sort((a, b) => a.changeRate - b.changeRate).slice(0, 5);

  const sectorMap = {};
  for (const etf of etfList) {
    if (!sectorMap[etf.sector]) sectorMap[etf.sector] = { sector: etf.sector, count: 0, sumRate: 0, totalAmount: 0 };
    sectorMap[etf.sector].count += 1;
    sectorMap[etf.sector].sumRate += etf.changeRate;
    sectorMap[etf.sector].totalAmount += etf.tradeAmount;
  }
  const sectorFlow = Object.values(sectorMap)
    .map(s => ({
      sector: s.sector,
      count: s.count,
      avgChangeRate: Number((s.sumRate / s.count).toFixed(2)),
      totalAmount: s.totalAmount,
    }))
    .sort((a, b) => b.avgChangeRate - a.avgChangeRate);

  return { byVolume, byGain, byLoss, sectorFlow };
}

async function main() {
  const today = todayKst();
  const fileName = `etf_prices_${today}.json`;
  const filePath = path.join(RAW_DIR, fileName);

  console.log(`📡 ETF 종가 스냅샷${DRY ? ' (--dry)' : ''}: ${SITE_URL}/api/etf → data/raw/${fileName}`);

  let body;
  try {
    body = await fetchApi();
  } catch (err) {
    fail(`응답을 받지 못함 (${err.message})`);
  }

  if (!body || typeof body !== 'object') fail('응답이 JSON 객체가 아님');
  if (!Array.isArray(body.allETFs)) fail('응답에 allETFs 배열이 없음');
  const baseDate = String(body.baseDate || '');
  if (!/^\d{8}$/.test(baseDate)) fail(`baseDate 형식 이상 (${JSON.stringify(body.baseDate)})`);

  // ── 안전장치 ──
  if (body.isRealData !== true) skip(`isRealData=${JSON.stringify(body.isRealData)} (실제 종가 응답이 아님)`);
  if (body.allETFs.length < MIN_ETF_COUNT) skip(`종목 수 ${body.allETFs.length} < ${MIN_ETF_COUNT}`);
  if (baseDate > today) skip(`baseDate ${baseDate} 가 오늘(KST ${today})보다 뒤`);

  const prev = findLatestSnapshot();
  if (prev) {
    if (prev.fileName > fileName) {
      skip(`더 뒤 날짜 파일(${prev.fileName})이 이미 있어 ${fileName} 이 최신으로 선택되지 않음`);
    }
    if (prev.baseDate && baseDate <= prev.baseDate) {
      skip(`baseDate ${baseDate} 가 직전 스냅샷 ${prev.fileName}(baseDate ${prev.baseDate}) 이하`);
    }
  }

  const etfList = body.allETFs.map(e => toSnapshotItem(e, baseDate));
  const missingCode = etfList.filter(e => !e.code || !e.name).length;
  if (missingCode > 0) fail(`code 또는 name 이 빈 종목 ${missingCode}개`);

  const { byVolume, byGain, byLoss, sectorFlow } = enrich(etfList);
  const navCount = etfList.filter(e => 'nav' in e).length;

  const data = {
    source: 'DATA_GO_KR',
    isRealData: true,
    fetchedAt: String(body.fetchedAt || new Date().toISOString()),
    baseDate,
    etfCount: etfList.length,
    etfList,
    byVolume,
    byGain,
    byLoss,
    sectorFlow,
  };
  const wrapped = {
    _meta: {
      createdBy: 'EtfSnapshot',
      createdAt: new Date().toISOString(),
      fileName,
    },
    data,
  };

  console.log(`   baseDate     : ${baseDate}`);
  console.log(`   etfCount     : ${data.etfCount}`);
  console.log(`   nav 포함     : ${navCount}/${data.etfCount}${navCount === 0 ? ' (응답에 nav 없음, 비워 둠)' : ''}`);
  console.log(`   거래량 TOP3  : ${byVolume.slice(0, 3).map(e => `${e.name}(${e.code})`).join(', ')}`);
  console.log(`   섹터 수      : ${sectorFlow.length}`);
  console.log(`   직전 스냅샷  : ${prev ? `${prev.fileName} (baseDate ${prev.baseDate || '?'})` : '없음'}`);

  if (DRY) {
    console.log(`🧪 --dry: 파일을 쓰지 않음 (대상 data/raw/${fileName})`);
    return;
  }

  // 원자적 저장: 임시 파일(로더가 무시하는 이름)에 쓴 뒤 rename.
  if (!fs.existsSync(RAW_DIR)) fs.mkdirSync(RAW_DIR, { recursive: true });
  const tmpPath = path.join(RAW_DIR, `.${fileName}.tmp`);
  fs.writeFileSync(tmpPath, JSON.stringify(wrapped, null, 2), 'utf-8');
  const check = JSON.parse(fs.readFileSync(tmpPath, 'utf-8'));
  if (check?.data?.etfCount !== data.etfCount || check?.data?.baseDate !== baseDate) {
    fs.unlinkSync(tmpPath);
    fail('저장 검증 실패 (다시 읽은 내용이 다름)');
  }
  fs.renameSync(tmpPath, filePath);

  console.log(`✅ 저장: ${path.relative(ROOT, filePath).split(path.sep).join('/')} (baseDate ${baseDate}, ${data.etfCount}종)`);
}

main().catch(err => fail(err?.message || String(err)));
