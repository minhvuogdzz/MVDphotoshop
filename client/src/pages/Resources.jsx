import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import ResourceCard from '../components/Resources/ResourceCard';
import api from '../services/api';

const Resources = () => {
  const { resources, pageSettings, loading, refetch } = useData();
  const page = pageSettings?.resources || {};
  const [searchParams] = useSearchParams();

  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [selectedTag, setSelectedTag] = useState('Tất cả tags');
  const [vipOnly, setVipOnly] = useState(false);
  const [hotOnly, setHotOnly] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Dynamic Categories: Admin custom + extracted from existing resources
  const categoriesList = useMemo(() => {
    const defaultCats = [
      'Photoshop Action',
      'Preset Lightroom',
      'Brush Pack',
      'Texture & Overlay',
      'PSD Mockup',
      'Font Việt Hóa',
      'Tài liệu Giáo trình'
    ];
    const configCats = page?.categories && page.categories.length > 0 ? page.categories : defaultCats;
    const resourceCats = (resources || []).map(r => r.category).filter(Boolean);
    const unique = Array.from(new Set([...configCats, ...resourceCats]));
    return ['Tất cả', ...unique];
  }, [page?.categories, resources]);

  // Dynamic Popular Tags: Admin custom + extracted from existing resources
  const popularTagsList = useMemo(() => {
    const defaultTags = [
      'Retouch Da',
      'High-End',
      'Dodge & Burn',
      'Nàng Thơ',
      'Stock RAW',
      'Font Việt Hóa',
      'Cinematic',
      'Màu Cưới'
    ];
    const configTags = page?.popularTags && page.popularTags.length > 0 ? page.popularTags : defaultTags;
    const resourceTags = (resources || []).flatMap(r => r.tags || []).filter(Boolean);
    const unique = Array.from(new Set([...configTags, ...resourceTags])).map(t => 
      t.startsWith('#') ? t : `#${t}`
    );
    return ['Tất cả tags', ...unique];
  }, [page?.popularTags, resources]);

  // Sync URL search params
  useEffect(() => {
    const qParam = searchParams.get('search');
    if (qParam !== null) setSearchQuery(qParam);

    const tagParam = searchParams.get('tag');
    if (tagParam) setSelectedTag(tagParam.startsWith('#') ? tagParam : `#${tagParam}`);

    const catParam = searchParams.get('category');
    if (catParam) setSelectedCategory(catParam);

    const idParam = searchParams.get('id');
    if (idParam && resources && resources.length > 0) {
      const match = resources.find(r => r._id === idParam);
      if (match) setSelectedResource(match);
    }
  }, [searchParams, resources]);

  // Lock body scroll when modal is open and handle Escape key to close
  useEffect(() => {
    if (selectedResource) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setSelectedResource(null);
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [selectedResource]);

  const handleSelectTag = (tag) => {
    const formattedTag = tag.startsWith('#') ? tag : `#${tag}`;
    if (selectedTag.toLowerCase() === formattedTag.toLowerCase()) {
      setSelectedTag('Tất cả tags');
    } else {
      setSelectedTag(formattedTag);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Filtered resources list
  const filteredList = useMemo(() => {
    let list = resources || [];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(item => 
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.tags && item.tags.some(t => t.toLowerCase().includes(q))) ||
        (item.category && item.category.toLowerCase().includes(q))
      );
    }

    if (selectedCategory !== 'Tất cả') {
      list = list.filter(item => item.category === selectedCategory);
    }

    if (selectedTag !== 'Tất cả tags') {
      const cleanTag = selectedTag.replace(/^#/, '').toLowerCase();
      list = list.filter(item => 
        item.tags && item.tags.some(t => t.replace(/^#/, '').toLowerCase() === cleanTag)
      );
    }

    if (vipOnly) {
      list = list.filter(item => item.isVip);
    }

    if (hotOnly) {
      list = list.filter(item => item.isHot);
    }

    return list;
  }, [resources, searchQuery, selectedCategory, selectedTag, vipOnly, hotOnly]);

  const handleDownload = async (resource) => {
    if (!resource || isDownloading) return;

    try {
      setIsDownloading(true);

      // Handle Google Drive link (>= 6MB or downloadType === 'drive')
      if (resource.downloadType === 'drive' || (resource.driveUrl && resource.driveUrl.trim())) {
        const driveTarget = resource.driveUrl || resource.downloadUrl;
        if (driveTarget) {
          window.open(driveTarget, '_blank', 'noopener,noreferrer');
        }
        try {
          await api.post(`/resources/${resource._id}/track-download`);
        } catch {
          // ignore tracking error
        }
        setSelectedResource(prev => prev ? { ...prev, downloadsCount: (prev.downloadsCount || 0) + 1 } : null);
        if (refetch) refetch('resources');
        return;
      }

      // If resource has a direct file URL / cloudinary URL fallback
      if (resource.fileUrl || resource.cloudinaryUrl) {
        const targetUrl = resource.fileUrl || resource.cloudinaryUrl;
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
        try {
          await api.post(`/resources/${resource._id}/track-download`);
        } catch {
          // ignore tracking error
        }
        if (refetch) refetch('resources');
        return;
      }

      // Handle Direct Download (< 6MB) via server download stream
      const res = await api.get(`/resources/${resource._id}/download`, {
        responseType: 'blob'
      });

      // Extract exact filename from Content-Disposition header
      let filename = '';
      const disposition = res.headers?.['content-disposition'] || '';
      if (disposition) {
        const utfMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i);
        if (utfMatch && utfMatch[1]) {
          filename = decodeURIComponent(utfMatch[1]);
        } else {
          const regMatch = disposition.match(/filename="?([^";]+)"?/i);
          if (regMatch && regMatch[1]) {
            filename = decodeURIComponent(regMatch[1]);
          }
        }
      }

      if (!filename) {
        const ext = resource.fileType?.startsWith('.') ? resource.fileType : `.${resource.fileType || 'zip'}`;
        const base = (resource.originalFilename || resource.title || 'MVD_Resource').replace(/[/\\?%*:|"<>]/g, '_').trim();
        filename = base.toLowerCase().endsWith(ext.toLowerCase()) ? base : `${base}${ext}`;
      }

      // Trigger browser download via Blob URL (same-origin, 100% preserves filename and byte content)
      const blob = new Blob([res.data], { type: 'application/octet-stream' });
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      // Optimistically increment download count in modal and refetch
      setSelectedResource(prev => prev ? { ...prev, downloadsCount: (prev.downloadsCount || 0) + 1 } : null);
      if (refetch) refetch('resources');
    } catch (err) {
      console.error('Download error:', err);
      // Direct browser fallback
      const fallbackUrl = `${api.defaults.baseURL || 'http://localhost:5001/api'}/resources/${resource._id}/download`;
      window.open(fallbackUrl, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="pt-[110px] pb-[100px] bg-bg-main min-h-screen">
      {/* Header Banner */}
      <div className="container-custom mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-widest mb-4">
          <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
          {page.badge || 'Kho Học Liệu & Công Cụ Độc Quyền'}
        </div>
        <h1 className="text-3xl md:text-5xl font-bold font-secondary text-text-primary mb-4">
          {page.title || 'Kho Tài Nguyên MVD Academy'}
        </h1>
        <p className="text-text-secondary max-w-[700px] mx-auto text-sm md:text-base leading-relaxed whitespace-pre-line">
          {page.description || 'Tổng hợp Actions, Presets, Brushes, Fonts, Overlays và Stock RAW chuẩn phòng lab hậu kỳ, phục vụ học tập và sáng tạo không giới hạn.'}
        </p>

        {/* Search Bar */}
        <div className="max-w-[650px] mx-auto mt-8 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm action làm da, preset nàng thơ, brush khói, font poster..."
            className="w-full bg-white/90 dark:bg-[#161311] border border-black/10 dark:border-white/10 rounded-full py-3.5 pl-12 pr-10 text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-accent shadow-sm dark:shadow-[0_4px_25px_rgba(0,0,0,0.5)] transition-all text-sm"
          />
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-accent" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="container-custom">
        {/* Category Pills Bar */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
          {categoriesList.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-4 py-2 rounded-full transition-all whitespace-nowrap cursor-pointer font-medium ${
                selectedCategory === cat
                  ? 'bg-accent text-neutral-950 font-bold shadow-[0_0_15px_rgba(192,155,104,0.4)]'
                  : 'bg-white/80 dark:bg-[#161311] text-text-secondary hover:text-text-primary border border-black/5 dark:border-white/10 hover:border-accent/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Quick Filters Row: VIP, HOT, Popular Tags */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white/60 dark:bg-[#161311]/60 border border-black/5 dark:border-white/5 mb-8 backdrop-blur-sm">
          {/* Quick Badges Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary font-medium mr-1">Bộ lọc:</span>
            <button
              onClick={() => setVipOnly(!vipOnly)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
                vipOnly
                  ? 'bg-amber-500/20 text-amber-500 dark:text-amber-300 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                  : 'border-black/10 dark:border-white/10 text-text-secondary hover:text-text-primary'
              }`}
            >
              <span>★</span>
              <span>VIP Only</span>
            </button>
            <button
              onClick={() => setHotOnly(!hotOnly)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
                hotOnly
                  ? 'bg-rose-500/20 text-rose-500 dark:text-rose-400 border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                  : 'border-black/10 dark:border-white/10 text-text-secondary hover:text-text-primary'
              }`}
            >
              <span>🔥</span>
              <span>HOT</span>
            </button>
          </div>

          {/* Popular Hashtags */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full">
            <span className="text-xs text-text-secondary font-medium mr-1 shrink-0">Tags:</span>
            {popularTagsList.map(tag => (
              <button
                key={tag}
                onClick={() => handleSelectTag(tag)}
                className={`text-xs px-3 py-1 rounded-full transition-colors whitespace-nowrap cursor-pointer ${
                  selectedTag === tag
                    ? 'bg-accent/20 text-accent font-bold border border-accent/40'
                    : 'text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Count result */}
        <div className="flex items-center justify-between mb-6 text-xs text-text-secondary">
          <span>Hiển thị <strong>{filteredList.length}</strong> tài nguyên</span>
          {(selectedCategory !== 'Tất cả' || selectedTag !== 'Tất cả tags' || vipOnly || hotOnly || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('Tất cả');
                setSelectedTag('Tất cả tags');
                setVipOnly(false);
                setHotOnly(false);
                setSearchQuery('');
              }}
              className="text-accent hover:underline cursor-pointer"
            >
              Đặt lại tất cả bộ lọc
            </button>
          )}
        </div>

        {/* Resources Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 rounded-2xl bg-black/5 dark:bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : filteredList.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-3xl bg-white/40 dark:bg-[#161311]/40 border border-black/5 dark:border-white/5 max-w-lg mx-auto">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-lg font-bold text-text-primary mb-2">Không tìm thấy tài nguyên phù hợp</h3>
            <p className="text-text-secondary text-sm max-w-[450px] mx-auto mb-6">
              {searchQuery 
                ? `Không có kết quả nào cho từ khóa "${searchQuery}".` 
                : 'Hãy thử tìm kiếm với từ khóa khác hoặc bỏ các điều kiện lọc đang chọn.'}
            </p>
            {resources && resources.length > 0 && (
              <button
                onClick={() => {
                  setSelectedCategory('Tất cả');
                  setSelectedTag('Tất cả tags');
                  setVipOnly(false);
                  setHotOnly(false);
                  setSearchQuery('');
                }}
                className="px-6 py-2.5 rounded-full bg-accent text-neutral-950 font-bold text-sm hover:bg-accent-hover transition-colors"
              >
                Xem tất cả tài nguyên
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredList.map(item => (
              <ResourceCard
                key={item._id}
                item={item}
                onSelect={(res) => setSelectedResource(res)}
                onSelectTag={handleSelectTag}
              />
            ))}
          </div>
        )}
      </div>

      {/* Resource Detail Modal rendered via React Portal into document.body */}
      {mounted && selectedResource && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in"
          onClick={() => setSelectedResource(null)}
        >
          <div 
            className="relative w-full max-w-[580px] max-h-[calc(100vh-2rem)] sm:max-h-[88vh] bg-white dark:bg-[#161311] border border-black/10 dark:border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden my-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header (Pinned at top) */}
            <div className="shrink-0 flex items-center justify-between px-5 sm:px-6 py-4 border-b border-black/10 dark:border-white/10 bg-neutral-50/90 dark:bg-[#1c1917]/90 backdrop-blur-sm z-10">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-black/5 dark:bg-white/10 text-text-primary text-xs font-semibold px-3 py-1 rounded-full border border-black/5 dark:border-white/5">
                  {selectedResource.category || 'Tài nguyên'}
                </span>
                {selectedResource.isVip && (
                  <span className="bg-amber-500/20 text-amber-600 dark:text-amber-300 font-bold px-2.5 py-0.5 rounded-full text-xs border border-amber-500/30 tracking-wider">
                    VIP
                  </span>
                )}
                {selectedResource.isHot && (
                  <span className="bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold px-2.5 py-0.5 rounded-full text-xs border border-rose-500/30 tracking-wider">
                    HOT
                  </span>
                )}
                {selectedResource.fileType && (
                  <span className="font-mono text-xs font-bold text-text-secondary uppercase tracking-wider">
                    {selectedResource.fileType.startsWith('.') ? selectedResource.fileType : `.${selectedResource.fileType}`}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedResource(null)}
                className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 hover:bg-rose-500/20 hover:text-rose-500 dark:hover:bg-white/20 text-text-primary flex items-center justify-center text-sm font-bold transition-all cursor-pointer shrink-0 ml-2"
                aria-label="Đóng popup"
                title="Đóng (Esc)"
              >
                ✕
              </button>
            </div>

            {/* Modal Body (Scrollable inside only, min-h-0 ensures shrinkage on short viewports) */}
            <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 space-y-5 custom-scrollbar">
              {/* Optional Cover/Preview image */}
              {(selectedResource.coverImage || selectedResource.previewImage) && (
                <div className="w-full h-44 sm:h-52 rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-black/5 dark:bg-black/20 shadow-inner">
                  <img
                    src={selectedResource.coverImage || selectedResource.previewImage}
                    alt={selectedResource.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-secondary text-text-primary mb-2.5 leading-snug">
                  {selectedResource.title}
                </h2>
                <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-line">
                  {selectedResource.description || 'Tài nguyên hậu kỳ độc quyền từ MVD Photoshop Academy dành cho học viên và cộng đồng.'}
                </p>
              </div>

              {/* Tags - Clickable to filter */}
              {selectedResource.tags && selectedResource.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedResource.tags.map((tag, i) => {
                    const formattedTag = tag.startsWith('#') ? tag : `#${tag}`;
                    return (
                      <button
                        type="button"
                        key={i}
                        onClick={() => {
                          handleSelectTag(formattedTag);
                          setSelectedResource(null);
                        }}
                        className="text-xs px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5 text-text-secondary hover:text-accent hover:border-accent/40 border border-black/5 dark:border-white/5 cursor-pointer transition-colors"
                        title={`Lọc theo thẻ ${formattedTag}`}
                      >
                        {formattedTag}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Resource Info Specs Table */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3.5 sm:p-4 rounded-2xl bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/5 text-center">
                <div>
                  <span className="block text-[10px] sm:text-[11px] uppercase tracking-wider text-text-secondary">Dung lượng</span>
                  <span className="text-xs sm:text-sm font-bold text-text-primary">{selectedResource.fileSize || '0.1 MB'}</span>
                </div>
                <div>
                  <span className="block text-[10px] sm:text-[11px] uppercase tracking-wider text-text-secondary">Định dạng</span>
                  <span className="text-xs sm:text-sm font-bold text-accent">{selectedResource.fileType || '.ATN'}</span>
                </div>
                <div>
                  <span className="block text-[10px] sm:text-[11px] uppercase tracking-wider text-text-secondary">Đánh giá</span>
                  <span className="text-xs sm:text-sm font-bold text-amber-500 dark:text-amber-400">★ {(selectedResource.rating || 5.0).toFixed(1)}</span>
                </div>
              </div>

              {/* Usage Guide (Admin Custom or Default) */}
              {(selectedResource.instructions || page.defaultInstructions) && (
                <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-accent mb-2.5 flex items-center gap-1.5">
                    <span>💡 Hướng dẫn sử dụng nhanh</span>
                  </h4>
                  <div className="text-xs text-text-secondary space-y-1.5 leading-relaxed">
                    {(selectedResource.instructions || page.defaultInstructions)
                      .split('\n')
                      .map(line => line.trim())
                      .filter(Boolean)
                      .map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="text-accent shrink-0 mt-0.5">•</span>
                          <span>{step.replace(/^[•\-*]\s*/, '')}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer (Pinned at bottom) */}
            <div className="shrink-0 p-4 sm:p-5 border-t border-black/10 dark:border-white/10 bg-neutral-50/90 dark:bg-[#181513]/90 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-text-secondary text-center sm:text-left">
                {selectedResource.downloadType === 'drive'
                  ? '⚡ Dung lượng ≥ 6MB: Tải qua Google Drive tốc độ cao'
                  : '⚡ Dung lượng < 6MB: Tải trực tiếp từ hệ thống MVD'}
              </span>

              <button
                type="button"
                onClick={() => handleDownload(selectedResource)}
                disabled={isDownloading}
                className="w-full sm:w-auto px-6 py-2.5 sm:py-3 rounded-full bg-accent hover:bg-accent-hover text-neutral-950 font-bold text-sm transition-all shadow-[0_0_20px_rgba(192,155,104,0.4)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span>
                  {isDownloading 
                    ? 'Đang tải...' 
                    : (selectedResource.downloadType === 'drive'
                      ? 'Mở Google Drive để tải'
                      : 'Tải tài nguyên về máy')}
                </span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Resources;
