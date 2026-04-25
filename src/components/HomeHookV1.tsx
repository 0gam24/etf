import { Noto_Serif_KR } from 'next/font/google';
import type { HookCopy } from '@/lib/hook';

const serifKr = Noto_Serif_KR({
  subsets: ['latin'],
  weight: ['500', '700'],
  display: 'swap',
});

interface Props {
  hook: HookCopy;
}

/**
 * Chapter 1 — 메인 페이지 진입 후 첫 시각 정보.
 *   "오늘의 단 한 문장"을 큰 세리프로 보여주고, 작은 산세리프 캡션으로 출처 한 줄.
 *   목적: 시청자가 5초 안에 오늘의 시장 톤을 한 호흡으로 인지.
 */
export default function HomeHookV1({ hook }: Props) {
  return (
    <section className="home-hook" aria-label="오늘의 한 문장">
      <div className="home-hook-inner">
        <p className={`home-hook-line ${serifKr.className}`}>{hook.line}</p>
        <p className="home-hook-caption">{hook.caption}</p>
      </div>
    </section>
  );
}
