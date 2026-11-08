import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2, ArrowRight, ShieldCheck, Heart, ShoppingBag, Plus } from 'lucide-react';
import { useMerch } from '../context/MerchContext';
import { getProductById } from '../data/merchProducts';
import { useCatalog } from '../context/CatalogContext';
import ShopUnavailable from '../components/merch/ShopUnavailable';
import Navbar from '../components/Navbar';
import { ClaimConfirmationModal } from '../components/merch/ClaimConfirmationModal';
import { MerchToast } from '../components/merch/MerchToast';

export const CartPage: React.FC = () => {
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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = 'My Claim Bag — Catalyst 7.0 Merch';
  }, []);

  const {comingSoon, loading, error} = useCatalog();
  if (comingSoon || loading || error) return <><Navbar/><ShopUnavailable/></>;
  const totalPieces = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#F8F3E9] text-[#252321] flex flex-col selection:bg-[#C9362B] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <Link
            to="/merch"
            className="inline-flex items-center gap-2 text-xs font-['Montserrat',sans-serif] tracking-widest text-[#736B63] hover:text-[#C9362B] uppercase transition-colors mb-4 font-semibold"
          >
            <ArrowLeft size={14} />
            <span>CONTINUE BROWSING</span>
          </Link>

          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9362B]" />
            <span className="font-['Montserrat',sans-serif] text-xs tracking-[0.25em] text-[#C9362B] uppercase font-bold">
              CATALYST 7.0 RESERVATIONS
            </span>
          </div>

          <h1 className="brush-heading font-['Osaka_Bright','Bison',sans-serif] text-4xl sm:text-6xl uppercase tracking-wider text-[#252321]">
            MERCHANDISE CLAIM BAG
          </h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="py-20 text-center rounded-2xl bg-white border border-[#E5DDD0] p-8 max-w-xl mx-auto shadow-xs">
            <div className="w-24 h-24 rounded-full bg-[#F8F3E9] border border-[#E5DDD0] mx-auto flex items-center justify-center p-3 mb-6 shadow-xs">
              <img
                src="/assets/illustrations/jakeloris-fan-7039967.png"
                alt="Japanese Fan"
                className="w-full h-auto object-contain filter drop-shadow-[0_4px_12px_rgba(201,54,43,0.2)]"
              />
            </div>

            <h2 className="brush-heading font-['Osaka_Bright','Bison',sans-serif] text-3xl uppercase tracking-wider text-[#252321] mb-3">
              YOUR CLAIM BAG IS CURRENTLY EMPTY
            </h2>

            <p className="font-['Droid_Serif',Georgia,serif] italic text-sm text-[#736B63] mb-8 leading-relaxed">
              Explore the official Catalyst 7.0 merchandise collection and reserve pieces for pickup at the seminar.
            </p>

            <Link
              to="/merch"
              className="inline-flex items-center gap-2 py-3.5 px-8 rounded-full bg-[#C9362B] hover:bg-[#9E171C] text-xs font-['Montserrat',sans-serif] font-bold tracking-widest uppercase text-white shadow-[0_4px_16px_rgba(201,54,43,0.25)] transition-all"
            >
              <span>EXPLORE THE COLLECTION</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#252321]/10 text-xs font-['Montserrat',sans-serif] text-[#736B63] uppercase tracking-wider font-semibold">
                <span>ITEMS ({cartItems.length})</span>
                <button
                  onClick={clearCart}
                  className="hover:text-[#C9362B] transition-colors cursor-pointer"
                >
                  Clear Bag
                </button>
              </div>

              {cartItems.map((item) => (
                <div
                  key={item.cartId}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl bg-white border border-[#E5DDD0] transition-all hover:border-[#C9362B]/50 shadow-xs"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-[#F8F3E9] border border-[#E5DDD0] p-2 flex items-center justify-center shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.12)]"
                      />
                    </div>

                    <div className="min-w-0">
                      <span className="text-[9px] font-['Montserrat',sans-serif] tracking-wider text-[#C9362B] uppercase font-bold block">
                        {item.category}
                      </span>
                      <Link
                        to={`/merch/${item.productId}`}
                        className="brush-heading font-['Osaka_Bright','Bison',sans-serif] text-xl sm:text-2xl uppercase tracking-wider text-[#252321] hover:text-[#C9362B] transition-colors truncate block"
                      >
                        {item.name}
                      </Link>
                      <p className="font-mono text-xs text-[#736B63] uppercase tracking-wider mb-1.5">
                        {item.variant}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {item.size && (
                          <span className="inline-block px-2 py-0.5 rounded bg-[#FAF6EE] border border-[#E5DDD0] text-[10px] font-mono text-[#C9362B] font-bold">
                            SIZE: {item.size}
                          </span>
                        )}
                        {item.priceDisplay && (
                          <span className="inline-block px-2.5 py-0.5 rounded bg-[#C9362B]/10 border border-[#C9362B]/30 text-xs font-['Bison',sans-serif] text-[#C9362B] font-black tracking-wider">
                            {item.priceDisplay}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quantity and Remove */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-[#252321]/10">
                    <div className="flex items-center border border-[#E5DDD0] rounded-md bg-[#F8F3E9] overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-sm text-[#736B63] hover:text-[#252321] hover:bg-white transition-colors cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="w-10 text-center font-mono text-xs font-bold text-[#252321]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-sm text-[#736B63] hover:text-[#252321] hover:bg-white transition-colors cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.cartId)}
                      className="p-2 text-[#736B63] hover:text-[#C9362B] transition-colors cursor-pointer"
                      title="Remove piece"
                      aria-label="Remove item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Claim Summary & Actions */}
            <div className="lg:col-span-4">
              <div className="rounded-2xl bg-white border border-[#E5DDD0] p-6 sm:p-7 shadow-md space-y-6">
                <div>
                  <span className="text-[10px] font-['Montserrat',sans-serif] tracking-[0.25em] text-[#C9362B] uppercase font-bold block mb-1">
                    CONFIRMATION PROTOCOL
                  </span>
                  <h3 className="brush-heading font-['Osaka_Bright','Bison',sans-serif] text-3xl uppercase tracking-wider text-[#252321]">
                    CLAIM SUMMARY
                  </h3>
                </div>

                <div className="space-y-3 border-y border-[#252321]/10 py-4 text-xs font-['Montserrat',sans-serif]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#736B63] uppercase tracking-wider font-medium">Total Pieces:</span>
                    <span className="font-mono font-bold text-[#252321] text-sm">{totalPieces} Items</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#736B63] uppercase tracking-wider font-medium">Pickup Venue:</span>
                    <span className="text-[#252321] text-right font-medium">SLIIT Main Campus</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#736B63] uppercase tracking-wider font-medium">Claim Status:</span>
                    <span className="text-[#C9362B] font-bold">READY TO RESERVE</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#252321]/10">
                    <span className="text-[#252321] uppercase tracking-wider font-bold">Total Estimated:</span>
                    <span className="font-['Bison',sans-serif] font-black text-2xl text-[#C9362B] tracking-wider">
                      LKR {cartItems.reduce((acc, i) => acc + (i.priceLkr || 0) * i.quantity, 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAF6EE] border border-[#E5DDD0] text-[11px] text-[#736B63] space-y-2">
                  <div className="flex items-center gap-2 text-[#252321] font-semibold">
                    <ShieldCheck className="w-4 h-4 text-[#C9362B]" />
                    <span>Official AIESEC in SLIIT Drop</span>
                  </div>
                  <p className="leading-relaxed">
                    Reserving items guarantees inventory allocation for ticket holders at the seminar entrance registration desk.
                  </p>
                </div>

                <button
                  onClick={openClaimModal}
                  className="w-full py-4 px-6 rounded-full bg-[#C9362B] hover:bg-[#9E171C] text-xs font-['Montserrat',sans-serif] font-bold tracking-[0.24em] uppercase text-white shadow-[0_4px_20px_rgba(201,54,43,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>COMPLETE RESERVATION</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── WISHLIST DRAWER SECTION ── */}
        <section id="wishlist" className="mt-24 pt-16 border-t border-[#252321]/10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Heart className="w-6 h-6 text-[#C9362B] fill-[#C9362B]" />
              <div>
                <span className="font-['Montserrat',sans-serif] text-[10px] tracking-[0.25em] text-[#C9362B] uppercase font-bold block mb-1">
                  YOUR SAVED PIECES
                </span>
                <h3 className="brush-heading font-['Osaka_Bright','Bison',sans-serif] text-3xl sm:text-4xl uppercase tracking-wider text-[#252321]">
                  WISHLIST ({wishlist.length})
                </h3>
              </div>
            </div>
          </div>

          {wishlist.length === 0 ? (
            <p className="font-['Droid_Serif',Georgia,serif] italic text-sm text-[#736B63]">
              You have no items saved in your wishlist. Browse the collection and tap the heart icon on any piece.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.map((id) => {
                const item = getProductById(id);
                if (!item) return null;
                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-white border border-[#E5DDD0] shadow-xs flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-16 h-16 rounded-lg bg-[#F8F3E9] border border-[#E5DDD0] p-1 shrink-0 flex items-center justify-center">
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-['Bison',sans-serif] text-lg font-bold text-[#252321] truncate">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-[#C9362B] uppercase tracking-wider truncate font-semibold">
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
                        className="p-2 rounded-full bg-[#C9362B] hover:bg-[#9E171C] text-white text-xs transition-colors cursor-pointer shadow-xs"
                        title="Add to claim bag"
                      >
                        <Plus size={16} />
                      </button>

                      <button
                        onClick={() => toggleWishlist(item.id)}
                        className="p-2 rounded-full border border-[#E5DDD0] hover:border-[#C9362B] text-[#736B63] hover:text-[#C9362B] transition-colors cursor-pointer"
                        title="Remove from wishlist"
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
