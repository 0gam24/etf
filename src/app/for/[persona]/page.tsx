import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import ToolLinkCard, { SISTER_TOOLS } from '@/components/ToolLinkCard';
import { jsonLd } from '@/lib/schema';
import { PERSONAS, ALL_PERSONAS, type PersonaSlug } from '@/lib/personas-config';
import type { GuideDef } from '@/lib/guides';
import { getGuideCategory, getGuidesInCategory, categoryHref, guideDate, type GuideCategory } from '@/lib/guide-categories';
import { buildPageMetadata , padDescription } from '@/lib/site-meta';

interface PageProps {
  params: Promise<{ persona: string }>;
}

/**
 * 상황별로 먼저 볼 가이드 주제 허브 (2026-10-14).
 *   예전에는 "관련 분석"에 06-13 에 멈춘 일별 시황 글(noindex)을 걸었다. 색인되는 이 페이지가 갱신이 끝난 글로
 *   방문자와 검색엔진을 보내던 것을 끊고, 지금도 고치는 주제 허브의 최신 가이드로 바꾼다.
 */
const PERSONA_HUBS: Record<string, string[]> = {
  retiree: ['dividend', 'pension'],
  newbie: ['basics', 'cost'],
  freelancer: ['tax', 'pension'],
  trader: ['compare', 'theme'],
  'working-couple': ['isa', 'tax'],
  global: ['overseas', 'compare'],
  'early-retire': ['pension', 'tax'],
};

/** 주제 허브마다 최근에 쓰거나 고친 가이드를 2편씩 번갈아 고르고, 모자라면 앞 허브부터 채운다. */
function pickGuides(hubs: GuideCategory[], n: number): { g: GuideDef; hub: GuideCategory }[] {
  const lists = hubs.map(h => ({ hub: h, items: getGuidesInCategory(h) }));
  const picked: { g: GuideDef; hub: GuideCategory }[] = [];
  const has = (slug: string) => picked.some(p => p.g.slug === slug);
  for (const { hub, items } of lists) {
    for (const g of items.filter(x => !has(x.slug)).slice(0, 2)) picked.push({ g, hub });
  }
  for (const { hub, items } of lists) {
    for (const g of items) {
      if (picked.length >= n) break;
      if (!has(g.slug)) picked.push({ g, hub });
    }
  }
  return picked.slice(0, n);
}

export async function generateStaticParams() {
  return ALL_PERSONAS.map(p => ({ persona: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { persona } = await params;
  const p = PERSONAS[persona as PersonaSlug];
  if (!p) return { title: '페르소나를 찾을 수 없습니다' };
  return buildPageMetadata({
    title: p.hero.title,
    // 페르소나 소개문만으로는 평균 51자라 스니펫 자리를 못 채운다(2026-08-11 감사).
    description: padDescription(p.hero.subtitle, [
      '상황에 맞는 ETF와 계좌 조합, 확인할 지표를 한 페이지에 모았습니다.',
      // 2026-09-30: "매일 갱신" 약속 제거 (이 페이지는 시세를 보여 주지 않는다)
      '상황에 맞는 주제별 가이드도 함께 안내합니다.',
    ]),
    url: `/for/${persona}`,
  });
}

export default async function PersonaPage({ params }: PageProps) {
  const { persona } = await params;
  const config = PERSONAS[persona as PersonaSlug];
  if (!config) notFound();


  // 관련 가이드: 상황에 맞는 주제 허브의 최신 가이드 4편 (예전 일별 시황 글 대신)
  const hubs = (PERSONA_HUBS[config.slug] || ['basics'])
    .map(k => getGuideCategory(k))
    .filter((c): c is GuideCategory => !!c);
  const recommended = pickGuides(hubs, 4);

  return (
    <article style={{ maxWidth: '64rem', margin: '0 auto', padding: 'var(--space-8) var(--space-6)' }}>
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

      {/* 2. 자매 도구 link (smartdatashop.kr) — 2026-10-08 뺐다. 09-30 에 사이트 전역 자매 백링크를 뺄 때
          이 페이지들(7쪽)만 남아 있었다. 사이트 사이 상호 링크는 검색엔진에 링크 조작으로 읽힐 수 있다. */}
      {false && config.tools.length > 0 && (
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

      {/* 3. 관련 가이드 (2026-10-14: 예전 일별 시황 글 → 주제 허브의 최신 가이드) */}
      {recommended.length > 0 && (
        <section style={{ marginBottom: 'var(--space-8)' }}>
          <h2 style={{ fontSize: 'var(--fs-h2)', marginBottom: 'var(--space-4)' }}>
            이 상황에 맞는 가이드
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 'var(--space-3)' }}>
            {recommended.map(({ g, hub }) => (
              <li key={g.slug}>
                <Link href={`/guide/${g.slug}`} prefetch={false} style={{
                  display: 'block',
                  padding: 'var(--space-4)',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius)',
                  textDecoration: 'none',
                  color: 'var(--text-primary)',
                }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', marginBottom: '0.3rem', letterSpacing: '0.05em' }}>
                    {hub.label}{guideDate(g) ? ` · ${guideDate(g)}` : ''}
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.3rem' }}>{g.title}</h3>
                </Link>
              </li>
            ))}
          </ul>
          <p style={{ marginTop: 'var(--space-3)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {hubs.map((h, i) => (
              <span key={h.key}>
                {i > 0 && ' · '}
                <Link href={categoryHref(h)} prefetch={false} style={{ color: 'var(--accent-gold)' }}>{h.label} 가이드 전체 보기</Link>
              </span>
            ))}
          </p>
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

      {/* 자매 사이트 백링크 상자는 2026-09-30 제거 (전역 네트워크 링크 축소). 위 도구 섹션은 주제 관련 링크라 유지 */}
    </article>
  );
}
