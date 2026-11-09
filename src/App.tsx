import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import GlobalLoader from './components/GlobalLoader';
import { BackgroundMusic } from './components/BackgroundMusic';
import Layout from './components/Layout';
import { initBoot } from './utils/navState';
const HomePage = lazy(() => import('./pages/HomePage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ConferenceTeamPage = lazy(() => import('./pages/ConferenceTeamPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const MerchPage = lazy(() => import('./pages/MerchPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const GameComingSoonPage = lazy(() => import('./pages/GameComingSoonPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));

initBoot();

// Runs as soon as this file loads, before the browser can restore an old scroll position on refresh.
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
    let fallbackTimer: ReturnType<typeof setTimeout> | undefined;
    const removeImageListeners: Array<() => void> = [];
    setIsLoading(true);
    // Every route change and every refresh starts at the top of the page.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });

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
        if (!cancelled) {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
          setIsLoading(false);
        }
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
      <BackgroundMusic />
      <AnimatePresence>
        {isLoading && <GlobalLoader />}
      </AnimatePresence>
      <Suspense fallback={<GlobalLoader />}>
      <Routes>
        {/* GROUP A: No layout, footer comes from HomePage itself */}
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/" element={<HomePage />} />

        {/* GROUP B: No layout, no footer at all */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/registration" element={<RegisterPage />} />

        {/* GROUP C: Wrapped in Layout to get the site OutroFooter */}
        <Route element={<Layout />}>
          <Route path="/about" element={<AboutPage />} />
          <Route path="/conference-team" element={<ConferenceTeamPage />} />
          <Route path="/team" element={<ConferenceTeamPage />} />
          <Route path="/about/team" element={<ConferenceTeamPage />} />
          <Route path="/oc" element={<Navigate to="/team" replace />} />
          <Route path="/about/oc" element={<Navigate to="/team" replace />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/merch" element={<MerchPage />} />
          <Route path="/merch/cart" element={<CartPage />} />
          <Route path="/merch/:productId" element={<ProductDetailPage />} />
          <Route path="/game" element={<GameComingSoonPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        {/* GROUP A (catch-all): Last route in the list */}
        <Route path="*" element={<HomePage />} />
      </Routes>
      </Suspense>
    </>
  );
}
