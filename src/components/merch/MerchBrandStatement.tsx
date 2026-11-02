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
