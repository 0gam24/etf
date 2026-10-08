import fs from 'node:fs';
import path from 'node:path';
import Link from 'next/link';
import type { Metadata } from 'next';
import TodayReport from './TodayReport';
import { jsonLd } from '@/lib/schema';
import Breadcrumbs from '@/components/Breadcrumbs';
import FreshnessPill from '@/components/FreshnessPill';
import { buildPageMetadata, RETIRED_ROBOTS } from '@/lib/site-meta';

function loadLatest() {
  try {
    const file = path.join(process.cwd(), 'data', 'today', 'latest.json');
    if (!fs.existsSync(file)) return null;
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch {
    return null;
  }
}

/**
 * 리포트의 KRX 종가 기준일 (YYYY-MM-DD).
 *   baseDate(YYYYMMDD, 시세 기준 거래일)를 우선 쓰고, 없으면 리포트 작성일(date)로 대신한다.
 *   '오늘' 갱신을 약속하지 않고 기준일을 그대로 보여 주기 위함 (2026-09-30).
 */
function reportBaseDate(report: { date?: string; baseDate?: string } | null): string | null {
  if (!report) return null;
  const b = String(report.baseDate || '');
  if (/^\d{8}$/.test(b)) return `${b.slice(0, 4)}-${b.slice(4, 6)}-${b.slice(6, 8)}`;
  return report.date || null;
}

export function generateMetadata(): Metadata {
  const baseDate = reportBaseDate(loadLatest());
  return buildPageMetadata({
    robots: RETIRED_ROBOTS, // 2026-10-08 시세 기반 일일 리포트 은퇴 (site-meta 주석)
    title: '오늘의 ETF 종합 리포트',
    description: baseDate
      ? `${baseDate} KRX 종가 기준으로 거래량 상위 종목과 상승·하락 상위 ETF, 분배락일이 가까웠던 종목을 한 페이지에 모은 종합 리포트입니다. 기준일 이후의 시세 변화는 반영되지 않았으니 매매 전 최신 시세를 따로 확인하세요.`
      : '거래량 상위 종목과 상승·하락 상위 ETF, 분배락일이 가까운 종목을 KRX 종가 기준으로 한 페이지에 모은 종합 리포트입니다. 각 리포트에 표시된 기준일 이후의 시세 변화는 반영되지 않았으니 매매 전 최신 시세를 따로 확인하세요.',
    url: '/today',
    keywords: ['오늘의 ETF 종합', 'ETF 거래량 순위', 'ETF 상승률 순위', '오늘 ETF 시세', '분배락 임박 ETF'],
  });
}

export default function TodayPage() {
  const report = loadLatest();
  const baseDate = reportBaseDate(report);

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
          거래량·시그널·분배락일·시장 상황을 한 페이지에 정리한 리포트입니다.
          {baseDate && <> {baseDate} KRX 종가 기준이며, 이후의 시세 변화는 반영되지 않았습니다.</>}
          {' '}새 글은 매일 아침 <Link href="/guide">ETF 가이드</Link>에 올라옵니다.
        </p>
      </header>

      <TodayReport report={report} />
    </article>
  );
}
