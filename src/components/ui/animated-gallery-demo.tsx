import React, { useLayoutEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ArrowRight } from "lucide-react"

gsap.registerPlugin(ScrollTrigger)
ScrollTrigger.config({ ignoreMobileResize: true })

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
    body: "'Inter', system-ui, -apple-system, sans-serif",
    label: "'Noto Sans JP', 'Montserrat', sans-serif",
    kanji: "'Noto Serif JP', serif",
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

// Brush heading font, loaded from /public/fonts via @font-face in index.css:
//   @font-face { font-family: "Jansina"; src: url("/fonts/JANSINA.ttf") format("truetype"); font-display: swap; }
//   @font-face { font-family: "Brusher"; src: url("/fonts/Brusher.ttf") format("truetype"); font-display: swap; }
const HEADING_FONT = "'Jansina', 'Brusher', 'Shippori Mincho', serif"

const PILLARS = [
  {
    kanji: "導",
    title: "Lead",
    body: "Find the courage to act on what you believe in, and take others with you.",
  },
  {
    kanji: "育",
    title: "Grow",
    body: "Learn by doing, reflecting and being challenged by people who see things differently.",
  },
  {
    kanji: "縁",
    title: "Connect",
    body: "Meet the people who will shape how you think about leadership long after the forum.",
  },
]

const MARQUEE_PHRASES = [
  "LEAD WITH PURPOSE",
  "GROW THROUGH CONNECTION",
  "CATALYST 7.0",
]

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

// 12 columns of 2 photos each, used by the horizontal scroll gallery
const COLUMNS: GalleryImageItem[][] = Array.from({ length: 12 }, (_, c) => [
  ALL_IMAGES[c * 2],
  ALL_IMAGES[c * 2 + 1],
])

const TILTS = ["-rotate-1", "rotate-1", "rotate-[0.6deg]", "-rotate-[0.8deg]"]

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

/** Splits text into per-character spans so GSAP can stagger them */
const SplitChars = ({ text }: { text: string }) => (
  <span aria-label={text} className="whitespace-nowrap">
    {Array.from(text).map((ch, i) => (
      <span
        key={i}
        aria-hidden="true"
        className="char inline-block will-change-transform"
      >
        {ch === " " ? "\u00A0" : ch}
      </span>
    ))}
  </span>
)

// ============================================================================
// GALLERY CARD: paper-mounted photo with a red hanko stamp
// (outer figure is animated by GSAP; the inner layers keep CSS tilt + hover)
// ============================================================================
const GalleryCard = ({ item, n }: { item: GalleryImageItem; n: number }) => (
  <figure className="gallery-card m-0 w-[min(78vw,42vh)] shrink-0">
    <div className={`group ${TILTS[n % TILTS.length]}`}>
      <div className="relative overflow-hidden rounded-[3px] bg-[#FBF8F1] p-2 shadow-[0_18px_40px_rgba(37,35,33,0.18)] ring-1 ring-[#252321]/10 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_26px_50px_rgba(201,54,43,0.28)] sm:p-3">
        <div className="relative aspect-[4/3] overflow-hidden">
          <div className="parallax-img absolute inset-y-0 -inset-x-[8%] will-change-transform">
            <img
              src={item.src}
              alt={item.alt}
              loading="lazy"
              decoding="async"
              draggable={false}
              className="block h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none"
            />
          </div>
          <span
            aria-hidden="true"
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-[3px] bg-[#C9362B] text-[10px] font-bold tracking-wider text-[#F8F3E9] shadow-md"
            style={{ fontFamily: GALLERY_CONFIG.fonts.label }}
          >
            {String(n + 1).padStart(2, "0")}
          </span>
        </div>
      </div>
    </div>
  </figure>
)

// ============================================================================
// INTRO ZONE
// ============================================================================
const PETALS = [
  { top: "14%", left: "46%", size: 14 },
  { top: "30%", left: "90%", size: 12 },
  { top: "68%", left: "44%", size: 14 },
  { top: "80%", left: "70%", size: 11 },
  { top: "18%", left: "70%", size: 13 },
  { top: "55%", left: "94%", size: 12 },
]

const TextRevealZone = ({ active }: { active: boolean }) => {
  const rootRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || !active) return

    const mm = gsap.matchMedia()

    mm.add(
      "(prefers-reduced-motion: no-preference)",
      () => {
        const q = gsap.utils.selector(root)

        // ---- Main entrance timeline (plays when the section scrolls into view)
        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: { trigger: root, start: "top 70%", once: true },
        })

        tl.from(q(".koi-wrap"), {
          opacity: 0,
          x: -70,
          scale: 0.92,
          duration: 1.3,
        })
          .fromTo(
            q(".enso path"),
            { strokeDashoffset: 1 },
            { strokeDashoffset: 0, duration: 2, ease: "power2.inOut" },
            0.3
          )
          .from(q(".eyebrow"), { opacity: 0, y: -18, duration: 0.8 }, 0.2)

        const lines = gsap.utils.toArray<HTMLElement>(".heading-line", root)
        lines.forEach((line, i) => {
          tl.from(
            line.querySelectorAll(".char"),
            {
              opacity: 0,
              y: 55,
              rotate: 6,
              duration: 0.9,
              stagger: 0.035,
              ease: i === 1 ? "back.out(1.7)" : "power3.out",
            },
            0.45 + i * 0.22
          )
        })

        tl.from(
          q(".brush-underline"),
          {
            scaleX: 0,
            transformOrigin: "left center",
            duration: 1,
            ease: "power2.out",
          },
          ">-0.35"
        )
          .from(q(".divider"), { opacity: 0, scaleX: 0.4, duration: 0.7 }, "<0.1")
          .from(q(".body-copy"), { opacity: 0, y: 20, duration: 0.8 }, "<0.1")
          .from(
            q(".cta"),
            { opacity: 0, y: 20, stagger: 0.12, duration: 0.7 },
            "<0.15"
          )

        // ---- Idle motion
        gsap.to(q(".koi-float"), {
          y: -14,
          duration: 3.2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        })

        gsap.to(q(".enso"), {
          rotate: 360,
          duration: 90,
          ease: "none",
          repeat: -1,
          transformOrigin: "50% 50%",
        })

        q(".petal").forEach((petal, i) => {
          gsap.fromTo(
            petal,
            { opacity: 0 },
            { opacity: 1, duration: 1.2, delay: 0.8 + i * 0.2 }
          )
          gsap.to(petal, {
            y: gsap.utils.random(24, 40),
            x: gsap.utils.random(-14, 16),
            rotation: gsap.utils.random(-30, 30),
            duration: 4 + i * 0.8,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            delay: i * 0.4,
          })
        })

        // ---- Scroll parallax on the kanji watermark
        gsap.to(q(".kanji-mark"), {
          yPercent: -14,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        })

        // ---- Pillar cards
        gsap.from(q(".pillar"), {
          opacity: 0,
          y: 50,
          duration: 0.9,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: { trigger: q(".pillars")[0], start: "top 88%", once: true },
        })
      },
      root
    )

    return () => mm.revert()
  }, [active])

  return (
    <div
      ref={rootRef}
      className="relative z-20 w-full overflow-hidden px-5 py-20 sm:px-8 sm:py-28 lg:py-32"
      style={{
        background:
          "radial-gradient(ellipse at 30% 40%, #FAF8F2 0%, #F8F3E9 60%, #F4ECE0 100%)",
      }}
    >
      {/* Kanji watermark (永), behind everything */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 top-1/2 z-0 -translate-y-1/2 select-none"
      >
        <span
          className="kanji-mark block text-[22rem] leading-none text-[#252321] opacity-[0.05] lg:text-[34rem]"
          style={{ fontFamily: GALLERY_CONFIG.fonts.kanji }}
        >
          永
        </span>
      </div>

      {/* Petals */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        {PETALS.map((p, i) => (
          <div
            key={i}
            className="petal absolute"
            style={{ top: p.top, left: p.left, width: p.size }}
          >
            <SakuraPetal className="h-auto w-full" />
          </div>
        ))}
      </div>

      {/* Two-column grid: art | text */}
      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        {/* ── Koi ── */}
        <div
          className="koi-wrap pointer-events-none mx-auto w-full max-w-[260px] select-none sm:max-w-[320px] lg:max-w-none"
          aria-hidden="true"
        >
          <div className="koi-float relative">
            {/* soft red glow behind the art */}
            <div
              className="absolute inset-[8%] rounded-full opacity-50 blur-3xl"
              style={{ background: "rgba(201,54,43,0.30)" }}
            />

            {/* hand-drawn ink enso ring that draws itself around the koi */}
            <svg
              viewBox="0 0 100 100"
              fill="none"
              className="enso absolute -inset-[4%] h-[108%] w-[108%]"
            >
              <path
                d="M50 5 C78 3, 97 25, 95 52 C93 79, 70 97, 45 95 C21 93, 4 72, 6 46 C8 22, 27 8, 56 8"
                pathLength={1}
                strokeDasharray={1}
                stroke="#252321"
                strokeWidth="1.1"
                strokeLinecap="round"
                opacity="0.75"
              />
            </svg>

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
          </div>
        </div>

        {/* ── Text ── */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          {/* Eyebrow */}
          <div className="eyebrow mb-6 inline-flex items-center gap-2.5 rounded-full border border-[#252321]/30 bg-[#F8F3E9]/95 px-4 py-1.5 sm:px-5 sm:py-2">
            <img src="/assets/brand/catalyst-mark-128.webp" alt="" aria-hidden="true" width={22} height={22} decoding="async" draggable={false} className="h-[22px] w-[22px] shrink-0 select-none object-contain" />
            <span
              className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-[#252321] sm:text-xs sm:tracking-[0.24em]"
              style={{ fontFamily: GALLERY_CONFIG.fonts.label }}
            >
              {GALLERY_CONFIG.content.eyebrow}
            </span>
          </div>

          {/* Headline: brush-style lockup */}
          <h2
            className="leading-[1.05] tracking-[0.03em]"
            style={{ fontFamily: HEADING_FONT }}
          >
            <span className="heading-line block text-[clamp(1.5rem,3vw,2.25rem)] text-[#252321]">
              <SplitChars text={GALLERY_CONFIG.content.headingLine1} />
            </span>
            <span className="heading-line block text-[clamp(3.25rem,7.5vw,6rem)] text-[#C9362B]">
              <SplitChars text={GALLERY_CONFIG.content.headingLine2} />
            </span>
            <span className="heading-line mt-2 block text-[clamp(1.5rem,3vw,2.25rem)] text-[#252321]">
              <SplitChars text={GALLERY_CONFIG.content.headingLine3} />
            </span>
            <span className="heading-line relative inline-block text-[clamp(2.5rem,5.6vw,4.5rem)] text-[#252321]">
              <SplitChars text={GALLERY_CONFIG.content.headingLine4} />
              <svg
                viewBox="0 0 420 28"
                fill="none"
                className="brush-underline mt-[-2px] block h-4 w-full sm:h-5"
                aria-hidden="true"
              >
                <path
                  d="M6 16 C45 10, 95 8, 150 9 C220 10, 290 8, 350 12 C385 14, 405 16, 416 13 C405 20, 370 21, 320 20 C240 18, 160 21, 90 20 C50 19, 20 20, 6 16 Z"
                  fill="#C9362B"
                />
              </svg>
            </span>
          </h2>

          {/* Divider */}
          <div className="divider my-7 flex items-center gap-3">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#252321]/30 sm:w-20" />
            <SakuraIcon className="h-4 w-4 text-[#C9362B]" />
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#252321]/30 sm:w-20" />
          </div>

          {/* Body */}
          <p
            className="body-copy mb-9 max-w-[55ch] text-[clamp(1.05rem,1.3vw,1.25rem)] leading-[1.7] text-[#252321]/90"
            style={{ fontFamily: GALLERY_CONFIG.fonts.body }}
          >
            {GALLERY_CONFIG.content.paragraph}
          </p>

          {/* CTAs */}
          <div className="flex w-full max-w-xs flex-col items-center gap-4 sm:max-w-none sm:flex-row sm:gap-5 lg:justify-start">
            <div className="cta w-full sm:w-auto">
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
            </div>

            <div className="cta w-full sm:w-auto">
              <a
                href={GALLERY_CONFIG.content.secondaryButtonHref}
                className="inline-flex min-h-[46px] w-full cursor-pointer items-center justify-center rounded-full border border-[#252321]/80 px-9 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-[#252321] transition-all duration-300 hover:bg-[#252321] hover:text-[#F8F3E9] sm:w-auto sm:text-sm"
                style={{ fontFamily: GALLERY_CONFIG.fonts.body }}
              >
                {GALLERY_CONFIG.content.secondaryButtonLabel}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Pillars: fills the space under the hero */}
      <div className="pillars relative z-10 mx-auto mt-16 grid max-w-6xl gap-5 sm:mt-24 md:grid-cols-3">
        {PILLARS.map((p) => (
          <div
            key={p.title}
            className="pillar group relative overflow-hidden rounded-2xl border border-[#252321]/15 bg-[#FAF6EE]/80 p-7 transition-colors duration-300 hover:border-[#C9362B]/50"
          >
            <span
              aria-hidden="true"
              className="absolute -right-2 -top-5 select-none text-[8rem] leading-none text-[#C9362B]/10 transition-transform duration-500 group-hover:scale-110 motion-reduce:transition-none"
              style={{ fontFamily: GALLERY_CONFIG.fonts.kanji }}
            >
              {p.kanji}
            </span>
            <h3
              className="relative text-4xl text-[#252321]"
              style={{ fontFamily: HEADING_FONT }}
            >
              {p.title}
            </h3>
            <p
              className="relative mt-3 max-w-[34ch] text-sm leading-relaxed text-[#252321]/75 sm:text-base"
              style={{ fontFamily: GALLERY_CONFIG.fonts.body }}
            >
              {p.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// MARQUEE BAND
// ============================================================================
const MarqueeBand = () => {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const mm = gsap.matchMedia()
    mm.add(
      "(prefers-reduced-motion: no-preference)",
      () => {
        const track = el.querySelector(".marquee-track")
        if (!track) return
        gsap.to(track, {
          xPercent: -50,
          duration: 30,
          ease: "none",
          repeat: -1,
        })
      },
      el
    )

    return () => mm.revert()
  }, [])

  const group = (key: string) => (
    <div key={key} className="flex shrink-0 items-center" aria-hidden="true">
      {[...MARQUEE_PHRASES, ...MARQUEE_PHRASES].map((phrase, i) => (
        <div key={i} className="flex items-center">
          <span
            className="px-6 text-[clamp(1.5rem,3vw,2.5rem)] leading-none text-[#F8F3E9] sm:px-10"
            style={{ fontFamily: HEADING_FONT }}
          >
            {phrase}
          </span>
          <SakuraIcon className="h-5 w-5 shrink-0 text-[#E9B9A5]" />
        </div>
      ))}
    </div>
  )

  return (
    <div
      ref={ref}
      className="relative z-20 w-full overflow-hidden py-4 sm:py-5"
      style={{ backgroundColor: GALLERY_CONFIG.colors.samuraiRed }}
      role="presentation"
    >
      <div className="marquee-track flex w-max items-center">
        {group("a")}
        {group("b")}
      </div>
    </div>
  )
}

// ============================================================================
// MAIN EXPORTED SECTION
// ============================================================================

/**
 * `active` must be false while HomePage still shows this section inside the fixed,
 * off-screen "curtain", and true once it is in normal page flow. ScrollTrigger
 * measures positions when it is created, so creating it too early breaks pins.
 */
export const DemoVariant1 = ({ active = true }: { active?: boolean }) => {
  const flowRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const flow = flowRef.current
    if (!flow || !active) return

    const mm = gsap.matchMedia()
    mm.add(
      "(prefers-reduced-motion: no-preference)",
      () => {
        const pin = flow.querySelector<HTMLElement>(".gallery-pin")
        const track = flow.querySelector<HTMLElement>(".gallery-track")
        if (!pin || !track) return
        const q = gsap.utils.selector(flow)
        const dist = () => Math.max(0, track.scrollWidth - pin.clientWidth)

        // ---- 1. Pinned horizontal scroll: the photos glide past like an emakimono scroll
        const scrollTween = gsap.to(track, {
          x: () => -dist(),
          ease: "none",
          scrollTrigger: {
            trigger: pin,
            start: "top top",
            end: () => "+=" + dist(),
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })

        const sync = () => ({
          trigger: pin,
          start: "top top",
          end: () => "+=" + dist(),
          scrub: true,
          invalidateOnRefresh: true,
        })
        gsap.fromTo(q(".progress-bar"), { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: sync() })
        gsap.to(q(".gallery-ghost"), { xPercent: -40, ease: "none", scrollTrigger: sync() })

        // Photos drift inside their frames while the track moves (depth)
        gsap.utils.toArray<HTMLElement>(".parallax-img", flow).forEach((img) => {
          gsap.fromTo(
            img,
            { xPercent: -5 },
            {
              xPercent: 5,
              ease: "none",
              scrollTrigger: {
                trigger: img.closest(".gallery-card"),
                containerAnimation: scrollTween,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            }
          )
        })

        // Entrance: title letters + cards rise in as the section arrives
        gsap.from(q(".moments-title .char"), {
          opacity: 0,
          y: 60,
          rotate: 6,
          duration: 0.9,
          stagger: 0.04,
          ease: "back.out(1.6)",
          scrollTrigger: { trigger: pin, start: "top 70%", once: true },
        })
        gsap.from(q(".gallery-card"), {
          opacity: 0,
          y: 80,
          duration: 0.9,
          stagger: 0.06,
          ease: "power3.out",
          scrollTrigger: { trigger: pin, start: "top 65%", once: true },
        })
        gsap.to(q(".scroll-hint"), {
          x: 10,
          duration: 0.9,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        })

        // Re-measure once the layout has settled after the triggers are created
        const raf = requestAnimationFrame(() => ScrollTrigger.refresh())
        return () => cancelAnimationFrame(raf)
      },
      flow
    )

    return () => mm.revert()
  }, [active])

  return (
    <section
      className="relative w-full"
      style={{ backgroundColor: GALLERY_CONFIG.colors.mainBg }}
      aria-label="Catalyst 7.0 Leadership Showcase"
    >
      {/* Intro zone */}
      <TextRevealZone active={active} />

      {/* Marquee band */}
      <MarqueeBand />

      <div ref={flowRef}>
        {/* ── Pinned horizontal scroll gallery ── */}
        <div
          className="gallery-pin relative h-[100svh] w-full overflow-hidden motion-reduce:overflow-x-auto"
          style={{
            background:
              "radial-gradient(ellipse at 20% 30%, #FAF8F2 0%, #F8F3E9 55%, #F1E8D8 100%)",
          }}
        >
          {/* ghost kanji 瞬 (moment) drifting slowly behind everything */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-[2vw] top-1/2 -translate-y-1/2 select-none"
          >
            <span
              className="gallery-ghost block text-[70vh] leading-none text-[#252321] opacity-[0.05]"
              style={{ fontFamily: GALLERY_CONFIG.fonts.kanji }}
            >
              瞬
            </span>
          </div>

          <div className="gallery-track relative z-10 flex h-full w-max items-center gap-[5vw] px-[6vw]">
            {/* Title panel */}
            <div className="gallery-title w-[min(86vw,620px)] shrink-0">
              <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-[#252321]/30 bg-[#F8F3E9]/95 px-4 py-1.5 sm:px-5 sm:py-2">
                <img src="/assets/brand/catalyst-mark-128.webp" alt="" aria-hidden="true" width={22} height={22} decoding="async" draggable={false} className="h-[22px] w-[22px] shrink-0 select-none object-contain" />
                <span
                  className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-[#252321] sm:text-xs sm:tracking-[0.24em]"
                  style={{ fontFamily: GALLERY_CONFIG.fonts.label }}
                >
                  CATALYST 7.0 · MOMENTS OF LEADERSHIP
                </span>
              </div>
              <h2
                className="moments-title leading-[1.02] tracking-[0.03em]"
                style={{ fontFamily: HEADING_FONT }}
              >
                <span className="block text-[clamp(1.5rem,3vw,2.25rem)] text-[#252321]">
                  <SplitChars text="RELIVE THE" />
                </span>
                <span className="block text-[clamp(4rem,11vw,9rem)] text-[#C9362B]">
                  <SplitChars text="MOMENTS" />
                </span>
              </h2>
              <p
                className="mt-5 max-w-[40ch] text-base leading-relaxed text-[#252321]/80 sm:text-lg"
                style={{ fontFamily: GALLERY_CONFIG.fonts.body }}
              >
                Walk through the faces, the games and the quiet reflections that made the forum.
              </p>
              <div
                className="scroll-hint mt-8 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.25em] text-[#C9362B]"
                style={{ fontFamily: GALLERY_CONFIG.fonts.label }}
              >
                <span>Scroll</span>
                <ArrowRight size={16} />
              </div>
            </div>

            {/* Photo columns */}
            {COLUMNS.map((col, c) => (
              <div
                key={c}
                className={`flex shrink-0 flex-col gap-[3vh] ${
                  c % 2 === 0 ? "-translate-y-[2vh]" : "translate-y-[6vh]"
                }`}
              >
                {col.map((item, k) => (
                  <GalleryCard key={item.src} item={item} n={c * 2 + k} />
                ))}
              </div>
            ))}

            {/* End panel */}
            <div className="flex w-[min(80vw,360px)] shrink-0 flex-col items-center justify-center gap-4 pr-[4vw] text-center">
              <span
                className="text-[clamp(2.5rem,6vw,4.5rem)] leading-none text-[#C9362B]"
                style={{ fontFamily: GALLERY_CONFIG.fonts.kanji }}
                aria-hidden="true"
              >
                続
              </span>
              <Link
                to="/gallery"
                className="group inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#252321]/40 bg-[#FAF6EE] px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#252321] transition-all hover:bg-[#252321] hover:text-[#FAF6EE] sm:text-xs"
                style={{ fontFamily: GALLERY_CONFIG.fonts.body }}
              >
                <span>ENTER FULL SCROLL GALLERY</span>
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* progress line */}
          <div className="absolute bottom-0 left-0 z-20 h-1 w-full bg-[#252321]/10">
            <div
              className="progress-bar h-full w-full bg-[#C9362B]"
              style={{ transformOrigin: "left center" }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default DemoVariant1