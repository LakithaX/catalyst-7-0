import React from 'react';

export const MerchBrandStatement: React.FC = () => {
  return (
    <section className="relative w-full bg-[#FAF6EE] py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-t border-[#252321]/10 overflow-hidden">
      {/* Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none">
        <span className="font-serif text-[20vw] font-black text-[#252321]">
          武士道
        </span>
      </div>

      {/* ── Traditional Bonsai Watermark (Left Flank) ── */}
      <div
        className="pointer-events-none absolute left-2 sm:left-6 lg:left-12 xl:left-20 bottom-0 z-0 select-none hidden lg:flex items-end justify-start max-w-[220px] lg:max-w-[260px] h-auto opacity-[0.06]"
        aria-hidden="true"
      >
        <img
          src="/assets/illustrations/gdj-bonsai-tree-8143900.svg"
          alt=""
          className="w-full h-auto object-contain filter grayscale"
        />
      </div>

      {/* ── Bushido Guardian Sentinel Illustration (Desktop Flanking Sentinel) ── */}
      <div
        className="pointer-events-none absolute right-2 sm:right-6 lg:right-12 xl:right-20 bottom-0 z-10 select-none hidden lg:flex items-end justify-end max-w-[280px] lg:max-w-[320px] xl:max-w-[360px] h-auto opacity-95 transition-opacity"
        aria-hidden="true"
      >
        {/* Soft Crimson Backlight */}
        <div
          className="absolute -inset-6 rounded-full blur-3xl opacity-35 pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(201, 54, 43, 0.22) 0%, transparent 70%)",
          }}
        />
        <img
          src="/assets/illustrations/benkageyama-samurai-5135974_1920.png"
          alt="Catalyst 7.0 Bushido Samurai"
          className="w-full h-auto object-contain filter drop-shadow-[0_16px_36px_rgba(37,35,33,0.2)]"
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Japanese Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-[#C9362B]/30 bg-[#C9362B]/5 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C9362B]" />
          <span className="font-['Noto_Sans_JP',sans-serif] text-[10px] tracking-[0.3em] text-[#C9362B] uppercase font-bold">
            CATALYST 7.0 · アイデンティティと遺産 (IDENTITY & LEGACY)
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#C9362B]" />
        </div>

        {/* Heading */}
        <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-extrabold uppercase tracking-tight text-[#252321] leading-tight mb-6">
          NOT JUST A COLLECTION. <br />
          <span className="text-[#C9362B] italic">A CULTURE.</span>
        </h2>

        {/* Japanese Mon Divider */}
        <div className="flex items-center justify-center gap-4 my-6">
          <span className="h-[1.5px] w-16 sm:w-24 bg-gradient-to-r from-transparent to-[#C9362B]" />
          <span className="w-2 h-2 rotate-45 bg-[#C9362B]" />
          <span className="h-[1.5px] w-16 sm:w-24 bg-gradient-to-l from-transparent to-[#C9362B]" />
        </div>

        {/* ── Bushido Guardian Sentinel Illustration (Mobile & Tablet Dedicated Showcase) ── */}
        <div
          className="flex lg:hidden flex-col items-center justify-center my-7 select-none pointer-events-none"
          aria-hidden="true"
        >
          <div className="relative max-w-[190px] sm:max-w-[240px] h-auto">
            <div
              className="absolute -inset-4 rounded-full blur-2xl opacity-40 pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(201, 54, 43, 0.25) 0%, transparent 70%)",
              }}
            />
            <img
              src="/assets/illustrations/benkageyama-samurai-5135974_1920.png"
              alt="Catalyst 7.0 Guardian Sentinel"
              className="w-full h-auto object-contain filter drop-shadow-[0_16px_32px_rgba(37,35,33,0.22)]"
            />
          </div>
          <div className="flex items-center gap-2 mt-3 text-[9.5px] sm:text-[11px] font-['Noto_Sans_JP',sans-serif] tracking-[0.25em] text-[#C9362B] uppercase font-bold">
            <span className="w-6 sm:w-8 h-[1px] bg-[#C9362B]/40" />
            <span>守護者 · GUARDIAN OF CULTURE</span>
            <span className="w-6 sm:w-8 h-[1px] bg-[#C9362B]/40" />
          </div>
        </div>

        {/* Supporting statement */}
        <p className="font-sans text-base sm:text-lg text-[#4A4540] leading-relaxed max-w-2xl mx-auto">
          Every piece carries a part of the Catalyst story. Created for the people who make the experience what it is.
        </p>

        {/* Mon Signature Mark */}
        <div className="mt-10 text-[#736B63] font-['Noto_Sans_JP',sans-serif] text-[10px] tracking-[0.35em] uppercase font-bold">
          AIESEC IN SLIIT · LEADERSHIP DEVELOPMENT SEMINAR
        </div>
      </div>
    </section>
  );
};
