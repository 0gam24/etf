/**
 * /breaking 카테고리 — 공용 헬퍼.
 *   - 속보 포스트 MDX 본문에서 첫 번째 뉴스 헤드라인(= "오늘의 도화선") 추출.
 *   - 홈 히어로 우측 카드 · 기타 UI에서 재사용.
 */

import type { Post } from '@/lib/posts';

export interface HeadlineCapture {
  title: string;
  source: string;
}

/**
 * 속보 포스트 MDX 본문에서 첫 번째 뉴스 헤드라인을 추출.
 *
 *   기대 패턴 (sampleBreaking/LogicSpecialist가 생성):
 *     **1. {title}** — *{source}*
 *   매체 표기가 없는 경우도 허용:
 *     **1. {title}**
 */
export function extractFirstHeadline(post: Post | null): HeadlineCapture | null {
  if (!post) return null;
  const body = post.content || '';
  const re = /\*\*1\.\s*([^*]+?)\*\*(?:\s*(?:—|-|–)\s*\*([^*]+)\*)?/;
  const m = body.match(re);
  if (!m) return null;
  const title = m[1].trim();
  const source = (m[2] || '').trim();
  if (!title) return null;
  return { title, source };
}

/**
 * 속보 글에서 거래일(YYYYMMDD)을 안전하게 추출.
 *
 *   ⚠️ frontmatter `date`는 UTC ISO이므로 한국 자정 직후(UTC 전날 15:00 이후) 발행된
 *   글은 전날 UTC로 찍힘. 이 값으로 같은 날 그룹핑하면 어제·오늘 글이 섞인다.
 *
 *   우선순위:
 *     1) frontmatter.pulseDate ("YYYYMMDD") — 거래일 명시
 *     2) slug의 `breaking-(\d{8})-` 패턴 — 거래일 명시
 *     3) 빈 문자열 (호출 측에서 빈 값 처리)
 */
export function tradeDateOf(post: Post): string {
  if (post.meta.pulseDate) return post.meta.pulseDate;
  const m = post.meta.slug.match(/breaking-(\d{8})-/);
  return m ? m[1] : '';
}

/** slug에서 rank 추출 (`breaking-YYYYMMDD-{rank}-...`). 없으면 99. */
export function rankOf(post: Post): number {
  const m = post.meta.slug.match(/breaking-\d{8}-(\d+)-/);
  return m ? Number(m[1]) || 99 : 99;
}

/**
 * 가장 최근 거래일의 속보 글들만 골라 rank 오름차순으로 정렬해 반환.
 *   - 보통 limit=3 (거래량 1·2·3위 ETF 대응)
 *   - 새벽 발행 시점에도 어제 글과 섞이지 않음
 */
export function pickLatestTradeDayBreaking(posts: Post[], limit = 3): Post[] {
  if (!posts.length) return [];
  const latest = posts
    .map(tradeDateOf)
    .filter(Boolean)
    .sort()
    .reverse()[0] || '';
  if (!latest) return [];
  return posts
    .filter(p => tradeDateOf(p) === latest)
    .sort((a, b) => rankOf(a) - rankOf(b))
    .slice(0, limit);
}
