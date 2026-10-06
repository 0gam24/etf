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

/**
 * 수동 광고 배치 규칙 (2026-10-06).
 *   자동 광고가 layout에서 계속 돌기 때문에 수동 광고까지 겹치면 화면이 과밀해진다.
 *   그래서 수동 광고는 페이지당 2개를 넘기지 않고, 짧은 글에는 1개만 둔다.
 *   광고 바로 위가 표·카드·링크 목록·제휴 카드면 오클릭이 생기기 쉬우므로
 *   문단으로 끝나는 섹션 뒤에만 둔다. 광고 바로 아래는 항상 다음 섹션의 h2 제목이다.
 *   근거: AdSense 광고 게재위치 정책 https://support.google.com/adsense/answer/1346295
 */
export const MANUAL_ADS_MAX_PER_PAGE = 2;

/** 본문 섹션이 이 수보다 적은 가이드는 수동 광고를 1개만 둔다. */
export const GUIDE_SECTIONS_FOR_TWO_ADS = 5;

/** 배치 판단에 필요한 섹션 모양만 받는다(guides.ts 의 GuideSection 과 구조 호환). */
export interface AdPlacementSection {
  paragraphs: string[];
  dataBlock?: unknown;
  affiliateInline?: unknown;
}

export interface PlannedAd {
  /** 이 인덱스의 섹션이 끝난 바로 뒤에 광고를 둔다(0부터). */
  afterSection: number;
  /** 어느 env 슬롯을 쓰는지 */
  slotKey: AdSlotKey;
  /** AdSense 슬롯 ID (빈 문자열이면 계획에 넣지 않는다) */
  slot: string;
}

/** 섹션이 일반 문단으로 끝나는가. 데이터 블록(표·목록)·제휴 카드로 끝나면 false. */
function endsWithParagraph(sec: AdPlacementSection | undefined): boolean {
  if (!sec) return false;
  if (sec.dataBlock || sec.affiliateInline) return false;
  return Array.isArray(sec.paragraphs) && sec.paragraphs.length > 0;
}

/**
 * 가이드 본문 수동 광고 자리 계산.
 *   중간 자리(inArticle 슬롯): 2번째 섹션부터 보아 문단으로 끝나는 첫 섹션 뒤.
 *     뒤에 섹션이 1개 이상 남아야 한다. 첫 섹션 앞이나 직답 바로 아래에는 두지 않는다.
 *   끝 자리(bottom 슬롯): 마지막 섹션부터 거꾸로 보아 문단으로 끝나는 섹션 뒤.
 *     중간 광고와 섹션 2개 이상 떨어져 있어야 한다. 참고 자료(링크 목록) 바로 옆을 피하려고
 *     FAQ 바로 앞이 아니라 본문 끝, 참고 자료·FAQ 앞에 둔다.
 *   섹션이 GUIDE_SECTIONS_FOR_TWO_ADS 보다 적으면 1개만(중간 우선, 그 슬롯이 비었으면 끝).
 *   슬롯 env 가 비어 있으면 그 자리는 계획에서 빠진다(아무것도 그리지 않음).
 */
export function planGuideAds(
  sections: readonly AdPlacementSection[],
  slots: { inArticle: string; bottom: string } = AD_SLOTS,
): PlannedAd[] {
  const n = sections.length;
  const inArticle = (slots.inArticle || '').trim();
  const bottom = (slots.bottom || '').trim();
  if (n < 2 || (!inArticle && !bottom)) return [];

  let mid = -1;
  for (let i = 1; i <= n - 2; i++) {
    if (endsWithParagraph(sections[i])) { mid = i; break; }
  }

  const findEnd = (minGapFrom: number): number => {
    for (let j = n - 1; j >= 1; j--) {
      if (j - minGapFrom < 2) break;
      if (endsWithParagraph(sections[j])) return j;
    }
    return -1;
  };

  const plan: PlannedAd[] = [];
  const allowTwo = n >= GUIDE_SECTIONS_FOR_TWO_ADS;

  if (inArticle && mid >= 0) {
    plan.push({ afterSection: mid, slotKey: 'inArticle', slot: inArticle });
  }
  if (bottom && (allowTwo || plan.length === 0)) {
    // 중간 광고가 있으면 거기서 2섹션 이상 떨어진 자리, 없으면 2번째 섹션 이후 아무 데나.
    const end = findEnd(plan.length ? mid : -1);
    if (end >= 1) plan.push({ afterSection: end, slotKey: 'bottom', slot: bottom });
  }

  return plan.slice(0, allowTwo ? MANUAL_ADS_MAX_PER_PAGE : 1);
}
