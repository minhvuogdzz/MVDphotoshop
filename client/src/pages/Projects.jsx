import { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';

const Projects = () => {
  const { pageSettings } = useData();
  const page = pageSettings?.showcase || {};
  const [portfolios, setPortfolios] = useState([]);
  const [activeTab, setActiveTab] = useState('Tất cả');
  
  // Lightbox states
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentGallery, setCurrentGallery] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Scroll to top when mounting
    window.scrollTo(0, 0);
    
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

  const displayData = portfolios || [];
  const categories = ['Tất cả', ...new Set(displayData.map(item => item.category).filter(Boolean))];
  
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
    <div className="pt-[120px] pb-[100px] bg-bg-main min-h-screen">
      <div className="container-custom">
        {/* Breadcrumb / Title */}
        <div className="text-center mb-12">
          <Link to="/" className="text-accent hover:underline mb-4 inline-block text-sm">&larr; Trở về Trang chủ</Link>
          <div className="block">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-widest mb-4">
              {page.badge || 'Tác Phẩm & Dự Án'}
            </span>
          </div>
          <h1 className="text-[36px] md:text-[50px] mb-4 text-text-primary font-secondary">
            {page.title || 'Toàn bộ Dự án'}
          </h1>
          <p className="text-text-secondary max-w-[600px] mx-auto text-sm md:text-base leading-relaxed whitespace-pre-line">
            {page.description || 'Tất cả những dự án, những khoảnh khắc nghệ thuật được thực hiện tỉ mỉ và tâm huyết nhất.'}
          </p>
        </div>

        {/* Filter Categories */}
        <div className="flex justify-center flex-wrap gap-4 mb-12">
          {categories.map(cat => (
            <button
              key={cat}
              className={`px-6 py-2 rounded-full border text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeTab === cat 
                  ? 'bg-accent text-neutral-950 font-bold border-accent shadow-md' 
                  : 'border-black/10 dark:border-white/10 text-text-secondary hover:border-accent hover:text-text-primary'
              }`}
              onClick={() => setActiveTab(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid Layout (Not Slider) */}
        {filteredData.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredData.map(item => (
              <div key={item._id} className="group relative rounded-lg overflow-hidden cursor-pointer bg-bg-glass border border-glass shadow-md">
                <img 
                  src={item.coverImage || (item.images && item.images[0])} 
                  alt={item.title} 
                  className="w-full aspect-[4/6] object-cover block transition-transform duration-400 group-hover:scale-105" 
                />
                <div className="absolute top-0 left-0 w-full h-full bg-black/70 backdrop-blur-sm opacity-0 transition-all duration-400 flex flex-col justify-center items-center p-6 text-center group-hover:opacity-100">
                  <div className="translate-y-5 transition-transform duration-400 group-hover:translate-y-0">
                    <h3 className="font-secondary text-2xl mb-2 text-white">{item.title}</h3>
                    <p className="text-sm text-accent tracking-widest uppercase">{item.category} • {item.location}</p>
                  </div>
                  <button 
                    className="mt-6 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center translate-y-5 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 hover:!bg-accent hover:!text-neutral-950" 
                    onClick={() => openLightbox(item)}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="2" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 glass-panel border border-black/10 dark:border-white/5 rounded-2xl max-w-lg mx-auto">
            <div className="text-4xl mb-3">🖼️</div>
            <h3 className="text-lg font-medium text-text-primary mb-1">Chưa có dự án nào</h3>
            <p className="text-sm text-text-secondary">Dự án được cấu hình và quản lý từ trang Quản trị (Admin).</p>
          </div>
        )}
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
    </div>
  );
};

export default Projects;
