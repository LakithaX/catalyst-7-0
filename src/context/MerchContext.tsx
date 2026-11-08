import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MerchProduct } from '../data/merchProducts';

import { useCatalog } from './CatalogContext';

export interface CartItem {
  cartId: string;
  productId: string;
  name: string;
  variant: string;
  category: string;
  image: string;
  size?: string;
  quantity: number;
  claimStatus: string;
  priceLkr?: number;
  priceDisplay?: string;
}

interface MerchContextType {
  cartItems: CartItem[];
  addToCart: (product: MerchProduct, size?: string, quantity?: number) => void;
  removeFromCart: (cartId: string) => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  clearCart: () => void;
  totalCartCount: number;

  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  wishlistCount: number;

  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;

  isClaimModalOpen: boolean;
  setIsClaimModalOpen: (open: boolean) => void;
  openClaimModal: () => void;
  closeClaimModal: () => void;

  toast: { message: string; visible: boolean } | null;
  showToast: (message: string) => void;
}

const MerchContext = createContext<MerchContextType | undefined>(undefined);

const STORAGE_KEY_CART = 'catalyst7_merch_cart';
const STORAGE_KEY_WISHLIST = 'catalyst7_merch_wishlist';

export const MerchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {products} = useCatalog();
  // Load initial cart from localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Load initial wishlist from localStorage
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WISHLIST);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; visible: boolean } | null>(null);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CART, JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cartItems]);

  // Sync wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_WISHLIST, JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to save wishlist to localStorage', e);
    }
  }, [wishlist]);

  const showToast = useCallback((message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => {
      setToast((prev) => (prev ? { ...prev, visible: false } : null));
    }, 2800);
  }, []);

  const addToCart = useCallback(
    (product: MerchProduct, size?: string, quantity: number = 1) => {
      const cartId = size ? `${product.id}-${size}` : `${product.id}-default`;

      setCartItems((prev) => {
        const existingIndex = prev.findIndex((item) => item.cartId === cartId);
        if (existingIndex > -1) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + quantity,
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              cartId,
              productId: product.id,
              name: product.name,
              variant: product.variant,
              category: product.category,
              image: product.images[0],
              size,
              quantity,
              claimStatus: product.claimStatus,
              priceLkr: product.priceLkr,
              priceDisplay: product.priceDisplay,
            },
          ];
        }
      });

      showToast(`Added ${product.name} (${product.variant}) to your claim list`);
    },
    [showToast, products]
  );

  const removeFromCart = useCallback(
    (cartId: string) => {
      setCartItems((prev) => prev.filter((item) => item.cartId !== cartId));
      showToast('Item removed from claim list');
    },
    [showToast, products]
  );

  const updateQuantity = useCallback((cartId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((prev) => prev.filter((item) => item.cartId !== cartId));
    } else {
      setCartItems((prev) =>
        prev.map((item) => (item.cartId === cartId ? { ...item, quantity } : item))
      );
    }
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const toggleWishlist = useCallback(
    (productId: string) => {
      const product = products.find(p => p.id === productId);
      const name = product ? product.name : 'Item';

      setWishlist((prev) => {
        const exists = prev.includes(productId);
        if (exists) {
          showToast(`Removed ${name} from your wishlist`);
          return prev.filter((id) => id !== productId);
        } else {
          showToast(`Saved ${name} to your wishlist`);
          return [...prev, productId];
        }
      });
    },
    [showToast, products]
  );

  const isWishlisted = useCallback(
    (productId: string) => wishlist.includes(productId),
    [wishlist]
  );

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlist.length;

  return (
    <MerchContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalCartCount,
        wishlist,
        toggleWishlist,
        isWishlisted,
        wishlistCount,
        isCartOpen,
        setIsCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        isClaimModalOpen,
        setIsClaimModalOpen,
        openClaimModal: () => setIsClaimModalOpen(true),
        closeClaimModal: () => setIsClaimModalOpen(false),
        toast,
        showToast,
      }}
    >
      {children}
    </MerchContext.Provider>
  );
};

export function useMerch() {
  const context = useContext(MerchContext);
  if (!context) {
    throw new Error('useMerch must be used within a MerchProvider');
  }
  return context;
}
