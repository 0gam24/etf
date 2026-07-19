# B2 — 디렉토리 구조 & 정보 아키텍처(IA)

> **참조 시점**: 프로젝트 초기 구조 설계 · URL 설계 · 내비게이션 설계

---

## 1. 디렉토리 구조 표준

```
project-root/
├── AGENTS.md
├── PROJECT.md                  # 프로젝트 인터뷰 결과
├── docs/                       # 레퍼런스 문서
├── .github/workflows/          # GHA 워크플로우
│   ├── deploy-hook-cron.yml
│   ├── lighthouse-ci.yml
│   └── ci.yml
├── public/                     # 정적 자산
│   ├── robots.txt
│   ├── llms.txt
│   ├── _headers                # Cloudflare Pages 헤더
│   └── _redirects              # Cloudflare Pages 리다이렉트
├── src/
│   ├── pages/                  # Astro 라우팅
│   ├── components/             # UI 컴포넌트 (Atom~Organism)
│   ├── layouts/                # 페이지 레이아웃
│   ├── content/                # Astro Content Collections
│   ├── styles/                 # 글로벌 스타일, 토큰
│   ├── lib/                    # 유틸리티, API 래퍼
│   └── assets/                 # 빌드 시 처리되는 이미지/폰트
├── tests/
│   ├── unit/
│   └── e2e/
├── astro.config.mjs
├── tsconfig.json
├── package.json
└── pnpm-lock.yaml
```

---

## 2. URL 구조 원칙

### 2-1. 필수 규칙

- ✅ **모두 소문자**, 단어 구분은 **하이픈(-)**, 영문 슬러그
- ✅ **깊이 3단계 이하** 권장: `/category/subcategory/post-slug`
- ✅ **트레일링 슬래시 없음**으로 통일 (`trailingSlash: 'never'`)
- ✅ **자기참조 canonical** 모든 페이지에 부착
- ❌ 쿼리 스트링으로 콘텐츠 구분 금지
- ❌ 날짜 포함 URL 금지 (뉴스 제외)
- ❌ ID 포함 URL 금지 — 슬러그만 사용

### 2-2. URL 패턴 예시

| 페이지 유형 | URL 패턴 |
|---|---|
| 홈 | `/` |
| 일반 페이지 | `/about`, `/contact` |
| 블로그 허브 | `/blog` |
| 블로그 글 | `/blog/article-slug` |
| 카테고리 허브 | `/blog/category-slug` |
| 태그 페이지 | `/tag/tag-slug` |
| 검색 | `/search?q=...` |

### 2-3. 슬러그 규칙

- **6단어 이내** 권장
- 한국어 사이트도 슬러그는 **영문 권장**
- 불용어 제거: "the", "a", "을/를", "이/가" 등
- 키워드 1~2개 자연스럽게 포함

```
❌ /blog/2026/01/15/the-ultimate-guide-to-react-server-components-in-2026
✅ /blog/react-server-components-guide
```

---

## 3. 토픽 클러스터 모델

```
[메인 토픽 = 허브(Pillar) 페이지]
   │
   ├── [서브 토픽 1 = 클러스터 페이지]  ↕ 양방향 내부 링크
   ├── [서브 토픽 2 = 클러스터 페이지]
   └── [서브 토픽 3 = 클러스터 페이지]
```

- **허브 페이지** → 모든 클러스터로 링크
- **클러스터 페이지** → 허브로 다시 링크 + 같은 클러스터 내 다른 글 2~5개로 링크
- **고아 페이지 0개** — 모든 페이지는 최소 한 곳에서 링크
- **클릭 깊이 3 이하** — 홈에서 3회 이내 도달

---

## 4. 내비게이션 설계

### 4-1. 글로벌 메뉴

- **메인 메뉴 항목 5±2개** (Miller's law)
- 드롭다운은 최대 1단계
- 모바일 햄버거 메뉴, 인터랙션 200ms 이내

### 4-2. 푸터

- 사이트맵 요약 (주요 카테고리 링크)
- 운영 정보 (사업자명, 주소, 사업자번호)
- 정책 페이지 링크 (개인정보처리방침, 이용약관)
- 저작권 표기 `© 2026 회사명`
- 소셜 미디어 링크

### 4-3. 빵부스러기(Breadcrumb)

모든 하위 페이지에 노출. `BreadcrumbList` 스키마(JSON-LD) 부착.

```html
<nav aria-label="breadcrumb">
  <ol>
    <li><a href="/">홈</a></li>
    <li><a href="/blog">블로그</a></li>
    <li aria-current="page">현재 글 제목</li>
  </ol>
</nav>
```

---

## 5. 사이트맵 & 라우팅

### 5-1. sitemap.xml (Astro)

```js
// astro.config.mjs
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://example.com',
  trailingSlash: 'never',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/admin/'),
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    }),
  ],
});
```

### 5-2. 정적 라우팅

```
src/pages/
├── index.astro              → /
├── about.astro              → /about
├── blog/
│   ├── index.astro          → /blog
│   └── [slug].astro         → /blog/:slug
└── category/
    └── [slug].astro         → /category/:slug
```

### 5-3. 페이지네이션

- `/blog/page/2`로 정적 페이지 생성 (쿼리 스트링 금지)
- 각 페이지는 자체 canonical

---

## 6. 리다이렉트 정책

### 영구 리다이렉트 (308)

- HTTPS 강제 / www 통일 / 트레일링 슬래시 통일

### Cloudflare Pages `_redirects`

```
# public/_redirects
/old-blog/*   /blog/:splat   308
/old-page     /new-page      308
```

### 마이그레이션 시

1. 기존 URL 인벤토리 추출
2. 1:1 매핑 작성
3. 체인·루프 0건 검증
4. 4xx/5xx 0건 검증

---

## 7. 검증 체크리스트

- [ ] 모든 URL 소문자, 하이픈, 영문 슬러그
- [ ] 트레일링 슬래시 정책 일관 (없음)
- [ ] 클릭 깊이 3 이하
- [ ] 고아 페이지 0개
- [ ] 모든 하위 페이지에 빵부스러기 + 스키마
- [ ] sitemap.xml 자동 생성
- [ ] 글로벌 메뉴 5±2개
- [ ] 깨진 내부 링크 0건
