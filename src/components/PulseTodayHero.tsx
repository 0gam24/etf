import Link from 'next/link';
import { Zap, ArrowRight } from 'lucide-react';
import type { Post } from '@/lib/posts';
import { extractPulseBullets, freshnessLabel } from '@/lib/pulse';

interface Props {
  today: Post | null;
}

/** 메인 HomeBreakingStrip 와 통일 — KST 기준 오늘/어제/N일 전 발행 pill */
function freshnessPill(isoDate?: string): { label: string; tone: 'fresh' | 'stale' } {
  if (!isoDate) return { label: '발행일 미상', tone: 'stale' };
  const pub = new Date(isoDate);
  if (isNaN(pub.getTime())) return { label: '발행일 미상', tone: 'stale' };
  const now = new Date();
  const pubKst = new Date(pub.getTime() + 9 * 3600 * 1000);
  const nowKst = new Date(now.getTime() + 9 * 3600 * 1000);
  const pubDay = pubKst.toISOString().slice(0, 10);
  const nowDay = nowKst.toISOString().slice(0, 10);
  if (pubDay === nowDay) return { label: '🔴 오늘 발행', tone: 'fresh' };
  const diff = Math.floor((nowKst.getTime() - pubKst.getTime()) / 86400000);
  if (diff === 1) return { label: '📅 어제 발행', tone: 'stale' };
  return { label: `📅 ${diff}일 전 발행`, tone: 'stale' };
}

export default function PulseTodayHero({ today }: Props) {
  if (!today) {
    return (
      <section className="pulse-today-hero pulse-today-hero-empty">
        <p>오늘의 관전포인트가 곧 올라옵니다. 매일 아침 9시 전 갱신됩니다.</p>
      </section>
    );
  }

  const bullets = extractPulseBullets(today, 3);
  const publishedAt = new Date(today.meta.date);
  const tickers = (today.meta.tickers || []).slice(0, 3);
  const fresh = freshnessPill(today.meta.date);

  return (
    <section className="pulse-today-hero">
      <div className="pulse-today-hero-bg" aria-hidden />
      <div className="pulse-today-hero-inner">
        <div className="pulse-today-hero-top">
          <span className="pulse-today-badge">
            <Zap size={14} strokeWidth={3} aria-hidden /> TODAY&apos;S PULSE
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
            <span className="pulse-today-chips-label">오늘의 핵심 ETF</span>
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
