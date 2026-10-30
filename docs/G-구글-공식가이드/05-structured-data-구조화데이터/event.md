# 구조화된 이벤트(Event) 데이터

> **출처(Source):** https://developers.google.com/search/docs/appearance/structured-data/event?hl=ko
> **저작자(Attribution):** Google
> **라이선스(License):** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
> 이 문서는 Google 검색 센터 문서를 Markdown으로 변환한 사본입니다.
> 원문의 최신 내용은 위 출처 링크를 확인하세요.

---

# 구조화된 이벤트(`Event`) 데이터

Google의 이벤트 환경을 사용하면 Google 검색결과 및 Google 지도와 같은 다른 Google 제품을 통해 이벤트를 검색하고 참여하는 것이 더욱 간편해집니다. 이 기능은 다음과 같이 여러 가지 이점을 제공합니다.

* **더욱 향상된 상호작용 결과**: 이벤트가 Google의 이벤트 환경에 표시될 수 있게 되며 로고, 이벤트 설명 등이 함께 표시됩니다.
* **검색 및 전환 가능성 증가**: 이벤트 게시물과 상호작용하고 클릭하여 사이트로 이동하는 새로운 방법을 제공합니다. [Eventbrite가 Google 검색 트래픽을 예년 대비 100% 증가](https://developers.google.com/search/case-studies/eventbrite-case-study?hl=ko)시킨 방법을 알아보세요.

![Google 검색에 표시되는 이벤트 환경](https://developers.google.com/static/search/docs/images/event-rich-result.png?hl=ko)
![특정 이벤트를 클릭한 후 Google 검색에 표시되는 이벤트 세부정보](https://developers.google.com/static/search/docs/images/event-details.png?hl=ko)

Google에 이벤트가 표시되도록 하는 방법에는 다음의 세 가지가 있습니다.

* **타사 웹사이트를 사용하여 이벤트를 게시하는 경우**(예: 티켓 예매 웹사이트 또는 소셜 플랫폼에 이벤트 게시), 이벤트 게시자가 이미 Google의 이벤트 검색 환경에 참여 중인지 확인하세요. 이벤트 게시자가 Google과 통합되어 있다면 타사 웹사이트에 이벤트를 계속 게시할 수 있습니다. 이 경우라면 여기까지만 읽어도 됩니다.
* **CMS(예: WordPress)를 사용하고 HTML 액세스 권한은 없는 경우** 사이트에 구조화된 데이터를 추가할 수 있는 플러그인이 있는지 CMS에 확인해 보세요.
  또는 사이트 HTML을 수정하지 않고도 [데이터 하이라이터](https://support.google.com/webmasters/answer/2774099?hl=ko)로 Google에 이벤트를 알릴 수 있습니다.
* **HTML 수정에 익숙하다면** [구조화된 데이터를 사용하여 Google과 직접 통합](#add-structured-data)하세요. 이벤트 페이지의 HTML을 수정해야 합니다.

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

### 표준 이벤트

다음은 JSON-LD 형식의 표준 `Event` 예입니다. 표준 이벤트는 이벤트가 실제 위치에서만 일정대로 열린다는 것입니다. 마이크로데이터 또는 RDFa 구문을 사용할 수도 있습니다.

```
<html>
  <head>
    <title>The Adventures of Kira and Morrison</title>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Event",
      "name": "The Adventures of Kira and Morrison",
      "startDate": "2025-07-21T19:00-05:00",
      "endDate": "2025-07-21T23:00-05:00",
      "eventStatus": "https://schema.org/EventScheduled",
      "location": {
        "@type": "Place",
        "name": "Snickerpark Stadium",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "100 West Snickerpark Dr",
          "addressLocality": "Snickertown",
          "postalCode": "19019",
          "addressRegion": "PA",
          "addressCountry": "US"
        }
      },
      "image": [
        "https://example.com/photos/1x1/photo.jpg",
        "https://example.com/photos/4x3/photo.jpg",
        "https://example.com/photos/16x9/photo.jpg"
       ],
      "description": "The Adventures of Kira and Morrison is coming to Snickertown in a can't miss performance.",
      "offers": {
        "@type": "Offer",
        "url": "https://www.example.com/event_offer/12345_202403180430",
        "price": 30,
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "validFrom": "2024-05-21T12:00"
      },
      "performer": {
        "@type": "PerformingGroup",
        "name": "Kira and Morrison"
      },
      "organizer": {
        "@type": "Organization",
        "name": "Kira and Morrison Music",
        "url": "https://kiraandmorrisonmusic.com"
      }
    }
    </script>
  </head>
  <body>
  </body>
</html>
```

### 상태가 업데이트된 이벤트

여러 가지 방법으로 이벤트의 상태를 설정할 수 있습니다. 다음은 상태가 업데이트된 이벤트의 일반적인 예입니다. 자세한 내용은 [`eventStatus`](#eventstatus) 속성을 참조하세요.

#### 취소됨

다음은 취소된 이벤트의 예입니다.

  

```
<html>
  <head>
    <title>The Adventures of Kira and Morrison</title>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Event",
      "name": "The Adventures of Kira and Morrison",
      "startDate": "2025-07-21T19:00-05:00",
      "endDate": "2025-07-21T23:00-05:00",
      "eventStatus": "https://schema.org/EventCancelled",
      "location": {
        "@type": "Place",
        "name": "Snickerpark Stadium",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "100 West Snickerpark Dr",
          "addressLocality": "Snickertown",
          "postalCode": "19019",
          "addressRegion": "PA",
          "addressCountry": "US"
        }
      },
      "image": [
        "https://example.com/photos/1x1/photo.jpg",
        "https://example.com/photos/4x3/photo.jpg",
        "https://example.com/photos/16x9/photo.jpg"
       ],
      "description": "The Adventures of Kira and Morrison is coming to Snickertown in a can't miss performance.",
      "offers": {
        "@type": "Offer",
        "url": "https://www.example.com/event_offer/12345_202403180430",
        "price": 30,
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "validFrom": "2024-05-21T12:00"
      },
      "performer": {
        "@type": "PerformingGroup",
        "name": "Kira and Morrison"
      },
      "organizer": {
        "@type": "Organization",
        "name": "Kira and Morrison Music",
        "url": "https://kiraandmorrisonmusic.com"
      }
    }
    </script>
  </head>
  <body>
  </body>
</html>
```

#### 일정 조정됨

다음은 일정이 조정된 이벤트의 예입니다.

  

```
<html>
  <head>
    <title>The Adventures of Kira and Morrison</title>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Event",
      "name": "The Adventures of Kira and Morrison",
      "startDate": "2025-07-21T19:00-05:00",
      "endDate": "2025-07-21T23:00-05:00",
      "eventStatus": "https://schema.org/EventRescheduled",
      "previousStartDate": "2025-03-21T19:00-05:00",
      "location": {
        "@type": "Place",
        "name": "Snickerpark Stadium",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "100 West Snickerpark Dr",
          "addressLocality": "Snickertown",
          "postalCode": "19019",
          "addressRegion": "PA",
          "addressCountry": "US"
        }
      },
      "image": [
        "https://example.com/photos/1x1/photo.jpg",
        "https://example.com/photos/4x3/photo.jpg",
        "https://example.com/photos/16x9/photo.jpg"
       ],
      "description": "The Adventures of Kira and Morrison is coming to Snickertown in a can't miss performance.",
      "offers": {
        "@type": "Offer",
        "url": "https://www.example.com/event_offer/12345_202403180430",
        "price": 30,
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "validFrom": "2024-05-21T12:00"
      },
      "performer": {
        "@type": "PerformingGroup",
        "name": "Kira and Morrison"
      },
      "organizer": {
        "@type": "Organization",
        "name": "Kira and Morrison Music",
        "url": "https://kiraandmorrisonmusic.com"
      }
    }
    </script>
  </head>
  <body>
  </body>
</html>
```

## 사용 가능한 지역 및 언어

Google의 이벤트 검색 환경은 점점 더 많은 지역에서 제공되고 있습니다. 이벤트 검색 기능이 제공되는 지역은 다음과 같습니다.

| 지역 | 사용 가능한 언어 |
| --- | --- |
| 오스트레일리아 | 영어 |
| 브라질 | 포르투갈어 |
| 캐나다 | 영어 |
| 독일 | 독일어 |
| 인도 | 영어 |
| 중남미 | 스페인어 |
| 스페인 | 스페인어 |
| 영국 | 영어 |
| 미국 | 영어 |

## 가이드라인

Google 이벤트 검색 환경에 표시되려면 다음 가이드라인을 준수해야 합니다.

**경고:** Google에서는 이 가이드라인을 하나 이상 위반하는 사이트에 [직접 조치](https://support.google.com/webmasters/answer/2604824?hl=ko)를 취할 수 있습니다. 문제가 되는 부분을 해결하고 나면 사이트 [재검토](https://support.google.com/webmasters/answer/35843?hl=ko) 요청을 제출할 수 있습니다.

* [기술 가이드라인](#technical-guidelines)
* [콘텐츠 가이드라인](#content-guidelines)
* [날짜 및 시간 가이드라인](#date-time-best-guidelines)
* [검색 Essentials](https://developers.google.com/search/docs/essentials?hl=ko)
* [구조화된 데이터 일반 가이드라인](https://developers.google.com/search/docs/appearance/structured-data/sd-policies?hl=ko)

### 기술 가이드라인

* 타겟 페이지에는 [schema.org의 이벤트 유형](https://schema.org/Event)의 구조화된 데이터 항목이 포함되어 있어야 합니다.
* 각 이벤트에는 고유한 URL(리프 페이지) 및 해당 URL의 마크업이 있어야 합니다.
* Google의 이벤트 환경은 하나의 이벤트에 집중하는 페이지만을 지원합니다. 일정이나 여러 이벤트를 나열하는 페이지 대신 이벤트 게시물 페이지에 마크업을 추가하는 데 집중하는 것이 좋습니다.
* **2일 이상인 이벤트를 올바르게 마크업하세요.**
  + 이벤트나 티켓 정보가 여러 날짜에 걸쳐 개최되는 이벤트인 경우, 이벤트의 시작일과 종료일을 모두 지정하세요.
  + 여러 날짜 동안 다른 행사가 개최되고 각 행사에 개별 티켓이 필요한 경우, 각 행사에 별도의 `Event` 요소를 추가하세요.

### 콘텐츠 가이드라인

* 각 이벤트는 이벤트 이름, 시작일, 위치를 정확히 설명해야 합니다.
* **이벤트가 아닌 항목을 이벤트로 표시하지 마세요.**
  + '여행 패키지: 샌디에고/LA, 7박'과 같이 이벤트가 아닌 제품이나 서비스를 이벤트로 홍보하지 않습니다.
  + '콘서트 - 지금 바로 티켓을 구매하세요' 또는 '콘서트 - 토요일까지 50% 할인'과 같이 단기 할인이나 구매 기회를 추가하지 않습니다.
  + '어드벤처 파크 영업시간 오전 8시~오후 5시'와 같이 영업시간을 이벤트로 표시하지 않습니다.
  + '첫 주문 시 5% 할인'과 같이 쿠폰 또는 바우처를 이벤트로 표시하지 마세요.
* 일반 사용자가 이벤트를 예약할 수 있어야 합니다. 티켓을 구매하거나 이벤트에 참석하기 전에 멤버십 또는 초대가 필요한 이벤트는 이벤트 환경을 이용할 수 없습니다.
* 주요 참여자와 시청자가 미성년자이고 학교에서 진행되는 관중 이벤트는 이벤트 환경을 이용할 수 없습니다. 예를 들어 학교 부지에서 개최되는 학생 이벤트가 있습니다.
* 실제 세계 요소가 포함되지 않은 가상 체험은 지원되지 않습니다. 이벤트는 실제 장소에서 진행되어야 합니다.

### 날짜 및 시간 가이드라인

[`startDate`](#startdate), [`endDate`](#enddate), [`previousStartDate`](#previous-start-date) 속성을 구현할 때 이 날짜 및 시간 가이드라인을 따르세요.

#### 시간대 지정 방법

UTC 또는 GMT 시차를 포함하여 시간대를 지정합니다. 이벤트가 9월 5일 오후 7시에 뉴욕에서 시작하면 `startDate` 값이 표준시 기간에는 GMT/UTC-5, 일광 절약 시간 기간에는 GMT/UTC-4가 됩니다. 표준시 기간에 `startDate` 값은 각각 `"2019-09-05T19:00:00-05:00"` 또는 `"2019-09-05T19:00:00-04:00"`이 됩니다. 시간대를 제공하지 않으면 Google은 `location`에 지정된 이벤트 위치의 시간대를 사용합니다.

#### 권장사항

* **일정 기간 동안 발생하는 이벤트**: 이벤트가 며칠에 걸쳐 발생하는 경우 시작일과 종료일을 모두 표시합니다. 시간을 모르는 경우 시간은 표시하지 않습니다.

  **권장**

  ```
  "startDate": "2019-07-01T10:00:00-05:00",
  "endDate": "2019-07-26T17:00:00-05:00"
  ```

  **권장**

  ```
  "startDate": "2019-07-01",
  "endDate": "2019-07-26"
  ```

  **권장하지 않음**

  ```
  "startDate": "2019-07-01T00:00:00+00:00",
  "endDate": "2019-07-26T23:59:59+00:00"
  ```
* **특정 시간에 시작하는 이벤트**: 이벤트가 현지 시간 오후 5시와 같이 특정 시간에 시작하는 경우 `2019-07-20T17:00:00`을 사용합니다. 적절한 UTC 오프셋을 포함합니다(예: 이벤트가 캘리포니아에서 있을 경우 `2019-07-20T17:00:00-07:00` 사용).
* **하루 종일 진행되는 이벤트**: 이벤트가 하루 종일 진행되는 경우 시작일의 상세 시간을 지정하지 않습니다. 예를 들어, 종일 이벤트에는 `2019-08-15`를 `startDate`와 `endDate`로 사용할 수 있습니다.
* **시작 시간을 알 수 없는 이벤트**: 시작 시간을 모르는 경우 상세 시간을 지정하지 않습니다. 예를 들어 `2019-08-15`를 `startDate`와 `endDate`로 사용할 수 있습니다.

  **권장**: `"startDate": "2025-07-21"`

  **권장하지 않음**: `"startDate": "2019-08-15T00:00:00+00:00"`

  **권장하지 않음**: `"startDate": "2019-07-20T00:00:00"`

#### Google에서 날짜를 해석하는 방법의 예

Google에서 시작일과 시작 시간을 해석하는 방법의 예는 다음과 같습니다.

| 시작 날짜 및 시간 해석 | |
| --- | --- |
| `2019-08-15T00:00:00+00:00` | Google은 `startTime`을 `2019-08-14T17:00:00-07:00`(`location`이 캘리포니아로 설정된 경우) 또는 `2019-08-15T09:00:00`(`location`이 대한민국으로 설정된 경우)으로 해석합니다. |
| `2019-08-15T23:59:59+00:00` | 이벤트가 GMT 시간대에서 발생하지 않는 한 `2019-08-15`의 끝을 의미하지 않습니다. Google은 `startTime`을 `2019-08-15T16:59:59-07:00`(`location`이 캘리포니아로 설정된 경우) 또는 `2019-08-16T08:59:59`(`location`이 대한민국으로 설정된 경우)으로 해석합니다. |
| `2019-07-10` | 시간대와 관계없이 날짜를 의미합니다. `startDate`에 사용된 경우 이벤트가 그날의 언젠가 `location`에서 시작된다는 의미입니다. `endDate`에 사용된 경우 이벤트가 그날의 언젠가 `location`에서 종료된다는 의미입니다. |
| `2019-07-20T00:00:00` | 이벤트가 발생하는 시간대의 `2019-07-20` 자정을 의미합니다. 이벤트가 자정에 시작한다는 의미가 아닌 경우 잘못된 정보일 가능성도 있습니다. |

## 구조화된 데이터 유형 정의

`Event`의 전체 정의는 [schema.org/Event](https://schema.org/Event)에서 확인할 수 있습니다.

개선된 검색결과에 콘텐츠를 표시하려면 필수 속성이 있어야 합니다. 권장 속성을 통해 콘텐츠에 관한 정보를 추가하여 더 만족스러운 사용자 환경을 제공할 수 있습니다.

| 필수 속성 | |
| --- | --- |
| `location` | `Place`  이벤트의 위치입니다. `@type`를 `Place`로 설정합니다. [`location.address`](#location-address) 및 [`location.name`](#location-name) 속성을 추가합니다. |
| `location.address` | `PostalAddress`  행사 장소의 구체적인 주소입니다.  **권장하지 않음**: Sydney  **권장**: Bennelong Point, Sydney NSW 2000, Australia  **미국 예**     ``` "location": {   "@type": "Place",   "name": "Snickerpark Stadium",   "address": {     "@type": "PostalAddress",     "streetAddress": "100 West Snickerpark Dr",     "addressLocality": "Snickertown",     "postalCode": "19019",     "addressRegion": "PA",     "addressCountry": "US"   } } ```   **일본 예**  일본 주소는 다른 방식으로 작성할 수 있으며 Google은 여전히 주소를 인식합니다. 다음은 여러 필드에 상세 주소, 지역, 국가가 포함되는 예입니다.     ``` "location": {   "@type": "Place",   "name": "ダイバーシティ東京",   "address": {     "@type": "PostalAddress",     "streetAddress": "江東区青海1-10",     "addressLocality": "東京",     "addressCountry": "日本"   } } ```   다음은 여러 필드에 상세 주소와 주소 국가가 포함되는 예입니다.     ``` "location": {   "@type": "Place",   "name": "ダイバーシティ東京",   "address": {     "@type": "PostalAddress",     "streetAddress": "東京都江東区青海1-10",     "addressCountry": "日本"   } } ```   다음은 한 줄로 된 전체 주소의 예입니다.     ``` "location": {   "@type": "Place",   "name": "ダイバーシティ東京",   "address": {     "@type": "PostalAddress",     "name": "東京都江東区青海 1-1-10 ダイバーシティ東京プラザ"    } } ```   **주소 관련 권장사항**:   * 이벤트가 여러 거리에서 개최되는 경우, 시작 위치를 정의하고 설명에   전체 세부정보를 언급합니다. * 이벤트가 제대로 정의된 위치 없이 개최되는 경우, 도시 이름이나 가장 대표적인 위치를 사용합니다. * 이벤트가 동시에 여러 위치에서 개최되는 경우, 위치별로 다른 이벤트를 생성합니다. |
| `name` | `Text`  이벤트의 전체 제목입니다. 이벤트 장소의 이름은 입력하지 마세요. 대신 [`location.name`](#location-name)을 사용하여 이벤트가 열리는 위치의 이름을 지정합니다. **권장하지 않음**: 빌 그레이엄 시빅 센터  **권장하지 않음**: \*\*기간 한정 할인 - 케샤와 맥클모어 콘서트 - $25\*\*  **권장**: 케샤와 맥클모어의 어드벤처  **권장**: 케샤와 맥클모어를 만나 보세요  **권장사항**:   * 이벤트 유형을 이벤트 이름으로 사용하지 마세요. 예를 들어 '콘서트'는   이벤트를 설명하는 이름이 아닙니다. * URL, 가격, 공연자와 같은 추가 정보를 포함하지 마세요. 대신 적절한 속성을 사용하여 이러한 값을 입력하세요. * 제목에서 이벤트가 차별화되는 점을 강조합니다. 이렇게 하면 사용자가 빠르게 결정을 내릴 수 있습니다(예: ' 아티스트와의 질문과 답변 시간'). * 단기 프로모션(예: '지금 바로 티켓을 구매하세요')을 추가하지 않습니다. |
| `startDate` | `DateTime`  이벤트의 시작 날짜와 시작 시간이며, [ISO-8601 형식](https://en.wikipedia.org/wiki/ISO_8601)으로 나타냅니다. 사용자가 일정에 맞는 이벤트를 찾을 수 있도록 날짜와 시간을 모두 추가하세요.  [날짜 및 시간 가이드라인](#date-time-best-guidelines)을 준수해야 합니다.     ``` "startDate": "2025-07-21T19:00" ``` |

| 권장 속성 | |
| --- | --- |
| `description` | `Text`  이벤트에 관한 설명입니다. 이벤트의 모든 세부정보를 설명하여 사용자가 쉽게 이벤트를 이해하고 참석할 수 있게 하세요.  **권장사항**:   * 특정 이벤트에 관한 명확하고 간결한 설정을 추가하세요. * 사이트의 기능이 아닌 이벤트 세부정보에 중점을 두세요. * 날짜나 위치와 같은 다른 사실을 반복하지 마세요. 대신 이러한 정보를 각각의 속성에 추가하세요.      ``` "description": "The Adventures of Kira and Morrison is coming to Snickertown in a can't miss performance." ```  Google은 전체 설명의 스니펫만 표시합니다. |
| `endDate` | `DateTime`  [ISO-8601 형식](https://en.wikipedia.org/wiki/ISO_8601)으로 나타낸 이벤트의 종료일과 종료 시간입니다. `startDate`와 같은 형식을 사용하세요. 사용자가 일정에 맞는 이벤트를 찾을 수 있도록 날짜와 시간을 모두 추가하세요.  [날짜 및 시간 가이드라인](#date-time-best-guidelines)을 준수해야 합니다.     ``` "endDate": "2025-07-21T23:00" ``` |
| `eventStatus` | `EventStatusType` **경고**: 이벤트 상태가 변경되어도 [`startDate`](#startdate)를 삭제하지 **마세요**. `startDate` 속성은 고유 이벤트를 파악하는 데 필요합니다. 이벤트의 상태입니다. 이 필드를 사용하지 않으면 Google은 `eventStatus`를 `EventScheduled`로 인식합니다. 해당하는 경우 여러 상태를 사용할 수 있습니다. 지원되는 값은 다음과 같습니다.   |  |  | | --- | --- | | [`EventCancelled`](https://schema.org/EventCancelled) | 이벤트가 취소되었습니다. 다른 속성을 삭제하거나 변경하지 마세요(예: `startDate` 또는 `location`을 삭제하지 않음). 대신 모든 값을 취소 전과 동일하게 유지하고 `eventStatus`를 `EventCancelled`로 업데이트하세요.     **왜냐고요?** `startDate`, `location` 등의 속성은 고유 이벤트를 파악하는 데 도움을 주고, 사람들이 이벤트의 새 상태를 파악할 수 있게 해주기 때문입니다.    ``` {   "@context": "https://schema.org",   "@type": "Event",   "eventStatus": "https://schema.org/EventCancelled",   "startDate": "2020-07-21T19:00" } ``` | | [`EventPostponed`](https://schema.org/EventPostponed) | 이벤트가 이후의 날짜로 연기되었지만 날짜를 아직 알 수 없습니다. 이벤트가 언제 열리는지 알기 전까지 이벤트의 [`startDate`](#startdate)에 원래 날짜를 유지합니다. 새 날짜 정보를 알게 되면 `eventStatus`를 `EventRescheduled`로 변경하고 [`startDate`](#startdate) 및 [`endDate`](#enddate)를 새로운 날짜 정보로 업데이트합니다. 다른 속성을 삭제하거나 변경하지 마세요(예: `startDate` 또는 `location`을 삭제하지 않음). 대신 모든 값을 취소 전과 동일하게 유지하고 `eventStatus`를 `EventPostponed`로 업데이트하세요.     **왜냐고요?** `startDate`, `location` 등의 속성은 고유 이벤트를 파악하는 데 도움을 주고, 사람들이 이벤트의 새 상태를 파악할 수 있게 해주기 때문입니다.    ``` {   "@context": "https://schema.org",   "@type": "Event",   "eventStatus": "https://schema.org/EventPostponed",   "startDate": "2020-07-21T19:00" } ``` | | [`EventRescheduled`](https://schema.org/EventRescheduled) | 이벤트가 이후의 날짜로 조정되었습니다. [`startDate`](#startdate) 및 [`endDate`](#enddate)를 새로운 관련 날짜로 업데이트합니다. 선택적으로 `eventStatus` 필드를 일정 조정됨으로 표시하고 `previousStartDate`를 추가할 수도 있습니다.     ``` {   "@context": "https://schema.org",   "@type": "Event",   "eventStatus": "https://schema.org/EventRescheduled",   "startDate": "2020-07-21T19:00",   "endDate": "2025-07-21T23:00",   "previousStartDate": "2025-03-21T19:00" } ``` | | [`EventScheduled`](https://schema.org/EventScheduled) | 이벤트가 열릴 예정입니다. 이 값은 이벤트의 기본 상태입니다. `eventStatus`를 설정하지 않으면 Google은 일정에 따라 이벤트가 열리는 것으로 인식합니다.     ``` {   "@context": "https://schema.org",   "@type": "Event",   "eventStatus": "https://schema.org/EventScheduled",   "startDate": "2020-07-21T19:00" } ``` | |
| `image` | 반복되는 `ImageObject` 또는 `URL`  이벤트나 투어의 이미지 또는 로고의 URL입니다. 이미지를 포함하면 사용자가 더 쉽게 이벤트를 이해하고 참여할 수 있습니다. 이미지 너비는 1,920픽셀(최소 너비 720픽셀)로 설정하는 것이 좋습니다.  추가 이미지 가이드라인은 다음과 같습니다.   * 이미지 URL은 크롤링 및 색인 생성이 가능해야 합니다. Google에서 내 URL에 액세스할 수 있는지 확인하려면 [URL 검사 도구](https://support.google.com/webmasters/answer/9012289?hl=ko)를 사용하세요. * 이미지는 마크업된 콘텐츠를 나타내야 합니다. * 이미지는 [Google 이미지에서 지원](https://developers.google.com/search/docs/appearance/google-images?hl=ko#supported-image-formats)되는 파일 형식이어야 합니다. * 최상의 결과를 위해서는 가로세로 비율이 16x9, 4x3, 1x1인 여러 개의 고해상도 이미지(너비와 높이의 곱이 최소 50,000픽셀)를 제공하는 것이 좋습니다.   예:     ``` "image": [   "https://example.com/photos/1x1/photo.jpg",   "https://example.com/photos/4x3/photo.jpg",   "https://example.com/photos/16x9/photo.jpg" ] ``` |
| `location.name` | `Text`  이벤트가 열리는 장소나 행사장의 자세한 이름입니다. 이 속성은 실제 위치에서 발생하는 이벤트에만 권장됩니다. 이 필드에 이벤트 제목을 입력하지 마세요. 대신 [`name`](#event-name)을 사용하여 이벤트 이름을 지정하세요. **권장하지 않음**: 캘리포니아 주 샌프란시스코  **권장**: 빌 그레이엄 시빅 센터  **권장사항**:   * 도시 전체에서 진행되는 이벤트가 아닌 경우 도시 이름을 추가하지 않습니다. * `location.name` 속성에는 이벤트 제목을 다시 입력하는 것이 아니라 장소 또는 위치의 이름을 입력해야 합니다. 위치 이름을 모르는 경우 이 속성을 사용하지 마세요. |
| `offers` | `Offer` 각 티켓 유형당 중첩된 `Offer`입니다. |
| `offers.availability` | `Text`  다음 중 하나입니다.   * `InStock`: 이벤트 티켓 재고가 있습니다. * `SoldOut`: 이벤트 티켓이 매진되었습니다. * `PreOrder`: 이벤트 티켓을 선주문할 수 있습니다.      ``` "offers": {   "@type": "Offer",   "availability": "https://schema.org/InStock" } ```  **참고:** 티켓이 아직 일반 대중에 판매되지 않는 경우 제공 여부를 생략하고 `validFrom`을 지정할 수 없습니다. |
| `offers.price` | `Number`  서비스 요금 및 수수료를 포함한 최저 가격입니다. 가격이 변경되거나 표가 매진되면 잊지 말고 업데이트하세요.  결제하지 않아도 되거나, 수수료 또는 서비스 요금 없이 이용 가능한 이벤트라면 `price`를 `0`로 설정하세요.     ``` "offers": {   "@type": "Offer",   "price": 30 } ``` |
| `offers.priceCurrency` | `Text`  3글자 ISO 4217 통화 코드입니다.     ``` "offers": {   "@type": "Offer",   "priceCurrency": "USD" } ``` |
| `offers.validFrom` | `DateTime`  [ISO-8601 형식](https://en.wikipedia.org/wiki/ISO_8601)으로 나타낸 티켓 판매 시작일 및 시작 시간입니다. 날짜 제한 이벤트인 경우에만 필수 속성입니다.     ``` "offers": {   "@type": "Offer",   "validFrom": "2024-05-21T12:00" } ``` |
| `offers.url` | [URL](https://schema.org/URL)  티켓 구매 기능을 제공하는 페이지의 URL입니다.     ``` "offers": {   "@type": "Offer",   "url": "https://www.example.com/event_offer/12345_201803180430" } ```   이 URL은 다음 요구사항을 충족해야 합니다.   * 일반 대중 가운데 어떠한 사용자에게나 관련 이벤트의 입장을 제공하는 티켓을 구매할 기회를 주로 명확하게 제공하는 방문 페이지로 연결되어야 합니다. * 사용자가 이벤트를 포함하고 있는 웹페이지를 클릭할 수 있는 링크여야 합니다. * Googlebot이 크롤링할 수 있어야 합니다(robots.txt에 의해 차단되지 않아야 함). |
| `organizer` | `Organization` 또는 `Person`  이벤트를 개최하는 사람 또는 조직입니다. `organizer`를 포함하는 경우, 다음 속성을 추가하는 것이 좋습니다.   * [`organizer.name`](#organizer-name) * [`organizer.url`](#organizer-url) |
| `organizer.name` | `Text`  이벤트를 개최하는 사람 또는 조직의 이름입니다. |
| `organizer.url` | `URL`  이벤트 주최자의 도메인 URL입니다. |
| `performer` | `Person`  아티스트, 코미디언과 같이 이벤트에서 공연하는 참여자입니다. 각 공연자당 하나의 중첩된 `PerformingGroup` 또는 `Person`을 사용하세요. |
| `performer.name` | [텍스트](https://schema.org/Text)  아티스트 이름 또는 코미디언 이름과 같이 이벤트에서 공연하는 참여자의 이름입니다.     ``` "performer": {   "@type": "PerformingGroup",   "name": "Kira and Morrison" } ``` |
| `previousStartDate` | [DateTime](https://schema.org/DateTime)  이벤트의 일정이 조정된 경우 이전에 예정된 이벤트 시작일입니다. `previousStartDate`를 추가하는 경우 또한 [`eventStatus`](#eventstatus) 속성을 추가하고 `eventStatus`를 `EventRescheduled`로 설정해야 합니다. 다른 이벤트 상태는 사용하지 마세요.  [날짜 및 시간 가이드라인](#date-time-best-guidelines)을 준수해야 합니다.  일정이 조정된 이벤트인 경우 [`startDate`](#startdate) 속성은 새로 정한 시작일에만 사용해야 합니다. (드물지만) 이벤트가 여러 번 연기되고 일정이 조정된 경우 이 필드는 반복될 수 있습니다.     ``` {   "@context": "https://schema.org",   "@type": "Event",   "previousStartDate": ["2020-03-21T19:00-05:00", "2020-03-20T19:00-05:00", "2020-03-21T19:00-05:00"],   "eventStatus": "https://schema.org/EventRescheduled",   "startDate": "2020-07-21T19:00-05:00" } ``` |

## Search Console로 리치 결과 모니터링하기

Search Console은 Google 검색에서의 페이지 실적을 모니터링하는 데 도움이 되는 도구입니다.
Search Console에 가입해야만 페이지가 Google 검색결과에 포함되는 것은 아니지만, 가입하면 Google에서 사이트를 인식하는 방식을 이해하고 개선하는 데 도움이 될 수 있습니다. 다음과 같은 경우 Search Console을 확인하는 것이 좋습니다.

1. [구조화된 데이터를 처음 배포한 후](#after-deploying)
2. [새 템플릿을 출시하거나 코드를 업데이트한 후](#after-releasing)
3. [주기적으로 트래픽 분석](#analyzing-periodically)

### 구조화된 데이터를 처음 배포한 후

Google에서 페이지의 색인을 생성하고 나면 관련 [리치 결과 상태 보고서](https://support.google.com/webmasters/answer/7552505?hl=ko)를 사용하여 문제를 확인합니다.
유효한 항목 수가 증가하고 잘못된 항목 수는 증가하지 않는 것이 가장 좋습니다. 구조화된 데이터에 문제가 있는 경우 다음과 같이 해결하세요.

1. [잘못된 항목을 수정하세요](#troubleshooting).
2. [실제 URL을 검사](https://support.google.com/webmasters/answer/9012289?hl=ko#test_live_page)하여 문제가 지속되는지 확인합니다.
3. 상태 보고서를 사용하여 [유효성 검사를 요청](https://support.google.com/webmasters/answer/13300208?hl=ko)합니다.

### 새 템플릿을 출시하거나 코드를 업데이트한 후

웹사이트를 대폭 변경한 후 구조화된 데이터의 잘못된 항목이 증가하는지 모니터링하세요.

* **잘못된 항목이 증가**했다면 새로 출시한 템플릿이 제대로 작동하지 않거나 사이트가 기존의 템플릿과 좋지 않은 방식으로 상호작용하게 된 것일 수 있습니다.
* **유효한 항목이 감소**했다면(잘못된 항목 증가와 일치하지 않음) 페이지에 구조화된 데이터를 더 이상 삽입하지 않는 것일 수 있습니다. [URL 검사 도구](https://support.google.com/webmasters/answer/9012289?hl=ko)를 사용하여 문제를 일으키는 원인을 알아보세요.

### 주기적으로 트래픽 분석

[실적 보고서](https://support.google.com/webmasters/answer/7576553?hl=ko)를 사용하여 Google 검색 트래픽을 분석합니다.
데이터를 통해 페이지가 Google 검색의 리치 결과로 표시되는 빈도, 사용자가 검색결과를 클릭하는 빈도, 검색결과에 표시되는 평균 게재순위를 확인할 수 있습니다. [Search Console API](https://developers.google.com/webmaster-tools/search-console-api-original/v3/how-tos/search_analytics?hl=ko)를 사용하여 이러한 결과를 자동으로 가져오는 방법도 있습니다.

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

이벤트가 Google의 이벤트 환경에 표시되지 않거나 Search Console에서 [구조화된 스팸성 마크업](https://support.google.com/webmasters/answer/3498001?ref_topic=6003164&hl=ko)으로 인해 직접 조치가 이루어진 경우 가장 일반적인 문제를 해결하고 [Google 가이드라인을 검토](#guidelines)해 보세요. 그래도 문제가 계속된다면 [이벤트 FAQ](https://support.google.com/webmasters/thread/10549347?hl=ko)를 확인하거나 [Google 검색 센터 포럼](https://support.google.com/webmasters/community?hl=ko)에 글을 게시해 주세요.

**Google에서는 구조화된 데이터가 검색결과에 표시된다고 보장하지 않습니다.** 페이지가 [리치 결과 테스트](https://search.google.com/test/rich-results?hl=ko)에 따라 올바르게 마크업된 경우에도 마찬가지입니다. Google이 검색결과에 사이트 소유자의 구조화된 데이터를 표시할 수 없는 일반적인 이유 목록은 [구조화된 데이터 일반 가이드라인](https://developers.google.com/search/docs/appearance/structured-data/sd-policies?hl=ko)을 참조하세요.

### 이벤트 위치가 없거나 잘못됨

*error* **문제 발생 원인**: Google이 `eventLocation`, `addressLocality` 또는 `addressRegion` 속성에 제공된 값을 인식하지 못합니다.
Google에서 위치 정보를 실제 위치와 일치시키려고 하지만 제공된 위치가 없거나 잘못되었습니다.

*done* **문제 해결**

1. 구조화된 데이터에 `eventLocation`,
   `addressLocality` 또는 `addressRegion` 값을 포함합니다(일부 위치
   속성만 적용 가능하므로 위치에 따라 다름).
2. `location.name` 필드가 위치 이름을 사용하는지 확인하고 이름이 없다면 필드를 비워둡니다. 일반적인 문제로는 이벤트 이름을 `location.name` 필드에 실수로 입력하는 경우가 있습니다.
3. 다음과 같이 수정사항을 확인합니다.
   1. [리치 결과 테스트](https://search.google.com/test/rich-results?hl=ko)를 엽니다.
   2. **URL 가져오기** 상자에 이벤트 게시물 URL을 입력합니다.
   3. **유효성 검사**를 클릭합니다.
   4. **미리보기**를 클릭합니다.

      **성공**: 리치 결과 테스트가 Google 검색 미리보기 도구에 올바른 `eventLocation`을 표시합니다.

      **다시 시도**: 리치 결과 테스트가 Google 검색 미리보기 도구의 이벤트 위치에 'false'를 표시합니다. 이 위치는 실제 위치여야 합니다.

### 내 사이트가 티켓 구매 옵션으로 표시되지 않음

*error* **문제 발생 원인**:
`offers.url` 속성이 누락되었거나
[URL 요구사항](#url-requirements)을 충족하지 않습니다.

*done* **문제 해결**

1. 구조화된 데이터에 `offers.url` 속성이 포함되어 있는지 확인합니다.
2. URL이 `offers.url`의 [URL 요구사항](#url-requirements)을 충족하는지 확인합니다.
3. Google에 [사이트 재크롤링](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl?hl=ko)을 요청합니다.
4. [(재)평가 요청](https://docs.google.com/forms/d/e/1FAIpQLSeoRYNFmYPdoj81jJAl9wS_0RsU-y8b9rVjHgZ1hZzCFXJ8hw/viewform?hl=ko)을 제출합니다.

### 시간 또는 날짜가 잘못됨

*error* **문제 발생 원인**: 시간 또는 날짜가 잘못되었습니다. 일반적인 오류로는
시간대를 오프셋하지 않았거나 잘못된 시작 시간을 지정한 경우(예: 시작 시간으로 자정을
지정함)가 있습니다.

*done* **문제 해결**

1. **올바른 현지 시간 오프셋을 지정합니다**. 예를 들어, 이벤트가 뉴욕 시간 저녁 7시(UTC - 5)에 시작해서 저녁 9시에 종료되는 경우 `startDate` 값은 `2019-08-15T19:00:00-05:00`, `endDate` 값은 `2019-08-15T21:00:00-05:00`입니다. 이벤트 오프셋을 입력할 수 없다면 시간을 오프셋하지 마세요(예: `2019-08-15T19:00:00` 사용).
2. **시작 또는 종료 시간이 정확한지 확인합니다**. 흔한 실수 중에는 이벤트가 실제로는 자정에 시작하지 않는데 이벤트 시작 시간을 자정으로 설정하는 경우가 있습니다. 하루 종일 진행되는 이벤트이거나 시작 시간이 정해지지 않은 경우 날짜만 지정하세요. 예를 들면 다음과 같습니다.

   **권장**: `2019-07-20`

   **권장하지 않음**: `2019-07-20T00:00:00`

   **권장하지 않음**: `2019-08-15T00:00:01+00:00`

   **권장하지 않음**: `2019-08-15T00:00:00+00:00`
