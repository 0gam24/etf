import { getSiteLastModified, getAllPosts } from '@/lib/posts';
import { getLatestEtfData } from '@/lib/data';
import { GUIDE_PUBLISHED_AT } from '@/lib/guides';

/**
 * Daily ETF Pulse — Sitemap index.
 *
 *   Google 가이드 (developers.google.com/search/docs/crawling-indexing/sitemaps/large-sitemaps):
 *     - 여러 sitemap을 묶는 진입점
 *     - 50,000 URL 또는 50MB 초과 시 필수, 그 미만은 선택
 *
 *   우리는 콘텐츠 + 이미지 sitemap 분리 운영 — index로 묶어 GSC·Naver에 한 번에 제출.
 *
 *   robots.txt가 이 index를 가리키도록 설정 (또는 main sitemap을 가리켜도 OK).
 */

const SITE = process.env.SITE_URL || 'https://iknowhowinfo.com';

// ★ 빌드타임 정적 생성 강제 — Cloudflare Workers 런타임에선 data/ 를 읽지 못해
//   getAllPosts()·getLatestEtfData()가 빈 값을 돌려주고, 갱신일이 전부 "지금"으로 떨어진다.
//   실제로 자식 넷이 모두 요청 시각(밀리초까지 동일)으로 나가고 있었다.
//   sitemap-etf.xml·rss.xml이 같은 이유로 이미 이 설정을 쓴다. (2026-08-12)
export const dynamic = 'force-static';

export async function GET() {
  /**
   * 갱신일은 자식 sitemap마다 따로 계산한다.
   *
   *   예전에는 하나를 계산해 넷에 그대로 복사했다. 그러면 종목 시세만 바뀐 날에도
   *   글 sitemap이 갱신된 것처럼 보이고, 반대로 가이드를 발행해도 종목 쪽 날짜가
   *   같이 움직인다. 검색엔진은 이런 갱신일을 신뢰하지 않게 되고, 그러면
   *   재수집 우선순위가 내려간다. 각자 실제로 바뀐 시점을 쓴다. (2026-08-12)
   */
  //   sitemap.xml에는 일별 글과 가이드가 함께 들어간다. 글만 보면 일별 발행이 멈춘
  //   6월이 최신으로 잡혀서, 8월에 가이드를 발행해도 "6월 이후 안 바뀜"이라고 신고하게 된다.
  //   그러면 검색엔진이 다시 가져가지 않는다. 둘 중 나중 것을 쓴다.
  const latestPost = getSiteLastModified()?.getTime() ?? 0;
  const latestGuide = Object.values(GUIDE_PUBLISHED_AT)
    .map(d => new Date(`${d}T09:00:00+09:00`).getTime())
    .reduce((a, b) => Math.max(a, b), 0);
  const contentLastmod = new Date(Math.max(latestPost, latestGuide) || Date.now()).toISOString();

  // 종목 사전은 KRX 시세 기준일이 곧 갱신일이다 (YYYYMMDD → ISO)
  const baseDate = getLatestEtfData()?.baseDate;
  const etfLastmod = baseDate && /^\d{8}$/.test(baseDate)
    ? new Date(`${baseDate.slice(0, 4)}-${baseDate.slice(4, 6)}-${baseDate.slice(6, 8)}T09:00:00+09:00`).toISOString()
    : contentLastmod;

  // 속보 sitemap은 최근 2일 글만 담으므로, 최신 속보 발행일이 갱신일이다
  const latestBreaking = getAllPosts().find(p => p.meta.category === 'breaking');
  const newsLastmod = latestBreaking ? new Date(latestBreaking.meta.date).toISOString() : contentLastmod;

  const children: Array<[string, string]> = [
    ['sitemap.xml', contentLastmod],
    ['sitemap-etf.xml', etfLastmod],
    ['sitemap-images.xml', contentLastmod],
    ['sitemap-news.xml', newsLastmod],
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${children.map(([name, mod]) => `  <sitemap>
    <loc>${SITE}/${name}</loc>
    <lastmod>${mod}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;
  // 참고: /llms.txt 는 sitemap 스펙상 XML sitemap 에 넣는 자산이 아니라
  //   robots.txt 에서 참조한다 (AI 봇 안내서). robots.ts 의 sitemap 배열 하단 주석 참고.

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
