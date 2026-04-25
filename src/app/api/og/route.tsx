import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// Pretendard Bold를 Edge 런타임에서 fetch (첫 요청 이후 CDN·Edge 캐시)
const FONT_URL_BOLD =
  'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/woff/Pretendard-Bold.woff';
const FONT_URL_REGULAR =
  'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/woff/Pretendard-Regular.woff';

async function loadFont(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`font load ${res.status}`);
  return res.arrayBuffer();
}

// ⚠️ Cloudflare Workers Edge 런타임은 system 이모지 폰트가 없어 이모지 렌더링 시 500.
// 이모지 제거하고 텍스트·숫자 라벨로만 구성.
const CATEGORY_META: Record<string, { tag: string; accent: string; label: string }> = {
  pulse:    { tag: '01', accent: '#F59E0B', label: 'DAILY PULSE' },
  surge:    { tag: '02', accent: '#EF4444', label: 'SURGE' },
  flow:     { tag: '03', accent: '#3B82F6', label: 'FLOW' },
  income:   { tag: '04', accent: '#10B981', label: 'INCOME' },
  breaking: { tag: 'NEW',accent: '#F59E0B', label: 'ETF BREAKING' },
  theme:   { tag: 'TH', accent: '#8B5CF6', label: 'THEME' },
  account: { tag: 'AC', accent: '#D4AF37', label: 'ACCOUNT' },
  weekly:  { tag: 'WK', accent: '#D4AF37', label: 'WEEKLY' },
  stock:   { tag: 'ST', accent: '#60A5FA', label: 'STOCK MASTER' },
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') || 'Daily ETF Pulse';
  const subtitle = searchParams.get('subtitle') || '';
  const category = (searchParams.get('category') || 'pulse').split('/')[0];
  const date = searchParams.get('date') || new Date().toLocaleDateString('ko-KR');
  const tickers = searchParams.get('tickers')?.split(',').filter(Boolean).slice(0, 3) || [];

  const meta = CATEGORY_META[category] || CATEGORY_META.pulse;

  // 폰트 로드 실패 시 system-ui fallback으로 계속 진행
  let fonts: { name: string; data: ArrayBuffer; weight: 400 | 700; style: 'normal' }[] | undefined;
  try {
    const [bold, regular] = await Promise.all([loadFont(FONT_URL_BOLD), loadFont(FONT_URL_REGULAR)]);
    fonts = [
      { name: 'Pretendard', data: regular, weight: 400, style: 'normal' },
      { name: 'Pretendard', data: bold, weight: 700, style: 'normal' },
    ];
  } catch {
    fonts = undefined;
  }

  const fontFamily = fonts ? 'Pretendard, system-ui' : 'system-ui';

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #0B0E14 0%, #1A1F2E 100%)',
          padding: '60px 70px',
          fontFamily,
          color: '#fff',
          position: 'relative',
        }}
      >
        {/* 좌상단 브랜드 바 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
          <div
            style={{
              width: '36px', height: '36px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #D4AF37, #FBBF24)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              fontWeight: 800,
              color: '#0B0E14',
            }}
          >
            E
          </div>
          <div
            style={{
              fontSize: '22px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: '#D4AF37',
            }}
          >
            DAILY ETF PULSE
          </div>
        </div>

        {/* 카테고리 배지 */}
        <div
          style={{
            display: 'flex',
            alignSelf: 'flex-start',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 18px',
            background: `${meta.accent}22`,
            border: `1px solid ${meta.accent}66`,
            color: meta.accent,
            fontSize: '20px',
            fontWeight: 700,
            letterSpacing: '0.15em',
            borderRadius: '8px',
            marginBottom: '24px',
          }}
        >
          <span
            style={{
              fontSize: '14px',
              padding: '2px 8px',
              borderRadius: '4px',
              background: meta.accent,
              color: '#0B0E14',
              fontWeight: 800,
            }}
          >
            {meta.tag}
          </span>
          {meta.label}
        </div>

        {/* 제목 */}
        <div
          style={{
            fontSize: title.length > 30 ? '54px' : '66px',
            fontWeight: 700,
            lineHeight: 1.18,
            letterSpacing: '-0.02em',
            color: '#fff',
            maxWidth: '1060px',
            marginBottom: subtitle ? '18px' : '32px',
            display: 'flex',
          }}
        >
          {title}
        </div>

        {subtitle && (
          <div
            style={{
              fontSize: '26px',
              fontWeight: 400,
              color: '#94a3b8',
              lineHeight: 1.4,
              maxWidth: '1060px',
              marginBottom: '32px',
              display: 'flex',
            }}
          >
            {subtitle}
          </div>
        )}

        <div style={{ flex: 1, display: 'flex' }} />

        {/* 하단 메타 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '22px',
            color: '#64748b',
            borderTop: `1px solid ${meta.accent}33`,
            paddingTop: '22px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#D4AF37', fontWeight: 700 }}>{date}</span>
          </div>
          {tickers.length > 0 && (
            <div style={{ display: 'flex', gap: '10px' }}>
              {tickers.map(t => (
                <span
                  key={t}
                  style={{
                    padding: '6px 14px',
                    background: `${meta.accent}1F`,
                    color: meta.accent,
                    borderRadius: '6px',
                    fontSize: '20px',
                    fontWeight: 700,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 우상단 글로우 */}
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            right: '-120px',
            width: '420px',
            height: '420px',
            background: `radial-gradient(circle, ${meta.accent}33 0%, transparent 70%)`,
            display: 'flex',
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts,
    }
  );
}
