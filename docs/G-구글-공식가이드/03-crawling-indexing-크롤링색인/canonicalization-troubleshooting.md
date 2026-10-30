# 표준화 문제 해결하기

> **출처(Source):** https://developers.google.com/search/docs/crawling-indexing/canonicalization-troubleshooting?hl=ko
> **저작자(Attribution):** Google
> **라이선스(License):** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
> 이 문서는 Google 검색 센터 문서를 Markdown으로 변환한 사본입니다.
> 원문의 최신 내용은 위 출처 링크를 확인하세요.

---

# 표준화 문제 해결하기

[URL 검사 도구](https://support.google.com/webmasters/answer/9012289?hl=ko#google-selected-canonical)를 사용하여 [Google에서 표준으로 간주하는 페이지](https://developers.google.com/search/docs/crawling-indexing/canonicalization?hl=ko)를 확인하세요.
표준 페이지를 분명히 지정해도 Google은 콘텐츠 품질 등의 다양한 이유로 다른 표준 페이지를 선택하는 경우도 있습니다. 문제를 해결하기 전에 Google에서 선택한 표준 URL이 내가 선호하는 표준 URL보다 Google 검색에서 유입되는 사용자에게 더 효과가 좋은지 아닌지에 관해 생각해 보세요.

[일반적인 표준화 문제](#common-canonicalization-issues) 섹션에 자세히 설명된 문제와 같은 표준화 문제를 해결하는 것은 결국 [함께 클러스터링](https://developers.google.com/search/docs/crawling-indexing/canonicalization?hl=ko#canonical-how)된 페이지가 충분히 다르도록 하는 것입니다. 주의사항은 다음과 같습니다.

* **재평가에 시간이 걸림:** 콘텐츠 문제를 해결한 후에도 Google에서 **최대 2주** 동안 중복 클러스터에 페이지를 보관할 수 있습니다.
* **콘텐츠 차이가 중요함:** 새 콘텐츠와 다른 클러스터링된 페이지 간의 차이가 명확하고 큰 경우 페이지가 더 빨리 분할됩니다.

콘텐츠 문제를 해결한 후 [Search Console URL 테스트 도구의 색인 생성 요청 기능](https://support.google.com/webmasters/answer/9012289?hl=ko#zippy=,request-indexing)을 사용하여 Google에 클러스터링된 페이지를 다시 평가해 달라고 요청할 수 있습니다. 하지만 이 기능에는 할당량이 적용되므로 가장 중요한 URL에만 사용하세요.

Google에서 선택한 표준 URL이 내가 Google 검색에 표시하고 싶은 표준 URL과 다른 이유는 다양합니다. 가장 흔히 발생하는 문제는 다음과 같습니다.

| 일반적으로 발생하는 표준화 문제 | |
| --- | --- |
| 현지화된 주석이 없는 언어 변형 | 여러 웹사이트를 통해 전 세계의 다양한 사용자를 대상으로 사실상 동일한 콘텐츠를 현지화하여 게재하는 경우 [현지화된 사이트에 관한 Google의 가이드라인](https://developers.google.com/search/docs/specialty/international?hl=ko)을 준수해야 합니다. 예를 들어 미국, 영국, 오스트레일리아에 거주하는 영어 사용자를 대상으로 별도의 사이트를 운영하고 있으나 게재하는 콘텐츠는 동일한 경우, 페이지에 `hreflang` 주석을 추가하면 서로 다른 지역의 사용자에게 적합한 페이지를 표시하는 데 도움이 됩니다. |
| 잘못 사용된 표준 요소 | 일부 콘텐츠 관리 시스템(CMS) 또는 CMS 플러그인에서 표준화 기술을 잘못 사용하여 외부 웹사이트의 URL을 가리키는 경우가 있습니다. 브라우저의 개발자 도구에서 HTML을 확인하여 이러한 문제가 발생하고 있는지 확인하세요. 사이트의 표준 URL 환경설정이 예상과 다르게 표시된다면 `rel="canonical"` 또는 `3xx` 리디렉션을 잘못 사용한 것일 수 있습니다. 이러한 경우 CMS 제공업체에 연락하여 해당 오류를 신고하세요. |
| 잘못 구성된 서버 | 일부 호스팅이 잘못 구성되면 예기치 못한 교차 도메인 URL 선택이 발생할 수 있습니다. 예를 들면 다음과 같습니다.  * 서버가 잘못 구성되는 바람에 `other.example` URL 요청에 대한 응답으로 `example.com`에 있는 콘텐츠가 반환될 수 있습니다. * 관련 없는 두 웹 서버가 Google이 오류 페이지로 식별하지 못하는 동일한 [`soft 404` 페이지](https://developers.google.com/search/docs/crawling-indexing/troubleshoot-crawling-errors?hl=ko#soft-404-errors)를 반환할 수 있습니다. 이 경우 호스팅 업체에 문의하세요. |
| 악의적인 해킹 | 일부 웹사이트 공격은 HTTP [`3xx` 리디렉션](https://developers.google.com/search/docs/crawling-indexing/301-redirects?hl=ko)을 반환하는 코드를 사용하거나 HTML `<head>` 또는 HTML 헤더에 교차 도메인 `rel="canonical"` `link` 주석을 삽입하는데, 이 주석은 일반적으로 악성 또는 스팸 콘텐츠를 호스팅하는 URL을 가리킵니다. 이러한 경우 Google 알고리즘에서 [해킹당한 웹사이트](https://web.dev/articles/hacked?hl=ko)의 URL 대신 악성 또는 스팸 URL을 선택할 수도 있습니다. |
| 신디케이션 콘텐츠 | 신디케이션 파트너의 중복을 피하려는 사용자에게는 표준 링크 요소 사용이 권장되지 않습니다. 페이지가 서로 크게 다르기 때문입니다. 가장 효과적인 방법은 파트너가 콘텐츠 색인 생성을 차단하는 것입니다. 자세한 내용은 [Google 뉴스에서 기사 중복 방지](https://support.google.com/news/publisher-center/answer/9606800?hl=ko)를 참고하세요. 여기에는 Google 검색에서 신디케이션 콘텐츠 차단에 관한 내용도 안내되어 있습니다. |
| 모방 웹사이트 | 드물긴 하지만, Google 알고리즘이 사용자의 허락 없이 콘텐츠를 호스팅하는 외부 사이트의 URL을 선택할 수 있습니다. 다른 사이트가 저작권법을 위반하고 내 콘텐츠를 복제했다고 생각되면 해당 사이트의 호스트에 연락하여 삭제를 요청할 수 있습니다. 또한 권리를 침해하는 페이지를 검색 결과에서 삭제하도록 Google에 [디지털 밀레니엄 저작권법(Digital Millennium Copyright Act)에 따라 요청을 제출](https://support.google.com/legal/answer/1120734?hl=ko)할 수 있습니다. |

내가 소유하지 않은 Search Console 속성에 표준 URL이 있는 경우 중복 페이지와 관련된 어떤 트래픽도 볼 수 없습니다.
