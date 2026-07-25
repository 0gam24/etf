'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

// 네이버 애널리틱스(wcslog) 사이트 ID — 페이지 소스에 공개되는 추적 ID (비밀 아님, GA4·AdSense ID와 동일 성격).
const NAVER_WA_ID = '17d0ece340ad880';

/** wcslog.js 로드 후 현재 페이지뷰를 네이버 애널리틱스로 전송 */
function fireWcs() {
  const w = window as unknown as {
    wcs?: unknown;
    wcs_add?: Record<string, string>;
    wcs_do?: () => void;
  };
  if (!w.wcs || typeof w.wcs_do !== 'function') return;
  w.wcs_add = w.wcs_add || {};
  w.wcs_add['wa'] = NAVER_WA_ID;
  w.wcs_do();
}

/**
 * 네이버 애널리틱스 설치.
 *   - 최초 로드: wcslog.js onLoad에서 첫 페이지뷰 전송
 *   - SPA 네비게이션: pathname 변경마다 재전송 (App Router는 이동 시 스크립트를 재실행하지
 *     않으므로, 이게 없으면 첫 페이지뷰만 집계되고 이후 이동은 누락된다)
 */
export default function NaverAnalytics() {
  const pathname = usePathname();
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) fireWcs();
  }, [pathname]);

  return (
    <Script
      id="naver-analytics"
      src="https://wcs.pstatic.net/wcslog.js"
      strategy="afterInteractive"
      onLoad={() => {
        loaded.current = true;
        fireWcs();
      }}
    />
  );
}
