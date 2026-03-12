 
/**
 * Rate Limiting Utility
 * Implements IP-based and user-based rate limiting following OWASP best practices
 * 
 * Features:
 * - Sliding window rate limiting
 * - Per-endpoint configuration
 * - IP and user-based tracking
 * - Automatic cleanup of expired entries
 * - Graceful 429 responses
 * - Progressive backoff for repeated violations
 * - Distributed rate limiting support (via localStorage for multi-tab)
 */

class RateLimiter {
  constructor() {
    // Store rate limit data: { key: { count, resetTime, blocked, violations } }
    this.requests = new Map();
    
    // Default rate limits (requests per window)
    this.limits = {
      // Authentication endpoints - stricter limits (OWASP recommendation)
      'auth:login': { maxRequests: 5, windowMs: 15 * 60 * 1000, blockDuration: 30 * 60 * 1000 }, // 5 per 15 min, 30 min block
      'auth:register': { maxRequests: 3, windowMs: 60 * 60 * 1000, blockDuration: 60 * 60 * 1000 }, // 3 per hour, 1 hour block
      'auth:password-reset': { maxRequests: 3, windowMs: 60 * 60 * 1000, blockDuration: 60 * 60 * 1000 }, // 3 per hour
      'auth:verify': { maxRequests: 5, windowMs: 60 * 60 * 1000, blockDuration: 60 * 60 * 1000 }, // 5 per hour
      
      // Order/booking creation - moderate limits
      'order:create': { maxRequests: 10, windowMs: 60 * 60 * 1000, blockDuration: 15 * 60 * 1000 }, // 10 per hour
      'booking:create': { maxRequests: 5, windowMs: 60 * 60 * 1000, blockDuration: 15 * 60 * 1000 }, // 5 per hour
      'payment:process': { maxRequests: 5, windowMs: 60 * 60 * 1000, blockDuration: 30 * 60 * 1000 }, // 5 per hour
      
      // Review/rating submission
      'review:create': { maxRequests: 5, windowMs: 60 * 60 * 1000, blockDuration: 10 * 60 * 1000 }, // 5 per hour
      'review:update': { maxRequests: 10, windowMs: 60 * 60 * 1000, blockDuration: 10 * 60 * 1000 }, // 10 per hour
      
      // Search and read operations - more lenient
      'search': { maxRequests: 30, windowMs: 60 * 1000, blockDuration: 2 * 60 * 1000 }, // 30 per minute
      'read': { maxRequests: 50, windowMs: 60 * 1000, blockDuration: 2 * 60 * 1000 }, // 50 per minute
      'menu:fetch': { maxRequests: 60, windowMs: 60 * 1000, blockDuration: 2 * 60 * 1000 }, // 60 per minute
      
      // Admin operations
      'admin:write': { maxRequests: 50, windowMs: 60 * 1000, blockDuration: 5 * 60 * 1000 }, // 50 per minute
      'admin:delete': { maxRequests: 20, windowMs: 60 * 1000, blockDuration: 10 * 60 * 1000 }, // 20 per minute
      
      // File uploads
      'upload:image': { maxRequests: 10, windowMs: 60 * 60 * 1000, blockDuration: 15 * 60 * 1000 }, // 10 per hour
      
      // Default for unspecified endpoints
      'default': { maxRequests: 30, windowMs: 60 * 1000, blockDuration: 5 * 60 * 1000 } // 30 per minute
    };
    
    // Load persisted rate limit data from localStorage (for multi-tab support)
    this.loadFromStorage();
    
    // Cleanup expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
    
    // Persist to storage every 30 seconds
    setInterval(() => this.saveToStorage(), 30 * 1000);
  }

  /**
   * Load rate limit data from localStorage for multi-tab coordination
   */
  loadFromStorage() {
    try {
      const stored = localStorage.getItem('rateLimitData');
      if (stored) {
        const data = JSON.parse(stored);
        const now = Date.now();
        
        // Only load non-expired entries
        for (const [key, record] of Object.entries(data)) {
          if (record.resetTime > now) {
            this.requests.set(key, record);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load rate limit data:', error);
    }
  }

  /**
   * Save rate limit data to localStorage for multi-tab coordination
   */
  saveToStorage() {
    try {
      const data = {};
      for (const [key, record] of this.requests.entries()) {
        data[key] = record;
      }
      localStorage.setItem('rateLimitData', JSON.stringify(data));
    } catch (error) {
      // Silently fail if localStorage is full or unavailable
      console.warn('Failed to save rate limit data:', error);
    }
  }

  /**
   * Generate a unique key for rate limiting
   * Combines endpoint, IP (simulated via browser fingerprint), and user ID
   */
  generateKey(endpoint, userId = null) {
    // In a real app, you'd get the actual IP from the server
    // For client-side, we use a browser fingerprint
    const fingerprint = this.getBrowserFingerprint();
    return `${endpoint}:${fingerprint}:${userId || 'anonymous'}`;
  }

  /**
   * Simple browser fingerprint for client-side rate limiting
   * Note: This is not foolproof but provides basic protection
   */
  getBrowserFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('fingerprint', 2, 2);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.colorDepth,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Check if request should be rate limited
   * @param {string} endpoint - The endpoint being accessed
   * @param {string|null} userId - Optional user ID for user-based limiting
   * @returns {Object} { allowed: boolean, retryAfter: number|null, remaining: number, blocked: boolean }
   */
  checkLimit(endpoint, userId = null) {
    const key = this.generateKey(endpoint, userId);
    const limit = this.limits[endpoint] || this.limits.default;
    const now = Date.now();
    
    // Reload from storage to sync across tabs
    this.loadFromStorage();
    
    let record = this.requests.get(key);
    
    // Initialize or reset if window expired
    if (!record || now > record.resetTime) {
      record = {
        count: 0,
        resetTime: now + limit.windowMs,
        blocked: false,
        violations: record?.violations || 0,
        blockUntil: null
      };
      this.requests.set(key, record);
    }
    
    // Check if currently blocked (progressive backoff)
    if (record.blockUntil && now < record.blockUntil) {
      return {
        allowed: false,
        retryAfter: Math.ceil((record.blockUntil - now) / 1000),
        remaining: 0,
        blocked: true,
        reason: 'Rate limit exceeded. Please try again later.'
      };
    }
    
    // Check if blocked from previous violation
    if (record.blocked && now < record.resetTime) {
      return {
        allowed: false,
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
        remaining: 0,
        blocked: true,
        reason: 'Too many requests. Please wait before trying again.'
      };
    }
    
    // Increment count
    record.count++;
    
    // Check if limit exceeded
    if (record.count > limit.maxRequests) {
      record.blocked = true;
      record.violations = (record.violations || 0) + 1;
      
      // Progressive backoff: increase block duration with each violation
      const blockDuration = limit.blockDuration || limit.windowMs;
      const progressiveMultiplier = Math.min(record.violations, 5); // Cap at 5x
      record.blockUntil = now + (blockDuration * progressiveMultiplier);
      
      // Log security event
      this.logSecurityEvent(endpoint, userId, 'RATE_LIMIT_EXCEEDED', {
        violations: record.violations,
        blockDuration: blockDuration * progressiveMultiplier
      });
      
      this.saveToStorage();
      
      return {
        allowed: false,
        retryAfter: Math.ceil((record.blockUntil - now) / 1000),
        remaining: 0,
        blocked: true,
        reason: `Rate limit exceeded. Blocked for ${Math.ceil((record.blockUntil - now) / 60000)} minutes.`
      };
    }
    
    this.saveToStorage();
    
    return {
      allowed: true,
      retryAfter: null,
      remaining: limit.maxRequests - record.count,
      blocked: false
    };
  }

  /**
   * Log security events for monitoring and alerting
   */
  logSecurityEvent(endpoint, userId, eventType, metadata = {}) {
    const event = {
      timestamp: new Date().toISOString(),
      endpoint,
      userId: userId || 'anonymous',
      eventType,
      fingerprint: this.getBrowserFingerprint(),
      metadata
    };
    
    // Log to console in development
    if (import.meta.env.DEV) {
      console.warn('[Security Event]', event);
    }
    
    // In production, send to monitoring service
    // Example: sendToMonitoring(event);
    
    // Store in localStorage for admin review
    try {
      const events = JSON.parse(localStorage.getItem('securityEvents') || '[]');
      events.push(event);
      // Keep only last 100 events
      if (events.length > 100) {
        events.shift();
      }
      localStorage.setItem('securityEvents', JSON.stringify(events));
    } catch (error) {
      console.warn('Failed to log security event:', error);
    }
  }

  /**
   * Cleanup expired entries to prevent memory leaks
   */
  cleanup() {
    const now = Date.now();
    for (const [key, record] of this.requests.entries()) {
      if (now > record.resetTime) {
        this.requests.delete(key);
      }
    }
  }

  /**
   * Reset rate limit for a specific key (useful for testing or admin override)
   */
  reset(endpoint, userId = null) {
    const key = this.generateKey(endpoint, userId);
    this.requests.delete(key);
  }

  /**
   * Get current status for an endpoint
   */
  getStatus(endpoint, userId = null) {
    const key = this.generateKey(endpoint, userId);
    const record = this.requests.get(key);
    const limit = this.limits[endpoint] || this.limits.default;
    
    if (!record) {
      return {
        count: 0,
        limit: limit.maxRequests,
        remaining: limit.maxRequests,
        resetTime: null
      };
    }
    
    return {
      count: record.count,
      limit: limit.maxRequests,
      remaining: Math.max(0, limit.maxRequests - record.count),
      resetTime: new Date(record.resetTime).toISOString()
    };
  }
}

// Singleton instance
const rateLimiter = new RateLimiter();

/**
 * Wrapper function to apply rate limiting to async functions
 * @param {string} endpoint - The endpoint identifier
 * @param {Function} fn - The async function to wrap
 * @param {string|null} userId - Optional user ID
 * @returns {Function} Wrapped function with rate limiting
 */
export function withRateLimit(endpoint, fn, userId = null) {
  return async (...args) => {
    const { allowed, retryAfter, remaining } = rateLimiter.checkLimit(endpoint, userId);
    
    if (!allowed) {
      const error = new Error(`Rate limit exceeded. Please try again in ${retryAfter} seconds.`);
      error.code = 'RATE_LIMIT_EXCEEDED';
      error.retryAfter = retryAfter;
      error.statusCode = 429;
      throw error;
    }
    
    // Add rate limit info to console in development
    if (import.meta.env.DEV) {
      console.log(`[Rate Limit] ${endpoint}: ${remaining} requests remaining`);
    }
    
    return fn(...args);
  };
}

/**
 * React hook for rate limiting
 */
export function useRateLimit(endpoint, userId = null) {
  return {
    checkLimit: () => rateLimiter.checkLimit(endpoint, userId),
    getStatus: () => rateLimiter.getStatus(endpoint, userId),
    reset: () => rateLimiter.reset(endpoint, userId)
  };
}

export default rateLimiter;
