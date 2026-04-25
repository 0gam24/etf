import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

/**
 * Cloudflare Workers 호환 최소형 OG 이미지.
 *   - 폰트 fetch 제거 (system fallback만 사용 — 한글 깨질 수 있으나 500은 안 남)
 *   - 이모지 0개
 *   - position:absolute, 외부 fetch 0개
 *   - 100% 합성 디바이드 + 박스만
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = (searchParams.get('title') || 'Daily ETF Pulse').slice(0, 80);
    const category = (searchParams.get('category') || 'pulse').split('/')[0];
    const date = searchParams.get('date') || '';
    const tickers = (searchParams.get('tickers') || '').split(',').filter(Boolean).slice(0, 3);
    const meta = CATEGORY_META[category] || CATEGORY_META.pulse;

    return new ImageResponse(
      (
        <div
          style={{
            width: '1200px',
            height: '630px',
            display: 'flex',
            flexDirection: 'column',
            background: '#0B0E14',
            padding: '70px',
            color: '#fff',
          }}
        >
          {/* 브랜드 */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '12px',
                background: '#D4AF37',
                color: '#0B0E14',
                fontSize: '32px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '18px',
              }}
            >
              E
            </div>
            <div
              style={{
                fontSize: '26px',
                fontWeight: 700,
                color: '#D4AF37',
                letterSpacing: '0.1em',
              }}
            >
              DAILY ETF PULSE
            </div>
          </div>

          {/* 카테고리 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              alignSelf: 'flex-start',
              padding: '10px 20px',
              background: meta.accent,
              color: '#0B0E14',
              fontSize: '22px',
              fontWeight: 800,
              letterSpacing: '0.1em',
              borderRadius: '8px',
              marginBottom: '36px',
            }}
          >
            {meta.tag} · {meta.label}
          </div>

          {/* 제목 */}
          <div
            style={{
              fontSize: title.length > 30 ? '56px' : '70px',
              fontWeight: 800,
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              maxWidth: '1060px',
              display: 'flex',
            }}
          >
            {title}
          </div>

          {/* 하단 */}
          <div
            style={{
              marginTop: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '24px',
              color: '#94a3b8',
              borderTop: '2px solid #1f2937',
              paddingTop: '22px',
            }}
          >
            <div style={{ display: 'flex', color: '#D4AF37', fontWeight: 700 }}>
              {date || 'iknowhowinfo.com'}
            </div>
            {tickers.length > 0 && (
              <div style={{ display: 'flex' }}>
                {tickers.map((t, i) => (
                  <div
                    key={t}
                    style={{
                      display: 'flex',
                      padding: '6px 14px',
                      background: '#1e293b',
                      color: meta.accent,
                      borderRadius: '6px',
                      fontSize: '20px',
                      fontWeight: 700,
                      marginLeft: i === 0 ? 0 : '10px',
                    }}
                  >
                    {t}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (err) {
    // 안전장치: 어떤 이유로든 실패하면 1200x630 단색 placeholder
    return new ImageResponse(
      (
        <div
          style={{
            width: '1200px',
            height: '630px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0B0E14',
            color: '#D4AF37',
            fontSize: '72px',
            fontWeight: 800,
            letterSpacing: '0.1em',
          }}
        >
          DAILY ETF PULSE
        </div>
      ),
      { width: 1200, height: 630 },
    );
  }
}
