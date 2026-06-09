import React, { useRef, useEffect, useState } from 'react';
import './Marquee.css';

const Marquee = ({ items, renderItem, reverse = false, duration = '30s', className = '', itemClassName = "w-[280px] md:w-[320px] lg:w-[360px]" }) => {
  const [duplicatedItems, setDuplicatedItems] = useState([]);
  
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const animationRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const lastTime = useRef(0);
  const dragDistance = useRef(0);

  useEffect(() => {
    // Duplicate items 4 times (2 sets for display, 2 sets for the scroll loop)
    if (items && items.length > 0) {
      setDuplicatedItems([...items, ...items, ...items, ...items]);
    }
  }, [items]);

  useEffect(() => {
    if (!contentRef.current || duplicatedItems.length === 0) return;
    
    const durMs = (parseFloat(duration) || 30) * 1000;
    
    if (animationRef.current) {
      animationRef.current.cancel();
    }
    
    const keyframes = [
      { transform: 'translateX(0px)' },
      { transform: `translateX(calc(-50% - 12px))` }
    ];
    
    const anim = contentRef.current.animate(keyframes, {
      duration: durMs,
      iterations: Infinity,
      direction: reverse ? 'reverse' : 'normal',
      easing: 'linear'
    });
    
    animationRef.current = anim;
    
    return () => {
      if (animationRef.current) {
        animationRef.current.cancel();
      }
    };
  }, [duration, reverse, duplicatedItems.length]);

  const handlePointerDown = (e) => {
    if (e.button === 2) return; // Ignore right click
    
    e.currentTarget.setPointerCapture(e.pointerId);
    isDragging.current = true;
    dragDistance.current = 0;
    startX.current = e.clientX;
    
    if (animationRef.current) {
      animationRef.current.pause();
      lastTime.current = animationRef.current.currentTime || 0;
    }
    
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grabbing';
    }
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current || !animationRef.current || !contentRef.current) return;
    
    const currentX = e.clientX;
    const deltaX = currentX - startX.current;
    
    dragDistance.current += Math.abs(deltaX);
    
    const scrollWidth = contentRef.current.scrollWidth;
    const halfWidth = scrollWidth / 2 + 12; 
    const durMs = (parseFloat(duration) || 30) * 1000;
    
    let timeShift = -(deltaX / halfWidth) * durMs;
    if (reverse) {
      timeShift = (deltaX / halfWidth) * durMs;
    }
    
    let newTime = lastTime.current + timeShift;
    
    if (newTime < 0) {
      newTime = durMs + (newTime % durMs);
    } else if (newTime >= durMs) {
      newTime = newTime % durMs;
    }
    
    animationRef.current.currentTime = newTime;
  };

  const handlePointerUp = (e) => {
    if (isDragging.current) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      isDragging.current = false;
      if (animationRef.current) {
        animationRef.current.play();
      }
      if (containerRef.current) {
        containerRef.current.style.cursor = 'grab';
      }
    }
  };

  const handleClickCapture = (e) => {
    if (dragDistance.current > 5) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div 
      className={`marquee-container ${className}`}
      ref={containerRef}
      style={{ cursor: 'grab', touchAction: 'pan-y' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClickCapture={handleClickCapture}
    >
      <div 
        className={`marquee-content ${reverse ? 'reverse' : ''}`}
        ref={contentRef}
      >
        {duplicatedItems.map((item, index) => (
          <div key={`${item._id || index}-${index}`} className={`flex-shrink-0 ${itemClassName}`}>
            {renderItem(item)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marquee;
