/**
 * 광고 설정 단일 소스. layout(자동 광고 로더)과 AdBanner(수동 슬롯)가 함께 쓴다.
 *
 *   - ADSENSE_PUB_ID: publisher ID. ads.txt에 공개되는 값이라 비밀은 아니지만
 *     한 곳에서만 관리해 두 곳이 서로 다른 값을 쓰는 일을 막는다.
 *     (예전 AdBanner는 환경변수가 없으면 가짜 ID로 폴백했다. 2026-09-30 제거)
 *     자동 광고 로더가 사이트 소유권 확인의 전제이므로 값을 바꿀 때는 ads.txt와 함께 바꾼다.
 *   - AD_SLOTS: 수동 광고 슬롯 ID. 운영자가 AdSense 콘솔에서 발급한 뒤
 *     NEXT_PUBLIC_AD_SLOT_* 환경변수로 넣는다. 비어 있으면 AdBanner는 아무것도 그리지 않는다.
 *     NEXT_PUBLIC_* 는 빌드 시 문자열로 치환되므로 process.env.X 형태로 정적으로 읽어야 한다.
 */

export const ADSENSE_PUB_ID = 'ca-pub-7830821732287404';

export const AD_SLOTS = {
  top: process.env.NEXT_PUBLIC_AD_SLOT_TOP || '',
  inArticle: process.env.NEXT_PUBLIC_AD_SLOT_IN_ARTICLE || '',
  bottom: process.env.NEXT_PUBLIC_AD_SLOT_BOTTOM || '',
  sidebar: process.env.NEXT_PUBLIC_AD_SLOT_SIDEBAR || '',
} as const;

export type AdSlotKey = keyof typeof AD_SLOTS;
