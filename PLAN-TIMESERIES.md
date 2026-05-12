# PLAN — 분단위 시계열 축적 (Cloudflare R2)

> 작성: 2026-05-12
> 목적: KRX 일별 마감 데이터 + 한투 분단위 실시간 시세를 장기 시계열로 R2 에 축적.
> 활용: 백테스트·시그널 정확도·트랙 레코드·시각화·데이터 라이센싱.

---

## 1. 현재 상태 (이미 작동)

- `data/raw/etf_prices_*.json` — KRX 100 ETF 일별 (cron 평일 매일)
- `data/ohlc/{code}.json` — KOSPI200 추적 9 종 OHLC 60일 보관 (이미 구현)
- `data/.last-pulse-base-date` — 마지막 발행 KRX 거래일

→ git 안에 누적 (data 폴더가 gitignore X). 다만 영구 보관용으론 R2 가 더 적합 (binary·압축·검색).

---

## 2. R2 채택 이유

| 항목 | git | R2 | KV | D1 |
|---|---|---|---|---|
| 무료 한도 | 1GB repo | **10GB** + 1M Class A op/월 + 10M Class B | 1GB · 1k write/day | 5GB · 5M read/day |
| 바이너리 적합 | △ | ✅ | X | X |
| 검색·쿼리 | grep | 객체 키 | key get | SQL ✅ |
| 시계열 적합 | △ | ✅ (object per day) | △ (1k/day 한계) | ✅ |

→ **R2** = 시계열 일별 객체 적합. 분단위 데이터는 일별 parquet/JSON 으로 압축.

---

## 3. 키 디자인

```
ohlc/
  daily/
    {code}/{YYYY-MM-DD}.json     # 일봉 (OHLCV + 마감 기준 메타)
  minute/
    {code}/{YYYY-MM-DD}.json     # 분봉 (장중 09:00~15:30 = 391개 항목)
quotes/
  realtime-snapshot/
    {YYYY-MM-DD}/{HH-MM}.json    # 전체 종목 스냅샷 (메인페이지 위젯 캐시 + 백테스트)
signals/
  breakout/
    {code}/{YYYY-MM-DD}.json     # 시그널·결과
```

---

## 4. 사용자 1회 작업 (활성화 시)

1. Cloudflare Dashboard → R2 → Create bucket
   - 이름: `etf-timeseries`
   - 무료 한도 안에서 시작
2. wrangler.jsonc 에 binding 추가:
```jsonc
"r2_buckets": [
  {
    "binding": "ETF_TIMESERIES",
    "bucket_name": "etf-timeseries",
    "preview_bucket_name": "etf-timeseries"
  }
]
```
3. commit + push → Cloudflare 자동 재배포 → R2 binding 활성화

---

## 5. 코드 통합 단계 (Phase 4)

### Step 1 — daily 일봉 R2 저장
```typescript
// pipeline/storage/r2.ts (신설)
export async function saveOhlcDaily(env, code: string, date: string, ohlc: OHLC) {
  const key = `ohlc/daily/${code}/${date}.json`;
  await env.ETF_TIMESERIES.put(key, JSON.stringify(ohlc), {
    httpMetadata: { contentType: 'application/json' },
  });
}
```
cron `accumulate-ohlc.mjs` 가 git 동시 R2 도 저장.

### Step 2 — 분봉 수집 cron
```yaml
# .github/workflows/intraday-snapshot.yml (신설)
on:
  schedule:
    - cron: '*/5 0-7 * * 1-5'  # KST 09:00~16:30 5분 간격
```
한투 API → 추적 종목 시세 → R2 저장.

### Step 3 — 백테스트 엔진
```typescript
// src/lib/strategies/backtest.ts (신설)
export async function backtest(strategy, dateRange, env) {
  // R2 에서 historical OHLC fetch
  // 각 거래일마다 시그널 계산 + 다음날 결과 검증
  // 누적 성과 (CAGR, MDD, Sharpe, Win Rate)
}
```

### Step 4 — 시각화
- `/strategy/kospi200-breakout` 페이지에 백테스트 누적 차트 (Recharts)
- 트랙 레코드 페이지 `/strategy/track-record`

---

## 6. 비용 모니터링

R2 무료 한도:
- Storage: **10GB**
- Class A (write/list/delete): **1M / 월**
- Class B (read): **10M / 월**

예상 사용량:
- daily OHLC: 9 종 × 252 거래일/년 = 2,268 객체/년 × 0.5KB = ~1MB/년 ✅
- 분봉: 9 종 × 252 × 78 분봉/일 = 176,904 객체/년 × 1KB = ~177MB/년 ✅
- 전체 1099 종 분봉으로 확장 시 ~21GB/년 → 유료 ($0.015/GB/월) — 추후 결정

---

## 7. 진행 권장 (단계별)

| Phase | 작업 | 소요 |
|---|---|---|
| 1 (지금) | R2 bucket 생성 + wrangler binding | 10분 (사용자) |
| 2 | `pipeline/storage/r2.ts` + accumulate-ohlc R2 통합 | 1일 |
| 3 | intraday-snapshot.yml cron + 분봉 수집 | 1일 |
| 4 | 백테스트 엔진 + walk-forward | 3일 |
| 5 | 트랙 레코드 페이지 + 시각화 | 2일 |

총 ~1주. 사용자가 R2 bucket ID 알려주시면 즉시 코드 작업 시작.

---

## 8. 대안 (R2 도입 전)

현재 `data/` 폴더 (git 추적) 으로도 60일 OHLC 충분. 백테스트는:
- Yahoo Finance API (무료) — 한국 종목 limited
- KRX 정보데이터시스템 수동 다운로드 — 1회성 시드 데이터
- 한투 OpenAPI inquire-daily-itemchartprice — 일봉 30일치 한 번에 호출

R2 없이도 백테스트 가능 (단 분봉 시계열 X).
