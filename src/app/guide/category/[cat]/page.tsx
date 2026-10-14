import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowRight, BookOpen, Calculator, Scale } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { buildItemListSchema, jsonLd } from '@/lib/schema';
import { buildPageMetadata, padDescription } from '@/lib/site-meta';
import { getKrxEtfMeta } from '@/lib/data';
import { getComparePairBySlug } from '@/lib/etf-compare-pairs';
import {
  GUIDE_CATEGORIES,
  categoryHref,
  getGuideCategory,
  getGuidesInCategory,
  guideDate,
} from '@/lib/guide-categories';

interface PageProps {
  params: Promise<{ cat: string }>;
}

export function generateStaticParams() {
  return GUIDE_CATEGORIES.map(c => ({ cat: c.key }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { cat } = await params;
  const c = getGuideCategory(cat);
  if (!c) return { title: '주제를 찾을 수 없습니다' };
  // 설명문은 120~155자(SEO.md §2). 주제 소개가 짧으면 글 수와 연결 페이지 안내를 붙인다.
  const n = getGuidesInCategory(c).length;
  const description = padDescription(c.description, [
    `가이드 ${n}편을 최근에 쓰거나 고친 순서로 모았습니다.`,
    c.comparePairs.length > 0
      ? '주제에 맞는 계산기와 같은 지수 ETF 비교 페이지도 함께 연결합니다.'
      : '주제에 맞는 계산기도 함께 연결합니다.',
  ]);
  return buildPageMetadata({
    title: c.title,
    description,
    url: categoryHref(c),
    keywords: c.keywords,
  });
}

/**
 * 가이드 주제 허브 (2026-10-14). 정의는 src/lib/guide-categories.ts.
 *   주제 소개 → 그 주제의 가이드 전체(최근에 쓰거나 고친 순) → 관련 계산기·같은 지수 비교 → 다른 주제.
 */
export default async function GuideCategoryPage({ params }: PageProps) {
  const { cat } = await params;
  const c = getGuideCategory(cat);
  if (!c) notFound();

  const guides = getGuidesInCategory(c);
  const compares = c.comparePairs
    .map(slug => getComparePairBySlug(slug))
    .filter((p): p is NonNullable<typeof p> => !!p)
    .map(p => ({
      slug: p.slug,
      label: `${getKrxEtfMeta(p.codeA)?.name || p.codeA} vs ${getKrxEtfMeta(p.codeB)?.name || p.codeB} 차이`,
    }));
  const latest = guides[0] ? guideDate(guides[0]) : '';

  const itemListSchema = buildItemListSchema(
    guides.map(g => ({ url: `/guide/${g.slug}`, name: g.title })),
    `${c.label} 가이드 ${guides.length}편`,
  );

  return (
    <div className="guide-index animate-fade-in">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(itemListSchema) }} />

      <Breadcrumbs
        items={[
          { name: '홈', href: '/' },
          { name: '가이드', href: '/guide' },
          { name: c.label, href: categoryHref(c) },
        ]}
      />

      <section className="guide-index-hero">
        <span className="guide-index-eyebrow">
          <BookOpen size={14} strokeWidth={2.6} aria-hidden /> {c.label} 가이드 {guides.length}편
          {latest ? ` · 최근 수정 ${latest.replace(/-/g, '.')}` : ''}
        </span>
        <h1 className="guide-index-title">{c.h1}</h1>
        <p className="guide-index-sub">{c.intro}</p>
      </section>

      <section className="guide-cluster" aria-labelledby="cat-guides-heading">
        <div className="guide-cluster-head">
          <h2 className="guide-cluster-title" id="cat-guides-heading">{c.label} 가이드 전체</h2>
          <p className="guide-cluster-desc">최근에 쓰거나 내용을 고친 글부터 보여 줍니다.</p>
        </div>
        <ul className="guide-index-list">
          {guides.map(g => (
            <li key={g.slug} className="guide-index-card">
              <Link href={`/guide/${g.slug}`} prefetch={false}>
                <div className="guide-index-section">{g.section}</div>{' '}
                <h3 className="guide-index-card-title">{g.title}</h3>{' '}
                <p className="guide-index-card-tagline">{g.tagline}</p>{' '}
                <span className="guide-index-cta">
                  가이드 열기 <ArrowRight size={14} strokeWidth={2.5} aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="guide-cluster" aria-labelledby="cat-tools-heading">
        <div className="guide-cluster-head">
          <h2 className="guide-cluster-title" id="cat-tools-heading">함께 보면 좋은 계산기·비교</h2>
        </div>
        <ul className="home-link-list">
          <li>
            <Link href={c.tool.href} prefetch={false}>
              <Calculator size={14} strokeWidth={2.4} aria-hidden /> {c.tool.label}
            </Link>
          </li>
          {compares.map(p => (
            <li key={p.slug}>
              <Link href={`/compare/${p.slug}`} prefetch={false}>
                <Scale size={14} strokeWidth={2.4} aria-hidden /> {p.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="guide-cluster" aria-labelledby="cat-others-heading">
        <div className="guide-cluster-head">
          <h2 className="guide-cluster-title" id="cat-others-heading">다른 주제 가이드</h2>
        </div>
        <ul className="home-link-list">
          {GUIDE_CATEGORIES.filter(o => o.key !== c.key).map(o => (
            <li key={o.key}>
              <Link href={categoryHref(o)} prefetch={false}>{o.label} 가이드</Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
