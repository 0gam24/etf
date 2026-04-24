'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { useState } from 'react';

interface MarkdownRendererProps {
  content: string;
}

/** 본문 이미지 — 로딩/에러 fallback 포함 */
function PostImage({ src, alt }: { src?: string; alt?: string }) {
  const [err, setErr] = useState(false);
  if (!src) return null;

  if (err) {
    return (
      <div
        role="img"
        aria-label={alt || '이미지 로드 실패'}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          aspectRatio: '1200 / 630',
          margin: 'var(--space-6) 0',
          background: 'linear-gradient(135deg, #0B0E14 0%, #1A1F2E 100%)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-dim)',
          fontSize: 'var(--fs-sm)',
          textAlign: 'center',
          padding: 'var(--space-6)',
        }}
      >
        <span style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>⚡ {alt || 'Daily ETF Pulse'}</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt || ''}
      loading="lazy"
      decoding="async"
      onError={() => setErr(true)}
      style={{
        width: '100%',
        height: 'auto',
        aspectRatio: '1200 / 630',
        objectFit: 'cover',
        display: 'block',
        margin: 'var(--space-6) 0',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)',
        background: 'linear-gradient(135deg, #0B0E14 0%, #1A1F2E 100%)',
      }}
    />
  );
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose-v2">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: 'wrap', properties: { className: 'heading-anchor' } }],
          rehypeHighlight,
        ]}
        components={{
          a: ({ href, children, ...props }) => {
            const isExternal = href && /^https?:\/\//.test(href);
            return (
              <a
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                {...props}
              >
                {children}
              </a>
            );
          },
          img: ({ src, alt }) => <PostImage src={typeof src === 'string' ? src : undefined} alt={alt} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
