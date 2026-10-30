# 구조화된 지역 비즈니스(LocalBusiness) 데이터

> **출처(Source):** https://developers.google.com/search/docs/appearance/structured-data/local-business?hl=ko
> **저작자(Attribution):** Google
> **라이선스(License):** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
> 이 문서는 Google 검색 센터 문서를 Markdown으로 변환한 사본입니다.
> 원문의 최신 내용은 위 출처 링크를 확인하세요.

---

# 구조화된 지역 비즈니스(`LocalBusiness`) 데이터

사용자가 Google 검색이나 지도에서 비즈니스를 검색하면 검색결과에 검색어와 일치했던 비즈니스에 관한 세부정보가 포함된 눈에 띄는 Google 지식 패널이 표시될 수 있습니다. 사용자가 비즈니스 유형을 검색하면(예: '뉴욕 최고의 레스토랑') 검색어와 관련된 비즈니스의 캐러셀이 표시될 수 있습니다. 구조화된 지역 비즈니스 데이터를 사용하면 Google에 내 비즈니스의 영업시간, 비즈니스 내의 여러 부서, 리뷰(사이트에서 다른 비즈니스에 관한 리뷰를 캡처하는 경우) 등을 알릴 수 있습니다. 사용자가 검색결과에서 바로 예약하거나 주문할 수 있게 하려면 [Maps Booking API](https://developers.google.com/maps-booking/guides/starter-integration/overview?hl=ko)를 사용하여 예약, 결제 등의 작업을 사용 설정할 수 있습니다.

## 구조화된 데이터를 추가하는 방법

구조화된 데이터는 페이지 정보를 제공하고 페이지 콘텐츠를 분류하기 위한 표준화된 형식입니다. 구조화된 데이터를 처음 사용한다면 [구조화된 데이터의 작동 방식](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data?hl=ko)을 자세히 알아보세요.

다음은 구조화된 데이터를 빌드, 테스트 및 출시하는 방법의 개요입니다.

1. [필수 속성](#structured-data-type-definitions)을 추가합니다. 사용 중인 형식에 따라 [페이지에 구조화된 데이터를 삽입](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data?hl=ko#format-placement)하는 위치를 알아보세요.
   **CMS를 사용하고 있나요?** CMS에 통합된 플러그인을 사용하는 것이 더 쉬울 수 있습니다.
     
   **자바스크립트를 사용하고 있나요?** [자바스크립트로 구조화된 데이터를 생성](https://developers.google.com/search/docs/appearance/structured-data/generate-structured-data-with-javascript?hl=ko)하는 방법을 알아보세요.
2. [가이드라인](#guidelines)을 따릅니다.
3. [리치 결과 테스트](https://search.google.com/test/rich-results?hl=ko)를 사용하여 코드의 유효성을 검사하고 심각한 오류를 해결하세요. 또한 도구에서 신고될 수 있는 심각하지 않은 문제는 구조화된 데이터의 품질을 개선하는 데 도움이 될 수 있으므로 해결하는 것이 좋습니다. 그러나 리치 결과를 사용하기 위한 필수사항은 아닙니다.
4. 구조화된 데이터를 포함하는 일부 페이지를 배포하고 [URL 검사 도구](https://support.google.com/webmasters/answer/9012289?hl=ko)를 사용하여 Google에서 페이지를 표시하는 방법을 테스트합니다. Google이 페이지에 액세스할 수 있으며
   robots.txt 파일, `noindex` 태그 또는 로그인 요구사항에 의해
   차단되지 않는지 확인합니다. 페이지가 정상적으로 표시되면 [Google에 URL을 재크롤링하도록 요청](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl?hl=ko)할 수 있습니다. **참고**: Google이 재크롤링하고 색인을 다시 생성하는 동안 기다려 주세요. 페이지 게시 후 Google에서 페이지를 찾고 크롤링하는 데 며칠이 걸릴 수 있습니다.
5. Google에 향후 변경사항을 계속 알리려면 [사이트맵을 제출](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap?hl=ko)하는 것이 좋습니다. 이는 [Search Console Sitemap API](https://developers.google.com/webmaster-tools/v1/sitemaps?hl=ko)를 사용하여 자동화할 수 있습니다.

## 예

### 간단한 지역 비즈니스 정보

다음은 JSON-LD를 사용한 지역 비즈니스 정보의 예입니다.

![Google 검색에 표시된 지역 비즈니스 정보](https://developers.google.com/static/search/docs/images/local-business01.png?hl=ko)

**참고**: 실제로 검색결과에 표시되는 모습은 다를 수 있습니다. [리치 결과 테스트](https://support.google.com/webmasters/answer/7445569?hl=ko)를 사용하면 대부분의 기능을 미리 볼 수 있습니다.

  

```
<html>
  <head>
    <title>Dave's Steak House</title>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Restaurant",
      "image": [
        "https://example.com/photos/1x1/photo.jpg",
        "https://example.com/photos/4x3/photo.jpg",
        "https://example.com/photos/16x9/photo.jpg"
       ],
      "name": "Dave's Steak House",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "148 W 51st St",
        "addressLocality": "New York",
        "addressRegion": "NY",
        "postalCode": "10019",
        "addressCountry": "US"
      },
      "review": {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": 4,
          "bestRating": 5
        },
        "author": {
          "@type": "Person",
          "name": "Lillian Ruiz"
        }
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 40.761293,
        "longitude": -73.982294
      },
      "url": "https://www.example.com/restaurant-locations/manhattan",
      "telephone": "+12122459600",
      "servesCuisine": "American",
      "priceRange": "$$$",
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": [
            "Monday",
            "Tuesday"
          ],
          "opens": "11:30",
          "closes": "22:00"
        },
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": [
            "Wednesday",
            "Thursday",
            "Friday"
          ],
          "opens": "11:30",
          "closes": "23:00"
        },
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": "Saturday",
          "opens": "16:00",
          "closes": "23:00"
        },
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": "Sunday",
          "opens": "16:00",
          "closes": "22:00"
        }
      ],
      "menu": "https://www.example.com/menu"
    }
    </script>
  </head>
  <body>
  </body>
</html>
```

### 레스토랑 캐러셀(액세스 제한됨)

캐러셀 마크업이 포함된 [요약 페이지](https://developers.google.com/search/docs/appearance/structured-data/carousel?hl=ko#summary-page)도 있다는 가정하에 [세부정보 페이지](https://developers.google.com/search/docs/appearance/structured-data/carousel?hl=ko#details-page)의 요건을 충족하는 레스토랑의 예입니다. 레스토랑 캐러셀을 사용할 수 있는 비즈니스는 소수의 레스토랑 제공업체로 제한됩니다. 참여하고 싶다면 양식을 작성하여 [신청](https://docs.google.com/a/google.com/forms/d/e/1FAIpQLSdZCJXAe2TtpiBe8Lx2dWR6LatLcCbFq7SZsyWqH6xJ7ulbaQ/viewform?hl=ko)하세요.

```
<html>
  <head>
    <title>Trattoria Luigi</title>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org/",
      "@type": "Restaurant",
      "name": "Trattoria Luigi",
      "image": [
        "https://example.com/photos/1x1/photo.jpg",
        "https://example.com/photos/4x3/photo.jpg",
        "https://example.com/photos/16x9/photo.jpg"
       ],
       "priceRange": "$$$",
       "servesCuisine": "Italian",
       "telephone": "+12125557234",
       "address": {
         "@type": "PostalAddress",
         "streetAddress": "148 W 51st St",
         "addressLocality": "New York",
         "addressRegion": "NY",
         "postalCode": "10019",
         "addressCountry": "US"
       }
    }
    </script>
  </head>
  <body>
  </body>
</html>
```

### 영업시간

다음 예는 다른 유형의 영업시간을 마크업하는 방법을 보여줍니다.

[dayOfWeek](https://schema.org/OpeningHoursSpecification)를 나타내는 공식 schema.org 표기법(월요일, 화요일의 표준 URL)과 schema.org 커뮤니티에서 논의되고 있는 짧은 형식이 모두 허용됩니다. Google은 이 도움말을 업데이트하여 이러한 논의의 최종 결과를 추적하고 계속해서 하위 호환성의 두 변형을 모두 허용하고자 합니다.

일반적인 영업시간

`validFrom`과 `validThrough` 속성을 제외하면 1년 내내 유효한 시간을 나타냅니다. 이 예는 평일 오전 9시~오후 9시, 주말 오전 10시~오후 11시에 운영하는 비즈니스를 정의합니다.

```
"openingHoursSpecification": [
  {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday"
    ],
    "opens": "09:00",
    "closes": "21:00"
  },
  {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": [
      "Saturday",
      "Sunday"
    ],
    "opens": "10:00",
    "closes": "23:00"
  }
]
```

심야 시간

자정 이후 몇 시간은 단일 `OpeningHoursSpecification` 속성을 사용하여 개점/폐점 시간을 정의합니다. 이 예는 토요일 오후 6시~일요일 오전 3시까지의 시간을 정의합니다.

```
"openingHoursSpecification": {
  "@type": "OpeningHoursSpecification",
  "dayOfWeek": "Saturday",
  "opens": "18:00",
  "closes": "03:00"
}
```

24시간 영업

비즈니스가 24시간 영업함을 표시하려면 `open` 속성을 '00:00'으로, `closes` 속성을 '23:59'로 설정합니다. 비즈니스가 하루 종일 휴점임을 표시하려면 `opens` 및 `closes` 속성을 '00:00'으로 설정합니다. 이 예는 토요일에 하루 종일 영업하고 일요일에 하루 종일 휴점하는 비즈니스를 나타냅니다.

```
"openingHoursSpecification": [
  {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": "Saturday",
    "opens": "00:00",
    "closes": "23:59"
  },
  {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": "Sunday",
    "opens": "00:00",
    "closes": "00:00"
  }
]
```

계절별 영업시간

`validFrom` 및 `validThrough` 속성을 모두 사용하여 계절별 영업시간을 정의합니다. 이 예는 겨울 휴일 동안 영업하지 않는 업체를 나타냅니다.

```
"openingHoursSpecification": {
  "@type": "OpeningHoursSpecification",
  "opens": "00:00",
  "closes": "00:00",
  "validFrom": "2015-12-23",
  "validThrough": "2016-01-05"
}
```

### 여러 부서

여러 부서로 구성되며 부서마다 영업시간, 전화번호 등의 속성이 다른 비즈니스의 경우 각 부서의 요소로 `department` 속성을 마크업할 수 있습니다. 각 부서 요소에 개별적으로 주 매장과 다른 속성을 정의하세요.

```
<html>
  <head>
    <title>Dave's Department Store</title>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Store",
      "image": [
        "https://example.com/photos/1x1/photo.jpg",
        "https://example.com/photos/4x3/photo.jpg",
        "https://example.com/photos/16x9/photo.jpg"
       ],
      "name": "Dave's Department Store",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "1600 Saratoga Ave",
        "addressLocality": "San Jose",
        "addressRegion": "CA",
        "postalCode": "95129",
        "addressCountry": "US"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 37.293058,
        "longitude": -121.988331
      },
      "url": "https://www.example.com/store-locator/sl/San-Jose-Westgate-Store/1427",
      "priceRange": "$$$",
      "telephone": "+14088717984",
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday"
          ],
          "opens": "08:00",
          "closes": "23:59"
        },
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": "Sunday",
          "opens": "08:00",
          "closes": "23:00"
        }
      ],
      "department": [
        {
          "@type": "Pharmacy",
          "image": [
        "https://example.com/photos/1x1/photo.jpg",
        "https://example.com/photos/4x3/photo.jpg",
        "https://example.com/photos/16x9/photo.jpg"
       ],
          "name": "Dave's Pharmacy",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "1600 Saratoga Ave",
            "addressLocality": "San Jose",
            "addressRegion": "CA",
            "postalCode": "95129",
            "addressCountry": "US"
          },
          "priceRange": "$",
          "telephone": "+14088719385",
          "openingHoursSpecification": [
            {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday"
              ],
              "opens": "09:00",
              "closes": "19:00"
            },
            {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": "Saturday",
              "opens": "09:00",
              "closes": "17:00"
            },
            {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": "Sunday",
              "opens": "11:00",
              "closes": "17:00"
            }
          ]
        }
      ]
    }
    </script>
  </head>
  <body>
  </body>
</html>
```

## 가이드라인

지역 비즈니스 리치 결과에 표시되려면 다음 가이드라인을 준수해야 합니다.

**경고**: Google에서는 이 가이드라인을 하나 이상 위반하는 사이트에 [직접 조치](https://support.google.com/webmasters/answer/2604824?hl=ko)를 취할 수 있습니다. 문제가 되는 부분을 해결하고 나면 사이트 [재검토](https://support.google.com/webmasters/answer/35843?hl=ko) 요청을 제출할 수 있습니다.

* [검색 Essentials](https://developers.google.com/search/docs/essentials?hl=ko)
* [구조화된 데이터 일반 가이드라인](https://developers.google.com/search/docs/appearance/structured-data/sd-policies?hl=ko)
* [캐러셀 가이드라인](https://developers.google.com/search/docs/guides/mark-up-listings?hl=ko)(해당하는 경우). 현재 레스토랑 캐러셀을 사용할 수 있는 비즈니스는 소수의 레스토랑 제공업체로 제한됩니다. 참여하고 싶다면 양식을 작성하여 [신청](https://docs.google.com/a/google.com/forms/d/e/1FAIpQLSdZCJXAe2TtpiBe8Lx2dWR6LatLcCbFq7SZsyWqH6xJ7ulbaQ/viewform?hl=ko)하세요.

## 구조화된 데이터 유형 정의

다음 표는 지역 업체 및 비즈니스 작업 유형의 속성 및 사용법을 나타냅니다. 전체 정의는 [schema.org/LocalBusiness](https://schema.org/LocalBusiness)에서 확인할 수 있습니다.

리치 결과에 콘텐츠를 표시하려면 필수 속성이 있어야 합니다.
권장 속성을 통해 콘텐츠에 관한 정보를 추가하여 더 만족스러운 사용자 환경을 제공할 수 있습니다.

사이트의 모든 페이지에 구조화된 `LocalBusiness` 데이터를 추가할 수 있지만, 비즈니스 관련 정보가 있는 페이지에 이 데이터를 추가하는 것이 더 나을 수 있습니다.

### `LocalBusiness`

`LocalBusiness`의 전체 정의는 [schema.org/LocalBusiness](https://schema.org/LocalBusiness)에서 확인할 수 있습니다. 각 지역 비즈니스의 위치를 `LocalBusiness` 유형으로 정의합니다. [가능하면 가장 구체적인 `LocalBusiness` 하위 유형](https://schema.org/LocalBusiness#subtypes)을 사용하세요(예: `Restaurant`, `DaySpa`, `HealthClub` 등).

[`LocalBusiness`](https://schema.org/LocalBusiness)는 [`Organization`](https://schema.org/Organization)의 하위유형이므로 아래의 필수 및 권장 필드 외에도 [조직](https://developers.google.com/search/docs/appearance/structured-data/organization?hl=ko) 필드를 따르는 것이 좋습니다.

유형이 여러 개인 경우 배열로 지정합니다(`additionalType`는 지원되지 않음). 예를 들어 비즈니스에서 여러 서비스를 제공하는 경우 다음과 같이 지정하세요.

```
{
  "@context": "https://schema.org",
  "@type": ["Electrician", "Plumber", "Locksmith"],
  ....
}
```

Google에서 지원하는 속성은 다음과 같습니다.

| 필수 속성 | |
| --- | --- |
| `address` | `PostalAddress`  업체의 실제 위치입니다. 속성을 가능한 한 많이 포함하세요. 속성을 많이 제공할수록 사용자에게 게시되는 결과의 품질이 우수해집니다. 예를 들면 다음과 같습니다.     ``` "address": {   "@type": "PostalAddress",   "streetAddress": "148 W 51st St Suit 42 Unit 7",   "addressLocality": "New York",   "addressRegion": "NY",   "postalCode": "10019",   "addressCountry": "US" } ``` |
| `name` | `Text`  업체의 이름입니다. |

| 권장 속성 | |
| --- | --- |
| `aggregateRating` | `AggregateRating`  **이 속성은 다른 지역 비즈니스에 관한 리뷰를 캡처하는 사이트에만 권장됩니다.** 여러 평점이나 리뷰에 기반한 지역 비즈니스의 평균 평점입니다. [리뷰 스니펫 가이드라인](https://developers.google.com/search/docs/appearance/structured-data/review-snippet?hl=ko#guidelines) 및 필수/권장 [집계 평점 속성](https://developers.google.com/search/docs/appearance/structured-data/review-snippet?hl=ko#aggregated-rating-type-definition) 목록을 따르세요. |
| `department` | `LocalBusiness`  한 부서의 중첩된 항목입니다. 부서에 대해 이 표의 어느 속성이나 정의할 수 있습니다.  추가 가이드라인:   * 다음 형식의 부서 이름과 함께 매장 이름을 포함합니다(`{store name} {department name}`). 예를 들면 `gMart` 및 `gMart Pharmacy`입니다. * 부서 이름이 명시적으로 브랜드화되어 있으면 부서 이름만 지정합니다. 예를 들면 `Best Buy` 및 `Geek Squad`입니다. |
| `geo` | `GeoCoordinates`  업체의 지리 좌표입니다. |
| `geo.latitude` | `Number`  업체 위치의 위도입니다. 최소한 소수점 이하 5자리까지 정확히 표시해야 합니다. |
| `geo.longitude` | `Number`  업체 위치의 경도입니다. 최소한 소수점 이하 5자리까지 정확히 표시해야 합니다. |
| `menu` | `URL`  외식 시설의 경우 메뉴의 정규화된 URL입니다. |
| `openingHoursSpecification` | `OpeningHoursSpecification`의 단일 객체 또는 배열(모두 지원됨)  업체 위치가 영업을 하는 시간입니다. |
| `openingHoursSpecification.closes` | `Time`  업체 위치가 영업을 종료하는 hh:mm:ss 형식의 시간입니다. |
| `openingHoursSpecification.dayOfWeek` | `DayOfWeek`  다음 값 중 하나 이상을 사용합니다.   * `https://schema.org/Monday`: 월요일 * `https://schema.org/Tuesday`: 화요일 * `https://schema.org/Wednesday`: 수요일 * `https://schema.org/Thursday`: 목요일 * `https://schema.org/Friday`: 금요일 * `https://schema.org/Saturday`: 토요일 * `https://schema.org/Sunday`: 일요일  또한 URL 접두사가 없는 닉네임(예: `Monday`)도 지원됩니다. |
| `openingHoursSpecification.opens` | `Time`  업체 위치가 영업을 시작하는 hh:mm:ss 형식의 시간입니다. |
| `openingHoursSpecification.validFrom` | `Date`  YYYY-MM-DD 형식의 계절 영업 마감 시작일입니다. |
| `openingHoursSpecification.validThrough` | `Date`  YYYY-MM-DD 형식의 계절 영업 마감 종료일입니다. |
| `priceRange` | `Text`  업체의 상대 가격대는 일반적으로 숫자 범위(예: '$10~15') 또는 정규화된 화폐 기호 수(예: '$$$')로 지정됩니다.  이 필드는 100자(영문 기준) 미만이어야 합니다. 100자를 초과하면 Google에 업체의 가격대가 표시되지 않습니다. |
| `review` | [리뷰](https://schema.org/Review)  **이 속성은 다른 지역 비즈니스에 관한 리뷰를 캡처하는 사이트에만 권장됩니다**. 지역 비즈니스에 대한 리뷰입니다. [리뷰 스니펫 가이드라인](https://developers.google.com/search/docs/appearance/structured-data/review-snippet?hl=ko#guidelines) 및 필수/권장 [리뷰 속성](https://developers.google.com/search/docs/appearance/structured-data/review-snippet?hl=ko#review-properties) 목록을 따르세요. |
| `servesCuisine` | `servesCuisine`  레스토랑에서 제공하는 메뉴 유형입니다. |
| `telephone` | `Text`  업체 전화번호는 고객을 위한 기본 연락 수단입니다. 전화번호에는 국가 코드와 지역 번호가 포함되어 있어야 합니다. |
| `url` | `URL`  특정 업체 위치의 정규화된 URL입니다. URL은 작동하는 링크여야 합니다. |

### 레스토랑 캐러셀(액세스 제한됨)

현재 레스토랑 캐러셀을 사용할 수 있는 비즈니스는 소수의 레스토랑 제공업체로 제한됩니다.
참여하고 싶다면 양식을 작성하여 [신청](https://docs.google.com/a/google.com/forms/d/e/1FAIpQLSdZCJXAe2TtpiBe8Lx2dWR6LatLcCbFq7SZsyWqH6xJ7ulbaQ/viewform?hl=ko)하세요.

사이트에서 제공하고 있는 여러 레스토랑을 호스트 캐러셀에 포함하고 싶다면 캐러셀 개체를 추가하세요. 캐러셀 개체에 [표준 캐러셀 속성](https://developers.google.com/search/docs/appearance/structured-data/carousel?hl=ko) 외에 다음 속성을 정의하세요. 캐러셀 속성은 필수가 아니지만 레스토랑 목록이 호스트 캐러셀에 표시되도록 하려면 다음 속성을 추가해야 합니다.

Google에서 지원하는 속성은 다음과 같습니다.

| 필수 속성 | |
| --- | --- |
| `image` | 반복되는 `URL` 또는 `ImageObject`  하나 이상의 레스토랑 이미지입니다.  추가 이미지 가이드라인은 다음과 같습니다.   * 이미지 URL은 크롤링 및 색인 생성이 가능해야 합니다. Google에서 내 URL에 액세스할 수 있는지 확인하려면 [URL 검사 도구](https://support.google.com/webmasters/answer/9012289?hl=ko)를 사용하세요. * 이미지는 마크업된 콘텐츠를 나타내야 합니다. * 이미지는 [Google 이미지에서 지원](https://developers.google.com/search/docs/appearance/google-images?hl=ko#supported-image-formats)되는 파일 형식이어야 합니다. * 최상의 결과를 위해서는 가로세로 비율이 16x9, 4x3, 1x1인 여러 개의 고해상도 이미지(너비와 높이의 곱이 최소 50,000픽셀)를 제공하는 것이 좋습니다.   예:     ``` "image": [   "https://example.com/photos/1x1/photo.jpg",   "https://example.com/photos/4x3/photo.jpg",   "https://example.com/photos/16x9/photo.jpg" ] ``` |
| `name` | `Text`  레스토랑 이름입니다. |

| 권장 속성 | |
| --- | --- |
| `address` | `PostalAddress`  업체의 실제 위치입니다. 속성을 가능한 한 많이 포함하세요. 속성을 많이 제공할수록 사용자에게 게시되는 결과의 품질이 우수해집니다. 예를 들면 다음과 같습니다.     ``` "address": {   "@type": "PostalAddress",   "streetAddress": "148 W 51st St",   "addressLocality": "New York",   "addressRegion": "NY",   "postalCode": "10019",   "addressCountry": "US" } ``` |
| `servesCuisine` | `servesCuisine`  레스토랑에서 제공하는 메뉴 유형입니다. |

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
