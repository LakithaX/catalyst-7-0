import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { SakuraPetals } from './components/SakuraPetals';
import FestivityDemo from './components/ui/demo';
import AnimatedGalleryDemo from './components/ui/animated-gallery-demo';
import LiquidWaveSpinner from './components/ui/spinner-10';
import FullScreenScrollFXDemo from './components/ui/full-screen-scroll-fx-demo';
import CoverFlowCarouselDemo from './components/ui/3-d-coverflow-carousel-demo';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

type Atmosphere = 'original';
type ArtTheme = 'enhanced' | 'classic';

// Letters of CATALYST for authentic sequential Japanese brush stroke painting
const CATALYST_LETTERS = ['C', 'A', 'T', 'A', 'L', 'Y', 'S', 'T'];

// Standard motion easing per Effects specification: cubic-bezier(0.22, 1, 0.36, 1)
const TWEEN_EASING: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function App() {
  const shouldReduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const isMobileRef = useRef<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      const isMob = window.innerWidth < 768;
      setIsMobile(isMob);
      isMobileRef.current = isMob;
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Locked into the user's active mode: Enhanced Ukiyo-e, Daylight Red Sun, Sakura Petals enabled
  const theme = 'enhanced' as ArtTheme;
  const atmosphere: Atmosphere = 'original';
  const sakuraEnabled = true;
  const mistEnabled = false;
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [mouseVelX, setMouseVelX] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLockedToBubbles, setIsLockedToBubbles] = useState<boolean>(false);
  const isLockedToBubblesRef = useRef<boolean>(false);
  const [isSection2Active, setIsSection2Active] = useState<boolean>(false);
  const hasTriggeredBubblesRef = useRef<boolean>(false);

  const lockToSection2 = useCallback(() => {
    if (isLockedToBubblesRef.current) return;
    isLockedToBubblesRef.current = true;

    // Seamlessly transition: remove curtain transform and make relative in same frame
    if (secondSectionRef.current) {
      secondSectionRef.current.style.transform = 'none';
      secondSectionRef.current.style.position = 'relative';
    }

    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
      setIsLockedToBubbles(true);
    });
  }, []);

  // When Section 1 collapses and Section 2 becomes normal relative scroll,
  // recalculate all GSAP ScrollTrigger pin and scroll coordinates immediately.
  useEffect(() => {
    if (isLockedToBubbles) {
      const refreshTriggers = () => {
        ScrollTrigger.refresh(true);
      };
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
  }, [isLockedToBubbles]);

  // Smooth loading screen experience
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  // Parallax tracking refs for 60fps lerping
  const targetX = useRef<number>(0);
  const targetY = useRef<number>(0);
  const currentX = useRef<number>(0);
  const currentY = useRef<number>(0);
  const rafId = useRef<number | null>(null);

  // Scroll tracking refs for silky smooth interpolation
  const targetScroll = useRef<number>(0);
  const currentScroll = useRef<number>(0);

  // Velocity calculation
  const lastMouseXRef = useRef<number>(0);
  const lastMouseTimeRef = useRef<number>(Date.now());

  // Animated element refs
  const sunMoonRef = useRef<HTMLDivElement>(null);
  const experienceRef = useRef<HTMLDivElement>(null);
  const catalystRef = useRef<HTMLDivElement>(null);
  const presenterRef = useRef<HTMLSpanElement>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const brushTipRef = useRef<HTMLDivElement>(null);
  const mtFujiRef = useRef<HTMLDivElement>(null);
  const hillRightRef = useRef<HTMLDivElement>(null);
  const hillLeftRef = useRef<HTMLDivElement>(null);
  const toriiStageRef = useRef<HTMLDivElement>(null);
  const toriiBackPillarsRef = useRef<HTMLDivElement>(null);
  const pontoonRef = useRef<HTMLDivElement>(null);
  const waterRef = useRef<HTMLDivElement>(null);
  const rippleRef = useRef<HTMLDivElement>(null);
  const heroTrackRef = useRef<HTMLDivElement>(null);
  const secondSectionRef = useRef<HTMLDivElement>(null);

  // Scroll listener for continuous scroll animation
  useEffect(() => {
    if (isLockedToBubbles) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroEl = heroTrackRef.current;
      const heroDistance = heroEl ? heroEl.offsetHeight - window.innerHeight : window.innerHeight * 2.2;
      const progress = heroDistance > 0 ? Math.min(1, Math.max(0, scrollY / heroDistance)) : 0;
      targetScroll.current = progress;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    currentScroll.current = targetScroll.current;
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLockedToBubbles]);

  const scrollToStory = () => {
    const heroEl = heroTrackRef.current;
    if (heroEl) {
      if (!hasTriggeredBubblesRef.current) {
        hasTriggeredBubblesRef.current = true;
        setIsSection2Active(true);
        window.dispatchEvent(new CustomEvent('catalyst-trigger-bubbles'));
      }
      const targetY = heroEl.offsetHeight - window.innerHeight;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
      setTimeout(() => {
        lockToSection2();
      }, 700);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Mouse & Touch handling
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const now = Date.now();
    const dt = Math.max(1, now - lastMouseTimeRef.current);
    const vx = (e.clientX - lastMouseXRef.current) / dt;
    setMouseVelX(Math.max(-4, Math.min(4, vx * 1.5)));
    lastMouseXRef.current = e.clientX;
    lastMouseTimeRef.current = now;

    const { innerWidth, innerHeight } = window;
    const nx = (e.clientX / innerWidth - 0.5) * 2;
    const ny = (e.clientY / innerHeight - 0.5) * 2;
    targetX.current = nx;
    targetY.current = ny;
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const { innerWidth, innerHeight } = window;
      const nx = (touch.clientX / innerWidth - 0.5) * 2;
      const ny = (touch.clientY / innerHeight - 0.5) * 2;
      targetX.current = nx;
      targetY.current = ny;
    }
  }, []);

  // Device orientation for mobile gyroscope parallax
  const handleDeviceOrientation = useCallback((e: DeviceOrientationEvent) => {
    if (e.gamma !== null && e.beta !== null) {
      const nx = Math.max(-1, Math.min(1, e.gamma / 30));
      const ny = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
      targetX.current = nx;
      targetY.current = ny;
    }
  }, []);

  // Combined Parallax & Scroll Animation Loop (60fps)
  useEffect(() => {
    const render = () => {
      const factor = 0.08;
      currentX.current += (targetX.current - currentX.current) * factor;
      currentY.current += (targetY.current - currentY.current) * factor;

      // Responsive scroll lerp: catches up within 2-3 frames (zero lag) while keeping silky motion
      const scrollFactor = 0.22;
      currentScroll.current += (targetScroll.current - currentScroll.current) * scrollFactor;

      const x = currentX.current;
      const y = currentY.current;
      const sp = currentScroll.current;

      // Hermite smoothstep for natural, gradual ease-in and ease-out curves
      const smoothstep = (min: number, max: number, v: number) => {
        const t = Math.max(0, Math.min(1, (v - min) / (max - min)));
        return t * t * (3 - 2 * t);
      };

      const isMob = isMobileRef.current;

      // Map scroll progress to vistaSp: all assembly animations complete by 0.50
      // and remain firmly locked in the completed vista state (the reference screenshot) from 0.50 to 0.78!
      const vistaSp = Math.min(1.0, sp / 0.50);

      // 1. Sun / Moon: expands rapidly in scale while sinking downward at a gentler rate
      if (sunMoonRef.current) {
        const sunX = -x * (isMob ? 10 : 14);
        const sunY = -y * 8 + vistaSp * (isMob ? 60 : 85);
        const sunScale = 1 + vistaSp * (isMob ? 1.7 : 2.0);
        sunMoonRef.current.style.transform = `translate3d(calc(-50% + ${sunX.toFixed(2)}px), ${sunY.toFixed(2)}px, 0px) scale(${sunScale.toFixed(3)})`;
      }

      // 2. Sequential Moon Typography: "EXPERIENCE" appears, stays longer, lifts up, then disappears before "CATALYST"
      const txtX = -x * (isMob ? 5 : 8);
      const baseTxtY = -y * (isMob ? 3 : 5) + vistaSp * (isMob ? 25 : 35);

      // First: "EXPERIENCE" appears smoothly with organic ease-in, stays prominently, lifted up near upper moon
      if (experienceRef.current) {
        let expOpacity = 0;
        let expScale = 0.92;
        const baseLift = isMob ? 0 : -28;
        const peakLift = isMob ? -6 : -38;
        let expLift = baseLift;

        if (vistaSp >= 0.01 && vistaSp <= 0.16) {
          const eased = smoothstep(0.01, 0.16, vistaSp);
          expOpacity = eased;
          expScale = 0.92 + eased * 0.10;
          expLift = baseLift - eased * (peakLift - baseLift);
        } else if (vistaSp > 0.16 && vistaSp <= 0.32) {
          expOpacity = 1;
          expScale = 1.02;
          expLift = peakLift;
        } else if (vistaSp > 0.32 && vistaSp <= 0.42) {
          const easedOut = smoothstep(0.32, 0.42, vistaSp);
          expOpacity = Math.max(0, 1 - easedOut);
          expScale = 1.02 + easedOut * 0.06;
          expLift = peakLift - easedOut * (isMob ? 8 : 18);
        }
        const expY = baseTxtY + expLift;
        experienceRef.current.style.transform = `translate3d(calc(-50% + ${txtX.toFixed(2)}px), calc(-50% + ${expY.toFixed(2)}px), 0px) scale(${expScale.toFixed(3)})`;
        experienceRef.current.style.opacity = expOpacity.toFixed(3);
      }

      // Next: "CATALYST" appears as if written with a Japanese paint brush
      if (catalystRef.current) {
        let catOpacity = 0;
        let catScale = 1.0;
        const catLift = isMob ? -50 : -50;
        const catY = baseTxtY + catLift;

        const writeStart = 0.40;
        const writeEnd = 0.50;

        // Fade in "AIESEC IN SLIIT PRESENTS" alongside CATALYST
        if (presenterRef.current) {
          if (vistaSp < writeStart) {
            presenterRef.current.style.opacity = '0';
            presenterRef.current.style.transform = 'translateY(6px)';
          } else {
            const presT = smoothstep(writeStart, writeStart + 0.08, vistaSp);
            presenterRef.current.style.opacity = presT.toFixed(3);
            presenterRef.current.style.transform = `translateY(${((1 - presT) * 6).toFixed(1)}px)`;
          }
        }

        if (vistaSp < writeStart) {
          catOpacity = 0;
          letterRefs.current.forEach((el) => {
            if (el) {
              el.style.opacity = '0';
              el.style.webkitMaskImage = 'none';
              el.style.maskImage = 'none';
            }
          });
          if (brushTipRef.current) {
            brushTipRef.current.style.opacity = '0';
          }
        } else if (vistaSp >= writeStart && vistaSp <= writeEnd) {
          catOpacity = 1;
          const u = (vistaSp - writeStart) / (writeEnd - writeStart); // 0 to 1
          const numLetters = CATALYST_LETTERS.length; // 8
          const strokeSpan = 0.24;
          const step = (1 - strokeSpan) / (numLetters - 1);

          let activeBrushX = 0;
          let activeBrushY = 0;
          let activeBrushScale = 1.0;
          let activeFound = false;

          for (let i = 0; i < numLetters; i++) {
            const el = letterRefs.current[i];
            if (!el) continue;

            const lStart = i * step;
            const lEnd = lStart + strokeSpan;

            if (u < lStart) {
              el.style.opacity = '0';
              el.style.webkitMaskImage = 'none';
              el.style.maskImage = 'none';
              el.style.transform = 'scale(0.94)';
            } else if (u >= lEnd) {
              el.style.opacity = '1';
              el.style.webkitMaskImage = 'none';
              el.style.maskImage = 'none';
              el.style.transform = 'scale(1)';
            } else {
              const localT = (u - lStart) / strokeSpan;
              const strokeProg = smoothstep(0, 1, localT);
              const pct = Math.round(-15 + strokeProg * 130);
              el.style.opacity = '1';
              const maskVal = `linear-gradient(135deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) ${Math.max(0, pct - 16)}%, rgba(0,0,0,0.6) ${pct}%, transparent ${pct + 18}%)`;
              el.style.webkitMaskImage = maskVal;
              el.style.maskImage = maskVal;
              const letterScale = 0.94 + strokeProg * 0.06;
              el.style.transform = `scale(${letterScale.toFixed(3)})`;

              if (!activeFound) {
                activeBrushX = el.offsetLeft + el.offsetWidth * (0.05 + strokeProg * 0.90);
                activeBrushY = el.offsetTop + el.offsetHeight * (0.15 + strokeProg * 0.70) + Math.sin(strokeProg * Math.PI) * 10;
                activeBrushScale = 0.85 + Math.sin(strokeProg * Math.PI) * 0.45;
                activeFound = true;
              }
            }
          }

          if (brushTipRef.current) {
            if (activeFound) {
              const tipFade = u < 0.04 ? u / 0.04 : (u > 0.96 ? Math.max(0, (1 - u) / 0.04) : 1);
              brushTipRef.current.style.opacity = tipFade.toFixed(3);
              brushTipRef.current.style.transform = `translate3d(${activeBrushX.toFixed(1)}px, ${activeBrushY.toFixed(1)}px, 0px) scale(${activeBrushScale.toFixed(2)})`;
            } else {
              brushTipRef.current.style.opacity = '0';
            }
          }
        } else {
          // vistaSp > writeEnd: Entire word is fully painted and remains visible
          letterRefs.current.forEach((el) => {
            if (el) {
              el.style.opacity = '1';
              el.style.webkitMaskImage = 'none';
              el.style.maskImage = 'none';
              el.style.transform = 'scale(1)';
            }
          });
          if (brushTipRef.current) {
            brushTipRef.current.style.opacity = '0';
          }

          catOpacity = 1;
          catScale = 1.02;
        }

        catalystRef.current.style.transform = `translate3d(calc(-50% + ${txtX.toFixed(2)}px), calc(-50% + ${catY.toFixed(2)}px), 0px) scale(${catScale.toFixed(3)})`;
        catalystRef.current.style.opacity = catOpacity.toFixed(3);
      }

      // 3. Mt. Fuji (Asset 2): sinks down gently as you scroll
      if (mtFujiRef.current) {
        const fujiX = -x * 0.5;
        const fujiY = -y * 0.2 + vistaSp * (isMob ? 45 : 80);
        mtFujiRef.current.style.transform = `translate3d(${fujiX.toFixed(3)}%, ${fujiY.toFixed(2)}px, 0px)`;
      }

      // 4. Shoreline Hills (Asset 4 & 5): slide gently apart and lower by 20px as you scroll
      if (hillLeftRef.current) {
        const hlX = -x * 1.5 - vistaSp * (isMob ? 10 : 18);
        const hlY = -y * 0.4 + vistaSp * (isMob ? 12 : 20);
        hillLeftRef.current.style.transform = `translate3d(${hlX.toFixed(3)}%, ${hlY.toFixed(2)}px, 0px)`;
      }

      if (hillRightRef.current) {
        const hrX = -x * 0.8 + vistaSp * (isMob ? 10 : 18);
        const hrY = -y * 0.3 + vistaSp * (isMob ? 12 : 20);
        hillRightRef.current.style.transform = `translate3d(${hrX.toFixed(3)}%, ${hrY.toFixed(2)}px, 0px)`;
      }

      // 5. Unified Torii Gate: Zooms in 3D perspective as you scroll forward!
      if (toriiStageRef.current) {
        const tScale = 1 + vistaSp * (isMob ? 2.6 : 3.6);
        const tY = y * 0.8 + vistaSp * (isMob ? 12 : 18);
        const tX = x * (isMob ? 1.4 : 2.2);
        const tOpacity = vistaSp > 0.42 ? Math.max(0, 1 - (vistaSp - 0.42) * 14) : 1;
        toriiStageRef.current.style.transform = `translate3d(calc(-50% + ${tX.toFixed(2)}px), ${tY.toFixed(2)}%, 0px) scale(${tScale.toFixed(3)})`;
        toriiStageRef.current.style.opacity = tOpacity.toFixed(3);
      }

      // Rear pillars move with subtle parallax inside the Torii stage
      if (toriiBackPillarsRef.current) {
        const bpX = -x * (isMob ? 2.0 : 3.2);
        toriiBackPillarsRef.current.style.transform = `translate3d(${bpX.toFixed(2)}px, 0px, 0px)`;
      }

      // 6. Lake Water Surface (Asset 3): sinks downward and expands forward as you zoom in
      if (waterRef.current) {
        const wX = -x * 1.2;
        const wY = vistaSp * (isMob ? 140 : 200);
        const wScale = 1 + vistaSp * (isMob ? 0.35 : 0.45);
        waterRef.current.style.transform = `translate3d(${wX.toFixed(2)}px, ${wY.toFixed(2)}px, 0px) scale(${wScale.toFixed(3)})`;
      }

      // Water Ripple Ring: sinks down and expands forward along with the water
      if (rippleRef.current) {
        const rX = x * 1.5;
        const rY = vistaSp * (isMob ? 180 : 260);
        const rScale = 1 + vistaSp * (isMob ? 1.4 : 1.8);
        const rOpacity = vistaSp > 0.42 ? Math.max(0, 1 - (vistaSp - 0.42) * 14) : 1;
        rippleRef.current.style.transform = `translate3d(calc(-50% + ${rX.toFixed(2)}px), ${rY.toFixed(2)}px, 0px) scale(${rScale.toFixed(3)})`;
        rippleRef.current.style.opacity = rOpacity.toFixed(3);
      }

      // 7. Floating Pontoon (Asset 10): zooms in strongly with perspective and glides downward off-screen as you scroll
      if (pontoonRef.current) {
        const pRot = isMob ? 0 : x * 2.5;
        const pX = isMob ? 0 : x * 2.0;
        const pY = vistaSp * (isMob ? 280 : 420);
        const pScale = 1 + vistaSp * (isMob ? 0.85 : 1.15);
        pontoonRef.current.style.transform = `translate3d(calc(-50% + ${pX.toFixed(2)}px), ${pY.toFixed(2)}px, 0px) scale(${pScale.toFixed(3)}) rotateY(${pRot.toFixed(2)}deg)`;
        pontoonRef.current.style.opacity = '1';
      }

      // 8. Section 2 Smooth Opaque Slide-up (Solid Curtain):
      // The completed vista (Section 1) is held firmly from 0.50 to 0.76.
      // From 0.76 to 0.98, Section 2 slides smoothly upwards from 100% to 0% as a solid opaque curtain.
      // This completely eliminates double-exposure / ghosting between Section 1 and Section 2.
      if (!isLockedToBubblesRef.current) {
        const transProg = sp < 0.76 ? 0 : Math.min(1, Math.max(0, (sp - 0.76) / 0.22));
        const slideY = (1 - transProg) * 100;
        if (secondSectionRef.current) {
          secondSectionRef.current.style.transform = `translate3d(0, ${slideY.toFixed(2)}%, 0)`;
          secondSectionRef.current.style.pointerEvents = transProg > 0.85 ? 'auto' : 'none';
        }

        // Trigger bubble entrance animation as soon as Section 2 begins sliding into view!
        if (!hasTriggeredBubblesRef.current && sp >= 0.76) {
          hasTriggeredBubblesRef.current = true;
          setIsSection2Active(true);
          window.dispatchEvent(new CustomEvent('catalyst-trigger-bubbles'));
        }

        // Once the curtain slide completes at sp >= 0.98, lock permanently into Section 2!
        if (sp >= 0.98) {
          lockToSection2();
        }
      }

      rafId.current = requestAnimationFrame(render);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    if (window.DeviceOrientationEvent && typeof (DeviceOrientationEvent as any).requestPermission !== 'function') {
      window.addEventListener('deviceorientation', handleDeviceOrientation);
    }

    rafId.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [handleMouseMove, handleTouchMove, handleDeviceOrientation]);

  // Active view: Natural Daylight (Red Sun)
  const currentFilter = {
    filter: 'none',
    skyTint: 'transparent',
    isMoon: false,
  };

  return (
    <div className={`relative bg-[#F8F3E9] ${theme === 'classic' ? 'theme-classic' : ''}`}>
      {/* FULLSCREEN PRELOADER WITH LIQUID WAVE SPINNER */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="preloader"
            className="fixed inset-0 z-50 flex h-screen w-full items-center justify-center bg-white"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.8, ease: TWEEN_EASING }}
          >
            <LiquidWaveSpinner size="md" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Crimson Accent Stripe (Section 1 only) */}
      {!isLockedToBubbles && (
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

      {/* SECTION 1: 3D PARALLAX SCENE (Sticky Viewport in 320vh scroll track) */}
      <div
        ref={heroTrackRef}
        className="relative h-[320vh] w-full"
        style={{ display: isLockedToBubbles ? 'none' : 'block' }}
      >
        <div
          className="sticky top-0 h-screen w-full overflow-hidden pointer-events-none select-none z-10"
          style={{ filter: currentFilter.filter }}
        >
        {/* Floating Sakura Petals Particle Simulation (confined exclusively to Section 1) */}
        <SakuraPetals enabled={sakuraEnabled} mouseVelX={mouseVelX} className="absolute inset-0 pointer-events-none z-20 w-full h-full" />

        {/* Sky Background */}
        <div className="sky-bg" />

        {/* Atmosphere Tint */}
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-700"
          style={{ background: currentFilter.skyTint }}
        />

        {/* GIANT RED SUN / LUMINOUS MOON */}
        <div
          ref={sunMoonRef}
          className={`celestial-body ${currentFilter.isMoon ? 'is-moon' : 'is-sun'}`}
        />

        {/* SEQUENTIAL TYPOGRAPHY NEAR THE MOON */}
        <div className="moon-title-stage">
          <div ref={experienceRef} className="title-word-item">
            <span className="title-experience">EXPERIENCE</span>
          </div>
          <div ref={catalystRef} className="title-word-item catalyst-word-wrapper">
            <span ref={presenterRef} className="title-presenter">
              AIESEC IN SLIIT PRESENTS
            </span>
            <h1 className="title-catalyst catalyst-brush-track">
              {CATALYST_LETTERS.map((char, index) => (
                <span
                  key={index}
                  ref={(el) => {
                    letterRefs.current[index] = el;
                  }}
                  className="brush-letter"
                >
                  {char}
                </span>
              ))}
              <div ref={brushTipRef} className="brush-tip-cursor" />
            </h1>
          </div>
        </div>

        {/* Mt. Fuji Distant Peaks */}
        <div ref={mtFujiRef} className="mt-fuji-layer" style={{ transformStyle: 'preserve-3d' }} />

        {/* Drifting Lake Mist / Clouds */}
        {mistEnabled && <div className="mist-layer-box" />}

        {/* Shoreline Hills Framing Sides */}
        <div ref={hillRightRef} className="hill-right-layer" style={{ transformStyle: 'preserve-3d' }} />
        <div ref={hillLeftRef} className="hill-left-layer" style={{ transformStyle: 'preserve-3d' }} />

        {/* Lake Water Surface (Asset 3 - Pristine reflection path) */}
        <div ref={waterRef} className="water-lake-layer" style={{ transformStyle: 'preserve-3d' }} />

        {/* Water Ripple Ring Animation */}
        <div ref={rippleRef} className="water-ripple-center">
          <div className="water-ring" />
          <div className="water-ring _2" />
        </div>

        {/* UNIFIED RYŌBU-TORII ASSEMBLY (No duplicate gates, perfectly aligned!) */}
        <div ref={toriiStageRef} className="torii-stage">
          {/* Rear support columns in 3D perspective */}
          <div ref={toriiBackPillarsRef} className="torii-back-pillars" />

          {/* Main front Torii gate */}
          <div className="torii-front-gate" />
        </div>

        {/* Wooden Floating Pontoon Dock */}
        <div
          ref={pontoonRef}
          className="pontoon-dock"
          onClick={scrollToStory}
          title="Scroll down or click to enter Catalyst"
        />
      </div>

        {/* "SCROLL DOWN TO ENTER" HERO ENTRANCE GROUP */}
        <motion.div
          className="fixed bottom-6 sm:bottom-10 left-1/2 z-30 flex flex-col items-center justify-center gap-1 sm:gap-1.5 cursor-pointer text-center select-none"
          style={{
            left: '50%',
            x: '-50%',
            pointerEvents: scrollProgress > 0.15 ? 'none' : 'auto',
          }}
          initial={{
            opacity: 0,
            y: shouldReduceMotion ? 0 : isMobile ? 8 : 12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.8,
            ease: TWEEN_EASING,
          }}
          whileHover={shouldReduceMotion ? undefined : { scale: 1.01 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
          onClick={scrollToStory}
        >
          <div
            className="flex flex-col items-center justify-center gap-1 sm:gap-1.5"
            style={{
              opacity: Math.max(0, 1 - scrollProgress * 4),
              transform: `translateY(${scrollProgress * 30}px)`,
            }}
          >
            <span className="text-white/90 font-sans text-[9px] sm:text-[11px] tracking-[0.25em] pl-[0.25em] uppercase font-bold text-shadow text-center">
              Scroll Down to Enter
            </span>
            <div className="w-4 h-7 sm:w-5 sm:h-8 rounded-full border-2 border-white/60 flex items-start justify-center p-1 shadow-lg bg-black/20 backdrop-blur-xs">
              <div className="w-1 h-1.5 sm:w-1.5 sm:h-2 bg-white rounded-full mt-0.5" />
            </div>
            <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/70 -mt-1" />
          </div>
        </motion.div>
      </div>

      {/* SECTIONS 2–6 CONTAINER (Solid Opaque Curtain on entrance, normal scroll flow when locked) */}
      <div
        ref={secondSectionRef}
        className={`w-full z-30 bg-[#F8F3E9] ${
          isLockedToBubbles
            ? 'relative pointer-events-auto'
            : 'fixed inset-0 h-screen overflow-hidden pointer-events-none'
        }`}
        style={{
          transform: isLockedToBubbles ? 'none' : 'translate3d(0, 100%, 0)',
        }}
      >
        {/* SECTION 2: FESTIVITY 3D INTERACTIVE HERO */}
        <section className="relative w-full h-screen overflow-hidden catalyst-section-isolate">
          <FestivityDemo shouldAnimate={isSection2Active || isLockedToBubbles} />
        </section>

        {/* SECTION 3: ANIMATED GALLERY */}
        <div id="gallery" className="w-full catalyst-section-isolate">
          <AnimatedGalleryDemo />
        </div>

        {/* SECTION 4: FULL SCREEN SCROLL FX (GSAP ScrollTrigger Slideshow) */}
        <div className="catalyst-section-isolate">
          <FullScreenScrollFXDemo />
        </div>

        {/* SECTION 6: 3D COVERFLOW CAROUSEL */}
        <div className="catalyst-section-isolate">
          <CoverFlowCarouselDemo />
        </div>

        {/* Outro / Footer */}
        <section id="contact" className="flex h-[30svh] w-full items-center justify-center bg-[#F3ECE0] px-6 text-center select-none border-t border-[#252321]/10">
          <p className="max-w-md font-mono text-xs uppercase leading-relaxed tracking-[0.3em] text-[#736B63] font-bold">
            Scroll back up to explore previous realms.
          </p>
        </section>
      </div>
    </div>
  );
}
