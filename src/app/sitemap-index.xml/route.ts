import { getSiteLastModified, getAllPosts } from '@/lib/posts';
import { getLatestEtfData } from '@/lib/data';
import { GUIDE_PUBLISHED_AT } from '@/lib/guides';
import mainSitemap from '../sitemap';

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

function toTime(v: string | Date | undefined): number {
  if (!v) return 0;
  const t = (v instanceof Date ? v : new Date(v)).getTime();
  return isNaN(t) ? 0 : t;
}

export async function GET() {
  /**
   * 갱신일은 자식 sitemap마다 따로 계산한다.
   *
   *   예전에는 하나를 계산해 넷에 그대로 복사했다. 그러면 종목 시세만 바뀐 날에도
   *   글 sitemap이 갱신된 것처럼 보이고, 반대로 가이드를 발행해도 종목 쪽 날짜가
   *   같이 움직인다. 검색엔진은 이런 갱신일을 신뢰하지 않게 되고, 그러면
   *   재수집 우선순위가 내려간다. 각자 실제로 바뀐 시점을 쓴다. (2026-08-12)
   *
   *   날짜를 데이터에서 얻지 못하면 <lastmod> 를 생략한다. 빌드 시각(Date.now())을
   *   넣으면 빌드마다 "방금 바뀜"으로 신고된다. (2026-10-06)
   */
  //   sitemap.xml에는 일별 글·가이드·/etf 인덱스·/compare·도구가 함께 들어간다.
  //   그 안 항목 lastmod 의 최댓값을 그대로 쓴다. 예전에는 글·가이드 날짜만 봐서
  //   시세 기준일로 갱신되는 /etf·/compare 항목보다 index 날짜가 앞서는 일이 있었다. (2026-10-06)
  const mainLastmodTs = mainSitemap()
    .map(e => toTime(e.lastModified))
    .reduce((a, b) => Math.max(a, b), 0);

  //   이미지 sitemap은 글과 가이드 목록에서 만들어지므로 둘 중 나중 날짜를 쓴다.
  const latestPost = getSiteLastModified()?.getTime() ?? 0;
  const latestGuide = Object.values(GUIDE_PUBLISHED_AT)
    .map(d => new Date(`${d}T09:00:00+09:00`).getTime())
    .filter(t => !isNaN(t))
    .reduce((a, b) => Math.max(a, b), 0);
  const contentLastmodTs = Math.max(latestPost, latestGuide);

  // 종목 사전은 KRX 시세 기준일이 곧 갱신일이다 (YYYYMMDD → ISO)
  const baseDate = getLatestEtfData()?.baseDate;
  const etfLastmodTs = baseDate && /^\d{8}$/.test(baseDate)
    ? new Date(`${baseDate.slice(0, 4)}-${baseDate.slice(4, 6)}-${baseDate.slice(6, 8)}T09:00:00+09:00`).getTime()
    : 0;

  /**
   * 속보 sitemap(Google News 형식)은 최근 2일 안의 속보 글만 담는다.
   *   2026-10-06: 속보 글이 6월 이후 없어 이 sitemap 은 늘 빈 목록이었다. 빈 자식 sitemap 을
   *   index 에 계속 두면 검색엔진이 매번 받아 가지만 얻는 주소가 없다. 빌드 시점에 최근 2일
   *   안의 속보가 있을 때만 index 에 넣는다. 속보를 새로 내면 그 배포의 빌드에서 다시 들어온다.
   */
  const latestBreaking = getAllPosts().find(p => p.meta.category === 'breaking');
  const latestBreakingTs = latestBreaking ? toTime(latestBreaking.meta.date) : 0;
  const hasRecentBreaking = latestBreakingTs > 0 && latestBreakingTs >= Date.now() - 2 * 86400 * 1000;

  const children: Array<[string, number]> = [
    ['sitemap.xml', mainLastmodTs],
    ['sitemap-etf.xml', etfLastmodTs],
    ['sitemap-images.xml', contentLastmodTs],
  ];
  if (hasRecentBreaking) children.push(['sitemap-news.xml', latestBreakingTs]);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${children.map(([name, ts]) => `  <sitemap>
    <loc>${SITE}/${name}</loc>${ts > 0 ? `
    <lastmod>${new Date(ts).toISOString()}</lastmod>` : ''}
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
