import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, BookOpen } from 'lucide-react';
import { GUIDES, getGuideClusters } from '@/lib/guides';
import Breadcrumbs from '@/components/Breadcrumbs';
import RecommendBox from '@/components/RecommendBox';
import { buildBreadcrumbSchema, buildItemListSchema, jsonLd } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'ETF 가이드 모음 — 입문·세금·배당·해외·전략 한 곳에',
  description:
    'ETF 입문·비용·세금·ISA 절세계좌·월배당·커버드콜·미국배당·해외지수·채권·적립식·리밸런싱까지 — 주제별로 묶은 ETF 가이드 허브. 검색 한 번이면 그 주제의 답이 한 자리에 정리됩니다.',
  alternates: { canonical: '/guide' },
  openGraph: {
    title: 'ETF 가이드 모음 — 입문·세금·배당·해외·전략',
    description: '주제별로 묶은 ETF 가이드 허브. 입문부터 절세계좌·해외지수·자산배분 전략까지 한 곳에.',
    type: 'website',
    url: '/guide',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ETF 가이드 모음',
    description: '입문·세금·배당·해외·전략 — 주제별로 묶은 ETF 가이드 허브.',
  },
};

export default function GuideIndexPage() {
  const clusters = getGuideClusters();

  // Google Carousel rich result + Breadcrumb 스키마
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: '홈', href: '/' },
    { name: '가이드', href: '/guide' },
  ]);
  const itemListSchema = buildItemListSchema(
    GUIDES.map(g => ({ url: `/guide/${g.slug}`, name: g.title })),
    `Daily ETF Pulse 가이드 ${GUIDES.length}종`,
  );

  return (
    <div className="guide-index animate-fade-in">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(itemListSchema) }} />

      <Breadcrumbs items={[{ name: '홈', href: '/' }, { name: '가이드', href: '/guide' }]} />

      <section className="guide-index-hero">
        <span className="guide-index-eyebrow">
          <BookOpen size={14} strokeWidth={2.6} aria-hidden /> GUIDES · 주제별 정리
        </span>
        <h1 className="guide-index-title">
          {GUIDES.length}개 ETF 가이드, <span className="accent">주제별로 한 곳에</span>
        </h1>
        <p className="guide-index-sub">
          ETF가 처음이라면 기초부터, 세금을 줄이려면 절세 계좌부터, 해외 지수가 고민이면 비교 가이드부터.
          아래 6개 주제 묶음에서 지금 필요한 가이드를 바로 찾아보세요.
        </p>
      </section>

      <RecommendBox position="top" />

      {clusters.map(cluster => (
        <section key={cluster.title} className="guide-cluster">
          <div className="guide-cluster-head">
            <h2 className="guide-cluster-title">{cluster.title}</h2>
            <p className="guide-cluster-desc">{cluster.description}</p>
          </div>
          <ul className="guide-index-list">
            {cluster.guides.map(g => (
              <li key={g.slug} className="guide-index-card">
                <Link href={`/guide/${g.slug}`} prefetch={false}>
                  <div className="guide-index-section">{g.section}</div>
                  <h3 className="guide-index-card-title">{g.title}</h3>
                  <p className="guide-index-card-tagline">{g.tagline}</p>
                  <span className="guide-index-cta">
                    가이드 열기 <ArrowRight size={14} strokeWidth={2.5} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <RecommendBox position="bottom" />
    </div>
  );
}
