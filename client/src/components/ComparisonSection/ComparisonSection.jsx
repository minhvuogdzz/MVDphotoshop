import { useData } from '../../contexts/DataContext';
import LoadingSpinner from '../common/LoadingSpinner';
import ComparisonSlider from './ComparisonSlider';

const ComparisonSection = () => {
  const { comparisons, loading } = useData();

  if (loading) {
    return (
      <section className="py-[100px] bg-bg-main border-t border-white/5">
        <LoadingSpinner />
      </section>
    );
  }

  if (!comparisons || comparisons.length === 0) {
    return null; // Don't show section if no data
  }

  return (
    <section id="before-after" className="py-[100px] bg-bg-main border-t border-white/5 relative overflow-hidden">
      {/* Decorative Blur Elements */}
      <div className="absolute top-40 left-[-10%] w-64 h-64 bg-accent/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-[-10%] w-80 h-80 bg-accent/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="container-custom relative z-10">
        <div className="text-center mb-16 fade-in-up">
          <h2 className="text-[40px] mb-4 text-accent">Before & After</h2>
          <p className="text-text-secondary max-w-[600px] mx-auto">Sự khác biệt hoàn hảo tạo nên những tác phẩm nhiếp ảnh vượt thời gian.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          {comparisons.map((item, index) => (
            <div key={item._id} className="fade-in-up" style={{ animationDelay: `${index * 150}ms` }}>
              <ComparisonSlider 
                beforeImage={item.beforeImage} 
                afterImage={item.afterImage} 
                title={item.title} 
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
