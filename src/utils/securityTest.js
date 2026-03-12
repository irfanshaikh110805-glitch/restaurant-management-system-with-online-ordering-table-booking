 
/**
 * Security Testing Utility
 * Use this to test security implementations in development
 * 
 * WARNING: DO NOT use in production!
 */

import rateLimiter from './rateLimiter';
import { sanitizeObject, sanitizeString, sanitizeEmail, sanitizePhone } from './inputSanitizer';
import { VALIDATION_SCHEMAS, SUSPICIOUS_PATTERNS } from './securityConfig';
import { getSecurityEvents } from './securityMiddleware';

/**
 * Test rate limiting functionality
 */
export function testRateLimiting() {
  console.group('🔒 Rate Limiting Tests');
  
  // Test 1: Normal usage
  console.log('\n✅ Test 1: Normal usage');
  for (let i = 0; i < 3; i++) {
    const result = rateLimiter.checkLimit('auth:login', 'test-user');
    console.log(`Request ${i + 1}:`, result);
  }
  
  // Test 2: Exceed limit
  console.log('\n⚠️ Test 2: Exceed limit');
  for (let i = 0; i < 8; i++) {
    const result = rateLimiter.checkLimit('auth:login', 'test-user-2');
    console.log(`Request ${i + 1}:`, result.allowed ? '✅ Allowed' : '❌ Blocked', 
                `(${result.remaining} remaining)`);
  }
  
  // Test 3: Different endpoints
  console.log('\n✅ Test 3: Different endpoints');
  const endpoints = ['auth:login', 'order:create', 'search', 'read'];
  endpoints.forEach(endpoint => {
    const result = rateLimiter.checkLimit(endpoint, 'test-user-3');
    console.log(`${endpoint}:`, result);
  });
  
  console.groupEnd();
}

/**
 * Test input sanitization
 */
export function testInputSanitization() {
  console.group('🧹 Input Sanitization Tests');
  
  // Test 1: XSS prevention
  console.log('\n🛡️ Test 1: XSS Prevention');
  const xssInputs = [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
    'javascript:alert("XSS")',
    '<iframe src="evil.com"></iframe>'
  ];
  
  xssInputs.forEach(input => {
    const sanitized = sanitizeString(input);
    console.log('Input:', input);
    console.log('Sanitized:', sanitized);
    console.log('Safe:', !sanitized.includes('<script') && !sanitized.includes('javascript:'));
    console.log('---');
  });
  
  // Test 2: Email validation
  console.log('\n📧 Test 2: Email Validation');
  const emails = [
    'valid@example.com',
    'invalid@',
    'not-an-email',
    'test@domain',
    'user+tag@example.co.uk'
  ];
  
  emails.forEach(email => {
    const sanitized = sanitizeEmail(email);
    console.log(`${email} → ${sanitized || '❌ Invalid'}`);
  });
  
  // Test 3: Phone validation
  console.log('\n📱 Test 3: Phone Validation');
  const phones = [
    '1234567890',
    '+1 (234) 567-8900',
    '123',
    'not-a-phone',
    '12345678901234567890'
  ];
  
  phones.forEach(phone => {
    const sanitized = sanitizePhone(phone);
    console.log(`${phone} → ${sanitized || '❌ Invalid'}`);
  });
  
  // Test 4: Schema validation
  console.log('\n📋 Test 4: Schema Validation');
  const testOrder = {
    customerName: 'John Doe',
    phone: '1234567890',
    items: [
      { id: '123', name: 'Pizza', price: 10, quantity: 2 }
    ],
    total: 20,
    subtotal: 20,
    taxAmount: 0,
    orderType: 'dine-in',
    paymentMethod: 'pay-at-restaurant',
    paymentStatus: 'pending',
    unexpectedField: 'should be rejected' // This should be rejected
  };
  
  const result = sanitizeObject(testOrder, VALIDATION_SCHEMAS.createOrder);
  console.log('Validation result:', result);
  console.log('Valid:', result.valid);
  if (!result.valid) {
    console.log('Errors:', result.errors);
  }
  
  console.groupEnd();
}

/**
 * Test suspicious pattern detection
 */
export function testSuspiciousPatterns() {
  console.group('🚨 Suspicious Pattern Detection');
  
  const testInputs = [
    { name: 'SQL Injection', input: "'; DROP TABLE users; --" },
    { name: 'XSS Attack', input: '<script>alert("XSS")</script>' },
    { name: 'Path Traversal', input: '../../etc/passwd' },
    { name: 'Command Injection', input: '; rm -rf /' },
    { name: 'Normal Input', input: 'Hello, World!' }
  ];
  
  testInputs.forEach(({ name, input }) => {
    console.log(`\n${name}:`);
    console.log('Input:', input);
    
    const detected = [];
    for (const [patternName, pattern] of Object.entries(SUSPICIOUS_PATTERNS)) {
      if (pattern.test(input)) {
        detected.push(patternName);
      }
    }
    
    if (detected.length > 0) {
      console.log('⚠️ Detected patterns:', detected);
    } else {
      console.log('✅ No suspicious patterns detected');
    }
  });
  
  console.groupEnd();
}

/**
 * Test security event logging
 */
export function testSecurityLogging() {
  console.group('📝 Security Event Logging');
  
  const events = getSecurityEvents(10);
  console.log(`Found ${events.length} security events:`);
  
  events.forEach((event, index) => {
    console.log(`\nEvent ${index + 1}:`);
    console.log('Type:', event.eventType);
    console.log('Time:', event.timestamp);
    console.log('Metadata:', event.metadata);
  });
  
  console.groupEnd();
}

/**
 * Run all security tests
 */
export function runAllSecurityTests() {
  console.clear();
  console.log('🔐 Running Security Tests...\n');
  
  testRateLimiting();
  console.log('\n');
  
  testInputSanitization();
  console.log('\n');
  
  testSuspiciousPatterns();
  console.log('\n');
  
  testSecurityLogging();
  
  console.log('\n✅ All security tests completed!');
  console.log('📖 Check SECURITY.md for more information');
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.securityTests = {
    runAll: runAllSecurityTests,
    rateLimiting: testRateLimiting,
    sanitization: testInputSanitization,
    patterns: testSuspiciousPatterns,
    logging: testSecurityLogging
  };
  
  console.log('💡 Security tests available! Run: window.securityTests.runAll()');
}

export default {
  runAll: runAllSecurityTests,
  rateLimiting: testRateLimiting,
  sanitization: testInputSanitization,
  patterns: testSuspiciousPatterns,
  logging: testSecurityLogging
};
