import { ChevronDown } from 'lucide-react';
import { buildFaqSchema, jsonLd, type FaqItem } from '@/lib/schema';

interface Props {
  /** 섹션 제목 (h2) */
  title: string;
  items: FaqItem[];
}

/**
 * 카테고리 랜딩 끝부분에 노출할 FAQ + FAQPage JSON-LD.
 *   - <details> 기반 아코디언 (JS 의존 없음, SEO·접근성·인쇄 친화)
 *
 *   앞의 두 문답은 펼친 채로 둔다.
 *     접힌 텍스트는 검색 스니펫·답변엔진이 인용 단위로 삼기에 약하다.
 *     사이트 전체 FAQ 965개가 전부 접혀 있어서, 이미 써둔 자기완결 문답이
 *     노출 표면으로 전혀 쓰이지 못하고 있었다. 앞 두 개만 펼쳐도
 *     글을 한 자도 더 쓰지 않고 인용 가능한 청크가 드러난다. (2026-08-12)
 */
export default function FaqSection({ title, items }: Props) {
  if (!items.length) return null;
  return (
    <section className="faq-section" aria-label="자주 묻는 질문">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(buildFaqSchema(items)) }}
      />
      <h2 className="faq-section-title">{title}</h2>
      <ul className="faq-list">
        {items.map((q, i) => (
          <li key={i} className="faq-item">
            <details open={i < 2}>
              <summary>
                <span className="faq-q">{q.question}</span>
                <ChevronDown size={16} strokeWidth={2.4} className="faq-chevron" aria-hidden />
              </summary>
              <div className="faq-a">{q.answer}</div>
            </details>
          </li>
        ))}
      </ul>
    </section>
  );
}
