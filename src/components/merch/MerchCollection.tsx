import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MERCH_PRODUCTS, CATEGORIES, ProductCategory } from '../../data/merchProducts';
import { MerchProductCard } from './MerchProductCard';

export const MerchCollection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('ALL');

  const filteredProducts = selectedCategory === 'ALL'
    ? MERCH_PRODUCTS
    : MERCH_PRODUCTS.filter((p) => p.category === selectedCategory);

  return (
    <section id="collection" className="relative w-full bg-[#F8F3E9] py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-[#252321]/10">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-[#C9362B]/30 bg-[#C9362B]/5 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9362B]" />
            <span className="font-['Noto_Sans_JP',sans-serif] text-[10px] tracking-[0.25em] text-[#C9362B] uppercase font-bold">
              CATALYST 7.0 · 全商品一覧 (FULL COLLECTION)
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9362B]" />
          </div>

          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-extrabold uppercase tracking-tight text-[#252321] mb-3">
            THE COLLECTION
          </h2>

          <div className="flex items-center justify-center gap-3 my-4">
            <span className="h-[1.5px] w-12 bg-gradient-to-r from-transparent to-[#C9362B]" />
            <span className="w-2 h-2 rotate-45 bg-[#C9362B]" />
            <span className="h-[1.5px] w-12 bg-gradient-to-l from-transparent to-[#C9362B]" />
          </div>

          <p className="font-sans text-sm sm:text-base text-[#4A4540] leading-relaxed">
            A collection inspired by identity, community and the spirit of Catalyst.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-3 mb-10 sm:mb-14">
          {CATEGORIES.map((cat) => {
            const count = cat === 'ALL'
              ? MERCH_PRODUCTS.length
              : MERCH_PRODUCTS.filter((p) => p.category === cat).length;

            const isActive = selectedCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`relative px-4 sm:px-6 py-2.5 rounded-xl text-xs font-['Montserrat',sans-serif] font-bold tracking-[0.2em] uppercase transition-all duration-300 cursor-pointer shadow-xs ${
                  isActive
                    ? 'bg-[#B51E23] text-white shadow-[0_4px_18px_rgba(181,30,35,0.35)]'
                    : 'bg-white text-[#252321] hover:text-[#C9362B] border border-[#E5DDD0] hover:border-[#C9362B]/50'
                }`}
              >
                <span>{cat}</span>
                <span className={`ml-2 text-[10px] font-mono font-bold ${isActive ? 'text-white/80' : 'text-[#736B63]'}`}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Product Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 sm:gap-8"
        >
          <AnimatePresence>
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <MerchProductCard product={product} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};
