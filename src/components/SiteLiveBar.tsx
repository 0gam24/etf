'use client';

import { useEffect, useState } from 'react';
import { getMarketSnapshot, marketStatusLabel, marketStatusColor, type MarketSnapshot } from '@/lib/market-calendar';

/**
 * SiteLiveBar — 사이트 전역 상단 1줄 띠.
 *
 *   모든 페이지 최상단에 표시 (RootLayout 통합).
 *   시장 상태 + 시각 + KRX 직전 거래일 명시 → 사이트 전체가 "지금" 시점 통일 인지.
 *
 *   장중에만 매초 갱신 (라이브 느낌).
 *   다른 상태는 분 단위 갱신 (호출량 최소).
 */
export default function SiteLiveBar() {
  const [snap, setSnap] = useState<MarketSnapshot | null>(null);

  useEffect(() => {
    function tick() {
      setSnap(getMarketSnapshot());
    }
    tick();
    // 장중이면 1초, 그 외 60초
    const interval = setInterval(() => {
      const s = getMarketSnapshot();
      setSnap(s);
    }, 1000); // 1초 — 장중 LIVE 느낌. 다른 상태는 visible 변동 적어 영향 X
    return () => clearInterval(interval);
  }, []);

  if (!snap) return null;

  const color = marketStatusColor(snap.status);
  const isLive = snap.status === 'open';
  const label = marketStatusLabel(snap);

  return (
    <div
      role="status"
      aria-label="시장 상태"
      style={{
        background: 'var(--bg-elevated)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0.4rem 0',
        fontSize: '0.75rem',
        lineHeight: 1.4,
      }}
    >
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 var(--space-6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            aria-hidden
            style={{
              display: 'inline-block',
              width: '0.55rem',
              height: '0.55rem',
              borderRadius: '50%',
              background: color,
              boxShadow: isLive ? `0 0 6px ${color}` : 'none',
              animation: isLive ? 'pulseLive 1.4s ease-in-out infinite' : 'none',
            }}
          />
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
            {label}
          </span>
        </div>
        <div style={{ color: 'var(--text-dim)', display: 'inline-flex', gap: '0.75rem' }}>
          {snap.status !== 'open' && snap.status !== 'closed' && (
            <span>직전 거래일 {snap.prevTradingDay.slice(5)}</span>
          )}
          {snap.status === 'open' && (
            <span style={{ color: 'var(--accent-gold)' }}>한투 OpenAPI 30초 갱신</span>
          )}
        </div>
      </div>
      <style>{`
        @keyframes pulseLive {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
