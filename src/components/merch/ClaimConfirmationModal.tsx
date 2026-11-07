import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, ShieldCheck, QrCode } from 'lucide-react';
import { useMerch } from '../../context/MerchContext';

export const ClaimConfirmationModal: React.FC = () => {
  const { isClaimModalOpen, closeClaimModal, cartItems, clearCart } = useMerch();
  const [delegateId, setDelegateId] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [claimReference, setClaimReference] = useState('');

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const randomRef = 'CAT7-CLAIM-' + Math.floor(100000 + Math.random() * 900000);
    setClaimReference(randomRef);
    setIsSuccess(true);
    clearCart();
  };

  const handleClose = () => {
    closeClaimModal();
    setTimeout(() => {
      setIsSuccess(false);
      setDelegateId('');
    }, 300);
  };

  return (
    <AnimatePresence>
      {isClaimModalOpen && (
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
                    OFFICIAL DELEGATE CLAIM
                  </span>
                </div>

                <h3 className="brush-heading font-['Osaka_Bright','Bison',sans-serif] text-3xl sm:text-4xl uppercase tracking-wider text-[#252321] mb-3">
                  CONFIRM MERCHANDISE RESERVATION
                </h3>

                <p className="font-['Droid_Serif',Georgia,serif] italic text-xs sm:text-sm text-[#736B63] leading-relaxed mb-6">
                  Items will be prepared for collection at the official Catalyst 7.0 registration pavilion. Please provide your delegate identification or badge name.
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
                  <div>
                    <label className="block text-[11px] font-['Montserrat',sans-serif] tracking-widest uppercase text-[#736B63] font-bold mb-2">
                      Delegate Name / Badge ID
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SLIIT-DEL-2026 / Kasun Perera"
                      value={delegateId}
                      onChange={(e) => setDelegateId(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-white border border-[#E5DDD0] text-[#252321] text-sm focus:outline-none focus:border-[#C9362B] transition-colors shadow-xs"
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-white/80 border border-[#E5DDD0] flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-[#C9362B] shrink-0 mt-0.5" />
                    <p className="text-[11px] text-[#736B63] leading-normal font-sans">
                      <strong className="text-[#252321]">Frontend Demo Experience:</strong> This reservation simulates the delegate badge claim protocol. Official distribution occurs on event dates at the SLIIT Campus.
                    </p>
                  </div>

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
                      className="flex-1 py-3 px-4 rounded-full bg-[#C9362B] hover:bg-[#9E171C] text-xs font-['Montserrat',sans-serif] font-bold tracking-widest uppercase text-white shadow-[0_4px_16px_rgba(201,54,43,0.3)] transition-all cursor-pointer"
                    >
                      Confirm Reservation
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
                  MERCHANDISE CLAIMED
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
                      <QrCode className="w-12 h-12 text-[#252321]" />
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
