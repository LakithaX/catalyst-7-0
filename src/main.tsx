import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CatalogProvider } from './context/CatalogContext';
import App from './App.tsx';
import { MerchProvider } from './context/MerchContext.tsx';
// Fonts every route needs (see docs/fonts.md). Page-specific fonts are imported by the pages that use them.
// Zen Kaku Gothic New is the body font: body text asks for 400 but has always rendered at 500, so keep 500.
import '@fontsource/zen-kaku-gothic-new/500.css';
import '@fontsource/zen-kaku-gothic-new/700.css';
// Montserrat 600/700: Navbar, GlobalLoader and BackgroundMusic.
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <CatalogProvider><MerchProvider>
      <App />
    </MerchProvider></CatalogProvider>
  </BrowserRouter>
);