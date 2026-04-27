/**
 * 7️⃣ YmylGuard (금융 YMYL 검증)
 *   - 수익 보장·확정적 표현 차단
 *   - 특정 종목 매수/매도 직접 추천 차단
 *   - 급등주 "지금 매수" 유도 표현 차단 (Daily Pulse 핵심)
 *   - 메타 데이터(CPC/애드센스 등) 본문 노출 차단
 *   - 면책조항 자동 삽입
 */

const state = require('../pipeline/state_manager');
const logger = require('../pipeline/logger');
const AGENT_NAME = 'YmylGuard';

const BANNED_PHRASES = [
  // 수익 보장
  '수익을 보장', '원금 보장', '무조건 수익', '확실한 수익', '확정 수익',
  '무위험', '손해 없는', '100% 수익', '무조건 오른다', '반드시 오른다',
  // 직접 매수 권유
  '이것만 사면', '꼭 사야 할', '지금 바로 매수', '지금 당장 매수',
  '무조건 매수', '필수 매수', '묻지마 매수',
  // 수익 과장
  '대박', '폭등 예상', '급등 확실',
];

const META_WORDS = [
  '예상 CPC', '고단가', '타겟 독자', '포스팅 전략',
  '애드센스 수익', '키워드 단가', '검색량', '롱테일 키워드',
];

/**
 * 프론트엔드가 자동 부착하는 위험 신호 라벨 목록 (src/lib/surge.ts의 computeRiskLabels과 동기).
 * 본문에 이 용어가 등장하거나, surge/pulse 포스트에는 라벨 의미를 독자에게 설명하는 짧은 면책을 추가한다.
 */
const RISK_LABEL_TERMS = [
  '갭상승', '단기 과열', '강한 모멘텀', '거래량 폭발',
  '신고가', '추격 매수', '과열', '모멘텀',
];

const RISK_LABEL_DISCLAIMER = `
> **위험 신호 라벨 안내:** 이 글과 페이지 상단에 표시되는 "단기 과열 · 갭상승 추정 · 거래량 폭발" 등의 라벨은
> 당일 등락률·거래량 기준의 **중립적 관찰 지표**입니다. 매수 신호가 아니며, 추격 진입·단기 매매를 권하지 않습니다.
> 분할 진입·본인 목표 수익률·손절 기준을 먼저 세우신 뒤 참고 용도로만 활용하세요.
`;

const DISCLAIMER = `
---

> **⚠️ 투자자 유의사항**
>
> 본 콘텐츠는 투자 참고 자료로 작성된 것이며, **투자 권유를 목적으로 하지 않습니다.**
> 모든 투자 결정과 그에 따른 손익의 책임은 투자자 본인에게 있습니다.
> ETF·펀드 등 금융 상품에 대한 최종 판단 전, 반드시 **금융투자협회 전자공시(dart.fss.or.kr)** 및
> 해당 운용사의 공식 투자설명서를 확인하시기 바랍니다.
> 본 포스팅에 기재된 가격·등락률·거래량은 **공공데이터포털(data.go.kr)** 기준이며,
> 실시간 데이터와 차이가 있을 수 있습니다.
>
> *본 포스팅에는 제휴 마케팅 링크가 포함되어 있으며, 구매·계좌개설 시 일정 수수료를 받을 수 있습니다.*
>
> 📅 데이터 기준일: ${new Date().toLocaleDateString('ko-KR')} | 출처: KRX · 한국은행 · DART
`;

/**
 * 금지 표현 → 안전 대체 표현 자동 매핑.
 *   reject되기 전에 원문에 일괄 치환 시도. 통과율 ↑ + 수동 재작성 부담 ↓.
 */
const AUTO_REPLACE_MAP = [
  { pattern: /수익을 보장(?!하지|되지|할 수 없)/g, replacement: '수익이 안정적이라고 알려져' },
  { pattern: /원금 보장/g, replacement: '원금 보전이 강조되는 (단, 100% 보장은 아님)' },
  { pattern: /무조건 수익/g, replacement: '수익 가능성이 거론되는' },
  { pattern: /확실한 수익/g, replacement: '수익 기대가 높은' },
  { pattern: /확정 수익/g, replacement: '안정적 수익 추구' },
  { pattern: /무위험/g, replacement: '상대적으로 위험이 낮은' },
  { pattern: /손해 없는/g, replacement: '변동성이 낮은' },
  { pattern: /100% 수익/g, replacement: '높은 수익 가능성' },
  { pattern: /무조건 오른다/g, replacement: '상승 기대가 거론된다' },
  { pattern: /반드시 오른다/g, replacement: '상승 가능성이 거론된다' },
  { pattern: /이것만 사면/g, replacement: '관심 종목 중 하나로 거론되는' },
  { pattern: /꼭 사야 할/g, replacement: '주목받는' },
  { pattern: /지금 바로 매수/g, replacement: '관심 가질 만한 시점' },
  { pattern: /지금 당장 매수/g, replacement: '주목할 만한 시점' },
  { pattern: /무조건 매수/g, replacement: '진입을 검토할 수 있는' },
  { pattern: /필수 매수/g, replacement: '검토 가치 있는' },
  { pattern: /묻지마 매수/g, replacement: '단기 추격은 위험할 수 있는' },
  { pattern: /대박(?!이라고)/g, replacement: '큰 변동' },
  { pattern: /폭등 예상/g, replacement: '강한 상승 모멘텀이 거론' },
  { pattern: /급등 확실/g, replacement: '급등 가능성이 거론' },
];

/**
 * 자동 수정 시도 → 수정된 콘텐츠 + 수정 카운트 반환.
 *   `validateArticle` 전에 호출. 수정 후에도 issue 남으면 reject.
 */
function autoFixArticle(article) {
  let content = article.content;
  let fixed = 0;
  for (const { pattern, replacement } of AUTO_REPLACE_MAP) {
    const matches = content.match(pattern);
    if (matches) {
      content = content.replace(pattern, replacement);
      fixed += matches.length;
    }
  }
  return { ...article, content, _autoFixedCount: fixed };
}

function validateArticle(article) {
  const issues = [];

  for (const phrase of BANNED_PHRASES) {
    if (article.content.includes(phrase)) {
      const safePhrases = [
        `${phrase}하지 않습니다`,
        `${phrase}되지 않습니다`,
        `${phrase}할 수 없습니다`,
        `${phrase}하지 않으며`,
        `${phrase}하지 마세요`,
      ];
      const isSafe = safePhrases.some(safe => article.content.includes(safe));
      if (!isSafe) {
        issues.push({ type: 'BANNED_PHRASE', severity: 'critical', detail: `금지 표현: "${phrase}"` });
      }
    }
  }

  for (const word of META_WORDS) {
    if (article.content.includes(word)) {
      issues.push({ type: 'META_WORD_EXPOSED', severity: 'critical', detail: `메타 데이터 노출: "${word}"` });
    }
  }

  if (article.wordCount < 1500) {
    issues.push({ type: 'TOO_SHORT', severity: 'warning', detail: `짧음 (${article.wordCount}자, 최소 1500자)` });
  }

  if (!article.content.includes('FAQ') && !article.content.includes('질문')) {
    issues.push({ type: 'MISSING_FAQ', severity: 'warning', detail: 'FAQ 섹션 없음' });
  }

  // pulse·surge 템플릿은 3줄 요약 필수
  if (['pulse', 'surge'].includes(article.templateType)) {
    if (!/3줄/.test(article.content) && !/요약/.test(article.content)) {
      issues.push({ type: 'MISSING_SUMMARY', severity: 'warning', detail: '3줄 요약 섹션 없음' });
    }
  }

  return {
    passed: !issues.some(i => i.severity === 'critical'),
    issues,
  };
}

function addDisclaimer(article) {
  // surge/pulse 포스트이거나 본문에 위험 라벨 용어가 쓰인 경우, 추가 면책을 함께 부착.
  const usesRiskTerminology = RISK_LABEL_TERMS.some(t => article.content.includes(t));
  const isSurgeOrPulse = ['surge', 'pulse'].includes(article.templateType);
  const extraRiskBlock = (usesRiskTerminology || isSurgeOrPulse) ? RISK_LABEL_DISCLAIMER : '';
  return { ...article, content: article.content + extraRiskBlock + DISCLAIMER };
}

async function run({ today, previousResults }) {
  logger.log(AGENT_NAME, '🛡️  YMYL 검증 시작');
  const articles = previousResults?.LogicSpecialist?.articles || [];
  if (articles.length === 0) return { summary: '검증할 글 없음', verifiedArticles: [] };

  const verifiedArticles = [];
  const rejectedArticles = [];
  let blockedCount = 0;

  for (const article of articles) {
    // 1차: 자동 수정 시도 (금지 표현 안전 표현으로 일괄 치환)
    const autoFixed = autoFixArticle(article);
    if (autoFixed._autoFixedCount > 0) {
      logger.log(AGENT_NAME, `  🔧 [${article.keyword}] 자동 수정 ${autoFixed._autoFixedCount}건`);
    }

    // 2차: 수정 후 검증
    const result = validateArticle(autoFixed);
    if (!result.passed) {
      logger.error(AGENT_NAME, `⛔ 반려: "${article.keyword}" (자동수정 후에도 critical 잔존)`);
      const rejectionReasons = result.issues.map(i => i.detail).join(' / ');
      result.issues.forEach(i => logger.error(AGENT_NAME, `  └ ${i.detail}`));
      rejectedArticles.push({ keyword: article.keyword, reason: rejectionReasons });
      blockedCount++;
      continue;
    }
    if (result.issues.length > 0) {
      result.issues.forEach(i => logger.warn(AGENT_NAME, `  ⚠️ ${i.detail}`));
    }
    const withDisclaimer = addDisclaimer(autoFixed);
    verifiedArticles.push(withDisclaimer);
    state.saveData(AGENT_NAME, 'processed', `verified_${today}_${article.slug}.json`, withDisclaimer);
    logger.success(AGENT_NAME, `✅ "${article.keyword}" 통과 + 면책조항`);
  }

  logger.success(AGENT_NAME, `통과 ${verifiedArticles.length} / 차단 ${blockedCount}`);
  return {
    summary: `${verifiedArticles.length}개 통과, ${blockedCount}개 차단`,
    verifiedArticles,
    rejectedArticles,
  };
}

module.exports = { run, BANNED_PHRASES, autoFixArticle, validateArticle };
