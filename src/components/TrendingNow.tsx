'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';

interface Etf {
  code: string;
  name: string;
  volume: number;
  changeRate: number;
  price: number;
}

interface Props {
  /** SSR 단계의 거래량 TOP10 — baseline */
  baseline: Etf[];
}

interface RealtimeQuote {
  code: string;
  price: number;
  change: number;
  changeRate: number;
  volume: number;
}

interface RealtimeResponse {
  quotes: Array<RealtimeQuote | null>;
  marketStatus: 'pre_open' | 'open' | 'closed' | 'holiday';
  source: 'kis' | 'fallback' | 'mock';
}

/**
 * TrendingNow — 메인페이지 "지금 뜨는 종목 TOP 3" 위젯.
 *
 *   장중 30초 polling 으로 거래량 TOP10 의 변동률 추적.
 *   상위 3개 (등락률 절댓값 기준) 카드 노출 — 시청자 "지금 시장이 어디서 움직이나" 즉시 인지.
 */
export default function TrendingNow({ baseline }: Props) {
  const [live, setLive] = useState<Etf[]>(baseline);
  const [marketStatus, setMarketStatus] = useState<RealtimeResponse['marketStatus']>('closed');

  useEffect(() => {
    if (!baseline?.length) return;
    let cancelled = false;
    const codes = baseline.slice(0, 10).map(e => e.code).join(',');
    async function refresh() {
      try {
        const res = await fetch(`/api/etf/realtime?codes=${codes}`);
        if (!res.ok) return;
        const data: RealtimeResponse = await res.json();
        if (cancelled) return;
        setMarketStatus(data.marketStatus);
        const liveMap = new Map<string, RealtimeQuote>();
        for (const q of data.quotes || []) {
          if (q && q.code) liveMap.set(q.code, q);
        }
        setLive(prev => prev.map(e => {
          const q = liveMap.get(e.code);
          if (!q || q.price === 0) return e;
          return { ...e, price: q.price, changeRate: q.changeRate, volume: q.volume || e.volume };
        }));
      } catch { /* silent */ }
    }
    refresh();
    const id = setInterval(refresh, marketStatus === 'open' ? 30_000 : 5 * 60_000);
    return () => { cancelled = true; clearInterval(id); };
  }, [baseline, marketStatus]);

  // 등락률 절댓값 기준 상위 3개
  const top3 = [...live]
    .filter(e => e.changeRate !== 0)
    .sort((a, b) => Math.abs(b.changeRate) - Math.abs(a.changeRate))
    .slice(0, 3);

  if (top3.length === 0) return null;

  return (
    <section style={{ margin: 'var(--space-8) 0', padding: 'var(--space-5) var(--space-6)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', marginBottom: 'var(--space-4)' }}>
        <TrendingUp size={18} strokeWidth={2.5} color="var(--accent-gold)" aria-hidden />
        <h2 style={{ fontSize: 'var(--fs-h2)', fontWeight: 800 }}>지금 뜨는 종목 TOP 3</h2>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          {marketStatus === 'open' ? '장중 실시간 30초 갱신' : '최근 거래일 기준'}
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-3)' }}>
        {top3.map((e, idx) => {
          const up = e.changeRate > 0;
          const down = e.changeRate < 0;
          const color = up ? '#EF4444' : down ? '#60A5FA' : 'var(--text-secondary)';
          return (
            <Link
              key={e.code}
              href={`/etf/${e.code.toLowerCase()}`}
              prefetch={false}
              style={{
                padding: 'var(--space-4)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius)',
                textDecoration: 'none',
                color: 'var(--text-primary)',
                display: 'block',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 'var(--space-2)' }}>
                <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem', background: 'var(--accent-gold)', color: '#0B0E14', borderRadius: '0.375rem', fontWeight: 800 }}>
                  #{idx + 1}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{e.code}</span>
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 'var(--space-2)' }}>{e.name}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--text-secondary)' }}>{e.price?.toLocaleString()}원</span>
                <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 800, color }}>
                  {up ? '▲' : down ? '▼' : ''} {Math.abs(e.changeRate).toFixed(2)}%
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
