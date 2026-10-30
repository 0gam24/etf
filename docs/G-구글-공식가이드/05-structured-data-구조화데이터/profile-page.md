# 구조화된 프로필 페이지(ProfilePage) 데이터

> **출처(Source):** https://developers.google.com/search/docs/appearance/structured-data/profile-page?hl=ko
> **저작자(Attribution):** Google
> **라이선스(License):** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
> 이 문서는 Google 검색 센터 문서를 Markdown으로 변환한 사본입니다.
> 원문의 최신 내용은 위 출처 링크를 확인하세요.

---

# 구조화된 프로필 페이지(`ProfilePage`) 데이터

![토론 및 포럼 기능을 보여주는 그림](https://developers.google.com/static/search/docs/images/discussions-and-forums-rich-result.png?hl=ko)

`ProfilePage` 마크업은 작성자(사람 또는 조직)가 의견을 직접 공유하는 모든 사이트를 위해 설계되었습니다. 이 마크업을 추가하면 Google 검색에서 온라인 커뮤니티에 게시하는 크리에이터를 파악하고 [토론 및 포럼](https://blog.google/products/search/google-search-discussions-forums-news/?hl=ko) 기능을 비롯한 검색 결과에 해당 커뮤니티의 더 나은 콘텐츠를 표시하는 데 도움이 됩니다.

다른 구조화된 데이터 기능에서도 `ProfilePage` 마크업이 있는 페이지로 연결할 수 있습니다. 예를 들어 구조화된 [기사](https://developers.google.com/search/docs/appearance/structured-data/article?hl=ko) 및 [레시피](https://developers.google.com/search/docs/appearance/structured-data/recipe?hl=ko) 데이터에는 작성자가 있으며, 구조화된 [토론 포럼](https://developers.google.com/search/docs/appearance/structured-data/discussion-forum?hl=ko) 및 [Q&A 페이지](https://developers.google.com/search/docs/appearance/structured-data/qapage?hl=ko) 데이터에는 여러 명의 작성자가 있는 경우가 많습니다.

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

다음은 마크업을 사용하는 프로필 페이지의 예입니다.

JSON-LD

  

```
<html>
  <head>
    <title>Angelo Huff on Cool Forum Platform</title>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      "dateCreated": "2024-12-23T12:34:00-05:00",
      "dateModified": "2024-12-26T14:53:00-05:00",
      "mainEntity": {
        "@type": "Person",
        "name": "Angelo Huff",
        "alternateName": "ahuff23",
        "identifier": "123475623",
        "interactionStatistic": [{
          "@type": "InteractionCounter",
          "interactionType": "https://schema.org/FollowAction",
          "userInteractionCount": 1
        },{
          "@type": "InteractionCounter",
          "interactionType": "https://schema.org/LikeAction",
          "userInteractionCount": 5
        }],
        "agentInteractionStatistic": {
          "@type": "InteractionCounter",
          "interactionType": "https://schema.org/WriteAction",
          "userInteractionCount": 2346
        },
        "description": "Defender of Truth",
        "image": "https://example.com/avatars/ahuff23.jpg",
        "sameAs": [
          "https://www.example.com/real-angelo",
          "https://example.com/profile/therealangelohuff"
        ]
      }
    }
    </script>
  </head>
  <body>
  </body>
</html>
```

마이크로데이터

  

```
<html>
  <head>
    <title>Angelo Huff on Cool Forum Platform</title>
  </head>
  <body itemtype="https://schema.org/ProfilePage" itemscope>
    <meta itemprop="dateCreated" content="2024-12-23T12:34:00-05:00" />
  	<meta itemprop="dateModified" content="2024-12-26T14:53:00-05:00" />
    <div itemprop="mainEntity" itemtype="https://schema.org/Person" itemscope>
      <div><span itemprop="alternateName" id="handle">ahuff23</span> (<span itemprop="name" id="real-name">Angelo Huff</span>)</div>
      <meta itemprop="identifier" content="123475623" />
      <div itemprop="description">Defender of Truth</div>
      <img itemprop="image" src="https://example.com/avatars/ahuff23.jpg" />
      <div>Links: <a itemprop="sameAs" href="https://www.therealangelohuff.com">Home Page</a><br>
                  <a itemprop="sameAs" href="https://example.com/profile/therealangelohuff">Other Social Media Site</a></div>
      <div><span itemprop="interactionStatistic" itemtype="https://schema.org/InteractionCounter" itemscope>
              <span itemprop="userInteractionCount">5</span>
              <span itemprop="interactionType" content="https://schema.org/LikeAction">likes</span>
           </span>,
           <span itemprop="interactionStatistic" itemtype="https://schema.org/InteractionCounter" itemscope>
              <span itemprop="userInteractionCount">1</span>
              <span itemprop="interactionType" content="https://schema.org/FollowAction">follower</span>
           </span>, and
           <span itemprop="agentInteractionStatistic" itemtype="https://schema.org/InteractionCounter" itemscope>
              <span itemprop="userInteractionCount">2346</span>
              <span itemprop="interactionType" content="https://schema.org/WriteAction">posts</span>
           </span>
       </div>
    </div>
  </body>
</html>
```

## 가이드라인

Google 검색에서 구조화된 프로필 페이지 데이터를 사용하려면 다음 가이드라인을 따라야 합니다.

* [구조화된 데이터 일반 가이드라인](https://developers.google.com/search/docs/appearance/structured-data/sd-policies?hl=ko)
* [검색 Essentials](https://developers.google.com/search/docs/essentials?hl=ko)
* [콘텐츠 가이드라인](#content-guidelines)
* [기술 가이드라인](#technical-guidelines)

### 콘텐츠 가이드라인

* 페이지는 기본 콘텐츠는 전체 웹사이트와 관련된 단일 개인 또는 조직에 중점을 둬야 합니다. 다음은 프로필 페이지의 예입니다.
    

  올바른 사용 사례:

  + 포럼 또는 소셜 미디어 사이트의 사용자 프로필 페이지
  + 뉴스 사이트의 작성자 페이지
  + 블로그 사이트의 '내 정보' 페이지
  + 회사 웹사이트의 직원 페이지

  잘못된 사용 사례:

  + 매장 기본 홈페이지(일반적으로 프로필 이외의 정보가 많이 포함되어 있음)
  + 조직 리뷰 사이트(기관이 웹사이트와 연결되어 있지 않음)

### 기술 가이드라인

프로필 페이지에 작성자의 최근 활동도 포함된 경우, 해당 개체의 URL을 사용한 마크업을 포함하여 전체 콘텐츠 및 마크업이 있는 페이지를 참조하도록 할 수 있습니다. 예를 들어 다음도 사용 가능한 마크업 구조 중 하나입니다.

```
{
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "mainEntity": {
    "@id": "#main-author",
    "@type": "Person",
    "name": "Marlo Smith"
  },
  "hasPart": [{
    "@type": "Article",
    "headline": "Things to see in NJ",
    "url": "https://example.com/things-to-see-nj",
    "datePublished": "2014-02-23T18:34:00Z",
    "author": { "@id": "#main-author" }
  }]
}
```

## 구조화된 데이터 유형 정의

검색 결과에 구조화된 데이터를 표시하려면 필수 속성이 있어야 합니다. 권장 속성을 통해 프로필 페이지에 관한 정보를 추가하여 더 만족스러운 사용자 환경을 제공할 수 있습니다.

### `ProfilePage`

`ProfilePage`의 전체 정의는 [schema.org/ProfilePage](https://schema.org/ProfilePage)에서 확인하세요.

| 필수 속성 | |
| --- | --- |
| `mainEntity` | `Person` 또는 `Organization`  이 프로필 페이지에서 다루는 개인 또는 조직입니다. 페이지의 주된 내용이 이 항목에 관한 정보임을 나타냅니다.  해당 정보를 사용할 수 있는 경우(즉, 페이지가 개인을 나타내는지 또는 조직을 나타내는지 알고 있는 경우) 올바른 유형을 사용하세요. 그렇지 않으면 기본값인 `Person`로 설정합니다(예: 알 수 없는 유형의 계정인 경우). |

| 권장 속성 | |
| --- | --- |
| `dateCreated` | `DateTime`  프로필이 생성된 날짜와 시간입니다(해당하는 경우). [ISO 8601](https://wikipedia.org/wiki/ISO_8601) 날짜 형식으로 나타냅니다. |
| `dateModified` | `DateTime`  프로필의 정보가 수정된 날짜와 시간입니다(해당하는 경우). [ISO 8601](https://wikipedia.org/wiki/ISO_8601) 날짜 형식으로 나타냅니다. 사람이 수정한 프로필 메타데이터 변경사항만 나타내는 것이 이상적입니다. 예를 들어 이 프로필이 참조되는 장소에 추가 아웃링크를 추가하는 것은 수정사항이 아닙니다. |

### `Person` 또는 `Organization`

[schema.org/Person](https://schema.org/Person)과 [schema.org/Organization](https://schema.org/Organization) 모두 Google에서 사용되는 공통 속성을 공유합니다.

| 필수 속성 | |
| --- | --- |
| `name` | `Text`  개인 또는 조직을 식별하는 주된 방법입니다. 실명에는 이 필드를 사용하는 것이 좋습니다(소셜 미디어 핸들의 경우 `alternateName` 사용). 그러나 사이트에서 사용자를 식별하는 유일한 방법인 경우 이 필드로 소셜 미디어 핸들을 지정할 수 있습니다. `name` 속성을 사용할 수 없는 경우 `alternateName` 속성을 제공하여 이 요구사항을 충족할 수 있습니다. |

| 권장 속성 | |
| --- | --- |
| `agentInteractionStatistic` | `InteractionCounter`  프로필 페이지 개체의 자체 동작에 대한 사용자 통계입니다(해당하는 경우).    Google은 다음의 `interactionTypes`를 인식합니다.   * <https://schema.org/FollowAction>: 팔로우 중인 다른 계정의 수입니다. * <https://schema.org/LikeAction>: 좋아요(일반적으로 다른 항목의 게시물) 수입니다. * <https://schema.org/WriteAction>: 게시물 수입니다. * <https://schema.org/ShareAction>: 게시물 재공유 횟수입니다. |
| `alternateName` | `Text`  대체 공개 식별자입니다(해당하는 경우). 예를 들어 개인의 실명이 `name` 필드에 사용되는 경우 소셜 미디어 핸들이 여기 해당합니다. |
| `description` | `Text`  사용자의 기자명 입력란 또는 관련 사용자 인증 정보입니다(해당하는 경우). |
| `identifier` | `Text`  사이트 내에서 사용되는 고유 식별자입니다(해당하는 경우). 이 식별자는 소셜 미디어에서 변경 사항을 처리하는 경우에도 사이트에서 사용자를 식별하기 위해 사용하는 내부 데이터베이스 ID일 수 있습니다. |
| `image` | `URL` 또는 `ImageObject`  작성자 프로필 이미지의 URL 또는 `ImageObject`입니다(해당하는 경우). 이미지가 없는 경우 이 필드에 기본 이미지, 아이콘, 자리표시자 이미지를 포함하지 마세요.  추가 이미지 가이드라인은 다음과 같습니다.   * 이미지 URL은 크롤링 및 색인 생성이 가능해야 합니다. Google에서 내 URL에 액세스할 수 있는지 확인하려면 [URL 검사 도구](https://support.google.com/webmasters/answer/9012289?hl=ko)를 사용하세요. * 이미지는 마크업된 콘텐츠를 나타내야 합니다. * 이미지는 [Google 이미지에서 지원](https://developers.google.com/search/docs/appearance/google-images?hl=ko#supported-image-formats)되는 파일 형식이어야 합니다. * 최상의 결과를 위해서는 가로세로 비율이 16x9, 4x3, 1x1인 여러 개의 고해상도 이미지(너비와 높이의 곱이 최소 50,000픽셀)를 제공하는 것이 좋습니다.   예:     ``` "image": [   "https://example.com/photos/1x1/photo.jpg",   "https://example.com/photos/4x3/photo.jpg",   "https://example.com/photos/16x9/photo.jpg" ] ``` |
| `interactionStatistic` | `InteractionCounter`  프로필 페이지 항목에 적용된 사용자 통계입니다(해당하는 경우). 프로필 페이지가 호스팅되는 플랫폼에 대한 통계만 포함하세요. 작성자의 홈페이지에 팔로어가 100,000명 있다는 사실을 언급하지 마세요.    Google은 다음의 `interactionTypes`를 인식합니다.   * <https://schema.org/FollowAction>: 팔로어 수입니다. * <https://schema.org/LikeAction>: 이 항목의 좋아요 수입니다. * <https://schema.org/BefriendAction>: 양방향 관계입니다. |
| `sameAs` | `URL`  기타 외부 프로필 또는 프로필 홈페이지의 URL입니다(해당하는 경우). |

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
