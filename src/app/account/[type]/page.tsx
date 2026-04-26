import { getPostsByCategory, CATEGORY_NAMES, ACCOUNT_CATEGORIES } from '@/lib/posts';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import RecommendBox from '@/components/RecommendBox';

interface PageProps {
  params: Promise<{ type: string }>;
}

const ACCOUNT_META: Record<string, { icon: string; desc: string; cpcTag: string }> = {
  irp: { icon: '🏦', desc: '퇴직연금(IRP)에서 사기 좋은 ETF 큐레이션. 세액공제 148만 원을 연 단위로 확보하는 전략.', cpcTag: '연금·IRP 고단가 키워드' },
  isa: { icon: '🛡️', desc: 'ISA 계좌 필수 종목. 배당소득세 비과세 200만 원 한도를 채우는 커버드콜·월배당 조합.', cpcTag: 'ISA 필수 종목' },
  pension: { icon: '💼', desc: '연금저축펀드 월배당 포트폴리오 완성 가이드. 세액공제와 저율 연금 수령까지.', cpcTag: '연금저축 최적화' },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type } = await params;
  const key = `account/${type}`;
  const name = CATEGORY_NAMES[key];
  if (!name) return { title: '계좌 가이드를 찾을 수 없습니다' };
  const canonicalPath = `/account/${type}`;
  const desc = ACCOUNT_META[type]?.desc || `${name} 활용 ETF 전략과 세후 수익률 가이드.`;
  return {
    title: `${name} ETF 가이드 — Daily ETF Pulse`,
    description: desc,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title: `${name} ETF 가이드 — Daily ETF Pulse`,
      description: desc,
      type: 'website',
      url: canonicalPath,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} ETF 가이드`,
      description: desc,
    },
  };
}

export async function generateStaticParams() {
  return ACCOUNT_CATEGORIES.map(c => ({ type: c.replace('account/', '') }));
}

export default async function AccountPage({ params }: PageProps) {
  const { type } = await params;
  const key = `account/${type}`;
  const name = CATEGORY_NAMES[key];
  if (!name) notFound();

  const posts = getPostsByCategory(key);
  const meta = ACCOUNT_META[type];

  return (
    <div className="animate-fade-in">
      <section className="category-hero" style={{ paddingBottom: '4rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="category-hero-inner">
          <span className="category-hero-icon">{meta?.icon}</span>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', letterSpacing: '0.2em', marginBottom: '0.75rem', textTransform: 'uppercase' }}>{meta?.cpcTag}</div>
          <h1 className="category-hero-title">{name}</h1>
          <p className="category-hero-desc">{meta?.desc}</p>
          <div className="category-hero-count">총 {posts.length}개 리포트</div>
        </div>
      </section>

      <RecommendBox position="top" category="retirement" />

      <section className="post-list">
        {posts.length === 0 ? (
          <div className="empty-state">
            <p>이 계좌별 가이드는 <b>Month 3 로드맵</b>에서 집중 발행될 예정입니다.</p>
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-dim)' }}>현재는 <a href="/income" style={{ color: '#60a5fa' }}>월배당·커버드콜</a> 카테고리에서 관련 내용을 확인하실 수 있습니다.</p>
          </div>
        ) : (
          <div className="post-list-items">
            {posts.map((post, index) => (
              <a key={post.meta.slug}
                 href={`/account/${type}/${post.meta.slug}`}
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

      <RecommendBox position="bottom" category="retirement" />
    </div>
  );
}
