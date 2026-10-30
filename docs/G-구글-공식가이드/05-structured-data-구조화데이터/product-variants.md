# 구조화된 제품 옵션 데이터(ProductGroup,Product)

> **출처(Source):** https://developers.google.com/search/docs/appearance/structured-data/product-variants?hl=ko
> **저작자(Attribution):** Google
> **라이선스(License):** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
> 이 문서는 Google 검색 센터 문서를 Markdown으로 변환한 사본입니다.
> 원문의 최신 내용은 위 출처 링크를 확인하세요.

---

# 구조화된 제품 옵션 데이터(`ProductGroup`, `Product`)

![검색 결과에 표시되는 제품 옵션](https://developers.google.com/static/search/docs/images/product-variants.png?hl=ko)

의류, 신발, 가구, 전자 기기, 여행 가방 등 다양한 유형의 제품이 여러 가지 옵션(예: 다양한 크기, 색상, 소재, 패턴)으로 판매됩니다. Google에서 특정 제품이 동일한 상위 제품의 옵션인지 효과적으로 파악할 수 있도록 `ProductGroup` 클래스를 사용하세요. 연결된 속성인 `variesBy`, `hasVariant`, `productGroupID`, [구조화된 `Product` 데이터](https://developers.google.com/search/docs/appearance/structured-data/product?hl=ko)를 사용하여 이러한 옵션을 그룹으로 묶을 수 있습니다.
이 마크업을 추가하면 판매자 등록정보 환경에서 제품이 옵션 정보와 함께 표시될 수도 있습니다.

`ProductGroup`를 사용해 브랜드와 리뷰 정보 등 모든 옵션에 적용되는 일반적인 제품 속성을 지정할 수도 있고, 옵션을 결정하는 속성을 지정할 수도 있습니다. 이렇게 하면 정보의 중복을 줄일 수 있습니다.

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

일반적으로 이커머스 웹사이트에서 제품 옵션에 사용하는 디자인 방식에는 크게 두 가지가 있습니다.
이 섹션에서는 웹사이트의 디자인 접근방식에 따라 제품 옵션 마크업을 설정하는 방법을 설명합니다.

* [단일 페이지](#single-page-website): 일반적으로 쿼리 매개변수를 통해 페이지를 새로고침하지 않고도 단일 페이지에서 모든 제품 옵션을 선택할 수 있습니다.
* [멀티 페이지](#multi-page-website): 멀티 페이지 방식에서는 여러 페이지에서 동일한 제품의 옵션에 액세스할 수 있습니다.

### 단일 페이지 웹사이트

단일 페이지 웹사이트 예에서는 다음과 같은 가정하에 웹사이트를 사용합니다.

* 옵션이 선택되어 있지 않으면 다음 URL에서 기본 제품 페이지가 반환됩니다.
  `https://www.example.com/coat`
* 다음 URL을 사용하면 동일한 페이지에서 미리 선택된 특정 변형이 반환됩니다.
  + `https://www.example.com/coat?size=small&color=green`
  + `https://www.example.com/coat?size=small&color=lightblue`
  + `https://www.example.com/coat?size=large&color=lightblue`
* 사용자가 색상 및 크기 드롭다운으로 페이지에서 다른 옵션을 선택하면 페이지를 새로고침하지 않아도 페이지에서 이미지, 가격, 재고 정보가 동적으로 변경됩니다. 사용자가 다른 옵션을 선택해도 페이지의 마크업이 동적으로 변경되지 않습니다.

#### 단일 페이지 예: `ProductGroup` 아래에 옵션 중첩됨

이 예에서 옵션은 `hasVariant` 속성을 사용하여 최상위 `ProductGroup` 항목 아래에 중첩됩니다.

* `ProductGroup` 및 세 개의 `Offer` 항목(`Product` 속성 아래)에는 모두 고유한 URL이 있습니다. 또는 URL이 `Product` 아래에 제공되었을 수도 있습니다.
* 일반적인 이름 및과 설명은 `ProductGroup` 수준에서 지정되며
  옵션별 이름과 설명은 `Product` 수준에서 지정됩니다.
* 다른 일반적인 옵션 속성(예: 브랜드, 패턴, 소재, 잠재고객 정보)도 `ProductGroup` 수준에서 지정됩니다.
* `ProductGroup`은 `variesBy` 속성을 사용하여 옵션을 식별하는 속성을 지정합니다.
* `ProductGroup`은 `productGroupID`를 사용하여 상위 SKU를 지정합니다(`inProductGroupWithID`를 사용하는 `Product` 속성 아래에서 반복하지 않아도 됨).

이 방식을 사용하는 것이 좋습니다. 제품 그룹과 제품 옵션을 가장 간결하고 자연스러운 방식으로 표현할 수 있기 때문입니다.

  

```
<html>
  <head>
    <title>Wool winter coat</title>
    <script type="application/ld+json">
    [
      {
        "@context": "https://schema.org/",
        "@type": "ProductGroup",
        "name": "Wool winter coat",
        "description": "Wool coat, new for the coming winter season",
        "url": "https://www.example.com/coat",
        "brand": {
          "@type": "Brand",
          "name": "Good brand"
        },
        "audience": {
          "@type": "PeopleAudience",
          "suggestedGender": "unisex",
          "suggestedAge": {
            "@type": "QuantitativeValue",
            "minValue": 13,
            "unitCode": "ANN"
          }
        },
        "productGroupID": "44E01",
        "pattern": "striped",
        "material": "wool",
        "variesBy": [
          "https://schema.org/size",
          "https://schema.org/color"
        ],
        "hasVariant": [
          {
            "@type": "Product",
            "sku": "44E01-M11000",
            "gtin14": "98766051104214",
            "image": "https://www.example.com/coat_small_green.jpg",
            "name": "Small green coat",
            "description": "Small wool green coat for the winter season",
            "color": "Green",
            "size": "small",
            "offers": {
              "@type": "Offer",
              "url": "https://www.example.com/coat?size=small&color=green",
              "priceCurrency": "USD",
              "price": 39.99,
              "itemCondition": "https://schema.org/NewCondition",
              "availability": "https://schema.org/InStock",
              "shippingDetails": { "@id": "#shipping_policy" },
              "hasMerchantReturnPolicy": { "@id": "#return_policy" }
            }
          },
          {
            "@type": "Product",
            "sku": "44E01-K11000",
            "gtin14": "98766051104207",
            "image": "https://www.example.com/coat_small_lightblue.jpg",
            "name": "Small light blue coat",
            "description": "Small wool light blue coat for the winter season",
            "color": "light blue",
            "size": "small",
            "offers": {
              "@type": "Offer",
              "url": "https://www.example.com/coat?size=small&color=lightblue",
              "priceCurrency": "USD",
              "price": 39.99,
              "itemCondition": "https://schema.org/NewCondition",
              "availability": "https://schema.org/InStock",
              "shippingDetails": { "@id": "#shipping_policy" },
              "hasMerchantReturnPolicy": { "@id": "#return_policy" }
            }
          },
          {
            "@type": "Product",
            "sku": "44E01-X1100000",
            "gtin14": "98766051104399",
            "image": "https://www.example.com/coat_large_lightblue.jpg",
            "name": "Large light blue coat",
            "description": "Large wool light blue coat for the winter season",
            "color": "light blue",
            "size": "large",
            "offers": {
              "@type": "Offer",
              "url": "https://www.example.com/coat?size=large&color=lightblue",
              "priceCurrency": "USD",
              "price": 49.99,
              "itemCondition": "https://schema.org/NewCondition",
              "availability": "https://schema.org/BackOrder",
              "shippingDetails": { "@id": "#shipping_policy" },
              "hasMerchantReturnPolicy": { "@id": "#return_policy" }
            }
          }
        ]
      },
      {
        "@context": "https://schema.org/",
        "@type": "OfferShippingDetails",
        "@id": "#shipping_policy",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": 2.99,
          "currency": "USD"
        },
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "US"
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": {
            "@type": "QuantitativeValue",
            "minValue": 0,
            "maxValue": 1,
            "unitCode": "DAY"
          },
          "transitTime": {
            "@type": "QuantitativeValue",
            "minValue": 1,
            "maxValue": 5,
            "unitCode": "DAY"
          }
        }
      },
      {
        "@context": "http://schema.org/",
        "@type": "MerchantReturnPolicy",
        "@id": "#return_policy",
        "applicableCountry": "US",
        "returnPolicyCountry": "US",
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
        "merchantReturnDays": 60,
        "returnMethod": "https://schema.org/ReturnByMail",
        "returnFees": "https://schema.org/FreeReturn"
      }
    ]
    </script>
  </head>
  <body>
  </body>
</html>
```

#### 단일 페이지 예: `ProductGroup`과 별개인 옵션

이 구조는 옵션이 `ProductGroup`과 별개로 정의된다(중첩되지 않음)는 점을 제외하면 이전 예와 유사합니다. 일부 콘텐츠 관리 시스템(CMS)에서는 이 방식을 만드는 게 쉬울 수도 있습니다.

  

```
<html>
  <head>
    <title>Wool winter coat</title>
    <script type="application/ld+json">
    [
      {
        "@context": "https://schema.org",
        "@type": "ProductGroup",
        "@id": "#coat_parent",
        "name": "Wool winter coat",
        "description": "Wool coat, new for the coming winter season",
        "url": "https://www.example.com/coat",
        // ... other ProductGroup-level properties
        "brand": {
          "@type": "Brand",
          "name": "Good brand"
        },
        "productGroupID": "44E01",
        "variesBy": [
          "https://schema.org/size",
          "https://schema.org/color"
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "Product",
        "isVariantOf": { "@id": "#coat_parent" },
        "name": "Small green coat",
        "description": "Small wool green coat for the winter season",
        "image": "https://www.example.com/coat_small_green.jpg",
        "size": "small",
        "color": "green",
        // ... other Product-level properties
        "offers": {
          "@type": "Offer",
          "url": "https://www.example.com/coat?size=small&color=green",
          "price": 39.99,
          "priceCurrency": "USD"
          // ... other offer-level properties
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "Product",
        "isVariantOf": { "@id": "#coat_parent" },
        "name": "Small dark blue coat",
        "description": "Small wool light blue coat for the winter season",
        "image": "https://www.example.com/coat_small_lightblue.jpg",
        "size": "small",
        "color": "light blue",
        // ... other Product-level properties
        "offers": {
          "@type": "Offer",
          "url": "https://www.example.com/coat?size=small&color=lightblue",
          "price": 39.99,
          "priceCurrency": "USD"
          // ... other offer-level properties
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "Product",
        "isVariantOf": { "@id": "#coat_parent" },
        "name": "Large light blue coat",
        "description": "Large wool light blue coat for the winter season",
        "image": "https://www.example.com/coat_large_lightblue.jpg",
        "size": "large",
        "color": "light blue",
        // ... other Product-level properties
        "offers": {
          "@type": "Offer",
          "url": "https://www.example.com/coat?size=large&color=lightblue",
          "price": 49.99,
          "priceCurrency": "USD"
          // ... other offer-level properties
        }
      }
    ]
    </script>
  </head>
  <body>
  </body>
</html>
```

### 다중 페이지 웹사이트

다중 페이지 웹사이트 마크업 예에서는 다음과 같은 가정하에 웹사이트를 사용합니다.

* 연한 파란색 옵션은 다음 URL에서 판매되며 스몰(S) 및 라지(L) 사이즈가 제공됩니다.
  + `https://www.example.com/coat/lightblue?size=small`
  + `https://www.example.com/coat/lightblue?size=large`
* 녹색 옵션은 `https://www.example.com/coat/green?size=small`에서 판매되며 스몰 사이즈로만 제공됩니다.
* 두 페이지 모두 UI의 색상 선택기를 통해 다른 페이지로 '이동'(페이지가 새로고침됨)할 수 있습니다.
* 사이트에서 단일 페이지 예제의 상응하는 마크업을 두 페이지에 걸쳐 분할합니다.

다른 페이지에서 참조되는 `ProductGroup` 정의가 한쪽 페이지에만 있진 않습니다. `ProductGroup`은 브랜드, 소재, 연령대 등 옵션에서 공통되는 속성을 참조해야 하기 때문입니다. 또한 각 옵션 페이지는 `ProductGroup`의 전체 정의를 반복해야 합니다.

#### 다중 페이지 예: `ProductGroup` 아래에 옵션 중첩됨

이는 `hasVariant` 속성을 사용하여 최상위 `ProductGroup` 아래에 `Product` 옵션 속성이 중첩된 [첫 번째 단일 페이지 예](#single-page-example-1)와 동일합니다. `ProductGroup` 정의가 두 페이지에서 중복됩니다. 다음에 유의하세요.

* `ProductGroup`을 나타내는 단일 URL이 없으므로 `ProductGroup`에는 표준 URL이 없습니다.
* 각 페이지의 `ProductGroup`에는 페이지에 표시된 옵션뿐 아니라 다른 페이지에 있는 옵션에 연결하기 위한 `url` 속성만 있는 옵션의 전체 정의가 있으므로 Google에서 대안을 찾는 데 도움이 됩니다.

### 1페이지: 연한 파란색 옵션

다음 예는 연한 파란색 옵션의 첫 페이지에 표시되는 구조화된 데이터를 보여줍니다.

  

```
<html>
  <head>
    <title>Wool winter coat, light blue color</title>
    <script type="application/ld+json">
    [
      {
        "@context": "https://schema.org/",
        "@type": "ProductGroup",
        "name": "Wool winter coat",
        "description": "Wool coat, new for the coming winter season",
        // ... other ProductGroup-level properties
        "brand": {
          "@type": "Brand",
          "name": "Good brand"
        },
        "productGroupID": "44E01",
        "variesBy": [
          "https://schema.org/size",
          "https://schema.org/color"
        ],
        "hasVariant": [
          {
            "@type": "Product",
            "name": "Small light blue coat",
            "description": "Small wool light blue coat for the winter season",
            "image": "https://www.example.com/coat_small_lightblue.jpg",
            "size": "small",
            "color": "light blue",
            // ... other Product-level properties
            "offers": {
              "@type": "Offer",
              "url": "https://www.example.com/coat/lightblue?size=small",
              "price": 39.99,
              "priceCurrency": "USD"
              // ... other offer-level properties
            }
          },
          {
            "@type": "Product",
            "name": "Large light blue coat",
            "description": "Large wool light blue coat for the winter season",
            "image": "https://www.example.com/coat_large_lightblue.jpg",
            "size": "large",
            "color": "light blue",
            // ... other Product-level properties
            "offers": {
              "@type": "Offer",
              "url": "https://www.example.com/coat/lightblue?size=large",
              "price": 49.99,
              "priceCurrency": "USD"
              // ... other offer-level properties
            }
          },
          { "url": "https://www.example.com/coat/green?size=small" }
        ]
      }
    ]
    </script>
  </head>
  <body>
  </body>
</html>
```

### 2페이지: 녹색 옵션

다음 예는 초록색 옵션의 두 번째 페이지에 표시되는 구조화된 데이터를 보여줍니다.

  

```
<html>
  <head>
    <title>Wool winter coat, green color</title>
    <script type="application/ld+json">
    [
      {
        "@context": "https://schema.org/",
        "@type": "ProductGroup",
        "name": "Wool winter coat",
        "description": "Wool coat, new for the coming winter season",
        // ... other ProductGroup-level properties
        "brand": {
          "@type": "Brand",
          "name": "Good brand"
        },
        "productGroupID": "44E01",
        "variesBy": [
          "https://schema.org/size",
          "https://schema.org/color"
        ],
        "hasVariant": [
          {
            "@type": "Product",
            "name": "Small green coat",
            "description": "Small wool green coat for the winter season",
            "image": "https://www.example.com/coat_green.jpg",
            "color": "green",
            "size": "small",
            // ... other Product-level properties
            "offers": {
              "@type": "Offer",
              "url": "https://www.example.com/coat/green?size=small",
              "price": 39.99,
              "priceCurrency": "USD"
              // ... other offer-level properties
            }
          },
          { "url": "https://www.example.com/coat/lightblue?size=small" },
          { "url": "https://www.example.com/coat/lightblue?size=large" }
        ]
      }
    ]
    </script>
  </head>
  <body>
  </body>
</html>
```

#### 다중 페이지 예: `ProductGroup`과 별개인 옵션

이 구조는 옵션이 `ProductGroup`과 별개로 정의된다(중첩되지 않음)는 점을 제외하면 이전의 다중 페이지 예와 유사합니다. 일부 CMS에서는 이 방식을 만드는 게 쉬울 수도 있습니다.

### 1페이지: 연한 파란색 옵션

다음 예는 연한 파란색 옵션의 첫 페이지에 표시되는 구조화된 데이터를 보여줍니다.

  

```
<html>
  <head>
    <title>Wool winter coat, lightblue color</title>
    <script type="application/ld+json">
    [
      {
        "@context": "https://schema.org/",
        "@type": "ProductGroup",
        "@id": "#coat_parent",
        "name": "Wool winter coat",
        "description": "Wool coat, new for the coming winter season",
        "brand": {
          "@type": "Brand",
          "name": "Good brand"
        },
        "audience": {
          "@type": "PeopleAudience",
          "suggestedGender": "unisex",
          "suggestedAge": {
            "@type": "QuantitativeValue",
            "minValue": 13,
            "unitCode": "ANN"
          }
        },
        "productGroupID": "44E01",
        "pattern": "striped",
        "material": "wool",
        "variesBy": [
          "https://schema.org/size",
          "https://schema.org/color"
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "Product",
        "isVariantOf": { "@id": "#coat_parent" },
        "sku": "44E01-K11000",
        "gtin14": "98766051104207",
        "image": "https://www.example.com/coat_lightblue.jpg",
        "name": "Small light blue coat",
        "description": "Small wool light blue coat for the winter season",
        "color": "light blue",
        "size": "small",
        "offers": {
          "@type": "Offer",
          "url": "https://www.example.com/coat/lightblue?size=small",
          "priceCurrency": "USD",
          "price": 39.99,
          "itemCondition": "https://schema.org/NewCondition",
          "availability": "https://schema.org/InStock",
          "shippingDetails": { "@id": "#shipping_policy" },
          "hasMerchantReturnPolicy": { "@id": "#return_policy" }
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "Product",
        "isVariantOf": { "@id": "#coat_parent" },
        "sku": "44E01-X1100000",
        "gtin14": "98766051104399",
        "image": "https://www.example.com/coat_lightblue.jpg",
        "name": "Large light blue coat",
        "description": "Large wool light blue coat for the winter season",
        "color": "light blue",
        "size": "large",
        "offers": {
          "@type": "Offer",
          "url": "https://www.example.com/coat/lightblue?size=large",
          "priceCurrency": "USD",
          "price": 49.99,
          "itemCondition": "https://schema.org/NewCondition",
          "availability": "https://schema.org/BackOrder",
          "shippingDetails": { "@id": "#shipping_policy" },
          "hasMerchantReturnPolicy": { "@id": "#return_policy" }
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "Product",
        "isVariantOf": { "@id": "#coat_parent" },
        "url": "https://www.example.com/coat/green?size=small"
      },
      {
        "@context": "https://schema.org/",
        "@type": "OfferShippingDetails",
        "@id": "#shipping_policy",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": 2.99,
          "currency": "USD"
        },
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "US"
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": {
            "@type": "QuantitativeValue",
            "minValue": 0,
            "maxValue": 1,
            "unitCode": "DAY"
          },
          "transitTime": {
            "@type": "QuantitativeValue",
            "minValue": 1,
            "maxValue": 5,
            "unitCode": "DAY"
          }
        }
      },
      {
        "@context": "https://schema.org/",
        "@type": "MerchantReturnPolicy",
        "@id": "#return_policy",
        "applicableCountry": "US",
        "returnPolicyCountry": "US",
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
        "merchantReturnDays": 60,
        "returnMethod": "https://schema.org/ReturnByMail",
        "returnFees": "https://schema.org/FreeReturn"
      }
    ]
    </script>
  </head>
  <body>
  </body>
</html>
```

### 2페이지: 녹색 옵션

다음 예는 초록색 옵션의 두 번째 페이지에 표시되는 구조화된 데이터를 보여줍니다.

  

```
<html>
  <head>
    <title>Wool winter coat, green color</title>
    <script type="application/ld+json">
    [
      {
        "@context": "https://schema.org/",
        "@type": "ProductGroup",
        "@id": "#coat_parent",
        "name": "Wool winter coat",
        "description": "Wool coat, new for the coming winter season",
        "brand": {
          "@type": "Brand",
          "name": "Good brand"
        },
        "audience": {
          "@type": "PeopleAudience",
          "suggestedGender": "unisex",
          "suggestedAge": {
            "@type": "QuantitativeValue",
            "minValue": 13,
            "unitCode": "ANN"
          }
        },
        "productGroupID": "44E01",
        "pattern": "striped",
        "material": "wool",
        "variesBy": [
          "https://schema.org/size",
          "https://schema.org/color"
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "Product",
        "@id": "#small_green",
        "isVariantOf": { "@id": "#coat_parent" },
        "sku": "44E01-M11000",
        "gtin14": "98766051104214",
        "image": "https://www.example.com/coat_green.jpg",
        "name": "Small green coat",
        "description": "Small wool green coat for the winter season",
        "color": "green",
        "size": "small",
        "offers": {
          "@type": "Offer",
          "url": "https://www.example.com/coat/green?size=small",
          "priceCurrency": "USD",
          "price": 39.99,
          "itemCondition": "https://schema.org/NewCondition",
          "availability": "https://schema.org/InStock",
          "shippingDetails": { "@id": "#shipping_policy" },
          "hasMerchantReturnPolicy": { "@id": "#return_policy" }
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "Product",
        "isVariantOf": { "@id": "#coat_parent" },
        "url": "https://www.example.com/coat/lightblue?size=small"
      },
      {
        "@context": "https://schema.org",
        "@type": "Product",
        "isVariantOf": { "@id": "#coat_parent" },
        "url": "https://www.example.com/coat/lightblue?size=large"
      },
      {
        "@context": "https://schema.org/",
        "@type": "OfferShippingDetails",
        "@id": "#shipping_policy",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": "2.99",
          "currency": "USD"
        },
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "US"
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": {
            "@type": "QuantitativeValue",
            "minValue": 0,
            "maxValue": 1,
            "unitCode": "DAY"
          },
          "transitTime": {
            "@type": "QuantitativeValue",
            "minValue": 1,
            "maxValue": 5,
            "unitCode": "DAY"
          }
        }
      },
      {
        "@context": "https://schema.org/",
        "@type": "MerchantReturnPolicy",
        "@id": "#return_policy",
        "applicableCountry": "US",
        "returnPolicyCountry": "US",
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
        "merchantReturnDays": 60,
        "returnMethod": "https://schema.org/ReturnByMail",
        "returnFees": "https://schema.org/FreeReturn"
      }
    ]
    </script>
  </head>
  <body>
  </body>
</html>
```

## 가이드라인

Google 검색에서 제품 옵션 마크업을 사용하려면 다음 가이드라인을 따라야 합니다.

* [구조화된 데이터 일반 가이드라인](https://developers.google.com/search/docs/appearance/structured-data/sd-policies?hl=ko)
* [검색 Essentials](https://developers.google.com/search/docs/essentials?hl=ko)
* [기술 가이드라인](#technical-guidelines)
* [무료 등록정보 가이드라인](https://support.google.com/merchants/answer/12073010?hl=ko)(판매자 등록정보 환경용)

### 기술 가이드라인

* 각 옵션에는 옵션에 상응하는 구조화된 데이터 마크업에 고유 ID가 있어야 합니다(예: `sku` 또는 `gtin` 속성 사용).
* 각 제품 그룹에는 제품 그룹에 상응하는 구조화된 데이터 마크업에 고유 ID가 있어야 합니다. 이 고유 ID는 `Product` 옵션 속성의 `inProductGroupWithID` 속성이나 `ProductGroup` 속성의 `productGroupID` 속성으로 지정됩니다.
* 판매자 등록정보(또는 [제품 스니펫](https://developers.google.com/search/docs/appearance/structured-data/product-snippet?hl=ko#structured-data-type-definitions))의 [필수 속성](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing?hl=ko#structured-data-type-definitions) 목록에 따라 제품 옵션 속성 외에 구조화된 `Product` 데이터를 추가해야 합니다.
* [단일 페이지 사이트](#single-page-website)의 경우 모든 옵션이 속해 있는 전체 `ProductGroup`에 대한 하나의 고유한 표준 URL만 있어야 합니다. 이 URL은 일반적으로 미리 선택된 옵션이 없는 페이지로 연결되는 기준 URL입니다(예: `https://www.example.com/winter_coat`).
  [다중 페이지 사이트](#multi-page-website)의 경우 `ProductGroup` 속성을 나타내는 단일 표준 URL이 없으므로 이 설정이 적용되지 않습니다. 여러 옵션이 중요한 페이지에 균일하게 배포되기 때문입니다.
* [다중 페이지 사이트](#multi-page-website)는 각 페이지마다 해당 페이지에 정의된 항목에 관한 완전한 독립 실행형 마크업이 있어야 합니다. 즉 페이지 자체의 마크업을 완전히 이해하기 위해 페이지에 없는 항목이 필요해서는 안 됩니다.
* 사이트에서는 URL 쿼리 매개변수를 통해 고유한 URL(예: `https://www.example.com/winter_coat/size=small&color=green`)을 사용하여 각 옵션을 직접 미리 선택할 수 있어야 합니다. 이렇게 하면 Google에서 각 옵션을 크롤링하고 식별할 수 있습니다. 각 옵션을 미리 선택하려면 옵션에 맞는 이미지, 가격, 재고를 표시하고 사용자가 장바구니에 옵션을 추가할 수 있어야 합니다.
* 모든 유형의 쇼핑 결과에 최적화하는 판매자인 경우 최상의 결과를 얻으려면 구조화된 `Product` 데이터를 초기 HTML에 배치하는 것이 좋습니다.
* **JavaScript 생성 `Product` 마크업**: [동적으로 생성된 마크업](https://developers.google.com/search/docs/appearance/structured-data/generate-structured-data-with-javascript?hl=ko)으로 인해 쇼핑 크롤링의 빈도가 줄고 신뢰도가 떨어질 수 있습니다. 이는 제품 재고 및 가격과 같이 빠르게 변화하는 콘텐츠에서 문제가 될 수 있습니다. JavaScript를 사용하여 `Product` 마크업을 생성하는 경우 서버에 Google에서 발생하는 트래픽 증가를 처리할 수 있는 충분한 컴퓨팅 리소스가 있는지 확인하세요.

## 구조화된 데이터 유형 정의

구조화된 데이터가 Google 검색에서 사용될 수 있으려면 필수 속성을 포함해야 합니다. 권장 속성을 통해 제품 옵션에 관한 더 많은 정보를 추가하면 더 나은 사용자 환경을 제공할 수 있습니다.

### `ProductGroup`

Google은 `ProductGroup`의 다음 속성을 인식합니다. `ProductGroup`의 전체 정의는 [schema.org/ProductGroup](https://schema.org/ProductGroup)에서 확인하세요. 제품 옵션 정보가 있는 콘텐츠를 마크업할 때 `ProductGroup` 속성의 다음 속성을 사용하세요.

| 필수 속성 | |
| --- | --- |
| `name` | `Text`  `ProductGroup`의 이름입니다(예: '양모 겨울 코트'). 각 `Product` 항목의 옵션 이름이 더 구체적인 이름인지 확인합니다(예: 옵션 식별 속성에 따라 '울 겨울 코트 - 녹색, 사이즈 S' 등으로 표시할 수 있음). 자세한 내용은 [제품 문서](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing?hl=ko#name)를 참고하세요. |

| 권장 속성 | |
| --- | --- |
| `aggregateRating` | `AggregateRating`  `ProductGroup`의 중첩된 `aggregateRating`입니다(모든 옵션을 대표함, 해당하는 경우). [리뷰 스니펫 가이드라인](https://developers.google.com/search/docs/appearance/structured-data/review-snippet?hl=ko#guidelines) 및 필수/권장 [`AggregateRating` 속성](https://developers.google.com/search/docs/appearance/structured-data/review-snippet?hl=ko#aggregated-rating-type-definition) 목록을 따르세요. |
| `brand` | `Brand`  `ProductGroup`에 관한 브랜드 정보입니다(모든 옵션에서 동일, 해당하는 경우). `brand`에 관한 자세한 내용은 [제품 문서](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing?hl=ko#brand)를 참고하세요. |
| `brand.name` | `Text`  `ProductGroup` 브랜드 이름입니다(모든 옵션에서 동일). 이미 `ProductGroup` 수준에 브랜드를 추가했다면 `Product` 수준에서 다시 추가하지 않아도 됩니다. `brand`에 관한 자세한 내용은 [제품 문서](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing?hl=ko#brand)를 참고하세요. |
| `description` | `Text` 또는 `TextObject`  `ProductGroup`에 대한 설명입니다. 예를 들면 '추운 날씨에 사용할 수 있는 울 겨울 코트'와 같은 설명을 제공할 수 있습니다. 옵션에 관한 설명이 이보다 더 구체적이어야 하며 옵션을 식별할 수 있는 단어(예: 색상, 크기, 소재)를 사용하는 것이 가장 좋습니다. `ProductGroup` 설명 외에도 `Product` 수준에 각 옵션에 관한 설명을 추가하는 것이 좋습니다. 자세한 내용은 [제품 문서](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing?hl=ko#description)를 참고하세요. |
| `hasAdultConsideration` | `AdultOrientedEnumeration`  제품에 과도한 노출이나 성적인 콘텐츠가 포함되어 있어 성인용으로 지정되었음을 나타냅니다. Google의 [성인용 콘텐츠 정책](https://support.google.com/merchants/answer/12073010?hl=ko#res)에 따라 성인용으로 간주되는 제품을 판매하는 경우 이 속성을 사용하여 성인용으로 라벨을 지정해야 합니다. 이러한 제품은 쇼핑 광고 및 무료 등록정보에 표시될 수 있지만 연령 및 국가 기반 제한이 적용됩니다. 제품에 라벨을 지정하면 Google에서 이러한 제한을 적용하고 온라인 쇼핑을 하는 사용자에게 적절하고 법규를 준수하는 콘텐츠를 표시할 수 있습니다. schema.org에서는 `AdultOrientedEnumeration`에 여러 값을 정의하지만 Google 검색에서는 이 속성에 `https://schema.org/SexualContentConsideration` 값만 지원합니다. |
| `hasVariant` | `Product`  `ProductGroup` 속성의 옵션 중 하나인 중첩된 `Product` 속성입니다(해당하는 경우). `ProductGroup`에는 일반적으로 중첩된 `Product` 옵션 속성이 여러 개 있습니다.  또는 `Product` 옵션 속성이 `Product` 속성의 `isVariantOf` 속성을 사용하여 상위 `ProductGroup`를 다시 참조할 수도 있습니다. |
| `productGroupID` | `Text`  제품 그룹의 식별자(*상위 SKU*라고도 함)입니다. 이 식별자는 `ProductGroup` 속성에 제공될 수도 있고, `ProductGroup` 속성의 옵션에는 `inProductGroupWithID` 속성을 사용할 수도 있습니다. `ProductGroup` 속성과 `Product` 옵션 속성 둘 다에 식별자를 제공하는 경우 서로 일치해야 합니다. |
| `review` | `Review`  `ProductGroup`의 중첩된 `review`입니다(해당하는 경우). [리뷰 스니펫 가이드라인](https://developers.google.com/search/docs/appearance/structured-data/review-snippet?hl=ko#guidelines) 및 필수/권장 [리뷰 속성](https://developers.google.com/search/docs/appearance/structured-data/review-snippet?hl=ko#review-properties) 목록을 따르세요. |
| `url` | `URL`  **[단일 페이지 웹사이트](#single-page-website)만 해당**: `ProductGroup` 속성이 위치한 URL(옵션 선택기 없음)입니다(해당하는 경우). 멀티 페이지 웹사이트에는 이 속성을 사용하지 마세요. |
| `variesBy` | `DefinedTerm`  `ProductGroup`의 옵션이 서로 다른 값을 갖는 측면(예: 크기 또는 색상)입니다(해당하는 경우). 전체 Schema.org URL(예: `https://schema.org/color`)을 통해 이러한 옵션 식별 속성을 참조하세요. 다음과 같은 속성이 지원됩니다.   * `https://schema.org/color` * `https://schema.org/size` * `https://schema.org/suggestedAge` * `https://schema.org/suggestedGender` * `https://schema.org/material` * `https://schema.org/pattern` |

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
