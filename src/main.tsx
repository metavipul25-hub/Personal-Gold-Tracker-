import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { App } from './App.tsx';
import { AuthWrapper } from './components/AuthWrapper';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
    <AuthWrapper>
      <App />
    </AuthWrapper>
    </ErrorBoundary>
  </StrictMode>,
);
