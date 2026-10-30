# Google에서 색인을 생성할 수 있는 파일 형식

> **출처(Source):** https://developers.google.com/search/docs/crawling-indexing/indexable-file-types?hl=ko
> **저작자(Attribution):** Google
> **라이선스(License):** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
> 이 문서는 Google 검색 센터 문서를 Markdown으로 변환한 사본입니다.
> 원문의 최신 내용은 위 출처 링크를 확인하세요.

---

# Google에서 색인을 생성할 수 있는 파일 형식

Google은 대부분의 텍스트 기반 파일 콘텐츠와 인코딩된 특정 문서 형식의 색인을 생성할 수 있습니다. 파일 형식은 Google이 파일을 크롤링할 때 반환되는 `Content-Type` HTTP 헤더에 따라 결정되지만, 경우에 따라 `Content-Type` 헤더가 누락되거나 잘못된 경우 Google에서는 파일 확장자를 사용하거나 다른 파서를 사용하여 파일을 다시 파싱할 수 있습니다.

## 지원되는 플랫 파일 형식

다음과 같은 플랫 파일 형식이 지원됩니다. 콘텐츠가 인코딩되지 않은 일반 텍스트로 저장된 파일입니다(마크업 태그를 사용할 수 있음).

* 쉼표로 구분된 값(.csv)
* Google 어스(.kml, .kmz)
* GPS eXchange Format(.gpx)
* HTML(.htm, .html 및 기타 파일 확장자)
* Scalable Vector Graphics(.svg)
* TeX/LaTeX(.tex)
* 텍스트(.txt, .text 및 기타 파일 확장자). 다음과 같은 일반적인 프로그래밍 언어로 된 소스 코드 포함:
  + Basic 소스 코드(.bas)
  + C/C++ 소스 코드(.c, .cc, .cpp, .cxx, .h, .hpp)
  + C# 소스 코드(.cs)
  + Java 소스 코드(.java)
  + Perl 소스 코드(.pl)
  + Python 소스 코드(.py)
* Wireless Markup Language(.wml, .wap)
* XML(.xml)

## 지원되는 인코딩된 파일 형식

다음과 같은 인코딩된 파일 형식이 지원됩니다. 사람이 읽을 수 있는 텍스트를 추출하려면 특정 파서가 필요한 바이너리 파일 또는 복잡한 컨테이너입니다.

* Adobe Portable Document Format(.pdf)
* Adobe PostScript(.ps)
* 전자 출판(.epub)
* 한글 문서(.hwp)
* Microsoft Excel(.xls, .xlsx)
* Microsoft PowerPoint(.ppt, .pptx)
* Microsoft Word(.doc, .docx)
* OpenOffice presentation(.odp)
* OpenOffice spreadsheet(.ods)
* OpenOffice text(.odt)
* Rich Text Format(.rtf)

## 지원되는 미디어 형식

Google은 다음 미디어 형식의 색인도 생성할 수 있습니다.

* 이미지 형식: BMP, GIF, JPEG, PNG, WebP, SVG, AVIF
* 동영상 형식: 3GP, 3G2, ASF, AVI, DivX, M2V, M3U, M3U8, M4V, MKV, MOV, MP4, MPEG, OGV, QVT, RAM, RM, VOB, WebM, WMV, XAP

## 파일 형식으로 검색

Google 검색에서 `filetype:` 연산자를 사용하여 특정 파일 형식이나 파일 확장자로 검색결과를 제한할 수 있습니다. 예를 들어 `filetype:rtf galway`라고 입력하면 콘텐츠에 'galway'라는 용어가 포함되어 있으며 `.rtf`로 끝나는 RTF 파일과 URL을 검색합니다.
