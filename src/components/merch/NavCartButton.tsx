import React, { useEffect, useRef } from 'react';
import { ShoppingBag } from 'lucide-react';
import { gsap } from 'gsap';
import { useMerch } from '../../context/MerchContext';

// ============================================================================
// Small cart icon for a navigation bar / header row (icon + count badge).
//  - opens the cart drawer
//  - badge bounces when the count goes up
//  - 44px tap target, hover colour matches the nav links
//  - if there is no MerchProvider above it, it renders nothing, so it is safe to drop into a
//    navbar that is shown on pages outside the merch section
// To put it in the main navbar, add:   <NavCartButton />   next to the CONTACT link.
// ============================================================================
export const NavCartButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  let merch: ReturnType<typeof useMerch> | null = null;
  try {
    merch = useMerch();
  } catch {
    merch = null;
  }

  const count = merch ? merch.cartItems.reduce((n, item) => n + item.quantity, 0) : 0;
  const badgeRef = useRef<HTMLSpanElement>(null);
  const previous = useRef(count);

  useEffect(() => {
    if (count > previous.current && badgeRef.current && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.fromTo(badgeRef.current, { scale: 1.9 }, { scale: 1, duration: 0.7, ease: 'elastic.out(1, 0.45)' });
    }
    previous.current = count;
  }, [count]);

  if (!merch) return null;

  return (
    <button
      type="button"
      onClick={merch.openCart}
      aria-label={count > 0 ? `Open cart, ${count} ${count === 1 ? 'item' : 'items'}` : 'Open cart, empty'}
      className={`relative inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#252321] transition-colors hover:bg-[#C9362B]/10 hover:text-[#C9362B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9362B] ${className}`}
    >
      <ShoppingBag size={22} aria-hidden="true" />
      {count > 0 && (
        <span
          ref={badgeRef}
          aria-hidden="true"
          className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#C9362B] px-1 font-['Montserrat',sans-serif] text-[10px] font-bold leading-none text-white"
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
      <span role="status" className="sr-only">
        {count} {count === 1 ? 'item' : 'items'} in cart
      </span>
    </button>
  );
};

export default NavCartButton;
