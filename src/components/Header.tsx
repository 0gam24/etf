'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu, X, Search, Zap, TrendingUp, Waves, Coins, Radio, BookOpen } from 'lucide-react';

const CAT_ICON: Record<string, React.ReactNode> = {
  pulse: <Zap size={18} strokeWidth={2.4} aria-hidden />,
  surge: <TrendingUp size={18} strokeWidth={2.4} aria-hidden />,
  flow: <Waves size={18} strokeWidth={2.4} aria-hidden />,
  income: <Coins size={18} strokeWidth={2.4} aria-hidden />,
  breaking: <Radio size={18} strokeWidth={2.4} aria-hidden />,
  guide: <BookOpen size={18} strokeWidth={2.4} aria-hidden />,
};
import SearchModal from './SearchModal';

const NAV_ITEMS = [
  { href: '/pulse',    label: '오늘의 관전포인트', cat: 'pulse' },
  { href: '/breaking', label: 'ETF 속보',          cat: 'breaking' },
  { href: '/surge',    label: '급등 테마',         cat: 'surge' },
  { href: '/flow',     label: '자금 흐름',          cat: 'flow' },
  { href: '/income',   label: '월배당·커버드콜',   cat: 'income' },
  { href: '/guide',    label: '가이드',             cat: 'guide' },
];

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    // 라우트 변경 시 메뉴·검색 닫기
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    // Cmd/Ctrl+K 검색
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(s => !s);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      <header className={`header-v2 ${scrolled ? 'is-scrolled' : ''}`} role="banner">
        <div className="header-v2-inner">
          <Link href="/" className="header-v2-logo" aria-label="Daily ETF Pulse 홈">
            <Zap className="header-v2-logo-icon" size={22} aria-hidden strokeWidth={2.5} />
            <span>DAILY ETF PULSE</span>
          </Link>

          <nav className="header-v2-nav" aria-label="주 메뉴">
            {NAV_ITEMS.map(item => (
              <Link
                key={item.href}
                href={item.href}
                data-category={item.cat}
                className={`header-v2-link ${isActive(item.href) ? 'is-active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="header-v2-actions">
            <button
              type="button"
              className="header-v2-search-btn"
              onClick={() => setSearchOpen(true)}
              aria-label="검색 열기 (Ctrl+K)"
              title="검색 (Ctrl+K)"
            >
              <Search size={18} strokeWidth={2.2} aria-hidden />
            </button>
            <button
              type="button"
              className="header-v2-menu-btn"
              onClick={() => setMenuOpen(true)}
              aria-label="메뉴 열기"
              aria-expanded={menuOpen}
            >
              <Menu size={20} strokeWidth={2.2} aria-hidden />
            </button>
          </div>
        </div>
      </header>

      {/* 모바일 드로어 */}
      <div
        className={`mobile-drawer-backdrop ${menuOpen ? 'is-open' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden
      />
      <aside
        className={`mobile-drawer ${menuOpen ? 'is-open' : ''}`}
        aria-label="모바일 메뉴"
        aria-hidden={!menuOpen}
      >
        <button
          className="mobile-drawer-close"
          onClick={() => setMenuOpen(false)}
          aria-label="메뉴 닫기"
        >
          <X size={20} aria-hidden />
        </button>
        {NAV_ITEMS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`mobile-drawer-link ${isActive(item.href) ? 'is-active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            <span className="mobile-drawer-icon" aria-hidden>
              {CAT_ICON[item.cat]}
            </span>
            {item.label}
          </Link>
        ))}
        <div style={{ marginTop: 'auto', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--border-color)', color: 'var(--text-dim)', fontSize: 'var(--fs-xs)' }}>
          매일 오전 9시 전 자동 업데이트
        </div>
      </aside>

      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </>
  );
}
