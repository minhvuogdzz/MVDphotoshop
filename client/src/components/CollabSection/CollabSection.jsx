import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { useData } from '../../contexts/DataContext';
import LoadingSpinner from '../common/LoadingSpinner';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const CollabSection = () => {
  const { collaborations, loading } = useData();

  if (!loading && (!collaborations || collaborations.length === 0)) return null;

  return (
    <section id="collaborations" className="py-[100px] bg-bg-secondary border-t border-white/5">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-[40px] mb-4 text-accent">Sản phẩm cộng tác Studio nổi bật</h2>
          <p className="text-text-secondary max-w-[600px] mx-auto">Những dự án hợp tác độc đáo mang đến những tác phẩm tuyệt vời.</p>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="relative px-2 sm:px-12">
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              navigation
              pagination={{ type: 'progressbar' }}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              spaceBetween={24}
              slidesPerView={1}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
                1280: { slidesPerView: 4 }
              }}
              className="nav-swiper"
            >
              {collaborations.map(item => (
                <SwiperSlide key={item._id} className="!h-auto">
                  <div className="group relative overflow-hidden transition-all duration-500 bg-white/5 border border-glass rounded-xl flex flex-col h-full shadow-lg">
                    <div className="overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-full aspect-[4/6] object-cover block rounded-t-xl transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-secondary text-2xl mb-1 text-white">{item.title}</h3>
                        {item.location && <p className="text-sm text-accent mb-5">Location: {item.location}</p>}
                      </div>
                      <a 
                        href={item.driveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full py-3 text-center border border-accent text-accent rounded-lg transition-all duration-300 hover:bg-accent hover:text-bg-main font-medium text-sm mt-auto shadow-[0_0_15px_rgba(192,155,104,0.1)] hover:shadow-[0_0_20px_rgba(192,155,104,0.3)]"
                        title="Xem drive sản phẩm chi tiết"
                      >
                        Xem drive sản phẩm chi tiết
                      </a>
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

export default CollabSection;
