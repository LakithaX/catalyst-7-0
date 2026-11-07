import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ============================================================================
// EDIT HERE: navigation, socials, logos
// ============================================================================
const NAV = [
  { label: "Home", to: "/" },
  { label: "About", href: "#about" },
  { label: "Register", to: "/register" },
  { label: "Gallery", to: "/gallery" },
  { label: "Merch", to: "/merch" },
  { label: "Play", to: "/play" },
  { label: "Contact", href: "#contact" },
] as const;

// Replace "#" with your real profile URLs.
const SOCIALS = [
  { name: "Discord", href: "#", icon: "discord" },
  { name: "Instagram", href: "#", icon: "instagram" },
  { name: "YouTube", href: "#", icon: "youtube" },
  { name: "X", href: "#", icon: "x" },
] as const;

const LOGOS = {
  catalyst: encodeURI("/assets/catalyst_7_logo.png"),
  aiesecSliit: encodeURI("/assets/aiesec in sliit - blue.png"),
  aiesec: encodeURI("/assets/Blue-Logo.png"),
};

const SCENE = {
  mist: "/assets/hero-section-assets/atmospheric-mist.webp",
  mountains: "/assets/hero-section-assets/background-mountains.webp",
  foreground: "/assets/hero-section-assets/foreground-landscape.png",
  torii: "/assets/hero-section-assets/torii-gate.webp",
  pagoda: "/assets/hero-section-assets/pagoda.webp",
  branch: "/assets/hero-section-assets/sakura-branch.webp",
};

const INK = "#252321";
const RED = "#C9362B";
const RED_DEEP = "#A3261D";
const DARK = "#1A1816";
const IVORY = "#F8F3E9";
const DISPLAY = "'Zen Antique', 'Shippori Mincho', 'Noto Serif JP', serif";
// Jansina is loaded from /public/fonts via @font-face in index.css; the rest is the fallback if it fails to load.
const JANSINA = "'Jansina', 'Zen Antique', 'Shippori Mincho', 'Noto Serif JP', serif";
const BRUSH = "'Yuji Boku', 'Zen Antique', 'Noto Serif JP', serif";
const BODY = "'Inter', system-ui, -apple-system, sans-serif";

/** Height of the dark ground silhouette. Torii and pagoda are sunk into it so they stand on the ground. */
const GROUND_H = "clamp(48px, 6vw, 96px)";

const SEIGAIHA =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='20' viewBox='0 0 40 20'%3E%3Cg fill='none' stroke='%23C9362B' stroke-width='1.4'%3E%3Ccircle cx='20' cy='20' r='18'/%3E%3Ccircle cx='20' cy='20' r='12'/%3E%3Ccircle cx='20' cy='20' r='6'/%3E%3Ccircle cx='0' cy='10' r='18'/%3E%3Ccircle cx='0' cy='10' r='12'/%3E%3Ccircle cx='0' cy='10' r='6'/%3E%3Ccircle cx='40' cy='10' r='18'/%3E%3Ccircle cx='40' cy='10' r='12'/%3E%3Ccircle cx='40' cy='10' r='6'/%3E%3C/g%3E%3C/svg%3E\")";

// ── Small helpers ───────────────────────────────────────────────────────────
/** Image that removes itself if the file is missing (so no broken-image icons). */
const Img = ({ src, alt = "", className = "", style }: { src: string; alt?: string; className?: string; style?: React.CSSProperties }) => {
  const [bad, setBad] = useState(false);
  if (bad) return null;
  return <img src={src} alt={alt} loading="lazy" decoding="async" draggable={false} onError={() => setBad(true)} className={className} style={style} />;
};

const Icon = ({ name }: { name: (typeof SOCIALS)[number]["icon"] }) => {
  const common = { width: 20, height: 20, viewBox: "0 0 24 24", "aria-hidden": true } as const;
  if (name === "instagram")
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.3" cy="6.7" r="0.6" fill="currentColor" />
      </svg>
    );
  if (name === "youtube")
    return (
      <svg {...common} fill="currentColor">
        <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3L10 15z" />
      </svg>
    );
  if (name === "x")
    return (
      <svg {...common} fill="currentColor">
        <path d="M4 4l7.5 10.2L4.2 20h1.8l6.3-5.6L17 20h3.5l-7.9-10.7L19.5 4h-1.8l-5.7 5.2L8 4H4z" />
      </svg>
    );
  return (
    <svg {...common} fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
};

const Sakura = ({ size = 22 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill={RED} aria-hidden="true">
    <path d="M12 2 C13.5 5 15.5 6 18.5 4.5 C17.5 7.5 18 9.5 21 10.5 C18.5 12 17.5 14 19 17 C16 16.5 14 17.5 13 20.5 C12 18 10 17 7 18.5 C8 15.5 7.5 13.5 4.5 12.5 C7 11 8 9 6.5 6 C9.5 6.5 11.5 5.5 12 2 Z" />
    <circle cx="12" cy="12" r="2.2" fill="#E9B9A5" />
  </svg>
);

/** Thin red rule with a sakura in the middle */
const SakuraRule = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-4 ${className}`} aria-hidden="true">
    <span className="h-[2px] flex-1" style={{ background: "linear-gradient(90deg, transparent, #B51E23)" }} />
    <Sakura size={24} />
    <span className="h-[2px] flex-1" style={{ background: "linear-gradient(270deg, transparent, #B51E23)" }} />
  </div>
);

/** Deterministic random */
function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Rolling hill ridge (smooth curves). */
const HILLS = "M0 120 L0 84 C140 60 280 98 430 80 S720 56 900 82 S1240 98 1440 72 L1440 120 Z";

/** Row of tiered pine trees standing on `base`. */
function pines(seed: number, base: number, minH: number, maxH: number, gap: number) {
  const r = rng(seed);
  let d = "";
  for (let x = 10; x < 1440; x += gap * (0.8 + r() * 0.9)) {
    const h = minH + r() * (maxH - minH);
    const w = h * 0.5;
    const tier = (apexY: number, halfW: number, baseY: number) => `M${x.toFixed(1)} ${apexY.toFixed(1)} L${(x - halfW).toFixed(1)} ${baseY.toFixed(1)} L${(x + halfW).toFixed(1)} ${baseY.toFixed(1)} Z `;
    d += tier(base - h, w * 0.34, base - h * 0.5);
    d += tier(base - h * 0.82, w * 0.44, base - h * 0.24);
    d += tier(base - h * 0.52, w * 0.52, base);
  }
  return d;
}

const PETAL_X = [8, 22, 38, 56, 72, 88];

export default function OutroFooter({ active = false }: { active?: boolean }) {
  const rootRef = useRef<HTMLElement>(null);
  const backTrees = useMemo(() => pines(7, 92, 20, 40, 44), []);
  const frontTrees = useMemo(() => pines(21, 112, 14, 28, 34), []);
  const year = new Date().getFullYear();

  useEffect(() => {
    const root = rootRef.current;
    if (!active || !root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const idle: gsap.core.Tween[] = [];
      const st = (trigger: Element | string, start = "top 88%") => ({ trigger, start, once: true, refreshPriority: -1 });
      const sceneEl = root.querySelector("[data-g=scene]") as HTMLElement;

      idle.push(gsap.to("[data-g=fband]", { x: 40, duration: 3.2, ease: "none", repeat: -1 }));

      gsap.from("[data-g=cta] > *", { y: 26, opacity: 0, duration: 0.7, ease: "power3.out", stagger: 0.1, scrollTrigger: st("[data-g=cta]", "top 90%") });
      gsap.from("[data-g=col]", { y: 24, opacity: 0, duration: 0.7, ease: "power3.out", stagger: 0.12, scrollTrigger: st("[data-g=cols]", "top 90%") });
      gsap.from("[data-g=navlink]", { y: 12, opacity: 0, duration: 0.45, ease: "power2.out", stagger: 0.05, delay: 0.2, scrollTrigger: st("[data-g=cols]", "top 90%") });
      gsap.from("[data-g=social]", { scale: 0.6, opacity: 0, duration: 0.5, ease: "back.out(2)", stagger: 0.08, delay: 0.35, scrollTrigger: st("[data-g=cols]", "top 90%") });

      gsap
        .timeline({ scrollTrigger: st(sceneEl, "top 92%") })
        .from("[data-g=branch]", { x: -60, opacity: 0, duration: 1, ease: "power3.out" })
        .from("[data-g=torii]", { y: 40, opacity: 0, duration: 0.9, ease: "power3.out" }, "-=0.7")
        .from("[data-g=pagoda]", { y: 60, opacity: 0, duration: 1, ease: "power3.out" }, "-=0.8");

      const scrub = { trigger: sceneEl, start: "top bottom", end: "bottom bottom", scrub: true, refreshPriority: -1 };
      gsap.fromTo("[data-g=mountains]", { y: 22 }, { y: -6, ease: "none", scrollTrigger: scrub });
      idle.push(gsap.to("[data-g=mist]", { x: 36, duration: 14, ease: "sine.inOut", yoyo: true, repeat: -1 }));
      idle.push(gsap.to("[data-g=branch-sway]", { rotation: 1.2, transformOrigin: "0% 0%", duration: 4, ease: "sine.inOut", yoyo: true, repeat: -1 }));

      gsap.set("[data-petal]", { opacity: 0.8 });
      gsap.utils.toArray<HTMLElement>("[data-petal]").forEach((el, i) => {
        idle.push(
          gsap.fromTo(el, { y: -20, x: 0, rotation: 0 }, { y: () => sceneEl.offsetHeight, x: i % 2 ? 44 : -44, rotation: i % 2 ? 320 : -320, duration: 10 + (i % 4) * 2.4, ease: "none", repeat: -1, delay: -(i * 1.7), invalidateOnRefresh: true })
        );
      });

      gsap.from("[data-g=credits] > *", { y: 12, opacity: 0, duration: 0.6, ease: "power2.out", stagger: 0.1, scrollTrigger: st("[data-g=credits]", "top 100%") });

      ScrollTrigger.create({ trigger: root, start: "top bottom", end: "bottom top", refreshPriority: -1, onToggle: (self) => idle.forEach((t) => (self.isActive ? t.play() : t.pause())) });
    }, root);

    return () => ctx.revert();
  }, [active]);

  const wrap = "mx-auto w-full max-w-[84rem] px-5 sm:px-8";
  const colTitle: React.CSSProperties = { fontFamily: BRUSH, fontSize: 18, letterSpacing: "0.14em", color: RED_DEEP, margin: 0 };
  const navLink: React.CSSProperties = { fontFamily: JANSINA, fontSize: 21, letterSpacing: "0.06em", textTransform: "uppercase", color: INK };

  return (
    <footer ref={rootRef} id="contact" className="relative w-full overflow-hidden" style={{ background: IVORY, color: INK, fontFamily: BODY }}>
      {/* Seigaiha wave band */}
      <div data-g="fband" aria-hidden="true" className="absolute -inset-x-10 top-0 h-5" style={{ backgroundImage: SEIGAIHA, backgroundRepeat: "repeat-x", backgroundSize: "40px 20px" }} />

      <div className={`relative z-10 pb-12 pt-20 sm:pt-24 ${wrap}`}>
        {/* ── Closing call to action ─────────────────────────────────────── */}
        <div data-g="cta" className="flex flex-col items-center text-center">
          <p style={{ margin: 0, fontFamily: BRUSH, fontSize: 20, letterSpacing: "0.3em", color: RED_DEEP }}>武士道</p>
          <h2
            style={{
              margin: "10px 0 0",
              fontFamily: JANSINA,
              fontWeight: 400,
              fontSize: "clamp(2.4rem, 7vw, 5.2rem)",
              lineHeight: 1.05,
              letterSpacing: "0.03em",
              textTransform: "uppercase",
              color: INK,
            }}
          >
            Dare beyond definition
          </h2>
          <p style={{ margin: "14px 0 0", maxWidth: 520, fontSize: 16, lineHeight: 1.6, color: "#4A453F" }}>
            Catalyst 7.0 is a samurai&rsquo;s journey of leadership and growth. Take your first step with us.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/register"
              className="inline-flex min-h-[48px] items-center rounded-full px-8 text-[13px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_10px_24px_-10px_rgba(201,54,43,0.9)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#B51E23]"
              style={{ background: RED }}
            >
              Register now
            </Link>
            <Link
              to="/merch"
              className="inline-flex min-h-[48px] items-center rounded-full border-[1.5px] px-8 text-[13px] font-bold uppercase tracking-[0.18em] transition-colors duration-200 hover:bg-[#252321] hover:text-[#F8F3E9]"
              style={{ borderColor: INK, color: INK }}
            >
              Shop merch
            </Link>
          </div>
        </div>

        <SakuraRule className="mx-auto my-12 max-w-3xl sm:my-14" />

        {/* ── Three tidy columns: brand · explore · connect ─────────────── */}
        <div data-g="cols" className="grid gap-10 text-center md:grid-cols-[1.15fr_1.2fr_1fr] md:gap-0 md:text-left">
          {/* Brand */}
          <div data-g="col" className="flex flex-col items-center md:items-start md:pr-10">
            <Link to="/" aria-label="Catalyst 7.0 home">
              <Img src={LOGOS.catalyst} alt="Catalyst 7.0" className="h-auto w-[170px] object-contain sm:w-[200px]" />
            </Link>
            <p style={{ margin: "14px 0 0", maxWidth: 300, fontSize: 15, lineHeight: 1.65, color: "#4A453F" }}>
              The Samurai&rsquo;s Journey, presented by AIESEC in SLIIT.
            </p>
          </div>

          {/* Explore */}
          <nav data-g="col" aria-label="Footer" className="md:border-x md:px-10" style={{ borderColor: "rgba(201,54,43,0.45)" }}>
            <h3 style={colTitle}>探索 · Explore</h3>
            <ul className="mx-auto mt-3 grid max-w-xs grid-cols-2 gap-x-6 md:mx-0">
              {NAV.map((n) => (
                <li key={n.label} data-g="navlink">
                  {"to" in n ? (
                    <Link to={n.to} className="inline-flex min-h-[44px] items-center transition-colors hover:text-[#C9362B]" style={navLink}>{n.label}</Link>
                  ) : (
                    <a href={n.href} className="inline-flex min-h-[44px] items-center transition-colors hover:text-[#C9362B]" style={navLink}>{n.label}</a>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Connect + organisers */}
          <div data-g="col" className="flex flex-col items-center md:items-start md:pl-10">
            <h3 style={colTitle}>繋がる · Connect</h3>
            <ul className="mt-4 flex items-center gap-2.5" aria-label="Social media">
              {SOCIALS.map((s) => (
                <li key={s.name} data-g="social">
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.name}
                    className="grid h-11 w-11 place-items-center rounded-full border-[1.5px] transition-colors duration-200 hover:bg-[#C9362B] hover:text-white"
                    style={{ borderColor: RED, color: INK }}
                  >
                    <Icon name={s.icon} />
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-7 flex items-center gap-4">
              <span style={{ fontFamily: BRUSH, fontSize: 17, letterSpacing: "0.12em", color: RED_DEEP }}>主催</span>
              <Img src={LOGOS.aiesecSliit} alt="AIESEC in SLIIT" className="h-9 w-auto object-contain" />
              <span className="h-6 w-px bg-[#C9362B]/60" aria-hidden="true" />
              <Img src={LOGOS.aiesec} alt="AIESEC" className="h-7 w-auto object-contain" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Landscape: everything stands on the ground ───────────────────── */}
      <div data-g="scene" aria-hidden="true" className="pointer-events-none relative w-full overflow-hidden" style={{ height: "clamp(230px, 22vw, 400px)" }}>
        <div
          className="absolute inset-0"
          style={{ WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 50%)", maskImage: "linear-gradient(to bottom, transparent 0%, #000 50%)" }}
        >
          <div data-g="mountains" className="absolute inset-x-0 -top-8 bottom-0">
            <Img src={SCENE.mountains} className="h-full w-full object-cover" style={{ objectPosition: "50% 78%" }} />
          </div>
          <div data-g="mist" className="absolute -left-[6%] bottom-[20%] w-[112%] opacity-55">
            <Img src={SCENE.mist} className="h-auto w-full" />
          </div>
          <Img src={SCENE.foreground} className="absolute inset-x-0 bottom-0 h-auto w-full" />
        </div>

        {/* Blossom branch hangs from the top-left, well clear of the torii */}
        <div data-g="branch" className="absolute left-0 top-0 w-[clamp(120px,15vw,250px)]">
          <div data-g="branch-sway"><Img src={SCENE.branch} className="h-auto w-full" /></div>
        </div>

        {/* Torii and pagoda: bases sit behind the ground silhouette */}
        <div data-g="torii" className="absolute left-[24%] w-[clamp(40px,5vw,84px)]" style={{ bottom: `calc(${GROUND_H} * 0.55)` }}>
          <Img src={SCENE.torii} className="h-auto w-full" />
        </div>
        <div data-g="pagoda" className="absolute right-[8%] w-[clamp(52px,6.6vw,116px)]" style={{ bottom: `calc(${GROUND_H} * 0.5)` }}>
          <Img src={SCENE.pagoda} className="h-auto w-full" />
        </div>

        <div className="absolute inset-0 hidden motion-reduce:hidden sm:block">
          {PETAL_X.map((left, i) => (
            <span key={i} data-petal="1" className="absolute top-0 opacity-0" style={{ left: `${left}%` }}>
              <svg viewBox="0 0 24 32" width="11" height="15"><path d="M12 2 C16 7, 22 13, 21 21 C20 27, 15 30, 12 28 C9 30, 4 27, 3 21 C2 13, 8 7, 12 2 Z" fill={RED} /></svg>
            </span>
          ))}
        </div>

        {/* Ground (drawn last so it covers the feet of the torii and pagoda) */}
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 block w-full" style={{ height: GROUND_H }}>
          <path d={HILLS} fill="#2A2622" />
          <path d={backTrees} fill="#2A2622" />
          <path d="M0 108 H1440 V120 H0 Z" fill={DARK} />
          <path d={frontTrees} fill={DARK} />
        </svg>
      </div>

      {/* Credits */}
      <div style={{ background: DARK }}>
        <div data-g="credits" className={`flex flex-col items-center justify-between gap-1 pb-7 pt-2 text-center sm:flex-row sm:text-left ${wrap}`}>
          <p style={{ margin: 0, fontSize: 14, color: "#E6DCC8", letterSpacing: "0.04em" }}>© {year} Catalyst 7.0 · AIESEC in SLIIT. All rights reserved.</p>
          <p style={{ margin: 0, fontFamily: BRUSH, fontSize: 18, color: "#E9B9A5", letterSpacing: "0.14em" }}>共に、先へ</p>
        </div>
      </div>
    </footer>
  );
}