/**
 * 광고 설정 단일 소스. layout.tsx 의 애드센스 자동 광고 로더가 쓴다.
 *
 *   - ADSENSE_PUB_ID: publisher ID. ads.txt에 공개되는 값이라 비밀은 아니지만
 *     한 곳에서만 관리한다. 자동 광고 로더가 사이트 소유권 확인의 전제이므로 값을 바꿀 때는 ads.txt와 함께 바꾼다.
 *
 *   2026-10-14 운영자 지시: 광고는 애드센스 자동 광고만 쓴다. 수동 광고 단위(AdBanner·AD_SLOTS·
 *   가이드 본문 배치 규칙 planGuideAds)는 모두 삭제했다. 광고 위치·밀도는 애드센스 콘솔의 자동 광고 설정에서 조정한다.
 */

export const ADSENSE_PUB_ID = 'ca-pub-7830821732287404';
