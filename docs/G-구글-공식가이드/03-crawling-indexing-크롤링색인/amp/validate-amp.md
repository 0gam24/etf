# AMP 콘텐츠 유효성 검사하기

> **출처(Source):** https://developers.google.com/search/docs/crawling-indexing/amp/validate-amp?hl=ko
> **저작자(Attribution):** Google
> **라이선스(License):** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
> 이 문서는 Google 검색 센터 문서를 Markdown으로 변환한 사본입니다.
> 원문의 최신 내용은 위 출처 링크를 확인하세요.

---

# AMP 콘텐츠 유효성 검사하기

[AMP 콘텐츠를 제작](https://developers.google.com/search/docs/guides/enhance-amp?hl=ko)한 후 이 콘텐츠가 유효한지 확인할 수 있는 몇 가지 방법은 다음과 같습니다.

* [AMP 테스트 도구](https://search.google.com/test/amp?hl=ko)를 사용하여 AMP 콘텐츠가 유효한지 확인합니다.
* [적용 가능한 AMP 콘텐츠 유형](https://developers.google.com/search/docs/guides/about-amp?hl=ko)의 경우 [리치 결과 테스트](https://search.google.com/test/rich-results?hl=ko)를 사용하여 구조화된 데이터가 올바르게 파싱되는지 확인합니다.
* [AMP 상태 보고서](https://search.google.com/search-console/amp?hl=ko)를 통해 사이트에 있는 모든 AMP 페이지의 성능을 모니터링합니다.

## 일반적인 AMP 오류 수정

AMP 페이지가 Google 검색에 표시되지 않는 경우 다음 단계를 시도해 보세요.

**참고**: Google에서 AMP 콘텐츠의 색인을 생성하는 데 시간이 걸릴 수 있습니다.

1. [페이지를 연결하여 콘텐츠 검색이 가능](https://www.ampproject.org/docs/guides/discovery)하도록 합니다.
   * 표준 페이지에 `rel="amphtml"`을 추가하셨나요?
   * 기타 AMP가 아닌 페이지(예: 모바일)에 `rel="amphtml"`을 추가하셨나요?
   * AMP 페이지에 `rel="canonical"`을 추가하셨나요?
2. [AMP 페이지용 Google 검색 가이드라인](https://developers.google.com/search/docs/crawling-indexing/amp?hl=ko)을 따릅니다.
3. Googlebot이 AMP 콘텐츠에 액세스할 수 있게 설정합니다.
   * 사이트의 robots.txt를 수정하여 Googlebot이 구조화된 페이지에 있는 표준 페이지, AMP 페이지, 링크를 크롤링할 수 있게 합니다(해당하는 경우).
   * 표준 및 AMP 콘텐츠에서 모든 robots `meta` 태그와 `X-Robots-Tag` HTTP 헤더를 삭제합니다. 자세한 내용은 [Robots `meta` 태그 및 `X-Robots-Tag` HTTP 헤더 사양](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag?hl=ko)을 참고하세요.
4. 구조화된 데이터가 [페이지 및 기능 유형](https://developers.google.com/search/docs/guides/search-gallery?hl=ko)에 맞게 구조화된 데이터 가이드라인을 준수하고 있는지 확인합니다. AMP의 구조화된 데이터 요구사항을 자세히 알아보려면 [Google 검색의 AMP 정보](https://developers.google.com/search/docs/guides/about-amp?hl=ko)를 참고하세요.

단계를 완료한 후에도 AMP 페이지가 Google 검색에 표시되지 않는 데는 다음과 같은 추가적인 이유가 있습니다.

* 거주 중인 국가에서 Google 검색의 일부 기능을 사용할 수 없는 경우가 있습니다.
* 사이트의 색인이 아직 생성되지 않았을 수 있습니다. 크롤링 및 색인 생성에 관한 자세한 내용은 [크롤링 및 색인 생성 FAQ](https://developers.google.com/search/help/crawling-index-faq?hl=ko)를 참고하세요.

## 리소스

유효성 검사 오류를 디버그하려면 다음 [ampproject.org](https://www.ampproject.org/) 리소스를 참고하세요.

* [AMP 유효성 검사 오류](https://www.ampproject.org/docs/reference/validation_errors)
* [유효성 오류는 어떻게 해결하나요?](https://www.ampproject.org/docs/guides/validate#how-do-i-fix-validation-errors?)
