import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { TagMark } from './brand/CatalystTag';
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { OcGroup, buildGroupRows, CSS, GCSS, playFor, photo } from './OcRoster'
import type { GroupDef } from './OcRoster'

// ============================================================================
// EXECUTIVE BOARD: one full-width "slide" per member, then the "EB REVENANTS" group photo.
//
// Each slide: big position plaque (brush-stroke banner with a giant role code, e.g. "FnL"),
// script first name over a bold surname, the person in front of a red sun with a brush
// enso ring, a sakura branch, a floating illustration and a faint silhouette.
//
// How the slides connect:
//   - no gaps: slides are stacked flush and each one ends in a seigaiha wave edge painted
//     in the NEXT slide's colour, so they flow into each other
//   - slides alternate LIGHT (cream, crimson plaque) and DARK (wine, gold plaque)
//   - a gold progress thread runs down the left edge of the whole list as you scroll
//
// Motion (GSAP + ScrollTrigger), all off for prefers-reduced-motion:
//   enter  : a colour curtain lifts, then sun + enso ring, person, branch, name letters,
//            the plaque unrolls and its role code drops in letter by letter
//   scroll : photo, sun, text, kanji, illustration and silhouette drift at their own speeds
//   mouse  : (desktop only) person, branch and kanji follow the pointer, plus a spotlight
//   idle   : plaque shine sweeps, illustration floats, enso + sun pattern orbit, mist drifts
//            (all only while the slide is on screen)
//
// To add / edit a person: change ONE object in MEMBERS (order = order on the page).
//   role  the position, written like "LCVP Finance and Legal (FnL)": the text in brackets
//         becomes the giant code, the rest becomes the title under it
//   jp    (optional) Japanese line under the name, default 理事会
//   kanji (optional) big faint watermark, default cycles through the 7 bushido virtues
//   ph    (optional) person height in units (bigger = bigger person)
//   keep  (optional) how much of the person to show from the top (0.6 = head to hips)
// Photos: public/assets/eb-pics/ (transparent cut-outs, auto-trimmed in the browser)
// ============================================================================
const DIR = '/assets/eb-pics/'
const ILL = '/assets/illustrations/'
const HERO = '/assets/hero-section-assets/'

type EbPerson = {
  name: string
  file: string
  role?: string
  jp?: string
  kanji?: string
  ph?: number
  keep?: number
}

const MEMBERS: EbPerson[] = [
  { name: 'Chelaka Wijesekara', file: DIR + 'chelaka-wijesekara.webp', role: 'Local Committee President (LCP)' },
  { name: 'Pethara Ranasinghe', file: DIR + 'pethara-ranasinghe.webp', role: 'LCVP Finance and Legal (FnL)' },
  { name: 'Nadun Weerakkody', file: DIR + 'nadun-weerakkody.webp', role: 'LCVP Business Development (BD)' },
  { name: 'Dinadi Jayathilake', file: DIR + 'dinadi-jayathilake.webp', role: 'LCVP Talent Management (TM)' },
  { name: 'Minadi Athukorala', file: DIR + 'minadi-athukorala.webp', role: 'LCVP Expansions Management (EM)' },
  { name: 'Fahad Faheem', file: DIR + 'fahad-faheem.webp', role: 'LCVP Marketing (MKT)' },
  { name: 'Shenise Pronk', file: DIR + 'shenise-pronk.webp', role: 'LCVP Public Relations (PR)' },
  { name: 'Sabeelur Rashaad', file: DIR + 'sabeelur-rashaad.webp', role: 'LCVP Incoming Global Volunteer – Business to Business (iGV B2B)' },
  { name: 'Savinda Sithum', file: DIR + 'savinda-sithum.webp', role: 'LCVP Incoming Global Volunteer – Customer Experience (iGV CXP)' },
  { name: 'Dinidi Senanayake', file: DIR + 'dinidi-senanayake.webp', role: 'LCVP Incoming Global Volunteer – International Relations & Matching (iGV IR & M)', keep: 1.0 },
  { name: 'Yenul Perera', file: DIR + 'yenul-perera.webp', role: 'LCVP Incoming Global Talent – Business to Business & Value Delivery (iGT B2B & VD)' },
  { name: 'Dahamya Ranasinghe', file: DIR + 'dahamya-ranasinghe.webp', role: 'LCVP Incoming Global Talent – International Relations & Matching (iGT IR & M)' },
  { name: 'Senaya Jayasuriya', file: DIR + 'senaya-jayasuriya.webp', role: 'LCVP Outgoing Global Volunteer – Partner Support (oGV PS)' },
  { name: 'Nadali Hansani', file: DIR + 'nadali-hansani.webp', role: 'LCVP Outgoing Global Volunteer – Business to Customer (oGV B2C)' },
  { name: 'Bawantha Jayanath', file: DIR + 'bawantha-jayanath.webp', role: 'LCVP Outgoing Global Talent – Academic (oGTa)' },
  { name: 'Chamindi Kaveesha', file: DIR + 'chamindi-kaveesha.webp', role: 'LCVP Outgoing Global Talent – Enterprise (oGTe)' },
]

// 義理 justice, 勇気 courage, 仁愛 benevolence, 礼節 respect, 誠実 honesty, 名誉 honour, 忠義 loyalty
const VIRTUES = ['義理', '勇気', '仁愛', '礼節', '誠実', '名誉', '忠義']

// colourful illustrations that float beside the name (one per slide, cycling)
const ILLS = [
  ILL + 'alessandro_hrdz-mask-6976331.png',
  ILL + 'jakeloris-fan-7039967.png',
  ILL + 'kacsoeszti-koi-1184783_1920.png',
]
// one-colour silhouettes, drawn huge and very faint behind the text (cycling)
const SILS = [
  ILL + 'gdj-dragon-8095373.svg',
  ILL + 'gdj-building-8171699.svg',
  ILL + 'yabisan-art-oni-8583401.svg',
  ILL + 'gdj-bonsai-tree-8143900.svg',
]

// "LCVP Finance and Legal (FnL)" -> tier "Vice President", code "FnL", title "Finance and Legal"
const parseRole = (role: string) => {
  const m = role.match(/^(.*?)\s*\(([^)]+)\)\s*$/)
  let title = (m ? m[1] : role).trim()
  const code = m ? m[2].trim() : ''
  let tier = 'Executive Board'
  if (/^LCVP\s/.test(title)) {
    tier = 'LCVP'
    title = title.replace(/^LCVP\s+/, '')
  } else if (/President/i.test(title)) {
    tier = 'President'
  }
  return code ? { tier, code, title } : { tier, code: title, title: '' }
}

// colours that the wave edge at the bottom of a slide uses to blend into the next slide
const LIGHT_TOP = '#fffaf3'
const DARK_TOP = '#6a0720'
const AFTER_LAST = '#fffaf3'

// ----------------------------------------------------------------------------
// decorations
// ----------------------------------------------------------------------------
const CIRCLES =
  "%3Ccircle cx='0' cy='10' r='18'/%3E%3Ccircle cx='0' cy='10' r='12'/%3E%3Ccircle cx='0' cy='10' r='6'/%3E%3Ccircle cx='40' cy='10' r='18'/%3E%3Ccircle cx='40' cy='10' r='12'/%3E%3Ccircle cx='40' cy='10' r='6'/%3E%3Ccircle cx='20' cy='20' r='18'/%3E%3Ccircle cx='20' cy='20' r='12'/%3E%3Ccircle cx='20' cy='20' r='6'/%3E"
const svgUrl = (g: string) =>
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='20' viewBox='0 0 40 20'%3E${g}%3C/svg%3E")`

const WAVES_PALE = svgUrl(`%3Cg fill='%23fffaf3' stroke='%23e6a8a8' stroke-width='1.4'%3E${CIRCLES}%3C/g%3E`)
const WAVES_DARK = svgUrl(`%3Cg fill='none' stroke='%23d6b25e' stroke-opacity='.22' stroke-width='1.4'%3E${CIRCLES}%3C/g%3E`)
const WAVES_SUN = svgUrl(`%3Cg fill='none' stroke='%237a0d08' stroke-opacity='.5' stroke-width='1.4'%3E${CIRCLES}%3C/g%3E`)

type Pt = [number, number]
const bez = (p: Pt[], t: number): Pt => {
  const m = 1 - t
  return [
    m * m * m * p[0][0] + 3 * m * m * t * p[1][0] + 3 * m * t * t * p[2][0] + t * t * t * p[3][0],
    m * m * m * p[0][1] + 3 * m * m * t * p[1][1] + 3 * m * t * t * p[2][1] + t * t * t * p[3][1],
  ]
}
const mk = (seed: number) => {
  let s = (seed * 9301 + 49297) % 233280
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

const BRANCHES: { pts: Pt[]; w: number; n: number }[] = [
  { pts: [[300, 16], [250, 38], [190, 46], [140, 78]], w: 7, n: 7 },
  { pts: [[140, 78], [110, 96], [80, 118], [40, 172]], w: 4.5, n: 5 },
  { pts: [[215, 42], [205, 22], [185, 10], [160, 6]], w: 3.2, n: 4 },
  { pts: [[250, 32], [258, 62], [250, 86], [230, 104]], w: 3, n: 4 },
  { pts: [[130, 84], [135, 110], [125, 135], [105, 150]], w: 3, n: 3 },
]
const PINKS = ['#f6a5b8', '#e8718c', '#f9c7d2', '#d94f72', '#f4b6c4']

// one 5-petal flower baked into a single path (26 flowers = 26 paths instead of 130)
const FLOWER = [0, 1, 2, 3, 4]
  .map((j) => {
    const a = (j * 72 * Math.PI) / 180
    const c = Math.cos(a)
    const sn = Math.sin(a)
    const P = (x: number, y: number) => `${(x * c - y * sn).toFixed(2)} ${(x * sn + y * c).toFixed(2)}`
    return `M${P(0, 0)}C${P(-6, -4)} ${P(-6, -13)} ${P(0, -15)}C${P(6, -13)} ${P(6, -4)} ${P(0, 0)}Z`
  })
  .join('')

const SakuraBranch = ({ seed }: { seed: number }) => {
  const flowers = useMemo(() => {
    const r = mk(seed + 3)
    const out: { x: number; y: number; s: number; rot: number; c: string }[] = []
    BRANCHES.forEach((b) => {
      for (let k = 0; k < b.n; k++) {
        const [x, y] = bez(b.pts, Math.min(1, (k + 0.6) / b.n))
        out.push({
          x: x + (r() - 0.5) * 16,
          y: y + (r() - 0.5) * 16,
          s: 0.75 + r() * 0.7,
          rot: r() * 360,
          c: PINKS[Math.floor(r() * PINKS.length)],
        })
      }
    })
    return out
  }, [seed])

  return (
    <svg viewBox="0 0 300 190" aria-hidden="true" focusable="false">
      {BRANCHES.map((b, i) => (
        <path
          key={i}
          d={`M${b.pts[0]} C${b.pts[1]} ${b.pts[2]} ${b.pts[3]}`}
          fill="none"
          stroke="#5a3a2a"
          strokeWidth={b.w}
          strokeLinecap="round"
        />
      ))}
      {flowers.map((f, i) => (
        <g key={i} transform={`translate(${f.x.toFixed(1)} ${f.y.toFixed(1)}) rotate(${f.rot.toFixed(0)}) scale(${f.s.toFixed(2)})`}>
          <path d={FLOWER} fill={f.c} />
          <circle r="1.8" fill="#f7d774" />
        </g>
      ))}
    </svg>
  )
}

const Fret = ({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) => (
  <svg className={`ebm-fret ${pos}`} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
    <path pathLength={1} d="M4 96V4H82V24H60" />
    <path pathLength={1} d="M22 96V22H62V40H40V62H22" />
  </svg>
)

// an <img> that just disappears if the file is missing
const Pic = ({ src, className }: { src: string; className?: string }) => {
  const [bad, setBad] = useState(false)
  if (bad) return null
  return <img className={className} src={src} alt="" aria-hidden="true" loading="eager" decoding="async" draggable={false} onError={() => setBad(true)} />
}


// ----------------------------------------------------------------------------
// PERFORMANCE HELPERS
//  - EbSlot / LazyMount (further down): only slides near the viewport are really mounted
//  - useLazyCutout: trims the transparent padding off a photo like before, but one photo at a
//    time, from a down-scaled copy (max 1400px), and remembers the result between tab switches
// ----------------------------------------------------------------------------
const cutCache = new Map<string, string>()
let cutQueue: Promise<unknown> = Promise.resolve()
const whenIdle = () =>
  new Promise<void>((resolve) => {
    const w = window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }
    if (w.requestIdleCallback) w.requestIdleCallback(() => resolve(), { timeout: 250 })
    else setTimeout(resolve, 16)
  })

const makeCutout = async (src: string, keep: number): Promise<string> => {
  const img = new Image()
  img.decoding = 'async'
  img.src = src
  await img.decode()
  const nw = img.naturalWidth
  const nh = img.naturalHeight

  // 1) where is the person? look at a ~320px thumbnail only (cheap)
  const sk = Math.min(1, 320 / Math.max(nw, nh))
  const sw = Math.max(1, Math.round(nw * sk))
  const sh = Math.max(1, Math.round(nh * sk))
  const sc = document.createElement('canvas')
  sc.width = sw
  sc.height = sh
  const sg = sc.getContext('2d', { willReadFrequently: true })
  if (!sg) return src
  sg.drawImage(img, 0, 0, sw, sh)
  const { data } = sg.getImageData(0, 0, sw, sh)
  let t = sh, b = -1, l = sw, r = -1
  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      if (data[(y * sw + x) * 4 + 3] > 24) {
        if (y < t) t = y
        if (y > b) b = y
        if (x < l) l = x
        if (x > r) r = x
      }
    }
  }
  if (b < 0) return src

  // 2) crop that box (top part only, like before) straight from the original, at most 1200px
  const T = Math.max(0, Math.floor((t - 1) / sk))
  const L = Math.max(0, Math.floor((l - 1) / sk))
  const B = Math.min(nh - 1, Math.ceil((b + 2) / sk))
  const R = Math.min(nw - 1, Math.ceil((r + 2) / sk))
  const cw = R - L + 1
  const ch = Math.max(1, Math.round((B - T + 1) * keep))
  const ok = Math.min(1, 1200 / Math.max(cw, ch))
  const o = document.createElement('canvas')
  o.width = Math.max(1, Math.round(cw * ok))
  o.height = Math.max(1, Math.round(ch * ok))
  o.getContext('2d')!.drawImage(img, L, T, cw, ch, 0, 0, o.width, o.height)
  const blob: Blob | null = await new Promise((res) => o.toBlob(res, 'image/webp', 0.92))
  return blob ? URL.createObjectURL(blob) : src
}

const getCutout = (src: string, keep: number): Promise<string> => {
  const key = `${src}|${keep}`
  const hit = cutCache.get(key)
  if (hit) return Promise.resolve(hit)
  const job = cutQueue.then(async () => {
    await whenIdle()
    try {
      const u = await makeCutout(src, keep)
      try { const w = new Image(); w.src = u; await w.decode() } catch { /* ignore */ }
      cutCache.set(key, u)
      return u
    } catch {
      return src
    }
  })
  cutQueue = job
  return job
}

const useLazyCutout = (src: string, keep: number, enabled: boolean) => {
  const [url, setUrl] = useState<string | null>(() => cutCache.get(`${src}|${keep}`) ?? null)
  useEffect(() => {
    if (!enabled || url) return
    let dead = false
    getCutout(src, keep).then((u) => { if (!dead) setUrl(u) })
    return () => { dead = true }
  }, [enabled, src, keep, url])
  return url
}

// slides that already played their entrance (so a slide that is re-mounted while scrolling does not replay it)
const PLAYED = new Set<string>()

// ----------------------------------------------------------------------------
// styles (everything is in cqw units of the card's container, so it scales as one slide)
// ----------------------------------------------------------------------------
const EBCSS = `
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700;800&family=Kaushan+Script&family=Noto+Serif+JP:wght@700;900&display=swap');

/* flush stack: no gaps, no side padding, 1px overlap so no hairline shows between slides */
.ebm-list{position:relative;padding:0 0 1px}
.ebm{container-type:inline-size;width:100%;max-width:none;margin:0 0 -1px;padding:0}

/* progress thread down the left edge */
.ebm-rail{position:sticky;top:0;left:0;height:100vh;height:100svh;margin-bottom:-100vh;margin-bottom:-100svh;width:max(4px,.3vw);z-index:20;background:rgba(42,3,16,.12);pointer-events:none}
.ebm-rail i{display:block;width:100%;height:100%;background:linear-gradient(#f6c768,#e0452f 55%,#8c0b26);transform-origin:50% 0;will-change:transform}

/* far-away slides are cheap placeholders of exactly the same height */
.ebm-skel{height:calc(56*1cqw);background:${LIGHT_TOP}}
.ebm-skel.dark{background:linear-gradient(${DARK_TOP},#3a0613)}
@container (max-width:699px){.ebm-skel{height:calc(172*1cqw)}}

/* ---------- card base (LIGHT) ---------- */
.ebm-card{--u:1cqw;--ebs:.8;--ink:#1b0209;--red:#c9362b;--glow:rgba(255,255,255,.75);--wipe:#c9362b;--fs:calc(var(--fs-d)*var(--u));--cf:var(--cf-d);
  position:relative;height:calc(56*var(--u));overflow:hidden;border-radius:0;background:${LIGHT_TOP};color:var(--ink);font-family:'Montserrat',system-ui,sans-serif}
.ebm-bg{position:absolute;inset:0;background-image:${WAVES_PALE};background-size:calc(7*var(--u)) calc(3.5*var(--u));opacity:.8;z-index:0}
.ebm-blob{position:absolute;left:calc(-14*var(--u));top:calc(12*var(--u));width:calc(48*var(--u));aspect-ratio:1;border-radius:50%;background:rgba(232,214,200,.6);z-index:0}
.ebm-card.flip .ebm-blob{left:auto;right:calc(-14*var(--u))}

/* ---------- DARK variant (every second slide) ---------- */
.ebm-card.dark{--ink:#fff1e4;--red:#ffcf70;--glow:rgba(255,120,90,.28);--wipe:#fff1e4;background:linear-gradient(${DARK_TOP},#3a0613)}
.ebm-card.dark .ebm-bg{background-image:${WAVES_DARK};opacity:1}
.ebm-card.dark .ebm-blob{background:rgba(255,255,255,.05)}
.ebm-card.dark .ebm-kj{color:rgba(255,241,228,.07)}
.ebm-card.dark .ebm-first{text-shadow:0 0 calc(var(--fs)*.14) rgba(58,6,19,.95)}
.ebm-card.dark .ebm-last{text-shadow:0 calc(.35*var(--u)) 0 rgba(0,0,0,.35)}
.ebm-card.dark .ebm-disc{background:radial-gradient(circle at 38% 30%,#ff8a63,#f0422c 55%,#c0210f);box-shadow:0 0 calc(7*var(--u)) calc(1*var(--u)) rgba(255,110,80,.45)}

/* ---------- wave edge into the next slide ---------- */
.ebm-edge{--er:max(8px,calc(1.3*var(--u)));position:absolute;left:0;right:0;bottom:-1px;height:var(--er);z-index:6;pointer-events:none;
  background:radial-gradient(circle var(--er) at 50% 100%,var(--next) calc(var(--er) - 1px),transparent var(--er)) 50% 0/calc(var(--er)*2) 100% repeat-x}

/* first slide only: scallops in the page colour hang down over its top edge, so the section flows out of the header instead of starting with a hard line */
.ebm-topedge{--er:max(9px,calc(1.5*var(--u)));position:absolute;left:0;right:0;top:-1px;height:var(--er);z-index:9;pointer-events:none;
  background:radial-gradient(circle var(--er) at 50% 0,#f5ede2 calc(var(--er) - 1px),transparent var(--er)) 50% 0/calc(var(--er)*2) 100% repeat-x}

/* ---------- entry curtain, spotlight, drifting mist ---------- */
.ebm-wipe{position:absolute;inset:0;z-index:8;background:var(--wipe);transform:scaleY(1);transform-origin:50% 0;pointer-events:none}
.ebm-glow{position:absolute;left:0;top:0;width:calc(36*var(--u));height:calc(36*var(--u));margin:calc(-18*var(--u)) 0 0 calc(-18*var(--u));border-radius:50%;
  background:radial-gradient(circle,var(--glow),transparent 65%);opacity:0;z-index:1;pointer-events:none}
.ebm-mist{position:absolute;left:-6%;right:-6%;bottom:0;height:calc(16*var(--u));z-index:4;pointer-events:none;opacity:.2;
  background:url('${HERO}atmospheric-mist.webp') repeat-x 50% 100%/auto 100%;animation:ebmMist 20s ease-in-out infinite alternate;animation-play-state:paused}
.ebm-card.dark .ebm-mist{opacity:.5}
.ebm-card.live .ebm-mist{animation-play-state:running}
@keyframes ebmMist{from{transform:translateX(-4%)}to{transform:translateX(4%)}}

/* ---------- illustration + silhouette ---------- */
.ebm-sil{position:absolute;left:calc(-6*var(--u));bottom:calc(-6*var(--u));width:calc(52*var(--u));aspect-ratio:1;z-index:0;opacity:.07;background:#000;pointer-events:none;
  -webkit-mask-image:var(--sil);mask-image:var(--sil);-webkit-mask-size:contain;mask-size:contain;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:0 100%;mask-position:0 100%}
.ebm-card.flip .ebm-sil{left:auto;right:calc(-6*var(--u));-webkit-mask-position:100% 100%;mask-position:100% 100%}
.ebm-card.dark .ebm-sil{background:#fff;opacity:.08}
.ebm-toprow{display:flex;align-items:flex-end;justify-content:space-between;gap:calc(2*var(--u));padding-right:calc(4*var(--u))}
.ebm-card.flip .ebm-toprow{padding-right:calc(12*var(--u))}
.ebm-ill{flex:none;position:relative;display:block;width:calc(9*var(--u));height:auto;rotate:8deg;margin-bottom:calc(.6*var(--u));pointer-events:none;
  filter:drop-shadow(0 calc(.5*var(--u)) calc(.9*var(--u)) rgba(40,0,10,.35))}
.ebm-card.flip .ebm-ill{rotate:-8deg}

/* ---------- picture side ---------- */
.ebm-pic{position:absolute;top:0;bottom:0;right:0;width:calc(46*var(--u));z-index:2}
.ebm-card.flip .ebm-pic{right:auto;left:0}
.ebm-disc{position:absolute;left:calc(3*var(--u));top:calc(7*var(--u));width:calc(40*var(--u));aspect-ratio:1;border-radius:50%;overflow:hidden;z-index:1;
  background:radial-gradient(circle at 38% 30%,#ea3b2c,#cf2519 55%,#a81810);box-shadow:0 calc(1.4*var(--u)) calc(3*var(--u)) rgba(120,10,10,.28)}
.ebm-disc::before{content:'';position:absolute;inset:0;background-image:${WAVES_SUN};background-size:calc(6*var(--u)) calc(3*var(--u));
  -webkit-mask-image:radial-gradient(circle at 12% 88%,#000 0,transparent 52%);mask-image:radial-gradient(circle at 12% 88%,#000 0,transparent 52%);}
/* brush enso ring around the sun (wrapper is moved by GSAP, the image inside spins by CSS) */
.ebm-enso{position:absolute;left:calc(-2*var(--u));top:calc(2*var(--u));width:calc(50*var(--u));aspect-ratio:1;z-index:1;pointer-events:none}
.ebm-enso img{display:block;width:100%;height:100%;object-fit:contain}
@keyframes ebmSpin{to{transform:rotate(360deg)}}
.ebm-kj{position:absolute;right:calc(-4*var(--u));top:calc(14*var(--u));font-family:'Noto Serif JP','Shippori Mincho',serif;font-weight:900;font-size:calc(26*var(--u));line-height:1;white-space:nowrap;color:rgba(42,3,16,.08);z-index:0;pointer-events:none}
.ebm-card.flip .ebm-kj{right:auto;left:calc(-4*var(--u))}
.ebm-ph{position:absolute;left:0;right:0;bottom:0;height:calc(50*var(--u)*var(--ebs));display:flex;justify-content:center;align-items:flex-end;z-index:2;pointer-events:none}
.ebm-pin{flex:none;height:100%;display:flex;align-items:flex-end}
.ebm-pimg{flex:none;display:block;height:100%;width:auto;max-width:none;
  filter:drop-shadow(max(1.5px,calc(.35*var(--u))) 0 0 #fff) drop-shadow(min(-1.5px,calc(-.35*var(--u))) 0 0 #fff) drop-shadow(0 max(1.5px,calc(.35*var(--u))) 0 #fff) drop-shadow(0 min(-1.5px,calc(-.35*var(--u))) 0 #fff) drop-shadow(0 calc(1.2*var(--u)) calc(1.6*var(--u)) rgba(60,0,10,.4))}
/* phones: one cheap outline instead of four stacked filters */
@container (max-width:699px){.ebm-pimg{filter:drop-shadow(0 0 max(1.5px,calc(.35*var(--u))) #fff) drop-shadow(0 calc(1.2*var(--u)) calc(1.6*var(--u)) rgba(60,0,10,.4))}}
.ebm-br{position:absolute;top:0;right:0;width:calc(20*var(--u));z-index:3;pointer-events:none}
.ebm-br svg{display:block;width:100%;height:auto}
.ebm-card.flip .ebm-br{right:auto;left:0;scale:-1 1}

/* ---------- fret corners ---------- */
.ebm-fret{position:absolute;width:calc(9*var(--u));aspect-ratio:1;z-index:1;fill:none;stroke:var(--red);stroke-width:4.5;stroke-linecap:square;stroke-linejoin:miter;pointer-events:none}
.ebm-fret path{stroke-dasharray:1}
.ebm-fret.tl{top:calc(2*var(--u));left:calc(2*var(--u))}
.ebm-fret.tr{top:calc(2*var(--u));right:calc(2*var(--u));scale:-1 1}
.ebm-fret.bl{bottom:calc(2*var(--u));left:calc(2*var(--u));scale:1 -1}
.ebm-fret.br{bottom:calc(2*var(--u));right:calc(2*var(--u));rotate:180deg}

/* ---------- text side ---------- */
.ebm-txt{position:absolute;top:0;bottom:0;left:0;width:calc(54*var(--u));padding:0 0 0 calc(6*var(--u));display:flex;flex-direction:column;justify-content:center;gap:calc(2.4*var(--u));z-index:3}
.ebm-card.flip .ebm-txt{left:auto;right:0}
.ebm-name{margin:0;position:relative;font-size:var(--fs)}
.ebm-first{display:block;position:relative;z-index:2;font-family:'Kaushan Script','Brush Script MT',cursive;font-weight:400;color:var(--red);font-size:calc(var(--fs)*.78);line-height:1;rotate:-6deg;transform-origin:0 100%;margin:0 0 calc(var(--fs)*-.34) calc(var(--fs)*-.02);text-shadow:0 0 calc(var(--fs)*.12) rgba(255,250,243,.9)}
.ebm-last{display:block;overflow:hidden;padding-bottom:.08em;font-weight:800;line-height:1.02;letter-spacing:-.01em;text-transform:uppercase;white-space:nowrap}
.ebm-ch{display:inline-block}
.ebm-dot{font-style:normal;color:var(--red)}
.ebm-jp{display:flex;align-items:center;gap:calc(1.6*var(--u));margin:calc(-.6*var(--u)) 0 0 calc(2*var(--u));font-family:'Noto Serif JP','Shippori Mincho',serif;font-weight:700;font-size:calc(3.1*var(--u));letter-spacing:.18em;color:var(--red)}
.ebm-rule{display:block;flex:none;width:calc(7*var(--u));height:max(2px,calc(.2*var(--u)));background:var(--red);transform-origin:0 50%}

/* ---------- POSITION PLAQUE: the star of each slide ---------- */
.ebm-pos{position:relative;align-self:flex-start;max-width:calc(46*var(--u));transform-origin:0 50%;margin-top:calc(.6*var(--u));
  filter:drop-shadow(0 calc(1*var(--u)) calc(1.5*var(--u)) rgba(60,0,10,.45))}
.ebm-posin{position:relative;overflow:hidden;padding:calc(1.7*var(--u)) calc(4.4*var(--u)) calc(1.9*var(--u)) calc(2.6*var(--u));
  background:linear-gradient(100deg,#d4202f,#8c0b26);border-left:max(4px,calc(.8*var(--u))) solid #f6c768;
  clip-path:polygon(0 0,100% 0,calc(100% - 2*var(--u)) 50%,100% 100%,0 100%)}
.ebm-brush{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;mix-blend-mode:multiply;opacity:.5;pointer-events:none}
.ebm-shine{position:absolute;top:0;bottom:0;left:0;width:45%;background:linear-gradient(105deg,transparent 38%,rgba(255,255,255,.5) 50%,transparent 62%);pointer-events:none}
.ebm-tier{position:relative;display:inline-flex;align-items:center;gap:.6em;padding:.32em .8em .32em .65em;max-width:100%;background:#ffd98a;border-radius:2px;box-shadow:0 calc(.3*var(--u)) 0 rgba(60,0,10,.35);font-family:'Oswald',sans-serif;font-weight:700;font-size:max(20px,calc(3*var(--u)));line-height:1;letter-spacing:.2em;text-transform:uppercase;color:#6d0a1e}
.ebm-tier::before{content:'';flex:none;width:max(7px,calc(1.1*var(--u)));height:max(7px,calc(1.1*var(--u)));background:#6d0a1e;transform:rotate(45deg)}
.ebm-code{position:relative;display:block;overflow:hidden;margin-top:calc(.5*var(--u));padding:.04em 0 .06em;white-space:nowrap;font-family:'Jansina','Brusher','Anton','Impact',sans-serif;font-weight:400;font-synthesis:none;
  font-size:calc(var(--cf)*var(--u));line-height:1.05;letter-spacing:.03em;color:#fff1e4;text-shadow:0 calc(.35*var(--u)) 0 rgba(60,0,10,.55)}
.ebm-cc{display:inline-block}
.ebm-ptitle{position:relative;display:block;margin-top:calc(.7*var(--u));font-family:'Oswald',sans-serif;font-weight:500;font-size:max(11px,calc(1.45*var(--u)));line-height:1.3;letter-spacing:.14em;text-transform:uppercase;color:#fff}

/* dark slides get a GOLD plaque */
.ebm-card.dark .ebm-posin{background:linear-gradient(100deg,#ffd98a,#e0a73a);border-left-color:#c9362b}
.ebm-card.dark .ebm-brush{opacity:.38}
.ebm-card.dark .ebm-shine{background:linear-gradient(105deg,transparent 38%,rgba(255,255,255,.7) 50%,transparent 62%)}
.ebm-card.dark .ebm-tier{background:#6d0a1e;color:#ffd98a;box-shadow:0 calc(.3*var(--u)) 0 rgba(0,0,0,.25)}
.ebm-card.dark .ebm-tier::before{background:#ffd98a}
.ebm-card.dark .ebm-code{color:#2a0310;text-shadow:none}
.ebm-card.dark .ebm-ptitle{color:#2a0310}

/* ---------- phones: text on top, sun + person underneath ---------- */
@container (max-width:699px){
  .ebm-card{height:calc(172*var(--u));--fs:calc(var(--fs-m)*var(--u));--cf:var(--cf-m)}
  .ebm-card .ebm-txt,.ebm-card.flip .ebm-txt{left:0;right:0;top:0;bottom:auto;width:auto;height:calc(82*var(--u));padding:calc(6*var(--u)) calc(6*var(--u)) 0;justify-content:flex-start;gap:calc(2.4*var(--u))}
  .ebm-card .ebm-pic,.ebm-card.flip .ebm-pic{top:auto;bottom:0;left:0;right:0;width:auto;height:calc(92*var(--u))}
  .ebm-disc{left:calc(18*var(--u));top:calc(10*var(--u));width:calc(64*var(--u))}
  .ebm-enso{left:calc(11*var(--u));top:calc(3*var(--u));width:calc(78*var(--u))}
  .ebm-ph{height:calc(78*var(--u)*var(--ebs))}
  .ebm-kj,.ebm-card.flip .ebm-kj{font-size:calc(38*var(--u));top:calc(8*var(--u))}
  .ebm-br{width:calc(26*var(--u))}
  .ebm-blob,.ebm-card.flip .ebm-blob{width:calc(70*var(--u));left:calc(-20*var(--u));right:auto;top:calc(6*var(--u))}
  .ebm-ill,.ebm-card.flip .ebm-ill{width:calc(11*var(--u))}
  .ebm-toprow,.ebm-card.flip .ebm-toprow{padding-right:calc(6*var(--u))}
  .ebm-sil,.ebm-card.flip .ebm-sil{left:auto;right:calc(-10*var(--u));top:calc(12*var(--u));bottom:auto;width:calc(80*var(--u));-webkit-mask-position:100% 0;mask-position:100% 0}
  .ebm-jp{font-size:calc(4.6*var(--u));margin-left:calc(3*var(--u))}
  .ebm-rule{width:calc(10*var(--u))}
  .ebm-pos{max-width:calc(84*var(--u))}
  .ebm-posin{padding:calc(3*var(--u)) calc(7*var(--u)) calc(3.2*var(--u)) calc(4.4*var(--u));clip-path:polygon(0 0,100% 0,calc(100% - 3*var(--u)) 50%,100% 100%,0 100%)}
  .ebm-tier{font-size:max(19px,calc(5.4*var(--u)))}
  .ebm-ptitle{font-size:max(11px,calc(3*var(--u)));margin-top:calc(1.2*var(--u))}
  .ebm-fret{width:calc(12*var(--u))}
  .ebm-glow{display:none}
}

.ebm-card{contain:layout paint}
.ebm-posin{isolation:isolate}
/* only a few slides are mounted at a time, so keeping their moving parts on their own layers is cheap and avoids re-painting */
.ebm-ph,.ebm-pos,.ebm-wipe{will-change:transform,opacity}
.ebm-pin,.ebm-disc,.ebm-enso,.ebm-kj,.ebm-txt,.ebm-sil,.ebm-glow,.ebm-shine,.ebm-ill{will-change:transform}
.ebm-blob,.ebm-br,.ebm-first,.ebm-jp{will-change:transform,opacity}

/* idle motion is CSS only (runs off the main thread) and only while the slide is on screen */
.ebm-card.live .ebm-shine{animation:ebmShine 5.2s ease-in-out infinite}
.ebm-card.live .ebm-ill{animation:ebmFloat 3.4s ease-in-out infinite alternate}
@keyframes ebmShine{0%{translate:-140% 0}30%,100%{translate:320% 0}}
@keyframes ebmFloat{from{translate:0 0}to{translate:0 calc(-.6*var(--u))}}

/* scroll parallax: CSS scroll-driven animations, so there is no JavaScript running while you scroll.
   (Browsers without support simply skip the parallax.) */
@keyframes ebmDrift{from{translate:0 var(--amp,0px)}to{translate:0 calc(var(--amp,0px)*-1)}}
@supports (animation-timeline:view()){
  @media (prefers-reduced-motion:no-preference){
    .ebm-ph,.ebm-disc,.ebm-enso,.ebm-txt,.ebm-kj,.ebm-sil{animation:ebmDrift linear both;animation-timeline:view()}
    .ebm-ph{--amp:calc(3*var(--u))}
    .ebm-disc,.ebm-enso{--amp:calc(-2*var(--u))}
    .ebm-txt{--amp:calc(.8*var(--u))}
    .ebm-kj{--amp:calc(-2.4*var(--u))}
    .ebm-sil{--amp:calc(-1.2*var(--u))}
  }
}

@media (prefers-reduced-motion:reduce){
  .ebm-wipe,.ebm-glow{display:none}
  .ebm-disc::before,.ebm-enso img,.ebm-mist{animation:none}
}
`

// ----------------------------------------------------------------------------
// one member slide
// ----------------------------------------------------------------------------
const EbMember = ({ m, i, total }: { m: EbPerson; i: number; total: number }) => {
  const ref = useRef<HTMLDivElement>(null)
  const flip = i % 2 === 1
  const dark = i % 2 === 1
  const nextColor = i === total - 1 ? AFTER_LAST : (i + 1) % 2 === 1 ? DARK_TOP : LIGHT_TOP
  const url = useLazyCutout(photo(m.file), m.keep ?? 0.6, true)
  const [first, ...rest] = m.name.split(' ')
  const last = rest.join(' ').toUpperCase()
  const len = Math.max(last.length, 5)
  const fsD = Math.min(9.2, Math.max(4.8, 42 / (len * 0.74)))
  const fsM = Math.min(13, Math.max(8, 84 / (len * 0.74)))
  const kanji = m.kanji ?? VIRTUES[i % VIRTUES.length]
  const { tier, code, title } = parseRole(m.role ?? 'Executive Board')
  const cl = Math.max(code.length, 3)
  const cfD = Math.min(8.5, Math.max(3.8, 36 / (cl * 0.62)))
  const cfM = Math.min(14, Math.max(6.5, 62 / (cl * 0.62)))

  useLayoutEffect(() => {
    const root = ref.current
    if (!root) return

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const q = gsap.utils.selector(root)
        const card = root.querySelector('.ebm-card') as HTMLElement
        const sgn = flip ? -1 : 1
        const o = 0.35 // content starts a beat after the curtain starts lifting

        const tl = gsap.timeline({ paused: true, defaults: { force3D: true } })
        tl.fromTo(q('.ebm-wipe'), { scaleY: 1, transformOrigin: '50% 0%' }, { scaleY: 0, duration: 1.05, ease: 'power4.inOut' }, 0)
          .fromTo(q('.ebm-blob'), { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.2, ease: 'power3.out' }, o)
          .fromTo(q('.ebm-disc'), { scale: 0.5, opacity: 0, rotation: -60 }, { scale: 1, opacity: 1, rotation: 0, duration: 1.4, ease: 'expo.out' }, o + 0.05)
          .fromTo(q('.ebm-enso'), { scale: 0.6, opacity: 0, rotation: -140 }, { scale: 1, opacity: 1, rotation: 0, duration: 1.7, ease: 'expo.out' }, o + 0.1)
          .fromTo(q('.ebm-ph'), { yPercent: 16, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.15, ease: 'expo.out' }, o + 0.25)
          .fromTo(q('.ebm-br'), { opacity: 0, rotation: -sgn * 9, transformOrigin: flip ? '0% 0%' : '100% 0%' }, { opacity: 1, rotation: 0, duration: 1.4, ease: 'power3.out' }, o + 0.4)
          .fromTo(q('.ebm-ill'), { opacity: 0, scale: 0.4, rotation: -30 }, { opacity: 1, scale: 1, rotation: 0, duration: 1.1, ease: 'back.out(1.8)' }, o + 0.5)
          .fromTo(q('.ebm-fret path'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.1, stagger: 0.15, ease: 'power2.inOut' }, o + 0.3)
          .fromTo(q('.ebm-first'), { opacity: 0, x: -30, rotation: -12 }, { opacity: 1, x: 0, rotation: 0, duration: 0.9, ease: 'power3.out' }, o + 0.45)
          .from(q('.ebm-ch'), { yPercent: 115, rotation: () => gsap.utils.random(-8, 8), duration: 0.85, stagger: 0.035, ease: 'power4.out' }, o + 0.5)
          .fromTo(q('.ebm-rule'), { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: 'power3.inOut' }, o + 0.85)
          .fromTo(q('.ebm-jp'), { opacity: 0, x: -18 }, { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' }, o + 0.85)
          // the plaque unrolls, then its content lands
          .fromTo(q('.ebm-pos'), { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.95, ease: 'power4.out' }, o + 0.7)
          .fromTo(q('.ebm-tier'), { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' }, o + 1.1)
          .from(q('.ebm-cc'), { yPercent: 120, rotation: () => gsap.utils.random(-10, 10), duration: 0.8, stagger: 0.06, ease: 'back.out(1.6)' }, o + 1.15)
          .fromTo(q('.ebm-ptitle'), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, o + 1.4)

        if (PLAYED.has(m.name)) {
          tl.progress(1).pause() // already seen: show the finished slide straight away
        } else {
          let started = false
          const go = (self: ScrollTrigger) => {
            if (started) return
            started = true
            PLAYED.add(m.name)
            playFor(tl, self)
            self.kill()
          }
          ScrollTrigger.create({
            trigger: root, start: 'top 85%', end: 'bottom top',
            onEnter: go, onEnterBack: go,
          })
        }

        // "live" = on screen: switches the CSS idle motion (shine, float, mist) on and off
        const io = new IntersectionObserver(([e]) => card.classList.toggle('live', e.isIntersecting))
        io.observe(root)

        // mouse: only the person follows the pointer, plus a spotlight (desktop pointers only)
        let cleanup: (() => void) | undefined
        if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
          const pin = root.querySelector('.ebm-pin')
          const glow = root.querySelector('.ebm-glow')
          const px = pin ? gsap.quickTo(pin, 'x', { duration: 0.9, ease: 'power3.out' }) : null
          const py = pin ? gsap.quickTo(pin, 'y', { duration: 0.9, ease: 'power3.out' }) : null
          const gx = glow ? gsap.quickTo(glow, 'x', { duration: 0.5, ease: 'power3.out' }) : null
          const gy = glow ? gsap.quickTo(glow, 'y', { duration: 0.5, ease: 'power3.out' }) : null
          let rect: DOMRect | null = null
          let rectAt = 0
          const move = (e: PointerEvent) => {
            const now = performance.now()
            if (!rect || now - rectAt > 150) { rect = card.getBoundingClientRect(); rectAt = now }
            px?.(((e.clientX - rect.left) / rect.width - 0.5) * 40)
            py?.(((e.clientY - rect.top) / rect.height - 0.5) * 40)
            gx?.(e.clientX - rect.left)
            gy?.(e.clientY - rect.top)
          }
          const enter = () => { if (glow) gsap.to(glow, { opacity: 1, duration: 0.5 }) }
          const leave = () => {
            px?.(0); py?.(0)
            if (glow) gsap.to(glow, { opacity: 0, duration: 0.6 })
          }
          root.addEventListener('pointermove', move, { passive: true })
          root.addEventListener('pointerenter', enter)
          root.addEventListener('pointerleave', leave)
          cleanup = () => {
            root.removeEventListener('pointermove', move)
            root.removeEventListener('pointerenter', enter)
            root.removeEventListener('pointerleave', leave)
          }
        }
        return () => { io.disconnect(); cleanup?.() }
      })
    }, root)

    return () => ctx.revert()
  }, [flip])

  return (
    <div className="ebm" ref={ref}>
      <article
        className={`ebm-card${flip ? ' flip' : ''}${dark ? ' dark' : ''}`}
        style={{ '--fs-d': fsD, '--fs-m': fsM, '--cf-d': cfD, '--cf-m': cfM, '--next': nextColor } as React.CSSProperties}
        aria-label={`${m.name}, ${m.role ?? 'Executive Board'}`}
      >
        <div className="ebm-bg" aria-hidden="true" />
        <div className="ebm-blob" aria-hidden="true" />
        <div className="ebm-sil" aria-hidden="true" style={{ '--sil': `url(${SILS[i % SILS.length]})` } as React.CSSProperties} />
        <div className="ebm-glow" aria-hidden="true" />
        <div className="ebm-mist" aria-hidden="true" />
        <Fret pos={flip ? 'tr' : 'tl'} />
        <Fret pos={flip ? 'bl' : 'br'} />

        <div className="ebm-pic">
          <div className="ebm-kj" aria-hidden="true">{kanji}</div>
          <div className="ebm-disc" aria-hidden="true" />
          <div className="ebm-enso" aria-hidden="true"><Pic src={HERO + 'red-enso-sun.webp'} /></div>
          <div className="ebm-ph" style={m.ph ? ({ height: `calc(${m.ph}*var(--u)*var(--ebs))` } as React.CSSProperties) : undefined}>
            <div className="ebm-pin">
              {url && (
                <img
                  className="ebm-pimg"
                  src={url}
                  alt={m.name}
                  decoding="async"
                  draggable={false}
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
              )}
            </div>
          </div>
          <div className="ebm-br" aria-hidden="true"><SakuraBranch seed={i + 1} /></div>
        </div>

        <div className="ebm-txt">
          <h3 className="ebm-name" aria-label={m.name}>
            <span className="ebm-toprow">
              <span className="ebm-first" aria-hidden="true">{first}</span>
              <Pic className="ebm-ill" src={ILLS[i % ILLS.length]} />
            </span>
            <span className="ebm-last" aria-hidden="true">
              {last.split('').map((c, k) => <span className="ebm-ch" key={k}>{c === ' ' ? '\u00A0' : c}</span>)}
              <span className="ebm-ch"><i className="ebm-dot">.</i></span>
            </span>
          </h3>
          <div className="ebm-jp" aria-hidden="true">
            <i className="ebm-rule" />
            <span>{m.jp ?? '理事会'}</span>
          </div>

          <div className="ebm-pos">
            <div className="ebm-posin">
              <Pic className="ebm-brush" src={HERO + 'brush-strokes.webp'} />
              <div className="ebm-shine" aria-hidden="true" />
              <div className="ebm-tier">{tier}</div>
              <span className="ebm-code" aria-hidden="true">
                {code.split('').map((c, k) => <span className="ebm-cc" key={k}>{c === ' ' ? '\u00A0' : c}</span>)}
              </span>
              {title && <span className="ebm-ptitle">{title}</span>}
            </div>
          </div>
        </div>

        <div className="ebm-edge" aria-hidden="true" />
        {i === 0 && <div className="ebm-topedge" aria-hidden="true" />}
        <div className="ebm-wipe" aria-hidden="true" />
      </article>
    </div>
  )
}

// ----------------------------------------------------------------------------
// virtual list: only slides near the viewport are really mounted; the rest are light
// placeholders of exactly the same height. This keeps the DOM, GPU memory and GSAP work
// small no matter how many people are on the board.
// ----------------------------------------------------------------------------
const EbSlot = ({ m, i, total }: { m: EbPerson; i: number; total: number }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(i < 2)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') { setOn(true); return }
    const w = window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (h: number) => void }
    let handle: number | undefined
    // build a slide while it is still ~2 screens away (in idle time, but never later than 120ms)
    const ioNear = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) { if (handle !== undefined) { w.cancelIdleCallback ? w.cancelIdleCallback(handle) : clearTimeout(handle); handle = undefined } return }
      if (handle !== undefined) return
      handle = w.requestIdleCallback ? w.requestIdleCallback(() => { handle = undefined; setOn(true) }, { timeout: 120 }) : window.setTimeout(() => { handle = undefined; setOn(true) }, 16)
    }, { rootMargin: '250% 0px 250% 0px' })
    // ...and only throw it away when it is really far (so scrolling back up never hits an empty placeholder)
    const ioFar = new IntersectionObserver(([e]) => { if (!e.isIntersecting) setOn(false) }, { rootMargin: '700% 0px 700% 0px' })
    ioNear.observe(el)
    ioFar.observe(el)
    return () => {
      ioNear.disconnect()
      ioFar.disconnect()
      if (handle !== undefined) { w.cancelIdleCallback ? w.cancelIdleCallback(handle) : clearTimeout(handle) }
    }
  }, [])
  return (
    <div ref={ref}>
      {on ? <EbMember m={m} i={i} total={total} /> : <div className="ebm"><div className={`ebm-skel${i % 2 === 1 ? ' dark' : ''}`} /></div>}
    </div>
  )
}

// mounts its children (the heavy group photo) only when the visitor gets close
const LazyMount = ({ children, minHeight = '70vh' }: { children: React.ReactNode; minHeight?: string }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') { setOn(true); return }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect() } }, { rootMargin: '120% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return <div ref={ref} style={on ? undefined : { minHeight }}>{on && children}</div>
}

// ----------------------------------------------------------------------------
// group photo at the end
// ----------------------------------------------------------------------------
const PEOPLE = new Map(MEMBERS.map((m) => [m.name, { name: m.name, file: m.file }] as const))

const GROUP: GroupDef = [
  { // back row
    x0: 14, x1: 86,
    names: ['Yenul Perera', 'Nadali Hansani', 'Dahamya Ranasinghe', 'Minadi Athukorala'],
  },
  { // middle row
    x0: 12, x1: 88,
    names: ['Fahad Faheem', 'Pethara Ranasinghe', 'Senaya Jayasuriya', 'Sabeelur Rashaad', 'Nadun Weerakkody'],
  },
  { // front row
    x0: 13, x1: 87,
    names: ['Shenise Pronk', 'Savinda Sithum', 'Chelaka Wijesekara', 'Chamindi Kaveesha', 'Dinadi Jayathilake'],
  },
]

const ROWS = buildGroupRows(GROUP, PEOPLE)

// ----------------------------------------------------------------------------
// FINALE with the REAL group photo (public/assets/eb-pics/eb-group-picture.webp)
// "Night festival" scene: starry dusk sky, a golden moon behind the team, drifting mist,
// a giant torii gate with hanging paper lanterns, gold lettering and falling petals.
// If the photo file is missing it falls back to the cut-out group, so the page never ends empty.
// Set USE_REAL_GROUP_PHOTO to false to go back to the cut-out version.
// ----------------------------------------------------------------------------
const USE_REAL_GROUP_PHOTO = true
const GROUP_PHOTO = DIR + 'eb-group-picture.webp'

// deterministic scatter (so the sky looks the same on every load)
const EBF_STARS = Array.from({ length: 46 }, (_, i) => ({
  left: (i * 37 + (i % 5) * 11) % 100,
  top: (i * 23 + (i % 7) * 9) % 58,
  size: 1 + ((i * 13) % 3),
  delay: ((i * 17) % 40) / 10,
}))
const EBF_LANTERNS = [
  { x: 8.5, len: 5, d: 0.0 },
  { x: 14.5, len: 9, d: 0.6 },
  { x: 85.5, len: 9, d: 0.3 },
  { x: 91.5, len: 5, d: 0.9 },
]
const EBF_FLIES = Array.from({ length: 16 }, (_, i) => ({ left: 6 + ((i * 47) % 88), top: 34 + ((i * 29) % 52), size: 3 + (i % 3) * 1.5, dur: 6 + (i % 5) * 1.6, delay: -(i * 0.9) }))
const EBF_PETALS = Array.from({ length: 9 }, (_, i) => ({ left: 4 + ((i * 53) % 92), scale: 0.7 + ((i * 41) % 60) / 100 }))

const EBFCSS = `
.ebf{--pw:140;--sh:126;--u:min(.89cqw,calc(100svh / var(--sh)));--H:calc(var(--sh)*var(--u));--gold:#c9362b;--gold2:#252321;position:relative;overflow:hidden;color:#252321;font-family:'Oswald',system-ui,sans-serif;
  background:linear-gradient(#fffaf3 0,#f8f3e9 58%,#f1dccb 100%)}
.ebf::before{content:'';position:absolute;inset:0;z-index:0;pointer-events:none;background-image:${WAVES_PALE};background-size:56px 28px;opacity:.55;-webkit-mask-image:linear-gradient(#000,transparent 85%);mask-image:linear-gradient(#000,transparent 85%)}
.ebf-stage{position:relative;width:calc(100*var(--u));max-width:100%;height:var(--H);margin:0 auto}

/* sky */
.ebf-star{display:none;position:absolute;border-radius:50%;background:#fff1e4;opacity:.2;z-index:0;animation:ebfTw 3.4s ease-in-out infinite}
@keyframes ebfTw{0%,100%{opacity:.15;transform:scale(1)}50%{opacity:.95;transform:scale(1.5)}}
.ebf-moon{will-change:transform;position:absolute;left:50%;bottom:calc(25*var(--u));width:calc(76*var(--u));aspect-ratio:1;margin-left:calc(-38*var(--u));border-radius:50%;z-index:1;
  background:radial-gradient(circle at 38% 30%,#ea3b2c,#cf2519 55%,#a81810);
  box-shadow:0 calc(1.4*var(--u)) calc(3*var(--u)) rgba(120,10,10,.3),0 0 calc(14*var(--u)) calc(3*var(--u)) rgba(201,54,43,.2)}
.ebf-moon::before{content:'';position:absolute;inset:calc(-3.2*var(--u));border-radius:50%;border:max(1px,calc(.22*var(--u))) solid rgba(201,54,43,.55)}
.ebf-moon::after{content:'';position:absolute;inset:calc(-7*var(--u));border-radius:50%;border:max(1px,calc(.18*var(--u))) dashed rgba(201,54,43,.35);animation:ebfSpin 90s linear infinite}
@keyframes ebfSpin{to{transform:rotate(360deg)}}
.ebf-aura{position:absolute;left:50%;bottom:calc(-4*var(--u));width:calc(130*var(--u));aspect-ratio:1;margin:0 0 0 calc(-65*var(--u));border-radius:50%;z-index:1;pointer-events:none;
  background:radial-gradient(circle,rgba(232,120,110,.32) 0,rgba(240,170,160,.16) 38%,transparent 66%)}
.ebf-mist{position:absolute;left:-10%;right:-10%;bottom:calc(10*var(--u));height:calc(28*var(--u));z-index:3;pointer-events:none;animation:ebfMist 9s ease-in-out infinite;
  background:radial-gradient(ellipse at 50% 100%,rgba(201,54,43,.22),rgba(201,54,43,.08) 45%,transparent 72%)}
@keyframes ebfMist{0%,100%{opacity:.7;translate:-2% 0}50%{opacity:1;translate:2% 0}}
.ebf-fly{position:absolute;border-radius:50%;background:#e8718c;box-shadow:0 0 calc(1.4*var(--u)) calc(.3*var(--u)) rgba(232,113,140,.7);z-index:6;pointer-events:none;opacity:0;animation:ebfFly var(--d) ease-in-out infinite}
@keyframes ebfFly{0%{opacity:0;translate:0 0}20%{opacity:.9}50%{translate:calc(2*var(--u)) calc(-5*var(--u))}80%{opacity:.8}100%{opacity:0;translate:calc(-1.5*var(--u)) calc(-10*var(--u))}}
@keyframes ebfFloat{0%,100%{translate:0 0}50%{translate:0 calc(-.7*var(--u))}}

/* torii gate frame + lanterns */
.ebf-torii{position:absolute;left:0;top:0;width:calc(100*var(--u));height:var(--H);z-index:3;pointer-events:none;overflow:visible}
.ebf-lan{will-change:transform;position:absolute;top:calc(13.5*var(--u));z-index:4;width:0;pointer-events:none;transform-origin:50% 0;animation:ebfSway 4.6s ease-in-out infinite}
.ebf-lan .str{display:block;margin:0 auto;width:max(1px,calc(.18*var(--u)));height:calc(var(--len)*var(--u));background:#2b0a14}
.ebf-lan .bd{position:relative;display:block;left:calc(-3.4*var(--u));width:calc(6.8*var(--u));height:calc(8.6*var(--u));border-radius:42%/26%;
  background:radial-gradient(ellipse at 50% 40%,#ffd78a 0,#ff8a3d 34%,#e0322c 72%,#a2141f 100%);
  box-shadow:0 0 calc(3*var(--u)) calc(.6*var(--u)) rgba(255,150,60,.6);}
.ebf-lan .gl{position:absolute;left:calc(-7*var(--u));top:calc(var(--len)*var(--u) - 2*var(--u));width:calc(14*var(--u));height:calc(14*var(--u));border-radius:50%;background:radial-gradient(circle,rgba(255,170,80,.55),rgba(255,120,60,.18) 45%,transparent 70%);animation:ebfGlow 3.2s ease-in-out infinite;will-change:opacity;pointer-events:none}
.ebf-lan .bd::before{content:'';position:absolute;inset:0;border-radius:inherit;background:repeating-linear-gradient(0deg,rgba(120,10,20,.45) 0 max(1px,calc(.2*var(--u))),transparent max(1px,calc(.2*var(--u))) calc(1.1*var(--u)))}
.ebf-lan .bd::after{content:'';position:absolute;left:12%;right:12%;top:-3%;height:calc(1*var(--u));background:#2b0a14;border-radius:2px;box-shadow:0 calc(9.2*var(--u)) 0 #2b0a14}
@keyframes ebfSway{0%,100%{transform:rotate(-3.5deg)}50%{transform:rotate(3.5deg)}}
@keyframes ebfGlow{0%,100%{opacity:.55}50%{opacity:1}}

/* gold lettering */
.ebf-head{position:absolute;left:0;right:0;top:calc(16*var(--u));text-align:center;z-index:5;pointer-events:none}
.ebf-eye{display:inline-flex;align-items:center;gap:calc(1.6*var(--u));font-weight:500;font-size:max(9px,calc(1.8*var(--u)));letter-spacing:.42em;padding-left:.42em;text-transform:uppercase;color:var(--gold2)}
.ebf-eye i{display:block;width:calc(4*var(--u));height:1px;background:linear-gradient(to right,transparent,var(--gold))}
.ebf-eye i:last-child{background:linear-gradient(to left,transparent,var(--gold))}
.ebf-ttl{margin:calc(1*var(--u)) 0 0;font-family:'Jansina','Brusher','Anton','Impact',sans-serif;font-weight:400;font-synthesis:none;line-height:.94;letter-spacing:.05em;padding-left:.05em;text-transform:uppercase;font-size:calc(7.6*var(--u));letter-spacing:.04em;
  filter:drop-shadow(0 calc(.5*var(--u)) calc(.9*var(--u)) rgba(120,20,20,.28))}
.ebf-ttl span.l{display:block;white-space:nowrap}
.ebf-ch{will-change:transform,opacity;display:inline-block;background:linear-gradient(#e24a35 0,#c9362b 50%,#8c0b26 100%);-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent}
.ebf-kj{display:inline-flex;align-items:center;gap:calc(1.4*var(--u));margin-top:calc(1.2*var(--u));font-family:'Noto Serif JP','Shippori Mincho',serif;font-weight:700;font-size:max(12px,calc(2.6*var(--u)));letter-spacing:.7em;padding-left:.7em;color:var(--gold);text-shadow:0 1px 0 rgba(255,250,243,.9)}
.ebf-kj i{display:block;width:calc(9*var(--u));height:1px;background:linear-gradient(to right,transparent,var(--gold))}
.ebf-kj i:last-child{background:linear-gradient(to left,transparent,var(--gold))}
.ebf-side{position:absolute;top:calc(16*var(--u));z-index:5;writing-mode:vertical-rl;font-family:'Noto Serif JP','Shippori Mincho',serif;font-weight:700;font-size:max(13px,calc(3.4*var(--u)));letter-spacing:.5em;color:var(--gold2);opacity:.75;text-shadow:0 1px 0 rgba(255,250,243,.9);pointer-events:none}
.ebf-side.a{left:calc(19.5*var(--u))}.ebf-side.b{right:calc(19.5*var(--u))}
@container (max-width:699px){
  .ebf-side{display:none}
  .ebf{--H:clamp(calc(130*var(--u)),100svh,calc(200*var(--u)));--pw:142}
  .ebf-photo{animation:none;width:calc(142*var(--u));margin:0 0 0 calc(142*var(--u)*-.5);bottom:calc(10*var(--u))}
  .ebf-moon{width:calc(76*var(--u));margin-left:calc(-38*var(--u));bottom:calc(20*var(--u))}
  .ebf-seal{left:calc(50% + min(calc(142*var(--u)*.31), 40cqw));bottom:calc(14*var(--u))}
  .ebf-ttl{font-size:calc(8.2*var(--u));letter-spacing:.03em}
  .ebf-eye{font-size:max(10px,calc(2.1*var(--u)))}
  /* lighter on phones: fewer stars, fireflies and petals, one cheap outline instead of six filters, no idle float */
  .ebf-star:nth-child(3n),.ebf-star:nth-child(3n+1){display:none}
  .ebf-fly:nth-of-type(odd),.ebf-petal:nth-of-type(odd){display:none}
  .ebf-photo img{filter:drop-shadow(0 0 max(1.5px,calc(.35*var(--u))) #fffaf3) drop-shadow(0 calc(1.2*var(--u)) calc(2*var(--u)) rgba(90,10,20,.4))}
  .ebf-moon::after{animation:none}
}

/* the team */
.ebf-photo{will-change:transform,clip-path;backface-visibility:hidden;position:absolute;left:50%;bottom:calc(11*var(--u));width:calc(var(--pw)*var(--u));margin:0 0 0 calc(var(--pw)*var(--u)*-.5);z-index:4;pointer-events:none;animation:ebfFloat 7s ease-in-out infinite}
.ebf-photo img{display:block;width:100%;height:auto;
  filter:drop-shadow(max(1.5px,calc(.28*var(--u))) 0 0 #fffaf3) drop-shadow(min(-1.5px,calc(-.28*var(--u))) 0 0 #fffaf3) drop-shadow(0 max(1.5px,calc(.28*var(--u))) 0 #fffaf3) drop-shadow(0 min(-1.5px,calc(-.28*var(--u))) 0 #fffaf3)
         drop-shadow(0 0 calc(2.2*var(--u)) rgba(255,150,120,.35)) drop-shadow(0 calc(1.4*var(--u)) calc(2.2*var(--u)) rgba(90,10,20,.4))}
.ebf-seal{position:absolute;left:calc(50% + var(--pw)*var(--u)*.32);bottom:calc(15*var(--u));z-index:6;width:max(34px,calc(9.5*var(--u)));aspect-ratio:1;display:flex;align-items:center;justify-content:center;writing-mode:vertical-rl;
  background:#c9362b;color:#fff1e4;font-family:'Noto Serif JP','Shippori Mincho',serif;font-weight:700;font-size:max(13px,calc(3.2*var(--u)));border-radius:3px;rotate:-8deg;box-shadow:0 4px 12px rgba(0,0,0,.4),inset 0 0 0 2px rgba(255,241,228,.3)}

/* ground + caption */
.ebf-ground{position:absolute;left:0;right:0;bottom:0;height:calc(11*var(--u));z-index:7;background:linear-gradient(#6a0720,#3a0613);border-top:max(2px,calc(.5*var(--u))) solid #f6c768;pointer-events:none}
.ebf-ground::after{content:'';position:absolute;inset:0;background-image:${WAVES_DARK};background-size:40px 20px;background-position:center top;opacity:1;-webkit-mask-image:linear-gradient(transparent,#000 60%);mask-image:linear-gradient(transparent,#000 60%)}
.ebf-cap{position:absolute;left:0;right:0;bottom:calc(2.6*var(--u));text-align:center;z-index:8;pointer-events:none}
.ebf-cap span{display:inline-block;padding:.55em 1.6em;background:rgba(42,3,16,.88);border:1px solid rgba(246,199,104,.7);color:#fff1e4;font-weight:500;font-size:max(9px,calc(1.9*var(--u)));letter-spacing:.3em;text-transform:uppercase;white-space:nowrap}
.ebf-petal{will-change:transform;position:absolute;top:0;z-index:7;width:max(7px,calc(1.6*var(--u)));height:max(5px,calc(1.15*var(--u)));background:#f4b6c4;border-radius:100% 0 100% 0;opacity:.85;pointer-events:none}
.ebf-glow{position:absolute;inset:0;z-index:9;pointer-events:none;opacity:0;background:radial-gradient(circle at 50% 56%,rgba(255,226,150,.9),transparent 60%)}
.ebf:not(.live) .ebf-star,.ebf:not(.live) .ebf-lan,.ebf:not(.live) .ebf-lan .gl,.ebf:not(.live) .ebf-moon::after,.ebf:not(.live) .ebf-mist,.ebf:not(.live) .ebf-fly,.ebf:not(.live) .ebf-photo{animation-play-state:paused}
@media (prefers-reduced-motion:reduce){.ebf-star,.ebf-lan,.ebf-lan .gl,.ebf-moon::after,.ebf-mist,.ebf-fly,.ebf-photo{animation:none}}
`

function EbGroupPhoto({ onMissing }: { onMissing: () => void }) {
  const secRef = useRef<HTMLElement>(null)
  const lines = ['EB REVENANTS']

  useLayoutEffect(() => {
    const root = secRef.current
    if (!root) return
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const q = gsap.utils.selector(root)

        // the whole reveal is ONE paused timeline, played when the finale scrolls into view
        const tl = gsap.timeline({ paused: true })
        tl.fromTo(q('.ebf-star'), { opacity: 0 }, { opacity: 0.25, duration: 1.6, stagger: { each: 0.03, from: 'random' }, ease: 'power1.out' }, 0)
          .fromTo(q('.ebf-moon'), { yPercent: 55, scale: 0.78, opacity: 0 }, { yPercent: 0, scale: 1, opacity: 1, duration: 2, ease: 'expo.out' }, 0.1)
          .fromTo(q('.ebf-aura'), { opacity: 0 }, { opacity: 1, duration: 2.4, ease: 'power2.out' }, 0.3)
          .fromTo(q('.ebf-pillar'), { scaleY: 0 }, { scaleY: 1, duration: 1.1, stagger: 0.08, ease: 'expo.out', transformOrigin: '50% 100%' }, 0.4)
          .fromTo(q('.ebf-beam'), { yPercent: -120, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.1, stagger: 0.12, ease: 'bounce.out' }, 0.9)
          .fromTo(q('.ebf-lan'), { yPercent: -60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.1, stagger: 0.14, ease: 'back.out(2)' }, 1.3)
          .fromTo(q('.ebf-eye'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 1.1)
          .from(q('.ebf-ch'), { yPercent: 120, opacity: 0, rotation: () => gsap.utils.random(-8, 8), duration: 0.9, stagger: 0.045, ease: 'back.out(1.6)' }, 1.25)
          .fromTo(q('.ebf-kj'), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 1.9)
          .fromTo(q('.ebf-side'), { opacity: 0, y: -24 }, { opacity: 0.75, y: 0, duration: 0.9, stagger: 0.15, ease: 'power3.out' }, 2)
          // the team is revealed from the centre of the moon, like a lantern being lit
          .fromTo(q('.ebf-photo'), { clipPath: 'circle(0% at 50% 38%)', scale: 1.1, opacity: 1 }, { clipPath: 'circle(100% at 50% 38%)', scale: 1, duration: 2, ease: 'power3.inOut', transformOrigin: '50% 100%' }, 1.9)
          .fromTo(q('.ebf-glow'), { opacity: 0 }, { opacity: 0.55, duration: 0.5, ease: 'power2.out' }, 2.6)
          .to(q('.ebf-glow'), { opacity: 0, duration: 1.4, ease: 'power2.out' }, 3.1)
          .fromTo(q('.ebf-seal'), { opacity: 0, scale: 3, rotation: -28 }, { opacity: 1, scale: 1, rotation: -8, duration: 0.5, ease: 'back.out(2.4)' }, 3.5)
          .fromTo(q('.ebf-cap'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 3.3)

        let ebfStarted = false
        const ebfGo = (self: ScrollTrigger) => { if (ebfStarted) return; ebfStarted = true; playFor(tl, self); self.kill() }
        ScrollTrigger.create({ trigger: root, start: 'top 75%', end: 'bottom top', onEnter: ebfGo, onEnterBack: ebfGo })

        // depth while scrolling: moon, hills and the team drift at different speeds
        gsap.fromTo(q('.ebf-moon'), { y: () => root.offsetHeight * 0.04 }, { y: () => -root.offsetHeight * 0.04, ease: 'none', scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: 0.5, invalidateOnRefresh: true } })

        // petals + animated CSS loops run only while the finale is on screen
        const loops: gsap.core.Tween[] = []
        const hh = root.offsetHeight || 500
        q('.ebf-petal').forEach((p, i) => {
          gsap.set(p, { y: -30, rotation: gsap.utils.random(0, 360) })
          loops.push(
            gsap.to(p, { y: hh * 1.02, duration: gsap.utils.random(8, 13), ease: 'none', repeat: -1, delay: -gsap.utils.random(0, 10), paused: true }),
            gsap.to(p, { x: gsap.utils.random(30, 70) * (i % 2 ? 1 : -1), rotation: '+=240', duration: gsap.utils.random(3, 5), ease: 'sine.inOut', yoyo: true, repeat: -1, paused: true }),
          )
        })
        ScrollTrigger.create({
          trigger: root, start: 'top bottom', end: 'bottom top',
          onToggle: (self) => {
            root.classList.toggle('live', self.isActive)
            loops.forEach((t) => (self.isActive ? t.resume() : t.pause()))
          },
        })
      })
    }, root)

    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    return () => ctx.revert()
  }, [])

  return (
    <section className="ebf" ref={secRef} aria-label="EB Revenants, group photo">
      <style>{EBFCSS}</style>

      {/* stars span the full width of the page */}
      {EBF_STARS.map((st, i) => (
        <span key={i} className="ebf-star" aria-hidden="true" style={{ left: `${st.left}%`, top: `${st.top}%`, width: st.size, height: st.size, animationDelay: `${st.delay}s` }} />
      ))}

      <div className="ebf-stage">
        <div className="ebf-aura" aria-hidden="true" />
        <div className="ebf-moon" aria-hidden="true" />
        <div className="ebf-mist" aria-hidden="true" />


        {/* giant torii gate */}
        <svg className="ebf-torii" viewBox="0 0 100 104" preserveAspectRatio="xMidYMin meet" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="ebfV" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#f0503f" />
              <stop offset=".55" stopColor="#d6322b" />
              <stop offset="1" stopColor="#a31a1d" />
            </linearGradient>
          </defs>
          <g className="ebf-pillar"><rect x="6" y="9" width="4.6" height="260" fill="url(#ebfV)" /></g>
          <g className="ebf-pillar"><rect x="89.4" y="9" width="4.6" height="260" fill="url(#ebfV)" /></g>
          <g className="ebf-beam"><rect x="3" y="11" width="94" height="3.1" fill="url(#ebfV)" /></g>
          <g className="ebf-beam"><rect x="2" y="6.6" width="96" height="2.4" fill="#a31a1d" /><path d="M-3 3.4 Q50 -1.2 103 3.4 L101 7.4 Q50 3.2 -1 7.4 Z" fill="#1b0a1c" /></g>
        </svg>

        {EBF_LANTERNS.map((l, i) => (
          <div key={i} className="ebf-lan" aria-hidden="true" style={{ left: `${l.x}%`, animationDelay: `${l.d}s`, ['--len' as string]: l.len } as React.CSSProperties}>
            <i className="gl" />
            <i className="str" />
            <b className="bd" />
          </div>
        ))}

        <div className="ebf-head">
          <div className="ebf-eye"><i /><TagMark /><span>AIESEC in SLIIT · Catalyst 7.0</span><i /></div>
          <h2 className="ebf-ttl" aria-label="EB Revenants">
            {lines.map((w) => (
              <span className="l" key={w} aria-hidden="true">
                {w.split('').map((c, i) => <span className="ebf-ch" key={i}>{c === ' ' ? '\u00A0' : c}</span>)}
              </span>
            ))}
          </h2>
          <div className="ebf-kj" aria-hidden="true"><i /><span>理事会</span><i /></div>
        </div>

        <div className="ebf-side a" aria-hidden="true">理事会</div>
        <div className="ebf-side b" aria-hidden="true">触媒七</div>

        <figure className="ebf-photo">
          <img src={GROUP_PHOTO} alt="EB Revenants together" loading="lazy" decoding="async" draggable={false} onError={onMissing} />
        </figure>
        <div className="ebf-seal" aria-hidden="true">理事</div>

        {EBF_FLIES.map((f, i) => (
          <span key={i} className="ebf-fly" aria-hidden="true" style={{ left: `${f.left}%`, top: `${f.top}%`, width: f.size, height: f.size, animationDelay: `${f.delay}s`, ['--d' as string]: `${f.dur}s` } as React.CSSProperties} />
        ))}
        {EBF_PETALS.map((p, i) => (
          <span key={i} className="ebf-petal" aria-hidden="true" style={{ left: `${p.left}%`, scale: String(p.scale) }} />
        ))}
      </div>

      <div className="ebf-ground" aria-hidden="true" />
      <div className="ebf-cap" aria-hidden="true"><span>EB Revenants</span></div>
      <div className="ebf-glow" aria-hidden="true" />
    </section>
  )
}

// shows the real photo, or the cut-out group if the photo file is missing
function EbFinale() {
  const [missing, setMissing] = useState(false)
  if (!USE_REAL_GROUP_PHOTO || missing) {
    return (
      <OcGroup
        rows={ROWS}
        words={['EB', 'REVENANTS']}
        kanjiA="理事"
        kanjiB="理事会"
        seal="理事"
        caption="EB Revenants"
        label="EB Revenants"
      />
    )
  }
  return <EbGroupPhoto onMissing={() => setMissing(true)} />
}

export function EbRoster() {
  const listRef = useRef<HTMLDivElement>(null)

  // prepare all the cut-outs one by one in idle time, so nothing is processed while you scroll
  useEffect(() => {
    let dead = false
    ;(async () => {
      for (const m of MEMBERS) {
        if (dead) return
        await getCutout(photo(m.file), m.keep ?? 0.6)
        await whenIdle()
      }
    })()
    return () => { dead = true }
  }, [])

  // one layout refresh after fonts load (instead of one per slide)
  useEffect(() => {
    let t: number | undefined
    document.fonts?.ready.then(() => { t = window.setTimeout(() => ScrollTrigger.refresh(), 150) })
    return () => window.clearTimeout(t)
  }, [])

  // progress thread: fills as you scroll through the whole list
  useLayoutEffect(() => {
    const root = listRef.current
    if (!root) return
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const fill = root.querySelector('.ebm-rail i')
        if (!fill) return
        gsap.fromTo(fill, { scaleY: 0 }, {
          scaleY: 1, ease: 'none', transformOrigin: '50% 0%',
          scrollTrigger: { trigger: root, start: 'top 55%', end: 'bottom 55%', scrub: 0.4 },
        })
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <div className="ocx-wrap">
      <style>{EBCSS}</style>
      <style>{CSS + GCSS}</style>
      <div className="ebm-list" ref={listRef}>
        <div className="ebm-rail" aria-hidden="true"><i /></div>
        {MEMBERS.map((m, i) => (
          <EbSlot key={m.name} m={m} i={i} total={MEMBERS.length} />
        ))}
      </div>
      <LazyMount>
        <EbFinale />
      </LazyMount>
    </div>
  )
}