# Google 이미지의 이미지 메타데이터

> **출처(Source):** https://developers.google.com/search/docs/appearance/structured-data/image-license-metadata?hl=ko
> **저작자(Attribution):** Google
> **라이선스(License):** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
> 이 문서는 Google 검색 센터 문서를 Markdown으로 변환한 사본입니다.
> 원문의 최신 내용은 위 출처 링크를 확인하세요.

---

# Google 이미지의 이미지 메타데이터

이미지 메타데이터를 지정하면 Google 이미지에서 제작자 정보, 이미지 사용 방법, 크레딧 정보와 같은 이미지 관련 세부정보를 볼 수 있습니다. 예를 들어 라이선스 정보를 제공하면 이미지를 라이선스 배지로 사용할 수 있습니다. 라이선스 배지는 라이선스로 연결되는 링크와 이미지 사용 방식에 관한 자세한 내용을 제공합니다.

![Google 이미지의 이미지 메타데이터](https://developers.google.com/static/search/docs/images/image-metadata.png?hl=ko)

## 기능 제공 여부

이 기능은 모바일 및 데스크톱에서 사용 가능하며, Google 검색이 제공되는 모든 지역에서 해당 언어로 사용할 수 있습니다.

## 웹페이지 및 이미지 준비

Google에서 이미지를 찾고 색인을 생성할 수 있도록 하려면 다음을 따르세요.

* 사용자가 계정이 없거나 로그인하지 않고도 이미지가 포함된 페이지에 액세스하여 볼 수 있는지 확인합니다.
* Googlebot이 이미지가 포함된 페이지에 액세스할 수 있는지 확인합니다(즉, robots.txt 파일 또는 robots `meta` 태그에서 페이지를 허용해야 합니다).
  [페이지 색인 생성 보고서](https://support.google.com/webmasters/answer/7440203?hl=ko)에서 사이트의 모든 차단된 페이지를 보거나 [URL 검사 도구](https://support.google.com/webmasters/answer/9012289?hl=ko)를 사용하여 특정 페이지를 테스트할 수 있습니다.
* Google에서 내 콘텐츠를 찾을 수 있도록 [검색 Essentials](https://developers.google.com/search/docs/essentials?hl=ko)를 준수합니다.
* [이미지 검색엔진 최적화 권장사항](https://developers.google.com/search/docs/appearance/google-images?hl=ko)을 따르세요.
* Google에 변경사항을 계속 알리려면 [사이트맵](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap?hl=ko)을 제출하는 것이 좋습니다.
  이는 [Search Console Sitemap API](https://developers.google.com/webmaster-tools/search-console-api-original/v3/sitemaps?hl=ko)를 사용하여 자동화할 수 있습니다.

## 구조화된 데이터 또는 IPTC 사진 메타데이터 추가

이미지 메타데이터에 관해 Google에 알리려면 사이트의 각 이미지마다 구조화된 데이터 또는 IPTC 사진 메타데이터를 추가하세요. 여러 페이지에 동일한 이미지가 있다면 이미지가 표시되는 각 페이지에서 이미지마다 구조화된 데이터 또는 IPTC 사진 메타데이터를 추가합니다.

이미지에 사진 메타데이터를 추가하는 방법에는 두 가지가 있습니다. 라이선스 배지와 같은 개선사항을 사용하려면 Google에 한 가지 형식의 정보를 제공해야 하며 다음 방법 중 하나를 사용하면 됩니다.

* [구조화된 데이터](#structured-data): 구조화된 데이터는 마크업으로 표시되는 이미지와 페이지 간의 연결입니다. 이미지가 동일하더라도 이미지가 사용되는 모든 인스턴스에 구조화된 데이터를 추가해야 합니다.
* [IPTC 사진 메타데이터](#iptc-photo-metadata): IPTC 사진 메타데이터는 이미지 자체에 삽입되며 이미지와 메타데이터를 그대로 유지하면서 한 페이지에서 다른 페이지로 이동할 수 있습니다. IPTC 사진 메타데이터는 이미지당 한 번만 삽입하면 됩니다.

IPTC 사진 메타데이터와 구조화된 데이터를 모두 사용하려고 할 때 두 정보가 충돌하는 경우 Google은 구조화된 데이터 정보를 사용합니다.

다음 그림은 라이선스 정보가 Google 이미지에 표시되는 방법을 보여줍니다.

![Google 이미지에 표시될 수 있는 라이선스 메타데이터의 일부를 보여주는 설명선](https://developers.google.com/static/search/docs/images/licensable-images-callouts.png?hl=ko)

1. 이미지 사용에 적용되는 라이선스를 설명하는 페이지의 URL입니다. Schema.org의 `license` 속성 또는 IPTC의 Web Statement of Rights 필드를 사용하여 이 정보를 지정합니다.
2. 사용자가 이미지에 라이선스를 부여하는 방법에 관한 정보를 찾을 수 있는 위치를 설명하는 페이지의 URL입니다. Schema.org의 `acquireLicensePage` 속성 또는 [Licensor](https://www.iptc.org/std/photometadata/specification/IPTC-PhotoMetadata#licensor)의 IPTC Licensor URL 필드를 사용하여 이 정보를 지정합니다.

### 구조화된 데이터

Google에 이미지 메타데이터에 관해 알릴 수 있는 방법 중 하나는 구조화된 데이터 필드를 추가하는 것입니다. 구조화된 데이터는 페이지 정보를 제공하고 페이지 콘텐츠를 분류하기 위한 표준화된 형식입니다. 구조화된 데이터를 처음 사용한다면 [구조화된 데이터의 작동 방식](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data?hl=ko)을 자세히 알아보세요.

다음은 구조화된 데이터를 빌드, 테스트 및 출시하는 방법의 개요입니다.

1. [필수 속성](#structured-data-type-definitions)을 추가합니다. 사용 중인 형식에 따라
   [페이지에 구조화된 데이터를 삽입](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data?hl=ko#format-placement)하는
   위치를 알아보세요.
   **CMS를 사용하고 있나요?** CMS에 통합된 플러그인을 사용하는 것이 더 쉬울 수 있습니다.
     
   **자바스크립트를 사용하고 있나요?** [자바스크립트로 구조화된 데이터를 생성](https://developers.google.com/search/docs/appearance/structured-data/generate-structured-data-with-javascript?hl=ko)하는 방법을 알아보세요.
2. [구조화된 데이터 일반 가이드라인](https://developers.google.com/search/docs/appearance/structured-data/sd-policies?hl=ko)을 준수합니다.
3. [리치 결과 테스트](https://search.google.com/test/rich-results?hl=ko)를 사용하여 코드의 유효성을 검사합니다.
4. 구조화된 데이터를 포함하는 일부 페이지를 배포하고 [URL 검사 도구](https://support.google.com/webmasters/answer/9012289?hl=ko)를 사용하여 Google에서 페이지를 표시하는 방법을 테스트합니다. Google이 페이지에 액세스할 수 있으며 robots.txt 파일, `noindex` 태그 또는 로그인 요구사항에 의해 차단되지 않는지 확인합니다. 페이지가 정상적으로 표시되면 [Google에 URL을 재크롤링해 달라고 요청](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl?hl=ko)할 수 있습니다. Google이 재크롤링하고 색인을 다시 생성하는 동안 기다려 주세요. 페이지 게시 후 Google에서 페이지를 찾고 크롤링하는 데 며칠이 걸릴 수 있습니다.
5. [Google에 향후 변경사항을 계속 알리려면](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap?hl=ko) 사이트맵을 제출하는 것이 좋습니다.
   이는 [Search Console Sitemap API](https://developers.google.com/webmaster-tools/search-console-api-original/v3/sitemaps?hl=ko)를 사용하여 자동화할 수 있습니다.

#### 예

##### 단일 이미지

다음은 하나의 이미지가 포함된 페이지 예입니다.

### JSON-LD

  

```
<html>
  <head>
    <title>Black labrador puppy</title>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org/",
      "@type": "ImageObject",
      "contentUrl": "https://example.com/photos/1x1/black-labrador-puppy.jpg",
      "license": "https://example.com/license",
      "acquireLicensePage": "https://example.com/how-to-use-my-images",
      "creditText": "Labrador PhotoLab",
      "creator": {
        "@type": "Person",
        "name": "Brixton Brownstone"
       },
      "copyrightNotice": "Clara Kent"
    }
    </script>
  </head>
  <body>
    <img alt="Black labrador puppy" src="https://example.com/photos/1x1/black-labrador-puppy.jpg">
    <p><a href="https://example.com/license">License</a></p>
    <p><a href="https://example.com/how-to-use-my-images">How to use my images</a></p>
    <p><b>Photographer</b>: Brixton Brownstone</p>
    <p><b>Copyright</b>: Clara Kent</p>
    <p><b>Credit</b>: Labrador PhotoLab</p>
  </body>
</html>
```

### RDFa

  

```
<html>
  <head>
    <title>Black labrador puppy</title>
  </head>
  <body>
  <div vocab="https://schema.org/" typeof="ImageObject">
    <img alt="Black labrador puppy" property="contentUrl" src="https://example.com/photos/1x1/black-labrador-puppy.jpg" /><br>
    <span property="license"> https://example.com/license</span><br>
    <span property="acquireLicensePage">https://example.com/how-to-use-my-images</span>
    <span rel="schema:creator">
      <span typeof="schema:Person">
        <span property="schema:name" content="Brixton Brownstone"></span>
      </span>
    </span>
    <span property="copyrightNotice">Clara Kent</span><br>
    <span property="creditText">Labrador PhotoLab</span><br>
  </div>
  </body>
</html>
```

### 마이크로데이터

  

```
<html>
  <head>
    <title>Black labrador puppy</title>
  </head>
  <body>
    <div itemscope itemtype="https://schema.org/ImageObject">
      <img alt="Black labrador puppy" itemprop="contentUrl" src="https://example.com/photos/1x1/black-labrador-puppy.jpg" />
      <span itemprop="license"> https://example.com/license</span><br>
      <span itemprop="acquireLicensePage">https://example.com/how-to-use-my-images</span>
      <span itemprop="creator" itemtype="https://schema.org/Person" itemscope>
        <meta itemprop="name" content="Brixton Brownstone" />
      </span>
      <span itemprop="copyrightNotice">Clara Kent</span>
      <span itemprop="creditText">Labrador PhotoLab</span>
    </div>
  </body>
</html>
```

##### `srcset` 태그의 단일 이미지

다음은 `srcset` 태그에 하나의 이미지가 포함된 페이지를 보여주는 예입니다.

### JSON-LD

  

```
<html>
  <head>
    <title>Black labrador puppy</title>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org/",
      "@type": "ImageObject",
      "contentUrl": "https://example.com/photos/320/black-labrador-puppy-800w.jpg",
      "license": "https://example.com/license",
      "acquireLicensePage": "https://example.com/how-to-use-my-images",
      "creditText": "Labrador PhotoLab",
      "creator": {
        "@type": "Person",
        "name": "Brixton Brownstone"
       },
      "copyrightNotice": "Clara Kent"
    }
    </script>
  </head>
  <body>
    <img srcset="https://example.com/photos/320/black-labrador-puppy-320w.jpg 320w,
                   https://example.com/photos/480/black-labrador-puppy-480w.jpg 480w,
                   https://example.com/photos/800/black-labrador-puppy-800w.jpg 800w"
           sizes="(max-width: 320px) 280px,
                  (max-width: 480px) 440px,
                  800px"
           src="https://example.com/photos/320/black-labrador-puppy-800w.jpg"
           alt="Black labrador puppy"><br>
    <p><a href="https://example.com/license">License</a></p>
    <p><a href="https://example.com/how-to-use-my-images">How to use my images</a></p>
    <p><b>Photographer</b>: Brixton Brownstone</p>
    <p><b>Copyright</b>: Clara Kent</p>
    <p><b>Credit</b>: Labrador PhotoLab</p>
  </body>
</html>
```

### RDFa

  

```
<html>
  <head>
    <title>Black labrador puppy</title>
  </head>
  <body>
    <div vocab="https://schema.org/" typeof="ImageObject">
      <img property="contentUrl"
           srcset="https://example.com/photos/320/black-labrador-puppy-320w.jpg 320w,
                   https://example.com/photos/480/black-labrador-puppy-480w.jpg 480w,
                   https://example.com/photos/800/black-labrador-puppy-800w.jpg 800w"
           sizes="(max-width: 320px) 280px,
                  (max-width: 480px) 440px,
                  800px"
           src="https://example.com/photos/320/black-labrador-puppy-800w.jpg"
           alt="Black labrador puppy">
      <span property="license">https://example.com/license</span>
      <span property="acquireLicensePage">https://example.com/how-to-use-my-images</span>
      <span rel="schema:creator">
        <span typeof="schema:Person">
          <span property="schema:name" content="Brixton Brownstone"></span>
        </span>
      </span>
      <span property="copyrightNotice">Clara Kent</span>
      <span property="creditText">Labrador PhotoLab</span>
   </div>
  </body>
</html>
```

### 마이크로데이터

  

```
<html>
  <head>
    <title>Black labrador puppy</title>
  </head>
  <body>
    <div itemscope itemtype="https://schema.org/ImageObject">
      <img itemprop="contentUrl"
           srcset="https://example.com/photos/320/black-labrador-puppy-320w.jpg 320w,
                   https://example.com/photos/480/black-labrador-puppy-480w.jpg 480w,
                   https://example.com/photos/800/black-labrador-puppy-800w.jpg 800w"
           sizes="(max-width: 320px) 280px,
                  (max-width: 480px) 440px,
                  800px"
           src="https://example.com/photos/320/black-labrador-puppy-800w.jpg"
           alt="Black labrador puppy">
      <span itemprop="license">https://example.com/license</span>
      <span itemprop="acquireLicensePage">https://example.com/how-to-use-my-images</span>
      <span itemprop="creator" itemtype="https://schema.org/Person" itemscope>
        <meta itemprop="name" content="Brixton Brownstone" />
      </span>
      <span itemprop="copyrightNotice">Clara Kent</span>
      <span itemprop="creditText">Labrador PhotoLab</span>
   </div>
  </body>
</html>
```

##### 여러 이미지가 있는 페이지

다음은 여러 개의 이미지가 있는 페이지의 예입니다.

### JSON-LD

  

```
<html>
  <head>
    <title>Photos of black labradors</title>
    <script type="application/ld+json">
    [{
      "@context": "https://schema.org/",
      "@type": "ImageObject",
      "contentUrl": "https://example.com/photos/1x1/black-labrador-puppy.jpg",
      "license": "https://example.com/license",
      "acquireLicensePage": "https://example.com/how-to-use-my-images",
      "creditText": "Labrador PhotoLab",
      "creator": {
        "@type": "Person",
        "name": "Brixton Brownstone"
       },
      "copyrightNotice": "Clara Kent"
    },
   {
      "@context": "https://schema.org/",
      "@type": "ImageObject",
      "contentUrl": "https://example.com/photos/1x1/adult-black-labrador.jpg",
      "license": "https://example.com/license",
      "acquireLicensePage": "https://example.com/how-to-use-my-images",
      "creditText": "Labrador PhotoLab",
      "creator": {
        "@type": "Person",
        "name": "Brixton Brownstone"
       },
      "copyrightNotice": "Clara Kent"
    }]
    </script>
  </head>
  <body>
    <h2>Black labrador puppy</h2>
    <img alt="Black labrador puppy" src="https://example.com/photos/1x1/black-labrador-puppy.jpg">
    <p><a href="https://example.com/license">License</a></p>
    <p><a href="https://example.com/how-to-use-my-images">How to use my images</a></p>
    <p><b>Photographer</b>: Brixton Brownstone</p>
    <p><b>Copyright</b>: Clara Kent</p>
    <p><b>Credit</b>: Labrador PhotoLab</p>
    <h2>Adult black labrador</h2>
    <img alt="Adult black labrador" src="https://example.com/photos/1x1/adult-black-labrador.jpg">
    <p><a href="https://example.com/license">License</a></p>
    <p><a href="https://example.com/how-to-use-my-images">How to use my images</a></p>
    <p><b>Photographer</b>: Brixton Brownstone</p>
    <p><b>Copyright</b>: Clara Kent</p>
    <p><b>Credit</b>: Labrador PhotoLab</p>
  </body>
</html>
```

### RDFa

  

```
<html>
  <head>
    <title>Photos of black labradors</title>
  </head>
  <body>
    <div vocab="https://schema.org/" typeof="ImageObject">
      <h2 property="name">Black labrador puppy</h2>
      <img alt="Black labrador puppy" property="contentUrl" src="https://example.com/photos/1x1/black-labrador-puppy.jpg" /><br>
      <span property="license"> https://example.com/license</span>
      <span property="acquireLicensePage">https://example.com/how-to-use-my-images</span>
      <span rel="schema:creator">
        <span typeof="schema:Person">
          <span property="schema:name" content="Brixton Brownstone"></span>
        </span>
      </span>
      <span property="copyrightNotice">Clara Kent</span>
      <span property="creditText">Labrador PhotoLab</span>
    </div>
    <br>
    <div vocab="https://schema.org/" typeof="ImageObject">
      <h2 property="name">Adult black labrador</h2>
      <img alt="Adult black labrador" property="contentUrl" src="https://example.com/photos/1x1/adult-black-labrador.jpg" />
      <span property="license"> https://example.com/license</span>
      <span property="acquireLicensePage">https://example.com/how-to-use-my-images</span>
      <span rel="schema:creator">
        <span typeof="schema:Person">
          <span property="schema:name" content="Brixton Brownstone"></span>
        </span>
      </span>
      <span property="copyrightNotice">Clara Kent</span>
      <span property="creditText">Labrador PhotoLab</span>
    </div>
  </body>
</html>
```

### 마이크로데이터

  

```
<html>
  <head>
    <title>Photos of black labradors</title>
  </head>
  <body>
    <div itemscope itemtype="https://schema.org/ImageObject">
      <h2 itemprop="name">Black labrador puppy</h2>
      <img alt="Black labrador puppy" itemprop="contentUrl" src="https://example.com/photos/1x1/black-labrador-puppy.jpg" />
      <span itemprop="license"> https://example.com/license</span>
      <span itemprop="acquireLicensePage">https://example.com/how-to-use-my-images</span>
      <span itemprop="creator" itemtype="https://schema.org/Person" itemscope>
        <meta itemprop="name" content="Brixton Brownstone" />
      </span>
      <span itemprop="copyrightNotice">Clara Kent</span><br>
      <span itemprop="creditText">Labrador PhotoLab</span><br>
    </div>
    <br>
      <h2 itemprop="name">Adult black labrador</h2>
      <div itemscope itemtype="https://schema.org/ImageObject">
      <img alt="Adult black labrador" itemprop="contentUrl" src="https://example.com/photos/1x1/adult-black-labrador.jpg" />
      <span itemprop="license"> https://example.com/license</span>
      <span itemprop="acquireLicensePage">https://example.com/how-to-use-my-images</span>
      <span itemprop="creator" itemtype="https://schema.org/Person" itemscope>
        <meta itemprop="name" content="Brixton Brownstone" />
      </span>
      <span itemprop="copyrightNotice">Clara Kent</span>
      <span itemprop="creditText">Labrador PhotoLab</span>
    </div>
  </body>
</html>
```

#### 구조화된 데이터 유형 정의

`ImageObject`의 전체 정의는 [schema.org/ImageObject](https://schema.org/ImageObject)에서 확인할 수 있습니다.
Google에서 지원하는 속성은 다음과 같습니다.

| 필수 속성 | |
| --- | --- |
| `contentUrl` | `URL`  실제 이미지 콘텐츠의 URL입니다. Google에서는 `contentUrl`을 사용하여 사진 메타데이터가 적용되는 이미지를 결정합니다.  `contentUrl`을 포함하지 않는 경우, 이미지 URL을 지정하기 위해 `url` 속성도 지원됩니다. `url` 속성은 정확도가 떨어지므로 `contentUrl`을 사용하는 것이 좋지만 기존 마크업에는 `url`을 계속 사용할 수 있습니다. |
| `creator`, `creditText`, `copyrightNotice` 또는 `license`가 필요합니다. | `contentUrl` 외에도 다음 속성 중 하나를 포함해야 합니다.   * [`creator`](#creator-sd) * [`creditText`](#credit-sd) * [`copyrightNotice`](#copyright-sd) * [`license`](#license-sd)  이러한 속성 중 하나를 포함하면 다른 3가지 속성이 리치 결과 테스트에서 권장 속성이 됩니다. |

| 권장 속성 | |
| --- | --- |
| `acquireLicensePage` | `URL`  사용자가 이미지에 라이선스를 부여하는 방법을 찾을 수 있는 페이지의 URL입니다. 다음은 몇 가지 예입니다.   * 사용자가 특정 해상도 또는 사용 권리를 선택할 수 있는 이미지의 선택 페이지 * 라이선스 제공자에게 연락할 방법을 설명하는 일반 페이지 |
| `creator` | `Organization` 또는 `Person`  이미지를 만든 사람입니다. 보통 사진을 촬영한 사람인 경우가 많지만 회사 또는 조직일 수도 있습니다(해당하는 경우). |
| `creator.name` | `Text`  만든 사람의 이름입니다. |
| `creditText` | `Text`  게시된 이미지를 제공한 사람 또는 조직의 이름입니다. |
| `copyrightNotice` | `Text`  이 사진에 대한 지적 재산권을 주장하는 저작권 고지입니다. 이는 사진의 현재 저작권 소유자가 누구인지 나타냅니다. |
| `license` | `URL`  이미지 사용에 적용되는 라이선스를 설명하는 페이지의 URL입니다. 예를 들어, 웹사이트 이용약관이 될 수 있습니다. 이미지에 따라 크리에이티브 커먼즈 라이선스(예: [BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/))가 될 수도 있습니다.  구조화된 데이터를 사용하여 이미지를 지정한다면 라이선스 배지와 함께 이미지를 표시하도록 `license` 속성을 포함해야 합니다. 정보가 있다면 `acquireLicensePage` 속성도 추가하는 것이 좋습니다. |

### IPTC 사진 메타데이터

또는 [IPTC 사진 메타데이터](https://iptc.org/standards/photo-metadata/iptc-standard/)를 이미지 내에 직접 삽입할 수 있습니다. [메타데이터 관리 소프트웨어를 사용해 이미지 메타데이터를 관리](https://iptc.org/standards/photo-metadata/software-support/)하는 것이 좋습니다.
다음 표에는 Google에서 추출하는 속성이 포함되어 있습니다.

| 권장 속성 | |
| --- | --- |
| [저작권 신고서](https://iptc.org/std/photometadata/specification/IPTC-PhotoMetadata#copyright-notice) | 이 사진에 대한 지적 재산권을 주장하는 저작권 고지입니다. 이는 사진의 현재 저작권 소유자가 누구인지 나타냅니다. |
| [만든 사람](https://iptc.org/std/photometadata/specification/IPTC-PhotoMetadata#creator) | 이미지를 만든 사람입니다. 보통 사진을 촬영한 사람인 경우가 많지만 회사 또는 조직일 수도 있습니다(해당하는 경우). |
| [크레딧](https://iptc.org/std/photometadata/specification/IPTC-PhotoMetadata#credit-line) | 게시된 이미지를 제공한 사람 또는 조직의 이름입니다. |
| [디지털 소스 유형](https://iptc.org/std/photometadata/specification/IPTC-PhotoMetadata#digital-source-type) | 이미지를 만드는 데 사용된 디지털 소스 유형입니다. Google에서는 다음의 IPTC `NewsCodes`를 지원합니다.   * [`trainedAlgorithmicMedia`](https://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia): 샘플링된 콘텐츠에서 파생된 모델을 사용하여 알고리즘 방식으로 생성된 이미지입니다. * [`compositeSynthetic`](https://cv.iptc.org/newscodes/digitalsourcetype/compositeSynthetic): 하나 이상의 합성 요소가 포함된 믹스 또는 합성 이미지입니다. * [`algorithmicMedia`](https://cv.iptc.org/newscodes/digitalsourcetype/algorithmicMedia): 샘플링된 학습 데이터(예: 수학 공식을 사용하여 소프트웨어로 생성한 이미지)를 기반으로 하지 않고 단순히 알고리즘에 따라 생성된 이미지입니다. * [`compositeWithTrainedAlgorithmicMedia`](https://cv.iptc.org/newscodes/digitalsourcetype/compositeWithTrainedAlgorithmicMedia): 학습된 알고리즘 미디어와 다른 미디어를 결합한 이미지입니다(예: 인페인팅 또는 아웃페인팅 작업). |
| [Licensor URL](http://ns.useplus.org/LDF/ldf-XMPSpecification#LicensorURL) | 사용자가 이미지에 라이선스를 부여하는 방법을 찾을 수 있는 페이지의 URL입니다. [Licensor URL](http://ns.useplus.org/LDF/ldf-XMPSpecification#LicensorURL)은 이미지 객체의 속성이 아니라 [Licensor 객체](https://www.iptc.org/std/photometadata/specification/IPTC-PhotoMetadata#licensor)의 속성이어야 합니다. 다음은 관련 예입니다.   * 사용자가 특정 해상도를 선택할 수 있는 이미지의 선택 페이지 * 라이선스 제공자에게 연락할 방법을 설명하는 일반 페이지 |
| [Web Statement of Rights](https://www.iptc.org/std/photometadata/specification/IPTC-PhotoMetadata#web-statement-of-rights) | 이미지 사용에 적용되는 라이선스 및 기타 권리 정보(선택사항)를 설명하는 페이지의 URL입니다. 예를 들어, 웹사이트 이용약관이 될 수 있습니다. 이미지에 따라 크리에이티브 커먼즈 라이선스(예: [BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/))가 될 수도 있습니다.  라이선스 배지와 함께 이미지를 표시하려면 Web Statement of Rights 필드를 포함해야 합니다. 정보가 있는 경우 Licensor URL 필드도 추가하는 것이 좋습니다. |

### C2PA 메타데이터가 Google 검색 결과에 표시되는 방식

이미지에 [C2PA](https://c2pa.org/specifications/) 메타데이터가 포함된 경우 Google은 이러한 세부정보를 추출할 수 있으며 '[이 이미지 알아보기](https://support.google.com/websearch/answer/14177408?hl=ko)' 기능에 이미지가 생성된 방법 또는 AI 도구로 수정되었는지 여부와 같은 정보를 표시할 수 있습니다.
이 메타데이터는 일반적으로 다음 조건을 충족하는 앱, 기기 또는 서비스(예: 사진 편집 소프트웨어, 카메라 자체 또는 이미지를 수정하거나 만드는 기타 서비스)인 [signer](https://c2pa.org/specifications/specifications/2.1/specs/C2PA_Specification.html#signer-definition)에서 가져옵니다.

* 앱, 기기 또는 서비스에서 C2PA 버전 2.1 이상을 채택했습니다.
* 이미지의 매니페스트는 [C2PA 신뢰 목록](https://c2pa.org/specifications/specifications/2.1/specs/C2PA_Specification.html#_c2pa_trust_list)에 있는 인증 기관의 인증서로 서명해야 합니다.

## 문제 해결

**중요**: Google은 구조화된 데이터 또는 IPTC 사진 메타데이터가 검색결과에 표시된다고 보장하지 않습니다. Google에서 검색결과에 구조화된 데이터를 표시할 수 없는 일반적인 이유 목록은 [구조화된 데이터 일반 가이드라인](https://developers.google.com/search/docs/appearance/structured-data/sd-policies?hl=ko)을 참고하세요.

Google 이미지에 이미지 라이선스를 구현하는 데 문제가 있다면 다음 리소스를 참고하세요.

콘텐츠 관리 시스템(CMS)을 사용하거나 다른 사람이 내 사이트를 관리한다면 도움을 요청하세요. 문제를 자세히 설명하는 모든 Search Console 메시지를 전달해야 합니다.

* 이 기능에 관한 질문이 있다면 [Google 이미지의 이미지 라이선스 FAQ](https://support.google.com/webmasters/thread/31516792?hl=ko)를 확인하세요.
* 구조화된 데이터에 오류가 있을 수 있습니다. [구조화된 데이터의 오류 목록](https://support.google.com/webmasters/answer/13300873?hl=ko)을 확인하세요.
* 페이지에 구조화된 데이터 직접 조치를 취하는 경우 페이지에 있는 구조화된 데이터는 무시됩니다. 하지만 페이지는 계속 Google 검색결과에 표시될 수 있습니다. [구조화된 데이터 문제](https://support.google.com/webmasters/answer/9044175?hl=ko#zippy=,structured-data-issue)를 해결하려면 [직접 조치 보고서](https://support.google.com/webmasters/answer/9044175?hl=ko)를 사용하세요.
* [가이드라인](https://developers.google.com/search/docs/appearance/structured-data/sd-policies?hl=ko)을 다시 검토하여 콘텐츠가 가이드라인을 준수하지 않는지 확인합니다.
  스팸성 콘텐츠 또는 스팸성 마크업의 사용으로 문제가 발생할 수 있습니다.
  하지만 해당 문제가 구문 문제가 아닐 수도 있고, 이 경우 리치 결과 테스트에서는 이 문제를 식별할 수 없습니다.
* [누락된 리치 결과/전체 리치 결과 수 감소 문제 해결](https://support.google.com/webmasters/answer/13300208?hl=ko)
* 크롤링 및 색인 생성에 관한 일반적인 질문은 [Google 검색 크롤링 및 색인 생성 FAQ](https://developers.google.com/search/help/crawling-index-faq?hl=ko)를 참고하세요.
  다시 크롤링이 이루어지고 색인이 생성될 때까지 기다리세요. 페이지 게시 후 Google에서 페이지를 찾고 크롤링하는 데 며칠이 걸릴 수 있습니다.
* [Google 검색 센터 업무 시간](https://developers.google.com/search/help/office-hours?hl=ko)에 궁금한 점을 물어보세요.
* [Google 검색 센터 포럼](https://support.google.com/webmasters/community?hl=ko)에 질문을 올려보세요.
  IPTC 사진 메타데이터에 관한 도움이 필요한 경우 [포럼에 게시](https://groups.io/g/iptc-photometadata/)할 수 있습니다.

## 이미지 메타데이터를 삭제해도 괜찮은가요?

이미지 메타데이터를 삭제하면 이미지 파일 크기가 줄어 웹페이지 로드 속도가 빨라집니다. 하지만
특정 관할권에서는 메타데이터를 삭제하는 것이 불법일 수 있으므로 주의해야 합니다. 이미지 메타데이터는 온라인상에서 이미지 저작권과 라이선스 정보를 제공합니다. 적어도 이미지 권리 정보 및
식별과 관련된 중요한 메타데이터는 삭제하지 않는 것이
좋습니다. 예를 들어 가능한 경우 IPTC 입력란
([제작자](https://iptc.org/std/photometadata/specification/IPTC-PhotoMetadata#creator),
[크레딧
라인](https://iptc.org/std/photometadata/specification/IPTC-PhotoMetadata#credit-line), [저작권 고지](https://iptc.org/std/photometadata/specification/IPTC-PhotoMetadata#copyright-notice))을 남겨 저작자를 적절히 표시해 주시기 바랍니다.
