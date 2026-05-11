'use client';

import { useEffect, useState } from 'react';

interface InitialQuote {
  code: string;
  name: string;
  price: number;
  change: number;
  changeRate?: number;
  volume: number;
}

interface Props {
  initial: InitialQuote;
  pollOpenMs?: number;
  pollClosedMs?: number;
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
  ts: number;
}

/**
 * LiveQuoteCard — HomeHeroV3 의 "오늘 거래량 1위" 카드용 클라이언트 컴포넌트.
 *
 *   서버사이드 SSR 로 initial 시세를 한 번 표시 후,
 *   장중에는 30초마다 /api/etf/realtime 호출해 silently 갱신.
 *   장 마감/휴장에는 polling 길이를 늘려 호출 절약.
 */
export default function LiveQuoteCard({
  initial,
  pollOpenMs = 30_000,
  pollClosedMs = 5 * 60_000,
}: Props) {
  const [price, setPrice] = useState(initial.price);
  const [change, setChange] = useState(initial.change);
  const [changeRate, setChangeRate] = useState(initial.changeRate ?? 0);
  const [volume, setVolume] = useState(initial.volume);
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
        const q = data.quotes?.[0];
        if (q && q.price > 0) {
          setPrice(q.price);
          setChange(q.change);
          setChangeRate(q.changeRate);
          setVolume(q.volume || initial.volume);
        }
        setMarketStatus(data.marketStatus);
        setLiveTs(data.ts);
        setLiveSource(data.source);
      } catch { /* silent */ }
    }

    refresh();
    const interval = marketStatus === 'open' ? pollOpenMs : pollClosedMs;
    const id = setInterval(refresh, interval);
    return () => { cancelled = true; clearInterval(id); };
  }, [initial.code, marketStatus, pollOpenMs, pollClosedMs, initial.volume]);

  const isUp = change > 0;
  const isDown = change < 0;
  const labelText = (() => {
    if (liveSource === 'mock') return null;
    if (marketStatus === 'open') {
      const kst = new Date((liveTs || Date.now()) + 9 * 3600 * 1000);
      const hh = String(kst.getUTCHours()).padStart(2, '0');
      const mm = String(kst.getUTCMinutes()).padStart(2, '0');
      const ss = String(kst.getUTCSeconds()).padStart(2, '0');
      return `장중 실시간 · ${hh}:${mm}:${ss}`;
    }
    if (marketStatus === 'closed') return '오늘 종가 · 15:30 마감';
    if (marketStatus === 'pre_open') return '장 시작 전 · 09:00 개장 대기';
    return '휴장 · 마지막 거래일 기준';
  })();

  return (
    <>
      <div className="home-hero-v3-price-row">
        <div className="home-hero-v3-price">
          {price.toLocaleString()}<small>원</small>
        </div>
        <div className={`home-hero-v3-change ${isUp ? 'is-up' : isDown ? 'is-down' : ''}`}>
          <span className="home-hero-v3-change-arrow">{isUp ? '▲' : isDown ? '▼' : '–'}</span>
          {Math.abs(change).toLocaleString()}원
          <span className="home-hero-v3-change-pct">
            ({isUp ? '+' : ''}{changeRate.toFixed(2)}%)
          </span>
        </div>
      </div>

      <div className="home-hero-v3-volume">
        거래량 <strong>{volume.toLocaleString()}</strong>주
        {labelText && (
          <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            · {labelText}
          </span>
        )}
      </div>
    </>
  );
}
