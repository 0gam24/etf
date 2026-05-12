'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Flame, ArrowRight } from 'lucide-react';

interface Etf {
  code: string;
  name: string;
  price: number;
  changeRate: number;
  volume?: number;
}

interface CategoryInfo {
  name: string;
  avgChange: number;
}

interface Props {
  /** SSR 초기 데이터 (KRX 일별 마감) — 한투 API 실패 시 폴백 */
  initialTopVolume?: Etf | null;
  initialTopGainer?: Etf | null;
  initialMarketAvg?: number;
  initialCategories?: CategoryInfo[];
  /** 실시간 재분류용 후보 — 거래량 top10 코드+이름. polling 시 양수 max 가 새 featured. */
  initialBaseline?: Etf[];
  /** 페이지 내 풀 위젯 anchor (예: '#market-pulse-full') */
  fullWidgetAnchor?: string;
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
 * MarketPulseCondensed — 메인페이지 최상단 5초 스냅샷.
 *
 *   ✅ 옵션 C 적용 — 압축 1~2줄 만 최상단, 풀 EtfMarketPulse 위젯은 기존 위치 유지.
 *
 *   ▶ 좋은점 8 모두 반영
 *     1) 5초 첫인상 — 페이지 최상단 LIVE 펄스
 *     2) 데이터 저널 톤 — 1차 정보만, 슬로건 X
 *     3) 스토리텔링 출발점 — "왜?" CTA 로 HomeHeroV3 분석 funnel
 *     4) 재방문 동기 — 매일 다른 데이터
 *     5) 체류시간↑ — 풀 위젯 anchor 클릭으로 페이지 내 이동
 *     6) 카테고리 자금 흐름 — 가장 큰 +/- 한 줄로
 *     7) 인지 정렬 — 최상단 = 가장 강력
 *     8) 모바일 첫 화면 — 2줄 fit
 *
 *   ▶ 단점 7 모두 fix
 *     1) 분석 글 클릭률 보존 — "왜?" CTA 가 HomeHeroV3 anchor 로 → 글 funnel 강화
 *     2) HomeHeroV3 무효화 회피 — Hero 자체는 기존 위치 유지, Condensed 는 보조 layer
 *     3) 카피 충돌 — 헤더에 슬로건 없이 "🔥 거래량 1위" 데이터 라벨만
 *     4) 정보 과다 — 종목 1 + 카테고리 1 + 시장 평균 = 3 데이터로 압축
 *     5) 모바일 세로 길이 — flex-wrap + 2줄 max
 *     6) 시청자 의도 — "내 상황은?" 보조 CTA (PersonaSelector anchor) 추가
 *     7) 한투 API 의존 — SSR initial 데이터 (KRX 마감) 항상 표시, 한투는 silent overlay
 */
export default function MarketPulseCondensed({
  initialTopVolume,
  initialTopGainer,
  initialMarketAvg,
  initialCategories,
  initialBaseline,
  fullWidgetAnchor = '#market-pulse-full',
}: Props) {
  // 표시 대상: 우선순위 상승 1위 (SSR) → 거래량 1위 폴백.
  // 장중 polling 후 baseline top10 중 양수 max 종목으로 재선택 (실시간 진정성).
  const initialFeatured = initialTopGainer || initialTopVolume || null;
  const [featured, setFeatured] = useState<Etf | null>(initialFeatured);
  // featured 가 양수 등락률을 가지는가? — 라벨 분기용
  const [isGainerActive, setIsGainerActive] = useState<boolean>(!!initialTopGainer && (initialTopGainer.changeRate ?? 0) > 0);
  const [marketAvg, setMarketAvg] = useState<number>(initialMarketAvg ?? 0);
  const [marketStatus, setMarketStatus] = useState<RealtimeResponse['marketStatus']>('closed');
  const [liveSource, setLiveSource] = useState<RealtimeResponse['source']>('mock');

  // 가장 큰 +/- 카테고리 하나만 표시 (정보 과다 회피)
  const topCategory = (initialCategories || []).reduce<CategoryInfo | null>((best, c) => {
    if (!best) return c;
    return Math.abs(c.avgChange) > Math.abs(best.avgChange) ? c : best;
  }, null);

  // 장중 한투 API silent overlay — baseline top10 전체 fetch + 양수 max 재선택
  // baseline 없으면 featured 코드만 단일 fetch (구버전 호환)
  useEffect(() => {
    if (!featured?.code && !initialBaseline?.length) return;
    let cancelled = false;
    async function refresh() {
      const baseline = initialBaseline && initialBaseline.length > 0 ? initialBaseline : (featured ? [featured] : []);
      if (!baseline.length) return;
      const codes = baseline.slice(0, 10).map(b => b.code).filter(Boolean).join(',');
      if (!codes) return;
      try {
        const res = await fetch(`/api/etf/realtime?codes=${codes}`);
        if (!res.ok) return;
        const data: RealtimeResponse = await res.json();
        if (cancelled) return;
        setMarketStatus(data.marketStatus);
        setLiveSource(data.source);

        // baseline 과 quotes 를 code 키로 매핑하여 실시간 등락률 산출
        const liveMap = new Map<string, { price: number; changeRate: number; volume: number }>();
        for (const q of data.quotes) {
          if (q && q.code && q.price > 0) {
            liveMap.set(q.code, { price: q.price, changeRate: q.changeRate, volume: q.volume });
          }
        }
        if (liveMap.size === 0) return; // 실시간 응답 0건 (pre_open 등) — SSR 값 유지

        // baseline 항목별 라이브 데이터 합성
        const liveItems: Etf[] = baseline.slice(0, 10).map(b => {
          const q = liveMap.get(b.code);
          if (!q) return b; // 라이브 없으면 SSR 그대로
          return { code: b.code, name: b.name, price: q.price, changeRate: q.changeRate, volume: q.volume };
        });

        // 양수 등락률 max → 새 featured. 양수 없으면 거래량 1위 (= baseline[0]) 폴백.
        const positives = liveItems.filter(e => (e.changeRate ?? 0) > 0);
        if (positives.length > 0) {
          positives.sort((a, b) => (b.changeRate ?? 0) - (a.changeRate ?? 0));
          setFeatured(positives[0]);
          setIsGainerActive(true);
        } else {
          // 전체 음수 — 거래량 1위 (baseline[0]) 의 라이브 데이터를 표시
          const top = liveItems[0] || baseline[0];
          setFeatured(top);
          setIsGainerActive(false);
        }
      } catch {
        // silent — SSR initial 데이터 유지
      }
    }
    refresh();
    const interval = marketStatus === 'open' ? 30_000 : 5 * 60_000;
    const id = setInterval(refresh, interval);
    return () => { cancelled = true; clearInterval(id); };
  }, [initialBaseline, marketStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  // 데이터 없으면 렌더 안 함 (사이트 정상 작동에 영향 X)
  if (!featured) return null;

  const isLive = marketStatus === 'open' && liveSource === 'kis';
  const tvUp = featured.changeRate > 0;
  const tvDown = featured.changeRate < 0;
  const tvColor = tvUp ? '#EF4444' : tvDown ? '#60A5FA' : 'var(--text-secondary)';
  const featuredLabel = isGainerActive ? '상승 1위' : '거래량 1위';

  const avgUp = marketAvg > 0;
  const avgDown = marketAvg < 0;
  const avgColor = avgUp ? '#EF4444' : avgDown ? '#60A5FA' : 'var(--text-secondary)';

  const catColor = topCategory && topCategory.avgChange > 0 ? '#EF4444'
    : topCategory && topCategory.avgChange < 0 ? '#60A5FA' : 'var(--text-secondary)';

  return (
    <section
      aria-label="시장 5초 스냅샷"
      style={{
        margin: 'var(--space-4) auto',
        maxWidth: '80rem',
        padding: 'var(--space-3) var(--space-5)',
        background: 'linear-gradient(135deg, rgba(212,175,55,0.08), rgba(11,14,20,0.4))',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
      }}
    >
      {/* 줄 1: 상승 1위 ETF (한투 실시간 또는 KRX 마감) — 없으면 거래량 1위 폴백 */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
          color: isGainerActive ? '#EF4444' : 'var(--accent-gold)',
          fontWeight: 700, fontSize: '0.8rem',
        }}>
          <Flame size={14} strokeWidth={2.5} aria-hidden />
          {featuredLabel}
        </span>
        <Link href={`/etf/${featured.code.toLowerCase()}`} prefetch={false} style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 700 }}>
          {featured.name}
        </Link>
        <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--text-secondary)' }}>
          {featured.price.toLocaleString()}원
        </span>
        <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 800, color: tvColor }}>
          {tvUp ? '▲' : tvDown ? '▼' : '–'} {Math.abs(featured.changeRate).toFixed(2)}%
        </span>
        {isLive && (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.1rem 0.4rem',
            background: 'rgba(239,68,68,0.18)',
            color: '#EF4444',
            borderRadius: '0.25rem',
            fontSize: '0.65rem',
            fontWeight: 800,
            letterSpacing: '0.05em',
          }}>
            <span style={{ width: '0.4rem', height: '0.4rem', borderRadius: '50%', background: '#EF4444', animation: 'pulseLive 1.4s ease-in-out infinite' }} aria-hidden />
            LIVE
          </span>
        )}
      </div>

      {/* 줄 2: 시장 평균 + 가장 큰 카테고리 + 두 개 CTA (왜? / 내 상황은?) */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
        <span>
          시장 평균 <strong style={{ color: avgColor, fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>
            {avgUp ? '+' : ''}{marketAvg.toFixed(2)}%
          </strong>
        </span>
        {topCategory && (
          <>
            <span style={{ color: 'var(--text-muted)' }}>·</span>
            <span>
              {topCategory.name} <strong style={{ color: catColor, fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>
                {topCategory.avgChange > 0 ? '+' : ''}{topCategory.avgChange.toFixed(2)}%
              </strong>
            </span>
          </>
        )}

        <span style={{ marginLeft: 'auto', display: 'inline-flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* 단점 1 fix: "왜?" CTA → HomeHeroV3 분석 funnel */}
          <a href="#daily-pulse-hero" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.6rem', background: 'rgba(212,175,55,0.15)', color: 'var(--accent-gold)', borderRadius: '0.375rem', textDecoration: 'none', fontWeight: 700, fontSize: '0.75rem' }}>
            왜 움직였나 <ArrowRight size={11} strokeWidth={2.5} aria-hidden />
          </a>
          {/* 단점 6 fix: "내 상황은?" CTA → PersonaSelector */}
          <a href="#persona-selector" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.6rem', background: 'var(--bg-card)', color: 'var(--text-secondary)', borderRadius: '0.375rem', textDecoration: 'none', fontWeight: 600, fontSize: '0.75rem' }}>
            내 상황은? <ArrowRight size={11} strokeWidth={2.5} aria-hidden />
          </a>
          {/* 풀 위젯 anchor */}
          <a href={fullWidgetAnchor} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.6rem', color: 'var(--text-dim)', textDecoration: 'none', fontSize: '0.75rem' }}>
            전체 시장 <ArrowRight size={11} strokeWidth={2.5} aria-hidden />
          </a>
        </span>
      </div>

      <style>{`
        @keyframes pulseLive {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </section>
  );
}
