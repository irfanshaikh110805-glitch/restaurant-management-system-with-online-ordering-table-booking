// Validation functions for form inputs

export const validators = {
  // Required field
  required: (value, fieldName = 'This field') => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return `${fieldName} is required`;
    }
    return null;
  },

  // Email validation
  email: (value) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  },

  // Phone validation (Indian)
  phone: (value) => {
    if (!value) return null;
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleaned = value.replace(/[^\d]/g, '');
    if (!phoneRegex.test(cleaned)) {
      return 'Please enter a valid 10-digit mobile number';
    }
    return null;
  },

  // Pincode validation (Indian)
  pincode: (value) => {
    if (!value) return null;
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!pincodeRegex.test(value)) {
      return 'Please enter a valid 6-digit pincode';
    }
    return null;
  },

  // Minimum length
  minLength: (value, min, fieldName = 'This field') => {
    if (!value) return null;
    if (value.length < min) {
      return `${fieldName} must be at least ${min} characters`;
    }
    return null;
  },

  // Maximum length
  maxLength: (value, max, fieldName = 'This field') => {
    if (!value) return null;
    if (value.length > max) {
      return `${fieldName} must be at most ${max} characters`;
    }
    return null;
  },

  // Minimum value
  min: (value, min, fieldName = 'Value') => {
    if (value === null || value === undefined || value === '') return null;
    const num = Number(value);
    if (isNaN(num) || num < min) {
      return `${fieldName} must be at least ${min}`;
    }
    return null;
  },

  // Maximum value
  max: (value, max, fieldName = 'Value') => {
    if (value === null || value === undefined || value === '') return null;
    const num = Number(value);
    if (isNaN(num) || num > max) {
      return `${fieldName} must be at most ${max}`;
    }
    return null;
  },

  // Password strength
  password: (value) => {
    if (!value) return null;
    
    if (value.length < 8) {
      return 'Password must be at least 8 characters';
    }
    
    if (!/[A-Z]/.test(value)) {
      return 'Password must contain at least one uppercase letter';
    }
    
    if (!/[a-z]/.test(value)) {
      return 'Password must contain at least one lowercase letter';
    }
    
    if (!/[0-9]/.test(value)) {
      return 'Password must contain at least one number';
    }
    
    return null;
  },

  // Confirm password
  confirmPassword: (password, confirmPassword) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }
    return null;
  },

  // URL validation
  url: (value) => {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return 'Please enter a valid URL';
    }
  },

  // Number validation
  number: (value, fieldName = 'This field') => {
    if (value === null || value === undefined || value === '') return null;
    if (isNaN(Number(value))) {
      return `${fieldName} must be a valid number`;
    }
    return null;
  },

  // Integer validation
  integer: (value, fieldName = 'This field') => {
    if (value === null || value === undefined || value === '') return null;
    const num = Number(value);
    if (isNaN(num) || !Number.isInteger(num)) {
      return `${fieldName} must be a whole number`;
    }
    return null;
  },

  // Date validation
  date: (value, fieldName = 'Date') => {
    if (!value) return null;
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return `${fieldName} is not a valid date`;
    }
    return null;
  },

  // Future date
  futureDate: (value, fieldName = 'Date') => {
    if (!value) return null;
    const date = new Date(value);
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Reset time to compare dates only
    
    if (date < now) {
      return `${fieldName} must be in the future`;
    }
    return null;
  },

  // Past date
  pastDate: (value, fieldName = 'Date') => {
    if (!value) return null;
    const date = new Date(value);
    const now = new Date();
    now.setHours(23, 59, 59, 999); // Set to end of day
    
    if (date > now) {
      return `${fieldName} must be in the past`;
    }
    return null;
  },

  // Age validation
  age: (value, minAge = 18) => {
    if (!value) return null;
    const birthDate = new Date(value);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    if (age < minAge) {
      return `You must be at least ${minAge} years old`;
    }
    return null;
  },

  // Credit card (basic)
  creditCard: (value) => {
    if (!value) return null;
    const cleaned = value.replace(/\s/g, '');
    const cardRegex = /^\d{13,19}$/;
    
    if (!cardRegex.test(cleaned)) {
      return 'Please enter a valid card number';
    }
    
    // Luhn algorithm
    let sum = 0;
    let isEven = false;
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    if (sum % 10 !== 0) {
      return 'Please enter a valid card number';
    }
    
    return null;
  },

  // UPI ID validation
  upiId: (value) => {
    if (!value) return null;
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
    
    if (!upiRegex.test(value)) {
      return 'Please enter a valid UPI ID (e.g., username@paytm)';
    }
    return null;
  },

  // File size validation (in MB)
  fileSize: (file, maxSizeMB = 5) => {
    if (!file) return null;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${maxSizeMB}MB`;
    }
    return null;
  },

  // File type validation
  fileType: (file, allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']) => {
    if (!file) return null;
    
    if (!allowedTypes.includes(file.type)) {
      const types = allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ');
      return `File must be one of: ${types}`;
    }
    return null;
  },

  // Multiple selections minimum
  multiSelectMin: (value, min, fieldName = 'Selection') => {
    if (!Array.isArray(value)) return null;
    
    if (value.length < min) {
      return `Please select at least ${min} ${fieldName.toLowerCase()}${min > 1 ? 's' : ''}`;
    }
    return null;
  },

  // Multiple selections maximum
  multiSelectMax: (value, max, fieldName = 'Selection') => {
    if (!Array.isArray(value)) return null;
    
    if (value.length > max) {
      return `Please select at most ${max} ${fieldName.toLowerCase()}${max > 1 ? 's' : ''}`;
    }
    return null;
  }
};

// Combine multiple validators
export const combineValidators = (...validatorFuncs) => {
  return (value, ...args) => {
    for (const validator of validatorFuncs) {
      const error = validator(value, ...args);
      if (error) return error;
    }
    return null;
  };
};

// Validate entire form
export const validateForm = (formData, validationRules) => {
  const errors = {};
  
  Object.keys(validationRules).forEach(field => {
    const rules = validationRules[field];
    const value = formData[field];
    
    for (const rule of rules) {
      const error = rule(value);
      if (error) {
        errors[field] = error;
        break; // Stop at first error for this field
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export default validators;
