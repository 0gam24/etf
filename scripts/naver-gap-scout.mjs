#!/usr/bin/env node
/**
 * naver-gap-scout: 네이버 웹문서 결과에서 "자리가 열린" ETF 키워드를 찾는다.
 *
 * 운영자 지시(2026-10-07): "이런 식으로 네이버 상위 노출할 수 있는 빈틈 키워드 찾아서 목록 보여줘"
 * (자매 사이트 awoo·asiatop 의 빈틈 목록 화면). 방식은 awoo scripts/naver-rank-check.mjs 의 scout 와 같고,
 * 호스트 분류·후보·점수만 ETF 분야에 맞게 다시 만들었다.
 *
 * 측정은 공식 오픈 API 만 쓴다(NAVER_CLIENT_ID/SECRET, .env.local). search.naver.com 은 robots.txt 가
 * 모든 봇을 막으므로 받지 않는다. 그래서 통합검색 화면에서 웹문서 묶음이 어디쯤 나오는지(첫 화면인지)는
 * 잴 수 없고, 운영자가 눈으로 확인한다.
 *
 *   webkr  웹문서 상위 30건 → 자사 순위, 위에 있는 문서의 종류(관공서·운용사·증권사·도구·언론·상업·자매)
 *   blog   블로그 문서 총수(경쟁 정도)
 *   kin    지식iN 질문 총수(사람들이 실제로 묻는 정도)
 *   datalab 최근 30일 검색량 지수(실업급여 = 100), 3주 전 대비 추세, 세금·계좌 주제는 작년 같은 철 배수
 *
 * 후보(트랙):
 *   new      최근 45일 안에 상장 목록에 새로 들어온 ETF 이름 (물결: 신규 상장 × 상품)
 *   group    같은 지수를 따르는 ETF 묶음의 "{지수} ETF 비교" (비교 페이지가 받는 의도)
 *   pair     이미 있는 1:1 비교 페이지의 "{A} {B} 차이"
 *   product  시가총액 상위 상품 × 분배금·구성종목
 *   account  ETF 세금·절세 계좌 롱테일 (연말 시즌 선점 포함)
 *   gsc      구글 Search Console 에서 실제 노출된 검색어
 *
 * 사용:
 *   node scripts/naver-gap-scout.mjs                 전체 측정, data/keywords/naver-gap-YYYYMMDD.json 저장
 *   node scripts/naver-gap-scout.mjs --limit=20      후보 20건만
 *   node scripts/naver-gap-scout.mjs --query="ISA 만기 연금 이전"   한 건만 재고 저장하지 않음
 *   node scripts/naver-gap-scout.mjs --dry           저장하지 않음
 *   node scripts/naver-gap-scout.mjs --rescore       가장 최근 결과의 점수·연결 주소만 다시 계산(데이터랩 실패분은 재측정)
 *
 * API 키 값은 출력하지 않는다. 호출량: 후보 1건당 검색 3회 + 데이터랩 묶음 호출(4건당 1회).
 * 검색 API 일 한도 25,000, 데이터랩 일 1,000 안에서 넉넉하다.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createJiti } from 'jiti';

const ROOT = process.cwd();
const OWN_HOST = 'iknowhowinfo.com';
const REF_KEYWORD = '실업급여'; // 자매 사이트 목록과 같은 눈금
const DEPTH = 30;
const ABOVE_WINDOW = 10;
const DELAY_MS = 130;
const NOW = new Date();
const THIS_YEAR = Number(kstYmd(NOW).slice(0, 4));

function kstYmd(d) {
  const k = new Date(d.getTime() + 9 * 3600 * 1000);
  return k.toISOString().slice(0, 10);
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function loadEnvLocal() {
  const p = path.join(ROOT, '.env.local');
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) {
      let v = m[2].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      else v = v.replace(/\s+#.*$/, '').trim();
      process.env[m[1]] = v;
    }
  }
}
loadEnvLocal();
const ID = process.env.NAVER_CLIENT_ID;
const SECRET = process.env.NAVER_CLIENT_SECRET;
if (!ID || !SECRET) {
  console.error('NAVER_CLIENT_ID / NAVER_CLIENT_SECRET 가 .env.local 에 없습니다.');
  process.exit(1);
}

// ── 공식 API ─────────────────────────────────────────────────
let calls = 0;
async function naverGet(kind, query, display) {
  const url = `https://openapi.naver.com/v1/search/${kind}.json?query=${encodeURIComponent(query)}&display=${display}&start=1`;
  for (let attempt = 0; attempt < 4; attempt++) {
    calls++;
    let res;
    try {
      res = await fetch(url, { headers: { 'X-Naver-Client-Id': ID, 'X-Naver-Client-Secret': SECRET } });
    } catch {
      await sleep(1500 * (attempt + 1)); // 일시적인 연결 끊김
      continue;
    }
    if (res.status === 429) {
      await sleep(1500 * (attempt + 1));
      continue;
    }
    if (!res.ok) throw new Error(`${kind} HTTP ${res.status}`);
    await sleep(DELAY_MS);
    return res.json();
  }
  throw new Error(`${kind} 429 반복`);
}

async function datalab(groups, startDate, endDate, timeUnit) {
  const body = { startDate, endDate, timeUnit, keywordGroups: groups };
  for (let attempt = 0; attempt < 4; attempt++) {
    calls++;
    let res;
    try {
      res = await fetch('https://openapi.naver.com/v1/datalab/search', {
        method: 'POST',
        headers: { 'X-Naver-Client-Id': ID, 'X-Naver-Client-Secret': SECRET, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch {
      await sleep(1500 * (attempt + 1));
      continue;
    }
    if (res.status === 429) {
      await sleep(1500 * (attempt + 1));
      continue;
    }
    if (!res.ok) throw new Error(`datalab HTTP ${res.status}`);
    await sleep(DELAY_MS);
    return res.json();
  }
  throw new Error('datalab 429 반복');
}

// ── 호스트 분류 (ETF 분야) ─────────────────────────────────────
const SISTER_HOSTS = new Set([
  'smartdatashop.kr', 'smartdata-shop.com', 'asiatop.co.kr', 'bizdata.kr', 'retiredata.kr',
  'familydata.kr', 'homedata.kr', 'aidata.kr', 'calculatorhost.com', 'awoo.or.kr',
]);
// 공공기관: 세법·제도·공시의 1차 출처. 글로 넘기 어려운 자리
const GOV_HOSTS = [
  'krx.co.kr', 'fss.or.kr', 'kofia.or.kr', 'seibro.or.kr', 'ksd.or.kr', 'nps.or.kr', 'bok.or.kr',
  'kinfa.or.kr', 'kdic.or.kr', 'fine.fss.or.kr', 'kcredit.or.kr', 'nhis.or.kr', 'kosmes.or.kr',
];
// 운용사 공식 상품 페이지: 상품명 검색에서는 주인 자리
const ISSUER_HOSTS = [
  'samsungfund.com', 'kodex.com', 'tigeretf.com', 'investments.miraeasset.com', 'aceetf.co.kr',
  'kitmc.com', 'soletf.com', 'shinhanfund.com', 'riseetf.co.kr', 'kbam.co.kr', 'kbstaretf.com',
  'plusetf.co.kr', 'hanwhafund.co.kr', 'hanwhafund.com', 'kiwoomam.com', 'kiwoometf.com',
  'samsungactive.co.kr', 'koact.co.kr', 'timefolio.co.kr', 'timeetf.co.kr', 'woorifund.com',
  'wooriam.co.kr', 'hanafn.com', '1qetf.com', 'hanaw.com', 'dbam.co.kr', 'heungkukfund.co.kr',
  'shinyoung-am.com', 'bnkam.co.kr', 'daishinam.co.kr', 'yuriam.co.kr', 'hdfund.co.kr',
  'hiam.co.kr', 'kyoboaxa.co.kr', 'nhamundi.com', 'nh-amundi.com', 'hkfund.co.kr',
  // 2026-10-08 추가: 운용사·지수 산출기관
  'ibkasset.com', 'spglobal.com', 'msci.com', 'fnindex.co.kr', 'solactive.com', 'indxx.com',
];
// 상장사 공식 IR·배당 안내: 그 회사 배당·실적 검색에서는 주인 자리라 운용사와 같게 본다 (2026-10-08 "삼성전자 분기 배당")
const CORP_HOSTS = [
  'samsung.com', 'skhynix.com', 'hyundai.com', 'lgcorp.com', 'kbfg.com', 'shinhangroup.com',
  'hanafn.com', 'woorifg.com', 'posco-inc.com', 'sktelecom.com', 'kt.com', 'kia.com',
];
const BROKER_HOSTS = [
  'samsungpop.com', 'securities.miraeasset.com', 'miraeasset.com', 'kbsec.com', 'truefriend.com',
  'nhqv.com', 'shinhansec.com', 'kiwoom.com', 'daishin.com', 'eugenefn.com', 'iprovest.com',
  'imeritz.com', 'tossinvest.com', 'tosssecurities.com', 'kakaopaysec.com', 'ls-sec.co.kr',
  'yuantakorea.com', 'hi-ib.com', 'db-fi.com', 'hanwhawm.com', 'koreainvestment.com', 'toss.im',
  'kbstar.com', 'shinhan.com', 'wooribank.com', 'ibk.co.kr', 'kebhana.com', 'nonghyup.com',
  'tossbank.com', 'kakaobank.com', 'kbanknow.com', 'kakaopay.com', 'banksalad.com', 'hanabank.com',
  // 2026-10-08 경쟁 조사에서 상업 블로그로 잘못 잡히던 금융회사
  'kbthink.com', 'myasset.com', 'kbinsure.co.kr', 'samsunglife.com', 'hanwhalife.com',
];
// 위키: 사람이 고친 백과라 웹문서 상위를 오래 지킨다. 뺏을 수 있는 자리로 세지 않는다
const WIKI_HOSTS = ['namu.wiki', 'ko.wikipedia.org', 'wikipedia.org', 'wikidocs.net'];
// 시세·데이터 도구: 상품명 검색을 점령하는 경우가 많다. 글로는 이기기 어렵다
const TOOL_HOSTS = [
  'finance.naver.com', 'm.stock.naver.com', 'stock.naver.com', 'finance.daum.net', 'm.finance.daum.net',
  'investing.com', 'kr.investing.com', 'etfcheck.co.kr', 'funetf.co.kr', 'comp.fnguide.com',
  'fnguide.com', 'alphasquare.co.kr', 'stockanalysis.com', 'etf.com', 'morningstar.com',
  'seekingalpha.com', 'dividendhistory.org', 'digrin.com', 'tradingview.com', 'kr.tradingview.com',
  'justetf.com', 'etfdb.com', 'macrotrends.net', 'companiesmarketcap.com', 'finance.yahoo.com',
  'google.com', 'valuesearch.co.kr', 'snusab.com', 'hometax.go.kr', 'kind.krx.co.kr', 'data.krx.co.kr',
  'dart.fss.or.kr', 'dis.kofia.or.kr', 'portfolio-visualizer.com', 'thinkpool.com', 'paxnet.co.kr',
];
const PRESS_HOSTS = [
  'hankyung.com', 'mk.co.kr', 'edaily.co.kr', 'sedaily.com', 'mt.co.kr', 'news1.kr', 'yna.co.kr',
  'chosun.com', 'joongang.co.kr', 'donga.com', 'hani.co.kr', 'khan.co.kr', 'fnnews.com', 'newsis.com',
  'asiae.co.kr', 'etoday.co.kr', 'thebell.co.kr', 'inews24.com', 'ajunews.com', 'heraldcorp.com',
  'seoul.co.kr', 'kmib.co.kr', 'segye.com', 'munhwa.com', 'hankookilbo.com', 'dt.co.kr', 'etnews.com',
  'zdnet.co.kr', 'bloter.net', 'businesspost.co.kr', 'newspim.com', 'ebn.co.kr', 'wowtv.co.kr',
  'sbs.co.kr', 'kbs.co.kr', 'imbc.com', 'jtbc.co.kr', 'ytn.co.kr', 'mbn.co.kr', 'ichannela.com',
  'nocutnews.co.kr', 'ohmynews.com', 'pressian.com', 'investchosun.com', 'dailian.co.kr',
  'viva100.com', 'newstomato.com', 'g-enews.com', 'ddaily.co.kr', 'econovill.com', 'thepublic.kr',
  'bizwatch.co.kr', 'biz.chosun.com', 'mtn.co.kr', 'sentv.co.kr', 'einfomax.co.kr', 'news.einfomax.co.kr',
  'kbiz.co.kr', 'joseilbo.com', 'taxtimes.co.kr', 'ntoday.co.kr', 'dnews.co.kr', 'smartfn.co.kr',
  'fntimes.com', 'insightkorea.co.kr', 'pinpointnews.co.kr', 'beyondpost.co.kr', 'straightnews.co.kr',
];
const PRESS_HINT = /(news|ilbo|daily|times|herald|journal|press|media|tv\.|economy|biz)/;

function hostMatches(host, list) {
  return list.some((h) => host === h || host.endsWith(`.${h}`));
}
function hostKind(host) {
  if (host === OWN_HOST || host.endsWith(`.${OWN_HOST}`)) return 'own';
  if (SISTER_HOSTS.has(host)) return 'sister';
  if (hostMatches(host, TOOL_HOSTS)) return 'tool';
  if (host.endsWith('.go.kr') || hostMatches(host, GOV_HOSTS)) return 'gov';
  if (hostMatches(host, ISSUER_HOSTS) || hostMatches(host, CORP_HOSTS)) return 'issuer';
  if (hostMatches(host, BROKER_HOSTS)) return 'broker';
  if (hostMatches(host, WIKI_HOSTS)) return 'wiki';
  if (hostMatches(host, PRESS_HOSTS) || PRESS_HINT.test(host)) return 'press';
  if (host.endsWith('naver.com')) return 'naver';
  if (host.endsWith('.or.kr') || host.endsWith('.re.kr') || host.endsWith('.ac.kr')) return 'org';
  return 'commercial';
}
const KIND_LABEL = {
  own: '자사', sister: '자매', tool: '시세·도구', gov: '관공서', issuer: '운용사', broker: '증권·은행',
  press: '언론', naver: '네이버', org: '기관·협회', commercial: '블로그·상업', wiki: '위키',
};

const strip = (s) =>
  String(s ?? '')
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .trim();
const yearsIn = (text) => [...String(text ?? '').matchAll(/(20\d{2})\s*[.\-년/]/g)].map((m) => Number(m[1]));

// ── 사이트 자료 ───────────────────────────────────────────────
const jiti = createJiti(`${ROOT}/`, { alias: { '@': `${ROOT}/src` } });
const siblings = await jiti.import('./src/lib/etf-siblings.ts');
const guidesMod = await jiti.import('./src/lib/guides.ts');
const pairsMod = await jiti.import('./src/lib/etf-compare-pairs.ts');
const GUIDES = guidesMod.GUIDES;
const PUBLISHED = guidesMod.GUIDE_PUBLISHED_AT;
const PAIRS = pairsMod.COMPARE_PAIRS;

const krx = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/krx-etf-codes.json'), 'utf8'));
const krxList = Object.values(krx.byShortcode || {});
const slugMap = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/etf-slug-map.json'), 'utf8'));
const slugOf = (code) => slugMap.byCode?.[code] || null;

const snapFiles = fs
  .readdirSync(path.join(ROOT, 'data/raw'))
  .filter((f) => /^etf_prices_\d{8}\.json$/.test(f))
  .sort();
const snap = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/raw', snapFiles.at(-1)), 'utf8'));
const etfRows = snap.data?.etfList || [];
const capOf = new Map(etfRows.map((r) => [r.code, r.marketCap || 0]));

const normName = (s) => String(s).toLowerCase().replace(/[\s()]/g, '');
const etfByNorm = krxList
  .map((e) => ({ code: e.shortcode, name: e.name, norm: normName(e.name) }))
  .sort((a, b) => b.norm.length - a.norm.length);

// 한글로 적은 브랜드("타이거 s&p 500")도 상품에 잇는다
const BRAND_ALIAS = [
  ['타이거', 'tiger'], ['코덱스', 'kodex'], ['에이스', 'ace'], ['라이즈', 'rise'], ['플러스', 'plus'],
  ['키움', 'kiwoom'], ['하나로', 'hanaro'], ['코액트', 'koact'], ['타임폴리오', 'time'],
];
function findEtfInQuery(q) {
  let n = normName(q);
  for (const [ko, en] of BRAND_ALIAS) if (n.startsWith(ko)) n = en + n.slice(ko.length);
  const exact = etfByNorm.find((e) => e.norm.length >= 5 && n.includes(e.norm));
  if (exact) return refineByRest(n, exact);
  // "미국"을 빼고 쓰는 검색("tiger s&p500")까지. 브랜드로 시작하는 쿼리만
  const loose = n.replace(/미국/g, '');
  return (
    etfByNorm.find((e) => {
      const en = e.norm.replace(/미국/g, '');
      return en.length >= 8 && loose.includes(en) && loose.startsWith(en.slice(0, 3));
    }) || null
  );
}

// 상품명 뒤에 다른 상품을 가르는 말("커버드콜", "타겟커버드콜")이 붙은 검색을 기본 상품에 잇지 않는다.
// "tiger 미국배당다우존스 커버드콜"은 TIGER 미국배당다우존스가 아니라 커버드콜 1호·2호·데일리 중 하나를 찾는다 (2026-10-10)
const ATTR_WORDS = /(주가|분배금|배당금|배당|구성종목|종목코드|총보수|수익률|차이|비교|전망|etf)/g;
function refineByRest(n, base) {
  const rest = n.replace(base.norm, '').replace(ATTR_WORDS, '');
  if (!rest) return base;
  const cands = etfByNorm.filter((c) => c.norm !== base.norm && c.norm.startsWith(base.norm) && c.norm.includes(rest));
  if (cands.length === 1) return cands[0];
  if (cands.length > 1) return { ambiguous: cands.map((c) => c.name) };
  return base;
}

const SPECULATIVE = /(레버리지|인버스|2X|선물)/;
const INCOME_LIKE = /(배당|커버드콜|인컴|리츠|프리미엄|월지급|타겟)/;

// 기존 가이드가 이 검색어를 받을 수 있나. 제목 일치를 먼저 보고, 키워드는 보조로 본다.
// (단어 하나짜리 검색어가 본문 한 귀퉁이 단어로 엉뚱한 가이드에 붙지 않게: "은행 etf" → 세금 분납 가이드 오매칭 방지)
function guideMatch(q) {
  const lower = q.toLowerCase();
  const toks = lower.split(/\s+/).filter((t) => t.length >= 2 && t !== 'etf');
  if (!toks.length) return null;
  const wantsEtf = /etf/.test(lower);
  let best = null;
  for (const g of GUIDES) {
    const title = g.title.toLowerCase().replace(/\s+/g, '');
    const kw = (g.keywords || []).join(' ').toLowerCase().replace(/\s+/g, '');
    const inTitle = toks.filter((t) => title.includes(t)).length / toks.length;
    const inAny = toks.filter((t) => title.includes(t) || kw.includes(t)).length / toks.length;
    if (inTitle === 0 || inAny < 0.75) continue;
    const score = inTitle * 2 + inAny + (wantsEtf && title.includes('etf') ? 0.5 : 0);
    if (!best || score > best.score || (score === best.score && g.title.length < best.title.length)) {
      best = { slug: g.slug, title: g.title, score };
    }
  }
  return best;
}

// ── 후보 만들기 ───────────────────────────────────────────────
function bornEtfs() {
  try {
    const before = new Date(NOW.getTime() - 45 * 86400000).toISOString().slice(0, 10);
    const rev = execFileSync('git', ['log', '-1', `--before=${before}`, '--format=%H', '--', 'data/krx-etf-codes.json'], {
      cwd: ROOT,
      encoding: 'utf8',
    }).trim();
    if (!rev) return [];
    const old = JSON.parse(
      execFileSync('git', ['show', `${rev}:data/krx-etf-codes.json`], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }),
    );
    const oldCodes = new Set(Object.keys(old.byShortcode || {}));
    return krxList.filter((e) => !oldCodes.has(e.shortcode));
  } catch {
    return [];
  }
}

const ACCOUNT_QUERIES = [
  'ISA 만기 연금저축 이전', 'ISA 만기 해지 세금', 'ISA 계좌 ETF 매도 세금', 'ISA 비과세 한도',
  'ISA 중개형 ETF 매수', '연금저축 ETF 매도 세금', '연금저축 세액공제 한도', '연금저축 연말 납입',
  'IRP 세액공제 한도', 'IRP ETF 매수 방법', 'IRP 위험자산 70%', '퇴직연금 ETF 매수',
  '해외주식 양도세 250만원', '해외주식 양도세 연말 매도', '국내상장 해외 ETF 세금', '해외 ETF 분배금 세금',
  'ETF 분배금 세금', 'ETF 배당소득세 계산', '금융소득종합과세 ETF', 'ETF 분배금 지급일',
  'ETF 분배락일', '월배당 ETF 분배금 지급일', '커버드콜 ETF 세금', 'ETF 괴리율 뜻',
  'ETF 추적오차 뜻', 'ETF 실부담비용', 'ETF 총보수 비교', 'ETF 상장폐지 기준',
  '환헤지 ETF 환노출 차이', 'TDF ETF 차이', '연금계좌 해외 ETF 과세이연', 'ISA 연금저축 IRP 차이',
];

function buildCandidates() {
  const out = [];
  const seen = new Set();
  const add = (query, track, extra = {}) => {
    const key = query.toLowerCase().replace(/\s+/g, '');
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ query, track, ...extra });
  };

  // 1) 신규 상장
  const born = bornEtfs()
    .map((e) => ({ ...e, cap: capOf.get(e.shortcode) || 0 }))
    .sort((a, b) => b.cap - a.cap)
    .slice(0, 20);
  for (const e of born) add(e.name, 'new', { code: e.shortcode, born: true });

  // 2) 같은 지수 묶음 비교
  const groups = siblings
    .getEtfSiblingGroups(2)
    .filter((g) => !SPECULATIVE.test(g.label) && !/단일종목/.test(g.label))
    .sort((a, b) => b.totalMarketCap - a.totalMarketCap)
    .slice(0, 18);
  for (const g of groups) {
    const label = g.label.replace(/\(합성\)/g, '').replace(/\(H\)/g, ' 환헤지').trim();
    add(`${label} ETF 비교`, 'group', { groupKey: g.key, members: g.members.slice(0, 4).map((m) => m.name) });
  }

  // 3) 이미 있는 1:1 비교 페이지
  const nameOf = (code) => krx.byShortcode?.[code]?.name || code;
  for (const p of PAIRS) add(`${nameOf(p.codeA)} ${nameOf(p.codeB)} 차이`, 'pair', { pairSlug: p.slug });

  // 4) 시가총액 상위 상품 × 속성
  const top = etfRows
    .filter((r) => !SPECULATIVE.test(r.name) && !/(머니마켓|CD금리|KOFR|SOFR|단기채|단기통안|국고채)/.test(r.name))
    .sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0))
    .slice(0, 22);
  for (const r of top) {
    const attr = INCOME_LIKE.test(r.name) ? '분배금' : '구성종목';
    add(`${r.name} ${attr}`, 'product', { code: r.code, attr });
  }

  // 5) 세금·계좌
  for (const q of ACCOUNT_QUERIES) add(q, 'account');

  // 6) 구글 실측 검색어
  const gscFiles = fs
    .readdirSync(path.join(ROOT, 'data/keywords'))
    .filter((f) => /^gsc_\d{8}\.json$/.test(f))
    .sort();
  if (gscFiles.length) {
    const g = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/keywords', gscFiles.at(-1)), 'utf8'));
    const byQ = new Map();
    for (const r of g.all || []) byQ.set(r.query, (byQ.get(r.query) || 0) + (r.impressions || 0));
    for (const [q, imp] of [...byQ].sort((a, b) => b[1] - a[1])) {
      if (q.length > 40 || /[?]/.test(q)) continue;
      add(q, 'gsc', { gscImpressions: imp, gscFile: gscFiles.at(-1) });
    }
  }
  return out;
}

// ── 측정 ──────────────────────────────────────────────────────
async function scoutSerp(query) {
  const web = await naverGet('webkr', query, DEPTH);
  const docs = [];
  const seenHost = new Set();
  for (const it of web.items || []) {
    let host = '';
    try {
      host = new URL(it.link).hostname.replace(/^www\./, '').toLowerCase();
    } catch {
      continue;
    }
    if (seenHost.has(host)) continue;
    seenHost.add(host);
    const title = strip(it.title);
    const desc = strip(it.description);
    const yrs = yearsIn(`${title} ${desc}`);
    const stale = yrs.length > 0 && Math.max(...yrs) < THIS_YEAR;
    docs.push({ host, kind: hostKind(host), title: title.slice(0, 80), url: it.link, stale });
  }
  const ownIdx = docs.findIndex((d) => d.kind === 'own');
  const rank = ownIdx >= 0 ? ownIdx + 1 : null;
  const above = (rank != null && rank <= ABOVE_WINDOW ? docs.slice(0, rank - 1) : docs.slice(0, ABOVE_WINDOW)).map(
    (d) => ({ host: d.host, kind: d.kind, title: d.title, ...(d.stale ? { stale: true } : {}) }),
  );
  const openKinds = new Set(['commercial', 'press', 'org']);
  const openSlots = above.filter(
    (d) => d.kind !== 'own' && d.kind !== 'sister' && d.kind !== 'naver' && (openKinds.has(d.kind) || d.stale),
  ).length;
  const authAbove = above.filter((d) => (d.kind === 'gov' || d.kind === 'issuer' || d.kind === 'wiki') && !d.stale).length;
  const govAbove = above.filter((d) => d.kind === 'gov' && !d.stale).length;
  const toolTop3 = docs.slice(0, 3).filter((d) => d.kind === 'tool').length;
  const sisterAbove = above.filter((d) => d.kind === 'sister').length;
  const reason = [];
  let open = true;
  if (openSlots < 2) {
    open = false;
    reason.push(`빈자리 ${openSlots}<2`);
  }
  if (authAbove > 1) {
    open = false;
    reason.push(`관공서·운용사 ${authAbove}곳`);
  }
  if (toolTop3 >= 2) {
    open = false;
    reason.push('상위 3위를 시세 도구가 차지');
  }
  return {
    rank,
    ownUrl: ownIdx >= 0 ? docs[ownIdx].url : null,
    webDocTotal: web.total ?? null,
    webDocCount: docs.length,
    openSlots,
    authAbove,
    govAbove,
    toolTop3,
    sisterAbove,
    verdict: open ? 'open' : 'closed',
    reason,
    above,
  };
}

// 저장된 결과를 지금의 호스트 분류표로 다시 판정 (--rescore). 분류표를 고친 날 재측정 없이 반영하려고
function reclassify(s) {
  if (!s?.above) return s;
  for (const d of s.above) d.kind = hostKind(d.host);
  const openKinds = new Set(['commercial', 'press', 'org']);
  s.openSlots = s.above.filter(
    (d) => d.kind !== 'own' && d.kind !== 'sister' && d.kind !== 'naver' && (openKinds.has(d.kind) || d.stale),
  ).length;
  s.authAbove = s.above.filter((d) => (d.kind === 'gov' || d.kind === 'issuer' || d.kind === 'wiki') && !d.stale).length;
  s.govAbove = s.above.filter((d) => d.kind === 'gov' && !d.stale).length;
  if (s.rank == null || s.rank > 3) s.toolTop3 = s.above.slice(0, 3).filter((d) => d.kind === 'tool').length;
  s.sisterAbove = s.above.filter((d) => d.kind === 'sister').length;
  s.reason = [];
  let open = true;
  if (s.openSlots < 2) {
    open = false;
    s.reason.push(`빈자리 ${s.openSlots}<2`);
  }
  if (s.authAbove > 1) {
    open = false;
    s.reason.push(`관공서·운용사 ${s.authAbove}곳`);
  }
  if (s.toolTop3 >= 2) {
    open = false;
    s.reason.push('상위 3위를 시세 도구가 차지');
  }
  s.verdict = open ? 'open' : 'closed';
  return s;
}

async function measureCounts(query) {
  const blog = await naverGet('blog', query, 1);
  const kin = await naverGet('kin', query, 1);
  return { blogTotal: blog.total ?? null, kinTotal: kin.total ?? null };
}

function sumRatios(series) {
  return (series || []).reduce((s, d) => s + (d.ratio || 0), 0);
}

async function measureVolumes(items) {
  const end = new Date(NOW.getTime() - 86400000);
  const start = new Date(end.getTime() - 34 * 86400000);
  const endY = kstYmd(end);
  const startY = kstYmd(start);
  const recentFrom = kstYmd(new Date(end.getTime() - 6 * 86400000));
  const priorFrom = kstYmd(new Date(end.getTime() - 27 * 86400000));
  const priorTo = kstYmd(new Date(end.getTime() - 21 * 86400000));
  const sumFrom = kstYmd(new Date(end.getTime() - 29 * 86400000));
  for (let i = 0; i < items.length; i += 4) {
    const chunk = items.slice(i, i + 4);
    const groups = [{ groupName: 'REF', keywords: [REF_KEYWORD] }].concat(
      chunk.map((it, j) => {
        const kws = [...new Set([it.query, it.query.replace(/\s+/g, '')])].slice(0, 20);
        return { groupName: `Q${j}`, keywords: kws };
      }),
    );
    let res;
    try {
      res = await datalab(groups, startY, endY, 'date');
    } catch (e) {
      for (const it of chunk) it.volumeError = String(e.message || e);
      continue;
    }
    const byName = new Map((res.results || []).map((r) => [r.title, r.data || []]));
    const ref = byName.get('REF') || [];
    const refSum = sumRatios(ref.filter((d) => d.period >= sumFrom));
    chunk.forEach((it, j) => {
      const data = byName.get(`Q${j}`) || [];
      const s30 = sumRatios(data.filter((d) => d.period >= sumFrom));
      it.volumeIndex = refSum > 0 && s30 > 0 ? Math.round((s30 / refSum) * 100 * 100) / 100 : null;
      const recent = sumRatios(data.filter((d) => d.period >= recentFrom)) / 7;
      const prior = sumRatios(data.filter((d) => d.period >= priorFrom && d.period <= priorTo)) / 7;
      it.trend = prior > 0 && recent > 0 ? Math.round((recent / prior) * 10) / 10 : null;
      if (prior === 0 && recent > 0) it.trendBorn = true;
    });
  }
}

async function measureSeason(items) {
  // 작년 같은 철(11~1월) 최고 달이 지난달의 몇 배였나. 세금·계좌 주제의 선점 판단용
  const end = new Date(NOW.getFullYear(), NOW.getMonth(), 0); // 지난달 말일
  const start = new Date(end.getFullYear() - 1, end.getMonth(), 1);
  const lastMonth = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-01`;
  for (let i = 0; i < items.length; i += 5) {
    const chunk = items.slice(i, i + 5);
    const groups = chunk.map((it, j) => ({ groupName: `S${j}`, keywords: [it.query] }));
    let res;
    try {
      res = await datalab(groups, kstYmd(start), kstYmd(end), 'month');
    } catch {
      continue;
    }
    const byName = new Map((res.results || []).map((r) => [r.title, r.data || []]));
    chunk.forEach((it, j) => {
      const data = byName.get(`S${j}`) || [];
      const cur = data.find((d) => d.period === lastMonth)?.ratio || 0;
      let peak = null;
      for (const d of data) {
        const m = Number(d.period.slice(5, 7));
        if ((m === 11 || m === 12 || m === 1) && d.period < lastMonth && (!peak || d.ratio > peak.ratio)) peak = d;
      }
      if (peak && cur > 0) {
        it.season = { peakMonth: Number(peak.period.slice(5, 7)), multiple: Math.round((peak.ratio / cur) * 10) / 10 };
      }
    });
  }
}

// ── 점수 (awoo exposureOf 를 ETF 분야로 옮김) ─────────────────
function holdingsAvailable(code) {
  return !!code && fs.existsSync(path.join(ROOT, 'data/holdings', `${code}.json`));
}

function exposureOf(it) {
  const s = it.serp;
  if (!s) return { score: null, label: '미측정', reasons: ['실측 실패'] };
  if (s.rank != null && s.rank <= 3) return { score: 0, label: '이미 노출', reasons: [`자사 ${s.rank}위`] };
  const reasons = [];
  let v = 0;
  if (s.verdict === 'open') {
    v += 40;
    reasons.push('자리 열림');
  }
  if (s.openSlots >= 4) {
    v += 15;
    reasons.push(`빈자리 ${s.openSlots}`);
  } else if (s.openSlots >= 2) v += 10;
  else if (s.openSlots >= 1) v += 5;
  if (s.authAbove === 0) {
    v += 10;
    reasons.push('위에 관공서·운용사 없음');
  } else if (s.authAbove === 1) v += 5;
  if (s.rank != null && s.rank >= 4 && s.rank <= 10) {
    v += 5;
    reasons.push(`자사 ${s.rank}위`);
  }
  if ((it.kinTotal ?? 0) >= 100) {
    v += 5;
    reasons.push(`지식iN 질문 ${it.kinTotal.toLocaleString('ko-KR')}건`);
  }
  if (it.volumeIndex != null && it.volumeIndex >= 1) v += 5;
  if (it.trend != null && it.trend >= 1.5) {
    v += 5;
    reasons.push(`3주 전보다 ${it.trend}배`);
  }
  if (it.born || it.trendBorn) {
    v += 5;
    reasons.push(it.born ? '신규 상장' : '최근 처음 잡힘');
  }
  if (it.season && it.season.multiple >= 1.5) {
    v += 5;
    reasons.push(`작년 ${it.season.peakMonth}월에 ${it.season.multiple}배`);
  }
  if (it.attr === '구성종목' && !holdingsAvailable(it.code)) {
    v -= 10;
    reasons.push('구성종목 자료 없음(운용사 허락 필요)');
  }
  const score = Math.max(0, Math.min(100, v));
  return { score, label: score >= 70 ? '높음' : score >= 45 ? '중간' : '낮음', reasons };
}

function siteTarget(it) {
  if (it.pairSlug) return { type: 'compare', url: `/compare/${it.pairSlug}` };
  const etf = it.code ? { code: it.code } : findEtfInQuery(it.query);
  if (etf?.ambiguous) return { type: 'none', url: null, candidates: etf.ambiguous };
  if (etf && it.track !== 'group' && it.track !== 'account') {
    const slug = slugOf(etf.code);
    if (slug) return { type: 'etf', url: `/etf/${slug}` };
  }
  const g = guideMatch(it.query);
  if (g) return { type: 'guide', url: `/guide/${g.slug}`, title: g.title };
  return { type: 'none', url: null };
}

function isoWeekRange(d) {
  const k = new Date(`${kstYmd(d)}T00:00:00Z`);
  const day = (k.getUTCDay() + 6) % 7; // 월=0
  const mon = new Date(k.getTime() - day * 86400000);
  const sun = new Date(mon.getTime() + 6 * 86400000);
  return [mon.toISOString().slice(0, 10), sun.toISOString().slice(0, 10)];
}

function weekNewUrlUsed() {
  const [mon, sun] = isoWeekRange(NOW);
  const guides = Object.values(PUBLISHED).filter((d) => d >= mon && d <= sun).length;
  const src = fs.readFileSync(path.join(ROOT, 'src/lib/etf-compare-pairs.ts'), 'utf8');
  const pairs = [...src.matchAll(/\/\/ 추가 (\d{4}-\d{2}-\d{2})/g)].filter((m) => m[1] >= mon && m[1] <= sun).length;
  return { week: `${mon}~${sun}`, used: guides + pairs, cap: 2 };
}

// ── 실행 ──────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const dry = args.includes('--dry');
  const one = args.find((a) => a.startsWith('--query='))?.slice(8);
  const limit = Number(args.find((a) => a.startsWith('--limit='))?.slice(8)) || Infinity;

  const rescore = args.includes('--rescore');
  let items;
  let measuredAt = new Date().toISOString();
  if (rescore) {
    // 이미 잰 결과로 점수·연결 주소만 다시 계산한다. 데이터랩이 연결 오류로 빠진 묶음은 다시 잰다
    const files = fs
      .readdirSync(path.join(ROOT, 'data/keywords'))
      .filter((f) => /^naver-gap-\d{8}\.json$/.test(f))
      .sort();
    if (!files.length) throw new Error('다시 계산할 naver-gap 파일이 없습니다');
    const prev = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/keywords', files.at(-1)), 'utf8'));
    items = prev.items;
    measuredAt = prev.measuredAt;
    for (const it of items) reclassify(it.serp);
    const retry = items.filter((it) => it.volumeError);
    for (const it of retry) delete it.volumeError;
    if (retry.length) await measureVolumes(retry);
    const seasonRetry = retry.filter((it) => (it.track === 'account' || it.track === 'group') && !it.season);
    if (seasonRetry.length) await measureSeason(seasonRetry);
  } else {
    items = one ? [{ query: one, track: 'manual' }] : buildCandidates().slice(0, limit);
    console.error(`후보 ${items.length}건 측정 시작`);
    for (const [i, it] of items.entries()) {
      try {
        it.serp = await scoutSerp(it.query);
        Object.assign(it, await measureCounts(it.query));
      } catch (e) {
        it.error = String(e.message || e);
      }
      if ((i + 1) % 20 === 0) console.error(`  ${i + 1}/${items.length}`);
    }
    await measureVolumes(items);
    await measureSeason(items.filter((it) => it.track === 'account' || it.track === 'group'));
  }

  for (const it of items) {
    it.exposure = exposureOf(it);
    it.target = siteTarget(it);
    if (it.serp?.rank != null && it.serp.rank <= 3) it.action = '이미 노출: 갱신만';
    else if (it.target.type !== 'none') it.action = '기존 주소 보강';
    else it.action = '새 주소 필요';
  }
  items.sort((a, b) => (b.exposure.score ?? -1) - (a.exposure.score ?? -1) || (b.volumeIndex ?? 0) - (a.volumeIndex ?? 0));

  const out = {
    measuredAt,
    ...(rescore ? { rescoredAt: new Date().toISOString() } : {}),
    method: '네이버 공식 오픈 API(webkr 상위 30·blog·kin·datalab). 통합검색 화면 위치는 미측정(운영자 눈 확인)',
    reference: `${REF_KEYWORD} = 100 (최근 30일 합)`,
    newUrlWeek: one ? null : weekNewUrlUsed(),
    calls,
    items,
  };
  if (!dry && !one) {
    const file = path.join(ROOT, 'data/keywords', `naver-gap-${kstYmd(new Date(measuredAt)).replace(/-/g, '')}.json`);
    fs.writeFileSync(file, `${JSON.stringify(out, null, 2)}\n`);
    console.error(`저장 ${path.relative(ROOT, file)} · API 호출 ${calls}회`);
  }
  if (one || dry) console.log(JSON.stringify(out, null, 2));
  else {
    for (const it of items.slice(0, 40)) {
      const s = it.serp;
      console.log(
        [
          String(it.exposure.score ?? '-').padStart(3),
          it.exposure.label,
          `[${it.track}]`,
          it.query,
          `| 자사 ${s?.rank ?? '-'} 빈자리 ${s?.openSlots ?? '-'} 관공서·운용사 ${s?.authAbove ?? '-'} 도구top3 ${s?.toolTop3 ?? '-'}`,
          `| 검색량 ${it.volumeIndex ?? '모름'} 추세 ${it.trend ?? '-'} 블로그 ${it.blogTotal ?? '-'} 지식iN ${it.kinTotal ?? '-'}`,
          `| ${it.action} ${it.target.url ?? ''}`,
        ].join(' '),
      );
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
