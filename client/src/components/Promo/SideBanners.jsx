import { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';

const FadeSlide = ({ images, widthClass, isHovered, initialIndex = 0, intervalMs = 4000 }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex % (images?.length || 1));

  useEffect(() => {
    setCurrentIndex(initialIndex % (images?.length || 1));
  }, [initialIndex, images]);

  useEffect(() => {
    if (!images || images.length <= 1 || isHovered) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, intervalMs); 
    
    return () => clearInterval(interval);
  }, [images, isHovered, intervalMs]);

  if (!images || images.length === 0) return null;

  return (
    <div className={`relative ${widthClass} overflow-hidden bg-neutral-900/40 dark:bg-black/40 rounded-xl border border-black/10 dark:border-white/10 hover:border-accent/50 shadow-xl dark:shadow-[0_10px_35px_rgba(0,0,0,0.8)] transition-all duration-500`}>
      {images.map((img, idx) => (
        <img 
          key={idx}
          src={img} 
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
            idx === currentIndex ? 'opacity-100' : 'opacity-0'
          }`} 
          alt="Promo Banner" 
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />
    </div>
  );
};

const SideBanners = () => {
  const { promo } = useData();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isHoveredLeft, setIsHoveredLeft] = useState(false);
  const [isHoveredRight, setIsHoveredRight] = useState(false);

  useEffect(() => {
    if (!promo || !promo.desktopEnabled || !promo.images || promo.images.length === 0 || isDismissed) return;

    const handleScroll = () => {
      const portfolio = document.getElementById('portfolio');
      
      if (portfolio) {
        const portRect = portfolio.getBoundingClientRect();
        // Luôn hiển thị kể từ khi lướt xuống section portfolio xuống dưới
        if (portRect.top < window.innerHeight * 0.85) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      } else {
        setIsVisible(window.scrollY > 300);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); 

    return () => window.removeEventListener('scroll', handleScroll);
  }, [promo, isDismissed]);

  if (!promo || !promo.desktopEnabled || !promo.images || promo.images.length === 0 || isDismissed) {
    return null;
  }

  const halfLen = Math.floor(promo.images.length / 2) || 1;

  return (
    <>
      {/* Left Banner */}
      <div 
        onMouseEnter={() => setIsHoveredLeft(true)}
        onMouseLeave={() => setIsHoveredLeft(false)}
        className={`fixed top-[90px] left-3 xl:left-4 2xl:left-7 z-[25] hidden xl:block group transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6 pointer-events-none'
        }`}
      >
        <button
          onClick={() => setIsDismissed(true)}
          title="Ẩn banner quảng cáo"
          className="absolute -top-2 -right-2 z-30 w-6 h-6 rounded-full bg-black/85 text-white/70 hover:text-white hover:bg-black border border-white/20 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-md cursor-pointer"
        >
          ✕
        </button>
        <FadeSlide 
          images={promo.images} 
          initialIndex={0}
          intervalMs={4200}
          widthClass="w-[190px] xl:w-[215px] 2xl:w-[250px] h-[calc(100vh-125px)]" 
          isHovered={isHoveredLeft} 
        />
      </div>

      {/* Right Banner */}
      <div 
        onMouseEnter={() => setIsHoveredRight(true)}
        onMouseLeave={() => setIsHoveredRight(false)}
        className={`fixed top-[90px] right-3 xl:right-4 2xl:right-7 z-[25] hidden xl:block group transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6 pointer-events-none'
        }`}
      >
        <button
          onClick={() => setIsDismissed(true)}
          title="Ẩn banner quảng cáo"
          className="absolute -top-2 -left-2 z-30 w-6 h-6 rounded-full bg-black/85 text-white/70 hover:text-white hover:bg-black border border-white/20 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-md cursor-pointer"
        >
          ✕
        </button>
        <FadeSlide 
          images={promo.images} 
          initialIndex={halfLen}
          intervalMs={4800}
          widthClass="w-[190px] xl:w-[215px] 2xl:w-[250px] h-[calc(100vh-125px)]" 
          isHovered={isHoveredRight} 
        />
      </div>
    </>
  );
};

export default SideBanners;
