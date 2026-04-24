'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface Props {
  /** 기준 ETF 이름 (S급 추천 종목) */
  defaultEtfName: string;
  /** 기준 연 분배율 (%) — 세전 */
  defaultYield: number;
}

const STEP_M = 10_000_000; // 1천만 원 단위
const MIN_M = 10_000_000;  // 1천만
const MAX_M = 1_000_000_000; // 10억

export default function IncomeMiniCalculator({ defaultEtfName, defaultYield }: Props) {
  const [principal, setPrincipal] = useState(100_000_000); // 기본 1억

  // ISA 비과세 한도 내 근사 → 세후=세전
  const monthlyAfterTax = (principal * defaultYield) / 100 / 12;
  const monthlyManwon = Math.floor(monthlyAfterTax / 10000);

  return (
    <div className="income-mini">
      <div className="income-mini-result">
        <div className="income-mini-amount">
          월 <strong>{monthlyManwon.toLocaleString()}</strong>만원
        </div>
        <div className="income-mini-detail">
          ISA 비과세 기준 · 연 분배율 {defaultYield.toFixed(1)}%
        </div>
      </div>

      <div className="income-mini-slider-wrap">
        <input
          type="range"
          min={MIN_M}
          max={MAX_M}
          step={STEP_M}
          value={principal}
          onChange={e => setPrincipal(Number(e.target.value))}
          className="income-mini-slider"
          aria-label="투자 원금"
        />
        <div className="income-mini-slider-row">
          <span className="income-mini-slider-end">1천만</span>
          <span className="income-mini-slider-current">
            원금 {(principal / 100_000_000).toFixed(principal % 100_000_000 === 0 ? 0 : 1)}억
          </span>
          <span className="income-mini-slider-end">10억</span>
        </div>
      </div>

      <div className="income-mini-base">기준 ETF · {defaultEtfName}</div>

      <Link href="/income" className="income-mini-cta">
        계좌별·ETF별 정밀 시뮬레이션 <ArrowRight size={14} strokeWidth={2.5} />
      </Link>
    </div>
  );
}
