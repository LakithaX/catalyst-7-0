import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import { RegistrationModal } from '../components/RegistrationModal';

// Authentic Catalyst 7.0 seminar photographs
const GALLERY_IMAGES = [
  "/assets/catalyst-gallery/616083505_1268080465365864_3783241921869610059_n.jpg",
  "/assets/catalyst-gallery/616103586_1268087452031832_3118584779969684260_n.jpg",
  "/assets/catalyst-gallery/616116748_1268080568699187_3100398452053345518_n.jpg",
  "/assets/catalyst-gallery/616233471_1268080295365881_7557058301924341156_n.jpg",
  "/assets/catalyst-gallery/616368520_1268080855365825_4465401467840168462_n.jpg",
  "/assets/catalyst-gallery/616439277_1268082045365706_8706912413091711333_n.jpg",
  "/assets/catalyst-gallery/616463195_1268085945365316_7407533435333699472_n.jpg",
  "/assets/catalyst-gallery/616492035_1268080355365875_606194234428780138_n.jpg",
  "/assets/catalyst-gallery/616529329_1268081438699100_5464235221991506990_n.jpg",
  "/assets/catalyst-gallery/616849073_1268080215365889_1394999945882788592_n.jpg",
  "/assets/catalyst-gallery/616852935_1268091818698062_1811121035233834010_n.jpg",
  "/assets/catalyst-gallery/616856062_1268081038699140_5408968865674764265_n.jpg",
  "/assets/catalyst-gallery/616938786_1268082428699001_1398486345666317073_n.jpg",
  "/assets/catalyst-gallery/617017153_1268086832031894_3502562285613882645_n.jpg",
  "/assets/catalyst-gallery/617067996_1268080292032548_6936022336367251590_n.jpg",
  "/assets/catalyst-gallery/617073686_1268080668699177_4597045561927655998_n.jpg",
  "/assets/catalyst-gallery/617331461_1268082458698998_896025517703704603_n.jpg",
  "/assets/catalyst-gallery/617463058_1268088075365103_8693645449087459401_n.jpg",
  "/assets/catalyst-gallery/617690261_1268080958699148_3647200086711209687_n.jpg",
  "/assets/catalyst-gallery/617989634_1268081025365808_4863939880060285824_n.jpg",
  "/assets/catalyst-gallery/618023942_1268081702032407_3520266089466034488_n.jpg",
  "/assets/catalyst-gallery/618493767_1268092525364658_3596371227146674634_n.jpg",
  "/assets/catalyst-gallery/618825259_1268080638699180_784931987486560934_n.jpg",
  "/assets/catalyst-gallery/619246052_1268080425365868_5507811270348967850_n.jpg",
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
  {
    name: "PLENARY",
    kanji: "総会",
    bg: "/assets/catalyst-gallery/616529329_1268081438699100_5464235221991506990_n.jpg",
  },
  {
    name: "WORKSHOPS",
    kanji: "研鑽",
    bg: "/assets/catalyst-gallery/616856062_1268081038699140_5408968865674764265_n.jpg",
  },
  {
    name: "TEAMBUILDING",
    kanji: "結束",
    bg: "/assets/catalyst-gallery/616233471_1268080295365881_7557058301924341156_n.jpg",
  },
  {
    name: "CELEBRATION",
    kanji: "祝祭",
    bg: "/assets/catalyst-gallery/616103586_1268087452031832_3118584779969684260_n.jpg",
  },
];

const N = 10;
const SPANS: [number, number][] = [
  [7, 2],
  [5, 1],
  [5, 1],
  [6, 1],
  [6, 1],
];

export const GalleryPage: React.FC = () => {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const cntRef = useRef<HTMLSpanElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const chaptersHostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    const intro = introRef.current;
    const bar = barRef.current;
    const cnt = cntRef.current;
    const hint = hintRef.current;
    const host = chaptersHostRef.current;
    if (!stage || !intro || !bar || !cnt || !hint || !host) return;

    // Clear previous DOM if hot-reloading
    stage.querySelectorAll('.sg-layer').forEach((el) => el.remove());
    host.innerHTML = '';

    // Build intro layers
    const layers: {
      el: HTMLDivElement;
      img: HTMLImageElement;
      tint: HTMLDivElement;
      word: HTMLDivElement;
    }[] = [];

    for (let k = 0; k < N; k++) {
      const d = document.createElement('div');
      d.className = 'sg-layer';
      d.style.zIndex = String(k + 1);
      d.innerHTML = `
        <img alt="${INTRO_WORDS[k].word}" src="${getImageSrc(k)}" class="sg-img" />
        <div class="sg-tint"></div>
        <div class="sg-word">
          <small>${INTRO_WORDS[k].sub}</small>
          ${INTRO_WORDS[k].word}
        </div>
      `;
      stage.appendChild(d);
      layers.push({
        el: d,
        img: d.querySelector('img')!,
        tint: d.querySelector('.sg-tint')!,
        word: d.querySelector('.sg-word')!,
      });
    }

    const wipes = [
      (e: number) => `inset(0 ${100 - e * 100}% 0 0)`,
      (e: number) => `inset(0 0 ${100 - e * 100}% 0)`,
      (e: number) => `inset(0 0 0 ${100 - e * 100}%)`,
      (e: number) => `inset(${100 - e * 100}% 0 0 0)`,
      (e: number) => `circle(${e * 85}% at 50% 50%)`,
    ];

    const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    // Build chapter bands and mosaic grids
    CHAPTERS.forEach((ch, c) => {
      const band = document.createElement('div');
      band.className = 'sg-band';
      band.innerHTML = `
        <div class="sg-band-bg">
          <img src="${ch.bg}" alt="${ch.name}" class="sg-band-img" />
          <div class="sg-band-overlay"></div>
        </div>
        <div class="sg-no">0${c + 1} / 04 · ${ch.kanji}</div>
        <div class="sg-row">${`<span>${ch.name}</span>`.repeat(4)}</div>
      `;
      host.appendChild(band);

      const g = document.createElement('div');
      g.className = 'sg-grid';

      for (let j = 0; j < 10; j++) {
        const idx = N + c * 10 + j;
        const [cs, rs] = SPANS[j % 5];
        const t = document.createElement('div');
        t.className = 'sg-tile';
        t.style.gridColumn = `span ${cs}`;
        t.style.gridRow = `span ${rs}`;
        t.innerHTML = `
          <img decoding="async" alt="Catalyst 7.0 Seminar Moment" src="${getImageSrc(idx)}">
          <i>${String(idx + 1).padStart(2, '0')}</i>
        `;
        g.appendChild(t);
      }
      host.appendChild(g);
    });

    // Reveal animation on scroll entry with generous pre-trigger buffer
    const tiles = host.querySelectorAll<HTMLDivElement>('.sg-tile');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: '380px 0px 380px 0px', threshold: 0.01 }
    );
    tiles.forEach((t) => io.observe(t));

    const rows = host.querySelectorAll<HTMLDivElement>('.sg-band .sg-row');

    let ticking = false;

    function onScrollFrame() {
      ticking = false;
      if (!intro || !bar || !cnt || !hint) return;
      const vh = window.innerHeight;
      const y = window.scrollY;
      const total = intro.offsetHeight - vh;

      if (total > 0) {
        const p = clamp(y / total);
        const f = p * (N - 0.0001);
        const cur = Math.min(N - 1, Math.floor(f));

        layers.forEach((L, k) => {
          const raw = f - k + (k === 0 ? 1 : 0);
          const e = ease(clamp(raw * 2.2));
          L.el.style.clipPath =
            e <= 0 ? 'inset(0 0 0 100%)' : e >= 1 ? 'none' : wipes[k % wipes.length](e);
          L.img.style.transform = `scale(${1 + (1 - clamp(raw * 0.9)) * 0.16})`;
          L.tint.style.opacity = String(clamp(1 - (raw - 0.25) * 1.1));
          const w = ease(clamp((raw - 0.1) * 2));
          L.word.style.opacity = String(w);
          L.word.style.transform = `translateY(${(1 - w) * 55}px)`;
        });

        bar.style.width = `${p * 100}%`;
        cnt.textContent = `${String(cur + 1).padStart(2, '0')} / ${N}`;
        hint.style.opacity = y > 50 ? '0' : '1';
      }

      // Parallax for marquee bands
      rows.forEach((r) => {
        const b = r.parentElement?.getBoundingClientRect();
        if (b) {
          r.style.transform = `translateX(${(b.top - vh / 2) * -0.35 - 200}px)`;
        }
      });

      // Parallax for mosaic tiles
      tiles.forEach((t) => {
        const r = t.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        const img = t.querySelector('img');
        if (img) {
          img.style.transform = `translateY(${(r.top + r.height / 2 - vh / 2) * -0.07}px)`;
        }
      });
    }

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(onScrollFrame);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', onScrollFrame);
    onScrollFrame();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', onScrollFrame);
      io.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full bg-[#FAF6EE] text-[#252321] select-none min-h-screen">
      {/* Sticky Global Navigation */}
      <Navbar />

      {/* ── Intro Cinematic Scroll Stage (1100vh) ── */}
      <section id="intro" ref={introRef} className="relative h-[1100vh]">
        <div ref={stageRef} id="stage" className="sticky top-0 h-[100svh] overflow-hidden bg-[#B51E23]">
          {/* Head-Up Display (HUD) */}
          <div className="absolute z-40 top-6 sm:top-8 left-5 sm:left-10 right-5 sm:right-10 flex justify-between items-center text-white text-xs sm:text-sm tracking-[0.3em] uppercase font-['Montserrat',sans-serif] font-bold mix-blend-difference pointer-events-none">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              CATALYST 7.0 · MEMORIES
            </span>
            <span id="cnt" ref={cntRef}>
              01 / 10
            </span>
          </div>

          {/* Bottom Progress Bar */}
          <div ref={barRef} id="bar" className="absolute z-40 left-0 bottom-0 h-1.5 bg-[#FFFFFF] w-0 transition-all duration-75" />

          {/* Scroll Down Hint */}
          <div ref={hintRef} id="hint" className="absolute z-40 right-5 sm:right-10 bottom-6 sm:bottom-10 text-white tracking-[0.3em] text-[11px] sm:text-xs uppercase font-['Montserrat',sans-serif] font-bold transition-opacity duration-300 pointer-events-none">
            Scroll Down ↓
          </div>
        </div>
      </section>

      {/* ── Mosaic Chapters Host Container ── */}
      <div id="chapters" ref={chaptersHostRef} className="relative z-20 w-full" />

      {/* ── Editorial Outro / Footer Section ── */}
      <footer className="relative bg-[#B51E23] text-white text-center py-24 sm:py-36 px-6 overflow-hidden">
        {/* Full-bleed Celebration Photograph Backdrop */}
        <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
          <img
            src="/assets/catalyst-gallery/617331461_1268082458698998_896025517703704603_n.jpg"
            alt="Catalyst Celebration Moment"
            className="w-full h-full object-cover opacity-20 filter contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#B51E23]/90 via-[#B51E23]/95 to-[#8F171B]" />
        </div>

        {/* Soft Japanese Mon Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none select-none">
          <span className="font-['Shippori_Mincho',serif] text-[28vw] font-black">
            武士道
          </span>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/30 bg-white/10 backdrop-blur-xs mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            <span className="font-['Noto_Sans_JP',sans-serif] text-[11px] tracking-[0.28em] uppercase font-bold text-white">
              AIESEC IN SLIIT · CATALYST 7.0
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>

          <h2 className="font-serif text-[clamp(2.6rem,8.5vw,7.5rem)] font-extrabold uppercase leading-[0.92] tracking-tight mb-6">
            DARE BEYOND <br />
            <span className="italic font-light opacity-95">DEFINITION</span>
          </h2>

          <p className="font-sans text-sm sm:text-lg text-white/85 max-w-lg mx-auto leading-relaxed mb-10">
            Relive every moment of leadership, connection, and growth from Catalyst 7.0.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <button
              onClick={() => setIsRegisterOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-white text-[#B51E23] hover:bg-[#FAF6EE] font-['Montserrat',sans-serif] text-xs font-bold tracking-[0.2em] uppercase shadow-[0_8px_25px_rgba(0,0,0,0.25)] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer group"
            >
              <span>REGISTER FOR EVENT</span>
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </button>

            <Link
              to="/merch"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full border border-white/60 text-white hover:bg-white hover:text-[#B51E23] font-['Montserrat',sans-serif] text-xs font-bold tracking-[0.2em] uppercase transition-all cursor-pointer backdrop-blur-xs"
            >
              <ShoppingBag size={15} />
              <span>EXPLORE MERCH</span>
            </Link>
          </div>
        </div>
      </footer>

      {/* Registration Modal */}
      <RegistrationModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />

      {/* Scoped High-Performance CSS matching Garden Wedding Scroll Gallery Engine */}
      <style>{`
        .sg-layer {
          position: absolute;
          inset: 0;
          will-change: clip-path;
        }
        .sg-layer img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          will-change: transform;
        }
        .sg-tint {
          position: absolute;
          inset: 0;
          background: #B51E23;
          mix-blend-mode: multiply;
          will-change: opacity;
        }
        .sg-word {
          position: absolute;
          left: 6vw;
          bottom: 10vh;
          color: #FFFFFF;
          font-family: 'Shippori Mincho', 'Bison', Georgia, serif;
          font-weight: 800;
          font-size: clamp(48px, 13vw, 190px);
          line-height: 0.9;
          letter-spacing: -0.02em;
          text-transform: uppercase;
          will-change: transform, opacity;
          text-shadow: 0 4px 28px rgba(0,0,0,0.45);
        }
        .sg-word small {
          display: block;
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(11px, 1.3vw, 19px);
          letter-spacing: 0.45em;
          margin-bottom: 1.2vh;
          font-weight: 700;
          opacity: 0.92;
        }
        .sg-band {
          background: #B51E23;
          color: #FFFFFF;
          height: clamp(140px, 24vh, 220px);
          display: flex;
          align-items: center;
          overflow: hidden;
          position: relative;
        }
        .sg-band-bg {
          position: absolute;
          inset: 0;
          overflow: hidden;
          z-index: 1;
          pointer-events: none;
        }
        .sg-band-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.32;
          filter: contrast(120%) grayscale(15%);
          transform: scale(1.05);
        }
        .sg-band-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(181, 30, 35, 0.92) 0%, rgba(143, 23, 27, 0.95) 100%);
          mix-blend-mode: multiply;
        }
        .sg-band .sg-row {
          position: relative;
          z-index: 2;
          white-space: nowrap;
          font-family: 'Bison', 'Shippori Mincho', sans-serif;
          font-weight: 700;
          text-transform: uppercase;
          font-size: clamp(52px, 11vw, 130px);
          letter-spacing: -0.01em;
          will-change: transform;
        }
        .sg-band .sg-row span {
          margin-right: 0.35em;
        }
        .sg-band .sg-row span:nth-child(even) {
          -webkit-text-stroke: 1.5px #FFFFFF;
          color: transparent;
        }
        .sg-band .sg-no {
          position: absolute;
          z-index: 2;
          top: clamp(12px, 2.5vh, 20px);
          left: 5vw;
          letter-spacing: 0.35em;
          font-size: 11px;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          text-transform: uppercase;
          opacity: 0.9;
        }
        .sg-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          grid-auto-rows: 17vw;
          gap: 12px;
          padding: 12px;
          grid-auto-flow: dense;
          background: #FAF6EE;
        }
        .sg-tile {
          position: relative;
          overflow: hidden;
          background: #181514;
          border-radius: 4px;
        }
        .sg-tile img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .sg-tile:hover img {
          transform: scale(1.04);
        }
        .sg-tile::after {
          content: "";
          position: absolute;
          inset: 0;
          background: #B51E23;
          transform: translateX(0);
          transition: transform 0.85s 0.08s cubic-bezier(0.77, 0, 0.18, 1);
          z-index: 2;
          pointer-events: none;
        }
        .sg-tile.in::after {
          transform: translateX(101%);
        }
        .sg-tile:nth-child(even)::after {
          transform: translateX(0);
        }
        .sg-tile:nth-child(even).in::after {
          transform: translateX(-101%);
        }
        .sg-tile img {
          position: absolute;
          left: 0;
          top: -12%;
          width: 100%;
          height: 124%;
          object-fit: cover;
          will-change: transform;
        }
        .sg-tile i {
          position: absolute;
          z-index: 3;
          left: 14px;
          bottom: 12px;
          color: #FFFFFF;
          font-style: normal;
          font-family: 'Montserrat', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.25em;
          text-shadow: 0 1px 8px rgba(0, 0, 0, 0.6);
        }
        @media (max-width: 700px) {
          .sg-grid {
            grid-template-columns: 1fr 1fr;
            grid-auto-rows: 60vw;
            gap: 8px;
            padding: 8px;
          }
          .sg-tile {
            grid-column: span 1 !important;
            grid-row: span 1 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default GalleryPage;
