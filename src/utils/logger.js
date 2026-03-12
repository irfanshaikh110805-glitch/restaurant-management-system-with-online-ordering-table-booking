/**
 * Production-safe logging utility
 * Wraps console methods to only log in development
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  
  error: (...args) => {
    // Always log errors, but in production send to monitoring service
    console.error(...args);
    
    if (!isDevelopment) {
      // TODO: Send to error monitoring service (Sentry, LogRocket, etc.)
      // Example: Sentry.captureException(args[0]);
    }
  },
  
  info: (...args) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  
  debug: (...args) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  }
};

export default logger;
