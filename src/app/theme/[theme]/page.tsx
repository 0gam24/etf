import { getPostsByCategory, CATEGORY_NAMES, THEME_CATEGORIES } from '@/lib/posts';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ theme: string }>;
}

const THEME_META: Record<string, { icon: string; desc: string }> = {
  ai: { icon: '🤖', desc: 'AI·데이터센터 ETF의 수혜 공급망과 대장주 분석. 2026년 성장 모멘텀을 추적합니다.' },
  semi: { icon: '💾', desc: 'HBM·파운드리·장비주 등 반도체 전반을 다루는 ETF. KODEX vs TIGER 시리즈 비교.' },
  shipbuilding: { icon: '🚢', desc: '조선 슈퍼사이클 수주 잔고와 대형 3사 수혜를 담은 ETF 모아보기.' },
  defense: { icon: '🛡️', desc: '지정학 리스크 수혜 방위산업 ETF. 글로벌 방위비 증액 수혜 종목.' },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { theme } = await params;
  const key = `theme/${theme}`;
  const name = CATEGORY_NAMES[key];
  if (!name) return { title: '테마를 찾을 수 없습니다' };
  const canonicalPath = `/theme/${theme}`;
  const desc = THEME_META[theme]?.desc || `${name} 테마 ETF의 종목별 비교와 최신 분석.`;
  return {
    title: `${name} 테마 ETF — Daily ETF Pulse`,
    description: desc,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title: `${name} 테마 ETF — Daily ETF Pulse`,
      description: desc,
      type: 'website',
      url: canonicalPath,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} 테마 ETF`,
      description: desc,
    },
  };
}

export async function generateStaticParams() {
  return THEME_CATEGORIES.map(c => ({ theme: c.replace('theme/', '') }));
}

export default async function ThemePage({ params }: PageProps) {
  const { theme } = await params;
  const key = `theme/${theme}`;
  const name = CATEGORY_NAMES[key];
  if (!name) notFound();

  const posts = getPostsByCategory(key);
  const meta = THEME_META[theme];

  return (
    <div className="animate-fade-in">
      <section className="category-hero" style={{ paddingBottom: '4rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="category-hero-inner">
          <span className="category-hero-icon">{meta?.icon}</span>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', letterSpacing: '0.2em', marginBottom: '0.75rem', textTransform: 'uppercase' }}>테마 ETF</div>
          <h1 className="category-hero-title">{name}</h1>
          <p className="category-hero-desc">{meta?.desc}</p>
          <div className="category-hero-count">총 {posts.length}개 리포트</div>
        </div>
      </section>

      <section className="post-list">
        {posts.length === 0 ? (
          <div className="empty-state">
            <p>이 테마 리포트는 <b>Month 2 로드맵</b>에서 확장 예정입니다.</p>
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-dim)' }}>먼저 <a href="/pulse" style={{ color: '#60a5fa' }}>오늘의 관전포인트</a>와 <a href="/surge" style={{ color: '#60a5fa' }}>급등 테마 분석</a>을 확인하세요.</p>
          </div>
        ) : (
          <div className="post-list-items">
            {posts.map((post, index) => (
              <a key={post.meta.slug}
                 href={`/theme/${theme}/${post.meta.slug}`}
                 className="post-card"
                 style={{ animationDelay: `${index * 80}ms` }}>
                <div className="post-card-meta">
                  <span className="badge">{name}</span>
                  <span className="post-card-date">{new Date(post.meta.date).toLocaleDateString('ko-KR')}</span>
                  <span className="post-card-date">·</span>
                  <span className="post-card-date">{post.readingTime}분</span>
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
