import Link from 'next/link';
import { PUBLISHER } from '@/lib/authors';

interface Props {
  /** 호환을 위해 prop 유지 — 내부에선 무시 (인물 페르소나 노출 안 함) */
  author?: unknown;
  /** 'inline' = 본문 직후 (글 하단), 'compact' = 바이라인 옆 작은 배지 */
  variant?: 'inline' | 'compact';
}

/**
 * 자동 분석 공시 — Google E-E-A-T 투명성.
 *
 *   - 본문이 공공데이터 기반 자동 분석으로 작성됨을 명시.
 *   - 발행·검수 책임 = Daily ETF Pulse 편집팀 (실명 publisher).
 *   - 인물 페르소나는 노출하지 않음 (데이터 저널 톤).
 */
export default function AiAgentDisclosure({ variant = 'inline' }: Props) {
  if (variant === 'compact') {
    return (
      <span
        title="공공데이터 기반 자동 분석 — Daily ETF Pulse 편집팀 발행"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          padding: '0.15rem 0.5rem',
          background: 'rgba(212,175,55,0.12)',
          color: '#D4AF37',
          fontSize: '0.7rem',
          fontWeight: 700,
          borderRadius: '0.375rem',
          letterSpacing: '0.04em',
        }}
      >
        <span aria-hidden>●</span> AUTO ANALYSIS
      </span>
    );
  }

  return (
    <section
      className="ai-agent-disclosure-inline"
      aria-labelledby="auto-disclosure-heading"
      style={{
        marginTop: '2.5rem',
        padding: '1.5rem 1.75rem',
        background: 'rgba(212,175,55,0.05)',
        border: '1px solid rgba(212,175,55,0.2)',
        borderRadius: '0.625rem',
      }}
    >
      <h2
        id="auto-disclosure-heading"
        style={{
          fontSize: '0.875rem',
          fontWeight: 700,
          color: 'var(--accent-gold)',
          margin: '0 0 0.75rem 0',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        자동 분석 공시
      </h2>

      <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--text-secondary)', margin: '0 0 0.75rem 0' }}>
        본 분석은 한국거래소(KRX) 공공데이터·한국은행 ECOS·DART 운용사 공시를 입력으로 자동 생성됩니다. 분석 시점·출처는 본문에 함께 노출하며, 검수·정정·발행 책임은 Daily ETF Pulse 편집팀에 있습니다.
      </p>

      <p style={{ fontSize: '0.8rem', lineHeight: 1.6, color: 'var(--text-dim)', margin: 0, paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        발행·검수 책임 — <Link href={PUBLISHER.url} style={{ color: 'var(--text-secondary)' }}>{PUBLISHER.name}</Link>
      </p>
    </section>
  );
}
