# PLAN — 메인페이지 stale data 복구 + 매일 최신화 보장

> 사건: 메인페이지가 2026-05-11 시점에 4월 24일 데이터 노출 (16일 전).
> 원인: GitHub Actions cron은 정상 작동, 모든 에이전트 성공, HarnessDeployer "발행 N개" 로그 출력. 그러나 `git diff --cached`가 매번 "변경 없음" → commit 0건 → push 0건 → production 갱신 0건.
>
> 작성: 2026-05-11

---

## 1. 진단 결과 (현재까지 확정)

### 1-1. 작동 중인 것
| 항목 | 상태 | 증거 |
|---|---|---|
| `daily-pulse.yml` cron | ✅ 정상 | 4/27~5/8 매일 success (run id 25044427381 → 25545097432) |
| `weekly-etf-fetch.yml` cron | ✅ 정상 | 5/3·5/10 commit 자동 push (`d52cb67`·`093b51a`) |
| `biweekly-guide-refresh.yml` | ✅ 정상 | 5/1 commit (`47fe685`) |
| DataMiner | ✅ 정상 | "✅ 실제 ETF 100개 수집 (20260507)" — KRX API 키 유효 |
| SeoArchitect | ✅ 정상 | "7개 전략 수립" |
| LogicSpecialist | ✅ 정상 | 7개 글 작성 (4503자~7791자) — Gemini API 키 유효 |
| YmylGuard | ✅ 정상 | "통과 7 / 차단 0" |
| HarnessDeployer | ⚠️ 로그상 정상 | "🎉 7개 발행" + 7개 `📄 {cat}/{slug}.mdx` 로그 |

### 1-2. 실패하고 있는 것
| 항목 | 상태 | 증거 |
|---|---|---|
| Commit step `changed=false` | ❌ 매번 0건 | "No changes to commit" 출력 |
| Production verify | ❌ 6/7 404 | `pulse-20260508`/`flow-20260508-shipbuilding` 등 모두 404 |
| `data/.last-pulse-base-date` | ❌ 20260424 stuck | 매 cron이 깨끗한 checkout 시작 — commit 없으니 영원히 4/24 |

### 1-3. 가설 (가장 가능성 높은 순)
- **A. HarnessDeployer logger와 실제 `fs.writeFileSync` 사이 silent 실패** — log는 출력되지만 disk write 실패. 단 동기 호출이라 throw 안 되면 안 됨.
- **B. 어느 후속 step에서 content/ reset** — `Refresh Coupang Partners` 또는 `npm ci` 캐시 영향. 가능성 낮음.
- **C. GitHub Actions runner의 cwd 또는 권한 문제** — `__dirname` 기반 절대경로라 cwd 무관해야 함.
- **D. 코드 분기 — write skip 로직** — 매번 동일 슬러그 덮어쓰기 시 git이 무변화로 인식. 단 5/8은 새 슬러그 7개라 해당 X.

원인 확정은 **diagnostic step 추가 후 cron 1회 실행 결과**로 100% 확정 가능.

---

## 2. 즉시 조치 (이번 commit 포함)

### 2-1. ✅ Diagnostic step 추가
[.github/workflows/daily-pulse.yml](.github/workflows/daily-pulse.yml) — `Commit generated content + data` 직전에 진단 step 신설:
- `content/{cat}/` 디스크 상태 (HarnessDeployer 직후)
- `data/.last-pulse-base-date` 현재값
- `git status --untracked-files=all --short`
- `git status content/ --short`

다음 cron 실행 시 (또는 수동 `workflow_dispatch`) 위 정보가 GitHub Actions log에 출력됨 → 100% 원인 확정.

### 2-2. 수동 trigger 필요
push 후 즉시:
```bash
gh workflow run daily-pulse.yml
```
→ 5~15분 후 result 확인:
```bash
gh run list --workflow=daily-pulse.yml --limit 1
gh run view <run_id> --log | grep -A30 "Diagnostic"
```

---

## 3. 원인 확정 후 fix (시나리오별)

### 시나리오 A — `content/{cat}/` 에 새 파일 없음
→ HarnessDeployer가 logger만 출력하고 write 안 함. 코드 버그.
→ Fix: `agents/8_harness_deployer.js`의 `saveAsMdx`에 try/catch + 실패 로그. `published.push()`도 write 성공 확인 후로 이동.

### 시나리오 B — `content/{cat}/` 에 새 파일 있으나 `git status` 비어있음
→ 파일이 ignored 됨. `.gitignore` 또는 sparse-checkout 의심.
→ Fix: `.gitignore`에 `content/` 차단 규칙 있는지 확인. `git check-ignore content/pulse/pulse-20260508.mdx`로 확정.

### 시나리오 C — `git status` 에 파일 있으나 add 실패
→ `git add content/` 명령 실패 (silent). 권한/경로 문제.
→ Fix: `git add` step의 `|| true` 제거 + verbose 출력.

### 시나리오 D — 모든 게 정상인데 commit 안 됨
→ checkout/setup-node가 stale 캐시 — `actions/checkout@v4`의 `clean: true` 강제.

---

## 4. 재발 방지 (장기)

### 4-1. cron Health Alert (필수)
**문제**: 17일 동안 0건 발행됐는데 운영자가 today.md 보기 전까지 모름.
**해결**:
- Summary step 끝에서 "changed=false 가 N일 연속" 감지 → GitHub Issue 자동 생성
- 또는 `data/.last-pulse-base-date` 가 N일 이상 stale 시 alert
- 또는 Threads/Slack/이메일 webhook (사용자 미리 설정 필요)

```yaml
- name: Alert if no commit for 3 consecutive cron runs
  if: steps.commit.outputs.changed == 'false'
  run: |
    LAST_BASE=$(cat data/.last-pulse-base-date 2>/dev/null || echo "unknown")
    DAYS_STALE=$(( ($(date +%s) - $(date -d "${LAST_BASE:0:4}-${LAST_BASE:4:2}-${LAST_BASE:6:2}" +%s)) / 86400 ))
    if [ "$DAYS_STALE" -gt 3 ]; then
      gh issue create \
        --title "🚨 Daily Pulse 발행 ${DAYS_STALE}일 연속 0건" \
        --body "마지막 발행: $LAST_BASE / 즉시 진단 필요"
    fi
```

### 4-2. today.md 의 stale 경고
오늘 만든 `scripts/generate-today.mjs` 가 마지막 발행일과 오늘 차이를 계산해서 N일 이상이면 ⚠️ 띠 추가.

```javascript
const stalenessDays = ...;
if (stalenessDays > 3) {
  md += `\n> 🚨 **STALE**: 마지막 발행이 ${stalenessDays}일 전. cron 진단 필요.\n`;
}
```

### 4-3. 메인페이지 freshness 안전장치
[src/app/page.tsx](src/app/page.tsx) `latestPulse` 발행일이 7일 이상 오래된 경우:
- TrustBar 옆 또는 HomeHeroV3 안에 "📅 데이터 갱신 중" 작은 라벨
- 시청자 신뢰 손실 회피 (16일 전 데이터를 "오늘 뜨는 ETF"로 표시하는 게 더 큰 문제)

```tsx
const ageDays = latestPulse
  ? Math.floor((Date.now() - new Date(latestPulse.meta.date).getTime()) / 86400000)
  : null;
const isStale = ageDays !== null && ageDays > 7;
```

stale 시:
- Hero copy를 "최근 분석" → "최근 분석 (갱신 중)" 변경
- 또는 EtfMarketPulse(실시간 KRX 30분 캐시) 위에 더 강조 — 시세는 어차피 실시간

---

## 5. 보완 — production 갱신 우회로 (cron이 또 막힐 경우)

### 5-1. 수동 발행 가이드
운영자가 로컬에서 직접:
```bash
npm install
# .env.local 에 GEMINI_API_KEY, DATA_GO_KR_API_KEY, BOK_ECOS_API_KEY 설정 (기존 값 그대로)
npm run pulse
git add content/ data/
git commit -m "chore(pulse): manual recovery YYYY-MM-DD"
git push origin main
```

### 5-2. workflow_dispatch 빈번 사용
cron 외에 수동 trigger 가능 (이미 지원). 운영자가 매일 아침 today.md 확인 후 stale 발견하면 1클릭으로 재실행.

---

## 6. 실행 순서 (단계별)

| 단계 | 작업 | 누가 | 예상 시간 |
|---|---|---|---|
| **1** | 본 commit push (diagnostic step) | 운영자 "푸쉬" 명시 | 1분 |
| **2** | `gh workflow run daily-pulse.yml` 수동 trigger | Claude/운영자 | 즉시 |
| **3** | 10~15분 후 cron 결과 확인 + diagnostic 출력 분석 | Claude | 15분 |
| **4** | 시나리오 A/B/C/D에 따라 fix commit | Claude | 30분~1시간 |
| **5** | 두 번째 trigger → production verify | Claude | 15분 |
| **6** | today.md stale 경고 + 메인페이지 freshness 띠 추가 | Claude | 30분 |
| **7** | cron Health Alert (GitHub Issue 자동) 도입 | Claude | 30분 |

---

## 7. 핵심 의문 (사용자 결정 필요)

1. **로컬 수동 발행 시도?** — `.env.local` 키가 로컬에 있다면 `npm run pulse`로 즉시 1편 발행해 production에 한 번 반영해 stale 깨고 갈 수 있음. (cron fix 전 임시 우회)
2. **GitHub Issue alert vs Threads/Slack webhook?** — 알림 방식 선호 채널.
3. **메인페이지 freshness 띠 우선순위** — 즉시 적용? cron fix 검증 후?
