import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { GUIDES, getGuideBySlug, getRelatedGuides, getSectorForGuide } from '@/lib/guides';
import { getLatestEtfData, getEtfsBySector } from '@/lib/data';
import type { RawEtf } from '@/lib/surge';
import Breadcrumbs from '@/components/Breadcrumbs';
import FaqSection from '@/components/FaqSection';
import AnswerBox from '@/components/AnswerBox';
import GuideDataBlock from '@/components/GuideDataBlock';
import AffiliateInline from '@/components/AffiliateInline';
import RecommendBox from '@/components/RecommendBox';
import type { ProductCategory } from '@/lib/products';
import { buildArticleSchema, buildHowToSchema, jsonLd } from '@/lib/schema';

/** 가이드 슬러그 → 추천 자료 매칭 카테고리 */
function guideToProductCategory(slug: string): ProductCategory | undefined {
  const map: Record<string, ProductCategory> = {
    'monthly-dividend': 'income',
    'covered-call':     'covered-call',
    'defense-etf':      'defense-etf',
    'ai-semi-etf':      'ai-semi-etf',
    'retirement':       'retirement',
    // 신규 가이드 (2026-04-27) — 가장 가까운 카테고리에 매핑
    'us-dividend':      'income',          // 배당 → income
    'currency-hedge':   'general',         // 환헤지 → 일반
    'overseas-etf':     'general',         // 해외 직구 → 일반
  };
  return map[slug];
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return GUIDES.map(g => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const g = getGuideBySlug(slug);
  if (!g) return { title: '가이드를 찾을 수 없습니다' };
  const canonicalPath = `/guide/${slug}`;
  return {
    title: g.title,
    description: g.description,
    keywords: g.keywords,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title: g.title,
      description: g.description,
      type: 'article',
      url: canonicalPath,
    },
    twitter: {
      card: 'summary_large_image',
      title: g.title,
      description: g.description,
    },
  };
}

export default async function GuidePage({ params }: PageProps) {
  const { slug } = await params;
  const g = getGuideBySlug(slug);
  if (!g) notFound();

  // 같은 주제 클러스터의 관련 가이드 (hub-and-spoke 내부링크)
  const relatedGuides = getRelatedGuides(slug, 4);

  // 테마·자산군 가이드 → 종목 사전(/etf/{slug}) 연결. 일반 가이드는 빈 배열.
  const guideSector = getSectorForGuide(slug);
  const guideSectorEtfs = guideSector
    ? getEtfsBySector(guideSector, '', 6, (getLatestEtfData()?.etfList || []) as RawEtf[])
    : [];

  const articleSchema = buildArticleSchema({
    type: 'Article',
    headline: g.title,
    description: g.description,
    url: `/guide/${slug}`,
    datePublished: `${g.lastReviewed}T09:00:00+09:00`,
    author: {
      name: 'Daily ETF Pulse 편집팀',
    },
    keywords: g.keywords,
    section: g.section,
  });

  // HowTo 스키마 (가이드가 단계형일 때만) — 보조 섹션은 자동 제외
  const howToSchema = g.howTo
    ? buildHowToSchema({
        name: g.title,
        description: g.howTo.description || g.description,
        url: `/guide/${slug}`,
        ...(g.howTo.totalTime ? { totalTime: g.howTo.totalTime } : {}),
        steps: g.sections
          .filter(sec => {
            const h = sec.heading;
            // 본문 단락이 있고, 보조 섹션(관련 글·책 추천)이 아닌 것만 단계화
            if (!sec.paragraphs?.length) return false;
            if (/함께\s*보면|책으로\s*더\s*깊이|관련\s*분석/.test(h)) return false;
            if (sec.dataBlock && /related-posts|product-rec/.test(sec.dataBlock)) return false;
            return true;
          })
          .map((sec, idx) => ({
            name: `${idx + 1}. ${sec.heading}`,
            text: sec.paragraphs.join(' '),
          })),
      })
    : null;

  return (
    <article className="guide-article animate-fade-in">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(articleSchema) }}
      />
      {howToSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(howToSchema) }}
        />
      )}

      <Breadcrumbs
        items={[
          { name: '홈', href: '/' },
          { name: '가이드', href: '/guide' },
          { name: g.section, href: '/guide' },
          { name: g.title, href: `/guide/${slug}` },
        ]}
      />

      <header className="guide-article-hero">
        <div className="guide-article-section">{g.section}</div>
        <h1 className="guide-article-title">{g.title}</h1>
        <p className="guide-article-tagline">{g.tagline}</p>
        <div className="guide-article-meta">
          최근 점검: {new Date(g.lastReviewed).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </header>

      {/* AEO 직답 — Hero 직후. 결론 1~2문장만(구체 수치·표는 본문). AI Overview·스니펫 인용용. */}
      {g.answer && <AnswerBox summary={g.answer} source="Daily ETF Pulse 편집팀" />}

      {/* 한눈 비교 표 — 비교(vs) 가이드. "X vs Y" featured snippet(표) 후보 + 체류시간↑. */}
      {g.comparisonTable && (
        <figure className="guide-compare-table-wrap">
          <figcaption className="guide-compare-caption">{g.comparisonTable.caption}</figcaption>
          <table className="guide-compare-table">
            <thead>
              <tr>
                {g.comparisonTable.columns.map((c, i) => (
                  <th key={i} scope="col">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {g.comparisonTable.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) =>
                    ci === 0 ? (
                      <th key={ci} scope="row">{cell}</th>
                    ) : (
                      <td key={ci}>{cell}</td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </figure>
      )}

      {/* Hero 직후 RecommendBox top — 4카드 박스 (가이드 카테고리 매칭) */}
      <RecommendBox position="top" category={guideToProductCategory(g.slug)} />

      <div className="guide-article-body">
        {g.sections.map((sec, i) => (
          <section key={i} className="guide-article-section-block">
            <h2 className="guide-article-h2">{sec.heading}</h2>
            {sec.paragraphs.map((p, pi) => (
              <p key={pi} className="guide-article-p">{p}</p>
            ))}
            {sec.dataBlock && (
              <div className="guide-article-data">
                <GuideDataBlock block={sec.dataBlock} />
              </div>
            )}
            {sec.affiliateInline && (
              <AffiliateInline
                leadIn={sec.affiliateInline.leadIn}
                productId={sec.affiliateInline.productId}
                style={sec.affiliateInline.style}
              />
            )}
          </section>
        ))}
      </div>

      {/* 주제 관련 ETF 종목 사전 — 가이드 → /etf/{slug} 연결(테마·자산군 가이드만) */}
      {guideSectorEtfs.length > 0 && (
        <section className="guide-article-section-block">
          <h2 className="guide-article-h2">{guideSector} ETF 종목 사전</h2>
          <p className="guide-article-p">
            이 주제와 관련된 ETF의 시세·구성종목·분배 정보는 종목 사전에서 한 종목씩 확인할 수 있습니다.
          </p>
          <ul className="etf-dict-related-grid">
            {guideSectorEtfs.map(r => (
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

      <FaqSection title={`${g.section} — 자주 묻는 질문`} items={g.faq} />

      <nav className="guide-article-other" aria-label="관련 가이드">
        <h2>관련 가이드</h2>
        <ul>
          {relatedGuides.map(o => (
            <li key={o.slug}>
              <Link href={`/guide/${o.slug}`} prefetch={false}>
                <span className="guide-article-other-title">{o.title}</span>
                <ArrowRight size={14} strokeWidth={2.5} />
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/guide" className="guide-article-other-all" prefetch={false}>
          전체 ETF 가이드 보기 <ArrowRight size={14} strokeWidth={2.5} />
        </Link>
      </nav>

      <RecommendBox position="bottom" category={guideToProductCategory(g.slug)} />
    </article>
  );
}
