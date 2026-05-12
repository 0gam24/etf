# PLAN — 미실행 항목 기획 (Phase 4+)

> 작성: 2026-05-12
> Phase 3 Round 1~3 에서 미실행한 4종 항목의 기획·인프라 요건·예상 작업 기록.

---

## A3. 외국인 누적 순매수 시그널

### 필요한 데이터
- 한투 OpenAPI `inquire-investor` endpoint (외국인·기관 매매동향)
- 별도 API 권한 신청 필요 가능성 — 확인 필요
- KRX 정보데이터시스템 일별 외국인 매매 (수동 다운로드 가능)

### 작동
- 5일/20일 누적 순매수 추적
- 추세 전환 시점 (음전·양전 cross) 시 시그널 emit
- 메인페이지 카드 "외국인 자금 흐름 전환" 노출

### 구현 단계
1. data/foreign-flow/{code}-{YYYY-MM}.json — 일별 외국인 매매 누적
2. 매일 cron 이 갱신
3. cross-over 감지 알고리즘
4. /strategy/foreign-flow 페이지

### 작업 시간: 약 3~5일

---

## C4. 알림 구독 시스템

### 채널 옵션
| 채널 | 비용 | 구현 난이도 | 도달률 |
|---|---|---|---|
| **이메일** (Resend·Postmark) | 무료 한도 100/day | 중 | 50% |
| **Threads DM** | 무료 | 어려움 (DM API 제한) | 90% |
| **카카오 알림톡** | 1건 ~8원 | 중 | 95% |
| **웹 푸시** (Web Push API) | 무료 | 쉬움 | 70% |

### 권장: Web Push API
- 별도 비용 X
- Cloudflare Workers + Service Worker 조합
- 사용자가 브라우저 알림 허용 → 거래량 급증·분배락일 등 push

### 구현 단계
1. `/api/push/subscribe` route — VAPID 키 등록
2. 사용자가 알림 동의 → KV 에 subscription 저장
3. cron 이 시그널 발생 시 모든 subscription 에 push
4. 알림 카테고리: 거래량 급증·변동성 폭증·분배락일·신규 글 발행

### 작업 시간: 약 1주

---

## D3. 속보 자동 발행 (시그널 trigger)

### 현재 상태
- daily-pulse cron 평일 16:00 KST 가 매일 7편 발행 (이미 작동)
- 시그널 trigger 시 별도 글 발행은 미구현

### 작동
- 거래량 급증·변동성 폭증 감지 시 → 즉시 cron 외 글 발행
- pipeline 재사용 (단일 종목 대상)
- "[속보] KODEX 방산TOP10 거래량 3배 폭증 — 14:32 KST" 같은 형태

### 한계
- pipeline 1회 실행 ~15분 (Gemini 본문 생성·검증)
- 너무 짧은 trigger 간격 → 발행 폭증 위험
- 발행 빈도 제한 필요 (1시간에 1건 등)

### 구현 단계
1. `/api/breaking/trigger` route — 시그널 감지 후 호출
2. Throttle: 1 시간 1건 제한 (KV 락)
3. pipeline 단일 종목 모드 (3_logic_specialist 짧은 본문 모드)
4. 발행 후 GitHub Actions workflow_dispatch trigger → content commit

### 작업 시간: 약 1주

---

## E2. OG 이미지 동적 분봉 차트

### 현재 상태
- /api/og 가 정적 카드 이미지 생성 (@vercel/og)
- 1200×630 SVG

### 목표
- 글 페이지·종목 사전 OG 이미지에 작은 분봉 차트 그림
- 검색 결과·SNS 미리보기 시 시각 임팩트↑
- Naver Image Search 인입 채널

### 구현 단계
1. /api/og 에 `chart=true&code=069500` 옵션 추가
2. 한투 분봉 시세 fetch → SVG path 생성
3. 차트 + 종목명·등락 정보 결합 그림
4. 캐시 5분 (장중) / 24h (마감)

### 작업 시간: 약 3일 + Recharts vs 직접 SVG 결정

---

## D2. 글 발행 후 N일 추적 — 강화 계획

### 현재 상태
- `PublishedVsLive.tsx` 가 발행 당시 가격 vs 현재 가격 비교 (단발)

### 강화 방향
- 5일·30일 등 마일스톤 마커 추가
- 발행 직후 vs 1주 후 vs 1개월 후 변동률 표
- OHLC 시계열 확보 후 글 페이지에 작은 차트 표시

### 구현 단계
1. data/ohlc/{code}.json 60일 보관 (이미 작동)
2. PublishedVsLive 컴포넌트에 5d·30d 마커 추가
3. SSR 시 발행일 기준 시계열 slice 전달
4. 별도 mini chart 컴포넌트

### 작업 시간: 약 2일

---

## 우선순위 (사용자 가치 vs 구현 난이도)

| Phase | 항목 | 시기 |
|---|---|---|
| 4 | D2 글 N일 추적 강화 | 2일 (즉시 시작 가능) |
| 4 | C4 Web Push 알림 | 1주 |
| 5 | A3 외국인 시그널 | 3~5일 (한투 API 권한 확인 후) |
| 5 | E2 OG 분봉 차트 | 3일 |
| 6 | D3 속보 자동 발행 | 1주 (시그널·발행 시스템 안정화 후) |

---

## 즉시 시작 가능 (사용자 결정 후)

**D2 글 N일 추적** — 이미 PublishedVsLive 있고 OHLC 60일 데이터 있음. 추가 작업 2일 내 가능.

**C4 Web Push** — Cloudflare Workers + Service Worker 표준 API. 한투 키와 별개. 1주 내 가능.

진행하시려면 알려주세요.
