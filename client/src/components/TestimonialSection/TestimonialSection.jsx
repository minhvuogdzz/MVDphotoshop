import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { useData } from '../../contexts/DataContext';
import LoadingSpinner from '../common/LoadingSpinner';
import 'swiper/css';
import 'swiper/css/navigation';

const TestimonialSection = () => {
  const { testimonials, loading } = useData();

  const data = testimonials || [];

  return (
    <section className="py-[100px] bg-bg-secondary">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-[40px] mb-4 text-accent">Khách hàng nói gì?</h2>
          <p className="text-text-secondary max-w-[600px] mx-auto">Sự hài lòng của bạn là nguồn cảm hứng lớn nhất của chúng tôi.</p>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="relative px-2 sm:px-12">
          <Swiper
            modules={[Navigation, Autoplay]}
            navigation
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            spaceBetween={32}
            slidesPerView={1}
            breakpoints={{
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 }
            }}
            className="pb-12 !px-4 nav-swiper"
          >
            {data.map(testi => (
              <SwiperSlide key={testi._id}>
                <div className="glass-panel p-8 rounded-2xl h-full flex flex-col relative transition-transform duration-400 hover:-translate-y-2">
                  <div className="absolute top-4 right-6 font-secondary text-[80px] leading-none text-white/5 font-bold">"</div>
                  <p className="text-text-secondary text-lg italic mb-8 relative z-10 flex-1">{testi.quote}</p>
                  <div className="flex items-center gap-4 border-t border-glass pt-6 mt-auto">
                    <img src={testi.image} alt={testi.customerName} className="w-14 h-14 rounded-full object-cover border-2 border-accent" loading="lazy" />
                    <div>
                      <h4 className="font-secondary font-bold text-lg m-0">{testi.customerName}</h4>
                      <span className="text-accent text-sm uppercase tracking-widest">Khách hàng</span>
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
