import React, { useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, ChevronDown } from 'lucide-react';
import { Navbar } from './Navbar';
import { SakuraPetals } from './SakuraPetals';

// Assets in public/assets/hero-section-assets/
// NOTE: foreground-landscape is a .PNG in your folder (not .webp) – that was the broken image.
const SUN_IMG = '/assets/hero-section-assets/red-enso-sun.webp';
const MOUNTAINS_IMG = '/assets/hero-section-assets/background-mountains.webp';
const MIST_IMG = '/assets/hero-section-assets/atmospheric-mist.webp';
const PAGODA_IMG = '/assets/hero-section-assets/pagoda.webp';
const TORII_IMG = '/assets/hero-section-assets/torii-gate.webp';
const BRUSH_IMG = '/assets/hero-section-assets/brush-strokes.webp';
const FOREGROUND_IMG = '/assets/hero-section-assets/foreground-landscape.webp';
const SAKURA_IMG = '/assets/hero-section-assets/sakura-branch.webp';
const LOGO_IMG = '/assets/catalyst_7_logo.png';

// Copy – edit here
const EVENT_TAGLINE = 'A two-day leadership seminar by AIESEC in SLIIT';
const EVENT_DETAILS = ''; // e.g. '12–13 December · SLIIT Malabe' – shown under the tagline when filled

// Soft-fade masks so image edges never show as hard rectangles
const maskStyle = (gradient: string): React.CSSProperties => ({
  WebkitMaskImage: gradient,
  maskImage: gradient,
});
const FADE_TOP = maskStyle('linear-gradient(to bottom, transparent 0%, #000 38%, #000 100%)');
const FADE_BOTH = maskStyle('linear-gradient(to bottom, transparent 0%, #000 30%, #000 70%, transparent 100%)');

/**
 * Keeps bottom-anchored UI inside the part of the hero you can actually see.
 *
 * The hero is `h-screen` (= 100vh = the LARGE viewport on phones). While the browser's
 * address/tool bar is showing, the visible area is shorter (100dvh), so anything pinned a few
 * pixels from the hero's bottom sits underneath the bar until you scroll. 100lvh - 100dvh is
 * exactly the hidden strip, so adding it to `bottom` lifts the element into view, and it
 * slides back down on its own as the bar collapses. On desktop the difference is 0.
 * (If a browser doesn't support these units, the declaration is dropped and the Tailwind
 * `bottom-*` class on the element is used instead.)
 */
const aboveBrowserBar = (offset: string): React.CSSProperties => ({
  bottom: `calc(100lvh - 100dvh + ${offset} + env(safe-area-inset-bottom, 0px))`,
});

export const JapaneseParallaxHero: React.FC = () => {
  const sunRef = useRef<HTMLDivElement>(null);
  const mountainsRef = useRef<HTMLDivElement>(null);
  const mistRef = useRef<HTMLDivElement>(null);
  const pagodaRef = useRef<HTMLDivElement>(null);
  const toriiRef = useRef<HTMLDivElement>(null);
  const brushRef = useRef<HTMLDivElement>(null);
  const foregroundRef = useRef<HTMLDivElement>(null);
  const sakuraRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLElement>(null);

  const targetX = useRef(0);
  const targetY = useRef(0);
  const currentX = useRef(0);
  const currentY = useRef(0);
  const rafId = useRef<number | null>(null);

  // Mouse velocity lives in a ref (no re-render per mouse move); only a rounded copy goes to state for the petals
  const velRef = useRef(0);
  const lastMouseX = useRef(0);
  const lastMouseTime = useRef(Date.now());
  const isMobileRef = useRef(false);

  useEffect(() => {
    const onResize = () => {
      isMobileRef.current = window.innerWidth < 768;
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const now = Date.now();
    const dt = Math.max(1, now - lastMouseTime.current);
    const vx = (e.clientX - lastMouseX.current) / dt;
    velRef.current = Math.max(-4, Math.min(4, vx * 1.5));
    lastMouseX.current = e.clientX;
    lastMouseTime.current = now;

    targetX.current = (e.clientX / window.innerWidth - 0.5) * 2;
    targetY.current = (e.clientY / window.innerHeight - 0.5) * 2;
  }, []);

  const handleDeviceOrientation = useCallback((e: DeviceOrientationEvent) => {
    if (e.gamma !== null && e.beta !== null) {
      targetX.current = Math.max(-1, Math.min(1, e.gamma / 25));
      targetY.current = Math.max(-1, Math.min(1, (e.beta - 45) / 25));
    }
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    let inView = false;
    let disposed = false;
    const set = (el: HTMLDivElement | null, px: number, py: number) => {
      if (el) el.style.transform = `translate3d(${px.toFixed(2)}px, ${py.toFixed(2)}px, 0)`;
    };

    const render = () => {
      rafId.current = null;
      if (disposed || !inView || document.hidden) return;
      const lerp = 0.07;
      currentX.current += (targetX.current - currentX.current) * lerp;
      currentY.current += (targetY.current - currentY.current) * lerp;

      const x = currentX.current;
      const y = currentY.current;
      const vh = window.innerHeight;

      // Scroll offset is measured from the hero's OWN position instead of window.scrollY.
      // While the hero is the sliding curtain over the entrance, window.scrollY is ~2 screens
      // deep, which displaced every layer and then snapped back when the page unlocked.
      // Now: curtain phase => 0, normal page => identical to window.scrollY as before.
      const top = rootRef.current ? rootRef.current.getBoundingClientRect().top : 0;
      if (top >= vh) {
        // Hero is still below the viewport (entrance scene is showing): nothing to animate.
        rafId.current = requestAnimationFrame(render);
        return;
      }
      const scrollY = Math.max(0, -top);
      const sy = Math.min(scrollY, vh * 1.2); // stop parallax once hero is gone
      const m = isMobileRef.current ? 0.55 : 1; // mobile = gentler motion

      // Back -> front. Scroll factor grows with depth: far layers move slow, near layers move fast.
      set(sunRef.current, x * 7 * m, y * 5 * m + sy * 0.08);
      set(mountainsRef.current, x * 13 * m, y * 8 * m + sy * 0.16);
      set(mistRef.current, x * 20 * m, y * 11 * m + sy * 0.24);
      set(foregroundRef.current, x * 26 * m, 0);
      set(toriiRef.current, x * -22 * m, y * 17 * m + sy * 0.34);
      set(pagodaRef.current, x * 22 * m, y * 17 * m + sy * 0.34);
      set(brushRef.current, x * -12 * m, y * -8 * m + sy * 0.18);
      // Drift kept within the branch's off-screen overhang (-ml-6 / -mt-4) so its end never shows.
      set(sakuraRef.current, x * -22 * m, y * -16 * m + sy * 0.46);

      if (logoRef.current) {
        logoRef.current.style.transform = `translate3d(${(x * 6 * m).toFixed(2)}px, ${(y * 4 * m + sy * 0.12).toFixed(2)}px, 0)`;
        logoRef.current.style.opacity = String(Math.max(0, 1 - sy / (vh * 0.8)));
      }

      // Canvas reads wind directly without re-rendering the hero's image layers.
      velRef.current *= 0.92;

      rafId.current = requestAnimationFrame(render);
    };

    window.addEventListener('mousemove', handleMouseMove);
    if (window.DeviceOrientationEvent && typeof (DeviceOrientationEvent as any).requestPermission !== 'function') {
      window.addEventListener('deviceorientation', handleDeviceOrientation);
    }
    const resume = () => {
      if (!disposed && inView && !document.hidden && rafId.current === null) {
        rafId.current = requestAnimationFrame(render);
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      resume();
    });
    if (rootRef.current) observer.observe(rootRef.current);
    document.addEventListener('visibilitychange', resume);

    return () => {
      disposed = true;
      observer.disconnect();
      document.removeEventListener('visibilitychange', resume);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = null;
    };
  }, [handleMouseMove, handleDeviceOrientation]);

  const scrollToNext = () => {
    const el = document.getElementById('gallery');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    else window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <section
      ref={rootRef}
      id="hero-scene"
      className="relative w-full h-screen min-h-[640px] max-h-[1200px] overflow-hidden bg-[#F8F3E9] text-[#252321] select-none"
    >
      {/* Petals */}
      <SakuraPetals enabled velRef={velRef} className="absolute inset-0 pointer-events-none z-[25] w-full h-full" />

      {/* L1: Enso sun */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[58%] sm:-translate-y-[55%] md:-translate-y-[53%] w-[min(65vw,320px)] sm:w-[min(54vw,400px)] md:w-[min(48vw,480px)] aspect-square pointer-events-none z-10">
        <div ref={sunRef} className="w-full h-full will-change-transform">
          <img
            src={SUN_IMG}
            alt=""
            aria-hidden="true"
            loading="eager"
            decoding="async"
            className="w-full h-full object-contain drop-shadow-[0_12px_36px_rgba(181,30,35,0.2)] opacity-95"
          />
        </div>
      </div>

      {/* L2: Mountains – wider than the screen so parallax drift never exposes an edge, top faded */}
      <div className="absolute bottom-[10%] sm:bottom-[12%] md:bottom-[14%] left-[-4%] right-[-4%] h-[30vh] sm:h-[36vh] md:h-[42vh] pointer-events-none z-[12]">
        <div ref={mountainsRef} className="w-full h-full will-change-transform">
          <img
            src={MOUNTAINS_IMG}
            alt=""
            aria-hidden="true"
            loading="eager"
            decoding="async"
            style={FADE_TOP}
            className="w-full h-full object-cover object-bottom opacity-95"
          />
        </div>
      </div>

      {/* L3: Mist – faded top and bottom so it blends into everything */}
      <div className="absolute bottom-[6%] sm:bottom-[8%] md:bottom-[9%] left-[-5%] right-[-5%] h-[28vh] sm:h-[34vh] md:h-[40vh] pointer-events-none z-[14]">
        <div ref={mistRef} className="w-full h-full will-change-transform">
          <img
            src={MIST_IMG}
            alt=""
            aria-hidden="true"
            loading="eager"
            decoding="async"
            style={FADE_BOTH}
            className="w-full h-full object-cover object-bottom opacity-80"
          />
        </div>
      </div>

      {/* L4: Foreground landscape (PNG!) */}
      <div className="absolute bottom-0 left-[-4%] right-[-4%] h-[24vh] sm:h-[30vh] md:h-[36vh] lg:h-[40vh] min-h-[180px] max-h-[440px] pointer-events-none z-[16] leading-none overflow-hidden">
        <div ref={foregroundRef} className="w-full h-full will-change-transform">
          <img
            src={FOREGROUND_IMG}
            alt=""
            aria-hidden="true"
            loading="eager"
            decoding="async"
            className="w-full h-full object-cover object-bottom"
          />
        </div>
      </div>

      {/* L5: Torii (nudged right on desktop so it clears the bottom-left text) */}
      <div className="absolute -bottom-[3%] sm:-bottom-[3%] md:-bottom-[3.5%] left-[2%] sm:left-[3%] md:left-[4%] lg:left-[12%] h-[min(25vh,170px)] sm:h-[min(34vh,260px)] md:h-[min(40vh,320px)] lg:h-[min(48vh,420px)] w-auto pointer-events-none z-20">
        <div ref={toriiRef} className="h-full w-auto will-change-transform">
          <img
            src={TORII_IMG}
            alt=""
            aria-hidden="true"
            loading="eager"
            decoding="async"
            className="h-full w-auto object-contain drop-shadow-[0_14px_28px_rgba(37,35,33,0.22)]"
          />
        </div>
      </div>

      {/* L6: Pagoda */}
      <div className="absolute -bottom-[3%] sm:-bottom-[3%] md:-bottom-[3.5%] right-[2%] sm:right-[3%] md:right-[4%] lg:right-[8%] h-[min(33vh,220px)] sm:h-[min(44vh,340px)] md:h-[min(50vh,420px)] lg:h-[min(60vh,540px)] w-auto pointer-events-none z-20">
        <div ref={pagodaRef} className="h-full w-auto will-change-transform">
          <img
            src={PAGODA_IMG}
            alt=""
            aria-hidden="true"
            loading="eager"
            decoding="async"
            className="h-full w-auto object-contain drop-shadow-[0_16px_32px_rgba(37,35,33,0.2)]"
          />
        </div>
      </div>

      {/* Ground strip: sits in front of the torii/pagoda bases so they look planted, not floating (also hides parallax drift) */}
      <div className="absolute inset-x-0 bottom-0 h-[10vh] min-h-[56px] z-[22] pointer-events-none bg-gradient-to-t from-[#0d0b0a] via-[#14110f]/85 to-transparent" />

      {/* Dark scrim at the bottom so cream text is readable over the dark landscape */}
      <div className="absolute inset-x-0 bottom-0 h-[34vh] z-[17] pointer-events-none bg-gradient-to-t from-[#14110f]/75 via-[#14110f]/35 to-transparent" />

      {/* L7: Brush strokes */}
      <div className="absolute top-[2%] right-[-1%] w-[min(30vw,180px)] sm:w-[min(25vw,240px)] md:w-[min(24vw,320px)] pointer-events-none z-[11] opacity-35">
        <div ref={brushRef} className="w-full h-auto will-change-transform">
          <img src={BRUSH_IMG} alt="" aria-hidden="true" loading="eager" decoding="async" className="w-full h-auto object-contain" />
        </div>
      </div>

      {/* L8: Sakura branch */}
      <div className="absolute -top-[1%] -left-[1%] -mt-4 -ml-6 w-[min(48vw,230px)] sm:w-[min(42vw,340px)] md:w-[min(38vw,480px)] lg:w-[min(34vw,500px)] pointer-events-none z-[24]">
        <div ref={sakuraRef} className="w-full h-auto will-change-transform">
          <img
            src={SAKURA_IMG}
            alt=""
            aria-hidden="true"
            loading="eager"
            decoding="async"
            className="w-full h-auto object-contain drop-shadow-[0_8px_24px_rgba(37,35,33,0.15)] [transform:scaleY(-1)]"
          />
        </div>
      </div>

      {/* Navbar */}
      <Navbar isHero />

      {/* Center: logo + CTAs */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-30 pointer-events-none select-none px-4 sm:px-6">
        <div ref={logoRef} className="flex flex-col items-center justify-center will-change-transform">
          <div className="relative -translate-y-2 sm:-translate-y-4">
            {/* Soft cream glow so the black brush logo stays readable over the mountains */}
            <div
              aria-hidden="true"
              className="absolute inset-x-[-10%] inset-y-[-18%] -z-10 blur-xl bg-[radial-gradient(ellipse_at_center,rgba(248,243,233,0.92)_0%,rgba(248,243,233,0.6)_45%,rgba(248,243,233,0)_72%)]"
            />
            <img
              src={LOGO_IMG}
              alt="CATALYST 7.0"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="w-[84vw] max-w-[260px] sm:max-w-[360px] md:max-w-[460px] lg:max-w-[560px] h-auto object-contain drop-shadow-[0_12px_36px_rgba(0,0,0,0.22)] drop-shadow-[0_2px_8px_rgba(181,30,35,0.25)]"
            />
          </div>

          <div className="pointer-events-auto flex items-center justify-center gap-2 sm:gap-3.5 mt-2.5 sm:mt-4">
            <Link
              to="/register"
              className="group inline-flex items-center justify-center gap-2 px-3.5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[#B51E23] hover:bg-[#9E171C] text-white font-['Montserrat',sans-serif] text-[10px] sm:text-xs font-bold tracking-[0.16em] sm:tracking-[0.2em] uppercase shadow-[0_6px_22px_rgba(181,30,35,0.38)] hover:shadow-[0_10px_28px_rgba(181,30,35,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer"
            >
              <span>REGISTER NOW</span>
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              to="/merch"
              className="group inline-flex items-center justify-center gap-2 px-3.5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[#FAF6EE]/90 hover:bg-[#252321] text-[#252321] hover:text-[#FAF6EE] border border-[#252321]/30 hover:border-[#252321] font-['Montserrat',sans-serif] text-[10px] sm:text-xs font-bold tracking-[0.16em] sm:tracking-[0.2em] uppercase shadow-[0_4px_16px_rgba(37,35,33,0.06)] hover:shadow-[0_8px_24px_rgba(37,35,33,0.15)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer backdrop-blur-sm"
            >
              <ShoppingBag size={14} className="text-[#C9362B] group-hover:text-[#FAF6EE] transition-colors" />
              <span>SHOP MERCH</span>
            </Link>
          </div>

          {/* Moved here from the left side – it was colliding with the sakura branch */}
          <div className="hidden sm:flex flex-col items-center mt-4 text-center font-['Montserrat',sans-serif] text-[#0e1118] [text-shadow:0_0_10px_rgba(248,243,233,0.95),0_0_20px_rgba(248,243,233,0.8)]">
            <p className="text-sm font-semibold">{EVENT_TAGLINE}</p>
            {EVENT_DETAILS && <p className="text-xs font-bold tracking-wide mt-1">{EVENT_DETAILS}</p>}
          </div>
        </div>
      </div>

      {/* Bottom-center motto (desktop). Lifted above the browser bar on large tablets in landscape. */}
      <div
        className="hidden lg:block absolute bottom-8 left-1/2 -translate-x-1/2 z-30 pointer-events-none text-center"
        style={aboveBrowserBar('2rem')}
      >
        <span className="font-['Bison',sans-serif] text-[2.6rem] font-black tracking-[0.22em] text-[#FAF6EE] whitespace-nowrap uppercase drop-shadow-[0_2px_12px_rgba(0,0,0,0.65)] leading-none">
          DARE BEYOND DEFINITION
        </span>
      </div>

      {/* Bottom (mobile / tablet). Anchored to the VISIBLE bottom, so it shows on load
          instead of hiding under the browser's address bar until you scroll. */}
      <div
        className="lg:hidden absolute bottom-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center text-center w-full max-w-[min(92vw,320px)] px-1"
        style={aboveBrowserBar('0.85rem')}
      >
        <div className="flex items-center justify-center gap-1.5">
          <span className="font-['Bison',sans-serif] text-xl font-black text-[#FAF6EE] leading-none drop-shadow-[0_1px_6px_rgba(0,0,0,0.75)]">7.0</span>
          <span className="text-[9px] font-bold text-[#FAF6EE] uppercase tracking-wider leading-none drop-shadow-[0_1px_4px_rgba(0,0,0,0.75)]">Leadership Seminar</span>
        </div>
        <span className="font-['Bison',sans-serif] text-[clamp(0.7rem,3.6vw,1rem)] font-black tracking-[0.16em] text-[#FAF6EE] uppercase mt-0.5 drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)] whitespace-nowrap">
          DARE BEYOND DEFINITION
        </span>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={scrollToNext}
        className="group absolute bottom-5 right-5 sm:right-8 z-30 hidden sm:flex items-center gap-2 text-[#FAF6EE]/85 hover:text-white transition-colors font-mono text-[10px] uppercase tracking-[0.2em] font-bold cursor-pointer"
        style={aboveBrowserBar('1.25rem')}
        title="Scroll to Gallery"
      >
        <span>EXPLORE</span>
        <div className="w-6 h-6 rounded-full border border-[#FAF6EE]/50 group-hover:border-white flex items-center justify-center transition-all group-hover:translate-y-0.5">
          <ChevronDown size={13} />
        </div>
      </button>
    </section>
  );
};

export default JapaneseParallaxHero;