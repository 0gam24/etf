# 구조화된 토론 포럼(DiscussionForumPosting) 데이터

> **출처(Source):** https://developers.google.com/search/docs/appearance/structured-data/discussion-forum?hl=ko
> **저작자(Attribution):** Google
> **라이선스(License):** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
> 이 문서는 Google 검색 센터 문서를 Markdown으로 변환한 사본입니다.
> 원문의 최신 내용은 위 출처 링크를 확인하세요.

---

# 구조화된 토론 포럼(`DiscussionForumPosting`) 데이터

![토론 및 포럼 기능을 보여주는 그림](https://developers.google.com/static/search/docs/images/discussions-and-forums-rich-result.png?hl=ko)

토론 포럼 마크업은 사람들이 자신의 견해를 직접 공유하는 포럼 스타일 사이트에 맞게 설계되었습니다. 포럼 사이트에 이 마크업을 추가하면 Google 검색에서 웹상의 온라인 토론을 더 잘 식별하고 [토론 및 포럼](https://blog.google/products/search/google-search-discussions-forums-news/?hl=ko)과 같은 기능에 이 마크업을 사용할 수 있습니다.

**포럼은 질문과 답변 패턴을 따르나요?**
그렇다면 구조화된 토론 포럼 마크업 대신 [Q&A 마크업](https://developers.google.com/search/docs/appearance/structured-data/qapage?hl=ko)을 사용하세요.

## 포럼 내에서 `DiscussionForumPosting`을 사용하는 방법

일반적인 경우라면 댓글과 관련된 게시물 아래에 댓글을 중첩하는 것이 좋습니다.
포럼에 자체적인 대화목록 구조가 있다면 댓글 트리를 사용하여 구조를 표시하세요.

```
{
  "@context": "https://schema.org",
  "@type": "DiscussionForumPosting",
  "headline": "Very Popular Thread",
  ...
  "comment": [{
    "@type": "Comment",
    "text": "This should not be this popular",
    ...
    "comment": [{
      "@type": "Comment",
      "text": "Yes it should",
      ...
    }]
  }]
}
```

원본 게시물에 이어 일련의 답글이 있는 경우와 같이 본질적으로 선형적인 구조를 갖고 있다면 원래 게시물 아래에 댓글로 모두 중첩합니다. 여러 페이지로 구성된 포럼의 이후 콘텐츠 페이지에 기본 페이지 URL과 함께 원본 게시물을 포함하는 것이 좋습니다.

```
{
  // JSON-LD on non-threaded forum at https://example.com/post/very-popular-thread/14
  "@context": "https://schema.org",
  "@type": "DiscussionForumPosting",
  "headline": "Very Popular Thread", // Only the headline/topic is explicitly present
  "url": "https://example.com/post/very-popular-thread",
  ...
  "comment": [{
    "@type": "Comment",
    "text": "First Post on this Page",
    ...
  },{
    "@type": "Comment",
    "text": "Second Post on this Page",
    ...
  }]
}
```

주로 하나의 게시물에 관한 URL이라면 [`mainEntity`](https://schema.org/mainEntity)(또는 [`mainEntityOfPage`](https://schema.org/mainEntityOfPage))를 사용하여 기본 `DiscussionForumPosting`을 표시합니다.

```
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "url": "https://example.com/post/very-popular-thread",
  "mainEntity": {
    "@type": "DiscussionForumPosting"
    ...
  }
}
```

웹페이지에 프로필, 주제, 카테고리 페이지처럼 게시물 목록이 있으면 일반적으로 하나의 페이지에 모든 정보가 표시되지는 않으며 사용자가 클릭하여 추가 정보(예: 답글)를 확인할 수 있습니다. 페이지에 있는 정보만 포함하고 토론 게시물에 URL을 포함할지 여부는 본인에게 달려 있습니다.

**페이지의 게시물 중 하나가 게시물 토론 페이지가 아닌 경우 이 게시물을 기본 항목으로 표시하지 마세요**. 여러 페이지가 관련된 게시물의 집합임을 표시하려면 모든 페이지를 하나의 [`Collection`](https://schema.org/Collection)
또는 [`ItemList`](https://schema.org/ItemList)에 첨부하는 것이 좋습니다.

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

다음의 마크업 예제는 스레드가 아닌 선형 포럼 페이지를 보여줍니다.

JSON-LD

  

```
<html>
  <head>
    <title>I went to the concert!</title>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "DiscussionForumPosting",
      "mainEntityOfPage": "https://example.com/post/very-popular-thread",
      "headline": "I went to the concert!",
      "text": "Look at how cool this concert was!",
      "video": {
        "@type": "VideoObject",
        "contentUrl": "https://example.com/media/super-cool-concert.mp4",
        "name": "Video of concert",
        "uploadDate": "2024-03-01T06:34:34+02:00",
        "thumbnailUrl": "https://example.com/media/super-cool-concert-snap.jpg"
      },
      "url": "https://example.com/post/very-popular-thread",
      "author": {
        "@type": "Person",
        "name": "Katie Pope",
        "url": "https://example.com/user/katie-pope",
        "agentInteractionStatistic": {
          "@type": "InteractionCounter",
          "interactionType": "https://schema.org/WriteAction",
          "userInteractionCount": 8
        }
      },
      "datePublished": "2024-03-01T08:34:34+02:00",
      "interactionStatistic": {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/LikeAction",
        "userInteractionCount": 27
      },
      "comment": [{
        "@type": "Comment",
        "text": "Who's the person you're with?",
        "author": {
          "@type": "Person",
          "name": "Saul Douglas",
          "url": "https://example.com/user/saul-douglas",
          "agentInteractionStatistic": {
            "@type": "InteractionCounter",
            "interactionType": "https://schema.org/WriteAction",
            "userInteractionCount": 167
          }
        },
        "datePublished": "2024-03-01T09:46:02+02:00"
      },{
        "@type": "Comment",
        "text": "That's my mom, isn't she cool?",
        "author": {
          "@type": "Person",
          "name": "Katie Pope",
          "url": "https://example.com/user/katie-pope",
          "agentInteractionStatistic": {
            "@type": "InteractionCounter",
            "interactionType": "https://schema.org/WriteAction",
            "userInteractionCount": 8
          }
        },
        "datePublished": "2024-03-01T09:50:25+02:00",
        "interactionStatistic": {
          "@type": "InteractionCounter",
          "interactionType": "https://schema.org/LikeAction",
          "userInteractionCount": 7
        }
      }]
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
    <body>
      <div id="main-post" itemtype="https://schema.org/DiscussionForumPosting" itemscope>
        <meta itemprop="mainEntityOfPage" content="https://example.com/post/very-popular-thread" />
        <meta itemprop="url" content="https://example.com/post/very-popular-thread" />
        <div class="author-block" itemprop="author" itemtype="https://schema.org/Person" itemscope>
          <div><a href="https://example.com/user/katie-pope" itemprop="url"><span itemprop="name">Katie Pope</span></a></div>
          <div itemprop="agentInteractionStatistic" itemtype="https://schema.org/InteractionCounter" itemscope>
            <span itemprop="userInteractionCount">8</span>
            <span itemprop="interactionType" content="https://schema.org/WriteAction">posts</span>
          </div>
        </div>
        <div itemprop="datePublished" content="2024-03-01T08:34:34+02:00">March 1</div>
        <div itemprop="headline">I went to the concert!</div>
        <div>
          <div itemprop="video" itemtype="https://schema.org/VideoObject" itemscope>
            <meta itemprop="name" content="Video of concert" />
            <meta itemprop="contentUrl" content="https://example.com/media/super-cool-concert.mp4" />
            <meta itemprop="uploadDate" content="2024-03-01T06:34:34+02:00" />
            <meta itemprop="thumbnailUrl" content="https://example.com/media/super-cool-concert-snap.jpg" />
          </div>
          <span itemprop="text">Look at how cool this concert was!</span>
        </div>
        <div itemprop="interactionStatistic" itemtype="https://schema.org/InteractionCounter" itemscope>
          <span itemprop="userInteractionCount">27</span>
          <span itemprop="interactionType" content="https://schema.org/LikeAction">likes</span>
        </div>
        <div id="comment-1" itemprop="comment" itemtype="https://schema.org/Comment" itemscope>
          <div class="author-block" itemprop="author" itemtype="https://schema.org/Person" itemscope>
            <div><a href="https://example.com/user/saul-douglas" itemprop="url"><span itemprop="name">Saul Douglas</span></a></div>
            <div itemprop="agentInteractionStatistic" itemtype="https://schema.org/InteractionCounter" itemscope>
              <span itemprop="userInteractionCount">167</span>
              <span itemprop="interactionType" content="https://schema.org/WriteAction">posts</span>
            </div>
          </div>
          <div itemprop="datePublished" content="2024-03-01T09:46:02+02:00">March 1</div>
          <div>
            <span itemprop="text">Who's the person you're with?</span>
          </div>
        </div>
        <div id="comment-2" itemprop="comment" itemtype="https://schema.org/Comment" itemscope>
          <div class="author-block" itemprop="author" itemtype="https://schema.org/Person" itemscope>
            <div><a href="https://example.com/user/katie-pope" itemprop="url"><span itemprop="name">Katie Pope</span></a></div>
            <div itemprop="agentInteractionStatistic" itemtype="https://schema.org/InteractionCounter" itemscope>
              <span itemprop="userInteractionCount">8</span>
              <span itemprop="interactionType" content="https://schema.org/WriteAction">posts</span>
            </div>
          </div>
          <div itemprop="datePublished" content="2024-03-01T09:50:25+02:00">March 1</div>
          <div>
            <span itemprop="text">That's my mom, isn't she cool?</span>
          </div>
          <div itemprop="interactionStatistic" itemtype="https://schema.org/InteractionCounter" itemscope>
            <span itemprop="userInteractionCount">7</span>
            <span itemprop="interactionType" content="https://schema.org/LikeAction">likes</span>
          </div>
        </div>
      </div>
    </body>
</html>
```

## 가이드라인

Google 검색에서 구조화된 토론 포럼 데이터를 사용하려면 다음 가이드라인을 따라야 합니다.

* [구조화된 데이터 일반 가이드라인](https://developers.google.com/search/docs/appearance/structured-data/sd-policies?hl=ko)
* [검색 Essentials](https://developers.google.com/search/docs/essentials?hl=ko)
* [콘텐츠 가이드라인](#content-guidelines)
* [기술 가이드라인](#technical-guidelines)

### 콘텐츠 가이드라인

* `DiscussionForumPosting` 마크업은 웹사이트에서 사용자가 작성한 게시물을 설명할 때만 사용하세요. 주로 웹사이트 게시자나 대리인이 작성한 콘텐츠에는 이 마크업을 사용하지 마시기 바랍니다.
* 사이트가 일반 소셜 미디어 플랫폼이라면 `DiscussionForumPosting`의 상위 유형이며 요구사항이 동일한 `SocialMediaPosting`을 사용할 수 있습니다.
* 댓글, 작성자 정보, 상호작용 통계가 포함된 매우 유사한 마크업인 다른 유형(`Article`, `ImageObject`, `VideoObject`)의 유효한 마크업을 사용하는 것이 좋지만, 이러한 유형의 게시물에서는 `DiscussionForumPosting` 마크업을 사용해서는 안 됩니다. 다음은 관련 예입니다.

  **올바른 사용 사례**:

  + 사용자가 특정 게임에 대해 이야기할 수 있는 커뮤니티 포럼 페이지
  + 다양한 하위 포럼 콘텐츠를 호스팅하는 일반 포럼 플랫폼
  + 사용자가 댓글이나 미디어를 게시하고 답글을 달 수 있는 소셜 미디어 플랫폼

  **잘못된 사용 사례**:

  + 대리인이 웹사이트용으로 직접 작성한 기사 또는 블로그(의견 포함)
  + 사용자의 제품 리뷰
* 대부분의 Google 사용 사례에서 Q&A 페이지는 토론 포럼 페이지의 특별한 사례로 간주됩니다. 포럼 웹사이트가 주로 질문에 답변이 달리는 구조를 사용하고 있다면 토론 포럼 대신 [Q&A 마크업](https://developers.google.com/search/docs/appearance/structured-data/qapage?hl=ko)을 사용하는 것이 좋습니다. 구조가 더 일반적이며 질문과 답변 콘텐츠가 아닌 경우 `DiscussionForumPosting`을 사용하는 것이 더 좋습니다.
* 모든 `DiscussionForumPosting`에 게시물의 전체 텍스트가 포함되어 있는지 확인하고, 각각의 `Comment`에 응답의 전체 텍스트가 포함되어 있는지 확인합니다(응답이 페이지에 있는 경우).

### 기술 가이드라인

* 일반적인 구조화된 데이터 환경설정과 달리 `DiscussionForumPosting` 마크업은 가능하면 마이크로데이터(또는 RDFa) 형식으로 제공하는 것이 좋습니다. 이렇게 하면 마크업 내에서 큰 텍스트 블록을 복제하지 않아도 됩니다. 하지만 이는 권장사항일 뿐이며 JSON-LD를 사용해도 여전히 완벽하게 지원됩니다.

## 구조화된 데이터 유형 정의

이 섹션은 `DiscussionForumPosting`과 관련된 구조화된 데이터 유형을 설명합니다.

콘텐츠가 Google 검색에서 사용되려면 필수 속성이 있어야 합니다.
권장 속성을 통해 토론 포럼 페이지에 관한 정보를 추가하면 더 만족스러운 사용자 환경을 제공할 수도 있습니다.

### `DiscussionForumPosting` (또는 `SocialMediaPosting`)

Google은 `SocialMediaPosting` 마크업을 지원하지만 대부분의 웹사이트(특히 포럼)에서는 요구사항이 동일한 `DiscussionForumPosting` 마크업을 더 적절하다고 여깁니다. 따라서 이 섹션에서는 설명에 `DiscussionForumPosting`을 사용합니다.

`DiscussionForumPosting` 유형은 토론 주제인 원본 게시물을 정의합니다. 이 유형은 일반적으로 텍스트로 구성되지만 미디어 콘텐츠로만 구성된 포럼 게시물도 있을 수 있습니다.

| 필수 속성 | |
| --- | --- |
| `author` | `Person` 또는 `Organization` 게시물 작성자에 관한 정보입니다. Google이 여러 기능에서 작성자를 이해할 수 있도록 [작성자 마크업 권장사항](https://developers.google.com/search/docs/appearance/structured-data/article?hl=ko#author-bp)을 따르는 것이 좋습니다.  구조화된 [기사](https://developers.google.com/search/docs/appearance/structured-data/article?hl=ko#article-types) 및 [프로필 페이지](https://developers.google.com/search/docs/appearance/structured-data/profile-page?hl=ko) 데이터에서 지원되는 속성을 가이드로 사용하여 작성자에게 적합한 속성을 최대한 많이 포함하세요. |
| `author.name` | `Text` 게시물 작성자의 이름입니다. |
| `datePublished` | `DateTime`  게시물이 작성된 날짜와 시간입니다. [ISO 8601 형식](https://wikipedia.org/wiki/ISO_8601)으로 나타냅니다. |
| `text`, `image` 또는 `video` | 다음 속성 중 하나를 포함하여 게시물의 콘텐츠를 표시해야 합니다.   * [`text`](#text-sd) * [`image`](#image-sd) * [`video`](#video-sd)   포럼 또는 포럼 카테고리 페이지의 이후 페이지에서처럼 외부 `url`을 사용하여 다른 페이지의 게시물을 나타내는 경우에는 필요하지 않습니다. |

| 권장 속성 | |
| --- | --- |
| `author.url` | `URL`  게시물 작성자를 고유하게 식별하는 웹페이지 링크로 포럼의 프로필 페이지일 가능성이 높습니다. [구조화된 프로필 페이지 데이터](https://developers.google.com/search/docs/appearance/structured-data/profile-page?hl=ko)를 사용하여 페이지를 마크업하는 것이 좋습니다. |
| `comment` | `Comment`  게시물에 대한 댓글 또는 답글입니다(해당하는 경우). 페이지에 표시되는 순서대로 댓글을 마크업합니다. |
| `commentCount` | `Integer`  이 게시물에 대한 댓글 수입니다(해당하는 경우). 이는 댓글 마크업에 모두 표시되지 않는 경우에 특히 유용합니다. |
| `creativeWorkStatus` | `Text`  게시물이 삭제되었지만 컨텍스트 또는 대화목록을 위해 남아 있는 경우 이 속성을 해당하는 경우 `Deleted`로 설정하세요. |
| `dateModified` | `DateTime`  [ISO 8601 형식](https://wikipedia.org/wiki/ISO_8601)으로 게시물이 수정된 날짜와 시간입니다(해당하는 경우). 변경사항이 없으면 게시 날짜를 복제하지 않아도 됩니다. |
| `digitalSourceType` | `IPTCDigitalSourceEnumeration`  `digitalSourceType` 속성은 콘텐츠와 연결된 디지털 소스의 유형을 나타냅니다(해당하는 경우). 이 속성은 특히 사람과 AI 또는 기타 머신 생성 콘텐츠를 구분하는 데 유용합니다. Google은 다음 값을 지원합니다.   * `TrainedAlgorithmicMediaDigitalSource`: 학습된 모델(예: LLM)에서 생성된 콘텐츠를 나타냅니다. * `AlgorithmicMediaDigitalSource`: 자동 답장 봇과 같은 더 간단한 알고리즘 프로세스로 생성된 콘텐츠를 나타냅니다.   이 속성을 지정하지 않으면 Google에서는 콘텐츠가 사람이 생성한 것으로 간주합니다. |
| `headline` | `Text` 게시물 제목입니다. 별도의 제목이 없는 경우 텍스트를 헤드라인으로 복사해 넣거나 자르지 마세요. `SocialMediaPosting`에는 권장되지 않습니다. |
| `image` | `ImageObject` 또는 `URL`  게시물 내의 인라인 이미지입니다(해당하는 경우). 이미지가 없는 경우 이 필드에 기본, 아이콘, 플레이스홀더, 작성자 이미지를 포함하지 마세요. 이미지가 링크 미리보기인 경우 `sharedContent`에서 첨부된 `WebPage`의 `image` 필드에 포함합니다. |
| `interactionStatistic` | `InteractionCounter`  기본 게시물에 적용되는 사용자 통계입니다(해당하는 경우).  Google에서는 다음과 같은 `interactionTypes`를 지원합니다.   * <https://schema.org/LikeAction>: 좋아요 또는 찬성 투표 수입니다. * <https://schema.org/DislikeAction>: 싫어요 또는 반대 투표 수입니다. * <https://schema.org/ViewAction>: 조회수입니다. * <https://schema.org/CommentAction> 또는 <https://schema.org/ReplyAction>: 댓글 수입니다. * <https://schema.org/ShareAction>: 재공유 횟수입니다. |
| `isPartOf` | `CreativeWork` 또는 `URL`  게시물이 전체 웹사이트의 특정 부분에서 생성하는 경우, 게시물의 기본 소스입니다(해당하는 경우). 예를 들어 하위 포럼이나 광범위한 웹사이트 내의 그룹이 여기 해당됩니다. `CreativeWork`(예: `WebPage`)를 사용하는 경우 [URL](https://schema.org/CreativeWork) 속성을 사용하여 URL을 지정하세요. |
| `sharedContent` | `CreativeWork` 하위유형 게시물의 기본 공유 콘텐츠입니다(해당하는 경우). 여기에서는 다음 네 가지 유형이 허용됩니다.   1. `WebPage`: 이 유형을 사용할 수 있는 가장 일반적인 방법은 URL과 함께 주제 토론으로 공유하는 것입니다. 다음은 게시물에 공유된 링크가 있음을 추가하는 방법의 예입니다.        ```      ...      "sharedContent": { "@type": "WebPage", "url": "https://example.com/external-url" }      ...    ``` 2. `ImageObject`: 게시물의 기본 콘텐츠가 이미지인 경우 이 유형을 사용하여 마크업할 수 있습니다. 3. `VideoObject`: 게시물의 기본 콘텐츠가 동영상인 경우 이 유형을 사용하여 마크업할 수 있습니다. 4. `DiscussionForumPosting` 또는 `Comment`: 참조된 게시물 또는 댓글 (인용 또는 다시 게시됨)이 있는 경우 여기에 참조를 포함합니다. 다음은 참조된 `Comment`를 마크업하는 예입니다.        ```      ...      "sharedContent": {        "@type": "Comment",        "url": "https://example.com/post123#comment456",        "datePublished": "2025-03-24",        "author": {          "@type": "Person",          "name": "Jane Doe"        },        "text": "This is a referenced comment displayed inside the post"      }      ...    ``` |
| `text` | `Text`  게시물에 포함된 텍스트입니다(해당하는 경우). 매우 흔한 속성입니다. 하지만 게시물에 다른 미디어가 포함되어 있는 경우 생략될 수 있습니다. |
| `url` | `URL` 토론의 표준 URL입니다. 다중 페이지 스레드에서는 이 속성을 첫 번째 페이지 URL로 설정하세요. 단일 토론의 경우 일반적으로 현재 URL을 표시합니다. |
| `video` | `VideoObject`  게시물 내의 인라인 동영상입니다(해당하는 경우). |

### `Comment`

`Comment` 유형은 원래 `CreativeWork`의 댓글을 정의합니다. 이 경우에는 `DiscussionForumPosting`입니다. `DiscussionForumPosting` 가이드라인과 여러 속성을 공유합니다.

| 필수 속성 | |
| --- | --- |
| `author` | `Person` 또는 `Organization` 댓글 작성자에 관한 정보입니다. Google이 여러 기능에서 작성자를 이해할 수 있도록 [작성자 마크업 권장사항](https://developers.google.com/search/docs/appearance/structured-data/article?hl=ko#author-bp)을 따르는 것이 좋습니다.  구조화된 [기사](https://developers.google.com/search/docs/appearance/structured-data/article?hl=ko#article-types) 및 [프로필 페이지](https://developers.google.com/search/docs/appearance/structured-data/profile-page?hl=ko) 데이터에서 지원되는 속성을 가이드로 사용하여 작성자에게 적합한 속성을 최대한 많이 포함하세요. |
| `datePublished` | `DateTime`  댓글이 작성된 날짜와 시간입니다. [ISO 8601 형식](https://wikipedia.org/wiki/ISO_8601)으로 나타냅니다. 변경사항이 없으면 게시 날짜를 복제하지 않아도 됩니다. |
| `text`, `image` 또는 `video` | 다음 속성 중 하나를 포함하여 댓글의 콘텐츠를 표시해야 합니다.   * [`text`](#text-sd) * [`image`](#image-sd) * [`video`](#video-sd) |

| 권장 속성 | |
| --- | --- |
| `author.url` | `URL`  댓글 작성자를 고유하게 식별하는 웹페이지 링크로 포럼의 프로필 페이지일 가능성이 높습니다. [구조화된 프로필 페이지 데이터](https://developers.google.com/search/docs/appearance/structured-data/profile-page?hl=ko)를 사용하여 페이지를 마크업하는 것이 좋습니다. |
| `comment` | `Comment`  해당 댓글에 대한 또는 댓글에 대한 다른 댓글입니다(해당하는 경우). 페이지에 표시된 순서대로 댓글을 마크업합니다. |
| `commentCount` | `Integer`  이 댓글에 대한 댓글 수입니다(해당하는 경우). 이는 댓글 마크업에 모두 표시되지 않는 경우에 특히 유용합니다. |
| `creativeWorkStatus` | `Text`  게시물이 삭제되었지만 컨텍스트 또는 대화목록을 위해 남아 있는 경우 이 속성을 `Deleted`로 설정하세요(해당하는 경우). |
| `dateModified` | `DateTime`  댓글이 수정된 날짜와 시간입니다. [ISO 8601 형식](https://wikipedia.org/wiki/ISO_8601)으로 나타냅니다(해당하는 경우). |
| `digitalSourceType` | `IPTCDigitalSourceEnumeration`  `digitalSourceType` 속성은 콘텐츠와 연결된 디지털 소스의 유형을 나타냅니다(해당하는 경우). 이 속성은 특히 사람과 AI 또는 기타 머신 생성 콘텐츠를 구분하는 데 유용합니다. Google은 다음 값을 지원합니다.   * `TrainedAlgorithmicMediaDigitalSource`: 학습된 모델(예: LLM)에서 생성된 콘텐츠를 나타냅니다. * `AlgorithmicMediaDigitalSource`: 자동 답장 봇과 같은 더 간단한 알고리즘 프로세스로 생성된 콘텐츠를 나타냅니다.   이 속성을 지정하지 않으면 Google에서는 콘텐츠가 사람이 생성한 것으로 간주합니다. |
| `image` | `ImageObject` 또는 `URL`  댓글에 포함된 인라인 이미지입니다(해당하는 경우). 이미지가 없는 경우 이 필드에 기본, 아이콘, 플레이스홀더, 작성자 이미지를 포함하지 마세요. 이미지가 링크 미리보기인 경우 `sharedContent`에서 첨부된 `WebPage`의 `image` 필드에 포함합니다. |
| `interactionStatistic` | `InteractionCounter`  댓글에 적용된 사용자 통계입니다(해당하는 경우).  Google에서는 다음과 같은 `interactionTypes`를 지원합니다.   * <https://schema.org/LikeAction>: 좋아요 또는 찬성 투표 수입니다. * <https://schema.org/DislikeAction>: 싫어요 또는 반대 투표 수입니다. * <https://schema.org/ViewAction>: 조회수입니다. * <https://schema.org/CommentAction> 또는 <https://schema.org/ReplyAction>: 댓글 수입니다. * <https://schema.org/ShareAction>: 재공유 횟수입니다. |
| `sharedContent` | `CreativeWork` 하위유형 게시물의 기본 공유 콘텐츠입니다(해당하는 경우). 여기에는 네 가지 유형이 있습니다.   1. `WebPage`: 이 유형을 사용할 수 있는 가장 일반적인 방법은 URL과 함께 주제 토론으로 공유하는 것입니다. 다음은 게시물에 공유된 링크가 있음을 추가하는 방법의 예입니다.        ```      ...      "sharedContent": { "@type": "WebPage", "url": "https://example.com/external-url" }      ...    ``` 2. `ImageObject`: 게시물의 기본 콘텐츠가 이미지인 경우 이 유형을 사용하여 마크업할 수 있습니다. 3. `VideoObject`: 게시물의 기본 콘텐츠가 동영상인 경우 이 유형을 사용하여 마크업할 수 있습니다. 4. `DiscussionForumPosting` 또는 `Comment`: 참조된 게시물 또는 댓글 (인용 또는 다시 게시됨)이 있는 경우 여기에 참조를 포함합니다. 다음은 참조된 `Comment`를 마크업하는 예입니다.        ```      ...      "sharedContent": {        "@type": "Comment",        "url": "https://example.com/post123#comment456",        "datePublished": "2025-03-24",        "author": {          "@type": "Person",          "name": "Jane Doe"        },        "text": "This is a referenced comment displayed inside the post"      }      ...    ``` |
| `url` | `URL` 페이지의 특정 댓글에 대한 URL입니다(해당하는 경우). 원래 게시물의 URL인 경우에는 이 속성을 포함하지 마세요. |
| `video` | `VideoObject`  댓글 내의 인라인 동영상입니다(해당하는 경우). |

### `InteractionCounter`

`InteractionCounter`를 사용하면 이 개수를 특정 유형의 상호작용과 연결할 수 있습니다. 콘텐츠([`DiscussionForumPosting`](#dfp) 및 [`Comment`](#comment)) 속성 및 [`author` 속성](https://developers.google.com/search/docs/appearance/structured-data/profile-page?hl=ko#profile-target-specification) 모두에 사용할 수 있습니다.

| 필수 속성 | |
| --- | --- |
| `userInteractionCount` | `Integer` 이 상호작용이 수행된 횟수입니다. |
| `interactionType` | [`Action`](https://schema.org/Action) 하위유형  이 속성의 유효한 `Action` 하위유형 목록을 보려면 `InteractionCounter`를 사용 중인 속성(예: [`interactionStatistic`](#comment-interactionStatistic))을 확인하세요 |

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
