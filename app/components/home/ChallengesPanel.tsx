import { TaskErrorState } from '@/app/components/home/tasks/TaskSectionLayout';
import { useAuthStore } from '@/app/store/authStore';
import { useChallengesStore } from '@/app/store/challengesStore';
import { ChallengeType } from '@/app/types/todo';
import ChallengeComponent from '@/app/user/header/challenges/ChallengeComponent';
import { useEffect, useMemo } from 'react';

export default function ChallengesPanel() {
  const isAuthenticated = useAuthStore((auth) => auth.isAuthenticated);
  const challenges = useChallengesStore((state) => state.challenges);
  const isLoading = useChallengesStore((state) => state.isLoading);
  const error = useChallengesStore((state) => state.error);
  const fetchChallenges = useChallengesStore((state) => state.fetchChallenges);

  useEffect(() => {
    if (!isAuthenticated) return;
    void fetchChallenges();
  }, [fetchChallenges, isAuthenticated]);

  // 일일/주간/월간 도전과제 필터링 (API 데이터)
  const dailyChallenges = useMemo(
    () => challenges.filter((challenge) => challenge.type === ChallengeType.DAILY),
    [challenges]
  );

  const weeklyChallenges = useMemo(
    () => challenges.filter((challenge) => challenge.type === ChallengeType.WEEKLY),
    [challenges]
  );

  const monthlyChallenges = useMemo(
    () => challenges.filter((challenge) => challenge.type === ChallengeType.MONTHLY),
    [challenges]
  );

  if (error && challenges.length === 0) {
    return (
      <TaskErrorState
        title="도전과제를 불러오지 못했어요."
        description={error}
        onRetry={() => void fetchChallenges()}
      />
    );
  }

  return (
    <div className="space-y-4">
      {error ? (
        <TaskErrorState
          title="최신 도전과제를 불러오지 못했어요."
          description="화면에는 이전에 불러온 내용을 보여드리고 있어요."
          onRetry={() => void fetchChallenges()}
          compact
        />
      ) : null}
      <ChallengeComponent
        title="일일 도전과제"
        challengeOptions={dailyChallenges}
        comment="매일 자정에 초기화됩니다"
        loading={isLoading && challenges.length === 0}
      />
      <ChallengeComponent
        title="주간 도전과제"
        challengeOptions={weeklyChallenges}
        comment="매주 월요일에 초기화됩니다"
        loading={isLoading && challenges.length === 0}
      />
      <ChallengeComponent
        title="월간 도전과제"
        challengeOptions={monthlyChallenges}
        comment="매달 1일에 초기화됩니다"
        loading={isLoading && challenges.length === 0}
      />
    </div>
  );
}
