import React, { useEffect, useState } from 'react';
import { CatalystMark } from './brand/CatalystMark';

// Folder in /public that holds the illustrations
const ART = '/assets/illustrations/';
const hide = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.style.display = 'none';
};

interface EntryGateProps {
  /** true while the gate should be showing */
  visible: boolean;
  onEnter: () => void;
}

/**
 * Full-screen "Enter" screen. Browsers only allow sound after a click / tap / key press, so this
 * one click is what lets the music (and the intro) start automatically from the very beginning.
 * It fades out, then unmounts itself.
 */
export const EntryGate: React.FC<EntryGateProps> = ({ visible, onEnter }) => {
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      return;
    }
    const t = setTimeout(() => setMounted(false), 1100);
    return () => clearTimeout(t);
  }, [visible]);

  if (!mounted) return null;

  return (
    <>
      <style>{`
        .gate { position: fixed; inset: 0; z-index: 100; display: flex; flex-direction: column; align-items: center; justify-content: center;
          background: #0a0608; color: #fff3dc; text-align: center; padding: 1.5rem;
          transition: opacity 1s cubic-bezier(0.22, 1, 0.36, 1); }
        .gate.is-leaving { opacity: 0; pointer-events: none; }
        .gate-sun { position: absolute; left: 50%; bottom: -38vmin; width: 90vmin; height: 90vmin; transform: translateX(-50%); border-radius: 50%;
          background: radial-gradient(circle, rgba(244,63,94,0.55) 0%, rgba(220,38,38,0.32) 38%, rgba(220,38,38,0.08) 60%, transparent 72%);
          pointer-events: none; }
        .gate > *:not(.gate-sun):not(.gate-art) { position: relative; z-index: 1; }
        .gate-eyebrow { font-family: var(--font-label); font-size: 0.78rem; font-weight: 600; letter-spacing: 0.42em;
          padding-left: 0.42em; text-transform: uppercase; color: #f6c768; margin: 0 0 1.1rem; }
        .gate-title { font-family: var(--font-display); font-weight: 800; font-size: clamp(2.4rem, 9vw, 5.6rem); line-height: 1;
          letter-spacing: 0.12em; padding-left: 0.12em; text-transform: uppercase; margin: 0 0 0.6rem;
          text-shadow: 0 8px 28px rgba(10,2,6,0.8), 0 0 50px rgba(239,68,68,0.45); }
        .gate-title span { color: #f6c768; }
        .gate-kanji { font-family: var(--font-accent), 'Noto Serif JP', 'Yu Mincho', 'Hiragino Mincho ProN', serif; font-size: 0.95rem; letter-spacing: 0.6em; padding-left: 0.6em;
          color: #f6c768; margin: 0 0 2.6rem; display: inline-flex; align-items: center; gap: 0.9em; }
        .gate-kanji i { display: block; width: clamp(28px, 8vw, 70px); height: 1px; background: linear-gradient(to right, transparent, #f6c768); }
        .gate-kanji i:last-child { background: linear-gradient(to left, transparent, #f6c768); }
        .gate-btn { font-family: var(--font-display); font-size: 0.85rem; font-weight: 700; letter-spacing: 0.4em; padding: 1.05rem 2.4rem 1.05rem 2.8rem;
          text-transform: uppercase; color: #fff3dc; background: rgba(191,48,48,0.9); border: 1px solid rgba(246,199,104,0.7); border-radius: 999px; cursor: pointer;
          animation: gate-pulse 2.4s ease-out infinite; transition: transform 0.25s, background 0.25s; }
        .gate-btn:hover { background: #d13a3a; transform: scale(1.04); }
        .gate-btn:active { transform: scale(0.98); }
        .gate-btn:focus-visible { outline: 2px solid #f6c768; outline-offset: 4px; }
        .gate-note { font-family: var(--font-label); font-size: 0.68rem; font-weight: 500; letter-spacing: 0.28em;
          padding-left: 0.28em; text-transform: uppercase; color: rgba(255,243,220,0.55); margin: 1.6rem 0 0; }
        .gate-art { position: absolute; z-index: 0; pointer-events: none; user-select: none; opacity: 0;
          animation: gate-art-in 1.8s ease-out forwards; }
        .gate-art img { display: block; width: 100%; height: auto; }
        .gate-mask { left: clamp(0.75rem, 7vw, 9rem); top: clamp(1.25rem, 13vh, 8rem); width: clamp(64px, 11vw, 170px); --o: 0.95;
          filter: drop-shadow(0 12px 26px rgba(0,0,0,0.65));
          animation: gate-art-in 1.8s 0.4s ease-out forwards, gate-float 7s ease-in-out 2.2s infinite; }
        .gate-koi { right: clamp(0.75rem, 7vw, 9rem); bottom: clamp(3rem, 20vh, 12rem); width: clamp(64px, 9.5vw, 150px); --o: 0.95;
          filter: drop-shadow(0 12px 26px rgba(0,0,0,0.6));
          animation: gate-art-in 1.8s 0.7s ease-out forwards, gate-float-2 8s ease-in-out 2.5s infinite; }
        .gate-luck { left: 50%; top: 50%; width: clamp(220px, 40vw, 540px); transform: translate(-50%, -52%); --o: 0.06;
          filter: grayscale(1) invert(1); animation-delay: 0.2s; }
        .gate-pagoda { left: clamp(-1rem, 2vw, 3rem); bottom: 0; width: clamp(110px, 20vw, 300px); --o: 0.13;
          filter: grayscale(1) invert(1); animation-delay: 0.5s; }
        .gate-bonsai { right: clamp(-1rem, 2vw, 3rem); bottom: 0; width: clamp(90px, 16vw, 240px); --o: 0.13;
          filter: grayscale(1) invert(1); animation-delay: 0.7s; }
        @media (max-width: 640px) {
          .gate-koi { bottom: auto; top: clamp(1.25rem, 6vh, 4rem); width: clamp(54px, 15vw, 90px); }
          .gate-mask { top: clamp(1.25rem, 6vh, 4rem); width: clamp(54px, 15vw, 90px); }
        }
        @keyframes gate-art-in { to { opacity: var(--o, 1); } }
        @keyframes gate-float { 0%,100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-10px) rotate(2deg); } }
        @keyframes gate-float-2 { 0%,100% { transform: translateY(0) rotate(5deg); } 50% { transform: translateY(-12px) rotate(-4deg); } }
        @keyframes gate-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(246,199,104,0.5); } 70% { box-shadow: 0 0 0 16px rgba(246,199,104,0); } }
        @media (prefers-reduced-motion: reduce) { .gate-btn { animation: none; } .gate-mask, .gate-koi { animation: gate-art-in 0.01s forwards; } .gate { transition-duration: 0.01s; } }
      `}</style>
      <div className={`gate ${visible ? '' : 'is-leaving'}`} role="dialog" aria-label="Enter Catalyst 7.0">
        <div className="gate-sun" />

        {/* Decorative illustrations (a missing file simply hides itself) */}
        <div className="gate-art gate-luck"><img src={`${ART}clker-free-vector-images-luck-24155_1920.png`} alt="" onError={hide} /></div>
        <div className="gate-art gate-pagoda"><img src={`${ART}gdj-building-8171699.svg`} alt="" onError={hide} /></div>
        <div className="gate-art gate-bonsai"><img src={`${ART}gdj-bonsai-tree-8143900.svg`} alt="" onError={hide} /></div>
        <div className="gate-art gate-mask"><img src={`${ART}alessandro-hrdz-mask-6976331.png`} alt="" onError={hide} /></div>
        <div className="gate-art gate-koi"><img src={`${ART}kacsoeszti-koi-1184783_1920.png`} alt="" onError={hide} /></div>

        <div className="relative mb-5 flex items-center justify-center">
          <div className="absolute w-28 h-28 rounded-full bg-[#f6c768]/15 blur-xl pointer-events-none" />
          <CatalystMark
            size={72}
            priority
            className="relative w-16 sm:w-20 h-auto drop-shadow-[0_8px_24px_rgba(201,54,43,0.4)]"
          />
        </div>

        <p className="gate-eyebrow">AIESEC in SLIIT presents</p>
        <h1 className="gate-title">
          Catalyst <span>7.0</span>
        </h1>
        <span className="gate-kanji" aria-hidden="true">
          <i />
          触媒
          <i />
        </span>
        <button type="button" className="gate-btn" onClick={onEnter} autoFocus>
          Enter
        </button>
        <p className="gate-note">Sound on for the full experience</p>
      </div>
    </>
  );
};

export default EntryGate;
