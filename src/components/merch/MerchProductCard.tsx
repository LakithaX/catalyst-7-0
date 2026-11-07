import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowUpRight, Sparkles } from 'lucide-react';
import { MerchProduct } from '../../data/merchProducts';
import { useMerch } from '../../context/MerchContext';

interface MerchProductCardProps {
  product: MerchProduct;
}

export const MerchProductCard: React.FC<MerchProductCardProps> = ({ product }) => {
  const { isWishlisted, toggleWishlist } = useMerch();
  const wishlisted = isWishlisted(product.id);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const hasMultipleImages = product.images.length > 1;

  return (
    <Link
      to={`/merch/${product.id}`}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#E5DDD0] bg-white transition-all duration-500 hover:-translate-y-2 hover:border-[#C9362B]/60 shadow-[0_6px_24px_rgba(37,35,33,0.06)] hover:shadow-[0_20px_45px_rgba(201,54,43,0.18)]"
    >
      {/* ── Visual Frame ── */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-gradient-to-b from-[#FAF8F4] via-[#F6F0E6] to-[#ECE3D4] p-6 flex flex-col justify-between">
        {/* Subtle Warm Spotlight */}
        <div
          className="pointer-events-none absolute inset-0 opacity-60 group-hover:opacity-90 transition-opacity duration-500"
          style={{
            background: 'radial-gradient(circle at 50% 40%, rgba(201, 54, 43, 0.08) 0%, rgba(248, 243, 233, 0.4) 65%, transparent 100%)',
          }}
          aria-hidden="true"
        />

        {/* Top Header inside Image Card: Category Tag & Wishlist */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="inline-block px-2.5 py-1 rounded-md border border-[#C9362B]/30 bg-white/90 backdrop-blur-xs font-['Montserrat',sans-serif] text-[9.5px] tracking-[0.2em] font-bold text-[#C9362B] uppercase shadow-2xs">
            {product.category}
          </span>

          <button
            onClick={handleWishlistClick}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            className="p-2 rounded-full bg-white/90 border border-[#252321]/15 hover:border-[#C9362B]/60 text-[#252321] hover:text-[#C9362B] transition-all cursor-pointer backdrop-blur-xs shadow-2xs"
          >
            <Heart
              size={15}
              className={`transition-colors ${
                wishlisted ? 'fill-[#C9362B] text-[#C9362B]' : 'text-[#252321]/70'
              }`}
            />
          </button>
        </div>

        {/* Product Cutout Image (Contained & Centered with 3D drop-shadow) */}
        <div className="relative z-0 w-full h-[68%] flex items-center justify-center my-auto">
          <img
            src={product.images[0]}
            alt={`${product.name} - ${product.variant}`}
            loading="lazy"
            decoding="async"
            className="max-w-full max-h-full object-contain filter drop-shadow-[0_14px_22px_rgba(0,0,0,0.22)] transition-transform duration-700 ease-out group-hover:scale-108"
          />

          {hasMultipleImages && (
            <span className="absolute bottom-1 right-1 px-2 py-0.5 rounded-md bg-white/90 border border-[#E5DDD0] text-[9px] font-mono text-[#C9362B] font-bold tracking-wider shadow-2xs">
              {product.images.length} VIEWS
            </span>
          )}
        </div>

        {/* Status indicator bar */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 border-t border-[#252321]/10 pt-2.5">
          <span className="text-[9.5px] font-['Montserrat',sans-serif] tracking-[0.2em] text-[#736B63] uppercase font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9362B]" />
            {product.claimStatus}
          </span>

          <span className="text-[10px] font-['Montserrat',sans-serif] font-bold text-[#C9362B] tracking-widest uppercase flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
            VIEW <ArrowUpRight size={12} />
          </span>
        </div>
      </div>

      {/* ── Metadata Info Bar ── */}
      <div className="p-5 border-t border-[#E5DDD0] bg-white flex flex-col justify-between flex-grow">
        <div>
          <div className="flex items-start justify-between gap-3 mb-1">
            <h3 className="font-serif text-2xl font-bold uppercase tracking-tight text-[#252321] group-hover:text-[#C9362B] transition-colors leading-tight">
              {product.name}
            </h3>
            <span className="font-['Bison',sans-serif] text-xl sm:text-2xl font-black text-[#C9362B] tracking-wider whitespace-nowrap">
              {product.priceDisplay}
            </span>
          </div>
          <p className="font-mono text-xs text-[#736B63] uppercase tracking-wider mb-2 font-medium">
            {product.variant}
          </p>
        </div>

        <div className="pt-3 border-t border-[#252321]/10 flex flex-wrap items-center justify-between gap-2 text-[11px] font-['Montserrat',sans-serif]">
          <span className="text-[#736B63] tracking-wider uppercase font-semibold">
            {product.options?.sizes ? `SIZES: ${product.options.sizes.join(' · ')}` : 'STANDARD FIT'}
          </span>

          <span className="text-[#C9362B] tracking-widest uppercase font-bold flex items-center gap-1">
            <Sparkles size={11} className="text-[#C9362B]" />
            CATALYST 7.0
          </span>
        </div>
      </div>
    </Link>
  );
};
