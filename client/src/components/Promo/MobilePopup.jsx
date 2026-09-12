import { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';

const MobilePopup = () => {
  const { promo } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    // Check if dismissed in this session
    const isDismissed = sessionStorage.getItem('mvd_mobile_promo_dismissed');
    if (isDismissed) return;

    // Only show on mobile screens (< 768px) and when mobileEnabled with images
    const checkMobile = () => {
      const isMobileScreen = window.innerWidth < 768;
      if (isMobileScreen && promo?.mobileEnabled && promo?.images?.length > 0) {
        // Small delay to let initial page render smoothly before popup pops up
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    };

    checkMobile();
  }, [promo]);

  const handleClose = () => {
    setIsOpen(false);
    try {
      sessionStorage.setItem('mvd_mobile_promo_dismissed', 'true');
    } catch (e) {
      // ignore
    }
  };

  if (!isOpen || !promo?.mobileEnabled || !promo?.images || promo.images.length === 0) {
    return null;
  }

  const images = promo.images;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in md:hidden">
      <div className="relative w-full max-w-[340px] bg-white/95 dark:bg-[#1a1715]/95 rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 shadow-2xl dark:shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(192,155,104,0.25)] flex flex-col transform transition-all duration-300 scale-100">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-black/5 dark:border-white/5 bg-neutral-100/70 dark:bg-black/40">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
            <span className="text-xs font-bold uppercase tracking-widest text-accent">Ưu Đãi Đặc Biệt</span>
          </div>
          <button
            onClick={handleClose}
            aria-label="Đóng popup"
            className="w-7 h-7 rounded-full bg-black/5 dark:bg-white/10 text-text-primary hover:bg-black/10 dark:hover:bg-white/20 flex items-center justify-center transition-colors text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Promo Image Showcase */}
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-black select-none">
          <img
            src={images[currentIdx]}
            alt="Khuyến mại"
            className="w-full h-full object-cover transition-opacity duration-500"
          />

          {/* Dots Indicator if multiple images */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIdx(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentIdx ? 'w-5 bg-accent' : 'bg-white/40'
                  }`}
                  aria-label={`Ảnh ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-4 bg-neutral-100/70 dark:bg-black/40 border-t border-black/5 dark:border-white/5 flex flex-col gap-2.5">
          <a
            href="#contact"
            onClick={handleClose}
            className="w-full py-2.5 px-4 bg-accent hover:bg-accent-hover text-neutral-950 font-bold text-center text-sm rounded-xl transition-all shadow-[0_0_15px_rgba(192,155,104,0.4)]"
          >
            Nhận Ưu Đãi Ngay
          </a>
          <button
            onClick={handleClose}
            className="w-full py-1.5 text-xs text-text-secondary hover:text-text-primary text-center transition-colors cursor-pointer"
          >
            Bỏ qua để xem portfolio
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobilePopup;
