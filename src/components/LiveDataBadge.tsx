'use client';

import { useEffect, useState } from 'react';

interface Props {
  /** 데이터 timestamp (epoch ms) — 한투 API 응답·SSR fetchedAt·자체 갱신 시각 */
  ts?: number | null;
  /** 데이터 소스 — 'kis'(한투 실시간) | 'krx'(KRX 마감) | 'mixed' */
  source?: 'kis' | 'krx' | 'mixed';
  /** baseDate (KRX 마감 데이터인 경우 — YYYYMMDD 또는 YYYY-MM-DD) */
  baseDate?: string;
  /** 압축 모드 — pill 작게 (카드 헤더용) */
  compact?: boolean;
}

/**
 * LiveDataBadge — 메인페이지 모든 데이터 카드에 통일된 시각·소스 라벨.
 *
 *   ▶ 표시 규칙:
 *     - 한투 + 장중 (open)        → 🔴 LIVE · 14:32:15 (1s 카운터, 펄스 애니메이션)
 *     - 한투 + 마감 (closed)       → 🟡 한투 종가 · 16:00 (정적)
 *     - KRX 마감 데이터             → 📅 KRX YYYY-MM-DD 종가
 *     - 데이터 없음                 → 빈 노드
 *
 *   ▶ 사용:
 *     <LiveDataBadge ts={Date.now()} source="kis" />
 *     <LiveDataBadge source="krx" baseDate="20260511" />
 */
export default function LiveDataBadge({ ts, source, baseDate, compact = false }: Props) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (source !== 'kis') return;
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [source]);

  if (!ts && !baseDate) return null;

  const isKis = source === 'kis' && !!ts;
  const isKrx = source === 'krx' && !!baseDate;

  // KIS 장중 — 마지막 응답 시각 (HH:MM:SS, 1초 카운터)
  if (isKis) {
    const isOpen = (() => {
      const kst = new Date(Date.now() + 9 * 3600 * 1000);
      const day = kst.getUTCDay();
      if (day === 0 || day === 6) return false;
      const m = kst.getUTCHours() * 60 + kst.getUTCMinutes();
      return m >= 9 * 60 && m < 15 * 60 + 30;
    })();

    const hm = (() => {
      const d = new Date(ts!);
      const kst = new Date(d.getTime() + 9 * 3600 * 1000);
      const h = String(kst.getUTCHours()).padStart(2, '0');
      const m = String(kst.getUTCMinutes()).padStart(2, '0');
      const s = String(kst.getUTCSeconds()).padStart(2, '0');
      return `${h}:${m}:${s}`;
    })();

    const _ = tick; // 강제 re-render

    if (isOpen) {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          padding: compact ? '0.1rem 0.35rem' : '0.15rem 0.45rem',
          background: 'rgba(239,68,68,0.18)',
          color: '#EF4444',
          borderRadius: '0.25rem',
          fontSize: compact ? '0.65rem' : '0.7rem',
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '0.02em',
        }}>
          <span style={{
            width: '0.4rem',
            height: '0.4rem',
            borderRadius: '50%',
            background: '#EF4444',
            animation: 'liveBadgePulse 1.4s ease-in-out infinite',
          }} aria-hidden />
          LIVE · {hm}
          <style>{`@keyframes liveBadgePulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }`}</style>
        </span>
      );
    }
    // 마감 후 한투 종가
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: compact ? '0.1rem 0.35rem' : '0.15rem 0.45rem',
        background: 'rgba(245,158,11,0.18)',
        color: '#F59E0B',
        borderRadius: '0.25rem',
        fontSize: compact ? '0.65rem' : '0.7rem',
        fontWeight: 700,
        fontVariantNumeric: 'tabular-nums',
      }}>
        한투 종가 · {hm.slice(0, 5)}
      </span>
    );
  }

  // KRX 마감 — baseDate (YYYYMMDD → MM/DD 표기)
  if (isKrx) {
    const dateStr = (() => {
      const b = baseDate!.replace(/-/g, '');
      if (b.length !== 8) return baseDate;
      return `${b.slice(4, 6)}/${b.slice(6, 8)}`;
    })();
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: compact ? '0.1rem 0.35rem' : '0.15rem 0.45rem',
        background: 'rgba(96,165,250,0.15)',
        color: '#60A5FA',
        borderRadius: '0.25rem',
        fontSize: compact ? '0.65rem' : '0.7rem',
        fontWeight: 600,
        fontVariantNumeric: 'tabular-nums',
      }}>
        📅 KRX {dateStr} 종가
      </span>
    );
  }

  return null;
}
