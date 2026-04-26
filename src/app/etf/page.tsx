import Link from 'next/link';
import type { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';
import RecommendBox from '@/components/RecommendBox';
import {
  getLatestEtfData,
  getKnownShortcodes,
  getKrxEtfMeta,
  classifyEtfSector,
  extractIssuerLabel,
} from '@/lib/data';
import { buildBreadcrumbSchema, jsonLd } from '@/lib/schema';

export const metadata: Metadata = {
  title: '종목 사전 — KRX 상장 ETF 1000+종 한 페이지 정리 | Daily ETF Pulse',
  description:
    '한국거래소(KRX) 상장 ETF 1000+종을 거래량·섹터·운용사로 정리한 종목 사전. KODEX·TIGER·SOL·ACE·PLUS 등 운용사별, 방산·반도체·커버드콜·월배당 섹터별 빠른 검색.',
  alternates: { canonical: '/etf' },
};

interface EtfRow {
  shortcode: string;
  name: string;
  /** 시세 있는 종목만 채워짐 */
  price?: number;
  changeRate?: number;
  volume?: number;
  sector?: string;
  issuer?: string;
}

// 섹터 정렬 우선순위 (사용자 검색 빈도 기준)
const SECTOR_ORDER = [
  '방산', '조선', 'AI·데이터', '반도체',
  '커버드콜·월배당', '해외주식',
  '국내주식', '2차전지', '바이오·헬스',
  '채권', '원자재·금',
];

function groupBySector(rows: EtfRow[]): Map<string, EtfRow[]> {
  const map = new Map<string, EtfRow[]>();
  for (const r of rows) {
    const key = r.sector || '기타';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(r);
  }
  // 섹터 내부에서 시세 있는 종목 우선 + 거래량 내림차순
  for (const list of map.values()) {
    list.sort((a, b) => {
      const av = a.volume || 0;
      const bv = b.volume || 0;
      if (av !== bv) return bv - av;
      return a.name.localeCompare(b.name, 'ko');
    });
  }
  return map;
}

function sortedSectorEntries(map: Map<string, EtfRow[]>): Array<[string, EtfRow[]]> {
  return Array.from(map.entries()).sort(([a], [b]) => {
    const ai = SECTOR_ORDER.indexOf(a);
    const bi = SECTOR_ORDER.indexOf(b);
    const aOrder = ai === -1 ? 99 : ai;
    const bOrder = bi === -1 ? 99 : bi;
    return aOrder - bOrder;
  });
}

function groupByIssuer(rows: EtfRow[]): Array<{ issuer: string; count: number }> {
  const map = new Map<string, number>();
  for (const r of rows) {
    const key = r.issuer || '기타';
    map.set(key, (map.get(key) || 0) + 1);
  }
  return Array.from(map.entries())
    .map(([issuer, count]) => ({ issuer, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 14);
}

export default function EtfIndexPage() {
  const etfData = getLatestEtfData();
  const priceMap = new Map<string, { price: number; changeRate: number; volume: number; sector?: string }>();
  for (const e of etfData?.etfList || []) {
    priceMap.set(e.code.toUpperCase(), {
      price: e.price,
      changeRate: e.changeRate,
      volume: e.volume,
      sector: (e as { sector?: string }).sector,
    });
  }

  // KRX 등록 1000+종 + 시세 합치기
  const rows: EtfRow[] = getKnownShortcodes().map(code => {
    const meta = getKrxEtfMeta(code);
    const name = meta?.name || code;
    const upper = code.toUpperCase();
    const price = priceMap.get(upper);
    const issuerLabel = extractIssuerLabel(name);
    const issuer = issuerLabel ? issuerLabel.split(' ')[0] : undefined;
    return {
      shortcode: code,
      name,
      price: price?.price,
      changeRate: price?.changeRate,
      volume: price?.volume,
      sector: price?.sector || classifyEtfSector(name) || undefined,
      issuer,
    };
  });

  // 거래량 TOP 20 (시세 있는 종목만)
  const topByVolume = rows
    .filter(r => typeof r.volume === 'number')
    .sort((a, b) => (b.volume || 0) - (a.volume || 0))
    .slice(0, 20);

  const sectorMap = groupBySector(rows);
  const sectorEntries = sortedSectorEntries(sectorMap);
  const issuers = groupByIssuer(rows);

  const totalCount = rows.length;
  const sectorCount = sectorMap.size;
  const baseDate = etfData?.baseDate || '';
  const formattedBaseDate = baseDate
    ? `${baseDate.slice(0, 4)}-${baseDate.slice(4, 6)}-${baseDate.slice(6, 8)}`
    : '';

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: '홈', href: '/' },
    { name: '종목 사전', href: '/etf' },
  ]);

  return (
    <article className="etf-index animate-fade-in">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />

      <Breadcrumbs items={[
        { name: '홈', href: '/' },
        { name: '종목 사전', href: '/etf' },
      ]} />

      <header className="etf-index-hero">
        <div className="etf-index-eyebrow">
          <span className="etf-index-eyebrow-tag">ETF DICTIONARY</span>
          <span className="etf-index-eyebrow-stat">{totalCount.toLocaleString()}종 · {sectorCount}개 섹터</span>
        </div>
        <h1 className="etf-index-title">
          KRX 상장 ETF 종목 사전 — <span className="etf-index-title-accent">전 종목 한 페이지</span>
        </h1>
        <p className="etf-index-tagline">
          한국거래소(KRX) 상장 ETF 전체를 거래량·섹터·운용사 기준으로 정리. 종목별 페이지에서 시세·구성종목·분배금까지 한눈에 확인.
          {formattedBaseDate && <> 시세 기준일 {formattedBaseDate}.</>}
        </p>
      </header>

      {/* 거래량 TOP 20 */}
      {topByVolume.length > 0 && (
        <section className="etf-index-section">
          <h2 className="etf-index-h2">오늘 거래량 TOP {topByVolume.length}</h2>
          <ul className="etf-index-top">
            {topByVolume.map((r, i) => {
              const isUp = (r.changeRate || 0) > 0;
              const isDown = (r.changeRate || 0) < 0;
              return (
                <li key={r.shortcode}>
                  <Link href={`/etf/${r.shortcode.toLowerCase()}`} className="etf-index-top-row">
                    <span className="etf-index-top-rank">{i + 1}</span>
                    <span className="etf-index-top-name">
                      <strong>{r.name}</strong>
                      <span className="etf-index-top-code">· {r.shortcode}</span>
                    </span>
                    <span className="etf-index-top-price">
                      {r.price?.toLocaleString()}<small>원</small>
                    </span>
                    <span className={`etf-index-top-change ${isUp ? 'is-up' : isDown ? 'is-down' : ''}`}>
                      {isUp ? '+' : ''}{r.changeRate?.toFixed(2)}%
                    </span>
                    <span className="etf-index-top-volume">
                      {((r.volume || 0) / 10000).toFixed(0)}만주
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <RecommendBox position="top" />

      {/* 운용사별 (퀵 필터 인덱스) */}
      <section className="etf-index-section">
        <h2 className="etf-index-h2">운용사별 종목 수</h2>
        <ul className="etf-index-issuers">
          {issuers.map(i => (
            <li key={i.issuer}>
              <span className="etf-index-issuer-name">{i.issuer}</span>
              <span className="etf-index-issuer-count">{i.count}종</span>
            </li>
          ))}
        </ul>
        <p className="etf-index-note">
          운용사 기준으로 섹터 그룹 안에서 색깔이 달라집니다. 같은 섹터의 KODEX vs TIGER vs SOL 등 비교는 각 종목 페이지에서 확인하세요.
        </p>
      </section>

      {/* 섹터별 전체 그리드 */}
      {sectorEntries.map(([sector, list]) => (
        <section key={sector} className="etf-index-section">
          <h2 className="etf-index-h2">
            {sector}
            <span className="etf-index-h2-count">{list.length}종</span>
          </h2>
          <ul className="etf-index-grid">
            {list.map(r => {
              const isUp = (r.changeRate || 0) > 0;
              const isDown = (r.changeRate || 0) < 0;
              return (
                <li key={r.shortcode}>
                  <Link href={`/etf/${r.shortcode.toLowerCase()}`} className="etf-index-card">
                    <div className="etf-index-card-head">
                      <span className="etf-index-card-code">{r.shortcode}</span>
                      {r.issuer && <span className="etf-index-card-issuer">{r.issuer}</span>}
                    </div>
                    <div className="etf-index-card-name">{r.name}</div>
                    {typeof r.price === 'number' ? (
                      <div className="etf-index-card-meta">
                        <span className="etf-index-card-price">{r.price.toLocaleString()}원</span>
                        <span className={`etf-index-card-change ${isUp ? 'is-up' : isDown ? 'is-down' : ''}`}>
                          {isUp ? '+' : ''}{r.changeRate?.toFixed(2)}%
                        </span>
                      </div>
                    ) : (
                      <div className="etf-index-card-meta etf-index-card-meta-pending">
                        시세 갱신 예정
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <RecommendBox position="bottom" />

      <p className="etf-index-disclaimer">
        본 페이지는 한국거래소(KRX) 공공데이터 포털의 ETF 종목 메타와 일별 시세를 기반으로 매일 09:00에 갱신됩니다.
        시세는 거래량 상위 100종 중심으로 노출되며, 그 외 종목은 운용사 공시 기준 메타 정보만 표시됩니다.
        모든 투자 결정과 그에 따른 손익의 책임은 본인에게 있습니다.
      </p>
    </article>
  );
}
