import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { MERCH_PRODUCTS } from '../data/merchProducts';
import { useMerch } from '../context/MerchContext';
import { CatalystMark } from './brand/CatalystMark';

const LOGO_SRC = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/assets/catalyst_7_logo.png`;

export interface NavbarProps {
  /** If true, renders with absolute positioning and pointer-events-none container (for hero canvas overlay) */
  isHero?: boolean;
  className?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ isHero = false, className = '' }) => {
  const [merchOpen, setMerchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const location = useLocation();
  const { totalCartCount, openCart, isCartOpen } = useMerch();
  const shouldReduceMotion = useReducedMotion();
  const isCartActive = location.pathname.startsWith('/merch/cart') || isCartOpen;

  const isHome = location.pathname === '/' || location.pathname === '';
  const isAbout = location.pathname.startsWith('/about') || location.pathname.startsWith('/oc');
  const isRegister = location.pathname.startsWith('/register') || location.pathname.startsWith('/registration');
  const isGallery = location.pathname.startsWith('/gallery');
  const isMerch = location.pathname.startsWith('/merch') && !location.pathname.startsWith('/merch/cart');
  const isGame = location.pathname.startsWith('/game');
  const isContact = location.pathname.startsWith('/contact');

  // Prevent background scroll when mobile menu is active
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close menus on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setMerchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setIsVisible(true);
  }, [location.pathname]);

  // Intelligent scroll hide/reveal controller
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDiff = currentScrollY - lastScrollY;

      // Close merch menu on scroll
      if (Math.abs(scrollDiff) > 5) {
        setMerchOpen(false);
      }

      // Always show navbar when at or near top
      if (currentScrollY <= 15) {
        setIsVisible(true);
      } else if (isGallery) {
        // On Gallery page:
        // Inside the cinematic 1100vh scrub intro, keep navbar fully hidden while exploring slides.
        // It smoothly reappears when user scrolls back to the very top.
        const introEl = document.getElementById('intro');
        const introEnd = introEl ? introEl.offsetTop + introEl.offsetHeight - window.innerHeight : 8000;

        if (currentScrollY < introEnd) {
          setIsVisible(false);
        } else {
          // Below intro in chapter mosaic grids: reveal on scroll up, hide on scroll down
          if (scrollDiff > 4) {
            setIsVisible(false);
          } else if (scrollDiff < -6) {
            setIsVisible(true);
          }
        }
      } else {
        // On all other pages: hide as soon as scrolling down, reveal smoothly on scroll up
        if (scrollDiff > 4) {
          setIsVisible(false);
        } else if (scrollDiff < -6) {
          setIsVisible(true);
        }
      }

      lastScrollY = Math.max(0, currentScrollY);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(handleScroll);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isGallery]);

  const handleHomeClick = (e: React.MouseEvent) => {
    setMobileMenuOpen(false);
    if (location.pathname === '/' || location.pathname === '') {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('catalyst:go-to-hero'));
    }
  };


  const handleContactClick = () => {
    setMobileMenuOpen(false);
  };

  // Logo pill rendered on cream pill with soft shadow and backdrop blur
  const renderCartButton = (forHero: boolean) => (
    <button
      type="button"
      onClick={openCart}
      aria-label={totalCartCount === 0 ? 'Cart, empty' : `Cart, ${totalCartCount} items`}
      title="Cart"
      className={`relative min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B51E23] focus-visible:ring-offset-2 ${
        forHero
          ? 'bg-[#FAF6EE]/90 border border-[#252321]/10 shadow-[0_2px_8px_rgba(37,35,33,0.08)] backdrop-blur-sm'
          : 'hover:bg-[#252321]/5 border border-[#252321]/10 bg-[#FAF6EE]/50'
      } ${
        isCartActive ? 'text-[#B51E23]' : 'text-[#0e1118] hover:text-[#B51E23]'
      }`}
    >
      <ShoppingBag size={21} className="transition-transform duration-200 hover:scale-105" />
      {totalCartCount > 0 && (
        <motion.span
          key={totalCartCount}
          initial={shouldReduceMotion ? false : { scale: 0.6 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
          className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#B51E23] text-white text-[10px] font-bold font-sans rounded-full flex items-center justify-center border-2 border-white shadow-sm pointer-events-none"
        >
          {totalCartCount > 9 ? '9+' : totalCartCount}
        </motion.span>
      )}
    </button>
  );

  const registerButton = (
    <Link
      to="/register"
      className="transition-all duration-200 cursor-pointer whitespace-nowrap bg-[#B51E23] hover:bg-[#9E171C] text-white rounded-full px-4 py-2 text-xs sm:text-sm font-bold tracking-wider shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-100 flex items-center justify-center font-['Bison',sans-serif] uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B51E23] focus-visible:ring-offset-2"
    >
      REGISTER
    </Link>
  );

  const logoPill = (
    <Link
      to="/"
      state={{ directToHero: true }}
      onClick={handleHomeClick}
      className="flex items-center gap-2 sm:gap-2.5 shrink-0 pointer-events-auto cursor-pointer group bg-[#FAF6EE]/90 rounded-full px-3 py-1.5 backdrop-blur-sm shadow-[0_2px_8px_rgba(37,35,33,0.08)] border border-[#252321]/10 hover:border-[#252321]/20 transition-all duration-300"
      title="Catalyst 7.0 - Home"
      aria-label="Catalyst 7.0 home"
    >
      <CatalystMark
        size="sm"
        priority
        className="h-6 sm:h-8 md:h-10 w-auto transition-transform duration-300 group-hover:scale-105"
      />
      <img
        src={LOGO_SRC}
        alt="Catalyst 7.0"
        loading="eager"
        decoding="async"
        onError={(e) => {
          const img = e.currentTarget;
          if (!img.dataset.fallbackTried) {
            img.dataset.fallbackTried = 'true';
            img.src = '/assets/catalyst_7_logo.png';
          }
        }}
        className="h-[34px] sm:h-11 md:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
      />
    </Link>
  );

  return (
    <>
      {isHero ? (
        <div
          className={`absolute top-4 sm:top-8 left-3 sm:left-10 right-3 sm:right-10 z-50 flex items-center justify-between pointer-events-none gap-2 ${className}`}
        >
          {logoPill}

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-6 lg:gap-8 xl:gap-10 pointer-events-auto shrink-0">
            <nav aria-label="Main" className="flex items-center gap-4 lg:gap-6 xl:gap-8 font-['Bison',sans-serif] text-sm lg:text-base font-bold tracking-wider text-[#0e1118] uppercase shrink-0">
            <Link
              to="/"
              state={{ directToHero: true }}
              onClick={handleHomeClick}
              aria-current={isHome ? 'page' : undefined}
              className={`transition-all cursor-pointer whitespace-nowrap py-1 ${
                isHome ? 'text-[#b51e23]' : 'text-[#0e1118] hover:opacity-60'
              }`}
            >
              HOME
            </Link>
            <Link
              to="/about"
              aria-current={isAbout ? 'page' : undefined}
              className={`transition-all cursor-pointer whitespace-nowrap py-1 ${
                isAbout ? 'text-[#b51e23]' : 'text-[#0e1118] hover:opacity-60'
              }`}
            >
              ABOUT
            </Link>
            <Link
              to="/gallery"
              aria-current={isGallery ? 'page' : undefined}
              className={`transition-all cursor-pointer whitespace-nowrap py-1 ${
                isGallery ? 'text-[#b51e23]' : 'text-[#0e1118] hover:opacity-60'
              }`}
            >
              GALLERY
            </Link>

            {/* MERCH NAV ITEM WITH PRODUCT DROPDOWN */}
            <div
              className="relative shrink-0"
              onMouseEnter={() => setMerchOpen(true)}
              onMouseLeave={() => setMerchOpen(false)}
            >
              <Link
                to="/merch"
                onClick={() => setMerchOpen(false)}
                aria-current={isMerch ? 'page' : undefined}
                className={`transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap py-1 ${
                  isMerch ? 'text-[#b51e23]' : 'text-[#0e1118] hover:opacity-60'
                }`}
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
                          onClick={() => setMerchOpen(false)}
                          className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-[#252321]/5 transition-colors group"
                        >
                          <img
                            src={p.images[0]}
                            alt=""
                            className="w-8 h-8 object-contain rounded-md bg-white p-0.5 border border-[#E5DDD0]"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <p className="font-['Bison',sans-serif] text-sm text-[#252321] group-hover:text-[#C9362B] truncate font-bold">
                                {p.name}
                              </p>
                              <span className="text-[11px] font-['Bison',sans-serif] font-bold text-[#C9362B] shrink-0">
                                {p.priceDisplay}
                              </span>
                            </div>
                            <p className="text-[9px] text-[#736B63] uppercase truncate font-mono">
                              {p.variant}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-[#252321]/10 flex items-center justify-between text-[10px] font-['Montserrat',sans-serif] font-bold uppercase tracking-wider">
                      <Link
                        to="/merch"
                        onClick={() => setMerchOpen(false)}
                        className="text-[#C9362B] hover:text-[#9E171C]"
                      >
                        Store (9 Pieces) →
                      </Link>
                      <Link
                        to="/merch/cart"
                        onClick={() => setMerchOpen(false)}
                        className="text-[#736B63] hover:text-[#C9362B]"
                      >
                        {totalCartCount > 0 ? `Claim Bag (${totalCartCount})` : 'Claim Bag'}
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/game"
              aria-current={isGame ? 'page' : undefined}
              className={`transition-all cursor-pointer whitespace-nowrap py-1 ${
                isGame ? 'text-[#b51e23]' : 'text-[#0e1118] hover:opacity-60'
              }`}
            >
              PLAY
            </Link>
            <Link
              to="/contact"
              onClick={handleContactClick}
              aria-current={isContact ? 'page' : undefined}
              className={`transition-all cursor-pointer whitespace-nowrap py-1 ${
                isContact ? 'text-[#b51e23]' : 'text-[#0e1118] hover:opacity-60'
              }`}
            >
              CONTACT
            </Link>
          </nav>

          {/* Actions group: Cart, then REGISTER */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {renderCartButton(true)}
            {registerButton}
          </div>
        </div>

          {/* Mobile Actions (< 1024px) */}
          <div className="flex lg:hidden items-center gap-2 pointer-events-auto">
            {renderCartButton(true)}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-[#FAF6EE]/90 border border-[#252321]/10 shadow-[0_2px_8px_rgba(37,35,33,0.08)] backdrop-blur-sm flex items-center justify-center text-[#0e1118] hover:text-[#B51E23] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B51E23] focus-visible:ring-offset-2"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      ) : (
        <header
          className={`${
            isGallery ? 'fixed top-0 left-0 right-0' : 'sticky top-0'
          } z-50 w-full bg-[#F8F3E9]/95 backdrop-blur-md select-none transition-transform transition-opacity duration-300 ease-in-out ${
            isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
          } ${className}`}
        >
          <div className="w-full px-3 sm:px-10 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 shadow-xs">
            {logoPill}

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-6 lg:gap-8 xl:gap-10 pointer-events-auto shrink-0">
            <nav aria-label="Main" className="flex items-center gap-4 lg:gap-6 xl:gap-8 font-['Bison',sans-serif] text-sm lg:text-base font-bold tracking-wider text-[#0e1118] uppercase shrink-0">
              <Link
                to="/"
                state={{ directToHero: true }}
                onClick={handleHomeClick}
                aria-current={isHome ? 'page' : undefined}
              className={`transition-all cursor-pointer whitespace-nowrap py-1 ${
                  isHome ? 'text-[#b51e23]' : 'text-[#0e1118] hover:opacity-60'
                }`}
              >
                HOME
              </Link>
              <Link
                to="/about"
                aria-current={isAbout ? 'page' : undefined}
                className={`transition-all cursor-pointer whitespace-nowrap py-1 ${
                  isAbout ? 'text-[#b51e23]' : 'text-[#0e1118] hover:opacity-60'
                }`}
              >
                ABOUT
              </Link>
              <Link
                to="/gallery"
                aria-current={isGallery ? 'page' : undefined}
                className={`transition-all cursor-pointer whitespace-nowrap py-1 ${
                  isGallery ? 'text-[#b51e23]' : 'text-[#0e1118] hover:opacity-60'
                }`}
              >
                GALLERY
              </Link>

              {/* MERCH NAV ITEM WITH PRODUCT DROPDOWN */}
              <div
                className="relative shrink-0"
                onMouseEnter={() => setMerchOpen(true)}
                onMouseLeave={() => setMerchOpen(false)}
              >
                <Link
                  to="/merch"
                  onClick={() => setMerchOpen(false)}
                  aria-current={isMerch ? 'page' : undefined}
                className={`transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap py-1 ${
                    isMerch ? 'text-[#b51e23]' : 'text-[#0e1118] hover:opacity-60'
                  }`}
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
                            onClick={() => setMerchOpen(false)}
                            className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-[#252321]/5 transition-colors group"
                          >
                            <img
                              src={p.images[0]}
                              alt=""
                              className="w-8 h-8 object-contain rounded-md bg-white p-0.5 border border-[#E5DDD0]"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <p className="font-['Bison',sans-serif] text-sm text-[#252321] group-hover:text-[#C9362B] truncate font-bold">
                                  {p.name}
                                </p>
                                <span className="text-[11px] font-['Bison',sans-serif] font-bold text-[#C9362B] shrink-0">
                                  {p.priceDisplay}
                                </span>
                              </div>
                              <p className="text-[9px] text-[#736B63] uppercase truncate font-mono">
                                {p.variant}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                      <div className="mt-2.5 pt-2 border-t border-[#252321]/10 flex items-center justify-between text-[10px] font-['Montserrat',sans-serif] font-bold uppercase tracking-wider">
                        <Link
                          to="/merch"
                          onClick={() => setMerchOpen(false)}
                          className="text-[#C9362B] hover:text-[#9E171C]"
                        >
                          Store (9 Pieces) →
                        </Link>
                        <Link
                          to="/merch/cart"
                          onClick={() => setMerchOpen(false)}
                          className="text-[#736B63] hover:text-[#C9362B]"
                        >
                          {totalCartCount > 0 ? `Claim Bag (${totalCartCount})` : 'Claim Bag'}
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Link
                to="/game"
                aria-current={isGame ? 'page' : undefined}
              className={`transition-all cursor-pointer whitespace-nowrap py-1 ${
                  isGame ? 'text-[#b51e23]' : 'text-[#0e1118] hover:opacity-60'
                }`}
              >
                PLAY
              </Link>
              <Link
                to="/contact"
                onClick={handleContactClick}
                aria-current={isContact ? 'page' : undefined}
              className={`transition-all cursor-pointer whitespace-nowrap py-1 ${
                  isContact ? 'text-[#b51e23]' : 'text-[#0e1118] hover:opacity-60'
                }`}
              >
                CONTACT
              </Link>
            </nav>

            {/* Actions group: Cart, then REGISTER */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              {renderCartButton(false)}
              {registerButton}
            </div>
          </div>

            {/* Mobile Actions (< 1024px) */}
            <div className="flex lg:hidden items-center gap-2 pointer-events-auto">
              {renderCartButton(false)}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
                className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-[#FAF6EE]/90 border border-[#252321]/10 shadow-[0_2px_8px_rgba(37,35,33,0.08)] backdrop-blur-sm flex items-center justify-center text-[#0e1118] hover:text-[#B51E23] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B51E23] focus-visible:ring-offset-2"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Mobile Drawer / Overlay Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden flex flex-col bg-[#F8F3E9] text-[#252321] select-none animate-in fade-in duration-200">
          {/* Header of mobile drawer */}
          <div className="w-full px-4 py-4 flex items-center justify-between border-b border-[#252321]/10">
            {logoPill}
            <button
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close navigation"
              className="w-10 h-10 rounded-full bg-[#FAF6EE] border border-[#252321]/15 shadow-sm flex items-center justify-center text-[#0e1118] hover:text-[#B51E23] transition-colors cursor-pointer"
            >
              <X size={22} />
            </button>
          </div>

          {/* Links list */}
          <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col justify-between">
            <nav className="flex flex-col gap-2 font-['Bison',sans-serif] text-2xl font-bold tracking-wider text-[#0e1118] uppercase">
              <Link
                to="/"
                state={{ directToHero: true }}
                onClick={handleHomeClick}
                className={`py-3 px-4 rounded-xl transition-all ${
                  isHome ? 'text-[#B51E23] bg-[#B51E23]/10' : 'hover:bg-[#252321]/5'
                }`}
              >
                HOME
              </Link>
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className={`py-3 px-4 rounded-xl transition-all ${
                  isAbout ? 'text-[#B51E23] bg-[#B51E23]/10' : 'hover:bg-[#252321]/5'
                }`}
              >
                ABOUT
              </Link>
              <Link
                to="/gallery"
                onClick={() => setMobileMenuOpen(false)}
                className={`py-3 px-4 rounded-xl transition-all ${
                  isGallery ? 'text-[#B51E23] bg-[#B51E23]/10' : 'hover:bg-[#252321]/5'
                }`}
              >
                GALLERY
              </Link>
              <Link
                to="/merch"
                onClick={() => setMobileMenuOpen(false)}
                className={`py-3 px-4 rounded-xl transition-all flex items-center justify-between ${
                  isMerch ? 'text-[#B51E23] bg-[#B51E23]/10' : 'hover:bg-[#252321]/5'
                }`}
              >
                <span>MERCH</span>
                <span className="text-xs font-mono font-normal text-[#C9362B] bg-[#C9362B]/10 px-2.5 py-1 rounded-full">
                  9 PIECES
                </span>
              </Link>
              <Link
                to="/game"
                onClick={() => setMobileMenuOpen(false)}
                className={`py-3 px-4 rounded-xl transition-all ${
                  isGame ? 'text-[#B51E23] bg-[#B51E23]/10' : 'hover:bg-[#252321]/5'
                }`}
              >
                PLAY
              </Link>
              <Link
                to="/contact"
                onClick={handleContactClick}
                className={`py-3 px-4 rounded-xl transition-all ${
                  isContact ? 'text-[#B51E23] bg-[#B51E23]/10' : 'hover:bg-[#252321]/5 text-[#0e1118]'
                }`}
              >
                CONTACT
              </Link>
            </nav>

            {/* Bottom Register CTA in mobile drawer */}
            <div className="pt-6 border-t border-[#252321]/10 flex flex-col gap-3">
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3.5 px-6 rounded-full bg-[#B51E23] hover:bg-[#9E171C] text-white text-center font-['Bison',sans-serif] text-xl font-bold tracking-widest uppercase shadow-md active:scale-[0.99] transition-all"
              >
                REGISTER NOW
              </Link>
              <p className="text-center font-['Montserrat',sans-serif] text-[10px] text-[#736B63] uppercase tracking-wider font-semibold">
                Catalyst 7.0 &middot; AIESEC in SLIIT
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
