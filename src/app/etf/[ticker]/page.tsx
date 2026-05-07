import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getLatestEtfData,
  getEtfHoldings,
  findEtfByAnyCode,
  getAllEtfSlugs,
  resolveEtfTickerOrSlug,
  getKrxEtfMeta,
  extractIssuerLabel,
  classifyEtfSector,
  getEtfsBySector,
  getEtfsByIssuer,
  getIssuerOfficialUrl,
} from '@/lib/data';
import { getInvestmentPoints } from '@/lib/etf-investment-points';
import { getIncomeRegistry } from '@/lib/income-server';
import { getAllPosts } from '@/lib/posts';
import Breadcrumbs from '@/components/Breadcrumbs';
import HoldingsPanel from '@/components/HoldingsPanel';
import RecommendBox from '@/components/RecommendBox';
import MainBackrefBox, { getBackrefUrlForCategory } from '@/components/MainBackrefBox';
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
  // SEO 친화 슬러그(이름 기반) 1095종 prerender.
  //   - 코드 기반 URL(/etf/0080g0)은 next.config.ts redirects로 슬러그 URL로 301 이동.
  return getAllEtfSlugs().map(slug => ({ ticker: slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { ticker } = await params;
  const resolved = resolveEtfTickerOrSlug(ticker);
  const code = resolved.shortcode;
  const etfData = getLatestEtfData();
  const list = (etfData?.etfList || []) as RawEtf[];
  const etf = code ? findEtfByAnyCode(list, code) : null;
  const krxMeta = code ? getKrxEtfMeta(code) : null;

  // KRX 매핑조차 없으면 진짜 404
  if (!etf && !krxMeta) return { title: '종목 정보를 찾을 수 없습니다' };

  const canonicalPath = `/etf/${resolved.canonicalSlug}`;
  const name = etf?.name || krxMeta?.name || ticker;
  const displayCode = etf?.code || krxMeta?.shortcode || code || ticker;
  const sector = etf?.sector;

  // 1A. Title — "ETF" 키워드 + freshness 신호 강화 (60자 이내 유지)
  const title = etf
    ? `${name} (${displayCode}) ETF | 구성종목·분배금·주가 실시간 갱신`
    : `${name} (${displayCode}) ETF | 종목 정보·구성종목·분배금`;

  // 1D. Meta — 첫 100자에 키워드 3개 압축 (Naver snippet + Google CTR 최적화)
  // 한국 사용자는 검색결과 첫 100자만 봄 → 종목명·등락률·구성종목·섹터를 앞에 배치
  const holdingsForMeta = code ? getEtfHoldings(code)?.holdings || [] : [];
  const topHoldingNames = holdingsForMeta.slice(0, 2).map(h => h.name).join('·');
  const sectorClause = sector ? ` ${sector}` : '';
  const trendIcon = etf ? (etf.changeRate > 0 ? '🔥' : etf.changeRate < 0 ? '📉' : '📊') : '📊';

  const description = etf
    ? `${trendIcon} ${name}(${displayCode}) ETF${sectorClause} — ${etf.price.toLocaleString()}원 ${etf.changeRate >= 0 ? '+' : ''}${etf.changeRate.toFixed(2)}%.${topHoldingNames ? ` ${topHoldingNames} 등 TOP 10 구성.` : ''} 분배금·분배락일·투자 포인트·관련 분석을 한 페이지에.`
    : `📊 ${name}(${displayCode}) ETF${sectorClause} — KRX 상장 종목.${topHoldingNames ? ` ${topHoldingNames} 등 TOP 10 구성.` : ''} 운용사·섹터·구성종목·관련 분석 정리.`;

  const ogImage = `/api/og?title=${encodeURIComponent(name)}&category=stock&tickers=${displayCode}`;

  return {
    title,
    description,
    keywords: [
      name,
      `${name} 주가`,
      `${name} 분배금`,
      `${name} 구성종목`,
      `${name} 시세`,
      `${displayCode} ETF`,
      sector || 'ETF',
    ],
    alternates: { canonical: canonicalPath },
    openGraph: { title, description, type: 'website', url: canonicalPath, images: [ogImage] },
    twitter: { card: 'summary_large_image', title, description, images: [ogImage] },
  };
}

export default async function EtfDictionaryPage({ params }: PageProps) {
  const { ticker } = await params;
  const resolved = resolveEtfTickerOrSlug(ticker);
  const code = resolved.shortcode;
  const etfData = getLatestEtfData();
  const list = (etfData?.etfList || []) as RawEtf[];
  const etf = code ? findEtfByAnyCode(list, code) : null;
  const krxMeta = code ? getKrxEtfMeta(code) : null;

  // KRX 매핑조차 없으면 404 (오타·폐지·신규 등)
  if (!etf && !krxMeta) notFound();

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
          {hasPriceData ? (
            <span className="etf-dict-fresh-pill" title={`기준일 ${formattedBaseDate}`}>
              📅 {formattedBaseDate} 갱신
            </span>
          ) : (
            <span className="etf-dict-status-pill">시세 갱신 예정</span>
          )}
        </div>
        {/* 1B. H1 — 코드 병기 + "분석 리포트" 키워드 */}
        <h1 className="etf-dict-title">
          {displayName} <span className="etf-dict-title-code">(Ticker: {displayCode})</span> 분석 리포트
        </h1>
        <p className="etf-dict-tagline">
          {hasPriceData
            ? `${displayName} ETF — 오늘 시세, 구성종목, 분배금, 투자 포인트 한 페이지 정리. 매일 09:00 갱신.`
            : `${displayName} ETF — ${issuerLabel ? `${issuerLabel.split(' ')[0]} 운용 · ` : ''}단축코드 ${displayCode}. 한국거래소(KRX) 상장 종목 정보.`}
        </p>

        {/* Authority 외부 권위 링크 — Google E-E-A-T (Trustworthiness) 신호 */}
        <div className="etf-dict-authority" aria-label="공식 자료 출처">
          <span className="etf-dict-authority-label">공식 자료:</span>
          <a
            href={`https://kind.krx.co.kr/common/disclsviewer.do?method=search&searchCodeType=&forward=corpsearch&searchCorpName=${encodeURIComponent(displayName)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="etf-dict-authority-link"
            title="KRX 한국거래소 종목 정보"
          >KRX 종목정보 ↗</a>
          <a
            href={`https://dart.fss.or.kr/dsab007/main.do?textCrpNm=${encodeURIComponent(displayName)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="etf-dict-authority-link"
            title="금융감독원 전자공시"
          >DART 공시 ↗</a>
          {issuerLabel && (() => {
            const officialUrl = getIssuerOfficialUrl(displayName);
            if (!officialUrl) return null;
            return (
              <a
                href={officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="etf-dict-authority-link"
                title={`${issuerLabel.split(' ')[0]} 공식 안내`}
              >{issuerLabel.split(' ')[0]} 공식 ↗</a>
            );
          })()}
          <a
            href="https://www.fss.or.kr/edu/main/main.do"
            target="_blank"
            rel="noopener noreferrer"
            className="etf-dict-authority-link"
            title="금융감독원 금융 교육"
          >금감원 투자자교육 ↗</a>
        </div>
      </header>

      {/* 시세 요약 — 시세 데이터가 있을 때만 */}
      {hasPriceData && etf && (
        <section className="etf-dict-section">
          {/* 1C. H2 번호 + "실시간 시세 및 수익률" 키워드 */}
          <h2 className="etf-dict-h2">1. 실시간 시세 및 수익률 ({formattedBaseDate} 기준)</h2>
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
          <h2 className="etf-dict-h2">1. {displayName} 종목 정보</h2>
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
          <h2 className="etf-dict-h2">2. 주요 구성 종목 (Top {Math.min(10, holdings.holdings.length)})</h2>
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
          <h2 className="etf-dict-h2">3. 분배금·분배락일 정보</h2>
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
            {incomeEntry.nextExDividendDate && (
              <div className="etf-dict-stat">
                <div className="etf-dict-stat-label">다음 분배락일</div>
                <div className="etf-dict-stat-value-small">{incomeEntry.nextExDividendDate}</div>
              </div>
            )}
            <div className="etf-dict-stat">
              <div className="etf-dict-stat-label">안정성 등급</div>
              <div className="etf-dict-stat-value">{incomeEntry.stabilityGrade}</div>
            </div>
          </div>
          <p className="etf-dict-note">
            기초자산: {incomeEntry.underlying} · 운용사: {incomeEntry.issuer}
            {incomeEntry.note ? ` · ${incomeEntry.note}` : ''}
            {!incomeEntry.nextExDividendDate && (
              <> · 다음 분배락일은 운용사 공시 갱신 시 표시됩니다.</>
            )}
          </p>
        </section>
      )}

      {/* 4. 투자 포인트 — Phase 2C 섹터별 정형 템플릿 */}
      {(() => {
        const points = getInvestmentPoints(displaySector);
        return (
          <section className="etf-dict-section etf-dict-points">
            <h2 className="etf-dict-h2">4. {displaySector || '투자'} 투자 포인트</h2>
            <p className="etf-dict-points-summary">{points.summary}</p>
            <div className="etf-dict-points-grid">
              {points.points.map((p, i) => (
                <div key={i} className="etf-dict-point-card">
                  <div className="etf-dict-point-heading">{p.heading}</div>
                  <p className="etf-dict-point-body">{p.body}</p>
                </div>
              ))}
            </div>
            <p className="etf-dict-note">
              ※ 본 코멘트는 섹터 일반 정보이며 특정 종목 매수·매도 권유가 아닙니다. 투자 결정의 책임은 본인에게 있습니다.
            </p>
          </section>
        );
      })()}

      {/* 5. 같은 섹터 다른 ETF — Phase 2A */}
      {displaySector && displaySector !== '기타' && (() => {
        const sectorEtfs = getEtfsBySector(displaySector, displayCode, 6, list);
        if (sectorEtfs.length === 0) return null;
        return (
          <section className="etf-dict-section">
            <h2 className="etf-dict-h2">5. {displaySector} 다른 ETF</h2>
            <ul className="etf-dict-related-grid">
              {sectorEtfs.map(r => (
                <li key={r.shortcode}>
                  <Link href={`/etf/${r.slug}`} prefetch={false} className="etf-dict-related-card">
                    <div className="etf-dict-related-card-head">
                      <span className="etf-dict-related-card-code">{r.shortcode}</span>
                      {r.issuer && <span className="etf-dict-related-card-issuer">{r.issuer}</span>}
                    </div>
                    <div className="etf-dict-related-card-name">{r.name}</div>
                    {r.hasPrice && typeof r.changeRate === 'number' && (
                      <div className={`etf-dict-related-card-change ${r.changeRate > 0 ? 'is-up' : r.changeRate < 0 ? 'is-down' : ''}`}>
                        {r.changeRate >= 0 ? '+' : ''}{r.changeRate.toFixed(2)}%
                      </div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })()}

      {/* 6. 같은 운용사 다른 ETF — Phase 2B */}
      {issuerLabel && (() => {
        const issuerCode = issuerLabel.split(' ')[0];
        const issuerEtfs = getEtfsByIssuer(issuerCode, displayCode, 6, list);
        if (issuerEtfs.length === 0) return null;
        return (
          <section className="etf-dict-section">
            <h2 className="etf-dict-h2">6. {issuerCode} 다른 ETF</h2>
            <ul className="etf-dict-related-grid">
              {issuerEtfs.map(r => (
                <li key={r.shortcode}>
                  <Link href={`/etf/${r.slug}`} prefetch={false} className="etf-dict-related-card">
                    <div className="etf-dict-related-card-head">
                      <span className="etf-dict-related-card-code">{r.shortcode}</span>
                    </div>
                    <div className="etf-dict-related-card-name">{r.name}</div>
                    {r.hasPrice && typeof r.changeRate === 'number' && (
                      <div className={`etf-dict-related-card-change ${r.changeRate > 0 ? 'is-up' : r.changeRate < 0 ? 'is-down' : ''}`}>
                        {r.changeRate >= 0 ? '+' : ''}{r.changeRate.toFixed(2)}%
                      </div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })()}

      {/* 7. 관련 분석 글 */}
      {relatedPosts.length > 0 && (
        <section className="etf-dict-section">
          <h2 className="etf-dict-h2">7. {displayName} 관련 분석 ({relatedPosts.length}편)</h2>
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

      {/* Phase 3B — 운용사 공식 외부 링크 (E-E-A-T 외부 권위 link out) */}
      {(() => {
        const officialUrl = getIssuerOfficialUrl(displayName);
        if (!officialUrl || !issuerLabel) return null;
        const issuerCode = issuerLabel.split(' ')[0];
        return (
          <p className="etf-dict-official-link">
            ※ 더 자세한 운용 정보는 <a href={officialUrl} target="_blank" rel="noopener noreferrer">{issuerCode} 공식 안내 →</a>를 참고하세요.
          </p>
        );
      })()}

      <MainBackrefBox
        variant="inline"
        mainCategoryUrl={getBackrefUrlForCategory('etf')}
        pulseTitle={`${displayName} 시세·정책·산업 배경은 메인 데이터 저널에서 검증·해설됩니다.`}
      />

      <RecommendBox position="bottom" category="general" />

      <p className="etf-dict-disclaimer">
        본 페이지의 시세·구성종목·분배 정보는 KRX·운용사 공식 데이터를 기반으로 매일 09:00에 갱신됩니다.
        투자 포인트 코멘트는 일반 정보 제공 목적이며 특정 종목 매수·매도 권유가 아닙니다.
        모든 투자 결정과 그에 따른 손익의 책임은 본인에게 있습니다.
      </p>
    </article>
  );
}
