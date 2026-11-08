import React, { useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import { MerchHero } from '../components/merch/MerchHero';
import { MerchCollection } from '../components/merch/MerchCollection';
import { MerchBrandStatement } from '../components/merch/MerchBrandStatement';
import { CartDrawer } from '../components/merch/CartDrawer';
import { ClaimConfirmationModal } from '../components/merch/ClaimConfirmationModal';
import { MerchToast } from '../components/merch/MerchToast';
import { MerchCartButton } from '../components/merch/MerchCartButton';
import { useMerchMotion } from '../hooks/useMerchMotion';
import { WaveDivider, Ill, SEIGAIHA_DARK, KANJI_FONT } from '../components/merch/MerchDecor';
import { scrollTopOrRestore } from '../utils/navState';
import { CatalystMark } from '../components/brand/CatalystMark';

export const MerchPage: React.FC = () => {
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollTopOrRestore();
    document.title = 'Catalyst 7.0 — Official Merchandise Collection';
  }, []);

  // scroll progress bar + any data-* effects used inside this page
  useMerchMotion(pageRef);

  return (
    <div
      ref={pageRef}
      className="relative min-h-screen w-full bg-[#FAF6EE] text-[#252321] selection:bg-[#C9362B] selection:text-[#FAF6EE]"
    >
      <Navbar />

      {/* Main Page Flow */}
      <main className="relative">
        {/* Section A: Hero */}
        <MerchHero />

        {/* Section B: Grid of Pieces */}
        <MerchCollection />

        <WaveDivider />

        {/* Section C: Brand Statement */}
        <MerchBrandStatement />
      </main>

      {/* Outro / Merch Footer (dark band for contrast) */}
      <footer className="relative z-10 w-full select-none overflow-hidden bg-gradient-to-b from-[#6A0720] to-[#3A0613] px-4 pb-10 pt-16 text-center text-[#FFF1E4] sm:px-6 lg:px-8">
        {/* wave edge from the cream page into the dark footer */}
        <WaveDivider flip className="absolute inset-x-0 top-0 opacity-90" />

        {/* gold seigaiha texture */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-100"
          style={{ backgroundImage: SEIGAIHA_DARK, backgroundSize: '56px 28px' }}
        />

        {/* giant kanji watermark: "official merchandise" */}
        <span
          aria-hidden="true"
          data-reveal="fade"
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[26vw] font-black leading-none text-[#FFF1E4]/[0.05] sm:text-[18vw]"
          style={{ fontFamily: KANJI_FONT }}
        >
          公式商品
        </span>

        {/* floating koi */}
        <Ill
          data-float="12"
          src="/assets/illustrations/benkageyama-coy-5135969_1920.png"
          className="absolute -bottom-4 right-6 hidden w-36 opacity-40 sm:block"
        />
        <Ill
          data-float="10"
          src="/assets/illustrations/kacsoeszti-koi-1184783_1920.png"
          className="absolute -left-2 bottom-6 hidden w-28 opacity-30 md:block"
        />

        <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-center gap-6 sm:flex-row">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-10 h-10 rounded-full bg-[#FAF6EE]/15 blur-sm pointer-events-none" />
              <CatalystMark
                size={34}
                className="relative h-8 sm:h-9 w-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
              />
            </div>
            <img
              src="/assets/catalyst_7_logo.png"
              alt="Catalyst 7.0"
              className="h-9 w-auto object-contain brightness-0 invert"
            />
            <span className="font-['Montserrat',sans-serif] text-[10px] font-bold uppercase tracking-[0.25em] text-[#F6C768]">
              CATALYST 7.0 MERCHANDISE EXPERIENCE · 公式商品
            </span>
          </div>
        </div>
      </footer>

      {/* Shared Overlays */}
      <CartDrawer />
      <ClaimConfirmationModal />
      <MerchToast />
      <MerchCartButton />
    </div>
  );
};

export default MerchPage;
