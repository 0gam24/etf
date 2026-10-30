# Robots.txt 소개

> **출처(Source):** https://developers.google.com/search/docs/crawling-indexing/robots/intro?hl=ko
> **저작자(Attribution):** Google
> **라이선스(License):** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
> 이 문서는 Google 검색 센터 문서를 Markdown으로 변환한 사본입니다.
> 원문의 최신 내용은 위 출처 링크를 확인하세요.

---

# Robots.txt 소개

robots.txt 파일은 크롤러가 사이트에서 액세스할 수 있는 URL을 검색엔진 크롤러에 알려 줍니다.
이 파일은 주로 요청으로 인해 사이트가 오버로드되는 것을 방지하기 위해 사용하며, **웹페이지가 Google에 표시되는 것을 방지하기 위한 메커니즘이 아닙니다.** 웹페이지가 Google에 표시되지 않도록 하려면 [`noindex`로 색인 생성을 차단](https://developers.google.com/search/docs/crawling-indexing/block-indexing?hl=ko)하거나 비밀번호로 페이지를 보호해야 합니다.

**Wix나 Blogger 같은 CMS를 사용하는 경우** robots.txt 파일을 직접 수정할 필요가 없거나 수정하지 못할 수 있습니다. 대신, CMS에서 검색엔진이 페이지를 크롤링할 수 있게 할지 결정하는 검색 설정 페이지나 기타 메커니즘을 제공할 수 있습니다.

검색엔진에서 페이지 중 하나를 숨기거나 숨기기 해제하려면 검색엔진에서 페이지 공개 상태를 수정하는 방법에 관한 CMS의 안내를 찾아보세요. 예를 들어 '검색엔진에서 wix 페이지 숨기기'를 검색합니다.

## robots.txt 파일의 용도는 무엇인가요?

robots.txt 파일은 주로 사이트의 크롤러 트래픽을 관리하고, *일반적으로* 다음과 같은 파일 형식에 따라 Google에 파일을 표시하지 않기 위해 사용합니다.

| robots.txt가 다양한 파일 형식에 미치는 영향 | |
| --- | --- |
| 웹페이지 | 웹페이지(HTML, PDF, 기타 [Google에서 읽을 수 있는 미디어가 아닌 형식](https://developers.google.com/search/docs/crawling-indexing/indexable-file-types?hl=ko))에 robots.txt 파일을 사용하여 크롤링 트래픽을 관리하거나(서버에 Google 크롤러의 요청으로 인한 과부하가 발생할 것으로 생각되는 경우) 사이트에서 중요하지 않은 페이지 또는 비슷한 페이지의 크롤링을 방지할 수 있습니다.  **경고**: robots.txt 파일을 Google 검색 결과에서 웹페이지(PDF 및 Google에서 지원하는 기타 텍스트 기반 형식 포함)를 숨기는 수단으로 사용하지 마세요.  다른 페이지 내의 설명 텍스트에서 내 페이지를 가리키는 경우 Google은 페이지를 방문하지 않고도 URL의 색인을 생성할 수 있습니다. 검색결과에 페이지가 표시되지 않도록 하려면 비밀번호 보호나 [`noindex`](https://developers.google.com/search/docs/crawling-indexing/block-indexing?hl=ko) 등 다른 방법을 사용하세요.  **robots.txt 파일로 웹페이지를 차단하는 경우** URL은 여전히 검색 결과에 표시될 수 있지만 검색 결과에 [설명은 없습니다](https://support.google.com/webmasters/answer/7489871?hl=ko). 이미지 파일, 동영상 파일, PDF 및 기타 HTML이 아닌 파일도 크롤링이 허용된 다른 페이지에서 참조되지 않는 한 크롤링에서 제외됩니다. 페이지에 관한 검색결과가 이와 같이 표시되는 문제를 해결하려면 페이지를 차단하는 robots.txt 항목을 삭제하세요. 페이지를 Google 검색에서 완전히 숨기려면 [다른 방법](https://developers.google.com/search/docs/crawling-indexing/remove-information?hl=ko#i-control-the-web-page)을 사용해야 합니다. |
| 미디어 파일 | robots.txt 파일을 사용하여 크롤링 트래픽을 관리하고 Google 검색 결과에 이미지, 동영상, 오디오 파일이 표시되지 않도록 할 수도 있습니다. 이렇게 해도 다른 페이지에서 또는 다른 사용자가 내 이미지, 동영상, 오디오 파일에 연결하는 것을 막을 수는 없습니다.   * [Google에 이미지가 표시되지 않도록 하는 방법 자세히 알아보기](https://developers.google.com/search/docs/crawling-indexing/prevent-images-on-your-page?hl=ko) * [동영상 파일을 삭제하거나 Google에 동영상 파일이 표시되지 않도록 하는 방법 자세히 알아보기](https://developers.google.com/search/docs/appearance/video?hl=ko#remove) |
| 리소스 파일 | **리소스 파일(예: 중요하지 않은 이미지, 스크립트, 스타일 파일) 없이 페이지가 로드되어도 크게 영향을 받지 않는다면** robots.txt 파일을 사용하여 이러한 리소스 파일을 차단해도 됩니다. 하지만 이러한 리소스가 없이는 Google 크롤러가 페이지를 이해하기 어렵다면 차단해서는 안 됩니다. 차단하면 Google에서 이러한 리소스에 의존하는 페이지를 제대로 분석할 수 없게 됩니다. |

## robots.txt 파일의 제한사항에 대한 이해

robots.txt 파일을 작성하거나 수정하기 전에 이 URL 차단 방법의 제한사항에 관해 알아야 합니다. 목표와 상황에 따라 웹에서 URL을 검색할 수 없도록 하는 다른 메커니즘을 고려하는 것이 좋습니다.

* **robots.txt 규칙은 일부 검색엔진에서만 지원될 수 있습니다.**  
  robots.txt 파일의 지침은 사이트에서의 크롤러 동작을 강제로 제어할 수 없습니다. 크롤러가 지침을 준수할지를 스스로 판단하게 됩니다. Googlebot 및 기타 잘 제작된 웹 크롤러는 robots.txt 파일의 지침을 준수하지만 준수하지 않는 크롤러도 있습니다. 그러므로 웹 크롤러로부터 정보를 안전하게 보호하려면 [비밀번호로 서버의 비공개 파일을 보호](https://developers.google.com/search/docs/crawling-indexing/control-what-you-share?hl=ko)하는 등 다른 차단 방법을 사용하는 것이 더 좋습니다.
* **크롤러마다 구문을 다르게 해석합니다.**  
   잘 제작된 웹 크롤러는 robots.txt 파일의 규칙을 따르지만, 크롤러마다 규칙을 다르게 해석할 수도 있습니다. 특정 지침을 이해하지 못하는 크롤러도 있으므로 다양한 웹 크롤러에 적용될 수 있는 [적절한 구문](https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt?hl=ko#syntax)을 알아야 합니다.
* **robots.txt에서 허용되지 않은 페이지라도 다른 사이트에서 연결된 경우 여전히 색인이 생성될 수 있습니다.**  
  Google은 robots.txt 파일을 통해 차단된 콘텐츠를 크롤링하거나 콘텐츠의 색인을 생성하지 않지만, 허용되지 않은 URL이 웹상의 다른 곳에 연결된 경우 관련 정보를 찾아 색인을 생성할 수는 있습니다. 결과적으로 URL 주소뿐만 아니라 페이지 링크의 앵커 텍스트와 같은 기타 공개 정보가 Google 검색 결과에 표시될 수 있습니다. URL이 Google 검색 결과에 표시되지 않게 하려면 [서버의 파일을 비밀번호로 보호](https://developers.google.com/search/docs/crawling-indexing/control-what-you-share?hl=ko)하거나 [`noindex` `meta` 태그 또는 응답 헤더를 사용](https://developers.google.com/search/docs/crawling-indexing/block-indexing?hl=ko)하거나 페이지 전체를 삭제합니다.

**주의**: 여러 크롤링 및 색인 생성 규칙을 함께 사용할 경우 일부 규칙이 다른 규칙과 충돌할 수 있습니다. [크롤링을 색인 생성 및 게재 규칙과 결합](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag?hl=ko#combining)하는 방법을 알아보세요.

## robots.txt 파일을 만들거나 업데이트하기

파일이 필요하다고 판단되면 [robots.txt 파일을 만드는 방법](https://developers.google.com/search/docs/crawling-indexing/robots/create-robots-txt?hl=ko)을 알아보세요. 이미 있는 경우에는 [업데이트](https://developers.google.com/search/docs/crawling-indexing/robots/submit-updated-robots-txt?hl=ko) 방법을 알아보세요.
