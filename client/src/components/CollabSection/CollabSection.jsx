import { useData } from '../../contexts/DataContext';
import LoadingSpinner from '../common/LoadingSpinner';
import Marquee from '../common/Marquee';

const CollabSection = () => {
  const { collaborations, loading } = useData();

  if (!collaborations || collaborations.length === 0) return null;

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
          <div className="relative overflow-hidden w-full px-0 sm:px-4">
            <Marquee 
              items={collaborations.slice(0, Math.ceil(collaborations.length / 2))}
              duration="35s"
              renderItem={(item) => (
                <div className="group relative overflow-hidden transition-all duration-500 bg-white/5 border border-glass rounded-xl flex flex-col h-full shadow-lg h-[450px]">
                  <div className="overflow-hidden flex-shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full aspect-[4/6] object-cover block rounded-t-xl transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-secondary text-xl mb-1 text-white truncate">Bộ ảnh: {item.title}</h3>
                      {item.location && <p className="text-xs text-accent mb-3 truncate">Location: {item.location}</p>}
                    </div>
                    <a 
                      href={item.driveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-2.5 text-center border border-accent text-accent rounded-lg transition-all duration-300 hover:bg-accent hover:text-bg-main font-medium text-xs mt-auto shadow-[0_0_15px_rgba(192,155,104,0.1)] hover:shadow-[0_0_20px_rgba(192,155,104,0.3)]"
                      title="Xem drive sản phẩm chi tiết"
                    >
                      Xem drive chi tiết
                    </a>
                  </div>
                </div>
              )}
            />
            
            {collaborations.length > 1 && (
              <div className="mt-8">
                <Marquee 
                  items={collaborations.slice(Math.ceil(collaborations.length / 2)).reverse()}
                  reverse={true}
                  duration="35s"
                  renderItem={(item) => (
                    <div className="group relative overflow-hidden transition-all duration-500 bg-white/5 border border-glass rounded-xl flex flex-col h-full shadow-lg h-[450px]">
                      <div className="overflow-hidden flex-shrink-0">
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className="w-full aspect-[4/6] object-cover block rounded-t-xl transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-secondary text-xl mb-1 text-white truncate">Bộ ảnh: {item.title}</h3>
                          {item.location && <p className="text-xs text-accent mb-3 truncate">Location: {item.location}</p>}
                        </div>
                        <a 
                          href={item.driveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full py-2.5 text-center border border-accent text-accent rounded-lg transition-all duration-300 hover:bg-accent hover:text-bg-main font-medium text-xs mt-auto shadow-[0_0_15px_rgba(192,155,104,0.1)] hover:shadow-[0_0_20px_rgba(192,155,104,0.3)]"
                          title="Xem drive sản phẩm chi tiết"
                        >
                          Xem drive chi tiết
                        </a>
                      </div>
                    </div>
                  )}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default CollabSection;
