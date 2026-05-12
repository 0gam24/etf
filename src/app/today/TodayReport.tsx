import Link from 'next/link';

interface MarketEtf {
  code: string;
  name: string;
  price: number;
  changeRate: number;
  volume?: number;
}

interface Signal {
  code: string;
  name?: string;
  status: string;
  summary?: string;
  longTrigger?: number;
  shortTrigger?: number;
}

interface Outcome {
  code: string;
  date: string;
  summary?: string;
  long?: { pnl: number; result: 'win' | 'loss' | 'eod' };
  short?: { pnl: number; result: 'win' | 'loss' | 'eod' };
}

interface ImminentDividend {
  code: string;
  name: string;
  daysLeft: number;
  date: string;
  yield: number;
  stabilityGrade: string;
}

interface Report {
  date: string;
  generatedAt: string;
  baseDate: string;
  market: {
    byVolume: MarketEtf[];
    topGainers: MarketEtf[];
    topLosers: MarketEtf[];
  };
  signals: Signal[];
  outcomes: Outcome[];
  imminentDividends: ImminentDividend[];
}

export default function TodayReport({ report }: { report: Report | null }) {
  if (!report) {
    return (
      <section style={{ padding: 'var(--space-8)', background: 'var(--bg-card)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-dim)' }}>
          오늘의 리포트가 아직 발행되지 않았습니다. 매 영업일 KST 16:00 자동 발행됩니다.
        </p>
      </section>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
      {/* 1. 시그널 도달 */}
      {report.signals?.length > 0 && (
        <Section title={`🎯 오늘 시그널 도달 (${report.signals.length}건)`}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.5rem' }}>
            {report.signals.map(s => (
              <li key={s.code} style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.3rem' }}>
                  <strong>{s.name || s.code}</strong>
                  <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', background: 'var(--accent-gold)', color: '#0B0E14', borderRadius: '0.375rem', fontWeight: 700 }}>
                    {s.status}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>{s.summary}</p>
                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                  <Link href="/strategy/kospi200-breakout" style={{ color: 'var(--accent-gold)' }}>전체 시그널 →</Link>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* 2. 분배락 D-3 */}
      {report.imminentDividends?.length > 0 && (
        <Section title={`📅 분배락 D-3 이내 (${report.imminentDividends.length}건)`}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.5rem' }}>
            {report.imminentDividends.map(d => (
              <li key={d.code} style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{d.name}</strong>
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      분배락 {d.date} · 연 분배율 {d.yield?.toFixed(2)}%
                    </span>
                  </div>
                  <span style={{
                    padding: '0.25rem 0.6rem',
                    background: d.daysLeft <= 1 ? 'var(--red-400)' : 'var(--emerald-400)',
                    color: '#0B0E14',
                    borderRadius: '0.375rem',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                  }}>
                    D-{d.daysLeft}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* 3. 거래량 TOP */}
      <Section title="🔥 거래량 TOP 5">
        <TableEtf list={report.market.byVolume} showVolume />
      </Section>

      {/* 4. 상승 TOP */}
      <Section title="📈 상승 TOP 5">
        <TableEtf list={report.market.topGainers} />
      </Section>

      {/* 5. 하락 TOP */}
      <Section title="📉 하락 TOP 5">
        <TableEtf list={report.market.topLosers} />
      </Section>

      {/* 6. 어제 시그널 결과 */}
      {report.outcomes?.length > 0 && (
        <Section title={`📊 어제 시그널 결과 (${report.outcomes.length}건)`}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.5rem' }}>
            {report.outcomes.slice(0, 5).map(o => (
              <li key={`${o.code}-${o.date}`} style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <strong>{o.code}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{o.summary}</span>
                </div>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: '0.6rem', fontSize: '0.85rem' }}>
            <Link href="/strategy/track-record" style={{ color: 'var(--accent-gold)' }}>전체 트랙 레코드 →</Link>
          </div>
        </Section>
      )}

      {/* Footer */}
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 'var(--space-4)' }}>
        생성: {new Date(report.generatedAt).toLocaleString('ko-KR')} · KRX baseDate: {report.baseDate}
      </p>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  padding: 'var(--space-3) var(--space-4)',
  background: 'var(--bg-card)',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-sm)',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 style={{ fontSize: 'var(--fs-h2)', marginBottom: 'var(--space-3)' }}>{title}</h2>
      {children}
    </section>
  );
}

function TableEtf({ list, showVolume }: { list: MarketEtf[]; showVolume?: boolean }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.3rem' }}>
      {list.map(e => {
        const up = e.changeRate > 0;
        const down = e.changeRate < 0;
        return (
          <li key={e.code} style={{ ...cardStyle, display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: '0.6rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace', width: '4rem' }}>{e.code}</span>
            <Link href={`/etf/${e.code.toLowerCase()}`} prefetch={false} style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600 }}>{e.name}</Link>
            <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--text-secondary)' }}>{e.price?.toLocaleString()}원</span>
            <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700, color: up ? '#EF4444' : down ? '#60A5FA' : 'var(--text-secondary)' }}>
              {up ? '▲' : down ? '▼' : '–'} {Math.abs(e.changeRate).toFixed(2)}%
            </span>
            {showVolume && e.volume !== undefined && (
              <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                {(e.volume / 10000).toFixed(0)}만주
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
