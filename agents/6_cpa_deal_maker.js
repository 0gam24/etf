/**
 * 6️⃣ CpaDealMaker (FinanceAffiliateMatcher)
 *   - 카테고리·템플릿별 고단가 금융 제휴 상품 매칭
 *   - 증권사 계좌개설(CPA), IRP/ISA/연금저축(CPA), 금융 도서(CPS)
 *
 *   실제 제휴 URL은 .env의 AFFILIATE_URL_* 로 오버라이드 가능
 *   (발급 전에는 placeholder "#")
 */

const state = require('../pipeline/state_manager');
const logger = require('../pipeline/logger');

const AGENT_NAME = 'CpaDealMaker';

const envUrl = (key, fallback = '#') => process.env[key] || fallback;

// 고단가 금융 제휴 상품 DB
const AFFILIATE_PRODUCTS = {
  // 오늘의 관전포인트: 폭넓은 종합 — 증권사 계좌개설 최우선
  pulse: [
    { id: 'pulse_mirae_account', name: '미래에셋증권 계좌개설', type: 'CPA', commission: 25000, category: '증권사', ctaText: '📊 오늘의 ETF 바로 매수하기 →', url: envUrl('AFFILIATE_URL_MIRAE') },
    { id: 'pulse_kb_account', name: 'KB증권 M-able 계좌개설', type: 'CPA', commission: 22000, category: '증권사', ctaText: '⚡ ETF 수수료 평생 무료 →', url: envUrl('AFFILIATE_URL_KB') },
    { id: 'pulse_toss_account', name: '토스증권 계좌개설', type: 'CPA', commission: 18000, category: '증권사', ctaText: '📱 ETF 간편 매수 →', url: envUrl('AFFILIATE_URL_TOSS') },
  ],

  // 급등 테마: 단기 매매·대형 증권사 유도
  surge: [
    { id: 'surge_samsung_account', name: '삼성증권 해외주식 계좌', type: 'CPA', commission: 30000, category: '증권사', ctaText: '🚀 글로벌 급등주 매매 →', url: envUrl('AFFILIATE_URL_SAMSUNG') },
    { id: 'surge_nh_account', name: 'NH투자증권 나무 계좌', type: 'CPA', commission: 25000, category: '증권사', ctaText: '🔥 국내 ETF 수수료 0원 →', url: envUrl('AFFILIATE_URL_NH') },
    { id: 'surge_theme_book', name: '테마주 투자 전략 (쿠팡)', type: 'CPS', commissionRate: 0.03, category: '도서', ctaText: '📚 테마 ETF 완벽 가이드 →', url: envUrl('AFFILIATE_URL_BOOK_THEME') },
  ],

  // 자금 흐름: 퀀트·전문 정보 유도
  flow: [
    { id: 'flow_shinhan_account', name: '신한투자증권 프라임 계좌', type: 'CPA', commission: 28000, category: '증권사', ctaText: '🌊 기관급 리서치 리포트 →', url: envUrl('AFFILIATE_URL_SHINHAN') },
    { id: 'flow_hana_account', name: '하나증권 계좌개설', type: 'CPA', commission: 20000, category: '증권사', ctaText: '📊 섹터 로테이션 매매 →', url: envUrl('AFFILIATE_URL_HANA') },
    { id: 'flow_book', name: '섹터 로테이션 투자법 (쿠팡)', type: 'CPS', commissionRate: 0.03, category: '도서', ctaText: '📘 자금 흐름 읽는 법 →', url: envUrl('AFFILIATE_URL_BOOK_FLOW') },
  ],

  // 월배당·커버드콜: IRP/ISA/연금저축 — 최고 CPC 채널
  income: [
    { id: 'income_nh_irp', name: 'NH투자증권 IRP 계좌', type: 'CPA', commission: 35000, category: '연금·IRP', ctaText: '💎 세액공제 148만 원 받기 →', url: envUrl('AFFILIATE_URL_NH_IRP') },
    { id: 'income_mirae_isa', name: '미래에셋 중개형 ISA', type: 'CPA', commission: 32000, category: 'ISA', ctaText: '🛡️ 배당 비과세 200만 원 →', url: envUrl('AFFILIATE_URL_MIRAE_ISA') },
    { id: 'income_kb_pension', name: 'KB증권 연금저축펀드', type: 'CPA', commission: 30000, category: '연금저축', ctaText: '🏦 세액공제 + 월배당 →', url: envUrl('AFFILIATE_URL_KB_PENSION') },
    { id: 'income_dividend_book', name: '배당 투자 완벽 가이드 (쿠팡)', type: 'CPS', commissionRate: 0.03, category: '도서', ctaText: '📖 월배당 포트폴리오 →', url: envUrl('AFFILIATE_URL_BOOK_DIV') },
  ],
};

function matchProducts(article) {
  const key = article.category; // pulse|surge|flow|income
  const products = AFFILIATE_PRODUCTS[key] || AFFILIATE_PRODUCTS.pulse;
  return [...products]
    .sort((a, b) => (b.commission || 0) - (a.commission || 0))
    .slice(0, 2);
}

async function run({ today, previousResults }) {
  logger.log(AGENT_NAME, '🤝 금융 제휴 상품 매칭');
  const articles = previousResults?.LogicSpecialist?.articles || [];
  if (articles.length === 0) return { summary: '매칭 건너뜀', affiliateMatches: [] };

  const affiliateMatches = [];
  for (const article of articles) {
    const matched = matchProducts(article);
    affiliateMatches.push({ articleSlug: article.slug, category: article.category, products: matched });
    logger.log(AGENT_NAME, `  🤝 [${article.category}] ${matched.length}개 (최고 ${matched[0]?.commission || 0}원)`);
  }

  state.saveData(AGENT_NAME, 'processed', `affiliate_matches_${today}.json`, affiliateMatches);
  logger.success(AGENT_NAME, `총 ${affiliateMatches.reduce((s, a) => s + a.products.length, 0)}개 제휴 상품 매칭`);
  return { summary: `${affiliateMatches.length}개 글에 제휴 상품 매칭`, affiliateMatches };
}

module.exports = { run };
