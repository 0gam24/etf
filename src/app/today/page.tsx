import fs from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import TodayReport from './TodayReport';
import { jsonLd } from '@/lib/schema';
import Breadcrumbs from '@/components/Breadcrumbs';
import FreshnessPill from '@/components/FreshnessPill';
import { buildPageMetadata } from '@/lib/site-meta';

function loadLatest() {
  try {
    const file = path.join(process.cwd(), 'data', 'today', 'latest.json');
    if (!fs.existsSync(file)) return null;
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch {
    return null;
  }
}

export const metadata: Metadata = buildPageMetadata({
  title: '오늘의 ETF 종합 리포트',
  description: '오늘 거래량 상위 종목과 상승·하락 상위 ETF, 분배락일이 임박한 종목을 한 페이지에 모았습니다. 장 마감 뒤 확정된 KRX 종가 기준으로 매일 평일 오후 4시에 갱신합니다.',
  url: '/today',
});

export default function TodayPage() {
  const report = loadLatest();

  return (
    <article style={{ maxWidth: '64rem', margin: '0 auto', padding: 'var(--space-8) var(--space-6)' }}>
      <Breadcrumbs items={[
        { name: '홈', href: '/' },
        { name: '오늘의 리포트', href: '/today' },
      ]} />

      <header style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--accent-gold)', textTransform: 'uppercase' }}>
            TODAY · DAILY SNAPSHOT
          </span>
          {report?.date && (
            <FreshnessPill isoDate={`${report.date}T16:00:00+09:00`} />
          )}
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
