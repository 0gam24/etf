import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getLatestEtfData,
  getKrxEtfMeta,
  codeToSlug,
  classifyEtfSector,
  extractIssuerLabel,
  getEtfHoldings,
} from '@/lib/data';
import { COMPARE_PAIRS, getComparePairBySlug } from '@/lib/etf-compare-pairs';
import Breadcrumbs from '@/components/Breadcrumbs';
import RecommendBox from '@/components/RecommendBox';
import { buildBreadcrumbSchema, jsonLd } from '@/lib/schema';
import type { RawEtf } from '@/lib/surge';

/**
 * /compare/{pair} — 1:1 ETF 비교 페이지
 *
 *   사용자 검색 의도: "KODEX 200 vs TIGER 200", "SCHD 한국판 비교"
 *   롱테일 키워드 직접 흡수 + ETF 페이지 사이 cross-link 강화.
 */

interface PageProps {
  params: Promise<{ pair: string }>;
}

export async function generateStaticParams() {
  return COMPARE_PAIRS.map(p => ({ pair: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { pair } = await params;
  const p = getComparePairBySlug(pair);
  if (!p) return { title: '비교 페이지를 찾을 수 없습니다' };

  const metaA = getKrxEtfMeta(p.codeA);
  const metaB = getKrxEtfMeta(p.codeB);
  if (!metaA || !metaB) return { title: '비교 페이지를 찾을 수 없습니다' };

  const title = `${metaA.name} vs ${metaB.name} 비교 — 시세·구성종목·운용사 차이`;
  const description = `${metaA.name}(${metaA.shortcode})와 ${metaB.name}(${metaB.shortcode})의 시세·구성종목·운용보수·환헷지·분배 정책 1:1 비교. ${p.context}`;
  const canonicalPath = `/compare/${p.slug}`;

  return {
    title,
    description,
    keywords: [
      `${metaA.name} vs ${metaB.name}`,
      `${metaA.name} ${metaB.name} 비교`,
      `${metaA.shortcode} ${metaB.shortcode}`,
      'ETF 비교',
      p.searchIntent,
    ],
    alternates: { canonical: canonicalPath },
    openGraph: { title, description, type: 'website', url: canonicalPath },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function ComparePairPage({ params }: PageProps) {
  const { pair } = await params;
  const p = getComparePairBySlug(pair);
  if (!p) notFound();

  const metaA = getKrxEtfMeta(p.codeA);
  const metaB = getKrxEtfMeta(p.codeB);
  if (!metaA || !metaB) notFound();

  const etfData = getLatestEtfData();
  const list = (etfData?.etfList || []) as RawEtf[];
  const findEtf = (code: string) => list.find(e => e.code.toUpperCase() === code.toUpperCase()) || null;
  const etfA = findEtf(p.codeA);
  const etfB = findEtf(p.codeB);
  const sectorA = etfA?.sector || classifyEtfSector(metaA.name);
  const sectorB = etfB?.sector || classifyEtfSector(metaB.name);
  const issuerA = extractIssuerLabel(metaA.name);
  const issuerB = extractIssuerLabel(metaB.name);
  const holdingsA = getEtfHoldings(p.codeA);
  const holdingsB = getEtfHoldings(p.codeB);

  const slugA = codeToSlug(p.codeA);
  const slugB = codeToSlug(p.codeB);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: '홈', href: '/' },
    { name: '비교', href: '/compare' },
    { name: `${metaA.name} vs ${metaB.name}`, href: `/compare/${p.slug}` },
  ]);

  return (
    <article className="compare-page animate-fade-in">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />

      <Breadcrumbs items={[
        { name: '홈', href: '/' },
        { name: '비교', href: '/compare' },
        { name: `${metaA.name} vs ${metaB.name}`, href: `/compare/${p.slug}` },
      ]} />

      <header className="compare-hero">
        <div className="compare-eyebrow">⚖️ ETF 1:1 비교</div>
        <h1 className="compare-title">
          {metaA.name} <span className="compare-vs">vs</span> {metaB.name}
        </h1>
        <p className="compare-tagline">{p.context}</p>
      </header>

      {/* 시세 비교 표 */}
      <section className="compare-section">
        <h2 className="compare-h2">1. 오늘의 시세 비교</h2>
        <div className="compare-grid">
          <div className="compare-col">
            <h3 className="compare-col-title">
              <Link href={`/etf/${slugA}`}>{metaA.name}</Link>
              <small> · {metaA.shortcode}</small>
            </h3>
            <ul className="compare-stats">
              <li><span>현재가</span><strong>{etfA ? `${etfA.price.toLocaleString()}원` : '-'}</strong></li>
              <li><span>전일대비</span><strong className={etfA && etfA.change > 0 ? 'is-up' : etfA && etfA.change < 0 ? 'is-down' : ''}>
                {etfA ? `${etfA.change >= 0 ? '+' : ''}${etfA.changeRate.toFixed(2)}%` : '-'}
              </strong></li>
              <li><span>거래량</span><strong>{etfA ? `${(etfA.volume / 10000).toFixed(0)}만주` : '-'}</strong></li>
              <li><span>시가총액</span><strong>{etfA?.marketCap ? `${Math.round(etfA.marketCap / 1e8).toLocaleString()}억원` : '-'}</strong></li>
              <li><span>섹터</span><strong>{sectorA || '-'}</strong></li>
              <li><span>운용사</span><strong>{issuerA || '-'}</strong></li>
            </ul>
          </div>
          <div className="compare-col">
            <h3 className="compare-col-title">
              <Link href={`/etf/${slugB}`}>{metaB.name}</Link>
              <small> · {metaB.shortcode}</small>
            </h3>
            <ul className="compare-stats">
              <li><span>현재가</span><strong>{etfB ? `${etfB.price.toLocaleString()}원` : '-'}</strong></li>
              <li><span>전일대비</span><strong className={etfB && etfB.change > 0 ? 'is-up' : etfB && etfB.change < 0 ? 'is-down' : ''}>
                {etfB ? `${etfB.change >= 0 ? '+' : ''}${etfB.changeRate.toFixed(2)}%` : '-'}
              </strong></li>
              <li><span>거래량</span><strong>{etfB ? `${(etfB.volume / 10000).toFixed(0)}만주` : '-'}</strong></li>
              <li><span>시가총액</span><strong>{etfB?.marketCap ? `${Math.round(etfB.marketCap / 1e8).toLocaleString()}억원` : '-'}</strong></li>
              <li><span>섹터</span><strong>{sectorB || '-'}</strong></li>
              <li><span>운용사</span><strong>{issuerB || '-'}</strong></li>
            </ul>
          </div>
        </div>
        {!etfA && !etfB && (
          <p className="compare-note">두 종목 모두 오늘 시세 데이터가 미수집 — 다음 갱신 주기에 반영됩니다.</p>
        )}
      </section>

      {/* 구성종목 비교 (있는 경우) */}
      {(holdingsA?.holdings.length || holdingsB?.holdings.length) ? (
        <section className="compare-section">
          <h2 className="compare-h2">2. 구성종목 TOP 5 비교</h2>
          <div className="compare-grid">
            <div className="compare-col">
              <h3 className="compare-col-title-sm">{metaA.name}</h3>
              {holdingsA && holdingsA.holdings.length > 0 ? (
                <ol className="compare-holdings">
                  {holdingsA.holdings.slice(0, 5).map((h, i) => (
                    <li key={i}>
                      <span className="compare-holding-rank">{i + 1}</span>
                      <span className="compare-holding-name">{h.name}</span>
                      <span className="compare-holding-weight">{h.weight}%</span>
                    </li>
                  ))}
                </ol>
              ) : <p className="compare-note">구성종목 데이터 미수집</p>}
            </div>
            <div className="compare-col">
              <h3 className="compare-col-title-sm">{metaB.name}</h3>
              {holdingsB && holdingsB.holdings.length > 0 ? (
                <ol className="compare-holdings">
                  {holdingsB.holdings.slice(0, 5).map((h, i) => (
                    <li key={i}>
                      <span className="compare-holding-rank">{i + 1}</span>
                      <span className="compare-holding-name">{h.name}</span>
                      <span className="compare-holding-weight">{h.weight}%</span>
                    </li>
                  ))}
                </ol>
              ) : <p className="compare-note">구성종목 데이터 미수집</p>}
            </div>
          </div>
        </section>
      ) : null}

      <RecommendBox position="top" />

      {/* 어떤 ETF를 선택할까 */}
      <section className="compare-section">
        <h2 className="compare-h2">3. 어떤 ETF를 선택해야 할까</h2>
        <ul className="compare-criteria">
          <li><strong>거래량·유동성 우선</strong>이라면 거래량이 큰 종목이 매매 편의성·호가 스프레드에서 유리합니다.</li>
          <li><strong>총보수 절약</strong>이 목표라면 운용사 공식 PDP에서 총보수(연 0.05~0.30%)를 직접 비교하세요.</li>
          <li><strong>같은 지수 추종</strong>이라면 장기 성과는 거의 동일 — 분배 정책·운용사 선호로 결정합니다.</li>
          <li><strong>환헷지 vs 비헷지</strong>는 본인 환 시각에 따라 분리 매수도 좋은 전략입니다.</li>
        </ul>
        <p className="compare-note">
          ※ 이 비교는 오늘 KRX 시세 + 운용사 공시 메타 기준입니다. 실제 매수 전 운용사 공식 PDP를 확인하세요.
        </p>
      </section>

      {/* 종목 사전 진입 */}
      <section className="compare-section">
        <h2 className="compare-h2">4. 종목별 상세 페이지</h2>
        <div className="compare-cta-grid">
          <Link href={`/etf/${slugA}`} className="compare-cta-card">
            <strong>{metaA.name}</strong>
            <span>{metaA.shortcode} · 시세·구성종목·분배 자세히 →</span>
          </Link>
          <Link href={`/etf/${slugB}`} className="compare-cta-card">
            <strong>{metaB.name}</strong>
            <span>{metaB.shortcode} · 시세·구성종목·분배 자세히 →</span>
          </Link>
        </div>
      </section>

      <RecommendBox position="bottom" />

      <p className="compare-disclaimer">
        본 비교는 KRX 공공데이터·운용사 공시 기반이며 투자 권유가 아닙니다. 매수·매도 결정의 책임은 투자자 본인에게 있습니다.
      </p>
    </article>
  );
}
