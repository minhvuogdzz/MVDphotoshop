import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import ComparisonSection from '../components/ComparisonSection/ComparisonSection';

const ACADEMY_COURSES = [
  {
    id: 'course-beauty',
    title: 'Khóa Retouching Chân Dung & Beauty Cao Cấp',
    badge: 'Khóa Chuyên Sâu',
    duration: '12 Buổi • Thực hành 100% trên RAW',
    level: 'Từ cơ bản đến chuyên nghiệp',
    description: 'Chương trình chuẩn quốc tế về giải phẫu khối mặt, kỹ thuật Frequency Separation đa lớp, Dodge & Burn giữ nguyên texture lỗ chân lông thật và xử lý tóc tơ chi tiết.',
    highlights: [
      'Làm chủ tư duy ánh sáng và giải phẫu khuôn mặt chân dung',
      'Kỹ thuật Dodge & Burn vi mô (Micro) & vĩ mô (Macro)',
      'Tách tần số Frequency Separation cao cấp không bết khối da',
      'Xử lý mắt, môi, răng và tóc bay tự nhiên chuẩn thương mại',
      'Tặng trọn bộ Action Retouch Beauty độc quyền của MVD Academy'
    ],
    price: 'Liên hệ tư vấn lộ trình'
  },
  {
    id: 'course-color',
    title: 'Khóa Blend Màu Điện Ảnh & Fashion Lookbook',
    badge: 'Khóa Bán Chạy',
    duration: '10 Buổi • File RAW thực tế',
    level: 'Đã biết Photoshop cơ bản',
    description: 'Định hình phong cách màu sắc cá nhân, làm chủ vòng tròn màu sắc Color Harmony, Curve nâng cao, Color Grading và tạo dựng các tone màu cưới/thời trang hot trend.',
    highlights: [
      'Lý thuyết màu sắc Color Theory và Color Psychology',
      'Kỹ thuật đọc biểu đồ Waveform, Vectorscope và Curves',
      'Blend màu cưới trong trẻo, tone màu phim điện ảnh (Cinematic)',
      'Tạo và xuất bộ LUT/Preset độc quyền mang dấu ấn riêng',
      'Thực hành trực tiếp trên các bộ ảnh Lookbook thời trang lớn'
    ],
    price: 'Liên hệ tư vấn lộ trình'
  },
  {
    id: 'course-master',
    title: 'Khóa Photoshop Nghề Toàn Diện (All-in-One)',
    badge: 'Khóa Toàn Diện',
    duration: '24 Buổi • Cam kết tay nghề',
    level: 'Mọi đối tượng (Từ người mới bắt đầu)',
    description: 'Lộ trình đào tạo toàn diện từ số 0 để trở thành Retoucher thương mại chuyên nghiệp: từ thao tác phần mềm, cắt ghép, xử lý bối cảnh đến retouch da và blend màu đỉnh cao.',
    highlights: [
      'Thành thạo 100% công cụ Adobe Photoshop, Camera RAW & Capture One',
      'Kỹ thuật cắt ghép Pen Tool chuẩn xác và mở rộng không gian bối cảnh',
      'Quy trình làm việc (Workflow) tốc độ cao và khoa học cho Studio',
      'Trang bị đầy đủ kỹ năng để ứng tuyển Studio lớn hoặc nhận việc Freelance',
      'Cấp chứng nhận tốt nghiệp & Hỗ trợ việc làm sau khóa học'
    ],
    price: 'Ưu đãi học viên sớm'
  },
  {
    id: 'course-1on1',
    title: 'Khóa Kèm Cặp 1-1 Master Độc Quyền',
    badge: 'VIP Master',
    duration: 'Lịch học linh hoạt theo học viên',
    level: 'Chủ Studio / Retoucher chuyên nghiệp',
    description: 'Lộ trình cá nhân hóa trực tiếp cùng Giảng viên Founder Dương Minh Vương, giải quyết trực tiếp các bài toán hậu kỳ hóc búa trên chính bộ ảnh thực tế của bạn.',
    highlights: [
      'Giáo trình thiết kế riêng 100% theo nhu cầu và mục tiêu cụ thể',
      'Giảng viên kèm cặp 1-1 trực tiếp hoặc online qua Ultraview/Meet',
      'Chuẩn hóa toàn bộ quy trình hậu kỳ và kiểm soát màu màn hình chuẩn',
      'Tư vấn chiến lược mở Studio và xây dựng portfolio thu hút khách hàng',
      'Đặc quyền hỗ trợ kỹ thuật và giải đáp trọn đời không giới hạn'
    ],
    price: 'Giới hạn số lượng học viên'
  }
];

const Courses = () => {
  const { pageSettings } = useData();
  const navigate = useNavigate();

  const page = pageSettings?.courses || {};

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleEnroll = (courseTitle) => {
    navigate('/contact');
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('selectService', { detail: `Khóa học: ${courseTitle}` }));
    }, 150);
  };

  return (
    <div className="pt-[110px] pb-[100px] bg-bg-main min-h-screen">
      {/* Banner Header */}
      <div className="container-custom mb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-widest mb-4">
          {page.badge || 'Học Viện Đào Tạo Nghề Retouching'}
        </div>
        <h1 className="text-3xl md:text-5xl font-bold font-secondary text-text-primary mb-4">
          Chương Trình Đào Tạo <span className="text-accent">MVD Photoshop Academy</span>
        </h1>
        <p className="text-text-secondary max-w-[720px] mx-auto text-sm md:text-base leading-relaxed">
          {page.description || 'Đào tạo tư duy thẩm mỹ và kỹ thuật hậu kỳ thực chiến trên file RAW gốc, giúp học viên tự tin làm nghề hoặc làm việc tại các Studio ảnh hàng đầu.'}
        </p>
      </div>

      {/* 3 Cam kết đào tạo */}
      <div className="container-custom mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-7 rounded-3xl glass-panel flex flex-col">
            <div className="w-12 h-12 rounded-2xl bg-accent/20 text-accent flex items-center justify-center text-xl font-bold mb-4">
              🎯
            </div>
            <h3 className="font-secondary text-xl font-bold text-text-primary mb-2">80% Thực Hành Trên File RAW</h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Học viên được cấp kho ảnh RAW gốc độc quyền từ các bộ ảnh cưới và fashion cao cấp để thực chiến ngay trên lớp.
            </p>
          </div>

          <div className="p-7 rounded-3xl glass-panel flex flex-col">
            <div className="w-12 h-12 rounded-2xl bg-accent/20 text-accent flex items-center justify-center text-xl font-bold mb-4">
              🤝
            </div>
            <h3 className="font-secondary text-xl font-bold text-text-primary mb-2">Kèm Cặp 1-1 & Sửa Bài Tận Nơi</h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Giảng viên sửa từng layer, chỉ rõ từng điểm chưa chuẩn về khối và ánh sáng cho đến khi sản phẩm đạt độ hoàn thiện cao nhất.
            </p>
          </div>

          <div className="p-7 rounded-3xl glass-panel flex flex-col">
            <div className="w-12 h-12 rounded-2xl bg-accent/20 text-accent flex items-center justify-center text-xl font-bold mb-4">
              📦
            </div>
            <h3 className="font-secondary text-xl font-bold text-text-primary mb-2">Học Liệu & Hỗ Trợ Trọn Đời</h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Cấp quyền truy cập kho Actions, Presets, Brushes độc quyền của MVD Academy và hỗ trợ giải đáp nghề nghiệp trọn đời.
            </p>
          </div>
        </div>
      </div>

      {/* Danh sách các khóa học đào tạo */}
      <div className="container-custom mb-24">
        <div className="text-center mb-14">
          <span className="text-xs uppercase tracking-widest text-accent font-bold">Lộ Trình Đào Tạo</span>
          <h2 className="text-2xl md:text-4xl font-bold font-secondary text-text-primary mt-1">
            Các Khóa Học Chuyên Sâu
          </h2>
          <p className="text-text-secondary text-sm max-w-[600px] mx-auto mt-2">
            Lựa chọn chương trình học tập phù hợp với trình độ và mục tiêu nghề nghiệp của bạn.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {ACADEMY_COURSES.map(course => (
            <div
              key={course.id}
              className="glass-panel border border-glass rounded-3xl p-8 sm:p-10 flex flex-col justify-between hover:border-accent/40 transition-all shadow-xl hover:-translate-y-1.5 group relative"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                  <span className="px-3.5 py-1 rounded-full bg-accent/20 border border-accent/30 text-accent text-xs font-bold uppercase tracking-wider">
                    {course.badge}
                  </span>
                  <span className="text-xs text-text-secondary font-mono">
                    {course.duration}
                  </span>
                </div>

                <h3 className="font-secondary text-2xl font-bold text-text-primary mb-2 group-hover:text-accent transition-colors">
                  {course.title}
                </h3>
                <p className="text-xs text-accent font-medium mb-4">
                  Cấp độ: {course.level}
                </p>

                <p className="text-sm text-text-secondary leading-relaxed mb-6">
                  {course.description}
                </p>

                <div className="border-t border-glass pt-5 mb-8">
                  <span className="text-xs font-bold text-text-primary uppercase tracking-wider block mb-3">
                    Nội dung nổi bật của khóa học:
                  </span>
                  <ul className="space-y-2.5">
                    {course.highlights.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-text-secondary leading-relaxed">
                        <svg className="w-4 h-4 text-accent shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-glass flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-auto">
                <div>
                  <span className="text-xs text-text-secondary block">Học phí & Ưu đãi</span>
                  <span className="text-lg font-bold text-accent font-secondary">{course.price}</span>
                </div>
                <button
                  onClick={() => handleEnroll(course.title)}
                  className="px-7 py-3 rounded-xl bg-accent hover:bg-accent-hover text-neutral-950 font-bold text-sm transition-all shadow-[0_0_15px_rgba(192,155,104,0.3)] cursor-pointer text-center"
                >
                  Đăng ký tư vấn khóa này
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Before & After Section - Chuyển sang Khóa học để chứng minh kết quả đào tạo */}
      <div className="border-t border-glass pt-16">
        <ComparisonSection />
      </div>
    </div>
  );
};

export default Courses;
