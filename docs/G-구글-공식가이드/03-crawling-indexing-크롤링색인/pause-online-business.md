# 일시적으로 웹사이트 일시중지 또는 사용 중지

> **출처(Source):** https://developers.google.com/search/docs/crawling-indexing/pause-online-business?hl=ko
> **저작자(Attribution):** Google
> **라이선스(License):** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
> 이 문서는 Google 검색 센터 문서를 Markdown으로 변환한 사본입니다.
> 원문의 최신 내용은 위 출처 링크를 확인하세요.

---

# 일시적으로 웹사이트 일시중지 또는 사용 중지

주문을 처리할 수 없거나 재고가 없는 제품이 많은 상황이라면 일시적으로 온라인 비즈니스를 닫는 것을 고려해 보세요. 상황이 일시적인 경우 즉,
몇 주 또는 몇 달 내에 제품을 판매할 수 있을 것으로 예상한다면 Google 검색에서 사이트의 입지를 최대한 유지하기 위해
조치를 취하는 것이 좋습니다. 이 가이드에서는 온라인 비즈니스를
안전하게 일시중지하는 방법을 설명합니다.

## 사이트 기능 제한(권장)

상황이 일시적이며 온라인 비즈니스를 다시 운영할 계획이라면 사이트를 온라인 상태로 유지하고
기능을 제한하는 것이 좋습니다. 이 방법은 Google 검색에서 사이트의 입지에 미치는
부정적인 영향을 최소화한다는 점에서 권장됩니다. 사용자는 계속해서
내 제품을 찾거나, 리뷰를 읽거나, 제품을 위시리스트에 추가하여 나중에 구매할 수 있습니다. 다음 권장사항을
참고하세요.

* **장바구니 기능 사용 중지**: 장바구니 기능을 사용 중지하는 것은
  가장 간단한 조치이며 Google 검색에서 사이트 공개 상태에 영향을 주지 않습니다.
* **배너 또는 팝업 표시**: 방문 페이지를 포함한 모든 페이지에 배너 또는 팝업을 표시하면 사용자에게
  사이트 상태를 빠르고 명확하게 알릴 수 있습니다. 사용자가 적절하게 예상할 수 있도록
  일반적인 지연 및 드물게 발생하는 지연, 배송 시간, 방문 수령 또는 배송 옵션을
  언급하세요.
  배너 또는 팝업 콘텐츠가 Google 검색결과의 스니펫에 표시되지 않게 하려면
  [`data-nosnippet` HTML 속성](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag?hl=ko#data-nosnippet-attr)을 사용하세요.
  Google의
  [팝업 및 배너 관련 가이드라인](https://developers.google.com/search/docs/appearance/avoid-intrusive-interstitials?hl=ko)을
  따르시기 바랍니다.
* **구조화된 데이터 업데이트**: 사이트에서 구조화된 데이터(예: [`Product`](https://developers.google.com/search/docs/appearance/structured-data/product?hl=ko), [`Book`](https://developers.google.com/search/docs/appearance/structured-data/book?hl=ko), [`Event`](https://developers.google.com/search/docs/appearance/structured-data/event?hl=ko))를 사용하는 경우 현재 제품 재고를 반영하거나 이벤트를 취소로 변경하는 등 적절하게 데이터를 조정해야 합니다. 오프라인 매장이 있는 경우 현재 영업시간을 반영하도록 [구조화된 지역 비즈니스 데이터](https://developers.google.com/search/docs/appearance/structured-data/local-business?hl=ko)를 업데이트하세요.
* **판매자 센터 피드 확인**: 판매자 센터를 사용하는 경우
  [재고 속성
  권장사항](https://support.google.com/merchants/answer/6324448?hl=ko)을 따르세요.
* **Google에 업데이트 알리기**: Google에 제한된 개수의 페이지(예: 홈페이지)를 재크롤링하도록 요청하려면 [Search Console](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl?hl=ko)을 사용하세요. 페이지 수가 많다면(예: 모든 제품 페이지) [사이트맵을
  사용](https://developers.google.com/search/docs/guides/submit-URLs?hl=ko)하세요.

## 권장하지 않음: 전체 웹사이트 사용 중지

**경고**: Google 시스템은 견고하며 일시적인 문제에서 웹사이트를 복구하는 데
도움이 되도록 설계되었습니다. 그러나 Google 색인에서 사이트를 완전히 삭제하는 것은
복구하는 데 상당한 시간이 걸릴 수 있는 중대한 변경사항입니다. 완전히
삭제된 사이트를 복구하는 데 걸리는 시간은 정해져 있지 않으며 복구 속도를 높일
메커니즘도
없습니다. 그렇기 때문에 Google 검색에서 사이트를 삭제하는 대신 기능을 제한하는 것을
적극 권장합니다.

웹사이트 전체를 사용 중지할 수도 있습니다. 이는 아주 짧은 기간(최대 2~3일 정도)에만
취해야 하는 극단적인 조치입니다. 그러지 않으면 올바르게 구현하더라도 Google 검색에서
웹사이트에 **중대한 영향**을 미칠 수 있습니다.

전체 사이트를 사용 중지할 때는 다음과 같은 부작용을 고려해야 합니다.

* 고객이 온라인에서 비즈니스를 찾을 수 없는 경우
  비즈니스의 상황을 전혀 알 수 없습니다.
* 고객이 비즈니스에서 직접 제공하는 정보를
  찾거나 읽을 수 없으며 사례, 리뷰, 사양, 수리 안내 또는
  설명서를
  찾을 수 없습니다. 제3자가 제공하는 정보는 비즈니스에서 직접 제공하는 정보만큼 정확하거나 포괄적이지
  않을 수 있습니다. 이는 주로 향후 구매 결정에도 영향을 미칩니다.
* 지식 패널에서 문의 전화번호나 사이트 로고와 같은 정보가
  삭제될 수 있습니다.
* Search Console 확인을 통과하지 못하게 되며 Google 검색에서 비즈니스에 관한
  정보에 전혀 액세스할 수 없게 됩니다. 색인에서 페이지가 누락되면
  Search Console의 집계 보고서에서
  데이터가 사라집니다.
* 오랜 시간이 지난 뒤에 사이트를 다시 시작하려면 먼저 웹사이트의 색인을 다시 생성해야 하므로 훨씬 어렵습니다. 또한
  이 작업이 얼마나 오래 걸릴지, 이후에 Google 검색에서 사이트가
  이전과
  비슷하게 표시될지도 확실하지 않습니다.

**권장되지 않음**에도 불구하고 웹사이트 전체를 사용 중지해야 한다면 다음과 같은
몇 가지 옵션이 있습니다.

* 1~2일 동안 긴급하게 사이트를 사용 중지해야 한다면 모든 콘텐츠 대신 [`503`HTTP 응답 상태 코드](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/503)가 포함된 정보 제공용 오류 페이지를 반환하세요. [사이트 사용 중지 권장사항](#best-practices-disabling-site)을 따르시기 바랍니다.
* 사이트를 사용 중지하는 시간이 더 길어야 한다면 `200` HTTP 상태 코드를 사용하여 색인 생성이 가능한 홈페이지를 사용자가 Google 검색에서 찾을 자리표시자로 제공합니다.
* 이러한 옵션을 고려하는 동안 Google 검색에서 사이트를 신속하게 숨겨야 한다면 [Google 검색에서 웹사이트를 일시적으로 삭제](https://support.google.com/webmasters/answer/9689846?hl=ko)할 수 있습니다.

### 사이트 사용 중지 권장사항

**경고**: 페이지에서 `503` HTTP 응답 상태 코드를 반환하는 경우 Google 시스템에서 웹사이트에 포함된 제목, 설명, 메타데이터 또는 구조화된 데이터를 새로고침할 수 없습니다

사이트를 사용 중지하는 것을 권장하지 않지만 사용 중지해야 한다면 다음 권장사항을 확인하세요.

* robots.txt 파일을 통해 크롤링을 계속 허용하세요. **robots.txt 파일에 `503` HTTP 응답 상태 코드를 반환하지 마세요. 모든 크롤링이 차단됩니다**.
* [curl](https://curl.haxx.se/docs/manpage.html) 또는 유사한 도구를 사용하여 `503` HTTP 응답 상태 코드를 로컬로 확인합니다. 예를 들면 다음과 같습니다.

  ```
  curl -I -X GET "https://www.example.com/"
  HTTP/1.1 503 Service Unavailable
  Mime-Version: 1.0
  Content-Type: text/html
  (...)
  ```
* `503` 오류 페이지의 서버 측 및 클라이언트 측 로드를 최소화하려면 다음 권장사항을 따르세요.
  + [`retry-after` HTTP 헤더](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Retry-After)를
    사용하여 최선의 날짜 또는 기간을 명시하세요.
  + 정적 HTML을 사용하세요.
  + 페이지 외 리소스를 최소화하세요. 인라인 CSS 스타일시트와 64진법 인코딩 이미지를 사용하세요.
* 오류 페이지의 콘텐츠를 통해 사용자에게 향후 단계를 명확하게 안내하세요. 다음이
  포함될 수 있습니다.
  + 추가 정보 링크
  + 웹사이트를 다시 온라인 상태로 운영할 것으로 예상하는 날짜 또는 관련 정보가 업데이트되는 날짜
  + 고객 서비스에 문의하는 방법
* robots.txt 파일에서 모든 크롤링을 차단하지 마세요. 모든 크롤링을 차단하는 유효한 robots.txt 파일을
  반환하면 웹사이트의 콘텐츠와 URL이 Google 검색에서
  삭제될 수
  있습니다.
* `403`, `404`, `410` HTTP 상태 코드를 반환하거나 `noindex` robots `meta` 태그 또는 x-robots-tag
  HTTP 헤더를 사용하여 웹사이트를 차단하지 마세요. 이렇게 하면
  Google 검색에서 웹사이트 URL이 삭제됩니다.
* 사이트를 닫는 데 Search Console의 임시 웹사이트 삭제 도구를 사용하지 마세요. 이렇게 하면
  사용자가 웹사이트를 찾지 못하므로 웹사이트의 상태를 알 수 없습니다. 또한
  비즈니스 제품의 잠재적 리셀러 또는 제휴사가 Google 검색에 계속
  표시될 수 있습니다.
* `503` HTTP 응답 상태 코드로 robots.txt 파일을 차단하지 마세요.

## FAQ

### 사이트를 몇 주 동안만 닫으면 어떻게 되나요?

단 몇 주라도 사이트를 완전히 닫으면 Google의 사이트 색인 생성에 부정적인 결과가 생길 수 있습니다. 대신 [사이트 기능을 제한](#limit-site)하는 것이 좋습니다. 현재 판매가 이루어지지 않는 상황이더라도 사용자는 제품, 서비스, 회사에 관한 정보를 확인하고자 할 수 있습니다.

### 필수품이 아닌 제품을 모두 제외하려면 어떻게 해야 하나요?

문제없습니다. [사이트 기능을 제한](#limit-site)하여 필수품이 아닌 제품을 구매할 수 없도록 하세요.

### 사이트를 일시적으로 닫는 동안 Google에 크롤링을 더 적게 해 달라고 요청할 수 있나요?

예, [Googlebot 크롤링 속도를 줄일](https://developers.google.com/search/docs/guides/reduce-crawl-rate?hl=ko) 수 있지만 대부분의 경우 권장되지 않습니다. 크롤링을 제한하면 Google 검색결과의 업데이트 빈도에 영향을 줄 수 있습니다. 예를 들어 Google 검색에 현재 비즈니스의 모든 제품을 구매할 수 없다는 정보가 반영되는 데 시간이 더 오래 걸릴 수 있습니다. 반면에 Googlebot의 크롤링이 중대한 서버 리소스 문제를 일으키는 경우에는 크롤링 제한이 효과가 있습니다. 비즈니스를 재개할 준비가 되면 크롤링 속도를 재설정할 수 있도록 알림을 설정하는 것이 좋습니다.

### 페이지 색인 생성 또는 업데이트를 빠르게 받으려면 어떻게 해야 하나요?

[Google에 제한된 개수의 페이지(예: 홈페이지)를 재크롤링하도록 요청하려면](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl?hl=ko) Search Console을 사용하세요.
페이지 수가 많다면(예: 모든 제품 페이지) [사이트맵을
사용](https://developers.google.com/search/docs/guides/submit-URLs?hl=ko)하세요.

### 특정 지역에서 내 사이트에 액세스하지 못하게 차단하면 어떻게 되나요?

Google은 일반적으로 미국에서 크롤링하므로 미국을 차단하면 Google 검색에서 사이트에 전혀 액세스할 수 없습니다. 전체 지역의 사이트 액세스를 일시적으로 차단하는 것은 권장하지 않습니다. 대신 해당 지역의 [사이트 기능을 제한](#limit-site)하는 것이 좋습니다.

### 재고가 없는 제품을 삭제하려면 [삭제 도구](https://support.google.com/webmasters/answer/9689846?hl=ko)를 사용해야 하나요?

아니요. 삭제 도구를 사용하면 고객이 Google 검색에서 비즈니스가 직접 제공하는 정보를 찾을 수 없으며, 제3자가 제공하는 제품 정보가 있을 수 있으나 이는 부정확하거나 불완전할 가능성이 있습니다. 페이지를 계속 운영하면서 제품을 재고 없음으로 표시하는 것이 좋습니다. 이렇게 하면 고객이 제품을 구매할 수 없더라도 상황을 파악할 수 있습니다. Google 검색에서 제품을 삭제하면 고객은 제품이 사라진 이유를 알 수 없습니다.
