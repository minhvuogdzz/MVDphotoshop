import React from 'react';

const ResourceCard = ({ item, onSelect }) => {
  if (!item) return null;

  return (
    <div className="group relative bg-white/85 dark:bg-[#131110] border border-black/10 dark:border-white/10 rounded-2xl p-5 hover:border-accent/50 shadow-sm dark:shadow-none hover:shadow-xl dark:hover:shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_25px_rgba(192,155,104,0.15)] transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Top Header Row: Category, VIP/HOT Badges, File Extension */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="bg-black/5 dark:bg-white/10 text-text-primary text-xs font-semibold px-3 py-1 rounded-full">
            {item.category || 'Tài nguyên'}
          </span>

          <div className="flex items-center gap-2">
            {item.isVip && (
              <span className="bg-amber-500/20 text-amber-500 dark:text-amber-300 font-bold px-2.5 py-0.5 rounded-full text-xs border border-amber-500/30 tracking-wider">
                VIP
              </span>
            )}
            {item.isHot && (
              <span className="bg-rose-500/20 text-rose-500 dark:text-rose-400 font-bold px-2.5 py-0.5 rounded-full text-xs border border-rose-500/30 tracking-wider">
                HOT
              </span>
            )}
            {item.fileType && (
              <span className="font-mono text-xs font-bold text-text-secondary uppercase tracking-wider">
                {item.fileType.startsWith('.') ? item.fileType : `.${item.fileType}`}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 
          onClick={() => onSelect(item)}
          className="text-text-primary text-lg font-bold mt-3.5 mb-2 font-secondary leading-snug cursor-pointer group-hover:text-accent transition-colors"
        >
          {item.title}
        </h3>

        {/* Description */}
        <p className="text-text-secondary text-sm line-clamp-2 leading-relaxed mb-4">
          {item.description || 'Tài nguyên hậu kỳ độc quyền từ MVD Photoshop Academy dành cho học viên và cộng đồng.'}
        </p>

        {/* Hashtags Row */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {item.tags.map((tag, idx) => (
              <span 
                key={idx}
                className="bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-text-secondary text-xs px-2.5 py-1 rounded-full hover:border-accent/40 hover:text-accent transition-colors"
              >
                {tag.startsWith('#') ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Footer Row: Size, Rating, Action Button */}
      <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between gap-3 mt-auto">
        <div className="text-xs sm:text-sm text-text-secondary font-medium flex items-center gap-1.5">
          <span>{item.fileSize || '0.1 MB'}</span>
          <span>•</span>
          <span className="text-amber-500 dark:text-amber-400 flex items-center gap-0.5">
            ★ <span className="text-text-secondary">{(item.rating || 5.0).toFixed(1)}</span>
          </span>
        </div>

        <button
          onClick={() => onSelect(item)}
          className="bg-black/5 dark:bg-white/10 hover:bg-accent hover:text-neutral-950 text-text-primary px-4 py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          <span>Chi tiết</span>
        </button>
      </div>
    </div>
  );
};

export default ResourceCard;
