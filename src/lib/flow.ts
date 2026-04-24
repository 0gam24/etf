/**
 * /flow 카테고리 — 섹터 자금 흐름 가공.
 *   - 섹터별 집계(평균 등락률·거래량·ETF 수)
 *   - 대장 ETF / 후미 ETF
 *   - 히트 강도 스코어 (거래량 × |등락률|)
 *
 * 주: 1일 ETF 시세 데이터 기반의 "오늘 기준" 스냅샷.
 *     주간/월간 누적은 파이프라인이 시계열을 적재한 후 보강 가능.
 */

import type { Post } from '@/lib/posts';

export interface RawEtf {
  code: string;
  name: string;
  price: number;
  change: number;
  changeRate: number;
  volume: number;
  tradeAmount?: number;
  marketCap?: number;
  sector?: string;
}

export interface SectorAggregate {
  sector: string;
  etfCount: number;
  avgChange: number;
  totalVolume: number;
  totalTradeAmount: number;
  /** 섹터 거래량 1위 (대장 ETF) */
  leader: RawEtf;
  /** 섹터 거래량 2위 */
  runnerUp: RawEtf | null;
  /** 섹터 등락률 1위 */
  topGainer: RawEtf;
  /** 섹터 등락률 꼴찌 */
  topLoser: RawEtf;
  /** 히트 강도 0-1 (정렬·시각화용) */
  heatScore: number;
  /** 섹터 분석 글 */
  posts: Post[];
}

/**
 * ETF 목록을 섹터별로 집계.
 *   leader = 거래량 1위, topGainer = 등락률 1위 등.
 *   heatScore = 거래량 × |평균 등락률| 정규화.
 */
export function computeSectorAggregates(etfs: RawEtf[], posts: Post[]): SectorAggregate[] {
  const bySector = new Map<string, RawEtf[]>();
  for (const e of etfs) {
    const key = e.sector || '기타';
    if (!bySector.has(key)) bySector.set(key, []);
    bySector.get(key)!.push(e);
  }

  // 포스트 매핑: 첫 ticker의 섹터 기준
  const sectorByCode = new Map<string, string>();
  for (const e of etfs) sectorByCode.set(e.code.toUpperCase(), e.sector || '기타');
  const postsBySector = new Map<string, Post[]>();
  for (const p of posts) {
    const t = (p.meta.tickers || [])[0];
    if (!t) continue;
    const sec = sectorByCode.get(t.toUpperCase()) || '기타';
    if (!postsBySector.has(sec)) postsBySector.set(sec, []);
    postsBySector.get(sec)!.push(p);
  }

  const aggregates: SectorAggregate[] = [];
  for (const [sector, list] of bySector.entries()) {
    const avgChange = list.reduce((s, e) => s + (e.changeRate || 0), 0) / list.length;
    const totalVolume = list.reduce((s, e) => s + (e.volume || 0), 0);
    const totalTradeAmount = list.reduce((s, e) => s + (e.tradeAmount || 0), 0);
    const byVolDesc = [...list].sort((a, b) => (b.volume || 0) - (a.volume || 0));
    const byChgDesc = [...list].sort((a, b) => (b.changeRate || 0) - (a.changeRate || 0));
    aggregates.push({
      sector,
      etfCount: list.length,
      avgChange: +avgChange.toFixed(2),
      totalVolume,
      totalTradeAmount,
      leader: byVolDesc[0],
      runnerUp: byVolDesc[1] ?? null,
      topGainer: byChgDesc[0],
      topLoser: byChgDesc[byChgDesc.length - 1],
      heatScore: 0, // 정규화 후 채움
      posts: postsBySector.get(sector) || [],
    });
  }

  // 정규화: 거래량 × |등락률| → max 기준 0~1
  const scored = aggregates.map(a => ({ a, raw: a.totalVolume * Math.abs(a.avgChange) }));
  const maxRaw = Math.max(1, ...scored.map(s => s.raw));
  for (const s of scored) {
    s.a.heatScore = +(s.raw / maxRaw).toFixed(3);
  }

  return aggregates.sort((a, b) => b.heatScore - a.heatScore);
}

/** 평균 등락률 양수가 가장 큰 / 가장 작은 섹터 */
export function pickHottestColdest(aggs: SectorAggregate[]): {
  hottest: SectorAggregate | null;
  coldest: SectorAggregate | null;
} {
  if (aggs.length === 0) return { hottest: null, coldest: null };
  const sortedByChange = [...aggs].sort((a, b) => b.avgChange - a.avgChange);
  return { hottest: sortedByChange[0], coldest: sortedByChange[sortedByChange.length - 1] };
}

export function formatVolume(v: number): string {
  if (v >= 100_000_000) return (v / 100_000_000).toFixed(1) + '억';
  if (v >= 10_000) return (v / 10_000).toFixed(0) + '만';
  return v.toLocaleString();
}

export function formatTradeAmount(v: number): string {
  if (v >= 1_000_000_000_000) return (v / 1_000_000_000_000).toFixed(1) + '조';
  if (v >= 100_000_000) return (v / 100_000_000).toFixed(0) + '억';
  if (v >= 10_000) return (v / 10_000).toFixed(0) + '만';
  return v.toLocaleString();
}

/**
 * 섹터별 시계열 데이터 포인트 (하루 한 점).
 */
export interface SectorTimePoint {
  date: string;       // YYYYMMDD
  avgChange: number;
  totalVolume: number;
  totalTradeAmount: number;
  etfCount: number;
}

export interface SectorSeries {
  sector: string;
  points: SectorTimePoint[];   // 과거 → 현재 순
  latestAvgChange: number;
  weeklyAvgChange: number;     // 5거래일 평균 (있으면)
  weeklyTotalTradeAmount: number;
  trend: 'up' | 'down' | 'flat';
}

/**
 * 일별 ETF 스냅샷 배열에서 섹터 시계열을 구축.
 *   snapshots: 최신이 앞(i=0). 내부에서 날짜 오름차순으로 변환.
 */
export function buildSectorTimeSeries(
  snapshots: Array<{
    baseDate: string;
    etfList: RawEtf[];
  }>,
): SectorSeries[] {
  if (!snapshots.length) return [];

  // 날짜 오름차순
  const ordered = [...snapshots].sort((a, b) => a.baseDate.localeCompare(b.baseDate));

  // 섹터별 날짜별 집계
  const bySector = new Map<string, SectorTimePoint[]>();
  for (const snap of ordered) {
    const groups = new Map<string, RawEtf[]>();
    for (const e of snap.etfList) {
      const key = e.sector || '기타';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(e);
    }
    for (const [sector, list] of groups.entries()) {
      const pt: SectorTimePoint = {
        date: snap.baseDate,
        avgChange: +(list.reduce((s, e) => s + (e.changeRate || 0), 0) / list.length).toFixed(2),
        totalVolume: list.reduce((s, e) => s + (e.volume || 0), 0),
        totalTradeAmount: list.reduce((s, e) => s + (e.tradeAmount || 0), 0),
        etfCount: list.length,
      };
      if (!bySector.has(sector)) bySector.set(sector, []);
      bySector.get(sector)!.push(pt);
    }
  }

  const series: SectorSeries[] = [];
  for (const [sector, points] of bySector.entries()) {
    const last = points[points.length - 1];
    const recent5 = points.slice(-5);
    const weeklyAvg = recent5.reduce((s, p) => s + p.avgChange, 0) / recent5.length;
    const weeklyAmount = recent5.reduce((s, p) => s + p.totalTradeAmount, 0);
    const trend: 'up' | 'down' | 'flat' = weeklyAvg > 0.3 ? 'up' : weeklyAvg < -0.3 ? 'down' : 'flat';
    series.push({
      sector,
      points,
      latestAvgChange: last.avgChange,
      weeklyAvgChange: +weeklyAvg.toFixed(2),
      weeklyTotalTradeAmount: weeklyAmount,
      trend,
    });
  }

  // 주간 평균 등락률 절대값 기준 정렬
  return series.sort((a, b) => Math.abs(b.weeklyAvgChange) - Math.abs(a.weeklyAvgChange));
}
