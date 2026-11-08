import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/samurai-registration.css';
import EmailSignIn from '../components/EmailSignIn';
import { submitRegistration } from '../lib/booking';
import { errorMessage } from '../lib/supabase';


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
  illustration: {
    image: string;
    alt: string;
  };
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
      image: '/assets/samurai/samurai-combat.png',
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

const VALIDATORS: Record<string, (v: string) => boolean | string> = {
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || 'Enter an email like name@example.com.',
  nic: (v) => /^(\d{9}[vVxX]|\d{12})$/.test(v.replace(/\s/g, '')) || 'Enter 9 digits followed by V or X, or 12 digits.',
  phone: (v) => /^\+?\d{9,13}$/.test(v.replace(/[\s-]/g, '')) || 'Enter a valid phone number, like 077 123 4567.',
};

export default function RegisterPage() {
  const [cur, setCur] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [cvFile, setCvFile] = useState<File | null>(null);
  const submissionKey = useRef(crypto.randomUUID());
  const [registrationReference, setRegistrationReference] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isDone, setIsDone] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [guideOpen, setGuideOpen] = useState(true);

  const stepRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const checkMob = () => {
      const mob = window.innerWidth <= 860;
      setIsMobile(mob);
      if (mob) setGuideOpen(false);
    };
    checkMob();
    window.addEventListener('resize', checkMob);
    return () => window.removeEventListener('resize', checkMob);
  }, []);

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

  const handleTextChange = (id: string, val: string, validatorKey?: string) => {
    setFormData((prev) => ({ ...prev, [id]: val }));
    if (errors[id]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const handleRadioChange = (id: string, val: string, isSpecial: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [id]: val,
      [`${id}-isSpecial`]: isSpecial ? 'true' : '',
    }));
    if (errors[id]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5242880) {
      setErrors((prev) => ({ ...prev, cv: 'That file is over 5 MB. Choose a smaller one.' }));
      setCvFile(null);
      return;
    }
    if (!/\.(pdf|docx?)$/i.test(file.name)) {
      setErrors((prev) => ({ ...prev, cv: 'Use a PDF or Word file.' }));
      setCvFile(null);
      return;
    }

    submissionKey.current = crypto.randomUUID();
    setCvFile(file);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.cv;
      return next;
    });


  };

  const goToChapter = (n: number) => {
    setCur(n);
    setSubmitError('');
    window.scrollTo({ top: isMobile ? 80 : 0, behavior: 'smooth' });
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
      // Focus first erroneous field
      const firstId = Object.keys(newErrors)[0];
      const el = document.getElementById(firstId) || document.querySelector(`[name="${firstId}"]`) as HTMLElement;
      el?.focus();
      return;
    }

    if (cur < CHAPTERS.length - 1) {
      goToChapter(cur + 1);
      return;
    }

    // Submit registration
    setSubmitting(true);
    setSubmitError('');

    try {
      const result = await submitRegistration(submissionKey.current, formData, cvFile!);
      setRegistrationReference(result.reference);

      setIsDone(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setSubmitError(errorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const currentIllustration = CHAPTERS[cur].illustration;
  const firstName = (formData.name || '').trim().split(/\s+/)[0] || 'Warrior';

  return (
    <div className="samurai-registration-page">
      {/* Top Header Band with Torn White Edge */}
      <header className="top">
        <Link to="/" className="logo" title="Catalyst 7.0 Home">
          <img
            src="/assets/catalyst_7_logo.png"
            alt="Catalyst 7.0 Logo"
            className="h-8 sm:h-10 w-auto object-contain"
          />
        </Link>
        <nav aria-label="Main Navigation">
          <Link to="/">HOME</Link>
          <Link to="/about">ABOUT</Link>
          <Link to="/gallery">GALLERY</Link>
          <Link to="/merch">MERCH</Link>
          <Link to="/#contact">CONTACT</Link>
        </nav>
      </header>

      {/* Main Form Flow */}
      <main>
        <div className="col">
          {!isDone ? (
            <>
              <h1>WELCOME, WARRIOR!</h1>
              <p className="sub">Join Catalyst 7.0 in six short chapters. It takes about five minutes.</p>

              {/* What to have ready Guide Accordion */}
              <details className="guide" open={guideOpen} onToggle={(e) => setGuideOpen(e.currentTarget.open)}>
                <summary>What to have ready</summary>
                <ul>
                  <li>Your NIC number</li>
                  <li>Your AIESEC and personal email addresses</li>
                  <li>Your updated CV (PDF or Word, up to 5 MB)</li>
                  <li>An emergency contact’s name and number</li>
                </ul>
              </details>

              {/* Progress Bar & Label */}
              <div id="prog">
                <ol className="trk" id="trk" aria-hidden="true">
                  {CHAPTERS.map((_, i) => (
                    <li key={i} className={i <= cur ? 'on' : ''} />
                  ))}
                </ol>
                <p className="pl" id="pl" aria-live="polite">
                  Chapter {cur + 1} of {CHAPTERS.length}: {CHAPTERS[cur].title}
                </p>
              </div>

              {/* Active Step Form */}
              <form id="form" noValidate onSubmit={handleContinue} ref={formRef}>
                <section className="step" ref={stepRef}>
                  <h2 tabIndex={-1}>
                    <span className="kj" aria-hidden="true">
                      {CHAPTERS[cur].kanji}
                    </span>
                    {CHAPTERS[cur].title}
                  </h2>
                  <p className="d">{CHAPTERS[cur].desc}</p>

                  {CHAPTERS[cur].questions.map((q) => {
                    const err = errors[q.id];
                    const hasSpecial = q.o?.some((opt) => opt.endsWith('*'));
                    const isSpecialSelected = !!formData[`${q.id}-isSpecial`];

                    // Radio group fieldset
                    if (q.o) {
                      return (
                        <fieldset
                          key={q.id}
                          className={`f ${err ? 'bad' : ''}`}
                          data-id={q.id}
                          aria-describedby={`h-${q.id} e-${q.id}`}
                        >
                          <legend>{q.q}</legend>
                          {q.h && (
                            <p className="h" id={`h-${q.id}`}>
                              {q.h}
                            </p>
                          )}
                          <div className={`opts ${q.w ? 'wide' : ''}`}>
                            {q.o.map((optStr) => {
                              const isSpecialOpt = optStr.endsWith('*');
                              const cleanStr = isSpecialOpt ? optStr.slice(0, -1) : optStr;
                              const [title, desc] = cleanStr.split('|');
                              const checked = formData[q.id] === title;

                              return (
                                <label key={title} className="opt">
                                  <input
                                    type="radio"
                                    name={q.id}
                                    value={title}
                                    checked={checked}
                                    onChange={() => handleRadioChange(q.id, title, isSpecialOpt)}
                                  />
                                  <i className="dot" />
                                  <span>
                                    <b>{title}</b>
                                    {desc && <small>{desc}</small>}
                                  </span>
                                </label>
                              );
                            })}
                          </div>

                          {/* Specific input for Other/Yes options */}
                          {hasSpecial && isSpecialSelected && (
                            <div className="sp">
                              <label htmlFor={`${q.id}-sp`}>{q.sp || 'Please specify'}</label>
                              <input
                                className="in"
                                id={`${q.id}-sp`}
                                name={`${q.id}-sp`}
                                type="text"
                                autoComplete="off"
                                value={formData[`${q.id}-sp`] || ''}
                                onChange={(e) => handleTextChange(`${q.id}-sp`, e.target.value)}
                              />
                            </div>
                          )}

                          {err && (
                            <p className="err" id={`e-${q.id}`} role="alert">
                              {err}
                            </p>
                          )}
                        </fieldset>
                      );
                    }

                    // Textarea field
                    if (q.t === 'area') {
                      const textVal = formData[q.id] || '';
                      return (
                        <div key={q.id} className={`f ${err ? 'bad' : ''}`} data-id={q.id}>
                          <label htmlFor={q.id}>
                            {q.q}
                            {q.opt ? <span className="op">Optional</span> : null}
                          </label>
                          {q.h && (
                            <p className="h" id={`h-${q.id}`}>
                              {q.h}
                            </p>
                          )}
                          <textarea
                            className="in"
                            id={q.id}
                            name={q.id}
                            rows={4}
                            maxLength={600}
                            value={textVal}
                            onChange={(e) => handleTextChange(q.id, e.target.value)}
                            aria-describedby={`h-${q.id} e-${q.id}`}
                          />
                          <p className="cnt" aria-hidden="true">
                            {textVal.length} / 600
                          </p>
                          {err && (
                            <p className="err" id={`e-${q.id}`} role="alert">
                              {err}
                            </p>
                          )}
                        </div>
                      );
                    }

                    // File upload field
                    if (q.t === 'file') {
                      return (
                        <div key={q.id} className={`f ${err ? 'bad' : ''}`} data-id={q.id}>
                          <label htmlFor={q.id}>{q.q}</label>
                          {q.h && (
                            <p className="h" id={`h-${q.id}`}>
                              {q.h}
                            </p>
                          )}
                          <div className="drop">
                            <i className="scr" aria-hidden="true">
                              巻
                            </i>
                            <span className="fn">
                              {cvFile ? cvFile.name : 'Choose a PDF or Word file'}
                              <small>Up to 5 MB</small>
                            </span>
                            <input
                              type="file"
                              id={q.id}
                              name={q.id}
                              accept=".pdf,.doc,.docx"
                              onChange={handleFileChange}
                              aria-describedby={`h-${q.id} e-${q.id}`}
                            />
                          </div>
                          {err && (
                            <p className="err" id={`e-${q.id}`} role="alert">
                              {err}
                            </p>
                          )}
                        </div>
                      );
                    }

                    // Standard text / email / tel input
                    return (
                      <div key={q.id} className={`f ${err ? 'bad' : ''}`} data-id={q.id}>
                        <label htmlFor={q.id}>{q.q}</label>
                        {q.h && (
                          <p className="h" id={`h-${q.id}`}>
                            {q.h}
                          </p>
                        )}
                        <input
                          className="in"
                          id={q.id}
                          name={q.id}
                          type={q.t || 'text'}
                          autoComplete={q.ac || 'off'}
                          inputMode={q.t === 'tel' ? 'tel' : undefined}
                          value={formData[q.id] || ''}
                          onChange={(e) => handleTextChange(q.id, e.target.value, q.v)}
                          aria-describedby={`h-${q.id} e-${q.id}`}
                        />
                        {err && (
                          <p className="err" id={`e-${q.id}`} role="alert">
                            {err}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </section>

                {cur === CHAPTERS.length - 1 && <EmailSignIn initialEmail={formData.email || ''} />}

                {submitError && (
                  <p className="err" id="sub-err" role="alert" style={{ marginBottom: 12 }}>
                    {submitError}
                  </p>
                )}

                <div className="nav">
                  {cur > 0 && (
                    <button type="button" className="btn bk" id="bk" onClick={() => goToChapter(cur - 1)}>
                      Back
                    </button>
                  )}
                  <button type="submit" className="btn go" id="nx" disabled={submitting}>
                    {submitting
                      ? 'Sending…'
                      : cur === CHAPTERS.length - 1
                      ? 'Submit registration'
                      : 'Continue'}
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* Success / Completion Seal Screen */
            <div id="done">
              <div className="seal" aria-hidden="true">
                道
              </div>
              <h2 tabIndex={-1}>Your journey begins, {firstName}.</h2>
              <p>Your Catalyst 7.0 registration is in. Keep an eye on your AIESEC email for updates.</p>
              <p className="break-all">Reference: {registrationReference}</p>
              <div style={{ marginTop: 28 }}>
                <Link to="/" className="btn go" style={{ display: 'inline-block', lineHeight: '52px', padding: '0 36px' }}>
                  Return to Home
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Aside: Dynamic Art Disc & Desktop Chapter Map */}
        <aside className="art">
          <div className="disc">
            <img
              src={currentIllustration.image}
              alt={currentIllustration.alt}
              className="disc-img"
              loading="lazy"
            />
          </div>
          <ol className="map" id="map" aria-label="Chapters">
            {CHAPTERS.map((ch, idx) => {
              const isCur = idx === cur;
              const isPast = idx < cur;
              return (
                <li
                  key={ch.title}
                  className={`${isCur ? 'cur' : ''} ${isPast ? 'done' : ''}`}
                  aria-current={isCur ? 'step' : undefined}
                >
                  <i aria-hidden="true">{ch.kanji}</i>
                  <span>
                    <b>{ch.title}</b>
                    <small>{ch.desc}</small>
                  </span>
                </li>
              );
            })}
          </ol>
        </aside>
      </main>
    </div>
  );
}
