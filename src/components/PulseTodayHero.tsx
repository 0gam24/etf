import Link from 'next/link';
import { Zap, ArrowRight } from 'lucide-react';
import type { Post } from '@/lib/posts';
import { extractPulseBullets, freshnessLabel } from '@/lib/pulse';

interface Props {
  today: Post | null;
}

/**
 * 마지막 글 뒤로 이 일수 이상 새 글이 없으면 '지난 기록'으로 안내한다.
 *   주말·연휴 공백(최대 5~6일)에는 안내가 뜨지 않도록 넉넉히 잡는다.
 */
const ARCHIVE_AFTER_DAYS = 7;

/** KST 달력 기준 발행 후 경과 일수 (자정 직후 ms 차이 0 → 0일 전 표시 버그 회피용 date string 계산) */
function kstDaysAgo(isoDate?: string): number | null {
  if (!isoDate) return null;
  const pub = new Date(isoDate);
  if (isNaN(pub.getTime())) return null;
  const kstDay = (d: Date) => new Date(d.getTime() + 9 * 3600 * 1000).toISOString().slice(0, 10);
  const pubMidnight = new Date(`${kstDay(pub)}T00:00:00Z`).getTime();
  const nowMidnight = new Date(`${kstDay(new Date())}T00:00:00Z`).getTime();
  return Math.round((nowMidnight - pubMidnight) / 86400000);
}

/**
 * 시황 코너(관전포인트·속보 등)의 마지막 글이 오래됐으면 그 날짜 라벨('2026년 6월 13일')을,
 * 최근 글이 있으면 null을 돌려준다. 새 글이 다시 올라오면 안내는 저절로 사라진다.
 */
export function archivedSinceLabel(latestIsoDate?: string): string | null {
  const days = kstDaysAgo(latestIsoDate);
  if (days === null || days < ARCHIVE_AFTER_DAYS) return null;
  return new Date(latestIsoDate as string).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Seoul',
  });
}

/** 메인 HomeBreakingStrip 와 통일 — KST 기준 오늘/어제/N일 전 발행 pill */
function freshnessPill(isoDate?: string): { label: string; tone: 'fresh' | 'stale' } {
  const diff = kstDaysAgo(isoDate);
  if (diff === null) return { label: '발행일 미상', tone: 'stale' };
  if (diff <= 0) return { label: '🔴 오늘 발행', tone: 'fresh' };
  if (diff === 1) return { label: '📅 어제 발행', tone: 'stale' };
  return { label: `📅 ${diff}일 전 발행`, tone: 'stale' };
}

export default function PulseTodayHero({ today }: Props) {
  if (!today) {
    return (
      <section className="pulse-today-hero pulse-today-hero-empty">
        <p>
          아직 표시할 관전포인트가 없습니다. 새 글은 매일 아침{' '}
          <Link href="/guide">ETF 가이드</Link>에 올라옵니다.
        </p>
      </section>
    );
  }

  const bullets = extractPulseBullets(today, 3);
  const publishedAt = new Date(today.meta.date);
  const tickers = (today.meta.tickers || []).slice(0, 3);
  const fresh = freshnessPill(today.meta.date);
  const archivedSince = archivedSinceLabel(today.meta.date);

  return (
    <section className="pulse-today-hero">
      <div className="pulse-today-hero-bg" aria-hidden />
      <div className="pulse-today-hero-inner">
        <div className="pulse-today-hero-top">
          <span className="pulse-today-badge">
            <Zap size={14} strokeWidth={3} aria-hidden /> {archivedSince ? 'LATEST PULSE' : "TODAY'S PULSE"}
          </span>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.15rem 0.5rem',
            borderRadius: '0.3rem',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.02em',
            background: fresh.tone === 'fresh' ? 'rgba(239,68,68,0.18)' : 'rgba(96,165,250,0.15)',
            color: fresh.tone === 'fresh' ? '#EF4444' : '#60A5FA',
          }}>{fresh.label}</span>
          <span className="pulse-today-freshness">
            {publishedAt.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
            <span className="pulse-today-dot" aria-hidden />
            {freshnessLabel(today.meta.date)} 발행
          </span>
        </div>

        {archivedSince && (
          <p className="etf-dict-status-banner" role="note" style={{ marginTop: 0, marginBottom: 'var(--space-4)' }}>
            관전포인트 브리핑은 {archivedSince}까지 발행된 지난 기록입니다.
            새 글은 매일 아침 <Link href="/guide">ETF 가이드</Link>에 올라옵니다.
          </p>
        )}

        <h1 className="pulse-today-headline">{today.meta.title.replace(/—.*$/, '').trim()}</h1>

        {bullets.length > 0 && (
          <ol className="pulse-today-bullets">
            {bullets.map((b, i) => (
              <li key={i}>
                <span className="pulse-today-bullet-num">{i + 1}</span>
                <span>{b}</span>
              </li>
            ))}
          </ol>
        )}

        {tickers.length > 0 && (
          <div className="pulse-today-chips">
            <span className="pulse-today-chips-label">{archivedSince ? '이 브리핑의 핵심 ETF' : '오늘의 핵심 ETF'}</span>
            {tickers.map(t => (
              <span key={t} className="pulse-today-chip">{t}</span>
            ))}
          </div>
        )}

        <Link href={`/${today.meta.category}/${today.meta.slug}`} className="pulse-today-cta">
          전체 브리핑 읽기 <ArrowRight size={16} strokeWidth={2.5} />
        </Link>
      </div>
    </section>
  );
}
