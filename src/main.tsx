import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { MerchProvider } from './context/MerchContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <MerchProvider>
      <App />
    </MerchProvider>
  </BrowserRouter>
);
