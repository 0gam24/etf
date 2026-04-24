'use client';

import { useEffect, useState } from 'react';

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      const ratio = total > 0 ? (el.scrollTop / total) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, ratio)));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return <div className="reading-progress" style={{ width: `${progress}%` }} aria-hidden />;
}
