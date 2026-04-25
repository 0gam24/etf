import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, BookOpen } from 'lucide-react';
import { GUIDES } from '@/lib/guides';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: '가이드 — Daily ETF Pulse',
  description:
    '월배당·커버드콜·방산·AI·은퇴 자산 5종의 ETF 가이드. 한 페이지에 정리된 비교와 계좌별 세후 수익률.',
  alternates: { canonical: '/guide' },
  openGraph: {
    title: 'ETF 가이드 — 월배당·커버드콜·방산·AI·은퇴 자산',
    description: '한 페이지에 정리된 ETF 비교와 계좌별 세후 수익률.',
    type: 'website',
    url: '/guide',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ETF 가이드',
    description: '월배당·커버드콜·방산·AI·은퇴 자산 — 5개 핵심 가이드.',
  },
};

export default function GuideIndexPage() {
  return (
    <div className="guide-index animate-fade-in">
      <Breadcrumbs items={[{ name: '홈', href: '/' }, { name: '가이드', href: '/guide' }]} />

      <section className="guide-index-hero">
        <span className="guide-index-eyebrow">
          <BookOpen size={14} strokeWidth={2.6} aria-hidden /> GUIDES · 한 페이지 정리
        </span>
        <h1 className="guide-index-title">
          5개 가이드, <span className="accent">한 페이지에 끝내는 ETF 결정</span>
        </h1>
        <p className="guide-index-sub">
          매일 발행되는 분석을 모아둔 핵심 주제별 가이드. 검색 한 번이면 그 주제의 답이 한 자리에서 정리됩니다.
        </p>
      </section>

      <ul className="guide-index-list">
        {GUIDES.map(g => (
          <li key={g.slug} className="guide-index-card">
            <Link href={`/guide/${g.slug}`} prefetch={false}>
              <div className="guide-index-section">{g.section}</div>
              <h2 className="guide-index-card-title">{g.title}</h2>
              <p className="guide-index-card-tagline">{g.tagline}</p>
              <span className="guide-index-cta">
                가이드 열기 <ArrowRight size={14} strokeWidth={2.5} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
