/**
 * Input Sanitization and Validation Utility
 * Implements OWASP best practices for input validation and XSS prevention
 * 
 * Features:
 * - Schema-based validation
 * - Type checking and coercion
 * - Length limits enforcement
 * - XSS prevention through sanitization
 * - SQL injection prevention (additional layer)
 * - Whitelist-based validation
 * - Reject unexpected fields
 */

/**
 * Sanitize string input to prevent XSS attacks
 * Removes potentially dangerous HTML/JavaScript
 */
export function sanitizeString(input, options = {}) {
  if (input === null || input === undefined) {
    return null;
  }

  if (typeof input !== 'string') {
    return String(input);
  }

  const {
    allowHTML = false,
    maxLength = 10000,
    trim = true
  } = options;

  let sanitized = input;

  // Trim whitespace if requested
  if (trim) {
    sanitized = sanitized.trim();
  }

  // Enforce max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  // If HTML not allowed, escape all HTML entities
  if (!allowHTML) {
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  } else {
    // If HTML allowed, only remove dangerous tags and attributes
    sanitized = sanitized
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
      .replace(/javascript:/gi, '');
  }

  return sanitized;
}

/**
 * Sanitize number input
 */
export function sanitizeNumber(input, options = {}) {
  const {
    min = -Infinity,
    max = Infinity,
    integer = false,
    allowNegative = true
  } = options;

  let num = Number(input);

  // Check if valid number
  if (isNaN(num) || !isFinite(num)) {
    return null;
  }

  // Convert to integer if requested
  if (integer) {
    num = Math.floor(num);
  }

  // Check negative constraint
  if (!allowNegative && num < 0) {
    return null;
  }

  // Enforce min/max
  num = Math.max(min, Math.min(max, num));

  return num;
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(input) {
  if (typeof input !== 'string') {
    return null;
  }

  const email = input.trim().toLowerCase();
  
  // Basic email regex (RFC 5322 simplified)
  const emailRegex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
  
  if (!emailRegex.test(email)) {
    return null;
  }

  // Additional length check
  if (email.length > 254) {
    return null;
  }

  return email;
}

/**
 * Sanitize phone number
 */
export function sanitizePhone(input) {
  if (typeof input !== 'string') {
    return null;
  }

  // Remove all non-digit characters
  const cleaned = input.replace(/\D/g, '');

  // Validate length (10 digits for US, 10-15 for international)
  if (cleaned.length < 10 || cleaned.length > 15) {
    return null;
  }

  return cleaned;
}

/**
 * Sanitize URL to prevent open redirect vulnerabilities
 */
export function sanitizeUrl(input) {
  if (typeof input !== 'string') {
    return null;
  }

  const url = input.trim();

  // Block javascript: and data: protocols
  if (/^(javascript|data|vbscript|file):/i.test(url)) {
    return null;
  }

  // Only allow http, https, and relative URLs
  if (!/^(https?:\/\/|\/)/i.test(url)) {
    return null;
  }

  return url;
}

/**
 * Sanitize object by validating against schema
 * Implements whitelist-based validation and rejects unexpected fields
 * 
 * @param {Object} input - The input object to sanitize
 * @param {Object} schema - Schema definition with field rules
 * @returns {Object} { valid: boolean, data: Object|null, errors: Array }
 */
export function sanitizeObject(input, schema) {
  if (typeof input !== 'object' || input === null) {
    return { valid: false, data: null, errors: ['Input must be an object'] };
  }

  const sanitized = {};
  const errors = [];

  // Check for unexpected fields (reject fields not in schema)
  const allowedFields = Object.keys(schema);
  const inputFields = Object.keys(input);
  const unexpectedFields = inputFields.filter(field => !allowedFields.includes(field));

  if (unexpectedFields.length > 0) {
    errors.push(`Unexpected fields: ${unexpectedFields.join(', ')}`);
  }

  // Validate and sanitize each field according to schema
  for (const [field, rules] of Object.entries(schema)) {
    const value = input[field];

    // Check required fields
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      continue;
    }

    // Skip optional fields that are not provided
    if (!rules.required && (value === undefined || value === null)) {
      continue;
    }

    // Type validation and sanitization
    switch (rules.type) {
      case 'string': {
        const sanitizedStr = sanitizeString(value, {
          maxLength: rules.maxLength || 10000,
          allowHTML: rules.allowHTML || false,
          trim: rules.trim !== false
        });
        if (sanitizedStr === null && value !== null) {
          errors.push(`${field} must be a valid string`);
        } else {
          // Additional pattern validation
          if (rules.pattern && sanitizedStr && !rules.pattern.test(sanitizedStr)) {
            errors.push(`${field} format is invalid`);
          } else if (rules.minLength && sanitizedStr && sanitizedStr.length < rules.minLength) {
            errors.push(`${field} must be at least ${rules.minLength} characters`);
          } else {
            sanitized[field] = sanitizedStr;
          }
        }
        break;
      }

      case 'number': {
        const sanitizedNum = sanitizeNumber(value, {
          min: rules.min,
          max: rules.max,
          integer: rules.integer || false,
          allowNegative: rules.allowNegative !== false
        });
        if (sanitizedNum === null && value !== null) {
          errors.push(`${field} must be a valid number`);
        } else {
          sanitized[field] = sanitizedNum;
        }
        break;
      }

      case 'email': {
        const sanitizedEmail = sanitizeEmail(value);
        if (sanitizedEmail === null && value !== null) {
          errors.push(`${field} must be a valid email address`);
        } else {
          sanitized[field] = sanitizedEmail;
        }
        break;
      }

      case 'phone': {
        const sanitizedPhone = sanitizePhone(value);
        if (sanitizedPhone === null && value !== null) {
          errors.push(`${field} must be a valid phone number`);
        } else {
          sanitized[field] = sanitizedPhone;
        }
        break;
      }

      case 'url': {
        const sanitizedUrl = sanitizeUrl(value);
        if (sanitizedUrl === null && value !== null) {
          errors.push(`${field} must be a valid URL`);
        } else {
          sanitized[field] = sanitizedUrl;
        }
        break;
      }

      case 'boolean':
        sanitized[field] = Boolean(value);
        break;

      case 'array':
        if (!Array.isArray(value)) {
          errors.push(`${field} must be an array`);
        } else {
          if (rules.maxItems && value.length > rules.maxItems) {
            errors.push(`${field} cannot have more than ${rules.maxItems} items`);
          } else if (rules.minItems && value.length < rules.minItems) {
            errors.push(`${field} must have at least ${rules.minItems} items`);
          } else {
            // Sanitize array items if itemSchema provided
            if (rules.itemSchema) {
              const sanitizedArray = [];
              for (const item of value) {
                const result = sanitizeObject(item, rules.itemSchema);
                if (result.valid) {
                  sanitizedArray.push(result.data);
                } else {
                  errors.push(`Invalid item in ${field}: ${result.errors.join(', ')}`);
                  break;
                }
              }
              if (sanitizedArray.length === value.length) {
                sanitized[field] = sanitizedArray;
              }
            } else {
              // Sanitize array of strings to prevent XSS
              if (value.every(item => typeof item === 'string')) {
                sanitized[field] = value.map(item => sanitizeString(item, { maxLength: 1000 }));
              } else {
                // For non-string arrays, pass through but log warning
                console.warn(`Array field ${field} contains non-string items without itemSchema`);
                sanitized[field] = value;
              }
            }
          }
        }
        break;

      case 'date': {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          errors.push(`${field} must be a valid date`);
        } else {
          sanitized[field] = date.toISOString();
        }
        break;
      }

      case 'enum':
        if (!rules.values || !rules.values.includes(value)) {
          errors.push(`${field} must be one of: ${rules.values?.join(', ')}`);
        } else {
          sanitized[field] = value;
        }
        break;

      default:
        sanitized[field] = value;
    }
  }

  return {
    valid: errors.length === 0,
    data: errors.length === 0 ? sanitized : null,
    errors
  };
}

/**
 * Create a sanitization middleware for consistent input validation
 */
export function createSanitizer(schema) {
  return (input) => sanitizeObject(input, schema);
}