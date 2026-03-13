import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './hooks/useAuth';
import App from './App';
import SundayApp from './SundayApp';
import './index.css';

const isSunday = window.location.pathname.startsWith('/sunday');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      {isSunday ? <SundayApp /> : <App />}
    </AuthProvider>
  </StrictMode>,
);
