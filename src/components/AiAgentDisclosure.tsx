import Link from 'next/link';
import { AI_DISCLOSURE, PUBLISHER, type Author } from '@/lib/authors';

interface Props {
  /** 글에 배정된 AI 에이전트 (있으면 모델 정보 카드 형태로 노출) */
  author?: Author | null;
  /** 'inline' = 본문 직후 (글 하단), 'compact' = 바이라인 옆 작은 배지 */
  variant?: 'inline' | 'compact';
}

/**
 * AI 분석 에이전트 공시 — Google E-E-A-T 투명성 의무.
 *
 *   - 모든 AI 작성 글 하단에 노출 의무 (variant='inline').
 *   - 바이라인 근처에 배지 형태로도 노출 가능 (variant='compact').
 *   - 발행·검수 책임 = Daily ETF Pulse 편집팀 (실명 publisher).
 */
export default function AiAgentDisclosure({ author, variant = 'inline' }: Props) {
  if (variant === 'compact') {
    return (
      <span
        title="AI 분석 에이전트 — 데이터 기반 자동 분석 (실존 인물 아님)"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          padding: '0.15rem 0.5rem',
          background: 'rgba(212,175,55,0.15)',
          color: '#D4AF37',
          fontSize: '0.7rem',
          fontWeight: 700,
          borderRadius: '0.375rem',
          letterSpacing: '0.04em',
        }}
      >
        <span aria-hidden>●</span> AI ANALYSIS AGENT
      </span>
    );
  }

  return (
    <section
      className="ai-agent-disclosure-inline"
      aria-labelledby="ai-disclosure-heading"
      style={{
        marginTop: '2.5rem',
        padding: '1.5rem 1.75rem',
        background: 'rgba(212,175,55,0.05)',
        border: '1px solid rgba(212,175,55,0.2)',
        borderRadius: '0.625rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
        <span aria-hidden style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '1.5rem', height: '1.5rem', background: 'rgba(212,175,55,0.2)', borderRadius: '50%', color: '#D4AF37', fontSize: '0.75rem', fontWeight: 800 }}>AI</span>
        <h2 id="ai-disclosure-heading" style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent-gold)', margin: 0, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          AI 분석 에이전트 공시
        </h2>
      </div>

      <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--text-secondary)', margin: '0 0 0.75rem 0' }}>
        {AI_DISCLOSURE}
      </p>

      {author && (
        <p style={{ fontSize: '0.85rem', lineHeight: 1.7, color: 'var(--text-dim)', margin: '0 0 0.75rem 0' }}>
          <strong style={{ color: 'var(--text-secondary)' }}>이 글의 분석 모델</strong>: <Link href={`/author/${author.id}`} style={{ color: '#D4AF37' }}>{author.name}</Link> · {author.title}
          {author.dataSources.length > 0 && (
            <> · 데이터: {author.dataSources.join(', ')}</>
          )}
        </p>
      )}

      <p style={{ fontSize: '0.8rem', lineHeight: 1.6, color: 'var(--text-dim)', margin: 0, paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        발행·검수 책임 — <Link href={PUBLISHER.url} style={{ color: 'var(--text-secondary)' }}>{PUBLISHER.name}</Link>
      </p>
    </section>
  );
}
