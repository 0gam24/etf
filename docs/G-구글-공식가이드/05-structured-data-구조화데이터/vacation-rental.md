# 구조화된 공유숙박(VacationRental) 데이터

> **출처(Source):** https://developers.google.com/search/docs/appearance/structured-data/vacation-rental?hl=ko
> **저작자(Attribution):** Google
> **라이선스(License):** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
> 이 문서는 Google 검색 센터 문서를 Markdown으로 변환한 사본입니다.
> 원문의 최신 내용은 위 출처 링크를 확인하세요.

---

# 구조화된 공유숙박(`VacationRental`) 데이터

![Google 검색에 표시된 공유숙박을 보여주는 그림](https://developers.google.com/static/search/docs/images/vacation-rental-rich-result.png?hl=ko)

공유숙박 등록정보 페이지에 구조화된 데이터를 추가하면 Google 검색에서 등록정보를 더 풍부하게 표시할 수 있습니다. 사용자는 이름, 설명, 이미지, 위치, 평점, 리뷰 등의 비즈니스 정보를 검색결과에서 바로 확인할 수 있습니다.

## 시작하기 전에

이 안내는 이미 Google 기술계정 관리자와 연결되어 있고
[Hotel Center](https://hotelcenter.google.com/?hl=ko)에 액세스할 수 있는 사이트를 대상으로 합니다.
공유숙박 등록정보를 통합하고 싶다면
[공유숙박 신청 양식](https://services.google.com/fb/forms/googlevacationrentalsinterestform/?hl=ko)을 작성하세요.
양식을 작성하는 것은 관심의 표현이며, 얼리 어답터 프로그램에 초대받는 것을 보장하지는 않습니다.

이 기능은 특정 자격 기준을 충족하는 사이트에서만 사용할 수 있으며, 통합을 완료하려면 추가
[단계가 필요](https://support.google.com/hotelprices/answer/11946837?hl=ko)
합니다. Google에 공유숙박을 등록하는 방법을 자세히 알아보려면 통합 [시작 가이드](https://support.google.com/hotelprices/answer/12568039?hl=ko)를 참고하세요.

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

다음은 JSON-LD를 사용한 간단한 공유숙박 등록정보의 예입니다.

  

```
<html>
  <head>
    <title>My Beautiful Vacation Rental</title>
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "VacationRental",
        "additionalType": "HolidayVillageRental",
        "brand": {
          "@type": "Brand",
          "name": "brandIdName"
        },
        "containsPlace": {
          "@type": "Accommodation",
          "additionalType": "EntirePlace",
          "bed": [{
            "@type": "BedDetails",
            "numberOfBeds" : 1,
            "typeOfBed": "Queen"
          },
          {
            "@type": "BedDetails",
            "numberOfBeds" : 2,
            "typeOfBed": "Single"
          }],
         "occupancy": {
            "@type": "QuantitativeValue",
            "value" : 2
          },
          "amenityFeature": [
            {
              "@type": "LocationFeatureSpecification",
              "name": "ac",
              "value": true
            },
            {
              "@type": "LocationFeatureSpecification",
              "name": "airportShuttle",
              "value": true
            },
            {
             "@type": "LocationFeatureSpecification",
              "name": "balcony",
              "value": true
            },
            {
              "@type": "LocationFeatureSpecification",
              "name": "beachAccess",
              "value": true
            },
            {
              "@type": "LocationFeatureSpecification",
              "name": "childFriendly",
              "value": true
            }
          ],
          "floorSize": {
            "@type": "QuantitativeValue",
            "value" : 75,
            "unitCode": "MTK"
          },
          "numberOfBathroomsTotal": 1,
          "numberOfBedrooms": 3,
          "numberOfRooms": 5
        },
        "identifier": "abc123",
        "latitude": "42.12345",
        "longitude": "101.12345",
        "name": "My Beautiful Vacation Rental",
        "address": {
          "addressCountry": "US",
          "addressLocality": "Mountain View",
          "addressRegion": "California",
          "postalCode": "94043",
          "streetAddress": "1600 Amphitheatre Pkwy, Unit 6E"
        },
        "aggregateRating": {
          "ratingValue": 4.5,
          "ratingCount": 10,
          "reviewCount": 3,
          "bestRating": 5
        },
        "image": [
          "https://example.com/mylisting/unit_image1.png",
          "https://example.com/mylisting/unit_image2.png",
          "https://example.com/mylisting/unit_image3.png",
          "https://example.com/mylisting/unit_image4.png",
          "https://example.com/mylisting/unit_image5.png",
          "https://example.com/mylisting/unit_image6.png",
          "https://example.com/mylisting/unit_image7.png",
          "https://example.com/mylisting/unit_image8.png"
        ],
        "checkinTime": "18:00:00+08:00",
        "checkoutTime": "11:00:00+08:00",
        "description": "A great Vacation Rental in the perfect neighborhood.",
        "knowsLanguage": ["en-US", "fr-FR"],
        "review": [{
          "@type": "Review",
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": 4,
            "bestRating": 5
          },
          "author": {
            "@type": "Person",
            "name": "Lillian Ruiz"
          },
          "datePublished": "2024-12-01",
          "contentReferenceTime": "2024-11-17"
        },
        {
          "@type": "Review",
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": 5,
            "bestRating": 5
          },
          "author": {
            "@type": "Person",
            "name": "John S."
          },
          "datePublished": "2024-10-01",
          "contentReferenceTime": "2024-09-28"
        }
      ]
      }
    </script>
  </head>
  <body></body>
  </html>
```

## 자격요건 가이드라인

Google 검색에서 구조화된 공유숙박 데이터를 사용하려면 다음 가이드라인을 따라야 합니다.

* [공유숙박 정책](https://support.google.com/hotelprices/topic/12028304?hl=ko)
* [검색 Essentials](https://developers.google.com/search/docs/essentials?hl=ko)
* [구조화된 데이터 일반 가이드라인](https://developers.google.com/search/docs/appearance/structured-data/sd-policies?hl=ko)

**경고:** Google에서는 이 가이드라인을 하나 이상 위반하는 사이트에 [직접 조치](https://support.google.com/webmasters/answer/2604824?hl=ko)를 취할 수 있습니다. 문제가 되는 부분을 해결하고 나면 사이트 [재검토](https://support.google.com/webmasters/answer/35843?hl=ko) 요청을 제출할 수 있습니다.

## 구조화된 데이터 유형 정의

다음 표는 [schema.org/VacationRental](https://schema.org/VacationRental)을 사용하여 공유숙박 등록정보를 마크업하기 위한 속성 및 사용법을 나타냅니다.
구조화된 데이터를 표시하려면 필수 속성이 있어야 합니다. 권장 속성을 통해 콘텐츠에 관한 정보를 추가하여 더 만족스러운 사용자 환경을 제공할 수 있습니다.

### `VacationRental`

`VacationRental`의 전체 정의는 [schema.org/VacationRental](https://schema.org/VacationRental)에서 확인할 수 있습니다.

| 필수 속성 | |
| --- | --- |
| `containsPlace` | `Accommodation`  공유숙박 등록정보에는 침대, 숙박 인원, 객실 수, `amenityFeature` 속성과 같은 추가 세부정보를 마크업할 수 있는 [숙박 시설](https://schema.org/Accommodation) 1개가 포함되어야 합니다. |
| `containsPlace.occupancy` | `QuantitativeValue`  공유숙박 등록정보에서 숙박할 수 있는 최대 투숙객 수 정보입니다.     ``` "occupancy": {   "@type": "QuantitativeValue",   "value" : 5   } ``` |
| `containsPlace.occupancy.value` | `Integer`  공유숙박 등록정보에서 숙박할 수 있는 투숙객의 수치입니다. |
| `identifier` | `Text`  속성의 고유 식별자입니다.  추가 가이드라인:   * 식별자는 등록정보 콘텐츠와 구분되어야 합니다. 예를 들어 시설 소유자가 목록 이름이나 침실 수를 업데이트해도 식별자는 변경되지 않습니다. * 다른 언어로 된 동일한 비즈니스 정보에는 동일한 식별자를 사용해야 합니다. |
| `image` | 반복된 `URL`  하나 이상의 등록정보 이미지입니다. 등록정보에는 침실, 욕실, 공용 공간 이미지 최소 1장을 포함하여 최소 8장의 사진이 있어야 합니다.  또한 [숙박 시설 등록정보 이미지 요구사항](https://developers.google.com/hotels/vacation-rentals/dev-guide/onboarding?hl=ko#property_listing_image_requirements)을 따르세요. |
| `latitude`  (또는 `geo.latitude`) | `Number`  등록정보 위치의 위도입니다. 최소한 소수점 이하 5자리까지 정확히 표시해야 합니다. |
| `longitude`  (또는 `geo.longitude`) | `Number`  등록정보 위치의 경도입니다. 최소한 소수점 이하 5자리까지 정확히 표시해야 합니다. |
| `name` | `Text`  공유숙박 등록정보 이름입니다. |

| 권장 속성 | |
| --- | --- |
| `additionalType` | `Text`  공유숙박 등록정보 유형입니다. 다음은 몇 가지 권장 값입니다.   * `Apartment` * `Bungalow` * `Cabin` * `Chalet` * `Cottage` * `Gite` * `HolidayVillageRental` * `House` * `Villa` * `VacationRental`   이러한 값의 전체 정의는 [숙박 시설 비즈니스 카테고리](https://support.google.com/hotelprices/answer/9970971?ref_topic=10062823&hl=ko#VR)에서 확인할 수 있습니다. |
| `address` | `PostalAddress`  공유숙박의 실제 전체 위치입니다.  공유숙박의 상세 주소, 도시, 주 또는 지역, 우편번호를 입력합니다. 해당하는 경우 아파트 동호수를 입력합니다.  참고: 사서함 또는 기타 우편 전용 주소는 완전한 실제 주소로 간주되지 않습니다.     ``` "address": {   "addressCountry": "US",   "addressLocality": "Mountain View",   "addressRegion": "California",   "postalCode": "94043",   "streetAddress": "1600 Amphitheatre Pkwy, Apartment 4E" } ``` |
| `address.addressCountry` | `Text`  두 글자로 된 [ISO 3166-1 alpha-2 국가 코드](https://wikipedia.org/wiki/ISO_3166-1)를 사용하는 공유숙박 등록정보의 국가입니다. |
| `address.addressLocality` | `Text`  공유숙박 등록정보의 도시입니다. |
| `address.addressRegion` | `Text`  등록정보의 지역, 시/도 이름입니다. |
| `address.postalCode` | `Text`  공유숙박 등록정보의 우편번호입니다. |
| `address.streetAddress` | `Text`  아파트 동호수(해당하는 경우)를 포함한 공유숙박 등록정보의 전체 상세 주소입니다. |
| `aggregateRating` | `AggregateRating`  평균 공유숙박 평점은 여러 평점 또는 리뷰를 기반으로 합니다. [리뷰 스니펫 가이드라인](https://developers.google.com/search/docs/appearance/structured-data/review-snippet?hl=ko#guidelines) 및 필수/권장 [집계 평점 속성](https://developers.google.com/search/docs/appearance/structured-data/review-snippet?hl=ko#aggregated-rating-type-definition) 목록을 따르세요. |
| `brand` | `Brand`  이 속성과 연결된 브랜드 ID입니다. [Hotel Center 문서](https://support.google.com/hotelprices/answer/9919249?hl=ko)에서 숙박 시설을 브랜드에 연결하는 방법과 브랜드 아이콘과 표시 이름을 해당 브랜드 ID에 연결하는 방법을 자세히 알아보세요.     ``` "brand": {   "@type": "Brand",   "name" : "brandIdName" } ``` |
| `checkinTime` | `Time`  사용자가 숙박 시설에 체크인할 수 있는 가장 이른 시간으로 [ISO 8601 형식](https://wikipedia.org/wiki/ISO_8601)으로 나타냅니다.  예: `14:30:00+08:00` |
| `checkoutTime` | `Time`  사용자가 숙박 시설에 체크인할 수 있는 가장 늦은 시간으로 [ISO 8601 형식](https://wikipedia.org/wiki/ISO_8601)으로 나타냅니다.  예: `14:30:00+08:00` |
| `containsPlace.additionalType` | `Text`  숙박 시설의 객실 유형입니다. 다음 중 한 가지 값을 사용하세요.   * `EntirePlace` * `PrivateRoom` * `SharedRoom` |
| `containsPlace.amenityFeature` | 반복된 `amenityFeature`  숙박 시설에 특징 또는 편의시설이 있는지 여부 부울 예시는 다음 패턴을 따릅니다.     ``` "amenityFeature": {   "@type": "LocationFeatureSpecification",   "name" : "featureName",   "value": true } ```  **불리언 값** `amenityFeature.name` 속성에 다음 중 한 가지 값을 사용합니다. 영어가 아닌 등록정보의 경우에도 값은 영어로 되어 있어야 합니다.   |  |  | | --- | --- | | `ac` | 숙박 시설에 에어컨이 있는지 여부. | | `airportShuttle` | 호스트가 공항 또는 다른 터미널을 오가는 교통편을 제공하는지 여부. | | `balcony` | 숙박 시설에 발코니가 있는지 여부. | | `beachAccess` | 숙박 시설에서 근처에 있는 공용 해변을 이용할 수 있는지 여부. | | `childFriendly` | 숙박 시설이 어린이에게 적합한지 여부. | | `crib` | 숙박 시설에서 유아용 침대를 제공하는지 여부. | | `elevator` | 숙박 시설에 엘리베이터가 있는지 여부. | | `fireplace` | 숙박 시설에 벽난로가 있는지 여부. | | `freeBreakfast` | 숙박 시설의 조식 포함 여부. | | `gymFitnessEquipment` | 숙박 시설에 헬스장 또는 운동 기구가 있는지 여부. | | `heating` | 숙박 시설에 난방 시설이 있는지 여부. | | `hotTub` | 숙박 시설에 온수 욕조가 있는지 여부. | | `instantBookable` | 결제 프로세스를 통해 숙박 시설을 즉시 예약할 수 있는지 여부. 대체 프로세스 승인 대기 중. | | `ironingBoard` | 숙박 시설에 다림판이 제공되는지 여부. | | `kitchen` | 숙박 시설에 주방이 있는지 여부. | | `microwave` | 숙박 시설에 전자레인지가 있는지 여부 | | `outdoorGrill` | 숙박 시설에 그릴이 있는지 여부. | | `ovenStove` | 숙박 시설에 오븐 또는 스토브가 있는지 여부. | | `patio` | 숙박 시설에 테라스가 있는지 여부. | | `petsAllowed` | 투숙객이 숙소에 반려동물을 동반할 수 있는지 여부. 이 필드 대신 `containsPlace.petsAllowed` 속성을 사용할 수 있습니다. | | `pool` | 숙박 시설에 수영장이 있는지 여부. | | `privateBeachAccess` | 숙박 시설에서 비공개 해변 전용을 이용할 수 있는지 여부. | | `selfCheckinCheckout` | 숙박 시설이 자체 체크인 및 결제를 지원하는지 여부. | | `smokingAllowed` | 객실 내 흡연 허용 여부. 이 필드 대신 `containsPlace.smokingAllowed` 속성을 사용할 수 있습니다. | | | `tv` | 숙박 시설에 TV가 있는지 여부. | | `washerDryer` | 숙박 시설에 세탁기가 있는지 여부. | | `wheelchairAccessible` | 숙박 시설의 휠체어 이용 가능 여부. | | `wifi` | 숙박 시설에서 Wi-Fi를 제공하는지 여부. |   **불리언이 아닌 값**  `amenityFeature`에 다음과 같은 불리언이 아닌 `name` 및 `value` 쌍을 지원합니다. 영어가 아닌 등록정보의 경우에도 두 값은 영어로 되어 있어야 합니다.  불리언이 아닌 값은 다음 패턴을 따릅니다.     ``` "amenityFeature": {   "@type": "LocationFeatureSpecification",   "name" : "featureName",   "value": "detail"   } ```  |  |  | | --- | --- | | `internetType` | 숙박 시설에서 제공하는 인터넷 유형입니다. 다음은 몇 가지 권장 값입니다.   * `Free` * `Paid` * `None`      ``` "amenityFeature": {   "@type": "LocationFeatureSpecification",   "name" : "internetType",   "value": "Free" } ``` | | `parkingType` | 숙박 시설에서 제공하는 주차 유형입니다. 다음은 몇 가지 권장 값입니다.   * `Free` * `Paid` * `None`        ``` "amenityFeature": {   "@type": "LocationFeatureSpecification",   "name" : "parkingType",   "value": "Free" } ``` | | `poolType` | 숙박 시설에서 사용할 수 있는 풀 유형입니다. 다음은 몇 가지 권장 값입니다.   * `Indoor` * `Outdoor` * `None`  영어 문자열만 지원됩니다.      ``` "amenityFeature": {   "@type": "LocationFeatureSpecification",   "name" : "poolType",   "value": "Outdoor" } ``` | | `licenseNum` | 전 세계 일부 지역의 부동산에 대해 표시해야 하는 라이선스 번호(관광 또는 비즈니스)입니다. 라이선스 번호는 반복될 수 있으며 라이선스가 여러 개인 경우 라이선스 권한을 환경설정에 추가하는 것이 좋습니다(예: `Paris: 123456ABC`).     ``` "amenityFeature": {   "@type": "LocationFeatureSpecification",   "name" : "licenseNum",   "value": "Paris: 123456ABC" } ``` | |
| `containsPlace.bed` | 반복된 `BedDetails`  등록정보의 침대 유형과 수에 관한 정보입니다.     ``` "bed": [{   "@type": "BedDetails",   "numberOfBeds" : 1,   "typeOfBed": "Queen"   },   {   "@type": "BedDetails",   "numberOfBeds" : 2,   "typeOfBed": "Single"   }] ``` |
| `containsPlace.bed.numberOfBeds` | `Integer`  등록정보의 침대 수입니다. |
| `containsPlace.bed.typeOfBed` | `Text`  등록정보의 침대 유형입니다. 다음은 몇 가지 권장 값입니다.   * `CaliforniaKing` * `King` * `Queen` * `Full` * `Double` * `SemiDouble` * `Single` |
| `containsPlace.floorSize` | `QuantitativeValue`  숙박 시설의 크기입니다. `unitCode` 속성 값을 사용하여 지정해야 합니다.   * 제곱피트: `FTK` 또는 `SQFT` * 제곱미터: `MTK` 또는 `SQM`      ``` "floorSize": {   "@type": "QuantitativeValue",   "value" : 75,   "unitCode": "MTK"   } ``` |
| `containsPlace.numberOfBathroomsTotal` | `Integer`  등록정보의 총 욕실 수입니다. [RESO에 기재된](https://ddwiki.reso.org/display/DDW17/BathroomsTotalInteger+Field) 부동산 규칙을 따르고 욕실 수의 단순 합을 사용합니다. 예를 들어, 시설이 완비된 욕실 2개와 그 절반만 마련된 욕실 1개가 있는 숙박 시설의 총 욕실 수는 2.5개입니다. |
| `containsPlace.numberOfBedrooms` | `Integer`  등록정보의 총 침실 수입니다. |
| `containsPlace.numberOfRooms` | `Integer`  등록정보의 총 회의실 수입니다. |
| `description` | `Text`  속성에 대한 설명입니다. |
| `knowsLanguage` | `Repeated Text`  호스트가 사용할 수 있는 언어입니다. IETF BCP 47 표준의 언어 코드(예: `en-US` 또는 `fr-FR`)를 사용하세요. |
| `review` | `Repeated Review`  등록정보에 대한 하나 이상의 사용자 리뷰입니다. [리뷰 스니펫 가이드라인](https://developers.google.com/search/docs/appearance/structured-data/review-snippet?hl=ko#guidelines) 및 필수/권장 [리뷰 속성](https://developers.google.com/search/docs/appearance/structured-data/review-snippet?hl=ko#review-properties)의 목록을 따르세요. **참고**: 공유숙박의 경우 `review.datePublished`는 필수 입력란입니다.    ``` "review": {   "@type": "Review",   "reviewRating": {     "@type": "Rating",     "ratingValue": 4,     "bestRating": 5   },   "datePublished": "2023-02-09"   "author": {     "@type": "Person",     "name": "Lillian R"   } } ``` |
| `review.contentReferenceTime` | `DateTime` 이 속성은 **프랑스에 위치한 공유숙박 시설 목록에 필요**합니다. 작성자의 체류 시작일입니다. |

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
