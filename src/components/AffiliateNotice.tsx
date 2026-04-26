import { Info } from 'lucide-react';

interface Props {
  /**
   * top    = 페이지 상단 (affiliate 링크 1개 이상 페이지에서 본문 시작 부분)
   * inline = affiliate 카드 그룹 직상단
   */
  variant: 'top' | 'inline';
  /** 표준 문구 외 추가 문장이 필요할 때 (예: 특정 제휴사명 명시) */
  extraText?: string;
}

/**
 * 공정거래위원회 「추천·보증 등에 관한 표시·광고 심사지침」 + 쿠팡 파트너스 약관 준수.
 *
 *   - 위치: 본문 첫 부분 또는 affiliate 링크 직상단 (스크롤 없이 보임)
 *   - 문구: 쿠팡 파트너스 표준 — "이 포스팅은 쿠팡 파트너스 활동의 일환으로,
 *     이에 따른 일정액의 수수료를 제공받습니다."
 *   - 스타일: 본문과 동등 이상 색·크기, 일반 텍스트
 *   - 페이지마다 개별 표시 (푸터 단독 의존 금지)
 *
 *   ⚠️ 절대 금지: 회색 muted 색, 작은 폰트, 이미지 안 박기, 더보기 안 숨기기.
 *   상세 규칙: etf-platform/CLAUDE.md "Affiliate 경제적 이해관계 표시" 섹션.
 */
export default function AffiliateNotice({ variant, extraText }: Props) {
  const baseText =
    '이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.';

  return (
    <aside
      className={`affiliate-notice affiliate-notice-${variant}`}
      role="note"
      aria-label="제휴 광고 안내"
    >
      <Info size={14} strokeWidth={2.4} aria-hidden className="affiliate-notice-icon" />
      <p className="affiliate-notice-text">
        {baseText}
        {extraText && <span className="affiliate-notice-extra"> {extraText}</span>}
      </p>
    </aside>
  );
}
