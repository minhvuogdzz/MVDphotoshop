import { useEffect, useState } from 'react';
import './PetalsEffect.css';

const PetalsEffect = () => {
  const [petals, setPetals] = useState([]);
  const [showPetals, setShowPetals] = useState(false);

  useEffect(() => {
    const handleMusicStarted = () => {
      // Đợi 4 giây sau khi nhạc phát mới bắt đầu render hoa
      setTimeout(() => setShowPetals(true), 4000);
    };

    window.addEventListener('musicStarted', handleMusicStarted, { once: true });
    
    return () => {
      window.removeEventListener('musicStarted', handleMusicStarted);
    };
  }, []);

  useEffect(() => {
    if (!showPetals) return;

    // Generate 15 petals with random properties to reduce DOM nodes
    const newPetals = Array.from({ length: 15 }).map((_, i) => {
      const size = Math.random() * 15 + 10; // 10px to 25px
      const left = Math.random() * 100; // 0% to 100%
      // Make animation faster (15s to 30s) and sway (4s to 8s)
      const duration = Math.random() * 15 + 15; 
      const swayDuration = Math.random() * 4 + 4;
      const delay = Math.random() * -30; // Start at different times
      const rotate = Math.random() * 360; // Initial rotation

      return {
        id: i,
        wrapperStyle: {
          left: `${left}%`,
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
        },
        innerStyle: {
          width: `${size}px`,
          height: `${size}px`,
          animationDuration: `${swayDuration}s`,
          animationDelay: `${delay}s`,
          transform: `rotate(${rotate}deg)`,
        }
      };
    });
    setPetals(newPetals);
  }, [showPetals]);

  if (!showPetals) return null;

  return (
    <div className="petals-container pointer-events-none fixed inset-0 z-[50] overflow-hidden">
      {petals.map((petal) => (
        <div key={petal.id} className="petal-wrapper" style={petal.wrapperStyle}>
          <div className="petal" style={petal.innerStyle}></div>
        </div>
      ))}
    </div>
  );
};

export default PetalsEffect;
