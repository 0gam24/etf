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
 *   - SERP에 FAQ rich result 노출 후보로 활용
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
            <details>
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
