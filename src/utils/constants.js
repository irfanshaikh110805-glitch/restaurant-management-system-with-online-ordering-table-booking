// Constants for the application

// API Endpoints
export const API_ENDPOINTS = {
  MENU_ITEMS: '/menu-items',
  CATEGORIES: '/categories',
  ORDERS: '/orders',
  REVIEWS: '/reviews',
  PROMOTIONS: '/promo-codes',
  EVENTS: '/events',
  BOOKINGS: '/bookings'
};

// Order Statuses
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  PICKED_UP: 'picked_up',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  FAILED: 'failed'
};

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: 'Order Placed',
  [ORDER_STATUS.CONFIRMED]: 'Confirmed',
  [ORDER_STATUS.PREPARING]: 'Preparing',
  [ORDER_STATUS.READY]: 'Ready for Pickup',
  [ORDER_STATUS.PICKED_UP]: 'Out for Delivery',
  [ORDER_STATUS.DELIVERED]: 'Delivered',
  [ORDER_STATUS.CANCELLED]: 'Cancelled',
  [ORDER_STATUS.FAILED]: 'Failed'
};

// Payment Methods
export const PAYMENT_METHODS = {
  COD: 'cash_on_delivery',
  CARD: 'card',
  UPI: 'upi',
  WALLET: 'wallet',
  NET_BANKING: 'net_banking'
};

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.COD]: 'Cash on Delivery',
  [PAYMENT_METHODS.CARD]: 'Credit/Debit Card',
  [PAYMENT_METHODS.UPI]: 'UPI',
  [PAYMENT_METHODS.WALLET]: 'Wallet',
  [PAYMENT_METHODS.NET_BANKING]: 'Net Banking'
};

// Loyalty Tiers
export const LOYALTY_TIERS = {
  BRONZE: 'bronze',
  SILVER: 'silver',
  GOLD: 'gold',
  PLATINUM: 'platinum'
};

export const TIER_COLORS = {
  [LOYALTY_TIERS.BRONZE]: '#CD7F32',
  [LOYALTY_TIERS.SILVER]: '#C0C0C0',
  [LOYALTY_TIERS.GOLD]: '#FFD700',
  [LOYALTY_TIERS.PLATINUM]: '#E5E4E2'
};

// Notification Types
export const NOTIFICATION_TYPES = {
  ORDER_CONFIRMED: 'order_confirmed',
  ORDER_PREPARING: 'order_preparing',
  ORDER_READY: 'order_ready',
  ORDER_DELIVERED: 'order_delivered',
  PROMOTION: 'promotion',
  LOYALTY_REWARD: 'loyalty_reward',
  BOOKING_CONFIRMED: 'booking_confirmed',
  REVIEW_RESPONSE: 'review_response'
};

// Dietary Preferences
export const DIETARY_PREFERENCES = {
  VEG: 'veg',
  NON_VEG: 'non-veg',
  VEGAN: 'vegan',
  GLUTEN_FREE: 'gluten-free',
  JAIN: 'jain'
};

export const DIETARY_LABELS = {
  [DIETARY_PREFERENCES.VEG]: '🟢 Vegetarian',
  [DIETARY_PREFERENCES.NON_VEG]: '🔴 Non-Vegetarian',
  [DIETARY_PREFERENCES.VEGAN]: '🌱 Vegan',
  [DIETARY_PREFERENCES.GLUTEN_FREE]: '🌾 Gluten-Free',
  [DIETARY_PREFERENCES.JAIN]: '🙏 Jain'
};

// Spice Levels
export const SPICE_LEVELS = {
  MILD: 'mild',
  MEDIUM: 'medium',
  HOT: 'hot',
  EXTRA_HOT: 'extra_hot'
};

export const SPICE_LEVEL_LABELS = {
  [SPICE_LEVELS.MILD]: '🌶️ Mild',
  [SPICE_LEVELS.MEDIUM]: '🌶️🌶️ Medium',
  [SPICE_LEVELS.HOT]: '🌶️🌶️🌶️ Hot',
  [SPICE_LEVELS.EXTRA_HOT]: '🌶️🌶️🌶️🌶️ Extra Hot'
};

// Booking Status
export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
};

// Review Status
export const REVIEW_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

// Language Codes
export const LANGUAGES = {
  ENGLISH: 'en',
  HINDI: 'hi',
  KANNADA: 'kn'
};

// Date Formats
export const DATE_FORMATS = {
  SHORT: 'short',
  LONG: 'long',
  TIME: 'time',
  DATETIME: 'datetime'
};

// Validation Rules
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 50,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  PHONE_LENGTH: 10,
  PINCODE_LENGTH: 6,
  MAX_REVIEW_LENGTH: 1000,
  MAX_IMAGES_PER_REVIEW: 5,
  MAX_FILE_SIZE_MB: 5
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 50
};

// Tax Rate
export const TAX_RATE = 0.05; // 5% GST

// Min Order Amount
export const MIN_ORDER_AMOUNT = 99;

// Free Delivery Threshold
export const FREE_DELIVERY_THRESHOLD = 300;

// Default Delivery Fee
export const DEFAULT_DELIVERY_FEE = 40;

// Restaurant Timings
export const RESTAURANT_HOURS = {
  OPEN: 10, // 10 AM
  CLOSE: 23 // 11 PM
};

// Social Media
export const SOCIAL_MEDIA = {
  FACEBOOK: 'https://facebook.com/hoteleverest',
  INSTAGRAM: 'https://instagram.com/hoteleverest',
  TWITTER: 'https://twitter.com/hoteleverest',
  WHATSAPP: '+919876543210'
};

// Contact Info
export const CONTACT_INFO = {
  PHONE: '+91 98765 43210',
  EMAIL: 'info@hoteleverest.com',
  ADDRESS: 'Station Road, Vijayapura, Karnataka 586101'
};

// Map Coordinates
export const RESTAURANT_LOCATION = {
  LAT: 16.8302,
  LNG: 75.7100
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Something went wrong. Please try again later.',
  UNAUTHORIZED: 'Please login to continue.',
  INVALID_INPUT: 'Please check your input and try again.',
  NOT_FOUND: 'The requested resource was not found.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  ORDER_PLACED: 'Order placed successfully!',
  BOOKING_CONFIRMED: 'Booking confirmed!',
  REVIEW_SUBMITTED: 'Review submitted successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!'
};

export default {
  API_ENDPOINTS,
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  LOYALTY_TIERS,
  TIER_COLORS,
  NOTIFICATION_TYPES,
  DIETARY_PREFERENCES,
  DIETARY_LABELS,
  SPICE_LEVELS,
  SPICE_LEVEL_LABELS,
  BOOKING_STATUS,
  REVIEW_STATUS,
  LANGUAGES,
  DATE_FORMATS,
  VALIDATION,
  PAGINATION,
  TAX_RATE,
  MIN_ORDER_AMOUNT,
  FREE_DELIVERY_THRESHOLD,
  DEFAULT_DELIVERY_FEE,
  RESTAURANT_HOURS,
  SOCIAL_MEDIA,
  CONTACT_INFO,
  RESTAURANT_LOCATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
};
