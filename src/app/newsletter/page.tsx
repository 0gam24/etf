import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import NewsletterSignup from '@/components/NewsletterSignup';
import { buildPageMetadata } from '@/lib/site-meta';

// 2026-09-30: 이메일 발송 백엔드가 없어 '매일 아침 9시 이메일' 약속을 지킬 수 없었다.
//   이메일 입력 폼을 없애고(NewsletterSignup 주석 참고) 실제로 동작하는 RSS 구독 안내 페이지로 바꾼다.
//   URL(/newsletter)은 외부 링크·색인 보존을 위해 그대로 둔다.
export const metadata: Metadata = buildPageMetadata({
  title: '뉴스레터·RSS 구독: 새 ETF 가이드 받아보기',
  description:
    '지금은 이메일 뉴스레터를 보내지 않습니다. 새로 올라오는 ETF·연금·세금 가이드와 비교 페이지는 RSS 피드로 가장 먼저 받아볼 수 있습니다. Feedly 같은 RSS 리더에 주소 하나만 등록해 두면 새 글이 올라올 때마다 리더가 알아서 가져옵니다.',
  url: '/newsletter',
  keywords: ['ETF 뉴스레터', 'ETF RSS 구독', 'ETF 가이드 구독', 'ETF 소식 받기'],
});

export default function NewsletterPage() {
  return (
    <article className="about-page animate-fade-in">
      <Breadcrumbs items={[{ name: '홈', href: '/' }, { name: '뉴스레터', href: '/newsletter' }]} />

      <header className="about-hero">
        <div className="about-eyebrow">NEWSLETTER · 구독</div>
        <h1 className="about-title">새 ETF 가이드, RSS로 가장 먼저 받아보기</h1>
        <p className="about-tagline">
          이메일 뉴스레터는 지금 보내지 않습니다. 새로 올라오는 가이드는 RSS를 구독하면
          빠짐없이 받아볼 수 있습니다.
        </p>
      </header>

      <NewsletterSignup variant="full" />

      <section className="about-section">
        <h2 className="about-h2">RSS에 담기는 글</h2>
        <ul className="about-list">
          <li>
            <strong>새 가이드</strong>: ETF·연금·세금 궁금증에 국세청·금감원·KRX 같은 1차 출처로 답한 글.
          </li>
          <li>
            <strong>본문 전체</strong>: 요약만이 아니라 핵심 포인트·비교표·자주 묻는 질문까지 리더에서 바로 읽을 수 있습니다.
          </li>
        </ul>
      </section>

      <section className="about-section">
        <h2 className="about-h2">이메일 뉴스레터 시작 시점</h2>
        <p className="about-desc">
          정해진 시작일은 없습니다. 이메일 발송을 시작하게 되면 이 페이지에서 먼저 알려 드리겠습니다.
          그 전까지 이 페이지는 이메일 주소를 받지 않습니다.
        </p>
      </section>

      <section className="about-section">
        <h2 className="about-h2">개인정보 처리</h2>
        <p className="about-desc">
          RSS 구독에는 이름이나 이메일 같은 개인정보가 필요 없습니다. 사이트 전반의 개인정보 처리 기준은{' '}
          <Link href="/privacy">개인정보처리방침</Link>에서 확인할 수 있습니다.
        </p>
      </section>
    </article>
  );
}
