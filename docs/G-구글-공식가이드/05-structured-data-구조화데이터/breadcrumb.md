# 구조화된 탐색경로(BreadcrumbList) 데이터

> **출처(Source):** https://developers.google.com/search/docs/appearance/structured-data/breadcrumb?hl=ko
> **저작자(Attribution):** Google
> **라이선스(License):** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
> 이 문서는 Google 검색 센터 문서를 Markdown으로 변환한 사본입니다.
> 원문의 최신 내용은 위 출처 링크를 확인하세요.

---

# 구조화된 탐색경로(`BreadcrumbList`) 데이터

![검색 결과의 탐색경로](https://developers.google.com/static/search/docs/images/breadcrumb.png?hl=ko)

페이지의 탐색경로 트레일은 사이트 계층 구조에서 페이지의 위치를 나타내며 사용자가 사이트를 효과적으로 이해하고 탐색하는 데 도움이 될 수 있습니다. 사용자는 탐색경로 트레일의 마지막 탐색경로에서 시작하여 한 번에 한 수준씩 사이트 계층 구조 위로 끝까지 탐색할 수 있습니다.

## 기능 제공 여부

이 기능은 데스크톱에서 사용 가능하며, Google 검색이 제공되는 모든 지역에서 해당 언어로 사용할 수 있습니다.

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

Google 검색에서는 웹페이지의 본문에 탐색경로 마크업을 사용하여 검색결과에서 페이지의 정보를 분류합니다. 아래 사용 사례에 설명된 것처럼 사용자는 매우 다양한 유형의 검색어를 사용하여 페이지에 도착할 수 있습니다. 각 검색어가 동일한 웹페이지를 반환할 수 있지만 탐색경로는 Google 검색어의 컨텍스트 내에서 콘텐츠를 분류합니다. 가상의 도서상 수상자 페이지에서는 다음과 같은 탐색경로 트레일을 사용할 수 있습니다.

### 단일 탐색경로 트레일

페이지로 연결될 수 있는 탐색경로 트레일이 하나만 있는 경우 페이지는 다음의 탐색경로 트레일을 지정할 수 있습니다.

[도서](https://www.example.com/books) ›
[공상과학](https://www.example.com/books/sciencefiction) ›
수상작

### JSON-LD

다음은 이 탐색경로를 지원하는 JSON-LD의 예입니다.

  

```
<html>
  <head>
    <title>Award Winners</title>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [{
        "@type": "ListItem",
        "position": 1,
        "name": "Books",
        "item": "https://example.com/books"
      },{
        "@type": "ListItem",
        "position": 2,
        "name": "Science Fiction",
        "item": "https://example.com/books/sciencefiction"
      },{
        "@type": "ListItem",
        "position": 3,
        "name": "Award Winners"
      }]
    }
    </script>
  </head>
  <body>
  </body>
</html>
```

### RDFa

다음은 이 탐색경로를 지원하는 RDFa의 예입니다.

  

```
<html>
  <head>
    <title>Award Winners</title>
  </head>
  <body>
    <ol vocab="https://schema.org/" typeof="BreadcrumbList">
      <li property="itemListElement" typeof="ListItem">
        <a property="item" typeof="WebPage"
            href="https://example.com/books">
          <span property="name">Books</span></a>
        <meta property="position" content="1">
      </li>
      ›
      <li property="itemListElement" typeof="ListItem">
        <a property="item" typeof="WebPage"
            href="https://example.com/books/sciencefiction">
          <span property="name">Science Fiction</span></a>
        <meta property="position" content="2">
      </li>
      ›
      <li property="itemListElement" typeof="ListItem">
        <span property="name">Award Winners</span>
        <meta property="position" content="3">
      </li>
    </ol>
  </body>
</html>
```

### 마이크로데이터

다음은 이 탐색경로를 지원하는 마이크로데이터의 예입니다.

  

```
<html>
  <head>
    <title>Award Winners</title>
  </head>
  <body>
    <ol itemscope itemtype="https://schema.org/BreadcrumbList">
      <li itemprop="itemListElement" itemscope
          itemtype="https://schema.org/ListItem">
        <a itemprop="item" href="https://example.com/books">
            <span itemprop="name">Books</span></a>
        <meta itemprop="position" content="1" />
      </li>
      ›
      <li itemprop="itemListElement" itemscope
          itemtype="https://schema.org/ListItem">
        <a itemscope itemtype="https://schema.org/WebPage"
           itemprop="item" itemid="https://example.com/books/sciencefiction"
           href="https://example.com/books/sciencefiction">
          <span itemprop="name">Science Fiction</span></a>
        <meta itemprop="position" content="2" />
      </li>
      ›
      <li itemprop="itemListElement" itemscope
          itemtype="https://schema.org/ListItem">
        <span itemprop="name">Award winners</span>
        <meta itemprop="position" content="3" />
      </li>
    </ol>
  </body>
</html>
```

### HTML

다음은 시각적 디자인의 일부로 페이지 내에 있는 HTML 탐색경로 블록의 예입니다.

```
<html>
  <head>
    <title>Award Winners</title>
  </head>
  <body>
    <ol>
      <li>
        <a href="https://www.example.com/books">Books</a>
      </li>
      <li>
        <a href="https://www.example.com/sciencefiction">Science Fiction</a>
      </li>
      <li>
        Award Winners
      </li>
    </ol>
  </body>
</html>
```

### 여러 탐색경로 트레일

사이트의 페이지로 이동하는 여러 경로가 있는 경우 한 페이지에 여러 개의 탐색경로 트레일을 지정할 수 있습니다. 다음은 수상 도서의 페이지로 연결되는 한 가지 탐색경로 트레일입니다.

[도서](https://www.example.com/books) ›
[공상과학](https://www.example.com/books/sciencefiction) ›
수상작

다음은 동일한 페이지로 연결되는 다른 탐색경로 트레일입니다.

[문학](https://www.example.com/literature) ›
수상작

### JSON-LD

다음은 여러 탐색경로 트레일을 지원하는 JSON-LD의 예입니다.

  

```
<html>
  <head>
    <title>Award Winners</title>
    <script type="application/ld+json">
    [{
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [{
        "@type": "ListItem",
        "position": 1,
        "name": "Books",
        "item": "https://example.com/books"
      },{
        "@type": "ListItem",
        "position": 2,
        "name": "Science Fiction",
        "item": "https://example.com/books/sciencefiction"
      },{
        "@type": "ListItem",
        "position": 3,
        "name": "Award Winners"
      }]
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [{
        "@type": "ListItem",
        "position": 1,
        "name": "Literature",
        "item": "https://example.com/literature"
      },{
        "@type": "ListItem",
        "position": 2,
        "name": "Award Winners"
      }]
    }]
    </script>
  </head>
  <body>
  </body>
</html>
```

### RDFa

다음은 여러 탐색경로 트레일을 지원하는 RDFa의 예입니다.

  

```
<html>
  <head>
    <title>Award Winners</title>
  </head>
  <body>
    <ol vocab="https://schema.org/" typeof="BreadcrumbList">
      <li property="itemListElement" typeof="ListItem">
        <a property="item" typeof="WebPage"
            href="https://example.com/books">
          <span property="name">Books</span></a>
        <meta property="position" content="1">
      </li>
      ›
      <li property="itemListElement" typeof="ListItem">
        <a property="item" typeof="WebPage"
            href="https://example.com/books/sciencefiction">
          <span property="name">Science Fiction</span></a>
        <meta property="position" content="2">
      </li>
      ›
      <li property="itemListElement" typeof="ListItem">
        <a property="item" typeof="WebPage"
            href="https://example.com/books/sciencefiction/awardwinners">
          <span property="name">Award Winners</span></a>
        <meta property="position" content="3">
      </li>
    </ol>
    <ol vocab="https://schema.org/" typeof="BreadcrumbList">
      <li property="itemListElement" typeof="ListItem">
        <a property="item" typeof="WebPage"
            href="https://example.com/literature">
          <span property="name">Literature</span></a>
        <meta property="position" content="1">
      </li>
      ›
      <li property="itemListElement" typeof="ListItem">
        <span property="name">Award Winners</span>
        <meta property="position" content="2">
      </li>
    </ol>
  </body>
</html>
```

### 마이크로데이터

다음은 여러 탐색경로 트레일을 지원하는 마이크로데이터의 예입니다.

  

```
<html>
  <head>
    <title>Award Winners</title>
  </head>
  <body>
    <ol itemscope itemtype="https://schema.org/BreadcrumbList">
      <li itemprop="itemListElement" itemscope
          itemtype="https://schema.org/ListItem">
        <a itemprop="item" href="https://example.com/books">
            <span itemprop="name">Books</span></a>
        <meta itemprop="position" content="1" />
      </li>
      ›
      <li itemprop="itemListElement" itemscope
          itemtype="https://schema.org/ListItem">
        <a itemscope itemtype="https://schema.org/WebPage"
           itemprop="item" itemid="https://example.com/books/sciencefiction"
           href="https://example.com/books/sciencefiction">
          <span itemprop="name">Science Fiction</span></a>
        <meta itemprop="position" content="2" />
      </li>
      ›
      <li itemprop="itemListElement" itemscope
          itemtype="https://schema.org/ListItem">
        <a itemprop="item" href="https://example.com/books/sciencefiction/awardwinners">
          <span itemprop="name">Award Winners</span></a>
        <meta itemprop="position" content="3" />
      </li>
    </ol>
    <ol itemscope itemtype="https://schema.org/BreadcrumbList">
      <li itemprop="itemListElement" itemscope
          itemtype="https://schema.org/ListItem">
        <a itemprop="item" href="https://example.com/literature">
          <span itemprop="name">Literature</span></a>
        <meta itemprop="position" content="1" />
      </li>
      ›
      <li itemprop="itemListElement" itemscope
          itemtype="https://schema.org/ListItem">
        <span itemprop="name">Award Winners</span>
        <meta itemprop="position" content="2" />
      </li>
    </ol>
  </body>
</html>
```

### HTML

다음은 시각적 디자인의 일부로 페이지 내에 있는 HTML 탐색경로 블록의 예입니다.

```
<html>
  <head>
    <title>Award Winners</title>
  </head>
  <body>
    <ol>
      <li>
        <a href="https://www.example.com/books">Books</a>
      </li>
      <li>
        <a href="https://www.example.com/books/sciencefiction">Science Fiction</a>
      </li>
      <li>
        Award Winners
      </li>
    </ol>
    <ol>
      <li>
        <a href="https://www.example.com/literature">Literature</a>
      </li>
      <li>
        Award Winners
      </li>
    </ol>
  </body>
</html>
```

## 가이드라인

Google 검색에 탐색경로를 표시하려면 다음 가이드라인을 따라야 합니다.

**경고:** 페이지의 일부 마크업이 구조화된 데이터 가이드라인을 벗어난 기술을 사용하는 것으로 감지되면 Google에서 사이트에 [직접 조치](https://support.google.com/webmasters/answer/2604824?hl=ko)를 취할 수 있습니다.

* [검색 Essentials](https://developers.google.com/search/docs/essentials?hl=ko)
* [구조화된 데이터 일반 가이드라인](https://developers.google.com/search/docs/appearance/structured-data/sd-policies?hl=ko)

URL 구조를 미러링하는 대신 페이지의 일반적인 사용자 경로를 나타내는 탐색경로를 제공하는 것이 좋습니다. 최상위 경로(사이트의 도메인 또는 호스트 이름)나 페이지 자체에는 탐색경로 `ListItem`를 포함할 필요가 없습니다.

## 구조화된 데이터 유형 정의

탐색경로를 지정하려면 두 개 이상의 `ListItems`가 포함된 `BreadcrumbList`를 정의해야 합니다. 탐색경로로 콘텐츠를 표시하려면 필수 속성이 있어야 합니다.

Google 리치 결과 기능에 data-vocabulary.org 마크업을 사용할 수 없습니다. [data-vocabulary 지원 종료](https://developers.google.com/search/blog/2020/01/data-vocabulary?hl=ko)에 관해 자세히 알아보세요.

### `BreadcrumbList`

`BreadcrumbList`는 목록의 모든 요소를 포함하는 컨테이너 항목입니다. `BreadcrumbList`의 전체 정의는 [schema.org/BreadcrumbList](https://schema.org/BreadcrumbList)에서 확인할 수 있습니다.
Google에서 지원하는 속성은 다음과 같습니다.

| 필수 속성 | |
| --- | --- |
| `itemListElement` | `ListItem`  특정 순서로 나열된 탐색경로 배열입니다. 각 탐색경로를 [`ListItem`](#list-item)으로 지정합니다. 예를 들면 다음과 같습니다.     ``` { "@context": "https://schema.org", "@type": "BreadcrumbList",   "itemListElement": [{     "@type": "ListItem",     "position": 1,     "name": "Books",     "item": "https://example.com/books"   },{     "@type": "ListItem",     "position": 2,     "name": "Authors",     "item": "https://example.com/books/authors"   },{     "@type": "ListItem",     "position": 3,     "name": "Ann Leckie",     "item": "https://example.com/books/authors/annleckie"   }] } ``` |

### `ListItem`

`ListItem`에는 목록의 개별 항목에 관한 세부정보가 있습니다. `ListItem`의 전체 정의는 [schema.org/ListItem](https://schema.org/ListItem)에서 확인할 수 있습니다.
Google에서 지원하는 속성은 다음과 같습니다.

| 필수 속성 | |
| --- | --- |
| `item` | `URL` 또는 `Thing`의 하위유형  탐색경로를 나타내는 웹페이지 URL입니다. `item`을 지정하는 두 가지 방법은 다음과 같습니다.   * `URL`: 페이지의 URL을 지정합니다. 예를 들면 다음과 같습니다.      ```   "item": "https://example.com/books"   ``` * `Thing`: ID를 사용하여 사용 중인 마크업 형식을 기준으로 URL을 지정합니다.   + **JSON-LD**: `@id`를 사용하여 URL을 지정합니다.   + **마이크로데이터**: `href` 또는 `itemid`를 사용하여 URL을 지정할 수 있습니다.   + **RDFa**: `about`, `href` 또는 `resource`를 사용하여 URL을 지정할 수 있습니다.   탐색경로가 탐색경로 트레일의 마지막 항목인 경우 `item`은 필수가 아닙니다. `item`이 마지막 항목에 포함되어 있지 않으면 Google은 포함된 페이지의 URL을 사용합니다. |
| `name` | `Text`  사용자에게 표시되는 탐색경로의 제목입니다. `URL` 대신 `name`이 포함된 `Thing`을 사용하여 `item`을 지정하는 경우 `name`은 필수가 아닙니다. |
| `position` | `Integer`  탐색경로 트레일에서 탐색경로의 위치입니다. 위치 1은 트레일의 시작을 나타냅니다. |

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
