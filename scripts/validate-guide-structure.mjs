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

  // 있으면 좋은 것
  if (!has(blk, 'keyPoints')) W('keyPoints 없음 — 리스트형 스니펫 기회 손실');
  if (!has(blk, 'sourceQuestions')) W('sourceQuestions 없음 — 주제 출처 추적 불가');

  // 운영자 메타 노출 금지어
  const BAN = /파이프라인|크롤링|스크래핑|Gemini|GPT|LLM|샘플 데이터|placeholder|자동 발행/i;
  if (BAN.test(blk)) E('운영자 메타 금지어 포함');
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
