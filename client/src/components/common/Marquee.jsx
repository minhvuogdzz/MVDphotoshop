import React, { useRef, useEffect, useState } from 'react';
import './Marquee.css';

const Marquee = ({ items, renderItem, reverse = false, duration = '30s', className = '', itemClassName = "w-[280px] md:w-[320px] lg:w-[360px]" }) => {
  const [duplicatedItems, setDuplicatedItems] = useState([]);
  
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const animationRef = useRef(null);
  const isPointerDown = useRef(false);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const lastX = useRef(0);
  const lastTime = useRef(0);
  const movedDistance = useRef(0);

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
      { transform: `translateX(calc(-50% - 4px))` }
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

  // Pause on hover so the user can comfortably view and click on cards
  const handleMouseEnter = () => {
    if (!isDragging.current && animationRef.current && animationRef.current.playState === 'running') {
      animationRef.current.pause();
    }
  };

  const handleMouseLeave = () => {
    if (!isDragging.current && !isPointerDown.current && animationRef.current && animationRef.current.playState === 'paused') {
      animationRef.current.play();
    }
  };

  const handlePointerDown = (e) => {
    if (e.button === 2) return; // Ignore right click
    
    isPointerDown.current = true;
    isDragging.current = false;
    movedDistance.current = 0;
    startX.current = e.clientX;
    lastX.current = e.clientX;
  };

  const handlePointerMove = (e) => {
    if (!isPointerDown.current || !animationRef.current || !contentRef.current) return;
    
    const currentX = e.clientX;
    const totalDelta = currentX - startX.current;
    movedDistance.current = Math.abs(totalDelta);
    
    // Only activate drag mode if moved more than 7px
    if (!isDragging.current && Math.abs(totalDelta) > 7) {
      isDragging.current = true;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch (_) {}
      animationRef.current.pause();
      lastTime.current = animationRef.current.currentTime || 0;
      if (containerRef.current) {
        containerRef.current.style.cursor = 'grabbing';
      }
    }
    
    if (isDragging.current) {
      const scrollWidth = contentRef.current.scrollWidth;
      const halfWidth = scrollWidth / 2 + 4; 
      const durMs = (parseFloat(duration) || 30) * 1000;
      
      const stepDelta = currentX - lastX.current;
      let timeShift = -(stepDelta / halfWidth) * durMs;
      if (reverse) {
        timeShift = (stepDelta / halfWidth) * durMs;
      }
      
      let newTime = (animationRef.current.currentTime || 0) + timeShift;
      if (newTime < 0) {
        newTime = durMs + (newTime % durMs);
      } else if (newTime >= durMs) {
        newTime = newTime % durMs;
      }
      
      animationRef.current.currentTime = newTime;
      lastX.current = currentX;
    }
  };

  const handlePointerUp = (e) => {
    isPointerDown.current = false;
    
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch (_) {}
    
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab';
    }
    
    if (isDragging.current) {
      if (animationRef.current) {
        animationRef.current.play();
      }
      // Small timeout to prevent the release click event from firing
      setTimeout(() => {
        isDragging.current = false;
        movedDistance.current = 0;
      }, 50);
    } else {
      isDragging.current = false;
      movedDistance.current = 0;
    }
  };

  const handleClickCapture = (e) => {
    // If user actually dragged, suppress the click
    if (isDragging.current || movedDistance.current > 7) {
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
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
