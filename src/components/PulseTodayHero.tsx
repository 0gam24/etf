import Link from 'next/link';
import { Zap, ArrowRight } from 'lucide-react';
import type { Post } from '@/lib/posts';
import { extractPulseBullets, freshnessLabel } from '@/lib/pulse';

interface Props {
  today: Post | null;
}

export default function PulseTodayHero({ today }: Props) {
  if (!today) {
    return (
      <section className="pulse-today-hero pulse-today-hero-empty">
        <p>오늘의 관전포인트가 아직 발행되지 않았습니다. 매일 오전 9시 전 자동 발행됩니다.</p>
      </section>
    );
  }

  const bullets = extractPulseBullets(today, 3);
  const publishedAt = new Date(today.meta.date);
  const tickers = (today.meta.tickers || []).slice(0, 3);

  return (
    <section className="pulse-today-hero">
      <div className="pulse-today-hero-bg" aria-hidden />
      <div className="pulse-today-hero-inner">
        <div className="pulse-today-hero-top">
          <span className="pulse-today-badge">
            <Zap size={14} strokeWidth={3} aria-hidden /> TODAY&apos;S PULSE
          </span>
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
