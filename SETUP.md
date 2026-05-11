# SETUP — 환경변수·API 키 등록 가이드

> 이 문서를 따라 한 번만 키를 채우면 로컬·GitHub Actions·Cloudflare 모두 작동.
> .env.local 의 키 값은 **절대 채팅·문서·commit 에 노출 X** — 변수명만 언급.

---

## 1. 로컬 `.env.local` 채우기 (필수 · 5분)
### 1-1. 새 PC 첫 셋업 — `.env.local` 이 아직 없는 경우
```bash
npm run env:sync:apply
```
→ `.env.example` 을 `.env.local` 로 복사. 그 후 텍스트 에디터로 열어 각 키 값 채우기.

### 1-2. 기존 `.env.local` 이 있는 경우 (덮어쓰기 절대 금지)
```bash
# 1. 누락된 키 확인 (dry-run, 변경 없음)
npm run env:sync
# 2. 누락 키만 .env.local 끝에 빈 값으로 안전하게 append
npm run env:sync:apply
```
→ 기존 키 값은 그대로 유지. `.env.local` 파일 끝에 **"sync-env 자동 추가"** 섹션으로 새 키만 추가됨. 그 빈 값들에 발급받은 값을 채우면 끝.

⚠️ `cp .env.example .env.local` 같은 **단순 복사는 기존 키 값 모두 잃음 — 절대 금지**. 위 `npm run env:sync:apply` 가 안전한 append-only 방식.

### 1-2. 핵심 키 등록 (없으면 파이프라인 mock 모드)
| 키 | 발급처 | 우선순위 |
|---|---|---|
| `GEMINI_API_KEY` | https://aistudio.google.com/app/apikey | 필수 (본문 생성·OCR·뉴스 요약) |
| `DATA_GO_KR_API_KEY` | data.go.kr → "금융위_증권상품시세정보" 활용신청 | 필수 (ETF 시세) |
| `BOK_ECOS_API_KEY` | https://ecos.bok.or.kr/api/ | 필수 (경제지표) |
| `SITE_URL` | `https://iknowhowinfo.com` | 필수 |
| `NAVER_CLIENT_ID/SECRET` | https://developers.naver.com | 선택 (뉴스 커버리지↑) |
| `PULSE_IMAGE_URL` | MARKET PULSE 이미지 직접 URL | 선택 (OCR) |
| `INDEXNOW_KEY` | `openssl rand -hex 16` | 선택 (Bing 색인) |
| `GOOGLE_INDEXING_KEY` | GCP 서비스 계정 JSON | 선택 (Google 색인) |
| `THREADS_USER_ID/ACCESS_TOKEN` | https://developers.facebook.com | 선택 (자동 포스팅) |
| `COUPANG_PARTNERS_ACCESS_KEY/SECRET_KEY` | partners.coupang.com | 선택 (제휴 갱신) |

### 1-3. 한투 OpenAPI 키 (장중 실시간 시세 — 신규)
| 키 | 발급처 | 비고 |
|---|---|---|
| `KIS_APP_KEY` | https://apiportal.koreainvestment.com | "PS" 접두사 36자 |
| `KIS_APP_SECRET` | 동상 | 100자+ |
| `KIS_ACCOUNT_NO` | 한투 계좌 8자리 | 일부 endpoint 용 |
| `KIS_MODE` | `production` / `sandbox` / `mock` | 기본 production |

**발급 절차 (10~15분, 무료)**:
1. 한국투자증권 계좌 (빈 계좌 OK) → 한투 모바일앱 비대면 개설
2. https://apiportal.koreainvestment.com 회원가입 (한투 ID 로그인)
3. "KIS Developers" → "API 신청 / 발급" → 실전·모의 **둘 다** 신청
4. 즉시 발급 — `APP_KEY` + `APP_SECRET` **한 번만 노출** → 즉시 `.env.local` 에 붙여넣기
5. `KIS_MODE=production` 유지 (모의는 시세가 다를 수 있음)

**보안 권장**:
- 빈 계좌 유지 (입금 0원) → 키 유출 시 자산 risk 0
- 매매 권한 신청 X — 시세 조회만 사용
- 키 분실 시: 한투 사이트에서 무효화·재발급 1클릭

### 1-4. 채우기 형식 (따옴표 X · 공백 X)
```bash
# ❌ 잘못된 예
KIS_APP_KEY = "PSxxxx..."

# ✅ 올바른 예
KIS_APP_KEY=PSxxxx...
```

---

## 2. GitHub Actions Secrets 등록 (cron 자동 발행용 · 5분)

cron 이 GitHub runner 에서 실행되므로 동일 키 등록 필수.

1. `https://github.com/0gam24/etf/settings/secrets/actions`
2. "New repository secret" 클릭
3. `.env.local` 의 키 값 그대로 등록 (한 줄씩):

| Name | Value (예) |
|---|---|
| `GEMINI_API_KEY` | (Google AI Studio 발급값) |
| `DATA_GO_KR_API_KEY` | (data.go.kr 발급값) |
| `BOK_ECOS_API_KEY` | (BOK 발급값) |
| `NAVER_CLIENT_ID` | (선택) |
| `NAVER_CLIENT_SECRET` | (선택) |
| `SITE_URL` | `https://iknowhowinfo.com` |
| `PULSE_IMAGE_URL` | (선택) |
| `INDEXNOW_KEY` | (선택) |
| `GOOGLE_INDEXING_KEY` | (선택) |
| `THREADS_USER_ID` | (선택) |
| `THREADS_ACCESS_TOKEN` | (선택) |
| `COUPANG_PARTNERS_ACCESS_KEY` | (선택) |
| `COUPANG_PARTNERS_SECRET_KEY` | (선택) |
| `KIS_APP_KEY` | (한투 발급값) |
| `KIS_APP_SECRET` | (한투 발급값) |
| `KIS_ACCOUNT_NO` | (한투 계좌 8자리) |
| `KIS_MODE` | `production` |

⚠️ workflow 파일 ([.github/workflows/daily-pulse.yml](.github/workflows/daily-pulse.yml)) 의 `env:` 섹션에 KIS_* 키가 명시되지 않으면 cron 에서 사용 안 됨 — 필요 시 추가 작업 안내 가능.

---

## 3. Cloudflare Pages 환경변수 등록 (런타임용 · 5분)

서버사이드 Route Handler (`/api/etf/realtime` 등) 가 한투 API 호출하므로 Cloudflare 에도 등록 필수.

1. Cloudflare Dashboard → Pages → `etf` 프로젝트
2. Settings → Environment variables
3. **Production** 환경에 추가:
   - `SITE_URL` = `https://iknowhowinfo.com` (필수)
   - `KIS_APP_KEY` = (발급값)
   - `KIS_APP_SECRET` = (발급값)
   - `KIS_ACCOUNT_NO` = (계좌 8자리)
   - `KIS_MODE` = `production`
   - `DATA_GO_KR_API_KEY` = (선택 — Route Handler fallback 호출용)
4. "Save" → 다음 빌드부터 자동 적용

---

## 4. 검증

### 4-1. 로컬
```bash
# pipeline 보안 검사
node pipeline/security_guard.js

# 키 로딩 확인
DEBUG_ENV=1 node -e "require('./pipeline/env'); console.log({ kis: !!process.env.KIS_APP_KEY, gemini: !!process.env.GEMINI_API_KEY });"
```
출력: `{ kis: true, gemini: true }` 면 정상.

### 4-2. 한투 API 시세 호출 확인 (키 등록 후)
```bash
curl "https://iknowhowinfo.com/api/etf/realtime?codes=069500,114800" | head -20
```
응답 `source: "kis"` 면 작동. `source: "mock"` 이면 Cloudflare 환경변수 미등록 의심.

### 4-3. GitHub Actions
```bash
gh workflow run daily-pulse.yml
gh run list --workflow=daily-pulse.yml --limit 1
gh run view <run_id> --log | grep -E "KIS_APP_KEY|secrets"
```

---

## 5. 보안 자동 검사 (이미 작동 중)

이 사이트는 매 파이프라인 실행 전 `pipeline/security_guard.js` 가:
1. `.env.local` 이 git 추적되고 있지 않은지 확인
2. 코드/문서에 키가 하드코딩되어 있지 않은지 정규식 검사 (Google·OpenAI·GitHub·**KIS**·Coupang·Naver·Threads 패턴)
3. `.gitignore` 에 보안 패턴 포함 여부 확인
4. root-level `*.md` 도 키 노출 검사

위반 발견 시 파이프라인 즉시 중단 + 경고.

---

## 6. 키 폐기 / 재발급 (사고 시)

키가 외부 노출됐다면 **즉시 폐기 + 재발급**:

| 키 | 폐기 절차 |
|---|---|
| GEMINI_API_KEY | https://aistudio.google.com/app/apikey → 해당 키 삭제 |
| DATA_GO_KR | data.go.kr 마이페이지 → 활용신청 정지 → 재신청 |
| BOK_ECOS | ECOS 마이페이지 → 인증키 삭제 → 재발급 |
| KIS_APP_KEY/SECRET | apiportal.koreainvestment.com → "API 관리" → 무효화 → 재발급 |
| NAVER_CLIENT | developers.naver.com → Application → 삭제 → 재생성 |
| COUPANG | partners.coupang.com → API 키 재생성 |
| THREADS | developers.facebook.com → 앱 → access_token 재발급 |

폐기 후 새 키를 `.env.local` + GitHub Secrets + Cloudflare 환경변수 **3곳 모두** 갱신.

---

## 7. 자주 묻는 질문

**Q. .env.local 한 번 채우면 끝?**
A. 네. 단 GitHub Actions Secrets + Cloudflare 환경변수는 별도 등록. 세 곳 동기화 후 변경 없음.

**Q. 키 없는 상태에서 사이트 작동?**
A. 작동. 한투 미설정 시 mock 모드 (시세는 일별 마감 데이터로 폴백). Gemini 미설정 시 본문 sample 모드. 다만 새 콘텐츠 발행 X.

**Q. 모의투자 키로 시세만 쓸 수 있나?**
A. 가능. 단 `KIS_MODE=sandbox` 설정 시 시세도 모의 데이터 (실 시세 아님). 실 시세는 `production`.

**Q. 분당 호출 한도 초과 시?**
A. `/api/etf/realtime` 가 edge 캐시로 흡수 (장중 30초). 초과 시 한투 응답이 자동 폴백 신호로 source: 'fallback' 반환.

**Q. cron 이 키 없이 돌면?**
A. DataMiner → sample 데이터 → SeoArchitect 0개 전략 → pipeline 0건 발행. logs/pipeline_YYYYMMDD.json 에 isRealData=false 기록.
