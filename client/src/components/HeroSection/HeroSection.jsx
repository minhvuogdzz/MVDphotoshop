import { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCube } from 'swiper/modules';
import { useData } from '../../contexts/DataContext';
import LoadingSpinner from '../common/LoadingSpinner';

import 'swiper/css';
import 'swiper/css/effect-cube';

const HeroGridItem = ({ item, index, visibilityClass, tick, isLcp }) => {
  const swiperRef = useRef(null);

  useEffect(() => {
    if (swiperRef.current && tick > 0) {
      swiperRef.current.slideNext();
    }
  }, [tick]);

  const img1 = item.image1 || `https://images.unsplash.com/photo-${1500000000000 + index}?w=500&auto=format&fit=crop`;
  const img2 = item.image2 || `https://images.unsplash.com/photo-${1500000000000 + index + 10}?w=500&auto=format&fit=crop`;
  const img3 = item.image3 || `https://images.unsplash.com/photo-${1500000000000 + index + 20}?w=500&auto=format&fit=crop`;
  const img4 = item.image4 || `https://images.unsplash.com/photo-${1500000000000 + index + 30}?w=500&auto=format&fit=crop`;

  return (
    <div 
      className={`w-full aspect-[4/6] rounded-none overflow-hidden bg-black ${visibilityClass}`}
    >
      <Swiper
        onSwiper={(swiper) => { swiperRef.current = swiper; }}
        modules={[EffectCube]}
        effect="cube"
        cubeEffect={{
          shadow: false,
          slideShadows: false,
        }}
        loop={true}
        allowTouchMove={false}
        observer={true}
        observeParents={true}
        speed={1000}
        className="w-full h-full"
      >
        <SwiperSlide>
          <img src={img1} alt={`Grid ${index} A`} className="w-full h-full object-cover" fetchPriority={isLcp ? "high" : "auto"} loading={isLcp ? "eager" : "lazy"} decoding={isLcp ? "sync" : "async"} />
        </SwiperSlide>
        <SwiperSlide>
          <img src={img2} alt={`Grid ${index} B`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
        </SwiperSlide>
        <SwiperSlide>
          <img src={img3} alt={`Grid ${index} C`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
        </SwiperSlide>
        <SwiperSlide>
          <img src={img4} alt={`Grid ${index} D`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
        </SwiperSlide>
      </Swiper>
    </div>
  );
};

const HeroSection = () => {
  const { hero, loading } = useData();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    // Master timer to synchronize all Swiper transitions
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 4000); // 4 seconds delay between synced flips
    return () => clearInterval(interval);
  }, []);

  const data = hero?.title ? hero : {
    title: 'Lưu giữ những khoảnh khắc vượt thời gian',
    subtitle: 'Photoshop, blending và Retouch ảnh chân dung, nàng thơ, ảnh cưới',
    gridItems: Array(10).fill({ image1: '', image2: '', image3: '', image4: '' }),
    ctaText: 'Xem Portfolio',
    ctaLink: '#portfolio'
  };

  const gridItems = data.gridItems || Array(10).fill({ image1: '', image2: '', image3: '', image4: '' });

  return (
    <section className="relative min-h-[100vh] w-full flex items-center justify-center overflow-hidden bg-black pt-[88px] pb-10">
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* Background Grid */}
          <div className="absolute top-0 left-0 w-full h-full z-0 p-[2px] opacity-80 bg-black flex items-center justify-center">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-[2px] w-full bg-black">
              {gridItems.map((item, index) => {
                // Determine visibility based on breakpoints
                let visibilityClass = '';
                if (index >= 4 && index < 6) visibilityClass = 'hidden md:block';
                if (index >= 6) visibilityClass = 'hidden lg:block';
                
                return <HeroGridItem key={index} item={item} index={index} visibilityClass={visibilityClass} tick={tick} isLcp={index === 0} />;
              })}
            </div>
          </div>

          {/* Floating Content Overlay */}
          <div className="container-custom relative z-20 text-center max-w-[800px] mx-auto p-4 md:p-8 pointer-events-none">
            <h1 className="animate-fade-in text-[clamp(36px,5vw,64px)] mb-6 opacity-0 text-[#ffffff] font-bold drop-shadow-[0_0_15px_rgba(0,0,0,1)] [text-shadow:0_4px_20px_rgba(0,0,0,1),_0_0_40px_rgba(0,0,0,0.8)]">
              {data.title}
            </h1>
            <p className="animate-fade-in text-[clamp(16px,2vw,20px)] text-[#ffffff]/95 mb-10 max-w-[600px] mx-auto opacity-0 font-medium drop-shadow-[0_0_10px_rgba(0,0,0,1)] [text-shadow:0_2px_10px_rgba(0,0,0,1)]" style={{ animationDelay: '0.2s' }}>
              {data.subtitle}
            </p>
            <a
              href={data.ctaLink}
              className="pointer-events-auto animate-fade-in inline-block bg-accent text-black px-10 py-4 rounded-full font-bold text-base uppercase tracking-widest transition-all duration-400 opacity-0 hover:bg-accent-hover hover:-translate-y-1 shadow-[0_0_20px_rgba(192,155,104,0.6)] hover:shadow-[0_0_30px_rgba(192,155,104,0.9)]"
              style={{ animationDelay: '0.4s' }}
            >
              {data.ctaText}
            </a>
          </div>
        </>
      )}
    </section>
  );
};

export default HeroSection;
