import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { useData } from '../../contexts/DataContext';
import LoadingSpinner from '../common/LoadingSpinner';
import 'swiper/css';
import 'swiper/css/navigation';

const TestimonialSection = () => {
  const { testimonials, pageSettings, loading } = useData();

  const data = testimonials || [];
  const homeSettings = pageSettings?.home || {};

  const title = homeSettings.testimonialsTitle || 'Học Viên & Khách Hàng Nói Gì?';
  const subtitle = homeSettings.testimonialsDesc || 'Những chia sẻ và cảm nhận chân thực nhất từ các bạn học viên và đối tác đã đồng hành cùng MVD Academy.';
  const badge = homeSettings.testimonialsBadge || 'Cảm Nhận Chân Thực';

  return (
    <section id="testimonials" className="py-[100px] bg-bg-secondary border-t border-white/5 relative">
      <div className="container-custom">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-wider mb-3">
            {badge}
          </span>
          <h2 className="text-[36px] md:text-[42px] font-bold mb-4 text-accent font-secondary">
            {title}
          </h2>
          <p className="text-text-secondary max-w-[650px] mx-auto text-sm md:text-base leading-relaxed">
            {subtitle}
          </p>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="relative px-2 sm:px-12">
            <Swiper
              modules={[Navigation, Autoplay]}
              navigation
              autoplay={{ delay: 4500, disableOnInteraction: false }}
              spaceBetween={28}
              slidesPerView={1}
              breakpoints={{
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 }
              }}
              className="pb-12 !px-2 nav-swiper"
            >
              {data.map((testi, idx) => (
                <SwiperSlide key={testi._id || idx} className="h-auto">
                  <div className="glass-panel p-8 rounded-2xl h-full flex flex-col relative transition-transform duration-400 hover:-translate-y-2 group border border-glass shadow-xl">
                    {/* 5 Golden Stars */}
                    <div className="flex items-center gap-1 text-accent text-base mb-4">
                      {'★'.repeat(5)}
                    </div>

                    <div className="text-accent/20 font-secondary text-5xl leading-none -mb-2 select-none">“</div>
                    <p className="text-text-primary text-base leading-relaxed italic mb-6 relative z-10 flex-1">
                      {testi.quote}
                    </p>

                    <div className="flex items-center gap-4 border-t border-glass pt-5 mt-auto">
                      {testi.image ? (
                        <img 
                          src={testi.image} 
                          alt={testi.customerName} 
                          className="w-14 h-14 rounded-full object-cover border-2 border-accent shrink-0 shadow-md" 
                          loading="lazy" 
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-accent/20 border-2 border-accent text-accent font-bold flex items-center justify-center shrink-0 text-lg font-secondary">
                          {testi.customerName ? testi.customerName.charAt(0) : 'M'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="font-secondary font-bold text-lg text-text-primary truncate m-0 group-hover:text-accent transition-colors">
                          {testi.customerName}
                        </h4>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialSection;
