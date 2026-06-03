import { useRef, useEffect } from 'react';

const ComparisonSlider = ({ beforeImage, afterImage, title }) => {
  const foregroundRef = useRef(null);
  const handleRef = useRef(null);
  const inputRef = useRef(null);

  const handleInput = (e) => {
    const val = e.target.value;
    if (foregroundRef.current) {
      foregroundRef.current.style.clipPath = `inset(0 ${100 - val}% 0 0)`;
    }
    if (handleRef.current) {
      handleRef.current.style.left = `calc(${val}% - 2px)`;
    }
  };

  useEffect(() => {
    const inputEl = inputRef.current;
    if (inputEl) {
      inputEl.addEventListener('input', handleInput);
      return () => inputEl.removeEventListener('input', handleInput);
    }
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden group select-none shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        {/* Background Image: After (Visible on the right) */}
        <img 
          src={afterImage} 
          alt="After" 
          className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
          draggable={false}
        />
        
        {/* Foreground Image: Before (Visible on the left, clipped on the right) */}
        <img 
          ref={foregroundRef}
          src={beforeImage} 
          alt="Before" 
          className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
          style={{ clipPath: 'inset(0 50% 0 0)', transform: 'translateZ(0)', willChange: 'clip-path' }}
          draggable={false}
        />
        
        {/* Native Range Input for ultra-smooth drag (invisible but functional) */}
        <input
          ref={inputRef}
          type="range"
          min="0"
          max="100"
          defaultValue="50"
          className="absolute top-0 left-0 w-full h-full opacity-0 cursor-ew-resize z-20 m-0 p-0 touch-none"
        />

        {/* Slider Line & Handle (Visuals) */}
        <div 
          ref={handleRef}
          className="absolute top-0 bottom-0 w-[3px] bg-accent pointer-events-none shadow-[0_0_10px_rgba(192,155,104,0.6)] z-10"
          style={{ left: 'calc(50% - 1.5px)', transform: 'translateZ(0)', willChange: 'left' }}
        >
          {/* Handle icon */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-bg-main/80 backdrop-blur border border-accent rounded-full shadow-[0_0_20px_rgba(192,155,104,0.5)] flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 17l-5-5 5-5M14 17l5-5-5-5" />
            </svg>
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur text-white px-3 py-1 text-xs font-semibold rounded uppercase tracking-wider shadow-lg z-10 pointer-events-none">
          Before
        </div>
        <div className="absolute top-4 right-4 bg-accent/90 backdrop-blur text-bg-main px-3 py-1 text-xs font-semibold rounded uppercase tracking-wider shadow-lg z-10 pointer-events-none">
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
