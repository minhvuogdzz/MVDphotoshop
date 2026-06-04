import { useEffect, useState } from 'react';
import './PetalsEffect.css';

// SVG petal shapes — realistic cherry blossom styles
const PETAL_SHAPES = [
  // Classic sakura petal — round with notch
  `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="p1g" cx="30%" cy="30%">
        <stop offset="0%" stop-color="#ffd6e0"/>
        <stop offset="60%" stop-color="#ffb3c6"/>
        <stop offset="100%" stop-color="#f2a0b4"/>
      </radialGradient>
    </defs>
    <path d="M20 2 C28 2, 38 10, 38 20 C38 30, 28 38, 20 38 C16 38, 12 34, 20 28 C28 34, 24 38, 20 38 C12 38, 2 30, 2 20 C2 10, 12 2, 20 2Z" fill="url(#p1g)" opacity="0.85"/>
    <path d="M20 8 C20 8, 22 16, 20 28" stroke="#f7a8be" stroke-width="0.5" fill="none" opacity="0.4"/>
  </svg>`,
  // Soft round petal 
  `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="p2g" cx="40%" cy="25%">
        <stop offset="0%" stop-color="#ffe0e8"/>
        <stop offset="50%" stop-color="#ffc4d4"/>
        <stop offset="100%" stop-color="#f5a0b8"/>
      </radialGradient>
    </defs>
    <ellipse cx="20" cy="20" rx="14" ry="18" fill="url(#p2g)" opacity="0.8"/>
    <path d="M20 6 Q22 14, 20 34" stroke="#f0a0b5" stroke-width="0.4" fill="none" opacity="0.35"/>
  </svg>`,
  // Teardrop petal
  `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="p3g" cx="35%" cy="30%">
        <stop offset="0%" stop-color="#ffdde5"/>
        <stop offset="70%" stop-color="#ffafc5"/>
        <stop offset="100%" stop-color="#e898ad"/>
      </radialGradient>
    </defs>
    <path d="M20 4 C30 8, 36 18, 34 28 C32 36, 26 40, 20 38 C14 40, 8 36, 6 28 C4 18, 10 8, 20 4Z" fill="url(#p3g)" opacity="0.75"/>
    <path d="M18 10 C19 18, 20 28, 20 36" stroke="#eba4b8" stroke-width="0.3" fill="none" opacity="0.3"/>
  </svg>`,
  // Small round petal
  `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="p4g" cx="45%" cy="35%">
        <stop offset="0%" stop-color="#fff0f3"/>
        <stop offset="50%" stop-color="#ffd0dc"/>
        <stop offset="100%" stop-color="#f5b0c4"/>
      </radialGradient>
    </defs>
    <circle cx="20" cy="20" r="13" fill="url(#p4g)" opacity="0.7"/>
  </svg>`,
];

const PetalsEffect = () => {
  const [petals, setPetals] = useState([]);
  const [showPetals, setShowPetals] = useState(false);

  useEffect(() => {
    const handleMusicStarted = () => {
      // Đợi 6 giây sau khi nhạc phát mới bắt đầu render hoa
      setTimeout(() => setShowPetals(true), 6000);
    };

    window.addEventListener('musicStarted', handleMusicStarted, { once: true });
    
    return () => {
      window.removeEventListener('musicStarted', handleMusicStarted);
    };
  }, []);

  useEffect(() => {
    if (!showPetals) return;

    // Generate 12 petals with random properties (reduced from 18 for performance)
    const newPetals = Array.from({ length: 12 }).map((_, i) => {
      const size = Math.random() * 12 + 10; // 10px to 22px
      const left = Math.random() * 100;
      // Slower, more graceful falling (20s to 40s)
      const duration = Math.random() * 20 + 20;
      // Gentle sway (5s to 10s)
      const swayDuration = Math.random() * 5 + 5;
      const delay = Math.random() * -35;
      const rotate = Math.random() * 360;
      // Varying opacity for depth — some closer (brighter), some farther (faint)
      const opacity = Math.random() * 0.35 + 0.25; // 0.25 to 0.60
      const shapeIndex = Math.floor(Math.random() * PETAL_SHAPES.length);
      // Horizontal drift
      const drift = (Math.random() - 0.5) * 150; // -75px to 75px

      return {
        id: i,
        shapeIndex,
        opacity,
        drift,
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
          opacity,
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
          <div 
            className="petal-svg" 
            style={petal.innerStyle}
            dangerouslySetInnerHTML={{ __html: PETAL_SHAPES[petal.shapeIndex] }}
          />
        </div>
      ))}
    </div>
  );
};

export default PetalsEffect;
