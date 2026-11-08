import React, { useCallback, useEffect, useMemo, useRef, useState, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  Phone, Copy, Check, Mail, MapPin, ArrowRight, Clock, ShieldCheck,
  UserPlus, ExternalLink, Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { SakuraPetals } from '../components/SakuraPetals';
import { scrollTopOrRestore } from '../utils/navState';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

// ============================================================================
// SETTINGS: everything you may want to change lives here
// ============================================================================
const SUPPORT_EMAIL = 'aiesecinsliit@gmail.com';
const VENUE_NAME = 'SLIIT Malabe Campus';
const VENUE_MAPS = 'https://www.google.com/maps/search/?api=1&query=SLIIT+Malabe+Campus';

// shown as "Online now" / "Back at ..." (Sri Lanka time). Edit to match when the team really replies.
const SUPPORT_HOURS = { start: 9, end: 21 };

// optional: paste a WhatsApp group / community invite link (https://chat.whatsapp.com/...) and a join card appears
const WHATSAPP_COMMUNITY_URL = '';

type TopicId = 'registration' | 'schedule' | 'logistics' | 'accommodation' | 'other';

const TOPICS: { id: TopicId; label: string }[] = [
  { id: 'registration', label: 'Registration' },
  { id: 'schedule', label: 'Event schedule' },
  { id: 'logistics', label: 'Logistics & transport' },
  { id: 'accommodation', label: 'Accommodation' },
  { id: 'other', label: 'Something else' },
];

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
  handles: TopicId[]; // which questions this lead is the best match for
  c1: string; // scroll colours
  c2: string;
}

const EVENTS_TOPICS: TopicId[] = ['registration', 'schedule', 'other'];
const LOGISTICS_TOPICS: TopicId[] = ['logistics', 'accommodation', 'other'];

// every lead card shares one warm-paper tone so the row reads as a single set
const CARD = { c1: '#fffaf0', c2: '#f3e8d2' };

const CONTACTS: ContactPerson[] = [
  {
    id: 'vindhi', name: 'Vindhi Akmeemana', role: 'OCVP Delegates & Events', phone: '077 110 0437', rawPhone: '+94771100437',
    image: '/assets/cat-oc-pics/vindhi-akmeemana-ocvp-delegates-and-events.webp', kanji: '絆', kanjiMeaning: 'Bonds',
    badge: 'Delegates & Events', handles: EVENTS_TOPICS, ...CARD,
  },
  {
    id: 'binushi', name: 'Binushi Wikramarathne', role: 'OCVP Delegates & Events', phone: '078 745 9099', rawPhone: '+94787459099',
    image: '/assets/cat-oc-pics/binushi-ocvp-delegates-and-events.webp', kanji: '和', kanjiMeaning: 'Harmony',
    badge: 'Delegates & Events', handles: EVENTS_TOPICS, ...CARD,
  },
  {
    id: 'tharuka', name: 'Tharuka Liyanage', role: 'OCVP Delegates & Events', phone: '076 404 8197', rawPhone: '+94764048197',
    image: '/assets/cat-oc-pics/tharuka-ocvp-delegates-and-events.webp', kanji: '導', kanjiMeaning: 'Guidance',
    badge: 'Delegates & Events', handles: EVENTS_TOPICS, ...CARD,
  },
  {
    id: 'isuri', name: 'Isuri Muthumalee', role: 'OCVP Delegates & Events', phone: '071 796 5214', rawPhone: '+94717965214',
    image: '/assets/cat-oc-pics/isuri-muthumalee-ocvp-delegates-and-events.webp', kanji: '志', kanjiMeaning: 'Aspiration',
    badge: 'Delegates & Events', handles: EVENTS_TOPICS, ...CARD,
  },
  {
    id: 'adithya', name: 'Adithya Munasinghe', role: 'OCVP Delegates & Logistics', phone: '070 417 8426', rawPhone: '+94704178426',
    image: '/assets/cat-oc-pics/adithya-ocvp-del-x-log.webp', kanji: '守', kanjiMeaning: 'Logistics Guard',
    badge: 'Delegates & Logistics', handles: LOGISTICS_TOPICS, ...CARD,
  },
];

// ============================================================================
// HELPERS
// ============================================================================
const digits = (phone: string) => phone.replace(/\D/g, '');

const buildMessage = (p: ContactPerson, topic: (typeof TOPICS)[number], name: string, note: string) => {
  const first = p.name.split(' ')[0];
  const who = name.trim() ? `I'm ${name.trim()} and I` : 'I';
  let msg = `Hi ${first}! ${who} have a question about ${topic.label.toLowerCase()} for Catalyst 7.0.`;
  if (note.trim()) msg += `\n\n${note.trim()}`;
  return msg;
};

const waLink = (p: ContactPerson, message: string) => `https://wa.me/${digits(p.rawPhone)}?text=${encodeURIComponent(message)}`;

// works on https, on http://localhost and in browsers that block the clipboard API
const copyText = async (text: string) => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch { /* fall through to the old method */ }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
};

// "save to contacts": downloads a .vcf the phone opens straight into the address book
const downloadVCard = (p: ContactPerson) => {
  const vcf = [
    'BEGIN:VCARD', 'VERSION:3.0', `FN:${p.name}`, 'ORG:AIESEC in SLIIT', `TITLE:${p.role} - Catalyst 7.0`,
    `TEL;TYPE=CELL:${p.rawPhone}`, `EMAIL:${SUPPORT_EMAIL}`, 'END:VCARD',
  ].join('\r\n');
  const url = URL.createObjectURL(new Blob([vcf], { type: 'text/vcard' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${p.name.replace(/\s+/g, '-').toLowerCase()}.vcf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const useSupportStatus = () => {
  const read = () => {
    const h = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hour12: false, timeZone: 'Asia/Colombo' }).format(new Date())) % 24;
    return h >= SUPPORT_HOURS.start && h < SUPPORT_HOURS.end;
  };
  const [online, setOnline] = useState(read);
  useEffect(() => {
    const t = window.setInterval(() => setOnline(read()), 60_000);
    return () => window.clearInterval(t);
  }, []);
  return online;
};

const fmtHour = (h: number) => `${((h + 11) % 12) + 1}:00 ${h >= 12 ? 'PM' : 'AM'}`;

// play an entrance exactly once, whichever way (or however fast) the visitor arrives:
// entering from above/below -> play, scrolled straight past -> jump to the finished state
const revealOnce = (tl: gsap.core.Timeline, trigger: Element, start: string) => {
  let done = false;
  const go = (self: ScrollTrigger, instant: boolean) => {
    if (done) return;
    done = true;
    if (instant) tl.progress(1).pause();
    else tl.timeScale(Math.abs(self.getVelocity()) > 2500 ? 2.5 : 1).play();
    self.kill();
  };
  ScrollTrigger.create({
    trigger, start, end: 'bottom top',
    onEnter: (s) => go(s, false), onEnterBack: (s) => go(s, false), onLeave: (s) => go(s, true),
  });
};

const SEIGAIHA = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='30' viewBox='0 0 40 20'%3E%3Cg fill='none' stroke='%23d33a2c' stroke-opacity='.9' stroke-width='1.1'%3E%3Ccircle cx='0' cy='10' r='18'/%3E%3Ccircle cx='0' cy='10' r='12'/%3E%3Ccircle cx='0' cy='10' r='6'/%3E%3Ccircle cx='40' cy='10' r='18'/%3E%3Ccircle cx='40' cy='10' r='12'/%3E%3Ccircle cx='40' cy='10' r='6'/%3E%3Ccircle cx='20' cy='20' r='18'/%3E%3Ccircle cx='20' cy='20' r='12'/%3E%3Ccircle cx='20' cy='20' r='6'/%3E%3C/g%3E%3C/svg%3E")`;

const WhatsAppIcon = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 21l1.6-4.7A8.5 8.5 0 1 1 8 19.6L3 21z" />
    <path d="M9 8.6c.3 2.6 2.8 5.1 5.4 5.4l1.2-1.2c.2-.2.5-.3.8-.2l1.6.7c.3.1.4.4.4.7-.1 1-.9 1.8-1.9 1.9C11.9 16 8 12.1 7.4 8.7c.1-1 .9-1.8 1.9-1.9.3 0 .6.1.7.4l.7 1.6c.1.3 0 .6-.2.8L9 8.6z" fill="currentColor" stroke="none" />
  </svg>
);

// brush-letters: every character is its own element so GSAP can drop them in one by one
const Chars = ({ text, className = '' }: { text: string; className?: string }) => {
  const words = text.split(' ');
  return (
    <span className={className} aria-label={text}>
      {words.map((w, i) => (
        <React.Fragment key={i}>
          <span className="cx-tw" aria-hidden="true">
            {w.split('').map((c, j) => <span className="cx-ch" key={j}>{c}</span>)}
          </span>
          {i < words.length - 1 ? ' ' : null}
        </React.Fragment>
      ))}
    </span>
  );
};

// words slide up out of a mask
const Words = ({ text }: { text: string }) => (
  <span aria-label={text}>
    {text.split(' ').map((w, i) => (
      <React.Fragment key={i}>
        <span className="cx-wm" aria-hidden="true"><span className="cx-w">{w}</span></span>{' '}
      </React.Fragment>
    ))}
  </span>
);

const BrushLine = () => (
  <svg className="cx-bl" viewBox="0 0 400 18" preserveAspectRatio="none" aria-hidden="true">
    <path d="M3 11 C 60 2, 140 17, 220 8 S 340 14, 397 5" fill="none" stroke="#d93a2b" strokeWidth="5" strokeLinecap="round" />
  </svg>
);

// ============================================================================
// PAGE
// ============================================================================
export default function ContactPage() {
  const reduce = useReducedMotion();
  const online = useSupportStatus();
  const pageRef = useRef<HTMLDivElement>(null);
  const composeRef = useRef<HTMLElement>(null);

  const [topicId, setTopicId] = useState<TopicId>('registration');
  const [visitor, setVisitor] = useState('');
  const [note, setNote] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  useLayoutEffect(() => {
    scrollTopOrRestore();
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('c7-contact-name');
      if (saved) setVisitor(saved);
    } catch { /* storage blocked: fine */ }
  }, []);
  useEffect(() => {
    try { localStorage.setItem('c7-contact-name', visitor); } catch { /* ignore */ }
  }, [visitor]);

  const topic = TOPICS.find((t) => t.id === topicId)!;
  const matches = useMemo(() => CONTACTS.filter((p) => p.handles.includes(topicId)), [topicId]);
  const best = matches[0] ?? CONTACTS[0];
  const previewMsg = buildMessage(best, topic, visitor, note);

  const showToast = useCallback((text: string) => {
    setToast(text);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  }, []);

  const handleCopy = async (id: string, text: string, label: string) => {
    const ok = await copyText(text);
    if (ok) {
      setCopiedId(id);
      showToast(`${label} copied`);
      window.setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 2000);
    } else {
      showToast('Could not copy, please select the text manually');
    }
  };

  // ---------------------------------------------------------------- GSAP
  useLayoutEffect(() => {
    const root = pageRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const q = gsap.utils.selector(root);
        const hero = q('.cx-hero')[0];
        const loops: gsap.core.Animation[] = [];

        // ---------- hero intro
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl.fromTo(q('.cx-koi-img'), { scale: 0.82, opacity: 0, rotation: -5 }, { scale: 1, opacity: 1, rotation: 0, duration: 1.5 }, 0)
          .fromTo(q('.cx-wmk'), { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.5 }, 0.2)
          .fromTo(q('.cx-pill'), { opacity: 0, y: -14 }, { opacity: 1, y: 0, duration: 0.7 }, 0.3)
          .from(q('.cx-hero .cx-ch'), {
            yPercent: -170, rotation: () => gsap.utils.random(-28, 28), opacity: 0, scale: 1.5,
            duration: 0.95, stagger: 0.045, ease: 'back.out(1.8)',
          }, 0.45)
          .fromTo(q('.cx-hero .cx-bl path'), { strokeDashoffset: 420 }, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' }, 1.1)
          .fromTo(q('.cx-hero .cx-div'), { opacity: 0, scaleX: 0.4 }, { opacity: 1, scaleX: 1, duration: 0.7 }, 1.2)
          .fromTo(q('.cx-hero-sub'), { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.8 }, 1.3)
          .fromTo(q('.cx-hero-cta > *'), { opacity: 0, y: 26, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.12, ease: 'back.out(1.6)' }, 1.5);

        // ---------- gentle koi float (only runs while the hero is on screen)
        loops.push(gsap.to(q('.cx-koi'), { y: -12, rotation: 1.5, duration: 3.4, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
        ScrollTrigger.create({
          trigger: hero, start: 'top bottom', end: 'bottom top',
          onToggle: (self) => loops.forEach((a) => (self.isActive ? a.resume() : a.pause())),
        });

        // ---------- scroll parallax (own wrapper, so it never fights the intro)
        gsap.to(q('.cx-par-koi'), { y: 90, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.6 } });

        // ---------- section headings: words rise out of a mask, brush line paints itself
        q('.cx-hd').forEach((hd) => {
          const t = gsap.timeline({ paused: true });
          t.fromTo(hd.querySelectorAll('.cx-w'), { yPercent: 115 }, { yPercent: 0, duration: 0.9, stagger: 0.07, ease: 'power4.out' })
            .fromTo(hd.querySelectorAll('.cx-bl path'), { strokeDashoffset: 420 }, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' }, '-=0.5');
          revealOnce(t, hd, 'top 90%');
        });

        // ---------- composer panel
        const panel = q('.cx-paper')[0];
        if (panel) {
          const t = gsap.timeline({ paused: true });
          t.fromTo(panel, { y: 70, opacity: 0, rotation: -0.6 }, { y: 0, opacity: 1, rotation: 0, duration: 1, ease: 'power3.out' })
            .fromTo(q('.cx-chip'), { opacity: 0, y: 14, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.06, ease: 'back.out(1.6)' }, '-=0.5')
            .fromTo(q('.cx-ribbon'), { scale: 2.4, opacity: 0, rotation: -20 }, { scale: 1, opacity: 1, rotation: 6, duration: 0.5, ease: 'back.out(2.2)' }, '-=0.5');
          revealOnce(t, panel, 'top 88%');
        }

        // ---------- lead cards: scroll unrolls, portrait glides up, hanko stamps down last
        q('.cx-card').forEach((card, i) => {
          const img = card.querySelector('.cx-win img');
          const seal = card.querySelector('.cx-seal');
          const t = gsap.timeline({ paused: true, delay: (i % 3) * 0.1 });
          t.fromTo(card, { opacity: 0, y: 70, clipPath: 'inset(0 0 100% 0)' }, { opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)', duration: 1.05, ease: 'power3.out', clearProps: 'clipPath' });
          if (img) t.fromTo(img, { yPercent: 16, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, ease: 'expo.out' }, 0.45);
          if (seal) t.fromTo(seal, { scale: 2.8, opacity: 0, rotation: -26 }, { scale: 1, opacity: 1, rotation: -8, duration: 0.45, ease: 'back.out(2.4)' }, '-=0.25');
          revealOnce(t, card, 'top 92%');
        });

        // ---------- info panel
        const info = q('.cx-info')[0];
        if (info) {
          const t = gsap.timeline({ paused: true });
          t.fromTo(info, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' })
            .fromTo(q('.cx-info-col'), { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: 'power3.out' }, '-=0.5');
          revealOnce(t, info, 'top 90%');
        }

        // make sure nothing is measured before fonts settle
        document.fonts?.ready.then(() => ScrollTrigger.refresh());
      });

      // ---------- pointer magic: only where a real mouse exists and motion is welcome
      mm.add('(hover: hover) and (prefers-reduced-motion: no-preference)', () => {
        const cleanups: (() => void)[] = [];

        // 3D tilt + lift on the lead cards
        root.querySelectorAll<HTMLElement>('.cx-card').forEach((card) => {
          const win = card.querySelector<HTMLElement>('.cx-win img');
          const rx = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3.out' });
          const ry = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3.out' });
          const ly = gsap.quickTo(card, 'y', { duration: 0.5, ease: 'power3.out' });
          const ix = win ? gsap.quickTo(win, 'x', { duration: 0.6, ease: 'power3.out' }) : null;
          gsap.set(card, { transformPerspective: 900 });
          const move = (e: PointerEvent) => {
            const r = card.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width - 0.5;
            const py = (e.clientY - r.top) / r.height - 0.5;
            ry(px * 9); rx(-py * 7); ly(-8); ix?.(px * -10);
          };
          const leave = () => { ry(0); rx(0); ly(0); ix?.(0); };
          card.addEventListener('pointermove', move);
          card.addEventListener('pointerleave', leave);
          cleanups.push(() => { card.removeEventListener('pointermove', move); card.removeEventListener('pointerleave', leave); });
        });

        // magnetic buttons
        root.querySelectorAll<HTMLElement>('.cx-mag').forEach((el) => {
          const mx = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
          const my = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });
          const move = (e: PointerEvent) => {
            const r = el.getBoundingClientRect();
            mx((e.clientX - (r.left + r.width / 2)) * 0.22);
            my((e.clientY - (r.top + r.height / 2)) * 0.3);
          };
          const leave = () => { mx(0); my(0); };
          el.addEventListener('pointermove', move);
          el.addEventListener('pointerleave', leave);
          cleanups.push(() => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); });
        });

        return () => cleanups.forEach((c) => c());
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={pageRef} className="cx min-h-screen bg-[#F8F3E9] text-[#1f1a18] selection:bg-[#c9332a] selection:text-white relative overflow-x-hidden flex flex-col justify-between">
      <style>{CSS}</style>
      <Navbar />

      {/* petals fall over everything */}
      <div className="fixed inset-0 pointer-events-none z-30 opacity-80">
        <SakuraPetals enabled={!reduce} />
      </div>



      <div className="cx-dark">
        <div className="cx-band" aria-hidden="true" />

        {/* ============================ HERO ============================ */}
        <section className="cx-hero">
          <div className="cx-wmk" aria-hidden="true">連</div>

          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-[1fr_1.05fr] gap-8 lg:gap-14 items-center">
            <div className="cx-par-koi order-2 lg:order-1" aria-hidden="true">
              <div className="cx-koi">
                <img className="cx-koi-img" src="/assets/illustrations/benkageyama-coy-5135969_1920.png" alt="" draggable={false} />
              </div>
            </div>

            <div className="order-1 lg:order-2 text-center lg:text-left">
              <div className="cx-pill inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-[#1f1a18]/25 bg-white/70 mb-6">
                <span className="w-2 h-2 rounded-full bg-[#c9332a] animate-pulse" />
                <span className="text-[11px] sm:text-xs font-semibold tracking-[0.28em] text-[#1f1a18] uppercase">AIESEC IN SLIIT &bull; DELEGATE HELP DESK</span>
              </div>

              <h1 className="cx-ttl mb-2">
                <Chars text="DIRECT LINE TO" className="cx-brush cx-ttl-sm" />
                <Chars text="OUR LEADS" className="cx-brush cx-ttl-lg" />
              </h1>
              <BrushLine />
              <div className="cx-div" aria-hidden="true"><i /><b /><i /></div>

              <p className="cx-hero-sub text-base sm:text-lg text-[#3a3430] max-w-xl mx-auto lg:mx-0 leading-relaxed mb-8 font-medium">
                Questions about registration, schedules, logistics or accommodation? Pick a topic below and we will open
                WhatsApp with your message already written.
              </p>

              <div className="cx-hero-cta flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                <button
                  type="button"
                  onClick={() => composeRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })}
                  className="cx-mag inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#c9332a] text-white text-xs font-bold uppercase tracking-[0.18em] shadow-[0_10px_26px_rgba(201,51,42,0.35)] hover:bg-[#a8261e] transition-colors cursor-pointer"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  <span>Message the team</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <span
                  role="status"
                  className={`inline-flex items-center gap-2 px-4 py-3 rounded-full border text-[11px] font-bold uppercase tracking-wider ${
                    online ? 'border-emerald-600/40 bg-emerald-50 text-emerald-700' : 'border-[#1f1a18]/25 bg-white/60 text-[#4a4340]'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${online ? 'bg-emerald-500 animate-pulse' : 'bg-[#1f1a18]/40'}`} />
                  {online ? 'Team online now' : `Back at ${fmtHour(SUPPORT_HOURS.start)}`}
                  <span className="font-medium normal-case tracking-normal opacity-75">(Sri Lanka time)</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          {/* ============================ COMPOSER ============================ */}
          <section ref={composeRef} id="compose" className="scroll-mt-28 mb-20 sm:mb-24">
            <div className="cx-paper grid lg:grid-cols-[1.15fr_1fr] gap-6 sm:gap-8 p-6 sm:p-10">
              <div className="cx-ribbon" aria-hidden="true">問</div>

              <div>
                <h2 className="cx-brush cx-hd text-[clamp(1.9rem,4.4vw,3.1rem)] leading-[1.02] text-[#1f1a18] mb-1 pr-10">
                  <Words text="What do you need help with?" />
                  <BrushLine />
                </h2>
                <p className="text-sm text-[#4a4340] mb-5 font-medium">We will point you to the best-matching lead and write the first message for you.</p>

                <div role="radiogroup" aria-label="Topic" className="flex flex-wrap gap-2 mb-5">
                  {TOPICS.map((t) => {
                    const active = t.id === topicId;
                    return (
                      <button
                        key={t.id} type="button" role="radio" aria-checked={active} onClick={() => setTopicId(t.id)}
                        className={`cx-chip inline-flex items-center px-5 py-2.5 rounded-full border text-[11px] font-bold uppercase tracking-[0.14em] transition-all cursor-pointer active:scale-95 ${
                          active
                            ? 'bg-[#c9332a] border-[#c9332a] text-white shadow-[0_8px_20px_rgba(201,51,42,0.3)]'
                            : 'bg-white border-[#1f1a18]/25 text-[#1f1a18] hover:border-[#c9332a] hover:text-[#c9332a]'
                        }`}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>

                <label className="block mb-3 sm:max-w-sm">
                  <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-[#4a4340] mb-1.5">Your name (optional)</span>
                  <input
                    value={visitor} onChange={(e) => setVisitor(e.target.value.slice(0, 40))} placeholder="e.g. Nimal Perera" autoComplete="name"
                    className="w-full rounded-xl border-2 border-[#1f1a18]/25 bg-white px-3.5 py-2.5 text-sm text-[#1f1a18] placeholder:text-[#1f1a18]/40 focus:outline-none focus:border-[#c9332a] focus:ring-4 focus:ring-[#c9332a]/15 transition"
                  />
                </label>

                <label className="block">
                  <span className="flex justify-between text-[11px] font-bold uppercase tracking-[0.18em] text-[#4a4340] mb-1.5">
                    <span>Add details (optional)</span>
                    <span className="font-medium normal-case tracking-normal">{note.length}/200</span>
                  </span>
                  <textarea
                    value={note} onChange={(e) => setNote(e.target.value.slice(0, 200))} rows={3} placeholder="Tell us a little more so we can answer faster"
                    className="w-full rounded-xl border-2 border-[#1f1a18]/25 bg-white px-3.5 py-2.5 text-sm text-[#1f1a18] placeholder:text-[#1f1a18]/40 resize-none focus:outline-none focus:border-[#c9332a] focus:ring-4 focus:ring-[#c9332a]/15 transition"
                  />
                </label>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-3 pr-14">
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#4a4340]">Live preview</span>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#c9332a] uppercase tracking-wider">
                    <Users className="w-3.5 h-3.5" />
                    {matches.length} best match{matches.length === 1 ? '' : 'es'}
                  </span>
                </div>

                <div className="flex-1 rounded-2xl border-2 border-[#1f1a18] bg-[#e6dccb] p-4 sm:p-5 relative overflow-hidden min-h-[180px] shadow-[5px_5px_0_#1f1a18]">
                  <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(#1f1a18_1px,transparent_1px)] [background-size:14px_14px]" />
                  <div className="relative flex items-center gap-2.5 mb-4">
                    <img src={best.image} alt="" className="w-10 h-10 rounded-full object-cover object-top bg-[#7a0a22] border-2 border-white" loading="lazy" />
                    <div className="leading-tight">
                      <div className="text-sm font-bold text-[#1f1a18]">{best.name}</div>
                      <div className="text-[11px] text-[#4a4340] font-medium">{best.role}</div>
                    </div>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={previewMsg}
                      initial={reduce ? false : { opacity: 0, y: 6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
                      className="relative ml-auto max-w-[92%] rounded-2xl rounded-tr-sm bg-[#d4f5b8] text-[#14210f] text-sm leading-relaxed px-4 py-2.5 shadow-sm whitespace-pre-wrap break-words font-medium"
                    >
                      {previewMsg}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <a
                  href={waLink(best, previewMsg)} target="_blank" rel="noopener noreferrer"
                  className="cx-mag mt-5 inline-flex items-center justify-center gap-2.5 py-4 px-5 rounded-xl bg-[#1FA855] hover:bg-[#178a45] text-white text-xs font-bold uppercase tracking-[0.16em] border-2 border-[#1f1a18] shadow-[4px_4px_0_#1f1a18] transition-colors active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#1f1a18]"
                >
                  <WhatsAppIcon className="w-5 h-5" />
                  <span>Send to {best.name.split(' ')[0]} on WhatsApp</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </section>

          {/* ============================ LEADS ============================ */}
          <div className="flex flex-wrap items-end justify-between gap-3 mb-10">
            <h2 className="cx-brush cx-hd text-[clamp(2.2rem,6vw,4.4rem)] leading-none text-[#1f1a18]">
              <Words text="Meet the leads" />
              <BrushLine />
            </h2>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#c9332a]">
              Best for &ldquo;{topic.label}&rdquo; are highlighted
            </span>
          </div>

          <div className="cx-wide grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-x-5 gap-y-12 mb-24">
            {CONTACTS.map((person) => {
              const isCopied = copiedId === person.id;
              const recommended = person.handles.includes(topicId);
              const msg = buildMessage(person, topic, visitor, note);
              const longest = Math.max(...person.name.split(' ').map((w) => w.length));

              return (
                <article
                  key={person.id}
                  className={`cx-card ${recommended ? 'rec' : ''} ${person.id === 'adithya' ? 'sm:col-span-2 sm:justify-self-center sm:w-[calc(50%_-_0.625rem)] lg:col-span-1 lg:w-auto lg:justify-self-stretch' : ''}`}
                  style={{ '--c1': person.c1, '--c2': person.c2, '--len': longest } as React.CSSProperties}
                >
                  <div className="cx-rod" aria-hidden="true" />

                  <div className="mb-[3.4rem] h-[1.6rem]" aria-hidden="true" />

                  <div className="cx-win">
                    <img src={person.image} alt={person.name} loading="lazy" decoding="async" draggable={false} />
                    <span className="cx-seal" title={person.kanjiMeaning} aria-hidden="true">{person.kanji}</span>
                  </div>

                  <h3 className="cx-brush cx-name">{person.name}</h3>
                  <p className="cx-role">{person.role}</p>

                  <div className="mt-auto pt-5 space-y-2.5">
                    <div className="flex items-center justify-between bg-white border border-[#1f1a18]/20 rounded-xl px-3 py-1.5">
                      <a href={`tel:${person.rawPhone}`} className="flex items-center gap-2 text-[13px] font-mono font-bold text-[#1f1a18] hover:text-[#c9332a] transition-colors">
                        <Phone className="w-3.5 h-3.5 text-[#c9332a]" />
                        <span>{person.phone}</span>
                      </a>
                      <div className="flex items-center">
                        <button
                          type="button" onClick={() => downloadVCard(person)} title="Save to contacts" aria-label={`Save ${person.name} to contacts`}
                          className="p-1.5 rounded-lg hover:bg-[#1f1a18]/10 text-[#4a4340] hover:text-[#c9332a] transition-colors cursor-pointer"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                        <button
                          type="button" onClick={() => handleCopy(person.id, person.phone, 'Number')} title="Copy phone number" aria-label="Copy phone number"
                          className="p-1.5 rounded-lg hover:bg-[#1f1a18]/10 text-[#4a4340] hover:text-[#c9332a] transition-colors cursor-pointer"
                        >
                          {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <a
                      href={waLink(person, msg)} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-[#1FA855] hover:bg-[#178a45] text-white text-[11px] font-bold uppercase tracking-[0.14em] shadow-[0_6px_16px_rgba(31,168,85,0.3)] active:scale-[0.98] transition-all"
                    >
                      <WhatsAppIcon className="w-4 h-4" />
                      <span>WhatsApp</span>
                    </a>
                    <a
                      href={`tel:${person.rawPhone}`}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full border border-[#1f1a18]/70 text-[#1f1a18] text-[11px] font-bold uppercase tracking-[0.14em] hover:bg-[#1f1a18] hover:text-white active:scale-[0.98] transition-all"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call</span>
                    </a>
                  </div>

                  <div className="cx-rod b" aria-hidden="true" />
                </article>
              );
            })}
          </div>

          {/* ============================ COMMUNITY (only if a link is set) ============================ */}
          {WHATSAPP_COMMUNITY_URL && (
            <a
              href={WHATSAPP_COMMUNITY_URL} target="_blank" rel="noopener noreferrer"
              className="flex flex-wrap items-center justify-between gap-4 mb-16 rounded-3xl border-2 border-[#1FA855] bg-[#1FA855]/15 p-6 sm:p-8 hover:bg-[#1FA855]/25 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="w-12 h-12 rounded-2xl bg-[#1FA855] text-white flex items-center justify-center"><WhatsAppIcon className="w-6 h-6" /></span>
                <div>
                  <div className="cx-brush text-2xl text-[#1f1a18] leading-none">Join the delegate WhatsApp community</div>
                  <div className="text-sm text-[#4a4340] mt-1 font-medium">Announcements and updates for Catalyst 7.0 delegates.</div>
                </div>
              </div>
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#13783a]">Join now <ArrowRight className="w-4 h-4" /></span>
            </a>
          )}

          {/* ============================ INFO ============================ */}
          <section className="cx-info p-8 sm:p-12 relative overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
              <div className="cx-info-col flex flex-col items-start">
                <div className="cx-ico"><MapPin className="w-6 h-6" /></div>
                <h3 className="cx-brush text-2xl text-[#1f1a18] mb-2">Conference Location</h3>
                <p className="text-sm text-[#4a4340] leading-relaxed mb-1 font-bold text-[#c9332a]">TBA</p>
                <p className="text-xs text-[#736B63] leading-relaxed">Venue details will be announced soon.</p>
              </div>

              <div className="cx-info-col flex flex-col items-start">
                <div className="cx-ico"><Mail className="w-6 h-6" /></div>
                <h3 className="cx-brush text-2xl text-[#1f1a18] mb-2">Email &amp; Inquiries</h3>
                <p className="text-sm text-[#4a4340] leading-relaxed mb-2 font-medium">AIESEC in SLIIT Official Secretariat</p>
                <div className="flex items-center gap-2">
                  <a href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Catalyst 7.0 inquiry')}`} className="text-xs font-mono font-bold text-[#c9332a] hover:underline break-all">
                    {SUPPORT_EMAIL}
                  </a>
                  <button
                    type="button" onClick={() => handleCopy('email', SUPPORT_EMAIL, 'Email')} aria-label="Copy email address" title="Copy email"
                    className="p-1.5 rounded-lg hover:bg-[#1f1a18]/10 text-[#4a4340] hover:text-[#c9332a] transition-colors cursor-pointer"
                  >
                    {copiedId === 'email' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="cx-info-col flex flex-col items-start">
                <div className="cx-ico"><Clock className="w-6 h-6" /></div>
                <h3 className="cx-brush text-2xl text-[#1f1a18] mb-2">Response Window</h3>
                <p className="text-sm text-[#4a4340] leading-relaxed font-medium">
                  Calls and WhatsApp messages are answered most quickly between {fmtHour(SUPPORT_HOURS.start)} and {fmtHour(SUPPORT_HOURS.end)} (Sri Lanka time).
                </p>
              </div>
            </div>

            <div className="cx-cta mt-10 pt-10 border-t border-[#1f1a18]/15">
              <img className="cx-deco cx-tree" src="/assets/illustrations/susannp4-tree-1586365_1920.webp" alt="" aria-hidden="true" loading="lazy" />
              <img className="cx-deco cx-koi2" src="/assets/illustrations/kacsoeszti-koi-1184783_1920.png" alt="" aria-hidden="true" loading="lazy" />
              <div className="relative z-10 max-w-md mx-auto text-center flex flex-col items-center">
                <span className="cx-hanko" aria-hidden="true">結</span>
                <p className="text-base text-[#3a3430] leading-relaxed mt-4 mb-6 font-medium">
                  Not registered yet? Join us at Catalyst 7.0 and we will meet you in person.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Link to="/register" className="cx-mag inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#c9332a] text-white text-xs font-bold uppercase tracking-[0.18em] shadow-[0_10px_26px_rgba(201,51,42,0.35)] hover:bg-[#a8261e] transition-colors">
                    <span>Register for Summit</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link to="/merch" className="cx-mag inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-[#1f1a18]/70 text-[#1f1a18] text-xs font-bold uppercase tracking-[0.18em] hover:bg-[#1f1a18] hover:text-[#1f1a18] transition-colors">
                    <span>Explore Merch</span>
                  </Link>
                </div>
                <div className="flex items-center gap-2 mt-8 text-[11px] font-bold text-[#4a4340] uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-[#c9332a]" />
                  <span>Official Catalyst 7.0 contacts verified by AIESEC in SLIIT</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <footer className="cx-foot relative z-20 text-center select-none">
        <div className="cx-band" aria-hidden="true" />
        <div className="px-4 sm:px-6 lg:px-8 pt-12 pb-10">
          <div className="text-[#c9332a] text-sm tracking-[0.5em] font-bold mb-3" style={{ fontFamily: "'Noto Serif JP', serif" }}>武 士 道</div>
          <h2 className="cx-brush cx-foot-ttl">DARE BEYOND DEFINITION</h2>
        </div>
      </footer>

      {/* floating WhatsApp button: always one tap away, opens the best match for the chosen topic */}
      <a
        href={waLink(best, previewMsg)} target="_blank" rel="noopener noreferrer" aria-label={`Chat with ${best.name} on WhatsApp`}
        className="fixed z-40 right-4 bottom-4 sm:right-6 sm:bottom-6 inline-flex items-center gap-2.5 h-14 pl-4 pr-4 sm:pr-5 rounded-full bg-[#1FA855] hover:bg-[#178a45] text-white ring-2 ring-white/40 shadow-[0_10px_30px_rgba(31,168,85,0.5)] transition-all active:scale-95"
      >
        <WhatsAppIcon className="w-6 h-6" />
        <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">Chat now</span>
      </a>

      <div className="fixed z-50 left-1/2 -translate-x-1/2 bottom-24 sm:bottom-8 pointer-events-none" aria-live="polite">
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.2 }}
              className="px-4 py-2.5 rounded-full bg-[#fff1e4] text-[#1f1a18] text-xs font-bold tracking-wide shadow-lg border-2 border-[#1f1a18]"
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Serif+JP:wght@700&display=swap');

.cx{font-family:'Inter',system-ui,sans-serif;--ink:#1f1a18;--red:#c9332a;--red-deep:#a8261e;--cream:#F8F3E9}
.cx-brush{font-family:'Jansina','Brusher','Anton','Impact',sans-serif;font-weight:400;font-synthesis:none;letter-spacing:.02em}

/* ---------- cream stage ---------- */
.cx-dark{position:relative;overflow:hidden;color:var(--ink);background:radial-gradient(ellipse at 22% 0,#fffaf0 0,#F8F3E9 55%,#f3ead9 100%)}
/* red seigaiha (wave) band, same divider as the rest of the site */
.cx-band{position:relative;z-index:4;width:100%;height:30px;background:${SEIGAIHA} 0 0/60px 30px repeat-x}

/* ---------- hero ---------- */
.cx-hero{position:relative;padding:clamp(2rem,5vw,4.5rem) 0 clamp(3.5rem,7vw,6rem)}
.cx-wmk{position:absolute;right:-2%;top:0;font-family:'Noto Serif JP',serif;font-weight:700;font-size:clamp(18rem,55vmin,42rem);line-height:1;color:rgba(31,26,24,.055);pointer-events:none;user-select:none}
.cx-koi-img{display:block;width:min(100%,520px);margin:0 auto;height:auto;filter:drop-shadow(0 24px 40px rgba(120,10,25,.22))}

.cx-ttl{line-height:.95;color:var(--ink)}
.cx-ttl-sm,.cx-ttl-lg{display:block}
.cx-ttl-sm{font-size:clamp(1.7rem,4.6vw,3.1rem);color:var(--ink)}
.cx-ttl-lg{font-size:clamp(3.4rem,10vw,7.4rem);color:var(--red)}
.cx-tw{display:inline-block;white-space:nowrap}
.cx-ch{display:inline-block}

.cx-hero .cx-bl{width:min(80%,22rem);margin:.5rem auto 0}
.cx-div{display:flex;align-items:center;gap:.6rem;width:min(16rem,70%);margin:1.3rem auto}
.cx-div i{flex:1;height:1px;background:rgba(31,26,24,.25)}
.cx-div b{width:.5rem;height:.5rem;border-radius:50%;background:var(--red)}
@media (min-width:1024px){.cx-hero .cx-bl{margin-left:0}.cx-div{margin-left:0}}

/* ---------- headings ---------- */
.cx-hd{position:relative;display:block;padding-bottom:.5rem}
.cx-wm{display:inline-block;overflow:hidden;vertical-align:bottom;padding:.08em .04em .12em;margin:-.08em -.04em -.12em}
.cx-w{display:inline-block;will-change:transform}
.cx-bl{display:block;width:min(70%,16rem);height:.5rem;margin-top:.55rem;overflow:visible}
.cx-bl path{stroke-dasharray:420;stroke-dashoffset:0}

/* ---------- composer: white card, ink border, offset shadow, red label strip ---------- */
.cx-paper{position:relative;border-radius:22px;background:#fff;color:var(--ink);border:2px solid var(--ink);box-shadow:10px 10px 0 var(--ink)}
.cx-paper::after{content:'お問い合わせ';position:absolute;left:0;top:0;bottom:0;width:4.2rem;display:none;align-items:center;justify-content:center;
  writing-mode:vertical-rl;letter-spacing:.35em;background:var(--red);color:#fff;font-family:'Noto Serif JP',serif;font-weight:700;font-size:1.05rem;border-radius:19px 0 0 19px}
@media (min-width:1024px){.cx-paper{padding-left:calc(4.2rem + 2.5rem) !important}.cx-paper::after{display:flex}}
.cx-ribbon{position:absolute;right:-14px;top:-18px;z-index:2;width:3.1rem;aspect-ratio:1;display:flex;align-items:center;justify-content:center;
  background:var(--red);color:#fff;font-family:'Noto Serif JP',serif;font-weight:700;font-size:1.6rem;border-radius:6px;transform:rotate(6deg);
  box-shadow:0 6px 14px rgba(120,10,25,.3),inset 0 0 0 2px rgba(255,255,255,.3)}

/* ---------- lead cards: hanging scrolls ---------- */
.cx-card{--pad:1.15rem;position:relative;container-type:inline-size;display:flex;flex-direction:column;padding:0 var(--pad) 0;border-radius:8px;background:linear-gradient(var(--c1),var(--c2));color:var(--ink);
  box-shadow:inset 0 0 0 2px var(--ink),7px 7px 0 rgba(31,26,24,.85);will-change:transform;transform-style:preserve-3d}
.cx-card.rec{box-shadow:inset 0 0 0 2px var(--ink),7px 7px 0 var(--red)}
.cx-rod{height:15px;margin:0 calc(var(--pad) * -1) 1.1rem;background:linear-gradient(var(--red),var(--red-deep));box-shadow:inset 0 2px 0 rgba(255,255,255,.3);border-radius:6px 6px 0 0}
.cx-rod.b{margin:1.4rem calc(var(--pad) * -1) 0;border-radius:0 0 6px 6px}

.cx-win{position:relative;height:clamp(13rem,64cqw,16.5rem);border-radius:0 0 .9rem .9rem;
  background:radial-gradient(circle at 50% 74%,#ec3a52 0 33%,transparent 34%),linear-gradient(#7a0a22,#33050f);
  clip-path:inset(-36% 0 0 0 round 0 0 .9rem .9rem);box-shadow:inset 0 0 0 2px rgba(31,26,24,.5)}
.cx-win img{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:100%;height:124%;max-width:none;object-fit:contain;object-position:center bottom;
  filter:drop-shadow(1.5px 0 0 #fff) drop-shadow(-1.5px 0 0 #fff) drop-shadow(0 1.5px 0 #fff) drop-shadow(0 -1.5px 0 #fff) drop-shadow(0 10px 14px rgba(0,0,0,.4))}
.cx-seal{position:absolute;right:.7rem;bottom:.7rem;z-index:10;width:2.7rem;aspect-ratio:1;display:flex;align-items:center;justify-content:center;
  background:var(--red);color:#fff1e4;font-family:'Noto Serif JP',serif;font-weight:700;font-size:1.5rem;border-radius:5px;transform:rotate(-8deg);
  box-shadow:0 5px 12px rgba(0,0,0,.5),inset 0 0 0 2px rgba(255,241,228,.35)}

.cx-name{margin:1rem 0 .3rem;height:2.4rem;display:flex;align-items:center;line-height:1;color:var(--ink);
  font-size:min(2.15rem,calc((100cqw - 2 * var(--pad)) / (var(--len) * .8)))}
.cx-role{margin:0;min-height:2.3em;font-size:.68rem;font-weight:600;letter-spacing:.12em;line-height:1.15;text-transform:uppercase;color:rgba(31,26,24,.78)}
/* on big screens the leads row breaks out of the page column so 5 cards sit side by side */
@media (min-width:1280px){.cx-wide{width:min(94vw,1500px);margin-left:calc(50% - min(47vw,750px))}}

/* ---------- info panel + closing call-to-action ---------- */
.cx-info{border-radius:22px;background:#fff;border:2px solid var(--ink);box-shadow:10px 10px 0 var(--ink)}
.cx-ico{width:3rem;height:3rem;border-radius:10px;margin-bottom:1rem;display:flex;align-items:center;justify-content:center;color:#fff;background:var(--red);box-shadow:3px 3px 0 var(--ink)}
.cx-hanko{display:inline-flex;align-items:center;justify-content:center;width:2.6rem;aspect-ratio:1;background:var(--red);color:#fff;
  font-family:'Noto Serif JP',serif;font-weight:700;font-size:1.4rem;border-radius:6px;transform:rotate(-4deg)}
.cx-cta{position:relative}
.cx-deco{display:none;position:absolute;height:auto;pointer-events:none}
@media (min-width:1024px){.cx-deco{display:block}}
.cx-tree{left:3%;top:-6px;width:150px}
.cx-koi2{right:3%;top:-34px;width:150px}

/* ---------- footer ---------- */
.cx-foot{background:var(--cream)}
.cx-foot-ttl{font-size:clamp(1.8rem,6vw,4.2rem);line-height:1;color:var(--ink)}

@media (prefers-reduced-motion:reduce){.cx *{scroll-behavior:auto !important}}
`;