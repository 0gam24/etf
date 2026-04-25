import Link from 'next/link';
import { getPostBySlug, getPostsByCategory } from '@/lib/posts';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import ReadingProgress from '@/components/ReadingProgress';
import ShareRow from '@/components/ShareRow';
import Toc from '@/components/Toc';

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
  const ogImage = `/api/og?category=weekly&title=${encodeURIComponent(post.meta.title)}&date=${encodeURIComponent(new Date(post.meta.date).toLocaleDateString('ko-KR'))}`;
  return {
    title: post.meta.title,
    description: post.meta.description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title: post.meta.title,
      description: post.meta.description,
      type: 'article',
      url: canonicalPath,
      publishedTime: post.meta.date,
      authors: [post.meta.author],
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.meta.title,
      description: post.meta.description,
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
          <MarkdownRenderer content={post.content} />
          <ShareRow title={post.meta.title} path={`/weekly/${slug}`} />
        </article>
        <Toc />
      </div>
    </>
  );
}
