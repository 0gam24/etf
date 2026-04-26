/**
 * 4b. InternalLinker — 자연스러운 내부 링크 자동 삽입
 *
 *   현재 발행 예정 글에 대해 content/ 내 기존 MDX를 스캔해 **본문 중간에 최대 2개**의
 *   관련 글을 소프트 인라인 링크로 녹여냅니다.
 *
 *   이전 버전은 결론 직전에 "함께 읽어보면 좋은 분석" 블록을 추가로 붙였으나,
 *   **프론트엔드(`[category]/[slug]/page.tsx`)가 이미 하단에 관련 글 섹션을 렌더**하므로
 *   중복을 제거했습니다. 본문 내부 링크는 독서 흐름에 녹이는 최소 개입만 담당.
 *
 *   마크다운 링크 [제목](/category/slug) 형태로 Markdown 문맥에 녹여냄.
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const state = require('../pipeline/state_manager');
const logger = require('../pipeline/logger');

const AGENT_NAME = 'InternalLinker';

function scanAllPosts() {
  const contentDir = state.PATHS.contentDir;
  const posts = [];
  if (!fs.existsSync(contentDir)) return posts;

  function walk(dir, prefix = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full, prefix ? `${prefix}/${entry.name}` : entry.name);
      } else if (entry.isFile() && entry.name.endsWith('.mdx')) {
        try {
          const raw = fs.readFileSync(full, 'utf-8');
          const { data } = matter(raw);
          posts.push({
            category: prefix,
            slug: data.slug || entry.name.replace(/\.mdx$/, ''),
            title: data.title || '',
            date: data.date || '',
            tickers: data.tickers || [],
            keywords: data.keywords || [],
          });
        } catch { /* skip */ }
      }
    }
  }
  walk(contentDir);
  return posts;
}

function pickRelated(article, sector, allPosts) {
  const excludeSlug = article.slug;
  const related = [];

  // 1) ticker 겹치는 1개 — 가장 강한 연관성이므로 우선
  const articleTickers = new Set(article.tickers || []);
  if (articleTickers.size > 0) {
    const tickerMatch = allPosts
      .filter(p => p.slug !== excludeSlug
        && (p.tickers || []).some(t => articleTickers.has(t)))
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    if (tickerMatch) related.push({ ...tickerMatch, reason: 'ticker-overlap' });
  }

  // 2) 같은 sector 겹치는 1개 (티커와 다른 것)
  if (sector && related.length < 2) {
    const sectorMatch = allPosts
      .filter(p => p.slug !== excludeSlug
        && !related.some(r => r.slug === p.slug)
        && (p.keywords || []).some(k => k.includes(sector)))
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    if (sectorMatch) related.push({ ...sectorMatch, reason: 'sector-overlap' });
  }

  // 3) 같은 카테고리 최신 1개 (fallback)
  if (related.length < 2) {
    const sameCategory = allPosts
      .filter(p => p.category === article.category
        && p.slug !== excludeSlug
        && !related.some(r => r.slug === p.slug))
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    if (sameCategory) related.push({ ...sameCategory, reason: 'same-category' });
  }

  return related.slice(0, 2);
}

/**
 * 가이드(허브) 페이지로의 자동 키워드 링크.
 *   본문에서 핵심 키워드 첫 등장 1회를 [키워드](/guide/{slug}) 로 치환.
 *   - 코드 블록(```), 기존 마크다운 링크 [..](..), 헤딩(#~######) 라인은 건너뜀
 *   - 키워드당 1회만 링크 (스팸 방지)
 *   - 동일 가이드로의 링크는 한 글에 최대 1개 (다양성 확보)
 *
 *   결과: 데일리 글이 자연스레 가이드 허브로 트래픽 흐름을 보내고
 *         Google이 가이드 페이지의 권위/주제 신호로 인식.
 */
const KEYWORD_GUIDE_MAP = [
  // 더 구체적인 키워드를 먼저 — 매칭 우선순위
  { keyword: '월배당 ETF',        slug: 'monthly-dividend' },
  { keyword: '커버드콜 ETF',      slug: 'covered-call' },
  { keyword: '방산 ETF',          slug: 'defense-etf' },
  { keyword: 'AI ETF',           slug: 'ai-semi-etf' },
  { keyword: '반도체 ETF',        slug: 'ai-semi-etf' },
  { keyword: '연금저축',          slug: 'retirement' },
  { keyword: 'IRP',              slug: 'retirement' },
  { keyword: 'ISA',              slug: 'retirement' },
  { keyword: '월배당',            slug: 'monthly-dividend' },
  { keyword: '커버드콜',          slug: 'covered-call' },
];

function injectKeywordGuideLinks(content) {
  if (!content) return content;

  const lines = content.split('\n');
  const usedSlugs = new Set();
  const usedKeywords = new Set();
  let inCodeFence = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('```')) { inCodeFence = !inCodeFence; continue; }
    if (inCodeFence) continue;
    if (/^#{1,6}\s/.test(line)) continue; // 헤딩 라인 skip

    let mutated = line;
    for (const { keyword, slug } of KEYWORD_GUIDE_MAP) {
      if (usedSlugs.has(slug)) continue;
      if (usedKeywords.has(keyword)) continue;

      // 기존 링크 텍스트 안에 들어 있으면 skip — `[...keyword...](...)` 패턴 방지
      const insideLinkRe = new RegExp(`\\[[^\\]]*${escapeRegex(keyword)}[^\\]]*\\]\\([^)]+\\)`);
      if (insideLinkRe.test(mutated)) {
        usedKeywords.add(keyword);
        continue;
      }

      // 첫 등장만 링크화 — lookahead로 직후 ']'/`(` 같은 링크 컨텍스트 회피
      const re = new RegExp(`(^|[^\\[\\]\\w가-힣])${escapeRegex(keyword)}(?![\\]\\w가-힣])`, '');
      const m = mutated.match(re);
      if (!m) continue;

      const replaceWith = `${m[1]}[${keyword}](/guide/${slug})`;
      mutated = mutated.replace(re, replaceWith);
      usedSlugs.add(slug);
      usedKeywords.add(keyword);
    }
    lines[i] = mutated;
  }
  return lines.join('\n');
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 본문 중간 h2 경계에 소프트 인라인 링크 1~2개 삽입.
 *   - 0개 관련: 변화 없음
 *   - 1개: 중앙 h2 위치에 삽입
 *   - 2개: 1/3 · 2/3 h2 위치에 분산 삽입
 *   자연스러운 blockquote 인용 형식 사용.
 */
function injectSoftLinks(content, related) {
  if (related.length === 0) return content;

  const lines = content.split('\n');
  const h2Positions = [];
  lines.forEach((line, i) => { if (line.startsWith('## ')) h2Positions.push(i); });
  if (h2Positions.length < 2) return content;

  const phrasing = {
    'ticker-overlap':   r => `\n> 관련 분석: [${r.title}](/${r.category}/${r.slug}) — 같은 종목을 다른 각도에서 다룹니다.\n`,
    'sector-overlap':   r => `\n> 섹터 배경: [${r.title}](/${r.category}/${r.slug})을 함께 읽으면 이해가 빠릅니다.\n`,
    'same-category':    r => `\n> 이어서 보기 좋은 글: [${r.title}](/${r.category}/${r.slug}).\n`,
  };

  // 뒤에서 앞으로 삽입해야 인덱스가 틀어지지 않음
  const insertPositions = related.length === 1
    ? [h2Positions[Math.floor(h2Positions.length / 2)]]
    : [
        h2Positions[Math.floor(h2Positions.length / 3)],
        h2Positions[Math.floor(h2Positions.length * 2 / 3)],
      ];
  const sorted = insertPositions
    .map((pos, i) => ({ pos, sentence: phrasing[related[i].reason](related[i]) }))
    .sort((a, b) => b.pos - a.pos);

  for (const { pos, sentence } of sorted) {
    lines.splice(pos, 0, sentence);
  }
  return lines.join('\n');
}

async function run({ today, previousResults }) {
  logger.log(AGENT_NAME, '🔗 내부 링크 매칭');

  const articles = previousResults?.LogicSpecialist?.articles || [];
  if (articles.length === 0) return { summary: '링크 삽입 건너뜀', linkedArticles: [] };

  const allPosts = scanAllPosts();
  logger.log(AGENT_NAME, `  📚 기존 글 ${allPosts.length}개 스캔`);

  const linked = [];
  for (const article of articles) {
    const sector = article.tickers?.[0]
      ? previousResults?.DataMiner?.etfData?.etfList?.find(e => e.code === article.tickers[0])?.sector
      : undefined;

    const related = pickRelated(article, sector, allPosts);

    // 본문 중간 소프트 링크 + 핵심 키워드 자동 가이드 링크
    const withSoftLinks = injectSoftLinks(article.content, related);
    const newContent = injectKeywordGuideLinks(withSoftLinks);

    // 자동 가이드 링크 카운트 (감사 로그용) — 새로 추가된 /guide/ 링크 수
    const guideLinksAdded = (newContent.match(/\]\(\/guide\//g) || []).length
                          - (article.content.match(/\]\(\/guide\//g) || []).length;

    const next = { ...article, content: newContent, wordCount: newContent.length, relatedLinks: related };
    linked.push(next);
    logger.log(AGENT_NAME, `  🔗 [${article.category}] 본문 링크 ${related.length}개 + 가이드 링크 ${guideLinksAdded}개 (티커 ${related.filter(r => r.reason === 'ticker-overlap').length} · 섹터 ${related.filter(r => r.reason === 'sector-overlap').length} · 카테고리 ${related.filter(r => r.reason === 'same-category').length})`);
  }

  previousResults.LogicSpecialist.articles = linked;

  logger.success(AGENT_NAME, `${linked.length}개 글에 내부 링크 삽입`);
  return {
    summary: `${linked.length}개 글 내부 링크 ${linked.reduce((s, a) => s + (a.relatedLinks?.length || 0), 0)}개 삽입`,
    linkedArticles: linked,
  };
}

module.exports = { run };
