'use client';

import { useEffect, useState } from 'react';
import type { HookCopy } from '@/lib/hook';
import { buildMarketHookCopy } from '@/lib/hook';

interface BaselineEtf {
  code: string;
  name: string;
  changeRate?: number;
  volume?: number;
}

interface CategoryInfo {
  name: string;
  avgChange: number;
}

interface Props {
  /** SSR initial hook copy — 한투 응답 없을 때 폴백 */
  initial: HookCopy;
  /** 폰트 className (server 측 next/font 적용 결과) */
  serifClassName: string;
  /** 실시간 시장 데이터 재계산 baseline (top10) — 비어있으면 polling 안 함 */
  baseline?: BaselineEtf[];
  /** SSR initial categories — polling 실패 시 폴백 */
  initialCategories?: CategoryInfo[];
  /** 분석 종목 총 개수 (시장 평균 계산 표시용) */
  totalCount: number;
}

interface RealtimeQuote {
  code: string;
  price: number;
  changeRate: number;
  volume: number;
}

interface RealtimeResponse {
  quotes: Array<RealtimeQuote | null>;
  marketStatus: 'pre_open' | 'open' | 'closed' | 'holiday';
  source: 'kis' | 'fallback' | 'mock';
}

/**
 * LiveHookContent — Chapter 1 한 문장 hook 의 client 라이브 재계산.
 *
 *   30s polling 으로 baseline top10 의 한투 실시간 등락률 → marketAvg / topCategory 갱신
 *   → buildMarketHookCopy 호출해 hook 한 문장 재생성.
 *
 *   ▶ initial 은 SSR (KRX 마감) 폴백. polling 결과 quotes 0건이면 그대로 유지.
 *   ▶ 폰트는 server 부모에서 next/font/google 적용한 className 으로 전달받음.
 */
export default function LiveHookContent({
  initial,
  serifClassName,
  baseline,
  initialCategories,
  totalCount,
}: Props) {
  const [hook, setHook] = useState<HookCopy>(initial);
  const [marketStatus, setMarketStatus] = useState<RealtimeResponse['marketStatus']>('closed');

  useEffect(() => {
    if (!baseline?.length) return;
    let cancelled = false;
    async function refresh() {
      if (!baseline?.length) return;
      const codes = baseline.slice(0, 10).map(b => b.code).filter(Boolean).join(',');
      if (!codes) return;
      try {
        const res = await fetch(`/api/etf/realtime?codes=${codes}`);
        if (!res.ok) return;
        const data: RealtimeResponse = await res.json();
        if (cancelled) return;
        setMarketStatus(data.marketStatus);
        const liveMap = new Map<string, RealtimeQuote>();
        for (const q of data.quotes) {
          if (q && q.code && q.price > 0) liveMap.set(q.code, q);
        }
        if (liveMap.size === 0) return; // pre_open 등 — SSR 유지

        // baseline 항목별 라이브 등락률 합성
        const liveItems = baseline.slice(0, 10).map(b => {
          const q = liveMap.get(b.code);
          return q ? q.changeRate : (b.changeRate ?? 0);
        });
        const marketAvg = liveItems.reduce((s, v) => s + v, 0) / liveItems.length;

        // SSR initialCategories 유지 (라이브 카테고리 평균은 별도 endpoint 필요)
        const topCategory = (initialCategories || []).reduce<CategoryInfo | null>((best, c) => {
          if (!best) return c;
          return Math.abs(c.avgChange) > Math.abs(best.avgChange) ? c : best;
        }, null);

        // hook 재생성
        const refreshed = buildMarketHookCopy({ marketAvg, topCategory, totalCount }, undefined, new Date());
        setHook(refreshed);
      } catch { /* silent — SSR 유지 */ }
    }
    refresh();
    const interval = marketStatus === 'open' ? 30_000 : 5 * 60_000;
    const id = setInterval(refresh, interval);
    return () => { cancelled = true; clearInterval(id); };
  }, [baseline, marketStatus, initialCategories, totalCount]);

  return (
    <>
      <p className={`home-hook-line ${serifClassName}`}>{hook.line}</p>
      <p className="home-hook-caption">{hook.caption}</p>
    </>
  );
}
