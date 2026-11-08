import React, { useEffect, useRef } from 'react';
import { ShoppingBag } from 'lucide-react';
import { gsap } from 'gsap';
import { useMerch } from '../../context/MerchContext';

// ============================================================================
// Always-visible cart button for the merch pages.
// UX choices:
//  - fixed bottom-right: the thumb zone on phones, and always one tap/click away
//  - icon + count badge (+ "CART" label from tablet up), so the state of the cart is visible
//  - at least 48px tall for easy tapping
//  - the badge bounces when something is added, so adding feels acknowledged
//  - `raised` lifts it above the product page's sticky "Add to cart" bar; `hidden` removes it
//    while a full-screen viewer (the image lightbox) is open
//  - not shown on the cart page itself (you are already there)
// ============================================================================
export const MerchCartButton: React.FC<{ raised?: boolean; hidden?: boolean }> = ({ raised = false, hidden = false }) => {
  const { cartItems, openCart } = useMerch();
  const count = cartItems.reduce((n, item) => n + item.quantity, 0);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const previous = useRef(count);

  useEffect(() => {
    if (count > previous.current && badgeRef.current && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.fromTo(badgeRef.current, { scale: 1.9 }, { scale: 1, duration: 0.7, ease: 'elastic.out(1, 0.45)' });
    }
    previous.current = count;
  }, [count]);

  if (hidden) return null;

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={count > 0 ? `Open cart, ${count} ${count === 1 ? 'item' : 'items'}` : 'Open cart, empty'}
      className={`group fixed right-4 z-[60] flex h-14 min-w-14 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#C9362B] px-4 text-white shadow-[0_10px_30px_rgba(201,54,43,0.4)] ring-2 ring-[#F8F3E9] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#9E171C] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9362B] sm:right-6 sm:h-12 sm:px-5 ${
        raised ? 'bottom-24' : 'bottom-5'
      } sm:bottom-6`}
      style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <ShoppingBag size={20} aria-hidden="true" className="transition-transform duration-300 group-hover:-rotate-6" />
      <span className="hidden font-['Montserrat',sans-serif] text-[11px] font-bold uppercase tracking-[0.22em] sm:inline">Cart</span>

      {count > 0 && (
        <span
          ref={badgeRef}
          aria-hidden="true"
          className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-[#F8F3E9] bg-[#F6C768] px-1 font-['Montserrat',sans-serif] text-[11px] font-bold leading-none text-[#252321]"
        >
          {count > 99 ? '99+' : count}
        </span>
      )}

      {/* announces changes to screen readers */}
      <span role="status" className="sr-only">
        {count} {count === 1 ? 'item' : 'items'} in cart
      </span>
    </button>
  );
};

export default MerchCartButton;
