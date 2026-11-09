import React, { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Compass, Award, Flame, Users } from 'lucide-react'
import { Navbar } from '../components/Navbar'
import { TagMark } from '../components/brand/CatalystTag'
import { SakuraPetals } from '../components/SakuraPetals'

// ============================================================================
// ABOUT PAGE (route: /about)
//
// Sections, top to bottom (each is one <section>, easy to reorder or delete):
//   1 HERO        headline + samurai in the rising sun
//   2 STATS       crimson ribbon
//   3 PILLARS     dark wine section, four virtues
//   4 EVENTS      bento grid of the six experiences
//   5 JOURNEY     the two delegate days
//   6 TEAM CTA    links to /conference-team
//   7 REGISTER    final call to action
//
// Everything you will want to edit is in the DATA block right below.
//
// PERFORMANCE NOTES (the rest of the site is smooth, so this page stays light):
//   - no fixed full-screen layers (the petals are clipped to the hero only)
//   - no backdrop-blur, no continuous animations
//   - all motion is transform / opacity, and plays once when scrolled into view
// ============================================================================

const HEADING_FONT = "'Jansina', 'Brusher', 'Shippori Mincho', serif"
const KANJI_FONT = "'Noto Serif JP', 'Shippori Mincho', serif"
const LABEL_FONT = "'Noto Sans JP', 'Montserrat', sans-serif"
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const RED = '#C9362B'
const INK = '#252321'
const WINE = '#2A0310'
const GOLD = '#E8C27A'

const SEIGAIHA = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='20' viewBox='0 0 40 20'%3E%3Cg fill='%23F4ECE0' stroke='%23C9362B' stroke-width='1.4'%3E%3Ccircle cx='0' cy='10' r='18'/%3E%3Ccircle cx='0' cy='10' r='12'/%3E%3Ccircle cx='0' cy='10' r='6'/%3E%3Ccircle cx='40' cy='10' r='18'/%3E%3Ccircle cx='40' cy='10' r='12'/%3E%3Ccircle cx='40' cy='10' r='6'/%3E%3Ccircle cx='20' cy='20' r='18'/%3E%3Ccircle cx='20' cy='20' r='12'/%3E%3Ccircle cx='20' cy='20' r='6'/%3E%3C/g%3E%3C/svg%3E")`

const ART = {
  // tried in order: the first one that loads is used
  samurai: ['/assets/samurai/samurai-guardian.webp', '/assets/illustrations/benkageyama-samurai-5135974_1920.png'],
  torii: ['/assets/hero-section-assets/torii-gate.webp'],
  pagoda: ['/assets/hero-section-assets/pagoda.webp'],
  branch: ['/assets/hero-section-assets/sakura-branch.webp'],
}

// ============================================================================
// DATA
// ============================================================================
const STATS = [
  { num: '100+', label: 'Delegates', sub: 'From top universities' },
  { num: '02', label: 'Days', sub: 'Intensive immersion' },
  { num: '06', label: 'Experiences', sub: 'Keynotes to Alumni Night' },
  { num: '7th', label: 'Edition', sub: 'Excellence in leadership' },
]

const PILLARS = [
  {
    num: '01',
    kanji: '超越',
    title: 'Dare Beyond Definition',
    subtitle: 'Transcend conventional limits',
    desc: 'Catalyst 7.0 is not merely a conference; it is a crucible of courage. We dismantle comfort zones and ignite the audacity to innovate, lead without title, and shatter perceived boundaries.',
    icon: Flame,
  },
  {
    num: '02',
    kanji: '団結',
    title: 'Unyielding Brotherhood',
    subtitle: 'Forged in shared struggle',
    desc: 'Like samurais bound by unbreakable fidelity, Catalyst leaders stand shoulder-to-shoulder. We cultivate authentic camaraderie where vulnerability meets strength and collective victory is our singular creed.',
    icon: Users,
  },
  {
    num: '03',
    kanji: '使命',
    title: 'Purpose & Impact',
    subtitle: 'Actions with lasting resonance',
    desc: 'Leadership without purpose is empty posturing. Every workshop, key challenge, and delegate session is designed to kindle sustainable social impact that ripples across university halls and nationwide industries.',
    icon: Compass,
  },
  {
    num: '04',
    kanji: '洗練',
    title: 'Excellence & Discipline',
    subtitle: 'Precision in every detail',
    desc: 'From our meticulous logistics grid to the poetic elegance of our Sumi-e visual legacy, Catalyst 7.0 demands relentless dedication to craftsmanship, continuous self-mastery, and timeless quality.',
    icon: Award,
  },
]

const EVENTS = [
  {
    title: 'Conference Sessions',
    kanji: '総会',
    subtitle: 'Visionary plenaries & keynotes',
    image: '/assets/catalyst-gallery/616529329_1268081438699100_5464235221991506990_n.jpg',
    description:
      'Immersive stage plenaries, inspiring keynotes from thought leaders, and leadership forums designed to reshape perspectives.',
  },
  {
    title: 'Outbound Trainings',
    kanji: '野外研修',
    subtitle: 'Experiential team challenges',
    image: '/assets/catalyst-gallery/obt-beach.jpg',
    description:
      'Adrenaline-pumping outdoor simulations and coastal team tasks that push physical grit, test endurance, and build unbreakable trust.',
  },
  {
    title: 'Workshops',
    kanji: '研鑽',
    subtitle: 'Hands-on skill masterclasses',
    image: '/assets/catalyst-gallery/616856062_1268081038699140_5408968865674764265_n.jpg',
    description:
      'Practical problem-solving sprints, project innovation labs, and collaborative workshops giving you real skills for real-world impact.',
  },
  {
    title: 'Interactive Sessions',
    kanji: '対話',
    subtitle: 'Vulnerability & deep connection',
    image: '/assets/catalyst-gallery/616083505_1268080465365864_3783241921869610059_n.jpg',
    description:
      'Peer-to-peer dialogues, honest self-reflection circles, and shared stories that turn strangers into comrades for life.',
  },
  {
    title: 'Alumni Night & DJ Party',
    kanji: '祝祭夜',
    subtitle: 'The signature evening celebration',
    image: '/assets/catalyst-gallery/617017153_1268086832031894_3502562285613882645_n.jpg',
    description:
      'The legendary conference night! Music, themed apparel, dazzling stage lights, and pure celebration of youth and togetherness.',
  },
  {
    title: 'And Many More',
    kanji: '無限',
    subtitle: 'Traditions, campfires & roll calls',
    image: '/assets/catalyst-gallery/catalyst-dj.jpg',
    description:
      'Iconic roll calls, midnight campfires, cultural performances, delegate recognitions, and surprise moments etched in memory.',
  },
]

const DAYS = [
  {
    day: 'Day 01',
    kanji: '覚醒',
    title: 'The Awakening & Forge',
    theme: 'Arrival · Outbound challenges · Alumni Night & DJ Party',
    tone: RED,
    points: [
      'Welcome ceremony & traditional delegate check-in',
      'High-energy outbound physical & strategic simulations',
      'Introspective vulnerability circles and leadership forums',
      'The legendary Alumni Night, DJ Party, and night festivities',
    ],
  },
  {
    day: 'Day 02',
    kanji: '昇華',
    title: 'The Ascent & Legacy',
    theme: 'Hands-on labs · Roadmap · Passing the torch',
    tone: INK,
    points: [
      'Interactive skill labs and problem-solving masterclasses',
      'Inspiring plenary keynote sessions by industry leaders',
      'Strategic action roadmaps for post-conference impact',
      'Roll call finale, celebrations, and graduation into brotherhood',
    ],
  },
]

// ============================================================================
// SMALL PARTS
// ============================================================================

// scroll-in reveal: plays once, transform + opacity only
const Reveal = ({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) => {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-70px' }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

// decorative image: tries each source in turn, and renders nothing if none load (so a wrong path never shows a broken icon)
const Art = ({ srcs, className = '', style }: { srcs: string[]; className?: string; style?: React.CSSProperties }) => {
  const [i, setI] = useState(0)
  if (i >= srcs.length) return null
  return (
    <img
      src={srcs[i]}
      alt=""
      aria-hidden="true"
      draggable={false}
      loading="lazy"
      decoding="async"
      onError={() => setI((n) => n + 1)}
      className={className}
      style={style}
    />
  )
}

const Hanko = ({ char, size = 36, bg = RED }: { char: string; size?: number; bg?: string }) => (
  <span
    aria-hidden="true"
    className="inline-flex shrink-0 items-center justify-center font-bold text-white"
    style={{ width: size, height: size, borderRadius: Math.round(size * 0.2), background: bg, fontFamily: KANJI_FONT, fontSize: Math.round(size * 0.58), lineHeight: 1 }}
  >
    {char}
  </span>
)

const BrushUnderline = ({ className = '', color = RED }: { className?: string; color?: string }) => (
  <svg viewBox="0 0 420 28" fill="none" className={className} aria-hidden="true" preserveAspectRatio="none">
    <path
      d="M6 16 C45 10, 95 8, 150 9 C220 10, 290 8, 350 12 C385 14, 405 16, 416 13 C405 20, 370 21, 320 20 C240 18, 160 21, 90 20 C50 19, 20 20, 6 16 Z"
      fill={color}
    />
  </svg>
)

// seigaiha edge; `bg` is the colour BEHIND the waves (use the colour of the section it sits on)
const Waves = ({ bg }: { bg?: string }) => (
  <div aria-hidden="true" className="h-5 w-full select-none" style={{ backgroundColor: bg, backgroundImage: SEIGAIHA, backgroundSize: '40px 20px', backgroundRepeat: 'repeat-x' }} />
)

const Eyebrow = ({ kanji, label, light = false }: { kanji: string; label: string; light?: boolean }) => (
  <div className="inline-flex items-center gap-3">
    <Hanko char={kanji} size={30} bg={light ? GOLD : RED} />
    <span
      className="text-xs font-bold uppercase tracking-[0.3em]"
      style={{ fontFamily: LABEL_FONT, color: light ? GOLD : RED }}
    >
      {label}
    </span>
  </div>
)

// ============================================================================
// PAGE
// ============================================================================
export default function AboutPage() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#F8F3E9] font-sans text-[#252321] selection:bg-[#C9362B] selection:text-white">
      <Navbar />

      <main>
        {/* ====================================================================
            1 · HERO
           ==================================================================== */}
        <section className="relative overflow-hidden px-4 pb-14 pt-10 sm:px-6 sm:pb-20 sm:pt-14 lg:px-8">
          {/* petals live only inside the hero (paint containment also traps a fixed canvas in here) */}
          <div className="pointer-events-none absolute inset-0 opacity-60" style={{ contain: 'paint' }} aria-hidden="true">
            <SakuraPetals enabled={true} />
          </div>

          {/* giant faint kanji + pagoda */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-[3%] top-[4%] select-none text-[34vw] font-black leading-none text-[#252321]/[0.025] lg:text-[26vw]"
            style={{ fontFamily: KANJI_FONT }}
          >
            触媒
          </span>
          <Art srcs={ART.pagoda} className="pointer-events-none absolute -left-10 bottom-0 hidden w-[340px] select-none opacity-[0.07] grayscale lg:block" />

          <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-6">
            {/* text */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="inline-flex max-w-full items-center gap-2.5 rounded-full border border-[#252321]/20 bg-[#FAF6EE] py-1.5 pl-2 pr-4 shadow-[0_4px_16px_rgba(37,35,33,0.06)]"
              >
                <TagMark />
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] sm:text-xs" style={{ fontFamily: LABEL_FONT }}>
                  AIESEC in SLIIT · About Catalyst 7.0
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mt-7 flex items-center justify-center gap-3 lg:justify-start"
              >
                <span className="h-px w-10 bg-[#C9362B]/60" />
                <span className="pl-[0.4em] text-xs font-bold tracking-[0.45em] text-[#C9362B] sm:text-sm" style={{ fontFamily: KANJI_FONT }}>
                  変革の起点
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.12, ease: EASE }}
                className="brush-heading mt-3 tracking-[0.02em]"
                style={{ fontFamily: HEADING_FONT }}
              >
                <span className="block text-[clamp(2.1rem,6.4vw,4.4rem)] uppercase leading-[1.05] text-[#252321]">Where leaders</span>
                <span className="block text-[clamp(2.1rem,6.4vw,4.4rem)] uppercase leading-[1.05] text-[#252321]">are forged</span>
                <span className="relative mt-1 inline-block max-w-full text-[clamp(3rem,10.5vw,6.6rem)] uppercase leading-[1.02] text-[#C9362B]">
                  Catalyst 7.0
                  <BrushUnderline className="mt-[-2px] block h-3 w-full sm:h-5" />
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.28, ease: EASE }}
                className="mx-auto mt-6 max-w-xl text-base leading-[1.75] text-[#3D3833] sm:text-lg lg:mx-0"
              >
                Catalyst 7.0 is the premier national youth leadership conference organized by{' '}
                <strong className="font-semibold text-[#252321]">AIESEC in SLIIT</strong>. Rooted in the ancient warrior code of{' '}
                <strong className="font-semibold text-[#C9362B]">Bushido</strong>, this 2-day immersive journey challenges undergraduates to
                shatter comfort zones, discover relentless purpose, and forge lifelong brotherhood.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.38, ease: EASE }}
                className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4 lg:justify-start"
              >
                <Link
                  to="/register"
                  className="group inline-flex min-h-[48px] items-center gap-2.5 rounded-full bg-[#C9362B] px-8 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-[0_8px_22px_rgba(201,54,43,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#A8261E] sm:text-sm"
                >
                  Register now
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/conference-team"
                  className="inline-flex min-h-[48px] items-center rounded-full border border-[#252321]/80 px-8 text-xs font-bold uppercase tracking-[0.2em] transition-colors duration-300 hover:bg-[#252321] hover:text-[#F8F3E9] sm:text-sm"
                >
                  Meet the team
                </Link>
              </motion.div>
            </div>

            {/* visual: samurai in front of a rising sun */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: EASE }}
              aria-hidden="true"
              className="relative mx-auto aspect-square w-[min(86vw,470px)]"
            >
              {/* sun + rings */}
              <div
                className="absolute inset-[7%] rounded-full"
                style={{ background: 'radial-gradient(circle at 38% 32%, #FF8A6E 0%, #E0452F 46%, #B51E23 100%)', boxShadow: '0 30px 60px rgba(150,20,30,0.25)' }}
              />
              <div className="absolute inset-[1%] rounded-full border border-[#C9362B]/35" />
              <div className="absolute -inset-[5%] rounded-full border border-[#C9362B]/15" />
              <Art
                srcs={ART.samurai}
                className="absolute inset-x-0 bottom-[-4%] mx-auto h-[108%] w-auto max-w-[118%] select-none object-contain drop-shadow-[0_22px_30px_rgba(60,5,15,0.35)]"
              />
              <span className="absolute bottom-[8%] right-[2%] rotate-6">
                <Hanko char="士" size={64} />
              </span>
              <span
                className="absolute left-[1%] top-[10%] text-sm tracking-[0.5em] text-[#252321]/70"
                style={{ writingMode: 'vertical-rl', fontFamily: KANJI_FONT }}
              >
                第七回触媒
              </span>
            </motion.div>
          </div>
        </section>

        {/* ====================================================================
            2 · STATS RIBBON
           ==================================================================== */}
        <section className="relative px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div
              className="relative mx-auto grid max-w-6xl grid-cols-2 overflow-hidden rounded-3xl border-2 border-[#252321] text-white shadow-[8px_8px_0_#252321] sm:grid-cols-4"
              style={{ background: `radial-gradient(120% 140% at 0% 0%, #D94A38 0%, ${RED} 45%, #A8261E 100%)` }}
            >
              {STATS.map((s, i) => (
                <div
                  key={s.label}
                  className={`flex flex-col items-center px-3 py-7 text-center sm:py-9 ${i % 2 === 1 ? 'border-l' : ''} ${i >= 2 ? 'border-t sm:border-t-0' : ''} ${i === 2 ? 'sm:border-l' : ''} border-white/20`}
                >
                  <span className="text-4xl leading-none sm:text-5xl" style={{ fontFamily: HEADING_FONT }}>
                    {s.num}
                  </span>
                  <span className="mt-3 text-xs font-bold uppercase tracking-[0.22em]" style={{ fontFamily: LABEL_FONT }}>
                    {s.label}
                  </span>
                  <span className="mt-1 text-[11px] text-white/75">{s.sub}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        <div className="mt-16 sm:mt-24">
          <Waves />
        </div>

        {/* ====================================================================
            3 · FOUR PILLARS (dark wine)
           ==================================================================== */}
        <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-24 lg:px-8" style={{ background: WINE }}>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-[480px]"
            style={{ background: 'radial-gradient(ellipse 60% 80% at 50% 0%, rgba(201,54,43,0.35), rgba(201,54,43,0) 70%)' }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -left-4 bottom-[-6%] select-none text-[30vw] font-black leading-none text-white/[0.03]"
            style={{ fontFamily: KANJI_FONT }}
          >
            武士道
          </span>

          <div className="relative mx-auto max-w-6xl">
            <Reveal className="text-center">
              <Eyebrow kanji="志" label="The Crucible Code" light />
              <h2
                className="brush-heading mt-4 text-[clamp(2.2rem,6vw,4.4rem)] uppercase leading-[1.05] text-[#FFF3E3]"
                style={{ fontFamily: HEADING_FONT }}
              >
                Four pillars of <span style={{ color: GOLD }}>Catalyst 7.0</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#FFF3E3]/70 sm:text-base">
                Every keynote, physical challenge, and late-night discussion is anchored by these four fundamental virtues.
              </p>
            </Reveal>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {PILLARS.map((p, i) => {
                const Icon = p.icon
                return (
                  <Reveal key={p.num} delay={i * 0.08} className="h-full">
                    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#E8C27A]/25 bg-white/[0.04] p-6 transition-[transform,border-color] duration-300 hover:-translate-y-1.5 hover:border-[#E8C27A]/70">
                      {/* vertical kanji */}
                      <span
                        aria-hidden="true"
                        className="absolute right-4 top-5 text-2xl tracking-[0.3em] text-[#E8C27A]/45"
                        style={{ writingMode: 'vertical-rl', fontFamily: KANJI_FONT }}
                      >
                        {p.kanji}
                      </span>

                      {/* outlined numeral */}
                      <span
                        aria-hidden="true"
                        className="block text-[5.5rem] leading-none text-transparent"
                        style={{ fontFamily: HEADING_FONT, WebkitTextStroke: '1.5px rgba(232,194,122,0.55)' }}
                      >
                        {p.num}
                      </span>

                      <div className="mt-4 flex h-11 w-11 items-center justify-center rounded-full border border-[#E8C27A]/50 text-[#E8C27A] transition-colors duration-300 group-hover:bg-[#E8C27A] group-hover:text-[#2A0310]">
                        <Icon className="h-5 w-5" />
                      </div>

                      <h3 className="mt-5 text-2xl uppercase leading-tight text-[#FFF3E3]" style={{ fontFamily: HEADING_FONT }}>
                        {p.title}
                      </h3>
                      <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: GOLD, fontFamily: LABEL_FONT }}>
                        {p.subtitle}
                      </p>
                      <p className="mt-4 text-sm leading-relaxed text-[#FFF3E3]/72">{p.desc}</p>
                    </article>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </section>
        <Waves bg={WINE} />

        {/* ====================================================================
            4 · EVENTS (bento grid)
           ==================================================================== */}
        <section className="relative px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <Reveal className="text-center">
              <Eyebrow kanji="祭" label="What to expect" />
              <h2 className="brush-heading mt-4 text-[clamp(2.3rem,6.4vw,4.8rem)] uppercase leading-[1.05]" style={{ fontFamily: HEADING_FONT }}>
                Special events in <span className="text-[#C9362B]">Catalyst</span>
              </h2>
              <div className="mx-auto mt-1 w-[min(380px,72%)]">
                <BrushUnderline className="block h-4 w-full sm:h-5" />
              </div>
              <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-[#4A4340] sm:text-base">
                An electrifying lineup of non-stop action, intellectual growth, physical camaraderie, and celebrations that will forge memories
                to cherish forever.
              </p>
            </Reveal>

            <div className="mt-14 grid auto-rows-[330px] gap-5 sm:grid-cols-2 lg:auto-rows-[290px] lg:grid-cols-3 lg:gap-6">
              {EVENTS.map((e, i) => {
                const big = i === 0
                return (
                  <Reveal key={e.title} delay={(i % 3) * 0.08} className={big ? 'sm:col-span-2 lg:row-span-2' : ''}>
                    <article className="group relative h-full overflow-hidden rounded-2xl border-2 border-[#252321] bg-[#252321] shadow-[5px_5px_0_#252321] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[8px_8px_0_#C9362B]">
                      <img
                        src={e.image}
                        alt={e.title}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1B0209] via-[#1B0209]/45 to-transparent" />

                      <span
                        className="absolute left-4 top-4 rounded-md bg-[#C9362B] px-2.5 py-1 text-xs font-bold text-white"
                        style={{ fontFamily: KANJI_FONT }}
                      >
                        {e.kanji}
                      </span>
                      <span className="absolute right-4 top-4 text-sm font-bold tracking-widest text-white/60" style={{ fontFamily: HEADING_FONT }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>

                      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8C27A]" style={{ fontFamily: LABEL_FONT }}>
                          {e.subtitle}
                        </p>
                        <h3
                          className={`mt-1 uppercase leading-none text-white ${big ? 'text-4xl sm:text-5xl' : 'text-2xl sm:text-3xl'}`}
                          style={{ fontFamily: HEADING_FONT }}
                        >
                          {e.title}
                        </h3>
                        <p className={`mt-3 max-w-xl text-sm leading-relaxed text-white/80 ${big ? '' : 'line-clamp-3'}`}>{e.description}</p>
                      </div>
                    </article>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </section>

        <Waves />

        {/* ====================================================================
            5 · THE JOURNEY (2 days)
           ==================================================================== */}
        <section className="relative overflow-hidden bg-[#F4ECE0]/70 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          {[520, 800].map((d, i) => (
            <div
              key={d}
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 rounded-full border border-[#C9362B]"
              style={{ width: d, height: d, top: -d / 2, marginLeft: -d / 2, opacity: 0.16 - i * 0.06 }}
            />
          ))}

          <div className="relative mx-auto max-w-6xl">
            <Reveal className="text-center">
              <Eyebrow kanji="旅" label="The expedition" />
              <h2 className="brush-heading mt-4 text-[clamp(2.2rem,5.6vw,4.2rem)] uppercase leading-[1.05]" style={{ fontFamily: HEADING_FONT }}>
                The <span className="text-[#C9362B]">2-day</span> delegate journey
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-sm text-[#59524C] sm:text-base">
                From the moment you step foot at the venue to the final roll call, every hour is crafted for transformation.
              </p>
            </Reveal>

            <div className="mt-14 grid gap-8 lg:grid-cols-2 lg:gap-10">
              {DAYS.map((d, i) => (
                <Reveal key={d.day} delay={i * 0.12} className="h-full">
                  <article className="flex h-full flex-col overflow-hidden rounded-3xl border-2 border-[#252321] bg-[#FAF6EE] shadow-[8px_8px_0_#252321]">
                    {/* header band */}
                    <div className="relative overflow-hidden px-6 py-6 text-white sm:px-8" style={{ background: d.tone }}>
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-2 -top-6 select-none text-[8rem] font-black leading-none text-white/15"
                        style={{ fontFamily: KANJI_FONT }}
                      >
                        {d.kanji}
                      </span>
                      <span className="relative text-xs font-bold uppercase tracking-[0.3em] text-[#E8C27A]" style={{ fontFamily: LABEL_FONT }}>
                        {d.day}
                      </span>
                      <h3 className="relative mt-2 text-3xl uppercase leading-tight sm:text-4xl" style={{ fontFamily: HEADING_FONT }}>
                        {d.title}
                      </h3>
                      <p className="relative mt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80">{d.theme}</p>
                    </div>

                    {/* steps with a connecting thread */}
                    <ol className="relative flex-1 px-6 py-7 sm:px-8">
                      <span aria-hidden="true" className="absolute bottom-10 left-[2.65rem] top-10 w-px bg-[#252321]/20 sm:left-[3.15rem]" />
                      {d.points.map((pt, idx) => (
                        <li key={pt} className="relative flex items-start gap-4 pb-6 last:pb-0">
                          <span
                            className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#252321] bg-[#FAF6EE] text-sm font-bold"
                            style={{ fontFamily: HEADING_FONT, color: d.tone }}
                          >
                            {idx + 1}
                          </span>
                          <span className="pt-1.5 text-sm leading-relaxed text-[#3D3833] sm:text-[15px]">{pt}</span>
                        </li>
                      ))}
                    </ol>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <Waves />

        {/* ====================================================================
            6 · MEET THE TEAM
           ==================================================================== */}
        <section className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <Reveal>
            <div
              className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border-2 border-[#252321] p-8 shadow-[8px_8px_0_#C9362B] sm:p-12 lg:p-16"
              style={{ background: `linear-gradient(135deg, ${WINE} 0%, #4A0A1C 100%)` }}
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-10 right-[18%] select-none text-[16rem] font-black leading-none text-white/[0.04]"
                style={{ fontFamily: KANJI_FONT }}
              >
                組
              </span>

              <div className="relative grid items-center gap-10 lg:grid-cols-[1.3fr_1fr]">
                <div>
                  <Eyebrow kanji="組" label="Behind the scenes" light />
                  <h3
                    className="brush-heading mt-5 text-[clamp(2rem,5vw,3.6rem)] uppercase leading-[1.05] text-[#FFF3E3]"
                    style={{ fontFamily: HEADING_FONT }}
                  >
                    Meet the leaders forging <span style={{ color: GOLD }}>Catalyst 7.0</span>
                  </h3>
                  <p className="mt-5 max-w-xl text-sm leading-relaxed text-[#FFF3E3]/75 sm:text-base">
                    A powerhouse coalition of Executive Board facilitators (FACI) and Organizing Committee co-facilitators (CO FACI) working
                    relentlessly around the clock to deliver Sri Lanka&apos;s ultimate youth summit.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-4">
                    <Link
                      to="/conference-team"
                      className="group inline-flex min-h-[48px] items-center gap-2.5 rounded-full bg-[#C9362B] px-8 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#E0452F]"
                    >
                      Meet the conference team
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link
                      to="/conference-team?team=eb"
                      className="inline-flex min-h-[48px] items-center gap-2 rounded-full border border-[#E8C27A]/70 px-7 text-xs font-bold uppercase tracking-[0.18em] text-[#E8C27A] transition-colors duration-300 hover:bg-[#E8C27A] hover:text-[#2A0310]"
                    >
                      Executive board
                      <ArrowUpRight size={15} />
                    </Link>
                  </div>
                </div>

                <div className="relative flex justify-center">
                  <div className="absolute inset-[8%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(232,194,122,0.22), rgba(232,194,122,0) 70%)' }} />
                  <Art srcs={ART.torii} className="relative w-56 select-none drop-shadow-[0_16px_28px_rgba(0,0,0,0.4)] sm:w-64 lg:w-72" />
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ====================================================================
            7 · REGISTER
           ==================================================================== */}
        <section className="relative overflow-hidden text-white" style={{ background: `linear-gradient(180deg, ${RED}, #A8261E)` }}>
          <Waves bg={RED} />
          {[420, 700].map((d, i) => (
            <div
              key={d}
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 rounded-full border border-white"
              style={{ width: d, height: d, marginLeft: -d / 2, marginTop: -d / 2, opacity: 0.2 - i * 0.08 }}
            />
          ))}
          <Art srcs={ART.branch} className="pointer-events-none absolute -right-10 -top-4 hidden w-[360px] select-none opacity-90 md:block" />

          <Reveal className="relative mx-auto max-w-3xl px-4 pb-20 pt-14 text-center sm:px-6 sm:pb-28 sm:pt-20">
            <div className="mb-5 flex items-center justify-center gap-4" aria-hidden="true">
              <span className="h-px w-14 bg-white/40" />
              <Hanko char="命" size={42} bg="#FAF6EE" />
              <span className="h-px w-14 bg-white/40" />
            </div>
            <h2 className="brush-heading text-[clamp(2.6rem,7vw,5rem)] uppercase leading-none" style={{ fontFamily: HEADING_FONT }}>
              Your squad awaits
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-white/85 sm:text-base">
              Seats at Catalyst 7.0 are limited to maintain our high-touch delegate experience. Claim your place today and dare beyond
              definition.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/register"
                className="group inline-flex min-h-[52px] items-center gap-2.5 rounded-full bg-[#FAF6EE] px-9 text-xs font-bold uppercase tracking-[0.2em] text-[#C9362B] shadow-[0_10px_26px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white sm:text-sm"
              >
                Register for Catalyst 7.0
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/merch"
                className="inline-flex min-h-[52px] items-center rounded-full border border-white/80 px-8 text-xs font-bold uppercase tracking-[0.18em] transition-colors duration-300 hover:bg-white hover:text-[#C9362B] sm:text-sm"
              >
                Explore official merch
              </Link>
            </div>
          </Reveal>
        </section>
      </main>
    </div>
  )
}