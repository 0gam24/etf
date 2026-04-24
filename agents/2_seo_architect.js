/**
 * 2️⃣ SeoArchitect (ThemeSeoArchitect)
 *   - 오늘의 거래량 TOP10을 토대로 surge/flow/income/pulse 4종 포스팅 전략 생성
 *   - 섹터 자금흐름을 읽어 "어디로 자금이 몰리는가" 기획
 *   - 고단가 금융 키워드 DB로 CPC 극대화
 *
 *   출력:
 *     strategies[]: { id, category (surge|flow|income|pulse), templateType,
 *                     keyword, estimatedCpc, tickers[], suggestedTitle, suggestedSlug,
 *                     contentDirection }
 */

const state = require('../pipeline/state_manager');
const logger = require('../pipeline/logger');
const { getPortfolio, getTopHoldings, extractTopN } = require('./etf_portfolios');

const AGENT_NAME = 'SeoArchitect';

// ───── 섹터 → 고단가 키워드 매핑 ─────
const SECTOR_KEYWORDS = {
  '방산': { topic: '방위산업 ETF', modifiers: ['전망', '수주 이슈', '지정학 수혜'], cpc: 2100 },
  '조선': { topic: '조선 ETF', modifiers: ['슈퍼사이클', '수주 잔고', '대형 3사'], cpc: 2000 },
  'AI·데이터': { topic: 'AI ETF', modifiers: ['데이터센터 수혜', '엔비디아 공급망', '테마 ETF 추천'], cpc: 2200 },
  '반도체': { topic: '반도체 ETF', modifiers: ['HBM 수혜', 'KODEX vs TIGER 비교', '2026 전망'], cpc: 1900 },
  '커버드콜·월배당': { topic: '커버드콜 ETF', modifiers: ['월배당률 비교', '세후 수익률', '연금계좌 매수법'], cpc: 2500 },
  '해외주식': { topic: '미국 ETF', modifiers: ['S&P500 vs 나스닥100', '환헤지 선택 가이드', '환율 영향'], cpc: 1700 },
  '채권': { topic: '채권 ETF', modifiers: ['금리 인하 수혜', '장기채 매수 타이밍', '듀레이션 비교'], cpc: 1500 },
  '원자재·금': { topic: '금 ETF', modifiers: ['안전자산 비중', '달러 약세 수혜', '금 ETF TOP5'], cpc: 1400 },
  '2차전지': { topic: '2차전지 ETF', modifiers: ['수급 부담 해소', 'LG에너지솔루션 비중', '반등 타이밍'], cpc: 1600 },
  '국내주식': { topic: 'KODEX 200 ETF', modifiers: ['코스피 전망', '시총 상위 ETF', '연기금 매수'], cpc: 1200 },
  '기타': { topic: 'ETF 투자', modifiers: ['추천 포트폴리오', '투자 전략'], cpc: 1000 },
};

// ───── 계좌·제도 고단가 키워드 (income/account) ─────
const ACCOUNT_KEYWORDS = [
  { keyword: 'IRP에서 사기 좋은 커버드콜 ETF TOP5', cpc: 2600 },
  { keyword: 'ISA 계좌 필수 월배당 ETF 조합', cpc: 2400 },
  { keyword: '연금저축펀드 월배당 포트폴리오 완성', cpc: 2300 },
  { keyword: '퇴직연금 DC형 커버드콜 비중 전략', cpc: 2500 },
];

/**
 * surge 템플릿용 전략 생성 (거래량 1위 종목의 급등 사유 분석)
 */
function buildSurgeStrategy(etfData, today) {
  const top = etfData.byVolume?.[0] || etfData.etfList?.[0];
  if (!top) return null;
  const sectorMeta = SECTOR_KEYWORDS[top.sector] || SECTOR_KEYWORDS['기타'];
  const modifier = sectorMeta.modifiers[new Date().getDay() % sectorMeta.modifiers.length];
  const keyword = `${top.name} 급등 이유 — ${sectorMeta.topic} ${modifier}`;

  // ETF 구성종목·기초자산 DB 조회 (Phase A 샘플)
  const portfolio = getPortfolio(top.code);
  let holdings = [];
  let topN = 5;
  if (portfolio && portfolio.type === 'basket') {
    topN = extractTopN(portfolio.name) || 5;
    holdings = getTopHoldings(portfolio, topN);
  }

  return {
    id: `surge_${today}`,
    category: 'surge',
    templateType: 'surge',
    keyword,
    estimatedCpc: sectorMeta.cpc,
    tickers: [top.code],
    focusEtf: top,
    portfolio,        // 전체 포트폴리오 메타 (type·description·holdings 등)
    holdings,         // 표시용 상위 N개 구성종목 (basket일 때)
    topN,             // 사용된 N 값 (제품명 TOPN 또는 5)
    suggestedTitle: `${top.name}, 왜 오늘 거래량 1위인가 — ${sectorMeta.topic} ${modifier}`,
    suggestedSlug: slugify(`${top.code}-${top.name}-surge`),
    contentDirection: {
      template: 'surge',
      minWords: 2500,
      requiredSections: ['3줄 급등 요약', '거래량 데이터', '급등 사유 분석', 'ETF 구성종목 심층', '단기·중기 전망', 'FAQ'],
      dataFocus: 'etf-holdings',
    },
  };
}

/**
 * flow 템플릿용 전략 생성 (섹터별 자금 흐름 리포트)
 */
function buildFlowStrategy(etfData, today) {
  const topSectors = (etfData.sectorFlow || []).slice(0, 5);
  if (topSectors.length === 0) return null;
  const leadSector = topSectors[0];
  const keyword = `주간 자금 흐름 리포트 — ${leadSector.sector} 섹터 ${leadSector.avgChangeRate >= 0 ? '+' : ''}${leadSector.avgChangeRate}%`;

  return {
    id: `flow_${today}`,
    category: 'flow',
    templateType: 'flow',
    keyword,
    estimatedCpc: 1800,
    tickers: (etfData.byVolume || []).slice(0, 5).map(e => e.code),
    sectorFlow: topSectors,
    suggestedTitle: `이번 주 자금은 어디로? ${leadSector.sector} 섹터에 몰린 ${Math.round(leadSector.totalAmount / 1e8)}억 원`,
    suggestedSlug: slugify(`flow-${today}-${leadSector.sector}`),
    contentDirection: {
      template: 'flow',
      minWords: 2500,
      requiredSections: ['주간 Flow 요약', '섹터별 자금유입 표', '기관·외국인 수급', '다음 주 관전포인트', 'FAQ'],
      dataFocus: 'sector-rotation',
    },
  };
}

/**
 * income 템플릿용 전략 생성 (월배당·커버드콜)
 */
function buildIncomeStrategy(etfData, today) {
  const incomeEtfs = (etfData.etfList || []).filter(e => e.sector === '커버드콜·월배당');
  const focus = incomeEtfs[0] || etfData.etfList?.find(e => /배당/.test(e.name));
  const accountKw = ACCOUNT_KEYWORDS[new Date().getDate() % ACCOUNT_KEYWORDS.length];

  return {
    id: `income_${today}`,
    category: 'income',
    templateType: 'income',
    keyword: accountKw.keyword,
    estimatedCpc: accountKw.cpc,
    tickers: focus ? [focus.code] : [],
    focusEtf: focus,
    suggestedTitle: `${accountKw.keyword} — 실제 분배금·세후 수익률 계산`,
    suggestedSlug: slugify(`income-${today}-${focus?.code || 'dividend'}`),
    contentDirection: {
      template: 'income',
      minWords: 2800,
      requiredSections: ['월배당 요약', '분배금 계산 표', '세후 수익률 비교', 'IRP·ISA·연금저축 조합법', '주의사항', 'FAQ'],
      dataFocus: 'dividend-yield-tax',
    },
  };
}

/**
 * breaking 템플릿 — 거래량 TOP 1~3 각 종목당 1편씩 총 3편의 뉴스 기반 속보.
 *   각 포스트는 해당 ETF의 최신 뉴스 + 구성종목 + 시장 반응 + 투자자 관점 3000자+
 */
function buildBreakingStrategies(etfData, today) {
  const top3 = (etfData.byVolume || etfData.etfList || [])
    .slice()
    .sort((a, b) => (b.volume || 0) - (a.volume || 0))
    .slice(0, 3);
  if (top3.length === 0) return [];

  return top3.map((etf, idx) => {
    const sectorMeta = SECTOR_KEYWORDS[etf.sector] || SECTOR_KEYWORDS['기타'];
    const rank = idx + 1;
    const portfolio = getPortfolio(etf.code);
    const topN = portfolio ? (extractTopN(portfolio.name) || 5) : 5;
    const holdings = portfolio?.type === 'basket' ? getTopHoldings(portfolio, topN) : [];

    return {
      id: `breaking_${today}_${rank}`,
      category: 'breaking',
      templateType: 'breaking',
      rank,
      keyword: `${etf.name} 속보 — 오늘 ${etf.changeRate >= 0 ? '상승' : '하락'} ${Math.abs(etf.changeRate).toFixed(2)}% · 거래량 ${rank}위`,
      estimatedCpc: sectorMeta.cpc + 300, // 속보는 신선도 프리미엄
      tickers: [etf.code],
      focusEtf: etf,
      portfolio,
      holdings,
      topN,
      suggestedTitle: `[${today.slice(4, 6)}월 ${today.slice(6, 8)}일 속보] ${etf.name} — ${etf.changeRate >= 0 ? '상승' : '조정'} ${Math.abs(etf.changeRate).toFixed(2)}%, 왜 움직였나`,
      suggestedSlug: slugify(`breaking-${today}-${rank}-${etf.code}`),
      contentDirection: {
        template: 'breaking',
        minWords: 3000,
        requiredSections: [
          '3줄 속보 요약', '뉴스 헤드라인 스캔', '시세·거래량 데이터',
          '섹터·구성종목 연결', '시장 반응 해석', '투자자 관점 (4050)',
          '단기 전망 시나리오', 'FAQ',
        ],
        dataFocus: 'news-driven',
      },
    };
  });
}

/**
 * pulse 템플릿 — 오전 9시 "오늘의 관전포인트"
 */
function buildPulseStrategy(etfData, today) {
  const top3 = (etfData.byVolume || []).slice(0, 3);
  const leadSector = etfData.sectorFlow?.[0];
  const sectorFlow = (etfData.sectorFlow || []).slice(0, 5);
  const keyword = `${new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })} 오늘의 ETF 관전포인트`;

  return {
    id: `pulse_${today}`,
    category: 'pulse',
    templateType: 'pulse',
    keyword,
    estimatedCpc: 1500,
    tickers: top3.map(e => e.code),
    top3,
    leadSector,
    sectorFlow,
    suggestedTitle: `${keyword} — 거래량 1위 ${top3[0]?.name || ''} 외 2종목`,
    suggestedSlug: slugify(`pulse-${today}`),
    contentDirection: {
      template: 'pulse',
      minWords: 1800,
      requiredSections: ['3줄 관전포인트', '거래량 TOP3 요약', '섹터 흐름 한눈에 (4050 관점)', '오늘 체크할 뉴스·지표', 'FAQ'],
      dataFocus: 'daily-briefing',
    },
  };
}

function slugify(s) {
  return s
    .replace(/[^a-zA-Z0-9가-힣 -]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .slice(0, 80);
}

async function run({ today, previousResults }) {
  logger.log(AGENT_NAME, '🚀 Theme SEO 전략 수립');

  const etfData = previousResults?.DataMiner?.etfData;
  if (!etfData) {
    logger.warn(AGENT_NAME, 'DataMiner 데이터 없음');
    return { summary: '데이터 없음', strategies: [] };
  }

  const strategies = [
    buildPulseStrategy(etfData, today),
    buildSurgeStrategy(etfData, today),
    buildFlowStrategy(etfData, today),
    buildIncomeStrategy(etfData, today),
    ...buildBreakingStrategies(etfData, today),
  ].filter(Boolean);

  state.saveData(AGENT_NAME, 'keywords', `keywords_${today}.json`, { strategies });

  strategies.forEach((s, i) => {
    logger.log(AGENT_NAME, `  ${i + 1}. [${s.category}·CPC ${s.estimatedCpc}원] ${s.keyword}`);
  });
  logger.success(AGENT_NAME, `${strategies.length}개 전략 수립 완료`);

  return {
    summary: `${strategies.length}개 전략 (pulse/surge/flow/income), 최고 CPC ${Math.max(...strategies.map(s => s.estimatedCpc))}원`,
    strategies,
  };
}

module.exports = { run };
