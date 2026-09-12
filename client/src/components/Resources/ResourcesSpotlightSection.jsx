import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import ResourceCard from './ResourceCard';
import LoadingSpinner from '../common/LoadingSpinner';

const ResourcesSpotlightSection = () => {
  const { resources, pageSettings, loading } = useData();
  const navigate = useNavigate();

  const homeSettings = pageSettings?.home || {};
  const badge = homeSettings.resourcesBadge || 'Học Liệu & Công Cụ Độc Quyền';
  const title = homeSettings.resourcesTitle || 'Kho Tài Nguyên Hậu Kỳ & Đồ Họa';
  const subtitle = homeSettings.resourcesDesc || 'Hệ thống Actions, Presets Lightroom, Camera RAW, Font chữ và Stock chất lượng cao được tuyển chọn bởi MVD Academy, chia sẻ cho học viên và cộng đồng.';

  const featured = (resources && resources.length > 0) ? resources.slice(0, 3) : [];

  return (
    <section id="resources-spotlight" className="py-[100px] bg-bg-secondary border-t border-glass relative">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-wider mb-3">
              {badge}
            </span>
            <h2 className="text-[34px] md:text-[40px] font-bold font-secondary text-text-primary">
              {title}
            </h2>
            <p className="text-text-secondary text-sm md:text-base max-w-[650px] mt-2 leading-relaxed">
              {subtitle}
            </p>
          </div>

          <Link
            to="/resources"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full border border-accent text-accent hover:bg-accent hover:text-neutral-950 text-sm font-semibold transition-all shadow-[0_0_15px_rgba(192,155,104,0.15)] shrink-0"
          >
            <span>Khám phá toàn bộ kho tài nguyên</span>
            <span>&rarr;</span>
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {featured.map(item => (
              <ResourceCard
                key={item._id}
                item={item}
                onSelect={() => navigate('/resources')}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-14 px-6 rounded-3xl glass-panel border border-glass mb-10">
            <p className="text-sm text-text-secondary">Kho tài nguyên đang được cập nhật các bộ Action & Preset mới nhất.</p>
            <Link to="/resources" className="text-sm text-accent font-bold mt-3 inline-block hover:underline">
              Truy cập trang tài nguyên &rarr;
            </Link>
          </div>
        )}

        {/* Thông tin hỗ trợ kho tài nguyên dung lượng lớn */}
        <div className="p-6 md:p-8 rounded-2xl glass-panel border border-glass flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-accent/20 border border-accent/30 text-accent flex items-center justify-center text-2xl shrink-0">
              📦
            </div>
            <div>
              <h4 className="text-text-primary font-bold text-base md:text-lg mb-1">
                Cần kho học liệu & stock RAW dung lượng lớn?
              </h4>
              <p className="text-xs md:text-sm text-text-secondary">
                MVD Photoshop Academy cung cấp liên kết Google Drive 100GB+ stock RAW chụp máy ảnh cao cấp và mockup PSD chuyên nghiệp cho học viên.
              </p>
            </div>
          </div>

          <Link
            to="/resources"
            className="px-6 py-2.5 rounded-full bg-accent text-neutral-950 font-bold text-xs md:text-sm hover:bg-accent-hover transition-colors whitespace-nowrap shadow-[0_0_15px_rgba(192,155,104,0.3)] shrink-0"
          >
            Mở Kho Tài Nguyên
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ResourcesSpotlightSection;
