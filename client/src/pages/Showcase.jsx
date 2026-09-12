import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useData } from '../contexts/DataContext';
import CollabSection from '../components/CollabSection/CollabSection';

const Showcase = () => {
  const { portfolio, comparisons } = useData();
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentGallery, setCurrentGallery] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
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
    const gallery = (item.images && item.images.length > 0) ? item.images : [item.coverImage];
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

      {/* Collab Section - Dành cho nhà tuyển dụng & Studio (Chuyển từ trang chủ vào đây theo yêu cầu) */}
      <div className="mb-16">
        <CollabSection />
      </div>

      {/* Projects Gallery */}
      <div className="container-custom">
        <div className="text-center mb-8 border-t border-glass pt-16">
          <span className="text-xs uppercase tracking-widest text-accent font-bold">Showcase Dự Án</span>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary font-secondary mt-1">
            Bộ Sưu Tập Tác Phẩm Hậu Kỳ
          </h2>
        </div>

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

        {/* Grid Photos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredData.map(item => (
            <div
              key={item._id}
              onClick={() => openLightbox(item)}
              className="group relative rounded-2xl overflow-hidden cursor-pointer bg-black/40 border border-black/10 dark:border-white/5 aspect-[4/5] hover:-translate-y-1.5 hover:border-accent/40 transition-all duration-300 shadow-lg"
            >
              <img
                src={item.coverImage || (item.images && item.images[0])}
                alt={item.title}
                className="w-full h-full object-cover block transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-5">
                <h3 className="font-secondary text-lg text-white font-bold mb-1">{item.title}</h3>
                <p className="text-xs text-accent font-semibold tracking-wider uppercase mb-3">{item.category} • {item.location}</p>
                <span className="inline-flex items-center gap-1.5 text-xs text-white/80 font-medium">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  Phóng to bộ ảnh
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && createPortal(
        <div
          className="fixed top-0 left-0 w-screen h-screen bg-black/85 backdrop-blur-2xl z-[2000] flex items-center justify-center animate-fade-in select-none"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            className="absolute top-6 right-8 bg-transparent border-none text-white text-4xl leading-none cursor-pointer z-[2010] hover:text-accent p-2"
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
