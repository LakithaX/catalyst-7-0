import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface BackgroundMusicProps {
  /** File in /public. Default: /audio/background-music.mp3 */
  src?: string;
  /** Final volume, 0..1 */
  volume?: number;
}

type Status = 'waiting' | 'playing' | 'muted' | 'error';

const STORAGE_KEY = 'catalyst7_bgm_muted';

const getInitialMuted = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
};

const setStoredMuted = (muted: boolean) => {
  try {
    localStorage.setItem(STORAGE_KEY, muted ? 'true' : 'false');
  } catch {
    // ignore blocked storage
  }
};

/**
 * Global background music player for Catalyst 7.0.
 *  - Mounted once at the App root outside <Routes> so music continues seamlessly across navigation.
 *  - Single HTMLAudioElement ref, looping forever.
 *  - Persists mute preference in localStorage under catalyst7_bgm_muted.
 *  - Listens for first user gesture (pointerdown/keydown) on any page to start playback if not muted,
 *    ignoring clicks on the toggle button itself so toggle behavior is clean.
 *  - Pauses when tab is hidden and resumes when tab is visible again (only if playing before).
 *  - Placed at bottom-left with z-index: 35 (below modals, cart drawer, and entry gate).
 */
export const BackgroundMusic: React.FC<BackgroundMusicProps> = ({
  src = '/audio/background-music.mp3',
  volume = 0.45,
}) => {
  const location = useLocation();
  const isProductDetail =
    location.pathname.startsWith('/merch/') &&
    location.pathname !== '/merch' &&
    location.pathname !== '/merch/cart';

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRaf = useRef<number | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  const audibleRef = useRef(false);
  const armedRef = useRef(false);
  const everAudibleRef = useRef(false);
  const isInitialMuted = getInitialMuted();
  const wantPlayRef = useRef(!isInitialMuted);
  const wasPlayingBeforeHiddenRef = useRef(false);
  const startAudibleRef = useRef<() => void>(() => {});

  const [status, setStatus] = useState<Status>(isInitialMuted ? 'muted' : 'waiting');
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

    const events: (keyof WindowEventMap)[] = ['pointerdown', 'keydown', 'touchend', 'click'];

    const removeGestureListeners = () => {
      events.forEach((e) =>
        window.removeEventListener(e, onGesture, { capture: true } as EventListenerOptions)
      );
    };

    const startAudible = () => {
      if (audibleRef.current || !wantPlayRef.current) return;
      audio.muted = false;
      audio.volume = 0;
      if (!everAudibleRef.current) audio.currentTime = 0;
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
          // Keep waiting for an interaction
        });
    };
    startAudibleRef.current = startAudible;

    const onGesture = (e: Event) => {
      // Ignore gestures originating on the toggle button itself so button click handles toggle cleanly
      if (btnRef.current && e.target instanceof Node && btnRef.current.contains(e.target)) {
        return;
      }
      startAudible();
    };

    events.forEach((e) =>
      window.addEventListener(e, onGesture, { capture: true, passive: true })
    );

    const onVisibility = () => {
      if (document.hidden) {
        if (audibleRef.current) {
          wasPlayingBeforeHiddenRef.current = true;
          audio.pause();
        }
      } else if (wasPlayingBeforeHiddenRef.current && wantPlayRef.current) {
        wasPlayingBeforeHiddenRef.current = false;
        audio.play().catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    // If visitor already explicitly muted, respect it and do not attempt autoplay
    if (wantPlayRef.current) {
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
          // Autoplay blocked: start silently to arm audio
          audio.muted = true;
          audio
            .play()
            .then(() => {
              armedRef.current = true;
            })
            .catch(() => {});
        });
    }

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
      // Mute
      wantPlayRef.current = false;
      audibleRef.current = false;
      setStoredMuted(true);
      setStatus('muted');
      fadeTo(0, 500, () => audio.pause());
    } else {
      // Unmute / start
      wantPlayRef.current = true;
      setStoredMuted(false);
      setStatus('playing');
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
        .bgm-wrap {
          position: fixed;
          left: max(1rem, env(safe-area-inset-left));
          bottom: max(1rem, env(safe-area-inset-bottom));
          z-index: 35;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: bottom 0.25s ease;
        }
        @media (max-width: 1023px) {
          .bgm-wrap.has-sticky-bar {
            bottom: max(5.5rem, calc(5rem + env(safe-area-inset-bottom)));
          }
        }
      `}</style>

      <div className={`bgm-wrap ${isProductDetail ? 'has-sticky-bar' : ''}`}>
        <button
          ref={btnRef}
          type="button"
          onClick={toggle}
          aria-label={playing ? 'Mute music' : 'Play music'}
          aria-pressed={playing}
          title={status === 'error' ? errorText : playing ? 'Mute music' : 'Play music'}
          className="bgm-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f6c768] focus-visible:ring-offset-2"
          style={{
            width: 44,
            height: 44,
            minWidth: 44,
            minHeight: 44,
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
