import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { OcRoster } from '../components/OcRoster'
import { Navbar } from '../components/Navbar'
import { SakuraPetals } from '../components/SakuraPetals'

// ============================================================================
// TEAM DATA: to add or edit a person, change ONE line below.
// `role` is optional (falls back to the team's default label).
// Photos: public/assets/cat-oc-pics and public/assets/eb-pics (transparent cut-outs).
// ============================================================================
type Member = { name: string; role?: string; image: string }
type TeamKey = 'oc' | 'eb'

const OC_DIR = '/assets/cat-oc-pics/'
const EB_DIR = '/assets/eb-pics/'

const TEAMS: Record<
  TeamKey,
  { tabLabel: string; kanji: string; title: string; blurb: string; fallbackRole: string; members: Member[] }
> = {
  oc: {
    tabLabel: 'OC',
    kanji: '組',
    title: 'Organizing Committee',
    blurb: 'The leaders forging the Catalyst 7.0 crucible.',
    fallbackRole: 'Organizing Committee',
    members: [
      { name: 'Mahdy Hassan', role: 'OCP', image: OC_DIR + 'mahdy-hassan-ocp.webp' },
      { name: 'Harshitha Yasiru', role: 'OCVP Marketing', image: OC_DIR + 'harshitha-yasiru-ocvp-marketing.webp' },
      { name: 'Chetha Atapattu', role: 'OCVP PD', image: OC_DIR + 'chetha-atapattu-ocvp-pd.webp' },
      { name: 'Monali Edirisinghe', role: 'OCVP Finance', image: OC_DIR + 'monali-edirisinghe-ocvp-finance.webp' },
      { name: 'Binushi', role: 'OCVP Delegates & Events', image: OC_DIR + 'binushi-ocvp-delegates-and-events.webp' },
      { name: 'Lakwan', role: 'OCVP Logistics', image: OC_DIR + 'lakwan-ocvp-logistics.webp' },
    ],
  },
  eb: {
    tabLabel: 'EB',
    kanji: '理',
    title: 'Executive Board',
    blurb: 'Stewards of youth leadership and governance across AIESEC in SLIIT.',
    fallbackRole: 'Executive Board',
    members: [
      { name: 'Chelaka Wijesekara', image: EB_DIR + 'chelaka-wijesekara.webp' },
      { name: 'Shenise Pronk', image: EB_DIR + 'shenise-pronk.webp' },
      { name: 'Savinda Sithum', image: EB_DIR + 'savinda-sithum.webp' },
      { name: 'Chamindi Kaveesha', image: EB_DIR + 'chamindi-kaveesha.webp' },
      { name: 'Dinadi Jayathilake', image: EB_DIR + 'dinadi-jayathilake.webp' },
      { name: 'Nadun Weerakkody', image: EB_DIR + 'nadun-weerakkody.webp' },
      { name: 'Pethara Ranasinghe', image: EB_DIR + 'pethara-ranasinghe.webp' },
      { name: 'Fahad Faheem', image: EB_DIR + 'fahad-faheem.webp' },
      // these six are in your eb-pics zip but were missing from the page
      { name: 'Senaya Jayasuriya', image: EB_DIR + 'senaya-jayasuriya.webp' },
      { name: 'Dahamya Ranasinghe', image: EB_DIR + 'dahamya-ranasinghe.webp' },
      { name: 'Nadali Hansani', image: EB_DIR + 'nadali-hansani.webp' },
      { name: 'Sabeelur Rashaad', image: EB_DIR + 'sabeelur-rashaad.webp' },
      { name: 'Yenul Perera', image: EB_DIR + 'yenul-perera.webp' },
      { name: 'Minadi Athukorala', image: EB_DIR + 'minadi-athukorala.webp' },
    ],
  },
}

const LINKS = [
  { to: '/gallery', kanji: '記', title: 'Moments & Legacy', body: 'Faces and stories from past editions.' },
  { to: '/merch', kanji: '品', title: 'Official Merchandise', body: 'Delegate apparel, hats and collectibles.' },
  { to: '/register', kanji: '参', title: 'Register Now', body: 'Secure your place at Catalyst 7.0.' },
]

const HEADING_FONT = "'Jansina', 'Brusher', 'Shippori Mincho', serif"
const KANJI_FONT = "'Noto Serif JP', 'Shippori Mincho', serif"
const LABEL_FONT = "'Noto Sans JP', 'Montserrat', sans-serif"
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

// ============================================================================
// TORN-EDGE BANDS (ported from the OC poster). Sizes are in cqw so the rows
// keep the same proportions at any width.
// ============================================================================
const N = 110
const ROW_H = 27
const EDGE_IN = 8
const GAP = 1.15

const rnd = (seed: number) => () => {
  let s = (seed |= 0)
  s = (s + 0x6d2b79f5) | 0
  seed = s
  let t = Math.imul(s ^ (s >>> 15), 1 | s)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const jag = (r: () => number, s: number) => {
  const a: number[] = []
  for (let i = 0; i <= N; i++) {
    a.push(r() - 0.5 + 0.4 * Math.sin(i * 0.35 + s) + (r() > 0.9 ? (r() - 0.5) * 1.8 : 0))
  }
  return a
}

type Edge = { k: number; a: number[]; b: number[] }

const line = (ed: Edge, arr: number[], base: number, rev?: boolean) => {
  const out: string[] = []
  for (let q = 0; q <= N; q++) {
    const x = q / N
    out.push(`${(x * 100).toFixed(2)}% ${(base + ed.k * (x - 0.5) + arr[q]).toFixed(2)}cqw`)
  }
  return rev ? out.reverse() : out
}

const buildClips = (count: number) => {
  const edges: Edge[] = []
  for (let e = 0; e <= count; e++) {
    const r = rnd(e * 97 + 13)
    edges.push({ k: e % 2 ? 3 : -12.5, a: jag(r, e * 2), b: jag(r, e * 2 + 3) })
  }
  return Array.from({ length: count }, (_, i) => {
    const pts = line(edges[i], edges[i].b, EDGE_IN + GAP).concat(
      line(edges[i + 1], edges[i + 1].a, EDGE_IN + ROW_H - GAP, true)
    )
    return `polygon(${pts.join(',')})`
  })
}

// FIX: photos are now forced into the same box (cover, top-aligned) so head-and-shoulder
// shots and full-length shots end up the same size. Rows are full-bleed on phones.
const TR_CSS = `
.tr-wrap{container-type:inline-size;width:100%}
.tr-rows{--k:1cqw;--tone-a:#C9362B;--tone-b:#A8251B;padding:calc(17*var(--k)) 0 calc(9*var(--k))}
.tr-rows.eb{--tone-a:#A3281F;--tone-b:#7A1B15}
.tr-row{position:relative;height:calc(27*var(--k))}
.tr-bg{position:absolute;inset:calc(-8*var(--k)) 0;background:linear-gradient(var(--tone-a),var(--tone-b));overflow:hidden}
.tr-big{position:absolute;top:50%;transform:translateY(-50%);font-family:'Bison','Anton','Impact',sans-serif;font-weight:700;line-height:1;text-transform:uppercase;white-space:nowrap;color:rgba(255,255,255,.15)}
.tr-ghost{position:absolute;bottom:calc(7*var(--k));width:calc(26*var(--k));height:calc(42*var(--k));object-fit:cover;object-position:top;opacity:.28;filter:saturate(.4);-webkit-mask-image:linear-gradient(#000 55%,transparent);mask-image:linear-gradient(#000 55%,transparent)}
.tr-pic{position:absolute;width:calc(28*var(--k));height:calc(43*var(--k));-webkit-mask-image:linear-gradient(#000 66%,transparent 95%);mask-image:linear-gradient(#000 66%,transparent 95%)}
.tr-pic img{position:absolute;inset:calc(1*var(--k)) calc(1*var(--k)) 0;width:calc(100% - 2*var(--k));height:calc(100% - 1*var(--k));object-fit:cover;object-position:top center;
  filter:drop-shadow(max(2px,calc(.45*var(--k))) 0 0 #fff) drop-shadow(min(-2px,calc(-.45*var(--k))) 0 0 #fff) drop-shadow(0 max(2px,calc(.45*var(--k))) 0 #fff) drop-shadow(0 min(-2px,calc(-.45*var(--k))) 0 #fff) drop-shadow(0 0 calc(.8*var(--k)) rgba(255,214,196,.75))}
.tr-nm{position:absolute;top:calc(6.5*var(--k));margin:0;color:#fff;white-space:nowrap;line-height:1.1;font-size:max(12px,calc(3.9*var(--k)));transform:rotate(-2deg) skewX(-8deg);text-shadow:0 calc(.2*var(--k)) calc(.6*var(--k)) rgba(0,0,0,.25)}
.tr-nm h3{margin:0;font-family:'Bison','Oswald',sans-serif;font-weight:700;font-size:inherit;letter-spacing:.06em;text-transform:uppercase}
.tr-nm p{margin:calc(1.1*var(--k)) 0 0;font-family:'Montserrat',sans-serif;font-weight:600;font-size:max(8.5px,calc(2*var(--k)));letter-spacing:.16em;text-transform:uppercase;color:#FFE3D6;text-shadow:none}
.tr-row.l .tr-big{right:calc(-4*var(--k))}.tr-row.r .tr-big{left:calc(-4*var(--k))}
.tr-row.l .tr-ghost{right:calc(22*var(--k))}.tr-row.r .tr-ghost{left:calc(24*var(--k))}
.tr-row.l .tr-pic{left:calc(5*var(--k));bottom:calc(1.5*var(--k))}.tr-row.r .tr-pic{right:calc(5*var(--k));bottom:calc(4.5*var(--k))}
.tr-row.l .tr-nm{right:calc(9*var(--k));text-align:right}.tr-row.r .tr-nm{left:calc(10*var(--k));text-align:left}
`

const SEIGAIHA = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='20' viewBox='0 0 40 20'%3E%3Cg fill='%23F4ECE0' stroke='%23C9362B' stroke-width='1.4'%3E%3Ccircle cx='0' cy='10' r='18'/%3E%3Ccircle cx='0' cy='10' r='12'/%3E%3Ccircle cx='0' cy='10' r='6'/%3E%3Ccircle cx='40' cy='10' r='18'/%3E%3Ccircle cx='40' cy='10' r='12'/%3E%3Ccircle cx='40' cy='10' r='6'/%3E%3Ccircle cx='20' cy='20' r='18'/%3E%3Ccircle cx='20' cy='20' r='12'/%3E%3Ccircle cx='20' cy='20' r='6'/%3E%3C/g%3E%3C/svg%3E")`

// ============================================================================
// ICONS
// ============================================================================
const SakuraIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 2 C13.5 5 15.5 6 18.5 4.5 C17.5 7.5 18 9.5 21 10.5 C18.5 12 17.5 14 19 17 C16 16.5 14 17.5 13 20.5 C12 18 10 17 7 18.5 C8 15.5 7.5 13.5 4.5 12.5 C7 11 8 9 6.5 6 C9.5 6.5 11.5 5.5 12 2 Z" />
    <circle cx="12" cy="12" r="2.2" fill="#E9B9A5" />
  </svg>
)

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
// ONE TORN POSTER ROW
// ============================================================================
const TeamRow = ({
  member,
  index,
  clip,
  fallbackRole,
}: {
  member: Member
  index: number
  clip: string
  fallbackRole: string
}) => {
  const [failed, setFailed] = useState(false)
  const side = index % 2 ? 'r' : 'l'
  const dir = side === 'l' ? -1 : 1
  const first = member.name.split(' ')[0]
  const fs = Math.min(31, 189 / first.length)

  return (
    <section className={`tr-row ${side}`}>
      <div className="tr-bg" aria-hidden="true" style={{ clipPath: clip }}>
        <motion.span
          className="tr-big"
          style={{ fontSize: `calc(${fs.toFixed(1)} * var(--k))` }}
          initial={{ opacity: 0, x: -dir * 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1, ease: EASE }}
        >
          {first}
        </motion.span>
        {!failed && <img className="tr-ghost" src={member.image} alt="" loading="lazy" decoding="async" />}
      </div>

      {!failed && (
        <motion.div
          className="tr-pic"
          initial={{ opacity: 0, x: dir * 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.85, ease: EASE }}
        >
          <img
            src={member.image}
            alt={member.name}
            loading="lazy"
            decoding="async"
            draggable={false}
            onError={() => setFailed(true)}
          />
        </motion.div>
      )}

      <motion.div
        className="tr-nm"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
      >
        <h3>{member.name}</h3>
        <p>{member.role ?? fallbackRole}</p>
      </motion.div>
    </section>
  )
}

// ============================================================================
// PAGE
// ============================================================================
export default function AboutPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [tab, setTab] = useState<TeamKey>(searchParams.get('team') === 'eb' ? 'eb' : 'oc')
  const team = TEAMS[tab]
  // torn rows are only used for the EB tab now; the OC tab uses the full <OcRoster />
  const clips = useMemo(() => buildClips(TEAMS.eb.members.length), [])

  const switchTab = (next: TeamKey) => {
    setTab(next)
    setSearchParams({ team: next }, { replace: true })
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#F8F3E9] font-sans text-[#252321] selection:bg-[#C9362B] selection:text-white">
      <style>{TR_CSS}</style>

      <Navbar />

      <div className="pointer-events-none fixed inset-0 z-10 opacity-60">
        <SakuraPetals enabled={true} />
      </div>

      {/* BACKGROUND ILLUSTRATIONS (very faint) */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -right-[8%] top-[12%] w-[380px] select-none opacity-[0.045] sm:-right-[4%] sm:w-[540px] md:w-[680px]">
          <img src="/assets/illustrations/gdj-building-8171699.svg" alt="" className="h-auto w-full object-contain grayscale" />
        </div>
        <div className="absolute -left-[10%] top-[48%] w-[320px] select-none opacity-[0.04] sm:-left-[5%] sm:w-[480px] md:w-[600px]">
          <img src="/assets/illustrations/susannp4-tree-1586365_1920.png" alt="" className="h-auto w-full object-contain grayscale" />
        </div>
        <div
          className="absolute right-[-5%] top-[15%] select-none text-[18vw] font-black leading-none text-[#252321]/[0.025]"
          style={{ fontFamily: KANJI_FONT }}
        >
          武士道
        </div>
      </div>

      <main className="relative z-20 flex-1">
        {/* HERO */}
        <section className="mx-auto max-w-5xl px-4 pb-12 pt-28 text-center sm:px-6 sm:pb-20 sm:pt-36">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="mb-6 inline-flex max-w-full items-center gap-2.5 rounded-full border border-[#252321]/30 bg-[#F8F3E9]/95 px-4 py-1.5 sm:px-5 sm:py-2"
          >
            <SakuraIcon className="h-3.5 w-3.5 shrink-0 text-[#C9362B]" />
            <span
              className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-[#252321] sm:text-xs sm:tracking-[0.24em]"
              style={{ fontFamily: LABEL_FONT }}
            >
              AIESEC in SLIIT · The Team
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
            <span className="block text-[clamp(1.25rem,3.4vw,2.4rem)] text-[#252321]">THE PEOPLE BEHIND</span>
            <span className="relative mt-1 inline-block max-w-full text-[clamp(2.6rem,11.5vw,8.5rem)] text-[#C9362B]">
              CATALYST 7.0
              <BrushUnderline className="mt-[-2px] block h-3 w-full sm:h-5" />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: EASE }}
            className="mx-auto mt-7 max-w-2xl text-base leading-[1.7] text-[#252321]/85 sm:text-lg"
          >
            Catalyst 7.0 is the flagship leadership seminar of AIESEC in SLIIT, forged in the discipline of the
            samurai and the audacity of modern innovation. Meet the people who make it happen.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: EASE }}
            className="mt-9 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
          >
            <Link
              to="/register"
              className="group inline-flex min-h-[46px] cursor-pointer items-center justify-center gap-2 rounded-full bg-[#C9362B] px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-[0_6px_22px_rgba(201,54,43,0.32)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(201,54,43,0.42)] sm:px-9 sm:text-sm"
            >
              <span>Register now</span>
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/gallery"
              className="inline-flex min-h-[46px] cursor-pointer items-center justify-center rounded-full border border-[#252321]/80 px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-[#252321] transition-all duration-300 hover:bg-[#252321] hover:text-[#F8F3E9] sm:px-9 sm:text-sm"
            >
              View gallery
            </Link>
          </motion.div>
        </section>

        <Divider />

        {/* TEAM DIRECTORY */}
        <section className="overflow-x-clip bg-[#F4ECE0]/70 pb-16 pt-14 sm:pb-24 sm:pt-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="text-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab + '-head'}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3, ease: EASE }}
                >
                  <div className="mb-4 inline-flex items-center gap-3">
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-[3px] bg-[#C9362B] text-xl text-white"
                      style={{ fontFamily: KANJI_FONT }}
                      aria-hidden="true"
                    >
                      {team.kanji}
                    </span>
                    <span
                      className="text-xs font-bold uppercase tracking-[0.3em] text-[#252321]/70"
                      style={{ fontFamily: LABEL_FONT }}
                    >
                      {team.tabLabel} · Catalyst 7.0
                    </span>
                  </div>

                  <h2
                    className="brush-heading text-[clamp(2rem,6vw,4rem)] tracking-[0.03em] text-[#252321]"
                    style={{ fontFamily: HEADING_FONT }}
                  >
                    {team.title.toUpperCase()}
                  </h2>
                  <BrushUnderline className="mx-auto mt-1 block h-3 w-[min(260px,60%)]" />
                  <p className="mx-auto mt-4 max-w-md text-sm text-[#252321]/70 sm:text-base">{team.blurb}</p>
                </motion.div>
              </AnimatePresence>

              <div
                role="tablist"
                aria-label="Choose a team"
                className="mx-auto mt-8 flex w-[min(100%,300px)] rounded-full border border-[#252321]/30 bg-[#FAF6EE] p-1"
              >
                {(Object.keys(TEAMS) as TeamKey[]).map((key) => {
                  const active = key === tab
                  return (
                    <button
                      key={key}
                      role="tab"
                      aria-selected={active}
                      onClick={() => switchTab(key)}
                      className={`relative flex-1 cursor-pointer rounded-full py-2.5 text-xs font-bold uppercase tracking-[0.3em] transition-colors duration-300 ${
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
                      <span className="relative">{TEAMS[key].tabLabel}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* OC = full department roster, EB = torn poster rows. All on this page. */}
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-6 sm:mt-10"
            >
              {tab === 'oc' ? (
                <OcRoster />
              ) : (
                <div className="tr-wrap mx-auto max-w-4xl">
                  <div className="tr-rows eb">
                    {team.members.map((m, i) => (
                      <TeamRow key={m.name} member={m} index={i} clip={clips[i]} fallbackRole={team.fallbackRole} />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
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

          <div className="grid gap-5 md:grid-cols-3">
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