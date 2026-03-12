/**
 * Lightweight Analytics utility
 * Only loads when explicitly enabled
 */

// Initialize analytics - deferred loading
export const initAnalytics = () => {
  if (import.meta.env.VITE_ENABLE_ANALYTICS !== 'true') {
    return;
  }

  // Defer analytics loading to not block initial render
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => loadAnalytics(), { timeout: 5000 });
  } else {
    setTimeout(loadAnalytics, 3000);
  }
};

const loadAnalytics = () => {
  // Google Analytics - only if ID provided
  if (import.meta.env.VITE_GA_MEASUREMENT_ID) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID, {
      send_page_view: false,
    });
  }
};

// Track page view
export const trackPageView = (path, title) => {
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title,
    });
  }
};

// Track custom event
export const trackEvent = (eventName, eventParams = {}) => {
  if (window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
};

// E-commerce tracking
export const trackPurchase = (orderId, value, items) => {
  if (window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: orderId,
      value: value,
      currency: 'INR',
      items: items,
    });
  }
};

export const trackAddToCart = (item) => {
  trackEvent('add_to_cart', {
    item_id: item.id,
    item_name: item.name,
    price: item.price,
  });
};

export const trackBeginCheckout = (value, items) => {
  trackEvent('begin_checkout', {
    value: value,
    currency: 'INR',
    items: items,
  });
};

export default {
  initAnalytics,
  trackPageView,
  trackEvent,
  trackPurchase,
  trackAddToCart,
  trackBeginCheckout,
};
