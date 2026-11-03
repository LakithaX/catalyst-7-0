import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, ArrowRight, User, Mail, Phone, School, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    institution: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate submission delay
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 700);
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setFormData({ fullName: '', email: '', phone: '', institution: '' });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleResetAndClose}
            className="fixed inset-0 bg-[#0e1118]/70 backdrop-blur-sm cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-lg bg-[#FAF6EE] text-[#252321] rounded-2xl sm:rounded-3xl shadow-2xl border border-[#E5DDD0] overflow-hidden z-10 my-auto"
          >
            {/* Top Crimson Accent Strip */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#8F171B] via-[#C9362B] to-[#B51E23]" />

            {/* Close Button */}
            <button
              onClick={handleResetAndClose}
              className="absolute top-4 right-4 p-2 rounded-full text-[#736B63] hover:text-[#252321] hover:bg-[#252321]/5 transition-colors cursor-pointer"
              aria-label="Close registration dialog"
            >
              <X size={20} />
            </button>

            <div className="p-6 sm:p-8">
              {!isSubmitted ? (
                <>
                  {/* Header */}
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-[#C9362B]/30 bg-[#C9362B]/5 mb-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C9362B]" />
                      <span className="font-['Noto_Sans_JP',sans-serif] text-[10px] tracking-[0.25em] text-[#C9362B] uppercase font-bold">
                        CATALYST 7.0 · 参加登録
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C9362B]" />
                    </div>

                    <h3 className="font-serif text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#252321]">
                      DELEGATE REGISTRATION
                    </h3>
                    <p className="font-sans text-xs sm:text-sm text-[#736B63] mt-1.5 max-w-sm mx-auto leading-relaxed">
                      Secure your place in AIESEC in SLIIT's transformative two-day leadership development seminar.
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-['Montserrat',sans-serif] font-bold tracking-wider text-[#252321] uppercase mb-1.5">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#736B63]" />
                        <input
                          type="text"
                          name="fullName"
                          required
                          value={formData.fullName}
                          onChange={handleChange}
                          placeholder="e.g. Kasun Perera"
                          className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl border border-[#E5DDD0] bg-white text-xs sm:text-sm text-[#252321] placeholder-[#736B63]/60 focus:outline-none focus:border-[#C9362B] focus:ring-1 focus:ring-[#C9362B] transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-['Montserrat',sans-serif] font-bold tracking-wider text-[#252321] uppercase mb-1.5">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#736B63]" />
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="kasun@example.com"
                          className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl border border-[#E5DDD0] bg-white text-xs sm:text-sm text-[#252321] placeholder-[#736B63]/60 focus:outline-none focus:border-[#C9362B] focus:ring-1 focus:ring-[#C9362B] transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-['Montserrat',sans-serif] font-bold tracking-wider text-[#252321] uppercase mb-1.5">
                          WhatsApp / Phone *
                        </label>
                        <div className="relative">
                          <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#736B63]" />
                          <input
                            type="tel"
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+94 7X XXX XXXX"
                            className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl border border-[#E5DDD0] bg-white text-xs sm:text-sm text-[#252321] placeholder-[#736B63]/60 focus:outline-none focus:border-[#C9362B] focus:ring-1 focus:ring-[#C9362B] transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-['Montserrat',sans-serif] font-bold tracking-wider text-[#252321] uppercase mb-1.5">
                          University / Faculty *
                        </label>
                        <div className="relative">
                          <School size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#736B63]" />
                          <input
                            type="text"
                            name="institution"
                            required
                            value={formData.institution}
                            onChange={handleChange}
                            placeholder="e.g. SLIIT Computing"
                            className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl border border-[#E5DDD0] bg-white text-xs sm:text-sm text-[#252321] placeholder-[#736B63]/60 focus:outline-none focus:border-[#C9362B] focus:ring-1 focus:ring-[#C9362B] transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full mt-2 py-3.5 rounded-xl bg-[#B51E23] hover:bg-[#9E171C] text-white font-['Montserrat',sans-serif] text-xs sm:text-sm font-bold tracking-[0.2em] uppercase shadow-[0_6px_22px_rgba(181,30,35,0.38)] hover:shadow-[0_10px_28px_rgba(181,30,35,0.48)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <span>PROCESSING REGISTRATION...</span>
                      ) : (
                        <>
                          <span>COMPLETE REGISTRATION</span>
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                /* Confirmation Screen */
                <div className="text-center py-6 sm:py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#C9362B]/10 border border-[#C9362B]/30 flex items-center justify-center text-[#C9362B]">
                    <CheckCircle2 size={36} />
                  </div>

                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-[#C9362B]/30 bg-[#C9362B]/5 mb-3">
                    <span className="font-['Noto_Sans_JP',sans-serif] text-[10px] tracking-[0.25em] text-[#C9362B] uppercase font-bold">
                      登録完了 · WELCOME DELEGATE
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl sm:text-3xl font-extrabold uppercase text-[#252321] mb-2">
                    REGISTRATION CONFIRMED!
                  </h3>

                  <p className="font-sans text-xs sm:text-sm text-[#4A4540] max-w-sm mx-auto leading-relaxed mb-6">
                    Welcome to Catalyst 7.0, <strong className="text-[#252321]">{formData.fullName}</strong>. Our organizing committee has received your details and will send your official seminar delegate pass to <span className="text-[#C9362B] font-mono">{formData.email}</span>.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                      to="/merch"
                      onClick={handleResetAndClose}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#B51E23] hover:bg-[#9E171C] text-white font-['Montserrat',sans-serif] text-xs font-bold tracking-[0.16em] uppercase shadow-[0_6px_20px_rgba(181,30,35,0.3)] transition-all cursor-pointer"
                    >
                      <Sparkles size={14} />
                      <span>EXPLORE MERCH</span>
                    </Link>

                    <button
                      onClick={handleResetAndClose}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl border border-[#252321]/30 hover:bg-[#252321] hover:text-[#FAF6EE] font-['Montserrat',sans-serif] text-xs font-bold tracking-[0.16em] uppercase transition-all cursor-pointer"
                    >
                      CLOSE
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
