import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import ResourceCard from '../components/Resources/ResourceCard';
import api from '../services/api';

const CATEGORIES = [
  'Tất cả',
  'Photoshop Action',
  'Preset Lightroom',
  'Brush',
  'Font',
  'Overlay',
  'Mockup',
  'Tài liệu & PSD'
];

const POPULAR_TAGS = [
  'Tất cả tags',
  '#Retouch Da',
  '#High-End',
  '#Dodge & Burn',
  '#Nàng Thơ',
  '#Stock RAW',
  '#Font Việt Hóa',
  '#Cinematic'
];

const Resources = () => {
  const { resources, pageSettings, loading, refetch } = useData();
  const page = pageSettings?.resources || {};
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [selectedTag, setSelectedTag] = useState('Tất cả tags');
  const [vipOnly, setVipOnly] = useState(false);
  const [hotOnly, setHotOnly] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Filtered resources calculation
  const filteredList = useMemo(() => {
    const list = resources || [];
    return list.filter(item => {
      // Category filter
      if (selectedCategory !== 'Tất cả' && item.category !== selectedCategory) {
        return false;
      }
      // VIP / HOT filter
      if (vipOnly && !item.isVip) return false;
      if (hotOnly && !item.isHot) return false;

      // Tag filter
      if (selectedTag !== 'Tất cả tags') {
        const cleanTag = selectedTag.replace('#', '').toLowerCase();
        const hasTag = (item.tags || []).some(t => t.toLowerCase().includes(cleanTag));
        if (!hasTag) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = item.title?.toLowerCase().includes(q);
        const inDesc = item.description?.toLowerCase().includes(q);
        const inCat = item.category?.toLowerCase().includes(q);
        const inExt = item.fileType?.toLowerCase().includes(q);
        const inTags = (item.tags || []).some(t => t.toLowerCase().includes(q));
        return inTitle || inDesc || inCat || inExt || inTags;
      }

      return true;
    });
  }, [resources, selectedCategory, selectedTag, vipOnly, hotOnly, searchQuery]);

  const handleDownload = async (resource) => {
    if (!resource) return;
    setIsDownloading(true);

    try {
      const targetUrl = resource.downloadUrl || resource.driveUrl || resource.fileUrl;

      // Handle Google Drive links
      if (resource.downloadType === 'drive' || targetUrl?.includes('drive.google.com')) {
        await api.post(`/resources/${resource._id}/download`).catch(() => {});
        if (targetUrl && targetUrl !== '#' && targetUrl.startsWith('http')) {
          window.open(targetUrl, '_blank', 'noopener,noreferrer');
        } else {
          alert('Liên kết Google Drive chưa được cập nhật cho tài nguyên này.');
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
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-accent text-neutral-950 font-bold shadow-[0_0_15px_rgba(192,155,104,0.4)]'
                  : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-text-secondary hover:text-text-primary border border-black/5 dark:border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Filter Badges & Popular Tags Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 p-3 rounded-2xl glass-panel border border-glass">
          {/* Quick Tags */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {POPULAR_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`text-xs px-3 py-1 rounded-full transition-colors whitespace-nowrap cursor-pointer ${
                  selectedTag === tag
                    ? 'bg-accent/20 text-accent font-bold'
                    : 'text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* VIP & HOT Toggles */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setVipOnly(!vipOnly)}
              className={`text-xs px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                vipOnly
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'bg-black/5 dark:bg-white/5 text-amber-500 dark:text-amber-300/70 border border-amber-500/20 hover:border-amber-500/50'
              }`}
            >
              ★ VIP
            </button>

            <button
              onClick={() => setHotOnly(!hotOnly)}
              className={`text-xs px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                hotOnly
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'bg-black/5 dark:bg-white/5 text-rose-500 dark:text-rose-300/70 border border-rose-500/20 hover:border-rose-500/50'
              }`}
            >
              🔥 HOT
            </button>
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

        {/* Resource Grid */}
        {filteredList.length === 0 ? (
          <div className="text-center py-20 glass-panel border border-glass rounded-3xl p-8 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-accent/15 text-accent flex items-center justify-center mx-auto mb-4 text-2xl">
              {(!resources || resources.length === 0) ? '📦' : '🔍'}
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">
              {(!resources || resources.length === 0) 
                ? 'Kho tài nguyên đang cập nhật' 
                : 'Không tìm thấy tài nguyên phù hợp'}
            </h3>
            <p className="text-text-secondary text-sm max-w-[400px] mx-auto mb-6">
              {(!resources || resources.length === 0)
                ? 'Chưa có tài nguyên nào được đăng tải. Ban quản trị có thể thêm và tải file tài nguyên trong trang Admin.'
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
              />
            ))}
          </div>
        )}
      </div>

      {/* Resource Detail Modal */}
      {selectedResource && (
        <div 
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-fade-in"
          onClick={() => setSelectedResource(null)}
        >
          <div 
            className="relative w-full max-w-[580px] bg-white dark:bg-[#161311] border border-black/10 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-black/10 dark:border-white/5 bg-black/5 dark:bg-black/40">
              <div className="flex items-center gap-2">
                <span className="bg-black/10 dark:bg-white/10 text-text-primary text-xs font-semibold px-3 py-1 rounded-full">
                  {selectedResource.category}
                </span>
                {selectedResource.isVip && (
                  <span className="bg-amber-500/20 text-amber-500 dark:text-amber-300 font-bold px-2.5 py-0.5 rounded-full text-xs border border-amber-500/30">
                    VIP
                  </span>
                )}
                {selectedResource.isHot && (
                  <span className="bg-rose-500/20 text-rose-500 dark:text-rose-400 font-bold px-2.5 py-0.5 rounded-full text-xs border border-rose-500/30">
                    HOT
                  </span>
                )}
                <span className="font-mono text-xs font-bold text-text-secondary">
                  {selectedResource.fileType}
                </span>
              </div>

              <button
                onClick={() => setSelectedResource(null)}
                className="w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-text-primary flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex flex-col gap-5">
              <div>
                <h2 className="text-2xl font-bold font-secondary text-text-primary mb-3">
                  {selectedResource.title}
                </h2>
                <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-line">
                  {selectedResource.description}
                </p>
              </div>

              {/* Tags */}
              {selectedResource.tags && selectedResource.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedResource.tags.map((tag, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5 text-text-secondary border border-black/5 dark:border-white/5">
                      {tag.startsWith('#') ? tag : `#${tag}`}
                    </span>
                  ))}
                </div>
              )}

              {/* Resource Info Specs Table */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/5 text-center">
                <div>
                  <span className="block text-[11px] uppercase tracking-wider text-text-secondary">Dung lượng</span>
                  <span className="text-sm font-bold text-text-primary">{selectedResource.fileSize || '0.1 MB'}</span>
                </div>
                <div>
                  <span className="block text-[11px] uppercase tracking-wider text-text-secondary">Định dạng</span>
                  <span className="text-sm font-bold text-accent">{selectedResource.fileType || '.ATN'}</span>
                </div>
                <div>
                  <span className="block text-[11px] uppercase tracking-wider text-text-secondary">Đánh giá</span>
                  <span className="text-sm font-bold text-amber-500 dark:text-amber-400">★ {(selectedResource.rating || 5.0).toFixed(1)}</span>
                </div>
              </div>

              {/* Usage Guide */}
              <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-accent mb-2">Hướng dẫn sử dụng nhanh</h4>
                <ul className="text-xs text-text-secondary space-y-1.5 list-disc list-inside">
                  <li>Khởi động Adobe Photoshop hoặc Lightroom phiên bản tương ứng.</li>
                  <li>Click đúp vào file đã tải về (hoặc vào menu File &gt; Load Actions / Presets).</li>
                  <li>Áp dụng vào ảnh của bạn và tinh chỉnh Opacity theo mong muốn.</li>
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-black/10 dark:border-white/5 bg-black/5 dark:bg-black/50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-text-secondary">
                {selectedResource.downloadType === 'drive'
                  ? '⚡ Dung lượng ≥ 6MB: Tải qua Google Drive tốc độ cao'
                  : '⚡ Dung lượng < 6MB: Tải trực tiếp từ hệ thống MVD'}
              </span>

              <button
                onClick={() => handleDownload(selectedResource)}
                disabled={isDownloading}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-accent hover:bg-accent-hover text-neutral-950 font-bold text-sm transition-all shadow-[0_0_20px_rgba(192,155,104,0.4)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span>
                  {selectedResource.downloadType === 'drive'
                    ? 'Mở Google Drive để tải'
                    : 'Tải tài nguyên về máy'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resources;
