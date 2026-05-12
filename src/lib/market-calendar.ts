/**
 * KRX 시장 캘린더 — 한국 주식시장 영업일·휴장일·시장상태 판정.
 *
 *   2026~2027 휴장일 정적 매핑 (KRX 정보데이터시스템 기준).
 *   매년 12월 KRX 공시 후 운영자가 다음 해 휴장일 추가 갱신.
 *
 *   사이트 전역 (`src/lib/kis.ts` 의 getMarketStatus() 대체 + SiteLiveBar / EtfMarketPulse / TodayReport 동일 사용).
 */

// KRX 휴장일 (정규장 휴장 — 토일 제외 평일 휴장만 등록)
// 출처: KRX 정보데이터시스템 (http://data.krx.co.kr) — 매년 갱신 필요
const KRX_HOLIDAYS_2026: ReadonlyArray<string> = [
  '2026-01-01', // 신정
  '2026-02-16', // 설날 (음력 1/1, 월)
  '2026-02-17', // 설날 (월~수 연휴 - 음력)
  '2026-02-18', // 설날 대체
  '2026-03-01', // 삼일절 (일) → 3/2 대체
  '2026-03-02', // 삼일절 대체
  '2026-05-05', // 어린이날 (화)
  '2026-05-24', // 부처님오신날 (음력 4/8) — 일이면 대체 휴일
  '2026-05-25', // 부처님오신날 대체 (일 → 월)
  '2026-06-03', // 대통령 선거일 (가정 — 5년 주기)
  '2026-06-06', // 현충일 (토)
  '2026-08-15', // 광복절 (토)
  '2026-09-24', // 추석 연휴 (목·금·토 — 음력 8/15)
  '2026-09-25',
  '2026-10-03', // 개천절 (토)
  '2026-10-09', // 한글날 (금)
  '2026-12-25', // 성탄절 (금)
  '2026-12-31', // 연말 휴장 (KRX 관례)
];

const KRX_HOLIDAYS_2027: ReadonlyArray<string> = [
  '2027-01-01',
  '2027-02-08', // 설날 (음력 1/1)
  '2027-02-09',
  '2027-02-10',
  '2027-03-01', // 삼일절 (월)
  '2027-05-05',
  '2027-05-13', // 부처님오신날
  '2027-06-06',
  '2027-08-15', // 광복절 (일) → 8/16 대체
  '2027-08-16',
  '2027-09-15', // 추석 (음력 8/15)
  '2027-09-16',
  '2027-09-17',
  '2027-10-03', // 개천절 (일) → 10/4 대체
  '2027-10-04',
  '2027-10-09', // 한글날 (토)
  '2027-12-25',
  '2027-12-31',
];

const ALL_HOLIDAYS = new Set([...KRX_HOLIDAYS_2026, ...KRX_HOLIDAYS_2027]);

export type MarketStatus = 'pre_open' | 'open' | 'closed' | 'holiday';

export interface MarketSnapshot {
  status: MarketStatus;
  kstNow: Date;          // KST 변환된 현재 시각
  kstDateStr: string;    // 'YYYY-MM-DD'
  kstTimeStr: string;    // 'HH:MM:SS'
  weekday: string;       // '월'·'화'·... '일'
  /** 직전 거래일 (휴장 또는 장 시작 전 일 때 사용) */
  prevTradingDay: string; // 'YYYY-MM-DD'
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function ymdString(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function toKst(now: Date): Date {
  return new Date(now.getTime() + 9 * 3600 * 1000);
}

export function isKrxHoliday(kstDateStr: string): boolean {
  return ALL_HOLIDAYS.has(kstDateStr);
}

export function isWeekend(kstDay: number): boolean {
  return kstDay === 0 || kstDay === 6; // 일·토
}

/** 주어진 KST 날짜의 직전 영업일 반환 */
export function getPrevTradingDay(kstDateStr: string): string {
  const [y, m, d] = kstDateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  for (let i = 0; i < 15; i++) {
    dt.setUTCDate(dt.getUTCDate() - 1);
    const ymd = ymdString(dt);
    if (!isWeekend(dt.getUTCDay()) && !isKrxHoliday(ymd)) return ymd;
  }
  return kstDateStr; // fallback
}

/** 시장 상태 판정 — KST 기준 */
export function getMarketSnapshot(now: Date = new Date()): MarketSnapshot {
  const kst = toKst(now);
  const kstDateStr = ymdString(kst);
  const kstTimeStr = `${String(kst.getUTCHours()).padStart(2, '0')}:${String(kst.getUTCMinutes()).padStart(2, '0')}:${String(kst.getUTCSeconds()).padStart(2, '0')}`;
  const weekday = WEEKDAYS[kst.getUTCDay()];

  let status: MarketStatus;
  if (isWeekend(kst.getUTCDay()) || isKrxHoliday(kstDateStr)) {
    status = 'holiday';
  } else {
    const minutes = kst.getUTCHours() * 60 + kst.getUTCMinutes();
    if (minutes < 9 * 60) status = 'pre_open';
    else if (minutes < 15 * 60 + 30) status = 'open';
    else status = 'closed';
  }

  const prevTradingDay = (status === 'open' || status === 'closed')
    ? kstDateStr  // 오늘이 영업일이면 오늘
    : getPrevTradingDay(kstDateStr);

  return { status, kstNow: kst, kstDateStr, kstTimeStr, weekday, prevTradingDay };
}

/** 한 줄 한국어 라벨 */
export function marketStatusLabel(snap: MarketSnapshot): string {
  switch (snap.status) {
    case 'pre_open':  return `장 시작 전 · ${snap.kstDateStr.slice(5)}(${snap.weekday}) ${snap.kstTimeStr.slice(0, 5)}`;
    case 'open':      return `장중 실시간 · ${snap.kstDateStr.slice(5)}(${snap.weekday}) ${snap.kstTimeStr}`;
    case 'closed':    return `오늘 종가 · ${snap.kstDateStr.slice(5)}(${snap.weekday}) 15:30 마감`;
    case 'holiday':   return `휴장 · 직전 거래일 ${snap.prevTradingDay.slice(5)}`;
  }
}

/** 시장 상태별 색상 (CSS color) */
export function marketStatusColor(status: MarketStatus): string {
  switch (status) {
    case 'pre_open':  return '#F59E0B'; // amber
    case 'open':      return '#EF4444'; // red (LIVE)
    case 'closed':    return '#10B981'; // emerald
    case 'holiday':   return '#94A3B8'; // slate
  }
}
