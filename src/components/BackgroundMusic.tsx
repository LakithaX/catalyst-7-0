import React, { useCallback, useEffect, useRef, useState } from 'react';

interface BackgroundMusicProps {
  /** File in /public. Put your track at public/audio/background-music.mp3 (or change this). */
  src?: string;
  /** Final volume, 0..1 */
  volume?: number;
}

type Status = 'waiting' | 'playing' | 'muted' | 'error';

/**
 * Background music for the home page.
 *  - A NEW Audio element is created on every load, so the track starts from 0:00 after a refresh.
 *  - `loop` is on: it repeats forever.
 *  - Browsers only allow SOUND after the visitor interacts with the page (click / tap / key press;
 *    scrolling and mouse movement do not count). So:
 *      1. we try normal autoplay (works if the browser allows it),
 *      2. otherwise we start the track silently, and the first click / tap / key press
 *         restarts it from 0:00 and fades the sound in.
 *  - A speaker button (bottom-left) mutes / unmutes. It never disappears; if the file can't be
 *    loaded it turns red and says so.
 */
export const BackgroundMusic: React.FC<BackgroundMusicProps> = ({
  src = '/audio/background-music.mp3',
  volume = 0.45,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRaf = useRef<number | null>(null);
  const audibleRef = useRef(false); // sound is currently on
  const armedRef = useRef(false); // playing silently, waiting for a gesture
  const everAudibleRef = useRef(false);
  const wantPlayRef = useRef(true);
  const startAudibleRef = useRef<() => void>(() => {});

  const [status, setStatus] = useState<Status>('waiting');
  const [errorText, setErrorText] = useState('');

  const fadeTo = useCallback((target: number, ms: number, done?: () => void) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (fadeRaf.current !== null) cancelAnimationFrame(fadeRaf.current);
    const from = audio.volume;
    const t0 = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / ms);
      audio.volume = Math.max(0, Math.min(1, from + (target - from) * t));
      if (t < 1) {
        fadeRaf.current = requestAnimationFrame(step);
      } else {
        fadeRaf.current = null;
        done?.();
      }
    };
    fadeRaf.current = requestAnimationFrame(step);
  }, []);

  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0;
    audioRef.current = audio;

    const onError = () => {
      const code = audio.error?.code;
      const msg =
        code === 4
          ? `Could not load "${src}". The file is missing, misnamed, or not a valid audio file.`
          : `Audio error (code ${code ?? '?'}) for "${src}".`;
      console.error('[BackgroundMusic] ' + msg);
      setErrorText(msg);
      setStatus('error');
    };
    audio.addEventListener('error', onError);
    audio.src = src;

    const events: (keyof WindowEventMap)[] = ['pointerup', 'click', 'touchend', 'keydown'];
    const onGesture = () => startAudible();
    const removeGestureListeners = () =>
      events.forEach((e) => window.removeEventListener(e, onGesture, { capture: true } as EventListenerOptions));

    // Make the sound audible (needs a user gesture unless the browser already allows autoplay)
    const startAudible = () => {
      if (audibleRef.current || !wantPlayRef.current) return;
      audio.muted = false;
      audio.volume = 0;
      if (!everAudibleRef.current) audio.currentTime = 0; // first time: always from the beginning
      audio
        .play()
        .then(() => {
          audibleRef.current = true;
          everAudibleRef.current = true;
          armedRef.current = false;
          setStatus('playing');
          fadeTo(volume, 2500);
          removeGestureListeners();
        })
        .catch(() => {
          // Still not allowed: keep waiting for a real gesture
        });
    };
    startAudibleRef.current = startAudible;

    events.forEach((e) => window.addEventListener(e, onGesture, { capture: true, passive: true }));

    // Don't play music from a background tab
    const onVisibility = () => {
      if (document.hidden) {
        audio.pause();
      } else if ((audibleRef.current || armedRef.current) && wantPlayRef.current) {
        audio.play().catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    // 1) Normal autoplay (allowed on some browsers / after repeat visits)
    audio.muted = false;
    audio
      .play()
      .then(() => {
        audibleRef.current = true;
        everAudibleRef.current = true;
        setStatus('playing');
        fadeTo(volume, 2500);
        removeGestureListeners();
      })
      .catch(() => {
        // 2) Blocked → start silently so the track is already "armed"; first gesture restarts it with sound
        audio.muted = true;
        audio
          .play()
          .then(() => {
            armedRef.current = true;
          })
          .catch(() => {});
      });

    return () => {
      removeGestureListeners();
      document.removeEventListener('visibilitychange', onVisibility);
      audio.removeEventListener('error', onError);
      if (fadeRaf.current !== null) cancelAnimationFrame(fadeRaf.current);
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      audioRef.current = null;
    };
  }, [src, volume, fadeTo]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || status === 'error') return;
    if (audibleRef.current) {
      // mute
      wantPlayRef.current = false;
      audibleRef.current = false;
      setStatus('muted');
      fadeTo(0, 500, () => audio.pause());
    } else {
      // unmute / first start
      wantPlayRef.current = true;
      startAudibleRef.current();
    }
  }, [status, fadeTo]);

  const playing = status === 'playing';
  const hint =
    status === 'waiting' ? 'Click anywhere for music' : status === 'error' ? 'Music file not found' : '';

  return (
    <>
      <style>{`
        @keyframes bgm-bar { 0%,100% { transform: scaleY(0.25); } 50% { transform: scaleY(1); } }
        @keyframes bgm-hint { 0%,100% { box-shadow: 0 0 0 0 rgba(246,199,104,.55); } 70% { box-shadow: 0 0 0 12px rgba(246,199,104,0); } }
        @media (prefers-reduced-motion: reduce) { .bgm-btn, .bgm-btn span { animation: none !important; } }
      `}</style>

      <div
        style={{
          position: 'fixed',
          left: 'max(1rem, env(safe-area-inset-left))',
          bottom: 'max(1rem, env(safe-area-inset-bottom))',
          zIndex: 60,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? 'Mute background music' : 'Play background music'}
          title={status === 'error' ? errorText : playing ? 'Mute music' : 'Play music'}
          className="bgm-btn"
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            border: `1px solid ${status === 'error' ? 'rgba(239,68,68,0.8)' : 'rgba(246,199,104,0.55)'}`,
            background: 'rgba(14,6,10,0.78)',
            color: status === 'error' ? '#f87171' : '#f6c768',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 0,
            flexShrink: 0,
            animation: status === 'waiting' ? 'bgm-hint 2.2s ease-out infinite' : undefined,
          }}
        >
          {playing ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, height: 16 }} aria-hidden="true">
              {[0, 0.25, 0.1, 0.35].map((delay, i) => (
                <span
                  key={i}
                  style={{
                    display: 'block',
                    width: 3,
                    height: 16,
                    borderRadius: 2,
                    background: '#f6c768',
                    transformOrigin: '50% 100%',
                    animation: `bgm-bar 0.9s ease-in-out ${delay}s infinite`,
                  }}
                />
              ))}
            </span>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11 5 6 9H2v6h4l5 4V5z" />
              <line x1="22" y1="9" x2="16" y2="15" />
              <line x1="16" y1="9" x2="22" y2="15" />
            </svg>
          )}
        </button>

        {hint && (
          <span
            style={{
              fontFamily: "'Montserrat', ui-sans-serif, system-ui, sans-serif",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: status === 'error' ? '#fecaca' : '#fff3dc',
              background: 'rgba(14,6,10,0.78)',
              border: '1px solid rgba(246,199,104,0.3)',
              padding: '8px 12px',
              borderRadius: 999,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}
          >
            {hint}
          </span>
        )}
      </div>
    </>
  );
};

export default BackgroundMusic;