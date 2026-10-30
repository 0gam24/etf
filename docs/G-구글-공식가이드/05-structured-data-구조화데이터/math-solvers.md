# 구조화된 수학 문제 풀이(MathSolver) 데이터

> **출처(Source):** https://developers.google.com/search/docs/appearance/structured-data/math-solvers?hl=ko
> **저작자(Attribution):** Google
> **라이선스(License):** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
> 이 문서는 Google 검색 센터 문서를 Markdown으로 변환한 사본입니다.
> 원문의 최신 내용은 위 출처 링크를 확인하세요.

---

# 구조화된 수학 문제 풀이(`MathSolver`) 데이터

학생과 교사, 다른 사용자가 수학 문제를 풀도록 도우려면 구조화된 데이터를 사용하여 수학 문제 유형과 특정 수학 문제의 단계별 풀이 링크를 표시하면 됩니다. 다음은 수학 문제 해결사가 Google 검색결과에서 어떻게 표시될 수 있는지 보여 주는 예입니다. 모양은 달라질 수 있습니다.

![수학 문제 해결사 리치 결과의 예](https://developers.google.com/static/search/docs/images/math-solvers-rich-result.png?hl=ko)

**참고**: 실제로 검색결과에 표시되는 모습은 다를 수 있습니다. [리치 결과 테스트](https://support.google.com/webmasters/answer/7445569?hl=ko)를 사용하면 대부분의 기능을 미리 볼 수 있습니다.

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

### 문제 해결사 작업 한 개

다음은 다항 방정식과 미분 문제를 풀 수 있고 영어와 스페인어로 제공되고 문제 풀이 작업이 한 개인 수학 문제 풀이 홈페이지의 예입니다.


  

```
<html>
<head>
<title>An awesome math solver</title>
</head>
<body>
<script type="application/ld+json">
[
  {
    "@context": "https://schema.org",
    "@type": ["MathSolver", "LearningResource"],
    "name": "An awesome math solver",
    "url": "https://www.mathdomain.com/",
    "usageInfo": "https://www.mathdomain.com/privacy",
    "inLanguage": "en",
    "potentialAction": [{
      "@type": "SolveMathAction",
      "target": "https://mathdomain.com/solve?q={math_expression_string}",
      "mathExpression-input": "required name=math_expression_string",
      "eduQuestionType": ["Polynomial Equation","Derivative"]
     }],
    "learningResourceType": "Math solver"
  },
  {
    "@context": "https://schema.org",
    "@type": ["MathSolver", "LearningResource"],
    "name": "Un solucionador de matemáticas increíble",
    "url": "https://es.mathdomain.com/",
    "usageInfo": "https://es.mathdomain.com/privacy",
    "inLanguage": "es",
    "potentialAction": [{
      "@type": "SolveMathAction",
      "target": "https://es.mathdomain.com/solve?q={math_expression_string}",
      "mathExpression-input": "required name=math_expression_string",
      "eduQuestionType": ["Polynomial Equation","Derivative"]
     }],
    "learningResourceType": "Math solver"
  }
]
</script>
</body>
</html>
```

스페인어 마크업은 영어 버전의 수학 문제 풀이 마크업과 함께 배치하는 대신 `https://es.mathdomain.com/`에 직접 배치할 수 있습니다.

### 문제 해결사 작업 두 개

다음은 문제 풀이 엔드포인트가 두 개인 수학 문제 풀이 홈페이지의 예입니다. 엔드포인트 하나는 다항 방정식을 풀 수 있고 다른 하나는 삼각 방정식을 풀 수 있습니다. 영어로만 제공됩니다.


  

```
<html>
<head>
<title>An awesome math solver</title>
</head>
<body>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": ["MathSolver", "LearningResource"],
  "name": "An awesome math solver",
  "url": "https://www.mathdomain.com/",
  "usageInfo": "https://www.mathdomain.com/privacy",
  "inLanguage": "en",
  "potentialAction": [{
     "@type": "SolveMathAction",
     "target": "https://mathdomain.com/solve?q={math_expression_string}",
     "mathExpression-input": "required name=math_expression_string",
     "eduQuestionType": "Polynomial Equation"
   },
   {
     "@type": "SolveMathAction",
     "target": "https://mathdomain.com/trig?q={math_expression_string}",
     "mathExpression-input": "required name=math_expression_string",
     "eduQuestionType": "Trigonometric Equation"
   }],
  "learningResourceType": "Math solver"
}
</script>
</body>
</html>
```

## 가이드라인

페이지가 수학 문제 풀이 리치 결과에 표시되려면 다음 가이드라인을 따라야 합니다.

* [구조화된 데이터 일반 가이드라인](https://developers.google.com/search/docs/appearance/structured-data/sd-policies?hl=ko)
* [검색 Essentials](https://developers.google.com/search/docs/essentials?hl=ko)
* [기술 가이드라인](#technical-guidelines)
* [콘텐츠 가이드라인](#content-guidelines)

### 기술 가이드라인

* 구조화된 `MathSolver` 데이터를 사이트의 홈페이지에 추가합니다.
* Googlebot이 [사이트를 효율적으로 크롤링](https://developers.google.com/search/docs/crawling-indexing/troubleshoot-crawling-errors?hl=ko#improve_crawl_efficiency)할 수 있는지 확인하세요.
* 다른 URL에서 호스팅된 동일한 수학 문제 풀이의 똑같은 사본이 여러 개 있다면 각 페이지 사본에 [표준 URL](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls?hl=ko)을 사용합니다.
* 로그인이나 페이월 뒤에 완전히 숨겨진 수학 문제 해결사는 허용되지 않습니다. 사용자가 Google에서 해당 기능을 통해 사이트로 이동한 후 첫 문제의 해답과 단계별 풀이에 액세스할 수 있어야 합니다. 추가 콘텐츠는 로그인 또는 페이월 뒤에 있을 수 있습니다.

### 콘텐츠 가이드라인

이러한 수학 문제 풀이 콘텐츠 가이드라인은 사용자에게 관련성 있는 학습 리소스를 제공하기 위해
마련되었습니다. 이러한 정책을 위반하는 콘텐츠를 발견하면
Google에서는 [직접 조치](https://support.google.com/webmasters/answer/9044175?hl=ko)를 취하거나
Google의 수학 문제 풀이 환경에서 페이지를 삭제하는 등
적절하게 대응합니다.

* 서드 파티에서 게시한 콘텐츠(예: [제휴 프로그램](https://developers.google.com/search/docs/essentials/spam-policies?hl=ko#thin-affiliate-pages))와 같이 수학 문제 풀이로 위장한 프로모션 콘텐츠는 허용되지 않습니다.
* 이 기능을 통한 수학 문제 풀이의 정확성과 품질에 관한 책임은 작성자에게 있습니다. Google의 품질 검토 절차에 따라 일정량의 데이터가 정확하지 않은 것으로 확인되면 심각도에 따라 문제가 해결될 때까지 문제 해결사가 기능에서 삭제될 수 있습니다. 적용 대상은 다음과 같습니다.
  + 문제 해결사가 풀 수 있는 문제 유형의 정확성
  + 문제 해결사가 풀 수 있다고 선언한 수학 문제 해답의 정확성

## 구조화된 데이터 유형 정의

리치 결과에 콘텐츠를 표시하려면 필수 속성이 있어야 합니다. 권장 속성을 통해 구조화된 데이터에 더 많은 정보를 추가하여 더욱 만족스러운 사용자 환경을 제공할 수도 있습니다.

### MathSolver

`MathSolver`는 단계별 해답을 제공하여 학생과 교사, 다른 사용자가 수학 문제를 푸는 데 도움이 되는 도구입니다. 사이트 홈페이지에서 구조화된 `MathSolver` 데이터를 사용합니다.

`MathSolver`의 전체 정의는 [schema.org/MathSolver](https://schema.org/MathSolver)에서 확인하세요.

Google에서 지원하는 속성은 다음과 같습니다.

| 필수 속성 | |
| --- | --- |
| `potentialAction` | `SolveMathAction`  수식의 수학 풀이(예: 단계별 해답이나 그래프)로 연결하는 작업입니다.     ``` { "@type": "MathSolver", "potentialAction": [{   "@type": "SolveMathAction",   "target": "https://mathdomain.com/solve?q={math_expression_string}",   "mathExpression-input": "required name=math_expression_string",   "eduQuestionType": "Polynomial Equation"   }] } ``` |
| `potentialAction.mathExpression-input` | `Text`  Google에서 사용자의 웹사이트로 보낸 수식(예: x^2-3x=0)의 자리표시자입니다. 그런 다음 특정 변수를 단순화, 변환 또는 푸는 과정이 수반될 수 있는 수식을 '풀' 수 있습니다. 이 문자열은 여러 형식(예: LaTeX, Ascii-Math 또는 키보드로 작성할 수 있는 수식)을 사용할 수 있습니다.  `mathExpression-input`은 주석 처리된 속성입니다. 자세한 내용은 [`Potential Actions`](https://schema.org/docs/actions.html#part-4) 페이지를 참고하세요.  일부 문제 유형의 경우 `math_expression_string`은 문제 유형과 문제 유형의 매개변수를 모두 나타냅니다. 다음은 문제 유형을 올바르게 예측하고 파싱할 수 있도록 마련된 더 복잡한 문제 유형의 예입니다.  **미분**  Google에서는 다음 두 가지 양식 중 하나로 `math_expression_string`을 전송합니다.   * ```   (math_expression)'   ```  * ```   d/dvariable math_expression   ```     Examples:     * `(x^2+x)'`  * `d/dx (x^2+x)`  * `d/dy y^2+y`     **Integrals**   Google will send a `math_expression_string` in one of two forms:     * ```   \int math_expression   ``` * ```   \int_{from}^{to} math_expression   ```   예:   * `\int x^2+x` * `\int_{0}^{2} x^2+x`   **제한사항**  Google에서는 다음 두 가지 양식 중 하나로 `math_expression_string`을 전송합니다.   * ```   \lim math_expression   ``` * ```   \lim_{variable\rightarrowvalue} math_expression   ```   예:   * `\lim_{x\rightarrow0} sin(x)/x` * `\lim_{y\rightarrow\infty} sin(y)/y` * `\lim sin(x)/x` |
| `url` | `URL`  `MathSolver`의 URL입니다. |
| `usageInfo` | `URL`  수학 문제 풀이 사이트의 개인정보처리방침입니다.     ``` {   "@type": "MathSolver",   "usageInfo": "https://www.mathdomain.com/privacy" } ``` |
| `potentialAction.target` | `EntryPoint`  작업의 URL 타겟 진입점입니다. `potentialAction.target` 속성은 작업으로 해결되는 수식을 나타내는 문자열을 허용합니다.     ``` { "@type": "MathSolver", "potentialAction": [{   "@type": "SolveMathAction",   "target": "https://mathdomain.com/solve?q={math_expression_string}"   }] } ``` |

| 권장 속성 | |
| --- | --- |
| `inLanguage` | `Text`  수학 문제 풀이 사이트에서 지원하는 언어입니다. 가능한 언어 목록은 [이 표](https://developers.google.com/custom-search/docs/xml_results_appendices?hl=ko#interfaceLanguages)를 참고하세요.     ``` {   "@type": "MathSolver",   "inLanguage": "es" } ``` |
| `assesses` | [문제 유형 정의](#problem-type-definitions) `Text` 목록  `HowTo`로 해결된 문제 유형입니다. `MathSolver` 마크업 외에도 `HowTo` 마크업을 사용하는 경우 `assesses` 속성을 사용합니다.     ``` {   "@type": "MathSolver",   "assesses": "Polynomial Equation" } ``` |
| `potentialAction.eduQuestionType` | [문제 유형 정의](#problem-type-definitions) `Text` 목록  `potentialAction.target` 속성으로 풀 수 있는 문제 유형입니다.     ``` {   "@type": "SolveMathAction",   "eduQuestionType": "Polynomial Equation" } ``` |

### LearningResource

`LearningResource`는 마크업 대상이 학생과 교사, 다른 사용자의 학습을 돕는 리소스임을 나타냅니다. 사이트 홈페이지에서 `LearningResource`를 사용합니다.

`LearningResource`의 전체 정의는 [schema.org/LearningResource](https://schema.org/LearningResource)에서 확인하세요.

Google에서 지원하는 속성은 다음과 같습니다.

| 필수 속성 | |
| --- | --- |
| `learningResourceType` | `Text`  이 학습 리소스의 유형입니다. 고정값 `Math Solver`를 사용합니다.     ``` {   "@type": ["MathSolver", "LearningResource"],   "learningResourceType": "Math Solver" } ``` |

## 문제 유형 정의

다음 문제 유형 목록을 `MathSolver.potentialAction`의 `eduQuestionType`으로 사용하거나 `MathSolver`가 특정 수학 문제를 풀이하는 `HowTo`와 함께 제공될 때 `MathSolver`의 `assesses` 필드로 사용합니다.

다음 표에는 주석을 추가할 수 있는 몇 가지 문제 유형의 예가 나와 있습니다.

| 문제 유형 예(전체 목록이 아님) | |
| --- | --- |
| `Absolute Value Equation` | 절댓값 방정식입니다. 예: |x - 5| = 9 |
| `Algebra` | 다른 문제 유형과 함께 배치할 수 있는 일반적인 문제 유형입니다. 예: 다항 방정식, 지수 방정식, 무리 표현식 |
| `Arc Length` | 호 길이 문제입니다. 예: x = 4 (3 + y)^2, 1 < y < 4의 길이를 결정합니다. |
| `Arithmetic` | 산술 문제입니다. 예: 5와 7의 합계를 구합니다. |
| `Biquadratic Equation` | 사차 방정식입니다. 예: x^4 - x^2 - 2 = 0 |
| `Calculus` | 다른 문제 유형과 함께 배치할 수 있는 일반적인 문제 유형입니다. 예: 적분, 미분, 미분 방정식 |
| `Characteristic Polynomial` | {{1,2,5}, {3,-1,1}, {1,2,3}}의 특성 다항식을 구합니다. |
| `Circle` | 원 관련 문제입니다. 예: x^2 + y^2 = 3의 반지름을 구합니다. |
| `Derivative` | 5x^4 + 2x^3 + 4x - 2의 미분을 구합니다. |
| `Differential Equation` | 미분 방정식 문제입니다. 예: y+dy/dx=5x |
| `Distance` | 거리 문제입니다. 예: (6,-1)과 (-3,2) 사이의 거리를 구합니다. |
| `Eigenvalue` | 고윳값 문제입니다. 예: 행렬 [[-6, 3], [4, 5]]의 고윳값을 구합니다. |
| `Eigenvector` | 고유 벡터 문제입니다. 예: 고윳값이 [-7, 6]인 행렬 [[-6, 3], [4, 5]]의 고유 벡터를 구합니다. |
| `Ellipse` | 타원 문제입니다. 예: 9x^2 + 4y^2 = 36의 x절편과 y절편을 구합니다. |
| `Exponential Equation` | 지수 방정식입니다. 예: 7^x = 9 |
| `Function` | 다항식 단순화입니다. 예: (x-5)^2 \* (x+5)^2 |
| `Function Composition` | f(x)=x^2-2x, g(x)=2x-2일 때 f(g(x))입니다. |
| `Geometry` | 다른 문제 유형과 함께 배치할 수 있는 일반적인 문제 유형입니다. 예: 원, 타원, 포물선, 경사 |
| `Hyperbola` | 쌍곡선 문제입니다. 예: (x^2)/4 - (y^2)/5 = 1의 x절편을 구합니다. |
| `Inflection Point` | f(x) = 1/2x^4 + x^3 - 6x^2의 변곡점을 구합니다. |
| `Integral` | 제곱근 (x^2 - y^2)의 적분을 구합니다. |
| `Intercept` | 선의 절편 문제입니다. 예: 선 y = 10x - 5의 x절편을 구합니다. |
| `Limit` | 한도 문제입니다. 예: x가 (x^2-1)/(x-1)에 대해 1에 근접할 때 x의 한도를 구합니다. |
| `Line Equation` | 직선 방정식 문제입니다. 예: 점 (-7,-4)와 (-2,-6)으로 선의 방정식을 구합니다. |
| `Linear Algebra` | 다른 문제 유형과 함께 배치할 수 있는 일반적인 문제 유형입니다. 예: 행렬과 특성 다항식 |
| `Linear Equation` | 일차 방정식입니다. 예: 4x - 3 = 2x + 9 |
| `Linear Inequality` | 일차 부등식입니다. 예: 5x - 6 > 3x - 8 |
| `Logarithmic Equation` | 대수 방정식입니다. 예: log(x) = log(100) |
| `Logarithmic Inequality` | 대수 부등식입니다. 예: log(x) > log(100) |
| `Matrix` | {{1,2,5}, {3,-1,1}, {1,2,3}} 기약 행입니다. |
| `Midpoint` | 중점 문제입니다. 예: (-3, 7)과 (5, -2) 사이의 중점을 구합니다. |
| `Parabola` | 포물선 문제입니다. 예: y2 - 4x - 4y = 0의 꼭짓점을 구합니다. |
| `Parallel` | 평행선 문제입니다. 예: 두 선(y = 10x + 5, y = 20x + 10)이 평행한가요? |
| `Perpendicular` | 수직선 문제입니다. 예: 두 선(y = 10x + 5, y = 20x + 10)이 직각을 이루나요? |
| `Polynomial Equation` | 다항 방정식입니다. 예: x^5 - 3x = 0 |
| `Polynomial Expression` | 다항 표현식입니다. 예: (x - 5)^4 \* (x + 5)^2 |
| `Polynomial Inequality` | 다항 부등식입니다. 예: x^4 - x^2 - 6 > x^3 - 3x^2 |
| `Quadratic Equation` | 이차 방정식입니다. 예: x^2 - 3x - 4 = 0 |
| `Quadratic Expression` | 이차 표현식입니다. 예: x^2 - 3x - 2 |
| `Quadratic Inequality` | 이차 부등식입니다. 예: x^2 - x - 6 > x^2 - 3x |
| `Radical Equation` | 무리 방정식입니다. 예: 제곱근(x) - x = 0 |
| `Radical Inequality` | 무리 부등식입니다. 예: 제곱근(x) - x > 0 |
| `Rational Equation` | 유리 방정식입니다. 예: 5/(x - 3) = 2/(x - 1) |
| `Rational Expression` | 유리 표현식입니다. 예: 1/(x^3 + 4x^2 + 5x + 2) |
| `Rational Inequality` | 유리 부등식입니다. 예: 5/(x - 3) > 2/(x - 1) |
| `Slope` | 경사 문제입니다. 예: y = 10x + 5의 경사를 구합니다. |
| `Statistics` | 통계 문제입니다. 예: 숫자 집합(3, 8, 2, 10)의 평균을 구합니다. |
| `System of Equations` | 연립방정식 문제입니다. 예: 2x + 5y = 16;3x - 5y = - 1을 풉니다. |
| `Trigonometry` | sin(t) + cos(t) = 1을 풉니다. |
