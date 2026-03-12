import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// Disable browser's automatic scroll restoration
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

// Initialize Web Vitals monitoring in production
if (import.meta.env.PROD) {
  // Defer non-critical initialization
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      import('./utils/webVitals').then(({ webVitalsMonitor: _webVitalsMonitor }) => {
        // Web Vitals monitoring initialized
      });
    }, { timeout: 2000 });
  }
}

// Use concurrent features for better performance
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
