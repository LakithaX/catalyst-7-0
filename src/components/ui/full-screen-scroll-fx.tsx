import React, {
  CSSProperties,
  ReactNode,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export type Section = {
  id?: string;
  background: string;
  leftLabel?: ReactNode;
  title: string | ReactNode;
  rightLabel?: ReactNode;
  /** Single kanji drawn huge and faint behind the title */
  kanji?: string;
  renderBackground?: (active: boolean, previous: boolean) => ReactNode;
};

export type Colors = Partial<{
  text: string;
  overlay: string;
  pageBg: string;
  stageBg: string;
}>;

export type Durations = Partial<{
  change: number; // snap settle duration (seconds, max)
  snap: number; // programmatic scroll duration (ms) - kept for API compatibility
}>;

export type FullScreenFXAPI = {
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
  getIndex: () => number;
  refresh: () => void;
};

export type FullScreenFXProps = {
  sections: Section[];
  className?: string;
  style?: CSSProperties;

  // Layout
  fontFamily?: string;
  header?: ReactNode;
  footer?: ReactNode;
  gap?: number; // rem
  gridPaddingX?: number; // rem

  showProgress?: boolean;
  debug?: boolean;

  // Motion
  durations?: Durations;
  reduceMotion?: boolean;
  smoothScroll?: boolean; // kept for API compatibility (unused)
  bgTransition?: "fade" | "wipe"; // kept for API compatibility (unused)
  parallaxAmount?: number;

  /**
   * Must be false while the page still shows this section inside an off-screen
   * "curtain", and true once it is in normal page flow. ScrollTrigger measures
   * positions when it is created, so creating it too early breaks pin spacing.
   */
  active?: boolean;

  /** Colour that fully covers the stage at the start, then opens like an iris (null = no intro). */
  introColor?: string | null;
  /** Optional colour crossfaded over the end (null = none: the photo just pushes forward and scrolls away). */
  outroColor?: string | null;
  /** Scroll length of the intro / outro, in screens. */
  introLength?: number;
  outroLength?: number;
  /** Scroll length between two slides, in screens. */
  scrollPerSection?: number;
  /** Settle onto the nearest slide when the user stops scrolling. */
  snap?: boolean;
  /** Scroll smoothing in seconds (higher = floatier). */
  scrub?: number;

  // Controlled index
  currentIndex?: number;
  onIndexChange?: (index: number) => void;
  initialIndex?: number;

  // Colors
  colors?: Colors;

  // Japanese touches
  hanko?: string | null; // red stamp, top right (null = hidden)
  verticalText?: string | null; // vertical line, top left (null = hidden)
  petals?: boolean; // falling sakura

  // Imperative API
  apiRef?: React.Ref<FullScreenFXAPI>;
  ariaLabel?: string;
};

const DISPLAY_FONT = "'Shippori Mincho', 'Noto Serif JP', 'Yu Mincho', 'Hiragino Mincho ProN', serif";
const NUMERALS = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];

// [left %, size px, fall seconds, delay seconds, horizontal drift vw, colour]
const PETAL_SPECS: [number, number, number, number, number, string][] = [
  [6, 14, 13, 0, 8, "#E9B9A5"],
  [17, 10, 16, 4, -6, "#C9362B"],
  [29, 13, 12, 8, 9, "#E9B9A5"],
  [54, 15, 14, 6, 7, "#C9362B"],
  [78, 13, 12, 3, 8, "#E9B9A5"],
  [90, 10, 16, 7, -7, "#C9362B"],
];

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const easeInOut = gsap.parseEase("power2.inOut");
const easeOut = gsap.parseEase("power3.out");

const setMask = (el: HTMLElement | null, value: string) => {
  if (!el) return;
  el.style.setProperty("mask-image", value);
  el.style.setProperty("-webkit-mask-image", value);
};

export const FullScreenScrollFX = forwardRef<HTMLDivElement, FullScreenFXProps>(
  (
    {
      sections,
      className,
      style,

      fontFamily = DISPLAY_FONT,
      header,
      footer,
      gap = 1,
      gridPaddingX = 2,

      showProgress = true,
      debug = false,

      durations = { change: 0.7, snap: 800 },
      reduceMotion,
      parallaxAmount = 4,

      active = true,
      introColor = "#C9362B",
      outroColor = "#F8F3E9",
      introLength = 0.7,
      outroLength = 0.8,
      scrollPerSection = 1,
      snap = true,
      scrub = 0.8,

      currentIndex,
      onIndexChange,
      initialIndex = 0,

      colors = {
        text: "rgba(245,245,245,0.92)",
        overlay: "rgba(0,0,0,0.35)",
        pageBg: "#ffffff",
        stageBg: "#000000",
      },

      hanko = "道",
      verticalText = "創造の過程",
      petals = true,

      apiRef,
      ariaLabel = "Full screen scroll slideshow",
    },
    ref
  ) => {
    const total = sections.length;
    const lastIdx = Math.max(0, total - 1);

    const [activeIndex, setActiveIndex] = useState(clamp(initialIndex, 0, lastIdx));
    const activeIndexRef = useRef(activeIndex);
    const isControlled = typeof currentIndex === "number";

    // ---- DOM refs (all per-frame animation is written straight to these, never through React state)
    const rootRef = useRef<HTMLDivElement | null>(null);
    const stageRef = useRef<HTMLDivElement | null>(null);
    const bgsRef = useRef<HTMLDivElement | null>(null);
    const uiRef = useRef<HTMLDivElement | null>(null);
    const introRef = useRef<HTMLDivElement | null>(null);
    const outroRef = useRef<HTMLDivElement | null>(null);
    const progressFillRef = useRef<HTMLDivElement | null>(null);
    const leftTrackRef = useRef<HTMLDivElement | null>(null);
    const rightTrackRef = useRef<HTMLDivElement | null>(null);

    const bgRefs = useRef<HTMLDivElement[]>([]);
    const bgImgRefs = useRef<HTMLDivElement[]>([]);
    const titleRefs = useRef<HTMLDivElement[]>([]);
    const leftItemRefs = useRef<HTMLDivElement[]>([]);
    const rightItemRefs = useRef<HTMLDivElement[]>([]);

    const stRef = useRef<ScrollTrigger | null>(null);
    const lastPRef = useRef(0);
    const entryRef = useRef(1); // 0 → 1 while the section scrolls up into view (before it pins)
    const measureRef = useRef({ diag: 1600, contH: 0, rowH: 40 });
    const onIndexChangeRef = useRef(onIndexChange);
    onIndexChangeRef.current = onIndexChange;

    // prefers-reduced-motion
    const prefersReduced = useMemo(() => {
      if (typeof window === "undefined") return false;
      return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }, []);
    const motionOff = reduceMotion ?? prefersReduced;

    // ---- Timeline layout, expressed in "screens" of scroll
    const S = Math.max(0.1, scrollPerSection);
    const intro = !motionOff && introColor ? Math.max(0, introLength) : 0;
    const outro = !motionOff ? Math.max(0, outroLength) : 0;
    const totalUnits = Math.max(0.01, intro + lastIdx * S + outro);

    const cfgRef = useRef({ lastIdx, S, intro, outro, totalUnits, parallaxAmount });
    cfgRef.current = { lastIdx, S, intro, outro, totalUnits, parallaxAmount };

    const progressFor = (idx: number) => (cfgRef.current.intro + idx * cfgRef.current.S) / cfgRef.current.totalUnits;

    // ------------------------------------------------------------------------------------------
    // Measure the bits the per-frame renderer needs (kept out of the hot path)
    // ------------------------------------------------------------------------------------------
    const measure = () => {
      const stage = stageRef.current;
      if (!stage) return;
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      const m = measureRef.current;
      m.diag = Math.hypot(w, h);

      const lc = leftTrackRef.current?.parentElement;
      const rc = rightTrackRef.current?.parentElement;
      const container = lc && lc.clientHeight ? lc : rc;
      m.contH = container ? container.clientHeight : 0;

      const a = leftItemRefs.current[0] ?? rightItemRefs.current[0];
      const b = leftItemRefs.current[1] ?? rightItemRefs.current[1];
      if (a && b) m.rowH = Math.abs(b.offsetTop - a.offsetTop) || a.offsetHeight || 40;
      else if (a) m.rowH = a.offsetHeight || 40;
    };

    // ------------------------------------------------------------------------------------------
    // The renderer: one function maps scroll progress (0..1) to every visual. Fully continuous.
    // ------------------------------------------------------------------------------------------
    const renderRef = useRef<(p: number) => void>(() => {});
    renderRef.current = (p: number) => {
      const c = cfgRef.current;
      const m = measureRef.current;
      lastPRef.current = p;

      const u = p * c.totalUnits;
      const introP = c.intro > 0 ? clamp01(u / c.intro) : 1;
      const pos = clamp((u - c.intro) / c.S, 0, c.lastIdx);
      const outroP = c.outro > 0 ? clamp01((u - c.intro - c.lastIdx * c.S) / c.outro) : 0;

      // -- Intro iris: a solid colour that opens from the centre
      const introEl = introRef.current;
      if (introEl) {
        if (introP >= 1) {
          introEl.style.visibility = "hidden";
        } else {
          introEl.style.visibility = "visible";
          if (introP <= 0) {
            setMask(introEl, "none");
          } else {
            const t = easeInOut(introP);
            const f = 90;
            const r = t * (m.diag / 2 + f) - f;
            setMask(introEl, `radial-gradient(circle at 50% 50%, transparent ${r}px, #000 ${r + f}px)`);
          }
        }
      }

      // -- Outro: clean crossfade to the next section's colour
      const outroEl = outroRef.current;
      if (outroEl) {
        if (outroP <= 0) {
          outroEl.style.visibility = "hidden";
        } else {
          outroEl.style.visibility = "visible";
          outroEl.style.opacity = easeInOut(outroP).toFixed(3);
        }
      }

      // Entrance progress: intro iris if used, otherwise the natural scroll-in before the pin
      const enter = c.intro > 0 ? introP : entryRef.current;

      // -- Background layer zoom: settles in on entrance, pushes forward on outro
      if (bgsRef.current) {
        const sIn = 1 + 0.18 * (1 - easeOut(enter));
        const sOut = 1 + 0.35 * easeInOut(outroP);
        bgsRef.current.style.transform = `scale(${(sIn * sOut).toFixed(4)})`;
      }

      // -- UI layer (header, labels, titles, progress)
      if (uiRef.current) {
        const fadeIn = c.intro > 0 ? clamp01((introP - 0.3) / 0.7) : clamp01((enter - 0.35) / 0.65);
        const fadeOut = 1 - clamp01(outroP / 0.55);
        const sc = (0.94 + 0.06 * easeOut(enter)) * (1 + 0.16 * easeInOut(outroP));
        uiRef.current.style.opacity = (fadeIn * fadeOut).toFixed(3);
        uiRef.current.style.transform = `scale(${sc.toFixed(4)})`;
      }

      // -- Slides
      for (let i = 0; i < sections.length; i++) {
        const d = i - pos;
        const ad = Math.abs(d);
        const dc = clamp(d, -1, 1);

        // Background: next slide fades in over the current one (no dark dip in the middle)
        const bg = bgRefs.current[i];
        if (bg) {
          const op = i === 0 ? 1 : clamp01(pos - (i - 1));
          const covered = pos >= i + 1; // fully hidden under the next slide
          bg.style.opacity = op.toFixed(3);
          bg.style.visibility = op <= 0.001 || covered ? "hidden" : "visible";
        }
        const img = bgImgRefs.current[i];
        if (img) {
          const sc = dc > 0 ? 1 + 0.14 * dc : 1 + 0.06 * -dc;
          img.style.transform = `translate3d(0, ${(-dc * c.parallaxAmount).toFixed(2)}%, 0) scale(${sc.toFixed(4)})`;
        }

        // Title: 3D roll in/out
        const t = titleRefs.current[i];
        if (t) {
          const o = clamp01(1 - ad * 1.6);
          const oe = o * o * (3 - 2 * o);
          t.style.opacity = oe.toFixed(3);
          t.style.visibility = oe <= 0.001 ? "hidden" : "visible";
          t.style.transform = `translate3d(0, ${(dc * 55).toFixed(2)}%, 0) rotateX(${(-dc * 38).toFixed(2)}deg) scale(${(
            1 -
            0.08 * Math.min(1, ad)
          ).toFixed(4)})`;
        }

        // Side labels: continuous emphasis
        const lo = (0.3 + 0.7 * (1 - Math.min(1, ad))).toFixed(3);
        const li = leftItemRefs.current[i];
        const ri = rightItemRefs.current[i];
        if (li) li.style.opacity = lo;
        if (ri) ri.style.opacity = lo;
      }

      // -- Label tracks follow the scroll position
      const y = m.contH / 2 - m.rowH / 2 - pos * m.rowH;
      if (leftTrackRef.current) leftTrackRef.current.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
      if (rightTrackRef.current) rightTrackRef.current.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;

      // -- Progress bar
      if (progressFillRef.current) {
        progressFillRef.current.style.transform = `scaleX(${(c.lastIdx > 0 ? pos / c.lastIdx : 1).toFixed(4)})`;
      }

      // -- Active index (React state only changes when the rounded index changes)
      const r = Math.round(pos);
      if (r !== activeIndexRef.current) {
        activeIndexRef.current = r;
        setActiveIndex(r);
        onIndexChangeRef.current?.(r);
      }
    };

    // ------------------------------------------------------------------------------------------
    // Initial paint + resize handling
    // ------------------------------------------------------------------------------------------
    useLayoutEffect(() => {
      measure();
      renderRef.current(motionOff ? progressFor(clamp(initialIndex, 0, lastIdx)) : 0);

      const stage = stageRef.current;
      const fonts = (document as any).fonts;
      if (fonts?.ready) {
        fonts.ready.then(() => {
          measure();
          renderRef.current(lastPRef.current);
        });
      }
      if (!stage || typeof ResizeObserver === "undefined") return;
      const ro = new ResizeObserver(() => {
        measure();
        renderRef.current(lastPRef.current);
      });
      ro.observe(stage);
      return () => ro.disconnect();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [total, motionOff]);

    // ------------------------------------------------------------------------------------------
    // ScrollTrigger: one pinned, scrubbed progress tween drives everything
    // ------------------------------------------------------------------------------------------
    useLayoutEffect(() => {
      if (typeof window === "undefined") return;
      if (!active || motionOff || total === 0) return;
      const root = rootRef.current;
      const stage = stageRef.current;
      if (!root || !stage) return;

      measure();

      const state = { p: 0 };
      const points: number[] = [0];
      if (intro > 0) points.push(intro);
      for (let i = 0; i <= lastIdx; i++) points.push(intro + i * S);
      points.push(totalUnits);

      const tween = gsap.to(state, {
        p: 1,
        ease: "none",
        onUpdate: () => renderRef.current(state.p),
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: () => "+=" + Math.round(totalUnits * (stage.offsetHeight || window.innerHeight)),
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          scrub,
          invalidateOnRefresh: true,
          // Compute after the gallery's pins so our start/end include their spacing
          refreshPriority: -1,
          onRefresh: () => {
            measure();
            renderRef.current(state.p);
          },
          snap: snap
            ? {
                snapTo: (value: number) => {
                  const u = value * totalUnits;
                  let best = points[0];
                  for (const pt of points) if (Math.abs(pt - u) < Math.abs(best - u)) best = pt;
                  return best / totalUnits;
                },
                duration: { min: 0.25, max: Math.max(0.35, durations.change ?? 0.7) },
                delay: 0.12,
                ease: "power2.inOut",
              }
            : undefined,
        },
      });

      stRef.current = tween.scrollTrigger ?? null;

      // Scroll-in entrance (runs while the section rises into view, before it pins)
      const entryST = ScrollTrigger.create({
        trigger: root,
        start: "top bottom",
        end: "top top",
        scrub: true,
        invalidateOnRefresh: true,
        refreshPriority: -1,
        onUpdate: (self) => {
          entryRef.current = self.progress;
          renderRef.current(lastPRef.current);
        },
        onRefresh: (self) => {
          entryRef.current = self.progress;
        },
      });

      let cancelled = false;
      const fonts = (document as any).fonts;
      if (fonts?.ready) fonts.ready.then(() => !cancelled && ScrollTrigger.refresh());

      return () => {
        cancelled = true;
        entryST.kill();
        tween.scrollTrigger?.kill();
        tween.kill();
        stRef.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active, motionOff, total, intro, outro, S, snap, scrub]);

    // ------------------------------------------------------------------------------------------
    // Navigation
    // ------------------------------------------------------------------------------------------
    const goTo = (to: number) => {
      const idx = clamp(to, 0, lastIdx);
      const st = stRef.current;
      if (st && typeof window !== "undefined") {
        const y = st.start + progressFor(idx) * (st.end - st.start);
        window.scrollTo({ top: y, behavior: "smooth" });
      } else {
        renderRef.current(progressFor(idx));
      }
    };
    const next = () => goTo(activeIndexRef.current + 1);
    const prev = () => goTo(activeIndexRef.current - 1);

    useImperativeHandle(apiRef, () => ({
      next,
      prev,
      goTo,
      getIndex: () => activeIndexRef.current,
      refresh: () => ScrollTrigger.refresh(),
    }));

    useEffect(() => {
      if (isControlled && currentIndex !== activeIndexRef.current) goTo(currentIndex as number);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentIndex]);

    const onKey = (i: number) => (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        goTo(i);
      }
    };

    // CSS vars
    const cssVars: CSSProperties = {
      ["--fx-font" as any]: fontFamily,
      ["--fx-jp" as any]: "'Noto Serif JP', 'Shippori Mincho', 'Yu Mincho', serif",
      ["--fx-label" as any]: "'Noto Sans JP', 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
      ["--fx-text" as any]: colors.text ?? "rgba(245,245,245,0.92)",
      ["--fx-overlay" as any]: colors.overlay ?? "rgba(0,0,0,0.35)",
      ["--fx-page-bg" as any]: colors.pageBg ?? "#fff",
      ["--fx-stage-bg" as any]: colors.stageBg ?? "#000",
      ["--fx-intro" as any]: introColor ?? "transparent",
      ["--fx-outro" as any]: outroColor ?? "transparent",
      ["--fx-gap" as any]: `${gap}rem`,
      ["--fx-grid-px" as any]: `${gridPaddingX}rem`,
      ["--fx-row-gap" as any]: "10px",
    };

    return (
      <div
        ref={(node) => {
          (rootRef as any).current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        className={["fx", className].filter(Boolean).join(" ")}
        style={{ ...cssVars, ...style }}
        aria-label={ariaLabel}
      >
        {debug && <div className="fx-debug">Section: {activeIndex}</div>}

        <div className="fx-stage" ref={stageRef}>
          {/* Backgrounds */}
          <div className="fx-bgs" ref={bgsRef} aria-hidden="true">
            {sections.map((s, i) => (
              <div
                className="fx-bg"
                key={s.id ?? i}
                ref={(el) => {
                  if (el) bgRefs.current[i] = el;
                }}
              >
                {s.renderBackground ? (
                  s.renderBackground(i === activeIndex, i === activeIndex - 1)
                ) : (
                  <>
                    <div
                      className="fx-bg-img-wrap"
                      ref={(el) => {
                        if (el) bgImgRefs.current[i] = el;
                      }}
                    >
                      <img
                        src={s.background}
                        alt=""
                        className="fx-bg-img"
                        decoding="async"
                        draggable={false}
                      />
                    </div>
                    <div className="fx-bg-shade" />
                    <div className="fx-bg-overlay" />
                  </>
                )}
              </div>
            ))}
          </div>

          {/* UI */}
          <div className="fx-ui" ref={uiRef}>
            <div className="fx-frame" aria-hidden="true">
              <span className="tl" />
              <span className="tr" />
              <span className="bl" />
              <span className="br" />
            </div>
            {verticalText && (
              <div className="fx-vertical" aria-hidden="true">
                {verticalText}
              </div>
            )}
            {hanko && (
              <div className="fx-hanko" aria-hidden="true">
                <span>{hanko}</span>
              </div>
            )}
            {petals && (
              <div className="fx-petals" aria-hidden="true">
                {PETAL_SPECS.map(([left, size, dur, delay, drift, color], i) => (
                  <svg
                    key={i}
                    className="fx-petal"
                    viewBox="0 0 24 32"
                    style={
                      {
                        left: `${left}%`,
                        width: size,
                        animationDuration: `${dur}s`,
                        animationDelay: `-${delay}s`,
                        ["--drift" as any]: `${drift}vw`,
                      } as CSSProperties
                    }
                  >
                    <path
                      d="M12 2 C16 7, 22 13, 21 21 C20 27, 15 30, 12 28 C9 30, 4 27, 3 21 C2 13, 8 7, 12 2 Z"
                      fill={color}
                      opacity="0.85"
                    />
                  </svg>
                ))}
              </div>
            )}
            <div className="fx-grid">
              {header && (
                <div className="fx-header">
                  {header}
                  <svg className="fx-brush" viewBox="0 0 420 28" fill="none" aria-hidden="true">
                    <path
                      d="M6 16 C45 10, 95 8, 150 9 C220 10, 290 8, 350 12 C385 14, 405 16, 416 13 C405 20, 370 21, 320 20 C240 18, 160 21, 90 20 C50 19, 20 20, 6 16 Z"
                      fill="#C9362B"
                    />
                  </svg>
                </div>
              )}

              <div className="fx-content">
                {/* Left list */}
                <div className="fx-left" role="list">
                  <div className="fx-track" ref={leftTrackRef}>
                    {sections.map((s, i) => {
                      const isActive = i === activeIndex;
                      return (
                        <div
                          key={`L-${s.id ?? i}`}
                          className={`fx-item fx-left-item ${isActive ? "active" : ""}`}
                          ref={(el) => {
                            if (el) leftItemRefs.current[i] = el;
                          }}
                          onClick={() => goTo(i)}
                          onKeyDown={onKey(i)}
                          role="button"
                          tabIndex={0}
                          aria-pressed={isActive}
                        >
                          {s.leftLabel}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Center titles */}
                <div className="fx-center">
                  {sections.map((s, i) => (
                    <div
                      key={`C-${s.id ?? i}`}
                      className={`fx-featured ${i === activeIndex ? "active" : ""}`}
                      ref={(el) => {
                        if (el) titleRefs.current[i] = el;
                      }}
                    >
                      <div className="fx-chapter" aria-hidden="true">
                        {s.kanji && <span className="fx-seal">{s.kanji}</span>}
                        <span className="fx-chapter-text">第{NUMERALS[i] ?? i + 1}章</span>
                      </div>
                      <h3 className="fx-featured-title">
                        <span className="fx-word">{s.title}</span>
                      </h3>
                    </div>
                  ))}
                </div>

                {/* Right list */}
                <div className="fx-right" role="list">
                  <div className="fx-track" ref={rightTrackRef}>
                    {sections.map((s, i) => {
                      const isActive = i === activeIndex;
                      return (
                        <div
                          key={`R-${s.id ?? i}`}
                          className={`fx-item fx-right-item ${isActive ? "active" : ""}`}
                          ref={(el) => {
                            if (el) rightItemRefs.current[i] = el;
                          }}
                          onClick={() => goTo(i)}
                          onKeyDown={onKey(i)}
                          role="button"
                          tabIndex={0}
                          aria-pressed={isActive}
                        >
                          {s.rightLabel}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer + progress */}
              <div className="fx-footer">
                {footer && <div className="fx-footer-title">{footer}</div>}
                {showProgress && (
                  <div className="fx-progress">
                    <div className="fx-progress-numbers">
                      <span>{String(activeIndex + 1).padStart(2, "0")}</span>
                      <span>{String(total).padStart(2, "0")}</span>
                    </div>
                    <div className="fx-progress-fill" ref={progressFillRef} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Transition covers */}
          {introColor && <div className="fx-intro" ref={introRef} aria-hidden="true" />}
          {outroColor && <div className="fx-outro" ref={outroRef} aria-hidden="true" style={{ visibility: "hidden" }} />}
        </div>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@700;800&family=Noto+Sans+JP:wght@500;700&family=Noto+Serif+JP:wght@700;900&display=swap');

          .fx {
            position: relative;
            width: 100%;
            background: var(--fx-stage-bg);
            color: #000;
            font-family: var(--fx-font);
            text-transform: uppercase;
            letter-spacing: -0.02em;
          }

          .fx-debug {
            position: fixed; bottom: 10px; right: 10px; z-index: 9999;
            background: rgba(255,255,255,0.8); color: #000; padding: 6px 8px; font: 12px/1 monospace; border-radius: 4px;
          }

          .fx-stage {
            position: relative;
            width: 100%;
            height: 100vh;
            height: 100svh;
            overflow: hidden;
            background: var(--fx-stage-bg);
            isolation: isolate;
            -webkit-font-smoothing: antialiased;
          }

          .fx-bgs {
            position: absolute; inset: 0; z-index: 1;
            background: var(--fx-stage-bg);
            transform-origin: 50% 50%;
            will-change: transform;
          }
          .fx-bg { position: absolute; inset: 0; will-change: opacity; }
          .fx-bg-img-wrap {
            position: absolute; inset: -10% 0 -10% 0;
            will-change: transform;
            transform-origin: 50% 50%;
          }
          .fx-bg-img { display: block; width: 100%; height: 100%; object-fit: cover; }
          .fx-bg-shade {
            position: absolute; inset: 0;
            background:
              radial-gradient(ellipse 55% 34% at 50% 52%, rgba(0,0,0,0.38), rgba(0,0,0,0) 100%),
              linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.55) 100%),
              rgba(0,0,0,0.12);
          }
          .fx-bg-overlay { position: absolute; inset: 0; background: var(--fx-overlay); }

          .fx-ui {
            position: absolute; inset: 0; z-index: 2;
            transform-origin: 50% 50%;
            will-change: transform, opacity;
          }

          .fx-grid {
            display: grid;
            grid-template-columns: repeat(12, 1fr);
            gap: var(--fx-gap);
            padding: 0 var(--fx-grid-px);
            position: relative;
            height: 100%;
          }

          .fx-header {
            grid-column: 1 / 13; align-self: start; padding-top: 7svh;
            font-size: clamp(2rem, 6.2vw, 5.8rem); line-height: 1.04; text-align: center; color: var(--fx-text);
            font-weight: 800; letter-spacing: 0.04em;
            text-shadow: 0 2px 26px rgba(0,0,0,0.6);
          }
          .fx-header > * { display: block; }
          .fx-brush { width: clamp(150px, 24vw, 380px); height: auto; margin: 0.6rem auto 0; filter: drop-shadow(0 3px 12px rgba(0,0,0,0.35)); }

          .fx-content {
            grid-column: 1 / 13;
            position: absolute; inset: 0;
            display: grid; grid-template-columns: minmax(100px, 1fr) minmax(auto, 2.8fr) minmax(100px, 1fr);
            align-items: center;
            height: 100%;
            padding: 0 var(--fx-grid-px);
          }

          .fx-left, .fx-right {
            position: relative;
            height: 56svh;
            overflow: hidden;
            -webkit-mask-image: linear-gradient(to bottom, transparent 0%, #000 28%, #000 72%, transparent 100%);
            mask-image: linear-gradient(to bottom, transparent 0%, #000 28%, #000 72%, transparent 100%);
          }
          .fx-track { display: flex; flex-direction: column; will-change: transform; }
          .fx-left .fx-track { align-items: flex-start; }
          .fx-right .fx-track { align-items: flex-end; }

          .fx-item {
            color: var(--fx-text);
            font-family: var(--fx-label);
            font-weight: 700;
            letter-spacing: 0.16em;
            line-height: 1;
            margin: calc(var(--fx-row-gap) / 2) 0;
            opacity: 0.3;
            transition: transform 0.35s ease, color 0.35s ease;
            position: relative;
            font-size: clamp(0.8rem, 1.35vw, 1.15rem);
            user-select: none;
            cursor: pointer;
            will-change: opacity;
          }
          .fx-left-item.active, .fx-right-item.active { color: #ffffff; }
          .fx-left-item.active { transform: translateX(10px); padding-left: 20px; }
          .fx-right-item.active { transform: translateX(-10px); padding-right: 20px; }

          .fx-left-item.active::before,
          .fx-right-item.active::after {
            content: "•";
            position: absolute; top: 50%; transform: translateY(-50%);
            font-size: 1.5rem; line-height: 1; color: #ffffff;
          }
          .fx-left-item.active::before { left: 0; }
          .fx-right-item.active::after { right: 0; }

          .fx-center {
            position: relative;
            display: grid; place-items: center; text-align: center; height: 56svh;
            perspective: 1200px;
          }
          .fx-featured {
            position: absolute;
            inset: 0;
            display: flex;
            flex-direction: column;
            gap: 0.9rem;
            align-items: center;
            justify-content: center;
            will-change: transform, opacity;
            backface-visibility: hidden;
          }
          .fx-featured-title {
            margin: 0; color: var(--fx-text);
            font-weight: 800; letter-spacing: 0.05em;
            font-size: clamp(2.4rem, 6.2vw, 5.6rem);
            line-height: 1.08;
            white-space: nowrap;
          }
          .fx-word {
            display: inline-block;
            vertical-align: middle;
            color: #ffffff;
            text-shadow: 0 2px 28px rgba(0,0,0,0.65);
          }

          .fx-footer {
            grid-column: 1 / 13; align-self: end; padding-bottom: calc(4svh + env(safe-area-inset-bottom, 0px)); text-align: center;
          }
          .fx-footer-title { color: var(--fx-text); font-size: clamp(1.6rem, 7vw, 7rem); font-weight: 800; letter-spacing: 0.03em; line-height: 0.9; }
          .fx-progress { width: 220px; height: 3px; margin: 1.4rem auto 0; background: rgba(245,245,245,0.28); border-radius: 2px; position: relative; }
          .fx-progress-fill { position: absolute; inset: 0; border-radius: 2px; background: #ffffff; transform-origin: left center; transform: scaleX(0); will-change: transform; }
          .fx-progress-numbers { position: absolute; inset: auto 0 100% 0; display: flex; justify-content: space-between; font-family: var(--fx-label); font-size: 0.8rem; color: #ffffff; font-weight: 700; letter-spacing: 0.14em; padding-bottom: 8px; }

          .fx-chapter { display: flex; align-items: center; gap: 0.85rem; }
          .fx-seal {
            display: grid; place-items: center;
            width: clamp(34px, 3.4vw, 48px); height: clamp(34px, 3.4vw, 48px);
            background: #C9362B; color: #F8F3E9;
            border-radius: 4px;
            font-family: var(--fx-jp); font-weight: 900;
            font-size: clamp(1.1rem, 2vw, 1.7rem); line-height: 1;
            text-transform: none;
            transform: rotate(-4deg);
            box-shadow: 0 6px 18px rgba(0,0,0,0.4), inset 0 0 0 1.5px rgba(248,243,233,0.35);
          }
          .fx-chapter-text {
            font-family: var(--fx-label);
            font-weight: 700;
            font-size: clamp(0.8rem, 1.2vw, 1.05rem);
            letter-spacing: 0.3em;
            color: #ffffff;
            text-transform: none;
            text-shadow: 0 2px 12px rgba(0,0,0,0.6);
          }

          .fx-frame { position: absolute; inset: 0; pointer-events: none; }
          .fx-frame span { position: absolute; width: clamp(18px, 2.4vw, 34px); height: clamp(18px, 2.4vw, 34px); border: 0 solid rgba(255,255,255,0.6); }
          .fx-frame .tl { top: 2.4svh; left: 1.6vw; border-top-width: 1px; border-left-width: 1px; }
          .fx-frame .tr { top: 2.4svh; right: 1.6vw; border-top-width: 1px; border-right-width: 1px; }
          .fx-frame .bl { bottom: 2.4svh; left: 1.6vw; border-bottom-width: 1px; border-left-width: 1px; }
          .fx-frame .br { bottom: 2.4svh; right: 1.6vw; border-bottom-width: 1px; border-right-width: 1px; }

          .fx-vertical {
            position: absolute; z-index: 3;
            top: 8svh; left: calc(1.6vw + 6px);
            writing-mode: vertical-rl;
            font-family: var(--fx-jp); font-weight: 700;
            font-size: clamp(0.8rem, 1.2vw, 1.1rem);
            letter-spacing: 0.5em;
            color: rgba(255,255,255,0.85);
            text-transform: none;
            text-shadow: 0 2px 14px rgba(0,0,0,0.5);
            pointer-events: none;
          }
          .fx-vertical::after { content: ""; display: block; width: 1px; height: 7svh; margin: 0.9rem auto 0; background: linear-gradient(#C9362B, transparent); }

          .fx-hanko {
            position: absolute; z-index: 3;
            top: 5svh; right: 4vw;
            width: clamp(42px, 4.6vw, 68px); height: clamp(42px, 4.6vw, 68px);
            display: grid; place-items: center;
            background: #C9362B; color: #F8F3E9;
            border-radius: 5px;
            font-family: var(--fx-jp); font-weight: 900;
            font-size: clamp(1.5rem, 2.8vw, 2.6rem); line-height: 1;
            text-transform: none;
            transform: rotate(6deg);
            box-shadow: 0 8px 24px rgba(0,0,0,0.4), inset 0 0 0 2px rgba(248,243,233,0.35);
            pointer-events: none;
          }

          .fx-petals { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 1; }
          .fx-petal {
            position: absolute; top: -6%;
            height: auto;
            opacity: 0;
            animation-name: fx-petal-fall;
            filter: drop-shadow(0 1px 3px rgba(0,0,0,0.25));
            animation-timing-function: linear;
            animation-iteration-count: infinite;
            will-change: transform, opacity;
          }
          @keyframes fx-petal-fall {
            0%   { transform: translate3d(0, -8vh, 0) rotate(0deg); opacity: 0; }
            8%   { opacity: 0.6; }
            50%  { transform: translate3d(calc(var(--drift) * 0.4), 55vh, 0) rotate(200deg); }
            92%  { opacity: 0.6; }
            100% { transform: translate3d(var(--drift), 112vh, 0) rotate(420deg); opacity: 0; }
          }
          @media (prefers-reduced-motion: reduce) { .fx-petals { display: none; } }

          .fx-intro, .fx-outro {
            position: absolute; inset: 0; pointer-events: none;
            will-change: mask-image;
          }
          .fx-intro { z-index: 5; background: var(--fx-intro); }
          .fx-outro { z-index: 6; background: var(--fx-outro); }

          @media (max-width: 900px) {
            .fx-header {
              padding-top: calc(10svh + env(safe-area-inset-top, 0px));
              font-size: clamp(1.9rem, 9vw, 3.4rem);
              line-height: 1.05;
            }
            .fx-vertical { display: none; }
            .fx-hanko { top: calc(2.5svh + env(safe-area-inset-top, 0px)); right: 4.5vw; }
            .fx-frame .tl, .fx-frame .tr { top: calc(1.4svh + env(safe-area-inset-top, 0px)); }
            .fx-content {
              grid-template-columns: 1fr;
              place-items: center;
              padding: 0 1.25rem;
            }
            .fx-left, .fx-right { display: none !important; }
            .fx-center { height: 40svh; width: 100%; }
            .fx-featured-title {
              font-size: clamp(2.2rem, 11.5vw, 3.8rem);
              white-space: normal;
              word-break: break-word;
              padding: 0 0.5rem;
            }
            .fx-footer { padding-bottom: calc(6svh + env(safe-area-inset-bottom, 0px)); }
            .fx-progress { width: min(62vw, 240px); }
          }

          @media (max-height: 560px) and (min-width: 901px) {
            .fx-header { font-size: clamp(1.6rem, 5vw, 3.5rem); padding-top: 4svh; }
          }
        `}</style>
      </div>
    );
  }
);

FullScreenScrollFX.displayName = "FullScreenScrollFX";
export default FullScreenScrollFX;