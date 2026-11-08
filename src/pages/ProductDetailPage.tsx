import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  MapPin,
  Sparkles,
  Maximize2,
  X,
  Check,
  ShoppingBag,
} from 'lucide-react';
import { MerchProduct } from '../data/merchProducts';
import { useMerch } from '../context/MerchContext';
import { useCatalog } from '../context/CatalogContext';
import ShopUnavailable from '../components/merch/ShopUnavailable';
import Navbar from '../components/Navbar';
import { CartDrawer } from '../components/merch/CartDrawer';
import { ClaimConfirmationModal } from '../components/merch/ClaimConfirmationModal';
import { MerchToast } from '../components/merch/MerchToast';
import { MerchProductCard } from '../components/merch/MerchProductCard';

export const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { addToCart, isWishlisted, toggleWishlist, openCart } = useMerch();

  const { products, comingSoon, loading, error } = useCatalog();
  const product: MerchProduct | undefined = products.find(p => p.id === productId);
  const relatedProducts = products.filter(p => p.id !== productId).slice(0, 3);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [sizeError, setSizeError] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isClaimedEffect, setIsClaimedEffect] = useState(false);

  // Reset states when product changes
  useEffect(() => {
    setActiveImageIndex(0);
    setSizeError(false);
    setIsClaimedEffect(false);
    if (product?.options?.sizes && product.options.sizes.length === 1) {
      setSelectedSize(product.options.sizes[0]);
    } else {
      setSelectedSize(undefined);
    }
    window.scrollTo({ top: 0, behavior: 'instant' });

    if (product) {
      document.title = `${product.name} — ${product.variant} | Catalyst 7.0 Merch`;
    }
  }, [productId, product]);

  const images = product?.images || [];
  const hasMultipleImages = images.length > 1;

  const nextImage = useCallback(() => {
    if (images.length <= 1) return;
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    if (images.length <= 1) return;
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Keyboard navigation for image gallery
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape' && isLightboxOpen) setIsLightboxOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextImage, prevImage, isLightboxOpen]);

  if (comingSoon || loading || error) return <><Navbar/><ShopUnavailable/></>;
  if (!product) {
    return (
      <div className="min-h-screen bg-[#F8F3E9] text-[#252321] flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h2 className="brush-heading font-['Osaka_Bright','Bison',sans-serif] text-4xl text-[#252321] mb-4">
            PIECE NOT FOUND
          </h2>
          <p className="font-['Droid_Serif',Georgia,serif] italic text-[#736B63] mb-8">
            The merchandise item you are looking for does not exist in the Catalyst 7.0 archive.
          </p>
          <Link
            to="/merch"
            className="py-3 px-6 rounded-full bg-[#C9362B] text-white font-['Montserrat',sans-serif] font-bold text-xs tracking-widest uppercase hover:bg-[#9E171C] transition-colors"
          >
            Back to Collection
          </Link>
        </div>
      </div>
    );
  }

  const wishlisted = isWishlisted(product.id);
  const requiresSize = Boolean(product.options?.sizes && product.options.sizes.length > 1);

  const handleClaim = () => {
    if (requiresSize && !selectedSize) {
      setSizeError(true);
      return;
    }

    setSizeError(false);
    addToCart(product, selectedSize, 1);
    setIsClaimedEffect(true);

    setTimeout(() => {
      setIsClaimedEffect(false);
      openCart();
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#F8F3E9] text-[#252321] flex flex-col selection:bg-[#C9362B] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Sleek Inline Breadcrumb & Collection Return */}
        <div className="flex items-center justify-between gap-4 pb-4 mb-6 border-b border-[#252321]/10 text-xs font-['Montserrat',sans-serif]">
          <div className="flex min-w-0 items-center gap-2 text-[11px] tracking-wider uppercase font-semibold">
            <Link to="/" className="hidden sm:inline text-[#736B63] hover:text-[#252321] transition-colors">
              HOME
            </Link>
            <span className="hidden sm:inline text-[#252321]/20">/</span>
            <Link to="/merch" className="hidden sm:inline text-[#736B63] hover:text-[#252321] transition-colors">
              COLLECTION
            </Link>
            <span className="hidden sm:inline text-[#252321]/20">/</span>
            <span className="text-[#C9362B] font-bold whitespace-nowrap">{product.category}</span>
          </div>

          <Link
            to="/merch"
            className="inline-flex shrink-0 items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase whitespace-nowrap text-[#736B63] hover:text-[#C9362B] transition-colors"
          >
            <ArrowLeft size={13} />
            <span>ALL PIECES (9)</span>
          </Link>
        </div>

        {/* ── SHOWROOM COMPOSITION ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* ================================================================
              LEFT PANEL: DOMINANT PRODUCT PHOTOGRAPHY & IMAGE NAVIGATION
              ================================================================ */}
          <div className="lg:col-span-7 flex flex-col items-center">
            {/* Main Stage Card */}
            <div className="relative w-full aspect-[4/5] sm:aspect-square md:aspect-[4/5] max-h-[640px] rounded-2xl bg-white border border-[#E5DDD0] overflow-hidden shadow-[0_15px_40px_rgba(37,35,33,0.08)] flex items-center justify-center p-8 group">
              {/* Giant Subtle Background Watermark & Bonsai Tree */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none select-none">
                <img
                  src="/assets/illustrations/gdj-bonsai-tree-8143900.svg"
                  alt=""
                  className="w-3/5 h-auto object-contain filter grayscale"
                />
              </div>

              {/* Radial Studio Spotlight */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(circle at 50% 40%, rgba(201, 54, 43, 0.05) 0%, rgba(248, 243, 233, 0.6) 60%, transparent 100%)',
                }}
              />

              {/* Top Watermark Tag */}
              <div className="absolute top-6 left-6 z-20 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C9362B]" />
                <span className="font-['Montserrat',sans-serif] text-[10px] tracking-[0.3em] uppercase text-[#C9362B] font-bold">
                  CATALYST 7.0 ARCHIVE
                </span>
              </div>

              {/* Zoom Lightbox Trigger */}
              <button
                onClick={() => setIsLightboxOpen(true)}
                className="absolute top-5 right-5 z-20 p-2.5 rounded-full bg-white/90 border border-[#E5DDD0] hover:border-[#C9362B] text-[#736B63] hover:text-[#C9362B] shadow-xs transition-all cursor-pointer"
                title="Expand Fullscreen View"
              >
                <Maximize2 size={16} />
              </button>

              {/* The Dominant Cutout Product Image with Smooth Transition */}
              <div className="relative z-10 w-full h-full flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImageIndex}
                    src={images[activeImageIndex]}
                    alt={`${product.name} - View ${activeImageIndex + 1}`}
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-[85%] max-h-[85%] object-contain filter drop-shadow-[0_15px_30px_rgba(37,35,33,0.15)] select-none cursor-zoom-in"
                    onClick={() => setIsLightboxOpen(true)}
                  />
                </AnimatePresence>
              </div>

              {/* Left / Right Gallery Navigation Controls */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={prevImage}
                    aria-label="Previous product view"
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white border border-[#E5DDD0] hover:border-[#C9362B] text-[#252321] flex items-center justify-center backdrop-blur-sm shadow-md hover:scale-105 transition-all cursor-pointer"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button
                    onClick={nextImage}
                    aria-label="Next product view"
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white border border-[#E5DDD0] hover:border-[#C9362B] text-[#252321] flex items-center justify-center backdrop-blur-sm shadow-md hover:scale-105 transition-all cursor-pointer"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              {/* View Indicator Label */}
              {hasMultipleImages && (
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/95 border border-[#E5DDD0] shadow-xs text-[10px] font-['Montserrat',sans-serif] tracking-widest text-[#C9362B] font-bold uppercase">
                  {activeImageIndex === 0 ? 'FRONT VIEW' : 'BUSHIDO BACK ARTWORK'}
                </div>
              )}
            </div>

            {/* Thumbnail Navigation Row */}
            {hasMultipleImages && (
              <div className="flex items-center gap-3 mt-4">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-16 rounded-xl bg-white border overflow-hidden p-1.5 transition-all cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-[#C9362B] ring-2 ring-[#C9362B]/30 shadow-sm'
                        : 'border-[#E5DDD0] hover:border-[#C9362B]/50 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ================================================================
              RIGHT PANEL: EDITORIAL PRODUCT INFORMATION & CONTROLS
              ================================================================ */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div>
              {/* Category & Collection Eyebrow */}
              <div className="flex items-center gap-2 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9362B]" />
                <span className="font-['Montserrat',sans-serif] text-xs tracking-[0.25em] text-[#C9362B] uppercase font-bold">
                  {product.category} / CATALYST 7.0
                </span>
              </div>

              {/* Product Headline & Price */}
              <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-x-4 gap-y-3 mb-5">
                <h1 className="brush-heading min-w-0 font-['Osaka_Bright','Bison',sans-serif] text-4xl sm:text-5xl lg:text-6xl uppercase tracking-wider text-[#252321]">
                  {product.name}
                </h1>
                <span className="shrink-0 font-['Bison',sans-serif] text-3xl sm:text-4xl font-black text-[#C9362B] tracking-wider whitespace-nowrap leading-none">
                  {product.priceDisplay}
                </span>
              </div>

              {/* Variant Subtitle */}
              <h2 className="brush-heading font-['Osaka_Bright','Bison',sans-serif] text-2xl sm:text-3xl uppercase tracking-widest text-[#736B63] mb-6">
                {product.variant}
              </h2>

              {/* Availability & Claim Status Badge */}
              <div className="p-4 rounded-xl bg-white border border-[#E5DDD0] shadow-xs space-y-2 mb-6 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-['Montserrat',sans-serif] text-[#736B63] tracking-wider uppercase font-medium">
                    Price:
                  </span>
                  <span className="font-mono font-bold text-sm text-[#C9362B]">{product.priceDisplay}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-['Montserrat',sans-serif] text-[#736B63] tracking-wider uppercase font-medium">
                    Status:
                  </span>
                  <span className="font-['Montserrat',sans-serif] font-bold text-[#252321] tracking-widest uppercase flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9362B]" />
                    {product.claimStatus}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-['Montserrat',sans-serif] text-[#736B63] tracking-wider uppercase font-medium">
                    Eligibility:
                  </span>
                  <span className="text-[#C9362B] font-bold">{product.claimEligibility}</span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-[#252321]/10">
                  <span className="font-['Montserrat',sans-serif] text-[#736B63] tracking-wider uppercase flex items-center gap-1 font-medium">
                    <MapPin size={12} className="text-[#C9362B]" /> Pickup:
                  </span>
                  <span className="text-[#252321] font-medium">{product.pickupLocation}</span>
                </div>
              </div>

              {/* Size Selection (for Apparel) */}
              {product.options?.sizes && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-['Montserrat',sans-serif] text-xs font-bold tracking-[0.2em] uppercase text-[#252321]">
                      SELECT SIZE:
                    </label>
                    {sizeError && (
                      <span className="text-[11px] font-['Montserrat',sans-serif] text-[#C9362B] tracking-wider font-bold animate-pulse">
                        Please choose a size
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    {product.options.sizes.map((size) => {
                      const isSelected = selectedSize === size;
                      return (
                        <button
                          key={size}
                          onClick={() => {
                            setSelectedSize(size);
                            setSizeError(false);
                          }}
                          className={`min-w-[48px] h-12 px-4 rounded-lg font-['Montserrat',sans-serif] font-bold text-xs tracking-wider uppercase transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#C9362B] border border-[#C9362B] text-white shadow-[0_4px_14px_rgba(201,54,43,0.35)] scale-105'
                              : 'bg-white border border-[#E5DDD0] text-[#252321] hover:border-[#C9362B]'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Actions: CLAIM MERCH & WISHLIST */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleClaim}
                  className={`w-full py-4 px-6 rounded-full font-['Montserrat',sans-serif] font-bold text-xs sm:text-sm tracking-[0.22em] uppercase transition-all shadow-[0_6px_25px_rgba(201,54,43,0.3)] flex items-center justify-center gap-2 cursor-pointer ${
                    isClaimedEffect
                      ? 'bg-[#252321] text-white'
                      : 'bg-[#C9362B] hover:bg-[#9E171C] text-white hover:brightness-105 hover:-translate-y-0.5'
                  }`}
                >
                  {isClaimedEffect ? (
                    <>
                      <Check size={18} />
                      <span>ADDED TO CLAIM BAG</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={18} />
                      <span>CLAIM MERCH</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`w-full py-3.5 px-6 rounded-full border text-xs font-['Montserrat',sans-serif] font-bold tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    wishlisted
                      ? 'border-[#C9362B] bg-[#C9362B]/10 text-[#C9362B]'
                      : 'border-[#E5DDD0] bg-white text-[#736B63] hover:text-[#252321] hover:border-[#C9362B]'
                  }`}
                >
                  <Heart
                    size={16}
                    className={wishlisted ? 'fill-[#C9362B] text-[#C9362B]' : ''}
                  />
                  <span>{wishlisted ? 'IN YOUR WISHLIST' : 'ADD TO WISHLIST'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── RELATED MERCHANDISE SECTION ── */}
        <section className="mt-24 pt-16 border-t border-[#252321]/10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="font-['Montserrat',sans-serif] text-[10px] tracking-[0.25em] text-[#C9362B] uppercase font-bold block mb-3">
                DISCOVER MORE
              </span>
              <h3 className="brush-heading font-['Osaka_Bright','Bison',sans-serif] text-3xl sm:text-4xl uppercase tracking-wider text-[#252321]">
                RELATED PIECES
              </h3>
            </div>
            <Link
              to="/merch"
              className="text-xs font-['Montserrat',sans-serif] font-bold text-[#C9362B] hover:text-[#9E171C] tracking-widest uppercase transition-colors"
            >
              VIEW ALL (9) →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((rel) => (
              <MerchProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      </main>

      {/* ── LIGHTBOX OVERLAY ── */}
      <AnimatePresence>
        {isLightboxOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLightboxOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-6 right-6 z-20 p-3 rounded-full text-white/80 hover:text-white bg-black/40 hover:bg-black/60 transition-all cursor-pointer"
              aria-label="Close Lightbox"
            >
              <X size={24} />
            </button>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative z-10 max-w-4xl max-h-[85vh] w-full flex items-center justify-center p-4"
            >
              <img
                src={images[activeImageIndex]}
                alt=""
                className="max-w-full max-h-[80vh] object-contain filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Shared Overlays */}
      <CartDrawer />
      <ClaimConfirmationModal />
      <MerchToast />
    </div>
  );
};

export default ProductDetailPage;
