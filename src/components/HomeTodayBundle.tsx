import Link from 'next/link';
import { CalendarDays, ArrowRight } from 'lucide-react';
import type { LatestBundle } from '@/lib/home-feed';
import { formatDateKeyKo } from '@/lib/home-feed';

/**
 * 홈 히어로 — "오늘 발행" 묶음 전체.
 *   가장 최근 발행일 하루치 글·가이드를 카드 그리드로 노출.
 *   구독자가 "오늘 뭐 올라왔나"를 3초 안에 파악하는 메인 핵심 영역.
 *   각 카드에 AEO 직답(answer)을 재사용해 홈 자체를 색인 가능한 텍스트 허브로 만든다.
 */
export default function HomeTodayBundle({ bundle }: { bundle: LatestBundle }) {
  const dateLabel = formatDateKeyKo(bundle.dateKey);
  const heading = bundle.isToday ? '오늘 발행' : '최근 발행';

  return (
    <section className="home-bundle" aria-labelledby="home-bundle-title">
      <div className="home-bundle-head">
        <span className="home-bundle-eyebrow">
          <CalendarDays size={14} strokeWidth={2.6} aria-hidden /> {bundle.isToday ? 'TODAY' : 'LATEST'} · {dateLabel}
        </span>
        <h2 id="home-bundle-title" className="home-bundle-title">
          {heading} <span className="home-bundle-count">새 글 {bundle.items.length}편</span>
        </h2>
        <p className="home-bundle-sub">
          {dateLabel}에 발행된 분석과 가이드 전체입니다. 매일 새 글이 올라옵니다.
        </p>
      </div>

      <div className="home-bundle-grid">
        {bundle.items.map((item, i) => (
          <Link
            key={item.href}
            href={item.href}
            prefetch={false}
            className="post-card home-bundle-card"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <div className="post-card-meta">
              <span className={`badge badge-${item.kind === 'guide' ? 'guide' : item.category}`}>
                {item.kind === 'guide' ? '가이드' : item.categoryName}
              </span>
              {item.kind === 'guide' && (
                <span className="post-card-date">{item.categoryName}</span>
              )}
              {item.readingTime ? (
                <span className="post-card-date">{item.readingTime}분 읽기</span>
              ) : null}
            </div>
            <h3 className="post-card-title">{item.title}</h3>
            {item.answer ? (
              <p className="home-bundle-answer">{item.answer}</p>
            ) : (
              <p className="post-card-desc">{item.description}</p>
            )}
            <span className="post-card-readmore home-bundle-readmore">
              읽어보기 <ArrowRight size={13} strokeWidth={2.5} aria-hidden />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
