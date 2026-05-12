@AGENTS.md
@SEO.md

# 🔒 보안 규칙 (절대 위반 금지)

## 비밀값 노출 금지

다음 값들은 **채팅·코드 예시·로그·문서·커밋 메시지** 어디에도 **원문 출력 금지**:

- API 키 (`*_API_KEY`, `*_CLIENT_SECRET`, `*_ACCESS_TOKEN` 등 모든 키류)
- `.env`·`.env.local`·`.env.*.local` 파일의 등호 뒤 값
- 서비스 계정 JSON (`tribal-*.json`, `*-service-account.json`, `google-*.json` 등)
- 사용자 비밀번호·토큰·인증서·개인키 (`*.pem`, `*.key`)

### 허용되는 것
- **변수명 자체** (예: `GEMINI_API_KEY`)는 자유롭게 사용 가능
- **마스킹 표기** (예: `val_len=20`, `AIza...8A`, `***`)
- **파일 경로 참조** (예: "`.env.local`의 GEMINI_API_KEY 값을 복사하세요")

### 금지 행동
- ❌ Read 결과를 그대로 채팅에 echo
- ❌ 사용자 안내 표에 실제 키 값 채워넣기
- ❌ 커밋 메시지·문서·디버그 출력에 키 노출
- ❌ "확인용"이라며 키 값을 다시 보여주기

## Git에 절대 올리지 않을 것

`.gitignore`에 다음 패턴이 항상 포함되어야 함 (이미 설정됨, 변경 시 검증 필수):

```
.env*.local
*-service-account.json
*credentials*.json
google-*.json
tribal-*.json
*.pem
*.key
data/raw/pulse_images/
```

추가 비밀 패턴 발견 시 즉시 `.gitignore`에 등록.

## 절차

1. **Read로 .env*.local 읽으면 즉시 키 라인은 마스킹 처리**해서만 사용자에게 보고
   - ❌ `GEMINI_API_KEY=AIza...`
   - ✅ `GEMINI_API_KEY: 길이 39자 (SET)`
2. **사용자에게 키 값 전달이 필요하면** "`.env.local`에서 직접 복사하세요" 식 파일 참조만
3. **새 비밀 파일 발견 시** 우선 `.gitignore`에 추가 → 그 다음 작업
4. **실수로 노출했을 때** 즉시 사과 + 영향받는 키 **재발급 권고**

# 🎨 UX 카피 — 시청자 가치 관점만 노출

## 핵심 원칙

**시청자(독자) 화면에 노출되는 모든 텍스트**는 "이 정보가 시청자에게 어떤 가치를 주는가"의 관점으로만 작성. **운영자·개발자가 자랑하고 싶은 작업 메타데이터는 절대 노출 금지**. 모든 페이지·컴포넌트·새 기능 기획에 동일 적용.

## ❌ 절대 노출 금지 단어/패턴

### A. 작업량 자랑
- `3,000자`, `1,800자`, `2,500자+` 등 **글자 수**
- `매일 4편`, `13개 에이전트`, `7인 페르소나` 등 **숫자+카테고리 자랑**
- `자동 발행`, `자동 분석`, `자동 생성`, `자동 작성` (작업 메타) — 약속/신뢰 신호로 쓸 땐 "매일 새 분석", "매일 아침 갱신" 등 가치 표현으로 변환

### B. 기술 스택 노출 — ⚠️ 정책 갱신 (2026-04-26 · Google E-E-A-T 분석 반영)

**기존 정책**: AI 단어 자체 노출 금지 (신뢰성 저하 우려).
**신규 정책**: AI 작성을 **투명 공개**로 전환. Google은 AI 콘텐츠 자체를 금지하지 않으며, 오히려 실존 인물 사칭이 영구 노출 제외 사유. 따라서 7명 페르소나는 "AI 분석 에이전트 K/L/P/J/C/S/H"로 전환되어 정직하게 공개.

**여전히 금지** (브랜드·기술 디테일·디버깅):
- 모델명: `Gemini`, `GPT`, `LLM`, `ChatGPT`, `Claude` (브랜드 신뢰 저하)
- 기술 디테일: `크롤링`, `스크래핑`, `파싱`, `Web Scraping`, `파이프라인`, `워크플로우`, `오케스트레이션`, `봇`, `로봇`
- 디버깅: `샘플 데이터`, `fallback`, `mock`, `placeholder` (시청자 불안 유발)

**새로 허용** (E-E-A-T 투명성):
- `AI 분석 에이전트`, `AI 에이전트 K/L/...`, `AI 분석 모델` — 페르소나 식별자
- `데이터 기반 AI 분석`, `자동 분석` — 과정 투명성
- 모든 글 하단 표준 공시: "본 분석은 데이터 기반 AI 분석 에이전트가 작성했으며, 실존 인물이 아닙니다. 발행·검수 책임: Daily ETF Pulse 편집팀."

### C. 광고/수익화 노골 표현
- `구글 애드센스 광고가 이곳에` (광고 자리 직접 명시)
- `CPC`, `광고 수익`, `광고 단가`, `애드센스` (사용자에게 노출 불필요)

## ✅ 허용 — 시청자 가치 표현

| 부적절 (자랑) | 적절 (시청자 가치) |
|---|---|
| "3,000자 이상으로 발행" | "한 편에 정리" / "출근 전 5분에" |
| "AI가 자동 작성" | "매일 새 분석" / "전직 PB가 매일 정리" |
| "13에이전트 파이프라인" | (언급 안 함, 결과만 보여줌) |
| "뉴스를 크롤링해 분석" | "오늘의 뉴스가 어떤 종목을 움직였나" |
| "AI 인사이트" | "오늘의 시장 코멘트" / "한 줄 요약" |
| "샘플 데이터" | (production에서 숨김 · dev에서만 표시) |
| "매일 오전 9시 자동 발행" | "매일 아침 9시 새 분석" / "매일 아침 갱신" |

## 🟢 허용 — 신뢰/약속 신호

이건 OK (시청자에게 가치 있음):
- 출처 표시: `KRX·한국은행·DART 공공데이터`, `출처: 운용사 공시`
- 시각 약속: `매일 아침 9시`, `오늘 16:00 기준`
- 면책: `정보 제공 목적 · 투자 책임은 본인에게`
- 저자 정보: 실명·경력 (단 "7인 페르소나" 같은 표현 X, "7명의 실전 투자자" OK)
- 데이터 통계: `분석 ETF 100종`, `등록 ETF 10종` (작업량이 아닌 자원 양)

## 적용 절차

### 새 컴포넌트·페이지 작성 시
1. 모든 사용자 가시 텍스트 → 위 ❌ 패턴 자가 검사
2. 발견 시 즉시 ✅ 표현으로 변환
3. 작업 종료 보고에 "UX 카피 검사 완료" 명시

### 기존 코드 수정 시
1. 수정한 파일에 ❌ 패턴 새로 도입 안 했는지 재확인
2. 발견 시 같은 commit에서 함께 정리

### 정기 audit
사용자가 새 페이지·기능 기획 요청 시 → 시작 전 `Grep`으로 ❌ 패턴 전수 검사 → 발견된 기존 leak도 함께 수정 제안

## ⚠️ 환경별 분기

`샘플`, `[DEV]`, `placeholder` 등 개발 디버깅용 표시는 production에선 숨김:
```tsx
{process.env.NODE_ENV !== 'production' && (
  <span>[DEV] 표시</span>
)}
```

# 💼 Affiliate 경제적 이해관계 표시 (쿠팡 파트너스 등) — 공정위 가이드 강제

## 핵심 원칙

쿠팡 파트너스 또는 다른 제휴 마케팅 링크가 노출되는 **모든 페이지**는 공정거래위원회 「추천·보증 등에 관한 표시·광고 심사지침」 + 쿠팡 파트너스 약관에 따라 경제적 이해관계를 **반드시·정확히·잘 보이게** 표시한다.

## ❌ 위반 패턴 (절대 금지)

- 페이지 하단/푸터에만 표시 (스크롤 끝까지 가야 보이는 위치)
- 작은 글씨, 회색·연한 색, 본문보다 작은 폰트
- 이미지 안에 텍스트로 박기 (스크린리더·SEO 인식 불가)
- "더보기" 안에 숨기기, 클릭해야 펼쳐지는 아코디언
- 모호한 표현만: "제휴 링크 포함", "광고", "AD" 단독 (구체성 부족)
- 영어로만 표시

## ✅ 필수 요건

1. **위치**: 본문 첫 부분(첫 단락 위·아래) 또는 affiliate 링크 바로 옆/위. 페이지 진입 즉시 보여야 함
2. **문구** (둘 중 하나, 추가 가능):
   - **쿠팡 파트너스 표준 문구** (Coupang 약관 권장):
     > "이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다."
   - 일반 제휴 표준 문구 (공정위 권장):
     > "본 페이지에는 OO와의 제휴 링크가 포함되어 있으며, 구매 발생 시 일정 수수료를 받을 수 있습니다."
3. **스타일**: 본문 텍스트와 같은 색·크기 (또는 더 진하게/크게). 회색 muted 금지
4. **포맷**: 일반 텍스트(`<p>`/`<div>`)로 렌더, 이미지·SVG 안 금지. 스크린리더 인식 가능
5. **개별 페이지마다**: 사이트 푸터 단독 의존 금지. affiliate 링크 있는 모든 페이지에 페이지별 표시

## ❌ 의무가 아닌 항목 (오해 정정)

6. **카드별 [광고] 라벨**: 의무가 아니라 권장사항.
   - 페이지 첫 부분 면책이 명확하고(요건 1~5) + 링크가 시각적으로 외부 쇼핑 링크임을 인식 가능하면(외부 화살표 아이콘 + 새 탭 + sponsored rel) 카드별 라벨 추가는 의무 X
   - 사용자 명시(2026-04-26): "쿠팡 파트너스 면책에 명시되어 있으면 카드별 [광고] 라벨·CTA의 쿠팡 명시는 중복"
   - 현재 정책: 페이지 면책(`AffiliateNotice`)만 강제, 카드별 라벨 X (신뢰 톤 우선)
   - 카테고리 분류 라벨("도서"·"학습 도구")은 OK (광고 라벨이 아님)

## 컴포넌트 설계 가이드 (구현 시 강제)

- **`AffiliateNotice`** 컴포넌트 — 핵심 의무:
  - prop: `variant: 'top' | 'inline'`
  - 색상: `var(--text-secondary)` 이상의 가시성 (회색 muted 금지)
  - 폰트: 본문 텍스트(0.86~1rem) 이상
  - 박스: 옅은 배경 + 가는 테두리로 시각 분리
  - **페이지마다 자동 삽입 (이게 핵심)**
- **`ProductRecommendBlock`** 등 affiliate 카드:
  - 카드 그룹 위에 `<AffiliateNotice variant="inline" />` 자동 삽입
  - 카드별 [광고] 라벨 노출 X (페이지 면책으로 충분, 신뢰 톤 우선)
  - CTA: "쿠팡에서 보기" 같은 직접 명시보다 "자세히 보기" 같은 자연 어조 권장
  - 카테고리 분류 라벨("도서"·"학습 도구")은 OK
- **페이지 단위**: affiliate 링크 1개 이상 존재 시 **상단에 `<AffiliateNotice variant="top" />` 자동 삽입**

## 검증 체크리스트 (push 전)

- [ ] affiliate 링크 노출 페이지에 페이지별 고지 텍스트 존재
- [ ] 고지 위치: 본문 시작 또는 카드 직상단 (스크롤 없이 보임)
- [ ] 문구에 "쿠팡 파트너스" 또는 제휴사명 + "수수료" 명시
- [ ] 폰트 크기·색상이 본문과 동등 이상
- [ ] 카드 링크에 `rel="sponsored nofollow noopener noreferrer"` + `target="_blank"`
- [ ] dev 서버 시각 확인 + production 반영 후 재확인

## 적용 범위

쿠팡 파트너스 외 향후 도입될 수 있는 모든 affiliate(알라딘 어소시에이트·교보문고·증권사 제휴 등)에 동일 적용.

# 🔁 로컬 ↔ 프로덕션 정보 100% 일치 보장

## 핵심 원칙

로컬에서 작업한 모든 변경(코드·콘텐츠·데이터)이 push 후 **production(`iknowhowinfo.com`)에 100% 동일하게 반영**되어야 한다. 콘텐츠·데이터·페이지 누락 절대 금지.

## Push 전 (로컬에서 사전 검증 의무)

1. `npm run cf:build` — Cloudflare bundle 생성 성공 확인 (실패 시 push 금지)
2. `.open-next/server-functions/default/content/{category}/`에 push 대상 MDX 파일이 모두 들어 있는지 확인
3. `git status content/ data/` — 모든 변경이 staged/committed 인지
4. `git log origin/main..HEAD --stat` — push할 commit이 의도한 파일을 모두 포함하는지

## Push 직후 (production 검증 의무)

push 후 **5~7분 대기 → 검증 실행**:

1. `npm run verify:parity` — 로컬 핵심 슬러그 vs production 응답 자동 비교 (있을 때)
2. 또는 수동 curl:
   ```bash
   curl -s -o /dev/null -w "%{http_code}\n" "https://iknowhowinfo.com/pulse"
   curl -s -o /dev/null -w "%{http_code}\n" "https://iknowhowinfo.com/pulse/pulse-{YYYYMMDD}"
   ```
3. 누락 발견 시 즉시 사용자에게 보고 + 4가지 후보 원인으로 분석:
   - **Cloudflare build cache**: 빌드가 옛 결과 재사용 → 새 코드 변경 commit 또는 대시보드 "Retry build"
   - **gitignore 누락**: `data/raw/` 같은 폴더가 ignore 되어 production에서 fs.readdir 빈 배열
   - **webhook miss**: GitHub→Cloudflare 연결 끊김. 빈 commit 한번 push 또는 수동 redeploy
   - **add 누락**: `git add` 안 한 채 commit. push 전 `git status content/ data/` 강제 확인

## Push 후 보고 형식

push 결과 보고할 때 반드시 포함:
- push된 commit hash 범위 (예: `ef1f79d..cb2f116`)
- Cloudflare 예상 배포 완료 시각 (보통 5분 후)
- "5분 후 다음 URL 확인 권장" — push로 신규/갱신된 핵심 페이지 1~3개 URL 명시
- 사용자가 안 됐다고 알리면 즉시 검증 + 원인 분석

## 사건 기록

- **2026-04-25** — `/pulse` 콘텐츠 4월 23~25일분이 GitHub에는 있었지만 production은 "아직 발행" + 직접 슬러그 404. 원인: Cloudflare가 옛 빌드 살려둠. 해결: 새 commit (`cb2f116`) push로 빌드 강제 트리거.

# 🚫 git push 금지 — 사용자 명시 지시할 때만

## 규칙

**`git push`는 사용자가 명시적으로 지시할 때만 실행한다.** 자동·임의 push 절대 금지.

## push 허용 트리거 — 단 한 단어만

**사용자 명시 (2026-04-26): "명시는 정확하게 푸쉬란 단어로만 할께"**

오직 한국어 `푸쉬` 단어가 메시지에 명시적으로 등장할 때만 push 허용. 다른 모든 표현은 commit까지만.

## ❌ push 트리거가 아닌 단어 (모두 commit까지만)

- "push" (영어) / "올려" / "올려줘" / "배포해" / "deploy" / "라이브 반영해" / "GitHub에 올려"
  → 사용자가 한국어 "푸쉬"만 쓰기로 명시. 영어·다른 한국어 표현 모두 trigger 아님
- "진행" / "계속" / "go" / "ok" / "좋아" / "그래" — 단순 진행 신호
- "커밋" / "commit" — commit까지만 의미
- "수정해" / "고쳐" / "바꿔" — 코드 변경만
- "확인해" / "검증해" / "테스트해" — 검증만
- "다음" / "next" — 다음 단계만

이런 단어는 commit까지만 하고 **반드시 멈춤**. Auto mode가 켜져 있어도 동일 — auto mode는 코드 작업 자율 진행이지 production 배포 자율이 아님.

**위반 사례 (2026-04-26)**:
- 사용자 "진행" 응답에 Claude가 commit + 자동 push 두 차례
- 사용자 지적: "내가 푸쉬말안하면 커밋만하는거아니야?"
- 사용자 정정: trigger 단어 하나(`푸쉬`)로만 좁힘

## 허용되는 행동 (push 없이)

- ✅ 파일 수정 (Edit·Write)
- ✅ 로컬 검증 (`npm run dev`·`npm run cf:build`·`npm run pulse` 등)
- ✅ `git add` (스테이징)
- ✅ `git commit` (작업 단위가 명확하면 로컬에만 저장 — 사용자가 push 지시할 때 같이 올라감)

## 금지 행동

- ❌ `git push` (명시 지시 없이)
- ❌ `git push origin main` 등 모든 push 변형
- ❌ "곧 push해야 하니까 미리 해두자" 같은 자체 판단

## 작업 종료 시 보고 형식

작업 끝나면 사용자에게 다음을 알린다:
- 변경된 파일 목록
- commit 했으면 commit hash 와 메시지
- **"push 대기 중 — 라이브 반영하려면 알려주세요"** 명시

## 예외 — GitHub Actions cron의 자동 push

`.github/workflows/daily-pulse.yml`이 매일 09:00 KST에 자동 push하는 것은 **시스템적으로 사전 승인된 워크플로**라 별개. 이 규칙은 **내(Claude)의 직접 행동**에만 적용됨. cron 워크플로 자체를 disable하거나 변경할 일은 사용자 지시 필요.

# 📝 Q&A 아카이브 의무

## 규칙

사용자가 던지는 **모든 질문**과 그에 대한 **나의 답변**을 매 응답마다 [jun.txt](jun.txt)에 누적 정리한다. 사용자가 명시적으로 시키지 않아도 자동으로 수행.

## 적용 방식

- **언제**: 사용자 질문에 답변할 때마다 (단순 진행 지시 "진행"·"a" 등은 제외, 실제 질문일 때만)
- **무엇을**: 질문 원문 + 답변 핵심 요약 (날짜 · 주제 라벨 포함)
- **포맷**:
  ```
  ## YYYY-MM-DD · [주제 카테고리]
  
  ### Q. (사용자 질문 원문 또는 핵심)
  A. (답변 요지 5~10줄로 간결 정리)
  ```
- **위치**: `etf-platform/jun.txt` 항상 같은 파일에 **append** (덮어쓰지 말 것)
- **언어**: 한국어
- **갱신**: 답변 후 별도 알림 없이 조용히 갱신 (사용자가 언제든 열어볼 수 있도록)

## 예외

- 단순 트리거 신호 ("a", "진행", "ok", "done") → 기록 불필요
- 작업 중간 단계 알림 → 기록 불필요
- **개념 질문 · 방법 문의 · 기획 토론 · 의사결정** → 반드시 기록

# 🗺 sitemap·RSS 자동 갱신 의무 (영구 하네스)

## 규칙

새 페이지·라우트·콘텐츠 자료가 추가될 때 **반드시 sitemap·RSS 3종을 동시 검증·갱신**한다. 누락 시 검색 색인 누락 → SEO 손실.

## 검증 3종 파일

1. **[src/app/sitemap.ts](src/app/sitemap.ts)** — main sitemap
2. **[src/app/sitemap-images.xml/route.ts](src/app/sitemap-images.xml/route.ts)** — image sitemap (Google·Naver 이미지 검색)
3. **[src/app/rss.xml/route.ts](src/app/rss.xml/route.ts)** — RSS 피드 (네이버 웹마스터·다음·구글 News)

## 신규 작업 분류별 처리

| 작업 | sitemap 영향 | 처리 |
|---|---|---|
| 새 카테고리 페이지 (예: `/strategy/{new}`) | sitemap 신규 entry | sitemap.ts 에 push + sitemap-images STATIC_PAGES 등록 |
| 새 동적 라우트 (예: `/for/[persona]`) | dynamic SSR | sitemap.ts 가 single source of truth (`personas-config.ts`) 직접 import → 자동 |
| 새 글 (MDX content/) | sitemap·RSS 자동 (`getAllPosts()` 기반) | 수동 작업 없음 |
| 새 데이터 기반 페이지 (예: `/today/{date}`) | data/ 디렉토리 스캔 | sitemap.ts·rss.xml 이 디렉토리 직접 scan → 자동 |
| 새 도구 페이지 (`/tools/{slug}`) | 정적 entry | sitemap.ts 의 `tools` 배열에 추가 + STATIC_PAGES |

## Single Source of Truth (SSoT) 원칙

- 페르소나 ↔ `src/lib/personas-config.ts` `ALL_PERSONAS`
- 가이드 ↔ `src/lib/guides.ts` `GUIDES`
- 비교 페어 ↔ `src/lib/etf-compare-pairs.ts` `COMPARE_PAIRS`
- ETF 슬러그 ↔ `data/etf-slug-map.json`
- 일별 리포트 ↔ `data/today/*.json` 디렉토리 스캔
- 시그널 ↔ `data/signals/*.json`

sitemap.ts·sitemap-images.xml·rss.xml 은 이 SSoT 직접 import → **추가 항목은 즉시 자동 반영**.

## 검증 체크리스트 (PR · push 전)

- [ ] sitemap.ts 신규 entry 등록되었는가 (또는 SSoT 직접 import 로 자동인가)
- [ ] sitemap-images.xml STATIC_PAGES 에 신규 entry OG 등록되었는가
- [ ] rss.xml 에 신규 콘텐츠 시계열 포함되었는가 (글·일별 리포트 type만)
- [ ] 빌드 후 `/sitemap.xml` 응답에 신규 URL 포함 확인
- [ ] `/sitemap-images.xml` 응답에 신규 페이지 image:image 태그 포함 확인
- [ ] `/rss.xml` 응답에 새 item 포함 확인

## 자동 검증

- `monthly-seo-audit.yml` cron 이 분기마다 schema·sitemap 검증 + Lighthouse 95+ 강제
- 누락 발견 시 GitHub Issue 자동 생성

