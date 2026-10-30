# robots.txt 파일 업데이트

> **출처(Source):** https://developers.google.com/crawling/docs/robots-txt/submit-updated-robots-txt?hl=ko
> **저작자(Attribution):** Google
> **라이선스(License):** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
> 이 문서는 Google 검색 센터 문서를 Markdown으로 변환한 사본입니다.
> 원문의 최신 내용은 위 출처 링크를 확인하세요.

---

# robots.txt 파일 업데이트

기존 robots.txt 파일의 규칙을 업데이트하려면 robots.txt 파일의 사본을 사이트에서 다운로드하여 필요에 따라 수정합니다. 그런 다음 업데이트된 파일을 사이트에 업로드합니다.

**Wix, Blogger와 같은 사이트 호스팅 서비스를 사용하는 경우** robots.txt 파일을 직접 수정할 필요가 없거나 수정하지 못할 수 있습니다. 대신, 호스팅 업체에서 검색엔진이 페이지를 크롤링할 수 있게 할지 결정하는 검색 설정 페이지나 기타 메커니즘을 제공할 수 있습니다.

검색엔진에서 페이지 중 하나를 숨기거나 숨기기 해제하려면 검색엔진에서 페이지 공개 상태를 수정하는 방법에 관한 호스팅 서비스의 안내를 찾아보세요. 예를 들어 '검색엔진에서 wix 페이지 숨기기'를 검색합니다.

## robots.txt 파일 다운로드

robots.txt 파일은 다음과 같은 여러 가지 방법으로 다운로드할 수 있습니다.

* robots.txt 파일로 이동(예: `https://example.com/robots.txt`)하여 콘텐츠를 컴퓨터의 새 텍스트 파일로 복사합니다. 새 로컬 파일을 만들 때는 [파일 형식](https://developers.google.com/crawling/docs/robots-txt/create-robots-txt?hl=ko#format_location)과 관련된 가이드라인을 따라야 합니다.
* cURL과 같은 도구를 사용하여 robots.txt 파일의 실제 사본을 다운로드합니다. 예를 들면 다음과 같습니다.

  ```
  curl https://example.com/robots.txt -o robots.txt
  ```
* Search Console의 [robots.txt 보고서](https://support.google.com/webmasters/answer/6062598?hl=ko)를 사용하여 robots.txt 파일의 콘텐츠를 복사한 다음 컴퓨터에 있는 파일에 붙여넣을 수 있습니다.

## robots.txt 파일 수정

사이트에서 다운로드한 robots.txt 파일을 텍스트 편집기에서 열고 필요에 따라 규칙을 수정합니다. [올바른 구문](https://developers.google.com/crawling/docs/robots-txt/create-robots-txt?hl=ko#create_rules)을 사용하고 UTF-8 인코딩으로 파일을 저장해야 합니다.

## robots.txt 파일 업로드

새 robots.txt 파일을 이름이 robots.txt인 텍스트 파일로 사이트의 루트 디렉터리에 업로드합니다. 파일을 사이트에 업로드하는 방법은 플랫폼과 서버에 따라 크게 달라집니다. [사이트에 robots.txt 파일을 업로드](https://developers.google.com/crawling/docs/robots-txt/create-robots-txt?hl=ko#upload)하는 데 도움이 되는 팁을 확인하세요.

**사이트의 루트 디렉터리에 파일을 업로드할 권한이 없는 경우 도메인 관리자에게 문의하여 변경합니다.**

예를 들어, 사이트 홈페이지가 `subdomain.example.com/site/example/` 아래에 있다면 `subdomain.example.com/robots.txt`에서 robots.txt 파일을 업데이트하지 못할 수도 있습니다. 이 경우 `example.com/` 소유자에게 연락하여 필요에 따라 robots.txt 파일을 변경하세요.

## Google의 robots.txt 캐시 새로고침

자동 크롤링 프로세스 중에 Google 크롤러는 robots.txt 파일의 변경사항을 감지하고 24시간마다 캐시된 버전을 업데이트합니다. 캐시를 더 빠르게 업데이트해야 한다면 [robots.txt 보고서](https://support.google.com/webmasters/answer/6062598?hl=ko)의 **재크롤링 요청** 기능을 사용합니다.
