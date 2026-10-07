import fs from 'fs';
import path from 'path';
// etf_portfolios는 CommonJS · 정적 import로 NFT 추적 범위 최소화
import portfoliosModule from '../../agents/etf_portfolios';
import { getIncomeRegistry } from './income-server';
import type { IncomeEtf } from './income';
import { getEtfProfile, type EtfProfile } from './etf-profiles';

// 데이터 폴더 경로
const RAW_DATA_DIR = path.join(process.cwd(), 'data', 'raw');
const HOLDINGS_DIR = path.join(process.cwd(), 'data', 'holdings');

export interface HoldingItem {
  name: string;
  ticker: string;
  weight: number;
}

export interface EtfHoldings {
  code: string;
  name: string;
  asOf: string;
  source: string;
  type: 'equity' | 'bond' | 'commodity' | 'mixed';
  market?: 'KR' | 'US' | 'CN' | 'JP';
  leverage?: number;
  holdings: HoldingItem[];
}

/**
 * 특정 접두사(prefix)를 가진 파일 중 가장 최신 파일을 찾아 읽어옵니다.
 */
function getLatestJsonFile(prefix: string) {
  if (!fs.existsSync(RAW_DATA_DIR)) return null;

  const files = fs.readdirSync(RAW_DATA_DIR)
    .filter(file => file.startsWith(prefix) && file.endsWith('.json'))
    .sort()
    .reverse(); // 가장 최신(이름순 내림차순) 파일이 첫 번째에 오도록 정렬

  if (files.length === 0) return null;

  const latestFile = files[0];
  const filePath = path.join(RAW_DATA_DIR, latestFile);
  
  try {
    const rawData = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error(`데이터 파일 읽기 실패: ${filePath}`, error);
    return null;
  }
}

/**
 * 가장 최근에 수집된 ETF 시세 데이터를 가져옵니다.
 */
export function getLatestEtfData() {
  const fileData = getLatestJsonFile('etf_prices_');
  if (!fileData) return null;
  return fileData.data; // DataMiner 구조상 실제 데이터는 "data" 필드 안에 있음
}

/**
 * 가장 최근에 수집된 경제 지표 데이터를 가져옵니다.
 */
export function getLatestEcoData() {
  const fileData = getLatestJsonFile('economic_indicators_');
  if (!fileData) return null;
  return fileData.data;
}

/**
 * 특정 ETF 종목코드의 구성종목(holdings) 데이터를 가져옵니다.
 *   조회 순서:
 *     1) data/holdings/{code}.json  (프론트 전용 캐시, 이슈코드 0080G0 등 키)
 *     2) agents/etf_portfolios.js   (에이전트 공용 DB, KRX 6자리 종목코드 449450 등 키)
 *        - issueCode 필드가 주어진 code와 일치하는 basket 타입 엔트리를 찾아 매핑
 *        - 키 자체가 code와 일치하는 엔트리도 매칭
 *   어느 쪽에도 없으면 null.
 */
export function getEtfHoldings(code: string): EtfHoldings | null {
  if (!code) return null;

  // 1차: data/holdings/{code}.json
  const file = path.join(HOLDINGS_DIR, `${code}.json`);
  if (fs.existsSync(file)) {
    try {
      const raw = fs.readFileSync(file, 'utf-8');
      return JSON.parse(raw) as EtfHoldings;
    } catch (err) {
      console.error(`holdings 파싱 실패: ${code}`, err);
    }
  }

  // 2차: agents/etf_portfolios.js 폴백 (basket 타입만 프론트 카드로 변환)
  return getEtfHoldingsFromPortfolios(code);
}

/**
 * /etf/{ticker} 색인 여부 단일 판정 (SSoT).
 *   generateMetadata(robots)와 sitemap-etf.xml이 getEtfPageFacts()를 거쳐 이 함수 하나로 판정한다.
 *
 *   2026-09-30 재설계:
 *   - 이전 규칙(시세 OR 구성종목 OR 관련글)은 "그날 수집된 시세 파일에 있느냐"에 묶여 있어서,
 *     2026-06-01 수집 상한 버그(100종만 수신)와 맞물려 약 1,009쪽이 noindex로 떨어졌다(08-12 해소).
 *     → 시세는 "그 종목이 들어 있는 가장 최근 스냅샷"(나이 무관)에서 찾는다. 수집이 며칠 실패하거나
 *       한 번 일부만 받아도 직전 스냅샷을 쓰므로 수집 실패가 noindex로 번지지 않는다.
 *   - 반대로 가격 숫자만 다른 페이지(고유 수치가 가격뿐)는 색인하지 않는다.
 *     가격 외 고유 수치 = NAV로 계산한 괴리율(이상치 제외) 또는 구성종목 또는 분배 정보.
 *   - 관련 분석글 수는 더 이상 쓰지 않는다(글이 붙어도 종목 데이터가 비면 빈 페이지다).
 */
export function shouldIndexEtf(args: {
  /** data/etf-slug-map.json에 정식 슬러그가 있는가 */
  hasSlug: boolean;
  /** 가장 최근 스냅샷(나이 무관)에 시세가 있는가 */
  hasPrice: boolean;
  /** NAV로 계산한 괴리율이 표시 가능한가 (|괴리율| ≤ NAV_GAP_MAX_ABS) */
  hasNavGap: boolean;
  /** 구성종목 데이터 1건 이상 */
  hasHoldings: boolean;
  /** 분배 정보(dividend-registry) 보유 */
  hasIncome: boolean;
  /** 1차 출처로 확인한 상품 개요(src/lib/etf-profiles.ts) 보유. 2026-10-07 */
  hasProfile?: boolean;
}): boolean {
  if (!args.hasSlug || !args.hasPrice) return false;
  return args.hasNavGap || args.hasHoldings || args.hasIncome || !!args.hasProfile;
}

interface PortfolioEntry {
  type: string;
  issueCode?: string;
  name: string;
  updated?: string;
  source?: string;
  holdings?: Array<{ rank?: number; name: string; code?: string; weight: number; note?: string }>;
}

function getEtfHoldingsFromPortfolios(code: string): EtfHoldings | null {
  try {
    const portfolios = (portfoliosModule as unknown as { PORTFOLIOS: Record<string, PortfolioEntry> }).PORTFOLIOS;
    if (!portfolios) return null;

    // 키가 일치하거나 issueCode가 일치하는 엔트리를 basket 타입에서 탐색
    const entry = Object.entries(portfolios).find(([key, p]) =>
      (key === code || p.issueCode === code) && p.type === 'basket' && Array.isArray(p.holdings),
    );
    if (!entry) return null;

    const [key, p] = entry;
    return {
      code,
      name: p.name,
      asOf: p.updated || '',
      source: p.source || `portfolio:${key}`,
      type: 'equity',
      holdings: (p.holdings || []).map(h => ({
        name: h.name,
        ticker: h.code || '',
        weight: h.weight,
      })),
    };
  } catch {
    return null;
  }
}

/**
 * 최근 N일치 ETF 시세 데이터를 최신순으로 반환.
 *   파일명 규칙: etf_prices_YYYYMMDD.json
 *   파이프라인이 매일 적재하면 자동으로 시계열이 늘어납니다.
 */
export interface EtfPriceRow {
  code: string;
  name: string;
  price: number;
  change: number;
  changeRate: number;
  volume: number;
  tradeAmount?: number;
  marketCap?: number;
  /** 기준일 순자산가치(NAV). data.go.kr 증권상품시세 응답의 nav */
  nav?: number;
  openPrice?: number;
  highPrice?: number;
  lowPrice?: number;
  sector?: string;
  /** 시세 기준일 YYYYMMDD (스냅샷 baseDate와 같다) */
  date?: string;
}

export interface EtfSnapshot {
  baseDate: string;
  fetchedAt: string;
  etfList: EtfPriceRow[];
}

// ─────────────────────────────────────────────────────────────────────
// KRX 공식 단축코드 매핑 — data/krx-etf-codes.json (KRX 상장 ETF 전 종목)
// scripts/fetch-etf-codes.mjs로 갱신. KRX 공공데이터 srtnCd 기준.
// ─────────────────────────────────────────────────────────────────────
const KRX_CODES_FILE = path.join(process.cwd(), 'data', 'krx-etf-codes.json');

export interface KrxEtfCode {
  shortcode: string;
  issueCode: string; // ISIN (KR7...)
  name: string;
}

interface KrxCodeRegistry {
  fetchedAt: string;
  baseDate: string;
  count: number;
  byShortcode: Record<string, KrxEtfCode>;
  byIssueCode: Record<string, KrxEtfCode>;
  list: KrxEtfCode[];
}

let _krxCache: KrxCodeRegistry | null = null;
function loadKrxRegistry(): KrxCodeRegistry {
  if (_krxCache) return _krxCache;
  if (!fs.existsSync(KRX_CODES_FILE)) {
    _krxCache = { fetchedAt: '', baseDate: '', count: 0, byShortcode: {}, byIssueCode: {}, list: [] };
    return _krxCache;
  }
  try {
    _krxCache = JSON.parse(fs.readFileSync(KRX_CODES_FILE, 'utf-8')) as KrxCodeRegistry;
  } catch {
    _krxCache = { fetchedAt: '', baseDate: '', count: 0, byShortcode: {}, byIssueCode: {}, list: [] };
  }
  return _krxCache;
}

/**
 * 입력값을 KRX 공식 단축코드(srtnCd) 기준으로 해결.
 *   /etf/[ticker] URL의 ticker는 KRX 단축코드(예: 069500, 0080G0).
 *   - input이 shortcode면 그대로 사용
 *   - input이 ISIN(KR7...)이면 byIssueCode로 역매칭
 *   매핑 누락 시 input을 그대로 반환 (404 trigger)
 */
export function resolveEtfTicker(input: string): {
  shortcode?: string;
  issueCode?: string;
  name?: string;
  /** URL slug — shortcode 우선, 없으면 input lowercase */
  canonicalSlug: string;
} {
  if (!input) return { canonicalSlug: '' };
  const upper = input.toUpperCase();
  const lower = input.toLowerCase();
  const krx = loadKrxRegistry();

  // case A: input이 KRX shortcode
  const direct = krx.byShortcode[upper] || krx.byShortcode[input];
  if (direct) {
    return {
      shortcode: direct.shortcode,
      issueCode: direct.issueCode,
      name: direct.name,
      canonicalSlug: direct.shortcode.toLowerCase(),
    };
  }

  // case B: input이 ISIN
  const byIsin = krx.byIssueCode[upper];
  if (byIsin) {
    return {
      shortcode: byIsin.shortcode,
      issueCode: byIsin.issueCode,
      name: byIsin.name,
      canonicalSlug: byIsin.shortcode.toLowerCase(),
    };
  }

  // 매핑 없음 — fallback (typo / 신규 상장 / 폐지 종목)
  return { canonicalSlug: lower };
}

/** etfList(시세)에서 shortcode 또는 issueCode로 매칭. */
export function findEtfByAnyCode<T extends { code: string }>(etfList: T[], input: string): T | null {
  const resolved = resolveEtfTicker(input);
  const candidates = [resolved.shortcode, resolved.issueCode, input]
    .filter((x): x is string => Boolean(x))
    .map(c => c.toUpperCase());
  return etfList.find(e => candidates.includes(e.code.toUpperCase())) || null;
}

/** KRX에 등록된 모든 ETF shortcode (1000+) — generateStaticParams·sitemap용 */
export function getKnownShortcodes(): string[] {
  return loadKrxRegistry().list.map(e => e.shortcode);
}

// ─────────────────────────────────────────────────────────────────────
// 슬러그 매핑 (data/etf-slug-map.json) — SEO 친화 URL
// scripts/generate-etf-slugs.mjs로 갱신.
// 정책: 한 번 결정된 슬러그는 영구 불변 (이름 변경되어도 슬러그 유지).
// ─────────────────────────────────────────────────────────────────────
const SLUG_MAP_FILE = path.join(process.cwd(), 'data', 'etf-slug-map.json');

interface SlugMapEntry { code: string; name: string; }
interface SlugRegistry {
  generatedAt: string;
  count: number;
  byCode: Record<string, string>;        // code → slug
  bySlug: Record<string, SlugMapEntry>;  // slug → { code, name }
}

let _slugCache: SlugRegistry | null = null;
function loadSlugRegistry(): SlugRegistry {
  if (_slugCache) return _slugCache;
  if (!fs.existsSync(SLUG_MAP_FILE)) {
    _slugCache = { generatedAt: '', count: 0, byCode: {}, bySlug: {} };
    return _slugCache;
  }
  try {
    _slugCache = JSON.parse(fs.readFileSync(SLUG_MAP_FILE, 'utf-8')) as SlugRegistry;
  } catch {
    _slugCache = { generatedAt: '', count: 0, byCode: {}, bySlug: {} };
  }
  return _slugCache;
}

/** 코드 → SEO 슬러그 ('0080G0' → 'kodex-defense-top10'). 매핑 없으면 코드 lowercase. */
export function codeToSlug(code: string): string {
  if (!code) return '';
  const upper = code.toUpperCase();
  return loadSlugRegistry().byCode[upper] || code.toLowerCase();
}

/** 슬러그 → 코드 ('kodex-defense-top10' → '0080G0'). 매핑 없으면 null. */
export function slugToCode(slug: string): string | null {
  if (!slug) return null;
  const entry = loadSlugRegistry().bySlug[slug.toLowerCase()];
  return entry?.code || null;
}

/**
 * /etf/[ticker] URL 입력값 통합 해석.
 *   - 슬러그 ('kodex-200') → KRX shortcode 매칭
 *   - 코드 ('0080G0' / '069500') → KRX shortcode 매칭 + 표준 슬러그로 변환
 *   - 어느 쪽도 매칭 없으면 input 그대로 (페이지에서 404 trigger)
 */
export function resolveEtfTickerOrSlug(input: string): {
  shortcode?: string;
  issueCode?: string;
  name?: string;
  /** SEO 정규 URL slug (이름 기반 우선) */
  canonicalSlug: string;
} {
  if (!input) return { canonicalSlug: '' };

  // 1) 슬러그 매칭 시도
  const code = slugToCode(input);
  if (code) {
    const krxMeta = getKrxEtfMeta(code);
    return {
      shortcode: code,
      issueCode: krxMeta?.issueCode,
      name: krxMeta?.name,
      canonicalSlug: input.toLowerCase(),
    };
  }

  // 2) 코드 매칭 시도 (legacy URL 호환)
  const ticker = resolveEtfTicker(input);
  if (ticker.shortcode) {
    return {
      ...ticker,
      canonicalSlug: codeToSlug(ticker.shortcode),
    };
  }

  // 3) 둘 다 실패
  return { canonicalSlug: input.toLowerCase() };
}

/** generateStaticParams·sitemap용 — 슬러그 전체 목록 */
export function getAllEtfSlugs(): string[] {
  return Object.keys(loadSlugRegistry().bySlug);
}

/** 슬러그 매핑 전체 — next.config.ts redirects 생성용 (코드 → 슬러그) */
export function getCodeToSlugMap(): Record<string, string> {
  return { ...loadSlugRegistry().byCode };
}

/** 같은 섹터의 다른 ETF 추천 — Phase 2A
 *   현재 종목 제외 + 시세 있는 종목 우선 + 거래량 내림차순 + limit개.
 */
export interface RelatedEtfRow {
  shortcode: string;
  slug: string;
  name: string;
  issuer?: string;
  price?: number;
  changeRate?: number;
  hasPrice: boolean;
}

function buildRelatedRow(code: string, etfList: { code: string; name: string; price: number; changeRate: number; volume: number; sector?: string }[]): RelatedEtfRow | null {
  const meta = getKrxEtfMeta(code);
  if (!meta) return null;
  const upper = code.toUpperCase();
  const price = etfList.find(e => e.code.toUpperCase() === upper);
  const issuerLabel = extractIssuerLabel(meta.name);
  return {
    shortcode: code,
    slug: codeToSlug(code),
    name: meta.name,
    issuer: issuerLabel?.split(' ')[0],
    price: price?.price,
    changeRate: price?.changeRate,
    hasPrice: !!price,
  };
}

export function getEtfsBySector(
  sector: string,
  excludeCode: string,
  limit = 6,
  etfList: Parameters<typeof buildRelatedRow>[1] = [],
): RelatedEtfRow[] {
  if (!sector || sector === '기타') return [];
  const upperExclude = excludeCode.toUpperCase();
  // KRX 전 종목 중 같은 섹터 매칭 (시세 sector 또는 이름 기반 분류)
  const krx = loadKrxRegistry();
  const candidates: RelatedEtfRow[] = [];
  for (const e of krx.list) {
    if (e.shortcode.toUpperCase() === upperExclude) continue;
    const priceEntry = etfList.find(p => p.code.toUpperCase() === e.shortcode.toUpperCase());
    const candidateSector = priceEntry?.sector || classifyEtfSector(e.name);
    if (candidateSector !== sector) continue;
    const row = buildRelatedRow(e.shortcode, etfList);
    if (row) candidates.push(row);
  }
  // 시세 있는 종목 우선 + 가격이 있으면 거래량 내림차순(이미 etfList sorted), 없으면 이름 정렬
  candidates.sort((a, b) => {
    if (a.hasPrice !== b.hasPrice) return a.hasPrice ? -1 : 1;
    return a.name.localeCompare(b.name, 'ko');
  });
  return candidates.slice(0, limit);
}

/** 같은 운용사의 다른 ETF 추천 — Phase 2B */
export function getEtfsByIssuer(
  issuer: string,
  excludeCode: string,
  limit = 6,
  etfList: Parameters<typeof buildRelatedRow>[1] = [],
): RelatedEtfRow[] {
  if (!issuer) return [];
  const upperExclude = excludeCode.toUpperCase();
  const krx = loadKrxRegistry();
  const candidates: RelatedEtfRow[] = [];
  for (const e of krx.list) {
    if (e.shortcode.toUpperCase() === upperExclude) continue;
    // 이름 첫 단어 == issuer
    const firstToken = e.name.split(/\s+/)[0];
    if (firstToken !== issuer) continue;
    const row = buildRelatedRow(e.shortcode, etfList);
    if (row) candidates.push(row);
  }
  candidates.sort((a, b) => {
    if (a.hasPrice !== b.hasPrice) return a.hasPrice ? -1 : 1;
    return a.name.localeCompare(b.name, 'ko');
  });
  return candidates.slice(0, limit);
}

/** KRX 매핑 1건 조회 — minimal 페이지 렌더용 */
export function getKrxEtfMeta(input: string): KrxEtfCode | null {
  const r = resolveEtfTicker(input);
  if (!r.shortcode) return null;
  return loadKrxRegistry().byShortcode[r.shortcode] || null;
}

/** KRX 상장 ETF 전 종목 목록 (data/krx-etf-codes.json의 list). 같은 지수 묶음(etf-siblings.ts) 등 전수 순회용. */
export function getKrxEtfList(): KrxEtfCode[] {
  return loadKrxRegistry().list;
}

/** KRX 상장 종목 목록(data/krx-etf-codes.json)의 기준일 YYYY-MM-DD. 시세가 없는 페이지의 데이터 날짜로 쓴다. */
export function getKrxRegistryBaseDate(): string | null {
  return ymdToIsoDate(loadKrxRegistry().baseDate);
}

/**
 * ETF 이름에서 운용사(브랜드) 추출 — 첫 단어가 거의 항상 브랜드.
 *   예: 'KODEX 200' → 'KODEX', 'TIGER 미국나스닥100' → 'TIGER', 'SOL 조선TOP3' → 'SOL'
 */
// 2026-09-30 운용사 표기 정정: KODEX(삼성)·KOSEF(키움)·TIME(타임폴리오)·KoAct(삼성액티브)가
//   다른 운용사로 잘못 적혀 있었고, 이 라벨이 종목 사전 페이지의 운용사 카드와 meta description에 그대로 노출됐다.
const ISSUER_LABELS: Record<string, string> = {
  KODEX: 'KODEX (삼성자산운용)',
  TIGER: 'TIGER (미래에셋자산운용)',
  SOL: 'SOL (신한자산운용)',
  ACE: 'ACE (한국투자신탁운용)',
  PLUS: 'PLUS (한화자산운용)',
  RISE: 'RISE (KB자산운용)',
  HANARO: 'HANARO (NH아문디)',
  KOSEF: 'KOSEF (키움투자자산운용)',
  HK: 'HK (흥국자산운용)',
  KIWOOM: 'KIWOOM (키움투자자산운용)',
  TIME: 'TIME (타임폴리오자산운용)',
  '1Q': '1Q (하나자산운용)',
  KoAct: 'KoAct (삼성액티브자산운용)',
};

export function extractIssuerLabel(etfName: string): string | null {
  if (!etfName) return null;
  const first = etfName.split(/\s+/)[0];
  return ISSUER_LABELS[first] || (first.length <= 8 ? first : null);
}

/** 운용사 공식 ETF 안내 사이트 URL — Phase 3B (E-E-A-T 외부 권위 link out) */
const ISSUER_OFFICIAL_URL: Record<string, string> = {
  KODEX: 'https://www.kodex.com',
  TIGER: 'https://www.tigeretf.com',
  SOL: 'https://www.shinhansolview.com',
  ACE: 'https://www.kiminvestment.com/etf/',
  PLUS: 'https://www.hanwhaplusetf.com',
  RISE: 'https://www.kbam.co.kr/etf',
  HANARO: 'https://www.amundi.co.kr',
  // KOSEF는 키움투자자산운용 브랜드라 KIWOOM과 같은 곳으로 보낸다(이전: 삼성 사이트로 잘못 연결).
  KOSEF: 'https://www.kiwoomam.com',
  HK: 'https://www.heungkukfund.com',
  KIWOOM: 'https://www.kiwoomam.com',
  // TIME(타임폴리오)·KoAct(삼성액티브)는 다른 운용사 사이트로 잘못 연결돼 있어 뺐다.
  //   정확한 공식 주소를 확인한 뒤에만 다시 넣는다. 없으면 링크 자체를 렌더하지 않는다.
};

export function getIssuerOfficialUrl(etfName: string): string | null {
  if (!etfName) return null;
  const first = etfName.split(/\s+/)[0];
  return ISSUER_OFFICIAL_URL[first] || null;
}

/**
 * ETF 이름 기반 섹터 분류 (시세 데이터에 sector가 없는 minimal 페이지용).
 *   1_data_miner.js의 SECTOR_RULES와 동일 로직 — TS 포팅.
 */
const SECTOR_RULES: Array<{ sector: string; patterns: RegExp[] }> = [
  { sector: '방산', patterns: [/방산/, /방위/, /K방산/i] },
  { sector: '조선', patterns: [/조선/] },
  { sector: 'AI·데이터', patterns: [/AI/i, /데이터센터/, /팔란티어/i, /PLTR/i] },
  { sector: '반도체', patterns: [/반도체/, /SK하이닉스/, /삼성전자/, /SOXX/i, /SMH/i, /HBM/i] },
  { sector: '커버드콜·월배당', patterns: [/커버드콜/, /OTM/i, /월배당/, /SCHD/i, /배당다우존스/, /배당퀄리티/] },
  { sector: '해외주식', patterns: [/S&P500/i, /나스닥/i, /미국/, /SPY/i, /QQQ/i, /NYSE/i] },
  { sector: '채권', patterns: [/채권/, /국채/, /회사채/, /TLT/i] },
  { sector: '원자재·금', patterns: [/금현물/, /골드/, /원유/, /은$/, /GLD/i] },
  { sector: '2차전지', patterns: [/2차전지/, /배터리/, /LG에너지/, /LIT/i] },
  { sector: '국내주식', patterns: [/KODEX\s*200/, /TIGER\s*200/, /코스피/, /KOSPI/i, /KOSDAQ150/] },
  { sector: '바이오·헬스', patterns: [/바이오/, /헬스케어/, /제약/] },
];

export function classifyEtfSector(etfName: string): string | null {
  if (!etfName) return null;
  for (const rule of SECTOR_RULES) {
    if (rule.patterns.some(p => p.test(etfName))) return rule.sector;
  }
  return null;
}

export function getRecentEtfSnapshots(limit = 20): EtfSnapshot[] {
  if (!fs.existsSync(RAW_DATA_DIR)) return [];
  const files = fs.readdirSync(RAW_DATA_DIR)
    .filter(f => f.startsWith('etf_prices_') && f.endsWith('.json'))
    .sort()
    .reverse()
    .slice(0, limit);

  const snapshots: EtfSnapshot[] = [];
  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(RAW_DATA_DIR, file), 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed?.data) snapshots.push(parsed.data as EtfSnapshot);
    } catch { /* silent: 손상된 파일 스킵 */ }
  }
  return snapshots;
}

// ─────────────────────────────────────────────────────────────────────
// 종목 사전(/etf/[ticker]) 전용: 종목별 최신 시세 · 스냅샷 나이 · 괴리율 · 색인 판정
//   page.tsx(generateMetadata·본문)와 sitemap-etf.xml이 getEtfPageFacts() 하나를 공유한다.
// ─────────────────────────────────────────────────────────────────────

/** 종목별 시세를 찾을 때 거슬러 올라가는 스냅샷 파일 수 상한 (빌드 시간 보호) */
const PRICE_LOOKBACK_FILES = 30;
/** 시세 기준일이 이 일수(달력 기준)를 넘기면 오래된 시세로 표기한다 */
export const ETF_STALE_DAYS = 7;
/** |괴리율|이 이 값(%)을 넘으면 데이터 이상일 수 있어 괴리율·NAV 표시를 보류한다 */
export const NAV_GAP_MAX_ABS = 10;

let _snapshotFiles: string[] | null = null;
const _snapshotIndex = new Map<string, { baseDate: string; byCode: Map<string, EtfPriceRow> } | null>();

/** etf_prices_*.json 파일명 목록 (최신순). getLatestEtfData와 같은 정렬 기준. */
function listEtfSnapshotFiles(): string[] {
  if (_snapshotFiles) return _snapshotFiles;
  if (!fs.existsSync(RAW_DATA_DIR)) {
    _snapshotFiles = [];
    return _snapshotFiles;
  }
  _snapshotFiles = fs.readdirSync(RAW_DATA_DIR)
    .filter(f => f.startsWith('etf_prices_') && f.endsWith('.json'))
    .sort()
    .reverse();
  return _snapshotFiles;
}

/** 스냅샷 1개를 코드 색인으로 읽는다. 손상 파일은 null (다음 파일로 넘어간다). */
function readSnapshotIndex(file: string) {
  if (_snapshotIndex.has(file)) return _snapshotIndex.get(file) ?? null;
  let out: { baseDate: string; byCode: Map<string, EtfPriceRow> } | null = null;
  try {
    const parsed = JSON.parse(fs.readFileSync(path.join(RAW_DATA_DIR, file), 'utf-8'));
    const d = parsed?.data as EtfSnapshot | undefined;
    if (d && Array.isArray(d.etfList)) {
      const byCode = new Map<string, EtfPriceRow>();
      for (const e of d.etfList) {
        if (e && typeof e.code === 'string') byCode.set(e.code.toUpperCase(), e);
      }
      out = { baseDate: d.baseDate || '', byCode };
    }
  } catch { /* 손상 파일은 건너뛴다 */ }
  _snapshotIndex.set(file, out);
  return out;
}

export interface EtfPriceRecord {
  etf: EtfPriceRow;
  /** 이 시세가 들어 있던 스냅샷의 기준일 YYYYMMDD */
  baseDate: string;
  /** 가장 최신 스냅샷에서 찾았는가 (false면 그 종목이 있는 직전 스냅샷을 쓴 것) */
  fromLatestSnapshot: boolean;
}

/**
 * 종목 1개의 시세를 "그 종목이 들어 있는 가장 최근 스냅샷"에서 찾는다 (나이 무관).
 *   수집이 며칠 실패하거나 일부 종목만 받은 날이 있어도 직전 시세를 쓰므로
 *   페이지가 빈 상태·noindex로 떨어지지 않는다. 오래된 시세는 화면에 기준일을 그대로 밝힌다.
 *   최신 파일보다 이전 파일로 거슬러 가는 것은 현재 KRX 상장 목록에 있는 종목만 허용한다
 *   (상장폐지 종목이 옛 시세로 되살아나지 않게).
 */
export function getEtfPriceRecord(code: string): EtfPriceRecord | null {
  if (!code) return null;
  const resolved = resolveEtfTicker(code);
  const candidates = [resolved.shortcode, resolved.issueCode, code]
    .filter((x): x is string => Boolean(x))
    .map(c => c.toUpperCase());
  const listed = !!resolved.shortcode;
  const files = listEtfSnapshotFiles().slice(0, PRICE_LOOKBACK_FILES);
  let seenValid = false;
  for (const file of files) {
    const snap = readSnapshotIndex(file);
    if (!snap) continue;
    const isLatest = !seenValid;
    if (!isLatest && !listed) break;
    seenValid = true;
    for (const c of candidates) {
      const row = snap.byCode.get(c);
      if (row && Number.isFinite(row.price) && row.price > 0) {
        return { etf: row, baseDate: snap.baseDate || row.date || '', fromLatestSnapshot: isLatest };
      }
    }
  }
  return null;
}

/** 'YYYYMMDD' · 'YYYY-MM-DD' · 'YYYYMMDDT…' → 'YYYY-MM-DD' (형식이 아니면 null) */
export function ymdToIsoDate(ymd?: string | null): string | null {
  if (!ymd) return null;
  const digits = ymd.replace(/[^0-9]/g, '').slice(0, 8);
  if (digits.length !== 8) return null;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
}

export interface EtfSnapshotAge {
  /** 시세 기준일 YYYYMMDD */
  baseDate: string;
  /** 시세 기준일 YYYY-MM-DD */
  isoDate: string;
  /** KST 오늘 - 기준일 (달력 일수) */
  calendarDays: number;
  /** 주말만 뺀 대략적 영업일 수 (공휴일은 반영하지 않는다) */
  businessDays: number;
  /** calendarDays > ETF_STALE_DAYS */
  isStale: boolean;
}

/**
 * 시세 기준일이 오늘(KST)로부터 얼마나 지났는지.
 *   페이지는 빌드 시점에 구워지므로 now는 빌드 시각이다(매 배포마다 다시 계산된다).
 */
export function getEtfSnapshotAge(baseDate: string | undefined | null, now: Date = new Date()): EtfSnapshotAge | null {
  const iso = ymdToIsoDate(baseDate);
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  const base = Date.UTC(y, m - 1, d);
  if (!Number.isFinite(base)) return null;
  const kst = new Date(now.getTime() + 9 * 3600 * 1000);
  const today = Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate());
  const calendarDays = Math.max(0, Math.round((today - base) / 86400000));
  let businessDays = 0;
  for (let i = 1; i <= Math.min(calendarDays, 400); i++) {
    const dow = new Date(base + i * 86400000).getUTCDay();
    if (dow !== 0 && dow !== 6) businessDays++;
  }
  return {
    baseDate: iso.split('-').join(''),
    isoDate: iso,
    calendarDays,
    businessDays,
    isStale: calendarDays > ETF_STALE_DAYS,
  };
}

/** 화면 표기용. 7일 이내면 "{날짜} 종가 기준", 넘기면 "최근 시세 기준일 {날짜}"(오래됐음을 숨기지 않는다). */
export function formatEtfPriceAsOf(age: EtfSnapshotAge): string {
  return age.isStale ? `최근 시세 기준일 ${age.isoDate}` : `${age.isoDate} 종가 기준`;
}

/** 가장 최신 ETF 스냅샷의 나이 (/etf 목록 페이지 등 전체 기준일 표기용) */
export function getLatestEtfSnapshotAge(now?: Date): EtfSnapshotAge | null {
  for (const file of listEtfSnapshotFiles()) {
    const snap = readSnapshotIndex(file);
    if (snap) return getEtfSnapshotAge(snap.baseDate, now);
  }
  return null;
}

export interface EtfNavGap {
  /** 기준일 NAV (원) */
  nav: number;
  /** 괴리율 % = (종가 - NAV) / NAV × 100, 소수 둘째 자리 */
  gapPct: number;
  /** 이 NAV·종가 쌍의 기준일 YYYY-MM-DD (시세 기준일과 다를 수 있다) */
  isoDate: string;
}

function hasValidNav(row: { nav?: number } | null | undefined): boolean {
  return !!row && typeof row.nav === 'number' && Number.isFinite(row.nav) && row.nav > 0;
}

/**
 * 같은 행(같은 날)의 종가와 NAV로 괴리율을 계산한다.
 *   NAV가 있고 |괴리율| ≤ NAV_GAP_MAX_ABS 일 때만 값을 준다. 그 밖(값 없음·이상치)은 null → 행을 렌더하지 않는다.
 */
export function getEtfNavGap(
  row: { price: number; nav?: number } | null | undefined,
  baseDate?: string,
): EtfNavGap | null {
  if (!row || !hasValidNav(row)) return null;
  const { price } = row;
  const nav = row.nav as number;
  if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0) return null;
  const gap = ((price - nav) / nav) * 100;
  if (!Number.isFinite(gap) || Math.abs(gap) > NAV_GAP_MAX_ABS) return null;
  return { nav, gapPct: Number(gap.toFixed(2)) || 0, isoDate: ymdToIsoDate(baseDate) || '' };
}

/**
 * 종목의 괴리율을 "NAV가 들어 있는 가장 최근 스냅샷"에서 구한다 (시세와 같은 원칙).
 *   2026-09-30 스냅샷처럼 응답에 nav 필드가 통째로 빠진 날이 있다. 그날 하루의 수집 누락 때문에
 *   전 종목이 "가격만 있는 페이지"로 떨어져 noindex 되지 않도록, 직전 스냅샷의 같은 날 종가·NAV 쌍으로 계산한다.
 *   다른 날의 NAV와 오늘 종가를 섞지 않는다. 기준일(isoDate)을 함께 돌려주어 화면에 그대로 밝힌다.
 *   가장 최근 NAV가 이상치(|괴리율| > NAV_GAP_MAX_ABS)면 더 옛 값을 찾지 않고 null.
 */
export function getEtfNavGapRecord(code: string): EtfNavGap | null {
  if (!code) return null;
  const resolved = resolveEtfTicker(code);
  const candidates = [resolved.shortcode, resolved.issueCode, code]
    .filter((x): x is string => Boolean(x))
    .map(c => c.toUpperCase());
  for (const file of listEtfSnapshotFiles().slice(0, PRICE_LOOKBACK_FILES)) {
    const snap = readSnapshotIndex(file);
    if (!snap) continue;
    for (const c of candidates) {
      const row = snap.byCode.get(c);
      if (row && hasValidNav(row)) return getEtfNavGap(row, snap.baseDate || row.date);
    }
  }
  return null;
}

export interface EtfPageFacts {
  /** 대문자 단축코드 */
  code: string;
  hasSlug: boolean;
  price: EtfPriceRecord | null;
  age: EtfSnapshotAge | null;
  navGap: EtfNavGap | null;
  /** 구성종목 1건 이상일 때만 */
  holdings: EtfHoldings | null;
  income: IncomeEtf | null;
  /** 분배 정보 기준일 YYYY-MM-DD (dividend-registry _meta.asOf) */
  incomeAsOf: string | null;
  /** max(시세 기준일, 분배 기준일, 상품 개요 작성일) YYYY-MM-DD. 실제 데이터 날짜만 쓴다 (없으면 null) */
  lastModified: string | null;
  /** 1차 출처로 확인한 상품 개요 (없으면 null) */
  profile: EtfProfile | null;
  indexable: boolean;
}

/**
 * 종목 사전 1쪽이 실제로 가진 데이터 + 색인 여부.
 *   generateMetadata(robots·제목·설명)와 sitemap-etf.xml(포함 여부·lastmod)이 같은 결과를 쓴다.
 */
export function getEtfPageFacts(code: string, now?: Date): EtfPageFacts {
  const upper = (code || '').toUpperCase();
  const hasSlug = !!upper && !!loadSlugRegistry().byCode[upper];
  const price = upper ? getEtfPriceRecord(upper) : null;
  const age = price ? getEtfSnapshotAge(price.baseDate, now) : null;
  // 시세 행에 NAV가 있으면 같은 날 쌍으로, 없으면 NAV가 있는 가장 최근 스냅샷의 같은 날 쌍으로 (기준일 표기)
  const navGap = !price
    ? null
    : hasValidNav(price.etf)
      ? getEtfNavGap(price.etf, price.baseDate)
      : getEtfNavGapRecord(upper);
  const h = upper ? getEtfHoldings(upper) : null;
  const holdings = h && Array.isArray(h.holdings) && h.holdings.length > 0 ? h : null;
  const registry = upper ? getIncomeRegistry() : null;
  const income = registry?.etfs.find(e => (e.code || '').toUpperCase() === upper) || null;
  const incomeAsOf = income ? ymdToIsoDate(registry?.asOf) : null;
  const profile = getEtfProfile(upper);
  const dates = [age?.isoDate, incomeAsOf, profile?.updatedAt].filter((x): x is string => !!x).sort();
  const lastModified = dates.length ? dates[dates.length - 1] : null;
  const indexable = shouldIndexEtf({
    hasSlug,
    hasPrice: !!price,
    hasNavGap: !!navGap,
    hasHoldings: !!holdings,
    hasIncome: !!income,
    hasProfile: !!profile,
  });
  return { code: upper, hasSlug, price, age, navGap, holdings, income, incomeAsOf, lastModified, profile, indexable };
}
