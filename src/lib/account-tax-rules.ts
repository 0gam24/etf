/**
 * 계좌별 세금 규칙 (종목 사전 계좌별 세금 표·세후 계산기의 단일 출처).
 *
 * 값을 바꿀 때는 법령 조문을 다시 확인하고 asOf 와 각 출처 주소를 함께 고친다.
 * 2026-10-14 작성. 근거는 아래 SOURCES (law.go.kr 조문, 국세청 안내).
 */
export const TAX_RULES = {
  /** 마지막으로 법령을 대조한 날 */
  asOf: '2026-10-14',
  /** 배당소득 원천징수 (소득세 14% + 지방소득세 1.4%) */
  dividendTaxRate: 0.154,
  /** 금융소득 종합과세 기준 (이자·배당 합계, 연) */
  financialIncomeThreshold: 20_000_000,
  isa: {
    /** 의무 가입 기간 (년) */
    minYears: 3,
    /** 비과세 한도: 일반형 */
    taxFreeGeneral: 2_000_000,
    /** 비과세 한도: 서민형·농어민형 */
    taxFreeLowIncome: 4_000_000,
    /** 한도 초과분 분리과세 (지방소득세 포함) */
    excessRate: 0.099,
  },
  pension: {
    /** 연금 수령 시 연금소득세 (지방소득세 포함) */
    rateUnder70: 0.055,
    rate70to79: 0.044,
    rate80plus: 0.033,
    /** 연금 외 수령(중도 해지·인출) 시 기타소득세 */
    otherWithdrawalRate: 0.165,
    /** 사적연금 연간 수령액이 이 금액을 넘으면 종합과세 또는 16.5% 분리과세 선택 */
    separateTaxThreshold: 15_000_000,
  },
  /** IRP·DC 퇴직연금 위험자산 투자 한도 */
  retirementRiskAssetLimit: 0.7,
  /** 해외 상장 ETF 직접 투자 양도소득세 (지방소득세 포함)와 기본공제 — 비교 설명용 */
  overseasDirect: { rate: 0.22, basicDeduction: 2_500_000 },
} as const;

// 2026-10-14 law.go.kr 현행 조문으로 대조 (주소는 모두 응답 200 확인). 조문 본문은 자바스크립트로 열린다.
export const TAX_SOURCES = [
  { label: '소득세법 시행령 제26조의2 (국내주식형 ETF 범위, 과세표준에서 빠지는 국내 상장증권 차익)', url: 'https://www.law.go.kr/법령/소득세법시행령/제26조의2' },
  { label: '소득세법 시행규칙 제13조 (ETF 매매차익의 보유기간 과세)', url: 'https://www.law.go.kr/법령/소득세법시행규칙/제13조' },
  { label: '조세특례제한법 제91조의18 (중개형 ISA 비과세 한도·9% 분리과세·의무 가입 3년)', url: 'https://www.law.go.kr/법령/조세특례제한법/제91조의18' },
  { label: '소득세법 제129조 (원천징수세율: 배당소득 14%, 연금소득 3~5%, 연금 외 수령 15%)', url: 'https://www.law.go.kr/법령/소득세법/제129조' },
  { label: '소득세법 제14조 (금융소득 2,000만원 종합과세, 사적연금 1,500만원 분리과세 선택)', url: 'https://www.law.go.kr/법령/소득세법/제14조' },
  { label: '퇴직연금감독규정 제9조 (레버리지·인버스 ETF 편입 제한)', url: 'https://www.law.go.kr/행정규칙/퇴직연금감독규정/제9조' },
  { label: '근로자퇴직급여 보장법 시행규칙 제10조 (위험자산 70% 한도)', url: 'https://www.law.go.kr/법령/근로자퇴직급여보장법시행규칙/제10조' },
] as const;

/** 원 단위 금액을 '1,234만 5,600원' 꼴로 */
export function formatWon(won: number): string {
  const v = Math.round(won);
  if (Math.abs(v) < 10_000) return `${v.toLocaleString('ko-KR')}원`;
  const man = Math.floor(Math.abs(v) / 10_000);
  const rest = Math.abs(v) % 10_000;
  const sign = v < 0 ? '-' : '';
  return rest ? `${sign}${man.toLocaleString('ko-KR')}만 ${rest.toLocaleString('ko-KR')}원` : `${sign}${man.toLocaleString('ko-KR')}만원`;
}
