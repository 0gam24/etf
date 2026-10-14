/**
 * 410 Gone 응답 (2026-10-14).
 *
 * 이 도메인의 예전 주인(2021년 식품·가전 랭킹 사이트)이 쓰던 주소(/ranking/*, /appliances_ranking/*)는
 * 지금 사이트와 주제가 달라 되살리지 않는다. 404 대신 410 을 내면 검색엔진이 "영구히 없어진 주소"로 보고
 * 더 빨리 색인에서 지운다. 도메인 주제를 ETF·금융으로만 유지하려는 조치다.
 */
export function goneResponse(): Response {
  const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>없는 페이지 | Daily ETF Pulse</title></head><body><h1>없는 페이지입니다</h1><p>이 주소의 페이지는 더 이상 제공하지 않습니다. <a href="/">Daily ETF Pulse 홈</a>에서 ETF 종목 사전과 가이드를 확인하세요.</p></body></html>`;
  return new Response(html, {
    status: 410,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'x-robots-tag': 'noindex',
      'cache-control': 'public, max-age=86400',
    },
  });
}
