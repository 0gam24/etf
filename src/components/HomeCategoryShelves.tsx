import Link from 'next/link';
import { ArrowRight, LayoutGrid } from 'lucide-react';
import type { CategoryShelf } from '@/lib/home-feed';
import { formatDateKeyKo } from '@/lib/home-feed';

/**
 * 홈 카테고리별 선반 — 헤더 메뉴 순서대로 카테고리당 최근 글 N편.
 *   각 선반 헤더가 카테고리 인덱스로 가는 내부 링크 허브 역할.
 */
export default function HomeCategoryShelves({ shelves }: { shelves: CategoryShelf[] }) {
  if (!shelves.length) return null;

  return (
    <section className="dashboard-section home-shelves" aria-labelledby="home-shelves-title">
      <div className="section-title-group">
        <h2 id="home-shelves-title" className="section-title">
          <LayoutGrid size={18} strokeWidth={2.4} aria-hidden style={{ verticalAlign: '-3px', marginRight: '0.4rem' }} />
          카테고리별 최신
        </h2>
        <p className="section-subtitle">투자 가이드부터 속보·자금 흐름까지, 주제별 최근 글</p>
      </div>

      <div className="home-shelves-grid">
        {shelves.map(shelf => (
          <div key={shelf.category} className="home-shelf">
            <div className="home-shelf-head">
              <h3 className="home-shelf-title">{shelf.label}</h3>
              <Link href={shelf.href} prefetch={false} className="home-shelf-more">
                {shelf.total}편 전체 <ArrowRight size={12} strokeWidth={2.5} aria-hidden />
              </Link>
            </div>
            <ul className="home-shelf-list">
              {shelf.items.map(item => (
                <li key={item.href}>
                  <Link href={item.href} prefetch={false} className="home-shelf-item">
                    <span className="home-shelf-item-title">{item.title}</span>
                    <time className="home-shelf-item-date" dateTime={item.dateKey}>
                      {formatDateKeyKo(item.dateKey)}
                    </time>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
