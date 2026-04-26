/**
 * Pulse 카테고리 전용 데이터 가공 헬퍼.
 *   - 오늘/어제 pulse 포스트 diff
 *   - 최근 5영업일 타임라인
 *   - 지난 N일 반복 등장 티커 랭킹
 *   - 오늘 본문 bullet 추출(3줄 관전포인트)
 */

import type { Post } from '@/lib/posts';

export interface TickerDiff {
  /** 오늘 처음 등장한 티커 */
  added: string[];
  /** 어제에는 있었는데 오늘 빠진 티커 */
  removed: string[];
  /** 어제·오늘 모두 등장 (이어지는 흐름) */
  continuing: string[];
}

export interface DayCell {
  /** ISO date (YYYY-MM-DD) */
  date: string;
  /** post 존재 여부 */
  post: Post | null;
  /** 영업일 표기용 (월~금) */
  weekday: string;
}

export interface ThemeCount {
  ticker: string;
  /** ETF 정식명 (KRX 매핑에서 해석된 이름) */
  name?: string;
  count: number;
  /** 가장 최근 등장 포스트 (스파클라인/링크용) */
  latestPost?: Post;
}

/** 오늘 글에서 bullet 3줄을 뽑습니다. */
export function extractPulseBullets(post: Post | null, limit = 3): string[] {
  if (!post) return [];
  return post.content
    .split('\n')
    .map(l => l.trim())
    .filter(l => /^[-•]\s+/.test(l))
    .slice(0, limit)
    .map(l => l.replace(/^[-•]\s+/, '').replace(/\*\*/g, ''));
}

/** 오늘(최신) vs 어제(두번째) 티커 diff */
export function computeTickerDiff(today: Post | null, yesterday: Post | null): TickerDiff {
  const t = new Set(today?.meta.tickers || []);
  const y = new Set(yesterday?.meta.tickers || []);
  const added: string[] = [];
  const removed: string[] = [];
  const continuing: string[] = [];
  t.forEach(x => (y.has(x) ? continuing : added).push(x));
  y.forEach(x => { if (!t.has(x)) removed.push(x); });
  return { added, removed, continuing };
}

/** 최근 5영업일 타임라인: 오늘을 기준으로 영업일 5개를 뽑고 각 날짜에 post가 있으면 매핑 */
export function buildWeekTimeline(posts: Post[], today = new Date()): DayCell[] {
  const byDate = new Map<string, Post>();
  for (const p of posts) {
    const key = new Date(p.meta.date).toISOString().slice(0, 10);
    if (!byDate.has(key)) byDate.set(key, p);
  }

  const cells: DayCell[] = [];
  const cursor = new Date(today);
  cursor.setHours(0, 0, 0, 0);

  while (cells.length < 5) {
    const wd = cursor.getDay(); // 0=일, 6=토
    if (wd !== 0 && wd !== 6) {
      const key = cursor.toISOString().slice(0, 10);
      cells.push({
        date: key,
        post: byDate.get(key) || null,
        weekday: ['일', '월', '화', '수', '목', '금', '토'][wd],
      });
    }
    cursor.setDate(cursor.getDate() - 1);
  }
  return cells.reverse(); // 월요일부터 왼쪽
}

/** 최근 N일 포스트에서 가장 자주 등장한 티커 랭킹.
 *   nameResolver를 넘기면 각 항목에 ETF 정식명을 함께 채워 반환 (사용자 가독성).
 */
export function computeRecurringThemes(
  posts: Post[],
  days = 7,
  top = 5,
  nameResolver?: (ticker: string) => string | null,
): ThemeCount[] {
  const cutoff = Date.now() - days * 86400000;
  const recent = posts.filter(p => new Date(p.meta.date).getTime() >= cutoff);
  const counts = new Map<string, { count: number; latest: Post }>();
  for (const p of recent) {
    for (const t of p.meta.tickers || []) {
      const cur = counts.get(t);
      if (!cur) {
        counts.set(t, { count: 1, latest: p });
      } else {
        cur.count += 1;
        if (new Date(p.meta.date) > new Date(cur.latest.meta.date)) cur.latest = p;
      }
    }
  }
  return Array.from(counts.entries())
    .map(([ticker, v]) => ({
      ticker,
      name: nameResolver?.(ticker) || undefined,
      count: v.count,
      latestPost: v.latest,
    }))
    .sort((a, b) => b.count - a.count || a.ticker.localeCompare(b.ticker))
    .slice(0, top);
}

/** 발행 이후 경과 시간 ("N분 전" / "N시간 전" / "N일 전") */
export function freshnessLabel(iso: string, now = new Date()): string {
  const diffMs = now.getTime() - new Date(iso).getTime();
  const m = Math.floor(diffMs / 60000);
  if (m < 1) return '방금 전';
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  return `${d}일 전`;
}
