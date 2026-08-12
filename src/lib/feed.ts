import fs from 'node:fs';
import path from 'node:path';
import { getAllPosts, getPostsByCategory, CATEGORY_NAMES, TOP_LEVEL_CATEGORIES } from '@/lib/posts';
import { GUIDES, getGuidePublishedAt } from '@/lib/guides';

/**
 * 구독 피드 공용 빌더 — RSS 2.0 · Atom 1.0 · JSON Feed 1.1 + 카테고리별 RSS.
 *   /rss.xml · /atom.xml · /feed.json · /rss/{category}.xml 라우트가 공유.
 *   콘텐츠 소스는 getAllPosts() + /today 일별 리포트로 rss.xml 기존 동작과 동일.
 */

export const SITE_URL = process.env.SITE_URL || 'https://iknowhowinfo.com';
export const SITE_NAME = 'Daily ETF Pulse';
const SITE_DESC = '오늘 뜨는 ETF의 진짜 이유. 급등 테마·자금 흐름·월배당 전략을 매일 오전 9시 전에.';

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
  /** 대표 이미지 절대 URL — RSS <enclosure>로 노출 (네이버는 이미지 포함 RSS 우대) */
  image?: string;
  /**
   * 본문 전체 HTML — RSS <content:encoded>로 노출.
   *
   *   네이버 서치어드바이저 RSS 제출 안내: "RSS 피드 내의 콘텐츠는 이미지 링크가
   *   포함된 본문 전체를 제공하는 것을 권장합니다."
   *   요약(description)만 주면 수집기가 글이 무엇을 다루는지 알 수 없다.
   *   네이버가 현재 유일한 성장 통로라 여기에 맞춘다. (2026-08-12)
   */
  content?: string;
}

/** 문단 텍스트를 HTML로 (태그 문자만 escape, 마크업 삽입 없음) */
function toHtmlParagraphs(paragraphs: string[]): string {
  return paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join('');
}

function escapeHtml(s: string): string {
  return s.replace(/[<>&]/g, c => (c === '<' ? '&lt;' : c === '>' ? '&gt;' : '&amp;'));
}

/**
 * 마크다운 본문을 피드용 HTML로.
 *
 *   피드 수집기가 읽을 최소한만 살린다(제목·문단·목록·표 텍스트·강조·링크).
 *   임의 HTML은 통과시키지 않고 전부 escape한 뒤 필요한 태그만 다시 만든다.
 *   MDX 컴포넌트 태그·코드블록은 본문 흐름이 아니므로 걷어낸다.
 */
function markdownToHtml(md: string): string {
  const src = md
    .replace(/```[\s\S]*?```/g, '')                 // 코드블록
    .replace(/<\/?[A-Z][\w]*[^>]*>/g, '')           // MDX 컴포넌트 (<Chart /> 등)
    .replace(/^import .*$/gm, '');

  const out: string[] = [];
  let list: string[] = [];
  const flushList = () => {
    if (list.length) { out.push('<ul>' + list.map(li => `<li>${li}</li>`).join('') + '</ul>'); list = []; }
  };
  /** 인라인 강조·링크만 복원. 그 외는 이미 escape된 상태로 남는다. */
  const inline = (s: string) => escapeHtml(s)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, t, u) => `<a href="${u}">${t}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');

  for (const raw of src.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) { flushList(); continue; }
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) { flushList(); const lv = Math.min(h[1].length + 1, 6); out.push(`<h${lv}>${inline(h[2])}</h${lv}>`); continue; }
    const li = line.match(/^[-*+]\s+(.*)$/) || line.match(/^\d+\.\s+(.*)$/);
    if (li) { list.push(inline(li[1])); continue; }
    if (/^\|/.test(line)) {                          // 표는 셀 텍스트만 한 줄로
      flushList();
      const cells = line.split('|').map(c => c.trim()).filter(Boolean);
      if (cells.length && !cells.every(c => /^:?-+:?$/.test(c))) out.push(`<p>${cells.map(inline).join(' · ')}</p>`);
      continue;
    }
    if (/^>\s?/.test(line)) { flushList(); out.push(`<blockquote><p>${inline(line.replace(/^>\s?/, ''))}</p></blockquote>`); continue; }
    if (/^(-{3,}|\*{3,})$/.test(line)) { flushList(); continue; }
    flushList();
    out.push(`<p>${inline(line)}</p>`);
  }
  flushList();
  return out.join('');
}

/** 가이드 한 편을 피드 본문 HTML로. 화면 순서와 같게 둔다. */
function guideToHtml(g: (typeof GUIDES)[number], image: string): string {
  const parts: string[] = [];
  parts.push(`<p><img src="${image}" alt="${escapeHtml(g.title)}" width="1200" height="630" /></p>`);
  if (g.answer) parts.push(`<p><strong>${escapeHtml(g.answer)}</strong></p>`);
  if (g.keyPoints?.length) {
    parts.push('<h2>핵심 포인트</h2><ul>' + g.keyPoints.map(k => `<li>${escapeHtml(k)}</li>`).join('') + '</ul>');
  }
  if (g.comparisonTable) {
    const t = g.comparisonTable;
    parts.push(
      `<h2>${escapeHtml(t.caption)}</h2><table><thead><tr>` +
      t.columns.map(c => `<th>${escapeHtml(c)}</th>`).join('') +
      '</tr></thead><tbody>' +
      t.rows.map(r => '<tr>' + r.map(c => `<td>${escapeHtml(c)}</td>`).join('') + '</tr>').join('') +
      '</tbody></table>',
    );
  }
  for (const sec of g.sections) {
    if (!sec.paragraphs?.length) continue;
    parts.push(`<h2>${escapeHtml(sec.heading)}</h2>${toHtmlParagraphs(sec.paragraphs)}`);
  }
  if (g.sources?.length) {
    parts.push('<h2>참고 자료·출처</h2><ul>' +
      g.sources.map(s => `<li><a href="${s.url}">${escapeHtml(s.label)}</a></li>`).join('') + '</ul>');
  }
  if (g.faq?.length) {
    parts.push('<h2>자주 묻는 질문</h2>' +
      g.faq.map(f => `<h3>${escapeHtml(f.question)}</h3><p>${escapeHtml(f.answer)}</p>`).join(''));
  }
  return parts.join('');
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

/**
 * OG 이미지 절대 URL (1200×630 PNG) — RSS enclosure·구독 리더 썸네일용
 *
 *   2026-08-12: 기존에는 /api/og(SVG 응답)를 가리키면서 enclosure type은 image/png로
 *   선언하고 있었다. 선언과 실제가 어긋나 리더·수집기가 썸네일을 못 만들었다.
 *   빌드 시점에 구운 정적 PNG(public/og/*.png)로 교체해 둘을 일치시킨다.
 */
const FEED_OG_CATEGORIES = new Set([
  'pulse', 'surge', 'flow', 'income', 'breaking', 'guide', 'stock', 'compare',
]);

function ogImageUrl(title: string, category: string): string {
  const c = FEED_OG_CATEGORIES.has(category) ? category : 'default';
  return `${SITE_URL}/og/${c}.png`;
}

/** 전체 피드 항목 — 모든 분석 글 + 가이드 + /today 일별 리포트 (최신순, 상위 100). */
export function getAllFeedItems(): FeedItem[] {
  const postItems: FeedItem[] = getAllPosts().map(post => ({
    title: post.meta.title,
    url: `${SITE_URL}/${post.meta.category}/${encodeURI(post.meta.slug)}`,
    pubDate: new Date(post.meta.date),
    description: post.meta.description,
    categoryName: post.categoryName,
    image: ogImageUrl(post.meta.title, post.meta.category),
    content:
      `<p><img src="${ogImageUrl(post.meta.title, post.meta.category)}" alt="${escapeHtml(post.meta.title)}" width="1200" height="630" /></p>` +
      markdownToHtml(post.content),
  }));

  // 가이드 — 매일 발행되는 주력 콘텐츠. 발행일 기록이 있는 가이드만 포함.
  // (기존엔 RSS에 가이드가 전혀 없어 일일 발행물이 구독·수집 채널에서 누락되던 공백 해소)
  const guideItems: FeedItem[] = GUIDES.flatMap(g => {
    const at = getGuidePublishedAt(g.slug);
    if (!at) return [];
    return [{
      title: g.title,
      url: `${SITE_URL}/guide/${g.slug}`,
      pubDate: new Date(`${at}T09:00:00+09:00`),
      description: g.description,
      categoryName: g.section,
      image: ogImageUrl(g.title, 'guide'),
      content: guideToHtml(g, ogImageUrl(g.title, 'guide')),
    }];
  });

  const todayItems: FeedItem[] = loadTodayReports().map(r => ({
    title: `${r.date} 오늘의 ETF 종합 리포트: 시그널·분배락·거래량 TOP`,
    url: `${SITE_URL}${r.url}`,
    pubDate: r.pubDate,
    description: `${r.date} KRX 마감 기준 거래량 TOP·상승/하락·시그널 도달 ETF·분배락일 임박·어제 시그널 결과를 한 페이지에.`,
    categoryName: 'TODAY · 일별 리포트',
  }));

  return [...postItems, ...guideItems, ...todayItems]
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
      image: ogImageUrl(post.meta.title, post.meta.category),
      content:
        `<p><img src="${ogImageUrl(post.meta.title, post.meta.category)}" alt="${escapeHtml(post.meta.title)}" width="1200" height="630" /></p>` +
        markdownToHtml(post.content),
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
      <category>${escapeXml(item.categoryName)}</category>${item.image ? `
      <enclosure url="${escapeXml(item.image)}" type="image/png" length="0" />` : ''}${item.content ? `
      <content:encoded><![CDATA[${item.content.replace(/]]>/g, ']]&gt;')}]]></content:encoded>` : ''}
    </item>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
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
    <summary>${escapeXml(item.description)}</summary>${item.content ? `
    <content type="html">${escapeXml(item.content)}</content>` : ''}
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
      summary: item.description,
      ...(item.content ? { content_html: item.content } : { content_text: item.description }),
      ...(item.image ? { image: item.image } : {}),
      date_published: item.pubDate.toISOString(),
      tags: [item.categoryName],
    })),
  };
  return JSON.stringify(feed, null, 2);
}

export const DEFAULT_CHANNEL = { title: SITE_NAME, description: SITE_DESC };
