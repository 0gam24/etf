/**
 * 📡 ETF 시세 API Route
 * 
 * 공공데이터포털(data.go.kr)에서 ETF 시세를 가져와서
 * 프론트엔드 위젯에 전달하는 중간 서버 역할.
 * 
 * ✅ CORS 문제 없음 (서버에서 호출하니까!)
 * ✅ 30분 캐싱으로 API 호출 횟수 절약
 * ✅ API 키 미설정 시 샘플 데이터 자동 전환
 */
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// ── 캐시 파일 경로 ──
const CACHE_DIR = path.join(process.cwd(), 'data', 'raw');
const CACHE_FILE = path.join(CACHE_DIR, 'etf_api_cache.json');
const CACHE_TTL = 30 * 60 * 1000; // 30분 (밀리초)

/**
 * GET /api/etf
 * 프론트엔드 위젯이 이 주소로 ETF 데이터를 요청합니다.
 */
export async function GET() {
  try {
    // 1. 캐시 확인 — 30분 이내면 캐시 데이터 반환
    const cached = readCache();
    if (cached) {
      return NextResponse.json({ ...cached, fromCache: true });
    }

    // 2. 캐시 없으면 공공데이터포털 API 호출
    const apiKey = process.env.DATA_GO_KR_API_KEY;

    if (!apiKey || apiKey === '여기에_공공데이터포털_API키_입력') {
      // API 키 없으면 샘플 데이터
      const sample = getSampleData();
      writeCache(sample);
      return NextResponse.json(sample);
    }

    // 3. 실제 API 호출 (최근 5영업일까지 탐색)
    let etfList: any[] = [];
    let foundDate = '';

    for (let i = 1; i <= 5; i++) {
      const targetDate = getBusinessDate(i);
      const url = `https://apis.data.go.kr/1160100/service/GetSecuritiesProductInfoService/getETFPriceInfo?serviceKey=${apiKey}&resultType=json&numOfRows=100&basDt=${targetDate}`;

      const response = await fetch(url, { 
        next: { revalidate: 1800 } // Next.js 캐시: 30분
      });

      if (!response.ok) continue;

      const data = await response.json();
      const items = data?.response?.body?.items?.item;

      if (items && (Array.isArray(items) ? items.length > 0 : true)) {
        etfList = Array.isArray(items) ? items : [items];
        foundDate = targetDate;
        break;
      }
    }

    // 4. 데이터 파싱 및 분석
    let result;
    if (etfList.length > 0) {
      result = parseAndAnalyze(etfList, foundDate);
    } else {
      result = getSampleData();
    }

    // 5. 캐시에 저장
    writeCache(result);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('ETF API 에러:', error.message);
    return NextResponse.json(getSampleData());
  }
}

// ── 데이터 파싱 + 분석 ──
function parseAndAnalyze(items: any[], date: string) {
  const etfList = items.map((item: any) => ({
    code: item.srtnCd || item.isinCd || '',
    name: item.itmsNm || '',
    price: Number(item.clpr) || 0,
    change: Number(item.vs) || 0,
    changeRate: Number(item.fltRt) || 0,
    volume: Number(item.trqu) || 0,
    tradeAmount: Number(item.trPrc) || 0,
    marketCap: Number(item.mrktTotAmt) || 0,
    highPrice: Number(item.hipr) || 0,
    lowPrice: Number(item.lopr) || 0,
    openPrice: Number(item.mkp) || 0,
    date: item.basDt || date,
  }));

  // ── 분석 데이터 생성 ──
  
  // 1. 거래량 TOP 10 (시청자 관심 = 거래량)
  const trending = [...etfList]
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 10);

  // 2. 상승 TOP 5 / 하락 TOP 5
  const sorted = [...etfList].sort((a, b) => b.changeRate - a.changeRate);
  const topGainers = sorted.slice(0, 5);
  const topLosers = sorted.slice(-5).reverse();

  // 3. 카테고리별 흐름 분석 (이름에서 카테고리 추정)
  const categories = categorizeETFs(etfList);

  // 4. 시가총액 TOP 5 (대형 안정 ETF)
  const topMarketCap = [...etfList]
    .sort((a, b) => b.marketCap - a.marketCap)
    .slice(0, 5);

  return {
    isRealData: true,
    baseDate: date,
    fetchedAt: new Date().toISOString(),
    totalCount: etfList.length,
    trending,
    topGainers,
    topLosers,
    categories,
    topMarketCap,
    allETFs: etfList,
  };
}

// ── ETF 이름으로 카테고리 분류 ──
function categorizeETFs(etfList: any[]) {
  const cats: Record<string, { name: string; icon: string; etfs: any[]; avgChange: number; totalVolume: number }> = {
    domestic: { name: '국내주식', icon: '🇰🇷', etfs: [], avgChange: 0, totalVolume: 0 },
    us: { name: '해외(미국)', icon: '🇺🇸', etfs: [], avgChange: 0, totalVolume: 0 },
    dividend: { name: '배당', icon: '💰', etfs: [], avgChange: 0, totalVolume: 0 },
    bond: { name: '채권', icon: '📜', etfs: [], avgChange: 0, totalVolume: 0 },
    commodity: { name: '원자재', icon: '🛢️', etfs: [], avgChange: 0, totalVolume: 0 },
    tech: { name: '테크/AI', icon: '🤖', etfs: [], avgChange: 0, totalVolume: 0 },
    other: { name: '기타', icon: '📊', etfs: [], avgChange: 0, totalVolume: 0 },
  };

  for (const etf of etfList) {
    const name = etf.name.toLowerCase();
    if (name.includes('배당') || name.includes('dividend') || name.includes('고배당')) {
      cats.dividend.etfs.push(etf);
    } else if (name.includes('채권') || name.includes('국채') || name.includes('bond') || name.includes('채안')) {
      cats.bond.etfs.push(etf);
    } else if (name.includes('미국') || name.includes('s&p') || name.includes('나스닥') || name.includes('nasdaq')) {
      cats.us.etfs.push(etf);
    } else if (name.includes('ai') || name.includes('반도체') || name.includes('테크') || name.includes('2차전지')) {
      cats.tech.etfs.push(etf);
    } else if (name.includes('금') || name.includes('원유') || name.includes('은') || name.includes('구리')) {
      cats.commodity.etfs.push(etf);
    } else if (name.includes('200') || name.includes('코스피') || name.includes('코스닥') || name.includes('국내')) {
      cats.domestic.etfs.push(etf);
    } else {
      cats.other.etfs.push(etf);
    }
  }

  // 각 카테고리 평균 등락률, 총 거래량 계산
  for (const key of Object.keys(cats)) {
    const cat = cats[key];
    if (cat.etfs.length > 0) {
      cat.avgChange = Number((cat.etfs.reduce((sum: number, e: any) => sum + e.changeRate, 0) / cat.etfs.length).toFixed(2));
      cat.totalVolume = cat.etfs.reduce((sum: number, e: any) => sum + e.volume, 0);
    }
  }

  // etfs가 비어있는 카테고리 제외
  const result: Record<string, any> = {};
  for (const [key, cat] of Object.entries(cats)) {
    if (cat.etfs.length > 0) {
      result[key] = {
        name: cat.name,
        icon: cat.icon,
        count: cat.etfs.length,
        avgChange: cat.avgChange,
        totalVolume: cat.totalVolume,
      };
    }
  }

  return result;
}

// ── 캐시 읽기 ──
function readCache() {
  try {
    if (!fs.existsSync(CACHE_FILE)) return null;
    const raw = fs.readFileSync(CACHE_FILE, 'utf-8');
    const cached = JSON.parse(raw);
    const age = Date.now() - new Date(cached.fetchedAt).getTime();
    if (age > CACHE_TTL) return null; // 만료
    return cached;
  } catch {
    return null;
  }
}

// ── 캐시 쓰기 ──
function writeCache(data: any) {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
    fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('캐시 저장 실패:', err);
  }
}

// ── N 영업일 전 날짜 ──
function getBusinessDate(daysBack: number) {
  const date = new Date();
  let count = 0;
  while (count < daysBack) {
    date.setDate(date.getDate() - 1);
    if (date.getDay() !== 0 && date.getDay() !== 6) count++;
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

// ── 샘플 데이터 ──
function getSampleData() {
  const sampleETFs = [
    { code: '069500', name: 'KODEX 200', price: 35250, change: 150, changeRate: 0.43, volume: 3254000, tradeAmount: 1145, marketCap: 52340, highPrice: 35400, lowPrice: 35100, openPrice: 35200 },
    { code: '379800', name: 'KODEX 미국S&P500TR', price: 18520, change: -80, changeRate: -0.43, volume: 1520000, tradeAmount: 282, marketCap: 38200, highPrice: 18600, lowPrice: 18450, openPrice: 18560 },
    { code: '448290', name: 'KODEX 미국배당다우존스', price: 12850, change: 45, changeRate: 0.35, volume: 890000, tradeAmount: 114, marketCap: 21500, highPrice: 12900, lowPrice: 12800, openPrice: 12830 },
    { code: '411060', name: 'ACE 미국배당다우존스', price: 13200, change: 30, changeRate: 0.23, volume: 1120000, tradeAmount: 148, marketCap: 19800, highPrice: 13250, lowPrice: 13150, openPrice: 13180 },
    { code: '261240', name: 'KODEX 미국채울트라30년선물(H)', price: 8950, change: -120, changeRate: -1.32, volume: 2300000, tradeAmount: 206, marketCap: 15600, highPrice: 9000, lowPrice: 8900, openPrice: 8980 },
    { code: '305720', name: 'KODEX 2차전지산업', price: 7850, change: 210, changeRate: 2.75, volume: 4100000, tradeAmount: 322, marketCap: 12300, highPrice: 7900, lowPrice: 7640, openPrice: 7660 },
    { code: '091160', name: 'KODEX 반도체', price: 42300, change: 800, changeRate: 1.93, volume: 1890000, tradeAmount: 799, marketCap: 28700, highPrice: 42500, lowPrice: 41500, openPrice: 41600 },
    { code: '381170', name: 'TIGER 미국테크TOP10 INDXX', price: 16800, change: -250, changeRate: -1.47, volume: 980000, tradeAmount: 165, marketCap: 17200, highPrice: 17050, lowPrice: 16750, openPrice: 17000 },
    { code: '132030', name: 'KODEX 골드선물(H)', price: 18400, change: 320, changeRate: 1.77, volume: 560000, tradeAmount: 103, marketCap: 9800, highPrice: 18500, lowPrice: 18080, openPrice: 18100 },
    { code: '364970', name: 'KODEX 은행', price: 9100, change: 50, changeRate: 0.55, volume: 450000, tradeAmount: 41, marketCap: 5400, highPrice: 9150, lowPrice: 9050, openPrice: 9060 },
  ];

  const trending = [...sampleETFs].sort((a, b) => b.volume - a.volume).slice(0, 10);
  const sorted = [...sampleETFs].sort((a, b) => b.changeRate - a.changeRate);
  const topGainers = sorted.slice(0, 5);
  const topLosers = sorted.slice(-5).reverse();

  return {
    isRealData: false,
    baseDate: getBusinessDate(1),
    fetchedAt: new Date().toISOString(),
    totalCount: sampleETFs.length,
    trending,
    topGainers,
    topLosers,
    categories: {
      domestic: { name: '국내주식', icon: '🇰🇷', count: 2, avgChange: 0.49, totalVolume: 3704000 },
      us: { name: '해외(미국)', icon: '🇺🇸', count: 2, avgChange: -0.95, totalVolume: 2500000 },
      dividend: { name: '배당', icon: '💰', count: 2, avgChange: 0.29, totalVolume: 2010000 },
      bond: { name: '채권', icon: '📜', count: 1, avgChange: -1.32, totalVolume: 2300000 },
      tech: { name: '테크/AI', icon: '🤖', count: 2, avgChange: 2.34, totalVolume: 5990000 },
      commodity: { name: '원자재', icon: '🛢️', count: 1, avgChange: 1.77, totalVolume: 560000 },
    },
    topMarketCap: [...sampleETFs].sort((a, b) => b.marketCap - a.marketCap).slice(0, 5),
    allETFs: sampleETFs,
  };
}
