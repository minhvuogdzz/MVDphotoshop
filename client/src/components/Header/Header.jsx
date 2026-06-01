import { useState, useEffect } from 'react';
import Chatbot from '../Chatbot/Chatbot';
import { useLocation } from 'react-router-dom';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Portfolio', href: '#portfolio' },
    { name: 'Dịch vụ', href: '#services' },
    { name: 'Về chúng tôi', href: '#about' },
    { name: 'Liên hệ', href: '#contact' },
  ];

  const handleNavClick = (href) => {
    setIsMobileMenuOpen(false);
    if (!isHomePage) {
      window.location.href = `/${href}`;
    }
  };

  return (
    <>
      <header className={`fixed top-0 left-0 w-full z-[100] transition-all duration-400 ease-in-out ${scrolled ? 'py-4 bg-bg-glass backdrop-blur-md border-b border-glass' : 'py-6 bg-transparent'}`}>
        <div className="container-custom flex justify-between items-center">
          <a href="/" className="font-secondary text-2xl font-bold tracking-wide">
            MVD<span className="font-normal italic text-accent ml-2">Photoshop</span>
          </a>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-8">
            {navLinks.map((link, idx) => (
              <a 
                key={idx} 
                href={isHomePage ? link.href : `/${link.href}`}
                onClick={() => handleNavClick(link.href)}
                className="text-text-secondary hover:text-accent font-medium transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          <div className="flex gap-4 items-center">
            <button 
              className={`text-text-primary w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 hover:text-accent ${isChatOpen ? 'bg-white/10 text-accent' : ''}`}
              aria-label="Support"
              onClick={() => setIsChatOpen(!isChatOpen)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
            </button>

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden text-text-primary w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Sidebar */}
        <div className={`fixed top-0 right-0 h-screen w-[280px] bg-[#1a1715] border-l border-glass shadow-2xl transform transition-transform duration-300 ease-in-out z-[200] ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-6 flex justify-end">
            <button className="text-text-secondary hover:text-accent" onClick={() => setIsMobileMenuOpen(false)}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <nav className="flex flex-col gap-6 px-8 pt-4">
            {navLinks.map((link, idx) => (
              <a 
                key={idx} 
                href={isHomePage ? link.href : `/${link.href}`}
                onClick={() => handleNavClick(link.href)}
                className="text-xl text-text-primary font-secondary hover:text-accent transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>
        </div>
        
        {/* Mobile overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </header>

      {isChatOpen && <Chatbot onClose={() => setIsChatOpen(false)} />}
    </>
  );
};

export default Header;
