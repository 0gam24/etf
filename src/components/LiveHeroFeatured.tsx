'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Radio } from 'lucide-react';

interface BaselineEtf {
  code: string;
  name: string;
  price: number;
  change?: number;
  changeRate?: number;
  volume: number;
}

interface Holding {
  ticker?: string;
  name: string;
  weight: number;
}

interface CatalystEntry {
  title: string;
  source: string;
  href?: string;
}

interface HeroDict {
  holdings: Holding[];
  catalyst: CatalystEntry | null;
}

interface Props {
  /** SSR fallback (실시간 응답 0건 시 표시) */
  initial: BaselineEtf;
  /** top10 baseline — 양수 max 재선택용 */
  baseline: BaselineEtf[];
  /** 각 ETF code 별 holdings TOP3 + catalyst 사전 — code 변경 시 lookup */
  heroDict: Record<string, HeroDict>;
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
 * LiveHeroFeatured — HomeHeroV3 우측 카드 전체 client component.
 *
 *   30s polling 으로 baseline top10 라이브 → 양수 max 종목을 featured 로 선택.
 *   featured 가 바뀌면 코드·이름·가격·등락률·거래량·holdings·catalyst 모두 자동 동기화.
 *   전체 음수 (전 종목 하락) → 거래량 1위 (baseline[0]) 폴백 + 라벨 변경.
 *
 *   ▶ 사용자 모순 지적 해소:
 *     - 라벨이 '상승 1위' 인데 등락률 -X% → 양수 종목으로 자동 swap
 *     - 종목 메타 (holdings·catalyst) 도 함께 swap → 좌·우 데이터 일관성
 */
export default function LiveHeroFeatured({ initial, baseline, heroDict }: Props) {
  const [featured, setFeatured] = useState<BaselineEtf>(initial);
  const [isGainer, setIsGainer] = useState<boolean>((initial.changeRate ?? 0) > 0);
  const [marketStatus, setMarketStatus] = useState<RealtimeResponse['marketStatus']>('closed');
  const [liveTs, setLiveTs] = useState<number | null>(null);

  useEffect(() => {
    if (!baseline?.length) return;
    let cancelled = false;
    async function refresh() {
      const codes = baseline.slice(0, 10).map(b => b.code).filter(Boolean).join(',');
      if (!codes) return;
      try {
        const res = await fetch(`/api/etf/realtime?codes=${codes}`);
        if (!res.ok) return;
        const data: RealtimeResponse = await res.json();
        if (cancelled) return;
        setMarketStatus(data.marketStatus);
        setLiveTs(data.ts);

        const liveMap = new Map<string, RealtimeQuote>();
        for (const q of data.quotes) {
          if (q && q.code && q.price > 0) liveMap.set(q.code, q);
        }
        if (liveMap.size === 0) return; // pre_open 등 — SSR 유지

        // baseline 항목별 라이브 합성
        const live: BaselineEtf[] = baseline.slice(0, 10).map(b => {
          const q = liveMap.get(b.code);
          if (!q) return b;
          return { code: b.code, name: b.name, price: q.price, change: q.change, changeRate: q.changeRate, volume: q.volume };
        });

        // 양수 max → 새 featured
        const positives = live.filter(e => (e.changeRate ?? 0) > 0).sort((a, b) => (b.changeRate ?? 0) - (a.changeRate ?? 0));
        if (positives.length > 0) {
          setFeatured(positives[0]);
          setIsGainer(true);
        } else {
          setFeatured(live[0] || baseline[0]); // 거래량 1위 폴백
          setIsGainer(false);
        }
      } catch { /* silent */ }
    }
    refresh();
    const interval = marketStatus === 'open' ? 30_000 : 5 * 60_000;
    const id = setInterval(refresh, interval);
    return () => { cancelled = true; clearInterval(id); };
  }, [baseline, marketStatus]);

  const dict = heroDict[featured.code] || { holdings: [], catalyst: null };
  const top3 = dict.holdings.slice(0, 3);
  const catalyst = dict.catalyst;

  const labelColor = isGainer ? '#EF4444' : 'var(--text-dim)';
  const labelText = isGainer ? '오늘 상승 1위' : `오늘 거래량 1위 (라이브 약세)`;

  const isLive = marketStatus === 'open' && liveTs;
  const hm = isLive && liveTs ? (() => {
    const kst = new Date(liveTs + 9 * 3600 * 1000);
    return `${String(kst.getUTCHours()).padStart(2, '0')}:${String(kst.getUTCMinutes()).padStart(2, '0')}:${String(kst.getUTCSeconds()).padStart(2, '0')}`;
  })() : null;

  const changeRate = featured.changeRate ?? 0;
  const change = featured.change ?? 0;
  const sign = changeRate > 0 ? '▲' : changeRate < 0 ? '▼' : '–';
  const color = changeRate > 0 ? '#EF4444' : changeRate < 0 ? '#60A5FA' : 'var(--text-secondary)';

  return (
    <aside className="home-hero-v3-right">
      <div className="home-hero-v3-right-head">
        <span className="home-hero-v3-right-label" style={{ color: labelColor }}>
          {labelText}
        </span>
        <span className="home-hero-v3-right-code">{featured.code}</span>
      </div>
      <div className="home-hero-v3-etf-name">{featured.name}</div>

      <div className="home-hero-v3-quote" style={{ marginTop: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
            {featured.price.toLocaleString()}<span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>원</span>
          </span>
          <span style={{ color, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
            {sign} {Math.abs(change).toLocaleString()}원 ({changeRate > 0 ? '+' : ''}{changeRate.toFixed(2)}%)
          </span>
        </div>
        <div style={{ marginTop: '0.4rem', display: 'flex', gap: '0.6rem', alignItems: 'center', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>거래량 <strong style={{ color: 'var(--text-secondary)' }}>{featured.volume.toLocaleString()}주</strong></span>
          {hm && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.1rem 0.35rem',
              background: 'rgba(239,68,68,0.18)',
              color: '#EF4444',
              borderRadius: '0.25rem',
              fontSize: '0.7rem',
              fontWeight: 700,
              fontVariantNumeric: 'tabular-nums',
            }}>
              <span style={{ width: '0.35rem', height: '0.35rem', borderRadius: '50%', background: '#EF4444', animation: 'liveHeroPulse 1.4s ease-in-out infinite' }} aria-hidden />
              LIVE · {hm}
            </span>
          )}
        </div>
      </div>

      {catalyst && (
        catalyst.href ? (
          <Link href={catalyst.href} prefetch={false} className="home-hero-v3-catalyst is-link">
            <span className="home-hero-v3-catalyst-label">
              <Radio size={12} strokeWidth={2.6} aria-hidden /> 오늘의 도화선
            </span>
            <span className="home-hero-v3-catalyst-text">{catalyst.title}</span>
            {catalyst.source && (
              <span className="home-hero-v3-catalyst-source">— {catalyst.source}</span>
            )}
          </Link>
        ) : (
          <div className="home-hero-v3-catalyst">
            <span className="home-hero-v3-catalyst-label">
              <Radio size={12} strokeWidth={2.6} aria-hidden /> 오늘의 도화선
            </span>
            <span className="home-hero-v3-catalyst-text">{catalyst.title}</span>
            {catalyst.source && (
              <span className="home-hero-v3-catalyst-source">— {catalyst.source}</span>
            )}
          </div>
        )
      )}

      {top3.length > 0 && (
        <div className="home-hero-v3-holdings">
          <div className="home-hero-v3-holdings-label">담긴 기업 TOP 3</div>
          <ol className="home-hero-v3-holdings-list">
            {top3.map((h, i) => (
              <li key={`${h.ticker || h.name}-${i}`}>
                <span className="home-hero-v3-h-rank">{i + 1}</span>
                <span className="home-hero-v3-h-name">{h.name}</span>
                <span className="home-hero-v3-h-weight">{h.weight.toFixed(1)}%</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <style>{`
        @keyframes liveHeroPulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
      `}</style>
    </aside>
  );
}
