# 구조화된 판매자 배송 정책 데이터(ShippingService)

> **출처(Source):** https://developers.google.com/search/docs/appearance/structured-data/shipping-policy?hl=ko
> **저작자(Attribution):** Google
> **라이선스(License):** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
> 이 문서는 Google 검색 센터 문서를 Markdown으로 변환한 사본입니다.
> 원문의 최신 내용은 위 출처 링크를 확인하세요.

---

# 구조화된 판매자 배송 정책 데이터(`ShippingService`)

![검색 결과에 표시된 배송 정보가 포함된 쇼핑 지식 패널](https://developers.google.com/static/search/docs/images/shipping-policy.png?hl=ko)

많은 판매자는 고객이 구매한 제품을 배송하는 절차를 설명하는 배송 정책을 보유하고 있습니다.
사이트에 구조화된 `ShippingService` 데이터를 추가하면 Google 검색에서 이 정보를 사용하여 제품 옆과 검색 결과의 지식 패널에 배송 정보를 표시할 수 있습니다.
`ShippingService`를 사용하면 제품 중량, 크기, 배송 위치와 같은 제품 특성에 따라 배송비, 배송 기간 등의 세부정보를 지정할 수 있습니다.

판매하는 대부분 또는 모든 제품에 적용되는 비즈니스의 일반 배송 정책은 `hasShippingService` 속성을 사용하여 `Organization` 구조화된 데이터 유형 아래에 중첩된 `ShippingService` 구조화된 데이터 유형을 사용하여 지정할 수 있습니다.

특정 제품의 일반 배송 정책을 재정의해야 하는 경우 `shippingDetails` 속성을 사용하여 `Offer` 유형 아래에 중첩된 `OfferShippingDetails` 유형의 인스턴스를 하나 이상 지정합니다. 개별 제품의 배송 정책에 대한 자세한 내용은 [판매자 등록정보](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing?hl=ko#merchant-shipping-policy-properties) 문서를 참고하세요. `Offer` 아래에 지정된 개별 제품의 배송 정책은 `Organization` 아래에 지정된 배송 정책에 대해 여기에 설명된 것보다 더 제한된 속성 집합을 지원합니다.

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

이 예에서는 미국과 캐나다의 경우 29.99달러 이상 주문 시 무료 2일 배송이 제공되며,
그 외의 경우 3.49달러에 3일 배송이 제공됩니다. 멕시코의 경우 50달러 미만 주문에는 배송이 제공되지 않으며,
그 외의 경우 10%의 배송비에 4일 배송이 제공됩니다.

```
  <html>
  <head>
    <title>Our shipping policy</title>
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "https://schema.org/Organization",
        "hasShippingService": {
            "@type": "ShippingService",
            "@id": "#us_ca_mx_standard_shipping",
            "name": "Standard shipping policies for US, Canada and Mexico",
            "description": "US and Canada: Free 2-day shipping for orders over $29.99,
                            otherwise 3-day shipping for $3.49.
                            Mexico: No shipping to Mexico for orders under $50,
                            otherwise 10% shipping cost and 4-day shipping.",
            "fulfillmentType": "FulfillmentTypeDelivery",
            "handlingTime": {
              "@type": "ServicePeriod",
              "cutoffTime": "14:30:00-07:00",
              "duration": {
                "@type": "QuantitativeValue",
                "minValue": 0,
                "maxValue": 1,
                "unitCode": "DAY"
              },
              "businessDays": [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday"
              ]
            },
            "shippingConditions": [
              {
                "@type": "ShippingConditions",
                "shippingDestination": [
                  {
                    "@type": "DefinedRegion",
                    "addressCountry": "US"
                  },
                  {
                    "@type": "DefinedRegion",
                    "addressCountry": "CA"
                  }
                ],
                "orderValue": {
                  "@type": "MonetaryAmount",
                  "minValue": 0,
                  "maxValue": 29.99,
                  "currency": "USD"
                },
                "shippingRate": {
                  "@type": "MonetaryAmount",
                  "value": 3.49,
                  "currency": "USD"
                },
                "transitTime": {
                  "@type": "ServicePeriod",
                  "duration": {
                    "@type": "QuantitativeValue",
                    "minValue": 1,
                    "maxValue": 2,
                    "unitCode": "DAY"
                  },
                  "businessDays": [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday"
                  ]
                }
              },
              {
                "@type": "ShippingConditions",
                "shippingDestination": [
                  {
                    "@type": "DefinedRegion",
                    "addressCountry": "US"
                  },
                  {
                    "@type": "DefinedRegion",
                    "addressCountry": "CA"
                  }
                ],
                "orderValue": {
                  "@type": "MonetaryAmount",
                  "minValue": 30,
                  "currency": "USD"
                },
                "shippingRate": {
                  "@type": "MonetaryAmount",
                  "value": 0,
                  "currency": "USD"
                },
                "transitTime": {
                  "@type": "ServicePeriod",
                  "duration": {
                    "@type": "QuantitativeValue",
                    "minValue": 1,
                    "maxValue": 1,
                    "unitCode": "DAY"
                  },
                  "businessDays": [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday"
                  ]
                }
              },
              {
                "@type": "ShippingConditions",
                "shippingDestination": {
                  "@type": "DefinedRegion",
                  "addressCountry": "MX"
                },
                "orderValue": {
                  "@type": "MonetaryAmount",
                  "minValue": 0,
                  "maxValue": 49.99,
                  "currency": "USD"
                },
                "doesNotShip": true
              },
              {
                "@type": "ShippingConditions",
                "shippingDestination": {
                  "@type": "DefinedRegion",
                  "addressCountry": "MX"
                },
                "orderValue": {
                  "@type": "MonetaryAmount",
                  "minValue": 50,
                  "currency": "USD"
                },
                "shippingRate": {
                  "@type": "ShippingRateSettings",
                  "orderPercentage": 0.10
                },
                "transitTime": {
                  "@type": "ServicePeriod",
                  "duration": {
                    "@type": "QuantitativeValue",
                    "minValue": 2,
                    "maxValue": 3,
                    "unitCode": "DAY"
                  },
                  "businessDays": [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday"
                  ]
                }
              }
           ]
        }
        // Other Organization-level properties
        // ...
    }
    </script>
  </head>
  <body>
  </body>
</html>
```

## 가이드라인

Google 검색에서 배송 정책 마크업을 사용하려면 다음 가이드라인을 따라야 합니다.

* [구조화된 데이터 일반 가이드라인](https://developers.google.com/search/docs/appearance/structured-data/sd-policies?hl=ko)
* [검색 Essentials](https://developers.google.com/search/docs/essentials?hl=ko)
* [기술 가이드라인](#technical-guidelines)

### 기술 가이드라인

* 배송 정책 정보는 비즈니스의 배송 정책을 설명하는 사이트의 단일 페이지에 배치하는 것이 좋습니다. 사이트의 모든 페이지에 포함할 필요는 없습니다. 구조화된 `Organization` 데이터 유형 아래에 구조화된 `ShippingService` 데이터 유형을 포함합니다. 자세한 내용은 [조직 마크업](https://developers.google.com/search/docs/appearance/structured-data/organization?hl=ko)을 참고하세요.
* 특정 제품에 대한 비일반 배송 정책이 있는 경우 `Offer` 구조화된 데이터 유형 아래에 `OfferShippingDetails` 구조화된 데이터 유형을 직접 지정하세요. 제품 수준 배송 정책에 지원되는 속성은 조직 수준 배송 정책에 지원되는 속성의 하위 집합입니다.
  제품 수준 배송 정책에 지원되는 속성의 하위 집합은 [판매자 등록정보 마크업](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing?hl=ko)을 참고하세요.

## 구조화된 데이터 유형 정의

구조화된 데이터가 Google 검색에서 사용될 수 있으려면 필수 속성을 포함해야 합니다. 권장 속성을 통해 배송 정책에 관한 정보를 추가하여 더 만족스러운 사용자 환경을 제공할 수 있습니다.

### `ShippingService`(`hasShippingService` 속성을 사용하여 `Organization` 아래에 중첩됨)

다음 속성을 사용하여 비즈니스의 일반 배송 서비스를 설명하세요.

| 필수 속성 | |
| --- | --- |
| `shippingConditions` | `ShippingConditions`  제품 중량 범위, 제품 크기, 주문 금액 또는 배송 위치와 같은 특정 조건에 적용되는 배송비 또는 배송 기간을 지정합니다. `ShippingService`에는 여러 `shippingConditions`가 있을 수 있습니다. 제품에 두 개 이상의 `ShippingConditions`가 적용되는 경우, 해당 상황에서 가장 낮은 제품 배송비를 계산하여 고객에게 배송비 및 관련 배송 속도를 표시합니다. 배송비가 동일한 경우 가장 빠른 배송 속도로 배송 정보가 표시됩니다. |

| 권장 속성 | |
| --- | --- |
| `name` | `Text`  해당하는 경우 배송 서비스의 고유한 이름입니다. 예를 들어 '일반 배송'입니다. |
| `description` | `Text`  배송 서비스에 대한 설명입니다(해당하는 경우). 일반적으로 이름보다 포괄적입니다. |
| `fulfillmentType` | `FulfillmentTypeEnumeration`  해당하는 경우 이 배송 서비스의 제품이 고객에게 배송되는 방식입니다.   * `https://schema.org/FulfillmentTypeDelivery`: 이 서비스는 고객의 주소로 제품을 배송합니다(이 속성이 지정되지 않은 경우 기본값임). * `https://schema.org/FulfillmentTypeCollectionPoint`: 고객이 수령할 수 있도록 제품이 화물 취급소로 배송됩니다. |
| `handlingTime` | `ServicePeriod`  주문 상품 준비 시간(예: 창고)에 관한 선택적 정보입니다(해당하는 경우). Google에서 지원하는 `ShippingService` 유형의 [`ServicePeriod`](#shipping-service-handling-time-properties) 속성 목록도 참고하세요. |
| `validForMemberTier` | `MemberProgramTier`  이 배송 서비스가 유효한 포인트 멤버십 및 등급입니다(해당하는 경우). 모든 등급의 배송 설정이 동일한 경우 여러 회원 등급을 지정할 수 있습니다.  `validForMemberTier` 속성을 사용하여 회원 배송 혜택을 지정하는 경우 일반(비회원) 배송 서비스도 하나 이상 제공해야 합니다.  비즈니스에 제공하는 포인트 멤버십 및 등급은 판매자 센터 계정에 정의되어 있거나 조직의 관리 세부정보 및 정책을 정의하는 별도의 페이지에 있는 구조화된 `Organization` 데이터 아래에 중첩된 구조화된 `MemberProgram` 데이터 유형을 사용하여 정의될 수 있습니다. 조직의 회원 프로그램과 등급을 정의하는 방법에 관한 자세한 내용은 [포인트 멤버십 마크업](https://developers.google.com/search/docs/appearance/structured-data/loyalty-program?hl=ko)을 참고하세요.  다음은 판매자 센터에 정의된 회원 프로그램(*member-plus*) 및 등급(*silver*)을 참조하는 `validForMemberTier` 속성의 예입니다.     ``` "validForMemberTier": {   "@type": "MemberProgramTier",   "name": "silver",   "isTierOf": {     "@type": "MemberProgram",     "name": "member-plus"   } } ```   다음은 `validForMemberTier` 속성이 구조화된 `MemberProgram` 데이터(별도의 페이지에 있는 `Organization` 구조화된 데이터 유형 아래에 중첩되어 있음) 아래에 중첩된 구조화된 `MemberProgramTier` 데이터를 참조하는 예입니다. `MemberProgramTier` 인스턴스는 정의의 고유 리소스 식별자(URI)를 지정하는 `@id` 속성으로 식별됩니다. `https://www.example.com/com/member-plus#tier_silver`:     ``` "validForMemberTier": {   "@id": "https://www.example.com/com/member-plus#tier_silver" } ```   이 속성은 아직 베타 버전입니다. 페이지 외부의 구조화된 `MemberProgramTier` 데이터는 Google 검색에 바로 표시되지 않을 수 있습니다. |

#### `ServicePeriod`(주문 상품 준비 시간)

`ServicePeriod` 유형은 운송 기간을 지정하는 데도 사용됩니다. 운송 기간을 지정할 때는 `cutoffTime` 속성이 사용되지 않습니다. 자세한 내용은 [운송 기간에 대한 `ServicePeriod`](#shipping-service-transit-time-properties)를 참고하세요.

배송 처리 시간을 지정하려면 `ServicePeriod` 유형을 사용하세요.

다음은 주문이 월요일부터 금요일까지 처리되고 마감 시간이 동부 표준시 오후 10시 30분인 `ServicePeriod` 유형의 예입니다. 주문 상품 준비 시간은 0~2일입니다(주문 상품 준비 시간이 0일인 경우 마감 시간 전에 주문이 접수되면 당일에 처리됨).

```
"handlingTime": {
  "@type": "ServicePeriod",
  "businessDays": [
    "https://schema.org/Monday",
    "https://schema.org/Tuesday",
    "https://schema.org/Wednesday",
    "https://schema.org/Thursday",
    "https://schema.org/Friday"
  ],
  "cutoffTime": "22:30:00-05:00",
  "duration": {
    "@type": "QuantitativeValue",
    "minValue": 0,
    "maxValue": 2,
    "unitCode": "DAY"
  }
}
```

| 권장 속성 | |
| --- | --- |
| `businessDays` | `DayOfWeek`  접수된 주문이 처리되는 요일입니다(해당하는 경우). |
| `cutoffTime` | `Time`  당일에 접수된 주문이 당일에 처리되기 위한 마감 시간입니다(해당하는 경우). 주문 마감 시간 이후에 처리되는 주문에는 예상 배송 시간에 하루가 더 추가됩니다. 시간은 ISO-8601 시간 형식을 사용하여 표시됩니다. 예를 들어 '23:30:00-05:00'은 협정 세계시(UTC)보다 5시간 늦은 동부 표준시(EST) 오후 6시 30분을 나타냅니다. |
| `duration` | `QuantitativeValue`  주문이 접수되는 시점부터 상품이 창고를 떠나기까지의 지연 시간입니다(해당하는 경우). |

#### `QuantitativeValue`(배송 처리 기간)

`QuantitativeValue` 유형을 사용하여 최소 및 최대 주문 상품 준비 시간을 나타냅니다.
`unitCode`와 함께 `value`(고정 주문 상품 준비 시간) 또는 `maxValue`(최대 주문 상품 준비 시간)을 제공해야 합니다. `minValue`는 선택적으로 제공되어 주문 상품 준비 시간의 하한을 지정할 수 있습니다.

| 권장 속성 | |
| --- | --- |
| `maxValue` | `Number`  최대 일수입니다. 이 값은 음수가 아닌 정수여야 합니다. |
| `minValue` | `Number`  최소 일수입니다(해당하는 경우). 이 값은 음수가 아닌 정수여야 합니다. |
| `unitCode` | `Text`  최솟값/최댓값의 단위입니다. 값은 `DAY` 또는 `d`이어야 합니다. |
| `value` | `Number`  알고 있는 경우 정확한 주문 상품 준비 일수입니다. 이 값은 음수가 아닌 정수여야 합니다. 제공된 경우 `minValue` 및 `maxValue`를 지정해서는 안 됩니다. |

### `ShippingConditions`(`shippingConditions` 속성을 사용하여 `ShippingService` 아래에 중첩됨)

다음 속성을 사용하여 배송 서비스의 조건, 관련 비용, 운송 기간을 설명합니다.

배송 목적지가 지정되지 않은 경우 배송 조건은 전 세계 모든 배송 목적지에 적용됩니다.

| 권장 속성 | |
| --- | --- |
| `doesNotShip` | `Boolean`  해당하는 경우 지정된 `shippingOrigin`의 위치에서 지정된 `shippingDestination`의 위치로 `weight`, `numItems`, `orderValue` 조건의 지정된 조합이 있는 주문을 배송할 수 없는 경우 `true`로 설정합니다. |
| `numItems` | `QuantitativeValue`  해당하는 경우 이 배송 조건 객체의 주문 내 제품 수 범위입니다. Google에서 지원하는 `ShippingConditions` 유형과 관련된 [`QuantitativeValue`](#shipping-quantitative-value-properties) 속성 목록도 참고하세요. |
| `orderValue` | `MonetaryAmount`  이 배송 조건 객체의 주문 비용 범위입니다(해당하는 경우). Google에서 지원하는 `ShippingConditions` 유형과 관련된 [`MonetaryAmount`](#shipping-conditions-monetary-amount-properties) 속성 목록도 참고하세요. |
| `shippingDestination` | `DefinedRegion`  해당하는 경우 배송 목적지를 나타냅니다. Google에서 지원하는 `shippingDestination` 속성 하위 [`DefinedRegion`](#defined-region-properties) 속성 목록을 참고하세요. |
| `shippingOrigin` | `DefinedRegion`  해당하는 경우 배송 출발지를 나타냅니다. Google에서 지원하는 `shippingOrigin` 속성 하위 [`DefinedRegion`](#defined-region-properties) 속성 목록을 참고하세요. |
| `seasonalOverride` | `OpeningHoursSpecification`  해당하는 경우 이 속성을 사용하여 이 배송 조건 객체가 유효한 제한된 기간을 지정합니다. Google에서 `ShippingConditions` 유형에 지원하는 [`OpeningHoursSpecification`](#shipping-seasonal-override-properties) 속성 목록도 참고하세요. |
| `shippingRate` | `ShippingRateSettings` 또는 `MonetaryAmount`  해당하는 경우 이 속성을 사용하여 지정된 `shippingOrigin`의 위치에서 지정된 `shippingDestination`의 위치로 `weight`, `numItems`, `orderValue` 조건의 지정된 조합이 있는 주문을 배송하는 데 드는 배송비를 지정합니다. Google에서 `ShippingConditions` 유형에 지원하는 [`ShippingRateSettings`](#shipping-rate-settings-properties) 속성 및 [`MonetaryAmount`](#shipping-monetary-amount-properties) 속성 목록도 참고하세요. 이 속성은 `doesNotShip`이 없거나 `false`로 설정된 경우에만 지정해야 합니다. |
| `transitTime` | `ServicePeriod`  해당하는 경우 배송 출발지(일반적으로 창고)에서 출발하여 배송 목적지(일반적으로 고객)에 도착할 때까지의 예상 운송 기간을 지정하는 데 사용합니다. `weight`, `numItems`, `orderValue` 조건의 지정된 조합이 있는 주문에 대해 지정된 `shippingOrigin` 속성의 위치에서 지정된 `shippingDestination` 속성의 위치로 배송되는 경우에 적용됩니다. Google에서 지원하는 [`ServicePeriod`](#shipping-service-transit-time-properties) 속성 목록도 참고하세요. 이 속성은 `doesNotShip` 속성이 없거나 `false`로 설정된 경우에만 지정해야 합니다. |
| `weight` | `QuantitativeValue`  이 배송 조건 객체의 패키지 무게 범위입니다(해당하는 경우). Google에서 지원하는 `ShippingConditions` 유형 관련 [`QuantitativeValue`](#shipping-quantitative-value-properties) 속성 목록도 참고하세요. |

#### `DefinedRegion`

`DefinedRegion` 유형을 사용하여 맞춤 지역을 만들면 다양한 배송 서비스에서 정확한 배송비와 운송 기간을 설정할 수 있습니다.

| 필수 속성 | |
| --- | --- |
| `addressCountry` | `Text`  [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1) 형식의 두 자리 국가 코드입니다. |

| 권장 속성 | |
| --- | --- |
| `addressRegion` | `Text`  국가별 지역 코드입니다(해당하는 경우). 지역은 국가 코드 없이 2자리 또는 3자리의 ISO 3166-2 하위 코드여야 합니다. Google 검색은 미국, 오스트레일리아, 일본만 지원합니다. 예: `NY`(미국 뉴욕 주), `NSW`(오스트레일리아 뉴사우스웨일스 주), `03`(일본 이와테 현)  지역 정보와 우편번호 정보를 동시에 제공하지 마세요. |
| `postalCode` | `Text`  국가별 우편번호입니다(해당하는 경우). 예: `94043` 우편번호는 오스트레일리아, 캐나다, 미국에서 지원됩니다. |

#### `ServicePeriod`(운송 기간)

`ServicePeriod` 유형을 사용하여 주문 상품의 운송 기간 범위를 나타냅니다.

`ServicePeriod` 유형을 사용하여 주문 상품 준비 시간을 지정할 수도 있습니다. 주문 상품 준비 시간에 관한 자세한 내용은 [`ServicePeriod`](#shipping-service-handling-time-properties)를 참고하세요.
예:

```
"transitTime": {
  "@type": "ServicePeriod",
  "businessDays": [
    "https://schema.org/Monday",
    "https://schema.org/Tuesday",
    "https://schema.org/Wednesday",
    "https://schema.org/Thursday",
    "https://schema.org/Friday"
  ],
  "duration": {
    "@type": "QuantitativeValue",
    "minValue": 0,
    "maxValue": 2,
    "unitCode": "DAY"
  }
}
```

| 권장 속성 | |
| --- | --- |
| `businessDays` | `DayOfWeek`  주문 상품이 운송 중인 요일입니다(해당하는 경우). 조직의 영업일이 월요일~토요일인 경우 이 속성을 추가하지 않아도 됩니다. |
| `duration` | `QuantitativeValue`  영업일 기준 운송 일수입니다(해당하는 경우). Google에서 지원하는 운송 기간의 [`QuantitativeValue`](#shipping-quantitative-value-properties) 속성 목록도 참고하세요. |

#### `QuantitativeValue`(배송 운송 기간)

`QuantitativeValue` 유형을 사용하여 최소 및 최대 주문 운송 기간을 나타냅니다.
`unitCode`와 함께 `value`(고정 운송 기간) 또는 `maxValue`(최대 운송 기간)를 제공해야 합니다. `minValue`
를 선택적으로 제공하여 운송 기간의 하한을 지정할 수 있습니다.

| 권장 속성 | |
| --- | --- |
| `maxValue` | `Number`  최대 일수입니다. 이 값은 음수가 아닌 정수여야 합니다. |
| `minValue` | `Number`  최소 일수입니다(해당하는 경우). 이 값은 음수가 아닌 정수여야 합니다. |
| `unitCode` | `Text`  운송 기간 단위입니다. 값은 `DAY` 또는 `d`이어야 합니다. |
| `value` | `Number`  알고 있는 경우 정확한 운송 일수입니다. 이 값은 음수가 아닌 정수여야 합니다. 제공된 경우 `minValue` 및 `maxValue`를 지정해서는 안 됩니다. |

#### `QuantitativeValue`(배송 포장 크기 컨텍스트)

`ShippingConditions` 컨텍스트에서 `QuantitativeValue` 유형을 사용하여 특정 배송비 요율과 운송 기간이 적용되는 배송 포장 크기(`weight` 및 `numItems`)의 값 범위를 나타냅니다.
`minValue` 또는 `maxValue` 속성을 제공해야 합니다. `minValue` 속성은 제공되지 않은 경우 기본값은 0이고 `maxValue` 속성은 제공되지 않은 경우 기본값은 무한대입니다.

`QuantitativeValue` 유형을 사용하여 `ShippingService` 유형의 주문 상품 준비 시간과 `ShippingConditions` 유형의 운송 기간을 지정할 수도 있습니다.
자세한 내용은 [`QuantitativeValue`(주문 상품 준비 시간)](#handling-time-quantitative-value-properties) 및 [`QuantitativeValue`(운송 기간)](#transit-time-quantitative-value-properties)을 참고하세요.

| 권장 속성 | |
| --- | --- |
| `maxValue` | `Number`  해당하는 경우 크기(`weight` 또는 `numItems`)의 최대 수입니다. 제공되지 않은 경우 기본값은 무한대입니다. |
| `minValue` | `Number`  해당하는 경우 크기(`weight` 또는 `numItems`)의 최소 수입니다. `maxValue`보다 작아야 합니다. 제공되지 않은 경우 기본값은 0입니다. |
| `unitCode` | `Text`  크기(`weight` 또는 `numItems`)와 관련된 단위입니다(해당하는 경우). UN/CEFACT 공통 코드(3자) 형식:   * 무게 단위의 경우 값은 `LBR`(파운드) 또는 `KGM`(킬로그램)이어야 합니다. * 상품 수의 경우 `unitCode`를 생략할 수 있습니다. 또는 UN/CEFACT 공통 코드 이름 `H87`을 사용할 수 있습니다. |

#### `MonetaryAmount`(배송 조건 컨텍스트)

배송 조건 컨텍스트에서 `MonetaryAmount` 유형을 사용하여 특정 배송비 요율과 배송 기간이 적용되는 주문 금액 범위를 나타냅니다.
`minValue` 또는 `maxValue` 속성을 제공해야 합니다. 제공되지 않은 경우 `minValue` 속성은 기본값이 0이고 `maxValue` 속성은 기본값이 무한대입니다. 다른 형식으로 `MonetaryAmount` 유형을 사용하여 [배송비를 지정](#shipping-monetary-amount-properties)할 수도 있습니다.

| 필수 속성 | |
| --- | --- |
| `currency` | `Text`  주문 금액의 통화 코드입니다([ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) 형식). |
| `maxValue` | `Number`  주문의 최댓값입니다. 제공되지 않은 경우 기본값은 무한대입니다. |
| `minValue` | `Number`  주문의 최솟값입니다. 제공되지 않은 경우 기본값은 0입니다. |

#### `MonetaryAmount`(배송비 요율 컨텍스트)

배송비 요율 컨텍스트에서 `MonetaryAmount` 유형을 사용하여 특정 배송 조건의 특정 또는 최대 배송비 요율을 지정합니다. `MonetaryAmount` 유형은 더 복잡한 `ShippingRateSettings`의 간단한 대안으로 사용할 수 있으며 특정 또는 최대 배송비 요율을 지정해야 하는 경우에 사용할 수 있습니다. `maxValue` 또는 `value` 속성을 `currency` 속성과 함께 제공해야 합니다.

| 필수 속성 | |
| --- | --- |
| `currency` | `Text`  배송비의 통화 코드입니다([ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) 형식). |
| `maxValue` | `Number`  주어진 배송 조건의 최대 배송비입니다. `maxValue` 속성을 지정하는 경우 `value` 속성을 지정하지 마세요. |
| `value` | `Number`  주어진 배송 조건의 고정 배송비입니다. 무료 배송의 경우 `0`을 값으로 사용합니다. |

#### `ShippingRateSettings`(배송비 요율 컨텍스트)

배송비 요율 컨텍스트에서 `ShippingRateSettings` 유형을 사용하여 특정 배송 조건의 배송비 요율을 주문 값 또는 주문 상품 중량의 백분율로 지정합니다. `ShippingRateSettings` 유형을 사용하는 경우 `orderPercentage` 또는 `weightPercentage` 속성을 제공해야 합니다.

`MonetaryAmount` 유형은 더 복잡한 `ShippingRateSettings` 유형의 간단한 대안이며 고정 배송비 요율을 지정해야 하는 경우에 사용할 수 있습니다.

| 권장 속성 | |
| --- | --- |
| `orderPercentage` | `Number`  주어진 배송 조건의 배송비로, 주문 금액의 일부입니다. `0`에서 `1` 사이의 값을 사용합니다. |
| `weightPercentage` | `Number`  주어진 배송 조건의 배송비로, 배송된 상품 중량의 일부입니다. `0`에서 `1` 사이의 값을 사용합니다. |

#### `OpeningHoursSpecification`(계절별 배송 재정의 컨텍스트)

배송 조건 컨텍스트에서 `OpeningHoursSpecification` 유형을 사용하여 조건이 유효한 시점을 나타냅니다(예: 계절별 휴일). `OpeningHoursSpecification` 유형을 사용하는 경우 `validFrom` 및 `validThrough` 속성 중 하나 이상을 제공해야 합니다.

| 권장 속성 | |
| --- | --- |
| `validFrom` | `Date`  배송 조건이 유효한 첫 번째 날짜입니다. [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) 형식으로 나타냅니다. |
| `validThrough` | `Date`  배송 조건이 유효한 마지막 날짜입니다. [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) 형식으로 나타냅니다. |

## Google에서 배송비 설정을 구성하는 다른 방법

소매업체 배송 정책은 복잡할 수 있으며 자주 변경될 수 있습니다. 마크업으로 배송 세부정보를 최신 상태로 나타내고 저장하는 데 문제가 있으며 Google 판매자 센터 계정을 가지고 있다면 Google 판매자 센터에서 [배송 설정](https://support.google.com/merchants/answer/12577710?hl=ko)을 구성하는 것이 좋습니다. 또는 [Search Console에서 계정 수준 배송 정책](https://support.google.com/webmasters/answer/14907594?hl=ko)을 설정하면 판매자 센터에 자동으로 추가됩니다.

### 여러 배송 설정 결합

다양한 배송 설정을 조합하는 경우 우선순위에 따라 정책 정보를 적용할 수 있습니다. 예를 들어 사이트에서 배송 정책 마크업과 Search Console의 배송 정책 설정을 모두 제공하는 경우 Google은 Search Console에 제공된 정보만 사용합니다.

Google은 다음과 같은 우선순위(강한 순서에서 약한 순서)를 사용합니다.

* Content API for Shopping([계정 수준 배송 설정](https://developers.google.com/shopping-content/guides/how-tos/account-level-tax-shipping?hl=ko))
* [판매자 센터](https://support.google.com/merchants/answer/12577710?hl=ko) 또는 [Search Console](https://support.google.com/webmasters/answer/14907594?hl=ko) 설정
* [제품 수준 판매자 등록정보 마크업](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing?hl=ko)
* 조직 수준 마크업

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
