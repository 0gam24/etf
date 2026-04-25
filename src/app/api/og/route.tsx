import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * OG 이미지 라우트 — Cloudflare Workers 호환 SVG 직접 생성.
 *
 *   @vercel/og는 satori+resvg-wasm 의존인데 Cloudflare Workers에서
 *   wasm 모듈 로딩 실패로 500 에러 발생. SVG 직접 생성으로 전환:
 *     - 의존성 0 (순수 문자열)
 *     - wasm 미사용 → 100% 안정
 *     - Content-Type: image/svg+xml
 *     - 카카오톡·네이버·구글 미리보기 모두 SVG 지원
 *     - Twitter/Facebook은 og:image 메타에 PNG 선호하나 SVG도 fallback 지원
 */

const CATEGORY_META: Record<string, { tag: string; accent: string; label: string }> = {
  pulse:    { tag: 'PLS', accent: '#F59E0B', label: 'DAILY PULSE' },
  surge:    { tag: 'SRG', accent: '#EF4444', label: 'SURGE' },
  flow:     { tag: 'FLW', accent: '#3B82F6', label: 'FLOW' },
  income:   { tag: 'INC', accent: '#10B981', label: 'INCOME' },
  breaking: { tag: 'NEW', accent: '#F59E0B', label: 'ETF BREAKING' },
  theme:    { tag: 'THM', accent: '#8B5CF6', label: 'THEME' },
  account:  { tag: 'ACC', accent: '#D4AF37', label: 'ACCOUNT' },
  weekly:   { tag: 'WKL', accent: '#D4AF37', label: 'WEEKLY' },
  stock:    { tag: 'STK', accent: '#60A5FA', label: 'STOCK MASTER' },
};

/** XML/SVG 안전 escape */
function esc(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** 긴 제목을 max 폭에 맞게 줄바꿈 */
function wrapText(text: string, maxCharsPerLine: number, maxLines: number): string[] {
  const lines: string[] = [];
  let current = '';
  for (const ch of text) {
    if (current.length >= maxCharsPerLine) {
      lines.push(current);
      current = '';
      if (lines.length >= maxLines) break;
    }
    current += ch;
  }
  if (current && lines.length < maxLines) lines.push(current);
  if (text.length > maxCharsPerLine * maxLines) {
    lines[lines.length - 1] = lines[lines.length - 1].slice(0, -1) + '…';
  }
  return lines;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get('title') || 'Daily ETF Pulse').slice(0, 100);
  const category = (searchParams.get('category') || 'pulse').split('/')[0];
  const date = searchParams.get('date') || '';
  const tickers = (searchParams.get('tickers') || '').split(',').filter(Boolean).slice(0, 3);
  const meta = CATEGORY_META[category] || CATEGORY_META.pulse;

  const titleLines = wrapText(esc(title), 28, 3);
  const fontSize = title.length > 40 ? 56 : 70;

  // 티커 박스 그리기 (오른쪽 끝부터 왼쪽으로)
  const tickerBoxes = tickers.map((t, i) => {
    const x = 1130 - (tickers.length - 1 - i) * 140;
    return `
      <rect x="${x - 60}" y="558" width="115" height="36" rx="6" fill="${meta.accent}22" stroke="${meta.accent}66" stroke-width="1"/>
      <text x="${x - 2}" y="582" font-size="20" font-weight="700" fill="${meta.accent}" text-anchor="middle" font-family="Pretendard, system-ui, sans-serif">${esc(t)}</text>
    `;
  }).join('');

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0B0E14"/>
      <stop offset="100%" stop-color="#1A1F2E"/>
    </linearGradient>
    <radialGradient id="glow" cx="100%" cy="0%" r="60%">
      <stop offset="0%" stop-color="${meta.accent}" stop-opacity="0.18"/>
      <stop offset="60%" stop-color="${meta.accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- 배경 -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <!-- 좌상단 브랜드 박스 + 텍스트 -->
  <rect x="70" y="60" width="52" height="52" rx="12" fill="#D4AF37"/>
  <text x="96" y="98" font-size="32" font-weight="800" fill="#0B0E14" text-anchor="middle" font-family="Pretendard, system-ui, sans-serif">E</text>
  <text x="138" y="96" font-size="26" font-weight="700" letter-spacing="2.6" fill="#D4AF37" font-family="Pretendard, system-ui, sans-serif">DAILY ETF PULSE</text>

  <!-- 카테고리 배지 -->
  <rect x="70" y="150" width="${meta.label.length * 14 + 80}" height="44" rx="8" fill="${meta.accent}"/>
  <text x="${85 + (meta.label.length * 14 + 80) / 2 - 40}" y="180" font-size="22" font-weight="800" letter-spacing="2.2" fill="#0B0E14" font-family="Pretendard, system-ui, sans-serif">${esc(meta.tag)} · ${esc(meta.label)}</text>

  <!-- 제목 -->
  ${titleLines.map((line, i) => `<text x="70" y="${290 + i * (fontSize + 10)}" font-size="${fontSize}" font-weight="800" fill="#ffffff" letter-spacing="-1.4" font-family="Pretendard, system-ui, sans-serif">${line}</text>`).join('')}

  <!-- 하단 구분선 -->
  <line x1="70" y1="540" x2="1130" y2="540" stroke="${meta.accent}55" stroke-width="2"/>

  <!-- 하단 좌측: 날짜 또는 도메인 -->
  <text x="70" y="588" font-size="24" font-weight="700" fill="#D4AF37" font-family="Pretendard, system-ui, sans-serif">${esc(date || 'iknowhowinfo.com')}</text>

  <!-- 하단 우측: 티커 -->
  ${tickerBoxes}
</svg>`;

  return new NextResponse(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
