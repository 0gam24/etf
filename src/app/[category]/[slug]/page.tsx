import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPostBySlug, getAllPostSlugs, CATEGORY_NAMES, getAllPosts } from '@/lib/posts';
import { getLatestEtfData } from '@/lib/data';
import { computeMarketAvgVolume, type RawEtf } from '@/lib/surge';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import ChartRenderer from '@/components/ChartRenderer';
import ReadingProgress from '@/components/ReadingProgress';
import ShareRow from '@/components/ShareRow';
import Toc from '@/components/Toc';
import HoldingsPanel from '@/components/HoldingsPanel';
import PostRelatedEtfs from '@/components/PostRelatedEtfs';

interface PageProps {
  params: Promise<{ category: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, slug } = await params;
  const post = getPostBySlug(category, slug);
  if (!post) return { title: '포스팅을 찾을 수 없습니다' };

  const ogParams = new URLSearchParams({
    title: post.meta.title.slice(0, 60),
    category,
    date: new Date(post.meta.date).toLocaleDateString('ko-KR'),
  });
  if (post.meta.tickers?.length) ogParams.set('tickers', post.meta.tickers.slice(0, 3).join(','));

  return {
    title: post.meta.title,
    description: post.meta.description,
    keywords: post.meta.keywords,
    authors: [{ name: post.meta.author }],
    openGraph: {
      title: post.meta.title,
      description: post.meta.description,
      type: 'article',
      publishedTime: post.meta.date,
      authors: [post.meta.author],
      images: [`/api/og?${ogParams.toString()}`],
    },
  };
}

export async function generateStaticParams() {
  return getAllPostSlugs().filter(s => !s.category.includes('/'));
}

/** 해당 포스트의 차트 JSON을 파일에서 로드 */
function loadCharts(slug: string, today: string) {
  const candidates = [
    path.join(process.cwd(), 'data', 'processed', `charts_${today}_${slug}.json`),
  ];
  // 최신 파일 우선
  try {
    const dir = path.join(process.cwd(), 'data', 'processed');
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir).filter(f => f.startsWith('charts_') && f.endsWith(`_${slug}.json`));
      files.sort().reverse();
      if (files[0]) candidates.unshift(path.join(dir, files[0]));
    }
  } catch { /* silent */ }

  for (const filePath of candidates) {
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        return parsed.data || parsed;
      }
    } catch { /* silent */ }
  }
  return null;
}

// 저자 이니셜 (아바타용)
function getInitial(name: string) {
  if (!name) return 'D';
  return name.charAt(0);
}

export default async function PostPage({ params }: PageProps) {
  const { category, slug } = await params;
  const post = getPostBySlug(category, slug);
  if (!post) notFound();

  const today = new Date(post.meta.date).toISOString().slice(0, 10).replace(/-/g, '');
  const charts = loadCharts(slug, today) as Parameters<typeof ChartRenderer>[0]['charts'] | null;

  const date = new Date(post.meta.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

  // 관련 포스트 3개 (같은 카테고리)
  const related = getAllPosts()
    .filter(p => p.meta.category === category && p.meta.slug !== slug)
    .slice(0, 3);

  const categoryShort = category.split('/')[0];

  // 오늘 시세 · 위험 라벨 계산
  const etfData = getLatestEtfData();
  const etfList: RawEtf[] = (etfData?.etfList || []) as RawEtf[];
  const marketAvgVolume = computeMarketAvgVolume(etfList);
  const tickersForPanel = post.meta.tickers?.slice(0, 5) || [];

  return (
    <>
      <ReadingProgress />

      {/* JSON-LD */}
      {post.meta.schemas?.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}

      <div className="post-v2">
        <article className="post-v2-main">
          <header className="post-v2-hero">
            <div className="post-v2-crumb">
              <Link href="/">홈</Link>
              <span>/</span>
              <Link href={`/${category}`}>{post.categoryName}</Link>
            </div>
            <span className={`badge badge-${categoryShort}`} style={{ display: 'inline-flex', padding: '0.25rem 0.75rem', marginBottom: 'var(--space-4)' }}>
              {post.categoryName}
            </span>
            <h1 className="post-v2-title">{post.meta.title}</h1>
            <div className="post-v2-meta">
              {post.meta.authorId ? (
                <Link href={`/author/${post.meta.authorId}`} className="post-v2-meta-author">
                  <span className="post-v2-avatar">{getInitial(post.meta.author)}</span>
                  <span>{post.meta.author}</span>
                </Link>
              ) : (
                <span className="post-v2-meta-author">
                  <span className="post-v2-avatar">{getInitial(post.meta.author)}</span>
                  <span>{post.meta.author}</span>
                </span>
              )}
              <span>{date}</span>
              <span>· {post.readingTime}분 읽기</span>
              {post.meta.tickers && post.meta.tickers.length > 0 && (
                <span style={{ display: 'inline-flex', gap: '0.375rem' }}>
                  {post.meta.tickers.slice(0, 3).map(t => (
                    <span key={t} style={{ padding: '0.15rem 0.5rem', background: 'rgba(96,165,250,0.15)', color: '#60A5FA', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: 700 }}>{t}</span>
                  ))}
                </span>
              )}
            </div>
          </header>

          {category === 'surge' && post.meta.tickers && post.meta.tickers[0] && (
            <section className="holdings-detail-section">
              <HoldingsPanel
                code={post.meta.tickers[0]}
                variant="detail"
                label={`${post.meta.tickers[0]} 구성종목 TOP 5`}
                asOfOverride={etfData?.baseDate}
              />
            </section>
          )}

          {tickersForPanel.length > 0 && (
            <PostRelatedEtfs
              tickers={tickersForPanel}
              etfs={etfList}
              marketAvgVolume={marketAvgVolume}
            />
          )}

          <MarkdownRenderer content={post.content} />

          {charts && charts.length > 0 && (
            <section style={{ marginTop: 'var(--space-12)' }}>
              <h2 style={{ fontSize: 'var(--fs-h2)', marginBottom: 'var(--space-5)', paddingLeft: 'var(--space-5)', borderLeft: '4px solid var(--accent-gold)' }}>
                데이터 시각화
              </h2>
              <ChartRenderer charts={charts} />
            </section>
          )}

          <ShareRow title={post.meta.title} path={`/${category}/${slug}`} />

          {related.length > 0 && (
            <section style={{ marginTop: 'var(--space-12)' }}>
              <h2 style={{ fontSize: 'var(--fs-h2)', marginBottom: 'var(--space-6)' }}>
                함께 읽어보면 좋은 분석
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
                {related.map(rp => (
                  <Link key={rp.meta.slug} href={`/${rp.meta.category}/${rp.meta.slug}`} style={{
                    display: 'block',
                    padding: 'var(--space-5)',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'all var(--t-base)',
                  }}>
                    <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--accent-gold)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                      {rp.categoryName}
                    </div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.4, marginBottom: 'var(--space-2)', color: 'var(--text-primary)' }}>
                      {rp.meta.title}
                    </h3>
                    <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-dim)', lineHeight: 1.5 }}>
                      {rp.meta.description}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>

        <Toc />
      </div>
    </>
  );
}
