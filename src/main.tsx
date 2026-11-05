import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import AboutPage from './pages/AboutPage.tsx';
import GalleryPage from './pages/GalleryPage.tsx';
import MerchPage from './pages/MerchPage.tsx';
import ProductDetailPage from './pages/ProductDetailPage.tsx';
import CartPage from './pages/CartPage.tsx';
import GameComingSoonPage from './pages/GameComingSoonPage.tsx';
import OcPosterPage from './pages/OcPosterPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import { MerchProvider } from './context/MerchContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <MerchProvider>
      <Routes>
        <Route path="/" element={<App />} />
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
        <Route path="*" element={<App />} />
      </Routes>
    </MerchProvider>
  </BrowserRouter>
);
