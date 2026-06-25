import { fetchUserChallengeProgress } from '@/app/lib/challengesApi';
import { useAuthStore } from '@/app/store/authStore';
import { UseChallengesStore } from '@/app/store/challengesStore';
import { ChallengeType, type Challenge } from '@/app/types/todo';
import ChallengeComponent from '@/app/user/header/challenges/ChallengeComponent';
import { useEffect, useMemo, useState } from 'react';

export default function ChallengesPanel() {
  const [userChallenges, setUserChallenges] = useState<Challenge[]>([]);
  const isAuthenticated = useAuthStore((auth) => auth.isAuthenticated);
  const isLoading = UseChallengesStore((challenge) => challenge.isLoading);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const getUserChallengeList = async () => {
      const challengesRes = await fetchUserChallengeProgress();
      setUserChallenges(challengesRes);
    };
    getUserChallengeList();
  }, [isAuthenticated]);

  // 일일/주간/월간 도전과제 필터링 (API 데이터)
  const dailyChallenges = useMemo(
    () => userChallenges.filter((challenge) => challenge.type === ChallengeType.DAILY),
    [userChallenges]
  );

  const weeklyChallenges = useMemo(
    () => userChallenges.filter((challenge) => challenge.type === ChallengeType.WEEKLY),
    [userChallenges]
  );

  const monthlyChallenges = useMemo(
    () => userChallenges.filter((challenge) => challenge.type === ChallengeType.MONTHLY),
    [userChallenges]
  );

  return (
    <div>
      <ChallengeComponent
        title="일일 도전과제"
        challengeOptions={dailyChallenges}
        comment="매일 자정에 초기화됩니다"
        loading={isLoading}
      />
      <ChallengeComponent
        title="주간 도전과제"
        challengeOptions={weeklyChallenges}
        comment="매주 월요일에 초기화됩니다"
        loading={isLoading}
      />
      <ChallengeComponent
        title="월간 도전과제"
        challengeOptions={monthlyChallenges}
        comment="매달 1일에 초기화됩니다"
        loading={isLoading}
      />
    </div>
  );
}
