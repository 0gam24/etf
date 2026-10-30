# 구조화된 데이터 일반 가이드라인

> **출처(Source):** https://developers.google.com/search/docs/appearance/structured-data/sd-policies?hl=ko
> **저작자(Attribution):** Google
> **라이선스(License):** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
> 이 문서는 Google 검색 센터 문서를 Markdown으로 변환한 사본입니다.
> 원문의 최신 내용은 위 출처 링크를 확인하세요.

---

# 구조화된 데이터 일반 가이드라인

구조화된 데이터가 Google 검색결과에 리치 결과로 표시되도록 하려면 구조화된 데이터가 [Google 검색의 콘텐츠 정책](https://support.google.com/websearch/answer/10622781?hl=ko)(Google [스팸 정책](https://developers.google.com/search/docs/essentials/spam-policies?hl=ko) 포함)을 위반해서는 안 됩니다.
또한 이 페이지에는 모든 구조화된 데이터에 적용되는 일반 가이드라인이 자세히 설명되어 있습니다. Google 검색에 리치 결과로 표시되려면 반드시 일반 가이드라인을 준수해야 합니다.

페이지에 [구조화된 데이터 문제](https://support.google.com/webmasters/answer/9044175?hl=ko#spammy-structured-markup)가 있는 경우 직접 조치가 적용될 수 있습니다. 구조화된 데이터 직접 조치가 적용되면 페이지가 리치 결과로 표시될 자격을 잃게 됩니다. 그러나 Google 웹 검색에서 페이지의 순위가 지정되는 데는 영향을 주지 않습니다.
직접 조치가 있는지 확인하려면 [Search Console의 직접 조치 보고서](https://search.google.com/search-console/manual-actions?hl=ko)를 여세요.

**중요: Google에서는 구조화된 데이터가 검색결과에 표시된다고 보장하지 않습니다.** 페이지가 [리치 결과 테스트](https://search.google.com/test/rich-results?hl=ko)에 따라 올바르게 마크업된 경우에도 마찬가지입니다.
다음은 이러한 상황의 일반적인 원인입니다.

* 구조화된 데이터를 사용하면 기능이 표시되도록 *사용 설정*할 수 있지만
  기능이 표시된다고 *보장*되지는 않습니다. Google 알고리즘은
  검색 기록, 위치, 기기 유형 등 다양한 변수에 따라 검색결과를
  맞춤설정하여 사용자에게 가장 적합한 검색 환경이라고 판단되는 항목을
  만듭니다. 때에 따라 어떤 기능보다 다른 기능이 적합하다고 판단하거나 [텍스트 검색결과](https://developers.google.com/search/docs/appearance/visual-elements-gallery?hl=ko#text-result)가 가장 적합하다고 판단하기도 합니다.
* 구조화된 데이터가 [페이지의 주요 콘텐츠](#relevance)를 나타내지 않거나 혼동을 야기할 수 있습니다.
* 구조화된 데이터가 리치 결과 테스트에서 포착할 수 없는 방식으로 잘못되었습니다.
* 구조화된 데이터가 참조하는 콘텐츠가 [사용자에게 표시되지 않습니다](#hidden).
* 페이지가 이 페이지에 설명된 구조화된 데이터 가이드라인, 구조화된 데이터 기능별 가이드라인, [Search Essentials](https://developers.google.com/search/docs/essentials?hl=ko), [Google 검색 콘텐츠 정책](https://support.google.com/websearch/answer/10622781?hl=ko)을 충족하지 않습니다.

## 기술 가이드라인

[리치 결과 테스트](https://search.google.com/test/rich-results?hl=ko) 및 [URL 검사 도구](https://support.google.com/webmasters/answer/9012289?hl=ko)를 사용하여 기술 가이드라인 준수 여부를 테스트하세요. 테스트하면 대부분의 기술 오류를 확인할 수 있습니다.

### 형식

리치 결과를 사용하려면 [세 가지 지원되는 형식](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data?hl=ko#structured-data-format) 중 하나를 사용하여
사이트의 페이지를 마크업합니다.

* JSON-LD(권장)
* 마이크로데이터
* RDFa

### 액세스

robots.txt, [`noindex`](https://developers.google.com/search/docs/crawling-indexing/block-indexing?hl=ko), 기타 액세스 제어 방법을 사용해 Googlebot이 구조화된 데이터 페이지에 액세스할 수 없도록 차단하지 마세요.

## 품질 가이드라인

품질 가이드라인은 자동화된 도구를 사용하여 간편하게 테스트할 수 없습니다.
품질 가이드라인을 위반하면 구조화된 데이터의 구문이 올바르다 할지라도
Google 검색에 리치 결과로 표시되지 않거나
[스팸으로 표시](https://support.google.com/webmasters/answer/3498001?hl=ko)될 수 있습니다.

### 콘텐츠

* [Google 웹 검색의 스팸 정책](https://developers.google.com/search/docs/essentials/spam-policies?hl=ko)을 준수합니다.
* 최신 정보를 제공합니다. 더 이상 관련성이 없어 시기성이 떨어지는 콘텐츠의
  리치 결과는 표시하지 않습니다.
* 본인 및 사용자가 생성한 원본 콘텐츠를 제공합니다.
* 페이지 독자에게 표시되지 않는 콘텐츠를 마크업하지 **않습니다**. 예를 들어 JSON-LD 마크업이
  실행자를 나타내는 경우 HTML 본문에서도 동일한 실행자를 나타내야 합니다.
* 페이지의 주제와 동떨어진 가짜 리뷰 또는 콘텐츠와 같이 관련성이 없거나
  오해의 소지가 있는 콘텐츠를 마크업하지 **않습니다**.
* 구조화된 데이터를 사용하여 사용자를 속이거나 혼란스럽게 만들지 **않습니다**. 사람이나 조직을 사칭하거나 소유권, 제휴, 기본 목적을 왜곡하지 않습니다.
* 구조화된 데이터의 콘텐츠는 특정 기능 가이드에 설명된 대로 추가 콘텐츠 가이드라인이나 정책도 준수해야 합니다. 예를 들어 구조화된 `JobPosting` 데이터의 콘텐츠는 [채용 정보 콘텐츠 정책](https://developers.google.com/search/docs/appearance/structured-data/job-posting?hl=ko#content-policies)을 준수해야 합니다.

### 관련성

구조화된 데이터가 페이지 콘텐츠를 실제로 표현해야 합니다. 다음은 관련 없는 데이터의 몇 가지 예입니다.

* 방송을 지역 이벤트로 지정하는 스포츠 실시간 스트리밍 사이트
* 안내를 레시피로 지정하는 목공예 사이트

### 완전성

* [특정 리치 결과 유형 문서](https://developers.google.com/search/docs/appearance/structured-data/search-gallery?hl=ko)에 나와 있는 모든 필수 속성을 지정합니다. 필수 속성이 누락된 항목은 리치 결과로 표시되지 않습니다.
* 권장 속성을 많이 제공할수록 사용자에게 표시되는 검색결과의 품질이 개선됩니다. 예를 들어 사용자는 급여가 표시되지 않은 취업정보보다 급여가 명시적으로 표시된 취업정보를 선호합니다. 또한 실제 사용자 리뷰 및 진정성 있는 별표 평점이 있는 레시피를 선호합니다(실제 사용자가 제공하지 않은 리뷰나 평점이 있는 경우 [직접 조치](https://support.google.com/webmasters/answer/3498001?hl=ko)의 대상이 될 수 있음). 리치 결과 순위를 결정할 때는 추가 정보가 고려됩니다.

### 위치

* 문서에서 다르게 지정하지 않는 한 구조화된 데이터가 설명하는 페이지에
  구조화된 데이터를 넣으세요.
* 동일한 콘텐츠에 관한 중복 페이지가 있는 경우 표준 페이지뿐 아니라 모든 중복 페이지에
  동일한 구조화된 데이터를 배치하는 것이 좋습니다.

### 특수성

* 마크업에 schema.org에서 정의된 가장 구체적이고 적절한 유형 및 속성 이름을
  사용해 보세요.
* [특정 리치 결과 유형 문서](https://developers.google.com/search/docs/guides/search-gallery?hl=ko)에 포함된
  모든 추가 가이드라인을 따르세요.

### 이미지

* 이미지를 구조화된 데이터 속성으로 지정하는 경우 이미지와 이미지가 있는 페이지가 관련이 있는지 확인하세요. 예를 들어 `NewsArticle`의 `image` 속성을 정의하면 이미지가 관련 뉴스 기사와 관련이 있어야 합니다.
* 구조화된 데이터에 지정된 모든 이미지 URL은 크롤링 및 색인 생성이 가능해야 합니다. 그렇지 않으면 Google 검색에서 이미지 URL을 찾아 검색결과 페이지에 표시할 수 없습니다. Google에서 내 URL에 액세스할 수 있는지 확인하려면 [URL 검사 도구](https://support.google.com/webmasters/answer/9012289?hl=ko)를 사용하세요.

### 여러 항목이 있는 페이지

여러 항목이 있는 페이지는 한 페이지에 두 가지 이상의 항목이 있다는 의미입니다. 예를 들어 한 페이지에 레시피, 레시피를 만드는 방법을 보여주는 동영상, 사용자가 레시피를 찾을 방법을 알려주는 탐색경로 정보가 포함되어 있을 수 있습니다. 사용자에게 표시되는 이 모든 정보는 구조화된 데이터로 마크업될 수도 있으므로 Google 검색과 같은 검색엔진에서 페이지의 정보를 더 쉽게 파악하게 됩니다. 페이지에 적용되는 항목을 더 추가하면 Google 검색에서는 페이지의 정보를 더 잘 파악하여 다양한 검색 기능으로 페이지를 표시할 수 있습니다.

![동영상과 리뷰가 모두 표시되는 레시피 리치 결과](https://developers.google.com/static/search/docs/images/multiple-items-rich-result.png?hl=ko)

Google 검색에서는 항목을 중첩하든 각 항목을 개별적으로 지정하든 상관없이 페이지의 여러 항목을 파악합니다.

* **중첩**: 한 가지 기본 항목이 있고 기본 항목 아래 추가 항목이 그룹화되어 있습니다. 관련 항목을 그룹화(예: 동영상과 리뷰가 있는 레시피)할 때 특히 유용합니다.
* **개별 항목**: 각 항목이 동일한 페이지에서 별도의 블록으로 구성되어 있습니다.
  함께 연결해주면 더 유용한 항목(예: 레시피와 동영상)이 있다면 레시피와 동영상 항목 둘 다에서 `@id`를 사용해 페이지에 있는 레시피를 다루는 동영상이라고 명시합니다. 항목을 함께 연결하지 않으면 Google 검색에서 동영상을 레시피 리치 결과로 표시할 수 있는지 파악하기 어렵습니다.

이 예는 간략한 표시를 위해 수정되었으며 기능을 위한 필수 및 권장 속성이 일부만 포함됩니다. 전체 예는 [구조화된 특정 데이터 유형 문서](https://developers.google.com/search/docs/guides/search-gallery?hl=ko)를 참고하세요.

### 중첩

다음은 구조화된 중첩 데이터의 예입니다. 여기서 `Recipe`는 기본 항목이고 `aggregateRating` 및 `video`는 `Recipe`에 중첩되어 있습니다.

```
<html>
  <head>
    <title>How To Make Banana Bread</title>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org/",
      "@type": "Recipe",
      "name": "Banana Bread Recipe",
      "description": "The best banana bread recipe you'll ever find! Learn how to use up all those extra bananas.",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": 4.7,
        "ratingCount": 123
      },
      "video": {
        "@type": "VideoObject",
        "name": "How To Make Banana Bread",
        "description": "This is how you make banana bread, in 5 easy steps.",
        "contentUrl": "https://www.example.com/video123.mp4"
       }
    }
    </script>
  </head>
  <body>
  </body>
</html>
```

### 개별 항목

다음은 구조화된 데이터의 개별 항목 예입니다. `Recipe` 및 `BreadcrumbList`라는 별개의 두 항목이 있습니다.

```
<html>
  <head>
    <title>How To Make Banana Bread</title>
    <script type="application/ld+json">
    [{
      "@context": "https://schema.org/",
      "@type": "Recipe",
      "name": "Banana Bread Recipe",
      "description": "The best banana bread recipe you'll ever find! Learn how to use up all those extra bananas."
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [{
        "@type": "ListItem",
        "position": 1,
        "name": "Recipes",
        "item": "https://example.com/recipes"
      },{
        "@type": "ListItem",
        "position": 2,
        "name": "Bread recipes",
        "item": "https://example.com/recipes/bread-recipes"
      },{
        "@type": "ListItem",
        "position": 3,
        "name": "How To Make Banana Bread"
      }]
    }]
    </script>
  </head>
  <body>
  </body>
</html>
```

#### 추가 도움말

* Google 검색에서 페이지의 주요 목적이 무엇인지 파악하도록 하려면 페이지에서 주로 다루는 내용을 반영하는 구조화된 데이터의 기본 유형을 포함하세요. 예를 들어 페이지에서 주로 레시피를 다룬다면 구조화된 [동영상](https://developers.google.com/search/docs/appearance/structured-data/video?hl=ko) 및 [리뷰](https://developers.google.com/search/docs/appearance/structured-data/review-snippet?hl=ko) 데이터와 더불어 [구조화된 레시피 데이터](https://developers.google.com/search/docs/appearance/structured-data/recipe?hl=ko)를 포함해야 합니다. 이렇게 하면 페이지가 여러 검색 노출(레시피 리치 결과, 동영상 검색, 리뷰 스니펫 등)의 대상이 될 수 있습니다. 페이지에 구조화된 동영상 데이터만 포함되어 있으면 Google 검색에서 페이지를 레시피 리치 결과로도 표시할 수 있다고 판단할 만큼 충분한 페이지 정보를 파악하지 못합니다.
* 페이지가 사용자에게 표시되는 콘텐츠를 완전히 나타내도록 하려면 모든 구조화된 데이터 항목이 완전해야 합니다. 예를 들어 리뷰를 여러 개 포함한다면 페이지에서 사용자에게 표시되는 리뷰를 모두 포함해야 합니다. 페이지에서 페이지의 일부 리뷰를 마크업하지 않으면 Google 검색결과에서 페이지 노출에 기반하여 리뷰가 모두 표시되리라 예상한 사용자에게 혼란을 줄 수 있습니다.
