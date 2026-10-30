# 구조화된 Q&A(QAPage) 데이터

> **출처(Source):** https://developers.google.com/search/docs/appearance/structured-data/qapage?hl=ko
> **저작자(Attribution):** Google
> **라이선스(License):** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
> 이 문서는 Google 검색 센터 문서를 Markdown으로 변환한 사본입니다.
> 원문의 최신 내용은 위 출처 링크를 확인하세요.

---

# 구조화된 Q&A(`QAPage`) 데이터

![질문 및 답변 리치 결과를 보여주는 그림](https://developers.google.com/static/search/docs/images/qa-rich-result.png?hl=ko)

Q&A 페이지는 질문과 답변이 이어지는 형식의 데이터가 포함된 웹페이지입니다. 질문과 답변을 나타내는 콘텐츠의 경우 [schema.org](https://schema.org/) `QAPage`, `Question`, `Answer` 유형으로 데이터를 마크업할 수 있습니다.

마크업이 제대로 된 페이지는 검색결과 페이지에 리치 결과가 표시됩니다. 이러한 리치 결과 처리를 통해 적절한 사용자가 Google 검색에서 사이트를 발견하게 할 수 있습니다.
예를 들어 페이지가 해당 질문에 대한 답변으로 마크업된 경우 'USB 포트에 케이블이 꼈는데 어떻게 빼나요?'라는 사용자 검색어의 리치 결과가 표시될 수 있습니다.

Q&A 페이지를 마크업하면 내 콘텐츠가 리치 결과로 처리되는 것 외에도 Google에서 내 페이지의 [스니펫](https://developers.google.com/search/docs/appearance/snippet?hl=ko)이 개선되는 데 도움이 됩니다.
리치 결과가 표시되지 않으면 답변의 콘텐츠가 기본 결과에 나타날 수 있습니다.

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

다음 마크업 예에는 JSON-LD 형식의 `QAPage`, `Question`, `Answer` 유형 정의가 포함되어 있습니다.

JSON-LD

  

```
<html>
  <head>
    <title>How many ounces are there in a pound?</title>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "QAPage",
      "mainEntity": {
        "@type": "Question",
        "name": "How many ounces are there in a pound?",
        "text": "I have taken up a new interest in baking and keep running across directions in ounces and pounds. I have to translate between them and was wondering how many ounces are in a pound?",
        "answerCount": 3,
        "upvoteCount": 26,
        "datePublished": "2024-02-14T15:34-05:00",
        "author": {
          "@type": "Person",
          "name": "Mary Stone",
          "url": "https://example.com/profiles/mary-stone"
        },
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "1 pound (lb) is equal to 16 ounces (oz).",
          "image": "https://example.com/images/conversion-chart.jpg",
          "upvoteCount": 1337,
          "url": "https://example.com/question1#acceptedAnswer",
          "datePublished": "2024-02-14T16:34-05:00",
          "author": {
            "@type": "Person",
            "name": "Julius Fernandez",
            "url": "https://example.com/profiles/julius-fernandez"
          }
        },
        "suggestedAnswer": [
          {
            "@type": "Answer",
            "text": "Are you looking for ounces or fluid ounces? If you are looking for fluid ounces there are 15.34 fluid ounces in a pound of water.",
            "upvoteCount": 42,
            "url": "https://example.com/question1#suggestedAnswer1",
            "datePublished": "2024-02-14T15:39-05:00",
            "author": {
              "@type": "Person",
              "name": "Kara Weber",
              "url": "https://example.com/profiles/kara-weber"
            },
            "comment": {
              "@type": "Comment",
              "text": "I'm looking for ounces, not fluid ounces.",
              "datePublished": "2024-02-14T15:40-05:00",
              "author": {
                "@type": "Person",
                "name": "Mary Stone",
                "url": "https://example.com/profiles/mary-stone"
              }
            }
          }, {
            "@type": "Answer",
            "text": " I can't remember exactly, but I think 18 ounces in a lb. You might want to double check that.",
            "upvoteCount": 0,
            "url": "https://example.com/question1#suggestedAnswer2",
            "datePublished": "2024-02-14T16:02-05:00",
            "author": {
              "@type": "Person",
              "name": "Joe Cobb",
              "url": "https://example.com/profiles/joe-cobb"
            }
          }
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
<body itemscope itemtype="https://schema.org/QAPage">
<div itemprop="mainEntity" itemscope itemtype="https://schema.org/Question">
   <h2 itemprop="name">How many ounces are there in a pound?</h2>
   <div itemprop="upvoteCount">52</div>
   <div itemprop="text">I have taken up a new interest in baking and keep running across directions in ounces and pounds. I have to translate between them and was wondering how many ounces are in a pound?</div>
   <meta itemprop="datePublished" content="2024-02-14T15:34-05:00"/>
   <div itemprop="author" itemscope itemtype="https://schema.org/Person">
     <span itemprop="name">Mary Stone</span>
   </div>
<div>
    <div><span itemprop="answerCount">3</span> answers</div>
    <div><span itemprop="upvoteCount">26</span> votes</div>
    <div id="acceptedAnswer" itemprop="acceptedAnswer" itemscope itemtype="https://schema.org/Answer">
       <div itemprop="upvoteCount">1337</div>
       <div itemprop="text">
       1 pound (lb) is equal to 16 ounces (oz).
       </div>
      <a itemprop="url" href="https://example.com/question1#acceptedAnswer">Answer Link</a>
      <meta itemprop="datePublished" content="2024-02-14T16:34-05:00"/>
      <div itemprop="author" itemscope itemtype="https://schema.org/Person">
        <span itemprop="name">Julius Fernandez</span>
      </div>
      </div>
    <div id="suggestedAnswer1" itemprop="suggestedAnswer" itemscope itemtype="https://schema.org/Answer">
       <div itemprop="upvoteCount">42</div>
       <div itemprop="text">
       Are you looking for ounces or fluid ounces? If you are looking for fluid ounces there are 15.34 fluid ounces in a pound of water.
       </div>
       <a itemprop="url" href="https://example.com/question1#suggestedAnswer1">Answer Link</a>
       <meta itemprop="datePublished" content="2024-02-14T15:39-05:00"/>
       <div itemprop="author" itemscope itemtype="https://schema.org/Person">
         <span itemprop="name">Kara Weber</span>
       </div>
       <div itemprop="comment" itemscope itemtype="https://schema.org/Comment">
         <div itemprop="text">I'm looking for ounces, not fluid ounces.</div>
         <div itemprop="author" itemscope itemtype="https://schema.org/Person">
           <span itemprop="name">Mary Stone</span>
         </div>
         <meta itemprop="datePublished" content="2024-02-14T15:40-05:00"/>
       </div>
     </div>
     <div id="suggestedAnswer2" itemprop="suggestedAnswer" itemscope itemtype="https://schema.org/Answer">
       <div itemprop="upvoteCount">0</div>
       <div itemprop="text">
       I can't remember exactly, but I think 18 ounces in a lb. You might want to double check that.
       </div>
       <a itemprop="url" href="https://example.com/question1#suggestedAnswer2">Answer Link</a>
       <meta itemprop="datePublished" content="2024-02-14T16:02-05:00"/>
       <div itemprop="author" itemscope itemtype="https://schema.org/Person">
         <span itemprop="name">Joe Cobb</span>
       </div>
    </div>
</div>
</div>
</body>
</html>
```

## 가이드라인

Q&A 페이지를 리치 결과로 처리하려면 다음 가이드라인을 따라야 합니다.

* [구조화된 데이터 일반 가이드라인](https://developers.google.com/search/docs/appearance/structured-data/sd-policies?hl=ko)
* [검색 Essentials](https://developers.google.com/search/docs/essentials?hl=ko)
* [콘텐츠 가이드라인](#content-guidelines)

### 콘텐츠 가이드라인

* 질문 한 개에 답변이 이어지는 방식, 즉 질문과 답변 형식으로 페이지가 구성되어 있는 경우에만 `QAPage` 마크업을 사용하세요.
* 사용자는 질문에 답변을 제출할 수 있어야 합니다. 주어진 질문에 한 개의 답변만 있으며 사용자가 대체 답변을 추가할 수 없는 콘텐츠에는 `QAPage` 마크업을 사용하지 마세요. 다음은 관련 예입니다.

  **올바른 사용 사례**:

  + 사용자가 하나의 질문에 답변을 제출할 수 있는 포럼 페이지
  + 사용자가 하나의 질문에 답변을 제출할 수 있는 제품 지원 페이지

  **잘못된 사용 사례**:

  + 사용자가 대체 답변을 제출할 방법이 없는, 사이트 자체에서 작성한 FAQ 페이지
  + 사용자가 하나의 페이지에 여러 질문과 답변을 제출할 수 있는 제품 페이지
  + 질문에 답변하는 안내 가이드
  + 질문에 답변하는 블로그 게시물
  + 질문에 답변하는 에세이
* 모든 콘텐츠가 해당될 때만 사이트나 포럼의 모든 페이지에 `QAPage` 마크업을 적용해야 합니다.
  예를 들어, 포럼에 개별적으로 마크업할 수 있는 여러 질문이 게시되어 있지만 포럼에 질문이 아닌 페이지가 포함되어 있는 경우 해당 페이지는 마크업을 사용할 수 없습니다.
* FAQ 페이지 또는 페이지마다 질문이 여러 개 있는 페이지에는 `QAPage` 마크업을 사용하지 마세요. `QAPage` 마크업은 하나의 질문과 그 답변에 중점을 둔 페이지에만 사용해야 합니다.
* 광고 목적으로는 `QAPage` 마크업을 사용하지 마세요.
* 각 `Question`에는 질문의 전체 텍스트가 포함되어 있어야 하고, 각 `Answer`에는 답변의 전체 텍스트가 포함되어 있어야 합니다.
* `Answer` 마크업은 질문에 관한 댓글이나 다른 답변에 관한 댓글이 아닌 질문에 관한 답변에만 사용해야 합니다. 대신 이 콘텐츠 유형에는 `comment` 속성과 `Comment` 유형을 사용합니다.
* 질문 및 답변 콘텐츠에 선정적이거나, 욕설이 담겨 있거나, 외설적이거나, 폭력적인 그래픽이 포함되어 있거나, 위험 행위 또는 불법 행위를 홍보하거나, 증오심 표현 또는 위협성 언어가 포함되어 있는 경우 리치 결과로 포함되지 않을 수 있습니다.
* [교육 관련 Q&A 페이지](https://developers.google.com/search/docs/appearance/structured-data/education-qa?hl=ko)는 사용자가 제출한 과제 질문에 정확한 답변을 제공하는 데 중점을 두고 있으며, Q&A 캐러셀 환경 이용이 가능할 수도 있습니다.
  이 페이지에는 사용자가 아닌 내부 전문가가 제공하거나 선택한 하나의 답변만 있을 수 있습니다.  
  **예**: 사용자가 하나의 질문을 제출했으며 전문가가 최상위 답변을 선택한 교육 페이지입니다.

## 구조화된 데이터 유형 정의

이 섹션은 `QAPage`와 관련된 구조화된 데이터 유형을 설명합니다.

콘텐츠를 리치 결과로 표시하려면 필수 속성이 있어야 합니다. 권장 속성을 포함하면 구조화된 데이터에 더 많은 정보를 추가하여 더욱 만족스러운 사용자 환경을 제공할 수도 있습니다.

Google의 [리치 결과 테스트](https://search.google.com/test/rich-results?hl=ko)를 사용하여 구조화된 데이터를 검사하고 미리 볼 수 있습니다.

### `QAPage`

`QAPage` 유형은 하나의 특정 질문과 답변에 중점을 둔 페이지를 나타냅니다. Google에서는 `QAPage` 마크업이 있는 페이지의 구조화된 `Question` 데이터만 사용합니다. 페이지당 `QAPage` 유형 정의가 하나만 있어야 합니다.

`QAPage`의 전체 정의는 <https://schema.org/QAPage>에서 확인할 수 있습니다.

다음 표는 Google 검색에서 사용하는 `QAPage` 유형의 속성을 설명합니다.

| 필수 속성 | |
| --- | --- |
| `mainEntity` | `Question` 이 페이지의 `Question`은 `QAPage` 항목의 `mainEntity` 속성 아래에 중첩되어 있어야 합니다. |

### `Question`

`Question` 유형은 이 페이지에서 답변하는 질문을 정의하고, 답변이 있는 경우 관련 질문의 답변을 포함합니다. 페이지에 정확히 하나의 `Question` 유형만 `schema.org/QAPage`의 `mainEntity` 속성에 중첩되어 있어야 합니다. 페이지당 `Question` 유형 정의가 하나만 있어야 합니다.

 사이트에서 권장 속성을 지원하지 않는 경우 구조화된 데이터에서 이 속성을 생략하세요.

`Question`의 전체 정의는 <https://schema.org/Question>에서 확인할 수 있습니다. Google에서 지원하는 속성은 다음과 같습니다.

| 필수 속성 | |
| --- | --- |
| `answerCount` | `Integer` 질문의 총 답변 수입니다. 예를 들어 답변이 15개인데 페이지 나누기로 인해 첫 10개만 마크업된 경우, 이 속성의 값은 15입니다. 답변이 없는 질문에는 0일 수 있습니다. `answerCount` + `commentCount`는 모든 유형의 답글 총수와 같아야 합니다. |
| `acceptedAnswer` 또는 `suggestedAnswer` | `Answer` 리치 결과를 사용하려면 질문에 `acceptedAnswer` 또는 `suggestedAnswer` 답변이 하나 이상 있어야 합니다. 하지만 질문이 처음 게시되었을 때는 답변이 없을 수 있습니다. 답변이 없는 질문은 `answerCount` 속성을 0으로 설정하세요. 답변이 없는 질문은 리치 결과를 사용할 수 없습니다.   |  |  | | --- | --- | | `acceptedAnswer` | `Answer` 질문에 관한 최상위 답변입니다. 질문당 0개 이상이 있을 수 있습니다. 사이트에서 어떤 방식으로든 수락된 답변을 표시해야 합니다. 예를 들어 질문자, 중재자, 투표 시스템에서 최상위 답변으로 수락했을 수 있습니다. 최신순과 같은 다른 형식의 답변 정렬은 최상위 답변을 식별하는 데 사용되어서는 안 됩니다. | | `suggestedAnswer` | `Answer` 하나의 답변이 있긴 하지만 최상위 답변으로 수락되지 않은 경우입니다(`acceptedAnswer`). 질문당 0개 이상이 있을 수 있습니다. | |
| `name` | `Text` 짧은 형식 질문의 전체 텍스트입니다. 예: '한 컵은 몇 티스푼인가요?' |

| 권장 속성 | |
| --- | --- |
| `author` | `Person` 또는 `Organization` 질문 작성자에 관한 정보입니다. Google에서 다양한 기능을 갖춘 작성자를 이해할 수 있도록 [작성자 마크업 권장사항](https://developers.google.com/search/docs/appearance/structured-data/article?hl=ko#author-bp)을 따르는 것이 좋습니다.  구조화된 [기사](https://developers.google.com/search/docs/appearance/structured-data/article?hl=ko#article-types) 및 [프로필 페이지](https://developers.google.com/search/docs/appearance/structured-data/profile-page?hl=ko) 데이터에서 지원되는 속성을 가이드로 사용하여 작성자에게 적합한 속성을 최대한 많이 포함하세요. |
| `author.url` | `URL`  질문 작성자를 고유하게 식별하는 웹페이지 링크로 Q&A 웹사이트의 프로필 페이지일 가능성이 높습니다. [구조화된 프로필 페이지 데이터](https://developers.google.com/search/docs/appearance/structured-data/profile-page?hl=ko)를 사용하여 페이지를 마크업하는 것이 좋습니다. |
| `comment` | `Comment`  질문과 관련된 댓글입니다(있는 경우). 이 콘텐츠는 답변이 아니라 질문에 대한 설명이나 토론으로 보는 것이 적절합니다. |
| `commentCount` | `Integer`  이 질문에 대한 댓글 수입니다(해당하는 경우). `answerCount` + `commentCount`는 모든 유형의 답글 총수와 같아야 합니다. |
| `dateModified` | `DateTime`  [ISO 8601 형식](https://wikipedia.org/wiki/ISO_8601)으로 답변을 수정한 날짜와 시간입니다(해당하는 경우). |
| `datePublished` | `DateTime`  [ISO 8601 형식](https://wikipedia.org/wiki/ISO_8601)으로 질문이 게시된 날짜와 시간입니다. |
| `digitalSourceType` | `IPTCDigitalSourceEnumeration`  `digitalSourceType` 속성은 콘텐츠와 연결된 디지털 소스의 유형을 나타냅니다(해당하는 경우). 이 속성은 사람과 AI 또는 기타 머신 생성 콘텐츠를 구분하는 데 특히 유용합니다. Google은 다음 값을 지원합니다.   * `TrainedAlgorithmicMediaDigitalSource`: 학습된 모델(예: LLM)에서 생성된 콘텐츠를 나타냅니다. * `AlgorithmicMediaDigitalSource`: 자동 답장 봇과 같은 더 간단한 알고리즘 프로세스로 생성된 콘텐츠를 나타냅니다.   이 속성을 지정하지 않으면 Google에서는 콘텐츠가 사람이 생성한 것으로 간주합니다. |
| `image` | `ImageObject` 또는 `URL`  질문 내의 인라인 이미지입니다(해당하는 경우). 이미지가 없는 경우 이 필드에 기본, 아이콘, 플레이스홀더, 작성자 이미지를 포함하지 마세요. |
| `text` | `Text` 긴 형식 질문의 전체 텍스트입니다. 예: '요리 중인데 한 컵은 몇 티스푼인지 궁금해요. 한 컵은 몇 티스푼인가요?' |
| `upvoteCount` | `Integer` 이 질문이 받은 총 투표수입니다. 페이지에서 찬성 투표와 반대 투표를 지원하는 경우, `upvoteCount` 값은 찬성수와 반대수를 모두 나타내는 하나의 집계값으로 설정하세요. 예를 들어 찬성수가 5이고 반대수가 2인 경우, `upvoteCount`에 사용되는 집계값은 3입니다. 찬성수가 5이고 반대수는 지원되지 않는 경우 `upvoteCount` 값은 5입니다. |
| `video` | `VideoObject`  질문 내의 인라인 동영상입니다(해당하는 경우). |

### `Answer`

`Answer` 유형은 이 페이지의 `Question`에 대해 제안된 답변과 수락된 답변을 정의합니다. `Question` 내에서 `suggestedAnswer`와 `acceptedAnswer` 속성 값으로 `Answers`를 정의합니다.

다음 표는 `Question` 내에서 사용되는 `Answer` 유형의 속성을 설명합니다.

`Answer`의 전체 정의는 <https://schema.org/Answer>에서 확인할 수 있습니다.

사이트에서 권장 속성을 지원하지 않는 경우 구조화된 데이터에서 이 속성을 생략하세요.

| 필수 속성 | |
| --- | --- |
| `text` | `Text` 답변의 전체 텍스트입니다. 일부만 마크업되어 있는 경우 콘텐츠가 표시되지 않을 수 있고, Google은 표시할 최적의 텍스트를 결정할 수 없게 됩니다. |

| 권장 속성 | |
| --- | --- |
| `author` | `Person` 또는 `Organization` 답변 작성자에 관한 정보입니다. Google에서 다양한 기능을 갖춘 작성자를 이해할 수 있도록 [작성자 마크업 권장사항](https://developers.google.com/search/docs/appearance/structured-data/article?hl=ko#author-bp)을 따르는 것이 좋습니다.  구조화된 [기사](https://developers.google.com/search/docs/appearance/structured-data/articl?hl=ko#article-types) 및 [프로필 페이지](https://developers.google.com/search/docs/appearance/structured-data/profile-page?hl=ko) 데이터에서 지원되는 속성을 가이드로 사용하여 작성자에게 적합한 속성을 최대한 많이 포함하세요. |
| `author.url` | `URL`  답변 작성자를 고유하게 식별하는 웹페이지 링크로 Q&A 웹사이트의 프로필 페이지일 가능성이 높습니다. [구조화된 프로필 페이지 데이터](https://developers.google.com/search/docs/appearance/structured-data/profile-page?hl=ko)를 사용하여 페이지를 마크업하는 것이 좋습니다. |
| `comment` | `Comment`  답변과 관련된 댓글로 일반적으로 답변에 관한 설명 또는 토론입니다(해당하는 경우). |
| `commentCount` | `Integer`  이 답변에 대한 댓글 수입니다(해당하는 경우). 이는 댓글 마크업에 모두 표시되지 않는 경우에 특히 유용합니다. |
| `dateModified` | `DateTime`  [ISO 8601 형식](https://wikipedia.org/wiki/ISO_8601)으로 답변이 수정된 날짜와 시간입니다(해당하는 경우). |
| `datePublished` | `DateTime`  [ISO 8601 형식](https://wikipedia.org/wiki/ISO_8601)으로 질문에 답한 날짜와 시간입니다. |
| `digitalSourceType` | `IPTCDigitalSourceEnumeration`  `digitalSourceType` 속성은 콘텐츠와 연결된 디지털 소스의 유형을 나타냅니다(해당하는 경우). 이 속성은 사람과 AI 또는 기타 머신 생성 콘텐츠를 구분하는 데 특히 유용합니다. Google은 다음 값을 지원합니다.   * `TrainedAlgorithmicMediaDigitalSource`: 학습된 모델(예: LLM)에서 생성된 콘텐츠를 나타냅니다. * `AlgorithmicMediaDigitalSource`: 자동 답장 봇과 같은 더 간단한 알고리즘 프로세스로 생성된 콘텐츠를 나타냅니다.   이 속성을 지정하지 않으면 Google에서는 콘텐츠가 사람이 생성한 것으로 간주합니다. |
| `image` | `ImageObject` 또는 `URL`  답변에 포함된 인라인 이미지입니다(해당하는 경우). 이미지가 없는 경우 이 필드에 기본, 아이콘, 플레이스홀더, 작성자 이미지를 포함하지 마세요. |
| `upvoteCount` | `Integer` 이 답변이 받은 총 투표수입니다(해당하는 경우). 페이지에서 찬성 투표와 반대 투표를 지원하는 경우, `upvoteCount` 값은 찬성수와 반대수를 모두 나타내는 하나의 집계값으로 설정하세요. 예를 들어 찬성수가 5이고 반대수가 2인 경우, `upvoteCount`에 사용되는 집계값은 3입니다. 찬성수가 5이고 반대수는 지원되지 않는 경우 `upvoteCount` 값은 5입니다. |
| `url` | `URL` 이 답변에 직접 연결된 URL입니다. 예: `https://www.examplesite.com/question#answer1` 사용자가 클릭을 통해 사이트에 연결되었을 때 만족스러운 경험을 할 수 있도록 각 답변에 URL을 제공하는 것이 **좋습니다**. |
| `video` | `VideoObject` 또는 `URL`  질문 내의 인라인 동영상입니다(해당하는 경우). |

### `Comment`

`Comment` 유형은 질문이나 답변이 아닌 질문이나 답변에 관한 설명이나 토론을 설명하는 옵션으로 사용할 수 있습니다. `Question` 또는 `Answer` 내에서 `Comments`를 `comment` 속성 값으로 정의합니다.

`Comment`의 전체 정의는 <https://schema.org/Comment>에서 확인할 수 있습니다.

| 필수 속성 | |
| --- | --- |
| `text` | `Text` 댓글의 전체 텍스트입니다. 일부만 마크업되어 있는 경우 Google에서 표시할 최적의 텍스트를 결정하지 못할 수 있습니다. |

| 권장 속성 | |
| --- | --- |
| `author` | `Person` 또는 `Organization` 댓글 작성자에 관한 정보입니다. Google이 여러 기능에서 작성자를 이해할 수 있도록 [작성자 마크업 권장사항](https://developers.google.com/search/docs/appearance/structured-data/article?hl=ko#author-bp)을 따르는 것이 좋습니다.  구조화된 [기사](https://developers.google.com/search/docs/appearance/structured-data/articl?hl=ko#article-types) 및 [프로필 페이지](https://developers.google.com/search/docs/appearance/structured-data/profile-page?hl=ko) 데이터에서 지원되는 속성을 가이드로 사용하여 작성자에게 적합한 속성을 최대한 많이 포함하세요. |
| `author.url` | `URL`  답변 작성자를 고유하게 식별하는 웹페이지 링크로 Q&A 웹사이트의 프로필 페이지일 가능성이 높습니다. [구조화된 프로필 페이지 데이터](https://developers.google.com/search/docs/appearance/structured-data/profile-page?hl=ko)를 사용하여 페이지를 마크업하는 것이 좋습니다. |
| `comment` | `Comment`  댓글에 답장하는 중첩된 대화식 댓글입니다(해당하는 경우). |
| `commentCount` | `Integer`  이 댓글에 대한 댓글 수입니다(해당하는 경우). 이는 댓글 마크업에 모두 표시되지 않는 경우에 특히 유용합니다. |
| `dateModified` | `DateTime`  [ISO 8601 형식](https://wikipedia.org/wiki/ISO_8601)으로 댓글이 수정된 날짜와 시간입니다(해당하는 경우). |
| `datePublished` | `DateTime`  [ISO 8601 형식](https://wikipedia.org/wiki/ISO_8601)으로 댓글이 작성된 날짜와 시간입니다. |
| `digitalSourceType` | `IPTCDigitalSourceEnumeration`  `digitalSourceType` 속성은 콘텐츠와 연결된 디지털 소스의 유형을 나타냅니다(해당하는 경우). 이 속성은 사람과 AI 또는 기타 머신 생성 콘텐츠를 구분하는 데 특히 유용합니다. Google은 다음 값을 지원합니다.   * `TrainedAlgorithmicMediaDigitalSource`: 학습된 모델(예: LLM)에서 생성된 콘텐츠를 나타냅니다. * `AlgorithmicMediaDigitalSource`: 자동 답장 봇과 같은 더 간단한 알고리즘 프로세스로 생성된 콘텐츠를 나타냅니다.   이 속성을 지정하지 않으면 Google에서는 콘텐츠가 사람이 생성한 것으로 간주합니다. |
| `image` | `ImageObject` 또는 `URL`  댓글에 포함된 인라인 이미지입니다(해당하는 경우). 이미지가 없는 경우 이 필드에 기본, 아이콘, 플레이스홀더, 작성자 이미지를 포함하지 마세요. |
| `video` | `VideoObject` 또는 `URL`  댓글 내의 인라인 동영상입니다(해당하는 경우). |

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
