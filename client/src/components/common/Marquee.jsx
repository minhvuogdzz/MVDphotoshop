import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode } from 'swiper/modules';
import 'swiper/css';
import './Marquee.css';

const Marquee = ({ items, renderItem, reverse = false, duration = '30s', className = '', itemClassName = "w-[280px] md:w-[320px] lg:w-[360px]" }) => {
  if (!items || items.length === 0) return null;

  // Duplicate items to ensure smooth infinite loop for continuous swiper
  const displayItems = [...items, ...items, ...items, ...items];
  
  // Calculate a reasonable speed based on duration string (e.g. "120s")
  // Swiper speed is transition time for 1 slide. 
  // If original duration was 120s for half the items, let's set a smooth speed.
  // 5000ms per slide is a good linear speed for a marquee.
  const speed = parseInt(duration) * 100 || 5000;

  return (
    <div className={`continuous-slider ${className}`}>
      <Swiper
        modules={[Autoplay, FreeMode]}
        spaceBetween={24}
        slidesPerView="auto"
        loop={true}
        speed={speed}
        freeMode={{
          enabled: true,
          momentum: false, // Prevents throwing past the linear speed
        }}
        autoplay={{
          delay: 0,
          disableOnInteraction: false, // Immediately resume after drag
          reverseDirection: reverse,
          pauseOnMouseEnter: false // Ensure it immediately runs when released
        }}
        grabCursor={true}
        allowTouchMove={true}
        className="w-full"
      >
        {displayItems.map((item, index) => (
          <SwiperSlide key={`${item._id || index}-${index}`} className={`!w-auto flex-shrink-0 ${itemClassName}`}>
            {renderItem(item)}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Marquee;
