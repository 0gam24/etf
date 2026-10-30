# 구조화된 동영상(VideoObject,Clip,BroadcastEvent) 데이터

> **출처(Source):** https://developers.google.com/search/docs/appearance/structured-data/video?hl=ko
> **저작자(Attribution):** Google
> **라이선스(License):** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
> 이 문서는 Google 검색 센터 문서를 Markdown으로 변환한 사본입니다.
> 원문의 최신 내용은 위 출처 링크를 확인하세요.

---

# 구조화된 동영상(`VideoObject`, `Clip`, `BroadcastEvent`) 데이터

Google이 동영상의 세부정보를 자동으로 파악하려고 하지만, 동영상에 [`VideoObject`](#video-object)를 표시하여 설명, 썸네일 URL, 업로드 날짜, 길이와 같이 동영상 결과에 표시되는 정보에 영향을 줄 수 있습니다. [보기 페이지](https://developers.google.com/search/docs/appearance/video?hl=ko#watch-page)에 구조화된 동영상 데이터를 추가하면 Google에서 동영상을 더 쉽게 찾을 수 있습니다. 동영상은 기본 검색 결과 페이지, 동영상 모드, Google 이미지, [Google 디스커버](https://developers.google.com/search/docs/appearance/google-discover?hl=ko) 등 Google의 여러 위치에 표시될 수 있습니다.

![Google 검색 결과, 동영상 탭, 디스커버의 동영상 콘텐츠](https://developers.google.com/static/search/docs/images/video-on-google.png?hl=ko)

보기 페이지를 마크업하는 방식에 따라 동영상에서 다음과 같은 특정 동영상 기능을 사용할 수도 있습니다.

| **동영상 기능** | |
| --- | --- |
| **실시간 배지**: [`BroadcastEvent`](#broadcast-event)로 표시하여 동영상에 실시간 배지를 추가하세요. 실시간 배지는 길이에 관계없이 실시간으로 스트리밍되는 모든 공개 동영상에 적용될 수 있습니다. 예를 들면 다음과 같습니다.   * 스포츠 경기 * 시상식 * 인플루언서 동영상 * 실시간 스트리밍 게임   [실시간 배지 가이드라인](#livestream-guidelines)을 따르고 Google에서 적절한 시점에 페이지를 크롤링하도록 [Indexing API](https://developers.google.com/search/apis/indexing-api/v3/quickstart?hl=ko)를 사용하세요. | 검색결과에 실시간 배지가 표시된 동영상 |
| **중요한 부분**  중요한 부분 기능은 사용자가 책의 장처럼 동영상 세그먼트를 탐색하는 방법으로, 사용자의 콘텐츠 참여도를 높이는 데 도움이 됩니다. Google 검색에서는 자동으로 동영상의 세그먼트를 감지하여 사용자에게 중요한 부분을 표시하려고 하며, 개발자가 따로 취해야 할 조치는 없습니다. 또는 개발자가 동영상의 중요한 부분을 Google에 알려도 됩니다. 구조화된 데이터나 YouTube 설명을 통해 사용자가 설정한 중요한 부분에 우선순위가 부여됩니다.   * **동영상이 웹페이지에 삽입되어 있거나 동영상 플랫폼을 운영하는 경우** 다음과 같은 두 가지 방법으로 중요한 부분을 사용 설정할 수 있습니다.   + [구조화된 `Clip` 데이터](https://developers.google.com/search/docs/appearance/structured-data/video?hl=ko#clip): 각 세그먼트의 시작 시간과 종료 시간을 정확하게 지정하고 각 세그먼트에 표시할 라벨을 지정합니다. 이 기능은 Google 검색이 서비스되는 모든 언어로 사용할 수 있습니다.   + [구조화된 `SeekToAction` 데이터](https://developers.google.com/search/docs/appearance/structured-data/video?hl=ko#seek):     URL 구조의 일반적인 타임스탬프 위치를 Google에 알려 주면 Google에서 자동으로 중요한 부분을 식별해 동영상 내 해당 지점으로 사용자를 연결할 수 있습니다. 한국어, 영어, 스페인어, 포르투갈어, 이탈리아어, 중국어, 프랑스어, 일본어, 독일어, 터키어, 네덜란드어, 러시아어로 사용할 수 있습니다. * **동영상이 YouTube에 호스팅되는 경우** YouTube의 동영상 설명에 타임스탬프와 라벨을 정확히 지정합니다. [YouTube 설명에 타임스탬프를 표시하기 위한 권장사항](https://developers.google.com/search/docs/appearance/structured-data/video?hl=ko#best-practices-youtube)을 확인하세요.   이 기능은 Google 검색이 서비스되는 모든 언어로 사용할 수 있습니다. YouTube에서 동영상 챕터를 사용 설정하려면 다음 [추가 가이드라인](https://support.google.com/youtube/answer/9884579?hl=ko)을 따르세요.   중요한 부분 기능을 완전히 선택 해제하려면(동영상의 중요한 부분을 자동으로 표시하기 위해 Google에서 할 수 있는 모든 작업 포함) [`nosnippet`](https://developers.google.com/search/docs/appearance/snippet?hl=ko#nosnippet) `meta` 태그를 사용하세요. | 검색결과에 중요한 부분이 표시된 동영상 |

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

### 표준 동영상 결과

![표준 동영상 검색결과의 예](https://developers.google.com/static/search/docs/images/video-search-results.png?hl=ko)

하나의 [`VideoObject`](#video-object)가 포함된 예입니다.

JSON-LD

  

```
<html>
  <head>
    <title>Introducing the self-driving bicycle in the Netherlands</title>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      "name": "Introducing the self-driving bicycle in the Netherlands",
      "description": "This spring, Google is introducing the self-driving bicycle in Amsterdam, the world's premier cycling city. The Dutch cycle more than any other nation in the world, almost 900 kilometres per year per person, amounting to over 15 billion kilometres annually. The self-driving bicycle enables safe navigation through the city for Amsterdam residents, and furthers Google's ambition to improve urban mobility with technology. Google Netherlands takes enormous pride in the fact that a Dutch team worked on this innovation that will have great impact in their home country.",
      "thumbnailUrl": [
        "https://example.com/photos/1x1/photo.jpg",
        "https://example.com/photos/4x3/photo.jpg",
        "https://example.com/photos/16x9/photo.jpg"
       ],
      "uploadDate": "2024-03-31T08:00:00+08:00",
      "duration": "PT1M54S",
      "contentUrl": "https://www.example.com/video/123/file.mp4",
      "embedUrl": "https://www.example.com/embed/123",
      "interactionStatistic": {
        "@type": "InteractionCounter",
        "interactionType": { "@type": "WatchAction" },
        "userInteractionCount": 5647018
      },
      "regionsAllowed": ["US", "NL"]
    }
    </script>
  </head>
  <body>
  </body>
</html>
```

마이크로데이터

  

```
<html itemscope itemprop="VideoObject" itemtype="https://schema.org/VideoObject">
<head>
  <title itemprop="name">Introducing the self-driving bicycle in the Netherlands</title>
</head>
<body>
  <meta itemprop="uploadDate" content="2024-03-31T08:00:00+08:00" />
  <meta itemprop="duration" content="PT1M54S" />
  <p itemprop="description">This spring, Google is introducing the self-driving bicycle in Amsterdam, the world's premier cycling city. The Dutch cycle more than any other nation in the world, almost 900 kilometres per year per person, amounting to over 15 billion kilometres annually. The self-driving bicycle enables safe navigation through the city for Amsterdam residents, and furthers Google's ambition to improve urban mobility with technology. Google Netherlands takes enormous pride in the fact that a Dutch team worked on this innovation that will have great impact in their home country.</p>
  <div itemprop="interactionStatistic" itemtype="https://schema.org/InteractionCounter" itemscope>
    <meta itemprop="userInteractionCount" content="5647018" />
    <meta itemprop="interactionType" itemtype="https://schema.org/WatchAction" />
  </div>
  <link itemprop="embedUrl" href="https://www.example.com/embed/123" />
  <meta itemprop="contentUrl" content="https://www.example.com/video/123/file.mp4" />
  <meta itemprop="regionsAllowed" content="US" />
  <meta itemprop="regionsAllowed" content="NL" />
  <meta itemprop="thumbnailUrl" content="https://example.com/photos/1x1/photo.jpg" />
</body>
</html>
```

### 실시간 배지

![실시간 배지가 포함된 동영상이 검색결과에 표시된 예](https://developers.google.com/static/search/docs/images/video-livestream.png?hl=ko)

다음은 [`VideoObject`](#video-object) 및 [`BroadcastEvent`](#broadcast-event)의 예입니다.

JSON-LD

  

```
<html>
  <head>
    <title>Bald Eagle at the Park - Livestream</title>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      "contentURL": "https://example.com/bald-eagle-at-the-park.mp4",
      "description": "Bald eagle at the park livestream.",
      "duration": "PT37M14S",
      "embedUrl": "https://example.com/bald-eagle-at-the-park",
      "expires": "2024-10-30T14:37:14+00:00",
      "regionsAllowed": "US",
      "interactionStatistic": {
        "@type": "InteractionCounter",
        "interactionType": { "@type": "WatchAction" },
        "userInteractionCount": 4756
      },
      "name": "Bald eagle nest livestream!",
      "thumbnailUrl": "https://example.com/bald-eagle-at-the-park",
      "uploadDate": "2024-10-27T14:00:00+00:00",
      "publication": [
        {
          "@type": "BroadcastEvent",
          "isLiveBroadcast": true,
          "startDate": "2024-10-27T14:00:00+00:00",
          "endDate": "2024-10-27T14:37:14+00:00"
        },
        {
          "@type": "BroadcastEvent",
          "isLiveBroadcast": true,
          "startDate": "2024-10-27T18:00:00+00:00",
          "endDate": "2024-10-27T18:37:14+00:00"
        }
      ]
    }
    </script>
  </head>
  <body>
  </body>
</html>
```

마이크로데이터

  

```
<html itemscope itemprop="VideoObject" itemtype="https://schema.org/VideoObject">
<head>
  <title itemprop="name">Bald Eagle at the Park - Livestream</title>
</head>
<body>
  <meta itemprop="uploadDate" content="2024-10-27T14:00:00+00:00" />
  <meta itemprop="duration" content="PT37M14S" />
  <p itemprop="description">Bald eagle at the park livestream.</p>
  <div itemprop="interactionStatistic" itemtype="https://schema.org/InteractionCounter" itemscope>
    <meta itemprop="userInteractionCount" content="4756" />
    <meta itemprop="interactionType" itemtype="https://schema.org/WatchAction" />
  </div>
  <link itemprop="embedUrl" href="https://example.com/bald-eagle-at-the-park" />
  <meta itemprop="expires" content="2024-10-30T14:37:14+00:00" />
  <meta itemprop="contentUrl" content="https://example.com/bald-eagle-at-the-park.mp4" />
  <meta itemprop="regionsAllowed" content="US" />
  <meta itemprop="thumbnailUrl" content="https://example.com/bald-eagle-at-the-park" />
  <div itemprop="publication" itemtype="https://schema.org/BroadcastEvent" itemscope>
    <meta itemprop="isLiveBroadcast" content="true" />
    <meta itemprop="startDate" content="2024-10-27T14:00:00+00:00" />
    <meta itemprop="endDate" content="2024-10-27T14:37:14+00:00" />
  </div>
  <div itemprop="publication" itemtype="https://schema.org/BroadcastEvent" itemscope>
    <meta itemprop="isLiveBroadcast" content="true" />
    <meta itemprop="startDate" content="2024-10-27T18:00:00+00:00" />
    <meta itemprop="endDate" content="2024-10-27T18:37:14+00:00" />
  </div>
</body>
</html>
```

### `Clip`

![검색결과에 중요한 부분이 표시된 동영상의 예](https://developers.google.com/static/search/docs/images/video-key-moments.png?hl=ko)

다음은 [`VideoObject`](#video-object) 및 [`Clip`](#clip)의 예입니다.

JSON-LD

  

```
<html>
  <head>
    <title>Cat jumps over the fence</title>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org/",
      "@type": "VideoObject",
      "name": "Cat video",
      "duration": "PT10M",
      "uploadDate": "2024-07-19T08:00:00+08:00",
      "thumbnailUrl": "https://www.example.com/cat.jpg",
      "description": "Watch this cat jump over a fence!",
      "contentUrl": "https://www.example.com/cat_video_full.mp4",
      "ineligibleRegion": "US",
      "hasPart": [{
        "@type": "Clip",
        "name": "Cat jumps",
        "startOffset": 30,
        "endOffset": 45,
        "url": "https://www.example.com/example?t=30"
      },
      {
        "@type": "Clip",
        "name": "Cat misses the fence",
        "startOffset": 111,
        "endOffset": 150,
        "url": "https://www.example.com/example?t=111"
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
<html itemscope itemprop="VideoObject" itemtype="https://schema.org/VideoObject">
<head>
  <title itemprop="name">Cat jumps over the fence</title>
</head>
<body>
  <meta itemprop="uploadDate" content="2024-07-19" />
  <meta itemprop="duration" content="P10M" />
  <p itemprop="description">Watch this cat jump over a fence!</p>
  <div itemprop="interactionStatistic" itemtype="https://schema.org/InteractionCounter" itemscope>
    <meta itemprop="userInteractionCount" content="5647018" />
    <meta itemprop="interactionType" itemtype="https://schema.org/WatchAction" />
  </div>
  <div itemprop="hasPart" itemtype="https://schema.org/Clip" itemscope>
    <meta itemprop="name" content="Cat jumps" />
    <meta itemprop="startOffset" content="30" />
    <meta itemprop="endOffset" content="45" />
    <meta itemprop="url" content="https://www.example.com/example?t=30" />
  </div>
  <div itemprop="hasPart" itemtype="https://schema.org/Clip" itemscope>
    <meta itemprop="name" content="Cat misses the fence" />
    <meta itemprop="startOffset" content="111" />
    <meta itemprop="endOffset" content="150" />
    <meta itemprop="url" content="https://www.example.com/example?t=111" />
  </div>
  <link itemprop="embedUrl" href="https://www.example.com/embed/123" />
  <meta itemprop="contentUrl" content="https://www.example.com/cat_video_full.mp4" />
  <meta itemprop="ineligibleRegion" content="US" />
  <meta itemprop="thumbnailUrl" content="https://www.example.com/cat.jpg" />
</body>
</html>
```

### `SeekToAction`

다음은 `SeekToAction` 마크업에 필요한 [추가 속성](#seek)이 포함된 단일 [`VideoObject`](#video-object)의 예입니다.

JSON-LD

  

```
<html>
  <head>
    <title>John Smith (@johnsmith123) on VideoApp: My daily workout! #stayingfit</title>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      "potentialAction" : {
        "@type": "SeekToAction",
        "target": "https://video.example.com/watch/videoID?t={seek_to_second_number}",
        "startOffset-input": "required name=seek_to_second_number"
      },
      "name": "My daily workout!",
      "uploadDate": "2024-07-19T08:00:00+08:00",
      "thumbnailUrl": "https://www.example.com/daily-workout.jpg",
      "description": "My daily workout!",
      "embedUrl": "https://example.com/daily-workout"
    }
    </script>
  </head>
  <body>
  </body>
</html>
```

마이크로데이터

  

```
<html itemscope itemprop="VideoObject" itemtype="https://schema.org/VideoObject">
<head>
  <title itemprop="name">John Smith (@johnsmith123) on VideoApp: My daily workout! #stayingfit</title>
</head>
<body>
  <meta itemprop="uploadDate" content="2024-07-19" />
  <p itemprop="description">My daily workout!</p>
  <div itemprop="potentialAction" itemtype="https://schema.org/SeekToAction" itemscope>
    <meta itemprop="target" content="https://video.example.com/watch/videoID?t={seek_to_second_number}" />
    <meta itemprop="startOffset-input" content="required name=seek_to_second_number" />
  </div>
  <link itemprop="embedUrl" href="https://example.com/daily-workout" />
  <meta itemprop="thumbnailUrl" content="https://www.example.com/daily-workout.jpg" />
</body>
</html>
```

## 가이드라인

구조화된 동영상 데이터를 Google 검색에서 사용하려면 [검색 Essentials](https://developers.google.com/search/docs/essentials?hl=ko), [구조화된 일반 데이터 가이드라인](https://developers.google.com/search/docs/appearance/structured-data/sd-policies?hl=ko) 및 [동영상 색인 생성 요구사항](https://developers.google.com/search/docs/appearance/video?hl=ko#indexing-criteria)을 준수해야 합니다.

**경고:** 페이지의 일부 마크업이 구조화된 데이터 가이드라인을 벗어난 기술을 사용하는 것으로 감지되면 Google에서 사이트에 [직접 조치](https://support.google.com/webmasters/answer/9044175?hl=ko)를 취할 수 있습니다.

또한 동영상 콘텐츠에 적용되는 다음 가이드라인을 확인하는 것이 좋습니다.

* [라이브 스트림 가이드라인](#livestream-guidelines)
* [`Clip` 및 `SeekToAction` 가이드라인](#clip-guidelines)
* [YouTube에서 타임스탬프를 표시하기 위한 권장사항](#best-practices-youtube)

### 실시간 배지 가이드라인

실시간 스트리밍 동영상에 [`BroadcastEvent`](#broadcast-event)를 추가할 때는 다음 가이드라인을 따르세요.

* 구조화된 데이터에 저속하거나 불쾌할 수 있는 언어를 사용하지 마세요.
* Google이 적절한 시점에 실시간 스트리밍 동영상을 크롤링하도록 하려면 [Indexing API](https://developers.google.com/search/apis/indexing-api/v3/quickstart?hl=ko)를 사용하세요. 다음과 같은 경우 API를 호출하세요.
  + 동영상이 실시간으로 제공될 때
  + 동영상 스트리밍이 중지되고 페이지의 마크업이 업데이트되어 `endDate`를 나타낼 때
  + 언제든지 마크업이 변경되어 Google에 알려야 할 때Indexing API는 실시간 스트리밍 동영상만 지원합니다.

### YouTube에서 타임스탬프를 표시하기 위한 권장사항

동영상이 YouTube에서 호스팅되는 경우 Google 검색에서 YouTube에 있는 동영상 설명을 바탕으로 동영상의 중요한 부분을 자동으로 사용 설정할 수 있으므로, 개발자가 YouTube 설명에 있는 특정 타임스탬프를 표시할 필요가 없습니다. 물론 개발자는 동영상의 중요한 지점을 더 명시적으로 알릴 수 있으며 Google은 이 정보를 우선시합니다. 다음 다이어그램은 YouTube 동영상 설명의 타임스탬프와 라벨이 검색결과에 어떻게 나타나는지를 보여줍니다.

![타임스탬프와 라벨이 검색결과에 표시된 동영상](https://developers.google.com/static/search/docs/images/video-timestamps-on-youtube.png?hl=ko)


**1. 라벨**: 클립의 이름  
**2. 타임스탬프**: 클립이 시작되는 지점

YouTube 설명에 사용될 타임스탬프와 라벨의 형식을 지정할 때는 다음 가이드라인에 유의하세요.

* 타임스탬프의 형식은 `[hour]:[minute]:[second]`와 같이 지정합니다. 시간이 없으면 포함하지 않아도 됩니다.
* 타임스탬프와 같은 행에 타임스탬프 라벨을 지정합니다.
* 동영상 설명의 새로운 행에 각 타임스탬프를 입력합니다.
* 타임스탬프를 동영상의 특정 지점에 연결합니다.
* 라벨에 하나 이상의 단어가 포함되어 있어야 합니다.
* 타임스탬프를 시간 순서대로 나열합니다.

YouTube에서 동영상 챕터를 사용 설정하려면 다음 [추가 가이드라인](https://support.google.com/youtube/answer/9884579?hl=ko)을 따르세요.

### `Clip` 및 `SeekToAction` 가이드라인

구조화된 [`Clip`](#clip) 또는 [`SeekToAction`](#seek) 데이터를 추가하여 동영상 세그먼트를 표시하는 경우 다음 가이드라인을 따르세요.

* 동영상에는 동영상 URL의 시작점이 아닌 지점에 딥 링크를 설정할 수 있는 기능이 있어야 합니다. 예를 들어 `https://www.example.com/example?t=30`을 사용하면 동영상의 30초 지점에서 시작됩니다.
* 사용자가 동영상을 시청할 수 있는 페이지에 구조화된 `VideoObject` 데이터를 추가해야 합니다. 동영상을 시청할 수 없는 페이지로 사용자를 연결하는 것은 좋은 사용자 환경이 아닙니다.
* 동영상의 총 재생 시간은 30초 이상이어야 합니다.
* 동영상에는 구조화된 [`VideoObject`](#video-object) 데이터 문서에 나와 있는 필수 속성이 포함되어야 합니다.
* **구조화된 `Clip` 데이터에만 해당함**: 동일한 페이지에 정의된 동일한 동영상의 두 클립은 시작 시간이 같아서는 안 됩니다.
* **구조화된 `SeekToAction` 데이터에만 해당함**: Google에서 [동영상 콘텐츠 파일을 가져올 수 있어야](https://developers.google.com/search/docs/appearance/video?hl=ko#allow-fetch) 합니다.

## 구조화된 데이터 유형 정의

이 섹션에서는 Google 검색의 동영상 기능과 관련된 구조화된 데이터 유형에 관해 설명합니다.
마크업이 Google 검색에서 사용되려면 필수 [`VideoObject`](#video-object) 속성이 있어야 합니다. 권장 속성을 통해 `VideoObject`에 관한 정보를 추가하여 더 만족스러운 사용자 환경을 제공할 수 있습니다. [`VideoObject`](#video-object) 외에 다음 데이터 유형을 추가하면 Google 검색에서 동영상 수정을 사용 설정할 수 있습니다.

* **[`BroadcastEvent`](#broadcast-event)**: 실시간 스트리밍 동영상을 마크업하여 동영상에 실시간 배지를 사용 설정합니다.
* **[`Clip`](#clip)**: 사용자가 동영상의 특정 지점으로 빠르게 이동할 수 있도록 동영상의 중요한 세그먼트를 표시합니다.
* **[`SeekToAction`](#seek)**: URL 구조가 작동하는 방식을 표시하여 중요한 부분을 사용 설정합니다. 그러면 Google에서 자동으로 중요한 부분을 식별해 동영상 내의 해당 지점으로 사용자를 연결할 수 있습니다.

### `VideoObject`

`VideoObject`의 전체 정의는 [schema.org/VideoObject](https://schema.org/VideoObject)에서 확인할 수 있습니다.
필수 속성을 포함하지 않으면 Google에서 동영상에 관한 정보를 추출하지 못할 수 있습니다. 권장 속성을 통해 콘텐츠에 관한 정보를 추가하여 더 만족스러운 사용자 환경을 제공할 수 있습니다.

| 필수 속성 | |
| --- | --- |
| `name` | `Text`  동영상 제목입니다. 사이트에 있는 각 동영상의 `name` 속성에는 고유한 텍스트를 사용해야 합니다. |
| `thumbnailUrl` | 반복된 `URL`  동영상의 고유한 썸네일 이미지 파일을 가리키는 URL입니다. [썸네일 이미지 가이드라인](https://developers.google.com/search/docs/appearance/video?hl=ko#valid-thumbnail)을 따릅니다. |
| `uploadDate` | `DateTime`  동영상이 처음으로 게시된 날짜와 시간입니다. [ISO 8601 형식](https://en.wikipedia.org/wiki/ISO_8601)으로 나타냅니다. 시간대 정보를 제공하는 것이 좋으며, 제공하지 않은 경우 [Googlebot에서 사용하는 시간대](https://developers.google.com/search/docs/crawling-indexing/googlebot?hl=ko#timezone)가 기본값으로 설정됩니다. |

| 권장 속성 | |
| --- | --- |
| `contentUrl` | `URL` 가능한 경우 `contentUrl` 속성을 제공하는 것이 좋습니다. 이는 Google에서 동영상 콘텐츠 파일을 가져오는 가장 효과적인 방법입니다. `contentUrl`을 제공할 수 없는 경우 `embedUrl`을 대신 제공하세요. [지원되는 파일 형식](https://developers.google.com/search/docs/appearance/video?hl=ko#supported-video-files) 중 하나인 동영상 파일의 실제 콘텐츠 바이트를 가리키는 URL입니다. 동영상이 있는 페이지로 링크하지 마세요. 동영상 파일의 실제 콘텐츠 바이트 자체의 URL이어야 합니다.     ``` "contentUrl": "https://www.example.com/video/123/file.mp4" ```   [동영상 권장사항](https://developers.google.com/search/docs/appearance/video?hl=ko)을 따라 주세요. **도움말**: [역방향 DNS 조회](https://developers.google.com/search/docs/crawling-indexing/verifying-googlebot?hl=ko)를 사용하여 Googlebot만 콘텐츠에 액세스하도록 할 수 있습니다. |
| `description` | `Text`  동영상 설명입니다. 사이트에 있는 각 동영상의 `description` 속성에는 고유한 텍스트를 사용해야 합니다. HTML 태그는 무시됩니다. |
| `duration` | `Duration`  동영상의 길이이며, [ISO 8601 형식](https://en.wikipedia.org/wiki/ISO_8601#Durations)으로 나타냅니다. 예를 들어 `PT00H30M5S`는 '30분 5초'의 길이를 나타냅니다. |
| `embedUrl` | `URL` 가능한 경우 `contentUrl` 속성을 제공하는 것이 좋습니다. 이는 Google에서 동영상 콘텐츠 파일을 가져오는 가장 효과적인 방법입니다. `contentUrl`을 제공할 수 없는 경우 `embedUrl`을 대신 제공하세요. 특정 동영상 플레이어로 연결되는 URL. 동영상이 있는 페이지로 링크하지 마세요. 동영상 플레이어의 URL이어야 합니다. 보통 `<embed>` 태그의 `src` 요소에 있는 정보입니다.     ``` "embedUrl": "https://www.example.com/embed/123" ```   [동영상 권장사항](https://developers.google.com/search/docs/appearance/video?hl=ko)을 따라 주세요. **도움말**: [역방향 DNS 조회](https://developers.google.com/search/docs/crawling-indexing/verifying-googlebot?hl=ko)를 사용하여 Googlebot만 콘텐츠에 액세스하도록 할 수 있습니다. |
| `expires` | `DateTime` 해당하는 경우 동영상을 사용할 수 없게 되는 날짜와 시간입니다. [ISO 8601 형식](https://en.wikipedia.org/wiki/ISO_8601)으로 나타냅니다. 동영상이 만료되지 않은 경우에는 이 정보를 제공하지 마세요. 시간대 정보를 제공하는 것이 좋으며, 제공하지 않은 경우 [Googlebot에서 사용하는 시간대](https://developers.google.com/search/docs/crawling-indexing/googlebot?hl=ko#timezone)가 기본값으로 설정됩니다. |
| `hasPart` | 동영상에 중요한 세그먼트가 있는 경우 `VideoObject`에서 [필수 `Clip` 속성](#clip)을 중첩하세요. 예:     ``` <script type="application/ld+json"> {   "@context": "https://schema.org/",   "@type": "VideoObject",   "name": "Cat video",   "hasPart": {     "@type": "Clip",     "name": "Cat jumps",     "startOffset": 30,     "url": "https://www.example.com/example?t=30"   } } </script> ``` |
| `ineligibleRegion` | `Place`  동영상이 허용되지 않는 지역입니다(해당하는 경우). 명시하지 않으면 Google은 동영상이 모든 지역에서 허용되는 것으로 간주합니다. [두 자리 또는 세 자리 ISO 3166-1 형식](https://en.wikipedia.org/wiki/ISO_3166-1)으로 국가를 지정합니다. 여러 값을 지정하려면 여러 국가 코드를 사용합니다(예: JSON-LD 배열 또는 마이크로데이터의 여러 `meta` 태그). [`regionsAllowed`](#regions-allowed) 속성도 지원됩니다. 사이트에 적합한 `ineligibleRegion` 또는 `regionsAllowed` 중 하나를 추가합니다. |
| `interactionStatistic` | `InteractionCounter`  동영상의 시청 횟수. 예:     ``` "interactionStatistic":   {     "@type": "InteractionCounter",     "interactionType": { "@type": "WatchAction" },     "userInteractionCount": 12345   } ```  2019년 10월 Google은 `interactionCount` 대신 `interactionStatistic`를 권장하도록 도움말을 변경했습니다. `interactionCount`도 계속 지원하지만 앞으로는 `interactionStatistic`을 권장합니다. |
| `publication` | 동영상을 실시간으로 제공하는 중에 실시간 배지를 포함하고 싶다면 `VideoObject`에서 [`BroadcastEvent` 속성](#broadcast-event)을 중첩하세요. 예:     ``` <script type="application/ld+json"> {   "@context": "https://schema.org/",   "@type": "VideoObject",   "name": "Cat video",   "publication": {     "@type": "BroadcastEvent",     "name": "First scheduled broadcast",     "isLiveBroadcast": true,     "startDate": "2018-10-27T14:00:00+00:00",     "endDate": "2018-10-27T14:37:14+00:00"   } } </script> ``` |
| `regionsAllowed` | `Place`  동영상이 허용되는 지역입니다(해당하는 경우). 명시하지 않으면 Google은 동영상이 모든 지역에서 허용되는 것으로 간주합니다. [두 자리 또는 세 자리 ISO 3166-1 형식](https://en.wikipedia.org/wiki/ISO_3166-1)으로 국가를 지정합니다. 여러 값을 지정하려면 여러 국가 코드를 사용합니다(예: JSON-LD 배열 또는 마이크로데이터의 여러 `meta` 태그). [`ineligibleRegion`](#ineligible-region) 속성도 지원됩니다. 사이트에 적합한 `ineligibleRegion` 또는 `regionsAllowed` 중 하나를 추가합니다. |

### `BroadcastEvent`

실시간 배지를 표시하려면 [VideoObject](#video-object)에서 다음 속성을 중첩하세요. `BroadcastEvent` 속성은 필수가 아니지만 동영상에 실시간 배지를 표시하려면 다음 속성은 반드시 추가해야 합니다.

`BroadcastEvent`의 전체 정의는 [schema.org/BroadcastEvent](https://schema.org/BroadcastEvent)에서 확인할 수 있습니다.

| 필수 속성 | |
| --- | --- |
| `publication` | `BroadcastEvent`  동영상이 실시간으로 스트리밍되는 시기. 목록이나 단일 인스턴스일 수 있습니다. |
| `publication.endDate` | `DateTime`  실시간 스트리밍이 종료되는 또는 종료 예정인 날짜 및 시간. [ISO 8601 형식](https://en.wikipedia.org/wiki/ISO_8601)으로 나타냅니다.  동영상이 종료되고 더 이상 실시간으로 스트리밍되지 않으면 `endDate`를 제공해야 합니다. 실시간 스트리밍이 시작되기 전까지 예상 `endDate`를 알 수 없는 경우 대략적인 `endDate`를 제공하는 것이 좋습니다.  `endDate`가 과거이거나 현재인 경우 스트리밍이 실제로 종료되고 더 이상 실시간으로 제공되지 않는 것입니다. `endDate`가 미래인 경우 스트리밍이 그 시간에 종료될 예정이라는 것입니다. |
| `publication.isLiveBroadcast` | 불리언  동영상이 실시간으로 스트리밍되거나, 되고 있거나, 될 예정인 경우 `true`로 설정합니다. |
| `publication.startDate` | `DateTime`  실시간 스트리밍이 시작되는 또는 시작 예정인 날짜 및 시간. [ISO 8601 형식](https://en.wikipedia.org/wiki/ISO_8601)으로 나타냅니다. `startDate`가 과거이거나 현재인 경우 스트리밍이 실제로 시작된 것입니다. `startDate`가 미래인 경우 스트림이 그 시간에 시작될 예정이라는 것입니다. |

### `Clip`

중요한 부분 기능에 사용할 타임스탬프와 라벨을 Google에 알리려면 다음 속성을 [`VideoObject`](https://developers.google.com/search/docs/appearance/structured-data/video?hl=ko#video-object)에 중첩하세요. `Clip` 속성은 필수가 아니지만 Google에서 자동으로 동영상에 표시할 수 있는 동영상 세그먼트 대신, 본인이 직접 동영상에 지정한 타임스탬프와 라벨을 Google이 표시하도록 하려면 다음 속성을 추가해야 합니다.

`Clip`의 전체 정의는 [schema.org/Clip](https://schema.org/Clip)에서 확인할 수 있습니다.

| 필수 속성 | |
| --- | --- |
| `name` | `Text`  클립의 콘텐츠를 설명하는 제목 |
| `startOffset` | `Number`  작업의 시작 부분부터 초 단위로 표시된 클립의 시작 시간 |
| `url` | `URL`  클립의 시작 시간으로 연결되는 URL  클립 URL은 시간을 지정하는 추가 쿼리 매개변수가 포함된 동영상과 동일한 URL 경로로 연결되어야 합니다.  예를 들어 다음 URL은 동영상이 2분에 시작한다는 의미입니다.     ``` "url": "https://www.example.com/example?t=120" ``` |

| 권장 속성 | |
| --- | --- |
| `endOffset` | `Number`  작업의 시작 부분부터 초 단위로 표시된 클립의 종료 시간 |

### `SeekToAction`

Google이 동영상에서 자동으로 식별되는 중요한 부분을 표시할 수 있도록 URL 구조의 작동 방식을 Google에 알리려면 [`VideoObject`](#video-object)에 다음 속성을 중첩합니다. `SeekToAction` 속성은 필수가 아니지만 Google에서 URL 구조의 작동 방식을 이해하도록 하려면 다음 속성을 추가해야 합니다. 그러면 Google에서 동영상 내의 해당 지점으로 사용자를 연결할 수 있습니다.

동영상의 중요한 부분을 Google에서 자동으로 식별하도록 하는 대신 개발자가 직접 식별하고자 하는 경우 `SeekToAction` 대신 [`Clip` 마크업](#clip)을 사용합니다.

`SeekToAction`의 전체 정의는 [schema.org/SeekToAction](https://schema.org/SeekToAction)에서 확인하세요.

| 필수 속성 | |
| --- | --- |
| `potentialAction` | `SeekToAction`  잠재적 동작으로, 중첩된 다음 속성을 포함합니다.   * [`potentialAction.startOffset-input`](#start-offset-input) * [`potentialAction.target`](#target)   예:     ``` {   "@context": "https://schema.org",   "@type": "VideoObject",   "potentialAction" : {     "@type": "SeekToAction",     "target": "https://video.example.com/watch/videoID?t={seek_to_second_number}",     "startOffset-input": "required name=seek_to_second_number"   } } ``` |
| `potentialAction.startOffset-input` | `Text`  Google에서 타임스탬프 구조로 식별한 다음 건너뛸 시간(초)으로 바꿀 자리표시자 문자열입니다. 다음 값을 사용합니다.     ``` "startOffset-input": "required name=seek_to_second_number" ```   `startOffset-input`은 주석 처리된 속성입니다. 자세한 내용은 [`Potential Actions`](https://schema.org/docs/actions.html#part-4) 페이지를 참고하세요. |
| `potentialAction.target` | `EntryPoint`  이 `VideoObject`가 포함된 페이지의 URL(동영상에서 건너뛸 시간(초)의 삽입할 수 있는 위치를 나타내는 URL 구조의 자리표시자 포함)입니다. 이는 Google에서 URL 구조를 이해하는 방법이자 개발자가 타임스탬프의 형식을 지정하는 방법입니다. URL의 타임스탬프 부분을 다음 자리표시자 문자열로 바꿉니다.     ``` {seek_to_second_number} ```   예를 들어 URL의 타임스탬프 부분을 바꿉니다.     ``` "target": "https://video.example.com/watch/videoID?t=30" ```   그러면 이제 타임스탬프는 다음과 같습니다.     ``` "target": "https://video.example.com/watch/videoID?t={seek_to_second_number}" ``` |

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
