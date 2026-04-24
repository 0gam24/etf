/**
 * /surge 카테고리 — 급등 ETF 분석 헬퍼.
 *   - 등락률·거래량 기반 위험 신호 라벨 자동 생성
 *   - 섹터 단위 테마 그룹화 (오늘 급등한 ETF + 분석 포스트 매핑)
 *   - 단일 ETF 기본 정보 조회
 */

import type { Post } from '@/lib/posts';

export interface RawEtf {
  code: string;
  name: string;
  price: number;
  change: number;
  changeRate: number;
  volume: number;
  sector?: string;
}

export type RiskSeverity = 'critical' | 'warning' | 'momentum' | 'stable' | 'neutral';

export interface RiskLabel {
  text: string;
  severity: RiskSeverity;
  hint: string;
}

/**
 * 위험 신호 라벨 자동 생성.
 *  - changeRate(당일 등락률)와 volume / market 평균 거래량을 기반으로 한 휴리스틱.
 *  - 실제 OHLC 히스토리·52주 신고가 데이터가 추가되면 정밀도 향상 가능.
 */
export function computeRiskLabels(
  etf: Pick<RawEtf, 'changeRate' | 'volume'>,
  marketAvgVolume?: number,
): RiskLabel[] {
  const labels: RiskLabel[] = [];
  const cr = etf.changeRate ?? 0;

  if (cr >= 10) {
    labels.push({ text: '갭상승 추정', severity: 'critical', hint: '단기 수급 쏠림 — 추격 주의' });
  } else if (cr >= 5) {
    labels.push({ text: '단기 과열', severity: 'warning', hint: '5%+ 강한 상승 — 분할 진입 권장' });
  } else if (cr >= 3) {
    labels.push({ text: '강한 모멘텀', severity: 'momentum', hint: '의미 있는 상승 추세' });
  } else if (cr >= 0) {
    labels.push({ text: '안정적 상승', severity: 'stable', hint: '낮은 변동의 우상향' });
  } else if (cr >= -3) {
    labels.push({ text: '조정 진행', severity: 'neutral', hint: '단기 차익실현 매물' });
  } else {
    labels.push({ text: '약세 전환', severity: 'neutral', hint: '추세 약화 — 관망 권장' });
  }

  if (marketAvgVolume && marketAvgVolume > 0 && etf.volume / marketAvgVolume >= 5) {
    labels.push({ text: '거래량 폭발', severity: 'warning', hint: `시장 평균의 ${(etf.volume / marketAvgVolume).toFixed(1)}배` });
  }
  return labels;
}

export interface ThemeGroup {
  sector: string;
  count: number;          // 해당 섹터 내 상승 ETF 수
  avgChange: number;      // 평균 등락률
  totalVolume: number;
  topEtfs: RawEtf[];      // 등락률 상위 3종
  posts: Post[];          // 같은 섹터의 surge 포스트
}

/**
 * 오늘 급등한 ETF(상위 N개)를 섹터로 묶어 테마 그룹 형성.
 *   각 그룹에 같은 섹터의 surge 포스트도 함께 첨부.
 */
export function groupTopGainersByTheme(
  etfs: RawEtf[],
  posts: Post[],
  topN = 30,
): ThemeGroup[] {
  // 등락률 상위 N개만 사용
  const topGainers = [...etfs]
    .filter(e => e.changeRate > 0)
    .sort((a, b) => b.changeRate - a.changeRate)
    .slice(0, topN);

  const sectorMap = new Map<string, RawEtf[]>();
  for (const e of topGainers) {
    const key = e.sector || '기타';
    if (!sectorMap.has(key)) sectorMap.set(key, []);
    sectorMap.get(key)!.push(e);
  }

  // 포스트 매핑: 첫 ticker의 섹터 기준
  const sectorByCode = new Map<string, string>();
  for (const e of etfs) sectorByCode.set(e.code.toUpperCase(), e.sector || '기타');

  const postsBySector = new Map<string, Post[]>();
  for (const p of posts) {
    const firstTicker = (p.meta.tickers || [])[0];
    if (!firstTicker) continue;
    const sec = sectorByCode.get(firstTicker.toUpperCase()) || '기타';
    if (!postsBySector.has(sec)) postsBySector.set(sec, []);
    postsBySector.get(sec)!.push(p);
  }

  const groups: ThemeGroup[] = [];
  for (const [sector, list] of sectorMap.entries()) {
    const avgChange = list.reduce((s, e) => s + e.changeRate, 0) / list.length;
    const totalVolume = list.reduce((s, e) => s + e.volume, 0);
    const topEtfs = list.slice(0, 3);
    groups.push({
      sector,
      count: list.length,
      avgChange: +avgChange.toFixed(2),
      totalVolume,
      topEtfs,
      posts: postsBySector.get(sector) || [],
    });
  }

  return groups.sort((a, b) => b.avgChange - a.avgChange);
}

/** 시장 전체 평균 거래량 — 위험 신호 계산용 */
export function computeMarketAvgVolume(etfs: RawEtf[]): number {
  if (!etfs.length) return 0;
  return etfs.reduce((s, e) => s + (e.volume || 0), 0) / etfs.length;
}

/** code로 ETF 한 종목 조회 */
export function findEtfByCode(etfs: RawEtf[], code: string): RawEtf | null {
  if (!code) return null;
  const target = code.toUpperCase();
  return etfs.find(e => e.code.toUpperCase() === target) || null;
}

/** surge 포스트의 첫 bullet 추출 (도화선 한 줄용) */
export function extractSurgeCatalyst(post: Post): string {
  const lines = post.content
    .split('\n')
    .map(l => l.trim())
    .filter(l => /^[-•]\s+/.test(l));
  if (lines.length === 0) return post.meta.description;
  return lines[0].replace(/^[-•]\s+/, '').replace(/\*\*/g, '');
}
