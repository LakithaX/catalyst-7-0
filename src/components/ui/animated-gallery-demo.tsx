import React, { useRef } from "react"
import { Link } from "react-router-dom"
import { useIsMobile } from "@/components/blocks/animated-gallery"
import { Button } from "@/components/ui/button"
import { motion, useInView, useReducedMotion } from "motion/react"
import { ArrowRight } from "lucide-react"

// ============================================================================
// JAPANESE SUMI-E DESIGN SYSTEM (Warm Ivory, Samurai Red, Ink Black)
// ============================================================================
const GALLERY_CONFIG = {
  colors: {
    mainBg: "#F8F3E9",
    samuraiRed: "#C9362B",
    inkBlack: "#252321",
    mutedSage: "#899783",
    softPeach: "#E9B9A5",
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

// ============================================================================
// FONTS (self-hosted from /public/fonts)
// Add these @font-face rules to src/index.css:
//
// @font-face { font-family: "Brusher";    src: url("/fonts/Brusher.ttf") format("truetype");    font-display: swap; }
// @font-face { font-family: "Shinkansen"; src: url("/fonts/shinkansen.otf") format("opentype"); font-display: swap; }
// @font-face { font-family: "Akashii";    src: url("/fonts/Akashii-ywOVm.ttf") format("truetype"); font-display: swap; }
// @font-face { font-family: "Osaka Bright"; src: url("/fonts/OsakaBrightDemoRegular.otf") format("opentype"); font-display: swap; }
//
// Swap guide: change SUBHEADING_FONT to 'Akashii' (traditional) or 'Osaka Bright' (modern).
// ============================================================================
const HEADING_FONT = "'Brusher', 'Shippori Mincho', 'Noto Serif JP', serif"
const SUBHEADING_FONT = "'Shinkansen', 'Brusher', 'Noto Serif JP', serif"

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

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

// Desktop 3-column grouping
const DESK_COL_1 = ALL_IMAGES.filter((_, i) => i % 3 === 0)
const DESK_COL_2 = ALL_IMAGES.filter((_, i) => i % 3 === 1)
const DESK_COL_3 = ALL_IMAGES.filter((_, i) => i % 3 === 2)

// Mobile 2-column grouping
const MOB_COL_1 = ALL_IMAGES.filter((_, i) => i % 2 === 0)
const MOB_COL_2 = ALL_IMAGES.filter((_, i) => i % 2 === 1)

// ============================================================================
// PHOTO CARD
// ============================================================================
const PhotoCard = ({ item, index = 0 }: { item: GalleryImageItem; index?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-30px" }}
    transition={{ duration: 0.5, delay: (index % 4) * 0.06, ease: EASE }}
    className="relative aspect-video w-full overflow-hidden rounded-lg sm:rounded-xl border border-[#E5DDD0] shadow-[0_4px_16px_rgba(37,35,33,0.06)] bg-white group transition-all duration-300 hover:shadow-[0_12px_28px_rgba(201,54,43,0.18)] hover:-translate-y-1"
  >
    <img
      src={item.src}
      alt={item.alt}
      loading="lazy"
      decoding="async"
      className="block h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
    />
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
// ICONS
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
    <path d="M12 2 C13.5 5 15.5 6 18.5 4.5 C17.5 7.5 18 9.5 21 10.5 C18.5 12 17.5 14 19 17 C16 16.5 14 17.5 13 20.5 C12 18 10 17 7 18.5 C8 15.5 7.5 13.5 4.5 12.5 C7 11 8 9 6.5 6 C9.5 6.5 11.5 5.5 12 2 Z" />
    <circle cx="12" cy="12" r="2.2" fill="#E9B9A5" />
  </svg>
)

/** Organic Sakura Petal */
const SakuraPetal = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
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

// ============================================================================
// INTRO ZONE: LEAD WITH PURPOSE / GROW THROUGH CONNECTION
// ============================================================================
const PETALS = [
  { top: "14%", left: "46%", size: 14, delay: 0 },
  { top: "30%", left: "90%", size: 12, delay: 1.5 },
  { top: "68%", left: "44%", size: 14, delay: 3 },
  { top: "80%", left: "70%", size: 11, delay: 2.2 },
  { top: "18%", left: "70%", size: 13, delay: 4 },
  { top: "55%", left: "94%", size: 12, delay: 3.5 },
]

const TextRevealZone = () => {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const inView = useInView(ref, { once: true, margin: "-10% 0px" })
  const show = inView || !!reduce

  const rise = (delay = 0, y = 20) => ({
    initial: { opacity: 0, y },
    animate: show ? { opacity: 1, y: 0 } : { opacity: 0, y },
    transition: { duration: 0.65, delay, ease: EASE },
  })

  return (
    <div
      ref={ref}
      className="relative z-20 w-full overflow-hidden px-5 py-20 sm:px-8 sm:py-28 lg:py-32"
      style={{
        background:
          "radial-gradient(ellipse at 30% 40%, #FAF8F2 0%, #F8F3E9 60%, #F4ECE0 100%)",
      }}
    >
      {/* Kanji watermark (永), behind everything. Stays on Noto Serif JP for kanji support. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 top-1/2 z-0 -translate-y-1/2 select-none text-[22rem] leading-none text-[#252321] opacity-[0.05] lg:text-[34rem]"
        style={{ fontFamily: "'Noto Serif JP', serif" }}
      >
        永
      </span>

      {/* Petals: behind content (z-0), gently drifting */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        {PETALS.map((p, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ top: p.top, left: p.left, width: p.size }}
            animate={
              reduce
                ? undefined
                : { y: [0, 28, 0], x: [0, 10, 0], rotate: [0, 25, 0] }
            }
            transition={{
              duration: 8 + i,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <SakuraPetal className="h-auto w-full" />
          </motion.div>
        ))}
      </div>

      {/* Two-column grid: art | text. Nothing can overlap. */}
      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        {/* ── Koi ── */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={show ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
          transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
          className="pointer-events-none mx-auto w-full max-w-[260px] select-none sm:max-w-[320px] lg:max-w-none"
          aria-hidden="true"
        >
          <motion.div
            animate={reduce ? undefined : { y: [0, -12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            {/* soft red glow, circular, behind the art */}
            <div
              className="absolute inset-[8%] rounded-full opacity-50 blur-3xl"
              style={{ background: "rgba(201,54,43,0.30)" }}
            />
            <img
              src="/assets/illustrations/benkageyama-coy-5135969_1920.png"
              alt=""
              className="relative h-auto w-full object-contain"
              style={{
                /* feather the square edges so the baked-in background disappears */
                WebkitMaskImage:
                  "radial-gradient(ellipse 62% 62% at 50% 52%, #000 85%, transparent 100%)",
                maskImage:
                  "radial-gradient(ellipse 62% 62% at 50% 52%, #000 85%, transparent 100%)",
                /* knocks out near-white background against the ivory page */
                mixBlendMode: "multiply",
              }}
            />
          </motion.div>
        </motion.div>

        {/* ── Text ── */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          {/* Eyebrow */}
          <motion.div
            {...rise(0, -14)}
            className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-[#252321]/30 bg-[#F8F3E9]/95 px-4 py-1.5 sm:px-5 sm:py-2"
          >
            <SakuraIcon className="h-3.5 w-3.5 shrink-0 text-[#C9362B]" />
            <span
              className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-[#252321] sm:text-xs sm:tracking-[0.24em]"
              style={{ fontFamily: GALLERY_CONFIG.fonts.label }}
            >
              {GALLERY_CONFIG.content.eyebrow}
            </span>
          </motion.div>

          {/* Headline: brush lockup (Brusher for big words, Shinkansen for lead-ins) */}
          <h2 className="uppercase leading-[1.05] tracking-[0.04em]">
            <motion.span
              {...rise(0.1)}
              className="block text-[clamp(1.5rem,3vw,2.25rem)] tracking-[0.12em] text-[#252321]"
              style={{ fontFamily: SUBHEADING_FONT }}
            >
              {GALLERY_CONFIG.content.headingLine1}
            </motion.span>
            <motion.span
              {...rise(0.2)}
              className="block text-[clamp(3.25rem,7.5vw,6rem)] text-[#C9362B]"
              style={{ fontFamily: HEADING_FONT }}
            >
              {GALLERY_CONFIG.content.headingLine2}
            </motion.span>
            <motion.span
              {...rise(0.3)}
              className="mt-2 block text-[clamp(1.5rem,3vw,2.25rem)] tracking-[0.12em] text-[#252321]"
              style={{ fontFamily: SUBHEADING_FONT }}
            >
              {GALLERY_CONFIG.content.headingLine3}
            </motion.span>
            <motion.span
              {...rise(0.4)}
              className="relative inline-block text-[clamp(2.5rem,5.6vw,4.5rem)] text-[#252321]"
              style={{ fontFamily: HEADING_FONT }}
            >
              {GALLERY_CONFIG.content.headingLine4}
              <svg
                viewBox="0 0 420 28"
                fill="none"
                className="mt-[-2px] block h-4 w-full sm:h-5"
                aria-hidden="true"
              >
                <path
                  d="M6 16 C45 10, 95 8, 150 9 C220 10, 290 8, 350 12 C385 14, 405 16, 416 13 C405 20, 370 21, 320 20 C240 18, 160 21, 90 20 C50 19, 20 20, 6 16 Z"
                  fill="#C9362B"
                />
              </svg>
            </motion.span>
          </h2>

          {/* Divider */}
          <motion.div {...rise(0.5, 0)} className="my-7 flex items-center gap-3">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#252321]/30 sm:w-20" />
            <SakuraIcon className="h-4 w-4 text-[#C9362B]" />
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#252321]/30 sm:w-20" />
          </motion.div>

          {/* Body */}
          <motion.p
            {...rise(0.55, 16)}
            className="mb-9 max-w-[55ch] text-[clamp(1.05rem,1.3vw,1.25rem)] leading-[1.7] text-[#252321]/90"
            style={{ fontFamily: GALLERY_CONFIG.fonts.body }}
          >
            {GALLERY_CONFIG.content.paragraph}
          </motion.p>

          {/* CTAs */}
          <motion.div
            {...rise(0.65, 16)}
            className="flex w-full max-w-xs flex-col items-center gap-4 sm:max-w-none sm:flex-row sm:gap-5 lg:justify-start"
          >
            <Button
              asChild
              className="min-h-[46px] w-full cursor-pointer rounded-full px-9 py-3.5 text-xs font-bold uppercase tracking-[0.2em] shadow-[0_6px_22px_rgba(201,54,43,0.32)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(201,54,43,0.42)] sm:w-auto sm:text-sm"
              style={{
                backgroundColor: GALLERY_CONFIG.colors.samuraiRed,
                color: "#FFFFFF",
                fontFamily: GALLERY_CONFIG.fonts.body,
              }}
            >
              <a
                href={GALLERY_CONFIG.content.ctaUrl}
                className="inline-flex items-center justify-center gap-2"
              >
                <span>{GALLERY_CONFIG.content.primaryButtonLabel}</span>
                <ArrowRight size={15} />
              </a>
            </Button>

            <a
              href={GALLERY_CONFIG.content.secondaryButtonHref}
              className="inline-flex min-h-[46px] w-full cursor-pointer items-center justify-center rounded-full border border-[#252321]/80 px-9 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-[#252321] transition-all duration-300 hover:bg-[#252321] hover:text-[#F8F3E9] sm:w-auto sm:text-sm"
              style={{ fontFamily: GALLERY_CONFIG.fonts.body }}
            >
              {GALLERY_CONFIG.content.secondaryButtonLabel}
            </a>
          </motion.div>
        </div>
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
      {/* Intro zone */}
      <TextRevealZone />

      {/* Photo gallery */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 pb-16 sm:pb-24">
        {isMobile ? (
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

        {/* Bottom anchor */}
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