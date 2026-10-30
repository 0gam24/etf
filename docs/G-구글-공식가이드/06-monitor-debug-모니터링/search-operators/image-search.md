# Google 이미지 검색 연산자

> **출처(Source):** https://developers.google.com/search/docs/monitor-debug/search-operators/image-search?hl=ko
> **저작자(Attribution):** Google
> **라이선스(License):** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
> 이 문서는 Google 검색 센터 문서를 Markdown으로 변환한 사본입니다.
> 원문의 최신 내용은 위 출처 링크를 확인하세요.

---

# Google 이미지 검색 연산자

웹 검색과 마찬가지로 Google 이미지는 전용 검색 연산자(`src:`, `imagesize:`)를 지원합니다. 이러한 연산자는 Google 이미지에서만 작동하고, 다른 Google 서비스에는 영향을 미치지 않습니다.

## `src:` 검색 연산자

`src:` 검색 연산자는 연산자에 제공된 `src` 속성의 이미지 URL을 참조하는 페이지를 반환합니다. 예:

```
src:https://example.com/media/carrot.jpg
```

연산자는 연산자에 지정된 URL의 도메인뿐만 아니라 모든 도메인의 페이지를 반환합니다. 이는 사이트에서 호스팅하는 이미지가 다른 사이트에서 [핫링크](https://en.wikipedia.org/wiki/Hotlink)되어 있는지 파악하는 데 도움이 될 수 있습니다.

## `imagesize:` 검색 연산자

`imagesize:` 검색 연산자는 연산자에 지정된 크기의 이미지를 반환합니다. 너비 `x` 높이 형식으로 크기를 지정해야 합니다. 예:

```
imagesize:1500x1000
```

이 연산자는 `src:` 및 `site:` 연산자와 함께 사용할 수 있습니다. 예를 들어 사이트에서 색인이 생성된 특정 크기의 이미지를 찾을 수 있습니다.

```
src:https://example.com/media/carrot.jpg imagesize:500x1200
```

`site:` 연산자와 함께 `imagesize:`를 사용하면 정확한 크기의 이미지를 찾을 수 있습니다.

```
site:https://example.com/ imagesize:500x1200
```

## 제한사항

이미지 검색 연산자는 색인 생성 및 검색 제한을 따르므로 표준 검색어에 표시될 수 있는 검색결과가 일부만 표시될 수 있습니다.
