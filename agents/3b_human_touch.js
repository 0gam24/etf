/**
 * 3b. HumanTouch — 초안에 페르소나 개성·경험·구어체를 입히는 리라이터
 *
 *   LogicSpecialist의 정제된 초안 → 특정 저자의 실제 글처럼 변환:
 *     · 서두에 저자의 "개인 관전포인트" 2~3문장 추가
 *     · 본문에 경험·주관 문장 1~2회 삽입
 *     · 결론에 "저의 결론" + 저자 서명
 *     · 문장 길이 편차 확대 (AI detector perplexity 상승)
 *     · 메타 데이터(CPC·SEO·애드센스) 노출 금지 유지
 *
 *   실패 시 원문 그대로 통과 (파이프라인 안정성 유지).
 */

const state = require('../pipeline/state_manager');
const logger = require('../pipeline/logger');
const { pickPersona } = require('./personas');

const AGENT_NAME = 'HumanTouch';

function buildPrompt(article, persona) {
  const voiceLines = persona.voiceHints.slice(0, 3).map(v => `- "${v}"`).join('\n');

  return `당신은 한국의 금융 블로거 "${persona.name}(${persona.age}세)"입니다.
프로필: ${persona.title}
이력: ${persona.bio}

아래의 정제된 Markdown 초안을 당신의 글처럼 리라이팅하세요.

# 규칙
1. 서두에 "## 저의 관전포인트" 섹션 새로 추가 (3문장, 본인 관점)
2. 본문 중간에 경험 문장 1~2회 자연스럽게 삽입. 예시 말투:
${voiceLines}
3. 결론 직전에 "## 저의 결론" 섹션 추가 (4~6문장, 단호한 개인 의견)
4. 문장 길이를 다양화: 10자 이내 짧은 문장과 60자 긴 문장을 섞기
5. 전문 용어 뒤엔 가끔 "쉽게 말하면…" 한 문장
6. 때때로 "~같더라고요", "~였거든요", "~이에요" 같은 자연스러운 구어체 허용
7. 숫자는 반드시 출처 함께 ("한국은행 자료", "KRX 공시" 등)
8. 마지막 줄: "${persona.closingSignature}"

# 금지
- "CPC", "고단가", "애드센스", "SEO", "타겟 독자", "포스팅 전략" 등 메타 데이터 노출 금지
- "수익 보장", "원금 보장", "무조건 수익", "지금 바로 매수" 등 확정적·권유 표현 금지
- H1(#) 사용 금지 — 시스템이 자동 삽입
- 기존 구조(H2 섹션·표·FAQ·이미지 링크)는 모두 유지
- 이미지 마크다운(![...](...)) 은 그대로 두되 위치는 이동 가능

# 출력
Markdown 본문만 출력하세요. 다른 설명 없이.

---
원본 초안:
${article.content}
---`;
}

async function rewriteWithPersona(article, persona) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // API 키 없으면 샘플: 서두·결론만 간단히 붙여서 톤 흉내
    return injectLocalPersona(article, persona);
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: buildPrompt(article, persona) }] }],
          generationConfig: { temperature: 0.85, maxOutputTokens: 8192 },
        }),
      }
    );
    if (!res.ok) return injectLocalPersona(article, persona);
    const json = await res.json();
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text || text.length < 500) return injectLocalPersona(article, persona);
    return text.trim();
  } catch {
    return injectLocalPersona(article, persona);
  }
}

// API 없을 때 로컬로 서두·결론만 덧붙여 톤 흉내
function injectLocalPersona(article, persona) {
  const intro = `## 저의 관전포인트

${persona.voiceHints[0]} 오늘 이 주제를 왜 짚어야 하는지 세 줄로 먼저 정리해 드릴게요.

`;
  const outro = `

## 저의 결론

${persona.voiceHints[persona.voiceHints.length - 1]} 오늘 내용을 실전에 옮길 때는 본인의 투자 기간과 리스크 허용 범위부터 정리하시는 걸 권합니다. 숫자보다 원칙이 먼저입니다.

${persona.closingSignature}
`;
  return intro + article.content + outro;
}

async function run({ today, previousResults }) {
  logger.log(AGENT_NAME, '🧑‍💻 페르소나 리라이팅 시작');

  const articles = previousResults?.LogicSpecialist?.articles || [];
  if (articles.length === 0) return { summary: '리라이팅할 글 없음', articles: [] };

  const enriched = [];
  for (const article of articles) {
    const sector = article.tickers?.[0]
      ? previousResults?.DataMiner?.etfData?.etfList?.find(e => e.code === article.tickers[0])?.sector
      : undefined;
    const persona = pickPersona({ category: article.category, sector, date: today });

    const rewritten = await rewriteWithPersona(article, persona);
    const next = {
      ...article,
      content: rewritten,
      wordCount: rewritten.length,
      author: persona.name,
      authorId: persona.id,
      authorTitle: persona.title,
    };
    enriched.push(next);

    state.saveData(AGENT_NAME, 'processed', `humanized_${today}_${article.slug}.json`, next);
    logger.log(AGENT_NAME, `  ✍️ [${article.category}] ${persona.name} → ${rewritten.length}자`);
  }

  // LogicSpecialist 결과를 덮어써서 이후 에이전트들이 자연스럽게 사용
  previousResults.LogicSpecialist.articles = enriched;

  logger.success(AGENT_NAME, `${enriched.length}개 글 페르소나 입힘`);
  return {
    summary: `${enriched.length}개 글 페르소나 리라이팅`,
    articles: enriched,
  };
}

module.exports = { run };
