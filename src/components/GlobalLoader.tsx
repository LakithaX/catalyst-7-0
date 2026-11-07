import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

const TWEEN_EASING: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const GlobalLoader: React.FC = () => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      key="global-loader"
      role="status"
      aria-live="polite"
      aria-label="Loading Catalyst 7.0"
      className="fixed inset-0 z-[99999] flex min-h-[100svh] w-full items-center justify-center bg-[#F8F3E9] px-6 pointer-events-auto select-none"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: reduceMotion ? 1 : 1.015 }}
      transition={{ duration: reduceMotion ? 0.15 : 0.4, ease: TWEEN_EASING }}
    >
      <div className="flex flex-col items-center text-center" aria-hidden="true">
        <div className="relative flex h-60 w-60 sm:h-72 sm:w-72 items-center justify-center">
          <svg viewBox="0 0 280 280" fill="none" className="absolute inset-0 h-full w-full overflow-visible">
            {/* Uneven, open-ended strokes keep the ring closer to ink than a spinner. */}
            <motion.path
              d="M 205 43 C 264 76 271 160 235 213 C 199 266 114 275 61 231 C 12 191 13 112 52 62 C 88 17 162 12 211 41"
              stroke="#C9362B"
              strokeWidth="13"
              strokeLinecap="round"
              initial={{ pathLength: reduceMotion ? 1 : 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: reduceMotion ? 0 : 0.75, ease: TWEEN_EASING }}
            />
            <motion.path
              d="M 213 53 C 251 88 258 157 226 204 C 192 251 119 260 71 223 C 27 188 24 121 61 71 C 93 30 155 23 191 35"
              stroke="#9E2722"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.45"
              initial={{ pathLength: reduceMotion ? 1 : 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: reduceMotion ? 0 : 0.75, delay: reduceMotion ? 0 : 0.06, ease: TWEEN_EASING }}
            />
            <path d="M 58 51 L 69 41 M 229 220 L 222 231 M 32 167 L 35 181" stroke="#C9362B" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
          </svg>
          <motion.img
            src="/assets/catalyst_7_logo.png"
            alt=""
            className="relative w-36 sm:w-44 h-auto object-contain"
            initial={{ opacity: reduceMotion ? 1 : 0, scale: reduceMotion ? 1 : 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: reduceMotion ? 0 : 0.5, ease: TWEEN_EASING }}
          />
        </div>
        <p className="mt-8 font-['Montserrat',sans-serif] text-[10px] sm:text-[11px] font-bold tracking-[0.28em] text-[#736B63] uppercase leading-relaxed">
          Enter the experience
        </p>
        <span className="mt-4 h-px w-10 bg-[#C9362B]/40" />
      </div>
    </motion.div>
  );
};

export default GlobalLoader;
