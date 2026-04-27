/**
 * 1️⃣-b NewsCollector
 *   - SeoArchitect 전략(surge 대상 종목)에 대해 최근 뉴스 수집 + Gemini 3줄 요약
 *   - 소스:
 *     1) 구글 뉴스 RSS (무료, 키 불필요)
 *     2) 네이버 검색 API (선택) — NAVER_CLIENT_ID + NAVER_CLIENT_SECRET 설정시 자동 병합
 *        · 한국 언론사 커버리지·스니펫 품질이 훨씬 좋음 · 일 25,000건 무료
 *
 *   입력: previousResults.DataMiner.etfData, previousResults.SeoArchitect.strategies
 *   출력: { summary: "3줄 요약 합본", byKeyword: { [keyword]: { headlines[], summary } } }
 */

const state = require('../pipeline/state_manager');
const logger = require('../pipeline/logger');
// YmylGuard의 금지 표현을 공유 — 헤드라인/스니펫에 포함된 것은 수집 단계에서 제외.
// (이 단어가 본문에 인용·링크로 삽입되면 YmylGuard가 파이프라인을 중단시킴)
const { BANNED_PHRASES } = require('./7_ymyl_guard');

const AGENT_NAME = 'NewsCollector';

/**
 * 헤드라인 텍스트에서 가이드 키워드를 추출 — 내부 링크 후보.
 *   InternalLinker가 본문 작성 후 활용 가능 (4b).
 */
const NEWS_TOPIC_TAGS = [
  { tag: 'monthly-dividend', patterns: [/월배당/, /분배금/, /배당락/] },
  { tag: 'covered-call',     patterns: [/커버드콜/, /OTM/i, /옵션 매도/, /JEPI/] },
  { tag: 'defense-etf',      patterns: [/방산/, /방위/, /무기/, /K-방산/] },
  { tag: 'ai-semi-etf',      patterns: [/반도체/, /HBM/i, /AI 반도체/, /엔비디아/, /SK하이닉스/] },
  { tag: 'retirement',       patterns: [/IRP/, /ISA/, /연금저축/, /은퇴/, /노후/] },
  { tag: 'shipbuilding',     patterns: [/조선/, /LNG선/, /암모니아/, /HD현대중공업/] },
  { tag: 'battery',          patterns: [/2차전지/, /배터리/, /LG에너지솔루션/, /양극재/] },
  { tag: 'us-equity',        patterns: [/미국 증시/, /나스닥/, /S&P500/i, /빅테크/] },
];

function tagHeadline(headline) {
  if (!headline) return [];
  const text = `${headline.title || ''} ${headline.snippet || ''}`;
  const tags = new Set();
  for (const { tag, patterns } of NEWS_TOPIC_TAGS) {
    if (patterns.some(p => p.test(text))) tags.add(tag);
  }
  return Array.from(tags);
}

/** 헤드라인이 YMYL 금지 단어를 포함하는지 검사 */
function hasBannedTerm(headline) {
  if (!headline) return false;
  const text = `${headline.title || ''} ${headline.snippet || ''}`;
  for (const p of BANNED_PHRASES) {
    if (text.includes(p)) return true;
  }
  return false;
}

/**
 * 네이버 검색 API로 뉴스 수집.
 *   - 키(NAVER_CLIENT_ID + NAVER_CLIENT_SECRET) 미설정 시 빈 배열 리턴해 스킵.
 *   - 응답의 <b> 태그는 검색어 강조용이라 제거. 엔티티 디코딩.
 *   - 반환 필드: title · source · pubDate · link · snippet — Google RSS와 동일 스키마로 병합 가능.
 */
async function fetchNaverNews(query, display = 6) {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  if (!clientId || !clientSecret) return [];

  const url = `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(query)}&display=${display}&sort=date`;
  try {
    const res = await fetch(url, {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
      },
    });
    if (!res.ok) {
      logger.warn(AGENT_NAME, `Naver API ${res.status} (${query})`);
      return [];
    }
    const json = await res.json();
    const items = (json.items || []).map(it => {
      const rawTitle = it.title || '';
      const rawDesc = it.description || '';
      // <b>...</b> 강조 태그 + 기타 HTML 제거 후 엔티티 디코딩
      const title = decodeHtml(rawTitle.replace(/<[^>]+>/g, ''));
      const snippet = decodeHtml(rawDesc.replace(/<[^>]+>/g, '').trim());
      // originallink가 있으면 원문, 없으면 네이버 링크
      const link = it.originallink || it.link || '';
      const source = extractSourceFromLink(link);
      return {
        title,
        source,
        pubDate: it.pubDate || '',
        link,
        snippet: snippet.length > 320 ? snippet.slice(0, 317) + '…' : snippet,
        _source: 'naver',
      };
    });
    return items;
  } catch (err) {
    logger.warn(AGENT_NAME, `Naver API 실패 (${query}): ${err.message}`);
    return [];
  }
}

/** URL에서 언론사 도메인 추출 (naver fallback용) */
function extractSourceFromLink(link) {
  if (!link) return '';
  try {
    const host = new URL(link).host.replace(/^www\./, '');
    // 흔한 한국 언론사 도메인 → 이름 매핑
    const map = {
      'chosun.com': '조선일보', 'biz.chosun.com': '조선비즈',
      'hankyung.com': '한국경제', 'mk.co.kr': '매일경제',
      'mt.co.kr': '머니투데이', 'edaily.co.kr': '이데일리',
      'news.mt.co.kr': '머니투데이', 'donga.com': '동아일보',
      'hani.co.kr': '한겨레', 'joongang.co.kr': '중앙일보',
      'yna.co.kr': '연합뉴스', 'einfomax.co.kr': '연합인포맥스',
      'fnnews.com': '파이낸셜뉴스', 'asiae.co.kr': '아시아경제',
      'sedaily.com': '서울경제', 'newspim.com': '뉴스핌',
      'etnews.com': '전자신문', 'dt.co.kr': '디지털타임스',
      'moneys.co.kr': '머니S', 'nocutnews.co.kr': '노컷뉴스',
      'newsis.com': '뉴시스', 'news1.kr': '뉴스1',
      'ajunews.com': '아주경제', 'pressian.com': '프레시안',
      'mbn.co.kr': 'MBN', 'ytn.co.kr': 'YTN',
      'kbs.co.kr': 'KBS', 'sbs.co.kr': 'SBS', 'mbc.co.kr': 'MBC',
    };
    return map[host] || host;
  } catch {
    return '';
  }
}

/** 중복 제거 병합 — 같은 link 또는 매우 유사한 title을 중복으로 간주 */
function mergeDedupe(...lists) {
  const seen = new Map();
  const out = [];
  for (const list of lists) {
    for (const it of list) {
      const linkKey = (it.link || '').trim();
      const titleKey = (it.title || '').replace(/[^가-힣a-zA-Z0-9]/g, '').slice(0, 30).toLowerCase();
      const key = linkKey || titleKey;
      if (!key) continue;
      if (seen.has(key)) continue;
      seen.set(key, true);
      out.push(it);
    }
  }
  return out;
}

async function fetchGoogleNews(query, maxItems = 6) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=ko&gl=KR&ceid=KR:ko`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 DailyETFPulse/1.0' } });
    if (!res.ok) return [];
    const xml = await res.text();
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(xml)) !== null && items.length < maxItems) {
      const block = match[1];
      const title = extractTag(block, 'title');
      const pubDate = extractTag(block, 'pubDate');
      const source = extractTag(block, 'source');
      const link = extractTag(block, 'link');
      // description은 Google News RSS가 여러 기사 링크·스니펫을 묶어 HTML로 주는 경우가 많음.
      // HTML 태그 제거 + 공백 정리 + 언론사 약칭 제거.
      const rawDesc = extractTag(block, 'description');
      const decodedTitleRaw = decodeHtml(title || '');
      const cleanedTitle = stripSourceSuffix(decodedTitleRaw, source);
      const snippet = cleanSnippet(rawDesc, cleanedTitle);
      if (cleanedTitle) items.push({
        title: cleanedTitle,
        source: source || '',
        pubDate,
        link,
        snippet,
      });
    }
    return items;
  } catch (err) {
    logger.warn(AGENT_NAME, `RSS 실패 (${query}): ${err.message}`);
    return [];
  }
}

/**
 * Google News RSS description은 구조적으로 같은 토픽 기사 묶음 HTML을 돌려주는 경우가 많음.
 * HTML 태그·엔티티 제거 → 제목 반복 여부 판정 → 제목과 거의 동일하면 빈값 리턴 (본문 요약이 아님).
 *
 * 파라미터:
 *   raw   — RSS description raw HTML
 *   title — 같은 <item>의 제목. 이 문자열이 description의 주된 구성이면 스니펫으로 가치 없음.
 */
function cleanSnippet(raw, title = '') {
  if (!raw) return '';
  let text = decodeHtml(raw)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // 제목의 핵심 60자가 description에 2회 이상 등장하면 "기사 묶음"으로 판정해 버림.
  if (title) {
    const titleCore = title.slice(0, 60);
    if (titleCore.length >= 15) {
      const occurrences = (text.match(new RegExp(escapeRegExp(titleCore.slice(0, 30)), 'g')) || []).length;
      if (occurrences >= 2) return '';
    }
    // 제목 + 같은 줄에 " - {source}" 형태가 description 대부분을 차지하면 버림.
    const strippedTitleLen = text.replace(/[^가-힣a-zA-Z0-9]/g, '').length;
    const titleLen = title.replace(/[^가-힣a-zA-Z0-9]/g, '').length;
    if (titleLen > 0 && strippedTitleLen > 0 && strippedTitleLen / titleLen <= 1.8) return '';
  }

  if (text.length > 320) text = text.slice(0, 317) + '…';
  return text;
}

function escapeRegExp(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Google News 제목은 "기사 제목 - 언론사" 형태가 흔함. 언론사 접미사를 제거해 중복 언급을 방지.
 * source가 비어있을 때도 보수적 패턴으로 마지막 " - {N자 이하}" 꼬리 한 번만 제거.
 */
function stripSourceSuffix(title, source) {
  if (!title) return title;
  let t = title.trim();
  if (source) {
    const src = source.trim();
    const re = new RegExp(`\\s*[-–—]\\s*${escapeRegExp(src)}\\s*$`);
    t = t.replace(re, '').trim();
  }
  // 일반 패턴: " - 12자 이하 한국어/영어"를 마지막에 붙인 꼬리
  t = t.replace(/\s+[-–—]\s+[가-힣A-Za-z0-9 .]{1,14}\s*$/, '').trim();
  return t;
}

function extractTag(block, tag) {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  if (!m) return '';
  return m[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim();
}

function decodeHtml(s) {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&#160;/g, ' ')
    .replace(/&hellip;/g, '…')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&lsquo;|&rsquo;/g, "'")
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(parseInt(n, 10)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

async function summarizeWithGemini(topic, headlines) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || headlines.length === 0) {
    return headlines.slice(0, 3).map(h => `- ${h.title}`).join('\n');
  }

  try {
    const prompt = `다음은 "${topic}" 관련 최근 한국 금융 뉴스 헤드라인입니다.
사실 기반으로 **정확히 3줄**로 요약하세요. 각 줄은 한 문장(50자 이내).
추측·수익보장 표현 금지. 헤드라인만 이용.

헤드라인:
${headlines.map((h, i) => `${i + 1}. ${h.title}${h.source ? ` (${h.source})` : ''}`).join('\n')}

출력 형식 (순수 텍스트 3줄, 각 줄 앞에 "- "):
- 첫 번째 요약
- 두 번째 요약
- 세 번째 요약`;

    // flash-lite 우선 (무료 티어 한도가 flash보다 넉넉). 실패 시 flash로 폴백.
    const models = ['gemini-2.5-flash-lite', 'gemini-2.5-flash'];
    let response;
    for (const m of models) {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 512 },
          }),
        }
      );
      if (response.ok) break;
      if (response.status !== 429 && response.status !== 503) break;
    }
    if (!response.ok) return headlines.slice(0, 3).map(h => `- ${h.title}`).join('\n');
    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return text.trim() || headlines.slice(0, 3).map(h => `- ${h.title}`).join('\n');
  } catch {
    return headlines.slice(0, 3).map(h => `- ${h.title}`).join('\n');
  }
}

async function run({ today, previousResults }) {
  logger.log(AGENT_NAME, '📰 뉴스 수집 시작');

  const strategies = previousResults?.SeoArchitect?.strategies || [];
  if (strategies.length === 0) {
    logger.warn(AGENT_NAME, '전략 없음 — 뉴스 수집 건너뜀');
    return { summary: '뉴스 수집 건너뜀', byKeyword: {} };
  }

  const byKeyword = {};
  const allHeadlines = [];

  for (const strategy of strategies) {
    // surge는 특정 ETF명이 핵심, 나머지는 섹터/테마 중심
    let query;
    if (strategy.templateType === 'breaking' && strategy.focusEtf) {
      // 속보는 ETF 이름 + 섹터를 함께 넣어 최신성 높은 결과 확보
      query = `${strategy.focusEtf.name} ${strategy.focusEtf.sector || ''}`.trim();
    } else if (strategy.templateType === 'surge' && strategy.focusEtf) {
      query = strategy.focusEtf.name;
    } else if (strategy.templateType === 'flow' && strategy.sectorFlow?.[0]) {
      query = `${strategy.sectorFlow[0].sector} ETF 자금`;
    } else if (strategy.templateType === 'income') {
      query = '월배당 ETF 커버드콜';
    } else {
      query = 'ETF 시장 동향';
    }

    logger.log(AGENT_NAME, `  🔎 "${query}"`);
    // Google News RSS + 네이버 검색 API 병렬 수집
    const [googleHeadlines, naverHeadlines] = await Promise.all([
      fetchGoogleNews(query, 8),
      fetchNaverNews(query, 8),
    ]);
    // 네이버 먼저 — 한국 언론사 스니펫 품질이 대체로 더 좋음. 그 다음 Google로 보충.
    // YMYL 금지 단어 포함 기사는 선제 제거 (본문 인용 → YmylGuard 반려 방지)
    const merged = mergeDedupe(naverHeadlines, googleHeadlines);
    const banned = merged.filter(hasBannedTerm);
    const safe = merged.filter(h => !hasBannedTerm(h));
    if (banned.length > 0) {
      logger.warn(AGENT_NAME, `     ⚠️  YMYL 금지 단어 헤드라인 ${banned.length}건 제외`);
    }
    const headlines = safe.slice(0, 8);
    const summary = await summarizeWithGemini(query, headlines);

    byKeyword[strategy.keyword] = {
      query,
      strategyId: strategy.id,
      category: strategy.category,
      headlines: headlines.map(h => ({
        title: h.title,
        source: h.source,
        pubDate: h.pubDate,
        link: h.link,
        snippet: h.snippet || '',
      })),
      summary,
      // 헤드라인별 내부 링크 후보 태그 (가이드 slug 매핑) — InternalLinker가 활용 가능
      topicTags: Array.from(new Set(headlines.flatMap(tagHeadline))),
    };
    allHeadlines.push(...headlines.slice(0, 3));
    const g = googleHeadlines.length, n = naverHeadlines.length;
    logger.log(AGENT_NAME, `     ↳ ${headlines.length}개 헤드라인 (Google ${g} · Naver ${n}), 요약 ${summary.length}자, 태그 ${byKeyword[strategy.keyword].topicTags.join(',') || '-'}`);
  }

  state.saveData(AGENT_NAME, 'raw', `news_${today}.json`, { byKeyword });

  // LogicSpecialist가 간편하게 참조할 수 있도록 통합 요약도 같이 제공
  const topLines = allHeadlines.slice(0, 5).map(h => `- ${h.title}`).join('\n');

  logger.success(AGENT_NAME, `${Object.keys(byKeyword).length}개 전략에 대한 뉴스 요약 완료`);
  return {
    summary: topLines || '뉴스 없음',
    byKeyword,
  };
}

module.exports = { run };
