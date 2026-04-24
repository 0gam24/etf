'use client';

import { useState } from 'react';
import { Link2, MessageCircle, Check } from 'lucide-react';

interface ShareRowProps {
  title: string;
  path: string;
}

export default function ShareRow({ title, path }: ShareRowProps) {
  const [copied, setCopied] = useState(false);

  const getUrl = () => {
    if (typeof window === 'undefined') return path;
    return `${window.location.origin}${path}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* silent */
    }
  };

  const handleX = () => {
    const url = encodeURIComponent(getUrl());
    const text = encodeURIComponent(title);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'noopener,noreferrer');
  };

  const handleKakao = () => {
    // 카카오 SDK 없이 간단 공유 — 카카오톡 공유는 웹에서 딥링크 방식
    const url = encodeURIComponent(getUrl());
    window.open(`https://story.kakao.com/share?url=${url}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <div className="share-row">
        <span className="share-row-label">공유</span>
        <button type="button" className="share-btn" onClick={handleCopy} aria-label="링크 복사">
          {copied ? <Check size={16} strokeWidth={2.5} /> : <Link2 size={16} strokeWidth={2.2} />}
          {copied ? '복사됨' : '링크 복사'}
        </button>
        <button type="button" className="share-btn" onClick={handleX} aria-label="X(Twitter)로 공유">
          𝕏 공유
        </button>
        <button type="button" className="share-btn" onClick={handleKakao} aria-label="카카오스토리로 공유">
          <MessageCircle size={16} strokeWidth={2.2} />
          카카오
        </button>
      </div>
      <div className={`toast ${copied ? 'is-visible' : ''}`} role="status" aria-live="polite">
        링크가 복사되었습니다.
      </div>
    </>
  );
}
