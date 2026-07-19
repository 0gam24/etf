# 순위 및 검색 노출 (Ranking & Search Appearance)

> 검색결과에서 사이트가 어떻게 보이고 순위가 매겨지는지에 대한 가이드

## 검색결과의 시각적 구성요소
| 요소 | 출처 | 영향 방법 |
|------|------|---------|
| 제목 링크 | `<title>`, 페이지 제목 | 명확·고유·간결한 title 작성 |
| 스니펫 | 페이지 본문 또는 `meta description` | 페이지마다 고유한 description |
| 사이트 이름 | 구조화된 데이터 + 사이트 정보 | `WebSite` 구조화 데이터 |
| 파비콘 | `<link rel="icon">` | 48px 이상 정사각형 이미지 |
| 탐색경로 | URL 구조 / 구조화 데이터 | `BreadcrumbList` schema |
| 리치 결과 | 구조화된 데이터 | JSON-LD 마크업 |

---

## 제목 링크 최적화
- 페이지마다 고유하게
- 너무 길지 않게 (모바일 약 50~60자 권장)
- 비즈니스 이름은 끝에 (`주제 - 사이트명`)
- 키워드 스터핑 금지

## 메타 설명 작성
```html
<meta name="description"
      content="홈베이커를 위한 초콜릿 칩 쿠키 레시피. 단계별 사진과 베이킹 팁 포함.">
```
- 짧고 페이지 고유 내용
- 클릭을 유도하는 명확한 가치 제안

---

## 구조화된 데이터 (Structured Data / JSON-LD)
리치 결과(별점, 캐러셀, FAQ 등)를 활성화한다.

### 예: Article
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "초콜릿 칩 쿠키 레시피",
  "image": ["https://example.com/cookie.jpg"],
  "datePublished": "2026-05-19",
  "author": [{
    "@type": "Person",
    "name": "홍길동"
  }]
}
</script>
```

### 주요 schema 타입
- `Article`, `BlogPosting`, `NewsArticle`
- `Product`, `Offer`, `Review`, `AggregateRating`
- `Recipe`, `Event`, `FAQPage`, `HowTo`
- `Organization`, `LocalBusiness`, `WebSite`
- `BreadcrumbList`, `VideoObject`, `ImageObject`

---

## E-E-A-T (경험, 전문성, 권위성, 신뢰성)
> 직접적인 순위 요소는 아니나, 콘텐츠 평가의 개념적 프레임워크
- **Experience** — 실제 경험 기반
- **Expertise** — 전문 지식
- **Authoritativeness** — 권위 있는 출처
- **Trustworthiness** — 신뢰할 수 있는 정보 (가장 중요)

---

## 바이브코딩 체크리스트
- [ ] 모든 페이지에 고유한 `<title>`
- [ ] 모든 페이지에 고유한 `meta description`
- [ ] Open Graph (`og:title`, `og:description`, `og:image`) 설정
- [ ] Twitter Card 메타 태그 설정
- [ ] 적절한 JSON-LD 구조화 데이터 삽입
- [ ] `BreadcrumbList` schema로 탐색경로 마크업
- [ ] Rich Results Test로 검증 (https://search.google.com/test/rich-results)
