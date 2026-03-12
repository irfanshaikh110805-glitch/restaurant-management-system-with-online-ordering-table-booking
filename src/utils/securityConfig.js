/**
 * Security Configuration
 * Centralized security settings following OWASP best practices
 * 
 * OWASP Top 10 Coverage:
 * - A01: Broken Access Control
 * - A02: Cryptographic Failures
 * - A03: Injection
 * - A04: Insecure Design
 * - A05: Security Misconfiguration
 * - A07: Identification and Authentication Failures
 * - A08: Software and Data Integrity Failures
 * - A09: Security Logging and Monitoring Failures
 * - A10: Server-Side Request Forgery (SSRF)
 */

// Content Security Policy (CSP) headers
export const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': ["'self'", 'https://checkout.razorpay.com', 'https://fonts.googleapis.com'],
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'], // unsafe-inline needed for styled components
  'img-src': ["'self'", 'data:', 'https:', 'blob:'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'connect-src': ["'self'", 'https://*.supabase.co', 'wss://*.supabase.co', 'https://api.razorpay.com'],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"]
};

// Input validation schemas for all endpoints
export const VALIDATION_SCHEMAS = {
  // Authentication
  login: {
    email: { type: 'email', required: true, maxLength: 254 },
    password: { type: 'string', required: true, minLength: 6, maxLength: 128 }
  },
  
  register: {
    email: { type: 'email', required: true, maxLength: 254 },
    password: { type: 'string', required: true, minLength: 8, maxLength: 128 },
    fullName: { type: 'string', required: true, minLength: 2, maxLength: 100 },
    phone: { type: 'phone', required: true }
  },
  
  // Order creation
  createOrder: {
    userId: { type: 'string', required: false, maxLength: 36 },
    customerName: { type: 'string', required: true, minLength: 2, maxLength: 100 },
    phone: { type: 'phone', required: true },
    tableNumber: { type: 'string', required: false, maxLength: 20 },
    orderType: { type: 'enum', required: true, values: ['dine-in', 'takeout', 'delivery'] },
    instructions: { type: 'string', required: false, maxLength: 500 },
    paymentMethod: { type: 'enum', required: true, values: ['pay-at-restaurant', 'online', 'card', 'upi'] },
    paymentStatus: { type: 'enum', required: true, values: ['pending', 'completed', 'failed'] },
    items: { 
      type: 'array', 
      required: true, 
      minItems: 1, 
      maxItems: 50,
      itemSchema: {
        id: { type: 'string', required: true, maxLength: 36 },
        name: { type: 'string', required: true, maxLength: 200 },
        price: { type: 'number', required: true, min: 0, max: 100000 },
        quantity: { type: 'number', required: true, min: 1, max: 100, integer: true }
      }
    },
    total: { type: 'number', required: true, min: 0, max: 1000000 },
    subtotal: { type: 'number', required: true, min: 0, max: 1000000 },
    taxAmount: { type: 'number', required: true, min: 0, max: 100000 }
  },
  
  // Booking creation
  createBooking: {
    userId: { type: 'string', required: true, maxLength: 36 },
    date: { type: 'date', required: true },
    time: { type: 'string', required: true, pattern: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
    guests: { type: 'number', required: true, min: 1, max: 20, integer: true },
    specialRequests: { type: 'string', required: false, maxLength: 1000 },
    occasionType: { type: 'enum', required: false, values: ['birthday', 'anniversary', 'business', 'date', 'family', 'other', ''] },
    tablePreference: { type: 'enum', required: false, values: ['window', 'outdoor', 'quiet', 'booth', ''] },
    customerName: { type: 'string', required: true, minLength: 2, maxLength: 100 },
    customerPhone: { type: 'phone', required: true },
    customerEmail: { type: 'email', required: true, maxLength: 254 }
  },
  
  // Review submission
  submitReview: {
    userId: { type: 'string', required: true, maxLength: 36 },
    menuItemId: { type: 'string', required: false, maxLength: 36 },
    orderId: { type: 'string', required: false, maxLength: 36 },
    rating: { type: 'number', required: true, min: 1, max: 5, integer: true },
    comment: { type: 'string', required: false, maxLength: 2000 },
    reviewType: { type: 'enum', required: true, values: ['item', 'restaurant'] }
  },
  
  // Menu item creation/update (admin)
  menuItem: {
    name: { type: 'string', required: true, minLength: 2, maxLength: 200 },
    description: { type: 'string', required: false, maxLength: 1000 },
    price: { type: 'number', required: true, min: 0, max: 100000 },
    category: { type: 'enum', required: true, values: ['appetizer', 'main', 'dessert', 'beverage', 'special'] },
    dietary_tags: { type: 'array', required: false, maxItems: 10 },
    spice_level: { type: 'number', required: false, min: 0, max: 5, integer: true },
    is_available: { type: 'boolean', required: false },
    image_url: { type: 'url', required: false, maxLength: 2048 }
  },
  
  // Profile update
  updateProfile: {
    fullName: { type: 'string', required: false, minLength: 2, maxLength: 100 },
    phone: { type: 'phone', required: false },
    address: { type: 'string', required: false, maxLength: 500 },
    preferences: { type: 'string', required: false, maxLength: 2000 }
  },
  
  // Search query
  search: {
    query: { type: 'string', required: true, minLength: 1, maxLength: 200 },
    category: { type: 'string', required: false, maxLength: 50 },
    limit: { type: 'number', required: false, min: 1, max: 100, integer: true }
  }
};

// Rate limit configurations (imported by rateLimiter)
export const RATE_LIMITS = {
  // Critical operations
  CRITICAL: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDuration: 60 * 60 * 1000 // 1 hour block
  },
  
  // Sensitive operations
  SENSITIVE: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDuration: 30 * 60 * 1000 // 30 min block
  },
  
  // Standard operations
  STANDARD: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 1 minute
    blockDuration: 5 * 60 * 1000 // 5 min block
  },
  
  // Read operations
  READ: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
    blockDuration: 2 * 60 * 1000 // 2 min block
  }
};

// Security headers to be set
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
};

// Allowed file upload types and sizes
export const FILE_UPLOAD_CONFIG = {
  allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
  maxSize: 5 * 1024 * 1024, // 5MB
  maxFiles: 10
};

// Password policy
export const PASSWORD_POLICY = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true, // Required for better security
  preventCommon: true // Check against common passwords
};

// Session configuration
export const SESSION_CONFIG = {
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  renewThreshold: 60 * 60 * 1000, // Renew if less than 1 hour remaining
  absoluteTimeout: 7 * 24 * 60 * 60 * 1000 // 7 days absolute max
};

// Common passwords to block (top 100 most common)
export const COMMON_PASSWORDS = [
  '123456', 'password', '12345678', 'qwerty', '123456789', '12345',
  '1234', '111111', '1234567', 'dragon', '123123', 'baseball', 'iloveyou',
  '1234567890', '000000', 'abc123', 'password1', 'qwerty123'
  // Add more as needed
];

// Suspicious patterns to detect and log
export const SUSPICIOUS_PATTERNS = {
  sqlInjection: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)|(-{2})|(\bOR\b.*=.*)|(\bAND\b.*=.*)/i,
  xss: /<script|javascript:|onerror=|onload=|<iframe/i,
  pathTraversal: /\.\.[/\\]/,
  commandInjection: /[;&|`$()]/
};

// API endpoint classifications for monitoring
export const ENDPOINT_CLASSIFICATIONS = {
  PUBLIC: ['menu:fetch', 'search', 'read'],
  AUTHENTICATED: ['order:create', 'booking:create', 'review:create', 'profile:update'],
  ADMIN: ['admin:write', 'admin:delete', 'menu:create', 'menu:update'],
  SENSITIVE: ['auth:login', 'auth:register', 'payment:process']
};

// Error messages (generic to prevent information disclosure)
export const SECURITY_ERROR_MESSAGES = {
  RATE_LIMIT: 'Too many requests. Please try again later.',
  INVALID_INPUT: 'Invalid input provided. Please check your data.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'An error occurred. Please try again later.',
  VALIDATION_FAILED: 'Validation failed. Please check your input.',
  SUSPICIOUS_ACTIVITY: 'Suspicious activity detected. Your request has been logged.'
};

export default {
  CSP_DIRECTIVES,
  VALIDATION_SCHEMAS,
  RATE_LIMITS,
  SECURITY_HEADERS,
  FILE_UPLOAD_CONFIG,
  PASSWORD_POLICY,
  SESSION_CONFIG,
  COMMON_PASSWORDS,
  SUSPICIOUS_PATTERNS,
  ENDPOINT_CLASSIFICATIONS,
  SECURITY_ERROR_MESSAGES
};
