import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCube } from 'swiper/modules';
import { useData } from '../../contexts/DataContext';
import LoadingSpinner from '../common/LoadingSpinner';

import 'swiper/css';
import 'swiper/css/effect-cube';

const HeroGridItem = ({ item, index, visibilityClass, tick, isLcp }) => {
  const swiperRef = useRef(null);

  // Tất cả các ô đồng loạt thay đổi ảnh cùng lúc theo thời gian nhất định
  useEffect(() => {
    if (!swiperRef.current || tick === 0) return;
    swiperRef.current.slideNext();
  }, [tick]);

  const img1 = item.image1 || '';
  const img2 = item.image2 || item.image1 || '';
  const img3 = item.image3 || item.image1 || '';
  const img4 = item.image4 || item.image2 || item.image1 || '';

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
        speed={900}
        className="w-full h-full"
      >
        <SwiperSlide>
          <img src={img1} alt={`Grid ${index} 1`} className="w-full h-full object-cover select-none pointer-events-none" fetchPriority={isLcp ? "high" : "auto"} loading={isLcp ? "eager" : "lazy"} decoding={isLcp ? "sync" : "async"} />
        </SwiperSlide>
        <SwiperSlide>
          <img src={img2} alt={`Grid ${index} 2`} className="w-full h-full object-cover select-none pointer-events-none" loading="lazy" decoding="async" />
        </SwiperSlide>
        <SwiperSlide>
          <img src={img3} alt={`Grid ${index} 3`} className="w-full h-full object-cover select-none pointer-events-none" loading="lazy" decoding="async" />
        </SwiperSlide>
        <SwiperSlide>
          <img src={img4} alt={`Grid ${index} 4`} className="w-full h-full object-cover select-none pointer-events-none" loading="lazy" decoding="async" />
        </SwiperSlide>
      </Swiper>
    </div>
  );
};

const HeroSection = () => {
  const { hero, pageSettings, loading } = useData();
  const [tick, setTick] = useState(0);

  const homeSettings = pageSettings?.home || {};

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const badge = homeSettings.heroBadge || 'Học Viện Retouching Chuyên Nghiệp';
  const title = homeSettings.heroTitle || hero?.title || 'MVD Photoshop Academy';
  const subtitle = homeSettings.heroSubtitle || hero?.subtitle || 'Nơi kiến tạo tư duy nghệ thuật & kỹ thuật Retouching chuẩn quốc tế';
  const cta1Text = homeSettings.heroCta1Text || hero?.ctaText || 'Khám phá khóa học';
  const cta1Link = homeSettings.heroCta1Link || '/courses';
  const cta2Text = homeSettings.heroCta2Text || 'Kho tài nguyên miễn phí';
  const cta2Link = homeSettings.heroCta2Link || '/resources';

  const gridItems = hero?.gridItems || Array(10).fill({ image1: '', image2: '', image3: '', image4: '' });

  if (loading) {
    return (
      <section className="min-h-[90vh] flex items-center justify-center bg-bg-main pt-[88px]">
        <LoadingSpinner />
      </section>
    );
  }

  return (
    <section className="relative z-10 min-h-[100vh] w-full flex items-center justify-center overflow-hidden bg-black pt-[88px] pb-10">
      {/* Background Grid of 3D Rotating Cubes */}
      <div className="absolute top-0 left-0 w-full h-full z-0 p-[2px] opacity-80 bg-black flex items-center justify-center">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-[2px] w-full bg-black">
          {gridItems.map((item, index) => {
            let visibilityClass = '';
            if (index >= 4 && index < 6) visibilityClass = 'hidden md:block';
            if (index >= 6) visibilityClass = 'hidden lg:block';
            return <HeroGridItem key={index} item={item} index={index} visibilityClass={visibilityClass} tick={tick} isLcp={index === 0} />;
          })}
        </div>
      </div>

      {/* Floating Content Overlay */}
      <div className="container-custom relative z-20 text-center max-w-[800px] mx-auto p-4 md:p-8 pointer-events-none">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/70 border border-accent/40 text-accent text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-md animate-fade-in pointer-events-auto">
          {badge}
        </div>
        <h1 className="text-[clamp(32px,5vw,60px)] mb-6 text-white font-bold drop-shadow-[0_4px_20px_rgba(0,0,0,1)] font-secondary leading-tight animate-fade-in">
          {title}
        </h1>
        <p className="text-[clamp(15px,2vw,18px)] text-white/90 mb-8 max-w-[620px] mx-auto font-medium drop-shadow-[0_2px_10px_rgba(0,0,0,1)] leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {subtitle}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pointer-events-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <Link
            to={cta1Link}
            className="bg-accent text-neutral-950 px-8 py-3.5 rounded-full font-bold text-sm uppercase tracking-wider transition-all duration-300 hover:bg-accent-hover shadow-[0_0_20px_rgba(192,155,104,0.6)]"
          >
            {cta1Text}
          </Link>
          <Link
            to={cta2Link}
            className="bg-black/60 backdrop-blur-md text-white border border-white/20 px-8 py-3.5 rounded-full font-bold text-sm uppercase tracking-wider transition-all duration-300 hover:bg-white/10"
          >
            {cta2Text}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
