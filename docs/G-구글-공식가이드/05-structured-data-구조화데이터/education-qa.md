# 구조화된 교육 Q&A (Quiz,Question,Answer) 데이터

> **출처(Source):** https://developers.google.com/search/docs/appearance/structured-data/education-qa?hl=ko
> **저작자(Attribution):** Google
> **라이선스(License):** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
> 이 문서는 Google 검색 센터 문서를 Markdown으로 변환한 사본입니다.
> 원문의 최신 내용은 위 출처 링크를 확인하세요.

---

# 구조화된 교육 Q&A (`Quiz`, `Question`, `Answer`) 데이터

플래시카드 페이지에 구조화된 `Quiz` 데이터를 추가하여 학생들이 교육 관련 질문에 대한 답을 더 쉽게 찾도록 도울 수 있습니다. 구조화된 데이터를 추가하면 콘텐츠가 Google 검색결과, Google 어시스턴트, Google 렌즈 검색결과의 Q&A 캐러셀에 표시될 수 있습니다.

![교육 Q&A 리치 결과 예시](https://developers.google.com/static/search/docs/images/education-qa-rich-result.png?hl=ko)

교육 Q&A 캐러셀을 사용할 수 있는 페이지 유형은 다음과 같습니다.

* **플래시카드 페이지**: 일반적으로 한쪽에는 질문, 다른 쪽에는 답변이 표시된 플래시카드가 있는 페이지입니다. 플래시카드 페이지를 마크업하려면 이 가이드에서 [교육 Q&A 스키마를 추가하는 방법](#add-structured-data)을 알아보세요.
* **단일 Q&A 페이지**: 질문은 1개밖에 없으며 사용자가 제출한 답변이 이어지는 페이지입니다. 단일 Q&A 페이지를 마크업하려면 [`QAPage` 마크업](https://developers.google.com/search/docs/appearance/structured-data/qapage?hl=ko)을 추가하세요.

## 기능 제공 여부

교육 Q&A 캐러셀은 데스크톱 및 모바일에서 교육 관련 주제를 검색할 때만 사용할 수 있습니다. 예를 들어 "the measure of
three angles of a quadrilateral are 80 90 and 103 degrees" 또는 "the
ratio of surface energy to surface area is" 같은 쿼리를 검색해 보세요.

교육 Q&A 캐러셀은 다음 언어 및 지역에서 사용 가능합니다.

| 언어 | 사용 가능한 지역 |
| --- | --- |
| 영어 | Google 검색이 지원되는 모든 지역 |
| 포르투갈어 | Google 검색이 지원되는 모든 지역 |
| 스페인어 | 멕시코 |
| 베트남어 | Google 검색이 지원되는 모든 지역 |

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

다음은 구조화된 교육 Q&A 데이터가 포함된 플래시카드 페이지의 예입니다.


  

```
<html>
  <head>
    <title>Cell Transport</title>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org/",
      "@type": "Quiz",
      "about": {
        "@type": "Thing",
        "name": "Cell Transport"
      },
      "educationalAlignment": [
        {
          "@type": "AlignmentObject",
          "alignmentType": "educationalSubject",
          "targetName": "Biology"
        }
      ],
      "hasPart": [
        {
          "@context": "https://schema.org/",
          "@type": "Question",
          "eduQuestionType": "Flashcard",
          "text": "This is some fact about receptor molecules.",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "receptor molecules"
          }
        },
        {
          "@context": "https://schema.org/",
          "@type": "Question",
          "eduQuestionType": "Flashcard",
          "text": "This is some fact about the cell membrane.",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "cell membrane"
          }
        }
      ]
    }
    </script>
  </head>
</html>
```

## 가이드라인

페이지가 교육 Q&A 리치 결과에 표시되려면 다음 가이드라인을 따라야 합니다.

* [구조화된 데이터 일반 가이드라인](https://developers.google.com/search/docs/appearance/structured-data/sd-policies?hl=ko)
* [검색 Essentials](https://developers.google.com/search/docs/essentials?hl=ko)
* [기술 가이드라인](#technical-guidelines)
* [콘텐츠 가이드라인](#content-guidelines)

### 기술 가이드라인

* 가능하면 가장 상세한 리프 페이지에 구조화된 데이터를 배치합니다. 질문이 없는 페이지에 구조화된 데이터를 추가하지 않습니다.
* 모든 질문은 `eduQuestionType` 속성에 `Flashcard` 값을 사용해야 합니다.
  다른 질문 유형이 포함된 페이지에서는 교육 Q&A 캐러셀을 사용할 수 없습니다.
* Googlebot이 [사이트를 효율적으로 크롤링](https://developers.google.com/search/docs/crawling-indexing/troubleshoot-crawling-errors?hl=ko#improve_crawl_efficiency)할 수 있는지 확인하세요.
* 사이트의 질문은 즉시 사용자에게 표시되어야 합니다. 즉, 질문이 데이터 파일이나 PDF에만 저장되어 있어서는 안 됩니다.
* 페이지에 질문이 하나뿐이고 사용자가 여러 개의 답변을 제출한 경우 대신 [`QAPage` 마크업](https://developers.google.com/search/docs/appearance/structured-data/qapage?hl=ko)을 사용하세요.

### 콘텐츠 가이드라인

교육 Q&A 콘텐츠 가이드라인은 사용자에게 관련성 있는 학습 리소스를 제공하기 위해 마련되었습니다. 가이드라인을 위반하는 콘텐츠가 발견되면 Google에서는 [직접 조치](https://support.google.com/webmasters/answer/9044175?hl=ko)를 취하거나 콘텐츠를 Google의 교육 Q&A 리치 결과에 표시하지 않는 등 적절하게 대응합니다.

* 교육 Q&A 페이지는 [Q&A 페이지와 동일한 콘텐츠 가이드라인](https://developers.google.com/search/docs/appearance/structured-data/qapage?hl=ko#content-guidelines)을 따라야 합니다.
* 페이지에는 교육과 관련된 질문과 답변이 포함되어야 합니다. 페이지에 질문과 답변 쌍이 하나 이상 있어야 하며, 답변이 사용자의 질문과 관련이 있고 질문에 답해야 합니다.
* 이 기능을 통하여 교육 Q&A 페이지의 정확성과 품질을 제공할 책임은 작성자에게 있습니다. 품질 및 교육적 검토 절차에 따라 일정량의 콘텐츠가 정확하지 않은 것으로 확인되면 문제가 해결될 때까지 이 기능에서 Q&A 페이지 전체 또는 일부를 사용하지 못하게 될 수 있습니다.

## 교육 표준 마크업

학습 표준은 학년마다 학생들이 알고 있어야 하는 내용과 할 수 있는 작업에 관한
학습 목표입니다. 학습 표준에는 콘텐츠 링크, 학습 진행 과정의 일부로 구성 등
여러 가지 사용 사례가 포함됩니다. 온라인 학습 자료와 관련된 표준([`educationalAlignment`](#educational-alignment)
필드 아래에 있음)을 마크업하면
Google에서 이러한 표준에 따라 학습 콘텐츠를 검색하는 사용자에게
가장 유용한 방식으로 정보를 표시하고 정리하는 데 도움이 됩니다. 다음은 스키마의 대략적인 개요입니다.

다음은 표준의 몇 가지 예입니다.

* Common Core State Standards(CCSS)
* Texas Essential Knowledge and Skills(TEKS)
* Virginia Standards of Learning(SOL)
* BC Performance Standards
* Alberta Programs of Studies
* The Australian Curriculum(ACARA)
* The Victorian Curriculum(F-10)
* UK National Curriculum

## 구조화된 데이터 유형 정의

리치 결과에 콘텐츠를 표시하려면 필수 속성이 있어야 합니다. 권장 속성을 통해 콘텐츠에 관한 더 많은 정보를 추가하여 더 나은 사용자 환경을 제공할 수 있습니다.

### 퀴즈

`Quiz`는 하나 이상의 플래시카드 세트로, 일반적으로 동일한 개념이나 주제를 다룹니다.

[퀴즈](https://schema.org/Quiz)의 전체 정의는 schema.org에서 확인하세요.
Google에서 지원하는 속성은 다음과 같습니다.

| 필수 속성 | |
| --- | --- |
| `hasPart` | `Question`  퀴즈의 특정 플래시카드 질문에 관한 중첩 정보입니다. `hasPart` 속성 하나를 사용하여 플래시카드를 하나씩 표시하세요.  여러 장의 플래시카드를 포함하려면 이 속성을 반복합니다.     ``` {   "@type": "Quiz",   "hasPart": {     "@type": "Question"   } } ``` |

| 권장 속성 | |
| --- | --- |
| `about` | `Thing`  `Quiz`에 담겨 있는 기본 개념에 관한 중첩 정보입니다.     ``` {   "@type": "Quiz",   "about": {     "@type": "Thing"   } } ``` |
| `about.name` | `Text`  `Quiz`에 담겨 있는 기본 개념에 관한 중첩 정보입니다. 이 속성에는 여러 개의 항목이 허용됩니다.     ``` {   "@type": "Quiz",   "about": {     "@type": "Thing",     "name": "Cell transport"   } } ``` |
| `educationalAlignment` | `AlignmentObject`  퀴즈가 확립된 교육 프레임워크와 동일 선상에 있는 부분입니다. 이 속성을 반복하여 퀴즈를 학습 분야, 대상 학년 또는 [교육 표준](#mark-up-educational-standards)에 맞출 수 있습니다.     ``` {   "@type": "Quiz",   "educationalAlignment": [] } ``` |
| `educationalAlignment.alignmentType` | `Text`  학습 리소스와 퀴즈 프레임워크 노드 간의 일치 카테고리입니다. Google 검색은 [LRMI 표준](https://www.dublincore.org/specifications/lrmi/lrmi_1/)을 사용합니다.  `alignmentType` 속성을 반복하여 학습 분야, 대상 학년 또는 교육 표준을 지정합니다.   * 퀴즈의 학습 분야 또는 영역을 지정하려면 `alignmentType` 속성을 `educationalSubject` 값으로 설정하세요. * 퀴즈의 대상 학년 또는 교육 표준을 지정하려면 `alignmentType` 속성을 `educationalLevel` 값으로 설정하세요.   `educationalSubject` 및 `educationalLevel`을 둘 다 지정하는 방법은 다음과 같습니다.     ``` {   "@type": "Quiz",   "educationalAlignment": [      {        "@type": "AlignmentObject",        "alignmentType": "educationalSubject",        "targetName": "Biology"      },      {        "@type": "AlignmentObject",        "alignmentType": "educationalLevel",        "targetName": "Fifth grade"      }    ] } ``` |
| `educationalAlignment.targetName` | `Text`  확립된 교육 프레임워크의 노드 이름입니다. 예: '7학년: 세포 구조'     ``` {   "@type": "Quiz",   "educationalAlignment": [      {        "@type": "AlignmentObject",        "targetName": "Grade 7: Cell Structure"      }   ] } ``` |

### 질문

각 질문은 [`Quiz`](https://schema.org/Quiz)의 `hasPart` 속성 아래에 중첩된 플래시카드 하나에 해당합니다. 이 `Question` 요구사항은 [`QAPage` 질문 요구사항](https://developers.google.com/search/docs/appearance/structured-data/qapage?hl=ko#question)과 다릅니다.

[질문](https://schema.org/Question)의 전체 정의는 schema.org에서 확인할 수 있습니다. Google에서 지원하는 속성은 다음과 같습니다.

| 필수 속성 | |
| --- | --- |
| `acceptedAnswer` | `Answer`  플래시카드에 대한 답변의 전체 텍스트입니다. `Question` 유형 1개당 하나의 `acceptedAnswer` 속성만 있어야 합니다.     ``` {   "@type": "Question",   "acceptedAnswer": {     "@type": "Answer",     "text": "cell membranes"   } } ``` |
| `eduQuestionType` | `Text`  질문의 유형입니다. 고정값인 `Flashcard`를 사용해야 합니다.     ``` {   "@type": "Question",   "eduQuestionType": "Flashcard” } ``` |
| `text` | `Text`  플래시카드 질문의 전체 텍스트입니다.     ``` {   "@type": "Question",   "text": "A protein on the surface of HIV can attach to proteins on the surface of healthy human cells. What are the attachment sites on the surface of the cells known as?" } ``` |

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
