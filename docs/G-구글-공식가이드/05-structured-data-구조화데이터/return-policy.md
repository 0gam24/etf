# 구조화된 판매자 반품 정책(MerchantReturnPolicy) 데이터

> **출처(Source):** https://developers.google.com/search/docs/appearance/structured-data/return-policy?hl=ko
> **저작자(Attribution):** Google
> **라이선스(License):** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
> 이 문서는 Google 검색 센터 문서를 Markdown으로 변환한 사본입니다.
> 원문의 최신 내용은 위 출처 링크를 확인하세요.

---

# 구조화된 판매자 반품 정책(`MerchantReturnPolicy`) 데이터

![검색 결과에 표시된 반품 정책이 포함된 쇼핑 지식 패널](https://developers.google.com/static/search/docs/images/return-policy.png?hl=ko)

많은 판매자가 고객이 구매한 제품을 반품하는 절차를 설명하는 반품 정책을 보유하고 있습니다.
사이트에 구조화된 `MerchantReturnPolicy` 데이터를 추가하면 Google 검색에서 이 정보를 사용하여 제품 옆과 검색 결과의 지식 패널에 반품 정책을 표시할 수 있습니다.
`MerchantReturnPolicy`를 사용하면 반품 정책 페이지 링크 또는 고객이 제품을 반품할 수 있는 조건, 반품 방법, 반품 수수료, 환불 옵션 등의 세부정보를 지정할 수 있습니다.

판매하는 대부분 또는 모든 제품에 적용되는 비즈니스의 표준 반품 정책은 `hasMerchantReturnPolicy` 속성을 사용하여 `Organization` 구조화된 데이터 유형 아래에 중첩된 `MerchantReturnPolicy` 구조화된 데이터 유형을 사용하여 지정할 수 있습니다.

특정 제품의 표준 반품 정책을 재정의해야 하는 경우 `Offer` 유형 아래에 하나 이상의 `MerchantReturnPolicy` 인스턴스를 지정합니다. 개별 제품의 반품 정책에 대한 자세한 내용은 [판매자 등록정보](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing?hl=ko#merchant-return-policy-properties) 문서를 참고하세요.
`Offer`에 지정된 개별 제품의 반품 정책은 여기에 설명된 것보다 더 제한된 속성 집합을 지원합니다.

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

다음은 독일, 오스트리아, 스위스의 고객에게 판매되고 아일랜드로 우편 반품해야 하는 제품의 반품 정책이 포함된 전체 `OnlineStore` 마크업의 예입니다.
60일의 반품 기간이 있으며 무료 반품이고 전액 환불됩니다. 새 제품만 반품할 수 있습니다.

```
  {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "name": "Example Online Store",
    "url": "https://www.example.com",
    "sameAs": ["https://example.net/profile/example12", "https://example.org/@example34"],
    "logo": "https://www.example.com/assets/images/logo.png",
    "contactPoint": {
      "contactType": "Customer Service",
      "email": "support@example.com",
      "telephone": "+47-99-999-9900"
    },
    "vatID": "FR12345678901",
    "iso6523Code": "0199:724500PMK2A2M1SQQ228",
    
    "hasMerchantReturnPolicy": {
      "@type": "MerchantReturnPolicy",
      "applicableCountry": [ "DE", "AT", "CH"],
      "returnPolicyCountry": "IE",
      "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
      "merchantReturnDays": 60,
      "itemCondition": "https://schema.org/NewCondition",
      "returnMethod": "https://schema.org/ReturnByMail",
      "returnFees": "https://schema.org/FreeReturn",
      "refundType": "https://schema.org/FullRefund",
      "returnLabelSource": "https://schema.org/ReturnLabelCustomerResponsibility"
    }
    
  }
```

다음은 고객 변심 또는 결함 상품의 반품 옵션과 반품 기간을 30일로 제한하는 시즌 예외를 포함한 전체 구조화된 `MerchantReturnPolicy` 데이터 마크업의 예입니다.

```
  <html>
  <head>
    <title>Our return policy</title>
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "OnlineStore",
        "hasMerchantReturnPolicy": {
          "@type": "MerchantReturnPolicy",
          "applicableCountry": [ "DE", "AT", "CH"],
          "returnPolicyCountry": "IE",
          "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
          "merchantReturnDays": 60,
          "itemCondition": [ "https://schema.org/NewCondition", "https://schema.org/DamagedCondition" ],
          "returnMethod": "https://schema.org/ReturnByMail",
          "returnFees": "https://schema.org/ReturnShippingFees",
          "refundType": "https://schema.org/FullRefund",
          "returnShippingFeesAmount": {
            "@type": "MonetaryAmount",
            "value": 2.99,
            "currency": "EUR"
          },
          "returnLabelSource": "https://schema.org/ReturnLabelInBox",
          "customerRemorseReturnFees": "https://schema.org/ReturnShippingFees",
          "customerRemorseReturnShippingFeesAmount": {
            "@type": "MonetaryAmount",
            "value": 5.99,
            "currency": "EUR"
          },
          "customerRemorseReturnLabelSource": "https://schema.org/ReturnLabelDownloadAndPrint",
          "itemDefectReturnFees": "https://schema.org/FreeReturn",
          "itemDefectReturnLabelSource": "https://schema.org/ReturnLabelInBox",
          "returnPolicySeasonalOverride": {
            "@type": "MerchantReturnPolicySeasonalOverride",
            "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
            "startDate": "2025-12-01",
            "endDate": "2025-01-05",
            "merchantReturnDays": 30
          }
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

Google 검색에서 반품 정책 마크업을 사용하려면 다음 가이드라인을 따라야 합니다.

* [구조화된 데이터 일반 가이드라인](https://developers.google.com/search/docs/appearance/structured-data/sd-policies?hl=ko)
* [검색 Essentials](https://developers.google.com/search/docs/essentials?hl=ko)
* [기술 가이드라인](#technical-guidelines)

### 기술 가이드라인

* 반품 정보는 사이트 내에서 비즈니스의 반품 정책을 설명하는 단일 페이지에 배치하는 것이 좋습니다. 사이트의 모든 페이지에 포함할 필요는 없습니다. 구조화된 `Organization` 데이터 유형 아래에 구조화된 `MerchantReturnPolicy` 데이터 유형을 포함합니다. 자세한 내용은 [조직 마크업](https://developers.google.com/search/docs/appearance/structured-data/organization?hl=ko)에서 참고하세요.
* 특정 제품에 대한 비표준 반품 정책이 있는 경우 `Offer` 구조화된 데이터 유형 아래에 `MerchantReturnPolicy` 구조화된 데이터 유형을 지정합니다. 혜택 수준 반품 정책에 지원되는 속성은 조직 수준 반품 정책에 지원되는 속성의 하위 집합입니다.
  제품 수준 반품 정책에 지원되는 속성의 하위 집합은 [판매자 등록정보 마크업](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing?hl=ko)을 참고하세요.

## 구조화된 데이터 유형 정의

구조화된 데이터가 Google 검색에서 사용될 수 있으려면 필수 속성을 포함해야 합니다. 권장 속성을 통해 반품 정책에 관한 정보를 추가하여 더 만족스러운 사용자 환경을 제공할 수 있습니다.

### `MerchantReturnPolicy`(`hasMerchantReturnPolicy` 속성을 사용하여 `Organization` 아래에 중첩됨)

다음 속성을 사용하여 비즈니스의 표준 반품 정책을 설명하세요.

| 필수 속성(사용 사례에 가장 적합한 옵션 선택) | |
| --- | --- |
| 옵션 A | |
| `applicableCountry` | `Text`  반품 정책이 적용되는 국가 코드(제품이 판매되고 반품될 국가)입니다. 두 글자로 된 [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1) 국가 코드 형식을 사용합니다. 최대 50개의 국가를 지정할 수 있습니다. |
| `returnPolicyCategory` | `MerchantReturnEnumeration`  반품 정책 유형입니다. 다음 중 한 가지 값을 사용하세요.   * `https://schema.org/MerchantReturnFiniteReturnWindow`: 반품 기간이 정해져 있습니다. * `https://schema.org/MerchantReturnNotPermitted`: 반품이 허용되지 않습니다. * `https://schema.org/MerchantReturnUnlimitedWindow`: 제품을 반품할 수 있는 기간이 정해져 있지 않습니다.   `MerchantReturnFiniteReturnWindow`를 사용하는 경우 [`merchantReturnDays`](#merchant-return-days) 속성이 필요합니다. |
| 옵션 B | |
| `merchantReturnLink` | `URL`  고객에게 반품 정책을 설명하는 웹페이지의 URL을 지정합니다. 자체 반품 정책일 수도 있고, 반품 처리 서비스를 제공하는 서드 파티의 정책일 수도 있습니다. |

#### 유한 또는 무제한 반품 기간

[`returnPolicyCategory`](#return-policy-category)가 `MerchantReturnFiniteReturnWindow` 또는 `MerchantReturnUnlimitedWindow`로 설정된 경우 다음 속성을 사용하는 것이 좋습니다.

| 권장 속성 | |
| --- | --- |
| `merchantReturnDays` | `Integer`  배송일로부터 제품을 반품할 수 있는 일수입니다. 이 속성은 [`returnPolicyCategory`](#return-policy-category)가 `MerchantReturnFiniteReturnWindow`인 경우에만 필요합니다. |
| `returnFees` | `ReturnFeesEnumeration`  기본적인 반품 수수료 유형입니다. 지원되는 다음 값 중 하나를 사용하세요.   * `https://schema.org/FreeReturn`: 소비자가 제품을 반품할 때 비용이 청구되지 않습니다. 이 값을 사용하는 경우 [`returnShippingFeesAmount`](#return-shipping-fees-amount) 속성을 포함하지 마세요. * `https://schema.org/ReturnFeesCustomerResponsibility`: 소비자가 직접 반품 배송을 처리하고 배송비를 지불해야 합니다. 이 값을 사용하는 경우 [`returnShippingFeesAmount`](#return-shipping-fees-amount) 속성을 포함하지 마세요. * `https://schema.org/ReturnShippingFees`: 제품을 반품할 때 판매자가 소비자에게 청구하는 배송비가 있습니다. [`returnShippingFeesAmount`](#return-shipping-fees-amount) 속성을 사용해 배송비(0이 아님)를 명시하세요. |
| `returnMethod` | `ReturnMethodEnumeration`  제공되는 반품 방법 유형입니다. 다음 값 중 하나 이상을 사용하세요.   * `https://schema.org/ReturnAtKiosk`: 상품을 키오스크에서 반품할 수 있습니다. * `https://schema.org/ReturnByMail`: 상품을 우편으로 반품할 수 있습니다. * `https://schema.org/ReturnInStore`: 상품을 매장에 반품할 수 있습니다. |
| `returnShippingFeesAmount` | `MonetaryAmount`  제품을 반품할 때 청구되는 배송비입니다. 이 속성은 [`returnFees`](#return-fees)가 `https://schema.org/ReturnShippingFees`인 경우에만 지정해야 합니다. |

#### 유한 또는 무제한 반품 기간

[`returnPolicyCategory`](#return-policy-category)가 `MerchantReturnFiniteReturnWindow` 또는 `MerchantReturnUnlimitedWindow`로 설정된 경우 다음 속성을 추가로 사용하는 것이 좋습니다.

| 권장 속성 | |
| --- | --- |
| `customerRemorseReturnFees` | `ReturnFeesEnumeration`  고객 변심으로 인해 제품을 반품하는 경우 적용되는 특정 유형의 반품 수수료입니다. 가능한 값은 [`returnFees`](#return-fees)을 참고하세요. |
| `customerRemorseReturnLabelSource` | `ReturnLabelSourceEnumeration`  소비자가 제품의 반품 배송물 라벨을 얻는 방법입니다. 가능한 값은 [`returnLabelSource`](#return-label-source)을 참고하세요. |
| `customerRemorseReturnShippingFeesAmount` | `MonetaryAmount`  고객 변심으로 인한 반품 배송비입니다. 이 속성은 소비자가 제품을 반품하기 위해 지불해야 하는 배송비가 0이 아닌 경우에만 필요합니다. 자세한 내용은 [`returnShippingFeesAmount`](#return-shipping-fees-amount)을 참고하세요. |
| `itemCondition` | `OfferItemCondition`  반품 가능한 상품 조건입니다. 반품이 허용되는 여러 조건을 지정할 수 있습니다. 다음 값을 사용합니다.   * `https://schema.org/DamagedCondition`: 손상된 상품이 허용됩니다. * `https://schema.org/NewCondition`: 새 상품이 허용됩니다. * `https://schema.org/RefurbishedCondition`: 리퍼 상품이 허용됩니다. * `https://schema.org/UsedCondition`: 중고품이 허용됩니다. |
| `itemDefectReturnFees` | `ReturnFeesEnumeration`  결함 제품에 대한 특정 유형의 반품 수수료입니다. 가능한 값은 [`returnFees`](#return-fees)을 참고하세요. |
| `itemDefectReturnLabelSource` | `ReturnLabelSourceEnumeration`  소비자가 제품의 반품 배송물 라벨을 얻을 수 있는 방법입니다. 가능한 값은 [`returnLabelSource`](#return-label-source)을 참고하세요. |
| `itemDefectReturnShippingFeesAmount` | `MonetaryAmount`  제품 결함으로 인해 제품을 반품하는 경우 부과되는 배송비입니다. 이 속성은 소비자가 제품을 반품하기 위해 지불해야 하는 배송비가 0이 아닌 경우에만 필요합니다. 자세한 내용은 [`returnShippingFeesAmount`](#return-shipping-fees-amount)을 참고하세요. |
| `refundType` | `RefundType`  제품을 반품할 때 소비자가 받을 수 있는 환불 유형입니다.   * `https://schema.org/ExchangeRefund`: 상품을 동일한 제품으로 교환할 수 있습니다. * `https://schema.org/FullRefund`: 전체 금액을 환불받을 수 있습니다. * `https://schema.org/StoreCreditRefund`: 상품을 스토어 크레딧으로 환불받을 수 있습니다. |
| `restockingFee` | `MonetaryAmount` 또는 `Number`  제품을 반품할 때 소비자에게 부과되는 재입고 수수료입니다. `Number` 유형의 값을 지정하여 소비자가 지불한 가격의 비율을 청구하거나 `MonetaryAmount`를 사용하여 고정 금액을 청구합니다. |
| `returnLabelSource` | `ReturnLabelSourceEnumeration`  소비자가 제품의 반품 배송물 라벨을 얻을 수 있는 방법입니다. 다음 중 한 가지 값을 사용하세요.   * `https://schema.org/ReturnLabelCustomerResponsibility`: 반품 라벨을 만드는 것은 소비자의 책임입니다. * `https://schema.org/ReturnLabelDownloadAndPrint`: 고객이 반품 라벨을 다운로드하여 인쇄해야 합니다. * `https://schema.org/ReturnLabelInBox`: 제품이 처음 배송될 때 반품 라벨이 포함되었습니다. |
| `returnPolicyCountry` | `Text`  상품을 반품해야 하는 국가입니다. 이 국가는 제품의 원래 배송 출발지 또는 도착지인 국가와 다를 수 있습니다. [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1) 국가 코드 형식으로 입력하세요. 최대 50개의 국가를 지정할 수 있습니다. |

#### 시즌 예외 속성

조직 수준 반품 정책에 시즌 예외를 정의해야 하는 경우 다음 속성이 필요합니다.

| 필수 속성 | |
| --- | --- |
| `returnPolicySeasonalOverride` | `MerchantReturnPolicySeasonalOverride`  연말연시와 같은 특별 이벤트에 대한 반품 정책을 지정하기 위한 반품 정책의 시즌 예외입니다. 예를 들어 평소 반품 정책 카테고리가 `MerchantReturnPolicyUnlimitedWindow`로 설정되어 있다고 해도 연말연시 할인 중에는 반품 기간을 다음과 같이 제한해야 합니다.     ```   "returnPolicySeasonalOverride": {     "@type": "MerchantReturnPolicySeasonalOverride",     "startDate": "2024-11-29",     "endDate": "2024-12-06",     "merchantReturnDays": 10,     "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow"   } ```   여러 개의 시즌 예외를 지정하는 방법은 다음과 같습니다. 이 예에서 일반적인 반품 정책은 무제한이지만 다음의 두 기간 동안 제한됩니다.     ```   "returnPolicySeasonalOverride": [{     "@type": "MerchantReturnPolicySeasonalOverride",     "startDate": "2024-11-29",     "endDate": "2024-12-06",     "merchantReturnDays": 10,     "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow"   },   {     "@type": "MerchantReturnPolicySeasonalOverride",     "startDate": "2024-12-26",     "endDate": "2025-01-06",     "merchantReturnDays": 10,     "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow"   }] ``` |
| `returnPolicySeasonalOverride.returnPolicyCategory` | `MerchantReturnEnumeration`  반품 정책 유형입니다. 다음 중 한 가지 값을 사용하세요.   * `https://schema.org/MerchantReturnFiniteReturnWindow`: 반품 기간이 정해져 있습니다. * `https://schema.org/MerchantReturnNotPermitted`: 반품이 허용되지 않습니다. * `https://schema.org/MerchantReturnUnlimitedWindow`: 제품을 반품할 수 있는 기간이 정해져 있지 않습니다.   `MerchantReturnFiniteReturnWindow`를 사용하는 경우 `merchantReturnDays` 속성이 필요합니다. |

조직 수준 반품 정책에 시즌 예외를 정의해야 하는 경우 다음 속성을 사용하는 것이 좋습니다.

| 권장 속성 | |
| --- | --- |
| `returnPolicySeasonalOverride.endDate` | `Date` 또는 `DateTime`  시즌 예외의 종료일입니다. |
| `returnPolicySeasonalOverride.merchantReturnDays` | `Integer` 또는 `Date` 또는 `DateTime`  배송일로부터 제품을 반품할 수 있는 일수입니다. 이 속성은 `returnPolicyCategory`를 `MerchantReturnFiniteReturnWindow`로 설정한 경우에만 필요합니다. |
| `returnPolicySeasonalOverride.startDate` | `Date` 또는 `DateTime`  시즌 예외의 시작일입니다. |

## Google에서 배송비 설정을 구성하는 다른 방법

소매업체 반품 정책은 복잡할 수 있으며 자주 변경될 수 있습니다. 마크업으로 반품 세부정보를 최신 상태로 나타내고 저장하는 데 문제가 있으며 Google 판매자 센터 계정을 가지고 있다면 Google 판매자 센터에서 [반품 정책](https://support.google.com/merchants/answer/10220642?hl=ko)을 구성하는 것이 좋습니다. 또는 [Search Console에서 계정 수준 반품 정책](https://support.google.com/webmasters/answer/14907594?hl=ko)을 설정하면 판매자 센터에 자동으로 추가됩니다.

### 여러 반품 설정 결합

다양한 반품 설정을 조합하는 경우 우선순위에 따라 정책 정보를 적용할 수 있습니다. 예를 들어 사이트에서 [반품 정책 마크업](https://developers.google.com/search/docs/appearance/structured-data/organization?hl=ko#merchant-return-policy-properties)과 Search Console의 반품 정책 설정을 모두 제공하는 경우 Google은 Search Console에 제공된 정보만 사용합니다.

Google은 다음과 같은 우선순위(강한 순서에서 약한 순서)를 사용합니다.

* Content API for Shopping([반품 설정](https://developers.google.com/shopping-content/guides/free-listings-return-settings?hl=ko))
* [판매자 센터](https://support.google.com/merchants/answer/14011730?hl=ko) 또는 [Search Console](https://support.google.com/webmasters/answer/14907594?hl=ko) 설정
* [제품 수준 판매자 등록정보 마크업](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing?hl=ko)
* [조직 수준 마크업](#merchant-return-policy-properties)

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
