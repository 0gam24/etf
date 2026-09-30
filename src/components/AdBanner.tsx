'use client';

import { useEffect, useRef, useState } from 'react';
import { ADSENSE_PUB_ID } from '@/lib/ads';

interface AdBannerProps {
  slot: string; // 애드센스 광고 슬롯 ID (AD_SLOTS.* — src/lib/ads.ts)
  format?: 'auto' | 'fluid' | 'rectangle';
  style?: React.CSSProperties;
}

/**
 * 💰 애드센스 광고 배너 컴포넌트
 *
 *   ⚡ LCP 최적화 — IntersectionObserver lazy hydrate (Phase 1 C2):
 *     - 뷰포트 진입 200px 전부터 adsbygoogle.push() 호출
 *     - 초기 로드 시 광고 요청 X → LCP·FID·INP 모두 개선
 *     - 모바일 환경에서 특히 효과 큼 (광고가 LCP element가 되는 패턴 회피)
 *
 *   pub id는 layout 자동 광고 로더와 같은 src/lib/ads.ts 값을 쓴다.
 *   slot이 비었거나 pub id가 없으면 아무것도 그리지 않는다(빈 광고 틀·가짜 ID 요청 방지).
 */
export default function AdBanner({ slot, format = 'auto', style }: AdBannerProps) {
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
    <div ref={ref} className="ad-wrapper" style={{ margin: '2rem 0', textAlign: 'center', overflow: 'hidden', minHeight: '90px' }}>
      {hydrated ? (
        <ins
          className="adsbygoogle"
          style={style || { display: 'block' }}
          data-ad-client={pubId}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      ) : (
        // CLS 방지 — hydrate 전 placeholder가 광고와 동일한 공간 점유
        <div style={{ minHeight: '90px' }} aria-hidden />
      )}
      {/* 개발 환경에서만 placeholder 표시 (production은 실 광고 또는 빈 영역) */}
      {process.env.NODE_ENV !== 'production' && hydrated && (
        <div className="ad-placeholder">
          <span className="ad-badge">[DEV] AD AREA</span>
        </div>
      )}
    </div>
  );
}
