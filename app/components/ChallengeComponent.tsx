import ChallengeCard from "./ChallengeCard";
import { Challenge } from "../types/todo";

export default function ChallengeComponent({
  title,
  challengeOptions,
  comment,
  userStats,
}: {
  title: string;
  challengeOptions: Challenge[];
  comment: string;
  userStats: (rewardPoints: number) => void;
}) {
  // 도전과제 보상 받기 - this will be handled by parent component
  const handleClaimChallenge = (id: string) => {
    const challenge = challengeOptions.find((c) => c.id === id);
    if (
      challenge &&
      !challenge.completed &&
      challenge.currentCount >= challenge.targetCount
    ) {
      userStats(challenge.rewardPoints);
      alert(`🎉 도전과제 완료! +${challenge.rewardPoints} 포인트 획득!`);
    }
  };

  return (
    <div className="mb-8">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {title}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {comment}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {challengeOptions.map((challenge) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            onClaim={handleClaimChallenge}
          />
        ))}
      </div>
    </div>
  );
}
