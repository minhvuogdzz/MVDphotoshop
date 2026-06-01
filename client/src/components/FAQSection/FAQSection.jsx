import { useState, useEffect } from 'react';
import api from '../../services/api';

const FAQSection = () => {
  const [faqs, setFaqs] = useState([]);
  const [activeFAQ, setActiveFAQ] = useState(null);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const { data } = await api.get('/faq');
        setFaqs(data);
      } catch (err) {
        console.error('Failed to fetch FAQs', err);
      }
    };
    fetchFAQs();
  }, []);

  const defaultFaqs = [
    { _id: 1, question: 'Thời gian hoàn thành bộ ảnh là bao lâu?', answer: 'Thông thường, thời gian hậu kì và hoàn thiện bộ ảnh sẽ mất từ 3 đến 7 ngày làm việc tùy thuộc vào số lượng và mức độ phức tạp của ảnh. Tuy nhiên, nếu bạn cần gấp, chúng tôi có gói dịch vụ Express (có phụ phí) hỗ trợ hoàn thiện trong 24-48 giờ.' },
    { _id: 2, question: 'Tôi có thể yêu cầu chỉnh sửa lại sau khi nhận ảnh không?', answer: 'Có, mỗi gói dịch vụ đều hỗ trợ chỉnh sửa lại miễn phí từ 1 đến 2 lần nếu bạn chưa ưng ý về các chi tiết nhỏ. Sau số lần này hoặc yêu cầu sửa đổi lớn, chúng tôi sẽ tính phí chỉnh sửa phát sinh tùy theo thực tế.' },
    { _id: 3, question: 'Làm sao để tôi gửi ảnh gốc cho bạn?', answer: 'Bạn có thể tải toàn bộ ảnh gốc lên Google Drive cá nhân, tạo thư mục riêng và gửi link cho chúng tôi với quyền truy cập "Bất kỳ ai có liên kết". Chúng tôi sẽ trực tiếp lấy file gốc chất lượng cao từ đó để thao tác.' },
    { _id: 4, question: 'Có hỗ trợ trả file định dạng PSD không?', answer: 'Mặc định file giao phẩm cuối cùng là JPEG chất lượng cao (hoặc TIFF nếu có yêu cầu từ đầu). Việc giao file nguồn PSD (kèm đầy đủ các layer hậu kì) sẽ có mức giá riêng vì đây thuộc về bản quyền chất xám, mong bạn thông cảm.' },
  ];

  const data = faqs.length > 0 ? faqs : defaultFaqs;

  return (
    <section className="py-[100px] bg-bg-main relative">
      <div className="container-custom max-w-[800px] mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-[40px] mb-4 text-accent">Câu hỏi thường gặp</h2>
        </div>

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
