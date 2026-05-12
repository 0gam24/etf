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
  const [surge, setSurge] = useState<null | { code: string; name: string; ratio: number; changeRate: number; type: 'volume' | 'volatility' }>(null);
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
        // 우선순위: 변동성 폭증 (등락률 ≥ 3%) > 거래량 급증 (1.5×)
        let top: { code: string; name: string; ratio: number; changeRate: number; type: 'volume' | 'volatility' } | null = null;
        for (const q of data.quotes) {
          if (!q || q.volume === 0) continue;
          const base = baselineMap.get(q.code);
          if (!base) continue;

          // A2 변동성 폭증 — 등락률 절댓값 3% 초과
          if (Math.abs(q.changeRate) >= 3) {
            const score = Math.abs(q.changeRate);
            if (!top || (top.type !== 'volatility') || score > top.ratio) {
              top = { code: q.code, name: base.name, ratio: score, changeRate: q.changeRate, type: 'volatility' };
            }
            continue;
          }
          // A1 거래량 급증 — baseline × 1.5
          if (base.volume === 0) continue;
          const ratio = q.volume / base.volume;
          if (ratio >= 1.5 && (!top || (top.type !== 'volatility' && ratio > top.ratio))) {
            top = { code: q.code, name: base.name, ratio, changeRate: q.changeRate, type: 'volume' };
          }
        }
        setSurge(top);

        // 장중 surge 감지 시 /api/breaking/trigger 호출 → KV queue 적재 (1h throttle · 일 3건 한도)
        // 서버 측 KV throttle 이 보장하므로 클라이언트는 sessionStorage 로 같은 세션 중복 호출만 회피
        if (top && data.marketStatus === 'open') {
          try {
            const sessionKey = `surge_trigger:${top.code}:${top.type}`;
            const lastCallTs = typeof window !== 'undefined' ? Number(sessionStorage.getItem(sessionKey) || 0) : 0;
            if (Date.now() - lastCallTs > 30 * 60 * 1000) { // 세션 내 30분 1회
              await fetch('/api/breaking/trigger', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: top.type === 'volatility' ? 'volatility_spike' : 'volume_surge',
                  code: top.code,
                  name: top.name,
                  ratio: top.ratio,
                  changeRate: top.changeRate,
                }),
              }).catch(() => {/* silent — KV unavailable 등 */});
              if (typeof window !== 'undefined') sessionStorage.setItem(sessionKey, String(Date.now()));
            }
          } catch { /* silent */ }
        }
      } catch { /* silent */ }
    }
    check();
    const id = setInterval(check, marketStatus === 'open' ? 30_000 : 5 * 60_000);
    return () => { cancelled = true; clearInterval(id); };
  }, [baselineList, marketStatus]);

  if (!surge || marketStatus !== 'open') return null;

  const up = surge.changeRate > 0;
  const isVolatility = surge.type === 'volatility';
  const label = isVolatility ? '변동성 폭증' : '거래량 급증';
  const detail = isVolatility
    ? <>이상 변동 <strong>{Math.abs(surge.changeRate).toFixed(2)}%</strong></>
    : <>평소 대비 <strong>{surge.ratio.toFixed(1)}배</strong></>;

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
      <span><strong style={{ color: '#EF4444' }}>{label}</strong> · {surge.name}</span>
      <span style={{ color: 'var(--text-dim)' }}>
        {detail}
        {!isVolatility && (
          <span style={{ marginLeft: '0.5rem', color: up ? '#EF4444' : '#60A5FA' }}>
            {up ? '▲' : '▼'}{Math.abs(surge.changeRate).toFixed(2)}%
          </span>
        )}
      </span>
      <span style={{ color: 'var(--accent-gold)', fontSize: '0.8rem' }}>→ 자세히</span>
    </Link>
  );
}
