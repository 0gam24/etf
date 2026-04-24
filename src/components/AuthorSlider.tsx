import Link from 'next/link';
import { ArrowRight, Users } from 'lucide-react';
import type { Author } from '@/lib/authors';

interface Props {
  authors: Author[];
}

export default function AuthorSlider({ authors }: Props) {
  return (
    <section className="author-slider" aria-label="저자 소개">
      <div className="author-slider-head">
        <div className="author-slider-eyebrow">
          <Users size={13} strokeWidth={2.4} aria-hidden /> WHO WRITES THIS
        </div>
        <h2 className="author-slider-title">
          {authors.length}명의 실전 투자자가 매일 분석합니다
        </h2>
        <p className="author-slider-sub">
          전직 PB·증권사 애널리스트, 워킹맘·전업주부, 자영업자·엔지니어 — 자기 자산을 직접 굴리는 사람들의 글입니다.
        </p>
      </div>

      <div className="author-slider-rail-wrap">
        <div className="author-slider-rail">
          {authors.map(a => (
            <Link
              key={a.id}
              href={`/author/${a.id}`}
              className="author-card"
              style={{ '--accent': a.accent } as React.CSSProperties}
              prefetch={false}
            >
              <div className="author-card-top">
                <div className="author-card-avatar" aria-hidden>
                  {a.name.charAt(0)}
                </div>
                <div className="author-card-name-row">
                  <span className="author-card-name">{a.name}</span>
                  <span className="author-card-age">{a.age}세</span>
                </div>
              </div>
              <div className="author-card-title">{a.title}</div>
              <div className="author-card-tags">
                {a.expertise.slice(0, 3).map(e => (
                  <span key={e} className="author-card-tag">{e}</span>
                ))}
              </div>
              <div className="author-card-cta">
                프로필 보기 <ArrowRight size={12} strokeWidth={2.5} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
