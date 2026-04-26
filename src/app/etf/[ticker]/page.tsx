import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getLatestEtfData, getEtfHoldings } from '@/lib/data';
import { getIncomeRegistry } from '@/lib/income-server';
import { getAllPosts } from '@/lib/posts';
import Breadcrumbs from '@/components/Breadcrumbs';
import HoldingsPanel from '@/components/HoldingsPanel';
import RecommendBox from '@/components/RecommendBox';
import {
  buildBreadcrumbSchema,
  buildFinancialProductSchema,
  buildDatasetSchema,
  jsonLd,
} from '@/lib/schema';
import type { RawEtf } from '@/lib/surge';

/**
 * 종목 사전 페이지 — /etf/[ticker]
 *
 *   롱테일 SEO 흡수: "{ETF명} 분배금/구성종목/주가/배당일/시세" 검색 의도.
 *   editorial 글(/stock/[ticker])과 별개 — 이건 데이터 사전.
 *
 *   소스:
 *     - data/raw/etf_prices_*.json (시세)
 *     - data/holdings/{code}.json (구성종목)
 *     - data/income/dividend-registry.json (분배 정보)
 *     - content/ (관련 분석 글)
 *
 *   스키마: FinancialProduct + Dataset + BreadcrumbList
 */

interface PageProps {
  params: Promise<{ ticker: string }>;
}

const FREQ_LABEL: Record<string, string> = {
  monthly: '월',
  quarterly: '분기',
  'semi-annual': '반기',
  annual: '연',
};

export async function generateStaticParams() {
  const etfData = getLatestEtfData();
  const list = (etfData?.etfList || []) as RawEtf[];
  // 최대 100종 — 거래량 상위 우선
  return list
    .slice()
    .sort((a, b) => (b.volume || 0) - (a.volume || 0))
    .slice(0, 100)
    .map(e => ({ ticker: e.code.toLowerCase() }));
}

function findEtfByCode(list: RawEtf[], code: string): RawEtf | null {
  const upper = code.toUpperCase();
  return list.find(e => e.code.toUpperCase() === upper) || null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { ticker } = await params;
  const etfData = getLatestEtfData();
  const list = (etfData?.etfList || []) as RawEtf[];
  const etf = findEtfByCode(list, ticker);
  if (!etf) return { title: '종목 정보를 찾을 수 없습니다' };

  const canonicalPath = `/etf/${ticker.toLowerCase()}`;
  const title = `${etf.name} (${etf.code}) — 현재가·구성종목·분배금`;
  const description = `${etf.name}(${etf.code}) ETF의 오늘 시세 ${etf.price.toLocaleString()}원, ${etf.changeRate >= 0 ? '+' : ''}${etf.changeRate.toFixed(2)}%, 거래량 ${etf.volume.toLocaleString()}주. 구성종목 TOP 10·분배금 내역·관련 분석 한 페이지에 정리.`;
  const ogImage = `/api/og?title=${encodeURIComponent(etf.name)}&category=stock&tickers=${etf.code}`;

  return {
    title,
    description,
    keywords: [
      etf.name,
      `${etf.name} 주가`,
      `${etf.name} 분배금`,
      `${etf.name} 구성종목`,
      `${etf.name} 시세`,
      `${etf.code} ETF`,
      etf.sector || 'ETF',
    ],
    alternates: { canonical: canonicalPath },
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonicalPath,
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function EtfDictionaryPage({ params }: PageProps) {
  const { ticker } = await params;
  const etfData = getLatestEtfData();
  const list = (etfData?.etfList || []) as RawEtf[];
  const etf = findEtfByCode(list, ticker);
  if (!etf) notFound();

  const holdings = getEtfHoldings(etf.code);
  const incomeRegistry = getIncomeRegistry();
  const incomeEntry = incomeRegistry?.etfs.find(e => e.code === etf.code) || null;

  // 관련 분석 글 (티커 기준)
  const allPosts = getAllPosts();
  const relatedPosts = allPosts
    .filter(p => (p.meta.tickers || []).some(t => t.toUpperCase() === etf.code.toUpperCase()))
    .slice(0, 6);

  const isUp = etf.change > 0;
  const isDown = etf.change < 0;
  const baseDate = etfData?.baseDate || '';
  const formattedBaseDate = baseDate
    ? `${baseDate.slice(0, 4)}-${baseDate.slice(4, 6)}-${baseDate.slice(6, 8)}`
    : new Date().toISOString().slice(0, 10);

  // ── Schemas ──
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: '홈', href: '/' },
    { name: '종목 사전', href: '/etf' },
    { name: `${etf.name} (${etf.code})`, href: `/etf/${ticker.toLowerCase()}` },
  ]);

  const financialProductSchema = buildFinancialProductSchema({
    name: etf.name,
    code: etf.code,
    description: `${etf.name} ETF — 한국거래소(KRX) 상장. 섹터: ${etf.sector || '-'}, 현재가 ${etf.price.toLocaleString()}원, 거래량 ${etf.volume.toLocaleString()}주.`,
    url: `/etf/${ticker.toLowerCase()}`,
    category: 'ETF',
  });

  const datasetSchema = buildDatasetSchema({
    name: `${etf.name} (${etf.code}) — 일별 시세·구성종목 데이터셋`,
    description: `${etf.name} ETF의 일별 종가·등락률·거래량·거래대금 + 구성종목 TOP 10 + 분배 정보. 한국거래소(KRX) 공공데이터 기준.`,
    url: `/etf/${ticker.toLowerCase()}`,
    dateModified: formattedBaseDate,
    publisher: '한국거래소(KRX) 공공데이터 포털',
    keywords: [etf.name, etf.code, 'ETF', '시세', '구성종목', '분배금', etf.sector || ''],
  });

  return (
    <article className="etf-dict animate-fade-in">
      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(financialProductSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(datasetSchema) }} />

      <Breadcrumbs items={[
        { name: '홈', href: '/' },
        { name: '종목 사전', href: '/etf' },
        { name: `${etf.name}`, href: `/etf/${ticker.toLowerCase()}` },
      ]} />

      <header className="etf-dict-hero">
        <div className="etf-dict-eyebrow">
          <span className="etf-dict-code">{etf.code}</span>
          {etf.sector && <span className="etf-dict-sector">{etf.sector}</span>}
        </div>
        <h1 className="etf-dict-title">{etf.name}</h1>
        <p className="etf-dict-tagline">
          {etf.name} ETF — 오늘 시세, 구성종목, 분배금 한 페이지 정리. 매일 09:00 갱신.
        </p>
      </header>

      <RecommendBox position="top" />

      {/* 시세 요약 */}
      <section className="etf-dict-section">
        <h2 className="etf-dict-h2">오늘의 시세 ({formattedBaseDate} 기준)</h2>
        <div className="etf-dict-stats">
          <div className="etf-dict-stat">
            <div className="etf-dict-stat-label">현재가</div>
            <div className="etf-dict-stat-value">{etf.price.toLocaleString()}<small>원</small></div>
          </div>
          <div className="etf-dict-stat">
            <div className="etf-dict-stat-label">전일대비</div>
            <div className={`etf-dict-stat-value ${isUp ? 'is-up' : isDown ? 'is-down' : ''}`}>
              {isUp ? '▲' : isDown ? '▼' : '–'} {Math.abs(etf.change).toLocaleString()}원 ({isUp ? '+' : ''}{etf.changeRate.toFixed(2)}%)
            </div>
          </div>
          <div className="etf-dict-stat">
            <div className="etf-dict-stat-label">거래량</div>
            <div className="etf-dict-stat-value">{etf.volume.toLocaleString()}<small>주</small></div>
          </div>
          <div className="etf-dict-stat">
            <div className="etf-dict-stat-label">거래대금</div>
            <div className="etf-dict-stat-value">{Math.round((etf.tradeAmount || 0) / 1e8).toLocaleString()}<small>억원</small></div>
          </div>
          <div className="etf-dict-stat">
            <div className="etf-dict-stat-label">시가/고가/저가</div>
            <div className="etf-dict-stat-value-small">
              {etf.openPrice?.toLocaleString() || '-'} / {etf.highPrice?.toLocaleString() || '-'} / {etf.lowPrice?.toLocaleString() || '-'}원
            </div>
          </div>
          {typeof etf.marketCap === 'number' && etf.marketCap > 0 && (
            <div className="etf-dict-stat">
              <div className="etf-dict-stat-label">시가총액</div>
              <div className="etf-dict-stat-value">{Math.round(etf.marketCap / 1e8).toLocaleString()}<small>억원</small></div>
            </div>
          )}
        </div>
        <p className="etf-dict-source">
          출처: 한국거래소(KRX) 공공데이터 포털 · 기준일 {formattedBaseDate}
        </p>
      </section>

      {/* 구성종목 */}
      {holdings && holdings.holdings.length > 0 && (
        <section className="etf-dict-section">
          <h2 className="etf-dict-h2">{etf.name} 구성종목 TOP {Math.min(10, holdings.holdings.length)}</h2>
          <HoldingsPanel
            code={etf.code}
            variant="detail"
            label={`${etf.code} 구성종목 (기준일 ${holdings.asOf})`}
            asOfOverride={holdings.asOf}
          />
          <p className="etf-dict-note">
            구성종목 비중은 운용사 공시 기준이며 실시간 변동될 수 있습니다.
          </p>
        </section>
      )}

      {/* 분배 정보 (income ETF인 경우) */}
      {incomeEntry && (
        <section className="etf-dict-section">
          <h2 className="etf-dict-h2">{etf.name} 분배금 정보</h2>
          <div className="etf-dict-stats">
            <div className="etf-dict-stat">
              <div className="etf-dict-stat-label">연 분배율</div>
              <div className="etf-dict-stat-value">{incomeEntry.yield.toFixed(2)}<small>%</small></div>
            </div>
            <div className="etf-dict-stat">
              <div className="etf-dict-stat-label">지급 주기</div>
              <div className="etf-dict-stat-value">{FREQ_LABEL[incomeEntry.frequency] || incomeEntry.frequency} 지급</div>
            </div>
            <div className="etf-dict-stat">
              <div className="etf-dict-stat-label">지급 월</div>
              <div className="etf-dict-stat-value-small">
                {incomeEntry.payMonths.map(m => `${m}월`).join(', ')}
              </div>
            </div>
            <div className="etf-dict-stat">
              <div className="etf-dict-stat-label">안정성 등급</div>
              <div className="etf-dict-stat-value">{incomeEntry.stabilityGrade}</div>
            </div>
          </div>
          <p className="etf-dict-note">
            기초자산: {incomeEntry.underlying} · 운용사: {incomeEntry.issuer}
            {incomeEntry.note ? ` · ${incomeEntry.note}` : ''}
          </p>
        </section>
      )}

      {/* 관련 분석 글 */}
      {relatedPosts.length > 0 && (
        <section className="etf-dict-section">
          <h2 className="etf-dict-h2">{etf.name} 관련 분석 ({relatedPosts.length}편)</h2>
          <ul className="etf-dict-related">
            {relatedPosts.map(p => (
              <li key={p.meta.slug}>
                <Link href={`/${p.meta.category}/${p.meta.slug}`} prefetch={false}>
                  <span className="etf-dict-related-cat">{p.categoryName}</span>
                  <span className="etf-dict-related-title">{p.meta.title}</span>
                  <span className="etf-dict-related-date">
                    {new Date(p.meta.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <RecommendBox position="bottom" category="general" />

      <p className="etf-dict-disclaimer">
        본 페이지의 시세·구성종목·분배 정보는 KRX·운용사 공식 데이터를 기반으로 매일 09:00에 갱신됩니다.
        모든 투자 결정과 그에 따른 손익의 책임은 본인에게 있습니다.
      </p>
    </article>
  );
}
