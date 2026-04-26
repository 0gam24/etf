import fs from 'fs';
import path from 'path';
// etf_portfolios는 CommonJS · 정적 import로 NFT 추적 범위 최소화
import portfoliosModule from '../../agents/etf_portfolios';

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
export interface EtfSnapshot {
  baseDate: string;
  fetchedAt: string;
  etfList: {
    code: string;
    name: string;
    price: number;
    change: number;
    changeRate: number;
    volume: number;
    tradeAmount?: number;
    marketCap?: number;
    sector?: string;
  }[];
}

// ─────────────────────────────────────────────────────────────────────
// KRX 공식 단축코드 매핑 — data/krx-etf-codes.json (1095종)
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

/** KRX 매핑 1건 조회 — minimal 페이지 렌더용 */
export function getKrxEtfMeta(input: string): KrxEtfCode | null {
  const r = resolveEtfTicker(input);
  if (!r.shortcode) return null;
  return loadKrxRegistry().byShortcode[r.shortcode] || null;
}

/**
 * ETF 이름에서 운용사(브랜드) 추출 — 첫 단어가 거의 항상 브랜드.
 *   예: 'KODEX 200' → 'KODEX', 'TIGER 미국나스닥100' → 'TIGER', 'SOL 조선TOP3' → 'SOL'
 */
const ISSUER_LABELS: Record<string, string> = {
  KODEX: 'KODEX (미래에셋)',
  TIGER: 'TIGER (미래에셋)',
  SOL: 'SOL (신한자산운용)',
  ACE: 'ACE (한국투자신탁운용)',
  PLUS: 'PLUS (한화자산운용)',
  RISE: 'RISE (KB자산운용)',
  HANARO: 'HANARO (NH아문디)',
  KOSEF: 'KOSEF (삼성자산운용)',
  HK: 'HK (흥국자산운용)',
  KIWOOM: 'KIWOOM (키움투자자산운용)',
  TIME: 'TIME (한화자산운용)',
  '1Q': '1Q (하나자산운용)',
  KoAct: 'KoAct (한국투자신탁운용)',
};

export function extractIssuerLabel(etfName: string): string | null {
  if (!etfName) return null;
  const first = etfName.split(/\s+/)[0];
  return ISSUER_LABELS[first] || (first.length <= 8 ? first : null);
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
