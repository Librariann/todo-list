import { create } from 'zustand';
import type { UserSummaryResponse } from '@/app/types/common';
import { fetchUserSummary } from '../lib/usersApi';

interface UserSummaryState extends UserSummaryResponse {
  isLoading: boolean;
  error: string | null;

  fetchSummary: () => Promise<void>;
  refreshSummary: () => Promise<void>;
  adjustPoints: (amount: number) => void;
  resetSummary: () => void;
}

const initialSummary: UserSummaryResponse = {
  points: 0,
  rewards: [],
  achievedChallenges: [],
};

function mapSummary(data: UserSummaryResponse): UserSummaryResponse {
  return {
    points: typeof data.points === 'number' ? data.points : 0,
    rewards: (data.rewards ?? []).slice(0, 5),
    achievedChallenges: (data.achievedChallenges ?? []).slice(0, 5).map((challenge) => ({
      ...challenge,
      isActive: challenge.active,
      achievedAt: challenge.achievedAt ?? challenge.periodKey,
    })),
  };
}

export const useUserSummaryStore = create<UserSummaryState>((set) => ({
  ...initialSummary,
  isLoading: false,
  error: null,

  fetchSummary: async () => {
    set({ isLoading: true, error: null });

    try {
      const data = await fetchUserSummary();
      set({
        ...mapSummary(data),
        isLoading: false,
      });
    } catch {
      set({
        isLoading: false,
        error: '사용자 요약 정보를 불러오지 못했습니다.',
      });
    }
  },

  refreshSummary: async () => {
    try {
      const data = await fetchUserSummary();
      set(mapSummary(data));
    } catch {
      // 기존 화면 데이터 유지
    }
  },

  adjustPoints: (amount) => {
    set((state) => ({
      points: state.points + amount,
    }));
  },

  resetSummary: () => {
    set({
      ...initialSummary,
      isLoading: false,
      error: null,
    });
  },
}));
