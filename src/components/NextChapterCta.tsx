import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface Props {
  /** 다음 챕터 한 문장 라벨 */
  label: string;
  /** 다음 챕터 카피(시청자가 얻는 가치) */
  copy: string;
  /** 이동할 경로 */
  href: string;
}

/**
 * 카테고리 페이지(브리핑·속보·자금흐름·월배당·급등) 끝에서
 * 시청자를 다음 챕터로 미니멀하게 회유.
 *   - 별도 카드 없이 텍스트 + 화살표 한 줄
 *   - 시청자에게 작업 메타(에이전트·자동화 등) 노출 금지 — 가치 한 줄만
 */
export default function NextChapterCta({ label, copy, href }: Props) {
  return (
    <div className="next-chapter-cta">
      <span className="next-chapter-cta-label">{label}</span>
      <Link href={href} className="next-chapter-cta-link" prefetch={false}>
        {copy}
        <ArrowRight size={14} strokeWidth={2.5} aria-hidden />
      </Link>
    </div>
  );
}
