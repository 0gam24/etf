/**
 * ETF 구성종목·기초자산 DB (Phase A · 샘플)
 *
 *   타입:
 *     basket        — 주식 바스켓형 (구성종목 표)
 *     single-option — 단일 종목 + 옵션 전략 (커버드콜 등)
 *     futures       — 선물·파생 기초자산 (미국채 선물 등)
 *
 *   비중은 운용사 공식 PDP(Portfolio Deposit File) 기준 근사치.
 *   Phase B(향후)에서 공공데이터포털 ETF PDF API로 실시간 교체 예정.
 *   출처: 각 운용사 상품 공시 페이지 (2025~2026 기준)
 *
 *   ⚠️ 코드 시스템 주의:
 *     - 이 파일은 **KRX 종목코드 6자리 (449450, 466920 등)** 를 키로 사용.
 *     - 프론트엔드 캐시 data/holdings/{code}.json은 공공데이터포털 **이슈코드 (0080G0 등)** 를 키로 사용.
 *     - 같은 ETF라도 두 시스템에서 키가 다름. lib/data.ts의 getEtfHoldings()가 양쪽을 모두 조회해 매칭.
 *     - 가능하면 각 엔트리에 issueCode 필드(data.go.kr 코드)를 함께 기재해 매칭 정확도를 높이세요.
 */

const PORTFOLIOS = {
  // ───── 방산 ─────
  // KRX 공식 단축코드 = 0080G0 (구 키 '449450'은 PLUS K방산이라 수정)
  '0080G0': {
    type: 'basket',
    name: 'KODEX 방산TOP10',
    updated: '2026-Q1',
    source: 'Mirae Asset KODEX PDP',
    desc: '국내 방위산업 대표 10개 기업에 동일 비중 가까이 투자',
    holdings: [
      { rank: 1, name: '한화에어로스페이스', code: '012450', weight: 18.4, note: '🎯 대장주 · K9자주포·누리호' },
      { rank: 2, name: 'LIG넥스원',        code: '079550', weight: 14.2, note: '🔥 미사일·유도무기' },
      { rank: 3, name: '한화시스템',       code: '272210', weight: 12.1, note: '레이더·방산 IT' },
      { rank: 4, name: '현대로템',         code: '064350', weight: 10.8, note: 'K2 전차·철도' },
      { rank: 5, name: '한국항공우주',     code: '047810', weight:  9.5, note: 'KAI · FA-50 수출' },
      { rank: 6, name: '풍산',             code: '103140', weight:  8.2, note: '탄약·구리' },
      { rank: 7, name: '한화오션',         code: '042660', weight:  7.6, note: '군함·잠수함' },
      { rank: 8, name: 'SNT다이내믹스',    code: '003570', weight:  6.4, note: '자주포 장갑' },
      { rank: 9, name: '빅텍',             code: '065450', weight:  5.5, note: '군용 통신장비' },
      { rank: 10, name: '휴니드테크놀러지스', code: '005870', weight:  4.3, note: '국방 IT 시스템' },
    ],
  },

  // ───── 조선 ─────
  // KRX 공식 단축코드 = 0080Y0 (구 키 '466920'은 SOL 조선TOP3플러스 다른 종목)
  '0080Y0': {
    type: 'basket',
    name: 'SOL 조선TOP3플러스레버리지',
    updated: '2026-Q1',
    source: 'Shinhan SOL PDP',
    desc: '국내 조선업 빅3 레버리지 (시세 변동 1.5~2배)',
    holdings: [
      { rank: 1, name: 'HD현대중공업', code: '329180', weight: 39.8, note: '🎯 대장주 · LNG선' },
      { rank: 2, name: '한화오션',     code: '042660', weight: 34.5, note: '🔥 군함·수소 선박' },
      { rank: 3, name: '삼성중공업',   code: '010140', weight: 25.7, note: '해양플랜트' },
    ],
  },

  // ───── 커버드콜 (단일 종목 + 옵션) ─────
  // KRX 공식 단축코드 = 0040Y0 (구 키 '487350'은 KRX 미등록)
  '0040Y0': {
    type: 'single-option',
    name: 'SOL 팔란티어커버드콜OTM채권혼합',
    updated: '2026-Q1',
    source: 'Shinhan SOL PDP',
    underlying: { name: '팔란티어 테크놀로지스', code: 'PLTR (미국)', weight: 70, note: 'AI 데이터분석 플랫폼' },
    strategy: {
      name: 'OTM 콜옵션 매도 커버드콜 + 채권 혼합',
      description: '팔란티어 현물 70% 보유 + 행사가 10~15% 이상 OTM 콜옵션 매도로 옵션 프리미엄 수익 창출. 채권 혼합으로 변동성 완화.',
      distribution: '월 분배 (연 환산 12~15% 수준 목표)',
      risk: '팔란티어 주가 급등 시 상승분 제한 · 급락 시 기초자산 하락 동반',
    },
  },

  // ───── 국내 대형주 지수 ─────
  '069500': {
    type: 'basket',
    name: 'KODEX 200',
    updated: '2026-Q1',
    source: 'Mirae Asset KODEX PDP',
    desc: 'KOSPI 200 지수 추종 — 국내 대형주 시가총액 상위 200개',
    holdings: [
      { rank: 1, name: '삼성전자',       code: '005930', weight: 26.4, note: '🎯 대장주' },
      { rank: 2, name: 'SK하이닉스',     code: '000660', weight: 10.2, note: 'HBM 수혜' },
      { rank: 3, name: 'LG에너지솔루션', code: '373220', weight:  4.1, note: '2차전지' },
      { rank: 4, name: '삼성바이오로직스', code: '207940', weight: 3.4, note: '바이오 CDMO' },
      { rank: 5, name: '현대차',         code: '005380', weight:  2.9, note: '완성차' },
    ],
    note: '지수 내 전체 종목 200개 중 시가총액 상위 5개만 표시. 실제 구성종목은 정기 리밸런싱으로 조정.',
  },

  // ───── 미국 배당 ─────
  // KRX 공식 단축코드 = 489250 (구 키 '448290'은 TIGER 미국S&P500(H)로 다른 종목)
  '489250': {
    type: 'basket',
    name: 'KODEX 미국배당다우존스',
    updated: '2026-Q1',
    source: 'Mirae Asset KODEX PDP',
    desc: 'Dow Jones US Dividend 100 지수 추종 — 고배당 우량주 100개',
    holdings: [
      { rank: 1, name: 'Home Depot',           code: 'HD',   weight: 4.3, note: '🎯 소매 대장' },
      { rank: 2, name: 'Texas Instruments',    code: 'TXN',  weight: 4.1, note: '반도체 배당' },
      { rank: 3, name: 'Cisco Systems',        code: 'CSCO', weight: 4.0, note: '네트워크' },
      { rank: 4, name: 'AbbVie',               code: 'ABBV', weight: 3.9, note: '제약 배당' },
      { rank: 5, name: 'Coca-Cola',            code: 'KO',   weight: 3.8, note: '🔥 배당귀족' },
    ],
    note: '지수 내 100개 중 비중 상위 5개. 배당수익률 3~4% 수준.',
  },

  // KRX 공식 단축코드 = 402970 (구 키 '411060'은 ACE KRX금현물로 다른 종목)
  '402970': {
    type: 'basket',
    name: 'ACE 미국배당다우존스',
    updated: '2026-Q1',
    source: 'Hanwha ACE PDP',
    desc: 'Dow Jones US Dividend 100 지수 추종 (동일 지수, 운용사만 다름)',
    holdings: [
      { rank: 1, name: 'Home Depot',           code: 'HD',   weight: 4.2, note: '🎯 소매 대장' },
      { rank: 2, name: 'Texas Instruments',    code: 'TXN',  weight: 4.0, note: '반도체 배당' },
      { rank: 3, name: 'Cisco Systems',        code: 'CSCO', weight: 3.9, note: '네트워크' },
      { rank: 4, name: 'AbbVie',               code: 'ABBV', weight: 3.9, note: '제약 배당' },
      { rank: 5, name: 'Coca-Cola',            code: 'KO',   weight: 3.7, note: '🔥 배당귀족' },
    ],
    note: '지수 내 100개 중 비중 상위 5개. KODEX 시리즈 대비 낮은 총보수.',
  },

  // 구 키 '379800' KODEX 미국S&P500TR · '261240' KODEX 미국채울트라30년선물(H) 제거 — 현재 KRX 등록부에 미존재 (delisted 또는 명칭 변경).
  // 필요 시 KRX 공식 등록부 확인 후 정확한 shortcode로 재등록.

  // ───── 2차전지 ─────
  '305720': {
    type: 'basket',
    name: 'KODEX 2차전지산업',
    updated: '2026-Q1',
    source: 'Mirae Asset KODEX PDP',
    desc: 'KRX 2차전지 TOP10 지수 추종 — 배터리·소재 대표 기업',
    holdings: [
      { rank: 1, name: 'LG에너지솔루션', code: '373220', weight: 20.5, note: '🎯 대장주 · 셀 1위' },
      { rank: 2, name: '포스코퓨처엠',   code: '003670', weight: 15.1, note: '양극재' },
      { rank: 3, name: '삼성SDI',        code: '006400', weight: 12.3, note: '🔥 원통형 배터리' },
      { rank: 4, name: 'LG화학',         code: '051910', weight: 10.8, note: '소재·모회사' },
      { rank: 5, name: '에코프로비엠',   code: '247540', weight:  8.6, note: '양극재' },
    ],
    note: 'TOP10 지수 추종이나 시가총액 상위 5개 기업에 50% 이상 집중.',
  },

  // ───── 반도체 ─────
  '091160': {
    type: 'basket',
    name: 'KODEX 반도체',
    updated: '2026-Q1',
    source: 'Mirae Asset KODEX PDP',
    desc: 'KRX 반도체 지수 추종 — 반도체·장비 대표 기업',
    holdings: [
      { rank: 1, name: '삼성전자',       code: '005930', weight: 22.4, note: '🎯 대장주 · HBM·파운드리' },
      { rank: 2, name: 'SK하이닉스',     code: '000660', weight: 18.1, note: '🔥 HBM 선두' },
      { rank: 3, name: '한미반도체',     code: '042700', weight:  8.3, note: 'TC본더 · HBM 수혜' },
      { rank: 4, name: 'DB하이텍',       code: '000990', weight:  5.2, note: '파운드리 중형' },
      { rank: 5, name: '리노공업',       code: '058470', weight:  4.1, note: '테스트 핀' },
    ],
    note: '지수 내 30여 개 중 상위 5개. 상위 2개가 전체의 40% 이상.',
  },
};

/**
 * 제품명에서 "TOP N" 숫자 추출
 * KODEX 방산TOP10 → 10 / SOL 조선TOP3 → 3 / KODEX 반도체 → null
 */
function extractTopN(name) {
  if (!name) return null;
  const m = String(name).match(/TOP\s*(\d+)/i);
  return m ? parseInt(m[1], 10) : null;
}

/**
 * ETF 코드로 포트폴리오 반환. 없으면 null.
 * @param {string} code
 * @returns {object|null}
 */
function getPortfolio(code) {
  return PORTFOLIOS[code] || null;
}

/**
 * holdings 중 상위 N개 반환. N은 다음 순서로 결정:
 *   1) 명시적 override
 *   2) 제품명의 TOPN
 *   3) 기본 5개
 */
function getTopHoldings(portfolio, override) {
  if (!portfolio || portfolio.type !== 'basket') return [];
  const nameN = extractTopN(portfolio.name);
  const n = override || nameN || 5;
  return portfolio.holdings.slice(0, Math.min(n, portfolio.holdings.length));
}

module.exports = { PORTFOLIOS, getPortfolio, getTopHoldings, extractTopN };
