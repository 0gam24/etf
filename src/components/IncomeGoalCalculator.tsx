'use client';

import { useState, useMemo } from 'react';
import type { IncomeEtf, AccountType } from '@/lib/income';
import { ACCOUNT_LABELS, requiredPrincipal, taxRateFor } from '@/lib/income';

interface Props {
  etfs: IncomeEtf[];
}

const TARGET_STEPS = [300000, 500000, 1000000, 2000000, 3000000, 5000000];

export default function IncomeGoalCalculator({ etfs }: Props) {
  const [target, setTarget] = useState<number>(1000000);
  const [account, setAccount] = useState<AccountType>('isa');
  const [selectedCode, setSelectedCode] = useState<string>(etfs[0]?.code || '');

  const selected = useMemo(
    () => etfs.find(e => e.code === selectedCode) || etfs[0],
    [selectedCode, etfs],
  );

  if (!selected) return null;

  const principal = requiredPrincipal(target, selected.yield, account);
  const afterTaxAnnual = (principal * selected.yield) / 100 * (1 - taxRateFor(account));
  const afterTaxMonthly = Math.floor(afterTaxAnnual / 12);

  return (
    <section className="income-goal">
      <div className="pulse-section-head">
        <h2 className="pulse-section-title">월 목표 현금흐름 역산</h2>
        <p className="pulse-section-hint">
          "월 ○○만원 배당을 받으려면 얼마가 필요한가" — ETF·계좌 조합별 실제 필요 원금
        </p>
      </div>

      <div className="income-goal-card">
        <div className="income-goal-controls">
          <label className="income-goal-field">
            <span className="income-goal-field-label">월 목표 수령액</span>
            <div className="income-goal-chips">
              {TARGET_STEPS.map(t => (
                <button
                  key={t}
                  type="button"
                  className={`income-goal-chip ${t === target ? 'is-active' : ''}`}
                  onClick={() => setTarget(t)}
                >
                  {(t / 10000).toLocaleString()}만원
                </button>
              ))}
            </div>
          </label>

          <label className="income-goal-field">
            <span className="income-goal-field-label">계좌 유형</span>
            <div className="income-goal-chips">
              {(Object.keys(ACCOUNT_LABELS) as AccountType[]).map(a => (
                <button
                  key={a}
                  type="button"
                  className={`income-goal-chip ${a === account ? 'is-active' : ''}`}
                  onClick={() => setAccount(a)}
                >
                  {ACCOUNT_LABELS[a].label}
                </button>
              ))}
            </div>
          </label>

          <label className="income-goal-field">
            <span className="income-goal-field-label">ETF 선택</span>
            <select
              className="income-goal-select"
              value={selected.code}
              onChange={e => setSelectedCode(e.target.value)}
            >
              {etfs.map(e => (
                <option key={e.code} value={e.code}>
                  {e.name} · 세전 {e.yield.toFixed(1)}%
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="income-goal-result">
          <div className="income-goal-result-big">
            필요 원금 <strong>{principal.toLocaleString()}원</strong>
          </div>
          <div className="income-goal-result-sub">
            선택한 조건으로 <strong>월 {afterTaxMonthly.toLocaleString()}원</strong>을 수령합니다
            (연 {Math.floor(afterTaxAnnual).toLocaleString()}원, 세후 기준)
          </div>
          <div className="income-goal-result-hint">
            * 세후 수익률은 분배 전액이 과세대상이라는 보수적 가정 · ISA는 비과세 한도 내 근사
          </div>
        </div>
      </div>
    </section>
  );
}
