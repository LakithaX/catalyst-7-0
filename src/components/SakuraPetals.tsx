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
  mouseVelX?: number;
  windRef?: React.RefObject<number>;
  className?: string;
}

export const SakuraPetals: React.FC<SakuraPetalsProps> = ({ enabled, mouseVelX = 0, windRef, className }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animIdRef = useRef<number | null>(null);
  const smoothedWindRef = useRef<number>(0);
  const mouseVelRef = useRef<number>(mouseVelX);

  // Keep mouse velocity updated in a ref so the main loop is not torn down on every mouse move
  useEffect(() => {
    mouseVelRef.current = mouseVelX;
  }, [mouseVelX]);

  useEffect(() => {
    if (!enabled || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = window.innerWidth;
    let height = window.innerHeight;

    const updateSize = () => {
      if (!canvas) return;
      dpr = Math.min(window.devicePixelRatio || 1, width < 768 ? 1.5 : 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    // 34 organic cherry blossom petals across realistic depth planes
    const count = width < 768 ? 20 : 34;
    const petals: Petal[] = [];
    for (let i = 0; i < count; i++) {
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

    // Authentic notched sakura petal path (proportional, non-distorted)
    const drawPetal = (
      c: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      rotZ: number,
      scaleX: number,
      scaleY: number,
      opacity: number
    ) => {
      c.save();
      c.translate(x, y);
      c.rotate(rotZ);
      c.scale(scaleX, scaleY);

      const halfW = size * 0.52;
      const length = size;

      // Soft cherry blossom gradient: translucent blush ivory to rich sakura rose
      const grad = c.createLinearGradient(0, -length * 0.5, 0, length * 0.5);
      grad.addColorStop(0, `rgba(255, 244, 247, ${opacity})`);
      grad.addColorStop(0.35, `rgba(255, 192, 209, ${opacity * 0.96})`);
      grad.addColorStop(0.8, `rgba(244, 114, 156, ${opacity * 0.9})`);
      grad.addColorStop(1, `rgba(225, 78, 126, ${opacity * 0.85})`);

      c.fillStyle = grad;
      c.beginPath();

      // Signature notched sakura petal silhouette
      // Start at base tip
      c.moveTo(0, length * 0.5);
      // Left side curve outward towards upper lobe
      c.bezierCurveTo(-halfW * 1.05, length * 0.22, -halfW * 1.15, -length * 0.2, -halfW * 0.45, -length * 0.5);
      // Notched indentation at the petal crown
      c.quadraticCurveTo(0, -length * 0.32, halfW * 0.45, -length * 0.5);
      // Right side curve back down to base
      c.bezierCurveTo(halfW * 1.15, -length * 0.2, halfW * 1.05, length * 0.22, 0, length * 0.5);
      c.closePath();
      c.fill();

      // Delicate translucent center vein
      c.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.45})`;
      c.lineWidth = 0.9;
      c.beginPath();
      c.moveTo(0, length * 0.38);
      c.quadraticCurveTo(halfW * 0.06, 0, 0, -length * 0.22);
      c.stroke();

      c.restore();
    };

    // Paint the detailed gradient and curves once; frames only transform a bitmap.
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = 128;
    const spriteContext = sprite.getContext('2d');
    if (!spriteContext) return;
    drawPetal(spriteContext, 64, 64, 96, 0, 1, 1, 1);

    petals.sort((a, b) => a.z - b.z);
    let inView = false;
    let disposed = false;
    const loop = () => {
      animIdRef.current = null;
      if (disposed || !inView || document.hidden) return;
      // Clear with DPR scale
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Smoothly react to mouse velocity for responsive wind gusts
      const targetWind = Math.max(-2.0, Math.min(2.0, (windRef?.current ?? mouseVelRef.current) * 0.4));
      smoothedWindRef.current += (targetWind - smoothedWindRef.current) * 0.05;
      const wind = smoothedWindRef.current;

      for (const p of petals) {
        p.phase += p.swaySpeed;

        // Gentle undulating drift simulating air currents
        const sway = Math.sin(p.phase) * p.swayAmount;
        p.x += p.vx + wind + sway;
        p.y += p.vy;

        // Meditative 3D tumbling rotation
        p.rotationX += p.vRotX;
        p.rotationY += p.vRotY;
        p.rotationZ += p.vRotZ + Math.cos(p.phase) * 0.004;

        // Natural fluttering aspect ratio
        const scaleX = Math.abs(Math.cos(p.rotationY)) * 0.65 + 0.35;
        const scaleY = Math.abs(Math.sin(p.rotationX)) * 0.65 + 0.35;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotationZ);
        ctx.scale(scaleX, scaleY);
        ctx.globalAlpha = p.opacity;
        const spriteSize = p.size * 128 / 96;
        ctx.drawImage(sprite, -spriteSize / 2, -spriteSize / 2, spriteSize, spriteSize);
        ctx.restore();

        // Respawn gracefully when drifting out of view
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

      animIdRef.current = requestAnimationFrame(loop);
    };

    const resume = () => {
      if (!disposed && inView && !document.hidden && animIdRef.current === null) {
        animIdRef.current = requestAnimationFrame(loop);
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      resume();
    });
    observer.observe(canvas);
    document.addEventListener('visibilitychange', resume);

    return () => {
      disposed = true;
      observer.disconnect();
      document.removeEventListener('visibilitychange', resume);
      window.removeEventListener('resize', updateSize);
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
      animIdRef.current = null;
    };
  }, [enabled, windRef]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className={className || "absolute inset-0 pointer-events-none z-20 w-full h-full"}
    />
  );
};
