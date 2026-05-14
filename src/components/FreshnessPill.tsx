interface Props {
  /** ISO 발행일 (frontmatter date 등) */
  isoDate?: string;
  /** 크기 조절 — default 'sm' */
  size?: 'sm' | 'md';
}

/**
 * FreshnessPill — 글 발행 시점을 KST 기준 '오늘 / 어제 / N일 전' pill 로 표시.
 *   메인 HomeBreakingStrip · PulseTodayHero · 카테고리 Hero 통일 통일 시그널.
 *   '🔴 오늘 발행' (fresh / 빨강) / '📅 어제 / N일 전 발행' (stale / 파랑)
 */
export default function FreshnessPill({ isoDate, size = 'sm' }: Props) {
  if (!isoDate) return null;
  const pub = new Date(isoDate);
  if (isNaN(pub.getTime())) return null;
  const now = new Date();
  const pubKst = new Date(pub.getTime() + 9 * 3600 * 1000);
  const nowKst = new Date(now.getTime() + 9 * 3600 * 1000);
  const pubDay = pubKst.toISOString().slice(0, 10);
  const nowDay = nowKst.toISOString().slice(0, 10);
  let label: string;
  let tone: 'fresh' | 'stale';
  if (pubDay === nowDay) {
    label = '🔴 오늘 발행';
    tone = 'fresh';
  } else {
    // 일자 차이를 date string 으로 정확히 계산 (자정 직후 ms diff 0 인 경우 0일 전 표시 버그 회피)
    const pubMidnight = new Date(`${pubDay}T00:00:00Z`).getTime();
    const nowMidnight = new Date(`${nowDay}T00:00:00Z`).getTime();
    const diff = Math.round((nowMidnight - pubMidnight) / 86400000);
    label = diff === 1 ? '📅 어제 발행' : `📅 ${diff}일 전 발행`;
    tone = 'stale';
  }
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
      background: tone === 'fresh' ? 'rgba(239,68,68,0.18)' : 'rgba(96,165,250,0.15)',
      color: tone === 'fresh' ? '#EF4444' : '#60A5FA',
      whiteSpace: 'nowrap',
    }}>{label}</span>
  );
}
