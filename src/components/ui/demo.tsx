import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Component from './festivity-hero'
import { MERCH_PRODUCTS } from '../../data/merchProducts'

interface DemoProps {
  shouldAnimate?: boolean
}

export default function Default({ shouldAnimate = false }: DemoProps) {
  const [merchOpen, setMerchOpen] = useState(false)
  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#F8F3E9] text-[#252321] select-none">
      {/* 3D WebGL Spheres Canvas */}
      <Component shouldAnimate={shouldAnimate} />

      {/* CENTER LOGO: CATALYST 7.0 on top of the pink bubbles */}
      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none select-none px-6 sm:px-8">
        <img
          src="/assets/catalyst_7_logo.png"
          alt="CATALYST 7.0"
          className="w-[84vw] max-w-[320px] sm:max-w-[480px] md:max-w-[560px] lg:max-w-[620px] h-auto object-contain filter drop-shadow-[0_8px_24px_rgba(0,0,0,0.12)] pointer-events-none transform -translate-y-2 sm:-translate-y-4"
        />
      </div>

      {/* Top Header & Navigation */}
      <div className="absolute top-5 sm:top-8 left-5 sm:left-10 right-5 sm:right-10 z-10 flex items-center justify-between pointer-events-none">
        <a
          href="/"
          onClick={(e) => {
            if (window.location.pathname === '/' || window.location.pathname === '') {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="flex items-center pointer-events-auto cursor-pointer group"
          title="Catalyst 7.0 - Home"
        >
          <img
            src="/assets/catalyst_7_logo.png"
            alt="CATALYST 7.0"
            className="h-8 sm:h-10 md:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </a>
        <nav className="flex items-center gap-4 sm:gap-7 lg:gap-11 font-['Bison',sans-serif] text-xs sm:text-base font-bold tracking-wider text-[#0e1118] pointer-events-auto uppercase">
          <a
            href="/"
            onClick={(e) => {
              if (window.location.pathname === '/' || window.location.pathname === '') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="hover:opacity-60 transition-opacity cursor-pointer"
          >
            HOME
          </a>
          <a
            href="/about"
            className="hover:opacity-60 transition-opacity cursor-pointer"
          >
            ABOUT
          </a>
          <a
            href="/gallery"
            onClick={(e) => {
              const galleryEl = document.getElementById('gallery');
              if (galleryEl) {
                e.preventDefault();
                galleryEl.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="hover:opacity-60 transition-opacity cursor-pointer"
          >
            GALLERY
          </a>
          {/* MERCH NAV ITEM WITH DIRECT PRODUCT DROPDOWN */}
          <div
            className="relative"
            onMouseEnter={() => setMerchOpen(true)}
            onMouseLeave={() => setMerchOpen(false)}
          >
            <Link
              to="/merch"
              className="hover:opacity-60 transition-opacity cursor-pointer text-[#b51e23] flex items-center gap-1"
            >
              <span>MERCH</span>
            </Link>

            {merchOpen && (
              <div className="absolute top-full -left-24 pt-3 w-72 z-50 animate-in fade-in duration-150">
                <div className="bg-[#FAF6EE] text-[#252321] rounded-xl p-3.5 shadow-2xl border border-[#E5DDD0] font-sans">
                  <div className="text-[10px] font-['Montserrat',sans-serif] tracking-widest text-[#C9362B] uppercase font-bold mb-2 pb-1.5 border-b border-[#252321]/10 flex items-center justify-between">
                    <span>CATALYST 7.0 MERCH</span>
                    <span className="text-[#736B63]">9 PIECES</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                    {MERCH_PRODUCTS.map((p) => (
                      <Link
                        key={p.id}
                        to={`/merch/${p.id}`}
                        className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-[#252321]/5 transition-colors group"
                      >
                        <img
                          src={p.images[0]}
                          alt=""
                          className="w-8 h-8 object-contain rounded-md bg-white p-0.5 border border-[#E5DDD0]"
                        />
                        <div className="min-w-0">
                          <p className="font-['Bison',sans-serif] text-sm text-[#252321] group-hover:text-[#C9362B] truncate font-bold">
                            {p.name}
                          </p>
                          <p className="text-[9px] text-[#736B63] uppercase truncate font-mono">
                            {p.variant}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link
                    to="/merch"
                    className="mt-2.5 pt-2 border-t border-[#252321]/10 block text-center font-['Montserrat',sans-serif] text-[10px] text-[#C9362B] hover:text-[#9E171C] uppercase tracking-wider font-bold"
                  >
                    Explore Full Store (9 Pieces) →
                  </Link>
                </div>
              </div>
            )}
          </div>
          <a
            href="/game"
            className="hover:opacity-60 transition-opacity cursor-pointer"
          >
            GAME
          </a>
          <a
            href="/contact"
            onClick={(e) => {
              const contactEl = document.getElementById('contact');
              if (contactEl) {
                e.preventDefault();
                contactEl.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="hover:opacity-60 transition-opacity cursor-pointer whitespace-nowrap"
          >
            CONTACT US
          </a>
        </nav>
      </div>

      {/* Left Middle Info (Responsive: hidden on narrow mobile to avoid cluttering central logo) */}
      <div className="absolute left-5 sm:left-10 top-1/4 z-10 pointer-events-none hidden sm:block">
        <h3 className="text-sm sm:text-base font-bold text-[#0e1118] tracking-tight">
          Catalyst 7.0
        </h3>
        <p className="text-xs sm:text-sm text-gray-700 font-sans mt-0.5">
          AIESEC in SLIIT &middot; Leadership Seminar
        </p>
        <div className="w-6 sm:w-7 h-[3px] bg-[#0e1118] mt-2.5" />
      </div>

      {/* Bottom Left Info */}
      <div className="absolute bottom-5 sm:bottom-10 left-5 sm:left-10 z-10 pointer-events-none">
        <div className="font-['Bison',sans-serif] text-4xl sm:text-7xl md:text-8xl font-black text-[#0e1118] leading-[0.8] tracking-tight">
          7.0
        </div>
        <div className="mt-2 sm:mt-4">
          <h4 className="text-xs sm:text-base font-bold text-[#0e1118] tracking-tight">
            Two-day leadership experience
          </h4>
        </div>
      </div>

      {/* Bottom Center Title */}
      <div className="absolute bottom-5 sm:bottom-10 left-1/2 -translate-x-1/2 z-10 pointer-events-none text-center">
        <span className="font-['Bison',sans-serif] text-xl sm:text-3xl md:text-4xl lg:text-[2.75rem] font-black tracking-[0.15em] sm:tracking-[0.2em] text-[#0e1118] whitespace-nowrap uppercase drop-shadow-[0_2px_12px_rgba(0,0,0,0.08)] leading-none">
          DARE BEYOND DEFINITION
        </span>
      </div>


      {/* Right Edge Vertical Text (Desktop only) */}
      <div className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none hidden lg:block">
        <span className="block font-['Bison',sans-serif] text-xs sm:text-sm font-bold tracking-[0.25em] text-[#0e1118] uppercase origin-center rotate-90 whitespace-nowrap">
          DRAG CURSOR TO PERFECT
        </span>
      </div>
    </div>
  )
}
