import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, ArrowRight, ShoppingBag, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMerch } from '../../context/MerchContext';

export const CartDrawer: React.FC = () => {
  const { isCartOpen, closeCart, cartItems, removeFromCart, updateQuantity, openClaimModal } = useMerch();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-[70] flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
          />

          {/* Drawer Content */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: '0%' }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md h-full bg-[#FAF6EE] border-l border-[#E5DDD0] shadow-2xl flex flex-col z-10 text-[#252321]"
          >
            {/* Header */}
            <div className="p-6 border-b border-[#252321]/10 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C9362B]" />
                  <span className="font-['Montserrat',sans-serif] text-[10px] tracking-[0.25em] text-[#C9362B] uppercase font-bold">
                    CATALYST 7.0
                  </span>
                </div>
                <h3 className="brush-heading font-['Jansina','Bison',sans-serif] text-2xl uppercase tracking-wider text-[#252321]">
                  YOUR CART ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})
                </h3>
              </div>
              <button
                onClick={closeCart}
                className="p-2 rounded-full text-[#736B63] hover:text-[#252321] hover:bg-[#252321]/5 transition-colors cursor-pointer"
                aria-label="Close cart drawer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-[#252321]/5 flex items-center justify-center p-3 mb-4">
                    <img
                      src="/assets/illustrations/jakeloris-fan-7039967.png"
                      alt="Japanese Fan"
                      className="w-full h-auto object-contain filter drop-shadow-[0_4px_10px_rgba(201,54,43,0.18)]"
                    />
                  </div>
                  <h4 className="brush-heading font-['Jansina','Bison',sans-serif] text-2xl uppercase tracking-wider text-[#252321] mb-2">
                    YOUR CART IS EMPTY
                  </h4>
                  <p className="font-['Droid_Serif',Georgia,serif] italic text-xs text-[#736B63] max-w-xs mb-6">
                    Your cart is empty. Explore the official collection and add the pieces you love.
                  </p>
                  <button
                    onClick={closeCart}
                    className="py-2.5 px-6 rounded-full border border-[#C9362B] text-xs font-['Montserrat',sans-serif] tracking-widest uppercase text-[#C9362B] hover:bg-[#C9362B]/5 transition-colors cursor-pointer font-bold"
                  >
                    Explore Collection
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.cartId}
                    className="flex gap-4 p-3.5 rounded-xl bg-white border border-[#E5DDD0] relative group shadow-xs"
                  >
                    {/* Item Image */}
                    <div className="w-20 h-20 rounded-lg bg-[#F8F3E9] border border-[#E5DDD0] flex items-center justify-center p-2 shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.12)]"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between mb-0.5">
                        <span className="text-[9px] font-['Montserrat',sans-serif] tracking-wider text-[#C9362B] uppercase font-bold block">
                          {item.category}
                        </span>
                        {item.priceDisplay && (
                          <span className="font-['Jansina','Bison',sans-serif] text-sm font-black text-[#C9362B]">
                            {item.priceDisplay}
                          </span>
                        )}
                      </div>
                      <h5 className="font-['Jansina','Bison',sans-serif] font-bold text-base tracking-wide text-[#252321] truncate">
                        {item.name}
                      </h5>
                      <p className="text-xs text-[#736B63] uppercase tracking-wider truncate mb-2">
                        {item.variant}
                      </p>

                      {/* Size Badge */}
                      {item.size && (
                        <span className="inline-block px-2 py-0.5 rounded bg-[#FAF6EE] border border-[#E5DDD0] text-[10px] font-mono text-[#C9362B] font-bold mb-2">
                          SIZE: {item.size}
                        </span>
                      )}

                      {/* Quantity & Delete Controls */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center border border-[#E5DDD0] rounded-md overflow-hidden bg-[#F8F3E9]">
                          <button
                            onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center bg-white text-xs text-[#252321] hover:bg-[#F3ECE0] cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-xs font-mono font-bold text-[#252321]">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center bg-white text-xs text-[#252321] hover:bg-[#F3ECE0] cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.cartId)}
                          className="p-1.5 text-[#736B63] hover:text-[#C9362B] transition-colors cursor-pointer"
                          aria-label="Remove item"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer / Actions */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-[#252321]/10 bg-[#F3ECE0] space-y-4">
                <div className="flex items-center justify-between text-xs font-['Montserrat',sans-serif] tracking-wider uppercase">
                  <span className="text-[#736B63] font-medium">Items:</span>
                  <span className="text-[#252321] font-mono font-bold text-sm">
                    {cartItems.reduce((acc, item) => acc + item.quantity, 0)} Items
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-['Montserrat',sans-serif] tracking-wider uppercase pt-1 border-t border-[#252321]/10">
                  <span className="text-[#252321] font-bold">Estimated Total:</span>
                  <span className="text-[#C9362B] font-['Jansina','Bison',sans-serif] font-black text-xl tracking-wider">
                    LKR {cartItems.reduce((acc, item) => acc + (item.priceLkr || 0) * item.quantity, 0).toLocaleString()}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-white/80 border border-[#E5DDD0] text-[11px] text-[#736B63] flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-[#C9362B] shrink-0 mt-0.5" />
                  <p>
                    Official Catalyst 7.0 delegate merchandise. Pick up in person on seminar dates at SLIIT Campus.
                  </p>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      closeCart();
                      openClaimModal();
                    }}
                    className="w-full py-3.5 px-4 rounded-full bg-[#C9362B] hover:bg-[#9E171C] text-xs font-['Montserrat',sans-serif] font-bold tracking-widest uppercase text-white shadow-[0_4px_16px_rgba(201,54,43,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Checkout</span>
                    <ArrowRight size={14} />
                  </button>

                  <Link
                    to="/merch/cart"
                    onClick={closeCart}
                    className="w-full py-2.5 px-4 rounded-full border border-[#E5DDD0] bg-white text-center block text-xs font-['Montserrat',sans-serif] tracking-widest uppercase text-[#736B63] hover:text-[#252321] hover:border-[#252321]/30 transition-colors font-semibold"
                  >
                    View Full Cart
                  </Link>
                </div>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};