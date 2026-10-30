# 구조화된 제품 스니펫(Product,Review,Offer) 데이터

> **출처(Source):** https://developers.google.com/search/docs/appearance/structured-data/product-snippet?hl=ko
> **저작자(Attribution):** Google
> **라이선스(License):** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
> 이 문서는 Google 검색 센터 문서를 Markdown으로 변환한 사본입니다.
> 원문의 최신 내용은 위 출처 링크를 확인하세요.

---

# 구조화된 제품 스니펫(`Product`, `Review`, `Offer`) 데이터

![검색결과에 표시된 제품 스니펫 프레젠테이션](https://developers.google.com/static/search/docs/images/product-snippet.png?hl=ko)

페이지에 `Product` 마크업을 추가하면 제품 스니펫으로 표시될 수 있습니다. 제품 스니펫이란 평점, 리뷰 정보, 가격, 재고 여부 등의 추가적인 제품 정보가 포함된 [텍스트 검색 결과](https://developers.google.com/search/docs/appearance/visual-elements-gallery?hl=ko#text-result)입니다.

이 가이드에서는 제품 스니펫의 구조화된 `Product` 데이터 요구사항에 관해 중점적으로 설명합니다. 어떤 마크업을 사용해야 할지 잘 모르겠다면 [`Product` 마크업 소개](https://developers.google.com/search/docs/appearance/structured-data/product?hl=ko)를 읽어보세요.

**고객이 제품을 구매할 수 있나요?** [판매자 등록정보 마크업](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing?hl=ko)을 추가해 보세요.

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

다음 예는 다양한 상황에 맞게 웹페이지에 구조화된 데이터를 포함하는 방법을 보여줍니다.

### 제품 리뷰 페이지

다음은 검색결과의 제품 스니펫 처리를 위해 제품 리뷰 페이지에 포함되는 구조화된 데이터의 예입니다.

#### JSON-LD

  

```
 <html>
  <head>
    <title>Executive Anvil</title>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Executive Anvil",
      "description": "Sleeker than ACME's Classic Anvil, the Executive Anvil is perfect for the business traveler looking for something to drop from a height.",
      "review": {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": 4,
          "bestRating": 5
        },
        "author": {
          "@type": "Person",
          "name": "Fred Benson"
        }
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": 4.4,
        "reviewCount": 89
      }
    }
    </script>
  </head>
  <body>
  </body>
</html>
```

#### RDFa

  

```
 <html>
  <head>
    <title>Executive Anvil</title>
  </head>
  <body>
    <div typeof="schema:Product">
        <div rel="schema:review">
          <div typeof="schema:Review">
            <div rel="schema:reviewRating">
              <div typeof="schema:Rating">
                <div property="schema:ratingValue" content="4"></div>
                <div property="schema:bestRating" content="5"></div>
              </div>
            </div>
            <div rel="schema:author">
              <div typeof="schema:Person">
                <div property="schema:name" content="Fred Benson"></div>
              </div>
            </div>
          </div>
        </div>
        <div property="schema:name" content="Executive Anvil"></div>
        <div property="schema:description" content="Sleeker than ACME's Classic Anvil, the Executive Anvil is perfect for the business traveler looking for something to drop from a height."></div>
        <div rel="schema:aggregateRating">
          <div typeof="schema:AggregateRating">
            <div property="schema:reviewCount" content="89"></div>
            <div property="schema:ratingValue" content="4.4"></div>
          </div>
        </div>
      </div>
  </body>
</html>
```

#### 마이크로데이터

  

```
 <html>
  <head>
    <title>Executive Anvil</title>
  </head>
  <body>
  <div>
    <div itemtype="https://schema.org/Product" itemscope>
      <meta itemprop="name" content="Executive Anvil" />
      <meta itemprop="description" content="Sleeker than ACME's Classic Anvil, the Executive Anvil is perfect for the business traveler looking for something to drop from a height." />
      <div itemprop="aggregateRating" itemtype="https://schema.org/AggregateRating" itemscope>
        <meta itemprop="reviewCount" content="89" />
        <meta itemprop="ratingValue" content="4.4" />
      </div>
      <div itemprop="review" itemtype="https://schema.org/Review" itemscope>
        <div itemprop="author" itemtype="https://schema.org/Person" itemscope>
          <meta itemprop="name" content="Fred Benson" />
        </div>
        <div itemprop="reviewRating" itemtype="https://schema.org/Rating" itemscope>
          <meta itemprop="ratingValue" content="4" />
          <meta itemprop="bestRating" content="5" />
        </div>
      </div>
    </div>
  </div>
  </body>
</html>
```

### 장단점

다음은 검색결과의 제품 스니펫 처리를 위한 장단점이 포함된 전문가 제품 리뷰 페이지의 예입니다.

![검색결과에 장단점이 시작적으로 표시되는 예](https://developers.google.com/static/search/docs/images/pros-and-cons.png?hl=ko)

#### JSON-LD

  

```
 <html>
  <head>
    <title>Cheese Knife Pro review</title>
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "Cheese Grater Pro",
        "review": {
          "@type": "Review",
          "name": "Cheese Knife Pro review",
          "author": {
            "@type": "Person",
            "name": "Pascal Van Cleeff"
          },
          "positiveNotes": {
            "@type": "ItemList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Consistent results"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Still sharp after many uses"
              }
            ]
          },
          "negativeNotes": {
            "@type": "ItemList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "No child protection"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Lacking advanced features"
              }
            ]
          }
        }
      }
    </script>
  </head>
  <body>
  </body>
</html>
```

#### RDFa

  

```
 <html>
  <head>
    <title>Cheese Knife Pro review</title>
  </head>
  <body>
    <div typeof="schema:Product">
      <div property="schema:name" content="Cheese Knife Pro review"></div>
        <div rel="schema:review">
          <div typeof="schema:Review">
            <div rel="schema:positiveNotes">
              <div typeof="schema:ItemList">
                <div rel="schema:itemListElement">
                  <div typeof="schema:ListItem">
                    <div property="schema:position" content="1"></div>
                    <div property="schema:name" content="Consistent results"></div>
                  </div>
                  <div typeof="schema:ListItem">
                    <div property="schema:position" content="2"></div>
                    <div property="schema:name" content="Still sharp after many uses"></div>
                  </div>
                </div>
              </div>
            </div>
            <div rel="schema:negativeNotes">
              <div typeof="schema:ItemList">
                <div rel="schema:itemListElement">
                  <div typeof="schema:ListItem">
                    <div property="schema:position" content="1"></div>
                    <div property="schema:name" content="No child protection"></div>
                  </div>
                  <div typeof="schema:ListItem">
                    <div property="schema:position" content="2"></div>
                    <div property="schema:name" content="Lacking advanced features"></div>
                  </div>
                </div>
              </div>
            </div>
            <div rel="schema:author">
              <div typeof="schema:Person">
                <div property="schema:name" content="Pascal Van Cleeff"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
  </body>
</html>
```

#### 마이크로데이터

  

```
 <html>
  <head>
    <title>Cheese Knife Pro review</title>
  </head>
  <body>
    <div itemtype="https://schema.org/Product" itemscope>
      <meta itemprop="name" content="Cheese Knife Pro" />
      <div itemprop="review" itemtype="https://schema.org/Review" itemscope>
        <div itemprop="author" itemtype="https://schema.org/Person" itemscope>
          <meta itemprop="name" content="Pascal Van Cleeff" />
        </div>
        <div itemprop="positiveNotes" itemtype="https://schema.org/ItemList" itemscope>
          <div itemprop="itemListElement" itemtype="https://schema.org/ListItem" itemscope>
            <meta itemprop="position" content="1" />
            <meta itemprop="name" content="Consistent results" />
          </div>
          <div itemprop="itemListElement" itemtype="https://schema.org/ListItem" itemscope>
            <meta itemprop="position" content="2" />
            <meta itemprop="name" content="Still sharp after many uses" />
          </div>
        </div>
        <div itemprop="negativeNotes" itemtype="https://schema.org/ItemList" itemscope>
          <div itemprop="itemListElement" itemtype="https://schema.org/ListItem" itemscope>
            <meta itemprop="position" content="1" />
            <meta itemprop="name" content="No child protection" />
          </div>
          <div itemprop="itemListElement" itemtype="https://schema.org/ListItem" itemscope>
            <meta itemprop="position" content="2" />
            <meta itemprop="name" content="Lacking advanced features" />
          </div>
        </div>
      </div>
    </div>
  </body>
</html>
```

### 통합 쇼핑 정보 페이지

다음은 검색결과의 제품 스니펫 처리를 위한 쇼핑 애그리게이터 페이지의 예입니다.

#### JSON-LD

  

```
<html>
  <head>
    <title>Executive Anvil</title>
    <script type="application/ld+json">
      {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": "Executive Anvil",
        "image": [
          "https://example.com/photos/1x1/photo.jpg",
          "https://example.com/photos/4x3/photo.jpg",
          "https://example.com/photos/16x9/photo.jpg"
         ],
        "description": "Sleeker than ACME's Classic Anvil, the Executive Anvil is perfect for the business traveler looking for something to drop from a height.",
        "sku": "0446310786",
        "mpn": "925872",
        "brand": {
          "@type": "Brand",
          "name": "ACME"
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
            "name": "Fred Benson"
          }
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": 4.4,
          "reviewCount": 89
        },
        "offers": {
          "@type": "AggregateOffer",
          "offerCount": 5,
          "lowPrice": 119.99,
          "highPrice": 199.99,
          "priceCurrency": "USD"
        }
      }
    </script>
  </head>
  <body>
  </body>
</html>
```

#### RDFa

  

```
 <html>
  <head>
    <title>Executive Anvil</title>
  </head>
  <body>
    <div typeof="schema:Product">
      <div rel="schema:review">
        <div typeof="schema:Review">
          <div rel="schema:reviewRating">
            <div typeof="schema:Rating">
              <div property="schema:ratingValue" content="4"></div>
              <div property="schema:bestRating" content="5"></div>
            </div>
          </div>
          <div rel="schema:author">
            <div typeof="schema:Person">
              <div property="schema:name" content="Fred Benson"></div>
            </div>
          </div>
        </div>
      </div>
      <div rel="schema:aggregateRating">
        <div typeof="schema:AggregateRating">
          <div property="schema:reviewCount" content="89"></div>
          <div property="schema:ratingValue" content="4.4"></div>
        </div>
      </div>
      <div rel="schema:image" resource="https://example.com/photos/4x3/photo.jpg"></div>
      <div property="schema:mpn" content="925872"></div>
      <div property="schema:name" content="Executive Anvil"></div>
      <div property="schema:description" content="Sleeker than ACME's Classic Anvil, the Executive Anvil is perfect for the business traveler looking for something to drop from a height."></div>
      <div rel="schema:image" resource="https://example.com/photos/1x1/photo.jpg">
      </div>
      <div rel="schema:brand">
        <div typeof="schema:Brand">
          <div property="schema:name" content="ACME"></div>
        </div>
      </div>
      <div rel="schema:offers">
        <div typeof="schema:AggregateOffer">
          <div property="schema:offerCount" content="5"></div>
          <div property="schema:lowPrice" content="119.99"></div>
          <div property="schema:highPrice" content="199.99"></div>
          <div property="schema:priceCurrency" content="USD"></div>
          <div rel="schema:url" resource="https://example.com/anvil"></div>
        </div>
      </div>
      <div rel="schema:image" resource="https://example.com/photos/16x9/photo.jpg"></div>
      <div property="schema:sku" content="0446310786"></div>
    </div>
  </body>
</html>
```

#### 마이크로데이터

  

```
 <html>
  <head>
    <title>Executive Anvil</title>
  </head>
  <body>
  <div>
    <div itemtype="https://schema.org/Product" itemscope>
      <meta itemprop="mpn" content="925872" />
      <meta itemprop="name" content="Executive Anvil" />
      <link itemprop="image" href="https://example.com/photos/16x9/photo.jpg" />
      <link itemprop="image" href="https://example.com/photos/4x3/photo.jpg" />
      <link itemprop="image" href="https://example.com/photos/1x1/photo.jpg" />
      <meta itemprop="description" content="Sleeker than ACME's Classic Anvil, the Executive Anvil is perfect for the business traveler looking for something to drop from a height." />
      <div itemprop="offers" itemtype="https://schema.org/AggregateOffer" itemscope>
        <meta itemprop="lowPrice" content="119.99" />
        <meta itemprop="highPrice" content="199.99" />
        <meta itemprop="offerCount" content="6" />
        <meta itemprop="priceCurrency" content="USD" />
      </div>
      <div itemprop="aggregateRating" itemtype="https://schema.org/AggregateRating" itemscope>
        <meta itemprop="reviewCount" content="89" />
        <meta itemprop="ratingValue" content="4.4" />
      </div>
      <div itemprop="review" itemtype="https://schema.org/Review" itemscope>
        <div itemprop="author" itemtype="https://schema.org/Person" itemscope>
          <meta itemprop="name" content="Fred Benson" />
        </div>
        <div itemprop="reviewRating" itemtype="https://schema.org/Rating" itemscope>
          <meta itemprop="ratingValue" content="4" />
          <meta itemprop="bestRating" content="5" />
        </div>
      </div>
      <meta itemprop="sku" content="0446310786" />
      <div itemprop="brand" itemtype="https://schema.org/Brand" itemscope>
        <meta itemprop="name" content="ACME" />
      </div>
    </div>
  </div>
  </body>
</html>
```

## 가이드라인

`Product` 마크업이 제품 스니펫로 처리되려면 다음 가이드라인을 따라야 합니다.

* [구조화된 데이터 일반 가이드라인](https://developers.google.com/search/docs/appearance/structured-data/sd-policies?hl=ko)
* [검색 Essentials](https://developers.google.com/search/docs/essentials?hl=ko)
* [기술 가이드라인](#technical-guidelines)
* [콘텐츠 가이드라인](#content-guidelines)

### 기술 가이드라인

* 현재 제품 리치 결과는 단일 제품(또는 동일한 제품의 여러 옵션)에 중점을 둔 페이지만 지원합니다. 예를 들어 '우리 가게 신발'은 특정 제품이 아닙니다.
  여기에는 [제품 옵션마다 고유한 URL이 있는](https://developers.google.com/search/docs/specialty/ecommerce/designing-a-url-structure-for-ecommerce-sites?hl=ko#how-google-understands-urls-for-product-variants) 제품 옵션이 포함됩니다.
  제품 또는 제품 카테고리가 나열된 페이지가 아닌 제품 페이지에 마크업을 추가하는 데 집중하는 것이 좋습니다.
* 제품 옵션을 마크업하는 방법에 대한 자세한 내용은 [구조화된 제품 옵션 데이터 문서](https://developers.google.com/search/docs/appearance/structured-data/product-variants?hl=ko)에서 확인하세요.
* 제품을 여러 통화로 판매하는 경우 제품별로 다른 URL을 사용하세요.
  예를 들어 제품이 캐나다 달러와 미국 달러로 판매되는 경우 통화당 하나씩 두 개의 고유한 URL을 사용하는 것이 좋습니다.
* [`Car`](https://schema.org/Car)는 `Product`의 하위유형으로 자동 지원되지 않습니다. 현재로서는 [`Car`](https://schema.org/Car) 및 [`Product`](https://schema.org/Product) 유형을 모두 포함해야 평점을 추가하고 Google 검색 결과 기능을 사용할 수 있습니다. 다음은 JSON-LD 형식의 예입니다.

  ```
  {
    "@context": "https://schema.org",
    "@type": ["Product", "Car"],
    ...
  }
  ```
* **구조화된 [장단점](#pros-cons) 데이터**: 광고 소재 제품 리뷰 페이지만 Google 검색에 장단점을 표시할 수 있으며 판매자 제품 페이지 또는 고객 제품 리뷰에는 장단점을 표시할 수 없습니다.
* 모든 유형의 쇼핑 결과에 최적화하는 판매자인 경우 최상의 결과를 얻으려면 구조화된 `Product` 데이터를 초기 HTML에 배치하는 것이 좋습니다.
* **JavaScript 생성 `Product` 마크업**: [동적으로 생성된 마크업](https://developers.google.com/search/docs/appearance/structured-data/generate-structured-data-with-javascript?hl=ko)으로 인해 쇼핑 크롤링의 빈도가 줄고 신뢰도가 떨어질 수 있습니다. 이는 제품 재고 및 가격과 같이 빠르게 변화하는 콘텐츠에서 문제가 될 수 있습니다. JavaScript를 사용하여 `Product` 마크업을 생성하는 경우 서버에 Google에서 발생하는 트래픽 증가를 처리할 수 있는 충분한 컴퓨팅 리소스가 있는지 확인하세요.

### 콘텐츠 가이드라인

* 사용자에게 심각하거나, 즉각적이거나, 장기적인 피해를 입히도록 조장할 수 있으며 광범위하게 금지되거나 규제되는 상품, 서비스 또는 정보를 홍보하는 콘텐츠는 허용되지 않습니다. 여기에는 총기 및 무기, 기분전환용 약물, 담배 및 전자담배 제품, 도박 관련 제품과 관련된 콘텐츠가 포함됩니다.

## 구조화된 데이터 유형 정의

리치 결과에 콘텐츠를 표시하려면 필수 속성이 있어야 합니다. 권장 속성을 통해 구조화된 데이터에 더 많은 정보를 추가하여 더욱 만족스러운 사용자 환경을 제공할 수도 있습니다.

### `Product`

`Product`의 전체 정의는 [schema.org/Product](https://schema.org/Product)에서 확인할 수 있습니다. 제품 정보 콘텐츠를 마크업할 때 `Product` 유형의 다음 속성을 사용하세요.

| 필수 속성 | |
| --- | --- |
| `name` | `Text`  제품 이름입니다. |
| 제품 스니펫에는 `review`, `aggregateRating`, `offers` 속성 중 하나가 필요합니다. | 다음 중 한 가지 속성을 포함해야 합니다.   * `review` * `aggregateRating` * `offers`  `review`, `aggregateRating`, `offers` 중 하나만 제공하면 되지만 `review` 또는 `aggregateRating` 속성 없이 `offers`을 제공하면 리치 결과 테스트의 제품 스니펫 섹션에 경고가 보고될 수 있습니다. |

| 권장 속성 | |
| --- | --- |
| `aggregateRating` | `AggregateRating`  제품의 중첩된 `aggregateRating`입니다. [리뷰 스니펫 가이드라인](https://developers.google.com/search/docs/appearance/structured-data/review-snippet?hl=ko#guidelines) 및 필수/권장 [`AggregateRating` 속성](https://developers.google.com/search/docs/appearance/structured-data/review-snippet?hl=ko#aggregated-rating-type-definition) 목록을 따르세요. |
| `offers` | `Offer` 또는 `AggregateOffer`  제품 판매를 위한 중첩된 `Offer` 또는 `AggregateOffer`입니다. [`Offer`](#offer-properties) 또는 [`AggregateOffer`](#aggregate-offer-properties)의 필수 속성과 권장 속성을 포함합니다(콘텐츠에 적용되는 속성).  [가격 인하 개선사항](https://developers.google.com/search/docs/appearance/structured-data/product?hl=ko#price-drop)을 사용하려면 `AggregateOffer`가 아닌 [`Offer`](#offer-properties)를 추가하세요. |
| `review` | [`Review`](https://schema.org/Review)  제품의 중첩된 `Review`입니다. [리뷰 스니펫 가이드라인](https://developers.google.com/search/docs/appearance/structured-data/review-snippet?hl=ko#guidelines) 및 필수/권장 [리뷰 속성](https://developers.google.com/search/docs/appearance/structured-data/review-snippet?hl=ko#review-properties) 목록을 따르세요.  제품 리뷰를 추가하는 경우 리뷰 작성자의 이름은 `Person` 또는 `Team`에 유효한 이름이어야 합니다.  **권장하지 않음**: 블랙 프라이데이 50% 할인  **권장**: '제임스 스미스' 또는 'CNET 리뷰어'  전문가 제품 리뷰 페이지에 있는 [장단점](#pros-cons)을 Google에 직접 알리려면 중첩된 제품 리뷰에 `positiveNotes` 또는 `negativeNotes` 속성을 추가하세요. |

### 제품 리뷰

#### `Review`

리뷰는 여러 구조화된 데이터 유형(예: `Recipe` 및 `Movie`)에서 공유되므로 `Review` 유형은 [리뷰 스니펫 문서](https://developers.google.com/search/docs/appearance/structured-data/review-snippet?hl=ko)에 별도로 설명되어 있습니다.

다음 속성은 리뷰 유형의 추가 속성으로, 사용자에게 전문가 제품 리뷰의 장단점을 개략적으로 표시합니다.
장단점 환경은 Google 검색이 제공되는 모든 국가에서 네덜란드어, 영어, 프랑스어, 독일어, 이탈리아어, 일본어, 폴란드어, 포르투갈어, 스페인어, 터키어로 제공됩니다.

Google이 전문가 제품 리뷰의 장단점을 자동으로 이해하려고 노력합니다. 하지만 `positiveNotes` 또는 `negativeNotes` 속성을 중첩된 제품 리뷰에 추가하면 이 정보를 명시적으로 제공할 수 있습니다. [장단점 가이드라인](#pros-cons-guidelines)을 준수하세요.

| 필수 속성 | |
| --- | --- |
| 제품에 대한 설명 2개 | 제품에 관한 설명을 2개 이상 제공해야 합니다. 긍정적 또는 부정적 설명을 자유롭게 조합할 수 있습니다. 예를 들어 `ItemList` 마크업이 있고 긍정적인 문장 두 개가 있으면 유효합니다.  * [`negativeNotes`](#negative-notes) * [`positiveNotes`](#positive-notes) |

| 권장 속성 | |
| --- | --- |
| `negativeNotes` | `ItemList`(이 컨텍스트에서의 `ItemList` 사용에 관해서는 [긍정/부정 설명에 사용하는 `ItemList`](#pros-cons-item-list) 참고)  제품에 대한 부정적인 설명(단점)이 포함된 중첩된 목록입니다(선택사항).  여러 개의 부정적인 설명을 나열하려면 `itemListElement` 배열에 여러 개의 `ListItem` 속성을 지정하세요. 예:     ``` "review": {   "@type": "Review",   "negativeNotes": {     "@type": "ItemList",     "itemListElement": [       {         "@type": "ListItem",         "position": 1,         "name": "No child protection"       },       {         "@type": "ListItem",         "position": 2,         "name": "Lacking advanced features"       }     ]   } } ``` |
| `positiveNotes` | `ItemList`(이 컨텍스트에서의 `ItemList` 사용에 관해서는 [긍정/부정 설명에 사용하는 `ItemList`](#pros-cons-item-list) 참고)  제품에 대한 긍정적인 설명(장점)이 포함된 중첩된 목록입니다(선택사항).  여러 개의 긍정적인 설명을 나열하려면 `itemListElement` 배열에 여러 개의 `ListItem` 속성을 지정하세요. 예:     ``` "review": {   "@type": "Review",   "positiveNotes": {     "@type": "ItemList",     "itemListElement": [       {         "@type": "ListItem",         "position": 1,         "name": "Consistent results"       },       {         "@type": "ListItem",         "position": 2,         "name": "Still sharp after many uses"       }     ]   } } ``` |

#### 긍정/부정 설명에 사용하는 `ItemList`

`Review` 유형 내의 긍정/부정 설명(장단점)은 일반적인 `ItemList` 및 `ListItem` 유형을 사용합니다.
이 섹션에서는 이러한 유형을 긍정/부정 설명에 사용하는 방법을 설명합니다.

다음 속성은 리뷰에서 장단점을 명시하는 데 사용됩니다.

| 필수 속성 | |
| --- | --- |
| `itemListElement` | `ListItem`  제품에 대한 설명의 목록이며 특정 순서로 나열됩니다. `ListItem`으로 각 문을 지정합니다. |
| `itemListElement.name` | `Text`  리뷰의 주요 설명입니다. |

| 권장 속성 | |
| --- | --- |
| `itemListElement.position` | `Integer`  리뷰의 위치입니다. 위치 1은 목록에 있는 첫 번째 설명을 나타냅니다. |

### 혜택 세부정보

#### `Offer`

`Offer`의 전체 정의는 [schema.org/Offer](https://schema.org/Offer)에서 확인할 수 있습니다. 제품 내 혜택을 마크업할 때는 `schema.org` [`Offer`](https://schema.org/Offer) 유형의 다음 속성을 사용하세요.

| 필수 속성 | |
| --- | --- |
| `price` 또는 `priceSpecification.price` | `Number`  제품의 판매 가격입니다. [schema.org 사용 가이드라인](https://schema.org/price)을 따르세요.  다음은 `price` 속성의 예입니다. 값은 JSON 문자열 또는 숫자일 수 있습니다.     ``` "offers": {   "@type": "Offer",   "price": 39.99,   "priceCurrency": "USD" } ```   다음은 제품을 무료로 이용할 수 있도록 지정하는 방법의 예입니다.     ``` "offers": {   "@type": "Offer",   "price": 0,   "priceCurrency": "EUR" } ```   또는 판매 가격이 `Offer` 수준에서 제공되는 대신 `priceSpecification` 속성 내에 중첩될 수도 있습니다.     ``` "offers": {   "@type": "Offer",   "priceSpecification": {     "@type": "PriceSpecification",     "price": 9.99,     "priceCurrency": "AUD"   } } ```   `offers.price` 속성과 `offers.priceSpecification` 속성을 모두 사용하여 활성 가격을 인코딩하는 경우 Google은 `offers.price` 속성을 통해 제공된 가격을 사용하고 `offers.priceSpecification` 속성은 무시합니다. 복잡한 가격 책정 방식을 사용하고 있다면 판매자 등록정보 문서에서 [가격 책정 예시](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing?hl=ko#pricing-example) 및 지원되는 [가격 책정 속성](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing?hl=ko#offer-details)을 확인하세요. |

| 권장 속성 | |
| --- | --- |
| `availability` | `ItemAvailability`  다음 목록에서 가장 적합한 제품 재고 옵션 한 가지를 사용하세요.   * `https://schema.org/BackOrder`: 이월 주문된 상품입니다. * `https://schema.org/Discontinued`: 단종된 상품입니다. * `https://schema.org/InStock`: 상품 재고가 있습니다. * `https://schema.org/InStoreOnly`: 매장에서만 구매할 수 있는 상품입니다. * `https://schema.org/LimitedAvailability`: 상품 재고가 한정적입니다. * `https://schema.org/OnlineOnly`: 온라인에서만 구매할 수 있는 상품입니다. * `https://schema.org/OutOfStock`: 현재 재고가 없는 상품입니다. * `https://schema.org/PreOrder`: 선주문할 수 있는 상품입니다. * `https://schema.org/PreSale`: 이 상품은 정식 버전 출시 전에 주문 및 배송이 가능합니다. * `https://schema.org/SoldOut`: 매진된 상품입니다.   URL 접두사가 없는 닉네임도 지원됩니다(예: `BackOrder`). |
| `priceCurrency` 또는 `priceSpecification.priceCurrency` | `Text`  제품 가격을 설명하는 데 사용된 통화이며, 3글자의 [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) 형식으로 나타냅니다.  이 속성은 현재 Google에서 통화를 더 정확하게 결정하는 데 도움이 되는 제품 스니펫에 권장되는 속성이지만, 동시에 판매자 등록정보 환경의 필수 속성이기도 합니다. 따라서 항상 이 속성을 제공하는 것이 가장 좋습니다. |
| `priceValidUntil` | `Date`  [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) 형식의 날짜로, 해당하는 경우 이 날짜가 지나면 더 이상 그 가격을 사용할 수 없습니다. `priceValidUntil` 속성이 지난 날짜를 표시하는 경우 제품 스니펫이 표시되지 않을 수 있습니다. |

#### `UnitPriceSpecification`

`UnitPriceSpecification`의 전체 정의는 `schema.org/UnitPriceSpecification`에서 확인할 수 있습니다.
다음 속성을 사용하여 더 복잡한 가격 책정 체계를 나타내세요.

| 필수 속성 | |
| --- | --- |
| `price` | `Number`  제품의 판매 가격입니다. `Offer`의 `price` 속성도 참고하세요. |

| 권장 속성 | |
| --- | --- |
| `priceCurrency` | `Text`  제품 가격을 설명하는 데 사용된 통화이며, 3글자 [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) 형식으로 나타냅니다. `Offer`의 `priceCurrency` 속성도 참고하세요.  이 속성은 제품 스니펫의 경우 선택사항이지만, 모호한 가격 책정을 방지하고 판매자 등록정보 환경에 필수이므로 적극 권장됩니다. |

#### `AggregateOffer`

`AggregateOffer`의 전체 정의는 `schema.org/AggregateOffer`에서 확인할 수 있습니다.
`AggregateOffer`는 다른 혜택을 종합적으로 나타내는 `Offer`입니다. 예를 들어 여러 판매자가 판매하는 제품에 이 속성을 사용할 수 있습니다.
제품 옵션 집합을 설명할 때 `AggregateOffer`를 사용하지 마세요.
제품 내에서 제공되는 혜택을 종합적으로 마크업할 때는 `schema.org` [`AggregateOffer`](https://schema.org/AggregateOffer) 유형의 다음 속성을 사용하세요.

| 필수 속성 | |
| --- | --- |
| `lowPrice` | `Number`  상품 가격 중 최저가입니다. 1.23달러에서의 1.23과 같이 통화 단위에서 분수를 표현할 때는 구분 기호(`.`)를 사용하세요. |
| `priceCurrency` | `Text`  제품 가격을 설명하는 데 사용된 통화이며, 3글자 [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) 형식으로 나타냅니다. |

| 권장 속성 | |
| --- | --- |
| `highPrice` | `Number`  상품 가격 중 최고가입니다. 필요한 경우 부동 소수점 수를 사용하세요. |
| `offerCount` | `Number`  제품의 상품 수입니다. |

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

구조화된 `Product` 데이터와 관련된 Search Console 보고서 2개가 있습니다.

* **[판매자 등록정보 보고서](https://search.google.com/search-console/r/merchant-listings?hl=ko)**: 쇼핑객이 제품을 구매할 수 있는 페이지에 사용합니다.
* **[제품 스니펫 보고서](https://search.google.com/search-console/r/product?hl=ko)**: 제품 리뷰 및 애그리게이터 사이트와 같은 기타 제품 관련 페이지에 사용합니다.

두 보고서 모두 구조화된 `Product` 데이터와 관련된 경고와 오류를 제공하지만 관련 환경에 대한 요구사항이 다르기 때문에 분리되어 있습니다. 예를 들어 [판매자 등록정보 보고서](https://search.google.com/search-console/r/merchant-listings?hl=ko)에는 구조화된 `Offer` 데이터를 포함하는 제품 스니펫에 대한 검사가 포함되어 있으므로, [제품 스니펫](https://search.google.com/search-console/r/product?hl=ko) 보고서는 판매자 등록정보와 무관한 페이지에 대해서만 참조하면 됩니다.

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
