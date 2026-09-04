export const env = {
  apiBaseUrl: String(import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1').replace(/\/$/, ''),
};
