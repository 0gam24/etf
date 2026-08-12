import Link from 'next/link';
import { getPostBySlug, getPostsByCategory } from '@/lib/posts';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import ReadingProgress from '@/components/ReadingProgress';
import ShareRow from '@/components/ShareRow';
import Toc from '@/components/Toc';
import RecommendBox from '@/components/RecommendBox';
import { SITE_NAME, SITE_LOCALE, articleTitle, padDescription, ogImageUrl } from '@/lib/site-meta';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getPostsByCategory('weekly').map(p => ({ slug: p.meta.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug('weekly', slug);
  if (!post) return { title: '주간 리포트를 찾을 수 없습니다' };
  const canonicalPath = `/weekly/${encodeURI(slug)}`;
  const ogImage = ogImageUrl({ category: 'flow' });
  // 원 설명이 30자 남짓이라 스니펫 자리를 거의 못 썼다. (2026-08-11 온페이지 감사)
  const description = padDescription(post.meta.description, [
    '한 주 동안 어느 섹터로 자금이 움직였는지, 거래량 상위 종목이 어떻게 바뀌었는지 정리했습니다.',
    'KRX 공공데이터 기준입니다.',
  ]);
  return {
    title: articleTitle({ title: post.meta.title }),
    description,
    alternates: { canonical: canonicalPath },
    openGraph: { siteName: SITE_NAME, locale: SITE_LOCALE,
      title: post.meta.title,
      description,
      type: 'article',
      url: canonicalPath,
      publishedTime: post.meta.date,
      authors: [post.meta.author],
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

export default async function WeeklyPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug('weekly', slug);
  if (!post) notFound();

  const date = new Date(post.meta.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <>
      <ReadingProgress />
      {post.meta.schemas?.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}
      <div className="post-v2">
        <article className="post-v2-main">
          <header className="post-v2-hero">
            <div className="post-v2-crumb">
              <Link href="/">홈</Link>
              <span>/</span>
              <span style={{ color: 'var(--accent-gold)' }}>주간 리포트</span>
            </div>
            <span className="badge badge-flow" style={{ display: 'inline-flex', padding: '0.25rem 0.75rem', marginBottom: 'var(--space-4)' }}>
              📅 WEEKLY
            </span>
            <h1 className="post-v2-title">{post.meta.title}</h1>
            <div className="post-v2-meta">
              {post.meta.authorId && (
                <Link href={`/author/${post.meta.authorId}`} className="post-v2-meta-author">
                  <span className="post-v2-avatar">{post.meta.author.charAt(0)}</span>
                  <span>{post.meta.author}</span>
                </Link>
              )}
              <span>📅 {date}</span>
              <span>⏱️ {post.readingTime}분 읽기</span>
            </div>
          </header>
          <RecommendBox position="top" category="general" />
          <MarkdownRenderer content={post.content} />
          <ShareRow title={post.meta.title} path={`/weekly/${slug}`} />
          <RecommendBox position="bottom" category="general" />
        </article>
        <Toc />
      </div>
    </>
  );
}
