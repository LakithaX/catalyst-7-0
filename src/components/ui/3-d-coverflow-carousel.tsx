"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Inline Icons (Zero external dependencies)
const ChevronLeftIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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
  autoplay?: boolean;
  autoplayDelay?: number;
  className?: string;
  onCtaClick?: (item: CarouselItem) => void;
}

export const defaultMerchItems: CarouselItem[] = [
  {
    tag: "#OfficialMerch",
    titleLine1: "DELEGATE TEE",
    titleLine2: "– OBSIDIAN BLACK",
    desc: "Signature heavyweight cotton tee featuring the Catalyst 7.0 crest and Japanese calligraphy",
    img: "/assets/catalyst-merch/del-black-front.png",
    ctaText: "Claim Merch",
    ctaUrl: "/merch/delegate-tee-black",
    productId: "delegate-tee-black",
  },
  {
    tag: "#SignatureDrop",
    titleLine1: "DELEGATE TEE",
    titleLine2: "– BUSHIDO BACK",
    desc: "Detailed back-print artwork capturing the spirit of purpose, honour and connection",
    img: "/assets/catalyst-merch/del-black-back.png",
    ctaText: "Claim Merch",
    ctaUrl: "/merch/delegate-tee-black",
    productId: "delegate-tee-black",
  },
  {
    tag: "#Streetwear",
    titleLine1: "BUCKET HAT",
    titleLine2: "– TOKYO EDITION",
    desc: "Structured all-weather canvas bucket hat with high-density embroidered insignia",
    img: "/assets/catalyst-merch/del-bucket-hat.png",
    ctaText: "Claim Merch",
    ctaUrl: "/merch/bucket-hat-tokyo",
    productId: "bucket-hat-tokyo",
  },
  {
    tag: "#LimitedEdition",
    titleLine1: "DELEGATE TEE",
    titleLine2: "– PURE IVORY",
    desc: "Minimalist off-white premium silhouette with understated chest seal embroidery",
    img: "/assets/catalyst-merch/del-white-front.png",
    ctaText: "Claim Merch",
    ctaUrl: "/merch/delegate-tee-white",
    productId: "delegate-tee-white",
  },
  {
    tag: "#CollectorPack",
    titleLine1: "STICKER PACK",
    titleLine2: "– BUSHIDO SET",
    desc: "Matte waterproof vinyl decals crafted with authentic Japanese ukiyo-e motifs",
    img: "/assets/catalyst-merch/stickers-pack-1.png",
    ctaText: "Claim Merch",
    ctaUrl: "/merch/stickers-bushido",
    productId: "stickers-bushido",
  },
  {
    tag: "#CollectorPack",
    titleLine1: "STICKER PACK",
    titleLine2: "– SHINOBI SET",
    desc: "Custom die-cut metallic & matte sticker sheets designed for laptops and gear",
    img: "/assets/catalyst-merch/stickers-pack-2.png",
    ctaText: "Claim Merch",
    ctaUrl: "/merch/stickers-shinobi",
    productId: "stickers-shinobi",
  },
  {
    tag: "#Accessory",
    titleLine1: "WRISTBAND",
    titleLine2: "– SANDSTONE BEIGE",
    desc: "High-density jacquard woven seminar band with antique gold locking slider",
    img: "/assets/catalyst-merch/wristband-beige.png",
    ctaText: "Claim Merch",
    ctaUrl: "/merch/wristband-beige",
    productId: "wristband-beige",
  },
  {
    tag: "#Accessory",
    titleLine1: "WRISTBAND",
    titleLine2: "– IMPERIAL PURPLE",
    desc: "Rich royal purple woven delegate band adorned with commemorative silver threads",
    img: "/assets/catalyst-merch/wristband-purple.png",
    ctaText: "Claim Merch",
    ctaUrl: "/merch/wristband-purple",
    productId: "wristband-purple",
  },
  {
    tag: "#ExclusiveDrop",
    titleLine1: "SERIES I",
    titleLine2: "– COMMEMORATIVE",
    desc: "Official Catalyst 7.0 collector merchandise crafted for AIESEC in SLIIT delegates",
    img: "/assets/catalyst-merch/catalyst-s1.png",
    ctaText: "Claim Merch",
    ctaUrl: "/merch/special-series-1",
    productId: "special-series-1",
  },
  {
    tag: "#ExclusiveDrop",
    titleLine1: "SERIES II",
    titleLine2: "– SPECIAL RELEASE",
    desc: "Curated festival showcase collectible commemorating two days of leadership",
    img: "/assets/catalyst-merch/catalyst-s2.png",
    ctaText: "Claim Merch",
    ctaUrl: "/merch/special-series-2",
    productId: "special-series-2",
  },
];

export const defaultDishes: CarouselItem[] = defaultMerchItems;

export function CoverFlowCarousel({
  items = defaultMerchItems,
  sectionLabel = "CATALYST 7.0 MERCHANDISE",
  autoplay = true,
  autoplayDelay = 5000,
  className = "",
  onCtaClick,
}: CoverFlowCarouselProps) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const touchStartX = useRef(0);
  const total = items.length;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = (idx: number) => {
    setCurrentIndex(idx % total);
  };

  useEffect(() => {
    if (!autoplay || isHovered || total <= 1) return;
    const interval = setInterval(nextSlide, autoplayDelay);
    return () => clearInterval(interval);
  }, [autoplay, autoplayDelay, isHovered, nextSlide, total]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 45) {
      if (diff < 0) nextSlide();
      else prevSlide();
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <section
      className={`relative w-full min-h-[760px] flex items-center justify-center overflow-hidden py-12 select-none ${className}`}
      style={{
        backgroundColor: "#F8F3E9",
        color: "#252321",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "680px",
            height: "520px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201, 54, 43, 0.08) 0%, rgba(248, 243, 233, 0.4) 45%, transparent 70%)",
            filter: "blur(65px)",
          }}
        />
        <img
          src={items[currentIndex]?.img}
          alt="ambience background"
          style={{
            position: "absolute",
            top: "45%",
            left: "50%",
            transform: "translate(-50%, -50%) scale(1.15)",
            width: "480px",
            height: "480px",
            objectFit: "contain",
            filter: "brightness(0.9) blur(36px)",
            opacity: 0.2,
            transition: "all 900ms ease",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at center, rgba(201,54,43,0.03) 0%, rgba(248,243,233,0.85) 65%, #F8F3E9 100%)",
          }}
        />
      </div>

      {/* ── Bushido Combat Samurai: Dynamic Warrior Flanking the Merch Showcase (Desktop Only) ── */}
      <div
        className="pointer-events-none absolute right-0 xl:right-4 bottom-0 z-10 select-none hidden lg:flex items-end justify-end max-w-[320px] lg:max-w-[370px] xl:max-w-[420px] h-auto transition-opacity"
        aria-hidden="true"
      >
        {/* Soft Crimson Backlight */}
        <div
          className="absolute -inset-6 rounded-full blur-3xl opacity-35 pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(201, 54, 43, 0.22) 0%, transparent 70%)",
          }}
        />
        <img
          src="/assets/samurai/samurai-combat.png"
          alt=""
          className="w-full h-auto object-contain filter drop-shadow-[0_16px_36px_rgba(37,35,33,0.22)]"
        />
      </div>

      <div className="relative w-full max-w-6xl mx-auto px-4 z-10 flex flex-col items-center">
        {/* Eyebrow */}
        {sectionLabel && (
          <div className="flex items-center gap-3 mb-8">
            <span style={{ width: "36px", height: "1.5px", background: "linear-gradient(90deg, transparent, #C9362B)" }} />
            <h3
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: "0.78rem",
                fontWeight: 800,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "#C9362B",
                margin: 0,
              }}
            >
              {sectionLabel}
            </h3>
            <span style={{ width: "36px", height: "1.5px", background: "linear-gradient(90deg, #C9362B, transparent)" }} />
          </div>
        )}

        {/* 3D Coverflow Stage */}
        <div
          className="relative w-full h-[450px] sm:h-[490px] lg:h-[520px] flex justify-center items-center mb-8"
          style={{ perspective: "1400px" }}
        >
          {items.map((item, idx) => {
            const offset = (idx - currentIndex + total) % total;

            const cardWidth = isMobile ? 250 : 330;
            const cardHeight = isMobile ? 410 : 500;
            const shift1 = isMobile ? 100 : 285;
            const shift2 = isMobile ? 190 : 510;
            const cardScale = isMobile ? 0.78 : 0.84;

            let transform = "translateX(0px) scale(0.4) rotateY(0deg)";
            let opacity = 0;
            let zIndex = 0;
            let filter = "brightness(0.4) blur(2px)";
            let isCenter = false;

            if (offset === 0) {
              isCenter = true;
              transform = "translateX(0px) scale(1) rotateY(0deg)";
              opacity = 1;
              zIndex = 30;
              filter = "brightness(1)";
            } else if (offset === 1) {
              transform = `translateX(${shift1}px) scale(${cardScale}) rotateY(-24deg)`;
              opacity = isMobile ? 0.45 : 0.65;
              zIndex = 20;
              filter = "brightness(0.75)";
            } else if (offset === 2) {
              transform = `translateX(${shift2}px) scale(0.68) rotateY(-38deg)`;
              opacity = isMobile ? 0 : 0.38;
              zIndex = 10;
              filter = "brightness(0.55) blur(1px)";
            } else if (offset === total - 1) {
              transform = `translateX(-${shift1}px) scale(${cardScale}) rotateY(24deg)`;
              opacity = isMobile ? 0.45 : 0.65;
              zIndex = 20;
              filter = "brightness(0.75)";
            } else if (offset === total - 2) {
              transform = `translateX(-${shift2}px) scale(0.68) rotateY(38deg)`;
              opacity = isMobile ? 0 : 0.38;
              zIndex = 10;
              filter = "brightness(0.55) blur(1px)";
            }

            return (
              <div
                key={idx}
                onClick={() => {
                  if (!isCenter) {
                    goToSlide(idx);
                  } else {
                    if (item.productId) {
                      navigate(`/merch/${item.productId}`);
                    } else {
                      navigate('/merch');
                    }
                  }
                }}
                style={{
                  position: "absolute",
                  width: `${cardWidth}px`,
                  height: `${cardHeight}px`,
                  borderRadius: "18px",
                  overflow: "hidden",
                  backgroundColor: "#FFFFFF",
                  border: isCenter
                    ? "2px solid #C9362B"
                    : "1px solid #E5DDD0",
                  transform,
                  opacity,
                  zIndex,
                  filter,
                  transformOrigin: "center center",
                  transition: "all 800ms cubic-bezier(0.25, 1, 0.5, 1)",
                  boxShadow: isCenter
                    ? "0 20px 45px rgba(37,35,33,0.12), 0 0 25px rgba(201,54,43,0.18)"
                    : "0 10px 25px rgba(37,35,33,0.06)",
                  cursor: "pointer",
                }}
              >
                {/* Studio spotlight gradient inside card */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "radial-gradient(circle at 50% 32%, rgba(201,54,43,0.05) 0%, #FFFFFF 65%)",
                    pointerEvents: "none",
                  }}
                />

                {/* Merch Product Photo - Centered in upper area with realistic 3D drop shadow */}
                <div
                  style={{
                    position: "absolute",
                    top: isMobile ? "24px" : "32px",
                    left: "18px",
                    right: "18px",
                    height: isMobile ? "180px" : "250px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 5,
                  }}
                >
                  <img
                    src={item.img}
                    alt={item.titleLine1}
                    loading="lazy"
                    decoding="async"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                      filter: isCenter
                        ? "drop-shadow(0 14px 22px rgba(0,0,0,0.22))"
                        : "drop-shadow(0 8px 14px rgba(0,0,0,0.14))",
                      transform: isCenter ? "scale(1.04)" : "scale(0.95)",
                      transition: "transform 700ms cubic-bezier(0.25, 1, 0.5, 1), filter 600ms ease",
                    }}
                  />
                </div>

                {/* Light Vignette Overlay across bottom for crisp text contrast */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.7) 45%, #FFFFFF 85%)",
                    pointerEvents: "none",
                    zIndex: 10,
                  }}
                />

                {/* Content Overlay */}
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    padding: "20px 18px 22px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    textAlign: "center",
                    zIndex: 20,
                    opacity: isCenter ? 1 : 0,
                    transform: isCenter ? "translateY(0px)" : "translateY(16px)",
                    transition: "opacity 500ms ease, transform 500ms ease",
                    pointerEvents: isCenter ? "auto" : "none",
                  }}
                >
                  {/* Tag */}
                  <div style={{ textAlign: "right", width: "100%", paddingRight: "4px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        fontFamily: "'Montserrat', sans-serif",
                        color: "#C9362B",
                        padding: "3px 8px",
                        borderRadius: "4px",
                        backgroundColor: "rgba(201, 54, 43, 0.08)",
                        border: "1px solid rgba(201, 54, 43, 0.25)",
                        backdropFilter: "blur(6px)",
                      }}
                    >
                      {item.tag}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "3px",
                      marginTop: "auto",
                      paddingBottom: "4px",
                    }}
                  >
                    <h2
                      style={{
                        fontFamily: "'Shippori Mincho', serif",
                        fontSize: isMobile ? "1.32rem" : "1.6rem",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.02em",
                        color: "#252321",
                        margin: 0,
                        lineHeight: 1.08,
                      }}
                    >
                      {item.titleLine1}
                    </h2>

                    {item.titleLine2 && (
                      <span
                        style={{
                          fontFamily: "'Shippori Mincho', serif",
                          fontSize: isMobile ? "0.95rem" : "1.1rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          color: "#C9362B",
                          lineHeight: 1.15,
                        }}
                      >
                        {item.titleLine2}
                      </span>
                    )}

                    <div
                      style={{
                        width: "36px",
                        height: "2px",
                        backgroundColor: "#C9362B",
                        borderRadius: "2px",
                        margin: isMobile ? "6px auto 12px" : "8px auto 14px",
                      }}
                    />

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onCtaClick) {
                          onCtaClick(item);
                        } else if (item.productId) {
                          navigate(`/merch/${item.productId}`);
                        } else {
                          navigate('/merch');
                        }
                      }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: isMobile ? "7px 20px" : "8px 24px",
                        borderRadius: "10px",
                        background: "#B51E23",
                        color: "#FFFFFF",
                        fontFamily: "'Montserrat', sans-serif",
                        fontSize: isMobile ? "0.68rem" : "0.72rem",
                        fontWeight: 700,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        border: "none",
                        boxShadow: "0 4px 16px rgba(181,30,35,0.35)",
                        cursor: "pointer",
                        transition: "transform 200ms ease, box-shadow 200ms ease",
                      }}
                    >
                      <span>{item.ctaText || "Claim Merch"}</span>
                      <ArrowRightIcon />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          aria-label="Previous merchandise item"
          style={{
            position: "absolute",
            left: isMobile ? "6px" : "24px",
            top: "50%",
            transform: "translateY(-50%)",
            width: isMobile ? "38px" : "46px",
            height: isMobile ? "38px" : "46px",
            borderRadius: "50%",
            backgroundColor: "#FFFFFF",
            border: "1px solid #E5DDD0",
            color: "#252321",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(8px)",
            cursor: "pointer",
            boxShadow: "0 6px 20px rgba(37,35,33,0.12)",
            zIndex: 40,
            transition: "all 200ms ease",
          }}
        >
          <ChevronLeftIcon />
        </button>

        <button
          onClick={nextSlide}
          aria-label="Next merchandise item"
          style={{
            position: "absolute",
            right: isMobile ? "6px" : "24px",
            top: "50%",
            transform: "translateY(-50%)",
            width: isMobile ? "38px" : "46px",
            height: isMobile ? "38px" : "46px",
            borderRadius: "50%",
            backgroundColor: "#FFFFFF",
            border: "1px solid #E5DDD0",
            color: "#252321",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(8px)",
            cursor: "pointer",
            boxShadow: "0 6px 20px rgba(37,35,33,0.12)",
            zIndex: 40,
            transition: "all 200ms ease",
          }}
        >
          <ChevronRightIcon />
        </button>

        {/* Pagination Dots */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", zIndex: 30 }}>
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              style={{
                height: "8px",
                width: idx === currentIndex ? "28px" : "8px",
                borderRadius: "9999px",
                backgroundColor: idx === currentIndex ? "#C9362B" : "rgba(37,35,33,0.22)",
                border: "none",
                cursor: "pointer",
                boxShadow: idx === currentIndex ? "0 2px 8px rgba(201,54,43,0.35)" : "none",
                transition: "all 300ms ease",
              }}
            />
          ))}
        </div>

        {/* ── Mobile Combat Samurai Presentation (Mobile & Tablet Only) ── */}
        <div
          className="flex lg:hidden flex-col items-center justify-center mt-8 select-none pointer-events-none"
          aria-hidden="true"
        >
          <div className="relative max-w-[190px] sm:max-w-[240px] h-auto">
            <div
              className="absolute -inset-4 rounded-full blur-2xl opacity-40 pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(201, 54, 43, 0.25) 0%, transparent 70%)",
              }}
            />
            <img
              src="/assets/samurai/samurai-combat.png"
              alt="Catalyst 7.0 Bushido Samurai"
              className="w-full h-auto object-contain filter drop-shadow-[0_16px_32px_rgba(37,35,33,0.22)]"
            />
          </div>
          <div className="flex items-center gap-2.5 mt-2.5 text-[9.5px] sm:text-[11px] font-['Noto_Sans_JP',sans-serif] tracking-[0.25em] text-[#C9362B] uppercase font-bold">
            <span className="w-6 sm:w-8 h-[1px] bg-[#C9362B]/40" />
            <span>武士道 · BUSHIDO HERITAGE</span>
            <span className="w-6 sm:w-8 h-[1px] bg-[#C9362B]/40" />
          </div>
        </div>
      </div>
    </section>
  );
}

export const Component = CoverFlowCarousel;
export default CoverFlowCarousel;