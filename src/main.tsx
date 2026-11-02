import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import MerchPage from './pages/MerchPage.tsx';
import ProductDetailPage from './pages/ProductDetailPage.tsx';
import CartPage from './pages/CartPage.tsx';
import { MerchProvider } from './context/MerchContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <MerchProvider>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/merch" element={<MerchPage />} />
        <Route path="/merch/:productId" element={<ProductDetailPage />} />
        <Route path="/merch/cart" element={<CartPage />} />
        <Route path="*" element={<App />} />
      </Routes>
    </MerchProvider>
  </BrowserRouter>
);
