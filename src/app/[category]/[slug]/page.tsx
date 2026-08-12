import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPostBySlug, getAllPostSlugs, CATEGORY_NAMES, getAllPosts, getRelatedPosts } from '@/lib/posts';
import { getLatestEtfData, getKrxEtfMeta, codeToSlug } from '@/lib/data';
import { computeMarketAvgVolume, type RawEtf } from '@/lib/surge';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import ChartRenderer from '@/components/ChartRenderer';
import ReadingProgress from '@/components/ReadingProgress';
import ShareRow from '@/components/ShareRow';
import Toc from '@/components/Toc';
import AiAgentDisclosure from '@/components/AiAgentDisclosure';
import HelpfulFeedback from '@/components/HelpfulFeedback';
import HoldingsPanel from '@/components/HoldingsPanel';
import PostRelatedEtfs from '@/components/PostRelatedEtfs';
import Breadcrumbs from '@/components/Breadcrumbs';
import RecommendBox from '@/components/RecommendBox';
import MainBackrefBox, { getBackrefUrlForCategory } from '@/components/MainBackrefBox';
import LiveTickerChip from '@/components/LiveTickerChip';
import PublishedVsLive from '@/components/PublishedVsLive';
import AnswerBox from '@/components/AnswerBox';
import FaqSection from '@/components/FaqSection';
import type { ProductCategory } from '@/lib/products';
import { AUTHORS } from '@/lib/authors';
import { buildArticleSchema, buildPersonSchema, jsonLd } from '@/lib/schema';
import { SITE_NAME, SITE_LOCALE, articleTitle, articleDescription, toReportYmd, padDescription, ogImageUrl } from '@/lib/site-meta';

/** 글 카테고리 → 추천 자료 매칭 */
function postCategoryToProductCategory(category: string): ProductCategory | undefined {
  const map: Record<string, ProductCategory> = {
    'income':   'income',
    'breaking': 'general',
    'pulse':    'general',
    'surge':    'general',
    'flow':     'general',
  };
  return map[category];
}

interface PageProps {
  params: Promise<{ category: string; slug: string }>;
}

/**
 * 페이지가 직접 발행하는 스키마 종류.
 *   frontmatter(post.meta.schemas)에 같은 종류가 들어 있으면 중복이므로 걸러낸다.
 *   Article/NewsArticle은 이 페이지가 이미지까지 포함해 발행하고,
 *   BreadcrumbList는 <Breadcrumbs> 컴포넌트가 발행한다.
 */
const PAGE_OWNED_SCHEMA_TYPES = new Set(['Article', 'NewsArticle', 'BlogPosting', 'BreadcrumbList']);

/**
 * 같은 날·같은 제목 글을 구분하는 짧은 꼬리표.
 *   ETF 정식명은 최대 30자라 그대로 붙이면 제목이 78자까지 늘어난다.
 *   이름이 짧을 때만 이름을, 길면 종목코드를 쓴다.
 */
function shortDiscriminator(ticker: string): string | undefined {
  if (!ticker) return undefined;
  const name = getKrxEtfMeta(ticker)?.name;
  return name && name.length <= 12 ? name : ticker.toUpperCase();
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

  const canonicalPath = `/${category}/${encodeURI(slug)}`;
  const ogImage = ogImageUrl({ category });

  // 같은 제목·설명이 여러 날짜 글에 걸리면 구글이 하나만 남기고 나머지를 색인에서 뺀다.
  //   (2026-08-11 감사: 제목 6그룹 23편·설명 9그룹 29편 중복, /income·/flow 집중)
  //   중복인 글에만 기준일을 붙여 구분한다. 본문·H1·URL은 그대로 둔다.
  const all = getAllPosts();
  // 기준일은 pulseDate(발행 대상일) 우선. date는 UTC 타임스탬프라 KST 기준 하루 밀린다.
  const reportDateOf = (p: { meta: { pulseDate?: string; date: string } }) =>
    toReportYmd(p.meta.pulseDate) || toReportYmd(p.meta.date) || '';
  const ymdOf = (p: { meta: { pulseDate?: string; date: string } }) => reportDateOf(p);
  const reportDate = reportDateOf(post);
  const sameTitle = all.filter(p => p.meta.title === post.meta.title);
  const titleDup = sameTitle.length > 1;
  // 같은 날짜에 같은 제목이 또 겹치면(종목만 다른 경우) 날짜만으로는 구분이 안 된다.
  const sameTitleSameDay = sameTitle.filter(p => ymdOf(p) === reportDate);
  const discriminator = sameTitleSameDay.length > 1
    ? shortDiscriminator(post.meta.tickers?.[0] || '')
    : undefined;
  const sameDesc = all.filter(p => p.meta.description === post.meta.description);
  const descDup = sameDesc.length > 1;
  const descDiscriminator = sameDesc.filter(p => ymdOf(p) === reportDate).length > 1
    ? shortDiscriminator(post.meta.tickers?.[0] || '')
    : undefined;
  const metaTitle = articleTitle({ title: post.meta.title, date: reportDate, isDuplicate: titleDup, discriminator });
  const baseDesc = articleDescription({ description: post.meta.description, date: reportDate, isDuplicate: descDup, discriminator: descDiscriminator });

  // 설명이 짧으면(감사 실측: /pulse 평균 49자) 다룬 종목명과 카테고리별 안내를 덧붙여
  // 120~155자에 맞춘다. 종목명은 롱테일 검색 매칭 면적도 함께 넓힌다.
  const coveredNames = (post.meta.tickers || [])
    .slice(0, 2).map(t => getKrxEtfMeta(t)?.name).filter(Boolean).join('·');
  const CATEGORY_CLAUSE: Record<string, string> = {
    pulse:    '거래량 상위 종목의 움직임과 섹터 흐름, 어제 대비 달라진 점을 함께 정리했습니다.',
    flow:     '섹터별 자금 유입과 유출, 각 섹터 대장 종목의 움직임을 함께 정리했습니다.',
    income:   '분배 주기와 분배락일, 계좌별 세후 수익률까지 함께 확인할 수 있습니다.',
    breaking: '구성종목과 섹터 연결, 매수 전 확인할 점을 함께 정리했습니다.',
    surge:    '급등 배경과 위험 신호, 같은 테마의 다른 종목까지 함께 정리했습니다.',
  };
  const metaDesc = padDescription(baseDesc, [
    coveredNames ? `다룬 종목은 ${coveredNames}입니다.` : undefined,
    CATEGORY_CLAUSE[category],
    'KRX 공공데이터 기준입니다.',
  ]);
  const ogTitle = typeof metaTitle === 'string' ? metaTitle : (metaTitle as { absolute: string }).absolute;

  return {
    title: metaTitle,
    description: metaDesc,
    keywords: post.meta.keywords,
    authors: [{ name: post.meta.author }],
    alternates: { canonical: canonicalPath },
    openGraph: { siteName: SITE_NAME, locale: SITE_LOCALE,
      title: ogTitle,
      description: metaDesc,
      type: 'article',
      url: canonicalPath,
      publishedTime: post.meta.date,
      authors: [post.meta.author],
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.meta.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: metaDesc,
      images: [ogImage],
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

export default async function PostPage({ params }: PageProps) {
  const { category, slug } = await params;
  const post = getPostBySlug(category, slug);
  if (!post) notFound();

  const today = new Date(post.meta.date).toISOString().slice(0, 10).replace(/-/g, '');
  const charts = loadCharts(slug, today) as Parameters<typeof ChartRenderer>[0]['charts'] | null;

  const date = new Date(post.meta.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

  // 관련 포스트 — 티커 교집합 > 같은 섹터 > 같은 카테고리 관련도 순(최신 동률).
  //   세션당 PV(자동광고 노출)·내부링크 관련성 강화. fallback: 같은 카테고리 최신.
  let related = getRelatedPosts(post, 4);
  if (related.length === 0) {
    related = getAllPosts()
      .filter(p => p.meta.category === category && p.meta.slug !== slug)
      .slice(0, 4);
  }

  const categoryShort = category.split('/')[0];

  // 오늘 시세 · 위험 라벨 계산
  const etfData = getLatestEtfData();
  const etfList: RawEtf[] = (etfData?.etfList || []) as RawEtf[];
  const marketAvgVolume = computeMarketAvgVolume(etfList);
  const tickersForPanel = post.meta.tickers?.slice(0, 5) || [];

  // Article (or NewsArticle for breaking) + author Person 스키마
  const ogParams = new URLSearchParams({
    title: post.meta.title.slice(0, 60),
    category,
    date: new Date(post.meta.date).toLocaleDateString('ko-KR'),
  });
  if (post.meta.tickers?.length) ogParams.set('tickers', post.meta.tickers.slice(0, 3).join(','));
  const ogImage = ogImageUrl({ category });
  const authorMeta = post.meta.authorId ? AUTHORS[post.meta.authorId] : null;

  // dateModified — 글 자체는 발행일 그대로지만, 시세 데이터는 매 영업일 cron 갱신.
  // KRX baseDate 가 글보다 최근이면 그 시점을 dateModified 로 사용 (검색결과 freshness 신호).
  const krxBaseDate = etfData?.baseDate;
  const krxBaseDateIso = krxBaseDate && krxBaseDate.length === 8
    ? `${krxBaseDate.slice(0, 4)}-${krxBaseDate.slice(4, 6)}-${krxBaseDate.slice(6, 8)}T15:30:00+09:00`
    : null;
  const dateModified = (krxBaseDateIso && new Date(krxBaseDateIso) > new Date(post.meta.date))
    ? krxBaseDateIso
    : post.meta.date;

  const articleSchema = buildArticleSchema({
    type: category === 'breaking' ? 'NewsArticle' : 'Article',
    headline: post.meta.title,
    description: post.meta.description,
    url: `/${category}/${slug}`,
    datePublished: post.meta.date,
    dateModified,
    images: [ogImage],
    author: {
      name: post.meta.author,
      authorId: post.meta.authorId,
      title: authorMeta?.title,
    },
    keywords: post.meta.keywords,
    section: post.categoryName,
    // AnswerBox는 summary가 있을 때만 렌더된다. 렌더되지 않는 글에 speakable을 붙이면
    // 마크업이 화면에 없는 요소를 가리키게 되므로 조건을 맞춘다.
    speakable: !!post.meta.summary,
  });

  const personSchema = authorMeta
    ? buildPersonSchema({
        name: authorMeta.name,
        jobTitle: authorMeta.title,
        description: authorMeta.bio,
        knowsAbout: authorMeta.expertise,
        url: `/author/${authorMeta.id}`,
      })
    : null;

  return (
    <>
      <ReadingProgress />

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(articleSchema) }}
      />
      {personSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(personSchema) }}
        />
      )}
      {/* MDX frontmatter에 발행 시점 스키마가 함께 저장돼 있는데, 이 페이지가 이미
          더 완전한 버전(이미지 포함 Article/NewsArticle, Breadcrumbs 컴포넌트의 BreadcrumbList)을
          내보내고 있어 같은 종류가 두 번 실렸다. 실측: 94쪽에 Article 계열 2개, 130쪽에
          BreadcrumbList 2개. 같은 콘텐츠에 상충하는 선언이 겹치면 구글이 어느 쪽을 쓸지
          불확실해지므로, 페이지가 이미 발행하는 종류는 frontmatter 쪽에서 걸러낸다.
          (2026-08-11 스키마 감사) */}
      {post.meta.schemas
        ?.filter(s => !PAGE_OWNED_SCHEMA_TYPES.has((s as { '@type'?: string })?.['@type'] || ''))
        .map((s, i) => (
          <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
        ))}

      <Breadcrumbs
        items={[
          { name: '홈', href: '/' },
          { name: post.categoryName, href: `/${category}` },
          { name: post.meta.title, href: `/${category}/${slug}` },
        ]}
      />

      <div className="post-v2">
        <article className="post-v2-main">
          <header className="post-v2-hero">
            <div className="post-v2-crumb" aria-hidden>
              <Link href="/">홈</Link>
              <span>/</span>
              <Link href={`/${category}`}>{post.categoryName}</Link>
            </div>
            <span className={`badge badge-${categoryShort}`} style={{ display: 'inline-flex', padding: '0.25rem 0.75rem', marginBottom: 'var(--space-4)' }}>
              {post.categoryName}
            </span>
            <h1 className="post-v2-title">{post.meta.title}</h1>
            <div className="post-v2-meta">
              <span className="post-v2-meta-author">
                <span className="post-v2-avatar">D</span>
                <span>Daily ETF Pulse 편집팀</span>
                <AiAgentDisclosure variant="compact" />
              </span>
              <span>{date}</span>
              <span>· {post.readingTime}분 읽기</span>
              {post.meta.tickers && post.meta.tickers.length > 0 && (
                <span style={{ display: 'inline-flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                  {post.meta.tickers.slice(0, 3).map(t => {
                    const meta = getKrxEtfMeta(t);
                    const liveEtf = etfList.find(e => e.code === t);
                    return (
                      <LiveTickerChip
                        key={t}
                        code={t}
                        name={meta?.name}
                        slug={codeToSlug(t)}
                        initialPrice={liveEtf?.price}
                        initialChangeRate={liveEtf?.changeRate}
                      />
                    );
                  })}
                </span>
              )}
            </div>
          </header>

          {/* 발행 vs 현재 — 글 1번째 ticker 의 시세 변동 transparent 표기 */}
          {post.meta.tickers && post.meta.tickers[0] && (() => {
            const t = post.meta.tickers[0];
            const liveEtf = etfList.find(e => e.code === t);
            if (!liveEtf || !liveEtf.price) return null;
            const meta = getKrxEtfMeta(t);
            const pubDate = new Date(post.meta.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
            return (
              <PublishedVsLive
                code={t}
                name={meta?.name || liveEtf.name}
                publishedPrice={liveEtf.price}
                publishedDate={pubDate}
              />
            );
          })()}

          {/* AEO 정답블록 — 직답 1문장 + 핵심 수치. AI Overview·피처드스니펫 인용용.
              frontmatter summary/keyStats 가 있을 때만 노출 (기존 글 graceful). */}
          <AnswerBox
            summary={post.meta.summary}
            keyStats={post.meta.keyStats}
            asOf={krxBaseDate && krxBaseDate.length === 8
              ? `${krxBaseDate.slice(0, 4)}-${krxBaseDate.slice(4, 6)}-${krxBaseDate.slice(6, 8)} KRX`
              : undefined}
            source="KRX 공공데이터"
          />

          <RecommendBox position="top" category={postCategoryToProductCategory(category)} />

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

          {/* AEO FAQ — frontmatter faq[]를 가시 아코디언 + FAQPage JSON-LD 단일 소스로 렌더.
              ⚠️ 이중 FAQPage 방지: 기존 글은 schemas[]에 FAQPage를 인라인 박제 중이므로
              (a) frontmatter faqs 가 있고 (b) schemas[]에 FAQPage 가 없을 때만 출력.
              → 기존 77편(인라인 FAQPage) 무변경, 향후 글은 faq[] 단일 소스. */}
          {(() => {
            const faqs = post.meta.faqs;
            if (!faqs || faqs.length === 0) return null;
            const hasInlineFaqPage = (post.meta.schemas || []).some(
              (s) => (s as { '@type'?: string })?.['@type'] === 'FAQPage',
            );
            if (hasInlineFaqPage) return null;
            return <FaqSection title="자주 묻는 질문" items={faqs} />;
          })()}

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

          <HelpfulFeedback contentId={`${category}/${slug}`} category={category} />

          <MainBackrefBox
            variant="inline"
            mainCategoryUrl={getBackrefUrlForCategory(category)}
          />

          <AiAgentDisclosure variant="inline" />

          <RecommendBox position="bottom" category={postCategoryToProductCategory(category)} />
        </article>

        <Toc />
      </div>
    </>
  );
}
