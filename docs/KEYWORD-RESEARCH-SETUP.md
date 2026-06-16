# 키워드 리서치 자동화 설정 (따라 하기)

포스팅 주제를 **감이 아니라 실제 검색 데이터**로 고르기 위한 설정입니다.
두 가지를 씁니다: **구글 서치콘솔(GSC)** = 우리 사이트가 이미 검색에 뜨는 키워드, **네이버 검색광고 API** = 한국 검색량.

> 비밀키는 전부 `.env.local`(또는 별도 JSON 파일)에만 둡니다. **절대 commit·채팅 노출 금지** (`.gitignore`로 자동 차단).

---

## A. 구글 서치콘솔(GSC) — 우리가 이미 뜨는 키워드

> **권장: A-OAuth 방식** (내 구글 계정으로 로그인). 서비스 계정 이메일이 "사용자 추가"에서
> 인식 안 될 때 이 방식을 쓰면 이메일 추가 단계가 아예 없습니다. (서비스 계정은 맨 아래 "대체"로)

### A-OAuth-1. OAuth 클라이언트 ID 만들기 (구글 클라우드, 1회)
1. https://console.cloud.google.com → 프로젝트 새로 만들기(아무 이름).
2. 검색창에 **"Search Console API"** → **사용 설정(Enable)**.
3. **API 및 서비스 → OAuth 동의 화면** → User Type **외부** 선택 → 앱 이름·이메일만 입력해 저장.
   - "테스트 사용자"에 **본인 구글 이메일(=GSC 주인 계정)**을 추가.
4. **API 및 서비스 → 사용자 인증 정보 → 사용자 인증 정보 만들기 → OAuth 클라이언트 ID**.
   - 애플리케이션 유형: **데스크톱 앱** 선택 → 만들기.
5. 화면에 뜬 **클라이언트 ID**와 **클라이언트 보안 비밀**을 복사.

### A-OAuth-2. 환경변수 (.env.local)
`.env.local`에 아래 3줄. **값만 넣고 설명(#)은 빼세요.**
```
GSC_SITE_URL=sc-domain:iknowhowinfo.com
GSC_OAUTH_CLIENT_ID=복사한_클라이언트_ID
GSC_OAUTH_CLIENT_SECRET=복사한_보안비밀
```
- 서치콘솔 좌상단 속성이 **`iknowhowinfo.com`**(https 없이)로 보이면 = 도메인 속성 → 위 `sc-domain:` 그대로.
- **`https://iknowhowinfo.com/`** 로 보이면 그 값을 `GSC_SITE_URL`에 넣으세요.
- (스크립트가 두 형식을 자동으로 시도하므로 헷갈려도 대개 작동합니다.)

### A-OAuth-3. 1회 로그인 인증
```
npm run keywords:gsc-auth
```
1. 콘솔에 뜨는 **URL을 브라우저에서 열기**.
2. **GSC 주인 구글 계정**으로 로그인 → "허용".
   - "Google에서 확인하지 않은 앱" 경고가 나오면 → 고급 → (앱 이름)으로 이동 → 계속 (내 앱이라 안전).
3. 끝나면 자동으로 `.env.local`에 **GSC_REFRESH_TOKEN**이 저장됩니다. (이메일 추가 불필요!)

### A-OAuth-4. 실행
```
npm run keywords:gsc
```
→ "STRIKING DISTANCE(순위 5~20위)" 목록 = **글만 보강하면 1페이지로 올릴 후보**.
   결과는 `data/keywords/gsc_{날짜}.json`에도 저장됩니다.

---

### (대체) 서비스 계정 방식 — 이메일 추가가 되는 경우에만
1. 구글 클라우드 → 사용자 인증 정보 → **서비스 계정** 생성 → 키(JSON) 다운로드.
2. JSON을 루트에 **`gsc-service-account.json`** 으로 저장(.gitignore 자동 차단).
3. GSC → 설정 → 사용자 및 권한 → **그 서비스 계정 이메일을 "제한됨(읽기)"으로 추가**.
   - ※ 이 단계에서 "이메일 인식 안 됨"이 나면 위 OAuth 방식을 쓰세요.
4. `.env.local`에 `GSC_SA_JSON=gsc-service-account.json` → `npm run keywords:gsc`.

---

## B. 네이버 — 두 갈래 (둘은 다른 API)

네이버는 키 종류가 둘입니다. 헷갈리지 마세요.

| | B-1 데이터랩 트렌드(이미 연결됨) | B-2 검색광고 API(선택) |
|---|---|---|
| 키 | `NAVER_CLIENT_ID/SECRET` (오픈 API, 뉴스수집에 쓰던 것) | `NAVER_AD_*` (검색광고, HMAC) |
| 주는 값 | **상대 인기도(0~100)·추세** | **절대 월간 검색수·경쟁정도** |
| 명령 | `npm run keywords:naver-trend` | `npm run keywords:naver` |

### B-1. 데이터랩 검색어 트렌드 (이미 연결된 키 사용 — 권장)
- developers.naver.com → 내 애플리케이션 → **"사용 API"에 "데이터랩(검색어트렌드)" 추가(체크)**. (뉴스검색만 있으면 401)
- 환경변수는 이미 있는 `NAVER_CLIENT_ID/SECRET` 그대로 사용(추가 입력 없음).
- 실행:
  ```
  npm run keywords:naver-trend -- "월배당 ETF" "금 ETF" "인도 ETF"
  ```
  → 키워드 그룹 간 **상대 인기도와 상승/하락 추세**. 결과 `data/keywords/naver_trend_{날짜}.json`.
- ※ 상대값이라 "절대 몇 회 검색"은 안 나옵니다(그건 B-2).

### B-2. 검색광고 API — 절대 월간 검색량 (선택, 별도 발급)
1. https://searchad.naver.com → 가입/로그인(광고 집행 안 해도 API 무료).
2. **도구 → API 사용 관리** → 라이선스 발급: **액세스라이선스(API KEY)·비밀키(SECRET)**, 우상단 **고객 ID**.
3. `.env.local`:
   ```
   NAVER_AD_API_KEY=발급받은_액세스라이선스
   NAVER_AD_SECRET=발급받은_비밀키
   NAVER_AD_CUSTOMER_ID=고객ID숫자
   ```
4. 실행: `npm run keywords:naver -- "ETF" "월배당 ETF"` → 연관 키워드 **월간 검색수(PC/모바일)·경쟁정도**. 결과 `data/keywords/naver_{날짜}.json`.

---

## C. 실제 사용 흐름 (주제 선정)
1. `npm run keywords:gsc` → 우리가 이미 노출되는데 순위 애매한 키워드 확인.
2. 후보를 `npm run keywords:naver-trend -- "후보1" "후보2"`(상대 인기도·추세) 또는 `npm run keywords:naver -- "후보1"`(절대 검색량)로 검증.
3. **검색량/인기 높고 + 우리가 거의 1페이지인** 주제를 골라 가이드 작성.

> Claude(여기)에게 "키워드 데이터로 오늘 주제 골라줘" 하면, 위 스크립트를 실행해 결과를 보고 골라 드립니다.

---

## 보안 체크
- `gsc-service-account.json` → `.gitignore`의 `*-service-account.json`으로 차단됨. (확인: `git status`에 안 보여야 정상)
- 네이버 키 3종 → `.env.local`(gitignore)에만. `.env.example`엔 빈 값만.
- 키 노출 의심 시 즉시 재발급(구글: 서비스계정 키 삭제 후 재생성 / 네이버: 라이선스 재발급).
