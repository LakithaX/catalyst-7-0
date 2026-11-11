import React, { useEffect } from 'react';
import { TagMark } from '../components/brand/CatalystTag';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import { scrollTopOrRestore } from '../utils/navState';

export const GameComingSoonPage: React.FC = () => {
  useEffect(() => {
    scrollTopOrRestore();
    document.title = 'Catalyst 7.0 | Coming Soon';
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F3E9] text-[#252321] flex flex-col selection:bg-[#C9362B] selection:text-white select-none">
      {/* Navigation */}
      <Navbar />

      {/* ── Main Minimal Center Stage ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
        
        {/* Soft Background Japanese Kanji Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none select-none">
          <span className="font-['Shippori_Mincho',serif] text-[36vw] font-black text-[#252321]">
            武士
          </span>
        </div>

        {/* Ambient Subtle Sun Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[500px] h-[340px] sm:h-[500px] rounded-full bg-[#C9362B]/5 blur-[90px] pointer-events-none" />

        {/* Central Content Stack */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-xl mx-auto my-auto">
          
          {/* Samurai Figure */}
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative mb-6 sm:mb-8"
          >
            <motion.img
              src="/assets/illustrations/benkageyama-samurai-5135974_1920.png"
              alt="Catalyst 7.0 Samurai"
              animate={{ y: [-6, 6, -6] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-48 sm:w-60 md:w-68 h-auto object-contain filter drop-shadow-[0_20px_35px_rgba(37,35,33,0.18)] select-none pointer-events-none"
            />
          </motion.div>

          {/* Minimal Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center gap-2 mb-3 text-[11px] font-['Noto_Sans_JP',sans-serif] tracking-[0.3em] text-[#C9362B] uppercase font-bold"
          >
            <span className="w-6 h-[1.5px] bg-[#C9362B]/50" />
            <TagMark /><span>CATALYST 7.0 · 武士道</span>
            <span className="w-6 h-[1.5px] bg-[#C9362B]/50" />
          </motion.div>

          {/* Bold Minimal Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="font-['Bison',sans-serif] text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-wider text-[#252321] leading-none mb-4"
          >
            COMING SOON
          </motion.h1>

          {/* Quiet Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="font-sans text-xs sm:text-sm text-[#736B63] tracking-widest uppercase font-medium mb-8"
          >
            The arena is being prepared. Stay tuned.
          </motion.p>

          {/* Simple Clean Return Action */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Link
              to="/"
              state={{ directToHero: true }}
              className="inline-flex items-center gap-2 text-xs font-['Montserrat',sans-serif] font-bold tracking-[0.2em] uppercase text-[#736B63] hover:text-[#C9362B] transition-colors group"
            >
              <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
              <span>Back to Home</span>
            </Link>
          </motion.div>
        </div>

      </main>
    </div>
  );
};

export default GameComingSoonPage;