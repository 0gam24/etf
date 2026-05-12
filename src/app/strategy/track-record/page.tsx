import fs from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';

interface Outcome {
  code: string;
  date: string;
  status: string;
  triggered: boolean;
  summary?: string;
  long?: { entry: number; exit: number; pnl: number; result: 'win' | 'loss' | 'eod' };
  short?: { entry: number; exit: number; pnl: number; result: 'win' | 'loss' | 'eod' };
}

interface TrackRecord {
  entries: Outcome[];
  updatedAt: string;
}

function loadTrack(): TrackRecord | null {
  try {
    const file = path.join(process.cwd(), 'data', 'signals', 'track-record.json');
    if (!fs.existsSync(file)) return null;
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch {
    return null;
  }
}

export const metadata: Metadata = {
  title: '시그널 트랙 레코드 — Daily ETF Pulse',
  description: 'Unger 변동성 돌파 시그널의 실제 결과를 매일 자동 기록·공개. 성공·실패 모두 transparent 노출.',
  alternates: { canonical: '/strategy/track-record' },
};

export default function TrackRecordPage() {
  const record = loadTrack();
  const entries = record?.entries || [];

  // 통계
  const triggered = entries.filter(e => e.triggered);
  const winLong = triggered.filter(e => e.long?.result === 'win').length;
  const lossLong = triggered.filter(e => e.long?.result === 'loss').length;
  const eodLong = triggered.filter(e => e.long?.result === 'eod').length;
  const winShort = triggered.filter(e => e.short?.result === 'win').length;
  const lossShort = triggered.filter(e => e.short?.result === 'loss').length;
  const eodShort = triggered.filter(e => e.short?.result === 'eod').length;
  const totalWins = winLong + winShort;
  const totalLosses = lossLong + lossShort;
  const totalEod = eodLong + eodShort;
  const winRate = (totalWins + totalLosses) > 0 ? (totalWins / (totalWins + totalLosses) * 100) : 0;

  // 누적 손익 (1주 기준)
  const totalPnL = triggered.reduce((s, e) => {
    return s + (e.long?.pnl || 0) + (e.short?.pnl || 0);
  }, 0);

  return (
    <article style={{ maxWidth: '64rem', margin: '0 auto', padding: 'var(--space-8) var(--space-6)' }}>
      <Breadcrumbs items={[
        { name: '홈', href: '/' },
        { name: '시그널', href: '/strategy/kospi200-breakout' },
        { name: '트랙 레코드', href: '/strategy/track-record' },
      ]} />

      <header style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--accent-gold)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          TRACK RECORD · TRANSPARENT
        </div>
        <h1 style={{ fontSize: 'var(--fs-h1)', marginBottom: 'var(--space-3)' }}>
          시그널 결과 자동 공개
        </h1>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          매일 발행한 Unger 변동성 돌파 시그널을 다음 거래일 OHLC 로 자동 검증.
          성공·실패 모두 transparent 노출 — paper trading 결과이며 실 매매 X.
        </p>
        {record?.updatedAt && (
          <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            마지막 갱신: {new Date(record.updatedAt).toLocaleString('ko-KR')}
          </p>
        )}
      </header>

      {/* 요약 카드 */}
      <section style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--space-3)' }}>
          <Card label="총 진입 시그널" value={triggered.length.toString()} />
          <Card label="승률" value={`${winRate.toFixed(1)}%`} accent={winRate >= 50 ? 'green' : 'red'} />
          <Card label="승 / 패 / 종가청산" value={`${totalWins} / ${totalLosses} / ${totalEod}`} />
          <Card label="누적 손익 (1주)" value={`${totalPnL > 0 ? '+' : ''}${Math.round(totalPnL).toLocaleString()}원`} accent={totalPnL > 0 ? 'green' : totalPnL < 0 ? 'red' : 'gold'} />
        </div>
      </section>

      {/* 일별 결과 */}
      {entries.length > 0 ? (
        <section>
          <h2 style={{ fontSize: 'var(--fs-h2)', marginBottom: 'var(--space-4)' }}>최근 결과 ({entries.length}건)</h2>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {entries.slice().reverse().map((e, idx) => (
              <OutcomeRow key={`${e.code}-${e.date}-${idx}`} outcome={e} />
            ))}
          </div>
        </section>
      ) : (
        <section style={{ padding: 'var(--space-8)', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-dim)' }}>
            아직 평가된 시그널이 없습니다. 매일 cron 이 시그널 발행 + 다음 거래일 검증을 자동 수행합니다.
            <br />
            <small>OHLC 시계열 축적 후 ~3~4주부터 데이터 표시 시작</small>
          </p>
        </section>
      )}

      <section style={{ marginTop: 'var(--space-8)', padding: 'var(--space-5)', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius)' }}>
        <h3 style={{ fontSize: 'var(--fs-h3)', marginBottom: 'var(--space-2)', color: 'var(--red-400)' }}>⚠️ Paper Trading 면책</h3>
        <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9rem' }}>
          <li>본 결과는 <strong>가상 매매 시뮬레이션</strong>입니다. 실제 자금 매매 X.</li>
          <li>슬리피지·수수료·세금 미반영 — 실 매매 시 손익이 더 작아질 수 있음.</li>
          <li>과거 성과가 미래 결과를 보장하지 않습니다.</li>
        </ul>
      </section>
    </article>
  );
}

function Card({ label, value, accent }: { label: string; value: string; accent?: 'green' | 'red' | 'gold' }) {
  const color = accent === 'green' ? 'var(--emerald-400)' : accent === 'red' ? 'var(--red-400)' : 'var(--accent-gold)';
  return (
    <div style={{ padding: 'var(--space-4)', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)' }}>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>{label}</div>
      <div style={{ fontSize: '1.25rem', fontWeight: 800, color, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    </div>
  );
}

function OutcomeRow({ outcome: o }: { outcome: Outcome }) {
  return (
    <div style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 'var(--space-3)', alignItems: 'center' }}>
      <div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{o.date}</div>
        <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{o.code}</div>
      </div>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{o.summary}</div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {o.long && <ResultBadge label="Long" result={o.long.result} pnl={o.long.pnl} />}
        {o.short && <ResultBadge label="Short" result={o.short.result} pnl={o.short.pnl} />}
      </div>
    </div>
  );
}

function ResultBadge({ label, result, pnl }: { label: string; result: 'win' | 'loss' | 'eod'; pnl: number }) {
  const color = result === 'win' ? '#EF4444' : result === 'loss' ? '#60A5FA' : 'var(--text-secondary)';
  return (
    <span style={{ padding: '0.2rem 0.5rem', background: `${color}22`, color, borderRadius: '0.375rem', fontSize: '0.75rem', fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>
      {label}: {result === 'win' ? '✓' : result === 'loss' ? '✗' : '◐'} {pnl > 0 ? '+' : ''}{Math.round(pnl).toLocaleString()}
    </span>
  );
}
