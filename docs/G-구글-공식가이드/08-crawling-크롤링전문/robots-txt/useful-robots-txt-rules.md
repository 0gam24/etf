# 알아 두면 좋은 robots.txt 규칙

> **출처(Source):** https://developers.google.com/crawling/docs/robots-txt/useful-robots-txt-rules?hl=ko
> **저작자(Attribution):** Google
> **라이선스(License):** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
> 이 문서는 Google 검색 센터 문서를 Markdown으로 변환한 사본입니다.
> 원문의 최신 내용은 위 출처 링크를 확인하세요.

---

# 알아 두면 좋은 robots.txt 규칙

다음은 알아 두면 좋은 몇 가지 일반적인 robots.txt 규칙입니다.

| 유용한 규칙 | |
| --- | --- |
| 전체 사이트 크롤링 금지 | 사이트의 URL이 크롤링된 적이 없어도 색인이 생성되는 경우가 있다는 점을 기억하시기 바랍니다. **참고**: 이 규칙은 이름을 명시적으로 지정해야 하는 [여러 AdsBot 크롤러](https://developers.google.com/crawling/docs/crawlers-fetchers/overview-google-crawlers?hl=ko)에는 적용되지 않습니다.     ``` User-agent: * Disallow: / ``` |
| 전체 사이트 크롤링 허용(`Disallow` 규칙이 비어 있음) | 이렇게 하면 모든 크롤러가 전체 사이트에 액세스할 수 있습니다. 이는 robots.txt 파일이 없거나 `Allow: /` 규칙을 사용하는 것과 기능적으로 동일합니다.     ``` User-agent: * Disallow: ``` |
| 디렉터리 및 디렉터리의 콘텐츠 크롤링 금지 | 디렉터리 이름에 슬래시를 추가하여 전체 디렉터리의 크롤링을 금지합니다. **주의:** 비공개 콘텐츠에 대한 액세스를 차단하는 데 robots.txt를 사용하면 안 됩니다. 대신 적절한 인증 방법을 사용하세요. robots.txt 파일을 통해 금지된 URL은 크롤링되지 않아도 색인이 생성될 수 있으며 robots.txt 파일은 누구나 볼 수 있으므로 비공개 콘텐츠의 위치가 공개될 수도 있습니다.     ``` User-agent: * Disallow: /calendar/ Disallow: /junk/ Disallow: /books/fiction/contemporary/ ``` |
| 단일 웹페이지 크롤링 금지 | 예를 들어 `https://example.com/useless_file.html`에 있는 `useless_file.html` 페이지와 `junk` 디렉터리에 `other_useless_file.html` 페이지의 크롤링을 금지합니다.     ``` User-agent: * Disallow: /useless_file.html Disallow: /junk/other_useless_file.html ``` |
| 하위 디렉터리를 제외한 전체 사이트 크롤링 금지 | 크롤러는 `public` 하위 디렉터리에 한하여 액세스할 수 있습니다.     ``` User-agent: * Disallow: / Allow: /public/ ``` |
| 크롤러 하나에만 액세스 허용 | `Googlebot-News`만 전체 사이트를 크롤링할 수 있습니다.     ``` User-agent: Googlebot-News Allow: /  User-agent: * Disallow: / ``` |
| 하나를 제외한 모든 크롤러에 액세스 허용 | `Unnecessarybot`은 사이트를 크롤링하지 못할 수 있으며 다른 모든 크롤러는 크롤링할 수도 있습니다.     ``` User-agent: Unnecessarybot Disallow: /  User-agent: * Allow: / ``` |
| 전체 사이트 크롤링은 금지하지만 `Storebot-Google` 크롤링은 허용 | 이 구현으로 Google 검색 결과에서 페이지를 숨길 수 있지만 `Storebot-Google` 웹 크롤러는 여전히 페이지를 분석하여 Google 쇼핑에 제품을 표시할 수 있습니다.     ``` User-agent: * Disallow: /  User-agent: Storebot-Google Allow: / ``` |
| Google의 사이트 내 모든 이미지 크롤링 차단 (Google 이미지 및 디스커버를 비롯해 Google에 이미지가 표시되는 모든 위치 포함) | Google은 이미지와 동영상을 크롤링하지 않고는 색인을 생성할 수 없습니다.     ``` User-agent: Googlebot-Image Disallow: / ``` |
| Google 이미지의 특정 이미지 크롤링 차단 | 예를 들어 `dogs.jpg` 이미지를 금지합니다.     ``` User-agent: Googlebot-Image Disallow: /images/dogs.jpg ``` |
| 특정 파일 형식의 파일 크롤링 금지 | 예를 들어 모든 `.gif` 파일의 크롤링을 금지합니다.     ``` User-agent: Googlebot Disallow: /*.gif$ ``` |
| `*` 및 `$` 와일드 카드를 사용하여 특정 문자열로 끝나는 URL에 적용 | 예를 들어 `.xls` 파일은 모두 금지합니다.     ``` User-agent: Googlebot Disallow: /*.xls$ ```   `$` 와일드 카드는 URL의 끝을 나타냅니다. 즉, 패턴 뒤에 추가 문자가 있는 URL (예: URL 매개변수)은 일치하지 않습니다. 예를 들어 `https://example.com/cats.xls?personality=loki`는 `/*.xls$` 규칙에 의해 차단되지 **않습니다**. |
| 단일 그룹에 여러 사용자 에이전트 결합 | 여러 크롤러의 규칙을 하나의 그룹으로 통합하면 그룹의 모든 규칙이 나열된 모든 사용자 에이전트에 적용되므로 파일을 더 짧게 만들고 관리하기가 더 쉬워집니다. 이는 각각의 규칙과 함께 사용자 에이전트를 두 번 나열하는 것과 동일합니다.     ``` User-agent: Googlebot User-agent: Storebot-Google Allow: /cats Disallow: / ``` |
