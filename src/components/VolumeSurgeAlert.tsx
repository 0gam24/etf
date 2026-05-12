'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Flame } from 'lucide-react';

interface Etf {
  code: string;
  name: string;
  volume: number;
  changeRate: number;
  price: number;
}

interface Props {
  /** SSR 단계의 일별 마감 데이터 — 평균 거래량 추정에 사용 */
  baselineList: Etf[];
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
 * VolumeSurgeAlert — 메인페이지 상단 거래량 급증 알림 띠.
 *
 *   조건: 거래량 TOP10 ETF 중 어느 하나라도 현재 거래량이 baseline(전 거래일) × 1.5 이상
 *   장중에만 표시 (market_status='open'). 마감 후·휴장엔 숨김.
 *
 *   30초 polling — EtfMarketPulse 와 같은 endpoint 호출이라 edge 캐시 hit 률 높음.
 */
export default function VolumeSurgeAlert({ baselineList }: Props) {
  const [surge, setSurge] = useState<null | { code: string; name: string; ratio: number; changeRate: number }>(null);
  const [marketStatus, setMarketStatus] = useState<RealtimeResponse['marketStatus']>('closed');

  useEffect(() => {
    if (!baselineList?.length) return;
    let cancelled = false;
    const baselineMap = new Map<string, Etf>(baselineList.slice(0, 10).map(e => [e.code, e]));
    const codes = baselineList.slice(0, 10).map(e => e.code).join(',');

    async function check() {
      try {
        const res = await fetch(`/api/etf/realtime?codes=${codes}`);
        if (!res.ok) return;
        const data: RealtimeResponse = await res.json();
        if (cancelled) return;
        setMarketStatus(data.marketStatus);
        if (data.marketStatus !== 'open') { setSurge(null); return; }
        let top: { code: string; name: string; ratio: number; changeRate: number } | null = null;
        for (const q of data.quotes) {
          if (!q || q.volume === 0) continue;
          const base = baselineMap.get(q.code);
          if (!base || base.volume === 0) continue;
          const ratio = q.volume / base.volume;
          if (ratio >= 1.5 && (!top || ratio > top.ratio)) {
            top = { code: q.code, name: base.name, ratio, changeRate: q.changeRate };
          }
        }
        setSurge(top);
      } catch { /* silent */ }
    }
    check();
    const id = setInterval(check, marketStatus === 'open' ? 30_000 : 5 * 60_000);
    return () => { cancelled = true; clearInterval(id); };
  }, [baselineList, marketStatus]);

  if (!surge || marketStatus !== 'open') return null;

  const up = surge.changeRate > 0;
  return (
    <Link
      href={`/etf/${surge.code.toLowerCase()}`}
      prefetch={false}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.6rem',
        padding: '0.6rem 1rem',
        background: 'linear-gradient(90deg, rgba(239,68,68,0.18), rgba(245,158,11,0.18))',
        borderTop: '1px solid rgba(239,68,68,0.35)',
        borderBottom: '1px solid rgba(239,68,68,0.35)',
        color: 'var(--text-primary)',
        textDecoration: 'none',
        fontSize: '0.9rem',
        fontWeight: 600,
        animation: 'volSurgePulse 2s ease-in-out infinite',
      }}
    >
      <Flame size={16} strokeWidth={2.5} color="#EF4444" aria-hidden />
      <span><strong style={{ color: '#EF4444' }}>거래량 급증</strong> · {surge.name}</span>
      <span style={{ color: 'var(--text-dim)' }}>
        평소 대비 <strong>{surge.ratio.toFixed(1)}배</strong>
        <span style={{ marginLeft: '0.5rem', color: up ? '#EF4444' : '#60A5FA' }}>
          {up ? '▲' : '▼'}{Math.abs(surge.changeRate).toFixed(2)}%
        </span>
      </span>
      <span style={{ color: 'var(--accent-gold)', fontSize: '0.8rem' }}>→ 자세히</span>
    </Link>
  );
}
