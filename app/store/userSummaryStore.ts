import { create } from 'zustand';
import { toast } from 'sonner';
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

let latestSummaryRequestId = 0;

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

export const useUserSummaryStore = create<UserSummaryState>((set, get) => ({
  ...initialSummary,
  isLoading: false,
  error: null,

  fetchSummary: async () => {
    const requestId = ++latestSummaryRequestId;
    set({ isLoading: true, error: null });

    try {
      const data = await fetchUserSummary();
      if (requestId !== latestSummaryRequestId) return;
      set({
        ...mapSummary(data),
        isLoading: false,
      });
    } catch {
      if (requestId !== latestSummaryRequestId) return;
      set({
        isLoading: false,
        error: '사용자 요약 정보를 불러오지 못했습니다.',
      });
    }
  },

  refreshSummary: async () => {
    const requestId = ++latestSummaryRequestId;
    try {
      const data = await fetchUserSummary();
      if (requestId !== latestSummaryRequestId) return;
      set({
        ...mapSummary(data),
        isLoading: false,
        error: null,
      });
    } catch {
      if (requestId !== latestSummaryRequestId) return;
      const message = '포인트 정보를 새로 확인하지 못했어요.';
      set({ isLoading: false, error: message });
      toast.warning(message, {
        description: '현재 표시된 포인트는 잠시 실제 잔액과 다를 수 있어요.',
        action: {
          label: '다시 시도',
          onClick: () => void get().refreshSummary(),
        },
      });
    }
  },

  adjustPoints: (amount) => {
    set((state) => ({
      points: state.points + amount,
    }));
  },

  resetSummary: () => {
    latestSummaryRequestId += 1;
    set({
      ...initialSummary,
      isLoading: false,
      error: null,
    });
  },
}));
