/**
 * 가이드 주제 허브 (/guide/category/{key}) 정의 (2026-10-14).
 *
 * 홈의 주제별 선반 "전체 보기"가 모두 /guide 한 곳으로 가서, 검색엔진이 ISA·연금·세금 같은 주제 묶음을
 * 따로 이해할 페이지가 없었다. 가이드의 section(23개)을 독자가 찾는 주제 11개로 묶고, 묶음마다
 * 고유한 제목·설명·소개글·관련 계산기·관련 비교 페이지를 둔다. 가이드를 추가하면 section 으로 자동 배정된다.
 *
 * 소개글의 세율·한도는 src/lib/account-tax-rules.ts 와 같은 값(2026-10-14 법령 대조)만 쓴다.
 */
import { GUIDES, getGuidePublishedAt, getGuideModifiedAt, type GuideDef } from './guides';

export interface GuideCategory {
  key: string;
  /** 짧은 이름 (선반·빵부스러기) */
  label: string;
  sections: GuideDef['section'][];
  /** <title> (layout 이 " | Daily ETF Pulse"를 붙인다) */
  title: string;
  /** meta description 120~155자 */
  description: string;
  h1: string;
  /** 상단 소개글 200~300자 */
  intro: string;
  keywords: string[];
  tool: { href: string; label: string };
  /** 관련 비교 페이지 슬러그 (src/lib/etf-compare-pairs.ts) */
  comparePairs: string[];
}

export const GUIDE_CATEGORIES: GuideCategory[] = [
  {
    key: 'isa',
    label: 'ISA 계좌',
    sections: ['ISA 계좌 가이드'],
    title: 'ISA 계좌 ETF 가이드: 비과세 한도·만기·연금 이전',
    description:
      '중개형 ISA로 ETF를 굴릴 때 알아야 할 비과세 한도(일반형 200만원·서민형 400만원), 초과분 9.9% 분리과세, 의무 가입 3년, 만기 후 연금계좌 이전까지 주제별 가이드를 모았습니다.',
    h1: 'ISA 계좌로 ETF 투자할 때 보는 가이드',
    intro:
      '중개형 ISA는 계좌 안에서 생긴 이자·배당과 과세되는 매매차익을 서로 통산한 뒤, 순이익 200만원(서민형 400만원)까지 세금을 매기지 않고 넘는 부분만 9.9%로 분리과세하는 계좌입니다. 의무 가입 기간은 3년이고 연 2,000만원까지 넣을 수 있습니다. 어떤 ETF를 담아야 절세 효과가 큰지, 만기에 해지할지 연금계좌로 옮길지를 아래 가이드에서 상황별로 다룹니다.',
    keywords: ['ISA ETF', 'ISA 비과세 한도', 'ISA 만기', 'ISA 연금 이전', '중개형 ISA'],
    tool: { href: '/tools/tax-compare', label: '계좌별 세후 수익률 비교 계산기' },
    comparePairs: ['kodex-us-sp500-vs-kodex-us-sp500-h', 'kodex-us-nasdaq100-vs-tiger-us-nasdaq100'],
  },
  {
    key: 'pension',
    label: '연금저축·IRP',
    sections: ['은퇴 자산 가이드'],
    title: '연금저축·IRP ETF 가이드: 세액공제·위험자산 70%·수령',
    description:
      '연금저축과 IRP로 ETF를 살 때의 세액공제 한도, IRP·DC 위험자산 70% 한도, 레버리지·인버스 매수 제한, 연금 수령 때 연금소득세 3.3~5.5%까지 은퇴 자산 가이드를 모았습니다.',
    h1: '연금저축·IRP로 ETF 투자할 때 보는 가이드',
    intro:
      '연금저축과 IRP는 운용하는 동안 분배금과 매매차익에 세금을 매기지 않고, 나중에 연금으로 받을 때 나이에 따라 3.3~5.5%의 연금소득세를 매깁니다. 납입액은 연금저축 600만원, IRP를 합쳐 900만원까지 세액공제 대상이고, IRP·DC 퇴직연금은 주식형 ETF 같은 위험자산을 적립금의 70%까지만 담을 수 있습니다. 계좌 선택부터 수령 시점까지 아래 가이드에서 차례로 다룹니다.',
    keywords: ['연금저축 ETF', 'IRP ETF', '연금 세액공제', '위험자산 70%', '연금소득세'],
    tool: { href: '/tools/tax-compare', label: '계좌별 세후 수익률 비교 계산기' },
    comparePairs: ['kodex-200-vs-tiger-200', 'sol-us-dividend-djones-vs-tiger-us-dividend-djones'],
  },
  {
    key: 'tax',
    label: 'ETF 세금',
    sections: ['ETF 세금 가이드'],
    title: 'ETF 세금 가이드: 매매차익·분배금·금융소득 종합과세',
    description:
      'ETF 매매차익이 비과세인 경우와 보유기간 과세인 경우, 분배금 15.4% 원천징수, 금융소득 2,000만원 초과 종합과세, 해외 직접 투자와의 차이까지 ETF 세금 가이드를 모았습니다.',
    h1: 'ETF 세금, 무엇이 언제 과세되나',
    intro:
      '국내 주식만으로 만든 지수를 그대로 따르는 ETF는 일반 계좌에서 매매차익이 비과세이고, 해외 주식·채권·원자재 ETF는 매매차익도 배당소득으로 15.4%가 원천징수됩니다. 분배금은 종류와 관계없이 배당소득이며, 이자와 배당을 합친 금융소득이 한 해 2,000만원을 넘으면 넘는 부분은 다른 소득과 합쳐 과세됩니다. 상품 유형과 계좌별로 달라지는 세금을 아래 가이드에서 나눠 설명합니다.',
    keywords: ['ETF 세금', 'ETF 매매차익 세금', 'ETF 분배금 세금', '금융소득 종합과세', '보유기간 과세'],
    tool: { href: '/tools/tax-compare', label: '계좌별 세후 수익률 비교 계산기' },
    comparePairs: ['kodex-us-sp500-vs-kodex-us-sp500-h', 'kodex-200-vs-tiger-200'],
  },
  {
    key: 'dividend',
    label: '분배금·월배당',
    sections: ['월배당 가이드', 'ETF 분배금 가이드', '커버드콜 가이드', '배당주 가이드'],
    title: '월배당·분배금 ETF 가이드: 분배락일·커버드콜·세금',
    description:
      'ETF 분배금을 받으려면 언제까지 사야 하는지, 분배락일과 지급일, 월배당 ETF와 커버드콜 ETF의 구조와 한계, 분배금에 붙는 세금까지 배당·분배 가이드를 한곳에 모았습니다.',
    h1: '월배당·분배금 ETF를 고를 때 보는 가이드',
    intro:
      '국내 ETF는 매수 후 2영업일 뒤 결제되므로 분배금을 받으려면 지급기준일 2영업일 전까지 사 두어야 하고, 기준일 바로 전 영업일이 분배락일이 됩니다. 월배당 ETF는 상품마다 기준일이 달라 월말형과 월중형이 나뉘고, 커버드콜 ETF는 옵션 프리미엄으로 분배를 늘리는 대신 주가가 오를 때 상승분 일부를 포기합니다. 분배 일정과 구조, 세금을 아래 가이드에서 차례로 다룹니다.',
    keywords: ['월배당 ETF', 'ETF 분배금', 'ETF 분배락일', '커버드콜 ETF', '배당 ETF'],
    tool: { href: '/tools/dividend-calculator', label: 'ETF 분배금 계산기' },
    comparePairs: ['sol-us-dividend-djones-vs-tiger-us-dividend-djones', 'kodex-us-dividend-djones-vs-ace-us-dividend-djones'],
  },
  {
    key: 'compare',
    label: 'ETF 비교',
    sections: ['ETF 비교 가이드'],
    title: 'ETF 비교 가이드: 같은 지수 상품 고르는 기준',
    description:
      '같은 지수를 따르는 ETF가 여러 운용사에서 나올 때 무엇으로 고를지, 총보수와 실제 비용, 분배 기준일, 환헤지 여부, 거래량 차이를 비교하는 가이드와 1:1 비교 페이지를 모았습니다.',
    h1: '비슷한 ETF 중에서 고르는 기준',
    intro:
      '같은 지수를 따르는 ETF는 담는 종목이 거의 같아도 총보수와 기타비용, 분배금 기준일, 환헤지 여부, 상장 시기와 거래량이 서로 다릅니다. 장기 보유라면 해마다 빠지는 비용 차이가 쌓이고, 자주 사고판다면 호가 간격과 거래량이 더 중요해집니다. 아래 가이드는 비교할 항목을 하나씩 짚고, 같은 지수 상품을 나란히 놓은 1:1 비교 페이지로 이어집니다.',
    keywords: ['ETF 비교', '같은 지수 ETF', 'ETF 고르는 법', 'ETF 총보수 비교', '환헤지 ETF'],
    tool: { href: '/tools/tax-compare', label: '계좌별 세후 수익률 비교 계산기' },
    comparePairs: ['kodex-200-vs-tiger-200', 'kodex-us-nasdaq100-vs-tiger-us-nasdaq100'],
  },
  {
    key: 'cost',
    label: '비용·괴리율',
    sections: ['ETF 비용 가이드', 'ETF 괴리율 가이드'],
    title: 'ETF 비용·괴리율 가이드: 총보수·실부담비용·NAV',
    description:
      'ETF 총보수만으로 알 수 없는 기타비용과 매매 비용, 실부담비용의 차이, 시장가격이 순자산가치(NAV)와 벌어지는 괴리율이 생기는 이유와 확인 방법을 다룬 가이드를 모았습니다.',
    h1: 'ETF 비용과 괴리율, 실제로 얼마나 빠지나',
    intro:
      'ETF 비용은 운용사가 공시하는 총보수 말고도 지수사용료 같은 기타비용과 매매할 때 드는 증권거래비용이 있어, 금융투자협회 공시의 총보수·비용 비율로 보아야 실제 부담에 가깝습니다. 시장가격이 순자산가치와 벌어진 정도인 괴리율은 해외 상품이나 거래가 적은 상품에서 커지기 쉽습니다. 비용과 괴리율을 확인하는 방법을 아래 가이드에서 다룹니다.',
    keywords: ['ETF 총보수', 'ETF 실부담비용', 'ETF 괴리율', 'ETF NAV', 'ETF 비용 비교'],
    tool: { href: '/tools/dividend-calculator', label: 'ETF 분배금 계산기' },
    comparePairs: ['kodex-200-vs-tiger-200', 'kodex-us-sp500-vs-kodex-us-sp500-h'],
  },
  {
    key: 'overseas',
    label: '해외 지수·환율',
    sections: ['해외상장 가이드', '환헤지 가이드', 'ETF 달러 가이드'],
    title: '해외 지수 ETF 가이드: 국내 상장 vs 직접 투자·환헤지',
    description:
      '미국 S&P500·나스닥100 같은 해외 지수를 국내 상장 ETF로 살지 해외에서 직접 살지, 양도소득세 22%와 배당소득세 15.4%의 차이, 환헤지(H) 상품을 고르는 기준까지 모았습니다.',
    h1: '해외 지수 ETF, 국내 상장으로 살까 직접 살까',
    intro:
      '같은 미국 지수라도 국내 상장 ETF로 사면 매매차익과 분배금이 배당소득으로 15.4% 원천징수되고 금융소득 종합과세에 합산되며, 해외 상장 ETF를 직접 사면 매매차익에 연 250만원 공제 뒤 22% 양도소득세가 붙습니다. 국내 상장 상품은 ISA와 연금계좌에 담을 수 있다는 점이 다릅니다. 환율 변동을 막는 환헤지형을 고를지까지 아래 가이드에서 비교합니다.',
    keywords: ['해외 ETF 세금', '국내 상장 해외 ETF', '환헤지 ETF', 'S&P500 ETF', '해외 직접 투자 양도세'],
    tool: { href: '/tools/tax-compare', label: '계좌별 세후 수익률 비교 계산기' },
    comparePairs: ['kodex-us-sp500-vs-kodex-us-sp500-h', 'kodex-us-nasdaq100-vs-tiger-us-nasdaq100'],
  },
  {
    key: 'theme',
    label: '테마 ETF',
    sections: ['테마 ETF 가이드'],
    title: '테마 ETF 가이드: 반도체·방산·조선·2차전지',
    description:
      '반도체·방산·조선·2차전지·AI 전력처럼 산업 테마에 투자하는 ETF의 구성 방식, 같은 테마 상품 사이의 차이, 집중 투자의 위험을 테마별 가이드로 모았습니다.',
    h1: '테마 ETF, 같은 이름이라도 담는 종목이 다르다',
    intro:
      '테마 ETF는 같은 산업 이름을 달아도 기초지수가 종목을 고르는 방식과 한 종목에 줄 수 있는 비중 상한이 상품마다 달라, 실제로 담는 종목과 성과가 크게 갈립니다. 소수 종목에 집중하는 상품은 업황이 꺾일 때 손실 폭도 커집니다. 테마별 구조와 같은 테마 상품을 비교하는 기준을 아래 가이드에서 다룹니다.',
    keywords: ['테마 ETF', '반도체 ETF', '방산 ETF', '조선 ETF', '2차전지 ETF'],
    tool: { href: '/tools/dividend-calculator', label: 'ETF 분배금 계산기' },
    comparePairs: ['kodex-semiconductor-vs-tiger-semiconductor', 'kodex-defense-top10-vs-plus-k-defense'],
  },
  {
    key: 'bond',
    label: '채권 ETF',
    sections: ['ETF 채권 가이드'],
    title: '채권 ETF 가이드: 금리와 가격·만기·파킹형',
    description:
      '금리가 오르내릴 때 채권 ETF 가격이 움직이는 원리, 만기와 듀레이션, 단기채·파킹형 상품의 쓰임, 채권 ETF 분배금과 세금까지 채권 ETF 가이드를 모았습니다.',
    h1: '채권 ETF, 금리에 따라 어떻게 움직이나',
    intro:
      '채권 ETF는 금리가 오르면 가격이 내리고 금리가 내리면 가격이 오르며, 만기가 길수록 같은 금리 변화에 가격이 더 크게 움직입니다. 단기채와 금리형 상품은 가격 변동이 작아 대기 자금을 두는 용도로 쓰이고, 장기채는 금리 하락에 거는 성격이 강합니다. 채권 ETF의 매매차익은 일반 계좌에서 과세된다는 점도 함께 따져야 합니다.',
    keywords: ['채권 ETF', '단기채 ETF', '파킹형 ETF', '금리 ETF', '국채 ETF'],
    tool: { href: '/tools/tax-compare', label: '계좌별 세후 수익률 비교 계산기' },
    comparePairs: ['kodex-200-vs-tiger-200', 'kodex-us-sp500-vs-kodex-us-sp500-h'],
  },
  {
    key: 'basics',
    label: 'ETF 입문·매매',
    sections: ['ETF 입문 가이드', 'ETF 매매 가이드', 'ETF 적립식 가이드', 'ETF 리밸런싱 가이드'],
    title: 'ETF 입문·매매 가이드: 사는 법·적립식·리밸런싱',
    description:
      'ETF를 처음 살 때 알아야 할 주문 방법과 호가, 매달 나눠 사는 적립식 투자, 비중을 다시 맞추는 리밸런싱까지 ETF 입문·매매 가이드를 한곳에 모았습니다.',
    h1: 'ETF 처음 시작할 때 보는 가이드',
    intro:
      'ETF는 주식처럼 증권 계좌에서 사고팔지만, 시장가격 말고도 순자산가치와 호가 간격, 거래량을 함께 보아야 원하는 값에 살 수 있습니다. 매달 같은 금액을 나눠 사는 적립식은 사는 시점을 고르는 부담을 줄이고, 정해 둔 비중에서 벗어날 때 다시 맞추는 리밸런싱은 위험을 일정하게 유지하는 방법입니다. 시작부터 관리까지 아래 가이드에서 순서대로 다룹니다.',
    keywords: ['ETF 입문', 'ETF 사는 법', 'ETF 적립식', 'ETF 리밸런싱', 'ETF 매매'],
    tool: { href: '/tools/dividend-calculator', label: 'ETF 분배금 계산기' },
    comparePairs: ['kodex-200-vs-tiger-200', 'kodex-us-sp500-vs-kodex-us-sp500-h'],
  },
  {
    key: 'alternative',
    label: '레버리지·원자재·리츠',
    sections: ['ETF 레버리지 가이드', 'ETF 원자재 가이드', 'ETF 금 가이드', 'ETF 리츠 가이드'],
    title: '레버리지·원자재·리츠 ETF 가이드: 구조와 위험',
    description:
      '레버리지·인버스 ETF가 장기 보유에서 지수 배수와 어긋나는 이유, 금·원유 같은 원자재 ETF의 선물 구조, 리츠 ETF의 분배 특성과 연금계좌 매수 제한까지 모았습니다.',
    h1: '레버리지·원자재·리츠 ETF, 구조부터 알고 사기',
    intro:
      '레버리지·인버스 ETF는 하루 수익률의 배수를 따르기 때문에 오래 들고 있으면 기간 수익률이 지수의 배수와 어긋날 수 있고, 연금저축·IRP에서는 살 수 없습니다. 원자재 ETF는 대부분 선물을 담아 만기 교체 비용이 생기고, 리츠 ETF는 임대 수익에서 나오는 분배가 큰 대신 금리에 민감합니다. 상품별 구조와 위험을 아래 가이드에서 나눠 설명합니다.',
    keywords: ['레버리지 ETF', '인버스 ETF', '원자재 ETF', '금 ETF', '리츠 ETF'],
    tool: { href: '/tools/tax-compare', label: '계좌별 세후 수익률 비교 계산기' },
    comparePairs: ['kodex-200-vs-kodex-leverage', 'sol-shipbuilding-top3plus-leverage-vs-kodex-shipbuilding'],
  },
];

const BY_KEY = new Map(GUIDE_CATEGORIES.map(c => [c.key, c]));
const BY_SECTION = new Map<string, GuideCategory>();
for (const c of GUIDE_CATEGORIES) for (const s of c.sections) BY_SECTION.set(s, c);

export function getGuideCategory(key: string): GuideCategory | null {
  return BY_KEY.get(key) ?? null;
}

/** 가이드 section 이 속한 주제 허브 */
export function getCategoryForSection(section: string): GuideCategory | null {
  return BY_SECTION.get(section) ?? null;
}

export function categoryHref(c: GuideCategory): string {
  return `/guide/category/${c.key}`;
}

/** 실제로 고친 날 → 발행일 → lastReviewed 순으로 본 가이드의 날짜 */
export function guideDate(g: GuideDef): string {
  return getGuideModifiedAt(g.slug) || getGuidePublishedAt(g.slug) || g.lastReviewed || '';
}

/** 허브에 속한 가이드, 최근에 쓰거나 고친 순 */
export function getGuidesInCategory(c: GuideCategory): GuideDef[] {
  const set = new Set(c.sections);
  return GUIDES.filter(g => set.has(g.section)).sort((a, b) => guideDate(b).localeCompare(guideDate(a)));
}

// 가이드 제목·키워드에 나오는 말로 관련 비교 페이지를 고른다. 맞는 것이 없으면 주제 허브의 기본 비교 페이지.
const COMPARE_BY_KEYWORD: { re: RegExp; slug: string }[] = [
  { re: /나스닥\s?100|나스닥100|QQQ/i, slug: 'kodex-us-nasdaq100-vs-tiger-us-nasdaq100' },
  { re: /S&P\s?500|S&P500|SPY|미국\s?지수/i, slug: 'kodex-us-sp500-vs-kodex-us-sp500-h' },
  { re: /배당다우존스|SCHD|미국\s?배당/i, slug: 'sol-us-dividend-djones-vs-tiger-us-dividend-djones' },
  { re: /반도체/, slug: 'kodex-semiconductor-vs-tiger-semiconductor' },
  { re: /방산/, slug: 'kodex-defense-top10-vs-plus-k-defense' },
  { re: /2차전지|배터리/, slug: 'kodex-battery-vs-tiger-battery' },
  { re: /조선/, slug: 'sol-shipbuilding-top3plus-leverage-vs-kodex-shipbuilding' },
  { re: /레버리지|인버스/, slug: 'kodex-200-vs-kodex-leverage' },
  { re: /코스피|KOSPI|200/i, slug: 'kodex-200-vs-tiger-200' },
];

/** 가이드 하단 링크 묶음: 같은 주제 허브, 관련 비교 2개, 관련 계산기 1개 */
export function getGuideLinkCluster(g: GuideDef): { category: GuideCategory | null; comparePairs: string[]; tool: { href: string; label: string } } {
  const category = getCategoryForSection(g.section);
  const text = [g.title, ...(g.keywords || [])].join(' ');
  const picked: string[] = [];
  for (const { re, slug } of COMPARE_BY_KEYWORD) {
    if (picked.length >= 2) break;
    if (re.test(text) && !picked.includes(slug)) picked.push(slug);
  }
  for (const slug of category?.comparePairs || ['kodex-200-vs-tiger-200', 'kodex-us-sp500-vs-kodex-us-sp500-h']) {
    if (picked.length >= 2) break;
    if (!picked.includes(slug)) picked.push(slug);
  }
  return {
    category,
    comparePairs: picked,
    tool: category?.tool || { href: '/tools/tax-compare', label: '계좌별 세후 수익률 비교 계산기' },
  };
}
