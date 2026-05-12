# iknowhowinfo.com 자매 사이트 — STRUCTURE.md

> smartdata HQ 가 본 사이트를 관리하기 위한 구조 문서.
> 본 문서는 본 repo 분석 결과 자동 생성.
>
> 마지막 갱신: 2026-05-07
> 분석 기준 commit: b37276b + (working tree) MainBackrefBox 추가

## 1. 정체성
- 도메인: iknowhowinfo.com
- 사이트 이름: Daily ETF Pulse (브랜드명) / iknowhow (도메인)
- 역할: 자매 (ETF·종목·시장 분석 / 4050 세대 실시간 투자 의사결정 플랫폼)
- 메인: smartdatashop.kr 의 자매
- repo: github.com/0gam24/etf
- package name: `etf-platform` (v0.1.0)
- 발행 책임자: Daily ETF Pulse 편집팀

## 2. 기술 스택
- Next.js 16.2.4 (App Router · React Server Components)
- React 19.2.4 / React-DOM 19.2.4
- TypeScript 5
- Tailwind CSS v4 (`@tailwindcss/postcss`)
- Recharts 3.8.1 — 차트 (Bar / Line / Heatmap / 비교)
- gray-matter 4.0.3 — MDX frontmatter 파싱
- react-markdown 10.1.0 + rehype-autolink-headings / rehype-highlight / rehype-slug / remark-gfm — MDX 렌더
- @vercel/og 0.11.1 — 동적 OG 이미지 (1200×630)
- lucide-react 1.8.0 — 아이콘
- pretendard 1.3.9 — 한글 가변 폰트
- reading-time 1.5.0 — 읽기 시간 계산
- @opennextjs/cloudflare 1.19.4 — Cloudflare Workers/Pages 어댑터
- wrangler 4.85.0 — Cloudflare 배포 CLI

## 3. 라우트 (정적)
- `/` — 홈 (Hero / TickerStrip / 일일 분석 슬라이더 / 시나리오 라우터)
- `/about` — 편집팀 소개 + 7개 AI 에이전트 + Organization 스키마
- `/breaking` — ETF 속보
- `/compare` — ETF 비교 인덱스
- `/etf` — 종목 사전 인덱스 (1099종)
- `/flow` — 자금 흐름 리포트
- `/guide` — 투자 가이드 인덱스
- `/income` — 월배당·커버드콜
- `/newsletter` — 뉴스레터 구독
- `/pulse` — 오늘의 관전포인트
- `/resources` — 자료실 (제휴 도서·계좌 등)
- `/surge` — 급등 테마 분석
- `/error.tsx`, `/not-found.tsx` — 에러·404 페이지

## 4. 라우트 (동적)
- `/[category]` — 카테고리 인덱스 (catch-all)
- `/[category]/[slug]` — 카테고리별 글 페이지 (catch-all)
- `/account/[type]` — 계좌별 가이드 인덱스 (`irp` | `isa` | `pension`)
- `/account/[type]/[slug]` — 계좌별 글
- `/author/[id]` — AI 에이전트 프로필 (7명: pb_kim, mom_park, data_lee, homemaker_jung, biz_cho, dev_song, analyst_han)
- `/compare/[pair]` — 종목 쌍 비교 페이지
- `/etf/[ticker]` — 개별 ETF 종목 사전 (코드 또는 슬러그 — 1099종 prerender)
- `/guide/[slug]` — 투자 가이드 글
- `/stock/[ticker]` — 개별 종목 페이지
- `/theme/[theme]` — 테마 인덱스 (`ai` | `semi` | `shipbuilding` | `defense`)
- `/theme/[theme]/[slug]` — 테마별 딥다이브 글
- `/weekly/[slug]` — 주간 펄스 리포트

## 5. API endpoints
- `/api/etf` — KRX ETF 시세 (data.go.kr 프록시 · 30분 캐시)
- `/api/og` — 동적 OG 이미지 생성 (@vercel/og · 1200×630)
- `/api/search` — 사이트 검색
- `/robots.txt` — 검색봇 정책 (Google / Naver / Bing / GPTBot 등 명시 허용)
- `/rss.xml` — RSS 피드 (CDN 캐시 1h)
- `/sitemap.xml` — 메인 sitemap
- `/sitemap-etf.xml` — 1099종 ETF 페이지 sitemap
- `/sitemap-images.xml` — OG·차트 이미지 sitemap
- `/sitemap-index.xml` — sitemap 인덱스
- `/sitemap-news.xml` — Google News sitemap

## 6. 레이아웃
- `src/app/layout.tsx` — RootLayout
  - Google Analytics 4 (`G-LRB1GBGQDN`)
  - Organization (`NewsMediaOrganization`) + WebSite (`SearchAction`) JSON-LD
  - TickerStrip + Header + main + SiteFooter + ScrollRevealProvider
  - Naver Search Advisor + Bing Webmaster 인증 메타
  - metadataBase: `process.env.SITE_URL` (fallback `https://iknowhowinfo.com`)
  - OG: `/api/og` 동적 이미지 (1200×630)
- `src/app/[category]/page.tsx`, `src/app/etf/[ticker]/page.tsx` 등은 자체 layout 없이 RootLayout 안에서 렌더

## 7. 컴포넌트
### 7.1 핵심 (총 58개)
- `Header` — 사이트 상단 헤더 + 모바일 메뉴
- `SiteFooter` — 푸터 + 면책 + 운영자 정보
- `TickerStrip` — 상단 시세 스트립
- `Breadcrumbs` — 빵부스러기 네비
- `ScrollRevealProvider` — 스크롤 페이드인 wrapper
- `ReadingProgress` — 읽기 진행률 바
- `Toc` — 목차
- `MarkdownRenderer` — react-markdown wrapper (rehype/remark 플러그인 적용)
- `SearchModal` + `EtfIndexSearch` — 검색
- `AuthorSlider` — 7개 AI 에이전트 카드 캐러셀
- `Header`/`HomeHeroV3`/`HomeHookV1`/`HomeSnapshot`/`HomeBreakingStrip`/`HomeDailyAuthor`/`HomeDefenseTop3`/`HomeReturnTrigger`/`HomeScenarioRouter` — 홈 섹션
- `PulseTodayHero`/`PulseDiff`/`PulseWeekTimeline`/`PulseRecurringThemes` — pulse 카테고리
- `SurgeHero`/`SurgeRecentList`/`SurgeRiskLabels`/`SurgeThemeTracker` — surge
- `FlowHero`/`FlowSectorGrid`/`FlowSectorLeaders`/`FlowExtremes`/`FlowRecentList`/`FlowWeeklyTrend` — flow
- `IncomeHero`/`IncomeCalendar`/`IncomeStabilityTable`/`IncomeTaxCompare`/`IncomeMiniCalculator`/`IncomeGoalCalculator` — income (월배당 캘린더 + 세후 비교 + 캐시플로 계산기)
- `HoldingsPanel` — ETF 구성종목 TOP 10 패널
- `PostRelatedEtfs` — 글 관련 ETF 카드
- `RecommendBox`/`NextChapterCta` — 다음 글 추천
- `FaqSection` — FAQPage 스키마 + 본문 FAQ 카드
- `HelpfulFeedback` — 글 끝 도움됐어요 피드백 (GA4 이벤트)
- `ShareRow` — SNS 공유
- `NewsletterSignup` — 뉴스레터 구독 폼
- `DataFooter` — 글 하단 데이터 출처 표기
- `TrustBar` — 신뢰 신호 (출처·시각·면책)
- `GuideDataBlock` — 가이드 데이터 블록
- `CountUpNumber` — 숫자 카운트업 애니
- `AffiliateNotice`/`AffiliateInline`/`ProductRecommendBlock`/`ProductCard` — 제휴 면책 + 카드 (공정위 가이드 준수)
- `AiAgentDisclosure` — AI 작성 투명 공개 배지 (variant: top/inline/compact — E-E-A-T)
- `AdBanner` — 애드센스 배너 (IntersectionObserver lazy hydrate)
- `MainBackrefBox` — smartdatashop network 자매 backref (variant: inline/sidebar/footer · 메인 토큰 #8b1538/#faf7f0 · `getBackrefUrlForCategory()` 헬퍼 export)

### 7.2 차트·viz
- `ChartRenderer` — Recharts 기반 통합 차트 렌더러
  - `bar` | `line` | `table` | `comparison` | `heatmap` | `card` 6개 타입 지원 (frontmatter `charts` 배열 → 자동 매핑)
- `EtfMarketPulse` — 홈 라이브 위젯 (거래량 TOP10 / 상승·하락 TOP5 / 카테고리 자금 흐름 / 시총 TOP3 + AI 한 줄 코멘트)
- `FlowSectorGrid`/`FlowWeeklyTrend` — 섹터 자금 흐름 viz
- `IncomeCalendar` — 월배당 캘린더 (월별 분배 일정)
- `IncomeStabilityTable` — 분배 안정성 테이블
- `HoldingsPanel` — 구성종목 비중 표

## 8. 콘텐츠 list (카테고리별)

### 8.1 ETF 분석 — `/pulse` (오늘의 관전포인트)
- `/pulse/pulse-20260423` — 4월 23일 오늘의 ETF 관전포인트 — `2026-04-22`
- `/pulse/pulse-20260424` — 4월 24일 오늘의 ETF 관전포인트 — `2026-04-23`
- `/pulse/pulse-20260425` — 4월 25일 오늘의 ETF 관전포인트 — `2026-04-24`
- 발행 작성자: AI 에이전트 K (pb_kim)
- 다루는 ETF: 0080G0, 0080Y0, 0005D0

### 8.2 종목 분석 — `/surge` (급등 테마 분석)
- `/surge/0080g0-kodex-defense-top10-surge` — KODEX 방산TOP10 (0080G0) — `2026-04-24`
- `/surge/449450-kodex-defense-top10-surge` — KODEX 방산TOP10 (449450) — `2026-04-24`
- 다루는 종목: 0080G0 / 449450 (동일 ETF의 issueCode/shortcode 양쪽)

### 8.3 시장 시계열 — `/flow` (자금 흐름 리포트)
- `/flow/flow-20260423-shipbuilding` — 조선 섹터 자금 흐름
- `/flow/flow-20260424-shipbuilding` — 조선 섹터 자금 흐름
- `/flow/flow-20260425-shipbuilding` — 조선 섹터에 몰린 898억 원 (+3.09%)
- 다루는 ETF: 0080G0, 0080Y0, 0005D0, 0072R0, 0015B0

### 8.4 전략·인사이트 — `/income` (월배당·커버드콜)
- `/income/income-20260423-0000d0` — 월배당 ETF 조합 — `2026-04-22`
- `/income/income-20260423-448290` — 커버드콜 종목 — `2026-04-22`
- `/income/income-20260424-0000d0` — 월배당 — `2026-04-23`
- `/income/income-20260425-0000d0` — ISA 계좌 필수 월배당 ETF 조합 + 세후 수익률 — `2026-04-24`
- 발행 작성자: AI 에이전트 P (mom_park)

### 8.5 속보 — `/breaking` (ETF 속보)
- `/breaking/breaking-20260424-1-0080g0` — KODEX 방산TOP10 속보
- `/breaking/breaking-20260424-2-0080y0`
- `/breaking/breaking-20260424-3-0005d0`
- `/breaking/breaking-20260425-1-0080g0` — 조정 1.87% 분석
- `/breaking/breaking-20260425-2-0080y0`
- `/breaking/breaking-20260425-3-0005d0`

### 8.6 콘텐츠 카테고리 정의 (코드상)
`src/lib/posts.ts` 의 `ALL_CATEGORIES`:
- 핵심 5종: pulse · surge · flow · income · breaking
- 확장: weekly · stock · theme/{ai,semi,shipbuilding,defense} · account/{irp,isa,pension}
- 가이드: `/guide/{slug}` (lib/guides.ts) — Q2~Q3 확장 예정
- 콘텐츠 폴더 실제: `content/{breaking,flow,income,pulse,surge}/` (5개 디렉토리만 채워져 있음)

총 글 수: **18편** (breaking 6 / flow 3 / income 4 / pulse 3 / surge 2)
- 마지막 발행: 2026-04-25 일자 (frontmatter 기준 4/24 작성)
- 마지막 KRX baseDate: `20260424` (`data/.last-pulse-base-date`)
- 다루는 ETF·종목: 1099 (KRX 전체 등록 ETF · `data/krx-etf-codes.json`)

### 8.7 frontmatter 스키마 (모든 글 공통)
```
title · slug · category · templateType · date(ISO) · pulseDate(YYYYMMDD)
description · keywords[] · tickers[] · author · authorId
charts[] · affiliates[] · adPlacements · schemas[] (인라인 JSON-LD)
```

## 9. 데이터 소스
- 시계열 데이터 출처:
  - **공공데이터포털 data.go.kr** — `getETFPriceInfo` (KRX ETF 시세 · 1500종)
  - **한국은행 ECOS** — 기준금리·환율 등 거시지표
  - **운용사 공식 공시** — 분배 캘린더 (수기 매핑)
  - **Naver News API** — 한국 뉴스 (선택 · 미설정 시 자동 스킵)
  - **Google News RSS** — 글로벌 뉴스
  - **MARKET PULSE 이미지 OCR** — Gemini Vision으로 OCR (`PULSE_IMAGE_URL`)
- 데이터 fetch 방식:
  - **build/cron time fetch** — `agents/1_data_miner.js`가 cron(daily 16:00 KST)에 KRX·ECOS API 호출 → `data/raw/etf_prices_*.json` → 파이프라인 → MDX 발행
  - **runtime API** — `/api/etf` 라우트가 30분 캐시로 KRX 시세 프록시 (홈 위젯용)
  - **빌드 타임 정적 매핑** — `data/etf-slug-map.json` (1099종 코드 → 영문 슬러그)
- 데이터 갱신 빈도:
  - 일간: 평일 KST 16:00 (KRX 마감 후 30분) — daily-pulse cron
  - 주간: 월요일 09:00 KST — KRX 신규 ETF 흡수
  - 격주: 매월 1·15일 09:00 KST — 가이드 lastReviewed 갱신
  - 월간: 매월 1일 09:00 KST — Lighthouse SEO audit
- 데이터 파일 위치:
  - `data/krx-etf-codes.json` — 1099종 코드 마스터 (16,495줄)
  - `data/etf-slug-map.json` — 코드↔영문슬러그 (5,503줄)
  - `data/.last-pulse-base-date` — 직전 발행 KRX 거래일
  - `data/raw/etf_prices_*.json` (gitignore) — DataMiner 중간 산출물
  - `content/{cat}/*.mdx` — 발행된 글
  - `agents/etf_portfolios.js` — 수기 큐레이션 포트폴리오 매핑

## 10. lib 모듈 (`src/lib/`)
- `posts.ts` — MDX 파일 파싱 + 카테고리별 정렬 + readingTime 계산
- `authors.ts` — 7개 AI 에이전트 프로필 + accent 컬러 overlay (`agents/personas.js` import)
- `schema.ts` — Schema.org JSON-LD 빌더 (Article·NewsArticle·Person·Breadcrumb·FAQPage·FinancialProduct·Dataset·HowTo)
- `data.ts` — KRX 시세·시각화 데이터 로드
- `breaking.ts`/`flow.ts`/`income.ts`/`income-server.ts`/`pulse.ts`/`surge.ts` — 카테고리별 헬퍼 (집계·정렬·관련 글)
- `guides.ts` — 가이드 콘텐츠 메타 (lastReviewed 등)
- `category-faq.ts` — 카테고리별 FAQ 풀
- `etf-compare-pairs.ts` — 비교 페어 정의
- `etf-investment-points.ts` — 섹터별 투자 포인트 템플릿
- `hook.ts` — 홈 후크 카피
- `coupang.ts` — 쿠팡 파트너스 Open API 클라이언트 (HMAC 서명)
- `products.ts` — 제휴 상품 데이터 로더 (production/dev 분기)

## 11. GitHub Actions (`.github/workflows/`)
- `daily-pulse.yml` — 평일 KST 16:00 (UTC 07:00 월~금) — 콘텐츠 파이프라인 실행 + content/data/public 자동 commit·push (Cloudflare 자동 재배포)
- `weekly-etf-fetch.yml` — 월요일 KST 09:00 (UTC 일 00:00) — KRX 신규 ETF 자동 흡수 (`fetch:etf-codes` + `generate:etf-slugs`)
- `biweekly-guide-refresh.yml` — 매월 1·15일 KST 09:00 — 가이드 `lastReviewed` 자동 갱신 (Google freshness 신호)
- `monthly-seo-audit.yml` — 매월 1일 KST 09:00 — Lighthouse SEO 점수 + Schema.org 검증 + 95점 미만 또는 schema 위반 시 자동 issue 생성

## 12. scripts (`scripts/`)
- `audit-seo.mjs` — Lighthouse SEO 13개 핵심 페이지 점검
- `fetch-etf-codes.mjs` — data.go.kr → 1099+종 ETF 코드 fetch → `data/krx-etf-codes.json`
- `generate-etf-slugs.mjs` — 코드 → 영문 슬러그 매핑 생성 → `data/etf-slug-map.json`
- `fetch-products.mjs` — 쿠팡 파트너스 Open API → 제휴 상품 (`--dry`/`--merge` 모드)
- `validate-schema.mjs` — schema.org JSON-LD 8종 페이지 검증
- `verify-parity.mjs` — 로컬 ↔ production 응답 일치 검증 (push 후 5~7분 후 실행)
- `migrate-personas-to-ai-agents.mjs` — 페르소나 → AI 에이전트 마이그레이션 (1회성 · 2026-04-26 E-E-A-T 정책)
- `generate-network-mirror.mjs` — smartdata HQ sync용 메타 export → `public/network-mirror.json` (분석 글 18편 + ETF 사전 1099 별도 키 + 7 AI 에이전트 accent · `prebuild` 훅으로 자동 실행)
- `generate-today.mjs` — 매일 발행 일지 → `today.md` (최근 7일 카테고리별 link + 자동 갱신 메커니즘 설명 · `daily-pulse.yml` cron 평일 16:00 KST 자동 실행)

## 13. 빌드·배포 명령 (`package.json` scripts)
- `npm run dev` — Next.js dev 서버
- `npm run prebuild` — `network-mirror.json` 자동 재생성 (build 직전 자동 실행)
- `npm run build` — Next.js 프로덕션 빌드 (prebuild 자동 동반)
- `npm run generate:mirror` — network-mirror.json 단독 재생성
- `npm run start` — 프로덕션 서버 실행
- `npm run lint` — ESLint
- `npm run pulse` — 파이프라인 1회 실행 (`pipeline/orchestrator.js`)
- `npm run pulse:scheduler` — 상주 스케줄러 (KST 08:30 매일)
- `npm run cf:build` — OpenNext Cloudflare 빌드 + 로컬 캐시 채우기
- `npm run cf:preview` — Cloudflare 로컬 preview
- `npm run cf:deploy` — Cloudflare 직접 배포 (Pages는 GitHub 연동으로 자동)
- `npm run verify:parity` / `verify:parity:quick` — production parity 검증
- `npm run fetch:products` / `fetch:products:dry` / `fetch:products:merge`
- `npm run fetch:etf-codes` / `generate:etf-slugs`
- `npm run audit:seo` — Lighthouse SEO audit
- `npm run validate:schema` — JSON-LD 검증

## 14. 환경변수 의존 (키 이름만)
### 데이터 소스
- `DATA_GO_KR_API_KEY` — 공공데이터포털 (필수)
- `BOK_ECOS_API_KEY` — 한국은행 ECOS (필수)
- `NAVER_CLIENT_ID` / `NAVER_CLIENT_SECRET` — 네이버 검색 API (선택)
- `PULSE_IMAGE_URL` — MARKET PULSE 이미지 직접 URL

### AI
- `GEMINI_API_KEY` — Google Gemini 2.5 Flash (본문·OCR·요약 단일 키)
- `GEMINI_MODEL` — 모델 ID 오버라이드 (선택)

### 사이트
- `SITE_URL` — 배포 도메인 (sitemap·rss·indexing 기준)
- `NEXT_PUBLIC_ADSENSE_PUB_ID` — AdSense pub-id (코드 fallback `ca-pub-xxxxxxxxxxxxxx` — production env에서만 실제 값 주입)

### 색인·SNS
- `GOOGLE_INDEXING_KEY` / `GOOGLE_INDEXING_KEY_FILE` — 서비스 계정 JSON
- `INDEXNOW_KEY` — Bing IndexNow 키
- `THREADS_USER_ID` / `THREADS_ACCESS_TOKEN` — Meta Threads 자동 포스팅

### 스케줄러
- `PULSE_SCHEDULE_HOUR` (기본 8) / `PULSE_SCHEDULE_MINUTE` (기본 30)
- `DEBUG_ENV` — 환경변수 로딩 디버그

### 제휴
- `AFFILIATE_URL_MIRAE` / `_KB` / `_TOSS` / `_SAMSUNG` / `_NH` / `_SHINHAN` / `_HANA`
- `AFFILIATE_URL_NH_IRP` / `_MIRAE_ISA` / `_KB_PENSION`
- `AFFILIATE_URL_BOOK_THEME` / `_BOOK_FLOW` / `_BOOK_DIV`
- `COUPANG_PARTNERS_ACCESS_KEY` / `COUPANG_PARTNERS_SECRET_KEY` — 쿠팡 파트너스 Open API

## 15. 의존성 (핵심)
### dependencies
- `next@16.2.4`
- `react@19.2.4` / `react-dom@19.2.4`
- `recharts@^3.8.1` — 차트
- `gray-matter@^4.0.3` — frontmatter
- `react-markdown@^10.1.0`
- `rehype-autolink-headings@^7.1.0` / `rehype-highlight@^7.0.2` / `rehype-slug@^6.0.0` / `remark-gfm@^4.0.1`
- `@vercel/og@^0.11.1` — OG 이미지
- `lucide-react@^1.8.0`
- `pretendard@^1.3.9`
- `reading-time@^1.5.0`

### devDependencies
- `@opennextjs/cloudflare@^1.19.4`
- `@tailwindcss/postcss@^4` / `tailwindcss@^4`
- `eslint@^9` / `eslint-config-next@16.2.4`
- `typescript@^5`
- `wrangler@^4.85.0`

## 16. 배포
- 호스팅: Cloudflare Pages (Workers Static Assets · `@opennextjs/cloudflare` 어댑터)
- 프로젝트 이름: `etf` (`wrangler.jsonc` `name` 필드)
- 도메인: iknowhowinfo.com
- production branch: `main`
- 자동 배포: GitHub push → Cloudflare Pages 자동 빌드·배포 (별도 webhook 미사용)
- compatibility_date: `2025-10-01` / flags: `nodejs_compat`, `global_fetch_strictly_public`
- 캐시 전략: SSG prerender 결과를 Static Assets(`ASSETS` 바인딩)로 서빙 (KV/R2 미사용)

## 17. 페르소나·톤 (분석된 내용)
- 주 타겟: 4050 세대 투자자 (실시간 ETF 의사결정)
- 보조 타겟: ISA·연금저축·IRP 가입자, 월배당·커버드콜 추구 은퇴 준비층
- 톤: 분석적·데이터 중심·신중 (YMYL 가드로 매수 권유 표현 차단)
- 콘텐츠 유형: 오늘의 관전포인트 / 급등 사유 / 섹터 자금 흐름 / 월배당·커버드콜 / 속보 / 종목 사전 / 가이드
- 발행 주체: 7개 AI 분석 에이전트 (E-E-A-T 정책상 실존 인물 사칭 금지 · 모두 `isAi: true` 명시)
  - **K** (pb_kim) — 은퇴 자산 설계 분석 모델 · gold accent
  - **P** (mom_park) — ISA·연금저축 비교 분석 모델 · pink
  - **L** (data_lee) — 퀀트 시그널·거래량 분석 모델 · blue
  - **J** (homemaker_jung) — 월배당 캐시플로 시뮬레이션 모델 · green
  - **C** (biz_cho) — 개인사업자 절세·노란우산·IRP 모델 · amber
  - **S** (dev_song) — (sectorFocus 기반 추정) · violet
  - **H** (analyst_han) — (sectorFocus 기반 추정) · red
- 검수·발행 책임: Daily ETF Pulse 편집팀 (publisher)

## 18. JSON-LD / SEO
- Schema.org 사용: ✓ (`src/lib/schema.ts` 빌더 · 직접 JSON 작성 금지)
- 사용 type:
  - **Article** / **NewsArticle** / **AnalysisNewsArticle** — 글마다 (publisher.parentOrganization + isBasedOn → smartdatashop network 신호)
  - **BreadcrumbList** — 모든 페이지
  - **Person** (`additionalType: SoftwareApplication`) — 저자 (AI 모델 신호)
  - **FAQPage** — FAQ 섹션 포함 페이지
  - **FinancialProduct** + **Dataset** — `/etf/{ticker}` 종목 사전 (1099페이지)
  - **HowTo** — 가이드 단계형 콘텐츠
  - **NewsMediaOrganization** — RootLayout (사이트 전체 publisher · `parentOrganization: 스마트데이터샵 https://smartdatashop.kr`)
  - **WebSite** + **SearchAction** — RootLayout
- canonical: ✓ (모든 페이지 `alternates.canonical` 명시 · `metadataBase` = SITE_URL)
- sitemap: ✓ (`/sitemap.xml` + 4개 보조: etf/images/news/index)
- RSS: ✓ (`/rss.xml` · CDN 캐시 1h)
- 검색엔진 인증: Naver Search Advisor + Bing Webmaster (`naver-site-verification`, `msvalidate.01`)
- 검색봇 정책: Google / GPTBot / ClaudeBot / PerplexityBot 등 AI 검색봇 명시 허용 (2026-04-25)
- 영구 301 리다이렉트: 한글 슬러그 → 영문 슬러그 (legacy 5건) + `/etf/{code}` → `/etf/{slug}` (1099건 자동)

## 19. 광고
- AdSense: ✓ (`src/components/AdBanner.tsx`)
- AdSense client ID: ca-pub-****xxxx (코드 fallback은 placeholder · 실제 값은 `NEXT_PUBLIC_ADSENSE_PUB_ID` env에서만 주입 — repo에 노출 X)
- LCP 최적화: IntersectionObserver lazy hydrate (뷰포트 진입 200px 전 push)
- DEV 모드: `NODE_ENV !== 'production'`에서만 `[DEV] AD AREA` placeholder 노출
- frontmatter 필드 `adPlacements` (글당 0~4개)로 광고 배치 수 제어
- 기타 수익화: 쿠팡 파트너스 + 6개 증권사 제휴 + 도서 제휴 (모두 `AffiliateNotice` 면책 의무)

## 20. 현재 콘텐츠 통계 (분석 시점 2026-05-07)
- ETF 분석 (pulse): 3편
- 종목 분석 (surge): 2편
- 시장 시계열 (flow): 3편
- 전략·인사이트 (income): 4편
- 속보 (breaking): 6편
- **총: 18편**
- 다루는 ETF·종목: **1099종** (KRX 등록 ETF 마스터)
- 마지막 KRX 거래일 발행 baseDate: 20260424
- 마지막 commit: b37276b · 2026-05-07 07:48 KST
- 활성 상태: **운영 중** — daily cron(평일 16:00 KST) 정상 가동
- ⚠️ 콘텐츠 글 수가 18편으로 적은 이유: GitHub Actions cron이 4월 말 일부 일자만 발행 성공 (배포 cache·sample fallback 이슈 — `jun.txt` 사건 기록 참고). 1099종 ETF 사전 페이지는 별개로 prerender됨.

## 21. NETWORK.md 헌법 적용 가능성
- 디자인 토큰 (color/font) 메인과 일치: dual-brand (NETWORK.md v0.6) — 자매 자율 dark theme 유지 + `MainBackrefBox`만 메인 토큰(#8b1538 accent · #faf7f0 wheat) 적용. Pretendard 폰트 공통.
- 4 절대 규칙 (신뢰성·실시간·정확성·출처표기) 준수: ✓ — 모든 글 frontmatter `schemas[]`에 Article·BreadcrumbList·FAQPage 포함, `DataFooter`/`TrustBar`로 출처 표기, `data.go.kr`/`KRX`/`한국은행 ECOS` 명시, YmylGuard로 매수 권유 표현 차단
- 의무 컴포넌트 (TrustBar / SourceList / 메인 backref) 존재: ✓ — `TrustBar`/`DataFooter`/`AffiliateNotice`/`AiAgentDisclosure` + **`MainBackrefBox`** (글·종목사전·푸터 3 위치 노출 · `parentOrganization` JSON-LD 신호 동시 적용)
- 안전 게이트 (smoke / verifier / fact-checker) 존재: ✓ — `agents/7_ymyl_guard.js` (YMYL 가드 · 매수 권유·수익 보장 표현 차단), `agents/8_harness_deployer.js` (SEO 검증 + 슬러그 정규식 + JSON-LD 의무), `pipeline/security_guard.js` (API 키 노출 정적 점검), `scripts/verify-parity.mjs` (로컬↔production 패리티)

## 22. YMYL 위험 노출
ETF·종목·시장 = YMYL (Your Money Your Life) 도메인.
- 1차 출처 명시: ✓ — `KRX 공공데이터`, `한국은행 ECOS`, `운용사 공시`, `data.go.kr` 글마다 명시 (`DataFooter` 컴포넌트)
- 투자 권유 표현 회피: ✓ — `agents/7_ymyl_guard.js`가 BANNED_PHRASES (매수 권유·수익 보장·확정 수익 등)를 정적 차단, 위반 시 LogicSpecialist 롤백 (최대 3회)
- 데이터 갱신 시점 명시: ✓ — 글 frontmatter `pulseDate`, `/etf/{slug}` 페이지에 `📅 YYYY-MM-DD 갱신` 배지, `Article.dateModified`
- 면책 조항 (DYOR): ✓ — 모든 글 하단 `AiAgentDisclosure` + 사이트 푸터에 "정보 제공 목적·투자 책임은 본인에게" 명시
- 추가 안전장치:
  - AI 작성 투명 공개 (E-E-A-T 정책 2026-04-26) — 7개 에이전트 모두 `isAi: true`, 실존 인물 사칭 금지
  - 공정위 가이드 affiliate 면책 — `AffiliateNotice` 페이지 상단 자동 삽입
  - 카테고리별 FAQ — 본인 판단·분할 매수·리스크 허용 강조

## 23. 변경 이력
- 2026-05-07 — 초기 자동 생성 (commit b37276b 기준)
- 2026-05-07 — `MainBackrefBox` 추가: smartdatashop network 자매 backref 컴포넌트 + 글·종목사전·SiteFooter 3 위치 적용 + `buildArticleSchema()`에 `publisher.parentOrganization` + `isBasedOn` + RootLayout `ORG_SCHEMA.parentOrganization` 추가 (NETWORK.md v0.6 dual-brand 준수 · YMYL BANNED_PHRASES 통과 확인)
- 2026-05-07 — Network Index 시스템 합류: `scripts/generate-network-mirror.mjs` 신설 + `prebuild` 훅 등록 → `public/network-mirror.json` 빌드마다 자동 재생성 (분석 18편 + ETF 사전 1099 별도 키 + 7 AI 에이전트 accent · `.gitignore`에 등재 · robots.txt는 기존 정책상 자연 허용)
- 2026-05-12 — Phase 3 Round 2: 분배락일 알림 + 포트폴리오·세후 도구 + 인기 종목 + JSON-LD 가격 + R2 가이드
  - `src/components/ExDividendAlert.tsx` — 분배락일 D-5 이내 ETF 자동 강조 카드. income 페이지 hero 직후 노출. 매수 마지막 타이밍 안내.
  - `src/app/tools/portfolio/page.tsx` + `PortfolioSim.tsx` — 사용자가 ETF 코드·수량·평단가 입력 시 한투 실시간 시세로 손익 자동 계산. localStorage 저장. 장중 30초 polling.
  - `src/app/tools/tax-compare/page.tsx` + `TaxCompareClient.tsx` — 일반/ISA/연금저축/IRP 계좌별 세후 누적 수익 시뮬레이션. 원금·연수익률·분배율·기간 입력.
  - `src/components/TrendingNow.tsx` — 메인페이지 "지금 뜨는 종목 TOP 3" 위젯. 등락률 절댓값 기준 + 30초 polling.
  - `src/lib/schema.ts` `buildFinancialProductSchema` 에 `offers { price, priceCurrency: 'KRW', priceValidUntil }` 옵션 필드 추가. /etf/{ticker} schema 에 가격 동적 주입 → Google 금융 리치 스니펫 가능성.
  - `PLAN-TIMESERIES.md` 신설 — R2 분봉 시계열 축적 아키텍처 + 사용자 1회 작업 + 비용 모니터링 + 백테스트 통합 로드맵.
  - 통합: src/app/page.tsx · src/app/income/page.tsx · src/app/etf/[ticker]/page.tsx
- 2026-05-11 — Phase 3 Round 1: Unger 변동성 돌파 시그널 시스템 + 거래량 급증 알림 + 발행 vs 현재 박스
  - `src/lib/strategies/breakout.ts` — Andrea Unger Volatility Breakout 공식 (5일 ATR · 0.5K 트리거 · 0.6K 손절 · 1.0K 익절 · 20일 SMA 추세 필터 · 0.8% 변동성 필터)
  - `scripts/accumulate-ohlc.mjs` + `scripts/generate-breakout-signal.mjs` — 매일 cron 이 KOSPI200 추적 9 종의 OHLC 일봉을 `data/ohlc/{code}.json` 60일 보관 + 시그널 산출 → `data/signals/breakout-{date}.json` + `breakout-latest.json`
  - `.github/workflows/daily-pulse.yml` 에 `accumulate:ohlc` + `generate:signal` 2 step 추가 (DataMiner 다음)
  - `src/app/strategy/kospi200-breakout/page.tsx` — 4 종목 시그널 카드 (Long/Short 진입가·손절·익절·추세·변동성 표시) + 공식 파라미터 + ⚠️ 면책 조항
  - `src/components/VolumeSurgeAlert.tsx` — 메인페이지 상단 거래량 급증 알림 띠. baseline (전 거래일) 대비 1.5배 초과 + 장중에만 노출. 30초 polling.
  - `src/components/PublishedVsLive.tsx` — 글 페이지에 발행 당시 vs 현재 가격 비교 박스. 진입 시 1회 fetch.
  - 통합: page.tsx (메인) · [category]/[slug] (글) 연결
- 2026-05-11 — Phase 2 본 작업: 실시간 시세 UI 통합 + 운영자 모니터링 대시보드
  - `EtfMarketPulse` (메인 위젯) — 마운트 시 `/api/etf` 호출 후 top10 종목 코드만 `/api/etf/realtime` 로 장중 30초·마감 5분 polling. 가격·등락·거래량만 덮어씀. "장중 실시간 14:32:15 갱신" / "오늘 종가 15:30 마감" 자동 라벨 분기.
  - `LiveQuoteCard` 신설 (`src/components/LiveQuoteCard.tsx`) + `HomeHeroV3` 의 "오늘 거래량 1위" 카드 가격·거래량 부분을 클라이언트 컴포넌트로 분리. SSR initial + 30초 polling 갱신.
  - `LiveEtfStats` 신설 (`src/components/LiveEtfStats.tsx`) + `/etf/{slug}` 종목 사전 1099 페이지 hero stats 아래에 시장 상태 라벨 표시 (polling 없음 — 1099 페이지 × 사용자 수 호출 폭증 회피, 새로고침 기반 갱신 채택).
  - `LiveTickerChip` 신설 (`src/components/LiveTickerChip.tsx`) + 글 페이지 byline ticker 칩에 mini price/등락률 표시. 페이지 진입 시 1회 fetch (polling 없음).
  - `src/lib/kis.ts` 에 `incrementStats(env, outcome)` + `fetchKisDailyStats(env, days)` 추가 — KV `kis:stats:YYYY-MM-DD` key 에 일별 카운터 (total/success/fallback/mock) 저장. 30일 자동 만료.
  - `src/app/api/kis/stats/route.ts` 신설 — `GET /api/kis/stats?days=N` (1~30일) 호출량 통계 JSON 반환 (요약·일별·KV 활성 여부).
  - `src/app/admin/kis-stats/page.tsx` + `StatsClient.tsx` 신설 — 운영자용 대시보드. 14일 일별 표 + 4개 요약 카드 (누적·성공률·폴백률·분당 평균 vs 한도 20). robots noindex.
  - 메인페이지 카피 동적 라벨 — `EtfMarketPulse` 부제 `liveLabel()` 함수 → 시장 상태 따라 "장중 실시간 / 오늘 종가 / 장 시작 전 / 휴장" 자동 분기
- 2026-05-11 — 한투 토큰 1일 1회 발급 위반 영구 방지 (Cloudflare KV 캐시 통합)
  - `src/lib/kis.ts` 리팩토링 — `getAccessToken(env)` KV 1순위·모듈 캐시 2순위 폴백 + `KisEnv`/`isKvTokenCacheAvailable` export
  - `fetchKisQuote/Quotes` 모두 `env` 옵션 인자 받아 KV 공유
  - `src/app/api/etf/realtime/route.ts` — `getCloudflareContext` 로 `env` 추출 → kis 함수에 전달 + 응답에 `tokenCache: 'kv' | 'module'` 명시
  - `wrangler.jsonc` — `KIS_TOKEN_CACHE` KV binding 주석 블록 + 활성화 가이드 (사용자가 namespace 생성 후 ID 입력)
  - SETUP.md §2-B 신설 — KV namespace 생성 절차 + wrangler 갱신 + 검증 방법
  - KV 무료 한도: 24h 안에 1 write + 수백 read → 무료로 영구 사용
- 2026-05-11 — 키 등록·보안 강화 일괄 작업
  - `.env.example` KIS 섹션 명확화 (발급 절차·보안 권장·채우기 형식 가이드)
  - `.gitignore` 추가 패턴 — `.env.local.backup`/`*.key`/`*.crt`/`*.pfx`/Thumbs.db
  - `pipeline/security_guard.js` 강화 — KIS App Key/Secret 정규식·환경변수명 컨텍스트 패턴 7개 추가 + root-level .md 파일도 검사 + content/·scripts/ 스캔 디렉토리 확장
  - `.github/workflows/daily-pulse.yml` env 섹션에 KIS_* 4종 통과 추가
  - **SETUP.md** 신설 — 키 12종 한 페이지 가이드 (`.env.local` + GitHub Secrets + Cloudflare 환경변수 3곳 동기화 · 검증·폐기·재발급 절차)
  - **`scripts/sync-env.mjs`** 신설 + `npm run env:sync` / `env:sync:apply` 등록 — 기존 `.env.local` 에 있는 키 값은 그대로 유지하고 `.env.example` 의 신규 키만 빈 값으로 안전 append (덮어쓰기 회피)
- 2026-05-11 — Phase 4 진행: 한투 OpenAPI 실시간 시세 인프라 스켈레톤
  - `src/lib/kis.ts` 신설 — 한투 API 클라이언트 (access_token 자동 갱신·24h 캐시·rate limit 200ms throttle·KIS 키 없으면 mock 자동 폴백)
  - `src/app/api/etf/realtime/route.ts` 신설 — 다종목 시세 endpoint (`?codes=069500,114800` 최대 15) + edge 캐시 (open 30s·closed 30min·holiday 24h) + data.go.kr 폴백
  - 시장 상태 함수 `getMarketStatus()` — pre_open/open/closed/holiday 분기
  - `.env.example`: `KIS_APP_KEY` `KIS_APP_SECRET` `KIS_ACCOUNT_NO` `KIS_MODE` 4종 등록 + 발급 가이드
  - 메인페이지 `HomeHeroV3` 카피 정직화: KRX baseDate 부제("KRX 5월 8일(금) 종가 기준") + 휴장/과거 데이터 시 헤드라인 "오늘 뜨는 ETF" → "이번 거래일 거래량 TOP" 자동 분기
  - `today.md` staleness 경고 — 3일 이상 stale 시 STALE 배너 자동 삽입
  - `.github/workflows/daily-pulse.yml` Cron Health Alert step 추가 — `data/.last-pulse-base-date` 3일 이상 stale 시 GitHub Issue 자동 생성 (cron-stale label, 중복 방지)
- 2026-05-11 — 인물 페르소나 → 데이터 저널 톤 전면 전환 (사용자 명시 "메인사이트나 다른사이트처럼 운영")
  - 메인페이지: `AuthorSlider`("7명의 실전 투자자가 매일 분석합니다") / `HomeDailyAuthor`("오늘의 칼럼니스트") 제거
  - `TrustBar`: "저자 N명 (前 PB·애널리스트·실전 투자자)" 항목 제거
  - `SiteFooter`: "AI 분석 에이전트" 섹션 → "데이터 출처" (KRX·ECOS·DART·운용사 공시)
  - `/about`: 7개 에이전트 카드 제거 → "분석 방법론" 섹션 (정량 지표 4종)
  - 글 페이지 byline: "AI 에이전트 K" + 페르소나 link → "Daily ETF Pulse 편집팀" 단일 표기
  - `AiAgentDisclosure`: 인물 페르소나 카드 → "자동 분석 공시" (단일 publisher 책임 명시)
  - `/author/{id}`: `robots: { index: false }` + sitemap·sitemap-images 에서 제외 (schema entity 신호만 유지)
  - `agents/personas.js`: 7명 `closingSignature` 모두 "Daily ETF Pulse 편집팀 · 출처:..." 으로 통일 (다음 발행부터 글 끝 표기 일괄 적용)
