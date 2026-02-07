import ChallengeCard from './ChallengeCard';
import { Challenge } from '../types/todo';

export default function ChallengeComponent({
  title,
  challengeOptions,
  comment,
  userStats,
  loading = false,
}: {
  title: string;
  challengeOptions: Challenge[];
  comment: string;
  userStats: (rewardPoints: number) => void;
  loading?: boolean;
}) {
  const handleClaimChallenge = (id: string) => {
    const challenge = challengeOptions.find((c) => c.id === id);
    if (challenge && !challenge.completed && challenge.currentCount >= challenge.targetCount) {
      userStats(challenge.rewardPoints);
      alert(`🎉 도전과제 완료! +${challenge.rewardPoints} 포인트 획득!`);
    }
  };

  return (
    <div className="mb-8">
      <div className="mb-3">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{comment}</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-24 bg-stone-100 dark:bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : challengeOptions.length === 0 ? (
        <div className="flex items-center justify-center py-10 rounded-xl border border-stone-200 dark:border-white/[0.07] bg-stone-50 dark:bg-white/[0.02]">
          <p className="text-sm text-muted-foreground">등록된 도전과제가 없습니다</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {challengeOptions.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              onClaim={handleClaimChallenge}
            />
          ))}
        </div>
      )}
    </div>
  );
}
