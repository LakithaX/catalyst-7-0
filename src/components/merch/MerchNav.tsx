import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, ChevronDown, Menu, X, ArrowRight, Sparkles } from 'lucide-react';
import { useMerch } from '../../context/MerchContext';
import { MERCH_PRODUCTS } from '../../data/merchProducts';

export const MerchNav: React.FC = () => {
  const { totalCartCount, wishlistCount, openCart } = useMerch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const isMerchActive = location.pathname.startsWith('/merch');

  // Group products by category for the dropdown
  const apparel = MERCH_PRODUCTS.filter((p) => p.category === 'APPAREL');
  const accessories = MERCH_PRODUCTS.filter((p) => p.category === 'ACCESSORIES');
  const collectibles = MERCH_PRODUCTS.filter((p) => p.category === 'COLLECTIBLES');
  const specialSeries = MERCH_PRODUCTS.filter((p) => p.category === 'SPECIAL SERIES');

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProductsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setProductsDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleProductClick = (productId: string) => {
    setProductsDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate(`/merch/${productId}`);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F8F3E9]/95 backdrop-blur-md border-b border-[#252321]/10 select-none transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left: Official Catalyst 7.0 Logo */}
        <Link
          to="/"
          className="flex items-center gap-3 group"
          title="Catalyst 7.0 — Return to Home"
        >
          <img
            src="/assets/catalyst_7_logo.png"
            alt="CATALYST 7.0"
            className="h-9 sm:h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/* Center: Main Website Nav Links matching Reference Design */}
        <nav className="hidden lg:flex items-center gap-7 xl:gap-9 font-['Montserrat',sans-serif] text-xs xl:text-sm tracking-[0.2em] uppercase font-bold text-[#252321]">
          <Link
            to="/"
            className="hover:text-[#C9362B] transition-colors"
          >
            HOME
          </Link>

          <a
            href="/#about"
            onClick={(e) => {
              if (location.pathname === '/') {
                e.preventDefault();
                document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="hover:text-[#C9362B] transition-colors"
          >
            ABOUT
          </a>

          <a
            href="/#gallery"
            onClick={(e) => {
              if (location.pathname === '/') {
                e.preventDefault();
                document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="hover:text-[#C9362B] transition-colors"
          >
            GALLERY
          </a>

          {/* ACTIVE MERCH TAB WITH RED UNDERLINE (Matching Reference Screenshot) */}
          <div
            ref={dropdownRef}
            className="relative"
            onMouseEnter={() => setProductsDropdownOpen(true)}
            onMouseLeave={() => setProductsDropdownOpen(false)}
          >
            <div className="relative py-2 cursor-pointer">
              <Link
                to="/merch"
                className="text-[#C9362B] flex items-center gap-1 font-extrabold tracking-[0.22em]"
              >
                <span>MERCH</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 text-[#C9362B] ${
                    productsDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </Link>
              {/* Solid Red Active Indicator Underline */}
              <span className="absolute -bottom-1 left-0 right-0 h-[2.5px] bg-[#C9362B] rounded-full" />
            </div>

            {/* MEGA DROPDOWN MENU */}
            {productsDropdownOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[760px] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="rounded-xl border border-[#E5DDD0] bg-[#FFFFFF] shadow-[0_20px_50px_rgba(37,35,33,0.12),0_0_30px_rgba(201,54,43,0.08)] p-6 overflow-hidden backdrop-blur-xl">
                  {/* Dropdown Header */}
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#252321]/10">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C9362B]" />
                      <span className="font-['Noto_Sans_JP',sans-serif] text-[10px] tracking-[0.25em] text-[#C9362B] uppercase font-bold">
                        CATALYST 7.0 · 公式商品 (OFFICIAL MERCH)
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-[#736B63]">
                      SELECT ITEM TO VIEW DETAILS
                    </span>
                  </div>

                  {/* 4 Category Columns with Direct Links */}
                  <div className="grid grid-cols-4 gap-4">
                    {/* Apparel */}
                    <div>
                      <h4 className="font-['Montserrat',sans-serif] text-[10px] font-bold tracking-[0.2em] text-[#C9362B] uppercase mb-2.5 pb-1 border-b border-[#252321]/10">
                        APPAREL ({apparel.length})
                      </h4>
                      <div className="space-y-1.5">
                        {apparel.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => handleProductClick(p.id)}
                            className="w-full text-left p-1.5 rounded hover:bg-[#F8F3E9] flex items-center gap-2.5 transition-colors group cursor-pointer"
                          >
                            <img
                              src={p.images[0]}
                              alt=""
                              className="w-8 h-8 object-contain rounded bg-[#F8F3E9] p-0.5 border border-[#E5DDD0] shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-['Montserrat',sans-serif] text-xs font-bold text-[#252321] group-hover:text-[#C9362B] tracking-wide truncate">
                                {p.name}
                              </p>
                              <p className="font-mono text-[9px] text-[#736B63] uppercase truncate">
                                {p.variant}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Accessories */}
                    <div>
                      <h4 className="font-['Montserrat',sans-serif] text-[10px] font-bold tracking-[0.2em] text-[#C9362B] uppercase mb-2.5 pb-1 border-b border-[#252321]/10">
                        ACCESSORIES ({accessories.length})
                      </h4>
                      <div className="space-y-1.5">
                        {accessories.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => handleProductClick(p.id)}
                            className="w-full text-left p-1.5 rounded hover:bg-[#F8F3E9] flex items-center gap-2.5 transition-colors group cursor-pointer"
                          >
                            <img
                              src={p.images[0]}
                              alt=""
                              className="w-8 h-8 object-contain rounded bg-[#F8F3E9] p-0.5 border border-[#E5DDD0] shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-['Montserrat',sans-serif] text-xs font-bold text-[#252321] group-hover:text-[#C9362B] tracking-wide truncate">
                                {p.name}
                              </p>
                              <p className="font-mono text-[9px] text-[#736B63] uppercase truncate">
                                {p.variant}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Collectibles */}
                    <div>
                      <h4 className="font-['Montserrat',sans-serif] text-[10px] font-bold tracking-[0.2em] text-[#C9362B] uppercase mb-2.5 pb-1 border-b border-[#252321]/10">
                        COLLECTIBLES ({collectibles.length})
                      </h4>
                      <div className="space-y-1.5">
                        {collectibles.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => handleProductClick(p.id)}
                            className="w-full text-left p-1.5 rounded hover:bg-[#F8F3E9] flex items-center gap-2.5 transition-colors group cursor-pointer"
                          >
                            <img
                              src={p.images[0]}
                              alt=""
                              className="w-8 h-8 object-contain rounded bg-[#F8F3E9] p-0.5 border border-[#E5DDD0] shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-['Montserrat',sans-serif] text-xs font-bold text-[#252321] group-hover:text-[#C9362B] tracking-wide truncate">
                                {p.name}
                              </p>
                              <p className="font-mono text-[9px] text-[#736B63] uppercase truncate">
                                {p.variant}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Special Series */}
                    <div>
                      <h4 className="font-['Montserrat',sans-serif] text-[10px] font-bold tracking-[0.2em] text-[#C9362B] uppercase mb-2.5 pb-1 border-b border-[#252321]/10">
                        SPECIAL SERIES ({specialSeries.length})
                      </h4>
                      <div className="space-y-1.5">
                        {specialSeries.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => handleProductClick(p.id)}
                            className="w-full text-left p-1.5 rounded hover:bg-[#F8F3E9] flex items-center gap-2.5 transition-colors group cursor-pointer"
                          >
                            <img
                              src={p.images[0]}
                              alt=""
                              className="w-8 h-8 object-contain rounded bg-[#F8F3E9] p-0.5 border border-[#E5DDD0] shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-['Montserrat',sans-serif] text-xs font-bold text-[#252321] group-hover:text-[#C9362B] tracking-wide truncate">
                                {p.name}
                              </p>
                              <p className="font-mono text-[9px] text-[#736B63] uppercase truncate">
                                {p.variant}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Dropdown Footer */}
                  <div className="mt-5 pt-3 border-t border-[#252321]/10 flex items-center justify-between">
                    <Link
                      to="/merch"
                      onClick={() => setProductsDropdownOpen(false)}
                      className="text-xs font-['Montserrat',sans-serif] font-bold text-[#C9362B] hover:text-[#252321] uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                    >
                      <span>EXPLORE FULL COLLECTION PAGE (10 PIECES)</span>
                      <ArrowRight size={13} />
                    </Link>

                    <Link
                      to="/merch/cart"
                      onClick={() => setProductsDropdownOpen(false)}
                      className="text-xs font-['Montserrat',sans-serif] text-[#736B63] hover:text-[#C9362B] uppercase tracking-widest transition-colors font-bold"
                    >
                      VIEW CLAIM BAG ({totalCartCount})
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          <a
            href="/#game"
            onClick={(e) => {
              if (location.pathname === '/') {
                e.preventDefault();
                document.getElementById('game')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="hover:text-[#C9362B] transition-colors"
          >
            GAME
          </a>

          <a
            href="/#contact"
            onClick={(e) => {
              if (location.pathname === '/') {
                e.preventDefault();
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="hover:text-[#C9362B] transition-colors whitespace-nowrap"
          >
            CONTACT US
          </a>
        </nav>

        {/* Right: Actions (Wishlist & CLAIM BAG button matching Reference Image) */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Wishlist Link with Badge */}
          <Link
            to="/merch/cart#wishlist"
            className="relative p-2.5 rounded-full border border-[#252321]/15 hover:border-[#C9362B]/50 text-[#252321] hover:text-[#C9362B] transition-all cursor-pointer"
            title="View Wishlist"
          >
            <Heart size={18} className={wishlistCount > 0 ? 'fill-[#C9362B] text-[#C9362B]' : ''} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-[#C9362B] text-white text-[10px] font-mono font-bold flex items-center justify-center px-1">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* CLAIM BAG Button (Outlined Red Pill Matching Reference Design) */}
          <button
            onClick={openCart}
            className="relative flex items-center gap-2.5 px-4 sm:px-6 py-2.5 rounded-xl border-2 border-[#C9362B] text-[#C9362B] hover:bg-[#C9362B] hover:text-white transition-all duration-300 shadow-sm cursor-pointer group font-bold tracking-wider"
          >
            <ShoppingBag size={17} className="transition-transform group-hover:scale-110" />
            <span className="font-['Montserrat',sans-serif] text-xs sm:text-sm tracking-wider uppercase font-extrabold hidden sm:inline-block">
              CLAIM BAG
            </span>
            {totalCartCount > 0 && (
              <span className="min-w-[20px] h-[20px] rounded-full bg-[#C9362B] text-white text-[10px] font-mono font-bold flex items-center justify-center px-1 group-hover:bg-white group-hover:text-[#C9362B]">
                {totalCartCount}
              </span>
            )}
          </button>

          {/* Mobile Hamburger Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg border border-[#252321]/20 text-[#252321] hover:text-[#C9362B] transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Out / Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#252321]/10 bg-[#F8F3E9] px-6 py-6 max-h-[80vh] overflow-y-auto space-y-5 animate-in slide-in-from-top-4 duration-200 shadow-xl">
          <nav className="flex flex-col space-y-3 font-['Montserrat',sans-serif] text-sm tracking-wider uppercase font-bold text-[#252321]">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#C9362B] transition-colors"
            >
              HOME
            </Link>

            <a
              href="/#about"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#C9362B] transition-colors"
            >
              ABOUT
            </a>

            <a
              href="/#gallery"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#C9362B] transition-colors"
            >
              GALLERY
            </a>

            <Link
              to="/merch"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-[#C9362B] font-extrabold flex items-center justify-between"
            >
              <span>MERCH</span>
              <span className="text-[10px] font-mono bg-[#C9362B]/10 px-2 py-0.5 rounded text-[#C9362B]">
                ACTIVE
              </span>
            </Link>

            {/* Mobile Direct Products Section */}
            <div className="pt-3 pb-3 border-y border-[#252321]/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[#C9362B] font-bold text-xs tracking-wider">
                  ALL PRODUCTS ({MERCH_PRODUCTS.length})
                </span>
                <Link
                  to="/merch"
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-['Montserrat',sans-serif] text-[10px] text-[#736B63] uppercase tracking-wider font-bold"
                >
                  View All →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {MERCH_PRODUCTS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleProductClick(p.id)}
                    className="flex items-center gap-3 p-2 rounded-lg bg-white border border-[#E5DDD0] text-left w-full cursor-pointer hover:border-[#C9362B]/60 shadow-xs"
                  >
                    <img
                      src={p.images[0]}
                      alt=""
                      className="w-10 h-10 object-contain rounded bg-[#F8F3E9] p-1 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-['Montserrat',sans-serif] text-xs font-bold text-[#252321] truncate">
                        {p.name}
                      </p>
                      <p className="font-mono text-[9px] text-[#C9362B] uppercase truncate">
                        {p.variant}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <a
              href="/#game"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#C9362B] transition-colors"
            >
              GAME
            </a>

            <a
              href="/#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#C9362B] transition-colors"
            >
              CONTACT US
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};
