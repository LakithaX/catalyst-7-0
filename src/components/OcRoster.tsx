import React, { useLayoutEffect, useMemo, useRef, useState } from 'react'
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
type Person = { name: string; file: string }
type Dept = {
  key: string
  mark: string // big watermark + title, e.g. "OCVP"
  tag: string // line under the title
  role: string // shown under every name in this department
  kanji: string // vertical kanji in the header; first character is the hanko seal
  members: Person[]
}

const DIR = '/assets/cat-oc-pics/'

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
const playFor = (tl: gsap.core.Timeline, self: ScrollTrigger) => {
  const v = Math.abs(self.getVelocity())
  tl.timeScale(v > 4000 ? 3.5 : v > 1800 ? 2.2 : 1).play()
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

const CSS = `
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
  const src = DIR + person.file

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
        <p>{role}</p>
      </div>

      <div className="ocx-seal" aria-hidden="true">{seal}</div>
    </section>
  )
}

// ============================================================================
// ONE DEPARTMENT POSTER
// ============================================================================
const PETALS = Array.from({ length: 6 }, (_, i) => ({
  left: 4 + ((i * 97) % 92),
  scale: 0.7 + ((i * 37) % 60) / 100,
}))

const Poster = ({ dept, last }: { dept: Dept; last: boolean }) => {
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
          .fromTo(q('.ocx-tag'), { opacity: 0, letterSpacing: '0.55em' }, { opacity: 1, letterSpacing: '0.06em', duration: 1.1, ease: 'power3.out' }, '-=0.6')
          .fromTo(q('.ocx-orn'), { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: 'power3.inOut' }, '-=0.7')
          .fromTo(q('.ocx-vk'), { opacity: 0, y: -30 }, { opacity: 0.72, y: 0, duration: 0.9, ease: 'power3.out' }, '-=0.8')

        ScrollTrigger.create({
          trigger: head, start: 'top 100%', once: true,
          onEnter: (self) => playFor(intro, self),
        })

        // endless tweens (asterisk spin + petals): only run while the poster is on screen
        const loops: gsap.core.Tween[] = []
        loops.push(gsap.to(q('.ocx-star'), { rotation: 360, duration: 14, ease: 'none', repeat: -1, delay: 2, paused: true }))

        // ----- giant watermark drifts with scroll
        gsap.fromTo(q('.ocx-wm'), { yPercent: -10 }, {
          yPercent: 14, ease: 'none',
          scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: true },
        })

        // ----- sakura petals fall through the header
        const hh = (head as HTMLElement).offsetHeight || 300
        q('.ocx-petal').forEach((p, i) => {
          gsap.set(p, { y: -30, rotation: gsap.utils.random(0, 360) })
          loops.push(
            gsap.to(p, {
              y: hh * 1.05, duration: gsap.utils.random(7, 12), ease: 'none', repeat: -1, delay: -gsap.utils.random(0, 10), paused: true,
            }),
            gsap.to(p, {
              x: gsap.utils.random(30, 70) * (i % 2 ? 1 : -1), rotation: '+=240',
              duration: gsap.utils.random(3, 5), ease: 'sine.inOut', yoyo: true, repeat: -1, paused: true,
            }),
          )
        })
        ScrollTrigger.create({
          trigger: root, start: 'top bottom', end: 'bottom top',
          onToggle: (self) => loops.forEach((t) => (self.isActive ? t.resume() : t.pause())),
        })

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
              { opacity: 0, scale: 2.6, rotation: -sgn * 20 },
              { opacity: 1, scale: 1, rotation: -sgn * 6, duration: 0.45, ease: 'back.out(2.4)' },
              '-=0.2',
            )
            // a little "thud" of the stamp landing
            tl.fromTo(row, { y: 0 }, { y: 3, duration: 0.06, yoyo: true, repeat: 1, ease: 'power1.inOut' }, '<0.3')
          }

          ScrollTrigger.create({
            trigger: row, start: 'top 112%', once: true,
            onEnter: (self) => playFor(tl, self),
          })

          // gentle scroll parallax on the big first name only (cheap: plain text layer)
          if (big) gsap.fromTo(big, { x: sgn * 40 }, { x: -sgn * 40, ease: 'none', scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: true } })
        })

        // ----- wave divider fades in
        const wave = q('.ocx-wave')[0]
        if (wave) gsap.from(wave, { opacity: 0, scaleX: 0.6, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: wave, start: 'top 105%', once: true } })
      })
    }, root)

    // fonts (Jansina / Anton) change nothing in layout heights, but refresh to be safe
    document.fonts?.ready.then(() => ScrollTrigger.refresh())

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
        {PETALS.map((p, i) => (
          <span key={i} className="ocx-petal" aria-hidden="true" style={{ left: `${p.left}%`, scale: String(p.scale) }} />
        ))}
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
// To move someone, change their name's position inside GROUP (order = left to right).
// Upper-body crop: tweak --crop per row in GCSS (lower = tighter, higher = more torso).
// ============================================================================
const PEOPLE = new Map(DEPTS.flatMap((d) => d.members).map((m) => [m.name, m] as const))

const GROUP: { x0: number; x1: number; names: string[] }[] = [
  { // back row
    x0: 11, x1: 89,
    names: ['Hari Branavan Arulnathan', 'Vimarshi Suraweera', 'Kaveesha Miran', 'Isuri Muthumalee', 'Maneesha Gunathilake', 'Lakwan Wijegunawardana'],
  },
  { // middle row
    x0: 12, x1: 88,
    names: ['Nethuli Gunathilaka', 'Chetha Atapattu', 'Gihansa Hasithmi', 'Dahamsa Peiris', 'Adithya Munasinghe', 'Yehan De Silva'],
  },
  { // front row (the president stands in the centre)
    x0: 13, x1: 87,
    names: ['Vindhi Akmeemana', 'Isuri Naveesha', 'Monali Edirisinghe', 'Mahdy Hassan', 'Binushi Wikramarathne', 'Harshitha Yasiru', 'Tharuka Liyanage'],
  },
]

const GROUP_ROWS = GROUP.map((row) => {
  const n = row.names.length
  return row.names
    .map((name, i) => {
      const person = PEOPLE.get(name)
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

const TOTAL_PEOPLE = GROUP_ROWS.reduce((n, r) => n + r.length, 0)

// torn top edge of the finale panel
const TOP_CLIP = (() => {
  const a = jag(rnd(4242), 1)
  const pts: string[] = []
  for (let q = 0; q <= N; q++) pts.push(`${((q / N) * 100).toFixed(2)}% calc(${(1.6 + 1.1 * a[q]).toFixed(2)}*var(--u))`)
  return `polygon(${pts.join(',')},100% 100%,0 100%)`
})()

const GCSS = `
.ocg{--u:1cqw;--ink:#2a0310;--cream:#fff1e4;position:relative;overflow:hidden;margin-top:calc(6*var(--u));padding-top:calc(4*var(--u));
  background:radial-gradient(ellipse at 50% 52%,#b3132f 0,#8c0b26 45%,#4d0517 100%);font-family:'Oswald',system-ui,sans-serif;clip-path:${TOP_CLIP}}
@container (min-width:700px){.ocg{--u:.8cqw}}
@container (min-width:1100px){.ocg{--u:.62cqw}}
@container (min-width:1600px){.ocg{--u:.5cqw}}

.ocg-stage{position:relative;width:calc(100*var(--u));max-width:100%;height:calc(98*var(--u));margin:0 auto}

/* ---------- backdrop: rays, sun, torii, clouds ---------- */
.ocg-rays{position:absolute;left:50%;bottom:calc(-52*var(--u));width:calc(220*var(--u));height:calc(220*var(--u));margin-left:calc(-110*var(--u));border-radius:50%;
  background:repeating-conic-gradient(rgba(255,214,222,.13) 0 5deg,transparent 5deg 10deg);
  -webkit-mask-image:radial-gradient(circle,#000 22%,transparent 68%);mask-image:radial-gradient(circle,#000 22%,transparent 68%);z-index:0;pointer-events:none}
.ocg-sun{position:absolute;left:50%;bottom:calc(30*var(--u));width:calc(56*var(--u));aspect-ratio:1;margin-left:calc(-28*var(--u));border-radius:50%;
  background:radial-gradient(circle at 40% 34%,#ff6a80,#e0243f 55%,#b3132f);box-shadow:0 0 calc(9*var(--u)) calc(2*var(--u)) rgba(255,150,170,.4);z-index:0}
.ocg-torii{position:absolute;left:50%;bottom:calc(14*var(--u));width:calc(82*var(--u));height:auto;margin-left:calc(-41*var(--u));opacity:.5;z-index:0;pointer-events:none}
.ocg-kas{position:absolute;height:calc(5*var(--u));border-radius:50%;background:radial-gradient(ellipse,rgba(255,226,232,.42),transparent 70%);z-index:0;pointer-events:none}

/* ---------- giant brush title (sits BEHIND the people) ---------- */
.ocg-ttl{position:absolute;left:0;right:0;top:calc(2*var(--u));margin:0;text-align:center;white-space:nowrap;line-height:.95;z-index:1;
  font-family:'Jansina','Brusher','Anton','Impact',sans-serif;font-weight:400;font-synthesis:none;font-size:calc(30*var(--u)*var(--fit,1));letter-spacing:.02em;color:var(--cream);
  -webkit-text-stroke:max(1px,calc(.6*var(--u))) var(--ink);paint-order:stroke fill;
  text-shadow:0 calc(.9*var(--u)) 0 var(--ink),0 calc(1.8*var(--u)) calc(2*var(--u)) rgba(0,0,0,.35)}
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
  filter:drop-shadow(max(1.5px,calc(.35*var(--u))) 0 0 #fff) drop-shadow(min(-1.5px,calc(-.35*var(--u))) 0 0 #fff) drop-shadow(0 max(1.5px,calc(.35*var(--u))) 0 #fff) drop-shadow(0 min(-1.5px,calc(-.35*var(--u))) 0 #fff)}
/* fade the cut edge on the back two rows (front row's cut is hidden by the ground) */
.ocg-row.r0 .ocg-p,.ocg-row.r1 .ocg-p{-webkit-mask-image:linear-gradient(#000 68%,transparent 100%);mask-image:linear-gradient(#000 68%,transparent 100%)}

/* ---------- ground: seigaiha waves + caption ---------- */
.ocg-ground{position:absolute;left:0;right:0;bottom:0;height:calc(12*var(--u));z-index:5;background:linear-gradient(#5a0719,#2f030e);border-top:max(2px,calc(.5*var(--u))) solid #f4ece0;pointer-events:none}
.ocg-ground::after{content:'';position:absolute;inset:0;background-image:${WAVES};background-size:40px 20px;background-position:center top;opacity:.5;
  -webkit-mask-image:linear-gradient(transparent,#000 55%);mask-image:linear-gradient(transparent,#000 55%)}
.ocg-cap{position:absolute;left:0;right:0;bottom:calc(3.2*var(--u));text-align:center;z-index:6;pointer-events:none}
.ocg-cap span{display:inline-block;padding:.55em 1.5em;background:rgba(42,3,16,.82);border:1px solid rgba(255,241,228,.5);color:var(--cream);font-weight:500;font-size:max(10px,calc(2.1*var(--u)));letter-spacing:.28em;text-transform:uppercase;white-space:nowrap}

/* ---------- japanese details ---------- */
.ocg-kj{position:absolute;top:calc(6*var(--u));z-index:3;display:flex;flex-direction:column;align-items:center;gap:calc(1.6*var(--u));writing-mode:vertical-rl;font-family:'Noto Serif JP','Shippori Mincho',serif;font-weight:700;font-size:max(14px,calc(4.4*var(--u)));letter-spacing:.25em;color:var(--cream);opacity:.82;pointer-events:none}
.ocg-kj::before{content:'';width:2px;height:calc(7*var(--u));background:#ff6a80}
.ocg-kj.a{left:calc(2.5*var(--u))}.ocg-kj.b{right:calc(2.5*var(--u))}
.ocg-seal{position:absolute;right:calc(7*var(--u));top:calc(22*var(--u));z-index:6;width:max(34px,calc(11*var(--u)));aspect-ratio:1;display:flex;align-items:center;justify-content:center;writing-mode:vertical-rl;background:#fff1e4;color:#a8102f;font-family:'Noto Serif JP','Shippori Mincho',serif;font-weight:700;font-size:max(15px,calc(4.6*var(--u)));letter-spacing:.05em;border-radius:calc(.8*var(--u));box-shadow:0 calc(.5*var(--u)) calc(1.4*var(--u)) rgba(30,0,8,.5),inset 0 0 0 2px rgba(168,16,47,.3);transform:rotate(-8deg);pointer-events:none}
.ocg-vf{position:absolute;z-index:6;width:max(16px,calc(5*var(--u)));height:max(16px,calc(5*var(--u)));border:0 solid var(--cream);opacity:.4;pointer-events:none}
.ocg-vf.tl{top:calc(2*var(--u));left:calc(2*var(--u));border-top-width:2px;border-left-width:2px}
.ocg-vf.tr{top:calc(2*var(--u));right:calc(2*var(--u));border-top-width:2px;border-right-width:2px}
.ocg-vf.bl{bottom:calc(14*var(--u));left:calc(2*var(--u));border-bottom-width:2px;border-left-width:2px}
.ocg-vf.br{bottom:calc(14*var(--u));right:calc(2*var(--u));border-bottom-width:2px;border-right-width:2px}
.ocg-rec{position:absolute;z-index:6;top:calc(2.6*var(--u));left:calc(9*var(--u));color:var(--cream);font-weight:500;font-size:max(9px,calc(1.9*var(--u)));letter-spacing:.2em;opacity:.75;pointer-events:none}
.ocg-petal{position:absolute;top:0;z-index:7;width:max(7px,calc(1.7*var(--u)));height:max(5px,calc(1.2*var(--u)));background:#fff6f8;border-radius:100% 0 100% 0;opacity:.9;pointer-events:none;box-shadow:0 0 6px rgba(255,255,255,.5)}
@container (max-width:699px){.ocg-petal:nth-of-type(n+6){display:none}}
.ocg-flash{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none;z-index:9}
`

const FINALE_PETALS = Array.from({ length: 10 }, (_, i) => ({
  left: 3 + ((i * 53) % 94),
  scale: 0.7 + ((i * 41) % 60) / 100,
}))

export function OcGroup() {
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

        // the team walks into frame: back row, then middle, then front (centre person last)
        ;['.ocg-row.r0', '.ocg-row.r1', '.ocg-row.r2'].forEach((sel, r) => {
          tl.fromTo(
            q(`${sel} .ocg-p`),
            { yPercent: 70, opacity: 0, scale: 0.9 },
            { yPercent: 0, opacity: 1, scale: 1, duration: 1, stagger: { each: 0.07, from: 'edges' }, ease: 'expo.out', transformOrigin: '50% 100%' },
            1.3 + r * 0.55,
          )
        })

        // say cheese
        tl.addLabel('snap', '>-0.15')
          .fromTo(flash, { opacity: 0 }, { opacity: 0.95, duration: 0.07, ease: 'none' }, 'snap')
          .to(flash, { opacity: 0, duration: 0.9, ease: 'power2.out' }, 'snap+=0.07')
          .call(() => { label.textContent = '● CAPTURED' }, undefined, 'snap')
          .fromTo(q('.ocg-cap'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 'snap+=0.2')

        ScrollTrigger.create({
          trigger: root, start: 'top 70%', once: true,
          onEnter: (self) => playFor(tl, self),
        })

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

        // ----- depth: each tier drifts at its own speed while scrolling (front moves most)
        ;[1.5, 3, 5].forEach((s, r) => {
          gsap.fromTo(q(`.ocg-row.r${r}`), { yPercent: s }, {
            yPercent: -s, ease: 'none',
            scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: true },
          })
        })
      })
    }, root)

    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    return () => ctx.revert()
  }, [])

  const word = (w: string) => (
    <span className="ocg-w" aria-hidden="true">
      {w.split('').map((c, i) => <span className="ocg-ch" key={i}>{c}</span>)}
    </span>
  )

  return (
    <section className="ocg" ref={secRef} aria-label={`OC Elites, the organizing committee group photo, ${TOTAL_PEOPLE} people`}>
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

        <h2 className="ocg-ttl" ref={ttlRef} aria-label="OC ELITES">
          <span className="ocg-ttl-in" ref={innerRef}>
            {word('OC')}{word('ELITES')}
          </span>
        </h2>

        <div className="ocg-kj a" aria-hidden="true">精鋭</div>
        <div className="ocg-kj b" aria-hidden="true">実行委員会</div>

        {GROUP_ROWS.map((row, ri) => (
          <div className={`ocg-row r${ri}`} key={ri}>
            {row.map((p) => (
              <figure
                className="ocg-p"
                key={p.name}
                style={{ '--x': p.x, '--dy': p.dy, '--ws': p.ws, zIndex: p.z } as React.CSSProperties}
              >
                <img src={DIR + p.file} alt={p.name} loading="lazy" decoding="async" draggable={false} />
              </figure>
            ))}
          </div>
        ))}

        <div className="ocg-seal" aria-hidden="true">精鋭</div>
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
      <div className="ocg-cap" aria-hidden="true"><span>The Organizing Committee</span></div>
      <div className="ocg-flash" aria-hidden="true" />
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
      {DEPTS.map((d, i) => (
        <Poster key={d.key} dept={d} last={i === DEPTS.length - 1} />
      ))}
      <OcGroup />
    </div>
  )
}