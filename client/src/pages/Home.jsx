import { useEffect } from 'react';
import HeroSection from '../components/HeroSection/HeroSection';
import PortfolioSection from '../components/PortfolioSection/PortfolioSection';
import ResourcesSpotlightSection from '../components/Resources/ResourcesSpotlightSection';
import TestimonialSection from '../components/TestimonialSection/TestimonialSection';
import FAQSection from '../components/FAQSection/FAQSection';
import ContactSection from '../components/ContactSection/ContactSection';

const Home = () => {
  useEffect(() => {
    window.scrollTo(0, 0);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-active');
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* 1. Hero 3D Banner */}
      <HeroSection />

      {/* 2. Portfolio Tác Phẩm */}
      <div className="reveal-on-scroll">
        <PortfolioSection />
      </div>

      {/* 3. Kho Tài Nguyên Chia Sẻ (Resources Spotlight) */}
      <div className="reveal-on-scroll">
        <ResourcesSpotlightSection />
      </div>

      {/* 4. Đánh Giá Từ Học Viên & Khách Hàng */}
      <div className="reveal-on-scroll">
        <TestimonialSection />
      </div>

      {/* 5. Câu Hỏi Thường Gặp */}
      <div className="reveal-on-scroll">
        <FAQSection />
      </div>

      {/* 6. Tuyển Sinh & Tư Vấn Liên Hệ */}
      <div className="reveal-on-scroll">
        <ContactSection />
      </div>
    </>
  );
};

export default Home;
