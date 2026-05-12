'use client';

import { useEffect, useState } from 'react';

interface Props {
  code: string;
  initialChangeRate: number;
  /** 양수 라벨 (default '오늘 상승 1위') */
  positiveLabel?: string;
  /** 음수 라벨 (default '거래량 1위 (라이브 약세)') */
  negativeLabel?: string;
}

interface RealtimeQuote {
  code: string;
  price: number;
  changeRate: number;
}

interface RealtimeResponse {
  quotes: Array<RealtimeQuote | null>;
  marketStatus: 'pre_open' | 'open' | 'closed' | 'holiday';
}

/**
 * HomeHeroV3 우측 카드 라벨 — 30s polling 으로 changeRate 갱신,
 * 부호에 따라 라벨·color 자동 분기.
 *
 *   양수 → '오늘 상승 1위' (빨강)
 *   음수 → '거래량 1위 (라이브 약세)' (골드 → 회색 톤)
 *   0    → '주목 종목' (중립)
 */
export default function HeroFeaturedLabel({
  code,
  initialChangeRate,
  positiveLabel = '오늘 상승 1위',
  negativeLabel = '거래량 1위 (라이브 약세)',
}: Props) {
  const [changeRate, setChangeRate] = useState<number>(initialChangeRate);
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
        if (q && q.price > 0) setChangeRate(q.changeRate);
      } catch {/* silent */}
    }
    refresh();
    const interval = marketStatus === 'open' ? 30_000 : 5 * 60_000;
    const id = setInterval(refresh, interval);
    return () => { cancelled = true; clearInterval(id); };
  }, [code, marketStatus]);

  if (changeRate > 0) {
    return <span className="home-hero-v3-right-label" style={{ color: '#EF4444' }}>{positiveLabel}</span>;
  }
  if (changeRate < 0) {
    return <span className="home-hero-v3-right-label" style={{ color: 'var(--text-dim)' }}>{negativeLabel}</span>;
  }
  return <span className="home-hero-v3-right-label">주목 종목</span>;
}
