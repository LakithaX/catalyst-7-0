/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';

interface Petal {
  x: number;
  y: number;
  z: number; // 0 = far/small, 1 = near/large
  size: number;
  vx: number;
  vy: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  vRotX: number;
  vRotY: number;
  vRotZ: number;
  swaySpeed: number;
  swayAmount: number;
  phase: number;
  opacity: number;
}

interface SakuraPetalsProps {
  enabled: boolean;
  /** Simple numeric wind input (used by the hero). */
  mouseVelX?: number;
  /** Preferred: a ref that is mutated every frame — no React re-render needed. */
  velRef?: React.MutableRefObject<number>;
  className?: string;
  /** Override petal count (defaults: 30 desktop / 18 mobile). */
  count?: number;
}

// The petal is drawn ONCE into a small offscreen sprite, then stamped with drawImage.
// This replaces 34 gradient creations + bezier paths per frame.
const SPRITE_SIZE = 96;
const PETAL_LEN = 88;

const createPetalSprite = (): HTMLCanvasElement => {
  const sprite = document.createElement('canvas');
  sprite.width = SPRITE_SIZE;
  sprite.height = SPRITE_SIZE;
  const c = sprite.getContext('2d');
  if (!c) return sprite;

  c.translate(SPRITE_SIZE / 2, SPRITE_SIZE / 2);

  const halfW = PETAL_LEN * 0.52;
  const length = PETAL_LEN;

  const grad = c.createLinearGradient(0, -length * 0.5, 0, length * 0.5);
  grad.addColorStop(0, 'rgba(255, 246, 249, 1)');
  grad.addColorStop(0.35, 'rgba(255, 192, 209, 0.97)');
  grad.addColorStop(0.8, 'rgba(244, 114, 156, 0.92)');
  grad.addColorStop(1, 'rgba(225, 78, 126, 0.88)');

  c.fillStyle = grad;
  c.beginPath();
  c.moveTo(0, length * 0.5);
  c.bezierCurveTo(-halfW * 1.05, length * 0.22, -halfW * 1.15, -length * 0.2, -halfW * 0.45, -length * 0.5);
  c.quadraticCurveTo(0, -length * 0.32, halfW * 0.45, -length * 0.5);
  c.bezierCurveTo(halfW * 1.15, -length * 0.2, halfW * 1.05, length * 0.22, 0, length * 0.5);
  c.closePath();
  c.fill();

  c.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  c.lineWidth = 2.4;
  c.beginPath();
  c.moveTo(0, length * 0.38);
  c.quadraticCurveTo(halfW * 0.06, 0, 0, -length * 0.22);
  c.stroke();

  return sprite;
};

export const SakuraPetals: React.FC<SakuraPetalsProps> = ({
  enabled,
  mouseVelX = 0,
  velRef,
  className,
  count,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const propVelRef = useRef<number>(mouseVelX);

  useEffect(() => {
    propVelRef.current = mouseVelX;
  }, [mouseVelX]);

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const sprite = createPetalSprite();

    // Cap DPR: petals are soft shapes, 2x is plenty and 3x phones would triple the fill cost.
    const getDpr = () => Math.min(window.devicePixelRatio || 1, 2);
    let dpr = getDpr();
    let width = window.innerWidth;
    let height = window.innerHeight;

    const allocate = () => {
      dpr = getDpr();
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    };
    allocate();

    // Mobile browsers fire `resize` while scrolling (URL bar collapsing). Re-allocating the
    // canvas each time causes flicker + dropped frames, so ignore small height-only changes.
    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w === width && Math.abs(h - height) < 160) return;
      allocate();
    };
    window.addEventListener('resize', onResize);

    const petalCount = count ?? (width < 768 ? 18 : 30);
    const petals: Petal[] = [];
    for (let i = 0; i < petalCount; i++) {
      const z = Math.random();
      petals.push({
        x: Math.random() * (width + 200) - 100,
        y: Math.random() * (height + 100) - 50,
        z,
        size: 11 + z * 16,
        vx: 0.25 + z * 0.35,
        vy: 0.45 + z * 0.55,
        rotationX: Math.random() * Math.PI * 2,
        rotationY: Math.random() * Math.PI * 2,
        rotationZ: Math.random() * Math.PI * 2,
        vRotX: 0.007 + Math.random() * 0.009,
        vRotY: 0.009 + Math.random() * 0.012,
        vRotZ: 0.004 + Math.random() * 0.006,
        swaySpeed: 0.014 + Math.random() * 0.016,
        swayAmount: 0.7 + Math.random() * 0.9,
        phase: Math.random() * Math.PI * 2,
        opacity: 0.55 + z * 0.4,
      });
    }
    // Depth order is fixed, so sort ONCE (was sorting every frame).
    petals.sort((a, b) => a.z - b.z);

    let wind = 0;
    let rafId = 0;
    let running = false;
    let inView = true;
    let last = 0;

    const frame = (now: number) => {
      if (!running) return;

      // Frame-rate independent: 1.0 == one 60fps frame, so 144Hz screens move at the same speed.
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const f = dt * 60;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const vel = velRef ? velRef.current : propVelRef.current;
      const targetWind = Math.max(-2.0, Math.min(2.0, vel * 0.4));
      wind += (targetWind - wind) * (1 - Math.exp(-dt * 3));

      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];
        p.phase += p.swaySpeed * f;

        const sway = Math.sin(p.phase) * p.swayAmount;
        p.x += (p.vx + wind + sway) * f;
        p.y += p.vy * f;

        p.rotationX += p.vRotX * f;
        p.rotationY += p.vRotY * f;
        p.rotationZ += (p.vRotZ + Math.cos(p.phase) * 0.004) * f;

        const scaleX = Math.abs(Math.cos(p.rotationY)) * 0.65 + 0.35;
        const scaleY = Math.abs(Math.sin(p.rotationX)) * 0.65 + 0.35;

        // Build the matrix by hand: one setTransform + one drawImage per petal (no save/restore).
        const k = p.size / PETAL_LEN;
        const sx = scaleX * k * dpr;
        const sy = scaleY * k * dpr;
        const cos = Math.cos(p.rotationZ);
        const sin = Math.sin(p.rotationZ);
        ctx.setTransform(cos * sx, sin * sx, -sin * sy, cos * sy, p.x * dpr, p.y * dpr);
        ctx.globalAlpha = p.opacity;
        ctx.drawImage(sprite, -SPRITE_SIZE / 2, -SPRITE_SIZE / 2);

        if (p.y > height + 40) {
          p.y = -35;
          p.x = Math.random() * (width + 300) - 150;
        }
        if (p.x > width + 120) {
          p.x = -60;
        } else if (p.x < -120) {
          p.x = width + 60;
        }
      }
      ctx.globalAlpha = 1;

      rafId = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running || !inView || document.hidden) return;
      running = true;
      last = performance.now();
      rafId = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(rafId);
    };

    // Pause the loop whenever the canvas is off-screen (e.g. the hero's petals while the
    // entrance scene is showing, or the entrance's petals after the curtain covers them).
    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          inView = entries[entries.length - 1].isIntersecting;
          if (inView) start();
          else stop();
        },
        { threshold: 0 }
      );
      observer.observe(canvas);
    }

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVisibility);

    start();

    return () => {
      stop();
      observer?.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('resize', onResize);
    };
  }, [enabled, velRef, count]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className={className || 'absolute inset-0 pointer-events-none z-20 w-full h-full'}
    />
  );
};