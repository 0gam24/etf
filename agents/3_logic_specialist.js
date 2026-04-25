/**
 * 3️⃣ LogicSpecialist (PulseAnalyst)
 *   - Gemini 2.5 Flash로 카테고리별 4종 템플릿 분기 작성
 *     · pulse  : 오늘의 관전포인트 (3줄 요약 중심)
 *     · surge  : 거래량 1위 ETF 급등 사유 분석
 *     · flow   : 섹터별 자금 흐름 리포트 (SEO 테이블 필수)
 *     · income : 커버드콜·월배당 실제 분배금 계산
 *
 *   rejectionFeedback: YmylGuard 반려 사유를 프롬프트에 주입해 자율 재작성
 */

const state = require('../pipeline/state_manager');
const logger = require('../pipeline/logger');

const AGENT_NAME = 'LogicSpecialist';

// 모델 우선순위: 환경변수 > flash-lite > flash.
// flash는 무료 티어 하루 20건 제한이 매우 빡빡해서 flash-lite를 우선 사용.
const MODELS = [
  process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
];

async function callGeminiWithRetry(apiKey, prompt, { maxRetries = 2, baseDelayMs = 8000 } = {}) {
  let lastStatus = 0;
  let lastError = '';
  for (let modelIdx = 0; modelIdx < MODELS.length; modelIdx++) {
    const model = MODELS[modelIdx];
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
          }),
        },
      );
      if (response.ok) {
        if (modelIdx > 0) logger.log(AGENT_NAME, `🔀 ${model}(폴백 모델)로 전환 성공`);
        return { ok: true, result: await response.json(), model };
      }
      lastStatus = response.status;
      try {
        const err = await response.json();
        lastError = err?.error?.message || err?.error?.status || JSON.stringify(err).slice(0, 200);
      } catch { lastError = '(body parse failed)'; }

      // 429(rate limit) · 503(overloaded)만 재시도. 4xx 다른 오류는 즉시 다음 모델로.
      if (response.status !== 429 && response.status !== 503) break;
      if (attempt === maxRetries) break;
      const wait = baseDelayMs * Math.pow(2, attempt);
      logger.warn(AGENT_NAME, `⏳ ${model} ${response.status}: ${lastError.slice(0, 80)} — ${wait / 1000}s 후 재시도 (${attempt + 1}/${maxRetries})`);
      await new Promise(r => setTimeout(r, wait));
    }
    if (modelIdx < MODELS.length - 1) {
      logger.warn(AGENT_NAME, `↩️ ${model} 실패 (${lastStatus}) — 다음 모델로 전환`);
    }
  }
  return { ok: false, status: lastStatus, error: lastError };
}

async function generateArticle(strategy, context, rejectionFeedback = null) {
  logger.log(AGENT_NAME, `✍️ [${strategy.category}] "${strategy.keyword}"`);
  if (rejectionFeedback) logger.warn(AGENT_NAME, `🔄 반려 피드백 반영: ${rejectionFeedback.slice(0, 100)}...`);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    logger.warn(AGENT_NAME, 'GEMINI_API_KEY 미설정 → 샘플 글 생성');
    return buildSampleArticle(strategy, context);
  }

  try {
    const prompt = buildPrompt(strategy, context, rejectionFeedback);
    const { ok, result, status, error, model } = await callGeminiWithRetry(apiKey, prompt);
    if (!ok) {
      logger.error(AGENT_NAME, `Gemini 오류 ${status} (${error?.slice(0, 120) || 'no body'}) — 샘플 폴백`);
      return buildSampleArticle(strategy, context);
    }
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return buildSampleArticle(strategy, context);

    return {
      keyword: strategy.keyword,
      title: strategy.suggestedTitle,
      slug: strategy.suggestedSlug,
      category: strategy.category,
      templateType: strategy.templateType,
      tickers: strategy.tickers || [],
      content: text,
      wordCount: text.length,
      generatedBy: model || 'gemini',
    };
  } catch (err) {
    logger.error(AGENT_NAME, `API 실패: ${err.message}`);
    return buildSampleArticle(strategy, context);
  }
}

// ───── 프롬프트 빌더 ─────
function buildPrompt(strategy, context, rejectionFeedback) {
  const { economicData, news } = context;
  const today = new Date().toLocaleDateString('ko-KR');
  const ind = economicData?.indicators || {};

  const feedbackBlock = rejectionFeedback ? `
===================================================
🚨 [긴급: 이전 작성본 YMYL 반려]
사유: "${rejectionFeedback}"
위 지적을 완전히 수정하여 재작성하세요.
===================================================
` : '';

  const personaBlock = `
당신은 10년 차 ETF 애널리스트로, 4050 세대 개인 투자자에게 '오늘 시장의 맥락'을 전달합니다.
톤: 전문적이되 친근하게, 데이터와 근거 중심. 과장 금지.
`;

  const commonRules = `
## 🚫 필수 금지 표현
"수익 보장", "원금 보장", "무조건 수익", "100% 수익", "지금 바로 매수" 같은 긍정·확정 표현 절대 금지.
부정문 면책조항("보장하지 않습니다")은 허용.

## 🚫 메타 데이터 노출 금지
"CPC", "고단가", "타겟독자", "포스팅 전략", "검색량", "애드센스" — 본문에 절대 쓰지 마세요.

## 📐 포맷 규칙
- Markdown. H1 쓰지 말 것 (시스템이 자동 삽입).
- 섹션 시작은 반드시 ## (H2).
- 비교 데이터는 반드시 **표**로 정리 (프론트에서 자동 렌더링).
- 중요 문장은 **볼드**.
- FAQ는 \`**Q1: 질문**\` 줄 → 빈 줄 → 답변 형식.

## 🖼️ 본문 이미지 금지
본문에 \`![](...)\` 마크다운 이미지를 절대 넣지 마세요.
- OG 이미지(\`/api/og?...\`)는 SNS 미리보기용으로 \`<head>\` 메타 태그에만 사용됩니다.
- 본문에 박으면 1200x630 거대한 빈 카드가 페이지 한가운데에 노출되어 시청자 경험을 훼손합니다.
- 외부 이미지 서비스(stock.adobe/Unsplash/pollinations 등) URL도 일절 금지.
- 시각 데이터가 필요하면 frontmatter \`charts\` 필드만 사용하세요. 본문에는 표(\`|\`)와 텍스트만.
`;

  // ── 템플릿별 분기 ──
  const tmpl = strategy.templateType;
  let templateBlock = '';

  if (tmpl === 'pulse') {
    const top3 = strategy.top3 || [];
    const sectorFlow = strategy.sectorFlow || [];
    templateBlock = `
## 작성 목표: 오늘의 ETF 관전포인트 (일일 브리핑 · 4050 은퇴 준비 세대 맞춤)

**타겟 독자의 니치 니즈 (반드시 반영):**
- 은퇴 자산의 안정성·배당 현금흐름 중시
- 연금저축·IRP·ISA 계좌의 세후 수익률 우선
- 단기 급등주 추종보다 포트폴리오 재점검 프레임
- "내 자산에 지금 필요한 행동"이 무엇인지 즉시 알고 싶어함

**오늘(${today}) 거래량 TOP3:**
${top3.map((e, i) => `${i + 1}. ${e.name} (${e.code}) · ${e.price.toLocaleString()}원 · ${e.changeRate >= 0 ? '+' : ''}${e.changeRate}% · 거래량 ${(e.volume / 10000).toFixed(0)}만주 · 섹터: ${e.sector}`).join('\n')}

**섹터 리더:** ${strategy.leadSector?.sector || '-'} (평균 ${strategy.leadSector?.avgChangeRate >= 0 ? '+' : ''}${strategy.leadSector?.avgChangeRate || 0}%)

**섹터별 평균 등락률 (상위 5):**
${sectorFlow.map(x => `- ${x.sector}: ${x.avgChangeRate >= 0 ? '+' : ''}${x.avgChangeRate}% (거래대금 ${Math.round(x.totalAmount / 1e8).toLocaleString()}억)`).join('\n')}

**거시:** 기준금리 ${ind.baseRate || '-'}% · 환율 ${ind.exchangeRate || '-'}원

## 구성 (최소 1800자)
1. ## 오늘의 3줄 관전포인트
   ⚠️ **이 섹션은 프론트엔드가 자동 추출합니다** — 다음 규칙을 반드시 지키세요:
   - 섹션 제목은 정확히 \`## 오늘의 3줄 관전포인트\`
   - 바로 아래에 \`- \`로 시작하는 불릿 **정확히 3개** (2개·4개 금지)
   - 각 불릿은 한 문장, 50~70자 사이
   - 불릿 형식: \`- **라벨**: 내용 문장.\` (라벨은 2~4글자 · 예: "거래량 1위", "섹터 리더", "체크 포인트")
   - 불릿끼리 줄바꿈만으로 연속 (중간에 빈 줄·하위 불릿·설명 문장 금지)
   - "내 자산에 미치는 영향" 관점 — 추상 조언 금지
   - 좋은 예:
     \`\`\`
     ## 오늘의 3줄 관전포인트
     - **거래량 1위**: KODEX 방산TOP10이 +4.47%로 수급 쏠림 관찰.
     - **섹터 리더**: 조선 평균 +11.87%로 자금이 집중됩니다.
     - **체크 포인트**: 변동성 대비 분할 매수 원칙을 유지하세요.
     \`\`\`
   이 규칙을 어기면 홈 히어로·타임라인·시나리오 라우터에서 텍스트가 잘못 표시됩니다.
2. ## 거래량 TOP3 완벽 해설 (표 + 종목별 한 문단, 해당 종목이 4050 포트폴리오에 적합한지 언급)
3. ## 섹터 흐름 한눈에 (4050 투자자 관점) — **반드시 섹터별 표를 포함하고, 마지막 컬럼에 "내 포트폴리오에 적용할 행동"을 1줄로 적을 것** (예: "분산 리밸런싱 검토", "ISA 한도로 매수 기회", "분배금 일정 확인" 등)
4. ## 오늘 가장 유용한 액션 3가지 (보유 확인 / 비중 조정 / 분배금·세액공제 한도 점검 같이 구체 행동)
5. ## 오늘 체크할 뉴스·지표 (미국 증시·환율·공시·본인 계좌 잔액 등 개인화 요소 포함)
6. ## 자주 묻는 질문 (FAQ 3개)

**중요:** 추상적 조언("중요합니다", "주의하세요") 금지. 항상 **데이터 + 구체 계좌·한도·일정**을 연결하는 문장으로 작성.
`;
  } else if (tmpl === 'surge') {
    const e = strategy.focusEtf;
    const portfolio = strategy.portfolio;
    const holdings = strategy.holdings || [];
    const topN = strategy.topN || 5;

    let holdingsBlock = '';
    let section4Instruction = '';

    if (portfolio?.type === 'basket') {
      holdingsBlock = `**${portfolio.name}이(가) 담고 있는 구성종목 (비중 상위 ${topN}):**
${holdings.map(h => `${h.rank}. ${h.name} (${h.code}) · 비중 ${h.weight}% · ${h.note || ''}`).join('\n')}
자료: ${portfolio.source} · ${portfolio.updated}`;

      section4Instruction = `4. ## ${portfolio.name}이(가) 담은 ${portfolio.holdings.length}개 기업 TOP ${topN}
   — 반드시 아래 기업들을 표로 나열하세요. 컬럼: 순위 / 기업명 / 코드 / 비중 / 포인트(대장주·수혜·배당귀족·수출 수혜 등 태그). 표 다음에 "상위 1~3위 집중도", "내 계좌 중복 편입 점검", "매수 타이밍(실적·수주 공시 전 분할 매수)" 관점의 **구체 액션 문장 3개**. 실제 기업명·비중·특성으로 서술, 일반론 금지.`;
    } else if (portfolio?.type === 'single-option') {
      const u = portfolio.underlying || {};
      const strat = portfolio.strategy || {};
      holdingsBlock = `**${portfolio.name}의 기초자산·전략:**
- 기초자산: ${u.name} (${u.code}) · 비중 ${u.weight}% · ${u.note}
- 옵션 전략: ${strat.name} — ${strat.description}
- 분배: ${strat.distribution}
- 리스크: ${strat.risk}`;

      section4Instruction = `4. ## ${portfolio.name}이(가) 실제로 담은 것
   — "여러 기업 바스켓이 아니라 단일 기초자산 + 옵션 전략"임을 표로 정리. 컬럼: 구분 / 내용 (기초자산·성격·옵션 전략·전략 설명·분배 정책·주요 리스크 6행). 표 다음에 "상승분 제한 트레이드오프", "횡보장 현금흐름 장점", "기초자산 집중 리스크" 관점 액션 문장 3개. 커버드콜 OTM 구조를 독자가 이해할 수 있게 짧게 해설.`;
    } else if (portfolio?.type === 'futures') {
      const u = portfolio.underlying || {};
      holdingsBlock = `**${portfolio.name}의 기초자산·민감도:**
- 기초자산: ${u.name}
- 설명: ${u.desc}
- 환헤지: ${portfolio.hedge}
- 민감도:
${(portfolio.sensitivities || []).map(s => `  · ${s.factor} → ${s.impact}`).join('\n')}`;

      section4Instruction = `4. ## ${portfolio.name}이(가) 실제로 담은 것
   — "주식 바스켓이 아니라 선물 기초자산"임을 명확히. 기초자산 표(구분/내용 3~4행) + 수익·손실 민감도 표(요인/영향 4행). 표 다음에 "금리 방향 핵심", "주식 포지션 변동성 헤지 용도", "연금·IRP 계좌 세금 최적화" 관점 액션 문장 3개.`;
    } else {
      holdingsBlock = `**구성종목 데이터 미확보:** 운용사 공식 PDP 확인을 권고하는 방향으로 서술.`;
      section4Instruction = `4. ## 이 ETF가 담고 있는 것
   — 구성종목 공시 데이터가 부족하니 운용사 공식 PDP 확인을 권고하고, 일반적 점검 포인트(상위 비중 집중도·계좌 중복 편입·총보수) 3가지를 액션 문장으로.`;
    }

    templateBlock = `
## 작성 목표: 거래량 1위 ETF 급등 사유 분석 (4050 투자자 관점)

**분석 대상:** ${e?.name} (${e?.code})
- 가격: ${e?.price.toLocaleString()}원 (${e?.changeRate >= 0 ? '+' : ''}${e?.changeRate}%)
- 거래량: ${(e?.volume / 10000).toFixed(0)}만주 · 거래대금 ${Math.round((e?.tradeAmount || 0) / 1e8)}억 원
- 섹터: ${e?.sector}
${news?.summary ? `- 관련 뉴스 3줄 요약: ${news.summary}` : ''}

${holdingsBlock}

## 구성 (최소 2500자)
1. ## 3줄 급등 요약 (불릿)
2. ## 오늘의 거래 데이터 (시가/고가/저가/거래대금 표)
3. ## 급등 사유 분석 (지정학·수주·실적·정책 중 해당 요인 심층 분석 + 출처 문장)
${section4Instruction}
5. ## 단기(1주)·중기(1개월) 전망과 리스크 (4050 은퇴 자산 관점, 단일 섹터 비중 15% 기준)
6. ## 4050 투자자 체크리스트 (보유 계좌 확인 / 분산 리밸런싱 / 분배금·세액공제 한도 점검)
7. ## FAQ (3개)

**중요:** 4번 섹션은 반드시 위 데이터 기반의 실제 기업명·비중·특성을 사용하세요. "섹터 모멘텀", "관련주 동반 상승" 같은 일반론 금지. 구체 기업명과 제품·수주·제품군 단위로 서술해야 합니다.
`;
  } else if (tmpl === 'flow') {
    const sectors = strategy.sectorFlow || [];
    templateBlock = `
## 작성 목표: 주간 섹터 자금 흐름 리포트

**오늘(${today}) 섹터별 평균 등락률·거래대금:**
| 섹터 | 평균 등락률 | 거래대금(억원) | 종목수 |
|---|---|---|---|
${sectors.slice(0, 8).map(s => `| ${s.sector} | ${s.avgChangeRate >= 0 ? '+' : ''}${s.avgChangeRate}% | ${Math.round(s.totalAmount / 1e8).toLocaleString()} | ${s.count} |`).join('\n')}

## 구성 (최소 2500자)
1. ## 이번 주 Flow 3줄 요약
2. ## 섹터별 자금 유입 총정리 (위 표를 본문에 반드시 포함)
3. ## 기관·외국인 수급 관점 해석 (수급 전문 용어 활용)
4. ## 상위 섹터 대표 ETF 3종 (표)
5. ## 다음 주 관전포인트 및 체크할 지표
6. ## FAQ (3개)
`;
  } else if (tmpl === 'income') {
    const e = strategy.focusEtf;
    templateBlock = `
## 작성 목표: 월배당·커버드콜 ETF 실전 가이드

**대상 ETF:** ${e?.name || '월배당 대표 ETF'} ${e?.code ? `(${e.code})` : ''}
- 현재가: ${e?.price?.toLocaleString() || '-'}원
- 섹터: ${e?.sector || '커버드콜·월배당'}

## 구성 (최소 2800자)
1. ## 이 글의 3줄 요약 (기대 분배금·세후 수익률·적합 계좌)
2. ## 커버드콜·월배당 ETF 구조 (옵션 프리미엄 원리 쉽게)
3. ## 실제 분배금 계산 (1000만 원 투자 시 월·연 수령액 표)
4. ## 세후 수익률 비교 (일반계좌 15.4% vs ISA vs 연금저축·IRP 3.3~5.5%)
5. ## 계좌 조합 전략: IRP·ISA·연금저축 각각의 최적 활용
6. ## 주의사항 (옵션 손실 리스크, 분배금 변동성)
7. ## FAQ (3개)
`;
  } else if (tmpl === 'breaking') {
    const e = strategy.focusEtf || {};
    const holdings = strategy.holdings || [];
    const newsForThis = context.news || {};
    const headlines = (newsForThis.headlines || []).slice(0, 8);
    const newsSummary = newsForThis.summary || '';

    templateBlock = `
## 작성 목표: ETF 속보 (거래량 ${strategy.rank}위 · 뉴스 기반 심층 분석)

**대상 ETF:** ${e.name || '-'} (${e.code || '-'})
- 현재가: ${e.price?.toLocaleString() || '-'}원 · 등락률: ${e.changeRate >= 0 ? '+' : ''}${e.changeRate ?? '-'}%
- 거래량: ${e.volume?.toLocaleString() || '-'}주 (오늘 ${strategy.rank}위)
- 섹터: ${e.sector || '기타'}

**오늘 수집된 뉴스 헤드라인 + 스니펫 + 링크 (반드시 본문에서 인용·요약):**
${headlines.length > 0
  ? headlines.map((h, i) => {
      const lines = [`${i + 1}. ${h.title}${h.source ? ` — ${h.source}` : ''}`];
      if (h.link) lines.push(`   링크: ${h.link}`);
      if (h.snippet) lines.push(`   스니펫: "${h.snippet}"`);
      if (h.pubDate) lines.push(`   (게재: ${h.pubDate})`);
      return lines.join('\n');
    }).join('\n\n')
  : '(헤드라인 없음 — 시세·섹터 중심으로 작성)'}

${newsSummary ? `**뉴스 3줄 요약 (참고):**\n${newsSummary}` : ''}

**뉴스 섹션 작성 규칙:**
- 헤드라인 2~3건을 골라 **각 기사 내용 2~3문장으로 요약**해 서술 (스니펫을 근거로).
- **제목은 반드시 마크다운 하이퍼링크 \`[제목](링크URL)\` 형태로 작성** — 독자가 원문으로 이동 가능하도록.
- "${'$'}{언론사} 보도에 따르면~" 같은 **관찰형 표현** 사용. 원문 왜곡 금지.
- 각 요약 끝에 "이 소식이 ${e.name || '해당 ETF'}에 어떻게 작용하는지" 한 줄 연결.

${holdings.length > 0 ? `**구성종목 상위 ${strategy.topN || 5}:**
${holdings.map(h => `${h.rank}. ${h.name} (${h.code}) · 비중 ${h.weight}%`).join('\n')}` : ''}

## 구성 (최소 **3000자** · 뉴스와 시세를 교차해 맥락 있는 속보)
1. ## 3줄 속보 요약 (규칙: \`## 3줄 속보 요약\` 섹션 바로 아래 \`- \`로 시작하는 불릿 **정확히 3개**, 각 한 문장 50~70자, "- **라벨**: 내용" 형식. 홈 hero·타임라인이 이 포맷 그대로 추출함)
2. ## 오늘 이 ETF를 움직인 뉴스 — 위 헤드라인 중 핵심 2~3건을 **출처와 함께** 인용하고 각각 한 단락으로 해설
3. ## 시세·거래량 데이터 — 현재가·등락률·거래량·섹터 평균 비교를 표로 정리
4. ## 섹터·구성종목과의 연결 — "뉴스가 어떤 구성종목을 직접 움직이는가" 구체 매핑 (바스켓형이면 상위 종목 영향, 단일기초자산형이면 옵션 민감도)
5. ## 시장 반응 해석 — 같은 섹터 동반 ETF 흐름·외국인/기관 수급 추정·변동성 확대 여부
6. ## 4050 투자자 관점 — 추격 매수 vs 관망 vs 비중 유지 결정 프레임, 연금·ISA·IRP 계좌 관점 조치
7. ## 단기 전망 — 1주/1개월 시나리오 2가지(낙관/조심)와 각 체크 지표
8. ## FAQ (3개 · 속보 특성: "지금 사도 되나요?", "왜 다른 ETF보다 이게 움직였나요?", "내일도 이어질까요?" 등)

**작성 규칙:**
- 추측·수익보장 금지. "뉴스에 따르면", "헤드라인을 보면", "가능성이 있다" 같은 **관찰형 서술** 사용.
- 본문 어디에도 "지금 매수", "무조건 오른다" 등 직설적 권유 금지.
- 뉴스 인용은 **출처(언론사)를 명시**하고 원문 왜곡하지 말 것.
- 분량은 **반드시 3000자 이상** (구성종목·섹터·FAQ로 볼륨 확보).
`;
  }

  return `${feedbackBlock}${personaBlock}

오늘: ${today}

# 포스팅 전략
- 카테고리: ${strategy.category}
- 핵심 키워드: "${strategy.keyword}"
- 제목 후보: ${strategy.suggestedTitle}

${templateBlock}

${commonRules}

지금 본문을 Markdown으로 작성하세요.`;
}

// ───── 샘플 글 (API 없을 때) ─────
function buildSampleArticle(strategy, context) {
  const tmpl = strategy.templateType;
  const bodyByTmpl = {
    pulse: samplePulse(strategy),
    surge: sampleSurge(strategy),
    flow: sampleFlow(strategy),
    income: sampleIncome(strategy),
    breaking: sampleBreaking(strategy, context),
  };
  const content = (bodyByTmpl[tmpl] || samplePulse(strategy)).trim();
  return {
    keyword: strategy.keyword,
    title: strategy.suggestedTitle,
    slug: strategy.suggestedSlug,
    category: strategy.category,
    templateType: tmpl,
    tickers: strategy.tickers || [],
    content,
    wordCount: content.length,
    generatedBy: 'sample',
  };
}

function samplePulse(s) {
  const t = s.top3 || [];
  const lead = s.leadSector;
  // 상위 3개 섹터 추출 (sectorFlow는 전략에 포함 안 될 수 있어 방어)
  const sectors = Array.isArray(s.sectorFlow) ? s.sectorFlow.slice(0, 3) : (lead ? [lead] : []);

  return `
## 오늘의 3줄 관전포인트

- **거래량 1위**: ${t[0]?.name || '상위 ETF'}가 ${t[0]?.changeRate >= 0 ? '+' : ''}${t[0]?.changeRate || 0}%로 시장의 관심을 받습니다.
- **섹터 리더**: ${lead?.sector || '주요 섹터'}가 평균 ${lead?.avgChangeRate >= 0 ? '+' : ''}${lead?.avgChangeRate || 0}%로 자금이 몰리는 모습입니다.
- **체크 포인트**: 장중 변동성에 대비해 분할 매수 원칙을 유지하세요.

## 거래량 TOP3 완벽 해설

| 순위 | 종목명 | 코드 | 등락률 | 거래량 | 섹터 |
|---|---|---|---|---|---|
${t.slice(0, 3).map((e, i) => `| ${i + 1} | ${e.name} | ${e.code} | ${e.changeRate >= 0 ? '+' : ''}${e.changeRate}% | ${(e.volume / 10000).toFixed(0)}만주 | ${e.sector} |`).join('\n')}

## 섹터 흐름 한눈에 (4050 투자자 관점)

오늘 자금은 **${lead?.sector || '주도 섹터'}**에 집중되며 평균 ${lead?.avgChangeRate >= 0 ? '+' : ''}${lead?.avgChangeRate || 0}% 흐름입니다. 은퇴 자산을 관리하는 4050 세대에게 지금 중요한 것은 **"이 섹터가 내 포트폴리오에 이미 있는지, 추가 편입 가능한 계좌가 어디인지"** 입니다.

${sectors.length > 0 ? `
| 섹터 | 평균 등락률 | 4050 투자자 관점 |
|---|---|---|
${sectors.map(x => {
  const rate = x.avgChangeRate;
  const interp =
    rate >= 2 ? '🔥 과열 구간 — 분할 매수 필수, ISA/연금 계좌로 세금 방어' :
    rate >= 0 ? '안정적 상승 — 월배당·커버드콜 병행 편입 검토' :
    rate >= -2 ? '매수 기회 — 장기 관점에서 분할 접근' :
    '⚠️ 단기 이탈 — 추세 확인 전 관망 권장';
  return `| ${x.sector} | ${rate >= 0 ? '+' : ''}${rate}% | ${interp} |`;
}).join('\n')}
` : ''}

### 오늘 가장 유용한 액션 3가지
1. **보유 확인**: ${lead?.sector || '주도 섹터'} 관련 ETF가 연금저축·IRP·ISA 계좌에 있는지 먼저 체크하세요.
2. **비중 조정**: 단일 섹터가 전체 자산의 15%를 넘으면 분산 리밸런싱을 검토합니다.
3. **분배금 확인**: 커버드콜·월배당 ETF 보유 시, 이번 주 분배락 일정과 세후 수령액을 재확인하세요.

## 오늘 체크할 뉴스·지표

- 미국 증시 마감 지수 (S&P500, 나스닥)
- 원/달러 환율 1400원 돌파 여부
- 주요 섹터 공시·실적 발표
- 본인의 연금·ISA 연간 한도 잔액 (세액공제 기회 재확인)

## 자주 묻는 질문 (FAQ)

**Q1: 거래량 1위 ETF는 무조건 사야 하나요?**

거래량만으로 매수 근거가 되지는 않습니다. 뉴스와 섹터 흐름을 함께 확인한 뒤, 본인의 투자 기간에 맞춰 결정하시기 바랍니다.

**Q2: 오전에만 확인해도 되나요?**

장중 변동성이 큰 종목은 오후 장 흐름을 추가 확인하는 편이 안전합니다.

**Q3: 4050 세대에게 적합한가요?**

단기 매매보다는 배당·커버드콜 ETF 중심으로 포트폴리오를 구성하는 것을 권장합니다.
`;
}

/**
 * surge 포스트의 ETF 구성종목/기초자산 섹션을 타입별로 분기 렌더
 *   - basket        : 기업 구성종목 TOP N 표 + 4050 관점 액션
 *   - single-option : 기초자산 1종 + 옵션 전략 설명
 *   - futures       : 선물 기초자산 + 금리 민감도 표
 */
function renderSurgeHoldings(portfolio, holdings, focusEtf) {
  if (!portfolio) {
    return `## 이 ETF가 담고 있는 것

${focusEtf?.name || '대상 ETF'}의 공식 구성종목 데이터가 아직 준비되지 않았습니다. 운용사 공식 상품 페이지(PDP)에서 최신 포트폴리오를 확인하시기 바랍니다.

### 4050 투자자가 확인할 포인트
- **비중 상위 기업** 1~2개가 전체의 30% 이상이면 단일 종목 리스크 고려
- **연금·ISA 계좌 내 중복 편입** 여부 점검
- **총보수·추적오차** 확인 후 유사 상품과 비교`;
  }

  if (portfolio.type === 'basket') {
    const header = `## ${portfolio.name}이(가) 담은 ${portfolio.holdings.length}개 기업 TOP ${holdings.length}

${portfolio.desc || ''}

**자료:** ${portfolio.source || '운용사 공식 PDP'} · 기준 ${portfolio.updated || '최신 공시'}

| 순위 | 기업명 | 코드 | 비중 | 포인트 |
|---|---|---|---|---|
${holdings.map(h => `| ${h.rank} | **${h.name}** | ${h.code} | ${h.weight}% | ${h.note || '-'} |`).join('\n')}

${portfolio.note ? `> ${portfolio.note}\n` : ''}

### 4050 투자자가 확인할 포인트
- **상위 1~3위 집중도**: 비중 상위 3개가 40%를 넘으면 사실상 그 종목들의 주가에 연동됩니다. 개별 종목 직접 보유와 위험이 유사할 수 있습니다.
- **중복 편입 점검**: 내 연금저축·IRP·ISA 계좌에 이미 위 기업(또는 유사 테마 ETF)이 있는지 확인해 과도한 집중 방지.
- **매수 타이밍**: 주도 기업의 실적 발표·대규모 수주 공시 일정을 먼저 보고, 그 전에 분할 매수로 진입하는 편이 부담이 적습니다.`;
    return header;
  }

  if (portfolio.type === 'single-option') {
    const u = portfolio.underlying || {};
    const strat = portfolio.strategy || {};
    return `## ${portfolio.name}이(가) 실제로 담은 것

이 ETF는 일반적인 "여러 기업을 담은 바스켓"이 아니라 **단일 기초자산 + 옵션 전략** 구조입니다.

| 구분 | 내용 |
|---|---|
| 기초자산 | **${u.name}** (${u.code}) · 비중 ${u.weight || 0}% |
| 기초자산 성격 | ${u.note || '-'} |
| 옵션 전략 | ${strat.name || '-'} |
| 전략 설명 | ${strat.description || '-'} |
| 분배 정책 | ${strat.distribution || '-'} |
| 주요 리스크 | ${strat.risk || '-'} |

**자료:** ${portfolio.source || '운용사 공식 PDP'} · 기준 ${portfolio.updated || '최신 공시'}

### 4050 투자자가 확인할 포인트
- **상승분 제한**: 기초자산이 급등해도 매도한 콜옵션 행사가 이상의 수익은 포기합니다. 단기 급등장에선 불리할 수 있습니다.
- **안정적 현금흐름**: 횡보·약세장에서 옵션 프리미엄이 월 분배금의 주요 재원이 됩니다. 연금·ISA 계좌와 궁합이 좋습니다.
- **기초자산 리스크**: 결국 ${u.name} 한 종목의 방향성에 크게 연동됩니다. 이 회사의 실적·산업 리스크를 먼저 이해해야 합니다.`;
  }

  if (portfolio.type === 'futures') {
    const u = portfolio.underlying || {};
    const sens = portfolio.sensitivities || [];
    return `## ${portfolio.name}이(가) 실제로 담은 것

이 ETF는 개별 주식 바스켓이 아니라 **${u.name || '선물 계약'}** 을 기초로 합니다.

| 구분 | 내용 |
|---|---|
| 기초자산 | ${u.name || '-'} |
| 자산 설명 | ${u.desc || '-'} |
| 환헤지 | ${portfolio.hedge || '-'} |

### 수익·손실 민감도

| 요인 | 영향 |
|---|---|
${sens.map(s => `| ${s.factor} | ${s.impact} |`).join('\n')}

**자료:** ${portfolio.source || '운용사 공식 PDP'} · 기준 ${portfolio.updated || '최신 공시'}

### 4050 투자자가 확인할 포인트
- **금리 방향이 핵심**: 기업 실적이 아니라 **미국 장기 금리**가 수익률을 좌우합니다. 인하 국면에서 유리, 인상 국면에서 불리.
- **안전자산 헤지용**: 주식 포지션의 변동성을 완화하는 보완 자산으로 사용할 때 의미가 큽니다.
- **계좌 매칭**: 과세이연이 가능한 연금저축·IRP에서 운용하면 장기 이자·매매차익에 대한 세금 최적화가 가능합니다.`;
  }

  return '';
}

function sampleSurge(s) {
  const e = s.focusEtf || {};
  const portfolio = s.portfolio;
  const holdings = Array.isArray(s.holdings) ? s.holdings : [];

  const holdingsLine = portfolio?.type === 'basket'
    ? `**${e.name}**이(가) 담고 있는 ${holdings.length}개 종목이 함께 움직입니다.`
    : portfolio?.type === 'single-option'
      ? `**${portfolio.underlying?.name || e.name}**(비중 ${portfolio.underlying?.weight || 0}%) + 옵션 전략이 작동하는 상품입니다.`
      : portfolio?.type === 'futures'
        ? `기초자산은 ${portfolio.underlying?.name || '선물 계약'}, 금리·환율 민감도가 수익을 좌우합니다.`
        : `${e.sector || '섹터'} 테마 자금 유입이 관찰됩니다.`;

  return `
## 3줄 급등 요약

- **${e.name || 'ETF'}**가 거래량 ${(e.volume / 10000 || 0).toFixed(0)}만주, 등락률 ${e.changeRate >= 0 ? '+' : ''}${e.changeRate || 0}%로 오늘 시장의 주인공이 되었습니다.
- ${holdingsLine}
- 단기 과열 가능성을 염두에 두고, 분할 매수·목표가 관리가 필요합니다.

## 오늘의 거래 데이터

| 항목 | 값 |
|---|---|
| 종목명 | ${e.name || '-'} |
| 현재가 | ${(e.price || 0).toLocaleString()}원 |
| 등락률 | ${e.changeRate >= 0 ? '+' : ''}${e.changeRate || 0}% |
| 거래량 | ${(e.volume / 10000 || 0).toFixed(0)}만주 |
| 거래대금 | ${Math.round((e.tradeAmount || 0) / 1e8)}억 원 |
| 시가/고가/저가 | ${(e.openPrice || 0).toLocaleString()} / ${(e.highPrice || 0).toLocaleString()} / ${(e.lowPrice || 0).toLocaleString()}원 |

## 급등 사유 분석

${e.sector === '방산' ? '지정학적 긴장 고조와 글로벌 방위비 증액 기조가 방산 ETF 전반에 자금 유입을 부추기고 있습니다.' :
  e.sector === '조선' ? '친환경 선박 발주 증가와 국내 대형 3사의 수주 잔고 확대가 조선 테마의 강세를 이끌고 있습니다.' :
  e.sector === 'AI·데이터' ? '데이터센터 CAPEX 확장과 AI 반도체 공급망 수혜가 장기 성장 스토리로 부각되고 있습니다.' :
  '섹터 모멘텀과 수급이 결합된 복합적 흐름입니다.'}

${renderSurgeHoldings(portfolio, holdings, e)}

## 단기(1주)·중기(1개월) 전망과 리스크

단기적으로는 모멘텀 유지가 가능해 보이나, 섹터 전반의 밸류에이션 부담과 외국인 수급 변동에는 주의가 필요합니다.

## 4050 투자자 체크리스트

1. 전체 자산 대비 테마 ETF 비중이 15%를 넘지 않도록 관리
2. 분할 매수 원칙 (3~5회 분할)
3. 손절·익절 라인 사전 설정

## FAQ

**Q1: 지금이 매수 타이밍인가요?**

단기 과열 구간일 수 있습니다. 분할 매수로 접근하되, 본인의 리스크 허용 범위를 먼저 고려하시기 바랍니다.

**Q2: 얼마나 오를 수 있나요?**

개별 종목의 주가 전망은 확정할 수 없습니다. 본문에서 제시한 근거와 리스크를 종합적으로 고려하세요.

**Q3: 커버드콜 버전도 있나요?**

해당 섹터의 커버드콜 ETF가 있다면 연금·ISA 계좌 활용이 효과적일 수 있습니다.
`;
}

function sampleFlow(s) {
  const sectors = s.sectorFlow || [];
  return `
## 이번 주 Flow 3줄 요약

- 자금은 **${sectors[0]?.sector || '주도 섹터'}**로 집중되며 평균 ${sectors[0]?.avgChangeRate >= 0 ? '+' : ''}${sectors[0]?.avgChangeRate || 0}% 상승세입니다.
- 반대로 **${sectors[sectors.length - 1]?.sector || '하위 섹터'}**는 ${sectors[sectors.length - 1]?.avgChangeRate || 0}%로 자금 이탈이 관찰됩니다.
- 기관·외국인 수급 동향은 다음 섹션에서 자세히 다룹니다.

## 섹터별 자금 유입 총정리

| 섹터 | 평균 등락률 | 거래대금(억원) | 종목수 |
|---|---|---|---|
${sectors.slice(0, 8).map(x => `| ${x.sector} | ${x.avgChangeRate >= 0 ? '+' : ''}${x.avgChangeRate}% | ${Math.round(x.totalAmount / 1e8).toLocaleString()} | ${x.count} |`).join('\n')}

## 기관·외국인 수급 관점 해석

상위 섹터로의 자금 집중은 기관 투자자의 섹터 로테이션 신호일 가능성이 있습니다. 특히 외국인 매수세가 동반될 때 추세 지속성이 강해지는 경향이 있습니다.

## 상위 섹터 대표 ETF 3종

| 섹터 | 대표 ETF | 특징 |
|---|---|---|
| ${sectors[0]?.sector || '-'} | 대표 ETF | 섹터 직접 노출 |
| ${sectors[1]?.sector || '-'} | 대표 ETF | 분산 효과 |
| ${sectors[2]?.sector || '-'} | 대표 ETF | 배당 병행 |

## 다음 주 관전포인트

- 미국 CPI·FOMC 일정
- 환율 변동성
- 주요 섹터 실적 발표

## FAQ

**Q1: 섹터 로테이션은 어떻게 추적하나요?**

매주 자금 흐름과 외국인 순매수 데이터를 함께 확인하시는 것이 좋습니다.

**Q2: 개인이 따라가도 되나요?**

장기 관점이라면 분산·적립식이 더 안전합니다. 단기 로테이션 추종은 리스크가 큽니다.

**Q3: ETF보다 개별 종목이 낫지 않나요?**

섹터 전반 베팅에는 ETF가, 구체적 기업 확신이 있다면 개별 종목이 유리할 수 있습니다.
`;
}

function sampleIncome(s) {
  const e = s.focusEtf || {};
  return `
## 이 글의 3줄 요약

- **${e.name || '월배당 ETF'}**의 구조와 실제 분배금을 계산합니다.
- 일반계좌 대비 **연금저축·IRP에서 굴릴 때** 세후 수익률이 크게 차이납니다.
- 4050 투자자에게 적합한 계좌 조합을 제시합니다.

## 커버드콜·월배당 ETF 구조

커버드콜 전략은 보유 자산에 대해 콜옵션을 매도해 **옵션 프리미엄**을 분배금 재원으로 활용합니다. 주가 급등 시 상승분이 제한되는 단점이 있지만, 횡보·약세장에서는 안정적 현금흐름을 제공합니다.

## 실제 분배금 계산 (1000만 원 투자)

| 항목 | 금액 |
|---|---|
| 투자원금 | 10,000,000원 |
| 연 분배율(예시) | 10% |
| 연 분배금(세전) | 1,000,000원 |
| 월 분배금(세전) | 83,333원 |
| 일반계좌 세후(15.4%) | 70,500원/월 |
| 연금저축·IRP 세후(3.3~5.5%) | 78,750~80,583원/월 |

## 세후 수익률 비교

| 계좌 유형 | 배당세율 | 1000만 원 연 세후 수익 |
|---|---|---|
| 일반 계좌 | 15.4% | 846,000원 |
| ISA (비과세 한도 내) | 0% | 1,000,000원 |
| 연금저축·IRP | 3.3~5.5% | 945,000~967,000원 |

## 계좌 조합 전략

1. **ISA 비과세 한도 200만 원** 먼저 채우기
2. **연금저축·IRP 세액공제 한도** (연 900만 원)로 커버드콜 핵심 편입
3. **일반 계좌**는 비중 최소화

## 주의사항

- 옵션 프리미엄은 시장 변동성에 따라 축소될 수 있습니다.
- 기초자산 급등 시 상승분이 제한됩니다.
- 분배금은 과거 실적일 뿐 미래를 확정하지 않습니다.

## FAQ

**Q1: ISA와 연금저축 중 어디를 먼저?**

비과세 혜택이 큰 ISA를 먼저 채우고, 이후 연금저축·IRP로 세액공제까지 받는 순서를 권장합니다.

**Q2: 분배율 10%가 항상 유지되나요?**

아니요. 시장 변동성에 따라 축소될 수 있습니다.

**Q3: 은퇴 시점에는?**

인출 시점에 연금 수령으로 전환하면 저율 과세(3.3~5.5%)로 설계됩니다.
`;
}

function sampleBreaking(s, context) {
  const e = s.focusEtf || {};
  const holdings = (s.holdings || []).slice(0, 5);
  const news = context?.news || {};
  const headlines = (news.headlines || []).slice(0, 5);
  const direction = e.changeRate >= 0 ? '상승' : '조정';
  const dirSign = e.changeRate >= 0 ? '+' : '';

  return `
## 3줄 속보 요약

- **거래량 ${s.rank || 1}위**: ${e.name || '-'}이(가) ${dirSign}${e.changeRate ?? 0}%로 오늘 시장에서 ${direction} 흐름을 보였습니다.
- **섹터 맥락**: ${e.sector || '해당 섹터'} 테마 전반으로 자금이 이동 중이며, 구성종목 상위 비중의 영향이 큽니다.
- **체크 포인트**: 단기 모멘텀과 뉴스 흐름을 함께 보고, 추격 진입보다 분할 진입·비중 점검을 권합니다.

## 오늘 이 ETF를 움직인 뉴스

${headlines.length > 0
  ? [
      ...headlines.slice(0, 5).map((h, i) => {
        // 제목이 링크라면 [제목](링크) 마크다운으로. 링크 없으면 그냥 텍스트.
        const titleMd = h.link ? `[${h.title}](${h.link})` : h.title;
        const lines = [`**${i + 1}. ${titleMd}**${h.source ? ` — *${h.source}*` : ''}`];
        if (h.snippet && h.snippet.length >= 20) {
          lines.push('');
          lines.push(`> ${h.source || '해당 매체'} 기사 스니펫: "${h.snippet}"`);
        }
        return lines.join('\n');
      }),
      '',
      '### 뉴스가 이 ETF에 주는 의미',
      '',
      (news.summary && !news.summary.startsWith('- '))
        ? news.summary
        : `오늘 ${e.name || '해당 ETF'}과 ${e.sector || '섹터'} 관련 보도 ${headlines.length}건이 수집되었습니다. 주요 흐름은 ${headlines[0]?.source || '주요 매체'}에서 다룬 "${headlines[0]?.title || ''}" 관련 이슈이며, ${headlines[1]?.source ? `${headlines[1].source}의 "${headlines[1].title}"` : '추가 보도'}가 이를 보완합니다.`,
      '',
      `보도 종합을 보면 ${e.sector || '해당 섹터'}에 대한 수급 쏠림이 ${e.changeRate >= 0 ? '확대' : '조정'} 국면에 진입한 것으로 관찰되며, ${e.name || '이 ETF'}의 오늘 ${e.changeRate >= 0 ? '상승' : '하락'}(${e.changeRate >= 0 ? '+' : ''}${e.changeRate ?? 0}%)도 이 흐름과 맞물려 움직였을 가능성이 있습니다.`,
    ].join('\n\n')
  : `오늘자 직접 뉴스는 수집되지 않았으나, 동일 섹터(${e.sector || '해당 섹터'})의 최근 흐름이 ${e.name || '이 ETF'}에 반영되었을 가능성이 있습니다. 향후 출처 뉴스가 갱신되면 본 섹션이 자동으로 업데이트됩니다.`}

## 시세·거래량 데이터

| 항목 | 값 |
|---|---|
| 종목명 | ${e.name || '-'} |
| 종목코드 | ${e.code || '-'} |
| 현재가 | ${(e.price || 0).toLocaleString()}원 |
| 전일대비 | ${dirSign}${e.change ?? 0}원 (${dirSign}${e.changeRate ?? 0}%) |
| 거래량 | ${(e.volume || 0).toLocaleString()}주 |
| 시가총액 | ${Math.round((e.marketCap || 0) / 1e8).toLocaleString()}억 원 |
| 섹터 | ${e.sector || '기타'} |

## 섹터·구성종목과의 연결

${holdings.length > 0 ? `${e.name}은(는) 바스켓형 ETF로, 뉴스에 민감한 상위 ${s.topN || 5}개 종목이 전체 변동성을 주도합니다:

| 순위 | 구성종목 | 코드 | 비중 | 포인트 |
|---|---|---|---|---|
${holdings.map(h => `| ${h.rank} | ${h.name} | ${h.code} | ${h.weight}% | ${(h.note || '-').replace(/\\|/g, ' ')} |`).join('\n')}

상위 1~3위 집중도가 높을수록 개별 기업 뉴스가 ETF 전체 수급에 빠르게 반영됩니다.` : `${e.name}의 기초자산·전략이 단일형이거나 바스켓 데이터 미확보 상태입니다. 운용사 공식 PDP 공시를 확인해 상위 비중·기초자산의 최신 상태를 점검해 보세요.`}

## 시장 반응 해석

같은 섹터(${e.sector || '해당 섹터'}) 내 타 ETF와 비교해 ${e.name}의 거래량이 상대적으로 큰지 확인해야 합니다. 특정 종목에만 수급이 몰리는 경우 단기 쏠림이고, 섹터 전반이 동반 움직였다면 테마 단위 흐름입니다. 외국인·기관 순매수 데이터는 장 마감 후 확인 가능합니다.

변동성이 확대되었을 때는 **시가총액 대비 거래대금 비율**과 **호가 스프레드**를 체크해 유동성 리스크를 함께 점검하세요.

## 4050 투자자 관점

1. **포지션이 이미 있는 경우** — 비중이 자산 대비 과대하지 않은지(권장: 단일 섹터 15% 이내) 재점검. 이번 상승/조정으로 목표 수익률에 도달했다면 일부 차익 실현 고려.
2. **신규 진입을 검토 중인 경우** — 추격 매수 대신 3~5회 분할 진입 계획 수립. 연금·ISA 계좌 한도가 남아 있다면 세후 수익률 관점에서 우선 활용.
3. **관망 중인 경우** — 뉴스 후속 보도와 장중 거래량을 1~2일 관찰한 뒤 섹터 흐름이 추세인지 일회성인지 확인.

## 단기 전망

**낙관 시나리오**: 뉴스 흐름이 이어지고 섹터 자금이 추가 유입되면 단기 +3~5% 연장 가능. 체크 지표 — 다음 날 거래량 유지, 동반 ETF 상승.

**조심 시나리오**: 뉴스 소멸 또는 차익 실현 매물 출회 시 반락 가능. 체크 지표 — 단기 이동평균 이탈, 섹터 평균 하락 전환.

## FAQ

**Q1: 오늘 많이 올랐는데 지금 사도 되나요?**

당일 급등한 ETF를 고점에서 추격하는 것보다는, 며칠 관찰하며 거래량과 가격이 안정되는 지점에서 분할 진입하는 편이 위험을 줄입니다.

**Q2: 왜 다른 ETF보다 이게 움직였나요?**

종목의 거래량 순위·구성 비중·섹터 뉴스 민감도가 결합된 결과입니다. 같은 섹터의 타 ETF 수급을 함께 보면 개별 쏠림인지 테마 흐름인지 구분됩니다.

**Q3: 내일도 이어질까요?**

단일 세션의 흐름만으로 다음 날을 확언할 수 없습니다. 뉴스 후속 보도, 외국인·기관 순매수, 섹터 평균 흐름 3가지를 함께 확인하시길 권합니다.
`;
}

// ───── run ─────
async function run({ today, previousResults, rejectionFeedback }) {
  logger.log(AGENT_NAME, '🚀 PulseAnalyst 본문 작성 시작');

  const strategies = previousResults?.SeoArchitect?.strategies || [];
  const etfData = previousResults?.DataMiner?.etfData || {};
  const economicData = previousResults?.DataMiner?.economicData || {};
  const pulseImage = previousResults?.DataMiner?.pulseImage || null;
  const newsByKeyword = previousResults?.NewsCollector?.byKeyword || {};

  if (strategies.length === 0) {
    logger.warn(AGENT_NAME, '전략 없음');
    return { summary: '작성할 글 없음', articles: [] };
  }

  const articles = [];
  const RATE_LIMIT_SPACING_MS = 4200; // Gemini 2.5 Flash 무료 티어 15 RPM 대응 (60s / 15 = 4s)
  for (let i = 0; i < strategies.length; i++) {
    const strategy = strategies[i];
    const newsForStrategy = newsByKeyword[strategy.keyword] || null;
    const context = { etfData, economicData, pulseImage, news: newsForStrategy };
    const article = await generateArticle(strategy, context, rejectionFeedback);
    articles.push(article);
    state.saveData(AGENT_NAME, 'processed', `article_${today}_${article.slug}.json`, article);
    logger.log(AGENT_NAME, `  📄 [${article.templateType}] ${article.wordCount}자 (${article.generatedBy || 'unknown'})`);
    if (process.env.GEMINI_API_KEY && i < strategies.length - 1) {
      await new Promise(r => setTimeout(r, RATE_LIMIT_SPACING_MS));
    }
  }

  logger.success(AGENT_NAME, `${articles.length}개 글 작성 완료`);
  return {
    summary: `${articles.length}개 글 (총 ${articles.reduce((sum, a) => sum + a.wordCount, 0)}자)`,
    articles,
  };
}

module.exports = { run };
