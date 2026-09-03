import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        myunand: {
          "primary": "#15803d",          // Emerald Green Unand
          "primary-content": "#ffffff",
          "secondary": "#0284c7",        // Sky Blue
          "secondary-content": "#ffffff",
          "accent": "#d97706",           // Amber Gold
          "accent-content": "#ffffff",
          "neutral": "#1e293b",          // Slate Slate-800
          "neutral-content": "#f8fafc",
          "base-100": "#ffffff",         // Pure white background
          "base-200": "#f3f4f6",         // Soft neutral gray page background
          "base-300": "#e5e7eb",         // Border / subtle dividers
          "base-content": "#1e293b",     // Deep slate text
          "info": "#0ea5e9",
          "info-content": "#ffffff",
          "success": "#16a34a",
          "success-content": "#ffffff",
          "warning": "#f59e0b",
          "warning-content": "#ffffff",
          "error": "#ef4444",
          "error-content": "#ffffff",
        },
      },
      "light",
      "corporate",
      "dark",
    ],
    darkTheme: "dark",
    base: true,
    styled: true,
    utils: true,
  },
};
