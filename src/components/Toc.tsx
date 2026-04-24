'use client';

import { useEffect, useState } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

export default function Toc() {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const headings = Array.from(
      document.querySelectorAll<HTMLHeadingElement>('.prose-v2 h2[id], .prose-v2 h3[id]')
    );
    const mapped: TocItem[] = headings.map(h => ({
      id: h.id,
      text: h.textContent || '',
      level: h.tagName === 'H2' ? 2 : 3,
    }));
    setItems(mapped);

    if (headings.length === 0) return;

    const io = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setActiveId(e.target.id);
          }
        }
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );
    headings.forEach(h => io.observe(h));
    return () => io.disconnect();
  }, []);

  if (items.length === 0) return null;

  return (
    <nav className="post-v2-toc" aria-label="목차">
      <div className="post-v2-toc-title">Table of Contents</div>
      <ul className="post-v2-toc-list">
        {items.map(it => (
          <li
            key={it.id}
            className={`post-v2-toc-item ${it.level === 3 ? 'level-3' : ''} ${activeId === it.id ? 'is-active' : ''}`}
          >
            <a href={`#${it.id}`}>{it.text}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
