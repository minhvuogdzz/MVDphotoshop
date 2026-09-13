import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useData } from '../contexts/DataContext';
import CollabSection from '../components/CollabSection/CollabSection';

const Showcase = () => {
  const { portfolio } = useData();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('Tất cả');
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentGallery, setCurrentGallery] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeAlbum, setActiveAlbum] = useState(null);
  const [highlightedId, setHighlightedId] = useState(null);

  const displayData = portfolio || [];
  const categories = ['Tất cả', ...new Set(displayData.map(item => item.category).filter(Boolean))];

  // Scroll to top only when NOT targeting a specific album from search
  useEffect(() => {
    const targetId = searchParams.get('id');
    const targetAlbum = searchParams.get('album');
    if (!targetId && !targetAlbum) {
      window.scrollTo(0, 0);
    }
  }, [searchParams]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      } else if (e.key === 'ArrowRight' && currentGallery.length > 1) {
        setCurrentIndex((prev) => (prev + 1) % currentGallery.length);
      } else if (e.key === 'ArrowLeft' && currentGallery.length > 1) {
        setCurrentIndex((prev) => (prev - 1 + currentGallery.length) % currentGallery.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, currentGallery.length]);

  // Target specific album from search query params (?id=... or ?album=...)
  useEffect(() => {
    const targetId = searchParams.get('id');
    const targetAlbum = searchParams.get('album');
    const targetCategory = searchParams.get('category');

    if (targetCategory && categories.includes(targetCategory)) {
      setActiveTab(targetCategory);
    }

    if (!portfolio || portfolio.length === 0) return;

    if (targetId || targetAlbum) {
      const match = portfolio.find(p => 
        (targetId && String(p._id) === String(targetId)) ||
        (targetAlbum && p.title.toLowerCase().trim() === targetAlbum.toLowerCase().trim())
      );

      if (match) {
        setSelectedAlbum(match);
        setHighlightedId(match._id);
        if (match.category) {
          setActiveTab(match.category);
        }

        // Staggered smooth scroll to gallery section
        const scrollToAlbum = () => {
          const el = document.getElementById('showcase-gallery') || document.getElementById(`portfolio-${match._id}`);
          if (el) {
            const headerOffset = 90;
            const elementPosition = el.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({
              top: Math.max(0, offsetPosition),
              behavior: 'smooth'
            });
          }
        };

        const t1 = setTimeout(scrollToAlbum, 100);
        const t2 = setTimeout(scrollToAlbum, 400);
        const t3 = setTimeout(scrollToAlbum, 700);

        return () => {
          clearTimeout(t1);
          clearTimeout(t2);
          clearTimeout(t3);
        };
      } else {
        setSelectedAlbum(null);
      }
    } else {
      setSelectedAlbum(null);
    }
  }, [searchParams, portfolio]);

  const handleClearAlbumFilter = () => {
    setSelectedAlbum(null);
    setActiveTab('Tất cả');
    navigate('/showcase', { replace: true });
    // Scroll smoothly to gallery top
    setTimeout(() => {
      const el = document.getElementById('showcase-gallery');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  const handleSelectSpecificAlbum = (album) => {
    setSelectedAlbum(album);
    setHighlightedId(album._id);
    if (album.category) setActiveTab(album.category);
    navigate(`/showcase?id=${album._id}&album=${encodeURIComponent(album.title)}`, { replace: true });
    setTimeout(() => {
      const el = document.getElementById('showcase-gallery');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const openLightbox = (item, initialIdx = 0) => {
    setActiveAlbum(item);
    const gallery = (item.images && item.images.length > 0) ? item.images : [item.coverImage];
    setCurrentGallery(gallery);
    setCurrentIndex(initialIdx >= 0 && initialIdx < gallery.length ? initialIdx : 0);
    setIsLightboxOpen(true);
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % currentGallery.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + currentGallery.length) % currentGallery.length);
  };

  const filteredData = activeTab === 'Tất cả'
    ? displayData
    : displayData.filter(item => item.category === activeTab);

  // Other albums in same category for recommendations
  const relatedAlbums = selectedAlbum
    ? displayData.filter(item => item._id !== selectedAlbum._id && item.category === selectedAlbum.category)
    : [];

  const albumPhotos = selectedAlbum
    ? ((selectedAlbum.images && selectedAlbum.images.length > 0) ? selectedAlbum.images : [selectedAlbum.coverImage])
    : [];

  return (
    <div className="pt-[110px] pb-[100px] bg-bg-main min-h-screen">
      {/* Banner */}
      <div className="container-custom mb-14 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-widest mb-4">
          Minh Chứng Năng Lực & Chất Lượng Đào Tạo
        </div>
        <h1 className="text-3xl md:text-5xl font-bold font-secondary text-text-primary mb-4">
          Tác Phẩm Học Viên & <span className="text-accent">Dự Án Tiêu Biểu</span>
        </h1>
        <p className="text-text-secondary max-w-[700px] mx-auto text-sm md:text-base leading-relaxed">
          Mỗi tác phẩm là sự kết hợp chuẩn xác giữa kỹ thuật xử lý ảnh tỉ mỉ và tư duy nghệ thuật màu sắc được tôi luyện tại MVD Academy.
        </p>
      </div>

      {/* Collab Section - Dành cho nhà tuyển dụng & Studio */}
      <div className="mb-16">
        <CollabSection />
      </div>

      {/* Projects Gallery Section Anchor */}
      <div id="showcase-gallery" className="container-custom scroll-mt-24">
        {/* Section Header */}
        <div className="text-center mb-8 border-t border-glass pt-16">
          <span className="text-xs uppercase tracking-widest text-accent font-bold">Showcase Dự Án</span>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary font-secondary mt-1">
            Bộ Sưu Tập Tác Phẩm Hậu Kỳ
          </h2>
        </div>

        {/* FOCUSED ALBUM VIEW (Trỏ trực tiếp vào bộ ảnh được tìm kiếm) */}
        {selectedAlbum ? (
          <div className="space-y-10 animate-fade-in">
            {/* Active Album Hero Card */}
            <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-accent/15 via-purple-500/10 to-accent/15 border-2 border-accent/40 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                <div 
                  onClick={() => openLightbox(selectedAlbum, 0)}
                  className="relative group w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 border-2 border-accent/60 shadow-xl cursor-pointer"
                  title="Nhấn để phóng to ảnh bìa"
                >
                  <img
                    src={selectedAlbum.coverImage || (selectedAlbum.images && selectedAlbum.images[0])}
                    alt={selectedAlbum.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                    <span className="text-white text-base">🔍</span>
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-accent text-neutral-950 shadow-sm flex items-center gap-1">
                      <span>✨</span>
                      <span>Đang trỏ vào bộ ảnh</span>
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-black/10 dark:bg-white/10 text-accent border border-accent/30">
                      {selectedAlbum.category}
                    </span>
                    {selectedAlbum.location && (
                      <span className="text-xs text-text-secondary">
                        📍 {selectedAlbum.location}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold font-secondary text-text-primary truncate">
                    Bộ ảnh: <span className="text-accent">{selectedAlbum.title}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary mt-1">
                    Bao gồm <strong className="text-text-primary">{albumPhotos.length}</strong> tác phẩm hậu kỳ nghệ thuật chất lượng cao
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0 w-full md:w-auto">
                <button
                  onClick={() => openLightbox(selectedAlbum, 0)}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-neutral-950 font-bold text-xs sm:text-sm transition-all shadow-[0_0_20px_rgba(192,155,104,0.4)] hover:shadow-[0_0_25px_rgba(192,155,104,0.7)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <span>Phóng to xem trọn bộ ({albumPhotos.length} ảnh)</span>
                </button>
                <button
                  onClick={handleClearAlbumFilter}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-text-primary text-xs sm:text-sm font-semibold border border-glass transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>✕</span>
                  <span>Xem tất cả ({displayData.length} bộ ảnh)</span>
                </button>
              </div>
            </div>

            {/* Photos of the Focused Album */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="text-lg font-bold text-text-primary font-secondary">
                    Tất cả các tác phẩm trong bộ ảnh &quot;{selectedAlbum.title}&quot;
                  </h4>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Nhấn vào ảnh bất kỳ để mở chế độ xem toàn màn hình độ phân giải cao
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-accent px-3 py-1 rounded-full bg-accent/15 border border-accent/30">
                  {albumPhotos.length} hình ảnh
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {albumPhotos.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => openLightbox(selectedAlbum, idx)}
                    className="group relative rounded-2xl overflow-hidden cursor-pointer bg-black/40 border border-black/10 dark:border-white/10 hover:border-accent/60 aspect-[4/5] hover:-translate-y-1.5 transition-all duration-500 shadow-lg"
                  >
                    <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white font-mono text-[11px] font-bold">
                      #{idx + 1}
                    </div>
                    <img
                      src={imgUrl}
                      alt={`${selectedAlbum.title} - Ảnh ${idx + 1}`}
                      className="w-full h-full object-cover block transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-5">
                      <p className="text-xs text-accent font-semibold tracking-wider uppercase mb-1">
                        {selectedAlbum.title} • Ảnh {idx + 1}/{albumPhotos.length}
                      </p>
                      <span className="inline-flex items-center gap-1.5 text-xs text-white/90 font-medium">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        Phóng to ảnh này
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Related Albums Section */}
            {relatedAlbums.length > 0 && (
              <div className="pt-10 border-t border-glass">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="text-xs font-bold text-accent uppercase tracking-widest">Gợi ý khám phá</span>
                    <h4 className="text-lg font-bold text-text-primary font-secondary mt-0.5">
                      Các bộ ảnh khác cùng thể loại &quot;{selectedAlbum.category}&quot;
                    </h4>
                  </div>
                  <button
                    onClick={handleClearAlbumFilter}
                    className="text-xs text-accent hover:underline font-semibold cursor-pointer"
                  >
                    Xem tất cả ({displayData.length} bộ ảnh) →
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {relatedAlbums.slice(0, 4).map(item => (
                    <div
                      key={item._id}
                      onClick={() => handleSelectSpecificAlbum(item)}
                      className="group relative rounded-xl overflow-hidden cursor-pointer bg-black/40 border border-black/10 dark:border-white/10 hover:border-accent aspect-[4/5] transition-all duration-300 shadow"
                    >
                      <img
                        src={item.coverImage || (item.images && item.images[0])}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3.5">
                        <h5 className="font-secondary text-sm font-bold text-white truncate">{item.title}</h5>
                        <p className="text-[11px] text-accent font-medium">{item.images?.length || 1} ảnh</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* REGULAR ALL ALBUMS VIEW */
          <>
            {/* Filter Categories */}
            <div className="flex justify-center flex-wrap gap-2.5 mb-12">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`px-5 py-2 rounded-full border text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === cat
                      ? 'bg-accent text-neutral-950 border-accent shadow-[0_0_15px_rgba(192,155,104,0.4)]'
                      : 'border-black/10 dark:border-white/10 text-text-secondary hover:border-accent hover:text-text-primary bg-black/5 dark:bg-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Grid Albums */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredData.map(item => (
                <div
                  key={item._id}
                  id={`portfolio-${item._id}`}
                  onClick={() => handleSelectSpecificAlbum(item)}
                  className={`group relative rounded-2xl overflow-hidden cursor-pointer bg-black/40 border aspect-[4/5] hover:-translate-y-1.5 transition-all duration-500 shadow-lg ${
                    highlightedId === item._id
                      ? 'ring-4 ring-accent border-accent shadow-[0_0_35px_rgba(192,155,104,0.8)] scale-[1.03] -translate-y-2'
                      : 'border-black/10 dark:border-white/5 hover:border-accent/40'
                  }`}
                >
                  {highlightedId === item._id && (
                    <div className="absolute top-3 left-3 z-20 px-3 py-1 rounded-full bg-accent text-neutral-950 font-bold text-xs shadow-xl animate-bounce flex items-center gap-1.5 border border-white/20">
                      <span>✨</span>
                      <span>Bộ ảnh bạn vừa tìm</span>
                    </div>
                  )}
                  <img
                    src={item.coverImage || (item.images && item.images[0])}
                    alt={item.title}
                    className="w-full h-full object-cover block transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-5">
                    <h3 className="font-secondary text-lg text-white font-bold mb-1">{item.title}</h3>
                    <p className="text-xs text-accent font-semibold tracking-wider uppercase mb-3">
                      {item.category} • {item.location || 'Studio MVD'}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-xs text-white/80 font-medium">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                      Xem chi tiết bộ ảnh ({item.images?.length || 1} ảnh)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && createPortal(
        <div
          className="fixed top-0 left-0 w-screen h-screen bg-black/95 backdrop-blur-2xl z-[2000] flex items-center justify-center animate-fade-in select-none"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Header of Lightbox with Album Info */}
          {activeAlbum && (
            <div className="absolute top-5 left-5 md:left-8 z-[2010] text-left max-w-[75vw] pointer-events-none">
              <span className="text-[10px] md:text-xs font-bold text-accent uppercase tracking-widest px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-glass inline-block mb-1 shadow-md">
                {activeAlbum.category} • {activeAlbum.location || 'Studio MVD'}
              </span>
              <h3 className="text-base md:text-xl font-secondary font-bold text-white drop-shadow-md truncate">
                {activeAlbum.title}
              </h3>
            </div>
          )}

          <button
            className="absolute top-5 right-6 md:right-8 bg-black/40 backdrop-blur-md border border-white/20 text-white hover:text-accent hover:border-accent w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-2xl leading-none cursor-pointer z-[2010] transition-colors shadow-lg"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Đóng"
          >
            ✕
          </button>

          <div className="relative w-full h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
            {currentGallery.length > 1 && (
              <button
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-accent hover:text-bg-main border border-white/20 text-white text-3xl w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full cursor-pointer z-[2010] transition-all shadow-md"
                onClick={prevImage}
                aria-label="Ảnh trước"
              >
                ‹
              </button>
            )}

            <img
              src={currentGallery[currentIndex]}
              alt="Ảnh phóng to"
              className="max-w-[92vw] max-h-[88vh] object-contain rounded-xl shadow-2xl"
            />

            {currentGallery.length > 1 && (
              <button
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-accent hover:text-bg-main border border-white/20 text-white text-3xl w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full cursor-pointer z-[2010] transition-all shadow-md"
                onClick={nextImage}
                aria-label="Ảnh tiếp"
              >
                ›
              </button>
            )}

            {currentGallery.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-5 py-2 rounded-full text-white text-xs sm:text-sm font-medium tracking-widest border border-white/10 shadow-lg">
                {currentIndex + 1} / {currentGallery.length}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Showcase;
