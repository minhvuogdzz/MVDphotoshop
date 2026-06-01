import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, EffectFade } from 'swiper/modules';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const HeroSection = () => {
  const [heroData, setHeroData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const { data } = await api.get('/hero');
        setHeroData(data);
      } catch (err) {
        console.error('Failed to fetch hero data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHero();
  }, []);

  const defaultHero = {
    title: 'Lưu giữ những khoảnh khắc vượt thời gian',
    subtitle: 'Photoshop, blending và Retouch ảnh chân dung, nàng thơ, ảnh cưới',
    backgroundUrls: [
      'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2071&auto=format&fit=crop'
    ],
    ctaText: 'Xem Portfolio',
    ctaLink: '#portfolio'
  };

  const data = heroData?.title ? heroData : defaultHero;
  const rawBackgrounds = data.backgroundUrls?.length ? data.backgroundUrls : defaultHero.backgroundUrls;
  const backgrounds = rawBackgrounds.filter(bg => bg && bg.trim() !== '');

  return (
    <section className="relative h-screen min-h-[600px] w-full flex items-center justify-center overflow-hidden">
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <Swiper
            modules={[Pagination, Autoplay, EffectFade]}
        effect="fade"
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ type: 'progressbar' }}
        className="!absolute top-0 left-0 w-full h-full z-10"
      >
        {backgrounds.map((bg, index) => (
          <SwiperSlide key={index}>
            <div 
              className="w-full h-full bg-cover bg-center bg-no-repeat transition-transform duration-[10000ms] ease-out slide-bg" 
              style={{ backgroundImage: `url(${bg})` }}
            >
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/30 to-black/70"></div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      
      <div className="container-custom relative z-20 text-center max-w-[800px] mx-auto">
        <h1 className="animate-fade-in text-[clamp(36px,5vw,64px)] mb-6 opacity-0 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">{data.title}</h1>
        <p className="animate-fade-in text-[clamp(16px,2vw,20px)] text-text-secondary mb-10 max-w-[600px] mx-auto opacity-0" style={{ animationDelay: '0.2s' }}>{data.subtitle}</p>
        <a 
          href={data.ctaLink} 
          className="animate-fade-in inline-block bg-accent text-bg-main px-10 py-4 rounded-full font-semibold text-base uppercase tracking-widest transition-all duration-400 opacity-0 hover:bg-accent-hover hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(192,155,104,0.3)]" 
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
