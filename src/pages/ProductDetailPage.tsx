import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TagMark } from '../components/brand/CatalystTag';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { gsap } from 'gsap';
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
import { getProductById, getRelatedProducts, MerchProduct } from '../data/merchProducts';
import { useMerch } from '../context/MerchContext';
import Navbar from '../components/Navbar';
import { CartDrawer } from '../components/merch/CartDrawer';
import { ClaimConfirmationModal } from '../components/merch/ClaimConfirmationModal';
import { MerchToast } from '../components/merch/MerchToast';
import { MerchCartButton } from '../components/merch/MerchCartButton';
import { MerchProductCard } from '../components/merch/MerchProductCard';
import { scrollTopOrRestore } from '../utils/navState';
import { NavCartButton } from '../components/merch/NavCartButton';
import { useMerchMotion } from '../hooks/useMerchMotion';
import { WaveDivider, Chars, Ill, SectionTag, SEIGAIHA, KANJI_FONT } from '../components/merch/MerchDecor';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const { addToCart, isWishlisted, toggleWishlist, openCart } = useMerch();

  const product: MerchProduct | undefined = productId ? getProductById(productId) : undefined;
  const relatedProducts = productId ? getRelatedProducts(productId, 3) : [];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [sizeError, setSizeError] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isClaimedEffect, setIsClaimedEffect] = useState(false);
  const [showBar, setShowBar] = useState(false);

  const pageRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef<HTMLDivElement>(null);

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
    scrollTopOrRestore();

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

  // mobile sticky add-to-cart bar: shows once the main button has scrolled off the top
  useEffect(() => {
    const el = ctaRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([entry]) => setShowBar(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [productId]);

  // scroll effects, tilt, magnetic buttons, letter drop-in (re-armed when the product changes)
  useMerchMotion(pageRef, [productId]);

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F8F3E9] text-[#252321]">
        <Navbar />
        <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden p-6 text-center">
          <Ill
            src="/assets/illustrations/alessandro_hrdz-mask-6976331.png"
            className="mb-6 w-28 drop-shadow-[0_10px_20px_rgba(201,54,43,0.25)]"
          />
          <h2 className="brush-heading mb-4 font-['Jansina','Bison',sans-serif] text-4xl text-[#252321]">
            PIECE NOT FOUND
          </h2>
          <p className="mb-8 max-w-md font-['Droid_Serif',Georgia,serif] italic text-[#736B63]">
            The merchandise item you are looking for does not exist in the Catalyst 7.0 archive.
          </p>
          <Link
            to="/merch"
            className="rounded-full bg-[#C9362B] px-7 py-3 font-['Montserrat',sans-serif] text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#9E171C]"
          >
            Back to Collection
          </Link>
        </div>
      </div>
    );
  }

  const wishlisted = isWishlisted(product.id);
  const requiresSize = Boolean(product.options?.sizes && product.options.sizes.length > 1);

  const handleAddToCart = () => {
    if (requiresSize && !selectedSize) {
      setSizeError(true);
      const box = sizeRef.current;
      if (box) {
        box.scrollIntoView({ behavior: 'smooth', block: 'center' });
        gsap.fromTo(box, { x: -12 }, { x: 0, duration: 0.7, ease: 'elastic.out(1, 0.3)' });
      }
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
    <div
      ref={pageRef}
      className="relative flex min-h-screen flex-col overflow-x-clip bg-[#F8F3E9] text-[#252321] selection:bg-[#C9362B] selection:text-white"
    >
      {/* scroll progress thread */}
      <div
        data-progress
        aria-hidden="true"
        className="fixed left-0 top-0 z-[80] h-[3px] w-full origin-left bg-gradient-to-r from-[#F6C768] via-[#C9362B] to-[#8C0B26] motion-reduce:hidden"
      />

      <Navbar />

      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        {/* Breadcrumb & Collection Return */}
        <div
          data-reveal="fade"
          className="mb-6 flex items-center justify-between gap-4 border-b border-[#252321]/15 pb-4 font-['Montserrat',sans-serif] text-xs"
        >
          <div className="flex min-w-0 items-center gap-2 text-[11px] font-semibold uppercase tracking-wider">
            <Link to="/" state={{ directToHero: true }} className="hidden text-[#736B63] transition-colors hover:text-[#252321] sm:inline">
              HOME
            </Link>
            <span className="hidden text-[#252321]/25 sm:inline">/</span>
            <Link to="/merch" className="hidden text-[#736B63] transition-colors hover:text-[#252321] sm:inline">
              COLLECTION
            </Link>
            <span className="hidden text-[#252321]/25 sm:inline">/</span>
            <span className="whitespace-nowrap font-bold text-[#C9362B]">{product.category}</span>
          </div>

          <div className="flex shrink-0 items-center gap-2">
          <Link
            to="/merch"
            className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[11px] font-bold uppercase tracking-widest text-[#736B63] transition-colors hover:text-[#C9362B]"
          >
            <ArrowLeft size={13} />
            <span>ALL PIECES (9)</span>
          </Link>
          <NavCartButton />
          </div>
        </div>

        {/* ── SHOWROOM COMPOSITION ── */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
          {/* ================= LEFT: STAGE ================= */}
          <div className="flex flex-col items-center lg:col-span-7">
            <div className="group relative aspect-[4/5] max-h-[680px] w-full overflow-hidden rounded-3xl border border-[#252321]/15 bg-[#FFFAF3] shadow-[0_24px_60px_rgba(120,30,30,0.14)] sm:aspect-square md:aspect-[4/5]">
              {/* wave pattern */}
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-70"
                style={{ backgroundImage: SEIGAIHA, backgroundSize: '56px 28px' }}
              />
              {/* soft vignette so the product reads clearly */}
              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(circle at 50% 46%, rgba(255,250,243,0) 0%, rgba(255,250,243,0.55) 72%, rgba(255,250,243,0.85) 100%)',
                }}
              />

              {/* giant kanji, drifts while scrolling */}
              <span
                data-parallax="0.1"
                aria-hidden="true"
                className="pointer-events-none absolute -right-6 top-6 select-none text-[20rem] font-black leading-none text-[#C9362B]/[0.07]"
                style={{ fontFamily: KANJI_FONT }}
              >
                侍
              </span>

              {/* the rising sun behind the product */}
              <div data-reveal="scale" aria-hidden="true" className="absolute left-[14%] top-[10%] aspect-square w-[72%]">
                <div className="h-full w-full rounded-full bg-[radial-gradient(circle_at_38%_30%,#ee4a38,#cf2519_55%,#a81810)] shadow-[0_24px_60px_rgba(168,24,16,0.35)]" />
                <div className="animate-spin-very-slow absolute -inset-[7%] rounded-full border border-dashed border-[#C9362B]/50" />
                <div className="absolute -inset-[14%] rounded-full border border-[#C9362B]/20" />
              </div>

              {/* tag */}
              <div className="absolute left-6 top-6 z-20 flex items-center gap-2">
                <TagMark />
                <span className="font-['Montserrat',sans-serif] text-[10px] font-bold uppercase tracking-[0.3em] text-[#C9362B]">
                  CATALYST 7.0 ARCHIVE
                </span>
              </div>

              {/* Zoom Lightbox Trigger */}
              <button
                onClick={() => setIsLightboxOpen(true)}
                className="absolute right-5 top-5 z-20 cursor-pointer rounded-full border border-[#E5DDD0] bg-white/90 p-2.5 text-[#736B63] shadow-xs transition-all hover:border-[#C9362B] hover:text-[#C9362B]"
                title="Expand Fullscreen View"
                aria-label="Expand fullscreen view"
              >
                <Maximize2 size={16} />
              </button>

              {/* Product with mouse tilt */}
              <div data-tilt className="absolute inset-0 z-10 flex items-center justify-center p-8">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImageIndex}
                    src={images[activeImageIndex]}
                    alt={`${product.name} - View ${activeImageIndex + 1}`}
                    initial={{ opacity: 0, scale: 0.92, rotate: -2 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.92, rotate: 2 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className="max-h-[86%] max-w-[86%] cursor-zoom-in select-none object-contain drop-shadow-[0_22px_34px_rgba(60,0,10,0.35)]"
                    onClick={() => setIsLightboxOpen(true)}
                  />
                </AnimatePresence>
              </div>

              {/* swimming koi */}
              <Ill
                data-float="14"
                src="/assets/illustrations/kacsoeszti-koi-1184783_1920.png"
                className="absolute bottom-8 left-4 z-[5] w-20 opacity-90 sm:w-28"
              />

              {/* Gallery Navigation */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={prevImage}
                    aria-label="Previous product view"
                    className="absolute left-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[#E5DDD0] bg-white text-[#252321] shadow-md backdrop-blur-sm transition-all hover:scale-105 hover:border-[#C9362B]"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button
                    onClick={nextImage}
                    aria-label="Next product view"
                    className="absolute right-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[#E5DDD0] bg-white text-[#252321] shadow-md backdrop-blur-sm transition-all hover:scale-105 hover:border-[#C9362B]"
                  >
                    <ChevronRight size={20} />
                  </button>

                  <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-full border border-[#E5DDD0] bg-white/95 px-3.5 py-1 font-['Montserrat',sans-serif] text-[10px] font-bold uppercase tracking-widest text-[#C9362B] shadow-xs">
                    {activeImageIndex === 0 ? 'FRONT VIEW' : 'BUSHIDO BACK ARTWORK'}
                  </div>
                </>
              )}

              {/* wave edge along the bottom */}
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 z-[6] h-5 opacity-80"
                style={{ backgroundImage: SEIGAIHA, backgroundSize: '40px 20px', backgroundRepeat: 'repeat-x' }}
              />
            </div>

            {/* Thumbnails */}
            {hasMultipleImages && (
              <div className="mt-4 flex items-center gap-3">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    aria-label={`Show view ${idx + 1}`}
                    className={`relative h-16 w-16 cursor-pointer overflow-hidden rounded-xl border bg-white p-1.5 transition-all ${
                      activeImageIndex === idx
                        ? 'border-[#C9362B] shadow-sm ring-2 ring-[#C9362B]/30'
                        : 'border-[#E5DDD0] opacity-80 hover:border-[#C9362B]/50 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ================= RIGHT: INFO (sticks while you scroll the stage) ================= */}
          <div className="flex flex-col lg:sticky lg:top-24 lg:col-span-5">
            <div data-reveal="right">
              <div className="mb-5">
                <SectionTag kanji="品">{product.category} / CATALYST 7.0</SectionTag>
              </div>

              {/* Headline & Price */}
              <div className="mb-4 flex flex-col justify-between gap-x-4 gap-y-3 xl:flex-row xl:items-end">
                <h1
                  data-chars
                  aria-label={product.name}
                  className="brush-heading min-w-0 font-['Jansina','Bison',sans-serif] text-4xl uppercase tracking-wider text-[#1B0209] sm:text-5xl lg:text-6xl"
                >
                  <Chars text={product.name} />
                </h1>
                <span className="relative shrink-0 self-start whitespace-nowrap rounded-md bg-[#C9362B] px-4 py-2 font-['Jansina','Bison',sans-serif] text-2xl font-black leading-none tracking-wider text-[#FFF1E4] shadow-[0_8px_22px_rgba(201,54,43,0.35)] sm:text-3xl xl:self-auto">
                  {product.priceDisplay}
                </span>
              </div>

              {/* Variant */}
              <h2 className="brush-heading mb-6 font-['Jansina','Bison',sans-serif] text-2xl uppercase tracking-widest text-[#736B63] sm:text-3xl">
                {product.variant}
              </h2>

              {/* Availability ticket */}
              <div className="relative mb-6 space-y-2.5 overflow-hidden rounded-2xl border border-[#252321]/15 bg-white p-5 text-xs shadow-[0_10px_30px_rgba(37,35,33,0.07)]">
                <span
                  aria-hidden="true"
                  className="absolute right-4 top-3 flex h-10 w-10 rotate-6 items-center justify-center rounded-[3px] bg-[#C9362B] text-[13px] leading-none tracking-[0.1em] text-[#FFF1E4] shadow-[0_4px_10px_rgba(201,54,43,0.3)] [writing-mode:vertical-rl]"
                  style={{ fontFamily: KANJI_FONT }}
                >
                  公式
                </span>

                <div className="flex items-center justify-between pr-14">
                  <span className="font-['Montserrat',sans-serif] font-medium uppercase tracking-wider text-[#736B63]">
                    Price:
                  </span>
                  <span className="font-mono text-sm font-bold text-[#C9362B]">{product.priceDisplay}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-['Montserrat',sans-serif] font-medium uppercase tracking-wider text-[#736B63]">
                    Status:
                  </span>
                  <span className="flex items-center gap-1.5 font-['Montserrat',sans-serif] font-bold uppercase tracking-widest text-[#252321]">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#C9362B]" />
                    {product.claimStatus}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-['Montserrat',sans-serif] font-medium uppercase tracking-wider text-[#736B63]">
                    Eligibility:
                  </span>
                  <span className="font-bold text-[#C9362B]">{product.claimEligibility}</span>
                </div>

                <div className="flex items-center justify-between border-t border-dashed border-[#252321]/25 pt-2.5">
                  <span className="flex items-center gap-1 font-['Montserrat',sans-serif] font-medium uppercase tracking-wider text-[#736B63]">
                    <MapPin size={12} className="text-[#C9362B]" /> Pickup:
                  </span>
                  <span className="font-medium text-[#252321]">{product.pickupLocation}</span>
                </div>
              </div>

              {/* Size Selection (for Apparel) */}
              {product.options?.sizes && (
                <div ref={sizeRef} className="mb-6">
                  <div className="mb-2 flex items-center justify-between">
                    <label className="font-['Montserrat',sans-serif] text-xs font-bold uppercase tracking-[0.2em] text-[#252321]">
                      SELECT SIZE:
                    </label>
                    {sizeError && (
                      <span className="animate-pulse font-['Montserrat',sans-serif] text-[11px] font-bold tracking-wider text-[#C9362B]">
                        Please choose a size
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {product.options.sizes.map((size) => {
                      const isSelected = selectedSize === size;
                      return (
                        <button
                          key={size}
                          onClick={() => {
                            setSelectedSize(size);
                            setSizeError(false);
                          }}
                          className={`h-12 min-w-[52px] cursor-pointer rounded-lg border-2 px-4 font-['Montserrat',sans-serif] text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                            isSelected
                              ? '-translate-y-0.5 border-[#C9362B] bg-[#C9362B] text-white shadow-[0_8px_18px_rgba(201,54,43,0.4)]'
                              : sizeError
                                ? 'border-[#C9362B]/60 bg-white text-[#252321] hover:border-[#C9362B]'
                                : 'border-[#252321]/20 bg-white text-[#252321] hover:-translate-y-0.5 hover:border-[#C9362B]'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div ref={ctaRef} className="space-y-3 pt-2">
                <button
                  data-magnetic
                  onClick={handleAddToCart}
                  className={`group relative flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-4 font-['Montserrat',sans-serif] text-xs font-bold uppercase tracking-[0.22em] text-white shadow-[0_10px_30px_rgba(201,54,43,0.35)] transition-colors sm:text-sm before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:transition-transform before:duration-700 hover:before:translate-x-full ${
                    isClaimedEffect ? 'bg-[#252321]' : 'bg-[#C9362B] hover:bg-[#9E171C]'
                  }`}
                >
                  {isClaimedEffect ? (
                    <>
                      <Check size={18} />
                      <span>ADDED TO CART</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={18} />
                      <span>ADD TO CART</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border-2 px-6 py-3.5 font-['Montserrat',sans-serif] text-xs font-bold uppercase tracking-[0.2em] transition-all ${
                    wishlisted
                      ? 'border-[#C9362B] bg-[#C9362B]/10 text-[#C9362B]'
                      : 'border-[#252321]/15 bg-white text-[#736B63] hover:border-[#C9362B] hover:text-[#252321]'
                  }`}
                >
                  <Heart size={16} className={wishlisted ? 'fill-[#C9362B] text-[#C9362B]' : ''} />
                  <span>{wishlisted ? 'IN YOUR WISHLIST' : 'ADD TO WISHLIST'}</span>
                </button>
              </div>

              {/* reassurance */}
              <div className="mt-6 grid gap-3 text-[11px] text-[#736B63] sm:grid-cols-2">
                <div className="flex items-start gap-2 rounded-xl border border-[#252321]/10 bg-[#FAF6EE] p-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#C9362B]" />
                  <span className="leading-relaxed">Official AIESEC in SLIIT merchandise.</span>
                </div>
                <div className="flex items-start gap-2 rounded-xl border border-[#252321]/10 bg-[#FAF6EE] p-3">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#C9362B]" />
                  <span className="leading-relaxed">Order now, collect at the seminar.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RELATED MERCHANDISE ── */}
        <section className="relative mt-24 pt-4">
          <WaveDivider className="mb-14" />

          <div className="mb-8 flex items-end justify-between" data-reveal="up">
            <div>
              <div className="mb-3">
                <SectionTag kanji="続">DISCOVER MORE</SectionTag>
              </div>
              <h3 className="brush-heading font-['Jansina','Bison',sans-serif] text-3xl uppercase tracking-wider text-[#1B0209] sm:text-4xl">
                RELATED PIECES
              </h3>
            </div>
            <Link
              to="/merch"
              className="font-['Montserrat',sans-serif] text-xs font-bold uppercase tracking-widest text-[#C9362B] transition-colors hover:text-[#9E171C]"
            >
              VIEW ALL (9) →
            </Link>
          </div>

          <div data-reveal-group className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedProducts.map((rel) => (
              <MerchProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      </main>

      {/* ── MOBILE STICKY ADD-TO-CART BAR ── */}
      <AnimatePresence>
        {showBar && !isLightboxOpen && (
          <motion.div
            initial={{ y: 96 }}
            animate={{ y: 0 }}
            exit={{ y: 96 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-[#252321]/10 bg-[#FFFAF3]/95 px-4 py-3 backdrop-blur lg:hidden"
          >
            <div className="mx-auto flex max-w-xl items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-['Montserrat',sans-serif] text-[11px] font-bold uppercase tracking-wider text-[#252321]">
                  {product.name}
                </p>
                <p className="font-['Jansina','Bison',sans-serif] text-lg font-black leading-tight tracking-wider text-[#C9362B]">
                  {product.priceDisplay}
                </p>
              </div>
              <button
                onClick={handleAddToCart}
                className="flex shrink-0 cursor-pointer items-center gap-2 rounded-full bg-[#C9362B] px-6 py-3 font-['Montserrat',sans-serif] text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow-[0_6px_18px_rgba(201,54,43,0.35)]"
              >
                <ShoppingBag size={15} />
                <span>Add to cart</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
              className="absolute right-6 top-6 z-20 cursor-pointer rounded-full bg-black/40 p-3 text-white/80 transition-all hover:bg-black/60 hover:text-white"
              aria-label="Close Lightbox"
            >
              <X size={24} />
            </button>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative z-10 flex max-h-[85vh] w-full max-w-4xl items-center justify-center p-4"
            >
              <img
                src={images[activeImageIndex]}
                alt=""
                className="max-h-[80vh] max-w-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Shared Overlays */}
      <CartDrawer />
      <MerchCartButton raised={showBar} hidden={isLightboxOpen} />
      <ClaimConfirmationModal />
      <MerchToast />
    </div>
  );
};

export default ProductDetailPage;