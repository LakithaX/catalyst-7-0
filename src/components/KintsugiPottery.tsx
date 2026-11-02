/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { soundscape } from '../utils/audio';

export default function KintsugiPottery() {
  const [isMended, setIsMended] = useState<boolean>(false);

  const toggleMend = () => {
    setIsMended(!isMended);
    if (!isMended) {
      soundscape.playBladeGlint();
    } else {
      soundscape.playCeramicShatter();
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#181513] to-[#0d0b0a] border border-[#bf3030]/30 p-8 shadow-2xl">
      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Interactive Vessel Canvas */}
        <div className="relative w-64 h-64 flex-shrink-0 flex items-center justify-center">
          {/* Subtle golden aura */}
          <div
            className="absolute inset-0 rounded-full transition-opacity duration-1000"
            style={{
              background: isMended
                ? 'radial-gradient(circle, rgba(255,215,0,0.25) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(191,48,48,0.15) 0%, transparent 70%)',
              opacity: isMended ? 1 : 0.4,
            }}
          />

          {/* Ceramic Vessel with 4 Shards */}
          <div className="relative w-44 h-48 select-none">
            {/* Shard 1 (Top Left) */}
            <div
              className="absolute inset-0 transition-transform duration-700 ease-out"
              style={{
                clipPath: 'polygon(50% 0%, 0% 40%, 45% 55%, 50% 0%)',
                background: 'linear-gradient(135deg, #3d342f 0%, #201b18 100%)',
                transform: isMended ? 'translate(0, 0) rotate(0deg)' : 'translate(-18px, -14px) rotate(-6deg)',
              }}
            />

            {/* Shard 2 (Top Right) */}
            <div
              className="absolute inset-0 transition-transform duration-700 ease-out"
              style={{
                clipPath: 'polygon(50% 0%, 100% 35%, 55% 50%, 50% 0%)',
                background: 'linear-gradient(225deg, #483e38 0%, #25201c 100%)',
                transform: isMended ? 'translate(0, 0) rotate(0deg)' : 'translate(16px, -16px) rotate(8deg)',
              }}
            />

            {/* Shard 3 (Bottom Left) */}
            <div
              className="absolute inset-0 transition-transform duration-700 ease-out"
              style={{
                clipPath: 'polygon(0% 40%, 45% 55%, 35% 100%, 15% 95%, 0% 40%)',
                background: 'linear-gradient(45deg, #322b27 0%, #1c1815 100%)',
                transform: isMended ? 'translate(0, 0) rotate(0deg)' : 'translate(-20px, 16px) rotate(-4deg)',
              }}
            />

            {/* Shard 4 (Bottom Right Base) */}
            <div
              className="absolute inset-0 transition-transform duration-700 ease-out"
              style={{
                clipPath: 'polygon(100% 35%, 45% 55%, 35% 100%, 75% 95%, 100% 35%)',
                background: 'linear-gradient(315deg, #423832 0%, #28221d 100%)',
                transform: isMended ? 'translate(0, 0) rotate(0deg)' : 'translate(14px, 14px) rotate(5deg)',
              }}
            />

            {/* Gold Veins when Mended */}
            {isMended && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_0_8px_rgba(255,215,0,0.8)] animate-fade-in">
                <path
                  d="M 50% 0% L 45% 55% L 35% 100%"
                  stroke="#ffd700"
                  strokeWidth="3.5"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M 0% 40% L 45% 55% L 100% 35%"
                  stroke="#ffe066"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </div>
        </div>

        {/* Text info */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[#bf3030] text-xs font-mono tracking-widest uppercase">Philosophy</span>
            <span className="text-neutral-500">•</span>
            <span className="text-amber-300/90 text-xs font-serif tracking-widest">金継ぎ (Golden Joinery)</span>
          </div>

          <h3 className="text-xl md:text-2xl font-serif text-white tracking-wide">
            {isMended ? 'Mended with Molten Gold' : 'Shattered by the Blade'}
          </h3>

          <p className="text-sm text-neutral-300 font-serif leading-relaxed">
            In traditional Japanese aesthetics, broken ceramics are never discarded. Instead, artisans rejoin the fractures
            with lacquer dusted in pure gold powder. Rather than hiding the damage, Kintsugi illuminates the scars—teaching
            that fragility and resilience form true beauty.
          </p>

          <div className="pt-2">
            <button
              onClick={toggleMend}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-sans tracking-widest uppercase font-bold transition-all transform hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
              style={{
                backgroundColor: isMended ? '#d4af37' : '#bf3030',
                color: isMended ? '#111' : '#fff',
              }}
            >
              {isMended ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  Shatter Shards Again
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Mend Fractures with Gold
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
