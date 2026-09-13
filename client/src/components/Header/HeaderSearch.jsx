import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useData } from '../../contexts/DataContext';

const HeaderSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  // AI Search states
  const [isAiMode, setIsAiMode] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [aiError, setAiError] = useState('');

  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const { pageSettings, resources, portfolio } = useData();

  // Dynamic suggestions extracted from Admin custom categories and hashtags (limited to 4-5)
  const dynamicSuggestions = useMemo(() => {
    const customCats = pageSettings?.resources?.categories || [];
    const customTags = (pageSettings?.resources?.popularTags || []).map(t => t.replace(/^#/, ''));
    const resourceTags = (resources || []).flatMap(r => r.tags || []).map(t => t.replace(/^#/, ''));
    const resourceCats = (resources || []).map(r => r.category).filter(Boolean);

    const combined = Array.from(new Set([
      ...customTags,
      ...customCats,
      ...resourceTags,
      ...resourceCats
    ])).filter(Boolean);

    if (combined.length === 0) {
      return ['Retouch Da', 'Photoshop Action', 'Preset Lightroom', 'High-End', 'Font Việt Hóa'];
    }

    // Limit to 4 or 5 suggestions as requested
    return combined.slice(0, 5);
  }, [pageSettings?.resources?.categories, pageSettings?.resources?.popularTags, resources]);

  // Quick prompt questions for MVD AI search
  const aiSamplePrompts = [
    'Tìm concept bộ ảnh nàng thơ hoặc beauty ngoài trời',
    'Action làm mịn da giữ khối tự nhiên High-End',
    'Xem các bộ ảnh cưới và gia đình đẹp nhất',
    'Làm thế nào để tải tài nguyên và học retouch?'
  ];

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

  // Real-time search with debounce (Standard mode only)
  useEffect(() => {
    if (isAiMode) return; // Do not auto-search in AI mode

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
  }, [query, isAiMode]);

  // Trigger AI Search
  const handleAiSearchSubmit = async (promptQuery) => {
    const searchTarget = (promptQuery || query).trim();
    if (!searchTarget) return;

    setQuery(searchTarget);
    setAiLoading(true);
    setAiError('');
    setAiResponse(null);

    try {
      const { data } = await api.post('/search/ai', { query: searchTarget });
      setAiResponse(data);
    } catch (err) {
      console.error('AI Search error:', err);
      setAiError('Không thể kết nối với MVD AI lúc này. Vui lòng thử lại.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSelect = (url) => {
    setIsOpen(false);
    setQuery('');
    setAiResponse(null);
    navigate(url);
  };

  const totalResults = results
    ? (results.resources?.length || 0) + (results.courses?.length || 0) + (results.portfolios?.length || 0)
    : 0;

  return (
    <div className="relative" ref={containerRef}>
      {/* Compact Search Trigger for Mobile & Tablet (< xl) */}
      <div className="flex xl:hidden items-center gap-1.5">
        <button
          type="button"
          onClick={() => {
            setIsAiMode(false);
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-text-primary hover:bg-black/5 dark:hover:bg-white/10 hover:text-accent transition-all cursor-pointer"
          aria-label="Tìm kiếm"
          title="Tìm kiếm (⌘K)"
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => {
            setIsAiMode(true);
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500/15 via-purple-500/15 to-pink-500/15 border border-purple-500/30 text-purple-400 hover:text-pink-400 hover:shadow-[0_0_12px_rgba(155,114,203,0.3)] transition-all cursor-pointer relative group"
          aria-label="Hỏi MVD AI"
          title="Hỏi MVD AI ✨"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span className="absolute -top-0.5 -right-0.5 text-[9px] text-pink-400 animate-pulse">✦</span>
        </button>
      </div>

      {/* Full Extended Search Trigger on Desktop (>= xl) */}
      <div className="hidden xl:flex items-center gap-2">
        <div 
          onClick={() => {
            setIsAiMode(false);
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
          className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-black/5 dark:bg-white/5 border border-glass hover:border-accent/40 text-text-secondary hover:text-text-primary cursor-pointer transition-all duration-300 w-44 2xl:w-52"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-accent shrink-0">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span className="text-xs truncate">Tìm kiếm tài nguyên...</span>
          <kbd className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 text-text-secondary border border-glass">
            ⌘K
          </kbd>
        </div>

        {/* Dedicated MVD AI Search Trigger Pill */}
        <button
          type="button"
          onClick={() => {
            setIsAiMode(true);
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
          className="relative px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500/15 via-purple-500/15 to-pink-500/15 hover:from-blue-500/25 hover:via-purple-500/25 hover:to-pink-500/25 border border-purple-500/30 text-xs font-semibold text-text-primary flex items-center gap-1.5 transition-all duration-300 shadow-sm hover:shadow-[0_0_15px_rgba(155,114,203,0.3)] cursor-pointer group shrink-0"
          title="Tìm kiếm thông minh cùng MVD AI"
        >
          {/* Magnifying Glass with AI Sparkle */}
          <div className="relative flex items-center justify-center shrink-0">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-purple-400 group-hover:text-pink-400 transition-colors">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span className="absolute -top-1.5 -right-1.5 text-[9px] text-pink-400 animate-pulse">✦</span>
          </div>
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-bold">
            MVD AI
          </span>
        </button>
      </div>

      {/* Dropdown / Modal Results Panel */}
      {isOpen && (
        <div className="fixed sm:absolute top-16 sm:top-full right-4 sm:right-0 left-4 sm:left-auto sm:w-[540px] max-w-[calc(100vw-32px)] mt-2 bg-white/95 dark:bg-[#181513]/95 backdrop-blur-2xl border border-glass rounded-3xl shadow-2xl z-[200] overflow-hidden animate-fadeIn">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-glass bg-black/5 dark:bg-black/20">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsAiMode(false);
                  setAiResponse(null);
                }}
                className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  !isAiMode 
                    ? 'bg-accent text-neutral-950 shadow-sm' 
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                }`}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span>Tìm nhanh</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAiMode(true)}
                className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isAiMode 
                    ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-[0_0_15px_rgba(155,114,203,0.5)]' 
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <span className="absolute -top-1.5 -right-1.5 text-[8px] text-pink-300 animate-pulse">✦</span>
                </div>
                <span>Hỏi MVD AI ✨</span>
              </button>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-text-secondary hover:text-text-primary px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
            >
              Đóng (ESC)
            </button>
          </div>

          {/* Search Header Input Area */}
          <div className="p-3">
            {isAiMode ? (
              /* MVD AI Search with Animated Running Border */
              <div className="gemini-border-wrapper">
                <div className="gemini-ambient-glow" />
                <div className="gemini-border-spinning" />
                <div className="gemini-border-inner bg-white dark:bg-[#181513] p-2.5 flex items-center gap-2.5">
                  <div className="relative shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-purple-500/15 text-purple-400">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <span className="absolute -top-1 -right-1 text-[9px] text-pink-400 animate-spin">✦</span>
                  </div>

                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAiSearchSubmit();
                      }
                    }}
                    placeholder="Hỏi MVD AI: Tìm concept bộ ảnh, preset màu, tài nguyên, cách sử dụng..."
                    className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-secondary/60 outline-none font-medium"
                  />

                  {query && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery('');
                        setAiResponse(null);
                      }}
                      className="text-xs text-text-secondary hover:text-text-primary p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
                    >
                      ✕
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleAiSearchSubmit()}
                    disabled={aiLoading || !query.trim()}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:opacity-90 disabled:opacity-40 text-white text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    {aiLoading ? (
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Hỏi MVD AI</span>
                        <span>✨</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Standard Search Input */
              <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-glass">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-accent shrink-0">
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
                    className="text-xs text-text-secondary hover:text-text-primary p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Body Content */}
          <div className="max-h-[410px] overflow-y-auto p-3.5 space-y-4 custom-scrollbar">
            {/* AI Search Mode View */}
            {isAiMode ? (
              <div className="space-y-4">
                {aiLoading ? (
                  <div className="py-10 text-center space-y-3">
                    <div className="relative w-12 h-12 mx-auto flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 animate-spin opacity-40 blur-sm" />
                      <span className="text-2xl animate-pulse">✨</span>
                    </div>
                    <p className="text-xs text-text-primary font-semibold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                      MVD AI đang rà soát toàn bộ tác phẩm, concept & dữ liệu trang web...
                    </p>
                    <p className="text-[11px] text-text-secondary">
                      Tổng hợp Concept bộ ảnh, Kỹ thuật Hậu kỳ, Tài nguyên & Hướng dẫn sử dụng
                    </p>
                  </div>
                ) : aiResponse ? (
                  <div className="space-y-3.5 animate-fadeIn">
                    {/* AI Answer Bubble */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-pink-500/10 border border-purple-500/20 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400">
                        <span>✨ Trợ lý Trí tuệ Nhân tạo MVD AI:</span>
                      </div>
                      <p className="text-xs text-text-primary leading-relaxed whitespace-pre-line">
                        {aiResponse.answer}
                      </p>
                    </div>

                    {/* AI Recommendations */}
                    {aiResponse.recommendations && aiResponse.recommendations.length > 0 && (
                      <div>
                        <span className="text-[11px] font-bold text-accent uppercase tracking-wider block mb-2 px-1">
                          📌 Đề xuất tốt nhất cho bạn ({aiResponse.recommendations.length}):
                        </span>
                        <div className="space-y-2">
                          {aiResponse.recommendations.map((rec, idx) => {
                            const isPortfolio = rec.type === 'portfolio' || rec.type === 'album' || rec.type === 'concept' || rec.type === 'bộ ảnh' || (rec.actionUrl && rec.actionUrl.includes('/showcase'));
                            const isCourse = rec.type === 'course';
                            const isComparison = rec.type === 'comparison';

                            let targetId = rec.id;
                            let targetTitle = rec.title;

                            // Resolve exact ObjectId and title from portfolio collection
                            if (isPortfolio && portfolio && portfolio.length > 0) {
                              const matched = portfolio.find(p => 
                                (targetId && String(p._id) === String(targetId)) ||
                                (targetTitle && p.title.toLowerCase().trim() === targetTitle.toLowerCase().trim())
                              );
                              if (matched) {
                                targetId = matched._id;
                                targetTitle = matched.title;
                              }
                            }

                            let targetUrl = rec.actionUrl;
                            if (isPortfolio) {
                              targetUrl = `/showcase?id=${targetId || ''}&album=${encodeURIComponent(targetTitle || '')}`;
                            } else if (isComparison) {
                              targetUrl = `/showcase?id=${rec.id || ''}`;
                            } else if (isCourse) {
                              targetUrl = rec.actionUrl || '/courses';
                            } else {
                              targetUrl = `/resources?search=${encodeURIComponent(rec.title || '')}`;
                            }

                            return (
                              <div
                                key={rec.id || idx}
                                onClick={() => handleSelect(targetUrl)}
                                className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-glass cursor-pointer transition-all hover:scale-[1.01] group flex items-start gap-3"
                              >
                                {/* Thumbnail Image if available */}
                                {rec.image ? (
                                  <img 
                                    src={rec.image} 
                                    alt={rec.title} 
                                    className="w-14 h-14 rounded-xl object-cover border border-glass shrink-0 shadow-md group-hover:border-accent/50 transition-colors" 
                                  />
                                ) : isCourse ? (
                                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 font-bold text-base">
                                    🎓
                                  </div>
                                ) : isComparison ? (
                                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 font-bold text-base">
                                    🌓
                                  </div>
                                ) : (
                                  <div className="w-12 h-12 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent shrink-0 font-bold text-xs">
                                    {rec.fileType || 'MVD'}
                                  </div>
                                )}

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-accent/20 text-accent">
                                      {rec.category || (isPortfolio ? 'Concept Tác phẩm' : isCourse ? 'Khóa học' : 'Tài nguyên')}
                                    </span>
                                    {rec.fileType && (
                                      <span className="text-[10px] font-mono font-bold text-text-secondary bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded">
                                        {rec.fileType}
                                      </span>
                                    )}
                                    {rec.isVip && (
                                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                        VIP
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="text-xs font-bold text-text-primary group-hover:text-accent transition-colors truncate">
                                    {rec.title}
                                  </h4>
                                  {rec.highlight && (
                                    <p className="text-[11px] text-text-secondary mt-0.5 line-clamp-2 leading-relaxed">
                                      {rec.highlight}
                                    </p>
                                  )}
                                </div>

                                <span className="text-xs text-accent font-bold shrink-0 mt-1 inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                                  {isPortfolio ? 'Xem ảnh' : isCourse ? 'Khóa học' : 'Xem'} →
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Initial AI View - Sample Prompts */
                  <div className="py-4 px-2 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-accent uppercase tracking-wider">
                        💡 Gợi ý câu hỏi thông minh cho MVD AI:
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {aiSamplePrompts.map((promptText, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleAiSearchSubmit(promptText)}
                          className="p-2.5 text-left text-xs rounded-xl bg-black/5 dark:bg-white/5 hover:bg-gradient-to-r hover:from-purple-500/15 hover:to-pink-500/15 border border-glass text-text-secondary hover:text-text-primary transition-all flex items-center justify-between group cursor-pointer"
                        >
                          <span className="truncate">{promptText}</span>
                          <span className="text-accent text-[11px] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                            Hỏi MVD AI ↵
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {aiError && (
                  <div className="p-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl">
                    {aiError}
                  </div>
                )}
              </div>
            ) : (
              /* Standard Search Mode View */
              <>
                {loading ? (
                  <div className="py-8 text-center text-accent text-sm flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    <span>Đang tìm kiếm dữ liệu thời gian thực...</span>
                  </div>
                ) : !query.trim() ? (
                  /* Dynamic 4-5 suggestions from admin custom categories/tags */
                  <div className="py-4 px-2 text-center">
                    <p className="text-xs text-text-secondary mb-3">Gợi ý tìm kiếm phổ biến:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {dynamicSuggestions.map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setQuery(tag)}
                          className="px-3 py-1.5 text-xs rounded-full bg-black/5 dark:bg-white/5 hover:bg-accent/20 hover:text-accent border border-glass transition-colors cursor-pointer"
                        >
                          {tag.startsWith('#') ? tag : `#${tag}`}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : totalResults === 0 ? (
                  <div className="py-8 text-center text-text-secondary text-sm space-y-3">
                    <p>Không tìm thấy kết quả nào phù hợp với &quot;<span className="text-text-primary font-bold">{query}</span>&quot;</p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAiMode(true);
                        handleAiSearchSubmit(query);
                      }}
                      className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white text-xs font-bold hover:opacity-95 transition-opacity"
                    >
                      Hỏi MVD AI ✨
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Resources */}
                    {results.resources?.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between px-2 pb-1.5 text-xs font-semibold text-accent uppercase tracking-wider">
                          <span>📦 Kho Tài Nguyên ({results.resources.length})</span>
                          <button 
                            onClick={() => handleSelect(`/resources?search=${encodeURIComponent(query)}`)}
                            className="text-[11px] text-text-secondary hover:text-accent font-normal lowercase cursor-pointer"
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

                    {/* Courses */}
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

                    {/* Projects */}
                    {results.portfolios?.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between px-2 pb-1.5 text-xs font-semibold text-accent uppercase tracking-wider">
                          <span>🎨 Tác phẩm học viện ({results.portfolios.length})</span>
                        </div>
                        <div className="space-y-1">
                          {results.portfolios.slice(0, 4).map(proj => (
                            <div
                              key={proj._id}
                              onClick={() => handleSelect(`/showcase?id=${proj._id}&album=${encodeURIComponent(proj.title)}`)}
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
              </>
            )}
          </div>

          {/* Search Footer */}
          <div className="p-2.5 bg-black/5 dark:bg-black/40 border-t border-glass flex items-center justify-between text-[11px] text-text-secondary">
            <span>{isAiMode ? 'Hệ thống Trí tuệ Nhân tạo MVD AI ✨' : 'Truy xuất kho dữ liệu MVD tức thì'}</span>
            <span>Nhấn <kbd className="font-mono text-text-primary font-bold">ESC</kbd> để đóng</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderSearch;
