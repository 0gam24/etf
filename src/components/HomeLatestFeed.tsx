import Link from 'next/link';
import { Clock3, ArrowRight } from 'lucide-react';
import type { HomeFeedItem } from '@/lib/home-feed';
import { formatDateKeyKo } from '@/lib/home-feed';

/**
 * 홈 최신 글 통합 피드 — 전 카테고리(글+가이드) 최신순 리스트.
 *   히어로(오늘 발행)에 이어 "그 전엔 뭐가 올라왔지"를 답하는 영역.
 *   컴팩트 행 리스트로 스캔 속도 우선.
 */
export default function HomeLatestFeed({
  items,
  excludeDateKey,
}: {
  items: HomeFeedItem[];
  /** 히어로에 이미 노출된 발행일(중복 제거용) */
  excludeDateKey?: string;
}) {
  const rows = (excludeDateKey ? items.filter(i => i.dateKey !== excludeDateKey) : items).slice(0, 12);
  if (!rows.length) return null;

  return (
    <section className="dashboard-section home-latest" aria-labelledby="home-latest-title">
      <div className="section-title-group">
        <h2 id="home-latest-title" className="section-title">
          <Clock3 size={18} strokeWidth={2.4} aria-hidden style={{ verticalAlign: '-3px', marginRight: '0.4rem' }} />
          최신 글
        </h2>
        <p className="section-subtitle">모든 카테고리의 새 글을 최신순으로 모았습니다</p>
      </div>

      <ul className="home-latest-list">
        {rows.map(item => (
          <li key={item.href} className="home-latest-row">
            <Link href={item.href} prefetch={false} className="home-latest-link">
              <span className={`badge badge-${item.kind === 'guide' ? 'guide' : item.category} home-latest-badge`}>
                {item.kind === 'guide' ? '가이드' : item.categoryName}
              </span>
              <span className="home-latest-title">{item.title}</span>
              <time className="home-latest-date" dateTime={item.dateKey}>
                {formatDateKeyKo(item.dateKey)}
              </time>
            </Link>
          </li>
        ))}
      </ul>

      <div className="home-latest-more">
        <Link href="/guide/latest" prefetch={false} className="home-latest-more-link">
          전체 가이드 발행순 보기 <ArrowRight size={13} strokeWidth={2.5} aria-hidden />
        </Link>
      </div>
    </section>
  );
}
