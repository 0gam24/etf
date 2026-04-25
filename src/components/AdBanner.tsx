'use client';

import { useEffect } from 'react';

interface AdBannerProps {
  slot: string; // 애드센스 광고 슬롯 ID
  format?: 'auto' | 'fluid' | 'rectangle';
  style?: React.CSSProperties;
}

/**
 * 💰 애드센스 광고 배너 컴포넌트
 * 
 * 실제 배포 시에는 pub-id 등을 환경변수에서 읽어와 적용합니다.
 */
export default function AdBanner({ slot, format = 'auto', style }: AdBannerProps) {
  useEffect(() => {
    try {
      // @ts-ignore: 구글 애드센스 스크립트 실행
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('애드센스 로드 실패:', err);
    }
  }, []);

  const pubId = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID || 'ca-pub-xxxxxxxxxxxxxx';

  return (
    <div className="ad-wrapper" style={{ margin: '2rem 0', textAlign: 'center', overflow: 'hidden' }}>
      <ins
        className="adsbygoogle"
        style={style || { display: 'block' }}
        data-ad-client={pubId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
      {/* 개발 환경에서만 placeholder 표시 (production은 실 광고 또는 빈 영역) */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="ad-placeholder">
          <span className="ad-badge">[DEV] AD AREA</span>
        </div>
      )}
    </div>
  );
}
