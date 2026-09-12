import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import { useData } from '../../contexts/DataContext';
import LoadingSpinner from '../common/LoadingSpinner';

import 'swiper/css';
import 'swiper/css/pagination';

const AboutSection = () => {
  const { about, pageSettings, loading } = useData();

  const homeSettings = pageSettings?.home || {};
  const academyName = about?.academyName || 'MVD Photoshop Academy';
  const slogan = about?.slogan || 'Học Viện Đào Tạo & Hậu Kỳ Ảnh Chuyên Nghiệp';
  const description = about?.description || 'MVD Photoshop Academy là học viện chuyên sâu trong lĩnh vực đào tạo Retouching thương mại và cung cấp các giải pháp hậu kỳ ảnh chuyên nghiệp hàng đầu. Với tôn chỉ "Thực chiến - Chuẩn mực - Tận tâm", MVD Academy định hình tư duy thẩm mỹ và chuẩn hóa kỹ thuật xử lý hình ảnh cho hàng nghìn học viên và đối tác trên toàn quốc.';
  const images = (about?.images && about.images.length > 0) ? about.images : [];

  return (
    <section id="about" className="py-[100px] bg-bg-main border-t border-glass relative">
      <div className="container-custom">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-wider mb-3">
            {homeSettings.aboutBadge || 'Về Chúng Tôi • About Us'}
          </span>
          <h2 className="font-secondary text-[36px] md:text-[42px] font-bold mb-4 text-accent">
            {academyName}
          </h2>
          <p className="text-text-secondary max-w-[650px] mx-auto text-sm md:text-base leading-relaxed">
            {slogan}
          </p>
          <div className="w-[60px] h-1 bg-accent mt-6 mx-auto rounded-full"></div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Cột thông tin Học viện / Tổ chức */}
            <div className="lg:col-span-7 glass-panel p-8 sm:p-10 rounded-3xl border border-white/10 flex flex-col gap-6">
              <div>
                <span className="text-accent text-xs font-bold uppercase tracking-widest block mb-2">
                  Tầm Nhìn & Sứ Mệnh
                </span>
                <h3 className="font-secondary text-2xl sm:text-3xl font-bold text-white leading-tight">
                  Tiên phong chuẩn hóa quy trình đào tạo Retouching & Đồ họa ảnh
                </h3>
              </div>
              
              <p className="text-text-secondary text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {description}
              </p>

              {/* 3 Trụ cột hoạt động của Học viện */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col">
                  <span className="text-accent font-bold text-base mb-1">80% Thực Chiến</span>
                  <p className="text-xs text-text-secondary leading-relaxed">Học viên thao tác trực tiếp trên bộ file RAW gốc thương mại.</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col">
                  <span className="text-accent font-bold text-base mb-1">Kèm Cặp 1-1</span>
                  <p className="text-xs text-text-secondary leading-relaxed">Giảng viên sửa bài chi tiết từng pixel, hỗ trợ vướng mắc 24/7.</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col">
                  <span className="text-accent font-bold text-base mb-1">Kho Học Liệu VIP</span>
                  <p className="text-xs text-text-secondary leading-relaxed">Đặc quyền sử dụng bộ Actions, Presets và tài nguyên độc quyền.</p>
                </div>
              </div>

              {/* Nút tìm hiểu thêm sang trang /about */}
              <div className="pt-2">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-accent hover:bg-accent-hover text-bg-main font-bold text-sm transition-all shadow-[0_0_20px_rgba(192,155,104,0.3)]"
                >
                  <span>Tìm hiểu chi tiết về Học viện</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </Link>
              </div>
            </div>

            {/* Cột Slider Ảnh Học viện & Studio */}
            <div className="lg:col-span-5">
              {images.length > 0 ? (
                <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
                  <Swiper
                    modules={[Pagination, Autoplay]}
                    spaceBetween={10}
                    slidesPerView={1}
                    autoplay={{ delay: 3500, disableOnInteraction: false }}
                    pagination={{ clickable: true }}
                    className="w-full aspect-[4/5] bg-black"
                  >
                    {images.map((img, index) => (
                      <SwiperSlide key={index}>
                        <div className="w-full h-full relative group overflow-hidden">
                          <img 
                            src={img} 
                            alt={`MVD Academy Studio ${index + 1}`} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                          <div className="absolute bottom-6 left-6 right-6 text-left pointer-events-none">
                            <span className="text-[11px] font-bold uppercase tracking-widest text-accent mb-1 block">Không Gian Học Tập & Làm Việc</span>
                            <h4 className="text-white font-secondary font-bold text-base">MVD Photoshop Academy</h4>
                          </div>
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              ) : (
                <div className="aspect-[4/5] flex items-center justify-center border border-dashed border-white/10 rounded-3xl bg-white/5">
                  <p className="text-text-secondary text-sm">Chưa có ảnh trong thư viện Học viện</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AboutSection;
