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

  // Person 스키마 + AI 모델 신호 (additionalType: SoftwareApplication)
  const personSchema = {
    ...buildPersonSchema({
      name: author.name,
      jobTitle: author.title,
      description: author.modelDescription,
      knowsAbout: author.expertise,
      url: `/author/${id}`,
    }),
    additionalType: 'https://schema.org/SoftwareApplication',
    applicationCategory: 'AnalyticsApplication',
  };

  return (
    <div className="author-page animate-fade-in">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(personSchema) }} />
      <Breadcrumbs
        items={[
          { name: '홈', href: '/' },
          { name: '분석 에이전트', href: '/' },
          { name: author.name, href: `/author/${id}` },
        ]}
      />

      <header className="author-hero">
        <div className="author-hero-avatar">{author.callsign || author.name.charAt(0)}</div>
        <div className="author-hero-eyebrow">AI ANALYSIS AGENT</div>
        <h1 className="author-hero-title">{author.name}</h1>
        <p className="author-hero-subtitle">{author.title}</p>
        <p className="author-hero-desc">{author.modelDescription}</p>
        <div className="author-hero-tags">
          {author.expertise.map(e => (
            <span key={e} className="author-hero-tag">{e}</span>
          ))}
        </div>
        <div className="author-hero-count">{posts.length}편 분석 발행</div>
      </header>

      {/* AI 모델 정보 카드 — E-E-A-T 핵심 섹션 */}
      <section className="author-disclosure" aria-labelledby="agent-info-heading">
        <h2 id="agent-info-heading" className="author-disclosure-h2">
          이 에이전트는 어떻게 분석하나
        </h2>

        <div className="author-disclosure-block">
          <div className="author-disclosure-label">데이터 출처</div>
          <ul className="author-disclosure-sources">
            {author.dataSources.map(s => <li key={s}>{s}</li>)}
          </ul>
        </div>

        {author.methodology && (
          <div className="author-disclosure-block">
            <div className="author-disclosure-label">분석 방법론</div>
            <p className="author-disclosure-text">{author.methodology}</p>
          </div>
        )}

        <div className="author-disclosure-block">
          <div className="author-disclosure-label">발행·검수 책임</div>
          <p className="author-disclosure-text">
            {PUBLISHER.name} — {PUBLISHER.description}
          </p>
        </div>

        <p className="author-disclosure-foot">{AI_DISCLOSURE}</p>
      </section>

      {/* Experience 사례 자리 — Google E-E-A-T 2025 신규 강조 항목.
          AI 자동 생성 X (YMYL 분야 신뢰성) — 운영팀이 수동 큐레이션 후 채워 넣음. */}
      <section className="author-experience-placeholder" aria-labelledby="experience-heading">
        <h2 id="experience-heading" className="author-experience-h2">
          이 모델로 분석된 실제 사례
        </h2>
        <p className="author-experience-desc">
          검증된 실전 사례를 정기적으로 추가하고 있습니다. 본 분석 모델로 산출한 시그널이 실제 시장에서 어떻게 적용됐는지, 후속 가격 변화·분배금 입금·계좌 수익률 변화를 함께 추적해 사례로 정리합니다.
        </p>
        <p className="author-experience-note">
          실제 사용자 후기·운영팀 검증 사례는 분기마다 추가됩니다. 본 모델 활용 사례를 공유해 주시면 검토 후 익명으로 게재합니다.
        </p>
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
