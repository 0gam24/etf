'use client';

import { useEffect, useState } from 'react';

interface EtfItem {
  code: string;
  name: string;
  price: number;
  changeRate: number;
}

interface EtfApiResponse {
  trending: EtfItem[];
  topGainers: EtfItem[];
  topLosers: EtfItem[];
}

/** 상단 라이브 티커 스트립 — 거래량 TOP·상승·하락을 마키로 흘림 */
export default function TickerStrip() {
  const [items, setItems] = useState<EtfItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/etf');
        if (!res.ok) return;
        const data: EtfApiResponse = await res.json();
        if (cancelled) return;
        const mix = [
          ...(data.trending || []).slice(0, 6),
          ...(data.topGainers || []).slice(0, 4),
          ...(data.topLosers || []).slice(0, 4),
        ];
        setItems(mix);
      } catch {
        /* silent */
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (items.length === 0) {
    return (
      <div className="ticker-strip" aria-label="실시간 ETF 티커">
        <div className="ticker-strip-label">LIVE</div>
        <div className="ticker-track">
          <span className="ticker-item" style={{ color: 'var(--text-dim)' }}>실시간 ETF 데이터 로드 중…</span>
        </div>
      </div>
    );
  }

  // 무한 스크롤을 위해 2번 반복
  const doubled = [...items, ...items];

  return (
    <div className="ticker-strip" aria-label="실시간 ETF 티커">
      <div className="ticker-strip-label">
        <span>LIVE</span>
      </div>
      <div className="ticker-track">
        {doubled.map((etf, idx) => {
          const up = etf.changeRate >= 0;
          return (
            <span key={`${etf.code}-${idx}`} className="ticker-item">
              <span className="ticker-item-name">{etf.name}</span>
              <span className="ticker-item-price">{etf.price.toLocaleString()}</span>
              <span className={up ? 'ticker-up' : 'ticker-down'}>
                {up ? '▲' : '▼'} {Math.abs(etf.changeRate).toFixed(2)}%
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
