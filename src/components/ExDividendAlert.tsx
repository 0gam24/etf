import Link from 'next/link';
import type { IncomeEtf } from '@/lib/income';

interface Props {
  etfs: IncomeEtf[];
  /** 임박 기준 (일) — 기본 5일 */
  windowDays?: number;
}

/**
 * ExDividendAlert — 분배락일 임박 ETF 알림.
 *
 *   조건: nextExDividendDate 가 오늘부터 N일 이내
 *   효과: 매수 마지막 타이밍 안내 (분배락일 전일까지 매수해야 분배 수령)
 *
 *   서버사이드 렌더 — 시간 의존 X (날짜 기반)
 */
export default function ExDividendAlert({ etfs, windowDays = 5 }: Props) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const imminent = etfs
    .map(e => {
      if (!e.nextExDividendDate) return null;
      // nextExDividendDate 형식: YYYY-MM-DD
      const dt = new Date(e.nextExDividendDate);
      if (isNaN(dt.getTime())) return null;
      const daysLeft = Math.floor((dt.getTime() - today.getTime()) / 86400000);
      if (daysLeft < 0 || daysLeft > windowDays) return null;
      return { etf: e, daysLeft, date: e.nextExDividendDate };
    })
    .filter((x): x is { etf: IncomeEtf; daysLeft: number; date: string } => x !== null)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  if (imminent.length === 0) return null;

  return (
    <section
      style={{
        margin: 'var(--space-6) 0',
        padding: 'var(--space-5) var(--space-6)',
        background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(212,175,55,0.06))',
        border: '1px solid rgba(16,185,129,0.25)',
        borderRadius: 'var(--radius)',
      }}
      aria-label="분배락일 임박 ETF"
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: 'var(--space-3)' }}>
        <span style={{ fontSize: '1rem' }} aria-hidden>📅</span>
        <h3 style={{ fontSize: 'var(--fs-h3)', fontWeight: 700, color: 'var(--emerald-400)' }}>
          분배락일 D-{imminent[0].daysLeft} 임박
        </h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
          분배락일 <strong>전일까지 매수</strong>해야 분배금 수령
        </span>
      </div>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 'var(--space-2)' }}>
        {imminent.map(({ etf, daysLeft, date }) => (
          <li key={etf.code} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 'var(--space-3)',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
          }}>
            <Link href={`/etf/${etf.code.toLowerCase()}`} prefetch={false} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'var(--text-primary)' }}>
              <span style={{
                padding: '0.2rem 0.5rem',
                background: daysLeft <= 1 ? 'var(--red-400)' : 'var(--emerald-400)',
                color: '#0B0E14',
                borderRadius: '0.375rem',
                fontSize: '0.75rem',
                fontWeight: 800,
                minWidth: '3rem',
                textAlign: 'center',
              }}>
                D-{daysLeft}
              </span>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{etf.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  분배락 {date} · 연 분배율 {etf.yield?.toFixed(2)}%
                </div>
              </div>
            </Link>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
              안정성 <strong style={{ color: 'var(--accent-gold)' }}>{etf.stabilityGrade}</strong>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
