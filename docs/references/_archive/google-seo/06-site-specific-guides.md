# 사이트별 가이드 (Site-Specific Guides)

> 사이트 유형별 SEO 모범 사례

## 전자상거래 (E-commerce)
- 카테고리/필터 URL 표준화 (`canonical`)
- 단종 상품 처리: 410 또는 301 리디렉션
- `Product` schema에 `price`, `availability`, `aggregateRating`
- 면접·재고 변경에 따른 sitemap 동적 업데이트
- 사이트 구조: `/category/subcategory/product`

## 다국어/지역 사이트
- `hreflang` 태그 사용
```html
<link rel="alternate" hreflang="en" href="https://example.com/en/">
<link rel="alternate" hreflang="ko" href="https://example.com/ko/">
<link rel="alternate" hreflang="x-default" href="https://example.com/">
```
- URL 전략: 서브도메인, 서브디렉터리, 또는 ccTLD
- 자동 리디렉션보다는 사용자 선택 우선

## JavaScript 사이트 (SPA/SSR)
- Googlebot은 JS 렌더링 가능하지만 **2단계 색인**
- 가능하면 **SSR/SSG/하이브리드 렌더링** 사용
- 핵심 콘텐츠는 초기 HTML에 포함
- 라우팅은 History API (`pushState`) 사용 — hash URL `#` 피하기
- 이미지 lazy loading은 표준 `loading="lazy"` 사용

## 뉴스 사이트
- Google News 정책 준수
- `NewsArticle` schema 마크업
- 빠르고 정확한 `datePublished`, `dateModified`
- 뉴스 sitemap 별도 제출

## 동영상 사이트
- `VideoObject` schema 필수
- 동영상 sitemap 제출
- 동영상 페이지 1개당 1개 임베드 권장
- 썸네일은 고화질 정적 이미지

## 이미지 중심 사이트
- 의미 있는 파일명: `초콜릿-쿠키.jpg`
- `alt` 속성 필수
- 이미지 sitemap 활용
- 적절한 포맷: WebP/AVIF (현대), JPEG/PNG (호환성)
- `srcset`/`sizes`로 반응형 이미지

---

## 사이트 이전(Migration) 시 체크리스트
- [ ] 301 영구 리디렉션 1:1 매핑
- [ ] 새 도메인에 동일한 콘텐츠 유지
- [ ] Search Console에서 "주소 변경" 알림
- [ ] 새 sitemap 제출
- [ ] 내부 링크 모두 업데이트
- [ ] 외부 백링크 가능한 한 업데이트 요청
- [ ] 변경 후 수 주간 색인 상태 모니터링
