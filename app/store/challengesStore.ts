import { create } from 'zustand';
import { Challenge } from '../types/todo';
import { fetchChallenges, mapChallenge } from '../lib/challengesApi';

interface ChallengeState {
  isLoading: boolean;
  error: string | null;
  challenges: Challenge[];
  fetchChallenges: () => void;
  //   refreshChallenges: () => void;
}

export const UseChallengesStore = create<ChallengeState>((set) => ({
  isLoading: false,
  error: null,
  challenges: [],
  fetchChallenges: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchChallenges();
      set({
        challenges: data,
        isLoading: false,
      });
    } catch {
      set({
        isLoading: false,
        error: '도전과제 정보를 불러오지 못했습니다.',
      });
    }
  },
}));
