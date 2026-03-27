import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook to track page views automatically
 * Add this to your App.jsx or main layout component
 */
export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page view on route change dynamically so it won't inflate main bundle
    import('../utils/analytics').then(({ trackPageView }) => {
      trackPageView(location.pathname + location.search, document.title);
    }).catch(err => console.error("Failed to load analytics:", err));
  }, [location]);
};

export default usePageTracking;
