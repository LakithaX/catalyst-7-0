import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { TagMark } from '../components/brand/CatalystTag';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import '../styles/samurai-registration.css';

// Configurable endpoint: set to your Google Apps Script Web App URL or custom backend.
// Leave empty for local demo mode.
export const REGISTRATION_ENDPOINT = '';

// ============================================================================
// FORM CONTENT  (edit questions here. Everything else adapts automatically)
// ============================================================================
interface QuestionDef {
  id: string;
  q: string;
  h?: string;
  t?: 'email' | 'tel' | 'area' | 'file';
  ac?: string;
  v?: 'email' | 'nic' | 'phone';
  w?: number;
  o?: string[];
  sp?: string;
  opt?: number;
}

interface ChapterDef {
  kanji: string;
  title: string;
  desc: string;
  questions: QuestionDef[];
  illustration: { image: string; alt: string };
}

const CHAPTERS: ChapterDef[] = [
  {
    kanji: '一',
    title: 'The Origin',
    desc: 'Who you are',
    illustration: {
      image: '/assets/illustrations/benkageyama-samurai-5135974_1920.png',
      alt: 'Traditional samurai warrior in full armor - The Origin',
    },
    questions: [
      { id: 'name', q: 'Full name', ac: 'name' },
      { id: 'gender', q: 'Gender', o: ['Male', 'Female', 'Other', 'Prefer not to say'] },
      { id: 'nic', q: 'NIC number', h: 'Old format (123456789V) or new 12-digit format', ac: 'off', v: 'nic' },
      { id: 'aiesecEmail', q: 'AIESEC email address', t: 'email', ac: 'email', v: 'email' },
      { id: 'email', q: 'Personal email address', t: 'email', ac: 'email', v: 'email' },
      { id: 'phone', q: 'Contact number', t: 'tel', ac: 'tel', v: 'phone', h: 'For example 077 123 4567' },
    ],
  },
  {
    kanji: '二',
    title: 'The Clan',
    desc: 'Where you come from',
    illustration: {
      image: '/assets/illustrations/gdj-building-8171699.svg',
      alt: 'Traditional Japanese pagoda clan architecture - The Clan',
    },
    questions: [
      {
        id: 'clan',
        q: 'Which clan do you call home?',
        h: 'Your university or campus',
        w: 1,
        o: [
          'SLIIT — Malabe Campus',
          'SLIIT City Uni',
          'Metropolitan Campus',
          'CINEC Campus',
          'William Angliss Institute @ SLIIT',
          'Other*',
        ],
      },
      {
        id: 'year',
        q: 'Which chapter of your journey are you in?',
        h: 'Your year of study',
        o: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Other'],
      },
      {
        id: 'sem',
        q: 'Which season of your journey are you currently walking?',
        h: 'Your current semester',
        o: ['Semester 1', 'Semester 2', 'Other'],
      },
      {
        id: 'faculty',
        q: 'Which house do you belong to?',
        h: 'Your faculty',
        w: 1,
        o: [
          'Faculty of Computing',
          'Faculty of Engineering',
          'Faculty of Humanities & Sciences',
          'SLIIT Business School',
          'William Angliss Institute',
          'Other*',
        ],
      },
    ],
  },
  {
    kanji: '三',
    title: 'The Code',
    desc: 'Your AIESEC path',
    illustration: {
      image: '/assets/illustrations/alessandro_hrdz-mask-6976331.png',
      alt: 'Samurai Mengu warrior mask of discipline - The Code',
    },
    questions: [
      { id: 'path', q: 'Which path do you walk?', h: 'Your AIESEC programme', o: ['oGV', 'oGT', 'iGV', 'iGT'] },
      { id: 'rank', q: 'What is your current rank?', o: ['Team Member', 'Team Leader', 'Specialist', 'Manager'] },
      {
        id: 'circle',
        q: 'Which inner circle do you serve?',
        h: 'Your function',
        sp: 'Which function?',
        o: ['TM', 'EM', 'BD', 'PR', 'MKT', 'Other relevant function*'],
      },
    ],
  },
  {
    kanji: '四',
    title: 'The Warrior',
    desc: 'Your spirit',
    illustration: {
      image: '/assets/samurai/samurai-combat.webp',
      alt: 'Samurai in active combat stance - The Warrior',
    },
    questions: [
      {
        id: 'type',
        q: 'Every warrior walks a different path. Which one is yours?',
        w: 1,
        o: [
          'The Samurai|Disciplined, committed and loyal',
          'The Ronin|Independent, adaptable and fearless',
          'The Strategist|Observant, calculated and visionary',
          'The Sensei|A guide who brings out the best in others',
          'The Scout|Curious, adventurous and always seeking more',
          'The Guardian|Protective, dependable and team-oriented',
        ],
      },
      {
        id: 'seek',
        q: 'What do you seek beyond the battlefield?',
        o: [
          'Personal growth',
          'Meaningful connections',
          'Leadership',
          'New perspectives',
          'Unforgettable memories',
          'All of the above',
        ],
      },
      {
        id: 'drive',
        q: 'A warrior is defined by what drives them. What drives you?',
        t: 'area',
        h: 'A few sentences is plenty.',
      },
    ],
  },
  {
    kanji: '五',
    title: 'The Camp',
    desc: 'Your wellbeing',
    illustration: {
      image: '/assets/illustrations/gdj-bonsai-tree-8143900.svg',
      alt: 'Peaceful Bonsai sanctuary tree - The Camp',
    },
    questions: [
      {
        id: 'diet',
        q: 'What fuels your journey?',
        h: 'Your food preference',
        o: ['Vegetarian', 'Non-vegetarian', 'Other'],
      },
      {
        id: 'allergy',
        q: 'Do you carry any dietary restrictions or allergies?',
        sp: 'List your restrictions or allergies',
        o: ['No', 'Yes*'],
      },
      {
        id: 'safety',
        q: 'Is there anything we should know to make your journey safer and more comfortable?',
        sp: 'What should we know?',
        o: ['No', 'Yes*'],
      },
    ],
  },
  {
    kanji: '六',
    title: 'The Final Scroll',
    desc: 'Before you enter',
    illustration: {
      image: '/assets/illustrations/benkageyama-coy-5135969_1920.png',
      alt: 'Legendary Dragon Koi swimming through current - The Final Scroll',
    },
    questions: [
      { id: 'cv', q: 'Present your warrior’s record.', t: 'file', h: 'Upload your updated CV.' },
      { id: 'ecName', q: 'Who should we call if your journey takes an unexpected turn?', h: 'Their full name', ac: 'off' },
      { id: 'ecPhone', q: 'Their contact number', t: 'tel', ac: 'off', v: 'phone' },
      {
        id: 'note',
        q: 'Before you cross the gates of Catalyst, is there anything you want us to know?',
        t: 'area',
        opt: 1,
      },
    ],
  },
];

const READY_LIST = [
  'Your NIC number',
  'Your AIESEC and personal email addresses',
  'Your updated CV (PDF or Word, up to 5 MB)',
  'An emergency contact’s name and number',
];

const VALIDATORS: Record<string, (v: string) => boolean | string> = {
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || 'Enter an email like name@example.com.',
  nic: (v) => /^(\d{9}[vVxX]|\d{12})$/.test(v.replace(/\s/g, '')) || 'Enter 9 digits followed by V or X, or 12 digits.',
  phone: (v) => /^\+?\d{9,13}$/.test(v.replace(/[\s-]/g, '')) || 'Enter a valid phone number, like 077 123 4567.',
};

const HERO = '/assets/hero-section-assets/';
const DRAFT_KEY = 'catalyst7-registration-draft';

const split = (t: string) =>
  t.split('').map((c, i) => (
    <span className="rg-ch" key={i} aria-hidden="true">
      {c}
    </span>
  ));

// decorative image that quietly disappears if the file is missing
const Deco = ({ src, cls, depth }: { src: string; cls: string; depth: number }) => (
  <div className={`rg-layer ${cls}`} data-depth={depth} aria-hidden="true">
    <img src={src} alt="" draggable={false} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
  </div>
);

const PETALS = Array.from({ length: 14 }, (_, i) => ({
  left: 2 + ((i * 71) % 96),
  scale: 0.7 + ((i * 37) % 70) / 100,
}));

// ============================================================================
// PAGE
// ============================================================================
export default function RegisterPage() {
  const [started, setStarted] = useState(false);
  const [cur, setCur] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvBase64, setCvBase64] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isDone, setIsDone] = useState(false);
  const [ticked, setTicked] = useState<boolean[]>(READY_LIST.map(() => false));
  const [dragOver, setDragOver] = useState(false);
  const [resumed, setResumed] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const fxRef = useRef<HTMLDivElement>(null);
  const stepRef = useRef<HTMLElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const wipeRef = useRef<HTMLDivElement>(null);
  const wipeBgRef = useRef<HTMLDivElement>(null);
  const wcRef = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const reduce = useRef(false);
  const entryDelay = useRef(0.1);
  const lastMagnet = useRef<HTMLElement | null>(null);

  // ---------------------------------------------------------------- setup
  useEffect(() => {
    reduce.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // keep answers if the page is refreshed (cleared when the tab closes or on submit)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.formData && Object.keys(d.formData).length) {
        setFormData(d.formData);
        if (d.started) {
          setStarted(true);
          setCur(Math.min(Math.max(Number(d.cur) || 0, 0), CHAPTERS.length - 1));
          setResumed(true);
        }
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (isDone) return;
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ formData, cur, started }));
    } catch { /* ignore */ }
  }, [formData, cur, started, isDone]);

  // ---------------------------------------------------------------- effects: sakura burst
  const burst = useCallback((x: number, y: number, n = 12) => {
    const fx = fxRef.current;
    if (reduce.current || !fx) return;
    for (let i = 0; i < n; i++) {
      const p = document.createElement('span');
      p.className = 'rg-bp';
      fx.appendChild(p);
      const a = Math.random() * Math.PI * 2;
      const d = gsap.utils.random(50, 150);
      gsap.fromTo(
        p,
        { x, y, scale: gsap.utils.random(0.6, 1.4), rotation: gsap.utils.random(0, 360), opacity: 1 },
        {
          x: x + Math.cos(a) * d, y: y + Math.sin(a) * d + 40, rotation: '+=220', opacity: 0,
          duration: gsap.utils.random(0.9, 1.6), ease: 'power2.out', onComplete: () => p.remove(),
        },
      );
    }
  }, []);

  const burstAt = (el: Element | null, n = 10) => {
    if (!el) return;
    const r = el.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, n);
  };

  // ---------------------------------------------------------------- chapter transition: brush wipe with chapter title card
  const transitionTo = useCallback((target: number, swap: () => void) => {
    if (busy.current) return;
    const wipe = wipeRef.current;
    const bg = wipeBgRef.current;
    const card = wcRef.current;
    if (reduce.current || !wipe || !bg || !card) {
      swap();
      window.scrollTo(0, 0);
      return;
    }
    busy.current = true;
    const ch = CHAPTERS[target];
    (card.querySelector('.rg-wc-kj') as HTMLElement).textContent = ch.kanji;
    (card.querySelector('.rg-wc-t') as HTMLElement).textContent = ch.title;
    (card.querySelector('.rg-wc-d') as HTMLElement).textContent = `Chapter ${target + 1} · ${ch.desc}`;
    const parts = card.children;
    entryDelay.current = 0.75;

    const tl = gsap.timeline({
      onComplete: () => {
        busy.current = false;
        gsap.set(wipe, { visibility: 'hidden', pointerEvents: 'none' });
      },
    });
    tl.set(wipe, { visibility: 'visible', pointerEvents: 'auto' })
      .set(bg, { transformOrigin: '0% 50%' })
      .fromTo(bg, { scaleX: 0 }, { scaleX: 1, duration: 0.45, ease: 'power4.inOut' })
      .fromTo(parts, { y: 40, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.08, ease: 'back.out(1.6)' }, '-=0.15')
      .call(() => { swap(); window.scrollTo(0, 0); })
      .to(parts, { y: -24, opacity: 0, duration: 0.3, ease: 'power2.in' }, '+=0.3')
      .set(bg, { transformOrigin: '100% 50%' })
      .to(bg, { scaleX: 0, duration: 0.55, ease: 'power4.inOut' });
  }, []);

  const goToChapter = (n: number) => {
    if (n === cur) return;
    transitionTo(n, () => { setCur(n); setSubmitError(''); });
  };

  const startJourney = () => transitionTo(0, () => { setStarted(true); setCur(0); });

  // ---------------------------------------------------------------- effects: entrances
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reduce.current) return;
    const delay = entryDelay.current;
    entryDelay.current = 0.1;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);

      if (!started) {
        gsap.from(q('.rg-ch'), { yPercent: -140, rotation: () => gsap.utils.random(-26, 26), opacity: 0, duration: 0.9, stagger: 0.06, ease: 'back.out(1.8)', delay: 0.2 });
        gsap.from(q('.rg-intro-fade'), { y: 28, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out', delay: 0.9 });
        gsap.fromTo(q('.rg-enso'), { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.6, ease: 'power3.out' });
        return;
      }

      if (isDone) {
        gsap.fromTo(q('.rg-done-in'), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: 'power3.out', delay: 0.1 });
        gsap.fromTo(q('.rg-ticket'), { y: 90, opacity: 0, rotation: -5 }, { y: 0, opacity: 1, rotation: 0, duration: 1.1, ease: 'expo.out', delay: 0.5 });
        gsap.fromTo(q('.rg-hanko'), { scale: 3.4, opacity: 0, rotation: -35 }, {
          scale: 1, opacity: 1, rotation: -10, duration: 0.5, ease: 'back.out(2.2)', delay: 1.3,
          onStart: () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            burst(w / 2, h * 0.45, 46);
            gsap.delayedCall(0.25, () => burst(w * 0.25, h * 0.5, 22));
            gsap.delayedCall(0.4, () => burst(w * 0.75, h * 0.5, 22));
          },
        });
        return;
      }

      gsap.fromTo(q('.rg-kj-big'), { scale: 3, opacity: 0, rotation: -24 }, { scale: 1, opacity: 1, rotation: 0, duration: 0.55, ease: 'back.out(2.1)', delay });
      gsap.fromTo(q('.rg-ttl'), { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, ease: 'power3.out', delay: delay + 0.1 });
      gsap.fromTo(q('.rg-q'), { y: 34, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.09, ease: 'power3.out', delay: delay + 0.2 });
      gsap.fromTo(q('.rg-disc-img'), { opacity: 0, scale: 0.78, rotation: -10 }, { opacity: 1, scale: 1, rotation: 0, duration: 1, ease: 'back.out(1.5)', delay });
      gsap.fromTo(q('.rg-cap > *'), { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power3.out', delay: delay + 0.15 });

      // desktop: put the cursor in the first text field once everything has settled
      if (window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
        gsap.delayedCall(delay + 0.9, () => {
          const first = root.querySelector<HTMLElement>('.rg-step input[type="text"], .rg-step input[type="email"], .rg-step input[type="tel"], .rg-step textarea');
          first?.focus({ preventScroll: true });
        });
      }
    }, root);

    return () => ctx.revert();
  }, [cur, started, isDone, burst]);

  // progress bar fill
  useEffect(() => {
    if (!fillRef.current) return;
    const pct = (cur / (CHAPTERS.length - 1)) * 100;
    gsap.to(fillRef.current, { width: `${pct}%`, duration: reduce.current ? 0 : 0.9, ease: 'power3.inOut' });
  }, [cur, started]);

  // ---------------------------------------------------------------- effects: ambient (parallax scenery + falling petals)
  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduce.current) return;
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);
      q('.rg-petal').forEach((p, i) => {
        gsap.set(p, { y: -40, rotation: gsap.utils.random(0, 360) });
        gsap.to(p, { y: window.innerHeight * 1.1, duration: gsap.utils.random(9, 16), ease: 'none', repeat: -1, delay: -gsap.utils.random(0, 14) });
        gsap.to(p, { x: gsap.utils.random(30, 90) * (i % 2 ? 1 : -1), rotation: '+=240', duration: gsap.utils.random(3, 6), ease: 'sine.inOut', yoyo: true, repeat: -1 });
      });
    }, root);

    let move: ((e: PointerEvent) => void) | null = null;
    if (window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
      const layers = (gsap.utils.toArray('.rg-layer', root) as HTMLElement[]).map((el) => ({
        d: parseFloat(el.dataset.depth || '0'),
        x: gsap.quickTo(el, 'x', { duration: 1.3, ease: 'power3.out' }),
        y: gsap.quickTo(el, 'y', { duration: 1.3, ease: 'power3.out' }),
      }));
      move = (e: PointerEvent) => {
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        layers.forEach((l) => { l.x(-nx * l.d); l.y(-ny * l.d * 0.6); });
      };
      window.addEventListener('pointermove', move);
    }
    return () => {
      if (move) window.removeEventListener('pointermove', move);
      ctx.revert();
    };
  }, []);

  // magnetic buttons (event delegation, mouse only)
  const onRootPointerMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || reduce.current) return;
    const m = (e.target as HTMLElement).closest?.('.rg-magnet') as HTMLElement | null;
    if (m) {
      const r = m.getBoundingClientRect();
      gsap.to(m, { x: (e.clientX - (r.left + r.width / 2)) * 0.16, y: (e.clientY - (r.top + r.height / 2)) * 0.26, duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
      if (lastMagnet.current && lastMagnet.current !== m) gsap.to(lastMagnet.current, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,.4)' });
      lastMagnet.current = m;
    } else if (lastMagnet.current) {
      gsap.to(lastMagnet.current, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1,.4)' });
      lastMagnet.current = null;
    }
  };

  // ---------------------------------------------------------------- validation + handlers
  const validateField = (q: QuestionDef): string => {
    if (q.o) {
      const val = formData[q.id];
      if (!val) return 'Choose one to continue.';
      if (formData[`${q.id}-isSpecial`] && !formData[`${q.id}-sp`]?.trim()) {
        return 'Add a few words to continue.';
      }
      return '';
    }

    if (q.t === 'file') {
      if (!cvFile) return 'Upload your CV to continue.';
      if (cvFile.size > 5242880) return 'That file is over 5 MB. Choose a smaller one.';
      if (!/\.(pdf|docx?)$/i.test(cvFile.name)) return 'Use a PDF or Word file.';
      return '';
    }

    const val = (formData[q.id] || '').trim();
    if (!val && !q.opt) return 'Fill this in to continue.';
    if (val && q.v && VALIDATORS[q.v]) {
      const res = VALIDATORS[q.v](val);
      if (res !== true) return res as string;
    }
    return '';
  };

  const clearError = (id: string) => {
    if (!errors[id]) return;
    setErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleTextChange = (id: string, val: string) => {
    setFormData((prev) => ({ ...prev, [id]: val }));
    clearError(id);
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>, id: string, val: string, isSpecial: boolean) => {
    setFormData((prev) => ({ ...prev, [id]: val, [`${id}-isSpecial`]: isSpecial ? 'true' : '' }));
    clearError(id);

    const label = e.currentTarget.closest('label') as HTMLElement | null;
    if (label && !reduce.current) {
      gsap.fromTo(label, { scale: 0.96 }, { scale: 1, duration: 0.5, ease: 'back.out(2.5)' });
      const dot = label.querySelector('.rg-dot');
      if (dot) gsap.fromTo(dot, { scale: 0.3 }, { scale: 1, duration: 0.55, ease: 'back.out(3)' });
      const r = label.getBoundingClientRect();
      burst(r.left + 30, r.top + r.height / 2, 7);
    }
  };

  const acceptFile = (file: File | undefined | null) => {
    if (!file) return;
    if (file.size > 5242880) {
      setErrors((prev) => ({ ...prev, cv: 'That file is over 5 MB. Choose a smaller one.' }));
      setCvFile(null);
      setCvBase64('');
      return;
    }
    if (!/\.(pdf|docx?)$/i.test(file.name)) {
      setErrors((prev) => ({ ...prev, cv: 'Use a PDF or Word file.' }));
      setCvFile(null);
      setCvBase64('');
      return;
    }
    setCvFile(file);
    clearError('cv');
    const reader = new FileReader();
    reader.onload = () => setCvBase64(reader.result as string);
    reader.readAsDataURL(file);
    burstAt(stepRef.current?.querySelector('.rg-drop') ?? null, 14);
  };

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    const curQuestions = CHAPTERS[cur].questions;
    const newErrors: Record<string, string> = {};

    curQuestions.forEach((q) => {
      const err = validateField(q);
      if (err) newErrors[q.id] = err;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const ids = Object.keys(newErrors);
      requestAnimationFrame(() => {
        // shake every field that needs attention
        ids.forEach((id) => {
          const el = stepRef.current?.querySelector(`[data-id="${id}"]`);
          if (el && !reduce.current) gsap.fromTo(el, { x: -10 }, { x: 0, duration: 0.7, ease: 'elastic.out(1,.22)' });
        });
        const first = document.getElementById(ids[0]) || (document.querySelector(`[name="${ids[0]}"]`) as HTMLElement | null);
        const block = stepRef.current?.querySelector(`[data-id="${ids[0]}"]`) as HTMLElement | null;
        block?.scrollIntoView({ behavior: reduce.current ? 'auto' : 'smooth', block: 'center' });
        first?.focus({ preventScroll: true });
      });
      return;
    }

    if (cur < CHAPTERS.length - 1) {
      burstAt(document.getElementById('nx'), 12);
      goToChapter(cur + 1);
      return;
    }

    // Submit registration
    setSubmitting(true);
    setSubmitError('');

    try {
      const payload = {
        ...formData,
        cvFileName: cvFile?.name || '',
        cvMimeType: cvFile?.type || '',
        cvBase64: cvBase64,
      };

      if (REGISTRATION_ENDPOINT) {
        const res = await fetch(REGISTRATION_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Network error');
      } else {
        // Simulated submission in demo mode
        await new Promise((r) => setTimeout(r, 800));
      }

      try { sessionStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
      entryDelay.current = 0.1;
      setIsDone(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setSubmitError('We couldn’t send your registration. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleReady = (i: number, el: HTMLElement) => {
    setTicked((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      if (next[i]) burstAt(el.querySelector('.rg-box'), 6);
      return next;
    });
  };

  // 3D tilt for the final ticket
  const onTicketMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || reduce.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(e.currentTarget, { rotationY: nx * 14, rotationX: -ny * 12, transformPerspective: 900, duration: 0.4, ease: 'power2.out' });
  };
  const onTicketLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, { rotationY: 0, rotationX: 0, duration: 0.8, ease: 'elastic.out(1,.5)' });
  };

  const ch = CHAPTERS[cur];
  const firstName = (formData.name || '').trim().split(/\s+/)[0] || 'Warrior';
  const readyCount = ticked.filter(Boolean).length;
  const allReady = readyCount === READY_LIST.length;
  const warriorType = (formData.type || '').split('|')[0];

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="rg" ref={rootRef} onPointerMove={onRootPointerMove}>
      {/* ---------- scenery (no nav bar: just art + a small way home) ---------- */}
      <div className="rg-bg" aria-hidden="true">
        <Deco src={`${HERO}background-mountains.webp`} cls="mount" depth={10} />
        <Deco src={`${HERO}atmospheric-mist.webp`} cls="mist" depth={22} />
        <Deco src={`${HERO}brush-strokes.webp`} cls="brush" depth={18} />
        <Deco src={`${HERO}sakura-branch.webp`} cls="sakura" depth={34} />
        <Deco src={`${HERO}torii-gate.webp`} cls="torii" depth={26} />
        <Deco src={`${HERO}pagoda.webp`} cls="pagoda" depth={20} />
      </div>
      <div className="rg-fx" ref={fxRef} aria-hidden="true">
        {PETALS.map((p, i) => (
          <span key={i} className="rg-petal" style={{ left: `${p.left}%`, scale: String(p.scale) }} />
        ))}
      </div>

      <Link to="/" state={{ directToHero: true }} className="rg-home" aria-label="Back to the Catalyst 7.0 home page">
        <span aria-hidden="true">←</span> Home
      </Link>

      {/* ================= INTRO ================= */}
      {!started && !isDone && (
        <section className="rg-intro">
          <img className="rg-enso" src={`${HERO}red-enso-sun.webp`} alt="" aria-hidden="true" draggable={false} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <div className="rg-intro-in">
            <p className="rg-tag rg-intro-fade">
              <TagMark /> CATALYST 7.0 · 参加登録
            </p>
            <h1 className="rg-h1" aria-label="Welcome, Warrior!">
              <span className="rg-w">{split('WELCOME,')}</span>
              <span className="rg-w">{split('WARRIOR!')}</span>
            </h1>
            <p className="rg-sub rg-intro-fade">Join Catalyst 7.0 in six short chapters. It takes about five minutes.</p>

            <div className="rg-ready rg-intro-fade">
              <p className="rg-ready-h">
                <span>What to have ready</span>
                <b>{readyCount} / {READY_LIST.length}</b>
              </p>
              <ul>
                {READY_LIST.map((t, i) => (
                  <li key={t}>
                    <button
                      type="button"
                      className={`rg-chk ${ticked[i] ? 'on' : ''}`}
                      aria-pressed={ticked[i]}
                      onClick={(e) => toggleReady(i, e.currentTarget)}
                    >
                      <span className="rg-box" aria-hidden="true">
                        <svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" /></svg>
                      </span>
                      <span className="rg-chk-t">{t}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <button type="button" className={`rg-btn rg-go rg-magnet rg-intro-fade ${allReady ? 'rdy' : ''}`} onClick={startJourney}>
              <span>ENTER THE GATE</span>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </button>
            <p className="rg-fine rg-intro-fade">Your answers are kept while this tab stays open.</p>
          </div>
        </section>
      )}

      {/* ================= JOURNEY ================= */}
      {started && !isDone && (
        <main className="rg-main">
          <div className="rg-card">
            {/* progress track */}
            <div className="rg-prog">
              <div className="rg-line" aria-hidden="true" />
              <div className="rg-fill" ref={fillRef} aria-hidden="true" />
              {CHAPTERS.map((c, i) => {
                const state = i === cur ? 'cur' : i < cur ? 'done' : '';
                return (
                  <button
                    key={c.title}
                    type="button"
                    className={`rg-node ${state}`}
                    style={{ left: `${(i / (CHAPTERS.length - 1)) * 100}%` }}
                    disabled={i >= cur}
                    onClick={() => goToChapter(i)}
                    aria-label={`${i < cur ? 'Go back to ' : ''}Chapter ${i + 1}: ${c.title}`}
                    aria-current={i === cur ? 'step' : undefined}
                  >
                    <span aria-hidden="true">{c.kanji}</span>
                  </button>
                );
              })}
            </div>
            <p className="rg-pl" aria-live="polite">
              Chapter {cur + 1} of {CHAPTERS.length} · {ch.title}
            </p>
            {resumed && cur >= 0 && (
              <p className="rg-resumed" role="status">
                Welcome back. We kept your answers. <button type="button" onClick={() => setResumed(false)}>Dismiss</button>
              </p>
            )}

            <form id="form" noValidate onSubmit={handleContinue}>
              <section className="rg-step" ref={stepRef}>
                <div className="rg-head">
                  <span className="rg-kj-big" aria-hidden="true">{ch.kanji}</span>
                  <div className="rg-ttl">
                    <h2 tabIndex={-1}>{ch.title}</h2>
                    <p>{ch.desc}</p>
                  </div>
                </div>

                {ch.questions.map((q, qi) => {
                  const err = errors[q.id];
                  const hasSpecial = q.o?.some((opt) => opt.endsWith('*'));
                  const isSpecialSelected = !!formData[`${q.id}-isSpecial`];
                  const num = String(qi + 1).padStart(2, '0');

                  // ---- choice cards
                  if (q.o) {
                    return (
                      <fieldset key={`${cur}-${q.id}`} className={`rg-q rg-f ${err ? 'bad' : ''}`} data-id={q.id} aria-describedby={`h-${q.id} e-${q.id}`}>
                        <legend><em>{num}</em>{q.q}</legend>
                        {q.h && <p className="rg-h" id={`h-${q.id}`}>{q.h}</p>}
                        <div className={`rg-opts ${q.w ? 'wide' : ''}`}>
                          {q.o.map((optStr) => {
                            const isSpecialOpt = optStr.endsWith('*');
                            const cleanStr = isSpecialOpt ? optStr.slice(0, -1) : optStr;
                            const [title, desc] = cleanStr.split('|');
                            const checked = formData[q.id] === title;
                            return (
                              <label key={title} className={`rg-opt ${checked ? 'on' : ''}`}>
                                <input
                                  type="radio"
                                  name={q.id}
                                  value={title}
                                  checked={checked}
                                  onChange={(e) => handleRadioChange(e, q.id, title, isSpecialOpt)}
                                />
                                <i className="rg-dot" />
                                <span>
                                  <b>{title}</b>
                                  {desc && <small>{desc}</small>}
                                </span>
                              </label>
                            );
                          })}
                        </div>

                        {hasSpecial && isSpecialSelected && (
                          <div className="rg-sp">
                            <label htmlFor={`${q.id}-sp`}>{q.sp || 'Please specify'}</label>
                            <input
                              className="rg-in"
                              id={`${q.id}-sp`}
                              name={`${q.id}-sp`}
                              type="text"
                              autoComplete="off"
                              value={formData[`${q.id}-sp`] || ''}
                              onChange={(e) => handleTextChange(`${q.id}-sp`, e.target.value)}
                            />
                          </div>
                        )}
                        {err && <p className="rg-err" id={`e-${q.id}`} role="alert"><i>!</i>{err}</p>}
                      </fieldset>
                    );
                  }

                  // ---- textarea
                  if (q.t === 'area') {
                    const textVal = formData[q.id] || '';
                    return (
                      <div key={`${cur}-${q.id}`} className={`rg-q rg-f ${err ? 'bad' : ''}`} data-id={q.id}>
                        <label htmlFor={q.id} className="rg-lab">
                          <em>{num}</em>{q.q}
                          {q.opt ? <span className="rg-op">Optional</span> : null}
                        </label>
                        {q.h && <p className="rg-h" id={`h-${q.id}`}>{q.h}</p>}
                        <textarea
                          className="rg-in"
                          id={q.id}
                          name={q.id}
                          rows={4}
                          maxLength={600}
                          value={textVal}
                          onChange={(e) => handleTextChange(q.id, e.target.value)}
                          aria-describedby={`h-${q.id} e-${q.id}`}
                        />
                        <p className="rg-cnt" aria-hidden="true">
                          <span style={{ width: `${(textVal.length / 600) * 100}%` }} />
                          {textVal.length} / 600
                        </p>
                        {err && <p className="rg-err" id={`e-${q.id}`} role="alert"><i>!</i>{err}</p>}
                      </div>
                    );
                  }

                  // ---- file drop
                  if (q.t === 'file') {
                    return (
                      <div key={`${cur}-${q.id}`} className={`rg-q rg-f ${err ? 'bad' : ''}`} data-id={q.id}>
                        <label htmlFor={q.id} className="rg-lab"><em>{num}</em>{q.q}</label>
                        {q.h && <p className="rg-h" id={`h-${q.id}`}>{q.h}</p>}
                        <div
                          className={`rg-drop ${dragOver ? 'over' : ''} ${cvFile ? 'has' : ''}`}
                          onDragEnter={() => setDragOver(true)}
                          onDragLeave={() => setDragOver(false)}
                          onDrop={() => setDragOver(false)}
                        >
                          <i className="rg-scr" aria-hidden="true">巻</i>
                          <span className="rg-fn">
                            {cvFile ? cvFile.name : dragOver ? 'Drop it here' : 'Drag your CV here, or click to choose'}
                            <small>{cvFile ? 'Ready to send. Click to replace.' : 'PDF or Word, up to 5 MB'}</small>
                          </span>
                          <input
                            type="file"
                            id={q.id}
                            name={q.id}
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => acceptFile(e.target.files?.[0])}
                            aria-describedby={`h-${q.id} e-${q.id}`}
                          />
                        </div>
                        {err && <p className="rg-err" id={`e-${q.id}`} role="alert"><i>!</i>{err}</p>}
                      </div>
                    );
                  }

                  // ---- text / email / tel
                  const val = (formData[q.id] || '').trim();
                  const valid = !!val && !err && !!q.v && VALIDATORS[q.v](val) === true;
                  return (
                    <div key={`${cur}-${q.id}`} className={`rg-q rg-f ${err ? 'bad' : ''}`} data-id={q.id}>
                      <label htmlFor={q.id} className="rg-lab"><em>{num}</em>{q.q}</label>
                      {q.h && <p className="rg-h" id={`h-${q.id}`}>{q.h}</p>}
                      <div className="rg-inwrap">
                        <input
                          className="rg-in"
                          id={q.id}
                          name={q.id}
                          type={q.t || 'text'}
                          autoComplete={q.ac || 'off'}
                          inputMode={q.t === 'tel' ? 'tel' : undefined}
                          value={formData[q.id] || ''}
                          onChange={(e) => handleTextChange(q.id, e.target.value)}
                          aria-describedby={`h-${q.id} e-${q.id}`}
                        />
                        {valid && (
                          <span className="rg-ok" aria-hidden="true">
                            <svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" /></svg>
                          </span>
                        )}
                      </div>
                      {err && <p className="rg-err" id={`e-${q.id}`} role="alert"><i>!</i>{err}</p>}
                    </div>
                  );
                })}
              </section>

              {submitError && (
                <p className="rg-err" id="sub-err" role="alert" style={{ marginBottom: 12 }}><i>!</i>{submitError}</p>
              )}

              <div className="rg-nav">
                {cur > 0 && (
                  <button type="button" className="rg-btn rg-bk" id="bk" onClick={() => goToChapter(cur - 1)}>
                    Back
                  </button>
                )}
                <button type="submit" className="rg-btn rg-go rg-magnet" id="nx" disabled={submitting}>
                  <span>{submitting ? 'Sending…' : cur === CHAPTERS.length - 1 ? 'Submit registration' : 'Continue'}</span>
                  {!submitting && <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>}
                </button>
              </div>
            </form>
          </div>

          {/* art disc */}
          <aside className="rg-art" aria-hidden={false}>
            <div className="rg-disc">
              <img className="rg-ring" src={`${HERO}red-enso-sun.webp`} alt="" draggable={false} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              <div className="rg-plate" />
              <img key={cur} className="rg-disc-img" src={ch.illustration.image} alt={ch.illustration.alt} draggable={false} />
            </div>
            <div className="rg-cap">
              <span className="rg-cap-kj" aria-hidden="true">{ch.kanji}</span>
              <b>{ch.title}</b>
              <small>{ch.desc}</small>
            </div>
          </aside>
        </main>
      )}

      {/* ================= SUCCESS ================= */}
      {isDone && (
        <section className="rg-done">
          <p className="rg-tag rg-done-in"><i /> 登録完了 · REGISTERED</p>
          <h2 className="rg-done-h rg-done-in" tabIndex={-1}>Your journey begins, {firstName}.</h2>
          <p className="rg-sub rg-done-in">
            Your Catalyst 7.0 registration is in. Keep an eye on your AIESEC email for updates.
          </p>

          <div className="rg-ticket" onPointerMove={onTicketMove} onPointerLeave={onTicketLeave}>
            <div className="rg-ticket-top">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><TagMark />CATALYST 7.0</span>
              <span>WARRIOR PASS</span>
            </div>
            <h3>{formData.name || 'Warrior'}</h3>
            <dl>
              <div><dt>Clan</dt><dd>{formData.clan === 'Other' || formData['clan-isSpecial'] ? formData['clan-sp'] || formData.clan : formData.clan || '·'}</dd></div>
              <div><dt>Path</dt><dd>{formData.path || '·'}</dd></div>
              <div><dt>Warrior</dt><dd>{warriorType || '·'}</dd></div>
            </dl>
            <div className="rg-hanko" aria-hidden="true">道</div>
          </div>

          <Link to="/" state={{ directToHero: true }} className="rg-btn rg-go rg-magnet rg-done-in rg-home-btn">
            <span>Return to Home</span>
          </Link>
        </section>
      )}

      {/* ================= CHAPTER WIPE ================= */}
      <div className="rg-wipe" ref={wipeRef} aria-hidden="true">
        <div className="rg-wipe-bg" ref={wipeBgRef} />
        <div className="rg-wc" ref={wcRef}>
          <span className="rg-wc-kj" />
          <span className="rg-wc-t" />
          <span className="rg-wc-d" />
        </div>
      </div>
    </div>
  );
}