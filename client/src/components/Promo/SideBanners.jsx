import { useState, useEffect, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';

const ShatterSlide = ({ images, widthClass }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shatterState, setShatterState] = useState('idle'); // 'idle' | 'preparing' | 'shattering'
  
  const rows = 15;
  const cols = 5;
  
  const tileConfig = useMemo(() => {
    const config = [];
    for (let i = 0; i < rows * cols; i++) {
      config.push({
        delay: Math.random() * 0.4,
        tx: (Math.random() - 0.5) * 80, // translate X
        ty: (Math.random() - 0.5) * 80, // translate Y
        rot: (Math.random() - 0.5) * 60   // rotate
      });
    }
    return config;
  }, []);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    
    const interval = setInterval(() => {
      setShatterState('preparing');
      
      // Allow DOM to render the tiles before animating
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setShatterState('shattering');
        });
      });
      
      // Reset state after transition completes
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setShatterState('idle');
      }, 1200);
      
    }, 3000); 
    
    return () => clearInterval(interval);
  }, [images]);

  if (!images || images.length === 0) return null;

  const currentImage = images[currentIndex];
  const nextImage = images[(currentIndex + 1) % images.length];

  return (
    <div className={`relative ${widthClass} aspect-[1/3] overflow-hidden bg-black shadow-[0_0_20px_rgba(0,0,0,0.6)]`}>
      {/* Background (Next Image) */}
      {images.length > 1 && (
        <img src={nextImage} className="absolute inset-0 w-full h-full object-cover" alt="Next Promo" />
      )}
      
      {/* Foreground (Current Image) */}
      {shatterState === 'idle' ? (
        <img src={currentImage} className="absolute inset-0 w-full h-full object-cover" alt="Current Promo" />
      ) : (
        <div className="absolute inset-0 w-full h-full flex flex-wrap">
          {tileConfig.map((conf, i) => {
            const row = Math.floor(i / cols);
            const col = i % cols;
            const bgPosX = cols > 1 ? (col / (cols - 1)) * 100 : 0;
            const bgPosY = rows > 1 ? (row / (rows - 1)) * 100 : 0;
            const isShattering = shatterState === 'shattering';
            
            return (
              <div 
                key={i}
                style={{
                  width: `${100 / cols}%`,
                  height: `${100 / rows}%`,
                  backgroundImage: `url(${currentImage})`,
                  backgroundSize: `${cols * 100}% ${rows * 100}%`,
                  backgroundPosition: `${bgPosX}% ${bgPosY}%`,
                  transition: `all 0.6s cubic-bezier(0.25, 1, 0.5, 1) ${conf.delay}s`,
                  opacity: isShattering ? 0 : 1,
                  transform: isShattering 
                    ? `scale(0.2) translate(${conf.tx}px, ${conf.ty}px) rotate(${conf.rot}deg)` 
                    : 'scale(1) translate(0px, 0px) rotate(0deg)'
                }}
                className="will-change-transform origin-center"
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

const SideBanners = () => {
  const { promo } = useData();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!promo || !promo.desktopEnabled || !promo.images || promo.images.length === 0) return;

    const handleScroll = () => {
      const portfolio = document.getElementById('portfolio');
      const contact = document.getElementById('contact');
      
      if (portfolio && contact) {
        const portRect = portfolio.getBoundingClientRect();
        const contactRect = contact.getBoundingClientRect();
        
        if (portRect.top < window.innerHeight * 0.8 && contactRect.top > window.innerHeight * 0.2) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); 

    return () => window.removeEventListener('scroll', handleScroll);
  }, [promo]);

  if (!promo || !promo.desktopEnabled || !promo.images || promo.images.length === 0) {
    return null;
  }

  // We set z-index to 5 so it is above background but below the navigation (z-50)
  return (
    <>
      <div 
        className={`fixed top-[120px] left-4 xl:left-8 z-[5] hidden lg:block pointer-events-auto transition-opacity duration-1000 ${
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <ShatterSlide images={promo.images} widthClass="w-[160px] xl:w-[220px]" />
      </div>

      <div 
        className={`fixed top-[120px] right-4 xl:right-8 z-[5] hidden lg:block pointer-events-auto transition-opacity duration-1000 ${
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Pass a reversed array so the right side shows different sequence if desired, or same array */}
        <ShatterSlide images={[...promo.images].reverse()} widthClass="w-[160px] xl:w-[220px]" />
      </div>
    </>
  );
};

export default SideBanners;
