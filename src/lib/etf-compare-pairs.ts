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
    // 2026-09-30 사실 정정: KODEX 운용사를 미래에셋으로 잘못 적었다. KODEX는 삼성자산운용, TIGER는 미래에셋자산운용.
    //   근거: https://www.samsungfund.com/etf/product/view.do?id=2ETFN9 (KODEX 브랜드 운용사 사이트)
    //         https://investments.miraeasset.com/tigeretf/ko/product/search/detail/index.do?ksdFund=KR7458730009 (TIGER 브랜드 운용사 사이트)
    //         https://www.funetf.co.kr/product/etf/view/KR7091160002 (KODEX 운용사 삼성) · https://www.funetf.co.kr/product/etf/view/KR7091230003 (TIGER 운용사 미래에셋)
    context: 'KOSPI 200 지수를 추종하는 두 대표 ETF. KODEX는 삼성자산운용, TIGER는 미래에셋자산운용 상품으로 두 곳 모두 국내 대형 ETF 운용사.',
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
    // 2026-09-30 사실 정정: codeB 139270은 'TIGER 200 금융'이라 슬러그·설명과 무관했다. TIGER 반도체(091230)로 교체.
    //   두 상품 모두 기초지수 KRX 반도체, 상위 구성에 삼성전자·SK하이닉스 포함.
    //   근거: data/krx-etf-codes.json (091230 = TIGER 반도체, 139270 = TIGER 200 금융)
    //         https://www.funetf.co.kr/product/etf/view/KR7091230003 · https://www.funetf.co.kr/product/etf/view/KR7091160002
    codeA: '091160', codeB: '091230',
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
    // 2026-09-30 사실 정정: 두 상품이 'KRX 2차전지 지수'를 추종한다고 적었으나 기초지수가 서로 다르다.
    //   KODEX 2차전지산업 = FnGuide 2차전지 산업 지수, TIGER 2차전지테마 = WISE 2차전지 테마 지수.
    //   근거: https://www.funetf.co.kr/product/etf/view/KR7305720005 · https://www.funetf.co.kr/product/etf/view/KR7305540007
    //         https://comp.wisereport.co.kr/ETF/ETF.aspx?cn=&cmp_cd=305540 · http://www.fnindex.co.kr/overview/detail/I/FI00.WLT.SBI
    context: '기초지수가 다르다. KODEX는 FnGuide 2차전지 산업 지수, TIGER는 WISE 2차전지 테마 지수 추종.',
    searchIntent: '2차전지 ETF 비교',
  },
  {
    slug: 'sol-shipbuilding-top3plus-leverage-vs-kodex-shipbuilding',
    // 2026-09-30 사실 정정: 슬러그는 'kodex-shipbuilding'인데 codeB가 466920(SOL 조선TOP3플러스)라 제목·대상이 URL과 어긋났다.
    //   URL은 유지하고 대상을 KODEX 조선TOP10(0115D0)으로 맞춘다.
    //   근거: data/krx-etf-codes.json (0115D0 = KODEX 조선TOP10, 0080Y0 = SOL 조선TOP3플러스레버리지)
    //         https://www.funetf.co.kr/product/etf/view/KR70115D0001 (KRX 조선 TOP10 지수, 10종목)
    //         https://www.funetf.co.kr/product/etf/view/KR70080Y0007 (FnGuide 조선TOP3플러스지수 2배 레버리지)
    codeA: '0080Y0', codeB: '0115D0',
    context: '2배 레버리지(FnGuide 조선TOP3플러스)와 1배(KRX 조선 TOP10) 비교. 변동성·종목 집중도 차이.',
    searchIntent: '조선 ETF 비교',
  },
  // 환헷지 vs 비헷지 (같은 운용사)
  {
    slug: 'kodex-us-sp500-vs-kodex-us-sp500-h',
    // 2026-09-30 사실 정정: 슬러그와 설명은 환헷지(H) 비교인데 codeB 0041E0은 'KODEX 미국S&P500액티브'(비헤지 액티브)였다.
    //   슬러그 의도대로 KODEX 미국S&P500(H) 449180으로 교체.
    //   근거: data/krx-etf-codes.json (449180 = KODEX 미국S&P500(H), 0041E0 = KODEX 미국S&P500액티브)
    //         https://www.funetf.co.kr/product/etf/view/KR7449180009 (기초지수 S&P 500, 환헷지형)
    codeA: '379800', codeB: '449180',
    context: 'KODEX 미국 S&P500 비헷지 vs 환헷지(H). 환율 변동 영향 비교.',
    searchIntent: '미국 S&P500 환헷지 비교',
  },
  // 합성 vs 일반 (구조 차이)
  {
    slug: 'kodex-us-nasdaq100-vs-tiger-us-nasdaq100',
    // 2026-08-12 정정: 기존 0026S0은 '1Q 미국S&P500'(슬러그와 무관), 0040D0은 KRX에 없는 코드라
    // 이 페이지가 404로 렌더되고 있었다. 슬러그와 일치하는 실제 코드로 교체.
    codeA: '379810', codeB: '133690',
    context: 'KODEX vs TIGER 미국 나스닥100. 운용보수·합성 여부·환헷지 옵션.',
    searchIntent: '미국 나스닥100 ETF 비교',
  },
  // 월배당 vs 분기배당 (분배 주기)
  {
    slug: 'tiger-us-dividend-monthly-vs-kodex-us-dividend-djones',
    // 2026-08-12 정정: 0019B0은 KRX에 없는 코드였다. TIGER 미국배당다우존스(458730)로 교체.
    codeA: '458730', codeB: '489250',
    // 2026-09-30 사실 정정: '월배당 vs 분기배당'으로 적었으나 두 상품 모두 월분배다. 차이는 분배금 지급기준일
    //   (TIGER 매월 마지막 영업일, KODEX 매월 15일). 슬러그는 유지.
    //   근거: https://investments.miraeasset.com/tigeretf/ko/product/search/detail/index.do?ksdFund=KR7458730009
    //         https://samsungfundblog.com/archives/50696 · https://m.sedaily.com/NewsViewAmp/2DD013P30M
    context: '둘 다 월분배. 분배금 지급기준일이 TIGER는 매월 마지막 영업일, KODEX는 매월 15일로 다르다.',
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
