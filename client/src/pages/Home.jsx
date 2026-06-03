import { useEffect } from 'react';
import HeroSection from '../components/HeroSection/HeroSection';
import PortfolioSection from '../components/PortfolioSection/PortfolioSection';
import ServicesSection from '../components/ServicesSection/ServicesSection';
import AboutSection from '../components/AboutSection/AboutSection';
import TestimonialSection from '../components/TestimonialSection/TestimonialSection';
import FAQSection from '../components/FAQSection/FAQSection';
import ContactSection from '../components/ContactSection/ContactSection';
import FloatingSocials from '../components/FloatingSocials/FloatingSocials';

const Home = () => {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-active');
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <HeroSection />
      <div className="reveal-on-scroll"><PortfolioSection /></div>
      <div className="reveal-on-scroll"><ServicesSection /></div>
      <div className="reveal-on-scroll"><AboutSection /></div>
      <div className="reveal-on-scroll"><TestimonialSection /></div>
      <div className="reveal-on-scroll"><FAQSection /></div>
      <div className="reveal-on-scroll"><ContactSection /></div>
      <FloatingSocials />
    </>
  );
};

export default Home;
