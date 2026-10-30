import guideOgManifest from '../../data/og-guide-slugs.json';

/**
 * 가이드 대표 이미지 경로 (2026-10-30).
 *   네이버 「콘텐츠 마크업」: og:image 는 문서마다 고유한 이미지를 쓴다. 여러 페이지가 같은 이미지를 쓰면
 *   검색 결과 섬네일로 쓰이지 않을 수 있다. scripts/generate-guide-og.mjs 가 글별 카드를 굽고 이 목록을 남긴다.
 *   목록에 없는 새 가이드(이미지를 아직 굽지 않은 글)는 공통 가이드 카드로 나간다.
 */
const GUIDE_OG = new Set<string>(guideOgManifest.slugs);

export function guideOgPath(slug: string): string {
  return GUIDE_OG.has(slug) ? `/og/guide/${slug}.png` : '/og/guide.png';
}
