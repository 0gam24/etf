# Core Web Vitals 및 Google 검색결과 이해하기

> **출처(Source):** https://developers.google.com/search/docs/appearance/core-web-vitals?hl=ko
> **저작자(Attribution):** Google
> **라이선스(License):** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
> 이 문서는 Google 검색 센터 문서를 Markdown으로 변환한 사본입니다.
> 원문의 최신 내용은 위 출처 링크를 확인하세요.

---

# Core Web Vitals 및 Google 검색결과 이해하기

[Core Web Vitals](https://web.dev/articles/vitals?hl=ko#core-web-vitals)은 로드 성능, 상호작용, 페이지의 시각적 안정성에 관한 실제 사용자 경험을 측정하는 측정항목입니다. 사이트 소유자는 Google 검색을 효과적으로 활용하고 전체적으로 우수한 사용자 환경을 제공하려면 우수한 Core Web Vitals을 유지하는 것이 좋습니다. 이는 다른 페이지 경험 측면과 마찬가지로 핵심 순위 시스템이 보상하고자 하는 것과 일치합니다. 자세한 내용은 [Google 검색결과의 페이지 경험 이해하기](https://developers.google.com/search/docs/appearance/page-experience?hl=ko)를 참고하세요.

## Core Web Vitals 측정항목

* [최대 콘텐츠 페인트(LCP)](https://web.dev/articles/lcp?hl=ko): 로드 성능을 측정합니다. 우수한 사용자 경험을 제공하려면 페이지가 로드되기 시작한 지 [첫 2.5초 이내에 LCP가 발생](https://web.dev/articles/lcp?hl=ko#what-is-a-good-lcp-score)하도록 해야 합니다.
* [다음 페인트에 대한 상호작용(INP)](https://web.dev/articles/inp?hl=ko): 응답성을 측정합니다. 우수한 사용자 환경을 제공하려면 [INP가 200밀리초 미만](https://web.dev/articles/inp?hl=ko#good-score)이 되도록 해야 합니다.
* [누적 레이아웃 이동(CLS)](https://web.dev/articles/cls?hl=ko): 시각적 안정성을 측정합니다. 우수한 사용자 환경을 제공하려면 [CLS 점수가 0.1 미만](https://web.dev/articles/cls?hl=ko#what-is-a-good-cls-score)이 되도록 해야 합니다.

## Core Web Vitals 최적화

다음은 Core Web Vitals를 측정, 모니터링, 최적화하는 데 도움이 되는 몇 가지 리소스입니다.

* [Search Console의 Core Web Vitals 보고서](https://support.google.com/webmasters/answer/9205520?hl=ko)를 확인합니다. 페이지 성능을 확인할 수 있습니다.
* 측정, 디버그, 개선, 권장사항 등 Core Web Vitals 가이드인 [Core Web Vitals](https://web.dev/articles/learn-core-web-vitals?hl=ko)에 대해 자세히 알아보세요.
* [Core Web Vitals를 측정 및 보고](https://web.dev/articles/vitals-tools?hl=ko)하는 데 사용할 수 있는 다양한 도구를 알아보세요. 이러한 도구는 LCP, INP, CLS를 측정합니다.


## Google 블로그의 최신 업데이트

다음은 [Google 검색 센터 블로그](https://developers.google.com/search/blog?hl=ko)에 발표된 Core Web Vitals의 전체 내용입니다.
