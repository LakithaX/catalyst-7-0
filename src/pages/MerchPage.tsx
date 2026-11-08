import React, { useEffect } from 'react';
import { useCatalog } from '../context/CatalogContext';
import ShopUnavailable from '../components/merch/ShopUnavailable';
import Navbar from '../components/Navbar';
import { MerchHero } from '../components/merch/MerchHero';
import { MerchCollection } from '../components/merch/MerchCollection';
import { MerchBrandStatement } from '../components/merch/MerchBrandStatement';
import { CartDrawer } from '../components/merch/CartDrawer';
import { ClaimConfirmationModal } from '../components/merch/ClaimConfirmationModal';
import { MerchToast } from '../components/merch/MerchToast';

export const MerchPage: React.FC = () => {
  const { comingSoon, loading, error, products } = useCatalog();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = 'Catalyst 7.0 — Official Merchandise Collection';
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F3E9] text-[#252321] flex flex-col selection:bg-[#C9362B] selection:text-white">
      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1">
        {/* Section A: Hero */}
        {comingSoon || loading || error || !products.length ? <ShopUnavailable /> : <>
        <MerchHero />

        {/* Section B: Collection */}
        <MerchCollection />

        {/* Section C: Brand Statement */}
        <MerchBrandStatement />
        </>}
      </main>



      {/* Shared Overlays */}
      {!comingSoon && !loading && !error && <CartDrawer />}
      {!comingSoon && !loading && !error && <ClaimConfirmationModal />}
      <MerchToast />
    </div>
  );
};

export default MerchPage;
