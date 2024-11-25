// config.js
const isDevelopment = process.env.NODE_ENV === 'development';

// In production, API calls will be relative to the current domain
export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:3000' 
  : '';
