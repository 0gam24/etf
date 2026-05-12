'use client';

import { useEffect, useState } from 'react';

interface Props {
  /** 글에서 다루는 종목 코드 (frontmatter tickers[0]) */
  code: string;
  /** 종목 이름 */
  name?: string;
  /** 발행 당시 가격 (서버사이드에서 글에서 추출하거나 lib/data 에서 가져옴) */
  publishedPrice: number;
  /** 발행 일자 (YYYY-MM-DD) — 표시용 */
  publishedDate: string;
}

interface RealtimeQuote {
  code: string;
  price: number;
  change: number;
  changeRate: number;
}

interface RealtimeResponse {
  quotes: Array<RealtimeQuote | null>;
  marketStatus: 'pre_open' | 'open' | 'closed' | 'holiday';
  source: 'kis' | 'fallback' | 'mock';
}

/**
 * PublishedVsLive — 글 본문 위 또는 byline 다음에 표시.
 *
 *   "발행 당시 14,365원 → 지금 14,500원 (+0.94%)"
 *   사용자 신뢰도 강화 (트랙 레코드 transparent) + 재방문 동기.
 */
export default function PublishedVsLive({ code, name, publishedPrice, publishedDate }: Props) {
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [marketStatus, setMarketStatus] = useState<RealtimeResponse['marketStatus']>('closed');
  const [hidden, setHidden] = useState(true); // 초기엔 숨김 (FOUC 회피)

  useEffect(() => {
    if (!code || !publishedPrice) return;
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/etf/realtime?codes=${code}`);
        if (!res.ok) return;
        const data: RealtimeResponse = await res.json();
        if (cancelled) return;
        const q = data.quotes?.[0];
        if (q && q.price > 0) {
          setLivePrice(q.price);
          setMarketStatus(data.marketStatus);
          setHidden(false);
        }
      } catch { /* silent */ }
    }
    load();
  }, [code, publishedPrice]);

  if (hidden || livePrice === null) return null;

  const diff = livePrice - publishedPrice;
  const diffPct = (diff / publishedPrice) * 100;
  const up = diff > 0;
  const down = diff < 0;
  const color = up ? '#EF4444' : down ? '#60A5FA' : 'var(--text-secondary)';

  const statusLabel =
    marketStatus === 'open' ? '장중' :
    marketStatus === 'closed' ? '오늘 종가' :
    marketStatus === 'pre_open' ? '장 시작 전' :
    '휴장';

  return (
    <aside
      style={{
        margin: 'var(--space-6) 0',
        padding: 'var(--space-5) var(--space-6)',
        background: `linear-gradient(135deg, ${color}1a, rgba(212,175,55,0.08))`,
        border: `2px solid ${color}66`,
        borderRadius: 'var(--radius)',
        fontSize: '0.95rem',
        boxShadow: `0 4px 16px ${color}1a`,
      }}
      aria-label="발행 시점 대비 현재 시세"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
        <span style={{ color: 'var(--accent-gold)', fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          📊 발행 vs 현재
        </span>
        {marketStatus === 'open' && (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.1rem 0.4rem',
            background: 'rgba(239,68,68,0.2)',
            color: '#EF4444',
            borderRadius: '0.25rem',
            fontSize: '0.65rem',
            fontWeight: 800,
            letterSpacing: '0.05em',
          }}>
            <span style={{ width: '0.4rem', height: '0.4rem', borderRadius: '50%', background: '#EF4444', animation: 'pulse 1.4s ease-in-out infinite' }} aria-hidden />
            LIVE
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.6rem', fontSize: '1rem' }}>
        <span style={{ color: 'var(--text-dim)' }}>
          {publishedDate} 발행 <strong style={{ color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{publishedPrice.toLocaleString()}원</strong>
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>→</span>
        <span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{statusLabel}</span>{' '}
          <strong style={{ color: 'var(--text-primary)', fontSize: '1.15rem', fontVariantNumeric: 'tabular-nums' }}>{livePrice.toLocaleString()}원</strong>
        </span>
        <span style={{ color, fontWeight: 800, fontSize: '1.1rem', fontVariantNumeric: 'tabular-nums' }}>
          {up ? '▲' : down ? '▼' : '–'} {Math.abs(diff).toLocaleString()}원 ({up ? '+' : ''}{diffPct.toFixed(2)}%)
        </span>
      </div>
      {name && (
        <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          종목: {name} ({code}) · 발행 시점의 가격은 분석의 기준이며, 현재 시세는 한투 OpenAPI 실시간 (분 단위).
        </div>
      )}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </aside>
  );
}
