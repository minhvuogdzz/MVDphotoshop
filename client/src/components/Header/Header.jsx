import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import HeaderSearch from './HeaderSearch';

const NAV_LINKS = [
  { name: 'Trang chủ', path: '/' },
  { name: 'Giới thiệu', path: '/about' },
  { name: 'Khóa học', path: '/courses' },
  { name: 'Dịch vụ', path: '/services' },
  { name: 'Tác phẩm', path: '/showcase' },
  { name: 'Tài nguyên', path: '/resources', badge: 'Mới' },
  { name: 'Liên hệ', path: '/contact' },
];

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  // Active tab and sliding indicator states
  const [hoveredPath, setHoveredPath] = useState(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const navRefs = useRef([]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const targetPath = hoveredPath !== null ? hoveredPath : location.pathname;
    const index = NAV_LINKS.findIndex(l => {
      if (l.path === '/') return targetPath === '/';
      return targetPath.startsWith(l.path);
    });

    if (index !== -1 && navRefs.current[index]) {
      const el = navRefs.current[index];
      setIndicatorStyle({
        left: el.offsetLeft,
        width: el.offsetWidth,
        opacity: 1
      });
    } else {
      setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
    }
  }, [hoveredPath, location.pathname]);

  const isLinkActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 ease-in-out ${
          scrolled
            ? 'py-3.5 bg-bg-glass backdrop-blur-xl border-b border-glass shadow-sm dark:shadow-[0_10px_30px_rgba(0,0,0,0.4)]'
            : 'py-5 bg-transparent'
        }`}
      >
        <div className={`w-full px-6 sm:px-8 md:px-12 xl:px-16 2xl:px-20 flex justify-between items-center transition-all duration-300 ${!scrolled ? 'dark:drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]' : ''}`}>
          {/* Brand Logo */}
          <Link to="/" className="font-secondary text-2xl xl:text-[26px] font-bold tracking-wide z-10 flex items-center gap-2 shrink-0">
            <span>MVD</span>
            <span className="font-normal italic text-accent">Photoshop</span>
            <span className="text-[10px] font-sans font-semibold tracking-widest uppercase px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30 hidden sm:inline-block">
              Academy
            </span>
          </Link>

          {/* Desktop Nav - Generously Spaced */}
          <nav className="hidden lg:flex gap-7 xl:gap-9 2xl:gap-11 relative items-center" onMouseLeave={() => setHoveredPath(null)}>
            {/* Sliding Indicator */}
            <div
              className="absolute bottom-[-6px] h-[2px] bg-accent transition-all duration-300 ease-out pointer-events-none rounded-full"
              style={{
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width}px`,
                opacity: indicatorStyle.opacity
              }}
            />
            {NAV_LINKS.map((link, idx) => {
              const active = isLinkActive(link.path);
              return (
                <Link
                  key={idx}
                  ref={el => navRefs.current[idx] = el}
                  to={link.path}
                  onMouseEnter={() => setHoveredPath(link.path)}
                  className={`relative font-medium text-sm transition-colors py-1 ${
                    active ? 'text-accent font-semibold' : (!scrolled ? 'text-text-primary' : 'text-text-secondary')
                  } hover:text-accent flex items-center gap-1.5`}
                >
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Actions: Search, Theme Toggle, Mobile Menu Toggle */}
          <div className="flex gap-2.5 items-center z-10">
            {/* Header Real-time Search */}
            <HeaderSearch />

            {/* Dark/Light Mode Toggle */}
            <button
              className="text-text-primary w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 hover:bg-black/5 dark:hover:bg-white/10 hover:text-accent"
              aria-label={theme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
              onClick={toggleTheme}
            >
              {theme === 'dark' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden text-text-primary w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Mở menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Sidebar */}
        <div
          className={`fixed top-0 right-0 h-screen w-[300px] bg-white/95 dark:bg-[#141210]/98 backdrop-blur-2xl border-l border-glass shadow-2xl transform transition-transform duration-300 ease-in-out z-[200] flex flex-col justify-between ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div>
            <div className="p-6 flex justify-between items-center border-b border-glass">
              <span className="font-secondary font-bold text-accent">MVD Academy</span>
              <button
                className="text-text-secondary hover:text-accent p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <nav className="flex flex-col gap-2 p-6">
              {NAV_LINKS.map((link, idx) => {
                const active = isLinkActive(link.path);
                return (
                  <Link
                    key={idx}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all ${
                      active
                        ? 'bg-accent/15 text-accent font-semibold border border-accent/30'
                        : 'text-text-primary hover:bg-black/5 dark:hover:bg-white/5 hover:text-accent'
                    }`}
                  >
                    <span>{link.name}</span>
                    {link.badge && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="p-6 border-t border-glass text-center text-xs text-text-secondary">
            <p className="mb-1 text-text-primary font-medium">MVD Photoshop Academy</p>
            <p>Học viện Hậu kỳ & Nhiếp ảnh Chuyên nghiệp</p>
          </div>
        </div>

        {/* Mobile overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[150]"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </header>
    </>
  );
};

export default Header;
