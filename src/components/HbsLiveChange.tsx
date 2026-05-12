'use client';

import { useEffect, useState } from 'react';

interface Props {
  code: string;
  /** SSR initial (KRX 마감) — 한투 응답 없을 때 폴백 */
  initialChangeRate: number;
  initialVolume: number;
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
 * HomeBreakingStrip 카드 안의 등락률·거래량을 30s 한투 polling 으로 갱신.
 *   - 카드 자체는 server component 유지 (속보 글 메타데이터는 정적)
 *   - 시세 부분만 client subcomponent 로 분리해 라이브 신호 제공
 */
export default function HbsLiveChange({ code, initialChangeRate, initialVolume }: Props) {
  const [changeRate, setChangeRate] = useState(initialChangeRate);
  const [volume, setVolume] = useState(initialVolume);
  const [marketStatus, setMarketStatus] = useState<RealtimeResponse['marketStatus']>('closed');

  useEffect(() => {
    if (!code) return;
    let cancelled = false;
    async function refresh() {
      try {
        const res = await fetch(`/api/etf/realtime?codes=${code}`);
        if (!res.ok) return;
        const data: RealtimeResponse = await res.json();
        if (cancelled) return;
        setMarketStatus(data.marketStatus);
        const q = data.quotes?.[0];
        if (q && q.price > 0) {
          setChangeRate(q.changeRate);
          setVolume(q.volume);
        }
      } catch {
        // silent — SSR initial 유지
      }
    }
    refresh();
    const interval = marketStatus === 'open' ? 30_000 : 5 * 60_000;
    const id = setInterval(refresh, interval);
    return () => { cancelled = true; clearInterval(id); };
  }, [code, marketStatus]);

  const isUp = changeRate >= 0;

  return (
    <div className={`hbs-change ${isUp ? 'is-up' : 'is-down'}`}>
      {isUp ? '+' : ''}{changeRate.toFixed(2)}%
      <span className="hbs-volume">거래량 {(volume / 10000).toFixed(0)}만주</span>
    </div>
  );
}
