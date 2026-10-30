# Google 검색결과의 페이지 경험 이해하기

> **출처(Source):** https://developers.google.com/search/docs/appearance/page-experience?hl=ko
> **저작자(Attribution):** Google
> **라이선스(License):** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
> 이 문서는 Google 검색 센터 문서를 Markdown으로 변환한 사본입니다.
> 원문의 최신 내용은 위 출처 링크를 확인하세요.

---

# Google 검색결과의 페이지 경험 이해하기

Google의 핵심 순위 시스템은 우수한 페이지 경험을 제공하는 콘텐츠에 보상을 제공합니다. 사이트 소유자가 Google의 시스템을 효과적으로 활용하려면 페이지 경험의 한 두 가지 측면에만 몰입해서는 안 됩니다. 대신 전반적으로 다양한 측면에서 훌륭한 페이지 경험을 제공하고 있는지 확인하세요.

## 콘텐츠 페이지 경험 자체 평가

다음 질문에 '예'라고 답할 수 있다면 우수한 페이지 경험을 제공하고 있다는 의미입니다.

* 페이지의 Core Web Vitals이 우수한가요?
* 페이지가 안전하게 제공되나요?
* 콘텐츠가 휴대기기에서 제대로 표시되나요?
* 콘텐츠가 핵심 콘텐츠를 방해하거나 주의를 분산시키는 과도한 수의 광고를 사용하지 않나요?
* 페이지에 방해가 되는 전면 광고를 사용하지 않나요?
* 방문자가 주요 콘텐츠와 다른 콘텐츠를 쉽게 구분할 수 있도록 페이지가 디자인되어 있나요?

이러한 질문이 모든 페이지 경험 측면을 고려하는 것은 아닙니다.
하지만 이와 같은 질문을 던져 보고, 아래의 리소스를 확인하면 전반적인 우수한 페이지 경험을 제공하는 데 도움이 될 수 있습니다.

## 페이지 경험 리소스

다음은 페이지 경험을 측정, 모니터링, 최적화하는 데 도움이 되는 몇 가지 리소스입니다.

* [Core Web Vitals 및 Google 검색 결과 이해하기](https://developers.google.com/search/docs/appearance/core-web-vitals?hl=ko): Core Web Vitals 및 Google 검색 결과에서의 Core Web Vitals의 작동 방식에 관해 자세히 알아보세요.
* [Search Console의 HTTPS 보고서](https://support.google.com/webmasters/answer/11396518?hl=ko):
  보안 HTTPS 페이지를 제공하고 있는지 확인하고, 제공하고 있지 않다면 무엇을 수정해야 하는지 확인합니다.
* [사이트 연결이 안전한지 확인하기](https://support.google.com/chrome/answer/95617?hl=ko): Chrome에서 보고하는 사이트 연결이 안전한지 확인하는 방법을 자세히 알아보세요.
  페이지가 HTTPS를 통해 제공되지 않는 경우 [HTTPS를 통해 사이트를 보호](https://web.dev/articles/enable-https?hl=ko)하는 방법을 알아보세요.
* [방해가 되는 전면 광고 및 대화상자 방지하기](https://developers.google.com/search/docs/appearance/avoid-intrusive-interstitials?hl=ko): 콘텐츠의 접근성을 떨어뜨릴 수 있는 전면 광고를 방지하는 방법을 자세히 알아보세요.
* [Chrome Lighthouse:](https://developer.chrome.com/docs/lighthouse/overview?hl=ko)
  Chrome의 이 도구 모음을 사용하면 모바일 사용 편의성을 비롯하여 페이지 경험과 관련된 다양한 개선사항을 파악할 수 있습니다.

## FAQ

### Google 검색에서 순위 지정에 사용하는 단일 '페이지 경험 신호'가 있나요?

단일 신호는 없습니다. Google의 핵심 순위 시스템은 전반적인 페이지 경험에 부합하는 다양한 신호를 확인합니다.

### 페이지 경험의 어떤 측면이 순위 결정에 사용되나요?

Google 검색 순위 시스템에서는 Core Web Vitals가 사용됩니다.
사이트 소유자는 Google 검색을 효과적으로 활용하고 전체적으로 우수한 사용자 환경을 제공하려면 Core Web Vitals를 우수한 상태로 유지하는 것이 좋습니다.
Search Console의 [Core Web Vitals 보고서](https://support.google.com/webmasters/answer/9205520?hl=ko)와 같은 보고서 또는 서드 파티 도구에서 좋은 결과를 얻었다고 해서 페이지가 Google 검색 결과 상단에 표시된다고 보장할 수는 없습니다. Core Web Vitals 점수만으로는 우수한 페이지 경험을 전부 나타낼 수 없기 때문입니다.
이 점수는 사용자를 위해 사이트를 개선하는 데 도움을 주기 위한 것으로, 검색엔진 최적화만을 위해 Core Web Vitals에서 완벽한 점수를 얻으려고 하는 것은 시간 낭비일 수 있습니다.

Core Web Vitals 외에 다른 페이지 경험과 관련된 측면은 웹사이트의 검색 결과 순위를 높이는 데 직접적인 도움이 되지 않습니다.
그러나 이러한 측면들은 사용자의 웹사이트 만족도를 높여 줄 수 있으며, 이는 일반적으로 Google의 순위 시스템에서 보상하는 것과 일치합니다.
그러니 전반적인 페이지 경험을 개선하기 위해 노력할 가치가 있습니다.

### 페이지 경험은 사이트 전체 또는 페이지별로 평가되나요?

Google의 핵심 순위 시스템은 일반적으로 페이지 경험과 관련된 측면을 파악하는 경우를 비롯하여 페이지별로 콘텐츠를 평가합니다. 하지만 사이트 전체 평가도 있습니다.

### 페이지 경험이 성공적인 순위 결정에 어떤 영향을 미치나요?

Google 검색은 페이지 경험이 평균 이하인 경우에도 항상 가장 관련성 높은 콘텐츠를 표시하려고 합니다. 그러나 유용한 콘텐츠가 많은 쿼리가 많습니다. 이러한 경우 우수한 페이지 경험을 제공하는 것이 Google 검색에서 성공을 거두는 데 큰 도움이 됩니다.


## Google 블로그의 최신 업데이트

다음은 [Google 검색 센터 블로그](https://developers.google.com/search/blog?hl=ko)에 발표된 페이지 경험 업데이트의 전체 내용입니다.
