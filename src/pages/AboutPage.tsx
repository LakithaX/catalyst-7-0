import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { SakuraPetals } from '../components/SakuraPetals';
import { DiscRevealList, DiscRevealItem } from '../components/ui/disc-reveal-list';

export default function AboutPage() {
  const navigate = useNavigate();
  const [isNavigatingToOc, setIsNavigatingToOc] = useState(false);

  const aboutDiscItems: DiscRevealItem[] = [
    {
      title: "Organizing Committee",
      subtitle: "18 leaders forging the Catalyst 7.0 crucible",
      href: "/oc",
      onClick: (e) => {
        e.preventDefault();
        setIsNavigatingToOc(true);
        setTimeout(() => {
          navigate('/oc', { state: { fromAbout: true } });
        }, 360);
      },
      media: {
        kind: "photos",
        images: [
          "/assets/cat-oc-pics/mahdy-hassan-ocp.webp",
          "/assets/cat-oc-pics/harshitha-yasiru-ocvp-marketing.webp",
          "/assets/cat-oc-pics/chetha-atapattu-ocvp-pd.webp",
          "/assets/cat-oc-pics/monali-edirisinghe-ocvp-finance.webp",
          "/assets/cat-oc-pics/binushi-ocvp-delegates-and-events.webp",
          "/assets/cat-oc-pics/lakwan-ocvp-logistics.webp",
        ],
      },
    },
    {
      title: "Executive Board",
      subtitle: "Stewards of youth leadership & governance across AIESEC in SLIIT",
      media: {
        kind: "photos",
        images: [
          "/assets/eb-pics/chelaka-wijesekara.webp",
          "/assets/eb-pics/shenise-pronk.webp",
          "/assets/eb-pics/savinda-sithum.webp",
          "/assets/eb-pics/chamindi-kaveesha.webp",
          "/assets/eb-pics/dinadi-jayathilake.webp",
          "/assets/eb-pics/nadun-weerakkody.webp",
        ],
      },
    },
    {
      title: "Moments & Legacy",
      subtitle: "Seven editions of transformative youth breakthroughs and brotherhood",
      href: "/gallery",
      onClick: (e) => {
        e.preventDefault();
        navigate('/gallery');
      },
      media: {
        kind: "photos",
        images: [
          "/assets/catalyst-gallery/617331461_1268082458698998_896025517703704603_n.jpg",
          "/assets/catalyst-gallery/616439277_1268082045365706_8706912413091711333_n.jpg",
          "/assets/catalyst-gallery/616529329_1268081438699100_5464235221991506990_n.jpg",
          "/assets/catalyst-gallery/616856062_1268081038699140_5408968865674764265_n.jpg",
        ],
      },
    },
    {
      title: "Official Merchandise",
      subtitle: "Exclusive delegate apparel, bucket hats, wristbands & collectibles",
      href: "/merch",
      onClick: (e) => {
        e.preventDefault();
        navigate('/merch');
      },
      media: {
        kind: "photos",
        images: [
          "/assets/catalyst-merch/del-black-front.png",
          "/assets/catalyst-merch/del-bucket-hat.png",
          "/assets/catalyst-merch/del-white-front.png",
          "/assets/catalyst-merch/del-black-back.png",
          "/assets/catalyst-merch/wristband-beige.png",
          "/assets/catalyst-merch/stickers-pack-1.png",
        ],
      },
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F3E9] text-[#252321] selection:bg-[#C9362B] selection:text-white relative overflow-x-hidden font-sans flex flex-col justify-between">
      {/* GLOBAL NAVBAR */}
      <Navbar />

      {/* SAKURA PETALS BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none z-10 opacity-60">
        <SakuraPetals enabled={true} />
      </div>

      {/* BACKGROUND JAPANESE ILLUSTRATIONS & KANJI TEXTURES */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Japanese Pagoda Architecture Backdrop (Right) */}
        <div className="absolute top-[12%] -right-[8%] sm:-right-[4%] w-[380px] sm:w-[540px] md:w-[680px] opacity-[0.045] select-none">
          <img
            src="/assets/illustrations/gdj-building-8171699.svg"
            alt=""
            className="w-full h-auto object-contain filter grayscale"
          />
        </div>

        {/* Traditional Pine / Blossom Tree Backdrop (Left) */}
        <div className="absolute top-[48%] -left-[10%] sm:-left-[5%] w-[320px] sm:w-[480px] md:w-[600px] opacity-[0.04] select-none">
          <img
            src="/assets/illustrations/susannp4-tree-1586365_1920.png"
            alt=""
            className="w-full h-auto object-contain filter grayscale"
          />
        </div>

        {/* Traditional Swimming Koi Backdrop (Lower Right) */}
        <div className="absolute bottom-[8%] right-[2%] w-[180px] sm:w-[260px] opacity-[0.05] select-none">
          <img
            src="/assets/illustrations/benkageyama-coy-5135969_1920.png"
            alt=""
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Kanji Typography */}
        <div className="absolute top-[15%] right-[-5%] text-[18vw] font-['Shippori_Mincho',serif] font-black text-[#252321]/[0.02] select-none leading-none">
          武士道
        </div>
        <div className="absolute top-[55%] left-[-4%] text-[18vw] font-['Shippori_Mincho',serif] font-black text-[#C9362B]/[0.015] select-none leading-none">
          変革
        </div>
      </div>

      <main className="relative z-20 pt-28 sm:pt-36 pb-24 flex-1">
        {/* =========================================================================
            SECTION 1: HERO & BRAND STATEMENT
           ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 sm:mb-20">
          <div className="text-center max-w-4xl mx-auto">
            {/* Top Mon & Tag */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-[#C9362B]/30 bg-[#C9362B]/5 backdrop-blur-sm mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-[#C9362B] animate-pulse" />
              <span className="font-['Montserrat',sans-serif] text-xs sm:text-sm font-semibold tracking-widest text-[#C9362B] uppercase">
                AIESEC in SLIIT • Flagship Summit
              </span>
            </motion.div>

            {/* Editorial Main Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-['Bison',sans-serif] text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight text-[#252321] uppercase leading-[0.9] mb-6"
            >
              DARE BEYOND <br />
              <span className="text-[#C9362B] italic">DEFINITION</span>
            </motion.h1>

            {/* Narrative Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="font-['Shippori_Mincho',serif] text-base sm:text-xl md:text-2xl text-[#5A524C] leading-relaxed max-w-3xl mx-auto mb-10"
            >
              Catalyst 7.0 is the premier two-day youth leadership crucible crafted by{' '}
              <strong className="text-[#252321] font-semibold">AIESEC in SLIIT</strong>. Forged in
              the eternal discipline of the samurai and the audacity of modern innovation, we bring
              together Sri Lanka’s most visionary minds to forge lifelong brotherhood and
              extraordinary leadership.
            </motion.p>

            {/* Quick Action Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm font-['Montserrat',sans-serif]"
            >
              <Link
                to="/register"
                className="px-7 py-3 rounded-full bg-[#C9362B] text-white font-bold tracking-wider hover:bg-[#A8251B] transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2 group cursor-pointer"
              >
                <span>REGISTER NOW</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/gallery"
                className="px-7 py-3 rounded-full border border-[#252321]/20 bg-white/70 backdrop-blur-sm text-[#252321] font-bold tracking-wider hover:border-[#C9362B] hover:text-[#C9362B] transition-all cursor-pointer"
              >
                VIEW GALLERY
              </Link>

              <Link
                to="/merch"
                className="px-7 py-3 rounded-full border border-[#252321]/20 bg-white/70 backdrop-blur-sm text-[#252321] font-bold tracking-wider hover:border-[#C9362B] hover:text-[#C9362B] transition-all cursor-pointer"
              >
                EXPLORE MERCH
              </Link>
            </motion.div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 2: DISC REVEAL LIST (CATALYST DIMENSIONS)
           ========================================================================= */}
        <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 sm:mb-20">
          <DiscRevealList items={aboutDiscItems} />
        </section>
      </main>

      {/* Discreet Outro Footer */}
      <footer className="w-full bg-[#F3ECE0]/70 border-t border-[#252321]/10 py-10 px-4 sm:px-6 lg:px-8 text-center select-none relative z-20">
        <div className="flex items-center justify-center gap-3 mb-2 text-[10px] font-['Montserrat',sans-serif] tracking-[0.25em] text-[#C9362B] uppercase font-bold">
          <span className="w-6 h-[1px] bg-[#C9362B]/30" />
          <span>武士道 · DARE BEYOND DEFINITION</span>
          <span className="w-6 h-[1px] bg-[#C9362B]/30" />
        </div>
        <p className="text-[11px] font-['Shippori_Mincho',serif] text-[#736B63]">
          Catalyst 7.0 · AIESEC in SLIIT · All Rights Reserved
        </p>
      </footer>

      {/* Cinematic Transition Overlay to OC Poster */}
      <AnimatePresence>
        {isNavigatingToOc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[100] bg-gradient-to-b from-[#b21335] via-[#9a0d2a] to-[#7a0a1e] flex flex-col items-center justify-center pointer-events-none select-none"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.32, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
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
    </div>
  );
}
