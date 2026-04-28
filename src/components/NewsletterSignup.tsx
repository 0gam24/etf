'use client';

import { useState } from 'react';
import { Mail, Check, Rss } from 'lucide-react';

interface Props {
  /** 'compact' = 푸터·사이드바, 'full' = /newsletter 페이지 */
  variant?: 'compact' | 'full';
}

declare global {
  interface Window {
    gtag?: (cmd: string, action: string, params: Record<string, unknown>) => void;
  }
}

/**
 * 뉴스레터 구독 폼 — Phase 1 lite 버전
 *
 *   - 백엔드 X (Substack/Buttondown 미설정 — 사용자 GUI 작업 후 연결)
 *   - GA4 'newsletter_intent' 이벤트로 관심 수요 측정
 *   - localStorage로 이메일 임시 저장 (사용자가 콘솔에서 export 가능)
 *   - RSS 즉시 구독 옵션 노출 (기존 /rss.xml 활용)
 */
export default function NewsletterSignup({ variant = 'compact' }: Props) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmed = email.trim();
    if (!/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(trimmed)) {
      setError('올바른 이메일 형식을 입력해 주세요.');
      return;
    }
    // localStorage에 누적 — 사용자가 향후 export 가능
    try {
      const key = 'newsletter:waitlist';
      const prev = JSON.parse(localStorage.getItem(key) || '[]') as string[];
      if (!prev.includes(trimmed)) prev.push(trimmed);
      localStorage.setItem(key, JSON.stringify(prev));
    } catch { /* 무시 */ }

    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'newsletter_intent', {
        value: 1,
        method: 'email_form',
      });
    }

    setSubmitted(true);
  };

  if (variant === 'compact') {
    return (
      <div className="newsletter-compact">
        <div className="newsletter-compact-head">
          <Mail size={14} strokeWidth={2.4} aria-hidden /> 일일 ETF 요약
        </div>
        <p className="newsletter-compact-desc">
          매일 아침 핵심 ETF 분석을 RSS로 받아보세요. 이메일 다이제스트는 Phase 2에서 시작됩니다.
        </p>
        <a
          href="/rss.xml"
          className="newsletter-compact-cta"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Rss size={13} strokeWidth={2.5} aria-hidden /> RSS 구독
        </a>
        <a href="/newsletter" className="newsletter-compact-link">
          이메일 알림 대기 등록 →
        </a>
      </div>
    );
  }

  // full variant
  return (
    <section className="newsletter-full" aria-label="뉴스레터 구독">
      <div className="newsletter-full-head">
        <Mail size={20} strokeWidth={2.4} aria-hidden />
        <h2 className="newsletter-full-title">일일 ETF 요약 · 이메일로 받기</h2>
      </div>
      <p className="newsletter-full-desc">
        매일 아침 9시 발행되는 ETF 분석의 핵심을 한 통의 이메일로 정리해 드립니다. 거래량 TOP 3·섹터 자금 흐름·월배당 분배 캘린더 — 출근 전 5분.
      </p>

      {submitted ? (
        <div className="newsletter-full-thanks">
          <Check size={18} strokeWidth={2.5} aria-hidden />
          <div>
            <strong>관심 등록 감사합니다.</strong>
            <p>현재 발송 시스템 준비 중입니다. 첫 호 발행 시 이 이메일로 안내드립니다.</p>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="newsletter-full-form">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="newsletter-full-input"
            aria-label="이메일 주소"
            required
          />
          <button type="submit" className="newsletter-full-btn">관심 등록</button>
          {error && <div className="newsletter-full-error">{error}</div>}
        </form>
      )}

      <div className="newsletter-full-rss">
        <p>지금 바로 받아보고 싶다면 RSS 피드를 사용하세요.</p>
        <a
          href="/rss.xml"
          target="_blank"
          rel="noopener noreferrer"
          className="newsletter-full-rss-cta"
        >
          <Rss size={14} strokeWidth={2.5} aria-hidden /> Daily ETF Pulse RSS 구독
        </a>
      </div>

      <p className="newsletter-full-policy">
        ※ 입력한 이메일은 본인 브라우저(localStorage)에만 임시 저장되며, 발송 시스템 가동 시점에 사용자에게 명시적 동의를 받은 후 등록됩니다. 마케팅 외 목적으로 사용하지 않습니다.
      </p>
    </section>
  );
}
