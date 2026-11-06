import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, ChevronDown } from 'lucide-react';
import { Navbar } from './Navbar';
import { SakuraPetals } from './SakuraPetals';

// Exact Japanese samurai-inspired visual assets from public/assets/hero-section-assets/
const SUN_IMG = '/assets/hero-section-assets/red-enso-sun.webp';
const MOUNTAINS_IMG = '/assets/hero-section-assets/background-mountains.webp';
const MIST_IMG = '/assets/hero-section-assets/atmospheric-mist.webp';
const PAGODA_IMG = '/assets/hero-section-assets/pagoda.webp';
const TORII_IMG = '/assets/hero-section-assets/torii-gate.webp';
const BRUSH_IMG = '/assets/hero-section-assets/brush-strokes.webp';
const FOREGROUND_IMG = '/assets/hero-section-assets/foreground-landscape.webp';
const SAKURA_IMG = '/assets/hero-section-assets/sakura-branch.webp';
const LOGO_IMG = '/assets/catalyst_7_logo.png';

export const JapaneseParallaxHero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax layer inner element refs (nested wrappers prevent any CSS transform collisions)
  const sunRef = useRef<HTMLDivElement>(null);
  const mountainsRef = useRef<HTMLDivElement>(null);
  const mistRef = useRef<HTMLDivElement>(null);
  const pagodaRef = useRef<HTMLDivElement>(null);
  const toriiRef = useRef<HTMLDivElement>(null);
  const brushRef = useRef<HTMLDivElement>(null);
  const foregroundRef = useRef<HTMLDivElement>(null);
  const sakuraRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  // Parallax coordinates & smooth interpolation refs
  const targetX = useRef<number>(0);
  const targetY = useRef<number>(0);
  const currentX = useRef<number>(0);
  const currentY = useRef<number>(0);
  const rafId = useRef<number | null>(null);

  // Track scroll for depth effects and mouse velocity for petals
  const [mouseVelX, setMouseVelX] = useState<number>(0);
  const lastMouseX = useRef<number>(0);
  const lastMouseTime = useRef<number>(Date.now());
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Handle window resizing
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Desktop Mouse Movement
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const now = Date.now();
    const dt = Math.max(1, now - lastMouseTime.current);
    const vx = (e.clientX - lastMouseX.current) / dt;
    setMouseVelX(Math.max(-4, Math.min(4, vx * 1.5)));
    lastMouseX.current = e.clientX;
    lastMouseTime.current = now;

    const { innerWidth, innerHeight } = window;
    targetX.current = (e.clientX / innerWidth - 0.5) * 2; // -1 to +1
    targetY.current = (e.clientY / innerHeight - 0.5) * 2; // -1 to +1
  }, []);

  // Mobile Device Orientation (Gyroscope Parallax)
  const handleDeviceOrientation = useCallback((e: DeviceOrientationEvent) => {
    if (e.gamma !== null && e.beta !== null) {
      targetX.current = Math.max(-1, Math.min(1, e.gamma / 25));
      targetY.current = Math.max(-1, Math.min(1, (e.beta - 45) / 25));
    }
  }, []);

  // Smooth 60fps RequestAnimationFrame Parallax Engine
  useEffect(() => {
    let scrollY = window.scrollY;
    const onScroll = () => {
      scrollY = window.scrollY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const render = () => {
      // Butter-smooth lerp factor
      const lerpFactor = 0.06;
      currentX.current += (targetX.current - currentX.current) * lerpFactor;
      currentY.current += (targetY.current - currentY.current) * lerpFactor;

      const x = currentX.current;
      const y = currentY.current;
      const sy = scrollY;
      const mob = isMobile;

      // 1. Red Enso Sun (deepest, subtle celestial motion)
      if (sunRef.current) {
        const sx = x * (mob ? 4 : 7);
        const syVal = y * (mob ? 3 : 5) + sy * 0.09;
        sunRef.current.style.transform = `translate3d(${sx.toFixed(2)}px, ${syVal.toFixed(2)}px, 0)`;
      }

      // 2. Background Mountains (distant horizon)
      if (mountainsRef.current) {
        const mx = x * (mob ? 7 : 13);
        const my = y * (mob ? 4 : 8) + sy * 0.15;
        mountainsRef.current.style.transform = `translate3d(${mx.toFixed(2)}px, ${my.toFixed(2)}px, 0)`;
      }

      // 3. Atmospheric Mist (soft mid-depth drift)
      if (mistRef.current) {
        const mistX = x * (mob ? 10 : 20);
        const mistY = y * (mob ? 6 : 11) + sy * 0.22;
        mistRef.current.style.transform = `translate3d(${mistX.toFixed(2)}px, ${mistY.toFixed(2)}px, 0)`;
      }

      // 4. Foreground Landscape (dark terrain grounding base)
      if (foregroundRef.current) {
        const fgX = x * (mob ? 14 : 26);
        const fgY = y * (mob ? 8 : 15) + sy * 0.30;
        foregroundRef.current.style.transform = `translate3d(${fgX.toFixed(2)}px, ${fgY.toFixed(2)}px, 0)`;
      }

      // 5. Torii Gate (sacred entrance on left)
      if (toriiRef.current) {
        const tx = x * (mob ? -12 : -22);
        const ty = y * (mob ? 9 : 17) + sy * 0.36;
        toriiRef.current.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0)`;
      }

      // 6. Pagoda (architectural feature on right)
      if (pagodaRef.current) {
        const px = x * (mob ? 12 : 22);
        const py = y * (mob ? 9 : 17) + sy * 0.36;
        pagodaRef.current.style.transform = `translate3d(${px.toFixed(2)}px, ${py.toFixed(2)}px, 0)`;
      }

      // 7. Brush Strokes (restrained calligraphic accent in upper right)
      if (brushRef.current) {
        const bx = x * (mob ? -6 : -12);
        const by = y * (mob ? -4 : -8) + sy * 0.18;
        brushRef.current.style.transform = `translate3d(${bx.toFixed(2)}px, ${by.toFixed(2)}px, 0)`;
      }

      // 8. Sakura Branch (near foreground top-left framing)
      if (sakuraRef.current) {
        const skX = x * (mob ? -18 : -32);
        const skY = y * (mob ? -9 : -16) + sy * 0.44;
        sakuraRef.current.style.transform = `translate3d(${skX.toFixed(2)}px, ${skY.toFixed(2)}px, 0)`;
      }

      // 9. Central Logo & CTAs (stable foreground)
      if (logoRef.current) {
        const lx = x * (mob ? 3 : 6);
        const ly = y * (mob ? 2 : 4) + sy * 0.14;
        logoRef.current.style.transform = `translate3d(${lx.toFixed(2)}px, ${ly.toFixed(2)}px, 0)`;
      }

      rafId.current = requestAnimationFrame(render);
    };

    window.addEventListener('mousemove', handleMouseMove);
    if (window.DeviceOrientationEvent && typeof (DeviceOrientationEvent as any).requestPermission !== 'function') {
      window.addEventListener('deviceorientation', handleDeviceOrientation);
    }

    rafId.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
      window.removeEventListener('scroll', onScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [handleMouseMove, handleDeviceOrientation, isMobile]);

  const scrollToNext = () => {
    const galleryEl = document.getElementById('gallery');
    if (galleryEl) {
      galleryEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={containerRef}
      id="hero-scene"
      className="relative w-full h-screen min-h-[640px] max-h-[1200px] overflow-hidden bg-[#F8F3E9] text-[#252321] select-none"
    >
      {/* ── Floating Sakura Petals Particle Layer ── */}
      <SakuraPetals enabled mouseVelX={mouseVelX} className="absolute inset-0 pointer-events-none z-25 w-full h-full" />

      {/* ── PARALLAX LAYER 1: Red Enso Sun (Centered Halo directly behind Catalyst Title) ── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[58%] sm:-translate-y-[55%] md:-translate-y-[53%] w-[min(65vw,320px)] sm:w-[min(54vw,400px)] md:w-[min(48vw,480px)] aspect-square pointer-events-none z-10">
        <div ref={sunRef} className="w-full h-full will-change-transform">
          <img
            src={SUN_IMG}
            alt="Japanese Red Enso Sun"
            loading="eager"
            decoding="async"
            className="w-full h-full object-contain filter drop-shadow-[0_12px_36px_rgba(181,30,35,0.2)] opacity-95"
          />
        </div>
      </div>

      {/* ── PARALLAX LAYER 2: Background Mountains (Panoramic spanning full width) ── */}
      <div className="absolute bottom-[10%] sm:bottom-[12%] md:bottom-[15%] left-0 right-0 w-full h-[32vh] sm:h-[40vh] md:h-[48vh] pointer-events-none z-12">
        <div ref={mountainsRef} className="w-full h-full will-change-transform">
          <img
            src={MOUNTAINS_IMG}
            alt="Japanese Ink Wash Panoramic Mountains"
            loading="eager"
            decoding="async"
            className="w-full h-full object-cover object-bottom opacity-95"
          />
        </div>
      </div>

      {/* ── PARALLAX LAYER 3: Atmospheric Mist (Floating Mid-Depth Mist) ── */}
      <div className="absolute bottom-[6%] sm:bottom-[8%] md:bottom-[10%] left-0 right-0 w-full h-[28vh] sm:h-[35vh] md:h-[42vh] pointer-events-none z-14">
        <div ref={mistRef} className="w-full h-full will-change-transform">
          <img
            src={MIST_IMG}
            alt="Atmospheric Mountain Mist"
            loading="eager"
            decoding="async"
            className="w-full h-full object-cover object-bottom opacity-75"
          />
        </div>
      </div>

      {/* ── PARALLAX LAYER 4: Dark Foreground Landscape (Grounding Terrain Base) ── */}
      <div className="absolute -bottom-[2%] sm:-bottom-[4%] md:-bottom-[6%] left-0 right-0 w-full h-[24vh] sm:h-[30vh] md:h-[38vh] pointer-events-none z-16">
        <div ref={foregroundRef} className="w-full h-full will-change-transform">
          <img
            src={FOREGROUND_IMG}
            alt="Foreground Ink Wash Landscape"
            loading="eager"
            decoding="async"
            className="w-full h-full object-cover object-bottom"
          />
        </div>
      </div>

      {/* ── PARALLAX LAYER 5: Torii Gate (Sacred Entrance on Bottom-Left) ── */}
      <div className="absolute bottom-[6%] sm:bottom-[7%] md:bottom-[8%] lg:bottom-[10%] left-[2%] sm:left-[3%] md:left-[4%] lg:left-[10%] h-[min(26vh,180px)] sm:h-[min(30vh,230px)] md:h-[min(35vh,270px)] lg:h-[min(44vh,420px)] w-auto pointer-events-none z-20">
        <div ref={toriiRef} className="h-full w-auto will-change-transform">
          <img
            src={TORII_IMG}
            alt="Sacred Torii Gate"
            loading="eager"
            decoding="async"
            className="h-full w-auto object-contain filter drop-shadow-[0_14px_28px_rgba(37,35,33,0.22)]"
          />
        </div>
      </div>

      {/* ── PARALLAX LAYER 6: Japanese Pagoda (Architectural Anchor on Bottom-Right) ── */}
      <div className="absolute bottom-[4%] sm:bottom-[5%] md:bottom-[6%] lg:bottom-[8%] right-[2%] sm:right-[3%] md:right-[4%] lg:right-[9%] h-[min(34vh,240px)] sm:h-[min(40vh,320px)] md:h-[min(46vh,380px)] lg:h-[min(58vh,540px)] w-auto pointer-events-none z-20">
        <div ref={pagodaRef} className="h-full w-auto will-change-transform">
          <img
            src={PAGODA_IMG}
            alt="Traditional Japanese Pagoda"
            loading="eager"
            decoding="async"
            className="h-full w-auto object-contain filter drop-shadow-[0_16px_32px_rgba(37,35,33,0.2)]"
          />
        </div>
      </div>

      {/* ── PARALLAX LAYER 7: Dynamic Brush Strokes (Restrained Calligraphic Accent) ── */}
      <div className="absolute top-[2%] right-[-1%] w-[min(30vw,180px)] sm:w-[min(25vw,240px)] md:w-[min(24vw,320px)] pointer-events-none z-11 opacity-35">
        <div ref={brushRef} className="w-full h-auto will-change-transform">
          <img
            src={BRUSH_IMG}
            alt="Calligraphic Japanese Brush Strokes"
            loading="eager"
            decoding="async"
            className="w-full h-auto object-contain"
          />
        </div>
      </div>

      {/* ── PARALLAX LAYER 8: Sakura Branch (Near Foreground Upper-Left Corner Framing) ── */}
      <div className="absolute -top-[1%] -left-[1%] w-[min(48vw,230px)] sm:w-[min(42vw,340px)] md:w-[min(38vw,480px)] lg:w-[min(38vw,540px)] pointer-events-none z-24">
        <div ref={sakuraRef} className="w-full h-auto will-change-transform">
          <img
            src={SAKURA_IMG}
            alt="Framing Sakura Branch"
            loading="eager"
            decoding="async"
            className="w-full h-auto object-contain filter drop-shadow-[0_8px_24px_rgba(37,35,33,0.15)] [transform:scaleY(-1)]"
          />
        </div>
      </div>

      {/* ── BRANDING & INTERACTIVE CONTENT OVERLAY (z-30) ── */}

      {/* Top Navbar */}
      <Navbar isHero />

      {/* Center Group: Catalyst 7.0 Logo + Action CTAs */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-30 pointer-events-none select-none px-4 sm:px-6">
        <div ref={logoRef} className="flex flex-col items-center justify-center will-change-transform">
          {/* Catalyst 7.0 Official Logo */}
          <div className="relative transform -translate-y-2 sm:-translate-y-4">
            <img
              src={LOGO_IMG}
              alt="CATALYST 7.0"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="w-[84vw] max-w-[260px] sm:max-w-[360px] md:max-w-[460px] lg:max-w-[560px] h-auto object-contain filter drop-shadow-[0_12px_36px_rgba(0,0,0,0.22)] drop-shadow-[0_2px_8px_rgba(181,30,35,0.25)]"
            />
          </div>

          {/* Central Action CTAs */}
          <div className="pointer-events-auto flex items-center justify-center gap-2 sm:gap-3.5 flex-row mt-2.5 sm:mt-4">
            {/* Register Button */}
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-3.5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[#B51E23] hover:bg-[#9E171C] text-white font-['Montserrat',sans-serif] text-[10px] sm:text-xs font-bold tracking-[0.16em] sm:tracking-[0.2em] uppercase shadow-[0_6px_22px_rgba(181,30,35,0.38)] hover:shadow-[0_10px_28px_rgba(181,30,35,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer group"
            >
              <span>REGISTER NOW</span>
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>

            {/* Explore Merch Button */}
            <Link
              to="/merch"
              className="inline-flex items-center justify-center gap-2 px-3.5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[#FAF6EE]/90 hover:bg-[#252321] text-[#252321] hover:text-[#FAF6EE] border border-[#252321]/30 hover:border-[#252321] font-['Montserrat',sans-serif] text-[10px] sm:text-xs font-bold tracking-[0.16em] sm:tracking-[0.2em] uppercase shadow-[0_4px_16px_rgba(37,35,33,0.06)] hover:shadow-[0_8px_24px_rgba(37,35,33,0.15)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer backdrop-blur-xs group"
            >
              <ShoppingBag size={14} className="text-[#C9362B] group-hover:text-[#FAF6EE] transition-colors" />
              <span>EXPLORE MERCH</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Left Middle Info (Large Desktop only) */}
      <div className="absolute left-5 lg:left-10 top-1/4 z-30 pointer-events-none hidden lg:block">
        <h3 className="text-sm sm:text-base font-bold text-[#0e1118] tracking-tight">
          Catalyst 7.0
        </h3>
        <p className="text-xs sm:text-sm text-gray-700 font-sans mt-0.5">
          AIESEC in SLIIT &middot; Leadership Seminar
        </p>
        <div className="w-6 sm:w-7 h-[3px] bg-[#B51E23] mt-2.5 rounded-full" />
      </div>

      {/* Bottom Left Info (Large Desktop) */}
      <div className="hidden lg:block absolute bottom-6 lg:bottom-10 left-5 lg:left-10 z-30 pointer-events-none">
        <div className="font-['Bison',sans-serif] text-5xl sm:text-7xl md:text-8xl font-black text-[#0e1118] leading-[0.8] tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          7.0
        </div>
        <div className="mt-2 sm:mt-3">
          <h4 className="text-xs sm:text-sm font-bold text-[#0e1118] tracking-tight uppercase">
            Two-day leadership experience
          </h4>
        </div>
      </div>

      {/* Bottom Center Motto (Large Desktop) */}
      <div className="hidden lg:block absolute bottom-6 lg:bottom-10 left-1/2 -translate-x-1/2 z-30 pointer-events-none text-center">
        <span className="font-['Bison',sans-serif] text-xl sm:text-3xl md:text-4xl lg:text-[2.6rem] font-black tracking-[0.16em] sm:tracking-[0.22em] text-[#0e1118] whitespace-nowrap uppercase drop-shadow-[0_2px_12px_rgba(0,0,0,0.12)] leading-none">
          DARE BEYOND DEFINITION
        </span>
      </div>

      {/* Mobile / Tablet Bottom Layout (< lg: Clean vertical stack avoiding any logo overlap) */}
      <div className="lg:hidden absolute bottom-3 left-4 right-4 z-30 pointer-events-none flex flex-col items-center text-center">
        <div className="flex items-center gap-2">
          <span className="font-['Bison',sans-serif] text-2xl font-black text-[#0e1118] leading-none">7.0</span>
          <span className="text-[10px] font-bold text-[#0e1118] uppercase tracking-wider">Two-day leadership experience</span>
        </div>
        <span className="font-['Bison',sans-serif] text-sm font-black tracking-[0.16em] text-[#0e1118] uppercase mt-1">
          DARE BEYOND DEFINITION
        </span>
      </div>

      {/* ── Scroll Down Indicator (Bottom Right) ── */}
      <button
        onClick={scrollToNext}
        className="absolute bottom-5 right-5 sm:right-8 z-30 hidden sm:flex items-center gap-2 text-[#0e1118]/70 hover:text-[#B51E23] transition-colors font-mono text-[10px] uppercase tracking-[0.2em] font-bold cursor-pointer group"
        title="Scroll to Gallery"
      >
        <span>EXPLORE</span>
        <div className="w-6 h-6 rounded-full border border-[#0e1118]/25 group-hover:border-[#B51E23] flex items-center justify-center transition-all group-hover:translate-y-0.5">
          <ChevronDown size={13} />
        </div>
      </button>
    </section>
  );
};

export default JapaneseParallaxHero;
