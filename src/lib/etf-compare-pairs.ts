/**
 * /compare/{pair} 1:1 ETF 비교 페이지 시드.
 *
 *   pair slug 형식: `{slugA}-vs-{slugB}` (예: kodex-200-vs-tiger-200)
 *   사용자 검색 패턴: "KODEX 200 vs TIGER 200", "SCHD 한국판 비교" 등
 *
 *   초기 10쌍 (대표 동일 지수 페어). 검증 후 확장.
 */

export interface ComparePair {
  slug: string;        // URL slug (kebab-case, "-vs-" 분리)
  codeA: string;       // KRX shortcode
  codeB: string;
  /** 비교 컨텍스트 1줄 — 같은 기초자산의 다른 운용사 등 */
  context: string;
  /** 검색 의도 1줄 */
  searchIntent: string;
}

export const COMPARE_PAIRS: ComparePair[] = [
  // 같은 지수, 다른 운용사 (대표 페어)
  {
    slug: 'kodex-200-vs-tiger-200',
    codeA: '069500', codeB: '102110',
    context: 'KOSPI 200 지수를 추종하는 두 대표 ETF. KODEX(미래에셋)·TIGER(미래에셋) 모두 최대 운용사.',
    searchIntent: 'KOSPI 200 ETF 비교 검색',
  },
  {
    slug: 'kodex-us-dividend-djones-vs-ace-us-dividend-djones',
    codeA: '489250', codeB: '402970',
    context: 'Dow Jones US Dividend 100 지수를 추종하는 KODEX·ACE의 직접 비교.',
    searchIntent: 'SCHD 한국판 비교',
  },
  {
    slug: 'kodex-semiconductor-vs-tiger-semiconductor',
    codeA: '091160', codeB: '139270',
    context: 'KRX 반도체 지수 추종. 삼성전자·SK하이닉스 비중·총보수·거래량 비교.',
    searchIntent: '반도체 ETF 비교',
  },
  {
    slug: 'kodex-defense-top10-vs-plus-k-defense',
    codeA: '0080G0', codeB: '449450',
    context: '국내 방산 TOP10 vs PLUS K방산. 종목 구성·집중도 차이.',
    searchIntent: '방산 ETF 비교',
  },
  {
    slug: 'kodex-battery-vs-tiger-battery',
    codeA: '305720', codeB: '305540',
    context: 'KRX 2차전지 지수 추종. LG에너지솔루션·삼성SDI 비중·총보수.',
    searchIntent: '2차전지 ETF 비교',
  },
  {
    slug: 'sol-shipbuilding-top3plus-leverage-vs-kodex-shipbuilding',
    codeA: '0080Y0', codeB: '466920',
    context: 'SOL 조선TOP3 레버리지 vs 일반 조선 ETF. 변동성·기초자산 차이.',
    searchIntent: '조선 ETF 비교',
  },
  // 환헷지 vs 비헷지 (같은 운용사)
  {
    slug: 'kodex-us-sp500-vs-kodex-us-sp500-h',
    codeA: '379800', codeB: '0041E0',
    context: 'KODEX 미국 S&P500 비헷지 vs 환헷지(H). 환율 변동 영향 비교.',
    searchIntent: '미국 S&P500 환헷지 비교',
  },
  // 합성 vs 일반 (구조 차이)
  {
    slug: 'kodex-us-nasdaq100-vs-tiger-us-nasdaq100',
    codeA: '0026S0', codeB: '0040D0',
    context: 'KODEX vs TIGER 미국 나스닥100. 운용보수·합성 여부·환헷지 옵션.',
    searchIntent: '미국 나스닥100 ETF 비교',
  },
  // 월배당 vs 분기배당 (분배 주기)
  {
    slug: 'tiger-us-dividend-monthly-vs-kodex-us-dividend-djones',
    codeA: '0019B0', codeB: '489250',
    context: '미국 배당 ETF 월배당 vs 분기배당. 분배 주기·세후 수익률 비교.',
    searchIntent: '미국 배당 월배당 vs 분기',
  },
  // 인버스·레버리지 (변동성)
  {
    slug: 'kodex-200-vs-kodex-leverage',
    codeA: '069500', codeB: '122630',
    context: 'KODEX 200 일반 vs 레버리지(2배). 변동성·장기 보유 risk.',
    searchIntent: 'KOSPI 200 레버리지 비교',
  },
];

export function getComparePairBySlug(slug: string): ComparePair | null {
  return COMPARE_PAIRS.find(p => p.slug === slug) || null;
}
