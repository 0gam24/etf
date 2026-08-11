import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { getPostsByCategory, CATEGORY_NAMES, THEME_CATEGORIES } from '@/lib/posts';
import { getLatestEtfData, getEtfsBySector } from '@/lib/data';
import { getInvestmentPoints } from '@/lib/etf-investment-points';
import { getGuidesForSector } from '@/lib/guides';
import type { RawEtf } from '@/lib/surge';
import Breadcrumbs from '@/components/Breadcrumbs';
import FaqSection from '@/components/FaqSection';
import RecommendBox from '@/components/RecommendBox';
import { buildBreadcrumbSchema, buildItemListSchema, jsonLd } from '@/lib/schema';
import type { ProductCategory } from '@/lib/products';
import { buildPageMetadata } from '@/lib/site-meta';

/**
 * /theme/{theme} — 테마 ETF 허브
 *
 *   2026-08-11 온페이지 감사: 이 페이지들은 발행 글이 0편이라 본문이 사실상 비어 있었고
 *   (H2 0개), 렌더된 내용의 대부분이 추천 도서 카드였다. 검색 의도("방산 ETF 뭐 있나")에
 *   답하지 못하는 상태라, 이미 보유한 KRX 종목 데이터·섹터 투자 포인트·가이드를 엮어
 *   실제 내용이 있는 허브로 재구성한다.
 */

function themeToProductCategory(theme: string): ProductCategory | undefined {
  const map: Record<string, ProductCategory> = {
    'ai':           'ai-semi-etf',
    'semi':         'ai-semi-etf',
    'defense':      'defense-etf',
    'shipbuilding': 'general',
  };
  return map[theme];
}

/** 테마 슬러그 → 시세·이름 기반 섹터 분류값 (data.ts SECTOR_RULES와 동일 표기) */
const THEME_SECTOR: Record<string, string> = {
  ai: 'AI·데이터',
  semi: '반도체',
  shipbuilding: '조선',
  defense: '방산',
};

interface PageProps {
  params: Promise<{ theme: string }>;
}

const THEME_META: Record<string, { icon: string; desc: string; intro: string; faq: { question: string; answer: string }[] }> = {
  ai: {
    icon: '🤖',
    desc: 'AI·데이터센터 ETF의 수혜 공급망과 대장주를 한 페이지에 정리했습니다.',
    intro: 'AI 테마 ETF는 반도체·데이터센터·소프트웨어까지 폭넓게 담기 때문에, 같은 "AI"라는 이름을 달고도 실제 구성종목이 크게 다릅니다. 아래에서 국내 상장 AI·데이터 ETF의 구성과 최근 흐름을 비교해 보세요.',
    faq: [
      { question: 'AI ETF와 반도체 ETF는 무엇이 다른가요?', answer: '반도체 ETF는 칩 설계·제조·장비 기업에 집중하는 반면, AI ETF는 여기에 데이터센터·클라우드·소프트웨어 기업까지 포함하는 경우가 많습니다. 구성종목 상위 10개를 비교하면 차이가 분명히 드러납니다.' },
      { question: 'AI ETF 하나만 담아도 분산이 되나요?', answer: '한 테마에 집중된 ETF는 종목 분산은 되지만 산업 분산은 되지 않습니다. AI 업황이 꺾이면 구성종목이 함께 움직이므로, 전체 자산에서 테마 ETF가 차지하는 비중을 정해 두는 편이 안전합니다.' },
      { question: '국내 상장과 해외 직구 중 어느 쪽이 유리한가요?', answer: '계좌 종류와 투자 금액에 따라 달라집니다. 연금계좌에서는 국내 상장만 담을 수 있고, 일반계좌에서는 과세 방식이 서로 다릅니다. 세금 비교는 관련 가이드에서 확인하세요.' },
    ],
  },
  semi: {
    icon: '💾',
    desc: 'HBM·파운드리·장비주까지 반도체 전반을 담는 ETF를 비교합니다.',
    intro: '반도체 ETF는 메모리 중심인지, 파운드리·장비까지 담는지에 따라 성격이 크게 갈립니다. 사이클을 타는 업종이라 진입 시점보다 구성종목의 성격을 먼저 확인하는 편이 좋습니다.',
    faq: [
      { question: '반도체 ETF는 언제 사는 게 좋나요?', answer: '반도체는 업황 사이클이 뚜렷한 업종이라 특정 시점을 단정하기 어렵습니다. 한 번에 담기보다 기간을 나눠 분할 매수하는 방식이 변동성 부담을 줄이는 데 도움이 됩니다. 투자 판단과 책임은 본인에게 있습니다.' },
      { question: 'HBM 비중이 높은 ETF를 고르려면?', answer: '구성종목 상위에 메모리 기업 비중이 큰 ETF를 확인하면 됩니다. 각 종목 사전 페이지에서 구성종목 TOP 10과 비중을 볼 수 있습니다.' },
      { question: '레버리지 반도체 ETF는 어떤가요?', answer: '레버리지는 하루 수익률을 배수로 추종하므로 기간이 길어질수록 기초지수와 차이가 벌어집니다. 변동성이 큰 반도체 업종에서는 이 차이가 더 크게 나타날 수 있습니다.' },
    ],
  },
  shipbuilding: {
    icon: '🚢',
    desc: '조선 수주 사이클과 대형 3사 수혜를 담은 ETF를 모았습니다.',
    intro: '조선 ETF는 종목 수가 적어 대형 3사 비중이 절반을 넘는 경우가 많습니다. 그만큼 개별 기업의 수주 소식에 크게 반응합니다.',
    faq: [
      { question: '조선 ETF는 종목이 몇 개나 담기나요?', answer: '국내 조선 관련 상장사 수 자체가 많지 않아, 상위 3사 비중이 절반을 넘는 ETF가 일반적입니다. 개별 종목 리스크가 지수형 ETF보다 크게 반영됩니다.' },
      { question: '수주 잔고는 어디서 확인하나요?', answer: '각 기업의 분기 보고서와 공시(DART)에서 확인할 수 있습니다. 본 사이트는 시세·구성종목 등 공개 데이터만 정리하며 전망을 단정하지 않습니다.' },
      { question: '조선 레버리지 ETF도 있나요?', answer: '국내에 조선 테마 레버리지 상품이 상장되어 있습니다. 다만 레버리지는 일간 배수 추종이라 보유 기간이 길어질수록 기초지수와 괴리가 커집니다.' },
    ],
  },
  defense: {
    icon: '🛡️',
    desc: '방위산업 ETF의 구성종목과 최근 흐름을 정리했습니다.',
    intro: '방산 ETF는 국내 방산 대형주 비중이 높은 편이며, 글로벌 방위비 흐름과 수출 계약 소식에 민감하게 반응합니다. 구성종목이 소수에 집중되는 구조를 먼저 확인하세요.',
    faq: [
      { question: '방산 ETF는 어떤 종목이 담기나요?', answer: '국내 방산 ETF는 항공·유도무기·지상장비 기업이 상위를 차지하는 경우가 많습니다. 각 종목 사전 페이지에서 구성종목 TOP 10과 비중을 확인할 수 있습니다.' },
      { question: '해외 방산 ETF와 무엇이 다른가요?', answer: '국내 상장 방산 ETF는 국내 기업 비중이 높고, 해외 방산 ETF는 글로벌 대형 방산업체를 담습니다. 환율 영향과 과세 방식도 서로 다릅니다.' },
      { question: '지정학 이슈가 없을 때도 오르나요?', answer: '단기 급등은 대체로 특정 이슈에 반응한 결과입니다. 이슈가 잦아들면 되돌림이 나타나기도 하므로, 뉴스만 보고 추격 매수하기보다 구성종목의 실적 흐름을 함께 보는 편이 좋습니다.' },
    ],
  },
};

export async function generateStaticParams() {
  return THEME_CATEGORIES.map(c => ({ theme: c.replace('theme/', '') }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { theme } = await params;
  const key = `theme/${theme}`;
  const name = CATEGORY_NAMES[key];
  if (!name) return { title: '테마를 찾을 수 없습니다' };
  const canonicalPath = `/theme/${theme}`;
  const sector = THEME_SECTOR[theme];
  const etfs = sector ? getEtfsBySector(sector, '', 3, (getLatestEtfData()?.etfList || []) as RawEtf[]) : [];
  const names = etfs.map(e => e.name).join('·');
  const desc = names
    ? `${name} 테마에 투자하는 국내 상장 ETF를 한 페이지에 정리했습니다. ${names} 등 주요 종목의 시세와 구성종목, 고를 때 봐야 할 기준과 관련 가이드까지 함께 확인하세요.`
    : `${name} 테마 ETF의 구성종목과 시세, 고를 때 확인할 기준, 관련 투자 가이드를 한 페이지에 정리했습니다. KRX 공공데이터 기준으로 매일 갱신합니다.`;
  return buildPageMetadata({
    title: `${name} 테마 ETF`,
    description: desc,
    url: canonicalPath,
    keywords: [`${name} ETF`, `${name} ETF 추천`, `${name} 테마주`, `${name} ETF 종류`, `${name} ETF 구성종목`],
  });
}

export default async function ThemePage({ params }: PageProps) {
  const { theme } = await params;
  const key = `theme/${theme}`;
  const name = CATEGORY_NAMES[key];
  if (!name) notFound();

  const posts = getPostsByCategory(key);
  const meta = THEME_META[theme];
  const sector = THEME_SECTOR[theme];
  const etfList = (getLatestEtfData()?.etfList || []) as RawEtf[];
  const sectorEtfs = sector ? getEtfsBySector(sector, '', 12, etfList) : [];
  const points = getInvestmentPoints(sector);
  const guides = getGuidesForSector(sector, 4);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: '홈', href: '/' },
    { name: '테마 ETF', href: '/etf' },
    { name, href: `/theme/${theme}` },
  ]);
  const itemListSchema = sectorEtfs.length
    ? buildItemListSchema(sectorEtfs.map(e => ({ url: `/etf/${e.slug}`, name: e.name })), `${name} 테마 ETF ${sectorEtfs.length}종`)
    : null;

  return (
    <div className="animate-fade-in">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />
      {itemListSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(itemListSchema) }} />
      )}

      <Breadcrumbs
        items={[
          { name: '홈', href: '/' },
          { name: '종목 사전', href: '/etf' },
          { name, href: `/theme/${theme}` },
        ]}
      />

      <section className="category-hero" style={{ paddingBottom: '2.5rem' }}>
        <div className="category-hero-inner">
          <span className="category-hero-icon">{meta?.icon}</span>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', letterSpacing: '0.2em', marginBottom: '0.75rem', textTransform: 'uppercase' }}>테마 ETF</div>
          <h1 className="category-hero-title">{name} 테마 ETF</h1>
          <p className="category-hero-desc">{meta?.desc}</p>
        </div>
      </section>

      <div className="guide-article-body">
        {meta?.intro && <p className="guide-article-p">{meta.intro}</p>}

        {/* 1. 종목 목록 — 이 페이지의 핵심 검색 의도 */}
        {sectorEtfs.length > 0 && (
          <section className="guide-article-section-block">
            <h2 className="guide-article-h2">{name} ETF 종목 ({sectorEtfs.length}종)</h2>
            <p className="guide-article-p">
              KRX에 상장된 {name} 관련 ETF입니다. 종목을 누르면 구성종목과 분배금 정보를 볼 수 있습니다.
            </p>
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
        )}

        {/* 2. 고를 때 기준 */}
        <section className="guide-article-section-block">
          <h2 className="guide-article-h2">{name} ETF, 고를 때 무엇을 보나</h2>
          <p className="guide-article-p">{points.summary}</p>
          <div className="etf-dict-points-grid">
            {points.points.map((p, i) => (
              <div key={i} className="etf-dict-point-card">
                <div className="etf-dict-point-heading">{p.heading}</div>
                <div className="etf-dict-point-body">{p.body}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. 최근 분석 (글이 있을 때만) */}
        {posts.length > 0 && (
          <section className="guide-article-section-block">
            <h2 className="guide-article-h2">{name} 최근 분석 ({posts.length}편)</h2>
            <ul className="pulse-archive-list">
              {posts.map(post => (
                <li key={post.meta.slug}>
                  <Link href={`/theme/${theme}/${post.meta.slug}`} prefetch={false} className="pulse-archive-row">
                    <span className="pulse-archive-date">{new Date(post.meta.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}</span>
                    <span className="pulse-archive-title">{post.meta.title}</span>
                    <span className="pulse-archive-meta">{post.readingTime}분</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 4. 관련 가이드 */}
        {guides.length > 0 && (
          <section className="guide-article-section-block">
            <h2 className="guide-article-h2">{name} 투자 전 읽어두면 좋은 가이드</h2>
            <ul className="guide-index-list">
              {guides.map(g => (
                <li key={g.slug} className="guide-index-card">
                  <Link href={`/guide/${g.slug}`} prefetch={false}>
                    <div className="guide-index-section">{g.section}</div>
                    <h3 className="guide-index-card-title">{g.title}</h3>
                    <p className="guide-index-card-tagline">{g.tagline}</p>
                    <span className="guide-index-cta">가이드 열기 <ArrowRight size={14} strokeWidth={2.5} /></span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <RecommendBox position="top" category={themeToProductCategory(theme)} />

      {meta?.faq && <FaqSection title={`${name} 테마 ETF 자주 묻는 질문`} items={meta.faq} />}

      <nav className="guide-article-other" aria-label="다른 테마">
        <h2>다른 테마 ETF</h2>
        <ul>
          {THEME_CATEGORIES.map(c => c.replace('theme/', '')).filter(t => t !== theme).map(t => (
            <li key={t}>
              <Link href={`/theme/${t}`} prefetch={false}>
                <span className="guide-article-other-title">{CATEGORY_NAMES[`theme/${t}`]} 테마 ETF</span>
                <ArrowRight size={14} strokeWidth={2.5} />
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/etf" className="guide-article-other-all" prefetch={false}>
          전체 종목 사전 보기 <ArrowRight size={14} strokeWidth={2.5} />
        </Link>
      </nav>

      <RecommendBox position="bottom" category={themeToProductCategory(theme)} />
    </div>
  );
}
