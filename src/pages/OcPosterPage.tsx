import React, { useMemo, useRef, useState } from 'react'
import { TagMark } from '../components/brand/CatalystTag';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { SakuraPetals } from '../components/SakuraPetals'

// ============================================================================
// OC DATA. To add / edit a person change ONE line. Order = order on the page.
// `name`: everything but the last word is line 1, the last word is line 2.
// `kanji`: shown as a big faint watermark + on the red hanko seal of each photo.
// Photos: public/assets/cat-oc-pics/ (transparent cut-outs, never altered)
// ============================================================================
type Member = { name: string; role: string; file: string }
type Dept = { key: string; label: string; kanji: string; members: Member[] }

const DIR = '/assets/cat-oc-pics/'

const DEPTS: Dept[] = [
  {
    key: 'ocp', label: 'OCP', kanji: '会長',
    members: [{ name: 'Mahdy Hassan', role: 'OC President', file: 'mahdy-hassan-ocp.webp' }],
  },
  {
    key: 'pd', label: 'OCVP PD', kanji: '成長',
    members: [
      { name: 'Chetha Atapattu', role: 'OCVP · PD', file: 'chetha-atapattu-ocvp-pd.webp' },
      { name: 'Nethuli Gunathilaka', role: 'OCVP · PD', file: 'nethuli-gunathilaka-ocvp-pd.webp' },
      { name: 'Vimarshi', role: 'OCVP · PD', file: 'vimarshi-ocvp-pd.webp' },
      { name: 'Gihansa', role: 'OCVP · PD', file: 'gihansa-ocvp-pd.webp' },
      { name: 'Hari', role: 'OCVP · PD', file: 'hari-ocvp-pd.webp' },
    ],
  },
  {
    key: 'mak', label: 'OCVP MAK', kanji: '広報',
    members: [
      { name: 'Harshitha Yasiru', role: 'OCVP · MAK', file: 'harshitha-yasiru-ocvp-marketing.webp' },
      { name: 'Isuri Walpola', role: 'OCVP · MAK', file: 'isuri-walpola-ocvp-marketing.webp' },
      { name: 'Dahamsa', role: 'OCVP · MAK', file: 'dahamsa-ocvp-marketing.webp' },
      { name: 'Miran', role: 'OCVP · MAK', file: 'miran-ocvp-marketing.webp' },
    ],
  },
  {
    key: 'fin', label: 'OCVP FINANCE', kanji: '財務',
    members: [{ name: 'Monali Edirisinghe', role: 'OCVP · Finance', file: 'monali-edirisinghe-ocvp-finance.webp' }],
  },
  {
    key: 'de', label: 'OCVP D&E', kanji: '祭典',
    members: [
      { name: 'Binushi', role: 'OCVP · D&E', file: 'binushi-ocvp-delegates-and-events.webp' },
      { name: 'Tharuka', role: 'OCVP · D&E', file: 'tharuka-ocvp-delegates-and-events.webp' },
      { name: 'Vindhi Akmeemana', role: 'OCVP · D&E', file: 'vindhi-akmeemana-ocvp-delegates-and-events.webp' },
      { name: 'Isuri Muthumalee', role: 'OCVP · D&E', file: 'isuri-muthumalee-ocvp-delegates-and-events.webp' },
    ],
  },
  {
    key: 'log', label: 'OCVP LOGISTICS', kanji: '運営',
    members: [
      { name: 'Lakwan', role: 'OCVP · Logistics', file: 'lakwan-ocvp-logistics.webp' },
      { name: 'Yehan', role: 'OCVP · Logistics', file: 'yehan-ocvp-logistics.webp' },
      { name: 'Maneesha', role: 'OCVP · Logistics', file: 'maneesha-ocvp-logistics.webp' },
      { name: 'Adithya', role: 'OCVP · D&E × Logistics', file: 'adithya-ocvp-del-x-log.webp' },
    ],
  },
]

const TOTAL_MEMBERS = DEPTS.reduce((n, d) => n + d.members.length, 0)

const SERIF = "'Cormorant Garamond', 'Cinzel', 'Shippori Mincho', serif"
const KANJI = "'Noto Serif JP', 'Shippori Mincho', serif"
const SANS = "'Montserrat', 'Inter', sans-serif"
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

// Illustration library (public/assets/illustrations). A missing file hides itself.
const ART_DIR = '/assets/illustrations/'
const HERO_BRANCH = '/assets/hero-section-assets/sakura-branch.webp'
const F = {
  koiSun: 'benkageyama-koi-5135969_1920.png',
  samurai: 'benkageyama-samurai-5135974_1920.png',
  mask: 'alessandro-hrdz-mask-6976331.png',
  fan: 'jakeloris-fan-7039967.png',
  koi: 'kacsoeszti-koi-1184783_1920.png',
  tree: 'susannp4-tree-1586365_1920.webp',
  pagoda: 'gdj-building-8171699.svg',
  bonsai: 'gdj-bonsai-tree-8143900.svg',
  dragon: 'gdj-dragon-8095373.svg',
  oni: 'yabisan-art-oni-8583401.svg',
}

const Art = ({ f, src, className = '' }: { f?: string; src?: string; className?: string }) => (
  <img
    src={src ?? ART_DIR + f}
    alt=""
    aria-hidden="true"
    loading="lazy"
    decoding="async"
    draggable={false}
    className={`ocg-art ${className}`}
    onError={(e) => {
      e.currentTarget.style.display = 'none'
    }}
  />
)

// ============================================================================
// TORN PAPER EDGE for each department panel
// ============================================================================
const rnd = (seed: number) => () => {
  let s = (seed |= 0)
  s = (s + 0x6d2b79f5) | 0
  seed = s
  let t = Math.imul(s ^ (s >>> 15), 1 | s)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const tornPanel = (i: number) => {
  const N = 70
  const r = rnd(i * 53 + 7)
  const top: string[] = []
  const bot: string[] = []
  for (let q = 0; q <= N; q++) {
    const x = ((q / N) * 100).toFixed(2)
    const a = 9 + (r() - 0.5) * 8 + 3 * Math.sin(q * 0.3 + i)
    const b = 9 + (r() - 0.5) * 8 + 3 * Math.sin(q * 0.27 + i * 2)
    top.push(`${x}% ${a.toFixed(1)}px`)
    bot.push(`${x}% calc(100% - ${b.toFixed(1)}px)`)
  }
  return `polygon(${top.join(',')},${bot.reverse().join(',')})`
}

// ============================================================================
// STYLES
// ============================================================================
const PAPER = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .45 0 0 0 0 .33 0 0 0 0 .2 0 0 0 .1 0'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)'/%3E%3C/svg%3E")`

const SEIGAIHA = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='20' viewBox='0 0 40 20'%3E%3Cg fill='%23F5EBDD' stroke='%23B92D25' stroke-width='1.4'%3E%3Ccircle cx='0' cy='10' r='18'/%3E%3Ccircle cx='0' cy='10' r='12'/%3E%3Ccircle cx='0' cy='10' r='6'/%3E%3Ccircle cx='40' cy='10' r='18'/%3E%3Ccircle cx='40' cy='10' r='12'/%3E%3Ccircle cx='40' cy='10' r='6'/%3E%3Ccircle cx='20' cy='20' r='18'/%3E%3Ccircle cx='20' cy='20' r='12'/%3E%3Ccircle cx='20' cy='20' r='6'/%3E%3C/g%3E%3C/svg%3E")`

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Montserrat:wght@500;600;700&family=Noto+Serif+JP:wght@600;700&display=swap');
.ocg-page{--bg:#F5EBDD;--bg2:#EFE1CB;--red:#B92D25;--deep:#921E1A;--cream:#FFF8ED;--ink:#29211D;--gold:#C9962E}
.ocg-group{position:relative;padding:72px 0 84px}
.ocg-paper{position:absolute;inset:0;background-image:${PAPER}}
.ocg-inner{position:relative;z-index:2;max-width:1180px;margin:0 auto;padding:0 clamp(12px,3vw,40px);display:flex;flex-direction:column;gap:20px}
@media(min-width:768px){.ocg-inner{flex-direction:row;gap:clamp(10px,2.4vw,36px)}}

/* illustration helper: multiply blends the art INTO the paper like printed ink */
.ocg-art{display:block;width:100%;height:auto;mix-blend-mode:multiply;pointer-events:none;user-select:none}
.ocg-art.faint{opacity:.15}
.ocg-art.soft{opacity:.5}
.ocg-art.drop{filter:drop-shadow(0 10px 14px rgba(146,30,26,.22))}

/* big faint department kanji */
.ocg-kanji{display:block;font-family:${KANJI};font-weight:700;writing-mode:vertical-rl;line-height:1;letter-spacing:.08em;font-size:clamp(120px,24vw,330px);color:var(--red);opacity:.075;white-space:nowrap}

/* department label */
.ocg-mlabel{position:relative;align-self:flex-start;padding:16px 38px 18px 22px;color:var(--cream);font-family:${SERIF};font-weight:700;font-size:1.7rem;letter-spacing:.14em;line-height:1;display:flex;align-items:center;gap:12px}
.ocg-mlabel small{position:relative;font-family:${KANJI};font-size:.8rem;letter-spacing:.3em;opacity:.8}
@media(min-width:768px){.ocg-mlabel{display:none}}
.ocg-vlabel{display:none;flex:none;width:clamp(86px,9.5vw,124px);position:relative}
@media(min-width:768px){.ocg-vlabel{display:block}}
.ocg-vsticky{position:sticky;top:104px;display:flex;justify-content:center;gap:10px}
.ocg-vbar{position:relative;width:clamp(58px,6.4vw,84px);padding:54px 0 70px;display:flex;justify-content:center;color:var(--cream)}
.ocg-vbar h2{margin:0;writing-mode:vertical-rl;transform:rotate(180deg);white-space:nowrap;font-family:${SERIF};font-weight:700;font-size:clamp(1.7rem,3.2vw,2.9rem);letter-spacing:.2em;line-height:1;position:relative;z-index:1}
.ocg-vbar .dia{position:absolute;bottom:34px;left:50%;translate:-50% 0;width:11px;height:11px;border:1.5px solid var(--cream);rotate:45deg;z-index:1}
.ocg-vbar .kj{position:absolute;top:18px;left:50%;translate:-50% 0;z-index:1;font-family:${KANJI};font-size:.78rem;letter-spacing:.1em;writing-mode:vertical-rl;opacity:.75}
.ocg-vline{width:3px;align-self:stretch;margin-top:16px;background:linear-gradient(var(--red),var(--deep));opacity:.7;border-radius:2px;min-height:160px}
.ocg-svg{position:absolute;inset:0;width:100%;height:100%}

/* collage */
.ocg-tiles{flex:1;min-width:0;display:flex;flex-wrap:wrap;justify-content:center;align-items:flex-start;padding-bottom:20px}
.ocg-tile{position:relative;width:52%;margin:0 -2% 30px;z-index:1}
.ocg-tile:nth-child(even){margin-top:36px}
.ocg-tile.lead{width:78%;margin:0 auto 20px}
@media(min-width:768px){
  .ocg-tile{width:36%;margin:0 -2.2% 38px}
  .ocg-tile:nth-child(even){margin-top:64px}
  .ocg-tile.lead{width:46%;margin:0 auto 20px}
}
.ocg-tile:hover{z-index:5}
.ocg-wash{position:absolute;left:-14%;right:-14%;top:30%;height:46%;opacity:.15;z-index:0;pointer-events:none}
.ocg-tile.L .ocg-wash{rotate:-6deg}.ocg-tile.R .ocg-wash{rotate:6deg}
.ocg-pic{position:relative;z-index:1;aspect-ratio:4/5;-webkit-mask-image:linear-gradient(#000 80%,transparent 100%);mask-image:linear-gradient(#000 80%,transparent 100%)}
.ocg-pic img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 4%;filter:drop-shadow(0 10px 16px rgba(146,30,26,.2));transition:scale .45s ease;transform-origin:50% 100%}
.ocg-tile:hover .ocg-pic img{scale:1.035}
/* little red hanko stamp on each portrait */
.ocg-seal{position:absolute;top:6%;z-index:4;width:clamp(26px,3.4vw,40px);aspect-ratio:1;display:flex;align-items:center;justify-content:center;background:var(--red);color:var(--cream);font-family:${KANJI};font-weight:700;font-size:clamp(13px,1.7vw,20px);border-radius:3px;box-shadow:0 3px 8px rgba(146,30,26,.35),inset 0 0 0 2px rgba(255,248,237,.28);transition:rotate .35s ease,scale .35s ease;pointer-events:none}
.ocg-tile.L .ocg-seal{right:6%;rotate:5deg}
.ocg-tile.R .ocg-seal{left:6%;rotate:-5deg}
.ocg-tile:hover .ocg-seal{rotate:0deg;scale:1.12}
.ocg-stroke{position:absolute;bottom:2%;width:92%;z-index:3}
.ocg-tile.L .ocg-stroke{left:-9%;rotate:-2deg}
.ocg-tile.R .ocg-stroke{right:-9%;rotate:2deg}
.ocg-stroke-in{position:relative;padding:clamp(14px,2vw,22px) clamp(20px,3vw,36px) clamp(16px,2.2vw,24px);text-align:center;color:var(--cream)}
.ocg-stroke-in h3{position:relative;margin:0;font-family:${SERIF};font-weight:700;text-transform:uppercase;letter-spacing:.09em;line-height:1.12;font-size:clamp(13.5px,1.75vw,21px);text-shadow:0 1px 2px rgba(60,10,8,.35)}
.ocg-stroke-in h3 span{display:block}
.ocg-stroke-in p{position:relative;margin:7px 0 0;font-family:${SANS};font-weight:600;text-transform:uppercase;letter-spacing:.2em;font-size:clamp(8px,.92vw,10.5px);color:#FFE6D8}
.ocg-tile.lead .ocg-stroke-in h3{font-size:clamp(16px,2.3vw,28px)}
.ocg-tile.lead .ocg-stroke-in p{font-size:clamp(9px,1.05vw,12px)}

/* divider between departments */
.ocg-div{display:flex;align-items:center;gap:14px;max-width:960px;margin:34px auto;padding:0 20px}
.ocg-div i{flex:1;height:1px;background:linear-gradient(90deg,transparent,var(--red) 30%,var(--red) 70%,transparent);opacity:.6}
.ocg-div b{width:11px;height:11px;border:1.5px solid var(--red);rotate:45deg;position:relative}
.ocg-div b::after{content:'';position:absolute;inset:2.5px;background:var(--red)}
.ocg-deco{position:absolute;pointer-events:none;user-select:none}
.ocg-waves{position:absolute;left:0;right:0;bottom:0;height:78px;background-image:${SEIGAIHA};background-size:40px 20px;background-repeat:repeat;opacity:.5;-webkit-mask-image:linear-gradient(transparent,#000 75%);mask-image:linear-gradient(transparent,#000 75%);pointer-events:none}

/* ---------- HINOMARU POSTER HEADER ---------- */
.ocg-hero{position:relative;padding:112px 12px 36px;text-align:center;overflow:hidden}
@media(min-width:640px){.ocg-hero{padding-top:132px}}
.ocg-poster{position:relative;width:min(700px,94vw);margin:0 auto;aspect-ratio:1/1.0}
@media(min-width:640px){.ocg-poster{aspect-ratio:1/.92}}
.ocg-disc{position:absolute;left:50%;top:0;translate:-50% 0;width:80%;aspect-ratio:1;border-radius:50%;
  background:radial-gradient(circle at 38% 34%,#DB4A3F 0%,#B92D25 52%,#8F1C18 100%);
  box-shadow:0 30px 70px -18px rgba(146,30,26,.55),inset 0 -14px 40px rgba(60,8,6,.28)}
.ocg-disc::after{content:'';position:absolute;inset:0;border-radius:50%;background-image:${PAPER};opacity:.5;mix-blend-mode:multiply}
.ocg-ptext{position:absolute;left:50%;top:24%;translate:-50% 0;width:80%;z-index:3;color:var(--cream)}
.ocg-ptag{display:inline-flex;align-items:center;gap:10px;font-family:${SANS};font-weight:700;font-size:clamp(8px,1.6vw,12px);letter-spacing:.3em;text-transform:uppercase;color:#FFE6D8;padding-left:.3em}
.ocg-ptag b{display:inline-flex;align-items:center;justify-content:center;width:clamp(22px,3.4vw,32px);aspect-ratio:1;background:var(--cream);color:var(--red);font-family:${KANJI};font-size:clamp(12px,1.9vw,18px);border-radius:3px}
.ocg-ptext h1{margin:clamp(8px,1.6vw,16px) 0 0;font-family:${SERIF};font-weight:700;line-height:1.02;letter-spacing:.08em;font-size:clamp(1.65rem,7.3vw,3.8rem);text-shadow:0 3px 14px rgba(60,8,6,.45)}
.ocg-ptext h1 span{display:block}
.ocg-psub{margin:clamp(8px,1.6vw,16px) 0 0;font-family:${KANJI};font-weight:600;font-size:clamp(.7rem,1.8vw,1rem);letter-spacing:.5em;padding-left:.5em;color:#FFE6D8;opacity:.9}
.ocg-fuji{position:absolute;left:-2%;right:-2%;bottom:0;z-index:2;pointer-events:none}
.ocg-pcorner{position:absolute;z-index:4;pointer-events:none}
.ocg-vtext{position:absolute;top:8%;z-index:1;display:none;font-family:${KANJI};font-weight:700;writing-mode:vertical-rl;letter-spacing:.5em;font-size:clamp(14px,1.9vw,22px);color:var(--ink);opacity:.5}
@media(min-width:900px){.ocg-vtext{display:block}}
.ocg-vtext.L{left:-2%}.ocg-vtext.R{right:-2%}
.ocg-vtext::before{content:'';display:block;width:1px;height:46px;background:var(--red);margin:0 auto 14px;opacity:.7}
.ocg-hero-branch{position:absolute;top:56px;right:-14px;width:min(330px,56vw);z-index:0;pointer-events:none;scale:-1 1}
@media(min-width:640px){.ocg-hero-branch{top:70px;width:min(440px,40vw)}}
.ocg-chips{position:relative;z-index:3;display:inline-flex;align-items:center;gap:16px;margin-top:22px;padding:10px 24px;border:1px solid rgba(41,33,29,.25);border-radius:999px;background:rgba(255,248,237,.7);font-family:${SANS};font-weight:700;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:var(--ink)}
.ocg-chips b{font-family:${SERIF};font-size:1.5em;letter-spacing:.02em;color:var(--red);margin-right:6px}
.ocg-chips i{width:5px;height:5px;background:var(--red);rotate:45deg}
.ocg-lede{position:relative;z-index:3;max-width:30rem;margin:20px auto 0;font-size:15px;line-height:1.7;color:rgba(41,33,29,.72)}

/* ---------- OUTRO ---------- */
.ocg-outro{position:relative;padding:70px 16px 90px;text-align:center;overflow:hidden}
.ocg-outro-kanji{font-family:${KANJI};font-weight:700;font-size:.8rem;letter-spacing:.7em;padding-left:.7em;color:var(--red);opacity:.8;margin:0 0 18px}
`

// ============================================================================
// BRUSH STROKES (SVG, rough edges via displacement filter; defined once in <Defs/>)
// ============================================================================
const Defs = () => (
  <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="ocGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#B92D25" />
        <stop offset="1" stopColor="#921E1A" />
      </linearGradient>
      <filter id="ocRough" x="-6%" y="-25%" width="112%" height="150%">
        <feTurbulence type="fractalNoise" baseFrequency="0.03 0.09" numOctaves="3" seed="4" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="10" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </defs>
  </svg>
)

const BrushH = ({ className = 'ocg-svg' }: { className?: string }) => (
  <svg viewBox="0 0 500 100" preserveAspectRatio="none" className={className} aria-hidden="true">
    <g filter="url(#ocRough)">
      <path
        d="M4 34 C40 14 110 20 190 10 C280 2 380 14 440 8 C470 6 492 12 498 18 L492 78 C440 90 372 80 290 90 C200 98 110 88 50 94 C28 96 12 92 2 86 C8 70 0 52 4 34 Z"
        fill="url(#ocGrad)"
      />
      <path d="M30 40H300M60 56H460M24 72H240" stroke="#FFF8ED" strokeOpacity=".1" strokeWidth="2" fill="none" />
    </g>
  </svg>
)

const BrushV = () => (
  <svg viewBox="0 0 100 600" preserveAspectRatio="none" className="ocg-svg" aria-hidden="true">
    <g filter="url(#ocRough)">
      <path
        d="M10 8 C30 0 70 6 90 2 L96 120 C92 200 98 300 94 400 C98 480 92 560 88 598 L14 590 C8 520 12 440 6 360 C10 280 4 200 10 120 Z"
        fill="url(#ocGrad)"
      />
      <path d="M30 20V420M52 40V580M72 12V330" stroke="#FFF8ED" strokeOpacity=".09" strokeWidth="2" fill="none" />
    </g>
  </svg>
)

// ============================================================================
// JAPANESE BACKGROUND MOTIFS: low contrast, muted red
// ============================================================================
const Sun = () => (
  <svg viewBox="0 0 200 200" width="100%" aria-hidden="true">
    <circle cx="100" cy="100" r="92" fill="#B92D25" opacity=".17" filter="url(#ocRough)" />
  </svg>
)
const Fuji = () => (
  <svg viewBox="0 0 600 240" width="100%" aria-hidden="true">
    <path d="M0 240V170L70 120L120 150L200 90L260 140L330 110L420 170L500 130L600 180V240Z" fill="#B92D25" opacity=".07" />
    <path d="M110 240L270 46L300 32L330 46L490 240Z" fill="#B92D25" opacity=".13" />
    <path d="M238 80L270 46L300 32L330 46L362 80L340 72L322 88L300 70L280 88L260 72Z" fill="#FFF8ED" opacity=".85" />
    <ellipse cx="300" cy="236" rx="330" ry="26" fill="#F5EBDD" opacity=".75" />
  </svg>
)
// Solid ink Fuji for the poster header (sits in front of the red sun disc)
const FujiInk = () => (
  <svg viewBox="0 0 700 260" width="100%" aria-hidden="true">
    <path d="M0 260V176L80 128L140 160L230 98L300 150L380 118L470 176L560 134L700 190V260Z" fill="#29211D" opacity=".28" />
    <path d="M120 260L318 56L350 40L382 56L580 260Z" fill="#29211D" opacity=".9" />
    <path d="M284 100L318 56L350 40L382 56L416 100L392 90L372 108L350 86L328 108L308 90Z" fill="#FFF8ED" />
    <path d="M0 252C120 232 240 244 350 236C470 228 580 244 700 232V260H0Z" fill="#F5EBDD" />
    <ellipse cx="350" cy="258" rx="420" ry="22" fill="#F5EBDD" opacity=".9" />
  </svg>
)
const Torii = () => (
  <svg viewBox="0 0 200 230" width="100%" aria-hidden="true" fill="#B92D25" opacity=".24">
    <path d="M-4 22Q100 46 204 22L198 42Q100 64 2 42Z" />
    <rect x="24" y="70" width="152" height="13" />
    <rect x="40" y="44" width="17" height="186" />
    <rect x="143" y="44" width="17" height="186" />
  </svg>
)
const BLOSSOMS: [number, number, number][] = [
  [30, 30, 11], [72, 52, 9], [112, 78, 12], [150, 70, 8], [196, 94, 11], [240, 88, 9], [282, 100, 12],
  [330, 124, 10], [372, 150, 12], [96, 28, 8], [168, 40, 10], [226, 60, 8], [300, 76, 8], [348, 100, 9],
]
const Branch = () => (
  <svg viewBox="0 0 420 200" width="100%" aria-hidden="true">
    <path d="M0 22C80 42 120 80 200 90S330 90 420 152" stroke="#7B2A24" strokeWidth="5" strokeLinecap="round" fill="none" opacity=".4" />
    <path d="M110 70C130 40 160 26 200 24M240 90C262 70 290 64 330 60M300 96C318 118 340 128 372 136" stroke="#7B2A24" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".35" />
    {BLOSSOMS.map(([x, y, r], i) => (
      <g key={i} opacity=".6">
        <circle cx={x} cy={y} r={r} fill={i % 3 ? '#D8656C' : '#C94A55'} />
        <circle cx={x} cy={y} r={r * 0.32} fill="#FFF8ED" opacity=".85" />
      </g>
    ))}
  </svg>
)
const Cloud = () => (
  <svg viewBox="0 0 240 90" width="100%" aria-hidden="true" fill="none" stroke="#B92D25" strokeWidth="3" opacity=".22" strokeLinecap="round">
    <path d="M10 70C10 50 35 50 38 62C40 36 82 36 86 58C96 40 130 44 130 62C150 48 180 54 178 70" />
    <path d="M60 80C70 70 90 72 98 78M146 82C156 74 176 76 190 82" />
  </svg>
)

// One layout per department: real illustrations (multiplied into the paper) + the SVG motifs.
// layer 1 drifts one way on scroll, layer 2 the other, which gives the panels depth.
type DecoItem = { el: React.ReactNode; style: React.CSSProperties; layer: 1 | 2 }
const tilt = (deg: number, node: React.ReactNode) => <div style={{ rotate: `${deg}deg` }}>{node}</div>

const LAYOUTS: DecoItem[][] = [
  // 0 · OCP: pagoda, red-sun koi, branch
  [
    { el: <Sun />, style: { top: 36, left: '14%', width: 'min(240px,44vw)' }, layer: 1 },
    { el: <Art f={F.pagoda} className="faint" />, style: { bottom: 0, left: '1%', width: 'min(260px,44vw)' }, layer: 1 },
    { el: tilt(8, <Art f={F.koiSun} className="drop" />), style: { top: 40, right: '3%', width: 'min(200px,34vw)' }, layer: 2 },
    { el: <Branch />, style: { top: -6, left: 0, width: 'min(380px,66vw)' }, layer: 2 },
  ],
  // 1 · PD: fan, bonsai, cloud
  [
    { el: <Art f={F.bonsai} className="faint" />, style: { bottom: 0, left: '2%', width: 'min(230px,40vw)' }, layer: 1 },
    { el: tilt(14, <Art f={F.fan} className="drop" />), style: { top: 44, right: '3%', width: 'min(170px,30vw)' }, layer: 2 },
    { el: <Cloud />, style: { top: 64, left: '30%', width: 'min(230px,44vw)' }, layer: 2 },
    { el: <Torii />, style: { top: 110, left: '1%', width: 'min(100px,18vw)' }, layer: 1 },
  ],
  // 2 · MAK: dragon, kitsune mask, Fuji
  [
    { el: <Fuji />, style: { bottom: 0, right: 0, width: 'min(640px,100vw)' }, layer: 1 },
    { el: <Art f={F.dragon} className="faint" />, style: { top: '6%', right: '-3%', width: 'min(440px,84vw)' }, layer: 1 },
    { el: tilt(-8, <Art f={F.mask} className="drop" />), style: { top: 56, left: '3%', width: 'min(130px,24vw)' }, layer: 2 },
    { el: <Cloud />, style: { top: 64, right: '14%', width: 'min(220px,42vw)' }, layer: 2 },
  ],
  // 3 · FINANCE: koi, red tree, sun
  [
    { el: <Sun />, style: { top: '24%', right: '5%', width: 'min(220px,40vw)' }, layer: 1 },
    { el: <Art f={F.tree} className="soft" />, style: { bottom: 0, right: '1%', width: 'min(240px,42vw)' }, layer: 1 },
    { el: tilt(-14, <Art f={F.koi} className="drop" />), style: { top: 56, left: '3%', width: 'min(150px,28vw)' }, layer: 2 },
    { el: <div style={{ transform: 'scaleX(-1)' }}><Branch /></div>, style: { top: -6, right: 0, width: 'min(340px,64vw)' }, layer: 2 },
  ],
  // 4 · D&E: oni, red-sun koi, torii
  [
    { el: <Art f={F.oni} className="faint" />, style: { bottom: '3%', left: '1%', width: 'min(320px,58vw)' }, layer: 1 },
    { el: <Torii />, style: { top: 90, right: '3%', width: 'min(100px,18vw)' }, layer: 2 },
    { el: tilt(-6, <Art f={F.koiSun} className="drop" />), style: { top: 44, right: '16%', width: 'min(160px,30vw)' }, layer: 2 },
    { el: <Cloud />, style: { top: 56, left: '32%', width: 'min(210px,40vw)' }, layer: 2 },
  ],
  // 5 · LOGISTICS: samurai, Fuji, fan
  [
    { el: <Fuji />, style: { bottom: 0, left: 0, width: 'min(580px,100vw)' }, layer: 1 },
    { el: <Art f={F.samurai} className="soft" />, style: { bottom: 0, right: '2%', width: 'min(230px,42vw)' }, layer: 1 },
    { el: tilt(-12, <Art f={F.fan} className="drop" />), style: { top: 50, left: '4%', width: 'min(150px,28vw)' }, layer: 2 },
    { el: <Sun />, style: { top: '30%', right: '8%', width: 'min(200px,36vw)' }, layer: 1 },
  ],
]

// ============================================================================
// MEMBER TILE
// ============================================================================
const Tile = ({ m, i, lead, still, seal }: { m: Member; i: number; lead: boolean; still: boolean; seal: string }) => {
  const [failed, setFailed] = useState(false)
  const left = i % 2 === 0
  const words = m.name.split(' ')
  const last = words.length > 1 ? words[words.length - 1] : ''
  const first = words.length > 1 ? words.slice(0, -1).join(' ') : m.name

  const portrait = still
    ? {}
    : {
        initial: { opacity: 0, y: 36, scale: 1.04 },
        whileInView: { opacity: 1, y: 0, scale: 1 },
        viewport: { once: true, amount: 0.2 },
        transition: { duration: 0.9, ease: EASE },
      }
  const brush = still
    ? {}
    : {
        initial: { clipPath: left ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)' },
        whileInView: { clipPath: 'inset(0 0% 0 0%)' },
        viewport: { once: true, amount: 0.3 },
        transition: { duration: 0.9, delay: 0.25, ease: EASE },
      }
  const stamp = still
    ? {}
    : {
        initial: { opacity: 0, scale: 1.8 },
        whileInView: { opacity: 1, scale: 1 },
        viewport: { once: true, amount: 0.3 },
        transition: { duration: 0.45, delay: 0.85, ease: EASE },
      }

  return (
    <article className={`ocg-tile ${left ? 'L' : 'R'} ${lead ? 'lead' : ''}`}>
      <div className="ocg-wash" aria-hidden="true">
        <BrushH />
      </div>
      {!failed && (
        <motion.div className="ocg-pic" {...portrait}>
          <img src={DIR + m.file} alt={m.name} loading="lazy" decoding="async" draggable={false} onError={() => setFailed(true)} />
        </motion.div>
      )}
      {failed && <div className="ocg-pic" aria-hidden="true" />}
      <motion.span className="ocg-seal" aria-hidden="true" {...stamp}>
        {seal}
      </motion.span>
      <motion.div className="ocg-stroke" {...brush}>
        <div className="ocg-stroke-in">
          <BrushH />
          <h3>
            <span>{first}</span>
            {last && <span>{last}</span>}
          </h3>
          <p>{m.role}</p>
        </div>
      </motion.div>
    </article>
  )
}

// ============================================================================
// DEPARTMENT GROUP
// ============================================================================
const Group = ({ dept, index, still }: { dept: Dept; index: number; still: boolean }) => {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y1 = useTransform(scrollYProgress, [0, 1], still ? [0, 0] : [-34, 34])
  const y2 = useTransform(scrollYProgress, [0, 1], still ? [0, 0] : [26, -26])
  const clip = useMemo(() => tornPanel(index), [index])
  const layout = LAYOUTS[index % LAYOUTS.length]
  const panel = index % 2 === 0 ? '#EFE1CB' : '#FBF2E3'
  const lead = dept.members.length === 1
  const kanjiSide: React.CSSProperties = index % 2 === 0 ? { right: '2%' } : { left: '12%' }

  const vReveal = still
    ? {}
    : {
        initial: { clipPath: 'inset(0 0 100% 0)' },
        whileInView: { clipPath: 'inset(0 0 0% 0)' },
        viewport: { once: true, amount: 0.15 },
        transition: { duration: 1, ease: EASE },
      }

  return (
    <>
      {index > 0 && (
        <div className="ocg-div" aria-hidden="true">
          <i />
          <b />
          <i />
        </div>
      )}
      <section ref={ref} className="ocg-group" aria-label={dept.label} style={{ background: panel, clipPath: clip }}>
        <div className="ocg-paper" aria-hidden="true" />

        {/* giant faint department kanji */}
        <motion.div className="ocg-deco" aria-hidden="true" style={{ top: '8%', ...kanjiSide, y: y2 }}>
          <span className="ocg-kanji">{dept.kanji}</span>
        </motion.div>

        {layout.map((d, k) => (
          <motion.div key={k} className="ocg-deco" aria-hidden="true" style={{ ...d.style, y: d.layer === 1 ? y1 : y2 }}>
            {d.el}
          </motion.div>
        ))}
        {index % 3 !== 1 && <div className="ocg-waves" aria-hidden="true" />}

        <div className="ocg-inner">
          {/* mobile label */}
          <motion.div className="ocg-mlabel" {...(still ? {} : { initial: { clipPath: 'inset(0 100% 0 0)' }, whileInView: { clipPath: 'inset(0 0% 0 0)' }, viewport: { once: true }, transition: { duration: 0.8, ease: EASE } })}>
            <BrushH />
            <span style={{ position: 'relative' }}>{dept.label}</span>
            <small>{dept.kanji}</small>
          </motion.div>

          {/* desktop vertical label */}
          <div className="ocg-vlabel">
            <div className="ocg-vsticky">
              <motion.div className="ocg-vbar" {...vReveal}>
                <BrushV />
                <span className="kj" aria-hidden="true">{dept.kanji}</span>
                <h2>{dept.label}</h2>
                <span className="dia" aria-hidden="true" />
              </motion.div>
              <div className="ocg-vline" aria-hidden="true" />
            </div>
          </div>

          <div className="ocg-tiles">
            {dept.members.map((m, i) => (
              <Tile key={m.name} m={m} i={i} lead={lead} still={still} seal={dept.kanji.charAt(0)} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

// ============================================================================
// PAGE
// ============================================================================
export default function OcPosterPage() {
  const still = !!useReducedMotion()

  const discAnim = still
    ? {}
    : { initial: { opacity: 0, scale: 0.82 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 1.3, ease: EASE } }
  const rise = (delay: number) =>
    still
      ? {}
      : { initial: { opacity: 0, y: 22 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.9, delay, ease: EASE } }

  return (
    <div className="ocg-page relative flex min-h-screen flex-col overflow-x-hidden bg-[#F5EBDD] font-sans text-[#29211D] selection:bg-[#B92D25] selection:text-white">
      <style>{CSS}</style>
      <Defs />
      <Navbar />

      <div className="pointer-events-none fixed inset-0 z-10 opacity-60">
        <SakuraPetals enabled={true} />
      </div>

      <main className="relative z-20 flex-1">
        {/* ===== Hinomaru poster header ===== */}
        <section className="ocg-hero">
          <div className="ocg-hero-branch" aria-hidden="true">
            <Art src={HERO_BRANCH} />
          </div>

          <div className="ocg-poster">
            <div className="ocg-vtext L" aria-hidden="true">組織委員会</div>
            <div className="ocg-vtext R" aria-hidden="true">触媒 七</div>

            <motion.div className="ocg-disc" aria-hidden="true" {...discAnim} />

            <div className="ocg-ptext">
              <motion.div className="ocg-ptag" {...rise(0.35)}>
                <TagMark />
                <span>The OC · Catalyst 7.0</span>
              </motion.div>
              <motion.h1 {...rise(0.5)}>
                <span>Organizing</span>
                <span>Committee</span>
              </motion.h1>
              <motion.p className="ocg-psub" {...rise(0.7)}>組織委員会</motion.p>
            </div>

            <div className="ocg-fuji">
              <FujiInk />
            </div>

            <div className="ocg-pcorner" style={{ left: '2%', bottom: '5%', width: '19%' }} aria-hidden="true">
              <div style={{ rotate: '-10deg' }}>
                <Art f={F.koi} className="drop" />
              </div>
            </div>
            <div className="ocg-pcorner" style={{ right: '3%', bottom: '8%', width: '17%' }} aria-hidden="true">
              <div style={{ rotate: '12deg' }}>
                <Art f={F.fan} className="drop" />
              </div>
            </div>
          </div>

          <motion.div className="ocg-chips" {...rise(0.9)}>
            <span><b>{DEPTS.length}</b>Departments</span>
            <i aria-hidden="true" />
            <span><b>{TOTAL_MEMBERS}</b>Members</span>
          </motion.div>

          <p className="ocg-lede">The people forging the Catalyst 7.0 crucible, department by department.</p>
        </section>

        {DEPTS.map((d, i) => (
          <Group key={d.key} dept={d} index={i} still={still} />
        ))}

        {/* ===== Outro ===== */}
        <section className="ocg-outro">
          <div style={{ width: 70, margin: '0 auto 14px' }} aria-hidden="true">
            <Torii />
          </div>
          <p className="ocg-outro-kanji" aria-hidden="true">次は 執行部</p>
          <Link
            to="/about?team=eb"
            className="group inline-flex items-center gap-3 rounded-full border border-[#29211D]/80 px-7 py-3 text-xs font-bold uppercase tracking-[0.2em] text-[#29211D] transition-all duration-300 hover:bg-[#B92D25] hover:text-[#FFF8ED]"
            style={{ fontFamily: SANS }}
          >
            <span>Meet the Executive Board</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </section>
      </main>
    </div>
  )
}