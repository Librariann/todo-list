import { create } from 'zustand';
import { fetchGoalsByDate } from '@/app/lib/goalsApi';
import type { Goal } from '@/app/types/todo';

type GoalsUpdater = Goal[] | ((goals: Goal[]) => Goal[]);

interface GoalsState {
  goalsByDate: Record<string, Goal[]>;
  loadingByDate: Record<string, boolean>;
  errorsByDate: Record<string, string | null>;
  fetchGoals: (date: string, force?: boolean) => Promise<void>;
  setGoals: (date: string, updater: GoalsUpdater) => void;
  resetGoals: () => void;
}

const activeRequests = new Map<string, Promise<void>>();
let requestGeneration = 0;

export const useGoalsStore = create<GoalsState>((set) => ({
  goalsByDate: {},
  loadingByDate: {},
  errorsByDate: {},

  fetchGoals: async (date, force = false) => {
    const existingRequest = activeRequests.get(date);
    if (existingRequest) {
      await existingRequest;
      if (!force) {
        return;
      }
    }

    const generation = requestGeneration;
    const request = (async () => {
      set((state) => ({
        loadingByDate: { ...state.loadingByDate, [date]: true },
        errorsByDate: { ...state.errorsByDate, [date]: null },
      }));

      try {
        const goals = await fetchGoalsByDate(date);
        if (generation === requestGeneration) {
          set((state) => ({
            goalsByDate: { ...state.goalsByDate, [date]: goals },
            loadingByDate: { ...state.loadingByDate, [date]: false },
          }));
        }
      } catch (error) {
        if (generation === requestGeneration) {
          set((state) => ({
            loadingByDate: { ...state.loadingByDate, [date]: false },
            errorsByDate: {
              ...state.errorsByDate,
              [date]: error instanceof Error ? error.message : '목표를 불러오지 못했습니다.',
            },
          }));
        }
      }
    })();

    activeRequests.set(date, request);
    try {
      await request;
    } finally {
      if (activeRequests.get(date) === request) {
        activeRequests.delete(date);
      }
    }
  },

  setGoals: (date, updater) => {
    set((state) => {
      const currentGoals = state.goalsByDate[date] ?? [];
      return {
        goalsByDate: {
          ...state.goalsByDate,
          [date]: typeof updater === 'function' ? updater(currentGoals) : updater,
        },
      };
    });
  },

  resetGoals: () => {
    requestGeneration += 1;
    activeRequests.clear();
    set({ goalsByDate: {}, loadingByDate: {}, errorsByDate: {} });
  },
}));
