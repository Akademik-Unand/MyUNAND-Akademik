const readFlag = (value, fallback = true) => {
  if (value === undefined || value === '') return fallback;
  return value !== 'false';
};

export const env = {
  useMock: readFlag(import.meta.env.VITE_USE_MOCK, true),
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api/v1',
};
