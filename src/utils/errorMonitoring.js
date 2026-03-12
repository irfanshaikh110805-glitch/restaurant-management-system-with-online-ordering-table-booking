/**
 * Error Monitoring and Logging
 * Integrates with Sentry or custom error tracking
 */

// Initialize error monitoring
export function initErrorMonitoring() {
  if (import.meta.env.VITE_SENTRY_DSN && import.meta.env.PROD) {
    // Sentry initialization (install @sentry/react first)
    // import * as Sentry from "@sentry/react";
    // Sentry.init({
    //   dsn: import.meta.env.VITE_SENTRY_DSN,
    //   environment: import.meta.env.MODE,
    //   tracesSampleRate: 1.0,
    // });
    console.log('📊 Error monitoring initialized');
  } else {
    console.log('📊 Error monitoring disabled (development mode)');
  }
}

// Log error to monitoring service
export function logError(error, errorInfo = {}) {
  // Filter out network errors in development
  if (!import.meta.env.PROD) {
    const networkErrors = [
      'ERR_INTERNET_DISCONNECTED',
      'ERR_NETWORK_CHANGED', 
      'ERR_CONNECTION_TIMED_OUT',
      'Failed to fetch',
      'NetworkError'
    ];
    
    const isNetworkError = networkErrors.some(errType => 
      error?.message?.includes(errType) || error?.toString()?.includes(errType)
    );
    
    if (isNetworkError) {
      // Silently skip network errors in dev
      return;
    }
  }

  console.error('Error logged:', error, errorInfo);

  // Send to Sentry
  if (window.Sentry) {
    window.Sentry.captureException(error, {
      extra: errorInfo
    });
  }

  // Send to custom endpoint
  if (import.meta.env.VITE_ERROR_ENDPOINT) {
    fetch(import.meta.env.VITE_ERROR_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        },
        errorInfo,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      })
    }).catch(err => console.error('Failed to send error:', err));
  }
}

// Log warning
export function logWarning(message, context = {}) {
  console.warn('Warning:', message, context);

  if (window.Sentry) {
    window.Sentry.captureMessage(message, {
      level: 'warning',
      extra: context
    });
  }
}

// Log info
export function logInfo(message, context = {}) {
  console.info('Info:', message, context);

  if (window.Sentry) {
    window.Sentry.captureMessage(message, {
      level: 'info',
      extra: context
    });
  }
}

// Set user context for error tracking
export function setUserContext(user) {
  if (window.Sentry && user) {
    window.Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.full_name
    });
  }
}

// Clear user context
export function clearUserContext() {
  if (window.Sentry) {
    window.Sentry.setUser(null);
  }
}

// Add breadcrumb for debugging
export function addBreadcrumb(message, category = 'custom', data = {}) {
  if (window.Sentry) {
    window.Sentry.addBreadcrumb({
      message,
      category,
      data,
      level: 'info'
    });
  }
}

// Performance monitoring
export function measurePerformance(name, callback) {
  const startTime = performance.now();
  
  try {
    const result = callback();
    
    // If callback returns a promise
    if (result instanceof Promise) {
      return result.finally(() => {
        const duration = performance.now() - startTime;
        logPerformance(name, duration);
      });
    }
    
    const duration = performance.now() - startTime;
    logPerformance(name, duration);
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    logPerformance(name, duration, error);
    throw error;
  }
}

function logPerformance(name, duration, error = null) {
  console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);

  if (window.Sentry) {
    window.Sentry.addBreadcrumb({
      category: 'performance',
      message: `${name} took ${duration.toFixed(2)}ms`,
      level: error ? 'error' : 'info',
      data: { duration, error: error?.message }
    });
  }
}

// Global error handler
export function setupGlobalErrorHandlers() {
  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logError(new Error(`Unhandled Promise Rejection: ${event.reason}`), {
      promise: event.promise,
      reason: event.reason
    });
  });

  // Global errors
  window.addEventListener('error', (event) => {
    logError(event.error || new Error(event.message), {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  // Console error override (optional)
  const originalConsoleError = console.error;
  console.error = (...args) => {
    // Filter network errors in development
    if (!import.meta.env.PROD) {
      const errorStr = args.join(' ');
      const networkErrors = [
        'ERR_INTERNET_DISCONNECTED',
        'ERR_NETWORK_CHANGED',
        'ERR_CONNECTION_TIMED_OUT',
        'Failed to fetch',
        'NetworkError'
      ];
      
      if (networkErrors.some(err => errorStr.includes(err))) {
        return; // Skip logging network errors in dev
      }
    }
    
    originalConsoleError.apply(console, args);
    
    // Log to monitoring service
    if (args[0] instanceof Error) {
      logError(args[0], { additionalInfo: args.slice(1) });
    }
  };
}

export default {
  initErrorMonitoring,
  logError,
  logWarning,
  logInfo,
  setUserContext,
  clearUserContext,
  addBreadcrumb,
  measurePerformance,
  setupGlobalErrorHandlers
};
