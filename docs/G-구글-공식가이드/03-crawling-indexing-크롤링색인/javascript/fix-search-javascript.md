# 검색 관련 자바스크립트 문제 해결하기

> **출처(Source):** https://developers.google.com/search/docs/crawling-indexing/javascript/fix-search-javascript?hl=ko
> **저작자(Attribution):** Google
> **라이선스(License):** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
> 이 문서는 Google 검색 센터 문서를 Markdown으로 변환한 사본입니다.
> 원문의 최신 내용은 위 출처 링크를 확인하세요.

---

# 검색 관련 자바스크립트 문제 해결하기

이 가이드에서는 Google 검색에 페이지가 표시되거나 JavaScript 기반 페이지의 특정 콘텐츠가 표시되는 것을 차단할 수 있는 JavaScript 문제를 식별하고 수정하도록 안내합니다.
Google 검색은 JavaScript를 실행하지만, 크롤러가 콘텐츠에 액세스하고 렌더링하는 방법을 수용하려면 페이지와 애플리케이션을 설계할 때 몇 가지 차이점과 제한사항을 고려해야 합니다.
[JavaScript 검색엔진 최적화 기본사항 가이드](https://developers.google.com/search/docs/guides/javascript-seo-basics?hl=ko)에서 Google 검색용으로 JavaScript 사이트를 최적화하는 방법을 자세히 알아보세요.

Googlebot은 웹에서 바람직하게 작동하도록 만들어졌습니다. Googlebot의 [주요 우선순위](https://developers.google.com/search/blog/2017/01/what-crawl-budget-means-for-googlebot?hl=ko)는 크롤링이지만, 동시에 사이트를 방문하는 사용자의 환경에 방해가 되어서는 안 됩니다.
Googlebot 및 WRS(Web Rendering Service) 구성요소는 필수 페이지 콘텐츠에 기여하지 않는 리소스를 계속해서 분석하고 식별하며 이러한 리소스를 가져오지 않을 수 있습니다.
예를 들어 필수 페이지 콘텐츠에 기여하지 않는 보고 및 오류 요청, 이와 유사한 유형의 요청은 필수 페이지 콘텐츠를 추출하는 데 사용되지 않거나 불필요합니다. 클라이언트 측 분석은 사이트에서 Googlebot 및 WRS 활동을 완전하고 정확하게 표현하지 못할 수 있습니다.
[Google Search Console의 크롤링 통계 보고서](https://support.google.com/webmasters/answer/9679690?hl=ko)를 사용하여 사이트에 관한 Googlebot 및 WRS 활동과 의견을 모니터링하세요.

Google 검색에 페이지가 표시되거나 JavaScript 기반 페이지의 특정 콘텐츠가 표시되는 것을 차단할 수 있는 JavaScript 문제가 의심되는 경우 다음 단계를 따르시기 바랍니다. JavaScript가 주원인인지 확실하지 않으면 [일반 디버깅 가이드](https://developers.google.com/search/docs/guides/debug?hl=ko)에 따라 구체적인 문제를 확인하세요.

1. **Google에서 URL을 크롤링 및 렌더링하는 방식을 테스트하려면** Search Console에서 [리치 결과 테스트](https://search.google.com/test/rich-results?hl=ko) 또는 [URL 검사 도구](https://support.google.com/webmasters/answer/9012289?hl=ko)를 사용합니다.
   로드된 리소스, JavaScript 콘솔 출력 및 예외, 렌더링된 DOM, 추가 정보 등을 볼 수 있습니다.

   또한 Googlebot을 비롯하여 사용자가 사이트에서 경험한 JavaScript 오류를 수집 및 감사하여 콘텐츠 렌더링 방식에 영향을 줄 수 있는 문제를 파악하는 것이 좋습니다.
   다음 예는 [전역 onerror 핸들러](https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onerror)에 기록된 JavaScript 오류를 기록하는 방법을 보여 줍니다. 파싱 오류와 같은 일부 유형의 JavaScript 오류는 이 방법으로 기록할 수 없습니다.

   ```
   window.addEventListener('error', function(e) {
       var errorText = [
           e.message,
           'URL: ' + e.filename,
           'Line: ' + e.lineno + ', Column: ' + e.colno,
           'Stack: ' + (e.error && e.error.stack || '(no stack trace)')
       ].join('\n');

       // Example: log errors as visual output into the host page.
       // Note: you probably don't want to show such errors to users, or
       //       have the errors get indexed by Googlebot; however, it may
       //       be a useful feature while actively debugging the page.
       var DOM_ID = 'rendering-debug-pre';
       if (!document.getElementById(DOM_ID)) {
           var log = document.createElement('pre');
           log.id = DOM_ID;
           log.style.whiteSpace = 'pre-wrap';
           log.textContent = errorText;
           if (!document.body) document.body = document.createElement('body');
           document.body.insertBefore(log, document.body.firstChild);
       } else {
           document.getElementById(DOM_ID).textContent += '\n\n' + errorText;
       }

       // Example: log the error to remote service.
       // Note: you can log errors to a remote service, to understand
       //       and monitor the types of errors encountered by regular users,
       //       Googlebot, and other crawlers.
       var client = new XMLHttpRequest();
       client.open('POST', 'https://example.com/logError');
       client.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8');
       client.send(errorText);

   });
   ```
2. **[`soft 404` 오류](https://developers.google.com/search/docs/crawling-indexing/troubleshoot-crawling-errors?hl=ko#soft-404-errors)가 발생하지 않도록 방지해야 합니다.** 이는 단일 페이지 애플리케이션(SPA)에서 특히 어려울 수 있습니다. 오류 페이지의 색인을 생성하지 않으려면 다음 중 한 가지 전략을 사용하세요.
   * 서버가 `404` 상태 코드를 반환하는 URL로 리디렉션합니다.

     ```
     fetch(`https://api.kitten.club/cats/${id}`)
      .then(res => res.json())
      .then((cat) => {
        if (!cat.exists) {
          // redirect to page that gives a 404
          window.location.href = '/not-found';
        }
      });
     ```
   * robots `meta` 태그를 `noindex`로 추가하거나 변경합니다.

     ```
     fetch(`https://api.kitten.club/cats/${id}`)
      .then(res => res.json())
      .then((cat) => {
        if (!cat.exists) {
          const metaRobots = document.createElement('meta');
          metaRobots.name = 'robots';
          metaRobots.content = 'noindex';
          document.head.appendChild(metaRobots);
        }
      });
     ```

   SPA가 오류를 처리하는 데 클라이언트 측 JavaScript를 사용하는 경우 [적절한 상태 코드](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics?hl=ko#use-meaningful-http-status-codes) 대신 `200` HTTP 상태 코드를 보고하는 경우가 많습니다. 이렇게 되면 오류 페이지의 색인이 생성되고 검색결과에 표시될 수도 있습니다.
3. **Googlebot이 [사용자 권한 요청](https://w3c.github.io/permissions/#permission-registry)을 거부할 것이라고 예상합니다.**
     
   사용자 권한이 필요한 기능은 Googlebot 또는 모든 사용자에게 적합하지 않습니다. 예를 들어 `Camera API`를 필수로 설정하는 경우 Googlebot에서 카메라를 제공할 수 없습니다.
   대신 사용자가 카메라 액세스를 허용하지 않고도 콘텐츠에 액세스할 방법을 제공해야 합니다.
4. **다른 콘텐츠를 로드하기 위해 URL 프래그먼트를 사용하지 않습니다.**
     
   SPA에서 다른 뷰를 로드하기 위해 URL 프래그먼트(예: https://example.com/#/products)를 사용할 수 있습니다. 2015년 이후 [AJAX 크롤링 스킴은 지원이 중단되었으므로](https://developers.google.com/search/blog/2015/10/deprecating-our-ajax-crawling-scheme?hl=ko) Googelbot이 프래그먼트 URL을 제대로 처리하지 못할 수도 있습니다.
   SPA에서 URL을 기준으로 다른 콘텐츠를 로드하려면 [History API](https://developer.mozilla.org/en-US/docs/Web/API/History)를 사용하는 것이 좋습니다.
5. **콘텐츠를 제공하기 위해 데이터 지속성에 의존하지 않습니다.**
     
   WRS는 일반 브라우저와 마찬가지로 서버 및 클라이언트 리디렉션에 따라 각 URL을 로드합니다. Google이 콘텐츠를 발견하는 방식을 간략하게 알아보려면 [Google 검색의 작동 원리](https://developers.google.com/search/docs/fundamentals/how-search-works?hl=ko)를 참고하세요.
   하지만 WRS는 페이지 로드 전체에서 상태를 유지하지 않습니다.
   * 로컬 스토리지 및 세션 스토리지 데이터는 페이지 로드 도중에 삭제됩니다.
   * HTTP 쿠키는 페이지 로드 도중에 삭제됩니다.
6. **콘텐츠 지문 수집을 사용하여 Googlebot의 캐싱 문제를 방지합니다.**
     
   Googlebot은 네트워크 요청 및 리소스 사용을 줄이기 위해 적극적으로 캐싱을 실행합니다. WRS는 캐싱 헤더를 무시할 수 있으며, 이로 인해 WRS에서 오래된 JavaScript 또는 CSS 리소스를 사용할 수 있습니다. 콘텐츠 지문 수집은 `main.2bb85551.js`와 같이 콘텐츠의 지문을 파일 이름의 일부로 만들어 이 문제를 방지합니다.
   지문은 파일의 콘텐츠에 따라 달라지므로 업데이트할 때마다 다른 파일 이름이 생성됩니다. 자세한 내용은 [오래 지속되는 캐싱 전략에 관한 web.dev 가이드](https://web.dev/articles/http-cache?hl=ko#versioned-urls)를 참조하세요.
7. **애플리케이션이 모든 중요한 API에 [기능 감지](https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Cross_browser_testing/Feature_detection)를 사용하는지 확인하고 대체 동작 또는 폴리필을 제공합니다.**
     
   일부 웹 기능은 아직 모든 사용자 에이전트가 채택하지 않았을 수 있으며, 일부는 특정 기능을 고의로 사용 중지할 수도 있습니다. 예를 들어 WebGL을 사용하여 브라우저에서 사진 효과를 렌더링하는 경우, 기능 감지에서는 Googlebot이 WebGL을 지원하지 않음을 보여줍니다.
   이 문제를 해결하려면 사진 효과를 건너뛰거나 서버 측 렌더링을 사용하여 사진 효과를 미리 렌더링할 수 있습니다. 그러면 Googlebot을 비롯하여 모든 사용자가 콘텐츠에 액세스할 수 있습니다.
8. **HTTP 연결에서 콘텐츠가 작동하는지 확인합니다.**
     
   Googlebot은 HTTP 요청을 사용하여 서버에서 콘텐츠를 가져옵니다. `WebSockets` 또는 `WebRTC` 연결과 같은 다른 유형의 연결은 지원되지 않습니다.
   이러한 연결 문제를 방지하려면 HTTP 대체를 제공하여 콘텐츠를 가져오고 강력한 오류 처리 및 [기능 감지](#feature-detection)를 사용하세요.
9. **웹 구성요소가 정상적으로 렌더링되는지 확인합니다.**
   [리치 결과 테스트](https://search.google.com/test/rich-results?hl=ko) 또는 [URL 검사 도구](https://support.google.com/webmasters/answer/9012289?hl=ko)를 사용하여 렌더링된 HTML에 예상한 모든 콘텐츠가 있는지 확인합니다.
     
   WRS는 [light DOM 및 shadow DOM](https://developers.google.com/web/fundamentals/web-components/shadowdom?hl=ko#lightdom)을 평면화합니다.
   사용 중인 웹 구성요소가 light DOM 콘텐츠에 [`<slot>` 메커니즘](https://developers.google.com/web/fundamentals/web-components/shadowdom?hl=ko#slots)을 사용하지 않는 경우 웹 구성요소에 관한 문서를 참고하거나 다른 웹 구성요소를 사용하세요.
   자세한 내용은 [웹 구성요소에 관한 권장사항](https://developers.google.com/search/docs/guides/javascript-seo-basics?hl=ko#web-components)을 참고하세요.
10. **JavaScript 기반 페이월을 사용하는 경우 구현을 고려합니다.**
      
    일부 JavaScript 페이월 솔루션은 서버 응답에 전체 콘텐츠를 포함한 다음 JavaScript를 사용하여 구독 상태가 확인될 때까지 전체 콘텐츠를 숨깁니다. 이 방법은 콘텐츠에 대한 액세스를 제한하는 데 적합하지 않습니다. 구독 상태가 확인된 후에만 페이월에서 전체 콘텐츠를 제공해야 합니다.
11. 이 체크리스트에서 항목을 수정한 후 Search Console에서 [리치 결과 테스트](https://search.google.com/test/rich-results?hl=ko) 또는 [URL 검사 도구](https://search.google.com/search-console?hl=ko)를 사용하여 페이지를 **다시 테스트**합니다.
      
    문제가 해결되면 녹색 체크표시가 나타나고 오류가 표시되지 않습니다. 그래도 여전히 오류가 표시되면 [검색 센터 도움말 커뮤니티](https://support.google.com/webmasters/community?hl=ko)에 질문을 게시해 보세요.
