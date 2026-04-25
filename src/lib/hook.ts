/**
 * 메인 페이지 Chapter 1 — "오늘의 단 한 문장" Hook 생성기.
 *
 * 데이터(거래량 1위 + 등락률 + 섹터)에서 1문장 카피를 만든다.
 * Gemini 호출 없이 템플릿 기반으로 안정적·결정적 결과를 생성.
 *
 * 입력값이 충분치 않으면 안전한 기본 카피로 폴백.
 */

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
): HookCopy {
  if (!topEtf || !topEtf.name) {
    return {
      line: '오늘 시장의 무게중심이 어디로 옮겨가는지, 함께 살펴봅니다.',
      caption: '매일 아침 9시 · KRX 공공데이터 기준',
    };
  }

  const change = typeof topEtf.changeRate === 'number' ? topEtf.changeRate : 0;
  const sector = topEtf.sector || '국내주식';
  const volStr = topEtf.volume ? `${formatVolume(topEtf.volume)}주의 거래량이 몰린 ` : '';
  const sign = change >= 0 ? '+' : '';
  const pct = change.toFixed(2);

  // 강세
  if (change > 2) {
    const variants = [
      `오늘은 ${topEtf.name}로 자금이 쏠렸습니다.`,
      `${sector} 섹터의 ${topEtf.name}이 시장의 중심을 가져갔습니다.`,
      `${topEtf.name}의 ${sign}${pct}%가 오늘 시장의 첫 번째 신호입니다.`,
    ];
    return {
      line: pickByDate(variants, baseDate),
      caption: `${volStr}${topEtf.name} · ${sign}${pct}% (KRX 기준)`,
    };
  }

  // 약세
  if (change < -2) {
    const variants = [
      `${topEtf.name}이 흔들린 자리, 자금은 어디로 옮겨갔을까요.`,
      `오늘 시장은 ${topEtf.name}의 조정으로 시작했습니다.`,
      `${sector} 섹터의 피로감이 ${topEtf.name}부터 드러났습니다.`,
    ];
    return {
      line: pickByDate(variants, baseDate),
      caption: `${volStr}${topEtf.name} · ${pct}% (KRX 기준)`,
    };
  }

  // 보합 또는 약한 등락
  const variants = [
    `${topEtf.name} 주변에 자금이 누적되고 있습니다.`,
    `오늘 시장은 ${topEtf.name}을 중심으로 관망세입니다.`,
    `${sector} 섹터에 모인 시선이 ${topEtf.name}에서 머뭅니다.`,
  ];
  return {
    line: pickByDate(variants, baseDate),
    caption: `${volStr}${topEtf.name} · ${sign}${pct}% (KRX 기준)`,
  };
}
