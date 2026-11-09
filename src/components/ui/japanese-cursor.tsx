import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * Japanese-themed custom cursor (GSAP):
 *  - small red "sun" dot that follows instantly
 *  - soft ring that trails behind (enso-style) and swells over links/buttons
 *  - sakura petals drift off the cursor while you move, and burst on click
 * Only mounts for fine pointers (mouse/trackpad). Touch devices keep the normal behaviour.
 * Animates transform + opacity only. Reduced motion: no trail, no lag.
 *
 * Optional: add data-cursor-label="見る" to any element to show a kanji label in the ring on hover.
 */

const RED = "#C9362B";
const PETAL_COUNT = 16;
const HOVER_SELECTOR = "a, button, [role='button'], summary, label[for], [data-cursor-hover], .cursor-pointer";
const TEXT_SELECTOR = "input, textarea, select, [contenteditable='true']";

export default function JapaneseCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const petalsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Some touch browsers report a fine pointer through an attached/stale input device,
    // while still delivering no mousemove events. Require a real mouse/trackpad capability.
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches || navigator.maxTouchPoints > 0) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dot = dotRef.current!;
    const ring = ringRef.current!;
    const label = labelRef.current!;
    const petals = gsap.utils.toArray<HTMLElement>(petalsRef.current!.children);

    document.documentElement.classList.add("jp-cursor-on");

    const ctx = gsap.context(() => {
      gsap.set([dot, ring], { xPercent: -50, yPercent: -50, x: -100, y: -100, opacity: 0 });
      gsap.set(petals, { xPercent: -50, yPercent: -50, opacity: 0 });

      const dotX = gsap.quickTo(dot, "x", { duration: reduce ? 0 : 0.08, ease: "power3.out" });
      const dotY = gsap.quickTo(dot, "y", { duration: reduce ? 0 : 0.08, ease: "power3.out" });
      const ringX = gsap.quickTo(ring, "x", { duration: reduce ? 0 : 0.5, ease: "power3.out" });
      const ringY = gsap.quickTo(ring, "y", { duration: reduce ? 0 : 0.5, ease: "power3.out" });

      let visible = false;
      let hovering = false;
      let lastX = 0;
      let lastY = 0;
      let travelled = 0;
      let petalIdx = 0;

      const show = (on: boolean) => {
        if (visible === on) return;
        visible = on;
        gsap.to([dot, ring], { opacity: on ? 1 : 0, duration: 0.25, overwrite: "auto" });
      };

      const setHover = (on: boolean, text = "") => {
        if (hovering === on && label.textContent === text) return;
        hovering = on;
        label.textContent = text;
        gsap.to(ring, {
          scale: on ? (text ? 2.1 : 1.6) : 1,
          backgroundColor: on ? "rgba(201,54,43,0.14)" : "rgba(201,54,43,0)",
          duration: 0.3,
          ease: "power3.out",
          overwrite: "auto",
        });
        gsap.to(dot, { scale: on ? 0.4 : 1, duration: 0.25, ease: "power3.out", overwrite: "auto" });
        gsap.to(label, { opacity: text ? 1 : 0, duration: 0.2, overwrite: "auto" });
      };

      const spawnPetal = (x: number, y: number, burst = false, angle = 0) => {
        if (reduce) return;
        const el = petals[petalIdx++ % petals.length];
        gsap.killTweensOf(el);
        const dist = burst ? 50 + Math.random() * 40 : 10 + Math.random() * 18;
        gsap.fromTo(
          el,
          { x, y, opacity: 0.9, scale: 0.6 + Math.random() * 0.6, rotation: Math.random() * 360 },
          {
            x: burst ? x + Math.cos(angle) * dist : x + (Math.random() - 0.5) * 50,
            y: burst ? y + Math.sin(angle) * dist : y + 34 + Math.random() * 40,
            rotation: `+=${(Math.random() - 0.5) * 360}`,
            opacity: 0,
            duration: burst ? 0.7 : 1.1,
            ease: burst ? "power2.out" : "power1.out",
          }
        );
      };

      const onMove = (e: MouseEvent) => {
        show(true);
        dotX(e.clientX);
        dotY(e.clientY);
        ringX(e.clientX);
        ringY(e.clientY);

        travelled += Math.hypot(e.clientX - lastX, e.clientY - lastY);
        lastX = e.clientX;
        lastY = e.clientY;
        if (travelled > 70) {
          travelled = 0;
          spawnPetal(e.clientX, e.clientY);
        }

        const t = e.target as Element | null;
        if (!t || !t.closest) return;
        if (t.closest(TEXT_SELECTOR)) {
          // keep the native I-beam over text fields
          document.documentElement.classList.add("jp-cursor-text");
          show(false);
          return;
        }
        document.documentElement.classList.remove("jp-cursor-text");
        const labelEl = t.closest("[data-cursor-label]") as HTMLElement | null;
        if (labelEl) setHover(true, labelEl.dataset.cursorLabel || "");
        else setHover(!!t.closest(HOVER_SELECTOR));
      };

      const onDown = (e: MouseEvent) => {
        gsap.to(ring, { scale: "*=0.75", duration: 0.12, ease: "power2.out", overwrite: "auto" });
        for (let i = 0; i < 6; i++) spawnPetal(e.clientX, e.clientY, true, (Math.PI * 2 * i) / 6 + Math.random() * 0.5);
      };
      const onUp = () => gsap.to(ring, { scale: hovering ? 1.6 : 1, duration: 0.3, ease: "back.out(2)", overwrite: "auto" });
      const onLeave = () => show(false);
      const onEnter = () => show(true);

      window.addEventListener("mousemove", onMove, { passive: true });
      window.addEventListener("mousedown", onDown);
      window.addEventListener("mouseup", onUp);
      document.documentElement.addEventListener("mouseleave", onLeave);
      document.documentElement.addEventListener("mouseenter", onEnter);

      return () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mousedown", onDown);
        window.removeEventListener("mouseup", onUp);
        document.documentElement.removeEventListener("mouseleave", onLeave);
        document.documentElement.removeEventListener("mouseenter", onEnter);
      };
    });

    return () => {
      ctx.revert();
      document.documentElement.classList.remove("jp-cursor-on", "jp-cursor-text");
    };
  }, []);

  const layer: React.CSSProperties = { position: "fixed", top: 0, left: 0, pointerEvents: "none", zIndex: 2147483000, willChange: "transform, opacity" };

  return (
    <>
      <style>{`
        html.jp-cursor-on, html.jp-cursor-on * { cursor: none !important; }
        html.jp-cursor-on.jp-cursor-text input, html.jp-cursor-on.jp-cursor-text textarea,
        html.jp-cursor-on.jp-cursor-text select, html.jp-cursor-on.jp-cursor-text [contenteditable='true'] { cursor: text !important; }
      `}</style>

      <div aria-hidden="true" ref={petalsRef}>
        {Array.from({ length: PETAL_COUNT }).map((_, i) => (
          <span key={i} style={{ ...layer, zIndex: 2147482999 }}>
            <svg viewBox="0 0 24 32" width="12" height="16" style={{ display: "block" }}>
              <path d="M12 2 C16 7, 22 13, 21 21 C20 27, 15 30, 12 28 C9 30, 4 27, 3 21 C2 13, 8 7, 12 2 Z" fill={RED} />
            </svg>
          </span>
        ))}
      </div>

      <div
        aria-hidden="true"
        ref={ringRef}
        style={{
          ...layer,
          width: 38,
          height: 38,
          borderRadius: "50%",
          border: `1.5px solid ${RED}`,
          boxShadow: "0 0 0 1px rgba(248,243,233,0.85)",
          display: "grid",
          placeItems: "center",
        }}
      >
        <span ref={labelRef} style={{ fontFamily: "'Yuji Boku', 'Noto Serif JP', serif", fontSize: 10, color: RED, opacity: 0, lineHeight: 1, textShadow: "0 0 2px rgba(248,243,233,0.9)" }} />
      </div>

      <div
        aria-hidden="true"
        ref={dotRef}
        style={{ ...layer, width: 9, height: 9, borderRadius: "50%", background: RED, boxShadow: "0 0 0 1.5px rgba(248,243,233,0.9)" }}
      />
    </>
  );
}
