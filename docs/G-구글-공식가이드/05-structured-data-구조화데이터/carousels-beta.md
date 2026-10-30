# 구조화된 데이터 캐러셀(베타)

> **출처(Source):** https://developers.google.com/search/docs/appearance/structured-data/carousels-beta?hl=ko
> **저작자(Attribution):** Google
> **라이선스(License):** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
> 이 문서는 Google 검색 센터 문서를 Markdown으로 변환한 사본입니다.
> 원문의 최신 내용은 위 출처 링크를 확인하세요.

---

# 구조화된 데이터 캐러셀(베타)

Google에서는 [구조화된 데이터](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data?hl=ko)를 사용하여 페이지의 콘텐츠를 파악하고 검색 결과에서 해당 콘텐츠를 더욱 다채로운 방식으로 노출하며 이를 *리치 결과*라고 합니다. 이 가이드에서는 [베타 버전인 새로운 캐러셀 리치 결과](https://developers.google.com/search/blog/2024/02/search-experiences-in-eea?hl=ko)에 중점을 둡니다. 이는 사용자가 가로로 스크롤하여 특정 사이트 (호스트 캐러셀이라고도 함)에서 더 많은 항목을 볼 수 있는 목록과 유사한 리치 결과입니다. 캐러셀의 각 타일에는 페이지에 있는 항목의 가격, 평점, 이미지에 관한 사이트 정보가 포함될 수 있습니다.

이 베타 리치 결과를 사용하려면 지원되는 다음 구조화된 데이터 항목 중 하나 이상과 함께 구조화된 `ItemList` 데이터를 추가하세요.

* [`LocalBusiness`](#localbusiness) 및 하위유형. 예를 들면 다음과 같습니다.
  + [`Restaurant`](https://schema.org/Restaurant)
  + [`Hotel`](https://schema.org/Hotel)
  + [`VacationRental`](https://schema.org/VacationRental)
* [`Product`](#product)
* [`Event`](#event)

다음은 지원되는 콘텐츠 유형과 함께 `ItemList` 마크업을 추가하면 Google 검색에서 캐러셀이 표시되는 방식입니다.

![새로운 캐러셀 리치 결과](https://developers.google.com/static/search/blog/images/new-carousel-rich-result.png?hl=ko)

## 기능 제공 여부

이 기능은 베타 버전이므로 개발 과정에서 요구사항이나 가이드라인이 변경될 수 있습니다. 또한 [유럽 경제 지역](https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Glossary:European_Economic_Area_(EEA)#:~:text=See%20EEA%20disambiguation%20page%20for,and%20Norway%3B%20excluding%20Switzerland).)(EEA) 국가, 튀르키예, 남아프리카공화국에서만 데스크톱 및 휴대기기에서 이 기능을 사용할 수 있습니다. EEA 국가에서는 호텔, 공유숙박, 육상 교통, 항공편, 지역 비즈니스, 할 일(이벤트, 투어, 활동), 쇼핑과 관련된 검색어에 대해 이 환경을 사용할 수 있습니다. 튀르키예에서는 호텔, 공유숙박, 지역 비즈니스와 관련된 검색어에 대해서만 이 환경을 사용할 수 있습니다. 남아프리카 공화국에서는 호텔, 공유숙박, 할 일(이벤트, 투어, 활동), 항공편, 쇼핑, 음식 배달, 렌터카, 버스 예약과 관련된 검색어에 대해 이 환경을 사용할 수 있습니다.

비즈니스가 EEA 또는 튀르키예에 기반을 두고 있거나 EEA 또는 튀르키예 사용자에게 서비스를 제공하는 경우 관련 양식을 작성하세요.

* 육상 교통수단, 호텔, 공유숙박, 지역 비즈니스, 할 일(예: 이벤트, 투어, 활동)과 관련된 쿼리인 경우 이 [Google 검색 애그리게이터 기능 신청 양식](https://support.google.com/websearch/contact/search_dma?hl=ko)을 사용하세요.
* 항공편 기능의 경우 이 [항공편 관련 문의 신청 양식](https://support.google.com/travel/contact/flight_queries_interest?hl=ko)을 사용하세요.
* [비교 쇼핑 서비스(CSS) 프로그램이 제공되는 국가](https://support.google.com/css-center/answer/7524491?hl=ko#Supported_countries)의 쇼핑 관련 검색어인 경우 [CSS 프로그램](https://support.google.com/css-center/answer/7524491?hl=ko)을 사용해 보세요.

비즈니스가 남아프리카 공화국에 있는 경우 [Google 검색 남아프리카 공화국 배지 및 상세검색 칩 신청 양식](https://docs.google.com/forms/d/e/1FAIpQLSeio2rTpaGNFohJQNKRDLQENyfK5avJFGJSx1nguoRwqsocIQ/viewform?hl=ko)을 작성하세요.

## 구조화된 데이터 추가하기

구조화된 데이터는 페이지 정보를 제공하고 페이지 콘텐츠를 분류하기 위한 표준화된 형식입니다. 구조화된 데이터를 처음 사용한다면 [구조화된 데이터의 작동 방식](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data?hl=ko)을 자세히 알아보세요.

다음은 구조화된 데이터를 사이트에 추가하는 방법에 관한 개요입니다.

1. 목록에 있는 모든 항목의 일부 정보가 포함된 단일 요약 페이지를 선택합니다.
   예를 들어 '파리 인기 호텔'이 나열되어 있으며, 사이트에서 각 호텔에 관해 자세한 정보를 확인할 수 있는 특정 세부정보 페이지로 이어지는 링크가 포함된 카테고리 페이지가 여기 해당합니다. 필요한 경우 다양한 유형의 항목(예: 호텔, 레스토랑)을 조합하여 사용할 수 있습니다. 예를 들어 '스위스에서 할 일' 도움말에 지역 이벤트와 지역 비즈니스 두 가지 모두가 표시되어 있을 수 있습니다.
2. 해당 요약 페이지에 [필수 속성](#structured-data-type-definitions)을 추가합니다. 이 베타 기능을 사용하기 위해 세부정보 페이지에 마크업을 추가할 필요는 없습니다.
   사용 중인 형식에 따라 [페이지에 구조화된 데이터를 삽입](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data?hl=ko#format-placement)하는 위치를 알아보세요.
   **CMS를 사용하고 있나요?** CMS에 통합된 플러그인을 사용하는 것이 더 쉬울 수 있습니다.
     
   **JavaScript를 사용하고 있나요?** [자바스크립트로 구조화된 데이터를 생성](https://developers.google.com/search/docs/appearance/structured-data/generate-structured-data-with-javascript?hl=ko)하는 방법을 알아보세요.
3. 캐러셀의 콘텐츠 유형에 맞춰 필수 및 권장 속성을 추가합니다.
   * [`LocalBusiness`](#localbusiness) 및 하위유형. 예를 들면 다음과 같습니다.
     + [`Restaurant`](https://schema.org/Restaurant)
     + [`Hotel`](https://schema.org/Hotel)
     + [`VacationRental`](https://schema.org/VacationRental)
   * [`Product`](#product)
   * [`Event`](#event)

   시나리오에 따라 가장 적합한 유형을 선택할 수 있습니다. 예를 들어 페이지에 호텔 및 공유숙박 목록이 표시되어 있다면 `Hotel` 유형과 `VacationRental` 유형 두 가지 모두 사용하세요. 시나리오에 가장 가까운 유형을 사용하는 것이 가장 좋지만 더 일반적인 유형(예: `LocalBusiness`)을 사용할 수도 있습니다.
4. [가이드라인](#guidelines)을 따릅니다.
5. [리치 결과 테스트](https://search.google.com/test/rich-results?hl=ko)를 사용하여 코드의 유효성을 검사합니다.
6. 구조화된 데이터를 포함하는 일부 페이지를 배포하고 [URL 검사 도구](https://support.google.com/webmasters/answer/9012289?hl=ko)를 사용하여 Google에서 페이지를 표시하는 방법을 테스트합니다. Google이 페이지에 액세스할 수 있으며 robots.txt 파일, `noindex` 태그 또는 로그인 요구사항에 의해 차단되지 않는지 확인합니다. 페이지가 정상적으로 표시되면 [Google에 URL을 재크롤링하도록 요청](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl?hl=ko)할 수 있습니다. **참고**: Google이 재크롤링하고 색인을 다시 생성하는 동안 기다려 주세요. 페이지 게시 후 Google에서 페이지를 찾고 크롤링하는 데 며칠이 걸릴 수 있습니다.
7. [Google에 향후 변경사항을 계속 알리려면](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap?hl=ko) 사이트맵을 제출하는 것이 좋습니다. 이는 [Search Console Sitemap API](https://developers.google.com/webmaster-tools/search-console-api-original/v3/sitemaps?hl=ko)를 사용하여 자동화할 수 있습니다.

## 가이드라인

페이지가 캐러셀 리치 결과(베타)에 표시되려면 [검색 Essentials](https://developers.google.com/search/docs/essentials?hl=ko) 및 [구조화된 데이터 일반 가이드라인](https://developers.google.com/search/docs/guides/sd-policies?hl=ko)을 준수해야 합니다. 캐러셀 리치 결과(베타)에도 다음 가이드라인이 적용됩니다.

* 일반적인 유형 사용도 허용되지만 권장 속성을 사용하려면 해당 유형을 사용해야 합니다. 예를 들어 `amenityFeature`를 사용하려면 `LodgingBusiness` 유형을 사용하세요.
* 추가 입력란을 사용할 수 있지만 리치 결과에 표시되지 않을 수도 있습니다.
* 사이트에는 하나의 요약 페이지와 여러 개의 세부정보 페이지가 있어야 합니다. 현재 이 기능은 '세부정보'가 동일한 페이지 내의 앵커 포인트 역할을 하는 올인원 페이지 등의 다른 시나리오를 지원하도록 설계되지 않았습니다.
* 마크업은 요약 또는 카테고리 페이지에 있어야 합니다. 카테고리 페이지는 목록과 유사한 페이지로, 3개 이상의 항목에 관한 정보를 포함하며 이러한 항목에 관한 자세한 정보를 제공하는 사이트의 다른 페이지로 연결됩니다. 세부정보 페이지에 마크업을 추가할 필요는 없지만 세부정보 페이지 URL을 요약 페이지의 마크업에 추가해야 합니다.
* 요약 또는 카테고리 페이지에 있는 모든 항목을 마크업하세요. 페이지로 나눈 카테고리의 경우 각 후속 페이지에 `ItemList`를 추가하고 해당 페이지에 나열된 항목을 포함합니다. 무한 스크롤의 경우 표시 영역에 처음 로드되는 항목에 마크업을 설정하는 데 초점을 맞추세요.

## 예

다음은 캐러셀의 대략적인 구조입니다. 마크업에 지정된 순서는 캐러셀 리치 결과에서 타일의 순서를 지정하는 데 사용되는 순서입니다.

  

```
  <html>
    <head>
      <title>Top 5 Restaurants in Italy</title>
      <script type="application/ld+json">
        {
        "@context": "https://schema.org",
        "@type": "ItemList",
          "itemListElement": [
            {
              "@type": "ListItem",
                "position": 1,
                "item": {
                  "@type": "Restaurant",
                  "name": "Trattoria Luigi",
                  "image": [
                    "https://example.com/photos/1x1/photo.jpg",
                    "https://example.com/photos/4x3/photo.jpg",
                    "https://example.com/photos/16x9/photo.jpg"
                  ],
                  "priceRange": "$$$",
                  "servesCuisine": "Italian",
                  "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": 4.5,
                    "reviewCount": 250
                  },
                "url": "https://www.example.com/trattoria-luigi"
              }
            },
            {
              "@type": "ListItem",
                "position": 2,
                "item": {
                  "@type": "Restaurant",
                  "name": "La Pergola",
                  "image": [
                    "https://example.com/photos/1x1/photo.jpg",
                    "https://example.com/photos/4x3/photo.jpg",
                    "https://example.com/photos/16x9/photo.jpg"
                  ],
                  "priceRange": "$$$",
                  "servesCuisine": "Italian",
                  "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": 4.9,
                    "reviewCount": 1150
                  },
                "url": "https://www.example.com/la-pergola"
              }
            },
            {
              "@type": "ListItem",
              "position": 3,
              "item": {
                "@type": "Restaurant",
                "name": "Pasta e Basta",
                "image": [
                  "https://example.com/photos/1x1/photo.jpg",
                  "https://example.com/photos/4x3/photo.jpg",
                  "https://example.com/photos/16x9/photo.jpg"
                ],
                "priceRange": "$$$",
                "servesCuisine": "Italian",
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": 4.2,
                  "reviewCount": 690
                },
              "url": "https://www.example.com/pasta-e-basta"
              }
            }
          ]
        }
      </script>
    </head>
    <body>
    </body>
  </html>
```

## 구조화된 데이터 유형 정의

리치 결과에 콘텐츠를 표시하려면 필수 속성이 있어야 합니다. 권장 속성을 통해 콘텐츠에 관한 정보를 추가하여 더 만족스러운 사용자 환경을 제공할 수 있습니다.

### `ItemList`

`ItemList`는 목록의 모든 요소를 포함하는 컨테이너 항목입니다. 목록에 있는 요소의 모든 URL은 동일한 도메인에 있는 다른 페이지를 가리켜야 합니다.

`ItemList`의 전체 정의는 [schema.org/ItemList](https://schema.org/ItemList)에서 확인할 수 있습니다.

| 필수 속성 | |
| --- | --- |
| `itemListElement` | [`ListItem`](https://schema.org/ListItem)  항목 목록입니다. 목록을 지정하려면 `itemListElement.item` 요소가 세 개 이상 포함된 `ItemList`를 정의합니다. |
| `itemListElement.item` | `LocalBusiness`, `Product`, `Event`의 하위유형  목록에 포함된 개별 항목입니다. 이 개체를 다음 속성으로 채우세요.   * 모든 캐러셀에 필요한 [일반 속성](#common)(`image`, `url`, `name`) * 콘텐츠 유형에 설명된 이 데이터 유형에 필요한 다른 모든 속성:   + [`LocalBusiness` 및 하위유형](#localbusiness)   + [`Product`](#product)   + [`Event`](#event)   **예**: 호텔의 경우 `priceRange` 및 `amenityFeature` 속성을 제공하세요. |
| `itemListElement.position` | [`Integer`](https://schema.org/Integer)  캐러셀에 있는 항목의 위치로 1진수로 표시되는 숫자입니다. |

### 일반적인 목록 항목 속성(`LocalBusiness`, `Product,`, `Event`)

모든 캐러셀 항목 유형에는 다음과 같은 공통 속성이 있습니다.

| 필수 속성 | |
| --- | --- |
| `image` | 반복되는 `URL` 또는 `ImageObject`  하나 이상의 항목 이미지(예: 호텔 이미지)입니다. 이 이미지 속성에는 로고를 포함하지 마세요.  추가 이미지 가이드라인은 다음과 같습니다.   * 이미지 URL은 크롤링 및 색인 생성이 가능해야 합니다. Google에서 내 URL에 액세스할 수 있는지 확인하려면 [URL 검사 도구](https://support.google.com/webmasters/answer/9012289?hl=ko)를 사용하세요. * 이미지는 마크업된 콘텐츠를 나타내야 합니다. * 이미지는 [Google 이미지에서 지원](https://developers.google.com/search/docs/appearance/google-images?hl=ko#supported-image-formats)되는 파일 형식이어야 합니다. * 최상의 결과를 위해서는 가로세로 비율이 16x9, 4x3, 1x1인 여러 개의 고해상도 이미지(너비와 높이의 곱이 최소 50,000픽셀)를 제공하는 것이 좋습니다.   예:     ``` "image": [   "https://example.com/photos/1x1/photo.jpg",   "https://example.com/photos/4x3/photo.jpg",   "https://example.com/photos/16x9/photo.jpg" ] ``` |
| `name` | [`Text`](https://schema.org/Text)  항목의 문자열 이름입니다. 예를 들어 호텔 또는 휴가용 별장 이름을 나타낼 수 있습니다. `item.name`은 캐러셀에서 개별 항목의 제목으로 표시됩니다. HTML 형식은 무시됩니다. |
| `url` | [`URL`](https://schema.org/URL)  항목 세부정보 페이지의 표준 URL(예: 요약 페이지에서 참조된 단일 호텔 또는 휴가 등록정보의 독립형 페이지) 목록에 있는 모든 URL은 고유해야 하며 동일한 도메인에 게시되어 있어야 합니다(동일한 도메인 또는 요약 페이지의 하위/최상위 도메인). 요약 또는 카테고리 페이지 내의 앵커 링크는 지원되지 않습니다. 사이트에 목록의 각 항목에 관한 독립된 세부정보 페이지가 있어야 합니다. |

| 권장 속성 | |
| --- | --- |
| `aggregateRating.bestRating` | [`Number`](https://schema.org/Number)  이 평가 시스템에서 허용되는 가장 높은 값입니다(예: `5 / 10`). `bestRating`이 생략된 경우 `5`로 간주됩니다. |
| `aggregateRating.ratingCount` | [`Number`](https://schema.org/Number)  사이트의 총 항목 평점 수입니다. |
| `aggregateRating.ratingValue` | `Number` 또는 `Text`  항목의 품질 평점을 숫자, 백분율, 분수로 나타낸 숫자 값입니다(예: `4`, `60%` 또는 `6 / 10`). 분수 자체나 백분율에 척도가 내포되어 있기에 Google에서는 분수와 백분율의 척도를 파악하고 있습니다. 숫자 값의 기본 척도는 5점이며, 1이 가장 낮은 값이고 5가 가장 높은 값입니다. 다른 척도를 사용하려면 `bestRating`과 `worstRating`을 사용하세요.  십진수는 쉼표 대신 점을 사용하여 값을 지정하세요(예: `4,4` 대신 `4.4`). 마이크로데이터 및 RDFa에서는 `content` 속성을 사용하여 표시되는 콘텐츠를 재정의할 수 있습니다. 이렇게 하면 구조화된 데이터의 점 요구사항을 충족하면서 원하는 스타일을 사용자에게 표시할 수 있습니다. 예를 들면 다음과 같습니다.     ``` <span itemprop="ratingValue" content="4.4">4,4</span> stars ``` |

### 추가 유형별 속성 정의

#### `LocalBusiness`(및 하위유형)

Google에서는 캐러셀 리치 결과에 [`ListItem` 속성](#listitem) 외에도 다음과 같은 `LocalBusiness` 속성(하위유형 포함)을 지원합니다. 이러한 속성을 `itemListElement.item` 아래에 중첩하세요.

| 권장 속성 | |
| --- | --- |
| `amenityFeature` | [`LocationFeatureSpecification`](https://schema.org/LocationFeatureSpecification)  **`LodgingBusiness`만 해당**: 숙박 시설에 있는 편의시설(예: 특성 또는 서비스)입니다.     ``` "amenityFeature": {   "@type": "LocationFeatureSpecification",   "name" : "beachAccess",   "value": true } ``` |
| `priceRange` | [`Text`](https://schema.org/Text)  업체의 상대 가격대이며 일반적으로 정규화된 화폐 기호 수로 지정됩니다. 다음 형식 중 하나를 사용해 가격대를 제공하세요.   * **가격 수준:** 예: '$', '$$", "$$$' * **범위:** 예: '$~$$'   이 필드는 12자(영문 기준) 미만이어야 합니다. 12자를 초과하면 업체의 가격대가 표시되지 않습니다. |
| `servesCuisine` | [`Text`](https://schema.org/Text)  **레스토랑에만 해당**: 레스토랑에서 제공하는 메뉴 유형입니다. |

#### `Product`

Google은 캐러셀 리치 결과에 대해 [`ListItem` 속성](#listitem) 외에도 다음과 같은 `Product` 속성을 지원합니다. 이러한 속성을 `itemListElement.item` 아래에 중첩하세요.

| 권장 속성 | |
| --- | --- |
| `offers` | [`Offer`](https://schema.org/Offer) 또는 [`AggregateOffer`](https://schema.org/AggregateOffer)  제품 판매를 위한 중첩된 `Offer` 또는 `AggregateOffer`입니다. `Offer` 또는 `AggregateOffer`에 대한 권장 속성을 포함합니다(둘 중 콘텐츠에 적용되는 속성).  `Offer`를 사용하는 경우 다음 속성을 포함하세요.   * `offers.price` * `offers.priceCurrency`   `AggregateOffer`를 사용하는 경우 다음 속성을 포함하세요.   * `offers.highPrice` * `offers.lowPrice` * `offers.priceCurrency` |
| `offers.highPrice` | [`Number`](https://schema.org/Number)  상품 가격 중 최고가입니다. `price`를 사용해 단일 가격을 지정하는 경우 `highPrice` 및 `lowPrice` 속성을 포함하지 않아도 됩니다. |
| `offers.lowPrice` | [`Number`](https://schema.org/Number)  상품 가격 중 최저가입니다. `price`를 사용해 단일 가격을 지정하는 경우 `highPrice` 및 `lowPrice` 속성을 포함하지 않아도 됩니다. |
| `offers.price` | [`Number`](https://schema.org/Number)  제품의 판매 가격 또는 가격 구성요소의 가격(`PriceSpecification` 및 하위유형에 연결된 경우)입니다. `lowPrice` 및 `highPrice`로 가격대를 지정하는 경우 `price` 속성을 포함하지 않아도 됩니다. |
| `offers.priceCurrency` | [`Text`](https://schema.org/Text)  제품 가격을 설명하는 데 사용된 통화이며, 3글자 [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) 형식으로 나타냅니다. 통화를 제공하지 않으면 Google에서 `USD`를 기본값으로 사용합니다. |

#### `Event`

Google은 캐러셀 리치 결과에 대해 [`ListItem` 속성](#listitem) 외에도 다음과 같은 `Event` 속성을 지원합니다. 이러한 속성을 `itemListElement.item` 아래에 중첩하세요.

| 권장 속성 | |
| --- | --- |
| `offers` | `Offer` 또는 `AggregateOffer`  이벤트 판매를 위한 중첩된 `Offer` 또는 `AggregateOffer`입니다. `Offer` 또는 `AggregateOffer`에 대한 권장 속성을 포함합니다(둘 중 콘텐츠에 적용되는 속성).  `Offer`를 사용하는 경우 다음 속성을 포함하세요.   * `offers.price` * `offers.priceCurrency`   `AggregateOffer`를 사용하는 경우 다음 속성을 포함하세요.   * `offers.highPrice` * `offers.lowPrice` * `offers.priceCurrency` |
| `offers.highPrice` | [`Number`](https://schema.org/Number)  상품 가격 중 최고가입니다. `price`를 사용해 단일 가격을 지정하는 경우 `highPrice` 및 `lowPrice` 속성을 포함하지 않아도 됩니다. |
| `offers.lowPrice` | [`Number`](https://schema.org/Number)  상품 가격 중 최저가입니다. `price`를 사용해 단일 가격을 지정하는 경우 `highPrice` 및 `lowPrice` 속성을 포함하지 않아도 됩니다. |
| `offers.price` | [`Number`](https://schema.org/Number)  서비스 요금 및 수수료를 포함한 티켓 가격입니다. 가격이 변경되거나 표가 매진되면 잊지 말고 업데이트하세요. `lowPrice` 및 `highPrice`를 사용해 가격대를 지정하는 경우 `price` 속성을 포함하지 않아도 됩니다.  결제하지 않아도 되거나, 수수료 또는 서비스 요금 없이 이용 가능한 이벤트라면 `price`를 `0`으로 설정하세요.     ``` "offers": {   "@type": "Offer",   "price": 0 } ``` |
| `offers.priceCurrency` | [`Text`](https://schema.org/Text)  이벤트 가격을 설명하는 데 사용된 통화이며, 3글자 [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) 형식으로 나타냅니다. 통화를 제공하지 않으면 Google에서 `USD`를 기본값으로 사용합니다. |

## 일반적인 시나리오의 예시

### `Restaurant` 예

다음은 JSON-LD 형식의 음식점 캐러셀 예입니다.

  

```
<html>
    <head>
      <title>Top 5 Restaurants in Paris</title>
      <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "ItemList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "item": {
                "@type": "Restaurant",
                "name": "Trattoria Luigi",
                "image": [
                  "https://example.com/photos/1x1/photo.jpg",
                  "https://example.com/photos/4x3/photo.jpg",
                  "https://example.com/photos/16x9/photo.jpg"
                ],
                "priceRange": "$$$",
                "servesCuisine": "Italian",
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": 4.5,
                  "reviewCount": 250
                },
                "url": "https://www.example.com/restaurant-location-1"
              }
            },
            {
              "@type": "ListItem",
              "position": 2,
              "item": {
                "@type": "Restaurant",
                "name": "La Pergola",
                "image": [
                  "https://example.com/photos/1x1/photo.jpg",
                  "https://example.com/photos/4x3/photo.jpg",
                  "https://example.com/photos/16x9/photo.jpg"
                ],
                "priceRange": "$$$",
                "servesCuisine": "Italian",
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": 4.9,
                  "reviewCount": 1150
                },
                "url": "https://www.example.com/restaurant-location-2"
              }
            },
            {
              "@type": "ListItem",
              "position": 3,
              "item": {
                "@type": "Restaurant",
                "name": "Pasta e Basta",
                "image": [
                  "https://example.com/photos/1x1/photo.jpg",
                  "https://example.com/photos/4x3/photo.jpg",
                  "https://example.com/photos/16x9/photo.jpg"
                ],
                "priceRange": "$$$",
                "servesCuisine": "Italian",
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": 4.2,
                  "reviewCount": 690
                },
                "url": "https://www.example.com/restaurant-location-3"
              }
            }
          ]
        }
      </script>
    </head>
    <body>
    </body>
  </html>
```

### 숙박 시설(`Hotels` 및 `VacationRental`) 예

다음은 JSON-LD 형식의 숙박 시설 캐러셀 예입니다.

  

```
<html>
    <head>
      <title>Top 5 Hotels in Paris</title>
      <script type="application/ld+json">
        {
        "@context": "https://schema.org",
        "@type": "ItemList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "item": {
                  "@type": "Hotel",
                  "name": "Four Seasons Hotel George V, Paris",
                  "image": [
                    "https://example.com/photos/1x1/photo.jpg",
                    "https://example.com/photos/4x3/photo.jpg",
                    "https://example.com/photos/16x9/photo.jpg"
                  ],
                  "priceRange": "$$$$",
                  "amenityFeature": {
                      "@type": "LocationFeatureSpecification",
                      "name" : "internetType",
                      "value": "Free"
                  },
                  "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": 4.9,
                    "reviewCount": 50
                  },
                  "url": "https://www.example.com/four-seasons"
                }
              },
              {
                "@type": "ListItem",
                "position": 2,
                "item": {
                  "@type": "VacationRental",
                  "name": "Downtown Condo",
                  "image": [
                    "https://example.com/photos/1x1/photo.jpg",
                    "https://example.com/photos/4x3/photo.jpg",
                    "https://example.com/photos/16x9/photo.jpg"
                  ],
                  "priceRange": "$$",
                  "amenityFeature": {
                    "@type": "LocationFeatureSpecification",
                    "name" : "instantBookable",
                    "value": true
                  },
                  "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": 4.7,
                    "reviewCount": 827
                  },
                  "url": "https://www.example.com/downtown-condo"
                }
              },
              {
                "@type": "ListItem",
                "position": 3,
                "item": {
                  "@type": "Hotel",
                  "name": "Ritz Paris",
                  "image": [
                    "https://example.com/photos/1x1/photo.jpg",
                    "https://example.com/photos/4x3/photo.jpg",
                    "https://example.com/photos/16x9/photo.jpg"
                  ],
                  "priceRange": "$$$$",
                  "amenityFeature": {
                    "@type": "LocationFeatureSpecification",
                    "name" : "freeBreakfast",
                    "value": true
                },
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": 4.9,
                  "reviewCount": 1290
                },
                "url": "https://www.example.com/ritz-paris"
              }
            }
          ]
        }
      </script>
    </head>
    <body>
    </body>
  </html>
```

### 할 일 예시

다음은 JSON-LD 형식의 할 일 캐러셀 예입니다.

  

```
<html>
    <head>
      <title>Top 5 Things To Do in Paris</title>
      <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "ItemList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "item": {
                "@type": "Event",
                "name": "Paris Seine River Dinner Cruise",
                "image": [
                  "https://example.com/photos/1x1/photo.jpg",
                  "https://example.com/photos/4x3/photo.jpg",
                  "https://example.com/photos/16x9/photo.jpg"
                ],
                "offers": {
                  "@type": "Offer",
                  "price": 45.00,
                  "priceCurrency": "EUR"
                },
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": 4.2,
                  "reviewCount": 690
                },
                "url": "https://www.example.com/event-location1"
              }
            },
            {
              "@type": "ListItem",
              "position": 2,
              "item": {
                "@type": "LocalBusiness",
                "name": "Notre-Dame Cathedral",
                "image": [
                  "https://example.com/photos/1x1/photo.jpg",
                  "https://example.com/photos/4x3/photo.jpg",
                  "https://example.com/photos/16x9/photo.jpg"
                ],
                "priceRange": "$",
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": 4.8,
                  "reviewCount": 4220
                },
                "url": "https://www.example.com/localbusiness-location"
              }
            },
            {
              "@type": "ListItem",
              "position": 3,
              "item": {
                "@type": "Event",
                "name": "Eiffel Tower With Host Summit Tour",
                "image": [
                  "https://example.com/photos/1x1/photo.jpg",
                  "https://example.com/photos/4x3/photo.jpg",
                  "https://example.com/photos/16x9/photo.jpg"
                ],
                "offers": {
                  "@type": "Offer",
                  "price": 59.00,
                  "priceCurrency": "EUR"
                },
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": 4.9,
                  "reviewCount": 652
                },
                "url": "https://www.example.com/event-location2"
              }
            }
          ]
        }
      </script>
    </head>
    <body>
    </body>
  </html>
```

### `Product` 예

다음은 JSON-LD 형식의 제품 캐러셀 예입니다.

  

```
<html>
    <head>
      <title>Top coats of the season</title>
      <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "ItemList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "item": {
                "@type": "Product",
                "name": "Puffy Coat Series by Goat Coat",
                "image": [
                  "https://example.com/photos/1x1/photo.jpg",
                  "https://example.com/photos/4x3/photo.jpg",
                  "https://example.com/photos/16x9/photo.jpg"
                ],
                "offers": {
                  "@type": "AggregateOffer",
                  "lowPrice": 45.00,
                  "highPrice": 60.00,
                  "priceCurrency": "EUR"
                },
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": 4.9,
                  "reviewCount": 50
                },
                "url": "https://www.example.com/puffy-coats"
              }
            },
            {
              "@type": "ListItem",
              "position": 2,
              "item": {
                "@type": "Product",
                "name": "Wool Coat Series by Best Coats Around",
                "image": [
                  "https://example.com/photos/1x1/photo.jpg",
                  "https://example.com/photos/4x3/photo.jpg",
                  "https://example.com/photos/16x9/photo.jpg"
                ],
                "offers": {
                  "@type": "AggregateOffer",
                  "lowPrice": 189.00,
                  "highPrice": 200.00,
                  "priceCurrency": "EUR"
                },
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": 4.7,
                  "reviewCount": 827
                },
                "url": "https://www.example.com/wool-coats"
              }
            },
            {
              "@type": "ListItem",
              "position": 3,
              "item": {
                "@type": "Product",
                "name": "Antarctic Coat by Cold Coats",
                "image": [
                  "https://example.com/photos/1x1/photo.jpg",
                  "https://example.com/photos/4x3/photo.jpg",
                  "https://example.com/photos/16x9/photo.jpg"
                ],
                "offers": {
                  "@type": "Offer",
                  "price": 45.00,
                  "priceCurrency": "EUR"
                },
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": 4.9,
                  "reviewCount": 1290
                },
                "url": "https://www.example.com/antarctic-coat"
              }
            }
          ]
        }
      </script>
    </head>
    <body>
    </body>
  </html>
```

## 문제 해결

구조화된 데이터를 구현하거나 디버깅하는 데 문제가 있다면 다음 리소스를 참고하세요.

* 콘텐츠 관리 시스템(CMS)을 사용하거나 다른 사람이 내 사이트를 관리한다면 도움을 요청하세요. 문제를 자세히 설명하는 모든 Search Console 메시지를 CMS나 관리자에게 전달해야 합니다.
* Google은 구조화된 데이터를 사용하는 기능이라고 해서 검색결과에 표시된다고 보장하지 않습니다.
  Google에서 콘텐츠를 리치 결과로 표시할 수 없는 일반적인 이유 목록은 [구조화된 데이터 일반 가이드라인](https://developers.google.com/search/docs/appearance/structured-data/sd-policies?hl=ko)을 참고하세요.
* 구조화된 데이터에 오류가 있을 수 있습니다. [구조화된 데이터 오류 목록](https://support.google.com/webmasters/answer/13300873?hl=ko) 및 [파싱할 수 없는 구조화된 데이터 보고서](https://support.google.com/webmasters/answer/9166415?hl=ko)를 확인하세요.
* 페이지에 구조화된 데이터 직접 조치를 취하는 경우 페이지에 있는 구조화된 데이터는 무시됩니다. 하지만 페이지는 계속 Google 검색결과에 표시될 수 있습니다. [구조화된 데이터 문제](https://support.google.com/webmasters/answer/9044175?hl=ko#zippy=,structured-data-issue)를 해결하려면 [직접 조치 보고서](https://support.google.com/webmasters/answer/9044175?hl=ko)를 사용하세요.
* [가이드라인](#guidelines)을 다시 검토하여 콘텐츠가 가이드라인을 준수하지 않는지 확인합니다. 스팸성 콘텐츠 또는 스팸성 마크업의 사용으로 인해 문제가 발생할 수 있습니다.
  하지만 해당 문제가 구문 문제가 아닐 수도 있고, 이 경우 리치 결과 테스트에서는 이 문제를 식별할 수 없습니다.
* [누락된 리치 결과/전체 리치 결과 수 감소 문제 해결](https://support.google.com/webmasters/answer/13300208?hl=ko)
* 다시 크롤링이 이루어지고 색인이 생성될 때까지 기다리세요. 페이지가 게시된 후 Google에서 페이지를 찾고 크롤링하기까지 며칠 정도 걸릴 수 있습니다. 크롤링 및 색인 생성에 관한 일반적인 질문은 [Google 검색 크롤링 및 색인 생성 FAQ](https://developers.google.com/search/help/crawling-index-faq?hl=ko)를 참고하세요.
* [Google 검색 센터 포럼](https://support.google.com/webmasters/community?hl=ko)에 질문을 올려보세요.
