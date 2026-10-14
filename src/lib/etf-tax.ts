/**
 * ETF 과세 구분 (2026-10-14).
 *
 * 종목 사전(/etf/{slug}) 전 종목에 "계좌별로 세금이 어떻게 달라지는가"를 붙이려고 상품 이름과 투자 대상으로
 * 과세 구분을 나눈다. 법령상 기준은 소득세법 시행령 제26조의2(집합투자기구 이익의 과세 범위)이고,
 * 실제 구분은 운용사가 상품 페이지·투자설명서의 과세 항목에 적는다. 이름 규칙으로 나눈 값은 "추정"이라
 * 화면에서도 그렇게 부르고, 최종 확인은 운용사 과세 항목으로 하라고 안내한다.
 * 운용사 문서로 확인한 종목은 src/lib/etf-profiles.ts 의 taxKind, 아래 CONFIRMED_TAX_KIND 가 이름 규칙보다 앞선다.
 *
 * 법령 대조 2026-10-14 (law.go.kr 현행 조문)
 *   - 국내주식형(매매차익 비과세): 시행령 제26조의2 제5항 제2호 "증권시장에서 거래되는 주식의 가격만을 기반으로 하는
 *     지수의 변화를 그대로 추적하는" ETF. 배당을 재투자하는 TR 형은 2025-07-01 부터 제외.
 *   - 그 밖의 ETF 는 보유기간 과세: 매매차익과 과세표준기준가격 증가분 중 작은 금액을 배당소득으로 15.4% (시행규칙 제13조).
 *     다만 과세표준기준가격에서 국내 상장증권과 그 장내파생상품 차익은 빠진다(시행령 제26조의2 제4항). 그래서
 *     국내 주식 액티브·커버드콜·TR·국내 지수 선물(레버리지·인버스 포함)은 실제 세금이 작고, 해외·채권·원자재는 차익이 과세된다.
 *   - 연금계좌(연금저축·IRP·DC)는 레버리지·인버스 ETF 를 살 수 없다(퇴직연금감독규정 제9조, 연금저축은 금융위 2017-11-21 방침).
 */

export type EtfTaxKind = 'domestic-equity' | 'domestic-other' | 'foreign-or-other' | 'derivative';

/** 일반 계좌에서 매매차익이 어떻게 과세되는가 */
export type GainTaxMode =
  /** 국내주식형: 비과세 */
  | 'exempt'
  /** 보유기간 과세지만 국내 상장증권·국내 지수 파생상품 차익은 과세표준에서 빠져 실제 세금이 작다 */
  | 'base-excludes-domestic'
  /** 보유기간 과세, 해외 주식·채권·원자재 차익이 그대로 과세된다 */
  | 'taxable';

export interface EtfTaxClass {
  kind: EtfTaxKind;
  gainTax: GainTaxMode;
  /** 연금저축·IRP·DC 에서 살 수 있는가 */
  pensionAllowed: boolean;
  /** 화면에 쓰는 이름 */
  label: string;
  /** 이렇게 나눈 이유 (화면 표시용 한 문장) */
  reason: string;
  /** 운용사 문서로 확인한 값인가 (아니면 이름 규칙 추정) */
  confirmed: boolean;
}

const DERIVATIVE = /(레버리지|인버스|2X|곱버스)/i;

// 해외 투자·비주식 자산을 드러내는 이름. '금'·'은'은 '금융'·'은행'과 겹치므로 붙은 꼴로만 본다.
//   대소문자를 가린다('Plus' 속 'us' 오인 방지). '다우'는 넣지 않는다: 국내 지수(코리아배당다우존스)에도 쓰이고,
//   미국 다우존스 지수 상품은 이름에 '미국'이 함께 있다. '선물'도 넣지 않는다: 국내 지수 선물은 과세표준에서 빠진다.
const FOREIGN_OR_OTHER_WORDS = [
  '미국', '나스닥', 'NASDAQ', 'S&P', '필라델피아', '러셀', '글로벌', 'Global', '월드', 'World', 'ACWI',
  '선진국', '신흥국', '차이나', '중국', 'CSI', '홍콩', '항셍', 'HSCEI', '일본', '닛케이', '니케이', 'TOPIX', '토픽스',
  '인도', '니프티', 'Nifty', '베트남', '대만', '유럽', '유로', '독일', '영국', '프랑스', '브라질', '인도네시아',
  '멕시코', '사우디', '호주', '캐나다', '아시아', '아세안', '라틴', '싱가포르', '이머징', '스위스', '태국', '필리핀',
  '말레이시아', '이스라엘', '엔비디아', '애플', '테슬라', '마이크로소프트', '아마존', '알파벳', '팔란티어', '브로드컴',
  'TSMC', '빅테크', '매그니피센트', 'FANG', '버크셔', '샌디스크', '일라이릴리', '노보노디스크', '구글', '넷플릭스',
  'BYD', '샤오미', '알리바바', '텐센트', '마이크론', 'ASML', '비트코인', '합성',
  '채권', '국채', '국고채', '공채', '특수채', '물가채', '전단채', '여전채', '회사채', '금융채', '은행채', '통안',
  '단기자금', '머니마켓', 'CD금리', 'KOFR', 'SOFR', '금리', '크레딧', '하이일드', 'TDF', 'TRF', '혼합',
  '금현물', '골드', '금선물', '국제금', '금액티브', '은선물', '은현물', '은액티브', '구리', '원유', 'WTI', '천연가스',
  '농산물', '원자재', '금속', '달러', '엔화', '위안', '(H)', '멀티에셋', '하이인컴',
];
const FOREIGN_OR_OTHER = new RegExp(FOREIGN_OR_OTHER_WORDS.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'));

// 국내 주식·국내 지수 파생상품을 담지만 지수를 그대로 따르지 않거나(액티브·커버드콜·선물) 배당을 재투자하는(TR) 경우.
//   'TR' 뒤에 영문이 이어지면(TREX·TRUSTON·TRF) 다른 말이라 뺀다. '인프라' 단독은 넣지 않는다('AI전력인프라' 같은 주식 테마).
const DOMESTIC_OTHER = /(액티브|커버드콜|프리미엄|위클리|타겟|리츠|부동산|선물|롱|숏|TR(?![A-Za-z]))/;

/**
 * 운용사 문서로 과세 구분을 확인한 종목 (이름 규칙과 다를 때만). 상품 개요(etf-profiles)의 taxKind 가 있으면 그쪽이 먼저다.
 *   0204D0 KODEX 현대차로보틱스밸류체인TOP3플러스: 지수에 미국 상장 종목 포함, 운용사 페이지 "보유기간 과세" (2026-10-10 확인, samsungfund.com 2ETFV3)
 */
export const CONFIRMED_TAX_KIND: Record<string, EtfTaxKind> = {
  '0204D0': 'domestic-other',
};

export const TAX_KIND_LABEL: Record<EtfTaxKind, string> = {
  'domestic-equity': '국내주식형',
  'domestic-other': '국내 주식 중심, 보유기간 과세',
  'foreign-or-other': '해외·채권·원자재 등 기타형',
  derivative: '파생형(레버리지·인버스)',
};

/**
 * 파생형의 매매차익 과세: 해외·채권·원자재 지수이거나 스와프로 운용하면(합성, 이름에 '선물' 없는 단일종목) 과세,
 * 국내 주식·지수 선물(거래소 장내파생상품)로 운용하면 과세표준에서 빠진다. 이름으로 운용 방식을 짐작한 추정이라
 * 화면에서 운용사 과세 항목 확인을 함께 안내한다.
 */
function derivativeGainTax(name: string): GainTaxMode {
  const swapSingleStock = /단일종목/.test(name) && !/선물/.test(name);
  return FOREIGN_OR_OTHER.test(name) || swapSingleStock ? 'taxable' : 'base-excludes-domestic';
}

function gainTaxFor(kind: EtfTaxKind, name: string): GainTaxMode {
  switch (kind) {
    case 'domestic-equity':
      return 'exempt';
    case 'domestic-other':
      return 'base-excludes-domestic';
    case 'foreign-or-other':
      return 'taxable';
    default:
      return derivativeGainTax(name);
  }
}

/**
 * 이름 규칙으로 과세 구분을 추정한다. override 는 운용사 문서로 확인한 값.
 */
export function classifyEtfTax(name: string, override?: EtfTaxKind): EtfTaxClass {
  const make = (kind: EtfTaxKind, reason: string, confirmed: boolean): EtfTaxClass => ({
    kind,
    gainTax: gainTaxFor(kind, name),
    pensionAllowed: kind !== 'derivative',
    label: TAX_KIND_LABEL[kind],
    reason,
    confirmed,
  });
  if (override) return make(override, '운용사 상품 페이지·투자설명서의 과세 항목으로 확인한 구분입니다.', true);
  if (DERIVATIVE.test(name)) return make('derivative', '상품 이름에 레버리지·인버스가 있어 파생형으로 나눴습니다.', false);
  const foreign = name.match(FOREIGN_OR_OTHER);
  if (foreign) {
    return make('foreign-or-other', `상품 이름에 "${foreign[0]}" 표시가 있어 국내 주식만 담는 상품이 아니라고 나눴습니다.`, false);
  }
  const other = name.match(DOMESTIC_OTHER);
  if (other) {
    const reason =
      other[0] === 'TR'
        ? '배당을 나눠 주지 않고 재투자하는 TR 상품은 2025년 7월부터 국내주식형에서 빠졌습니다.'
        : `상품 이름에 "${other[0]}" 표시가 있어 국내 주식 지수를 그대로 따르는 상품이 아니라고 나눴습니다.`;
    return make('domestic-other', reason, false);
  }
  return make('domestic-equity', '상품 이름에 해외·채권·원자재·파생·액티브 표시가 없어 국내 주식 지수를 그대로 따르는 상품으로 나눴습니다.', false);
}
