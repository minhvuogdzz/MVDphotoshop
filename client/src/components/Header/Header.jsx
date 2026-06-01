import { useState, useEffect } from 'react';
import Chatbot from '../Chatbot/Chatbot';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 w-full z-[100] transition-all duration-400 ease-in-out ${scrolled ? 'py-4 bg-bg-glass backdrop-blur-md border-b border-glass' : 'py-6 bg-transparent'}`}>
      <div className="container-custom flex justify-between items-center">
        <a href="/" className="font-secondary text-2xl font-bold tracking-wide">
          MVD<span className="font-normal italic text-accent ml-2">Photoshop</span>
        </a>
        
        <div className="flex gap-4">
          <button 
            className={`text-text-primary w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 hover:text-accent ${isChatOpen ? 'bg-white/10 text-accent' : ''}`}
            aria-label="Support"
            onClick={() => setIsChatOpen(!isChatOpen)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
          </button>
        </div>
      </div>
      
      {isChatOpen && <Chatbot onClose={() => setIsChatOpen(false)} />}
    </header>
  );
};

export default Header;
