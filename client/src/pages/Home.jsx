import { useEffect, lazy, Suspense } from 'react';
import HeroSection from '../components/HeroSection/HeroSection';
import FloatingSocials from '../components/FloatingSocials/FloatingSocials';

// Lazy load below-the-fold components
const PortfolioSection = lazy(() => import('../components/PortfolioSection/PortfolioSection'));
const CollabSection = lazy(() => import('../components/CollabSection/CollabSection'));
const ComparisonSection = lazy(() => import('../components/ComparisonSection/ComparisonSection'));
const ServicesSection = lazy(() => import('../components/ServicesSection/ServicesSection'));
const AboutSection = lazy(() => import('../components/AboutSection/AboutSection'));
const TestimonialSection = lazy(() => import('../components/TestimonialSection/TestimonialSection'));
const FAQSection = lazy(() => import('../components/FAQSection/FAQSection'));
const ContactSection = lazy(() => import('../components/ContactSection/ContactSection'));

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
      <Suspense fallback={<div className="h-[200px] flex items-center justify-center bg-bg-main" />}>
        <div className="reveal-on-scroll"><PortfolioSection /></div>
        <div className="reveal-on-scroll"><CollabSection /></div>
        <div className="reveal-on-scroll"><ComparisonSection /></div>
        <div className="reveal-on-scroll"><ServicesSection /></div>
        <div className="reveal-on-scroll"><AboutSection /></div>
        <div className="reveal-on-scroll"><TestimonialSection /></div>
        <div className="reveal-on-scroll"><FAQSection /></div>
        <div className="reveal-on-scroll"><ContactSection /></div>
      </Suspense>
      <FloatingSocials />
    </>
  );
};

export default Home;
