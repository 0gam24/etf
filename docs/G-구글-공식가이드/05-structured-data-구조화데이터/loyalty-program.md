# 구조화된 포인트 멤버십(MemberProgram) 데이터

> **출처(Source):** https://developers.google.com/search/docs/appearance/structured-data/loyalty-program?hl=ko
> **저작자(Attribution):** Google
> **라이선스(License):** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
> 이 문서는 Google 검색 센터 문서를 Markdown으로 변환한 사본입니다.
> 원문의 최신 내용은 위 출처 링크를 확인하세요.

---

# 구조화된 포인트 멤버십(`MemberProgram`) 데이터

![검색 결과에 표시된 포인트 가격이 포함된 쇼핑 지식 패널](https://developers.google.com/static/search/docs/images/loyalty-program.png?hl=ko)

회원을 대상으로 특별 가격, 적립 포인트 등의 특별 혜택을 제공하는 포인트 멤버십을 운영하는 판매자가 많습니다. 사이트에 구조화된 `MemberProgram` 데이터를 추가하면 Google 검색에서 이 정보를 사용하여 검색 결과에 제품 및 지식 패널과 함께 포인트 제도 혜택을 표시할 수 있습니다.

비즈니스에서 제공하는 포인트 멤버십은 구조화된 `Organization` 데이터 유형 아래에 중첩된 구조화된 `MemberProgram` 데이터 유형을 사용하여 지정할 수 있습니다.
개별 제품에 적용되는 포인트 멤버십 혜택(예: 포인트 가격, 적립 포인트)을 지정하려면 [판매자 등록정보](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing?hl=ko#unit-price-specification-properties)에 설명된 대로 구조화된 `Offer` 데이터 마크업 아래에 `UnitPriceSpecification` 마크업을 별도로 추가합니다.

## 기능 제공 여부

포인트 멤버십 정보는 독일, 미국, 영국, 오스트레일리아, 브라질, 캐나다, 멕시코의 Google 검색 결과에서 확인할 수 있으며, 데스크톱과 모바일 모두에서 표시됩니다.

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

다음은 멤버십 등급이 두 개인 포인트 제도에 대한 구조화된 `MemberProgram` 데이터 마크업의 예입니다.

```
<html>
  <head>
    <title>About Us</title>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "OnlineStore",
      "hasMemberProgram": {
        "@type": "MemberProgram",
        "name": "Membership Plus",
        "description": "For frequent shoppers this is our top-rated loyalty program",
        "url": "https://www.example.com/membership-plus",
        "hasTiers": [
          {
            "@type": "MemberProgramTier",
            "@id": "#plus-tier-silver",
            "name": "silver",
            "url": "https://www.example.com/membership-plus-silver",
            "hasTierBenefit": [
              "https://schema.org/TierBenefitLoyaltyPoints"
            ],
            "membershipPointsEarned": 5
          },
          {
            "@type": "MemberProgramTier",
            "@id": "#plus-tier-gold",
            "name": "gold",
            "url": "https://www.example.com/membership-plus-gold",
            "hasTierRequirement":
            {
              "@type": "CreditCard",
              "name": "Example platinum card plus"
            },
            "hasTierBenefit": [
              "https://schema.org/TierBenefitLoyaltyPrice",
              "https://schema.org/TierBenefitLoyaltyPoints"
            ],
            "membershipPointsEarned": 10
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

Google 검색에서 포인트 멤버십 마크업을 사용하려면 다음 가이드라인을 따라야 합니다.

* [구조화된 데이터 일반 가이드라인](https://developers.google.com/search/docs/appearance/structured-data/sd-policies?hl=ko)
* [검색 Essentials](https://developers.google.com/search/docs/essentials?hl=ko)
* [기술 가이드라인](#technical-guidelines)

### 기술 가이드라인

* 비즈니스의 관리 세부정보와 정책을 지정하는 페이지에서 `Organization` 유형 아래에 `MemberProgram` 마크업을 중첩합니다.
  자세한 내용은 [조직 마크업](https://developers.google.com/search/docs/appearance/structured-data/organization?hl=ko) 문서를 참고하세요.
* 개별 제품에 적용되는 포인트 멤버십 혜택(예: 포인트 가격, 적립 포인트)을 지정하려면 [판매자 등록정보](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing?hl=ko#unit-price-specification-properties)에 정의된 `UnitPriceSpecification` 마크업을 추가합니다.
  비즈니스에 대해 정의한 `MemberProgram` 마크업은 구조화된 `validForMemberTier` 및 `MembershipPointsEarned` 데이터와 함께 작동하여 제품을 구매할 때 고객에게 제공할 포인트 멤버십의 혜택을 정의합니다.

## 구조화된 데이터 유형 정의

구조화된 데이터가 Google 검색에서 사용될 수 있으려면 필수 속성을 포함해야 합니다. 권장 속성을 통해 포인트 멤버십에 관한 정보를 추가하여 더 만족스러운 사용자 환경을 제공할 수 있습니다.

### `MemberProgram`

다음 속성을 사용하여 비즈니스에서 제공하는 하나 이상의 포인트 멤버십 및 각 포인트 멤버십에 포함된 하나 이상의 등급을 설명하세요. `MemberProgram`의 전체 정의는 [schema.org/MemberProgram](https://schema.org/MemberProgram)에서 확인할 수 있습니다.

| 필수 속성 | |
| --- | --- |
| `description` | `Text`  포인트 멤버십에 관한 설명으로, 회원에게 제공되는 주요 혜택을 설명합니다. |
| `hasTiers` | 반복된 `MemberProgramTier`  포인트 멤버십에 포함된 등급을 정의합니다. 포인트 멤버십에는 등급이 하나 이상 있어야 합니다. Google에서 지원하는 [`MemberProgramTier` 속성](#memberprogram-tier-properties) 목록을 참고하세요. |
| `name` | `Text`  포인트 멤버십 이름입니다. |

| 권장 속성 | |
| --- | --- |
| `url` | `URL`  쇼핑객이 포인트 멤버십에 가입할 수 있는 웹페이지의 URL입니다. 여러 개의 URL을 제공하지 마세요. URL을 제공하지 않으면 구조화된 `MemberProgram` 데이터가 포함된 페이지의 URL이 적용됩니다. |

#### `MemberProgramTier`

`MemberProgramTier`는 `MemberProgram`에 포함된 등급을 정의하는 데 사용됩니다.
포인트 멤버십에는 여러 개의 등급이 있을 수 있는데 예를 들면 브론즈, 실버, 골드 등급이 있을 수 있습니다.

`MemberProgramTier`의 전체 정의는 [schema.org/MemberProgramTier](https://schema.org/MemberProgramTier)에서 확인하세요.

| 필수 속성 | |
| --- | --- |
| `hasTierBenefit` | 반복된 `TierBenefitEnumeration`  이 포인트 멤버십 등급의 회원에게 제공되는 혜택입니다. 포인트 멤버십 등급에 따라 여러 가지 혜택이 제공될 수 있습니다. URL 접두사가 없는 닉네임도 지원됩니다(예: `TierBenefitLoyaltyPoints`).   * `https://schema.org/TierBenefitLoyaltyPoints`: 적립 포인트 획득 혜택입니다. `membershipPointsEarned`도 지정하세요. * `https://schema.org/TierBenefitLoyaltyPrice`: 회원 전용 가격 혜택입니다. |
| `name` | `Text`  멤버십 등급의 이름입니다. |

| 권장 속성 | |
| --- | --- |
| `hasTierRequirement` | `CreditCard` 또는 `MonetaryAmount` 또는 `UnitPriceSpecification` 또는 `Text`  포인트 멤버십 등급의 가입 요건입니다. 이 요건을 지정하지 않으면 누구나 무료로 해당 등급에 가입할 수 있습니다. 무료가 아닌 등급의 경우 등급 가입 요건을 나타내는 유형의 값을 지정합니다.   * `https://schema.org/CreditCard`: 사용자가 해당 등급에 가입하기 위해 등록해야 하는 신용카드를 지정합니다.   예를 들면 다음과 같습니다.      ```     "hasTierRequirement": {       "@type": "CreditCard",       "name": "Capital Two cashback rewards platinum card"     }   ``` * `https://schema.org/MonetaryAmount`: 등급에 가입하는 데 필요한 최소 지출액을 지정합니다.   예를 들어 최소 지출액이 250달러인 경우 다음과 같이 지정합니다.      ```     "hasTierRequirement": {       "@type": "MonetaryAmount",       "value": 250,       "currency": "USD"     }   ``` * `https://schema.org/UnitPriceSpecification`: 소비자가 해당 등급 멤버십에 대해 주기적으로 지불해야 하는 수수료를 지정합니다.   예를 들어 월 9.99유로가 한 달에 한 번 청구되는 12개월 멤버십의 경우 다음과 같이 지정합니다.      ```     "hasTierRequirement": {       "@type": "UnitPriceSpecification",       "price": 9.99,       "priceCurrency": "EUR",       "billingDuration": 12,       "billingIncrement": 1,       "unitCode": "MON"     }   ``` * `https://schema.org/Text`: 등급에 가입하기 위한 기타 요구사항을 설명합니다. 예를 들면 다음과 같습니다.      ```   "hasTierRequirement": "Purchase a share in our coop and volunteer a minimum of 1 day a month to keep operating costs low."   ``` |
| `membershipPointsEarned` | `QuantitativeValue`  `hasTierBenefit`이 `https://schema.org/TierBenefitLoyaltyPoints`와 같을 때 소비자가 지출한 통화 단위당 적립되는 포인트 수입니다. |
| `url` | `URL`  쇼핑객이 이 특정 포인트 멤버십 등급에 가입할 수 있는 웹페이지의 URL입니다. 여러 개의 URL을 제공하지 마세요. |

## 판매자 센터를 사용하여 Google에서 포인트 멤버십 구성

포인트 멤버십을 구성하고 마크업을 최신 상태로 유지하는 일이 쉽지는 않습니다. Google 판매자 센터 계정이 있다면 마크업을 사용하는 대신 Google 판매자 센터에서 직접 포인트 멤버십을 구성할 수도 있습니다. 자세한 내용은 [포인트 멤버십에 관한 판매자 고객센터 도움말](https://support.google.com/merchants/answer/12827255?hl=ko)을 참고하세요.

판매자가 마크업과 판매자 센터 포인트 멤버십을 모두 제공하는 경우 Google에서는 판매자 센터의 설정을 사용합니다.

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
