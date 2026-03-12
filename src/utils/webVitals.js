 
/**
 * Web Vitals Monitoring
 * Tracks Core Web Vitals and sends to analytics
 */

import { onCLS, onFID, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';

// Thresholds for Core Web Vitals
const THRESHOLDS = {
  CLS: { good: 0.1, needsImprovement: 0.25 },
  FID: { good: 100, needsImprovement: 300 },
  FCP: { good: 1800, needsImprovement: 3000 },
  LCP: { good: 2500, needsImprovement: 4000 },
  TTFB: { good: 800, needsImprovement: 1800 },
  INP: { good: 200, needsImprovement: 500 }
};

/**
 * Get rating based on value and thresholds
 */
function getRating(metric, value) {
  const threshold = THRESHOLDS[metric];
  if (!threshold) return 'unknown';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
}

/**
 * Send metric to analytics
 */
function sendToAnalytics({ name, value, rating, delta, id }) {
  // Send to Google Analytics if available
  if (window.gtag) {
    window.gtag('event', name, {
      event_category: 'Web Vitals',
      event_label: id,
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      metric_rating: rating,
      metric_delta: Math.round(name === 'CLS' ? delta * 1000 : delta),
      non_interaction: true
    });
  }

  // Log to console in development
  if (import.meta.env.DEV) {
    console.log(`📊 ${name}:`, {
      value: Math.round(value),
      rating,
      delta: Math.round(delta)
    });
  }

  // Send to custom analytics endpoint if needed
  if (import.meta.env.VITE_ANALYTICS_ENDPOINT) {
    fetch(import.meta.env.VITE_ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metric: name,
        value,
        rating,
        delta,
        id,
        url: window.location.href,
        timestamp: Date.now()
      }),
      keepalive: true
    }).catch(() => {
      // Silently fail
    });
  }
}

/**
 * Handle metric with custom rating
 */
function handleMetric(metric) {
  const rating = getRating(metric.name, metric.value);
  sendToAnalytics({ ...metric, rating });
}

/**
 * Initialize Web Vitals monitoring
 */
export function webVitalsMonitor() {
  try {
    // Core Web Vitals
    onCLS(handleMetric);
    onFID(handleMetric);
    onLCP(handleMetric);
    
    // Additional metrics
    onFCP(handleMetric);
    onTTFB(handleMetric);
    onINP(handleMetric);

    // Log initialization
    if (import.meta.env.DEV) {
      console.log('📊 Web Vitals monitoring initialized');
    }
  } catch (error) {
    console.error('Failed to initialize Web Vitals:', error);
  }
}

/**
 * Get current Web Vitals snapshot
 */
export async function getWebVitalsSnapshot() {
  return new Promise((resolve) => {
    const metrics = {};
    let count = 0;
    const total = 6;

    const checkComplete = () => {
      count++;
      if (count === total) {
        resolve(metrics);
      }
    };

    onCLS((metric) => {
      metrics.CLS = { value: metric.value, rating: getRating('CLS', metric.value) };
      checkComplete();
    });

    onFID((metric) => {
      metrics.FID = { value: metric.value, rating: getRating('FID', metric.value) };
      checkComplete();
    });

    onFCP((metric) => {
      metrics.FCP = { value: metric.value, rating: getRating('FCP', metric.value) };
      checkComplete();
    });

    onLCP((metric) => {
      metrics.LCP = { value: metric.value, rating: getRating('LCP', metric.value) };
      checkComplete();
    });

    onTTFB((metric) => {
      metrics.TTFB = { value: metric.value, rating: getRating('TTFB', metric.value) };
      checkComplete();
    });

    onINP((metric) => {
      metrics.INP = { value: metric.value, rating: getRating('INP', metric.value) };
      checkComplete();
    });

    // Timeout after 10 seconds
    setTimeout(() => resolve(metrics), 10000);
  });
}

/**
 * Report Web Vitals to console (for debugging)
 */
export function reportWebVitals() {
  getWebVitalsSnapshot().then((metrics) => {
    console.table(metrics);
  });
}

export default webVitalsMonitor;
