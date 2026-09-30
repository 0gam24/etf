/**
 * 📡 ETF 시세 API Route
 * 
 * 공공데이터포털(data.go.kr)에서 ETF 시세를 가져와서
 * 프론트엔드 위젯에 전달하는 중간 서버 역할.
 * 
 * ✅ CORS 문제 없음 (서버에서 호출하니까!)
 * ✅ 30분 캐싱으로 API 호출 횟수 절약
 * ✅ API 호출이 실패하면 저장소에 커밋된 최신 종가 스냅샷으로 응답(source: 'snapshot')
 *
 * 2026-09-30: 예전에는 실패 시 하드코딩 표본 시세(KODEX 200 35,250원 등)를 돌려줬다.
 *   홈 위젯과 /api/etf/realtime 이 isRealData 를 거르지 않아 운영 화면에 가짜 가격이
 *   표시될 수 있었다(YMYL). 표본 시세를 없애고, 스냅샷도 없으면 503 + 빈 목록을 준다.
 */
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getLatestEtfData } from '@/lib/data';

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
      // API 키가 없으면 커밋된 스냅샷으로 응답 (캐시에 쓰지 않는다)
      return snapshotFallbackResponse('api-key-missing');
    }

    // 3. 실제 API 호출 (최근 5영업일까지 탐색)
    let etfList: any[] = [];
    let foundDate = '';

    for (let i = 1; i <= 5; i++) {
      const targetDate = getBusinessDate(i);
      // numOfRows: 100 → 1500 (2026-08-12) — 상장 ETF 1,160종 전량 수신.
      //   API의 totalCount가 1160인데 100만 받고 있어, 이 라우트를 쓰는 위젯들도
      //   상위 100종 밖의 종목은 시세를 표시하지 못했다.
      const url = `https://apis.data.go.kr/1160100/service/GetSecuritiesProductInfoService/getETFPriceInfo?serviceKey=${apiKey}&resultType=json&numOfRows=1500&basDt=${targetDate}`;

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

    // 4. 데이터 파싱 및 분석 — 원자료가 없으면 스냅샷으로 (캐시에 쓰지 않아 다음 요청이 다시 시도)
    if (etfList.length === 0) {
      return snapshotFallbackResponse('api-empty');
    }
    const result = parseAndAnalyze(etfList, foundDate);

    // 5. 캐시에 저장
    writeCache(result);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('ETF API 에러:', error.message);
    return snapshotFallbackResponse('api-error');
  }
}

/**
 * API 실패 시 응답 — 저장소에 커밋된 최신 etf_prices_*.json 스냅샷(실제 종가, 기준일 표기).
 *   source: 'snapshot' 을 달아 scripts/snapshot-etf-prices.mjs 가 이 응답을 다시 저장하지 않게 한다.
 *   스냅샷도 없으면 503 과 빈 목록. 어떤 경우에도 만든 가격을 돌려주지 않는다.
 */
function snapshotFallbackResponse(reason: string) {
  try {
    const snap = getLatestEtfData() as { etfList?: any[]; baseDate?: string; fetchedAt?: string } | null;
    const list = Array.isArray(snap?.etfList) ? snap!.etfList : [];
    if (list.length > 0 && snap?.baseDate) {
      const analyzed = parseAndAnalyze(list.map(e => ({
        srtnCd: e.code, itmsNm: e.name, clpr: e.price, vs: e.change, fltRt: e.changeRate,
        trqu: e.volume, trPrc: e.tradeAmount, mrktTotAmt: e.marketCap, nav: e.nav,
        hipr: e.highPrice, lopr: e.lowPrice, mkp: e.openPrice, basDt: e.date || snap.baseDate,
      })), String(snap.baseDate));
      return NextResponse.json({
        ...analyzed,
        fetchedAt: snap.fetchedAt || analyzed.fetchedAt,
        source: 'snapshot',
        fallbackReason: reason,
      });
    }
  } catch (err: any) {
    console.error('ETF 스냅샷 폴백 실패:', err?.message);
  }
  return NextResponse.json({
    isRealData: false,
    source: 'none',
    fallbackReason: reason,
    baseDate: '',
    fetchedAt: new Date().toISOString(),
    totalCount: 0,
    trending: [],
    topGainers: [],
    topLosers: [],
    categories: {},
    topMarketCap: [],
    allETFs: [],
  }, { status: 503 });
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
    nav: Number(item.nav) || 0, // 순자산가치(원자료 nav). 저장소 스냅샷(scripts/snapshot-etf-prices.mjs)이 이 값을 싣는다
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
    if (cached?.isRealData !== true) return null; // 예전 표본 시세 캐시는 쓰지 않는다
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

