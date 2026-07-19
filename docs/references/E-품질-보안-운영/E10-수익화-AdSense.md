# E10 — 수익화: AdSense 운영 가이드

> **참조 시점**: AdSense 승인 후 광고 배치 · 수익 최적화 · PageSpeed 유지
> **원본**: 실측 검증 완료된 운영 기획서에서 범용 핵심만 추출

---

## 1. 핵심 원칙

- ✅ **PageSpeed 100점 유지**가 AdSense 수익보다 우선 — 트래픽이 수익의 전제
- ✅ 광고는 **콘텐츠 보조** — 콘텐츠 경험을 해치면 장기 손해
- ✅ **자동 광고(Auto Ads) 사용 금지** — 레이아웃 제어 불가 + CLS 악화
- ✅ 수동 유닛만 사용, **IntersectionObserver lazy-init** 기본
- ❌ 프로덕션 광고 페이지에 자동화 브라우저(봇) 접근 금지 — 무효 트래픽 판정 위험

---

## 2. AdSense 정책 핵심

### 2-1. 절대 금지 (계정 정지 사유)

- 자신의 광고 클릭 / 클릭 유도
- 봇·스크립트로 인위적 노출/클릭 생성
- 광고와 콘텐츠 구분이 안 되는 배치
- 성인·폭력·저작권 침해 콘텐츠
- 광고만 있는 페이지 (콘텐츠 부족)
- 한 화면에 광고가 콘텐츠보다 많은 배치

### 2-2. 자격 유지 조건

- 독창적이고 유용한 콘텐츠가 충분히 있을 것
- 사이트 내비게이션이 명확할 것
- 개인정보처리방침 페이지 존재
- 사이트가 6개월 이상 운영되고 있을 것 (권장)

---

## 3. 광고 배치 전략

### 3-1. 배치 원칙

| 위치 | 광고 유형 | 주의사항 |
|---|---|---|
| 본문 상단 (h1 아래) | 디스플레이 (가로형) | LCP에 영향 주지 않도록 lazy |
| 본문 중간 | 인피드 / 디스플레이 | 단락 사이 자연스럽게 |
| 본문 하단 | 디스플레이 | 가장 안전한 위치 |
| 사이드바 | 디스플레이 (세로형) | 데스크톱 전용 |
| **Above-the-fold 금지** | — | CLS + 사용자 경험 악화 |

### 3-2. CLS 방지 — 광고 슬롯 사전 예약

```css
.ad-slot {
  min-height: 250px;       /* 광고 높이에 맞춤 */
  background: var(--color-neutral-100);
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### 3-3. IntersectionObserver lazy-init 패턴

광고 스크립트를 뷰포트 근접 시에만 로드하여 INP/LCP 보호:

```js
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      initAdUnit(entry.target);
      observer.unobserve(entry.target);
    }
  });
}, { rootMargin: '200px' });

document.querySelectorAll('.ad-slot').forEach((el) => observer.observe(el));
```

---

## 4. 성능 유지 전략

### 4-1. Partytown 사용 금지

> 2026-06 실측 검증: AdSense iframe·viewability가 깨지고, GA4도 수신 0건.
> **메인스레드 + 유휴 시점 주입**이 현행 표준.

### 4-2. 광고 로드 시점

```js
// requestIdleCallback으로 유휴 시점에 로드
const loadAds = () => {
  const script = document.createElement('script');
  script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
  script.async = true;
  document.head.appendChild(script);
};

if (typeof window.requestIdleCallback === 'function') {
  window.requestIdleCallback(loadAds, { timeout: 3000 });
} else {
  setTimeout(loadAds, 1500);
}
```

### 4-3. 성능 예산 (광고 포함)

| 지표 | 광고 없음 목표 | 광고 포함 허용 |
|---|---|---|
| LCP | ≤ 2.0s | ≤ 2.5s |
| INP | ≤ 100ms | ≤ 150ms |
| CLS | ≤ 0.05 | ≤ 0.1 |
| 초기 JS | ≤ 100KB | ≤ 150KB (광고 스크립트 포함) |

---

## 5. 수익 공식

```
월 수익 = 일일 PV × RPM ÷ 1000 × 30
```

| 변수 | 설명 | 초기 목표 |
|---|---|---|
| PV | 일일 페이지뷰 | 1,000+ |
| RPM | 1000회 노출당 수익 (원) | ₩1,500~3,000 |
| CTR | 광고 클릭률 | 1~3% |

### 수익 레버

1. **PV 증가** (SEO/GEO → → C1, D1~D5 참조)
2. **RPM 개선** (광고 위치 최적화, 고가 키워드 콘텐츠)
3. **페이지 수 확대** (콘텐츠 추가)

---

## 6. 측정·모니터링

### 6-1. AdSense 대시보드

- 일일 수익·RPM·CTR·CPC 확인
- 페이지별 수익 분석
- 광고 유닛별 성과 비교

### 6-2. Lighthouse 연동

광고가 있는 페이지의 성능 회귀를 CI에서 자동 검증:

```json
{
  "ci": {
    "assert": {
      "assertions": {
        "categories:performance": ["warn", { "minScore": 0.90 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }]
      }
    }
  }
}
```

### 6-3. 롤백 기준

- PageSpeed Performance 점수가 **85 이하로 떨어지면** 광고 배치 변경 롤백
- CLS가 **0.15 초과**하면 해당 광고 슬롯 비활성화
- CTR이 **0.3% 이하**이면 배치 변경 또는 제거

---

## 7. 검증 체크리스트

- [ ] 자동 광고(Auto Ads) 비활성화
- [ ] 모든 광고 슬롯 min-height 예약 (CLS 방지)
- [ ] IntersectionObserver lazy-init 적용
- [ ] above-the-fold에 광고 없음
- [ ] 광고 포함 페이지 PageSpeed 90+ 유지
- [ ] 개인정보처리방침 페이지 존재
- [ ] 광고와 콘텐츠 구분 명확
- [ ] 프로덕션에 봇 접근 차단 확인
