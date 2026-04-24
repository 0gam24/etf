/**
 * Holdings Crawler — ETF 구성종목 자동 갱신 스캐폴드.
 *
 *   목적: etf-platform/data/holdings/{code}.json을 운용사 공시 기준으로 매일 갱신.
 *
 *   구조:
 *     1. SOURCE_MAP        — 운용사별 구성종목 페이지 URL 패턴 (또는 PDF/CSV 다운로드 URL)
 *     2. fetchSource()     — HTTP 요청 (Node 22+ 내장 fetch 사용)
 *     3. parseSource()     — HTML/CSV/PDF → holdings[] 구조로 변환 (운용사별 파서 플러그인)
 *     4. writeHoldings()   — data/holdings/{code}.json 쓰기 (기존 캐시 유지 fallback)
 *     5. runCrawler(codes) — 일괄 실행
 *
 *   주: 실제 운용사 URL은 이용약관·robots.txt 확인 후 SOURCE_MAP에 등록하세요.
 *       파싱 실패 시 기존 캐시를 유지하여 UI 장애를 방지합니다.
 *
 *   실행:
 *     node pipeline/holdings_crawler.js                  # SOURCE_MAP의 모든 등록 ETF
 *     node pipeline/holdings_crawler.js 0080G0 0080Y0    # 특정 코드만
 */

'use strict';

const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const HOLDINGS_DIR = path.join(__dirname, '..', 'data', 'holdings');

/**
 * 운용사별 소스 레지스트리.
 * 각 엔트리에 fetch URL과 parser 이름을 등록.
 *
 * 실제 등록 예:
 *   '0080G0': { issuer: 'samsungfund', url: 'https://www.samsungfund.com/...', parser: 'samsung_pdv' }
 */
const SOURCE_MAP = {
  // ── 등록 예시 (실제 URL은 운용사 확인 후 기입) ──
  // '0080G0': { issuer: 'samsung',     url: 'TBD', parser: 'samsung_json' },
  // '0080Y0': { issuer: 'shinhan',     url: 'TBD', parser: 'shinhan_csv' },
  // '0015B0': { issuer: 'kbam',        url: 'TBD', parser: 'kbam_html' },
  // '0000J0': { issuer: 'hanwha',      url: 'TBD', parser: 'hanwha_pdf' },
};

/** HTTP 페칭 — 운용사 서버 부담 최소화 위해 간격 두기 */
async function fetchSource(url, { timeoutMs = 15000 } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'DailyETFPulseBot/1.0 (+https://iknowhowinfo.com)' },
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) return { type: 'json', body: await res.json() };
    if (ct.includes('text/csv'))         return { type: 'csv',  body: await res.text() };
    if (ct.includes('application/pdf'))  return { type: 'pdf',  body: Buffer.from(await res.arrayBuffer()) };
    return { type: 'html', body: await res.text() };
  } finally {
    clearTimeout(t);
  }
}

/**
 * 운용사별 파서. 각 파서는 원본 응답을 받아 공용 holdings JSON 구조로 리턴.
 *
 * 반환 스키마:
 *   { code, name, asOf, source, type, holdings: [{ name, ticker, weight }] }
 */
const PARSERS = {
  samsung_json(code, raw) {
    // TODO: 실제 응답 구조 확인 후 구현
    // 예: raw.body.pdv.map(row => ({ name: row.stkName, ticker: row.stkCode, weight: row.weight }))
    throw new Error('samsung_json parser not implemented');
  },
  shinhan_csv(code, raw) {
    // TODO: CSV 파싱 (첫 줄 헤더, 각 행 = name,ticker,weight)
    throw new Error('shinhan_csv parser not implemented');
  },
  kbam_html(code, raw) {
    // TODO: cheerio 등으로 HTML 테이블 추출
    throw new Error('kbam_html parser not implemented');
  },
  hanwha_pdf(code, raw) {
    // TODO: pdf-parse로 텍스트 추출 → 정규식으로 행 파싱
    throw new Error('hanwha_pdf parser not implemented');
  },
};

function writeHoldings(code, data) {
  if (!fs.existsSync(HOLDINGS_DIR)) fs.mkdirSync(HOLDINGS_DIR, { recursive: true });
  const filePath = path.join(HOLDINGS_DIR, `${code}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  return filePath;
}

function readExistingHoldings(code) {
  const filePath = path.join(HOLDINGS_DIR, `${code}.json`);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

async function updateOne(code) {
  const source = SOURCE_MAP[code];
  if (!source || !source.url || source.url === 'TBD') {
    return { code, status: 'skipped', reason: 'SOURCE_MAP 미등록' };
  }
  const parser = PARSERS[source.parser];
  if (!parser) {
    return { code, status: 'skipped', reason: `parser 미구현: ${source.parser}` };
  }

  try {
    const raw = await fetchSource(source.url);
    const parsed = parser(code, raw);
    const out = {
      code,
      ...parsed,
      asOf: new Date().toISOString().slice(0, 10),
      source: `${source.issuer} (auto-crawled)`,
    };
    const filePath = writeHoldings(code, out);
    return { code, status: 'ok', filePath };
  } catch (err) {
    const existing = readExistingHoldings(code);
    return {
      code,
      status: existing ? 'failed_with_fallback' : 'failed',
      error: err.message,
      fallback: existing ? 'kept previous cache' : null,
    };
  }
}

async function runCrawler(codes) {
  const targets = codes && codes.length > 0 ? codes : Object.keys(SOURCE_MAP);
  if (targets.length === 0) {
    logger.info('[holdings-crawler] SOURCE_MAP이 비어 있습니다. 등록 후 재실행하세요.');
    return [];
  }
  logger.info(`[holdings-crawler] ${targets.length}개 ETF 갱신 시작`);
  const results = [];
  for (const code of targets) {
    const result = await updateOne(code);
    logger.info(`  ${code}: ${result.status}${result.reason ? ` (${result.reason})` : ''}${result.error ? ` - ${result.error}` : ''}`);
    results.push(result);
    // 운용사 서버 부담 완화
    await new Promise(r => setTimeout(r, 600));
  }
  const summary = {
    total: results.length,
    ok: results.filter(r => r.status === 'ok').length,
    skipped: results.filter(r => r.status === 'skipped').length,
    failed: results.filter(r => r.status.startsWith('failed')).length,
  };
  logger.info(`[holdings-crawler] 완료: ok=${summary.ok} skipped=${summary.skipped} failed=${summary.failed}`);
  return results;
}

// CLI 실행
if (require.main === module) {
  const argv = process.argv.slice(2);
  runCrawler(argv).catch(err => {
    console.error('[holdings-crawler] fatal:', err);
    process.exit(1);
  });
}

module.exports = { runCrawler, SOURCE_MAP, PARSERS };
