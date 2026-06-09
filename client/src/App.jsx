import { Routes, Route } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Projects from './pages/Projects';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';

function App() {
  const audioRef = useRef(null);

  useEffect(() => {
    const playAudio = async () => {
      try {
        if (audioRef.current) {
          // Attempt to play immediately
          await audioRef.current.play();
        }
      } catch (error) {
        console.log("Autoplay blocked by browser. Will play on first interaction.", error);
        
        const validInteractions = ['click', 'touchstart', 'keydown', 'mousedown'];
        
        const playOnInteract = async () => {
          try {
            if (audioRef.current) {
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
    
    playAudio();
  }, []);

  return (
    <>
      <audio ref={audioRef} src="/nhac.mp3" autoPlay loop preload="auto" />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/projects" element={<Projects />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;
