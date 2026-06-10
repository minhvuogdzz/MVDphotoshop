import { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';

const SideBanners = () => {
  const { promo } = useData();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!promo || !promo.desktopEnabled || !promo.images || promo.images.length === 0) return;

    const handleScroll = () => {
      const portfolio = document.getElementById('portfolio');
      const contact = document.getElementById('contact');
      
      if (portfolio && contact) {
        const scrollY = window.scrollY;
        // The point where the top of viewport hits the top of Portfolio minus a buffer
        const startPoint = portfolio.offsetTop - window.innerHeight / 2;
        // The point where the bottom of the banners hit the top of Contact section
        // We stop it when the viewport bottom reaches Contact top
        const endPoint = contact.offsetTop - window.innerHeight + 100;

        if (scrollY > startPoint && scrollY < endPoint) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check immediately on mount

    return () => window.removeEventListener('scroll', handleScroll);
  }, [promo]);

  if (!promo || !promo.desktopEnabled || !promo.images || promo.images.length === 0) {
    return null;
  }

  // To create a seamless infinite scroll, we duplicate the images array
  const duplicatedImages = [...promo.images, ...promo.images, ...promo.images];

  return (
    <>
      {/* Left Banner - Marquee Up */}
      <div 
        className={`fixed top-[88px] left-4 xl:left-8 bottom-0 w-[140px] xl:w-[200px] z-0 hidden lg:block overflow-hidden pointer-events-none transition-opacity duration-1000 ${
          isVisible ? 'opacity-80' : 'opacity-0'
        }`}
      >
        <div className="flex flex-col gap-4 animate-marquee-up py-4">
          {duplicatedImages.map((img, idx) => (
            <img 
              key={`left-${idx}`} 
              src={img} 
              alt="Promo" 
              className="w-full aspect-[4/6] object-cover rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-glass"
            />
          ))}
        </div>
      </div>

      {/* Right Banner - Marquee Down */}
      <div 
        className={`fixed top-[88px] right-4 xl:right-8 bottom-0 w-[140px] xl:w-[200px] z-0 hidden lg:block overflow-hidden pointer-events-none transition-opacity duration-1000 ${
          isVisible ? 'opacity-80' : 'opacity-0'
        }`}
      >
        <div className="flex flex-col gap-4 animate-marquee-down py-4">
          {duplicatedImages.map((img, idx) => (
            <img 
              key={`right-${idx}`} 
              src={img} 
              alt="Promo" 
              className="w-full aspect-[4/6] object-cover rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-glass"
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default SideBanners;
