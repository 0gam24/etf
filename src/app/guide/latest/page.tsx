import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, CalendarDays, LayoutGrid, BookOpen } from 'lucide-react';
import { GUIDES, getGuidePublishedAt, type GuideDef } from '@/lib/guides';
import Breadcrumbs from '@/components/Breadcrumbs';
import RecommendBox from '@/components/RecommendBox';
import { buildItemListSchema, jsonLd } from '@/lib/schema';
import { buildOg } from '@/lib/site-meta';

export const metadata: Metadata = {
  title: '전체 ETF 가이드: 최신 발행순 모아보기',
  description:
    'Daily ETF Pulse의 모든 ETF 가이드를 발행일 기준 최신순으로 한 곳에 모았습니다. 월배당·커버드콜·세금·해외지수·테마·채권까지, 새로 올라온 가이드부터 날짜별로 바로 확인하세요.',
  alternates: { canonical: '/guide/latest' },
  openGraph: buildOg({
    title: '전체 ETF 가이드: 최신 발행순',
    description: '모든 ETF 가이드를 발행일 기준 최신순으로 모아보기. 새 가이드부터 날짜별로 확인하세요.',
    url: '/guide/latest',
  }),
  twitter: {
    card: 'summary_large_image',
    title: '전체 ETF 가이드: 최신 발행순',
    description: '모든 ETF 가이드를 발행일 기준 최신순으로 모아보기.',
  },
};

/** 'YYYY-MM-DD' → '2026년 7월 3일' */
function formatDateKo(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${y}년 ${m}월 ${d}일`;
}

interface DateGroup {
  key: string;
  label: string;
  isFoundational: boolean;
  guides: GuideDef[];
}

export default function GuideLatestPage() {
  // 발행일이 있는 가이드는 최신순, 초기 기반 가이드(발행일 미기록)는 맨 뒤로.
  const dated = GUIDES.filter(g => getGuidePublishedAt(g.slug))
    .sort((a, b) => getGuidePublishedAt(b.slug)!.localeCompare(getGuidePublishedAt(a.slug)!));
  const foundational = GUIDES.filter(g => !getGuidePublishedAt(g.slug));

  // 날짜별 그룹 (정렬 순서 보존)
  const groups: DateGroup[] = [];
  const byDate = new Map<string, GuideDef[]>();
  for (const g of dated) {
    const d = getGuidePublishedAt(g.slug)!;
    let bucket = byDate.get(d);
    if (!bucket) {
      bucket = [];
      byDate.set(d, bucket);
      groups.push({ key: d, label: formatDateKo(d), isFoundational: false, guides: bucket });
    }
    bucket.push(g);
  }
  if (foundational.length > 0) {
    groups.push({ key: 'foundational', label: '기본 가이드', isFoundational: true, guides: foundational });
  }

  const orderedForSchema = [...dated, ...foundational];
  const itemListSchema = buildItemListSchema(
    orderedForSchema.map(g => ({ url: `/guide/${g.slug}`, name: g.title })),
    `Daily ETF Pulse 가이드 ${GUIDES.length}종 — 최신 발행순`,
  );

  return (
    <div className="guide-index animate-fade-in">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(itemListSchema) }} />

      <Breadcrumbs
        items={[
          { name: '홈', href: '/' },
          { name: '가이드', href: '/guide' },
          { name: '최신 발행순', href: '/guide/latest' },
        ]}
      />

      <section className="guide-index-hero">
        <span className="guide-index-eyebrow">
          <CalendarDays size={14} strokeWidth={2.6} aria-hidden /> GUIDES · 최신 발행순
        </span>
        <h1 className="guide-index-title">
          전체 ETF 가이드 {GUIDES.length}개, <span className="accent">최신 발행순으로</span>
        </h1>
        <p className="guide-index-sub">
          새로 올라온 가이드부터 발행일 날짜별로 모아봤습니다. 어떤 주제가 언제 정리됐는지 한눈에 확인하고,
          주제별로 찾고 싶다면 아래 버튼으로 주제별 보기로 이동하세요.
        </p>
        <Link href="/guide" prefetch={false} className="guide-index-cta" style={{ marginTop: '0.75rem' }}>
          <LayoutGrid size={14} strokeWidth={2.5} aria-hidden /> 주제별로 보기
        </Link>
      </section>

      <RecommendBox position="top" />

      {groups.map(group => (
        <section key={group.key} className="guide-cluster">
          <div
            className="guide-cluster-head"
            style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', flexWrap: 'wrap' }}
          >
            <h2 className="guide-cluster-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              {group.isFoundational ? (
                <BookOpen size={16} strokeWidth={2.4} color="var(--accent-gold)" aria-hidden />
              ) : (
                <CalendarDays size={16} strokeWidth={2.4} color="var(--accent-gold)" aria-hidden />
              )}
              {group.label}
            </h2>
            <span className="guide-cluster-desc" style={{ margin: 0 }}>
              {group.isFoundational ? 'ETF 입문·핵심 주제' : '가이드'} {group.guides.length}개
            </span>
          </div>
          <ul className="guide-index-list">
            {group.guides.map(g => (
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
