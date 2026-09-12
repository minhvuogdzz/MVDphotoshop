import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const HeaderSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Real-time search with debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get(`/search?q=${encodeURIComponent(query.trim())}`);
        setResults(data);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (url) => {
    setIsOpen(false);
    setQuery('');
    navigate(url);
  };

  const totalResults = results
    ? (results.resources?.length || 0) + (results.courses?.length || 0) + (results.projects?.length || 0)
    : 0;

  return (
    <div className="relative" ref={containerRef}>
      {/* Search Trigger Button / Input on Desktop */}
      <div className="hidden sm:flex items-center">
        <div 
          onClick={() => {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
          className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-glass hover:border-accent/40 text-text-secondary hover:text-text-primary cursor-pointer transition-all duration-300 w-44 md:w-56"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-accent shrink-0">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span className="text-xs truncate">Tìm kiếm tài nguyên...</span>
          <kbd className="hidden md:inline-flex ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-text-secondary border border-glass">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Mobile Icon Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className="sm:hidden w-10 h-10 flex items-center justify-center rounded-full text-text-primary hover:bg-white/10 transition-colors"
        aria-label="Mở tìm kiếm"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>

      {/* Dropdown / Modal Results Panel */}
      {isOpen && (
        <div className="fixed sm:absolute top-16 sm:top-full right-4 sm:right-0 left-4 sm:left-auto sm:w-[460px] max-w-[calc(100vw-32px)] mt-2 bg-white/95 dark:bg-[#181513]/95 backdrop-blur-xl border border-glass rounded-2xl shadow-2xl z-[200] overflow-hidden animate-fadeIn">
          {/* Search Header Input */}
          <div className="p-3 border-b border-glass flex items-center gap-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-accent shrink-0 ml-1">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm Action, Preset, Khóa học, Hậu kỳ..."
              className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-secondary/60 outline-none font-medium"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-xs text-text-secondary hover:text-text-primary p-1 rounded hover:bg-black/5 dark:hover:bg-white/10"
              >
                ✕
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-text-secondary hover:text-accent font-medium px-2 py-1"
            >
              Đóng
            </button>
          </div>

          {/* Body Content */}
          <div className="max-h-[380px] overflow-y-auto p-3 space-y-4">
            {loading ? (
              <div className="py-8 text-center text-accent text-sm flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"></span>
                <span>Đang tìm kiếm dữ liệu thời gian thực...</span>
              </div>
            ) : !query.trim() ? (
              <div className="py-6 px-4 text-center">
                <p className="text-xs text-text-secondary mb-3">Gợi ý tìm kiếm phổ biến:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['Photoshop Action', 'Retouch da', 'Màu cưới Vintage', 'Khóa học VIP', 'Overlay Tia Nắng'].map(tag => (
                    <button
                      key={tag}
                      onClick={() => setQuery(tag)}
                      className="px-2.5 py-1 text-xs rounded-full bg-black/5 dark:bg-white/5 hover:bg-accent/20 hover:text-accent border border-glass transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            ) : totalResults === 0 ? (
              <div className="py-8 text-center text-text-secondary text-sm">
                Không tìm thấy kết quả nào phù hợp với &quot;<span className="text-text-primary font-bold">{query}</span>&quot;
              </div>
            ) : (
              <>
                {/* Tài nguyên (Resources) */}
                {results.resources?.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between px-2 pb-1.5 text-xs font-semibold text-accent uppercase tracking-wider">
                      <span>📦 Kho Tài Nguyên ({results.resources.length})</span>
                      <button 
                        onClick={() => handleSelect(`/resources?search=${encodeURIComponent(query)}`)}
                        className="text-[11px] text-text-secondary hover:text-accent font-normal lowercase"
                      >
                        Xem tất cả →
                      </button>
                    </div>
                    <div className="space-y-1">
                      {results.resources.slice(0, 4).map(res => (
                        <div
                          key={res._id}
                          onClick={() => handleSelect(`/resources?search=${encodeURIComponent(res.title)}`)}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer group transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-accent/20 text-accent shrink-0">
                              {res.fileType || '.ZIP'}
                            </span>
                            <div className="truncate">
                              <p className="text-xs font-medium text-text-primary group-hover:text-accent truncate">
                                {res.title}
                              </p>
                              <p className="text-[11px] text-text-secondary truncate">
                                {res.category} • {res.fileSize || 'N/A'}
                              </p>
                            </div>
                          </div>
                          {res.isVip && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-500 dark:text-amber-300 shrink-0 ml-2">
                              VIP
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Khóa học (Courses / Services) */}
                {results.courses?.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between px-2 pb-1.5 text-xs font-semibold text-accent uppercase tracking-wider">
                      <span>🎓 Khóa học & Đào tạo ({results.courses.length})</span>
                    </div>
                    <div className="space-y-1">
                      {results.courses.slice(0, 3).map(course => (
                        <div
                          key={course._id}
                          onClick={() => handleSelect('/courses')}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer group transition-colors"
                        >
                          <div className="truncate">
                            <p className="text-xs font-medium text-text-primary group-hover:text-accent truncate">
                              {course.name || course.title}
                            </p>
                            <p className="text-[11px] text-text-secondary truncate">
                              {course.type || 'Chương trình đào tạo'}
                            </p>
                          </div>
                          <span className="text-xs font-bold text-accent shrink-0 ml-2">
                            {course.price}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tác phẩm (Showcase) */}
                {results.projects?.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between px-2 pb-1.5 text-xs font-semibold text-accent uppercase tracking-wider">
                      <span>🎨 Tác phẩm học viện ({results.projects.length})</span>
                    </div>
                    <div className="space-y-1">
                      {results.projects.slice(0, 3).map(proj => (
                        <div
                          key={proj._id}
                          onClick={() => handleSelect('/showcase')}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer group transition-colors"
                        >
                          {proj.coverImage && (
                            <img src={proj.coverImage} alt={proj.title} className="w-9 h-9 rounded object-cover shrink-0" />
                          )}
                          <div className="truncate">
                            <p className="text-xs font-medium text-text-primary group-hover:text-accent truncate">
                              {proj.title}
                            </p>
                            <p className="text-[11px] text-text-secondary truncate">
                              {proj.category}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Search Footer */}
          <div className="p-2.5 bg-black/5 dark:bg-black/40 border-t border-glass flex items-center justify-between text-[11px] text-text-secondary">
            <span>Truy xuất dữ liệu học viện tức thì</span>
            <span>Nhấn <kbd className="font-mono text-text-primary font-bold">ESC</kbd> để thoát</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderSearch;
