import { Fragment } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { GUIDES, getGuideBySlug, getRelatedGuides, getSectorForGuide, getGuidePublishedAt, getGuideModifiedAt } from '@/lib/guides';
import { getLatestEtfData, getEtfsBySector } from '@/lib/data';
import type { RawEtf } from '@/lib/surge';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getGuideLinkCluster, categoryHref } from '@/lib/guide-categories';
import { pickUnindexedGuides } from '@/lib/crawl-priority';
import { getComparePairBySlug } from '@/lib/etf-compare-pairs';
import { getKrxEtfMeta } from '@/lib/data';
import FaqSection from '@/components/FaqSection';
import AnswerBox from '@/components/AnswerBox';
import GuideDataBlock from '@/components/GuideDataBlock';
import EditorialNote from '@/components/EditorialNote';
import EtfTaxSimulator from '@/components/EtfTaxSimulator';
import { buildArticleSchema, buildHowToSchema, jsonLd } from '@/lib/schema';
import { SITE_NAME, SITE_LOCALE, articleTitle , padDescription, ogImageUrl } from '@/lib/site-meta';

/**
 * 본문 소제목 → 앵커 id.
 *   한글을 그대로 살린다. 주소만 봐도 어느 문단인지 읽히고, 검색엔진이
 *   결과에 문단 바로가기를 붙일 때 쓰는 단위가 된다.
 *   같은 제목이 두 번 나와도 충돌하지 않도록 순번을 붙인다.
 */
function headingAnchor(heading: string, index: number): string {
  const base = heading
    .replace(/[^가-힣a-zA-Z0-9\s]/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 40)
    .replace(/-+$/, '');
  return base ? `${base}-${index + 1}` : `section-${index + 1}`;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return GUIDES.map(g => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const g = getGuideBySlug(slug);
  if (!g) return { title: '가이드를 찾을 수 없습니다' };
  const canonicalPath = `/guide/${slug}`;
  // 가이드도 동적 OG 이미지 발급 — 소셜/메신저 미리보기 + 이미지 검색 인입
  // (기존엔 가이드에만 og:image가 없어 매일 발행 주력 콘텐츠의 공유 미리보기가 비어 있었음)
  const ogImage = ogImageUrl({ category: 'guide' });
  // 설명이 120자에 못 미치는 가이드 35편은 태그라인·첫 핵심 포인트로 채운다.
  // 가이드가 이미 갖고 있는 문장만 쓰므로 새로 지어내지 않는다. (2026-08-11 온페이지 감사)
  const description = padDescription(g.description, [g.tagline, g.keyPoints?.[0]]);
  // article:published_time·modified_time. 네이버·구글이 고친 글을 다시 읽어 갈 근거 (2026-10-07)
  const publishedAt = getGuidePublishedAt(slug) || g.lastReviewed;
  const modifiedAt = getGuideModifiedAt(slug) || publishedAt;
  // 검색 결과 제목: CTR 수술로 seoTitle 을 둔 가이드만 그 값을 쓴다(H1·headline 은 title 그대로).
  const searchTitle = g.seoTitle || g.title;
  return {
    // 제목이 길면 layout template이 붙이는 브랜드 18자를 끊어 잘림을 막는다.
    // 가이드 제목 자체는 그대로 둔다(발행분 소급 수정 금지).
    title: articleTitle({ title: searchTitle }),
    description,
    keywords: g.keywords,
    alternates: { canonical: canonicalPath },
    openGraph: { siteName: SITE_NAME, locale: SITE_LOCALE,
      title: searchTitle,
      description,
      type: 'article',
      url: canonicalPath,
      publishedTime: `${publishedAt}T09:00:00+09:00`,
      modifiedTime: `${modifiedAt}T09:00:00+09:00`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: g.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: searchTitle,
      description,
      images: [ogImage],
    },
  };
}

/** 계좌별 세후 계산기를 붙이는 가이드 분류 (계좌·세금·분배가 주제인 곳) */
const CALC_SECTIONS = new Set(['ETF 세금 가이드', '은퇴 자산 가이드', 'ISA 계좌 가이드', '배당주 가이드', 'ETF 분배금 가이드', '커버드콜 가이드', '월배당 가이드', '해외상장 가이드']);

export default async function GuidePage({ params }: PageProps) {
  const { slug } = await params;
  const g = getGuideBySlug(slug);
  if (!g) notFound();

  // 같은 주제 클러스터의 관련 가이드 (hub-and-spoke 내부링크)
  const relatedGuides = getRelatedGuides(slug, 4);
  // 하단 링크 묶음 (2026-10-14): 같은 주제 허브 · 관련 비교 2 · 관련 계산기 1 (src/lib/guide-categories.ts)
  const linkCluster = getGuideLinkCluster(g);
  // 함께 읽으면 좋은 글 (2026-10-14): 같은 주제 허브에서 구글이 아직 색인하지 않은 가이드 2편을 본문 중간에 잇는다.
  //   아래 관련 가이드와 겹치지 않게 뺀다. 목록과 이유는 src/lib/crawl-priority.ts.
  const alsoRead = pickUnindexedGuides({
    categories: [linkCluster.category],
    exclude: [g.slug, ...relatedGuides.map(r => r.slug)],
    n: 2,
    seed: g.slug,
  });
  const clusterCompares = linkCluster.comparePairs
    .map(p => getComparePairBySlug(p))
    .filter((p): p is NonNullable<typeof p> => !!p)
    .map(p => ({ slug: p.slug, label: `${getKrxEtfMeta(p.codeA)?.name || p.codeA} vs ${getKrxEtfMeta(p.codeB)?.name || p.codeB} 차이` }));

  // 테마·자산군 가이드 → 종목 사전(/etf/{slug}) 연결. 일반 가이드는 빈 배열.
  const guideSector = getSectorForGuide(slug);
  const guideSectorEtfs = guideSector
    ? getEtfsBySector(guideSector, '', 6, (getLatestEtfData()?.etfList || []) as RawEtf[])
    : [];

  // 제휴 도서 추천 섹션과 링크는 2026-10-14 사이트에서 모두 걷어 냈다(가이드 데이터에서도 삭제).
  //   목차·HowTo 단계도 같은 목록을 쓴다.
  // 2026-10-14: "함께 보면 좋은 데일리 분석"(related-posts, 06-13 에 멈춘 일별 시황 글 목록)도 그리지 않는다.
  //   관련 읽을거리는 본문 아래 관련 가이드·비교·계산기 묶음이 맡는다.
  const sections = g.sections.filter(sec => !(sec.dataBlock && /^(product|book)-rec:|^related-posts:/.test(sec.dataBlock)));

  // 본문 h2에 붙일 앵커. 문단을 개별 주소로 가리킬 수 있어야 검색·답변엔진이 청크 단위로 인용한다.
  //   한글 id는 HTML5에서 유효하다. 링크에 쓸 때만 브라우저가 자동 인코딩한다.
  const sectionIds = sections.map((sec, i) => headingAnchor(sec.heading, i));

  // datePublished는 안정적 원발행일(불변) — lastReviewed는 격주 점검 크론이 갱신하므로 dateModified로.
  const publishedAt = getGuidePublishedAt(slug) || g.lastReviewed;
  // 본문을 실제로 고친 날(GUIDE_MODIFIED_AT). 없으면 발행일과 같다.
  const modifiedAt = getGuideModifiedAt(slug);
  const articleSchema = buildArticleSchema({
    type: 'Article',
    headline: g.title,
    description: g.description,
    // 페이지 og:image와 같은 파일을 가리킨다. 이 인자를 빼면 스키마 기본값 /og/default.png가
    // 잡혀서, 공유 미리보기(/og/guide.png)와 구조화 데이터가 서로 다른 그림을 가리켰다.
    images: [ogImageUrl({ category: 'guide' })],
    url: `/guide/${slug}`,
    datePublished: `${publishedAt}T09:00:00+09:00`,
    // dateModified에 lastReviewed를 쓰지 않는다. 그 값은 격주 크론이 내용 점검 없이
    // 일괄로 오늘 날짜를 덮어쓴 결과라 실제 수정일이 아니었다(208편이 같은 날짜).
    // 크론은 중단했고, 실제 수정 이력을 추적하기 전까지는 발행일과 같게 둔다. (2026-08-12)
    // 2026-10-07: 실제로 고친 날을 GUIDE_MODIFIED_AT 으로 따로 적기 시작해 그 값을 쓴다.
    dateModified: `${modifiedAt || publishedAt}T09:00:00+09:00`,
    author: {
      name: 'Daily ETF Pulse 리서치팀',
    },
    keywords: g.keywords,
    section: g.section,
    ...(g.sources?.length ? { citations: g.sources.map(s => ({ name: s.label, url: s.url })) } : {}),
    // 정답블록(AnswerBox)이 실제로 렌더될 때만 speakable을 붙인다.
    speakable: !!g.answer,
  });

  // HowTo 스키마 (가이드가 단계형일 때만) — 보조 섹션은 자동 제외
  const howToSchema = g.howTo
    ? buildHowToSchema({
        name: g.title,
        description: g.howTo.description || g.description,
        url: `/guide/${slug}`,
        ...(g.howTo.totalTime ? { totalTime: g.howTo.totalTime } : {}),
        steps: sections
          .filter(sec => {
            const h = sec.heading;
            // 본문 단락이 있고, 보조 섹션(관련 글·책 추천)이 아닌 것만 단계화
            if (!sec.paragraphs?.length) return false;
            if (/함께\s*보면|책으로\s*더\s*깊이|관련\s*분석/.test(h)) return false;
            if (sec.dataBlock && /related-posts/.test(sec.dataBlock)) return false;
            return true;
          })
          .map((sec, idx) => ({
            name: `${idx + 1}. ${sec.heading}`,
            text: sec.paragraphs.join(' '),
          })),
      })
    : null;

  return (
    <article className="guide-article animate-fade-in">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(articleSchema) }}
      />
      {howToSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(howToSchema) }}
        />
      )}

      <Breadcrumbs
        items={[
          { name: '홈', href: '/' },
          { name: '가이드', href: '/guide' },
          linkCluster.category
            ? { name: linkCluster.category.label, href: categoryHref(linkCluster.category) }
            : { name: g.section, href: '/guide' },
          { name: g.title, href: `/guide/${slug}` },
        ]}
      />

      <header className="guide-article-hero">
        <div className="guide-article-section">{g.section}</div>
        <h1 className="guide-article-title">{g.title}</h1>
        <p className="guide-article-tagline">{g.tagline}</p>
        {/* 바이라인 — 가이드 238편에 발행 주체 표기가 아예 없었다(SEO.md §10 위반).
            일별 글에는 있는데 가이드에만 빠져 있었고, 가이드가 사이트 최대 색인 자산이다. */}
        {/* 발행 정보 상자 (2026-10-14): 누가 발행·정정하는지, 언제 쓰고 고쳤는지, 무엇을 근거로 했는지를 첫 화면에 둔다.
            근거 문서는 글 아래 참고 자료와 같은 목록에서 앞의 3개를 보여 준다. */}
        <div className="guide-byline" aria-label="발행 정보">
          <div className="guide-article-meta">
            <span>발행·정정: Daily ETF Pulse 리서치팀</span>
            <span aria-hidden> · </span>
            <span>발행일: {new Date(publishedAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            {modifiedAt && (
              <>
                <span aria-hidden> · </span>
                <span>수정일: {new Date(modifiedAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </>
            )}{' '}
            <EditorialNote variant="compact" kind="guide" />
          </div>
          {g.sources && g.sources.length > 0 && (
            <p className="guide-byline-sources">
              <span>근거 자료: </span>
              {g.sources.slice(0, 3).map((s, i) => (
                <span key={s.url}>
                  {i > 0 ? ' · ' : ''}
                  <a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a>
                </span>
              ))}
              {g.sources.length > 3 && <span> 외 {g.sources.length - 3}건 (<a href="#guide-sources">아래 참고 자료</a>)</span>}
            </p>
          )}
        </div>
      </header>

      {/* AEO 직답 — Hero 직후. 결론 1~2문장만(구체 수치·표는 본문). AI Overview·스니펫 인용용. */}
      {/* 기준일은 실제로 고친 날(없으면 발행일), 출처는 이 글의 첫 1차 출처 (2026-10-08).
          예전에는 출처를 "Daily ETF Pulse 리서치팀"으로 적어 직답이 스스로를 근거로 드는 모양이었다. */}
      {g.answer && (
        <AnswerBox
          summary={g.answer}
          asOf={modifiedAt || publishedAt}
          source={g.sources?.[0]?.label || 'Daily ETF Pulse 리서치팀'}
        />
      )}

      {/* AEO 핵심 포인트 — 직답 아래 bullet. 리스트형 스니펫 + 생성형 검색 인용 단위. */}
      {g.keyPoints && g.keyPoints.length > 0 && (
        <section className="guide-key-points" aria-label="핵심 포인트">
          <h2 className="guide-key-points-title">핵심 포인트</h2>
          <ul>
            {g.keyPoints.map((k, i) => (
              <li key={i}>{k}</li>
            ))}
          </ul>
        </section>
      )}

      {/* 한눈 비교 표 — 비교(vs) 가이드. "X vs Y" featured snippet(표) 후보 + 체류시간↑. */}
      {g.comparisonTable && (
        <figure className="guide-compare-table-wrap">
          <figcaption className="guide-compare-caption">{g.comparisonTable.caption}</figcaption>
          <table className="guide-compare-table">
            <thead>
              <tr>
                {g.comparisonTable.columns.map((c, i) => (
                  <th key={i} scope="col">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {g.comparisonTable.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) =>
                    ci === 0 ? (
                      <th key={ci} scope="row">{cell}</th>
                    ) : (
                      <td key={ci}>{cell}</td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </figure>
      )}

      {/* 계좌별 세후 계산기 (2026-10-14). 계좌·세금·분배를 다루는 가이드에만 붙인다. 글을 읽다 바로 자기 숫자로
          확인하게 하고, 상단 광고는 계산 결과 바로 아래에 온다. 세율은 src/lib/account-tax-rules.ts 한 곳. */}
      {CALC_SECTIONS.has(g.section) && (
        <section className="guide-calc" aria-labelledby="guide-calc-heading">
          <h2 id="guide-calc-heading" className="guide-calc-h2">계좌별 세후 수익 계산기</h2>
          <p className="guide-calc-desc">
            투자금과 분배율, 보유 기간을 넣으면 같은 ETF를 일반 계좌·중개형 ISA·연금저축·IRP에서 굴릴 때 세금과 세후 수익이 얼마나 달라지는지 바로 계산합니다.
          </p>
          <EtfTaxSimulator
            name="ETF"
            gainTax={g.section === '해외상장 가이드' ? 'taxable' : g.section === '커버드콜 가이드' ? 'base-excludes-domestic' : 'exempt'}
            pensionAllowed
            defaultYieldPct={g.section === '커버드콜 가이드' || g.section === '월배당 가이드' ? 8 : 3}
            yieldFromRecord={false}
            kindSelectable
          />
        </section>
      )}

      {/* 목차 — 문단별 앵커. 긴 글에서 원하는 대목으로 바로 가고,
          검색 결과에 문단 바로가기가 붙을 수 있는 구조를 만든다. */}
      {sections.length >= 3 && (
        <nav className="guide-toc" aria-label="목차">
          <h2 className="guide-toc-title">이 글에서 다루는 내용</h2>
          <ol className="guide-toc-list">
            {sections.map((sec, i) => (
              <li key={i}>
                <a href={`#${sectionIds[i]}`}>{sec.heading}</a>
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="guide-article-body">
        {/* 광고는 애드센스 자동 광고만 쓴다(2026-10-14 운영자 지시). 본문 사이에 수동 광고 자리를 두지 않는다. */}
        {sections.map((sec, i) => (
          <Fragment key={i}>
            <section className="guide-article-section-block">
              <h2 className="guide-article-h2" id={sectionIds[i]}>{sec.heading}</h2>
              {sec.paragraphs.map((p, pi) => (
                <p key={pi} className="guide-article-p">{p}</p>
              ))}
              {sec.dataBlock && (
                <div className="guide-article-data">
                  <GuideDataBlock block={sec.dataBlock} />
                </div>
              )}
            </section>
            {/* 두 번째 섹션 뒤: 같은 주제의 다른 가이드 2편 (본문이 3섹션 이상일 때만) */}
            {i === 1 && sections.length >= 3 && alsoRead.length > 0 && (
              <aside className="guide-also-read" aria-label="함께 읽으면 좋은 글">
                <p className="guide-also-read-title">함께 읽으면 좋은 글</p>
                <ul>
                  {alsoRead.map(o => (
                    <li key={o.slug}>
                      <Link href={`/guide/${o.slug}`} prefetch={false}>{o.title}</Link>
                    </li>
                  ))}
                </ul>
              </aside>
            )}
          </Fragment>
        ))}
      </div>

      {/* 주제 관련 ETF 종목 사전 — 가이드 → /etf/{slug} 연결(테마·자산군 가이드만) */}
      {guideSectorEtfs.length > 0 && (
        <section className="guide-article-section-block">
          <h2 className="guide-article-h2">{guideSector} ETF 종목 사전</h2>
          <p className="guide-article-p">
            이 주제와 관련된 ETF의 시세·구성종목·분배 정보는 종목 사전에서 한 종목씩 확인할 수 있습니다.
          </p>
          <ul className="etf-dict-related-grid">
            {guideSectorEtfs.map(r => (
              <li key={r.shortcode}>
                <Link href={`/etf/${r.slug}`} prefetch={false} className="etf-dict-related-card">
                  <div className="etf-dict-related-card-head">
                    <span className="etf-dict-related-card-code">{r.shortcode}</span>{' '}
                    {r.issuer && <span className="etf-dict-related-card-issuer">{r.issuer}</span>}
                  </div>
                  <div className="etf-dict-related-card-name">{r.name}</div>
                  {r.hasPrice && typeof r.changeRate === 'number' && (
                    <div className={`etf-dict-related-card-change ${r.changeRate > 0 ? 'is-up' : r.changeRate < 0 ? 'is-down' : ''}`}>
                      {r.changeRate >= 0 ? '+' : ''}{r.changeRate.toFixed(2)}%
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 관련 가이드 — 본문을 다 읽은 바로 그 자리에 둔다 (2026-10-08 FAQ 뒤 맨 끝에서 이동).
          한 번 들어온 독자가 다음 글로 넘어가야 방문당 페이지뷰(=광고 노출)가 늘어난다. */}
      <nav className="guide-article-other" aria-label="관련 가이드">
        <h2>관련 가이드</h2>
        <ul>
          {relatedGuides.map(o => (
            <li key={o.slug}>
              <Link href={`/guide/${o.slug}`} prefetch={false}>
                <span className="guide-article-other-title">{o.title}</span>
                <ArrowRight size={14} strokeWidth={2.5} />
              </Link>
            </li>
          ))}
        </ul>
        {(clusterCompares.length > 0 || linkCluster.tool) && (
          <>
            <h3 className="guide-article-other-sub">관련 비교와 계산기</h3>
            <ul>
              {clusterCompares.map(p => (
                <li key={p.slug}>
                  <Link href={`/compare/${p.slug}`} prefetch={false}>
                    <span className="guide-article-other-title">{p.label}</span>
                    <ArrowRight size={14} strokeWidth={2.5} />
                  </Link>
                </li>
              ))}
              <li>
                <Link href={linkCluster.tool.href} prefetch={false}>
                  <span className="guide-article-other-title">{linkCluster.tool.label}</span>
                  <ArrowRight size={14} strokeWidth={2.5} />
                </Link>
              </li>
            </ul>
          </>
        )}
        <Link
          href={linkCluster.category ? categoryHref(linkCluster.category) : '/guide'}
          className="guide-article-other-all"
          prefetch={false}
        >
          {linkCluster.category ? `${linkCluster.category.label} 가이드 전체 보기` : '전체 ETF 가이드 보기'} <ArrowRight size={14} strokeWidth={2.5} />
        </Link>
      </nav>

      {/* 참고 자료 — 공적 기관·운용사 1차 출처 (E-E-A-T + citation 스키마와 본문 일치) */}
      {g.sources && g.sources.length > 0 && (
        <section className="guide-sources" id="guide-sources" aria-label="참고 자료">
          <h2 className="guide-article-h2">참고 자료·출처</h2>
          <ul>
            {g.sources.map((s, i) => (
              <li key={i}>
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <FaqSection title={`${g.section} 자주 묻는 질문`} items={g.faq} />

      {/* 본문 하단 공시 — 무엇을 근거로 쓰고 누가 발행을 책임지는지. 일별 글과 동일 정책 적용. */}
      <EditorialNote variant="inline" kind="guide" />

    </article>
  );
}
