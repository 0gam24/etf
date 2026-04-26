import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getLatestEtfData,
  getEtfHoldings,
  findEtfByAnyCode,
  getKnownShortcodes,
  resolveEtfTicker,
  getKrxEtfMeta,
  extractIssuerLabel,
  classifyEtfSector,
} from '@/lib/data';
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
  // KRX 공식 등록 1000+ ETF 모두 prerender.
  //   - 시세 있는 종목(상위 100): 풀 데이터 페이지
  //   - 시세 없는 종목(나머지): KRX 메타(코드·이름)만 minimal 페이지
  //   둘 다 SEO 가치 있음 (롱테일 키워드 흡수).
  return getKnownShortcodes().map(code => ({ ticker: code.toLowerCase() }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { ticker } = await params;
  const etfData = getLatestEtfData();
  const list = (etfData?.etfList || []) as RawEtf[];
  const etf = findEtfByAnyCode(list, ticker);
  const krxMeta = getKrxEtfMeta(ticker);

  // KRX 매핑조차 없으면 진짜 404
  if (!etf && !krxMeta) return { title: '종목 정보를 찾을 수 없습니다' };

  const resolved = resolveEtfTicker(ticker);
  const canonicalPath = `/etf/${resolved.canonicalSlug}`;
  const name = etf?.name || krxMeta?.name || ticker;
  const code = etf?.code || krxMeta?.shortcode || ticker;
  const sector = etf?.sector;

  const title = etf
    ? `${name} (${code}) — 현재가·구성종목·분배금`
    : `${name} (${code}) — 종목 정보·구성종목`;

  const description = etf
    ? `${name}(${code}) ETF의 오늘 시세 ${etf.price.toLocaleString()}원, ${etf.changeRate >= 0 ? '+' : ''}${etf.changeRate.toFixed(2)}%, 거래량 ${etf.volume.toLocaleString()}주. 구성종목·분배금 내역·관련 분석 한 페이지에 정리.`
    : `${name}(${code}) ETF의 종목 정보, 구성종목, 관련 분석을 정리한 한국거래소(KRX) 상장 ETF 종목 사전.`;

  const ogImage = `/api/og?title=${encodeURIComponent(name)}&category=stock&tickers=${code}`;

  return {
    title,
    description,
    keywords: [
      name,
      `${name} 주가`,
      `${name} 분배금`,
      `${name} 구성종목`,
      `${name} 시세`,
      `${code} ETF`,
      sector || 'ETF',
    ],
    alternates: { canonical: canonicalPath },
    openGraph: { title, description, type: 'website', url: canonicalPath, images: [ogImage] },
    twitter: { card: 'summary_large_image', title, description, images: [ogImage] },
  };
}

export default async function EtfDictionaryPage({ params }: PageProps) {
  const { ticker } = await params;
  const etfData = getLatestEtfData();
  const list = (etfData?.etfList || []) as RawEtf[];
  const etf = findEtfByAnyCode(list, ticker);
  const krxMeta = getKrxEtfMeta(ticker);

  // KRX 매핑조차 없으면 404 (오타·폐지·신규 등)
  if (!etf && !krxMeta) notFound();

  const resolved = resolveEtfTicker(ticker);
  const canonicalSlug = resolved.canonicalSlug;
  const hasPriceData = etf !== null;

  // 표시용 통합 객체 — 시세 있으면 etf, 없으면 KRX 메타로 대체
  const displayName = etf?.name || krxMeta?.name || ticker;
  const displayCode = etf?.code || krxMeta?.shortcode || ticker;
  // 시세에 sector 있으면 우선, 없으면 이름 기반 분류
  const displaySector = etf?.sector || classifyEtfSector(displayName) || undefined;
  const issuerLabel = extractIssuerLabel(displayName);

  const holdings = getEtfHoldings(displayCode);
  const incomeRegistry = getIncomeRegistry();
  const incomeEntry = incomeRegistry?.etfs.find(e => e.code === displayCode) || null;

  // 관련 분석 글 (티커 기준)
  const allPosts = getAllPosts();
  const relatedPosts = allPosts
    .filter(p => (p.meta.tickers || []).some(t => t.toUpperCase() === displayCode.toUpperCase()))
    .slice(0, 6);

  const isUp = etf ? etf.change > 0 : false;
  const isDown = etf ? etf.change < 0 : false;
  const baseDate = etfData?.baseDate || '';
  const formattedBaseDate = baseDate
    ? `${baseDate.slice(0, 4)}-${baseDate.slice(4, 6)}-${baseDate.slice(6, 8)}`
    : new Date().toISOString().slice(0, 10);

  // ── Schemas ──
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: '홈', href: '/' },
    { name: '종목 사전', href: '/etf' },
    { name: `${displayName} (${displayCode})`, href: `/etf/${canonicalSlug}` },
  ]);

  const financialProductSchema = buildFinancialProductSchema({
    name: displayName,
    code: displayCode,
    description: hasPriceData
      ? `${displayName} ETF — 한국거래소(KRX) 상장. 섹터: ${displaySector || '-'}, 현재가 ${etf!.price.toLocaleString()}원, 거래량 ${etf!.volume.toLocaleString()}주.`
      : `${displayName} ETF — 한국거래소(KRX) 상장 종목. 단축코드 ${displayCode}.`,
    url: `/etf/${canonicalSlug}`,
    category: 'ETF',
  });

  const datasetSchema = buildDatasetSchema({
    name: `${displayName} (${displayCode}) — ETF 종목 정보`,
    description: hasPriceData
      ? `${displayName} ETF의 일별 종가·등락률·거래량·거래대금 + 구성종목 TOP 10 + 분배 정보. 한국거래소(KRX) 공공데이터 기준.`
      : `${displayName} ETF의 단축코드·운용사·종목 메타 정보. 한국거래소(KRX) 공공데이터 기준.`,
    url: `/etf/${canonicalSlug}`,
    dateModified: formattedBaseDate,
    publisher: '한국거래소(KRX) 공공데이터 포털',
    keywords: [displayName, displayCode, 'ETF', '시세', '구성종목', '분배금', displaySector || ''],
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
        { name: displayName, href: `/etf/${canonicalSlug}` },
      ]} />

      <header className="etf-dict-hero">
        <div className="etf-dict-eyebrow">
          <span className="etf-dict-code">{displayCode}</span>
          {displaySector && <span className="etf-dict-sector">{displaySector}</span>}
          {!hasPriceData && (
            <span className="etf-dict-status-pill">시세 갱신 예정</span>
          )}
        </div>
        <h1 className="etf-dict-title">{displayName}</h1>
        <p className="etf-dict-tagline">
          {hasPriceData
            ? `${displayName} ETF — 오늘 시세, 구성종목, 분배금 한 페이지 정리. 매일 09:00 갱신.`
            : `${displayName} ETF — ${issuerLabel ? `${issuerLabel.split(' ')[0]} 운용 · ` : ''}단축코드 ${displayCode}. 한국거래소(KRX) 상장 종목 정보.`}
        </p>
      </header>

      {/* 시세 요약 — 시세 데이터가 있을 때만 */}
      {hasPriceData && etf && (
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
      )}

      {/* 시세 미수집 안내 — minimal 모드: 종목 메타 확장 */}
      {!hasPriceData && (
        <section className="etf-dict-section">
          <h2 className="etf-dict-h2">{displayName} 종목 정보</h2>
          <div className="etf-dict-stats">
            <div className="etf-dict-stat">
              <div className="etf-dict-stat-label">단축코드</div>
              <div className="etf-dict-stat-value">{displayCode}</div>
            </div>
            {issuerLabel && (
              <div className="etf-dict-stat">
                <div className="etf-dict-stat-label">운용사</div>
                <div className="etf-dict-stat-value-small">{issuerLabel}</div>
              </div>
            )}
            {displaySector && (
              <div className="etf-dict-stat">
                <div className="etf-dict-stat-label">섹터 분류</div>
                <div className="etf-dict-stat-value-small">{displaySector}</div>
              </div>
            )}
            <div className="etf-dict-stat">
              <div className="etf-dict-stat-label">상장 시장</div>
              <div className="etf-dict-stat-value-small">한국거래소(KRX) ETF</div>
            </div>
          </div>
          <div className="etf-dict-status-banner" role="note">
            <strong>오늘 시세는 다음 갱신에 반영됩니다.</strong>
            {' '}본 사이트는 거래량 상위 100종의 일별 시세를 09:00에 갱신합니다. {displayName}의 분배 정보·구성종목은 운용사 공시 기준으로 아래에 정리되며, 시세는 다음 갱신 주기에 추가됩니다.
          </div>
        </section>
      )}

      {/* 추천 자료는 첫 정보 섹션 이후에 노출 — 빈 페이지 인상 회피 */}
      <RecommendBox position="top" />

      {/* 구성종목 */}
      {holdings && holdings.holdings.length > 0 && (
        <section className="etf-dict-section">
          <h2 className="etf-dict-h2">{displayName} 구성종목 TOP {Math.min(10, holdings.holdings.length)}</h2>
          <HoldingsPanel
            code={displayCode}
            variant="detail"
            label={`${displayCode} 구성종목 (기준일 ${holdings.asOf})`}
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
          <h2 className="etf-dict-h2">{displayName} 분배금 정보</h2>
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
          <h2 className="etf-dict-h2">{displayName} 관련 분석 ({relatedPosts.length}편)</h2>
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
