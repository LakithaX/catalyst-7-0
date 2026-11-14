import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ============================================================================
// EDIT YOUR PARTNERS HERE. Add a logo path (e.g. "/assets/partners/acme.png")
// and an optional url. Without a logo, the name is shown in the brand typeface.
// ============================================================================
interface Partner {
  name: string;
  logo?: string;
  url?: string;
}

interface PartnershipContent {
  title: string;
  intro: string;
  presenting: Partner & { blurb: string };
  partners: Partner[];
  cta_label: string;
  cta_url: string;
}

const DEFAULT_CONTENT: PartnershipContent = {
  title: "PARTNERSHIP ANNOUNCEMENT",
  intro: "The organisations walking with us towards Catalyst 7.0.",
  presenting: {
    name: "TO BE ANNOUNCED",
    blurb: "Our presenting partner stands beside Catalyst 7.0 from the first day to the last. Their name will be revealed soon.",
  },
  partners: [],
  cta_label: "Become a partner",
  cta_url: "#contact",
};

// Illustrations from /public/assets/illustrations
const ART = {
  mask: "/assets/illustrations/alessandro_hrdz-mask-6976331.png",
  fan: "/assets/illustrations/jakeloris-fan-7039967.webp",
  torii: "/assets/hero-section-assets/torii-gate.webp",
  koi: "/assets/illustrations/kacsoeszti-koi-1184783_1920.png",
};

const INK = "#252321";
const RED = "#C9362B";
const RED_DARK = "#B51E23";
const HEAD = "var(--font-display)";
// Fonts come from the CSS variables in index.css (:root).
const DISPLAY = "var(--font-display)";
const BRUSH = "var(--font-accent)";
const LABEL = "var(--font-label)";
const BODY = "var(--font-body)";

const SEIGAIHA =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='20' viewBox='0 0 40 20'%3E%3Cg fill='none' stroke='%23C9362B' stroke-width='1.4'%3E%3Ccircle cx='20' cy='20' r='18'/%3E%3Ccircle cx='20' cy='20' r='12'/%3E%3Ccircle cx='20' cy='20' r='6'/%3E%3Ccircle cx='0' cy='10' r='18'/%3E%3Ccircle cx='0' cy='10' r='12'/%3E%3Ccircle cx='0' cy='10' r='6'/%3E%3Ccircle cx='40' cy='10' r='18'/%3E%3Ccircle cx='40' cy='10' r='12'/%3E%3Ccircle cx='40' cy='10' r='6'/%3E%3C/g%3E%3C/svg%3E\")";

const PETALS = [4, 13, 24, 37, 52, 66, 78, 91];

const Hanko = ({ char, size = 36 }: { char: string; size?: number }) => (
  <span
    aria-hidden="true"
    className="grid shrink-0 place-items-center rounded-[4px] text-white"
    style={{ width: size, height: size, background: RED, fontSize: size * 0.56, fontFamily: BRUSH }}
  >
    {char}
  </span>
);

/** Illustration wrapper: outer = scroll parallax, inner = gentle idle sway. Hides itself if the file is missing. */
const Illus = ({ src, className = "", speed = 30 }: { src: string; className?: string; speed?: number }) => {
  const [bad, setBad] = useState(false);
  if (bad) return null;
  return (
    <div data-parallax={speed} className={`pointer-events-none select-none ${className}`} aria-hidden="true">
      <div data-sway="1">
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
          onError={() => setBad(true)}
          className="h-auto w-full object-contain"
          style={{ mixBlendMode: "multiply" }}
        />
      </div>
    </div>
  );
};

const PartnerMark = ({ partner, large = false }: { partner: Partner; large?: boolean }) =>
  partner.logo ? (
    <img src={partner.logo} alt={partner.name} loading="lazy" decoding="async" className="max-h-full max-w-full object-contain" />
  ) : (
    <span
      className="px-3 text-center leading-tight"
      style={{
        fontFamily: large ? DISPLAY : HEAD,
        fontWeight: 700,
        fontSize: large ? "clamp(1.8rem, 3.6vw, 2.6rem)" : "1rem",
        letterSpacing: large ? "0.04em" : "0.06em",
        color: INK,
      }}
    >
      {partner.name}
    </span>
  );

const Slot = ({ partner }: { partner: Partner }) => {
  const inner = (
    <div
      className="flex aspect-[3/2] w-full items-center justify-center rounded-xl bg-white p-4 transition-transform duration-300 group-hover:-translate-y-1 motion-reduce:transition-none"
      style={{ border: `2px solid ${INK}`, boxShadow: "4px 4px 0 rgba(37,35,33,0.85)" }}
    >
      <PartnerMark partner={partner} />
    </div>
  );
  return partner.url ? (
    <a href={partner.url} target="_blank" rel="noopener noreferrer" aria-label={partner.name} className="group block min-h-[44px]">
      {inner}
    </a>
  ) : (
    <div className="group">{inner}</div>
  );
};

const TierHeading = ({ kanji, en }: { kanji: string; en: string }) => (
  <div data-g="tier" className="mb-5 flex items-center gap-3">
    <Hanko char={kanji} size={30} />
    <h3 style={{ fontFamily: LABEL, fontWeight: 700, fontSize: 14, letterSpacing: "0.18em", textTransform: "uppercase", margin: 0 }}>{en}</h3>
    <span className="h-px flex-1 bg-[#252321]/30" aria-hidden="true" />
  </div>
);

export default function PartnershipAnnouncement({ active = false }: { active?: boolean }) {
  const rootRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const [content, setContent] = useState(DEFAULT_CONTENT);

  useEffect(() => {
    let cancelled = false;
    if (!supabase) return;
    void supabase.from("partnership_settings")
      .select("content")
      .eq("id", true)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.warn("[PartnershipAnnouncement] Could not load published content.", error.message);
          return;
        }
        if (data?.content) {
          const saved = data.content as Partial<PartnershipContent>;
          setContent({
            title: saved.title ?? DEFAULT_CONTENT.title,
            intro: saved.intro ?? DEFAULT_CONTENT.intro,
            presenting: { ...DEFAULT_CONTENT.presenting, ...saved.presenting },
            partners: Array.isArray(saved.partners) ? saved.partners : DEFAULT_CONTENT.partners,
            cta_label: saved.cta_label ?? DEFAULT_CONTENT.cta_label,
            cta_url: saved.cta_url ?? DEFAULT_CONTENT.cta_url,
          });
        }
      });
    return () => { cancelled = true; };
  }, []);

  // GSAP: only created once HomePage is locked to the hero, with refreshPriority -1.
  useEffect(() => {
    const root = rootRef.current;
    if (!active || !root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const st = (trigger: Element | string, start = "top 80%") => ({ trigger, start, once: true, refreshPriority: -1 });
      const idle: gsap.core.Tween[] = [];

      // Flowing wave band (translates exactly one tile, so it loops seamlessly)
      idle.push(gsap.to("[data-g=band]", { x: 40, duration: 3.2, ease: "none", repeat: -1 }));

      // Header
      gsap.from("[data-g=head] > *:not(svg)", { y: 26, opacity: 0, duration: 0.7, ease: "power3.out", stagger: 0.12, scrollTrigger: st("[data-g=head]", "top 82%") });
      gsap.from("[data-g=head] svg", { scaleX: 0, transformOrigin: "0% 50%", duration: 0.9, ease: "power2.out", delay: 0.35, scrollTrigger: st("[data-g=head]", "top 82%") });

      // Presenting card: slides in, red strip unrolls, hanko stamps down
      const card = gsap.timeline({ scrollTrigger: st("[data-g=card]", "top 80%") });
      card
        .from("[data-g=card]", { x: -70, opacity: 0, duration: 0.8, ease: "power3.out" })
        .from("[data-g=strip]", { scaleY: 0, transformOrigin: "50% 0%", duration: 0.6, ease: "power2.out" }, "-=0.4")
        .from("[data-g=cardbody] > *", { y: 18, opacity: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }, "-=0.3")
        .from("[data-g=stamp]", { scale: 2.4, rotation: -20, opacity: 0, duration: 0.45, ease: "back.out(2.2)" }, "-=0.1");

      // Tiers
      gsap.utils.toArray<HTMLElement>("[data-g=tier]").forEach((el) =>
        gsap.from(el, { x: -34, opacity: 0, duration: 0.6, ease: "power3.out", scrollTrigger: st(el, "top 88%") })
      );
      gsap.utils.toArray<HTMLElement>("[data-g=slots]").forEach((grid) =>
        gsap.from(grid.children, { y: 40, opacity: 0, scale: 0.94, duration: 0.6, ease: "power3.out", stagger: 0.09, scrollTrigger: st(grid, "top 88%") })
      );

      // CTA
      gsap.from("[data-g=cta] > *", { y: 24, opacity: 0, duration: 0.6, ease: "power3.out", stagger: 0.1, scrollTrigger: st("[data-g=cta]", "top 90%") });

      // Illustrations: scroll parallax (outer) + idle sway (inner)
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        const speed = Number(el.dataset.parallax) || 30;
        gsap.fromTo(el, { y: speed }, { y: -speed, ease: "none", scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: true, refreshPriority: -1 } });
      });
      gsap.utils.toArray<HTMLElement>("[data-sway]").forEach((el, i) =>
        idle.push(gsap.to(el, { rotation: i % 2 ? -3 : 3, y: 10, duration: 3.4 + i * 0.4, ease: "sine.inOut", yoyo: true, repeat: -1 }))
      );

      // Sakura petals drifting down the whole section (behind content)
      gsap.utils.toArray<HTMLElement>("[data-petal]").forEach((el, i) => {
        const dur = 11 + (i % 4) * 2.5;
        idle.push(
          gsap.fromTo(
            el,
            { y: -30, x: 0, rotation: 0 },
            { y: () => root.offsetHeight + 30, x: i % 2 ? 70 : -70, rotation: i % 2 ? 360 : -360, duration: dur, ease: "none", repeat: -1, delay: -(i * 1.7), invalidateOnRefresh: true }
          )
        );
      });

      // Pause all idle motion while the section is off-screen
      ScrollTrigger.create({
        trigger: root,
        start: "top bottom",
        end: "bottom top",
        refreshPriority: -1,
        onToggle: (self) => idle.forEach((t) => (self.isActive ? t.play() : t.pause())),
      });
    }, root);

    return () => ctx.revert();
  }, [active]);

  return (
    <section
      ref={rootRef}
      id="partners"
      aria-labelledby="partners-title"
      className="relative w-full overflow-hidden px-4 pb-16 pt-16 sm:px-8 sm:pb-24 sm:pt-24"
      style={{ background: "linear-gradient(180deg, #F3ECE0 0%, #F8F3E9 40%, #F8F3E9 100%)", color: INK, fontFamily: BODY }}
    >
      {/* Wave band (flows sideways) */}
      <div data-g="band" aria-hidden="true" className="absolute -inset-x-10 top-0 h-5" style={{ backgroundImage: SEIGAIHA, backgroundRepeat: "repeat-x", backgroundSize: "40px 20px" }} />

      {/* Petals, behind content */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 hidden sm:block">
        {PETALS.map((left, i) => (
          <span key={i} data-petal="1" className="absolute top-0" style={{ left: `${left}%` }}>
            <svg viewBox="0 0 24 32" width="13" height="17"><path d="M12 2 C16 7, 22 13, 21 21 C20 27, 15 30, 12 28 C9 30, 4 27, 3 21 C2 13, 8 7, 12 2 Z" fill={RED} opacity="0.8" /></svg>
          </span>
        ))}
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        {/* Header, flanked by illustrations on desktop */}
        <div className="mb-10 grid items-center gap-4 sm:mb-14 lg:grid-cols-[1fr_auto_1fr]">
          <div className="hidden justify-end lg:flex"><Illus src={ART.mask} speed={22} className="w-[150px] xl:w-[180px]" /></div>

          <header data-g="head" className="flex flex-col items-center text-center">
            <div className="mb-3 flex items-center gap-3">
              <Hanko char="縁" />
              <span style={{ fontFamily: BRUSH, fontSize: 20, letterSpacing: "0.16em" }}>第五章</span>
            </div>
            <h2
              id="partners-title"
              style={{
                fontFamily: DISPLAY,
                fontWeight: 700,
                fontSize: "clamp(2.1rem, 6.2vw, 4rem)",
                letterSpacing: "0.03em",
                lineHeight: 1.05,
                margin: 0,
              }}
            >
              {content.title}
            </h2>
            <svg viewBox="0 0 420 28" fill="none" aria-hidden="true" className="mt-1 h-4 w-48 sm:w-64">
              <path d="M6 16 C45 10, 95 8, 150 9 C220 10, 290 8, 350 12 C385 14, 405 16, 416 13 C405 20, 370 21, 320 20 C240 18, 160 21, 90 20 C50 19, 20 20, 6 16 Z" fill={RED} />
            </svg>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: "#3D3833", marginTop: 10, maxWidth: "46ch" }}>
              <span style={{ fontFamily: BRUSH, fontSize: 20, color: RED_DARK, marginRight: 8 }}>共に歩む</span>
              {content.intro}
            </p>
          </header>

          <div className="hidden justify-start lg:flex"><Illus src={ART.fan} speed={26} className="w-[170px] xl:w-[210px]" /></div>
        </div>

        {/* Presenting partner */}
        <article
          data-g="card"
          aria-label="Presenting partner"
          className="relative mb-12 flex rounded-2xl bg-white sm:mb-14"
          style={{ border: `2px solid ${INK}`, boxShadow: `7px 7px 0 ${INK}` }}
        >
          <div data-g="strip" aria-hidden="true" className="flex w-12 shrink-0 items-center justify-center rounded-l-[14px] sm:w-16" style={{ background: RED, color: "#fff", borderRight: `2px solid ${INK}` }}>
            <span style={{ writingMode: "vertical-rl", fontFamily: BRUSH, fontSize: 22, letterSpacing: "0.3em" }}>提携発表</span>
          </div>
          <div className="grid min-w-0 flex-1 items-center gap-6 p-5 sm:p-8 md:grid-cols-2">
            <div data-g="cardbody-mark" className="flex min-h-[140px] items-center justify-center rounded-xl p-4" style={{ background: "#E6D9C0", border: `2px solid ${INK}` }}>
              <PartnerMark partner={content.presenting} large />
            </div>
            <div data-g="cardbody">
              <p style={{ fontFamily: LABEL, fontWeight: 700, fontSize: 13, letterSpacing: "0.18em", color: RED_DARK, margin: 0 }}>PRESENTING PARTNER</p>
              <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: "clamp(1.7rem, 3.2vw, 2.3rem)", letterSpacing: "0.03em", lineHeight: 1.1, margin: "6px 0 0" }}>{content.presenting.name}</h3>
              <p style={{ fontSize: 16, lineHeight: 1.65, color: "#3D3833", marginTop: 10 }}>{content.presenting.blurb}</p>
            </div>
          </div>
          <span data-g="stamp" aria-hidden="true" className="absolute -right-2 -top-4 sm:-right-4" style={{ transform: "rotate(8deg)" }}>
            <Hanko char="決" size={52} />
          </span>
        </article>

        {/* Tiers */}
        <div className="mb-14">
          <TierHeading kanji="協" en="Current Partners" />
          <div data-g="slots" className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {content.partners.length
              ? content.partners.map((partner, index) => <Slot key={`partner-${index}-${partner.name}`} partner={partner} />)
              : <p className="col-span-full text-center text-sm text-[#75665C]">Partner announcements are coming soon.</p>}
          </div>
        </div>

        {/* CTA with illustrations */}
        <div className="grid items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
          <div className="hidden justify-end lg:flex"><Illus src={ART.torii} speed={20} className="w-[180px] lg:w-[215px] xl:w-[260px]" /></div>

          <div data-g="cta" className="flex flex-col items-center text-center">
            <div className="mb-4 flex items-center gap-4" aria-hidden="true">
              <span className="h-px w-12 bg-[#252321]/30 sm:w-20" />
              <Hanko char="結" size={34} />
              <span className="h-px w-12 bg-[#252321]/30 sm:w-20" />
            </div>
            <p style={{ fontSize: 16, color: "#3D3833", marginBottom: 16, maxWidth: "34ch" }}>Want your name on this list? Let’s build Catalyst 7.0 together.</p>
            <button
              type="button"
              onClick={() => navigate("/partnership")}
              className="inline-flex min-h-[48px] cursor-pointer items-center justify-center whitespace-nowrap rounded-full px-9 text-sm font-bold uppercase tracking-[0.16em] text-white transition-transform duration-300 hover:-translate-y-0.5"
              style={{ background: RED_DARK, fontFamily: LABEL, boxShadow: "0 4px 14px rgba(181,30,35,0.30)" }}
            >
              {content.cta_label}
            </button>
          </div>

          <div className="order-first flex justify-center lg:order-none lg:justify-start"><Illus src={ART.koi} speed={18} className="w-[130px] lg:w-[190px] xl:w-[230px]" /></div>
        </div>
      </div>

    </section>
  );
}