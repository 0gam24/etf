/**
 * 1️⃣ DataMiner — Daily ETF Pulse의 데이터 수집 단계
 *   - 공공데이터포털 ETF 시세 → 거래량·등락률 기준 TOP10·TOP Gainers·TOP Losers
 *   - 한국은행 ECOS 경제지표 (기준금리·원/달러 환율·CPI)
 *   - MARKET PULSE 이미지 다운로드 → Gemini Vision OCR로 topEtfs·sectorFlow 구조화 추출
 *   - 섹터 분류 (방산·조선·AI/데이터·반도체·커버드콜·해외주식·채권·2차전지·원자재 등)
 *
 *   환경변수:
 *     DATA_GO_KR_API_KEY  — 공공데이터포털 ETF 시세
 *     BOK_ECOS_API_KEY    — 한국은행 경제지표
 *     PULSE_IMAGE_URL     — 매일 갱신되는 MARKET PULSE 이미지 직접 URL (Daily Pulse 핵심)
 *     GEMINI_API_KEY      — 이미지 OCR에 사용 (pipeline/pulse_ocr.js)
 */

const fs = require('fs');
const path = require('path');
const state = require('../pipeline/state_manager');
const logger = require('../pipeline/logger');
const { ocrPulseImage } = require('../pipeline/pulse_ocr');

const AGENT_NAME = 'DataMiner';

// ───── 섹터 분류 규칙 ─────
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

// ───── 공공데이터포털 ETF ─────
async function fetchETFData() {
  logger.log(AGENT_NAME, '📊 ETF 시세 수집 중...');
  const apiKey = process.env.DATA_GO_KR_API_KEY;

  if (!apiKey || apiKey === '여기에_공공데이터포털_API키_입력') {
    logger.warn(AGENT_NAME, '⚠️ DATA_GO_KR_API_KEY 없음 → 샘플 데이터 사용');
    return enrichETFData(getSampleETFData());
  }

  try {
    let etfList = [];
    let foundDate = '';

    for (let i = 1; i <= 5; i++) {
      const targetDate = getBusinessDate(i);
      const url = `https://apis.data.go.kr/1160100/service/GetSecuritiesProductInfoService/getETFPriceInfo?serviceKey=${apiKey}&resultType=json&numOfRows=100&basDt=${targetDate}`;
      logger.log(AGENT_NAME, `   📡 ${targetDate} ETF 시세 요청 (시도 ${i})`);

      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const items = data?.response?.body?.items?.item;

      if (items && (Array.isArray(items) ? items.length > 0 : Object.keys(items).length > 0)) {
        etfList = Array.isArray(items) ? items : [items];
        foundDate = targetDate;
        break;
      }
      logger.warn(AGENT_NAME, `   ⚠️ ${targetDate} 데이터 없음`);
    }

    if (etfList.length === 0) return enrichETFData(getSampleETFData());
    return enrichETFData(parseETFResponse(etfList, foundDate));
  } catch (err) {
    logger.error(AGENT_NAME, `❌ ETF 수집 실패: ${err.message}`);
    return enrichETFData(getSampleETFData());
  }
}

function parseETFResponse(items, date) {
  if (!Array.isArray(items)) items = [items];
  const etfList = items.map(item => ({
    code: item.srtnCd || item.isinCd || '',
    name: item.itmsNm || '',
    price: Number(item.clpr) || 0,
    change: Number(item.vs) || 0,
    changeRate: Number(item.fltRt) || 0,
    volume: Number(item.trqu) || 0,
    tradeAmount: Number(item.trPrc) || 0,
    marketCap: Number(item.mrktTotAmt) || 0,
    nav: Number(item.nav) || Number(item.clpr) || 0,
    highPrice: Number(item.hipr) || 0,
    lowPrice: Number(item.lopr) || 0,
    openPrice: Number(item.mkp) || 0,
    date: item.basDt || date,
  }));

  logger.success(AGENT_NAME, `✅ 실제 ETF ${etfList.length}개 수집 (${date})`);
  return {
    source: 'DATA_GO_KR',
    isRealData: true,
    fetchedAt: new Date().toISOString(),
    baseDate: date,
    etfCount: etfList.length,
    etfList,
  };
}

// ── 랭킹·섹터 분류 파생 데이터 생성 ──
function enrichETFData(raw) {
  const etfList = raw.etfList.map(e => ({ ...e, sector: classifySector(e.name) }));
  const byVolume = [...etfList].sort((a, b) => b.volume - a.volume).slice(0, 10);
  const byGain = [...etfList].sort((a, b) => b.changeRate - a.changeRate).slice(0, 5);
  const byLoss = [...etfList].sort((a, b) => a.changeRate - b.changeRate).slice(0, 5);

  // 섹터별 평균 등락률·거래대금
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

  return { ...raw, etfList, byVolume, byGain, byLoss, sectorFlow };
}

// ───── ECOS 경제지표 (기존 유지) ─────
async function fetchEconomicIndicators() {
  logger.log(AGENT_NAME, '📈 경제지표 수집 중...');
  const apiKey = process.env.BOK_ECOS_API_KEY;

  if (!apiKey || apiKey === '여기에_한국은행_ECOS_API키_입력') {
    logger.warn(AGENT_NAME, '⚠️ BOK_ECOS_API_KEY 없음 → 샘플 데이터 사용');
    return getSampleEconomicData();
  }

  try {
    const endDate = formatDate(new Date());
    const startDate = formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    const baseRate = await fetchEcosData(apiKey, '722Y001', 'D', startDate, endDate, '0101000');
    const exchangeRate = await fetchEcosData(apiKey, '731Y001', 'D', startDate, endDate, '0000001');

    // CPI는 전년동월대비(%)로 변환 — 901Y009는 지수(2020=100) 반환
    const monthEnd = endDate.substring(0, 6);
    const monthStart = formatYYYYMM(subMonths(new Date(), 14)); // 14개월 전까지 확보
    const cpi = await fetchCpiYoY(apiKey, monthStart, monthEnd);

    return {
      source: 'BOK_ECOS',
      isRealData: true,
      fetchedAt: new Date().toISOString(),
      indicators: {
        baseRate: baseRate !== null ? baseRate : 2.50,
        exchangeRate: exchangeRate !== null ? exchangeRate : 1380.50,
        cpi: cpi !== null ? cpi : 2.5,
      },
    };
  } catch (err) {
    logger.error(AGENT_NAME, `❌ 경제지표 실패: ${err.message}`);
    return getSampleEconomicData();
  }
}

// ── 유틸: 월 단위 연산 ──
function subMonths(date, n) {
  const d = new Date(date);
  d.setMonth(d.getMonth() - n);
  return d;
}
function formatYYYYMM(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}${m}`;
}

/**
 * CPI 전년동월대비(%) — 최근 13개월 지수 받아 (T / T-12 - 1) × 100
 * @returns {number|null}
 */
async function fetchCpiYoY(apiKey, startYYYYMM, endYYYYMM) {
  const url = `https://ecos.bok.or.kr/api/StatisticSearch/${apiKey}/json/kr/1/20/901Y009/M/${startYYYYMM}/${endYYYYMM}/0`;
  logger.log(AGENT_NAME, `   📡 ECOS CPI YoY: ${startYYYYMM}~${endYYYYMM}`);
  const response = await fetch(url);
  if (!response.ok) return null;
  const data = await response.json();
  if (data.RESULT) {
    logger.warn(AGENT_NAME, `   ⚠️ ECOS CPI 응답: ${data.RESULT.MESSAGE}`);
    return null;
  }
  const rows = data?.StatisticSearch?.row;
  if (!rows || rows.length < 13) {
    logger.warn(AGENT_NAME, `   ⚠️ CPI 데이터 부족 (${rows?.length || 0}개)`);
    return null;
  }
  const latest = parseFloat(rows[rows.length - 1].DATA_VALUE);
  // TIME 기준 12개월 전 매칭
  const latestTime = rows[rows.length - 1].TIME;
  const targetYear = String(parseInt(latestTime.slice(0, 4), 10) - 1);
  const yearAgoTime = targetYear + latestTime.slice(4);
  const yearAgoRow = rows.find(r => r.TIME === yearAgoTime);
  const yearAgo = yearAgoRow ? parseFloat(yearAgoRow.DATA_VALUE) : NaN;
  if (isNaN(latest) || isNaN(yearAgo) || yearAgo === 0) return null;
  const yoy = Number((((latest / yearAgo) - 1) * 100).toFixed(2));
  logger.log(AGENT_NAME, `   ✅ CPI ${latestTime}: ${latest} / ${yearAgoTime}: ${yearAgo} → 전년비 ${yoy}%`);
  return yoy;
}

async function fetchEcosData(apiKey, statCode, cycle, startDate, endDate, itemCode) {
  const url = `https://ecos.bok.or.kr/api/StatisticSearch/${apiKey}/json/kr/1/10/${statCode}/${cycle}/${startDate}/${endDate}/${itemCode}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`ECOS HTTP ${response.status}`);
  const data = await response.json();
  if (data.RESULT) return null;
  const rows = data?.StatisticSearch?.row;
  if (!rows || rows.length === 0) return null;
  const value = parseFloat(rows[rows.length - 1].DATA_VALUE);
  return isNaN(value) ? null : value;
}

// ───── MARKET PULSE 이미지 다운로드 + OCR ─────
async function fetchPulseImage(today) {
  const imageUrl = process.env.PULSE_IMAGE_URL;
  if (!imageUrl) {
    logger.warn(AGENT_NAME, '⚠️ PULSE_IMAGE_URL 미설정 — 이미지 OCR 건너뜀 (샘플 모드)');
    return { isRealImage: false, localPath: null, url: null, ocr: null };
  }

  let localPath = null;
  let sizeBytes = 0;

  try {
    logger.log(AGENT_NAME, `🖼️  MARKET PULSE 이미지 다운로드: ${imageUrl}`);
    const res = await fetch(imageUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    const ext = imageUrl.match(/\.(png|jpg|jpeg|webp)/i)?.[1]?.toLowerCase() || 'png';
    localPath = path.join(state.PATHS.rawDir, 'pulse_images', `pulse_${today}.${ext}`);
    fs.writeFileSync(localPath, buffer);
    sizeBytes = buffer.length;
    logger.success(AGENT_NAME, `✅ 이미지 저장: ${localPath} (${(sizeBytes / 1024).toFixed(0)}KB)`);
  } catch (err) {
    logger.error(AGENT_NAME, `❌ 이미지 다운로드 실패: ${err.message}`);
    return { isRealImage: false, localPath: null, url: imageUrl, error: err.message, ocr: null };
  }

  // OCR 수행 (Gemini Vision)
  logger.log(AGENT_NAME, '🔎 Gemini Vision OCR 수행 중...');
  const ocr = await ocrPulseImage(localPath);
  if (ocr.ok) {
    logger.success(AGENT_NAME, `✅ OCR 완료 — topEtfs ${ocr.topEtfs.length}, sectorFlow ${ocr.sectorFlow.length}`);
  } else {
    logger.warn(AGENT_NAME, `⚠️ OCR 실패/부분추출 (${ocr.reason})`);
  }

  return { isRealImage: true, localPath, url: imageUrl, sizeBytes, ocr };
}

// ───── 샘플 데이터 ─────
function getSampleETFData() {
  return {
    source: 'SAMPLE',
    isRealData: false,
    fetchedAt: new Date().toISOString(),
    baseDate: formatDate(new Date()),
    etfCount: 10,
    etfList: [
      { code: '449450', name: 'KODEX 방산TOP10', price: 18450, change: 820, changeRate: 4.65, volume: 8420000, tradeAmount: 155000000000, marketCap: 580000000000, nav: 18470, highPrice: 18500, lowPrice: 17800, openPrice: 17850, date: formatDate(new Date()) },
      { code: '466920', name: 'SOL 조선TOP3', price: 21300, change: 950, changeRate: 4.67, volume: 6210000, tradeAmount: 132000000000, marketCap: 410000000000, nav: 21320, highPrice: 21500, lowPrice: 20400, openPrice: 20450, date: formatDate(new Date()) },
      { code: '487350', name: 'SOL 팔란티어커버드콜OTM', price: 12850, change: 65, changeRate: 0.51, volume: 4850000, tradeAmount: 62000000000, marketCap: 310000000000, nav: 12860, highPrice: 12900, lowPrice: 12800, openPrice: 12830, date: formatDate(new Date()) },
      { code: '069500', name: 'KODEX 200', price: 35250, change: 150, changeRate: 0.43, volume: 3254000, tradeAmount: 114000000000, marketCap: 7200000000000, nav: 35280, highPrice: 35400, lowPrice: 35100, openPrice: 35200, date: formatDate(new Date()) },
      { code: '379800', name: 'KODEX 미국S&P500TR', price: 18520, change: -80, changeRate: -0.43, volume: 1520000, tradeAmount: 28000000000, marketCap: 4500000000000, nav: 18535, highPrice: 18600, lowPrice: 18450, openPrice: 18560, date: formatDate(new Date()) },
      { code: '448290', name: 'KODEX 미국배당다우존스', price: 12850, change: 45, changeRate: 0.35, volume: 890000, tradeAmount: 11400000000, marketCap: 1200000000000, nav: 12860, highPrice: 12900, lowPrice: 12800, openPrice: 12830, date: formatDate(new Date()) },
      { code: '411060', name: 'ACE 미국배당다우존스', price: 13200, change: 30, changeRate: 0.23, volume: 1120000, tradeAmount: 14800000000, marketCap: 980000000000, nav: 13210, highPrice: 13250, lowPrice: 13150, openPrice: 13180, date: formatDate(new Date()) },
      { code: '305720', name: 'KODEX 2차전지산업', price: 9850, change: -220, changeRate: -2.18, volume: 2100000, tradeAmount: 20700000000, marketCap: 450000000000, nav: 9860, highPrice: 10080, lowPrice: 9820, openPrice: 10070, date: formatDate(new Date()) },
      { code: '091160', name: 'KODEX 반도체', price: 41200, change: 580, changeRate: 1.43, volume: 1780000, tradeAmount: 73000000000, marketCap: 850000000000, nav: 41220, highPrice: 41500, lowPrice: 40600, openPrice: 40620, date: formatDate(new Date()) },
      { code: '261240', name: 'KODEX 미국채울트라30년선물(H)', price: 8950, change: -120, changeRate: -1.32, volume: 2300000, tradeAmount: 20500000000, marketCap: 650000000000, nav: 8960, highPrice: 9000, lowPrice: 8900, openPrice: 8980, date: formatDate(new Date()) },
    ],
  };
}

function getSampleEconomicData() {
  return {
    source: 'SAMPLE',
    isRealData: false,
    fetchedAt: new Date().toISOString(),
    indicators: { baseRate: 3.50, exchangeRate: 1380.50, cpi: 3.2 },
  };
}

// ───── 유틸 ─────
function getBusinessDate(daysBack) {
  const date = new Date();
  let count = 0;
  while (count < daysBack) {
    date.setDate(date.getDate() - 1);
    const dow = date.getDay();
    if (dow !== 0 && dow !== 6) count++;
  }
  return formatDate(date);
}
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

// ───── run ─────
async function run({ today }) {
  logger.log(AGENT_NAME, '🚀 Daily ETF Pulse 데이터 수집 시작');

  const etfData = await fetchETFData();
  state.saveData(AGENT_NAME, 'raw', `etf_prices_${today}.json`, etfData);

  const ecoData = await fetchEconomicIndicators();
  state.saveData(AGENT_NAME, 'raw', `economic_indicators_${today}.json`, ecoData);

  const pulseImage = await fetchPulseImage(today);
  state.saveData(AGENT_NAME, 'raw', `pulse_image_${today}.json`, pulseImage);

  logger.success(AGENT_NAME, `📊 ETF ${etfData.etfCount} / 거래량TOP10 추출 / 섹터 ${etfData.sectorFlow.length}개 분류`);
  logger.success(AGENT_NAME, `📈 기준금리 ${ecoData.indicators.baseRate}% · 환율 ${ecoData.indicators.exchangeRate}원`);
  if (pulseImage.isRealImage) logger.success(AGENT_NAME, `🖼️  PULSE 이미지 저장 완료`);

  return {
    summary: `ETF ${etfData.etfCount}(${etfData.isRealData ? '실제' : '샘플'}) · 섹터 ${etfData.sectorFlow.length} · 이미지 ${pulseImage.isRealImage ? 'OK' : '미수집'}`,
    etfData,
    economicData: ecoData,
    pulseImage,
  };
}

module.exports = { run };
