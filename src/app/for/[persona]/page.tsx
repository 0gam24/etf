import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import ToolLinkCard, { SISTER_TOOLS } from '@/components/ToolLinkCard';
import MainBackrefBox from '@/components/MainBackrefBox';
import { buildBreadcrumbSchema, jsonLd } from '@/lib/schema';
import { PERSONAS, ALL_PERSONAS, type PersonaSlug } from '@/lib/personas-config';
import { getAllPosts } from '@/lib/posts';

interface PageProps {
  params: Promise<{ persona: string }>;
}

export async function generateStaticParams() {
  return ALL_PERSONAS.map(p => ({ persona: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { persona } = await params;
  const p = PERSONAS[persona as PersonaSlug];
  if (!p) return { title: '페르소나를 찾을 수 없습니다' };
  return {
    title: `${p.hero.title} | Daily ETF Pulse`,
    description: p.hero.subtitle,
    alternates: { canonical: `/for/${persona}` },
  };
}

export default async function PersonaPage({ params }: PageProps) {
  const { persona } = await params;
  const config = PERSONAS[persona as PersonaSlug];
  if (!config) notFound();

  const breadcrumb = buildBreadcrumbSchema([
    { name: '홈', href: '/' },
    { name: '페르소나별', href: '/for/retiree' },
    { name: config.displayName, href: `/for/${persona}` },
  ]);

  // 관련 글 추천: frontmatter personas 매칭 우선, 없으면 카테고리 우선순위 fallback
  const allPosts = getAllPosts();
  type PostMetaExt = { personas?: string[] };
  const taggedPosts = allPosts.filter(p => {
    const meta = p.meta as unknown as PostMetaExt;
    return Array.isArray(meta.personas) && meta.personas.includes(config.slug);
  });
  const fallbackPosts = allPosts.filter(p =>
    config.categoryPriority.includes(p.meta.category),
  );
  const recommended = [...taggedPosts, ...fallbackPosts.filter(f => !taggedPosts.some(t => t.meta.slug === f.meta.slug))]
    .slice(0, 4);

  return (
    <article style={{ maxWidth: '64rem', margin: '0 auto', padding: 'var(--space-8) var(--space-6)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumb) }} />
      <Breadcrumbs items={[
        { name: '홈', href: '/' },
        { name: config.displayName, href: `/for/${persona}` },
      ]} />

      <header style={{ marginBottom: 'var(--space-8)' }}>
        <div style={{ fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--accent-gold)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          {config.hero.eyebrow}
        </div>
        <h1 style={{ fontSize: 'var(--fs-h1)', marginBottom: 'var(--space-3)', lineHeight: 1.25 }}>
          {config.hero.title}
        </h1>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '1.05rem' }}>
          {config.hero.subtitle}
        </p>
      </header>

      {/* 1. 자체 사이트 핵심 link */}
      {config.internalLinks.length > 0 && (
        <section style={{ marginBottom: 'var(--space-8)' }}>
          <h2 style={{ fontSize: 'var(--fs-h2)', marginBottom: 'var(--space-4)' }}>
            Daily ETF Pulse 안에서
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-3)' }}>
            {config.internalLinks.map(link => (
              <Link key={link.href} href={link.href} prefetch={false} style={{
                display: 'block',
                padding: 'var(--space-4)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius)',
                textDecoration: 'none',
                color: 'var(--text-primary)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <strong style={{ fontSize: '0.95rem' }}>{link.label}</strong>
                  <ArrowRight size={14} strokeWidth={2.5} color="var(--accent-gold)" aria-hidden />
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: 1.5, margin: 0 }}>
                  {link.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 2. 자매 도구 link (smartdatashop.kr) */}
      {config.tools.length > 0 && (
        <section style={{ marginBottom: 'var(--space-8)' }}>
          <h2 style={{ fontSize: 'var(--fs-h2)', marginBottom: 'var(--space-4)' }}>
            자매 사이트 계산기·도구
          </h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: 'var(--space-4)', lineHeight: 1.6 }}>
            세부 시뮬레이션·계산기는 자매 사이트 smartdatashop.kr 에서 제공합니다.
            본인 상황에 직접 입력해 즉시 결과를 받으실 수 있어요.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-3)' }}>
            {config.tools.map(tool => {
              const meta = SISTER_TOOLS[tool];
              return (
                <ToolLinkCard
                  key={tool}
                  tool={tool}
                  title={meta.title}
                  description={meta.description}
                  icon={meta.icon}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* 3. 관련 분석 글 */}
      {recommended.length > 0 && (
        <section style={{ marginBottom: 'var(--space-8)' }}>
          <h2 style={{ fontSize: 'var(--fs-h2)', marginBottom: 'var(--space-4)' }}>
            관련 분석
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 'var(--space-3)' }}>
            {recommended.map(p => (
              <li key={p.meta.slug}>
                <Link href={`/${p.meta.category}/${p.meta.slug}`} prefetch={false} style={{
                  display: 'block',
                  padding: 'var(--space-4)',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius)',
                  textDecoration: 'none',
                  color: 'var(--text-primary)',
                }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', marginBottom: '0.3rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    {p.categoryName}
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.3rem' }}>{p.meta.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', lineHeight: 1.5, margin: 0 }}>
                    {p.meta.description}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 4. 다른 페르소나 둘러보기 */}
      <section style={{ marginBottom: 'var(--space-6)' }}>
        <h3 style={{ fontSize: 'var(--fs-h3)', marginBottom: 'var(--space-3)' }}>다른 상황도 보기</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {ALL_PERSONAS.filter(p => p.slug !== config.slug).map(p => (
            <Link key={p.slug} href={`/for/${p.slug}`} prefetch={false} style={{
              padding: '0.4rem 0.75rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
            }}>
              {p.scenario} →
            </Link>
          ))}
        </div>
      </section>

      {/* 5. 자매 backref */}
      <MainBackrefBox
        variant="inline"
        mainCategoryUrl={config.mainSiteCategoryUrl}
      />
    </article>
  );
}
