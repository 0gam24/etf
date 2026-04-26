#!/usr/bin/env node
/**
 * KRX 단축코드(srtnCd) ↔ 표준코드(isinCd/issueCode) ↔ 종목명 매핑 fetcher.
 *
 *   data.go.kr 'getETFPriceInfo' 엔드포인트에서 numOfRows=1500으로 한 번 호출,
 *   모든 ETF의 코드 필드를 저장.
 *
 *   결과: data/krx-etf-codes.json — { byShortcode, byIssueCode, list }
 *   사이트 빌드 시 /etf/[ticker] generateStaticParams + sitemap이 이 파일을 읽어
 *   친숙한 6자리 shortcode URL을 prerender.
 *
 *   실행: node scripts/fetch-etf-codes.mjs
 *   환경변수: DATA_GO_KR_API_KEY (.env.local)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// .env.local 로드 (간단 파서)
function loadEnv() {
  const envPath = path.join(ROOT, '.env.local');
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, 'utf-8');
  raw.split(/\r?\n/).forEach(line => {
    const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m && !process.env[m[1]]) {
      let val = m[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[m[1]] = val;
    }
  });
}
loadEnv();

const API_KEY = process.env.DATA_GO_KR_API_KEY;
if (!API_KEY || API_KEY.startsWith('여기에')) {
  console.error('❌ DATA_GO_KR_API_KEY 미설정');
  process.exit(1);
}

function getBusinessDate(daysBack = 1) {
  const d = new Date();
  d.setDate(d.getDate() - daysBack);
  // 주말 회피
  if (d.getDay() === 0) d.setDate(d.getDate() - 2);
  if (d.getDay() === 6) d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${dd}`;
}

async function fetchAllEtfCodes() {
  let foundDate = '';
  let items = [];

  for (let i = 1; i <= 7; i++) {
    const targetDate = getBusinessDate(i);
    const url = `https://apis.data.go.kr/1160100/service/GetSecuritiesProductInfoService/getETFPriceInfo?serviceKey=${API_KEY}&resultType=json&numOfRows=1500&basDt=${targetDate}`;
    console.log(`📡 ${targetDate} ETF 시세 요청 (시도 ${i})`);
    try {
      const res = await fetch(url);
      if (!res.ok) { console.warn(`HTTP ${res.status}`); continue; }
      const data = await res.json();
      const arr = data?.response?.body?.items?.item;
      if (arr && (Array.isArray(arr) ? arr.length > 0 : Object.keys(arr).length > 0)) {
        items = Array.isArray(arr) ? arr : [arr];
        foundDate = targetDate;
        const total = data?.response?.body?.totalCount;
        console.log(`✅ ${items.length}건 (totalCount=${total})`);
        break;
      }
    } catch (err) {
      console.warn(`  실패: ${err.message}`);
    }
  }

  if (items.length === 0) {
    console.error('❌ 7일 시도 모두 실패');
    process.exit(2);
  }

  // 첫 항목 필드 sample 출력 (디버그용)
  console.log('\n샘플 필드:');
  console.log(Object.keys(items[0]).join(', '));
  console.log('\n첫 종목 raw:');
  console.log(JSON.stringify(items[0], null, 2));

  return { items, foundDate };
}

function buildMaps(items, foundDate) {
  const list = items.map(it => ({
    shortcode: it.srtnCd || '',           // 단축코드 (449450 형식)
    issueCode: it.isinCd || '',            // ISIN 또는 표준코드
    name: it.itmsNm || '',                 // 종목명
  })).filter(e => e.shortcode || e.issueCode);

  const byShortcode = {};
  const byIssueCode = {};
  for (const e of list) {
    if (e.shortcode) byShortcode[e.shortcode] = e;
    if (e.issueCode) byIssueCode[e.issueCode] = e;
  }

  return {
    fetchedAt: new Date().toISOString(),
    baseDate: foundDate,
    count: list.length,
    byShortcode,
    byIssueCode,
    list,
  };
}

async function main() {
  const { items, foundDate } = await fetchAllEtfCodes();
  const result = buildMaps(items, foundDate);

  const outPath = path.join(ROOT, 'data', 'krx-etf-codes.json');
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf-8');
  console.log(`\n💾 저장: ${outPath}`);
  console.log(`   shortcode 매핑: ${Object.keys(result.byShortcode).length}건`);
  console.log(`   issueCode 매핑: ${Object.keys(result.byIssueCode).length}건`);
}

main().catch(err => {
  console.error('❌ 실패:', err);
  process.exit(3);
});
