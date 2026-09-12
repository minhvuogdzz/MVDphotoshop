import { Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import LoadingSpinner from '../common/LoadingSpinner';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const ServicesSection = () => {
  const { services, pageSettings, loading } = useData();

  const data = services || [];
  const homeSettings = pageSettings?.home || {};

  const title = homeSettings.coursesTitle || 'Khóa Học & Dịch Vụ Hậu Kỳ';
  const subtitle = homeSettings.coursesDesc || 'Chương trình đào tạo thực chiến và các gói dịch vụ xử lý hình ảnh tiêu chuẩn cao cấp của MVD Photoshop Academy.';
  const badge = homeSettings.coursesBadge || 'Lộ Trình Đào Tạo Nghề';

  return (
    <section id="services" className="py-[100px] bg-bg-secondary border-t border-white/5 relative">
      <div className="container-custom">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-wider mb-3">
            {badge}
          </span>
          <h2 className="text-[36px] md:text-[42px] font-bold text-accent font-secondary mb-4">
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
              modules={[Pagination, Navigation, Autoplay]}
              spaceBetween={30}
              slidesPerView={1}
              breakpoints={{
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 }
              }}
              pagination={{ type: 'progressbar' }}
              navigation
              autoplay={{ delay: 4000, disableOnInteraction: false }}
              className="nav-swiper"
            >
              {data.map(service => (
                <SwiperSlide key={service._id} className="h-auto">
                  <div className="glass-panel rounded-2xl overflow-hidden flex flex-col h-full transition-transform duration-400 hover:-translate-y-2 group">
                    <div className="relative h-[240px] overflow-hidden shrink-0 bg-black/40">
                      {service.image ? (
                        <img 
                          src={service.image} 
                          alt={service.name} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                          loading="lazy" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-secondary text-sm">
                          MVD Photoshop Academy
                        </div>
                      )}
                      {service.type && (
                        <span className="absolute top-4 right-4 bg-black/75 backdrop-blur-md text-accent border border-accent/30 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                          {service.type}
                        </span>
                      )}
                    </div>
                    
                    <div className="p-7 flex flex-col flex-1">
                      <h3 className="font-secondary text-2xl font-bold mb-2 text-white group-hover:text-accent transition-colors">
                        {service.name}
                      </h3>
                      <p className="text-xl font-bold text-accent mb-5 pb-5 border-b border-glass">
                        {service.price}
                      </p>
                      
                      {Array.isArray(service.details) && service.details.length > 0 && (
                        <ul className="list-none p-0 m-0 mb-8 flex-1 flex flex-col gap-3">
                          {service.details.map((detail, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-sm text-text-secondary leading-relaxed">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent shrink-0 mt-0.5">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      
                      <button 
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent('selectService', { detail: service.name }));
                          const contactEl = document.getElementById('contact');
                          if (contactEl) {
                            contactEl.scrollIntoView({ behavior: 'smooth' });
                          }
                        }} 
                        className="block text-center w-full py-3.5 border border-accent text-accent rounded-xl font-semibold text-sm transition-all duration-300 hover:bg-accent hover:text-bg-main shadow-[0_0_15px_rgba(192,155,104,0.15)] hover:shadow-[0_0_20px_rgba(192,155,104,0.4)] mt-auto shrink-0 cursor-pointer"
                      >
                        Đăng ký tư vấn gói này
                      </button>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            <div className="text-center mt-12">
              <Link 
                to="/courses" 
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full border border-accent text-accent hover:bg-accent hover:text-bg-main font-semibold text-sm transition-all shadow-[0_0_15px_rgba(192,155,104,0.2)]"
              >
                <span>Xem chi tiết toàn bộ khóa học & dịch vụ</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ServicesSection;
