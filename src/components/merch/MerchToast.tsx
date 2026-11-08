import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useMerch } from '../../context/MerchContext';
import { Sparkles } from 'lucide-react';

export const MerchToast: React.FC = () => {
  const { toast } = useMerch();

  return (
    <AnimatePresence>
      {toast && toast.visible && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-0 bottom-24 z-[65] mx-auto flex w-fit max-w-[calc(100vw-2rem)] items-center gap-3 px-5 py-3.5 rounded-xl bg-white border border-[#E5DDD0] text-[#252321] shadow-[0_10px_30px_rgba(37,35,33,0.12),0_0_20px_rgba(201,54,43,0.12)] pointer-events-none"
        >
          <div className="w-2 h-2 rounded-full bg-[#C9362B] animate-pulse" />
          <p className="text-xs font-['Montserrat',sans-serif] tracking-wider uppercase font-semibold">
            {toast.message}
          </p>
          <Sparkles className="w-3.5 h-3.5 text-[#C9362B]" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};