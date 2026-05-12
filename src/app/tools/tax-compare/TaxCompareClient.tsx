'use client';

import { useState, useMemo } from 'react';

interface Params {
  principal: number;   // 원금
  annualReturn: number; // 연 수익률 % (분배율 + 자본이득 추정)
  dividendYieldPct: number; // 분배율 %
  years: number;
}

interface Result {
  type: string;
  finalValue: number;
  totalTax: number;
  netGain: number;
  cagr: number;
}

/**
 * 계좌별 세후 누적 수익률 시뮬레이션 (단순화 모델).
 *
 * 가정:
 *   - 매년 원금에 annualReturn% 수익. 그 중 dividendYield 만큼 분배 + 나머지 자본이득.
 *   - 분배금은 매년 과세 (계좌별 분기), 자본이득은 만기/인출 시 과세.
 *
 * 일반계좌:
 *   - 분배금 15.4% 매년 과세
 *   - 국내 ETF 매매차익 비과세 (국내 추종만 — 모델 단순화)
 *
 * ISA:
 *   - 전체 수익 200만원까지 비과세
 *   - 초과분 9.9% 분리과세
 *
 * 연금저축:
 *   - 운용 중 비과세 (세금 이연)
 *   - 인출 시 연금소득세 5.5% 가정
 *
 * IRP:
 *   - 운용 중 비과세 + 매년 16.5% 세액공제 (모델은 단순히 final 에서 차감)
 *   - 인출 시 연금소득세 5.5% 가정
 */
function simulate(p: Params): Result[] {
  const r = p.annualReturn / 100;
  const dy = p.dividendYieldPct / 100;
  const cg = r - dy; // 자본이득률 (= 총수익 - 분배율)

  // 일반계좌
  let val = p.principal;
  let taxPaid = 0;
  for (let i = 0; i < p.years; i++) {
    const div = val * dy;
    const cap = val * cg;
    const taxOnDiv = div * 0.154;
    taxPaid += taxOnDiv;
    val = val + (div - taxOnDiv) + cap; // 매매차익 비과세 (국내 ETF)
  }
  const general: Result = { type: '일반계좌', finalValue: val, totalTax: taxPaid, netGain: val - p.principal, cagr: ((val / p.principal) ** (1 / p.years) - 1) * 100 };

  // ISA — 200만원 비과세 + 초과분 9.9%
  val = p.principal;
  for (let i = 0; i < p.years; i++) {
    const total = val * r;
    val += total;
  }
  const gainISA = val - p.principal;
  const exemptCap = 2_000_000;
  const taxableISA = Math.max(0, gainISA - exemptCap);
  const taxISA = taxableISA * 0.099;
  const finalISA = val - taxISA;
  const isa: Result = { type: 'ISA', finalValue: finalISA, totalTax: taxISA, netGain: finalISA - p.principal, cagr: ((finalISA / p.principal) ** (1 / p.years) - 1) * 100 };

  // 연금저축 — 운용 중 비과세 + 인출 시 5.5%
  val = p.principal;
  for (let i = 0; i < p.years; i++) {
    val += val * r;
  }
  const taxPension = (val - p.principal) * 0.055;
  const finalPension = val - taxPension;
  const pension: Result = { type: '연금저축', finalValue: finalPension, totalTax: taxPension, netGain: finalPension - p.principal, cagr: ((finalPension / p.principal) ** (1 / p.years) - 1) * 100 };

  // IRP — 운용 중 비과세 + 인출 시 5.5% (세액공제는 별도 보너스로 모델링)
  val = p.principal;
  for (let i = 0; i < p.years; i++) {
    val += val * r;
  }
  const taxIRP = (val - p.principal) * 0.055;
  const finalIRP = val - taxIRP;
  const irp: Result = { type: 'IRP', finalValue: finalIRP, totalTax: taxIRP, netGain: finalIRP - p.principal, cagr: ((finalIRP / p.principal) ** (1 / p.years) - 1) * 100 };

  return [general, isa, pension, irp].sort((a, b) => b.finalValue - a.finalValue);
}

export default function TaxCompareClient() {
  const [principal, setPrincipal] = useState(10_000_000);
  const [annualReturn, setAnnualReturn] = useState(7);
  const [dividendYieldPct, setDividendYield] = useState(3);
  const [years, setYears] = useState(10);

  const results = useMemo(
    () => simulate({ principal, annualReturn, dividendYieldPct, years }),
    [principal, annualReturn, dividendYieldPct, years],
  );

  return (
    <section>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-5)', padding: 'var(--space-4)', background: 'var(--bg-card)', borderRadius: 'var(--radius)' }}>
        <Field label="원금 (원)" value={principal} onChange={setPrincipal} step={1_000_000} />
        <Field label="연 총수익률 (%)" value={annualReturn} onChange={setAnnualReturn} step={0.5} suffix="%" />
        <Field label="연 분배율 (%)" value={dividendYieldPct} onChange={setDividendYield} step={0.5} suffix="%" />
        <Field label="투자 기간 (년)" value={years} onChange={setYears} step={1} suffix="년" />
      </div>

      <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
        {results.map((r, idx) => (
          <div key={r.type} style={{
            padding: 'var(--space-4)',
            background: idx === 0 ? 'linear-gradient(90deg, rgba(212,175,55,0.12), rgba(212,175,55,0.04))' : 'var(--bg-card)',
            border: idx === 0 ? '1px solid var(--accent-gold)' : '1px solid var(--border-color)',
            borderRadius: 'var(--radius)',
            display: 'grid',
            gridTemplateColumns: 'auto 1fr auto auto auto',
            gap: 'var(--space-4)',
            alignItems: 'center',
          }}>
            <div style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', background: idx === 0 ? 'var(--accent-gold)' : 'var(--bg-elevated)', color: idx === 0 ? '#0B0E14' : 'var(--text-dim)', borderRadius: '0.375rem', fontWeight: 700 }}>
              {idx === 0 ? '🏆 최적' : `${idx + 1}위`}
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>{r.type}</div>
            <Stat label="누적 평가" value={`${Math.round(r.finalValue / 10000).toLocaleString()}만원`} />
            <Stat label="총 세금" value={`${Math.round(r.totalTax / 10000).toLocaleString()}만원`} />
            <Stat label="실효 CAGR" value={`${r.cagr.toFixed(2)}%`} accent={r.cagr > 5 ? 'green' : 'gold'} />
          </div>
        ))}
      </div>
    </section>
  );
}

function Field({ label, value, onChange, step = 1, suffix }: { label: string; value: number; onChange: (v: number) => void; step?: number; suffix?: string }) {
  return (
    <label style={{ display: 'block' }}>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>{label}{suffix ? ` (${suffix})` : ''}</div>
      <input
        type="number"
        value={value}
        step={step}
        onChange={e => onChange(Number(e.target.value) || 0)}
        style={{
          width: '100%',
          padding: '0.5rem 0.75rem',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--text-primary)',
          fontFamily: 'monospace',
          fontVariantNumeric: 'tabular-nums',
        }}
      />
    </label>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: 'green' | 'gold' }) {
  const color = accent === 'green' ? 'var(--emerald-400)' : accent === 'gold' ? 'var(--accent-gold)' : 'var(--text-primary)';
  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>{label}</div>
      <div style={{ fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    </div>
  );
}
