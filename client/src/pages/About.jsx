import React, { useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { Link } from 'react-router-dom';

const About = () => {
  const { about, pageSettings } = useData();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const data = about || {};
  const page = pageSettings?.about || {};
  const academyImages = Array.isArray(data.images) ? data.images : [];
  const mainImage = academyImages.length > 0 ? academyImages[0] : '/avt.jpeg';

  // Parse story text into paragraphs (supports line breaks configured in Admin)
  const rawStory = data.story || data.description || '';
  const storyParagraphs = rawStory
    ? rawStory.split(/\n\s*\n|\n/).map(p => p.trim()).filter(Boolean)
    : [];

  return (
    <div className="pt-[120px] md:pt-[135px] pb-[100px] bg-bg-main min-h-screen text-text-primary">
      {/* Top Banner Hero - Clean, Elegant Typography */}
      <div className="max-w-[860px] mx-auto px-4 sm:px-6 mb-14 text-center">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[11px] font-medium tracking-wider uppercase mb-3">
          {page.badge || 'Học Viện Hậu Kỳ Chuyên Nghiệp'}
        </span>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-normal font-secondary text-text-primary mb-3 tracking-normal">
          {page.title || data.title || 'Về MVD Photoshop Academy'}
        </h1>
        {(page.description || data.slogan) && (
          <p className="text-text-secondary max-w-[620px] mx-auto text-sm sm:text-base leading-relaxed font-light">
            {page.description || data.slogan}
          </p>
        )}
      </div>

      {/* Main Narrative Section: Sticky Left Column when width > 920px */}
      <div className="max-w-[1060px] mx-auto px-4 sm:px-6 mb-20">
        <div className="flex flex-col min-[920px]:flex-row gap-8 lg:gap-14 items-start relative">
          
          {/* Left Column: Portrait - Sticky when width > 920px */}
          <div className="w-full min-[920px]:w-[380px] lg:min-[920px]:w-[420px] shrink-0 min-[920px]:sticky min-[920px]:top-[100px] self-start">
            <div className="relative rounded-xl overflow-hidden border border-black/10 dark:border-white/10 bg-black/40 shadow-2xl aspect-[4/5] w-full max-w-[420px] mx-auto min-[920px]:max-w-none">
              <img
                src={mainImage}
                alt={data.name || 'Dương Minh Vương'}
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-5 right-5 pointer-events-none">
                <p className="font-secondary text-xl font-medium text-white">
                  {data.name || 'Dương Minh Vương'}
                </p>
                {data.role && (
                  <p className="text-accent text-xs font-light mt-0.5">
                    {data.role}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Narrative Story (100% Configurable from Admin) */}
          <div className="flex-1 flex flex-col gap-4 text-text-secondary text-sm sm:text-[15px] leading-relaxed min-w-0">
            <div>
              {data.storySubtitle && (
                <span className="text-xs uppercase tracking-widest text-accent font-medium block mb-1">
                  {data.storySubtitle}
                </span>
              )}
              {data.storyTitle && (
                <h2 className="text-xl sm:text-2xl md:text-[26px] font-normal text-text-primary font-secondary leading-snug">
                  {data.storyTitle}
                </h2>
              )}
            </div>

            {/* Render dynamic paragraphs written in Admin */}
            {storyParagraphs.length > 0 ? (
              <div className="space-y-3.5 text-text-secondary">
                {storyParagraphs.map((para, idx) => (
                  <p key={idx} className="leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>
            ) : (
              <p className="leading-relaxed">
                Chào mừng bạn đến với {data.academyName || 'MVD Photoshop Academy'}. Hãy cập nhật nội dung giới thiệu câu chuyện học viện trong trang Quản trị (Admin).
              </p>
            )}

            {/* Artistic Philosophy Pull-quote (Configured from Admin) */}
            {data.quote && (
              <blockquote className="my-2 p-4 rounded-lg bg-black/5 dark:bg-white/5 border-l-2 border-accent text-accent/90 italic text-sm leading-relaxed">
                &ldquo;{data.quote}&rdquo;
              </blockquote>
            )}

            {/* Specialty Skills Tags from Admin */}
            {Array.isArray(data.skills) && data.skills.length > 0 && (
              <div className="pt-2 border-t border-black/10 dark:border-white/10 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-text-secondary/70 mr-1">Định hướng chuyên môn:</span>
                {data.skills.map((tag, i) => (
                  <span key={i} className="px-2.5 py-0.5 rounded-full bg-accent/10 text-accent/90 border border-accent/20">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Triết lý & Tầm nhìn / Sứ mệnh (Optional - rendered if configured in Admin) */}
      {(data.vision || data.mission) && (
        <div className="max-w-[1060px] mx-auto px-4 sm:px-6 mb-20">
          <div className="p-6 sm:p-8 rounded-2xl glass-panel grid grid-cols-1 md:grid-cols-2 gap-8">
            {data.vision && (
              <div>
                <span className="text-xs uppercase tracking-wider text-accent font-medium block mb-2">
                  Tầm nhìn học viện
                </span>
                <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                  {data.vision}
                </p>
              </div>
            )}

            {data.mission && (
              <div>
                <span className="text-xs uppercase tracking-wider text-accent font-medium block mb-2">
                  Sứ mệnh đào tạo
                </span>
                <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                  {data.mission}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Visual Gallery: Real Photos from Studio & Activities */}
      {academyImages.length > 1 && (
        <div className="max-w-[1060px] mx-auto px-4 sm:px-6 mb-20">
          <div className="mb-6">
            <span className="text-xs uppercase tracking-widest text-accent font-medium block">
              Góc hoạt động
            </span>
            <h2 className="text-xl sm:text-2xl font-normal text-text-primary font-secondary mt-1">
              Hình ảnh thực tế & Không gian làm việc
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            {academyImages.slice(1).map((img, i) => (
              <div key={i} className="rounded-lg overflow-hidden aspect-[4/3] border border-black/10 dark:border-white/10 bg-black/40 group">
                <img 
                  src={img} 
                  alt={`Hoạt động học viện ${i + 1}`} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Elegant, Understated CTA */}
      <div className="max-w-[1060px] mx-auto px-4 sm:px-6 text-center">
        <div className="py-10 px-6 rounded-2xl glass-panel">
          <h2 className="text-xl sm:text-2xl font-normal text-text-primary font-secondary mb-3">
            Bắt đầu hành trình nâng tầm tư duy hình ảnh
          </h2>
          <p className="text-text-secondary text-sm max-w-[540px] mx-auto mb-6 leading-relaxed">
            Khám phá các khóa đào tạo thực chiến từ cơ bản đến nâng cao hoặc tham khảo kho tài nguyên được chia sẻ miễn phí.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/courses"
              className="px-6 py-2.5 rounded-full bg-accent hover:bg-accent-hover text-neutral-950 font-bold text-xs sm:text-sm transition-all shadow-md"
            >
              Xem các khóa học
            </Link>
            <Link
              to="/resources"
              className="px-6 py-2.5 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-text-primary font-medium text-xs sm:text-sm transition-colors border border-black/10 dark:border-white/10"
            >
              Kho tài nguyên miễn phí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
