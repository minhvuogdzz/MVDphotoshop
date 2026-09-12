import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useData } from '../../contexts/DataContext';

const ContactSection = () => {
  const { pageSettings } = useData();
  const contactInfo = pageSettings?.contact || {};

  const [formData, setFormData] = useState({ name: '', phone: '', date: '', email: '', message: '' });
  const [status, setStatus] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Listen to selectService event from ServicesSection
  useEffect(() => {
    const handleServiceSelect = (e) => {
      const serviceName = e.detail;
      if (serviceName) {
        setFormData(prev => ({
          ...prev,
          message: `Tôi muốn tư vấn và đặt lịch cho gói: "${serviceName}". Vui lòng phản hồi sớm cho tôi!`
        }));
      }
    };

    window.addEventListener('selectService', handleServiceSelect);
    return () => window.removeEventListener('selectService', handleServiceSelect);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate VN phone number format
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      setStatus({ type: 'error', text: 'Số điện thoại không hợp lệ (cần 10 chữ số).' });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: 'loading', text: 'Đang gửi thông tin...' });

    try {
      const { data } = await api.post('/contact', {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        date: formData.date || '',
        message: formData.message.trim() || ''
      });

      setStatus({ type: 'success', text: data.message || '✅ Gửi thành công! MVD sẽ liên hệ sớm nhất.' });
      setFormData({ name: '', phone: '', date: '', email: '', message: '' });
      setTimeout(() => setStatus({ type: '', text: '' }), 6000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Không thể kết nối máy chủ.';
      setStatus({ type: 'error', text: `Lỗi: ${errorMsg}` });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <section id="contact" className="py-[100px] bg-bg-secondary border-t border-glass relative">
      <div className="container-custom grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="font-secondary text-[36px] md:text-[40px] mb-6 text-accent leading-tight">
            {contactInfo.title || 'Bạn đã sẵn sàng để nâng tầm kỹ năng cùng MVD Academy?'}
          </h2>
          <p className="text-text-secondary text-base md:text-lg mb-12 whitespace-pre-line leading-relaxed">
            {contactInfo.description || 'Hãy để lại thông tin, chúng tôi sẽ liên hệ lại với bạn trong thời gian sớm nhất để tư vấn chi tiết về lộ trình học tập và gói dịch vụ.'}
          </p>
          
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-full bg-accent text-neutral-950 flex items-center justify-center shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              </div>
              <div>
                <h4 className="font-secondary text-lg mb-0.5 text-text-primary">Hotline / Zalo</h4>
                <p className="text-text-secondary font-mono text-sm">{contactInfo.hotline || '0869528304'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-full bg-accent text-neutral-950 flex items-center justify-center shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </div>
              <div>
                <h4 className="font-secondary text-lg mb-0.5 text-text-primary">Email</h4>
                <p className="text-text-secondary text-sm">{contactInfo.email || 'ougvn.it2@gmail.com'}</p>
              </div>
            </div>

            {contactInfo.address && (
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-full bg-accent text-neutral-950 flex items-center justify-center shrink-0 text-lg">
                  📍
                </div>
                <div>
                  <h4 className="font-secondary text-lg mb-0.5 text-text-primary">Địa chỉ Học viện</h4>
                  <p className="text-text-secondary text-sm">{contactInfo.address}</p>
                </div>
              </div>
            )}

            {contactInfo.workingHours && (
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-full bg-accent text-neutral-950 flex items-center justify-center shrink-0 text-lg">
                  ⏱️
                </div>
                <div>
                  <h4 className="font-secondary text-lg mb-0.5 text-text-primary">Thời gian làm việc</h4>
                  <p className="text-text-secondary text-sm">{contactInfo.workingHours}</p>
                </div>
              </div>
            )}
          </div>
        </div>


        <div>
          <form onSubmit={handleSubmit} className="glass-panel p-8 md:p-10 rounded-2xl flex flex-col gap-6 shadow-xl border border-black/10 dark:border-white/10">
            
            <div className="flex flex-col gap-2">
              <label className="text-text-secondary text-sm font-medium">Họ và tên</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="w-full bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg py-3 px-4 text-text-primary focus:outline-none focus:border-accent transition-colors" placeholder="Nhập họ tên của bạn" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-text-secondary text-sm font-medium">Số điện thoại</label>
                <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required className="w-full bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg py-3 px-4 text-text-primary focus:outline-none focus:border-accent transition-colors" placeholder="Nhập số điện thoại" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-text-secondary text-sm font-medium">Ngày dự kiến chụp/sửa</label>
                <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg py-3 px-4 text-text-primary focus:outline-none focus:border-accent transition-colors [color-scheme:light] dark:[color-scheme:dark]" />
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-text-secondary text-sm font-medium">Email</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required className="w-full bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg py-3 px-4 text-text-primary focus:outline-none focus:border-accent transition-colors" placeholder="Nhập email của bạn" />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-text-secondary text-sm font-medium">Lời nhắn</label>
              <textarea value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} rows="4" className="w-full bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg py-3 px-4 text-text-primary focus:outline-none focus:border-accent transition-colors resize-y min-h-[100px]" placeholder="Bạn muốn chúng tôi hỗ trợ gì?"></textarea>
            </div>
            
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full py-4 mt-2 bg-accent hover:bg-accent-hover text-neutral-950 rounded-xl font-bold text-lg transition-all duration-300 shadow-[0_4px_20px_rgba(192,155,104,0.3)] hover:shadow-[0_4px_25px_rgba(192,155,104,0.5)] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="w-5 h-5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                  <span>Đang gửi thông tin...</span>
                </>
              ) : (
                'Gửi yêu cầu tư vấn ngay'
              )}
            </button>

            {status.text && (
              <div 
                className={`p-4 rounded-xl text-center text-sm font-medium transition-all ${
                  status.type === 'success' 
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' 
                    : status.type === 'loading'
                    ? 'bg-accent/15 text-accent border border-accent/30 animate-pulse'
                    : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                }`}
              >
                {status.text}
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
