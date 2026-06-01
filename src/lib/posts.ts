/**
 * MDX 포스팅 파싱 라이브러리 — Daily ETF Pulse
 * content/ 이하 카테고리별 MDX 파일을 읽어 메타/본문을 반환.
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const CONTENT_DIR = path.join(process.cwd(), 'content');

export const CATEGORY_NAMES: Record<string, string> = {
  pulse: '오늘의 관전포인트',
  surge: '급등 테마 분석',
  flow: '자금 흐름 리포트',
  income: '월배당·커버드콜',
  breaking: 'ETF 속보',
  weekly: '주간 펄스 리포트',
  stock: '종목 완벽 가이드',
  'theme/ai': 'AI·데이터',
  'theme/semi': '반도체',
  'theme/shipbuilding': '조선',
  'theme/defense': '방위산업',
  'account/irp': '퇴직연금(IRP)',
  'account/isa': 'ISA 계좌',
  'account/pension': '연금저축',
};

export const TOP_LEVEL_CATEGORIES = ['pulse', 'surge', 'flow', 'income', 'breaking'] as const;
export const THEME_CATEGORIES = ['theme/ai', 'theme/semi', 'theme/shipbuilding', 'theme/defense'] as const;
export const ACCOUNT_CATEGORIES = ['account/irp', 'account/isa', 'account/pension'] as const;
export const ALL_CATEGORIES = [
  ...TOP_LEVEL_CATEGORIES,
  'weekly',
  'stock',
  ...THEME_CATEGORIES,
  ...ACCOUNT_CATEGORIES,
];

export interface PostMeta {
  title: string;
  slug: string;
  category: string;
  date: string;
  description: string;
  keywords: string[];
  author: string;
  authorId?: string;
  charts: string[];
  affiliates: string[];
  adPlacements: number;
  pulseDate?: string;
  tickers?: string[];
  schemas?: object[];
  weekCode?: string;
  ticker?: string;
  sector?: string;
  /** AEO 정답블록 — 직답 1문장 (≤55자 권장, 사실서술형). AI Overview·피처드스니펫 인용용. */
  summary?: string;
  /** AEO 정답블록 — 핵심 수치 3개 (현재가·등락률·거래량 등). dl 마크업으로 렌더. */
  keyStats?: { label: string; value: string; sub?: string }[];
  /** AEO FAQ — 자연어 질문/자기완결 답변. 인라인 FAQPage 가 없을 때만 가시 렌더 + JSON-LD. */
  faqs?: { question: string; answer: string }[];
}

export interface Post {
  meta: PostMeta;
  content: string;
  readingTime: number;
  categoryName: string;
}

export function getPostsByCategory(category: string): Post[] {
  const categoryDir = path.join(CONTENT_DIR, category);
  if (!fs.existsSync(categoryDir)) return [];

  const files = fs.readdirSync(categoryDir).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
  return files
    .map(filename => parsePostFile(path.join(categoryDir, filename), category))
    .sort((a, b) => new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime());
}

export function getAllPosts(): Post[] {
  const allPosts: Post[] = [];
  for (const category of ALL_CATEGORIES) {
    allPosts.push(...getPostsByCategory(category));
  }
  return allPosts.sort((a, b) => new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime());
}

export function getLatestPulse(): Post | null {
  const pulses = getPostsByCategory('pulse');
  return pulses[0] ?? null;
}

/**
 * 카테고리별 가장 최근 글의 발행일.
 *   sitemap의 lastmod 정확화에 사용 — Google 가이드:
 *   "lastmod는 페이지가 마지막으로 의미 있게 변경된 시점이어야 한다."
 *   글 하나 더 발행 = 카테고리 랜딩이 바뀐 것 (최신 글 노출).
 */
export function getCategoryLastModified(category: string): Date | null {
  const posts = getPostsByCategory(category);
  if (!posts.length) return null;
  return new Date(posts[0].meta.date);
}

/**
 * 사이트 전체에서 가장 최근 발행된 글의 날짜 (홈 lastmod용).
 */
export function getSiteLastModified(): Date | null {
  const all = getAllPosts();
  if (!all.length) return null;
  return new Date(all[0].meta.date);
}

/**
 * 특정 저자의 가장 최근 글 발행일 (저자 허브 lastmod용).
 */
export function getAuthorLastModified(authorId: string): Date | null {
  const all = getAllPosts();
  const byAuthor = all.filter(p => p.meta.authorId === authorId);
  if (!byAuthor.length) return null;
  return new Date(byAuthor[0].meta.date);
}

/**
 * 주식(종목) 포스트 중 frontmatter의 ticker가 일치하는 것을 찾습니다.
 * 한국 6자리/미국 3-4자리 티커 모두 지원. 없으면 null.
 */
export function findStockPostByTicker(ticker: string): Post | null {
  if (!ticker) return null;
  const normalized = ticker.trim().toUpperCase();
  const stockPosts = getPostsByCategory('stock');
  return stockPosts.find(p => (p.meta.ticker || '').toUpperCase() === normalized) || null;
}

/**
 * 관련 글 추천 — 글 하단 "함께 읽어보면 좋은 분석" 동선용.
 *   관련도 가중 정렬: ① 티커 교집합 수 → ② 같은 섹터 → ③ 같은 카테고리, 동률은 최신순.
 *   세션당 페이지뷰(=자동광고 노출)·내부링크 관련성을 높인다.
 *   기존 "같은 카테고리 앞 N개 slice" 의 naive 로직을 대체.
 */
export function getRelatedPosts(current: Post, limit = 4): Post[] {
  const curTickers = new Set((current.meta.tickers || []).map(t => (t || '').toUpperCase()));
  const curSector = (current.meta.sector || '').trim();
  const curCat = current.meta.category;

  const scored = getAllPosts()
    .filter(p => p.meta.slug !== current.meta.slug || p.meta.category !== curCat)
    .map(p => {
      const tickerOverlap = (p.meta.tickers || [])
        .filter(t => curTickers.has((t || '').toUpperCase())).length;
      const sameSector = curSector && p.meta.sector === curSector ? 1 : 0;
      const sameCat = p.meta.category === curCat ? 1 : 0;
      // 가중치: 티커 교집합(×100) > 섹터(×10) > 카테고리(×1)
      const score = tickerOverlap * 100 + sameSector * 10 + sameCat;
      return { post: p, score, ts: new Date(p.meta.date).getTime() };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => (b.score - a.score) || (b.ts - a.ts));

  return scored.slice(0, limit).map(x => x.post);
}

/**
 * 티커가 `meta.tickers[]`에 포함된 포스트를 카테고리 우선순위대로 탐색.
 *   - ETF 코드를 받아 "가장 깊이 다룬 글"을 찾는 용도.
 *   - 같은 카테고리 내에선 최신글 우선.
 *   - 모든 카테고리에서 못 찾으면 null.
 */
export function findPostByTickerInCategories(
  ticker: string,
  categories: string[],
): Post | null {
  if (!ticker) return null;
  const normalized = ticker.trim().toUpperCase();
  for (const cat of categories) {
    const posts = getPostsByCategory(cat);
    const hit = posts.find(p =>
      (p.meta.tickers || []).some(t => (t || '').toUpperCase() === normalized),
    );
    if (hit) return hit;
  }
  return null;
}

export function getPostBySlug(category: string, slug: string): Post | null {
  const decodedSlug = decodeURIComponent(slug);
  const mdxPath = path.join(CONTENT_DIR, category, `${decodedSlug}.mdx`);
  const mdPath = path.join(CONTENT_DIR, category, `${decodedSlug}.md`);

  if (fs.existsSync(mdxPath)) return parsePostFile(mdxPath, category);
  if (fs.existsSync(mdPath)) return parsePostFile(mdPath, category);
  return null;
}

function parsePostFile(filePath: string, category: string): Post {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  const readingTime = Math.max(1, Math.ceil(content.length / 500));

  return {
    meta: {
      title: data.title || '제목 없음',
      slug: data.slug || path.basename(filePath).replace(/\.mdx?$/, ''),
      category,
      date: data.date || new Date().toISOString(),
      description: data.description || '',
      keywords: data.keywords || [],
      author: data.author || 'Daily ETF Pulse',
      authorId: data.authorId,
      charts: data.charts || [],
      affiliates: data.affiliates || [],
      adPlacements: data.adPlacements || 0,
      pulseDate: data.pulseDate,
      tickers: data.tickers || [],
      schemas: data.schemas,
      weekCode: data.weekCode,
      ticker: data.ticker,
      sector: data.sector,
      summary: data.summary,
      keyStats: Array.isArray(data.keyStats) ? data.keyStats : undefined,
      faqs: Array.isArray(data.faqs)
        ? data.faqs
            .filter((f: unknown): f is { question: string; answer: string } =>
              !!f && typeof (f as { question?: unknown }).question === 'string'
                   && typeof (f as { answer?: unknown }).answer === 'string')
        : undefined,
    },
    content,
    readingTime,
    categoryName: CATEGORY_NAMES[category] || category,
  };
}

export function getAllPostSlugs(): { category: string; slug: string }[] {
  const slugs: { category: string; slug: string }[] = [];
  for (const category of ALL_CATEGORIES) {
    const categoryDir = path.join(CONTENT_DIR, category);
    if (!fs.existsSync(categoryDir)) continue;
    const files = fs.readdirSync(categoryDir).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
    for (const file of files) {
      slugs.push({ category, slug: file.replace(/\.mdx?$/, '') });
    }
  }
  return slugs;
}
