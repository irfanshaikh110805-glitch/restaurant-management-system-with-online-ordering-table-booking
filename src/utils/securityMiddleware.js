 
/**
 * Security Middleware
 * Wraps API calls with security checks including rate limiting, input validation, and logging
 * 
 * OWASP Best Practices Implementation:
 * - Input validation and sanitization
 * - Rate limiting
 * - Security logging and monitoring
 * - Error handling without information disclosure
 */

import rateLimiter from './rateLimiter';
import { sanitizeObject } from './inputSanitizer';
import { VALIDATION_SCHEMAS, SUSPICIOUS_PATTERNS, SECURITY_ERROR_MESSAGES } from './securityConfig';

/**
 * Detect suspicious patterns in input
 */
function detectSuspiciousPatterns(input, userId = null) {
  const inputStr = JSON.stringify(input);
  const detected = [];
  
  for (const [patternName, pattern] of Object.entries(SUSPICIOUS_PATTERNS)) {
    if (pattern.test(inputStr)) {
      detected.push(patternName);
    }
  }
  
  if (detected.length > 0) {
    logSecurityEvent('SUSPICIOUS_PATTERN_DETECTED', {
      patterns: detected,
      userId: userId || 'anonymous',
      input: inputStr.substring(0, 200) // Log only first 200 chars
    });
  }
  
  return detected;
}

/**
 * Log security events for monitoring
 */
function logSecurityEvent(eventType, metadata = {}) {
  const event = {
    timestamp: new Date().toISOString(),
    eventType,
    metadata,
    userAgent: navigator.userAgent,
    url: window.location.href
  };
  
  // Log to console in development
  if (import.meta.env.DEV) {
    console.warn('[Security Event]', event);
  }
  
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
  
  // In production, send to monitoring service
  // Example: sendToMonitoringService(event);
}

/**
 * Create a secure wrapper for API functions
 * 
 * @param {string} endpoint - Rate limit endpoint identifier
 * @param {string} schemaName - Validation schema name from VALIDATION_SCHEMAS
 * @param {Function} fn - The async function to wrap
 * @param {Object} options - Additional options
 * @returns {Function} Wrapped function with security checks
 */
export function withSecurity(endpoint, schemaName, fn, options = {}) {
  const {
    requireAuth = false,
    skipValidation = false,
    skipRateLimit = false,
    customValidator = null
  } = options;
  
  return async (input, userId = null) => {
    const startTime = Date.now();
    
    try {
      // 1. Rate Limiting Check
      if (!skipRateLimit) {
        const rateLimitResult = rateLimiter.checkLimit(endpoint, userId);
        
        if (!rateLimitResult.allowed) {
          logSecurityEvent('RATE_LIMIT_EXCEEDED', {
            endpoint,
            userId: userId || 'anonymous',
            retryAfter: rateLimitResult.retryAfter
          });
          
          const error = new Error(rateLimitResult.reason || SECURITY_ERROR_MESSAGES.RATE_LIMIT);
          error.code = 'RATE_LIMIT_EXCEEDED';
          error.statusCode = 429;
          error.retryAfter = rateLimitResult.retryAfter;
          throw error;
        }
        
        // Log remaining requests in development
        if (import.meta.env.DEV) {
          console.log(`[Rate Limit] ${endpoint}: ${rateLimitResult.remaining} requests remaining`);
        }
      }
      
      // 2. Authentication Check
      if (requireAuth && !userId) {
        logSecurityEvent('UNAUTHORIZED_ACCESS_ATTEMPT', {
          endpoint,
          input: JSON.stringify(input).substring(0, 100)
        });
        
        const error = new Error(SECURITY_ERROR_MESSAGES.UNAUTHORIZED);
        error.code = 'UNAUTHORIZED';
        error.statusCode = 401;
        throw error;
      }
      
      // 3. Suspicious Pattern Detection
      const suspiciousPatterns = detectSuspiciousPatterns(input, userId);
      if (suspiciousPatterns.length > 0) {
        // Log but don't block (could be false positive)
        console.warn(`Suspicious patterns detected: ${suspiciousPatterns.join(', ')}`);
      }
      
      // 4. Input Validation and Sanitization
      let validatedInput = input;
      if (!skipValidation && schemaName && VALIDATION_SCHEMAS[schemaName]) {
        const schema = VALIDATION_SCHEMAS[schemaName];
        const validationResult = sanitizeObject(input, schema);
        
        if (!validationResult.valid) {
          logSecurityEvent('VALIDATION_FAILED', {
            endpoint,
            userId: userId || 'anonymous',
            errors: validationResult.errors
          });
          
          const error = new Error(SECURITY_ERROR_MESSAGES.VALIDATION_FAILED);
          error.code = 'VALIDATION_FAILED';
          error.statusCode = 400;
          error.details = validationResult.errors;
          throw error;
        }
        
        validatedInput = validationResult.data;
      }
      
      // 5. Custom Validation (if provided)
      if (customValidator) {
        const customResult = await customValidator(validatedInput, userId);
        if (!customResult.valid) {
          const error = new Error(customResult.message || SECURITY_ERROR_MESSAGES.VALIDATION_FAILED);
          error.code = 'CUSTOM_VALIDATION_FAILED';
          error.statusCode = 400;
          error.details = customResult.errors;
          throw error;
        }
      }
      
      // 6. Execute the wrapped function
      const result = await fn(validatedInput, userId);
      
      // 7. Log successful operation (for audit trail)
      const duration = Date.now() - startTime;
      if (import.meta.env.DEV) {
        console.log(`[API] ${endpoint} completed in ${duration}ms`);
      }
      
      // Log sensitive operations
      if (endpoint.includes('admin') || endpoint.includes('delete') || endpoint.includes('payment')) {
        logSecurityEvent('SENSITIVE_OPERATION', {
          endpoint,
          userId: userId || 'anonymous',
          duration,
          success: true
        });
      }
      
      return result;
      
    } catch (error) {
      // 8. Error Handling and Logging
      const duration = Date.now() - startTime;
      
      // Log error (but sanitize sensitive information)
      logSecurityEvent('API_ERROR', {
        endpoint,
        userId: userId || 'anonymous',
        errorCode: error.code || 'UNKNOWN',
        errorMessage: error.message,
        duration
      });
      
      // Re-throw with sanitized message if not already a security error
      if (!error.code) {
        const sanitizedError = new Error(SECURITY_ERROR_MESSAGES.SERVER_ERROR);
        sanitizedError.code = 'SERVER_ERROR';
        sanitizedError.statusCode = 500;
        sanitizedError.originalError = import.meta.env.DEV ? error.message : undefined;
        throw sanitizedError;
      }
      
      throw error;
    }
  };
}

/**
 * Batch security wrapper for multiple operations
 */
export function withBatchSecurity(endpoint, schemaName, fn, options = {}) {
  return async (inputs, userId = null) => {
    const results = [];
    const errors = [];
    
    for (let i = 0; i < inputs.length; i++) {
      try {
        const securedFn = withSecurity(endpoint, schemaName, 
          async (input) => fn(input, i), 
          options
        );
        const result = await securedFn(inputs[i], userId);
        results.push(result);
      } catch (error) {
        errors.push({ index: i, error: error.message });
      }
    }
    
    return { results, errors };
  };
}

/**
 * Get security events for admin review
 */
export function getSecurityEvents(limit = 100) {
  try {
    const events = JSON.parse(localStorage.getItem('securityEvents') || '[]');
    return events.slice(-limit);
  } catch (error) {
    console.error('Failed to retrieve security events:', error);
    return [];
  }
}

/**
 * Clear security events (admin only)
 */
export function clearSecurityEvents() {
  try {
    localStorage.removeItem('securityEvents');
    return true;
  } catch (error) {
    console.error('Failed to clear security events:', error);
    return false;
  }
}

export default {
  withSecurity,
  withBatchSecurity,
  getSecurityEvents,
  clearSecurityEvents,
  logSecurityEvent
};
