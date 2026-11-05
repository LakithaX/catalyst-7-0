import React from 'react';
import { motion } from 'motion/react';
import LiquidWaveSpinner from './ui/spinner-10';

const TWEEN_EASING: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const GlobalLoader: React.FC = () => {
  return (
    <motion.div
      key="global-loader"
      className="fixed inset-0 z-[99999] flex h-screen w-full items-center justify-center bg-white pointer-events-auto select-none"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.4, ease: TWEEN_EASING }}
    >
      <LiquidWaveSpinner size="md" />
    </motion.div>
  );
};

export default GlobalLoader;
