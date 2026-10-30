# Google 검색의 URL 구조 권장사항

> **출처(Source):** https://developers.google.com/search/docs/crawling-indexing/url-structure?hl=ko
> **저작자(Attribution):** Google
> **라이선스(License):** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
> 이 문서는 Google 검색 센터 문서를 Markdown으로 변환한 사본입니다.
> 원문의 최신 내용은 위 출처 링크를 확인하세요.

---

# Google 검색의 URL 구조 권장사항

Google 검색에서 사이트를 효과적으로 크롤링할 수 있도록 하려면 크롤링이 가능하며 다음 요구사항을 충족하는 URL 구조를 사용하세요. URL이 다음 기준을 충족하지 않으면 Google 검색에서 사이트를 비효율적으로 크롤링할 가능성이 높습니다(극도로 높은 크롤링 속도 또는 아예 크롤링되지 않음 등).

| 크롤링 가능한 URL 구조의 요구사항 | |
| --- | --- |
| [IETF STD 66](https://datatracker.ietf.org/doc/std66/) 준수 | Google 검색은 [IETF STD 66](https://datatracker.ietf.org/doc/std66/)에 정의된 URL을 지원합니다. 표준에 따라 [예약됨](https://www.rfc-editor.org/rfc/rfc3986#section-2.2)으로 정의된 문자는 [퍼센트 인코딩](https://developer.mozilla.org/docs/Glossary/Percent-encoding)되어야 합니다. |
| URL 프래그먼트를 사용하여 콘텐츠를 변경하지 않음 | Google 검색은 일반적으로 URL 프래그먼트를 지원하지 않습니다. 그러므로 [프래그먼트](https://wikipedia.org/wiki/URI_fragment)를 사용하여 페이지의 콘텐츠를 변경하지 마세요. 다음은 URL 프래그먼트의 예입니다.     ``` https://example.com/#/potatoes ```   JavaScript를 사용하여 콘텐츠를 변경하고 있다면 JavaScript 대신 [History API를 사용](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics?hl=ko#use-history-api)하세요. |
| URL 매개변수에 일반적 인코딩 사용 | URL 매개변수를 지정할 때는 다음과 같은 일반적인 인코딩을 사용하세요. 등호(`=`)를 사용하여 키-값 쌍을 구분하고 앰퍼샌드(`&`)를 사용하여 매개변수를 추가합니다. 키-값 쌍 내에 동일한 키의 값을 여러 개 나열하려면 쉼표(`,`)와 같이 [IETF STD 66](https://datatracker.ietf.org/doc/std66/)과 충돌하지 않는 문자를 사용하면 됩니다.   | 권장 | 권장하지 않음 | | --- | --- | | 등호(`=`)를 사용하여 키-값 쌍을 구분하고 앰퍼샌드(`&`)를 사용하여 매개변수를 추가합니다.    ``` https://example.com/category?category=dresses&sort=low-to-high&sid=789 ``` | 콜론(`:`)을 사용하여 키-값 쌍을 구분하고 각괄호(`[ ]`)를 사용하여 매개변수를 추가합니다.    ``` https://example.com/category?[category:dresses][sort:price-low-to-high][sid:789] ``` | | 쉼표(`,`)를 사용하여 동일한 키의 여러 값을 나열하고, 등호(`=`)를 사용하여 키-값 쌍을 구분하고, 앰퍼샌드(`&`)를 사용하여 매개변수를 추가합니다.    ``` https://example.com/category?category=dresses&color=purple,pink,salmon&sort=low-to-high&sid=789 ``` | 쉼표 한 개(`,`)를 사용하여 키-값 쌍을 구분하고 쉼표 두 개(`,,`)를 사용하여 매개변수를 추가합니다.    ``` https://example.com/category?category,dresses,,sort,lowtohigh,,sid,789 ``` | |

## URL 구조를 쉽게 이해할 수 있게 만들기

Google 검색 과 사용자이 사이트를 더 잘 이해할 수 있도록 URL 구조를 간단하게 만드세요. 가능한 경우 다음 권장사항을 적용하는 것이 좋습니다.

콘텐츠를 정리하여 URL을 논리적이고 가장 이해하기 쉬운 방식으로 구성하는 것이 좋습니다. 사이트 전체의 구조에 관한 자세한 내용은 [SEO 기본 가이드의 이 섹션](https://developers.google.com/search/docs/fundamentals/seo-starter-guide?hl=ko#group-topically)을 참고하세요.

| 권장사항 | |
| --- | --- |
| 설명 URL 사용하기 | 가능하면 URL에 긴 ID 숫자보다는 읽을 수 있는 단어를 사용하세요.   | 권장(간단하고 설명이 포함된 단어) | 권장하지 않음(읽을 수 없는 긴 ID 번호) | | --- | --- | | ``` https://example.com/wiki/Aviation ``` | ``` https://example.com/index.php?topic=42&area=3a5ebc944f41daa6f849f730f1 ``` | |
| 잠재고객의 언어 사용 | URL에 잠재고객의 언어로 된 단어(해당하는 경우 음역된 단어)를 사용합니다. 예를 들어 잠재고객이 독일어로 검색하는 경우 URL에 독일어 단어를 사용하세요.     ``` https://example.com/lebensmittel/pfefferminz ```   또는 잠재고객이 일본어로 검색하는 경우 URL에 일본어 단어를 사용합니다.     ``` https://example.com/ペパーミント ``` |
| 필요에 따라 퍼센트 인코딩 사용 | [사이트의 페이지에 링크](https://developers.google.com/search/docs/crawling-indexing/links-crawlable?hl=ko)할 때 필요한 경우 링크의 `href` 속성에 퍼센트 인코딩을 사용하세요. 예약되지 않은 ASCII 문자는 인코딩되지 않은 형식으로 남을 수 있습니다. 또한 ASCII가 아닌 범위에 해당하는 문자는 퍼센트 인코딩되어야 합니다. 예를 들면 다음과 같습니다.   | 권장(백분율 인코딩) | 권장하지 않음(ASCII가 아닌 문자) | | --- | --- | | ``` https://example.com/%D9%86%D8%B9%D9%86%D8%A7%D8%B9/%D8%A8%D9%82%D8%A7%D9%84%D8%A9 ``` | ``` https://example.com/نعناع ``` | | ``` https://example.com/%E6%9D%82%E8%B4%A7/%E8%96%84%E8%8D%B7 ``` | ``` https://example.com/杂货/薄荷 ``` | | ``` https://example.com/gem%C3%BCse ``` | ``` https://example.com/gemüse ``` | | ``` https://example.com/%F0%9F%A6%99%E2%9C%A8 ``` | ``` https://example.com/🦙✨ ``` | |
| 단어 구분 시 하이픈 사용 | 가능하면 URL에서 단어를 구분하는 것이 좋습니다. 특히 밑줄(`_`) 대신 하이픈(`-`)을 사용하여 URL에서 단어를 구분하는 것이 좋습니다. 사용자와 검색엔진이 URL의 개념을 더 잘 식별할 수 있기 때문입니다. 밑줄은 사용하지 않는 것이 좋습니다. 함께 표시해야 하는 개념을 나타낼 때 밑줄 스타일이 이미 널리 사용되고 있기 때문입니다. 예를 들어 다양한 프로그래밍 언어에서 함수 이름을 `format_date`와 같이 표시합니다.   | 권장 | 권장하지 않음 | | --- | --- | | 하이픈(`-`)을 사용하여 단어를 구분합니다.     ``` https://example.com/summer-clothing/filter?color-profile=dark-grey ``` | 밑줄(`_`)을 사용하여 단어를 구분합니다.     ``` https://example.com/summer_clothing/filter?color_profile=dark_grey ```   URL에서 단어를 연결합니다.     ``` https://example.com/greendress ``` | |
| 매개변수를 최대한 적게 사용 | 가능하면 불필요한 매개변수(콘텐츠를 변경하지 않는 매개변수)를 삭제하여 URL의 길이를 줄입니다. |
| URL은 대소문자를 구분함 | IETF STD 66을 준수하는 다른 HTTP 클라이언트와 마찬가지로 Google 검색의 URL 처리는 대소문자를 구분합니다. 예를 들어 Google은 `/APPLE`과 `/apple`을 모두 자체 콘텐츠가 있는 고유한 URL로 취급합니다. URL의 대소문자 텍스트가 웹 서버에서 동일하게 처리되는 경우 모든 텍스트의 대소문자를 동일하게 변환하세요. 그러면 Google에서 URL이 동일한 페이지를 참조하는지 더 쉽게 판단할 수 있습니다. |
| 다지역 사이트의 경우 | 다지역 사이트인 경우 사이트를 쉽게 지역 타겟팅할 수 있는 URL 구조를 사용하는 것이 좋습니다. URL 구조화 방법에 관한 더 많은 예시는 [언어별 URL 사용](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites?hl=ko#locale-specific-urls)을 참고하세요.  권장(국가별 도메인 사용):     ``` https://example.de ```   권장(gTLD를 포함하는 국가별 하위 디렉터리 사용):     ``` https://example.com/de/ ``` |

## URL 관련 일반적인 문제 방지

여러 개의 매개변수를 포함하고 있는 URL과 같이 지나치게 복잡한 URL은 동일하거나 유사한 사이트 콘텐츠를 가리키는 URL을 불필요하게 많이 생성하므로 크롤러에 문제를 일으킬 수 있습니다. 그 결과 Googlebot이 필요 이상의 대역폭을 소비하거나 Google 검색이 사이트의 모든 콘텐츠에 대한 색인을 완전히 생성하지 못할 수 있습니다.

URL의 수가 불필요하게 많은 데에는 다음을 포함하여 여러 원인이 있을 수 있습니다.

| 일반적인 문제 | |
| --- | --- |
| 항목 모음 추가 필터링 | 많은 사이트에서 동일한 항목 또는 검색 결과 모음을 다양한 버전의 보기로 제공하여 사용자가 정의된 기준(예: 해변 호텔 보여줘)을 사용하여 이러한 모음을 필터링할 수 있도록 합니다. 그런데 헬스클럽이 있는 해변가 호텔과 같은 필터링 기준을 추가하면 사이트의 URL 수(데이터 보기)가 폭발적으로 증가합니다. Googlebot은 각 호텔 페이지로 이동 가능한 목록 중 몇 개만 보면 되기 때문에 약간씩 다른 호텔 목록을 많이 만들면 목록이 중복됩니다. 예를 들면 다음과 같습니다.   * '특가'의 호텔 시설:      ```   https://example.com/hotel-search-results.jsp?Ne=292&N=461   ``` * '특가'의 해변 호텔 시설:      ```   https://example.com/hotel-search-results.jsp?Ne=292&N=461+4294967240   ``` * '특가'의 헬스클럽이 있는 해변 호텔 시설:      ```   https://example.com/hotel-search-results.jsp?Ne=292&N=461+4294967240+4294967270   ``` |
| 관련 없는 매개변수 | 관련 없는 매개변수가 URL에 있으면 다음과 같이 URL이 다량 생성될 수 있습니다.   * 추천 매개변수:      ```   https://example.com/search/noheaders?click=6EE2BF1AF6A3D705D5561B7C3564D9C2&clickPage=OPD+Product+Page&cat=79   ```          ```   https://example.com/discuss/showthread.php?referrerid=249406&threadid=535913   ```          ```   https://example.com/products/products.asp?N=200063&Ne=500955&ref=foo%2Cbar&Cn=Accessories   ``` * 쇼핑 정렬 매개변수:      ```   https://example.com/results?search_type=search_videos&search_query=tpb&search_sort=relevance&search_category=25   ``` * 세션 ID:      ```   https://example.com/search/noheaders?sessionid=6EE2BF1AF6A3D705D5561B7C3564D9C2   ```    가능하면 URL에 세션 ID를 사용하지 말고 쿠키를 사용합니다.   [robots.txt 파일](https://developers.google.com/search/docs/crawling-indexing/robots/intro?hl=ko)을 사용하여 이러한 문제가 있는 URL에 Googlebot이 액세스할 수 없도록 차단하는 것이 좋습니다. |
| 캘린더 문제 | 동적으로 생성된 캘린더는 시작일 또는 종료일에 제한이 없는 미래의 날짜 및 과거의 날짜로 연결되는 링크를 생성할 수 있습니다. 예를 들면 다음과 같습니다.     ``` https://example.com/calendar.php?d=13&m=8&y=2011 ```   사이트의 캘린더가 무한대인 경우 동적으로 생성되는 미래의 캘린더 페이지로 연결되는 링크에 `nofollow` 속성을 추가합니다. |
| 깨진 상대적 링크 | 존재하지 않는 페이지에 올바른 HTTP 상태 코드로 서버가 응답하지 않는 경우 잘못된 페이지에 [상위 상대 링크](https://developer.mozilla.org/en-US/docs/Web/API/URL_API/Resolving_relative_references#parent-directory_relative)를 배치하면 무한한 공백이 생성될 수 있습니다. 예를 들어 `https://example.com/category/community/070413/html/FAQ.htm`의 `<a href="../../category/stuff">...</a>`와 같은 상위 상대 링크로 인해 `https://example.com/category/community/category/stuff`와 같은 잘못된 URL이 만들어질 수 있습니다. 이 문제를 해결하려면 링크에서 상위 상대 URL 대신 루트 상대 URL을 사용하세요. |

## 크롤링 관련 URL 구조 문제 해결

Google 검색에서 이러한 문제가 있는 URL을 크롤링하고 있다면 다음 조치를 취해 보세요.

* [robots.txt 파일](https://developers.google.com/search/docs/crawling-indexing/robots/intro?hl=ko)을 사용하여 Googlebot이 [문제가 되는 URL](#common-issues)에 액세스할 수 없도록 차단합니다. 일반적으로 검색 결과를 생성하는 URL과 같은 동적 URL이나 캘린더와 같이 무한대의 공간을 만드는 URL, 정렬 및 필터링 함수를 차단하는 것이 좋습니다.
* 사이트에 속성 탐색이 있는 경우 [속성 탐색 URL의 크롤링을 관리](https://developers.google.com/search/docs/crawling-indexing/crawling-managing-faceted-navigation?hl=ko#prevent-crawling-of-faceted-navigation-urls)하는 방법을 알아보세요.
