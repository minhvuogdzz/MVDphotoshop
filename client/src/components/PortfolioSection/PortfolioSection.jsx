import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useData } from '../../contexts/DataContext';
import LoadingSpinner from '../common/LoadingSpinner';
import Marquee from '../common/Marquee';

const PortfolioSection = () => {
  const { portfolio, loading } = useData();
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [mounted, setMounted] = useState(false);
  
  // Lightbox states
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentGallery, setCurrentGallery] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [viewMode, setViewMode] = useState('marquee'); // 'marquee' or 'grid'

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const displayData = portfolio || [];
  const categories = ['Tất cả', ...new Set(displayData.map(item => item.category))];
  
  const filteredData = activeTab === 'Tất cả' 
    ? displayData 
    : displayData.filter(item => item.category === activeTab);

  const openLightbox = (item) => {
    if (!item) return;
    const rawList = (item.images && item.images.length > 0) 
      ? item.images 
      : (item.coverImage ? [item.coverImage] : []);
    const gallery = rawList.filter(Boolean);
    if (gallery.length === 0) return;
    setCurrentGallery(gallery);
    setCurrentIndex(0);
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

  return (
    <section id="portfolio" className="py-[100px] bg-bg-main relative overflow-hidden">
      {/* Container aligned with all other sections */}
      <div className="container-custom relative transition-all duration-300">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-wider mb-3">
            Tác Phẩm & Dự Án
          </span>
          <h2 className="text-[36px] md:text-[44px] font-bold mb-3 text-accent font-secondary">
            Portfolio
          </h2>
          <p className="text-text-secondary max-w-[620px] mx-auto text-sm md:text-base leading-relaxed">
            Khám phá những dự án hình ảnh nổi bật được thực hiện bằng tâm huyết và kỹ thuật chuẩn mực.
          </p>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {/* Filter Tabs & View Mode Switcher */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 pb-4 border-b border-white/5">
              <div className="flex justify-center flex-wrap gap-2 sm:gap-3">
                {categories.map(cat => (
                  <button
                    key={cat}
                    className={`px-5 py-2 rounded-full border text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer ${
                      activeTab === cat 
                        ? 'bg-accent text-bg-main border-accent shadow-[0_0_15px_rgba(192,155,104,0.4)]' 
                        : 'border-white/10 text-text-secondary hover:border-accent hover:text-white bg-white/5'
                    }`}
                    onClick={() => setActiveTab(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* View Mode Toggle Buttons */}
              <div className="flex items-center bg-white/5 p-1 rounded-full border border-white/10 shrink-0">
                <button
                  onClick={() => setViewMode('marquee')}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    viewMode === 'marquee'
                      ? 'bg-accent text-bg-main shadow-sm'
                      : 'text-text-secondary hover:text-white'
                  }`}
                >
                  Cuộn mượt
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-accent text-bg-main shadow-sm'
                      : 'text-text-secondary hover:text-white'
                  }`}
                >
                  Lưới ảnh ({filteredData.length})
                </button>
              </div>
            </div>

            {/* Content Display: Grid or Marquee */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 md:gap-4">
                {filteredData.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => openLightbox(item)}
                    className="group relative overflow-hidden cursor-pointer rounded-lg bg-black/40 border border-white/10 transition-all duration-500 hover:-translate-y-2 hover:border-accent/70 hover:shadow-[0_20px_45px_rgba(0,0,0,0.9),0_0_30px_rgba(192,155,104,0.3)] aspect-[4/5]"
                  >
                    <img 
                      src={item.coverImage || (item.images && item.images[0])} 
                      alt={item.title} 
                      className="w-full h-full object-cover block rounded-lg transition-transform duration-700 ease-out group-hover:scale-110"
                      loading="lazy"
                    />

                    {/* Top Floating Badge */}
                    <div className="absolute top-3.5 left-3.5 z-20 transition-all duration-400 -translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                      <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-accent/40 text-accent text-xs font-bold uppercase tracking-wider shadow-lg">
                        {item.category}
                      </span>
                    </div>

                    {/* Glassmorphic Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent backdrop-blur-[1.5px] opacity-0 group-hover:opacity-100 transition-all duration-400 z-10 rounded-lg" />

                    {/* Bottom Details */}
                    <div className="absolute inset-0 z-20 p-5 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-all duration-400 rounded-lg">
                      <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-400 ease-out">
                        <h3 className="font-secondary text-xl font-bold text-white mb-1.5 drop-shadow-md group-hover:text-accent transition-colors">
                          {item.title}
                        </h3>
                        {item.location && (
                          <p className="text-xs text-text-secondary flex items-center gap-1.5 mb-3.5 font-medium">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-accent">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                              <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            <span>{item.location}</span>
                          </p>
                        )}
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openLightbox(item);
                          }}
                          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-950 bg-accent hover:bg-accent-hover px-4 py-2 rounded-full border border-accent transition-all shadow-md cursor-pointer pointer-events-auto"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                          </svg>
                          <span>Xem toàn bộ</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative overflow-hidden w-full px-0 rounded-lg [mask-image:linear-gradient(to_right,transparent,black_2%,black_98%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_2%,black_98%,transparent)]">
                <Marquee 
                  items={filteredData.length <= 4 ? [...filteredData, ...filteredData] : filteredData.slice(0, Math.ceil(filteredData.length / 2))}
                  duration="180s"
                  itemClassName="w-[195px] md:w-[220px] lg:w-[245px]"
                  renderItem={(item) => (
                    <div 
                      onClick={() => openLightbox(item)}
                      className="group relative overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-1.5 hover:border-accent/70 hover:shadow-[0_16px_35px_rgba(0,0,0,0.8),0_0_25px_rgba(192,155,104,0.3)] h-[280px] md:h-[335px] rounded-lg border border-black/10 dark:border-white/10 [transform:translateZ(0)]"
                    >
                      <img 
                        src={item.coverImage || (item.images && item.images[0])} 
                        alt={item.title} 
                        className="w-full h-full object-cover block rounded-lg transition-transform duration-700 ease-out group-hover:scale-110"
                        loading="lazy"
                      />

                      {/* Top Category Badge */}
                      <div className="absolute top-3 left-3 z-20 transition-all duration-400 -translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                        <span className="px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-accent/40 text-accent text-[11px] font-bold uppercase tracking-wider shadow-md">
                          {item.category}
                        </span>
                      </div>

                      {/* Backdrop Overlay with Rich Content */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/10 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-400 flex flex-col justify-end p-4 text-left z-10 rounded-lg">
                        <div className="translate-y-3 group-hover:translate-y-0 transition-transform duration-400 ease-out">
                          <h3 className="font-secondary text-base md:text-lg font-bold text-white mb-1 group-hover:text-accent transition-colors leading-snug">
                            {item.title}
                          </h3>
                          {item.location && (
                            <p className="text-[11px] text-text-secondary flex items-center gap-1.5 mb-2.5 font-medium">
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-accent">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                              </svg>
                              <span>{item.location}</span>
                            </p>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openLightbox(item);
                            }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-accent text-neutral-950 font-bold text-xs shadow-[0_0_15px_rgba(192,155,104,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer border-none"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <circle cx="11" cy="11" r="8"></circle>
                              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                            <span>Xem toàn bộ</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                />
                
                {filteredData.length > 1 && (
                  <div className="mt-2 md:mt-2.5">
                    <Marquee 
                      items={filteredData.length <= 4 ? [...filteredData, ...filteredData].reverse() : filteredData.slice(Math.ceil(filteredData.length / 2)).reverse()}
                      reverse={true}
                      duration="180s"
                      itemClassName="w-[195px] md:w-[220px] lg:w-[245px]"
                      renderItem={(item) => (
                        <div 
                          onClick={() => openLightbox(item)}
                          className="group relative overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-1.5 hover:border-accent/70 hover:shadow-[0_16px_35px_rgba(0,0,0,0.8),0_0_25px_rgba(192,155,104,0.3)] h-[280px] md:h-[335px] rounded-lg border border-black/10 dark:border-white/10 [transform:translateZ(0)]"
                        >
                          <img 
                            src={item.coverImage || (item.images && item.images[0])} 
                            alt={item.title} 
                            className="w-full h-full object-cover block rounded-lg transition-transform duration-700 ease-out group-hover:scale-110"
                            loading="lazy"
                          />

                          {/* Top Category Badge */}
                          <div className="absolute top-3 left-3 z-20 transition-all duration-400 -translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                            <span className="px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-accent/40 text-accent text-[11px] font-bold uppercase tracking-wider shadow-md">
                              {item.category}
                            </span>
                          </div>

                          {/* Backdrop Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/10 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-400 flex flex-col justify-end p-4 text-left z-10 rounded-lg">
                            <div className="translate-y-3 group-hover:translate-y-0 transition-transform duration-400 ease-out">
                              <h3 className="font-secondary text-base md:text-lg font-bold text-white mb-1 group-hover:text-accent transition-colors leading-snug">
                                {item.title}
                              </h3>
                              {item.location && (
                                <p className="text-[11px] text-text-secondary flex items-center gap-1.5 mb-2.5 font-medium">
                                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-accent">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                  </svg>
                                  <span>{item.location}</span>
                                </p>
                              )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openLightbox(item);
                                }}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-accent text-neutral-950 font-bold text-xs shadow-[0_0_15px_rgba(192,155,104,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer border-none"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <circle cx="11" cy="11" r="8"></circle>
                                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                                <span>Xem toàn bộ</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    />
                  </div>
                )}
              </div>
            )}
          
            <div className="text-center mt-14">
              <a href="/showcase" className="inline-flex items-center gap-2 px-8 py-3.5 border border-accent text-accent rounded-full font-semibold text-sm transition-all duration-300 hover:bg-accent hover:text-bg-main shadow-[0_0_15px_rgba(192,155,104,0.2)]">
                <span>Xem toàn bộ tác phẩm</span>
                <span>&rarr;</span>
              </a>
            </div>
          </>
        )}
      </div>

      {/* Lightbox Modal with Keyboard Navigation */}
      {mounted && isLightboxOpen && createPortal(
        <div 
          className="fixed top-0 left-0 w-screen h-screen bg-black/80 backdrop-blur-2xl z-[2000] flex items-center justify-center animate-fade-in select-none" 
          onClick={() => setIsLightboxOpen(false)}
        >
          <button 
            className="absolute top-6 right-8 bg-transparent border-none text-white text-4xl leading-none cursor-pointer z-[2010] transition-colors duration-200 hover:text-accent p-2" 
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Đóng"
          >
            ✕
          </button>
          
          <div className="relative w-full h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
            {currentGallery.length > 1 && (
              <button 
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-accent hover:text-bg-main border border-white/20 text-white text-3xl w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full cursor-pointer z-[2010] transition-all duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.5)]" 
                onClick={prevImage}
                aria-label="Ảnh trước"
              >
                ‹
              </button>
            )}
            
            <img 
              src={currentGallery[currentIndex]} 
              alt="Enlarged view" 
              className="max-w-[92vw] max-h-[88vh] object-contain rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.9)]" 
            />
            
            {currentGallery.length > 1 && (
              <button 
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-accent hover:text-bg-main border border-white/20 text-white text-3xl w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full cursor-pointer z-[2010] transition-all duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.5)]" 
                onClick={nextImage}
                aria-label="Ảnh tiếp"
              >
                ›
              </button>
            )}
            
            {currentGallery.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-5 py-2 rounded-full text-white text-xs sm:text-sm font-medium tracking-[2px] shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-white/10">
                {currentIndex + 1} / {currentGallery.length}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </section>
  );
};

export default PortfolioSection;
