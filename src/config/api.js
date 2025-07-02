// API configuration using environment variables
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
  RETRY_ATTEMPTS: parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS) || 3,
  RETRY_DELAY: parseInt(import.meta.env.VITE_API_RETRY_DELAY) || 1000,
};

// Feature flags from environment
export const FEATURES = {
  ENABLE_DARK_MODE: import.meta.env.VITE_ENABLE_DARK_MODE !== 'false',
  ENABLE_NOTIFICATIONS: import.meta.env.VITE_ENABLE_NOTIFICATIONS !== 'false',
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  ENABLE_PWA: import.meta.env.VITE_ENABLE_PWA === 'true',
  ENABLE_VOICE_INPUT: import.meta.env.VITE_ENABLE_VOICE_INPUT === 'true',
};

// App configuration
export const APP_CONFIG = {
  APP_NAME: import.meta.env.VITE_APP_NAME || 'BuildEstimate',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  COMPANY_NAME: import.meta.env.VITE_COMPANY_NAME || 'BuildEstimate',
  SUPPORT_EMAIL: import.meta.env.VITE_SUPPORT_EMAIL || 'support@buildestimate.com',
  SUPPORT_PHONE: import.meta.env.VITE_SUPPORT_PHONE || '+91 98765 43210',
};

// Payment configuration
export const PAYMENT_CONFIG = {
  UPI_ID: import.meta.env.VITE_UPI_ID || '',
  MERCHANT_NAME: import.meta.env.VITE_MERCHANT_NAME || 'BuildEstimate',
  PAYMENT_GATEWAY: import.meta.env.VITE_PAYMENT_GATEWAY || 'upi',
};

// File upload configuration
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: (import.meta.env.VITE_ALLOWED_FILE_TYPES || 'pdf,jpg,jpeg,png,doc,docx').split(','),
  UPLOAD_ENDPOINT: `${API_CONFIG.BASE_URL}/api/upload`,
};

export default API_CONFIG;