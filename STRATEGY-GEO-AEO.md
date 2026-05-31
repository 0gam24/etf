# GEO·AEO 발행 전략 — Daily ETF Pulse

> ETF 키워드로 **검색(SEO) + 생성형 검색 인용(GEO) + 답변엔진(AEO)** 트래픽을 매일 최대화하기 위한 운영 전략.
> 13개 분석 에이전트 관점 패널 심의(2026-05-31) + 리스크 심판 가드레일 + 편집장 코드 실측 교정으로 확정.
> 이 문서는 [SEO.md](SEO.md)·[CLAUDE.md](CLAUDE.md)의 하위 실행 지침이며, 충돌 시 상위 문서가 우선한다.

---

## 0. 핵심 진단 (왜 이 전략인가)

이미 갖춰진 것 (완성도 ~85%):
- 14에이전트 발행 파이프라인, 1095종 ETF 종목사전(`/etf/{slug}`), 8개 필러 가이드(`/guide`), 12개 비교페어(`/compare`), 7개 페르소나(`/for`)
- 다층 sitemap 5종 + RSS + JSON-LD 8빌더(Article·NewsArticle·FinancialProduct·Dataset·HowTo·**FAQPage**·Person·BreadcrumbList)
- **robots.ts 가 AI 봇 명시 허용**: GPTBot·OAI-SearchBot·PerplexityBot·ClaudeBot·Claude-Web·Google-Extended·CCBot → GEO 크롤 기반 완비
- 77개 글이 `schemas[]`에 FAQPage 인라인 박제 중 (FAQ 스키마 커버리지 이미 높음)

빠진 핵심 = **GEO/AEO "콘텐츠 레이어"**:
1. AI 전용 사이트 안내서(`/llms.txt`) — ✅ 1차 구현·발행 완료
2. 글 상단 **직답블록**(직답 1문장 + 핵심 수치) — ✅ AnswerBox 인프라 완료(frontmatter 채우면 노출)
3. FAQ의 **schema-DOM 일치**(스키마만 있고 본문 가시 텍스트 없으면 인용 약함) — ✅ 가드형 렌더 연결
4. 매일 발행을 검색의도·트렌드재킹·필러클러스터로 운영하는 **SOP** — 본 문서 §3

---

## 1. 4단계 로드맵

| 단계 | 목표 | 상태 |
|---|---|---|
| **L1 GEO 진입점** | `/llms.txt` 발행, AI봇 인용 지도 제공 | ✅ 완료 (376c199) |
| **L2 AEO 정답블록** | 모든 신규 글 상단 직답 + 핵심숫자 + 자연어 FAQ | ✅ 완료 — 인프라(376c199)·게이트/emit(460c41a)·LogicSpecialist 자동 생성(f33dd64). 매일 발행 자동 AEO 완비 |
| **L3 롱테일 흡수** | `/compare` 확장 + `/etf` 정답블록(데이터 종목) | ⏳ /etf AEO 완료(4cd7ee5). /compare 확장 잔여 |
| **L4 매일 SOP** | 검색의도 매핑·트렌드재킹·클러스터 내부링크 상시화 | ✅ 게이트화 완료(YMYL·메타·IndexNow). SOP §3 운영 적용 |

---

## 2. AEO 정답블록 규격 (YMYL 가드레일 적용)

frontmatter 필드 (모두 선택 — 없으면 graceful skip):

```yaml
summary: "KODEX 방산TOP10은 5/31 KRX 기준 1.80% 하락하며 거래량 1위를 기록했습니다."  # ≤55자, 사실 서술형
keyStats:
  - { label: "현재가", value: "13,400원", sub: "전일대비 -1.80%" }
  - { label: "거래량", value: "445만 주", sub: "전체 ETF 1위" }
  - { label: "대표 구성", value: "한화에어로 18.4%" }
faqs:
  - { question: "KODEX 방산TOP10 구성종목은?", answer: "한화에어로스페이스(약 18%)·LIG넥스원(약 14%)·한화시스템(약 12%) 등 상위 10종이 비중 대부분을 차지합니다." }
```

**렌더 위치(헌법 — 순서 고정)**: AffiliateNotice(top) → AiAgentDisclosure(compact) → **AnswerBox** → 본문. 정답블록이 affiliate·AI 공시를 아래로 밀지 않는다.

**이중 FAQPage 방지(중요)**: 기존 77편은 `schemas[]`에 FAQPage를 인라인 박제 중. 렌더러는 **`schemas[]`에 FAQPage 가 없을 때만** `faqs`로 FaqSection + `buildFaqSchema` JSON-LD를 출력한다. → 한 페이지에 FAQPage 1개만 보장. 신규 글은 인라인 박제를 폐기하고 `faqs` 단일 소스로 전환(파이프라인 작업).

### YMYL 금지 (리스크 심판 G2)
직답·핵심숫자·FAQ는 **사실 수치 + 관찰형 인과만**. 다음 금지:
- 예측·매수권유: "분할매수 유효", "비중 N%로 조절", title/slug 의 "전망" 단정
- 미래 수익 보장·세후 미래수익 환산 (분배율은 **과거 기준** 명시)
- 정답블록 인접에 면책 1회 노출

---

## 3. 매일 발행 SOP (11단계)

> 매일 수동 발행. cron 비활성(2026-05-26 정책). 모든 commit 자동 push.

1. **OS date 검증** — `date` 명령 1회 실행 → 발행일·슬러그 날짜 확정. 시스템 currentDate 맹신 금지([[feedback_verify_os_date]]).
2. **종목 선별** — 당일 거래량·등락 TOP에서 검색수요 큰 섹터(방산·반도체·2차전지·월배당) 우선 1~3종. **카테고리당 1슬러그**(cannibalization 방지).
3. **발행** — pulse 필수 + surge/income/breaking 택1~2. 각 글 frontmatter 에 `summary`·`keyStats`(가용 시 3개, 값+기준일)·`faqs`(2~3쌍) 채움. KOREAN_SLUG_MAP 신규 속성 키워드(분배락일·구성종목·수수료·괴리율) 선등록.
4. **YMYL 규격 검사** — §2 금지 항목. 예측·권유·미래수익 환산 0.
5. **운영자 메타 leak 검사** — 본문 + 자동주입 텍스트(keyStats 캡션·FAQ) 대상. 금지: `Gemini·GPT·LLM·크롤링·스크래핑·파이프라인·자동 발행·fallback·placeholder·sample·샘플 데이터·글자수`. 원시도메인(v.daum.net 등)은 매체명으로 정규화. `(추정)·N/A` 노출 제거.
6. **면책 순서 검증** — AffiliateNotice(top) → AiAgentDisclosure(compact) → AnswerBox 순서 유지.
7. **스키마-DOM 일치** — `faqs` 단일 소스. 인라인 `schemas[]` FAQPage 이중화 금지. 품질게이트(금지단어·스키마불일치)=hard-fail / 수량게이트(keyStats·faqs 개수)=soft-block(휴장·결측 시 발행마비 방지).
8. **빌드 검증** — `npm run cf:build` 성공 + `.open-next/server-functions/default/content/{category}/` 에 신규 MDX 포함 확인. ⚠️ 빌드는 **동시 실행 금지**(`.next` 충돌로 ENOENT) — 항상 단일 순차 실행.
9. **커밋·자동 push** — `git add content/ data/` → commit → `git pull --rebase --autostash origin main` → push. 4대 안전검사(OS date·메타leak·비밀값·destructive) 통과 전제.
10. **IndexNow 핑** — (파이프라인 작업 후) 빌드 직후 신규/갱신 URL + `/sitemap-news.xml` + `/sitemap.xml` 전송. 소급 글은 본문 실변경 시에만 재핑(lastmod 정확성).
11. **push 후 5~7분 검증** — 신규 슬러그 1~3개 curl 200 + `/llms.txt`·`/rss.xml` 신규 item + Rich Results 로 Article+FAQPage 1편 스폿체크. 누락 시 4원인(빌드캐시·gitignore·webhook·add누락) 점검.

---

## 4. 구현 큐 (우선순위·의존성 순)

| # | 작업 | 파일 | 상태 |
|---|---|---|---|
| 1 | ~~AiAgentDisclosure div 버그 수정~~ | — | ❌ 환각(버그 없음), 폐기 |
| 2 | `/llms.txt` 단독 push 선행 | `src/app/llms.txt/route.ts` | ✅ 완료 |
| 3 | posts.ts `faqs` 파싱 추가 | `src/lib/posts.ts` | ✅ 완료 |
| 4 | 렌더러 faqs 가시 FaqSection + JSON-LD(이중 FAQPage 가드) | `[category]/[slug]/page.tsx` | ✅ 완료 |
| 5 | 인라인 FAQPage 박제 폐기 → frontmatter faq[] 단일 소스 | `agents/9_schema_injector.js` | ⏸ 보류(실익 낮음) — agent 9 가 글당 FAQPage 1개만 생성 → 실제 이중화 없음. 렌더러 가드가 안전망 |
| 6 | 렌더러 첫 영역 순서 헌법화 | `[category]/[slug]/page.tsx`, `AnswerBox.tsx` | ✅ 완료 |
| 7 | HarnessDeployer 게이트(품질=hard, 수량=soft) + 정답블록 leak + frontmatter emit | `agents/8_harness_deployer.js` | ✅ 완료 (460c41a, 단위테스트 7/7) |
| 8 | IndexNow 확장(카테고리·sitemap-news·llms.txt) + sitemap-news 48h | `agents/11`, `sitemap-news.xml` | ✅ 완료 — sitemap-news 는 이미 48h+publishedAt 규격 정상 |
| 8b | LogicSpecialist 정답블록 자동 생성(deriveAnswerBlock) | `agents/3_logic_specialist.js` | ✅ 완료 (f33dd64, 단위+통합테스트) |
| 9 | YMYL 정정 backfill(거래량 TOP 10~15편만, 본문 무변경) | `scripts/backfill-answer-blocks.js`(신규) | ☐ 예정 |
| 10 | `/etf` 종목사전 AEO 정답블록(데이터 있는 종목만, minimal skip) | `src/app/etf/[ticker]/page.tsx` | ✅ 완료 (4cd7ee5) — AnswerBox import+answerData+JSX 실제 연결 |

**doorway 방지(리스크 심판)**: `/etf` 질문화·직답은 시세·holdings **실데이터가 있는 종목만** 렌더. minimal 995종은 자동 생성 금지(빈 직답·N/A·추정 금지) — 구글 scaled-content 정책 위반 회피.

---

## 5. 측정 지표 (트래픽 증가 검증)

- **GSC**: FAQPage 리치결과 유효 페이지 수(주간 증가), Article 노출/클릭, 정답블록 적용 vs 미적용 글 CTR 비교
- **색인 속도**: 신규 슬러그 색인 소요시간(IndexNow 전후), Coverage 색인 비율 80%+ 유지
- **롱테일 순위**: `{ETF명} 분배금 언제`·`{ETF명} 구성종목`·`A vs B 차이` 평균 게재순위(GSC 쿼리 보고서)
- **GEO 인용**: ChatGPT·Perplexity·Claude 에서 대표 종목 질의 시 iknowhowinfo.com 인용 출현 주간 스폿체크 + 서버 로그 AI봇 크롤 빈도
- **AI Overview/스니펫**: 핵심 5~10 쿼리에서 summary 직답이 스니펫 채택되는지 주간 추적
- **자산 건전성**: `/llms.txt`·`/rss.xml`·`/sitemap-news.xml` 200 상시, sitemap-news 48h 윈도우 신규글 포함률
- **트래픽**: 정답블록 적용 카테고리(surge/income/breaking) 오가닉 유입·체류시간 추세

---

_갱신: 2026-05-31 · 근거: 13에이전트 패널 심의 + 리스크 심판 + 편집장 코드 실측 교정_
