'use client';

import { useEffect, useState } from 'react';

interface DailyStats {
  date: string;
  total: number;
  success: number;
  fallback: number;
  mock: number;
  ts: number;
}

interface StatsResponse {
  days: DailyStats[];
  summary: { total: number; success: number; fallback: number; mock: number };
  successRate: number;
  kvEnabled: boolean;
  ts: number;
}

export default function StatsClient() {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/kis/stats?days=14');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json() as StatsResponse;
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setErr(e instanceof Error ? e.message : String(e));
          setLoading(false);
        }
      }
    }
    load();
    const id = setInterval(load, 60_000); // 1분마다 갱신
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  if (loading) return <p style={{ color: 'var(--text-dim)' }}>로딩 중…</p>;
  if (err) return <p style={{ color: 'var(--red-400)' }}>에러: {err}</p>;
  if (!data) return null;

  const total = data.summary.total;
  const successPct = total > 0 ? ((data.summary.success / total) * 100).toFixed(1) : '0';
  const fallbackPct = total > 0 ? ((data.summary.fallback / total) * 100).toFixed(1) : '0';
  // 분당 평균 추정 (최근 1일 기준)
  const today = data.days[0];
  const minutesElapsedToday = (() => {
    const now = new Date();
    const kst = new Date(now.getTime() + 9 * 3600 * 1000);
    return kst.getUTCHours() * 60 + kst.getUTCMinutes() || 1;
  })();
  const callsPerMinute = today ? (today.total / minutesElapsedToday) : 0;
  const limitPct = ((callsPerMinute / 20) * 100).toFixed(0);

  return (
    <div>
      {/* 요약 카드 4종 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <Card label="14일 누적 호출" value={total.toLocaleString()} />
        <Card label="성공률" value={`${successPct}%`} accent={data.summary.success > data.summary.fallback ? 'green' : 'amber'} />
        <Card label="폴백률" value={`${fallbackPct}%`} accent={parseFloat(fallbackPct) < 5 ? 'green' : 'red'} />
        <Card label="오늘 분당 평균" value={`${callsPerMinute.toFixed(1)} (한도 20)`} accent={callsPerMinute < 15 ? 'green' : 'red'} sub={`${limitPct}% of limit`} />
      </div>

      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: 'var(--space-4)' }}>
        <span>KV 활성: <strong style={{ color: data.kvEnabled ? 'var(--emerald-400)' : 'var(--red-400)' }}>{data.kvEnabled ? '예' : '아니오'}</strong></span>
        <span>마지막 갱신: {new Date(data.ts).toLocaleTimeString('ko-KR')}</span>
      </div>

      {/* 일별 표 */}
      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--bg-card)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        <thead>
          <tr style={{ background: 'var(--bg-elevated)', textAlign: 'left' }}>
            <th style={{ padding: '0.75rem 1rem' }}>날짜 (KST)</th>
            <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>총</th>
            <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>성공</th>
            <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>폴백</th>
            <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Mock</th>
            <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>성공률</th>
          </tr>
        </thead>
        <tbody>
          {data.days.map(d => {
            const pct = d.total > 0 ? ((d.success / d.total) * 100).toFixed(1) : '0';
            return (
              <tr key={d.date} style={{ borderTop: '1px solid var(--border-color)' }}>
                <td style={{ padding: '0.6rem 1rem' }}>{d.date}</td>
                <td style={{ padding: '0.6rem 1rem', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{d.total.toLocaleString()}</td>
                <td style={{ padding: '0.6rem 1rem', textAlign: 'right', color: 'var(--emerald-400)', fontVariantNumeric: 'tabular-nums' }}>{d.success.toLocaleString()}</td>
                <td style={{ padding: '0.6rem 1rem', textAlign: 'right', color: 'var(--orange-400)', fontVariantNumeric: 'tabular-nums' }}>{d.fallback.toLocaleString()}</td>
                <td style={{ padding: '0.6rem 1rem', textAlign: 'right', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>{d.mock.toLocaleString()}</td>
                <td style={{ padding: '0.6rem 1rem', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{pct}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Card({ label, value, accent = 'gold', sub }: { label: string; value: string; accent?: 'green' | 'red' | 'gold' | 'amber'; sub?: string }) {
  const color =
    accent === 'green' ? 'var(--emerald-400)' :
    accent === 'red'   ? 'var(--red-400)' :
    accent === 'amber' ? 'var(--orange-400)' :
    'var(--accent-gold)';
  return (
    <div style={{
      padding: 'var(--space-4)',
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius)',
    }}>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.5rem', fontWeight: 800, color }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          {sub}
        </div>
      )}
    </div>
  );
}
