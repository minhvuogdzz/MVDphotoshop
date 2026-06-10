import { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';

const MobilePopup = () => {
  const { promo } = useData();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if promo is available, enabled for mobile, and has images
    if (promo && promo.mobileEnabled && promo.images && promo.images.length > 0) {
      // Check if user already closed it in this session
      const hasClosed = sessionStorage.getItem('promo_closed');
      if (!hasClosed) {
        // Add a slight delay before showing the popup so it's not jarring
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [promo]);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem('promo_closed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 lg:hidden px-4 animate-fade-in">
      <div className="relative w-full max-w-[400px]">
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute -top-4 -right-4 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center border-2 border-white/20 z-10 hover:bg-accent transition-colors"
        >
          ✕
        </button>
        
        {/* Ad Image */}
        <div className="rounded-xl overflow-hidden shadow-[0_0_40px_rgba(192,155,104,0.3)] border border-glass">
          <img 
            src={promo.images[0]} 
            alt="Promotion" 
            className="w-full h-auto aspect-[4/6] object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default MobilePopup;
