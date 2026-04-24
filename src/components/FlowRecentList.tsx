import Link from 'next/link';
import type { Post } from '@/lib/posts';

interface Props {
  posts: Post[];
}

export default function FlowRecentList({ posts }: Props) {
  return (
    <section className="flow-recent">
      <div className="pulse-section-head">
        <h2 className="pulse-section-title">최근 자금 흐름 리포트</h2>
        <p className="pulse-section-hint">총 {posts.length}편</p>
      </div>
      {posts.length === 0 ? (
        <p className="pulse-section-empty">아직 발행된 글이 없습니다.</p>
      ) : (
        <ul className="pulse-archive-list">
          {posts.map(p => (
            <li key={p.meta.slug}>
              <Link href={`/${p.meta.category}/${p.meta.slug}`} className="pulse-archive-row">
                <span className="pulse-archive-date">
                  {new Date(p.meta.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                </span>
                <span className="pulse-archive-title">{p.meta.title}</span>
                <span className="pulse-archive-meta">{p.readingTime}분</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
