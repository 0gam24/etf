/**
 * 홈 통합 발행 피드 — MDX 글(content/)과 가이드(lib/guides.ts)를 하나의 타임라인으로.
 *   (RSS/Atom 피드 빌더는 lib/feed.ts — 별개 모듈)
 *
 *   메인 페이지 "오늘 발행 묶음" 히어로 + 최신 피드 + 카테고리 선반의 단일 데이터 소스.
 *   - 글(post): frontmatter date(ISO) 기준
 *   - 가이드(guide): GUIDE_PUBLISHED_AT(YYYY-MM-DD) 기준 (lastReviewed는 freshness 크론이
 *     일괄 갱신하므로 발행일로 쓸 수 없다 — guides.ts 주석 참조)
 *
 *   날짜 비교는 모두 KST 일 단위(YYYY-MM-DD)로 정규화한다.
 */

import { getAllPosts, getPostsByCategory, CATEGORY_NAMES, type Post } from './posts';
import { GUIDES, getGuidePublishedAt, type GuideDef } from './guides';

export interface HomeFeedItem {
  kind: 'post' | 'guide';
  title: string;
  href: string;
  /** 라우트 카테고리 키 (badge 클래스 등) — 가이드는 'guide' */
  category: string;
  /** 표시용 카테고리 라벨 */
  categoryName: string;
  /** KST 기준 발행일 YYYY-MM-DD */
  dateKey: string;
  /** 원본 날짜 문자열 (post: ISO / guide: YYYY-MM-DD) */
  date: string;
  description: string;
  /** AEO 직답 1줄 (guide.answer / post.summary) — 카드에 재사용해 홈을 텍스트 허브화 */
  answer?: string;
  readingTime?: number;
  tickers?: string[];
}

/** ISO 문자열 → KST 일자 키 (YYYY-MM-DD). 이미 일자 형식이면 그대로. */
export function toKstDateKey(dateStr: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const t = new Date(dateStr).getTime();
  if (Number.isNaN(t)) return dateStr.slice(0, 10);
  const kst = new Date(t + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

/** 'YYYY-MM-DD' → '2026년 7월 19일' */
export function formatDateKeyKo(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  if (!y || !m || !d) return key;
  return `${y}년 ${m}월 ${d}일`;
}

function postToFeedItem(p: Post): HomeFeedItem {
  return {
    kind: 'post',
    title: p.meta.title,
    href: `/${p.meta.category}/${p.meta.slug}`,
    category: p.meta.category,
    categoryName: p.categoryName,
    dateKey: toKstDateKey(p.meta.date),
    date: p.meta.date,
    description: p.meta.description,
    answer: p.meta.summary,
    readingTime: p.readingTime,
    tickers: p.meta.tickers,
  };
}

function guideToFeedItem(g: GuideDef, publishedAt: string): HomeFeedItem {
  return {
    kind: 'guide',
    title: g.title,
    href: `/guide/${g.slug}`,
    category: 'guide',
    categoryName: g.section,
    dateKey: publishedAt,
    date: publishedAt,
    description: g.description,
    answer: g.answer,
  };
}

/** 발행일이 기록된 가이드만 FeedItem으로 (초기 기반 가이드는 타임라인 제외). */
function getDatedGuideItems(): HomeFeedItem[] {
  const items: HomeFeedItem[] = [];
  for (const g of GUIDES) {
    const at = getGuidePublishedAt(g.slug);
    if (at) items.push(guideToFeedItem(g, at));
  }
  return items;
}

/** 전 카테고리(글+가이드) 통합 최신순 피드. */
export function getUnifiedFeed(limit?: number): HomeFeedItem[] {
  const items = [...getAllPosts().map(postToFeedItem), ...getDatedGuideItems()]
    .sort((a, b) => b.dateKey.localeCompare(a.dateKey) || b.date.localeCompare(a.date));
  return typeof limit === 'number' ? items.slice(0, limit) : items;
}

export interface LatestBundle {
  /** 최근 발행일 (KST YYYY-MM-DD) */
  dateKey: string;
  /** 그 날짜에 발행된 모든 글·가이드 */
  items: HomeFeedItem[];
  /** dateKey가 오늘(KST)인지 — 헤더 카피 분기용 */
  isToday: boolean;
}

/**
 * 오늘 발행 묶음 — 가장 최근 발행일 하루치 전체.
 *   주말·휴일 등 오늘 발행이 없으면 가장 최근 발행일 묶음을 반환하고 isToday=false.
 */
export function getLatestBundle(): LatestBundle | null {
  const feed = getUnifiedFeed();
  if (!feed.length) return null;
  const dateKey = feed[0].dateKey;
  const items = feed.filter(i => i.dateKey === dateKey);
  const todayKst = toKstDateKey(new Date().toISOString());
  return { dateKey, items, isToday: dateKey === todayKst };
}

export interface CategoryShelf {
  /** 라우트 키 ('guide' 포함) */
  category: string;
  label: string;
  href: string;
  items: HomeFeedItem[];
  total: number;
}

/** 메인 카테고리 선반 구성 — 헤더 메뉴 순서를 따른다 (콘텐츠 있는 카테고리만). */
const SHELF_CONFIG: { category: string; label: string; href: string }[] = [
  { category: 'guide', label: '투자 가이드', href: '/guide/latest' },
  { category: 'pulse', label: CATEGORY_NAMES.pulse, href: '/pulse' },
  { category: 'breaking', label: CATEGORY_NAMES.breaking, href: '/breaking' },
  { category: 'surge', label: CATEGORY_NAMES.surge, href: '/surge' },
  { category: 'flow', label: CATEGORY_NAMES.flow, href: '/flow' },
  { category: 'income', label: CATEGORY_NAMES.income, href: '/income' },
  { category: 'weekly', label: CATEGORY_NAMES.weekly, href: '/weekly' },
];

export function getCategoryShelves(perShelf = 3): CategoryShelf[] {
  const shelves: CategoryShelf[] = [];
  for (const cfg of SHELF_CONFIG) {
    let items: HomeFeedItem[];
    let total: number;
    if (cfg.category === 'guide') {
      const all = getDatedGuideItems()
        .sort((a, b) => b.dateKey.localeCompare(a.dateKey));
      total = GUIDES.length;
      items = all.slice(0, perShelf);
    } else {
      const posts = getPostsByCategory(cfg.category);
      total = posts.length;
      items = posts.slice(0, perShelf).map(postToFeedItem);
    }
    if (items.length > 0) {
      shelves.push({ category: cfg.category, label: cfg.label, href: cfg.href, items, total });
    }
  }
  return shelves;
}
