import React, { useRef } from "react"
import { Link } from "react-router-dom"
import { useIsMobile } from "@/components/blocks/animated-gallery"
import { Button } from "@/components/ui/button"
import {
  motion,
  useInView,
  useReducedMotion,
  Variants,
} from "motion/react"
import { ArrowRight } from "lucide-react"

// ============================================================================
// JAPANESE SUMI-E DESIGN SYSTEM (Warm Ivory, Samurai Red, Ink Black)
// ============================================================================
const GALLERY_CONFIG = {
  colors: {
    // Warm Ivory Japanese Sumi-e Palette
    mainBg: "#F8F3E9", // Warm ivory background
    samuraiRed: "#C9362B", // Primary samurai red
    inkBlack: "#252321", // Ink black text & details
    mutedSage: "#899783", // Muted sage secondary
    softPeach: "#E9B9A5", // Soft peach accent
    cardBg: "#FFFFFF",
    cardBorder: "#E5DDD0",
    overlayWarm: "rgba(248, 243, 233, 0.15)",
    overlayRed: "rgba(201, 54, 43, 0.12)",
  },
  fonts: {
    heading: "'Shippori Mincho', 'Noto Serif JP', 'Cormorant Garamond', serif",
    body: "'Inter', system-ui, -apple-system, sans-serif",
    label: "'Noto Sans JP', 'Montserrat', sans-serif",
  },
  content: {
    eyebrow: "CATALYST 7.0 · SLIIT LEADERSHIP FORUM",
    headingLine1: "LEAD WITH",
    headingLine2: "PURPOSE",
    headingLine3: "GROW THROUGH",
    headingLine4: "CONNECTION",
    paragraph:
      "Catalyst 7.0 is the flagship leadership development seminar of SLIIT, planned as a two-day experience. Further details will be announced through our official event channels.",
    primaryButtonLabel: "EXPLORE MERCH",
    secondaryButtonLabel: "LEARN MORE",
    secondaryButtonHref: "#about",
    ctaUrl: "/merch",
  },
} as const

export interface GalleryImageItem {
  src: string
  alt: string
}

const ALL_IMAGES: GalleryImageItem[] = [
  {
    src: "/assets/catalyst-gallery/616083505_1268080465365864_3783241921869610059_n.jpg",
    alt: "Delegates engaged in an interactive group discussion during a Catalyst seminar session",
  },
  {
    src: "/assets/catalyst-gallery/616103586_1268087452031832_3118584779969684260_n.jpg",
    alt: "AIESEC in SLIIT organizing committee and delegates gathered for a group photo celebration",
  },
  {
    src: "/assets/catalyst-gallery/616116748_1268080568699187_3100398452053345518_n.jpg",
    alt: "Attendees attentively listening during an engaging leadership development module",
  },
  {
    src: "/assets/catalyst-gallery/616233471_1268080295365881_7557058301924341156_n.jpg",
    alt: "Seminar delegates participating in a structured outdoor team reflection activity",
  },
  {
    src: "/assets/catalyst-gallery/616368520_1268080855365825_4465401467840168462_n.jpg",
    alt: "Delegates taking notes during a strategic leadership training module",
  },
  {
    src: "/assets/catalyst-gallery/616439277_1268082045365706_8706912413091711333_n.jpg",
    alt: "Delegates taking part in an energetic icebreaker session at Catalyst",
  },
  {
    src: "/assets/catalyst-gallery/616463195_1268085945365316_7407533435333699472_n.jpg",
    alt: "Youth delegates collaborating on experiential learning tasks in a seminar circle",
  },
  {
    src: "/assets/catalyst-gallery/616492035_1268080355365875_606194234428780138_n.jpg",
    alt: "Attendees sharing leadership perspectives during a roundtable conversation",
  },
  {
    src: "/assets/catalyst-gallery/616529329_1268081438699100_5464235221991506990_n.jpg",
    alt: "AIESEC delegates cheering enthusiastically during a Catalyst plenary session",
  },
  {
    src: "/assets/catalyst-gallery/616849073_1268080215365889_1394999945882788592_n.jpg",
    alt: "Youth delegates collaborating on strategic problem-solving during a breakout session",
  },
  {
    src: "/assets/catalyst-gallery/616852935_1268091818698062_1811121035233834010_n.jpg",
    alt: "Delegates celebrating shared milestones during an evening seminar gathering",
  },
  {
    src: "/assets/catalyst-gallery/616856062_1268081038699140_5408968865674764265_n.jpg",
    alt: "Seminar attendees collaborating around a table during an interactive workshop",
  },
  {
    src: "/assets/catalyst-gallery/616938786_1268082428699001_1398486345666317073_n.jpg",
    alt: "Delegates smiling and connecting during a Catalyst team-building exercise",
  },
  {
    src: "/assets/catalyst-gallery/617017153_1268086832031894_3502562285613882645_n.jpg",
    alt: "Participants presenting their group leadership insights during a Catalyst debrief",
  },
  {
    src: "/assets/catalyst-gallery/617067996_1268080292032548_6936022336367251590_n.jpg",
    alt: "Young leaders listening attentively to fellow delegate presentations",
  },
  {
    src: "/assets/catalyst-gallery/617073686_1268080668699177_4597045561927655998_n.jpg",
    alt: "AIESEC in SLIIT delegates sharing personal growth takeaways during a workshop",
  },
  {
    src: "/assets/catalyst-gallery/617331461_1268082458698998_896025517703704603_n.jpg",
    alt: "Delegates celebrating with team spirit and enthusiasm during a Catalyst session",
  },
  {
    src: "/assets/catalyst-gallery/617463058_1268088075365103_8693645449087459401_n.jpg",
    alt: "Participants focused during an empowering leadership presentation",
  },
  {
    src: "/assets/catalyst-gallery/617690261_1268080958699148_3647200086711209687_n.jpg",
    alt: "Seminar delegates networking and building connections during a session transition",
  },
  {
    src: "/assets/catalyst-gallery/617989634_1268081025365808_4863939880060285824_n.jpg",
    alt: "Youth delegates participating in an experiential teamwork simulation",
  },
  {
    src: "/assets/catalyst-gallery/618023942_1268081702032407_3520266089466034488_n.jpg",
    alt: "Delegates taking notes during an interactive personal reflection module",
  },
  {
    src: "/assets/catalyst-gallery/618493767_1268092525364658_3596371227146674634_n.jpg",
    alt: "Delegates applauding peers during a team recognition moment at Catalyst",
  },
  {
    src: "/assets/catalyst-gallery/618825259_1268080638699180_784931987486560934_n.jpg",
    alt: "AIESEC members engaged in a lively team debate during a leadership module",
  },
  {
    src: "/assets/catalyst-gallery/619246052_1268080425365868_5507811270348967850_n.jpg",
    alt: "Attendees sharing smiles during an inspiring closing seminar session",
  },
]

// Desktop 3-column grouping from authentic seminar photos
const DESK_COL_1 = ALL_IMAGES.filter((_, i) => i % 3 === 0)
const DESK_COL_2 = ALL_IMAGES.filter((_, i) => i % 3 === 1)
const DESK_COL_3 = ALL_IMAGES.filter((_, i) => i % 3 === 2)

// Mobile 2-column grouping
const MOB_COL_1 = ALL_IMAGES.filter((_, i) => i % 2 === 0)
const MOB_COL_2 = ALL_IMAGES.filter((_, i) => i % 2 === 1)

// Photo Card styled for warm ivory backdrop with crisp shadows and subtle red tint
const PhotoCard = ({ item, index = 0 }: { item: GalleryImageItem; index?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-30px" }}
    transition={{ duration: 0.5, delay: (index % 4) * 0.06, ease: [0.22, 1, 0.36, 1] }}
    className="relative aspect-video w-full overflow-hidden rounded-lg sm:rounded-xl border border-[#E5DDD0] shadow-[0_4px_16px_rgba(37,35,33,0.06)] bg-white group transition-all duration-300 hover:shadow-[0_12px_28px_rgba(201,54,43,0.18)] hover:-translate-y-1"
  >
    <img
      src={item.src}
      alt={item.alt}
      loading="lazy"
      decoding="async"
      className="block h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
    />
    {/* Subtle warm ivory & crimson ambient tint */}
    <div
      className="pointer-events-none absolute inset-0 rounded-lg sm:rounded-xl transition-opacity duration-300 opacity-0 group-hover:opacity-75"
      style={{
        background: `radial-gradient(ellipse at center, ${GALLERY_CONFIG.colors.overlayWarm} 0%, ${GALLERY_CONFIG.colors.overlayRed} 100%)`,
      }}
      aria-hidden="true"
    />
  </motion.div>
)

// ============================================================================
// JAPANESE VECTOR ARTWORK ELEMENTS (Matching Reference Design Image)
// ============================================================================

/** Cherry Blossom Sakura Icon */
const SakuraIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* 5-Petal Cherry Blossom */}
    <path d="M12 2 C13.5 5 15.5 6 18.5 4.5 C17.5 7.5 18 9.5 21 10.5 C18.5 12 17.5 14 19 17 C16 16.5 14 17.5 13 20.5 C12 18 10 17 7 18.5 C8 15.5 7.5 13.5 4.5 12.5 C7 11 8 9 6.5 6 C9.5 6.5 11.5 5.5 12 2 Z" />
    <circle cx="12" cy="12" r="2.2" fill="#E9B9A5" />
  </svg>
)

/** Organic Japanese Sakura Cherry Blossom Petal */
const SakuraPetal = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Delicate Cherry Blossom Petal with Top Cleft */}
    <path
      d="M12 2 C16 7, 22 13, 21 21 C20 27, 15 30, 12 28 C9 30, 4 27, 3 21 C2 13, 8 7, 12 2 Z"
      fill="#C9362B"
      opacity="0.88"
    />
    <path
      d="M12 5 C14 10, 17 15, 16 22"
      stroke="#E9B9A5"
      strokeWidth="1.2"
      strokeLinecap="round"
      opacity="0.5"
    />
  </svg>
)

/** Lone Samurai Standing upon Rocky Cliff Peak Before the Red Sun (Expansive Left Flank) */
const SamuraiRedSunArt = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 720 640"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <defs>
      {/* Radiant Solid Samurai Red Sun */}
      <radialGradient id="sunGradientRefined" cx="45%" cy="45%" r="55%">
        <stop offset="0%" stopColor="#D94338" />
        <stop offset="70%" stopColor="#C9362B" />
        <stop offset="100%" stopColor="#A8251B" />
      </radialGradient>
      {/* Soft Mountain Fog Gradient at Base */}
      <linearGradient id="fogFadeLeft" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#F8F3E9" stopOpacity="0" />
        <stop offset="55%" stopColor="#F8F3E9" stopOpacity="0.75" />
        <stop offset="100%" stopColor="#F8F3E9" stopOpacity="1" />
      </linearGradient>
    </defs>

    {/* 1. Distant Layered Mountains in Muted Sage & Ink Wash (Filling the background flank) */}
    <path
      d="M0 460 C120 400, 240 430, 360 380 C480 330, 590 370, 720 330 L720 640 L0 640 Z"
      fill="#899783"
      opacity="0.25"
    />
    <path
      d="M0 500 C110 450, 220 480, 330 440 C440 400, 560 430, 720 390 L720 640 L0 640 Z"
      fill="#252321"
      opacity="0.22"
    />

    {/* 2. Large Bold Crimson Rising Sun (Clean, grand solid disc) */}
    <circle
      cx="285"
      cy="280"
      r="215"
      fill="url(#sunGradientRefined)"
      opacity="0.98"
      className="drop-shadow-[0_12px_36px_rgba(201,54,43,0.28)]"
    />

    {/* 3. Expansive Sumi-e Rocky Mountain Cliff Peak & Ridges (Spanning from left edge across) */}
    <path
      d="M-20 640 L-20 380 C40 370, 90 350, 140 355 C180 335, 210 295, 245 285 C270 280, 295 305, 320 315 C350 325, 380 315, 410 345 C460 390, 510 440, 570 490 C630 545, 670 590, 740 640 Z"
      fill="#252321"
    />
    {/* Rock Texture Lines & Crag Facets */}
    <path
      d="M245 285 L225 350 L200 420 L170 515 L140 640 M245 285 L270 355 L290 440 L310 530 L330 640 M140 355 L120 420 L100 500 L80 640 M320 315 L355 390 L390 470 L425 570 M410 345 L450 425 L490 515 L535 640"
      stroke="#191716"
      strokeWidth="2.5"
      strokeLinecap="round"
      opacity="0.5"
    />

    {/* 4. The Lone Samurai Silhouette in Ronin Attire perched on Cliff Peak */}
    <g transform="translate(192, 100)">
      {/* Jingasa Ronin Straw Hat */}
      <path
        d="M52 74 C40 65, 18 61, 0 67 C-18 73, -30 81, -34 86 C-28 87, 0 83, 16 82 C32 81, 56 83, 74 87 C70 83, 62 78, 52 74 Z"
        fill="#252321"
      />
      <path d="M-10 71 C2 57, 20 57, 32 71 Z" fill="#252321" />

      {/* Head, Collar & Scarf */}
      <path d="M8 73 C8 83, 18 83, 18 73 Z" fill="#252321" />
      <path d="M4 81 C12 79, 22 79, 26 82 L28 91 L2 91 Z" fill="#252321" />

      {/* Torso & Shoulders */}
      <path d="M2 91 C6 87, 24 87, 28 91 L36 135 L-4 135 Z" fill="#252321" />

      {/* Katana Sword & Scabbard extending back/down */}
      <path
        d="M20 127 L92 187"
        stroke="#252321"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M20 127 L105 197"
        stroke="#252321"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Tsuba guard & Tsuka hilt */}
      <circle cx="20" cy="127" r="4" fill="#252321" />
      <path d="M18 124 L6 113" stroke="#252321" strokeWidth="3.5" strokeLinecap="round" />

      {/* Arm holding katana */}
      <path d="M24 97 L30 117 L18 125" stroke="#252321" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Windswept Haori Cloak Billowing to Left in Natural Fabric Folds */}
      <path
        d="M2 91 C-16 104, -36 124, -56 149 C-44 143, -30 137, -14 133 C-30 151, -50 173, -70 199 C-48 189, -26 177, -6 164 C-20 184, -36 209, -52 237 C-32 219, -12 194, 2 169 L0 135 Z"
        fill="#252321"
      />

      {/* Hakama Robes & Legs in Strong Stance */}
      <path
        d="M-4 135 C-8 159, -10 184, -12 204 L4 204 C8 184, 10 164, 12 147 C14 164, 16 184, 20 204 L36 204 C34 184, 32 159, 30 135 Z"
        fill="#252321"
      />
    </g>

    {/* 5. Bottom Soft Fog Bleed to melt cleanly into warm ivory */}
    <rect x="-30" y="440" width="780" height="210" fill="url(#fogFadeLeft)" />
  </svg>
)

/** Traditional Japanese Pagoda, Pines & Misty Peaks (Expansive Right Flank) */
const JapanesePagodaLandscape = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 720 640"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="fogFadeRight" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#F8F3E9" stopOpacity="0" />
        <stop offset="55%" stopColor="#F8F3E9" stopOpacity="0.75" />
        <stop offset="100%" stopColor="#F8F3E9" stopOpacity="1" />
      </linearGradient>
    </defs>

    {/* 1. Distant Layered Mountains in Muted Sage Wash (Extending from center across to right edge) */}
    <path
      d="M0 470 C100 410, 200 430, 300 350 C400 270, 500 320, 600 230 C660 280, 690 260, 720 280 L720 640 L0 640 Z"
      fill="#899783"
      opacity="0.28"
    />
    <path
      d="M40 510 C140 450, 250 470, 350 390 C450 320, 540 360, 620 300 C670 340, 700 320, 720 340 L720 640 L40 640 Z"
      fill="#252321"
      opacity="0.32"
    />

    {/* 2. Foreground Mountain Slope & Hill */}
    <path
      d="M160 640 L260 510 C340 530, 410 490, 480 445 C550 405, 620 425, 680 465 L720 445 L720 640 Z"
      fill="#252321"
    />

    {/* 3. Multi-Tier Japanese Pagoda Castle Tower */}
    <g transform="translate(490, 255)" fill="#252321" opacity="0.88">
      {/* Finial Spire (Sorin) on Roof Top */}
      <rect x="58" y="0" width="4" height="42" />
      <circle cx="60" cy="8" r="4" />
      <circle cx="60" cy="18" r="3.5" />
      <circle cx="60" cy="28" r="3" />

      {/* Tier 5 Roof */}
      <path d="M35 52 C45 42, 75 42, 85 52 L80 56 L40 56 Z" />
      <rect x="48" y="56" width="24" height="12" />

      {/* Tier 4 Roof */}
      <path d="M26 74 C40 62, 80 62, 94 74 L88 78 L32 78 Z" />
      <rect x="44" y="78" width="32" height="15" />

      {/* Tier 3 Roof */}
      <path d="M16 100 C35 86, 85 86, 104 100 L96 105 L24 105 Z" />
      <rect x="40" y="105" width="40" height="18" />

      {/* Tier 2 Roof */}
      <path d="M6 130 C30 114, 90 114, 114 130 L104 136 L16 136 Z" />
      <rect x="36" y="136" width="48" height="22" />

      {/* Tier 1 Main Roof & Base */}
      <path d="M-6 168 C25 148, 95 148, 126 168 L116 175 L4 175 Z" />
      <rect x="30" y="175" width="60" height="30" />
      {/* Balcony Railing */}
      <line x1="28" y1="184" x2="92" y2="184" stroke="#F8F3E9" strokeWidth="1.5" />

      {/* Pagoda Base Foundation */}
      <path d="M20 205 L100 205 L112 245 L8 245 Z" />
    </g>

    {/* 4. Bonsai Pine Trees Surrounding Pagoda */}
    <g fill="#252321" opacity="0.9">
      {/* Pine 1 (Left of Pagoda) */}
      <path d="M430 520 C445 500, 435 460, 455 440 C460 435, 475 438, 480 445 C470 460, 475 490, 450 520 Z" />
      <ellipse cx="460" cy="440" rx="28" ry="12" />
      <ellipse cx="430" cy="460" rx="24" ry="10" />
      <ellipse cx="490" cy="470" rx="30" ry="11" />

      {/* Pine 2 (Right Foreground) */}
      <path d="M610 560 C620 530, 615 490, 635 460 C645 470, 635 510, 625 560 Z" />
      <ellipse cx="635" cy="460" rx="34" ry="13" />
      <ellipse cx="605" cy="485" rx="28" ry="10" />
      <ellipse cx="665" cy="500" rx="30" ry="11" />

      {/* Pine 3 (Far Right Peak) */}
      <path d="M680 500 C688 475, 698 450, 710 430" stroke="#252321" strokeWidth="4" />
      <ellipse cx="705" cy="430" rx="24" ry="9" />
      <ellipse cx="685" cy="450" rx="20" ry="8" />
    </g>

    {/* Soft Fog Gradient Bleed at Base */}
    <rect x="0" y="440" width="720" height="210" fill="url(#fogFadeRight)" />
  </svg>
)

// ============================================================================
// CINEMATIC TEXT REVEAL ZONE — WARM IVORY SUMI-E DESIGN
// ============================================================================
const TextRevealZone = () => {
  const ref = useRef<HTMLDivElement>(null)
  const shouldReduceMotion = useReducedMotion()
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" })
  const animate = isInView && !shouldReduceMotion ? "visible" : shouldReduceMotion ? "visible" : "hidden"

  return (
    <div
      ref={ref}
      className="relative w-full min-h-[92vh] sm:min-h-[95vh] flex flex-col justify-center items-center py-16 sm:py-24 md:py-32 px-5 sm:px-8 md:px-14 z-20 overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at 50% 38%, #FAF8F2 0%, #F8F3E9 60%, #F4ECE0 100%)",
      }}
    >
      {/* ── Desktop Samurai Leader: Pointing Katana toward "LEAD WITH PURPOSE" (Desktop Only) ── */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={animate === "visible" ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
        transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute left-0 xl:left-4 bottom-0 z-10 select-none hidden lg:flex items-end justify-start max-w-[380px] xl:max-w-[440px] h-auto transition-opacity"
        aria-hidden="true"
      >
        {/* Subtle Warm Crimson Halo */}
        <div
          className="absolute -inset-6 rounded-full blur-3xl opacity-40 pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(201, 54, 43, 0.22) 0%, transparent 70%)",
          }}
        />
        <img
          src="/assets/samurai/samurai-pointing.png"
          alt=""
          className="w-full h-auto object-contain filter drop-shadow-[0_16px_36px_rgba(37,35,33,0.22)]"
        />
      </motion.div>

      {/* ── Layer 2: Floating Organic Sakura Petals Drifting Across the Scene ── */}
      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden="true">
        {[
          { top: "16%", left: "36%", delay: "0s", dur: "7s", size: "w-3 sm:w-3.5 h-auto", rot: "-12deg" },
          { top: "32%", left: "68%", delay: "1.5s", dur: "8.5s", size: "w-2.5 sm:w-3 h-auto", rot: "24deg" },
          { top: "62%", left: "28%", delay: "3s", dur: "9s", size: "w-3 sm:w-3.5 h-auto", rot: "-35deg" },
          { top: "74%", left: "58%", delay: "2.2s", dur: "7.8s", size: "w-2 sm:w-2.5 h-auto", rot: "15deg" },
          { top: "22%", left: "82%", delay: "4s", dur: "10s", size: "w-3 sm:w-3.5 h-auto", rot: "45deg" },
          { top: "45%", left: "18%", delay: "1.8s", dur: "8.2s", size: "w-2.5 sm:w-3 h-auto", rot: "-20deg" },
          { top: "52%", left: "86%", delay: "3.5s", dur: "9.5s", size: "w-3 sm:w-3.5 h-auto", rot: "30deg" },
          { top: "82%", left: "38%", delay: "2.8s", dur: "7.5s", size: "w-2 sm:w-2.5 h-auto", rot: "-10deg" },
        ].map((pet, idx) => (
          <div
            key={idx}
            className={`absolute ${pet.size} animate-pulse transform`}
            style={{
              top: pet.top,
              left: pet.left,
              animationDuration: pet.dur,
              animationDelay: pet.delay,
              transform: `rotate(${pet.rot})`,
            }}
          >
            <SakuraPetal className="w-full h-auto" />
          </div>
        ))}
      </div>

      {/* ── Central Content Column (Mobile First) ── */}
      <div className="relative z-20 text-center max-w-[840px] mx-auto w-full flex flex-col items-center">

        {/* ── Eyebrow Badge with Sakura Icon & Horizontal Framing Rules ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={animate === "visible" ? { opacity: 1, y: 0 } : { opacity: 0, y: -16 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full flex items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-6"
        >
          <div className="hidden sm:block flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#252321]/20 to-[#252321]/35 max-w-[90px] md:max-w-[150px]" />
          <div className="inline-flex items-center gap-2 sm:gap-2.5 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full border border-[#252321]/30 bg-[#F8F3E9]/95 shadow-[0_2px_10px_rgba(37,35,33,0.05)] backdrop-blur-xs">
            <SakuraIcon className="w-3.5 h-3.5 text-[#C9362B] shrink-0" />
            <span
              className="text-[9.5px] sm:text-xs font-['Noto_Sans_JP',sans-serif] tracking-[0.2em] sm:tracking-[0.24em] uppercase font-bold text-[#252321]"
            >
              {GALLERY_CONFIG.content.eyebrow}
            </span>
          </div>
          <div className="hidden sm:block flex-1 h-[1px] bg-gradient-to-l from-transparent via-[#252321]/20 to-[#252321]/35 max-w-[90px] md:max-w-[150px]" />
        </motion.div>

        {/* ── Main Samurai Headline (Replicating Reference Design) ── */}
        <div className="relative w-full my-2 sm:my-3">
          {/* Line 1: LEAD WITH */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={animate === "visible" ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <span
              className="block font-serif text-[clamp(1.75rem,4.8vw,3.4rem)] font-extrabold uppercase tracking-[0.02em] leading-[0.98] text-[#252321]"
              style={{ fontFamily: GALLERY_CONFIG.fonts.heading }}
            >
              {GALLERY_CONFIG.content.headingLine1}
            </span>
          </motion.div>

          {/* Line 2: PURPOSE (Bold Samurai Red Calligraphy Style) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={animate === "visible" ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <span
              className="block font-serif italic text-[clamp(2.9rem,9.8vw,7.4rem)] font-black uppercase tracking-[-0.01em] leading-[0.88] my-1 sm:my-2 text-[#C9362B] drop-shadow-[0_4px_16px_rgba(201,54,43,0.18)]"
              style={{ fontFamily: GALLERY_CONFIG.fonts.heading }}
            >
              {GALLERY_CONFIG.content.headingLine2}
            </span>
          </motion.div>

          {/* Line 3: GROW THROUGH */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={animate === "visible" ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <span
              className="block font-serif text-[clamp(1.5rem,4.2vw,3rem)] font-extrabold uppercase tracking-[0.02em] leading-[0.98] text-[#252321]"
              style={{ fontFamily: GALLERY_CONFIG.fonts.heading }}
            >
              {GALLERY_CONFIG.content.headingLine3}
            </span>
          </motion.div>

          {/* Line 4: CONNECTION with Tapered Red Brush Underline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={animate === "visible" ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.65, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative inline-block"
          >
            <span
              className="block font-serif text-[clamp(2.4rem,8.2vw,6.2rem)] font-black uppercase tracking-[-0.01em] leading-[0.92] text-[#252321]"
              style={{ fontFamily: GALLERY_CONFIG.fonts.heading }}
            >
              {GALLERY_CONFIG.content.headingLine4}
            </span>

            {/* Authentic Red Brush Stroke Underline */}
            <svg
              viewBox="0 0 420 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-4 sm:h-6 mt-[-2px] sm:mt-[-4px]"
              aria-hidden="true"
            >
              <path
                d="M6 16 C45 10, 95 8, 150 9 C220 10, 290 8, 350 12 C385 14, 405 16, 416 13 C405 20, 370 21, 320 20 C240 18, 160 21, 90 20 C50 19, 20 20, 6 16 Z"
                fill="#C9362B"
              />
              <path
                d="M20 18 C80 15, 180 14, 280 16 C340 17, 390 18, 408 15"
                stroke="#C9362B"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.8"
              />
            </svg>
          </motion.div>
        </div>

        {/* ── Sakura Floral Divider ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={animate === "visible" ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-center gap-3 my-5 sm:my-7"
        >
          <span className="h-[1px] w-12 sm:w-20 bg-gradient-to-r from-transparent to-[#252321]/30" />
          <SakuraIcon className="w-4 h-4 text-[#C9362B]" />
          <span className="h-[1px] w-12 sm:w-20 bg-gradient-to-l from-transparent to-[#252321]/30" />
        </motion.div>

        {/* ── Body Description Paragraph ── */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={animate === "visible" ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.6, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="font-sans text-[clamp(0.95rem,1.15vw,1.08rem)] leading-[1.75] max-w-[580px] mx-auto text-[#252321]/85 mb-8 sm:mb-10 px-2"
          style={{ fontFamily: GALLERY_CONFIG.fonts.body }}
        >
          {GALLERY_CONFIG.content.paragraph}
        </motion.p>

        {/* ── Button Actions (Clean Pill Buttons with Plenty of Whitespace) ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={animate === "visible" ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.65, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full max-w-xs sm:max-w-none mx-auto"
        >
          {/* Primary CTA – "GET UPDATES →" */}
          <Button
            asChild
            className="w-full sm:w-auto min-h-[46px] px-8 sm:px-9 py-3.5 rounded-full font-sans font-bold text-xs sm:text-sm tracking-[0.2em] uppercase transition-all duration-300 ease-out shadow-[0_6px_22px_rgba(201,54,43,0.32)] hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(201,54,43,0.42)] active:translate-y-0 cursor-pointer"
            style={{
              backgroundColor: GALLERY_CONFIG.colors.samuraiRed,
              color: "#FFFFFF",
              fontFamily: GALLERY_CONFIG.fonts.body,
            }}
          >
            <a href={GALLERY_CONFIG.content.ctaUrl} className="inline-flex items-center justify-center gap-2">
              <span>{GALLERY_CONFIG.content.primaryButtonLabel}</span>
              <ArrowRight size={15} />
            </a>
          </Button>

          {/* Secondary CTA – "LEARN MORE" */}
          <a
            href={GALLERY_CONFIG.content.secondaryButtonHref}
            className="w-full sm:w-auto min-h-[46px] inline-flex items-center justify-center px-8 sm:px-9 py-3.5 rounded-full border border-[#252321]/80 hover:bg-[#252321] hover:text-[#F8F3E9] font-sans text-xs sm:text-sm font-bold tracking-[0.2em] uppercase text-[#252321] transition-all duration-300 active:translate-y-0 cursor-pointer"
            style={{ fontFamily: GALLERY_CONFIG.fonts.body }}
          >
            <span>{GALLERY_CONFIG.content.secondaryButtonLabel}</span>
          </a>
        </motion.div>

        {/* ── Mobile Samurai Leader Presentation (Mobile & Tablet Only) ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={animate === "visible" ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.8, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex lg:hidden flex-col items-center justify-center mt-10 sm:mt-12 select-none pointer-events-none"
          aria-hidden="true"
        >
          <div className="relative max-w-[210px] sm:max-w-[270px] h-auto">
            <div
              className="absolute -inset-4 rounded-full blur-2xl opacity-40 pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(201, 54, 43, 0.25) 0%, transparent 70%)",
              }}
            />
            <img
              src="/assets/samurai/samurai-pointing.png"
              alt="Catalyst 7.0 Samurai Leader"
              className="w-full h-auto object-contain filter drop-shadow-[0_16px_32px_rgba(37,35,33,0.22)]"
            />
          </div>
          <div className="flex items-center gap-2.5 mt-3.5 text-[9.5px] sm:text-[11px] font-['Noto_Sans_JP',sans-serif] tracking-[0.25em] text-[#C9362B] uppercase font-bold">
            <span className="w-6 sm:w-8 h-[1px] bg-[#C9362B]/40" />
            <span>武士の道 · LEAD WITH PURPOSE</span>
            <span className="w-6 sm:w-8 h-[1px] bg-[#C9362B]/40" />
          </div>
        </motion.div>

      </div>
    </div>
  )
}

// ============================================================================
// MAIN EXPORTED SECTION
// ============================================================================
export const DemoVariant1 = () => {
  const isMobile = useIsMobile()

  return (
    <section
      className="relative w-full"
      style={{ backgroundColor: GALLERY_CONFIG.colors.mainBg }}
      aria-label="Catalyst 7.0 Leadership Showcase"
    >
      {/* ── CINEMATIC WARM IVORY INTRO ZONE (Matching Reference Design) ── */}
      <TextRevealZone />

      {/* ── RESPONSIVE FULL-PICTURE SHOWCASE GALLERY (All images 100% visible at bottom) ── */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 pb-16 sm:pb-24">
        {isMobile ? (
          /* MOBILE: 2-Column Staggered Grid */
          <div className="grid grid-cols-2 gap-3 sm:gap-4 items-start">
            <div className="flex flex-col gap-3 sm:gap-4">
              {MOB_COL_1.map((item, index) => (
                <PhotoCard key={`mob-1-${index}`} item={item} index={index} />
              ))}
            </div>
            <div className="flex flex-col gap-3 sm:gap-4 pt-4 sm:pt-6">
              {MOB_COL_2.map((item, index) => (
                <PhotoCard key={`mob-2-${index}`} item={item} index={index} />
              ))}
            </div>
          </div>
        ) : (
          /* DESKTOP: 3-Column Editorial Staggered Grid */
          <div className="grid grid-cols-3 gap-4 sm:gap-5 lg:gap-6 items-start">
            <div className="flex flex-col gap-4 sm:gap-5 lg:gap-6">
              {DESK_COL_1.map((item, index) => (
                <PhotoCard key={`desk-1-${index}`} item={item} index={index} />
              ))}
            </div>
            <div className="flex flex-col gap-4 sm:gap-5 lg:gap-6 pt-8 lg:pt-12">
              {DESK_COL_2.map((item, index) => (
                <PhotoCard key={`desk-2-${index}`} item={item} index={index} />
              ))}
            </div>
            <div className="flex flex-col gap-4 sm:gap-5 lg:gap-6 pt-4 lg:pt-6">
              {DESK_COL_3.map((item, index) => (
                <PhotoCard key={`desk-3-${index}`} item={item} index={index} />
              ))}
            </div>
          </div>
        )}

        {/* ── Bottom Section Editorial Anchor (Clean, elegant handoff to next section) ── */}
        <div className="w-full flex flex-col items-center justify-center pt-14 sm:pt-20 text-center select-none">
          <div className="flex items-center gap-3 sm:gap-4 mb-3">
            <div className="w-10 sm:w-16 h-[1px] bg-[#252321]/20" />
            <SakuraIcon className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#C9362B]" />
            <div className="w-10 sm:w-16 h-[1px] bg-[#252321]/20" />
          </div>
          <p className="font-['Noto_Sans_JP',sans-serif] text-[10px] sm:text-xs tracking-[0.25em] uppercase font-bold text-[#252321]/60">
            CATALYST 7.0 · MOMENTS OF LEADERSHIP
          </p>
          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 rounded-full border border-[#252321]/40 bg-[#FAF6EE] hover:bg-[#252321] hover:text-[#FAF6EE] text-[#252321] font-['Montserrat',sans-serif] text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase transition-all shadow-xs cursor-pointer group"
          >
            <span>ENTER FULL SCROLL GALLERY</span>
            <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default DemoVariant1
