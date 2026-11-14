import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MessageCircle, ArrowRight, ArrowLeft, Megaphone, Users, TrendingUp, Heart } from 'lucide-react';
import Navbar from '../components/Navbar';
import { PARTNERSHIP_CONTACTS, type PartnershipContact } from '../data/partnershipContacts';

// ─────────────────────────────────────────────────────────────
// EDIT THE WORDING HERE
// ─────────────────────────────────────────────────────────────
const WHY = [
  { kanji: '見', icon: Megaphone, title: 'Be seen by the right crowd', text: 'Put your brand in front of motivated student leaders and young professionals: on stage, on screen and at every touchpoint of Catalyst 7.0.' },
  { kanji: '縁', icon: Users, title: 'Real conversations', text: 'Meet delegates face to face. Run a booth, a session or a challenge and build relationships that last long after the day ends.' },
  { kanji: '成', icon: TrendingUp, title: 'Grow with young talent', text: 'Back a youth-led movement and help shape the next generation of leaders. Your support funds learning, not just logos.' },
  { kanji: '心', icon: Heart, title: 'Impact you can point to', text: 'Link your name to a conference built around leadership and purpose, something your team and customers can be proud of.' },
];

const STEPS = [
  { n: '01', title: 'Say hello', text: 'Call, chat or email any member of the team below. No forms, no waiting.' },
  { n: '02', title: 'Shape your package', text: 'Tell us your goals. We match them with what Catalyst 7.0 can offer you.' },
  { n: '03', title: 'Show up and shine', text: 'We handle the details. You get in front of the delegates.' },
];

// optional per-person photo framing, e.g. 'gihansa-hasithmi': '40% 0%'  (first number: lower = person moves right)
const PHOTO_POS: Record<string, string> = {};

// ─────────────────────────────────────────────────────────────
const INK = '#2a0310';
const RED = '#C9362B';
const RED_DARK = '#B51E23';
const GOLD = '#d6b25e';
const CREAM = '#fff1e4';
const F_JANSINA = "'Jansina','Zen Antique','Shippori Mincho','Noto Serif JP',serif";
const F_LABEL = "'Noto Sans JP','Montserrat',sans-serif";
const F_HEAD = "'Shippori Mincho','Noto Serif JP',serif";
const F_BRUSH = "'Yuji Boku','Zen Antique','Noto Serif JP',serif";
const NUM = ['一', '二', '三', '四', '五', '六', '七', '八'];

const digits = (n: string) => n.replace(/[^\d]/g, '');
const telHref = (n: string) => `tel:+${digits(n)}`;
const waHref = (n: string) => `https://wa.me/${digits(n)}`;
const formatPhone = (n: string) => {
  const d = digits(n);
  return d.startsWith('94') && d.length === 11 ? `+94 ${d.slice(2, 4)} ${d.slice(4, 7)} ${d.slice(7)}` : n;
};
const initials = (name: string) => name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();

const WAVE = (c: string) =>
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='20' viewBox='0 0 40 20'%3E%3Cg fill='none' stroke='${c}' stroke-width='1.4'%3E%3Ccircle cx='0' cy='10' r='18'/%3E%3Ccircle cx='0' cy='10' r='12'/%3E%3Ccircle cx='0' cy='10' r='6'/%3E%3Ccircle cx='40' cy='10' r='18'/%3E%3Ccircle cx='40' cy='10' r='12'/%3E%3Ccircle cx='40' cy='10' r='6'/%3E%3Ccircle cx='20' cy='20' r='18'/%3E%3Ccircle cx='20' cy='20' r='12'/%3E%3Ccircle cx='20' cy='20' r='6'/%3E%3C/g%3E%3C/svg%3E")`;

const CSS = `
.pp{background:#F8F3E9;color:${INK};font-family:'Inter',system-ui,sans-serif;overflow-x:clip}
.pp *{box-sizing:border-box}
[data-rv]{opacity:0;transform:translateY(24px);transition:opacity .7s ease,transform .8s cubic-bezier(.22,1,.36,1);transition-delay:calc(var(--d,0)*1ms)}
[data-rv].in{opacity:1;transform:none}
@media (prefers-reduced-motion:reduce){[data-rv]{opacity:1;transform:none;transition:none}.pp-petal,.pp-sun{animation:none!important}}

.pp-band{height:20px;background-size:40px 20px;background-repeat:repeat-x;background-position:center}
.pp-band.gold{background-image:${WAVE('%23d6b25e')};opacity:.55}
.pp-band.red{background-image:${WAVE('%23C9362B')};opacity:.5}

/* ---------- hero ---------- */
.pp-hero{position:relative;overflow:hidden;color:${CREAM};background:radial-gradient(ellipse at 50% 38%,#a8142f 0,#7a0a22 46%,#3a0613 100%);padding:clamp(28px,5vw,56px) 20px clamp(60px,9vw,110px)}
.pp-sun{position:absolute;left:50%;top:clamp(40px,8vw,90px);width:min(70vw,640px);aspect-ratio:1;transform:translateX(-50%);border-radius:50%;background:radial-gradient(circle at 40% 34%,#ffb89f,#ff6a52 55%,#d93a2b);opacity:.92;animation:ppSun 9s ease-in-out infinite alternate}
@keyframes ppSun{from{transform:translateX(-50%) scale(1)}to{transform:translateX(-50%) scale(1.035)}}
.pp-petal{position:absolute;top:0;width:12px;height:9px;background:linear-gradient(135deg,#ffd0d9,#f08aa0);border-radius:100% 0 100% 0;opacity:.9;animation:ppFall linear infinite}
@keyframes ppFall{0%{transform:translate3d(0,-20px,0) rotate(0);opacity:0}12%{opacity:.9}88%{opacity:.9}100%{transform:translate3d(60px,640px,0) rotate(320deg);opacity:0}}
.pp-hero-in{position:relative;z-index:2;max-width:1100px;margin:0 auto;text-align:center}
.pp-back{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 4px;color:${CREAM};opacity:.85;font:700 11px ${F_LABEL};letter-spacing:.2em;text-transform:uppercase;text-decoration:none}
.pp-back:hover{opacity:1;color:#fff}
.pp-kicker{display:flex;align-items:center;justify-content:center;gap:12px;margin:18px 0 8px}
.pp-hanko{display:grid;place-items:center;border-radius:4px;background:${RED};color:#fff;font-family:${F_BRUSH};font-weight:700}
.pp-h1{margin:0;line-height:.95;font-family:${F_JANSINA};font-weight:400;font-synthesis:none;text-transform:uppercase}
.pp-h1 .a{display:block;font-size:clamp(1.6rem,5vw,3rem);letter-spacing:.06em;color:${CREAM};text-shadow:0 3px 0 ${INK}}
.pp-h1 .b{display:block;font-size:clamp(3.4rem,15vw,9.5rem);letter-spacing:.02em;color:${CREAM};-webkit-text-stroke:max(2px,.45vw) ${INK};paint-order:stroke fill;text-shadow:.05em .06em 0 ${RED}}
.pp-lead{max-width:34rem;margin:22px auto 0;font-size:clamp(15px,2vw,18px);line-height:1.65;color:#ffe3d3}
.pp-cta{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-top:28px}
.pp-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:50px;padding:0 28px;border-radius:999px;font:700 13px ${F_LABEL};letter-spacing:.14em;text-transform:uppercase;text-decoration:none;cursor:pointer;transition:transform .25s,background .25s,color .25s,border-color .25s}
.pp-btn.solid{background:${CREAM};color:${RED_DARK};box-shadow:0 6px 0 ${INK}}
.pp-btn.solid:hover{transform:translateY(-2px)}
.pp-btn.line{border:2px solid ${CREAM};color:${CREAM};background:transparent}
.pp-btn.line:hover{background:${CREAM};color:${RED_DARK}}
.pp-faces{display:flex;align-items:center;justify-content:center;gap:14px;margin-top:34px}
.pp-faces .row{display:flex}
.pp-face{width:46px;height:46px;margin-left:-10px;border-radius:50%;border:2px solid ${CREAM};overflow:hidden;background:linear-gradient(#e24a35,#8c0b26)}
.pp-face:first-child{margin-left:0}
.pp-face img{width:100%;height:100%;object-fit:cover;object-position:50% 0}
.pp-faces span{font:700 11px ${F_LABEL};letter-spacing:.18em;text-transform:uppercase;color:#ffe3d3}

/* ---------- sections ---------- */
.pp-sec{padding:clamp(56px,8vw,96px) 20px}
.pp-wrap{max-width:1180px;margin:0 auto}
.pp-eyebrow{display:flex;align-items:center;gap:12px;margin-bottom:12px}
.pp-eyebrow .lb{font:700 10px ${F_LABEL};letter-spacing:.25em;text-transform:uppercase;color:${RED}}
.pp-eyebrow .bk{font-family:${F_BRUSH};font-size:20px;letter-spacing:.16em}
.pp-h2{margin:0;font-family:${F_JANSINA};font-weight:400;font-synthesis:none;text-transform:uppercase;font-size:clamp(2rem,6vw,3.6rem);letter-spacing:.03em;line-height:1.05}
.pp-h2 svg{display:block;margin-top:6px;width:clamp(150px,30vw,260px);height:16px}
.pp-sub{max-width:40rem;margin:16px 0 0;font-size:16px;line-height:1.65;color:#4A4540}

.pp-why{display:grid;gap:22px;margin-top:40px;grid-template-columns:repeat(auto-fit,minmax(240px,1fr))}
.pp-card{position:relative;padding:26px 22px 24px;border:2px solid ${INK};border-radius:16px;background:#fff;box-shadow:6px 6px 0 ${INK};transition:transform .3s,box-shadow .3s}
.pp-card:hover{transform:translate(-2px,-3px);box-shadow:9px 9px 0 ${RED}}
.pp-card .kj{position:absolute;right:14px;top:10px;font:900 64px/1 'Noto Serif JP',serif;color:${RED};opacity:.12}
.pp-card .ic{display:grid;place-items:center;width:46px;height:46px;border-radius:12px;background:${RED};color:#fff}
.pp-card h3{margin:16px 0 8px;font-family:${F_HEAD};font-weight:800;font-size:20px;line-height:1.2;color:${INK}}
.pp-card p{margin:0;font-size:14.5px;line-height:1.65;color:#4A4540}

.pp-how{background:#EADFCB;background-image:repeating-linear-gradient(90deg,rgba(37,35,33,.06) 0,rgba(37,35,33,.06) 1px,transparent 1px,transparent 72px);border-top:2px solid ${INK};border-bottom:2px solid ${INK}}
.pp-steps{display:grid;gap:20px;margin-top:36px;grid-template-columns:repeat(auto-fit,minmax(230px,1fr))}
.pp-step{position:relative;padding:22px;border-radius:14px;border:2px solid ${INK};background:#FAF6EE}
.pp-step .n{font-family:${F_JANSINA};font-size:46px;line-height:1;color:${RED}}
.pp-step h3{margin:6px 0 6px;font-family:${F_HEAD};font-weight:800;font-size:19px}
.pp-step p{margin:0;font-size:14.5px;line-height:1.6;color:#4A4540}

/* ---------- team ---------- */
.pp-team{position:relative;color:${CREAM};background:radial-gradient(ellipse at 50% 0,#8c0b26 0,#5a0719 45%,#2f030e 100%)}
.pp-team .pp-h2{color:${CREAM};text-shadow:0 3px 0 ${INK}}
.pp-team .pp-eyebrow .lb{color:${GOLD}}
.pp-team .pp-sub{color:#ffe3d3}
.pp-grid{display:flex;flex-wrap:wrap;justify-content:center;gap:28px;margin-top:44px}
.pp-p{width:100%;max-width:360px;display:flex;flex-direction:column;border:2px solid ${GOLD};border-radius:18px;overflow:hidden;background:#FAF6EE;color:${INK};box-shadow:7px 7px 0 #1b0208;transition:transform .35s cubic-bezier(.22,1,.36,1),box-shadow .35s}
@media (min-width:700px){.pp-p{width:calc(50% - 14px)}}
@media (min-width:1040px){.pp-p{width:calc(33.333% - 19px)}}
.pp-p:hover{transform:translateY(-6px);box-shadow:7px 13px 0 #1b0208}
.pp-ph{position:relative;aspect-ratio:4/4.3;overflow:hidden;border-bottom:2px solid ${INK};background:linear-gradient(#e8503a 0,#c4281f 52%,#7a0a22 100%)}
.pp-ph::before{content:'';position:absolute;inset:0;background-image:${WAVE('%23ffffff')};background-size:40px 20px;opacity:.1}
.pp-ph .gk{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font:900 clamp(150px,22vw,230px)/1 'Noto Serif JP',serif;color:#fff;opacity:.13}
.pp-ph img{position:absolute;left:6%;right:6%;top:7%;bottom:0;width:88%;height:93%;object-fit:cover;object-position:50% 0;filter:drop-shadow(0 0 1.5px #fff) drop-shadow(0 8px 12px rgba(30,0,8,.45));transition:transform .5s cubic-bezier(.22,1,.36,1)}
.pp-p:hover .pp-ph img{transform:scale(1.04)}
.pp-ph .ini{position:absolute;inset:0;display:grid;place-items:center;font:700 64px ${F_LABEL};color:#fff}
.pp-chip{position:absolute;left:12px;top:12px;z-index:2;padding:4px 9px;border-radius:4px;background:${CREAM};color:${RED_DARK};font:700 10.5px ${F_LABEL};letter-spacing:.1em}
.pp-no{position:absolute;right:12px;top:12px;z-index:2;width:32px;height:32px;font-size:18px}
.pp-body{display:flex;flex-direction:column;gap:2px;padding:16px 18px 18px;text-align:center}
.pp-name{font-family:${F_JANSINA};font-size:30px;line-height:1.05;letter-spacing:.03em;text-transform:uppercase}
.pp-role{font-family:${F_HEAD};font-weight:700;font-size:14px;color:${RED_DARK};letter-spacing:.04em}
.pp-line{font-size:13.5px;color:#4A4540;word-break:break-all}
.pp-line.first{margin-top:10px;font-weight:600}
.pp-acts{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:14px}
.pp-act{display:flex;align-items:center;justify-content:center;gap:6px;min-height:44px;border-radius:999px;border:2px solid ${INK};background:#fff;color:${INK};font:700 11px ${F_LABEL};letter-spacing:.12em;text-transform:uppercase;text-decoration:none;transition:background .2s,color .2s,border-color .2s}
.pp-act:hover{border-color:${RED};color:${RED}}
.pp-act.main{background:${RED_DARK};border-color:${RED_DARK};color:#fff}
.pp-act.main:hover{background:#8f171b;color:#fff}
.pp-act:focus-visible,.pp-btn:focus-visible,.pp-back:focus-visible{outline:3px solid ${GOLD};outline-offset:2px}

`;

const PETALS = [
  { left: '6%', dur: 12, delay: 0 }, { left: '18%', dur: 15, delay: 4 }, { left: '33%', dur: 13, delay: 8 },
  { left: '67%', dur: 14, delay: 2 }, { left: '82%', dur: 12, delay: 6 }, { left: '94%', dur: 16, delay: 10 },
];

const Underline = () => (
  <svg viewBox="0 0 420 28" fill="none" aria-hidden="true">
    <path d="M6 16 C45 10, 95 8, 150 9 C220 10, 290 8, 350 12 C385 14, 405 16, 416 13 C405 20, 370 21, 320 20 C240 18, 160 21, 90 20 C50 19, 20 20, 6 16 Z" fill={RED} />
  </svg>
);

const Eyebrow = ({ kanji, label }: { kanji: string; label: string }) => (
  <div className="pp-eyebrow">
    <span className="pp-hanko" aria-hidden="true" style={{ width: 36, height: 36, fontSize: 18 }}>{kanji}</span>
    <span className="bk" aria-hidden="true">第五章</span>
    <span className="lb">{label}</span>
  </div>
);

function PersonCard({ c, i }: { c: PartnershipContact; i: number }) {
  return (
    <li className="pp-p" data-rv style={{ ['--d' as string]: i * 90 } as React.CSSProperties}>
      <div className="pp-ph">
        <span className="gk" aria-hidden="true">縁</span>
        <span className="pp-chip">#PartnershipDev</span>
        <span className="pp-hanko pp-no" aria-hidden="true">{NUM[i] ?? '印'}</span>
        {c.photo ? (
          <img
            src={c.photo}
            alt={c.name}
            loading="lazy"
            decoding="async"
            draggable={false}
            style={PHOTO_POS[c.id] ? { objectPosition: PHOTO_POS[c.id] } : undefined}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ) : (
          <span className="ini" aria-hidden="true">{initials(c.name)}</span>
        )}
      </div>
      <div className="pp-body">
        <span className="pp-name">{c.name}</span>
        <span className="pp-role">– {c.role}</span>
        <span className="pp-line first">{formatPhone(c.phone)}</span>
        <span className="pp-line">{c.email}</span>
        <div className="pp-acts">
          <a className="pp-act main" href={telHref(c.phone)} aria-label={`Call ${c.name}`}><Phone size={15} aria-hidden="true" />Call</a>
          <a className="pp-act" href={waHref(c.whatsapp ?? c.phone)} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${c.name}`}><MessageCircle size={15} aria-hidden="true" />Chat</a>
          <a className="pp-act" href={`mailto:${c.email}`} aria-label={`Email ${c.name}`}><Mail size={15} aria-hidden="true" />Email</a>
        </div>
      </div>
    </li>
  );
}

export const PartnershipPage: React.FC = () => {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    document.title = 'Become a Partner | Catalyst 7.0';
  }, []);

  // light scroll reveal (IntersectionObserver, no GSAP)
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = root.querySelectorAll<HTMLElement>('[data-rv]');
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach((e) => e.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }),
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);

  const allEmails = PARTNERSHIP_CONTACTS.map((c) => c.email).join(',');
  const mailAll = `mailto:${allEmails}?subject=${encodeURIComponent('Partnering with Catalyst 7.0')}`;

  return (
    <div className="pp" ref={rootRef}>
      <style>{CSS}</style>
      <Navbar />

      {/* ───────── HERO ───────── */}
      <header className="pp-hero">
        <div className="pp-sun" aria-hidden="true" />
        {PETALS.map((p, i) => (
          <span key={i} className="pp-petal" aria-hidden="true" style={{ left: p.left, animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s` }} />
        ))}
        <div className="pp-hero-in">
          <Link to="/" className="pp-back"><ArrowLeft size={14} aria-hidden="true" /> Back to Catalyst 7.0</Link>
          <div className="pp-kicker" data-rv>
            <span className="pp-hanko" aria-hidden="true" style={{ width: 34, height: 34, fontSize: 17 }}>結</span>
            <span style={{ font: `700 11px ${F_LABEL}`, letterSpacing: '0.28em', textTransform: 'uppercase', color: GOLD }}>PARTNERSHIPS · CATALYST 7.0</span>
          </div>
          <h1 className="pp-h1" data-rv style={{ ['--d' as string]: 80 } as React.CSSProperties}>
            <span className="a">Become a</span>
            <span className="b">Partner</span>
          </h1>
          <p className="pp-lead" data-rv style={{ ['--d' as string]: 160 } as React.CSSProperties}>
            Join AIESEC in SLIIT and put your name beside a youth leadership experience that people remember. Talk to the five people who will make it happen.
          </p>
          <div className="pp-cta" data-rv style={{ ['--d' as string]: 240 } as React.CSSProperties}>
            <a className="pp-btn solid" href="#team">Meet the team <ArrowRight size={16} aria-hidden="true" /></a>
            <a className="pp-btn line" href={mailAll}><Mail size={16} aria-hidden="true" /> Email everyone</a>
          </div>
          {PARTNERSHIP_CONTACTS.length > 0 && (
            <div className="pp-faces" data-rv style={{ ['--d' as string]: 320 } as React.CSSProperties}>
              <div className="row" aria-hidden="true">
                {PARTNERSHIP_CONTACTS.filter((c) => c.photo).map((c) => (
                  <span className="pp-face" key={c.id}><img src={c.photo} alt="" loading="eager" decoding="async" draggable={false} /></span>
                ))}
              </div>
              <span>The partnership team</span>
            </div>
          )}
        </div>
      </header>
      <div className="pp-band red" aria-hidden="true" />

      {/* ───────── WHY ───────── */}
      <section className="pp-sec" aria-labelledby="pp-why">
        <div className="pp-wrap">
          <div data-rv>
            <Eyebrow kanji="益" label="Why partner with us" />
            <h2 className="pp-h2" id="pp-why">Why Catalyst 7.0<Underline /></h2>
            <p className="pp-sub">A partnership here is more than a logo on a banner. It is a front-row seat to a room full of young people ready to lead.</p>
          </div>
          <div className="pp-why">
            {WHY.map((w, i) => {
              const Icon = w.icon;
              return (
                <article className="pp-card" key={w.title} data-rv style={{ ['--d' as string]: i * 90 } as React.CSSProperties}>
                  <span className="kj" aria-hidden="true">{w.kanji}</span>
                  <span className="ic"><Icon size={22} aria-hidden="true" /></span>
                  <h3>{w.title}</h3>
                  <p>{w.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────── HOW ───────── */}
      <section className="pp-sec pp-how" aria-labelledby="pp-how">
        <div className="pp-wrap">
          <div data-rv>
            <Eyebrow kanji="道" label="How it works" />
            <h2 className="pp-h2" id="pp-how">Three simple steps<Underline /></h2>
          </div>
          <div className="pp-steps">
            {STEPS.map((s, i) => (
              <div className="pp-step" key={s.n} data-rv style={{ ['--d' as string]: i * 100 } as React.CSSProperties}>
                <div className="n">{s.n}</div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── TEAM ───────── */}
      <section className="pp-sec pp-team" id="team" aria-labelledby="pp-team">
        <div className="pp-wrap">
          <div data-rv>
            <Eyebrow kanji="縁" label="OCVP Partnership Development" />
            <h2 className="pp-h2" id="pp-team">Meet the team</h2>
            <p className="pp-sub">Five people, one goal: finding the right partners for Catalyst 7.0. Pick anyone and reach them directly.</p>
          </div>
          {PARTNERSHIP_CONTACTS.length > 0 ? (
            <ul className="pp-grid" style={{ listStyle: 'none', padding: 0 }}>
              {PARTNERSHIP_CONTACTS.map((c, i) => <PersonCard key={c.id} c={c} i={i} />)}
            </ul>
          ) : (
            <p className="pp-sub">Contact details are coming soon.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default PartnershipPage;