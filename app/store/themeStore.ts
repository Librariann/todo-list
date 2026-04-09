import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeState = {
  isDarkMode: string;
  setTheme: (mode: string) => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDarkMode: 'light',
      setTheme: (mode) => set({ isDarkMode: mode }),
    }),
    {
      name: 'theme-storage',
    }
  )
);
