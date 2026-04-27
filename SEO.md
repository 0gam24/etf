# SEO 규칙 — Daily ETF Pulse

이 문서는 **구글 검색 노출**을 위한 사이트 전체 SEO 규칙을 정의합니다. 모든 신규 페이지·컴포넌트·콘텐츠 작성 시 이 규칙을 강제 준수하며, **HarnessDeployer(agent #8)가 deploy 직전에 자동 검증**합니다.

규칙 위반 발견 시: ❶ 동일 commit에서 함께 수정 ❷ HarnessDeployer 검증 통과 ❸ commit·push.

---

## 1. URL Slug — 영문 ASCII만

- **모든 슬러그는 영문 소문자 + 하이픈** (kebab-case). 한글·특수문자(`·`·`%`·공백) 금지.
- 한국어 키워드는 `agents/2_seo_architect.js`의 `KOREAN_SLUG_MAP`에서 영문 매핑.
  - 예: `방산top10 → defense-top10`, `조선top3 → shipbuilding-top3`, `커버드콜·월배당 → covered-call-income`
- 새 한국어 키워드 등장 시 **MAP에 먼저 추가** → 슬러그 생성. MAP 누락은 SeoArchitect 출력 차단.
- 슬러그 길이: 최대 **80자**.
- 슬러그 변경 시 [next.config.ts](next.config.ts) `redirects()`에 **301 영구 리다이렉트** 등록 (검색 가치 보존).

## 2. Meta — title / description / keywords

| 필드 | 규칙 | 예시 |
|---|---|---|
| `title` | **60자 이내**, 핵심 키워드 앞쪽 배치, 사이트명은 ` — Daily ETF Pulse` 접미사 | `KODEX 방산TOP10 — 현재가·구성종목·분배금` |
| `description` | **120~155자**, 자연 문장, 핵심 키워드 1~2회 자연 노출 | `KODEX 방산TOP10(449450) ETF의 오늘 시세, 구성종목 TOP 10, 분배 정보를 한 페이지에…` |
| `keywords` | **3~7개**, 가장 구체적인 롱테일 우선 | `["KODEX 방산TOP10", "방산 ETF", "449450 ETF", "방산주 ETF 추천"]` |

- 모든 페이지에 `alternates.canonical` 설정 (절대 또는 절대화 가능 경로).
- OG·Twitter 메타에 동일 title·description + `/api/og` 동적 이미지 사용.

## 3. 헤딩 키워드 강제 (H1·H2)

- **H1은 페이지당 1개만**, 페이지의 핵심 검색 키워드를 자연 어절로 포함.
- H2는 보조 키워드를 자연 노출 (본문 흐름 구분 + 검색 의도 매칭).
- 카테고리별 H1 키워드 패턴:

| 페이지 | H1 필수 키워드 |
|---|---|
| `/` (홈) | "ETF" + 행동 동사 (오늘의 ETF / 오르는 ETF / 분배금 ETF 등) |
| `/pulse` | "오늘의 관전포인트" + ETF |
| `/surge` | "{ETF명}" (post 제목 그대로) — 종목명이 H1 |
| `/flow` | "ETF 섹터 자금 흐름" |
| `/income` | "월배당 ETF" + "커버드콜 ETF" 동시 노출 |
| `/breaking` | "오늘의 ETF 속보" + "거래량 TOP" |
| `/guide/{slug}` | 가이드 정식 제목 (월배당 ETF 완전 가이드 등) |
| `/etf/{ticker}` | "{ETF 정식명}" (예: `KODEX 방산TOP10`) |

## 4. JSON-LD 스키마 (페이지 유형별 의무)

빌더는 [src/lib/schema.ts](src/lib/schema.ts)의 함수만 사용. 직접 JSON 작성 금지.

| 페이지 유형 | 필수 스키마 |
|---|---|
| 모든 페이지 | `BreadcrumbList` |
| 글 (pulse/surge/flow/income/breaking) | `Article` 또는 `NewsArticle` (속보) + `Person` (저자) |
| 가이드 일반 | `Article` |
| 가이드 단계형 (`howTo: true`) | `Article` + **`HowTo`** (단계 자동 매핑) |
| `/etf/{ticker}` | **`FinancialProduct` + `Dataset`** + `BreadcrumbList` |
| `/author/{id}` | `Person` |
| FAQ 섹션 포함 | `FAQPage` |

- `</script>` 인젝션 회피: `jsonLd(obj)` 헬퍼만 사용 (자동 escape).
- `inLanguage: 'ko-KR'` 명시.
- 작성자(`author.url`)는 `/author/{authorId}` 절대 경로.

## 5. Sitemap — lastmod 정확성

[src/app/sitemap.ts](src/app/sitemap.ts) 규칙:

- **`lastmod`는 콘텐츠 실제 갱신일에서 derive**. sitemap 재생성 시각(`new Date()`) 사용 금지 (Google이 부정확한 lastmod는 무시).
- 홈 = `getSiteLastModified()`, 카테고리 = `getCategoryLastModified(cat)`, 저자 = `getAuthorLastModified(id)`, 자료실 = `products.json.reviewedAt`, /etf/* = `etfData.baseDate` (YYYYMMDD → ISO 정규화).
- changeFrequency·priority:
  - 홈 1.0 daily / 카테고리 0.9 daily / 글 7일 이내 0.9 weekly · 이후 0.7 weekly / `/etf/*` 0.8 daily / `/guide/*` 0.85 weekly / 저자 0.6 weekly.
- `/etf/{ticker}`는 **shortcode + issueCode 모두 등록** (Set 중복 제거). canonical은 페이지 metadata가 처리.
- 보조 sitemap: `/sitemap-images.xml`, `/sitemap-news.xml`, `/sitemap-index.xml` 별도 라우트 유지.

## 6. 내부 링크 — 키워드 자동 가이드 링크

[agents/4b_internal_linker.js](agents/4b_internal_linker.js) 규칙:

- 본문에서 핵심 키워드 **첫 등장 1회**를 `[키워드](/guide/{slug})` 자동 링크.
- 매핑: `KEYWORD_GUIDE_MAP` (월배당 ETF→monthly-dividend, 커버드콜 ETF→covered-call, 방산 ETF→defense-etf, AI ETF·반도체 ETF→ai-semi-etf, IRP·ISA·연금저축→retirement).
- 회피: 코드블록(```), 헤딩(`#~######`) 라인, 기존 링크 안.
- 본문 중간 h2 경계에 관련 글 1~2개 (티커·섹터·카테고리 우선순위).
- 키워드당·가이드당 1회 제한 (스팸 방지).

## 7. 이미지 SEO

- 모든 `<img>`·`<Image>`에 `alt` 의무 (시청자 가치 표현 — "차트 1" 같은 빈 alt 금지).
- /sitemap-images.xml에 OG 이미지·차트 이미지 등록.
- OG 이미지: 1200×630, `/api/og?title=…&category=…&tickers=…` 동적 생성.

## 8. /etf/{ticker} 종목 사전

[src/app/etf/[ticker]/page.tsx](src/app/etf/[ticker]/page.tsx) 규칙:

- `generateStaticParams`: 거래량 상위 100 issueCode + `PORTFOLIOS`의 모든 shortcode (둘 다 prerender).
- 라우팅: shortcode(449450) ↔ issueCode(0080G0) 양방향. `findEtfByAnyCode` + `resolveEtfTicker` 사용.
- canonical URL: shortcode가 있으면 shortcode 우선 (사용자 친숙).
- 필수 섹션: hero(H1=ETF명) → 시세 stats → 구성종목 TOP 10 → 분배 정보(income ETF만) → 관련 분석 글 → RecommendBox.
- 필수 스키마: BreadcrumbList + FinancialProduct + Dataset.

## 9. Affiliate 면책 (SEO+공정위 동시)

자세한 규칙은 [CLAUDE.md](CLAUDE.md)의 "Affiliate 경제적 이해관계 표시" 참고.

- affiliate 링크 노출 페이지 **상단**에 `<AffiliateNotice variant="top" />` 자동 삽입.
- 카드별 [광고] 라벨은 의무 X (페이지 면책으로 충분).
- 카드 링크에 `rel="sponsored nofollow noopener noreferrer"` + `target="_blank"` 의무.

## 10. AI 작성 투명 공개 (E-E-A-T 의무)

**정책 갱신 (2026-04-26)**: Google 정책상 AI 콘텐츠 자체는 허용되지만 "사용자를 속이는 행위(실존 인물 사칭)"는 검색 노출 영구 제외 사유. 따라서 본 사이트는 **AI 작성을 투명하게 공개**하는 정책을 채택합니다.

### 의무 사항
- **모든 AI 작성 글 하단**에 `<AiAgentDisclosure variant="inline" />` 컴포넌트 노출 의무. AI 작성 사실·실존 인물 아님·발행 책임자(편집팀) 명시.
- **글 바이라인 옆**에 `<AiAgentDisclosure variant="compact" />` 작은 배지로 추가 노출.
- **/author/{id}** 페이지에 AI 모델 정보 카드 (modelDescription·dataSources·methodology·publisher) 의무 노출.
- **/about** 페이지에 7개 에이전트 설명 + Organization 스키마 + 발행 원칙 명시.
- **schema.org/Person** 작성자에 `additionalType: SoftwareApplication` 추가 (AI 모델 신호).

### 여전히 금지 (작업 메타 자랑)
- `13개 에이전트`, `매일 4편 발행`, `3,000자` 같은 **작업량 자랑** 표현
- `Gemini`, `GPT`, `Claude`, `LLM` 등 **사용 모델명** 노출 (브랜드 신뢰 저하)
- `크롤링`, `스크래핑`, `파이프라인` 등 **기술 스택 디테일**
- `샘플 데이터`, `placeholder`, `fallback`, `mock` 등 **불안 유발 디버깅 단어**

### 허용 (시청자 가치 관점에서)
- `AI 분석 에이전트` (모델 페르소나)
- `AI 분석 모델 K`, `AI 에이전트 P` (구체적 에이전트 식별자)
- `데이터 기반 AI 분석`, `자동 분석` (데이터·과정 투명성)
- 출처 명시: `KRX 공공데이터`, `한국은행 ECOS`, `운용사 공시`

자세한 운영자 메타 vs 시청자 가치 표현 가이드는 [CLAUDE.md](CLAUDE.md)의 "UX 카피" 참고.

## 11. HarnessDeployer 자동 검증 (push 전 차단)

[agents/8_harness_deployer.js](agents/8_harness_deployer.js)가 MDX 저장 직전에 다음을 검증:

| 검증 항목 | 실패 시 동작 |
|---|---|
| `slug`이 `/^[a-z0-9-]{1,80}$/` 매칭 | **차단** (KOREAN_SLUG_MAP 누락 추정) |
| `title.length` ≤ 60 | warning + 60자로 truncate |
| `description.length` 120~155 | warning |
| `keywords.length` 3~7 | warning |
| `tickers` 배열 비어 있지 않음 (글이 종목 분석인 경우) | warning |
| 본문 H1 1개 (선택 — pages는 별도) | warning |
| 운영자 메타 단어("AI", "자동 발행", "크롤링" 등) 본문 출현 | warning |

검증 결과는 `pipeline/logger`로 출력 + Linear/Slack 알림 (옵션).

## 12. 검증 도구

- 빌드 시 `npm run cf:build`가 sitemap 생성 → 빌드 실패 시 즉시 차단.
- production push 후 **5~7분 대기** → 핵심 페이지 1~3개 curl 응답 코드 검증 (CLAUDE.md "로컬 ↔ 프로덕션 정보 100% 일치" 참고).
- **분기별 Lighthouse SEO audit**: `npm run audit:seo` (의존성: `npm i -D lighthouse chrome-launcher`).
  - 13개 핵심 페이지 (홈·카테고리·가이드·종목 사전·about·author) 일괄 SEO 점수 측정.
  - 95+ 유지 목표. 95점 미만 페이지는 위반 audits 출력 + exit code 2.
  - 결과는 `scripts/.audit-seo-report.json`에 저장 (gitignore 권장).

### 분기 audit 체크리스트
- [ ] `npm run audit:seo` 실행, 모든 페이지 95+ 확인
- [ ] sitemap.xml 응답 200, 1095+ ETF + /about + /etf 인덱스 포함
- [ ] robots.txt 200, sitemap 참조 정확
- [ ] OG 이미지 응답 200 (`/api/og?...`)
- [ ] 신규 한국어 슬러그 0건 (HarnessDeployer 차단 로그 확인)
- [ ] schema.org 검증: https://search.google.com/test/rich-results 으로 Article·FinancialProduct·Person·HowTo 샘플 5개 통과
- [ ] Search Console "Coverage" 보고 색인 비율 80%+ 유지

### Search Console 등록 절차 (최초 1회)
1. https://search.google.com/search-console 접속 → "도메인" 속성 추가 → `iknowhowinfo.com`
2. 소유권 확인: DNS TXT 레코드 등록 (Cloudflare DNS 대시보드)
3. Sitemap 제출: `https://iknowhowinfo.com/sitemap.xml` (`https://iknowhowinfo.com/sitemap-index.xml`도 같이 제출 권장)
4. URL 검사 도구로 핵심 페이지 5개 색인 요청:
   - `/` · `/etf/0080g0` · `/about` · `/guide/monthly-dividend` · 최근 발행 글 1개
5. 2주 후 "성능" 보고에서 색인 진행률 확인 (URL 노출 vs 클릭 비율 추적).

---

## 13. /etf/{slug} 종목 사전 페이지 — 영구 구조 (1095+ 페이지 일괄 적용)

**정책 (2026-04-27 신설)**: 1095종 ETF 모든 페이지는 단일 template ([src/app/etf/[ticker]/page.tsx](src/app/etf/[ticker]/page.tsx))에서 렌더링되므로, 아래 구조를 **template 단계에서 영구 보장**한다. KRX에 신규 ETF가 등록되면 (`npm run fetch:etf-codes && npm run generate:etf-slugs`) **자동으로 동일 구조 적용**.

### 13-1. URL 슬러그
- 형식: `/etf/{name-slug}` (예: `/etf/kodex-defense-top10`)
- 매핑: [data/etf-slug-map.json](data/etf-slug-map.json) — **불변 source of truth**
- 충돌 시: 코드 suffix (`/etf/kodex-200-069500`)
- 코드 URL(`/etf/0080g0`)은 next.config.ts의 영구 301 redirect로 슬러그 URL로 자동 이동

### 13-2. Title Tag (60자 이내)
```
{name} ({code}) ETF | 구성종목·분배금·주가 실시간 갱신
```
이유: "ETF" 키워드 = "{ETF명} ETF" 검색 직접 매칭. "실시간 갱신" = freshness 신호.

### 13-3. Meta Description
- 시세 있는 종목: `현재가 ${price}원, 전일대비 ±${rate}%. 주요 구성: ${holding1}, ${holding2} 등 TOP 10. 분배금·분배락일·투자 포인트·관련 분석을 한 페이지에.`
- 시세 없는 종목 (minimal): `KRX 상장 종목. 주요 구성: ... 등 TOP 10. 운용사·섹터·구성종목·관련 분석을 정리한 종목 사전.`

이유: 구성종목 이름 = 롱테일 검색 ("라인메탈 ETF") 매칭.

### 13-4. H1 패턴
```
{name} (Ticker: {code}) 분석 리포트
```
이유: 코드도 H1에 포함 = 코드 검색 사용자 확보. "분석 리포트" = 검색 의도 매칭.

### 13-5. H2 번호 + 키워드 강제 (모든 ETF 동일 구조)
```
1. 실시간 시세 및 수익률 ({YYYY-MM-DD} 기준)   — 시세 있을 때
1. {name} 종목 정보                          — 시세 없을 때 (minimal)
2. 주요 구성 종목 (Top 10)                   — holdings 있을 때
3. 분배금·분배락일 정보                       — income ETF만
4. {sector} 투자 포인트                       — 섹터별 정형 템플릿
5. {sector} 다른 ETF                         — 같은 섹터 카드 그리드
6. {issuer} 다른 ETF                         — 같은 운용사 카드 그리드
7. {name} 관련 분석 ({n}편)                  — 매칭되는 글 있을 때
```

### 13-6. JSON-LD 스키마 (3종 의무)
- **BreadcrumbList**: 홈 > 종목 사전 > {name} ({code})
- **FinancialProduct**: `name`, `identifier: code`, **`tickerSymbol: code` (의무)**, `description`, `url`, `category: 'ETF'`
- **Dataset**: 데이터 갱신일·출처 (`한국거래소(KRX) 공공데이터 포털`)

### 13-7. 시각 구성 (UX·SEO 동시)
- **Hero eyebrow 영역**: 코드 pill (파랑) + 섹터 pill (골드) + 시세 있을 때 freshness pill (`📅 YYYY-MM-DD 갱신`, 초록)
- **시세 stats**: 6 카드 그리드 (현재가/전일대비/거래량/거래대금/시가-고가-저가/시가총액). 등락 색상 = 빨강(상승)/파랑(하락)
- **구성종목**: HoldingsPanel detail variant. 이름·코드·비중 표
- **투자 포인트**: 섹터 한 줄 요약 + 3~5개 카드 (모멘텀·리스크·핵심 변수)
- **다른 ETF 추천**: 카드 그리드 (코드+운용사+이름+등락률, 6개 limit)
- **운용사 외부 링크**: 페이지 하단 (`rel="noopener noreferrer"` + `target="_blank"`) — E-E-A-T 외부 권위

### 13-8. 데이터 무결성
- 모든 코드 표기는 KRX 공식 단축코드(`srtnCd`) 기준 ([data/krx-etf-codes.json](data/krx-etf-codes.json))
- 슬러그는 영구 불변 (이름 변경되어도 슬러그 유지) — 외부 링크 보존
- 시세 없는 995종은 minimal 모드: KRX 메타(코드·이름·운용사·섹터)만 표시 + "시세 갱신 예정" pill

### 13-9. 미래 보장 (자동화)
- 신규 ETF: GitHub Actions cron `weekly-etf-fetch.yml` 매주 월요일 09:00 KST에 `fetch:etf-codes + generate:etf-slugs` 자동 실행. 신규 ETF 자동 매핑·prerender·sitemap 등록.
- 기존 ETF 이름 변경: 슬러그 불변, 표시 이름만 갱신

### 13-10. 영구 검증
- HarnessDeployer `validateEtfPage()`: 빌드 후 prerender HTML 5종 sample 검증
  - title 패턴 매칭 (`* ETF | *`)
  - H1 코드 병기 (`(Ticker: *)`)
  - schema.org/FinancialProduct + tickerSymbol 존재
  - 필수 H2 섹션 (1~7) 존재 여부
- `npm run audit:seo`에서 /etf/{slug} sample 5개 점검

---

이 문서를 수정할 때는 동일 커밋에서:
1. `agents/8_harness_deployer.js`의 검증 로직도 함께 업데이트
2. `CLAUDE.md` 규칙과 충돌 없는지 확인
3. 신규 규칙은 "왜 이 규칙이 필요한가"를 한 줄로 설명
