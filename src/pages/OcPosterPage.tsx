import React, { useState, useLayoutEffect, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from '../components/Navbar';
import '../styles/oc-poster.css';

interface MemberData {
  name: string;
  role: string;
  image: string;
  aspect: number;
  pw: number;
  bottom?: string;
}

interface SectionData {
  id: string;
  navLabel: string;
  title: string;
  tag: string;
  watermark: string;
  members: MemberData[];
}

const SECTIONS: SectionData[] = [
  {
    id: 'leadership',
    navLabel: 'Leadership',
    title: 'LEADERSHIP',
    tag: 'PRESIDENCY & FINANCE',
    watermark: 'OC',
    members: [
      {
        name: 'Mahdy Hassan',
        role: 'Organizing Committee President (OCP)',
        image: '/assets/cat-oc-pics/mahdy-hassan-ocp.webp',
        aspect: 0.883,
        pw: 30,
        bottom: 'calc(-1 * var(--k))',
      },
      {
        name: 'Monali Edirisinghe',
        role: 'OCVP Finance',
        image: '/assets/cat-oc-pics/monali-edirisinghe-ocvp-finance.webp',
        aspect: 0.399,
        pw: 14,
        bottom: 'calc(-2.5 * var(--k))',
      },
    ],
  },
  {
    id: 'pd',
    navLabel: 'Partnership Dev',
    title: 'OCVP',
    tag: 'PARTNERSHIP DEVELOPMENT',
    watermark: 'OCVP',
    members: [
      {
        name: 'Nethuli Gunathilaka',
        role: 'OCVP Partnership Development',
        image: '/assets/cat-oc-pics/nethuli-gunathilaka-ocvp-pd.webp',
        aspect: 0.718,
        pw: 25,
        bottom: 'calc(-1 * var(--k))',
      },
      {
        name: 'Chetha Atapattu',
        role: 'OCVP Partnership Development',
        image: '/assets/cat-oc-pics/chetha-atapattu-ocvp-pd.webp',
        aspect: 0.740,
        pw: 25,
        bottom: 'calc(-1 * var(--k))',
      },
      {
        name: 'Vimarshi Suraweera',
        role: 'OCVP Partnership Development',
        image: '/assets/cat-oc-pics/vimarshi-ocvp-pd.webp',
        aspect: 0.833,
        pw: 28,
        bottom: 'calc(-1 * var(--k))',
      },
      {
        name: 'Gihansa Hasithmi',
        role: 'OCVP Partnership Development',
        image: '/assets/cat-oc-pics/gihansa-ocvp-pd.webp',
        aspect: 1.207,
        pw: 34,
        bottom: 'calc(-1 * var(--k))',
      },
      {
        name: 'Hari Branavan Arulnathan',
        role: 'OCVP Partnership Development',
        image: '/assets/cat-oc-pics/hari-ocvp-pd.webp',
        aspect: 0.931,
        pw: 31,
        bottom: 'calc(-2.5 * var(--k))',
      },
    ],
  },
  {
    id: 'marketing',
    navLabel: 'Marketing',
    title: 'OCVP',
    tag: 'MARKETING',
    watermark: 'OCVP',
    members: [
      {
        name: 'Harshitha Yasiru',
        role: 'OCVP Marketing',
        image: '/assets/cat-oc-pics/harshitha-yasiru-ocvp-marketing.webp',
        aspect: 0.708,
        pw: 25,
        bottom: 'calc(-1 * var(--k))',
      },
      {
        name: 'Isuri Naveesha',
        role: 'OCVP Marketing',
        image: '/assets/cat-oc-pics/isuri-walpola-ocvp-marketing.webp',
        aspect: 0.739,
        pw: 25,
        bottom: 'calc(-1 * var(--k))',
      },
      {
        name: 'Dahamsa Peiris',
        role: 'OCVP Marketing',
        image: '/assets/cat-oc-pics/dahamsa-ocvp-marketing.webp',
        aspect: 1.015,
        pw: 32,
        bottom: 'calc(-1 * var(--k))',
      },
      {
        name: 'Kaveesha Miran',
        role: 'OCVP Marketing',
        image: '/assets/cat-oc-pics/miran-ocvp-marketing.webp',
        aspect: 0.662,
        pw: 23,
        bottom: 'calc(-2.5 * var(--k))',
      },
    ],
  },
  {
    id: 'del-events',
    navLabel: 'Del & Events',
    title: 'OCVP',
    tag: 'DEL & EVENTS',
    watermark: 'OCVP',
    members: [
      {
        name: 'Vindhi Akmeemana',
        role: 'OCVP Del & Events',
        image: '/assets/cat-oc-pics/vindhi-akmeemana-ocvp-delegates-and-events.webp',
        aspect: 0.608,
        pw: 21,
        bottom: 'calc(-1 * var(--k))',
      },
      {
        name: 'Binushi Wikramarathne',
        role: 'OCVP Del & Events',
        image: '/assets/cat-oc-pics/binushi-ocvp-delegates-and-events.webp',
        aspect: 0.601,
        pw: 21,
        bottom: 'calc(-1 * var(--k))',
      },
      {
        name: 'Tharuka Liyanage',
        role: 'OCVP Del & Events',
        image: '/assets/cat-oc-pics/tharuka-ocvp-delegates-and-events.webp',
        aspect: 0.671,
        pw: 23,
        bottom: 'calc(-1 * var(--k))',
      },
      {
        name: 'Isuri Muthumalee',
        role: 'OCVP Del & Events',
        image: '/assets/cat-oc-pics/isuri-muthumalee-ocvp-delegates-and-events.webp',
        aspect: 0.904,
        pw: 30,
        bottom: 'calc(-2.5 * var(--k))',
      },
    ],
  },
  {
    id: 'del-log',
    navLabel: 'Del & Log',
    title: 'OCVP',
    tag: 'DEL & LOG',
    watermark: 'OCVP',
    members: [
      {
        name: 'Adithya Munasinghe',
        role: 'OCVP Del & Log',
        image: '/assets/cat-oc-pics/adithya-ocvp-del-x-log.webp',
        aspect: 0.565,
        pw: 20,
        bottom: 'calc(-2.5 * var(--k))',
      },
    ],
  },
  {
    id: 'logistics',
    navLabel: 'Logistics',
    title: 'OCVP',
    tag: 'LOGISTICS',
    watermark: 'OCVP',
    members: [
      {
        name: 'Yehan De Silva',
        role: 'OCVP Logistics',
        image: '/assets/cat-oc-pics/yehan-ocvp-logistics.webp',
        aspect: 0.400,
        pw: 14,
        bottom: 'calc(-1 * var(--k))',
      },
      {
        name: 'Maneesha Gunathilake',
        role: 'OCVP Logistics',
        image: '/assets/cat-oc-pics/maneesha-ocvp-logistics.webp',
        aspect: 0.563,
        pw: 20,
        bottom: 'calc(-1 * var(--k))',
      },
      {
        name: 'Lakwan Wijegunawardana',
        role: 'OCVP Logistics',
        image: '/assets/cat-oc-pics/lakwan-ocvp-logistics.webp',
        aspect: 0.654,
        pw: 23,
        bottom: 'calc(-1 * var(--k))',
      },
    ],
  },
];

export default function OcPosterPage() {
  const posterRef = useRef<HTMLDivElement>(null);
  const [isRevealing, setIsRevealing] = useState(true);
  const [activeSection, setActiveSection] = useState<string>('leadership');

  // Always scroll to top immediately upon mounting
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsRevealing(false), 420);
    return () => clearTimeout(timer);
  }, []);

  // Build the jagged torn-paper clip paths using the mathematical algorithm per section
  useLayoutEffect(() => {
    const posterEl = posterRef.current;
    if (!posterEl) return;

    const buildTornPaper = () => {
      const sectionEls = posterEl.querySelectorAll<HTMLElement>('.poster-section');
      if (sectionEls.length === 0) return;

      const knProp = getComputedStyle(posterEl).getPropertyValue('--kn');
      const kn = +(knProp || 1);
      const R = 30 * kn; // row height is 30 * var(--k)
      const En = 8 * kn;
      const H = 37 * kn;
      const g = 1.15 * (0.5 + 0.5 * kn);
      const s = 0.5 + 0.5 * kn;

      const N = 110;
      function rnd(seed: number) {
        return function () {
          seed |= 0;
          seed = (seed + 0x6d2b79f5) | 0;
          let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
          t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
          return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
      }

      function jag(r: () => number, seedOffset: number) {
        const a: number[] = [];
        for (let i = 0; i <= N; i++) {
          a.push(
            r() - 0.5 +
              0.4 * Math.sin(i * 0.35 + seedOffset) +
              (r() > 0.9 ? (r() - 0.5) * 1.8 : 0)
          );
        }
        return a;
      }

      function line(
        ed: { k: number; a: number[]; b: number[] },
        arr: number[],
        base: number,
        rev?: boolean
      ) {
        const o: string[] = [];
        for (let q = 0; q <= N; q++) {
          const x = q / N;
          o.push(
            (x * 100).toFixed(2) +
              '% ' +
              (base + kn * ed.k * (x - 0.5) + s * arr[q]).toFixed(2) +
              'cqw'
          );
        }
        return rev ? o.reverse() : o;
      }

      sectionEls.forEach((secEl, sIdx) => {
        const headEl = secEl.querySelector('.head') as HTMLElement;
        const rowEls = secEl.querySelectorAll('.row');
        if (!headEl || rowEls.length === 0) return;

        const E: { k: number; a: number[]; b: number[] }[] = [];
        for (let e = 0; e <= rowEls.length; e++) {
          const r = rnd((sIdx + 1) * 500 + e * 97 + 13);
          E.push({
            k: e % 2 ? 3 : -12.5,
            a: jag(r, e * 2),
            b: jag(r, e * 2 + 3),
          });
        }

        headEl.style.clipPath =
          'polygon(0% 0, 100% 0, ' +
          line(E[0], E[0].a, H - g, true).join(',') +
          ')';

        rowEls.forEach((row, i) => {
          const bg = row.querySelector('.bg') as HTMLElement;
          const picWrap = row.querySelector('.pic-wrap') as HTMLElement;
          const isLastRow = i === rowEls.length - 1;
          const isLastSection = sIdx === sectionEls.length - 1;

          if (bg && E[i] && E[i + 1]) {
            if (isLastRow && !isLastSection) {
              // Seamlessly extend dark red to the bottom of the row so it connects with the SVG divider below
              bg.style.clipPath =
                'polygon(' +
                line(E[i], E[i].b, En + g)
                  .concat(['100% 100%', '0% 100%'])
                  .join(',') +
                ')';
            } else {
              bg.style.clipPath =
                'polygon(' +
                line(E[i], E[i].b, En + g)
                  .concat(line(E[i + 1], E[i + 1].a, En + R - g, true))
                  .join(',') +
                ')';
            }
          }
          if (picWrap && E[i + 1]) {
            if (isLastRow && !isLastSection) {
              // Last row of a section: don't clip the portrait in mid-air!
              // Allow the portrait to extend seamlessly down and tuck cleanly behind the section divider
              picWrap.style.clipPath = 'none';
            } else {
              // Bottom white line cuts the image so it doesn't show past the white line
              picWrap.style.clipPath =
                'polygon(0% -200%, 100% -200%, ' +
                line(E[i + 1], E[i + 1].a, R - g, true).join(',') +
                ')';
            }
          }
        });
      });
    };

    buildTornPaper();
    window.addEventListener('resize', buildTornPaper);
    return () => window.removeEventListener('resize', buildTornPaper);
  }, []);

  // Entrance animations via IntersectionObserver (triggers whenever scrolling up or down)
  useEffect(() => {
    const posterEl = posterRef.current;
    if (!posterEl) return;

    const rowEls = posterEl.querySelectorAll('.row');
    const container = document.querySelector('.oc-poster-page');

    if (
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
      'IntersectionObserver' in window
    ) {
      container?.classList.add('anim');
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('in');
            } else {
              entry.target.classList.remove('in');
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -4% 0px' }
      );

      rowEls.forEach((r) => io.observe(r));
      return () => io.disconnect();
    }
  }, []);

  // Active section tracking during scrolling
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 180;
      for (const sec of SECTIONS) {
        const el = document.getElementById(sec.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sec.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -130;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  let globalMemberCounter = 0;

  return (
    <div className="oc-poster-page anim">
      {/* Reveal Curtain on Entrance */}
      <AnimatePresence>
        {isRevealing && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[100] bg-gradient-to-b from-[#b21335] via-[#9a0d2a] to-[#7a0a1e] flex flex-col items-center justify-center pointer-events-none select-none"
          >
            <motion.div
              initial={{ opacity: 1, scale: 1 }}
              animate={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="text-center px-4"
            >
              <p className="font-['Permanent_Marker'] text-white/50 text-3xl sm:text-5xl tracking-widest">
                CATALYST 7.0
              </p>
              <h2 className="font-['Oswald'] text-white text-2xl sm:text-4xl tracking-widest uppercase italic font-bold mt-2">
                ORGANIZING COMMITTEE
              </h2>
              <div className="w-20 h-1 bg-white/70 mx-auto mt-4 rounded-full" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Navbar />

      {/* Sticky Department Jump Bar */}
      <div className="sticky top-16 sm:top-20 z-40 w-full px-4 py-2.5 bg-[#F8F3E9]/95 backdrop-blur-md border-b border-[#252321]/10 flex items-center justify-center shadow-xs transition-colors">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto max-w-5xl py-0.5 px-1 no-scrollbar text-xs sm:text-sm font-['Oswald'] uppercase tracking-wider">
          {SECTIONS.map((sec) => (
            <button
              key={sec.id}
              onClick={() => scrollToSection(sec.id)}
              className={`px-3 py-1.5 rounded-full font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                activeSection === sec.id
                  ? 'bg-[#b21335] text-white shadow-md scale-105'
                  : 'text-[#252321]/70 hover:text-[#b21335] hover:bg-[#b21335]/10'
              }`}
            >
              {sec.navLabel}
            </button>
          ))}
        </div>
      </div>

      <div className="page">
        <main className="poster" ref={posterRef}>
          {SECTIONS.map((section, sIdx) => (
            <section key={section.id} id={section.id} className="poster-section">
              {/* Seamless dark red torn-paper divider at the top of OCVP sections */}
              {sIdx > 0 && (
                <div className="w-full overflow-hidden leading-none -mt-1 -mb-3 sm:-mb-5 md:-mb-7 relative z-20 pointer-events-none">
                  <svg
                    viewBox="0 0 1200 48"
                    preserveAspectRatio="none"
                    className="w-full h-6 sm:h-9 md:h-12 block overflow-visible"
                  >
                    <path
                      d="M 0 0 L 0 32 C 2.5 29.7, 8.3 17.3, 15 18 C 21.7 18.7, 30.8 35.7, 40 36 C 49.2 36.3, 60.0 18.7, 70 20 C 80.0 21.3, 90.0 43.7, 100 44 C 110.0 44.3, 120.0 23.0, 130 22 C 140.0 21.0, 150.0 38.7, 160 38 C 170.0 37.3, 180.0 17.3, 190 18 C 200.0 18.7, 210.0 41.3, 220 42 C 230.0 42.7, 240.0 22.3, 250 22 C 260.0 21.7, 270.0 40.7, 280 40 C 290.0 39.3, 300.0 17.3, 310 18 C 320.0 18.7, 330.0 43.0, 340 44 C 350.0 45.0, 360.0 25.0, 370 24 C 380.0 23.0, 390.0 38.7, 400 38 C 410.0 37.3, 420.0 19.3, 430 20 C 440.0 20.7, 450.0 42.3, 460 42 C 470.0 41.7, 480.0 18.7, 490 18 C 500.0 17.3, 510.0 37.3, 520 38 C 530.0 38.7, 540.0 21.0, 550 22 C 560.0 23.0, 570.0 45.0, 580 44 C 590.0 43.0, 600.0 16.7, 610 16 C 620.0 15.3, 630.0 38.7, 640 40 C 650.0 41.3, 660.0 23.7, 670 24 C 680.0 24.3, 690.0 43.0, 700 42 C 710.0 41.0, 720.0 18.7, 730 18 C 740.0 17.3, 750.0 37.7, 760 38 C 770.0 38.3, 780.0 19.0, 790 20 C 800.0 21.0, 810.0 43.7, 820 44 C 830.0 44.3, 840.0 22.7, 850 22 C 860.0 21.3, 870.0 40.7, 880 40 C 890.0 39.3, 900.0 18.3, 910 18 C 920.0 17.7, 930.0 36.7, 940 38 C 950.0 39.3, 960.0 25.0, 970 26 C 980.0 27.0, 990.0 45.7, 1000 44 C 1010.0 42.3, 1020.0 17.3, 1030 16 C 1040.0 14.7, 1050.0 35.0, 1060 36 C 1070.0 37.0, 1080.0 21.0, 1090 22 C 1100.0 23.0, 1110.0 42.7, 1120 42 C 1130.0 41.3, 1140.8 18.7, 1150 18 C 1159.2 17.3, 1166.7 37.0, 1175 38 C 1183.3 39.0, 1195.8 26.3, 1200 24 L 1200 0 Z"
                      fill="#9a0d2a"
                    />
                    <path
                      d="M 0 32 C 2.5 29.7, 8.3 17.3, 15 18 C 21.7 18.7, 30.8 35.7, 40 36 C 49.2 36.3, 60.0 18.7, 70 20 C 80.0 21.3, 90.0 43.7, 100 44 C 110.0 44.3, 120.0 23.0, 130 22 C 140.0 21.0, 150.0 38.7, 160 38 C 170.0 37.3, 180.0 17.3, 190 18 C 200.0 18.7, 210.0 41.3, 220 42 C 230.0 42.7, 240.0 22.3, 250 22 C 260.0 21.7, 270.0 40.7, 280 40 C 290.0 39.3, 300.0 17.3, 310 18 C 320.0 18.7, 330.0 43.0, 340 44 C 350.0 45.0, 360.0 25.0, 370 24 C 380.0 23.0, 390.0 38.7, 400 38 C 410.0 37.3, 420.0 19.3, 430 20 C 440.0 20.7, 450.0 42.3, 460 42 C 470.0 41.7, 480.0 18.7, 490 18 C 500.0 17.3, 510.0 37.3, 520 38 C 530.0 38.7, 540.0 21.0, 550 22 C 560.0 23.0, 570.0 45.0, 580 44 C 590.0 43.0, 600.0 16.7, 610 16 C 620.0 15.3, 630.0 38.7, 640 40 C 650.0 41.3, 660.0 23.7, 670 24 C 680.0 24.3, 690.0 43.0, 700 42 C 710.0 41.0, 720.0 18.7, 730 18 C 740.0 17.3, 750.0 37.7, 760 38 C 770.0 38.3, 780.0 19.0, 790 20 C 800.0 21.0, 810.0 43.7, 820 44 C 830.0 44.3, 840.0 22.7, 850 22 C 860.0 21.3, 870.0 40.7, 880 40 C 890.0 39.3, 900.0 18.3, 910 18 C 920.0 17.7, 930.0 36.7, 940 38 C 950.0 39.3, 960.0 25.0, 970 26 C 980.0 27.0, 990.0 45.7, 1000 44 C 1010.0 42.3, 1020.0 17.3, 1030 16 C 1040.0 14.7, 1050.0 35.0, 1060 36 C 1070.0 37.0, 1080.0 21.0, 1090 22 C 1100.0 23.0, 1110.0 42.7, 1120 42 C 1130.0 41.3, 1140.8 18.7, 1150 18 C 1159.2 17.3, 1166.7 37.0, 1175 38 C 1183.3 39.0, 1195.8 26.3, 1200 24"
                      fill="none"
                      stroke="#000000"
                      strokeWidth="4.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                </div>
              )}

              <header className="head">
                <p className="wm" aria-hidden="true">
                  {section.watermark}
                </p>
                <h1 className="ttl">
                  {section.title}
                  <span aria-hidden="true">&#10043;</span>
                </h1>
                <p className="tag">{section.tag}</p>
              </header>

              <div className="rows">
                {section.members.map((member, index) => {
                  const overallIndex = globalMemberCounter++;
                  const first = member.name.split(' ')[0].toUpperCase();
                  const fs = Math.min(31, 189 / first.length);
                  const isOdd = index % 2 !== 0;

                  return (
                    <section
                      key={member.name}
                      className={`row ${isOdd ? 'r' : 'l'}`}
                      style={
                        {
                          '--ph': `url('${member.image}')`,
                          '--ar': member.aspect,
                          '--pw': member.pw,
                          '--p-bot': member.bottom || 'calc(-1 * var(--k))',
                          '--row-delay': `${Math.min(index, 2) * 0.12}s`,
                        } as React.CSSProperties
                      }
                    >
                      <div className="bg" aria-hidden="true">
                        <span
                          className="big"
                          style={{ fontSize: `calc(${fs.toFixed(1)} * var(--k))` }}
                        >
                          {first}
                        </span>
                        <i
                          className="ghost"
                          style={{ backgroundImage: `url('${member.image}')` }}
                        />
                      </div>
                      <div className="pic-wrap">
                        <div className="pic">
                          <i
                            role="img"
                            aria-label={member.name}
                            style={{ backgroundImage: `url('${member.image}')` }}
                          />
                          <img
                            src={member.image}
                            alt={member.name}
                            loading={overallIndex < 2 ? 'eager' : 'lazy'}
                            fetchPriority={overallIndex < 2 ? 'high' : 'auto'}
                            decoding="async"
                            className="pic-img"
                          />
                        </div>
                      </div>
                      <div className="nm">
                        <h2>{member.name}</h2>
                        <p>{member.role}</p>
                      </div>
                    </section>
                  );
                })}
              </div>
            </section>
          ))}

          {/* Outro / Back to Top */}
          <footer className="relative flex flex-col items-center justify-center py-16 px-6 text-center bg-white border-t border-[#b21335]/15 select-none mt-12">
            <p className="font-['Permanent_Marker'] text-[#b21335] text-2xl sm:text-3xl tracking-widest">
              CATALYST 7.0
            </p>
            <p className="font-['Oswald'] text-[#252321]/60 text-xs sm:text-sm tracking-widest uppercase mt-2">
              19 Leaders · One Vision · Dare Beyond Definition
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="mt-6 px-6 py-2.5 rounded-full bg-[#b21335] text-white font-['Oswald'] tracking-wider text-xs uppercase font-bold hover:bg-[#8f0d28] transition-all hover:scale-105 shadow-md cursor-pointer"
            >
              Scroll to Top ↑
            </button>
          </footer>
        </main>
      </div>
    </div>
  );
}
