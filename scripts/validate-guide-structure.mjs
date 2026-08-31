/**
 * 가이드 구조 검증 — SEO/AEO/GEO 필수 요소가 빠진 채 배포되는 것을 막는다.
 *
 *   배경: 감사 때마다 "출처 없음 108편", "바이라인 없음 238편" 같은 구멍이
 *   뒤늦게 발견됐다. 사람이 매번 지키기보다 빌드가 막는 편이 확실하다.
 *
 *   ERROR(빌드 차단): 검색 노출·신뢰도에 직접 영향
 *   WARN(경고만)    : 있으면 좋지만 주제에 따라 불필요할 수 있음
 *
 *   실행: npm run validate:guides
 *         prebuild에 연결하면 매 빌드마다 자동 검사
 */
import fs from 'node:fs';
import path from 'node:path';

const FILE = path.join(process.cwd(), 'src', 'lib', 'guides.ts');
const src = fs.readFileSync(FILE, 'utf-8');

const STR = "((?:[^'\\\\]|\\\\.)*)";
const grab = (blk, key) => {
  const m = blk.match(new RegExp(`\\b${key}:\\s*[\\r\\n]*\\s*'${STR}'`));
  return m ? m[1] : '';
};
const has = (blk, key) => new RegExp(`\\b${key}:\\s*[\\[{'\"]`).test(blk);

// 가이드 블록 분할
const marks = [];
const re = /\n\s*slug:\s*'([^']+)'/g;
let m;
while ((m = re.exec(src))) marks.push({ slug: m[1], at: m.index });

/**
 * 발행일 맵 — 문체 규칙(긴 줄표 금지)의 소급 적용을 막기 위해 쓴다.
 *
 *   CLAUDE.md: "새로 쓰는 글부터 이 규칙 적용. 기존 발행 글의 제목·본문은 소급 수정 금지."
 *   (제목을 바꾸면 구글이 새 글로 오인해 색인·순위에 손해)
 *   따라서 규칙 시행일 이전 발행분의 긴 줄표는 ERROR가 아니라 기록만 한다.
 */
const STYLE_RULE_FROM = '2026-07-10';   // 문체 규칙 도입일
const publishedAt = {};
{
  const pm = src.match(/GUIDE_PUBLISHED_AT[^{]*\{([\s\S]*?)\n\};/);
  if (pm) {
    for (const l of pm[1].matchAll(/'([^']+)':\s*'(\d{4}-\d{2}-\d{2})'/g)) publishedAt[l[1]] = l[2];
  }
}
/**
 * 규칙 시행 이후 발행분인가.
 *   시행일 '당일' 발행분은 규칙보다 먼저 쓰인 글이므로 제외한다(> 이지 >= 가 아니다).
 *   발행일 미기록 = 초기 기반 가이드 = 시행 전으로 본다.
 */
const isNewContent = slug => (publishedAt[slug] || '2000-01-01') > STYLE_RULE_FROM;

/**
 * 발행 사양 v1.0 시행일 — 문체 규칙(STYLE_RULE_FROM)과 별개로 둔다.
 *
 *   문체 시행일을 재사용하면 그 이후 발행된 110편이 새 규칙에 걸려 즉시 빌드가 막힌다.
 *   기존 발행분은 소급 수정하지 않는다는 원칙대로, 이 시행일 '다음날' 발행분부터만 적용한다.
 */
const SPEC_RULE_FROM = '2026-08-12';
const isNewSpec = slug => (publishedAt[slug] || '2000-01-01') > SPEC_RULE_FROM;

/** 클러스터 배정 여부 — 배정되지 않으면 관련 가이드 링크가 주제와 무관해진다 */
const clusteredSlugs = new Set();
{
  const cm = src.match(/GUIDE_CLUSTERS[^=]*=\s*\[([\s\S]*?)\n\];/);
  if (cm) for (const x of cm[1].matchAll(/'([a-z0-9-]{4,})'/g)) clusteredSlugs.add(x[1]);
}

/** 제목에서 내용을 밀어내는 상투 라벨 */
const CLICHE_TITLE = /완전정리|완전 정리|완전 가이드|총정리|완전 분석|한눈에 정리/;

const errors = [];
const warns = [];
const BRAND_SUFFIX = ' | Daily ETF Pulse'.length;

for (let i = 0; i < marks.length; i++) {
  const slug = marks[i].slug;
  const blk = src.slice(marks[i].at, i + 1 < marks.length ? marks[i + 1].at : src.length);
  const E = msg => errors.push(`${slug}: ${msg}`);
  const W = msg => warns.push(`${slug}: ${msg}`);

  // 슬러그 — 영문 kebab만 (KOREAN_SLUG_MAP 누락 방지)
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) E(`슬러그가 영문 kebab-case가 아님`);

  // 제목
  const title = grab(blk, 'title');
  if (!title) E('title 없음');
  else if (title.length > 60) E(`title ${title.length}자 (60 초과)`);
  if (/—/.test(title)) {
    if (isNewContent(slug)) E('title에 긴 줄표(—) 사용');
    else W('title에 긴 줄표(—) — 규칙 시행 전 발행분이라 소급 수정하지 않는다');
  }

  // 설명
  const desc = grab(blk, 'description');
  if (!desc) E('description 없음');
  else if (desc.length < 120 || desc.length > 155) W(`description ${desc.length}자 (120~155 권장)`);
  if (/—/.test(desc)) {
    if (isNewContent(slug)) E('description에 긴 줄표(—) 사용');
    else W('description에 긴 줄표(—) — 규칙 시행 전 발행분');
  }

  // 키워드
  const kwm = blk.match(/keywords:\s*\[([\s\S]*?)\]/);
  const kw = kwm ? kwm[1].split(',').filter(x => x.trim()).length : 0;
  if (kw < 3) E(`keywords ${kw}개 (최소 3)`);
  else if (kw > 8) W(`keywords ${kw}개 (권장 5~8)`);

  // AEO 핵심 — 직답과 FAQ는 필수
  if (!has(blk, 'answer')) E('answer(직답) 없음 — AI 인용·스니펫의 핵심');
  if (!has(blk, 'faq')) E('faq 없음');

  // E-E-A-T — 금융(YMYL) 주제라 1차 출처는 필수로 둔다
  if (!has(blk, 'sources')) E('sources(1차 출처) 없음 — 금융 주제 신뢰도 직결');

  // 있으면 좋은 것 (시행일 이전 발행분)
  if (!has(blk, 'keyPoints')) (isNewSpec(slug) ? E : W)('keyPoints 없음 — 리스트형 스니펫 기회 손실');
  if (!has(blk, 'sourceQuestions')) (isNewSpec(slug) ? E : W)('sourceQuestions 없음 — 주제 출처 추적 불가');

  // 운영자 메타 노출 금지어
  const BAN = /파이프라인|크롤링|스크래핑|Gemini|GPT|LLM|샘플 데이터|placeholder|자동 발행/i;
  if (BAN.test(blk)) E('운영자 메타 금지어 포함');

  // ── 발행 사양 v1.0 (시행일 다음날 발행분부터) ───────────────────────────────
  const headings = [...blk.matchAll(/heading:\s*'((?:[^'\\]|\\.)*)'/g)].map(x => x[1]);

  if (isNewSpec(slug)) {
    // 소제목에도 긴 줄표를 쓰지 않는다 (제목·설명과 같은 기준)
    if (headings.some(h => /—/.test(h))) E('본문 소제목에 긴 줄표(—) 사용');

    // 상투 라벨이 노출창 앞자리를 차지하면 정작 조건 정보가 밀린다
    if (CLICHE_TITLE.test(title)) E(`title에 상투 라벨 사용 — 조건·대상으로 대체할 것`);

    // 주제 출처는 지식iN 질문 원문으로 추적 가능해야 한다
    const sqUrls = [...(blk.match(/sourceQuestions:\s*\[([\s\S]*?)\n\s*\],/) || ['', ''])[1]
      .matchAll(/url:\s*'([^']+)'/g)].map(x => x[1]);
    if (has(blk, 'sourceQuestions') && !sqUrls.every(u => /kin\.naver\.com.*docId=\d+/.test(u)))
      E('sourceQuestions에 질문 원문 주소(docId)가 없음 — 출처 추적 불가');

    // 클러스터에 배정돼야 관련 가이드가 주제에 맞게 연결된다
    if (!clusteredSlugs.has(slug)) E('GUIDE_CLUSTERS 미배정 — 관련 가이드 연결이 주제와 무관해짐');

    // 스니펫 길이를 채우지 못하면 검색결과에서 설명 절반이 빈다
    if (desc && (desc.length < 120 || desc.length > 155)) E(`description ${desc.length}자 (120~155)`);

    // 청크 하나에 결론이 담기려면 섹션이 너무 적어도, 너무 많아도 안 된다
    if (headings.length < 5 || headings.length > 7) W(`섹션 ${headings.length}개 (권장 5~7)`);

    // 소제목이 무엇에 관한 문단인지 밝혀야 검색·답변엔진이 문단을 집는다
    const kwHead = kwm ? (kwm[1].match(/'([^']+)'/) || [])[1] || '' : '';
    const kwTokens = kwHead.split(/[\s·]+/).filter(t => t.length >= 2);
    if (kwTokens.length && !headings.some(h => kwTokens.some(t => h.includes(t))))
      W('본문 소제목에 핵심 검색어가 한 번도 없음');

    // ── v1.1 (2026-08-31) — 정보 밀도·중복 제거 ──────────────────────────
    // 화살표형 단계 나열은 남발하면 기계적으로 읽힌다 (PUBLISHING.md §3)
    const arrowCount = (blk.match(/→/g) || []).length;
    if (arrowCount > 1) W(`화살표(→) ${arrowCount}회 사용 (권장 최대 1회)`);

    // 종합 정리·체크리스트성 블록은 글 하나에 하나만 — 본문 재탕 방지
    const CHECKLIST_HEADING = /체크리스트|최종 점검|핵심 정리|확인할 것|체크포인트/;
    const checklistHeadings = headings.filter(h => CHECKLIST_HEADING.test(h));
    if (checklistHeadings.length > 1) W(`체크리스트성 소제목 ${checklistHeadings.length}개 (최대 1개 권장)`);
  }

  // 발행일이 없으면 최신순 목록과 sitemap 갱신일에서 빠진다
  if (!publishedAt[slug]) E('GUIDE_PUBLISHED_AT에 발행일 없음');
}

const uniq = a => [...new Set(a)];
console.log(`── 가이드 구조 검증 (${marks.length}편) ──`);
if (errors.length) {
  console.log(`\n❌ ERROR ${errors.length}건 (빌드 차단)`);
  uniq(errors).slice(0, 30).forEach(e => console.log('   ' + e));
  if (errors.length > 30) console.log(`   ... 외 ${errors.length - 30}건`);
}
if (warns.length) {
  const byKind = {};
  warns.forEach(w => { const k = w.split(': ')[1].split(' —')[0].split(' (')[0]; byKind[k] = (byKind[k] || 0) + 1; });
  console.log(`\n⚠️  WARN ${warns.length}건 (차단 안 함)`);
  Object.entries(byKind).sort((a, b) => b[1] - a[1]).forEach(([k, n]) => console.log(`   ${n}편  ${k}`));
}
if (!errors.length && !warns.length) console.log('\n✔ 전 항목 통과');
else if (!errors.length) console.log('\n✔ ERROR 없음 (배포 가능)');

process.exit(errors.length ? 1 : 0);
