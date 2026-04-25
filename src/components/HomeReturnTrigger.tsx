import Link from 'next/link';
import { CalendarClock, ArrowRight } from 'lucide-react';
import type { TickerDiff } from '@/lib/pulse';
import PulseDiff from './PulseDiff';

interface Props {
  diff: TickerDiff;
  hasYesterday: boolean;
  /** 오늘의 pulse 글 링크 (있으면 CTA로 노출) */
  todayPulseHref?: string;
}

/**
 * Chapter 8 — TOMORROW.
 *   "어제 대비 오늘 어떤 종목이 새로 등장했고, 어떤 흐름이 끊겼는가"를
 *   메인 페이지로 끌어올려 시청자에게 "내일도 다시 와야 할 이유"를 만든다.
 *
 *   기존 PulseDiff 컴포넌트를 그대로 재사용하면서 메인용 head/CTA를 덧입힘.
 */
export default function HomeReturnTrigger({ diff, hasYesterday, todayPulseHref }: Props) {
  return (
    <section className="home-return-trigger">
      <div className="home-return-trigger-head">
        <div className="home-return-trigger-eyebrow">
          <CalendarClock size={14} strokeWidth={2.6} aria-hidden /> TOMORROW · 내일도 봐야 할 이유
        </div>
        <h2 className="home-return-trigger-title">
          어제는 보였고, 오늘은 빠졌다 — <span className="accent">흐름의 변곡점</span>
        </h2>
        <p className="home-return-trigger-sub">
          관심 종목이 어디서 새로 들어오고, 어디서 떠났는지 매일 비교합니다.
          내일 9시에 다시 와서 같은 자리를 비교해 보세요.
        </p>
      </div>

      <PulseDiff diff={diff} hasYesterday={hasYesterday} />

      {todayPulseHref && (
        <Link href={todayPulseHref} className="home-return-trigger-cta" prefetch={false}>
          오늘의 풀 브리핑으로 <ArrowRight size={14} strokeWidth={2.5} />
        </Link>
      )}
    </section>
  );
}
