import { useState, useEffect } from 'react';
import api from '../../services/api';

const ServicesSection = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data } = await api.get('/services');
        setServices(data);
      } catch (err) {
        console.error('Failed to fetch services', err);
      }
    };
    fetchServices();
  }, []);

  const defaultServices = [
    {
      _id: 1,
      name: 'Gói Chân Dung',
      type: 'Gói sửa',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop',
      price: 'Bắt đầu từ 500.000đ',
      details: ['Sửa 20 ảnh chi tiết', 'Tặng thêm 2 ảnh', 'Bảo hành link ảnh 1 năm']
    },
    {
      _id: 2,
      name: 'Gói Ảnh Cưới',
      type: 'Gói sửa',
      image: 'https://images.unsplash.com/photo-1518193855018-05fc08595cb6?w=500&auto=format&fit=crop',
      price: 'Bắt đầu từ 1.500.000đ',
      details: ['Sửa 50 ảnh chi tiết', 'Làm da cao cấp', 'Blend màu nghệ thuật', 'Bảo hành link ảnh 2 năm']
    },
    {
      _id: 3,
      name: 'Phục Hồi Ảnh Cũ',
      type: 'Dịch vụ sửa',
      image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=500&auto=format&fit=crop',
      price: 'Liên hệ',
      details: ['Phục hồi chi tiết', 'Lên màu ảnh đen trắng', 'Giao file chất lượng cao']
    }
  ];

  const data = services.length > 0 ? services : defaultServices;

  return (
    <section id="services" className="py-[100px] bg-bg-secondary">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-[40px] mb-4 text-accent">Dịch vụ & Bảng giá</h2>
          <p className="text-text-secondary max-w-[600px] mx-auto">Mang đến những giải pháp hậu kì hoàn hảo nhất cho từng bức ảnh của bạn.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.map(service => (
            <div key={service._id} className="glass-panel rounded-2xl overflow-hidden flex flex-col transition-transform duration-400 hover:-translate-y-2">
              <div className="relative h-[250px] overflow-hidden">
                <img src={service.image} alt={service.name} className="w-full h-full object-cover transition-transform duration-400 hover:scale-110" />
                <span className="absolute top-4 right-4 bg-bg-glass backdrop-blur-sm text-accent px-4 py-1.5 rounded-full text-sm font-semibold uppercase tracking-wider">{service.type}</span>
              </div>
              
              <div className="p-8 flex flex-col flex-1">
                <h3 className="font-secondary text-2xl mb-2">{service.name}</h3>
                <p className="text-2xl font-semibold text-accent mb-6 pb-6 border-b border-glass">{service.price}</p>
                
                <ul className="list-none p-0 m-0 mb-8 flex-1 flex flex-col gap-4">
                  {service.details.map((detail, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-text-secondary">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent min-w-[16px]">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      {detail}
                    </li>
                  ))}
                </ul>
                
                <a href="#contact" className="block text-center w-full py-4 border border-accent text-accent rounded-lg font-semibold transition-all duration-200 hover:bg-accent hover:text-bg-main mt-auto">Đặt lịch ngay</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
