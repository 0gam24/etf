import Link from 'next/link';
import { Rss } from 'lucide-react';

interface Props {
  /** 'compact' = 푸터·사이드바, 'full' = /newsletter 페이지 */
  variant?: 'compact' | 'full';
}

/**
 * 새 글 받아보기 안내 — RSS 구독 중심.
 *
 *   2026-09-30: 이메일 입력 폼 제거.
 *   - 이메일 발송 백엔드가 없다 (src/app/api 아래 뉴스레터 라우트·저장소 없음.
 *     /api/push/subscribe 는 브라우저 웹푸시 전용이라 이메일과 무관).
 *   - 기존 폼은 입력한 이메일을 방문자 본인 브라우저(localStorage)에만 남겨,
 *     운영 측은 주소를 받을 수 없었다. 그런데도 '첫 호 발행 시 이 이메일로 안내'를 약속해
 *     지킬 수 없는 약속이 되어 있었다.
 *   → 폼을 없애고 지금 실제로 동작하는 RSS 구독 안내로 대체한다.
 *     발송 백엔드(주소 저장 + 발송 서비스)를 붙이면 그때 폼을 다시 연다.
 */
export default function NewsletterSignup({ variant = 'compact' }: Props) {
  if (variant === 'compact') {
    return (
      <div className="newsletter-compact">
        <div className="newsletter-compact-head">
          <Rss size={14} strokeWidth={2.4} aria-hidden /> 새 가이드 받아보기
        </div>
        <p className="newsletter-compact-desc">
          매일 아침 올라오는 새 가이드를 RSS로 받아보세요. 이메일 뉴스레터는 지금 운영하지 않습니다.
        </p>
        <a
          href="/rss.xml"
          className="newsletter-compact-cta"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Rss size={13} strokeWidth={2.5} aria-hidden /> RSS 구독
        </a>
        <Link href="/feeds" className="newsletter-compact-link">
          구독 방법 자세히 보기 →
        </Link>
      </div>
    );
  }

  // full variant — /newsletter 페이지 상단
  return (
    <section className="about-section" aria-label="RSS로 새 글 받아보기">
      <h2 className="about-h2">RSS로 새 가이드 받아보기</h2>
      <p className="about-desc">
        Feedly·Inoreader 같은 RSS 리더에 아래 주소를 한 번 등록해 두면, 새 가이드가 올라올 때마다
        리더가 알아서 받아 옵니다. 이메일 주소 같은 개인정보를 입력할 필요가 없습니다.
      </p>
      <a
        href="/rss.xml"
        target="_blank"
        rel="noopener noreferrer"
        className="pulse-today-cta"
      >
        <Rss size={16} strokeWidth={2.5} aria-hidden /> Daily ETF Pulse RSS 구독
      </a>
      <p className="about-desc" style={{ marginTop: '1rem', marginBottom: 0 }}>
        Atom·JSON Feed 형식과 분야별 RSS는 <Link href="/feeds">구독 · 피드 안내</Link>에 모아 두었습니다.
      </p>
    </section>
  );
}
