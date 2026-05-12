'use client';

import { useEffect, useState } from 'react';
import LiveDataBadge from './LiveDataBadge';

interface InitialQuote {
  code: string;
  name: string;
  price: number;
  change: number;
  changeRate?: number;
  volume: number;
}

interface Props {
  /** SSR initial — KRX 마감 데이터 */
  initial: InitialQuote;
  /** KRX baseDate (YYYYMMDD) — 폴백 라벨용 */
  baseDate?: string;
}

interface RealtimeQuote {
  code: string;
  price: number;
  change: number;
  changeRate: number;
  volume: number;
}

interface RealtimeResponse {
  quotes: Array<RealtimeQuote | null>;
  marketStatus: 'pre_open' | 'open' | 'closed' | 'holiday';
  source: 'kis' | 'fallback' | 'mock';
  ts: number;
}

/**
 * LiveQuoteTable — Market Snapshot section 의 '거래량 1위' 시세 표.
 *   기존 .dashboard-table 디자인 유지 + 한투 30s polling 으로 가격 갱신.
 *   장중 LiveDataBadge 'LIVE · HH:MM:SS' / 마감 후 'KRX YYYY-MM-DD 종가' 자동 분기.
 */
export default function LiveQuoteTable({ initial, baseDate }: Props) {
  const [quote, setQuote] = useState<InitialQuote>(initial);
  const [marketStatus, setMarketStatus] = useState<RealtimeResponse['marketStatus']>('closed');
  const [liveSource, setLiveSource] = useState<RealtimeResponse['source']>('mock');
  const [liveTs, setLiveTs] = useState<number | null>(null);

  useEffect(() => {
    if (!initial.code) return;
    let cancelled = false;
    async function refresh() {
      try {
        const res = await fetch(`/api/etf/realtime?codes=${initial.code}`);
        if (!res.ok) return;
        const data: RealtimeResponse = await res.json();
        if (cancelled) return;
        setMarketStatus(data.marketStatus);
        setLiveSource(data.source);
        setLiveTs(data.ts);
        const q = data.quotes?.[0];
        if (q && q.price > 0) {
          setQuote({
            code: initial.code,
            name: initial.name,
            price: q.price,
            change: q.change,
            changeRate: q.changeRate,
            volume: q.volume,
          });
        }
      } catch {
        // silent — SSR initial 유지
      }
    }
    refresh();
    const interval = marketStatus === 'open' ? 30_000 : 5 * 60_000;
    const id = setInterval(refresh, interval);
    return () => { cancelled = true; clearInterval(id); };
  }, [initial.code, marketStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  const isLive = marketStatus === 'open' && liveSource === 'kis' && liveTs;
  const isKrxFallback = !isLive && baseDate;

  return (
    <div className="dashboard-table-wrap">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
        {isLive ? (
          <LiveDataBadge source="kis" ts={liveTs} compact />
        ) : isKrxFallback ? (
          <LiveDataBadge source="krx" baseDate={baseDate} compact />
        ) : null}
      </div>
      <table className="dashboard-table">
        <tbody>
          <tr>
            <td className="font-medium">현재가</td>
            <td>{quote.price.toLocaleString()}원</td>
          </tr>
          <tr>
            <td className="font-medium">전일대비</td>
            <td className={quote.change > 0 ? 'text-red' : (quote.change < 0 ? 'text-blue' : '')}>
              {quote.change > 0 ? '▲' : (quote.change < 0 ? '▼' : '-')} {Math.abs(quote.change).toLocaleString()}
              {typeof quote.changeRate === 'number' && (
                <span style={{ marginLeft: '0.4rem', fontSize: '0.85em' }}>
                  ({quote.changeRate > 0 ? '+' : ''}{quote.changeRate.toFixed(2)}%)
                </span>
              )}
            </td>
          </tr>
          <tr>
            <td className="font-medium">거래량</td>
            <td>{quote.volume.toLocaleString()}주</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
