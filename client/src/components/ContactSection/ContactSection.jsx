import { useState } from 'react';
import api from '../../services/api';

const ContactSection = () => {
  const [formData, setFormData] = useState({ name: '', phone: '', date: '', email: '', message: '' });
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Đang gửi...');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Đã có lỗi xảy ra');
      }

      if (data.success) {
        setStatus('Gửi thành công! Chúng tôi sẽ liên hệ sớm.');
        setFormData({ name: '', phone: '', date: '', email: '', message: '' });
      }
    } catch (err) {
      setStatus('Lỗi: ' + err.message);
    }
  };

  return (
    <section id="contact" className="py-[100px] bg-bg-secondary border-t border-glass relative">
      <div className="container-custom grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="font-secondary text-[40px] mb-6 text-accent leading-tight">Bạn đã sẵn sàng để kể câu chuyện của mình chưa?</h2>
          <p className="text-text-secondary text-lg mb-12">Hãy để lại thông tin, chúng tôi sẽ liên hệ lại với bạn trong thời gian sớm nhất để tư vấn chi tiết về các gói dịch vụ.</p>
          
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-full bg-accent text-bg-main flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              </div>
              <div>
                <h4 className="font-secondary text-xl mb-1 text-white">Hotline</h4>
                <p className="text-text-secondary">0869528304</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-full bg-accent text-bg-main flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </div>
              <div>
                <h4 className="font-secondary text-xl mb-1 text-white">Email</h4>
                <p className="text-text-secondary">ougvn.it2@gmail.com</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <form onSubmit={handleSubmit} className="glass-panel p-10 rounded-2xl flex flex-col gap-6">
            
            <div className="flex flex-col gap-2">
              <label className="text-text-secondary text-sm font-medium">Họ và tên</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="w-full bg-white/5 border border-glass rounded-lg py-3 px-4 text-white focus:outline-none focus:border-accent transition-colors" placeholder="Nhập họ tên của bạn" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-text-secondary text-sm font-medium">Số điện thoại</label>
                <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required className="w-full bg-white/5 border border-glass rounded-lg py-3 px-4 text-white focus:outline-none focus:border-accent transition-colors" placeholder="Nhập số điện thoại" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-text-secondary text-sm font-medium">Ngày dự kiến chụp/sửa</label>
                <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-white/5 border border-glass rounded-lg py-3 px-4 text-white focus:outline-none focus:border-accent transition-colors [color-scheme:dark]" />
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-text-secondary text-sm font-medium">Email</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required className="w-full bg-white/5 border border-glass rounded-lg py-3 px-4 text-white focus:outline-none focus:border-accent transition-colors" placeholder="Nhập email của bạn" />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-text-secondary text-sm font-medium">Lời nhắn</label>
              <textarea value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} rows="4" className="w-full bg-white/5 border border-glass rounded-lg py-3 px-4 text-white focus:outline-none focus:border-accent transition-colors resize-y min-h-[100px]" placeholder="Bạn muốn chúng tôi hỗ trợ gì?"></textarea>
            </div>
            
            <button type="submit" disabled={status === 'Đang gửi...'} className="w-full py-4 mt-2 bg-accent text-bg-main rounded-lg font-bold text-lg transition-colors hover:bg-accent-hover disabled:opacity-50">Gửi yêu cầu tư vấn</button>
            {status && <p className={`text-center text-sm ${status.includes('Lỗi') ? 'text-[#ff6b6b]' : 'text-[#a8e6cf]'}`}>{status}</p>}
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
