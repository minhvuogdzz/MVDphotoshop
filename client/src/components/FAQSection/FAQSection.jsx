import { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import LoadingSpinner from '../common/LoadingSpinner';

const FAQSection = () => {
  const { faq, loading } = useData();
  const [activeFAQ, setActiveFAQ] = useState(null);

  const data = faq || [];

  return (
    <section className="py-[100px] bg-bg-main relative">
      <div className="container-custom max-w-[800px] mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-[40px] mb-4 text-accent">Câu hỏi thường gặp</h2>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="flex flex-col gap-4">
          {data.map(faq => (
            <div key={faq._id} className="border-b border-glass pb-4 transition-all duration-200 hover:border-accent">
              <button 
                className="w-full text-left py-4 px-2 flex justify-between items-center bg-transparent border-none text-text-primary text-lg font-medium cursor-pointer transition-colors duration-200 hover:text-accent"
                onClick={() => setActiveFAQ(faq)}
              >
                {faq.question}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="min-w-[24px] text-accent"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
            </div>
          ))}
        </div>
        )}
      </div>

      {activeFAQ && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-black/80 backdrop-blur-sm z-[2000] flex items-center justify-center p-4 animate-[fadeIn_0.3s_ease]" onClick={() => setActiveFAQ(null)}>
          <div className="glass-panel w-full max-w-[600px] p-10 rounded-2xl relative animate-[slideUp_0.4s_ease]" onClick={e => e.stopPropagation()}>
            <button className="absolute top-6 right-6 bg-transparent border-none text-text-secondary cursor-pointer transition-colors duration-200 hover:text-accent" onClick={() => setActiveFAQ(null)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <h3 className="font-secondary text-[28px] text-accent mb-6 pr-8 leading-tight">{activeFAQ.question}</h3>
            <div className="w-[40px] h-1 bg-accent mb-6"></div>
            <p className="text-text-secondary text-lg leading-relaxed">{activeFAQ.answer}</p>
          </div>
        </div>
      )}
    </section>
  );
};

export default FAQSection;
