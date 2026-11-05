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

const DATA: MemberData[] = [
  {
    name: 'Nethuli Gunathilaka',
    role: 'OCVP Partnership Development',
    image: '/assets/cat-oc-pics/nethuli-trimmed.png',
    aspect: 0.717,
    pw: 34,
  },
  {
    name: 'Chetha Atapattu',
    role: 'OCVP Partnership Development',
    image: '/assets/cat-oc-pics/chetha-trimmed.png',
    aspect: 0.74,
    pw: 34,
  },
  {
    name: 'Vimarshi Suraweera',
    role: 'OCVP Partnership Development',
    image: '/assets/cat-oc-pics/vimarshi-trimmed.png',
    aspect: 0.832,
    pw: 35,
  },
  {
    name: 'Gihansa Hasithmi',
    role: 'OCVP Partnership Development',
    image: '/assets/cat-oc-pics/gihansa-trimmed.png',
    aspect: 1.209,
    pw: 37,
    bottom: 'calc(-0.5 * var(--k))',
  },
  {
    name: 'Hari Branavan Arulnathan',
    role: 'OCVP Partnership Development',
    image: '/assets/cat-oc-pics/hari-trimmed.png',
    aspect: 0.931,
    pw: 35,
  },
];

export default function OcPosterPage() {
  const posterRef = useRef<HTMLDivElement>(null);
  const [isRevealing, setIsRevealing] = useState(true);

  // Always scroll to top immediately upon mounting
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsRevealing(false), 420);
    return () => clearTimeout(timer);
  }, []);

  // Build the jagged torn-paper clip paths using the mathematical algorithm
  useLayoutEffect(() => {
    const posterEl = posterRef.current;
    if (!posterEl) return;

    const buildTornPaper = () => {
      const headEl = posterEl.querySelector('.head') as HTMLElement;
      const rowEls = posterEl.querySelectorAll('.row');
      if (!headEl || rowEls.length === 0) return;

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

      const E: { k: number; a: number[]; b: number[] }[] = [];
      for (let e = 0; e <= rowEls.length; e++) {
        const r = rnd(e * 97 + 13);
        E.push({
          k: e % 2 ? 3 : -12.5,
          a: jag(r, e * 2),
          b: jag(r, e * 2 + 3),
        });
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

      headEl.style.clipPath =
        'polygon(0% 0, 100% 0, ' +
        line(E[0], E[0].a, H - g, true).join(',') +
        ')';

      rowEls.forEach((row, i) => {
        const bg = row.querySelector('.bg') as HTMLElement;
        const picWrap = row.querySelector('.pic-wrap') as HTMLElement;
        if (bg && E[i] && E[i + 1]) {
          bg.style.clipPath =
            'polygon(' +
            line(E[i], E[i].b, En + g)
              .concat(line(E[i + 1], E[i + 1].a, En + R - g, true))
              .join(',') +
            ')';
        }
        if (picWrap && E[i + 1]) {
          // Bottom white line cuts the image so it doesn't show past the white line
          picWrap.style.clipPath =
            'polygon(0% -200%, 100% -200%, ' +
            line(E[i + 1], E[i + 1].a, R - g, true).join(',') +
            ')';
        }
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
        { threshold: 0.12, rootMargin: '0px 0px -4% 0px' }
      );

      rowEls.forEach((r) => io.observe(r));
      return () => io.disconnect();
    }
  }, []);

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
      <div className="page">
        <main className="poster" ref={posterRef}>
          <header className="head">
            <p className="wm" aria-hidden="true">
              OCVP
            </p>
            <h1 className="ttl">
              OCVP<span aria-hidden="true">&#10043;</span>
            </h1>
            <p className="tag">PARTNERSHIP DEVELOPMENT</p>
          </header>

          <div className="rows">
            {DATA.map((member, i) => {
              const first = member.name.split(' ')[0];
              const fs = Math.min(31, 189 / first.length);
              const isOdd = i % 2 !== 0;

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
                      '--row-delay': `${Math.min(i, 2) * 0.12}s`,
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
                        className="pic-img"
                        loading="eager"
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
        </main>
      </div>
    </div>
  );
}
