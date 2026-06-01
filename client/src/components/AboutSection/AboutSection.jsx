import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import api from '../../services/api';

import 'swiper/css';
import 'swiper/css/pagination';

const AboutSection = () => {
  const [aboutData, setAboutData] = useState(null);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const { data } = await api.get('/about');
        setAboutData(data);
      } catch (err) {
        console.error('Failed to fetch about data', err);
      }
    };
    fetchAbout();
  }, []);

  const defaultAbout = {
    title: 'Câu chuyện thương hiệu',
    name: 'Nguyễn Văn A',
    description: 'Với hơn 5 năm kinh nghiệm trong lĩnh vực Retouching, tôi luôn tâm niệm rằng mỗi bức ảnh đều mang một linh hồn và một câu chuyện riêng. Công việc của tôi không chỉ là chỉnh sửa cho đẹp, mà là thổi hồn vào bức ảnh, tôn vinh những vẻ đẹp chân thật và lưu giữ trọn vẹn những cảm xúc khoảnh khắc.',
    skills: ['Photoshop', 'Lightroom', 'Skin Retouching', 'Color Grading'],
    education: 'Cử nhân Thiết kế Đồ họa - Đại học Mỹ thuật Công nghiệp',
    images: []
  };

  const data = aboutData?.title ? aboutData : defaultAbout;

  return (
    <section id="about" className="py-[100px] bg-bg-main border-y border-glass relative">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="font-secondary text-[40px] mb-4 text-accent">{data.title}</h2>
          <div className="w-[60px] h-1 bg-accent mb-8 mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Cột thông tin CV */}
          <div className="lg:col-span-6 glass-panel p-8 rounded-2xl">
            <h3 className="font-secondary text-3xl mb-2 text-white">{data.name || 'Hồ sơ chuyên gia'}</h3>
            <p className="text-accent uppercase tracking-widest text-sm mb-6 font-semibold">Chuyên viên Retouching</p>
            
            <p className="text-text-secondary leading-relaxed mb-8 whitespace-pre-line">{data.description}</p>
            
            {data.education && (
              <div className="mb-8">
                <h4 className="text-white font-semibold mb-3 border-b border-glass pb-2 inline-block">Học vấn & Kinh nghiệm</h4>
                <p className="text-text-secondary whitespace-pre-line">{data.education}</p>
              </div>
            )}

            {data.skills && data.skills.length > 0 && (
              <div>
                <h4 className="text-white font-semibold mb-3 border-b border-glass pb-2 inline-block">Kỹ năng chuyên môn</h4>
                <div className="flex flex-wrap gap-2">
                  {data.skills.map((skill, index) => (
                    <span key={index} className="px-4 py-2 bg-white/5 border border-glass rounded-full text-sm text-text-secondary hover:text-accent hover:border-accent transition-colors">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cột Slider Ảnh */}
          <div className="lg:col-span-6">
            {data.images && data.images.length > 0 ? (
              <Swiper
                modules={[Pagination, Autoplay]}
                spaceBetween={20}
                slidesPerView={1}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                pagination={{ clickable: true, dynamicBullets: true }}
                className="w-full pb-12"
              >
                {data.images.map((img, index) => (
                  <SwiperSlide key={index}>
                    <div className="group overflow-hidden rounded-2xl border border-glass aspect-[4/6]">
                      <img 
                        src={img} 
                        alt={`CV Image ${index + 1}`} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <div className="aspect-[4/6] flex items-center justify-center border border-dashed border-glass rounded-2xl">
                <p className="text-text-secondary">Chưa có ảnh trong thư viện</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
