'use client';

import { useId, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  calcDividend,
  calcRequiredForTarget,
  estimatePerShareFromYield,
  formatKrwShort,
  formatNumber,
  formatPct,
  formatWon,
  FINANCIAL_INCOME_THRESHOLD,
  PAYOUT_LABEL,
  WITHHOLDING_RATE,
  type DividendCalcResult,
} from '@/lib/dividend-calc';

/** 계산기에서 고를 수 있는 ETF 1종 (page.tsx가 빌드 시점 데이터로 채운다) */
export interface DividendCalcEtf {
  code: string;
  name: string;
  /** 최근 종가 (원) */
  price: number;
  /** 종가 기준일 YYYY-MM-DD */
  priceDate: string;
  /** /etf/{slug} 종목 사전 주소 (매핑이 있을 때만) */
  slug?: string;
  /** 사이트 분배 정보에 있는 종목만: 연 분배율 추정치와 연 분배 횟수 */
  example?: { yieldPct: number; payoutsPerYear: number };
}

interface Props {
  etfs: DividendCalcEtf[];
  /** 분배율 추정치를 정리한 날짜 YYYY-MM-DD */
  exampleAsOf: string;
}

type Tab = 'forward' | 'target';

const PAYOUT_OPTIONS = [12, 4, 2, 1];

/**
 * ETF 분배금 계산기 (/tools/dividend-calculator).
 *   ① 투자금·보유 수량 → 1회·연간·월평균 분배금 (세전·세후)
 *   ② 목표 월 분배금 → 필요한 수량·투자금 역산
 *   계산은 전부 src/lib/dividend-calc.ts의 순수 함수가 한다. 이 파일은 입력과 표시만 맡는다.
 *   입력값은 브라우저 안에서만 쓰고 어디에도 보내지 않는다.
 */
export default function DividendCalculator({ etfs, exampleAsOf }: Props) {
  const uid = useId();
  const byCode = useMemo(() => new Map(etfs.map(e => [e.code, e])), [etfs]);
  const withExample = useMemo(() => etfs.filter(e => e.example), [etfs]);
  const others = useMemo(() => etfs.filter(e => !e.example), [etfs]);

  const [tab, setTab] = useState<Tab>('forward');
  const [selectedCode, setSelectedCode] = useState('');
  const [inputMode, setInputMode] = useState<'amount' | 'shares'>('amount');
  const [amount, setAmount] = useState(10_000_000);
  const [shares, setShares] = useState(100);
  const [price, setPrice] = useState(10_000);
  const [priceFromEtf, setPriceFromEtf] = useState(false);
  const [perShare, setPerShare] = useState(50);
  const [perShareFromExample, setPerShareFromExample] = useState(false);
  const [payouts, setPayouts] = useState(12);
  const [target, setTarget] = useState(1_000_000);
  const [basis, setBasis] = useState<'net' | 'gross'>('net');

  const selected = selectedCode ? byCode.get(selectedCode) : undefined;

  function selectEtf(code: string) {
    setSelectedCode(code);
    const e = code ? byCode.get(code) : undefined;
    if (!e) {
      // 직접 입력으로 돌아가면 지금 값은 그대로 두고 출처 표시만 지운다
      setPriceFromEtf(false);
      setPerShareFromExample(false);
      return;
    }
    setPrice(e.price);
    setPriceFromEtf(true);
    if (e.example) {
      setPayouts(e.example.payoutsPerYear);
      setPerShare(estimatePerShareFromYield(e.price, e.example.yieldPct, e.example.payoutsPerYear));
      setPerShareFromExample(true);
    } else {
      // 이전 종목의 분배금이 남아 있으면 엉뚱한 결과가 나오므로 비운다
      setPerShare(0);
      setPerShareFromExample(false);
    }
  }

  const forward = useMemo(
    () => calcDividend({ mode: inputMode, amount, shares, price, perShare, payoutsPerYear: payouts }),
    [inputMode, amount, shares, price, perShare, payouts],
  );
  const reverse = useMemo(
    () => calcRequiredForTarget({ targetMonthly: target, basis, price, perShare, payoutsPerYear: payouts }),
    [target, basis, price, perShare, payouts],
  );

  const ready = price > 0 && perShare > 0;

  return (
    <div>
      {/* 탭 */}
      <div role="group" aria-label="계산 방식" style={{ display: 'flex', gap: '0.5rem', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
        <TabButton active={tab === 'forward'} onClick={() => setTab('forward')}>분배금 계산</TabButton>
        <TabButton active={tab === 'target'} onClick={() => setTab('target')}>목표 월 분배금 역산</TabButton>
      </div>

      {/* 공통 입력: 종목·가격·분배금·횟수 */}
      <div style={panelStyle}>
        <label htmlFor={`${uid}-etf`} style={{ display: 'block' }}>
          <span style={labelStyle}>ETF 선택 (고르면 최근 종가가 들어갑니다)</span>
          <select
            id={`${uid}-etf`}
            value={selectedCode}
            onChange={e => selectEtf(e.target.value)}
            style={inputStyle}
          >
            <option value="">직접 입력</option>
            {withExample.length > 0 && (
              <optgroup label="분배 예시값이 있는 종목">
                {withExample.map(e => (
                  <option key={e.code} value={e.code}>{e.name} ({e.code})</option>
                ))}
              </optgroup>
            )}
            {others.length > 0 && (
              <optgroup label="그 밖의 배당·커버드콜·리츠 ETF (분배금 직접 입력)">
                {others.map(e => (
                  <option key={e.code} value={e.code}>{e.name} ({e.code})</option>
                ))}
              </optgroup>
            )}
          </select>
        </label>

        <div style={gridStyle}>
          <NumberField
            id={`${uid}-price`}
            label="1주 가격 (원)"
            value={price}
            onChange={v => { setPrice(v); setPriceFromEtf(false); }}
            hint={priceFromEtf && selected ? `${selected.priceDate} 종가 · KRX 공공데이터` : '매수가나 현재가를 넣으세요'}
          />
          <NumberField
            id={`${uid}-per`}
            label="1회 1주당 분배금 (원)"
            value={perShare}
            step="any"
            onChange={v => { setPerShare(v); setPerShareFromExample(false); }}
            hint={
              perShareFromExample && selected?.example
                ? `예시값: 연 분배율 추정치 ${formatPct(selected.example.yieldPct, 1)}% × 종가 ÷ ${selected.example.payoutsPerYear}회`
                : selected && !selected.example
                  ? '운용사 분배 공시의 최근 1주당 분배금을 넣으세요'
                  : '최근 1회 분배 때 1주에 나온 금액'
            }
          />
          <label htmlFor={`${uid}-payouts`} style={{ display: 'block' }}>
            <span style={labelStyle}>연 분배 횟수</span>
            <select
              id={`${uid}-payouts`}
              value={payouts}
              onChange={e => setPayouts(Number(e.target.value) || 12)}
              style={inputStyle}
            >
              {PAYOUT_OPTIONS.map(n => (
                <option key={n} value={n}>{PAYOUT_LABEL[n]}</option>
              ))}
            </select>
            <span style={hintStyle}>
              {selected?.example ? '사이트 분배 정보의 지급 주기' : '운용사 상품 페이지에서 분배 주기를 확인하세요'}
            </span>
          </label>
        </div>

        {perShareFromExample && selected?.example && (
          <p style={noteStyle}>
            이 분배금은 {exampleAsOf}에 정리한 연 분배율 추정치를 최근 종가에 곱해 만든 예시입니다. 실제로 나온 금액이 아니므로,
            운용사 분배 공시의 최근 1주당 분배금으로 바꿔 넣으면 더 정확합니다.
          </p>
        )}

        {selected?.slug && (
          <p style={{ ...noteStyle, marginTop: 'var(--space-2)' }}>
            <Link href={`/etf/${selected.slug}`} prefetch={false} style={linkStyle}>
              {selected.name} 종목 사전에서 구성종목·괴리율·분배 정보 보기
            </Link>
          </p>
        )}
      </div>

      {tab === 'forward' ? (
        <section aria-label="분배금 계산 결과">
          <div style={panelStyle}>
            <div role="group" aria-label="입력 기준" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: 'var(--space-3)' }}>
              <Radio name={`${uid}-mode`} checked={inputMode === 'amount'} onChange={() => setInputMode('amount')} label="투자금으로 계산" />
              <Radio name={`${uid}-mode`} checked={inputMode === 'shares'} onChange={() => setInputMode('shares')} label="보유 수량으로 계산" />
            </div>
            {inputMode === 'amount' ? (
              <NumberField
                id={`${uid}-amount`}
                label="투자금 (원)"
                value={amount}
                onChange={setAmount}
                hint={amount > 0 ? `= ${formatKrwShort(amount)}` : '넣을 금액'}
              />
            ) : (
              <NumberField
                id={`${uid}-shares`}
                label="보유 수량 (주)"
                value={shares}
                onChange={setShares}
                hint="계좌에 있는 수량"
              />
            )}
          </div>

          {ready ? (
            <ForwardResult r={forward} mode={inputMode} perShare={perShare} payouts={payouts} />
          ) : (
            <EmptyNotice />
          )}
        </section>
      ) : (
        <section aria-label="목표 월 분배금 역산 결과">
          <div style={panelStyle}>
            <div style={gridStyle}>
              <NumberField
                id={`${uid}-target`}
                label="목표 월평균 분배금 (원)"
                value={target}
                onChange={setTarget}
                hint={target > 0 ? `= ${formatKrwShort(target)}` : '한 달에 받고 싶은 금액'}
              />
              <div>
                <span style={labelStyle}>목표 기준</span>
                <div role="group" aria-label="목표 기준" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', paddingTop: '0.4rem' }}>
                  <Radio name={`${uid}-basis`} checked={basis === 'net'} onChange={() => setBasis('net')} label="세후 (일반계좌 15.4% 뗀 뒤)" />
                  <Radio name={`${uid}-basis`} checked={basis === 'gross'} onChange={() => setBasis('gross')} label="세전" />
                </div>
              </div>
            </div>
          </div>

          {ready && reverse ? (
            <TargetResult
              target={target}
              basis={basis}
              price={price}
              perShare={perShare}
              payouts={payouts}
              requiredShares={reverse.requiredShares}
              requiredAmount={reverse.requiredAmount}
              r={reverse.result}
            />
          ) : (
            <EmptyNotice />
          )}
        </section>
      )}
    </div>
  );
}

function ForwardResult({ r, mode, perShare, payouts }: { r: DividendCalcResult; mode: 'amount' | 'shares'; perShare: number; payouts: number }) {
  const months = payouts > 0 ? 12 / payouts : 0;
  return (
    <>
      <div style={statGridStyle}>
        <Stat
          label="계산에 쓴 수량"
          value={`${formatWon(r.shares)}주`}
          sub={mode === 'amount'
            ? `매수 ${formatWon(r.invested)}원 · 남는 돈 ${formatWon(r.leftover)}원`
            : `평가액 ${formatWon(r.invested)}원`}
        />
        <Stat label="1회 분배금 (세후)" value={`${formatWon(r.perPayoutNet)}원`} sub={`세전 ${formatWon(r.perPayoutGross)}원 · 세금 ${formatWon(r.perPayoutTax)}원`} />
        <Stat label="연간 분배금 (세후)" value={`${formatWon(r.annualNet)}원`} sub={`세전 ${formatWon(r.annualGross)}원 · 세금 ${formatWon(r.annualTax)}원`} accent />
        <Stat label="월평균 (세후)" value={`${formatWon(r.monthlyNetAvg)}원`} sub={`세전 ${formatWon(r.monthlyGrossAvg)}원`} accent />
        <Stat label="가격 대비 연 분배율" value={`${formatPct(r.yieldOnPricePct)}%`} sub="1주당 분배금 × 연 횟수 ÷ 1주 가격" />
      </div>

      <div style={processStyle}>
        <div style={processTitleStyle}>계산 과정</div>
        <ol style={processListStyle}>
          <li>{formatWon(r.shares)}주 × 1주당 {formatWon(perShare)}원 = 1회 세전 {formatWon(r.perPayoutGross)}원</li>
          <li>1회 세전 {formatWon(r.perPayoutGross)}원 × 연 {payouts}회 = 연 세전 {formatWon(r.annualGross)}원</li>
          <li>원천징수 1회 {formatWon(r.perPayoutTax)}원 ({formatPct(WITHHOLDING_RATE * 100, 1)}%) × {payouts}회 = 연 {formatWon(r.annualTax)}원</li>
          <li>연 세후 {formatWon(r.annualNet)}원 ÷ 12개월 = 월평균 {formatWon(r.monthlyNetAvg)}원</li>
        </ol>
        {payouts !== 12 && months > 0 && (
          <p style={{ ...noteStyle, marginTop: 'var(--space-2)' }}>
            연 {payouts}회 분배라면 실제로는 {months}개월에 한 번 세후 {formatWon(r.perPayoutNet)}원이 들어옵니다. 월평균은 비교를 돕는 숫자입니다.
          </p>
        )}
      </div>

      <ThresholdNote r={r} />
    </>
  );
}

function TargetResult(props: {
  target: number; basis: 'net' | 'gross'; price: number; perShare: number; payouts: number;
  requiredShares: number; requiredAmount: number; r: DividendCalcResult;
}) {
  const { target, basis, price, perShare, payouts, requiredShares, requiredAmount, r } = props;
  const keep = basis === 'net' ? 1 - WITHHOLDING_RATE : 1;
  const perShareYear = perShare * payouts * keep;
  const raw = perShareYear > 0 ? (target * 12) / perShareYear : 0;
  return (
    <>
      <div style={statGridStyle}>
        <Stat label="필요한 수량" value={`${formatWon(requiredShares)}주`} sub="1주 미만은 올림" />
        <Stat label="필요한 투자금" value={formatKrwShort(requiredAmount)} sub={`${formatWon(requiredAmount)}원`} accent />
        <Stat label="그때 월평균 (세후)" value={`${formatWon(r.monthlyNetAvg)}원`} sub={`세전 ${formatWon(r.monthlyGrossAvg)}원`} accent />
        <Stat label="그때 연간 (세전)" value={`${formatWon(r.annualGross)}원`} sub={`세후 ${formatWon(r.annualNet)}원`} />
      </div>

      <div style={processStyle}>
        <div style={processTitleStyle}>계산 과정</div>
        <ol style={processListStyle}>
          <li>목표 월 {formatWon(target)}원 × 12개월 = 연 {formatWon(target * 12)}원 ({basis === 'net' ? '세후' : '세전'})</li>
          <li>
            1주가 1년에 주는 {basis === 'net' ? '세후' : '세전'} 분배금 = {formatWon(perShare)}원 × {payouts}회
            {basis === 'net' ? ` × ${formatPct(keep * 100, 1)}%` : ''} = {formatNumber(perShareYear, 1)}원
          </li>
          <li>연 {formatWon(target * 12)}원 ÷ {formatNumber(perShareYear, 1)}원 = {formatNumber(raw, 2)}, 1주 미만을 올려 {formatWon(requiredShares)}주</li>
          <li>{formatWon(requiredShares)}주 × {formatWon(price)}원 = {formatWon(requiredAmount)}원</li>
        </ol>
        <p style={{ ...noteStyle, marginTop: 'var(--space-2)' }}>
          분배금이 지금과 같다는 전제의 계산입니다. 분배금이 줄면 같은 투자금으로 받는 금액도 줄어듭니다.
        </p>
      </div>

      <ThresholdNote r={r} />
    </>
  );
}

function ThresholdNote({ r }: { r: DividendCalcResult }) {
  if (r.annualGross <= 0) return null;
  if (r.overThreshold) {
    return (
      <div style={{ ...processStyle, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)' }}>
        <div style={{ ...processTitleStyle, color: 'var(--red-400)' }}>연 {formatKrwShort(FINANCIAL_INCOME_THRESHOLD)} 기준을 넘습니다</div>
        <p style={{ ...noteStyle, color: 'var(--text-secondary)' }}>
          이 분배금만으로 세전 연 {formatWon(r.annualGross)}원입니다. 이자와 배당을 합친 금융소득이 한 해 2,000만원을 넘으면
          넘는 부분이 근로·사업소득 등과 합쳐져 종합소득세율로 다시 계산될 수 있고, 다음 해 5월 종합소득세 신고 대상이 됩니다.
          위의 세후 금액은 15.4% 원천징수만 반영한 값이라 실제 부담은 더 커질 수 있습니다.
        </p>
      </div>
    );
  }
  return (
    <p style={{ ...noteStyle, marginTop: 'var(--space-3)' }}>
      금융소득 종합과세 기준(연 2,000만원)은 예금 이자와 다른 배당까지 합친 금액으로 봅니다. 이 계산의 세전 연 분배금 {formatWon(r.annualGross)}원에
      다른 이자·배당을 더해 확인하세요.
    </p>
  );
}

function EmptyNotice() {
  return (
    <p style={{ ...panelStyle, color: 'var(--text-secondary)', textAlign: 'center' }}>
      1주 가격과 1회 1주당 분배금을 넣으면 결과가 나옵니다.
    </p>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        padding: '0.55rem 1rem',
        borderRadius: 'var(--radius-sm)',
        border: active ? '1px solid var(--accent-gold)' : '1px solid var(--border-color)',
        background: active ? 'rgba(212,175,55,0.14)' : 'var(--bg-card)',
        color: active ? 'var(--accent-gold)' : 'var(--text-secondary)',
        fontWeight: 700,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

function Radio({ name, checked, onChange, label }: { name: string; checked: boolean; onChange: () => void; label: string }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)', fontSize: '0.92rem', cursor: 'pointer' }}>
      <input type="radio" name={name} checked={checked} onChange={onChange} />
      {label}
    </label>
  );
}

function NumberField({ id, label, value, onChange, hint, step = '1' }: {
  id: string; label: string; value: number; onChange: (v: number) => void; hint?: string; step?: string;
}) {
  return (
    <label htmlFor={id} style={{ display: 'block' }}>
      <span style={labelStyle}>{label}</span>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={0}
        step={step}
        value={value === 0 ? '' : value}
        onChange={e => {
          const v = Number(e.target.value);
          onChange(Number.isFinite(v) && v > 0 ? v : 0);
        }}
        style={inputStyle}
      />
      {hint && <span style={hintStyle}>{hint}</span>}
    </label>
  );
}

function Stat({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div style={{
      padding: 'var(--space-4)',
      background: accent ? 'linear-gradient(90deg, rgba(212,175,55,0.10), rgba(212,175,55,0.03))' : 'var(--bg-card)',
      border: accent ? '1px solid rgba(212,175,55,0.45)' : '1px solid var(--border-color)',
      borderRadius: 'var(--radius)',
    }}>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.3rem' }}>{label}</div>
      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: accent ? 'var(--accent-gold)' : 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      {sub && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.3rem', lineHeight: 1.5 }}>{sub}</div>}
    </div>
  );
}

const panelStyle: React.CSSProperties = {
  padding: 'var(--space-4)',
  background: 'var(--bg-card)',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius)',
  marginBottom: 'var(--space-4)',
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: 'var(--space-3)',
  marginTop: 'var(--space-3)',
};

const statGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
  gap: 'var(--space-3)',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.85rem',
  color: 'var(--text-secondary)',
  marginBottom: '0.3rem',
  fontWeight: 600,
};

const hintStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.8rem',
  color: 'var(--text-dim)',
  marginTop: '0.3rem',
  lineHeight: 1.5,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.55rem 0.75rem',
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--text-primary)',
  fontSize: '1rem',
  fontVariantNumeric: 'tabular-nums',
};

const noteStyle: React.CSSProperties = {
  fontSize: '0.88rem',
  color: 'var(--text-secondary)',
  lineHeight: 1.7,
  margin: 0,
};

const linkStyle: React.CSSProperties = {
  color: 'var(--accent-gold)',
  textDecoration: 'underline',
  textUnderlineOffset: '3px',
};

const processStyle: React.CSSProperties = {
  marginTop: 'var(--space-4)',
  padding: 'var(--space-4)',
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius)',
};

const processTitleStyle: React.CSSProperties = {
  fontWeight: 700,
  marginBottom: 'var(--space-2)',
  color: 'var(--text-primary)',
};

const processListStyle: React.CSSProperties = {
  margin: 0,
  paddingLeft: '1.25rem',
  color: 'var(--text-secondary)',
  lineHeight: 1.8,
  fontSize: '0.92rem',
  fontVariantNumeric: 'tabular-nums',
};
