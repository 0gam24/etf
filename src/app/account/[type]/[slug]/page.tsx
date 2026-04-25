import { getPostBySlug, getAllPostSlugs, CATEGORY_NAMES } from '@/lib/posts';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ type: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type, slug } = await params;
  const post = getPostBySlug(`account/${type}`, slug);
  if (!post) return { title: '포스팅을 찾을 수 없습니다' };
  const canonicalPath = `/account/${type}/${encodeURI(slug)}`;
  const ogImage = `/api/og?title=${encodeURIComponent(post.meta.title)}&category=account`;
  return {
    title: post.meta.title,
    description: post.meta.description,
    keywords: post.meta.keywords,
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

export async function generateStaticParams() {
  return getAllPostSlugs()
    .filter(s => s.category.startsWith('account/'))
    .map(s => ({ type: s.category.replace('account/', ''), slug: s.slug }));
}

export default async function AccountPostPage({ params }: PageProps) {
  const { type, slug } = await params;
  const post = getPostBySlug(`account/${type}`, slug);
  if (!post) notFound();

  const date = new Date(post.meta.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  const categoryName = CATEGORY_NAMES[`account/${type}`] || type;

  return (
    <div className="animate-fade-in post-container">
      <section className="post-header-inner">
        <div className="breadcrumb" style={{ justifyContent: 'center', marginBottom: '1.5rem' }}>
          <a href="/">홈</a>
          <span>/</span>
          <a href={`/account/${type}`}>{categoryName}</a>
        </div>
        <h1 className="post-title">{post.meta.title}</h1>
        <div className="post-meta-bar">
          <div className="post-meta-item">✍️ {post.meta.author}</div>
          <div className="post-meta-item">📅 {date}</div>
          <div className="post-meta-item">⏱️ {post.readingTime}분 읽기</div>
        </div>
      </section>
      <section className="post-body" style={{ marginTop: '2rem' }}>
        <article className="post-content prose" style={{ whiteSpace: 'pre-wrap' }}>
          {post.content}
        </article>
      </section>
    </div>
  );
}
