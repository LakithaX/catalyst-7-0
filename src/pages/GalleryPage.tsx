import React, { useEffect, useRef, useState } from 'react';
import { TagMark } from '../components/brand/CatalystTag';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import Navbar from '../components/Navbar';
import { scrollTopOrRestore } from '../utils/navState';

// Authentic Catalyst 7.0 seminar photographs
const GALLERY_IMAGES = [
  "/assets/catalyst-gallery/616083505_1268080465365864_3783241921869610059_n.webp",
  "/assets/catalyst-gallery/616103586_1268087452031832_3118584779969684260_n.webp",
  "/assets/catalyst-gallery/616116748_1268080568699187_3100398452053345518_n.webp",
  "/assets/catalyst-gallery/catalyst-dj.webp",
  "/assets/catalyst-gallery/obt-beach.webp",
  "/assets/catalyst-gallery/616233471_1268080295365881_7557058301924341156_n.webp",
  "/assets/catalyst-gallery/616368520_1268080855365825_4465401467840168462_n.webp",
  "/assets/catalyst-gallery/616439277_1268082045365706_8706912413091711333_n.webp",
  "/assets/catalyst-gallery/616463195_1268085945365316_7407533435333699472_n.webp",
  "/assets/catalyst-gallery/616492035_1268080355365875_606194234428780138_n.webp",
  "/assets/catalyst-gallery/616529329_1268081438699100_5464235221991506990_n.webp",
  "/assets/catalyst-gallery/616849073_1268080215365889_1394999945882788592_n.webp",
  "/assets/catalyst-gallery/616852935_1268091818698062_1811121035233834010_n.webp",
  "/assets/catalyst-gallery/616856062_1268081038699140_5408968865674764265_n.webp",
  "/assets/catalyst-gallery/616938786_1268082428699001_1398486345666317073_n.webp",
  "/assets/catalyst-gallery/617017153_1268086832031894_3502562285613882645_n.webp",
  "/assets/catalyst-gallery/617067996_1268080292032548_6936022336367251590_n.webp",
  "/assets/catalyst-gallery/617073686_1268080668699177_4597045561927655998_n.webp",
  "/assets/catalyst-gallery/617331461_1268082458698998_896025517703704603_n.webp",
  "/assets/catalyst-gallery/617463058_1268088075365103_8693645449087459401_n.webp",
  "/assets/catalyst-gallery/617690261_1268080958699148_3647200086711209687_n.webp",
  "/assets/catalyst-gallery/617989634_1268081025365808_4863939880060285824_n.webp",
  "/assets/catalyst-gallery/618023942_1268081702032407_3520266089466034488_n.webp",
  "/assets/catalyst-gallery/618493767_1268092525364658_3596371227146674634_n.webp",
  "/assets/catalyst-gallery/618825259_1268080638699180_784931987486560934_n.webp",
  "/assets/catalyst-gallery/619246052_1268080425365868_5507811270348967850_n.webp",
];

const getImageSrc = (index: number) => GALLERY_IMAGES[index % GALLERY_IMAGES.length];

const INTRO_WORDS = [
  { word: "PURPOSE", sub: "01 — LEADERSHIP" },
  { word: "CONNECTION", sub: "02 — BROTHERHOOD" },
  { word: "COURAGE", sub: "03 — BUSHIDO SPIRIT" },
  { word: "VISION", sub: "04 — PERSPECTIVE" },
  { word: "GROWTH", sub: "05 — POTENTIAL" },
  { word: "RESILIENCE", sub: "06 — INNER STRENGTH" },
  { word: "IMPACT", sub: "07 — TRANSFORMATION" },
  { word: "PASSION", sub: "08 — ENERGY & DRIVE" },
  { word: "LEGACY", sub: "09 — HONOR & PRIDE" },
  { word: "CATALYST", sub: "10 — DARE BEYOND" },
];

const CHAPTERS = [
  { name: "PLENARY", kanji: "総会", bg: "/assets/catalyst-gallery/616529329_1268081438699100_5464235221991506990_n.webp" },
  { name: "WORKSHOPS", kanji: "研鑽", bg: "/assets/catalyst-gallery/616856062_1268081038699140_5408968865674764265_n.webp" },
  { name: "TEAMBUILDING", kanji: "結束", bg: "/assets/catalyst-gallery/obt-beach.webp" },
  { name: "CELEBRATION", kanji: "祝祭", bg: "/assets/catalyst-gallery/617331461_1268082458698998_896025517703704603_n.webp" },
];

const N = 10; // intro layers
const TILES_PER_CHAPTER = 10;
const MARQUEE_REPEAT = 6;
const SPANS: [number, number][] = [
  [7, 2],
  [5, 1],
  [5, 1],
  [6, 1],
  [6, 1],
];

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

const wipes = [
  (e: number) => `inset(0 ${100 - e * 100}% 0 0)`,
  (e: number) => `inset(0 0 ${100 - e * 100}% 0)`,
  (e: number) => `inset(0 0 0 ${100 - e * 100}%)`,
  (e: number) => `inset(${100 - e * 100}% 0 0 0)`,
  (e: number) => `circle(${e * 85}% at 50% 50%)`,
];

export const GalleryPage: React.FC = () => {
  const introRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const cntRef = useRef<HTMLSpanElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  // intro photos are fed to the browser a few at a time (first 3 straight away) so ten full-size
  // JPEGs are not all fetched + decoded in the same moment the page opens
  const [ready, setReady] = useState(3);
  useEffect(() => {
    if (ready >= N) return;
    const t = window.setTimeout(() => setReady((r) => Math.min(N, r + 1)), 160);
    return () => window.clearTimeout(t);
  }, [ready]);

  useEffect(() => {
    scrollTopOrRestore();
  }, []);

  useEffect(() => {
    const intro = introRef.current;
    const stage = stageRef.current;
    const host = hostRef.current;
    const bar = barRef.current;
    const cnt = cntRef.current;
    const hint = hintRef.current;
    if (!intro || !stage || !host || !bar || !cnt || !hint) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---------------------------------------------------------------- intro layers
    type Layer = {
      el: HTMLElement; img: HTMLElement; tint: HTMLElement; word: HTMLElement;
      shown: boolean | null; clip: string; scale: string; tintO: string; wordO: string; wordT: string;
    };
    const layers: Layer[] = Array.from(stage.querySelectorAll<HTMLElement>('.sg-layer')).map((el) => ({
      el,
      img: el.querySelector<HTMLElement>('.sg-img')!,
      tint: el.querySelector<HTMLElement>('.sg-tint')!,
      word: el.querySelector<HTMLElement>('.sg-word')!,
      shown: null, clip: '', scale: '', tintO: '', wordO: '', wordT: '',
    }));

    let lastCur = -1;
    let lastHint = '';
    let lastBar = -1;

    const applyIntro = (p: number) => {
      const f = p * (N - 0.0001);
      const cur = Math.min(N - 1, Math.floor(f));

      // 1) work out how far every wipe is
      const raws: number[] = [];
      const es: number[] = [];
      for (let k = 0; k < N; k++) {
        const raw = f - k + (k === 0 ? 1 : 0);
        raws.push(raw);
        es.push(easeOut(clamp(raw * 2.2)));
      }

      // 2) write only what changed, and only for layers that can actually be seen
      for (let k = 0; k < N; k++) {
        const L = layers[k];
        const covered = k < N - 1 && es[k + 1] >= 1; // a later layer fully hides this one
        const show = !covered && (k === 0 || es[k] > 0);
        if (L.shown !== show) {
          L.el.style.visibility = show ? 'visible' : 'hidden';
          L.shown = show;
        }
        if (!show) continue;

        const e = es[k];
        const raw = raws[k];
        const clip = e <= 0 ? 'inset(0 0 0 100%)' : e >= 1 ? 'none' : wipes[k % wipes.length](e);
        if (clip !== L.clip) { L.el.style.clipPath = clip; L.clip = clip; }

        const sc = `scale(${(1 + (1 - clamp(raw * 0.9)) * 0.16).toFixed(4)})`;
        if (sc !== L.scale) { L.img.style.transform = sc; L.scale = sc; }

        const to = (clamp(1 - (raw - 0.25) * 1.1) * 0.62).toFixed(3);
        if (to !== L.tintO) { L.tint.style.opacity = to; L.tintO = to; }

        const w = easeOut(clamp((raw - 0.1) * 2));
        const wo = w.toFixed(3);
        if (wo !== L.wordO) {
          L.word.style.opacity = wo;
          L.word.style.transform = `translate3d(0,${((1 - w) * 55).toFixed(2)}px,0)`;
          L.wordO = wo;
        }
      }

      if (cur !== lastCur) {
        cnt.textContent = `${String(cur + 1).padStart(2, '0')} / ${N}`;
        lastCur = cur;
      }
      const b = Math.round(p * 1000);
      if (b !== lastBar) { bar.style.transform = `scaleX(${p.toFixed(4)})`; lastBar = b; }
      const h = window.scrollY > 50 ? '0' : '1';
      if (h !== lastHint) { hint.style.opacity = h; lastHint = h; }
    };

    // ---------------------------------------------------------------- measurements (cached, not read every frame)
    let vh = window.innerHeight;
    let introTop = 0;
    let total = 1;
    const rows = Array.from(host.querySelectorAll<HTMLElement>('.sg-row'));
    let rowBase: number[] = [];
    const measure = () => {
      vh = window.innerHeight;
      introTop = intro.offsetTop;
      total = Math.max(1, intro.offsetHeight - stage.clientHeight);
      rowBase = rows.map((r) => -r.offsetWidth * 0.2);
    };
    measure();

    // ---------------------------------------------------------------- what is on screen right now
    const visTiles = new Set<HTMLElement>();
    const visBands = new Set<HTMLElement>();
    const visIO = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const t = e.target as HTMLElement;
          const set = t.classList.contains('sg-tile') ? visTiles : visBands;
          if (e.isIntersecting) set.add(t); else set.delete(t);
        }
        schedule();
      },
      { rootMargin: '120px 0px 120px 0px' },
    );
    const tiles = Array.from(host.querySelectorAll<HTMLElement>('.sg-tile'));
    const bands = Array.from(host.querySelectorAll<HTMLElement>('.sg-band'));
    tiles.forEach((t) => visIO.observe(t));
    bands.forEach((b) => visIO.observe(b));

    // tile curtain: opens when the tile is really entering the screen (so you SEE it open).
    // If a tile was scrolled past in one jump it is opened too, so nothing stays covered.
    const revealIO = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting || e.boundingClientRect.top < 0) {
            e.target.classList.add('in');
            revealIO.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    if (reduce) tiles.forEach((t) => t.classList.add('in'));
    else tiles.forEach((t) => revealIO.observe(t));

    // ---------------------------------------------------------------- the frame loop
    let raf = 0;
    let smooth = reduce ? -1 : 0; // eased intro progress
    let primed = false;
    let lastNow = 0;
    let lastY = -1;

    const frame = (now: number) => {
      raf = 0;
      const dt = lastNow ? Math.min(0.05, (now - lastNow) / 1000) : 0.016;
      lastNow = now;

      const y = window.scrollY;
      const target = clamp((y - introTop) / total);

      // intro: glide toward the scroll position (frame-rate independent), so wheel notches feel like one smooth move
      let moving = false;
      if (!primed || reduce) {
        smooth = target;
        primed = true;
      } else {
        const diff = target - smooth;
        if (Math.abs(diff) < 0.00008) smooth = target;
        else { smooth += diff * (1 - Math.exp(-dt * 11)); moving = true; }
      }
      if (y < introTop + total + vh * 1.5 || moving) applyIntro(smooth);

      // parallax: ALL reads first, then ALL writes (no layout thrashing), only for what is visible
      if (!reduce && y !== lastY) {
        const bandReads: [HTMLElement, number][] = [];
        bands.forEach((b, i) => {
          if (!visBands.has(b)) return;
          bandReads.push([rows[i], b.getBoundingClientRect().top]);
        });
        const tileReads: [HTMLElement, number, number][] = [];
        visTiles.forEach((t) => {
          const r = t.getBoundingClientRect();
          tileReads.push([t, r.top + r.height / 2 - vh / 2, r.height]);
        });

        bandReads.forEach(([row, top]) => {
          const i = rows.indexOf(row);
          row.style.transform = `translate3d(${(rowBase[i] + (top - vh / 2) * -0.35).toFixed(1)}px,0,0)`;
        });
        tileReads.forEach(([t, d, h]) => {
          const par = t.firstElementChild as HTMLElement | null;
          if (!par) return;
          // never move more than the spare 12% above/below the photo, so no edge ever shows
          const k = clamp(d / (vh / 2 + h / 2), -1, 1);
          par.style.transform = `translate3d(0,${(k * -0.1 * h).toFixed(1)}px,0)`;
        });
        lastY = y;
      }

      if (moving) schedule();
    };

    function schedule() {
      if (!raf) raf = requestAnimationFrame(frame);
    }

    const onScroll = () => schedule();
    const onResize = () => { measure(); lastY = -1; schedule(); };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    const ro = new ResizeObserver(onResize);
    ro.observe(host);
    document.fonts?.ready.then(onResize);
    schedule();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      ro.disconnect();
      visIO.disconnect();
      revealIO.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="relative w-full bg-[#FAF6EE] text-[#252321] select-none min-h-screen">
      <Navbar />
      <h1 className="sr-only">Catalyst 7.0 photo gallery</h1>

      {/* ── Intro cinematic scroll stage ── */}
      <section id="intro" ref={introRef} className="relative h-[1100svh]" aria-label="Catalyst 7.0 memories">
        <div ref={stageRef} id="stage" className="sticky top-0 h-[100svh] overflow-hidden bg-[#B51E23]">
          {INTRO_WORDS.map((w, k) => (
            <div className="sg-layer" key={w.word} style={{ zIndex: k + 1, visibility: k === 0 ? 'visible' : 'hidden' }}>
              <div className="sg-img">
                {k < ready && (
                  <img
                    src={getImageSrc(k)}
                    alt=""
                    decoding="async"
                    draggable={false}
                    {...(k === 0 ? ({ fetchPriority: 'high' } as Record<string, string>) : {})}
                  />
                )}
              </div>
              <div className="sg-tint" />
              <div className="sg-word" aria-hidden="true">
                <small>{w.sub}</small>
                {w.word}
              </div>
            </div>
          ))}

          {/* HUD */}
          <div className="absolute z-40 top-6 sm:top-8 left-5 sm:left-10 right-5 sm:right-10 flex justify-between items-center text-white text-xs sm:text-sm tracking-[0.3em] uppercase font-['Montserrat',sans-serif] font-bold pointer-events-none [text-shadow:0_1px_10px_rgba(0,0,0,0.55)]">
            <span className="flex items-center gap-2">
              <TagMark />
              CATALYST 7.0 · MEMORIES
            </span>
            <span id="cnt" ref={cntRef}>01 / 10</span>
          </div>

          {/* progress bar: scaleX (compositor) instead of animating width */}
          <div ref={barRef} id="bar" className="absolute z-40 left-0 bottom-0 h-1.5 w-full bg-white origin-left will-change-transform" style={{ transform: 'scaleX(0)' }} />

          <div ref={hintRef} id="hint" className="absolute z-40 right-5 sm:right-10 bottom-6 sm:bottom-10 text-white tracking-[0.3em] text-[11px] sm:text-xs uppercase font-['Montserrat',sans-serif] font-bold transition-opacity duration-300 pointer-events-none [text-shadow:0_1px_10px_rgba(0,0,0,0.55)]">
            Scroll Down ↓
          </div>
        </div>
      </section>

      {/* ── Mosaic chapters ── */}
      <div id="chapters" ref={hostRef} className="relative z-20 w-full">
        {CHAPTERS.map((ch, c) => (
          <React.Fragment key={ch.name}>
            <div className="sg-band">
              <div className="sg-band-bg" aria-hidden="true">
                <img src={ch.bg} alt="" className="sg-band-img" loading="lazy" decoding="async" />
                <div className="sg-band-overlay" />
              </div>
              <div className="sg-no">0{c + 1} / 04 · {ch.kanji}</div>
              <div className="sg-row" aria-hidden="true">
                {Array.from({ length: MARQUEE_REPEAT }, (_, i) => <span key={i}>{ch.name}</span>)}
              </div>
              <h2 className="sr-only">{ch.name}</h2>
            </div>

            <div className="sg-grid">
              {Array.from({ length: TILES_PER_CHAPTER }, (_, j) => {
                const idx = N + c * TILES_PER_CHAPTER + j;
                const [cs, rs] = SPANS[j % 5];
                return (
                  <div className="sg-tile" key={idx} style={{ gridColumn: `span ${cs}`, gridRow: `span ${rs}` }}>
                    <div className="sg-par">
                      <img src={getImageSrc(idx)} alt="Catalyst 7.0 seminar moment" loading="lazy" decoding="async" draggable={false} />
                    </div>
                    <i>{String(idx + 1).padStart(2, '0')}</i>
                  </div>
                );
              })}
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* ── Editorial outro ── */}
      <footer className="relative bg-[#B51E23] text-white text-center py-24 sm:py-36 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
          <img
            src="/assets/catalyst-gallery/617331461_1268082458698998_896025517703704603_n.webp"
            alt=""
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover opacity-20 contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#B51E23]/90 via-[#B51E23]/95 to-[#8F171B]" />
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none select-none">
          <img src="/assets/illustrations/gdj-dragon-8095373.svg" alt="" loading="lazy" decoding="async" className="w-[85vw] max-w-[1200px] h-auto object-contain invert" />
        </div>

        <div className="absolute bottom-0 right-4 sm:right-12 w-[180px] sm:w-[260px] opacity-25 pointer-events-none select-none hidden sm:block">
          <img src="/assets/illustrations/benkageyama-coy-5135969_1920.png" alt="" loading="lazy" decoding="async" className="w-full h-auto object-contain brightness-125" />
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none select-none">
          <span className="font-['Shippori_Mincho',serif] text-[28vw] font-black">武士道</span>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2.5 py-1.5 pl-2 pr-4 rounded-full border border-white/30 bg-white/10 mb-6">
            <TagMark />
            <span className="font-['Noto_Sans_JP',sans-serif] text-[11px] tracking-[0.28em] uppercase font-bold text-white">
              AIESEC IN SLIIT · CATALYST 7.0
            </span>
          </div>

          <h2 className="font-serif text-[clamp(2.6rem,8.5vw,7.5rem)] font-extrabold uppercase leading-[0.92] tracking-tight mb-6">
            DARE BEYOND <br />
            <span className="italic font-light opacity-95">DEFINITION</span>
          </h2>

          <p className="font-sans text-sm sm:text-lg text-white/85 max-w-lg mx-auto leading-relaxed mb-10">
            Relive every moment of leadership, connection, and growth from Catalyst 7.0.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-white text-[#B51E23] hover:bg-[#FAF6EE] font-['Montserrat',sans-serif] text-xs font-bold tracking-[0.2em] uppercase shadow-[0_8px_25px_rgba(0,0,0,0.25)] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer group"
            >
              <span>REGISTER FOR EVENT</span>
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              to="/merch"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full border border-white/60 text-white hover:bg-white hover:text-[#B51E23] font-['Montserrat',sans-serif] text-xs font-bold tracking-[0.2em] uppercase transition-all cursor-pointer"
            >
              <ShoppingBag size={15} />
              <span>EXPLORE MERCH</span>
            </Link>
          </div>
        </div>
      </footer>

      <style>{`
        /* ---------- intro stage ---------- */
        .sg-layer{position:absolute;inset:0;overflow:hidden;background:#B51E23}
        .sg-layer .sg-img{position:absolute;inset:0;transform:scale(1.16);transform-origin:50% 50%;will-change:transform}
        .sg-img img{display:block;width:100%;height:100%;max-width:none;object-fit:cover}
        .sg-tint{position:absolute;inset:0;background:#B51E23;opacity:.62;pointer-events:none}
        .sg-word{position:absolute;left:6vw;bottom:10vh;color:#fff;font-family:'Shippori Mincho','Bison',Georgia,serif;font-weight:800;font-size:clamp(48px,13vw,190px);line-height:.9;letter-spacing:-.02em;text-transform:uppercase;opacity:0;will-change:transform,opacity;text-shadow:0 4px 28px rgba(0,0,0,.45)}
        .sg-word small{display:block;font-family:'Montserrat',sans-serif;font-size:clamp(11px,1.3vw,19px);letter-spacing:.45em;margin-bottom:1.2vh;font-weight:700;opacity:.92}

        /* ---------- chapter bands ---------- */
        .sg-band{background:#B51E23;color:#fff;height:clamp(140px,24vh,220px);display:flex;align-items:center;overflow:hidden;position:relative}
        .sg-band-bg{position:absolute;inset:0;overflow:hidden;z-index:1;pointer-events:none}
        .sg-band-img{width:100%;height:100%;max-width:none;object-fit:cover;opacity:.32;filter:contrast(120%) grayscale(15%);transform:scale(1.05)}
        .sg-band-overlay{position:absolute;inset:0;background:linear-gradient(135deg,rgba(181,30,35,.92) 0%,rgba(143,23,27,.95) 100%)}
        .sg-band .sg-row{flex:none;position:relative;z-index:2;white-space:nowrap;font-family:'Bison','Shippori Mincho',sans-serif;font-weight:700;text-transform:uppercase;font-size:clamp(52px,11vw,130px);letter-spacing:-.01em;will-change:transform;transform:translate3d(-20%,0,0)}
        .sg-band .sg-row span{margin-right:.35em}
        .sg-band .sg-row span:nth-child(even){-webkit-text-stroke:1.5px #fff;color:transparent}
        .sg-band .sg-no{position:absolute;z-index:2;top:clamp(12px,2.5vh,20px);left:5vw;letter-spacing:.35em;font-size:11px;font-family:'Montserrat',sans-serif;font-weight:700;text-transform:uppercase;opacity:.9}

        /* ---------- mosaic ---------- */
        .sg-grid{display:grid;grid-template-columns:repeat(12,1fr);grid-auto-rows:17vw;gap:12px;padding:12px;grid-auto-flow:dense;background:#FAF6EE}
        .sg-tile{position:relative;overflow:hidden;background:#6a0f13;border-radius:4px}
        /* parallax layer (JS moves it); hover zoom lives on the <img> so the two never fight */
        .sg-par{position:absolute;left:0;right:0;top:-12%;height:124%;will-change:transform}
        .sg-par img{display:block;width:100%;height:100%;max-width:none;object-fit:cover;transition:transform .7s cubic-bezier(.22,1,.36,1)}
        @media (hover:hover){.sg-tile:hover .sg-par img{transform:scale(1.05)}}
        .sg-tile::after{content:"";position:absolute;inset:0;background:#B51E23;transform:translate3d(0,0,0);transition:transform .85s .08s cubic-bezier(.77,0,.18,1);z-index:2;pointer-events:none;will-change:transform}
        .sg-tile.in::after{transform:translate3d(101%,0,0)}
        .sg-tile:nth-child(even).in::after{transform:translate3d(-101%,0,0)}
        .sg-tile.in::after{will-change:auto}
        .sg-tile i{position:absolute;z-index:3;left:14px;bottom:12px;color:#fff;font-style:normal;font-family:'Montserrat',sans-serif;font-size:12px;font-weight:700;letter-spacing:.25em;text-shadow:0 1px 8px rgba(0,0,0,.6)}

        @media (max-width:700px){
          .sg-grid{grid-template-columns:1fr 1fr;grid-auto-rows:60vw;gap:8px;padding:8px}
          .sg-tile{grid-column:span 1 !important;grid-row:span 1 !important}
        }
        @media (prefers-reduced-motion:reduce){
          .sg-tile::after{display:none}
          .sg-par img{transition:none}
        }
      `}</style>
    </div>
  );
};

export default GalleryPage;