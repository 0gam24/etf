import fs from 'node:fs';
import path from 'node:path';
import { getAllPosts, getPostsByCategory, CATEGORY_NAMES, TOP_LEVEL_CATEGORIES } from '@/lib/posts';

/**
 * 구독 피드 공용 빌더 — RSS 2.0 · Atom 1.0 · JSON Feed 1.1 + 카테고리별 RSS.
 *   /rss.xml · /atom.xml · /feed.json · /rss/{category}.xml 라우트가 공유.
 *   콘텐츠 소스는 getAllPosts() + /today 일별 리포트로 rss.xml 기존 동작과 동일.
 */

export const SITE_URL = process.env.SITE_URL || 'https://iknowhowinfo.com';
export const SITE_NAME = 'Daily ETF Pulse';
const SITE_DESC = '오늘 뜨는 ETF의 진짜 이유 — 급등 테마·자금 흐름·월배당 전략을 매일 오전 9시 전에.';

// 카테고리별 RSS 노출 대상 (메인 일별 카테고리)
export const FEED_CATEGORIES = TOP_LEVEL_CATEGORIES.map(slug => ({
  slug,
  name: CATEGORY_NAMES[slug] || slug,
}));

export interface FeedItem {
  title: string;
  url: string;
  pubDate: Date;
  description: string;
  categoryName: string;
}

export function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

interface TodayReportSummary { date: string; url: string; pubDate: Date }

function loadTodayReports(): TodayReportSummary[] {
  try {
    const dir = path.join(process.cwd(), 'data', 'today');
    if (!fs.existsSync(dir)) return [];
    const files = fs.readdirSync(dir)
      .filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
      .sort()
      .reverse();
    return files.slice(0, 30).map(f => {
      const date = f.replace('.json', '');
      return { date, url: `/today/${date}`, pubDate: new Date(`${date}T07:00:00+09:00`) };
    });
  } catch {
    return [];
  }
}

/** 전체 피드 항목 — 모든 분석 글 + /today 일별 리포트 (최신순, 상위 100). */
export function getAllFeedItems(): FeedItem[] {
  const postItems: FeedItem[] = getAllPosts().map(post => ({
    title: post.meta.title,
    url: `${SITE_URL}/${post.meta.category}/${encodeURI(post.meta.slug)}`,
    pubDate: new Date(post.meta.date),
    description: post.meta.description,
    categoryName: post.categoryName,
  }));

  const todayItems: FeedItem[] = loadTodayReports().map(r => ({
    title: `${r.date} 오늘의 ETF 종합 리포트 — 시그널·분배락·거래량 TOP`,
    url: `${SITE_URL}${r.url}`,
    pubDate: r.pubDate,
    description: `${r.date} KRX 마감 기준 거래량 TOP·상승/하락·시그널 도달 ETF·분배락일 임박·어제 시그널 결과를 한 페이지에.`,
    categoryName: 'TODAY · 일별 리포트',
  }));

  return [...postItems, ...todayItems]
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
    .slice(0, 100);
}

/** 특정 카테고리(top-level) 피드 항목 — 해당 카테고리 글만 (최신순, 상위 100). */
export function getCategoryFeedItems(categorySlug: string): FeedItem[] {
  return getPostsByCategory(categorySlug)
    .map(post => ({
      title: post.meta.title,
      url: `${SITE_URL}/${post.meta.category}/${encodeURI(post.meta.slug)}`,
      pubDate: new Date(post.meta.date),
      description: post.meta.description,
      categoryName: post.categoryName,
    }))
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
    .slice(0, 100);
}

interface ChannelOpts { title: string; description: string; selfPath: string }

export function renderRss(items: FeedItem[], opts: ChannelOpts): string {
  const itemsXml = items.map(item => `
    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${item.url}</link>
      <guid isPermaLink="true">${item.url}</guid>
      <pubDate>${item.pubDate.toUTCString()}</pubDate>
      <description>${escapeXml(item.description)}</description>
      <category>${escapeXml(item.categoryName)}</category>
    </item>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(opts.title)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(opts.description)}</description>
    <language>ko-KR</language>
    <atom:link href="${SITE_URL}${opts.selfPath}" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>`;
}

export function renderAtom(items: FeedItem[], opts: ChannelOpts): string {
  const updated = (items[0]?.pubDate ?? new Date()).toISOString();
  const entries = items.map(item => `
  <entry>
    <title>${escapeXml(item.title)}</title>
    <link href="${item.url}" />
    <id>${item.url}</id>
    <updated>${item.pubDate.toISOString()}</updated>
    <summary>${escapeXml(item.description)}</summary>
    <category term="${escapeXml(item.categoryName)}" />
  </entry>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="ko-KR">
  <title>${escapeXml(opts.title)}</title>
  <subtitle>${escapeXml(opts.description)}</subtitle>
  <link href="${SITE_URL}${opts.selfPath}" rel="self" />
  <link href="${SITE_URL}" />
  <id>${SITE_URL}${opts.selfPath}</id>
  <updated>${updated}</updated>
${entries}
</feed>`;
}

export function renderJsonFeed(items: FeedItem[], opts: ChannelOpts): string {
  const feed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: opts.title,
    home_page_url: SITE_URL,
    feed_url: `${SITE_URL}${opts.selfPath}`,
    description: opts.description,
    language: 'ko-KR',
    items: items.map(item => ({
      id: item.url,
      url: item.url,
      title: item.title,
      content_text: item.description,
      date_published: item.pubDate.toISOString(),
      tags: [item.categoryName],
    })),
  };
  return JSON.stringify(feed, null, 2);
}

export const DEFAULT_CHANNEL = { title: SITE_NAME, description: SITE_DESC };
