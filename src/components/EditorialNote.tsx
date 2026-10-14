import Link from 'next/link';
import { PUBLISHER } from '@/lib/authors';

/**
 * 글 유형 — 근거 자료를 글의 실제 바탕에 맞춰 적는다.
 *   - 'data'    : 예전 일별 시황 글 (한국거래소 시세 자료·운용사 공시 바탕, 2026-10-08 이후 갱신하지 않는 보관 글)
 *   - 'guide'   : 개념·세금·계좌 가이드 (관할 기관 안내·법령 바탕)
 *   - 'neutral' : 유형을 넘기지 않은 경우의 기본값
 */
export type EditorialKind = 'data' | 'guide' | 'neutral';

interface Props {
  /** 'inline' = 글 하단 안내, 'compact' = 바이라인 옆 작은 표시 */
  variant?: 'inline' | 'compact';
  kind?: EditorialKind;
}

const COPY: Record<EditorialKind, { badge: string; body: string }> = {
  data: {
    badge: '보관 자료',
    body:
      '이 글은 작성 당시의 한국거래소(KRX) 시세 자료와 운용사 공시를 바탕으로 쓴 일별 시황 기록이며, 이후 다시 갱신하지 않았습니다. 지금의 가격·구성종목·분배 정보는 종목 사전이나 운용사 공시에서 확인하세요.',
  },
  guide: {
    badge: '출처 표기',
    body:
      '이 가이드는 국세청·금융감독원·국민연금공단 같은 관할 기관의 안내와 법령, 운용사 공시를 근거로 정리했고, 근거 문서는 위 참고 자료에 밝혔습니다. 제도와 수치는 바뀔 수 있으니 기준일을 함께 확인하세요.',
  },
  neutral: {
    badge: '출처 표기',
    body: '이 글의 수치와 설명은 본문에 밝힌 1차 출처를 근거로 합니다. 제도와 수치는 바뀔 수 있으니 기준일을 함께 확인하세요.',
  },
};

/**
 * 작성·정정 안내 (2026-10-14, 예전 AiAgentDisclosure 대체).
 *
 *   예전 안내는 글마다 작성 주체(페르소나)를 내세웠다. 2026-10-14 운영자 지시로 작성 도구에 관한 문구는
 *   사이트에 두지 않는다. 글 하단에는 독자에게 쓸모 있는 것만 둔다: 무엇을 근거로 했는지,
 *   누가 발행·정정을 책임지는지, 틀린 내용을 어디로 알리는지. 사실이 아닌 사람 저자·경력·검수 표현도 쓰지 않는다.
 */
export default function EditorialNote({ variant = 'inline', kind = 'neutral' }: Props) {
  const copy = COPY[kind] ?? COPY.neutral;

  if (variant === 'compact') {
    return (
      <span
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
      className="editorial-note-inline"
      aria-labelledby="editorial-note-heading"
      style={{
        marginTop: '2.5rem',
        padding: '1.5rem 1.75rem',
        background: 'rgba(212,175,55,0.05)',
        border: '1px solid rgba(212,175,55,0.2)',
        borderRadius: '0.625rem',
      }}
    >
      <h2
        id="editorial-note-heading"
        style={{
          fontSize: '0.875rem',
          fontWeight: 700,
          color: 'var(--accent-gold)',
          margin: '0 0 0.75rem 0',
          letterSpacing: '0.04em',
        }}
      >
        근거와 정정
      </h2>

      <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--text-secondary)', margin: '0 0 0.75rem 0' }}>
        {copy.body}
      </p>

      <p style={{ fontSize: '0.8rem', lineHeight: 1.6, color: 'var(--text-dim)', margin: 0, paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        발행·정정 책임: <Link href={PUBLISHER.url} style={{ color: 'var(--text-secondary)' }}>{PUBLISHER.name}</Link>
        {' · '}
        틀린 내용은 <Link href="/contact" style={{ color: 'var(--text-secondary)' }}>연락처</Link>로 알려 주시면 확인 후 고칩니다.
        {' · '}
        <Link href="/about#editorial-method" style={{ color: 'var(--text-secondary)' }}>작성 방식</Link>
      </p>
    </section>
  );
}
