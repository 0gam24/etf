/**
 * 같은 지수 이름을 쓰는 ETF 묶음 (/etf/[ticker]의 "운용사별 비교" 블록).
 *
 *   KRX 상품명은 "{운용사 브랜드} {지수·전략 이름}" 꼴이다. 브랜드를 떼고 표기를 정규화한
 *   "지수 키"가 같으면 같은 묶음으로 본다.
 *     KODEX 미국S&P500 · TIGER 미국S&P500 · ACE 미국S&P500 → 키 "미국S&P500"
 *   구조 차이는 키에 남겨 서로 다른 묶음이 되게 한다.
 *     괄호 표기(H·합성·AA-이상 등)는 정렬해 키 꼬리에 붙인다 → "미국S&P500(H)"는 별도 묶음.
 *     레버리지·인버스·액티브·커버드콜·TR·1호/2호는 본문 글자라 그대로 키에 남는다.
 *
 *   한계: 이름이 같다고 기초지수가 반드시 같지는 않다(산출 기관·환헤지·분배 기준이 다를 수 있다).
 *   그래서 화면 문구는 "같은 지수를 따른다"고 단정하지 않고 "같은 이름을 쓰는 상품"으로 안내하며,
 *   기초지수 확인을 투자설명서로 넘긴다. 1:1 비교 페이지(COMPARE_PAIRS)는 기초지수를 확인한 쌍만 있다.
 *
 *   데이터: data/krx-etf-codes.json(상장 목록), data/raw/etf_prices_*.json(종가·NAV·시가총액·거래대금),
 *         src/lib/etf-compare-pairs.ts(1:1 비교 페이지).
 */
import {
  getKrxEtfList,
  getKrxEtfMeta,
  getEtfPriceRecord,
  getEtfNavGap,
  codeToSlug,
  ymdToIsoDate,
} from './data';
import { COMPARE_PAIRS } from './etf-compare-pairs';

/**
 * 상품명 첫 어절로 쓰이는 운용사 브랜드.
 *   data/krx-etf-codes.json(baseDate 20261001, 1,171종)의 첫 어절을 전수 집계한 28개다.
 *   여기 없는 첫 어절을 가진 상품은 묶지 않는다(잘못 묶는 것보다 안전). 신규 브랜드가 상장되면 여기에 더한다.
 */
export const ETF_BRAND_PREFIXES: readonly string[] = [
  'KODEX', 'TIGER', 'RISE', 'ACE', 'PLUS', 'SOL', 'KIWOOM', 'HANARO', '1Q', 'KoAct', 'TIME', 'WON',
  '에셋플러스', 'IBK', '마이티', 'BNK', 'HK', 'FOCUS', 'MIDAS', '파워', 'UNICORN', 'DAISHIN',
  'TREX', 'TRUSTON', '아이엠에셋', '더제이', 'DS', 'KCGI',
];
const BRAND_SET = new Set(ETF_BRAND_PREFIXES);

export interface EtfIndexKey {
  /** 떼어 낸 운용사 브랜드 (첫 어절) */
  brand: string;
  /** 브랜드를 뗀 원래 표기. 화면 라벨로 쓴다 (예: "미국S&P500(H)") */
  label: string;
  /** label에서 괄호 표기를 뺀 원래 표기 (예: "미국S&P500") */
  baseLabel: string;
  /** 괄호 표기를 뺀 본문 정규화: 공백 제거, 영문 대문자 (예: "미국S&P500") */
  baseKey: string;
  /** 괄호 안 표기(H·합성 등). 대문자·중복 제거·정렬 */
  flags: string[];
  /** 묶음 키 = baseKey + (flags) */
  key: string;
}

/** 상품명 → 지수 키. 브랜드를 알 수 없거나 브랜드 뒤가 비면 null (묶지 않는다). */
export function getEtfIndexKey(name: string): EtfIndexKey | null {
  const trimmed = (name || '').replace(/\s+/g, ' ').trim();
  const sp = trimmed.indexOf(' ');
  if (sp <= 0) return null;
  const brand = trimmed.slice(0, sp);
  if (!BRAND_SET.has(brand)) return null;
  const label = trimmed.slice(sp + 1).trim();
  if (!label) return null;

  const flagSet = new Set<string>();
  const halfWidth = label.replace(/（/g, '(').replace(/）/g, ')');
  const withoutParens = halfWidth.replace(/\(([^)]*)\)/g, (_m, inner: string) => {
    for (const t of inner.split(/[\s,·/]+/)) {
      if (t) flagSet.add(t.toUpperCase());
    }
    return ' ';
  });
  const baseKey = withoutParens.replace(/＆/g, '&').replace(/\s+/g, '').toUpperCase();
  if (!baseKey) return null;
  const flags = [...flagSet].sort();
  return {
    brand,
    label,
    baseLabel: withoutParens.replace(/\s+/g, ' ').trim(),
    baseKey,
    flags,
    key: flags.length ? `${baseKey}(${flags.join(',')})` : baseKey,
  };
}

interface SiblingIndex {
  /** 대문자 단축코드 → 지수 키 */
  keyOf: Map<string, EtfIndexKey>;
  /** 지수 키 → 단축코드 목록 */
  byKey: Map<string, string[]>;
  /** 괄호 표기를 뺀 키 → 단축코드 목록 (환헤지·합성 등 구조만 다른 상품 찾기) */
  byBase: Map<string, string[]>;
  /** 상품명 (대문자 단축코드 → KRX 상품명) */
  nameOf: Map<string, string>;
}

let _index: SiblingIndex | null = null;

function loadSiblingIndex(): SiblingIndex {
  if (_index) return _index;
  const keyOf = new Map<string, EtfIndexKey>();
  const byKey = new Map<string, string[]>();
  const byBase = new Map<string, string[]>();
  const nameOf = new Map<string, string>();
  for (const e of getKrxEtfList()) {
    const code = (e.shortcode || '').toUpperCase();
    if (!code) continue;
    nameOf.set(code, e.name);
    const k = getEtfIndexKey(e.name);
    if (!k) continue;
    keyOf.set(code, k);
    const a = byKey.get(k.key);
    if (a) a.push(code); else byKey.set(k.key, [code]);
    const b = byBase.get(k.baseKey);
    if (b) b.push(code); else byBase.set(k.baseKey, [code]);
  }
  _index = { keyOf, byKey, byBase, nameOf };
  return _index;
}

export interface EtfSiblingRow {
  /** 대문자 단축코드 */
  code: string;
  slug: string;
  name: string;
  brand?: string;
  /** 종가 (원) */
  price?: number;
  /** 종가 기준일 YYYY-MM-DD */
  priceIsoDate?: string;
  /** 같은 날 종가·NAV로 계산한 괴리율(%). NAV가 없거나 이상치면 없음 */
  navGapPct?: number;
  /** 시가총액 (원) */
  marketCap?: number;
  /** 거래대금 (원) */
  tradeAmount?: number;
  /** 지금 보고 있는 페이지의 상품인가 */
  isCurrent: boolean;
  /** 이 상품과 현재 상품의 1:1 비교 페이지 슬러그 (COMPARE_PAIRS에 있을 때만) */
  comparePairSlug?: string;
}

export interface EtfComparePairLink {
  slug: string;
  partnerCode: string;
  partnerName: string;
  context: string;
}

export interface EtfSiblingInfo {
  /** 현재 상품의 지수 키 정보 (브랜드를 알 수 없으면 null) */
  indexKey: EtfIndexKey | null;
  /** 묶음 전체 상품 수 (현재 상품 포함). 묶음이 없으면 1 */
  groupSize: number;
  /** 화면 표: 현재 상품 + 같은 묶음의 다른 상품(시가총액 순 상위 limit개). 묶음이 1개뿐이면 빈 배열 */
  rows: EtfSiblingRow[];
  /** 괄호 표기만 다른 상품 (예: 미국S&P500 ↔ 미국S&P500(H)), 시가총액 순 상위 limit개 */
  variants: EtfSiblingRow[];
  /** 위 표에 없는 상대와의 1:1 비교 페이지 */
  extraPairs: EtfComparePairLink[];
  /** rows의 종가 기준일이 모두 같으면 그 날짜 YYYY-MM-DD */
  commonIsoDate: string | null;
  /** 지수 키 본문에 '액티브'가 들어 있는가 (지수를 그대로 따르지 않는 상품 안내용) */
  isActive: boolean;
}

/** 1:1 비교 페이지 중 이 코드가 들어 있고, 두 코드가 모두 KRX 목록에 있는 것 (페이지가 prerender되는 쌍) */
function comparePairsFor(code: string) {
  return COMPARE_PAIRS.filter(p => {
    const a = p.codeA.toUpperCase();
    const b = p.codeB.toUpperCase();
    if (a !== code && b !== code) return false;
    return !!getKrxEtfMeta(p.codeA) && !!getKrxEtfMeta(p.codeB);
  });
}

function buildRow(code: string, isCurrent: boolean, pairByPartner: Map<string, string>): EtfSiblingRow {
  const idx = loadSiblingIndex();
  const rec = getEtfPriceRecord(code);
  const gap = rec ? getEtfNavGap(rec.etf, rec.baseDate) : null;
  const row: EtfSiblingRow = {
    code,
    slug: codeToSlug(code),
    name: idx.nameOf.get(code) || rec?.etf.name || code,
    brand: idx.keyOf.get(code)?.brand,
    isCurrent,
  };
  if (rec) {
    row.price = rec.etf.price;
    row.priceIsoDate = ymdToIsoDate(rec.baseDate) || undefined;
    if (gap) row.navGapPct = gap.gapPct;
    if (typeof rec.etf.marketCap === 'number' && rec.etf.marketCap > 0) row.marketCap = rec.etf.marketCap;
    if (typeof rec.etf.tradeAmount === 'number' && rec.etf.tradeAmount >= 0) row.tradeAmount = rec.etf.tradeAmount;
  }
  const pairSlug = isCurrent ? undefined : pairByPartner.get(code);
  if (pairSlug) row.comparePairSlug = pairSlug;
  return row;
}

/** 시세 있는 상품 먼저, 시가총액 큰 순, 같으면 이름순 */
function compareRows(a: EtfSiblingRow, b: EtfSiblingRow): number {
  const ap = typeof a.price === 'number';
  const bp = typeof b.price === 'number';
  if (ap !== bp) return ap ? -1 : 1;
  const am = a.marketCap ?? -1;
  const bm = b.marketCap ?? -1;
  if (am !== bm) return bm - am;
  return a.name.localeCompare(b.name, 'ko');
}

/**
 * /etf/[ticker] 블록용: 같은 지수 이름을 쓰는 다른 상품, 괄호 표기만 다른 상품, 1:1 비교 페이지.
 *   셋 다 없으면 null (블록을 그리지 않는다).
 */
export function getEtfSiblings(code: string, limit = 6): EtfSiblingInfo | null {
  const upper = (code || '').toUpperCase();
  if (!upper) return null;
  const idx = loadSiblingIndex();
  const k = idx.keyOf.get(upper) || null;

  const pairs = comparePairsFor(upper);
  const pairByPartner = new Map<string, string>();
  for (const p of pairs) {
    const partner = p.codeA.toUpperCase() === upper ? p.codeB.toUpperCase() : p.codeA.toUpperCase();
    if (!pairByPartner.has(partner)) pairByPartner.set(partner, p.slug);
  }

  let rows: EtfSiblingRow[] = [];
  let variants: EtfSiblingRow[] = [];
  let groupSize = 1;
  if (k) {
    const members = idx.byKey.get(k.key) || [];
    groupSize = Math.max(1, members.length);
    if (members.length >= 2) {
      const others = members
        .filter(c => c !== upper)
        .map(c => buildRow(c, false, pairByPartner))
        .sort(compareRows)
        .slice(0, limit);
      rows = [...others, buildRow(upper, true, pairByPartner)].sort(compareRows);
    }
    variants = (idx.byBase.get(k.baseKey) || [])
      .filter(c => c !== upper && idx.keyOf.get(c)?.key !== k.key)
      .map(c => buildRow(c, false, pairByPartner))
      .sort(compareRows)
      .slice(0, limit);
  }

  const shown = new Set(rows.map(r => r.code));
  const extraPairs: EtfComparePairLink[] = [];
  for (const p of pairs) {
    const partner = p.codeA.toUpperCase() === upper ? p.codeB.toUpperCase() : p.codeA.toUpperCase();
    if (shown.has(partner)) continue;
    extraPairs.push({
      slug: p.slug,
      partnerCode: partner,
      partnerName: idx.nameOf.get(partner) || getKrxEtfMeta(partner)?.name || partner,
      context: p.context,
    });
  }

  if (rows.length === 0 && variants.length === 0 && extraPairs.length === 0) return null;

  const dates = new Set(rows.map(r => r.priceIsoDate).filter((d): d is string => !!d));
  const commonIsoDate = dates.size === 1 ? [...dates][0] : null;

  return {
    indexKey: k,
    groupSize,
    rows,
    variants,
    extraPairs,
    commonIsoDate,
    isActive: !!k && k.baseKey.includes('액티브'),
  };
}

/**
 * 묶음 전체 목록 (검토·점검용). 상품 수 내림차순, 같으면 시가총액 합 내림차순.
 *   페이지 렌더에는 쓰지 않는다.
 */
export function getEtfSiblingGroups(minSize = 2): Array<{
  key: string;
  label: string;
  size: number;
  totalMarketCap: number;
  members: Array<{ code: string; name: string; marketCap?: number }>;
}> {
  const idx = loadSiblingIndex();
  const out: ReturnType<typeof getEtfSiblingGroups> = [];
  for (const [key, codes] of idx.byKey) {
    if (codes.length < minSize) continue;
    const rows = codes.map(c => buildRow(c, false, new Map())).sort(compareRows);
    out.push({
      key,
      label: idx.keyOf.get(rows[0].code)?.label || key,
      size: codes.length,
      totalMarketCap: rows.reduce((s, r) => s + (r.marketCap || 0), 0),
      members: rows.map(r => ({ code: r.code, name: r.name, ...(r.marketCap ? { marketCap: r.marketCap } : {}) })),
    });
  }
  out.sort((a, b) => b.size - a.size || b.totalMarketCap - a.totalMarketCap);
  return out;
}

/** 브랜드 목록 점검용: 첫 어절이 ETF_BRAND_PREFIXES에 없는 상품 (0건이어야 정상) */
export function getUnknownBrandEtfs(): Array<{ code: string; name: string }> {
  return getKrxEtfList()
    .filter(e => !BRAND_SET.has((e.name || '').trim().split(/\s+/)[0]))
    .map(e => ({ code: e.shortcode, name: e.name }));
}
