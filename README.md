# ⚡ Daily ETF Pulse

> "지금 왜 이 ETF가 뜨는가?"에 매일 오전 9시 전 답하는, 4050 세대 중심 실시간 투자 의사결정 플랫폼.

- **콘텐츠 파이프라인**: 공공데이터포털·한국은행 ECOS·MARKET PULSE 이미지 OCR·구글 뉴스 RSS → Gemini 2.5 Flash로 본문 생성 → YMYL 검증 → MDX 자동 발행
- **프론트**: Next.js 16 (App Router) + Tailwind v4
- **배포**: GitHub → Cloudflare Pages 자동 배포 (파이프라인은 GitHub Actions cron)

---

## 🗂️ 카테고리 4종 + 확장

| 경로 | 타입 | 설명 |
|---|---|---|
| `/pulse` | 매일 발행 | 오늘의 관전포인트 — 개장 전 3줄 요약 |
| `/surge` | 매일 발행 | 거래량 1위 ETF 급등 사유 분석 |
| `/flow` | 매일 발행 | 섹터별 자금 흐름 · 기관·외국인 수급 |
| `/income` | 매일 발행 | 월배당·커버드콜 · 세후 수익률 비교 |
| `/theme/[ai\|semi\|shipbuilding\|defense]` | 주간 확장 (Month 2) | 테마 ETF 딥다이브 |
| `/account/[irp\|isa\|pension]` | 주간 확장 (Month 3) | 계좌별 매수 가이드 |

---

## 🤖 에이전트 파이프라인 (10단계)

```
DataMiner → SeoArchitect → NewsCollector → LogicSpecialist
  → Visualizer → FrontendPlanner ⇄ UiDesigner (광고 UX 반려 루프, 최대 3회)
  → CpaDealMaker → YmylGuard (반려 시 LogicSpecialist 롤백, 최대 3회)
  → HarnessDeployer (MDX 발행 + Google Indexing API)
```

주요 모듈:
- [agents/](agents/) — 10개 에이전트 (`1_data_miner` … `8_harness_deployer`, `1b_news_collector`, `5b_ui_designer`)
- [pipeline/orchestrator.js](pipeline/orchestrator.js) — 전체 순서 제어 + 자율 피드백 루프
- [pipeline/pulse_ocr.js](pipeline/pulse_ocr.js) — Gemini Vision MARKET PULSE 이미지 OCR
- [pipeline/google_indexing.js](pipeline/google_indexing.js) — 서비스 계정 JWT 자체 서명 색인 (의존성 없음)
- [pipeline/security_guard.js](pipeline/security_guard.js) — API 키 노출 방지 정적 점검

---

## 🚀 실행

```bash
# 1회 파이프라인 실행 (샘플 모드: API 키 없어도 동작)
npm run pulse

# 상주 스케줄러 (KST 08:30 매일 실행) — 로컬 테스트용
npm run pulse:scheduler

# 프론트 개발 서버
npm run dev

# 프로덕션 빌드
npm run build
```

---

## 🔑 환경변수 설정

1. `cp .env.example .env.local`
2. 다음 키 입력:
   - `GEMINI_API_KEY` — 본문 작성 + Vision OCR + 뉴스 요약 (모두 단일 키)
   - `DATA_GO_KR_API_KEY` — 공공데이터포털 ETF 시세
   - `BOK_ECOS_API_KEY` — 한국은행 경제지표
   - `PULSE_IMAGE_URL` — 매일 갱신되는 MARKET PULSE 이미지 직접 URL (Daily Pulse 핵심)
   - `SITE_URL` — sitemap/rss/Indexing 기준 도메인
   - `GOOGLE_INDEXING_KEY` 또는 `GOOGLE_INDEXING_KEY_FILE` — 서비스 계정 JSON (Phase 5)
   - `AFFILIATE_URL_*` — 실제 제휴 URL (없으면 `#`)

모든 키는 미설정 시 샘플 데이터로 자동 폴백되어 파이프라인은 동작합니다.

---

## 🌐 배포: GitHub + Cloudflare Pages

1. GitHub 저장소 생성 → origin 연결 → push
2. Cloudflare Pages에서 저장소 연결 (Framework preset: Next.js, 빌드 명령 `npm run build`)
3. CF Pages 환경변수: `SITE_URL`
4. GitHub Actions Secrets: `GEMINI_API_KEY`, `DATA_GO_KR_API_KEY`, `BOK_ECOS_API_KEY`, `PULSE_IMAGE_URL`, `GOOGLE_INDEXING_KEY`, `SITE_URL`
5. [.github/workflows/daily-pipeline.yml](.github/workflows/daily-pipeline.yml) cron이 매일 파이프라인 실행 → `content/` 커밋 → CF Pages 자동 재배포

---

## 📁 디렉토리 구조

```
etf-platform/
├── agents/              # 10개 콘텐츠 에이전트
├── pipeline/            # orchestrator · OCR · Indexing · scheduler
├── src/
│   ├── app/             # Next.js App Router (pulse/surge/flow/income/theme/account)
│   ├── components/      # EtfMarketPulse, DividendCalculator, AdBanner
│   └── lib/             # posts.ts (MDX 파싱), data.ts (데이터 로드)
├── content/             # 발행된 MDX (파이프라인이 생성)
├── data/                # 파이프라인 중간 산출물 (gitignore)
├── logs/                # 실행 로그 (gitignore)
├── public/              # 정적 에셋
├── .env.example         # 환경변수 템플릿
└── .github/workflows/   # 일일 cron
```

---

## ⚠️ YMYL · 법적 고지

모든 콘텐츠는 `YmylGuard` 에이전트가 수익 보장·매수 권유 표현을 차단하고 면책조항을 자동 삽입합니다. 투자 권유가 아니며, 판단과 결과의 책임은 투자자 본인에게 있습니다. 출처: KRX · 한국은행 · DART.
