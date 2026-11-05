import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MERCH_PRODUCTS } from '../data/merchProducts';
import { useMerch } from '../context/MerchContext';

export interface NavbarProps {
  /** If true, renders with absolute positioning and pointer-events-none container (for hero canvas overlay) */
  isHero?: boolean;
  className?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ isHero = false, className = '' }) => {
  const [merchOpen, setMerchOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const location = useLocation();
  const { totalCartCount } = useMerch();

  const isHome = location.pathname === '/' || location.pathname === '';
  const isAbout = location.pathname.startsWith('/about') || location.pathname.startsWith('/oc');
  const isRegister = location.pathname.startsWith('/register') || location.pathname.startsWith('/registration');
  const isGallery = location.pathname.startsWith('/gallery');
  const isMerch = location.pathname.startsWith('/merch');
  const isGame = location.pathname.startsWith('/game');

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
    if (location.pathname === '/' || location.pathname === '') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAboutClick = (e: React.MouseEvent) => {
    if (location.pathname === '/' || location.pathname === '') {
      const aboutEl = document.getElementById('about');
      if (aboutEl) {
        e.preventDefault();
        aboutEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleGalleryClick = (e: React.MouseEvent) => {
    if (location.pathname === '/' || location.pathname === '') {
      const galleryEl = document.getElementById('gallery');
      if (galleryEl) {
        e.preventDefault();
        galleryEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleContactClick = (e: React.MouseEvent) => {
    if (location.pathname === '/' || location.pathname === '') {
      const contactEl = document.getElementById('contact');
      if (contactEl) {
        e.preventDefault();
        contactEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const navContent = (
    <>
      <Link
        to="/"
        onClick={handleHomeClick}
        className="flex items-center shrink-0 pointer-events-auto cursor-pointer group"
        title="Catalyst 7.0 - Home"
      >
        <img
          src="/assets/catalyst_7_logo.png"
          alt="CATALYST 7.0"
          className="h-7 sm:h-10 md:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </Link>
      <nav className="flex items-center gap-2.5 sm:gap-6 lg:gap-11 font-['Bison',sans-serif] text-[11px] sm:text-sm md:text-base font-bold tracking-wider text-[#0e1118] pointer-events-auto uppercase shrink-0">
        <Link
          to="/"
          onClick={handleHomeClick}
          className={`transition-all cursor-pointer whitespace-nowrap ${
            isHome ? 'text-[#b51e23]' : 'text-[#0e1118] hover:opacity-60'
          }`}
        >
          HOME
        </Link>
        <Link
          to="/about"
          className={`transition-all cursor-pointer whitespace-nowrap ${
            isAbout ? 'text-[#b51e23]' : 'text-[#0e1118] hover:opacity-60'
          }`}
        >
          ABOUT
        </Link>
        <Link
          to="/register"
          className={`transition-all cursor-pointer whitespace-nowrap ${
            isRegister ? 'text-[#b51e23]' : 'text-[#0e1118] hover:opacity-60'
          }`}
        >
          REGISTER
        </Link>
        <Link
          to="/gallery"
          className={`transition-all cursor-pointer whitespace-nowrap ${
            isGallery ? 'text-[#b51e23]' : 'text-[#0e1118] hover:opacity-60'
          }`}
        >
          GALLERY
        </Link>
        {/* MERCH NAV ITEM WITH DIRECT PRODUCT DROPDOWN */}
        <div
          className="relative shrink-0"
          onMouseEnter={() => setMerchOpen(true)}
          onMouseLeave={() => setMerchOpen(false)}
        >
          <Link
            to="/merch"
            onClick={() => setMerchOpen(false)}
            className={`transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap ${
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
          className={`transition-all cursor-pointer whitespace-nowrap ${
            isGame ? 'text-[#b51e23]' : 'text-[#0e1118] hover:opacity-60'
          }`}
        >
          GAME
        </Link>
        <Link
          to="/#contact"
          onClick={handleContactClick}
          className="hover:opacity-60 transition-opacity cursor-pointer whitespace-nowrap text-[#0e1118]"
        >
          CONTACT US
        </Link>
      </nav>
    </>
  );

  if (isHero) {
    return (
      <div className={`absolute top-4 sm:top-8 left-3 sm:left-10 right-3 sm:right-10 z-10 flex items-center justify-between pointer-events-none gap-2 ${className}`}>
        {navContent}
      </div>
    );
  }

  return (
    <header
      className={`${
        isGallery ? 'fixed top-0 left-0 right-0' : 'sticky top-0'
      } z-50 w-full bg-[#F8F3E9]/95 backdrop-blur-md select-none transition-transform transition-opacity duration-300 ease-in-out ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
      } ${className}`}
    >
      <div className="w-full px-3 sm:px-10 py-3.5 sm:py-5 flex items-center justify-between gap-2 shadow-xs">
        {navContent}
      </div>
    </header>
  );
};

export default Navbar;
