import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { MERCH_PRODUCTS } from '../../data/merchProducts';

// Featured products for the hero carousel matching the reference design
const HERO_SLIDES = [
  {
    id: 'delegate-tee-black',
    name: 'CATALYST 7.0',
    titleSuffix: 'MERCH',
    tagline: 'WEAR THE MOVEMENT',
    description: 'Premium merch from Catalyst 7.0 — crafted for dreamers, creators and change-makers.',
    productName: 'DELEGATE TEE',
    productVariant: 'OBSIDIAN BLACK · BUSHIDO EDITION',
    image: '/assets/catalyst-merch/del-black-front.png',
    badge: '公式商品',
  },
  {
    id: 'delegate-tee-white',
    name: 'CATALYST 7.0',
    titleSuffix: 'MERCH',
    tagline: 'PURITY IN PURPOSE',
    description: 'Minimalist off-white edition tailored in luxury heavyweight slub cotton with subtle gold foil accents.',
    productName: 'DELEGATE TEE',
    productVariant: 'PURE IVORY · LIMITED SERIES',
    image: '/assets/catalyst-merch/del-white-front.png',
    badge: '限定品',
  },
  {
    id: 'bucket-hat-tokyo',
    name: 'CATALYST 7.0',
    titleSuffix: 'MERCH',
    tagline: 'TIMELESS STREETWEAR',
    description: 'Structured silhouette woven from water-resistant matte black twill with tonal Catalyst mon embroidery.',
    productName: 'BUCKET HAT',
    productVariant: 'TOKYO EDITION · WATER-RESISTANT',
    image: '/assets/catalyst-merch/del-bucket-hat.png',
    badge: '公式商品',
  },
];

/** Individual Falling Petal */
const FloatingPetal = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <path
      d="M12 2C7 6 2 13 2 20C2 26 6 30 12 30C18 30 22 26 22 20C22 13 17 6 12 2Z"
      fill="#C9362B"
      opacity="0.88"
    />
    <path
      d="M12 2C9 7 6 14 6 20C6 25 8.5 28 12 29"
      stroke="#FFFFFF"
      strokeWidth="0.8"
      opacity="0.4"
      strokeLinecap="round"
    />
  </svg>
);

/** Authentic Japanese Enso Calligraphy Red Brush Stroke Ring (Exact Reference Match) */
const RedEnsoBrushCircle = ({ className = '' }: { className?: string }) => (
  <svg
    viewBox="0 0 600 600"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="ensoRedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#C9362B" />
        <stop offset="60%" stopColor="#B51E23" />
        <stop offset="100%" stopColor="#8F171B" />
      </linearGradient>
      <filter id="brushRoughness" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" />
      </filter>
    </defs>

    {/* Dynamic sweeping calligraphy circular brush arc */}
    <g filter="url(#brushRoughness)">
      {/* Outer Main Stroke */}
      <path
        d="M 450 130 C 560 210, 580 370, 500 480 C 420 580, 240 590, 130 520 C 30 450, 15 280, 90 170 C 170 60, 330 30, 470 90"
        stroke="url(#ensoRedGrad)"
        strokeWidth="56"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.94"
      />
      {/* Secondary Inner Texture Layer */}
      <path
        d="M 430 145 C 530 220, 550 360, 480 460 C 410 550, 250 560, 150 500 C 55 435, 40 290, 105 185 C 175 80, 320 50, 450 110"
        stroke="#A81D22"
        strokeWidth="32"
        strokeLinecap="round"
        opacity="0.75"
      />
      {/* Dry Brush Bristle Fringes & Whisps */}
      <path
        d="M 470 90 C 510 120, 545 160, 560 210 M 480 480 C 450 520, 400 555, 340 575 M 130 520 C 95 495, 65 455, 45 405 M 90 170 C 115 130, 150 95, 200 70"
        stroke="#B51E23"
        strokeWidth="8"
        strokeLinecap="round"
        opacity="0.6"
      />
      {/* Splatter Droplets */}
      <circle cx="510" cy="115" r="4.5" fill="#C9362B" opacity="0.8" />
      <circle cx="535" cy="140" r="3" fill="#B51E23" opacity="0.7" />
      <circle cx="550" cy="180" r="2.5" fill="#C9362B" opacity="0.75" />
      <circle cx="80" cy="460" r="3.5" fill="#C9362B" opacity="0.8" />
      <circle cx="65" cy="485" r="2" fill="#B51E23" opacity="0.6" />
      <circle cx="390" cy="570" r="4" fill="#C9362B" opacity="0.7" />
      <circle cx="210" cy="65" r="3" fill="#C9362B" opacity="0.65" />
    </g>
  </svg>
);

/** Traditional Japanese Sumi-e Landscape & Pagoda Temple at Bottom */
const JapaneseSumiLandscape = () => (
  <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-44 sm:h-60 md:h-72 z-0 select-none overflow-hidden">
    {/* Mist Gradient overlaying bottom boundary to blend seamlessly */}
    <div
      className="absolute inset-0 z-10"
      style={{
        background: 'linear-gradient(to top, #F8F3E9 12%, rgba(248, 243, 233, 0.85) 45%, transparent 100%)',
      }}
    />

    <svg
      viewBox="0 0 1600 450"
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full object-cover opacity-75"
    >
      <defs>
        <linearGradient id="mountainWashFar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3A3835" stopOpacity="0.32" />
          <stop offset="60%" stopColor="#55514C" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#F8F3E9" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="mountainWashNear" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#252321" stopOpacity="0.65" />
          <stop offset="55%" stopColor="#3D3935" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#F8F3E9" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* Far Distant Mountain Ridges */}
      <path
        d="M-50 320 C180 260, 360 290, 520 230 C680 170, 840 240, 1020 200 C1200 160, 1380 230, 1650 180 L1650 450 L-50 450 Z"
        fill="url(#mountainWashFar)"
      />

      {/* Near Rolling Hills */}
      <path
        d="M-50 360 C120 300, 250 280, 380 340 C520 400, 720 320, 890 350 C1060 380, 1280 290, 1650 340 L1650 450 L-50 450 Z"
        fill="url(#mountainWashNear)"
      />

      {/* Left Forefront Mountain Bluff holding the Pagoda */}
      <path
        d="M-40 450 L-40 240 C30 230, 90 260, 160 280 C240 300, 310 380, 380 450 Z"
        fill="#22201E"
        opacity="0.82"
      />

      {/* Multi-Tier Japanese Pagoda Temple Silhouette on Left Bluff */}
      <g transform="translate(68, 120) scale(0.92)" fill="#1F1D1B" opacity="0.92">
        {/* Spire / Sorin */}
        <line x1="45" y1="12" x2="45" y2="40" stroke="#1F1D1B" strokeWidth="2.5" />
        <circle cx="45" cy="18" r="3" />
        <circle cx="45" cy="24" r="2.5" />
        <circle cx="45" cy="30" r="2" />

        {/* Tier 5 (Top Roof) */}
        <path d="M45 40 L30 52 C37 54, 53 54, 60 52 Z" />
        <rect x="38" y="52" width="14" height="8" />

        {/* Tier 4 Roof */}
        <path d="M45 56 L24 68 C34 71, 56 71, 66 68 Z" />
        <rect x="36" y="68" width="18" height="9" />

        {/* Tier 3 Roof */}
        <path d="M45 74 L18 88 C30 91, 60 91, 72 88 Z" />
        <rect x="33" y="88" width="24" height="10" />

        {/* Tier 2 Roof */}
        <path d="M45 94 L12 110 C26 113, 64 113, 78 110 Z" />
        <rect x="30" y="110" width="30" height="12" />

        {/* Tier 1 (Base Roof) */}
        <path d="M45 116 L6 134 C22 138, 68 138, 84 134 Z" />
        {/* Base Hall Foundation & Columns */}
        <rect x="25" y="134" width="40" height="18" />
        {/* Base Platform */}
        <rect x="18" y="152" width="54" height="6" rx="1" />
      </g>
    </svg>
  </div>
);

export const MerchHero: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  // Auto-advance slides every 5.5s
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[currentSlide];

  const scrollToCollection = () => {
    const el = document.getElementById('collection');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      className="relative w-full min-h-[90vh] lg:min-h-[92vh] flex flex-col justify-center overflow-hidden bg-[#F8F3E9] py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-12 select-none border-b border-[#252321]/10"
      aria-label="Catalyst 7.0 Official Merch Hero"
    >
      {/* ── Background Layer 2: Floating Sakura Petals Drifting ── */}
      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden="true">
        {[
          { top: '18%', left: '26%', size: 'w-3 h-auto', dur: '8s', delay: '0s', rot: '15deg' },
          { top: '28%', left: '55%', size: 'w-2.5 h-auto', dur: '7.5s', delay: '1.2s', rot: '-25deg' },
          { top: '65%', left: '16%', size: 'w-3 h-auto', dur: '9s', delay: '2.5s', rot: '40deg' },
          { top: '48%', left: '88%', size: 'w-2.5 h-auto', dur: '8.2s', delay: '3.8s', rot: '-10deg' },
          { top: '72%', left: '60%', size: 'w-3 h-auto', dur: '7.8s', delay: '1.8s', rot: '20deg' },
        ].map((pet, idx) => (
          <div
            key={idx}
            className={`absolute ${pet.size} animate-pulse transform`}
            style={{
              top: pet.top,
              left: pet.left,
              animationDuration: pet.dur,
              animationDelay: pet.delay,
              transform: `rotate(${pet.rot})`,
            }}
          >
            <FloatingPetal className="w-full h-auto" />
          </div>
        ))}
      </div>

      {/* ── Background Layer 3: Japanese Sumi Landscape & Pagoda at bottom ── */}
      <JapaneseSumiLandscape />

      {/* ── Main Content Container ── */}
      <div className="relative z-20 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center my-auto">
        {/* ── Left Column: Editorial Typography & CTAs (Exact Reference Match) ── */}
        <div className="lg:col-span-6 flex flex-col items-start text-left z-20 pt-6 sm:pt-0">
          {/* Eyebrow Badge: [ 公式商品 ] */}
          <motion.div
            key={`badge-${currentSlide}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center px-3.5 py-1 rounded-md border border-[#C9362B] bg-[#C9362B]/5 mb-5 sm:mb-6 shadow-xs"
          >
            <span className="font-['Noto_Sans_JP',sans-serif] text-xs sm:text-sm font-bold tracking-[0.2em] text-[#C9362B]">
              {slide.badge}
            </span>
          </motion.div>

          {/* Main Large Serif Headline */}
          <motion.div
            key={`headline-${currentSlide}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="font-serif text-[clamp(2.9rem,6.8vw,5.6rem)] font-extrabold uppercase leading-[0.92] tracking-[-0.01em] text-[#252321] mb-4 sm:mb-5">
              <span>{slide.name}</span>
              <br />
              <span className="text-[#C9362B] italic drop-shadow-[0_2px_12px_rgba(201,54,43,0.15)]">
                {slide.titleSuffix}
              </span>
            </h1>
          </motion.div>

          {/* Horizontal Accent Line */}
          <div className="w-24 h-[1.5px] bg-[#252321]/20 my-2 sm:my-3" />

          {/* Subtitle: WEAR THE MOVEMENT */}
          <motion.div
            key={`tagline-${currentSlide}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="font-['Montserrat',sans-serif] text-xs sm:text-sm font-extrabold tracking-[0.25em] uppercase text-[#252321] mt-2 mb-3">
              {slide.tagline}
            </h2>
          </motion.div>

          {/* Paragraph Description */}
          <motion.p
            key={`desc-${currentSlide}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="font-sans text-sm sm:text-base text-[#4A4540] max-w-md leading-relaxed mb-7 sm:mb-9"
          >
            {slide.description}
          </motion.p>

          {/* Primary CTA: EXPLORE MERCH → */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              onClick={scrollToCollection}
              className="inline-flex items-center gap-3 px-8 sm:px-9 py-3.5 sm:py-4 rounded-xl bg-[#B51E23] hover:bg-[#9E171C] text-white font-['Montserrat',sans-serif] text-xs sm:text-sm font-bold tracking-[0.2em] uppercase shadow-[0_8px_24px_rgba(181,30,35,0.35)] hover:shadow-[0_12px_32px_rgba(181,30,35,0.48)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer group"
            >
              <span>EXPLORE MERCH</span>
              <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>
        </div>

        {/* ── Right Column: Red Enso Brushstroke & Floating Cutout (Exact Reference Match) ── */}
        <div className="lg:col-span-6 relative flex items-center justify-center min-h-[380px] sm:min-h-[460px] lg:min-h-[520px]">
          {/* Authentic Calligraphy Red Enso Brushstroke Arc */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10">
            <RedEnsoBrushCircle className="w-[320px] sm:w-[460px] md:w-[520px] lg:w-[560px] h-auto drop-shadow-[0_8px_24px_rgba(201,54,43,0.18)]" />
          </div>

          {/* Drifting Petals around product */}
          <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-hidden="true">
            <div className="absolute top-[20%] right-[18%] w-3 h-auto animate-pulse">
              <FloatingPetal className="w-full h-auto transform rotate-45" />
            </div>
            <div className="absolute bottom-[28%] left-[22%] w-2.5 h-auto animate-pulse">
              <FloatingPetal className="w-full h-auto transform -rotate-12" />
            </div>
            <div className="absolute bottom-[22%] right-[15%] w-3 h-auto animate-pulse">
              <FloatingPetal className="w-full h-auto transform rotate-25" />
            </div>
          </div>

          {/* Active Product Cutout Image with Soft Floating Motion */}
          <div className="relative z-30 w-full flex items-center justify-center p-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative max-w-[310px] sm:max-w-[420px] md:max-w-[460px] lg:max-w-[480px] h-auto flex items-center justify-center"
              >
                <motion.img
                  src={slide.image}
                  alt={slide.productName}
                  className="w-full h-auto object-contain filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.32)] transition-transform duration-500 hover:scale-105 cursor-pointer"
                  animate={shouldReduceMotion ? undefined : { y: [0, -8, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                  onClick={scrollToCollection}
                  title="Click to explore the collection"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Vertical Japanese Label on the Right Margin (Exact Reference Match) */}
          <div className="absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 hidden sm:flex flex-col items-center gap-3 z-30 pointer-events-none select-none">
            <span className="w-[1px] h-8 bg-[#252321]/30" />
            <span
              className="font-['Noto_Sans_JP',sans-serif] text-xs sm:text-sm font-bold text-[#252321]/70 tracking-[0.35em]"
              style={{ writingMode: 'vertical-rl' }}
            >
              カタリスト 7.0
            </span>
            <span className="w-[1px] h-8 bg-[#252321]/30" />
          </div>
        </div>
      </div>

      {/* ── Bottom Carousel Indicator Track (Matching Reference Screenshot) ── */}
      <div className="relative z-30 w-full flex items-center justify-center mt-6 sm:mt-10 mb-2">
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Left Line */}
          <div className="w-16 sm:w-28 md:w-36 h-[1px] bg-[#252321]/20" />

          {/* 3 Pagination Dots */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  currentSlide === idx
                    ? 'w-3 h-3 sm:w-3.5 sm:h-3.5 bg-[#C9362B] shadow-[0_2px_8px_rgba(201,54,43,0.4)] scale-110'
                    : 'w-2.5 h-2.5 sm:w-3 sm:h-3 border border-[#252321]/40 bg-[#F8F3E9] hover:border-[#C9362B]'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Right Line */}
          <div className="w-16 sm:w-28 md:w-36 h-[1px] bg-[#252321]/20" />
        </div>
      </div>
    </section>
  );
};

export default MerchHero;
