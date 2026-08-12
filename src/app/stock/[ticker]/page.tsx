import Link from 'next/link';
import { getPostBySlug, getPostsByCategory } from '@/lib/posts';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import ReadingProgress from '@/components/ReadingProgress';
import ShareRow from '@/components/ShareRow';
import Toc from '@/components/Toc';
import Breadcrumbs from '@/components/Breadcrumbs';
import RecommendBox from '@/components/RecommendBox';
import { AUTHORS } from '@/lib/authors';
import {
  buildArticleSchema,
  buildPersonSchema,
  buildFinancialProductSchema,
  jsonLd,
} from '@/lib/schema';
import { SITE_NAME, SITE_LOCALE, articleTitle, padDescription, ogImageUrl } from '@/lib/site-meta';

interface PageProps {
  params: Promise<{ ticker: string }>;
}

/** 페이지가 직접 발행하는 스키마 종류 — frontmatter 중복분을 걸러내는 기준 */
const PAGE_OWNED_SCHEMA_TYPES = new Set(['Article', 'NewsArticle', 'BlogPosting', 'BreadcrumbList']);

export async function generateStaticParams() {
  return getPostsByCategory('stock').map(p => ({ ticker: p.meta.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { ticker } = await params;
  const post = getPostBySlug('stock', ticker);
  if (!post) return { title: '종목 가이드를 찾을 수 없습니다' };
  const canonicalPath = `/stock/${encodeURI(ticker)}`;
  const ogImage = ogImageUrl({ category: 'stock' });
  // 원 설명이 50자 남짓이라 스니펫 자리를 못 채웠다. (2026-08-11 온페이지 감사)
  const description = padDescription(post.meta.description, [
    '구성종목과 분배 정보, 같은 테마의 다른 ETF까지 한 페이지에 정리했습니다.',
    'KRX 공공데이터 기준입니다.',
  ]);
  return {
    // 긴 제목일 때만 브랜드 접미사를 끊어 60자 안에 들어오게 한다.
    title: articleTitle({ title: post.meta.title }),
    description,
    alternates: { canonical: canonicalPath },
    openGraph: { siteName: SITE_NAME, locale: SITE_LOCALE,
      title: post.meta.title,
      description,
      type: 'article',
      url: canonicalPath,
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.meta.title,
      description,
      images: [ogImage],
    },
  };
}

export default async function StockMasterPage({ params }: PageProps) {
  const { ticker } = await params;
  const post = getPostBySlug('stock', ticker);
  if (!post) notFound();

  const ogImage = ogImageUrl({ category: 'stock' });
  const authorMeta = post.meta.authorId ? AUTHORS[post.meta.authorId] : null;

  const articleSchema = buildArticleSchema({
    type: 'Article',
    headline: post.meta.title,
    description: post.meta.description,
    url: `/stock/${ticker}`,
    datePublished: post.meta.date,
    images: [ogImage],
    author: {
      name: post.meta.author,
      authorId: post.meta.authorId,
      title: authorMeta?.title,
    },
    keywords: post.meta.keywords,
    section: '종목 완벽 가이드',
  });

  const personSchema = authorMeta
    ? buildPersonSchema({
        name: authorMeta.name,
        jobTitle: authorMeta.title,
        description: authorMeta.bio,
        knowsAbout: authorMeta.expertise,
        url: `/author/${authorMeta.id}`,
      })
    : null;

  const productSchema = post.meta.ticker
    ? buildFinancialProductSchema({
        name: post.meta.title.replace(/\s*[—\-:].*$/, ''),
        code: post.meta.ticker,
        description: post.meta.description,
        url: `/stock/${ticker}`,
        category: 'ETF',
      })
    : null;

  return (
    <>
      <ReadingProgress />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(articleSchema) }}
      />
      {personSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(personSchema) }}
        />
      )}
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(productSchema) }}
        />
      )}
      {/* 이 페이지가 이미 Article·BreadcrumbList를 발행하므로 frontmatter의 같은 종류는 제외.
          (2026-08-11 스키마 감사: 한 페이지에 Article 계열 2개가 실리던 문제) */}
      {post.meta.schemas
        ?.filter(s => !PAGE_OWNED_SCHEMA_TYPES.has((s as { '@type'?: string })?.['@type'] || ''))
        .map((s, i) => (
          <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
        ))}
      <Breadcrumbs
        items={[
          { name: '홈', href: '/' },
          { name: '종목 완벽 가이드', href: '/' },
          { name: post.meta.title, href: `/stock/${ticker}` },
        ]}
      />
      <div className="post-v2">
        <article className="post-v2-main">
          <header className="post-v2-hero">
            <div className="post-v2-crumb" aria-hidden>
              <Link href="/">홈</Link>
              <span>/</span>
              <span style={{ color: 'var(--blue-400)' }}>종목 완벽 가이드</span>
            </div>
            <span className="badge" style={{ display: 'inline-flex', padding: '0.25rem 0.75rem', marginBottom: 'var(--space-4)', background: 'rgba(96,165,250,0.15)', color: '#60A5FA' }}>
              {post.meta.ticker} · {post.meta.sector}
            </span>
            <h1 className="post-v2-title">{post.meta.title}</h1>
            <div className="post-v2-meta">
              {post.meta.authorId && (
                <Link href={`/author/${post.meta.authorId}`} className="post-v2-meta-author">
                  <span className="post-v2-avatar">{post.meta.author.charAt(0)}</span>
                  <span>{post.meta.author}</span>
                </Link>
              )}
              <span>{new Date(post.meta.date).toLocaleDateString('ko-KR')}</span>
              <span>· {post.readingTime}분 읽기</span>
            </div>
          </header>
          <RecommendBox position="top" category="general" />
          <MarkdownRenderer content={post.content} />
          <ShareRow title={post.meta.title} path={`/stock/${ticker}`} />
          <RecommendBox position="bottom" category="general" />
        </article>
        <Toc />
      </div>
    </>
  );
}
