# 구조화된 사실확인(ClaimReview) 데이터

> **출처(Source):** https://developers.google.com/search/docs/appearance/structured-data/factcheck?hl=ko
> **저작자(Attribution):** Google
> **라이선스(License):** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
> 이 문서는 Google 검색 센터 문서를 Markdown으로 변환한 사본입니다.
> 원문의 최신 내용은 위 출처 링크를 확인하세요.

---

# 구조화된 사실확인(`ClaimReview`) 데이터

Google 검색에서 `ClaimReview` 마크업에 대한 지원이 단계적으로 중단됩니다. 하지만 이 마크업은 사실확인 탐색기 도구에서 계속 지원됩니다.

웹페이지에 다른 사람이 제기한 주장을 검토하는 내용이 포함되어 있다면 웹페이지에 구조화된 `ClaimReview` 데이터를 포함할 수 있습니다. 구조화된 `ClaimReview` 데이터를 포함하면 주장에 관한 Google 검색결과에 내 페이지가 표시될 때 사실확인을 요약한 내용이 함께 나타납니다.

이 가이드에서는 구조화된 `ClaimReview` 데이터를 구현하는 방법을 자세히 알아봅니다.
구조화된 데이터를 직접 추가하고 싶지 않다면 [사실확인 마크업 도구](https://toolbox.google.com/factcheck/markuptool?hl=ko)를 확인해 보세요. 자세한 내용은 [사실확인 마크업 도구 정보](https://toolbox.google.com/factcheck/about?hl=ko#fcmt)를 참고하시기 바랍니다.

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

'지구는 평평하다'는 주장을 평가하는 페이지가 있다고 가정해 보겠습니다. 페이지에 `ClaimReview` 요소가 포함되어 있다면 Google 검색에서 '지구는 평평하다'라고 검색했을 때 다음과 같은 결과가 표시될 수 있습니다. 실제 디자인은 다를 수 있습니다.

![페이지에 연결된 하나의 주장 검토](https://developers.google.com/static/search/docs/images/factcheck-example-result.png?hl=ko)

**참고**: 실제로 검색결과에 표시되는 모습은 다를 수 있습니다. [리치 결과 테스트](https://support.google.com/webmasters/answer/7445569?hl=ko)를 사용하면 대부분의 기능을 미리 볼 수 있습니다.

다음은 이 사실확인을 호스팅하는 페이지에 표시되는 구조화된 데이터의 예입니다.

  

```
<html>
  <head>
    <title>The world is flat</title>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "ClaimReview",
      "url": "https://example.com/news/science/worldisflat.html",
      "claimReviewed": "The world is flat",
      "itemReviewed": {
        "@type": "Claim",
        "author": {
          "@type": "Organization",
          "name": "Square World Society",
          "sameAs": "https://example.flatworlders.com/we-know-that-the-world-is-flat"
        },
        "datePublished": "2024-06-20",
        "appearance": {
          "@type": "OpinionNewsArticle",
          "url": "https://example.com/news/a122121",
          "headline": "Square Earth - Flat earthers for the Internet age",
          "datePublished": "2024-06-22",
          "author": {
            "@type": "Person",
            "name": "T. Tellar"
          },
          "image": "https://example.com/photos/1x1/photo.jpg",
          "publisher": {
            "@type": "Organization",
            "name": "Skeptical News",
            "logo": {
              "@type": "ImageObject",
              "url": "https://example.com/logo.jpg"
            }
          }
        }
      },
      "author": {
        "@type": "Organization",
        "name": "Example.com science watch"
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": 1,
        "bestRating": 5,
        "worstRating": 1,
        "alternateName": "False"
      }
    }
    </script>
  </head>
  <body>
  </body>
</html>
```

## 자격요건 가이드라인

Google에서는 [리치 결과 테스트](https://search.google.com/test/rich-results?hl=ko)에 따라 페이지가 올바르게 마크업된 경우에도 사실확인이 검색결과에 표시된다고 보장하지 않습니다. 구조화된 데이터를 사용하면 기능이 표시되도록 *사용 설정*할 수 있지만 기능이 표시된다고 *보장*하지는 않습니다. Google 알고리즘은 프로그래매틱 방식으로 다음 가이드라인을 포함한 많은 변수에 따라 사실확인 리치 결과의 자격요건을 판단합니다.

사실확인 콘텐츠를 Google 검색에 사실확인 리치 결과로 표시하려면 다음 가이드라인을 충족해야 합니다.

* 사이트에 구조화된 `ClaimReview` 데이터로 표시된 페이지가 여러 개 있어야 합니다.
* 모든 [구조화된 데이터 가이드라인](https://developers.google.com/search/docs/appearance/structured-data/sd-policies?hl=ko)과 [검색 Essentials](https://developers.google.com/search/docs/essentials?hl=ko)를 따라야 합니다.
* 구조화된 데이터와 페이지 콘텐츠 사이에는 불일치가 없어야 합니다. 예를 들어, 구조화된 데이터에서 주장이 참이라고 표시되어 있는데 페이지의 콘텐츠에는 주장이 거짓이라고 표시되어 있어서는 안 됩니다. 콘텐츠와 구조화된 데이터가 모두 일치하는지 확인하세요. 예를 들어, 두 가지 모두에 주장이 참이라고 표시되어 있어야 합니다.
* [Google 뉴스 일반 가이드라인](https://support.google.com/news/publisher-center/answer/6204050?hl=ko)에 명시된 책임성, 투명성, 가독성 및 사이트 허위 진술 표준을 충족해야 합니다.
* 수정 정책이나 사용자가 오류를 신고할 수 있는 메커니즘이 있어야 합니다.
* 정치적 독립체(예: 캠페인, 정당, 선출직 공무원)의 웹사이트는 이 기능을 사용할 수 없습니다.
* 독자가 기사 본문에서 주장 및 확인 내용을 쉽게 파악할 수 있어야 합니다. 어떤 사실이 확인되었는지, 결론은 무엇인지 독자가 알 수 있어야 합니다.
* 평가 대상인 특정 주장을 내 웹사이트와 구별된 다른 웹사이트, 공개 보고서, 소셜 미디어 또는 기타 추적 가능한 소스 등의 명확한 출처로 명시해야 합니다.
* 사실확인 분석은 기본 소스의 인용 및 참조를 포함하여 소스 및 방법이 추적 가능하고 투명해야 합니다.

### 기술 가이드라인

* 단일 사실확인 리치 결과를 사용하려면 페이지에 `ClaimReview` 요소가 하나만 있어야 합니다. 한 페이지당 여러 개의 `ClaimReview` 요소를 추가하면 페이지에서 단일 사실확인 리치 결과를 사용할 수 없습니다.
* `ClaimReview` 요소를 호스팅하는 페이지에는 사실확인과 평가에 관한 전체 텍스트 또는 적어도 간단한 요약이 포함되어야 합니다.
* 특정 `ClaimReview`는 사이트의 한 페이지에만 있어야 합니다. 같은 페이지의 다양한 버전이 아니라면(예: 페이지의 모바일 버전과 데스크톱 버전에 같은 `ClaimReview`를 호스팅할 수 있음) 여러 페이지에 같은 사실확인을 반복해서 삽입하지 마세요.
* 웹사이트에서 사실확인 기사를 집계하는 경우 모든 기사가 [기준](#guidelines)을 충족하고 집계하는 모든 사실확인 웹사이트의 목록을 누구나 볼 수 있도록 공개해야 합니다.

## 구조화된 데이터 유형 정의

사실확인을 구현하려면 다음의 구조화된 데이터 유형이 필요합니다.

* `ClaimReview`
* `Claim`
* `Rating`

리치 결과에 콘텐츠를 표시하려면 필수 속성이 있어야 합니다.
권장 속성을 통해 콘텐츠에 관한 정보를 추가하여 더 만족스러운 사용자 환경을 제공할 수 있습니다.

### `ClaimReview`

`ClaimReview`의 전체 정의는 [schema.org/ClaimReview](https://schema.org/ClaimReview)에서 확인하세요.
Google에서 지원하는 속성은 다음과 같습니다.

| 필수 속성 | |
| --- | --- |
| `claimReviewed` | `Text`  평가된 주장의 간단한 요약입니다. 75자 이내(영문기준)로 작성하여 휴대기기에서 표시될 때 줄 바꿈을 최소화하세요. `claimReviewed` 필드에 평점을 포함하지 마세요. 대신 `reviewRating` 필드에 평점을 지정해야 합니다. |
| `reviewRating` | `Rating`  주장에 관한 평가입니다. 숫자와 텍스트 평가를 모두 지원합니다. 현재 검색결과에는 텍스트 값만 표시됩니다.  다양한 사실확인 프로젝트의 경우 특히 중간값에 미묘한 차이가 존재할 수 있는 여러 가지 평가 방식이 사용됩니다. 이러한 평가 방식을 문서화하여 수치로 된 평가가 갖는 의미를 명확히 하는 것이 중요합니다. 적어도 수치화된 점수를 나타낼 수 있도록 모든 사실확인의 텍스트 평가 시스템은 숫자로 되어 있어야 합니다.   * 1 = '거짓' * 2 = '대부분 거짓' * 3 = '절반 정도 참' * 4 = '대부분 참' * 5 = '참'   자세한 내용은 [Rating](#rating)을 참조하세요. |
| `url` | `URL`  전체 사실확인 기사를 호스팅하는 페이지의 링크입니다.  이 URL 값의 도메인은 이 `ClaimReview` 요소를 호스팅하는 페이지와 동일한 도메인이나 하위 도메인이어야 합니다. 리디렉션 또는 단축 URL(g.co/searchconsole 등)은 처리되지 않으므로 여기에서 작동하지 않습니다. |

| 권장 속성 | |
| --- | --- |
| `author` | `Organization` 또는 `Person`  주장의 게시자가 아닌 사실확인 기사의 게시자입니다. `author`는 조직 또는 개인이어야 합니다. `author`에는 다음 중 하나 이상의 속성이 포함됩니다.   |  |  | | --- | --- | | `name` | `Text` 사실확인을 게시하는 조직의 이름입니다. | | `url` | `URL`  사실확인 게시자의 URL입니다. 홈페이지, 연락처 페이지 또는 기타 적절한 페이지로 설정할 수 있습니다. |   Google에서 다양한 기능을 갖춘 작성자를 가장 잘 이해할 수 있도록 [작성자 마크업 권장사항](https://developers.google.com/search/docs/appearance/structured-data/article?hl=ko#author-bp)을 따르는 것이 좋습니다. |
| `itemReviewed` | `Claim`  제기된 주장을 설명하는 객체입니다. 자세한 내용은 [`Claim`](#claim)을 참조하시기 바랍니다. **하위 호환성**: 사실확인이 처음 출시되었을 때 Google 검색에서는 `itemReviewed`로 `CreativeWork`를 권장했습니다. Google 검색은 이전 마크업 패턴을 계속 지원합니다. 다음은 기존 마크업 스타일을 보여 주는 예입니다. |

### `Claim`

`Claim`의 전체 정의는 [schema.org/Claim](https://schema.org/Claim)에서 확인하세요.

| 권장 속성 | |
| --- | --- |
| `appearance` | `URL` 또는 `CreativeWork`  주장이 표시되는 `CreativeWork`의 링크 또는 인라인 설명입니다.  `appearance` 또는 `firstAppearance`를 추가하는 것이 좋습니다. 둘 다 추가할 필요는 없습니다. |
| `author` | `Organization` 또는 `Person`  사실확인의 작성자가 아닌 주장의 작성자입니다. 작성자가 없는 주장에는 `author` 속성을 포함하지 마세요. `author`를 추가할 경우 다음 속성을 정의하세요.   |  |  | | --- | --- | | `name` | `Text`, 필수 주장의 게시자로, 사람 또는 조직입니다. | | `sameAs` | `URL`, 권장 `Person`인지 `Organization`인지 여부와 무관하게 주장을 하는 당사자를 나타냅니다. 여러 게시자가 동일한 주장을 보고할 경우 `appearance` 속성이 반복될 수 있습니다. 여러 당사자가 근본적으로 동일한 주장을 할 경우 `author` 속성이 반복될 수 있습니다.  다음과 같은 URL이 해당할 수 있습니다.   * 주장을 제기하는 조직의 홈페이지 URL * 사람 또는 조직의 위키백과 또는 위키백과 항목과 같이 주장하는 당사자에 관한 정보가 제공되는 명확한 URL | |
| `datePublished` | `DateTime` 또는 `Date`  주장이 제기되거나 공론에 부쳐진 날짜입니다(예: 사회 연결망에서 유명해진 시기). |
| `firstAppearance` | `URL` 또는 `CreativeWork`  구체적인 주장이 처음 등장한 `CreativeWork`의 링크 또는 인라인 설명입니다.  `appearance` 또는 `firstAppearance`를 추가하는 것이 좋습니다. 둘 다 추가할 필요는 없습니다. |

### `Rating`

`Rating`의 전체 정의는 [schema.org/Rating](https://schema.org/Rating)에서 확인하세요.

| 필수 속성 | |
| --- | --- |
| `alternateName` | `Text`  사람이 읽을 수 있는 짧은 단어나 문구로 `ClaimReview.reviewRating`에 할당된 신뢰성 평가입니다. 이 값은 검색결과의 사실확인에 표시됩니다. **예:** '참' 또는 '대부분 참'  문장이 길어지면 디스플레이에 맞추기 위해 문장이 잘리는 경우에 대비해 문장 시작 부분에 의미 있는 내용이 있어야 합니다. 예: '세부사항은 대부분 참이나, 전체 주장은 다소 오해의 소지가 있음.' |

| 권장 속성 | |
| --- | --- |
| `bestRating` | `Number`  평가 점수에서 최저점부터 최고점까지의 범위 내에서 최고점입니다. `worstRating`보다 커야 합니다. 숫자로 평가할 수 있어야 합니다. **예**: 4 |
| `name` | `Text`  `alternateName`과 동일하며 `alternateName`이 제공되지 않았을 때 사용되지만 `name` 대신 `alternateName`을 지정하는 것이 좋습니다. |
| `ratingValue` | `Number`  주장을 평가한 점수로, 범위는 `worstRating` 이상 `bestRating` 이하입니다. 정수 값이 권장되지만 필수는 아닙니다. 평가 점수가 `bestRating`에 가까울수록 사실에 가까우며 이 값이 `worstRating`에 가까울수록 거짓에 가깝습니다. 평가 점수는 숫자로 평가할 수 있어야 합니다. **예**: 4 |
| `worstRating` | `Number`  평가 점수에서 최저점부터 최고점까지의 범위 내에서 최저점입니다. `bestRating`보다 작아야 합니다. 숫자로 평가할 수 있어야 합니다. 최소값은 1이어야 합니다. **예**: 1 |

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
