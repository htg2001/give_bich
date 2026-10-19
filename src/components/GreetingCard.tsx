import React from 'react';
import { RotateCcw, Sparkles } from 'lucide-react';

export interface CardMessageData {
  recipient: string;
  title: string;
  paragraphs: string[];
  signature: string;
  occasion: string;
}

interface GreetingCardProps {
  data: CardMessageData;
  onReplay: () => void;
}

export const GreetingCard: React.FC<GreetingCardProps> = ({
  data,
  onReplay,
}) => {
  return (
    <div
      role="region"
      aria-label="Thiệp chúc mừng"
      data-testid="greeting-card"
      className="card-emerging relative z-30 max-w-[540px] w-full mx-auto my-2 px-6 py-7 md:px-10 md:py-9 text-center rounded-2xl bg-gradient-to-b from-[#fffefc] via-[#fffbf6] to-[#fff8f2] shadow-[0_20px_60px_rgba(142,48,88,0.2),0_2px_4px_rgba(0,0,0,0.03)] border border-rose-200/70 backdrop-blur-md"
    >
      {/* Decorative folded corner with shadow */}
      <div 
        className="absolute top-0 right-0 w-9 h-9 bg-gradient-to-bl from-rose-200/90 via-rose-100 to-[#fffefc] shadow-[-2px_2px_4px_rgba(130,82,93,0.12)] rounded-bl-xl pointer-events-none" 
      />

      {/* Decorative floral watermark corner SVGs (reliable across all devices) */}
      <div className="absolute top-3 left-4 text-rose-200 select-none pointer-events-none opacity-60">
        <svg className="w-5 h-5 fill-rose-300" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3" fill="#f43f5e" />
          <circle cx="12" cy="6" r="3" />
          <circle cx="12" cy="18" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="12" r="3" />
        </svg>
      </div>
      <div className="absolute bottom-3 right-4 text-rose-200 select-none pointer-events-none opacity-60">
        <svg className="w-5 h-5 fill-rose-300" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3" fill="#f43f5e" />
          <circle cx="12" cy="6" r="3" />
          <circle cx="12" cy="18" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="12" r="3" />
        </svg>
      </div>

      {/* Header Tag / Occasion */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold tracking-wider uppercase mb-3 shadow-xs">
        <Sparkles className="w-3 h-3 text-amber-500" />
        <span>{data.occasion}</span>
      </div>

      {/* Title */}
      <h2
        className="text-2xl md:text-3xl text-rose-900 font-extrabold tracking-tight mb-4 leading-snug"
        style={{ fontFamily: "'Be Vietnam Pro', system-ui, sans-serif" }}
      >
        {data.title}
      </h2>

      {/* Message Content */}
      <div className="space-y-3 text-sm md:text-base text-rose-950/85 leading-relaxed font-normal max-w-[440px] mx-auto text-center">
        {data.paragraphs.map((p, idx) => (
          <p key={idx} className="transition-all hover:text-rose-900">
            {p}
          </p>
        ))}
      </div>

      {/* Signature */}
      <div className="mt-5 pt-4 border-t border-rose-200/50 flex flex-col items-center">
        <div
          className="italic text-lg md:text-xl text-rose-700 font-bold tracking-wide"
          style={{ fontFamily: "'Be Vietnam Pro', system-ui, sans-serif" }}
        >
          {data.signature}
        </div>
      </div>

      {/* Interactive Action Buttons */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={onReplay}
          data-testid="replay-btn"
          className="px-3.5 py-2.5 rounded-full bg-white/95 hover:bg-rose-50 text-rose-700 font-semibold text-xs md:text-sm border border-rose-200 shadow-xs hover:shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-rose-600" />
          <span>Xem lại từ đầu ↻</span>
        </button>
      </div>
    </div>
  );
};
