/**
 * 메인 페이지 Chapter 1 — "오늘의 단 한 문장" Hook 생성기.
 *
 * 데이터(거래량 1위 + 등락률 + 섹터)에서 1문장 카피를 만든다.
 * Gemini 호출 없이 템플릿 기반으로 안정적·결정적 결과를 생성.
 *
 * 입력값이 충분치 않으면 안전한 기본 카피로 폴백.
 *
 * 시간대별 caption 분기 (Phase 6-1):
 *   00:00~09:00 KST  → "🌙 장 시작 전 · 어제 마감 요약"
 *   09:00~15:30      → "🔴 장중 HH:MM"
 *   15:30~16:30      → "🟡 방금 마감 · 종가 확정 중"
 *   16:30~23:59      → "📅 오늘 종가"
 */

export type KstPhase = 'pre_open' | 'intraday' | 'closing' | 'post_close';

function getKstPhase(now: Date = new Date()): KstPhase {
  const kst = new Date(now.getTime() + 9 * 3600 * 1000);
  const minutes = kst.getUTCHours() * 60 + kst.getUTCMinutes();
  if (minutes < 9 * 60) return 'pre_open';                // 00:00 ~ 08:59
  if (minutes < 15 * 60 + 30) return 'intraday';           // 09:00 ~ 15:29
  if (minutes < 16 * 60 + 30) return 'closing';            // 15:30 ~ 16:29
  return 'post_close';                                      // 16:30 ~ 23:59
}

function getKstHm(now: Date = new Date()): string {
  const kst = new Date(now.getTime() + 9 * 3600 * 1000);
  return `${String(kst.getUTCHours()).padStart(2, '0')}:${String(kst.getUTCMinutes()).padStart(2, '0')}`;
}

function phaseLabel(phase: KstPhase, hm: string): string {
  switch (phase) {
    case 'pre_open':   return '🌙 장 시작 전 · 어제 마감';
    case 'intraday':   return `🔴 장중 ${hm}`;
    case 'closing':    return '🟡 방금 마감 · 종가 확정 중';
    case 'post_close': return '📅 오늘 종가';
  }
}

interface TopEtfLite {
  name: string;
  changeRate?: number;
  volume?: number;
  sector?: string;
}

export interface HookCopy {
  /** 메인 카피 (한 문장, 마침표 포함) */
  line: string;
  /** 보조 라벨 — 작은 세리프 부제. 출처/근거 한 줄. */
  caption: string;
}

function formatVolume(v: number): string {
  if (v >= 10000000) return `${(v / 10000000).toFixed(1)}천만`;
  if (v >= 10000) return `${Math.round(v / 10000)}만`;
  return v.toLocaleString();
}

function pickByDate(items: string[], baseDate?: string): string {
  if (!items.length) return '';
  const day = (() => {
    if (baseDate && /^\d{4}-?\d{2}-?\d{2}/.test(baseDate)) {
      return parseInt(baseDate.replace(/[-/]/g, '').slice(6, 8), 10) || 0;
    }
    return new Date().getDate();
  })();
  return items[day % items.length];
}

/**
 * 거래량 1위 ETF의 등락률·섹터·거래량을 묶어 1문장 Hook으로 변환.
 *
 *  - 강한 상승(>2%) → 신뢰·집중 어조
 *  - 강한 하락(<-2%) → 긴장·관전 어조
 *  - 보합 → 누적/관망 어조
 */
export function buildHookCopy(
  topEtf: TopEtfLite | null,
  baseDate?: string,
  now: Date = new Date(),
): HookCopy {
  const phase = getKstPhase(now);
  const hm = getKstHm(now);
  const prefix = phaseLabel(phase, hm);

  if (!topEtf || !topEtf.name) {
    return {
      line: '오늘 시장의 무게중심이 어디로 옮겨가는지, 함께 살펴봅니다.',
      caption: `${prefix} · KRX 공공데이터 기준`,
    };
  }

  const change = typeof topEtf.changeRate === 'number' ? topEtf.changeRate : 0;
  const sector = topEtf.sector || '국내주식';
  const volStr = topEtf.volume ? `${formatVolume(topEtf.volume)}주의 거래량이 몰린 ` : '';
  const sign = change >= 0 ? '+' : '';
  const pct = change.toFixed(2);

  // 강세
  if (change > 2) {
    const variants = phase === 'pre_open' ? [
      `어제 ${topEtf.name}로 자금이 쏠렸습니다.`,
      `${sector} 섹터의 ${topEtf.name}이 어제 시장의 중심이었습니다.`,
    ] : [
      `오늘은 ${topEtf.name}로 자금이 쏠렸습니다.`,
      `${sector} 섹터의 ${topEtf.name}이 시장의 중심을 가져갔습니다.`,
      `${topEtf.name}의 ${sign}${pct}%가 오늘 시장의 첫 번째 신호입니다.`,
    ];
    return {
      line: pickByDate(variants, baseDate),
      caption: `${prefix} · ${volStr}${topEtf.name} · ${sign}${pct}%`,
    };
  }

  // 약세
  if (change < -2) {
    const variants = phase === 'pre_open' ? [
      `어제 ${topEtf.name}이 흔들린 자리, 오늘 자금은 어디로 옮겨갈까요.`,
      `${sector} 섹터의 피로감이 어제 ${topEtf.name}부터 드러났습니다.`,
    ] : [
      `${topEtf.name}이 흔들린 자리, 자금은 어디로 옮겨갔을까요.`,
      `오늘 시장은 ${topEtf.name}의 조정으로 시작했습니다.`,
      `${sector} 섹터의 피로감이 ${topEtf.name}부터 드러났습니다.`,
    ];
    return {
      line: pickByDate(variants, baseDate),
      caption: `${prefix} · ${volStr}${topEtf.name} · ${pct}%`,
    };
  }

  // 보합 또는 약한 등락
  const variants = phase === 'pre_open' ? [
    `어제 ${topEtf.name} 주변에 자금이 누적되었습니다.`,
    `${sector} 섹터에 모인 시선이 어제 ${topEtf.name}에서 머물렀습니다.`,
  ] : [
    `${topEtf.name} 주변에 자금이 누적되고 있습니다.`,
    `오늘 시장은 ${topEtf.name}을 중심으로 관망세입니다.`,
    `${sector} 섹터에 모인 시선이 ${topEtf.name}에서 머뭅니다.`,
  ];
  return {
    line: pickByDate(variants, baseDate),
    caption: `${prefix} · ${volStr}${topEtf.name} · ${sign}${pct}%`,
  };
}
