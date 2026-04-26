import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { GUIDES, getGuideBySlug } from '@/lib/guides';
import Breadcrumbs from '@/components/Breadcrumbs';
import FaqSection from '@/components/FaqSection';
import GuideDataBlock from '@/components/GuideDataBlock';
import AffiliateInline from '@/components/AffiliateInline';
import AffiliateNotice from '@/components/AffiliateNotice';
import ProductCard from '@/components/ProductCard';
import { getProductById } from '@/lib/products';
import { buildArticleSchema, jsonLd } from '@/lib/schema';

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

  return (
    <article className="guide-article animate-fade-in">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(articleSchema) }}
      />

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

      {/* heroAffiliate / affiliateInline / product-rec dataBlock 중 하나라도 있으면 면책 1회 */}
      {(g.heroAffiliate || g.sections.some(s => s.affiliateInline || (s.dataBlock && s.dataBlock.startsWith('product-rec:')))) && (
        <AffiliateNotice variant="top" />
      )}

      {/* Hero 직후 단일 mini-card — above the fold 큐레이션 */}
      {g.heroAffiliate && (() => {
        const heroProduct = getProductById(g.heroAffiliate.productId);
        if (!heroProduct) return null;
        return (
          <aside className="guide-hero-affiliate" aria-label="이 가이드와 함께 읽기">
            <p className="guide-hero-affiliate-leadin">{g.heroAffiliate.leadIn}</p>
            <ProductCard product={heroProduct} variant="mini" />
          </aside>
        );
      })()}

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
    </article>
  );
}
