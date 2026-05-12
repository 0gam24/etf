import fs from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import TodayReport from './TodayReport';
import { buildBreadcrumbSchema, jsonLd } from '@/lib/schema';
import Breadcrumbs from '@/components/Breadcrumbs';

function loadLatest() {
  try {
    const file = path.join(process.cwd(), 'data', 'today', 'latest.json');
    if (!fs.existsSync(file)) return null;
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch {
    return null;
  }
}

export const metadata: Metadata = {
  title: '오늘의 ETF 종합 리포트 — Daily ETF Pulse',
  description: '오늘 거래량 TOP·상승/하락·시그널·분배락일 임박 ETF를 한 페이지에. 매일 평일 KST 16:00 자동 발행.',
  alternates: { canonical: '/today' },
};

export default function TodayPage() {
  const report = loadLatest();
  const breadcrumb = buildBreadcrumbSchema([
    { name: '홈', href: '/' },
    { name: '오늘의 리포트', href: '/today' },
  ]);

  return (
    <article style={{ maxWidth: '64rem', margin: '0 auto', padding: 'var(--space-8) var(--space-6)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumb) }} />
      <Breadcrumbs items={[
        { name: '홈', href: '/' },
        { name: '오늘의 리포트', href: '/today' },
      ]} />

      <header style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--accent-gold)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          TODAY · DAILY SNAPSHOT
        </div>
        <h1 style={{ fontSize: 'var(--fs-h1)', marginBottom: 'var(--space-3)' }}>
          오늘의 ETF 종합 리포트
        </h1>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          매일 평일 KST 16:00 자동 발행. 거래량·시그널·분배락일·시장 상황을 한 페이지에 정리합니다.
          {report?.date && <> · 발행일: {report.date}</>}
        </p>
      </header>

      <TodayReport report={report} />
    </article>
  );
}
