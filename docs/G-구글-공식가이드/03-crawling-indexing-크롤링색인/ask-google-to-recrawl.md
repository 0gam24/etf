# Google에 URL 재크롤링 요청하기

> **출처(Source):** https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl?hl=ko
> **저작자(Attribution):** Google
> **라이선스(License):** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
> 이 문서는 Google 검색 센터 문서를 Markdown으로 변환한 사본입니다.
> 원문의 최신 내용은 위 출처 링크를 확인하세요.

---

# Google에 URL 재크롤링 요청하기

호스팅된 콘텐츠 관리 플랫폼(예: Blogger 또는 WordPress)을 사용하고 있나요? 대부분의 경우 플랫폼에서 새로운 콘텐츠를 검색엔진에 자동으로 제출합니다. 플랫폼의 지원 도움말을 확인하세요.

최근 사이트에서 페이지를 추가하거나 변경한 경우 다음 중 한 가지 방법을 사용하여 Google에 페이지의 색인을 다시 생성하도록 요청할 수 있습니다. 본인이 관리하지 않는 URL은 색인 생성을 요청할 수 없습니다.

크롤링은 며칠에서 몇 주까지 걸릴 수 있습니다. 크롤링이 완료될 때까지 기다리는 동안 [색인 상태 보고서](https://support.google.com/webmasters/answer/7440203?hl=ko) 또는 [URL 검사 도구](https://support.google.com/webmasters/answer/9012289?hl=ko)를 사용하여 진행 상황을 모니터링하세요.

크롤링을 요청해도 검색결과에 즉시 또는 전혀 포함되지 않을 수 있습니다. Google 시스템은 고품질의 유용한 콘텐츠를 빠르게 포함하는 것을 최우선으로 생각합니다.

## URL 검사 도구 사용(소수의 URL을 제출하는 경우)

개별 URL 크롤링을 요청하려면 [URL 검사 도구](https://support.google.com/webmasters/answer/9012289?hl=ko#request_indexing)를 사용하세요.
URL 검사 도구에서 색인 생성을 요청하려면 [Search Console 속성의 소유자 또는 전체 권한 사용자](https://support.google.com/webmasters/answer/7687615?hl=ko)여야 합니다.

개별 URL을 제출하는 데는 할당량이 있으며, 동일한 URL에 재크롤링을 여러 번 요청하더라도 더 빨리 크롤링되지는 않습니다.

## 사이트맵 제출(한 번에 여러 URL을 제출하는 경우)

URL 수가 많으면 사이트맵을 제출하세요. 사이트맵을 사용하면 Google에서 사이트의 URL을 발견할 수 있습니다. 사이트를 방금 출시했거나 최근에 [사이트 이전](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes?hl=ko)을 수행한 경우 매우 유용할 수 있습니다. 사이트맵에는 대체 언어 버전 및 동영상, 이미지, 뉴스별 페이지에 관한 추가 메타데이터도 포함될 수 있습니다.
[사이트맵을 만들고 제출하는 방법 알아보기](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap?hl=ko)
