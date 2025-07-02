// Dynamic API configuration that works with changing IPs
// This approach uses relative URLs when deployed, avoiding IP dependency

const isDevelopment = import.meta.env.DEV;
const devApiUrl = import.meta.env.VITE_API_BASE_URL;

// In production, use relative paths to avoid IP dependency
export const getApiBaseUrl = () => {
  if (isDevelopment && devApiUrl) {
    return devApiUrl;
  }
  
  // In production, API calls go through nginx proxy
  // This means we don't need to know the Gateway IP
  return '';
};

export const API_BASE_URL = getApiBaseUrl();