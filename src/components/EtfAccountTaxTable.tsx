import type { EtfTaxClass } from '@/lib/etf-tax';
import { TAX_RULES, TAX_SOURCES, formatWon } from '@/lib/account-tax-rules';

interface Props {
  name: string;
  tax: EtfTaxClass;
  /** 운용사 사이트 (과세 항목 확인용) */
  issuerUrl?: string | null;
  issuerLabel?: string | null;
}

const pct = (r: number) => `${(r * 100).toFixed(1).replace(/\.0$/, '')}%`;

/**
 * 종목 사전 "계좌별 세금" 표 (2026-10-14).
 *
 *   같은 ETF라도 일반 계좌·중개형 ISA·연금저축·IRP 어디서 사고파느냐에 따라 매매차익과 분배금에 붙는 세금이 다르다.
 *   행은 과세 구분(src/lib/etf-tax.ts)의 매매차익 과세 방식(gainTax)과 연금계좌 편입 가능 여부로 정하고,
 *   세율·한도는 src/lib/account-tax-rules.ts 한 곳에서 읽는다(2026-10-14 law.go.kr 현행 조문 대조).
 *   구분이 이름 규칙 추정이면 그렇게 밝히고 운용사 과세 항목으로 확인하라고 안내한다.
 */
export default function EtfAccountTaxTable({ name, tax, issuerUrl, issuerLabel }: Props) {
  const R = TAX_RULES;
  const holdingPeriodGain = `보유기간 과세: 매매차익과 과세표준기준가격 증가분 중 작은 금액에 ${pct(R.dividendTaxRate)}`;

  const general = (() => {
    switch (tax.gainTax) {
      case 'exempt':
        return {
          gain: '비과세',
          dist: `배당소득세 ${pct(R.dividendTaxRate)} 원천징수 (펀드가 국내 주식을 사고판 차익에서 나온 몫은 빼고 과세)`,
          note: `금융소득(이자·배당)이 연 ${formatWon(R.financialIncomeThreshold)}을 넘으면 넘는 부분은 종합과세`,
        };
      case 'base-excludes-domestic':
        return {
          gain: holdingPeriodGain,
          dist: `배당소득세 ${pct(R.dividendTaxRate)} 원천징수`,
          note: '펀드가 국내 상장 주식과 국내 지수 파생상품에서 낸 차익은 과세표준에서 빠져, 실제 세금은 주로 배당·이자·옵션 수익에서 생긴다',
        };
      default:
        return {
          gain: holdingPeriodGain,
          dist: `배당소득세 ${pct(R.dividendTaxRate)} 원천징수 (펀드가 해외에 낸 세금은 원천징수 때 공제)`,
          note: `매매차익도 배당소득이라 분배금과 합쳐 연 ${formatWon(R.financialIncomeThreshold)}을 넘으면 종합과세`,
        };
    }
  })();

  const isaLimitNote = `만기·해지 때 순이익 ${formatWon(R.isa.taxFreeGeneral)}(서민형 ${formatWon(R.isa.taxFreeLowIncome)})까지 비과세, 넘는 부분 ${pct(R.isa.excessRate)} 분리과세. 의무 가입 ${R.isa.minYears}년`;
  const pensionRateNote = `연금으로 받을 때 연금소득세 ${pct(R.pension.rateUnder70)}(70세 미만)~${pct(R.pension.rate80plus)}(80세 이상), 사적연금을 연 ${formatWon(R.pension.separateTaxThreshold)} 넘게 받으면 종합과세 또는 ${pct(R.pension.otherWithdrawalRate)} 분리과세 선택, 연금 외로 꺼내면 ${pct(R.pension.otherWithdrawalRate)}`;
  const exemptPensionNote = tax.gainTax === 'exempt' ? '. 일반 계좌에서는 비과세인 매매차익도 연금계좌에서는 운용수익이라 연금 수령 때 과세된다' : '';

  const rows: { account: string; gain: string; dist: string; note: string }[] = [
    { account: '일반 계좌', ...general },
    tax.gainTax === 'exempt'
      ? {
          account: '중개형 ISA',
          gain: '과세 대상 아님 (손실도 다른 상품과 통산하지 않음)',
          dist: '계좌 안 다른 상품 손익과 통산',
          note: isaLimitNote,
        }
      : {
          account: '중개형 ISA',
          gain: '과세되는 몫을 계좌 안 다른 상품 손익과 통산',
          dist: '계좌 안 다른 상품 손익과 통산',
          note: isaLimitNote,
        },
    tax.pensionAllowed
      ? { account: '연금저축', gain: '운용 중 과세 안 함 (과세이연)', dist: '운용 중 과세 안 함 (과세이연)', note: pensionRateNote + exemptPensionNote }
      : { account: '연금저축', gain: '살 수 없음', dist: '살 수 없음', note: '레버리지·인버스 ETF는 연금저축에 담을 수 없다 (금융위원회 방침)' },
    tax.pensionAllowed
      ? {
          account: 'IRP·DC 퇴직연금',
          gain: '운용 중 과세 안 함 (과세이연)',
          dist: '운용 중 과세 안 함 (과세이연)',
          note: `연금저축과 같은 방식으로 과세. 주식형 ETF는 위험자산이라 적립금의 ${pct(R.retirementRiskAssetLimit)}까지만 담는다`,
        }
      : { account: 'IRP·DC 퇴직연금', gain: '살 수 없음', dist: '살 수 없음', note: '퇴직연금감독규정상 레버리지·인버스 ETF는 편입할 수 없다' },
  ];

  return (
    <div className="etf-tax">
      <p className="etf-tax-class">
        <strong>{name}</strong>의 과세 구분{tax.confirmed ? '' : '(추정)'}: <strong>{tax.label}</strong>.{' '}
        {tax.reason}
      </p>
      <div className="etf-sibling-table-wrap">
        <table className="etf-sibling-table etf-tax-table">
          <caption className="etf-sibling-caption">
            {name} 계좌별 세금 (법령 기준일 {R.asOf}, 세율은 지방소득세 포함)
          </caption>
          <thead>
            <tr>
              <th scope="col">계좌</th>
              <th scope="col">매매차익</th>
              <th scope="col">분배금</th>
              <th scope="col">한도·비고</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.account}>
                <th scope="row">{r.account}</th>
                <td>{r.gain}</td>
                <td>{r.dist}</td>
                <td>{r.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {tax.kind === 'derivative' && (
        <p className="etf-dict-note">
          레버리지·인버스는 운용 방식에 따라 매매차익 세금이 달라집니다. 국내 주식 지수 선물로 운용하면 선물 차익이 과세표준에서 빠지지만,
          스와프로 운용하는 합성·단일종목 상품이나 해외·채권·원자재 지수 상품은 차익이 과세됩니다. 이 상품은 이름 기준으로
          {tax.gainTax === 'taxable' ? ' 차익이 과세되는 쪽' : ' 선물 차익이 과세표준에서 빠지는 쪽'}으로 계산했습니다.
        </p>
      )}
      {tax.kind === 'foreign-or-other' && (
        <p className="etf-dict-note">
          같은 해외 지수를 미국 상장 ETF로 직접 사면 국내 상장 ETF와 달리 매매차익에 양도소득세 {pct(R.overseasDirect.rate)}(연 {formatWon(R.overseasDirect.basicDeduction)} 기본공제)가 붙고,
          배당소득 종합과세 합산에서는 빠집니다. 투자 금액과 기간에 따라 유리한 쪽이 달라집니다.
        </p>
      )}
      <p className="etf-dict-note">
        {tax.confirmed
          ? '과세 구분은 운용사 문서로 확인했습니다.'
          : '과세 구분은 상품 이름과 투자 대상으로 나눈 추정입니다.'}{' '}
        실제 구분은 {issuerUrl
          ? <a href={issuerUrl} target="_blank" rel="noopener noreferrer">{issuerLabel || '운용사'} 사이트 ↗</a>
          : '운용사 상품 페이지'}의 과세 항목과 투자설명서에서 확인할 수 있고, 개인별 세액은 거래하는 증권사가 계산합니다.
        근거 법령:{' '}
        {TAX_SOURCES.map((s, i) => (
          <span key={s.url}>
            {i > 0 ? ' · ' : ''}
            <a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a>
          </span>
        ))}
      </p>
    </div>
  );
}
