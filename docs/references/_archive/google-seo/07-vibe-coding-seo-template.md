# 바이브코딩 SEO 즉시 적용 템플릿

> Cursor/Claude/Copilot 등에 그대로 던질 수 있는 SEO 구현 템플릿

## 기본 HTML 메타 템플릿
```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- 기본 SEO -->
  <title>페이지 제목 - 사이트 이름</title>
  <meta name="description" content="페이지에 대한 1~2문장 요약. 50~160자.">
  <link rel="canonical" href="https://example.com/current-page">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="페이지 제목">
  <meta property="og:description" content="페이지 요약">
  <meta property="og:image" content="https://example.com/og-image.jpg">
  <meta property="og:url" content="https://example.com/current-page">
  <meta property="og:site_name" content="사이트 이름">
  <meta property="og:locale" content="ko_KR">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="페이지 제목">
  <meta name="twitter:description" content="페이지 요약">
  <meta name="twitter:image" content="https://example.com/twitter-image.jpg">

  <!-- 파비콘 -->
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" href="/icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">

  <!-- 성능 -->
  <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
</head>
<body>
  <header>
    <nav aria-label="주요 메뉴"><!-- ... --></nav>
  </header>
  <main>
    <h1>페이지의 단 하나뿐인 H1</h1>
    <article>
      <!-- 실제 콘텐츠 -->
    </article>
  </main>
  <footer><!-- ... --></footer>
</body>
</html>
```

## robots.txt 템플릿
```txt
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /*?*sessionid=

Sitemap: https://example.com/sitemap.xml
```

## Next.js App Router metadata
```tsx
// app/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "홈 - 사이트 이름",
  description: "홈페이지 요약",
  alternates: { canonical: "https://example.com" },
  openGraph: {
    title: "홈 - 사이트 이름",
    description: "홈페이지 요약",
    url: "https://example.com",
    images: ["https://example.com/og.jpg"],
    locale: "ko_KR",
    type: "website",
  },
  robots: { index: true, follow: true },
};
```

## 동적 sitemap (Next.js)
```ts
// app/sitemap.ts
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await fetchAllPosts();
  return [
    { url: "https://example.com", lastModified: new Date(), priority: 1 },
    ...posts.map((p) => ({
      url: \`https://example.com/posts/\${p.slug}\`,
      lastModified: p.updatedAt,
      priority: 0.7,
    })),
  ];
}
```

## 동적 robots (Next.js)
```ts
// app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin/", "/api/"] },
    ],
    sitemap: "https://example.com/sitemap.xml",
  };
}
```

## 구조화 데이터 (Article)
```tsx
export default function ArticlePage({ post }: { post: Post }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    image: [post.image],
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: [{ "@type": "Person", name: post.author }],
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article>{/* ... */}</article>
    </>
  );
}
```

## BreadcrumbList Schema
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "홈", "item": "https://example.com" },
    { "@type": "ListItem", "position": 2, "name": "블로그", "item": "https://example.com/blog" },
    { "@type": "ListItem", "position": 3, "name": "현재 글" }
  ]
}
```

## 이미지 최적화 (Next.js)
```tsx
import Image from "next/image";

<Image
  src="/cookie.jpg"
  alt="초콜릿 칩 쿠키"
  width={1200}
  height={800}
  priority   // LCP 이미지에만
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

## AI 코딩 어시스턴트용 프롬프트 예시

### Cursor / Claude / Copilot에 던질 한 줄 프롬프트
> "이 Next.js 페이지에 Google SEO Essentials를 준수하는 metadata와 JSON-LD를 추가해줘. canonical, og, twitter, BreadcrumbList 포함."

### 검토 프롬프트
> "이 HTML 파일에서 Google SEO 관점의 문제점을 모두 찾아 우선순위와 함께 알려줘. title, meta description, heading 구조, alt, canonical, 구조화 데이터, Core Web Vitals 관점에서 검토."

---

## 최종 배포 전 체크리스트
- [ ] 모든 페이지 `<title>` 고유
- [ ] 모든 페이지 `meta description` 고유 (50~160자)
- [ ] H1 1개, 의미적 헤딩 구조
- [ ] 모든 `<img>`에 `alt`, `width`, `height`
- [ ] canonical URL 명시
- [ ] Open Graph + Twitter Card
- [ ] JSON-LD 구조화 데이터
- [ ] robots.txt + sitemap.xml
- [ ] hreflang (다국어인 경우)
- [ ] Lighthouse SEO 100점
- [ ] Core Web Vitals 통과 (LCP < 2.5s, INP < 200ms, CLS < 0.1)
- [ ] Rich Results Test 통과
- [ ] Search Console 소유권 확인
