'use client';

import { useEffect, useRef, useState } from 'react';
import { ADSENSE_PUB_ID } from '@/lib/ads';

interface AdBannerProps {
  slot: string; // 애드센스 광고 슬롯 ID (AD_SLOTS.* — src/lib/ads.ts)
  format?: 'auto' | 'fluid' | 'rectangle';
  style?: React.CSSProperties;
  /** 배치 위치 구분용 클래스(여백 조정 등). 광고 모양을 콘텐츠처럼 꾸미는 데 쓰지 않는다. */
  className?: string;
}

/**
 * 💰 애드센스 수동 광고 단위
 *
 *   ⚡ LCP 최적화 — IntersectionObserver lazy hydrate (Phase 1 C2):
 *     - 뷰포트 진입 200px 전부터 adsbygoogle.push() 호출
 *     - 초기 로드 시 광고 요청 X → LCP·FID·INP 모두 개선
 *     - 모바일 환경에서 특히 효과 큼 (광고가 LCP element가 되는 패턴 회피)
 *
 *   pub id는 layout 자동 광고 로더와 같은 src/lib/ads.ts 값을 쓴다.
 *   slot이 비었거나 pub id가 없으면 아무것도 그리지 않는다(빈 광고 틀·가짜 ID 요청 방지).
 *
 *   콘텐츠와 구분 (2026-10-06):
 *     - 광고 위에 '광고' 라벨. AdSense 정책상 허용 문구는 '광고' 또는 '스폰서 링크'뿐이다
 *       (https://support.google.com/adsense/answer/1346295?hl=ko). 클릭을 권하는 문구는 붙이지 않는다.
 *     - 라벨·광고 틀은 globals.css 의 .ad-slot* 클래스. 틀은 처음부터 보이게 둔다
 *       (숨긴 채 요청하면 AdSense가 요청을 건너뛸 수 있다). 채울 광고가 없을 때만
 *       data-ad-status="unfilled" 를 보고 CSS가 통째로 접는다
 *       (https://support.google.com/adsense/answer/10762946).
 *     - CLS 방지: .ad-slot-frame 의 min-height 가 hydrate 전후 같은 공간을 잡는다.
 */
export default function AdBanner({ slot, format = 'auto', style, className }: AdBannerProps) {
  const pubId = ADSENSE_PUB_ID;
  const enabled = Boolean(slot && slot.trim() && pubId);
  const ref = useRef<HTMLDivElement>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!enabled || !ref.current || hydrated) return;
    if (typeof IntersectionObserver === 'undefined') {
      // 구형 브라우저 폴백 — 즉시 로드
      setHydrated(true);
      return;
    }
    const obs = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setHydrated(true);
            obs.disconnect();
            break;
          }
        }
      },
      { rootMargin: '200px 0px' }, // 뷰포트 200px 위에서 미리 로드
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [enabled, hydrated]);

  useEffect(() => {
    if (!enabled || !hydrated) return;
    try {
      // @ts-expect-error — adsbygoogle 글로벌 (window.adsbygoogle)
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('애드센스 로드 실패:', err);
    }
  }, [enabled, hydrated]);

  // 훅 호출 순서를 지키기 위해 조기 반환은 훅 뒤에 둔다.
  if (!enabled) return null;

  return (
    <aside className={className ? `ad-slot ${className}` : 'ad-slot'} aria-label="광고">
      <span className="ad-slot-label" aria-hidden="true">광고</span>
      <div ref={ref} className="ad-slot-frame">
        {hydrated ? (
          <ins
            className="adsbygoogle"
            style={style || { display: 'block' }}
            data-ad-client={pubId}
            data-ad-slot={slot}
            data-ad-format={format}
            data-full-width-responsive="true"
          />
        ) : null}
        {/* 개발 환경에서만 자리 표시 (production은 실 광고 또는 빈 영역) */}
        {process.env.NODE_ENV !== 'production' && hydrated && (
          <div className="ad-placeholder">
            <span className="ad-badge">[DEV] AD AREA</span>
          </div>
        )}
      </div>
    </aside>
  );
}
