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

---

# Phase 5+ 보류 항목 (인프라 무거움)

## H. WebSocket — 한투 OpenAPI 실시간 호가·체결 push

### 제약·복잡성
1. **Cloudflare Workers WebSocket 제약**
   - Worker 안에서 outbound WebSocket 연결 → Durable Objects 필요 (state 유지)
   - Durable Objects 무료 한도 일 1M request — 충분하지만 설정 복잡
   - 또는 클라이언트가 직접 한투 WebSocket 연결 → 키 노출 위험 → 비추천
2. **인증 — approval_key 발급**
   - WebSocket 전용 approval_key (HTS 등록 + 일 5회 발급 한도)
   - 매일 발급해 KV 에 저장 → cron 보장
3. **메시지 처리량**
   - 종목당 분당 수십~수백 tick → Worker CPU 한도 (50ms) 초과 위험
   - 대량 메시지 → Cloudflare 워크 비용·한도

### 권장 경로 (실제 사용 시)
1. **별도 Worker (`etf-ws-relay`)** — Durable Object 기반
2. 한투 WebSocket 1개 연결 (서버 측) + 클라이언트는 본 Worker WebSocket 연결
3. KV `kis:ws_approval_key` 매일 갱신 (별도 cron)
4. 클라이언트 측 컴포넌트 — `LiveQuoteCard` 를 WebSocket 버전으로 옵션 분기

### 작업 시간: **2~3주** (Durable Objects 학습·인증 처리·메시지 라우팅·실패 복구)

### 비용
- Cloudflare Workers WebSocket: 일 1M 메시지까지 무료, 초과 시 $0.65/M
- Durable Objects: 일 1M req + 100k 분 저장 무료
- 예상: 사용자 100명 동시 X 분당 10 tick × 6.5시간 = ~390k tick/일 → 무료 한도 안

### 결론
**현재 폴링(30s) 으로 충분 — 사용자 트래픽 10,000명+ 도달 후 도입 고려.**

---

## E2. OG 동적 분봉 차트

### 작동
- `/api/og?code=069500&chart=true` — SVG path 로 작은 분봉 차트 그림
- 검색결과·SNS 미리보기 시 시각 임팩트
- Naver 이미지 검색 인입

### 제약
1. **OG 이미지는 캐시가 강함** — Twitter·Facebook·Naver 가 캐시. 30분~24h 갱신 X
2. → 분봉 차트는 거의 stale (1시간 전 데이터)
3. **fetch 비용** — OG 호출 시마다 한투 분봉 API 호출 → 호출량 폭증 위험

### 권장
1. **장중 자동 매시간 OG 재생성** — Cloudflare Cache Purge 통합 어려움
2. **정적 OG (현재 방식) 유지** — 종목명·등락만 표시
3. **차트는 클라이언트 페이지에만** — `IntradayChart.tsx` 이미 구현

### 작업 시간: **3일** + Cache Purge 자동화 (별도)

### 결론
**SNS 미리보기는 정적 OG 로 충분. 차트는 페이지 안에서만 노출. 진행 가치 약함.**

---

## A3. 외국인 누적 순매수 시그널 — 인프라 완료, 시그널 알고리즘 보충 필요

### 적용된 인프라 (2026-05-12)
- `src/lib/kis.ts` `fetchKisInvestorTrend` — 한투 inquire-investor endpoint
- `scripts/accumulate-foreign-flow.mjs` — data/foreign-flow/{code}.json 60일 누적
- daily-pulse cron 통합 — 매일 자동 갱신

### 남은 작업
1. **Cross-over 감지 알고리즘** — 5일/20일 누적 변화 → 추세 전환 시점
2. **/strategy/foreign-flow 페이지** — 누적 차트 + 시그널 카드
3. **메인페이지 카드 통합** — "외국인 자금 흐름 전환" 알림

### 작업 시간: **3일**

### 권장
**데이터 축적 21일 이후 시그널 알고리즘 정밀화 + 페이지 신설.**
