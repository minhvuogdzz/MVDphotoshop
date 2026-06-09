import React, { useRef, useEffect, useState } from 'react';
import './Marquee.css';

const Marquee = ({ items, renderItem, reverse = false, duration = '30s', className = '' }) => {
  const [duplicatedItems, setDuplicatedItems] = useState([]);
  
  useEffect(() => {
    // Duplicate items 4 times (2 sets for display, 2 sets for the scroll loop)
    if (items && items.length > 0) {
      setDuplicatedItems([...items, ...items, ...items, ...items]);
    }
  }, [items]);

  if (!items || items.length === 0) return null;

  return (
    <div className={`marquee-container ${className}`}>
      <div 
        className={`marquee-content ${reverse ? 'reverse' : ''}`}
        style={{ '--duration': duration }}
      >
        {duplicatedItems.map((item, index) => (
          <div key={`${item._id || index}-${index}`} className="flex-shrink-0 w-[280px] md:w-[320px] lg:w-[360px]">
            {renderItem(item)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marquee;
