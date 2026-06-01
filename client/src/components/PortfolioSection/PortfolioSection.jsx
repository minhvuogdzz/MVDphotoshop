import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import api from '../../services/api';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const PortfolioSection = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [activeTab, setActiveTab] = useState('Tất cả');
  
  // Lightbox states
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentGallery, setCurrentGallery] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const { data } = await api.get('/portfolio');
        setPortfolios(data);
      } catch (err) {
        console.error('Failed to fetch portfolios', err);
      }
    };
    fetchPortfolios();
  }, []);

  // Dummy data if API is empty
  const defaultData = [
    { _id: 1, title: 'Summer Vibe', category: 'Beauty', location: 'Studio', coverImage: 'https://images.unsplash.com/photo-1512413914619-14a87a6078ac?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1512413914619-14a87a6078ac?w=1200', 'https://images.unsplash.com/photo-1524504280099-c1249bbd25f1?w=1200'] },
    { _id: 2, title: 'Nàng thơ Mộc Châu', category: 'Concept nàng thơ', location: 'Mộc Châu', coverImage: 'https://images.unsplash.com/photo-1524504280099-c1249bbd25f1?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1524504280099-c1249bbd25f1?w=1200'] },
    { _id: 3, title: 'Sweet Love', category: 'Couple / Gia đình', location: 'Đà Lạt', coverImage: 'https://images.unsplash.com/photo-1518193855018-05fc08595cb6?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1518193855018-05fc08595cb6?w=1200'] },
    { _id: 4, title: 'Retro Chic', category: 'Beauty', location: 'Hà Nội', coverImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200'] },
    { _id: 5, title: 'Mùa thu', category: 'Concept nàng thơ', location: 'Hà Nội', coverImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1200'] },
  ];

  const displayData = portfolios.length > 0 ? portfolios : defaultData;
  const categories = ['Tất cả', ...new Set(displayData.map(item => item.category))];
  
  const filteredData = activeTab === 'Tất cả' 
    ? displayData 
    : displayData.filter(item => item.category === activeTab);

  const openLightbox = (item) => {
    // If no images inside, just show the cover image
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
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            spaceBetween={24}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 }
            }}
            className="pb-16 nav-swiper"
          >
            {filteredData.map(item => (
              <SwiperSlide key={item._id}>
                <div className="group relative rounded-lg overflow-hidden cursor-pointer">
                  <img 
                    src={item.coverImage || (item.images && item.images[0])} 
                    alt={item.title} 
                    className="w-full aspect-[4/6] object-cover block transition-transform duration-400 group-hover:scale-105" 
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
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div 
          className="fixed top-0 left-0 w-screen h-screen bg-black/95 z-[2000] flex items-center justify-center backdrop-blur-sm animate-[fadeIn_0.3s_ease]" 
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
                className="absolute left-8 top-1/2 -translate-y-1/2 bg-white/10 border-none text-white text-4xl w-16 h-16 flex items-center justify-center rounded-full cursor-pointer z-[2010] transition-all duration-200 hover:bg-accent hover:text-bg-main" 
                onClick={prevImage}
              >
                ‹
              </button>
            )}
            
            <img src={currentGallery[currentIndex]} alt="Enlarged view" className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.5)]" />
            
            {currentGallery.length > 1 && (
              <button 
                className="absolute right-8 top-1/2 -translate-y-1/2 bg-white/10 border-none text-white text-4xl w-16 h-16 flex items-center justify-center rounded-full cursor-pointer z-[2010] transition-all duration-200 hover:bg-accent hover:text-bg-main" 
                onClick={nextImage}
              >
                ›
              </button>
            )}
            
            {currentGallery.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-base tracking-[2px]">
                {currentIndex + 1} / {currentGallery.length}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default PortfolioSection;
