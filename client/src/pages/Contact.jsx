import React, { useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import ContactSection from '../components/ContactSection/ContactSection';
import FAQSection from '../components/FAQSection/FAQSection';

const Contact = () => {
  const { pageSettings } = useData();
  const page = pageSettings?.contact || {};

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-[110px] pb-[100px] bg-bg-main min-h-screen">
      {/* Banner */}
      <div className="container-custom mb-14 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-widest mb-4">
          {page.badge || 'Tư Vấn & Tuyển Sinh'}
        </div>
        <h1 className="text-3xl md:text-5xl font-bold font-secondary text-text-primary mb-4">
          {page.title || 'Liên Hệ MVD Photoshop Academy'}
        </h1>
        <p className="text-text-secondary max-w-[700px] mx-auto text-sm md:text-base leading-relaxed whitespace-pre-line">
          {page.description || 'Đội ngũ tư vấn viên và giảng viên của học viện luôn sẵn sàng đồng hành, định hướng lộ trình học tập và giải đáp mọi thắc mắc của bạn.'}
        </p>
      </div>

      {/* Main Contact Section */}
      <ContactSection />

      {/* FAQ Section */}
      <div className="mt-16">
        <FAQSection />
      </div>
    </div>
  );
};

export default Contact;
