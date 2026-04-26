import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { GUIDES, getGuideBySlug } from '@/lib/guides';
import Breadcrumbs from '@/components/Breadcrumbs';
import FaqSection from '@/components/FaqSection';
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

      <FaqSection title={`${g.section} — 자주 묻는 질문`} items={g.faq} />

      <nav className="guide-article-other" aria-label="다른 가이드">
        <h2>다른 가이드도 보기</h2>
        <ul>
          {GUIDES.filter(o => o.slug !== g.slug).map(o => (
            <li key={o.slug}>
              <Link href={`/guide/${o.slug}`} prefetch={false}>
                <span className="guide-article-other-title">{o.title}</span>
                <ArrowRight size={14} strokeWidth={2.5} />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <RecommendBox position="bottom" category={guideToProductCategory(g.slug)} />
    </article>
  );
}
