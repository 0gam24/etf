import Link from 'next/link';
import { Quote, ArrowRight } from 'lucide-react';
import type { Author } from '@/lib/authors';

interface Props {
  author: Author;
  /** 오늘의 voiceHints 한 줄 (서버에서 미리 골라 전달) */
  voiceLine: string;
  /** 작가 카드 클릭 시 이동할 경로 (보통 `/author/{id}`) */
  href: string;
  /** 부제 라벨 (예: "오늘의 칼럼니스트") */
  caption?: string;
}

/**
 * Chapter 6 — INSIGHT.
 *   거래량 1위 ETF의 섹터/카테고리에 가장 적합한 1인 페르소나를 골라
 *   해당 인물의 voiceHints에서 한 줄을 인용하는 형태.
 *   목적: 데이터 다음에 "사람의 손길"을 보여 신뢰 곡선을 한 번 더 끌어올림.
 */
export default function HomeDailyAuthor({ author, voiceLine, href, caption = '오늘의 칼럼니스트' }: Props) {
  return (
    <section className="home-daily-author" aria-label="오늘의 칼럼니스트">
      <div className="home-daily-author-inner">
        <div
          className="home-daily-author-avatar"
          style={{ '--accent': author.accent } as React.CSSProperties}
          aria-hidden
        >
          {author.name.slice(0, 1)}
        </div>

        <div className="home-daily-author-body">
          <div className="home-daily-author-eyebrow">{caption}</div>
          <blockquote className="home-daily-author-quote">
            <Quote size={18} strokeWidth={2.4} aria-hidden className="home-daily-author-quote-icon" />
            <span>{voiceLine}</span>
          </blockquote>
          <div className="home-daily-author-meta">
            <strong className="home-daily-author-name">{author.name}</strong>
            <span className="home-daily-author-title">{author.title}</span>
          </div>
          <Link href={href} className="home-daily-author-cta" prefetch={false}>
            저자 프로필과 다른 글 보기 <ArrowRight size={13} strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </section>
  );
}
