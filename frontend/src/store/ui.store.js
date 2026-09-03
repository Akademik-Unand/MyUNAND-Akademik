import { create } from 'zustand';
import {
  DEFAULT_FONT_SCALE,
  DEFAULT_THEME,
  FONT_SCALES,
  getFontScale,
  normalizeTheme,
} from '../constants/theme';

const THEME_STORAGE_KEY = 'myunand_theme';
const FONT_STORAGE_KEY = 'myunand_font_scale';

const readTheme = () => normalizeTheme(localStorage.getItem(THEME_STORAGE_KEY));

const readFontScale = () => {
  const stored = localStorage.getItem(FONT_STORAGE_KEY);
  return FONT_SCALES.some((item) => item.id === stored) ? stored : DEFAULT_FONT_SCALE;
};

const applyAppearance = (theme, fontScaleId) => {
  const scale = getFontScale(fontScaleId);
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.setProperty('--app-font-size', `${scale.px}px`);
};

const initialTheme = readTheme();
const initialFontScale = readFontScale();
applyAppearance(initialTheme, initialFontScale);
localStorage.setItem(THEME_STORAGE_KEY, initialTheme);

export const useUIStore = create((set, get) => ({
  isSidebarOpen: true,
  isMobileSidebarOpen: false,
  theme: initialTheme,
  fontScale: initialFontScale,

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),

  toggleMobileSidebar: () => set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
  setMobileSidebarOpen: (isOpen) => set({ isMobileSidebarOpen: isOpen }),

  setTheme: (newTheme) => {
    const theme = normalizeTheme(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    applyAppearance(theme, get().fontScale);
    set({ theme });
  },

  toggleTheme: () => {
    const next = get().theme === 'myunand-dark' ? DEFAULT_THEME : 'myunand-dark';
    get().setTheme(next);
  },

  setFontScale: (id) => {
    const fontScale = getFontScale(id).id;
    localStorage.setItem(FONT_STORAGE_KEY, fontScale);
    applyAppearance(get().theme, fontScale);
    set({ fontScale });
  },

  stepFontScale: (direction) => {
    const index = FONT_SCALES.findIndex((item) => item.id === get().fontScale);
    const next = FONT_SCALES[index + direction];
    if (next) get().setFontScale(next.id);
  },
}));
