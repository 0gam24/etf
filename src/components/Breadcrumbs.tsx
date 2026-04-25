import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { buildBreadcrumbSchema, jsonLd, type BreadcrumbItem } from '@/lib/schema';

interface Props {
  items: BreadcrumbItem[];
  /** 마지막 항목까지 링크로 표시할지 (기본 false: 마지막은 텍스트만) */
  lastAsLink?: boolean;
}

/**
 * 빵부스러기 — UI + BreadcrumbList JSON-LD 스키마를 함께 출력.
 *   첫 항목은 보통 "홈", 마지막 항목은 현재 페이지 제목.
 *   SERP에 경로 노출 + 검색엔진 사이트 구조 인식에 핵심.
 */
export default function Breadcrumbs({ items, lastAsLink = false }: Props) {
  if (!items.length) return null;
  const schema = buildBreadcrumbSchema(items);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(schema) }}
      />
      <nav className="breadcrumbs" aria-label="현재 위치">
        <ol className="breadcrumbs-list">
          {items.map((it, i) => {
            const isLast = i === items.length - 1;
            return (
              <li key={`${it.href}-${i}`} className="breadcrumbs-item">
                {(!isLast || lastAsLink) ? (
                  <Link href={it.href} prefetch={false} className="breadcrumbs-link">
                    {it.name}
                  </Link>
                ) : (
                  <span className="breadcrumbs-current" aria-current="page">{it.name}</span>
                )}
                {!isLast && (
                  <ChevronRight size={12} strokeWidth={2.4} className="breadcrumbs-sep" aria-hidden />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
