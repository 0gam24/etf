import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllPosts } from '@/lib/posts';
import { AUTHORS } from '@/lib/authors';
import Breadcrumbs from '@/components/Breadcrumbs';
import { buildPersonSchema, jsonLd } from '@/lib/schema';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return Object.keys(AUTHORS).map(id => ({ id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const a = AUTHORS[id];
  if (!a) return { title: '저자를 찾을 수 없습니다' };
  const canonicalPath = `/author/${id}`;
  return {
    title: `${a.name} — ${a.title}`,
    description: a.bio,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title: `${a.name} — ${a.title}`,
      description: a.bio,
      type: 'profile',
      url: canonicalPath,
    },
    twitter: {
      card: 'summary',
      title: `${a.name} — ${a.title}`,
      description: a.bio,
    },
  };
}

export default async function AuthorPage({ params }: PageProps) {
  const { id } = await params;
  const author = AUTHORS[id];
  if (!author) notFound();

  const posts = getAllPosts().filter(p => p.meta.authorId === id);

  const personSchema = buildPersonSchema({
    name: author.name,
    jobTitle: author.title,
    description: author.bio,
    knowsAbout: author.expertise,
    url: `/author/${id}`,
  });

  return (
    <div className="animate-fade-in">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(personSchema) }} />
      <Breadcrumbs
        items={[
          { name: '홈', href: '/' },
          { name: '저자', href: '/' },
          { name: author.name, href: `/author/${id}` },
        ]}
      />

      <section className="category-hero" style={{ paddingBottom: '4rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="category-hero-inner">
          <div className="author-avatar-xl">{author.name.charAt(0)}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', letterSpacing: '0.2em', marginBottom: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>AUTHOR PROFILE</div>
          <h1 className="category-hero-title">{author.name} <span style={{ fontSize: '1.25rem', color: 'var(--text-dim)', marginLeft: '0.5rem' }}>({author.age})</span></h1>
          <p className="category-hero-desc" style={{ maxWidth: '52rem' }}>{author.title}</p>
          <p style={{ maxWidth: '52rem', margin: '1.25rem auto', color: 'var(--text-dim)', fontSize: '1rem', lineHeight: 1.7 }}>{author.bio}</p>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.5rem' }}>
            {author.expertise.map(e => (
              <span key={e} style={{ padding: '0.375rem 0.875rem', background: 'rgba(212,175,55,0.12)', color: '#D4AF37', fontSize: '0.8rem', borderRadius: '9999px', fontWeight: 600 }}>{e}</span>
            ))}
          </div>
          <div className="category-hero-count" style={{ marginTop: '2rem' }}>{posts.length}편 발행</div>
        </div>
      </section>

      <section className="post-list">
        {posts.length === 0 ? (
          <div className="empty-state"><p>아직 발행된 글이 없습니다.</p></div>
        ) : (
          <div className="post-list-items">
            {posts.map(post => (
              <a key={post.meta.slug} href={`/${post.meta.category}/${post.meta.slug}`} className="post-card">
                <div className="post-card-meta">
                  <span className={`badge badge-${post.meta.category.split('/')[0]}`}>{post.categoryName}</span>
                  <span className="post-card-date">{new Date(post.meta.date).toLocaleDateString('ko-KR')}</span>
                </div>
                <h2 className="post-card-title">{post.meta.title}</h2>
                <p className="post-card-desc">{post.meta.description}</p>
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
