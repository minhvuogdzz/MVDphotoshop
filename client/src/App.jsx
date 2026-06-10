import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useData } from './contexts/DataContext';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Projects from './pages/Projects';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import SideBanners from './components/Promo/SideBanners';
import MobilePopup from './components/Promo/MobilePopup';

function App() {
  const { hero } = useData();
  const audioRef = useRef(null);
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  const audioSrc = hero?.backgroundMusic || "/nhac.mp3";

  useEffect(() => {
    const playAudio = async () => {
      // Do not attempt to play audio on admin route
      if (isAdmin) return;
      try {
        if (audioRef.current) {
          audioRef.current.volume = 0.3; // Reduce volume
          // Attempt to play immediately
          await audioRef.current.play();
        }
      } catch (error) {
        console.log("Autoplay blocked by browser. Will play on first interaction.", error);
        
        const validInteractions = ['click', 'touchstart', 'keydown', 'mousedown'];
        
        const playOnInteract = async () => {
          try {
            if (audioRef.current) {
              audioRef.current.volume = 0.3; // Reduce volume
              await audioRef.current.play();
              // If successful, remove all listeners
              validInteractions.forEach(evt => 
                window.removeEventListener(evt, playOnInteract)
              );
            }
          } catch (err) {
            // Still blocked (maybe invalid interaction), keep waiting
            console.log("Still waiting for valid user interaction...");
          }
        };

        validInteractions.forEach(evt => 
          window.addEventListener(evt, playOnInteract, { once: false })
        );
      }
    };
    
    // Slight delay to allow audio source to load if it changed
    const timer = setTimeout(() => {
      playAudio();
    }, 500);

    return () => clearTimeout(timer);
  }, [audioSrc]);

  return (
    <>
      {!isAdmin && <audio ref={audioRef} src={audioSrc} loop preload="metadata" />}
      {!isAdmin && <SideBanners />}
      {!isAdmin && <MobilePopup />}
      {!isAdmin && <Header />}
      
      <main className={isAdmin ? 'bg-bg-main min-h-screen' : ''}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/projects" element={<Projects />} />
        </Routes>
      </main>
      
      {!isAdmin && <Footer />}
    </>
  );
}

export default App;
