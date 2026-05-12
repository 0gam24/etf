import { Noto_Serif_KR } from 'next/font/google';
import type { HookCopy } from '@/lib/hook';
import LiveHookContent from './LiveHookContent';

const serifKr = Noto_Serif_KR({
  subsets: ['latin'],
  weight: ['500', '700'],
  display: 'swap',
});

interface BaselineEtf {
  code: string;
  name: string;
  changeRate?: number;
  volume?: number;
}

interface CategoryInfo {
  name: string;
  avgChange: number;
}

interface Props {
  hook: HookCopy;
  /** 실시간 재계산용 baseline (top10) */
  baseline?: BaselineEtf[];
  /** 카테고리 (SSR initial) */
  initialCategories?: CategoryInfo[];
  /** 분석 종목 총 개수 */
  totalCount?: number;
}

/**
 * Chapter 1 — 메인 페이지 진입 후 첫 시각 정보.
 *   "오늘의 단 한 문장"을 큰 세리프로 보여주고, 작은 산세리프 캡션으로 출처 한 줄.
 *   목적: 시청자가 5초 안에 오늘의 시장 톤을 한 호흡으로 인지.
 *
 *   ▶ server component (next/font 적용) → 자식 LiveHookContent (client) 가 30s polling
 *     으로 hook 한 문장 라이브 재생성. polling 실패 / pre_open 등에서는 SSR initial 유지.
 */
export default function HomeHookV1({ hook, baseline, initialCategories, totalCount = 0 }: Props) {
  return (
    <section className="home-hook" aria-label="오늘의 한 문장">
      <div className="home-hook-inner">
        <LiveHookContent
          initial={hook}
          serifClassName={serifKr.className}
          baseline={baseline}
          initialCategories={initialCategories}
          totalCount={totalCount}
        />
      </div>
    </section>
  );
}
