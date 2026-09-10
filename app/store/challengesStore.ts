import { create } from 'zustand';
import type { Challenge } from '../types/todo';
import { fetchUserChallengeProgress } from '../lib/challengesApi';

interface ChallengeState {
  isLoading: boolean;
  error: string | null;
  challenges: Challenge[];
  fetchChallenges: () => Promise<void>;
  resetChallenges: () => void;
}

let activeRequest: Promise<void> | null = null;
let requestGeneration = 0;

export const useChallengesStore = create<ChallengeState>((set) => ({
  isLoading: false,
  error: null,
  challenges: [],

  fetchChallenges: async () => {
    if (activeRequest) {
      return activeRequest;
    }

    const generation = requestGeneration;
    const request = (async () => {
      set({ isLoading: true, error: null });

      try {
        const challenges = await fetchUserChallengeProgress();
        if (generation === requestGeneration) {
          set({ challenges, isLoading: false });
        }
      } catch (error) {
        if (generation === requestGeneration) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : '도전과제를 불러오지 못했습니다.',
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

  resetChallenges: () => {
    requestGeneration += 1;
    activeRequest = null;
    set({ challenges: [], isLoading: false, error: null });
  },
}));
