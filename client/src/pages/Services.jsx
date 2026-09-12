import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Services = () => {
  const { services, pageSettings, loading } = useData();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('Tất cả');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const serviceList = Array.isArray(services) ? services : [];
  const types = ['Tất cả', ...Array.from(new Set(serviceList.map(s => s.type).filter(Boolean)))];

  const filtered = serviceList.filter(item => {
    if (activeFilter === 'Tất cả') return true;
    return item.type === activeFilter;
  });

  const handleBookService = (serviceName) => {
    navigate('/contact');
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('selectService', { detail: serviceName }));
    }, 150);
  };

  return (
    <div className="pt-[110px] pb-[100px] bg-bg-main min-h-screen">
      {/* Banner Header */}
      <div className="container-custom mb-14 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-widest mb-4">
          Dịch Vụ Hậu Kỳ Thương Mại
        </div>
        <h1 className="text-3xl md:text-5xl font-bold font-secondary text-text-primary mb-4">
          Bảng Giá & <span className="text-accent">Dịch Vụ Chỉnh Sửa Ảnh</span>
        </h1>
        <p className="text-text-secondary max-w-[700px] mx-auto text-sm md:text-base leading-relaxed">
          MVD cung cấp các gói hậu kỳ hình ảnh cao cấp từ ảnh cưới, ảnh gia đình, concept nghệ thuật đến ảnh thương mại beauty, cam kết bảo hành file và đúng tiến độ.
        </p>
      </div>

      <div className="container-custom">
        {/* Category Filters */}
        {types.length > 2 && (
          <div className="flex items-center justify-center gap-3 mb-12 flex-wrap">
            {types.map(t => (
              <button
                key={t}
                onClick={() => setActiveFilter(t)}
                className={`px-6 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeFilter === t
                    ? 'bg-accent text-neutral-950 shadow-[0_0_15px_rgba(192,155,104,0.35)] font-bold'
                    : 'bg-black/5 dark:bg-white/5 text-text-secondary hover:text-text-primary border border-black/5 dark:border-white/5 hover:bg-black/10 dark:hover:bg-white/10'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {/* Services Grid */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 glass-panel border border-glass rounded-3xl p-8 max-w-[600px] mx-auto">
            <div className="w-16 h-16 rounded-full bg-accent/15 text-accent flex items-center justify-center mx-auto mb-4 text-2xl">
              🎨
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">Chưa có dịch vụ nào</h3>
            <p className="text-text-secondary text-sm mb-6">
              Các gói dịch vụ đang được cập nhật. Bạn có thể thêm và cấu hình trong trang Admin.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {filtered.map(service => (
              <div
                key={service._id}
                className="glass-panel border border-glass rounded-3xl overflow-hidden flex flex-col hover:border-accent/40 transition-all shadow-xl hover:-translate-y-2 group"
              >
                {/* Image */}
                <div className="relative h-[250px] overflow-hidden bg-black/40">
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-secondary text-sm">
                      MVD Retouching
                    </div>
                  )}
                  {service.type && (
                    <span className="absolute top-4 right-4 bg-black/75 backdrop-blur-md text-accent border border-accent/30 text-xs font-semibold px-3.5 py-1 rounded-full uppercase tracking-wider">
                      {service.type}
                    </span>
                  )}
                </div>

                {/* Body */}
                <div className="p-7 flex flex-col flex-1">
                  <h3 className="font-secondary text-2xl font-bold text-text-primary mb-2 group-hover:text-accent transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-2xl font-bold text-accent mb-5 pb-5 border-b border-glass">
                    {service.price}
                  </p>

                  {/* Bullet points */}
                  {Array.isArray(service.details) && service.details.length > 0 && (
                    <ul className="space-y-3 mb-8 flex-1">
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
                    onClick={() => handleBookService(service.name)}
                    className="w-full py-3.5 rounded-xl border border-accent text-accent hover:bg-accent hover:text-neutral-950 font-semibold text-sm transition-all shadow-[0_0_15px_rgba(192,155,104,0.15)] hover:shadow-[0_0_20px_rgba(192,155,104,0.4)] mt-auto cursor-pointer"
                  >
                    Đặt lịch dịch vụ này
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quy trình làm việc tiêu chuẩn */}
        <div className="rounded-3xl glass-panel border border-glass p-8 md:p-14">
          <div className="text-center mb-10">
            <span className="text-xs uppercase tracking-widest text-accent font-bold">Cam Kết Chất Lượng</span>
            <h2 className="text-2xl md:text-3xl font-bold font-secondary text-text-primary mt-1">
              Quy Trình Nhận & Xử Lý Ảnh Chuyên Nghiệp
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
              <span className="text-3xl font-bold text-accent mb-2 block font-secondary">01</span>
              <h4 className="text-text-primary font-bold text-base mb-1">Gửi file & Yêu cầu</h4>
              <p className="text-xs text-text-secondary leading-relaxed">Gửi link file ảnh gốc RAW hoặc JPEG chất lượng cao kèm yêu cầu về tone màu và phong cách retouch.</p>
            </div>
            <div className="p-6 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
              <span className="text-3xl font-bold text-accent mb-2 block font-secondary">02</span>
              <h4 className="text-text-primary font-bold text-base mb-1">Sửa mẫu & Duyệt màu</h4>
              <p className="text-xs text-text-secondary leading-relaxed">MVD thực hiện demo 1 ảnh mẫu gửi khách duyệt trước về tone màu và độ mịn da trước khi làm hàng loạt.</p>
            </div>
            <div className="p-6 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
              <span className="text-3xl font-bold text-accent mb-2 block font-secondary">03</span>
              <h4 className="text-text-primary font-bold text-base mb-1">Hậu kỳ chi tiết</h4>
              <p className="text-xs text-text-secondary leading-relaxed">Tiến hành xử lý toàn bộ bộ ảnh tỉ mỉ từng chi tiết theo đúng tiêu chuẩn đã duyệt.</p>
            </div>
            <div className="p-6 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
              <span className="text-3xl font-bold text-accent mb-2 block font-secondary">04</span>
              <h4 className="text-text-primary font-bold text-base mb-1">Bàn giao & Bảo hành</h4>
              <p className="text-xs text-text-secondary leading-relaxed">Bàn giao link Drive file ảnh chất lượng full HD. Bảo hành lưu trữ link và file ảnh từ 3 tuần đến 2 tháng.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
