/**
 * OG 이미지 PNG 생성 — 빌드 이전에 1회 실행해 public/og/*.png 로 커밋한다.
 *
 *   왜 정적 PNG인가:
 *     - 기존 /api/og 라우트는 Content-Type: image/svg+xml 로 응답한다.
 *       @vercel/og(satori+resvg-wasm)가 Cloudflare Workers에서 실패해 SVG 직접 생성으로
 *       전환한 흔적인데, 그 결과 네이버가 썸네일을 만들지 못한다(네이버는 SVG 미지원).
 *       네이버 30일 노출 6.8만 · 클릭 68(0.1%)의 구조적 원인 중 하나다.
 *     - 런타임에서 PNG를 만들려면 다시 wasm이 필요하므로, 빌드 시점에 sharp로 굽고
 *       정적 파일로 서빙한다. Workers 런타임 제약을 아예 우회한다.
 *
 *   카테고리별 1장씩. 제목별 동적 생성은 후속 과제(자체 이미지 정책)로 남긴다.
 *
 *   실행: node scripts/generate-og-images.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const OUT_DIR = path.join(process.cwd(), 'public', 'og');
const W = 1200, H = 630;

/** 카테고리 → 강조색·라벨. /api/og/route.tsx의 CATEGORY_META와 같은 색 체계를 쓴다. */
const CATEGORIES = [
  { key: 'default',  accent: '#F5C451', label: 'DAILY ETF PULSE', ko: '매일 발행하는 ETF 분석과 투자 가이드' },
  { key: 'pulse',    accent: '#F59E0B', label: 'DAILY PULSE',     ko: '오늘의 ETF 관전포인트' },
  { key: 'surge',    accent: '#EF4444', label: 'SURGE',           ko: '급등 테마 분석' },
  { key: 'flow',     accent: '#3B82F6', label: 'FLOW',            ko: 'ETF 섹터 자금 흐름' },
  { key: 'income',   accent: '#10B981', label: 'INCOME',          ko: '월배당·커버드콜 ETF' },
  { key: 'breaking', accent: '#F59E0B', label: 'ETF BREAKING',    ko: '오늘의 ETF 속보' },
  { key: 'guide',    accent: '#8B5CF6', label: 'GUIDE',           ko: 'ETF 투자 가이드' },
  { key: 'stock',    accent: '#06B6D4', label: 'ETF DICTIONARY',  ko: 'ETF 종목 사전' },
  { key: 'compare',  accent: '#F97316', label: 'COMPARE',         ko: 'ETF 1:1 비교' },
];

const FONT = "'Malgun Gothic','맑은 고딕','Apple SD Gothic Neo','Noto Sans KR',sans-serif";
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function svgFor({ accent, label, ko }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0B0E14"/>
      <stop offset="100%" stop-color="#151A24"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect x="0" y="0" width="12" height="${H}" fill="${accent}"/>
  <text x="80" y="180" font-family="${FONT}" font-size="30" font-weight="700" fill="${accent}" letter-spacing="4">${esc(label)}</text>
  <text x="80" y="310" font-family="${FONT}" font-size="66" font-weight="800" fill="#FFFFFF">${esc(ko)}</text>
  <rect x="80" y="368" width="120" height="5" fill="${accent}"/>
  <text x="80" y="452" font-family="${FONT}" font-size="30" fill="#9AA4B2">한국거래소(KRX) 공공데이터 기준</text>
  <text x="80" y="500" font-family="${FONT}" font-size="30" fill="#9AA4B2">매일 아침 갱신</text>
  <text x="80" y="574" font-family="${FONT}" font-size="32" font-weight="700" fill="#FFFFFF">Daily ETF Pulse</text>
  <text x="330" y="574" font-family="${FONT}" font-size="28" fill="#6B7280">iknowhowinfo.com</text>
</svg>`;
}

fs.mkdirSync(OUT_DIR, { recursive: true });
let made = 0;
for (const c of CATEGORIES) {
  const buf = await sharp(Buffer.from(svgFor(c))).png({ compressionLevel: 9 }).toBuffer();
  const file = path.join(OUT_DIR, `${c.key}.png`);
  fs.writeFileSync(file, buf);
  const meta = await sharp(buf).metadata();
  console.log(`  ${c.key.padEnd(9)} ${meta.width}x${meta.height}  ${(buf.length / 1024).toFixed(1)}KB`);
  made++;
}
console.log(`\nOG 이미지 ${made}장 생성 → public/og/`);
