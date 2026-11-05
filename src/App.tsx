import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import GlobalLoader from './components/GlobalLoader';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import RegisterPage from './pages/RegisterPage';
import OcPosterPage from './pages/OcPosterPage';
import GalleryPage from './pages/GalleryPage';
import MerchPage from './pages/MerchPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import GameComingSoonPage from './pages/GameComingSoonPage';

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsLoading(true);
    // Wait for the new route's DOM to mount
    const tick = setTimeout(() => {
      const images = Array.from(document.images);
      
      const imagePromises = images.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve; // Resolve on error so the page doesn't hang
        });
      });

      // Wait for all images, plus a minimum 800ms display time so the loader doesn't flash jarringly
      Promise.all([
        Promise.all(imagePromises),
        new Promise(resolve => setTimeout(resolve, 800))
      ]).then(() => {
        setIsLoading(false);
      });
    }, 50);

    return () => clearTimeout(tick);
  }, [location.pathname]);

  return (
    <>
      <AnimatePresence>
        {isLoading && <GlobalLoader />}
      </AnimatePresence>
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
    </>
  );
}
