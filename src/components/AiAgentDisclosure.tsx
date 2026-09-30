import Link from 'next/link';
import { PUBLISHER } from '@/lib/authors';

/**
 * 글 유형 — 공시 문구를 실제 작성 근거에 맞춰 분기한다.
 *   - 'data'    : 시황 글·데이터 페이지 (KRX 공공데이터·한국은행 ECOS·운용사 공시 기반)
 *   - 'guide'   : 개념·세금·계좌 가이드 (국세청·금감원·국민연금공단 등 공개 기관 안내 기반)
 *   - 'neutral' : 유형을 넘기지 않은 경우의 기본값. 특정 출처를 단정하지 않는다.
 */
export type DisclosureKind = 'data' | 'guide' | 'neutral';

interface Props {
  /** 호환을 위해 prop 유지 — 내부에선 무시 (인물 페르소나 노출 안 함) */
  author?: unknown;
  /** 'inline' = 본문 직후 (글 하단), 'compact' = 바이라인 옆 작은 배지 */
  variant?: 'inline' | 'compact';
  /** 글 유형. 기본값은 출처를 단정하지 않는 중립 문구 */
  kind?: DisclosureKind;
}

// 2026-09-30: 예전 문구는 모든 글에 'KRX·ECOS·DART 입력으로 자동 생성'이라고 적었지만,
//   개념·세금 가이드는 공공데이터를 입력으로 만든 글이 아니라 사실과 달랐다. 유형별로 나눈다.
const COPY: Record<DisclosureKind, { badge: string; badgeTitle: string; body: string }> = {
  data: {
    badge: 'AUTO ANALYSIS',
    badgeTitle: 'KRX 공공데이터 기반 AI 분석, Daily ETF Pulse 편집팀 발행',
    body:
      '이 글은 한국거래소(KRX) 공공데이터·한국은행 ECOS·운용사 공시를 바탕으로 데이터 기반 AI 분석 에이전트가 작성했으며, 작성자는 실존 인물이 아닙니다. 검수·정정·발행 책임은 Daily ETF Pulse 편집팀에 있습니다.',
  },
  guide: {
    badge: 'AI 작성 · 편집팀 검수',
    badgeTitle: '공개 기관 안내를 바탕으로 AI 분석 에이전트가 작성, Daily ETF Pulse 편집팀 검수',
    body:
      '이 가이드는 국세청·금융감독원·국민연금공단 등 공개 기관 안내를 바탕으로 AI 분석 에이전트가 작성하고 Daily ETF Pulse 편집팀이 검수했습니다. 작성자는 실존 인물이 아니며, 정정·발행 책임은 편집팀에 있습니다.',
  },
  neutral: {
    badge: 'AI 작성',
    badgeTitle: 'AI 분석 에이전트 작성, Daily ETF Pulse 편집팀 발행',
    body:
      '이 글은 공개된 자료를 바탕으로 AI 분석 에이전트가 작성했으며, 작성자는 실존 인물이 아닙니다. 검수·정정·발행 책임은 Daily ETF Pulse 편집팀에 있습니다.',
  },
};

/**
 * AI 작성 공시 — Google E-E-A-T 투명성.
 *
 *   - 글이 무엇을 근거로 AI 분석 에이전트가 작성했는지 유형별로 사실대로 명시.
 *   - 발행·검수 책임 = Daily ETF Pulse 편집팀 (실명 publisher).
 *   - 인물 페르소나는 노출하지 않음 (데이터 저널 톤).
 */
export default function AiAgentDisclosure({ variant = 'inline', kind = 'neutral' }: Props) {
  const copy = COPY[kind] ?? COPY.neutral;

  if (variant === 'compact') {
    return (
      <span
        title={copy.badgeTitle}
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
        <span aria-hidden>●</span> {copy.badge}
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
        AI 작성 공시
      </h2>

      <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--text-secondary)', margin: '0 0 0.75rem 0' }}>
        {copy.body}
      </p>

      <p style={{ fontSize: '0.8rem', lineHeight: 1.6, color: 'var(--text-dim)', margin: 0, paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        발행·검수 책임: <Link href={PUBLISHER.url} style={{ color: 'var(--text-secondary)' }}>{PUBLISHER.name}</Link>
      </p>
    </section>
  );
}
