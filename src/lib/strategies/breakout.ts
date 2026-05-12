/**
 * Unger Method — Volatility Breakout (변동성 돌파) — 코스피200 적용.
 *
 *   원전: Andrea Unger, "The Unger Method" (4회 World Cup Trading Championship 우승자)
 *   적용: KOSPI200 일중 — 시초가 ± (전 N일 ATR × K배수) 가격에서 추세 추종 진입
 *
 *   ⚠️ 본 라이브러리는 시그널 계산만 수행. 자동 매매 X.
 *      매매 결정은 시청자 본인 책임. YMYL 안전선 (정보 제공 only).
 */

export interface OHLC {
  date: string;           // YYYYMMDD
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface BreakoutSignal {
  /** 시그널 생성 시점 (시초가 확정 후) */
  date: string;
  /** 종목 코드 (예: '069500' KODEX 200) */
  code: string;
  /** 종목 이름 */
  name?: string;
  /** 입력 파라미터 */
  params: { N: number; K: number };
  /** 5일 ATR */
  atr5: number;
  /** 변동성 ratio (ATR / open) — 1% 이상이면 신뢰도↑ */
  volRatio: number;
  /** 시초가 */
  open: number;
  /** Long 진입가 (시초가 + K × ATR) */
  longTrigger: number;
  /** Short 진입가 (시초가 - K × ATR) */
  shortTrigger: number;
  /** Long stop-loss */
  longStop: number;
  /** Long take-profit */
  longTarget: number;
  /** Short stop-loss */
  shortStop: number;
  /** Short take-profit */
  shortTarget: number;
  /** 추세 필터: 종가 vs 20일 이동평균 위치 */
  trend: 'up' | 'down' | 'flat';
  /** 변동성 필터 통과 여부 (ATR/open ≥ 0.8%) */
  volPass: boolean;
  /** 종합 시그널 상태 */
  status: 'WAIT' | 'LONG_READY' | 'SHORT_READY' | 'BOTH_READY';
  /** 사람이 읽는 한 줄 요약 */
  summary: string;
}

/**
 * 단일 종목 OHLC 시계열로 5일 ATR 계산.
 *   ATR = max(high-low, |high-prevClose|, |low-prevClose|) 의 N일 평균
 */
export function computeATR(history: OHLC[], N: number = 5): number {
  if (history.length < N + 1) return 0;
  const trs: number[] = [];
  for (let i = history.length - N; i < history.length; i++) {
    const cur = history[i];
    const prev = history[i - 1];
    const tr = Math.max(
      cur.high - cur.low,
      Math.abs(cur.high - prev.close),
      Math.abs(cur.low - prev.close),
    );
    trs.push(tr);
  }
  return trs.reduce((s, v) => s + v, 0) / trs.length;
}

/**
 * 추세 필터 — 종가 vs 20일 단순이동평균.
 */
export function computeTrend(history: OHLC[], days: number = 20): 'up' | 'down' | 'flat' {
  if (history.length < days) return 'flat';
  const recent = history.slice(-days);
  const sma = recent.reduce((s, h) => s + h.close, 0) / recent.length;
  const lastClose = recent[recent.length - 1].close;
  const diff = (lastClose - sma) / sma;
  if (diff > 0.01) return 'up';      // +1% 이상
  if (diff < -0.01) return 'down';   // -1% 이상
  return 'flat';
}

/**
 * Breakout 시그널 계산 — 시초가 확정 후 호출.
 *
 *   파라미터 (Unger 권장 + 코스피200 튜닝):
 *     - N = 5 (ATR look-back)
 *     - K_TRIGGER = 0.5 (진입 트리거 배수)
 *     - K_STOP    = 0.6 (손절 배수)
 *     - K_TARGET  = 1.0 (익절 배수)
 *     - VOL_MIN   = 0.008 (변동성 최소 0.8%)
 *
 * @param history 종목 일봉 시계열 (오늘 시초가만 있는 행 포함, 마지막 행이 오늘)
 * @param code 단축코드
 * @param name 종목 이름 (선택)
 */
export function computeBreakoutSignal(
  history: OHLC[],
  code: string,
  name?: string,
  opts?: { N?: number; K_TRIGGER?: number; K_STOP?: number; K_TARGET?: number; VOL_MIN?: number },
): BreakoutSignal | null {
  if (history.length < 21) return null; // 20일 SMA + ATR 5일 → 최소 21개

  const N = opts?.N ?? 5;
  const K_TRIGGER = opts?.K_TRIGGER ?? 0.5;
  const K_STOP = opts?.K_STOP ?? 0.6;
  const K_TARGET = opts?.K_TARGET ?? 1.0;
  const VOL_MIN = opts?.VOL_MIN ?? 0.008;

  const today = history[history.length - 1];
  const histExcludingToday = history.slice(0, -1);
  const atr5 = computeATR(histExcludingToday, N);

  if (atr5 === 0 || today.open === 0) return null;

  const volRatio = atr5 / today.open;
  const volPass = volRatio >= VOL_MIN;

  const longTrigger = today.open + K_TRIGGER * atr5;
  const shortTrigger = today.open - K_TRIGGER * atr5;
  const longStop = longTrigger - K_STOP * atr5;
  const longTarget = longTrigger + K_TARGET * atr5;
  const shortStop = shortTrigger + K_STOP * atr5;
  const shortTarget = shortTrigger - K_TARGET * atr5;

  const trend = computeTrend(histExcludingToday, 20);

  // 종합 상태 — 추세 + 변동성 필터 모두 통과해야 시그널 READY.
  // 역추세 진입은 회피 (whipsaw 차단).
  let status: BreakoutSignal['status'] = 'WAIT';
  if (volPass) {
    const longAllowed = trend !== 'down';
    const shortAllowed = trend !== 'up';
    if (longAllowed && shortAllowed) status = 'BOTH_READY';
    else if (longAllowed) status = 'LONG_READY';
    else if (shortAllowed) status = 'SHORT_READY';
  }

  const trendKo = trend === 'up' ? '상승' : trend === 'down' ? '하락' : '횡보';
  const summary = !volPass
    ? `변동성 부족 (${(volRatio * 100).toFixed(2)}% · 최소 ${(VOL_MIN * 100).toFixed(1)}%) — WAIT`
    : status === 'BOTH_READY'
      ? `${trendKo} 추세 · ${longTrigger.toLocaleString()} 이상 매수 / ${shortTrigger.toLocaleString()} 이하 매도 트리거`
      : status === 'LONG_READY'
        ? `${trendKo} 추세 · ${longTrigger.toLocaleString()} 이상 돌파 시 매수 진입 가능`
        : status === 'SHORT_READY'
          ? `${trendKo} 추세 · ${shortTrigger.toLocaleString()} 이하 돌파 시 매도 진입 가능`
          : '대기';

  return {
    date: today.date,
    code,
    name,
    params: { N, K: K_TRIGGER },
    atr5: Math.round(atr5 * 100) / 100,
    volRatio: Math.round(volRatio * 10000) / 10000,
    open: today.open,
    longTrigger: Math.round(longTrigger),
    shortTrigger: Math.round(shortTrigger),
    longStop: Math.round(longStop),
    longTarget: Math.round(longTarget),
    shortStop: Math.round(shortStop),
    shortTarget: Math.round(shortTarget),
    trend,
    volPass,
    status,
    summary,
  };
}

/**
 * 진입 시그널 vs 실제 결과 비교 (다음 거래일 실데이터로 백채움).
 *   transparent 트랙 레코드 자동 기록용.
 */
export interface SignalOutcome {
  date: string;
  code: string;
  status: BreakoutSignal['status'];
  /** 다음 거래일 high/low/close — 실제 trigger 도달 여부 검증 */
  nextHigh: number;
  nextLow: number;
  nextClose: number;
  /** Long 진입 발생 여부 */
  longTriggered: boolean;
  /** Short 진입 발생 여부 */
  shortTriggered: boolean;
  /** Long 손익 (진입 시) */
  longPnL?: number;
  /** Short 손익 (진입 시) */
  shortPnL?: number;
  /** Long: 익절 vs 손절 vs 종가청산 */
  longResult?: 'win' | 'loss' | 'eod';
  shortResult?: 'win' | 'loss' | 'eod';
}

export function evaluateSignal(signal: BreakoutSignal, next: OHLC): SignalOutcome {
  const longTriggered = next.high >= signal.longTrigger;
  const shortTriggered = next.low <= signal.shortTrigger;

  let longPnL: number | undefined;
  let longResult: 'win' | 'loss' | 'eod' | undefined;
  if (longTriggered) {
    if (next.high >= signal.longTarget) { longPnL = signal.longTarget - signal.longTrigger; longResult = 'win'; }
    else if (next.low <= signal.longStop) { longPnL = signal.longStop - signal.longTrigger; longResult = 'loss'; }
    else { longPnL = next.close - signal.longTrigger; longResult = 'eod'; }
  }

  let shortPnL: number | undefined;
  let shortResult: 'win' | 'loss' | 'eod' | undefined;
  if (shortTriggered) {
    if (next.low <= signal.shortTarget) { shortPnL = signal.shortTrigger - signal.shortTarget; shortResult = 'win'; }
    else if (next.high >= signal.shortStop) { shortPnL = signal.shortTrigger - signal.shortStop; shortResult = 'loss'; }
    else { shortPnL = signal.shortTrigger - next.close; shortResult = 'eod'; }
  }

  return {
    date: signal.date,
    code: signal.code,
    status: signal.status,
    nextHigh: next.high,
    nextLow: next.low,
    nextClose: next.close,
    longTriggered,
    shortTriggered,
    longPnL,
    shortPnL,
    longResult,
    shortResult,
  };
}
