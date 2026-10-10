/**
 * 종목 사전 상품 개요(src/lib/etf-profiles.ts) 점검.
 *   npx tsx scripts/check-etf-profiles.mts
 * 메타 설명 길이, 긴 줄표, 화면 금지어, 비교표 코드가 KRX 목록에 있는지, 출처 주소가 도메인 루트가 아닌지 본다.
 */
import fs from 'node:fs';
import { ETF_PROFILES } from '../src/lib/etf-profiles';

const krx = JSON.parse(fs.readFileSync(new URL('../data/krx-etf-codes.json', import.meta.url), 'utf8'));
const list: { shortcode: string; name: string }[] = Array.isArray(krx) ? krx : krx.list || krx.items || [];
const codes = new Set(list.map((e) => e.shortcode));
const nameOf = new Map(list.map((e) => [e.shortcode, e.name]));

const BANNED = [/—/, /–/, /LLM/, /Gemini/, /GPT/, /파이프라인/, /크롤링/, /스크래핑/, /자동 발행/, /샘플/, /정리하면/, /결론부터/, /첫째/, /다시 말해/, /쉽게 말하면/, /중요한 것은/];
let errors = 0;
const err = (code: string, msg: string) => {
  errors++;
  console.log(`ERROR ${code}: ${msg}`);
};

for (const [key, p] of Object.entries(ETF_PROFILES)) {
  if (key !== p.code) err(key, 'key 와 code 가 다름');
  if (!codes.has(p.code)) err(key, 'KRX 목록에 없는 코드');
  const md = p.metaDescription || '';
  if (md && (md.length < 120 || md.length > 155)) err(key, `metaDescription ${md.length}자 (120~155)`);
  const visible = [
    p.summary,
    md,
    ...(p.keywords || []),
    ...p.facts.flatMap((f) => [f.label, f.value]),
    ...p.sections.flatMap((s) => [s.heading, ...s.paragraphs]),
    ...(p.comparison ? [p.comparison.caption, ...p.comparison.columns, ...p.comparison.rows.flat()] : []),
    ...(p.faq || []).flatMap((f) => [f.question, f.answer]),
    ...p.sources.map((s) => s.label),
  ];
  for (const t of visible) for (const re of BANNED) if (re.test(t)) err(key, `금지 표현 ${re} : ${t.slice(0, 60)}`);
  for (const r of p.comparison?.rows || []) {
    const c = r[0].match(/\(([0-9A-Z]{6})\)/)?.[1];
    if (!c) err(key, `비교표 첫 칸에 코드 없음: ${r[0]}`);
    else if (!codes.has(c)) err(key, `비교표 코드 ${c} KRX 목록에 없음`);
    else {
      const label = r[0].replace(/\s*\([0-9A-Z]{6}\)$/, '');
      if (nameOf.get(c) !== label) console.log(`WARN ${key}: 비교표 이름 "${label}" ≠ KRX "${nameOf.get(c)}"`);
    }
    if (p.comparison && r.length !== p.comparison.columns.length) err(key, `비교표 열 수 불일치: ${r[0]}`);
  }
  for (const s of p.sources) {
    try {
      const u = new URL(s.url);
      if (u.pathname === '/' && !u.search) err(key, `출처가 도메인 루트: ${s.url}`);
    } catch {
      err(key, `출처 주소 형식 오류: ${s.url}`);
    }
  }
  if ((p.faq || []).length < 3) console.log(`WARN ${key}: FAQ ${p.faq?.length || 0}개`);
  console.log(`ok ${key} ${nameOf.get(p.code)} · 설명 ${md.length}자 · 섹션 ${p.sections.length} · FAQ ${p.faq?.length || 0} · 출처 ${p.sources.length}`);
}
if (errors) {
  console.log(`\n${errors}건 오류`);
  process.exit(1);
}
