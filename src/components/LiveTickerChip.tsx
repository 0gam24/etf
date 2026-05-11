'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Props {
  code: string;
  name?: string;
  slug: string;
  initialPrice?: number;
  initialChangeRate?: number;
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
 * LiveTickerChip — 글 페이지 byline 옆의 종목 칩 with mini price.
 *
 *   초기 렌더: 서버사이드 마감 데이터 (있으면)
 *   페이지 진입 후 1회: /api/etf/realtime fetch → 최신 시세 표시
 *   ⚠️ polling 없음 (글 페이지는 1099 × 사용자 수 = 호출량 폭증 위험)
 */
export default function LiveTickerChip({ code, name, slug, initialPrice, initialChangeRate }: Props) {
  const [price, setPrice] = useState<number | undefined>(initialPrice);
  const [changeRate, setChangeRate] = useState<number | undefined>(initialChangeRate);

  useEffect(() => {
    if (!code) return;
    let cancelled = false;
    async function refresh() {
      try {
        const res = await fetch(`/api/etf/realtime?codes=${code}`);
        if (!res.ok) return;
        const data: RealtimeResponse = await res.json();
        if (cancelled) return;
        const q = data.quotes?.[0];
        if (q && q.price > 0) {
          setPrice(q.price);
          setChangeRate(q.changeRate);
        }
      } catch { /* silent */ }
    }
    refresh();
    return () => { cancelled = true; };
  }, [code]);

  const isUp = (changeRate ?? 0) > 0;
  const isDown = (changeRate ?? 0) < 0;
  const color = isUp ? '#EF4444' : isDown ? '#60A5FA' : 'var(--text-secondary)';

  return (
    <Link
      href={`/etf/${slug}`}
      prefetch={false}
      title={name || code}
      style={{
        padding: '0.15rem 0.5rem',
        background: 'rgba(96,165,250,0.15)',
        color: '#60A5FA',
        borderRadius: '0.375rem',
        fontSize: '0.75rem',
        fontWeight: 700,
        textDecoration: 'none',
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: '0.35rem',
      }}
    >
      {name && <span style={{ color: 'var(--text-primary)' }}>{name}</span>}
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>{name ? `· ${code}` : code}</span>
      {typeof price === 'number' && price > 0 && (
        <span style={{ color, fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
          {price.toLocaleString()}원
          {typeof changeRate === 'number' && (
            <span style={{ marginLeft: '0.25rem' }}>
              {isUp ? '▲' : isDown ? '▼' : ''}{Math.abs(changeRate).toFixed(2)}%
            </span>
          )}
        </span>
      )}
    </Link>
  );
}
