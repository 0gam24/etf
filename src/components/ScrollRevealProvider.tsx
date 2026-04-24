'use client';

import { useEffect } from 'react';

/** `.reveal` 클래스가 붙은 모든 요소를 뷰포트 진입 시 `.is-visible`로 토글 */
export default function ScrollRevealProvider() {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const io = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -80px 0px' }
    );

    const observeAll = () => {
      document.querySelectorAll('.reveal:not(.is-visible)').forEach(el => io.observe(el));
    };
    observeAll();

    // 라우트 변경 대응 — 간단히 MutationObserver로 새 DOM 감지
    const mo = new MutationObserver(observeAll);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => { io.disconnect(); mo.disconnect(); };
  }, []);

  return null;
}
