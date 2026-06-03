import { useEffect, useState } from 'react';
import './PetalsEffect.css';

const PetalsEffect = () => {
  const [petals, setPetals] = useState([]);

  useEffect(() => {
    // Generate 30 petals with random properties
    const newPetals = Array.from({ length: 30 }).map((_, i) => {
      const size = Math.random() * 15 + 10; // 10px to 25px
      const left = Math.random() * 100; // 0% to 100%
      // Make animation extremely slow, lasting around 60-90 seconds
      const duration = Math.random() * 30 + 60; // 60s to 90s
      const delay = Math.random() * -60; // Start at different times
      const rotate = Math.random() * 360; // Initial rotation

      return {
        id: i,
        style: {
          width: `${size}px`,
          height: `${size}px`,
          left: `${left}%`,
          animationDuration: `${duration}s, ${duration/3}s`, // fall, sway
          animationDelay: `${delay}s, ${delay}s`,
          transform: `rotate(${rotate}deg)`,
        }
      };
    });
    setPetals(newPetals);
  }, []);

  return (
    <div className="petals-container pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {petals.map((petal) => (
        <div key={petal.id} className="petal" style={petal.style}></div>
      ))}
    </div>
  );
};

export default PetalsEffect;
