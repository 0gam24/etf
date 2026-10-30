# 구조화된 구독 및 페이월 콘텐츠(CreativeWork) 데이터

> **출처(Source):** https://developers.google.com/search/docs/appearance/structured-data/paywalled-content?hl=ko
> **저작자(Attribution):** Google
> **라이선스(License):** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
> 이 문서는 Google 검색 센터 문서를 Markdown으로 변환한 사본입니다.
> 원문의 최신 내용은 위 출처 링크를 확인하세요.

---

# 구조화된 구독 및 페이월 콘텐츠(`CreativeWork`) 데이터

이 페이지에서는 schema.org JSON-LD를 사용하여 [`CreativeWork`](https://schema.org/CreativeWork) 속성으로 사이트에 페이월 콘텐츠를 표시하는 방법을 설명합니다. 이 구조화된 데이터는 Google에서 [스팸 정책](https://developers.google.com/search/docs/essentials/spam-policies?hl=ko)을 위반하는 [클로킹](https://developers.google.com/search/docs/essentials/spam-policies?hl=ko#cloaking) 행위와 페이월 콘텐츠를 구분하는 데 도움이 됩니다.
[구독 및 페이월 콘텐츠](https://developers.google.com/search/docs/appearance/flexible-sampling?hl=ko)에 관해 자세히 알아보세요.

이 가이드는 크롤링 및 색인을 생성하려는 콘텐츠에만 적용됩니다. 페이월 콘텐츠의 색인을 생성하지 않으려면 여기까지만 읽으셔도 됩니다.

## 예

다음은 페이월 콘텐츠가 포함된 구조화된 `NewsArticle` 데이터의 예입니다.

```
<html>
  <head>
    <title>Article headline</title>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": "Article headline",
      "image": "https://example.org/thumbnail1.jpg",
      "datePublished": "2025-02-05T08:00:00+08:00",
      "dateModified": "2025-02-05T09:20:00+08:00",
      "author": {
        "@type": "Person",
        "name": "John Doe",
        "url": "https://example.com/profile/johndoe123"
      },
      "description": "A most wonderful article",
      "isAccessibleForFree": false,
      "hasPart":
        {
        "@type": "WebPageElement",
        "isAccessibleForFree": false,
        "cssSelector" : ".paywall"
        }
    }
    </script>
  </head>
  <body>
    <div class="non-paywall">
      Non-Paywalled Content
    </div>
    <div class="paywall">
      Paywalled Content
    </div>
  </body>
</html>
```

## 가이드라인

페이지가 검색결과에 표시되게 하려면 [구조화된 데이터 일반 가이드라인](https://developers.google.com/search/docs/appearance/structured-data/sd-policies?hl=ko) 및 [기술 가이드라인](https://developers.google.com/search/docs/appearance/structured-data/sd-policies?hl=ko#technical-guidelines)을 따라야 합니다. 페이월 콘텐츠에는 다음의 가이드라인도 적용됩니다.

**참고**: 이 정책을 위반하면 페이지가 검색결과에 표시되지 않을 수 있습니다. [구조화된 스팸성 마크업](https://support.google.com/webmasters/answer/3498001?hl=ko)에 관한 자세한 내용을 읽어 보세요.

* JSON-LD 및 마이크로데이터 형식은 페이월 콘텐츠의 구조화된 데이터를 지정하는 방법으로 허용됩니다.
* 콘텐츠 섹션을 중첩하지 마세요.
* `cssSelector` 속성에는 `.class` 선택기만 사용하세요.
* 콘텐츠가 게재되는 시점에 브라우저에서 콘텐츠에 액세스할 수 없도록 하려면 브라우저에 페이월 콘텐츠를 제공하지 않는 페이월 구현을 선택하세요. 클라이언트 측 JavaScript 솔루션을 사용하는 경우 [JavaScript를 사용하여 페이월 콘텐츠를 구현하는 방법에 관한 안내](https://developers.google.com/search/docs/crawling-indexing/javascript/fix-search-javascript?hl=ko#paywall)를 확인하세요.

## 페이월 콘텐츠에 마크업 추가

[웹사이트를 구독해야만 액세스](https://developers.google.com/search/docs/appearance/flexible-sampling?hl=ko)할 수 있는 콘텐츠를 제공하고 있거나 색인을 생성하려는 콘텐츠에 액세스하려면 사용자가 사이트에 등록해야 하는 경우 다음 단계를 따르세요. 다음의 예는 구조화된 `NewsArticle` 데이터에 적용됩니다. AMP 페이지 및 AMP가 아닌 페이지를 포함한 모든 버전의 페이지에서 다음 단계를 따르세요.

1. 페이지에 있는 모든 페이월 섹션에 클래스 이름을 추가합니다. 예를 들면 다음과 같습니다.

   ```
   <body>
   <p>This content is outside a paywall and is visible to all.</p>
   <div class="paywall">This content is inside a paywall, and requires a subscription or registration.</div>
   </body>
   ```
2. 구조화된 [`NewsArticle`](https://developers.google.com/search/docs/appearance/structured-data/article?hl=ko) 데이터를 추가합니다.
3. 강조표시되고 구조화된 JSON-LD 데이터를 구조화된 `NewsArticle` 데이터에 추가합니다.
   **참고**: `cssSelector`는 1단계에서 추가한 클래스 이름을 참조합니다.

   ```
   {
     "@context": "https://schema.org",
     "@type": "NewsArticle",
     "mainEntityOfPage": {
       "@type": "WebPage",
       "@id": "https://example.org/article"
     },
     (...)
     "isAccessibleForFree": false,
     "hasPart": {
       "@type": "WebPageElement",
       "isAccessibleForFree": false,
       "cssSelector": ".paywall"
     }
   }
   ```
4. [리치 결과 테스트](https://search.google.com/test/rich-results?hl=ko)를 사용하여 코드의 유효성을 검사하고 심각한 오류를 해결하세요.

### 여러 개의 페이월 섹션

페이지에 페이월 섹션이 여러 개 있는 경우, 클래스 이름을 배열로 추가하세요.

다음은 페이지에 있는 페이월 섹션의 예입니다.

```
<body>
  <div class="section1">This content is inside a paywall, and requires a subscription or registration.</div>
  <p>This content is outside a paywall and is visible to all.</p>
  <div class="section2">This is another section that's inside a paywall, or requires a subscription or registration.</div>
</body>
```

다음은 여러 개의 페이월 섹션이 있는 구조화된 [`NewsArticle`](https://developers.google.com/search/docs/appearance/structured-data/article?hl=ko) 데이터의 예입니다.

```
{
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://example.org/article"
    },
  (...)
  "isAccessibleForFree": false,
  "hasPart": [
    {
      "@type": "WebPageElement",
      "isAccessibleForFree": false,
      "cssSelector": ".section1"
    }, {
      "@type": "WebPageElement",
      "isAccessibleForFree": false,
      "cssSelector": ".section2"
    }
  ]
}
```

### 지원되는 유형

이 마크업은 `CreativeWork` 유형 또는 다음의 더욱 구체적인 `CreativeWork` 유형 중 하나에서 지원됩니다.

* `Article`
* `NewsArticle`
* `Blog`
* `Comment`
* `Course`
* `HowTo`
* `Message`
* `Review`
* `WebPage`

다음과 같은 여러 schema.org 유형을 사용할 수 있습니다.

`"@type": ["Article", "LearningResource"]`

Google에서 기사에 페이월 콘텐츠가 있다는 것을 이해할 수 있도록 필수 속성을 포함해야 합니다. 권장 속성을 추가하면 페이지에서 페이월이 적용되는 섹션 또는 구독이나 등록이 필요한 섹션을 더 세분화할 수 있습니다.

| 필수 속성 | |
| --- | --- |
| `isAccessibleForFree` | `Boolean`  모든 사용자가 기사에 액세스할 수 있는지 또는 페이월이 적용되는지(또는 구독 또는 등록이 필요한지) 여부 이 섹션에 페이월이 적용되도록 지정하려면 `isAccessibleForFree` 속성을 `false`로 설정합니다. |

| 권장 속성 | |
| --- | --- |
| `hasPart.cssSelector` | `CssSelectorType`  페이월 섹션을 지정하기 위해 [HTML에서 설정](#class-name-step)한 클래스 이름을 참조하는 CSS 선택자입니다. |
| `hasPart.@type` | `Text`  `@type`를 `WebPageElement`로 설정합니다. |
| `hasPart.isAccessibleForFree` | `Boolean`  이 기사 섹션에 페이월이 적용되는지(또는 구독 또는 등록이 필요한지) 여부 이 섹션에 페이월이 적용되도록 지정하려면 `isAccessibleForFree` 속성을 `False`로 설정합니다. |

## AMP 고려사항

AMP 페이지를 사용할 때 고려해야 할 사항은 다음과 같습니다.

* 페이월 콘텐츠가 포함된 AMP 페이지가 있으면 적절한 경우 [`amp-subscriptions`](https://www.ampproject.org/docs/reference/components/amp-subscriptions)를 사용합니다.
* Google 등의 관련 크롤러가 콘텐츠에 액세스하도록 승인 엔드포인트가 허용해야 합니다. 이는 게시자마다 다릅니다.
* AMP 페이지와 AMP가 아닌 페이지에 적용되는 크롤러 액세스 정책이 동일해야 합니다. 그렇지 않으면 Search Console에 콘텐츠 불일치 오류가 표시될 수 있습니다.

## Google 검색의 생성형 AI 고려사항

AI 개요 및 AI 모드에서는 웹 소스를 비롯한 다양한 소스를 기반으로 주제 또는 쿼리 미리보기를 제공합니다.
따라서 Google 검색의 [미리보기 컨트롤](https://developers.google.com/search/docs/appearance/snippet?hl=ko#nosnippet)이 적용됩니다.

## Google에서 페이지를 크롤링하고 색인을 생성할 수 있는지 확인

Google에서 페이월 섹션을 포함한 콘텐츠를 크롤링하고 색인을 생성하기를 원하는 경우 [Googlebot](https://developers.google.com/search/docs/crawling-indexing/verifying-googlebot?hl=ko)(그리고 해당하는 경우 [`Googlebot-News`](https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers?hl=ko#googlebot-news))이 페이지에 액세스할 수 있도록 해야 합니다.

[URL 검사 도구](https://support.google.com/webmasters/answer/9012289?hl=ko)를 사용하여 Google 사이트에서 URL을 크롤링하고 렌더링하는 방식을 테스트합니다.

## 검색결과에 표시되는 정보 관리

콘텐츠의 특정 섹션이 검색결과 스니펫에 표시되지 않도록 하려면 [`data-nosnippet` HTML 속성](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag?hl=ko#data-nosnippet-attr)을 사용하세요.
[`max-snippet` robots `meta` 태그](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag?hl=ko#max-snippet)를 사용하여 검색결과 스니펫에서 사용할 수 있는 문자 수를 제한할 수도 있습니다.

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
