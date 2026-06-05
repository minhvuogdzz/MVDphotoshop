import { useState, useEffect, useRef } from 'react';
import Chatbot from '../Chatbot/Chatbot';

const FloatingSocials = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatPeeking, setIsChatPeeking] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const peekTimeoutRef = useRef(null);
  const chatBtnRef = useRef(null);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Hide when footer visible
  useEffect(() => {
    const checkFooterIntersection = () => {
      const footer = document.querySelector('footer');
      if (!footer) return;
      const footerRect = footer.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      setIsVisible(footerRect.top > windowHeight);
    };

    window.addEventListener('scroll', checkFooterIntersection);
    checkFooterIntersection();
    return () => window.removeEventListener('scroll', checkFooterIntersection);
  }, []);

  // Desktop: macOS dock hover peek effect
  const handleChatHover = () => {
    if (isMobile || isChatOpen) return;
    clearTimeout(peekTimeoutRef.current);
    setIsChatPeeking(true);
  };

  const handleChatLeave = () => {
    if (isMobile || isChatOpen) return;
    peekTimeoutRef.current = setTimeout(() => {
      setIsChatPeeking(false);
    }, 300);
  };

  const handleChatClick = () => {
    clearTimeout(peekTimeoutRef.current);
    setIsChatPeeking(false);
    setIsChatOpen(!isChatOpen);
  };

  const handleChatClose = () => {
    setIsChatOpen(false);
    setIsChatPeeking(false);
  };

  // Prevent chatbot panel from causing page zoom and handle mobile keyboard
  useEffect(() => {
    if (isChatOpen && isMobile) {
      // Lock body scroll naturally
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      // Prevent pinch-zoom
      const meta = document.querySelector('meta[name="viewport"]');
      const oldContent = meta?.getAttribute('content');
      if (meta) {
        meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
      }

      // Handle visual viewport to keep header fixed when keyboard opens on iOS
      const handleViewportChange = () => {
        const overlay = document.querySelector('.chatbot-mobile-overlay');
        if (overlay && window.visualViewport) {
          // Counter-pan the fixed overlay so it stays exactly inside the visual screen
          overlay.style.top = `${window.visualViewport.offsetTop}px`;
          overlay.style.height = `${window.visualViewport.height}px`;
          overlay.style.bottom = 'auto'; // Prevent conflict with CSS inset:0
        }
      };

      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', handleViewportChange);
        window.visualViewport.addEventListener('scroll', handleViewportChange);
        // Small delay to ensure DOM is ready and keyboard is fully calculated
        setTimeout(handleViewportChange, 100);
      }

      return () => {
        document.body.style.overflow = originalOverflow;
        
        if (meta && oldContent) {
          meta.setAttribute('content', oldContent);
        }
        
        if (window.visualViewport) {
          window.visualViewport.removeEventListener('resize', handleViewportChange);
          window.visualViewport.removeEventListener('scroll', handleViewportChange);
        }
      };
    }
  }, [isChatOpen, isMobile]);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
        {/* Chatbot peek preview (desktop only) */}
        {!isMobile && isChatPeeking && !isChatOpen && (
          <div
            className="chatbot-peek-container pointer-events-auto"
            onMouseEnter={handleChatHover}
            onMouseLeave={handleChatLeave}
          >
            <div className="chatbot-peek-bubble">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-[10px] font-bold" style={{color: 'var(--bg-main)'}}>
                  MVD
                </div>
                <span className="font-bold text-accent text-xs">MVD Assistant</span>
                <span className="flex items-center gap-1 text-[10px] text-text-secondary ml-auto">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
                  Online
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Chào bạn! 👋 Mình có thể giúp gì cho bạn hôm nay?
              </p>
              <p className="text-[10px] text-text-secondary/60 mt-2 text-center italic">
                Click để bắt đầu trò chuyện
              </p>
            </div>
          </div>
        )}

        {/* Chatbot FAB & Window Wrapper - moves smoothly when social links collapse */}
        <div className="relative flex items-center justify-end w-full pointer-events-none">
          {/* Desktop chat window positioned relative to viewport so it stays consistently at 4rem bottom */}
          {!isMobile && isChatOpen && (
            <div className="fixed right-[100px] bottom-16 pointer-events-auto z-40">
              <div className="chatbot-wormhole-window">
                <Chatbot onClose={handleChatClose} />
              </div>
            </div>
          )}

          {/* Chatbot FAB button - ALWAYS VISIBLE */}
          <button
            ref={chatBtnRef}
            onClick={handleChatClick}
            onMouseEnter={handleChatHover}
            onMouseLeave={handleChatLeave}
            className={`chatbot-fab-btn pointer-events-auto relative z-50 ${isChatOpen ? 'chatbot-fab-active' : ''}`}
            aria-label="Chatbot AI"
            title="Chat với MVD Assistant"
          >
            <div className="chatbot-fab-inner">
              {isChatOpen ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
              )}
            </div>
            {/* Ping animation when not open */}
            {!isChatOpen && (
              <span className="chatbot-fab-ping"></span>
            )}
          </button>
        </div>

        {/* Social buttons - HIDES ON FOOTER, COLLAPSES HEIGHT */}
        <div 
          className={`flex flex-col items-end gap-3 transition-all duration-500 overflow-hidden ${
            isVisible ? 'opacity-100 max-h-[250px] mt-0 pointer-events-auto' : 'opacity-0 max-h-0 mt-[-12px] pointer-events-none'
          }`}
        >
          <div className="flex flex-col gap-3 pb-1 pt-1">
            <a href="https://m.me/minhvuog.dev" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-bg-glass backdrop-blur-md border border-glass flex items-center justify-center text-text-secondary transition-all duration-300 hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] shadow-[0_4px_15px_rgba(0,0,0,0.3)] hover:shadow-[0_0_15px_rgba(24,119,242,0.5)]" aria-label="Facebook">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
            </a>
            <a href="https://ig.me/m/_http.vuoqdev" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-bg-glass backdrop-blur-md border border-glass flex items-center justify-center text-text-secondary transition-all duration-300 hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:text-white hover:border-transparent shadow-[0_4px_15px_rgba(0,0,0,0.3)] hover:shadow-[0_0_15px_rgba(220,39,67,0.5)]" aria-label="Instagram">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
            </a>
            <a href="https://zalo.me/0869528304" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-bg-glass backdrop-blur-md border border-glass flex items-center justify-center text-text-secondary transition-all duration-300 hover:bg-[#0068FF] hover:text-white hover:border-[#0068FF] shadow-[0_4px_15px_rgba(0,0,0,0.3)] hover:shadow-[0_0_15px_rgba(0,104,255,0.5)] font-bold text-sm" aria-label="Zalo">
              Zalo
            </a>
          </div>
        </div>
      </div>

      {/* Mobile: fullscreen chat overlay */}
      {isMobile && isChatOpen && (
        <div className="chatbot-mobile-overlay">
          <Chatbot onClose={handleChatClose} isMobile={true} />
        </div>
      )}
    </>
  );
};

export default FloatingSocials;

