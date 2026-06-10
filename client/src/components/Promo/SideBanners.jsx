import { useData } from '../../contexts/DataContext';

const SideBanners = () => {
  const { promo } = useData();

  if (!promo || !promo.desktopEnabled || !promo.images || promo.images.length === 0) {
    return null;
  }

  // To create a seamless infinite scroll, we duplicate the images array
  const duplicatedImages = [...promo.images, ...promo.images, ...promo.images];

  return (
    <>
      {/* Left Banner - Marquee Up */}
      <div className="fixed top-[88px] left-0 bottom-0 w-[120px] xl:w-[150px] z-10 hidden lg:block overflow-hidden pointer-events-none opacity-80">
        <div className="flex flex-col gap-4 animate-marquee-up py-4">
          {duplicatedImages.map((img, idx) => (
            <img 
              key={`left-${idx}`} 
              src={img} 
              alt="Promo" 
              className="w-full aspect-[4/6] object-cover rounded-r-lg shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-glass"
            />
          ))}
        </div>
      </div>

      {/* Right Banner - Marquee Down */}
      <div className="fixed top-[88px] right-0 bottom-0 w-[120px] xl:w-[150px] z-10 hidden lg:block overflow-hidden pointer-events-none opacity-80">
        <div className="flex flex-col gap-4 animate-marquee-down py-4">
          {duplicatedImages.map((img, idx) => (
            <img 
              key={`right-${idx}`} 
              src={img} 
              alt="Promo" 
              className="w-full aspect-[4/6] object-cover rounded-l-lg shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-glass"
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default SideBanners;
