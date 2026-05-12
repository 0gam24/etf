'use client';

import { useEffect, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';

interface Bar {
  time: string;
  price: number;
}

interface Props {
  code: string;
  /** 기준선 (전일 종가) — 있으면 차트에 가로 점선으로 표시 */
  prevClose?: number;
  /** 차트 높이 (px) */
  height?: number;
}

interface ApiResponse {
  bars: Array<{ time: string; price: number; volume: number }>;
  marketStatus: string;
  source: string;
  ts: number;
}

/**
 * IntradayChart — 분봉 라인 차트 (lazy fetch, /etf/{slug} hero 아래).
 *
 *   장중에만 의미 있음 (현재 거래일 09:00~15:30 분단위).
 *   휴장·장 마감 후엔 마지막 거래일 데이터 표시.
 *   추세선 + prevClose 기준선 + 색상 분기 (상승=빨강·하락=파랑).
 */
export default function IntradayChart({ code, prevClose, height = 200 }: Props) {
  const [bars, setBars] = useState<Bar[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<string>('mock');

  useEffect(() => {
    if (!code) return;
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/etf/intraday?code=${code}`);
        if (!res.ok) return;
        const data: ApiResponse = await res.json();
        if (cancelled) return;
        setBars((data.bars || []).map(b => ({ time: b.time, price: b.price })));
        setSource(data.source);
      } catch { /* silent */ }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [code]);

  if (source === 'mock') return null;
  if (loading) {
    return (
      <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
        분봉 데이터 로딩 중…
      </div>
    );
  }
  if (bars.length === 0) {
    return null;
  }

  // 추세 — 첫 봉 vs 마지막 봉
  const first = bars[0]?.price || 0;
  const last = bars[bars.length - 1]?.price || 0;
  const isUp = last > first;
  const lineColor = isUp ? '#EF4444' : '#60A5FA';

  // Y축 범위 — 자동 + prevClose 포함
  const prices = bars.map(b => b.price);
  if (prevClose && prevClose > 0) prices.push(prevClose);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const margin = (max - min) * 0.05 || 1;

  return (
    <section style={{
      margin: 'var(--space-4) 0',
      padding: 'var(--space-3) var(--space-4)',
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
          🕒 일중 분봉 ({bars.length}개)
        </h3>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          한투 OpenAPI · 분 단위
        </span>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={bars} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <XAxis
            dataKey="time"
            stroke="var(--text-muted)"
            fontSize={10}
            interval={Math.floor(bars.length / 8)}
            tickLine={false}
          />
          <YAxis
            stroke="var(--text-muted)"
            fontSize={10}
            domain={[min - margin, max + margin]}
            tickFormatter={v => Math.round(v).toLocaleString()}
            tickLine={false}
            width={50}
          />
          <Tooltip
            contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: '0.375rem', fontSize: '0.75rem' }}
            labelStyle={{ color: 'var(--text-dim)' }}
            formatter={(v) => [`${Number(v).toLocaleString()}원`, '가격']}
          />
          {prevClose && (
            <ReferenceLine y={prevClose} stroke="var(--text-muted)" strokeDasharray="3 3" label={{ value: '전일 종가', position: 'right', fontSize: 10, fill: 'var(--text-muted)' }} />
          )}
          <Line type="monotone" dataKey="price" stroke={lineColor} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
}
