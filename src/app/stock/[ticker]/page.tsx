import Link from 'next/link';
import { getPostBySlug, getPostsByCategory } from '@/lib/posts';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import ReadingProgress from '@/components/ReadingProgress';
import ShareRow from '@/components/ShareRow';
import Toc from '@/components/Toc';

interface PageProps {
  params: Promise<{ ticker: string }>;
}

export async function generateStaticParams() {
  return getPostsByCategory('stock').map(p => ({ ticker: p.meta.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { ticker } = await params;
  const post = getPostBySlug('stock', ticker);
  if (!post) return { title: '종목 가이드를 찾을 수 없습니다' };
  return {
    title: post.meta.title,
    description: post.meta.description,
    openGraph: {
      title: post.meta.title,
      description: post.meta.description,
      images: [`/api/og?category=stock&title=${encodeURIComponent(post.meta.title)}&tickers=${post.meta.ticker || ticker}`],
    },
  };
}

export default async function StockMasterPage({ params }: PageProps) {
  const { ticker } = await params;
  const post = getPostBySlug('stock', ticker);
  if (!post) notFound();

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
          <MarkdownRenderer content={post.content} />
          <ShareRow title={post.meta.title} path={`/stock/${ticker}`} />
        </article>
        <Toc />
      </div>
    </>
  );
}
