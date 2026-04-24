'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface SearchItem {
  title: string;
  category: string;
  categoryName: string;
  slug: string;
  description: string;
}

interface SearchModalProps {
  onClose: () => void;
}

export default function SearchModal({ onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<SearchItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    (async () => {
      try {
        const res = await fetch('/api/search');
        if (!res.ok) return;
        const data = await res.json();
        setItems(data.items || []);
      } catch {
        /* silent */
      }
    })();
  }, []);

  const results = query.trim()
    ? items.filter(it =>
        it.title.toLowerCase().includes(query.toLowerCase()) ||
        it.description.toLowerCase().includes(query.toLowerCase()) ||
        it.slug.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 12)
    : items.slice(0, 8);

  return (
    <div
      className="search-modal-backdrop"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="검색"
    >
      <div className="search-modal">
        <input
          ref={inputRef}
          type="search"
          className="search-modal-input"
          placeholder="ETF 종목 · 키워드로 검색 (예: KODEX 방산, 커버드콜)"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.key === 'Escape') onClose(); }}
        />
        <div className="search-results" role="listbox">
          {results.length === 0 ? (
            <div style={{ padding: 'var(--space-5)', color: 'var(--text-dim)', textAlign: 'center', fontSize: 'var(--fs-sm)' }}>
              {query ? '일치하는 글이 없습니다.' : '최근 글을 불러오는 중…'}
            </div>
          ) : (
            results.map(it => (
              <Link
                key={`${it.category}-${it.slug}`}
                href={`/${it.category}/${it.slug}`}
                className="search-result-item"
                onClick={onClose}
              >
                <div className="search-result-category">{it.categoryName}</div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{it.title}</div>
                <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-dim)', marginTop: 2 }}>{it.description}</div>
              </Link>
            ))
          )}
        </div>
        <div style={{ marginTop: 'var(--space-3)', fontSize: 'var(--fs-xs)', color: 'var(--text-dim)', display: 'flex', justifyContent: 'space-between' }}>
          <span>ESC로 닫기</span>
          <span>⌘/Ctrl + K</span>
        </div>
      </div>
    </div>
  );
}
