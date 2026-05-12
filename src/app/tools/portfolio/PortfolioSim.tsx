'use client';

import { useEffect, useState, useCallback } from 'react';

interface Holding {
  code: string;
  shares: number;
  avgPrice: number;
}

interface Quote {
  code: string;
  name?: string;
  price: number;
  changeRate: number;
}

const STORAGE_KEY = 'etf-portfolio-holdings-v1';

export default function PortfolioSim() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [marketStatus, setMarketStatus] = useState('closed');
  const [loading, setLoading] = useState(false);

  // 초기 로드
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setHoldings(JSON.parse(raw));
    } catch { /* silent */ }
  }, []);

  // localStorage 동기화
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(holdings));
    } catch { /* silent */ }
  }, [holdings]);

  // 시세 호출
  const refreshQuotes = useCallback(async () => {
    if (holdings.length === 0) return;
    setLoading(true);
    try {
      const codes = holdings.map(h => h.code).filter(c => /^[0-9A-Z]{6}$/.test(c)).join(',');
      if (!codes) { setLoading(false); return; }
      const res = await fetch(`/api/etf/realtime?codes=${codes}`);
      if (!res.ok) return;
      const data = await res.json();
      setMarketStatus(data.marketStatus);
      const map: Record<string, Quote> = {};
      for (const q of data.quotes || []) {
        if (q && q.code) map[q.code] = q;
      }
      setQuotes(map);
    } catch { /* silent */ }
    setLoading(false);
  }, [holdings]);

  useEffect(() => {
    refreshQuotes();
    const interval = marketStatus === 'open' ? 30_000 : 5 * 60_000;
    const id = setInterval(refreshQuotes, interval);
    return () => clearInterval(id);
  }, [refreshQuotes, marketStatus]);

  function addHolding() {
    setHoldings(prev => [...prev, { code: '', shares: 0, avgPrice: 0 }]);
  }

  function updateHolding(idx: number, patch: Partial<Holding>) {
    setHoldings(prev => prev.map((h, i) => i === idx ? { ...h, ...patch } : h));
  }

  function removeHolding(idx: number) {
    setHoldings(prev => prev.filter((_, i) => i !== idx));
  }

  // 집계 계산
  let totalCost = 0;
  let totalValue = 0;
  const rows = holdings.map(h => {
    const code = h.code.toUpperCase().trim();
    const quote = quotes[code];
    const price = quote?.price || 0;
    const cost = h.shares * h.avgPrice;
    const value = h.shares * price;
    const pnl = value - cost;
    const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
    totalCost += cost;
    totalValue += value;
    return { ...h, code, quote, price, cost, value, pnl, pnlPct };
  });
  const totalPnL = totalValue - totalCost;
  const totalPnLPct = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

  return (
    <section>
      {/* 입력 영역 */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--space-3)' }}>
          <h2 style={{ fontSize: 'var(--fs-h2)' }}>보유 종목</h2>
          <button onClick={addHolding} style={{
            padding: '0.5rem 1rem',
            background: 'var(--accent-gold)',
            color: '#0B0E14',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 700,
            cursor: 'pointer',
          }}>+ 종목 추가</button>
        </div>

        {holdings.length === 0 ? (
          <p style={{ color: 'var(--text-dim)', padding: 'var(--space-6)', textAlign: 'center', background: 'var(--bg-card)', borderRadius: 'var(--radius)' }}>
            보유 종목이 없습니다. "+ 종목 추가" 로 시작하세요.
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {rows.map((row, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 2.5fr auto', gap: '0.5rem', alignItems: 'center', padding: '0.75rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)' }}>
                <input
                  placeholder="코드 (예: 069500)"
                  value={row.code}
                  onChange={e => updateHolding(idx, { code: e.target.value.toUpperCase() })}
                  style={inputStyle}
                />
                <input
                  type="number"
                  placeholder="수량"
                  value={row.shares || ''}
                  onChange={e => updateHolding(idx, { shares: Number(e.target.value) || 0 })}
                  style={inputStyle}
                />
                <input
                  type="number"
                  placeholder="평단가"
                  value={row.avgPrice || ''}
                  onChange={e => updateHolding(idx, { avgPrice: Number(e.target.value) || 0 })}
                  style={inputStyle}
                />
                <div style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--text-dim)' }}>
                  {row.price ? row.price.toLocaleString() + '원' : '—'}
                </div>
                <div style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: row.pnl > 0 ? '#EF4444' : row.pnl < 0 ? '#60A5FA' : 'var(--text-secondary)' }}>
                  {row.pnl !== 0 && (
                    <>
                      {row.pnl > 0 ? '+' : ''}{row.pnl.toLocaleString()}원
                      <span style={{ marginLeft: '0.5rem', fontSize: '0.85em' }}>({row.pnl > 0 ? '+' : ''}{row.pnlPct.toFixed(2)}%)</span>
                    </>
                  )}
                </div>
                <button onClick={() => removeHolding(idx)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }} aria-label="삭제">×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 집계 */}
      {holdings.length > 0 && (
        <section style={{ padding: 'var(--space-5)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
            <Stat label="총 매수금액" value={`${totalCost.toLocaleString()}원`} />
            <Stat label="현재 평가금액" value={`${totalValue.toLocaleString()}원`} />
            <Stat label="총 손익" value={`${totalPnL > 0 ? '+' : ''}${totalPnL.toLocaleString()}원`} accent={totalPnL > 0 ? 'red' : totalPnL < 0 ? 'blue' : 'gold'} />
            <Stat label="수익률" value={`${totalPnL > 0 ? '+' : ''}${totalPnLPct.toFixed(2)}%`} accent={totalPnL > 0 ? 'red' : totalPnL < 0 ? 'blue' : 'gold'} />
          </div>
          <div style={{ marginTop: 'var(--space-3)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {loading ? '갱신 중…' : `${marketStatus === 'open' ? '장중 실시간' : '마감 기준'} · ${marketStatus === 'open' ? '30초' : '5분'} polling`}
          </div>
        </section>
      )}
    </section>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '0.4rem 0.6rem',
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--text-primary)',
  fontFamily: 'monospace',
};

function Stat({ label, value, accent = 'gold' }: { label: string; value: string; accent?: 'red' | 'blue' | 'gold' }) {
  const color = accent === 'red' ? '#EF4444' : accent === 'blue' ? '#60A5FA' : 'var(--accent-gold)';
  return (
    <div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>{label}</div>
      <div style={{ fontSize: '1.25rem', fontWeight: 800, color, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    </div>
  );
}
