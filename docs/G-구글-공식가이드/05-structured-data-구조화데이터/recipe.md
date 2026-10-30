# 구조화된 레시피(Recipe,HowTo,ItemList) 데이터

> **출처(Source):** https://developers.google.com/search/docs/appearance/structured-data/recipe?hl=ko
> **저작자(Attribution):** Google
> **라이선스(License):** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
> 이 문서는 Google 검색 센터 문서를 Markdown으로 변환한 사본입니다.
> 원문의 최신 내용은 위 출처 링크를 확인하세요.

---

# 구조화된 레시피(`Recipe`, `HowTo`, `ItemList`) 데이터

구조화된 데이터로 Google에 레시피 정보를 제공하면 사용자가 레시피 콘텐츠를 검색하는 데 도움이 됩니다.
리뷰 작성자 평점, 조리 및 준비 시간, 영양 정보와 같은 정보를 제공하면 Google에서는 레시피를 더욱 효과적으로 파악하고 사용자에게 흥미로운 방식으로 표시할 수 있습니다. 레시피는 Google 검색결과와 Google 이미지에 표시될 수 있습니다.

![Google 검색에서 레시피 리치 결과가 어떻게 표시되는지 보여주는 그림 자세한 레시피 조리 시간, 이미지, 리뷰 정보와 함께 다양한 웹사이트의 4가지 리치 결과를 포함합니다.](https://developers.google.com/static/search/docs/images/recipe-rich-result-google-search.png?hl=ko)
![Google 이미지에서 레시피가 어떻게 표시되는지 보여주는 그림. 다양한 음식을 보여주는 6개의 이미지 결과가 있으며, 그 중 3개의 결과에는 사용자에게 레시피를 표시하는 레시피 배지가 포함되어 있습니다](https://developers.google.com/static/search/docs/images/recipes-in-google-images.png?hl=ko)

콘텐츠 마크업 방식에 따라 레시피에서 다음 개선사항을 사용할 수 있습니다.

| **레시피 개선사항** | |
| --- | --- |
| **레시피 호스트 캐러셀**: [구조화된 `ItemList` 데이터](#item-list)를 추가하여 사용자가 레시피 갤러리 페이지를 탐색할 수 있도록 합니다. | Google 검색에서 레시피 호스트 캐러셀이 어떻게 표시되는지 보여주는 그림. 사용자가 특정 레시피를 살펴보고 선택할 수 있도록 동일한 웹사이트의 세 가지 레시피를 캐러셀 형식으로 표시 |

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

다음은 JSON-LD 코드를 사용하는 레시피의 몇 가지 예입니다.

**참고**: 실제로 검색결과에 표시되는 모습은 다를 수 있습니다. 리치 결과 테스트에서 구조화된 데이터 미리보기를 통해 최신 레이아웃을 확인하세요.

### Google 검색의 레시피

다음은 Google 검색에 표시될 수 있는 페이지의 예입니다.

```
<html>
  <head>
    <title>Non-Alcoholic Piña Colada</title>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org/",
      "@type": "Recipe",
      "name": "Non-Alcoholic Piña Colada",
      "image": [
      "https://example.com/photos/1x1/photo.jpg",
      "https://example.com/photos/4x3/photo.jpg",
      "https://example.com/photos/16x9/photo.jpg"
      ],
      "author": {
        "@type": "Person",
        "name": "Mary Stone"
      },
      "datePublished": "2024-03-10",
      "description": "This non-alcoholic pina colada is everyone's favorite!",
      "recipeCuisine": "American",
      "prepTime": "PT1M",
      "cookTime": "PT2M",
      "totalTime": "PT3M",
      "keywords": "non-alcoholic",
      "recipeYield": "4 servings",
      "recipeCategory": "Drink",
      "nutrition": {
        "@type": "NutritionInformation",
        "calories": "120 calories"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": 5,
        "ratingCount": 18
      },
      "recipeIngredient": [
        "400ml of pineapple juice",
        "100ml cream of coconut",
        "ice"
      ],
      "recipeInstructions": [
        {
          "@type": "HowToStep",
          "name": "Blend",
          "text": "Blend 400ml of pineapple juice and 100ml cream of coconut until smooth.",
          "url": "https://example.com/non-alcoholic-pina-colada#step1",
          "image": "https://example.com/photos/non-alcoholic-pina-colada/step1.jpg"
        },
        {
          "@type": "HowToStep",
          "name": "Fill",
          "text": "Fill a glass with ice.",
          "url": "https://example.com/non-alcoholic-pina-colada#step2",
          "image": "https://example.com/photos/non-alcoholic-pina-colada/step2.jpg"
        },
        {
          "@type": "HowToStep",
          "name": "Pour",
          "text": "Pour the pineapple juice and coconut mixture over ice.",
          "url": "https://example.com/non-alcoholic-pina-colada#step3",
          "image": "https://example.com/photos/non-alcoholic-pina-colada/step3.jpg"
        }
      ],
      "video": {
        "@type": "VideoObject",
        "name": "How to Make a Non-Alcoholic Piña Colada",
        "description": "This is how you make a non-alcoholic piña colada.",
        "thumbnailUrl": [
          "https://example.com/photos/1x1/photo.jpg",
          "https://example.com/photos/4x3/photo.jpg",
          "https://example.com/photos/16x9/photo.jpg"
         ],
        "contentUrl": "https://www.example.com/video123.mp4",
        "embedUrl": "https://www.example.com/videoplayer?video=123",
        "uploadDate": "2024-02-05T08:00:00+08:00",
        "duration": "PT1M33S",
        "interactionStatistic": {
          "@type": "InteractionCounter",
          "interactionType": { "@type": "WatchAction" },
          "userInteractionCount": 2347
        },
        "expires": "2024-02-05T08:00:00+08:00"
       }
    }
    </script>
  </head>
  <body>
  </body>
</html>
```

### 캐러셀

다음은 구조화된 `itemList` 데이터가 포함된 레시피 요약 페이지(레시피 목록이 있는 페이지)의 예입니다. 이러한 콘텐츠는 검색결과에서 그리드로 표시될 수 있습니다.

```
<html>
  <head>
    <title>Grandma's Best Pie Recipes</title>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "url": "https://example.com/apple-pie.html"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "url": "https://example.com/blueberry-pie.html"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "url": "https://example.com/cherry-pie.html"
        }]
    }
    </script>
  </head>
  <body>
  </body>
</html>
```

## 가이드라인

마크업을 검색결과에 표시하려면 [구조화된 데이터 일반 가이드라인](https://developers.google.com/search/docs/appearance/structured-data/sd-policies?hl=ko)을 따라야 합니다.

이 정책을 위반하면 레시피가 리치 결과로 표시되지 않을 수 있지만 콘텐츠는 여전히 검색결과에 표시됩니다. [구조화된 스팸성 마크업](https://support.google.com/webmasters/answer/3498001?hl=ko)에 관해 읽어보세요.

구조화된 `Recipe` 데이터에는 다음과 같은 가이드라인이 적용됩니다.

* 특정 요리 준비에 관한 콘텐츠에는 구조화된 `Recipe` 데이터를 사용합니다. 예를 들어, '페이셜 스크럽', '파티 아이디어'는 올바른 요리 이름이 아닙니다.
* [캐러셀](https://developers.google.com/search/docs/appearance/structured-data/carousel?hl=ko) 또는 그리드에 레시피를 표시하려면 다음과 같은 가이드라인을 따라야 합니다.
  + 목록에 레시피를 요약하려면 구조화된 `ItemList` 데이터를 제공합니다.
    구조화된 레시피 데이터와 별도로 또는 함께 구조화된 `ItemList` 데이터를 제공할 수 있습니다.
  + 사이트에는 컬렉션의 모든 레시피를 나열하는 요약 페이지가 있어야 합니다. 예를 들어 사용자가 검색결과에서 요약 링크를 클릭하면 검색어와 관련된 레시피가 나열된 사이트 페이지로 올바르게 이동합니다.

## 구조화된 데이터 유형 정의

Google 검색에 콘텐츠를 리치 결과로 표시하려면 필수 속성이 있어야 합니다. 권장 속성을 통해 콘텐츠에 관한 정보를 추가하여 더욱 만족스러운 사용자 환경을 제공할 수 있습니다.

### `Recipe`

다음의 schema.org [`Recipe`](https://schema.org/Recipe) 유형 속성으로 레시피 콘텐츠를 마크업하세요. `Recipe`의 전체 정의는 [schema.org/Recipe](https://schema.org/Recipe)에서 확인할 수 있습니다.
Google에서 지원하는 속성은 다음과 같습니다.

| 필수 속성 | |
| --- | --- |
| `image` | `URL` 또는 `ImageObject`  완성된 요리의 이미지입니다.  추가 이미지 가이드라인은 다음과 같습니다.   * 이미지 URL은 크롤링 및 색인 생성이 가능해야 합니다. Google에서 내 URL에 액세스할 수 있는지 확인하려면 [URL 검사 도구](https://support.google.com/webmasters/answer/9012289?hl=ko)를 사용하세요. * 이미지는 마크업된 콘텐츠를 나타내야 합니다. * 이미지는 [Google 이미지에서 지원](https://developers.google.com/search/docs/appearance/google-images?hl=ko#supported-image-formats)되는 파일 형식이어야 합니다. * 최상의 결과를 위해서는 가로세로 비율이 16x9, 4x3, 1x1인 여러 개의 고해상도 이미지(너비와 높이의 곱이 최소 50,000픽셀)를 제공하는 것이 좋습니다.   예:     ``` "image": [   "https://example.com/photos/1x1/photo.jpg",   "https://example.com/photos/4x3/photo.jpg",   "https://example.com/photos/16x9/photo.jpg" ] ```  `Recipe` 마크업에서 `image` 속성을 지정해도 [텍스트 결과 이미지](https://developers.google.com/search/docs/appearance/visual-elements-gallery?hl=ko#text-result-image)에 선택된 이미지에는 영향을 미치지 않습니다. 텍스트 검색 결과 이미지에 맞게 최적화하려면 [이미지 검색엔진 최적화 권장사항](https://developers.google.com/search/docs/appearance/google-images?hl=ko)을 따르세요. |
| `name` | `Text`  요리의 이름입니다. |

| 권장 속성 | |
| --- | --- |
| `aggregateRating` | `AggregateRating`  항목에 지정된 평균 리뷰 점수의 주석입니다. [리뷰 스니펫 가이드라인](https://developers.google.com/search/docs/appearance/structured-data/review-snippet?hl=ko#guidelines)과 필수 및 권장 [`AggregateRating` 속성](https://developers.google.com/search/docs/appearance/structured-data/review-snippet?hl=ko#aggregated-rating-type-definition) 목록을 따르세요.  구조화된 `Recipe` 데이터가 단일 리뷰를 포함하는 경우 리뷰 작성자의 이름은 유효한 개인 또는 조직이어야 합니다. 예를 들어 '재료 50% 할인'은 유효한 리뷰 작성자 이름이 아닙니다. |
| `author` | `Person` 또는 `Organization`  레시피를 작성한 사람 또는 조직의 이름입니다. Google에서 다양한 기능을 갖춘 작성자를 가장 잘 이해할 수 있도록 [작성자 마크업 권장사항](https://developers.google.com/search/docs/appearance/structured-data/article?hl=ko#author-bp)을 따르는 것이 좋습니다. |
| `cookTime` | `Duration`  실제 조리에 걸리는 시간입니다. [ISO 8601 형식](https://en.wikipedia.org/wiki/ISO_8601)으로 나타냅니다(해당하는 경우).  항상 `prepTime`과 함께 사용하세요. |
| `datePublished` | `Date`  레시피가 게시된 날짜입니다. [ISO 8601 형식](https://en.wikipedia.org/wiki/ISO_8601)으로 나타냅니다(해당하는 경우). |
| `description` | `Text`  요리에 관한 간단한 요약 설명입니다. |
| `keywords` | `Text`  계절('여름'), 휴일('핼러윈') 또는 기타 설명('빠른', '쉬운', '정통') 등 레시피에 관한 기타 용어입니다.  **추가 가이드라인**   * 키워드 목록에서 쉼표로 여러 항목을 구분합니다. * 실제로 `recipeCategory` 또는 `recipeCuisine`인 태그는 사용하지 마세요.     **권장하지 않음**:       ```   "keywords": "dessert, American"   ```     **권장**:       ```   "keywords": "winter apple pie, nutmeg crust"   ``` |
| `nutrition.calories` | `Energy`  이 레시피 1인분의 칼로리입니다. `nutrition.calories`가 정의되어 있으면 `recipeYield`는 분량에 따라 정의되어야 합니다. |
| `prepTime` | `Duration`  요리의 재료와 작업공간을 준비하는 데 걸리는 시간입니다. [ISO 8601 형식](https://en.wikipedia.org/wiki/ISO_8601)으로 나타냅니다(해당하는 경우).  항상 `cookTime`과 함께 사용하세요. |
| `recipeCategory` | `Text`  레시피의 요리 또는 코스 유형입니다. 예: '저녁 식사', '메인 코스' 또는 '디저트', '간식' |
| `recipeCuisine` | `Text`  레시피와 관련된 지역입니다. 예: '프랑스', '지중해', '미국' |
| `recipeIngredient` | `Text`  레시피에 사용되는 재료입니다.  예:     ``` "recipeIngredient": [   "1 (15 ounce) package double crust ready-to-use pie crust",   "6 cups thinly sliced, peeled apples (6 medium)",   "3/4 cup sugar",   "2 tablespoons all-purpose flour",   "3/4 teaspoon ground cinnamon",   "1/4 teaspoon salt",   "1/8 teaspoon ground nutmeg",   "1 tablespoon lemon juice" ] ```   **추가 가이드라인**   * 레시피를 만드는 데 필요한 재료 텍스트만 포함하세요. * 재료의 정의와 같이 불필요한 정보는 포함하지 마세요. |
| `recipeInstructions` | `HowToStep`, `HowToSection`, `Text`  요리 단계입니다.  여러 가지 방법으로 `recipeInstructions`의 값을 설정할 수 있습니다. `HowToStep`을 사용하는 것이 좋습니다. 레시피에 섹션이 있을 경우 `HowToSection`을 사용하여 HowToStep을 그룹화할 수도 있습니다.   * **`HowToStep`**: `HowToStep`으로 이 레시피의 단계를 지정합니다.      ```   "recipeInstructions": [     {       "@type": "HowToStep",       "name": "Preheat",       "text": "Heat oven to 425°F.",       "url": "https://example.com/recipe#step1",       "image": "https://example.com/photos/recipe/step1.jpg"     }, {       "@type": "HowToStep",       "name": "Prepare crust",       "text": "Place 1 pie crust in ungreased 9-inch glass pie plate, pressing firmly against side and bottom.",       "url": "https://example.com/recipe#step2",       "image": "https://example.com/photos/recipe/step2.jpg"     }, {       "@type": "HowToStep",       "name": "Make filling",       "text": "In large bowl, gently mix filling ingredients; spoon into crust-lined pie plate.",       "url": "https://example.com/recipe#step3",       "image": "https://example.com/photos/recipe/step3.jpg"     }, {       "@type": "HowToStep",       "name": "Cover",       "text": "Top with second crust. Cut slits or shapes in several places in top crust.",       "url": "https://example.com/recipe#step4",       "image": "https://example.com/photos/recipe/step4.jpg"     }, {       "@type": "HowToStep",       "name": "Bake",       "text": "Bake 40 to 45 minutes. The pie is ready when the apples are tender and the crust is golden brown.",       "url": "https://example.com/recipe#step5",       "image": "https://example.com/photos/recipe/step5.jpg"     }, {       "@type": "HowToStep",       "name": "Cool",       "text": "Cool on cooling rack at least 2 hours before serving.",       "url": "https://example.com/recipe#step6",       "image": "https://example.com/photos/recipe/step6.jpg"     }   ]   ``` * **`HowToSection`(레시피의 섹션이 여러 개일 경우에만)**: 단계를 여러 가지 섹션으로 그룹화하는 데 사용합니다. 예를 보려면 `HowToSection`을 참조하세요. * **단일 또는 반복 텍스트 속성**: 하나 이상의 단계를 포함하는 텍스트 블록입니다. Google에서는 모든 단계를 하나의 섹션에 있는 것처럼 처리합니다. 반복 속성값은 단일 텍스트 블록으로 연결됩니다. 그런 다음 Google에서 단일 텍스트 블록을 개별 단계로 자동 분리하도록 시도합니다. Google은 모든 섹션 이름, 단계 번호, 키워드, 레시피 단계 텍스트에 잘못 표시될 수 있는 다른 것들을 찾아서 삭제하려고 합니다. 최상의 결과를 얻으려면 `HowToStep`으로 단계를 명확하게 지정하는 것이 좋습니다.      ```   "recipeInstructions": [     "In large bowl, gently mix filling ingredients; spoon into crust-lined pie   plate. Top with second crust. Cut slits or shapes in several places in top   crust. Bake 40 to 45 minutes. The pie is ready when the or until apples are   tender and the crust is golden brown. Cool on cooling rack at least 2 hours   before serving."   ]   ```   **추가 가이드라인**   * 다른 곳에 포함된 메타데이터를 포함하지 마세요. 특히 작성자에는 `author` 속성, 요리에는 `recipeCuisine`, 카테고리에는 `recipeCategory`, 다른 키워드에는 `keywords`를 사용하세요. * 요리를 만드는 방법에 관한 텍스트만 포함하고, '지침', '동영상 보기', '1단계'와 같은 기타 텍스트는 포함하지 마세요. 그러한 구문은 구조화된 데이터의 외부에 지정합니다. **권장하지 않음**:       ```   "recipeInstructions": [{     "@type": "HowToStep",     "text": "Step 1. Heat oven to 425°F."   }]   ```     **권장**:       ```   "recipeInstructions": [{     "@type": "HowToStep",     "text": "Heat oven to 425°F."   }]   ``` |
| `recipeYield` | `Text` 또는 `Integer`  레시피에서 만드는 양입니다(해당하는 경우). 숫자만 사용하여 이 레시피로 만들어지는 분량을 지정합니다. 만드는 요리의 개수와 같이 다른 단위를 사용하기 위해 수량을 추가로 포함할 수 있습니다. `nutrition.calories`와 같이 1인분 기준 영양 정보를 지정할 경우 필수 속성입니다.  예     ``` "recipeYield": [   "6",   "24 cookies" ] ``` |
| `totalTime` | `Duration`  요리를 준비하는 데 걸리는 총 시간입니다. [ISO 8601 형식](https://en.wikipedia.org/wiki/ISO_8601)으로 나타냅니다(해당하는 경우).  `totalTime`을 사용하거나 `cookTime`과 `prepTime`을 조합하여 사용하세요. |
| `video` | `VideoObject` 요리하는 단계를 보여주는 동영상입니다. 필수 및 권장 [동영상 속성](https://developers.google.com/search/docs/appearance/structured-data/video?hl=ko#video-object) 목록을 따르세요. |

### `HowToSection`

대부분의 레시피에는 섹션이 없습니다. 먼저, 레시피 안내를 `HowToStep` 속성으로 분할한 다음 단계 섹션을 추가적으로 지정해야 하는 경우에만 `HowToSection`을 추가합니다.

레시피 안내의 일부를 이루는 일련의 단계 또는 하위 섹션을 그룹화하려면 `HowToSection`을 사용합니다. `recipeInstructions` 속성의 정의 내에서 직접 또는 다른 `HowToSection`의 `itemListElement`로 `HowToSection`을 지정합니다.

`HowToSection` 유형은 단일 레시피의 섹션을 정의하며 하나 또는 여러 개의 단계를 포함합니다. 동일한 요리를 위한 여러 레시피를 정의하는 데 `HowToSection`을 사용하지 마세요. 대신, 단일 레시피의 일부로 `HowToSection`을 사용하세요. 하나의 요리를 위한 여러 레시피를 나열하려면 여러 `Recipe` 객체를 사용하세요. 예를 들어 애플파이를 만드는 다양한 방법은 `HowToSection` 객체가 아닌 여러 `Recipe` 객체로 나열합니다.

`HowToSection`의 전체 정의는 [schema.org/HowToSection](https://schema.org/HowToSection)에서 확인할 수 있습니다.

| 필수 속성 | |
| --- | --- |
| `itemListElement` | `HowToStep` 섹션 또는 하위 섹션에 관한 자세한 단계의 목록입니다. 예를 들어 피자 레시피에는 크러스트 만들기 단계에 한 섹션, 토핑 만들기에 한 섹션, 합치고 굽는 데 한 섹션이 있을 수 있습니다.  예:     ``` {   "@type": "HowToSection",   "name": "Assemble the pie",   "itemListElement": [     {       "@type": "HowToStep",       "text": "In large bowl, gently mix filling ingredients; spoon into crust-lined pie plate."     }, {       "@type": "HowToStep",       "text": "Top with second crust. Cut slits or shapes in several places in top crust."     }   ] } ``` |
| `name` | `Text` 섹션의 이름. |

### `HowToStep`

레시피의 일부로 방법을 설명하는 하나 이상의 문장을 그룹화하려면 `HowToStep`을 사용합니다(콘텐츠에 적합한 경우). 문장으로 `text` 속성을 정의하거나 아니면 각 문장의 `HowToDirection` 또는 `HowToTip`으로 `itemListElement`를 정의합니다.

[HowToStep](https://schema.org/HowToStep) 유형의 다음 속성으로 레시피 단계를 마크업합니다. `recipeInstructions` 속성의 정의 내에서 직접 또는 `HowToSection`의 `itemListElement`로 `HowToStep`을 지정합니다.

`HowToStep`의 전체 정의는 [schema.org/HowToStep](https://schema.org/HowToStep)에서 확인할 수 있습니다.

| 필수 속성 | |
| --- | --- |
| `itemListElement` | `HowToDirection` 또는 `HowToTip` 지시나 팁을 포함한 자세한 하위 단계의 목록입니다.  `text`가 사용되는 경우 선택사항입니다. |
| `text` | `Text` 이 단계의 전체 안내 텍스트입니다.  `itemListElement`가 사용되는 경우 선택사항입니다. 추가 가이드라인   * 안내 텍스트만 포함하고 '지시', '동영상 보기', '1단계'와 같은 기타 텍스트는 포함하지 마세요. 그러한 구문은 마크업된 속성의 외부에 지정합니다.     **권장하지 않음**:       ```   {     "@type": "HowToStep",     "text": "Step 1. Heat oven to 425°F."   }   ```     **권장**:       ```   {     "@type": "HowToStep",     "text": "Heat oven to 425°F."   }   ``` |

| 권장 속성 | |
| --- | --- |
| `image` | `ImageObject` 또는 `URL` 단계에 대한 이미지입니다. 추가 이미지 가이드라인:   * 이미지 URL은 [크롤링 및 색인 생성](https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps?hl=ko)이 가능해야 합니다. * 이미지는 마크업된 콘텐츠를 나타내야 합니다. * 이미지는 .jpg, .png 또는 .gif 형식이어야 합니다. |
| `name` | `Text` 단계를 요약하는 단어나 짧은 구문입니다(예: '파이 크러스트 맞추기'). 설명이 아닌 텍스트(예: '1단계: [텍스트]')나 다른 형식의 단계 번호(예: '1. [텍스트]')는 사용하지 마세요. |
| `url` | `URL` 단계에 직접 연결되는 `URL`(사용 가능한 경우). 예: 앵커 링크 조각 |
| `video` | `VideoObject` 또는 `Clip` 이 단계의 동영상 또는 동영상의 클립입니다.  `VideoObject`의 경우 필수 및 권장 [동영상](https://developers.google.com/search/docs/appearance/structured-data/video?hl=ko#type-definitions) 또는 [클립](https://developers.google.com/search/docs/appearance/structured-data/video?hl=ko#clip) 속성 목록을 따르세요. |

### `HowToDirection` 및 `HowToTip`

`HowToDirection`과 `HowToTip`을 사용하여 지시 또는 팁을 설명합니다(해당하는 경우).
이 둘은 필수 속성과 권장 속성이 동일합니다.

`HowToDirection` 및 `HowToTip`의 전체 정의는 [schema.org/HowToDirection](https://schema.org/HowToDirection) 및 [schema.org/HowToTip](https://schema.org/HowToTip)에서 확인할 수 있습니다.

| 필수 속성 | |
| --- | --- |
| `text` | `Text` 지시나 팁의 텍스트입니다. |

### `ItemList`

[레시피 속성](#recipe-properties) 외에 호스트 관련 목록에 다음 속성을 추가합니다. `ItemList`는 필수 속성은 아니지만 레시피가 호스트 캐러셀에 표시되도록 하려면 다음 속성을 추가해야 합니다. 호스트 캐러셀을 자세히 알아보려면 [캐러셀](https://developers.google.com/search/docs/appearance/structured-data/carousel?hl=ko)을 참고하세요.

`ItemList`의 전체 정의는 [schema.org/ItemList](https://schema.org/ItemList)에서 확인할 수 있습니다.

| 필수 속성 | |
| --- | --- |
| `itemListElement` | `ListItem`  단일 항목 페이지의 주석입니다. |
| `ListItem.position` | `Integer`  목록에서 항목 페이지의 순서입니다. 예:     ``` "itemListElement": [   {     "@type": "ListItem",     "position": 1,   }, {     "@type": "ListItem",     "position": 2,   } ] ``` |
| `ListItem.url` | `URL`  항목 페이지의 표준 URL. 모든 항목에 고유한 URL이 있어야 합니다. |

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
