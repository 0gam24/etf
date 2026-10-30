# 구조화된 리뷰 스니펫 (Review,AggregateRating) 데이터

> **출처(Source):** https://developers.google.com/search/docs/appearance/structured-data/review-snippet?hl=ko
> **저작자(Attribution):** Google
> **라이선스(License):** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
> 이 문서는 Google 검색 센터 문서를 Markdown으로 변환한 사본입니다.
> 원문의 최신 내용은 위 출처 링크를 확인하세요.

---

# 구조화된 리뷰 스니펫 (`Review`, `AggregateRating`) 데이터

리뷰 스니펫은 리뷰 웹사이트의 리뷰 또는 평점을 간단하게 발췌한 것으로, 보통 여러 리뷰 작성자의 평균 누계 평점을 표시합니다. Google이 유효한 리뷰나 평점 마크업을 발견하면, 리뷰 또는 평점의 기타 요약 정보와 별표를 포함하는 리치 스니펫을 표시할 수 있습니다. 리뷰 텍스트 외에 평점은 숫자 척도(예: 1~5)로 나타낸 평가입니다. 리뷰 스니펫은 리치 결과 또는 Google 지식 패널에 표시될 수 있습니다. 다음 기능에 평점을 제공할 수 있습니다.

![Google 검색의 리뷰 스니펫](https://developers.google.com/static/search/docs/images/reviews04.png?hl=ko)


**참고**: 실제로 검색결과에 표시되는 모습은 다를 수 있습니다. [리치 결과 테스트](https://support.google.com/webmasters/answer/7445569?hl=ko)를 사용하면 대부분의 기능을 미리 볼 수 있습니다.

* [도서](https://developers.google.com/search/docs/appearance/structured-data/book?hl=ko)
* [과정 목록](https://developers.google.com/search/docs/appearance/structured-data/course?hl=ko)
* [이벤트](https://developers.google.com/search/docs/appearance/structured-data/event?hl=ko)
* [지역 비즈니스](https://developers.google.com/search/docs/appearance/structured-data/local-business?hl=ko)(다른 지역 비즈니스에 대한 리뷰를 캡처하는 사이트에만 해당, [자체 제공 리뷰 가이드라인](#self-serving) 참고)
* [영화](https://developers.google.com/search/docs/appearance/structured-data/movie?hl=ko)
* [제품](https://developers.google.com/search/docs/appearance/structured-data/product?hl=ko)
* [레시피](https://developers.google.com/search/docs/appearance/structured-data/recipe?hl=ko)
* [소프트웨어 앱](https://developers.google.com/search/docs/appearance/structured-data/software-app?hl=ko)

Google은 다음 schema.org 유형 및 하위유형에 관한 리뷰도 지원합니다.

* `CreativeWorkSeason`
* `CreativeWorkSeries`
* `Episode`
* `Game`
* `MediaObject`
* `MusicPlaylist`
* `MusicRecording`
* `Organization`(다른 조직에 대한 리뷰를 캡처하는 사이트에만 해당, [자체 제공 리뷰 가이드라인](#self-serving) 참고)

**사이트에서 다른 고용주에 관한 리뷰를 제공하나요?** [구조화된 `EmployerAggregateRating` 데이터](https://developers.google.com/search/docs/appearance/structured-data/employer-rating?hl=ko)를 사용하세요.

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

다음과 같은 방법으로 페이지에 구조화된 `Review` 데이터를 추가할 수 있습니다.

* 간단한 리뷰 추가
* [`review`](https://schema.org/review) 속성을 사용하여 다른 schema.org 유형에 리뷰 중첩
* 누계 평점 추가: 마크업된 콘텐츠에 작성자와 리뷰 날짜가 모두 포함되어 있는 경우 개별 리뷰의 평점을 생략할 수 있습니다. 누계 리뷰의 경우, 표시할 리치 스니펫의 평균 평점을 제공해야 합니다.
* [`aggregateRating`](https://schema.org/aggregateRating) 속성을 사용하여 다른 schema.org 유형에 누계 평점 중첩

### 간단한 리뷰

다음은 간단한 리뷰의 예입니다.

### JSON-LD

  

```
<html>
  <head>
  <title>Legal Seafood</title>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org/",
      "@type": "Review",
      "itemReviewed": {
        "@type": "Restaurant",
        "image": "https://www.example.com/seafood-restaurant.jpg",
        "name": "Legal Seafood",
        "servesCuisine": "Seafood",
        "priceRange": "$$$",
        "telephone": "1234567",
        "address" :{
          "@type": "PostalAddress",
          "streetAddress": "123 William St",
          "addressLocality": "New York",
          "addressRegion": "NY",
          "postalCode": "10038",
          "addressCountry": "US"
        }
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": 4
      },
      "author": {
        "@type": "Person",
        "name": "Bob Smith"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Washington Times"
      }
    }
    </script>
  </head>
  <body>
  </body>
</html>
```

### RDFa

  

```
 <html>
  <head>
    <title>Legal Seafood</title>
  </head>
  <body>
    <div vocab="https://schema.org/" typeof="Review">
      <div property="itemReviewed" typeof="Restaurant">
        <img property="image" src="https://example.com/photos/1x1/seafood-restaurant.jpg" alt="Legal Seafood"/>
        <span property="name">Legal Seafood</span>
        <span property="servesCuisine">Seafood</span>
        <span property="priceRange">$$$</span>
        <span property="telephone">1234567</span>
        <span property="address">123 William St, New York</span>
      </div>
      <span property="reviewRating" typeof="Rating">
        <span property="ratingValue">4</span>
      </span> stars -
      <b>"A good seafood place." </b>
      <span property="author" typeof="Person">
        <span property="name">Bob Smith</span>
      </span>
      <div property="publisher" typeof="Organization">
        <meta property="name" content="Washington Times">
      </div>
    </div>
  </body>
</html>
```

### 마이크로데이터

  

```
 <html>
  <head>
  <title>Legal Seafood</title>
  </head>
  <body>
    <div itemscope itemtype="https://schema.org/Review">
      <div itemprop="itemReviewed" itemscope itemtype="https://schema.org/Restaurant">
        <img itemprop="image" src="https://example.com/photos/1x1/seafood-restaurant.jpg" alt="Legal Seafood"/>
        <span itemprop="name">Legal Seafood</span>
        <span itemprop="servesCuisine">Seafood</span>
        <span itemprop="priceRange">$$$</span>
        <span itemprop="telephone">1234567</span>
        <span itemprop="address">123 William St, New York</span>
      </div>
      <span itemprop="reviewRating" itemscope itemtype="https://schema.org/Rating">
        <span itemprop="ratingValue">4</span>
      </span> stars -
      <b>"A good seafood place." </b>
      <span itemprop="author" itemscope itemtype="https://schema.org/Person">
        <span itemprop="name">Bob Smith</span>
      </span>
      <div itemprop="publisher" itemscope itemtype="https://schema.org/Organization">
        <meta itemprop="name" content="Washington Times">
      </div>
    </div>
  </body>
</html>
```

### 중첩된 리뷰

다음은 `Product`에 중첩된 리뷰의 예입니다. 예를 복사하여 자체 HTML 페이지에 붙여넣을 수 있습니다.

### JSON-LD

  

```
<html>
  <head>
    <title>The Catcher in the Rye</title>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org/",
      "@type": "Product",
      "brand": {
        "@type": "Brand",
        "name": "Penguin Books"
      },
      "description": "The Catcher in the Rye is a classic coming-of-age story: an story of teenage alienation, capturing the human need for connection and the bewildering sense of loss as we leave childhood behind.",
      "sku": "9780241984758",
      "mpn": "925872",
      "image": "https://www.example.com/catcher-in-the-rye-book-cover.jpg",
      "name": "The Catcher in the Rye",
      "review": [{
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": 5
        },
        "author": {
          "@type": "Person",
          "name": "John Doe"
        }
       },
      {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": 1
        },
        "author": {
          "@type": "Person",
          "name": "Jane Doe"
        }
      }],
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": 88,
        "bestRating": 100,
        "ratingCount": 20
      },
      "offers": {
        "@type": "Offer",
        "url": "https://example.com/offers/catcher-in-the-rye",
        "priceCurrency": "USD",
        "price": 5.99,
        "priceValidUntil": "2024-11-05",
        "itemCondition": "https://schema.org/UsedCondition",
        "availability": "https://schema.org/InStock",
        "seller": {
          "@type": "Organization",
          "name": "eBay"
        }
      }
    }
    </script>
  </head>
  <body>
  </body>
</html>
```

### RDFa

  

```
 <html>
  <head>
    <title>The Catcher in the Rye</title>
  </head>
    <body>
      <div vocab="https://schema.org/" typeof="Product">
        <div rel="schema:brand">
          <div typeof="schema:Brand">
            <div property="schema:name" content="Penguin"></div>
          </div>
        </div>
        <div property="schema:description" content="The Catcher in the Rye is a classic coming-of-age story: an story of teenage alienation, capturing the human need for connection and the bewildering sense of loss as we leave childhood behind."></div>
        <div property="schema:sku" content="9780241984758"></div>
        <div property="schema:mpn" content="925872"></div>
        <img property="image" src="https://example.com/photos/1x1/catcher-in-the-rye-book-cover.jpg" alt="Catcher in the Rye"/>
        <span property="name">The Catcher in the Rye</span>
        <div property="review" typeof="Review"> Reviews:
          <span property="reviewRating" typeof="Rating">
            <span property="ratingValue">5</span> -
          </span>
          <b>"A masterpiece of literature" </b> by
          <span property="author" typeof="Person">
            <span property="name">John Doe</span></span>, written on
          <meta property="datePublished" content="2006-05-04">4 May 2006
          <div>I really enjoyed this book. It captures the essential challenge people face as they try make sense of their lives and grow to adulthood.</div>
          <span property="publisher" typeof="Organization">
            <meta property="name" content="Washington Times">
          </span>
        </div><div property="review" typeof="Review">
          <span property="reviewRating" typeof="Rating">
            <span property="ratingValue">1</span> -
          </span>
          <b>"The worst thing I've ever read" </b> by
          <span property="author" typeof="Person">
            <span property="name">Jane Doe</span></span>, written on
          <meta property="datePublished" content="2006-05-10">10 May 2006
          <span property="publisher" typeof="Organization">
            <meta property="name" content="Washington Times">
          </span>
        </div>
        <div rel="schema:aggregateRating">
          <div typeof="schema:AggregateRating">
            <div property="schema:reviewCount" content="89"></div>
            <div property="schema:ratingValue" content="4.4">4,4</div> stars
          </div>
        </div>
        <div rel="schema:offers">
          <div typeof="schema:Offer">
            <div property="schema:price" content="4.99"></div>
            <div property="schema:availability" content="https://schema.org/InStock"></div>
            <div property="schema:priceCurrency" content="GBP"></div>
            <div property="schema:priceValidUntil" datatype="xsd:date" content="2024-11-21"></div>
            <div rel="schema:url" resource="https://example.com/catcher"></div>
            <div property="schema:itemCondition" content="https://schema.org/UsedCondition"></div>
          </div>
        </div>
    </div>
  </body>
</html>
```

### 마이크로데이터

  

```
 <html>
  <head>
    <title>The Catcher in the Rye</title>
  </head>
  <body>
    <div itemscope itemtype="https://schema.org/Product">
      <div itemprop="brand" itemtype="https://schema.org/Brand" itemscope>
        <meta itemprop="name" content="Penguin" />
      </div>
      <meta itemprop="description" content="The Catcher in the Rye is a classic coming-of-age story: an story of teenage alienation, capturing the human need for connection and the bewildering sense of loss as we leave childhood behind." />
      <meta itemprop="sku" content="0446310786" />
      <meta itemprop="mpn" content="925872" />
      <img itemprop="image" src="https://example.com/photos/1x1/catcher-in-the-rye-book-cover.jpg" alt="Catcher in the Rye"/>
      <span itemprop="name">The Catcher in the Rye</span>
      <div itemprop="review" itemscope itemtype="https://schema.org/Review"> Reviews:
        <span itemprop="reviewRating" itemscope itemtype="https://schema.org/Rating">
          <span itemprop="ratingValue">5</span> -
        </span>
        <b>"A masterpiece of literature" </b> by
        <span itemprop="author" itemscope itemtype="https://schema.org/Person">
          <span itemprop="name">John Doe</span></span>, written on
        <meta itemprop="datePublished" content="2006-05-04">4 May 2006
        <div>I really enjoyed this book. It captures the essential challenge people face as they try make sense of their lives and grow to adulthood.</div>
        <span itemprop="publisher" itemscope itemtype="https://schema.org/Organization">
            <meta itemprop="name" content="Washington Times">
        </span>
      </div><div itemprop="review" itemscope itemtype="https://schema.org/Review">
        <span itemprop="reviewRating" itemscope itemtype="https://schema.org/Rating">
            <span itemprop="ratingValue">1</span> -
        </span>
        <b>"The worst thing I've ever read" </b> by
        <span itemprop="author" itemscope itemtype="https://schema.org/Person">
          <span itemprop="name">Jane Doe</span></span>, written on
        <meta itemprop="datePublished" content="2006-05-10">10 May 2006
        <span itemprop="publisher" itemscope itemtype="https://schema.org/Organization">
          <meta itemprop="name" content="Washington Times">
        </span>
      </div>
      <div itemprop="aggregateRating" itemtype="https://schema.org/AggregateRating" itemscope>
        <meta itemprop="reviewCount" content="89" />
        <span itemprop="ratingValue" content="4.4">4,4</span> stars
      </div>
      <div itemprop="offers" itemtype="https://schema.org/Offer" itemscope>
        <link itemprop="url" href="https://example.com/catcher" />
        <meta itemprop="availability" content="https://schema.org/InStock" />
        <meta itemprop="priceCurrency" content="GBP" />
        <meta itemprop="itemCondition" content="https://schema.org/UsedCondition" />
        <meta itemprop="price" content="4.99" />
        <meta itemprop="priceValidUntil" content="2024-11-21" />
      </div>
    </div>
  </body>
</html>
```

### 누계 평점

다음은 누계 평점의 예입니다.

### JSON-LD

  

```
<html>
  <head>
    <title>Legal Seafood</title>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org/",
      "@type": "AggregateRating",
      "itemReviewed": {
        "@type": "Restaurant",
        "image": "https://www.example.com/seafood-restaurant.jpg",
        "name": "Legal Seafood",
        "servesCuisine": "Seafood",
        "telephone": "1234567",
        "address" : {
          "@type": "PostalAddress",
          "streetAddress": "123 William St",
          "addressLocality": "New York",
          "addressRegion": "NY",
          "postalCode": "10038",
          "addressCountry": "US"
        }
      },
      "ratingValue": 88,
      "bestRating": 100,
      "ratingCount": 20
    }
    </script>
  </head>
  <body>
  </body>
</html>
```

### RDFa

  

```
 <html>
  <head>
    <title>Legal Seafood</title>
  </head>
  <body>
    <div vocab="https://schema.org/" typeof="AggregateRating">
      <div property="itemReviewed" typeof="Restaurant">
        <img property="image" src="https://example.com/photos/1x1/seafood-restaurant.jpg" alt="Legal Seafood"/>
        <span property="name">Legal Seafood</span>
        <span property="servesCuisine">Seafood</span>
        <span property="telephone">1234567</span>
        <span property="address">123 William St, New York</span>
      </div>
      <span property="ratingValue">4.2</span> out of <span property="bestRating">5</span> stars -
      <span property="ratingCount">123</span> votes
    </div>
  </body>
</html>
```

### 마이크로데이터

  

```
 <html>
  <head>
    <title>Legal Seafood</title>
  </head>
  <body>
    <div itemscope itemtype="https://schema.org/AggregateRating">
      <div itemprop="itemReviewed" itemscope itemtype="https://schema.org/Restaurant">
        <img itemprop="image" src="https://example.com/photos/1x1/seafood-restaurant.jpg" alt="Legal Seafood"/>
        <span itemprop="name">Legal Seafood</span>
        <span itemprop="servesCuisine">Seafood</span>
        <span itemprop="telephone">1234567</span>
        <span itemprop="address">123 William St, New York</span>
      </div>
      <span itemprop="ratingValue">4.2</span> out of <span itemprop="bestRating">5</span> stars -
      <span itemprop="ratingCount">123</span> votes
    </div>
  </body>
</html>
```

### 중첩된 누계 평점

다음은 `Product`에 중첩된 누계 평점의 예입니다. 예를 복사하여 자체 HTML 페이지에 붙여넣을 수 있습니다.

### JSON-LD

  

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
    "brand": {
      "@type": "Brand",
      "name": "ACME"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": 4.4,
      "ratingCount": 89
    },
    "offers": {
      "@type": "AggregateOffer",
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

### RDFa

  

```
 <html>
  <head>
    <title>Executive Anvil</title>
  </head>
  <body>
    <div vocab="https://schema.org/" typeof="Product">
     <span property="brand" typeof="Brand">ACME</span> <span property="name">Executive Anvil</span>
     <img property="image" src="https://example.com/photos/1x1/anvil_executive.jpg" alt="Executive Anvil logo" />
     <span property="aggregateRating"
           typeof="AggregateRating">
      Average rating: <span property="ratingValue">4.4</span>, based on
      <span property="ratingCount">89</span> reviews
     </span>
     <span property="offers" typeof="AggregateOffer">
      from $<span property="lowPrice">119.99</span> to
      $<span property="highPrice">199.99</span>
      <meta property="priceCurrency" content="USD" />
     </span>
    </div>
  </body>
</html>
```

### 마이크로데이터

  

```
 <html>
  <head>
    <title>Executive Anvil</title>
  </head>
  <body>
    <div itemscope itemtype="https://schema.org/Product">
      <span itemprop="brand" itemtype="https://schema.org/Brand" itemscope>ACME</span> <span itemprop="name">Executive Anvil</span>
      <img itemprop="image" src="https://example.com/photos/1x1/anvil_executive.jpg" />
      <span itemprop="aggregateRating" itemscope itemtype="https://schema.org/AggregateRating">
        Average rating: <span itemprop="ratingValue">4.4</span>, based on
        <span itemprop="ratingCount">89</span> reviews
      </span>
      <span itemprop="offers" itemscope itemtype="https://schema.org/AggregateOffer">
        from $<span itemprop="lowPrice">119.99</span> to
        $<span itemprop="highPrice">199.99</span>
        <meta itemprop="priceCurrency" content="USD" />
      </span>
    </div>
  </body>
</html>
```

## 가이드라인

콘텐츠를 리치 결과로 표시하려면 다음 가이드라인을 따라야 합니다.

**경고:** Google에서는 이 가이드라인을 하나 이상 위반하는 사이트에 [직접 조치](https://support.google.com/webmasters/answer/2604824?hl=ko)를 취할 수 있습니다. 문제가 되는 부분을 해결하고 나면 사이트 [재검토](https://support.google.com/webmasters/answer/35843?hl=ko) 요청을 제출할 수 있습니다.

* [기술 가이드라인](#technical-guidelines)
* [검색 Essentials](https://developers.google.com/search/docs/essentials?hl=ko)
* [구조화된 데이터 일반 가이드라인](https://developers.google.com/search/docs/appearance/structured-data/sd-policies?hl=ko)

### 기술 가이드라인

* [schema.org/AggregateRating](https://schema.org/AggregateRating)으로 여러 사람의 항목 누계 평가를 마크업하세요. Google은 누계 평점을 리치 스니펫으로 표시할 수 있으며, 특정 유형의 항목인 경우 검색결과의 답변으로 표시할 수 있습니다.
* [schema.org/Book](https://schema.org/Book) 또는 [schema.org/Recipe](https://schema.org/Recipe) 같은 다른 schema.org 유형의 마크업에서 리뷰를 중첩하거나 `itemReviewed` 속성 값으로 schema.org 유형을 사용하여 특정 제품 또는 서비스를 명확하게 언급합니다.
* 사용자가 마크업된 리뷰 콘텐츠를 마크업한 페이지에서 즉시 볼 수 있는지 확인합니다. 페이지에 리뷰 콘텐츠가 있다는 것을 사용자가 바로 알 수 있어야 합니다. 예를 들어 리뷰를 마크업한 경우 사용자는 리뷰 본문과 관련 평점을 볼 수 있어야 합니다. `AggregateRating`를 사용하는 경우 사용자는 페이지에서 집계된 평점을 볼 수 있어야 합니다.
* 리뷰 댓글과 작성자 이름이 포함된 평점만 수락하는 것이 좋습니다.
  필수는 아니지만 이 방식은 사용자에게 평점의 근거가 되는 세부정보를 표시하는 데 도움이 될 수 있습니다.
* 카테고리나 항목 목록이 아닌 특정 항목의 리뷰 정보를 제공합니다.
* 개별 리뷰를 여러 개 포함하는 경우 개별 리뷰의 누계 평점도 포함합니다.
* 다른 웹사이트의 리뷰나 평점은 집계하지 않습니다.
* 리뷰 스니펫이 지역 비즈니스 또는 조직에 관한 것이라면 다음과 같은 추가 가이드라인을 따라야 합니다.
  + 리뷰 대상이 되는 법인에서 자체적으로 리뷰를 관리하는 경우 `LocalBusiness` 또는 다른 유형의 구조화된 `Organization` 데이터를 사용하는 페이지에서는 별표 리뷰 기능을 사용할 수 없습니다. 예를 들어 항목 A에 관한 리뷰는 구조화된 데이터에서 직접 삽입되거나 삽입된 서드 파티 위젯(예: Google 비즈니스 리뷰 또는 Facebook 리뷰 위젯)을 통해 항목 A의 웹사이트에 배치됩니다.
    자세한 내용은 [이 가이드라인을 추가한 이유에 관한 블로그 게시물](https://developers.google.com/search/blog/2019/09/making-review-rich-results-more-helpful?hl=ko#updated)과 [변경사항 관련 FAQ](https://developers.google.com/search/blog/2019/09/making-review-rich-results-more-helpful?hl=ko#faq)를 참고하세요.
  + 평점은 사용자로부터 직접 제공받아야 합니다.
  + 지역 비즈니스의 평점 정보를 만들거나 선별하거나 수집하는 데 편집자에게 의존하지 마세요.

## 구조화된 데이터 유형 정의

검색결과에 구조화된 데이터를 표시하려면 필수 속성이 있어야 합니다. 권장 속성을 통해 구조화된 데이터에 더 많은 정보를 추가하여 더욱 만족스러운 사용자 환경을 제공할 수도 있습니다.

### `Review`

`Review`의 전체 정의는 [schema.org/Review](https://schema.org/Review)에서 확인할 수 있습니다.

Google에서 지원하는 속성은 다음과 같습니다.

| 필수 속성 | |
| --- | --- |
| `author` | `Person` 또는 `Organization`  리뷰 작성자입니다. 리뷰 작성자 이름은 유효한 이름이어야 합니다. 예를 들어 '토요일까지 50% 할인'은 유효한 리뷰 작성자 이름이 아닙니다.  이 필드는 100자(영문 기준) 미만이어야 합니다. 100자(영문 기준)를 초과하면 페이지에서 작성자 기반의 리뷰 스니펫을 사용할 수 없습니다.  Google에서 다양한 기능을 갖춘 작성자를 가장 잘 이해할 수 있도록 [작성자 마크업 권장사항](https://developers.google.com/search/docs/appearance/structured-data/article?hl=ko#author-bp)을 따르는 것이 좋습니다. |
| `itemReviewed` (리뷰가 [중첩된 리뷰](#embedded-review-example)가 아닌 경우) | 유효한 유형 중 하나  리뷰되는 항목입니다. 하지만 리뷰가 `review` 속성을 사용하여 다른 schema.org 유형에 중첩된 경우 `itemReviewed` 속성을 생략합니다 (상위 항목이 리뷰된 항목이라고 가정).  다음은 리뷰 항목의 유효한 유형입니다.   * `Book` * `Course` * `CreativeWorkSeason` * `CreativeWorkSeries` * `Episode` * `Event` * `Game` * `HowTo` * `LocalBusiness` * `MediaObject` * `Movie` * `MusicPlaylist` * `MusicRecording` * `Organization` * `Product` * `Recipe` * `SoftwareApplication` |
| [중첩된 리뷰](#embedded-review-example)의 `itemReviewed.name` 또는 상위 항목 `name` | `Text`  리뷰되는 항목의 이름입니다. 리뷰가 `review` 속성을 사용하여 다른 schema.org 유형에 중첩된 경우 리뷰되는 항목의 `name`을 계속 제공해야 합니다. 예:     ``` {   "@context": "https://schema.org/",   "@type": "Game",   "name": "Firefly",   "review": {     "@type": "Review",     "reviewRating": {       "@type": "Rating",       "ratingValue": 5     },     "author": {       "@type": "Person",       "name": "John Doe"     }   } } ``` |
| `reviewRating` | `Rating`  이 리뷰에 주어진 평점입니다. 평점은 중첩된 [`Rating`](https://schema.org/Rating) 또는 더 세부적인 하위유형일 수 있습니다. 가장 일반적인 하위유형은 [`AggregateRating`](#aggregated-rating-type-definition)입니다. |
| `reviewRating.ratingValue` | `Number` 또는 `Text`  항목의 품질 평점을 숫자, 백분율, 분수로 나타낸 숫자 값입니다(예: `4`, `60%` 또는 `6 / 10`). 분수 자체나 백분율에 척도가 내포되어 있기에 Google에서는 분수와 백분율의 척도를 파악하고 있습니다. 숫자 값의 기본 척도는 5점이며, 1이 가장 낮은 값이고 5가 가장 높은 값입니다. 다른 척도를 사용하려면 `bestRating`과 `worstRating`을 사용하세요.  십진수는 쉼표 대신 점을 사용하여 값을 지정하세요(예: `4,4` 대신 `4.4`). 마이크로데이터 및 RDFa에서는 `content` 속성을 사용하여 표시되는 콘텐츠를 재정의할 수 있습니다. 이렇게 하면 구조화된 데이터의 점 요구사항을 충족하면서 원하는 스타일을 사용자에게 표시할 수 있습니다. 예:     ``` <span itemprop="ratingValue" content="4.4">4,4</span> stars ``` |

| 권장 속성 | |
| --- | --- |
| `datePublished` | `Date`  [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) 날짜 형식의 리뷰 게시 날짜입니다. |
| `reviewRating.bestRating` | `Number`  이 평가 시스템에서 허용되는 가장 높은 값입니다. `bestRating`이 생략된 경우 5점으로 간주됩니다. |
| `reviewRating.worstRating` | `Number`  이 평가 시스템에서 허용되는 가장 낮은 값입니다. `worstRating`이 생략된 경우 1점으로 간주됩니다. |

### `AggregateRating`

`AggregateRating`의 전체 정의는 [schema.org/AggregateRating](https://schema.org/AggregateRating)에서 확인할 수 있습니다.

Google에서 지원하는 속성은 다음과 같습니다.

| 필수 속성 | |
| --- | --- |
| `itemReviewed` (누계 평점이 [중첩된 누계 평점](#embedded-aggregate-rating)이 아닌 경우) | 유효한 유형 중 하나  평가되는 항목입니다. 그러나 누계 평점이 `aggregateRating` 속성을 사용하여 다른 schema.org 유형에 중첩된 경우 `itemReviewed` 속성을 생략합니다.  다음은 리뷰 항목의 유효한 유형입니다.   * `Book` * `Course` * `CreativeWorkSeason` * `CreativeWorkSeries` * `Episode` * `Event` * `Game` * `HowTo` * `LocalBusiness` * `MediaObject` * `Movie` * `MusicPlaylist` * `MusicRecording` * `Organization` * `Product` * `Recipe` * `SoftwareApplication` |
| [중첩된 누계 평점](#embedded-aggregate-rating)의 `itemReviewed.name` 또는 상위 항목 `name` | `Text`  리뷰되는 항목의 이름입니다. 리뷰가 `aggregateRating` 속성을 사용하여 다른 schema.org 유형에 중첩된 경우 리뷰되는 항목의 `name`을 계속 제공해야 합니다. 예:     ``` {   "@context": "https://schema.org/",   "@type": "Game",   "name": "Firefly",   "aggregateRating": {     "@type": "AggregateRating",     "ratingValue": 88,     "bestRating": 100,     "ratingCount": 20   } } ``` |
| `ratingCount` | `Number`  사이트의 총 항목 평점 수입니다. `ratingCount` 또는 `reviewCount` 중 하나가 필요합니다. |
| `reviewCount` | `Number`  평점과 함께 또는 평점 없이 리뷰를 남긴 사람들의 수를 지정합니다. `ratingCount` 또는 `reviewCount` 중 하나가 필요합니다. |
| `ratingValue` | `Number` 또는 `Text`  숫자, 분수 또는 백분율로 된 숫자 값을 사용하는 항목 품질 평균 평점입니다.(예: `4`, `60%` 또는 `6 / 10`). 분수 자체나 백분율에 척도가 내포되어 있기에 Google에서는 분수와 백분율의 척도를 파악하고 있습니다. 숫자 값의 기본 척도는 5점이며, 1이 가장 낮은 값이고 5가 가장 높은 값입니다. 다른 척도를 사용하려면 `bestRating`과 `worstRating`을 사용하세요.  십진수는 쉼표 대신 점을 사용하여 값을 지정하세요(예: `4,4` 대신 `4.4`). 마이크로데이터 및 RDFa에서는 `content` 속성을 사용하여 표시되는 콘텐츠를 재정의할 수 있습니다. 이렇게 하면 구조화된 데이터의 점 요구사항을 충족하면서 원하는 스타일을 사용자에게 표시할 수 있습니다. 예:     ``` <span itemprop="ratingValue" content="4.4">4,4</span> stars ``` |

| 권장 속성 | |
| --- | --- |
| `bestRating` | `Number`  이 평가 시스템에서 허용되는 가장 높은 값입니다. `bestRating`이 생략된 경우 5점으로 간주됩니다. |
| `worstRating` | `Number`  이 평가 시스템에서 허용되는 가장 낮은 값입니다. `worstRating`이 생략된 경우 1점으로 간주됩니다. |

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
