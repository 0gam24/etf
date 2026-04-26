import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllPosts } from '@/lib/posts';
import { AUTHORS, PUBLISHER, AI_DISCLOSURE } from '@/lib/authors';
import Breadcrumbs from '@/components/Breadcrumbs';
import RecommendBox from '@/components/RecommendBox';
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
  if (!a) return { title: '에이전트를 찾을 수 없습니다' };
  const canonicalPath = `/author/${id}`;
  const title = `${a.name} — ${a.title} | Daily ETF Pulse`;
  const description = a.modelDescription;
  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: { title, description, type: 'profile', url: canonicalPath },
    twitter: { card: 'summary', title, description },
  };
}

export default async function AuthorPage({ params }: PageProps) {
  const { id } = await params;
  const author = AUTHORS[id];
  if (!author) notFound();

  const posts = getAllPosts().filter(p => p.meta.authorId === id);

  // Person 스키마는 AI 모델이라도 발행 책임자(편집팀)가 있어 신뢰 신호로 유지.
  // schema.org/Person 대신 더 정확한 표기는 작성자 인격이 AI임을 메타로 명시.
  const personSchema = {
    ...buildPersonSchema({
      name: author.name,
      jobTitle: author.title,
      description: author.modelDescription,
      knowsAbout: author.expertise,
      url: `/author/${id}`,
    }),
    // E-E-A-T 투명성 — AI 에이전트임을 schema에서도 공개
    additionalType: 'https://schema.org/SoftwareApplication',
    applicationCategory: 'AnalyticsApplication',
  };

  return (
    <div className="animate-fade-in">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(personSchema) }} />
      <Breadcrumbs
        items={[
          { name: '홈', href: '/' },
          { name: '분석 에이전트', href: '/' },
          { name: author.name, href: `/author/${id}` },
        ]}
      />

      <section className="category-hero" style={{ paddingBottom: '4rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="category-hero-inner">
          <div className="author-avatar-xl">{author.callsign || author.name.charAt(0)}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', letterSpacing: '0.2em', marginBottom: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>
            AI ANALYSIS AGENT
          </div>
          <h1 className="category-hero-title">{author.name}</h1>
          <p className="category-hero-desc" style={{ maxWidth: '52rem' }}>{author.title}</p>
          <p style={{ maxWidth: '52rem', margin: '1.25rem auto', color: 'var(--text-dim)', fontSize: '1rem', lineHeight: 1.7 }}>
            {author.modelDescription}
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.5rem' }}>
            {author.expertise.map(e => (
              <span key={e} style={{ padding: '0.375rem 0.875rem', background: 'rgba(212,175,55,0.12)', color: '#D4AF37', fontSize: '0.8rem', borderRadius: '9999px', fontWeight: 600 }}>{e}</span>
            ))}
          </div>
          <div className="category-hero-count" style={{ marginTop: '2rem' }}>{posts.length}편 분석 발행</div>
        </div>
      </section>

      {/* AI 모델 정보 카드 — E-E-A-T 투명성 핵심 섹션 */}
      <section className="ai-agent-disclosure" aria-labelledby="agent-info-heading" style={{
        maxWidth: '52rem',
        margin: '2.5rem auto',
        padding: '2rem',
        background: 'rgba(212,175,55,0.06)',
        border: '1px solid rgba(212,175,55,0.25)',
        borderRadius: '0.75rem',
      }}>
        <h2 id="agent-info-heading" style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--accent-gold)' }}>
          이 에이전트는 어떻게 분석하나
        </h2>

        <div style={{ display: 'grid', gap: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '0.5rem' }}>
              데이터 출처
            </div>
            <ul style={{ listStyle: 'disc', paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.8 }}>
              {author.dataSources.map(s => <li key={s}>{s}</li>)}
            </ul>
          </div>

          {author.methodology && (
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '0.5rem' }}>
                분석 방법론
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, margin: 0 }}>
                {author.methodology}
              </p>
            </div>
          )}

          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '0.5rem' }}>
              발행·검수 책임
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, margin: 0 }}>
              {PUBLISHER.name} — {PUBLISHER.description}
            </p>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', lineHeight: 1.7, margin: 0, paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {AI_DISCLOSURE}
          </p>
        </div>
      </section>

      <RecommendBox position="top" />

      <section className="post-list">
        {posts.length === 0 ? (
          <div className="empty-state"><p>아직 발행된 분석이 없습니다.</p></div>
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

      <RecommendBox position="bottom" />
    </div>
  );
}
