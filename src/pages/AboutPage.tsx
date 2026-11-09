import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Compass,
  Users,
  Award,
  Flame,
  Zap,
  Calendar,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Heart,
  ChevronRight,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { TagMark } from '../components/brand/CatalystTag';
import { SakuraPetals } from '../components/SakuraPetals';

// ============================================================================
// STYLES & ASSETS
// ============================================================================
const HEADING_FONT = "'Jansina', 'Brusher', 'Shippori Mincho', serif";
const KANJI_FONT = "'Noto Serif JP', 'Shippori Mincho', serif";
const LABEL_FONT = "'Noto Sans JP', 'Montserrat', sans-serif";
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const SEIGAIHA = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='20' viewBox='0 0 40 20'%3E%3Cg fill='%23F4ECE0' stroke='%23C9362B' stroke-width='1.4'%3E%3Ccircle cx='0' cy='10' r='18'/%3E%3Ccircle cx='0' cy='10' r='12'/%3E%3Ccircle cx='0' cy='10' r='6'/%3E%3Ccircle cx='40' cy='10' r='18'/%3E%3Ccircle cx='40' cy='10' r='12'/%3E%3Ccircle cx='40' cy='10' r='6'/%3E%3Ccircle cx='20' cy='20' r='18'/%3E%3Ccircle cx='20' cy='20' r='12'/%3E%3Ccircle cx='20' cy='20' r='6'/%3E%3C/g%3E%3C/svg%3E")`;

const ART = {
  torii: '/assets/hero-section-assets/torii-gate.webp',
  pagoda: '/assets/hero-section-assets/pagoda.webp',
  branch: '/assets/hero-section-assets/sakura-branch.webp',
  sun: '/assets/hero-section-assets/red-enso-sun.webp',
  mist: '/assets/hero-section-assets/atmospheric-mist.webp',
  bonsai: '/assets/illustrations/gdj-bonsai-tree-8143900.svg',
  building: '/assets/illustrations/gdj-building-8171699.svg',
  tree: '/assets/illustrations/susannp4-tree-1586365_1920.webp',
  koi: '/assets/illustrations/kacsoeszti-koi-1184783_1920.png',
  fan: '/assets/illustrations/jakeloris-fan-7039967.png',
  mask: '/assets/illustrations/alessandro_hrdz-mask-6976331.png',
  samurai: '/assets/samurai/samurai-guardian.webp',
};

// ============================================================================
// DATA: SPECIAL EVENTS (FROM USER BRIEF)
// ============================================================================
const SPECIAL_EVENTS = [
  {
    title: 'CONFERENCE SESSIONS',
    kanji: '総会',
    subtitle: 'Visionary Plenaries & Keynotes',
    image: '/assets/catalyst-gallery/616529329_1268081438699100_5464235221991506990_n.jpg',
    description:
      'Immersive stage plenaries, inspiring keynotes from thought leaders, and leadership forums designed to reshape perspectives.',
    accent: '#C9362B',
  },
  {
    title: 'OUTBOUND TRAININGS',
    kanji: '野外研修',
    subtitle: 'Experiential Team Challenges',
    image: '/assets/catalyst-gallery/616233471_1268080295365881_7557058301924341156_n.jpg',
    description:
      'Adrenaline-pumping outdoor simulations and coastal team tasks that push physical grit, test endurance, and build unbreakable trust.',
    accent: '#B51E23',
  },
  {
    title: 'WORKSHOPS',
    kanji: '研鑽',
    subtitle: 'Hands-on Skill Masterclasses',
    image: '/assets/catalyst-gallery/616856062_1268081038699140_5408968865674764265_n.jpg',
    description:
      'Practical problem-solving sprints, project innovation labs, and collaborative workshops giving you real skills for real-world impact.',
    accent: '#8C0B26',
  },
  {
    title: 'INTERACTIVE SESSIONS',
    kanji: '対話',
    subtitle: 'Vulnerability & Deep Connection',
    image: '/assets/catalyst-gallery/616439277_1268082045365706_8706912413091711333_n.jpg',
    description:
      'Peer-to-peer dialogues, honest self-reflection circles, and shared stories that turn strangers into comrades for life.',
    accent: '#C9362B',
  },
  {
    title: 'THEME PARTY',
    kanji: '祝祭夜',
    subtitle: 'The Signature Evening Gala',
    image: '/assets/catalyst-gallery/617331461_1268082458698998_896025517703704603_n.jpg',
    description:
      'The legendary conference night! Music, themed apparel, dazzling stage lights, and pure celebration of youth and togetherness.',
    accent: '#E0452F',
  },
  {
    title: 'AND MANY MORE',
    kanji: '無限',
    subtitle: 'Traditions, Awards & Roll Calls',
    image: '/assets/catalyst-gallery/616938786_1268082458699001_1398486345666317073_n.jpg',
    description:
      'Iconic roll calls, midnight campfires, cultural performances, delegate recognitions, and surprise moments etched in memory.',
    accent: '#252321',
  },
];

// ============================================================================
// DATA: 4 PILLARS OF CATALYST
// ============================================================================
const PILLARS = [
  {
    num: '01',
    kanji: '超越',
    title: 'DARE BEYOND DEFINITION',
    subtitle: 'Transcend Conventional Limits',
    desc: 'Catalyst 7.0 is not merely a conference; it is a crucible of courage. We dismantle comfort zones and ignite the audacity to innovate, lead without title, and shatter perceived boundaries.',
    icon: Flame,
  },
  {
    num: '02',
    kanji: '団結',
    title: 'UNYIELDING BROTHERHOOD',
    subtitle: 'Forged in Shared Struggle',
    desc: 'Like samurais bound by unbreakable fidelity, Catalyst leaders stand shoulder-to-shoulder. We cultivate authentic camaraderie where vulnerability meets strength and collective victory is our singular creed.',
    icon: Users,
  },
  {
    num: '03',
    kanji: '使命',
    title: 'PURPOSE & IMPACT',
    subtitle: 'Actions with Lasting Resonance',
    desc: 'Leadership without purpose is empty posturing. Every workshop, key challenge, and delegate session is designed to kindle sustainable social impact that ripples across university halls and nationwide industries.',
    icon: Compass,
  },
  {
    num: '04',
    kanji: '洗練',
    title: 'EXCELLENCE & DISCIPLINE',
    subtitle: 'Precision in Every Detail',
    desc: 'From our meticulous logistics grid to the poetic elegance of our Sumi-e visual legacy, Catalyst 7.0 demands relentless dedication to craftsmanship, continuous self-mastery, and timeless quality.',
    icon: Award,
  },
];

// ============================================================================
// DATA: 3-DAY JOURNEY
// ============================================================================
const JOURNEY_DAYS = [
  {
    day: 'DAY 01',
    kanji: '覚醒',
    title: 'THE AWAKENING & FORGE',
    theme: 'Arrival · Outbound Challenges · The Gala',
    points: [
      'Welcome ceremony & traditional delegate check-in',
      'High-energy outbound physical & strategic simulations',
      'Introspective vulnerability circles and leadership forums',
      'The legendary Catalyst Theme Party and night festivities',
    ],
  },
  {
    day: 'DAY 02',
    kanji: '昇華',
    title: 'THE ASCENT & LEGACY',
    theme: 'Hands-on Labs · Roadmap · Passing the Torch',
    points: [
      'Interactive skill labs and problem-solving masterclasses',
      'Inspiring plenary keynote sessions by industry leaders',
      'Strategic action roadmaps for post-conference impact',
      'Awards, roll call finale, and graduation into brotherhood',
    ],
  },
];

// ============================================================================
// REUSABLE ORNAMENTS
// ============================================================================
const Hanko = ({ char = '結', size = 36 }: { char?: string; size?: number }) => (
  <span
    aria-hidden="true"
    className="inline-flex shrink-0 items-center justify-center font-bold text-white shadow-sm"
    style={{
      width: size,
      height: size,
      borderRadius: Math.round(size * 0.2),
      background: '#C9362B',
      fontFamily: KANJI_FONT,
      fontSize: Math.round(size * 0.55),
      lineHeight: 1,
    }}
  >
    {char}
  </span>
);

const BrushLine = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 420 28" fill="none" className={className} aria-hidden="true" preserveAspectRatio="none">
    <path
      d="M6 16 C45 10, 95 8, 150 9 C220 10, 290 8, 350 12 C385 14, 405 16, 416 13 C405 20, 370 21, 320 20 C240 18, 160 21, 90 20 C50 19, 20 20, 6 16 Z"
      fill="#C9362B"
    />
  </svg>
);

const WaveDivider = () => (
  <div
    aria-hidden="true"
    className="h-5 w-full select-none"
    style={{ backgroundImage: SEIGAIHA, backgroundSize: '40px 20px', backgroundRepeat: 'repeat-x' }}
  />
);

// ============================================================================
// MAIN ABOUT PAGE COMPONENT
// ============================================================================
export default function AboutPage() {
  const reduce = useReducedMotion();

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#F8F3E9] font-sans text-[#252321] selection:bg-[#C9362B] selection:text-white">
      <Navbar />

      {/* Floating Petals */}
      <div className="pointer-events-none fixed inset-0 z-10 opacity-50">
        <SakuraPetals enabled={true} />
      </div>

      {/* Subtle Background Watermark Layer */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -right-[6%] top-[10%] w-[380px] select-none opacity-[0.035] sm:w-[560px]">
          <img src={ART.building} alt="" className="h-auto w-full object-contain grayscale" />
        </div>
        <div className="absolute -left-[8%] top-[45%] w-[340px] select-none opacity-[0.035] sm:w-[500px]">
          <img src={ART.tree} alt="" className="h-auto w-full object-contain grayscale" />
        </div>
        <div
          className="absolute right-[-4%] top-[16%] select-none text-[20vw] font-black leading-none text-[#252321]/[0.02]"
          style={{ fontFamily: KANJI_FONT }}
        >
          触媒
        </div>
      </div>

      <main className="relative z-10">
        {/* =========================================================================
            HERO SECTION
           ========================================================================= */}
        <section className="relative px-4 pb-16 pt-28 sm:px-6 sm:pt-36 lg:px-8 lg:pb-24">
          <div className="mx-auto max-w-6xl">
            {/* Top Eyebrow Pill */}
            <div className="flex justify-center">
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="inline-flex items-center gap-2.5 rounded-full border border-[#252321]/20 bg-[#FAF6EE] py-1.5 pl-2 pr-4 shadow-[0_4px_16px_rgba(37,35,33,0.06)]"
              >
                <TagMark />
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#252321] sm:text-xs"
                  style={{ fontFamily: LABEL_FONT }}
                >
                  AIESEC IN SLIIT · ABOUT CATALYST 7.0
                </span>
              </motion.div>
            </div>

            {/* Main Title & Calligraphy */}
            <div className="mt-8 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
                className="mb-3 flex items-center justify-center gap-3"
              >
                <span className="h-px w-8 bg-[#C9362B]/50 sm:w-16" />
                <span
                  className="pl-[0.4em] text-xs font-bold tracking-[0.45em] text-[#C9362B] sm:text-sm"
                  style={{ fontFamily: KANJI_FONT }}
                >
                  変 革 の 起 点
                </span>
                <span className="h-px w-8 bg-[#C9362B]/50 sm:w-16" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
                className="tracking-[0.02em]"
                style={{ fontFamily: HEADING_FONT }}
              >
                <span className="block text-[clamp(2.5rem,8vw,5.5rem)] uppercase leading-[1.05] text-[#252321]">
                  WHERE LEADERS ARE FORGED
                </span>
                <span className="block text-[clamp(2.8rem,9vw,6.5rem)] uppercase leading-[1.02] text-[#C9362B]">
                  CATALYST 7.0
                </span>
              </motion.h1>

              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.35, ease: EASE }}
                className="mx-auto mt-2 w-[min(540px,85%)]"
              >
                <BrushLine className="block h-4 w-full sm:h-6" />
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4, ease: EASE }}
                className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#3D3833] sm:text-lg sm:leading-relaxed"
              >
                Catalyst 7.0 is the premier national youth leadership conference organized by{' '}
                <strong className="font-semibold text-[#252321]">AIESEC in SLIIT</strong>. Rooted in the ancient warrior code of{' '}
                <strong className="font-semibold text-[#C9362B]">Bushido</strong>, this 2-day immersive journey challenges undergraduates
                to shatter comfort zones, discover relentless purpose, and forge lifelong brotherhood.
              </motion.p>
            </div>

            {/* Quick Metrics Strip */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5, ease: EASE }}
              className="mt-12 grid grid-cols-2 gap-4 rounded-2xl border border-[#252321]/15 bg-white/70 p-4 shadow-[0_8px_30px_rgba(37,35,33,0.06)] backdrop-blur-xs sm:grid-cols-4 sm:p-6"
            >
              {[
                { num: '100+', label: 'Delegates', sub: 'From Top Universities' },
                { num: '02', label: 'Unforgettable Days', sub: 'Intensive Immersion' },
                { num: '06', label: 'Sessions', sub: 'Keynotes & Workshops' },
                { num: '07th', label: 'Legacy Edition', sub: 'Excellence in Leadership' },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <span
                    className="text-2xl font-black text-[#C9362B] sm:text-3xl lg:text-4xl"
                    style={{ fontFamily: HEADING_FONT }}
                  >
                    {stat.num}
                  </span>
                  <span className="mt-1 text-xs font-bold uppercase tracking-wider text-[#252321]">{stat.label}</span>
                  <span className="text-[11px] text-[#736B63]">{stat.sub}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        <WaveDivider />

        {/* =========================================================================
            SECTION 1: THE FOUR PILLARS
           ========================================================================= */}
        <section className="relative px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-6xl">
            {/* Section Header */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#C9362B]">
                <Hanko char="志" size={26} />
                <span style={{ fontFamily: LABEL_FONT }}>THE CRUCIBLE CODE</span>
              </div>
              <h2
                className="mt-3 text-[clamp(2.2rem,5.5vw,3.8rem)] uppercase leading-tight text-[#252321]"
                style={{ fontFamily: HEADING_FONT }}
              >
                FOUR PILLARS OF CATALYST 7.0
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#59524C] sm:text-base">
                Every keynote, physical challenge, and late-night discussion is anchored by these four fundamental virtues.
              </p>
            </div>

            {/* 4 Pillars Grid */}
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:gap-8">
              {PILLARS.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.num}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#252321]/15 bg-white/85 p-6 shadow-[0_6px_24px_rgba(37,35,33,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-[#C9362B]/40 hover:shadow-[0_12px_32px_rgba(201,54,43,0.12)] sm:p-8"
                  >
                    {/* Watermark Kanji */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -bottom-4 -right-2 select-none text-8xl font-black text-[#252321]/[0.035] transition-transform duration-500 group-hover:scale-110 group-hover:text-[#C9362B]/[0.08]"
                      style={{ fontFamily: KANJI_FONT }}
                    >
                      {pillar.kanji}
                    </span>

                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#C9362B]/10 text-[#C9362B] transition-colors duration-300 group-hover:bg-[#C9362B] group-hover:text-white">
                          <Icon className="h-6 w-6" />
                        </div>
                        <span
                          className="text-2xl font-bold text-[#C9362B]/60"
                          style={{ fontFamily: HEADING_FONT }}
                        >
                          {pillar.num}
                        </span>
                      </div>

                      <div className="mt-6">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#C9362B]" style={{ fontFamily: KANJI_FONT }}>
                            {pillar.kanji}
                          </span>
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#736B63]">
                            {pillar.subtitle}
                          </span>
                        </div>
                        <h3
                          className="mt-1 text-xl font-bold tracking-wide text-[#252321] sm:text-2xl"
                          style={{ fontFamily: HEADING_FONT }}
                        >
                          {pillar.title}
                        </h3>
                        <p className="mt-3 text-sm leading-relaxed text-[#4A4340] sm:text-[15px]">
                          {pillar.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <WaveDivider />

        {/* =========================================================================
            SECTION 2: SPECIAL EVENTS IN CATALYST (USER REQUEST IMAGE)
           ========================================================================= */}
        <section className="relative px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            {/* Header matching the user's banner */}
            <div className="flex flex-col items-center text-center">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-[#C9362B]/30 bg-[#C9362B]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-[#C9362B]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>WHAT TO EXPECT</span>
              </div>

              <h2
                className="mt-4 text-[clamp(2.3rem,6vw,4.5rem)] uppercase leading-none tracking-tight text-[#252321]"
                style={{ fontFamily: HEADING_FONT }}
              >
                SPECIAL EVENTS IN CATALYST
              </h2>

              <div className="mx-auto mt-2 w-[min(380px,75%)]">
                <BrushLine className="block h-3.5 w-full sm:h-5" />
              </div>

              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#4A4340] sm:text-base">
                An electrifying lineup of non-stop action, intellectual growth, physical camaraderie, and celebrations that
                will forge memories to cherish forever.
              </p>
            </div>

            {/* 6 Special Events Grid matching the user's screenshot layout */}
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {SPECIAL_EVENTS.map((event, idx) => (
                <div
                  key={idx}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-[#252321] bg-white shadow-[6px_6px_0_#252321] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[10px_10px_0_#C9362B]"
                >
                  {/* Photo Frame */}
                  <div className="relative aspect-16/10 w-full overflow-hidden bg-[#252321]">
                    <img
                      src={event.image}
                      alt={event.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                    {/* Kanji Tag */}
                    <span
                      className="absolute right-3 top-3 rounded-md bg-black/60 px-2 py-1 text-xs font-bold text-white/90 backdrop-blur-xs"
                      style={{ fontFamily: KANJI_FONT }}
                    >
                      {event.kanji}
                    </span>
                  </div>

                  {/* Ribbon Label */}
                  <div className="relative -mt-4 mx-3 rounded-lg bg-[#C9362B] px-4 py-2.5 text-center shadow-md">
                    <h3
                      className="text-base font-bold uppercase tracking-wider text-white sm:text-lg"
                      style={{ fontFamily: HEADING_FONT }}
                    >
                      {event.title}
                    </h3>
                  </div>

                  {/* Description Box */}
                  <div className="flex flex-1 flex-col justify-between p-5 pt-3 text-center sm:p-6 sm:pt-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#C9362B]">
                      {event.subtitle}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-[#4A4340] sm:text-sm">
                      {event.description}
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#252321]/70 group-hover:text-[#C9362B] transition-colors">
                      <span>Experience It</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <WaveDivider />

        {/* =========================================================================
            SECTION 3: THE 2-DAY DELEGATE JOURNEY
           ========================================================================= */}
        <section className="relative px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#C9362B]">
                <Calendar className="h-4 w-4" />
                <span style={{ fontFamily: LABEL_FONT }}>THE EXPEDITION</span>
              </div>
              <h2
                className="mt-3 text-[clamp(2.2rem,5vw,3.6rem)] uppercase leading-tight text-[#252321]"
                style={{ fontFamily: HEADING_FONT }}
              >
                THE 3-DAY DELEGATE JOURNEY
              </h2>
              <p className="mx-auto mt-2 max-w-lg text-sm text-[#59524C] sm:text-base">
                From the moment you step foot at the venue to the final roll call, every hour is crafted for transformation.
              </p>
            </div>

            {/* Timeline Cards */}
            <div className="mt-12 grid gap-6 sm:grid-cols-2 max-w-4xl mx-auto lg:gap-8">
              {JOURNEY_DAYS.map((d, i) => (
                <div
                  key={i}
                  className="relative flex flex-col rounded-2xl border border-[#252321]/15 bg-white/90 p-6 shadow-[0_8px_24px_rgba(37,35,33,0.06)] sm:p-7"
                >
                  <div className="flex items-center justify-between border-b border-[#252321]/10 pb-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C9362B]">
                        {d.day}
                      </span>
                      <h3 className="mt-1 text-xl font-bold uppercase tracking-wide text-[#252321]" style={{ fontFamily: HEADING_FONT }}>
                        {d.title}
                      </h3>
                    </div>
                    <span className="text-3xl font-black text-[#C9362B]/30" style={{ fontFamily: KANJI_FONT }}>
                      {d.kanji}
                    </span>
                  </div>

                  <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-[#736B63]">
                    {d.theme}
                  </p>

                  <ul className="mt-5 space-y-3">
                    {d.points.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-[#3D3833] sm:text-sm">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#C9362B]" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <WaveDivider />

        {/* =========================================================================
            SECTION 4: MEET THE CONFERENCE TEAM CTA
           ========================================================================= */}
        <section className="relative px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border-2 border-[#252321] bg-gradient-to-br from-[#FAF6EE] via-[#F8F3E9] to-[#F1E5D5] p-8 shadow-[8px_8px_0_#252321] sm:p-12 lg:p-14">
            <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_auto_1fr]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#C9362B]/30 bg-[#C9362B]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#C9362B]">
                  <Hanko char="組" size={20} />
                  <span>BEHIND THE SCENES</span>
                </div>

                <h3
                  className="mt-4 text-[clamp(2rem,5vw,3.2rem)] uppercase leading-tight text-[#252321]"
                  style={{ fontFamily: HEADING_FONT }}
                >
                  MEET THE LEADERS FORGING CATALYST 7.0
                </h3>

                <p className="mt-4 text-sm leading-relaxed text-[#4A4340] sm:text-base">
                  A powerhouse coalition of Executive Board facilitators (FACI) and Organizing Committee co-facilitators (CO FACI) working relentlessly
                  around the clock to deliver Sri Lanka&apos;s ultimate youth summit.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    to="/conference-team"
                    className="inline-flex min-h-[48px] items-center gap-2.5 rounded-full bg-[#C9362B] px-8 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-[0_8px_20px_rgba(201,54,43,0.35)] transition-all hover:-translate-y-0.5 hover:bg-[#A8261E]"
                  >
                    <span>Meet the Conference Team</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/conference-team?team=eb"
                    className="inline-flex min-h-[48px] items-center gap-2 rounded-full border border-[#252321] px-6 text-xs font-bold uppercase tracking-[0.18em] text-[#252321] transition-colors hover:bg-[#252321] hover:text-[#FAF6EE]"
                  >
                    <span>View Executive Board</span>
                  </Link>
                </div>
              </div>

              {/* Decorative Divider */}
              <div className="hidden h-40 w-px bg-[#252321]/20 lg:block" />

              {/* Decorative Torii illustration */}
              <div className="flex justify-center">
                <div className="relative">
                  <img
                    src={ART.torii}
                    alt=""
                    aria-hidden="true"
                    className="w-48 sm:w-56 lg:w-64 drop-shadow-[0_12px_24px_rgba(201,54,43,0.2)]"
                  />
                  <div
                    className="absolute -bottom-2 -right-2 text-5xl font-black text-[#C9362B]/20"
                    style={{ fontFamily: KANJI_FONT }}
                  >
                    理事会
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 5: REGISTRATION PRE-FOOTER CTA
           ========================================================================= */}
        <section className="relative px-4 pb-20 pt-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-4 flex items-center justify-center gap-4" aria-hidden="true">
              <span className="h-px w-12 bg-[#252321]/30 sm:w-20" />
              <Hanko char="命" size={38} />
              <span className="h-px w-12 bg-[#252321]/30 sm:w-20" />
            </div>

            <h2
              className="text-[clamp(2.4rem,6vw,4.2rem)] uppercase leading-none tracking-tight text-[#252321]"
              style={{ fontFamily: HEADING_FONT }}
            >
              YOUR SQUAD AWAITS
            </h2>

            <p className="mx-auto mt-4 max-w-lg text-sm text-[#4A4340] sm:text-base">
              Seats at Catalyst 7.0 are limited to maintain our high-touch delegate experience. Claim your place today and
              dare beyond definition.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/register"
                className="inline-flex min-h-[50px] items-center gap-2.5 rounded-full bg-[#C9362B] px-9 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-[0_10px_26px_rgba(201,54,43,0.4)] transition-all hover:-translate-y-0.5 hover:bg-[#A8261E]"
              >
                <span>Register for Catalyst 7.0</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/merch"
                className="inline-flex min-h-[50px] items-center rounded-full border border-[#252321] px-8 text-xs font-bold uppercase tracking-[0.18em] text-[#252321] transition-colors hover:bg-[#252321] hover:text-[#FAF6EE]"
              >
                <span>Explore Official Merch</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
