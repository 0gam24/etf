# 키워드 리서치 자동화 설정 (따라 하기)

포스팅 주제를 **감이 아니라 실제 검색 데이터**로 고르기 위한 설정입니다.
두 가지를 씁니다: **구글 서치콘솔(GSC)** = 우리 사이트가 이미 검색에 뜨는 키워드, **네이버 검색광고 API** = 한국 검색량.

> 비밀키는 전부 `.env.local`(또는 별도 JSON 파일)에만 둡니다. **절대 commit·채팅 노출 금지** (`.gitignore`로 자동 차단).

---

## A. 구글 서치콘솔(GSC) — 우리가 이미 뜨는 키워드

### A-1. 서비스 계정 만들기 (구글 클라우드, 1회)
1. https://console.cloud.google.com 접속 → 상단에서 프로젝트 새로 만들기(아무 이름).
2. 검색창에 **"Search Console API"** → **사용 설정(Enable)** 클릭.
3. 왼쪽 메뉴 **API 및 서비스 → 사용자 인증 정보 → 사용자 인증 정보 만들기 → 서비스 계정**.
   - 이름 아무거나(예: `gsc-reader`) → 만들고 완료.
4. 만든 서비스 계정 클릭 → **키(KEYS) 탭 → 키 추가 → 새 키 만들기 → JSON** → 파일이 다운로드됨.
5. 그 JSON 파일을 **프로젝트 루트에 `gsc-service-account.json` 이름으로 저장**.
   (`*-service-account.json`은 .gitignore로 자동 차단되어 git에 안 올라갑니다.)
6. JSON 안의 `client_email` 값(…@….iam.gserviceaccount.com)을 복사해 둡니다.

### A-2. 그 계정에 GSC 권한 주기 (1회)
1. https://search.google.com/search-console → 속성 `iknowhowinfo.com` 선택.
2. 왼쪽 아래 **설정 → 사용자 및 권한 → 사용자 추가**.
3. 위에서 복사한 **서비스 계정 이메일**을 붙여넣고 권한 **"제한됨(읽기)"**으로 추가.

### A-3. 환경변수 (.env.local)
```
GSC_SITE_URL=sc-domain:iknowhowinfo.com   # 도메인 속성이면 sc-domain: 그대로. URL 속성이면 https://iknowhowinfo.com/
GSC_SA_JSON=gsc-service-account.json
```

### A-4. 실행
```
npm run keywords:gsc
```
→ "STRIKING DISTANCE(순위 5~20위)" 목록이 뜹니다 = **글만 보강하면 1페이지로 올릴 후보**.
   결과는 `data/keywords/gsc_{날짜}.json`에도 저장됩니다.

---

## B. 네이버 검색광고 API — 한국 월간 검색량

### B-1. API 키 발급 (1회)
1. https://searchad.naver.com 접속 → (네이버 계정으로) 가입/로그인. *광고를 집행하지 않아도 API는 무료로 쓸 수 있습니다.*
2. 오른쪽 위 **도구 → API 사용 관리**(또는 "API 키 관리") 메뉴.
3. **네이버 검색광고 API 라이선스 발급** → 두 값을 받습니다:
   - **액세스라이선스** (= API KEY)
   - **비밀키** (= SECRET)
4. 화면 우상단 **고객 ID(CUSTOMER ID, 숫자)** 를 확인합니다(계정 정보에 표시).

### B-2. 환경변수 (.env.local)
```
NAVER_AD_API_KEY=발급받은_액세스라이선스
NAVER_AD_SECRET=발급받은_비밀키
NAVER_AD_CUSTOMER_ID=고객ID숫자
```

### B-3. 실행
```
npm run keywords:naver -- "ETF" "월배당 ETF" "금 ETF"
```
- 뒤에 씨앗 키워드를 적으면 그것 기준 연관 키워드의 **월간 검색수(PC/모바일)·경쟁정도**가 나옵니다.
- 안 적으면 기본 ETF 씨앗으로 조회.
- 결과는 `data/keywords/naver_{날짜}.json`에 저장.

---

## C. 실제 사용 흐름 (주제 선정)
1. `npm run keywords:gsc` → 우리가 이미 노출되는데 순위 애매한 키워드 확인.
2. 그 키워드(또는 새 후보)를 씨앗으로 `npm run keywords:naver -- "후보1" "후보2"` → 네이버 검색량·경쟁 확인.
3. **검색량 높고 경쟁 낮은 + 우리가 거의 1페이지인** 주제를 골라 가이드 작성.

> Claude(여기)에게 "키워드 데이터로 오늘 주제 골라줘" 하면, 위 스크립트를 실행해 결과를 보고 골라 드립니다.

---

## 보안 체크
- `gsc-service-account.json` → `.gitignore`의 `*-service-account.json`으로 차단됨. (확인: `git status`에 안 보여야 정상)
- 네이버 키 3종 → `.env.local`(gitignore)에만. `.env.example`엔 빈 값만.
- 키 노출 의심 시 즉시 재발급(구글: 서비스계정 키 삭제 후 재생성 / 네이버: 라이선스 재발급).
