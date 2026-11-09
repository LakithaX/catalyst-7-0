import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
  ScrollTrigger.config({ limitCallbacks: true, ignoreMobileResize: true })
}

// ============================================================================
// FULL OC ROSTER, rendered inside the About page (OC tab).
// Each department is a "poster": pink header + torn crimson rows, one per person.
// To add / edit a person change ONE line. Order = order on the page.
// Photos: public/assets/cat-oc-pics/ (transparent cut-outs, never altered)
//
// Motion (GSAP + ScrollTrigger), all switched off for prefers-reduced-motion:
//   header : title characters drop in like brush strokes, tagline widens in,
//            ornament line draws, kanji slides in, sakura petals drift down,
//            giant watermark drifts with scroll
//   rows   : the crimson paper slides in from the photo side, first name drifts
//            in and keeps drifting on scroll, portrait glides in + parallax,
//            name skews in, red hanko seal STAMPS down last
// ============================================================================
export type Person = { name: string; file: string; role?: string }
export type Dept = {
  key: string
  mark: string // big watermark + title, e.g. "OCVP"
  tag: string // line under the title
  role: string // shown under every name in this department
  kanji: string // vertical kanji in the header; first character is the hanko seal
  members: Person[]
}

const DIR = '/assets/cat-oc-pics/'
// a file starting with '/' is used as-is, so other rosters (EB) can point at their own folder
export const photo = (f: string) => (f.startsWith('/') ? f : DIR + f)

const DEPTS: Dept[] = [
  {
    key: 'ocp', mark: 'OCP', tag: 'ORGANIZING COMMITTEE PRESIDENT', role: 'Organizing Committee President', kanji: '会長',
    members: [{ name: 'Mahdy Hassan', file: 'mahdy-hassan-ocp.webp' }],
  },
  {
    key: 'fin', mark: 'OCVP', tag: 'FINANCE', role: 'OCVP Finance', kanji: '財務',
    members: [{ name: 'Monali Edirisinghe', file: 'monali-edirisinghe-ocvp-finance.webp' }],
  },
  {
    key: 'pd', mark: 'OCVP', tag: 'PARTNERSHIP DEVELOPMENT', role: 'OCVP Partnership Development', kanji: '成長',
    members: [
      { name: 'Nethuli Gunathilaka', file: 'nethuli-gunathilaka-ocvp-pd.webp' },
      { name: 'Chetha Atapattu', file: 'chetha-atapattu-ocvp-pd.webp' },
      { name: 'Vimarshi Suraweera', file: 'vimarshi-ocvp-pd.webp' },
      { name: 'Gihansa Hasithmi', file: 'gihansa-ocvp-pd.webp' },
      { name: 'Hari Branavan Arulnathan', file: 'hari-ocvp-pd.webp' },
    ],
  },
  {
    key: 'mkt', mark: 'OCVP', tag: 'MARKETING', role: 'OCVP Marketing', kanji: '広報',
    members: [
      { name: 'Harshitha Yasiru', file: 'harshitha-yasiru-ocvp-marketing.webp' },
      { name: 'Isuri Naveesha', file: 'isuri-walpola-ocvp-marketing.webp' },
      { name: 'Dahamsa Peiris', file: 'dahamsa-ocvp-marketing.webp' },
      { name: 'Kaveesha Miran', file: 'miran-ocvp-marketing.webp' },
    ],
  },
  {
    key: 'de', mark: 'OCVP', tag: 'DELEGATES & EVENTS', role: 'OCVP Delegates & Events', kanji: '祭典',
    members: [
      { name: 'Vindhi Akmeemana', file: 'vindhi-akmeemana-ocvp-delegates-and-events.webp' },
      { name: 'Binushi Wikramarathne', file: 'binushi-ocvp-delegates-and-events.webp' },
      { name: 'Tharuka Liyanage', file: 'tharuka-ocvp-delegates-and-events.webp' },
      { name: 'Isuri Muthumalee', file: 'isuri-muthumalee-ocvp-delegates-and-events.webp' },
    ],
  },
  {
    key: 'dl', mark: 'OCVP', tag: 'DELEGATES × LOGISTICS', role: 'OCVP Delegates × Logistics', kanji: '連携',
    members: [{ name: 'Adithya Munasinghe', file: 'adithya-ocvp-del-x-log.webp' }],
  },
  {
    key: 'log', mark: 'OCVP', tag: 'LOGISTICS', role: 'OCVP Logistics', kanji: '運営',
    members: [
      { name: 'Yehan De Silva', file: 'yehan-ocvp-logistics.webp' },
      { name: 'Maneesha Gunathilake', file: 'maneesha-ocvp-logistics.webp' },
      { name: 'Lakwan Wijegunawardana', file: 'lakwan-ocvp-logistics.webp' },
    ],
  },
]

// scrolling fast? play the SAME animation, just quicker, so nothing pops in
export const playFor = (tl: gsap.core.Timeline, self: ScrollTrigger) => {
  const v = Math.abs(self.getVelocity())
  tl.timeScale(v > 4000 ? 3.5 : v > 1800 ? 2.2 : 1).play()
}

// ONE debounced refresh after fonts load (every poster used to call ScrollTrigger.refresh() on its own = 9 full recalcs at once)
let refreshTimer = 0
export const refreshSoon = () => {
  if (typeof document === 'undefined') return
  document.fonts?.ready.then(() => {
    window.clearTimeout(refreshTimer)
    refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 200)
  })
}

// play an entrance exactly once. ScrollTrigger is configured with limitCallbacks, so when the visitor
// scrolls PAST a section in one jump (fast scroll, scrollbar drag, anchor, reload mid-page) only onLeave
// fires and onEnter never does. Without handling that, the section would stay invisible forever.
//   entering (from above or below) -> play normally (faster if scrolling fast)
//   skipped over                   -> jump straight to the finished state
export const revealOnce = (tl: gsap.core.Timeline, trigger: Element, start: string) => {
  let done = false
  const go = (self: ScrollTrigger, instant: boolean) => {
    if (done) return
    done = true
    if (instant) tl.progress(1).pause()
    else playFor(tl, self)
    self.kill()
  }
  return ScrollTrigger.create({
    trigger, start, end: 'bottom top',
    onEnter: (self) => go(self, false),
    onEnterBack: (self) => go(self, false),
    onLeave: (self) => go(self, true),
  })
}

// ============================================================================
// TORN EDGES (units are cqw, scaled by kn so the tear keeps its proportions)
// ============================================================================
const N = 110

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

const makeEdges = (count: number): Edge[] => {
  const E: Edge[] = []
  for (let e = 0; e <= count; e++) {
    const r = rnd(e * 97 + 13)
    E.push({ k: e % 2 ? 3 : -12.5, a: jag(r, e * 2), b: jag(r, e * 2 + 3) })
  }
  return E
}

const line = (ed: Edge, arr: number[], base: number, kn: number, s: number, rev?: boolean) => {
  const o: string[] = []
  for (let q = 0; q <= N; q++) {
    const x = q / N
    o.push(`${(x * 100).toFixed(2)}% ${(base + kn * ed.k * (x - 0.5) + s * arr[q]).toFixed(2)}cqw`)
  }
  return rev ? o.reverse() : o
}

const buildClips = (E: Edge[], count: number, kn: number) => {
  const R = 27 * kn
  const En = 8 * kn
  const H = 37 * kn
  const g = 1.15 * (0.5 + 0.5 * kn)
  const s = 0.5 + 0.5 * kn
  const head = `polygon(0% 0,100% 0,${line(E[0], E[0].a, H - g, kn, s, true).join(',')})`
  const rows = Array.from({ length: count }, (_, i) => {
    const pts = line(E[i], E[i].b, En + g, kn, s).concat(line(E[i + 1], E[i + 1].a, En + R - g, kn, s, true))
    return `polygon(${pts.join(',')})`
  })
  return { head, rows }
}

// ============================================================================
// STYLES
// ============================================================================
const WAVES = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='20' viewBox='0 0 40 20'%3E%3Cg fill='%23F4ECE0' stroke='%23A8102F' stroke-width='1.5'%3E%3Ccircle cx='0' cy='10' r='18'/%3E%3Ccircle cx='0' cy='10' r='12'/%3E%3Ccircle cx='0' cy='10' r='6'/%3E%3Ccircle cx='40' cy='10' r='18'/%3E%3Ccircle cx='40' cy='10' r='12'/%3E%3Ccircle cx='40' cy='10' r='6'/%3E%3Ccircle cx='20' cy='20' r='18'/%3E%3Ccircle cx='20' cy='20' r='12'/%3E%3Ccircle cx='20' cy='20' r='6'/%3E%3C/g%3E%3C/svg%3E")`

export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500&family=Noto+Serif+JP:wght@700&display=swap');

/* overflow-x:clip stops the slide-in animations from creating sideways scroll on phones */
.ocx-wrap{container-type:inline-size;width:100%;overflow-x:clip}

/* Layout model: every row has TWO photos competing for space - its own, and the NEXT row's head
   which pokes up into this row. So names live in the free band BETWEEN the two photos:
   --pw photo width, --bw = inset from each edge to the band, --sw seal width. */
.ocx-poster{--k:1cqw;--kn:1;--po:2cqw;--no:9cqw;--bo:-4cqw;--gl:22cqw;--gr:24cqw;--pw0:25cqw;--ph0:38;--pw:var(--pw0);--g:calc(1.5*var(--k));--sw:max(22px,calc(6*var(--k)));--bw:calc(var(--po) + var(--pw) + var(--g));--ink:#2a0310;--crimson:#a8102f;position:relative;font-family:'Oswald',system-ui,sans-serif}
.ocx-poster.ocx-ocp{--pw:calc(var(--pw0)*1.125)}
@container (min-width:600px){.ocx-poster{--k:.8cqw;--kn:.8;--po:5cqw;--no:11cqw;--bo:-2cqw;--gl:24cqw;--gr:26cqw;--pw0:24cqw;--ph0:46}}
@container (min-width:900px){.ocx-poster{--k:.65cqw;--kn:.65;--po:8cqw;--no:15cqw;--bo:4cqw;--gl:28cqw;--gr:30cqw;--pw0:calc(32*var(--k));--ph0:49}}
@container (min-width:1200px){.ocx-poster{--k:.55cqw;--kn:.55;--po:10cqw;--no:18cqw;--bo:7cqw;--gl:31cqw;--gr:33cqw}}
@container (min-width:1700px){.ocx-poster{--k:.45cqw;--kn:.45;--po:12cqw;--no:20cqw;--bo:9cqw;--gl:33cqw;--gr:35cqw}}

/* ---------- header ---------- */
.ocx-head{position:relative;height:calc(45*var(--k));margin-bottom:calc(-8*var(--k));text-align:center;overflow:hidden}
.ocx-hbg{position:absolute;inset:0;background:linear-gradient(#f6bcc8 0,#ea8497 calc(18*var(--k)),#cf4660 calc(37*var(--k)));-webkit-mask-image:linear-gradient(transparent 0,#000 calc(10*var(--k)));mask-image:linear-gradient(transparent 0,#000 calc(10*var(--k)))}
.ocx-wm,.ocx-ttl,.ocx-tag{font-family:'Jansina','Brusher',serif;font-weight:400;font-synthesis:none}
.ocx-wm,.ocx-ttl{position:absolute;left:0;right:0;margin:0;white-space:nowrap;line-height:1}
.ocx-wm{top:calc(3*var(--k));font-size:calc(30*var(--k));color:rgba(255,255,255,.22);transform:scaleY(1.15)}
.ocx-ttl{top:calc(9*var(--k));font-size:calc(14*var(--k));color:var(--ink);letter-spacing:.02em;text-shadow:0 0 calc(1.4*var(--k)) rgba(255,236,241,.6)}
.ocx-ch{display:inline-block}
.ocx-ttl .ocx-star{position:absolute;margin-left:calc(1*var(--k));font-size:calc(4*var(--k));top:calc(-1*var(--k));display:inline-block}
.ocx-tag{position:absolute;left:0;right:0;top:calc(25*var(--k));margin:0;white-space:nowrap;font-size:calc(4.3*var(--k));letter-spacing:.06em;color:var(--ink);text-shadow:0 0 calc(1.2*var(--k)) rgba(255,236,241,.65)}
.ocx-orn{position:absolute;left:50%;top:calc(32*var(--k));width:calc(30*var(--k));height:2px;margin-left:calc(-15*var(--k));background:linear-gradient(90deg,transparent,var(--ink) 25%,var(--ink) 75%,transparent)}
.ocx-orn::after{content:'';position:absolute;left:50%;top:50%;width:calc(1.6*var(--k));height:calc(1.6*var(--k));min-width:7px;min-height:7px;background:var(--crimson);border:1.5px solid var(--ink);transform:translate(-50%,-50%) rotate(45deg)}
.ocx-vk{position:absolute;right:calc(5*var(--k));top:calc(7*var(--k));display:flex;flex-direction:column;align-items:center;gap:calc(1.6*var(--k));font-family:'Noto Serif JP','Shippori Mincho',serif;font-weight:700;font-size:max(14px,calc(4.2*var(--k)));writing-mode:vertical-rl;letter-spacing:.2em;color:var(--ink);opacity:.72}
.ocx-vk::before{content:'';width:2px;height:calc(7*var(--k));background:var(--crimson)}
.ocx-petal{position:absolute;top:0;width:calc(1.7*var(--k));height:calc(1.2*var(--k));min-width:7px;min-height:5px;background:#fff6f8;border-radius:100% 0 100% 0;opacity:.9;pointer-events:none;box-shadow:0 0 6px rgba(255,255,255,.5)}

/* fewer petals on small screens */
@container (max-width:599px){.ocx-petal:nth-of-type(n+4){display:none}}

/* ---------- rows ---------- */
.ocx-row{position:relative;height:calc(27*var(--k))}
.ocx-bgw{position:absolute;inset:calc(-8*var(--k)) 0}
.ocx-bg{position:absolute;inset:0;background:radial-gradient(ellipse at 18% 0,rgba(255,255,255,.1),transparent 60%),linear-gradient(#a8102f,#6a0720);overflow:hidden}
.ocx-big{position:absolute;top:50%;transform:translateY(-50%);font-family:'Anton','Impact',sans-serif;font-weight:400;line-height:1;text-transform:uppercase;white-space:nowrap;color:rgba(255,255,255,.2)}
.ocx-ghost{position:absolute;bottom:calc(7*var(--k));width:calc(30*var(--k));height:calc(48*var(--k));object-fit:contain;object-position:center bottom;opacity:.28;filter:saturate(.4);-webkit-mask-image:linear-gradient(#000 55%,transparent);mask-image:linear-gradient(#000 55%,transparent)}
.ocx-pic{--ph:var(--ph0);--hr:5;position:absolute;width:var(--pw);height:calc((var(--ph) + var(--hr))*var(--k));-webkit-mask-image:linear-gradient(#000 calc(100% - var(--ph)*.34*var(--k)),transparent calc(100% - var(--ph)*.05*var(--k)));mask-image:linear-gradient(#000 calc(100% - var(--ph)*.34*var(--k)),transparent calc(100% - var(--ph)*.05*var(--k)))}
.ocx-ocp .ocx-pic{--ph:calc(var(--ph0)*1.122)}
.ocx-pic img{position:absolute;inset:calc((var(--hr) + 1)*var(--k)) calc(1*var(--k)) 0;width:calc(100% - 2*var(--k));height:calc(100% - (var(--hr) + 1)*var(--k));object-fit:contain;object-position:center bottom;transform-origin:50% 100%;transition:transform .55s cubic-bezier(.2,.8,.2,1);
  filter:drop-shadow(max(2px,calc(.45*var(--k))) 0 0 #fff) drop-shadow(min(-2px,calc(-.45*var(--k))) 0 0 #fff) drop-shadow(0 max(2px,calc(.45*var(--k))) 0 #fff) drop-shadow(0 min(-2px,calc(-.45*var(--k))) 0 #fff)}

/* hover zoom only where real hover exists (no sticky hover on touch) */
@media (hover:hover){.ocx-row:hover .ocx-pic img{transform:scale(1.045) translateY(-1.2%)}}

/* name + role: wrapped, kept inside the free band between the two photos */
.ocx-nm{position:absolute;top:calc(5.5*var(--k));margin:0;color:#fff;line-height:1.1;font-family:'Oswald',sans-serif;font-weight:500;
  font-size:max(11px,calc(3.5*var(--k)));letter-spacing:.06em;text-transform:uppercase;
  white-space:normal;text-wrap:balance;overflow-wrap:anywhere;
  transform:rotate(-2deg) skewX(-8deg);text-shadow:0 calc(.3*var(--k)) calc(.9*var(--k)) rgba(30,0,8,.6)}
.ocx-nm h3{margin:0;font:inherit;letter-spacing:inherit}
.ocx-nm p{margin:calc(1.1*var(--k)) 0 0;font-family:'Oswald',sans-serif;font-weight:500;font-size:max(10px,calc(2.4*var(--k)));line-height:1.15;letter-spacing:.12em;text-transform:uppercase;color:#ffd9e0;text-shadow:none}

.ocx-seal{position:absolute;top:calc(5.5*var(--k));width:var(--sw);aspect-ratio:1;display:flex;align-items:center;justify-content:center;background:#fff1e4;color:var(--crimson);font-family:'Noto Serif JP','Shippori Mincho',serif;font-weight:700;font-size:max(12px,calc(3.5*var(--k)));border-radius:calc(.5*var(--k));box-shadow:0 calc(.4*var(--k)) calc(1*var(--k)) rgba(30,0,8,.45),inset 0 0 0 2px rgba(168,16,47,.25);pointer-events:none}

/* --ob = inset on the side where the NEXT row's photo rises. The last row of a poster has no next photo, so it uses the full width */
.ocx-row{--ob:var(--bw)}
.ocx-row.last{--ob:calc(var(--po) + var(--g))}

.ocx-row.l .ocx-big{right:var(--bo)}.ocx-row.r .ocx-big{left:var(--bo)}
.ocx-row.l .ocx-ghost{right:var(--gl)}.ocx-row.r .ocx-ghost{left:var(--gr)}
.ocx-row.l .ocx-pic{left:var(--po);bottom:calc(1.5*var(--k))}.ocx-row.r .ocx-pic{right:var(--po);bottom:calc(4.5*var(--k))}

.ocx-row.l .ocx-nm{left:var(--bw);right:calc(var(--ob) + var(--sw) + var(--g));text-align:right}
.ocx-row.r .ocx-nm{right:var(--bw);left:calc(var(--ob) + var(--sw) + var(--g));text-align:left}
.ocx-row.l .ocx-seal{right:var(--ob);transform:rotate(-6deg)}
.ocx-row.r .ocx-seal{left:var(--ob);transform:rotate(6deg)}

/* ---------- seigaiha wave divider between posters ---------- */
.ocx-wave{height:20px;margin:calc(6*var(--k)) 0 calc(8*var(--k));background-image:${WAVES};background-size:40px 20px;background-repeat:repeat-x;background-position:center;-webkit-mask-image:linear-gradient(90deg,transparent,#000 18%,#000 82%,transparent);mask-image:linear-gradient(90deg,transparent,#000 18%,#000 82%,transparent)}
`

// ============================================================================
// ONE ROW
// ============================================================================
const Row = ({
  person, index, clip, role, seal, isLast,
}: { person: Person; index: number; clip: string; role: string; seal: string; isLast: boolean }) => {
  const [failed, setFailed] = useState(false)
  const side = index % 2 ? 'r' : 'l'
  const first = person.name.split(' ')[0]
  const fs = Math.min(31, 189 / first.length)
  const src = photo(person.file)

  return (
    <section className={`ocx-row ${side}${isLast ? ' last' : ''}`} data-side={side}>
      <div className="ocx-bgw" aria-hidden="true">
        <div className="ocx-bg" style={{ clipPath: clip }}>
          <span className="ocx-big" style={{ fontSize: `calc(${fs.toFixed(1)} * var(--k))` }}>
            {first}
          </span>
          {!failed && <img className="ocx-ghost" src={src} alt="" loading="lazy" decoding="async" />}
        </div>
      </div>

      {!failed && (
        <div className="ocx-pic">
          <img
            src={src}
            alt={person.name}
            loading={index === 0 ? 'eager' : 'lazy'}
            decoding="async"
            draggable={false}
            onError={() => setFailed(true)}
          />
        </div>
      )}

      <div className="ocx-nm">
        <h3>{person.name}</h3>
        <p>{person.role ?? role}</p>
      </div>

      <div className="ocx-seal" aria-hidden="true">{seal}</div>
    </section>
  )
}

// ============================================================================
// ONE DEPARTMENT POSTER
// ============================================================================

export const Poster = ({ dept, last }: { dept: Dept; last: boolean }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [kn, setKn] = useState(1)
  const count = dept.members.length

  // the poster shrinks its --kn at wider widths; read it so the tear scales with it
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const read = () => {
      const v = parseFloat(getComputedStyle(el).getPropertyValue('--kn'))
      if (v) setKn(v)
    }
    read()
    const ro = new ResizeObserver(read)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const edges = useMemo(() => makeEdges(count), [count])
  const clips = useMemo(() => buildClips(edges, count, kn), [edges, count, kn])

  // tagline shrinks for long text so it stays clear of the first photo that rises into the header
  const tagFont = `max(10px, min(calc(4.3 * var(--k)), calc((100cqw - 2 * (var(--po) + var(--pw) + 2 * var(--k))) / ${(dept.tag.length * 0.46).toFixed(2)})))`

  // ---------------------------------------------------------------- GSAP
  useLayoutEffect(() => {
    const root = ref.current
    if (!root) return

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const q = gsap.utils.selector(root)
        const head = q('.ocx-head')[0]

        // ----- header intro
        const intro = gsap.timeline({ paused: true })
        intro
          .from(q('.ocx-ch'), {
            yPercent: -140, rotation: () => gsap.utils.random(-28, 28), opacity: 0,
            duration: 0.9, stagger: 0.08, ease: 'back.out(1.9)',
          })
          .fromTo(q('.ocx-star'), { scale: 0, rotation: -200 }, { scale: 1, rotation: 0, duration: 0.8, ease: 'back.out(2.4)' }, '-=0.5')
          .fromTo(q('.ocx-tag'), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6')
          .fromTo(q('.ocx-orn'), { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: 'power3.inOut' }, '-=0.7')
          .fromTo(q('.ocx-vk'), { opacity: 0, y: -30 }, { opacity: 0.72, y: 0, duration: 0.9, ease: 'power3.out' }, '-=0.8')

        revealOnce(intro, head, 'top 100%')

        // ----- rows
        q('.ocx-row').forEach((row) => {
          const side = (row as HTMLElement).dataset.side === 'r' ? 'r' : 'l'
          const sgn = side === 'l' ? -1 : 1
          const bg = row.querySelector('.ocx-bg')
          const big = row.querySelector('.ocx-big')
          const ghost = row.querySelector('.ocx-ghost')
          const pic = row.querySelector('.ocx-pic')
          const nm = row.querySelector('.ocx-nm')
          const seal = row.querySelector('.ocx-seal')

          const tl = gsap.timeline({ paused: true })
          tl.fromTo(bg, { scaleX: 0, transformOrigin: side === 'l' ? '0% 50%' : '100% 50%' }, { scaleX: 1, duration: 1.05, ease: 'power4.inOut' })
          if (big) tl.fromTo(big, { opacity: 0, xPercent: -sgn * 30 }, { opacity: 1, xPercent: 0, duration: 1.2, ease: 'power3.out' }, '-=0.55')
          if (ghost) tl.fromTo(ghost, { opacity: 0, scale: 0.9 }, { opacity: 0.28, scale: 1, duration: 1, ease: 'power2.out', transformOrigin: '50% 100%' }, '-=1')
          if (pic) tl.fromTo(pic, { opacity: 0, x: sgn * 90, scale: 0.92 }, { opacity: 1, x: 0, scale: 1, duration: 1.1, ease: 'expo.out', transformOrigin: '50% 100%' }, '-=0.95')
          if (nm) tl.fromTo(nm, { opacity: 0, y: 22, rotation: -2, skewX: -26 }, { opacity: 1, y: 0, rotation: -2, skewX: -8, duration: 0.8, ease: 'power3.out' }, '-=0.7')
          if (seal) {
            tl.fromTo(
              seal,
              { opacity: 0, scale: 2.6, rotation: sgn * 20 },
              { opacity: 1, scale: 1, rotation: sgn * 6, duration: 0.45, ease: 'back.out(2.4)' },
              '-=0.2',
            )
          }

          revealOnce(tl, row, 'top 112%')
        })

        // ----- wave divider fades in
        const wave = q('.ocx-wave')[0]
        if (wave) revealOnce(gsap.timeline({ paused: true }).from(wave, { opacity: 0, scaleX: 0.6, duration: 1.2, ease: 'power3.out' }), wave, 'top 105%')
      })
    }, root)

    // fonts (Jansina / Anton) change nothing in layout heights, but refresh to be safe
    refreshSoon()

    return () => ctx.revert()
  }, [dept.key])

  return (
    <div
      className={`ocx-poster${dept.key === 'ocp' ? ' ocx-ocp' : ''}`}
      ref={ref}
      role="group"
      aria-label={`${dept.mark} ${dept.tag}`}
    >
      <header className="ocx-head" style={{ clipPath: clips.head }}>
        <div className="ocx-hbg" aria-hidden="true" />
        <p className="ocx-wm" aria-hidden="true">{dept.mark}</p>
        <h2 className="ocx-ttl" aria-label={dept.mark}>
          {dept.mark.split('').map((c, i) => (
            <span className="ocx-ch" key={i} aria-hidden="true">{c}</span>
          ))}
          <span className="ocx-star" aria-hidden="true">&#10043;</span>
        </h2>
        <p className="ocx-tag" style={{ fontSize: tagFont }}>{dept.tag}</p>
        <div className="ocx-orn" aria-hidden="true" />
        <div className="ocx-vk" aria-hidden="true">{dept.kanji}</div>
      </header>

      <div>
        {dept.members.map((m, i) => (
          <Row key={m.name} person={m} index={i} clip={clips.rows[i]} role={dept.role} seal={dept.kanji.charAt(0)} isLast={i === count - 1} />
        ))}
      </div>

      {!last && <div className="ocx-wave" aria-hidden="true" />}
    </div>
  )
}

// ============================================================================
// FINALE: "OC ELITES" group photo
// Everyone stands in three tiers (back / middle / front) in front of a rising sun,
// a torii gate and seigaiha waves. Scroll in = sun rises, brush letters drop in,
// hanko stamps, the team walks into frame row by row, the camera flashes.
// Photos come from DEPTS above, so a new person only has to be added once.
// Order = hierarchy from DEPTS (see HIERARCHY below). To move someone, reorder them in DEPTS.
// Upper-body crop: tweak --crop per row in GCSS (lower = tighter, higher = more torso).
// ============================================================================
const PEOPLE = new Map(DEPTS.flatMap((d) => d.members).map((m) => [m.name, m] as const))

// HIERARCHY: the order comes straight from DEPTS at the top of this file, so reorder people there and
// the group photo follows. President = big centre card. Everyone else reads left to right, top to bottom:
//   top row    : OCVP Finance, then Partnership Development ...
//   middle row : ... Marketing, Delegates & Events ...
//   bottom row : ... Delegates x Logistics, Logistics (last)
// (each of the two upper rows is split around the president, left half first, then right half)
const ORDER = DEPTS.flatMap((d) => d.members.map((m) => m.name))
const PRESIDENT = ORDER[0]
const REST = ORDER.slice(1)
const FRONT_REST = REST.slice(12)
const FRONT_HALF = Math.floor(FRONT_REST.length / 2)

const GROUP: { x0: number; x1: number; names: string[] }[] = [
  { x0: 11, x1: 89, names: REST.slice(0, 6) },   // top row
  { x0: 12, x1: 88, names: REST.slice(6, 12) },  // middle row
  { // bottom row: the president stands in the centre of it (he is drawn as the big card)
    x0: 13, x1: 87,
    names: [...FRONT_REST.slice(0, FRONT_HALF), PRESIDENT, ...FRONT_REST.slice(FRONT_HALF)],
  },
]

export type GroupDef = { x0: number; x1: number; names: string[] }[]

export const buildGroupRows = (group: GroupDef, people: Map<string, Person>) =>
  group.map((row) => {
    const n = row.names.length
    return row.names
      .map((name, i) => {
        const person = people.get(name)
        if (!person) return null
        const x = n === 1 ? 50 : row.x0 + (i * (row.x1 - row.x0)) / (n - 1)
        return {
          name,
          file: person.file,
          x: Number(x.toFixed(2)),
          dy: i % 2 ? 0.9 : -0.7, // tiny height variation so it feels like real people
          ws: name === 'Mahdy Hassan' ? 1.12 : 1,
          z: 100 - Math.round(Math.abs(x - 50)), // centre people overlap the edge people
        }
      })
      .filter(Boolean) as { name: string; file: string; x: number; dy: number; ws: number; z: number }[]
  })

const OC_ROWS = buildGroupRows(GROUP, PEOPLE)

// torn top edge of the finale panel
const TOP_CLIP = (() => {
  const a = jag(rnd(4242), 1)
  const pts: string[] = []
  for (let q = 0; q <= N; q++) pts.push(`${((q / N) * 100).toFixed(2)}% calc(${(1.6 + 1.1 * a[q]).toFixed(2)}*var(--u))`)
  return `polygon(${pts.join(',')},100% 100%,0 100%)`
})()

export const GCSS = `
.ocg{--uw:1cqw;--u:var(--uw);--ink:#252321;--paper:#FAF6EE;--red:#B51E23;--deep:#8F171B;position:relative;overflow:hidden;margin-top:calc(6*var(--u));padding-top:calc(4*var(--u));
  background:linear-gradient(#e4d2b8 0,#efe3d0 calc(9*var(--u)),rgba(250,246,238,0) calc(32*var(--u))),radial-gradient(ellipse at 50% 46%,#fffdf8 0,#FAF6EE 52%,#F1E8DA 100%);
  font-family:'Oswald',system-ui,sans-serif;clip-path:${TOP_CLIP}}
@container (min-width:700px){.ocg{--uw:.9cqw}}
@container (min-width:1100px){.ocg{--uw:.8cqw}}
@container (min-width:1600px){.ocg{--uw:.65cqw}}
/* FIT: the stage is 133u tall, so cap u by the viewport height too. The whole group then fits on one
   screen on any laptop / monitor / ultrawide. The 6px floor keeps faces + names readable on short windows.
   (phones < 600px use the flowing layout, so they are left alone) */
@container (min-width:600px){.ocg{--u:min(var(--uw),max(.75svh,6px))}}

.ocg-stage{position:relative;width:calc(100*var(--u));max-width:100%;height:auto;padding-bottom:calc(14*var(--u));margin:0 auto}
@container (min-width:600px){.ocg-stage{height:calc(133*var(--u));padding-bottom:0}}

/* ---------- backdrop: rays, sun, torii, clouds ---------- */
.ocg-rays{position:absolute;left:50%;bottom:calc(-39*var(--u));width:calc(220*var(--u));height:calc(220*var(--u));margin-left:calc(-110*var(--u));border-radius:50%;
  background:repeating-conic-gradient(rgba(201,54,43,.11) 0 5deg,transparent 5deg 10deg);
  -webkit-mask-image:radial-gradient(circle,#000 22%,transparent 68%);mask-image:radial-gradient(circle,#000 22%,transparent 68%);z-index:0;pointer-events:none}
.ocg-sun{position:absolute;left:50%;bottom:calc(43*var(--u));width:calc(56*var(--u));aspect-ratio:1;margin-left:calc(-28*var(--u));border-radius:50%;
  background:radial-gradient(circle at 40% 34%,#e6483a,#c9362b 55%,#a8102f);box-shadow:0 0 calc(9*var(--u)) calc(2*var(--u)) rgba(201,54,43,.28);z-index:0}
.ocg-torii{position:absolute;left:50%;bottom:calc(14*var(--u));width:calc(82*var(--u));height:auto;margin-left:calc(-41*var(--u));opacity:.5;z-index:0;pointer-events:none}
.ocg-torii g{fill:#7a1015}
.ocg-kas{position:absolute;height:calc(5*var(--u));border-radius:50%;background:radial-gradient(ellipse,rgba(37,35,33,.1),transparent 70%);z-index:0;pointer-events:none}

/* ---------- giant brush title (sits BEHIND the people) ---------- */
.ocg-ttl{position:absolute;left:0;right:0;top:calc(2*var(--u));margin:0;text-align:center;white-space:nowrap;line-height:.95;z-index:1;
  font-family:'Jansina','Brusher','Anton','Impact',sans-serif;font-weight:400;font-synthesis:none;font-size:calc(30*var(--u)*var(--fit,1));letter-spacing:.02em;color:#1d1a18;
  -webkit-text-stroke:max(3px,calc(1.1*var(--u))) var(--paper);paint-order:stroke fill;
  text-shadow:calc(.8*var(--u)) calc(.9*var(--u)) 0 rgba(181,30,35,.9)}
.ocg-ttl-in{display:inline-block}
.ocg-w{display:inline-block;white-space:nowrap}
.ocg-w + .ocg-w{margin-left:.28em}
.ocg-ch{display:inline-block}

/* ---------- the people (upper body only) ---------- */
/* --crop = box height as a multiple of its width. Lower = tighter (head+shoulders), higher = more chest/waist */
.ocg-row{position:absolute;inset:0;pointer-events:none}
.ocg-row.r0{z-index:2;--w:calc(17*var(--u));--rb:calc(40*var(--u));--crop:.95}
.ocg-row.r1{z-index:3;--w:calc(21*var(--u));--rb:calc(24*var(--u));--crop:1}
.ocg-row.r2{z-index:4;--w:calc(26*var(--u));--rb:calc(6*var(--u));--crop:1.1}
.ocg-p{position:absolute;margin:0;margin-left:calc(var(--w)*var(--ws,1)*-.5);left:calc(var(--x)*1%);
  width:calc(var(--w)*var(--ws,1));height:calc(var(--w)*var(--ws,1)*var(--crop));
  bottom:calc(var(--rb) + var(--dy,0)*var(--u));
  box-sizing:border-box;padding:calc(1*var(--u)) calc(1*var(--u)) 0;overflow:hidden}
.ocg-p img{display:block;width:100%;height:auto;
  filter:drop-shadow(max(1.5px,calc(.35*var(--u))) 0 0 #fff) drop-shadow(min(-1.5px,calc(-.35*var(--u))) 0 0 #fff) drop-shadow(0 max(1.5px,calc(.35*var(--u))) 0 #fff) drop-shadow(0 min(-1.5px,calc(-.35*var(--u))) 0 #fff) drop-shadow(0 calc(.5*var(--u)) calc(.9*var(--u)) rgba(37,35,33,.3))}
/* fade the cut edge on the back two rows (front row's cut is hidden by the ground) */
.ocg-row.r0 .ocg-p,.ocg-row.r1 .ocg-p{-webkit-mask-image:linear-gradient(#000 68%,transparent 100%);mask-image:linear-gradient(#000 68%,transparent 100%)}

/* ---------- ground: seigaiha waves + caption ---------- */
.ocg-ground{position:absolute;left:0;right:0;bottom:0;height:calc(12*var(--u));z-index:5;box-sizing:border-box;background:linear-gradient(#f4ece0,#ead9c0);border-top:max(3px,calc(.6*var(--u))) solid var(--red);border-bottom:max(3px,calc(.6*var(--u))) solid var(--red);pointer-events:none}
.ocg-ground::after{content:'';position:absolute;inset:0;background-image:${WAVES};background-size:40px 20px;background-position:center top;opacity:.85;
  -webkit-mask-image:linear-gradient(transparent,#000 55%);mask-image:linear-gradient(transparent,#000 55%)}
.ocg-cap{position:absolute;left:0;right:0;bottom:calc(3.2*var(--u));text-align:center;z-index:6;pointer-events:none}
.ocg-cap span{display:inline-block;padding:.55em 1.5em;background:var(--red);border:1px solid rgba(250,246,238,.7);box-shadow:0 calc(.5*var(--u)) calc(1.2*var(--u)) rgba(37,35,33,.3);color:#fff1e4;font-weight:500;font-size:max(10px,calc(2.1*var(--u)));letter-spacing:.28em;text-transform:uppercase;white-space:nowrap}

/* ---------- japanese details ---------- */
.ocg-kj{position:absolute;top:calc(6*var(--u));z-index:3;display:flex;flex-direction:column;align-items:center;gap:calc(1.6*var(--u));writing-mode:vertical-rl;font-family:'Noto Serif JP','Shippori Mincho',serif;font-weight:700;font-size:max(14px,calc(4.4*var(--u)));letter-spacing:.25em;color:var(--ink);opacity:.82;pointer-events:none}
.ocg-kj::before{content:'';width:2px;height:calc(7*var(--u));background:var(--red)}
.ocg-kj.a{left:calc(2.5*var(--u))}.ocg-kj.b{right:calc(2.5*var(--u))}
.ocg-seal{position:absolute;right:calc(5*var(--u));top:calc(17*var(--u));z-index:6;width:max(34px,calc(11*var(--u)));aspect-ratio:1;display:flex;align-items:center;justify-content:center;writing-mode:vertical-rl;background:var(--red);color:#fff1e4;font-family:'Noto Serif JP','Shippori Mincho',serif;font-weight:700;font-size:max(15px,calc(4.6*var(--u)));letter-spacing:.05em;border-radius:calc(.8*var(--u));box-shadow:0 calc(.5*var(--u)) calc(1.4*var(--u)) rgba(37,35,33,.4),inset 0 0 0 3px rgba(255,255,255,.25);transform:rotate(-8deg);pointer-events:none}
.ocg-vf{position:absolute;z-index:6;width:max(16px,calc(5*var(--u)));height:max(16px,calc(5*var(--u)));border:0 solid var(--ink);opacity:.4;pointer-events:none}
.ocg-vf.tl{top:calc(2*var(--u));left:calc(2*var(--u));border-top-width:2px;border-left-width:2px}
.ocg-vf.tr{top:calc(2*var(--u));right:calc(2*var(--u));border-top-width:2px;border-right-width:2px}
.ocg-vf.bl{bottom:calc(14*var(--u));left:calc(2*var(--u));border-bottom-width:2px;border-left-width:2px}
.ocg-vf.br{bottom:calc(14*var(--u));right:calc(2*var(--u));border-bottom-width:2px;border-right-width:2px}
.ocg-rec{position:absolute;z-index:6;top:calc(2.6*var(--u));left:calc(9*var(--u));color:var(--ink);font-weight:700;font-size:max(9px,calc(1.9*var(--u)));letter-spacing:.2em;opacity:.75;pointer-events:none}
.ocg-petal{position:absolute;top:0;z-index:7;width:max(7px,calc(1.7*var(--u)));height:max(5px,calc(1.2*var(--u)));background:linear-gradient(135deg,#ffd0d9,#f08aa0);border-radius:100% 0 100% 0;opacity:.9;pointer-events:none}
@container (max-width:699px){.ocg-petal:nth-of-type(n+6){display:none}}
.ocg-flash{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none;z-index:9}

/* phones: sun + rays sit behind the big head card instead of the bottom */
@container (max-width:599px){
  .ocg-sun{bottom:auto;top:calc(55*var(--u))}
  .ocg-rays{bottom:auto;top:calc(-27*var(--u))}
}

/* ---------- the formation: everyone together, V of slanted frames ---------- */
/* phones: head card on top, everyone else wraps below, pentagon frames, names on plates */
.og-fm{position:relative;z-index:3;display:flex;flex-wrap:wrap;justify-content:center;gap:calc(3*var(--u)) calc(2*var(--u));padding:calc(32*var(--u)) calc(2*var(--u)) 0}
.og-c{--w:calc(27*var(--u));--h:calc(46*var(--u));--clip:polygon(0 0,50% 7%,100% 0,100% 93%,50% 100%,0 93%);
  position:relative;flex:none;margin:0;width:var(--w);display:flex;flex-direction:column;align-items:center}
.og-c.lead{--w:calc(56*var(--u));--h:calc(84*var(--u));margin:0 calc(22*var(--u))}

/* >= 600: absolute V. --x / --y come from the layout maths in the component (units of u) */
@container (min-width:600px){
  .og-fm{position:absolute;inset:0;display:block;padding:0}
  .og-c{position:absolute;left:calc(var(--x)*var(--u));top:calc(var(--y)*var(--u));--w:calc(11*var(--u));--h:calc(19.5*var(--u));margin:0}
  .og-c.lead{--w:calc(24*var(--u));--h:calc(42*var(--u));margin:0}
  .og-c.sl{--clip:polygon(0 0,100% 10%,100% 100%,0 90%)}
  .og-c.sr{--clip:polygon(0 10%,100% 0,100% 90%,0 100%)}
  .og-c.sc{--clip:polygon(0 0,50% 9%,100% 0,100% 91%,50% 100%,0 91%)}
}
.og-c.lead{--clip:polygon(0 0,100% 0,100% 84%,50% 100%,0 84%)}

.og-fw{position:relative;flex:none;width:var(--w);height:var(--h);transition:translate .4s cubic-bezier(.2,.8,.2,1);
  filter:drop-shadow(max(1.5px,calc(.28*var(--u))) 0 0 var(--ink)) drop-shadow(min(-1.5px,calc(-.28*var(--u))) 0 0 var(--ink)) drop-shadow(0 max(1.5px,calc(.28*var(--u))) 0 var(--ink)) drop-shadow(0 min(-1.5px,calc(-.28*var(--u))) 0 var(--ink)) drop-shadow(0 calc(1*var(--u)) calc(1.4*var(--u)) rgba(37,35,33,.28))}
.og-fr{position:absolute;inset:0;background:#d6b25e;clip-path:var(--clip)}
.og-in{position:absolute;inset:max(1.5px,calc(.4*var(--u)));overflow:hidden;clip-path:var(--clip);
  background:radial-gradient(ellipse at 50% 36%,rgba(255,150,120,.5),transparent 62%),linear-gradient(#cf2b2b,#9b1519 68%,#7a0e12)}
@media (hover:hover){.og-c:hover .og-fw{translate:0 calc(-.8*var(--u))}}
/* photo box fills the frame (small gap at the top for the slanted edge). cover + top = the head always sits at the top of the frame, shoulders fill the rest */
.og-ph{position:absolute;left:0;right:0;bottom:0;top:9%;display:flex;align-items:flex-start;justify-content:center}
.og-img{display:block;width:100%;height:100%;max-width:none;object-fit:cover;object-position:50% 0;
  filter:drop-shadow(max(1.5px,calc(.3*var(--u))) 0 0 #fff) drop-shadow(min(-1.5px,calc(-.3*var(--u))) 0 0 #fff) drop-shadow(0 max(1.5px,calc(.3*var(--u))) 0 #fff) drop-shadow(0 calc(.5*var(--u)) calc(.9*var(--u)) rgba(37,35,33,.3))}

/* paper name plate under every frame; first name crimson */
.og-plate{position:relative;z-index:2;margin-top:calc(-.9*var(--u));max-width:calc(var(--w) + 1.2*var(--u));box-sizing:border-box;padding:.28em .6em .22em;text-align:center;text-wrap:balance;overflow-wrap:break-word;
  background:var(--paper);border:max(1px,calc(.22*var(--u))) solid var(--ink);box-shadow:calc(.4*var(--u)) calc(.4*var(--u)) 0 var(--red);
  font-family:'Jansina','Brusher','Anton','Impact',sans-serif;font-synthesis:none;font-weight:400;font-size:max(10px,calc(var(--w)*.1));line-height:1.05;letter-spacing:.03em;text-transform:uppercase;color:var(--ink)}
.og-plate b{color:var(--red);font-weight:400}
@container (min-width:600px){.og-plate{font-size:max(8px,calc(1.3*var(--u)));max-width:calc(var(--w) + 2.4*var(--u))}.og-c.lead .og-plate{font-size:max(11px,calc(2.7*var(--u)));max-width:calc(var(--w)*1.15)}}
.og-c.lead .og-plate{font-size:max(12px,calc(var(--w)*.12))}

/* banner above the head of the committee */
.og-ban{position:relative;z-index:2;width:var(--w);box-sizing:border-box;margin-bottom:calc(.9*var(--u));padding:.55em .6em;text-align:center;text-wrap:balance;
  background:linear-gradient(#c9262b,var(--deep));color:#fff1e4;font-weight:500;font-size:max(9.5px,calc(var(--w)*.058));letter-spacing:.16em;text-transform:uppercase;line-height:1.2;
  box-shadow:inset 0 0 0 max(1.5px,calc(.25*var(--u))) #d6b25e,0 0 0 max(1.5px,calc(.28*var(--u))) var(--ink),0 calc(.7*var(--u)) calc(1.2*var(--u)) rgba(37,35,33,.3)}
`

const FINALE_PETALS = Array.from({ length: 10 }, (_, i) => ({
  left: 3 + ((i * 53) % 94),
  scale: 0.7 + ((i * 41) % 60) / 100,
}))


// ============================================================================
// FORMATION (the finale): everyone together, like a team poster.
//   leader        = the middle person of the LAST row, big, in the centre with a banner
//   rows 0 .. n-2 = the two "wings": each row is split left / right of the leader, and every
//                   wing row steps down toward the leader so the tops form a V
//   last row      = the bottom V under the leader (everyone except the leader)
// So with GROUP above: back row + middle row become the wings, the front row is the bottom V,
// and whoever stands in the centre of the front row (the president) is the head.
// Units are "u" (the stage is 100u wide).
// ============================================================================
type GSlot = { name: string; file: string; x: number; y: number; side: 'l' | 'r' | 'c'; tier: number; lead?: boolean }

const FM = { FW: 11, FH: 19.5, GAP: 1.2, Y0: 30, TD: 26, YB: 92, LEAD_X: 38 }

const layoutFormation = (rows: ReturnType<typeof buildGroupRows>): GSlot[] => {
  if (!rows.length) return []
  const out: GSlot[] = []
  const step = FM.FW + FM.GAP
  const drop = FM.FH * 0.1 // each frame steps down 10% of its height toward the centre
  const front = rows[rows.length - 1]
  const mid = Math.floor((front.length - 1) / 2)
  const lead = front[mid]
  if (lead) out.push({ name: lead.name, file: lead.file, x: FM.LEAD_X, y: FM.Y0, side: 'c', tier: -1, lead: true })

  // wings
  rows.slice(0, -1).forEach((row, t) => {
    const nl = Math.ceil(row.length / 2)
    const nr = row.length - nl
    row.forEach((p, i) => {
      const left = i < nl
      const c = left ? i : i - nl
      const x = left ? FM.LEAD_X - 1 - FM.FW - (nl - 1 - c) * step : 100 - FM.LEAD_X + 1 + c * step
      const d = left ? c : nr - 1 - c
      out.push({ name: p.name, file: p.file, x, y: FM.Y0 + 1 + t * FM.TD + d * drop, side: left ? 'l' : 'r', tier: t })
    })
  })

  // bottom V (centre lowest)
  const bottom = front.filter((_, i) => i !== mid)
  const m = bottom.length
  const x0 = (100 - (m * FM.FW + (m - 1) * FM.GAP)) / 2
  const h = (m - 1) / 2
  bottom.forEach((p, i) => {
    out.push({
      name: p.name, file: p.file, x: x0 + i * step, y: FM.YB + Math.min(i, m - 1 - i) * drop,
      side: i === h ? 'c' : i < h ? 'l' : 'r', tier: rows.length - 1,
    })
  })
  return out
}

// ----------------------------------------------------------------------------
// FACE FIXES: per-person crop. Every photo is a different shape, so one crop can't suit all.
//   keep : how much of the person to show, from the top of the head down.
//          1 = the whole photo (close-up headshots)   .3 = tight head + shoulders (full-body photos)
//          LOWER = closer on the face / bigger head,  HIGHER = more body / smaller head.  Default .52
//   pos  : optional CSS object-position. First number = sideways: LOWER moves the person to the RIGHT in the frame,
//          HIGHER moves them LEFT ('50% 0' is the default centre).
//   top  : optional gap above the photo inside the frame, e.g. '14%' (default 9%). Raise it if the hair is clipped by the slanted frame edge.
// To fix someone: add / edit one line here, save, refresh.
// ----------------------------------------------------------------------------
const FACE: Record<string, { keep?: number; pos?: string; top?: string }> = {
  'Mahdy Hassan': { keep: 0.78, top: '12%' },                  // president: hair was clipped, chin hidden
  'Hari Branavan Arulnathan': { keep: 0.8, top: '11%' },       // was zoomed in too far
  'Nethuli Gunathilaka': { keep: 0.72, pos: '15% 0' },         // face was pushed off the left side
  'Gihansa Hasithmi': { keep: 1, pos: '25% 0' },               // close-up photo: show the whole face
  'Yehan De Silva': { keep: 0.36, pos: '12% 0', top: '14%' },  // head was clipped by the slanted frame top
  'Monali Edirisinghe': { keep: 0.78 },
  'Binushi Wikramarathne': { keep: 0.42 },
}

const GroupCard = ({ s, label }: { s: GSlot; label: string }) => {
  const [failed, setFailed] = useState(false)
  // trims transparent padding and keeps the upper body so every head ends up the same size
  const face = FACE[s.name]
  const [figRef, near] = useNear()
  const url = useCutout(photo(s.file), face?.keep ?? 0.52, near)
  const [first, ...rest] = s.name.split(' ')
  return (
    <figure
      ref={figRef}
      className={`og-c s${s.side}${s.lead ? ' lead og-lead' : ` og-t${s.tier}`}`}
      style={{ '--x': s.x.toFixed(2), '--y': s.y.toFixed(2) } as React.CSSProperties}
    >
      {s.lead && <div className="og-ban">{label}</div>}
      <div className="og-fw">
        <div className="og-fr" aria-hidden="true" />
        <div className="og-in">
          <div className="og-ph" style={face?.top ? { top: face.top } : undefined}>
            {url && !failed && <img className="og-img" src={url} alt={s.name} style={face?.pos ? { objectPosition: face.pos } : undefined} decoding="async" draggable={false} onError={() => setFailed(true)} />}
          </div>
        </div>
      </div>
      <figcaption className="og-plate"><b>{first}</b>{rest.length ? ` ${rest.join(' ')}` : ''}</figcaption>
    </figure>
  )
}

export type GroupProps = {
  rows?: ReturnType<typeof buildGroupRows>
  words?: string[] // big brush title, one word per entry
  kanjiA?: string
  kanjiB?: string
  seal?: string
  caption?: string
  label?: string
  leaderLabel?: string // banner above the head of the committee
}

export function OcGroup({
  rows = OC_ROWS,
  words = ['OC', 'ELITES'],
  kanjiA = '精鋭',
  kanjiB = '実行委員会',
  seal = '精鋭',
  caption = 'The Organizing Committee',
  label = 'OC Elites',
  leaderLabel = 'Organizing Committee President',
}: GroupProps) {
  const total = rows.reduce((n, r) => n + r.length, 0)
  const slots = layoutFormation(rows)
  const secRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const ttlRef = useRef<HTMLHeadingElement>(null)
  const innerRef = useRef<HTMLSpanElement>(null)

  // the title is scaled so "OC ELITES" always fits, whatever font actually loads
  useLayoutEffect(() => {
    const ttl = ttlRef.current
    const stage = stageRef.current
    const inner = innerRef.current
    if (!ttl || !stage || !inner) return
    const fit = () => {
      const cur = parseFloat(ttl.style.getPropertyValue('--fit')) || 1
      const natural = inner.getBoundingClientRect().width / cur
      if (!natural) return
      const next = Math.min(1, (stage.clientWidth * 0.8) / natural)
      if (Math.abs(next - cur) > 0.004) ttl.style.setProperty('--fit', next.toFixed(4))
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(stage)
    document.fonts?.ready.then(fit)
    return () => ro.disconnect()
  }, [])

  useLayoutEffect(() => {
    const root = secRef.current
    if (!root) return

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const q = gsap.utils.selector(root)
        const label = q('.ocg-rec')[0] as HTMLElement
        const flash = q('.ocg-flash')[0]

        // ----- the whole reveal as ONE paused timeline, played when the finale scrolls into view
        const tl = gsap.timeline({ paused: true })
        tl.call(() => { label.textContent = '● REC' }, undefined, 0)
          .fromTo(q('.ocg-sun'), { yPercent: 45, scale: 0.7, opacity: 0 }, { yPercent: 0, scale: 1, opacity: 1, duration: 1.7, ease: 'power3.out' }, 0)
          .fromTo(q('.ocg-rays'), { opacity: 0 }, { opacity: 1, duration: 2.2, ease: 'power2.out' }, 0.2)
          .fromTo(q('.ocg-torii'), { opacity: 0, y: 30 }, { opacity: 0.5, y: 0, duration: 1.2, ease: 'power3.out' }, 0.3)
          .from(q('.ocg-ch'), {
            yPercent: -170, rotation: () => gsap.utils.random(-30, 30), opacity: 0, scale: 1.5,
            duration: 0.9, stagger: 0.07, ease: 'back.out(1.8)',
          }, 0.5)
          .fromTo(q('.ocg-kj'), { opacity: 0, y: -30 }, { opacity: 0.82, y: 0, duration: 0.9, stagger: 0.15, ease: 'power3.out' }, 1)
          .fromTo(q('.ocg-seal'), { opacity: 0, scale: 3, rotation: -28 }, { opacity: 1, scale: 1, rotation: -8, duration: 0.5, ease: 'back.out(2.4)' }, 1.6)

        // viewfinder corners snap in
        q('.ocg-vf').forEach((el, i) => {
          tl.fromTo(el, { opacity: 0, x: (i % 2 ? 1 : -1) * 26, y: (i < 2 ? -1 : 1) * 26 }, { opacity: 0.4, x: 0, y: 0, duration: 0.6, ease: 'power3.out' }, 1.1 + i * 0.04)
        })
        tl.fromTo(label, { opacity: 0 }, { opacity: 0.75, duration: 0.4 }, 1.2)

        // the team walks into frame: wings first, then the bottom V, the head of the committee last
        rows.forEach((_, t) => {
          tl.fromTo(
            q(`.og-t${t}`),
            { yPercent: 45, opacity: 0, scale: 0.9 },
            { yPercent: 0, opacity: 1, scale: 1, duration: 1, stagger: { each: 0.07, from: 'edges' }, ease: 'expo.out', transformOrigin: '50% 100%' },
            1.3 + t * 0.5,
          )
        })
        tl.fromTo(q('.og-lead'), { yPercent: 30, opacity: 0, scale: 0.88 }, { yPercent: 0, opacity: 1, scale: 1, duration: 1.2, ease: 'expo.out', transformOrigin: '50% 100%' }, 1.3 + rows.length * 0.5)

        // say cheese
        tl.addLabel('snap', '>-0.15')
          .fromTo(flash, { opacity: 0 }, { opacity: 0.95, duration: 0.07, ease: 'none' }, 'snap')
          .to(flash, { opacity: 0, duration: 0.9, ease: 'power2.out' }, 'snap+=0.07')
          .call(() => { label.textContent = '● CAPTURED' }, undefined, 'snap')
          .fromTo(q('.ocg-cap'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 'snap+=0.2')

        revealOnce(tl, root, 'top 70%')

        // ----- endless loops (rays, clouds, petals): only while the finale is on screen
        const loops: gsap.core.Tween[] = []
        loops.push(gsap.to(q('.ocg-rays'), { rotation: 360, duration: 120, ease: 'none', repeat: -1, paused: true }))
        q('.ocg-kas').forEach((el, i) => {
          loops.push(gsap.fromTo(el, { xPercent: i % 2 ? 12 : -12 }, { xPercent: i % 2 ? -12 : 12, duration: gsap.utils.random(14, 20), ease: 'sine.inOut', yoyo: true, repeat: -1, paused: true }))
        })
        const hh = root.offsetHeight || 400
        q('.ocg-petal').forEach((p, i) => {
          gsap.set(p, { y: -30, rotation: gsap.utils.random(0, 360) })
          loops.push(
            gsap.to(p, { y: hh * 1.02, duration: gsap.utils.random(8, 13), ease: 'none', repeat: -1, delay: -gsap.utils.random(0, 10), paused: true }),
            gsap.to(p, { x: gsap.utils.random(30, 70) * (i % 2 ? 1 : -1), rotation: '+=240', duration: gsap.utils.random(3, 5), ease: 'sine.inOut', yoyo: true, repeat: -1, paused: true }),
          )
        })
        ScrollTrigger.create({
          trigger: root, start: 'top bottom', end: 'bottom top',
          onToggle: (self) => loops.forEach((t) => (self.isActive ? t.resume() : t.pause())),
        })
      })
    }, root)

    refreshSoon()
    return () => ctx.revert()
  }, [])

  const word = (w: string) => (
    <span className="ocg-w" aria-hidden="true">
      {w.split('').map((c, i) => <span className="ocg-ch" key={i}>{c}</span>)}
    </span>
  )

  return (
    <section className="ocg" ref={secRef} aria-label={`${label}, group photo, ${total} people`}>
      <div className="ocg-stage" ref={stageRef}>
        <div className="ocg-rays" aria-hidden="true" />
        <div className="ocg-kas" aria-hidden="true" style={{ top: 'calc(10*var(--u))', left: '4%', width: 'calc(34*var(--u))' }} />
        <div className="ocg-kas" aria-hidden="true" style={{ top: 'calc(34*var(--u))', right: '2%', width: 'calc(40*var(--u))' }} />
        <div className="ocg-sun" aria-hidden="true" />
        <svg className="ocg-torii" viewBox="0 0 100 62" aria-hidden="true" focusable="false">
          <g fill="#3a0412">
            <path d="M1 9 Q50 0 99 9 L97 15 Q50 8 3 15 Z" />
            <rect x="8" y="16" width="84" height="3.2" />
            <rect x="12" y="29" width="76" height="3" />
            <rect x="16" y="16" width="5.2" height="46" />
            <rect x="78.8" y="16" width="5.2" height="46" />
          </g>
        </svg>

        <h2 className="ocg-ttl" ref={ttlRef} aria-label={words.join(' ')}>
          <span className="ocg-ttl-in" ref={innerRef}>
            {words.map((w, i) => <React.Fragment key={i}>{word(w)}</React.Fragment>)}
          </span>
        </h2>

        <div className="ocg-kj a" aria-hidden="true">{kanjiA}</div>
        <div className="ocg-kj b" aria-hidden="true">{kanjiB}</div>

        <div className="og-fm">
          {slots.map((sl) => <GroupCard key={sl.name} s={sl} label={leaderLabel} />)}
        </div>

        <div className="ocg-seal" aria-hidden="true">{seal}</div>
        <div className="ocg-vf tl" aria-hidden="true" />
        <div className="ocg-vf tr" aria-hidden="true" />
        <div className="ocg-vf bl" aria-hidden="true" />
        <div className="ocg-vf br" aria-hidden="true" />
        <div className="ocg-rec" aria-hidden="true">● CAPTURED</div>
        {FINALE_PETALS.map((p, i) => (
          <span key={i} className="ocg-petal" aria-hidden="true" style={{ left: `${p.left}%`, scale: String(p.scale) }} />
        ))}
      </div>

      <div className="ocg-ground" aria-hidden="true" />
      <div className="ocg-cap" aria-hidden="true"><span>{caption}</span></div>
      <div className="ocg-flash" aria-hidden="true" />
    </section>
  )
}

// ============================================================================
// CONFERENCE MANAGERS: opens the OC tab, before the OCP poster.
// Japanese "hanging scroll" panels (gold / sakura / indigo) on a night-indigo stage with a
// rising sun, illustrations from public/assets/illustrations, and a big brush headline.
// To add / edit: change ONE line in CM (order = left, CENTRE, right).
//   ph   (optional) = person height in units (bigger = bigger person)
//   keep (optional) = how much of the person to show from the top (0.55 = head to hips)
// People are auto-trimmed in the browser (transparent padding removed, cropped to the
// upper body), so every head ends up the same size whatever the original photo looks like.
// ============================================================================
const EB_DIR = '/assets/eb-pics/'
const ILL = '/assets/illustrations/'

const CM: { name: string; file: string; role: string; ph?: number; keep?: number }[] = [
  { name: 'Savinda Sithum', file: EB_DIR + 'savinda-sithum.webp', role: 'Conference Manager' },
  { name: 'Senaya Jayasuriya', file: EB_DIR + 'senaya-jayasuriya.webp', role: 'Conference Manager' },
  { name: 'Sabeelur Rashaad', file: EB_DIR + 'sabeelur-rashaad.webp', role: 'Conference Manager' },
]

// file names as they appear in public/assets/illustrations (a missing one just hides itself)
const ILLS = {
  mask: ILL + 'alessandro_hrdz-mask-6976331.png',
  fan: ILL + 'jakeloris-fan-7039967.png',
  koi: ILL + 'kacsoeszti-koi-1184783_1920.png',
  bonsai: ILL + 'gdj-bonsai-tree-8143900.svg',
  building: ILL + 'gdj-building-8171699.svg',
  dragon: ILL + 'gdj-dragon-8095373.svg',
  kanji: [
    ILL + 'clker-free-vector-images-japanese-24153_1920.png', // 健
    ILL + 'clker-free-vector-images-love-symbol-24154_1920.png', // 愛
    ILL + 'clker-free-vector-images-luck-24155_1920.png', // 運
  ],
}

const WAVES_WINE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='20' viewBox='0 0 40 20'%3E%3Cg fill='%2340081a' stroke='%23d6b25e' stroke-width='1.3'%3E%3Ccircle cx='0' cy='10' r='18'/%3E%3Ccircle cx='0' cy='10' r='12'/%3E%3Ccircle cx='0' cy='10' r='6'/%3E%3Ccircle cx='40' cy='10' r='18'/%3E%3Ccircle cx='40' cy='10' r='12'/%3E%3Ccircle cx='40' cy='10' r='6'/%3E%3Ccircle cx='20' cy='20' r='18'/%3E%3Ccircle cx='20' cy='20' r='12'/%3E%3Ccircle cx='20' cy='20' r='6'/%3E%3C/g%3E%3C/svg%3E")`

// trims the transparent padding off a cut-out and keeps only the top part of the person.
// PERF: this used to scan every pixel of 28 full-size photos on the main thread the moment the OC tab
// mounted (right when you are looking at Conference Managers + OCP). Now:
//   - the bounding box is found on a small downscaled copy (~50x fewer pixels)
//   - the output is capped to 800px wide (it is shown at ~300px)
//   - jobs run ONE at a time, each in an idle slot, so scrolling / animations never stall
//   - results are cached for the whole session (switching tabs back and forth costs nothing)
const CUT_MAX = 800
const SCAN_MAX = 384
const cutCache = new Map<string, Promise<string>>()
let cutChain: Promise<unknown> = Promise.resolve()

const idle = () =>
  new Promise<void>((res) => {
    const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback
    if (ric) ric(() => res(), { timeout: 250 })
    else setTimeout(res, 20)
  })

const buildCutout = async (src: string, keep: number): Promise<string> => {
  try {
    const img = new Image()
    img.decoding = 'async'
    img.src = src
    await img.decode()
    const sw = img.naturalWidth
    const sh = img.naturalHeight

    // 1) find the visible bounds on a small copy
    const sc = Math.min(1, SCAN_MAX / Math.max(sw, sh))
    const w = Math.max(1, Math.round(sw * sc))
    const h = Math.max(1, Math.round(sh * sc))
    const c = document.createElement('canvas')
    c.width = w
    c.height = h
    const g = c.getContext('2d', { willReadFrequently: true })
    if (!g) return src
    g.drawImage(img, 0, 0, w, h)
    const { data } = g.getImageData(0, 0, w, h)
    let t = h, b = -1, l = w, r = -1
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (data[(y * w + x) * 4 + 3] > 12) {
          if (y < t) t = y
          if (y > b) b = y
          if (x < l) l = x
          if (x > r) r = x
        }
      }
    }
    if (b < 0) return src

    // 2) crop on the ORIGINAL (1 scan-pixel of safety margin so thin hair tips are never clipped)
    const m = 1
    const sx = Math.max(0, Math.floor((l - m) / sc))
    const sy = Math.max(0, Math.floor((t - m) / sc))
    const ex = Math.min(sw, Math.ceil((r + 1 + m) / sc))
    const ey = Math.min(sh, Math.ceil((b + 1 + m) / sc))
    const cw = ex - sx
    const chFull = ey - sy
    const chKeep = Math.max(1, Math.round(chFull * keep))

    // 3) draw once, capped in size
    const k = Math.min(1, CUT_MAX / cw)
    const o = document.createElement('canvas')
    o.width = Math.max(1, Math.round(cw * k))
    o.height = Math.max(1, Math.round(chKeep * k))
    const og = o.getContext('2d')
    if (!og) return src
    og.imageSmoothingQuality = 'high'
    og.drawImage(img, sx, sy, cw, chKeep, 0, 0, o.width, o.height)
    const blob = await new Promise<Blob | null>((res) => o.toBlob(res))
    return blob ? URL.createObjectURL(blob) : src
  } catch {
    return src // could not read pixels: show the original
  }
}

const cutout = (src: string, keep: number) => {
  const key = `${src}|${keep}`
  let p = cutCache.get(key)
  if (!p) {
    p = new Promise<string>((resolve) => {
      cutChain = cutChain.then(idle).then(() => buildCutout(src, keep)).then(resolve)
    })
    cutCache.set(key, p)
  }
  return p
}

// `enabled` lets a card wait until it is near the screen before doing any work
export const useCutout = (src: string, keep: number, enabled = true) => {
  const [out, setOut] = useState<string | null>(null)
  useEffect(() => {
    if (!enabled) return
    let dead = false
    cutout(src, keep).then((u) => { if (!dead) setOut(u) })
    return () => { dead = true }
  }, [src, keep, enabled])
  return out
}

// true once the element has come within `margin` of the viewport (and stays true)
const useNear = (margin = '900px') => {
  const ref = useRef<HTMLElement>(null)
  const [near, setNear] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || near) return
    if (!('IntersectionObserver' in window)) { setNear(true); return }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect() } }, { rootMargin: margin })
    io.observe(el)
    return () => io.disconnect()
  }, [near, margin])
  return [ref, near] as const
}

const Ill = ({ src, className, style, eager }: { src: string; className: string; style?: React.CSSProperties; eager?: boolean }) => {
  const [bad, setBad] = useState(false)
  if (bad) return null
  return <img className={className} style={style} src={src} alt="" aria-hidden="true" loading={eager ? 'eager' : 'lazy'} decoding="async" draggable={false} onError={() => setBad(true)} />
}

const CMCSS = `
.cm{--u:1cqw;--ink:#2a0310;--cream:#fff1e4;--gold:#d6b25e;--vermilion:#d93a2b;position:relative;overflow:hidden;margin-bottom:calc(5*var(--u));padding-top:calc(5*var(--u));
  background:radial-gradient(ellipse at 50% 42%,#a8142f 0,#7a0a22 48%,#3a0613 100%);font-family:'Oswald',system-ui,sans-serif}
@container (min-width:700px){.cm{--u:.8cqw}}
@container (min-width:1100px){.cm{--u:.62cqw}}
@container (min-width:1600px){.cm{--u:.5cqw}}


.cm-stage{position:relative;width:calc(100*var(--u));max-width:100%;height:calc(100*var(--u));margin:0 auto}

/* ---------- backdrop ---------- */
.cm-sun{position:absolute;left:50%;top:calc(2*var(--u));width:calc(66*var(--u));aspect-ratio:1;margin-left:calc(-33*var(--u));border-radius:50%;z-index:0;
  background:radial-gradient(circle at 40% 34%,#ffb89f,#ff6a52 55%,#d93a2b)}
.cm-sil{position:absolute;pointer-events:none;filter:brightness(0) invert(1);opacity:.09;z-index:0}
.cm-sil.bld{left:calc(-5*var(--u));bottom:calc(14*var(--u));width:calc(42*var(--u))}
.cm-sil.drg{right:calc(-9*var(--u));top:calc(4*var(--u));width:calc(54*var(--u))}
.cm-ill{position:absolute;pointer-events:none}
.cm-ill.mask{left:calc(1*var(--u));top:calc(1.5*var(--u));width:calc(11*var(--u));rotate:-8deg;z-index:5}
.cm-ill.fan{right:calc(2.5*var(--u));top:calc(3*var(--u));width:calc(19*var(--u));rotate:9deg;z-index:5}
.cm-ill.koi{left:calc(1.5*var(--u));bottom:calc(1.5*var(--u));width:calc(13*var(--u));z-index:11}
.cm-ill.bon{right:calc(1.5*var(--u));bottom:calc(2*var(--u));width:calc(14*var(--u));z-index:11;filter:brightness(0) invert(1);opacity:.6}

/* ---------- hanging-scroll panels ---------- */
.cm-c0,.cm-c1,.cm-c2{--w:calc(27*var(--u));--ph:calc(46*var(--u))}
.cm-c0{--l:calc(7*var(--u))}
.cm-c1{--l:calc(36.5*var(--u))}
.cm-c2{--l:calc(66*var(--u))}

.cm-col{position:absolute;left:var(--l);width:var(--w);bottom:calc(18*var(--u));overflow:hidden;color:var(--ink);box-shadow:inset 0 0 0 max(1.5px,calc(.3*var(--u))) rgba(42,3,16,.28)}
.cm-col.cm-c0{height:calc(68*var(--u));z-index:2;background:linear-gradient(#f6d77c,#e0a73a 70%,#c98a22)}
.cm-col.cm-c1{height:calc(68*var(--u));z-index:2;background:linear-gradient(#fde3e8,#f0b1bf 65%,#df8aa0)}
.cm-col.cm-c2{height:calc(68*var(--u));z-index:2;background:linear-gradient(#fbf4e6,#eadcc0 65%,#d4be98)}
.cm-col::before,.cm-col::after{content:'';position:absolute;left:0;right:0;height:calc(1.6*var(--u));z-index:4;background:linear-gradient(#5e3d20,#2c1b0c);box-shadow:inset 0 max(1px,calc(.2*var(--u))) 0 rgba(255,220,160,.35)}
.cm-col::before{top:0}.cm-col::after{bottom:0}
.cm-kj{position:absolute;left:5%;width:90%;top:calc(33*var(--u));opacity:.13;z-index:0;pointer-events:none}

.cm-nm{position:absolute;left:0;right:0;top:calc(4.6*var(--u));padding:0 calc(2.4*var(--u));z-index:2}
.cm-nm h3{margin:0;font-family:'Jansina','Brusher','Anton','Impact',sans-serif;font-weight:400;font-synthesis:none;font-size:max(11px,calc(var(--nf,3)*var(--u)));line-height:1.08;letter-spacing:.02em;text-transform:uppercase}
.cm-nm p{display:flex;align-items:center;gap:.7em;margin:calc(1.4*var(--u)) 0 0;font-family:'Jansina','Brusher','Anton','Impact',sans-serif;font-weight:400;font-synthesis:none;font-size:max(9.5px,calc(2*var(--u)));letter-spacing:.08em;text-transform:uppercase;color:rgba(42,3,16,.72)}
.cm-nm p::before{content:'';flex:none;width:max(6px,calc(1.1*var(--u)));height:max(6px,calc(1.1*var(--u)));background:var(--vermilion);transform:rotate(45deg)}

/* ---------- the people (sit ABOVE the panels so they can pop out of them) ---------- */
.cm-ph{will-change:transform,opacity;position:absolute;left:calc(var(--l) - var(--w)*.08);width:calc(var(--w)*1.16);height:var(--ph);bottom:calc(21*var(--u));display:flex;justify-content:center;align-items:flex-end;pointer-events:none}
.cm-ph.cm-c0,.cm-ph.cm-c1,.cm-ph.cm-c2{z-index:6}
/* width AND height are set + object-fit, so a global img max-width reset can never squash the photo sideways */
.cm-pimg{flex:none;display:block;height:100%;width:100%;max-width:none;object-fit:contain;object-position:center bottom;-webkit-mask-image:linear-gradient(#000 78%,transparent);mask-image:linear-gradient(#000 78%,transparent);
  filter:drop-shadow(0 0 max(1.5px,calc(.4*var(--u))) #fff)}

/* ---------- ground, fade and the big headline ---------- */
.cm-fade{position:absolute;left:0;right:0;bottom:0;height:calc(40*var(--u));z-index:8;pointer-events:none;background:linear-gradient(transparent,rgba(58,6,19,.8) 68%,rgba(42,3,16,.92))}
.cm-ground{position:absolute;left:0;right:0;bottom:0;height:calc(14*var(--u));z-index:9;pointer-events:none;background:linear-gradient(#5a0719,#2f030e);border-top:max(2px,calc(.45*var(--u))) solid var(--gold)}
.cm-ground::after{content:'';position:absolute;inset:0;background-image:${WAVES_WINE};background-size:40px 20px;background-position:center top;opacity:.55;-webkit-mask-image:linear-gradient(transparent,#000 60%);mask-image:linear-gradient(transparent,#000 60%)}

.cm-ttl{position:absolute;left:0;right:0;bottom:calc(2.5*var(--u));z-index:10;margin:0;text-align:center;line-height:1;white-space:nowrap;
  font-family:'Jansina','Brusher','Anton','Impact',sans-serif;font-weight:400;font-synthesis:none;font-size:calc(13*var(--u));letter-spacing:.02em;color:var(--cream)}
.cm-l,.cm-hl{display:block;width:fit-content;margin:0 auto}
.cm-l{-webkit-text-stroke:max(1px,calc(.5*var(--u))) var(--ink);paint-order:stroke fill;text-shadow:0 calc(.8*var(--u)) 0 var(--ink),0 calc(1.6*var(--u)) calc(1.8*var(--u)) rgba(0,0,0,.45)}
.cm-hl{position:relative;margin-top:calc(1*var(--u));padding:.06em .34em .02em;text-shadow:0 calc(.5*var(--u)) 0 rgba(80,10,6,.55)}
.cm-hlbg{position:absolute;inset:0;border-radius:calc(1.4*var(--u));background:linear-gradient(100deg,#f0553c,var(--vermilion) 55%,#a8241a);box-shadow:0 calc(.8*var(--u)) calc(2*var(--u)) rgba(0,0,0,.45),inset 0 0 0 max(1.5px,calc(.3*var(--u))) var(--gold)}
.cm-hl .cm-ch{position:relative}
.cm-ch{display:inline-block}
`

const CmPerson = ({ p, i }: { p: (typeof CM)[number]; i: number }) => {
  const url = useCutout(photo(p.file), p.keep ?? 0.55)
  return (
    <div className={`cm-ph cm-c${i}`} style={p.ph ? ({ '--ph': `calc(${p.ph}*var(--u))` } as React.CSSProperties) : undefined}>
      {url && <img className="cm-pimg" src={url} alt={p.name} decoding="async" draggable={false} />}
    </div>
  )
}

export function ConferenceManagers() {
  const ref = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const root = ref.current
    if (!root) return

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const q = gsap.utils.selector(root)
        const each = { each: 0.16, from: 'edges' as const }

        const tl = gsap.timeline({ paused: true })
        tl.fromTo(q('.cm-sun'), { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.6, ease: 'power3.out' }, 0)
          // the scrolls unroll from the top
          .fromTo(q('.cm-col'), { opacity: 0, y: -24 }, { opacity: 1, y: 0, duration: 0.9, stagger: each, ease: 'power3.out' }, 0.15)
          .fromTo(q('.cm-nm'), { opacity: 0, y: -14 }, { opacity: 1, y: 0, duration: 0.8, stagger: each, ease: 'power3.out' }, 0.8)
          .fromTo(q('.cm-ph'), { yPercent: 22, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.1, stagger: each, ease: 'expo.out' }, 0.7)
          .fromTo(q('.cm-ill'), { opacity: 0 }, { opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power2.out' }, 1.1)
          .from(q('.cm-ch'), { yPercent: -120, opacity: 0, duration: 0.7, stagger: 0.04, ease: 'power3.out' }, 0.9)
          .fromTo(q('.cm-hlbg'), { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, duration: 0.8, ease: 'power4.inOut' }, 1.3)

        revealOnce(tl, root, 'top 75%')
      })
    }, root)

    refreshSoon()
    return () => ctx.revert()
  }, [])

  const chars = (w: string) => w.split('').map((c, i) => <span className="cm-ch" key={i} aria-hidden="true">{c}</span>)

  return (
    <section className="cm" ref={ref} aria-label="Conference Managers">
      <style>{CMCSS}</style>
      <div className="cm-stage">
        <div className="cm-sun" aria-hidden="true" />
        <Ill eager className="cm-ill mask" src={ILLS.mask} />
        <Ill eager className="cm-ill fan" src={ILLS.fan} />

        {CM.map((p, i) => {
          const [first, ...rest] = p.name.split(' ')
          return (
            <div className={`cm-col cm-c${i}`} key={p.name}>
              <Ill eager className="cm-kj" src={ILLS.kanji[i % ILLS.kanji.length]} />
              <div className="cm-nm" style={{ '--nf': Math.min(3.6, 22 / (Math.max(...p.name.split(' ').map((w) => w.length)) * 0.78)).toFixed(2) } as React.CSSProperties}>
                <h3>{first}<br />{rest.join(' ')}</h3>
                <p>{p.role}</p>
              </div>
            </div>
          )
        })}

        {CM.map((p, i) => <CmPerson key={p.name} p={p} i={i} />)}

        <Ill eager className="cm-ill koi" src={ILLS.koi} />
        <Ill eager className="cm-ill bon" src={ILLS.bonsai} />
        <h2 className="cm-ttl" aria-label="Conference Managers">
          <span className="cm-l">{chars('CONFERENCE')}</span>
          <span className="cm-hl"><span className="cm-hlbg" aria-hidden="true" />{chars('MANAGERS')}</span>
        </h2>
      </div>
      <div className="cm-fade" aria-hidden="true" />
      <div className="cm-ground" aria-hidden="true" />
    </section>
  )
}

// ============================================================================
// EXPORT: the whole OC roster, ready to drop into the About page
// ============================================================================
export function OcRoster() {
  return (
    <div className="ocx-wrap">
      <style>{CSS + GCSS}</style>
      <ConferenceManagers />
      {DEPTS.map((d, i) => (
        <Poster key={d.key} dept={d} last={i === DEPTS.length - 1} />
      ))}
      <OcGroup />
    </div>
  )
}