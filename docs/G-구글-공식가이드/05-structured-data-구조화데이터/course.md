# 구조화된 교육과정 목록(Course) 데이터

> **출처(Source):** https://developers.google.com/search/docs/appearance/structured-data/course?hl=ko
> **저작자(Attribution):** Google
> **라이선스(License):** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
> 이 문서는 Google 검색 센터 문서를 Markdown으로 변환한 사본입니다.
> 원문의 최신 내용은 위 출처 링크를 확인하세요.

---

# 구조화된 교육과정 목록(`Course`) 데이터

![Google 검색에서 교육과정 목록이 어떻게 표시되는지 보여주는 그림. 사용자가 특정 교육과정을 살펴보고 선택할 수 있도록 동일한 웹사이트의 세 가지 교육과정을 목록 형식으로 표시](https://developers.google.com/static/search/docs/images/course-carousel-rich-result.png?hl=ko)

구조화된 과정 목록 데이터를 사용하면 예비 학생이 Google 검색을 통해 과정을 찾을 수 있도록 과정에 관한 자세한 정보를 제공할 수 있습니다. 과정 이름, 제공하는 사람, 간단한 설명을 포함한 세부정보를 제공할 수 있습니다.

## 기능 제공 여부

과정 목록 리치 결과는 Google 검색이 지원되는 모든 지역에서 영어로 제공됩니다.

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

### 단일 과정 세부정보 페이지

다음은 단일 과정 세부정보 페이지의 예입니다. 이 페이지는 [`ItemList` 마크업](#item-list)이 포함된
[요약 페이지](https://developers.google.com/search/docs/appearance/structured-data/carousel?hl=ko#summary-page)와 쌍을 이루어야 합니다.


리치 결과 테스트에서 다른 리치 결과 유형의 오류가 표시될 수 있습니다. 교육과정 목록 기능을 사용하려면 **교육과정 목록 항목** 섹션에 있는 경고나 오류에 주의하세요. 다른 오류는 무시해도 됩니다

```
<html>
  <head>
    <title>Introduction to Computer Science and Programming</title>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Course",
      "name": "Introduction to Computer Science and Programming",
      "description": "Introductory CS course laying out the basics.",
      "provider": {
        "@type": "Organization",
        "name": "University of Technology - Eureka",
        "sameAs": "https://www.example.com"
      }
    }
    </script>
  </head>
  <body>
  </body>
</html>
```

### 단일 올인원 페이지

다음은 [단일 올인원 페이지](https://developers.google.com/search/docs/appearance/structured-data/carousel?hl=ko#all-in-one)의 예입니다.
이 페이지 설정에는 목록 마크업과 각 과정의 세부정보가 동일한 페이지에 모두 포함되어 있습니다.


리치 결과 테스트에서 다른 리치 결과 유형의 오류가 표시될 수 있습니다. 교육과정 목록 기능을 사용하려면 **교육과정 목록 항목** 및 **캐러셀** 섹션에 있는 경고나 오류에 주의하세요. 다른 오류는 무시해도 됩니다

```
<html>
  <head>
    <title>Computer Science Courses</title>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "item": {
            "@type": "Course",
            "url":"https://www.example.com/courses#intro-to-cs",
            "name": "Introduction to Computer Science and Programming",
            "description": "This is an introductory CS course laying out the basics.",
            "provider": {
              "@type": "Organization",
              "name": "University of Technology - Example",
              "sameAs": "https://www.example.com"
           }
          }
        },
        {
          "@type": "ListItem",
          "position": 2,
          "item": {
            "@type": "Course",
            "url":"https://www.example.com/courses#intermediate-cs",
            "name": "Intermediate Computer Science and Programming",
            "description": "This is a CS course that builds on the basics learned in the Introduction course.",
            "provider": {
              "@type": "Organization",
              "name": "University of Technology - Example",
              "sameAs": "https://www.example.com"
           }
         }
        },
        {
          "@type": "ListItem",
          "position": 3,
          "item": {
            "@type": "Course",
            "url":"https://www.example.com/courses#advanced-cs",
            "name": "Advanced Computer Science and Programming",
            "description": "This CS course covers advanced programming principles.",
            "provider": {
              "@type": "Organization",
              "name": "University of Technology - Eureka",
              "sameAs": "https://www.example.com"
           }
          }
        }
      ]
    }
    </script>
  </head>
  <body>
  </body>
</html>
```

## 가이드라인

교육과정 목록에 표시되려면 다음 가이드라인을 준수해야 합니다.

**경고:** Google에서는 이 가이드라인을 하나 이상 위반하는 사이트에 [직접 조치](https://support.google.com/webmasters/answer/2604824?hl=ko)를 취할 수 있습니다. 문제가 되는 부분을 해결하고 나면 사이트 [재검토](https://support.google.com/webmasters/answer/35843?hl=ko) 요청을 제출할 수 있습니다.

* [콘텐츠 가이드라인](#content-guidelines)
* [기술 가이드라인](#technical-guidelines)
* [캐러셀 가이드라인](https://developers.google.com/search/docs/appearance/structured-data/carousel?hl=ko#guidelines)
* [검색 Essentials](https://developers.google.com/search/docs/essentials?hl=ko)
* [구조화된 데이터 일반 가이드라인](https://developers.google.com/search/docs/appearance/structured-data/sd-policies?hl=ko)

### 콘텐츠 가이드라인

* '특정 과목 또는 주제의 강좌, 강의, 모듈을 포함하는 커리큘럼 시리즈 또는 단위'라는 교육과정의 정의를 충족하는 교육용 콘텐츠에만 `Course` 마크업을 사용하세요.
* 과정에는 특정 과목 또는 주제의 지식이나 기술과 관련된 명확한 교육 성과가 있어야 하며, 한 명 이상의 강사가 지도하고 학생 명부가 있어야 합니다.
* '천문학의 날'과 같이 일반적인 공개 이벤트는 과정이 아니며, 2분 길이의 한 편짜리 '샌드위치 만들기 동영상'도 과정이 아닙니다.

### 기술 가이드라인

과정을 3개 이상 마크업해야 합니다. 과정은 별도의
[세부정보 페이지](https://developers.google.com/search/docs/appearance/structured-data/carousel?hl=ko#details-page) 또는
[올인원 페이지](https://developers.google.com/search/docs/appearance/structured-data/carousel?hl=ko#all-in-one)에 표시될 수 있습니다.

[캐러셀 마크업](https://developers.google.com/search/docs/appearance/structured-data/carousel?hl=ko#details-page)을
[요약 페이지](https://developers.google.com/search/docs/appearance/structured-data/carousel?hl=ko#summary) 또는
[올인원 페이지](https://developers.google.com/search/docs/appearance/structured-data/carousel?hl=ko#all-in-one)에 추가해야 합니다.

각 교육과정에는 유효한 [이름](https://schema.org/name)과
[제공자](https://schema.org/provider) 속성이 있어야 합니다. 예를 들어 다음과 같은 이름은 유효하지 않습니다.

* 홍보 문구: '세계 최고의 학교'
* 교육과정 제목에 가격 포함: '우쿨렐레 배우기 - 단돈 3만 원!'
* 제목에 과정이 아닌 내용 사용: '이 수업을 통해 수익을 빠르게 올리세요!'
* 할인 또는 구매 안내: '이 분야의 전문가들이 공유하는 자신만의 비법 - 25% 할인'

## 구조화된 데이터 유형 정의

리치 결과에 콘텐츠를 표시하려면 필수 속성이 있어야 합니다.
권장 속성을 통해 콘텐츠에 관한 정보를 추가하여 더 만족스러운 사용자 환경을 제공할 수 있습니다.

### `Course`

과정을 3개 이상 마크업하려면 다음 속성을 사용하세요. 과정은 별도의
[세부정보 페이지](https://developers.google.com/search/docs/appearance/structured-data/carousel?hl=ko#details-page) 또는
[올인원 페이지](https://developers.google.com/search/docs/appearance/structured-data/carousel?hl=ko#all-in-one)에 표시될 수 있습니다.

`Course`의 전체 정의는 [schema.org/Course](https://schema.org/Course)에서 확인할 수 있습니다.
Google에서 지원하는 속성은 다음과 같습니다.

| 필수 속성 | |
| --- | --- |
| `description` | `Text`  교육과정에 관한 설명입니다. 60자(영문기준)까지 표시됩니다. |
| `name` | `Text`  교육과정의 제목입니다. |

| 권장 속성 | |
| --- | --- |
| `provider` | `Organization`  교육과정의 소스 콘텐츠를 게시하는 조직입니다. 예: UC Berkeley |

### `ItemList`

[`Course` 속성](#course) 외에 다음 속성을 추가하여
목록을 지정합니다. 이러한 속성은
[요약 페이지](https://developers.google.com/search/docs/appearance/structured-data/carousel?hl=ko#summary) 또는
[올인원 페이지](https://developers.google.com/search/docs/appearance/structured-data/carousel?hl=ko#all-in-one)에 추가할 수 있습니다.

`ItemList`의 전체 정의는 [schema.org/ItemList](https://schema.org/ItemList)에서 확인할 수 있습니다.

| 필수 속성 | |
| --- | --- |
| `itemListElement` | `ListItem`  단일 항목 페이지의 주석입니다. |
| `ListItem.position` | `Integer`  목록에서 항목 페이지의 순서입니다. |
| `ListItem.url` | `URL`  항목 페이지의 표준 URL. 모든 항목에 고유한 URL이 있어야 합니다. |

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
