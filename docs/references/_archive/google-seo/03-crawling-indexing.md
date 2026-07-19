# 크롤링 및 색인 생성 (Crawling & Indexing)

> Googlebot이 사이트를 어떻게 가져오고 색인하는지에 대한 기술 가이드
> 출처: https://developers.google.com/search/docs/crawling-indexing

## Google 크롤러 종류
1. **일반 크롤러** — Googlebot 등, robots.txt 항상 준수
2. **예외 상황 크롤러** — AdsBot 등 특정 제품 전용
3. **사용자 트리거 가져오기** — 사용자 요청 기반 (사이트 인증 등)

## 기술 속성
- 수천 대의 분산 서버 / 전 세계 데이터센터 / 주로 미국 IP
- 미국 IP가 차단되면 다른 국가 IP로 시도

## 지원 프로토콜
- HTTP/1.1 (기본), HTTP/2 (성능 향상, 순위 영향 없음)
- 드물게 FTP/FTPS 지원
- HTTP/2 거부 시: 421 상태 코드 응답

## 지원 콘텐츠 인코딩
- `gzip`, `deflate`, `Brotli(br)`
- `Accept-Encoding` 헤더로 광고됨

## 파일 크기 한도
- 기본 **15MB** 까지만 크롤링 (초과분 무시)
- 파일 형식별 제한이 다를 수 있음

## HTTP 캐싱
권장 헤더 설정:
- `ETag` + `If-None-Match` (권장: 날짜 포맷 이슈 없음)
- `Last-Modified` + `If-Modified-Since`
- `Cache-Control: max-age=초` (보조 권장)

날짜 형식 예: `Fri, 4 Sep 1998 19:15:56 GMT`

## Googlebot 확인 방법
1. HTTP `user-agent` 헤더
2. 소스 IP 주소
3. 역방향 DNS 호스트명 (`crawl-XXX-XXX-XXX-XXX.googlebot.com`)

---

## robots.txt 기본
```txt
User-agent: *
Disallow: /admin/
Disallow: /private/
Allow: /

Sitemap: https://example.com/sitemap.xml
```

## sitemap.xml 기본
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2026-05-19</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

## 색인 제어 메타 태그
```html
<!-- 색인 생성 차단 -->
<meta name="robots" content="noindex">

<!-- 링크 추적 차단 -->
<meta name="robots" content="nofollow">

<!-- 둘 다 -->
<meta name="robots" content="noindex, nofollow">

<!-- Canonical URL -->
<link rel="canonical" href="https://example.com/canonical-page">
```

## HTTP 헤더로도 가능
```
X-Robots-Tag: noindex
```

---

## 바이브코딩 체크리스트
- [ ] robots.txt가 의도한 경로만 차단하는가
- [ ] sitemap.xml이 자동 생성되어 최신 상태인가
- [ ] 응답 헤더에 ETag 또는 Last-Modified가 있는가
- [ ] 모든 리소스가 15MB 이하인가
- [ ] CSS/JS가 robots.txt로 차단되지 않았는가
- [ ] canonical 링크가 모든 페이지에 있는가
