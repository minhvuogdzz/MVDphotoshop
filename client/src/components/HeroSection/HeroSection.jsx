import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectCube } from 'swiper/modules';
import { useData } from '../../contexts/DataContext';
import LoadingSpinner from '../common/LoadingSpinner';

import 'swiper/css';
import 'swiper/css/effect-cube';

const HeroSection = () => {
  const { hero, loading } = useData();

  const data = hero?.title ? hero : {
    title: 'Lưu giữ những khoảnh khắc vượt thời gian',
    subtitle: 'Photoshop, blending và Retouch ảnh chân dung, nàng thơ, ảnh cưới',
    gridItems: Array(10).fill({ image1: '', image2: '' }),
    ctaText: 'Xem Portfolio',
    ctaLink: '#portfolio'
  };

  const gridItems = data.gridItems || Array(10).fill({ image1: '', image2: '' });

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
                // Mobile: 2x2 = 4 items (0,1,2,3)
                // Tablet: 3x2 = 6 items (0,1,2,3,4,5)
                // Desktop: 5x2 = 10 items (all)
                let visibilityClass = '';
                if (index >= 4 && index < 6) visibilityClass = 'hidden md:block';
                if (index >= 6) visibilityClass = 'hidden lg:block';

                // Default placeholder if empty
                const img1 = item.image1 || `https://images.unsplash.com/photo-${1500000000000 + index}?w=500&auto=format&fit=crop`;
                const img2 = item.image2 || `https://images.unsplash.com/photo-${1500000000000 + index + 10}?w=500&auto=format&fit=crop`;

                return (
                  <div key={index} className={`w-full aspect-[4/5] rounded-none overflow-hidden bg-black ${visibilityClass}`}>
                    <Swiper
                      modules={[Autoplay, EffectCube]}
                      effect="cube"
                      cubeEffect={{
                        shadow: false,
                        slideShadows: false,
                      }}
                      loop={true}
                      allowTouchMove={false}
                      observer={true}
                      observeParents={true}
                      autoplay={{ 
                        delay: 3000, 
                        disableOnInteraction: false,
                        // Stagger the flip animation slightly for each box so they don't all flip at the exact same millisecond
                        reverseDirection: index % 2 === 0
                      }}
                      className="w-full h-full"
                    >
                      <SwiperSlide>
                        <img src={img1} alt={`Grid ${index} A`} className="w-full h-full object-cover" />
                      </SwiperSlide>
                      <SwiperSlide>
                        <img src={img2} alt={`Grid ${index} B`} className="w-full h-full object-cover" />
                      </SwiperSlide>
                    </Swiper>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Floating Content Overlay */}
          <div className="container-custom relative z-20 text-center max-w-[800px] mx-auto p-4 md:p-8">
            <h1 className="animate-fade-in text-[clamp(36px,5vw,64px)] mb-6 opacity-0 text-white font-bold drop-shadow-[0_0_15px_rgba(0,0,0,1)] [text-shadow:0_4px_20px_rgba(0,0,0,1),_0_0_40px_rgba(0,0,0,0.8)]">
              {data.title}
            </h1>
            <p className="animate-fade-in text-[clamp(16px,2vw,20px)] text-white/95 mb-10 max-w-[600px] mx-auto opacity-0 font-medium drop-shadow-[0_0_10px_rgba(0,0,0,1)] [text-shadow:0_2px_10px_rgba(0,0,0,1)]" style={{ animationDelay: '0.2s' }}>
              {data.subtitle}
            </p>
            <a
              href={data.ctaLink}
              className="animate-fade-in inline-block bg-accent text-bg-main px-10 py-4 rounded-full font-bold text-base uppercase tracking-widest transition-all duration-400 opacity-0 hover:bg-accent-hover hover:-translate-y-1 shadow-[0_0_20px_rgba(192,155,104,0.6)] hover:shadow-[0_0_30px_rgba(192,155,104,0.9)]"
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
