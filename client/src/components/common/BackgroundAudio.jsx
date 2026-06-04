import { useEffect, useRef, useState } from 'react';

const BackgroundAudio = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const playAudio = () => {
      if (hasStarted) return;
      
      audio.play().then(() => {
        setIsPlaying(true);
        setHasStarted(true);
        window.dispatchEvent(new CustomEvent('musicStarted'));
      }).catch(() => {
        // Autoplay blocked — will try on interaction
      });
    };

    // Strategy 1: Listen for loading complete event from DataContext
    const handleLoadingComplete = () => {
      // Small delay to let the UI settle
      setTimeout(playAudio, 500);
    };
    window.addEventListener('loadingComplete', handleLoadingComplete);

    // Strategy 2: Try autoplay immediately (works on soft reloads, PWA, some mobile browsers)
    // Use a tiny delay to let the page initialize
    const immediateTimer = setTimeout(playAudio, 1000);

    // Strategy 3: Fallback — play on first user interaction if autoplay was blocked
    const interactionEvents = ['click', 'touchstart', 'keydown', 'scroll'];
    
    const handleInteraction = () => {
      if (!hasStarted) {
        playAudio();
      }
      // Remove listeners after first successful play
      if (hasStarted) {
        interactionEvents.forEach(evt => document.removeEventListener(evt, handleInteraction));
      }
    };

    // Delay adding interaction listeners to give autoplay a chance first
    const interactionTimer = setTimeout(() => {
      if (!hasStarted) {
        interactionEvents.forEach(evt => document.addEventListener(evt, handleInteraction, { passive: true }));
      }
    }, 2000);
    
    return () => {
      clearTimeout(immediateTimer);
      clearTimeout(interactionTimer);
      window.removeEventListener('loadingComplete', handleLoadingComplete);
      interactionEvents.forEach(evt => document.removeEventListener(evt, handleInteraction));
    };
  }, [hasStarted]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
          if (!hasStarted) {
            window.dispatchEvent(new CustomEvent('musicStarted'));
            setHasStarted(true);
          }
        }).catch(() => {});
      }
    }
  };

  return (
    <>
      <audio ref={audioRef} src="/nhac.mp3" loop preload="auto" />
      
      <button 
        onClick={togglePlay}
        className="fixed bottom-6 left-6 z-[100] w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center cursor-pointer shadow-lg hover:bg-black/80 transition-all group"
        aria-label="Toggle Background Music"
      >
        <div className={`text-accent transition-transform duration-[3000ms] ease-linear ${isPlaying ? 'animate-spin-slow' : ''}`}>
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18V5l12-2v13"></path>
              <circle cx="6" cy="18" r="3"></circle>
              <circle cx="18" cy="16" r="3"></circle>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
              <line x1="23" y1="9" x2="17" y2="15"></line>
              <line x1="17" y1="9" x2="23" y2="15"></line>
            </svg>
          )}
        </div>
      </button>
    </>
  );
};

export default BackgroundAudio;
