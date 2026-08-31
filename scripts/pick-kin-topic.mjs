#!/usr/bin/env node
/**
 * pick-kin-topic — 지식iN 질문 코퍼스에서 오늘 쓸 주제 후보를 뽑는다.
 *
 *   왜 필요한가:
 *     주제는 지식iN 실제 질문 수요에서만 뽑는다(CLAUDE.md "주제 선정 규칙").
 *     그런데 코퍼스가 2,800건이라 사람이든 루틴이든 매번 눈으로 훑을 수 없고,
 *     훑다 보면 앞쪽 몇 건만 반복해서 고르게 된다. 수요(같은 취지 질문의 반복
 *     횟수)로 줄을 세워 상위 후보만 내주면 그 편향이 사라진다.
 *
 *     새벽 자동 발행 루틴은 네이버 API 키가 없어 코퍼스를 새로 수집하지 못한다.
 *     이 스크립트는 커밋된 코퍼스만 읽으므로 클라우드에서도 그대로 돈다.
 *
 *   동작:
 *     1) data/keywords/kin/*.json 전부 읽어 질문을 모은다
 *     2) 이미 쓴 질문(guides.ts sourceQuestions의 docId)은 제외한다
 *     3) 제목에서 도메인 용어를 뽑아 같은 취지 질문끼리 묶는다 → 묶음 크기 = 수요
 *     4) 수요·구체성(어절 수, 조건 수식어) 순으로 정렬해 상위 후보를 출력한다
 *     5) 각 후보에 비슷한 기존 가이드를 붙여준다 (완전 중복 회피 + 롱테일 차별화용)
 *
 *   사용:
 *     node scripts/pick-kin-topic.mjs              # 상위 12건 사람이 읽는 형식
 *     node scripts/pick-kin-topic.mjs --top=20
 *     node scripts/pick-kin-topic.mjs --json       # 기계 판독용
 *     node scripts/pick-kin-topic.mjs --lens=seasonal   # 계절 선행 주제 가중
 *     node scripts/pick-kin-topic.mjs --lens=longtail   # 조건이 붙은 롱테일 가중
 *     (--lens 생략 = auto, KST 요일로 렌즈를 돌린다)
 *
 *   렌즈(--lens)는 PUBLISHING.md의 슬롯 배분을 하루 1편 체제에 맞춘 것이다.
 *     evergreen(기본) 상시 최대 수요 · seasonal 계절 선행 · longtail 롱테일 확장
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const KIN_DIR = path.join(ROOT, 'data', 'keywords', 'kin');
const GUIDES_FILE = path.join(ROOT, 'src', 'lib', 'guides.ts');

const args = Object.fromEntries(
  process.argv.slice(2).filter(a => a.startsWith('--')).map(a => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? 'true'];
  }),
);
const TOP = Number(args.top) || 12;
/**
 * 렌즈 선택 — auto 는 KST 요일로 돌린다.
 *   하루 1편이라 매일 같은 렌즈로 뽑으면 주제군이 한쪽으로 굳는다.
 *   월·목 계절 선행 / 수·토 롱테일 확장 / 그 밖 상시 최대 수요.
 */
const KST_DOW = new Date(Date.now() + 9 * 3600 * 1000).getUTCDay();   // 0=일
const AUTO_LENS = [1, 4].includes(KST_DOW) ? 'seasonal' : [3, 6].includes(KST_DOW) ? 'longtail' : 'evergreen';
const LENS_ARG = String(args.lens || 'auto');
const LENS = LENS_ARG === 'auto' ? AUTO_LENS : LENS_ARG;
const AS_JSON = args.json === 'true';

/**
 * 도메인 용어 사전 — 한국어는 조사가 붙어 공백 분리만으로는 같은 말이 갈라진다.
 *   ("ISA는" · "ISA에서" · "ISA계좌") 사전으로 집아야 같은 취지 질문이 한 묶음이 된다.
 *   4개 분야(ETF·주식·코인·금융) 밖 질문을 걸러내는 필터 역할도 겸한다.
 */
const TERMS = [
  // 계좌·제도
  'ISA', 'IRP', '연금저축', '퇴직연금', '국민연금', '기초연금', '디폴트옵션', '중개형', '신탁형',
  '연금계좌', '일반계좌', '종합계좌', 'CMA', '파킹통장', '예적금', '적금', '예금',
  // 상품
  'ETF', 'ETN', '펀드', 'TDF', '리츠', 'REITs', '채권', '국채', '회사채', '커버드콜', '월배당',
  '레버리지', '인버스', '배당주', '고배당', '배당성장', 'CD금리', '액티브', '파생',
  'S&P500', '나스닥100', '나스닥', '코스피', '코스닥', 'KOSPI200', 'SCHD', 'QQQ', 'VOO', 'SGOV',
  '금ETF', '금값', '금현물', '금시세', '은ETF', '구리', '원유', '천연가스', '원자재', '달러', '엔화', '위안',
  // 세금·비용
  '세금', '양도소득세', '배당소득세', '연금소득세', '종합소득세', '이자소득세', '금융소득',
  '종합과세', '분리과세', '세액공제', '소득공제',
  '증여세', '상속세', '취득세', '원천징수', '과세이연', '비과세', '손익통산', '건강보험료', '건보료',
  '총보수', '수수료', '스프레드', '환전', '환헤지', '환노출', '괴리율', '추적오차',
  // 행위·현상
  '배당금', '분배금', '배당락', '분배락', '배당기준일', '재투자', 'DRIP', '리밸런싱', '적립식',
  '매수', '매도', '체결', '호가', '주문', '공모주', '청약', '상장폐지', '액면분할', '증자',
  '수익률', '변동성', '서킷브레이커', '반대매매', '미수', '신용', '대출', '레버리지투자',
  '인출', '수령', '해지', '이전', '만기', '납입', '한도', '연말정산',
  // 코인
  '비트코인', '이더리움', '알트코인', '코인', '가상자산', '선물거래', '코인선물', '무기한', '마진', '청산', '도미넌스',
  '거래소', '업비트', '빗썸', '바이낸스', '김프', '스테이킹',
  // 대상·상황
  '은퇴', '노후', '사회초년생', '미성년', '자녀', '주부', '프리랜서', '직장인', '법인', '개인사업자',
  '초보', '해외주식', '미국주식', '국내주식', '직구', '직투',
];

/** 계절 선행 신호 — 이 용어가 걸리면 "지금 쓰면 1~4개월 뒤 검색이 몰리는" 후보다 */
const SEASONAL_TERMS = [
  '연말정산', '세액공제', '한도', '만기', '납입', '종합과세', '금융소득', '건강보험료', '건보료',
  '양도소득세', '신고', '결산', '배당기준일', '배당락', 'ISA', '연금저축', 'IRP',
];

/** 조건 수식어 — 붙어 있을수록 롱테일이고, 신규 도메인이 잡기 쉬운 질문이다 */
const CONDITION_HINT = /(\d|만원|억|살|세|년|개월|월|일|한도|기준|경우|차이|비교|vs|방법|순서|얼마|언제|어디|어떻게|가능|불가|초과|미만|이상|이하)/;

const stripParticle = w =>
  w.replace(/[은는이가을를의에로도만과와란란은]$/u, '').replace(/(에서|에게|까지|부터|으로|이나|라면|처럼|보다|마다)$/u, '');

const normalize = s => String(s || '').replace(/\s+/g, ' ').trim();

/** 제목에서 사전 용어 추출 (대소문자·공백 무시 매칭) */
function extractTerms(title) {
  const flat = title.replace(/\s+/g, '').toUpperCase();
  const hit = [];
  for (const t of TERMS) {
    if (flat.includes(t.replace(/\s+/g, '').toUpperCase())) hit.push(t);
  }
  // 긴 용어가 짧은 용어를 포함하면 짧은 쪽은 버린다 (나스닥100 ⊃ 나스닥)
  return hit.filter(t => !hit.some(o => o !== t && o.includes(t)));
}

// ── 1. 코퍼스 적재 ──────────────────────────────────────────────────
function loadCorpus() {
  if (!fs.existsSync(KIN_DIR)) {
    console.error(`✖ 코퍼스 디렉터리가 없습니다: ${KIN_DIR}`);
    process.exit(1);
  }
  const files = fs.readdirSync(KIN_DIR).filter(f => f.endsWith('.json')).sort();
  const out = [];
  for (const f of files) {
    const raw = JSON.parse(fs.readFileSync(path.join(KIN_DIR, f), 'utf-8'));
    const arr = Array.isArray(raw) ? raw : (raw.questions || raw.items || []);
    for (const q of arr) {
      if (!q || !q.docId || !q.title) continue;
      out.push({
        docId: String(q.docId),
        title: normalize(q.title),
        preview: normalize(q.preview).slice(0, 220),
        url: q.url || `https://kin.naver.com/qna/detail.naver?docId=${q.docId}`,
        seed: q.seed || '',
        file: f,
      });
    }
  }
  // 같은 질문이 여러 파일에 있으면 한 번만
  const byDoc = new Map();
  for (const q of out) if (!byDoc.has(q.docId)) byDoc.set(q.docId, q);
  return [...byDoc.values()];
}

// ── 2. 이미 쓴 질문·기존 가이드 ─────────────────────────────────────
function loadGuideState() {
  const src = fs.readFileSync(GUIDES_FILE, 'utf-8');
  const usedDocIds = new Set([...src.matchAll(/docId=(\d+)/g)].map(m => m[1]));
  const guides = [];
  // 줄바꿈은 \s* 로 넘긴다. CRLF 파일에서 '\n' 을 직접 쓰면 \r 때문에 한 건도 안 잡힌다.
  const titleRe = /slug:\s*'([^']+)',\s*title:\s*'((?:[^'\\]|\\.)*)'/g;
  let m;
  while ((m = titleRe.exec(src))) {
    guides.push({ slug: m[1], title: m[2], terms: extractTerms(m[2]) });
  }
  return { usedDocIds, guides };
}

/**
 * 개인 맞춤 조언을 구하는 질문 — 주제로 삼지 않는다.
 *   "제 상황에 뭐 사요"에 답하면 개별 투자 권유가 되고, 검색 수요도 그 사람 것뿐이다.
 *   수요 집계에는 남기되 대표 질문으로는 뽑지 않는다.
 */
const PERSONAL_ADVICE = /(추천|부탁|봐주|골라|뭐\s*살|뭘\s*살|어떤\s*종목|내공|급해|평가\s*좀|괜찮나요\?*$)/;

/**
 * 분야 밖 질문 — 사전 용어가 다른 뜻으로 쓰인 경우를 걷어낸다.
 *   ("틱톡 코인", "게임 선물하기"처럼 금융과 무관한 문맥)
 */
const OFF_DOMAIN = /(틱톡|유튜브|게임|아이돌|배그|롤|카톡|카카오톡|택배|여행|다이어트|연애|결혼식|자동차보험|중고나라)/;

// ── 3. 수요 묶음 ────────────────────────────────────────────────────
/**
 * 같은 취지 묶기 — 제목에서 뽑은 도메인 용어 조합이 같으면 같은 취지로 본다.
 *
 *   용어 1개짜리(예: 'ETF' 하나만 걸린 질문)는 묶어봐야 "ETF 관련 아무거나"가 되어
 *   수요 숫자가 의미를 잃는다. 실제로 그렇게 묶었더니 119건짜리 덩어리가 1위로 올라와
 *   대표 질문이 엉뚱하게 뽑혔다. 그래서 용어 2개 이상만 후보로 둔다.
 */
function groupByDemand(questions) {
  const groups = new Map();
  for (const q of questions) {
    if (OFF_DOMAIN.test(q.title)) continue;    // 금융과 무관한 문맥
    const terms = extractTerms(q.title);
    if (terms.length < 2) continue;            // 너무 넓거나 분야 밖
    const key = terms.slice().sort().join('+');
    if (!groups.has(key)) groups.set(key, { key, terms, members: [] });
    groups.get(key).members.push(q);
  }
  return [...groups.values()];
}

/** 대표 질문 — 어절이 많고 조건이 붙은 쪽이 검색 의도가 뚜렷하다 */
function pickRepresentative(members) {
  const score = q => {
    const words = q.title.split(/\s+/).filter(Boolean).map(stripParticle);
    let s = Math.min(words.length, 12);
    if (CONDITION_HINT.test(q.title)) s += 4;
    if (/[?？]$/.test(q.title) || /(요|까|가요|나요|을까|ㄹ까)$/.test(q.title)) s += 2;
    if (q.title.length < 12) s -= 5;           // 너무 짧으면 무엇을 묻는지 모른다
    if (/\.\.\.$/.test(q.title)) s -= 2;       // 잘린 제목
    if (PERSONAL_ADVICE.test(q.title)) s -= 12;
    if (OFF_DOMAIN.test(q.title)) s -= 20;
    return s;
  };
  return members.slice().sort((a, b) => score(b) - score(a))[0];
}

/**
 * 렌즈별 점수 — 수요만으로 줄을 세우면 매일 같은 큰 덩어리가 1위로 올라온다.
 *   하루 1편 체제에서는 요일마다 보는 각도를 바꿔야 주제가 한쪽으로 쏠리지 않는다.
 */
function scoreGroup(group) {
  const demand = group.members.length;
  const rep = group.rep;
  const words = rep.title.split(/\s+/).filter(Boolean).length;

  if (LENS === 'seasonal') {
    // 지금 쓰면 1~4개월 뒤 검색이 몰리는 주제를 앞으로 당긴다
    const hit = group.terms.some(t => SEASONAL_TERMS.includes(t));
    return Math.min(demand, 40) * (hit ? 2.2 : 1);
  }
  if (LENS === 'longtail') {
    // 큰 덩어리보다 조건이 촘촘히 붙은 질문 쪽에 무게를 준다
    return Math.min(demand, 12) + (words >= 5 ? 8 : 0) + (CONDITION_HINT.test(rep.title) ? 5 : 0);
  }
  return Math.min(demand, 40);
}

// ── 4. 실행 ─────────────────────────────────────────────────────────
const corpus = loadCorpus();
const { usedDocIds, guides } = loadGuideState();
const unused = corpus.filter(q => !usedDocIds.has(q.docId));

const groups = groupByDemand(unused).map(g => {
  g.rep = pickRepresentative(g.members);
  return g;
});

for (const g of groups) {
  g.score = scoreGroup(g);
  const GENERIC = new Set(['ETF', '세금', '주문', '수익률']);
  g.similarGuides = guides
    .map(gd => ({
      slug: gd.slug,
      overlap: g.terms.filter(t => gd.terms.includes(t)),
    }))
    .filter(x => x.overlap.some(t => !GENERIC.has(t)) || x.overlap.length >= 2)
    .sort((a, b) => b.overlap.length - a.overlap.length)
    .slice(0, 4)
    .map(x => x.slug);
}

groups.sort((a, b) => b.score - a.score || b.members.length - a.members.length);
const top = groups.slice(0, TOP);

const payload = {
  generatedAt: new Date().toISOString(),
  lens: LENS,
  lensSelectedBy: LENS_ARG === 'auto' ? `auto(KST 요일 ${KST_DOW})` : 'explicit',
  corpusTotal: corpus.length,
  alreadyUsed: usedDocIds.size,
  unusedTotal: unused.length,
  candidates: top.map((g, i) => ({
    rank: i + 1,
    demand: g.members.length,
    terms: g.terms,
    question: { docId: g.rep.docId, title: g.rep.title, url: g.rep.url, preview: g.rep.preview },
    alsoAsked: g.members
      .filter(q => q.docId !== g.rep.docId)
      .slice(0, 2)
      .map(q => ({ docId: q.docId, title: q.title, url: q.url })),
    similarGuides: g.similarGuides,
  })),
};

if (AS_JSON) {
  console.log(JSON.stringify(payload, null, 2));
} else {
  console.log(`── 지식iN 주제 후보 (렌즈: ${LENS}${LENS_ARG === 'auto' ? ' · 요일 자동' : ''}) ──`);
  console.log(`   코퍼스 ${payload.corpusTotal}건 · 사용됨 ${payload.alreadyUsed}건 · 남은 후보 ${payload.unusedTotal}건\n`);
  for (const c of payload.candidates) {
    console.log(`${String(c.rank).padStart(2)}. [수요 ${c.demand}] ${c.question.title}`);
    console.log(`    용어: ${c.terms.join(' · ')}`);
    console.log(`    출처: ${c.question.url}`);
    if (c.alsoAsked.length) console.log(`    같은 취지: ${c.alsoAsked.map(a => a.title).join(' / ')}`);
    if (c.similarGuides.length) console.log(`    비슷한 기존 가이드: ${c.similarGuides.join(', ')}`);
    console.log('');
  }
  console.log('※ 비슷한 기존 가이드가 있어도 제외하지 않는다. 조건·대상·각도를 달리해 롱테일로 확장한다.');
  console.log('   막는 것은 제목·본문이 사실상 같은 완전 중복뿐이다. (PUBLISHING.md §1)');
}
