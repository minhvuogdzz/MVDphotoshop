import { useState, useEffect } from 'react';

const FloatingSocials = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const checkFooterIntersection = () => {
      const footer = document.querySelector('footer');
      if (!footer) return;
      
      const footerRect = footer.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // If the top of the footer is above the bottom of the window (meaning footer is visible)
      if (footerRect.top <= windowHeight) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', checkFooterIntersection);
    checkFooterIntersection(); // Initial check
    
    return () => window.removeEventListener('scroll', checkFooterIntersection);
  }, []);

  return (
    <div 
      className={`fixed bottom-6 right-6 z-50 flex flex-col gap-3 transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-10 pointer-events-none'
      }`}
    >
      <a href="https://m.me/minhvuog.dev" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-bg-secondary border border-glass flex items-center justify-center text-text-secondary transition-all duration-300 hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] shadow-[0_4px_15px_rgba(0,0,0,0.3)] hover:shadow-[0_0_15px_rgba(24,119,242,0.5)]" aria-label="Facebook">
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
      </a>
      <a href="https://ig.me/m/_http.vuoqdev" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-bg-secondary border border-glass flex items-center justify-center text-text-secondary transition-all duration-300 hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:text-white hover:border-transparent shadow-[0_4px_15px_rgba(0,0,0,0.3)] hover:shadow-[0_0_15px_rgba(220,39,67,0.5)]" aria-label="Instagram">
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
      </a>
      <a href="https://zalo.me/0869529304" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-bg-secondary border border-glass flex items-center justify-center text-text-secondary transition-all duration-300 hover:bg-[#0068FF] hover:text-white hover:border-[#0068FF] shadow-[0_4px_15px_rgba(0,0,0,0.3)] hover:shadow-[0_0_15px_rgba(0,104,255,0.5)] font-bold text-sm" aria-label="Zalo">
        Zalo
      </a>
    </div>
  );
};

export default FloatingSocials;
