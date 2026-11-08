import React, { useEffect, useRef } from 'react';
import { TagMark } from '../components/brand/CatalystTag';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { gsap } from 'gsap';
import { ArrowLeft, Trash2, ArrowRight, ShieldCheck, Heart, Plus } from 'lucide-react';
import { useMerch } from '../context/MerchContext';
import { useCatalog } from '../context/CatalogContext';
import ShopUnavailable from '../components/merch/ShopUnavailable';
import Navbar from '../components/Navbar';
import { ClaimConfirmationModal } from '../components/merch/ClaimConfirmationModal';
import { MerchToast } from '../components/merch/MerchToast';
import { useMerchMotion } from '../hooks/useMerchMotion';
import { WaveDivider, Chars, Ill, SEIGAIHA, KANJI_FONT } from '../components/merch/MerchDecor';
import { scrollTopOrRestore } from '../utils/navState';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// number that rolls up/down to its new value (written straight to the DOM, so React never fights it)
const CountUp: React.FC<{ value: number; prefix?: string; className?: string }> = ({ value, prefix = '', className }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      el.textContent = prefix + value.toLocaleString();
      shown.current = value;
      return;
    }
    const o = { v: shown.current };
    const tween = gsap.to(o, {
      v: value,
      duration: 0.9,
      ease: 'power2.out',
      onUpdate: () => {
        shown.current = o.v;
        el.textContent = prefix + Math.round(o.v).toLocaleString();
      },
    });
    return () => {
      tween.kill();
    };
  }, [value, prefix]);

  return <span ref={ref} className={className} />;
};

export const CartPage: React.FC = () => {
  const {products, comingSoon, loading, error} = useCatalog();
  const getProductById = (id: string) => products.find(p => p.id === id);
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    wishlist,
    toggleWishlist,
    addToCart,
    openClaimModal,
  } = useMerch();

  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollTopOrRestore();
    document.title = 'Shopping Cart — Catalyst 7.0 Merch';
  }, []);

  // empty <-> filled swaps different markup, so re-arm the effects when that changes
  useMerchMotion(pageRef, [cartItems.length === 0, wishlist.length === 0, loading, comingSoon, error]);

  const totalPieces = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalLkr = cartItems.reduce((acc, i) => acc + (i.priceLkr || 0) * i.quantity, 0);

  if (comingSoon || loading || error) return <><Navbar/><ShopUnavailable/></>;
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

      {/* faint scenery */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <Ill
          src="/assets/illustrations/gdj-building-8171699.svg"
          className="absolute -right-[10%] top-[18%] w-[420px] opacity-[0.04] grayscale md:w-[620px]"
        />
      </div>

      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        {/* Header */}
        <div className="relative mb-10 sm:mb-14">
          {/* giant bag kanji */}
          <span
            data-reveal="fade"
            aria-hidden="true"
            className="pointer-events-none absolute -top-10 right-0 select-none text-[12rem] font-black leading-none text-[#C9362B]/[0.07] sm:text-[18rem]"
            style={{ fontFamily: KANJI_FONT }}
          >
            袋
          </span>

          <Link
            to="/merch"
            className="mb-5 inline-flex items-center gap-2 font-['Noto_Sans_JP','Montserrat',sans-serif] text-xs font-semibold uppercase tracking-widest text-[#736B63] transition-colors hover:text-[#C9362B]"
          >
            <ArrowLeft size={14} />
            <span>CONTINUE SHOPPING</span>
          </Link>

          <div className="mb-3">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="grid h-9 w-9 place-items-center rounded-[4px] bg-[#C9362B] text-lg font-bold text-white font-['Yuji_Boku','Zen_Antique','Noto_Serif_JP',serif]">買</span>
              <span className="text-xl tracking-[0.16em] text-[#252321] font-['Yuji_Boku','Zen_Antique','Noto_Serif_JP',serif]">第四章</span>
              <span className="ml-1 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#C9362B] font-['Noto_Sans_JP','Montserrat',sans-serif]"><TagMark />CATALYST 7.0 STORE</span>
            </div>
          </div>

          <h1
            data-chars
            aria-label="Your shopping cart"
            className="brush-heading relative font-['Jansina','Zen_Antique','Shippori_Mincho','Noto_Serif_JP',serif] text-4xl uppercase tracking-[0.03em] text-[#252321] sm:text-6xl"
          >
            <Chars text="YOUR SHOPPING CART" />
          </h1>
          <div
            data-reveal="left"
            data-delay="0.4"
            aria-hidden="true"
            className="mt-3 origin-left"
          >
            <svg viewBox="0 0 420 28" fill="none" className="h-4 w-48 sm:w-64">
              <path d="M6 16 C45 10, 95 8, 150 9 C220 10, 290 8, 350 12 C385 14, 405 16, 416 13 C405 20, 370 21, 320 20 C240 18, 160 21, 90 20 C50 19, 20 20, 6 16 Z" fill="#C9362B" />
            </svg>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div
            data-reveal="scale"
            className="relative mx-auto max-w-xl overflow-hidden rounded-2xl border-[3px] border-[#C9362B] bg-white p-8 py-20 text-center shadow-[7px_7px_0_#252321]"
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-60"
              style={{ backgroundImage: SEIGAIHA, backgroundSize: '56px 28px' }}
            />
            <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.92),rgba(255,255,255,0.6)_70%)]" />

            <div className="relative">
              <div className="relative mx-auto mb-7 flex h-28 w-28 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_38%_30%,#ee4a38,#cf2519_55%,#a81810)] shadow-[0_14px_34px_rgba(168,24,16,0.35)]" />
                <div className="animate-spin-very-slow absolute -inset-2 rounded-full border border-dashed border-[#C9362B]/50" />
                <Ill
                  data-float="10"
                  src="/assets/illustrations/jakeloris-fan-7039967.png"
                  className="relative w-20 drop-shadow-[0_8px_16px_rgba(0,0,0,0.3)]"
                />
              </div>

              <h2 className="brush-heading mb-3 font-['Jansina','Zen_Antique','Shippori_Mincho','Noto_Serif_JP',serif] text-3xl uppercase tracking-wider text-[#1B0209]">
                YOUR CART IS EMPTY
              </h2>

              <p className="mx-auto mb-8 max-w-sm font-['Shippori_Mincho','Noto_Serif_JP',serif] text-sm leading-relaxed text-[#736B63]">
                Browse the official Catalyst 7.0 merchandise collection and add your favourite pieces to your cart.
              </p>

              <Link
                to="/merch"
                data-magnetic
                className="inline-flex items-center gap-2 rounded-full bg-[#B51E23] px-8 py-3.5 font-['Noto_Sans_JP','Montserrat',sans-serif] text-xs font-bold uppercase tracking-widest text-white shadow-[0_4px_14px_rgba(181,30,35,0.30)] transition-colors hover:bg-[#9E171C]"
              >
                <span>SHOP THE COLLECTION</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
            {/* Left: items */}
            <div className="space-y-4 lg:col-span-8">
              <div className="flex items-center justify-between border-b-2 border-[#252321] pb-3 font-['Noto_Sans_JP','Montserrat',sans-serif] text-xs font-semibold uppercase tracking-wider text-[#736B63]">
                <span>ITEMS ({cartItems.length})</span>
                <button onClick={clearCart} className="cursor-pointer transition-colors hover:text-[#C9362B]">
                  Clear Cart
                </button>
              </div>

              <AnimatePresence initial={true}>
                {cartItems.map((item, idx) => (
                  <motion.div
                    key={item.cartId}
                    layout
                    initial={{ opacity: 0, x: -36 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 60, scale: 0.97 }}
                    transition={{ duration: 0.5, ease: EASE, delay: Math.min(idx * 0.07, 0.4) }}
                    className="group relative flex flex-col items-start justify-between gap-4 overflow-hidden rounded-2xl border-2 border-[#252321] bg-white p-5 shadow-[5px_5px_0_#252321] transition-[border-color,box-shadow] duration-300 hover:border-[#C9362B] hover:shadow-[5px_5px_0_#C9362B] sm:flex-row sm:items-center"
                  >
                    {/* left accent */}
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-0 left-0 w-1 origin-top scale-y-0 bg-[#C9362B] transition-transform duration-300 group-hover:scale-y-100"
                    />

                    <div className="flex min-w-0 items-center gap-4">
                      <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-[#252321] bg-[#E6D9C0] p-2 sm:h-24 sm:w-24">
                        <div
                          aria-hidden="true"
                          className="absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C9362B]/15 transition-transform duration-500 group-hover:scale-110"
                        />
                        <img
                          src={item.image}
                          alt={item.name}
                          className="relative h-full w-full object-contain drop-shadow-[0_6px_10px_rgba(60,0,10,0.22)] transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>

                      <div className="min-w-0">
                        <span className="block font-['Noto_Sans_JP','Montserrat',sans-serif] text-[9px] font-bold uppercase tracking-wider text-[#C9362B]">
                          {item.category}
                        </span>
                        <Link
                          to={`/merch/${item.productId}`}
                          className="brush-heading block truncate font-['Jansina','Zen_Antique','Shippori_Mincho','Noto_Serif_JP',serif] text-xl uppercase tracking-wider text-[#1B0209] transition-colors hover:text-[#C9362B] sm:text-2xl"
                        >
                          {item.name}
                        </Link>
                        <p className="mb-1.5 font-mono text-xs uppercase tracking-wider text-[#736B63]">{item.variant}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          {item.size && (
                            <span className="inline-block rounded border border-[#E5DDD0] bg-[#FAF6EE] px-2 py-0.5 font-mono text-[10px] font-bold text-[#C9362B]">
                              SIZE: {item.size}
                            </span>
                          )}
                          {item.priceDisplay && (
                            <span className="inline-block rounded border border-[#C9362B]/30 bg-[#C9362B]/10 px-2.5 py-0.5 font-['Jansina','Zen_Antique','Shippori_Mincho','Noto_Serif_JP',serif] text-xs font-black tracking-wider text-[#C9362B]">
                              {item.priceDisplay}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quantity and Remove */}
                    <div className="flex w-full items-center justify-between gap-6 border-t border-[#252321]/10 pt-3 sm:w-auto sm:justify-end sm:border-0 sm:pt-0">
                      <div className="flex items-center overflow-hidden rounded-full border-2 border-[#252321] bg-white">
                        <button
                          onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                          className="flex h-9 w-9 cursor-pointer items-center justify-center text-sm text-[#736B63] transition-colors hover:bg-[#C9362B] hover:text-white"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="w-10 text-center font-mono text-xs font-bold text-[#252321]">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                          className="flex h-9 w-9 cursor-pointer items-center justify-center text-sm text-[#736B63] transition-colors hover:bg-[#C9362B] hover:text-white"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.cartId)}
                        className="cursor-pointer rounded-full p-2 text-[#736B63] transition-colors hover:bg-[#C9362B]/10 hover:text-[#C9362B]"
                        title="Remove piece"
                        aria-label="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Right: order summary (stays in view while you scroll the list) */}
            <div className="lg:sticky lg:top-24 lg:col-span-4" data-reveal="right">
              <div className="relative overflow-hidden rounded-2xl border-[3px] border-[#C9362B] bg-white shadow-[7px_7px_0_#252321]">
                {/* crimson header strip */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#C9362B] to-[#8C0B26] px-6 pb-6 pt-7 text-[#FFF1E4] sm:px-7">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 opacity-25 mix-blend-soft-light"
                    style={{ backgroundImage: SEIGAIHA, backgroundSize: '48px 24px' }}
                  />
                  <span
                    aria-hidden="true"
                    className="absolute -right-3 -top-4 select-none text-8xl font-black leading-none text-white/10"
                    style={{ fontFamily: KANJI_FONT }}
                  >
                    注
                  </span>
                  <span className="relative mb-1 block font-['Noto_Sans_JP','Montserrat',sans-serif] text-[10px] font-bold uppercase tracking-[0.25em] text-[#F6C768]">
                    YOUR ORDER
                  </span>
                  <h3 className="brush-heading relative font-['Jansina','Zen_Antique','Shippori_Mincho','Noto_Serif_JP',serif] text-3xl uppercase tracking-wider">
                    ORDER SUMMARY
                  </h3>
                </div>

                {/* ticket perforation */}
                <div className="relative -mt-px h-0 border-t-2 border-dashed border-[#252321]/20">
                  <span aria-hidden="true" className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-[#F8F3E9]" />
                  <span aria-hidden="true" className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-[#F8F3E9]" />
                </div>

                <div className="space-y-6 p-6 sm:p-7">
                  <div className="space-y-3 border-b border-[#252321]/10 pb-4 font-['Noto_Sans_JP','Montserrat',sans-serif] text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-medium uppercase tracking-wider text-[#736B63]">Items:</span>
                      <span className="font-mono text-sm font-bold text-[#252321]">{totalPieces} Items</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-medium uppercase tracking-wider text-[#736B63]">Pickup:</span>
                      <span className="text-right font-medium text-[#252321]">SLIIT Main Campus</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-medium uppercase tracking-wider text-[#736B63]">Order Status:</span>
                      <span className="flex items-center gap-1.5 font-bold text-[#C9362B]">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#C9362B]" />
                        READY TO CHECKOUT
                      </span>
                    </div>
                  </div>

                  <div className="flex items-end justify-between">
                    <span className="font-['Noto_Sans_JP','Montserrat',sans-serif] text-xs font-bold uppercase tracking-wider text-[#252321]">
                      Total Estimated:
                    </span>
                    <span className="font-['Jansina','Zen_Antique','Shippori_Mincho','Noto_Serif_JP',serif] text-3xl font-black tracking-wider text-[#C9362B]">
                      <CountUp value={totalLkr} prefix="LKR " />
                    </span>
                  </div>

                  <div className="space-y-2 rounded-xl border-2 border-[#252321] bg-[#EADFCB] p-3.5 text-[11px] text-[#736B63]">
                    <div className="flex items-center gap-2 font-semibold text-[#252321]">
                      <ShieldCheck className="h-4 w-4 text-[#C9362B]" />
                      <span>Official AIESEC in SLIIT Drop</span>
                    </div>
                    <p className="leading-relaxed">
                      Checking out sets your items aside for you at the seminar entrance registration desk.
                    </p>
                  </div>

                  <button
                    data-magnetic
                    onClick={openClaimModal}
                    className="group relative flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full bg-[#B51E23] px-6 py-4 font-['Noto_Sans_JP','Montserrat',sans-serif] text-xs font-bold uppercase tracking-[0.24em] text-white shadow-[0_4px_14px_rgba(181,30,35,0.30)] transition-colors before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:transition-transform before:duration-700 hover:bg-[#9E171C] hover:before:translate-x-full"
                  >
                    <span>CHECKOUT</span>
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── WISHLIST ── */}
        <section id="wishlist" className="relative mt-24 pt-4">
          <WaveDivider className="mb-14" />

          <div className="mb-8 flex items-center justify-between" data-reveal="up">
            <div className="flex items-center gap-3">
              <Heart className="h-6 w-6 fill-[#C9362B] text-[#C9362B]" />
              <div>
                <span className="mb-1 block font-['Noto_Sans_JP','Montserrat',sans-serif] text-[10px] font-bold uppercase tracking-[0.25em] text-[#C9362B]">
                  YOUR SAVED PIECES
                </span>
                <h3 className="brush-heading font-['Jansina','Zen_Antique','Shippori_Mincho','Noto_Serif_JP',serif] text-3xl uppercase tracking-wider text-[#1B0209] sm:text-4xl">
                  WISHLIST ({wishlist.length})
                </h3>
              </div>
            </div>
          </div>

          {wishlist.length === 0 ? (
            <p className="font-['Shippori_Mincho','Noto_Serif_JP',serif] text-sm text-[#736B63]">
              You have no items saved in your wishlist. Browse the collection and tap the heart icon on any piece.
            </p>
          ) : (
            <div data-reveal-group className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {wishlist.map((id) => {
                const item = getProductById(id);
                if (!item) return null;
                return (
                  <div
                    key={item.id}
                    className="group flex items-center justify-between gap-4 rounded-2xl border-2 border-[#252321] bg-white p-4 shadow-[4px_4px_0_#252321] transition-all duration-300 hover:-translate-y-1 hover:border-[#C9362B] hover:shadow-[4px_4px_0_#C9362B]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-[#252321] bg-[#E6D9C0] p-1">
                        <div
                          aria-hidden="true"
                          className="absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C9362B]/15"
                        />
                        <img src={item.images[0]} alt={item.name} className="relative h-full w-full object-contain" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-['Jansina','Zen_Antique','Shippori_Mincho','Noto_Serif_JP',serif] text-lg font-bold text-[#252321]">{item.name}</p>
                        <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-[#C9362B]">
                          {item.variant}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const size = item.options?.sizes ? item.options.sizes[0] : undefined;
                          addToCart(item, size, 1);
                        }}
                        className="cursor-pointer rounded-full bg-[#C9362B] p-2 text-xs text-white shadow-xs transition-all hover:scale-110 hover:bg-[#9E171C]"
                        title="Add to cart"
                        aria-label="Add to cart"
                      >
                        <Plus size={16} />
                      </button>

                      <button
                        onClick={() => toggleWishlist(item.id)}
                        className="cursor-pointer rounded-full border border-[#E5DDD0] p-2 text-[#736B63] transition-colors hover:border-[#C9362B] hover:text-[#C9362B]"
                        title="Remove from wishlist"
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <ClaimConfirmationModal />
      <MerchToast />
    </div>
  );
};

export default CartPage;