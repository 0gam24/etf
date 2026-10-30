# 구조화된 영화 캐러셀(Movie) 데이터

> **출처(Source):** https://developers.google.com/search/docs/appearance/structured-data/movie?hl=ko
> **저작자(Attribution):** Google
> **라이선스(License):** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
> 이 문서는 Google 검색 센터 문서를 Markdown으로 변환한 사본입니다.
> 원문의 최신 내용은 위 출처 링크를 확인하세요.

---

# 구조화된 영화 캐러셀(`Movie`) 데이터

![Google 검색에서 영화 리치 결과가 어떻게 표시되는지 보여주는 그림. 사용자가 특정 영화를 살펴보고 선택할 수 있도록 동일한 웹사이트의 세 가지 영화를 캐러셀 형식으로 표시](https://developers.google.com/static/search/docs/images/movie-rich-result.png?hl=ko)

사용자가 Google 검색에서 새로운 방식으로 영화를 살펴볼 수 있도록 구조화된 데이터를 사용하여 영화 목록을 마크업하세요. 영화 제목, 감독 및 영화 이미지 등 영화에 관한 세부정보를 제공할 수 있습니다. 영화 캐러셀은 휴대기기에서만 지원됩니다.

**지식 패널에 표시되는 특정 영화의 소유권을 주장하려고 하시나요?** [Google에서 인증받기](https://support.google.com/knowledgepanel/answer/7534902?hl=ko)
  
**시청하기 버튼을 사용 설정하려고 하시나요?** [미디어 작업 시작하기](https://developers.google.com/actions/media?hl=ko)

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

### 요약 페이지 + 여러 개의 전체 세부정보 페이지

요약 페이지에는 목록에 포함된 각 항목에 관한 간단한 설명이 있으며, 각 설명은 특정 항목에만 초점을 맞추는 별도의 세부정보 페이지로 연결됩니다. 다음은 JSON-LD 형식으로 된 요약 영화 목록의 예입니다.

```
<html>
  <head>
    <title>The Best Movies from the Oscars - 2024</title>
    <script type="application/ld+json">
    {
      "@context":"https://schema.org",
      "@type":"ItemList",
      "itemListElement":[
        {
          "@type":"ListItem",
          "position":1,
          "url":"https://example.com/a-star-is-born.html"
        },
        {
          "@type":"ListItem",
          "position":2,
          "url":"https://example.com/bohemian-rhapsody.html"
        },
        {
          "@type":"ListItem",
          "position":3,
          "url":"https://example.com/black-panther.html"
        }
      ]
    }
    </script>
  </head>
  <body>
  </body>
</html>
```

### 단일 올인원 페이지 목록

단일 올인원 페이지 목록은 각 항목의 전체 텍스트를 포함한 모든 목록 정보를 호스팅합니다.
다음은 JSON-LD 형식으로 된 단일 올인원 영화 목록의 예입니다.

```
<html>
  <head>
    <title>The Best Movies from the Oscars - 2024</title>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "item": {
            "@type": "Movie",
            "url": "https://example.com/2024-best-picture-noms#a-star-is-born",
            "name": "A Star Is Born",
            "image": "https://example.com/photos/6x9/photo.jpg",
            "dateCreated": "2024-10-05",
            "director": {
                "@type": "Person",
                "name": "Bradley Cooper"
              },
            "review": {
              "@type": "Review",
              "reviewRating": {
                "@type": "Rating",
                "ratingValue": 5
              },
              "author": {
                "@type": "Person",
                "name": "John D."
              }
            },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": 90,
                "bestRating": 100,
                "ratingCount": 19141
              }
            }
          },
        {
          "@type": "ListItem",
          "position": 2,
          "item": {
            "@type": "Movie",
            "name": "Bohemian Rhapsody",
            "url": "https://example.com/2024-best-picture-noms#bohemian-rhapsody",
            "image": "https://example.com/photos/6x9/photo.jpg",
            "dateCreated": "2024-11-02",
            "director": {
                "@type": "Person",
                "name": "Bryan Singer"
              },
            "review": {
              "@type": "Review",
              "reviewRating": {
                "@type": "Rating",
                "ratingValue": 3
              },
              "author": {
                "@type": "Person",
                "name": "Vin S."
              }
            },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": 61,
                "bestRating": 100,
                "ratingCount": 21985
              }
            }
          },
        {
          "@type": "ListItem",
          "position": 3,
          "item": {
            "@type": "Movie",
            "name": "Black Panther",
            "url": "https://example.com/2024-best-picture-noms#black-panther",
            "image": "https://example.com/photos/6x9/photo.jpg",
            "dateCreated": "2024-02-16",
            "director": {
                "@type": "Person",
                "name": "Ryan Coogler"
              },
            "review": {
              "@type": "Review",
              "reviewRating": {
                "@type": "Rating",
                "ratingValue": 2
              },
              "author": {
                "@type": "Person",
                "name": "Trevor R."
              }
            },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": 96,
                "bestRating": 100,
                "ratingCount": 88211
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

영화 캐러셀에 표시되려면 다음 가이드라인을 준수해야 합니다.

**경고:** 페이지의 일부 마크업이 구조화된 데이터 가이드라인을 벗어난 기술을 사용하는 것으로 감지되면 Google에서 사이트에 [직접 조치](https://support.google.com/webmasters/answer/2604824?hl=ko)를 취할 수 있습니다.

* [캐러셀 가이드라인](https://developers.google.com/search/docs/appearance/structured-data/carousel?hl=ko#guidelines)
* [검색 Essentials](https://developers.google.com/search/docs/essentials?hl=ko)
* [구조화된 데이터 일반 가이드라인](https://developers.google.com/search/docs/appearance/structured-data/sd-policies?hl=ko)

## 구조화된 데이터 유형 정의

리치 결과에 콘텐츠를 표시하려면 필수 속성이 있어야 합니다. 권장 속성을 통해 콘텐츠에 관한 정보를 추가하여 더욱 만족스러운 사용자 환경을 제공할 수 있습니다.

### `Movie`

캐러셀 객체에 [캐러셀 속성](https://developers.google.com/search/docs/appearance/structured-data/carousel?hl=ko) 외에 다음 속성을 정의하세요.

`Movie`의 전체 정의는 [schema.org/Movie](https://schema.org/Movie)에서 확인할 수 있습니다.

Google에서 지원하는 속성은 다음과 같습니다.

| 필수 속성 | |
| --- | --- |
| `image` | `URL` 또는 `ImageObject` 영화를 나타내는 이미지입니다. 추가 이미지 가이드라인은 다음과 같습니다.   * 이미지 URL은 [크롤링 및 색인 생성](https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps?hl=ko)이 가능해야 합니다. * 이미지는 마크업된 콘텐츠를 나타내야 합니다. * 이미지는 .jpg, .png 또는 .gif 형식이어야 합니다. * 이미지는 고해상도이면서 가로세로 비율이 6:9여야 합니다. 가로세로 비율이 6:9에 가까운 이미지는 Google에서 자를 수 있지만, 이 비율에서 크게 벗어나는 경우 기능을 사용할 수 없습니다. |
| `name` | `Text` 영화의 이름입니다. |

| 권장 속성 | |
| --- | --- |
| `aggregateRating` | `AggregateRating`  영화에 부여된 평균 리뷰 점수의 주석입니다. [리뷰 스니펫 가이드라인](https://developers.google.com/search/docs/appearance/structured-data/review-snippet?hl=ko#guidelines) 및 필수/권장 [AggregateRating 속성](https://developers.google.com/search/docs/appearance/structured-data/review-snippet?hl=ko#aggregate-rating) 목록을 따르세요. |
| `dateCreated` | `Date` 또는 `DateTime` 영화가 개봉된 날짜입니다. |
| `director` | `Person` 영화의 감독입니다. 예를 들면 다음과 같습니다.     ``` "director": {   "@type": "Person",   "name": "Bradley Cooper" } ``` |
| `review` | `Review`  영화의 중첩된 `Review`입니다. [리뷰 스니펫 가이드라인](https://developers.google.com/search/docs/appearance/structured-data/review-snippet?hl=ko#guidelines) 및 필수/권장 [리뷰 속성](https://developers.google.com/search/docs/appearance/structured-data/review-snippet?hl=ko#review-properties)의 목록을 따르세요. |

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
