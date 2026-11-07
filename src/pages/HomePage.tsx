import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { SakuraPetals } from '../components/SakuraPetals';
import { BackgroundMusic } from '../components/BackgroundMusic';
import { EntryGate } from '../components/EntryGate';
import { JapaneseParallaxHero } from '../components/JapaneseParallaxHero';
import AnimatedGalleryDemo from '../components/ui/animated-gallery-demo';
import FullScreenScrollFXDemo from '../components/ui/full-screen-scroll-fx-demo';
import CoverFlowCarouselDemo from '../components/ui/3-d-coverflow-carousel-demo';
import OutroFooter from '../components/ui/outro-footer';
import PartnershipAnnouncement from '../components/ui/partnership-announcement';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Standard motion easing: cubic-bezier(0.22, 1, 0.36, 1)
const TWEEN_EASING: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * Scroll timeline (0 → 1 over the sticky track).
 *   0.00 → ASSEMBLE      : the vista builds (sun swells, torii zooms, text sequence plays)
 *   ASSEMBLE → CURTAIN   : short hold on the finished vista
 *   CURTAIN → CURTAIN_END: Section 2 slides up over the scene
 *   LOCK                 : swap into normal page flow (atomic, no flash)
 */
// Defined in "viewport heights of scroll" so each phase can be tuned without touching the others.
// The illustrations keep the ORIGINAL pace: they finish after 110vh of scroll (0.5 × 220vh before).
// Track height in CSS (.entrance-track) must equal SCROLL_VH + 100.
const SCROLL_VH = 260;
const ASSEMBLE_VH = 110; // illustrations: sun, torii, water, pontoon…
const CURTAIN_START_VH = 140; // short hold on the finished vista (110 → 140)
const CURTAIN_END_VH = 250; // hero slides in slowly over 110vh of scroll (was ~64vh)
const LOCK_AT_VH = 253;

const ASSEMBLE = ASSEMBLE_VH / SCROLL_VH;
const CURTAIN_START = CURTAIN_START_VH / SCROLL_VH;
const CURTAIN_END = CURTAIN_END_VH / SCROLL_VH;
const LOCK_AT = LOCK_AT_VH / SCROLL_VH;

// After the curtain lands, the hero stays pinned to the screen for this much extra scroll
// (in viewport heights) before the page continues. Must match --hero-pin in index.css.
// Set to 0 (and --hero-pin: 0lvh) to disable the pin.
const HERO_PIN_VH = 0.8;

// The sun disc is authored at its LARGEST size and scaled DOWN, so it stays razor sharp
// instead of being a small bitmap blown up 3x. Must match `.sun-disc` width in CSS (300%).
const SUN_MAX = 3;

// Everything the entrance needs. Preloaded so the intro never pops in layer by layer.
const ENTRANCE_ASSETS = [
  '/assets/aistudio/Asset_1___Sky__Atmosphere_4f43e559.png',
  '/assets/aistudio/Asset_2___Mt._Fuji__Distant_Peaks_d9588285.png',
  '/assets/aistudio/Asset_4___Hill_Left__Shoreline__604a9863.png',
  '/assets/aistudio/Asset_5_clean.png',
  '/assets/aistudio/Asset_3_clean.png',
  '/assets/aistudio/Asset_6___Torii_Back_Pillars_a1056345.png',
  '/assets/aistudio/Asset_7___Torii_Main_Gate_f6440592.png',
  '/assets/aistudio/Asset_10_clean.png',
];

// true after the visitor clicked "Enter" once in this page load (resets on refresh, so the gate + music restart)
let entryGateDismissed = false;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smoothstep = (min: number, max: number, v: number) => {
  const t = clamp01((v - min) / (max - min));
  return t * t * (3 - 2 * t);
};
const easeInOutSine = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * t);
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export default function HomePage() {
  const shouldReduceMotion = useReducedMotion();
  const reduceMotionRef = useRef<boolean>(false);
  reduceMotionRef.current = !!shouldReduceMotion;

  const isMobileRef = useRef<boolean>(false);

  // "Enter" screen: its click is the user gesture that lets the music start, and it starts the intro
  const [gateOpen, setGateOpen] = useState<boolean>(entryGateDismissed);
  const gateOpenRef = useRef<boolean>(entryGateDismissed);
  const handleEnter = useCallback(() => {
    entryGateDismissed = true;
    gateOpenRef.current = true;
    setGateOpen(true);
  }, []);

  // Keep the page from scrolling while the gate is showing
  useEffect(() => {
    if (gateOpen) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [gateOpen]);

  const sakuraEnabled = true;

  // The ONLY React state the entrance needs. Everything per-frame lives in refs + direct DOM writes,
  // so scrolling / moving the mouse never re-renders the page (and the heavy sections behind the curtain).
  const [isLockedToHero, setIsLockedToHero] = useState<boolean>(false);
  const isLockedToHeroRef = useRef<boolean>(false);

  // Mouse wind velocity for the petals (read by the canvas loop directly)
  const mouseVelRef = useRef<number>(0);
  const lastMouseXRef = useRef<number>(0);
  const lastMouseTimeRef = useRef<number>(0);

  // Parallax + scroll tracking
  const targetX = useRef<number>(0);
  const targetY = useRef<number>(0);
  const currentX = useRef<number>(0);
  const currentY = useRef<number>(0);
  const targetScroll = useRef<number>(0);
  const currentScroll = useRef<number>(0);
  const scrollDistanceRef = useRef<number>(1);
  const autoScrollRaf = useRef<number | null>(null);

  // Animated element refs
  const trackRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const sunMoonRef = useRef<HTMLDivElement>(null);
  const sunDiscRef = useRef<HTMLDivElement>(null);
  const experienceRef = useRef<HTMLDivElement>(null);
  const orgRef = useRef<HTMLDivElement>(null);
  const presentsRef = useRef<HTMLDivElement>(null);
  const mtFujiRef = useRef<HTMLDivElement>(null);
  const hillRightRef = useRef<HTMLDivElement>(null);
  const hillLeftRef = useRef<HTMLDivElement>(null);
  const toriiStageRef = useRef<HTMLDivElement>(null);
  const toriiBackPillarsRef = useRef<HTMLDivElement>(null);
  const pontoonRef = useRef<HTMLDivElement>(null);
  const waterRef = useRef<HTMLDivElement>(null);
  const rippleRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const curtainShadowRef = useRef<HTMLDivElement>(null);
  const secondSectionRef = useRef<HTMLDivElement>(null);
  const heroTrackRef = useRef<HTMLDivElement>(null);
  const heroStickyRef = useRef<HTMLDivElement>(null);

  // ---------------------------------------------------------------------------------------------
  // Page setup: always start the entrance from the top (browser scroll-restoration would drop the
  // user into the middle of the 320vh track and skip the intro).
  // ---------------------------------------------------------------------------------------------
  useEffect(() => {
    const prev = 'scrollRestoration' in history ? history.scrollRestoration : 'auto';
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    if (!window.location.hash) window.scrollTo(0, 0);
    return () => {
      if ('scrollRestoration' in history) history.scrollRestoration = prev;
    };
  }, []);

  useEffect(() => {
    const check = () => {
      isMobileRef.current = window.innerWidth < 768;
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ---------------------------------------------------------------------------------------------
  // Auto-scroll (click on "scroll to enter" / pontoon / top stripe) with our own easing.
  // Native `behavior: 'smooth'` has browser-dependent duration and can't be cancelled cleanly,
  // which is why the old 700ms timeout could lock mid-scroll and jump.
  // ---------------------------------------------------------------------------------------------
  const cancelAutoScroll = useCallback(() => {
    if (autoScrollRaf.current !== null) {
      cancelAnimationFrame(autoScrollRaf.current);
      autoScrollRaf.current = null;
    }
  }, []);

  const animateScrollTo = useCallback(
    (target: number, duration: number) => {
      cancelAutoScroll();
      const startY = window.scrollY;
      const t0 = performance.now();

      const stop = () => {
        cancelAutoScroll();
        window.removeEventListener('wheel', stop);
        window.removeEventListener('touchstart', stop);
        window.removeEventListener('keydown', stop);
        window.removeEventListener('mousedown', stop);
      };
      window.addEventListener('wheel', stop, { passive: true });
      window.addEventListener('touchstart', stop, { passive: true });
      window.addEventListener('keydown', stop);
      window.addEventListener('mousedown', stop);

      const step = (now: number) => {
        const t = clamp01((now - t0) / duration);
        window.scrollTo(0, startY + (target - startY) * easeInOutCubic(t));
        if (t < 1) {
          autoScrollRaf.current = requestAnimationFrame(step);
        } else {
          stop();
        }
      };
      autoScrollRaf.current = requestAnimationFrame(step);
    },
    [cancelAutoScroll]
  );

  // ---------------------------------------------------------------------------------------------
  // Lock: swap from the fixed curtain into normal page flow.
  // Only flips state; the actual DOM swap + scrollTo(0) happen in useLayoutEffect below, i.e.
  // in the SAME frame before paint. (Old code flipped styles first and state 1–2 frames later,
  // which flashed the vista for a frame.)
  // ---------------------------------------------------------------------------------------------
  const lockToSection2 = useCallback(() => {
    if (isLockedToHeroRef.current) return;
    isLockedToHeroRef.current = true;
    cancelAutoScroll();
    setIsLockedToHero(true);
  }, [cancelAutoScroll]);

  useLayoutEffect(() => {
    if (!isLockedToHero) return;
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    if (heroTrackRef.current) heroTrackRef.current.style.transform = '';
  }, [isLockedToHero]);

  // Recalculate GSAP ScrollTrigger coordinates once Section 2 becomes normal flow.
  useEffect(() => {
    if (isLockedToHero) {
      const refreshTriggers = () => ScrollTrigger.refresh(true);
      const t1 = setTimeout(refreshTriggers, 100);
      const t2 = setTimeout(refreshTriggers, 500);
      const t3 = setTimeout(refreshTriggers, 1200);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    } else {
      document.documentElement.classList.remove('smooth-scroll-active');
    }
  }, [isLockedToHero]);

  // ---------------------------------------------------------------------------------------------
  // Hero pin: once locked, the hero holds the screen for HERO_PIN_VH of scroll, easing in a gentle
  // push-in while it's held, then releases into the rest of the page. Direct DOM writes, no state.
  // ---------------------------------------------------------------------------------------------
  useEffect(() => {
    if (!isLockedToHero || HERO_PIN_VH <= 0 || reduceMotionRef.current) return;
    const track = heroTrackRef.current;
    const sticky = heroStickyRef.current;
    if (!track || !sticky) return;

    let raf = 0;
    let running = false;
    let last = 0;
    let pinPx = 1;
    let target = 0;
    let current = 0;

    const measure = () => {
      pinPx = Math.max(1, track.offsetHeight - sticky.offsetHeight);
    };
    const apply = () => {
      sticky.style.transform = `scale(${(1 + current * 0.035).toFixed(4)})`;
    };
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      current += (target - current) * (1 - Math.exp(-dt * 10));
      if (Math.abs(target - current) < 0.0005) current = target;
      apply();
      if (current !== target) raf = requestAnimationFrame(tick);
      else running = false;
    };
    const onScroll = () => {
      target = clamp01(window.scrollY / pinPx);
      if (!running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };
    const onResize = () => {
      measure();
      onScroll();
    };

    measure();
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      sticky.style.transform = '';
    };
  }, [isLockedToHero]);

  // Handle URL hash navigation (e.g. from /#gallery, /#about, /#contact)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash) {
        lockToSection2();
        setTimeout(() => {
          const target = document.querySelector(hash);
          if (target) target.scrollIntoView({ behavior: 'smooth' });
        }, 350);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [lockToSection2]);

  const scrollToStory = useCallback(() => {
    if (isLockedToHeroRef.current) return;
    if (reduceMotionRef.current) {
      lockToSection2();
      return;
    }
    const distance = scrollDistanceRef.current;
    const target = distance * (LOCK_AT + 0.02);
    const remaining = Math.max(0, target - window.scrollY) / distance; // 0..1
    animateScrollTo(target, 1200 + remaining * 3400);
  }, [animateScrollTo, lockToSection2]);

  const scrollToTop = useCallback(() => {
    animateScrollTo(0, 1100);
  }, [animateScrollTo]);

  // ---------------------------------------------------------------------------------------------
  // The one render loop for the entrance (scroll + parallax + intro). Runs ONLY while the
  // entrance exists, and skips DOM writes on frames where nothing moved.
  // ---------------------------------------------------------------------------------------------
  useEffect(() => {
    if (isLockedToHero) return;

    let raf = 0;
    let disposed = false;
    let last = performance.now();
    let introStart = -1;
    let assetsReady = false;
    let introT = 0;
    const reduced = reduceMotionRef.current;

    // --- scroll metrics -------------------------------------------------------------------
    const measure = () => {
      const track = trackRef.current;
      const sticky = stickyRef.current;
      if (!track || !sticky) return;
      scrollDistanceRef.current = Math.max(1, track.offsetHeight - sticky.offsetHeight);
    };
    const onScroll = () => {
      targetScroll.current = clamp01(window.scrollY / scrollDistanceRef.current);
    };
    const onResize = () => {
      measure();
      onScroll();
    };
    measure();
    onScroll();
    currentScroll.current = targetScroll.current;

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    // --- pointer / gyro parallax (disabled for reduced-motion) ----------------------------
    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      const dt = Math.max(1, now - lastMouseTimeRef.current);
      const vx = (e.clientX - lastMouseXRef.current) / dt;
      mouseVelRef.current = Math.max(-4, Math.min(4, vx * 1.5));
      lastMouseXRef.current = e.clientX;
      lastMouseTimeRef.current = now;
      targetX.current = (e.clientX / window.innerWidth - 0.5) * 2;
      targetY.current = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        targetX.current = Math.max(-1, Math.min(1, e.gamma / 30));
        targetY.current = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
      }
    };
    // NOTE: touchmove parallax was removed — it made the layers swim while the finger was
    // scrolling the page. Touch devices get gyro parallax instead.
    if (!reduced) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      if (window.DeviceOrientationEvent && typeof (DeviceOrientationEvent as any).requestPermission !== 'function') {
        window.addEventListener('deviceorientation', handleDeviceOrientation);
      }
    }

    // --- preload, then play the intro -----------------------------------------------------
    const preload = Promise.all(
      ENTRANCE_ASSETS.map(
        (src) =>
          new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = src;
          })
      )
    );
    const fontsReady: Promise<unknown> = (document as any).fonts?.ready ?? Promise.resolve();
    const timeout = new Promise<void>((resolve) => setTimeout(resolve, 2800));
    Promise.race([Promise.all([preload, fontsReady]), timeout]).then(() => {
      assetsReady = true;
    });

    // --- per-frame write cache (skip frames where nothing changed) -------------------------
    let pX = Infinity;
    let pY = Infinity;
    let pS = Infinity;
    let pI = Infinity;

    const render = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const isMob = isMobileRef.current;

      // The intro begins once assets are ready AND the visitor has pressed "Enter"
      if (introStart < 0 && assetsReady && gateOpenRef.current) introStart = now;

      // Intro progress (0..1), then eased
      if (introStart >= 0 && introT < 1) {
        introT = reduced ? 1 : clamp01((now - introStart) / 2400);
      }
      const introE = 1 - Math.pow(1 - introT, 3);

      // Frame-rate independent damping: identical feel on 60Hz / 120Hz / 144Hz.
      const kPar = 1 - Math.exp(-dt * 5);
      const kScr = 1 - Math.exp(-dt * (isMob ? 14 : 9));
      currentX.current += (targetX.current - currentX.current) * kPar;
      currentY.current += (targetY.current - currentY.current) * kPar;
      currentScroll.current += (targetScroll.current - currentScroll.current) * kScr;
      if (Math.abs(targetScroll.current - currentScroll.current) < 0.00004) {
        currentScroll.current = targetScroll.current;
      }

      // Petal wind decays back to calm (old code held the last velocity forever).
      mouseVelRef.current *= Math.exp(-dt * 3.2);

      const x = currentX.current;
      const y = currentY.current;
      const sp = currentScroll.current;

      const dirty =
        Math.abs(x - pX) > 0.0002 ||
        Math.abs(y - pY) > 0.0002 ||
        Math.abs(sp - pS) > 0.00002 ||
        introT !== pI;

      if (dirty) {
        pX = x;
        pY = y;
        pS = sp;
        pI = introT;

        const vistaSp = Math.min(1, sp / ASSEMBLE);
        const scrollVh = sp * SCROLL_VH;

        // ---- 1. Sun: rises at intro, then swells while sinking ------------------------------
        if (sunMoonRef.current) {
          const sunX = -x * (isMob ? 10 : 14);
          const introRise = (1 - introE) * (isMob ? 70 : 110);
          const sunY = -y * 8 + vistaSp * (isMob ? 60 : 85) + introRise;
          sunMoonRef.current.style.transform = `translate3d(calc(-50% + ${sunX.toFixed(2)}px), ${sunY.toFixed(2)}px, 0)`;
        }
        if (sunDiscRef.current) {
          const sunScale = 1 + vistaSp * (isMob ? 1.7 : 2.0);
          sunDiscRef.current.style.transform = `translate3d(-50%, -50%, 0) scale(${(sunScale / SUN_MAX).toFixed(4)})`;
        }

        // ---- 2. Typography sequence ----------------------------------------------------------
        const txtX = -x * (isMob ? 5 : 8);
        const baseTxtY = -y * (isMob ? 3 : 5) + vistaSp * (isMob ? 25 : 35);

        // EXPERIENCE — fades in with the intro (and stays scroll-driven afterwards)
        if (experienceRef.current) {
          const baseLift = isMob ? 0 : -28;
          const peakLift = isMob ? -6 : -38;
          const introText = smoothstep(0.5, 1, introT);
          let op = 0;
          let sc = 0.92;
          let lift = baseLift;

          if (vistaSp <= 0.32) {
            const e = Math.max(smoothstep(0.01, 0.16, vistaSp), introText);
            op = e;
            sc = 0.92 + e * 0.1;
            // FIX: was `baseLift - e*(peakLift-baseLift)`, which moved the wrong way and then
            // snapped 20px when the plateau started.
            lift = baseLift + e * (peakLift - baseLift);
          } else if (vistaSp <= 0.42) {
            const out = smoothstep(0.32, 0.42, vistaSp);
            op = 1 - out;
            sc = 1.02 + out * 0.06;
            lift = peakLift - out * (isMob ? 8 : 18);
          }
          experienceRef.current.style.transform = `translate3d(calc(-50% + ${txtX.toFixed(2)}px), calc(-50% + ${(baseTxtY + lift).toFixed(2)}px), 0) scale(${sc.toFixed(3)})`;
          experienceRef.current.style.opacity = op.toFixed(3);
        }

        // AIESEC in SLIIT — then PRESENTS
        if (orgRef.current) {
          // Own, longer timeline in scroll-vh (was ~13vh of scroll, now ~36vh) so it can be read
          const t = smoothstep(44, 80, scrollVh);
          const lift = isMob ? -30 : -44;
          const yy = baseTxtY + lift + (1 - t) * 26;
          orgRef.current.style.transform = `translate3d(calc(-50% + ${txtX.toFixed(2)}px), calc(-50% + ${yy.toFixed(2)}px), 0) scale(${(0.93 + t * 0.07).toFixed(3)})`;
          orgRef.current.style.opacity = t.toFixed(3);
        }
        if (presentsRef.current) {
          const t = smoothstep(68, 106, scrollVh);
          const lift = isMob ? 14 : 32;
          const yy = baseTxtY + lift + (1 - t) * 16;
          presentsRef.current.style.transform = `translate3d(calc(-50% + ${txtX.toFixed(2)}px), calc(-50% + ${yy.toFixed(2)}px), 0)`;
          presentsRef.current.style.opacity = t.toFixed(3);
        }

        // ---- 3. Mt. Fuji ----------------------------------------------------------------------
        if (mtFujiRef.current) {
          const fujiX = -x * 0.5;
          const fujiY = -y * 0.2 + vistaSp * (isMob ? 45 : 80);
          mtFujiRef.current.style.transform = `translate3d(${fujiX.toFixed(3)}%, ${fujiY.toFixed(2)}px, 0)`;
        }

        // ---- 4. Shoreline hills ---------------------------------------------------------------
        if (hillLeftRef.current) {
          const hlX = -x * 1.5 - vistaSp * (isMob ? 10 : 18);
          const hlY = -y * 0.4 + vistaSp * (isMob ? 12 : 20);
          hillLeftRef.current.style.transform = `translate3d(${hlX.toFixed(3)}%, ${hlY.toFixed(2)}px, 0)`;
        }
        if (hillRightRef.current) {
          const hrX = -x * 0.8 + vistaSp * (isMob ? 10 : 18);
          const hrY = -y * 0.3 + vistaSp * (isMob ? 12 : 20);
          hillRightRef.current.style.transform = `translate3d(${hrX.toFixed(3)}%, ${hrY.toFixed(2)}px, 0)`;
        }

        // ---- 5. Torii gate zoom ---------------------------------------------------------------
        if (toriiStageRef.current) {
          const tScale = 1 + vistaSp * (isMob ? 2.6 : 3.6);
          const tY = y * 0.8 + vistaSp * (isMob ? 12 : 18);
          const tX = x * (isMob ? 1.4 : 2.2);
          const tOpacity = vistaSp > 0.42 ? Math.max(0, 1 - (vistaSp - 0.42) * 14) : 1;
          toriiStageRef.current.style.transform = `translate3d(calc(-50% + ${tX.toFixed(2)}px), ${tY.toFixed(2)}%, 0) scale(${tScale.toFixed(3)})`;
          toriiStageRef.current.style.opacity = tOpacity.toFixed(3);
        }
        if (toriiBackPillarsRef.current) {
          const bpX = -x * (isMob ? 2.0 : 3.2);
          toriiBackPillarsRef.current.style.transform = `translate3d(${bpX.toFixed(2)}px, 0, 0)`;
        }

        // ---- 6. Water + ripple ----------------------------------------------------------------
        if (waterRef.current) {
          const wX = -x * 1.2;
          const wY = vistaSp * (isMob ? 140 : 200);
          const wScale = 1 + vistaSp * (isMob ? 0.35 : 0.45);
          waterRef.current.style.transform = `translate3d(${wX.toFixed(2)}px, ${wY.toFixed(2)}px, 0) scale(${wScale.toFixed(3)})`;
        }
        if (rippleRef.current) {
          const rX = x * 1.5;
          const rY = vistaSp * (isMob ? 180 : 260);
          const rScale = 1 + vistaSp * (isMob ? 1.4 : 1.8);
          const rOpacity = vistaSp > 0.42 ? Math.max(0, 1 - (vistaSp - 0.42) * 14) : 1;
          rippleRef.current.style.transform = `translate3d(calc(-50% + ${rX.toFixed(2)}px), ${rY.toFixed(2)}px, 0) scale(${rScale.toFixed(3)})`;
          rippleRef.current.style.opacity = rOpacity.toFixed(3);
        }

        // ---- 7. Pontoon (same as original, incl. the subtle rotateY) ----
        if (pontoonRef.current) {
          const pRot = isMob ? 0 : x * 2.5;
          const pX2 = isMob ? 0 : x * 2.0;
          const pY2 = vistaSp * (isMob ? 280 : 420);
          const pScale = 1 + vistaSp * (isMob ? 0.85 : 1.15);
          pontoonRef.current.style.transform = `translate3d(calc(-50% + ${pX2.toFixed(2)}px), ${pY2.toFixed(2)}px, 0) scale(${pScale.toFixed(3)}) rotateY(${pRot.toFixed(2)}deg)`;
        }

        // ---- 8. Scroll cue fades as soon as the user starts scrolling ---------------------------
        if (cueRef.current) {
          const o = clamp01(1 - sp * 7);
          cueRef.current.style.opacity = o.toFixed(3);
          cueRef.current.style.transform = `translate3d(0, ${(sp * 40).toFixed(1)}px, 0)`;
          cueRef.current.style.pointerEvents = sp > 0.1 ? 'none' : 'auto';
        }

        // ---- 9. Curtain: Section 2 slides up over the vista --------------------------------------
        const transProg = clamp01((sp - CURTAIN_START) / (CURTAIN_END - CURTAIN_START));
        const transE = easeInOutSine(transProg);
        const slideY = (1 - transE) * 100;

        if (secondSectionRef.current) {
          secondSectionRef.current.style.transform = `translate3d(0, ${slideY.toFixed(2)}%, 0)`;
          secondSectionRef.current.style.pointerEvents = transProg > 0.85 ? 'auto' : 'none';
        }

        if (heroTrackRef.current) {
          // The hero eases down from a slight zoom while it slides up: feels like it settles into place.
          heroTrackRef.current.style.transform = `scale(${(1.08 - 0.08 * transE).toFixed(4)})`;
        }
        if (veilRef.current) {
          // One veil does both jobs: opening fade-in at load + dimming under the curtain.
          const veil = Math.max(1 - introE, transE * 0.6);
          veilRef.current.style.opacity = veil.toFixed(3);
        }
        if (curtainShadowRef.current) {
          const vh = window.innerHeight;
          const edge = (slideY / 100) * vh; // y of the curtain's top edge
          const fadeIn = clamp01(transProg * 8);
          const fadeOut = 1 - clamp01((transProg - 0.88) * 8);
          curtainShadowRef.current.style.transform = `translate3d(0, ${(edge - 140).toFixed(1)}px, 0)`;
          curtainShadowRef.current.style.opacity = (fadeIn * fadeOut).toFixed(3);
        }

        if (sp >= LOCK_AT) {
          lockToSection2();
        }
      }

      if (isLockedToHeroRef.current) return; // loop ends; effect cleanup handles the rest
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  }, [isLockedToHero, lockToSection2]);

  return (
    <div className="relative bg-[#F8F3E9]">
      {/* Background music: starts from 0:00 on every load, loops forever, has a mute button */}
      <BackgroundMusic src="/audio/background-music.mp3" volume={0.45} />

      {/* Enter screen: one click starts the music + the intro */}
      <EntryGate visible={!gateOpen} onEnter={handleEnter} />

      {/* Top Crimson Accent Stripe (entrance only) */}
      {!isLockedToHero && (
        <motion.div
          className="fixed top-0 left-1/2 w-36 sm:w-52 md:w-64 h-2 sm:h-2.5 bg-[#bf3030] z-40 rounded-b cursor-pointer origin-top"
          style={{ left: '50%', x: '-50%' }}
          whileHover={shouldReduceMotion ? undefined : { scale: 1.01, backgroundColor: '#a72323' }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
          transition={{ duration: 0.25, ease: TWEEN_EASING }}
          onClick={scrollToTop}
          title="Scroll to Vista"
        />
      )}

      {/* SECTION 1: 3D PARALLAX SCENE — unmounted completely once locked (frees images + canvas) */}
      {!isLockedToHero && (
        <div ref={trackRef} className="entrance-track relative w-full">
          <div
            ref={stickyRef}
            className="entrance-sticky sticky top-0 w-full overflow-hidden pointer-events-none select-none z-10"
          >
            <div ref={sceneRef} className="entrance-scene">
              {/* Falling petals (wind comes straight from a ref: no re-render per mouse move) */}
              <SakuraPetals
                enabled={sakuraEnabled}
                velRef={mouseVelRef}
                className="absolute inset-0 pointer-events-none z-20 w-full h-full"
              />

              {/* Sky */}
              <div className="sky-bg" />

              {/* Red sun: wrapper handles position/parallax, disc handles the (sharp) scale */}
              <div ref={sunMoonRef} className="celestial-body">
                <div ref={sunDiscRef} className="sun-disc" />
              </div>

              {/* Typography near the sun */}
              <div className="moon-title-stage">
                <div ref={experienceRef} className="title-word-item experience-word">
                  <span className="title-experience">EXPERIENCE</span>
                  <span className="title-kanji" aria-hidden="true">
                    <i />
                    <b>体験</b>
                    <i />
                  </span>
                </div>

                <div ref={orgRef} className="title-word-item org-word">
                  <span className="title-org">
                    AIESEC <em className="title-org-in">in</em> SLIIT
                  </span>
                </div>

                <div ref={presentsRef} className="title-word-item presents-word">
                  <span className="presents-line">
                    <i />
                    <b>PRESENTS</b>
                    <i />
                  </span>
                </div>
              </div>

              {/* Mt. Fuji */}
              <div ref={mtFujiRef} className="mt-fuji-layer" />

              {/* Shoreline hills */}
              <div ref={hillRightRef} className="hill-right-layer" />
              <div ref={hillLeftRef} className="hill-left-layer" />

              {/* Lake */}
              <div ref={waterRef} className="water-lake-layer" />
              <div ref={rippleRef} className="water-ripple-center">
                <div className="water-ring" />
                <div className="water-ring _2" />
              </div>

              {/* Ryōbu-torii */}
              <div ref={toriiStageRef} className="torii-stage">
                <div ref={toriiBackPillarsRef} className="torii-back-pillars" />
                <div className="torii-front-gate" />
              </div>

              {/* Pontoon dock (click to enter) */}
              <div
                ref={pontoonRef}
                className="pontoon-dock"
                onClick={scrollToStory}
                title="Scroll down or click to enter Catalyst"
              />

              {/* Atmosphere: static vignette for depth + opening/closing veil */}
              <div className="scene-vignette" />
              <div ref={veilRef} className="scene-veil" style={{ opacity: 1 }} />
            </div>
          </div>

          {/* Scroll cue (appears after "Enter") */}
          {gateOpen && (
          <div className="scroll-cue" onClick={scrollToStory}>
            <div ref={cueRef} className="scroll-cue-inner">
              <span className="scroll-cue-label">Scroll to enter</span>
              <span className="scroll-cue-line">
                <span className="scroll-cue-dot" />
              </span>
              <span className="scroll-cue-kanji" aria-hidden="true">
                入る
              </span>
            </div>
          </div>
          )}
        </div>
      )}

      {/* Soft shadow riding on the curtain's top edge */}
      {!isLockedToHero && <div ref={curtainShadowRef} className="curtain-edge-shadow" style={{ opacity: 0 }} />}

      {/* SECTIONS 2–6 (fixed curtain on entrance → normal flow once locked) */}
      <div
        ref={secondSectionRef}
        className={`w-full z-30 bg-[#F8F3E9] ${
          isLockedToHero
            ? 'relative pointer-events-auto'
            : 'fixed inset-0 h-screen overflow-hidden pointer-events-none will-change-transform'
        }`}
        style={{
          transform: isLockedToHero ? 'none' : 'translate3d(0, 100%, 0)',
        }}
      >
        {/* SECTION 2: JAPANESE SAMURAI PARALLAX HERO */}
        <div
          id="hero"
          ref={heroTrackRef}
          className={`w-full catalyst-section-isolate ${isLockedToHero ? 'hero-pin-track' : ''}`}
        >
          <div ref={heroStickyRef} className={isLockedToHero ? 'hero-pin-sticky' : ''}>
            <JapaneseParallaxHero />
          </div>
        </div>

        {/* SECTION 3: ANIMATED GALLERY */}
        <div id="gallery" className="w-full catalyst-section-isolate">
          <AnimatedGalleryDemo active={isLockedToHero} />
        </div>

        {/* SECTION 4: FULL SCREEN SCROLL FX (GSAP ScrollTrigger Slideshow) */}
        <div className="catalyst-section-isolate">
          <FullScreenScrollFXDemo active={isLockedToHero} />
        </div>

        {/* SECTION 6: 3D COVERFLOW CAROUSEL */}
        <div className="catalyst-section-isolate">
          <CoverFlowCarouselDemo active={isLockedToHero} />
        </div>

        {/* SECTION 7: PARTNERSHIP ANNOUNCEMENT */}
        <div className="catalyst-section-isolate">
          <PartnershipAnnouncement active={isLockedToHero} />
        </div>

        {/* Outro / Footer */}
        <OutroFooter active={isLockedToHero} />
      </div>
    </div>
  );
}