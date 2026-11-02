/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';

interface ParticleProps {
  scrollProgress: number; // 0 (Hero) to 1 (Fully sliced / explored)
  isSliced: boolean;
  onManualSlash?: () => void;
}

interface Petal {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotSpeed: number;
  color: string;
  type: 'sakura' | 'momiji';
  opacity: number;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

interface Shard {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  vRotX: number;
  vRotY: number;
  vRotZ: number;
  size: number;
  points: { x: number; y: number }[];
  color: string;
  hasGold: boolean;
  life: number;
}

export default function KatanaParticles({ scrollProgress, isSliced, onManualSlash }: ParticleProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const petalsRef = useRef<Petal[]>([]);
  const sparksRef = useRef<Spark[]>([]);
  const shardsRef = useRef<Shard[]>([]);
  const lastSlicedRef = useRef<boolean>(false);
  const isDraggingRef = useRef<boolean>(false);
  const dragPointsRef = useRef<{ x: number; y: number }[]>([]);

  // Initialize petals (Sakura for hero, Momiji for katana)
  useEffect(() => {
    const petals: Petal[] = [];
    const count = 45;
    for (let i = 0; i < count; i++) {
      const isAutumn = Math.random() > 0.45;
      petals.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: 9 + Math.random() * 14,
        speedX: -0.6 - Math.random() * 1.5,
        speedY: 0.8 + Math.random() * 1.6,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.04,
        color: isAutumn
          ? Math.random() > 0.5
            ? '#cf2d2d' // deep crimson momiji
            : '#e84b2c' // autumn amber
          : '#ffc5d3', // soft pink sakura
        type: isAutumn ? 'momiji' : 'sakura',
        opacity: 0.45 + Math.random() * 0.45,
      });
    }
    petalsRef.current = petals;
  }, []);

  // Trigger burst of sparks & tumbling shards when cut happens
  const triggerSliceBurst = (centerX?: number, centerY?: number) => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const cx = centerX ?? w * 0.5;
    const cy = centerY ?? h * 0.5;

    // Sparks along the diagonal slice cut (-25 deg)
    const newSparks: Spark[] = [];
    const numSparks = 60;
    for (let i = 0; i < numSparks; i++) {
      const t = (i / numSparks) * 2 - 1; // -1 to 1 along slash
      const sparkOriginX = cx + t * (w * 0.45);
      const sparkOriginY = cy + t * (w * 0.22); // diagonal

      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 8;
      newSparks.push({
        x: sparkOriginX,
        y: sparkOriginY,
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 4,
        vy: Math.sin(angle) * speed - Math.random() * 3,
        life: 0,
        maxLife: 20 + Math.random() * 35,
        size: 1.5 + Math.random() * 3,
        color: Math.random() > 0.3 ? '#fff5cc' : '#ff9933',
      });
    }
    sparksRef.current.push(...newSparks);

    // Exploding Ceramic Shards (like Image 2 shattered pot)
    const newShards: Shard[] = [];
    const numShards = 16;
    for (let i = 0; i < numShards; i++) {
      const angle = (i / numShards) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const speed = 2.5 + Math.random() * 7;
      const size = 16 + Math.random() * 28;

      // Random polygon vertices for broken pottery piece
      const numPts = 3 + Math.floor(Math.random() * 3);
      const points: { x: number; y: number }[] = [];
      for (let p = 0; p < numPts; p++) {
        const a = (p / numPts) * Math.PI * 2;
        const r = size * (0.6 + Math.random() * 0.5);
        points.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
      }

      newShards.push({
        x: cx + (Math.random() - 0.5) * 60,
        y: cy + (Math.random() - 0.5) * 60,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        rotX: Math.random() * Math.PI,
        rotY: Math.random() * Math.PI,
        rotZ: Math.random() * Math.PI,
        vRotX: (Math.random() - 0.5) * 0.1,
        vRotY: (Math.random() - 0.5) * 0.12,
        vRotZ: (Math.random() - 0.5) * 0.08,
        size,
        points,
        color: Math.random() > 0.4 ? '#2b2622' : '#453c37',
        hasGold: Math.random() > 0.35, // Kintsugi gold vein
        life: 1.0,
      });
    }
    shardsRef.current = newShards;
  };

  // Watch for slice change
  useEffect(() => {
    if (isSliced && !lastSlicedRef.current) {
      triggerSliceBurst();
    }
    lastSlicedRef.current = isSliced;
  }, [isSliced]);

  // Canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;

      // 1. Draw Petals (Sakura / Momiji)
      const petals = petalsRef.current;
      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotSpeed;

        if (p.x < -40) p.x = w + 40;
        if (p.y > h + 40) {
          p.y = -30;
          p.x = Math.random() * w;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;

        if (p.type === 'sakura') {
          // Sakura petal shape
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.moveTo(0, -p.size * 0.7);
          ctx.bezierCurveTo(p.size * 0.5, -p.size * 0.4, p.size * 0.6, p.size * 0.5, 0, p.size * 0.7);
          ctx.bezierCurveTo(-p.size * 0.6, p.size * 0.5, -p.size * 0.5, -p.size * 0.4, 0, -p.size * 0.7);
          ctx.fill();
        } else {
          // Momiji autumn leaf shape (stylized 3 lobes)
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.moveTo(0, -p.size * 0.8);
          ctx.lineTo(p.size * 0.4, -p.size * 0.3);
          ctx.lineTo(p.size * 0.75, 0);
          ctx.lineTo(p.size * 0.3, p.size * 0.4);
          ctx.lineTo(0, p.size * 0.9);
          ctx.lineTo(-p.size * 0.3, p.size * 0.4);
          ctx.lineTo(-p.size * 0.75, 0);
          ctx.lineTo(-p.size * 0.4, -p.size * 0.3);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }

      // 2. Draw Sparks
      const sparks = sparksRef.current;
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.22; // gravity
        s.life += 1;

        const progress = s.life / s.maxLife;
        if (progress >= 1) {
          sparks.splice(i, 1);
          continue;
        }

        const alpha = 1 - progress;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = s.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#ffbb44';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * (1 - progress * 0.5), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 3. Draw Exploding 3D Pottery Shards
      const shards = shardsRef.current;
      for (let i = shards.length - 1; i >= 0; i--) {
        const sh = shards[i];
        sh.x += sh.vx;
        sh.y += sh.vy;
        sh.vy += 0.12; // gentle float gravity
        sh.rotX += sh.vRotX;
        sh.rotY += sh.vRotY;
        sh.rotZ += sh.vRotZ;
        sh.vx *= 0.985;
        sh.vy *= 0.985;

        ctx.save();
        ctx.translate(sh.x, sh.y);
        // Fake 3D perspective projection via transform scaling
        const cosX = Math.cos(sh.rotX);
        const cosY = Math.cos(sh.rotY);
        ctx.scale(cosX, cosY);
        ctx.rotate(sh.rotZ);

        // Draw shard ceramic body
        ctx.fillStyle = sh.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(0,0,0,0.45)';
        ctx.beginPath();
        for (let p = 0; p < sh.points.length; p++) {
          const pt = sh.points[p];
          if (p === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.closePath();
        ctx.fill();

        // Kintsugi gold vein seam on edge
        if (sh.hasGold) {
          ctx.strokeStyle = '#ffd700';
          ctx.lineWidth = 2.5;
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#ffea79';
          ctx.beginPath();
          ctx.moveTo(sh.points[0].x, sh.points[0].y);
          ctx.lineTo(sh.points[1].x, sh.points[1].y);
          ctx.stroke();
        }

        ctx.restore();
      }

      // 4. Draw interactive drag slash trail if user is dragging
      if (dragPointsRef.current.length > 1) {
        ctx.save();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#80d4ff';
        ctx.beginPath();
        for (let i = 0; i < dragPointsRef.current.length; i++) {
          const pt = dragPointsRef.current[i];
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Mouse & Touch interaction for manual blade slash
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragPointsRef.current = [{ x: e.clientX, y: e.clientY }];
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    dragPointsRef.current.push({ x: e.clientX, y: e.clientY });
    if (dragPointsRef.current.length > 18) {
      dragPointsRef.current.shift();
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isDraggingRef.current && dragPointsRef.current.length > 3) {
      triggerSliceBurst(e.clientX, e.clientY);
      if (onManualSlash) onManualSlash();
    }
    isDraggingRef.current = false;
    dragPointsRef.current = [];
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-20 pointer-events-none"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
