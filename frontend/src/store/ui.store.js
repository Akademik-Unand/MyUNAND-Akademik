import { create } from 'zustand';
import { DEFAULT_THEME } from '../constants/theme';

const THEME_STORAGE_KEY = 'myunand_theme';

export const useUIStore = create((set) => ({
  isSidebarOpen: true,
  isMobileSidebarOpen: false,
  theme: localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME,

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),

  toggleMobileSidebar: () => set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
  setMobileSidebarOpen: (isOpen) => set({ isMobileSidebarOpen: isOpen }),

  setTheme: (newTheme) => {
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    set({ theme: newTheme });
  },
}));
