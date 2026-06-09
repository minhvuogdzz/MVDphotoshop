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
        console.log("Autoplay blocked by browser. Will play on first interaction.");
        // If blocked, wait for ANY interaction (even mouse move or scroll)
        const playOnInteract = () => {
          if (audioRef.current) audioRef.current.play();
          ['click', 'mousemove', 'touchstart', 'scroll', 'keydown'].forEach(evt => 
            window.removeEventListener(evt, playOnInteract)
          );
        };
        ['click', 'mousemove', 'touchstart', 'scroll', 'keydown'].forEach(evt => 
          window.addEventListener(evt, playOnInteract, { once: true })
        );
      }
    };
    
    playAudio();
  }, []);

  return (
    <>
      <audio ref={audioRef} src="/nhac.mp3" loop />
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
