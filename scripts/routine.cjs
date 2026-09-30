// 06시 클라우드 루틴 '04 iknowhowinfo (06:00)' 보조 스크립트. 저장소 파일은 읽기만 한다.
// 사용: node scripts/routine.cjs <명령> [인자]
//   env · snapcheck · qa · gsc · guides <tax|dist> [키워드] · find <지수 키워드> · row <코드…> · pair <코드A> <코드B>
//   lint · scope <snapshot|boost|fix|new|pair> [slug] · wait <URL> [확인 문구]
// 루틴 운영 규칙은 PUBLISHING.md v2.0, 루틴 프롬프트는 claude.ai 루틴 설정에 있다(2026-09-30).
// 이 파일에는 역슬래시 문자를 쓰지 않는다(셸을 거치면 사라지는 사고 방지). selftest가 이를 확인한다.
const fs = require('fs');
const { execSync } = require('child_process');
const NL = String.fromCharCode(10), CR = String.fromCharCode(13), BS = String.fromCharCode(92);
const sh = c => execSync(c, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
const lines = t => t.split(NL).map(l => (l.endsWith(CR) ? l.slice(0, -1) : l));
const read = f => fs.readFileSync(f, 'utf8');
const out = o => console.log(JSON.stringify(o, null, 1));
const [cmd, a1, a2] = process.argv.slice(2);

// 날짜(KST). ROUTINE_NOW는 점검용이며 루틴은 설정하지 않는다.
const base = process.env.ROUTINE_NOW ? Date.parse(process.env.ROUTINE_NOW) : Date.now();
const k = new Date(base + 9 * 3600 * 1000);
const pad = n => String(n).padStart(2, '0');
const Y = k.getUTCFullYear(), M = k.getUTCMonth(), D = k.getUTCDate(), DOW = k.getUTCDay();
const TODAY = Y + '-' + pad(M + 1) + '-' + pad(D);
const TODAY_YMD = TODAY.split('-').join('');
const th = new Date(Date.UTC(Y, M, D));
th.setUTCDate(th.getUTCDate() + 4 - (th.getUTCDay() || 7));
const ISO_WEEK = Math.ceil(((th.getTime() - Date.UTC(th.getUTCFullYear(), 0, 1)) / 86400000 + 1) / 7);
const WEEK_MON = new Date(Date.UTC(Y, M, D - ((DOW + 6) % 7))).toISOString().slice(0, 10);
const WEEK_SUN = new Date(Date.UTC(Y, M, D - ((DOW + 6) % 7) + 6)).toISOString().slice(0, 10);
const SLOT = ['SUN_OFF', 'MON_GSC', 'TUE_PAIR', 'WED_QA', 'THU_TAX',
  ISO_WEEK % 2 === 0 ? 'FRI_GUIDE' : 'FRI_PAIR', D <= 7 ? 'SAT_DIST' : 'SAT_OFF'][DOW];
const age = d => (Date.parse(TODAY) - Date.parse(d)) / 86400000;
const iso8 = s => { s = String(s || ''); return s.slice(0, 4) + '-' + s.slice(4, 6) + '-' + s.slice(6, 8); };
const DATE = '([0-9]{4}-[0-9]{2}-[0-9]{2})';

// 저장소 읽기
const snaps = () => fs.readdirSync('data/raw').filter(f => /^etf_prices_[0-9]{8}[.]json$/.test(f)).sort();
const snapData = f => { try { return JSON.parse(read('data/raw/' + f)).data || {}; } catch (e) { return { parseError: e.message }; } };
const gscFile = () => fs.readdirSync('data/keywords').filter(f => /^gsc_[0-9]{8}[.]json$/.test(f)).sort().pop() || null;
function published(g) {
  const L = lines(g), i = L.findIndex(l => l.startsWith('export const GUIDE_PUBLISHED_AT'));
  if (i < 0) return null;
  const res = [];
  for (let j = i + 1; j < L.length && L[j] !== '};'; j++) {
    const m = L[j].match(new RegExp("^ *'([a-z0-9-]+)' *: *'" + DATE + "'"));
    if (m) res.push({ slug: m[1], date: m[2] });
  }
  return res;
}
function blocks(g) { // 가이드 블록 = slug 줄부터 다음 가이드 slug 줄 전까지 (검증기와 같은 방식)
  const L = lines(g), marks = [];
  L.forEach((l, i) => { const m = l.match(/^ *slug: *'([^']+)'/); if (m) marks.push({ slug: m[1], i }); });
  return marks.map((m, n) => ({ slug: m.slug, line: m.i + 1, text: L.slice(m.i, n + 1 < marks.length ? marks[n + 1].i : L.length).join(NL) }));
}
const pairDates = p => [...p.matchAll(new RegExp('[/][/] 추가 ' + DATE, 'g'))].map(x => x[1]);
const pairCodes = p => [...p.matchAll(/codeA: *'([0-9A-Z]{6})', *codeB: *'([0-9A-Z]{6})'/g)].map(m => [m[1], m[2]]);
const touchedDates = t => [
  ...[...t.matchAll(new RegExp('[/][/] (?:보강|정정) ' + DATE, 'g'))].map(x => x[1]),
  ...[...t.matchAll(new RegExp('[/][/] ' + DATE + ' (?:사실 정정|정정|보강)', 'g'))].map(x => x[1]),
].sort();

if (cmd === 'env') {
  const g = read('src/lib/guides.ts'), p = read('src/lib/etf-compare-pairs.ts');
  const pub = published(g) || [], pd = pairDates(p);
  const capM = read('PUBLISHING.md').match(/현재 새 URL 상한: 주 ([0-9]+)개/);
  const cap = capM ? Number(capM[1]) : 0; // 못 찾으면 0 (새 URL 막음)
  const inWeek = d => d >= WEEK_MON && d <= WEEK_SUN;
  const weekGuides = pub.filter(x => inWeek(x.date)).map(x => x.slug), weekPairs = pd.filter(inWeek);
  const used = weekGuides.length + weekPairs.length;
  const todayNewUrls = pub.filter(x => x.date === TODAY).length + pd.filter(d => d === TODAY).length;
  let doneToday;
  try {
    doneToday = lines(sh('git log origin/main --since="' + TODAY + ' 00:00:00 +0900" --author=claude-routine --format=%s'))
      .filter(s => s && !s.startsWith('chore(data)'));
  } catch (e) { doneToday = ['git log 실패']; }
  // 자체 점검: 이 파일이 온전하고 저장소 구조가 예상과 같은가
  const problems = [];
  if (read(__filename).includes(BS)) problems.push('스크립트에 역슬래시가 섞임');
  const last = snaps().pop(), lc = last ? snapData(last) : {};
  if (!(Array.isArray(lc.etfList) && lc.etfList.length >= 1000)) problems.push('최신 스냅샷 읽기 실패 또는 종목 1,000 미만');
  if (pub.length < 200) problems.push('GUIDE_PUBLISHED_AT 읽기 실패(' + pub.length + '건)');
  if (blocks(g).length < 200) problems.push('가이드 블록 읽기 실패');
  if (pairCodes(p).length < 1) problems.push('COMPARE_PAIRS 읽기 실패');
  if (!capM) problems.push('PUBLISHING.md 상한 줄 없음');
  const newUrlSlot = ['TUE_PAIR', 'FRI_GUIDE', 'FRI_PAIR'].includes(SLOT);
  let slotWork = 'go';
  if (['SUN_OFF', 'SAT_OFF'].includes(SLOT)) slotWork = 'skip: 휴무';
  else if (problems.length) slotWork = 'skip: 보조 스크립트 점검 실패';
  else if (doneToday.length) slotWork = 'skip: 오늘 슬롯 작업이 이미 반영됨';
  else if (newUrlSlot && todayNewUrls > 0) slotWork = 'skip: 오늘 이미 새 페이지가 있음';
  else if (newUrlSlot && cap - used <= 0) slotWork = 'skip: 이번 주 새 페이지 상한에 닿음';
  out({ TODAY_KST: TODAY, TODAY_YMD, DOW, ISO_WEEK, WEEK_MON, SLOT, slotWork,
    selftest: { ok: problems.length === 0, problems },
    cap, used, left: Math.max(0, cap - used), weekGuides, weekPairs, todayNewUrls, doneToday });
} else if (cmd === 'snapcheck') {
  const s = snaps(), cur = s[s.length - 1], prev = s[s.length - 2];
  const c = cur ? snapData(cur) : {}, p = prev ? snapData(prev) : {};
  const count = Array.isArray(c.etfList) ? c.etfList.length : 0;
  const st = lines(sh('git status --porcelain -- data/raw/')).filter(Boolean);
  const want = 'etf_prices_' + TODAY_YMD + '.json';
  const reasons = [];
  if (cur !== want) reasons.push('최신 파일이 오늘 파일(' + want + ')이 아님');
  if (st.length !== 1 || st[0] !== '?? data/raw/' + want) reasons.push('data/raw 변경이 새 파일 1개가 아님: ' + st.join(' | '));
  if (c.parseError) reasons.push('JSON 읽기 실패');
  if (count < 1000) reasons.push('종목 수 ' + count);
  if (!/^[0-9]{8}$/.test(String(c.baseDate || ''))) reasons.push('baseDate 형식 이상');
  else if (String(c.baseDate) <= String(p.baseDate || '')) reasons.push('기준일이 직전(' + p.baseDate + ')보다 새롭지 않음');
  out({ file: cur, baseDate: iso8(c.baseDate), count, ok: reasons.length === 0, reasons,
    untracked: st.includes('?? data/raw/' + want) });
} else if (cmd === 'qa') {
  const f = snaps().pop(), d = snapData(f), list = Array.isArray(d.etfList) ? d.etfList : [];
  const bd = iso8(d.baseDate);
  let missingWeekdays = 0;
  for (let t = Date.parse(bd) + 86400000; t < Date.parse(TODAY); t += 86400000) { const w = new Date(t).getUTCDay(); if (w && w !== 6) missingWeekdays++; }
  const moves = list.filter(e => Math.abs(Number(e.changeRate) || 0) >= 30);
  const withNav = list.filter(e => Number(e.nav) > 0 && Number(e.price) > 0);
  const gaps = withNav.map(e => ({ n: e.name + ' (' + e.code + ')', gap: (e.price - e.nav) / e.nav * 100 })).filter(x => Math.abs(x.gap) > 10);
  const hf = fs.existsSync('data/holdings') ? fs.readdirSync('data/holdings').filter(x => x.endsWith('.json')) : [];
  let inc = 0, incAsOf = null;
  try { const r = JSON.parse(read('data/income/dividend-registry.json')); inc = (r.etfs || []).length; incAsOf = r._meta && r._meta.asOf; } catch (e) { /* 없음 */ }
  out({ snapshot: f, baseDate: bd, missingWeekdays, etfCount: list.length, noPrice: list.filter(e => !(Number(e.price) > 0)).length,
    moveOver30: moves.length, moveSample: moves.slice(0, 3).map(e => e.name + ' (' + e.code + ') ' + e.changeRate + '%'),
    navAvailable: withNav.length, gapOver10: gaps.length, gapSample: gaps.slice(0, 3).map(x => x.n + ' ' + x.gap.toFixed(1) + '%'),
    holdings: hf.length + '/' + list.length, income: inc + '/' + list.length + (incAsOf ? ' asOf ' + incAsOf : '') });
} else if (cmd === 'gsc') {
  const file = gscFile();
  if (!file) { out({ usable: false, reason: 'GSC 스냅샷 파일 없음' }); process.exit(0); }
  const fileDate = iso8(file.slice(4, 12)), d = JSON.parse(read('data/keywords/' + file));
  const bl = blocks(read('src/lib/guides.ts'));
  const byPage = {};
  for (const r of (d.all || []).filter(r => r.position >= 8 && r.position <= 40 && r.impressions >= 1)) {
    const e = (byPage[r.page] = byPage[r.page] || { page: r.page, impressions: 0, queries: [] });
    e.impressions += r.impressions;
    e.queries.push({ query: r.query, impressions: r.impressions, position: Math.round(r.position * 10) / 10 });
  }
  const pages = Object.values(byPage).map(e => {
    const m = e.page.match(/[/]guide[/]([a-z0-9-]+)[/]?$/), b = m && bl.find(x => x.slug === m[1]);
    const boosted = b ? [...b.text.matchAll(new RegExp('[/][/] 보강 ' + DATE, 'g'))].map(x => x[1]).sort().pop() || null : null;
    return { ...e, slug: b ? b.slug : null, lastBoosted: boosted, recent: !!boosted && age(boosted) < 28 };
  }).sort((x, y) => y.impressions - x.impressions);
  const eligible = pages.filter(e => e.slug && !e.recent), stale = age(fileDate) > 14;
  out({ file, range: d.range, stale, usable: !stale && eligible.length > 0,
    reason: stale ? 'GSC 스냅샷이 14일 넘음' : (eligible.length ? '' : '보강할 가이드 후보 없음'),
    eligible: eligible.slice(0, 5), notGuideCount: pages.filter(e => !e.slug).length });
} else if (cmd === 'guides') {
  const GROUPS = { tax: ['ISA 계좌 가이드', 'ETF 세금 가이드', '은퇴 자산 가이드'], dist: ['월배당 가이드', 'ETF 분배금 가이드', '커버드콜 가이드'] };
  if (!GROUPS[a1]) { console.log('인자: tax | dist [키워드]'); process.exit(1); }
  const gf = gscFile(), gsc = gf ? JSON.parse(read('data/keywords/' + gf)).all || [] : [];
  const rows = [];
  let skipped = 0;
  for (const b of blocks(read('src/lib/guides.ts'))) {
    const sec = (b.text.match(/section: *'([^']+)'/) || [])[1];
    if (!GROUPS[a1].includes(sec)) continue;
    const tl = (b.text.match(/title: *(.*)/) || [])[1] || '';
    const title = tl.replace(/,$/, '').slice(1, -1);
    if (a2 && !(title.includes(a2) || b.slug.includes(a2))) continue;
    const touched = touchedDates(b.text).pop() || null;
    if (touched && age(touched) < 28) { skipped++; continue; }
    const imp = gsc.filter(r => r.page && r.page.replace(/[/]$/, '').endsWith('/guide/' + b.slug)).reduce((s, r) => s + (r.impressions || 0), 0);
    rows.push({ slug: b.slug, title, lastTouched: touched, gscImpressions: imp });
  }
  rows.sort((x, y) => y.gscImpressions - x.gscImpressions);
  console.log('후보 ' + rows.length + '편 (최근 28일 안에 손댄 ' + skipped + '편 제외)');
  for (const r of rows) console.log(JSON.stringify(r));
} else if (cmd === 'find') { // 이름에 키워드가 든 종목, 시가총액 순
  const f = snaps().pop(), d = snapData(f);
  const rows = d.etfList.filter(e => e.name.includes(a1)).sort((x, y) => (y.marketCap || 0) - (x.marketCap || 0));
  console.log(f + ' baseDate ' + d.baseDate + ' matches ' + rows.length);
  for (const e of rows.slice(0, 15)) console.log(e.code + ' ' + e.name + ' 시총 ' + e.marketCap + ' 거래대금 ' + e.tradeAmount);
} else if (cmd === 'row') { // 스냅샷 행, KRX 메타 이름, 슬러그 (코드 여러 개)
  const f = snaps().pop(), d = snapData(f);
  const s = JSON.parse(read('data/etf-slug-map.json')), kx = JSON.parse(read('data/krx-etf-codes.json'));
  console.log(f + ' baseDate ' + d.baseDate);
  for (const c of process.argv.slice(3)) {
    console.log(JSON.stringify({ krxName: (kx.byShortcode[c] || {}).name || 'KRX 메타 없음', slug: s.byCode[c] || '슬러그 없음',
      row: d.etfList.find(e => e.code === c) || '스냅샷에 없음' }));
  }
} else if (cmd === 'pair') {
  const has = pairCodes(read('src/lib/etf-compare-pairs.ts')).some(([x, y]) => (x === a1 && y === a2) || (x === a2 && y === a1));
  console.log(has ? '이미 있음' : '새 페어');
} else if (cmd === 'lint') { // 새로 더한 줄 점검
  const add = lines(sh('git diff -U0 -- src/lib/guides.ts src/lib/etf-compare-pairs.ts')).filter(l => l.startsWith('+') && !l.startsWith('+++'));
  const low = add.map(l => l.toLowerCase());
  const BAN = ['파이프라인', '크롤링', '스크래핑', '파싱', '워크플로우', '오케스트레이션', '자동 발행', '자동 업데이트', '자동 생성', '자동 작성',
    'gemini', 'gpt', 'llm', 'chatgpt', 'claude', '샘플 데이터', 'placeholder', 'fallback', 'mock', '애드센스', 'adsense', 'cpc', '광고 수익', '광고 단가',
    '완전정리', '완전 가이드', '총정리', '완전 분석', '한눈에 정리', '무조건 수익', '반드시 오른다', '대박', '이것만 보면 끝'];
  const dash = add.filter(l => l.includes('—') || l.includes('–'));
  const banned = BAN.filter(w => low.some(l => l.includes(w)));
  const rootUrl = add.filter(l => /url: *'https?:[/][/][^/']+[/]?'/.test(l));
  out({ addedLines: add.length, ok: !dash.length && !banned.length && !rootUrl.length, dash: dash.map(l => l.slice(0, 80)), banned, rootUrl,
    checkBot: add.filter(l => l.includes('봇')).map(l => l.slice(0, 80)) });
} else if (cmd === 'scope') { // 커밋 전 변경 범위 검사. 모드: snapshot | boost | fix | new | pair, 그리고 slug
  const mode = a1, slug = a2, bad = [];
  if (!['snapshot', 'boost', 'fix', 'new', 'pair'].includes(mode)) bad.push('모드 이상: ' + mode);
  if (mode !== 'snapshot' && !slug) bad.push('slug 인자 없음');
  const snapRe = /^data[/]raw[/]etf_prices_[0-9]{8}[.]json$/;
  const changed = lines(sh('git diff --name-only HEAD')).filter(Boolean);
  const untracked = lines(sh('git ls-files --others --exclude-standard')).filter(Boolean);
  const okFile = f => snapRe.test(f) || (['boost', 'fix', 'new'].includes(mode) && f === 'src/lib/guides.ts') || (mode === 'pair' && f === 'src/lib/etf-compare-pairs.ts');
  for (const f of [...changed, ...untracked]) if (!okFile(f)) bad.push('허용 밖 파일: ' + f);
  for (const f of changed) if (snapRe.test(f)) bad.push('기존 스냅샷 수정·삭제: ' + f);
  if (untracked.filter(f => snapRe.test(f)).length > 1) bad.push('새 스냅샷이 2개 이상');
  const hunks = file => {
    const res = [];
    let cur = null;
    for (const l of lines(sh('git diff -U0 HEAD -- ' + file))) {
      const m = l.match(/^@@ -([0-9]+)(?:,([0-9]+))? [+]([0-9]+)(?:,([0-9]+))? @@/);
      if (m) { cur = { a: +m[1], n: m[2] === undefined ? 1 : +m[2], add: [], del: [] }; res.push(cur); continue; }
      if (!cur || l.startsWith('+++') || l.startsWith('---')) continue;
      if (l.startsWith('+')) cur.add.push(l.slice(1)); else if (l.startsWith('-')) cur.del.push(l.slice(1));
    }
    return res;
  };
  if (['boost', 'fix', 'new'].includes(mode)) {
    const L = lines(sh('git show HEAD:src/lib/guides.ts')), hs = hunks('src/lib/guides.ts');
    const dels = hs.flatMap(h => h.del), adds = hs.flatMap(h => h.add);
    const at = s => L.findIndex(l => l.startsWith(s)) + 1;
    const pubA = at('export const GUIDE_PUBLISHED_AT'), pubB = pubA + L.slice(pubA - 1).indexOf('};');
    const guidesLine = at('export const GUIDES: GuideDef[]');
    if (dels.some(l => /^ *(slug|title) *:/.test(l))) bad.push('기존 slug·title 줄 변경');
    if (mode === 'new') {
      if (dels.filter(l => !/^ *slugs: *[[]/.test(l)).length || dels.length > 1) bad.push('기존 줄 변경(클러스터 slugs 한 줄 외)');
      if (dels.length === 1 && !adds.some(l => /^ *slugs: *[[]/.test(l) && l.includes("'" + slug + "'"))) bad.push('클러스터 줄에 새 slug가 없음');
      for (const h of hs) if (h.a < guidesLine - 1) bad.push('GUIDES 선언 위쪽 변경: 원본 ' + h.a + '행');
      if (adds.filter(l => /^ *slug *:/.test(l)).length !== 1) bad.push('새 slug 줄이 1개가 아님');
      if (adds.filter(l => new RegExp("^ *'[a-z0-9-]+' *: *'" + DATE + "',? *$").test(l)).length !== 1) bad.push('발행일 추가가 1줄이 아님');
      if (!adds.some(l => l.includes("'" + slug + "': '" + TODAY + "'"))) bad.push('발행일이 오늘 날짜로 등록 안 됨');
    } else {
      const isDecl = l => /^(export )?const [A-Za-z0-9_]+: GuideDef = [{]/.test(l);
      const bl = blocks(L.join(NL)), i = bl.findIndex(b => b.slug === slug);
      if (i < 0) bad.push('기존 가이드에 없는 slug: ' + slug);
      else {
        let s = bl[i].line; while (s > 1 && !isDecl(L[s - 1])) s--;
        let e = i + 1 < bl.length ? bl[i + 1].line - 1 : guidesLine - 1; while (e > s && !isDecl(L[e - 1])) e--;
        if (e > s) e--; else e = i + 1 < bl.length ? bl[i + 1].line - 1 : guidesLine - 1;
        for (const h of hs) {
          const b = h.a + Math.max(h.n, 1) - 1;
          if (h.a < s || b > e || (h.a >= pubA && h.a <= pubB)) bad.push('대상 가이드 밖 변경: 원본 ' + h.a + '~' + b + '행');
        }
      }
      const limit = mode === 'boost' ? 4 : 10;
      if (dels.length > limit) bad.push('바꾼 기존 줄 ' + dels.length + '개 (상한 ' + limit + ')');
      if (adds.some(l => /^ *slug *:/.test(l))) bad.push('보강·정정인데 새 slug 추가');
    }
  }
  if (mode === 'pair') {
    const hs = hunks('src/lib/etf-compare-pairs.ts'), dels = hs.flatMap(h => h.del), adds = hs.flatMap(h => h.add);
    if (dels.filter(l => !/^ *[}],? *$/.test(l)).length || dels.length > 1) bad.push('기존 페어 줄 변경');
    if (adds.filter(l => /^ *slug *:/.test(l)).length !== 1) bad.push('새 페어가 1개가 아님');
    if (!adds.some(l => l.includes('// 추가 ' + TODAY))) bad.push('// 추가 ' + TODAY + ' 주석 없음');
  }
  if (bad.length) { console.log('SCOPE FAIL' + NL + '- ' + bad.join(NL + '- ')); process.exit(1); }
  console.log('SCOPE OK');
} else if (cmd === 'wait') { // 주소가 200이고(구절을 주면 그 구절까지) 보일 때까지 30초 간격 최대 18회
  const url = a1, phrase = a2;
  (async () => {
    for (let i = 1; i <= 18; i++) {
      try {
        const r = await fetch(url, { headers: { 'cache-control': 'no-cache' } });
        const body = await r.text();
        if (r.status === 200 && (!phrase || body.includes(phrase))) { console.log('OK ' + url + ' (' + i + '회차)'); return; }
        console.log(i + '회차: ' + r.status + (phrase ? ' 구절 ' + (body.includes(phrase) ? '있음' : '없음') : ''));
      } catch (e) { console.log(i + '회차: 요청 실패 ' + e.message); }
      if (i < 18) await new Promise(res => setTimeout(res, 30000));
    }
    console.log('TIMEOUT ' + url);
    process.exit(2);
  })();
} else {
  console.log('명령: env | snapcheck | qa | gsc | guides | find | row | pair | lint | scope | wait');
  process.exit(1);
}
