import fs from 'node:fs';
import path from 'node:path';
import { getAllPosts } from '@/lib/posts';

/** Daily ETF Pulse — 동적 RSS 2.0 피드 (네이버 웹마스터도구·다음 검색등록용)
 *
 *   포함:
 *     - 모든 분석 글 (pulse·surge·flow·income·breaking)
 *     - /today/{YYYY-MM-DD} 매일 종합 리포트 (Phase 4)
 *
 *   ⚠️ 페르소나·strategy·tools 페이지는 정적 — RSS 부적합 (제외).
 */

function escapeXml(unsafe: string): string {
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

interface TodayReportSummary {
  date: string;
  url: string;
  pubDate: Date;
}

function loadTodayReports(): TodayReportSummary[] {
  try {
    const dir = path.join(process.cwd(), 'data', 'today');
    if (!fs.existsSync(dir)) return [];
    const files = fs.readdirSync(dir)
      .filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
      .sort()
      .reverse(); // 최신 우선
    // 최근 30일만 RSS 노출 (오래된 일별 리포트는 카테고리 페이지·sitemap 으로 유지)
    return files.slice(0, 30).map(f => {
      const date = f.replace('.json', '');
      return {
        date,
        url: `/today/${date}`,
        pubDate: new Date(`${date}T07:00:00+09:00`), // KST 07:00 발행 가정
      };
    });
  } catch {
    return [];
  }
}

export async function GET() {
  const baseUrl = process.env.SITE_URL || 'https://iknowhowinfo.com';
  const allPosts = getAllPosts();
  const todayReports = loadTodayReports();

  // 글 + today 리포트 통합 시계열 (날짜 내림차순)
  type FeedItem = {
    title: string;
    url: string;
    pubDate: Date;
    description: string;
    category: string;
  };

  const postItems: FeedItem[] = allPosts.map(post => ({
    title: post.meta.title,
    url: `${baseUrl}/${post.meta.category}/${encodeURI(post.meta.slug)}`,
    pubDate: new Date(post.meta.date),
    description: post.meta.description,
    category: post.categoryName,
  }));

  const todayItems: FeedItem[] = todayReports.map(r => ({
    title: `${r.date} 오늘의 ETF 종합 리포트 — 시그널·분배락·거래량 TOP`,
    url: `${baseUrl}${r.url}`,
    pubDate: r.pubDate,
    description: `${r.date} KRX 마감 기준 거래량 TOP·상승/하락·시그널 도달 ETF·분배락일 임박·어제 시그널 결과를 한 페이지에.`,
    category: 'TODAY · 일별 리포트',
  }));

  const combined: FeedItem[] = [...postItems, ...todayItems]
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
    .slice(0, 100); // 상위 100건만 RSS 에 노출

  const itemsXml = combined
    .map(item => `
    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${item.url}</link>
      <guid isPermaLink="true">${item.url}</guid>
      <pubDate>${item.pubDate.toUTCString()}</pubDate>
      <description>${escapeXml(item.description)}</description>
      <category>${escapeXml(item.category)}</category>
    </item>`)
    .join('');

  const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Daily ETF Pulse</title>
    <link>${baseUrl}</link>
    <description>오늘 뜨는 ETF의 진짜 이유 — 급등 테마·자금 흐름·월배당 전략을 매일 오전 9시 전에.</description>
    <language>ko-KR</language>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>`;

  return new Response(rssFeed, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      // 1시간 CDN 캐시 + stale-while-revalidate.
      //   매일 cron(KST 16:00)으로 새 글이 push되면 Cloudflare 가 자동 재배포 → RSS route 도 새로 빌드.
      //   재배포 사이에는 1h 윈도우 내 새 글이 RSS 에 반영.
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
