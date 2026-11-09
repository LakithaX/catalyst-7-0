"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { MerchProduct } from "../../data/merchProducts";
import { useCatalog } from "../../context/CatalogContext";
import { useMerch } from "../../context/MerchContext";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}


const INK = "#252321";
const RED = "#C9362B";
const RED_DARK = "#B51E23";
const BORDER = "#E5DDD0";

const HEAD = "'Shippori Mincho', 'Noto Serif JP', serif";
const LABEL = "'Noto Sans JP', 'Montserrat', sans-serif";
const BODY = "'Inter', system-ui, -apple-system, sans-serif";
// Jansina is loaded from /public/fonts via @font-face in index.css. Used for big headings only (it gets hard to read when small).
const JANSINA = "'Jansina', 'Zen Antique', 'Shippori Mincho', 'Noto Serif JP', serif";
const BRUSH = "'Yuji Boku', 'Zen Antique', 'Noto Serif JP', serif";

const Chevron = ({ dir }: { dir: "l" | "r" }) => (
  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d={dir === "l" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
  </svg>
);

const BagIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12l1 13H5L6 7z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 7V6a3 3 0 016 0v1" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

export interface CarouselItem {
  tag?: string;
  titleLine1: string;
  titleLine2?: string;
  desc?: string;
  img: string;
  ctaText?: string;
  ctaUrl?: string;
  productId?: string;
}

export interface CoverFlowCarouselProps {
  items?: CarouselItem[];
  sectionLabel?: string;
  chapterLabel?: string;
  /** Kept for compatibility with HomePage. The carousel no longer pins or traps page scroll. */
  active?: boolean;
  autoplay?: boolean;
  autoplayDelay?: number;
  className?: string;
  onCtaClick?: (item: CarouselItem) => void;
}

export const defaultMerchItems: CarouselItem[] = [
  { tag: "#OfficialMerch", titleLine1: "DELEGATE TEE", titleLine2: "– OBSIDIAN BLACK", desc: "Signature heavyweight cotton tee featuring the Catalyst 7.0 crest and Japanese calligraphy", img: "/assets/catalyst-merch/del-black-front.webp", ctaText: "Add to Cart", ctaUrl: "/merch/delegate-tee-black", productId: "delegate-tee-black" },
  { tag: "#SignatureDrop", titleLine1: "DELEGATE TEE", titleLine2: "– BUSHIDO BACK", desc: "Detailed back-print artwork capturing the spirit of purpose, honour and connection", img: "/assets/catalyst-merch/del-black-back.webp", ctaText: "Add to Cart", ctaUrl: "/merch/delegate-tee-black", productId: "delegate-tee-black" },
  { tag: "#Streetwear", titleLine1: "BUCKET HAT", titleLine2: "– TOKYO EDITION", desc: "Structured all-weather canvas bucket hat with high-density embroidered insignia", img: "/assets/catalyst-merch/del-bucket-hat.webp", ctaText: "Add to Cart", ctaUrl: "/merch/bucket-hat-tokyo", productId: "bucket-hat-tokyo" },
  { tag: "#LimitedEdition", titleLine1: "DELEGATE TEE", titleLine2: "– PURE IVORY", desc: "Minimalist off-white premium silhouette with understated chest seal embroidery", img: "/assets/catalyst-merch/del-white-front.webp", ctaText: "Add to Cart", ctaUrl: "/merch/delegate-tee-white", productId: "delegate-tee-white" },
  { tag: "#CollectorPack", titleLine1: "STICKER PACK", titleLine2: "– BUSHIDO SET", desc: "Matte waterproof vinyl decals crafted with authentic Japanese ukiyo-e motifs", img: "/assets/catalyst-merch/stickers-pack-1.webp", ctaText: "Add to Cart", ctaUrl: "/merch/stickers-bushido", productId: "stickers-bushido" },
  { tag: "#CollectorPack", titleLine1: "STICKER PACK", titleLine2: "– SHINOBI SET", desc: "Custom die-cut metallic & matte sticker sheets designed for laptops and gear", img: "/assets/catalyst-merch/stickers-pack-2.webp", ctaText: "Add to Cart", ctaUrl: "/merch/stickers-shinobi", productId: "stickers-shinobi" },
  { tag: "#Accessory", titleLine1: "WRISTBAND", titleLine2: "– SANDSTONE BEIGE", desc: "High-density jacquard woven seminar band with antique gold locking slider", img: "/assets/catalyst-merch/wristband-beige.webp", ctaText: "Add to Cart", ctaUrl: "/merch/wristband-beige", productId: "wristband-beige" },
  { tag: "#Accessory", titleLine1: "WRISTBAND", titleLine2: "– IMPERIAL PURPLE", desc: "Rich royal purple woven delegate band adorned with commemorative silver threads", img: "/assets/catalyst-merch/wristband-purple.webp", ctaText: "Add to Cart", ctaUrl: "/merch/wristband-purple", productId: "wristband-purple" },
  { tag: "#ExclusiveDrop", titleLine1: "SERIES I", titleLine2: "– COMMEMORATIVE", desc: "Official Catalyst 7.0 collector merchandise crafted for AIESEC in SLIIT delegates", img: "/assets/catalyst-merch/S1.webp", ctaText: "Add to Cart", ctaUrl: "/merch/special-series-1", productId: "special-series-1" },
  { tag: "#ExclusiveDrop", titleLine1: "SERIES II", titleLine2: "– SPECIAL RELEASE", desc: "Curated festival showcase collectible commemorating two days of leadership", img: "/assets/catalyst-merch/S2.webp", ctaText: "Add to Cart", ctaUrl: "/merch/special-series-2", productId: "special-series-2" },
];

export const defaultDishes: CarouselItem[] = defaultMerchItems;

type Size = "mobile" | "tablet" | "desktop";

// Seigaiha (wave) band, used as a section edge. Kept to the very edge so it never sits behind text.
const SEIGAIHA =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='20' viewBox='0 0 40 20'%3E%3Cg fill='none' stroke='%23C9362B' stroke-width='1.4'%3E%3Ccircle cx='20' cy='20' r='18'/%3E%3Ccircle cx='20' cy='20' r='12'/%3E%3Ccircle cx='20' cy='20' r='6'/%3E%3Ccircle cx='0' cy='10' r='18'/%3E%3Ccircle cx='0' cy='10' r='12'/%3E%3Ccircle cx='0' cy='10' r='6'/%3E%3Ccircle cx='40' cy='10' r='18'/%3E%3Ccircle cx='40' cy='10' r='12'/%3E%3Ccircle cx='40' cy='10' r='6'/%3E%3C/g%3E%3C/svg%3E\")";

const CATEGORY_KANJI: Record<string, string> = { APPAREL: "衣", ACCESSORIES: "飾", COLLECTIBLES: "集", "SPECIAL SERIES": "特" };

const PETALS = [
  { left: "3%", delay: 0, dur: 11 },
  { left: "10%", delay: 3.5, dur: 13 },
  { left: "89%", delay: 1.5, dur: 12 },
  { left: "96%", delay: 5, dur: 14 },
];

const Petal = () => (
  <svg viewBox="0 0 24 32" width="14" height="18" aria-hidden="true">
    <path d="M12 2 C16 7, 22 13, 21 21 C20 27, 15 30, 12 28 C9 30, 4 27, 3 21 C2 13, 8 7, 12 2 Z" fill="#C9362B" opacity="0.85" />
  </svg>
);

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function computeDims(size: Size, panelH: number, stageW: number) {
  const shiftK = size === "mobile" ? 0.66 : 0.84;
  const scale = size === "mobile" ? 0.84 : 0.86;
  let h = clamp(panelH > 0 ? panelH - 26 : 460, 300, 700);
  let w = clamp(h * 0.62, 190, size === "mobile" ? 290 : 380);
  if (stageW > 0) {
    w = size === "mobile"
      ? Math.min(w, stageW * 0.7)
      : Math.min(w, (stageW - 48) / 2 / (shiftK + scale / 2));
  }
  w = Math.max(w, 190);
  h = Math.min(h, w / 0.5);
  const imgH = clamp(h * 0.55, 110, h - 225);
  return { w: Math.round(w), h: Math.round(h), imgH: Math.round(imgH), shift: Math.round(w * shiftK), scale, rot: size === "mobile" ? 18 : 20 };
}

export function CoverFlowCarousel({
  items: itemsProp = defaultMerchItems,
  sectionLabel = "CATALYST 7.0 MERCHANDISE",
  chapterLabel = "第四章",
  active = false,
  autoplay = true,
  autoplayDelay = 5500,
  className = "",
  onCtaClick,
}: CoverFlowCarouselProps) {
  const navigate = useNavigate();
  // Live shop status + published products (controlled from Admin > Merchandise)
  const { comingSoon, loading: catalogLoading, error: catalogError, products: liveProducts } = useCatalog();
  const liveById = useMemo(() => new Map(liveProducts.map((p) => [p.id, p])), [liveProducts]);
  const lookup = (id?: string): MerchProduct | undefined => (id ? liveById.get(id) : undefined);
  // Only published products are shown, with the live price and sizes. Products added in the admin that are not in the
  // curated list at the top of this file are appended automatically.
  const items = useMemo<CarouselItem[]>(() => {
    const curated = itemsProp.filter((it) => !it.productId || liveById.has(it.productId));
    const shown = new Set(curated.map((it) => it.productId).filter(Boolean));
    const extra: CarouselItem[] = liveProducts
      .filter((p) => !shown.has(p.id))
      .map((p) => ({
        tag: "#OfficialMerch",
        titleLine1: p.name.toUpperCase(),
        titleLine2: p.variant ? `– ${p.variant.toUpperCase()}` : undefined,
        desc: p.description,
        img: p.images[0],
        ctaText: "Add to Cart",
        ctaUrl: `/merch/${p.id}`,
        productId: p.id,
      }));
    return [...curated, ...extra];
  }, [itemsProp, liveProducts, liveById]);
  // Defensive: if this carousel is ever rendered outside <MerchProvider>, fall back to opening the product page.
  let merch: ReturnType<typeof useMerch> | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    merch = useMerch();
  } catch {
    merch = null;
  }
  const [addedId, setAddedId] = useState<string | null>(null);
  const [pickedSize, setPickedSize] = useState<Record<string, string>>({});
  const [warnId, setWarnId] = useState<string | null>(null);
  const total = items.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [size, setSize] = useState<Size>("desktop");
  const [reduce, setReduce] = useState(false);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const [vh, setVh] = useState(900);
  const [stageW, setStageW] = useState(0);
  const [panelH, setPanelH] = useState(0);
  const [broken, setBroken] = useState<Record<string, boolean>>({});
  const stageRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const idxRef = useRef(0);
  const [userTookOver, setUserTookOver] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const touch = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setSize(w < 640 ? "mobile" : w < 1024 ? "tablet" : "desktop");
      setVh(window.innerHeight);
    };
    update();
    window.addEventListener("resize", update);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMq = () => setReduce(mq.matches);
    onMq();
    mq.addEventListener("change", onMq);
    return () => {
      window.removeEventListener("resize", update);
      mq.removeEventListener("change", onMq);
    };
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = stageRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([e]) => {
      setStageW(e.contentRect.width);
      setPanelH(e.contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    idxRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    if (total > 0 && currentIndex >= total) setCurrentIndex(0);
  }, [total, currentIndex]);

  const go = useCallback((idx: number, manual = true) => {
    setCurrentIndex(((idx % total) + total) % total);
    if (manual) setUserTookOver(true);
  }, [total]);

  // Scroll/trackpad switching ONLY while the pointer is over the card area.
  // At the first/last item the wheel is released, so the page scrolls on normally.
  useEffect(() => {
    const el = groupRef.current;
    if (!el || total <= 1) return;
    let acc = 0;
    let lockedUntil = 0;
    const onWheel = (e: WheelEvent) => {
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(delta) < 2) return;
      const i = idxRef.current;
      if ((delta > 0 && i >= total - 1) || (delta < 0 && i <= 0)) return; // let the page scroll
      e.preventDefault();
      const now = performance.now();
      if (now < lockedUntil) return;
      acc += delta;
      if (Math.abs(acc) > 50) {
        setCurrentIndex(Math.min(total - 1, Math.max(0, i + (acc > 0 ? 1 : -1))));
        setUserTookOver(true);
        acc = 0;
        lockedUntil = now + 420;
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [total]);

  // GSAP entrance + flowing wave band. Only created once HomePage is locked (active), refreshPriority -1.
  useEffect(() => {
    const root = sectionRef.current;
    if (!active || !root || reduce) return;
    const ctx = gsap.context(() => {
      const st = { trigger: root, start: "top 70%", once: true, refreshPriority: -1 };
      const band = gsap.to("[data-g=band]", { x: 40, duration: 3.2, ease: "none", repeat: -1 });
      gsap.from("[data-g=chead] > *:not(svg)", { y: 22, opacity: 0, duration: 0.65, ease: "power3.out", stagger: 0.11, scrollTrigger: st });
      gsap.from("[data-g=chead] svg", { scaleX: 0, transformOrigin: "0% 50%", duration: 0.9, ease: "power2.out", delay: 0.3, scrollTrigger: st });
      gsap.from("[data-g=panel]", { y: 50, opacity: 0, duration: 0.8, ease: "power3.out", delay: 0.15, scrollTrigger: st });
      ScrollTrigger.create({ trigger: root, start: "top bottom", end: "bottom top", refreshPriority: -1, onToggle: (self) => (self.isActive ? band.play() : band.pause()) });
    }, root);
    return () => ctx.revert();
  }, [active, reduce]);

  const next = useCallback((manual = true) => go(currentIndex + 1, manual), [go, currentIndex]);
  const prev = useCallback((manual = true) => go(currentIndex - 1, manual), [go, currentIndex]);

  // Autoplay only while visible, not hovered/focused, not reduced-motion, and until the visitor interacts.
  useEffect(() => {
    if (!autoplay || reduce || paused || !inView || userTookOver || total <= 1) return;
    const id = setInterval(() => setCurrentIndex((i) => (i + 1) % total), autoplayDelay);
    return () => clearInterval(id);
  }, [autoplay, reduce, paused, inView, userTookOver, total, autoplayDelay]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
    if (e.key === "ArrowRight") { e.preventDefault(); next(); }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touch.current.x;
    const dy = e.changedTouches[0].clientY - touch.current.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) (dx < 0 ? next : prev)();
  };

  const open = (item: CarouselItem) => {
    if (onCtaClick) return onCtaClick(item);
    navigate(item.productId ? `/merch/${item.productId}` : "/merch");
  };

  // Standard shop behaviour: items with no size choice go straight into the cart.
  // Items that need a size open the product page so the delegate can pick one first.
  const needsSize = (item: CarouselItem) => {
    const p = lookup(item.productId);
    return Boolean(p?.options?.sizes && p.options.sizes.length > 1);
  };

  const handleCta = (item: CarouselItem) => {
    const p = lookup(item.productId);
    if (!p || !merch) return open(item);
    let size: string | undefined = p.options?.sizes?.[0];
    if (needsSize(item)) {
      size = pickedSize[p.id];
      if (!size) {
        // no size chosen yet: highlight the size chips instead of adding
        setWarnId(p.id);
        window.setTimeout(() => setWarnId((cur) => (cur === p.id ? null : cur)), 1800);
        return;
      }
    }
    merch.addToCart(p, size, 1);
    setAddedId(p.id);
    window.setTimeout(() => setAddedId((cur) => (cur === p.id ? null : cur)), 1600);
  };

  const state: "open" | "soon" | "error" | "loading" = comingSoon
    ? "soon"
    : catalogError
      ? "error"
      : catalogLoading
        ? "loading"
        : total === 0
          ? "soon"
          : "open";
  const closed = state !== "open";
  const d = computeDims(size, panelH, stageW);
  const compact = vh < 780;
  const dur = reduce ? "0ms" : "650ms";

  return (
    <section
      ref={sectionRef}
      aria-label={sectionLabel}
      className={`relative flex w-full flex-col overflow-hidden select-none ${className}`}
      style={{
        background: "linear-gradient(180deg, #F8F3E9 0%, #F8F3E9 70%, #F3ECE0 100%)",
        color: INK,
        fontFamily: BODY,
        height: "max(100svh, 620px)",
        paddingTop: 24,
        paddingBottom: 14,
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <style>{`@keyframes cfPetal{0%{transform:translate3d(0,-24px,0) rotate(0deg);opacity:0}15%{opacity:.8}85%{opacity:.8}100%{transform:translate3d(36px,190px,0) rotate(200deg);opacity:0}}`}</style>
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-6 hidden h-[200px] sm:block">
        {!reduce &&
          PETALS.map((p, i) => (
            <span key={i} className="absolute top-0" style={{ left: p.left, animation: `cfPetal ${p.dur}s linear ${p.delay}s infinite`, willChange: "transform, opacity" }}>
              <Petal />
            </span>
          ))}
      </div>
      <div data-g="band" aria-hidden="true" className="absolute -inset-x-10 top-0 h-5" style={{ backgroundImage: SEIGAIHA, backgroundRepeat: "repeat-x", backgroundSize: "40px 20px" }} />
      <div className="relative mx-auto mt-2 flex min-h-0 w-full max-w-7xl flex-1 flex-col px-4 sm:px-8">
        {/* ── Header: chapter + hanko + title ── */}
        <header data-g="chead" className="mb-3 flex shrink-0 flex-col items-center text-center sm:mb-4">
          <div className="mb-3 flex items-center gap-3">
            <span
              aria-hidden="true"
              className="grid h-9 w-9 place-items-center rounded-[4px] text-lg font-bold text-white"
              style={{ background: RED, fontFamily: BRUSH }}
            >
              印
            </span>
            <span style={{ fontFamily: BRUSH, fontSize: 20, letterSpacing: "0.16em", color: INK }}>
              {chapterLabel}
            </span>
          </div>
          <h2
            style={{
              fontFamily: JANSINA,
              fontWeight: 400,
              fontSize: compact ? "clamp(1.7rem, 4.4vw, 2.6rem)" : "clamp(2rem, 5.4vw, 3.6rem)",
              letterSpacing: "0.03em",
              lineHeight: 1.05,
              margin: 0,
            }}
          >
            {sectionLabel}
          </h2>
          <svg viewBox="0 0 420 28" fill="none" aria-hidden="true" className="mt-1 h-4 w-48 sm:w-64">
            <path d="M6 16 C45 10, 95 8, 150 9 C220 10, 290 8, 350 12 C385 14, 405 16, 416 13 C405 20, 370 21, 320 20 C240 18, 160 21, 90 20 C50 19, 20 20, 6 16 Z" fill={RED} />
          </svg>
          {!compact && (
          <p className="hidden sm:block" style={{ fontSize: 15, lineHeight: 1.5, color: "#3D3833", marginTop: 6 }}>
            <span style={{ fontFamily: BRUSH, fontSize: 19, color: RED_DARK, marginRight: 8 }}>公式グッズ</span>
            {closed ? "Our official merchandise is almost ready." : "Official gear for delegates. Pick a piece and add it to your cart."}
          </p>
          )}
        </header>

        <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)] items-stretch gap-6 lg:grid-cols-[200px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)] lg:gap-8">
          {/* ── Samurai: own column, desktop only, never overlaps the stage ── */}
          <div className="pointer-events-none hidden min-h-0 flex-col items-center justify-end lg:flex" aria-hidden="true">
            <img
              src="/assets/illustrations/benkageyama-samurai-5135974_1920.png"
              alt=""
              className="min-h-0 w-full max-w-[200px] flex-1 object-contain xl:max-w-[230px]"
              style={{ mixBlendMode: "multiply" }}
            />
            <span className="mt-2 flex shrink-0 items-center gap-2" style={{ fontFamily: BRUSH, fontSize: 20, letterSpacing: "0.18em", color: RED }}>
              武士道
            </span>
          </div>

          {/* ── Stage ── */}
          <div className="flex min-h-0 min-w-0 flex-col">
            <div
              ref={stageRef}
              data-g="panel"
              className="relative min-h-0 flex-1 rounded-2xl px-2 py-3 sm:px-4"
              style={{
                backgroundColor: "#EADFCB",
                backgroundImage:
                  "repeating-linear-gradient(90deg, rgba(37,35,33,0.07) 0, rgba(37,35,33,0.07) 1px, transparent 1px, transparent 72px)",
                border: `2px solid ${INK}`,
              }}
            >
              {[
                "left-2 top-2 border-l-2 border-t-2",
                "right-2 top-2 border-r-2 border-t-2",
                "bottom-2 left-2 border-b-2 border-l-2",
                "bottom-2 right-2 border-b-2 border-r-2",
              ].map((c) => (
                <span key={c} aria-hidden="true" className={`pointer-events-none absolute z-10 h-5 w-5 border-[#C9362B] ${c}`} />
              ))}
            {closed ? (
              <ComingSoonPanel state={state as "soon" | "error" | "loading"} />
            ) : (
            <div
              ref={groupRef}
              role="group"
              aria-roledescription="carousel"
              aria-label="Catalyst 7.0 merchandise"
              tabIndex={0}
              onKeyDown={onKeyDown}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
              className="relative mx-auto w-full outline-none focus-visible:ring-2 focus-visible:ring-[#C9362B] focus-visible:ring-offset-4 focus-visible:ring-offset-[#F8F3E9] rounded-xl"
              style={{ height: panelH > 0 ? panelH : d.h + 26, perspective: 1600, touchAction: "pan-y", overflow: "hidden" }}
            >
              <span className="sr-only" aria-live="polite">
                {`Item ${currentIndex + 1} of ${total}: ${items[currentIndex]?.titleLine1 ?? ""} ${items[currentIndex]?.titleLine2 ?? ""}`}
              </span>

              {items.map((item, idx) => {
                const raw = (idx - currentIndex + total) % total;
                const offset = raw > total / 2 ? raw - total : raw; // -n..n, shortest path
                const isCenter = offset === 0;
                const visible = Math.abs(offset) <= 1;
                const sign = Math.sign(offset);
                const product = lookup(item.productId);

                const transform = isCenter
                  ? "translate3d(0,0,0) scale(1) rotateY(0deg)"
                  : `translate3d(${sign * d.shift}px,0,0) scale(${d.scale}) rotateY(${reduce ? 0 : -sign * d.rot}deg)`;

                return (
                  <div
                    key={idx}
                    aria-hidden={!isCenter}
                    onClick={() => (isCenter ? open(item) : go(idx))}
                    style={{
                      position: "absolute",
                      top: 12,
                      left: "50%",
                      marginLeft: -d.w / 2,
                      width: d.w,
                      height: d.h,
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: 16,
                      overflow: "hidden",
                      backgroundColor: "#FFFFFF",
                      border: isCenter ? `3px solid ${RED}` : `2px solid ${INK}`,
                      boxShadow: isCenter
                        ? `7px 7px 0 ${INK}`
                        : `4px 4px 0 rgba(37,35,33,0.85)`,
                      transform,
                      opacity: visible ? 1 : 0,
                      visibility: visible ? "visible" : "hidden",
                      zIndex: isCenter ? 30 : visible ? 20 : 0,
                      pointerEvents: visible ? "auto" : "none",
                      cursor: "pointer",
                      transition: `transform ${dur} cubic-bezier(0.22,1,0.36,1), opacity ${dur} ease`,
                      willChange: "transform, opacity",
                    }}
                  >
                    {/* Image area */}
                    <div
                      style={{
                        height: d.imgH,
                        flex: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 16,
                        background: "#E6D9C0",
                        borderBottom: `2px solid ${INK}`,
                        position: "relative",
                        boxShadow: "inset 0 0 0 5px #E6D9C0, inset 0 0 0 6px rgba(201,54,43,0.55)",
                      }}
                    >
                      {broken[item.img] ? (
                        <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, color: INK, fontFamily: LABEL, fontWeight: 700, fontSize: 12, letterSpacing: "0.1em" }}>
                          <span style={{ width: 52, height: 52, display: "grid", placeItems: "center", background: RED, color: "#fff", borderRadius: 4, fontFamily: "'Noto Serif JP', serif", fontSize: 28 }}>
                            {(product && CATEGORY_KANJI[product.category]) || "印"}
                          </span>
                          PHOTO COMING SOON
                        </span>
                      ) : (
                        <img
                          src={item.img}
                          alt={isCenter ? `${item.titleLine1} ${item.titleLine2 ?? ""}` : ""}
                          loading="lazy"
                          decoding="async"
                          draggable={false}
                          onError={() => setBroken((b) => ({ ...b, [item.img]: true }))}
                          style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                        />
                      )}
                      {item.tag && (
                        <span
                          style={{
                            position: "absolute",
                            top: 10,
                            left: 10,
                            fontFamily: LABEL,
                            fontWeight: 700,
                            fontSize: 11,
                            letterSpacing: "0.08em",
                            color: "#FFFFFF",
                            background: RED,
                            padding: "3px 8px",
                            borderRadius: 4,
                          }}
                        >
                          {item.tag}
                        </span>
                      )}
                      {product && (
                        <span
                          aria-hidden="true"
                          style={{
                            position: "absolute",
                            top: 10,
                            right: 10,
                            width: 30,
                            height: 30,
                            display: "grid",
                            placeItems: "center",
                            background: RED,
                            color: "#FFFFFF",
                            borderRadius: 3,
                            fontFamily: "'Noto Serif JP', serif",
                            fontWeight: 700,
                            fontSize: 17,
                          }}
                        >
                          {CATEGORY_KANJI[product.category] ?? "印"}
                        </span>
                      )}
                    </div>

                    {/* Text area: always visible, sits directly under the image */}
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 2,
                        padding: "8px 12px 12px",
                        textAlign: "center",
                      }}
                    >
                      <h3
                        style={{
                          fontFamily: JANSINA,
                          fontWeight: 400,
                          fontSize: size === "mobile" ? "1.75rem" : "2.1rem",
                          letterSpacing: "0.03em",
                          lineHeight: 1.05,
                          color: INK,
                          margin: 0,
                        }}
                      >
                        {item.titleLine1}
                      </h3>
                      {item.titleLine2 && (
                        <span style={{ fontFamily: HEAD, fontWeight: 700, fontSize: size === "mobile" ? "0.95rem" : "1.05rem", letterSpacing: "0.04em", color: RED_DARK }}>
                          {item.titleLine2}
                        </span>
                      )}

                      {product && (
                        <span style={{ marginTop: 6, fontFamily: LABEL, fontWeight: 700, fontSize: 14, letterSpacing: "0.08em", color: INK }}>
                          {product.priceDisplay}
                        </span>
                      )}
                      {isCenter && product && needsSize(item) && (
                        <div
                          role="radiogroup"
                          aria-label="Select size"
                          onClick={(e) => e.stopPropagation()}
                          style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}
                        >
                          {product.options!.sizes!.map((sz: string) => {
                            const on = pickedSize[product.id] === sz;
                            const warn = warnId === product.id && !pickedSize[product.id];
                            return (
                              <button
                                key={sz}
                                type="button"
                                role="radio"
                                aria-checked={on}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPickedSize((m) => ({ ...m, [product.id]: sz }));
                                  setWarnId(null);
                                }}
                                style={{
                                  minWidth: 36,
                                  height: 30,
                                  padding: "0 8px",
                                  borderRadius: 6,
                                  border: `1.5px solid ${warn ? RED : INK}`,
                                  background: on ? RED : "#FFFFFF",
                                  color: on ? "#FFFFFF" : warn ? RED : INK,
                                  fontFamily: LABEL,
                                  fontWeight: 700,
                                  fontSize: 12,
                                  letterSpacing: "0.06em",
                                  cursor: "pointer",
                                  boxShadow: on ? `2px 2px 0 ${INK}` : "none",
                                }}
                              >
                                {sz}
                              </button>
                            );
                          })}
                        </div>
                      )}
                      {isCenter && (
                        <button
                          type="button"
                          aria-label={`Add to cart: ${item.titleLine1} ${item.titleLine2 ?? ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCta(item);
                          }}
                          style={{
                            marginTop: 8,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            minHeight: 44,
                            padding: "0 22px",
                            whiteSpace: "nowrap",
                            borderRadius: 999,
                            background: addedId === item.productId ? INK : RED_DARK,
                            color: "#FFFFFF",
                            fontFamily: LABEL,
                            fontWeight: 700,
                            fontSize: 13,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            border: "none",
                            cursor: "pointer",
                            boxShadow: "0 4px 14px rgba(181,30,35,0.30)",
                          }}
                        >
                          {addedId === item.productId ? (
                            <>
                              <CheckIcon />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <BagIcon />
                              <span>{item.ctaText || "Add to Cart"}</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            )}

            </div>

            {/* ── Controls: tidy row below the stage (hidden while the shop is closed) ── */}
            {!closed && (
            <div className="mt-3 flex shrink-0 items-center justify-center gap-4 sm:gap-6">
              <button type="button" onClick={() => prev()} aria-label="Previous merchandise item" style={ctrlStyle}>
                <Chevron dir="l" />
              </button>

              <div className="flex min-w-[88px] items-center justify-center">
                <span className="sm:hidden" style={{ fontFamily: LABEL, fontWeight: 700, fontSize: 14, letterSpacing: "0.14em" }}>
                  {String(currentIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                </span>
                <div className="hidden items-center sm:flex">
                  {items.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => go(idx)}
                      aria-label={`Go to item ${idx + 1}`}
                      aria-current={idx === currentIndex}
                      style={{ width: idx === currentIndex ? 36 : 24, height: 44, display: "grid", placeItems: "center", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    >
                      <span
                        style={{
                          display: "block",
                          height: 8,
                          width: idx === currentIndex ? 28 : 8,
                          borderRadius: 999,
                          background: idx === currentIndex ? RED : "rgba(37,35,33,0.35)",
                          transition: reduce ? "none" : "width 250ms ease, background-color 250ms ease",
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <button type="button" onClick={() => next()} aria-label="Next merchandise item" style={ctrlStyle}>
                <Chevron dir="r" />
              </button>
            </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// Shown inside the beige stage box while the shop is switched to "Coming soon" in the admin panel,
// while the status is loading, or if the status could not be loaded.
function ComingSoonPanel({ state }: { state: "soon" | "error" | "loading" }) {
  const copy =
    state === "error"
      ? { title: "BACK SOON", text: "The shop is taking a short break. Please check again in a moment." }
      : { title: "COMING SOON", text: "The official Catalyst 7.0 merchandise is on its way. Check back soon." };

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy={state === "loading"}
      className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden px-6 text-center"
    >
      <style>{`@keyframes cfSoonIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}@keyframes cfSoonPulse{0%,100%{opacity:.45}50%{opacity:.9}}@media (prefers-reduced-motion:reduce){.cf-soon-in,.cf-soon-pulse{animation:none!important}}`}</style>

      {/* faint ghost cards, so the box still reads as a collection that is not open yet */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden items-center justify-center sm:flex">
        <div className="absolute h-[62%] w-[22%] max-w-[230px] -translate-x-[170%] -rotate-6 rounded-2xl border-2 border-dashed border-[#252321]/15 bg-white/30" />
        <div className="absolute h-[62%] w-[22%] max-w-[230px] translate-x-[170%] rotate-6 rounded-2xl border-2 border-dashed border-[#252321]/15 bg-white/30" />
      </div>

      {state === "loading" ? (
        <p className="cf-soon-pulse relative text-sm font-bold uppercase tracking-[0.3em] text-[#736B63]" style={{ fontFamily: LABEL, animation: "cfSoonPulse 1.6s ease-in-out infinite" }}>
          Loading the collection…
        </p>
      ) : (
        <div className="cf-soon-in relative flex max-w-lg flex-col items-center" style={{ animation: "cfSoonIn .7s cubic-bezier(.22,1,.36,1) both" }}>
          <span
            aria-hidden="true"
            className="mb-4 grid h-12 w-12 -rotate-3 place-items-center rounded-[4px] text-2xl text-white shadow-[0_6px_16px_rgba(201,54,43,0.35)]"
            style={{ background: RED, fontFamily: "'Noto Serif JP', serif" }}
          >
            近
          </span>

          <h3
            className="brush-heading"
            style={{ margin: 0, fontFamily: JANSINA, fontWeight: 400, fontSize: "clamp(2.4rem, 7vw, 4.8rem)", letterSpacing: "0.03em", lineHeight: 1.05, color: INK }}
          >
            {copy.title}
          </h3>

          <svg viewBox="0 0 420 28" fill="none" aria-hidden="true" className="mt-1 h-4 w-44 sm:w-60">
            <path d="M6 16 C45 10, 95 8, 150 9 C220 10, 290 8, 350 12 C385 14, 405 16, 416 13 C405 20, 370 21, 320 20 C240 18, 160 21, 90 20 C50 19, 20 20, 6 16 Z" fill={RED} />
          </svg>

          <div className="mt-4 flex items-center gap-3" aria-hidden="true">
            <span className="h-px w-8 bg-[#C9362B]/60 sm:w-14" />
            <span className="pl-[0.4em] text-sm font-bold tracking-[0.4em] text-[#C9362B] sm:text-base" style={{ fontFamily: "'Noto Serif JP', serif" }}>
              近日公開
            </span>
            <span className="h-px w-8 bg-[#C9362B]/60 sm:w-14" />
          </div>

          <p className="mt-4 text-sm leading-relaxed text-[#3D3833] sm:text-base" style={{ fontFamily: BODY }}>
            {copy.text}
          </p>
        </div>
      )}
    </div>
  );
}

const ctrlStyle: React.CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: "50%",
  background: "#FFFFFF",
  border: `1.5px solid ${INK}`,
  color: INK,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  flex: "none",
};

export const Component = CoverFlowCarousel;
export default CoverFlowCarousel;