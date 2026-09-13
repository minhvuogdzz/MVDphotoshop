import mongoose from 'mongoose';

const PageSettingsSchema = new mongoose.Schema({
  home: {
    heroBadge: { type: String, default: 'Học Viện Retouching Chuyên Nghiệp' },
    heroTitle: { type: String, default: 'MVD Photoshop Academy' },
    heroSubtitle: { type: String, default: 'Nơi kiến tạo tư duy nghệ thuật & kỹ thuật Retouching chuẩn quốc tế' },
    heroCta1Text: { type: String, default: 'Khám phá khóa học' },
    heroCta1Link: { type: String, default: '/courses' },
    heroCta2Text: { type: String, default: 'Kho tài nguyên miễn phí' },
    heroCta2Link: { type: String, default: '/resources' },
    heroImage: { type: String, default: '' },
    heroLayout: { type: String, default: 'academy_banner' }, // 'academy_banner' or 'cube_grid'

    aboutBadge: { type: String, default: 'Phương Pháp Thực Chiến' },
    aboutTitle: { type: String, default: 'Chuẩn Hóa Kỹ Thuật, Nâng Tầm Đôi Mắt Thẩm Mỹ' },
    aboutDesc: { type: String, default: 'Tại MVD Photoshop Academy, chúng tôi không chỉ dạy bạn cách bấm công cụ, mà dẫn dắt bạn tư duy như một Art Director thực thụ: hiểu cấu trúc khối da, cảm nhận độ sâu ánh sáng và điều phối sắc màu điện ảnh để bức ảnh có hồn nhất.' },
    aboutImage: { type: String, default: '' },
    aboutPoint1Title: { type: String, default: '80% Thực hành' },
    aboutPoint1Desc: { type: String, default: 'Thực chiến trực tiếp trên file ảnh RAW gốc của các bộ ảnh cưới và fashion cao cấp.' },
    aboutPoint2Title: { type: String, default: 'Kèm cặp 1-1' },
    aboutPoint2Desc: { type: String, default: 'Giảng viên sửa bài chi tiết, hỗ trợ giải đáp kỹ thuật trọn đời sau khóa học.' },

    resourcesBadge: { type: String, default: 'Học Liệu & Công Cụ Độc Quyền' },
    resourcesTitle: { type: String, default: 'Kho Tài Nguyên Hậu Kỳ' },
    resourcesDesc: { type: String, default: 'Trọn bộ Actions, Presets, Brushes và Font chữ do MVD Academy dày công xây dựng, chia sẻ cho học viên và cộng đồng.' },

    coursesBadge: { type: String, default: 'Lộ Trình Đào Tạo Nghề' },
    coursesTitle: { type: String, default: 'Các Khóa Học & Dịch Vụ Tiêu Biểu' },
    coursesDesc: { type: String, default: 'Lựa chọn chương trình học và gói dịch vụ hậu kỳ phù hợp với định hướng của bạn.' },

    showcaseBadge: { type: String, default: 'Minh Chứng Chất Lượng' },
    showcaseTitle: { type: String, default: 'Tác Phẩm Học Viên & Dự Án' },
    showcaseDesc: { type: String, default: 'Những dự án và tác phẩm thực tế được thực hiện tỉ mỉ bởi học viên và giảng viên học viện.' },

    ctaBadge: { type: String, default: 'Khởi Đầu Hành Trình Của Bạn' },
    ctaTitle: { type: String, default: 'Nâng Tầm Kỹ Năng Cùng MVD Photoshop Academy' },
    ctaDesc: { type: String, default: 'Đăng ký nhận lộ trình học tập miễn phí hoặc đặt lịch tư vấn 1-1 trực tiếp cùng giảng viên ngay hôm nay.' },
    ctaBtn1Text: { type: String, default: 'Đăng ký tư vấn ngay' },
    ctaBtn1Link: { type: String, default: '/contact' },
    ctaBtn2Text: { type: String, default: 'Khám phá kho tài nguyên' },
    ctaBtn2Link: { type: String, default: '/resources' }
  },
  courses: {
    badge: { type: String, default: 'Chương Trình Đào Tạo Thực Chiến' },
    title: { type: String, default: 'Khóa Học & Dịch Vụ MVD Academy' },
    description: { type: String, default: 'Tất cả chương trình đào tạo và gói dịch vụ hậu kỳ được quản lý và cấu hình trực tiếp từ ban giảng huấn học viện.' },
    bannerImage: { type: String, default: '' }
  },
  resources: {
    badge: { type: String, default: 'Học Liệu & Công Cụ Độc Quyền' },
    title: { type: String, default: 'Kho Tài Nguyên MVD Academy' },
    description: { type: String, default: 'Trọn bộ Action, Preset, Brush, Font và Mockup cao cấp phục vụ cho quá trình học tập và làm nghề Retoucher chuyên nghiệp.' },
    bannerImage: { type: String, default: '' },
    categories: {
      type: [String],
      default: [
        'Photoshop Action',
        'Preset Lightroom',
        'Brush Pack',
        'Texture & Overlay',
        'PSD Mockup',
        'Font Việt Hóa',
        'Tài liệu Giáo trình'
      ]
    },
    popularTags: {
      type: [String],
      default: [
        'Retouch Da',
        'High-End',
        'Dodge & Burn',
        'Nàng Thơ',
        'Stock RAW',
        'Font Việt Hóa',
        'Cinematic',
        'Màu Cưới'
      ]
    },
    defaultInstructions: {
      type: String,
      default: '• Khởi động phần mềm Adobe Photoshop hoặc Lightroom phiên bản tương thích.\n• Click đúp vào file đã tải về (hoặc vào menu File > Load Actions / Presets / Brushes).\n• Áp dụng vào ảnh của bạn và tinh chỉnh Opacity hoặc thông số theo mong muốn.'
    }
  },
  about: {
    badge: { type: String, default: 'Học Viện Hậu Kỳ Chuyên Nghiệp' },
    title: { type: String, default: 'Về MVD Photoshop Academy' },
    description: { type: String, default: 'Nơi kiến tạo tư duy nghệ thuật & kỹ thuật Retouching chuẩn quốc tế' },
    bannerImage: { type: String, default: '' }
  },
  showcase: {
    badge: { type: String, default: 'Tác Phẩm & Dự Án' },
    title: { type: String, default: 'Toàn Bộ Tác Phẩm & Dự Án' },
    description: { type: String, default: 'Tất cả những dự án, những khoảnh khắc nghệ thuật được thực hiện tỉ mỉ và tâm huyết nhất.' },
    bannerImage: { type: String, default: '' }
  },
  contact: {
    badge: { type: String, default: 'Tư Vấn & Tuyển Sinh' },
    title: { type: String, default: 'Liên Hệ MVD Photoshop Academy' },
    description: { type: String, default: 'Đội ngũ tư vấn viên và giảng viên của học viện luôn sẵn sàng đồng hành, định hướng lộ trình học tập và giải đáp mọi thắc mắc của bạn.' },
    hotline: { type: String, default: '0869528304' },
    email: { type: String, default: 'ougvn.it2@gmail.com' },
    address: { type: String, default: 'Hà Nội, Việt Nam' },
    workingHours: { type: String, default: '08:00 - 22:00 hàng ngày' },
    zalo: { type: String, default: '0869528304' },
    facebook: { type: String, default: 'https://facebook.com' },
    bannerImage: { type: String, default: '' }
  }
}, { timestamps: true });

export default mongoose.model('PageSettings', PageSettingsSchema);
