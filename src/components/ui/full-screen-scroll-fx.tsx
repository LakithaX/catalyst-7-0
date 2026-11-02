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
  renderBackground?: (active: boolean, previous: boolean) => ReactNode;
};

export type Colors = Partial<{
  text: string;
  overlay: string;
  pageBg: string;
  stageBg: string;
}>;

export type Durations = Partial<{
  change: number; // section change animation
  snap: number;   // programmatic scroll duration (ms)
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
  gap?: number;           // rem
  gridPaddingX?: number;  // rem

  showProgress?: boolean;
  debug?: boolean;

  // Motion
  durations?: Durations;
  reduceMotion?: boolean;
  smoothScroll?: boolean;

  // Background transition
  bgTransition?: "fade" | "wipe";
  parallaxAmount?: number;

  // Controlled index
  currentIndex?: number;
  onIndexChange?: (index: number) => void;
  initialIndex?: number;

  // Colors
  colors?: Colors;

  // Imperative API
  apiRef?: React.Ref<FullScreenFXAPI>;
  ariaLabel?: string;
};

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export const FullScreenScrollFX = forwardRef<HTMLDivElement, FullScreenFXProps>(
  (
    {
      sections,
      className,
      style,

      fontFamily = '"Rubik Wide", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
      header,
      footer,
      gap = 1,
      gridPaddingX = 2,

      showProgress = true,
      debug = false,

      durations = { change: 0.7, snap: 800 },
      reduceMotion,
      smoothScroll = false,

      bgTransition = "fade",
      parallaxAmount = 4,

      currentIndex,
      onIndexChange,
      initialIndex = 0,

      colors = {
        text: "rgba(245,245,245,0.92)",
        overlay: "rgba(0,0,0,0.35)",
        pageBg: "#ffffff",
        stageBg: "#000000",
      },

      apiRef,
      ariaLabel = "Full screen scroll slideshow",
    },
    ref
  ) => {
    const total = sections.length;
    const [localIndex, setLocalIndex] = useState(clamp(initialIndex, 0, Math.max(0, total - 1)));
    const isControlled = typeof currentIndex === "number";
    const activeIndex = isControlled ? clamp(currentIndex!, 0, Math.max(0, total - 1)) : localIndex;
    const activeIndexRef = useRef(activeIndex);

    const rootRef = useRef<HTMLDivElement | null>(null);
    const fixedRef = useRef<HTMLDivElement | null>(null);
    const fixedSectionRef = useRef<HTMLDivElement | null>(null);

    const leftTrackRef = useRef<HTMLDivElement | null>(null);
    const rightTrackRef = useRef<HTMLDivElement | null>(null);
    const leftItemRefs = useRef<HTMLDivElement[]>([]);
    const rightItemRefs = useRef<HTMLDivElement[]>([]);

    const stRef = useRef<ScrollTrigger | null>(null);

    // prefers-reduced-motion
    const prefersReduced = useMemo(() => {
      if (typeof window === "undefined") return false;
      return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }, []);
    const motionOff = reduceMotion ?? prefersReduced;

    // Align lists: center active row vertically
    const measureAndCenterLists = (toIndex = activeIndex, animate = true) => {
      const centerTrack = (
        container: HTMLDivElement | null,
        items: HTMLDivElement[],
        isRight: boolean
      ) => {
        if (!container || items.length === 0) return;
        const first = items[0];
        const second = items[1];
        if (!first) return;
        const contRect = container.getBoundingClientRect();
        let rowH = first.getBoundingClientRect().height;
        if (second) {
          rowH = second.getBoundingClientRect().top - first.getBoundingClientRect().top;
        }
        if (rowH <= 0) rowH = 40;
        const targetY = contRect.height / 2 - rowH / 2 - toIndex * rowH;
        const prop = isRight ? rightTrackRef : leftTrackRef;
        if (!prop.current) return;
        if (animate) {
          gsap.to(prop.current, {
            y: targetY,
            duration: (durations.change ?? 0.7) * 0.9,
            ease: "power3.out",
            overwrite: "auto",
          });
        } else {
          gsap.set(prop.current, { y: targetY });
        }
      };

      requestAnimationFrame(() => {
        centerTrack(leftTrackRef.current, leftItemRefs.current, false);
        centerTrack(rightTrackRef.current, rightItemRefs.current, true);
      });
    };

    // ScrollTrigger for pinning + active step detection
    useLayoutEffect(() => {
      if (typeof window === "undefined") return;
      const fixed = fixedRef.current;
      const fs = fixedSectionRef.current;
      if (!fixed || !fs || total === 0) return;

      measureAndCenterLists(activeIndexRef.current, false);

      const st = ScrollTrigger.create({
        trigger: fs,
        start: "top top",
        end: "bottom bottom",
        pin: fixed,
        pinSpacing: true,
        scrub: 0.15,
        onUpdate: (self) => {
          if (motionOff) return;
          const prog = self.progress;
          const target = Math.min(total - 1, Math.max(0, Math.floor(prog * total)));
          if (target !== activeIndexRef.current) {
            activeIndexRef.current = target;
            if (!isControlled) {
              setLocalIndex(target);
            }
            onIndexChange?.(target);
            measureAndCenterLists(target, true);
          }
        },
      });

      stRef.current = st;

      // Ensure ScrollTrigger refreshes accurately after layout and previous sections mount
      const t1 = setTimeout(() => ScrollTrigger.refresh(), 100);
      const t2 = setTimeout(() => ScrollTrigger.refresh(), 500);
      const t3 = setTimeout(() => ScrollTrigger.refresh(), 1200);

      const ro = new ResizeObserver(() => {
        measureAndCenterLists(activeIndexRef.current, false);
        ScrollTrigger.refresh();
      });
      ro.observe(fs);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        ro.disconnect();
        st.kill();
        stRef.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [total, motionOff]);

    // Programmatic navigation
    const goTo = (to: number, withScroll = true) => {
      const clamped = clamp(to, 0, total - 1);
      activeIndexRef.current = clamped;
      if (!isControlled) setLocalIndex(clamped);
      onIndexChange?.(clamped);
      measureAndCenterLists(clamped, true);

      const fs = fixedSectionRef.current;
      if (withScroll && fs && typeof window !== "undefined") {
        const rect = fs.getBoundingClientRect();
        const top = rect.top + window.scrollY;
        const h = fs.offsetHeight;
        const targetScroll = top + (h * clamped) / total;
        window.scrollTo({ top: targetScroll, behavior: "smooth" });
      }
    };

    const next = () => goTo(activeIndex + 1);
    const prev = () => goTo(activeIndex - 1);

    useImperativeHandle(apiRef, () => ({
      next,
      prev,
      goTo,
      getIndex: () => activeIndex,
      refresh: () => ScrollTrigger.refresh(),
    }));

    // Soft entrance for lists at mount
    useEffect(() => {
      measureAndCenterLists(activeIndex, false);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // CSS vars
    const cssVars: CSSProperties = {
      ["--fx-font" as any]: fontFamily,
      ["--fx-text" as any]: colors.text ?? "rgba(245,245,245,0.92)",
      ["--fx-overlay" as any]: colors.overlay ?? "rgba(0,0,0,0.35)",
      ["--fx-page-bg" as any]: colors.pageBg ?? "#fff",
      ["--fx-stage-bg" as any]: colors.stageBg ?? "#000",
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

        <div className="fx-scroll">
          <div className="fx-fixed-section" ref={fixedSectionRef}>
            <div className="fx-fixed" ref={fixedRef}>
              {/* Backgrounds */}
              <div className="fx-bgs" aria-hidden="true">
                {sections.map((s, i) => {
                  const isActive = i === activeIndex;
                  return (
                    <div
                      className="fx-bg"
                      key={s.id ?? i}
                      style={{
                        opacity: isActive ? 1 : 0,
                        transition: "opacity 0.6s ease-in-out",
                      }}
                    >
                      {s.renderBackground ? (
                        s.renderBackground(isActive, i === activeIndex - 1)
                      ) : (
                        <>
                          <img
                            src={s.background}
                            alt=""
                            className="fx-bg-img"
                            style={{
                              opacity: 1,
                              transform: isActive ? "scale(1)" : "scale(1.05)",
                              transition: "transform 0.8s ease-out",
                            }}
                          />
                          <div className="fx-bg-overlay" />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Grid */}
              <div className="fx-grid">
                {/* Header */}
                {header && <div className="fx-header">{header}</div>}

                {/* Content (lists + center) */}
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

                  {/* Center title (Dynamic Word Swap with guaranteed visibility) */}
                  <div className="fx-center">
                    {sections.map((s, sIdx) => {
                      const isActive = sIdx === activeIndex;
                      return (
                        <div
                          key={`C-${s.id ?? sIdx}`}
                          className={`fx-featured ${isActive ? "active" : ""}`}
                          style={{
                            opacity: isActive ? 1 : 0,
                            visibility: isActive ? "visible" : "hidden",
                            transform: isActive
                              ? "translate3d(0, 0, 0) scale(1)"
                              : sIdx < activeIndex
                              ? "translate3d(0, -35%, 0) scale(0.96)"
                              : "translate3d(0, 35%, 0) scale(0.96)",
                            transition:
                              "opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.45s",
                            pointerEvents: isActive ? "auto" : "none",
                          }}
                        >
                          <h3 className="fx-featured-title">
                            <span className="fx-word">{s.title}</span>
                          </h3>
                        </div>
                      );
                    })}
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
                      <div className="fx-progress-bar">
                        <div
                          className="fx-progress-fill"
                          style={{ width: `${((activeIndex + 1) / total) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          .fx {
            width: 100%;
            overflow: hidden;
            background: var(--fx-page-bg);
            color: #000;
            font-family: var(--fx-font);
            text-transform: uppercase;
            letter-spacing: -0.02em;
          }

          .fx-debug {
            position: fixed; bottom: 10px; right: 10px; z-index: 9999;
            background: rgba(255,255,255,0.8); color: #000; padding: 6px 8px; font: 12px/1 monospace; border-radius: 4px;
          }

          .fx-fixed-section { height: ${Math.max(1, total)}00vh; position: relative; }
          .fx-fixed { position: relative; height: 100vh; width: 100%; overflow: hidden; background: var(--fx-page-bg); }

          .fx-grid {
            display: grid;
            grid-template-columns: repeat(12, 1fr);
            gap: var(--fx-gap);
            padding: 0 var(--fx-grid-px);
            position: relative;
            height: 100%;
            z-index: 2;
          }

          .fx-bgs { position: absolute; inset: 0; background: var(--fx-stage-bg); z-index: 1; }
          .fx-bg { position: absolute; inset: 0; }
          .fx-bg-img {
            position: absolute; inset: -10% 0 -10% 0;
            width: 100%; height: 120%; object-fit: cover;
            filter: brightness(0.8);
            will-change: transform, opacity;
          }
          .fx-bg-overlay { position: absolute; inset: 0; background: var(--fx-overlay); }

          .fx-header {
            grid-column: 1 / 13; align-self: start; padding-top: 6vh;
            font-size: clamp(2rem, 9vw, 9rem); line-height: 0.86; text-align: center; color: var(--fx-text);
          }
          .fx-header > * { display: block; }

          .fx-content {
            grid-column: 1 / 13;
            position: absolute; inset: 0;
            display: grid; grid-template-columns: 1fr 1.3fr 1fr;
            align-items: center;
            height: 100%;
            padding: 0 var(--fx-grid-px);
          }

          .fx-left, .fx-right {
            height: 60vh;
            overflow: hidden;
            display: grid; align-content: center;
          }
          .fx-left { justify-items: start; }
          .fx-right { justify-items: end; }
          .fx-track { will-change: transform; }

          .fx-item {
            color: var(--fx-text);
            font-weight: 800;
            letter-spacing: 0em;
            line-height: 1;
            margin: calc(var(--fx-row-gap) / 2) 0;
            opacity: 0.35;
            transition: opacity 0.35s ease, transform 0.35s ease, color 0.35s ease;
            position: relative;
            font-size: clamp(1rem, 2.4vw, 1.8rem);
            user-select: none;
            cursor: pointer;
          }
          .fx-left-item.active, .fx-right-item.active {
            opacity: 1 !important;
            color: #ffffff;
          }
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
            display: grid; place-items: center; text-align: center; height: 60vh; overflow: hidden;
          }
          .fx-featured {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            will-change: transform, opacity;
          }
          .fx-featured-title {
            margin: 0; color: var(--fx-text);
            font-weight: 900; letter-spacing: -0.01em;
            font-size: clamp(2rem, 7.5vw, 6rem);
            line-height: 1.05;
          }
          .fx-word {
            display: inline-block;
            vertical-align: middle;
            color: #ffffff;
            text-shadow: 0 4px 30px rgba(0,0,0,0.5);
          }

          .fx-footer {
            grid-column: 1 / 13; align-self: end; padding-bottom: 5vh; text-align: center;
          }
          .fx-footer-title { color: var(--fx-text); font-size: clamp(1.6rem, 7vw, 7rem); font-weight: 900; letter-spacing: -0.01em; line-height: 0.9; }
          .fx-progress { width: 200px; height: 2px; margin: 1rem auto 0; background: rgba(245,245,245,0.28); position: relative; }
          .fx-progress-fill { position: absolute; inset: 0 auto 0 0; background: #ffffff; height: 100%; transition: width 0.35s ease-out; }
          .fx-progress-numbers { position: absolute; inset: auto 0 100% 0; display: flex; justify-content: space-between; font-size: 0.8rem; color: #ffffff; font-weight: 600; padding-bottom: 4px; }

          @media (max-width: 900px) {
            .fx-content {
              grid-template-columns: 1fr; row-gap: 3vh;
              place-items: center;
            }
            .fx-left, .fx-right, .fx-center { height: auto; }
            .fx-left, .fx-right { justify-items: center; }
            .fx-track { transform: none !important; }
          }
        `}</style>
      </div>
    );
  }
);

FullScreenScrollFX.displayName = "FullScreenScrollFX";
export default FullScreenScrollFX;