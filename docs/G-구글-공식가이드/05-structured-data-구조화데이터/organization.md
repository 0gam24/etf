# 구조화된 조직(Organization) 데이터

> **출처(Source):** https://developers.google.com/search/docs/appearance/structured-data/organization?hl=ko
> **저작자(Attribution):** Google
> **라이선스(License):** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
> 이 문서는 Google 검색 센터 문서를 Markdown으로 변환한 사본입니다.
> 원문의 최신 내용은 위 출처 링크를 확인하세요.

---

# 구조화된 조직(`Organization`) 데이터

![Google 검색 결과의 판매자 지식 패널](https://developers.google.com/static/search/docs/images/organization.png?hl=ko)


Google 검색 결과의 판매자 지식 패널

홈페이지에 구조화된 조직 데이터를 추가하면 Google에서 조직의 관리 세부정보를 더욱 효과적으로 파악하고 검색 결과에서 조직을 명확하게 표시할 수 있습니다. 일부 속성은 조직을 다른 조직으로부터 구분하기 위하여 비하인드에서 사용되지만(`iso6523` 및 `naics` 등) 다른 속성은 검색 결과 및 [지식 패널](https://support.google.com/knowledgepanel/answer/9163198?hl=ko)에 어떤 `logo`가 표시될지 등 검색 결과의 시각적인 요소에 영향을 줄 수도 있습니다.
판매자라면 [판매자 지식 패널](https://blog.google/products/shopping/google-merchant-new-features-holiday/?hl=ko) 및 [브랜드 프로필](https://support.google.com/merchants/answer/14998338?hl=ko)에서 반품 정책, 주소, 연락처 주소 등 계정의 세부정보에 영향을 미칠 수 있습니다. 필수 속성은 없지만 조직과 관련된 속성을 최대한 많이 추가하는 것이 좋습니다.

## 구조화된 데이터를 추가하는 방법

구조화된 데이터는 페이지 정보를 제공하고 페이지 콘텐츠를 분류하기 위한 표준화된 형식입니다. 구조화된 데이터를 처음 사용한다면 [구조화된 데이터의 작동 방식](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data?hl=ko)을 자세히 알아보세요.

다음은 구조화된 데이터를 빌드, 테스트 및 출시하는 방법의 개요입니다.

1. 웹페이지에 적용되는 [권장 속성](#structured-data-type-definitions)을 최대한 많이 추가하세요. 필수 속성은 없습니다. 대신 콘텐츠에 해당하는 속성을 추가하세요. 사용 중인 형식에 따라 [페이지에 구조화된 데이터를 삽입](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data?hl=ko#format-placement)하는 위치를 알아보세요.
   **CMS를 사용하고 있나요?** CMS에 통합된 플러그인을 사용하는 것이 더 쉬울 수 있습니다.
     
   **자바스크립트를 사용하고 있나요?** [자바스크립트로 구조화된 데이터를 생성](https://developers.google.com/search/docs/appearance/structured-data/generate-structured-data-with-javascript?hl=ko)하는 방법을 알아보세요.
2. [가이드라인](#guidelines)을 따릅니다.
3. [리치 결과 테스트](https://search.google.com/test/rich-results?hl=ko)를 사용하여 코드의 유효성을 검사하고 심각한 오류를 해결하세요. 또한 도구에서 신고될 수 있는 심각하지 않은 문제는 구조화된 데이터의 품질을 개선하는 데 도움이 될 수 있으므로 해결하는 것이 좋습니다. 그러나 리치 결과를 사용하기 위한 필수사항은 아닙니다.
4. 구조화된 데이터를 포함하는 일부 페이지를 배포하고 [URL 검사 도구](https://support.google.com/webmasters/answer/9012289?hl=ko)를 사용하여 Google에서 페이지를 표시하는 방법을 테스트합니다. Google이 페이지에 액세스할 수 있으며
   robots.txt 파일, `noindex` 태그 또는 로그인 요구사항에 의해
   차단되지 않는지 확인합니다. 페이지가 정상적으로 표시되면 [Google에 URL을 재크롤링하도록 요청](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl?hl=ko)할 수 있습니다. **참고**: Google이 재크롤링하고 색인을 다시 생성하는 동안 기다려 주세요. 페이지 게시 후 Google에서 페이지를 찾고 크롤링하는 데 며칠이 걸릴 수 있습니다.
5. Google에 향후 변경사항을 계속 알리려면 [사이트맵을 제출](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap?hl=ko)하는 것이 좋습니다. 이는 [Search Console Sitemap API](https://developers.google.com/webmaster-tools/v1/sitemaps?hl=ko)를 사용하여 자동화할 수 있습니다.

## 예

### `Organization`

다음은 JSON-LD 코드로 된 조직 정보의 예입니다.

  

```
<html>
  <head>
    <title>About Us</title>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "url": "https://www.example.com",
      "sameAs": ["https://example.net/profile/example1234", "https://example.org/example1234"],
      "logo": "https://www.example.com/images/logo.png",
      "name": "Example Corporation",
      "description": "The example corporation is well-known for producing high-quality widgets",
      "email": "contact@example.com",
      "telephone": "+47-99-999-9999",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Rue Improbable 99",
        "addressLocality": "Paris",
        "addressCountry": "FR",
        "addressRegion": "Ile-de-France",
        "postalCode": "75001"
      },
      "vatID": "FR12345678901",
      "iso6523Code": "0199:724500PMK2A2M1SQQ228"
    }
    </script>
  </head>
  <body>
  </body>
</html>
```

### 배송 정책 및 반품 정책이 있는 `OnlineStore`(`Organization` 하위유형)

다음은 JSON-LD 코드로 작성된 배송 정책과 반품 정책이 모두 있는 온라인 상점의 예입니다.

판매자 수준 표준 반품 정책의 자세한 내용과 추가 예시는 별도의 [판매자 반품 정책 마크업](https://developers.google.com/search/docs/appearance/structured-data/return-policy?hl=ko) 문서를 참고하세요.

```
<html>
  <head>
    <title>About Us</title>
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "OnlineStore",
        "name": "Example Online Store",
        "url": "https://www.example.com",
        "sameAs": [
          "https://example.net/profile/example12",
          "https://example.org/@example34"
        ],
        "logo": "https://www.example.com/assets/images/logo.png",
        "contactPoint": {
          "contactType": "Customer Service",
          "email": "support@example.com",
          "telephone": "+47-99-999-9900"
        },
        "vatID": "FR12345678901",
        "iso6523Code": "0199:724500PMK2A2M1SQQ228",
        "hasShippingService": [
          {
            "@type": "ShippingService",
            "name": "shipping to CH and FR",
            "description": "Shipping to CH 5% of order value, shipping to FR always free",
            "fulfillmentType": "FulfillmentTypeDelivery",
            "shippingConditions": [
              {
                "@type": "ShippingConditions",
                "shippingOrigin": {
                  "@type": "DefinedRegion",
                  "addressCountry": "FR"
                },
                "shippingDestination": {
                  "@type": "DefinedRegion",
                  "addressCountry": "CH"
                },
                "shippingRate": {
                  "@type": "ShippingRateSettings",
                  "orderPercentage": "0.05"
                }
              },
              {
                "@type": "ShippingConditions",
                "shippingOrigin": {
                  "@type": "DefinedRegion",
                  "addressCountry": "FR"
                },
                "shippingDestination": {
                  "@type": "DefinedRegion",
                  "addressCountry": "FR"
                },
                "shippingRate": {
                  "@type": "MonetaryAmount",
                  "value": "0",
                  "currency": "EUR"
                }
              }
            ]
          }
        ],
        "hasMerchantReturnPolicy": {
          "@type": "MerchantReturnPolicy",
          "applicableCountry": [
            "FR",
            "CH"
          ],
          "returnPolicyCountry": "FR",
          "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
          "merchantReturnDays": 60,
          "returnMethod": "https://schema.org/ReturnByMail",
          "returnFees": "https://schema.org/FreeReturn",
          "refundType": "https://schema.org/FullRefund"
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

구조화된 데이터가 Google 검색결과에 포함되도록 하려면 가이드라인을 따라야 합니다.

**경고:** Google에서는 이 가이드라인을 하나 이상 위반하는 사이트에 [직접 조치](https://support.google.com/webmasters/answer/2604824?hl=ko)를 취할 수 있습니다. 문제가 되는 부분을 해결하고 나면 사이트 [재검토](https://support.google.com/webmasters/answer/35843?hl=ko) 요청을 제출할 수 있습니다.

* [기술 가이드라인](#technical-guidelines)
* [검색 Essentials](https://developers.google.com/search/docs/essentials?hl=ko)
* [구조화된 데이터 일반 가이드라인](https://developers.google.com/search/docs/appearance/structured-data/sd-policies?hl=ko)

### 기술 가이드라인

이 정보는 홈페이지나 *회사 소개* 페이지와 같은 조직을 소개하는 단일 페이지에 배치하는 것이 좋습니다. 사이트의 모든 페이지에 포함할 필요는 없습니다.

조직에 부합하는 가장 구체적인 [`Organization`](https://schema.org/Organization)의 schema.org 하위유형을 사용하는 것이 좋습니다. 예를 들어 전자상거래 사이트를 운영하는 경우 [`OnlineBusiness`](https://schema.org/OnlineBusiness) 대신 [`OnlineStore`](https://schema.org/OnlineStore) 하위유형을 사용하는 것이 좋습니다.
예를 들어 음식점이나 오프라인 상점과 같은 지역 비즈니스에 관한 사이트인 경우 가장 구체적인 [하위 유형](https://developers.google.com/search/docs/appearance/structured-data/local-business?hl=ko#local-business-properties)인 [`LocalBusiness`](https://schema.org/LocalBusiness)를 제공하고 이 가이드에서 권장하는 필드 외에도 [지역 비즈니스](https://developers.google.com/search/docs/appearance/structured-data/local-business?hl=ko)의 필수 및 권장 필드를 따르는 것이 좋습니다.

## 구조화된 데이터 유형 정의

Google은 [`Organization`](https://schema.org/Organization)의 다음 속성을 인식합니다.
Google에서 페이지를 더 잘 이해할 수 있도록 웹페이지에 해당하는 권장 속성을 최대한 많이 포함하세요. 필수 속성은 없습니다. 대신 조직에 해당하는 속성을 추가하세요.

`name` 또는 `alternateName`와 같은 비즈니스 이름은 물론 실체(예: `address` 또는 `telephone`) 및 온라인 표식(예: `url` 또는 `logo`)과 같이 사용자에게 유용한 속성에 중점을 두는 것이 좋습니다.

| 권장 속성 | |
| --- | --- |
| `address` | `PostalAddress`  조직의 실제 또는 메일 주소입니다(해당하는 경우). 거주 국가에 적용되는 모든 속성을 포함합니다. 속성을 많이 제공할수록 사용자에게 게시되는 결과의 품질이 우수해집니다. 여러 도시, 주 또는 국가에 소재한 경우 주소를 여러 개 입력할 수 있습니다. 예를 들면 다음과 같습니다.     ``` "address": [{   "@type": "PostalAddress",   "streetAddress": "999 W Example St Suite 99 Unit 9",   "addressLocality": "New York",   "addressRegion": "NY",   "postalCode": "10019",   "addressCountry": "US" },{   "streetAddress": "999 Rue due exemple",   "addressLocality": "Paris",   "postalCode": "75001",   "addressCountry": "FR" }] ``` |
| `address.addressCountry` | `Text`  우편 주소의 국가이며 두 글자로 된 [ISO 3166-1 alpha-2 국가 코드](https://wikipedia.org/wiki/ISO_3166-1)를 사용합니다. |
| `address.addressLocality` | `Text`  우편 주소의 도시입니다. |
| `address.addressRegion` | `Text`  우편 주소의 지역입니다(해당하는 경우). 예: 주 |
| `address.postalCode` | `Text`  주소의 우편번호입니다. |
| `address.streetAddress` | `Text`  우편 주소의 전체 상세 주소입니다. |
| `alternateName` | `Text`  조직에서 사용하는 다른 공용 이름입니다(해당하는 경우). |
| `contactPoint` | `ContactPoint`  사용자가 비즈니스에 연락할 수 있는 가장 좋은 방법입니다(해당하는 경우). Google [권장사항](https://developers.google.com/search/blog/2021/07/customer-support?hl=ko)에 따라 사용자가 사용할 수 있는 모든 지원 방법을 포함합니다. 예를 들면 다음과 같습니다.     ``` "contactPoint": {   "@type": "ContactPoint",   "telephone": "+9-999-999-9999",   "email": "contact@example.com" } ``` |
| `contactPoint.email` | `Text`  비즈니스에 연락할 수 있는 이메일 주소입니다(해당하는 경우). `LocalBusiness` 유형을 사용하는 경우 `contactPoint`를 사용하여 조직에 도달하는 여러 방법을 지정하기 전에 `LocalBusiness` 수준에서 기본 이메일 주소를 지정합니다. |
| `contactPoint.telephone` | `Text`  비즈니스에 연락할 수 있는 전화번호입니다(해당하는 경우). 전화번호에는 국가 코드와 지역 번호가 포함되어 있어야 합니다. `LocalBusiness` 유형을 사용하는 경우 `contactPoint`를 사용하여 조직에 연락할 수 있는 여러 방법을 지정하기 전에 `LocalBusiness` 수준에서 기본 전화번호를 지정합니다. |
| `description` | `Text`  조직에 대한 자세한 설명입니다(해당하는 경우). |
| `duns` | `Text`  `Organization`를 식별하기 위한 Dun & Bradstreet DUNS 번호입니다. 대신 `0060:` 접두사가 있는 `iso6523Code` 필드를 사용하는 것이 좋습니다. |
| `email` | `Text`  비즈니스에 연락할 수 있는 이메일 주소입니다(해당하는 경우). |
| `foundingDate` | `Date`  `Organization`가 [ISO 8601 날짜 형식](https://en.wikipedia.org/wiki/ISO_8601)으로 설정된 날짜입니다(해당하는 경우). |
| `globalLocationNumber` | `Text`  `Organization`의 위치를 식별하는 GS1 글로벌 위치 번호입니다. |
| `hasMerchantReturnPolicy` | 반복된 `MerchantReturnPolicy`  `Organization`의 반품 정책입니다(해당하는 경우). `MerchantReturnPolicy`의 필수 및 선택 속성에 관한 자세한 내용은 [판매자 반품 정책 마크업](https://developers.google.com/search/docs/appearance/structured-data/return-policy?hl=ko#merchant-return-policy-properties)을 참고하세요.  `Organization`에 대한 반품 정책을 제공하지 않거나 일부 제품에 `Organization`에 정의된 반품 정책을 재정의해야 하는 특정 반품 정책이 있는 경우 [판매자 등록정보 마크업](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing?hl=ko#merchant-return-policy-properties) 아래에도 이 속성을 사용하세요. |
| `hasMemberProgram` | 반복된 `MemberProgram`  제공하는 회원(포인트) 프로그램입니다(해당하는 경우). `MemberProgram`의 필수 및 선택 속성에 관한 자세한 내용은 [회원 프로그램 마크업](https://developers.google.com/search/docs/appearance/structured-data/loyalty-program?hl=ko#member-program-properties)을 참고하세요. |
| `hasShippingService` | 반복된 `ShippingService`  `Organization`의 배송 정책입니다(해당하는 경우). `ShippingService`의 필수 및 선택 속성에 관한 자세한 내용은 [판매자 배송 정책 마크업](https://developers.google.com/search/docs/appearance/structured-data/shipping-policy?hl=ko#merchant-shipping-policy-properties)을 참고하세요.  `Organization`에 대한 배송 정책을 제공하지 않거나 일부 제품에 `Organization`에 정의된 배송 정책을 재정의해야 하는 특정 배송 정책이 있는 경우 [판매자 등록정보 마크업](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing?hl=ko#merchant-shipping-policy-properties) 아래에도 이 속성을 사용하세요. |
| `iso6523Code` | `Text`  조직의 ISO 6523 식별자입니다(해당하는 경우). ISO 6523 식별자의 첫 번째 부분은 사용되는 식별 체계를 정의하는 [`ICD`(국제코드지정포맷)](http://iso6523.info/icd_list.pdf)입니다. 두 번째 부분은 실제 식별자입니다. ICD와 식별자는 콜론 문자(`U+003A`)로 구분하는 것이 좋습니다. 일반적인 ICD 값은 다음과 같습니다.   * `0060`: Dun & Bradstreet 데이터 범용번호 부여 시스템(DUNS) * `0088`: GS1 글로벌 위치 번호(GLN) * `0199`: 법인 식별자(LEI) |
| `legalName` | `Text`  `Organization`의 등록 상호(해당하는 경우 및 `name` 속성과 다른 경우)입니다. |
| `leiCode` | `Text`  ISO 17442에 정의된 `Organization` 식별자입니다(해당하는 경우). 대신 `0199:` 접두사가 있는 `iso6523Code` 필드를 사용하는 것이 좋습니다. |
| `logo` | `URL` 또는 `ImageObject`  조직을 상징적으로 나타내는 로고입니다(해당하는 경우). 이 속성을 추가하면 Google에서 검색결과 및 지식 패널 등에서 표시할 로고를 더 잘 이해할 수 있습니다.  이미지 가이드라인:   * 이미지는 최소 112x112픽셀이어야 합니다. * 이미지 URL은 크롤링 및 색인 생성이 가능해야 합니다. * [Google 이미지에서 지원](https://developers.google.com/search/docs/appearance/google-images?hl=ko#supported-image-formats)되는 이미지 파일 형식이어야 합니다. * 완전히 흰색인 배경에 이미지가 표시될 때 의도한 대로 표시되는지 확인합니다. 예를 들어 로고가 거의 흰색이거나 회색이면 흰색 배경에 표시될 때 의도한 대로 표시되지 않을 수 있습니다.   `ImageObject` 유형을 사용하는 경우 `URL` 유형과 동일한 가이드라인을 따르는 유효한 `contentUrl` 속성 또는 `url` 속성이 있는지 확인합니다. |
| `naics` | `Text`  `Organization`의 [NAICS(북미 산업 분류 시스템) 코드](https://www.census.gov/naics/)입니다. |
| `name` | `Text`  조직 이름입니다. [사이트 이름](https://developers.google.com/search/docs/appearance/site-names?hl=ko)에 사용한 것과 동일한 `name` 및 `alternateName`를 사용합니다. |
| `numberOfEmployees` | `QuantitativeValue`  `Organization`의 직원 수입니다(해당하는 경우).  구체적인 직원 수를 보여주는 예:     ``` "numberOfEmployees": {   "@type": "QuantitativeValue",   "value": 2056 } ```   범위 내의 직원 수를 보여주는 예:     ``` "numberOfEmployees": {   "@type": "QuantitativeValue",   "minValue": 100,   "maxValue": 999 } ``` |
| `sameAs` | `URL`  조직에 관한 추가 정보가 포함된 다른 웹사이트의 페이지 URL입니다(해당하는 경우). 예를 들어 소셜 미디어 또는 리뷰 사이트의 조직 프로필 페이지 URL입니다. `sameAs` URL을 여러 개 제공할 수 있습니다. |
| `taxID` | `Text`  `Organization`에 관련 세금 ID입니다(해당하는 경우). `taxID`가 `address` 필드에 입력한 국가와 일치하는지 확인합니다. |
| `telephone` | `Text`  업체 전화번호는 고객을 위한 기본 연락 수단입니다(해당하는 경우). 전화번호에는 국가 코드와 지역 번호가 포함되어 있어야 합니다. |
| `url` | `URL`  조직의 웹사이트 URL입니다(해당하는 경우). URL을 사용하면 Google에서 조직을 고유하게 식별할 수 있습니다. |
| `vatID` | `Text`  소재 국가 및 비즈니스에 해당하는 경우 `Organization`와 관련된 부가가치세(VAT) 코드입니다. 사용자에게 중요한 신뢰 신호입니다. 예를 들어, 사용자는 공개 VAT 등록처에서 비즈니스를 조회할 수 있습니다. |

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
