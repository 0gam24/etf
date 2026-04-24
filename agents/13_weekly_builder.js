/**
 * 13. WeeklyBuilder — 매주 일요일 특수 모드
 *
 *   일일 파이프라인과 별개로, 일요일에 WeeklyReport + StockMaster 각 1편을 추가 생성.
 *   orchestrator의 주력 플로우 종료 후 호출되며, content/weekly/YYYY-Wnn.mdx 형태로 저장.
 *
 *   WeeklyReport: 지난 7일 ETF 거래량·섹터 자금흐름 집계 + analyst_han 페르소나
 *   StockMaster:  거래량 TOP30 중 일요일 기준 순환 선정 + pb_kim 페르소나
 */

const fs = require('fs');
const path = require('path');
const state = require('../pipeline/state_manager');
const logger = require('../pipeline/logger');
const { pickPersona, PERSONAS } = require('./personas');

const AGENT_NAME = 'WeeklyBuilder';

function isoWeekCode(d = new Date()) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayNum + 3);
  const firstThursday = date.valueOf();
  date.setUTCMonth(0, 1);
  if (date.getUTCDay() !== 4) {
    date.setUTCMonth(0, 1 + ((4 - date.getUTCDay()) + 7) % 7);
  }
  const weekNum = 1 + Math.ceil((firstThursday - date) / 604800000);
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

async function geminiWrite(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
        }),
      }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch {
    return null;
  }
}

// ───── 주간 리포트 ─────
async function buildWeeklyReport(etfData) {
  const persona = PERSONAS.analyst_han;
  const weekCode = isoWeekCode();
  const sectors = (etfData.sectorFlow || []).slice(0, 8);
  const top10 = (etfData.byVolume || []).slice(0, 10);

  const prompt = `당신은 증권사 리서치센터 애널리스트 ${persona.name}(${persona.age}세)입니다.
이력: ${persona.bio}
말투: "${persona.voiceHints[0]}" 같은 어투.

지난 한 주(${weekCode})의 ETF 시장을 3000자 이상의 주간 리포트로 정리하세요.

입력 데이터:
- 섹터별 평균 등락률·거래대금 (TOP8):
${sectors.map((s, i) => `${i + 1}. ${s.sector}: ${s.avgChangeRate}% (거래대금 ${Math.round(s.totalAmount / 1e8)}억)`).join('\n')}

- 거래량 TOP10:
${top10.map((e, i) => `${i + 1}. ${e.name} (${e.code}): ${e.changeRate}%, ${(e.volume / 10000).toFixed(0)}만주`).join('\n')}

필수 섹션 (H2):
## 이번 주 시장 요약
## 섹터 로테이션 분석 (표 필수)
## 거래량 상위 10종목 (표 필수)
## 외국인·기관 수급 해석
## 다음 주 관전포인트
## 저의 결론

규칙:
- H1 금지
- 수익 보장·매수 권유 금지
- 메타 데이터(CPC·SEO·애드센스) 금지
- 마지막 줄: "${persona.closingSignature}"
`;

  const text = await geminiWrite(prompt);
  if (!text) {
    return localWeeklyStub(sectors, top10, weekCode, persona);
  }
  return { title: `${weekCode} 주간 ETF 펄스 리포트`, content: text.trim(), persona, weekCode };
}

function localWeeklyStub(sectors, top10, weekCode, persona) {
  const content = `
## 이번 주 시장 요약

${persona.voiceHints[0]} 이번 주는 ${sectors[0]?.sector || '주요 섹터'} 중심으로 자금이 집중되는 흐름이었습니다.

## 섹터 로테이션 분석

| 섹터 | 평균 등락률 | 거래대금 (억원) |
|---|---|---|
${sectors.map(s => `| ${s.sector} | ${s.avgChangeRate >= 0 ? '+' : ''}${s.avgChangeRate}% | ${Math.round(s.totalAmount / 1e8).toLocaleString()} |`).join('\n')}

## 거래량 상위 10종목

| 순위 | 종목명 | 등락률 | 거래량 |
|---|---|---|---|
${top10.map((e, i) => `| ${i + 1} | ${e.name} | ${e.changeRate >= 0 ? '+' : ''}${e.changeRate}% | ${(e.volume / 10000).toFixed(0)}만주 |`).join('\n')}

## 외국인·기관 수급 해석

상위 섹터로의 자금 집중은 기관 투자자의 섹터 로테이션 신호로 해석할 여지가 있습니다. 단기 모멘텀을 추종하기보다는 분산과 리스크 관리를 우선하시기 바랍니다.

## 다음 주 관전포인트

- 미국 주요 경제 지표 발표 일정
- 환율 변동성
- 주요 섹터 실적 발표

## 저의 결론

${persona.voiceHints[3]} 다음 주는 외국인 수급 전환 시그널이 관찰되는 섹터를 주의 깊게 추적해보세요.

${persona.closingSignature}
`;
  return { title: `${weekCode} 주간 ETF 펄스 리포트`, content: content.trim(), persona, weekCode };
}

// ───── 종목 마스터 페이지 ─────
async function buildStockMaster(etfData) {
  // 거래량 TOP30 중 이번 주 일요일 번호로 순환 선정
  const top30 = (etfData.etfList || []).slice().sort((a, b) => b.volume - a.volume).slice(0, 30);
  if (top30.length === 0) return null;

  const weekIdx = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000)) % top30.length;
  const target = top30[weekIdx];
  const persona = pickPersona({ category: 'income', sector: target.sector, date: new Date() });

  const prompt = `당신은 ${persona.name}(${persona.age}세), ${persona.title}입니다.
말투: "${persona.voiceHints[0]}"

${target.name}(${target.code}) ETF에 대한 **완벽 가이드** 마스터 페이지를 Markdown으로 5000자 이상 작성하세요.

입력 데이터:
- 종목명: ${target.name}
- 코드: ${target.code}
- 현재가: ${target.price.toLocaleString()}원 (${target.changeRate >= 0 ? '+' : ''}${target.changeRate}%)
- 거래량: ${(target.volume / 10000).toFixed(0)}만주
- 시가총액: ${Math.round((target.marketCap || 0) / 1e8).toLocaleString()}억원
- 섹터: ${target.sector}

필수 섹션:
## 한눈에 보는 ${target.name}
## 어떤 종목을 담는가 (기초자산)
## 수익률·배당 이력 분석
## 세금 구조 (일반계좌·ISA·IRP·연금저축 비교 표)
## 경쟁 ETF와의 비교 (표)
## 언제 사고 언제 팔아야 할까
## FAQ (3개)
## 저의 결론

규칙:
- H1 금지. 메타 데이터 금지. 수익 보장·매수 권유 금지.
- 표 필수. 비교 섹션은 반드시 Markdown 표.
- 마지막 줄: "${persona.closingSignature}"
`;

  const text = await geminiWrite(prompt);
  if (!text) return null;
  return {
    title: `${target.name} 완벽 가이드 — 수익률·배당·세금·2026 전망`,
    content: text.trim(),
    persona,
    ticker: target.code,
    etf: target,
  };
}

// ───── MDX 저장 ─────
function saveMdx(subdir, slug, frontmatter, content) {
  const dir = path.join(state.PATHS.contentDir, subdir);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const yaml = Object.entries(frontmatter)
    .map(([k, v]) => {
      if (Array.isArray(v)) return `${k}:\n${v.map(x => `  - "${String(x).replace(/"/g, '\\"')}"`).join('\n')}`;
      return `${k}: "${String(v).replace(/"/g, '\\"')}"`;
    })
    .join('\n');
  const mdx = `---\n${yaml}\n---\n\n${content}\n`;
  const file = path.join(dir, `${slug}.mdx`);
  fs.writeFileSync(file, mdx, 'utf-8');
  return file;
}

async function run({ today, previousResults }) {
  // 일요일(KST)에만 실행
  const dow = new Date().getDay();
  if (dow !== 0) {
    return { summary: '일요일 아님 — 건너뜀', weeklyReport: null, stockMaster: null };
  }

  logger.log(AGENT_NAME, '📅 일요일 특수 모드 — 주간 리포트 + 종목 마스터 생성');

  const etfData = previousResults?.DataMiner?.etfData;
  if (!etfData) return { summary: 'DataMiner 없음', weeklyReport: null, stockMaster: null };

  // 1) Weekly Report
  const weekly = await buildWeeklyReport(etfData);
  const weeklySlug = weekly.weekCode;
  const weeklyFile = saveMdx('weekly', weeklySlug, {
    title: weekly.title,
    slug: weeklySlug,
    category: 'weekly',
    date: new Date().toISOString(),
    description: `${weekly.weekCode} 주간 ETF·섹터 로테이션 종합 리포트`,
    keywords: ['주간 ETF 리포트', '섹터 로테이션', '외국인 수급'],
    author: weekly.persona.name,
    authorId: weekly.persona.id,
    weekCode: weekly.weekCode,
  }, weekly.content);
  logger.success(AGENT_NAME, `  📄 주간 리포트: weekly/${weeklySlug}.mdx`);

  // 2) Stock Master
  const stock = await buildStockMaster(etfData);
  let stockFile = null;
  if (stock) {
    stockFile = saveMdx('stock', stock.ticker, {
      title: stock.title,
      slug: stock.ticker,
      category: 'stock',
      date: new Date().toISOString(),
      description: `${stock.etf.name} ETF 완벽 가이드 — 수익률·분배금·세금·경쟁 ETF 비교`,
      keywords: [`${stock.etf.name}`, `${stock.etf.code}`, 'ETF 완벽 가이드', stock.etf.sector + ' ETF'],
      author: stock.persona.name,
      authorId: stock.persona.id,
      ticker: stock.ticker,
      sector: stock.etf.sector,
    }, stock.content);
    logger.success(AGENT_NAME, `  📄 종목 마스터: stock/${stock.ticker}.mdx (${stock.etf.name})`);
  } else {
    logger.warn(AGENT_NAME, '  ⚠️ 종목 마스터 생성 실패 (Gemini 응답 없음)');
  }

  return {
    summary: `일요일 특수 모드 — 주간 리포트${stock ? ' + 종목 마스터' : ''} 발행`,
    weeklyReport: { file: weeklyFile, weekCode: weekly.weekCode },
    stockMaster: stock ? { file: stockFile, ticker: stock.ticker } : null,
  };
}

module.exports = { run };
