import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { useData } from '../../contexts/DataContext';
import LoadingSpinner from '../common/LoadingSpinner';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const PortfolioSection = () => {
  const { portfolio, loading } = useData();
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [mounted, setMounted] = useState(false);
  
  // Lightbox states
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentGallery, setCurrentGallery] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    <section id="portfolio" className="py-[100px] bg-bg-main">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-[40px] mb-4 text-accent">Portfolio</h2>
          <p className="text-text-secondary max-w-[600px] mx-auto">Khám phá những dự án nổi bật được thực hiện bằng tâm huyết.</p>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="flex justify-center flex-wrap gap-4 mb-12">
          {categories.map(cat => (
            <button
              key={cat}
              className={`px-6 py-2 rounded-full border text-sm font-medium transition-all duration-200 ${
                activeTab === cat 
                  ? 'bg-accent text-bg-main border-accent' 
                  : 'border-white/10 text-text-secondary hover:border-accent hover:text-text-primary'
              }`}
              onClick={() => setActiveTab(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative px-2 sm:px-12">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            navigation
            pagination={{ type: 'progressbar' }}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            spaceBetween={24}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 }
            }}
            className="nav-swiper"
          >
            {filteredData.map(item => (
              <SwiperSlide key={item._id}>
                <div className="group relative overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.05] hover:shadow-[0_0_30px_rgba(192,155,104,0.3),0_0_60px_rgba(192,155,104,0.1)]">
                  <img 
                    src={item.coverImage || (item.images && item.images[0])} 
                    alt={item.title} 
                    className="w-full aspect-[4/6] object-cover block"
                    loading="lazy"
                  />
                  <div className="absolute top-0 left-0 w-full h-full bg-black/60 backdrop-blur-sm opacity-0 transition-all duration-400 flex flex-col justify-center items-center p-6 text-center group-hover:opacity-100">
                    <div className="translate-y-5 transition-transform duration-400 group-hover:translate-y-0">
                      <h3 className="font-secondary text-2xl mb-2">{item.title}</h3>
                      <p className="text-sm text-accent tracking-widest uppercase">{item.category} • {item.location}</p>
                    </div>
                    <button 
                      className="mt-6 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center translate-y-5 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 hover:!bg-accent hover:!text-bg-main"
                      onClick={() => openLightbox(item)}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                    </button>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        
        <div className="text-center mt-10">
          <a href="/projects" className="inline-block px-8 py-3 border border-accent text-accent rounded-full font-medium transition-all duration-200 hover:bg-accent hover:text-bg-main">Xem toàn bộ dự án</a>
        </div>
          </>
        )}
      </div>

      {/* Lightbox Modal */}
      {mounted && isLightboxOpen && createPortal(
        <div 
          className="fixed top-0 left-0 w-screen h-screen bg-black/60 backdrop-blur-2xl z-[2000] flex items-center justify-center animate-fade-in" 
          onClick={() => setIsLightboxOpen(false)}
        >
          <button 
            className="absolute top-6 right-8 bg-transparent border-none text-white text-5xl leading-none cursor-pointer z-[2010] transition-colors duration-200 hover:text-accent" 
            onClick={() => setIsLightboxOpen(false)}
          >
            ×
          </button>
          
          <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {currentGallery.length > 1 && (
              <button 
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-white/10 border border-white/20 text-white text-4xl w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-full cursor-pointer z-[2010] transition-all duration-200 hover:bg-accent hover:text-bg-main shadow-[0_4px_20px_rgba(0,0,0,0.5)]" 
                onClick={prevImage}
              >
                ‹
              </button>
            )}
            
            <img src={currentGallery[currentIndex]} alt="Enlarged view" className="max-w-[95vw] max-h-[90vh] object-contain rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.8)]" />
            
            {currentGallery.length > 1 && (
              <button 
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-white/10 border border-white/20 text-white text-4xl w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-full cursor-pointer z-[2010] transition-all duration-200 hover:bg-accent hover:text-bg-main shadow-[0_4px_20px_rgba(0,0,0,0.5)]" 
                onClick={nextImage}
              >
                ›
              </button>
            )}
            
            {currentGallery.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md px-6 py-2 rounded-full text-white font-medium tracking-[2px] shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
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
