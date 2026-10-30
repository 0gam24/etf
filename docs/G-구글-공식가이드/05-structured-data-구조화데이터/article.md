# 구조화된 기사(Article,NewsArticle,BlogPosting) 데이터

> **출처(Source):** https://developers.google.com/search/docs/appearance/structured-data/article?hl=ko
> **저작자(Attribution):** Google
> **라이선스(License):** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
> 이 문서는 Google 검색 센터 문서를 Markdown으로 변환한 사본입니다.
> 원문의 최신 내용은 위 출처 링크를 확인하세요.

---

# 구조화된 기사(`Article`, `NewsArticle`, `BlogPosting`) 데이터

뉴스, 블로그 및 스포츠 기사 페이지에 구조화된 `Article` 데이터를 추가하면 Google에서 웹페이지를 더 잘 이해하고 Google 검색의 검색결과 및 기타 속성(예: Google 뉴스, [Google 어시스턴트](https://developers.google.com/assistant/content/overview?hl=ko))에서 해당 기사의 [제목 텍스트](https://developers.google.com/search/docs/appearance/title-link?hl=ko), 이미지, [날짜 정보](https://developers.google.com/search/docs/appearance/publication-dates?hl=ko)를 더 잘 표시할 수 있습니다.
[주요 뉴스](https://support.google.com/news/publisher-center/answer/9607026?hl=ko)와 같은 Google 뉴스 기능을 사용하기 위한 마크업 요구사항은 없지만 `Article`를 추가하여 Google에 콘텐츠 내용(예: 뉴스 기사, 저자 또는 기사 제목)을 더 명시적으로 알릴 수 있습니다.

![기사 리치 결과](https://developers.google.com/static/search/docs/images/article-rich-result.png?hl=ko)

## 예

다음은 구조화된 `Article` 데이터가 포함된 페이지의 예입니다.

#### JSON-LD

  

```
<html>
  <head>
    <title>Title of a News Article</title>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": "Title of a News Article",
      "image": [
        "https://example.com/photos/1x1/photo.jpg",
        "https://example.com/photos/4x3/photo.jpg",
        "https://example.com/photos/16x9/photo.jpg"
       ],
      "datePublished": "2024-01-05T08:00:00+08:00",
      "dateModified": "2024-02-05T09:20:00+08:00",
      "author": [{
          "@type": "Person",
          "name": "Jane Doe",
          "url": "https://example.com/profile/janedoe123"
        },{
          "@type": "Person",
          "name": "John Doe",
          "url": "https://example.com/profile/johndoe123"
      }]
    }
    </script>
  </head>
  <body>
  </body>
</html>
```

#### 마이크로데이터

  

```
<html>
  <head>
    <title>Title of a News Article</title>
  </head>
  <body>
    <div itemscope itemtype="https://schema.org/NewsArticle">
      <div itemprop="headline">Title of News Article</div>
      <meta itemprop="image" content="https://example.com/photos/1x1/photo.jpg" />
      <meta itemprop="image" content="https://example.com/photos/4x3/photo.jpg" />
      <img itemprop="image" src="https://example.com/photos/16x9/photo.jpg" />
      <div>
        <span itemprop="datePublished" content="2024-01-05T08:00:00+08:00">
          January 5, 2024 at 8:00am
        </span>
        (last modified
        <span itemprop="dateModified" content="2024-02-05T09:20:00+08:00">
          February 5, 2024 at 9:20am
        </span>
        )
      </div>
      <div>
        by
        <span itemprop="author" itemscope itemtype="https://schema.org/Person">
          <a itemprop="url" href="https://example.com/profile/janedoe123">
            <span itemprop="name">Jane Doe</span>
          </a>
        </span>
        and
        <span itemprop="author" itemscope itemtype="https://schema.org/Person">
          <a itemprop="url" href="https://example.com/profile/johndoe123">
            <span itemprop="name">John Doe</span>
          </a>
        </span>
      </div>
    </div>
  </body>
</html>
```

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

## 가이드라인

구조화된 데이터가 Google 검색결과에 포함되도록 하려면 가이드라인을 따라야 합니다.

**경고**: Google에서는 다음 가이드라인 중 하나 이상 위반하는 사이트에 [직접 조치](https://support.google.com/webmasters/answer/2604824?hl=ko)를 취할 수 있습니다.
문제가 되는 부분을 해결하고 나면 사이트 [재검토](https://support.google.com/webmasters/answer/35843?hl=ko) 요청을 제출할 수 있습니다.

* [검색 Essentials](https://developers.google.com/search/docs/essentials?hl=ko)
* [구조화된 데이터 일반 가이드라인](https://developers.google.com/search/docs/appearance/structured-data/sd-policies?hl=ko)
* [기술 가이드라인](#technical-guidelines)

### 기술 가이드라인

* 여러 부분으로 구성된 기사의 경우 `rel=canonical`이 개별 페이지 또는 ‘모두 보기’ 페이지(여러 부분으로 구성된 시리즈의 1페이지가 아님)를 가리키도록 해야 합니다. [표준화](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls?hl=ko)에 관해 자세히 알아보세요.
* 웹사이트 콘텐츠에 구독 기반 액세스 권한을 제공하거나 사용자가 액세스 등록을 해야 하는 경우, [구독 및 페이월 콘텐츠](https://developers.google.com/search/docs/appearance/structured-data/paywalled-content?hl=ko)를 위한 구조화된 데이터를 추가해 보세요.

## 구조화된 데이터 유형 정의

Google에서 페이지를 더 잘 이해할 수 있도록 웹페이지에 해당하는 권장 속성을 최대한 많이 포함하세요. 필수 속성은 없습니다. 대신 콘텐츠에 해당하는 속성을 추가하세요.

### `Article` 객체

Article 객체는 schema.org 유형인 [`Article`](https://schema.org/Article), [`NewsArticle`](https://schema.org/NewsArticle), [`BlogPosting`](https://schema.org/BlogPosting) 중 하나를 기반으로 해야 합니다.

Google에서 지원하는 속성은 다음과 같습니다.

| 권장 속성 | |
| --- | --- |
| `author` | `Person` 또는 `Organization`  기사의 작성자입니다. Google에서 다양한 기능을 갖춘 작성자를 이해할 수 있도록 [작성자 마크업 권장사항](#author-bp)을 따르는 것이 좋습니다. |
| `author.name` | `Text`  작성자의 이름입니다. |
| `author.url` | `URL`  기사의 작성자를 고유하게 식별하는 웹페이지 링크입니다. 작성자의 소셜 미디어 페이지나 내 정보 페이지, 약력 페이지를 예로 들 수 있습니다.  URL이 내부 프로필 페이지인 경우 [구조화된 프로필 페이지 데이터](https://developers.google.com/search/docs/appearance/structured-data/profile-page?hl=ko)를 사용하여 작성자를 마크업하는 것이 좋습니다. `sameAs` 속성을 대안으로 사용할 수 있습니다. Google은 작성자를 구분할 때 `sameAs`와 `url`을 모두 인식할 수 있습니다. |
| `dateModified` | `DateTime`  기사가 최근에 수정된 날짜와 시간입니다. [ISO 8601 형식](https://wikipedia.org/wiki/ISO_8601)으로 나타냅니다. 시간대 정보를 제공하는 것이 좋으며, 제공하지 않은 경우 [Googlebot에서 사용하는 시간대](https://developers.google.com/search/docs/crawling-indexing/googlebot?hl=ko#timezone)가 기본값으로 설정됩니다.  Google에 더 정확한 날짜 정보를 제공하려면 `dateModified` 속성을 추가합니다. 이 속성은 사이트에 해당한다고 판단될 때만 사용하는 것이 좋기 때문에 [리치 결과 테스트](https://search.google.com/test/rich-results?hl=ko)에서는 이 속성에 관한 경고를 표시하지 않습니다. |
| `datePublished` | `DateTime`  기사가 처음으로 게시된 날짜와 시간입니다. [ISO 8601 형식](https://wikipedia.org/wiki/ISO_8601)으로 나타냅니다. 시간대 정보를 제공하는 것이 좋으며, 제공하지 않은 경우 [Googlebot에서 사용하는 시간대](https://developers.google.com/search/docs/crawling-indexing/googlebot?hl=ko#timezone)가 기본값으로 설정됩니다.  Google에 더 정확한 날짜 정보를 제공하려면 `datePublished` 속성을 추가합니다. 이 속성은 사이트에 해당한다고 판단될 때만 사용하는 것이 좋기 때문에 [리치 결과 테스트](https://search.google.com/test/rich-results?hl=ko)에서는 이 속성에 관한 경고를 표시하지 않습니다. |
| `headline` | `Text`  기사의 제목입니다. 일부 기기에서는 긴 제목이 잘릴 수 있으므로 간결한 제목을 사용하는 것이 좋습니다. |
| `image` | 반복되는 `ImageObject` 또는 `URL`  기사를 잘 나타내는 이미지의 URL입니다. 로고나 캡션보다는 기사와 관련된 이미지를 사용합니다.  추가 이미지 가이드라인은 다음과 같습니다.   * 이미지 URL은 크롤링 및 색인 생성이 가능해야 합니다. Google에서 내 URL에 액세스할 수 있는지 확인하려면 [URL 검사 도구](https://support.google.com/webmasters/answer/9012289?hl=ko)를 사용하세요. * 이미지는 마크업된 콘텐츠를 나타내야 합니다. * 이미지는 [Google 이미지에서 지원](https://developers.google.com/search/docs/appearance/google-images?hl=ko#supported-image-formats)되는 파일 형식이어야 합니다. * 최상의 결과를 위해서는 가로세로 비율이 16x9, 4x3, 1x1인 여러 개의 고해상도 이미지(너비와 높이의 곱이 최소 50,000픽셀)를 제공하는 것이 좋습니다.   예:     ``` "image": [   "https://example.com/photos/1x1/photo.jpg",   "https://example.com/photos/4x3/photo.jpg",   "https://example.com/photos/16x9/photo.jpg" ] ``` |

## 작성자 마크업 권장사항

Google에서 콘텐츠 작성자를 가장 잘 이해하고 대표할 수 있도록 마크업에 작성자를 지정할 때 다음 권장사항을 따르는 것이 좋습니다.

| 작성자 마크업 권장사항 | |
| --- | --- |
| 마크업에 모든 작성자 포함 | 웹페이지에 작성자로 표시되는 모든 작성자가 마크업에 포함되어야 합니다. |
| 여러 명의 작성자 지정 | 여러 명의 작성자를 지정할 경우 각 작성자를 다음과 같이 해당하는 `author` 필드에 나열합니다.     ``` "author": [   {"name": "Willow Lane"},   {"name": "Regula Felix"} ] ```   하나의 `author` 필드에 여러 명의 작성자를 병합하지 마세요.     ``` "author": {   "name": "Willow Lane, Regula Felix" } ``` |
| 추가 필드 사용 | 또한 Google에서 저자를 더 잘 이해할 수 있도록 `type` 및 `url`(또는 `sameAs`) 속성을 사용하는 것이 좋습니다. `url` 또는 `sameAs` 속성에 유효한 URL을 사용합니다.  예를 들어 저자가 사람이라면 작성자에 관한 자세한 정보를 제공하는 작성자 페이지 링크를 제공할 수 있습니다.     ``` "author": [   {     "@type": "Person",     "name": "Willow Lane",     "url": "https://www.example.com/staff/willow_lane"   } ] ```   작성자가 조직이라면 조직 홈페이지로 연결할 수 있습니다.     ``` "author":   [     {       "@type":"Organization",       "name": "Some News Agency",       "url": "https://www.example.com/"   } ] ``` |
| 작성자 이름은 `author.name` 속성에서만 지정하세요. | `author.name` 속성에서 작성자의 이름만을 지정합니다. 다른 정보는 추가하지 마세요. 특히 다음 정보는 추가하지 마세요.   * 게시자 이름입니다. 대신 `publisher` 속성을 사용하세요. * 작성자의 직책은 추가하지 않습니다. 이 정보를 지정할 때는 적절한 속성([`jobTitle`](https://schema.org/jobTitle))을 사용하세요. * 존칭을 나타내는 프리픽스 또는 서픽스는 추가하지 않습니다. 이 정보를 지정할 때는 적절한 속성([`honorificPrefix`](https://schema.org/honorificPrefix) 또는 [`honorificSuffix`](https://schema.org/honorificSuffix))을 사용하세요. * '게시자'와 같이 작성자를 소개하는 표현은 포함하지 마세요.      ``` "author":   [     {       "@type": "Person",       "name": "Echidna Jones",       "honorificPrefix": "Dr",       "jobTitle": "Editor in Chief"     }   ], "publisher":   [     {       "@type": "Organization",       "name": "Bugs Daily"     }   ] } ``` |
| 적절한 `Type`을(를) 사용합니다. | 사람인 경우 `Person` 유형을 사용하고 조직에는 `Organization` 유형을 사용합니다. `Thing` 유형을 사용해서는 안됩니다. 또한 항목에 적합하지 않은 유형(예: 사람에게 `Organization` 유형 사용)을 사용하지 마세요. |

다음은 작성자 마크업 권장사항을 적용한 예입니다.

```
"author":
  [
    {
      "@type": "Person",
      "name": "Willow Lane",
      "jobTitle": "Journalist",
      "url": "https://www.example.com/staff/willow-lane"
    },
    {
      "@type": "Person",
      "name": "Echidna Jones",
      "jobTitle": "Editor in Chief",
      "url": "https://www.example.com/staff/echidna-jones"
    }
  ],
"publisher":
  {
    "@type": "Organization",
    "name": "The Daily Bug",
    "url": "https://www.example.com"
  },
  // + Other fields related to the article...
}
```

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
