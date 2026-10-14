interface Props {
  /** ISO 날짜 (글 발행일·데이터 기준일) */
  isoDate?: string;
  /** 크기 조절 — default 'sm' */
  size?: 'sm' | 'md';
}

/** ISO 날짜를 KST 기준 'YYYY.MM.DD' 로. 날짜가 없거나 깨졌으면 null. */
export function formatKstDate(isoDate?: string): string | null {
  if (!isoDate) return null;
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return null;
  return new Date(d.getTime() + 9 * 3600 * 1000).toISOString().slice(0, 10).replace(/-/g, '.');
}

/**
 * FreshnessPill — 자료의 기준일을 'YYYY.MM.DD' 로 표시한다.
 *
 * 2026-10-14: 예전에는 오늘 날짜와의 차이를 '📅 117일 전 발행' 처럼 보여 줬다. 일별 시황 갱신이 멈춘 뒤로
 *   이 표시는 날마다 숫자만 커지며 "방치된 사이트" 신호가 됐고, 검색 결과 발췌에도 그대로 실렸다.
 *   기준일은 바뀌지 않는 사실이라 날짜 그대로 적는다.
 */
export default function FreshnessPill({ isoDate, size = 'sm' }: Props) {
  const label = formatKstDate(isoDate);
  if (!label) return null;
  const padding = size === 'md' ? '0.25rem 0.6rem' : '0.15rem 0.45rem';
  const fontSize = size === 'md' ? '0.78rem' : '0.7rem';
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding,
      borderRadius: '0.3rem',
      fontSize,
      fontWeight: 700,
      letterSpacing: '0.02em',
      background: 'rgba(96,165,250,0.15)',
      color: '#60A5FA',
      whiteSpace: 'nowrap',
    }}>데이터 기준일 {label}</span>
  );
}
