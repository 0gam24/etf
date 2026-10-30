# 구조화된 도서 작업(Book) 데이터

> **출처(Source):** https://developers.google.com/search/docs/appearance/structured-data/book?hl=ko
> **저작자(Attribution):** Google
> **라이선스(License):** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
> 이 문서는 Google 검색 센터 문서를 Markdown으로 변환한 사본입니다.
> 원문의 최신 내용은 위 출처 링크를 확인하세요.

---

# 구조화된 도서 작업(`Book`) 데이터

도서 관련 작업을 통해 Google 검색을 도서와 저자를 찾는 진입점으로 만들면 Google 검색 사용자가 Google 검색결과에서 바로 찾은 도서를 빠르게 구매하거나 대여할 수 있습니다.
예를 들어 사용자가 *샬롯의 거미줄*을 검색하면 결과가 표시되고 그 결과를 통해 사용자는 도서를 구매하거나 대여할 수 있습니다. 도서 제공업체는 여기에서 제공되는 구조화된 데이터 스키마를 사용하여 Google에 데이터 피드를 제공할 수 있습니다. Google의 사양은 사용자가 도서를 구매할 수 있는 `ReadAction`과 도서를 대여할 수 있는 `BorrowAction`을 제공합니다.

![Google 검색결과의 도서 작업](https://developers.google.com/static/search/docs/images/books01.png?hl=ko)

**참고**: 실제로 검색결과에 표시되는 모습은 다를 수 있습니다.
**참고:** 확실한 서비스 범위를 보장하고 Google 검색 사용자에게 더 나은 서비스를 제공하기 위해 다양한 도서를 공급하는 도서 제공업체만이 현재 이 기능을 사용할 수 있습니다. 참여하려면 [신청](https://docs.google.com/forms/d/e/1FAIpQLSd0mg2Yu6kNzBjkFSWQuiu61WIXo2kBmwFuwaA3JHiw7MfCdg/viewform?hl=ko)하세요. 신청을 통해 이 기능에 관심을 보여도 참여가 보장되는 것은 아닙니다.

패널에 통합된 읽기 작업과 대여 작업에는 도서 구매 또는 대여 옵션이 표시됩니다. 읽기 작업과 대여 작업에서는 도서 제공업체가 제공하는 링크를 통해 사용자를 지식 패널과 기타 Google 서비스에서 도서 제공업체의 웹사이트나 앱의 도서 페이지로 바로 연결합니다.

지식 패널에 표시되는 도서 제공업체의 순서는 각 사용자에게 맞춤설정되고 동적입니다. 즉, 사용자마다 순서가 다르게 표시되며 같은 사용자라도 때에 따라 다른 순서가 표시될 수 있습니다. 특정 순서에 영향을 미치는 요소는 다양합니다. 예를 들어 사용자가 지식 패널에서 특정 제공업체 링크를 자주 클릭하면 이 제공업체는 순위가 더 높을 수 있습니다. 순서를 제어하는 방법은 없습니다.

## 시작하기

도서 관련 작업을 제대로 구현하려면 도서 관련 작업 [구조화된 데이터 유형 정의](#structured-data-type-definitions)에 따라 피드를 빌드해야 하지만 먼저 다음 섹션을 검토하세요.

* [가이드라인](#guidelines)
* [피드 만들기](#create-your-feed)
* [데이터 피드 유효성 검사 도구로 피드 테스트](#test-your-feed-with-the-data-feed-validation-tool)
* [피드 파일 호스팅](#host-your-feed-file)
* [검토를 위해 피드 파일 제출](#submit-your-feed-file-for-review)
* [필요에 따라 피드 업데이트](#update-your-feed-as-needed)

## 가이드라인

Google 검색에서 안정적으로 도서를 표시하려면 중요한 세부정보와 주요 개념을 숙지해야 합니다. 또한 피드는 표준화된 형식 사양을 충족해야 합니다.

이렇게 하려면 여기에 설명된 가이드라인과 [구조화된 데이터 일반 가이드라인](https://developers.google.com/search/docs/appearance/structured-data/sd-policies?hl=ko) 및 [검색 Essentials](https://developers.google.com/search/docs/essentials?hl=ko)를 따르세요. 가이드라인은 다음과 같습니다.

* [저작물 및 판본](#works-and-editions)
* [도서관 시스템 및 도서관 회원](#library-systems-and-library-members)
* [ISBN 및 기타 지원되는 식별자](#isbn-and-other-supported-identifiers)
* [링크](#links)

### 저작물 및 판본

이 문서에서는 도서에 관해 이야기할 때 별개의 두 용어를 사용합니다.

* **저작물**: 추상적인 도서 개념입니다. 특히 제목, 저자, 원래 언어와 같은 메타데이터는 저작물의 속성입니다.
* **판본**: 구체적인 도서 사본입니다. 특히, 발행 연도, 판본 이름, 국제표준도서번호(ISBN)와 같은 메타데이터는 판본의 속성입니다.

예를 들어, *샬롯의 거미줄*은 *저작물*이며 판매되는 다양한 사본은 판본입니다. 이 경우 *샬롯의 거미줄*이라는 저작물에는 초판, 제2판, 요약판, 프랑스어 번역판 등이 있을 수 있습니다.

이러한 구분은 즉시 명확하지 않을 수 있는 피드에서 특히 중요합니다. [`Book` 항목](#book-entity)에는 다음의 두 가지가 있습니다.

* [`Book`(`Work`)](#book-work)은 '최상위' `Book` 항목입니다.
  + `workExample`은 `Work`의 속성이며 `Book`(`Edition`)의 인스턴스를 하나만 지정합니다.
  + 각 `Work`에 `workExample`이 하나 이상 있어야 합니다.
* [`Book`(`Edition`)](#book-edition)은 '하위 수준' `Book` 항목입니다.

한 저작물의 판본이 여러 개일 수 있음을 기억하면 도움이 됩니다. 이러한 판본을 최대한 많이 그룹화하는 것이 좋습니다. 이렇게 하면 Google 시스템에서 도서와 관련된 모든 정보를 활용하여 Google 검색에 도서를 표시할 수 있습니다. 꼭 필요하다면 여러 저작물 기록으로 나눌 수 있지만 각 저작물 기록에는 다음이 포함되어야 합니다.

* 다른 `@id`
* ISBN 또는 기타 지원되는 식별자가 있는 하나 이상의 판본

### 도서관 시스템 및 도서관 회원

**참고:** 이 섹션은 도서를 대여하는 제공업체와 관련이 있습니다.

[`Library entity`](#library-entity)는 '최상위' `Library` 항목 유형입니다. [`LibrarySystem`](#librarysystem) 항목과 이 도서관 시스템의 각 '하위 수준' [`Library (member)`](#library-member) 항목으로 구성된 추상 구조입니다.

`LibrarySystem` 항목은 추상 개념이며 도서관 *회원*의 공동작업 네트워크를 나타냅니다. 예를 들어 오스틴 공공도서관은 `LibrarySystem` 항목으로 지정할 수 있습니다. [오스틴 공공도서관 웹사이트](https://library.austintexas.gov/locations)에서는 텍사스주 오스틴에서 서비스를 제공하는 공공도서관 *시스템*으로 도서관을 설명합니다. 오스틴 공공도서관은 20개의 제휴 도서관 또는 도서관 *회원*으로 구성됩니다.

실제로 도서관이 도서관 시스템의 일부가 아니더라도 모든 `LibrarySystem` 항목에는 `Library (member)` 항목이 하나 이상 있어야 합니다. 이 시나리오에서는 도서 작업 구현을 위해 도서관이 자체 도서관 *시스템*의 유일한 도서관 *회원*입니다. 도서 작업 구현 시, 도서관 *시스템*과 달리 도서관 *회원*은 추상 개념이 아니므로 실제 주소가 있습니다.

반대로 모든 `Library (member)` 항목은 하나 이상의 `LibrarySystem` 항목에 속해야 합니다.

### ISBN 및 기타 지원되는 식별자

ISBN은 Google 검색이 피드 데이터를 Google 데이터와 일치시킬 때 주요 조정 신호입니다. 도서 제공업체는 Google 검색결과에 표시하려는 모든 도서에 ISBN 또는 기타 지원되는 식별자를 제공해야 합니다. 제공하지 않으면 도서를 일치시키지 못해 도서가 게재되지 않을 수 있습니다.

Google 검색에서는 ISBN-13을 선호하지만 다음을 대신 제공해도 됩니다.

* 온라인컴퓨터도서관센터(OCLC) 번호
* 미국의회도서관 제어 번호(LCCN)
* JP e-code

**경고:** ISBN-10은 Google 검색에서 허용되지 않습니다. ISBN-10 정보만 있는 도서의 경우 ISBN 변환 도구를 사용하여 ISBN-13으로 변환한 후 Google에 피드를 전송하세요.


**참고:** ISBN이 없는 도서라도 여전히 피드에서 이러한 도서를 제공할 수 있습니다.
Google 검색에서 사용자에게 표시되지 않을 수는 있지만 다음 방법으로 올바르게 일치시킬 수 있습니다.

* 모든 [`Edition`](#book-edition) 항목을 동일한 [저작물](#book-work) 아래에 그룹화하고 판본 중 하나 이상에 ISBN, OCLC 번호, LCCN 또는 JP e-code가 있는지 확인합니다. Google 검색에서는 다른 판본의 사용 가능한 ISBN 또는 기타 지원되는 식별자를 활용할 수 있습니다.
* 타사 식별자를 추가합니다. Google 검색은 현재 널리 사용되는 두 가지 도서관 제어 번호인 OCLC 번호나 LCCN을 지원합니다. 둘 중 하나가 있다면 제공하세요.

### 링크

사용자의 도서 검색 환경을 최적화하려면 피드의 링크가 다음 가이드라인을 준수해야 합니다.

* 동일한 콘텐츠에 중복 페이지가 있는 경우 링크는 도서 제목 및 기타 도서 정보가 포함된 [표준 URL](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls?hl=ko)이어야 합니다.
* 사용자가 읽기 작업 또는 대여 작업 링크를 클릭하면 도서 구매 또는 대여를 직접 지원하는 페이지로 연결되어야 합니다. 특히 콘텐츠를 구매하거나 대여하려면 링크를 더 클릭해야 하는 페이지로 작업 링크가 연결되도록 하지 마세요. 예를 들어 검색결과 페이지 또는 제품 요약 페이지로 사용자가 연결되어서는 안 됩니다.

## 피드 만들기

**참고:** 이 기능은 [신청 양식을 작성](https://docs.google.com/forms/d/e/1FAIpQLSd0mg2Yu6kNzBjkFSWQuiu61WIXo2kBmwFuwaA3JHiw7MfCdg/viewform?hl=ko)하고 온보딩된 도서 제공업체로 제한됩니다.

사이트에서 사용자가 구매하는 도서를 판매한다면 [`Book`](#book-entity) 피드를 업로드해야 합니다. Google 지원팀에서 곧 연락을 통해 피드를 업로드하는 방법과 위치에 관한 세부정보를 제공해 드리겠습니다.

사이트에서 사용자가 빌리는 도서를 대여한다면 [`Book`](#book-entity) 피드와 [`Library`](#library-entity) 피드라는 별도의 두 피드를 업로드해야 합니다. Google 지원팀에서 곧 연락을 통해 피드를 업로드하는 방법과 위치에 관한 세부정보를 제공해 드리겠습니다.

### 피드 파일 크기, 수량, 형식 요구사항 준수

요구사항은 다음과 같습니다.

* 피드 파일 크기 요구사항:
  + 압축하지 않은 피드 파일의 크기는 1GB 미만이어야 합니다.
  + 압축할 피드 파일은 1GB 미만이어야 합니다. 압축하지 않은 피드 파일이 1GB를 초과하면 파일을 여러 파일로 분할해야 합니다.
* 피드 파일을 압축할 수 있습니다. zip, gz, tar, tar.gz, JAR, ar, arj, cpio 또는 덤프 보관 파일로 형식이 지정되어야 합니다.
* 피드 파일이 여러 개인 경우 그대로 업로드하거나 원하는 경우 [사이트맵 색인 파일](https://developers.google.com/search/docs/crawling-indexing/sitemaps/large-sitemaps?hl=ko)의 일부로 포함할 수 있습니다.
* 단일 피드 파일에는 `.json` 파일 이름 확장자가 있어야 합니다.

### 피드 콘텐츠 요구사항 준수

특히 다음 피드 콘텐츠 요구사항을 준수해야 합니다.

* 피드에 오래된 항목이 없어야 합니다. 오래된 항목은 `availabilityEnds`가 지난 날짜 또는 사이트에서 더 이상 사용할 수 없는 항목으로 설정된 항목입니다.
* 피드에 포함하는 모든 딥 링크(예: `urlTemplate`)와 URL(예: `url`)은 프로덕션 URL이어야 합니다. 품질보증이나 개발, 다른 유형의 비프로덕션 URL을 사용하지 마세요.
* 모든 URL(예: `url`)은 [표준](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls?hl=ko)이어야 합니다.
* 피드의 각 항목은 다음 속성을 지정해야 합니다.
  + 고유 ID: `@id`
  + 고유 URL: `url`
  + 고유 딥 링크: `urlTemplate`

## 데이터 피드 유효성 검사 도구를 사용하여 피드 테스트

[데이터 피드 유효성 검사 도구](https://actions.google.com/tools/feed-validator/u/0/?hl=ko)에서 일반적인 오류 및 경고를 해결하는 데는 다음 문제 해결 단계를 따르는 것이 좋습니다.

* **유효성 검사** 필드에서 올바른 옵션이 선택되어 있는지 확인합니다.
  `Book` 항목에 **도서 작업**을 선택합니다.
* `@type` 값의 철자가 올바른지 확인합니다.
* `@context` 값이 올바르게 설정되어 있는지 확인합니다. `ReadAction` 및 `BorrowAction` 모두에 `"@context": "https://schema.org"`를 설정합니다.

## 피드 파일 호스팅

피드 파일이 준비되면 안전한 위치에 호스팅하세요. Google에서는 정기적으로 피드를 가져와서 콘텐츠가 최신 상태인지 확인합니다.

### 호스팅 메서드

다음과 같은 피드 호스팅 메서드가 지원됩니다.

| **호스팅** | **인증 지원** | |
| --- | --- | --- |
| Google Cloud Storage | *스토리지 객체 뷰어* 권한 |
| HTTPS | 사용자 이름 + 비밀번호 또는 [HTTP 클라이언트 인증서](https://web.dev/articles/enable-https?hl=ko) |
| SFTP | 비밀번호, 키 + 구문 또는 둘 다 |
| AWS S3 | 키 ID + 액세스 키 |

## 검토를 위해 피드 파일 제출

Google 검색에서 콘텐츠가 표시되도록 Google 지원팀에서는 피드의 딥 링크 품질을 검토합니다. 일부 딥 링크를 수동으로 테스트하여 사용자가 도서를 구매하거나 대여할 수 있는 페이지가 열리는지 확인하는 것이 좋습니다.

**참고:** 피드 제출에 사용해야 하는 [신청 양식](https://docs.google.com/forms/d/e/1FAIpQLSd0mg2Yu6kNzBjkFSWQuiu61WIXo2kBmwFuwaA3JHiw7MfCdg/viewform?hl=ko)과 함께 이 기능을 성공적으로 사용하는 것은 파트너로 제한됩니다.

피드 검토를 요청하려면 다음을 제공하세요.

* **호스트 위치:** 피드 파일의 URL입니다.
* **호스트 인증(적용되는 경우):** Google이 호스트 위치에서 피드 파일을 가져올 수 있는 사용자 인증 정보입니다.

## 필요에 따라 피드 업데이트

피드를 매일 업데이트하는 것이 좋지만 이는 카탈로그가 변경되는 빈도에 따라 최종적으로 결정됩니다. 다음 조건 및 도움말에 유의하세요.

* Google 검색은 실시간 업데이트를 지원하지 않습니다.
* Google 검색은 하루에 한 번 피드를 가져오고 일반적으로 2일 이내에 콘텐츠의 색인을 생성합니다.
* 판본의 가용성에 예측 가능한 변경사항이 있다면 `availabilityStarts` 및 `availabilityEnds`를 사용하여 정확한 날짜를 설정합니다. 항목을 더 이상 사용할 수 없는 경우 항목을 완전히 삭제하세요.

## 구조화된 데이터 유형 정의

콘텐츠를 구조화된 검색결과에 표시하려면 여기 나열된 필수 속성이 있어야 합니다. 권장 속성도 포함하여 콘텐츠에 관한 정보를 추가하면 더욱 만족스러운 사용자 환경을 제공할 수 있습니다.

### DataFeed 항목

Google에 전송되는 모든 schema.org 데이터 피드 파일에는 루트 수준에서 [`DataFeed`](https://schema.org/DataFeed)의 단일 항목이 포함되어야 합니다. 모든 [`Book`](#book-entity) 및 [`Library`](#library-entity) 항목은 `DataFeed` 항목의 `dataFeedElement` 필드 아래에 나열되어야 합니다.

Google에서 지원하는 속성은 다음과 같습니다.

| 필수 속성 | |
| --- | --- |
| `@context` | [`Text`](https://schema.org/Text)  `https://schema.org`로 설정합니다. |
| `@type` | [`Text`](https://schema.org/Text)  `DataFeed`로 설정합니다. |
| `dataFeedElement` | [`Book`](https://schema.org/Book) 또는 [`LibrarySystem`](https://schema.org/LibrarySystem)  단일 [`Book`](https://schema.org/Book) 항목 또는 [`LibrarySystem`](https://schema.org/LibrarySystem) 항목으로 설정합니다. 그 외의 경우 `Book` 항목 또는 `LibrarySystem` 항목의 배열로 설정합니다. `Book` 항목과 `LibrarySystem` 항목이 모두 포함된 배열로 설정하면 안 됩니다.  `Book` 피드에서 사용 예:     ``` {   "@context": "https://schema.org",   "@type": "DataFeed",   "dataFeedElement": [     {       "@context": "https://schema.org",       "@type": "Book",       "@id": "https://example.com/work/the_catcher_in_the_rye",       "url": "https://example.com/work/the_catcher_in_the_rye",       "name": "The Catcher in the Rye",       "author": {         "@type": "Person",         "name": "J.D. Salinger"       },       "sameAs": "https://en.wikipedia.org/wiki/The_Catcher_in_the_Rye",       "workExample": [         {           "@type": "Book",           "@id": "https://example.com/edition/the_catcher_in_the_rye_paperback",           "isbn": "9787543321724",           "bookEdition": "Mass Market Paperback",           "bookFormat": "https://schema.org/Paperback",           "inLanguage": "en",           ...         },         ...       ]    }   ],   "dateModified": "2018-09-10T13:58:26.892Z" } ```   `LibrarySystem` 피드에서 사용 예:     ``` {   "@context": "https://schema.org",   "@type": "DataFeed",   "dataFeedElement": [     {       "@context": "https://schema.org",       "@type": "LibrarySystem",       "@id": "https://example.com/library-systems/100",       "name": "Santa Clara County Library District",       "additionalProperty": [         {           "@type": "PropertyValue",           "name": "librarytype",           "value": "public"         }       ],       ...     },     ...   ],   "dateModified": "2018-09-10T13:58:26.892Z" } ```   **경고:** [피드 만들기](#create-your-feed)에 설명된 대로 [`Book`](#book-entity) 피드와 [`Library`](#library-entity) 피드가 모두 있다면 두 개의 별도 피드 파일이어야 합니다. 따라서 특정 `DataFeed` 항목의 경우 다음 조건 중 하나에 따라서만 `dataFeedElement` 속성을 설정할 수 있습니다.   * `dataFeedElement`를 단일 `Book` 항목 또는 `Book` 항목의 배열로 설정합니다. * `dataFeedElement`를 단일 `LibrarySystem` 항목 또는 `LibrarySystem` 항목의 배열로 설정합니다. |
| `dateModified` | [`DateTime`](https://schema.org/DateTime)  [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) 형식의 피드 최종 업데이트 날짜 및 시간입니다. |

### `Book` 항목

`Book`의 전체 정의는 [schema.org/Book](https://schema.org/Book)에서 확인할 수 있지만 다음 속성만 고려하면 됩니다. 피드에 포함하려는 모든 도서의 필수 속성을 정의해야 합니다. 권장 속성도 정의하여 콘텐츠에 관한 정보를 추가하면 더욱 만족스러운 사용자 환경을 제공할 수 있습니다.

#### `Book`(`Work`)

이 `Book` 항목은 최상위 항목 유형으로, *저작물*을 나타냅니다.

**요점:** [저작물 및 판본](#works-and-editions) 가이드라인을 읽고 구현에서 두 `Book` 항목의 차이를 파악합니다.

Google에서 지원하는 속성은 다음과 같습니다.

| 필수 속성 | |
| --- | --- |
| `@context` | [`Text`](https://schema.org/Text)  `https://schema.org`로 설정합니다. |
| `@id` | [`Text`](https://schema.org/Text)  도서의 전역 고유 ID로, URL 형식입니다. 조직에 고유해야 합니다. ID는 안정적이어야 하며 시간이 지남에 따라 변경되지 않아야 합니다. URL 형식이 권장되지만 필수는 아닙니다. 작동하는 링크가 아니어도 됩니다. `@id` 값에 사용되는 도메인은 조직에서 소유해야 합니다. |
| `@type` | [`Text`](https://schema.org/Text)  `Book`으로 설정합니다. |
| `author` | [`Person`](https://schema.org/Person) 또는 [`Organization`](https://schema.org/Organization)  도서의 저자입니다.  **참고**: 도서에 저자는 없지만, *기여자*가 한 명 이상 있다면 [schema.org/Book](https://schema.org/Book)에 정의된 대로 이러한 기여자를 포함합니다. 예를 들어, 도서에 알려진 저자 또는 기록된 저자는 없지만 대신 편집자가 여러 명 있을 수 있습니다.  반대로, 저자가 조직인 경우 [schema.org/Organization](https://schema.org/Organization)에 정의된 대로 그것에 맞게 저자를 정의합니다. 예를 들어 'Fundamentals of fire fighting skills(소방 기술의 기본)'라는 도서는 `National Fire Protection Association`이라는 조직이 저자일 수 있습니다. |
| `name` | [`Text`](https://schema.org/Text)  도서 제목입니다. |
| `url` | [`URL`](https://schema.org/URL)  도서를 소개하거나 설명하는 웹사이트의 URL입니다. 이 링크를 통해 Google 데이터베이스의 콘텐츠와 피드의 콘텐츠를 정확하게 조정할 수 있습니다. `workExample.target.urlTemplate`와 동일할 수 있습니다.  실제 방문 페이지의 경우 Google 검색에서는 `workExample.target.urlTemplate`에 제공된 URL을 사용합니다. |
| `workExample` | [`Book`](https://schema.org/Book) `(Edition)`  저작물의 판본입니다. |

| 권장 속성 | |
| --- | --- |
| `sameAs` | [`URL`](https://schema.org/URL)  저작물을 식별하는 참조 페이지의 URL입니다. 예를 들어 도서의 위키피디아, 위키데이터, VIAF 또는 미국의회도서관 페이지입니다. |

#### `Book`(`Edition`)

`workExample` 속성은 이 `Book` 항목을 사용합니다. *저작물*의 *판본*을 나타냅니다.

**요점:** [저작물 및 판본](#works-and-editions) 가이드라인을 읽고 구현에서 두 `Book` 항목의 차이를 파악합니다.

Google에서 지원하는 속성은 다음과 같습니다.

| 필수 속성 | |
| --- | --- |
| `@id` | [`Text`](https://schema.org/Text)  도서의 전역 고유 ID로, URL 형식입니다. 조직에 고유해야 합니다. ID는 안정적이어야 하며 시간이 지남에 따라 변경되지 않아야 합니다. URL 형식이 권장되지만 필수는 아닙니다. 작동하는 링크가 아니어도 됩니다. `@id` 값에 사용되는 도메인은 조직에서 소유해야 합니다. |
| `@type` | [`Text`](https://schema.org/Text)  `Book`으로 설정합니다. |
| `bookFormat` | [`Enum`](https://schema.org/Enumeration)  판본의 형식입니다. 값은 다음 중 하나여야 합니다.   * `https://schema.org/AudiobookFormat` * `https://schema.org/EBook` * `https://schema.org/Hardcover` * `https://schema.org/Paperback` |
| `inLanguage` | [`Text`](https://schema.org/Text)  판본에 있는 콘텐츠의 기본 언어입니다. [ISO 639-1 alpha-2 코드 목록](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)의 두 글자 코드 중 하나를 사용합니다. |
| `isbn` | [`Text`](https://schema.org/Text)  판본의 ISBN-13입니다. ISBN-10이 있다면 ISBN-13으로 변환합니다. |
| `potentialAction` | [`ReadAction`](https://schema.org/ReadAction) 또는 [`BorrowAction`](https://schema.org/BorrowAction)  사용자가 도서를 구매하거나 다운로드하도록 실행되는 작업입니다. 자세한 내용은 [`ReadAction`](#readaction-potentialaction) 또는 [`BorrowAction`](#borrowaction-potentialaction)을 참고하세요. |

| 권장 속성 | |
| --- | --- |
| `author` | [`Person`](https://schema.org/Person) 또는 [`Organization`](https://schema.org/Organization)  판본의 저자입니다.  **참고:** 판본의 저자가 저작물 저자 정보와 다를 때만 사용하세요.  판본에 저자가 없지만 *기여자*가 한 명 이상 있다면 [schema.org/Book](https://schema.org/Book)에 정의된 대로 기여자를 포함합니다. 예를 들어, 판본에 알려진 저자 또는 기록된 저자는 없지만 대신 편집자가 여러 명일 수 있습니다.  반대로 판본의 저자가 조직인 경우 [schema.org/Organization](https://schema.org/Organization)에 정의된 대로 저자를 정의합니다. 예를 들어, *미국 심리학회 출판 매뉴얼(Publication manual of the American Psychological Association) 6판*의 저자는 `American Psychological Association`이라는 조직일 수 있습니다. |
| `bookEdition` | [`Text`](https://schema.org/Text)  도서의 판본 정보입니다. 예: `2nd Edition` |
| `datePublished` | [`Date`](https://schema.org/Date)  판본의 발행 날짜로 YYYY-MM-DD 또는 YYYY 형식입니다. 특정 날짜이거나 특정 연도일 수 있습니다. |
| `identifier` | [`PropertyValue`](https://schema.org/PropertyValue)  이 판본을 명확하게 식별하는 외부 또는 기타 ID입니다. 여러 식별자가 허용됩니다. 자세한 내용은 [`PropertyValue`(`identifier`)](#propertyvalue-identifier)를 참조하세요.  이 속성은 반복될 수 있습니다. |
| `name` | [`Text`](https://schema.org/Text)  판본의 제목입니다. 판본의 제목이 저작물의 제목과 다를 때만 사용합니다. |
| `sameAs` | [`URL`](https://schema.org/URL)  판본을 명확하게 나타내는 참조 웹페이지의 URL입니다. 예를 들어 이 특정 판본의 위키피디아 페이지입니다. `Work`의 `sameAs`를 다시 사용하지 마세요. |
| `url` | [`URL`](https://schema.org/URL)  판본을 소개하거나 설명하는 웹사이트의 URL입니다. `workExample.target.urlTemplate`과 동일할 수 있습니다. |

`Book`(`Edition`) 예:

```
"workExample":
        {
          "@type": "Book",
          "@id": "https://example.com/book/100",
          "inLanguage": "en",
          "isbn": "9787543321724",
          "bookEdition": "20 Anniversary Edition",
          "datePublished": "2000-02-26",
          "bookFormat": "https://schema.org/Hardcover",
          "potentialAction": {...}
        }
```

여러 `workExample` 속성이 있는 `Book`(`Edition`) 예:

```
"workExample": [
        {
          "@type": "Book",
          "@id": "https://example.com/book/200",
          "inLanguage": "zh",
          "isbn": "9787543321721",
          "bookEdition": "2nd Edition",
          "bookFormat": "https://schema.org/Hardcover",
          "potentialAction": {...}
        },
        {
          "@type": "Book",
          "@id": "https://example.com/book/300",
          "inLanguage": "zh",
          "isbn": "9787543321722",
          "bookEdition": "1st Edition",
          "bookFormat": "https://schema.org/EBook",
          "potentialAction": {...}
      }
 ]
```

### `Person` 또는 `Organization`(`author`)

도서의 `author` 속성은 `Person` 또는 `Organization` 항목을 사용합니다.

| 필수 속성 | |
| --- | --- |
| `@type` | [`Text`](https://schema.org/Text)  `Person` 또는 `Organization`으로 설정합니다. |
| `name` | [`Text`](https://schema.org/Text)  사람 또는 조직의 이름입니다. |

| 권장 속성 | |
| --- | --- |
| `sameAs` | [`URL`](https://schema.org/URL)  개인 또는 조직의 신원을 명확하게 나타내는 참조 웹페이지 URL입니다. 예를 들어, 개인이나 조직의 위키피디아 페이지가 있습니다. |

`author` 예:

```
"author": {
  "@type": "Person",
  "name": "William Shakespeare"
}
```

여러 `author` 속성이 있는 예:

```
"author": [
  {
    "@type": "Person",
    "name": "William Shakespeare"
  },
  {
    "@type": "Person",
    "name": "Victor Hugo",
    "sameAs": "https://en.wikipedia.org/wiki/Victor_Hugo"
  }
]
```

### PropertyValue(식별자)

`Edition`의 `identifier` 속성은 `PropertyValue` 항목을 사용합니다.

| 필수 속성 | |
| --- | --- |
| `@type` | [`Text`](https://schema.org/Text)  `PropertyValue`로 설정합니다. |
| `propertyID` | [`Text`](https://schema.org/Text)  ID 유형입니다. [ISBN 및 기타 지원되는 식별자](#isbn-and-other-supported-identifiers)에 설명된 대로 다음 중 하나여야 합니다.   * `OCLC_NUMBER` * `LCCN` * `JP_E-CODE` |
| `value` | [`Text`](https://schema.org/Text)  ID 값입니다. 이 판본을 명확하게 식별하는 외부 ID입니다. 외부 ID의 숫자가 아닌 모든 접두사를 삭제합니다. |

`identifier` 예:

```
    "identifier": {
      "@type": "PropertyValue",
      "propertyID": "OCLC_NUMBER",
      "value":  "110123456"
    }
```

여러 `identifier` 속성이 있는 예:

```
    "identifier": [
    {
      "@type": "PropertyValue",
      "propertyID": "OCLC_NUMBER",
      "value":  "110123456"
    },
    {
      "@type": "PropertyValue",
      "propertyID": "LCCN",
      "value":  "220123456"
    },{
      "@type": "PropertyValue",
      "propertyID": "JP_E-CODE",
      "value":  "12345678901234567890"
    }]
```

### `ReadAction` `Book` 피드 JSON 파일 예

```
{
  "@context": "https://schema.org",
  "@type": "DataFeed",
  "dataFeedElement": [
    {
      "@context": "https://schema.org",
      "@type": "Book",
      "@id": "https://example.com/work/the_catcher_in_the_rye",
      "url": "https://example.com/work/the_catcher_in_the_rye",
      "name": "The Catcher in the Rye",
      "author": {
        "@type": "Person",
        "name": "J.D. Salinger"
      },
      "sameAs": "https://en.wikipedia.org/wiki/The_Catcher_in_the_Rye",
      "workExample": [
        {
          "@type": "Book",
          "@id": "https://example.com/edition/the_catcher_in_the_rye_paperback",
          "isbn": "9787543321724",
          "bookEdition": "Mass Market Paperback",
          "bookFormat": "https://schema.org/Paperback",
          "inLanguage": "en",
          "url": "https://example.com/edition/the_catcher_in_the_rye_paperback",
          "datePublished": "1991-05-01",
          "identifier": {
            "@type": "PropertyValue",
            "propertyID": "OCLC_NUMBER",
            "value": "1057320822"
          },
          "potentialAction": {
            "@type": "ReadAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://example.com/store/9787543321724",
              "actionPlatform": [
                "https://schema.org/DesktopWebPlatform",
                "https://schema.org/AndroidPlatform",
                "https://schema.org/IOSPlatform"
              ]
            },
            "expectsAcceptanceOf": {
              "@type": "Offer",
              "category": "purchase",
              "price": 6.99,
              "priceCurrency": "USD",
              "availabilityStarts": "2020-01-01T11:0:00-04:00",
              "availabilityEnds": "2050-06-30T23:59:00-04:00",
              "eligibleRegion": {
                "@type": "Country",
                "name": "US"
              }
            }
          }
        },
        {
          "@type": "Book",
          "@id": "https://example.com/edition/the_catcher_in_the_rye_hardcover",
          "isbn": "9780316769532",
          "bookEdition": "Hardcover",
          "bookFormat": "https://schema.org/Hardcover",
          "inLanguage": "en",
          "url": "https://example.com/edition/the_catcher_in_the_rye_hardcover",
          "datePublished": "1951-07-16",
          "potentialAction": {
            "@type": "ReadAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://example.com/store/9780316769532",
              "actionPlatform": [
                "https://schema.org/DesktopWebPlatform",
                "https://schema.org/AndroidPlatform",
                "https://schema.org/IOSPlatform"
              ]
            },
            "expectsAcceptanceOf": [
              {
                "@type": "Offer",
                "category": "nologinrequired",
                "availabilityStarts": "2020-01-01T11:0:00-04:00",
                "availabilityEnds": "2050-06-30T23:59:00-04:00",
                "eligibleRegion": [
                  {
                    "@type": "Country",
                    "name": "US"
                  },
                  {
                    "@type": "Country",
                    "name": "GB"
                  }
                ]
              },
              {
                "@type": "Offer",
                "category": "Subscription",
                "availabilityStarts": "2020-01-01T11:0:00-04:00",
                "availabilityEnds": "2050-06-30T23:59:00-04:00",
                "eligibleRegion": {
                  "@type": "Country",
                  "name": "IN"
                }
              }
            ]
          }
        }
      ]
    }
  ],
  "dateModified": "2018-09-10T13:58:26.892Z"
}
```

### `BorrowAction` `Book` 피드 JSON 파일 예

```
{
  "@context": "https://schema.org",
  "@type": "DataFeed",
  "dataFeedElement": [
    {
      "@context": "https://schema.org",
      "@type": "Book",
      "@id": "https://example.com/work/the_catcher_in_the_rye",
      "url": "https://example.com/work/the_catcher_in_the_rye",
      "name": "The Catcher in the Rye",
      "author": {
        "@type": "Person",
        "name": "J.D. Salinger"
      },
      "sameAs": "https://en.wikipedia.org/wiki/The_Catcher_in_the_Rye",
      "workExample": [
        {
          "@type": "Book",
          "@id": "https://example.com/edition/the_catcher_in_the_rye_paperback",
          "isbn": "9787543321724",
          "bookEdition": "Mass Market Paperback",
          "bookFormat": "https://schema.org/Paperback",
          "inLanguage": "en",
          "url": "https://example.com/edition/the_catcher_in_the_rye_paperback",
          "datePublished": "1991-05-01",
          "identifier": {
            "@type": "PropertyValue",
            "propertyID": "OCLC_NUMBER",
            "value": "1057320822"
          },
          "potentialAction": {
            "@type": "BorrowAction",
            "lender": {
              "@type": "LibrarySystem",
              "@id": "https://example.com/librarySystem/100"
            },
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://example.com/borrowpurchase?bookId=170",
              "actionPlatform": [
                "https://schema.org/DesktopWebPlatform",
                "https://schema.org/AndroidPlatform",
                "https://schema.org/IOSPlatform"
              ]
            }
          }
        },
        {
          "@type": "Book",
          "@id": "https://example.com/edition/the_catcher_in_the_rye_hardcover",
          "isbn": "9780316769532",
          "bookEdition": "Hardcover",
          "bookFormat": "https://schema.org/Hardcover",
          "inLanguage": "en",
          "url": "https://example.com/edition/the_catcher_in_the_rye_hardcover",
          "datePublished": "1951-07-16",
          "potentialAction": {
            "@type": "BorrowAction",
            "lender": {
              "@type": "LibrarySystem",
              "@id": "https://example.com/librarySystem/100"
            },
            "target": [
              {
                "@type": "EntryPoint",
                "urlTemplate": "https://example.com/borrowpurchase?bookId=170",
                "actionPlatform": [
                  "https://schema.org/DesktopWebPlatform"
                ]
              },
              {
                "@type": "EntryPoint",
                "urlTemplate": "https://example.com/mobile/borrowpurchase?bookId=170",
                "actionPlatform": [
                  "https://schema.org/AndroidPlatform",
                  "https://schema.org/IOSPlatform"
                ]
              }
            ]
          }
        }
      ]
    }
  ],
  "dateModified": "2018-09-10T13:58:26.892Z"
}
```

### `ReadAction`(`potentialAction`)

`potentialAction` 속성은 `ReadAction` 항목을 사용합니다.
`ReadAction`은 도서에 액세스하는 딥 링크, 도서를 판매하는 소매업체, 사용자가 충족해야 하는 기준을 정의합니다. 기준에는 멤버십 상태, 로그인 상태, 위치 또는 도서에 액세스하는 데 필요한 다른 모든 사항이 포함될 수 있습니다.

| 필수 속성 | |
| --- | --- |
| `@type` | [`Text`](https://schema.org/Text)  `ReadAction`으로 설정합니다. |
| `expectsAcceptanceOf` | [`Offer`](https://schema.org/Offer)  이 항목에 액세스하기 위한 사용자 요구사항의 정의입니다. `Offer` 속성이 여러 개 있다면 `Offer` 기준 중 어느 *하나*라도 일치하는 사용자가 콘텐츠에 액세스할 수 있습니다.  이 속성은 반복될 수 있습니다. |
| `expectsAcceptanceOf.@type` | [`Text`](https://schema.org/Text)  `Offer`로 설정합니다. |
| `expectsAcceptanceOf.category` | [`Text`](https://schema.org/Text)  `Offer`의 유형입니다. 다음 값 중 하나여야 합니다.   * `nologinrequired`: 이 작업은 콘텐츠에 액세스하기 위해 구매 또는 로그인을 하지 않은 사용자가 사용할 수 있습니다. * `free`: 이 작업은 사용자가 구매나 유료 구독을 하지 않아도 사용할 수 있습니다. 그러나 이 작업을 실행하려면 사용자가 로그인해야 합니다. * `subscription`: 도서가 서비스 유료 구독과 함께 포함됩니다. * `purchase`: 구매를 통해 도서에 액세스할 수 있습니다. * `rental`: 구매 후 일정 기간 도서에 액세스할 수 있습니다. |
| `expectsAcceptanceOf.eligibleRegion` | [`Country`](https://schema.org/Country)  이 `Offer`를 사용할 수 있는 국가입니다. 콘텐츠를 사용할 수 있거나 사용할 수 없는 국가와 지역을 제어하는 데 사용할 수 있습니다.  이 속성은 반복될 수 있습니다. |
| `expectsAcceptanceOf.eligibleRegion.@type` | [`Text`](https://schema.org/Text)  `Country`로 설정합니다. |
| `expectsAcceptanceOf.eligibleRegion.name` | [`Text`](https://schema.org/Text)  [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) 국가 코드입니다. |
| `target` | [`EntryPoint`](https://schema.org/EntryPoint)  딥 링크의 사양으로, 지원되는 플랫폼 정보가 포함되어 있습니다. 다양한 플랫폼 세트의 다른 딥 링크를 정의하는 여러 `EntryPoint` 속성이 있을 수 있습니다.  이 속성은 반복될 수 있습니다. |
| `target.@type` | [`Text`](https://schema.org/Text)  `EntryPoint`로 설정합니다. |
| `target.actionPlatform` | [`Text`](https://schema.org/Text)  이 딥 링크가 유효한 플랫폼입니다. 다음 값 중 하나를 사용하세요.   * `https://schema.org/DesktopWebPlatform` * `https://schema.org/AndroidPlatform` * `https://schema.org/IOSPlatform`   이 속성은 반복될 수 있습니다. |
| `target.urlTemplate` | [`URL`](https://schema.org/URL)  사용자를 도서의 방문 페이지 콘텐츠로 바로 연결하는 링크입니다. |

| 권장 속성 | |
| --- | --- |
| `expectsAcceptanceOf.availabilityEnds` | [`DateTime`](https://schema.org/DateTime)  서비스 일정의 종료 시간입니다. 도서가 더 이상 사용자에게 표시되지 않아야 하는 정확한 시간을 제어하는 데 사용할 수 있습니다. |
| `expectsAcceptanceOf.availabilityStarts` | [`DateTime`](https://schema.org/DateTime)  서비스 일정의 시작 시간입니다. 도서가 사용자에게 표시될 수 있는 정확한 시간을 제어하는 데 사용할 수 있습니다. |
| `expectsAcceptanceOf.price` | [`Number`](https://schema.org/Number)  도서의 구매 가격입니다. `Offer` 속성의 `category`가 `purchase` 또는 `rental`로 설정된 경우에 필요합니다. |
| `expectsAcceptanceOf.priceCurrency` | [`Text`](https://schema.org/Text)  가격에 사용된 통화로, 3글자 [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) 형식으로 나타냅니다. |

`ReadAction` 예:

```
"potentialAction": {
  "@type": "ReadAction",
  "target": {
    "@type": "EntryPoint",
    "urlTemplate": "https://example.com/purchase?bookId=170",
    "actionPlatform": [
      "https://schema.org/DesktopWebPlatform",
      "https://schema.org/AndroidPlatform",
      "https://schema.org/IOSPlatform"
    ]
  },
  "expectsAcceptanceOf": {
    "@type": "Offer",
    "category": "purchase",
    "price": 9.99,
    "priceCurrency": "USD",
    "availabilityStarts": "2018-04-01T11:01:00-04:00",
    "availabilityEnds": "2018-06-30T23:59:00-04:00",
    "eligibleRegion": {
      "@type": "Country",
      "name": "US"
    }
  }
}
```

여러 `EntryPoint` 속성이 있는 `ReadAction` 예:

```
"potentialAction": {
  "@type": "ReadAction",
  "target": [
    {
      "@type": "EntryPoint",
      "urlTemplate": "https://example.com/purchase?bookId=170",
      "actionPlatform": [
        "https://schema.org/DesktopWebPlatform"
      ]
    },
    {
      "@type": "EntryPoint",
      "urlTemplate": "https://example.com/mobile/purchase?bookId=170",
      "actionPlatform": [
        "https://schema.org/AndroidPlatform",
        "https://schema.org/IOSPlatform"
      ]
    }
  ],
  "expectsAcceptanceOf": [
    {
      "@type": "Offer",
      "category": "noLoginRequired",
      "availabilityStarts": "2018-04-01T11:01:00-04:00",
      "availabilityEnds": "2018-06-30T23:59:00-04:00",
      "eligibleRegion": [
        {
          "@type": "Country",
          "name": "US"
        },
        {
          "@type": "Country",
          "name": "GB"
        }
      ]
    },
    {
      "@type": "Offer",
      "category": "Subscription",
      "availabilityStarts": "2018-04-01T11:01:00-04:00",
      "availabilityEnds": "2018-06-30T23:59:00-04:00",
      "eligibleRegion": {
        "@type": "Country",
        "name": "IN"
      }
    }
  ]
}
```

### `BorrowAction`(`potentialAction`)

`potentialAction` 속성은 `BorrowAction` 항목을 사용합니다.
`BorrowAction`은 도서에 액세스하는 딥 링크, 도서가 있는 도서관, 사용자가 충족해야 하는 기준을 정의합니다. 기준에는 멤버십 상태, 로그인 상태, 위치 또는 도서에 액세스하는 데 필요한 다른 모든 사항이 포함될 수 있습니다.

| 필수 속성 | |
| --- | --- |
| `@type` | [`Text`](https://schema.org/Text)  `BorrowAction`으로 설정합니다. |
| `lender` | [`LibrarySystem`](https://schema.org/LibrarySystem)  이 판본의 액세스 권한을 제공하는 도서관 시스템입니다. |
| `lender.@id` | [`URL`](https://schema.org/URL)  `LibrarySystem`의 ID 참조로, 도서관 피드에서 개별적으로 완전히 설명해야 합니다. |
| `lender.@type` | [`Text`](https://schema.org/Text)  `LibrarySystem`으로 설정합니다. |
| `target` | [`EntryPoint`](https://schema.org/EntryPoint)  딥 링크의 사양으로, 지원되는 플랫폼 정보가 포함되어 있습니다. 다양한 플랫폼 세트의 딥 링크를 정의하려면 `EntryPoint` 배열을 지정합니다.  이 속성은 반복될 수 있습니다. |
| `target.@type` | [`Text`](https://schema.org/Text)  `EntryPoint`로 설정합니다. |
| `target.actionPlatform` | [`Text`](https://schema.org/Text)  이 딥 링크가 유효한 플랫폼입니다. 다음 값 중 하나를 사용하세요.   * `https://schema.org/DesktopWebPlatform` * `https://schema.org/AndroidPlatform` * `https://schema.org/IOSPlatform`   이 속성은 반복될 수 있습니다. |
| `target.urlTemplate` | [`URL`](https://schema.org/URL)  사용자를 도서의 방문 페이지 콘텐츠로 바로 연결하는 링크입니다. |

`BorrowAction` 예:

```
"potentialAction": {
  "@type": "BorrowAction",
  "lender": {
    "@type": "LibrarySystem",
    "@id": "https://example.com/librarySystem/100"
  },
  "target": {
    "@type": "EntryPoint",
    "urlTemplate": "https://example.com/borrow?bookId=170",
    "actionPlatform": [
      "https://schema.org/DesktopWebPlatform",
      "https://schema.org/AndroidPlatform",
      "https://schema.org/IOSPlatform"
    ]
  }
}
```

여러 `EntryPoint` 속성이 있는 `BorrowAction` 예:

```
"potentialAction": {
  "@type": "BorrowAction",
  "lender": {
    "@type": "LibrarySystem",
    "@id": "https://example.com/librarySystem/100"
  },
  "target": [
    {
      "@type": "EntryPoint",
      "urlTemplate": "https://example.com/borrow?bookId=170",
      "actionPlatform": [
        "https://schema.org/DesktopWebPlatform"
      ]
    },
    {
      "@type": "EntryPoint",
`      "urlTemplate": "https://example.com/mobile/borrow?bookId=170",
      "actionPlatform": [
        "https://schema.org/AndroidPlatform",
        "https://schema.org/IOSPlatform"
      ]
    }
  ]
}
```

### `Library` 항목

`Library`의 전체 정의는 [schema.org/Library](https://schema.org/Library)에서 확인할 수 있지만 다음 속성만 고려하면 됩니다. 피드에 포함하려는 모든 도서관의 필수 속성을 정의해야 합니다.
권장 속성도 정의하여 콘텐츠에 관한 정보를 추가하면 더욱 만족스러운 사용자 환경을 제공할 수 있습니다.

이 `Library` 항목은 최상위 `Library` 항목 유형으로, `LibrarySystem` 항목과 `LibrarySystem`의 각 하위 수준 `Library (member)` 항목으로 구성된 추상 구조입니다.

`Library` 피드는 `Book` 피드와 다릅니다. 따라서 구현할 수 있는 `Library` 피드는 `Book` 피드와 완전히 별개여야 합니다.
자세한 내용은 [피드 만들기](#create-your-feed)를 참고하세요.

**요점:** [도서관 시스템 및 도서관 회원](#library-systems-and-library-members) 가이드라인을 읽고 구현에서 최상위 `Library` 항목, `LibrarySystem` 항목, 하위 수준 `Library` 항목의 차이를 파악합니다.

#### LibrarySystem

`LibrarySystem` 항목은 도서관 *회원*의 공동작업 네트워크를 나타냅니다.

**요점:** [도서관 시스템 및 도서관 회원](#library-systems-and-library-members) 가이드라인을 읽고 구현에서 최상위 `Library` 항목, `LibrarySystem` 항목, 하위 수준 `Library` 항목의 차이를 파악합니다.

| 필수 속성 | |
| --- | --- |
| `@context` | `Text` `https://schema.org`로 설정합니다. |
| `@id` | `URL` 도서관 시스템의 전역 고유 ID로, URL 형식입니다. ID는 안정적이어야 하며 시간이 지남에 따라 변경되지 않아야 합니다. 불투명 문자열로 취급되며 작동하는 링크가 아니어도 됩니다. `@id` 값에 사용되는 도메인은 조직에서 소유해야 합니다. |
| `@type` | `Text` `LibrarySystem`으로 설정합니다. |
| `additionalProperty` | `PropertyValue` 도서관 유형을 나타내는 데 사용되는 추가 속성입니다. |
| `additionalProperty.@type` | `Text` `PropertyValue`로 설정합니다. |
| `additionalProperty.name` | `Text` `librarytype`으로 설정합니다. |
| `additionalProperty.value` | `Text` 도서관 유형입니다. 다음 값 중 하나를 사용하세요.   * `public` * `academic` * `corporate` * `government` * `school` * `special` |
| `member` | `Library` 도서관 시스템의 회원입니다. |
| `name` | `Text` 도서관 시스템의 이름입니다. 예: `The Southwestern League of Libraries` |
| `url` | `URL` 도서관 시스템을 소개하거나 설명하는 URL입니다. Google 검색에서는 이 링크를 사용하여 Google 데이터베이스의 콘텐츠와 피드의 콘텐츠를 조정합니다. 실제 방문 페이지의 경우 Google 검색에서는 `workExample.target.urlTemplate`에 제공된 URL을 사용합니다. |

#### `Library`(`member`)

`LibrarySystem` 항목의 `member` 속성은 `Library (member)` 항목을 사용합니다.
`Library (member)`는 특정 도서관 *시스템*의 단일 도서관 *회원*을 나타냅니다.

**요점:** [도서관 시스템 및 도서관 회원](#library-systems-and-library-members) 가이드라인을 읽고 구현에서 최상위 `Library` 항목, `LibrarySystem` 항목, 하위 수준 `Library` 항목의 차이를 파악합니다.

| 필수 속성 | |
| --- | --- |
| `@id` | `URL` 도서관 지점의 전역 고유 ID로, URL 형식입니다. ID는 안정적이어야 하며 시간이 지남에 따라 변경되지 않아야 합니다. 불투명 문자열로 취급되며 작동하는 링크가 아니어도 됩니다. `@id` 값에 사용되는 도메인은 조직에서 소유해야 합니다. |
| `@type` | `Text` `Library`로 설정합니다. |
| `location` | `PostalAddress` 도서관 지점의 상세 주소입니다. 일부 국가에는 적용되지 않는 속성도 있습니다. 도서관 주소에 적용할 수 있는 만큼 포함해야 합니다.  미국 `location` 예:     ``` {   "@type": "Library",   "@id": "https://example.com/library-branches/1001",   "name": "Campbell Library",   "location": {     "@type": "PostalAddress",     "streetAddress": "77 Harrison Ave",     "addressLocality": "Campbell",     "addressRegion": "CA",     "postalCode": "95008",     "addressCountry": "US"   } } ```   일본 `location` 예:     ``` {   "@type": "Library",   "@id": "https://example.com/library-branches/1003",   "name": "Tokyo Metropolitan Central Library",   "location": {     "@type": "PostalAddress",     "streetAddress": "７-13-5 Minamiazabu, Minato City",     "addressLocality": "Tokyo",     "postalCode": "106-0047",     "addressCountry": "JP"   } } ``` |
| `location.@type` | `Text` `PostalAddress`로 설정합니다. |
| `location.addressCountry` | `Text` [ISO 3166-1](https://en.wikipedia.org/wiki/ISO_3166-1) 형식의 국가 코드입니다. 예: `US` |
| `location.addressLocality` | `Text` 지역입니다. 예: `Mountain View` |
| `location.addressRegion` | `Text` 지역입니다. 예: `CA` |
| `location.postalCode` | `Text` 우편번호입니다. 예: `94043` |
| `location.streetAddress` | `Text` 상세 주소입니다. 예: `1600 Amphitheatre Pkwy` |
| `name` | `Text` 도서관 지점의 이름입니다. |

### `LibrarySystem` 피드 JSON 파일 예

```
{
   "@context": "https://schema.org",
   "@type":"LibrarySystem",
   "@id":"https://example.com/library-systems/100",
   "name":"Santa Clara County Library District",
   "additionalProperty":[
      {
         "@type":"PropertyValue",
         "name":"librarytype",
         "value":"public"
      }
   ],
   "member":[
      {
         "@type":"Library",
         "@id":"https://example.com/library-branches/1001",
         "name":"Campbell Library",
         "location":{
            "@type":"PostalAddress",
            "streetAddress":"77 Harrison Ave",
            "addressLocality":"Campbell",
            "addressRegion":"CA",
            "postalCode":"95008",
            "addressCountry":"US"
         }
      },
      {
         "@type":"Library",
         "@id":"https://example.com/library-branches/1002",
         "name":"Gilroy Library",
         "location":{
            "@type":"PostalAddress",
            "streetAddress":"350 W 6th St",
            "addressLocality":"Gilroy",
            "addressRegion":"CA",
            "postalCode":"95020",
            "addressCountry":"US"
         }
      }
   ]
}
```
