"use client";

import React, { useState, useEffect } from 'react';
import { Flame, ArrowUpRight, ArrowDownRight, PieChart, Sparkles, Landmark } from 'lucide-react';

/**
 * Daily ETF Pulse — 홈 최상단 라이브 위젯
 *   /api/etf에서 공공데이터포털 ETF 시세(30분 캐시)를 가져와 3가지 뷰 제공:
 *     1. 거래량 TOP10 / 상승 TOP5 / 하락 TOP5 (탭 전환)
 *     2. 카테고리별 자금 흐름 (flow-chip + 바 인디케이터)
 *     3. 시가총액 TOP3 + AI 인사이트 한 줄 코멘트
 */

// ── 타입 정의 ──
interface ETFItem {
  code: string;
  name: string;
  price: number;
  change: number;
  changeRate: number;
  volume: number;
  tradeAmount: number;
  marketCap: number;
  highPrice: number;
  lowPrice: number;
  openPrice: number;
}

interface CategoryInfo {
  name: string;
  icon: string;
  count: number;
  avgChange: number;
  totalVolume: number;
}

interface ETFData {
  isRealData: boolean;
  baseDate: string;
  fetchedAt: string;
  totalCount: number;
  trending: ETFItem[];
  topGainers: ETFItem[];
  topLosers: ETFItem[];
  categories: Record<string, CategoryInfo>;
  topMarketCap: ETFItem[];
  fromCache?: boolean;
}

export default function EtfMarketPulse() {
  const [data, setData] = useState<ETFData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'trending' | 'gainers' | 'losers'>('trending');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const res = await fetch('/api/etf');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('ETF 데이터 로딩 실패:', err);
    } finally {
      setLoading(false);
    }
  }

  if (!isClient) return null;

  // 숫자 포맷 함수
  const formatVolume = (vol: number) => {
    if (vol >= 10000000) return (vol / 10000000).toFixed(1) + '천만';
    if (vol >= 10000) return (vol / 10000).toFixed(0) + '만';
    return vol.toLocaleString();
  };

  const formatPrice = (price: number) => price.toLocaleString() + '원';

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr.length !== 8) return dateStr;
    return `${dateStr.slice(0, 4)}.${dateStr.slice(4, 6)}.${dateStr.slice(6, 8)}`;
  };

  // 로딩 상태
  if (loading) {
    return (
      <section className="market-pulse-section">
        <div className="market-pulse-inner">
          <div className="pulse-loading">
            <div className="pulse-loading-dot"></div>
            <div className="pulse-loading-dot"></div>
            <div className="pulse-loading-dot"></div>
            <span>시장 데이터를 불러오는 중...</span>
          </div>
        </div>
      </section>
    );
  }

  if (!data) return null;

  // 탭에 따라 보여줄 ETF 목록 선택
  const getActiveList = () => {
    switch (activeTab) {
      case 'trending': return data.trending;
      case 'gainers': return data.topGainers;
      case 'losers': return data.topLosers;
      default: return data.trending;
    }
  };

  // 카테고리 데이터를 배열로 변환하고 거래량 순 정렬
  const categoryList = Object.entries(data.categories)
    .map(([key, cat]) => ({ key, ...cat }))
    .sort((a, b) => b.totalVolume - a.totalVolume);

  // 전체 시장 평균 등락률
  const overallChange = categoryList.length > 0
    ? (categoryList.reduce((sum, c) => sum + c.avgChange, 0) / categoryList.length).toFixed(2)
    : '0.00';

  // AI 코멘트 생성
  const getMarketComment = () => {
    const positive = categoryList.filter(c => c.avgChange > 0);
    const negative = categoryList.filter(c => c.avgChange < 0);
    
    if (positive.length === 0 && negative.length === 0) {
      return '시장 데이터를 분석 중입니다.';
    }
    
    const topPositive = positive.sort((a, b) => b.avgChange - a.avgChange)[0];
    const topNegative = negative.sort((a, b) => a.avgChange - b.avgChange)[0];
    
    let comment = '';
    if (topPositive) {
      comment += `${topPositive.name} 섹터에 자금이 유입되고 있습니다(+${topPositive.avgChange}%).`;
    }
    if (topNegative) {
      comment += ` ${topNegative.name}에서는 매도 흐름이 관찰됩니다(${topNegative.avgChange}%).`;
    }
    return comment || '시장이 전반적으로 보합세를 보이고 있습니다.';
  };

  return (
    <section className="market-pulse-section">
      <div className="market-pulse-inner">
        {/* ── 헤더 ── */}
        <div className="pulse-header">
          <div className="pulse-header-left">
            <div className="pulse-live-badge">
              <span className="pulse-live-dot"></span>
              DAILY ETF PULSE · LIVE
            </div>
            <h2 className="pulse-title">
              지금 뜨는 ETF, <span className="text-shimmer">왜 오르는지까지</span>
            </h2>
            <p className="pulse-subtitle">
              공공데이터포털 기반 실시간 랭킹 · {formatDate(data.baseDate)} 기준
              {!data.isRealData && <span className="pulse-sample-tag">샘플</span>}
            </p>
          </div>
          <div className="pulse-header-right">
            <div className="pulse-stat-mini">
              <span className="pulse-stat-mini-label">분석 종목</span>
              <span className="pulse-stat-mini-value">{data.totalCount}개</span>
            </div>
            <div className="pulse-stat-mini">
              <span className="pulse-stat-mini-label">시장 평균</span>
              <span className={`pulse-stat-mini-value ${Number(overallChange) >= 0 ? 'is-up' : 'is-down'}`}>
                {Number(overallChange) >= 0 ? '+' : ''}{overallChange}%
              </span>
            </div>
          </div>
        </div>

        {/* ── 메인 2컬럼 레이아웃 ── */}
        <div className="pulse-grid">
          
          {/* ── 좌측: ETF 랭킹 테이블 ── */}
          <div className="pulse-ranking-card">
            <div className="pulse-tabs">
              <button
                className={`pulse-tab ${activeTab === 'trending' ? 'active' : ''}`}
                onClick={() => setActiveTab('trending')}
              >
                <Flame size={15} strokeWidth={2.4} aria-hidden /> 거래량 급등
              </button>
              <button
                className={`pulse-tab ${activeTab === 'gainers' ? 'active' : ''}`}
                onClick={() => setActiveTab('gainers')}
              >
                <ArrowUpRight size={15} strokeWidth={2.4} aria-hidden /> 상승 TOP
              </button>
              <button
                className={`pulse-tab ${activeTab === 'losers' ? 'active' : ''}`}
                onClick={() => setActiveTab('losers')}
              >
                <ArrowDownRight size={15} strokeWidth={2.4} aria-hidden /> 하락 TOP
              </button>
            </div>

            <div className="pulse-table-wrap">
              <table className="pulse-table">
                <thead>
                  <tr>
                    <th className="pulse-th-rank">#</th>
                    <th className="pulse-th-name">종목명</th>
                    <th className="pulse-th-price">현재가</th>
                    <th className="pulse-th-change">등락률</th>
                    <th className="pulse-th-volume">거래량</th>
                  </tr>
                </thead>
                <tbody>
                  {getActiveList().map((etf, idx) => (
                    <tr key={etf.code} className="pulse-tr">
                      <td className="pulse-td-rank">
                        <span className={`rank-badge ${idx < 3 ? 'rank-top' : ''}`}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="pulse-td-name">
                        <span className="etf-name">{etf.name}</span>
                        <span className="etf-code">{etf.code}</span>
                      </td>
                      <td className="pulse-td-price">{formatPrice(etf.price)}</td>
                      <td className={`pulse-td-change ${etf.changeRate >= 0 ? 'is-up' : 'is-down'}`}>
                        <span className="change-arrow">{etf.changeRate >= 0 ? '▲' : '▼'}</span>
                        {Math.abs(etf.changeRate).toFixed(2)}%
                      </td>
                      <td className="pulse-td-volume">
                        {formatVolume(etf.volume)}주
                        {activeTab === 'trending' && (
                          <div className="volume-bar-wrap">
                            <div 
                              className="volume-bar" 
                              style={{ 
                                width: `${Math.min((etf.volume / (data.trending[0]?.volume || 1)) * 100, 100)}%` 
                              }}
                            ></div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── 우측: 카테고리별 투자 흐름 ── */}
          <div className="pulse-flow-card">
            <h3 className="pulse-flow-title">
              <PieChart size={16} strokeWidth={2.4} aria-hidden /> 카테고리별 자금 흐름
            </h3>
            
            <div className="pulse-flow-grid">
              {categoryList.map((cat) => (
                <div 
                  key={cat.key}
                  className={`flow-chip ${cat.avgChange >= 0 ? 'flow-up' : 'flow-down'}`}
                >
                  <div className="flow-chip-info">
                    <span className="flow-chip-name">{cat.name}</span>
                    <span className={`flow-chip-change ${cat.avgChange >= 0 ? 'is-up' : 'is-down'}`}>
                      {cat.avgChange >= 0 ? '+' : ''}{cat.avgChange}%
                    </span>
                  </div>
                  <div className="flow-chip-bar-wrap">
                    <div 
                      className={`flow-chip-bar ${cat.avgChange >= 0 ? 'bar-up' : 'bar-down'}`}
                      style={{ width: `${Math.min(Math.abs(cat.avgChange) * 30, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* AI 코멘트 */}
            <div className="pulse-ai-comment">
              <div className="ai-comment-header">
                <span className="ai-badge">
                  <Sparkles size={13} strokeWidth={2.4} aria-hidden /> AI 인사이트
                </span>
              </div>
              <p className="ai-comment-text">
                {getMarketComment()}
              </p>
            </div>

            {/* 시가총액 TOP 3 */}
            <div className="pulse-bigcap">
              <h4 className="pulse-bigcap-title">
                <Landmark size={14} strokeWidth={2.4} aria-hidden /> 시가총액 TOP 3
              </h4>
              {data.topMarketCap.slice(0, 3).map((etf, idx) => (
                <div key={etf.code} className="bigcap-item">
                  <span className="bigcap-rank">{idx + 1}</span>
                  <span className="bigcap-name">{etf.name}</span>
                  <span className={`bigcap-change ${etf.changeRate >= 0 ? 'is-up' : 'is-down'}`}>
                    {etf.changeRate >= 0 ? '+' : ''}{etf.changeRate}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
