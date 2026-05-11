'use client';

import { useEffect, useState } from 'react';

interface InitialStats {
  code: string;
  price: number;
  change: number;
  changeRate: number;
  volume: number;
  tradeAmount?: number;
  high?: number;
  low?: number;
  open?: number;
}

interface Props {
  initial: InitialStats;
}

interface RealtimeQuote {
  code: string;
  price: number;
  change: number;
  changeRate: number;
  volume: number;
  tradeAmount?: number;
  high?: number;
  low?: number;
  open?: number;
}

interface RealtimeResponse {
  quotes: Array<RealtimeQuote | null>;
  marketStatus: 'pre_open' | 'open' | 'closed' | 'holiday';
  source: 'kis' | 'fallback' | 'mock';
  ts: number;
}

/**
 * LiveEtfStats — /etf/{slug} hero stats 의 클라이언트 갱신 표시 라벨.
 *
 *   주의: 시세 데이터는 서버사이드에서 이미 SSR 렌더 (기존 마크업 유지).
 *   본 컴포넌트는 페이지 진입 후 라벨 ("장중 14:32:15 갱신" 등) 만 동적 표시.
 *   실제 시세 polling 은 사용자가 새로고침 시 SSR + edge 캐시 (30s) 로 자동 갱신.
 *
 *   ※ /etf/{slug} 는 1099 페이지라 클라이언트 polling 으로 모든 페이지에 시세 갱신하면
 *      한투 분당 한도 초과 위험. 따라서 라벨 표시 + 사용자 새로고침 기반 갱신 패턴 채택.
 */
export default function LiveEtfStats({ initial }: Props) {
  const [marketStatus, setMarketStatus] = useState<RealtimeResponse['marketStatus']>('closed');
  const [liveTs, setLiveTs] = useState<number | null>(null);
  const [liveSource, setLiveSource] = useState<RealtimeResponse['source']>('mock');

  useEffect(() => {
    if (!initial.code) return;
    let cancelled = false;
    async function refresh() {
      try {
        const res = await fetch(`/api/etf/realtime?codes=${initial.code}`);
        if (!res.ok) return;
        const data: RealtimeResponse = await res.json();
        if (cancelled) return;
        setMarketStatus(data.marketStatus);
        setLiveTs(data.ts);
        setLiveSource(data.source);
      } catch { /* silent */ }
    }
    refresh();
    return () => { cancelled = true; };
  }, [initial.code]);

  if (liveSource === 'mock') return null;

  const label = (() => {
    if (marketStatus === 'open') {
      const kst = new Date((liveTs || Date.now()) + 9 * 3600 * 1000);
      const hh = String(kst.getUTCHours()).padStart(2, '0');
      const mm = String(kst.getUTCMinutes()).padStart(2, '0');
      const ss = String(kst.getUTCSeconds()).padStart(2, '0');
      return `🔴 장중 실시간 · ${hh}:${mm}:${ss} 갱신 · 새로고침으로 최신 가격`;
    }
    if (marketStatus === 'closed') return '✅ 오늘 종가 · 15:30 마감 데이터';
    if (marketStatus === 'pre_open') return '⏳ 장 시작 전 · 09:00 개장 대기';
    return '📅 휴장 · 마지막 거래일 기준';
  })();

  return (
    <div style={{
      fontSize: '0.75rem',
      color: 'var(--text-dim)',
      padding: '0.4rem 0.75rem',
      marginTop: '0.5rem',
      background: 'rgba(212,175,55,0.06)',
      border: '1px solid rgba(212,175,55,0.18)',
      borderRadius: '0.375rem',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.35rem',
    }}>
      {label}
    </div>
  );
}
