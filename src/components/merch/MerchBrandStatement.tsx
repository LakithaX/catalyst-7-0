import React from 'react';
import { Chars, Ill, KANJI_FONT } from './MerchDecor';

// Brand statement: text and artwork live in their own columns, so the samurai can never cover the headline.
// (Effects come from the page's useMerchMotion hook: data-reveal / data-chars.)
export const MerchBrandStatement: React.FC = () => {
  return (
    <section className="relative w-full overflow-hidden border-t border-[#252321]/10 bg-[#FAF6EE] px-4 pt-20 sm:px-6 sm:pt-28 lg:px-8">
      {/* giant faint kanji: "bushido" */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex select-none items-center justify-center">
        <span className="whitespace-nowrap text-[26vw] font-black leading-none text-[#252321]/[0.025] lg:text-[20vw]" style={{ fontFamily: KANJI_FONT }}>
          武士道
        </span>
      </div>

      {/* bonsai, far left, behind everything */}
      <Ill
        src="/assets/illustrations/gdj-bonsai-tree-8143900.svg"
        className="absolute bottom-0 left-4 z-0 hidden w-[220px] opacity-[0.05] grayscale xl:block 2xl:left-16 2xl:w-[260px]"
      />

      <div className="relative z-10 mx-auto grid max-w-7xl items-end gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)] lg:gap-12 xl:gap-20">
        {/* ── text column ── */}
        <div className="pb-20 text-center sm:pb-28 lg:self-center lg:py-28">
          <div data-reveal="fade" className="mb-6 inline-flex max-w-full items-center gap-2 rounded-md border border-[#C9362B]/30 bg-[#C9362B]/5 px-3 py-1">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#C9362B]" />
            <span className="font-['Noto_Sans_JP',sans-serif] text-[10px] font-bold uppercase tracking-[0.3em] text-[#C9362B]">
              CATALYST 7.0 · アイデンティティと遺産 (IDENTITY &amp; LEGACY)
            </span>
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#C9362B]" />
          </div>

          <h2
            data-chars
            aria-label="Not just a collection. A culture."
            className="brush-heading mx-auto mb-6 max-w-3xl font-['Jansina','Bison',sans-serif] text-4xl uppercase leading-[1.02] tracking-wide text-[#1B0209] sm:text-6xl xl:text-7xl"
          >
            <span className="block"><Chars text="NOT JUST A COLLECTION." /></span>
            <span className="block text-[#C9362B]"><Chars text="A CULTURE." /></span>
          </h2>

          <div data-reveal="scale" className="my-6 flex items-center justify-center gap-4">
            <span className="h-[1.5px] w-16 bg-gradient-to-r from-transparent to-[#C9362B] sm:w-24" />
            <span className="h-2 w-2 rotate-45 bg-[#C9362B]" />
            <span className="h-[1.5px] w-16 bg-gradient-to-l from-transparent to-[#C9362B] sm:w-24" />
          </div>

          {/* samurai for phones and tablets: in the flow, between divider and paragraph */}
          <div data-reveal="up" aria-hidden="true" className="my-7 flex select-none flex-col items-center lg:hidden">
            <div className="relative w-[200px] sm:w-[260px]">
              <div className="absolute -inset-4 rounded-full opacity-40 blur-2xl" style={{ background: 'radial-gradient(circle, rgba(201,54,43,0.25) 0%, transparent 70%)' }} />
              <Ill src="/assets/illustrations/benkageyama-samurai-5135974_1920.png" className="relative h-auto w-full object-contain drop-shadow-[0_16px_32px_rgba(37,35,33,0.22)]" />
            </div>
            <div className="mt-3 flex items-center gap-2 font-['Noto_Sans_JP',sans-serif] text-[10px] font-bold uppercase tracking-[0.25em] text-[#C9362B] sm:text-[11px]">
              <span className="h-px w-6 bg-[#C9362B]/40 sm:w-8" />
              <span>守護者 · GUARDIAN OF CULTURE</span>
              <span className="h-px w-6 bg-[#C9362B]/40 sm:w-8" />
            </div>
          </div>

          <p data-reveal="up" className="mx-auto max-w-xl font-sans text-base leading-relaxed text-[#4A4540] sm:text-lg">
            Every piece carries a part of the Catalyst story. Created for the people who make the experience what it is.
          </p>

          <p data-reveal="fade" data-delay="0.2" className="mt-10 font-['Noto_Sans_JP',sans-serif] text-[10px] font-bold uppercase tracking-[0.35em] text-[#736B63]">
            AIESEC IN SLIIT · LEADERSHIP DEVELOPMENT SEMINAR
          </p>
        </div>

        {/* ── artwork column (desktop only): sits in its own space and stands on the section edge ── */}
        <div data-reveal="right" aria-hidden="true" className="relative hidden select-none justify-center self-end lg:flex">
          <div className="absolute inset-x-6 bottom-0 top-10 rounded-full opacity-40 blur-3xl" style={{ background: 'radial-gradient(circle, rgba(201,54,43,0.22) 0%, transparent 70%)' }} />
          <Ill src="/assets/illustrations/benkageyama-samurai-5135974_1920.png" className="relative block h-auto w-full max-w-[380px] object-contain drop-shadow-[0_16px_36px_rgba(37,35,33,0.2)]" />
        </div>
      </div>
    </section>
  );
};