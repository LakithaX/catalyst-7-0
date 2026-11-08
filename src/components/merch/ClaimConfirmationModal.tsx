import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useMerch } from '../../context/MerchContext';
import EmailSignIn, { useSession } from '../EmailSignIn';
import { quoteOrder, placeOrder, type OrderQuote } from '../../lib/booking';
import { useCatalog } from '../../context/CatalogContext';
import { errorMessage } from '../../lib/supabase';

export const ClaimConfirmationModal: React.FC = () => {
  const { isClaimModalOpen, closeClaimModal, cartItems, clearCart } = useMerch();
  const { session } = useSession();
  const { comingSoon } = useCatalog();
  const delegateId = session?.user.email || '';
  const [quote, setQuote] = useState<OrderQuote | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const orderKey = useRef(crypto.randomUUID());
  const busyRef = useRef(false);
  useEffect(() => {
    if (!isClaimModalOpen || !cartItems.length) return;
    let active = true;
    setQuote(null); setError('');
    orderKey.current = crypto.randomUUID();
    quoteOrder(cartItems).then(q => { if (active) setQuote(q); }).catch(e => { if (active) setError(errorMessage(e)); });
    return () => { active = false; };
  }, [isClaimModalOpen, cartItems, session?.user.id]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [claimReference, setClaimReference] = useState('');

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busyRef.current || !quote || !session || comingSoon) return;
    busyRef.current = true; setBusy(true); setError('');
    try {
      const result = await placeOrder(orderKey.current, quote);
      setClaimReference(result.reference);
      setIsSuccess(true);
      clearCart();
    } catch (error) { setError(errorMessage(error)); }
    finally { busyRef.current = false; setBusy(false); }
  };

  const handleClose = () => {
    if (busyRef.current) return;
    closeClaimModal();
    setTimeout(() => {
      setIsSuccess(false);

    }, 300);
  };

  return (
    <AnimatePresence>
      {isClaimModalOpen && !comingSoon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[#E5DDD0] bg-[#FAF6EE] p-6 sm:p-8 shadow-2xl text-[#252321] z-10"
          >
            {/* Corner Decorative Seal */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#C9362B]/10 to-transparent pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-5 right-5 p-2 rounded-full text-[#736B63] hover:text-[#252321] hover:bg-[#252321]/5 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            {!isSuccess ? (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C9362B]" />
                  <span className="font-['Montserrat',sans-serif] text-[10px] tracking-[0.25em] text-[#C9362B] uppercase font-bold">
                    OFFICIAL DELEGATE PRE-ORDER
                  </span>
                </div>

                <h3 className="brush-heading font-['Osaka_Bright','Bison',sans-serif] text-3xl sm:text-4xl uppercase tracking-wider text-[#252321] mb-3">
                  CONFIRM MERCHANDISE RESERVATION
                </h3>

                <p className="font-['Droid_Serif',Georgia,serif] italic text-xs sm:text-sm text-[#736B63] leading-relaxed mb-6">
                  Items will be prepared for collection at the official Catalyst 7.0 registration pavilion. Sign in with the email used for your delegate registration.
                </p>

                {/* Items Summary */}
                <div className="max-h-48 overflow-y-auto pr-1 mb-6 space-y-2 border-y border-[#252321]/10 py-3">
                  {cartItems.map((item) => (
                    <div key={item.cartId} className="flex items-center justify-between text-xs py-1">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 object-contain rounded-lg bg-[#F8F3E9] border border-[#E5DDD0] p-1"
                        />
                        <div>
                          <p className="font-['Bison',sans-serif] font-bold text-sm tracking-wide text-[#252321]">
                            {item.name}
                          </p>
                          <p className="text-[#C9362B] text-[10px] tracking-wider uppercase font-semibold">
                            {item.variant} {item.size ? `· SIZE ${item.size}` : ''}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono text-xs text-[#736B63] font-medium">Qty: {item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Form */}
                <form onSubmit={handleConfirm} className="space-y-4">
                  <EmailSignIn />
                  {quote && <p className="font-semibold">Order total: LKR {(quote.totalMinor / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>}
                  {!quote && !error && <p role="status">Checking current prices and availability…</p>}
                  {error && <p role="alert" className="text-sm text-[#C9362B]">{error}</p>}
                  <p className="text-xs text-[#736B63]">Payment is verified by event staff. Keep your order reference for collection.</p>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="flex-1 py-3 px-4 rounded-full border border-[#E5DDD0] bg-white text-xs font-['Montserrat',sans-serif] tracking-widest uppercase text-[#736B63] hover:text-[#252321] hover:border-[#252321]/30 transition-colors cursor-pointer font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={busy || !quote || !session}
                      className="flex-1 py-3 px-4 rounded-full bg-[#C9362B] hover:bg-[#9E171C] text-xs font-['Montserrat',sans-serif] font-bold tracking-widest uppercase text-white shadow-[0_4px_16px_rgba(201,54,43,0.3)] transition-all cursor-pointer"
                    >
                      {busy ? 'Placing pre-order…' : 'Confirm Pre-order'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Success Confirmation */
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#C9362B]/10 text-[#C9362B] mb-4">
                  <CheckCircle2 size={36} />
                </div>

                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C9362B]" />
                  <span className="font-['Montserrat',sans-serif] text-[10px] tracking-[0.25em] text-[#C9362B] uppercase font-bold">
                    RESERVATION RECORDED
                  </span>
                </div>

                <h3 className="brush-heading font-['Osaka_Bright','Bison',sans-serif] text-4xl uppercase tracking-wider text-[#252321] mb-2">
                  MERCHANDISE RESERVED
                </h3>

                <p className="font-['Droid_Serif',Georgia,serif] italic text-sm text-[#736B63] mb-6">
                  Thank you, <span className="text-[#252321] font-semibold">{delegateId}</span>. Your Catalyst 7.0 merchandise pass is logged.
                </p>

                <div className="bg-white border border-[#E5DDD0] rounded-xl p-5 mb-6 text-left shadow-xs">
                  <div className="flex items-center justify-between border-b border-[#252321]/10 pb-3 mb-3">
                    <span className="text-[10px] font-['Montserrat',sans-serif] tracking-widest text-[#736B63] uppercase font-bold">
                      Claim Reference
                    </span>
                    <span className="font-mono text-sm font-bold text-[#C9362B] tracking-wider">
                      {claimReference}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-[#F8F3E9] rounded-lg border border-[#E5DDD0]">
                      <ShieldCheck className="w-12 h-12 text-[#252321]" />
                    </div>
                    <div className="text-xs text-[#736B63] space-y-1">
                      <p className="text-[#252321] font-semibold">SLIIT Main Auditorium</p>
                      <p>Show this confirmation at the Catalyst registration booth on Day 1.</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  className="w-full py-3.5 px-6 rounded-full bg-[#C9362B] hover:bg-[#9E171C] text-white font-['Montserrat',sans-serif] font-bold text-xs tracking-widest uppercase shadow-[0_4px_16px_rgba(201,54,43,0.3)] transition-all cursor-pointer"
                >
                  Return to Collection
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
