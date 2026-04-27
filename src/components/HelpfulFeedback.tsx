'use client';

import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Check } from 'lucide-react';

interface Props {
  /** 글 식별자 (slug 또는 etf code) — localStorage 키 + GA 이벤트 라벨 */
  contentId: string;
  /** 카테고리 — GA 이벤트 dimension */
  category: string;
}

declare global {
  interface Window {
    gtag?: (cmd: string, action: string, params: Record<string, unknown>) => void;
  }
}

/**
 * 사용자 피드백 버튼 — Google E-E-A-T "북마크·공유·추천할 만한가" 신호.
 *
 *   - localStorage로 한 번 클릭 후 재클릭 차단 (스팸 방지)
 *   - GA4 이벤트 'helpful_feedback' 발송 (집계는 GA4 대시보드에서)
 *   - 백엔드 X (Cloudflare KV 등 추가 인프라 회피)
 *   - 클릭 결과 즉시 시각 피드백 (Thumb up/down → 체크 표시)
 */
export default function HelpfulFeedback({ contentId, category }: Props) {
  const [voted, setVoted] = useState<'up' | 'down' | null>(null);
  const storageKey = `helpful:${contentId}`;

  useEffect(() => {
    try {
      const prev = localStorage.getItem(storageKey);
      if (prev === 'up' || prev === 'down') setVoted(prev);
    } catch { /* localStorage 차단 환경 무시 */ }
  }, [storageKey]);

  const submit = (value: 'up' | 'down') => {
    if (voted) return;
    setVoted(value);
    try { localStorage.setItem(storageKey, value); } catch { /* 무시 */ }
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'helpful_feedback', {
        content_id: contentId,
        category,
        value, // 'up' | 'down'
      });
    }
  };

  return (
    <section className="helpful-feedback" aria-label="이 분석이 도움이 되었나요">
      <div className="helpful-feedback-question">이 분석이 도움이 되었나요?</div>
      {voted ? (
        <div className="helpful-feedback-thanks">
          <Check size={14} strokeWidth={2.5} aria-hidden /> 의견 감사합니다. 다음 분석에 반영하겠습니다.
        </div>
      ) : (
        <div className="helpful-feedback-buttons">
          <button
            type="button"
            onClick={() => submit('up')}
            className="helpful-feedback-btn helpful-feedback-btn-up"
            aria-label="도움이 되었어요"
          >
            <ThumbsUp size={14} strokeWidth={2.5} aria-hidden /> 도움 됐어요
          </button>
          <button
            type="button"
            onClick={() => submit('down')}
            className="helpful-feedback-btn helpful-feedback-btn-down"
            aria-label="도움이 되지 않았어요"
          >
            <ThumbsDown size={14} strokeWidth={2.5} aria-hidden /> 아쉬워요
          </button>
        </div>
      )}
    </section>
  );
}
