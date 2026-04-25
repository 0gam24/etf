import { getPostsByCategory, CATEGORY_NAMES, TOP_LEVEL_CATEGORIES } from '@/lib/posts';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Zap, TrendingUp, Waves, Coins } from 'lucide-react';

interface PageProps {
  params: Promise<{ category: string }>;
}

const CATEGORY_META: Record<string, { icon: React.ReactNode; desc: string; tagline: string }> = {
  pulse: {
    icon: <Zap size={36} strokeWidth={2.2} aria-hidden />,
    desc: '매일 오전 9시, 오늘 시장을 움직일 ETF 핵심 포인트를 3줄로 요약합니다.',
    tagline: '오늘의 ETF 관전포인트',
  },
  surge: {
    icon: <TrendingUp size={36} strokeWidth={2.2} aria-hidden />,
    desc: 'KODEX 방산TOP10, SOL 조선TOP3 등 거래량 1위 종목의 급등 사유를 지정학·수주·실적 관점에서 분석합니다.',
    tagline: '급등 테마 즉시 분석',
  },
  flow: {
    icon: <Waves size={36} strokeWidth={2.2} aria-hidden />,
    desc: '섹터별 자금 유입·유출을 주간 리포트로 정리. 기관·외국인 수급 흐름을 테이블로 한눈에 확인하세요.',
    tagline: '어디로 돈이 몰리는가',
  },
  income: {
    icon: <Coins size={36} strokeWidth={2.2} aria-hidden />,
    desc: '커버드콜·월배당 ETF의 실제 분배금을 계산하고, 연금저축·ISA 계좌 조합 시 세후 수익률을 비교합니다.',
    tagline: '월배당·커버드콜 전략',
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const name = CATEGORY_NAMES[category];
  if (!name) return { title: '카테고리를 찾을 수 없습니다' };
  const meta = CATEGORY_META[category];
  const canonicalPath = `/${category}`;
  const description = meta?.desc || `${name} 관련 최신 분석을 한눈에 확인하세요.`;
  return {
    title: `${name} — Daily ETF Pulse`,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title: `${name} — Daily ETF Pulse`,
      description,
      type: 'website',
      url: canonicalPath,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} — Daily ETF Pulse`,
      description,
    },
  };
}

export async function generateStaticParams() {
  // pulse·surge·flow·income·breaking 모두 전용 라우트로 이전됨 (app/{category}/page.tsx).
  // 이 동적 라우트는 더 이상 활성 페이지를 제공하지 않으며, 알 수 없는 카테고리는 notFound 처리.
  return [];
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;
  const categoryName = CATEGORY_NAMES[category];
  if (!categoryName || !TOP_LEVEL_CATEGORIES.includes(category as typeof TOP_LEVEL_CATEGORIES[number])) {
    notFound();
  }

  const posts = getPostsByCategory(category);
  const meta = CATEGORY_META[category];
  const badgeClass = `badge badge-${category}`;

  return (
    <div className="animate-fade-in">
      <section className="category-hero" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4rem' }}>
        <div className="category-hero-inner">
          <span className="category-hero-icon">{meta.icon}</span>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', letterSpacing: '0.2em', marginBottom: '0.75rem', textTransform: 'uppercase' }}>{meta.tagline}</div>
          <h1 className="category-hero-title">{categoryName}</h1>
          <p className="category-hero-desc">{meta.desc}</p>
          <div className={`category-hero-count count-${category}`}>총 {posts.length}개 리포트</div>
        </div>
      </section>

      <section className="post-list">
        {posts.length === 0 ? (
          <div className="empty-state">
            <p>이 카테고리의 새 분석이 곧 올라옵니다. 매일 아침 9시 전 갱신됩니다.</p>
          </div>
        ) : (
          <div className="post-list-items">
            {posts.map((post, index) => {
              const date = new Date(post.meta.date).toLocaleDateString('ko-KR', {
                year: 'numeric', month: 'long', day: 'numeric',
              });
              return (
                <a key={post.meta.slug}
                   href={`/${category}/${post.meta.slug}`}
                   className="post-card"
                   style={{ animationDelay: `${index * 80}ms` }}>
                  <div className="post-card-meta">
                    <span className={badgeClass}>{categoryName}</span>
                    <span className="post-card-date">{date}</span>
                    <span className="post-card-date">·</span>
                    <span className="post-card-date">{post.readingTime}분 읽기</span>
                  </div>
                  <h2 className="post-card-title" style={{ fontSize: '1.25rem' }}>
                    {post.meta.title}
                  </h2>
                  <p className="post-card-desc">{post.meta.description}</p>
                  {post.meta.tickers && post.meta.tickers.length > 0 && (
                    <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {post.meta.tickers.slice(0, 4).map(t => (
                        <span key={t} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: 'rgba(59,130,246,0.15)', color: '#60a5fa', borderRadius: '0.25rem' }}>{t}</span>
                      ))}
                    </div>
                  )}
                  <div className="post-card-readmore" style={{ marginTop: '0.75rem', fontSize: '0.75rem' }}>
                    자세히 읽기 →
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
