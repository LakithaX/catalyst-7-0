import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ShoppingBag } from 'lucide-react'
import Component from './festivity-hero'
import Navbar from '../Navbar'

interface DemoProps {
  shouldAnimate?: boolean
}

export default function Default({ shouldAnimate = false }: DemoProps) {
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
      <Navbar isHero />

      {/* ── Central Hero Action CTAs (Register for Event & Go to Merch) ── */}
      <div className="absolute top-[64%] sm:top-[66%] left-0 right-0 z-30 flex items-center justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto flex items-center justify-center gap-3 sm:gap-4 flex-row">
          {/* Register Button */}
          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2 px-5 sm:px-7 py-3 sm:py-3.5 rounded-full bg-[#B51E23] hover:bg-[#9E171C] text-white font-['Montserrat',sans-serif] text-[11px] sm:text-xs font-bold tracking-[0.16em] sm:tracking-[0.2em] uppercase shadow-[0_6px_22px_rgba(181,30,35,0.38)] hover:shadow-[0_10px_28px_rgba(181,30,35,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer group"
          >
            <span>REGISTER NOW</span>
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>

          {/* Go to Merch Button */}
          <Link
            to="/merch"
            className="inline-flex items-center justify-center gap-2 px-5 sm:px-7 py-3 sm:py-3.5 rounded-full bg-[#FAF6EE]/90 hover:bg-[#252321] text-[#252321] hover:text-[#FAF6EE] border border-[#252321]/30 hover:border-[#252321] font-['Montserrat',sans-serif] text-[11px] sm:text-xs font-bold tracking-[0.16em] sm:tracking-[0.2em] uppercase shadow-[0_4px_16px_rgba(37,35,33,0.06)] hover:shadow-[0_8px_24px_rgba(37,35,33,0.15)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer backdrop-blur-md group"
          >
            <ShoppingBag size={14} className="text-[#C9362B] group-hover:text-[#FAF6EE] transition-colors" />
            <span>EXPLORE MERCH</span>
          </Link>
        </div>
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

      {/* Bottom Left Info (Desktop) */}
      <div className="hidden sm:block absolute bottom-5 sm:bottom-10 left-5 sm:left-10 z-10 pointer-events-none">
        <div className="font-['Bison',sans-serif] text-4xl sm:text-7xl md:text-8xl font-black text-[#0e1118] leading-[0.8] tracking-tight">
          7.0
        </div>
        <div className="mt-2 sm:mt-4">
          <h4 className="text-xs sm:text-base font-bold text-[#0e1118] tracking-tight">
            Two-day leadership experience
          </h4>
        </div>
      </div>

      {/* Bottom Center Title (Desktop) */}
      <div className="hidden sm:block absolute bottom-5 sm:bottom-10 left-1/2 -translate-x-1/2 z-10 pointer-events-none text-center">
        <span className="font-['Bison',sans-serif] text-xl sm:text-3xl md:text-4xl lg:text-[2.75rem] font-black tracking-[0.15em] sm:tracking-[0.2em] text-[#0e1118] whitespace-nowrap uppercase drop-shadow-[0_2px_12px_rgba(0,0,0,0.08)] leading-none">
          DARE BEYOND DEFINITION
        </span>
      </div>

      {/* Mobile Bottom Layout (< sm: Clean vertical stack to eliminate any text overlap) */}
      <div className="sm:hidden absolute bottom-3.5 left-4 right-4 z-10 pointer-events-none flex flex-col">
        {/* Edition & Subtitle */}
        <div className="flex flex-col items-start">
          <div className="font-['Bison',sans-serif] text-3xl font-black text-[#0e1118] leading-[0.85] tracking-tight">
            7.0
          </div>
          <div className="mt-1">
            <h4 className="text-[10.5px] font-bold text-[#0e1118] tracking-tight">
              Two-day leadership experience
            </h4>
          </div>
        </div>

        {/* Motto */}
        <div className="mt-2.5 text-center w-full">
          <span className="font-['Bison',sans-serif] text-[clamp(1.05rem,4.8vw,1.35rem)] font-black tracking-[0.14em] text-[#0e1118] whitespace-nowrap uppercase drop-shadow-[0_2px_12px_rgba(0,0,0,0.08)] leading-none inline-block">
            DARE BEYOND DEFINITION
          </span>
        </div>
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
