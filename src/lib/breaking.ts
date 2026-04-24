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
