import React from 'react';

// ============================================================================
// The small "CATALYST 7.0 · ..." label (eyebrow) with the symbolic logo in front of the text,
// instead of the little dot / icon.
//
//   <CatalystTag textClassName="...">CATALYST 7.0 · MOMENTS OF LEADERSHIP</CatalystTag>   full pill
//   <TagMark />                                                                              just the logo chip
//
// The logo sits on a white round chip: its beige segments would nearly vanish on the cream
// background otherwise. Uses the files generated in /assets/brand/ (no other dependency).
// ============================================================================
const MARK_SIZES = {
  sm: { chip: 'h-6 w-6', img: 'h-4', w: 13, h: 16 },
  md: { chip: 'h-9 w-9', img: 'h-6', w: 20, h: 24 },
  lg: { chip: 'h-11 w-11', img: 'h-7', w: 23, h: 28 },
} as const;

export const TagMark: React.FC<{ className?: string; size?: keyof typeof MARK_SIZES }> = ({ className = '', size = 'sm' }) => (
  <span
    aria-hidden="true"
    className={`inline-flex ${MARK_SIZES[size].chip} shrink-0 items-center justify-center rounded-full bg-white shadow-[0_1px_4px_rgba(201,54,43,0.25)] ring-1 ring-[#C9362B]/15 ${className}`}
  >
    <picture>
      <source
        type="image/webp"
        srcSet="/assets/brand/catalyst-mark-128.webp 1x, /assets/brand/catalyst-mark-256.webp 2x"
      />
      <img
        src="/assets/brand/catalyst-mark-512.png"
        alt=""
        width={MARK_SIZES[size].w}
        height={MARK_SIZES[size].h}
        decoding="async"
        draggable={false}
        className={`block ${MARK_SIZES[size].img} w-auto select-none`}
      />
    </picture>
  </span>
);

export const CatalystTag: React.FC<{
  children: React.ReactNode;
  className?: string;
  textClassName?: string;
}> = ({ children, className = '', textClassName = '' }) => (
  <span
    className={`inline-flex max-w-full items-center gap-2.5 rounded-md border border-[#C9362B]/30 bg-[#C9362B]/5 py-1 pl-1.5 pr-3 ${className}`}
  >
    <TagMark />
    <span
      className={`font-['Montserrat',sans-serif] text-[10px] font-bold uppercase tracking-[0.25em] text-[#C9362B] ${textClassName}`}
    >
      {children}
    </span>
  </span>
);

export default CatalystTag;
