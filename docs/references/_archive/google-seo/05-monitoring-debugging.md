# 모니터링 및 디버깅 (Monitoring & Debugging)

> Google Search Console을 활용한 사이트 모니터링과 문제 해결
> 출처: https://developers.google.com/search/docs/monitor-debug

## Search Console 시작 단계
1. **사이트 소유권 확인** (HTML 파일, DNS, GA 등)
2. **색인 생성 범위 보고서** 확인 → 오류/경고 수정
3. **사이트맵 제출**
4. **검색 실적 보고서** 모니터링

> Search Console은 매일 로그인할 필요 없음. 새 문제 발견 시 이메일 알림 전송.

---

## SEO/마케팅 담당자용 보고서
| 보고서 | 용도 |
|--------|------|
| 직접 조치(Manual Actions) | 사이트에 수동 페널티가 있는지 확인 |
| 삭제 도구 | 검색결과에서 임시 제거 (약 6개월) |
| 주소 변경 알림 | 도메인 이전 시 Google에 통보 |
| 리치 결과 상태 | 구조화 데이터 오류 진단 |
| 검색 실적 | 검색어/페이지/국가별 노출·클릭 분석 |

## 웹 개발자용 보고서
| 보고서 | 용도 |
|--------|------|
| 색인 생성 범위 | 사이트 전체 색인 오류 개요 |
| URL 검사 도구 | 페이지별 색인 상태, 라이브 테스트 |
| 보안 문제 | 해킹·악성 콘텐츠 감지 |
| Core Web Vitals | 실제 사용자 데이터 기반 페이지 성능 |

---

## Core Web Vitals (CWV)
| 지표 | 의미 | 권장값 |
|------|------|--------|
| **LCP** (Largest Contentful Paint) | 가장 큰 요소 렌더링 시간 | < 2.5s |
| **INP** (Interaction to Next Paint) | 상호작용 응답성 | < 200ms |
| **CLS** (Cumulative Layout Shift) | 레이아웃 안정성 | < 0.1 |

### 최적화 팁
- 이미지 lazy loading (`loading="lazy"`)
- 이미지 `width`/`height` 명시로 CLS 방지
- 폰트 `font-display: swap` + preconnect
- JavaScript 코드 분할 (code splitting)
- Critical CSS 인라인화

---

## URL 검사 도구 활용
- **현재 색인 상태**: Google이 마지막으로 본 페이지 정보
- **라이브 테스트**: 현재 페이지를 즉시 크롤링/렌더링
- **색인 요청**: 변경 후 우선 크롤링 요청

---

## 일반적인 문제 해결
| 증상 | 원인 가능성 | 해결책 |
|------|------|--------|
| 색인 안 됨 | robots.txt 차단 | robots.txt 검토 |
| `noindex` 감지 | 메타 태그 또는 HTTP 헤더 | 태그 제거 |
| Soft 404 | 빈 페이지나 잘못된 응답 | 404 상태 코드 반환 또는 콘텐츠 보강 |
| 중복 콘텐츠 | canonical 누락 | `<link rel="canonical">` 추가 |
| 모바일 사용성 | 작은 폰트, 좁은 뷰포트 | 반응형 디자인 |

---

## 바이브코딩 체크리스트
- [ ] Search Console 소유권 확인됨
- [ ] sitemap.xml 제출됨
- [ ] Core Web Vitals 측정 도구(Lighthouse, PageSpeed Insights) 통과
- [ ] 색인 생성 범위 보고서 주기적 확인
- [ ] 리치 결과 보고서에 오류 없음
- [ ] 모바일 사용성 문제 없음
