import React, { useEffect } from 'react';
import { MerchNav } from '../components/merch/MerchNav';
import { MerchHero } from '../components/merch/MerchHero';
import { MerchCollection } from '../components/merch/MerchCollection';
import { MerchBrandStatement } from '../components/merch/MerchBrandStatement';
import { CartDrawer } from '../components/merch/CartDrawer';
import { ClaimConfirmationModal } from '../components/merch/ClaimConfirmationModal';
import { MerchToast } from '../components/merch/MerchToast';

export const MerchPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = 'Catalyst 7.0 — Official Merchandise Collection';
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F3E9] text-[#252321] flex flex-col selection:bg-[#C9362B] selection:text-white">
      {/* Merchandise Navigation */}
      <MerchNav />

      {/* Main Content */}
      <main className="flex-1">
        {/* Section A: Hero */}
        <MerchHero />

        {/* Section B: Collection */}
        <MerchCollection />

        {/* Section C: Brand Statement */}
        <MerchBrandStatement />
      </main>

      {/* Outro / Merch Footer */}
      <footer className="w-full bg-[#F3ECE0] border-t border-[#252321]/10 py-12 px-4 sm:px-6 lg:px-8 text-center select-none">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img
              src="/assets/catalyst_7_logo.png"
              alt="Catalyst 7.0"
              className="h-8 w-auto object-contain opacity-90"
            />
            <span className="font-['Montserrat',sans-serif] text-[10px] tracking-[0.25em] text-[#736B63] uppercase font-bold">
              CATALYST 7.0 MERCHANDISE EXPERIENCE · 公式商品
            </span>
          </div>

          <p className="font-mono text-[10px] tracking-[0.25em] text-[#736B63] uppercase font-bold">
            © 2026 AIESEC in SLIIT · All Rights Reserved
          </p>
        </div>
      </footer>

      {/* Shared Overlays */}
      <CartDrawer />
      <ClaimConfirmationModal />
      <MerchToast />
    </div>
  );
};

export default MerchPage;
