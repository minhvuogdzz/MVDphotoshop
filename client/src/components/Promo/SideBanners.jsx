import { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';

const FadeSlide = ({ images, widthClass }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000); 
    
    return () => clearInterval(interval);
  }, [images]);

  if (!images || images.length === 0) return null;

  return (
    <div className={`relative ${widthClass} aspect-[1/3] overflow-hidden bg-black shadow-[0_0_20px_rgba(0,0,0,0.6)]`}>
      {images.map((img, idx) => (
        <img 
          key={idx}
          src={img} 
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
            idx === currentIndex ? 'opacity-100' : 'opacity-0'
          }`} 
          alt="Promo" 
        />
      ))}
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
        className={`fixed top-[120px] left-4 xl:left-8 z-[5] hidden lg:block pointer-events-none transition-opacity duration-1000 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <FadeSlide images={promo.images} widthClass="w-[160px] xl:w-[220px]" />
      </div>

      <div 
        className={`fixed top-[120px] right-4 xl:right-8 z-[5] hidden lg:block pointer-events-none transition-opacity duration-1000 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Pass a reversed array so the right side shows different sequence if desired, or same array */}
        <FadeSlide images={[...promo.images].reverse()} widthClass="w-[160px] xl:w-[220px]" />
      </div>
    </>
  );
};

export default SideBanners;
