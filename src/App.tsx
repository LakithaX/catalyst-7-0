import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import GlobalLoader from './components/GlobalLoader';
const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const OcPosterPage = lazy(() => import('./pages/OcPosterPage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const MerchPage = lazy(() => import('./pages/MerchPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const GameComingSoonPage = lazy(() => import('./pages/GameComingSoonPage'));

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
    let fallbackTimer: ReturnType<typeof setTimeout> | undefined;
    const removeImageListeners: Array<() => void> = [];
    setIsLoading(true);
    // Wait for the new route's DOM to mount
    const tick = setTimeout(() => {
      const images = Array.from(document.images).filter(img => img.loading !== 'lazy');

      const imagePromises = images.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise<void>((resolve) => {
          let settled = false;
          const finish = () => {
            if (settled) return;
            settled = true;
            img.removeEventListener('load', finish);
            img.removeEventListener('error', finish);
            resolve();
          };
          img.addEventListener('load', finish);
          img.addEventListener('error', finish);
          removeImageListeners.push(() => {
            img.removeEventListener('load', finish);
            img.removeEventListener('error', finish);
          });
          // The image may have completed between the first check and listener setup.
          if (img.complete) finish();
        });
      });

      // Keep the transition visible briefly, but never block a route on a stalled asset.
      Promise.all([
        Promise.race([
          Promise.all(imagePromises),
          new Promise<void>(resolve => {
            fallbackTimer = setTimeout(resolve, 4000);
          }),
        ]),
        new Promise(resolve => setTimeout(resolve, 800)),
      ]).then(() => {
        removeImageListeners.forEach(remove => remove());
        if (fallbackTimer) clearTimeout(fallbackTimer);
        if (!cancelled) setIsLoading(false);
      });
    }, 50);

    return () => {
      cancelled = true;
      clearTimeout(tick);
      if (fallbackTimer) clearTimeout(fallbackTimer);
      removeImageListeners.forEach(remove => remove());
    };
  }, [location.pathname]);

  return (
    <>
      <AnimatePresence>
        {isLoading && <GlobalLoader />}
      </AnimatePresence>
      <Suspense fallback={<GlobalLoader />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/registration" element={<RegisterPage />} />
        <Route path="/oc" element={<OcPosterPage />} />
        <Route path="/about/oc" element={<OcPosterPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/merch" element={<MerchPage />} />
        <Route path="/merch/:productId" element={<ProductDetailPage />} />
        <Route path="/merch/cart" element={<CartPage />} />
        <Route path="/game" element={<GameComingSoonPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
      </Suspense>
    </>
  );
}
