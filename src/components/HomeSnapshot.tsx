'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Flame, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import CountUpNumber from './CountUpNumber';
import LiveDataBadge from './LiveDataBadge';

interface Etf {
  code: string;
  name: string;
  price?: number;
  change?: number;
  changeRate: number;
  volume: number;
  sector?: string;
}

interface Props {
  /** SSR 초기값 — 한투 API 실패·장 시작 전 폴백 */
  topVolume: Etf | null;
  topGainer: Etf | null;
  topLoser: Etf | null;
  marketAvg: number;
  totalCount: number;
  /** KRX baseDate (YYYYMMDD) — 데이터 출처·갱신 시점 표기용 */
  baseDate?: string;
  /** 실시간 재계산용 후보 — 거래량 top10. polling 후 4 카드 모두 재산출 */
  baseline?: Etf[];
}

interface BigValue {
  value: number;
  sign?: boolean;
  decimals?: number;
  suffix?: string;
  comma?: boolean;
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

function buildVolumeBig(v: number): BigValue {
  if (v >= 10000000) return { value: +(v / 10000000).toFixed(1), decimals: 1, suffix: '천만주' };
  if (v >= 10000) return { value: Math.round(v / 10000), decimals: 0, suffix: '만주' };
  return { value: v, decimals: 0, suffix: '주' };
}

/**
 * HomeSnapshot — 거래량 1위 / 상승 1위 / 하락 1위 / 시장 평균 4 카드.
 *
 *   SSR initial (KRX 마감) → 장중 한투 realtime polling 30s 마다 4 카드 모두 재계산.
 *   baseline (top10) 의 라이브 등락률 기준으로:
 *     - 거래량 1위 = volume max
 *     - 상승 1위   = changeRate max (양수만, 없으면 hide)
 *     - 하락 1위   = changeRate min (음수만, 없으면 hide)
 *     - 시장 평균   = top10 평균
 */
export default function HomeSnapshot({
  topVolume: initTopVolume,
  topGainer: initTopGainer,
  topLoser: initTopLoser,
  marketAvg: initMarketAvg,
  totalCount,
  baseDate,
  baseline,
}: Props) {
  const [topVolume, setTopVolume] = useState<Etf | null>(initTopVolume);
  const [topGainer, setTopGainer] = useState<Etf | null>(initTopGainer);
  const [topLoser, setTopLoser] = useState<Etf | null>(initTopLoser);
  const [marketAvg, setMarketAvg] = useState<number>(initMarketAvg);
  const [marketStatus, setMarketStatus] = useState<RealtimeResponse['marketStatus']>('closed');
  const [liveSource, setLiveSource] = useState<RealtimeResponse['source']>('mock');
  const [liveTs, setLiveTs] = useState<number | null>(null);

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
        setLiveSource(data.source);
        setLiveTs(data.ts);

        const liveMap = new Map<string, RealtimeQuote>();
        for (const q of data.quotes) {
          if (q && q.code && q.price > 0) liveMap.set(q.code, q);
        }
        if (liveMap.size === 0) return; // pre_open 등 — SSR 유지

        // baseline 항목별 라이브 합성
        const live: Etf[] = baseline.slice(0, 10).map(b => {
          const q = liveMap.get(b.code);
          if (!q) return b;
          return { ...b, price: q.price, change: q.change, changeRate: q.changeRate, volume: q.volume };
        });

        // 거래량 1위 (volume max)
        const byVol = [...live].sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0));
        if (byVol[0]) setTopVolume(byVol[0]);

        // 상승 1위 (양수만, 없으면 null)
        const gainers = live.filter(e => (e.changeRate ?? 0) > 0).sort((a, b) => (b.changeRate ?? 0) - (a.changeRate ?? 0));
        setTopGainer(gainers[0] || null);

        // 하락 1위 (음수만, 없으면 null)
        const losers = live.filter(e => (e.changeRate ?? 0) < 0).sort((a, b) => (a.changeRate ?? 0) - (b.changeRate ?? 0));
        setTopLoser(losers[0] || null);

        // 시장 평균 (top10 평균)
        const avg = live.reduce((s, e) => s + (e.changeRate ?? 0), 0) / live.length;
        setMarketAvg(avg);
      } catch {
        // silent — SSR initial 유지
      }
    }
    refresh();
    const interval = marketStatus === 'open' ? 30_000 : 5 * 60_000;
    const id = setInterval(refresh, interval);
    return () => { cancelled = true; clearInterval(id); };
  }, [baseline, marketStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  const cards: Array<{
    cls: string;
    icon: React.ReactNode;
    label: string;
    big: BigValue;
    name: string;
    sub: string;
    href?: string;
  }> = [];

  if (topVolume) cards.push({
    cls: 'snap-volume',
    icon: <Flame size={15} strokeWidth={2.4} aria-hidden />,
    label: '거래량 1위',
    big: buildVolumeBig(topVolume.volume),
    name: topVolume.name,
    sub: topVolume.sector || topVolume.code,
  });

  if (topGainer) cards.push({
    cls: 'snap-up',
    icon: <ArrowUpRight size={15} strokeWidth={2.4} aria-hidden />,
    label: '상승 1위',
    big: { value: topGainer.changeRate, decimals: 2, suffix: '%', sign: true },
    name: topGainer.name,
    sub: topGainer.sector || topGainer.code,
  });

  if (topLoser) cards.push({
    cls: 'snap-down',
    icon: <ArrowDownRight size={15} strokeWidth={2.4} aria-hidden />,
    label: '하락 1위',
    big: { value: topLoser.changeRate, decimals: 2, suffix: '%' },
    name: topLoser.name,
    sub: topLoser.sector || topLoser.code,
  });

  cards.push({
    cls: marketAvg >= 0 ? 'snap-market-up' : 'snap-market-down',
    icon: <Activity size={15} strokeWidth={2.4} aria-hidden />,
    label: '시장 평균',
    big: { value: marketAvg, decimals: 2, suffix: '%', sign: true },
    name: `분석 종목 ${totalCount}개`,
    sub: marketAvg >= 0 ? '자금 유입 우세' : '자금 유출 우세',
  });

  if (cards.length === 0) return null;

  // 라이브 vs KRX 폴백 표시
  const isLive = marketStatus === 'open' && liveSource === 'kis' && liveTs;
  const isKrxFallback = !isLive && baseDate;

  return (
    <section className="home-snap" aria-label="5초 시장 스냅샷">
      <div style={{ maxWidth: '80rem', margin: '0 auto var(--space-3)', padding: '0 var(--space-5)', display: 'flex', justifyContent: 'flex-end' }}>
        {isLive ? (
          <LiveDataBadge source="kis" ts={liveTs} compact />
        ) : isKrxFallback ? (
          <LiveDataBadge source="krx" baseDate={baseDate} compact />
        ) : null}
      </div>
      <div className="home-snap-grid">
        {cards.map((c, i) => {
          const inner = (
            <>
              <div className="home-snap-head">
                <span className="home-snap-icon" aria-hidden>{c.icon}</span>
                <span className="home-snap-label">{c.label}</span>
              </div>
              <div className="home-snap-big">
                <CountUpNumber
                  value={c.big.value}
                  decimals={c.big.decimals}
                  suffix={c.big.suffix}
                  sign={c.big.sign}
                  comma={c.big.comma}
                />
              </div>
              <div className="home-snap-name">{c.name}</div>
              <div className="home-snap-sub">{c.sub}</div>
            </>
          );
          return c.href ? (
            <Link key={i} href={c.href} className={`home-snap-card ${c.cls}`}>{inner}</Link>
          ) : (
            <div key={i} className={`home-snap-card ${c.cls}`}>{inner}</div>
          );
        })}
      </div>
    </section>
  );
}
