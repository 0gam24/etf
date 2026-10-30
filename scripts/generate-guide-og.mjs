/**
 * 가이드별 대표 이미지(OG) PNG 생성 — public/og/guide/{slug}.png 로 굽고 커밋한다.
 *
 *   왜 글마다 따로 굽나 (2026-10-30):
 *     네이버 서치어드바이저 「콘텐츠 마크업」 og:image 항목은 "각 문서를 대표할 수 있는 고유 이미지"를 쓰라고 하고,
 *     여러 페이지에 반복되는 이미지는 검색엔진이 쓰지 않을 수 있다고 적는다. 가이드 269편이 /og/guide.png 한 장을
 *     같이 쓰고 있었다. 제목·분류가 들어간 카드를 글마다 따로 만든다(150x150 초과, 5,000바이트 이상, 가로세로 3:1 이내).
 *
 *   글꼴: 이 PC(Windows)의 맑은 고딕으로 굽는다. 한글 글꼴이 없는 환경에서 돌리면 글자가 빈칸으로 나오므로
 *     클라우드 루틴에서는 돌리지 않는다. 이미지가 없는 새 가이드는 공통 카드(/og/guide.png)로 나간다(src/lib/og-images.ts).
 *
 *   실행: npm run og:guides            없는 것만 만든다
 *         npm run og:guides -- --force  전부 다시 만든다 (제목을 바꾼 경우 등)
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import sharp from 'sharp';

const ROOT = process.cwd();
const require = createRequire(`${ROOT}/package.json`);
const { createJiti } = require('jiti');
const jiti = createJiti(`${ROOT}/`, { alias: { '@': `${ROOT}/src` } });
const { GUIDES } = await jiti.import('./src/lib/guides.ts');

const OUT_DIR = path.join(ROOT, 'public', 'og', 'guide');
const MANIFEST = path.join(ROOT, 'data', 'og-guide-slugs.json');
const FORCE = process.argv.includes('--force');
const W = 1200, H = 630;
const ACCENT = '#8B5CF6';   // generate-og-images.mjs 의 guide 색과 같다
const FONT = "'Malgun Gothic','맑은 고딕','Apple SD Gothic Neo','Noto Sans KR',sans-serif";
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** 글자 폭 어림값(em). 한글·한자는 1, 영문 대문자·숫자는 0.62, 소문자 0.55, 공백 0.3 */
function widthEm(s) {
  let w = 0;
  for (const ch of s) {
    if (/[ㄱ-힣一-鿿]/.test(ch)) w += 1;
    else if (ch === ' ') w += 0.3;
    else if (/[A-Z0-9&%]/.test(ch)) w += 0.62;
    else w += 0.55;
  }
  return w;
}

/** 띄어쓰기 단위로 줄을 나눈다. 한 단어가 줄보다 길면 글자 단위로 자른다 */
function wrap(text, maxEm) {
  const lines = [];
  let cur = '';
  for (const word of text.split(' ')) {
    const next = cur ? `${cur} ${word}` : word;
    if (widthEm(next) <= maxEm) { cur = next; continue; }
    if (cur) lines.push(cur);
    if (widthEm(word) <= maxEm) { cur = word; continue; }
    cur = '';
    for (const ch of word) {
      if (widthEm(cur + ch) > maxEm) { lines.push(cur); cur = ''; }
      cur += ch;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

function svgFor(g) {
  const usable = W - 80 - 80;
  // 이미지는 새로 만드는 글자라 문체 규칙(긴 줄표 금지)을 따른다. 규칙 이전 제목의 긴 줄표는 콜론으로 바꿔 싣는다
  const title = g.title.replace(/\s*[—–]\s*/g, ': ');
  let fs_ = 64;
  let lines = wrap(title, usable / fs_);
  if (lines.length > 2) { fs_ = 54; lines = wrap(title, usable / fs_); }
  if (lines.length > 3) { lines = lines.slice(0, 3); lines[2] = lines[2].replace(/.$/, '…'); }
  const lh = Math.round(fs_ * 1.3);
  const top = 250;
  const titleSvg = lines
    .map((l, i) => `<text x="80" y="${top + i * lh}" font-family="${FONT}" font-size="${fs_}" font-weight="800" fill="#FFFFFF">${esc(l)}</text>`)
    .join('\n  ');
  const ruleY = top + (lines.length - 1) * lh + 48;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0B0E14"/>
      <stop offset="100%" stop-color="#151A24"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect x="0" y="0" width="12" height="${H}" fill="${ACCENT}"/>
  <text x="80" y="140" font-family="${FONT}" font-size="32" font-weight="700" fill="${ACCENT}">${esc(g.section)}</text>
  ${titleSvg}
  <rect x="80" y="${ruleY}" width="120" height="5" fill="${ACCENT}"/>
  <text x="80" y="574" font-family="${FONT}" font-size="32" font-weight="700" fill="#FFFFFF">Daily ETF Pulse</text>
  <text x="330" y="574" font-family="${FONT}" font-size="28" fill="#6B7280">iknowhowinfo.com</text>
</svg>`;
}

fs.mkdirSync(OUT_DIR, { recursive: true });
let made = 0, kept = 0, minBytes = Infinity;
for (const g of GUIDES) {
  const file = path.join(OUT_DIR, `${g.slug}.png`);
  if (!FORCE && fs.existsSync(file)) { kept++; continue; }
  const buf = await sharp(Buffer.from(svgFor(g))).png({ palette: true, quality: 90, compressionLevel: 9 }).toBuffer();
  fs.writeFileSync(file, buf);
  minBytes = Math.min(minBytes, buf.length);
  made++;
}

// 사이트는 이 목록에 있는 글만 글별 이미지를 쓴다. 파일이 없는 새 가이드는 공통 카드로 나간다
const slugs = GUIDES.map(g => g.slug).filter(s => fs.existsSync(path.join(OUT_DIR, `${s}.png`))).sort();
fs.writeFileSync(MANIFEST, JSON.stringify({ slugs }, null, 2) + '\n');

console.log(`가이드 대표 이미지: 새로 ${made}장 · 기존 ${kept}장 · 목록 ${slugs.length}편 → public/og/guide/`);
if (made) console.log(`가장 작은 파일 ${minBytes.toLocaleString()}바이트 (네이버 기준 5,000바이트 이상)`);
