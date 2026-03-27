import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// Disable browser's automatic scroll restoration
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

// Initialize Web Vitals monitoring in production (deferred to not block LCP)
if (import.meta.env.PROD) {
  window.addEventListener('load', () => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        import('./utils/webVitals').then(({ webVitalsMonitor }) => {
          if (webVitalsMonitor) webVitalsMonitor();
        });
      }, { timeout: 5000 });
    }
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));

// StrictMode causes double-renders in dev (fine), but we skip it in prod for mobile perf
const AppTree = (
  <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
    <App />
  </BrowserRouter>
);

root.render(
  import.meta.env.DEV ? <StrictMode>{AppTree}</StrictMode> : AppTree
);
