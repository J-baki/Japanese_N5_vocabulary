import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Direction, Theme } from '../types';

// "Voca_all_data" — app configuration & preferences.
interface DataState {
  theme: Theme;
  defaultDirection: Direction;
  defaultQuestionCount: number;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  setDefaultDirection: (d: Direction) => void;
  setDefaultQuestionCount: (n: number) => void;
}

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      defaultDirection: 'bn-jp',
      defaultQuestionCount: 20,
      setTheme: (t) => set({ theme: t }),
      toggleTheme: () => set({ theme: get().theme === 'light' ? 'dark' : 'light' }),
      setDefaultDirection: (d) => set({ defaultDirection: d }),
      setDefaultQuestionCount: (n) => set({ defaultQuestionCount: n }),
    }),
    { name: 'Voca_all_data' },
  ),
);
