import React, { useState, useLayoutEffect } from 'react';
import { motion } from 'motion/react';
import { Phone, MessageCircle, Copy, Check, Mail, MapPin, Sparkles, ArrowRight, Clock, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { SakuraPetals } from '../components/SakuraPetals';

interface ContactPerson {
  id: string;
  name: string;
  role: string;
  phone: string;
  rawPhone: string;
  image: string;
  kanji: string;
  kanjiMeaning: string;
  badge: string;
}

const CONTACTS: ContactPerson[] = [
  {
    id: 'vindhi',
    name: 'Vindhi Akmeemana',
    role: 'OCVP Delegates & Events',
    phone: '077 110 0437',
    rawPhone: '+94771100437',
    image: '/assets/cat-oc-pics/vindhi-akmeemana-ocvp-delegates-and-events.webp',
    kanji: '絆',
    kanjiMeaning: 'Bonds',
    badge: 'Delegates & Events',
  },
  {
    id: 'binushi',
    name: 'Binushi Wikramarathne',
    role: 'OCVP Delegates & Events',
    phone: '078 745 9099',
    rawPhone: '+94787459099',
    image: '/assets/cat-oc-pics/binushi-ocvp-delegates-and-events.webp',
    kanji: '和',
    kanjiMeaning: 'Harmony',
    badge: 'Delegates & Events',
  },
  {
    id: 'tharuka',
    name: 'Tharuka Liyanage',
    role: 'OCVP Delegates & Events',
    phone: '076 404 8197',
    rawPhone: '+94764048197',
    image: '/assets/cat-oc-pics/tharuka-ocvp-delegates-and-events.webp',
    kanji: '導',
    kanjiMeaning: 'Guidance',
    badge: 'Delegates & Events',
  },
  {
    id: 'isuri',
    name: 'Isuri Muthumalee',
    role: 'OCVP Delegates & Events',
    phone: '071 796 5214',
    rawPhone: '+94717965214',
    image: '/assets/cat-oc-pics/isuri-muthumalee-ocvp-delegates-and-events.webp',
    kanji: '志',
    kanjiMeaning: 'Aspiration',
    badge: 'Delegates & Events',
  },
  {
    id: 'adithya',
    name: 'Adithya Munasinghe',
    role: 'OCVP Delegates & Logistics',
    phone: '070 417 8426',
    rawPhone: '+94704178426',
    image: '/assets/cat-oc-pics/adithya-ocvp-del-x-log.webp',
    kanji: '守',
    kanjiMeaning: 'Logistics Guard',
    badge: 'Delegates & Logistics',
  },
];

export default function ContactPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId((current) => (current === id ? null : current));
    }, 2000);
  };

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
        <div className="absolute top-[10%] -right-[8%] sm:-right-[4%] w-[380px] sm:w-[540px] md:w-[680px] opacity-[0.04] select-none">
          <img
            src="/assets/illustrations/gdj-building-8171699.svg"
            alt=""
            className="w-full h-auto object-contain filter grayscale"
          />
        </div>

        {/* Traditional Pine / Blossom Tree Backdrop (Left) */}
        <div className="absolute top-[40%] -left-[10%] sm:-left-[5%] w-[320px] sm:w-[480px] md:w-[600px] opacity-[0.035] select-none">
          <img
            src="/assets/illustrations/susannp4-tree-1586365_1920.png"
            alt=""
            className="w-full h-auto object-contain filter grayscale"
          />
        </div>

        {/* Traditional Torii Gate Silhouette (Lower Center) */}
        <div className="absolute bottom-[2%] left-1/2 -translate-x-1/2 w-[240px] sm:w-[360px] opacity-[0.03] select-none">
          <img
            src="/assets/hero-section-assets/torii-gate.webp"
            alt=""
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Japanese Kanji Background Typography */}
        <div className="absolute top-[16%] right-[-4%] text-[18vw] font-['Shippori_Mincho',serif] font-black text-[#252321]/[0.02] select-none leading-none">
          連絡
        </div>
        <div className="absolute top-[52%] left-[-3%] text-[18vw] font-['Shippori_Mincho',serif] font-black text-[#C9362B]/[0.015] select-none leading-none">
          奉仕
        </div>
      </div>

      <main className="relative z-20 pt-28 sm:pt-36 pb-20 flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* =========================================================================
            HEADER & HERO
           ========================================================================= */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-[#C9362B]/30 bg-[#C9362B]/5 backdrop-blur-sm mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-[#C9362B] animate-pulse" />
            <span className="font-['Montserrat',sans-serif] text-xs sm:text-sm font-semibold tracking-widest text-[#C9362B] uppercase">
              AIESEC IN SLIIT &bull; DELEGATE HELP DESK
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-['Bison',sans-serif] text-5xl sm:text-7xl md:text-8xl tracking-tight text-[#252321] uppercase leading-[0.9] mb-5"
          >
            DIRECT LINE TO <br />
            <span className="text-[#C9362B] italic">OUR LEADS</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-['Shippori_Mincho',serif] text-base sm:text-xl text-[#5A524C] leading-relaxed max-w-2xl mx-auto"
          >
            Have inquiries regarding delegate registration, event schedules, logistics, or accommodation? 
            Connect directly with the Catalyst 7.0 Delegate Experience &amp; Logistics team.
          </motion.p>
        </div>

        {/* =========================================================================
            CONTACT CARDS GRID
           ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-20">
          {CONTACTS.map((person, index) => {
            const isCopied = copiedId === person.id;
            const isAdithya = person.id === 'adithya';

            return (
              <motion.div
                key={person.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.08 * index }}
                className={`relative group bg-[#FAF6EE]/90 backdrop-blur-md rounded-3xl border border-[#252321]/10 hover:border-[#C9362B]/40 transition-all duration-300 shadow-[0_4px_24px_rgba(37,35,33,0.06)] hover:shadow-[0_12px_40px_rgba(201,54,43,0.12)] hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden p-6 sm:p-7 ${
                  isAdithya ? 'md:col-span-2 lg:col-span-1' : ''
                }`}
              >
                {/* Subtle Japanese Mon watermark */}
                <span
                  aria-hidden="true"
                  className="absolute -right-4 -top-8 select-none text-[8rem] font-['Shippori_Mincho',serif] leading-none text-[#C9362B]/[0.06] pointer-events-none group-hover:scale-110 transition-transform duration-500"
                >
                  {person.kanji}
                </span>

                {/* Top: Photo & Badge */}
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C9362B]/10 border border-[#C9362B]/20 text-[11px] font-['Montserrat',sans-serif] font-bold text-[#C9362B] tracking-wider uppercase">
                      <Sparkles className="w-3 h-3" />
                      {person.badge}
                    </span>

                    <span
                      title={person.kanjiMeaning}
                      className="w-7 h-7 rounded-full bg-[#252321]/5 text-[#C9362B] font-['Shippori_Mincho',serif] font-bold text-sm flex items-center justify-center border border-[#252321]/10"
                    >
                      {person.kanji}
                    </span>
                  </div>

                  {/* Cutout Portrait Box */}
                  <div className="relative w-full h-56 sm:h-64 mb-6 rounded-2xl bg-gradient-to-b from-[#FAF6EE] to-[#EFE7D8]/80 border border-[#252321]/10 overflow-hidden flex items-end justify-center group-hover:border-[#C9362B]/30 transition-colors">
                    {/* Radial red spotlight behind photo */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(201,54,43,0.18)_0%,_transparent_70%)] pointer-events-none" />

                    <img
                      src={person.image}
                      alt={person.name}
                      loading="lazy"
                      className="relative z-10 max-h-[92%] w-auto object-contain object-bottom filter drop-shadow-[0_12px_22px_rgba(37,35,33,0.35)] group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Member Name & Role */}
                  <h3 className="font-['Bison',sans-serif] text-2xl sm:text-3xl text-[#252321] tracking-wide uppercase font-bold leading-none mb-1.5 group-hover:text-[#C9362B] transition-colors">
                    {person.name}
                  </h3>
                  <p className="font-['Montserrat',sans-serif] text-xs font-semibold text-[#736B63] uppercase tracking-wider mb-5">
                    {person.role}
                  </p>
                </div>

                {/* Bottom: Contact Actions */}
                <div className="pt-4 border-t border-[#252321]/10 space-y-3">
                  {/* Phone number pill with copy */}
                  <div className="flex items-center justify-between bg-white/80 border border-[#252321]/10 rounded-xl px-3.5 py-2">
                    <div className="flex items-center gap-2.5 text-sm font-mono font-bold text-[#252321]">
                      <Phone className="w-4 h-4 text-[#C9362B]" />
                      <span>{person.phone}</span>
                    </div>

                    <button
                      onClick={() => handleCopy(person.id, person.phone)}
                      className="p-1.5 rounded-lg hover:bg-[#252321]/5 text-[#736B63] hover:text-[#C9362B] transition-colors cursor-pointer"
                      title="Copy phone number"
                      aria-label="Copy phone number"
                    >
                      {isCopied ? (
                        <Check className="w-4 h-4 text-emerald-600 animate-in zoom-in-50 duration-150" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Quick Action Buttons: Call & WhatsApp */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-['Montserrat',sans-serif] font-bold uppercase tracking-wider">
                    <a
                      href={`tel:${person.rawPhone}`}
                      className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#252321] text-white hover:bg-[#C9362B] transition-all duration-200 shadow-sm active:scale-95 text-center"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call</span>
                    </a>

                    <a
                      href={`https://wa.me/${person.rawPhone.replace('+', '')}?text=${encodeURIComponent(
                        `Hi ${person.name}, I have an inquiry regarding Catalyst 7.0.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-200 shadow-sm active:scale-95 text-center"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* =========================================================================
            SECTION: GENERAL INQUIRIES & DETAILS
           ========================================================================= */}
        <section className="bg-[#FAF6EE]/80 backdrop-blur-md rounded-3xl border border-[#252321]/10 p-8 sm:p-12 mb-16 relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
            {/* Box 1: Location */}
            <div className="flex flex-col items-start">
              <div className="w-12 h-12 rounded-2xl bg-[#C9362B]/10 border border-[#C9362B]/20 text-[#C9362B] flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h4 className="font-['Bison',sans-serif] text-2xl font-bold tracking-wide text-[#252321] uppercase mb-1">
                Summit Location
              </h4>
              <p className="font-['Shippori_Mincho',serif] text-sm text-[#5A524C] leading-relaxed">
                SLIIT Malabe Campus, <br />
                New Kandy Road, Malabe, Sri Lanka.
              </p>
            </div>

            {/* Box 2: Official Mail & Organization */}
            <div className="flex flex-col items-start">
              <div className="w-12 h-12 rounded-2xl bg-[#C9362B]/10 border border-[#C9362B]/20 text-[#C9362B] flex items-center justify-center mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <h4 className="font-['Bison',sans-serif] text-2xl font-bold tracking-wide text-[#252321] uppercase mb-1">
                Email &amp; Inquiries
              </h4>
              <p className="font-['Shippori_Mincho',serif] text-sm text-[#5A524C] leading-relaxed mb-2">
                AIESEC in SLIIT Official Secretariat
              </p>
              <a
                href="mailto:aiesecinsliit@gmail.com"
                className="text-xs font-mono font-semibold text-[#C9362B] hover:underline"
              >
                aiesecinsliit@gmail.com
              </a>
            </div>

            {/* Box 3: Response Time */}
            <div className="flex flex-col items-start">
              <div className="w-12 h-12 rounded-2xl bg-[#C9362B]/10 border border-[#C9362B]/20 text-[#C9362B] flex items-center justify-center mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="font-['Bison',sans-serif] text-2xl font-bold tracking-wide text-[#252321] uppercase mb-1">
                Response Window
              </h4>
              <p className="font-['Shippori_Mincho',serif] text-sm text-[#5A524C] leading-relaxed">
                Our team responds to calls and WhatsApp messages promptly during summit coordination hours.
              </p>
            </div>
          </div>

          {/* Quick Registration & Merch Links Banner */}
          <div className="mt-10 pt-8 border-t border-[#252321]/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-['Montserrat',sans-serif] font-bold text-[#736B63] uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-[#C9362B]" />
              <span>Official Catalyst 7.0 Contacts verified by AIESEC in SLIIT</span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C9362B] text-white font-['Montserrat',sans-serif] text-xs font-bold uppercase tracking-wider hover:bg-[#A8251B] transition-colors"
              >
                <span>Register for Summit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/merch"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#252321]/20 bg-white/70 text-[#252321] font-['Montserrat',sans-serif] text-xs font-bold uppercase tracking-wider hover:border-[#C9362B] hover:text-[#C9362B] transition-colors"
              >
                <span>Explore Merch</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Discreet Outro Footer */}
      <footer className="w-full bg-[#F3ECE0]/70 border-t border-[#252321]/10 py-10 px-4 sm:px-6 lg:px-8 text-center select-none relative z-20">
        <div className="flex items-center justify-center gap-3 mb-2 text-[10px] font-['Montserrat',sans-serif] tracking-[0.25em] text-[#C9362B] uppercase font-bold">
          <span className="w-6 h-[1px] bg-[#C9362B]/30" />
          <span>武士道 &bull; DARE BEYOND DEFINITION</span>
          <span className="w-6 h-[1px] bg-[#C9362B]/30" />
        </div>
        <p className="text-[11px] font-['Shippori_Mincho',serif] text-[#736B63]">
          Catalyst 7.0 &bull; AIESEC in SLIIT &bull; All Rights Reserved
        </p>
      </footer>
    </div>
  );
}
