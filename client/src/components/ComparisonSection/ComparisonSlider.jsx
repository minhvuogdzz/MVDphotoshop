import { useState, useRef, useEffect } from 'react';

const ComparisonSlider = ({ beforeImage, afterImage, title }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef(null);
  
  const handleMove = (event) => {
    if (!containerRef.current) return;
    
    let clientX;
    if (event.touches) {
      clientX = event.touches[0].clientX;
    } else {
      clientX = event.clientX;
    }
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(position);
  };

  const handleDrag = (e) => {
    // Only handle if button is pressed or touch is active
    if (e.buttons !== 1 && e.type !== 'touchmove') return;
    handleMove(e);
  };

  return (
    <div className="flex flex-col gap-4">
      <div 
        ref={containerRef}
        className="relative w-full aspect-[4/3] rounded-xl overflow-hidden cursor-ew-resize group select-none shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
        onMouseMove={handleDrag}
        onMouseDown={handleMove}
        onTouchMove={handleDrag}
        onTouchStart={handleMove}
      >
        {/* Before Image (Background) */}
        <img 
          src={beforeImage} 
          alt="Before" 
          className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
          draggable={false}
        />
        
        {/* After Image (Foreground / Clipped) */}
        <img 
          src={afterImage} 
          alt="After" 
          className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          draggable={false}
        />
        
        {/* Slider Line & Handle */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white/80 pointer-events-none shadow-[0_0_10px_rgba(0,0,0,0.5)]"
          style={{ left: `calc(${sliderPosition}% - 2px)` }}
        >
          {/* Handle icon */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)] flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-800">
              <polyline points="15 18 9 12 15 6"></polyline>
              <polyline points="9 18 15 12 9 6" style={{ transform: 'translateX(6px)' }}></polyline>
            </svg>
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur text-white px-3 py-1 text-xs font-semibold rounded uppercase tracking-wider shadow-lg">
          Before
        </div>
        <div className="absolute top-4 right-4 bg-accent/90 backdrop-blur text-bg-main px-3 py-1 text-xs font-semibold rounded uppercase tracking-wider shadow-lg">
          After
        </div>
      </div>
      
      {title && (
        <div className="text-center">
          <h3 className="font-secondary text-2xl text-accent">{title}</h3>
        </div>
      )}
    </div>
  );
};

export default ComparisonSlider;
