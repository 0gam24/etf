# Google 검색의 생성형 AI 기능에 맞게 웹사이트 최적화하기

> **출처(Source):** https://developers.google.com/search/docs/fundamentals/ai-optimization-guide?hl=ko
> **저작자(Attribution):** Google
> **라이선스(License):** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
> 이 문서는 Google 검색 센터 문서를 Markdown으로 변환한 사본입니다.
> 원문의 최신 내용은 위 출처 링크를 확인하세요.

---

# Google 검색의 생성형 AI 기능에 맞게 웹사이트 최적화하기

사용자 선호도가 빠르게 변화하고 있으며, 정보를 찾는 데 도움이 되는 생성형 AI 환경을 선호하는 사람들이 늘어나고 있습니다. Google은 이러한 변화하는 기대치를 충족하기 위해 Google 검색을 업그레이드하고 있으며, 이러한 변화를 통해 사이트와 상호작용하거나, 콘텐츠를 더 오래 이용하거나, 구독자가 되거나 구매를 통해 전환할 가능성이 높은 사용자에게 도달할 수 있는 새로운 기회가 제공됩니다. 이 가이드는 Google 검색의 생성형 AI 기능(예: AI 개요, AI 모드)에서 성공하는 방법을 알아보기 위해 Google 검색의 공식 권장사항을 찾는 웹사이트 소유자를 위한 것입니다.

## 생성형 AI 검색에도 검색엔진 최적화가 여전히 유효한가요?

간단히 말씀드리면 그렇습니다. Google 검색의 생성형 AI 기능은 핵심 Google 검색 순위 및 품질 시스템에 기반을 두고 있으므로 [검색엔진 최적화 권장사항](https://developers.google.com/search/docs/essentials?hl=ko)은 계속해서 중요합니다. 이러한 기능은 AI 기술을 활용하여 다음과 같은 검색 색인의 콘텐츠를 강조합니다.

* **검색 증강 생성(RAG)**: Google의 핵심 검색 순위 시스템을 사용하여 검색 색인에서 관련성 있는 최신 웹페이지를 검색함으로써 AI 대답의 품질, 정확성, 최신성을 개선하는 데 사용되는 기술(그라운딩이라고도 함)입니다. 그런 다음 Google 시스템은 검색된 페이지의 구체적인 정보를 검토하여 더 신뢰할 수 있고 유용한 대답을 생성하고, 대답의 정보를 뒷받침하는 관련 웹페이지로 연결되는 클릭 가능한 링크를 눈에 띄게 표시합니다.
* **쿼리 팬아웃**: 모델에서 생성한 동시 관련 검색어 세트로, 추가 정보를 요청하고 관련 검색 결과를 추가로 가져와 사용자의 질문을 처리합니다. 예를 들어 원래 사용자의 질문이 '잔디에 잡초가 가득한데 어떻게 정리해야 해?'인 경우,
  팬아웃 쿼리에는 '잔디에 가장 적합한 제초제', '화학 물질 없이 잡초를 제거하는 방법', '잔디에 잡초가 생기지 않도록 하는 방법'이 포함될 수 있습니다.

**'AEO' 및 'GEO'는 어떻게 되나요?** 'AEO'는 '답변 엔진 최적화'를, 'GEO'는 '생성형 엔진 최적화'를 의미합니다. 이 두 용어는 모두 AI 검색 환경에서 가시성을 개선하는 데 중점을 둔 작업을 설명하는 데 사용될 수 있습니다. Google 검색의 관점에서 생성형 AI 검색에 최적화하는 것은 검색 환경에 최적화하는 것이므로 여전히 검색엔진 최적화입니다. 서드 파티 'AEO' 또는 'GEO' 조언이나 서비스를 고려하고 있다면 [서드 파티 검색엔진 최적화 조언 평가에 관한 안내](https://developers.google.com/search/docs/fundamentals/third-party-seo?hl=ko)를 검토하세요.

## 생성형 AI 검색에 기본적인 검색엔진 최적화 권장사항 적용

이 섹션에서는 오늘날 AI 시스템에 가장 중요한 요소와 생성형 AI 검색의 맥락에서 이를 구현하는 방법을 이해하기 위해 SEO 권장사항을 재구성하는 데 중점을 둡니다. 궁극적으로는 생성형 AI 검색 환경과 Google 검색 전반에서 웹사이트의 가시성을 개선하는 것이 목표입니다.

### 가치 있고 차별화된 콘텐츠를 만들어 잠재고객에게 제공

사용자가 독특하고, 흥미롭고, 유용하다고 생각하는 콘텐츠를 만들면 이 가이드에서 제안하는 다른 권장사항보다 장기적으로 생성형 AI 검색에서 웹사이트의 인지도에 더 큰 영향을 줄 수 있습니다. '독특하고 가치 있는 좋은 콘텐츠'는 사람마다 다른 의미를 가질 수 있지만 이와 같은 콘텐츠는 일반적으로 다음과 같은 몇 가지 공통된 속성을 공유합니다.

* **고유한 관점 제공**: Google AI 시스템은 다양한 소스를 살펴보므로 눈에 띄는 고유한 관점을 갖는 것이 도움이 될 수 있습니다. 예를 들어 직접 작성한 리뷰는 개인적인 경험을 바탕으로 한 고유한 관점을 제공하는 반면 기존 콘텐츠의 요약은 이미 다른 곳에서 제공되는 정보를 다시 진술할 뿐입니다. 주제에 대해 알고 있는 내용을 바탕으로 직접 콘텐츠를 만들고 콘텐츠에 어떤 깊이 있는 경험을 담을 수 있는지 고려하세요. 인터넷의 다른 사용자가 이미 말했거나 생성형 AI 모델에서 쉽게 생성할 수 있는 내용을 재활용하지 마세요.
* **[유용하고, 신뢰할 수 있으며, 사람 중심](https://developers.google.com/search/docs/fundamentals/creating-helpful-content?hl=ko)인 차별화된 콘텐츠 제작:**
  독자에게 유용하고 신뢰할 수 있는 차별화된 콘텐츠를 작성해야 합니다. 흔한 콘텐츠('초보 주택 구매자를 위한 7가지 팁' 등)는 누구나 알 수 있는 일반적인 지식을 기반으로 하는 경우가 많으며 독자에게 고유한 통찰력을 거의 제공하지 않습니다. 반면, 차별화된 콘텐츠('검사를 포기하고 비용을 절약한 이유: 하수관 내부 살펴보기' 등)는 일반적인 지식과 평범함을 넘어선 독특한 전문가 또는 경험자의 의견을 제공합니다.
* **독자에게 도움이 되는 방식으로 콘텐츠 정리**: 사람을 대상으로 콘텐츠를 작성하고 콘텐츠는 잘 작성되어 이해하기 쉬워야 합니다. 일반적으로 사용자는 콘텐츠를 탐색할 수 있는 명확한 구조를 제공하는 제목과 함께 단락과 섹션으로 웹페이지가 구성되어 있는 것을 선호합니다.
* **고화질 이미지와 동영상 추가**: 온라인에서 검색할 때 이미지와 동영상을 찾는 것을 좋아하는 사용자가 많습니다. 전반적인 Google 검색과 마찬가지로 Google의 생성형 AI 검색 결과 기능은 관련 이미지와 동영상을 가져올 수 있으므로 웹페이지 링크 외에도 웹사이트가 표시될 기회가 더 많아집니다. 적절한 경우 페이지에서 고품질의 관련 이미지와 동영상으로 텍스트 콘텐츠를 뒷받침할 방법을 찾아보세요. 이미 [이미지 검색엔진 최적화 권장사항](https://developers.google.com/search/docs/appearance/google-images?hl=ko)과 [동영상 검색엔진 최적화 문서](https://developers.google.com/search/docs/appearance/video?hl=ko)를 따르고 있다면 이미 생성형 AI 검색에 최적화하고 있는 것입니다.
* **사용자가 원하는 것에 집중하되 과도하게 그러지는 마세요.** 사람들이 검색할 수 있는 모든 변형에 대해 별도의 콘텐츠를 만드는 것이 매력적일 수 있지만(예: 사람들이 질문한 다른 쿼리나 팬아웃 쿼리에 집중), Google 검색에서 순위나 생성형 AI 대답을 조작하기 위해 이렇게 하는 것은 Google의 [확장된 콘텐츠 악용 스팸 정책](https://developers.google.com/search/docs/essentials/spam-policies?hl=ko#scaled-content)을 위반하는 것입니다.
  또한 페이지 수가 많다고 해서 웹사이트의 품질이 높아지거나 사용자에게 더 관련성이 높아지는 것은 아니므로 장기적으로 효과적인 전략이 아닙니다. Google AI 시스템이 더욱 발전하여 검색어와 페이지의 기본 콘텐츠가 정확히 일치하지 않는 경우에도 [페이지의 관련성을 이해](https://blog.google/products-and-platforms/products/search/search-language-understanding-bert/?hl=ko)하는 능력이 개선되었습니다.
* **생성형 AI 도구를 사용하여 콘텐츠 제작을 지원하는 경우** 콘텐츠가 [검색 Essentials](https://developers.google.com/search/docs/essentials?hl=ko)의 표준과 Google의 [스팸 정책](https://developers.google.com/search/docs/essentials/spam-policies?hl=ko#scaled-content)을 준수하는지 확인하세요. Google의 접근 방식에 대한 자세한 내용은 [AI 생성 콘텐츠에 관한 가이드](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content?hl=ko)를 참고하세요.

핵심 원칙 하나에 집중하여 접근 방식을 간소화할 수 있습니다. 즉, 방문자가 웹사이트를 방문한 후 즐겁게 생각하고, 유용하다고 느끼고, 만족할 만한 콘텐츠에 집중하면 됩니다. 사이트에 대한 결정을 내릴 때 확신이 서지 않는다면 '방문자가 만족할 만한 콘텐츠인가?'라고 자문해 보세요. 대답이 '예'라면 올바른 방향으로 나아가고 있는 것입니다. Google 시스템은 사용자를 바로 그와 같은 유용한 정보와 연결하도록 설계되어 있기 때문입니다. 자세한 내용은 [유용하고 신뢰할 수 있는 사용자 중심 콘텐츠 제작하기](https://developers.google.com/search/docs/fundamentals/creating-helpful-content?hl=ko) 가이드를 참고하세요.

### 명확한 기술 구조 구축 및 유지

Google 검색에서 페이지를 찾고 처리하는 방식은 Google AI 시스템이 데이터에 액세스하는 방식의 핵심으로 유지됩니다. 기술적 명확성을 통해 콘텐츠가 검색 및 색인 생성을 위한 준비를 갖추게 되며, 기존의 모든 기술적 [검색엔진 최적화 권장사항](https://developers.google.com/search/docs/fundamentals/seo-starter-guide?hl=ko)은 계속해서 유용합니다. 예를 들면 다음과 같습니다.

* **Google 검색 기술 요구사항 충족:** Google 검색의 생성형 AI 기능에 표시되려면 페이지의 색인이 생성되어 있고 [검색 기술 요구사항](https://developers.google.com/search/docs/essentials/technical?hl=ko)을 충족하여 스니펫과 함께 Google 검색에 표시될 수 있어야 합니다.

  Google 검색의 생성형 AI 기능에 표시되려면 Google 검색의 기술 요구사항 외에도 사이트가 [Search Console의 Google 검색 생성형 AI 기능에 포함](https://support.google.com/webmasters/answer/16908024?hl=ko)되어 있어야 합니다.

  그러나 페이지가 모든 요구사항과 권장사항을 충족하고 정책을 준수한다고 해서 Google이 반드시 해당 페이지의 콘텐츠를 크롤링하거나 색인을 생성하고, 콘텐츠를 제공하는 것은 아닙니다. 색인 생성 및 콘텐츠 제공은 보장되지 않습니다. [Google 검색의 원리](https://developers.google.com/search/docs/fundamentals/how-search-works?hl=ko)를 자세히 알아보세요.
* **크롤링 권장사항을 따르세요**. 생성형 AI 검색 결과 기능에서 사이트의 가시성을 극대화하려면 콘텐츠가 크롤링 가능해야 합니다. Google 검색 생성형 AI 모델은 공개적으로 액세스 가능하고 크롤링 가능한 콘텐츠를 사용하여 패턴을 학습하고 그라운딩된 관련 대답을 제공하기 때문입니다. 매우 크고 자주 업데이트되는 사이트의 경우 [크롤링 예산 최적화](https://developers.google.com/crawling/docs/crawl-budget?hl=ko) 가이드를 검토하세요.
* **의미론적 HTML의 경우 사람이 읽기 쉬운 데 중점을 두고 완벽한 코드에 신경 쓰지 마세요.** 완벽한 의미론적 HTML이 필수인 것은 아니지만 (일반적으로 웹은 유효한 HTML이 아니며 Google에서 이를 이해할 수 있음) 가능한 경우 의미론적 HTML을 사용하는 것이 좋습니다. 스크린 리더와 같은 다른 유형의 사용자가 [웹페이지를 더 쉽게 파싱하고 탐색](#agentic-experiences)할 수 있기 때문입니다.
* **JavaScript를 사용하는 경우 JavaScript 검색엔진 최적화 권장사항을 따르세요**.
  차단되지 않는 한 Google은 JavaScript 내 콘텐츠를 처리할 수 있습니다. 하지만 JavaScript 프레임워크를 사용하는 웹사이트로 검색엔진 최적화 작업을 하는 것은 일반적으로 다른 종류의 웹사이트로 작업하는 것보다 더 복잡합니다. 일반적인 [JavaScript 검색엔진 최적화 권장사항](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics?hl=ko)을 따르세요.
* 사이트에 도착하는 사용자에게 **[우수한 페이지 경험](https://developers.google.com/search/docs/appearance/page-experience?hl=ko)을 제공**합니다. 여기에는 사이트가 모든 기기에서 잘 표시되는지 확인하고, 지연 시간을 줄이고, 사용자가 페이지의 주요 콘텐츠와 다른 요소를 쉽게 구분할 수 있도록 하는 것이 포함됩니다.
* **중복 콘텐츠 줄이기:** 중복 콘텐츠가 있으면 사용자 환경이 악화될 수 있으며 검색엔진이 중요하지 않은 URL에 크롤링 리소스를 낭비할 수 있습니다. 시간이 있다면 이와 같은 콘텐츠를 [줄여 보세요](https://developers.google.com/search/docs/fundamentals/seo-starter-guide?hl=ko#reduce-duplicate-content).

잠재적인 기술 문제를 빠르게 발견하고 진단하려면 [Search Console에서 사이트를 인증](https://support.google.com/webmasters/answer/9008080?hl=ko)하세요.
자세한 내용은 [검색엔진 최적화 기술 가이드](https://developers.google.com/search/docs/fundamentals/get-started-developers?hl=ko) 및 [웹사이트의 검색엔진 최적화 유지관리](https://developers.google.com/search/docs/fundamentals/get-started?hl=ko)를 참고하세요.

### 지역 비즈니스 및 이커머스 세부정보 최적화

적절한 경우 생성형 AI 대답에는 제품 등록정보, 제품 정보, 지역 비즈니스에 관한 정보가 포함될 수 있습니다. [판매자 센터](https://merchants.google.com/?hl=ko)(예: [판매자 센터 피드](https://support.google.com/merchants/answer/11586438?hl=ko)) 및 [Google 비즈니스 프로필](https://business.google.com/?hl=ko)과 같은 제품을 사용하면 AI 대답과 기타 Google 검색 결과에 제품과 서비스가 표시될 수 있습니다. [Google 검색에 비즈니스 세부정보를 추가하고 관리](https://developers.google.com/search/docs/appearance/establish-business-details?hl=ko)하는 방법을 자세히 알아보세요.

비즈니스 유형과 목표에 따라 [비즈니스 에이전트](https://support.google.com/brandprofile/answer/16410382?hl=ko)와 같은 다른 판매자 환경을 고려해 보세요. 비즈니스 에이전트는 고객이 브랜드와 채팅할 수 있는 Google 검색의 대화형 환경입니다.

## 생성형 AI 검색에 관한 오해 풀기: 하지 않아도 되는 작업

생성형 AI 검색이 발전함에 따라 이를 둘러싼 이론과 관행(때로는 오해)도 변화해 왔습니다. 온라인에서는 답변 엔진 최적화(AEO) 또는 생성형 엔진 최적화(GEO)와 같은 용어가 흔히 사용되지만, 제안되는 많은 '해킹'은 효과가 없거나 Google 검색의 실제 작동 방식에 의해 지원되지 않습니다.

웹사이트의 가시성에 중요한 사항에 집중할 수 있도록 Google에서는 생성형 AI 및 Google 검색과 관련하여 인터넷에서 가장 눈에 띄는 주제 몇 가지를 수집했습니다. Google 검색에서 무시할 수 있는 몇 가지 사항은 다음과 같습니다.

* **LLMS.txt 파일 및 기타 '특수' 마크업**: Google 검색 자체에서 사용하지 않으므로 Google 검색(생성형 AI 기능 포함)에 표시되기 위해 새로운 기계 가독형 파일이나 AI 텍스트 파일, 마크업, 마크다운을 만들지 않아도 됩니다.
  Google은 웹사이트에서 HTML 외에도 [다양한 종류의 파일](https://developers.google.com/search/docs/crawling-indexing/indexable-file-types?hl=ko)을 검색, 크롤링, 색인 생성할 수 있습니다. 이는 파일이 특별한 방식으로 처리된다는 의미는 아닙니다.
  이러한 파일을 사용하는 다른 서비스나 시스템을 위해 LLMS.txt 파일(또는 기타 유사한 파일)을 만들고 유지관리하는 것은 완전히 괜찮습니다. Google 검색에서는 이를 무시하므로 Google 검색에서의 사이트 가시성이나 순위에 영향을 미치지 않습니다.
* **콘텐츠 '청킹':** AI가 콘텐츠를 더 잘 이해할 수 있도록 콘텐츠를 작은 조각으로 나눌 필요는 없습니다. Google 시스템은 페이지의 여러 주제의 미묘한 차이를 이해하고 사용자에게 관련 부분을 표시할 수 있습니다. 하지만 잠재고객과 주제에 따라 더 짧은(또는 더 긴) 페이지가 효과적인 경우도 있습니다. 이상적인 페이지 길이는 없으며, 결국 생성형 AI 검색뿐만 아니라 잠재고객을 위한 페이지를 만들어야 합니다.
* **AI 시스템만을 위한 콘텐츠 재작성:** 생성형 AI 검색을 위해 특별한 방식으로 작성할 필요는 없습니다. AI 시스템은 동의어와 사용자가 찾는 내용의 일반적인 의미를 이해하여 정확하게 동일한 단어를 사용하지 않을 수 있는 콘텐츠와 연결할 수 있습니다. 즉, '롱테일' 키워드가 충분하지 않거나 사용자가 내 콘텐츠와 같은 콘텐츠를 찾을 수 있는 모든 방법을 파악하지 못해도 걱정할 필요가 없습니다.
* **진정성이 없는 '언급' 추구:** Google 검색의 다른 기능과 마찬가지로 생성형 AI 기능은 블로그, 동영상, 포럼 토론 등 웹 전반에서 제품 및 서비스에 대해 언급된 내용을 표시할 수 있습니다. 하지만 웹 전반에서 진정성이 없는 '언급'을 추구하는 것은 생각만큼 도움이 되지 않습니다. Google의 핵심 순위 시스템은 [고품질 콘텐츠](https://developers.google.com/search/docs/fundamentals/creating-helpful-content?hl=ko)에 중점을 두는 반면 다른 시스템은 [스팸을 차단](https://developers.google.com/search/docs/essentials/spam-policies?hl=ko)합니다. Google의 생성형 AI 기능은 이 두 가지 모두에 의존합니다.
* **구조화된 데이터에 지나치게 집중**: 생성형 AI 검색에는 구조화된 데이터가 필요하지 않으며 추가해야 하는 특별한 schema.org 마크업도 없습니다. 하지만 Google 검색의 리치 결과에 표시되도록 하는 데 도움이 되므로 전반적인 SEO 전략의 일부로 계속 사용하는 것이 좋습니다.

## Search Console로 생성형 AI 기능의 노출 측정

Google 검색 및 디스커버의 생성형 AI 기능에서 콘텐츠의 실적을 측정하려면 Search Console의 [생성형 AI 실적 보고서](https://support.google.com/webmasters/answer/16984139?hl=ko)를 사용하세요. 이를 통해 사용자가 Google 검색의 생성형 AI 기능을 통해 내 콘텐츠를 발견하는 방식을 파악할 수 있습니다.

순위 상승을 약속하거나 '내부' Google 측정항목을 사용한다고 주장하는 서드 파티 도구를 주의하세요. 어떤 서드 파티 도구도 Google의 내부 순위 또는 AI 시스템에 액세스할 수 없습니다. 이러한 도구가 워크플로에 도움이 된다면 사용하되, [Google의 공식 가이드에 따라 조언을 평가](https://developers.google.com/search/docs/fundamentals/third-party-seo?hl=ko)해야 합니다.

## 에이전트형 환경 살펴보기

AI 에이전트는 예약하거나 제품 사양을 비교하는 등 사람을 대신하여 작업을 수행할 수 있는 자율 시스템입니다. 이러한 에이전트는 다양한 형태를 취할 수 있습니다. 예를 들어 브라우저 에이전트는 이러한 작업(예: 스크린샷과 같은 시각적 렌더링 분석, DOM 구조 검사, 접근성 트리 해석)을 완료하는 데 필요한 데이터를 수집하기 위해 웹사이트에 액세스할 수 있습니다.

비즈니스와 관련이 있고 시간이 남는다면 사용 가능한 에이전트형 환경을 확인하고 [에이전트 친화적인 웹사이트 권장사항](https://web.dev/articles/ai-agent-site-ux?hl=ko) 가이드를 검토하세요. 이 가이드에서는 웹사이트가 현재 브라우저 에이전트에 대비하는 방법을 전반적으로 파악할 수 있습니다.
[범용 커머스 프로토콜](https://ucp.dev/latest/)(UCP)과 같은 프로토콜이 등장하고 있으며 이를 통해 검색 에이전트가 더 많은 작업을 수행할 수 있습니다.

## 다음 단계: 집중할 대상

웹사이트 작업을 계속하면서 Google 검색(생성형 AI 환경 포함)에서 명시적인 검색엔진 최적화 없이도 많은 콘텐츠가 성공을 거두고 있음을 기억하시기 바랍니다. 또한 Google 검색에서 성공하기 위해 이 가이드의 모든 내용을 달성할 필요는 없습니다. 요약하자면 이 가이드의 핵심 내용은 다음과 같습니다.

* **생성형 AI 검색에 SEO 권장사항 적용:** [명확한 기술 구조 구축](#build-technical-structure), [고유하고 가치 있는 콘텐츠 제작](#create-valuable-content)과 같은 기본적인 SEO 권장사항을 계속 우선시하세요. 이러한 권장사항은 생성형 AI 검색 환경(및 Google 검색 전반)에서 노출되기 위한 기반이 됩니다.
* **[유용하고, 신뢰할 수 있으며, 사람 중심](https://developers.google.com/search/docs/fundamentals/creating-helpful-content?hl=ko)인 차별화된 콘텐츠 만들기:**
  일반적인 지식을 넘어 가치를 제공하는 독특한 전문가 주도 콘텐츠를 개발하는 데 집중하세요.
* **'AEO/GEO 해킹'보다 효과적인 검색엔진 최적화 전략 우선시:** Google 검색의 경우 콘텐츠를 '청크'하거나, 불필요한 AI 텍스트 파일(예: llms.txt)을 만들거나, 진정성 없는 언급을 추구하는 등의 전술을 무시할 수 있습니다.
* **Search Console에서 가시성 모니터링:** [생성형 AI 실적 보고서](https://support.google.com/webmasters/answer/16984139?hl=ko)를 사용하여 Google 검색의 생성형 AI 기능에서 콘텐츠의 실적을 확인하세요.
* **에이전트형 환경 살펴보기**: 브라우저 에이전트, 새로운 프로토콜 등 AI 에이전트가 사이트와 상호작용할 수 있는 새로운 기술에 대해 알아봅니다.

## 최신 정보를 얻고 질문하기

검색엔진 최적화에 대해 자세히 알아보려면 다음과 같은 리소스를 통해 Google에서 게시하는 변경사항 및 새로운 리소스를 파악할 수 있습니다.

|  |  |  |
| --- | --- | --- |
|  | * [Google 검색 센터 블로그](https://developers.google.com/search/blog?hl=ko): Google 검색 센터 블로그에서 최신 정보를 얻으세요. Google 검색의 생성형 AI, 새로운 Search Console 기능 등과 같은 정보를 확인할 수 있습니다. * [LinkedIn](https://www.linkedin.com/showcase/googlesearchcentral/) 및 [X(트위터)](https://twitter.com/googlesearchc)의 Google 검색 센터:   Google 검색을 팔로우하고 훌륭한 사이트를 만드는 데 도움이 되는 리소스를 받아보세요. | * [Google 검색 센터 도움말 포럼](https://support.google.com/webmasters/community?hl=ko): 사이트 검색엔진 최적화 문제에 관한 질문을 게시하고 웹사이트 소유자를 위한 제품 포럼에서 고품질 사이트를 만드는 도움말을 확인할 수 있습니다. 포럼에는 [Product Expert](https://productexperts.withgoogle.com/)가 있고 가끔씩 Google 직원도 참여하는 등 경험이 많은 참여자가 활발하게 활동하고 있습니다. * [Google 검색 센터 YouTube 채널](https://www.youtube.com/c/GoogleSearchCentral?hl=ko): 웹사이트 소유자를 위해 제작된 수백 개의 유용한 동영상을 시청할 수 있습니다. |
