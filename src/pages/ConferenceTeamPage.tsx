import React, { useState } from 'react'
import { TagMark } from '../components/brand/CatalystTag';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { ArrowRight, ArrowUpRight, ArrowUp } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { OcRoster } from '../components/OcRoster'
import { EbRoster } from '../components/EbRoster'
import { Navbar } from '../components/Navbar'
import { SakuraPetals } from '../components/SakuraPetals'

// ============================================================================
// TEAM TABS. The people themselves live in the roster components:
//   OC -> components/OcRoster.tsx   (Conference Managers + department posters + group photo)
//   EB -> components/EbRoster.tsx   (one slide per member + group photo)
// This file only holds the tab titles and blurbs.
// ============================================================================
type TeamKey = 'eb' | 'oc'

const TEAMS: Record<TeamKey, { tabLabel: string; kanji: string; title: string; words: [string, string]; jp: string; blurb: string }> = {
  eb: {
    tabLabel: 'FACIs',
    kanji: '理',
    title: 'Executive Board',
    words: ['Executive', 'Board'],
    jp: '理事会',
    blurb: 'Stewards of youth leadership and governance across AIESEC in SLIIT.',
  },
  oc: {
    tabLabel: 'CO FACIs',
    kanji: '組',
    title: 'Organizing Committee',
    words: ['Organizing', 'Committee'],
    jp: '実行委員会',
    blurb: 'The leaders forging the Catalyst 7.0 crucible.',
  },
}

const LINKS = [
  { to: '/about', kanji: '触', title: 'About Catalyst 7.0', body: 'The story, the pillars and the journey.' },
  { to: '/gallery', kanji: '記', title: 'Moments & Legacy', body: 'Faces and stories from past editions.' },
  { to: '/merch', kanji: '品', title: 'Official Merchandise', body: 'Delegate apparel, hats and collectibles.' },
  { to: '/register', kanji: '参', title: 'Register Now', body: 'Secure your place at Catalyst 7.0.' },
]

const HEADING_FONT = "'Jansina', 'Brusher', 'Shippori Mincho', serif"
const KANJI_FONT = "'Noto Serif JP', 'Shippori Mincho', serif"
const LABEL_FONT = "'Noto Sans JP', 'Montserrat', sans-serif"
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const SEIGAIHA = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='20' viewBox='0 0 40 20'%3E%3Cg fill='%23F4ECE0' stroke='%23C9362B' stroke-width='1.4'%3E%3Ccircle cx='0' cy='10' r='18'/%3E%3Ccircle cx='0' cy='10' r='12'/%3E%3Ccircle cx='0' cy='10' r='6'/%3E%3Ccircle cx='40' cy='10' r='18'/%3E%3Ccircle cx='40' cy='10' r='12'/%3E%3Ccircle cx='40' cy='10' r='6'/%3E%3Ccircle cx='20' cy='20' r='18'/%3E%3Ccircle cx='20' cy='20' r='12'/%3E%3Ccircle cx='20' cy='20' r='6'/%3E%3C/g%3E%3C/svg%3E")`

// ============================================================================
// ICONS
// ============================================================================
const BrushUnderline = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 420 28" fill="none" className={className} aria-hidden="true" preserveAspectRatio="none">
    <path
      d="M6 16 C45 10, 95 8, 150 9 C220 10, 290 8, 350 12 C385 14, 405 16, 416 13 C405 20, 370 21, 320 20 C240 18, 160 21, 90 20 C50 19, 20 20, 6 16 Z"
      fill="#C9362B"
    />
  </svg>
)

const Divider = () => (
  <div
    aria-hidden="true"
    className="h-5 w-full"
    style={{ backgroundImage: SEIGAIHA, backgroundSize: '40px 20px', backgroundRepeat: 'repeat-x' }}
  />
)

// ============================================================================
// PAGE
// ============================================================================
export default function ConferenceTeamPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const reduce = useReducedMotion()

  const [tab, setTab] = useState<TeamKey>(searchParams.get('team') === 'oc' ? 'oc' : 'eb')
  const team = TEAMS[tab]
  const other: TeamKey = tab === 'oc' ? 'eb' : 'oc'

  const switchTab = (next: TeamKey) => {
    setTab(next)
    setSearchParams({ team: next }, { replace: true })
  }

  // hero cards: pick a team, then glide down to the directory
  const jumpTo = (next: TeamKey) => {
    switchTab(next)
    requestAnimationFrame(() =>
      document.getElementById('team-directory')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }),
    )
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip bg-[#F8F3E9] font-sans text-[#252321] selection:bg-[#C9362B] selection:text-white">
      <Navbar />

      {/* fixed full-screen layers are skipped on the EB tab: its slides are opaque, so they could not be seen anyway */}
      {tab !== 'eb' && (
        <div className="pointer-events-none fixed inset-0 z-10 opacity-60">
          <SakuraPetals enabled={true} />
        </div>
      )}

      {/* BACKGROUND ILLUSTRATIONS (very faint) */}
      {tab !== 'eb' && (
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -right-[8%] top-[12%] w-[380px] select-none opacity-[0.045] sm:-right-[4%] sm:w-[540px] md:w-[680px]">
          <img src="/assets/illustrations/gdj-building-8171699.svg" alt="" className="h-auto w-full object-contain grayscale" />
        </div>
        <div className="absolute -left-[10%] top-[48%] w-[320px] select-none opacity-[0.04] sm:-left-[5%] sm:w-[480px] md:w-[600px]">
          <img src="/assets/illustrations/susannp4-tree-1586365_1920.webp" alt="" className="h-auto w-full object-contain grayscale" />
        </div>
        <div
          className="absolute right-[-5%] top-[15%] select-none text-[18vw] font-black leading-none text-[#252321]/[0.025]"
          style={{ fontFamily: KANJI_FONT }}
        >
          武士道
        </div>
      </div>
      )}

      <main className="relative z-20 flex-1">
        {/* HERO: headline + samurai in the sun */}
        <section className="mx-auto max-w-6xl px-4 pb-10 pt-8 sm:px-6 sm:pb-14 sm:pt-10">
          <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-6">
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE }}
                className="mb-5 inline-flex max-w-full items-center gap-2.5 rounded-full border border-[#252321]/30 bg-[#F8F3E9]/95 py-1.5 pl-2 pr-4 sm:pr-5"
              >
                <TagMark />
                <span
                  className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-[#252321] sm:text-xs sm:tracking-[0.24em]"
                  style={{ fontFamily: LABEL_FONT }}
                >
                  AIESEC in SLIIT · The Team
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mb-3 flex items-center justify-center gap-3 lg:justify-start"
              >
                <span className="h-px w-10 bg-[#C9362B]/60" />
                <span className="pl-[0.4em] text-xs font-bold tracking-[0.45em] text-[#C9362B] sm:text-sm" style={{ fontFamily: KANJI_FONT }}>
                  人 々
                </span>
              </motion.div>

              {/* brush-heading (from index.css) stops the painted strokes being clipped */}
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
                className="brush-heading tracking-[0.03em]"
                style={{ fontFamily: HEADING_FONT }}
              >
                <span className="block text-[clamp(1.4rem,3.8vw,2.6rem)] text-[#252321]">THE PEOPLE BEHIND</span>
                <span className="relative mt-1 inline-block max-w-full text-[clamp(2.9rem,12vw,5.2rem)] leading-[1.02] text-[#C9362B] lg:text-[clamp(3.4rem,6vw,5.8rem)]">
                  CATALYST 7.0
                  <BrushUnderline className="mt-[-2px] block h-3 w-full sm:h-5" />
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.25, ease: EASE }}
                className="mx-auto mt-6 max-w-xl text-base leading-[1.7] text-[#252321]/85 sm:text-lg lg:mx-0"
              >
                Catalyst 7.0 is the flagship leadership seminar of AIESEC in SLIIT, forged in the discipline of the
                samurai and the audacity of modern innovation. Meet the people who make it happen.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.35, ease: EASE }}
                className="mt-7 flex flex-wrap items-center justify-center gap-3 sm:gap-4 lg:justify-start"
              >
                <Link
                  to="/register"
                  className="group inline-flex min-h-[46px] cursor-pointer items-center justify-center gap-2 rounded-full bg-[#C9362B] px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-[0_6px_22px_rgba(201,54,43,0.32)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(201,54,43,0.42)] sm:px-9 sm:text-sm"
                >
                  <span>Register now</span>
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/about"
                  className="inline-flex min-h-[46px] cursor-pointer items-center justify-center rounded-full border border-[#252321]/80 px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-[#252321] transition-all duration-300 hover:bg-[#252321] hover:text-[#F8F3E9] sm:px-9 sm:text-sm"
                >
                  About Catalyst
                </Link>
              </motion.div>
            </div>

            {/* samurai in front of a rising sun (static: no looping animation, so it costs nothing while you scroll) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: EASE }}
              aria-hidden="true"
              className="relative mx-auto aspect-square w-[min(78vw,430px)]"
            >
              <div
                className="absolute inset-[8%] rounded-full"
                style={{ background: 'radial-gradient(circle at 38% 32%, #FF8A6E 0%, #E0452F 46%, #B51E23 100%)', boxShadow: '0 26px 50px rgba(150,20,30,0.22)' }}
              />
              <div className="absolute inset-[2%] rounded-full border border-[#C9362B]/35" />
              <div className="absolute -inset-[4%] rounded-full border border-[#C9362B]/15" />
              <img
                src="/assets/illustrations/benkageyama-samurai-5135974_1920.png"
                alt=""
                draggable={false}
                decoding="async"
                className="absolute inset-x-0 bottom-[-3%] mx-auto h-[106%] w-auto max-w-[118%] select-none object-contain drop-shadow-[0_20px_28px_rgba(60,5,15,0.35)]"
              />
              <span
                className="absolute bottom-[8%] right-[3%] flex h-14 w-14 rotate-6 items-center justify-center rounded-md bg-[#C9362B] text-3xl font-bold text-white shadow-[0_6px_14px_rgba(120,10,25,0.3)] lg:h-16 lg:w-16 lg:text-4xl"
                style={{ fontFamily: KANJI_FONT }}
              >
                士
              </span>
            </motion.div>
          </div>
        </section>

        <Divider />

        {/* TEAM DIRECTORY */}
        <section id="team-directory" className="relative scroll-mt-2 overflow-x-clip bg-[#F4ECE0]/70 pb-16 pt-16 sm:pb-24 sm:pt-24">
          {/* sunrise glow + faint concentric rings behind the heading (kept very light so the title stays crisp) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-[560px]"
            style={{ background: 'radial-gradient(ellipse 55% 70% at 50% 0%, rgba(201,54,43,0.14), rgba(201,54,43,0) 72%)' }}
          />
          {[520, 780, 1040].map((d, i) => (
            <div
              key={d}
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 rounded-full border border-[#C9362B]"
              style={{ width: d, height: d, top: -d / 2, marginLeft: -d / 2, opacity: 0.16 - i * 0.05 }}
            />
          ))}

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab + '-head'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="relative"
                >
                  {/* vertical Japanese labels, desktop only */}
                  <div aria-hidden="true" className="pointer-events-none absolute left-2 top-6 hidden h-[72%] items-start gap-3 lg:flex xl:left-8">
                    <span className="h-full w-px bg-gradient-to-b from-[#C9362B] to-transparent" />
                    <span className="text-lg tracking-[0.6em] text-[#252321]/70" style={{ writingMode: 'vertical-rl', fontFamily: KANJI_FONT }}>
                      {team.jp}
                    </span>
                  </div>
                  <div aria-hidden="true" className="pointer-events-none absolute right-2 top-6 hidden h-[72%] flex-row-reverse items-start gap-3 lg:flex xl:right-8">
                    <span className="h-full w-px bg-gradient-to-b from-[#C9362B] to-transparent" />
                    <span className="text-lg tracking-[0.6em] text-[#252321]/70" style={{ writingMode: 'vertical-rl', fontFamily: KANJI_FONT }}>
                      第七回
                    </span>
                  </div>

                  {/* eyebrow: stamped seal between two rules */}
                  <div className="mb-3 flex items-center justify-center gap-4">
                    <span className="h-px w-8 bg-[#C9362B]/60 sm:w-16" />
                    <motion.span
                      initial={{ scale: 1.9, rotate: -14, opacity: 0 }}
                      animate={{ scale: 1, rotate: -4, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 16, delay: 0.1 }}
                      className="flex rounded-full shadow-[0_6px_16px_rgba(201,54,43,0.35)]"
                      aria-hidden="true"
                    >
                      <TagMark size="lg" />
                    </motion.span>
                    <span
                      className="text-xs font-bold uppercase tracking-[0.3em] text-[#252321]/75"
                      style={{ fontFamily: LABEL_FONT }}
                    >
                      {team.tabLabel} · Catalyst 7.0
                    </span>
                    <span className="h-px w-8 bg-[#C9362B]/60 sm:w-16" />
                  </div>

                  {/* the title: two huge stacked lines (brush-heading stops the painted strokes being clipped) */}
                  <h2 className="brush-heading tracking-[0.03em]" style={{ fontFamily: HEADING_FONT }} aria-label={team.title}>
                    {team.words.map((w, i) => (
                      <motion.span
                        key={w}
                        initial={{ opacity: 0, y: 36 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.12 + i * 0.12, ease: EASE }}
                        aria-hidden="true"
                        className={`block text-[clamp(2.7rem,11vw,7.5rem)] uppercase leading-[1.04] ${
                          i === 0 ? 'text-[#252321]' : 'text-[#C9362B]'
                        }`}
                      >
                        {w}
                      </motion.span>
                    ))}
                  </h2>

                  <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.45, ease: EASE }}
                    className="mx-auto mt-1 w-[min(520px,78%)]"
                  >
                    <BrushUnderline className="block h-4 w-full sm:h-6" />
                  </motion.div>

                  {/* Japanese name */}
                  <div className="mt-5 flex items-center justify-center gap-4">
                    <span className="h-px w-10 bg-[#C9362B]/60 sm:w-16" />
                    <span
                      className="pl-[0.5em] text-sm font-bold tracking-[0.5em] text-[#C9362B] sm:text-base"
                      style={{ fontFamily: KANJI_FONT }}
                    >
                      {team.jp}
                    </span>
                    <span className="h-px w-10 bg-[#C9362B]/60 sm:w-16" />
                  </div>

                  <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[#252321]/75 sm:text-lg">{team.blurb}</p>
                </motion.div>
              </AnimatePresence>

              {/* team switch: bigger, with the kanji for each team */}
              <div
                role="tablist"
                aria-label="Choose a team"
                className="mx-auto mt-10 flex w-[min(100%,390px)] rounded-full border border-[#252321]/30 bg-[#FAF6EE] p-1.5 shadow-[0_8px_24px_rgba(37,35,33,0.08)]"
              >
                {(Object.keys(TEAMS) as TeamKey[]).map((key) => {
                  const active = key === tab
                  return (
                    <button
                      key={key}
                      role="tab"
                      aria-selected={active}
                      onClick={() => switchTab(key)}
                      className={`relative flex min-h-[46px] flex-1 cursor-pointer items-center justify-center rounded-full py-3 px-3 text-xs sm:text-sm font-bold uppercase tracking-[0.16em] sm:tracking-[0.22em] whitespace-nowrap transition-colors duration-300 ${
                        active ? 'text-white' : 'text-[#252321]/60 hover:text-[#252321]'
                      }`}
                      style={{ fontFamily: LABEL_FONT }}
                    >
                      {active && (
                        <motion.span
                          layoutId="team-tab-pill"
                          className="absolute inset-0 rounded-full bg-[#C9362B] shadow-[0_6px_18px_rgba(201,54,43,0.3)]"
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      )}
                      <span className="relative inline-flex items-center gap-2.5">
                        <span className="text-base normal-case tracking-normal" style={{ fontFamily: KANJI_FONT }} aria-hidden="true">
                          {TEAMS[key].kanji}
                        </span>
                        {TEAMS[key].tabLabel}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* OC = Conference Managers + department posters, EB = one slide per member. Both include a group photo. */}
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-6 sm:mt-10"
            >
              {tab === 'oc' ? <OcRoster /> : <EbRoster />}
            </motion.div>
          </AnimatePresence>

          {/* slim hand-off to the other team (replaces the big cards that used to sit in the hero) */}
          <div className="relative mx-auto mt-10 max-w-4xl px-4 sm:mt-14 sm:px-6">
            <div className="flex flex-col items-center gap-4 border-y border-[#252321]/15 py-5 text-center sm:flex-row sm:justify-between sm:text-left">
              <div className="flex items-center gap-3.5">
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] bg-[#C9362B] text-lg font-bold text-white"
                  style={{ fontFamily: KANJI_FONT }}
                >
                  {TEAMS[other].kanji}
                </span>
                <p className="text-sm leading-snug text-[#252321]/80 sm:text-base">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.28em] text-[#C9362B]" style={{ fontFamily: LABEL_FONT }}>
                    Also on the team
                  </span>
                  Meet the {TEAMS[other].title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => jumpTo(other)}
                className="group inline-flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-full border border-[#252321]/80 px-6 text-xs font-bold uppercase tracking-[0.2em] text-[#252321] transition-colors duration-300 hover:bg-[#252321] hover:text-[#F8F3E9]"
                style={{ fontFamily: LABEL_FONT }}
              >
                {TEAMS[other].tabLabel}
                <ArrowUp size={15} className="transition-transform duration-300 group-hover:-translate-y-0.5" />
              </button>
            </div>
          </div>
        </section>

        <Divider />

        {/* CONTINUE */}
        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="mb-8 flex items-center gap-4">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[3px] bg-[#C9362B] text-xl text-white"
              style={{ fontFamily: KANJI_FONT }}
              aria-hidden="true"
            >
              続
            </span>
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#252321]" style={{ fontFamily: LABEL_FONT }}>
              Continue the journey
            </span>
            <span className="h-px flex-1 bg-[#252321]/20" />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="group relative flex min-h-[170px] flex-col justify-between overflow-hidden rounded-2xl border border-[#252321]/15 bg-[#FAF6EE]/85 p-6 transition-colors duration-300 hover:border-[#C9362B]/50"
              >
                <span
                  aria-hidden="true"
                  className="absolute -right-2 -top-5 select-none text-[8rem] leading-none text-[#C9362B]/10 transition-transform duration-500 group-hover:scale-110"
                  style={{ fontFamily: KANJI_FONT }}
                >
                  {l.kanji}
                </span>
                <div className="relative">
                  <h3 className="brush-heading text-3xl text-[#252321]" style={{ fontFamily: HEADING_FONT }}>
                    {l.title}
                  </h3>
                  <p className="mt-2 max-w-[28ch] text-sm leading-relaxed text-[#252321]/70">{l.body}</p>
                </div>
                <ArrowUpRight className="relative mt-5 h-5 w-5 self-end text-[#252321]/50 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#C9362B]" />
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}