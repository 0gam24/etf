# 배포 · 자동화 가이드

Daily ETF Pulse를 **GitHub + 호스팅**으로 매일 자동 업데이트되도록 설정하는 가이드.

---

## 아키텍처

```
┌─ GitHub Actions (cron: 매일 KST 09:00) ─┐
│  1. checkout repo                        │
│  2. npm ci → npm run pulse               │    매일 자동 콘텐츠 생성
│  3. git commit content/ data/            │
│  4. git push                              │─┐
└──────────────────────────────────────────┘ │
                                              ▼
┌─ GitHub repo (main branch) ─────────────────┐
│  .mdx · data/*.json · next.js 코드           │
└──────────────────┬──────────────────────────┘
                   │  push webhook
                   ▼
┌─ 호스팅 (Vercel 또는 Cloudflare Pages) ──────┐
│  빌드 · 배포 · CDN · custom domain            │
└─────────────────────────────────────────────┘
```

---

## ① GitHub 준비

### 1-1. .gitignore 점검 (이미 설정됨)
- `.env.local`, `node_modules`, `.next`, `logs`, `data/raw/pulse_images/` 는 **업로드 금지**
- `content/`, `data/raw/*.json`, `data/processed/` 는 배포에 **포함 필요** — 프론트가 런타임에 읽음

### 1-2. 첫 푸시
```bash
cd etf-platform
git init  # 아직 없으면
git add .
git commit -m "initial: Daily ETF Pulse platform"
git branch -M main
git remote add origin https://github.com/<사용자명>/<repo>.git
git push -u origin main
```

### 1-3. Secrets 등록 (**중요**)
GitHub → 해당 repo → Settings → **Secrets and variables** → **Actions** → **New repository secret**

**필수 (파이프라인 동작):**
| Name | 값 |
|---|---|
| `GEMINI_API_KEY` | Google AI Studio 키 |
| `DATA_GO_KR_API_KEY` | 공공데이터포털 ETF 시세 키 |
| `BOK_ECOS_API_KEY` | 한국은행 ECOS 키 |
| `NAVER_CLIENT_ID` | 네이버 검색 API Client ID |
| `NAVER_CLIENT_SECRET` | 네이버 검색 API Client Secret |
| `SITE_URL` | 실제 배포 도메인 (예: `https://yoursite.com`) |

**선택 (있으면 더 좋음):**
| Name | 효과 |
|---|---|
| `PULSE_IMAGE_URL` | MARKET PULSE 이미지 OCR 활성화 |
| `INDEXNOW_KEY` | Bing 즉시 색인 (32자 hex) |
| `GOOGLE_INDEXING_KEY` | 구글 색인 API (서비스 계정 JSON 전체) |
| `THREADS_USER_ID` + `THREADS_ACCESS_TOKEN` | Meta Threads 자동 포스팅 |

---

## ② 호스팅 선택 — **중요한 결정**

### Option A. **Vercel** (⭐ 가장 간단)

Next.js는 Vercel 본사가 만든 프레임워크라 **별도 설정 없이 완벽 지원**.

**장점**
- 현재 `api/etf`·`api/search`·`api/og`·`fs` 사용 등 **코드 수정 불필요**
- PR preview, 분석, Edge Network 모두 무료 티어 포함
- GitHub repo 연결 → 자동 배포

**단점**
- 무료 플랜: 월 100GB 트래픽, 100GB-hr serverless 실행시간 (블로그엔 충분)
- Vercel 계정 필요

**설정 절차**
1. https://vercel.com 로그인 (GitHub 연동)
2. **New Project** → repo 선택 → **Import**
3. Root Directory: `etf-platform`
4. Environment Variables 탭에서 Secrets와 동일한 값 입력 (빌드 시 필요한 것만: `SITE_URL` 정도)
5. **Deploy**
6. 배포 완료 후 Custom Domain 연결

### Option B. **Cloudflare Workers** (OpenNext 어댑터 · 이미 설정됨)

`@opennextjs/cloudflare`로 Next.js 16을 Cloudflare Workers에 통째로 배포. `nodejs_compat` 플래그 덕분에 **`/api/etf` 등 fs 기반 라우트도 수정 없이 동작**.

**장점**
- 무제한 대역폭 (무료 Workers 요청 10만/일)
- 전세계 엣지 CDN — 응답 속도 최상위
- 코드 리팩토링 불필요 (기존 fs/path 그대로)

**단점**
- Vercel 대비 초기 설정 약간 복잡 (이미 완료됨)
- 무료 일 10만 요청 초과 시 유료 (5 달러/월 최소)

**이미 설정된 것들**
- `package.json` 스크립트: `cf:build`, `cf:preview`, `cf:deploy`
- `wrangler.jsonc` — Workers 설정 (nodejs_compat 활성)
- `open-next.config.ts` — OpenNext Cloudflare 설정

**설정 절차**

1. https://dash.cloudflare.com → 좌측 **Workers & Pages** → **Create** → **Import a repository**
2. **Connect to Git** → 0gam24/etf 선택
3. **Build configuration:**
   - Framework preset: `Next.js` 선택 (또는 None)
   - Build command: `npm run cf:build`
   - Deploy command: `npx wrangler deploy`
   - Root directory: (비워두거나 `/`)
4. **Environment variables** (Build + Runtime 둘 다 추가):
   - `GEMINI_API_KEY`, `DATA_GO_KR_API_KEY`, `BOK_ECOS_API_KEY`
   - `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`
   - `SITE_URL` — 배포 완료 후 실제 도메인으로 업데이트
5. **Save and Deploy**

**로컬 미리보기:**
```bash
npm run cf:preview  # 로컬에서 Workers 환경 시뮬레이션
```

**수동 배포:**
```bash
npm run cf:deploy  # wrangler로 바로 업로드
```

### 추천: Cloudflare 선택 — Next.js 16 지원 + 기존 코드 수정 없음

---

## ③ GitHub Actions 자동화 (cron)

이미 `.github/workflows/daily-pulse.yml` 작성됨. 주요 동작:
- **매일 UTC 00:00 (= KST 09:00) 실행**
- `npm run pulse` → 생성된 MDX/데이터 → `git commit` → `git push`
- 수동 실행도 가능 (Actions 탭 → Daily ETF Pulse → Run workflow)

### 첫 테스트 방법
1. 최초 push 완료 후 GitHub → **Actions** 탭으로 이동
2. **Daily ETF Pulse** 워크플로 선택 → **Run workflow** 클릭 (수동 실행)
3. 로그에서 각 에이전트 단계가 ✅ 로 표시되는지 확인
4. 성공 시 repo에 새 `chore(pulse): daily update YYYY-MM-DD` 커밋이 찍힘
5. Vercel/Cloudflare가 push webhook으로 **자동 재빌드·배포**

### Cron 시간 변경
`daily-pulse.yml`의 `cron: '0 0 * * *'` 수정:
- KST 09:00 = UTC 00:00 → `0 0 * * *` (현재)
- KST 08:00 = UTC 23:00 → `0 23 * * *`
- KST 07:30 = UTC 22:30 → `30 22 * * *`

---

## ④ Gemini 쿼터 관리 (**가장 중요**)

현재 무료 티어: **하루 20건 (gemini-2.5-flash)**. 파이프라인이 약 **14건 이상** 호출하므로 여유가 없음.

### 즉시 대응
- `flash-lite`로 자동 폴백 코드 이미 반영됨 (`LogicSpecialist`)
- 그래도 부족 시 **샘플 폴백**으로 품질 저하

### 권장 — 유료 전환
- https://aistudio.google.com/apikey → Billing 활성화
- **Pay-as-you-go** 플랜 (입력 $0.075 / 1M 토큰, 출력 $0.30 / 1M 토큰)
- 하루 파이프라인 비용 약 **$0.01~$0.03** (매우 저렴)

---

## ⑤ Cloudflare/Vercel Custom Domain

1. 호스팅 콘솔 → Domains → Add
2. 도메인 레지스트라(가비아·Namecheap 등)에서 CNAME/NS 설정
3. SSL 인증서 자동 발급 (1~30분)
4. `.env.local` · GitHub Secrets의 `SITE_URL`을 실제 도메인으로 업데이트
5. Vercel/Cloudflare의 "Production Deployment" 변경 반영

---

## ⑥ 첫 배포 체크리스트

- [ ] `.env.local`이 `.gitignore`에 포함됨 (✅ 이미 설정)
- [ ] GitHub Secrets 7개 이상 등록 (`GEMINI_API_KEY` 필수)
- [ ] `npm run build` 로컬 성공 확인
- [ ] GitHub push → Vercel/Cloudflare 연결 → 첫 빌드 녹색
- [ ] 배포된 URL에서 `/`, `/pulse`, `/surge`, `/breaking`, `/flow`, `/income` 200 확인
- [ ] `.github/workflows/daily-pulse.yml` 수동 실행 1회 성공 확인
- [ ] cron 자동 실행 (다음 날 아침 09:00) 정상 동작 확인

---

## ⑦ 문제 대응

| 증상 | 원인 | 해결 |
|---|---|---|
| Vercel 빌드에서 `Cannot find module 'fs'` | 클라이언트 컴포넌트에서 `fs` import | 해당 파일을 서버 컴포넌트로 전환 or 사용 중단 |
| GitHub Actions 타임아웃 | Gemini API 지연 | `timeout-minutes: 20` → 30으로 상향 |
| 매일 커밋이 비어있음 | `git diff --cached --quiet`가 true → 정상 (그날 신규 글 없음) | — |
| 로컬 push와 GitHub Actions 충돌 | 양쪽에서 같은 파일 수정 | 로컬에서 작업 전 `git pull` · 원칙적으로 로컬은 개발·테스트만 |
| Gemini 429 | 무료 쿼터 소진 | 유료 전환 (위 ④) |

---

## 참고 링크

- [Next.js on Cloudflare Pages 공식 가이드](https://developers.cloudflare.com/pages/framework-guides/nextjs/)
- [Vercel Next.js 배포](https://vercel.com/docs/frameworks/nextjs)
- [GitHub Actions cron 문법](https://crontab.guru)
- [Gemini API pricing](https://ai.google.dev/pricing)
