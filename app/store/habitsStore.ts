import { create } from 'zustand';
import { fetchHabits } from '@/app/lib/habitsApi';
import type { Habit } from '@/app/types/todo';

type HabitsUpdater = Habit[] | ((habits: Habit[]) => Habit[]);

interface HabitsState {
  habits: Habit[];
  isLoading: boolean;
  error: string | null;
  fetchHabits: () => Promise<void>;
  setHabits: (updater: HabitsUpdater) => void;
  resetHabits: () => void;
}

let activeRequest: Promise<void> | null = null;
let requestGeneration = 0;

export const useHabitsStore = create<HabitsState>((set) => ({
  habits: [],
  isLoading: false,
  error: null,

  fetchHabits: async () => {
    if (activeRequest) {
      return activeRequest;
    }

    const generation = requestGeneration;
    const request = (async () => {
      set({ isLoading: true, error: null });

      try {
        const habits = await fetchHabits();
        if (generation === requestGeneration) {
          set({ habits, isLoading: false });
        }
      } catch (error) {
        if (generation === requestGeneration) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : '습관을 불러오지 못했습니다.',
          });
        }
      }
    })();
    activeRequest = request;

    try {
      await request;
    } finally {
      if (activeRequest === request) {
        activeRequest = null;
      }
    }
  },

  setHabits: (updater) => {
    set((state) => ({
      habits: typeof updater === 'function' ? updater(state.habits) : updater,
    }));
  },

  resetHabits: () => {
    requestGeneration += 1;
    activeRequest = null;
    set({ habits: [], isLoading: false, error: null });
  },
}));
